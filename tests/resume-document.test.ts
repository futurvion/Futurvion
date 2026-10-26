import { afterEach, describe, expect, it, vi } from "vitest";
import { Worker } from "node:worker_threads";
vi.mock("server-only", () => ({}));
import { extractResumeText, resumeFormat, MAX_RESUME_BYTES } from "@/features/jobs/server/resume-document";
import { syntheticPdf, syntheticDocx, syntheticZip } from "./helpers/resume-documents";

afterEach(() => vi.restoreAllMocks());
// Native worker startup shares CI resources; allow the real 12-second parser guard to finish.
describe("temporary document parsing", { timeout: 15_000 }, () => {
  it("reads a valid PDF while preserving line boundaries and terminates its worker", async () => {
    const terminate = vi.spyOn(Worker.prototype, "terminate");
    const text = await extractResumeText(syntheticPdf(["Software Engineer", "Jan 2020 - Dec 2022", "React JS"]), "pdf");
    expect(text).toContain("Software Engineer\n"); expect(text).toContain("React JS");
    expect(terminate).toHaveBeenCalled(); terminate.mockRestore();
  });
  it("reads a valid DOCX in memory", async () => {
    expect(await extractResumeText(syntheticDocx(), "docx")).toContain("JavaScript React TypeScript");
  });
  it.each([["resume.txt", "text/plain", Buffer.from("text")], ["resume.pdf", "application/pdf", syntheticDocx()], ["resume.pdf", "image/png", syntheticPdf()]])("rejects extension/MIME/signature disagreements: %s", (name, mime, bytes) => {
    expect(() => resumeFormat(name, mime, bytes)).toThrow("valid PDF or DOCX");
  });
  it("accepts signatures when a browser omits MIME", () => { expect(resumeFormat("resume.pdf", "", syntheticPdf())).toBe("pdf"); });
  it("rejects empty and oversized uploads", () => {
    expect(() => resumeFormat("resume.pdf", "application/pdf", Buffer.alloc(0))).toThrow("nonempty");
    expect(() => resumeFormat("resume.pdf", "application/pdf", Buffer.alloc(MAX_RESUME_BYTES + 1))).toThrow("2 MB");
  });
  it.each([Buffer.from("%PDF-1.4\ncorrupt /Encrypt"), syntheticPdf([])])("rejects corrupt or unreadable PDFs", async bytes => {
    await expect(extractResumeText(bytes, "pdf")).rejects.toThrow();
  });
  it("rejects a ZIP without a Word document and an expansion bomb before parsing", async () => {
    await expect(extractResumeText(syntheticZip({ "other.xml": "text" }), "docx")).rejects.toThrow();
    const bomb = syntheticDocx(); const central = bomb.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
    bomb.writeUInt32LE(20 * 1024 * 1024, central + 24);
    await expect(extractResumeText(bomb, "docx")).rejects.toThrow();
    const falseSize = syntheticDocx();
    falseSize.writeUInt32LE(1, falseSize.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02])) + 24);
    await expect(extractResumeText(falseSize, "docx")).rejects.toThrow();
  });
  it("rejects a PDF that requires a password", async () => {
    await expect(extractResumeText(syntheticPdf(["Encrypted synthetic document"], true), "pdf")).rejects.toThrow("unencrypted");
  });
  it("enforces the parser deadline and terminates the worker", async () => {
    vi.useFakeTimers();
    const terminate = vi.spyOn(Worker.prototype, "terminate");
    try {
      const assertion = expect(extractResumeText(syntheticDocx(), "docx")).rejects.toThrow("too long");
      await vi.advanceTimersByTimeAsync(12_001); await assertion;
      expect(terminate).toHaveBeenCalled();
    } finally { vi.useRealTimers(); terminate.mockRestore(); }
  });
  it("terminates processing on cancellation", async () => {
    const terminate = vi.spyOn(Worker.prototype, "terminate");
    const controller = new AbortController();
    const result = extractResumeText(syntheticDocx(), "docx", controller.signal);
    controller.abort(); await expect(result).rejects.toThrow("cancelled");
    expect(terminate).toHaveBeenCalled(); terminate.mockRestore();
  });
});
