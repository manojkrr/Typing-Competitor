import "dotenv/config";
import { type Db, MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

if (!process.env.DATABASE_NAME) {
  throw new Error('Invalid/Missing environment variable: "DATABASE_NAME"');
}

const uri = process.env.MONGODB_URI;

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable to avoid creating multiple connections
  // This is useful for hot reloading in Next.js
  // HMR (Hot Module Replacement) can cause the module to be reloaded multiple times,
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
    console.log("MongoDB client initialized in development mode");
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, create a new MongoClient instance
  const client = new MongoClient(uri);
  clientPromise = client.connect();
  console.log("MongoDB client initialized in production mode");
}

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db(process.env.DATABASE_NAME);
}
