/**
 * Rules-Based Gap Analysis Engine for PackReady AI
 * 
 * Compares packaging records against configurable prototype PPWR reporting requirements:
 * 1. Missing packaging weight → Weight Information Gap (CRITICAL)
 * 2. Missing material details → Material Specification Gap (CRITICAL)
 * 3. Missing recyclability information → Recyclability Information Gap (CRITICAL / HIGH)
 * 4. Missing recycled content (PCR %) → Recycled Content Information Gap (HIGH)
 * 5. Missing supplier evidence → Supporting Evidence Gap (HIGH)
 * 6. Conflicting packaging records → Data Reconciliation Gap (CRITICAL)
 * 7. Plastic packaging below 2030 PCR targets (<30%) → Target Threshold Gap (MODERATE)
 * 8. Missing physical dimensions for headspace ratio → Dimension & Volume Gap (LOW)
 * 9. Pending SVHC / hazardous substance screening → Substance Screening Gap (MODERATE)
 * 
 * Transparent, deterministic rules labeled as prototype reporting requirements.
 */

function runGapAnalysis(records) {
  const gaps = [];
  const materialGapCounts = {};
  const supplierGapCounts = {};

  records.forEach((record, index) => {
    const pkgId = record.id;
    const productName = record.productName || 'Unnamed Packaging Item';
    const supplier = record.supplierName || 'Unknown Converter';
    const material = record.materialGroup || 'Unspecified';

    // Track distributions
    const registerGap = (gapObj) => {
      gaps.push(gapObj);
      materialGapCounts[material] = (materialGapCounts[material] || 0) + 1;
      supplierGapCounts[supplier] = (supplierGapCounts[supplier] || 0) + 1;
    };

    // Rule 1: Missing packaging weight
    if (record.weightGrams === null || record.weightGrams === undefined || record.weightGrams === '') {
      registerGap({
        id: `GAP-WGT-${String(gaps.length + 1).padStart(3, '0')}`,
        recordId: pkgId,
        productName,
        supplier,
        material,
        gapType: 'Weight Information Gap',
        ruleReference: 'PPWR Article 5 & EPR Declaration',
        priority: 'CRITICAL',
        description: 'Packaging net tare weight is missing. Mandatory for Extended Producer Responsibility fee calculation.',
        recommendedAction: 'Obtain certified digital scale tare weight measurement from manufacturing converter.',
        status: 'Open'
      });
    }

    // Rule 2: Missing material details
    const validMaterials = ['Plastic', 'Paper', 'Cardboard', 'Glass', 'Metal', 'Composite'];
    if (!record.materialGroup || !validMaterials.includes(record.materialGroup)) {
      registerGap({
        id: `GAP-MAT-${String(gaps.length + 1).padStart(3, '0')}`,
        recordId: pkgId,
        productName,
        supplier,
        material,
        gapType: 'Material Specification Gap',
        ruleReference: 'PPWR Annex I Material Harmonization',
        priority: 'CRITICAL',
        description: 'Primary packaging material category is unclassified or outside standard European taxonomy.',
        recommendedAction: 'Map substrate to PPWR Annex I standard polymer/fiber codes (e.g., PET, HDPE, Corrugated).',
        status: 'Open'
      });
    }

    // Rule 3: Missing recyclability information
    if (!record.recyclabilityClass || record.recyclabilityClass.trim() === '') {
      registerGap({
        id: `GAP-RCY-${String(gaps.length + 1).padStart(3, '0')}`,
        recordId: pkgId,
        productName,
        supplier,
        material,
        gapType: 'Recyclability Information Gap',
        ruleReference: 'PPWR Article 6 Design for Recycling (DfR)',
        priority: 'CRITICAL',
        description: 'Design for Recycling (DfR) rating (Class A–E) has not been evaluated or recorded.',
        recommendedAction: 'Perform technical recyclability assessment against CEN / RecyClass European sorting criteria.',
        status: 'Open'
      });
    } else if (record.recyclabilityClass.includes('Class D') || record.recyclabilityClass.includes('Class E')) {
      registerGap({
        id: `GAP-RCY-POOR-${String(gaps.length + 1).padStart(3, '0')}`,
        recordId: pkgId,
        productName,
        supplier,
        material,
        gapType: 'Recyclability Performance Gap',
        ruleReference: 'PPWR Article 6(2) Market Restriction',
        priority: 'CRITICAL',
        description: `Packaging classified under ${record.recyclabilityClass}. Restricted from market placement by 2030.`,
        recommendedAction: 'Initiate packaging redesign: transition to monomaterial structure to achieve >=70% recyclability.',
        status: 'Pending Review'
      });
    }

    // Rule 4: Missing recycled content
    if (record.recycledContentPercent === null || record.recycledContentPercent === undefined || record.recycledContentPercent === '') {
      registerGap({
        id: `GAP-PCR-${String(gaps.length + 1).padStart(3, '0')}`,
        recordId: pkgId,
        productName,
        supplier,
        material,
        gapType: 'Recycled Content Information Gap',
        ruleReference: 'PPWR Article 7 PCR Verification',
        priority: 'HIGH',
        description: 'Post-Consumer Recycled (PCR) content percentage is not recorded in packaging specifications.',
        recommendedAction: 'Request verified EN 15343 chain of custody certificate for recycled polymer percentage.',
        status: 'Open'
      });
    } else if (record.materialGroup === 'Plastic' && Number(record.recycledContentPercent) < 30) {
      registerGap({
        id: `GAP-PCR-TGT-${String(gaps.length + 1).padStart(3, '0')}`,
        recordId: pkgId,
        productName,
        supplier,
        material,
        gapType: 'Target Threshold Gap',
        ruleReference: 'PPWR Article 7(1) 2030 Minimum PCR Target',
        priority: 'MODERATE',
        description: `Plastic contains ${record.recycledContentPercent}% PCR, which is below the projected 2030 target (30-35%).`,
        recommendedAction: 'Qualify food-contact approved mechanical or chemical PCR resin blend with supplier.',
        status: 'In Progress'
      });
    }

    // Rule 5: Missing supplier evidence
    if (!record.supplierDeclarationStatus || record.supplierDeclarationStatus.includes('Missing') || record.supplierDeclarationStatus.includes('Expired')) {
      registerGap({
        id: `GAP-DOC-${String(gaps.length + 1).padStart(3, '0')}`,
        recordId: pkgId,
        productName,
        supplier,
        material,
        gapType: 'Supporting Evidence Gap',
        ruleReference: 'PPWR Article 11 & EN 13430 Compliance',
        priority: 'HIGH',
        description: 'Supplier Declaration of Conformity (DoC) or third-party audit test report is missing or expired.',
        recommendedAction: 'Obtain current, signed compliance attestation certificate from packaging converter.',
        status: 'Open'
      });
    }

    // Rule 6: Conflicting packaging records
    if (record.recyclabilityClass && record.recyclabilityClass.includes('Conflicting')) {
      registerGap({
        id: `GAP-REC-${String(gaps.length + 1).padStart(3, '0')}`,
        recordId: pkgId,
        productName,
        supplier,
        material,
        gapType: 'Data Reconciliation Gap',
        ruleReference: 'Audit & Market Surveillance Integrity',
        priority: 'CRITICAL',
        description: 'Marketing claims recyclability, but independent test protocol identified non-separable multi-material barrier.',
        recommendedAction: 'Commission third-party COTREP or RecyClass sorting laboratory reconciliation audit.',
        status: 'Under Investigation'
      });
    }

    // Rule 7: Missing physical dimensions for headspace ratio
    if (!record.dimensions || !record.dimensions.lengthMm) {
      registerGap({
        id: `GAP-DIM-${String(gaps.length + 1).padStart(3, '0')}`,
        recordId: pkgId,
        productName,
        supplier,
        material,
        gapType: 'Dimension & Volume Gap',
        ruleReference: 'PPWR Article 9 Packaging Minimization',
        priority: 'LOW',
        description: 'Physical packaging dimensions (L x W x H) missing; required for maximum 50% empty space ratio audit.',
        recommendedAction: 'Record outer container dimensional parameters to enable volume calculation.',
        status: 'Open'
      });
    }

    // Rule 8: Pending SVHC / hazardous substance screening
    if (!record.substancesOfConcernDeclared || record.substancesOfConcernDeclared.includes('Pending')) {
      registerGap({
        id: `GAP-SVHC-${String(gaps.length + 1).padStart(3, '0')}`,
        recordId: pkgId,
        productName,
        supplier,
        material,
        gapType: 'Substance Screening Gap',
        ruleReference: 'PPWR Article 5 & REACH Annex XVII',
        priority: 'MODERATE',
        description: 'Declaration regarding substances of concern (PFAS, lead, mercury, SVHC < 0.01%) is unverified.',
        recommendedAction: 'Obtain analytical test certificate confirming absence of intentionally added PFAS.',
        status: 'Pending Review'
      });
    }
  });

  const criticalGaps = gaps.filter(g => g.priority === 'CRITICAL').length;
  const moderateGaps = gaps.filter(g => g.priority === 'MODERATE' || g.priority === 'HIGH').length;
  const lowGaps = gaps.filter(g => g.priority === 'LOW').length;

  const materialDistribution = Object.keys(materialGapCounts).map(mat => ({
    name: mat,
    count: materialGapCounts[mat]
  })).sort((a, b) => b.count - a.count);

  const supplierDistribution = Object.keys(supplierGapCounts).map(sup => ({
    name: sup.length > 18 ? sup.substring(0, 16) + '...' : sup,
    fullName: sup,
    count: supplierGapCounts[sup]
  })).sort((a, b) => b.count - a.count).slice(0, 6);

  return {
    totalRecordsEvaluated: records.length,
    totalGaps: gaps.length,
    criticalGaps,
    moderateGaps,
    lowGaps,
    materialDistribution,
    supplierDistribution,
    gaps
  };
}

module.exports = {
  runGapAnalysis
};
