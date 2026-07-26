import { afterAll, afterEach, beforeAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// config/env exits the process when these are missing, and it is imported
// transitively by everything under test.
process.env.JWT_SECRET = "test-secret";
process.env.MONGO_URI = "mongodb://placeholder";
process.env.NODE_ENV = "test";
process.env.CLIENT_URL = "http://localhost:5173";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  const collections = await mongoose.connection.db?.collections();
  for (const collection of collections ?? []) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
