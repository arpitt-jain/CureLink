# 🏥 CureLink Med Platform

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57.svg)](https://www.sqlite.org/)

🎉 **Frontend Live Demo:** [https://curelink-med-main.vercel.app](https://curelink-med-main.vercel.app)  
⚙️ **Backend API Status:** [https://curelink-backend-2soa.onrender.com](https://curelink-backend-2soa.onrender.com)

CureLink is a comprehensive, production-grade Web Application designed to revolutionize medical access in India. Built with a premium "Tech-Medical" interface, it offers patients seamless prescription parsing, interactive spatial mapping for nearby pharmacies, and advanced real-time price comparisons for medicines to ensure cost-efficiency.

## ✨ Key Features

- **🚀 Premium Medical UI/UX**: Uses dynamic scroll-reveal animations, glassmorphism interfaces, and robust, mobile-first design aesthetics.
- **📄 AI-Powered OCR Prescription Scanning**: Upload images (JPG/PNG/WEBP) or precise PDFs of doctor prescriptions. The built-in Tesseract.js engine extracts readable text and natively fuzz-matches known medicines.
- **🗺️ Interactive Pharmacy Map**: Fully interactive Leaflet-powered geolocation map allowing patients to find nearby, in-stock local pharmacies dynamically based on their live coordinates.
- **⚖️ Advanced Price Comparison**: Detailed comparison panels nested directly inside medicine cards aggregating medicine prices, local pharmacy distances, and stock availability, coupled with direct online purchase links (1mg, PharmEasy, Netmeds, Apollo Pharmacy).
- **🗃️ Robust Indian Medicine Dataset Engine**: Built with a backend initializer (`importCSV.ts`) capable of churning through a 250,000-row dataset to map authentic medicine descriptions, uses, and side-effect semantics directly into an embedded high-speed `better-sqlite3` database engine.

## 🛠️ Technology Stack

**Frontend**
- **Framework:** React 18 & Vite
- **Styling:** Vanilla CSS (Modern Variables, Flexbox/Grid, IntersectionObserver Animations)
- **Mapping:** React-Leaflet (`leaflet`)
- **Icons:** Lucide React

**Backend**
- **Server Environment:** Node.js (Express 5.x)
- **Database:** `better-sqlite3`
- **Machine Learning / File Parsing:** Tesseract.js (OCR), PDF-Parse, Multer (Memory Storage)
- **Execution Engine:** TSX (TypeScript runtime engine)

## 📦 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed along with `npm` (Node Package Manager).

### 1. Installation

Clone this repository to your local machine:
```bash
git clone https://github.com/rohitraj1106/curelink-med-main.git
cd curelink-med-main
```

Install backend dependencies:
```bash
cd backend
npm install
```

Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### 2. Environment Variables

In the `backend` folder, duplicate `.env.example` as `.env`:
```bash
cp .env.example .env
```
Ensure your ports or cache TTLs are correctly defined inside `.env`.

### 3. Running the Platform

**Starting the Backend Data Engine**
The backend scripts automatically initialize the SQLite DB and map the CSV dataset upon first run.

```bash
cd backend
npm run dev
# The backend will be accessible locally on http://localhost:4000
```

**Starting the Frontend Client**
In an additional terminal, navigate to the frontend directory:

```bash
cd frontend
npm run dev
# The frontend will be accessible locally on http://localhost:5173
```

## 📂 Architecture Overview

```yaml
curelink-med-main/
├── backend/
│   ├── db/
│   │   ├── importCSV.ts    # 250K+ row Medicine data enrichment tool
│   │   ├── pharmacy.db     # SQLite generated DB
│   │   └── setup.ts        # Automated Schema & Seed logic
│   ├── routes/
│   │   └── api.ts          # Core REST API utilizing Haversine spatial math
│   └── server.ts           # Express Application Entry
└── frontend/
    └── src/
        ├── components/     # ComparisonPanel, NearbyMap, PrescriptionResults, OCRUpload 
        ├── App.tsx         # Main Landing Entry with scroll-reveal logic
        ├── index.css       # Core Design Tokens
        └── types.ts        # Comprehensive TS Interfaces
```

## 🛡️ License

This project is licensed under the ISC License.