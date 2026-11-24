/**
 * Rules-based Assessment and Data Quality Engine for PPWR Readiness
 * Transparent deterministic rules based on EU Packaging & Packaging Waste Regulation (PPWR) drafts:
 * - PPWR Article 5: Minimization & Weight optimization
 * - PPWR Article 6: Design for Recycling (DfR) classes A-E
 * - PPWR Article 7: Minimum Recycled Plastic Content targets
 * - PPWR Article 11: Labeling, Material Identification & Digital Product Passport (DPP) readiness
 * - Substances of Concern (SVHC, PFAS, heavy metals)
 */

function assessRecord(record) {
  const qualityIssues = [];
  const gaps = [];
  let completenessScore = 100;
  let readinessScore = 100;

  // 1. Data Quality Checks
  if (record.weightGrams === null || record.weightGrams === undefined || record.weightGrams <= 0) {
    qualityIssues.push({
      field: 'weightGrams',
      severity: 'CRITICAL',
      message: 'Missing or invalid net packaging weight (grams). Mandatory for EPR and PPWR declaration.'
    });
    completenessScore -= 25;
    readinessScore -= 25;
  }

  if (record.recycledContentPercent === null || record.recycledContentPercent === undefined) {
    qualityIssues.push({
      field: 'recycledContentPercent',
      severity: 'HIGH',
      message: 'Post-consumer recycled (PCR) content percentage is not recorded.'
    });
    completenessScore -= 20;
    readinessScore -= 18;
  }

  if (!record.dimensions || !record.dimensions.lengthMm || !record.dimensions.widthMm || !record.dimensions.heightMm) {
    qualityIssues.push({
      field: 'dimensions',
      severity: 'MEDIUM',
      message: 'Packaging physical dimensions missing. Required for headspace ratio & Article 9 volume reduction check.'
    });
    completenessScore -= 15;
    readinessScore -= 10;
  }

  if (record.supplierDeclarationStatus.includes('Missing')) {
    qualityIssues.push({
      field: 'supplierDeclarationStatus',
      severity: 'HIGH',
      message: 'Supplier verification declaration certificate missing or expired.'
    });
    completenessScore -= 20;
    readinessScore -= 20;
  }

  if (record.substancesOfConcernDeclared.includes('Pending')) {
    qualityIssues.push({
      field: 'substancesOfConcernDeclared',
      severity: 'HIGH',
      message: 'Substances of very high concern (SVHC / PFAS / lead) declaration pending audit.'
    });
    completenessScore -= 15;
    readinessScore -= 15;
  }

  // 2. PPWR Regulatory & Technical Gaps
  if (record.materialGroup === 'Plastic' && (record.recycledContentPercent || 0) < 30) {
    gaps.push({
      code: 'GAP-PPWR-ART7',
      article: 'Article 7 (Minimum Recycled Content)',
      riskLevel: 'HIGH',
      description: `Plastic packaging has ${record.recycledContentPercent || 0}% PCR, below target thresholds for 2030 (target >= 30-35%).`,
      recommendation: 'Request technical validation for grade PCR resin blend with supplier.'
    });
  }

  if (record.recyclabilityClass && (record.recyclabilityClass.includes('Class D') || record.recyclabilityClass.includes('Class E') || record.recyclabilityClass.includes('Conflicting'))) {
    gaps.push({
      code: 'GAP-PPWR-ART6',
      article: 'Article 6 (Design for Recycling)',
      riskLevel: 'CRITICAL',
      description: `Packaging classified under ${record.recyclabilityClass}. From 2030, packaging with recyclability < 70% (Class D/E) is restricted from EU market placement.`,
      recommendation: 'Initiate packaging redesign: substitute multi-layer barriers or incompatible resins with monomaterial alternatives.'
    });
  }

  if (record.materialGroup === 'Composite') {
    gaps.push({
      code: 'GAP-PPWR-ART6-COMPOSITE',
      article: 'Article 6 & Annex II (Design for Recycling Separability)',
      riskLevel: 'MEDIUM',
      description: 'Composite laminates require certified delamination or specialized recovery sorting.',
      recommendation: 'Evaluate monomaterial barrier alternatives or obtain RecyClass / COTREP recyclability test report.'
    });
  }

  completenessScore = Math.max(0, completenessScore);
  readinessScore = Math.max(0, readinessScore);

  let readinessStatus = 'High Readiness (Ready for PPWR Audit)';
  let readinessGrade = 'Tier 1';
  if (readinessScore < 50) {
    readinessStatus = 'Critical Non-Compliance Risk';
    readinessGrade = 'Tier 4 (Action Required)';
  } else if (readinessScore < 75) {
    readinessStatus = 'Moderate Data Readiness (Gaps Identified)';
    readinessGrade = 'Tier 3';
  } else if (readinessScore < 90) {
    readinessStatus = 'Good Readiness (Minor Attestation Needed)';
    readinessGrade = 'Tier 2';
  }

  return {
    completenessScore,
    readinessScore,
    readinessStatus,
    readinessGrade,
    qualityIssues,
    gaps
  };
}

function calculateOverallStats(records) {
  let totalCompleteness = 0;
  let totalReadiness = 0;
  let compliantCount = 0;
  let moderateCount = 0;
  let criticalCount = 0;
  let totalGaps = 0;
  let totalQualityIssues = 0;

  const materialBreakdown = {};
  const statusDistribution = {
    'Tier 1 (>=90%)': 0,
    'Tier 2 (75-89%)': 0,
    'Tier 3 (50-74%)': 0,
    'Tier 4 (<50%)': 0
  };

  records.forEach(r => {
    const assessment = assessRecord(r);
    totalCompleteness += assessment.completenessScore;
    totalReadiness += assessment.readinessScore;
    totalGaps += assessment.gaps.length;
    totalQualityIssues += assessment.qualityIssues.length;

    if (assessment.readinessScore >= 85) compliantCount++;
    else if (assessment.readinessScore >= 55) moderateCount++;
    else criticalCount++;

    if (assessment.readinessScore >= 90) statusDistribution['Tier 1 (>=90%)']++;
    else if (assessment.readinessScore >= 75) statusDistribution['Tier 2 (75-89%)']++;
    else if (assessment.readinessScore >= 50) statusDistribution['Tier 3 (50-74%)']++;
    else statusDistribution['Tier 4 (<50%)']++;

    materialBreakdown[r.materialGroup] = (materialBreakdown[r.materialGroup] || 0) + 1;
  });

  const count = records.length || 1;
  return {
    totalRecords: records.length,
    averageCompleteness: Math.round(totalCompleteness / count),
    averageReadiness: Math.round(totalReadiness / count),
    highReadinessCount: compliantCount,
    moderateRiskCount: moderateCount,
    criticalRiskCount: criticalCount,
    totalGapsIdentified: totalGaps,
    totalQualityIssues: totalQualityIssues,
    materialBreakdown: Object.keys(materialBreakdown).map(mat => ({
      material: mat,
      count: materialBreakdown[mat]
    })),
    statusDistribution: Object.keys(statusDistribution).map(k => ({
      tier: k,
      count: statusDistribution[k]
    }))
  };
}

module.exports = {
  assessRecord,
  calculateOverallStats
};
