import "dotenv/config";
import { DataAPIClient } from "@datastax/astra-db-ts";
import * as fetchH2 from "fetch-h2";

if (!process.env.ASTRA_DB_TOKEN) {
  throw new Error(
    "ASTRA_DB_TOKEN is missing. Check your backend/.env file."
  );
}

if (!process.env.ASTRA_DB_ENDPOINT) {
  throw new Error(
    "ASTRA_DB_ENDPOINT is missing. Check your backend/.env file."
  );
}

type Document = {
  text: string;
  $vector: number[];
};

console.log("Initializing Astra client...");

const client = new DataAPIClient(process.env.ASTRA_DB_TOKEN, {
  httpOptions: {
    client: "fetch-h2",
    fetchH2,
  },
});

const db = client.db(process.env.ASTRA_DB_ENDPOINT);

const COLLECTION_NAME = "wildfire";

const collection = db.collection(COLLECTION_NAME);

export async function createCollection() {
  console.log("\n===== CREATE COLLECTION START =====");

  try {
    console.log("Creating collection:", COLLECTION_NAME);

    await db.createCollection(COLLECTION_NAME, {
      vector: {
        dimension: 1024,
        metric: "cosine",
      },
    });

    console.log("✅ Collection created successfully.");
  } catch (error: any) {
    console.error("❌ createCollection() failed:");
    console.error(error);

    const message = String(error?.message ?? "").toLowerCase();

    if (
      message.includes("already") ||
      message.includes("exists")
    ) {
      console.log("ℹ️ Collection already exists.");
      return;
    }

    throw error;
  }

  console.log("===== CREATE COLLECTION END =====\n");
}

export async function uploadData(data: Document[]) {
  console.log("\n===== UPLOAD DATA START =====");

  if (data.length === 0) {
    console.log("No documents to upload.");
    return;
  }

  console.log(`Uploading ${data.length} documents...`);

  try {
    await collection.insertMany(data);

    console.log("✅ Upload completed successfully.");
  } catch (error) {
    console.error("❌ Upload failed:");
    console.error(error);
    throw error;
  }

  console.log("===== UPLOAD DATA END =====\n");
}

export async function queryDatabase(
  query: number[]
): Promise<{ text: string }[]> {
  console.log("Running vector search...");

  try {
    const results = await collection
      .find(
        {},
        {
          sort: {
            $vector: query,
          },
          projection: {
            text: 1,
          },
          limit: 10,
        }
      )
      .toArray();

    console.log(`Found ${results.length} matching documents.`);

    return results.map((doc: any) => ({
      text: doc.text,
    }));
  } catch (error) {
    console.error("❌ queryDatabase() failed:");
    console.error(error);
    throw error;
  }
}