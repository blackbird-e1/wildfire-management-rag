import "dotenv/config";
import { createSubscriberCollection } from "./lib/db";

async function main() {
  await createSubscriberCollection();
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});