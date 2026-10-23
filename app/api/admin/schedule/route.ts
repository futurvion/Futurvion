import { adminSession, authorizedMutation } from "@/features/jobs/server/admin-auth";
import { getDb } from "@/lib/db";
import { scheduleSchema } from "@/features/jobs/server/core";
import { readJson } from "@/lib/read-json";
export const runtime = "nodejs";
export async function GET() {
  if (!await adminSession()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb(); if (!db) return Response.json({ error: "Service unavailable" }, { status: 503 });
  return Response.json(await db.jobSyncSettings.findUnique({ where: { id: 1 } }), { headers: { "Cache-Control": "no-store" } });
}
export async function PATCH(request: Request) {
  if (!await authorizedMutation(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = scheduleSchema.safeParse(await readJson(request).catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid schedule" }, { status: 400 });
  const db = getDb(); if (!db) return Response.json({ error: "Service unavailable" }, { status: 503 });
  const session = await adminSession();
  const nextScheduledRunAt = parsed.data.enabled ? new Date(Date.now() + parsed.data.frequencyMinutes * 60000) : null;
  const settings = await db.jobSyncSettings.upsert({ where: { id: 1 }, create: { ...parsed.data, nextScheduledRunAt, updatedBy: session?.adminUser.email }, update: { ...parsed.data, nextScheduledRunAt, updatedBy: session?.adminUser.email } });
  return Response.json(settings, { headers: { "Cache-Control": "no-store" } });
}
