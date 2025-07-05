import type { Db } from "mongodb";
import bcrypt from "bcryptjs";
import type { DatabaseUser } from "@/types";

export async function seedDatabase(db: Db): Promise<void> {
  console.log("🌱 Starting database seeding...");

  try {
    // Check if users already exist
    const userCount = await db.collection("users").countDocuments();
    if (userCount > 0) {
      console.log("📊 Database already contains users, skipping seed");
      return;
    }

    // Create sample users
    const sampleUsers: Omit<DatabaseUser, "_id">[] = [
      {
        email: "demo@typingcompetitor.com",
        password: await bcrypt.hash("demo123", 12),
        name: "Demo User",
        createdAt: new Date(),
        stats: {
          totalTests: 25,
          totalTime: 1500, // 25 minutes
          bestWpm: 85,
          averageWpm: 72,
          bestAccuracy: 98,
          averageAccuracy: 94,
          totalWords: 1250,
          totalErrors: 75,
          racesWon: 8,
          racesPlayed: 15,
        },
        preferences: {
          soundEnabled: true,
          theme: "system",
        },
        lastActive: new Date(),
      },
      {
        email: "speedtyper@example.com",
        password: await bcrypt.hash("speed123", 12),
        name: "Speed Typer",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        stats: {
          totalTests: 50,
          totalTime: 3000, // 50 minutes
          bestWpm: 120,
          averageWpm: 105,
          bestAccuracy: 99,
          averageAccuracy: 97,
          totalWords: 2500,
          totalErrors: 45,
          racesWon: 18,
          racesPlayed: 22,
        },
        preferences: {
          soundEnabled: false,
          theme: "dark",
        },
        lastActive: new Date(),
      },
      {
        email: "accurate@example.com",
        password: await bcrypt.hash("accurate123", 12),
        name: "Accuracy Master",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        stats: {
          totalTests: 75,
          totalTime: 4500, // 75 minutes
          bestWpm: 95,
          averageWpm: 88,
          bestAccuracy: 100,
          averageAccuracy: 99,
          totalWords: 3750,
          totalErrors: 15,
          racesWon: 25,
          racesPlayed: 30,
        },
        preferences: {
          soundEnabled: true,
          theme: "light",
        },
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    ];

    // Insert sample users
    const result = await db.collection("users").insertMany(sampleUsers);
    console.log(`✅ Created ${result.insertedCount} sample users`);

    // Create sample test results for the demo user
    const demoUser = await db
      .collection("users")
      .findOne({ email: "demo@typingcompetitor.com" });
    if (demoUser) {
      const sampleTestResults = Array.from({ length: 10 }, (_, i) => ({
        userId: demoUser._id,
        wpm: Math.floor(Math.random() * 30) + 60, // 60-90 WPM
        accuracy: Math.floor(Math.random() * 10) + 90, // 90-100% accuracy
        errors: Math.floor(Math.random() * 10), // 0-10 errors
        timeElapsed: 60, // 60 seconds
        testType: "solo",
        cheatDetection: {
          isCheatDetected: false,
          cheatType: [],
          confidence: 0,
          details: [],
        },
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Spread over last 10 days
        ip: "127.0.0.1",
      }));

      await db.collection("test_results").insertMany(sampleTestResults);
      console.log(`✅ Created ${sampleTestResults.length} sample test results`);
    }

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("💥 Database seeding failed:", error);
    throw error;
  }
}
