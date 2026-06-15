import { queryDatabase } from "./lib/db";
import { generateEmbedding, generateResponse } from "./lib/ai";

async function askQuestion(question: string) {
  // Convert the user's question into an embedding
  const embedding = await generateEmbedding(question);

  // Search the vector database
  const queryRes = await queryDatabase(embedding);

  // Keep only valid text chunks
  const context = queryRes
    .map((doc) => doc.text)
    .filter((text): text is string => text !== null);

  // Generate the final answer
  const response = await generateResponse(question, context);

  return response;
}

askQuestion("What are the main causes of wildfires?")
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.error(err);
  });