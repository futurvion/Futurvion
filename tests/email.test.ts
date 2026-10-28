import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendEmail } = vi.hoisted(() => ({ sendEmail: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendEmail };
  },
}));

import { notifyContact } from "@/lib/email";

const contact = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Example Ltd",
  phone: "+1 555 0100",
  service: "branding",
  budget: "5k-15k" as const,
  description: "We need a clearer identity for our growing business.",
  consent: "yes" as const,
  website: "",
};

describe("contact notification email", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("RESEND_API_KEY", "test-api-key");
    vi.stubEnv("CONTACT_TO_EMAIL", "futurvion@gmail.com");
    vi.stubEnv("CONTACT_FROM_EMAIL", "notifications@futurvion.in");
    sendEmail.mockResolvedValue({ error: null });
  });

  it("sends all submitted contact details to the configured inbox", async () => {
    expect(await notifyContact(contact)).toBe(true);

    expect(sendEmail).toHaveBeenCalledOnce();
    const [message] = sendEmail.mock.calls[0];
    expect(message).toMatchObject({
      from: "notifications@futurvion.in",
      to: "futurvion@gmail.com",
      replyTo: "ada@example.com",
      subject: "New Futurvion enquiry: branding",
    });
    expect(message.text).toContain("Name: Ada Lovelace");
    expect(message.text).toContain("Email: ada@example.com");
    expect(message.text).toContain("Company: Example Ltd");
    expect(message.text).toContain("Phone: +1 555 0100");
    expect(message.text).toContain("Service: branding");
    expect(message.text).toContain("Budget: 5k-15k");
    expect(message.text).toContain(contact.description);
  });

  it("reports missing mail configuration without calling Resend", async () => {
    vi.stubEnv("CONTACT_FROM_EMAIL", "");

    expect(await notifyContact(contact)).toBe(false);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("reports a Resend rejection as an unsuccessful notification", async () => {
    sendEmail.mockResolvedValue({ error: new Error("rejected") });

    expect(await notifyContact(contact)).toBe(false);
  });
});
