import { createCollection, uploadData } from "./lib/db";
import { generateEmbedding } from "./lib/ai";
import { scrape } from "./lib/scrape";

const urls = [
  "https://en.wikipedia.org/wiki/Wildfire",
  "https://en.wikipedia.org/wiki/Wildfire_suppression",
];

async function ingest() {
  const chunks: {
    text: string;
    $vector: number[];
    url: string;
  }[] = [];

  // Process one URL at a time
  for (const url of urls) {
    console.log(`Scraping: ${url}`);

    const documents = await scrape(url);

    // Process one document at a time
    for (const doc of documents) {
      console.log("Generating embedding...");

      const embedding = await generateEmbedding(doc.pageContent);

      chunks.push({
        text: doc.pageContent,
        $vector: embedding,
        url,
      });

      // Small delay to avoid API rate limits
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log(`Uploading ${chunks.length} chunks.....`);

  await createCollection();

  await uploadData(
    chunks.map((doc) => ({
      $vector: doc.$vector,
      text: doc.text,
    }))
  );

  console.log("✅ Ingestion completed successfully!");
}

ingest().catch((error) => {
  console.error(error);
});