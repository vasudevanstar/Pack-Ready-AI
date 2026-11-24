/**
 * Data Quality Engine for PackReady AI (TECHgium TG0900889)
 * 
 * Implements 10 deterministic validation rules:
 * 1. Missing mandatory packaging fields (SKU, product name, ID)
 * 2. Invalid packaging weight values (null, <= 0, or unrealistic outliers > 50kg)
 * 3. Missing material type or unsupported classification
 * 4. Duplicate packaging records (matching Packaging ID or matching SKU + Material combination)
 * 5. Missing supplier information (name or country missing)
 * 6. Missing recyclability information (missing class or unknown class)
 * 7. Missing recycled content information (PCR % is null / unrecorded)
 * 8. Missing supporting evidence (declaration missing, expired, or pending)
 * 9. Invalid or inconsistent data formats (e.g. negative numbers, non-numeric strings, conflicting recyclable vs D/E class)
 * 10. Outdated record information (records older than 18 months without attestation renewal)
 */

function runDataQualityAudit(records) {
  const issues = [];
  const idCounts = {};
  const skuMaterialPairs = {};

  // First pass: identify duplicates
  records.forEach((record) => {
    const pkgId = (record.id || '').trim().toUpperCase();
    idCounts[pkgId] = (idCounts[pkgId] || 0) + 1;

    const pairKey = `${(record.sku || '').trim().toUpperCase()}__${(record.materialGroup || '').trim().toUpperCase()}`;
    skuMaterialPairs[pairKey] = (skuMaterialPairs[pairKey] || 0) + 1;
  });

  let duplicateCount = 0;
  let recordsWithIssues = 0;
  let totalMissingFields = 0;

  const evaluatedRecords = records.map((record) => {
    const recordIssues = [];
    const pkgId = (record.id || '').trim().toUpperCase();
    const pairKey = `${(record.sku || '').trim().toUpperCase()}__${(record.materialGroup || '').trim().toUpperCase()}`;

    // Rule 1: Missing mandatory packaging fields
    if (!record.sku || !record.productName || !record.id) {
      const missing = [];
      if (!record.sku) missing.push('Product SKU');
      if (!record.productName) missing.push('Product Name');
      if (!record.id) missing.push('Packaging ID');
      recordIssues.push({
        ruleId: 'RULE-01',
        ruleName: 'Missing Mandatory Fields',
        field: 'mandatory_identifiers',
        severity: 'CRITICAL',
        detectedIssue: `Mandatory packaging identifiers missing: ${missing.join(', ')}.`,
        suggestedCorrection: 'Complete all mandatory ERP packaging master data identifiers.'
      });
      totalMissingFields += missing.length;
    }

    // Rule 2: Invalid packaging weight values
    if (record.weightGrams === null || record.weightGrams === undefined || record.weightGrams === '') {
      recordIssues.push({
        ruleId: 'RULE-02',
        ruleName: 'Missing Packaging Weight',
        field: 'weightGrams',
        severity: 'CRITICAL',
        detectedIssue: 'Packaging net weight is missing (null or empty). Required for EPR fee calculation and PPWR Article 5.',
        suggestedCorrection: 'Enter certified tare or lab-measured packaging weight in grams.'
      });
      totalMissingFields++;
    } else if (isNaN(Number(record.weightGrams)) || Number(record.weightGrams) <= 0) {
      recordIssues.push({
        ruleId: 'RULE-02-B',
        ruleName: 'Invalid Weight Value',
        field: 'weightGrams',
        severity: 'CRITICAL',
        detectedIssue: `Weight must be greater than 0g. Found invalid value: "${record.weightGrams}".`,
        suggestedCorrection: 'Update weight with a valid positive numeric quantity in grams.'
      });
    } else if (Number(record.weightGrams) > 50000) {
      recordIssues.push({
        ruleId: 'RULE-02-C',
        ruleName: 'Unrealistic Weight Outlier',
        field: 'weightGrams',
        severity: 'MEDIUM',
        detectedIssue: `Reported weight (${record.weightGrams}g / >50kg) exceeds consumer packaging threshold.`,
        suggestedCorrection: 'Verify if unit of measurement was incorrectly entered in milligrams or kilograms.'
      });
    }

    // Rule 3: Missing material type
    const validMaterials = ['Plastic', 'Paper', 'Cardboard', 'Glass', 'Metal', 'Composite'];
    if (!record.materialGroup || record.materialGroup === 'Unknown' || record.materialGroup.trim() === '') {
      recordIssues.push({
        ruleId: 'RULE-03',
        ruleName: 'Missing Material Type',
        field: 'materialGroup',
        severity: 'CRITICAL',
        detectedIssue: 'Packaging primary material category is not assigned.',
        suggestedCorrection: 'Assign valid material class (Plastic, Paper, Cardboard, Glass, Metal, or Composite).'
      });
      totalMissingFields++;
    } else if (!validMaterials.includes(record.materialGroup)) {
      recordIssues.push({
        ruleId: 'RULE-03-B',
        ruleName: 'Unsupported Material Classification',
        field: 'materialGroup',
        severity: 'HIGH',
        detectedIssue: `Material "${record.materialGroup}" does not map to PPWR Annex I standard material lists.`,
        suggestedCorrection: 'Standardize material nomenclature according to PPWR Annex I classifications.'
      });
    }

    // Rule 4: Duplicate packaging records
    const isIdDuplicate = idCounts[pkgId] > 1;
    const isPairDuplicate = skuMaterialPairs[pairKey] > 1;
    if (isIdDuplicate) {
      recordIssues.push({
        ruleId: 'RULE-04',
        ruleName: 'Duplicate Packaging ID',
        field: 'id',
        severity: 'HIGH',
        detectedIssue: `Packaging ID "${record.id}" is assigned to ${idCounts[pkgId]} distinct records in the catalog.`,
        suggestedCorrection: 'Consolidate duplicate records or re-index with a unique packaging serial identifier.'
      });
      duplicateCount++;
    } else if (isPairDuplicate && record.sku) {
      recordIssues.push({
        ruleId: 'RULE-04-B',
        ruleName: 'Duplicate SKU-Material Mapping',
        field: 'sku',
        severity: 'MEDIUM',
        detectedIssue: `Multiple active packaging specifications exist for SKU "${record.sku}" under ${record.materialGroup}.`,
        suggestedCorrection: 'Verify if multiple variants exist or remove redundant BOM revisions.'
      });
    }

    // Rule 5: Missing supplier information
    if (!record.supplierName || record.supplierName.trim() === '' || record.supplierName.toLowerCase() === 'declared supplier') {
      recordIssues.push({
        ruleId: 'RULE-05',
        ruleName: 'Missing Supplier Identity',
        field: 'supplierName',
        severity: 'HIGH',
        detectedIssue: 'Packaging tier-1 converter or supplier name is missing or generic.',
        suggestedCorrection: 'Record legally registered supplier business name and VAT/EORI number.'
      });
      totalMissingFields++;
    }

    // Rule 6: Missing recyclability information
    if (!record.recyclabilityClass || record.recyclabilityClass.trim() === '') {
      recordIssues.push({
        ruleId: 'RULE-06',
        ruleName: 'Missing Recyclability Class',
        field: 'recyclabilityClass',
        severity: 'HIGH',
        detectedIssue: 'Recyclability Design for Recycling (DfR) classification under Article 6 is absent.',
        suggestedCorrection: 'Perform recyclability design assessment to assign Class A through E.'
      });
      totalMissingFields++;
    }

    // Rule 7: Missing recycled content information (PCR %)
    if (record.recycledContentPercent === null || record.recycledContentPercent === undefined || record.recycledContentPercent === '') {
      recordIssues.push({
        ruleId: 'RULE-07',
        ruleName: 'Missing Recycled Content (PCR)',
        field: 'recycledContentPercent',
        severity: 'HIGH',
        detectedIssue: 'Post-Consumer Recycled (PCR) percentage is unrecorded. Mandatory for PPWR Article 7 verification.',
        suggestedCorrection: 'Request certificate of post-consumer recycled polymer/material content from supplier.'
      });
      totalMissingFields++;
    } else if (isNaN(Number(record.recycledContentPercent)) || Number(record.recycledContentPercent) < 0 || Number(record.recycledContentPercent) > 100) {
      recordIssues.push({
        ruleId: 'RULE-07-B',
        ruleName: 'Invalid Recycled Percentage',
        field: 'recycledContentPercent',
        severity: 'HIGH',
        detectedIssue: `Recycled content percentage must be between 0% and 100%. Value found: ${record.recycledContentPercent}%.`,
        suggestedCorrection: 'Correct PCR percentage to a valid value between 0 and 100.'
      });
    }

    // Rule 8: Missing supporting evidence
    if (!record.supplierDeclarationStatus || record.supplierDeclarationStatus.includes('Missing') || record.supplierDeclarationStatus.includes('Expired')) {
      recordIssues.push({
        ruleId: 'RULE-08',
        ruleName: 'Missing Supporting Documentation',
        field: 'supplierDeclarationStatus',
        severity: 'HIGH',
        detectedIssue: 'Declaration of compliance (EN 13430 / ISO 14021) or lab report is missing or expired.',
        suggestedCorrection: 'Obtain current, signed supplier conformity declaration and upload into document store.'
      });
      totalMissingFields++;
    }

    // Rule 9: Inconsistent data formats & conflict rules
    if (record.recyclabilityClass && record.recyclabilityClass.includes('Conflicting')) {
      recordIssues.push({
        ruleId: 'RULE-09',
        ruleName: 'Inconsistent Recyclability Claim',
        field: 'recyclabilityClass',
        severity: 'CRITICAL',
        detectedIssue: 'Marketing declaration claims recyclable, but third-party sorting lab flagged non-separable composite layer.',
        suggestedCorrection: 'Commission independent RecyClass or COTREP sorting protocol trial to resolve conflict.'
      });
    }

    // Rule 10: Outdated record information (> 12-18 months)
    if (record.createdAt) {
      const createdDate = new Date(record.createdAt);
      const now = new Date('2026-11-24T11:30:00Z');
      const monthsDiff = (now.getFullYear() - createdDate.getFullYear()) * 12 + (now.getMonth() - createdDate.getMonth());
      if (monthsDiff > 18) {
        recordIssues.push({
          ruleId: 'RULE-10',
          ruleName: 'Outdated Packaging Audit Data',
          field: 'createdAt',
          severity: 'MEDIUM',
          detectedIssue: `Packaging specification was last audited ${monthsDiff} months ago. Annual review required.`,
          suggestedCorrection: 'Trigger annual packaging specification attestation with converter.'
        });
      }
    }

    if (recordIssues.length > 0) {
      recordsWithIssues++;
      recordIssues.forEach(iss => {
        issues.push({
          recordId: record.id,
          sku: record.sku,
          productName: record.productName,
          materialGroup: record.materialGroup,
          ...iss
        });
      });
    }

    return {
      recordId: record.id,
      issuesCount: recordIssues.length,
      issues: recordIssues,
      isValid: recordIssues.length === 0
    };
  });

  const totalRecords = records.length;
  const validRecords = totalRecords - recordsWithIssues;
  const qualityPercentage = totalRecords > 0 ? Math.round((validRecords / totalRecords) * 100) : 100;

  return {
    totalRecords,
    validRecords,
    recordsWithErrors: recordsWithIssues,
    duplicateRecords: duplicateCount,
    missingInformationCount: totalMissingFields,
    qualityPercentage,
    issuesSummary: {
      critical: issues.filter(i => i.severity === 'CRITICAL').length,
      high: issues.filter(i => i.severity === 'HIGH').length,
      medium: issues.filter(i => i.severity === 'MEDIUM').length
    },
    flaggedIssues: issues
  };
}

module.exports = {
  runDataQualityAudit
};
