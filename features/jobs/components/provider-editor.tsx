"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminSelect } from "@/components/admin/admin-select";
import { siteStyles } from "@/config/styles";

type Provider = { id: string; name: string; providerType: string; configuration: unknown };

export function ProviderEditor({ provider }: { provider: Provider }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const config = provider.configuration as { board?: string; site?: string; region?: string };

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const type = provider.providerType;
    const nextConfig = type === "greenhouse"
      ? { type, board: data.get("identifier") }
      : type === "lever"
        ? { type, site: data.get("identifier"), region: data.get("region") }
        : { type };

    try {
      const response = await fetch(`/api/admin/providers/${provider.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          config: nextConfig,
          permissionConfirmed: data.get("permissionConfirmed") === "on",
        }),
      });
      if (!response.ok) {
        const result = await response.json();
        setError(result.error ?? "Could not save provider");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Could not save provider");
    } finally {
      setBusy(false);
    }
  }

  return <div className="admin-provider-editor">
    <button type="button" className="admin-inline-button" onClick={() => setOpen(!open)} aria-expanded={open}>
      {open ? "Close editor" : "Edit source"}
    </button>
    {open && <form className="admin-editor-popover" onSubmit={save}>
       <div className="admin-editor-heading"><span className={`${siteStyles.eyebrow} eyebrow`}>Source settings</span><strong>Update provider</strong></div>
      <label className="admin-field"><span className="admin-field-label">Name</span><input name="name" defaultValue={provider.name} required maxLength={100}/></label>
      {typeNeedsIdentifier(provider.providerType) && <label className="admin-field"><span className="admin-field-label">Board token or site identifier</span><input name="identifier" defaultValue={config.board ?? config.site ?? ""} required pattern="[a-z0-9][a-z0-9_-]*"/></label>}
      {provider.providerType === "lever" && <AdminSelect
        name="region"
        label="Region"
        defaultValue={config.region ?? "global"}
        options={[{ value: "global", label: "Global" }, { value: "eu", label: "European Union" }]}
      />}
      <label className="admin-permission"><input name="permissionConfirmed" type="checkbox" required/> <span>I have permission to display jobs from this source.</span></label>
      {error && <span role="alert" className="admin-form-error">{error}</span>}
       <button className={`${siteStyles.button} button button-primary ${siteStyles.buttonPrimary}`} disabled={busy}>{busy ? "Saving…" : "Save provider"}</button>
    </form>}
  </div>;
}

function typeNeedsIdentifier(type: string) {
  return type === "greenhouse" || type === "lever";
}
