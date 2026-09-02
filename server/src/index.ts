/**
 * VYOMA API Server
 *
 * Express + Prisma + PostgreSQL backend.
 * Run: npm run dev (development) or npm start (production build).
 */
import "dotenv/config";
import express from "express";
import cors from "cors";

import villagesRouter from "./routes/villages.js";
import sitesRouter from "./routes/sites.js";
import dashboardRouter from "./routes/dashboard.js";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/villages", villagesRouter);
app.use("/api/sites", sitesRouter);
app.use("/api/dashboard", dashboardRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 for unmatched routes
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`\n  VYOMA API server running at http://localhost:${PORT}\n`);
  console.log("  Routes:");
  console.log("    GET /api/villages          — list villages");
  console.log("    GET /api/villages/:id      — single village");
  console.log("    GET /api/sites             — list relocation sites");
  console.log("    GET /api/sites/:id         — single site");
  console.log("    GET /api/dashboard         — aggregate stats");
  console.log("    GET /api/health            — health check\n");
});
