"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";
import {
  adsConfig,
  canRenderAd,
  isAdAllowed,
  type AdPlacementName,
} from "@/config/ads";
import { adsenseReadyEvent } from "@/components/ads/adsense-script";
import {
  advertisingConsentChangedEvent,
  hasAdvertisingConsent,
} from "@/lib/ads-consent";
import { shouldPlaceArticleAd } from "@/lib/ad-placements";

declare global {
  interface Window {
    adsbygoogle?: {
      push: (unit: Record<string, never>) => number;
    };
  }
}

const initializedUnits = new WeakSet<HTMLElement>();

type AdUnitProps = {
  placement: AdPlacementName;
  className?: string;
  style?: CSSProperties;
};

export function AdUnit({ placement, className = "", style }: AdUnitProps) {
  const pathname = usePathname();
  const elementRef = useRef<HTMLModElement>(null);
  const placementConfig = adsConfig.placements[placement];
  const [consent, setConsent] = useState(false);
  const routeAllowed = isAdAllowed(pathname);

  useEffect(() => {
    const updateConsent = () => setConsent(hasAdvertisingConsent());
    updateConsent();
    window.addEventListener(advertisingConsentChangedEvent, updateConsent);
    return () =>
      window.removeEventListener(
        advertisingConsentChangedEvent,
        updateConsent,
      );
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!consent || !routeAllowed || !element || !canRenderAd(placement)) {
      return;
    }

    const initialize = () => {
      if (
        !element.isConnected ||
        initializedUnits.has(element) ||
        !window.adsbygoogle
      ) {
        return;
      }

      initializedUnits.add(element);
      window.adsbygoogle.push({});
    };

    if (window.__futurvionAdSenseReady) initialize();
    window.addEventListener(adsenseReadyEvent, initialize);

    return () => window.removeEventListener(adsenseReadyEvent, initialize);
  }, [consent, pathname, placement, routeAllowed]);

  if (
    !consent ||
    !routeAllowed ||
    !canRenderAd(placement) ||
    !placementConfig.slot
  ) {
    return null;
  }

  return (
    <aside
      className={`ad-unit ad-unit--${placement} ${className}`.trim()}
      aria-label="Advertisement"
    >
      <span className="ad-unit-label">Advertisements</span>
      <ins
        ref={elementRef}
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={adsConfig.publisherId}
        data-ad-slot={placementConfig.slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}

export function InContentAd({
  completedSections,
  totalSections,
}: {
  completedSections: number;
  totalSections: number;
}) {
  const { initialSection, interval } = adsConfig.placements.blogContent;
  if (
    !canRenderAd("blogContent") ||
    !shouldPlaceArticleAd(
      completedSections,
      totalSections,
      initialSection,
      interval,
    )
  ) {
    return null;
  }

  return <AdUnit placement="blogContent" />;
}

export function SidebarAd() {
  return <AdUnit placement="blogSidebar" />;
}

export function ListingAd({
  placement = "blogListing",
}: {
  placement?: "blogListing" | "jobsListing";
}) {
  return <AdUnit placement={placement} />;
}
