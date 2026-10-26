import { MAX_RESUME_BYTES, ResumeError, extractResumeText, resumeFormat } from "@/features/jobs/server/resume-document";
import { matchResumeText } from "@/features/jobs/server/resume-match";
import { allowResumeRequest } from "@/features/jobs/server/resume-rate-limit";
import { MATCH_CONFIG } from "@/features/jobs/matching-config";
import { resumeFilters } from "@/features/jobs/server/resume-validation";

export const runtime = "nodejs";
export const maxDuration = 45;
const MAX_REQUEST_BYTES = MAX_RESUME_BYTES + 64 * 1024;
const headers = { "Cache-Control": "no-store, private", "X-Content-Type-Options": "nosniff" };
const reply = (body: object, status: number) => Response.json(body, { status, headers });
let activeRequests = 0;

async function readBounded(request: Request): Promise<Buffer> {
  const reader = request.body?.getReader();
  if (!reader) throw new ResumeError("invalid", "Select a resume first.");
  const chunks: Uint8Array[] = [];
  let total = 0;
  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const cancel = () => { void reader.cancel().catch(() => {}); };
  request.signal.addEventListener("abort", cancel, { once: true });
  try {
    timer = setTimeout(() => { timedOut = true; cancel(); }, MATCH_CONFIG.uploadTimeoutMs);
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_REQUEST_BYTES) throw new ResumeError("oversized", "The resume must be 2 MB or smaller.");
      chunks.push(value);
    }
    if (timedOut || request.signal.aborted) throw new ResumeError("timeout", "The upload was interrupted. Please try again.");
    return Buffer.concat(chunks);
  } finally {
    clearTimeout(timer);
    request.signal.removeEventListener("abort", cancel);
    await reader.cancel().catch(() => {});
    chunks.forEach(chunk => chunk.fill(0));
  }
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!/^multipart\/form-data;\s*boundary=/i.test(contentType)) return reply({ error: "Send a PDF or DOCX resume as a multipart form." }, 415);
  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length > MAX_REQUEST_BYTES) return reply({ error: "The resume must be 2 MB or smaller." }, 413);
  if (!process.env.DATABASE_URL || !process.env.ABUSE_HASH_SECRET || process.env.ABUSE_HASH_SECRET.length < 32)
    return reply({ error: "Resume matching is temporarily unavailable." }, 503);
  if (activeRequests >= 2) return reply({ error: "Resume matching is busy. Please try again shortly." }, 429);
  activeRequests++;
  let body: Buffer | null = null;
  let fileBytes: Buffer | null = null;
  let text = "";
  try {
    if (!await allowResumeRequest(request))
      return reply({ error: "Too many resume searches. Try again later." }, 429);
    body = await readBounded(request);
    const form = await new Request(request.url, { method: "POST", headers: { "content-type": contentType }, body: body as BodyInit }).formData();
    if ([...form.keys()].some(key => !["resume", "location", "workMode"].includes(key)) || form.getAll("resume").length !== 1 || form.getAll("location").length > 1 || form.getAll("workMode").length > 1)
      throw new ResumeError("invalid", "Select one PDF or DOCX resume.");
    const filters = resumeFilters.safeParse({ location: form.get("location") ?? "", workMode: form.get("workMode") ?? "" });
    if (!filters.success) throw new ResumeError("invalid", "Check the location and work mode filters.");
    const file = form.get("resume");
    if (!(file instanceof File)) throw new ResumeError("invalid", "Select one PDF or DOCX resume.");
    if (file.size > MAX_RESUME_BYTES) throw new ResumeError("oversized", "The resume must be 2 MB or smaller.");
    fileBytes = Buffer.from(await file.arrayBuffer());
    const format = resumeFormat(file.name, file.type, fileBytes);
    text = await extractResumeText(fileBytes, format, request.signal);
    if (request.signal.aborted) throw new ResumeError("timeout", "Resume processing was cancelled.");
    const result = await matchResumeText(text, filters.data);
    return reply(result, 200);
  } catch (error) {
    if (error instanceof ResumeError) return reply({ error: error.message }, error.code === "oversized" ? 413 : error.code === "timeout" ? 408 : 400);
    if (error instanceof TypeError || error instanceof SyntaxError) return reply({ error: "The upload could not be read. Try a valid PDF or DOCX." }, 400);
    // No request body, file name, extracted text, or candidate profile is logged.
    console.error("Resume matching failed", error instanceof Error ? error.name : "Unknown error");
    return reply({ error: "Resume matching is temporarily unavailable. Please try again." }, 503);
  } finally {
    fileBytes?.fill(0);
    body?.fill(0);
    text = "";
    activeRequests--;
  }
}
