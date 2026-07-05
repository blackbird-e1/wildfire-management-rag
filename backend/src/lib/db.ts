import "dotenv/config";
import { DataAPIClient } from "@datastax/astra-db-ts";

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

const client = new DataAPIClient(process.env.ASTRA_DB_TOKEN);

const db = client.db(process.env.ASTRA_DB_ENDPOINT);

const COLLECTION_NAME = "wildfire";

const collection = db.collection(COLLECTION_NAME);

export async function createCollection() {
  try {
    await db.createCollection(COLLECTION_NAME, {
      vector: {
        dimension: 1024,
        metric: "cosine",
      },
    });

  } catch (error: any) {
    const message = String(error?.message ?? "").toLowerCase();

    if (
      message.includes("already") ||
      message.includes("exists")
    ) {
      return;
    }

    throw error;
  }
}

export async function uploadData(
  data: Document[]
) {
  if (data.length === 0) {
    return;
  }

  await collection.insertMany(data);

}

export async function queryDatabase(
  query: number[]
): Promise<{ text: string }[]> {
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

  return results.map((doc: any) => ({
    text: doc.text,
  }));
}