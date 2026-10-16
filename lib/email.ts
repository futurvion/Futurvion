import "server-only";
import { Resend } from "resend";
import type { z } from "zod";
import type { contactSchema } from "./validation";
type Contact = z.infer<typeof contactSchema>;
export async function notifyContact(data: Contact): Promise<boolean> {
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) return false;
  const resend = new Resend(RESEND_API_KEY);
  const { error } = await resend.emails.send({ from: CONTACT_FROM_EMAIL, to: CONTACT_TO_EMAIL, replyTo: data.email, subject: `New Futurvion enquiry: ${data.service}`, text: [`Name: ${data.name}`, `Email: ${data.email}`, `Company: ${data.company || "Not supplied"}`, `Phone: ${data.phone || "Not supplied"}`, `Service: ${data.service}`, `Budget: ${data.budget || "Not supplied"}`, "", data.description].join("\n") });
  return !error;
}
