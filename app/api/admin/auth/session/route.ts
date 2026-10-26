import { adminSession } from "@/features/jobs/server/admin-auth";
export const runtime = "nodejs";
export async function GET() {
  const session = await adminSession();
  return Response.json(session ? { email: session.adminUser.email } : { error: "Unauthorized" }, { status: session ? 200 : 401, headers: { "Cache-Control": "no-store" } });
}
