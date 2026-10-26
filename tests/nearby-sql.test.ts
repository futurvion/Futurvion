import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { Prisma } from "@/generated/prisma/client";
import { nearbyQuery } from "@/features/jobs/server/nearby-query";
import { getDb } from "@/lib/db";
import { resolveJobLocations } from "@/features/jobs/server/city-search";

// Opt in explicitly: every fixture is in session-local TEMP tables and rolled back.
describe.skipIf(process.env.RUN_NEARBY_DB_TESTS !== "1")("nearby SQL on PostgreSQL", () => {
  let db: Client;
  const providerId = randomUUID();
  async function add(title: string, points: [number, number, string][], options: { key?: string; status?: string; mode?: string; expired?: boolean } = {}) {
    const id = randomUUID();
    await db.query('INSERT INTO "Job" (id,title,"listingKey",status,"workMode","sourceProviderId","expiresAt") VALUES ($1,$2,$3,$4,$5,$6,$7)', [id,title,options.key ?? title,options.status ?? "active",options.mode ?? "onsite",providerId,options.expired ? new Date(0) : null]);
    for (const [latitude, longitude, city] of points) await db.query('INSERT INTO "JobLocation" ("jobId",latitude,longitude,city) VALUES ($1,$2,$3,$4)', [id,latitude,longitude,city]);
    return id;
  }
  beforeAll(async () => {
    (await import("dotenv")).config({ quiet: true });
    db = new Client({ connectionString: process.env.DATABASE_URL }); await db.connect(); await db.query("BEGIN");
    await db.query(`
      CREATE TEMP TABLE "JobProvider" (id uuid, "providerType" text) ON COMMIT DROP;
      CREATE TEMP TABLE "Job" (id uuid,title text,"listingKey" text,status text,"workMode" text,"sourceProviderId" uuid,"expiresAt" timestamptz,
        "publishedAt" timestamptz DEFAULT now(),"createdAt" timestamptz DEFAULT now(),"lastVerifiedAt" timestamptz DEFAULT now()) ON COMMIT DROP;
      CREATE TEMP TABLE "JobLocation" ("jobId" uuid,latitude float8,longitude float8,city text) ON COMMIT DROP;
    `);
    await db.query('INSERT INTO "JobProvider" VALUES ($1,\'greenhouse\')', [providerId]);
    await add("London", [[51.5074,-0.1278,"London"]], { key: "duplicate" });
    await add("Duplicate source", [[51.52,-0.12,"London"]], { key: "duplicate" });
    await add("North", [[51.6,-0.12,"London"]]);
    await add("Paris", [[48.8566,2.3522,"Paris"]]);
    await add("Remote", [[51.5074,-0.1278,"London"]], { mode: "remote" });
    await add("Inactive", [[51.5074,-0.1278,"London"]], { status: "archived" });
    await add("Expired", [[51.5074,-0.1278,"London"]], { expired: true });
    await add("Unresolved", []);
    await add("Two offices", [[48.8566,2.3522,"Paris"],[51.5074,-0.3,"London"]]);
    await add("Inside", [[51.5074 + 24 / 6371.0088 * 180 / Math.PI,-0.1278,"London"]]);
    await add("Outside", [[51.5074 + 26 / 6371.0088 * 180 / Math.PI,-0.1278,"London"]]);
    await add("Date line", [[0,-179.9,"Synthetic east"]]);
    await add("Polar", [[89.9,-90,"Synthetic pole"]]);
  }, 30_000);
  afterAll(async () => { if (db) { await db.query("ROLLBACK"); await db.end(); } });
  async function search(lat: number, lng: number, radius: number) {
    const sql = Prisma.sql`${nearbyQuery(Prisma.sql`j.status = 'active'`, lat, lng, radius)} SELECT id,city,"distanceKm" FROM ranked WHERE position=1 ORDER BY "distanceKm",id`;
    return (await db.query(sql.text, sql.values)).rows;
  }
  it("filters by actual distance, excludes remote/inactive/expired/unresolved jobs, and deduplicates", async () => {
    const rows = await search(51.5074,-0.1278,25);
    expect(rows).toHaveLength(4); expect(Number(rows[0].distanceKm)).toBeCloseTo(0, 5);
    expect(rows.every(row => row.city === "London" && Number(row.distanceKm) <= 25)).toBe(true);
    expect(rows.map(row => Number(row.distanceKm))).toEqual(rows.map(row => Number(row.distanceKm)).sort((a,b) => a-b));
    expect(await search(51.5074,-0.1278,5)).toHaveLength(1);
  });
  it("finds jobs across the international date line", async () => {
    const rows = await search(0,179.9,50); expect(rows).toHaveLength(1);
    expect(Number(rows[0].distanceKm)).toBeCloseTo(22.24, 1);
  });
  it("finds jobs across a pole", async () => {
    expect(await search(89.9,90,50)).toHaveLength(1);
  });
  it("refreshes nested locations with a source edit and rolls back the integration check", async () => {
    const prisma = getDb(); expect(prisma).not.toBeNull();
    try {
      const original = await prisma!.job.findFirst({ where: { locations: { some: {} } }, include: { locations: true } });
      expect(original).not.toBeNull();
      const location = original!.location === "Paris, France" ? "London, England" : "Paris, France";
      const points = resolveJobLocations({ location, workMode: "hybrid" });
      await expect(prisma!.$transaction(async tx => {
        await tx.job.update({ where: { id: original!.id }, data: { location, workMode: "hybrid", locations: { deleteMany: {}, create: points } } });
        const current = await tx.jobLocation.findMany({ where: { jobId: original!.id } });
        expect(current).toHaveLength(1); expect(current[0].city).toBe(points[0].city);
        throw new Error("ROLLBACK_NEARBY_CHECK");
      }, { timeout: 15000 })).rejects.toThrow("ROLLBACK_NEARBY_CHECK");
      expect(await prisma!.job.findUnique({ where: { id: original!.id } })).toMatchObject({ location: original!.location, workMode: original!.workMode });
      expect((await prisma!.jobLocation.findMany({ where: { jobId: original!.id } })).map(point => point.id).sort()).toEqual(original!.locations.map(point => point.id).sort());
    } finally { await prisma?.$disconnect(); }
  }, 30_000);
});
