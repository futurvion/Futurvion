import { z } from "zod";
import { authorizedMutation } from "@/features/jobs/server/admin-auth";
import { getDb } from "@/lib/db";
import { providerConfig } from "@/features/jobs/server/core";
import { readJson } from "@/lib/read-json";
export const runtime = "nodejs";
const schema = z.object({ name: z.string().trim().min(2).max(100).optional(), enabled: z.boolean().optional(), config: providerConfig.optional(), permissionConfirmed: z.literal(true).optional() }).refine(value => !value.config || value.permissionConfirmed === true);
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await authorizedMutation(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await readJson(request).catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid provider configuration" }, { status: 400 });
  const db = getDb(); if (!db) return Response.json({ error: "Service unavailable" }, { status: 503 });
  const { id } = await params;
  try { await db.jobProvider.update({ where: { id }, data: { name: parsed.data.name, enabled: parsed.data.enabled, ...(parsed.data.config && { providerType: parsed.data.config.type, configuration: { ...parsed.data.config, permissionConfirmedAt: new Date().toISOString() } }) } }); return Response.json({ ok: true }); }
  catch { return Response.json({ error: "Provider not found" }, { status: 404 }); }
}
