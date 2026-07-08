import { createCollection, uploadData } from "./lib/db";
import { generateEmbedding } from "./lib/ai";
import { scrape } from "./lib/scrape";

const urls = [
  "https://en.wikipedia.org/wiki/Wildfire",
  "https://en.wikipedia.org/wiki/Wildfire_suppression",
];

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

export default async function ingest() {
  const chunks: {
    text: string;
    $vector: number[];
    url: string;
  }[] = [];

  let totalChunks = 0;

  for (const url of urls) {
    console.log(`\n====================================`);
    console.log(`Scraping: ${url}`);
    console.log(`====================================\n`);

    const documents = await scrape(url);

    console.log(`Found ${documents.length} chunks.`);

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];

      totalChunks++;

      console.log(
        `Embedding chunk ${i + 1}/${documents.length} (${totalChunks} total)`
      );

      const embedding = await generateEmbeddingWithRetry(
        doc.pageContent
      );

      chunks.push({
        text: doc.pageContent,
        $vector: embedding,
        url,
      });

      await sleep(DELAY_MS);
    }
  }

  console.log(`\n====================================`);
  console.log(`Uploading ${chunks.length} chunks...`);
  console.log(`====================================\n`);

  await createCollection();

  await uploadData(
    chunks.map((doc) => ({
      $vector: doc.$vector,
      text: doc.text,
    }))
  );

  console.log("✅ Ingestion completed successfully!");
}

if (require.main === module) {
  ingest().catch((error) => {
    console.error("❌ Ingestion failed:");
    console.error(error);
    process.exit(1);
  });
}