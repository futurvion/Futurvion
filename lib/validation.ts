import { z } from "zod";
import { services } from "@/data/services";
const serviceSlugs = new Set([...services.map(s => s.slug), "not-sure"]);
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  service: z.string().refine(v => serviceSlugs.has(v), "Select a valid service"),
  budget: z.enum(["", "under-10k", "10k-25k", "25k-50k", "50k-plus"]).optional(),
  description: z.string().trim().min(20).max(5000),
  consent: z.literal("yes"),
  website: z.string().max(100).optional(),
});
export const analyticsSchema = z.object({
  eventId: z.uuid(), type: z.enum(["page_view", "service_cta", "contact_conversion"]),
  path: z.string().startsWith("/").max(250).refine(v => !v.startsWith("//") && !v.includes("?")),
  visitorId: z.uuid(), sessionId: z.uuid(), consent: z.literal(true),
  referrerCategory: z.enum(["direct", "search", "social", "external", "internal"]).optional(),
  deviceCategory: z.enum(["desktop", "tablet", "mobile"]).optional(),
});
