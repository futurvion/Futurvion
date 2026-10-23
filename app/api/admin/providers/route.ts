import { z } from "zod";
import { adminSession, authorizedMutation } from "@/features/jobs/server/admin-auth";
import { getDb } from "@/lib/db";
import { identifier, providerConfig } from "@/features/jobs/server/core";
import { readJson } from "@/lib/read-json";
export const runtime = "nodejs";
const schema = z.object({ name: z.string().trim().min(2).max(100), slug: identifier, enabled: z.boolean(), config: providerConfig, permissionConfirmed: z.literal(true) });
export async function GET() {
  if (!await adminSession()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb(); if (!db) return Response.json({ error: "Service unavailable" }, { status: 503 });
  return Response.json(await db.jobProvider.findMany({ select: { id: true, name: true, slug: true, providerType: true, enabled: true, configuration: true, lastSyncAt: true, lastSuccessAt: true, lastErrorAt: true, lastErrorSummary: true }, orderBy: { name: "asc" } }), { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: Request) {
  if (!await authorizedMutation(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await readJson(request).catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid provider configuration" }, { status: 400 });
  const db = getDb(); if (!db) return Response.json({ error: "Service unavailable" }, { status: 503 });
  try { const provider = await db.jobProvider.create({ data: { name: parsed.data.name, slug: parsed.data.slug, enabled: parsed.data.enabled, providerType: parsed.data.config.type, configuration: { ...parsed.data.config, permissionConfirmedAt: new Date().toISOString() } } }); return Response.json({ id: provider.id }, { status: 201 }); }
  catch { return Response.json({ error: "Could not save provider" }, { status: 409 }); }
}
