import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("@/features/jobs/server/sync", () => ({ runNextQueuedOrScheduled: vi.fn(async () => ({ status: "not_due" })) }));
import { POST } from "@/app/api/internal/jobs/sync/route";
import { runNextQueuedOrScheduled } from "@/features/jobs/server/sync";
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
describe("scheduler authorization", () => {
  it("rejects requests without a configured strong secret", async () => {
    vi.stubEnv("JOB_SYNC_SECRET", "short");
    expect((await POST(new Request("https://example.com", { method: "POST", headers: { Authorization: "Bearer short" } }))).status).toBe(401);
    expect(runNextQueuedOrScheduled).not.toHaveBeenCalled();
  });
  it("accepts only the configured bearer token", async () => {
    vi.stubEnv("JOB_SYNC_SECRET", "a".repeat(32));
    expect((await POST(new Request("https://example.com", { method: "POST", headers: { Authorization: `Bearer ${"b".repeat(32)}` } }))).status).toBe(401);
    expect((await POST(new Request("https://example.com", { method: "POST", headers: { Authorization: `Bearer ${"a".repeat(32)}` } }))).status).toBe(200);
    expect(runNextQueuedOrScheduled).toHaveBeenCalledOnce();
  });
});
