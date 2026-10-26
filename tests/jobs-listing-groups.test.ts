import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ getDb: vi.fn() }));
import { getDb } from "@/lib/db";
import { listQuery } from "@/features/jobs/server/core";
import { jobListingFilter, listJobs } from "@/features/jobs/server/queries";

beforeEach(() => vi.resetAllMocks());

describe("grouped public jobs", () => {
  it("keeps user input parameterized and treats SQL wildcards as literal search text", () => {
    const text = "x%' OR TRUE --_";
    const filter = jobListingFilter(listQuery.parse({ q: text, company: "A\\B" }));
    expect(filter.sql).not.toContain(text);
    expect(filter.values).toEqual(["%x\\%' OR TRUE --\\_%", "%x\\%' OR TRUE --\\_%", "%x\\%' OR TRUE --\\_%", "%A\\\\B%"]);
    expect(filter.sql).toContain('j."status" = \'active\'');
  });

  it("retains every existing filter, including salary bounds and provider type", () => {
    const filter = jobListingFilter(listQuery.parse({ company: "Acme", location: "London", workMode: "remote", employmentType: "Contract", category: "Engineering", experienceLevel: "Senior", source: "lever", postedWithin: 7, salaryMin: 100, salaryMax: 200, salaryCurrency: "USD" }));
    expect(filter.values).toEqual(["%Acme%", "%London%", "remote", "%Contract%", "%Engineering%", "%Senior%", "lever", expect.any(Date), 100, 200, "USD"]);
    expect(filter.sql).toContain('j."salaryMax" >= ?');
    expect(filter.sql).toContain('j."salaryMin" <= ?');
  });

  it("paginates unique listing IDs and counts groups, then preserves ranked order without exposing IDs", async () => {
    const raw = vi.fn().mockResolvedValueOnce([{ id: "b" }, { id: "a" }]).mockResolvedValueOnce([{ total: 14 }]);
    const findMany = vi.fn().mockResolvedValue([{ id: "a", slug: "first" }, { id: "b", slug: "second" }]);
    vi.mocked(getDb).mockReturnValue({ $queryRaw: raw, job: { findMany } } as never);
    const result = await listJobs({ page: "2", source: "greenhouse" });
    expect(result).toMatchObject({ total: 14, page: 2, pages: 2, jobs: [{ slug: "second" }, { slug: "first" }] });
    const pageSql = raw.mock.calls[0][0];
    expect(pageSql.sql).toContain('PARTITION BY j."listingKey"');
    expect(pageSql.sql).toContain('j."lastVerifiedAt" DESC NULLS LAST');
    expect(pageSql.sql).toContain('"createdAt" DESC, "id" ASC');
    expect(pageSql.values).toEqual(["greenhouse", 12]);
    expect(raw.mock.calls[1][0].sql).toContain('COUNT(DISTINCT j."listingKey")');
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: { in: ["b", "a"] } } }));
    expect(result.jobs.every(job => !("id" in job) && !("listingKey" in job))).toBe(true);
  });

  it("keeps the total for an empty page beyond the last group without fetching all records", async () => {
    const raw = vi.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([{ total: 2 }]);
    const findMany = vi.fn();
    vi.mocked(getDb).mockReturnValue({ $queryRaw: raw, job: { findMany } } as never);
    expect(await listJobs({ page: "3" })).toMatchObject({ jobs: [], total: 2, page: 3, pages: 1 });
    expect(findMany).not.toHaveBeenCalled();
  });

  it("preserves the unconfigured-database response", async () => {
    vi.mocked(getDb).mockReturnValue(null);
    expect(await listJobs({})).toEqual({ jobs: [], total: 0, page: 1, pages: 0, configured: false });
  });
});
