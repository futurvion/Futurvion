import { AdminLogin } from "@/features/jobs/components/admin-login";
import { AdminControls } from "@/features/jobs/components/admin-controls";
import { adminSession } from "@/features/jobs/server/admin-auth";
import { getDb } from "@/lib/db";
export const metadata = { title: "Admin | Futurvion", robots: { index: false, follow: false } };
export default async function AdminPage() {
  const session = await adminSession();
  if (!session) return <section className="page-section admin-page"><div className="container"><AdminLogin/></div></section>;
  const db = getDb(); if (!db) return <section className="page-section"><div className="container">Database unavailable.</div></section>;
  const [active, inactive, providers, runs, settings] = await Promise.all([
    db.job.count({ where: { status: "active" } }), db.job.count({ where: { status: { not: "active" } } }),
    db.jobProvider.findMany({ orderBy: { name: "asc" }, include: { runs: { take: 1, orderBy: { startedAt: "desc" }, select: { status: true, jobsFetched: true, jobsInserted: true, jobsUpdated: true } } } }), db.jobSyncRun.findMany({ take: 15, orderBy: { startedAt: "desc" } }),
    db.jobSyncSettings.findUnique({ where: { id: 1 } }),
  ]);
  const schedule = settings ?? { enabled: false, frequencyMinutes: 360, timezone: "UTC", batchSize: 100, maxConcurrency: 2, retryLimit: 2, retryDelaySeconds: 5, expireAfterDays: 14 };
  return <section className="page-section admin-page"><div className="container"><span className="eyebrow">Operations / Jobs</span><h1>Admin dashboard</h1><p>Signed in as {session.adminUser.email}</p><div className="admin-stats"><div><strong>{active}</strong><span>Active jobs</span></div><div><strong>{inactive}</strong><span>Inactive jobs</span></div><div><strong>{providers.filter(provider => provider.enabled).length}</strong><span>Enabled sources</span></div><div><strong>{settings?.nextScheduledRunAt?.toLocaleString("en", { timeZone: schedule.timezone }) ?? "—"}</strong><span>Next due</span></div></div><AdminControls key={settings?.updatedAt.toISOString() ?? "default"} providers={providers} schedule={schedule}/><section className="admin-history"><h2>Recent syncs</h2>{runs.length ? <div className="admin-provider-list">{runs.map(run => <div key={run.id}><strong>{run.status}</strong><span>{run.startedAt.toLocaleString()} · {run.triggerType}</span><span>{run.jobsFetched} fetched · {run.jobsInserted} new · {run.jobsUpdated} updated · {run.errorCount} errors</span></div>)}</div> : <p>No syncs have run yet.</p>}</section></div></section>;
}
