import express from "express";
import cors from "cors";

import ingest from "./ingest";
import { askWildfireGraph } from "./graph/wildfireGraph";
import { generateEmbedding } from "./lib/ai";
import { queryDatabase } from "./lib/db";

const app = express();

const PORT = Number(process.env.PORT) || 3001;

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Wildfire Management RAG Backend is running 🚀",
  });
});

app.post("/ingest", async (_req, res) => {
  try {
    console.log("Starting ingestion...");

    await ingest();

    res.status(200).json({
      success: true,
      message: "Ingestion completed successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Ingestion failed.",
    });
  }
});

app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string") {
      res.status(400).json({
        error: "A valid question is required.",
      });

      return;
    }

    const result = await askWildfireGraph(question);

    res.status(200).json({
      answer: result.answer,
    });
  } catch (error) {
    console.error("Error while processing request:", error);

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

app.post("/search", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string") {
      res.status(400).json({
        error: "A valid query is required.",
      });

      return;
    }

    const embedding = await generateEmbedding(query);

    const documents = await queryDatabase(embedding);

    res.status(200).json({
      results: documents,
    });
  } catch (error) {
    console.error(
      "Error while searching wildfire knowledge:",
      error
    );

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Wildfire RAG Backend running on port ${PORT}`);
});