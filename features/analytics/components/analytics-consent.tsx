"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  hasAnalyticsConsent,
  initializeThirdPartyAnalytics,
  trackEvent,
  trackPageView,
  updateThirdPartyConsent,
} from "@/lib/analytics";

const consentKey = "futurvion_analytics_consent";
const visitorKey = "futurvion_visitor_id";
const sessionKey = "futurvion_session";
let lastPage = "";

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
  if (!hasAnalyticsConsent()) return;
  const { visitorId, sessionId } = identifiers();
  const deviceCategory = window.innerWidth < 650 ? "mobile" : window.innerWidth < 1000 ? "tablet" : "desktop";
  void fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true, body: JSON.stringify({ eventId: crypto.randomUUID(), type, path, visitorId, sessionId, consent: true, referrerCategory: referrerCategory(), deviceCategory }) }).catch(() => {});
}

export function AnalyticsConsent({ enabled }: { enabled: boolean }) {
  const path = usePathname();
  const [choice, setChoice] = useState<"allow" | "deny" | null>(null);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const saveChoice = useCallback((next: "allow" | "deny") => {
    try {
      localStorage.setItem(consentKey, next);
    } catch {
      setChoice("deny");
      return;
    }

    const granted = next === "allow";
    updateThirdPartyConsent(granted);
    setChoice(next);
    setPreferencesOpen(false);
    if (!granted) lastPage = "";
  }, []);

  useEffect(() => {
    let stored: "allow" | "deny" | null = null;
    try {
      const value = localStorage.getItem(consentKey);
      if (value === "allow" || value === "deny") stored = value;
    } catch {
      stored = "deny";
    }
    if (stored) queueMicrotask(() => setChoice(stored));
  }, []);

  useEffect(() => {
    const openPreferences = () => setPreferencesOpen(true);
    window.addEventListener("futurvion:open-analytics-preferences", openPreferences);
    return () => window.removeEventListener("futurvion:open-analytics-preferences", openPreferences);
  }, []);

  useEffect(() => {
    if (choice !== "allow") return;
    initializeThirdPartyAnalytics(
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
    );
  }, [choice]);

  useEffect(() => {
    if (!enabled || choice !== "allow" || !path || lastPage === path) return;
    lastPage = path;
    trackPageView(path);
    send("page_view", path);
    const serviceSlug = path.match(/^\/services\/([^/]+)\/?$/)?.[1];
    if (serviceSlug) trackEvent("service_view", { service_slug: serviceSlug });
    const jobId = path.match(/^\/jobs\/([^/]+)\/?$/)?.[1];
    if (jobId) trackEvent("job_view", { job_id: jobId });
  }, [enabled, choice, path]);

  useEffect(() => {
    if (!enabled) return;
    const click = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;

      if (anchor.pathname.startsWith("/services/") || new URL(anchor.href).searchParams.has("service")) {
        send("service_cta", location.pathname);
      }

      if (anchor.pathname === "/contact") trackEvent("contact_click", { destination: "contact" });
      else if (anchor.protocol === "mailto:") trackEvent("contact_click", { destination: "email" });
      else if (anchor.classList.contains("header-cta")) trackEvent("contact_click", { destination: "booking" });

      if (anchor.matches(".button, .header-cta, .mobile-book")) {
        const ctaType = anchor.classList.contains("header-cta")
          ? "header"
          : anchor.classList.contains("button")
            ? "primary"
            : "navigation";
        trackEvent("cta_click", { cta_type: ctaType });
      }

      const applyLink = anchor.dataset.analyticsEvent === "apply_click";
      const jobId = anchor.dataset.jobId;
      if (applyLink && jobId) trackEvent("apply_click", { job_id: jobId });
    };
    const conversion = () => {
      send("contact_conversion", location.pathname);
      trackEvent("contact_submit", {});
    };
    document.addEventListener("click", click);
    window.addEventListener("futurvion:conversion", conversion);
    return () => { document.removeEventListener("click", click); window.removeEventListener("futurvion:conversion", conversion); };
  }, [enabled]);

  if (!enabled) return null;

  return <>
    {(!choice || preferencesOpen) && <div className="consent-banner" role="dialog" aria-label="Analytics preferences">
      <p>Optional analytics helps us understand site usage. It starts only if you allow it. <a href="/privacy-policy">Learn more</a></p>
      <div>
        <button type="button" onClick={() => saveChoice("deny")}>Reject optional analytics</button>
        <button className="consent-allow-button" type="button" onClick={() => saveChoice("allow")}>Allow analytics</button>
        {choice && <button type="button" onClick={() => setPreferencesOpen(false)}>Close</button>}
      </div>
    </div>}
  </>;
}

export function AnalyticsPreferencesButton({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  return <button
    type="button"
    className="analytics-preferences-button"
    onClick={() => window.dispatchEvent(new Event("futurvion:open-analytics-preferences"))}
  >
    Change analytics preferences
  </button>;
}
