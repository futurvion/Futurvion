import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { fetchProvider } from "@/lib/jobs/providers";

beforeEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
describe("provider adapters", () => {
  it("attributes Remotive and retains its source URL", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ jobs: [{ id: 7, title: "Designer", company_name: "Studio", url: "https://remotive.com/remote-jobs/7", description: "<p>Design</p>", job_type: "full_time" }] }), { status: 200 })));
    const result = await fetchProvider({ type: "remotive" }, "Remotive", 0);
    expect(result.complete).toBe(true);
    expect(result.jobs[0]).toMatchObject({ externalJobId: "7", companyName: "Studio", descriptionText: "Design", applicationUrl: "https://remotive.com/remote-jobs/7", employmentType: "full-time" });
  });
  it("uses an explicit Greenhouse board and marks malformed feeds incomplete", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ jobs: [{ id: 8, title: "Engineer", absolute_url: "https://boards.greenhouse.io/acme/jobs/8", content: "<p>Build</p>", updated_at: "2026-10-20T00:00:00Z" }, { id: 9, title: "Broken", absolute_url: "javascript:bad" }] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await fetchProvider({ type: "greenhouse", board: "acme" }, "Acme", 0);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/boards/acme/jobs?content=true"), expect.anything());
    expect(result.complete).toBe(false);
    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0].publishedAt).toBeUndefined();
  });
  it("normalizes Lever hosted application links and work mode", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify([{ id: "a", text: "Analyst", applyUrl: "https://jobs.lever.co/acme/a/apply", workplaceType: "hybrid", categories: { location: "London", commitment: "Full-time" }, descriptionPlain: "Analyze" }]), { status: 200 })));
    const result = await fetchProvider({ type: "lever", site: "acme", region: "global" }, "Acme", 0);
    expect(result.complete).toBe(true);
    expect(result.jobs[0]).toMatchObject({ workMode: "hybrid", location: "London", employmentType: "Full-time" });
  });
});
