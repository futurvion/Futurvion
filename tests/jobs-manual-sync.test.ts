import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/admin-auth", () => ({ adminSession: vi.fn(), authorizedMutation: vi.fn() }));
vi.mock("@/lib/db", () => ({ getDb: vi.fn() }));
vi.mock("@/lib/jobs/sync", () => ({ syncJobs: vi.fn() }));

import { authorizedMutation } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { syncJobs } from "@/lib/jobs/sync";
import { POST } from "@/app/api/admin/sync-runs/route";

const db = { jobProvider: { count: vi.fn(), findFirst: vi.fn() } };
const request = (body: object) => new Request("http://localhost:3000/api/admin/sync-runs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(authorizedMutation).mockResolvedValue(true);
  vi.mocked(getDb).mockReturnValue(db as never);
  db.jobProvider.count.mockResolvedValue(1);
  db.jobProvider.findFirst.mockResolvedValue({ id: "provider-1" });
});

describe("manual job synchronization", () => {
  it("runs enabled providers immediately and returns the completed result", async () => {
    vi.mocked(syncJobs).mockResolvedValue({ status: "succeeded", runId: "run-1", fetched: 1, inserted: 1, updated: 0, unchanged: 0, expired: 0, errors: 0 });
    const response = await POST(request({}));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: "succeeded", inserted: 1 });
    expect(syncJobs).toHaveBeenCalledWith("manual", undefined);
  });

  it("rejects a request with no enabled providers", async () => {
    db.jobProvider.count.mockResolvedValue(0);
    const response = await POST(request({}));
    expect(response.status).toBe(400);
    expect(syncJobs).not.toHaveBeenCalled();
  });

  it("reports an overlapping run as a conflict", async () => {
    vi.mocked(syncJobs).mockResolvedValue({ status: "already_running" });
    const response = await POST(request({}));
    expect(response.status).toBe(409);
  });
});
