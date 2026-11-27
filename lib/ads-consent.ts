export const advertisingConsentKey = "futurvion_ads_consent";
export const advertisingConsentChangedEvent = "futurvion:ads-consent-change";

export function hasAdvertisingConsent(): boolean {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(advertisingConsentKey) === "allow";
  } catch {
    return false;
  }
}
