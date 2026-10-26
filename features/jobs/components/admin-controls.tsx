"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminSelect } from "@/components/admin/admin-select";
import { ProviderEditor } from "./provider-editor";
import { siteStyles } from "@/config/styles";

type Provider = {
  id: string;
  name: string;
  slug: string;
  providerType: string;
  enabled: boolean;
  configuration: unknown;
  lastSuccessAt: Date | null;
  lastSuccessLabel: string;
  lastErrorSummary: string | null;
  runs: { status: string; jobsFetched: number; jobsInserted: number; jobsUpdated: number }[];
};

type Schedule = {
  enabled: boolean;
  frequencyMinutes: number;
  timezone: string;
  batchSize: number;
  maxConcurrency: number;
  retryLimit: number;
  retryDelaySeconds: number;
  expireAfterDays: number;
};

const providerTypes = [
  { value: "greenhouse", label: "Greenhouse board" },
  { value: "lever", label: "Lever site" },
  { value: "remotive", label: "Remotive feed" },
];

const leverRegions = [
  { value: "global", label: "Global" },
  { value: "eu", label: "European Union" },
];

export function AdminControls({ providers, schedule }: { providers: Provider[]; schedule: Schedule }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function request(path: string, method: string, body?: object) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const result = await response.json();
      if (response.ok) {
        setMessage(path === "/api/admin/sync-runs"
          ? `Synchronization ${result.status}. ${result.inserted ?? 0} new jobs.`
          : `Saved. ${result.status ?? ""}`);
        router.refresh();
      } else {
        setMessage(result.error ?? "Request failed");
      }
      return response.ok;
    } catch {
      setMessage("Request failed. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return <div className="admin-controls">
    <div className="admin-control-toolbar">
       <div className="admin-control-toolbar-copy"><span className={`${siteStyles.eyebrow} eyebrow`}>Operations</span><strong>Keep your job index fresh</strong><p>Run an on-demand sync or fine-tune the feeds that power the public jobs board.</p></div>
      <div className="admin-control-toolbar-actions">
        <p aria-live="polite" className="admin-message">{message}</p>
        <button className={`${siteStyles.button} button button-primary ${siteStyles.buttonPrimary}`} disabled={busy} onClick={() => { if (window.confirm("Synchronize all enabled providers now?")) void request("/api/admin/sync-runs", "POST"); }}><span className="admin-button-icon" aria-hidden="true">↻</span>{busy ? "Syncing…" : "Sync all now"}</button>
      </div>
    </div>

    <section className="admin-control-section" id="providers" aria-labelledby="providers-heading">
      <div className="admin-section-heading">
         <div><span className={`${siteStyles.eyebrow} eyebrow`}>Connected feeds</span><h2 id="providers-heading">Provider control room</h2><p>Only configured, enabled boards are synchronized. Remotive is limited to one request every six hours.</p></div>
        <span className="admin-section-count">{providers.length.toString().padStart(2, "0")} sources</span>
      </div>
      <div className="admin-provider-grid">
        {providers.length ? providers.map(provider => {
          const latest = provider.runs[0];
          return <article className="admin-provider-card" key={provider.id}>
            <div className="admin-provider-card-header">
              <div className="admin-provider-mark" aria-hidden="true">{provider.name.slice(0, 1).toUpperCase()}</div>
              <div><span className="admin-provider-type">{formatProviderType(provider.providerType)}</span><h3>{provider.name}</h3></div>
              <span className={`admin-status-pill ${provider.enabled ? "is-live" : "is-muted"}`}><i aria-hidden="true"/>{provider.enabled ? "Live" : "Paused"}</span>
            </div>
            <dl className="admin-provider-facts">
              <div><dt>Last success</dt><dd>{provider.lastSuccessLabel}</dd></div>
              <div><dt>Last run</dt><dd>{latest ? `${latest.status} · ${latest.jobsFetched} fetched` : "No runs yet"}</dd></div>
              <div><dt>Changes</dt><dd>{latest ? `${latest.jobsInserted} new · ${latest.jobsUpdated} updated` : "—"}</dd></div>
            </dl>
            {provider.lastErrorSummary && <p className="admin-provider-alert"><span aria-hidden="true">!</span>{provider.lastErrorSummary}</p>}
            <div className="admin-provider-actions">
              <button className="admin-inline-button" disabled={busy} onClick={() => void request(`/api/admin/providers/${provider.id}`, "PATCH", { enabled: !provider.enabled })}>{provider.enabled ? "Pause feed" : "Enable feed"}</button>
              <button className="admin-inline-button is-emphasis" disabled={busy} onClick={() => void request("/api/admin/sync-runs", "POST", { providerId: provider.id })}>Sync source <span aria-hidden="true">↗</span></button>
              <ProviderEditor provider={provider}/>
            </div>
          </article>;
        }) : <div className="admin-empty-panel"><span className="admin-empty-icon" aria-hidden="true">+</span><h3>No providers connected</h3><p>Add a source below to start building your public jobs index.</p></div>}
      </div>
    </section>

    <div className="admin-control-grid">
      <section className="admin-panel admin-form-panel" aria-labelledby="add-provider-heading">
         <div className="admin-panel-heading"><div><span className={`${siteStyles.eyebrow} eyebrow`}>Source library</span><h2 id="add-provider-heading">Add a provider</h2></div><span className="admin-panel-index">01</span></div>
        <p className="admin-panel-intro">Add a disabled source first, verify its identifier, then enable it when the feed is ready.</p>
        <form className="admin-provider-form" onSubmit={event => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const type = String(data.get("type"));
          void request("/api/admin/providers", "POST", {
            name: data.get("name"),
            slug: data.get("slug"),
            enabled: false,
            permissionConfirmed: data.get("permissionConfirmed") === "on",
            config: type === "remotive" ? { type } : type === "greenhouse" ? { type, board: data.get("identifier") } : { type, site: data.get("identifier"), region: data.get("region") },
          });
        }}>
          <label className="admin-field"><span className="admin-field-label">Display name</span><input name="name" required maxLength={100} placeholder="Example Careers"/></label>
          <label className="admin-field"><span className="admin-field-label">URL slug</span><input name="slug" required pattern="[a-z0-9][a-z0-9_-]*" placeholder="example-careers"/></label>
          <AdminSelect name="type" label="Provider type" options={providerTypes} defaultValue="greenhouse"/>
          <label className="admin-field"><span className="admin-field-label">Board or site identifier</span><input name="identifier" pattern="[a-z0-9][a-z0-9_-]*" placeholder="company-board"/></label>
          <AdminSelect name="region" label="Lever region" options={leverRegions} defaultValue="global"/>
          <label className="admin-permission"><input name="permissionConfirmed" type="checkbox" required/> <span>I have permission to display jobs from this source.</span></label>
           <button className={`${siteStyles.button} button button-ghost ${siteStyles.buttonGhost}`} disabled={busy}>Add disabled provider <span aria-hidden="true">+</span></button>
        </form>
      </section>

      <section className="admin-panel admin-form-panel" id="schedule" aria-labelledby="schedule-heading">
         <div className="admin-panel-heading"><div><span className={`${siteStyles.eyebrow} eyebrow`}>Automation</span><h2 id="schedule-heading">Sync schedule</h2></div><span className="admin-panel-index">02</span></div>
        <p className="admin-panel-intro">An external scheduler calls the protected endpoint. These settings control when a run becomes due.</p>
        <form className="admin-schedule" onSubmit={event => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          void request("/api/admin/schedule", "PATCH", {
            enabled: data.get("enabled") === "on",
            frequencyMinutes: Number(data.get("frequencyMinutes")),
            timezone: data.get("timezone"),
            batchSize: Number(data.get("batchSize")),
            maxConcurrency: Number(data.get("maxConcurrency")),
            retryLimit: Number(data.get("retryLimit")),
            retryDelaySeconds: Number(data.get("retryDelaySeconds")),
            expireAfterDays: Number(data.get("expireAfterDays")),
          });
        }}>
          <label className="admin-toggle"><input name="enabled" type="checkbox" defaultChecked={schedule.enabled}/><span><strong>Enable scheduled sync</strong><small>Let your external scheduler keep feeds current.</small></span></label>
          <div className="admin-form-divider"/>
          {([ ["frequencyMinutes", "Frequency (minutes)", 60, 10080], ["batchSize", "Batch size", 1, 500], ["maxConcurrency", "Max concurrency", 1, 4], ["retryLimit", "Retry limit", 0, 3], ["retryDelaySeconds", "Retry delay (seconds)", 1, 60], ["expireAfterDays", "Expire after (days)", 1, 90] ] as const).map(([key, label, min, max]) => <label className="admin-field" key={key}><span className="admin-field-label">{label}</span><input name={key} type="number" min={min} max={max} defaultValue={schedule[key]} required/></label>)}
          <label className="admin-field admin-field-wide"><span className="admin-field-label">Timezone</span><input name="timezone" defaultValue={schedule.timezone} required/></label>
           <div className="admin-form-actions"><button className={`${siteStyles.button} button button-primary ${siteStyles.buttonPrimary}`} disabled={busy}>Save settings <span aria-hidden="true">↗</span></button><button className={`${siteStyles.button} button button-ghost ${siteStyles.buttonGhost}`} type="button" disabled={busy} onClick={() => void request("/api/admin/schedule", "PATCH", { enabled: false, frequencyMinutes: 360, timezone: "UTC", batchSize: 100, maxConcurrency: 2, retryLimit: 2, retryDelaySeconds: 5, expireAfterDays: 14 })}>Reset defaults</button></div>
        </form>
      </section>
    </div>
  </div>;
}

function formatProviderType(type: string) {
  return type === "greenhouse" ? "GREENHOUSE BOARD" : type === "remotive" ? "REMOTIVE FEED" : "LEVER SITE";
}
