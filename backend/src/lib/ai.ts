import "dotenv/config";

import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is missing.");
}

if (!process.env.JINA_API_KEY) {
  throw new Error("JINA_API_KEY is missing.");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateEmbedding(
  text: string
): Promise<number[]> {
  console.log("Generating embedding...");

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 30000);

  try {
    const response = await fetch(
      "https://api.jina.ai/v1/embeddings",
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.JINA_API_KEY}`,
        },
        body: JSON.stringify({
          model: "jina-embeddings-v3",
          input: [text],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();

      throw new Error(
        `Jina API Error (${response.status}): ${error}`
      );
    }

    const data = await response.json();

    return data.data[0].embedding;
  } catch (error) {
    console.error("Embedding generation failed:", error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateResponse(
  question: string,
  context: string[]
) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are a wildfire management assistant. Answer ONLY using the supplied context. If the answer is not present, say you don't know.",
      },
      {
        role: "user",
        content: `
QUESTION:
${question}

CONTEXT:
${context.join("\n\n")}
        `,
      },
    ],
  });

  return response.choices[0].message.content ?? "";
}