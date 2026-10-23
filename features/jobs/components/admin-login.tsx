"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { siteStyles } from "@/config/styles";
export function AdminLogin() {
  const router = useRouter(); const [show, setShow] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try { const response = await fetch("/api/admin/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
      if (!response.ok) { const body = await response.json(); setError(body.error ?? "Sign in failed"); return; } router.replace("/admin"); router.refresh();
    } catch { setError("Sign in is temporarily unavailable."); } finally { setBusy(false); }
  }
  return <form className="admin-login" onSubmit={submit}><span className={`${siteStyles.eyebrow} eyebrow`}>Private workspace</span><h1>Admin sign in</h1><p>Sign in to manage your Futurvion workspace.</p><label>Email<input name="email" type="email" autoComplete="username" required/></label><label>Password<span className="admin-password"><input name="password" type={show ? "text" : "password"} autoComplete="current-password" required/><button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>{show ? "Hide" : "Show"}</button></span></label>{error && <p role="alert" className="admin-error">{error}</p>}<button className={`${siteStyles.button} button button-primary ${siteStyles.buttonPrimary}`} disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form>;
}
