/**
 * Synthetic packaging data generator for PackReady AI
 * Generates 100+ realistic packaging records covering:
 * Plastic, Paper, Cardboard, Glass, Metal, Composite
 * Realistic mix of complete, incomplete, and inconsistent records for demonstration.
 */

const MATERIALS = [
  { type: 'Plastic', sub: ['PET (Polyethylene Terephthalate)', 'HDPE (High-Density Polyethylene)', 'LDPE (Low-Density Polyethylene)', 'PP (Polypropylene)', 'PS (Polystyrene)', 'Multi-layer barrier film (PE/EVOH/PE)'] },
  { type: 'Paper', sub: ['Kraft Paper', 'Bleached Paperboard', 'Greaseproof Paper', 'Recycled Kraft'] },
  { type: 'Cardboard', sub: ['Corrugated Flute B/C', 'Solid Bleached Sulphate (SBS)', 'Folding Boxboard (FBB)', 'Greyboard'] },
  { type: 'Glass', sub: ['Flint (Clear) Glass', 'Amber Glass', 'Green Glass'] },
  { type: 'Metal', sub: ['Aluminium Foil / Can', 'Tinplate Steel', 'Aerosol Steel'] },
  { type: 'Composite', sub: ['Aseptic Carton (Paper/PE/Alu)', 'Metallized Film Laminate', 'Plastic/Waxed Paper'] }
];

const PACKAGING_LEVELS = ['Primary (Direct Food/Product Contact)', 'Secondary (Multipack/Carton)', 'Tertiary (Transport/Pallet)'];
const PRODUCT_CATEGORIES = ['Food & Beverages', 'Personal Care & Cosmetics', 'Pharmaceuticals & Healthcare', 'Home Care & Cleaning', 'Consumer Electronics', 'Industrial & Hardware'];
const SUPPLIERS = [
  { name: 'EcoPack Nordics AB', country: 'Sweden' },
  { name: 'Verallia Packaging SA', country: 'France' },
  { name: 'Tetra Tech Containers', country: 'Germany' },
  { name: 'Amcor Flexibles Global', country: 'Switzerland' },
  { name: 'Smurfit Kappa Group', country: 'Ireland' },
  { name: 'Mondi Consumer Packaging', country: 'Austria' },
  { name: 'Crown Holdings Europe', country: 'Belgium' },
  { name: 'Alpla Werker Plastics', country: 'Austria' },
  { name: 'Huhtamaki Oyj', country: 'Finland' },
  { name: 'DS Smith Packaging', country: 'United Kingdom' }
];

function generate100Records() {
  const records = [];

  for (let i = 1; i <= 105; i++) {
    const id = `PKG-2026-${String(i).padStart(4, '0')}`;
    const matGroup = MATERIALS[i % MATERIALS.length];
    const subMaterial = matGroup.sub[i % matGroup.sub.length];
    const pkgLevel = PACKAGING_LEVELS[i % PACKAGING_LEVELS.length];
    const category = PRODUCT_CATEGORIES[i % PRODUCT_CATEGORIES.length];
    const supplier = SUPPLIERS[i % SUPPLIERS.length];

    // Intentionally introduce realistic anomalies in ~30% of records
    const isMissingWeight = i % 14 === 0;
    const isMissingRecycledContent = i % 8 === 0;
    const isMissingDimensions = i % 11 === 0;
    const isMissingSupplierDoc = i % 5 === 0;
    const isInconsistentRecyclability = i % 17 === 0;
    const isHazardousSubstanceUnclear = i % 9 === 0;

    const baseWeight = Math.round((12 + (i * 3.7) % 350) * 10) / 10;
    const recycledPercent = isMissingRecycledContent ? null : (matGroup.type === 'Plastic' ? (i % 2 === 0 ? 30 : 0) : (matGroup.type === 'Glass' ? 55 : (matGroup.type === 'Cardboard' ? 70 : 25)));
    
    // Recyclability assessment flag
    let recyclabilityClass = 'Class B (70-80% Recyclable)';
    if (matGroup.type === 'Glass' || (matGroup.type === 'Cardboard' && !subMaterial.includes('Aseptic'))) {
      recyclabilityClass = 'Class A (>=95% Recyclable in practice)';
    } else if (matGroup.type === 'Composite' || subMaterial.includes('Multi-layer')) {
      recyclabilityClass = isInconsistentRecyclability ? 'Declared Recyclable (Conflicting Lab Report)' : 'Class D (<50% Recyclable - Design Improvement Needed)';
    } else if (matGroup.type === 'Plastic' && subMaterial.includes('PS')) {
      recyclabilityClass = 'Class E (Non-recyclable under PPWR Art. 6)';
    }

    records.push({
      id,
      sku: `SKU-${1000 + i}`,
      productName: `${category.split(' ')[0]} Pack Model ${String.fromCharCode(65 + (i % 26))}-${i * 2}`,
      category,
      packagingLevel: pkgLevel,
      materialGroup: matGroup.type,
      subMaterial: subMaterial,
      weightGrams: isMissingWeight ? null : baseWeight,
      dimensions: isMissingDimensions ? null : {
        lengthMm: 50 + (i * 7) % 250,
        widthMm: 40 + (i * 5) % 180,
        heightMm: 20 + (i * 9) % 300
      },
      recycledContentPercent: recycledPercent,
      recyclabilityScore: isInconsistentRecyclability ? 35 : (recyclabilityClass.startsWith('Class A') ? 95 : recyclabilityClass.startsWith('Class B') ? 78 : recyclabilityClass.startsWith('Class D') ? 42 : 15),
      recyclabilityClass,
      supplierName: supplier.name,
      supplierCountry: supplier.country,
      supplierDeclarationStatus: isMissingSupplierDoc ? 'Missing / Expired' : 'Verified (EN 13430 / ISO 14021)',
      substancesOfConcernDeclared: isHazardousSubstanceUnclear ? 'Pending SVHC Screening' : 'Compliant (<0.01% w/w PFAS & Heavy Metals)',
      digitalPassportReady: !isMissingWeight && !isMissingRecycledContent && !isMissingSupplierDoc && !isInconsistentRecyclability,
      createdAt: new Date(2026, 1, (i % 28) + 1).toISOString(),
      updatedAt: new Date(2026, 2, 1).toISOString(),
      isSyntheticDemo: true
    });
  }

  return records;
}

module.exports = {
  generate100Records
};
