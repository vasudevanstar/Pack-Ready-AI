const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { generate100Records } = require('./data/syntheticRecords');
const { assessRecord, calculateOverallStats } = require('./services/rulesEngine');
const { runDataQualityAudit } = require('./services/qualityEngine');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors({ origin: '*' }));
app.use(express.json());

// Set up Multer for handling file uploads (stored in memory or temp directory)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });

// In-memory state initialized with synthetic records
let packagingRecords = generate100Records();
let auditLogs = [
  {
    id: 'LOG-001',
    timestamp: new Date().toISOString(),
    action: 'SYSTEM_INITIALIZATION',
    user: 'System Admin',
    details: 'Initialized PackReady AI demonstration prototype with 105 synthetic packaging records.'
  }
];

// Helper to log audit activity
function logActivity(action, user, details) {
  auditLogs.unshift({
    id: `LOG-${String(auditLogs.length + 1).padStart(3, '0')}`,
    timestamp: new Date().toISOString(),
    action,
    user: user || 'Demonstration User',
    details
  });
  if (auditLogs.length > 200) auditLogs.pop();
}

// 1. Health check & Project Meta
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'PackReady AI',
    projectId: 'TG0900889',
    institution: 'M. Kumarasamy College of Engineering, Karur',
    title: 'Intelligent Packaging Data Readiness Assessment for PPWR Reporting',
    totalRecords: packagingRecords.length,
    timestamp: new Date().toISOString(),
    transparencyNotice: 'AI-assisted packaging data readiness demonstration using transparent, deterministic rules-based evaluation.'
  });
});

// 2. Dashboard Statistics & Overview
app.get('/api/dashboard/stats', (req, res) => {
  const stats = calculateOverallStats(packagingRecords);
  res.json({
    projectMeta: {
      name: 'PackReady AI',
      id: 'TG0900889',
      institution: 'M. Kumarasamy College of Engineering, Karur'
    },
    metrics: stats,
    recentAudits: auditLogs.slice(0, 5)
  });
});

// 3. Packaging Records list with filtering, search, and pagination
app.get('/api/records', (req, res) => {
  const { search, material, format, status, limit = 20, page = 1 } = req.query;
  let results = [...packagingRecords];

  if (search) {
    const q = search.toLowerCase().trim();
    results = results.filter(r => 
      (r.id && r.id.toLowerCase().includes(q)) ||
      (r.sku && r.sku.toLowerCase().includes(q)) ||
      (r.productName && r.productName.toLowerCase().includes(q)) ||
      (r.supplierName && r.supplierName.toLowerCase().includes(q)) ||
      (r.subMaterial && r.subMaterial.toLowerCase().includes(q))
    );
  }

  if (material && material !== 'ALL') {
    results = results.filter(r => (r.materialGroup || '').toLowerCase() === material.toLowerCase());
  }

  if (format && format !== 'ALL') {
    results = results.filter(r => (r.packagingLevel || '').toLowerCase().includes(format.toLowerCase()));
  }

  // Enrich with live assessment details
  const enriched = results.map(r => ({
    ...r,
    assessment: assessRecord(r)
  }));

  if (status && status !== 'ALL') {
    if (status === 'READY') {
      results = enriched.filter(r => r.assessment.readinessScore >= 85);
    } else if (status === 'MODERATE') {
      results = enriched.filter(r => r.assessment.readinessScore >= 55 && r.assessment.readinessScore < 85);
    } else if (status === 'ACTION_REQUIRED') {
      results = enriched.filter(r => r.assessment.readinessScore < 55);
    }
  }

  const finalResults = (status && status !== 'ALL') ? results : enriched;
  const startIndex = (Number(page) - 1) * Number(limit);
  const paginated = finalResults.slice(startIndex, startIndex + Number(limit));

  res.json({
    total: finalResults.length,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(finalResults.length / Number(limit)) || 1,
    records: paginated
  });
});

// 4. Single record retrieval
app.get('/api/records/:id', (req, res) => {
  const record = packagingRecords.find(r => r.id === req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Packaging record not found' });
  }
  const assessment = assessRecord(record);
  res.json({ record, assessment });
});

// 5. Add new packaging record
app.post('/api/records', (req, res) => {
  const body = req.body;
  if (!body.productName || !body.materialGroup) {
    return res.status(400).json({ error: 'Product name and packaging material group are required.' });
  }

  const newId = body.id || `PKG-2026-${String(packagingRecords.length + 1).padStart(4, '0')}`;
  const newRecord = {
    id: newId,
    sku: body.sku || `SKU-${3000 + packagingRecords.length}`,
    productName: body.productName,
    category: body.category || 'Consumer Goods',
    packagingLevel: body.packagingLevel || 'Primary (Direct Food/Product Contact)',
    materialGroup: body.materialGroup,
    subMaterial: body.subMaterial || `${body.materialGroup} Standard`,
    weightGrams: body.weightGrams !== undefined && body.weightGrams !== '' && body.weightGrams !== null ? Number(body.weightGrams) : null,
    dimensions: body.dimensions || {
      lengthMm: body.lengthMm ? Number(body.lengthMm) : 100,
      widthMm: body.widthMm ? Number(body.widthMm) : 80,
      heightMm: body.heightMm ? Number(body.heightMm) : 40
    },
    recycledContentPercent: body.recycledContentPercent !== undefined && body.recycledContentPercent !== '' && body.recycledContentPercent !== null ? Number(body.recycledContentPercent) : null,
    recyclabilityClass: body.recyclabilityClass || 'Class B (70-80% Recyclable)',
    recyclabilityScore: body.recyclabilityScore ? Number(body.recyclabilityScore) : 75,
    supplierName: body.supplierName || 'Declared Supplier',
    supplierCountry: body.supplierCountry || 'EU / International',
    supplierDeclarationStatus: body.supplierDeclarationStatus || 'Verified (EN 13430 / ISO 14021)',
    substancesOfConcernDeclared: body.substancesOfConcernDeclared || 'Compliant (<0.01% w/w PFAS & Heavy Metals)',
    digitalPassportReady: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSyntheticDemo: false
  };

  packagingRecords.unshift(newRecord);
  logActivity('RECORD_CREATED', body.user || 'Demo User', `Created record ${newId} (${newRecord.productName})`);
  
  res.status(201).json({
    message: 'Packaging record created successfully',
    record: newRecord,
    assessment: assessRecord(newRecord)
  });
});

// 6. Update packaging record
app.put('/api/records/:id', (req, res) => {
  const index = packagingRecords.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Packaging record not found' });
  }

  const existing = packagingRecords[index];
  const b = req.body;

  const updatedRecord = {
    ...existing,
    sku: b.sku !== undefined ? b.sku : existing.sku,
    productName: b.productName !== undefined ? b.productName : existing.productName,
    category: b.category !== undefined ? b.category : existing.category,
    packagingLevel: b.packagingLevel !== undefined ? b.packagingLevel : existing.packagingLevel,
    materialGroup: b.materialGroup !== undefined ? b.materialGroup : existing.materialGroup,
    subMaterial: b.subMaterial !== undefined ? b.subMaterial : existing.subMaterial,
    weightGrams: b.weightGrams !== undefined && b.weightGrams !== '' && b.weightGrams !== null ? Number(b.weightGrams) : null,
    dimensions: {
      lengthMm: b.lengthMm !== undefined ? Number(b.lengthMm) : (existing.dimensions?.lengthMm || 100),
      widthMm: b.widthMm !== undefined ? Number(b.widthMm) : (existing.dimensions?.widthMm || 80),
      heightMm: b.heightMm !== undefined ? Number(b.heightMm) : (existing.dimensions?.heightMm || 40)
    },
    recycledContentPercent: b.recycledContentPercent !== undefined && b.recycledContentPercent !== '' && b.recycledContentPercent !== null ? Number(b.recycledContentPercent) : null,
    recyclabilityClass: b.recyclabilityClass !== undefined ? b.recyclabilityClass : existing.recyclabilityClass,
    supplierName: b.supplierName !== undefined ? b.supplierName : existing.supplierName,
    supplierCountry: b.supplierCountry !== undefined ? b.supplierCountry : existing.supplierCountry,
    supplierDeclarationStatus: b.supplierDeclarationStatus !== undefined ? b.supplierDeclarationStatus : existing.supplierDeclarationStatus,
    substancesOfConcernDeclared: b.substancesOfConcernDeclared !== undefined ? b.substancesOfConcernDeclared : existing.substancesOfConcernDeclared,
    updatedAt: new Date().toISOString()
  };

  packagingRecords[index] = updatedRecord;
  logActivity('RECORD_UPDATED', b.user || 'Demo User', `Updated record ${req.params.id} (${updatedRecord.productName})`);

  res.json({
    message: 'Packaging record updated successfully',
    record: updatedRecord,
    assessment: assessRecord(updatedRecord)
  });
});

// 7. Delete packaging record
app.delete('/api/records/:id', (req, res) => {
  const index = packagingRecords.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Packaging record not found' });
  }

  const deleted = packagingRecords.splice(index, 1)[0];
  logActivity('RECORD_DELETED', req.query.user || 'Demo User', `Deleted packaging item ${req.params.id} (${deleted.productName})`);

  res.json({
    message: `Record ${req.params.id} deleted successfully`,
    remainingCount: packagingRecords.length
  });
});

// 8. DATA QUALITY ENGINE AUDIT ENDPOINT
app.get('/api/data-quality/audit', (req, res) => {
  const auditReport = runDataQualityAudit(packagingRecords);
  logActivity('QUALITY_AUDIT_RUN', req.query.user || 'Quality Auditor', `Executed automated 10-rule Data Quality Audit across ${packagingRecords.length} records.`);
  res.json({
    projectMeta: {
      name: 'PackReady AI',
      id: 'TG0900889',
      institution: 'M. Kumarasamy College of Engineering, Karur'
    },
    report: auditReport,
    timestamp: new Date().toISOString(),
    demonstrationNotice: 'Transparent, rule-based validation engine identifying missing, invalid, duplicate, and conflicting packaging data.'
  });
});

// 9. Download Sample CSV
app.get('/api/sample-csv', (req, res) => {
  const csvHeaders = [
    'Product ID',
    'Product Name',
    'Packaging ID',
    'Packaging Material',
    'Packaging Format',
    'Packaging Weight (g)',
    'Supplier Name',
    'Recyclability Class',
    'Recycled Content (%)',
    'Supporting Evidence Status',
    'Substances of Concern'
  ].join(',');

  const sampleRows = [
    'SKU-9001,PureSpring Sparkling Water 500ml,PKG-2026-9001,Plastic,Primary (Direct Food/Product Contact),24.5,Amcor Flexibles Global,Class A (>=95% Recyclable in practice),35,Verified (EN 13430 / ISO 14021),Compliant (<0.01% w/w PFAS & Heavy Metals)',
    'SKU-9002,Organic Oat Milk 1L,PKG-2026-9002,Composite,Primary (Direct Food/Product Contact),32.0,Tetra Tech Containers,Class D (<50% Recyclable - Design Improvement Needed),0,Verified (EN 13430 / ISO 14021),Compliant (<0.01% w/w PFAS & Heavy Metals)',
    'SKU-9003,Premium Belgian Dark Chocolate 100g,PKG-2026-9003,Cardboard,Secondary (Multipack/Carton),18.2,Smurfit Kappa Group,Class A (>=95% Recyclable in practice),80,Verified (EN 13430 / ISO 14021),Compliant (<0.01% w/w PFAS & Heavy Metals)',
    'SKU-9004,Artisan Olive Oil 750ml,PKG-2026-9004,Glass,Primary (Direct Food/Product Contact),420.0,Verallia Packaging SA,Class A (>=95% Recyclable in practice),60,Verified (EN 13430 / ISO 14021),Compliant (<0.01% w/w PFAS & Heavy Metals)',
    'SKU-9005,Sparkling Soda Can 330ml,PKG-2026-9005,Metal,Primary (Direct Food/Product Contact),14.8,Crown Holdings Europe,Class A (>=95% Recyclable in practice),75,Verified (EN 13430 / ISO 14021),Compliant (<0.01% w/w PFAS & Heavy Metals)',
    'SKU-9006,Eco Kraft Mailing Envelope,PKG-2026-9006,Paper,Tertiary (Transport/Pallet),28.0,Mondi Consumer Packaging,Class A (>=95% Recyclable in practice),100,Missing / Expired,Compliant (<0.01% w/w PFAS & Heavy Metals)',
    'SKU-9007,Conditioner Pump Dispenser 250ml,PKG-2026-9007,Plastic,Primary (Direct Food/Product Contact),,Alpla Werker Plastics,Class B (70-80% Recyclable),,Missing / Expired,Pending SVHC Screening'
  ];

  const fullCsv = [csvHeaders, ...sampleRows].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="PackReady_PPWR_Sample_Template.csv"');
  res.send(fullCsv);
});

// 10. Upload & Process CSV File
app.post('/api/upload-csv', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded. Please select a valid CSV file.' });
  }

  const results = [];
  const errors = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      try {
        const getField = (keys) => {
          for (const key of keys) {
            const match = Object.keys(row).find(k => k.trim().toLowerCase() === key.toLowerCase());
            if (match && row[match] !== undefined) return row[match].trim();
          }
          return '';
        };

        const productId = getField(['Product ID', 'SKU', 'ProductID', 'Product_ID']) || `SKU-${4000 + packagingRecords.length + results.length}`;
        const productName = getField(['Product Name', 'ProductName', 'Name', 'Description']) || 'Imported Packaging Item';
        const packagingId = getField(['Packaging ID', 'PackagingID', 'Package ID', 'ID']) || `PKG-2026-${String(packagingRecords.length + results.length + 1).padStart(4, '0')}`;
        const materialGroup = getField(['Packaging Material', 'Material', 'Material Group', 'MaterialGroup']) || 'Plastic';
        const packagingLevel = getField(['Packaging Format', 'Packaging Level', 'Format', 'Level']) || 'Primary (Direct Food/Product Contact)';
        const weightRaw = getField(['Packaging Weight (g)', 'Packaging Weight', 'Weight', 'WeightGrams', 'Weight (g)']);
        const supplierName = getField(['Supplier Name', 'Supplier', 'Vendor']) || 'Imported Supplier';
        const recyclabilityClass = getField(['Recyclability Class', 'Recyclability', 'Recyclability Information']) || 'Class B (70-80% Recyclable)';
        const pcrRaw = getField(['Recycled Content (%)', 'Recycled Content', 'PCR %', 'PCR']);
        const evidenceStatus = getField(['Supporting Evidence Status', 'Evidence Status', 'Declaration Status', 'Supplier Declaration']) || 'Verified (EN 13430 / ISO 14021)';
        const substances = getField(['Substances of Concern', 'Substances Of Concern', 'SVHC']) || 'Compliant (<0.01% w/w PFAS & Heavy Metals)';

        const weightGrams = weightRaw && !isNaN(Number(weightRaw)) ? Number(weightRaw) : null;
        const recycledPercent = pcrRaw && !isNaN(Number(pcrRaw)) ? Number(pcrRaw) : null;

        const importedRecord = {
          id: packagingId,
          sku: productId,
          productName,
          category: 'Imported Catalog',
          packagingLevel,
          materialGroup,
          subMaterial: `${materialGroup} Standard Grade`,
          weightGrams,
          dimensions: { lengthMm: 120, widthMm: 90, heightMm: 45 },
          recycledContentPercent: recycledPercent,
          recyclabilityClass,
          recyclabilityScore: recyclabilityClass.includes('Class A') ? 95 : recyclabilityClass.includes('Class B') ? 78 : recyclabilityClass.includes('Class D') ? 42 : 20,
          supplierName,
          supplierCountry: 'Imported',
          supplierDeclarationStatus: evidenceStatus || 'Verified (EN 13430 / ISO 14021)',
          substancesOfConcernDeclared: substances,
          digitalPassportReady: weightGrams !== null && recycledPercent !== null && !evidenceStatus.includes('Missing'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isSyntheticDemo: false,
          source: 'CSV Upload'
        };

        results.push(importedRecord);
      } catch (err) {
        errors.push(`Row parsing issue: ${err.message}`);
      }
    })
    .on('end', () => {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {}

      if (results.length === 0) {
        return res.status(400).json({
          error: 'No valid packaging records found in the uploaded CSV file. Please ensure columns match the template.'
        });
      }

      packagingRecords = [...results, ...packagingRecords];

      logActivity(
        'CSV_IMPORTED',
        req.body.user || 'Demo User',
        `Successfully imported ${results.length} packaging records from file "${req.file.originalname}".`
      );

      res.json({
        message: `Successfully processed and imported ${results.length} packaging records!`,
        importedCount: results.length,
        totalRecords: packagingRecords.length,
        stats: calculateOverallStats(packagingRecords)
      });
    })
    .on('error', (err) => {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {}
      res.status(500).json({ error: `Failed to parse CSV: ${err.message}` });
    });
});

// 11. Reset to original synthetic state
app.post('/api/demo/reset', (req, res) => {
  packagingRecords = generate100Records();
  logActivity('DEMO_RESET', 'Presenter', 'Reset entire database back to initial 105 synthetic baseline packaging records.');
  res.json({
    message: 'Reset successful',
    totalRecords: packagingRecords.length,
    stats: calculateOverallStats(packagingRecords)
  });
});

// 12. Audit logs endpoint
app.get('/api/audit', (req, res) => {
  res.json({
    total: auditLogs.length,
    logs: auditLogs
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` PackReady AI API Server running on port ${PORT}`);
  console.log(` Project ID: TG0900889`);
  console.log(` M. Kumarasamy College of Engineering, Karur`);
  console.log(` Endpoint: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
