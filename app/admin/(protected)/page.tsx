import Link from "next/link";
import { requireAdminSession } from "@/features/jobs/server/admin-auth";
import { getDb } from "@/lib/db";

export const metadata = { title: "Overview | Futurvion Admin" };

export default async function AdminOverviewPage() {
  await requireAdminSession();
  const db = getDb();
  if (!db) return <div className="admin-page admin-empty-state"><span className="eyebrow">Control center</span><h1>Database unavailable</h1><p>Connect the database to load workspace metrics and job operations.</p></div>;

  const [activeJobs, inactiveJobs, enabledSources, totalSources, latestRun, recentRuns] = await Promise.all([
    db.job.count({ where: { status: "active" } }),
    db.job.count({ where: { status: { not: "active" } } }),
    db.jobProvider.count({ where: { enabled: true } }),
    db.jobProvider.count(),
    db.jobSyncRun.findFirst({ orderBy: { startedAt: "desc" }, include: { provider: { select: { name: true } } } }),
    db.jobSyncRun.findMany({ take: 5, orderBy: { startedAt: "desc" }, include: { provider: { select: { name: true } } } }),
  ]);
  const coverage = totalSources ? Math.round((enabledSources / totalSources) * 100) : 0;
  const latestLabel = latestRun ? formatDate(latestRun.startedAt) : "No sync activity yet";

  return <div className="admin-page admin-overview-page">
    <header className="admin-page-header">
      <div>
        <span className="eyebrow">Control center / Overview</span>
        <h1>Good to see you.</h1>
        <p className="admin-intro">A clear view of the jobs ecosystem, source health, and the next action for your team.</p>
      </div>
      <div className="admin-page-header-actions"><span className="admin-live-indicator"><i aria-hidden="true"/> Live workspace</span><Link className="button button-primary" href="/admin/jobs">Open jobs <span aria-hidden="true">↗</span></Link></div>
    </header>

    <section className="admin-dashboard-banner" aria-label="Workspace status">
      <div className="admin-dashboard-banner-copy"><span className="eyebrow">Jobs index</span><h2>Your public board is in motion.</h2><p>{activeJobs ? `${activeJobs} active roles are currently available across ${enabledSources} enabled ${enabledSources === 1 ? "source" : "sources"}.` : "Connect a provider and run a sync to begin publishing roles."}</p></div>
      <div className="admin-dashboard-banner-visual" aria-hidden="true"><span className="admin-dashboard-orbit admin-dashboard-orbit-one"/><span className="admin-dashboard-orbit admin-dashboard-orbit-two"/><span className="admin-dashboard-core"/></div>
      <div className="admin-dashboard-banner-meta"><span>Last activity</span><strong>{latestLabel}</strong><Link href="/admin/jobs">Review operations <span aria-hidden="true">→</span></Link></div>
    </section>

    <section className="admin-metric-grid" aria-label="Workspace metrics">
      <article className="admin-metric-card admin-metric-card-featured"><div className="admin-metric-top"><span>01 / Inventory</span><span className="admin-metric-signal">Indexed</span></div><strong>{activeJobs}</strong><span>Active jobs</span><p>Public roles currently visible on the board.</p></article>
      <article className="admin-metric-card"><div className="admin-metric-top"><span>02 / Archive</span><span aria-hidden="true">↘</span></div><strong>{inactiveJobs}</strong><span>Inactive jobs</span><p>Roles waiting for expiry or already archived.</p></article>
      <article className="admin-metric-card"><div className="admin-metric-top"><span>03 / Network</span><span aria-hidden="true">↗</span></div><strong>{enabledSources}<small>/{totalSources}</small></strong><span>Live sources</span><p>{coverage}% of configured providers are enabled.</p></article>
    </section>

    <div className="admin-dashboard-grid">
      <section className="admin-panel admin-health-panel" aria-labelledby="health-heading">
        <div className="admin-panel-heading"><div><span className="eyebrow">System pulse</span><h2 id="health-heading">Source health</h2></div><span className="admin-panel-index">A1</span></div>
        <div className="admin-health-summary"><div className="admin-health-ring" style={{ "--health-progress": `${coverage}%` } as React.CSSProperties}><strong>{coverage}%</strong><span>coverage</span></div><div><strong>{enabledSources ? "All connected sources are ready" : "No connected sources yet"}</strong><p>Enable only feeds that have been reviewed and approved for display.</p></div></div>
        <div className="admin-health-bar"><span style={{ width: `${coverage}%` }}/></div>
        <div className="admin-health-footer"><span><i className="is-success" aria-hidden="true"/> {enabledSources} enabled</span><span><i className="is-muted" aria-hidden="true"/> {Math.max(totalSources - enabledSources, 0)} paused</span><Link href="/admin/jobs">Manage sources →</Link></div>
      </section>

      <section className="admin-panel admin-quick-panel" aria-labelledby="quick-heading">
        <div className="admin-panel-heading"><div><span className="eyebrow">Shortcuts</span><h2 id="quick-heading">Quick actions</h2></div><span className="admin-panel-index">A2</span></div>
        <div className="admin-quick-list"><Link href="/admin/jobs#providers"><span className="admin-quick-number">01</span><span><strong>Review providers</strong><small>Check feed status and identifiers</small></span><span aria-hidden="true">↗</span></Link><Link href="/admin/jobs#schedule"><span className="admin-quick-number">02</span><span><strong>Adjust sync schedule</strong><small>Keep the public board current</small></span><span aria-hidden="true">↗</span></Link><Link href="/jobs" target="_blank"><span className="admin-quick-number">03</span><span><strong>View public jobs board</strong><small>See the experience visitors get</small></span><span aria-hidden="true">↗</span></Link></div>
      </section>
    </div>

    <section className="admin-panel admin-activity-panel" aria-labelledby="activity-heading">
      <div className="admin-panel-heading"><div><span className="eyebrow">Operations log</span><h2 id="activity-heading">Recent activity</h2></div><Link className="admin-text-link" href="/admin/jobs#history">View full history <span aria-hidden="true">→</span></Link></div>
      {recentRuns.length ? <div className="admin-activity-list">{recentRuns.map(run => <div className="admin-activity-row" key={run.id}><span className={`admin-activity-status status-${run.status}`} aria-hidden="true"/><div><strong>{run.provider?.name ?? "All enabled sources"}</strong><span>{run.triggerType} sync · {formatDate(run.startedAt)}</span></div><span className="admin-activity-result">{run.jobsInserted} new <i>·</i> {run.jobsUpdated} updated</span><span className={`admin-result-pill result-${run.status}`}>{run.status}</span></div>)}</div> : <div className="admin-empty-panel admin-empty-activity"><span className="admin-empty-icon" aria-hidden="true">⌁</span><h3>No sync history yet</h3><p>Run your first provider sync from the Jobs workspace.</p></div>}
    </section>
  </div>;
}

function formatDate(date: Date) {
  return `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}
