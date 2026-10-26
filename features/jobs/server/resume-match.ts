import "server-only";
import { extractCandidateProfile } from "./resume-profile";
import { deduplicateRanked, rankJob } from "./resume-ranking";
import { MATCH_CONFIG } from "../matching-config";
import { retrieveKeywordJobs } from "./resume-retrieval";
import type { ResumeFilters } from "./resume-validation";

export async function matchResumeText(text: string, filters: ResumeFilters = { location: "", workMode: "" }) {
  const profile = extractCandidateProfile(text);
  text = "";
  try {
    const terms = profile.keywords.filter(term => term.length >= 3).slice(0, 16);
    if (!terms.length) return { jobs: [], total: 0 };
    const jobs = await retrieveKeywordJobs(terms, filters);
    const ranked = deduplicateRanked(jobs.map(job => rankJob(profile, job))
      .filter(job => job.matchScore >= MATCH_CONFIG.minimumScore && (job.matchedSkills.length > 0 || job.components.title >= 65))
      .sort((a, b) => b.matchScore - a.matchScore || a.id.localeCompare(b.id)));
    return { jobs: ranked, total: ranked.length };
  } finally {
    profile.currentTitle = null;
    profile.skills.length = profile.previousTitles.length = profile.employment.length = profile.education.length = profile.certifications.length = profile.projects.length = profile.preferredRoles.length = profile.keywords.length = 0;
  }
}
