import type { Db } from "mongodb";
import { getDatabase } from "@/lib/mongodb";

interface Migration {
  version: number;
  name: string;
  up: (db: Db) => Promise<void>;
  down: (db: Db) => Promise<void>;
}

const migrations: Migration[] = [
  {
    version: 1,
    name: "create_users_collection",
    up: async (db: Db) => {
      // Create users collection
      await db.createCollection("users");

      // Create indexes
      await db.collection("users").createIndex({ email: 1 }, { unique: true });
      await db.collection("users").createIndex({ createdAt: 1 });
      await db.collection("users").createIndex({ lastActive: 1 });

      console.log("✅ Created users collection with indexes");
    },
    down: async (db: Db) => {
      await db.collection("users").drop();
      console.log("❌ Dropped users collection");
    },
  },
  {
    version: 2,
    name: "create_test_results_collection",
    up: async (db: Db) => {
      // Create test_results collection
      await db.createCollection("test_results");

      // Create indexes
      await db.collection("test_results").createIndex({ userId: 1 });
      await db.collection("test_results").createIndex({ timestamp: -1 });
      await db.collection("test_results").createIndex({ wpm: -1 });
      await db.collection("test_results").createIndex({ accuracy: -1 });
      await db.collection("test_results").createIndex({ testType: 1 });
      await db
        .collection("test_results")
        .createIndex({ "cheatDetection.isCheatDetected": 1 });

      // Compound indexes for common queries
      await db
        .collection("test_results")
        .createIndex({ userId: 1, timestamp: -1 });
      await db.collection("test_results").createIndex({ userId: 1, wpm: -1 });

      console.log("✅ Created test_results collection with indexes");
    },
    down: async (db: Db) => {
      await db.collection("test_results").drop();
      console.log("❌ Dropped test_results collection");
    },
  },
  {
    version: 3,
    name: "create_race_history_collection",
    up: async (db: Db) => {
      // Create race_history collection for multiplayer race records
      await db.createCollection("race_history");

      // Create indexes
      await db.collection("race_history").createIndex({ roomId: 1 });
      await db.collection("race_history").createIndex({ participants: 1 });
      await db.collection("race_history").createIndex({ startTime: -1 });
      await db.collection("race_history").createIndex({ endTime: -1 });
      await db.collection("race_history").createIndex({ winner: 1 });

      console.log("✅ Created race_history collection with indexes");
    },
    down: async (db: Db) => {
      await db.collection("race_history").drop();
      console.log("❌ Dropped race_history collection");
    },
  },
  {
    version: 4,
    name: "create_leaderboards_collection",
    up: async (db: Db) => {
      // Create leaderboards collection
      await db.createCollection("leaderboards");

      // Create indexes
      await db.collection("leaderboards").createIndex({ type: 1, value: -1 });
      await db.collection("leaderboards").createIndex({ userId: 1 });
      await db.collection("leaderboards").createIndex({ updatedAt: -1 });

      console.log("✅ Created leaderboards collection with indexes");
    },
    down: async (db: Db) => {
      await db.collection("leaderboards").drop();
      console.log("❌ Dropped leaderboards collection");
    },
  },
  {
    version: 5,
    name: "create_migrations_collection",
    up: async (db: Db) => {
      // Create migrations collection to track applied migrations
      await db.createCollection("migrations");

      // Create indexes
      await db
        .collection("migrations")
        .createIndex({ version: 1 }, { unique: true });
      await db.collection("migrations").createIndex({ appliedAt: 1 });

      console.log("✅ Created migrations collection with indexes");
    },
    down: async (db: Db) => {
      await db.collection("migrations").drop();
      console.log("❌ Dropped migrations collection");
    },
  },
];

interface MigrationRecord {
  version: number;
  name: string;
  appliedAt: Date;
}

export class DatabaseMigrator {
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  async getAppliedMigrations(): Promise<number[]> {
    try {
      const records = await this.db
        .collection<MigrationRecord>("migrations")
        .find({})
        .sort({ version: 1 })
        .toArray();

      return records.map((record) => record.version);
    } catch (error) {
      // If migrations collection doesn't exist, return empty array
      return [];
    }
  }

  async applyMigration(migration: Migration): Promise<void> {
    try {
      console.log(
        `🔄 Applying migration ${migration.version}: ${migration.name}`,
      );

      await migration.up(this.db);

      // Record the migration as applied
      await this.db.collection<MigrationRecord>("migrations").insertOne({
        version: migration.version,
        name: migration.name,
        appliedAt: new Date(),
      });

      console.log(
        `✅ Applied migration ${migration.version}: ${migration.name}`,
      );
    } catch (error) {
      console.error(
        `❌ Failed to apply migration ${migration.version}: ${migration.name}`,
        error,
      );
      throw error;
    }
  }

  async rollbackMigration(migration: Migration): Promise<void> {
    try {
      console.log(
        `🔄 Rolling back migration ${migration.version}: ${migration.name}`,
      );

      await migration.down(this.db);

      // Remove the migration record
      await this.db.collection("migrations").deleteOne({
        version: migration.version,
      });

      console.log(
        `✅ Rolled back migration ${migration.version}: ${migration.name}`,
      );
    } catch (error) {
      console.error(
        `❌ Failed to rollback migration ${migration.version}: ${migration.name}`,
        error,
      );
      throw error;
    }
  }

  async runMigrations(): Promise<void> {
    console.log("🚀 Starting database migrations...");

    const appliedMigrations = await this.getAppliedMigrations();
    const pendingMigrations = migrations.filter(
      (migration) => !appliedMigrations.includes(migration.version),
    );

    if (pendingMigrations.length === 0) {
      console.log("✅ No pending migrations");
      return;
    }

    console.log(`📋 Found ${pendingMigrations.length} pending migrations`);

    for (const migration of pendingMigrations) {
      await this.applyMigration(migration);
    }

    console.log("🎉 All migrations completed successfully!");
  }

  async rollbackToVersion(targetVersion: number): Promise<void> {
    console.log(`🔄 Rolling back to version ${targetVersion}`);

    const appliedMigrations = await this.getAppliedMigrations();
    const migrationsToRollback = migrations
      .filter(
        (migration) =>
          appliedMigrations.includes(migration.version) &&
          migration.version > targetVersion,
      )
      .sort((a, b) => b.version - a.version); // Rollback in reverse order

    for (const migration of migrationsToRollback) {
      await this.rollbackMigration(migration);
    }

    console.log(`✅ Rolled back to version ${targetVersion}`);
  }

  async getStatus(): Promise<{ applied: number[]; pending: number[] }> {
    const appliedMigrations = await this.getAppliedMigrations();
    const allMigrationVersions = migrations.map((m) => m.version);
    const pendingMigrations = allMigrationVersions.filter(
      (version) => !appliedMigrations.includes(version),
    );

    return {
      applied: appliedMigrations,
      pending: pendingMigrations,
    };
  }
}

export async function initializeDatabase(): Promise<void> {
  try {
    const db = await getDatabase();

    const migrator = new DatabaseMigrator(db);
    await migrator.runMigrations();

    console.log("🎯 Database initialization completed");
  } catch (error) {
    console.error("💥 Database initialization failed:", error);
    throw error;
  }
}

export { migrations };
