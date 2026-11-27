import "server-only";
import { Resend } from "resend";
import type { z } from "zod";
import { services } from "@/data/services";
import type { contactSchema } from "./validation";

type Contact = z.infer<typeof contactSchema>;

const budgetLabels: Record<string, string> = {
  "": "Prefer to discuss",
  "under-10k": "Under ₹10,000",
  "10k-25k": "₹10,000–₹25,000",
  "25k-50k": "₹25,000–₹50,000",
  "50k-plus": "₹50,000+",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function contactEmailHtml(data: Contact): string {
  const service = services.find(item => item.slug === data.service)?.title
    ?? (data.service === "not-sure" ? "Not sure yet" : data.service);
  const details = [
    ["Name", data.name],
    ["Email", data.email],
    ["Company", data.company || "Not supplied"],
    ["Phone", data.phone || "Not supplied"],
    ["Service", service],
    ["Estimated budget", budgetLabels[data.budget ?? ""] ?? "Not supplied"],
  ] as const;
  const rows = details.map(([label, value], index) => `
    <tr>
      <td style="padding:14px 16px;${index < details.length - 1 ? "border-bottom:1px solid #e6edef;" : ""}color:#526771;font:600 13px/1.4 Arial,sans-serif;width:36%;">${escapeHtml(label)}</td>
      <td style="padding:14px 16px;${index < details.length - 1 ? "border-bottom:1px solid #e6edef;" : ""}color:#17313d;font:500 14px/1.5 Arial,sans-serif;overflow-wrap:anywhere;">${escapeHtml(value)}</td>
    </tr>`).join("");
  const description = escapeHtml(data.description).replace(/\r\n|\r|\n/g, "<br>");
  const submittedAt = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date());

  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New Futurvion enquiry</title></head>
  <body style="margin:0;padding:32px 12px;background:#eef3f4;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px;margin:0 auto;border-collapse:separate;border-spacing:0;background:#ffffff;">
      <tr>
        <td style="padding:30px 34px;background:#102837;border-bottom:5px solid #2e8293;">
          <p style="margin:0 0 12px;color:#b9dbe0;font:700 12px/1.2 Arial,sans-serif;letter-spacing:1.6px;text-transform:uppercase;">Futurvion · Contact</p>
          <h1 style="margin:0;color:#ffffff;font:700 27px/1.2 Arial,sans-serif;letter-spacing:-.4px;">A new project enquiry</h1>
          <p style="margin:12px 0 0;color:#d2e0e3;font:14px/1.5 Arial,sans-serif;">A visitor has shared a new opportunity with the studio.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 34px 12px;">
          <p style="margin:0 0 12px;color:#526771;font:700 12px/1.3 Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;">Contact details</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e1e9eb;border-collapse:collapse;">${rows}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 34px 30px;">
          <p style="margin:0 0 12px;color:#526771;font:700 12px/1.3 Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;">Project details</p>
          <div style="padding:18px 20px;border-left:3px solid #2e8293;background:#f3f7f8;color:#17313d;font:15px/1.7 Arial,sans-serif;overflow-wrap:anywhere;">${description}</div>
          <p style="margin:18px 0 0;color:#74858b;font:12px/1.5 Arial,sans-serif;">Submitted ${escapeHtml(submittedAt)} UTC · Reply directly to this email to contact ${escapeHtml(data.name)}.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 34px;background:#f5f8f8;color:#71838a;font:12px/1.5 Arial,sans-serif;">Futurvion · A thoughtful start to what comes next.</td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function notifyContact(data: Contact): Promise<boolean> {
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) return false;
  const resend = new Resend(RESEND_API_KEY);
  const service = services.find(item => item.slug === data.service)?.title
    ?? (data.service === "not-sure" ? "Not sure yet" : data.service);
  const { error } = await resend.emails.send({
    from: CONTACT_FROM_EMAIL,
    to: CONTACT_TO_EMAIL,
    replyTo: data.email,
    subject: `New Futurvion enquiry: ${service}`,
    text: [
      "A new project enquiry has arrived.",
      "",
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Company: ${data.company || "Not supplied"}`,
      `Phone: ${data.phone || "Not supplied"}`,
      `Service: ${service}`,
      `Budget: ${budgetLabels[data.budget ?? ""] ?? "Not supplied"}`,
      "",
      "Project details:",
      data.description,
    ].join("\n"),
    html: contactEmailHtml(data),
  });
  return !error;
}
