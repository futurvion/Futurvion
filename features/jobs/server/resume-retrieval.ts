import "server-only";
import type { Job } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { MATCH_CONFIG } from "../matching-config";
import type { ResumeFilters } from "./resume-validation";

export type CandidateJob = Job & { sourceProvider: { name: string } };
// A future semantic retriever can implement this boundary and merge by canonical ID.
// No embedding provider is configured or invoked by the current implementation.
export type CandidateRetriever = (terms: string[], filters: ResumeFilters) => Promise<CandidateJob[]>;
export const retrieveKeywordJobs: CandidateRetriever = async (terms, filters) => {
  const db = getDb();
  if (!db) throw new Error("Database unavailable");
  const search = terms.map(term => `"${term.replace(/["\\]/g, " ")}"`).join(" OR ");
  const location = `%${filters.location.replace(/[\\%_]/g, "\\$&")}%`;
  return db.$transaction(async tx => {
    await tx.$executeRaw`SET LOCAL statement_timeout = '5000ms'`;
    const ids = await tx.$queryRaw<{ id: string }[]>`
      WITH shortlist AS (
        SELECT id, "publishedAt",
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
  }, { maxWait: 4000, timeout: 8000 });
};
