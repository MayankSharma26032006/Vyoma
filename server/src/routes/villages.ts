/**
 * Villages routes — GET /api/villages, GET /api/villages/:id
 *
 * Returns JSON shaped exactly like mockData/habitations.json so the frontend
 * can swap over with minimal changes.
 */
import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

// GET /api/villages — list all, with optional ?district= and ?risk_level= filters
router.get("/", async (req: Request, res: Response) => {
  try {
    const { district, risk_level, state, relocation_priority } = req.query;

    const where: Record<string, any> = {};
    if (typeof district === "string") where.district = district;
    if (typeof state === "string") where.state = state;
    if (typeof risk_level === "string") where.risk_level = risk_level;
    if (typeof relocation_priority === "string") where.relocation_priority = relocation_priority;

    const villages = await prisma.village.findMany({
      where,
      orderBy: { risk_score: "desc" },
    });

    // Map Prisma output back to mock file shape
    const response = villages.map((v) => ({
      village_id: v.village_id,
      name: v.name,
      district: v.district,
      state: v.state,
      latitude: v.latitude,
      longitude: v.longitude,
      population: v.population,
      risk_score: v.risk_score,
      risk_level: v.risk_level,
      relocation_priority: v.relocation_priority,
      vulnerability_multiplier: v.vulnerability_multiplier,
      top_factors: v.top_factors,
      low_confidence: v.low_confidence,
      recommended_site_id: v.recommended_site_id,
      prediction_timestamp: v.prediction_timestamp.toISOString(),
      model_version: v.model_version,
    }));

    res.json(response);
  } catch (error) {
    console.error("GET /api/villages error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/villages/:id — single village by village_id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const village = await prisma.village.findUnique({
      where: { village_id: id },
    });

    if (!village) {
      res.status(404).json({ error: "Village not found", village_id: id });
      return;
    }

    const response = {
      village_id: village.village_id,
      name: village.name,
      district: village.district,
      state: village.state,
      latitude: village.latitude,
      longitude: village.longitude,
      population: village.population,
      risk_score: village.risk_score,
      risk_level: village.risk_level,
      relocation_priority: village.relocation_priority,
      vulnerability_multiplier: village.vulnerability_multiplier,
      top_factors: village.top_factors,
      low_confidence: village.low_confidence,
      recommended_site_id: village.recommended_site_id,
      prediction_timestamp: village.prediction_timestamp.toISOString(),
      model_version: village.model_version,
    };

    res.json(response);
  } catch (error) {
    console.error("GET /api/villages/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
