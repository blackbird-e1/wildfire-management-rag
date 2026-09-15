import { generateEmbedding } from "./ai";
import { uploadData } from "./db";
import { chunkPdf } from "./pdf";

const DELAY_MS = 100;
const MAX_RETRIES = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateEmbeddingWithRetry(
  text: string,
  retries = MAX_RETRIES
): Promise<number[]> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await generateEmbedding(text);
    } catch (error) {
      lastError = error;

      console.warn(
        `Embedding failed (attempt ${attempt}/${retries}).`
      );

      if (attempt < retries) {
        await sleep(1000 * attempt);
      }
    }
  }

  throw lastError;
}

export async function ingestPdf(
  buffer: Buffer,
  source: string
) {
  console.log(`\n====================================`);
  console.log(`Processing PDF: ${source}`);
  console.log(`====================================\n`);

  const documents = await chunkPdf(buffer);

  console.log(`Found ${documents.length} chunks.`);

  const chunks = [];

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];

    console.log(
      `Embedding PDF chunk ${i + 1}/${documents.length}`
    );

    const embedding = await generateEmbeddingWithRetry(
      doc.pageContent
    );

    chunks.push({
      $vector: embedding,
      text: doc.pageContent,
      source,
      sourceType: "pdf" as const,
    });

    await sleep(DELAY_MS);
  }

  console.log(`\n====================================`);
  console.log(`Uploading ${chunks.length} PDF chunks...`);
  console.log(`====================================\n`);

  await uploadData(chunks);

  console.log("✅ PDF ingestion completed successfully.");
}