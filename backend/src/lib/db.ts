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
  source: string;
  sourceType: "url" | "pdf";
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
): Promise<
  {
    text: string;
    source: string;
    sourceType: "url" | "pdf";
  }[]
> {
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
            source: 1,
            sourceType: 1,
          },
          limit: 10,
        }
      )
      .toArray();

    console.log(`Found ${results.length} matching documents.`);

    return results.map((doc: any) => ({
      text: doc.text,
      source: doc.source,
      sourceType: doc.sourceType,
    }));
  } catch (error) {
    console.error("❌ queryDatabase() failed:");
    console.error(error);
    throw error;
  }
}

type AlertSubscriber = {
  email: string;
  active: boolean;
  createdAt: string;
};

const SUBSCRIBER_COLLECTION_NAME = "alert_subscribers";

const subscriberCollection = db.collection<AlertSubscriber>(
  SUBSCRIBER_COLLECTION_NAME
);

export async function createSubscriberCollection() {
  console.log("\n===== CREATE SUBSCRIBER COLLECTION START =====");

  try {
    console.log(
      "Creating collection:",
      SUBSCRIBER_COLLECTION_NAME
    );

    await db.createCollection(SUBSCRIBER_COLLECTION_NAME);

    console.log("✅ Subscriber collection created successfully.");
  } catch (error: any) {
    console.error("❌ createSubscriberCollection() failed:");
    console.error(error);

    const message = String(error?.message ?? "").toLowerCase();

    if (
      message.includes("already") ||
      message.includes("exists")
    ) {
      console.log("ℹ️ Subscriber collection already exists.");
      return;
    }

    throw error;
  }

  console.log("===== CREATE SUBSCRIBER COLLECTION END =====\n");
}

export async function addSubscriber(
  email: string
) {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await subscriberCollection.findOne({
    email: normalizedEmail,
  });

  if (existing) {
    if (existing.active) {
      return {
        success: true,
        alreadySubscribed: true,
        message: "Email is already subscribed.",
      };
    }

    await subscriberCollection.updateOne(
      { email: normalizedEmail },
      {
        $set: {
          active: true,
        },
      }
    );

    return {
      success: true,
      alreadySubscribed: false,
      message: "Subscription reactivated.",
    };
  }

  await subscriberCollection.insertOne({
    email: normalizedEmail,
    active: true,
    createdAt: new Date().toISOString(),
  });

  return {
    success: true,
    alreadySubscribed: false,
    message: "Successfully subscribed to environmental alerts.",
  };
}

export async function getActiveSubscribers(): Promise<
  AlertSubscriber[]
> {
  const subscribers = await subscriberCollection
    .find({
      active: true,
    })
    .toArray();

  return subscribers;
}