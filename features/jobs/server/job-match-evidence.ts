import "server-only";
import { normalizeSkills } from "./resume-profile";

export type JobMatchEvidence = { requiredSkills: string[]; preferredSkills: string[]; experienceMinMonths: number | null;
  experienceMaxMonths: number | null; experienceMandatory: boolean; qualifications: string[] };
export function jobSkills(text: string, companyName?: string): string[] {
  const companySkills = normalizeSkills(companyName ?? "");
  return normalizeSkills(text).filter(skill => !companySkills.includes(skill) || new RegExp("(?:using|experience with|proficiency in|knowledge of)\\s+" + skill.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "i").test(text));
}

/** Conservative extraction: unclassified description mentions are never mandatory requirements. */
export function jobMatchEvidence(job: { requirements?: string | null; descriptionText?: string | null; companyName?: string }): JobMatchEvidence {
  const required: string[] = [], preferred: string[] = [], qualifications: string[] = [];
  let section: "required" | "preferred" | null = null;
  let experienceMinMonths: number | null = null, experienceMaxMonths: number | null = null, experienceMandatory = false;
  for (const line of `${job.requirements ? `## Requirements\n${job.requirements}\n## End requirements\n` : ""}${job.descriptionText ?? ""}`.split(/\n/)) {
    const preferredLine = /\b(preferred|nice[- ]to[- ]have|bonus|a plus|ideally)\b/i.test(line);
    if (/^\s*(?:##|[A-Z][a-z]+(?:\s+[A-Za-z]+){0,4}:)/.test(line)) {
      section = preferredLine ? "preferred" : /\b(requirements|qualifications|must have|what you bring|what we're looking for)\b/i.test(line) ? "required" : null;
    }
    const isRequired = !preferredLine && (section === "required" || /\b(must have|required|mandatory)\b/i.test(line));
    const isPreferred = preferredLine || section === "preferred";
    if (isRequired) required.push(...jobSkills(line, job.companyName));
    else if (isPreferred) preferred.push(...jobSkills(line, job.companyName));
    const years = line.match(/\b(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?\+?\s*(years?|yrs?|months?)\s+(?:of\s+)?(?:[a-z-]+\s+){0,6}experience\b/i);
    if (years && !/up to|less than/i.test(line)) {
      const multiplier = /^month/i.test(years[3]) ? 1 : 12;
      const minimum = Number(years[1]) * multiplier;
      if (experienceMinMonths === null || minimum > experienceMinMonths) {
        experienceMinMonths = minimum;
        experienceMaxMonths = years[2] ? Number(years[2]) * multiplier : null;
        experienceMandatory = !isPreferred && (isRequired || /at least|minimum|must|required/i.test(line));
      }
    }
    if (isRequired && /\b(degree|bachelor|master|phd|certif(?:ied|ication))\b/i.test(line)) qualifications.push(line.replace(/^[-#\s]+/, "").slice(0, 300));
  }
  return { requiredSkills: [...new Set(required)], preferredSkills: [...new Set(preferred)].filter(skill => !required.includes(skill)),
    experienceMinMonths, experienceMaxMonths, experienceMandatory, qualifications: [...new Set(qualifications)].slice(0, 10) };
}
