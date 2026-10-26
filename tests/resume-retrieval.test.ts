import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ getDb: vi.fn() }));
import { getDb } from "@/lib/db";
import { matchResumeText } from "@/features/jobs/server/resume-match";
import { allowResumeRequest } from "@/features/jobs/server/resume-rate-limit";

beforeEach(() => vi.resetAllMocks());
describe("bounded keyword retrieval", () => {
  it("uses the indexed catalogue with active/expiry checks and no candidate writes", async () => {
    const tx = { $executeRaw: vi.fn(), $queryRaw: vi.fn().mockResolvedValue([]), job: { findMany: vi.fn() } };
    vi.mocked(getDb).mockReturnValue({ $transaction: vi.fn(callback => callback(tx)) } as never);
    expect(await matchResumeText("Frontend Developer\nReact TS")).toEqual({ jobs: [], total: 0 });
    const sql = tx.$queryRaw.mock.calls[0][0].join(" ");
    expect(sql).toContain('"searchDocument" @@ websearch_to_tsquery'); expect(sql).toContain("status = 'active'");
    expect(sql).toContain('"expiresAt" > NOW()'); expect(sql).toContain("LIMIT");
    expect(tx.job.findMany).not.toHaveBeenCalled();
    expect(tx.$executeRaw.mock.calls[0][0].join("")).toContain("statement_timeout");
  });
  it("returns an empty result when no recognized matching evidence is found", async () => {
    expect(await matchResumeText("Synthetic unrelated text")).toEqual({ jobs: [], total: 0 }); expect(getDb).not.toHaveBeenCalled();
  });
  it("serializes rate limits and persists only pseudonymous abuse metadata", async () => {
    vi.stubEnv("ABUSE_HASH_SECRET", "x".repeat(32));
    const tx = { $executeRaw: vi.fn(), abuseAttempt: { count: vi.fn().mockResolvedValue(0), create: vi.fn() } };
    vi.mocked(getDb).mockReturnValue({ $transaction: vi.fn(callback => callback(tx)) } as never);
    expect(await allowResumeRequest(new Request("http://localhost"))).toBe(true);
    expect(Object.keys(tx.abuseAttempt.create.mock.calls[0][0].data).sort()).toEqual(["key", "kind"]);
    expect(tx.$executeRaw.mock.calls[1][0].join("")).toContain("pg_advisory_xact_lock");
    tx.abuseAttempt.count.mockResolvedValue(5);
    expect(await allowResumeRequest(new Request("http://localhost"))).toBe(false);
    expect(tx.abuseAttempt.create).toHaveBeenCalledTimes(1);
  });
});
