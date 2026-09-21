# Wildfire Management RAG

An AI-powered wildfire management decision-support system combining Retrieval-Augmented Generation (RAG), wildfire risk analysis, autonomous alerts, and quantum resource optimization.

---

## Overview

Wildfire Management RAG is a decision-support platform designed to help users analyze wildfire-related information and explore resource allocation strategies.

The system combines:

- Retrieval-Augmented Generation (RAG)
- Vector search
- LLM-powered question answering
- Wildfire risk visualization
- PDF knowledge ingestion
- Autonomous weather alerts
- Quantum resource allocation

The project is designed as a technical prototype for exploring how AI, optimization, and decision-support workflows can be combined in a wildfire management context.

---

## System Architecture

```text
                         ┌─────────────────────┐
                         │      React UI       │
                         │     Vite + TS       │
                         └──────────┬──────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  │                                   │
                  ▼                                   ▼
        ┌──────────────────┐                ┌──────────────────┐
        │   RAG / AI       │                │ Quantum Resource │
        │    Backend       │                │    Optimizer     │
        └────────┬─────────┘                └────────┬─────────┘
                 │                                   │
                 ▼                                   ▼
        ┌──────────────────┐                ┌──────────────────┐
        │    Astra DB      │                │ Python + Qiskit  │
        │  Vector Search   │                │   QUBO + QAOA    │
        └──────────────────┘                └──────────────────┘
```

---

# Features

## 1. Wildfire RAG Assistant

The RAG pipeline allows users to ask questions about wildfire management information.

The system retrieves relevant information from the knowledge base and uses the retrieved context to generate responses.

### Technology

- Groq
- Jina Embeddings
- Astra DB
- Retrieval-Augmented Generation

---

## 2. Wildfire Risk Management

The application provides an interactive wildfire risk interface.

Risk zones can be assigned risk values on a scale from 0 to 10.

```text
0–4    LOW
5–7    MEDIUM
8–10   HIGH
```

These risk values can be adjusted interactively from the frontend.

The current risk distribution is shared with the Quantum Resource Optimizer.

---

# 3. Quantum Resource Optimizer

The application includes a quantum optimization component for wildfire response resource allocation.

The optimizer models resource deployment as a binary optimization problem.

Each decision variable represents:

```text
1 → Deploy resource to zone
0 → Do not deploy resource
```

With three wildfire zones and three resource types, the optimization problem contains:

```text
3 zones × 3 resources = 9 binary variables
```

### Available Resources

```text
Fire Engines   → 2
Drones         → 1
Medical Teams  → 1
```

### Optimization Objective

The optimization model maximizes:

```text
Risk × Resource Impact − Deployment Cost
```

A quadratic penalty is also applied when multiple different resources are concentrated in the same zone.

### Resource Constraints

The optimizer enforces resource availability limits:

```text
Fire Engines   ≤ 2
Drones         ≤ 1
Medical Teams  ≤ 1
```

### Optimization Pipeline

```text
Wildfire Risk Scores
        ↓
Quadratic Program
        ↓
QUBO
        ↓
QAOA
        ↓
Qiskit Aer Simulator
        ↓
Optimized Resource Deployment
```

### Dynamic Risk Input

The frontend sends the current risk distribution to:

```text
POST /quantum/optimize
```

Example request:

```json
{
  "zones": [
    {
      "id": "Zone A",
      "risk": 2
    },
    {
      "id": "Zone B",
      "risk": 10
    },
    {
      "id": "Zone C",
      "risk": 1
    }
  ]
}
```

The backend passes the risk data to:

```text
quantum/run_optimizer.py --stdin
```

The Python optimizer updates the risk model, builds the optimization problem, runs QAOA using Qiskit Aer, and returns the resulting deployment.

The frontend then displays:

- Objective value
- Resource allocation
- Optimization status
- Decision explanation

---

# 4. Autonomous Alerts

The project also includes an autonomous weather monitoring workflow.

The system can periodically evaluate weather conditions and trigger notifications when configured conditions are met.

### Technology

- Trigger.dev
- Open-Meteo
- Resend

---

# Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Leaflet

## Backend

- Node.js
- TypeScript
- Express

## AI / RAG

- Groq
- Jina Embeddings
- Astra DB
- Retrieval-Augmented Generation

## Quantum Optimization

- Python
- Qiskit
- Qiskit Optimization
- Qiskit Aer
- QAOA
- COBYLA

## Autonomous Workflows

- Trigger.dev
- Open-Meteo
- Resend

---

# Project Structure

```text
wildfire-management-rag/
│
├── backend/
│   ├── src/
│   ├── data/
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── quantum/
│   ├── optimizer.py
│   ├── resource_model.py
│   ├── run_optimizer.py
│   ├── test_optimizer.py
│   └── venv/
│
├── mcp/
│
├── graphify-out/
│
├── README.md
├── .gitignore
└── LICENSE
```

---

# Running the Project Locally

## 1. Clone the Repository

```bash
git clone <repository-url>
cd wildfire-management-rag
```

---

## 2. Install Backend Dependencies

```bash
cd backend
npm install
```

---

## 3. Install Frontend Dependencies

Open a second terminal:

```bash
cd frontend
npm install
```

---

## 4. Configure Environment Variables

Create a `.env` file inside the backend directory:

```text
backend/.env
```

Configure the API credentials required by the backend.

Example:

```env
GROQ_API_KEY=your_groq_api_key
JINA_API_KEY=your_jina_api_key
```

Add any additional database or service configuration required by the project.

Do not commit API keys or `.env` files to Git.

---

# Starting the Application

## Backend

From the `backend` directory:

```bash
npm run start
```

The backend runs on:

```text
http://localhost:3001
```

---

## Frontend

From the `frontend` directory:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

Open the frontend URL in your browser.

---

# Running the Quantum Optimizer

The quantum component uses its own Python virtual environment.

From the project root:

```bash
cd quantum
```

## Activate the Virtual Environment

### Windows

```powershell
.\venv\Scripts\Activate.ps1
```

Verify Python:

```powershell
python --version
```

The current development environment uses Python 3.12.

---

## Run the Resource Model

```powershell
python resource_model.py
```

This performs a simple coverage calculation for each zone and resource combination.

Example:

```text
Zone A | fire_engine | coverage: 50
Zone A | drone | coverage: 30
Zone A | medical_team | coverage: 20
```

---

## Run the Optimizer Directly

```powershell
python run_optimizer.py
```

This builds and solves the wildfire resource allocation problem using QAOA and Qiskit Aer.

---

# Quantum API

The Node.js backend exposes:

```text
POST /quantum/optimize
```

The endpoint accepts the current wildfire risk distribution.

Example request:

```json
{
  "zones": [
    {
      "id": "Zone A",
      "risk": 10
    },
    {
      "id": "Zone B",
      "risk": 7
    },
    {
      "id": "Zone C",
      "risk": 3
    }
  ]
}
```

Example response structure:

```json
{
  "success": true,
  "objective": 58,
  "status": "OptimizationResultStatus.SUCCESS",
  "deployment": [
    {
      "zone": "Zone B",
      "resource": "fire_engine"
    },
    {
      "zone": "Zone B",
      "resource": "drone"
    }
  ]
}
```

The exact objective value and deployment depend on the current risk distribution and optimization result.

---

# Testing

The quantum optimizer includes automated tests using pytest.

From the `quantum` directory, activate the virtual environment:

```powershell
.\venv\Scripts\Activate.ps1
```

Install pytest if required:

```powershell
python -m pip install pytest
```

Run the tests:

```powershell
python -m pytest test_optimizer.py -v
```

The current test suite covers:

- Optimization problem construction
- Resource availability constraints
- QAOA optimization execution

---

# End-to-End Quantum Workflow

To test the complete quantum workflow:

1. Start the backend.
2. Start the frontend.
3. Open the Quantum Resource Optimizer.
4. Adjust the risk values for Zone A, Zone B, and Zone C.
5. Click **Optimize Resources**.
6. The frontend sends the current risk distribution to the backend.
7. The backend launches the Python optimizer.
8. QAOA runs using Qiskit Aer.
9. The optimized deployment is returned.
10. The frontend displays the result and decision explanation.

Example:

```text
Risk Distribution

Zone A → 2
Zone B → 10
Zone C → 1

        ↓

Quantum Optimization

        ↓

Optimized Deployment

Zone B → Fire Engine
Zone B → Drone
```

The allocation changes when the risk distribution changes.

---

# Development Status

The current Quantum Resource Allocation pipeline includes:

- Interactive wildfire risk controls
- Shared risk state
- Frontend-to-backend optimization API
- Node.js to Python integration
- JSON stdin communication
- QUBO formulation
- QAOA optimization
- Qiskit Aer simulation
- Resource availability constraints
- Dynamic risk input
- Dynamic optimization results
- Decision explanation
- Automated optimizer tests

---

# Disclaimer

This project is a research and engineering prototype for wildfire management decision support.

Optimization results are intended for experimentation and decision-support demonstrations and should not replace professional emergency-management judgment, operational procedures, or field assessments.