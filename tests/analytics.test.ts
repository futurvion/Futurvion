import { afterEach, describe, expect, it, vi } from "vitest";
import {
  hasAnalyticsConsent,
  trackEvent,
  trackPageView,
} from "@/lib/analytics";

afterEach(() => {
  vi.unmock("next/navigation");
  vi.resetModules();
  vi.unstubAllGlobals();
});

describe("analytics helpers", () => {
  it("enables analytics by default unless the visitor opted out", () => {
    vi.stubGlobal("window", {
      localStorage: { getItem: () => null },
    });

    expect(hasAnalyticsConsent()).toBe(true);

    vi.stubGlobal("window", {
      localStorage: { getItem: () => "deny" },
    });

    expect(hasAnalyticsConsent()).toBe(false);
  });

  it("does not send events after analytics has been rejected", () => {
    const gtag = vi.fn();
    const clarity = vi.fn();
    vi.stubGlobal("window", {
      localStorage: { getItem: () => "deny" },
      gtag,
      clarity,
    });

    trackEvent("contact_submit", {});

    expect(gtag).not.toHaveBeenCalled();
    expect(clarity).not.toHaveBeenCalled();
  });

  it("shows advertising controls without an initial analytics allow prompt", async () => {
    vi.doMock("next/navigation", () => ({ usePathname: () => "/blog" }));
    const { AnalyticsConsent } = await import(
      "@/features/analytics/components/analytics-consent"
    );
    const { createElement } = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");

    const markup = renderToStaticMarkup(
      createElement(AnalyticsConsent, { enabled: true, adsEnabled: true }),
    );

    expect(markup).toContain("Reject advertising");
    expect(markup).toContain("Allow advertising");
    expect(markup).not.toContain("Allow analytics");
    expect(markup).not.toContain("Reject analytics");
  });

  it("sends typed event names and only the supplied non-sensitive parameters", () => {
    const gtag = vi.fn();
    const clarity = vi.fn();
    vi.stubGlobal("window", {
      localStorage: { getItem: () => "allow" },
      gtag,
      clarity,
    });

    trackEvent("job_search", { filter_count: 2 });

    expect(gtag).toHaveBeenCalledWith("event", "job_search", { filter_count: 2 });
    expect(clarity).toHaveBeenCalledWith("event", "job_search");
  });

  it("sends path-only page views without query or fragment values", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", {
      localStorage: { getItem: () => "allow" },
      location: { origin: "https://futurvion.example" },
      gtag,
    });
    vi.stubGlobal("document", {
      referrer: "https://search.example/results?private=term#top",
    });

    trackPageView("/jobs/role-slug?email=private@example.com#apply");

    expect(gtag).toHaveBeenCalledWith("event", "page_view", {
      page_path: "/jobs/role-slug",
      page_location: "https://futurvion.example/jobs/role-slug",
      page_title: "/jobs/role-slug",
      page_referrer: "https://search.example/results",
    });
    expect(JSON.stringify(gtag.mock.calls)).not.toContain("private");
  });
});
