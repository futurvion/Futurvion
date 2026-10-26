import { z } from "zod";
import { readJson } from "@/lib/read-json";
import { searchCities } from "@/features/jobs/server/city-search";
export const runtime = "nodejs";
const input = z.object({ query: z.string().trim().min(2).max(80) });
const headers = { "Cache-Control": "no-store" };
export async function POST(request: Request) {
  try {
    const parsed = input.safeParse(await readJson(request, 512));
    if (!parsed.success) return Response.json({ error: "Enter a city name (2–80 characters)." }, { status: 400, headers });
    return Response.json({ cities: searchCities(parsed.data.query) }, { headers });
  } catch (error) {
    if (error instanceof SyntaxError) return Response.json({ error: "Enter a valid city name." }, { status: 400, headers });
    if (error instanceof Error && error.message === "Request body too large") return Response.json({ error: "City search is too long." }, { status: 413, headers });
    return Response.json({ error: "City search is unavailable. Please try again." }, { status: 503, headers });
  }
}
