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
    console.error(
      "Embedding generation failed:",
      error
    );

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
    model: "openai/gpt-oss-120b",
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


/*
 * Generate a structured wildfire intelligence report.
 *
 * This is separate from generateResponse()
 * so the existing /ask chat behaviour remains unchanged.
 */
export async function generateReportResponse(
  question: string,
  context: string[]
) {
  const response =
    await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",

      messages: [
        {
          role: "system",
          content: `
You are a wildfire management intelligence analyst.

Answer ONLY using the supplied context.

Create a structured intelligence report.

Return ONLY valid JSON.
Do not include markdown.
Do not include code fences.

The JSON must have exactly this structure:

{
  "executiveSummary": "A concise summary of the answer.",
  "keyFindings": [
    "Finding 1",
    "Finding 2",
    "Finding 3"
  ],
  "operationalConsiderations": [
    "Consideration 1",
    "Consideration 2"
  ]
}

Rules:
- Do not invent facts.
- Do not invent sources.
- Do not include URLs.
- Use only information supported by the supplied context.
- Keep the executive summary concise.
- Keep key findings specific and useful.
- Keep operational considerations relevant to wildfire management.
- If the context does not contain enough information, clearly say so.
          `,
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

      response_format: {
        type: "json_object",
      },
    });

  const content =
    response.choices[0].message.content ?? "{}";

  return JSON.parse(content);
}