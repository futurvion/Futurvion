import { afterEach, describe, expect, it, vi } from "vitest";
import { trackEvent, trackPageView } from "@/lib/analytics";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("analytics helpers", () => {
  it("does not send events without explicit analytics consent", () => {
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
