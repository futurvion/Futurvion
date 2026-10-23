"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const items = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/jobs", label: "Jobs" },
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
    <div className="admin-sidebar-brand"><span className="eyebrow">Futurvion</span><strong>Admin workspace</strong></div>
    <nav aria-label="Admin sections"><span className="admin-sidebar-label">Workspace</span>
      {items.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/")) ? "page" : undefined}>{item.label}<span aria-hidden="true">↗</span></Link>)}
    </nav>
    <div className="admin-sidebar-account"><span>Signed in as</span><strong>{email}</strong><button type="button" onClick={signOut} disabled={busy}>{busy ? "Signing out…" : "Sign out"}</button>{error && <p role="alert">{error}</p>}</div>
  </aside>;
}
