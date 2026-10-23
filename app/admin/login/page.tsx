import { redirect } from "next/navigation";
import { AdminLogin } from "@/features/jobs/components/admin-login";
import { adminSession } from "@/features/jobs/server/admin-auth";
import { siteStyles } from "@/config/styles";

export default async function AdminLoginPage() {
  if (await adminSession()) redirect("/admin");
  return <section className={`${siteStyles.pageSection} page-section admin-page admin-login-page`}><div className={siteStyles.container}><AdminLogin/></div></section>;
}
