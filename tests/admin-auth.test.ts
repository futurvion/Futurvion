import { describe, expect, it, vi } from "vitest";
import { scryptSync } from "node:crypto";
vi.mock("server-only", () => ({}));
import { validOrigin, verifyPassword } from "@/features/jobs/server/admin-auth";

describe("admin authentication helpers", () => {
  it("verifies a scrypt hash and rejects a wrong password", async () => {
    const salt = "0123456789abcdef0123456789abcdef";
    const hash = `scrypt$${salt}$${scryptSync("a strong password", Buffer.from(salt, "hex"), 64).toString("hex")}`;
    expect(await verifyPassword("a strong password", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
    expect(await verifyPassword("anything", "plaintext")).toBe(false);
  });
  it("requires a matching mutation origin", () => {
    const request = new Request("https://example.com/api/admin/schedule", { method: "PATCH", headers: { Origin: "https://evil.example" } });
    expect(validOrigin(request)).toBe(false);
    expect(validOrigin(new Request("https://example.com/api/admin/schedule", { method: "PATCH", headers: { Origin: "https://example.com" } }))).toBe(true);
  });
});
