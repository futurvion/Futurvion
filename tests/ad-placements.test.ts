import { afterEach, describe, expect, it, vi } from "vitest";
import { createAdsConfig, isAdAllowed } from "@/config/ads";
import {
  listingAdPositions,
  shouldPlaceArticleAd,
} from "@/lib/ad-placements";
import {
  advertisingConsentKey,
  hasAdvertisingConsent,
} from "@/lib/ads-consent";

afterEach(() => {
  vi.unmock("next/navigation");
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("AdSense configuration", () => {
  it("keeps ads disabled without the explicit global switch and consent readiness", () => {
    const config = createAdsConfig({
      NEXT_PUBLIC_ADSENSE_CLIENT_ID: "ca-pub-test",
      NEXT_PUBLIC_ADSENSE_SLOT_BLOG_CONTENT: "123",
    });

    expect(config.enabled).toBe(false);
  });

  it("requires a publisher ID and consent readiness before enabling ads", () => {
    const baseEnvironment = {
      NEXT_PUBLIC_ADSENSE_ENABLED: "true",
      NEXT_PUBLIC_ADSENSE_CONSENT_READY: "true",
    };

    expect(createAdsConfig(baseEnvironment).enabled).toBe(false);
    expect(
      createAdsConfig({
        ...baseEnvironment,
        NEXT_PUBLIC_ADSENSE_CLIENT_ID: "ca-pub-test",
      }).enabled,
    ).toBe(false);
    expect(
      createAdsConfig({
        ...baseEnvironment,
        NEXT_PUBLIC_ADSENSE_CLIENT_ID: "ca-pub-test",
        NEXT_PUBLIC_ADSENSE_SLOT_BLOG_CONTENT: "123",
      }).enabled,
    ).toBe(true);
  });

  it("keeps optional placements independently disabled when configured that way", () => {
    const config = createAdsConfig({});

    expect(config.placements.contentPage.enabled).toBe(false);
    expect(config.placements.blogContent.enabled).toBe(true);
    expect(config.placements.blogContent.slot).toBe("");
    expect(config.placements.jobsListing.interval).toBe(6);
  });

  it.each([
    ["/", false],
    ["/about", false],
    ["/contact", false],
    ["/services", false],
    ["/services/web-development", false],
    ["/solutions", false],
    ["/solutions/automation", false],
    ["/work", false],
    ["/work/example", false],
    ["/privacy-policy", false],
    ["/terms", false],
    ["/toolbox-internal/tools/json-formatter", false],
    ["/admin/login", false],
    ["/blog", true],
    ["/blog/", true],
    ["/blog/what-are-ai-agents", true],
    ["/jobs", true],
    ["/jobs/example-job", true],
    ["/blogging", false],
    ["/jobs-archive", false],
  ])("restricts ad eligibility for %s", (pathname, expected) => {
    expect(isAdAllowed(pathname)).toBe(expected);
  });

  it("removes eligibility when client navigation leaves an allowed section", () => {
    let pathname = "/blog";
    expect(isAdAllowed(pathname)).toBe(true);

    pathname = "/";
    expect(isAdAllowed(pathname)).toBe(false);

    pathname = "/services";
    expect(isAdAllowed(pathname)).toBe(false);
  });
});

describe("custom placement frequency", () => {
  it("places listing ads at intervals without an initial or trailing ad", () => {
    expect(listingAdPositions(3, 4)).toEqual([]);
    expect(listingAdPositions(4, 4)).toEqual([]);
    expect(listingAdPositions(9, 4)).toEqual([4, 8]);
    expect(listingAdPositions(13, 6)).toEqual([6, 12]);
    expect(listingAdPositions(9, 0)).toEqual([]);
  });

  it("places article ads only at configured boundaries before another section", () => {
    expect(shouldPlaceArticleAd(1, 6, 2, 3)).toBe(false);
    expect(shouldPlaceArticleAd(2, 6, 2, 3)).toBe(true);
    expect(shouldPlaceArticleAd(4, 6, 2, 3)).toBe(false);
    expect(shouldPlaceArticleAd(5, 6, 2, 3)).toBe(true);
    expect(shouldPlaceArticleAd(6, 6, 2, 3)).toBe(false);
  });
});

describe("advertising consent", () => {
  it("fails closed unless advertising consent was explicitly stored", () => {
    vi.stubGlobal("window", {
      localStorage: { getItem: () => null },
    });

    expect(hasAdvertisingConsent()).toBe(false);
  });

  it("recognizes the separate advertising opt-in", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) =>
          key === advertisingConsentKey ? "allow" : null,
      },
    });

    expect(hasAdvertisingConsent()).toBe(true);
  });
});

describe("AdUnit rendering", () => {
  it("omits a unit when the publisher configuration is disabled", async () => {
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_ENABLED", "false");
    vi.resetModules();
    vi.doMock("next/navigation", () => ({ usePathname: () => "/blog" }));
    const { AdUnit } = await import("@/components/ads/ad-unit");
    const { createElement } = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");

    expect(
      renderToStaticMarkup(
        createElement(AdUnit, { placement: "blogContent" }),
      ),
    ).toBe("");
  });

  it("omits a unit when its slot ID is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CONSENT_READY", "true");
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT_ID", "ca-pub-test");
    vi.resetModules();
    vi.doMock("next/navigation", () => ({ usePathname: () => "/blog" }));
    const { AdUnit } = await import("@/components/ads/ad-unit");
    const { createElement } = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");

    expect(
      renderToStaticMarkup(
        createElement(AdUnit, { placement: "blogContent" }),
      ),
    ).toBe("");
  });

});
