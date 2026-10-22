"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
type Provider = { id: string; name: string; providerType: string; configuration: unknown };
export function ProviderEditor({ provider }: { provider: Provider }) {
  const router = useRouter(); const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const config = provider.configuration as { board?: string; site?: string; region?: string };
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    const type = provider.providerType;
    const nextConfig = type === "greenhouse" ? { type, board: data.get("identifier") } : type === "lever" ? { type, site: data.get("identifier"), region: data.get("region") } : { type };
    try {
      const response = await fetch(`/api/admin/providers/${provider.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: data.get("name"), config: nextConfig, permissionConfirmed: data.get("permissionConfirmed") === "on" }) });
      if (!response.ok) { const result = await response.json(); setError(result.error ?? "Could not save provider"); return; }
      setOpen(false); router.refresh();
    } catch { setError("Could not save provider"); } finally { setBusy(false); }
  }
  return <div className="admin-provider-editor"><button type="button" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? "Cancel edit" : "Edit"}</button>{open && <form onSubmit={save}><label>Name<input name="name" defaultValue={provider.name} required maxLength={100}/></label>{typeNeedsIdentifier(provider.providerType) && <label>Board token or site identifier<input name="identifier" defaultValue={config.board ?? config.site ?? ""} required pattern="[a-z0-9][a-z0-9_-]*"/></label>}{provider.providerType === "lever" && <label>Region<select name="region" defaultValue={config.region ?? "global"}><option value="global">Global</option><option value="eu">EU</option></select></label>}<label className="admin-permission"><input name="permissionConfirmed" type="checkbox" required/> I have permission to display jobs from this source.</label>{error && <span role="alert">{error}</span>}<button disabled={busy}>{busy ? "Saving…" : "Save provider"}</button></form>}</div>;
}
function typeNeedsIdentifier(type: string) { return type === "greenhouse" || type === "lever"; }
