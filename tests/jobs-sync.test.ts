import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ getDb: vi.fn() }));
vi.mock("@/features/jobs/server/providers", () => ({ fetchProvider: vi.fn() }));
import { getDb } from "@/lib/db";
import { fetchProvider } from "@/features/jobs/server/providers";
import { syncJobs } from "@/features/jobs/server/sync";

const provider = { id: "provider-1", slug: "acme", name: "Acme", providerType: "greenhouse", configuration: { board: "acme" }, enabled: true, lastSyncAt: null, lastSuccessAt: null };
function mockDb() {
  const jobs = new Map<string, { contentHash: string }>();
  const updateMany = vi.fn(async () => ({ count: 0 }));
  const db = {
    jobSyncSettings: { findUnique: vi.fn(async () => ({ enabled: true, frequencyMinutes: 360, expireAfterDays: 14, batchSize: 10, maxConcurrency: 2, retryLimit: 0, retryDelaySeconds: 1 })), upsert: vi.fn(async () => ({})) },
    jobProvider: { findMany: vi.fn(async () => [provider]), update: vi.fn(async () => ({})) },
    jobSyncRun: { updateMany: vi.fn(async () => ({})), create: vi.fn(async ({ data }) => ({ id: "run-1", ...data })), update: vi.fn(async () => ({})) },
    job: { findMany: vi.fn(async ({ where }) => where.externalJobId.in.flatMap((externalJobId: string) => jobs.has(externalJobId) ? [{ externalJobId, ...jobs.get(externalJobId) }] : [])), upsert: vi.fn(async ({ where, create, update }) => { const key = where.sourceProviderId_externalJobId.externalJobId; jobs.set(key, { contentHash: create.contentHash ?? update.contentHash }); return {}; }), updateMany },
    $transaction: vi.fn(async (operations) => Promise.all(operations)),
  };
  vi.mocked(getDb).mockReturnValue(db as never);
  return { db, jobs, updateMany };
}
beforeEach(() => { vi.restoreAllMocks(); vi.resetAllMocks(); });
describe("jobs synchronization", () => {
  it("upserts a stable provider identity without creating a second job", async () => {
    const { db, jobs } = mockDb();
    vi.mocked(fetchProvider).mockResolvedValue({ complete: true, jobs: [{ externalJobId: "42", title: "Engineer", companyName: "Acme", workMode: "remote", applicationUrl: "https://example.com/apply" }] });
    const first = await syncJobs("manual");
    const second = await syncJobs("manual");
    expect(first).toMatchObject({ inserted: 1, updated: 0 });
    expect(second).toMatchObject({ inserted: 0, unchanged: 1 });
    expect(jobs.size).toBe(1);
    expect(db.job.upsert).toHaveBeenCalledTimes(2);
    expect(db.job.findMany).toHaveBeenCalledTimes(2);
  });
  it("does not expire jobs after a provider failure", async () => {
    const { updateMany } = mockDb();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(fetchProvider).mockRejectedValue(new Error("network down"));
    const result = await syncJobs("manual");
    expect(result.status).toBe("failed");
    expect(updateMany).not.toHaveBeenCalled();
  });
  it("rejects an overlapping run before fetching", async () => {
    const { db } = mockDb();
    db.jobSyncRun.create.mockRejectedValueOnce({ code: "P2002" });
    expect(await syncJobs("manual")).toEqual({ status: "already_running" });
    expect(fetchProvider).not.toHaveBeenCalled();
  });
});
