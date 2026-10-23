import { AdminControls } from "@/features/jobs/components/admin-controls";
import { requireAdminSession } from "@/features/jobs/server/admin-auth";
import { getDb } from "@/lib/db";

export const metadata = { title: "Jobs | Futurvion Admin" };

export default async function AdminJobsPage() {
  await requireAdminSession();
  const db = getDb();
  if (!db) return <div className="admin-page admin-empty-state"><span className="eyebrow">Workspace / Jobs</span><h1>Jobs are offline</h1><p>Connect the database to manage providers and synchronization.</p></div>;

  const [active, inactive, providers, runs, settings] = await Promise.all([
    db.job.count({ where: { status: "active" } }),
    db.job.count({ where: { status: { not: "active" } } }),
    db.jobProvider.findMany({ orderBy: { name: "asc" }, include: { runs: { take: 1, orderBy: { startedAt: "desc" }, select: { status: true, jobsFetched: true, jobsInserted: true, jobsUpdated: true } } } }),
    db.jobSyncRun.findMany({ take: 15, orderBy: { startedAt: "desc" } }),
    db.jobSyncSettings.findUnique({ where: { id: 1 } }),
  ]);
  const schedule = settings ?? { enabled: false, frequencyMinutes: 360, timezone: "UTC", batchSize: 100, maxConcurrency: 2, retryLimit: 2, retryDelaySeconds: 5, expireAfterDays: 14 };
  const providerRows = providers.map(provider => ({
    ...provider,
    lastSuccessLabel: provider.lastSuccessAt ? `${provider.lastSuccessAt.toISOString().slice(0, 16).replace("T", " ")} UTC` : "Never",
  }));
  const enabledProviders = providers.filter(provider => provider.enabled).length;
  const latestRun = runs[0];

  return <div className="admin-page admin-jobs-page">
    <header className="admin-page-header">
      <div>
        <span className="eyebrow">Workspace / Jobs</span>
        <h1>Jobs operations.</h1>
        <p className="admin-intro">Shape the sources, schedules, and sync rhythm behind your public opportunities board.</p>
      </div>
      <div className="admin-page-header-actions"><span className={`admin-live-indicator ${schedule.enabled ? "is-active" : "is-paused"}`}><i aria-hidden="true"/> {schedule.enabled ? "Schedule active" : "Schedule paused"}</span><a className="button button-ghost" href="/jobs" target="_blank" rel="noreferrer">View public board <span aria-hidden="true">↗</span></a></div>
    </header>

    <section className="admin-jobs-hero" aria-label="Jobs operations summary">
      <div><span className="eyebrow">Publishing pipeline</span><h2>One calm place to keep every source moving.</h2><p>{enabledProviders ? `${enabledProviders} ${enabledProviders === 1 ? "source is" : "sources are"} live. The latest run ${latestRun ? `reported ${latestRun.jobsFetched} fetched jobs` : "is waiting to be started"}.` : "No providers are live yet. Add and review a source to start your pipeline."}</p></div>
      <div className="admin-jobs-hero-stat"><span>Public inventory</span><strong>{active}</strong><small>active roles</small></div>
    </section>

    <div className="admin-metric-grid admin-jobs-metrics" aria-label="Jobs metrics">
      <article className="admin-metric-card admin-metric-card-featured"><div className="admin-metric-top"><span>01 / Published</span><span className="admin-metric-signal">Live</span></div><strong>{active}</strong><span>Active jobs</span><p>Roles visible to public visitors.</p></article>
      <article className="admin-metric-card"><div className="admin-metric-top"><span>02 / Lifecycle</span><span aria-hidden="true">↘</span></div><strong>{inactive}</strong><span>Inactive jobs</span><p>Listings no longer in the active index.</p></article>
      <article className="admin-metric-card"><div className="admin-metric-top"><span>03 / Sources</span><span aria-hidden="true">↗</span></div><strong>{enabledProviders}<small>/{providers.length}</small></strong><span>Enabled feeds</span><p>Configured sources currently syncing.</p></article>
      <article className="admin-metric-card"><div className="admin-metric-top"><span>04 / Next pulse</span><span aria-hidden="true">◷</span></div><strong className="admin-metric-date">{settings?.nextScheduledRunAt ? settings.nextScheduledRunAt.toLocaleString("en", { timeZone: schedule.timezone, month: "short", day: "numeric" }) : "—"}</strong><span>Next scheduled run</span><p>{settings?.nextScheduledRunAt ? schedule.timezone : "Configure a schedule below."}</p></article>
    </div>

    <AdminControls providers={providerRows} schedule={schedule}/>

    <section className="admin-panel admin-history-panel" id="history" aria-labelledby="history-heading">
      <div className="admin-panel-heading"><div><span className="eyebrow">Audit trail</span><h2 id="history-heading">Recent syncs</h2></div><span className="admin-section-count">{runs.length.toString().padStart(2, "0")} runs</span></div>
      {runs.length ? <div className="admin-history-list">{runs.map(run => <div className="admin-history-row" key={run.id}><span className={`admin-activity-status status-${run.status}`} aria-hidden="true"/><div><strong>{run.status}</strong><span>{run.startedAt.toISOString().slice(0, 16).replace("T", " ")} UTC · {run.triggerType}</span></div><span className="admin-history-numbers"><b>{run.jobsFetched}</b> fetched <i>·</i> <b>{run.jobsInserted}</b> new <i>·</i> <b>{run.jobsUpdated}</b> updated <i>·</i> <b>{run.errorCount}</b> errors</span></div>)}</div> : <div className="admin-empty-panel"><span className="admin-empty-icon" aria-hidden="true">⌁</span><h3>No syncs have run yet</h3><p>Your first run will appear here with fetched, inserted, updated, and error counts.</p></div>}
    </section>
  </div>;
}
