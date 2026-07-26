// Validates and loads configuration before anything else touches process.env.
import { env } from "./config/env";
import mongoose from "mongoose";
import connectDB from "./config/db";
import app from "./app";

const start = async (): Promise<void> => {
  await connectDB();

  const server = app.listen(env.PORT, () =>
    console.log(`Server running on port ${env.PORT}`)
  );

  const shutdown = (signal: string): void => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
    // Don't wait forever on in-flight requests.
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  process.exit(1);
});

void start();
