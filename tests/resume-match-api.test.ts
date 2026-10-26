import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/features/jobs/server/resume-document", async importOriginal => ({ ...await importOriginal<typeof import("@/features/jobs/server/resume-document")>(), extractResumeText: vi.fn() }));
vi.mock("@/features/jobs/server/resume-match", () => ({ matchResumeText: vi.fn() }));
vi.mock("@/features/jobs/server/resume-rate-limit", () => ({ allowResumeRequest: vi.fn() }));
import { extractResumeText } from "@/features/jobs/server/resume-document";
import { matchResumeText } from "@/features/jobs/server/resume-match";
import { allowResumeRequest } from "@/features/jobs/server/resume-rate-limit";
import { POST } from "@/app/api/jobs/match-resume/route";
import { syntheticPdf } from "./helpers/resume-documents";

function request(file = new File([new Uint8Array(syntheticPdf())], "resume.pdf", { type: "application/pdf" })) {
  const form = new FormData(); form.set("resume", file);
  return new Request("http://localhost/api/jobs/match-resume", { method: "POST", body: form });
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("DATABASE_URL", "postgresql://test"); vi.stubEnv("ABUSE_HASH_SECRET", "x".repeat(32));
  vi.mocked(allowResumeRequest).mockResolvedValue(true);
  vi.mocked(extractResumeText).mockResolvedValue("PRIVATE CANDIDATE TEXT React JS");
  vi.mocked(matchResumeText).mockResolvedValue({ jobs: [], total: 0 });
});
describe("temporary resume API", () => {
  it("returns only job results with no-store and wipes its parser buffer", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200); expect(await response.json()).toEqual({ jobs: [], total: 0 });
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(vi.mocked(extractResumeText).mock.calls[0][0].every(value => value === 0)).toBe(true);
  });
  it("wipes buffers and redacts errors after a matching exception", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(matchResumeText).mockRejectedValue(new Error("PRIVATE CANDIDATE TEXT"));
    const response = await POST(request());
    expect(response.status).toBe(503); expect(await response.text()).not.toContain("PRIVATE");
    expect(JSON.stringify(log.mock.calls)).not.toContain("PRIVATE");
    expect(vi.mocked(extractResumeText).mock.calls[0][0].every(value => value === 0)).toBe(true);
    log.mockRestore();
  });
  it("enforces guest rate limits before reading or parsing", async () => {
    vi.mocked(allowResumeRequest).mockResolvedValue(false);
    expect((await POST(request())).status).toBe(429); expect(extractResumeText).not.toHaveBeenCalled();
  });
  it("fails cleanly when server configuration is absent", async () => {
    vi.stubEnv("ABUSE_HASH_SECRET", ""); expect((await POST(request())).status).toBe(503);
    expect(allowResumeRequest).not.toHaveBeenCalled();
  });
  it("rejects unsupported types, empty uploads, and mismatched signatures", async () => {
    for (const file of [new File(["text"], "resume.txt"), new File([], "resume.pdf"), new File(["not a PDF"], "resume.pdf", { type: "application/pdf" })])
      expect((await POST(request(file))).status).toBe(400);
    expect(extractResumeText).not.toHaveBeenCalled();
  });
  it("bounds actual streamed body bytes even with no content length", async () => {
    const oversized = new Request("http://localhost/api/jobs/match-resume", { method: "POST", headers: { "content-type": "multipart/form-data; boundary=test" }, body: new Uint8Array(3 * 1024 * 1024) });
    expect((await POST(oversized)).status).toBe(413); expect(extractResumeText).not.toHaveBeenCalled();
  });
  it("rejects invalid filters and additional files", async () => {
    const form = new FormData(); form.set("resume", new File(["%PDF-"], "resume.pdf")); form.set("workMode", "invalid");
    expect((await POST(new Request("http://localhost/api/jobs/match-resume", { method: "POST", body: form }))).status).toBe(400);
  });
});
