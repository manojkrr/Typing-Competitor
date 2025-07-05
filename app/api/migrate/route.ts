import { type NextRequest, NextResponse } from "next/server";
import { DatabaseMigrator } from "@/lib/database/migrations";
import { getDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    // Only allow in development or with proper authorization
    if (process.env.NODE_ENV === "production") {
      const authHeader = request.headers.get("authorization");
      if (
        !authHeader ||
        authHeader !== `Bearer ${process.env.MIGRATION_SECRET}`
      ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const db = await getDatabase();
    const migrator = new DatabaseMigrator(db);
    const status = await migrator.getStatus();

    return NextResponse.json({
      status: "ok",
      migrations: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting migration status:", error);
    return NextResponse.json(
      { error: "Failed to get migration status" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only allow in development or with proper authorization
    if (process.env.NODE_ENV === "production") {
      const authHeader = request.headers.get("authorization");
      if (
        !authHeader ||
        authHeader !== `Bearer ${process.env.MIGRATION_SECRET}`
      ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const { action, version } = await request.json();

    const db = await getDatabase();
    const migrator = new DatabaseMigrator(db);

    if (action === "migrate") {
      await migrator.runMigrations();
      return NextResponse.json({
        success: true,
        message: "Migrations completed successfully",
      });
    } else if (action === "rollback" && typeof version === "number") {
      await migrator.rollbackToVersion(version);
      return NextResponse.json({
        success: true,
        message: `Rolled back to version ${version}`,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action or missing version" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error running migration:", error);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}
