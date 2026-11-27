import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/features/jobs/server/queries", () => ({ listJobs: vi.fn() }));
import { listJobs } from "@/features/jobs/server/queries";
import { GET, POST } from "@/app/api/jobs/route";
import { POST as cities } from "@/app/api/jobs/locations/route";
beforeEach(() => vi.resetAllMocks());
describe("nearby jobs API privacy", () => {
  it("accepts numeric nearby values through POST and disables caching", async () => {
    vi.mocked(listJobs).mockResolvedValue({ jobs: [], total: 0, page: 1, pages: 0, configured: true });
    const response = await POST(new Request("http://localhost/api/jobs", { method: "POST", body: JSON.stringify({ nearLat: 51.5, nearLng: -0.12, radiusKm: 25 }) }));
    expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toBe("no-store");
    expect(listJobs).toHaveBeenCalledWith({ nearLat: "51.5", nearLng: "-0.12", radiusKm: "25" });
  });
  it("requires POST for nearby origins", async () => {
    expect((await GET(new Request("http://localhost/api/jobs?nearLat=51&nearLng=0"))).status).toBe(400);
    expect(listJobs).not.toHaveBeenCalled();
  });
  it("does not log database error messages containing a search origin", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(listJobs).mockRejectedValue(new Error("PRIVATE_ORIGIN 51.5 -0.12"));
    const result = await POST(new Request("http://localhost/api/jobs", { method: "POST", body: "{}" }));
    expect(result.status).toBe(503); expect(JSON.stringify(log.mock.calls)).not.toContain("PRIVATE_ORIGIN");
    log.mockRestore();
  });
  it("returns bounded city choices using a noncached POST", async () => {
    const response = await cities(new Request("http://localhost/api/jobs/locations", { method: "POST", body: JSON.stringify({ query: "London, UK" }) }));
    expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toBe("no-store");
    expect((await response.json()).cities[0].countryCode).toBe("GB");
  });
  it("rejects invalid and oversized city lookups", async () => {
    expect((await cities(new Request("http://localhost", { method: "POST", body: JSON.stringify({ query: "x" }) }))).status).toBe(400);
    expect((await cities(new Request("http://localhost", { method: "POST", body: "x".repeat(513) }))).status).toBe(413);
  });
});
