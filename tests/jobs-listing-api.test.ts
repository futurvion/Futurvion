import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/jobs/server/queries", () => ({ listJobs: vi.fn() }));

import { listJobs } from "@/features/jobs/server/queries";
import { POST } from "@/app/api/jobs/route";

const mockedListJobs = vi.mocked(listJobs);

describe("POST /api/jobs", () => {
  beforeEach(() => vi.clearAllMocks());

  it("passes JSON filters and page to the server listing query", async () => {
    mockedListJobs.mockResolvedValue({ jobs: [], total: 0, page: 2, pages: 0, configured: true });
    const response = await POST(new Request("http://localhost/api/jobs", { method: "POST", body: JSON.stringify({ q: "designer", workMode: "remote", page: 2 }) }));
    expect(response.status).toBe(200);
    expect(mockedListJobs).toHaveBeenCalledWith({ q: "designer", workMode: "remote", page: "2" });
    expect(await response.json()).toMatchObject({ page: 2, configured: true });
  });

  it("rejects malformed or non-scalar filter bodies", async () => {
    const malformed = await POST(new Request("http://localhost/api/jobs", { method: "POST", body: "{" }));
    const nested = await POST(new Request("http://localhost/api/jobs", { method: "POST", body: JSON.stringify({ q: { value: "designer" } }) }));
    expect(malformed.status).toBe(400);
    expect(nested.status).toBe(400);
    expect(mockedListJobs).not.toHaveBeenCalled();
  });

  it("rejects oversized filter bodies", async () => {
    const response = await POST(new Request("http://localhost/api/jobs", { method: "POST", body: "x".repeat(4097) }));
    expect(response.status).toBe(413);
    expect(mockedListJobs).not.toHaveBeenCalled();
  });
});
