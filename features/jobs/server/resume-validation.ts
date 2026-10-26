import { z } from "zod";
export const resumeFilters = z.object({
  location: z.string().trim().max(100).default(""),
  workMode: z.enum(["", "remote", "hybrid", "onsite"]).default(""),
});
export type ResumeFilters = z.infer<typeof resumeFilters>;
