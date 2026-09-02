/**
 * Sites routes — GET /api/sites, GET /api/sites/:id
 *
 * Returns JSON shaped exactly like mockData/relocationSites.json.
 */
import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

// GET /api/sites — list all, with optional ?district= filter
router.get("/", async (req: Request, res: Response) => {
  try {
    const { district, state } = req.query;

    const where: Record<string, any> = {};
    if (typeof district === "string") where.district = district;
    if (typeof state === "string") where.state = state;

    const sites = await prisma.relocationSite.findMany({
      where,
      orderBy: { suitability_score: "desc" },
    });

    const response = sites.map((s) => ({
      site_id: s.site_id,
      name: s.name,
      district: s.district,
      state: s.state,
      latitude: s.latitude,
      longitude: s.longitude,
      suitability_score: s.suitability_score,
      total_capacity: s.total_capacity,
      occupied: s.occupied,
      available: s.available,
      infrastructure: s.infrastructure,
    }));

    res.json(response);
  } catch (error) {
    console.error("GET /api/sites error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/sites/:id — single site by site_id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const site = await prisma.relocationSite.findUnique({
      where: { site_id: id },
    });

    if (!site) {
      res.status(404).json({ error: "Relocation site not found", site_id: id });
      return;
    }

    const response = {
      site_id: site.site_id,
      name: site.name,
      district: site.district,
      state: site.state,
      latitude: site.latitude,
      longitude: site.longitude,
      suitability_score: site.suitability_score,
      total_capacity: site.total_capacity,
      occupied: site.occupied,
      available: site.available,
      infrastructure: site.infrastructure,
    };

    res.json(response);
  } catch (error) {
    console.error("GET /api/sites/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
