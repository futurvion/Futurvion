import pg from "pg";
const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD_HASH } = process.env;
if (!DATABASE_URL || !ADMIN_EMAIL || !/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(ADMIN_PASSWORD_HASH ?? "")) { console.error("Set DATABASE_URL, ADMIN_EMAIL, and a valid new ADMIN_PASSWORD_HASH first."); process.exit(1); }
const db = new pg.Client({ connectionString: DATABASE_URL });
let transactionStarted = false;
try {
  await db.connect();
  await db.query("BEGIN");
  transactionStarted = true;
  const result = await db.query('UPDATE "AdminUser" SET "passwordHash"=$1, "updatedAt"=NOW() WHERE "email"=$2 RETURNING "id"', [ADMIN_PASSWORD_HASH, ADMIN_EMAIL.toLowerCase()]);
  if (result.rowCount !== 1) throw new Error("Admin not found");
  await db.query('DELETE FROM "AdminSession" WHERE "adminUserId"=$1', [result.rows[0].id]);
  await db.query("COMMIT");
  console.log("Admin password rotated and sessions revoked.");
} catch (error) { if (transactionStarted) await db.query("ROLLBACK").catch(() => {}); console.error(error instanceof Error ? error.message : "Password rotation failed"); process.exitCode = 1; }
finally { await db.end().catch(() => {}); }
