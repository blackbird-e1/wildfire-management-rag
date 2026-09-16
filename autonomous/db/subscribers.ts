import "dotenv/config";
import { DataAPIClient } from "@datastax/astra-db-ts";

if (!process.env.ASTRA_DB_TOKEN) {
  throw new Error("ASTRA_DB_TOKEN is missing.");
}

if (!process.env.ASTRA_DB_ENDPOINT) {
  throw new Error("ASTRA_DB_ENDPOINT is missing.");
}

type AlertSubscriber = {
  email: string;
  active: boolean;
  createdAt: string;
};

const client = new DataAPIClient(
  process.env.ASTRA_DB_TOKEN
);

const db = client.db(
  process.env.ASTRA_DB_ENDPOINT
);

const collection =
  db.collection<AlertSubscriber>("alert_subscribers");

export async function getActiveSubscribers(): Promise<
  AlertSubscriber[]
> {
  const subscribers = await collection
    .find({
      active: true,
    })
    .toArray();

  console.log(
    `Found ${subscribers.length} active subscribers.`
  );

  return subscribers;
}