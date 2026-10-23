import { ZodError } from "zod";
import { listJobs } from "@/features/jobs/server/queries";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    const params = Object.fromEntries(new URL(request.url).searchParams.entries());
    const result = await listJobs(params);
    return Response.json(result, { headers: { "Cache-Control": "public, max-age=0, s-maxage=60" } });
  } catch (error) {
    if (error instanceof ZodError) return Response.json({ error: "Invalid filters" }, { status: 400 });
    console.error("Jobs listing failed", error); return Response.json({ error: "Jobs unavailable" }, { status: 503 });
  }
}
