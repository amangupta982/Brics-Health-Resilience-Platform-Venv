<div align="center">

# 🏥 BRICS Health Resilience Platform
### Sovereign Healthcare Visibility, Predictive Logistics & Crisis Response Grid

[![CI Pipeline](https://github.com/amangupta982/Medical-Repo-Project/actions/workflows/ci.yml/badge.svg)](https://github.com/amangupta982/Medical-Repo-Project/actions)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Flower](https://img.shields.io/badge/Federated_Learning-Flower_v1.5-FF7043?style=flat-square)](https://flower.ai/)
[![OR-Tools](https://img.shields.io/badge/Google-OR_Tools-4285F4?style=flat-square&logo=google&logoColor=white)](https://developers.google.com/optimization)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

<br/>

```
PREDICT  ──▶  EXPLAIN  ──▶  SIMULATE  ──▶  OPTIMIZE  ──▶  ACT  ──▶  AUDIT
```

**An enterprise-grade, full-stack intelligence and command platform designed to eliminate pharmaceutical stock-outs, forecast clinical demand spikes, simulate epidemic shocks, orchestrate automated inter-facility logistics, and execute privacy-preserving federated machine learning across sovereign healthcare jurisdictions.**

[Explore Modules](#-core-platform-modules) • [Live Quickstart](#-quickstart--installation) • [System Architecture](#-system-architecture) • [API Reference](#-api-endpoints-reference) • [Methodology](#-machine-learning--optimization-methodology)

</div>

---

## 🎯 Executive Summary & Mission

Public healthcare networks across emerging economies frequently suffer from **asymmetric visibility**, leading to fatal stock-outs of essential medicines, overburdened rural Primary Healthcare Centres (PHCs), and delayed crisis responses during vector-borne or waterborne epidemic outbreaks.

The **BRICS Health Resilience Platform** bridges this systemic gap through an end-to-end command center that unifies:
1. **Predictive AI**: Anticipates clinical medicine depletion 7 days ahead with SHAP explainability.
2. **Multi-Horizon Forecasting**: Projects daily drug requirements at 1, 7, 14, and 30-day procurement intervals.
3. **Epidemic Stress-Testing**: Simulates real-world patient surges and supply-chain transit disruptions.
4. **Operations Research Optimization**: Automates inter-clinic medicine rebalancing via Google OR-Tools with First-Expired, First-Out (FEFO) prioritization.
5. **Sovereign Federated Learning**: Trains collaborative models across 5 sovereign national nodes (India, Brazil, Russia, China, South Africa) with strictly **zero raw patient data egress**.
6. **Live Multi-Page PDF Intelligence**: Generates publication-ready, official operational dossiers tailored to every active dashboard slide.

---

## 🚀 Core Platform Modules

| Module | Core Technology | Operational Capability |
| :--- | :--- | :--- |
| **🗺️ Geospatial PHC Grid** | Leaflet + OpenStreetMap + Esri Satellite | Real-time interactive spatial map of 60 healthcare facilities across 10 districts, highlighting inpatient bed capacity, remote/tribal accessibility, and cold-chain status. |
| **⏱️ 7-Day Stockout Early Warning** | XGBoost + LightGBM + SHAP TreeExplainer | Evaluates medicine stock exhaustion risks with clinical recall weighting (F2-score). Exposes feature attributions (consumption influx, lead times, safety margins). |
| **📈 Multi-Horizon Demand Forecasting** | LightGBM + XGBoost + LSTM RNN | Multi-interval regression forecasting (1d, 7d, 14d, 30d) across critical pharmaceuticals (Paracetamol, Insulin, Amoxicillin, IV Fluids, ORS). |
| **⚡ Crisis Simulation & Stress-Testing** | Monte Carlo Epidemiological Shock Engine | Interactive stress-testing simulator modeling dengue outbreaks, flu surges, and custom supply disruptions to identify breaching facilities before real crises hit. |
| **🔄 Inter-Facility Rebalancing** | Google OR-Tools (MIP Transportation LP) | Formulates cost-minimized, route-optimized stock transfer orders between surplus hospitals and deficit clinics with FEFO expiry sequencing. |
| **🛡️ District Resilience Index** | Composite Multi-Factor Scoring | Transparent 0–100 resilience index benchmarking districts across 4 pillars: Medicine Availability, Bed Capacity, Staffing Adequacy, and Emergency Readiness. |
| **🏆 ML Model Benchmark & Governance** | Walk-Forward Time-Split Evaluation | Side-by-side production champion vs. challenger evaluation registry comparing PR-AUC, ROC-AUC, MAE, and RMSE to dynamically select live inference models. |
| **🌐 Sovereign Federated Learning** | Flower FedAvg Framework | Decentralized cross-border collaborative model training across 5 national health authorities with homomorphic weight aggregation and zero patient record egress. |
| **🚨 Anomaly & Alert Operations** | Real-Time Telemetry & SLA Tracking | Centralized operational alert register categorizing incidents by severity (CRITICAL, HIGH, MEDIUM) with direct escalation workflows. |
| **📄 Universal PDF Intelligence Dossier** | jsPDF Vector Publishing Engine | One-click official government dossiers generated instantaneously across every page, featuring tailored scope cards, domain data tables, and directives. |

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT PRESENTATION LAYER                               │
│  React 18  •  Vite 5  •  Tailwind CSS v4  •  Framer Motion  •  Recharts  •  Leaflet GIS │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTP / JSON API (Port 8000 / 5173)
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                             FASTAPI BACKEND SERVICE ENGINE                             │
│       Request Timing  •  Correlation IDs  •  CORS  •  FastAPI Pydantic Schemas         │
├───────────────────────┬────────────────────────┬───────────────────────────────────────┤
│    PREDICTIVE ML      │   OPERATIONS RESEARCH  │          FEDERATED LEARNING           │
│  • XGBoost Classifier │  • Google OR-Tools     │  • Flower (flwr) NumPyClient          │
│  • LightGBM Regressor │    MIP Transportation  │  • Non-IID Sovereign Client Grid      │
│  • LSTM Sequence Net  │  • Shortest-Path Haul  │  • Homomorphic Weight Aggregation     │
│  • SHAP Explainability│  • FEFO Prioritization │  • Differential Privacy Guarantee     │
└───────────────────────┴───────────┬────────────┴───────────────────────────────────────┘
                                    │ SQLAlchemy ORM / Async Engine
┌───────────────────────────────────▼────────────────────────────────────────────────────┐
│                               PERSISTENCE & STORAGE                                    │
│  PostgreSQL 16 Database  •  SQLite Fallback  •  350k+ Calibrated Operational Records  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Quickstart & Installation

### Option 1: Automated Dev Launcher (Recommended)

The repository includes a unified, zero-configuration startup script that handles database verification, frontend bundle synchronization, and concurrent server execution:

```bash
# Clone the repository
git clone https://github.com/amangupta982/Medical-Repo-Project.git
cd Medical-Repo-Project

# Run the unified launcher
chmod +x ./start.sh
./start.sh
```

- 🌐 **Web Dashboard**: [http://localhost:8000](http://localhost:8000) (Combined Frontend + Backend)
- ⚡ **Vite Dev Server**: [http://localhost:5173](http://localhost:5173) (Instant HMR)
- 📚 **Interactive Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option 2: Docker Compose

```bash
cp .env.example .env
docker-compose up --build
```

---

### Option 3: Manual Step-by-Step Setup

#### 1. Backend Service & Model Training

```bash
cd backend

# Setup virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure database
export DATABASE_URL="postgresql://postgres:brics_dev_pw@localhost:5432/brics_health"
export PYTHONPATH="$(pwd)"

# Download calibration datasets and seed schema (~350k records)
python ../data/raw/download_datasets.py
python app/database/seed.py

# Train production ML models
python app/ml/classification/train_stockout.py
python app/ml/forecasting/train_demand.py
python app/ml/lstm/train_demand_lstm.py

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Dashboard

```bash
cd frontend

# Install npm dependencies
npm install

# Run Vite dev server
npm run dev
```

---

## 🔬 Machine Learning & Optimization Methodology

### 1. Clinical Recall-First Evaluation ($F_2$ Score)
In clinical pharmaceutical logistics, a **False Negative** (failing to predict a stockout, leaving patients without life-saving insulin or antibiotics) has catastrophic health consequences compared to a **False Positive** (a precautionary replenishment warning). 

Models are evaluated using the **$F_2$ metric**, which places twice the weight on recall:

$$F_2 = (1 + 2^2) \cdot \frac{\text{Precision} \cdot \text{Recall}}{(2^2 \cdot \text{Precision}) + \text{Recall}}$$

### 2. Time-Based Walk-Forward Validation
Standard k-fold cross-validation introduces temporal data leakage in supply chain forecasting. All models in this platform are trained and validated strictly using **chronological, walk-forward time splits** on held-out temporal horizons.

### 3. OR-Tools Transportation Optimization
The redistribution engine formulates inter-facility rebalancing as a Mixed-Integer Linear Program (MIP):

$$\min \sum_{i \in \text{Surplus}} \sum_{j \in \text{Deficit}} c_{ij} \cdot x_{ij} - \lambda \sum_{j \in \text{Deficit}} \text{RiskReduction}(j)$$

$$\text{Subject to: } \sum_{j} x_{ij} \le \text{Surplus}_i, \quad \sum_{i} x_{ij} \le \text{Deficit}_j$$

Where $c_{ij}$ incorporates Haversine kilometric road distance and transit priority, while $\lambda$ prioritizes urgent stock rescues.

### 4. Sovereign Federated Learning (Flower FedAvg)
Each national client node trains locally on sovereign data partitions. Only weight tensors $\Delta w_k$ are transmitted to the coordinator:

$$w_{t+1} = \sum_{k=1}^{K} \frac{n_k}{n} w_{t+1}^k$$

Patient clinical records, diagnostic notes, and local IDs **never leave the client facility boundary**.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health status and database connectivity |
| `GET` | `/api/stats/overview` | Platform-wide operational stats (PHCs, population, beds) |
| `GET` | `/api/phcs` | Monitored healthcare facilities with GIS coordinates |
| `GET` | `/api/districts` | Administrative district directory and boundaries |
| `GET` | `/api/inventory` | Live pharmaceutical inventory levels and vendor lead times |
| `GET` | `/api/alerts` | Active network anomaly alerts and incident triggers |
| `POST` | `/api/predict/stockout` | Predict 7-day stockout probability with SHAP feature drivers |
| `POST` | `/api/predict/demand` | Multi-horizon demand forecasting (1d, 7d, 14d, 30d) |
| `POST` | `/api/emergency/simulate` | Stress-test grid resilience against simulated crisis shocks |
| `POST` | `/api/optimize/redistribution` | Execute OR-Tools inter-facility rebalancing dispatch |
| `GET` | `/api/resilience-score` | Composite district resilience index rankings |
| `POST` | `/api/federated/train` | Execute Flower FedAvg rounds across sovereign nodes |
| `GET` | `/api/models/performance` | Champion vs challenger machine learning benchmark registry |
| `GET` | `/api/explainability/{id}` | Detailed SHAP feature attributions for a given prediction |

---

## 🧪 Testing & CI/CD Pipeline

The platform enforces automated unit, integration, and build testing via GitHub Actions:

```bash
# Run Backend Pytest Suite
cd backend
pytest tests/ -v

# Run Frontend Vitest & Component Suite
cd frontend
npm run test

# Validate Production Bundle Build
npm run build
```

The CI pipeline automatically validates:
- [x] Feature engineering leakage checks and threshold verification
- [x] API contract integrity across all REST routers
- [x] React Testing Library DOM rendering and timer clock synchronizations
- [x] Clean, unminified asset bundle packaging

---

## 📁 Repository Structure

```
Medical-Repo-Project/
├── start.sh                      # Zero-configuration unified launcher
├── docker-compose.yml            # Multi-container orchestration
├── backend/
│   ├── app/
│   │   ├── api/                  # FastAPI REST routers
│   │   ├── database/             # SQLAlchemy schemas & seed scripts
│   │   ├── ml/                   # XGBoost, LightGBM, SHAP, and LSTM models
│   │   ├── optimization/         # Google OR-Tools transportation solvers
│   │   └── services/             # Core business logic & federated clients
│   ├── requirements.txt          # Python dependencies
│   └── tests/                    # Backend test suite
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI components & navigation
│   │   ├── pages/                # 10 dedicated platform pages
│   │   ├── services/             # Axios API client with in-memory caching
│   │   └── utils/                # Universal vector PDF reporting engine
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite bundler configuration
├── data/
│   └── raw/                      # Calibration data & dataset fetchers
└── docs/                         # Architecture & data provenance specifications
```

---

## 📜 Data Provenance & Ethics Statement

To ensure full research integrity and transparency:
- Macro-level network metrics, district boundaries, and epidemiological baselines are calibrated against real, cited government sources (**RHS India**, **EpiClim Disease Surveillance**).
- Daily facility-level pharmaceutical transactions represent calibrated synthetic data generated according to real epidemiological distribution curves, directly addressing the real-world healthcare transparency gap.
- All sovereign federated learning demonstrations operate on non-IID client partitions adhering to strict zero-egress compliance protocols.

---

<div align="center">

**Built with pride for global healthcare resilience and equitable clinical supply chains.**  
*BRICS Health Resilience Consortium • Official Use Only*

</div>
