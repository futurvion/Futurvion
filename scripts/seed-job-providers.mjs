import { randomUUID } from "node:crypto";
import pg from "pg";

const providers = [
  { name: "Remotive", slug: "remotive", type: "remotive", configuration: { type: "remotive" } },
  { name: "Figma", slug: "figma-greenhouse", type: "greenhouse", configuration: { type: "greenhouse", board: "figma" } },
  { name: "Twilio", slug: "twilio-greenhouse", type: "greenhouse", configuration: { type: "greenhouse", board: "twilio" } },
  { name: "APPLY Digital", slug: "applydigital-lever", type: "lever", configuration: { type: "lever", site: "applydigital", region: "global" } },
];

if (!process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL before seeding job providers.");
  process.exit(1);
}

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await db.connect();
  let added = 0;
  for (const provider of providers) {
    const result = await db.query(
      'INSERT INTO "JobProvider" ("id", "name", "slug", "providerType", "enabled", "configuration", "updatedAt") VALUES ($1, $2, $3, $4, TRUE, $5::jsonb, NOW()) ON CONFLICT ("slug") DO NOTHING',
      [randomUUID(), provider.name, provider.slug, provider.type, JSON.stringify(provider.configuration)],
    );
    added += result.rowCount;
  }
  await db.query('INSERT INTO "JobSyncSettings" ("id", "enabled", "batchSize", "updatedAt") VALUES (1, TRUE, 25, NOW()) ON CONFLICT ("id") DO NOTHING');
  console.log(`Added ${added} public job providers. Existing provider and schedule settings were preserved.`);
} finally {
  await db.end();
}
