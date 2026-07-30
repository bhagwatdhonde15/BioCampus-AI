# 🌿 BioCampus AI – Campus Plant Diversity & Environmental IoT System

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3FCF8E?logo=supabase&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-Satellite%20GIS-199900?logo=leaflet&logoColor=white)
![Deploy](https://img.shields.io/badge/GitHub%20Pages-Live-22C55E?logo=github&logoColor=white)

> **BioCampus AI** is an end-to-end, multi-modal environmental intelligence platform built for **Sanjivani University Campus** (`19.9016° N, 74.4949° E`). It combines **GIS Satellite Canopy AI Segmentation**, **Live DroidCam YOLO Computer Vision**, **ESP8266 IoT Moisture Telemetry**, and **Supabase PostgreSQL Cloud Persistence** into a unified dashboard.

🌐 **Live Demo on GitHub Pages**: [https://bhagwatdhonde15.github.io/BioCampus-AI/](https://bhagwatdhonde15.github.io/BioCampus-AI/)

---

## 🌟 Novel Features & Key Highlights

### 🛰️ 1. Satellite Tree Canopy AI Cluster Array
- **Full Campus Coverage**: Mapped across **12 Sanjivani University Zones** (West River Corridor, Engineering Quadrangle Courtyard, Agricultural Research Fields, Central Lawns, Hostel Belt, Entrance Avenue, Botanical Nursery, etc.).
- **Canopy Analytics HUD**: Spots out **1,246 Trees** across **48,650 m² Total Green Canopy Cover** with real-time **NDVI Vegetation Health Index** (`0.84`).
- **Esri High-Res Imagery**: Toggle between Esri High-Resolution Satellite Orthophotos and OpenStreetMap vector layers.

### 👁️ 2. Live YOLO Computer Vision & DroidCam AI Analyzer
- **Real Stream Processing**: Connects directly to DroidCam video stream (`http://10.58.122.34:4747/video`).
- **Greenness & Contrast Spectrum Analysis**: Real-time pixel buffer greenness ratio analysis (`g > 45 && g > r * 1.15 && g > b * 1.15`) with dynamic physical height estimation.
- **Zero Mock Data Policy**: Displays automatic `⚠️ VISION UNCLEAR / NO PLANT IN VIEW` warning card when pointing at non-plant objects (desks, screens, walls).
- **Plant.id AI v3 Integration**: One-click precise botanical identification and health diagnostic report on live camera frame snapshots.

### 💧 3. ESP8266 Ultra-Low Latency IoT Soil Moisture Telemetry
- **Hardware Integration**: Real-time HTTP JSON telemetry from ESP8266 NodeMCU at `http://10.58.122.4/data`.
- **⚡ 300ms Synchronized Stream**: Circular animated moisture gauge and Recharts line graph update simultaneously in real-time (`~12ms` latency).
- **Tree Passport Sync**: Live soil moisture percentages auto-sync directly into individual plant health scorecards in the Growth Monitor.
- **Offline Safety State**: Displays `NOT CONNECTED` with an empty gauge when hardware is powered off.

### 🔐 4. Supabase Cloud Database & Google Auth
- **Google OAuth & Email Sign-In**: Sliding login modal supporting Google Sign-In and campus email authentication (`src/services/supabaseClient.ts`).
- **PostgreSQL Persistence**: SQL schema (`supabase/schema.sql`) for `plants`, `growth_logs`, and `iot_telemetry` tables.
- **1-Click Bulk Sync**: Bulk upload all local and satellite tree records to Supabase with one click in the Inventory view.

### 🏷️ 5. Digital Plant Passport & QR Tagging
- **Tree Health Scorecard**: Health index (0-100), height (m), trunk DBH (cm), and arborist inspection growth trajectory graphs.
- **QR Code Tag Generator**: Instant printable QR tag creation for physical campus tree labelling.

---

## 🏗️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend Core** | React 18, TypeScript, Vite 5 |
| **Styling & UI** | TailwindCSS, Lucide Icons, Glassmorphism UI |
| **GIS & Mapping** | Leaflet.js, Esri World Imagery, OpenStreetMap |
| **Database & Auth** | Supabase (`@supabase/supabase-js`, `@supabase/ssr`), PostgreSQL |
| **Data Visualization** | Recharts (Responsive Line Charts, Gauges) |
| **Hardware & Vision** | ESP8266 NodeMCU (`10.58.122.4`), DroidCam (`10.58.122.34`), Plant.id v3 AI |
| **Deployment** | GitHub Actions (`.github/workflows/deploy.yml`), GitHub Pages |

---

## 🚀 Quick Start / Local Setup

### Prerequisites
- Node.js `v18.0.0` or higher
- npm `v9.0.0` or higher

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/bhagwatdhonde15/BioCampus-AI.git
cd BioCampus-AI

# 2. Install dependencies
npm install

# 3. Create .env file (Optional for Supabase/Plant.id API keys)
cp .env.example .env

# 4. Start local development server
npm run dev
```

The application will run at **`http://localhost:3000/`**.

---

## 🗄️ Supabase Database Schema Setup

To create the PostgreSQL database tables in your Supabase project:

1. Go to your **[Supabase Dashboard](https://supabase.com/dashboard)** → **SQL Editor**.
2. Copy and paste the contents of [`supabase/schema.sql`](./supabase/schema.sql).
3. Click **RUN**.

```sql
CREATE TABLE public.plants (...);
CREATE TABLE public.growth_logs (...);
CREATE TABLE public.iot_telemetry (...);
```

---

## 📂 Project Structure

```
BioCampus-AI/
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions CI/CD for GitHub Pages
├── public/                       # Static public assets
├── src/
│   ├── components/
│   │   ├── Header.tsx            # Navigation bar, GPS status, User profile pill
│   │   ├── LiveMap.tsx           # Satellite Orthophoto GIS map & 12 Canopy Clusters
│   │   ├── Inventory.tsx         # Species table, search filters, QR tags & Supabase bulk sync
│   │   ├── GrowthMonitor.tsx     # Health scorecards & IoT moisture metrics
│   │   ├── LiveYoloVision.tsx    # YOLO computer vision analyzer & DroidCam AI stream
│   │   ├── IoTSensorMonitor.tsx  # ESP8266 300ms ultra-low latency moisture gauge & graph
│   │   ├── AuthModal.tsx         # Google OAuth & Email authentication modal
│   │   ├── PlantDetailModal.tsx  # Plant Passport modal
│   │   └── QRModal.tsx           # QR Code Tag modal generator
│   ├── hooks/
│   │   ├── useGeolocation.ts     # Live GPS location tracking hook
│   │   └── usePlantStore.ts      # Local & Supabase state manager
│   ├── services/
│   │   ├── supabaseClient.ts     # Supabase client SDK & DB sync functions
│   │   └── plantIdService.ts     # Plant.id v3 AI identification API
│   ├── types/
│   │   └── plant.ts              # TypeScript interfaces
│   ├── App.tsx                   # Main layout router
│   └── main.tsx                  # React entrypoint
├── supabase/
│   └── schema.sql                # Re-runnable Supabase PostgreSQL schema script
├── vite.config.ts                # Vite config & base pathing
├── netlify.toml                  # Netlify deployment configuration
├── vercel.json                   # Vercel deployment configuration
└── README.md                     # Documentation
```

---

## 📜 Author & Credits

- **Author**: Bhagwat Dhonde ([@bhagwatdhonde15](https://github.com/bhagwatdhonde15))
- **Institution**: Sanjivani University, Kopargaon, Maharashtra, India
- **Project**: Hackathon / Campus Biodiversity & IoT Intelligence System

---

### ⭐ Star this Repository if you found it helpful!
