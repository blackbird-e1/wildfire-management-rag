import express from "express";
import cors from "cors";

import { queryDatabase } from "./lib/db";
import { generateEmbedding, generateResponse } from "./lib/ai";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    const embedding = await generateEmbedding(question);

    const docs = await queryDatabase(embedding);

    const context = docs.map((doc) => doc.text);

    const answer = await generateResponse(question, context);

    res.json({
      answer,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Something went wrong.",
    });
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});