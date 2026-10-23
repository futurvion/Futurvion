import { authorizedMutation, revokeSession } from "@/features/jobs/server/admin-auth";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!await authorizedMutation(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await revokeSession(); return Response.json({ ok: true });
}
