import "server-only";
import path from "node:path";
import { Worker } from "node:worker_threads";
import { MATCH_CONFIG } from "../matching-config";

export const MAX_RESUME_BYTES = MATCH_CONFIG.maxFileBytes;
export class ResumeError extends Error {
  constructor(public code: "invalid" | "unsupported" | "oversized" | "unreadable" | "timeout", message: string) { super(message); }
}
export function resumeFormat(name: string, mime: string, bytes: Buffer): "pdf" | "docx" {
  if (!bytes.length) throw new ResumeError("invalid", "Choose a nonempty PDF or DOCX file.");
  if (bytes.length > MAX_RESUME_BYTES) throw new ResumeError("oversized", "The resume must be 2 MB or smaller.");
  const extension = name.toLowerCase().split(".").pop();
  const pdf = bytes.subarray(0, 5).toString("ascii") === "%PDF-";
  const zip = bytes.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  if (extension === "pdf" && pdf && ["application/pdf", "application/octet-stream", ""].includes(mime)) return "pdf";
  if (extension === "docx" && zip && ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/octet-stream", ""].includes(mime)) return "docx";
  throw new ResumeError("unsupported", "Choose a valid PDF or DOCX file. The file type and extension must agree.");
}

export async function extractResumeText(bytes: Buffer, format: "pdf" | "docx", signal?: AbortSignal): Promise<string> {
  if (signal?.aborted) throw new ResumeError("timeout", "Resume processing was cancelled.");
  const worker = new Worker(path.join(process.cwd(), "features/jobs/server/resume-parser-worker.mjs"), {
    workerData: { bytes, format, limits: MATCH_CONFIG },
    resourceLimits: { maxOldGenerationSizeMb: 128, maxYoungGenerationSizeMb: 32 },
    // Parser diagnostics may include document fragments; consume without forwarding.
    stdout: true, stderr: true,
  });
  worker.stdout.resume(); worker.stderr.resume();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let cancel: (() => void) | undefined;
  try {
    return await new Promise<string>((resolve, reject) => {
      cancel = () => reject(new ResumeError("timeout", "Resume processing was cancelled. Please try again."));
      signal?.addEventListener("abort", cancel, { once: true });
      timer = setTimeout(() => reject(new ResumeError("timeout", "The document took too long to read. Try a simpler PDF or DOCX.")), MATCH_CONFIG.parseTimeoutMs);
      worker.once("message", (result: { text?: unknown }) => {
        if (typeof result.text === "string" && result.text.trim() && result.text.length <= MATCH_CONFIG.maxTextCharacters) resolve(result.text);
        else reject(new ResumeError("unreadable", "No usable text was found. Try a text-based, unencrypted PDF or DOCX."));
      });
      worker.once("error", () => reject(new ResumeError("unreadable", "The document could not be read. Try a simpler PDF or DOCX.")));
      worker.once("exit", () => reject(new ResumeError("unreadable", "The document could not be read.")));
    });
  } finally {
    clearTimeout(timer);
    if (cancel) signal?.removeEventListener("abort", cancel);
    await worker.terminate();
  }
}
