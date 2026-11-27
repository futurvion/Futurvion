"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const items = [
  { href: "/admin", label: "Overview", number: "01", caption: "Control center" },
  { href: "/admin/jobs", label: "Jobs", number: "02", caption: "Sources & sync" },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setError("Could not sign out. Please try again.");
      setBusy(false);
    }
  }

  return <aside className="admin-sidebar">
    <div className="admin-sidebar-brand">
      <Link className="admin-sidebar-logo" href="/admin" aria-label="Futurvion admin workspace" title="Futurvion admin workspace"><Image className="admin-sidebar-logo-image" src="/logo-full-white.png" alt="Futurvion — Digital Solutions for Every Business" width={2160} height={728} sizes="190px" preload /></Link>
      <span className="admin-sidebar-kicker">Private operations</span>
    </div>
    <div className="admin-sidebar-nav-heading"><span>Workspace</span><span>02 modules</span></div>
    <nav aria-label="Admin sections">
      {items.map(item => {
        const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
        return <Link className="admin-sidebar-link" key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
          <span className="admin-sidebar-link-number">{item.number}</span>
          <span className="admin-sidebar-link-copy"><strong>{item.label}</strong><small>{item.caption}</small></span>
          <span className="admin-sidebar-link-arrow" aria-hidden="true">↗</span>
        </Link>;
      })}
    </nav>
    <div className="admin-sidebar-bottom">
      <div className="admin-sidebar-status"><i aria-hidden="true"/><span><strong>System online</strong><small>Protected session active</small></span></div>
      <Link className="admin-sidebar-public-link" href="/jobs" target="_blank" rel="noreferrer">Open public board <span aria-hidden="true">↗</span></Link>
      <div className="admin-sidebar-account"><span>Signed in as</span><strong>{email}</strong><button type="button" onClick={signOut} disabled={busy}>{busy ? "Signing out…" : "Sign out"}<span aria-hidden="true">↗</span></button>{error && <p role="alert">{error}</p>}</div>
    </div>
  </aside>;
}
