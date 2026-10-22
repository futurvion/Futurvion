import { randomUUID } from "node:crypto";
import pg from "pg";
const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD_HASH } = process.env;
if (!DATABASE_URL || !ADMIN_EMAIL || !/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(ADMIN_PASSWORD_HASH ?? "")) { console.error("Set DATABASE_URL, ADMIN_EMAIL, and a valid ADMIN_PASSWORD_HASH first."); process.exit(1); }
const db = new pg.Client({ connectionString: DATABASE_URL });
try {
  await db.connect();
  const count = await db.query('SELECT count(*)::int AS count FROM "AdminUser"');
  if (count.rows[0].count) { console.error("An admin already exists. Bootstrap is disabled."); process.exitCode = 1; }
  else { await db.query('INSERT INTO "AdminUser" ("id", "email", "passwordHash", "updatedAt") VALUES ($1,$2,$3,NOW())', [randomUUID(), ADMIN_EMAIL.toLowerCase(), ADMIN_PASSWORD_HASH]); console.log("Admin created. Rotate the bootstrap password before production use."); }
} finally { await db.end(); }
