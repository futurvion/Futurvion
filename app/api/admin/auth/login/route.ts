import { createHmac } from "node:crypto";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { createSession, validOrigin, verifyPassword } from "@/features/jobs/server/admin-auth";
import { readJson } from "@/lib/read-json";

export const runtime = "nodejs";
const schema = z.object({ email: z.email().max(254), password: z.string().min(1).max(200) });
export async function POST(request: Request) {
  if (!validOrigin(request)) return Response.json({ error: "Invalid request" }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 4096) return Response.json({ error: "Invalid request" }, { status: 413 });
  const parsed = schema.safeParse(await readJson(request, 4096).catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid credentials" }, { status: 401 });
  const db = getDb(); if (!db) return Response.json({ error: "Service unavailable" }, { status: 503 });
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret || authSecret.length < 32) return Response.json({ error: "Service unavailable" }, { status: 503 });
  const email = parsed.data.email.toLowerCase();
  const key = createHmac("sha256", authSecret).update(email).digest("hex");
  const recent = await db.abuseAttempt.count({ where: { key, kind: "admin-login", createdAt: { gte: new Date(Date.now() - 15 * 60000) } } });
  if (recent >= 5) return Response.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  const user = await db.adminUser.findUnique({ where: { email } });
  const valid = user?.isActive && user.role === "admin" && await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    await db.abuseAttempt.create({ data: { key, kind: "admin-login" } });
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }
  await db.adminSession.deleteMany({ where: { adminUserId: user.id, expiresAt: { lt: new Date() } } });
  await createSession(user.id);
  await db.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
