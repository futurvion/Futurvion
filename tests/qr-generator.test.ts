import { describe, expect, it } from "vitest";
import { buildQrPayload } from "@/lib/tools/qr-generator";

describe("QR generator payload utilities", () => {
  it("builds valid payloads for URL, email, phone, SMS, Wi‑Fi, and contact cards", () => {
    expect(buildQrPayload("url", { url: "example.com" }).payload).toBe("https://example.com/");
    expect(buildQrPayload("text", { text: "hello" }).payload).toBe("hello");
    expect(buildQrPayload("email", { email: "team@example.com", subject: "Hello", message: "Hi there" }).payload).toContain("mailto:team@example.com");
    expect(buildQrPayload("phone", { phone: "+1 (415) 555-1234" }).payload).toBe("tel:+1 (415) 555-1234");
    expect(buildQrPayload("sms", { smsPhone: "+1 415 555 1234", smsMessage: "Hi there" }).payload).toContain("smsto:+1 415 555 1234");
    expect(buildQrPayload("wifi", { wifiSsid: "Guest Wi‑Fi", wifiPassword: "P@ss!word", wifiSecurity: "WPA" }).payload).toContain("WIFI:T:WPA");
    expect(buildQrPayload("wifi", { wifiSsid: "Open Network", wifiSecurity: "None" }).payload).toContain("T:nopass");
    const vCard = buildQrPayload("vcard", {
      fullName: "Jane Smith",
      contactPhone: "+1 415 555 1234",
      contactEmail: "jane@example.com",
      organization: "Futurvion",
      website: "https://example.com",
    }).payload;
    expect(vCard).toContain("BEGIN:VCARD");
    expect(vCard).toContain("FN:Jane Smith");
  });

  it("rejects invalid values", () => {
    expect(buildQrPayload("url", { url: "bad url" }).valid).toBe(false);
    expect(buildQrPayload("email", { email: "bad-email" }).valid).toBe(false);
    expect(buildQrPayload("phone", { phone: "123" }).valid).toBe(false);
    expect(buildQrPayload("wifi", { wifiSecurity: "WPA" }).valid).toBe(false);
    expect(buildQrPayload("vcard", { fullName: "Jane Smith" }).valid).toBe(false);
  });
});
