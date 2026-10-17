import { analyticsSchema } from "@/lib/validation";
import { getDb } from "@/lib/db";
import { looksLikeBot, pseudonym, requestKey, withinRateLimit } from "@/lib/security";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!process.env.DATABASE_URL || !process.env.ABUSE_HASH_SECRET) return new Response(null, { status: 204 });
  if (looksLikeBot(request) || Number(request.headers.get("content-length") || 0) > 2000) return new Response(null, { status: 204 });
  let body: unknown;
  try { body = await request.json(); } catch { return new Response(null, { status: 400 }); }
  const parsed = analyticsSchema.safeParse(body);
  if (!parsed.success) return new Response(null, { status: 400 });
  try {
    if (!await withinRateLimit(requestKey(request), "analytics", 120, 60 * 60 * 1000)) return new Response(null, { status: 429 });
    const db = getDb(); if (!db) return new Response(null, { status: 204 });
    await db.analyticsEvent.create({ data: { eventId: parsed.data.eventId, type: parsed.data.type, path: parsed.data.path, visitorKey: pseudonym(parsed.data.visitorId), sessionKey: pseudonym(parsed.data.sessionId), referrerCategory: parsed.data.referrerCategory, deviceCategory: parsed.data.deviceCategory, consent: true } });
  } catch (error) { if (typeof error === "object" && error && "code" in error && error.code === "P2002") return new Response(null, { status: 204 }); console.error("Analytics event failed", error); }
  return new Response(null, { status: 204 });
}
