/**
 * Digital Readiness Assessment Engine for PackReady AI (TECHgium TG0900889)
 * 
 * Accurately scores the 5 core PPWR digital dimensions:
 * 1. Data Completeness (weight: 25%)
 * 2. Data Accuracy (weight: 20%)
 * 3. Traceability (weight: 20%)
 * 4. Standardization (weight: 20%)
 * 5. Information Availability (weight: 15%)
 * 
 * Benchmark Prototype Classifications:
 * - Ready: score 80–100
 * - Partially Ready: score 50–79
 * - Action Required: score below 50
 */

const DEFAULT_WEIGHTS = {
  completeness: 0.25,
  accuracy: 0.20,
  traceability: 0.20,
  standardization: 0.20,
  availability: 0.15
};

function assessRecordDimensions(record, weights = DEFAULT_WEIGHTS) {
  let completeness = 100;
  let accuracy = 100;
  let traceability = 100;
  let standardization = 100;
  let availability = 100;

  const deductions = [];

  // 1. Data Completeness Evaluation
  if (record.weightGrams === null || record.weightGrams === undefined || record.weightGrams === '') {
    completeness -= 55;
    deductions.push('Completeness -55%: Net packaging weight missing. Mandatory for PPWR declaration.');
  }
  if (record.recycledContentPercent === null || record.recycledContentPercent === undefined || record.recycledContentPercent === '') {
    completeness -= 45;
    deductions.push('Completeness -45%: PCR recycled content percentage unrecorded.');
  }
  if (!record.dimensions || !record.dimensions.lengthMm) {
    completeness -= 30;
    deductions.push('Completeness -30%: Packaging physical dimensions missing (Article 9 volume minimization).');
  }

  // 2. Data Accuracy Evaluation
  if (record.weightGrams !== null && record.weightGrams !== undefined && (isNaN(Number(record.weightGrams)) || Number(record.weightGrams) <= 0)) {
    accuracy -= 70;
    deductions.push('Accuracy -70%: Net weight must be a positive numeric value in grams.');
  }
  if (record.recycledContentPercent !== null && record.recycledContentPercent !== undefined && (Number(record.recycledContentPercent) < 0 || Number(record.recycledContentPercent) > 100)) {
    accuracy -= 60;
    deductions.push('Accuracy -60%: PCR percentage outside 0-100% boundary.');
  }
  if (record.recyclabilityClass && record.recyclabilityClass.includes('Conflicting')) {
    accuracy -= 70;
    deductions.push('Accuracy -70%: Marketing recyclability claim contradicted by sorting trial.');
  }

  // 3. Traceability Evaluation
  const isMissingSupplier = !record.supplierName || record.supplierName.trim() === '' || record.supplierName.toLowerCase() === 'declared supplier';
  if (isMissingSupplier) {
    traceability -= 70;
    deductions.push('Traceability -70%: Tier-1 converter name is unverified or placeholder.');
  }
  if (!record.supplierCountry || record.supplierCountry.toLowerCase() === 'imported') {
    traceability -= 40;
    deductions.push('Traceability -40%: Converter manufacturing origin country not registered.');
  }

  // 4. Standardization Evaluation
  const validMaterials = ['Plastic', 'Paper', 'Cardboard', 'Glass', 'Metal', 'Composite'];
  if (!record.materialGroup || !validMaterials.includes(record.materialGroup)) {
    standardization -= 70;
    deductions.push('Standardization -70%: Substrate not harmonized with PPWR Annex I taxonomy.');
  }
  if (!record.recyclabilityClass || record.recyclabilityClass.trim() === '') {
    standardization -= 60;
    deductions.push('Standardization -60%: Recyclability classification (Class A-E) missing.');
  } else if (record.recyclabilityClass.includes('Class E')) {
    standardization -= 80;
    deductions.push('Standardization -80%: Class E non-recyclable substrate (Restricted under PPWR Art. 6).');
  } else if (record.recyclabilityClass.includes('Class D')) {
    standardization -= 60;
    deductions.push('Standardization -60%: Class D (<50% recyclability - DfR redesign required).');
  }

  // 5. Information Availability Evaluation
  const hasDocMissing = !record.supplierDeclarationStatus || record.supplierDeclarationStatus.includes('Missing') || record.supplierDeclarationStatus.includes('Expired');
  if (hasDocMissing) {
    availability -= 70;
    deductions.push('Availability -70%: Signed compliance certificate (EN 13430 / ISO 14021) missing or expired.');
  }
  const hasSvhcPending = !record.substancesOfConcernDeclared || record.substancesOfConcernDeclared.includes('Pending');
  if (hasSvhcPending) {
    availability -= 50;
    deductions.push('Availability -50%: Substances of Very High Concern (SVHC / PFAS) screening pending.');
  }

  completeness = Math.max(0, completeness);
  accuracy = Math.max(0, accuracy);
  traceability = Math.max(0, traceability);
  standardization = Math.max(0, standardization);
  availability = Math.max(0, availability);

  // Compute weighted score
  const overallScore = Math.round(
    completeness * weights.completeness +
    accuracy * weights.accuracy +
    traceability * weights.traceability +
    standardization * weights.standardization +
    availability * weights.availability
  );

  // Prototype benchmark categorization:
  // Ready: 80–100
  // Partially Ready: 50–79
  // Action Required: < 50
  let classification = 'Action Required';
  let badgeColor = 'red';
  if (overallScore >= 80) {
    classification = 'Ready';
    badgeColor = 'green';
  } else if (overallScore >= 50) {
    classification = 'Partially Ready';
    badgeColor = 'amber';
  }

  return {
    recordId: record.id,
    sku: record.sku,
    productName: record.productName,
    materialGroup: record.materialGroup,
    overallScore,
    classification,
    badgeColor,
    dimensions: {
      completeness,
      accuracy,
      traceability,
      standardization,
      availability
    },
    deductions: deductions.slice(0, 3),
    explanation: `Weighted score (${overallScore}%) computed from Completeness (${completeness}%), Accuracy (${accuracy}%), Traceability (${traceability}%), Standardization (${standardization}%), and Availability (${availability}%).`
  };
}

function runFullReadinessAssessment(records, customWeights = DEFAULT_WEIGHTS) {
  let sumOverall = 0;
  let sumCompleteness = 0;
  let sumAccuracy = 0;
  let sumTraceability = 0;
  let sumStandardization = 0;
  let sumAvailability = 0;

  let readyCount = 0;
  let partiallyReadyCount = 0;
  let actionRequiredCount = 0;

  const assessedRecords = records.map(r => {
    const assessment = assessRecordDimensions(r, customWeights);
    sumOverall += assessment.overallScore;
    sumCompleteness += assessment.dimensions.completeness;
    sumAccuracy += assessment.dimensions.accuracy;
    sumTraceability += assessment.dimensions.traceability;
    sumStandardization += assessment.dimensions.standardization;
    sumAvailability += assessment.dimensions.availability;

    if (assessment.classification === 'Ready') readyCount++;
    else if (assessment.classification === 'Partially Ready') partiallyReadyCount++;
    else actionRequiredCount++;

    return assessment;
  });

  const count = records.length || 1;
  const avgOverall = Math.round(sumOverall / count);
  const avgCompleteness = Math.round(sumCompleteness / count);
  const avgAccuracy = Math.round(sumAccuracy / count);
  const avgTraceability = Math.round(sumTraceability / count);
  const avgStandardization = Math.round(sumStandardization / count);
  const avgAvailability = Math.round(sumAvailability / count);

  return {
    totalRecords: records.length,
    overallScore: avgOverall,
    classificationSummary: {
      ready: readyCount,
      partiallyReady: partiallyReadyCount,
      actionRequired: actionRequiredCount
    },
    distribution: [
      { name: 'Ready (80-100)', count: readyCount, fill: '#047857' },
      { name: 'Partially Ready (50-79)', count: partiallyReadyCount, fill: '#f59e0b' },
      { name: 'Action Required (<50)', count: actionRequiredCount, fill: '#ef4444' }
    ],
    dimensionAverages: {
      completeness: avgCompleteness,
      accuracy: avgAccuracy,
      traceability: avgTraceability,
      standardization: avgStandardization,
      availability: avgAvailability
    },
    weightsApplied: customWeights,
    records: assessedRecords,
    summaryText: `Portfolio assessment shows ${readyCount} records Ready for digital passport creation, ${partiallyReadyCount} Partially Ready with documentation gaps, and ${actionRequiredCount} requiring corrective intervention.`
  };
}

module.exports = {
  assessRecordDimensions,
  runFullReadinessAssessment,
  DEFAULT_WEIGHTS
};
