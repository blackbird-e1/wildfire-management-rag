## Running the Project Locally

### 1. Clone the repository

```bash
git clone <repository-url>
cd wildfire-management-rag
```

### Project Structure

```text
wildfire-management-rag/
│
├── backend/          # Node.js + TypeScript backend
│   ├── src/
│   ├── data/
│   ├── package.json
│   └── .env
│
├── frontend/         # React + Vite frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## 2. Install Backend Dependencies

```bash
cd backend
npm install
```

---

## 3. Install Frontend Dependencies

Open a new terminal.

```bash
cd frontend
npm install
```

---

## 4. Configure Environment Variables

Create a `.env` file inside the **backend** folder.

```text
backend/.env
```

Add your API keys:

```env
GROQ_API_KEY=your_groq_api_key
JINA_API_KEY=your_jina_api_key
```

---

## 5. Generate Embeddings (Only Required Once)

From the **backend** directory, run:

```bash
npm run ingest
```

This will:

* Scrape the wildfire documents
* Generate embeddings
* Store the vector database inside:

```text
backend/data/vectors.json
```

You only need to run this again if you add or modify the source documents.

---

## 6. Start the Backend

From the **backend** directory:

```bash
npm run server
```

The backend will start on:

```text
http://localhost:3001
```

Leave this terminal running.

---

## 7. Start the Frontend

Open a second terminal.

```bash
cd frontend
npm run dev
```

The frontend will start on:

```text
http://localhost:5173
```

Open the URL in your browser and start asking questions about wildfire management.

---

## Running the Application

You should have **two terminals** running:

### Terminal 1

```bash
cd backend
npm run server
```

### Terminal 2

```bash
cd frontend
npm run dev
```

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite

### Backend

* Node.js
* TypeScript
* Express

### AI Stack

* Groq LLM
* Jina Embeddings
* Retrieval-Augmented Generation (RAG)
* Vector Search
