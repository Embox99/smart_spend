import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes";
import incomeRoutes from "./routes/incomeRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import budgetRoutes from "./routes/budgetRoutes";
import errorHandler from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiters";
import { UPLOAD_DIR } from "./middleware/uploadMiddleware";
import { env } from "./config/env";

const app = express();

// Behind a proxy (Render, Railway, Heroku) rate limiting needs the real IP.
if (env.TRUST_PROXY) app.set("trust proxy", 1);

app.use(
  helmet({
    // Uploaded avatars are embedded by the SPA on a different origin.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const allowedOrigins = env.CLIENT_URL
  ? env.CLIENT_URL.split(",").map((o) => o.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "100kb" }));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
  });
});

app.use("/api", apiLimiter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/budget", budgetRoutes);

app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "1d" }));

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

export default app;
