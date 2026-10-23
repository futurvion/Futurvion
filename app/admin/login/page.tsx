import { redirect } from "next/navigation";
import { AdminLogin } from "@/features/jobs/components/admin-login";
import { adminSession } from "@/features/jobs/server/admin-auth";

export default async function AdminLoginPage() {
  if (await adminSession()) redirect("/admin");
  return <section className="page-section admin-page admin-login-page"><div className="container"><AdminLogin/></div></section>;
}
