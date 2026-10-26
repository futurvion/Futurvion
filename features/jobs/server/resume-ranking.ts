import "server-only";
import type { Job } from "@/generated/prisma/client";
import { MATCH_WEIGHTS } from "../matching-config";
import { relevantExperienceMonths, roleSimilarity, type CandidateProfile } from "./resume-profile";
import { jobMatchEvidence, jobSkills } from "./job-match-evidence";
export { MATCH_WEIGHTS } from "../matching-config";

const words = (value: string) => new Set(value.toLowerCase().match(/[a-z][a-z0-9+#.]{2,}/g) ?? []);
const coverage = (candidate: Set<string>, target: string[]) => target.length ? 100 * target.filter(value => candidate.has(value)).length / target.length : 50;
const related: Record<string, string[]> = { TypeScript: ["JavaScript"], JavaScript: ["TypeScript"], React: ["Next.js"], "Next.js": ["React"], PostgreSQL: ["SQL", "MySQL"], MySQL: ["SQL", "PostgreSQL"], "UI design": ["UX design"], "UX design": ["UI design"] };

export type RankedJob = {
  id: string; slug: string; title: string; companyName: string; location: string | null; workMode: string;
  employmentType: string | null; salaryMin: number | null; salaryMax: number | null; salaryCurrency: string | null;
  salaryPeriod: string | null; publishedAt: Date | null; applicationUrl: string; sourceName: string;
  matchScore: number; matchedSkills: string[]; missingRequiredSkills: string[]; missingPreferredSkills: string[];
  experienceFit: string; explanation: string; eligibility: "review" | "stretch";
  components: Record<keyof typeof MATCH_WEIGHTS, number>;
};
export function rankJob(profile: CandidateProfile, job: Job & { sourceProvider: { name: string } }): RankedJob {
  const extracted = jobMatchEvidence(job);
  const required = job.requiredSkills.length ? job.requiredSkills : extracted.requiredSkills;
  const preferred = job.preferredSkills.length ? job.preferredSkills : extracted.preferredSkills;
  const minimum = job.experienceMinMonths ?? extracted.experienceMinMonths;
  const mandatory = job.experienceMinMonths !== null ? job.experienceMandatory : extracted.experienceMandatory;
  const qualifications = job.qualifications.length ? job.qualifications : extracted.qualifications;
  const mentioned = jobSkills([job.title, job.descriptionText, job.requirements].filter(Boolean).join(" "), job.companyName);
  const skills = new Set(profile.skills);
  const matchedSkills = mentioned.filter(skill => skills.has(skill));
  const missingRequiredSkills = required.filter(skill => !skills.has(skill));
  const missingPreferredSkills = preferred.filter(skill => !skills.has(skill));
  const secondary = preferred.length ? preferred : mentioned.filter(skill => !required.includes(skill));
  const secondaryScore = secondary.length ? secondary.reduce((sum, skill) => sum + (skills.has(skill) ? 100 : related[skill]?.some(value => skills.has(value)) ? 50 : 0), 0) / secondary.length : 50;
  const title = Math.max(0, ...[profile.currentTitle, ...profile.previousTitles, ...profile.preferredRoles].filter((value): value is string => Boolean(value)).map(value => roleSimilarity(value, job.title)));
  const relevant = relevantExperienceMonths(profile, job.title);
  const experience = minimum === null || relevant === null ? 50 : minimum === 0 ? 100 : Math.min(100, relevant / minimum * 100);
  const experienceFit = minimum === null ? "No stated experience minimum" : relevant === null ? "Relevant experience could not be verified" : relevant >= minimum ? "Dated role history appears to meet the stated minimum" : "Dated role history is below the stated minimum";
  const candidateTerms = words([...profile.skills, profile.currentTitle ?? "", ...profile.previousTitles].join(" "));
  const descriptionTerms = words(job.descriptionText ?? "");
  const description = !descriptionTerms.size || !candidateTerms.size ? 50 : 100 * [...candidateTerms].filter(term => descriptionTerms.has(term)).length / candidateTerms.size;
  const qualificationTerms = qualifications.flatMap(value => value.toLowerCase().match(/\b(bachelor|master|phd|diploma|aws|azure|pmp|cissp)\b/g) ?? []);
  const qualificationsScore = qualificationTerms.length ? coverage(words([...profile.education, ...profile.certifications].join(" ")), [...new Set(qualificationTerms)]) : 50;
  const components = { requiredSkills: coverage(skills, required), preferredSkills: secondaryScore, title: profile.currentTitle ? title : 50,
    experience, description, qualifications: qualificationsScore };
  const matchScore = Math.round((Object.keys(MATCH_WEIGHTS) as (keyof typeof MATCH_WEIGHTS)[]).reduce((sum, key) => sum + components[key] * MATCH_WEIGHTS[key], 0) / 100);
  const eligibility = missingRequiredSkills.length || (mandatory && relevant !== null && minimum !== null && relevant < minimum) ? "stretch" : "review";
  const reasons = [matchedSkills.length ? "Shared skills: " + matchedSkills.slice(0, 4).join(", ") + "." : null,
    title >= 65 ? "Your role is related to this title." : null, minimum !== null ? experienceFit + "." : null].filter(Boolean);
  return { id: job.id, slug: job.slug, title: job.title, companyName: job.companyName, location: job.location, workMode: job.workMode,
    employmentType: job.employmentType, salaryMin: job.salaryMin, salaryMax: job.salaryMax, salaryCurrency: job.salaryCurrency,
    salaryPeriod: job.salaryPeriod, publishedAt: job.publishedAt, applicationUrl: job.applicationUrl, sourceName: job.sourceProvider.name,
    matchScore, matchedSkills, missingRequiredSkills, missingPreferredSkills, experienceFit, eligibility, components,
    explanation: reasons.join(" ") || "This role shares keywords with your resume; review the full description to assess fit." };
}
export function deduplicateRanked(jobs: RankedJob[]): RankedJob[] {
  const keys = new Set<string>(), urls = new Set<string>();
  return jobs.filter(job => {
    const key = [job.companyName, job.title, job.location ?? ""].map(value => value.toLowerCase().trim().replace(/\s+/g, " ")).join("|");
    const url = job.applicationUrl.replace(/[?#].*$/, "");
    if (keys.has(key) || urls.has(url)) return false;
    keys.add(key); urls.add(url); return true;
  });
}
