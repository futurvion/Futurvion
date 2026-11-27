import { randomUUID } from "node:crypto";
import pg from "pg";
import { resolveJobLocations } from "../features/jobs/server/city-data.mjs";

if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before backfilling public job locations.");
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
let cursor = null, jobs = 0, located = 0, locations = 0;
try {
  await db.connect();
  for (;;) {
    await db.query("BEGIN");
    try {
      const batch = await db.query('SELECT id,location,"workMode","countryCode" FROM "Job" WHERE ($1::uuid IS NULL OR id > $1::uuid) ORDER BY id LIMIT 100 FOR UPDATE', [cursor]);
      if (!batch.rows.length) { await db.query("COMMIT"); break; }
      const pointsToWrite = [];
      for (const job of batch.rows) {
        const points = resolveJobLocations(job);
        for (const point of points) pointsToWrite.push({ id: randomUUID(), jobId: job.id, ...point });
        jobs++; locations += points.length; if (points.length) located++;
      }
      await db.query('DELETE FROM "JobLocation" WHERE "jobId"=ANY($1::uuid[])', [batch.rows.map(job => job.id)]);
      if (pointsToWrite.length) await db.query(`INSERT INTO "JobLocation" (id,"jobId","cityKey",city,region,"countryCode",latitude,longitude)
        SELECT id,"jobId","cityKey",city,region,"countryCode",latitude,longitude FROM jsonb_to_recordset($1::jsonb)
        AS x(id uuid,"jobId" uuid,"cityKey" text,city text,region text,"countryCode" text,latitude float8,longitude float8)`, [JSON.stringify(pointsToWrite)]);
      cursor = batch.rows.at(-1).id;
      await db.query("COMMIT");
    } catch (error) { await db.query("ROLLBACK"); throw error; }
  }
  console.log({ jobsReviewed: jobs, jobsWithCityLocations: located, cityLocations: locations });
} finally { await db.end(); }
