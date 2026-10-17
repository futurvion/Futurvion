import { contactSchema } from "@/lib/validation";
import { getDb } from "@/lib/db";
import { notifyContact } from "@/lib/email";
import { looksLikeBot, requestKey, withinRateLimit } from "@/lib/security";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!process.env.DATABASE_URL || !process.env.RESEND_API_KEY || !process.env.CONTACT_TO_EMAIL || !process.env.CONTACT_FROM_EMAIL || !process.env.ABUSE_HASH_SECRET) return Response.json({ message: "The secure form is not configured. Please use the email link." }, { status: 503 });
  if (Number(request.headers.get("content-length") || 0) > 12000) return Response.json({ message: "Message is too long." }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ message: "Invalid request." }, { status: 400 }); }
  const result = contactSchema.safeParse(body);
  if (!result.success) return Response.json({ message: "Please check the required fields.", errors: result.error.flatten().fieldErrors }, { status: 400 });
  if (result.data.website || looksLikeBot(request)) return Response.json({ message: "Unable to accept this enquiry." }, { status: 400 });
  try {
    const allowed = await withinRateLimit(requestKey(request), "contact", 5, 60 * 60 * 1000);
    if (!allowed) return Response.json({ message: "Too many enquiries. Please try again later." }, { status: 429 });
    const db = getDb(); if (!db) throw new Error("Database unavailable");
    const lead = await db.lead.create({ data: { name: result.data.name, email: result.data.email, company: result.data.company || null, phone: result.data.phone || null, service: result.data.service, budget: result.data.budget || null, description: result.data.description, privacyConsent: true } });
    const sent = await notifyContact(result.data);
    if (!sent) return Response.json({ message: "We could not confirm delivery. Please contact us by email." }, { status: 502 });
    await db.lead.update({ where: { id: lead.id }, data: { notificationSent: true } });
    return Response.json({ ok: true });
  } catch (error) { console.error("Contact processing failed", error); return Response.json({ message: "The form is temporarily unavailable. Please contact us by email." }, { status: 503 }); }
}
