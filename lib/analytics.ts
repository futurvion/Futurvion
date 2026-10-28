export type AnalyticsEventParameters = {
  contact_click: { destination: "contact" | "email" | "booking" };
  contact_submit: Record<string, never>;
  service_view: { service_slug: string };
  cta_click: { cta_type: "header" | "primary" | "navigation" };
  job_search: { filter_count: number };
  job_filter: { filter_count: number };
  job_view: { job_id: string };
  apply_click: { job_id: string };
  resume_match_start: Record<string, never>;
  resume_match_complete: { result_count: number };
};

export type AnalyticsEventName = keyof AnalyticsEventParameters;

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
    clarity?: ClarityFunction;
  }
}

const consentKey = "futurvion_analytics_consent";
let initializedMeasurementId = "";
let initializedClarityProjectId = "";

type ClarityFunction = ((method: string, ...args: unknown[]) => void) & {
  q?: unknown[][];
};

const deniedConsent = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
};

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(consentKey) === "allow";
  } catch {
    return false;
  }
}

export function updateThirdPartyConsent(granted: boolean): void {
  if (typeof window === "undefined") return;
  const consent = granted ? "granted" : "denied";

  window.gtag?.("consent", "update", {
    analytics_storage: consent,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.clarity?.("consentv2", {
    ad_Storage: "denied",
    analytics_Storage: consent,
  });
}

export function initializeThirdPartyAnalytics(
  measurementId: string | undefined,
  clarityProjectId: string | undefined,
): void {
  if (!hasAnalyticsConsent()) return;

  if (measurementId && initializedMeasurementId !== measurementId) {
    window.dataLayer ??= [];
    window.gtag ??= (...args: unknown[]) => window.dataLayer?.push(args);
    window.gtag("consent", "default", deniedConsent);
    updateThirdPartyConsent(true);
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    if (!document.getElementById("futurvion-ga-script")) {
      const script = document.createElement("script");
      script.id = "futurvion-ga-script";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);
    }
    initializedMeasurementId = measurementId;
  }

  if (clarityProjectId && initializedClarityProjectId !== clarityProjectId) {
    window.clarity ??= Object.assign(
      (...args: unknown[]) => window.clarity?.q?.push(args),
      { q: [] as unknown[][] },
    );
    updateThirdPartyConsent(true);

    if (!document.getElementById("futurvion-clarity-script")) {
      const script = document.createElement("script");
      script.id = "futurvion-clarity-script";
      script.async = true;
      script.src = `https://www.clarity.ms/tag/${encodeURIComponent(clarityProjectId)}`;
      document.head.appendChild(script);
    }
    initializedClarityProjectId = clarityProjectId;
  }
}

export function trackEvent<EventName extends AnalyticsEventName>(
  name: EventName,
  parameters: AnalyticsEventParameters[EventName],
): void {
  if (!hasAnalyticsConsent()) return;

  if (window.gtag) window.gtag("event", name, parameters);
  if (window.clarity) window.clarity("event", name);
}

export function trackPageView(path: string): void {
  if (!hasAnalyticsConsent() || !window.gtag) return;

  const pagePath = path.split(/[?#]/, 1)[0];
  if (!pagePath.startsWith("/") || pagePath.startsWith("//")) return;

  let pageReferrer = "";
  if (document.referrer) {
    try {
      const referrer = new URL(document.referrer);
      pageReferrer = `${referrer.origin}${referrer.pathname}`;
    } catch {
      pageReferrer = "";
    }
  }

  window.gtag("event", "page_view", {
    page_path: pagePath,
    page_location: `${window.location.origin}${pagePath}`,
    page_title: pagePath,
    page_referrer: pageReferrer,
  });
}
