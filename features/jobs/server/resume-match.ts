import "server-only";
import { getDb } from "@/lib/db";
import { extractCandidateProfile } from "./resume-profile";
import { deduplicateRanked, rankJob } from "./resume-ranking";
import { MATCH_CONFIG } from "../matching-config";
import type { ResumeFilters } from "./resume-validation";

export async function matchResumeText(text: string, filters: ResumeFilters = { location: "", workMode: "" }) {
  const profile = extractCandidateProfile(text);
  text = "";
  try {
  const terms = profile.keywords.filter(term => term.length >= 3).slice(0, 10);
  if (!terms.length) return { jobs: [], total: 0 };
  const db = getDb();
  if (!db) throw new Error("Database unavailable");
  const search = terms.map(term => `"${term.replace(/["\\]/g, " ")}"`).join(" OR ");
  const location = `%${filters.location.replace(/[\\%_]/g, "\\$&")}%`;
  const jobs = await db.$transaction(async tx => {
    await tx.$executeRaw`SET LOCAL statement_timeout = '5000ms'`;
    const ids = await tx.$queryRaw<{ id: string }[]>`
      WITH shortlist AS (
        SELECT id, "listingKey", "publishedAt",
          ts_rank_cd("searchDocument", websearch_to_tsquery('english', ${search})) AS rank,
          ROW_NUMBER() OVER (PARTITION BY "listingKey" ORDER BY "lastVerifiedAt" DESC NULLS LAST, id) AS position
        FROM "Job"
        WHERE status = 'active' AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
          AND (${filters.workMode} = '' OR "workMode" = ${filters.workMode})
          AND (${filters.location} = '' OR location ILIKE ${location})
          AND "searchDocument" @@ websearch_to_tsquery('english', ${search})
      )
      SELECT id FROM shortlist WHERE position = 1
      ORDER BY rank DESC, "publishedAt" DESC NULLS LAST, id
      LIMIT ${MATCH_CONFIG.shortlistSize}`;
    return ids.length ? tx.job.findMany({ where: { id: { in: ids.map(row => row.id) }, status: "active", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }, include: { sourceProvider: { select: { name: true } } } }) : [];
  }, { timeout: 8000 });
  const ranked = deduplicateRanked(jobs.map(job => rankJob(profile, job)).filter(job => job.matchScore >= MATCH_CONFIG.minimumScore && (job.matchedSkills.length > 0 || job.components.title >= 65))
    .sort((a, b) => b.matchScore - a.matchScore || a.id.localeCompare(b.id)));
  return { jobs: ranked, total: ranked.length };
  } finally {
    profile.currentTitle = null;
    profile.skills.length = profile.previousTitles.length = profile.employment.length = profile.education.length = profile.certifications.length = profile.projects.length = profile.preferredRoles.length = profile.keywords.length = 0;
  }
}
