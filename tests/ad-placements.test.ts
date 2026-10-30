import { afterEach, describe, expect, it, vi } from "vitest";
import { createAdsConfig, isAdRouteExcluded } from "@/config/ads";
import {
  listingAdPositions,
  shouldPlaceArticleAd,
} from "@/lib/ad-placements";

afterEach(() => {
  vi.unstubAllEnvs();
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
    ).toBe(true);
  });

  it("keeps optional placements independently disabled when configured that way", () => {
    const config = createAdsConfig({});

    expect(config.placements.contentPage.enabled).toBe(false);
    expect(config.placements.blogContent.enabled).toBe(true);
    expect(config.placements.blogContent.slot).toBe("");
  });

  it("excludes contact, job, and about routes including their subroutes", () => {
    for (const pathname of [
      "/contact",
      "/contact/",
      "/jobs",
      "/jobs/example-role",
      "/about",
    ]) {
      expect(isAdRouteExcluded(pathname)).toBe(true);
    }

    expect(isAdRouteExcluded("/blog")).toBe(false);
  });
});

describe("custom placement frequency", () => {
  it("places listing ads at intervals without an initial or trailing ad", () => {
    expect(listingAdPositions(3, 4)).toEqual([]);
    expect(listingAdPositions(4, 4)).toEqual([]);
    expect(listingAdPositions(9, 4)).toEqual([4, 8]);
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

describe("AdUnit rendering", () => {
  it("omits a unit when the publisher configuration is disabled", async () => {
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_ENABLED", "false");
    vi.resetModules();
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
    const { AdUnit } = await import("@/components/ads/ad-unit");
    const { createElement } = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");

    expect(
      renderToStaticMarkup(
        createElement(AdUnit, { placement: "blogContent" }),
      ),
    ).toBe("");
  });

  it("renders official responsive unit attributes when configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CONSENT_READY", "true");
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT_ID", "ca-pub-test");
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_SLOT_BLOG_CONTENT", "slot-test");
    vi.resetModules();
    const [{ AdUnit }, react, server] = await Promise.all([
      import("@/components/ads/ad-unit"),
      import("react"),
      import("react-dom/server"),
    ]);

    const markup = server.renderToStaticMarkup(
      react.createElement(AdUnit, { placement: "blogContent" }),
    );

    expect(markup).toContain('class="adsbygoogle"');
    expect(markup).toContain('data-ad-client="ca-pub-test"');
    expect(markup).toContain('data-ad-slot="slot-test"');
    expect(markup).toContain('data-ad-format="auto"');
    expect(markup).toContain('data-full-width-responsive="true"');
  });
});
