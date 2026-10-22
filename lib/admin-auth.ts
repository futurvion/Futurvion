import "server-only";
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

const scrypt = promisify(scryptCallback);
const cookieName = "futurvion_admin";
export function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }
export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, salt, hash] = encoded.split("$");
  if (algorithm !== "scrypt" || !/^[a-f0-9]{32}$/.test(salt ?? "") || !/^[a-f0-9]{128}$/.test(hash ?? "")) return false;
  const actual = await scrypt(password, Buffer.from(salt, "hex"), 64) as Buffer;
  return timingSafeEqual(actual, Buffer.from(hash, "hex"));
}
export async function adminSession() {
  const db = getDb(); const token = (await cookies()).get(cookieName)?.value;
  if (!db || !token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await db.adminSession.findUnique({ where: { sessionTokenHash: tokenHash(token) }, include: { adminUser: true } });
  if (!session || session.expiresAt <= new Date() || !session.adminUser.isActive || session.adminUser.role !== "admin") return null;
  return session;
}
export async function createSession(userId: string) {
  const db = getDb(); if (!db) throw new Error("Database unavailable");
  const token = randomBytes(32).toString("hex");
  await db.adminSession.create({ data: { adminUserId: userId, sessionTokenHash: tokenHash(token), expiresAt: new Date(Date.now() + 8 * 3600000) } });
  (await cookies()).set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 8 * 3600 });
}
export async function revokeSession() {
  const db = getDb(); const jar = await cookies(); const token = jar.get(cookieName)?.value;
  if (db && token) await db.adminSession.deleteMany({ where: { sessionTokenHash: tokenHash(token) } });
  jar.delete(cookieName);
}
export function validOrigin(request: Request) {
  if (process.env.NODE_ENV === "production" && !process.env.APP_URL) return false;
  const origin = request.headers.get("origin");
  const expected = process.env.APP_URL ? new URL(process.env.APP_URL).origin : new URL(request.url).origin;
  return origin === expected;
}
export async function authorizedMutation(request: Request) { return validOrigin(request) && Boolean(await adminSession()); }
