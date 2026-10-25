import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { listQuery } from "./core";

/** SQL values stay parameterized, including literal LIKE wildcard characters. */
export function jobListingFilter(query: ReturnType<typeof listQuery.parse>) {
  const contains = (value: string) => `%${value.replace(/[\\%_]/g, "\\$&")}%`;
  const filters: Prisma.Sql[] = [Prisma.sql`j."status" = 'active'`];
  if (query.q) {
    const value = contains(query.q);
    filters.push(Prisma.sql`(j."title" ILIKE ${value} OR j."descriptionText" ILIKE ${value} OR j."companyName" ILIKE ${value})`);
  }
  if (query.company) filters.push(Prisma.sql`j."companyName" ILIKE ${contains(query.company)}`);
  if (query.location) filters.push(Prisma.sql`j."location" ILIKE ${contains(query.location)}`);
  if (query.workMode) filters.push(Prisma.sql`j."workMode" = ${query.workMode}`);
  if (query.employmentType) filters.push(Prisma.sql`j."employmentType" ILIKE ${contains(query.employmentType)}`);
  if (query.category) filters.push(Prisma.sql`j."category" ILIKE ${contains(query.category)}`);
  if (query.experienceLevel) filters.push(Prisma.sql`j."experienceLevel" ILIKE ${contains(query.experienceLevel)}`);
  if (query.source) filters.push(Prisma.sql`p."providerType" = ${query.source}`);
  if (query.postedWithin) filters.push(Prisma.sql`j."publishedAt" >= ${new Date(Date.now() - query.postedWithin * 86400000)}`);
  if (query.salaryMin !== undefined) filters.push(Prisma.sql`j."salaryMax" >= ${query.salaryMin}`);
  if (query.salaryMax !== undefined) filters.push(Prisma.sql`j."salaryMin" <= ${query.salaryMax}`);
  if (query.salaryMin !== undefined || query.salaryMax !== undefined) filters.push(Prisma.sql`j."salaryCurrency" = ${query.salaryCurrency}`);
  return Prisma.join(filters, " AND ");
}

const publicJobSelect = {
  id: true, slug: true, title: true, companyName: true, location: true, workMode: true,
  employmentType: true, category: true, salaryMin: true, salaryMax: true,
  salaryCurrency: true, salaryPeriod: true, publishedAt: true, descriptionText: true,
  applicationUrl: true, sourceProvider: { select: { name: true, slug: true, providerType: true } },
} as const;

export async function listJobs(raw: Record<string, string | string[] | undefined>) {
  const query = listQuery.parse(Object.fromEntries(Object.entries(raw).filter(([, value]) => value !== "")));
  const db = getDb();
  if (!db) return { jobs: [], total: 0, page: query.page, pages: 0, configured: false };
  const filter = jobListingFilter(query);
  // Filter before grouping so a matching source/location/salary variant stays discoverable.
  // Group before LIMIT/OFFSET so counts and page boundaries describe unique listings.
  const [pageIds, counts] = await Promise.all([
    db.$queryRaw<{ id: string }[]>(Prisma.sql`
      WITH ranked AS (
        SELECT j."id", j."publishedAt", j."createdAt",
          ROW_NUMBER() OVER (
            PARTITION BY j."listingKey"
            ORDER BY j."lastVerifiedAt" DESC NULLS LAST,
              j."publishedAt" DESC NULLS LAST, j."createdAt" DESC, j."id" ASC
          ) AS position
        FROM "Job" j JOIN "JobProvider" p ON p."id" = j."sourceProviderId"
        WHERE ${filter}
      )
      SELECT "id" FROM ranked WHERE position = 1
      ORDER BY "publishedAt" DESC NULLS LAST, "createdAt" DESC, "id" ASC
      LIMIT 12 OFFSET ${(query.page - 1) * 12}
    `),
    db.$queryRaw<{ total: number }[]>(Prisma.sql`
      SELECT COUNT(DISTINCT j."listingKey")::int AS total
      FROM "Job" j JOIN "JobProvider" p ON p."id" = j."sourceProviderId"
      WHERE ${filter}
    `),
  ]);
  const records = pageIds.length ? await db.job.findMany({ where: { id: { in: pageIds.map(job => job.id) } }, select: publicJobSelect }) : [];
  const byId = new Map(records.map(job => [job.id, job]));
  const jobs = pageIds.flatMap(({ id }) => {
    const record = byId.get(id);
    if (!record) return [];
    // Keep internal IDs and grouping keys out of the existing public response.
    const { id: internalId, ...job } = record;
    void internalId;
    return [job];
  });
  const total = counts[0]?.total ?? 0;
  return { jobs, total, page: query.page, pages: Math.ceil(total / 12), configured: true };
}
export async function getJob(slug: string) {
  const db = getDb();
  return db?.job.findFirst({ where: { slug }, include: { sourceProvider: { select: { name: true, slug: true, providerType: true } } } }) ?? null;
}
