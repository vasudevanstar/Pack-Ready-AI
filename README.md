# PackReady AI — Intelligent Packaging Data Readiness Assessment for PPWR Reporting

**Project ID:** TG0900889  
**Institution:** M. Kumarasamy College of Engineering, Karur  
**Stage:** Phase 1 — Project Architecture & Overview Dashboard

---

## 🌿 Overview

**PackReady AI** is an enterprise-grade web application prototype designed for the TECHgium competition. It assesses packaging specifications against the EU Packaging and Packaging Waste Regulation (PPWR) requirements (Articles 5, 6, 7 & 11) using transparent, rule-based data quality and readiness evaluation logic.

> **Project Honesty & Prototype Disclosure:**  
> This application is an **AI-assisted packaging data readiness demonstration**. All assessment scores, gap classifications, and recommendations are computed using transparent, deterministic, rules-based logic. It does not claim official PPWR regulatory certification or production ERP integrations.

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Recharts, Lucide React icons
- **Backend:** Node.js, Express.js, REST API, CORS
- **Data Engine:** Deterministic rule-based evaluation engine with 105 realistic synthetic packaging records covering Plastic, Paper, Cardboard, Glass, Metal, and Composites.

---

## 🚀 Installation & Local Startup

### 1. Prerequisites
- Node.js (v18+ or v20+ recommended)
- npm

---

### 2. Running the Backend Server (Port 5000)

Open a terminal in the project root:

```bash
cd backend
npm install
npm run dev
```

The Express API server starts at `http://localhost:5000`.  
Health check endpoint: `http://localhost:5000/api/health`

---

### 3. Running the Frontend Application (Port 3000)

Open a second terminal in the project root:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:3000` to interact with the dashboard.

---

## 📊 Phase 1 Deliverables & Working Features

1. **Enterprise UI Design:**
   - Forest green (`#0d2818`, `#047857`) and crisp white SaaS aesthetic.
   - Professional sidebar navigation with all 8 requested modules (Overview, Packaging Records, Data Quality, Readiness Assessment, Gap Analysis, Recommendations, Reports, Audit Trail).
   - High-contrast KPI cards with responsive grid layout optimized for laptop and projector presentations.

2. **105 Realistic Synthetic Records:**
   - Spans 6 core packaging materials (PET, HDPE, Corrugated Flute, Glass, Alu, Composites).
   - Realistic distribution of complete, incomplete (missing weights, missing PCR content, missing dimensions), and non-compliant records.

3. **Active Rule-Based Assessment Engine:**
   - Deterministic checks for net weight presence, PCR target thresholds (PPWR Art. 7), Design for Recycling recyclability classes (PPWR Art. 6), and SVHC compliance.

4. **Interactive Dashboard Charts & Components:**
   - **Readiness Tier Pie Chart:** Classifies portfolio into Tier 1 (>=90%), Tier 2 (75-89%), Tier 3 (50-74%), and Tier 4 (<50%).
   - **Material Distribution Bar Chart:** Visualizes portfolio volume across material categories.
   - **Recent Packaging Records Table:** Displays real-time readiness ratings and progress indicators.
   - **Live Audit Trail:** Logs system initialization and user actions chronologically.
   - **Reset Demo Functionality:** A single-click button restores the entire dataset back to default synthetic baseline records.

- **Phase 2:** Packaging Data Importer (CSV Upload, column mapping, and inline manual record editing).
- **Phase 3:** Data Quality Engine (Detailed field completeness checks and inconsistency detection).
- **Phase 4:** Digital Readiness Assessment (PPWR score breakdown and Digital Product Passport readiness tiering).
- **Phase 5:** Rules-Based Gap Analysis (Article-by-article regulatory discrepancy matrix).
- **Phase 6:** Recommendation Engine (Actionable corrective remediation steps).
- **Phase 7:** Reports & Audit Trail (Exportable audit sheets and PDF/CSV summaries).
- **Phase 8:** End-to-end integration and presentation mode polish.
