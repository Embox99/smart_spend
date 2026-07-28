import type { ErrorRequestHandler } from "express";
import AppError from "../utils/AppError";
import { env } from "../config/env";

interface MongoLikeError {
  code?: number;
  name?: string;
}

const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`,
    message
  );

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  const { code, name } = (err ?? {}) as MongoLikeError;

  // Duplicate key — the only Mongo error that maps cleanly onto a 4xx.
  if (code === 11000) {
    res.status(409).json({ message: "Resource already exists" });
    return;
  }

  if (name === "ValidationError") {
    res.status(400).json({ message });
    return;
  }

  if (name === "CastError") {
    res.status(400).json({ message: "Malformed identifier" });
    return;
  }

  if (name === "MulterError") {
    const isTooLarge = (err as { code?: string }).code === "LIMIT_FILE_SIZE";
    res.status(400).json({
      message: isTooLarge ? "File is larger than 2 MB" : "Upload rejected",
    });
    return;
  }

  // Unknown failure — log the stack, tell the client nothing.
  if (env.NODE_ENV !== "production" && err instanceof Error) {
    console.error(err.stack);
  }
  res.status(500).json({ message: "Internal Server Error" });
};

export default errorHandler;
