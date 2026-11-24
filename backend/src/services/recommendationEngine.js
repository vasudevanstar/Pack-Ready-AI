/**
 * Recommendation Engine for PackReady AI (TECHgium TG0900889)
 * 
 * Maps regulatory gaps into actionable, deterministic corrective workflows:
 * 1. Missing packaging weight → "Request certified packaging tare weight measurement from the supplier."
 * 2. Missing material details → "Collect standardized packaging material specification (PPWR Annex I)."
 * 3. Conflicting records → "Initiate data reconciliation with sorting test lab and verify latest audited record."
 * 4. Missing supporting evidence → "Request signed Declaration of Conformity (EN 13430 / ISO 14021) from the supplier."
 * 5. Missing recyclability information → "Collect certified Design for Recycling (DfR) sorting report and supporting evidence."
 * 6. Class D/E poor recyclability → "Initiate packaging redesign: transition multi-layer laminates to monomaterial recyclable barrier."
 * 7. Low PCR content in plastic (<30%) → "Request supplier technical evaluation for higher-grade mechanical/chemical PCR resin blend."
 * 8. Missing dimensions → "Obtain exact container outer dimensions (headspace ratio evaluation under Article 9)."
 * 9. Pending SVHC screening → "Request laboratory test attestation confirming <0.01% w/w PFAS and heavy metals absence."
 * 
 * Supports interactive status changes: Pending, In Progress, Completed.
 * Deterministic rule-based engine. Non-generative prototype.
 */

// In-memory status store to persist recommendation progress
const recommendationStatusStore = {};

function generateRecommendations(records) {
  const recommendations = [];

  records.forEach((record) => {
    const pkgId = record.id;
    const productName = record.productName || 'Unnamed Packaging Item';
    const supplier = record.supplierName || 'Unknown Converter';
    const material = record.materialGroup || 'Unspecified';

    const createRec = (subId, gapName, action, priority, estimatedEffort) => {
      const recId = `REC-${pkgId.replace('PKG-2026-', '')}-${subId}`;
      const savedStatus = recommendationStatusStore[recId] || 'Pending';

      recommendations.push({
        id: recId,
        recordId: pkgId,
        productName,
        supplier,
        material,
        identifiedGap: gapName,
        suggestedAction: action,
        priority, // CRITICAL, HIGH, MODERATE, LOW
        estimatedEffort,
        status: savedStatus, // Pending, In Progress, Completed
        updatedAt: new Date().toISOString()
      });
    };

    // 1. Missing packaging weight
    if (record.weightGrams === null || record.weightGrams === undefined || record.weightGrams === '') {
      createRec(
        'WGT',
        'Missing Packaging Weight',
        'Request verified packaging net weight information from the supplier.',
        'CRITICAL',
        '1-2 Days'
      );
    }

    // 2. Missing material details
    const validMaterials = ['Plastic', 'Paper', 'Cardboard', 'Glass', 'Metal', 'Composite'];
    if (!record.materialGroup || !validMaterials.includes(record.materialGroup)) {
      createRec(
        'MAT',
        'Missing Material Details',
        'Collect standardized packaging material specification according to PPWR Annex I taxonomy.',
        'CRITICAL',
        '2-3 Days'
      );
    }

    // 3. Conflicting records / Lab discrepancies
    if (record.recyclabilityClass && record.recyclabilityClass.includes('Conflicting')) {
      createRec(
        'REC',
        'Conflicting Lab & Marketing Records',
        'Initiate data reconciliation and verify the latest audited sorting lab test record.',
        'CRITICAL',
        '1-2 Weeks'
      );
    }

    // 4. Missing recyclability information
    if (!record.recyclabilityClass || record.recyclabilityClass.trim() === '') {
      createRec(
        'RCY',
        'Missing Recyclability Information',
        'Collect the relevant recyclability information and supporting evidence (Class A-E).',
        'CRITICAL',
        '3-5 Days'
      );
    } else if (record.recyclabilityClass.includes('Class D') || record.recyclabilityClass.includes('Class E')) {
      createRec(
        'REDESIGN',
        'Restricted Recyclability Class (DfR)',
        'Initiate packaging eco-design project to substitute incompatible resins with monomaterial alternatives prior to 2030 market ban.',
        'CRITICAL',
        '1-3 Months'
      );
    }

    // 5. Missing supporting evidence
    if (!record.supplierDeclarationStatus || record.supplierDeclarationStatus.includes('Missing') || record.supplierDeclarationStatus.includes('Expired')) {
      createRec(
        'DOC',
        'Missing Supporting Evidence',
        'Request supporting documentation (EN 13430 / ISO 14021 Declaration of Conformity) from the supplier.',
        'HIGH',
        '3-5 Days'
      );
    }

    // 6. Missing recycled content (PCR)
    if (record.recycledContentPercent === null || record.recycledContentPercent === undefined || record.recycledContentPercent === '') {
      createRec(
        'PCR',
        'Missing Recycled Content',
        'Request verified PCR percentage certificate from polymer converter (EN 15343).',
        'HIGH',
        '2-4 Days'
      );
    } else if (record.materialGroup === 'Plastic' && Number(record.recycledContentPercent) < 30) {
      createRec(
        'PCR-UPGRADE',
        'Below 2030 Minimum Recycled Plastic Target',
        'Engage resin supplier to qualify PCR polymer blend meeting mandatory PPWR Article 7 target (>=30-35%).',
        'MODERATE',
        '3-6 Weeks'
      );
    }

    // 7. Missing dimensions
    if (!record.dimensions || !record.dimensions.lengthMm) {
      createRec(
        'DIM',
        'Missing Packaging Dimensions',
        'Record length, width, and height packaging dimensions to evaluate empty space ratio.',
        'LOW',
        '1 Day'
      );
    }

    // 8. Pending SVHC screening
    if (!record.substancesOfConcernDeclared || record.substancesOfConcernDeclared.includes('Pending')) {
      createRec(
        'SVHC',
        'Substances of Concern Screening Pending',
        'Request supplier chemical safety certificate verifying compliance with PFAS restriction threshold (<0.01% w/w).',
        'MODERATE',
        '1-2 Weeks'
      );
    }
  });

  const total = recommendations.length;
  const pendingCount = recommendations.filter(r => r.status === 'Pending').length;
  const inProgressCount = recommendations.filter(r => r.status === 'In Progress').length;
  const completedCount = recommendations.filter(r => r.status === 'Completed').length;
  const completionPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return {
    totalRecommendations: total,
    pendingCount,
    inProgressCount,
    completedCount,
    completionPercentage,
    recommendations
  };
}

function updateRecommendationStatus(recId, status) {
  if (['Pending', 'In Progress', 'Completed'].includes(status)) {
    recommendationStatusStore[recId] = status;
    return true;
  }
  return false;
}

module.exports = {
  generateRecommendations,
  updateRecommendationStatus
};
