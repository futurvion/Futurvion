import { describe, expect, it } from "vitest";
import { analyticsSchema, contactSchema } from "@/lib/validation";

const valid = { name: "Ada Lovelace", email: "ada@example.com", service: "branding", description: "We need a new brand identity for our company.", consent: "yes" };

describe("contactSchema", () => {
  it("accepts a valid enquiry", () => expect(contactSchema.safeParse(valid).success).toBe(true));
  it("requires consent", () => expect(contactSchema.safeParse({ ...valid, consent: "no" }).success).toBe(false));
  it("rejects unknown services", () => expect(contactSchema.safeParse({ ...valid, service: "nope" }).success).toBe(false));
  it("rejects invalid email and short descriptions", () => {
    expect(contactSchema.safeParse({ ...valid, email: "bad" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, description: "short" }).success).toBe(false);
  });
});

describe("analyticsSchema", () => {
  const event = { eventId: crypto.randomUUID(), type: "page_view", path: "/services", visitorId: crypto.randomUUID(), sessionId: crypto.randomUUID(), consent: true };
  it("accepts a consented page view", () => expect(analyticsSchema.safeParse(event).success).toBe(true));
  it("rejects events without consent", () => expect(analyticsSchema.safeParse({ ...event, consent: false }).success).toBe(false));
  it("rejects query strings and protocol-relative paths", () => {
    expect(analyticsSchema.safeParse({ ...event, path: "/a?b=1" }).success).toBe(false);
    expect(analyticsSchema.safeParse({ ...event, path: "//evil.com" }).success).toBe(false);
  });
});
