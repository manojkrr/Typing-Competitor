import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";

import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { testResultSchema } from "@/lib/validation/schemas";
import {
  validateRequestBody,
  createErrorResponse,
  ValidationError,
} from "@/lib/validation/middleware";
import type {
  DatabaseUser,
  DatabaseTestResult,
  TestResult,
  UserStats,
} from "@/types";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validateBody = validateRequestBody(testResultSchema);
    const data = await validateBody(request);

    const db = await getDatabase();
    const users = db.collection<DatabaseUser>("users");
    const testResults = db.collection<DatabaseTestResult>("test_results");

    // Save test result
    const testResult: Omit<DatabaseTestResult, "_id"> = {
      userId: new ObjectId(session.user.id),
      wpm: data.wpm,
      accuracy: data.accuracy,
      errors: data.errors,
      timeElapsed: data.timeElapsed,
      testType: data.testType,
      cheatDetection: data.cheatDetection,
      timestamp: new Date(),
      ip: request.headers.get("x-forwarded-for") || "unknown",
    };

    await testResults.insertOne(testResult);

    // Update user stats
    const user = await users.findOne({ _id: new ObjectId(session.user.id) });
    if (user) {
      const stats = user.stats || {
        totalTests: 0,
        totalTime: 0,
        bestWpm: 0,
        averageWpm: 0,
        bestAccuracy: 0,
        averageAccuracy: 0,
        totalWords: 0,
        totalErrors: 0,
        racesWon: 0,
        racesPlayed: 0,
      };

      const newStats: UserStats = {
        totalTests: stats.totalTests + 1,
        totalTime: stats.totalTime + data.timeElapsed,
        bestWpm: Math.max(stats.bestWpm, data.wpm),
        averageWpm: Math.round(
          (stats.averageWpm * stats.totalTests + data.wpm) /
            (stats.totalTests + 1),
        ),
        bestAccuracy: Math.max(stats.bestAccuracy, data.accuracy),
        averageAccuracy: Math.round(
          (stats.averageAccuracy * stats.totalTests + data.accuracy) /
            (stats.totalTests + 1),
        ),
        totalWords:
          stats.totalWords + Math.round(data.wpm * (data.timeElapsed / 60)),
        totalErrors: stats.totalErrors + data.errors,
        racesWon: stats.racesWon,
        racesPlayed: stats.racesPlayed,
      };

      await users.updateOne(
        { _id: new ObjectId(session.user.id) },
        { $set: { stats: newStats, lastActive: new Date() } },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(createErrorResponse(error), { status: 400 });
    }
    console.error("Error saving stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const users = db.collection<DatabaseUser>("users");
    const testResults = db.collection<DatabaseTestResult>("test_results");

    const user = await users.findOne({ _id: new ObjectId(session.user.id) });
    const recentTestsData = await testResults
      .find({ userId: new ObjectId(session.user.id) })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    const recentTests: TestResult[] = recentTestsData.map((test) => ({
      wpm: test.wpm,
      accuracy: test.accuracy,
      errors: test.errors,
      timeElapsed: test.timeElapsed,
      testType: test.testType,
      timestamp: test.timestamp.toISOString(),
      cheatDetected: test.cheatDetection?.isCheatDetected || false,
    }));

    return NextResponse.json({
      stats: user?.stats || {},
      recentTests,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
