import "server-only";
import { createHmac } from "node:crypto";
import { getDb } from "./db";

export function pseudonym(value: string): string {
  const secret = process.env.ABUSE_HASH_SECRET;
  if (!secret || secret.length < 32) throw new Error("ABUSE_HASH_SECRET must contain at least 32 characters");
  return createHmac("sha256", secret).update(value).digest("hex");
}
export function requestKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return pseudonym(forwarded || "unknown");
}
export async function withinRateLimit(key: string, kind: string, max: number, windowMs: number): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  const since = new Date(Date.now() - windowMs);
  const count = await db.abuseAttempt.count({ where: { key, kind, createdAt: { gte: since } } });
  if (count >= max) return false;
  await db.abuseAttempt.create({ data: { key, kind } });
  return true;
}
export function looksLikeBot(request: Request): boolean { return /bot|crawler|spider|headless|monitor|lighthouse/i.test(request.headers.get("user-agent") || ""); }
