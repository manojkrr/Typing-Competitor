import { initializeDatabase } from "./migrations";
import { seedDatabase } from "./seed";
import { getDatabase } from "@/lib/mongodb";

export async function startupDatabase(): Promise<void> {
  try {
    console.log("🚀 Starting database initialization...");

    // Run migrations
    await initializeDatabase();

    // Seed database if in development
    if (process.env.NODE_ENV === "development") {
      const db = await getDatabase();
      await seedDatabase(db);
    }

    console.log("✅ Database startup completed successfully");
  } catch (error) {
    console.error("💥 Database startup failed:", error);

    // In production, we might want to exit the process
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }

    throw error;
  }
}
