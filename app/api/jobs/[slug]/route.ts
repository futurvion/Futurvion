import { getJob } from "@/features/jobs/server/queries";
export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return Response.json({ error: "Not found" }, { status: 404 });
  try {
    const job = await getJob(slug);
    if (!job) return Response.json({ error: "Not found" }, { status: 404 });
    const { id: _id, sourceProviderId: _providerId, externalJobId: _externalId, contentHash: _hash, ...publicJob } = job;
    void _id; void _providerId; void _externalId; void _hash;
    return Response.json(publicJob, { headers: { "Cache-Control": "public, max-age=0, s-maxage=60" } });
  } catch (error) { console.error("Job details failed", error); return Response.json({ error: "Jobs unavailable" }, { status: 503 }); }
}
