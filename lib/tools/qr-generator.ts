export const qrTypeOptions = [
  { value: "url", label: "URL / Website" },
  { value: "text", label: "Plain Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone Number" },
  { value: "sms", label: "SMS" },
  { value: "wifi", label: "Wi‑Fi" },
  { value: "vcard", label: "Contact / vCard" },
] as const;

export type QRType = (typeof qrTypeOptions)[number]["value"];

export const defaultQrFormValues = {
  url: "",
  text: "",
  email: "",
  subject: "",
  message: "",
  phone: "",
  smsPhone: "",
  smsMessage: "",
  wifiSsid: "",
  wifiPassword: "",
  wifiSecurity: "WPA" as "WPA" | "WEP" | "None",
  wifiHidden: false,
  fullName: "",
  contactPhone: "",
  contactEmail: "",
  organization: "",
  website: "",
};

export type QrFormValues = typeof defaultQrFormValues;

export const defaultQrCustomization = {
  foreground: "#000000",
  background: "#ffffff",
  size: 512,
  errorCorrection: "M" as const,
  margin: 2,
};

export type QrCustomization = typeof defaultQrCustomization;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhoneNumber(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const normalized = trimmed.replace(/\s+/g, "");
  return /^\+?[0-9()\-]+$/.test(normalized) && normalized.replace(/\D/g, "").length >= 7;
}

export function normalizeQrUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const candidate = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    if (!/^(https?:)$/.test(url.protocol)) return "";
    return url.toString();
  } catch {
    return "";
  }
}

function escapeWifiValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, " ");
}

export function buildQrPayload(
  type: QRType,
  values: Partial<QrFormValues>,
): { valid: boolean; error: string | null; payload: string } {
  const safeValues = { ...defaultQrFormValues, ...values };

  switch (type) {
    case "url": {
      const payload = normalizeQrUrl(safeValues.url);
      if (!payload) {
        return { valid: false, error: "Enter a valid website URL, such as https://example.com.", payload: "" };
      }
      return { valid: true, error: null, payload };
    }
    case "text": {
      const payload = safeValues.text.trim();
      if (!payload) {
        return { valid: false, error: "Enter some text to generate a QR code.", payload: "" };
      }
      return { valid: true, error: null, payload };
    }
    case "email": {
      const email = safeValues.email.trim();
      if (!email || !isValidEmail(email)) {
        return { valid: false, error: "Enter a valid email address.", payload: "" };
      }
      const query = new URLSearchParams();
      if (safeValues.subject.trim()) query.set("subject", safeValues.subject.trim());
      if (safeValues.message.trim()) query.set("body", safeValues.message.trim());
      const payload = query.size > 0 ? `mailto:${email}?${query.toString()}` : `mailto:${email}`;
      return { valid: true, error: null, payload };
    }
    case "phone": {
      const phone = safeValues.phone.trim();
      if (!isValidPhoneNumber(phone)) {
        return { valid: false, error: "Enter a valid phone number.", payload: "" };
      }
      return { valid: true, error: null, payload: `tel:${phone}` };
    }
    case "sms": {
      const phone = safeValues.smsPhone.trim();
      if (!isValidPhoneNumber(phone)) {
        return { valid: false, error: "Enter a valid phone number for the message.", payload: "" };
      }
      const message = safeValues.smsMessage.trim();
      const payload = message
        ? `smsto:${phone}?body=${encodeURIComponent(message)}`
        : `smsto:${phone}`;
      return { valid: true, error: null, payload };
    }
    case "wifi": {
      const wifiName = safeValues.wifiSsid.trim();
      if (!wifiName) {
        return { valid: false, error: "Enter the Wi‑Fi network name (SSID).", payload: "" };
      }

      const security = safeValues.wifiSecurity === "WPA"
        ? "WPA"
        : safeValues.wifiSecurity === "WEP"
          ? "WEP"
          : "nopass";

      const passwordValue = security === "nopass" ? "" : safeValues.wifiPassword || "";
      const wifiPayload = `WIFI:T:${security};S:${escapeWifiValue(wifiName)};P:${escapeWifiValue(passwordValue)};H:${safeValues.wifiHidden ? "true" : "false"};;`;

      return { valid: true, error: null, payload: wifiPayload };
    }
    case "vcard": {
      const fullName = safeValues.fullName.trim();
      const phone = safeValues.contactPhone.trim();
      const email = safeValues.contactEmail.trim();

      if (!fullName) {
        return { valid: false, error: "Enter the contact full name.", payload: "" };
      }

      if (!phone && !email) {
        return {
          valid: false,
          error: "Add at least one phone number or email address for the contact card.",
          payload: "",
        };
      }

      if (phone && !isValidPhoneNumber(phone)) {
        return { valid: false, error: "Enter a valid phone number for the contact card.", payload: "" };
      }
      if (email && !isValidEmail(email)) {
        return { valid: false, error: "Enter a valid email address for the contact card.", payload: "" };
      }

      const cardLines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${escapeVCardValue(fullName)}`,
        phone ? `TEL;TYPE=CELL:${escapeVCardValue(phone)}` : "",
        email ? `EMAIL:${escapeVCardValue(email)}` : "",
        safeValues.organization.trim() ? `ORG:${escapeVCardValue(safeValues.organization.trim())}` : "",
        safeValues.website.trim() ? `URL:${escapeVCardValue(safeValues.website.trim())}` : "",
        "END:VCARD",
      ].filter(Boolean);

      return { valid: true, error: null, payload: cardLines.join("\n") };
    }
    default:
      return { valid: false, error: "Select a QR type to begin.", payload: "" };
  }
}

export function getQrValidationMessage(type: QRType, values: Partial<QrFormValues>): string | null {
  const result = buildQrPayload(type, values);
  return result.error;
}
