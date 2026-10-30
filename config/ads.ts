export type AdPlacementName =
  | "blogContent"
  | "blogSidebar"
  | "blogListing"
  | "contentPage";

type AdsEnvironment = Record<string, string | undefined>;

export function createAdsConfig(environment: AdsEnvironment) {
  const publisherId = environment.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() ?? "";
  const enabled =
    environment.NEXT_PUBLIC_ADSENSE_ENABLED === "true" &&
    environment.NEXT_PUBLIC_ADSENSE_CONSENT_READY === "true" &&
    Boolean(publisherId);

  return {
    enabled,
    publisherId,
    placements: {
      blogContent: {
        enabled: true,
        slot: environment.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_CONTENT?.trim() ?? "",
        initialSection: 2,
        interval: 3,
      },
      blogSidebar: {
        enabled: true,
        slot: environment.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_SIDEBAR?.trim() ?? "",
        desktopOnly: true,
      },
      blogListing: {
        enabled: true,
        slot: environment.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_LISTING?.trim() ?? "",
        interval: 4,
      },
      contentPage: {
        enabled: false,
        slot: environment.NEXT_PUBLIC_ADSENSE_SLOT_CONTENT_PAGE?.trim() ?? "",
      },
    },
  } as const;
}

export const adsConfig = createAdsConfig({
  NEXT_PUBLIC_ADSENSE_CLIENT_ID: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
  NEXT_PUBLIC_ADSENSE_ENABLED: process.env.NEXT_PUBLIC_ADSENSE_ENABLED,
  NEXT_PUBLIC_ADSENSE_CONSENT_READY:
    process.env.NEXT_PUBLIC_ADSENSE_CONSENT_READY,
  NEXT_PUBLIC_ADSENSE_SLOT_BLOG_CONTENT:
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_CONTENT,
  NEXT_PUBLIC_ADSENSE_SLOT_BLOG_SIDEBAR:
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_SIDEBAR,
  NEXT_PUBLIC_ADSENSE_SLOT_BLOG_LISTING:
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_LISTING,
  NEXT_PUBLIC_ADSENSE_SLOT_CONTENT_PAGE:
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_CONTENT_PAGE,
});

export function canRenderAd(placement: AdPlacementName): boolean {
  const config = adsConfig.placements[placement];
  return adsConfig.enabled && config.enabled && Boolean(config.slot);
}

const excludedRoutePrefixes = ["/contact", "/jobs", "/about"] as const;

export function isAdRouteExcluded(pathname: string): boolean {
  return excludedRoutePrefixes.some(
    route => pathname === route || pathname.startsWith(`${route}/`),
  );
}
