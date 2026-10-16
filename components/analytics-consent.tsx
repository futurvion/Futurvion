"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const consentKey = "futurvion_analytics_consent";
const visitorKey = "futurvion_visitor_id";
const sessionKey = "futurvion_session";
let lastPage = "";
let lastPageAt = 0;

function identifiers() {
  let visitorId = localStorage.getItem(visitorKey);
  if (!visitorId) { visitorId = crypto.randomUUID(); localStorage.setItem(visitorKey, visitorId); }
  const stored = JSON.parse(sessionStorage.getItem(sessionKey) || "null") as { id: string; at: number } | null;
  const sessionId = stored && Date.now() - stored.at < 30 * 60 * 1000 ? stored.id : crypto.randomUUID();
  sessionStorage.setItem(sessionKey, JSON.stringify({ id: sessionId, at: Date.now() }));
  return { visitorId, sessionId };
}
function referrerCategory(): "direct" | "search" | "social" | "external" | "internal" {
  if (!document.referrer) return "direct";
  try { const ref = new URL(document.referrer); if (ref.hostname === location.hostname) return "internal"; if (/google|bing|duckduckgo|yahoo/i.test(ref.hostname)) return "search"; if (/facebook|instagram|linkedin|twitter|x\.com|tiktok/i.test(ref.hostname)) return "social"; return "external"; } catch { return "direct"; }
}
function send(type: "page_view" | "service_cta" | "contact_conversion", path: string) {
  if (localStorage.getItem(consentKey) !== "allow") return;
  const { visitorId, sessionId } = identifiers();
  const deviceCategory = window.innerWidth < 650 ? "mobile" : window.innerWidth < 1000 ? "tablet" : "desktop";
  void fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true, body: JSON.stringify({ eventId: crypto.randomUUID(), type, path, visitorId, sessionId, consent: true, referrerCategory: referrerCategory(), deviceCategory }) }).catch(() => {});
}
export function AnalyticsConsent({ enabled }: { enabled: boolean }) {
  const path = usePathname();
  const [choice, setChoice] = useState<"allow" | "deny" | null>(null);
  useEffect(() => { setChoice(localStorage.getItem(consentKey) as "allow" | "deny" | null); }, []);
  useEffect(() => { if (!enabled || choice !== "allow") return; if (lastPage === path && Date.now() - lastPageAt < 1500) return; lastPage = path; lastPageAt = Date.now(); send("page_view", path); }, [enabled, choice, path]);
  useEffect(() => {
    if (!enabled) return;
    const click = (event: MouseEvent) => { const anchor = (event.target as Element).closest("a"); if (anchor && (anchor.pathname.startsWith("/services/") || anchor.searchParams?.has?.("service"))) send("service_cta", location.pathname); };
    const conversion = () => send("contact_conversion", location.pathname);
    document.addEventListener("click", click);
    window.addEventListener("futurvion:conversion", conversion);
    return () => { document.removeEventListener("click", click); window.removeEventListener("futurvion:conversion", conversion); };
  }, [enabled]);
  if (!enabled || choice) return null;
  return <div className="consent-banner" role="dialog" aria-label="Analytics choice"><p>May we use privacy-aware analytics to understand how this site is used? It starts only if you agree. <a href="/privacy-policy">Learn more</a></p><div><button type="button" onClick={() => { localStorage.setItem(consentKey, "deny"); setChoice("deny"); }}>Decline</button><button type="button" onClick={() => { localStorage.setItem(consentKey, "allow"); setChoice("allow"); }}>Allow analytics</button></div></div>;
}
