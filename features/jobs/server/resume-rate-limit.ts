import "server-only";
import { getDb } from "@/lib/db";
import { requestKey } from "@/lib/security";
import { MATCH_CONFIG } from "../matching-config";

export async function allowResumeRequest(request: Request) {
  const db = getDb();
  if (!db) return false;
  const key = requestKey(request);
  // Serialize limits for the same pseudonymous caller across instances.
  return db.$transaction(async tx => {
    await tx.$executeRaw`SET LOCAL statement_timeout = '3000ms'`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;
    const count = await tx.abuseAttempt.count({ where: { key, kind: "resume-match", createdAt: { gte: new Date(Date.now() - 3600000) } } });
    if (count >= MATCH_CONFIG.rateLimitPerHour) return false;
    await tx.abuseAttempt.create({ data: { key, kind: "resume-match" } });
    return true;
  }, { maxWait: 4000, timeout: 5000 });
}
