import { MongoClient } from "mongodb";

import { seedDatabase } from "@/lib/database/seed";
import * as process from "node:process";
import { getDatabase } from "@/lib/mongodb";

async function runSeed(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI environment variable is required");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = await getDatabase();
    await seedDatabase(db);

    console.log("✅ Seeding completed successfully");
  } catch (error) {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
}

runSeed().catch(console.error);
