import { ZodError } from "zod";
import { listJobs } from "@/features/jobs/server/queries";
import { readJson } from "@/lib/read-json";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    const params = Object.fromEntries(new URL(request.url).searchParams.entries());
    if (["nearLat", "nearLng", "radiusKm"].some(key => key in params)) return Response.json({ error: "Use POST for nearby search" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    const result = await listJobs(params);
    return Response.json(result, { headers: { "Cache-Control": "public, max-age=0, s-maxage=60" } });
  } catch (error) {
    if (error instanceof ZodError) return Response.json({ error: "Invalid filters" }, { status: 400 });
    console.error("Jobs listing failed", error instanceof Error ? error.name : "Unknown error"); return Response.json({ error: "Jobs unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await readJson(request, 4096);
    if (!body || typeof body !== "object" || Array.isArray(body)) return Response.json({ error: "Invalid filters" }, { status: 400 });
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(body)) {
      if (typeof value !== "string" && !(["page", "nearLat", "nearLng", "radiusKm"].includes(key) && typeof value === "number")) return Response.json({ error: "Invalid filters" }, { status: 400 });
      params[key] = String(value);
    }
    const result = await listJobs(params);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) return Response.json({ error: "Invalid filters" }, { status: 400 });
    if (error instanceof Error && error.message === "Request body too large") return Response.json({ error: "Invalid filters" }, { status: 413 });
    console.error("Jobs listing failed", error instanceof Error ? error.name : "Unknown error");
    return Response.json({ error: "Jobs unavailable" }, { status: 503 });
  }
}
