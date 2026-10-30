"use client";

import Script from "next/script";
import { adsConfig } from "@/config/ads";

export const adsenseReadyEvent = "futurvion:adsense-ready";

const hasConfiguredSlot = Object.values(adsConfig.placements).some(
  placement => placement.enabled && Boolean(placement.slot),
);

declare global {
  interface Window {
    __futurvionAdSenseReady?: boolean;
  }
}

export function AdSenseScript() {
  if (!adsConfig.enabled || !adsConfig.publisherId || !hasConfiguredSlot) {
    return null;
  }

  return (
    <Script
      id="futurvion-adsense"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsConfig.publisherId)}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
      onReady={() => {
        window.__futurvionAdSenseReady = true;
        window.dispatchEvent(new Event(adsenseReadyEvent));
      }}
      onError={() => {
        window.__futurvionAdSenseReady = false;
      }}
    />
  );
}
