/**
 * Dashboard route — GET /api/dashboard
 *
 * Returns aggregate stats computed from the villages and sites tables.
 * Shape designed to match the stat cards on the Dashboard page.
 */
import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { district, state } = req.query;

    const villageWhere: Record<string, any> = {};
    if (typeof district === "string") villageWhere.district = district;
    if (typeof state === "string") villageWhere.state = state;

    const siteWhere: Record<string, any> = {};
    if (typeof district === "string") siteWhere.district = district;
    if (typeof state === "string") siteWhere.state = state;

    // Run all queries in parallel
    const [
      totalVillages,
      redCount,
      orangeCount,
      greenCount,
      immediateCount,
      shortTermCount,
      mediumTermCount,
      routineCount,
      populationAgg,
      siteCount,
      totalCapacityAgg,
      occupiedAgg,
      lowConfidenceCount,
    ] = await Promise.all([
      prisma.village.count({ where: villageWhere }),
      prisma.village.count({ where: { ...villageWhere, risk_level: "RED" } }),
      prisma.village.count({ where: { ...villageWhere, risk_level: "ORANGE" } }),
      prisma.village.count({ where: { ...villageWhere, risk_level: "GREEN" } }),
      prisma.village.count({ where: { ...villageWhere, relocation_priority: "IMMEDIATE" } }),
      prisma.village.count({ where: { ...villageWhere, relocation_priority: "SHORT-TERM" } }),
      prisma.village.count({ where: { ...villageWhere, relocation_priority: "MEDIUM-TERM" } }),
      prisma.village.count({ where: { ...villageWhere, relocation_priority: "ROUTINE" } }),
      prisma.village.aggregate({
        where: villageWhere,
        _sum: { population: true },
      }),
      prisma.relocationSite.count({ where: siteWhere }),
      prisma.relocationSite.aggregate({
        where: siteWhere,
        _sum: { total_capacity: true },
      }),
      prisma.relocationSite.aggregate({
        where: siteWhere,
        _sum: { occupied: true },
      }),
      prisma.village.count({ where: { ...villageWhere, low_confidence: true } }),
    ]);

    const populationAtRisk =
      redCount + orangeCount > 0
        ? (
            await prisma.village.aggregate({
              where: { ...villageWhere, risk_level: { in: ["RED", "ORANGE"] } },
              _sum: { population: true },
            })
          )._sum.population ?? 0
        : 0;

    const availableCapacity =
      (totalCapacityAgg._sum.total_capacity ?? 0) - (occupiedAgg._sum.occupied ?? 0);

    const avgRiskScore =
      (
        await prisma.village.aggregate({
          where: villageWhere,
          _avg: { risk_score: true },
        })
      )._avg.risk_score ?? 0;

    res.json({
      total_villages: totalVillages,
      risk_level: {
        RED: redCount,
        ORANGE: orangeCount,
        GREEN: greenCount,
      },
      relocation_priority: {
        IMMEDIATE: immediateCount,
        "SHORT-TERM": shortTermCount,
        "MEDIUM-TERM": mediumTermCount,
        ROUTINE: routineCount,
      },
      population_at_risk: populationAtRisk,
      total_population: populationAgg._sum.population ?? 0,
      avg_risk_score: Math.round(avgRiskScore * 100) / 100,
      low_confidence_count: lowConfidenceCount,
      sites: {
        total: siteCount,
        total_capacity: totalCapacityAgg._sum.total_capacity ?? 0,
        occupied: occupiedAgg._sum.occupied ?? 0,
        available: availableCapacity,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
