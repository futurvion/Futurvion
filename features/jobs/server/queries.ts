import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { listQuery } from "./core";

export function jobWhere(query: ReturnType<typeof listQuery.parse>): Prisma.JobWhereInput {
  return { status: "active",
    ...(query.q && { OR: ["title", "descriptionText", "companyName"].map(key => ({ [key]: { contains: query.q, mode: "insensitive" } })) }),
    ...(query.company && { companyName: { contains: query.company, mode: "insensitive" } }),
    ...(query.location && { location: { contains: query.location, mode: "insensitive" } }),
    ...(query.workMode && { workMode: query.workMode }),
    ...(query.employmentType && { employmentType: { contains: query.employmentType, mode: "insensitive" } }),
    ...(query.category && { category: { contains: query.category, mode: "insensitive" } }),
    ...(query.experienceLevel && { experienceLevel: { contains: query.experienceLevel, mode: "insensitive" } }),
    ...(query.source && { sourceProvider: { providerType: query.source } }),
    ...(query.postedWithin && { publishedAt: { gte: new Date(Date.now() - query.postedWithin * 86400000) } }),
    ...(query.salaryMin !== undefined && { salaryMax: { gte: query.salaryMin } }),
    ...(query.salaryMax !== undefined && { salaryMin: { lte: query.salaryMax } }),
    ...((query.salaryMin !== undefined || query.salaryMax !== undefined) && { salaryCurrency: query.salaryCurrency }),
  };
}
export async function listJobs(raw: Record<string, string | string[] | undefined>) {
  const query = listQuery.parse(Object.fromEntries(Object.entries(raw).filter(([, value]) => value !== "")));
  const db = getDb();
  if (!db) return { jobs: [], total: 0, page: query.page, pages: 0, configured: false };
  const where = jobWhere(query);
  const [jobs, total] = await Promise.all([
    db.job.findMany({ where, select: { slug: true, title: true, companyName: true, location: true, workMode: true, employmentType: true, category: true, salaryMin: true, salaryMax: true, salaryCurrency: true, salaryPeriod: true, publishedAt: true, descriptionText: true, applicationUrl: true, sourceProvider: { select: { name: true, slug: true, providerType: true } } }, orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }], skip: (query.page - 1) * 12, take: 12 }),
    db.job.count({ where }),
  ]);
  return { jobs, total, page: query.page, pages: Math.ceil(total / 12), configured: true };
}
export async function getJob(slug: string) {
  const db = getDb();
  return db?.job.findFirst({ where: { slug }, include: { sourceProvider: { select: { name: true, slug: true, providerType: true } } } }) ?? null;
}
