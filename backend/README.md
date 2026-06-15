## Running the Project Locally

### 1. Clone the repository

```bash
git clone <repository-url>
cd wildfire-management-rag
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Install frontend dependencies

```bash
cd client
npm install
cd ..
```

### 4. Configure environment variables

Create a `.env` file in the project root.

```env
GROQ_API_KEY=your_groq_api_key
JINA_API_KEY=your_jina_api_key
```

### 5. Generate embeddings (only required once)

```bash
npm run ingest
```

This scrapes the source documents, generates embeddings, and stores them in `data/vectors.json`.

### 6. Start the backend

Open a terminal in the project root and run:

```bash
npm run server
```

The backend will start on:

```
http://localhost:3001
```

### 7. Start the frontend

Open a second terminal.

```bash
cd client
npm run dev
```

The React application will be available at:

```
http://localhost:5173
```

Open the URL in your browser and start asking questions about wildfire management.