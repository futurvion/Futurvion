import { describe, expect, it } from "vitest";
import { readJson } from "@/lib/read-json";
describe("bounded admin request reader", () => {
  it("parses a small JSON payload", async () => {
    expect(await readJson(new Request("https://example.com", { method: "POST", body: JSON.stringify({ enabled: true }) }))).toEqual({ enabled: true });
  });
  it("rejects bodies above the configured limit", async () => {
    await expect(readJson(new Request("https://example.com", { method: "POST", body: "x".repeat(100) }), 32)).rejects.toThrow("too large");
  });
});
