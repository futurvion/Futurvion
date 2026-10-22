import { adminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await adminSession()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb(); if (!db) return Response.json({ error: "Service unavailable" }, { status: 503 });
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id)) return Response.json({ error: "Not found" }, { status: 404 });
  const run = await db.jobSyncRun.findUnique({ where: { id }, select: { id: true, status: true, startedAt: true, finishedAt: true, jobsFetched: true, jobsInserted: true, jobsUpdated: true, jobsUnchanged: true, jobsExpired: true, errorCount: true, errorSummary: true } });
  return Response.json(run ?? { error: "Not found" }, { status: run ? 200 : 404, headers: { "Cache-Control": "no-store" } });
}
