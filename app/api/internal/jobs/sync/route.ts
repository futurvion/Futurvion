import { timingSafeEqual } from "node:crypto";
import { runNextQueuedOrScheduled } from "@/lib/jobs/sync";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(request: Request) {
  const secret = process.env.JOB_SYNC_SECRET;
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!secret || secret.length < 32 || token.length !== secret.length || !timingSafeEqual(Buffer.from(token), Buffer.from(secret))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try { return Response.json(await runNextQueuedOrScheduled(), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { console.error("Scheduled sync failed", error); return Response.json({ error: "Synchronization failed" }, { status: 503 }); }
}
