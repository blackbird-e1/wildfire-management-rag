import express from "express";
import cors from "cors";

import { queryDatabase } from "./lib/db";
import { generateEmbedding, generateResponse } from "./lib/ai";
import ingest from "./ingest";

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

    const embedding = await generateEmbedding(question);

    const docs = await queryDatabase(embedding);

    const context = docs.map((doc) => doc.text);

    const answer = await generateResponse(question, context);

    res.status(200).json({
      answer,
    });
  } catch (error) {
    console.error("Error while processing request:", error);

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Wildfire RAG Backend running on port ${PORT}`);
});