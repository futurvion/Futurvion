"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { adsConfig, canRenderAd, type AdPlacementName } from "@/config/ads";
import { adsenseReadyEvent } from "@/components/ads/adsense-script";
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
  const elementRef = useRef<HTMLModElement>(null);
  const placementConfig = adsConfig.placements[placement];

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !canRenderAd(placement)) return;

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
  }, [placement]);

  if (!canRenderAd(placement) || !placementConfig.slot) return null;

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

export function ListingAd() {
  return <AdUnit placement="blogListing" />;
}
