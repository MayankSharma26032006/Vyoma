/**
 * Seed script — reads existing frontend mock data and inserts into PostgreSQL.
 *
 * Usage:  npm run seed
 * Requires DATABASE_URL in server/.env to be a real connection string before running.
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve } from "path";

const prisma = new PrismaClient();

interface TopFactor {
  feature: string;
  value: string;
  impact: "high" | "medium" | "low";
}

interface Infrastructure {
  water_supply: boolean;
  electricity: boolean;
  road_access: boolean;
  shelter: boolean;
  medical_facility: boolean;
  sanitation: boolean;
}

async function main() {
  const mockDir = resolve(import.meta.dirname, "../../mockData");

  // --- Seed Villages ---
  const villagesRaw = readFileSync(resolve(mockDir, "habitations.json"), "utf-8");
  const villages: any[] = JSON.parse(villagesRaw);

  console.log(`Seeding ${villages.length} villages...`);

  for (const v of villages) {
    await prisma.village.upsert({
      where: { village_id: v.village_id },
      create: {
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
        top_factors: v.top_factors as any,
        low_confidence: v.low_confidence,
        recommended_site_id: v.recommended_site_id,
        prediction_timestamp: new Date(v.prediction_timestamp),
        model_version: v.model_version,
      },
      update: {
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
        top_factors: v.top_factors as any,
        low_confidence: v.low_confidence,
        recommended_site_id: v.recommended_site_id,
        prediction_timestamp: new Date(v.prediction_timestamp),
        model_version: v.model_version,
      },
    });
  }

  console.log(`  ✓ ${villages.length} villages upserted`);

  // --- Seed Relocation Sites ---
  const sitesRaw = readFileSync(resolve(mockDir, "relocationSites.json"), "utf-8");
  const sites: any[] = JSON.parse(sitesRaw);

  console.log(`Seeding ${sites.length} relocation sites...`);

  for (const s of sites) {
    await prisma.relocationSite.upsert({
      where: { site_id: s.site_id },
      create: {
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
        infrastructure: s.infrastructure as any,
      },
      update: {
        name: s.name,
        district: s.district,
        state: s.state,
        latitude: s.latitude,
        longitude: s.longitude,
        suitability_score: s.suitability_score,
        total_capacity: s.total_capacity,
        occupied: s.occupied,
        available: s.available,
        infrastructure: s.infrastructure as any,
      },
    });
  }

  console.log(`  ✓ ${sites.length} relocation sites upserted`);
  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
