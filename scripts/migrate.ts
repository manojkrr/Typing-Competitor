import "dotenv/config";
import { MongoClient } from "mongodb";
import { DatabaseMigrator } from "@/lib/database/migrations";
import process from "node:process";

async function runMigrations(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI environment variable is required");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("typing-competitor");
    const migrator = new DatabaseMigrator(db);

    const command = process.argv[2];

    switch (command) {
      case "status": {
        const status = await migrator.getStatus();
        console.log("Migration Status:");
        console.log("Applied:", status.applied);
        console.log("Pending:", status.pending);
        break;
      }

      case "up": {
        await migrator.runMigrations();
        break;
      }

      case "down": {
        const version = Number.parseInt(process.argv[3] || "");
        if (isNaN(version)) {
          console.error("Please provide a valid version number");
          process.exit(1);
        }
        await migrator.rollbackToVersion(version);
        break;
      }

      default: {
        console.log("Usage:");
        console.log(
          "  tsx scripts/migrate.ts status   - Show migration status",
        );
        console.log(
          "  tsx scripts/migrate.ts up       - Run pending migrations",
        );
        console.log(
          "  tsx scripts/migrate.ts down <version> - Rollback to version",
        );
        break;
      }
    }
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
}

runMigrations().catch(console.error);
