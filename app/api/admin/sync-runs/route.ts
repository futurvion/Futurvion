import { z } from "zod";
import { adminSession, authorizedMutation } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { syncJobs } from "@/lib/jobs/sync";
import { readJson } from "@/lib/read-json";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function GET() {
  if (!await adminSession()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb(); if (!db) return Response.json({ error: "Service unavailable" }, { status: 503 });
  return Response.json(await db.jobSyncRun.findMany({ take: 30, orderBy: { startedAt: "desc" }, include: { provider: { select: { name: true } } } }), { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: Request) {
  if (!await authorizedMutation(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = z.object({ providerId: z.uuid().optional() }).safeParse(await readJson(request).catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const db = getDb(); if (!db) return Response.json({ error: "Service unavailable" }, { status: 503 });
  const provider = parsed.data.providerId ? await db.jobProvider.findFirst({ where: { id: parsed.data.providerId, enabled: true } }) : null;
  if (parsed.data.providerId && !provider) return Response.json({ error: "Provider not found or disabled" }, { status: 404 });
  if (!parsed.data.providerId && await db.jobProvider.count({ where: { enabled: true } }) === 0) return Response.json({ error: "No enabled providers" }, { status: 400 });
  try {
    const result = await syncJobs("manual", parsed.data.providerId);
    if (result.status === "already_running") return Response.json({ error: "A synchronization is already running" }, { status: 409 });
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { console.error("Manual sync failed", error); return Response.json({ error: "Synchronization failed" }, { status: 503 }); }
}
