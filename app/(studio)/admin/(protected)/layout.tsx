import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdminSession } from "@/features/jobs/server/admin-auth";
import { siteStyles } from "@/config/styles";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();
  return <section className="admin-workspace"><div className={`${siteStyles.container} admin-workspace-grid`}>
    <AdminSidebar email={session.adminUser.email}/>
    <div className="admin-workspace-content">{children}</div>
  </div></section>;
}
