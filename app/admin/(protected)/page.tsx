import Link from "next/link";
import { requireAdminSession } from "@/features/jobs/server/admin-auth";
import { getDb } from "@/lib/db";

export default async function AdminOverviewPage() {
  await requireAdminSession();
  const db = getDb();
  if (!db) return <div className="admin-page"><h1>Workspace overview</h1><p>Database unavailable.</p></div>;
  const [activeJobs, inactiveJobs, enabledSources, latestRun] = await Promise.all([
    db.job.count({ where: { status: "active" } }),
    db.job.count({ where: { status: { not: "active" } } }),
    db.jobProvider.count({ where: { enabled: true } }),
    db.jobSyncRun.findFirst({ orderBy: { startedAt: "desc" }, select: { status: true, startedAt: true } }),
  ]);

  return <div className="admin-page">
    <span className="eyebrow">Workspace / Overview</span>
    <h1>Welcome back</h1>
    <p className="admin-intro">Manage your site from one place. Start with jobs, sources, and synchronization.</p>
    <div className="admin-stats" aria-label="Jobs overview">
      <div><strong>{activeJobs}</strong><span>Active jobs</span></div>
      <div><strong>{inactiveJobs}</strong><span>Inactive jobs</span></div>
      <div><strong>{enabledSources}</strong><span>Enabled sources</span></div>
    </div>
    <section className="admin-overview-card">
      <div><span className="eyebrow">Jobs</span><h2>Job listings and sources</h2><p>Review listings, manage providers, and control synchronization.</p>
        <p className="admin-overview-meta">Latest sync: {latestRun ? `${latestRun.status} · ${latestRun.startedAt.toISOString().slice(0, 16).replace("T", " ")} UTC` : "No runs yet"}</p>
      </div>
      <Link className="button button-primary" href="/admin/jobs">Open jobs settings ↗</Link>
    </section>
  </div>;
}
