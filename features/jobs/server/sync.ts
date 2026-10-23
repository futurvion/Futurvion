import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { contentHash, providerConfig, slugFor } from "./core";
import { fetchProvider } from "./providers";

export async function syncJobs(triggerType: "manual" | "scheduled", selectedProvider?: string, queuedRunId?: string) {
  const db = getDb(); if (!db) throw new Error("Database unavailable");
  const settings = await db.jobSyncSettings.findUnique({ where: { id: 1 } });
  if (triggerType === "scheduled" && (!settings?.enabled || (settings.nextScheduledRunAt && settings.nextScheduledRunAt > new Date()))) return { status: "not_due" };
  const providers = await db.jobProvider.findMany({ where: { enabled: true, ...(selectedProvider && { id: selectedProvider }) }, orderBy: { slug: "asc" } });
  if (!providers.length) {
    if (queuedRunId) await db.jobSyncRun.update({ where: { id: queuedRunId }, data: { status: "failed", finishedAt: new Date(), errorSummary: "No enabled provider" } });
    return { status: "no_providers" };
  }
  // A terminated serverless invocation must not block every subsequent run forever.
  await db.jobSyncRun.updateMany({ where: { status: "running", startedAt: { lt: new Date(Date.now() - 60 * 60000) } }, data: { status: "failed", finishedAt: new Date(), errorSummary: "Run timed out" } });
  const run = queuedRunId
    ? await db.jobSyncRun.update({ where: { id: queuedRunId, status: "queued" }, data: { status: "running", startedAt: new Date() } }).catch(error => { if ((error as { code?: string }).code === "P2002" || (error as { code?: string }).code === "P2025") return null; throw error; })
    : await db.jobSyncRun.create({ data: { triggerType, status: "running" } }).catch(error => { if ((error as { code?: string }).code === "P2002") return null; throw error; });
  if (!run) return { status: "already_running" };
  let fetched = 0, inserted = 0, updated = 0, unchanged = 0, expired = 0, errors = 0, incomplete = 0;
  try {
    const eligible = providers.filter(provider => provider.providerType !== "remotive" || !((provider.lastSuccessAt && Date.now() - provider.lastSuccessAt.getTime() < 6 * 3600000) || (provider.lastSyncAt && Date.now() - provider.lastSyncAt.getTime() < 60000)));
    const fetchedResults = new Map<string, { result: Awaited<ReturnType<typeof fetchProvider>> } | { error: unknown }>();
    const concurrency = settings?.maxConcurrency ?? 2;
    for (let offset = 0; offset < eligible.length; offset += concurrency) {
      await Promise.all(eligible.slice(offset, offset + concurrency).map(async provider => {
        try {
          const config = providerConfig.parse({ type: provider.providerType, ...(provider.configuration as object) });
          fetchedResults.set(provider.id, { result: await fetchProvider(config, provider.name, config.type === "remotive" ? 0 : settings?.retryLimit ?? 2, settings?.retryDelaySeconds ?? 1) });
        } catch (error) { fetchedResults.set(provider.id, { error }); }
      }));
    }
    for (const provider of eligible) {
      const started = new Date();
      let pFetched = 0, pInserted = 0, pUpdated = 0, pUnchanged = 0, pExpired = 0;
      try {
        const fetchedResult = fetchedResults.get(provider.id);
        if (!fetchedResult || "error" in fetchedResult) throw fetchedResult?.error ?? new Error("Provider did not return data");
        const result = fetchedResult.result;
        const ids = new Set<string>();
        for (let offset = 0; offset < result.jobs.length; offset += settings?.batchSize ?? 100) {
          const operations: Prisma.PrismaPromise<unknown>[] = [];
          const changes: ("inserted" | "updated" | "unchanged")[] = [];
          const batch = result.jobs.slice(offset, offset + (settings?.batchSize ?? 100)).filter(job => {
            if (ids.has(job.externalJobId)) return false;
            ids.add(job.externalJobId);
            return true;
          });
          const previousJobs = await db.job.findMany({
            where: { sourceProviderId: provider.id, externalJobId: { in: batch.map(job => job.externalJobId) } },
            select: { externalJobId: true, contentHash: true },
          });
          const previousById = new Map(previousJobs.map(job => [job.externalJobId, job]));
          for (const job of batch) {
            const hash = contentHash(job);
            const previous = previousById.get(job.externalJobId);
            changes.push(!previous ? "inserted" : previous.contentHash === hash ? "unchanged" : "updated");
            operations.push(db.job.upsert({ where: { sourceProviderId_externalJobId: { sourceProviderId: provider.id, externalJobId: job.externalJobId } },
              create: { ...job, slug: slugFor(job, provider.slug), sourceProviderId: provider.id, contentHash: hash, lastSeenAt: started, lastVerifiedAt: started, status: "active" },
              update: previous?.contentHash === hash ? { lastSeenAt: started, lastVerifiedAt: started, status: "active" } : { ...Object.fromEntries(Object.entries(job).filter(([, value]) => value !== undefined)), contentHash: hash, lastSeenAt: started, lastVerifiedAt: started, status: "active" },
            }));
          }
          if (operations.length) await db.$transaction(operations, { maxWait: 15000, timeout: 30000 });
          for (const change of changes) {
            fetched++; pFetched++;
            if (change === "inserted") { inserted++; pInserted++; }
            else if (change === "updated") { updated++; pUpdated++; }
            else { unchanged++; pUnchanged++; }
          }
        }
        if (result.complete) {
          const threshold = new Date(started.getTime() - (settings?.expireAfterDays ?? 14) * 86400000);
          const response = await db.job.updateMany({ where: { sourceProviderId: provider.id, status: "active", lastSeenAt: { lt: threshold } }, data: { status: "expired" } });
          expired += response.count; pExpired += response.count;
        } else incomplete++;
        await db.jobProvider.update({ where: { id: provider.id }, data: { lastSyncAt: started, lastSuccessAt: new Date(), lastErrorSummary: null } });
        await db.jobSyncRun.create({ data: { providerId: provider.id, triggerType, status: result.complete ? "succeeded" : "partial", startedAt: started, finishedAt: new Date(), jobsFetched: pFetched, jobsInserted: pInserted, jobsUpdated: pUpdated, jobsUnchanged: pUnchanged, jobsExpired: pExpired } });
      } catch (error) {
        errors++;
        console.error("Job provider sync failed", { runId: run.id, providerId: provider.id, error: error instanceof Error ? error.message : "Unknown error" });
        await db.jobProvider.update({ where: { id: provider.id }, data: { lastSyncAt: started, lastErrorAt: new Date(), lastErrorSummary: "Synchronization failed" } });
        await db.jobSyncRun.create({ data: { providerId: provider.id, triggerType, status: "failed", startedAt: started, finishedAt: new Date(), jobsFetched: pFetched, jobsInserted: pInserted, jobsUpdated: pUpdated, jobsUnchanged: pUnchanged, jobsExpired: pExpired, errorCount: 1, errorSummary: "Synchronization failed" } });
      }
    }
    const status = errors === eligible.length && eligible.length > 0 ? "failed" : errors || incomplete ? "partial" : "succeeded";
    await db.jobSyncRun.update({ where: { id: run.id }, data: { status, finishedAt: new Date(), jobsFetched: fetched, jobsInserted: inserted, jobsUpdated: updated, jobsUnchanged: unchanged, jobsExpired: expired, errorCount: errors, errorSummary: errors ? `${errors} provider(s) failed` : incomplete ? `${incomplete} provider feed(s) incomplete` : null } });
    if (triggerType === "scheduled") await db.jobSyncSettings.upsert({ where: { id: 1 }, create: { lastScheduledRunAt: new Date(), nextScheduledRunAt: new Date(Date.now() + (settings?.frequencyMinutes ?? 360) * 60000) }, update: { lastScheduledRunAt: new Date(), nextScheduledRunAt: new Date(Date.now() + (settings?.frequencyMinutes ?? 360) * 60000) } });
    return { status, runId: run.id, fetched, inserted, updated, unchanged, expired, errors };
  } catch (error) {
    await db.jobSyncRun.update({ where: { id: run.id }, data: { status: "failed", finishedAt: new Date(), errorCount: errors + 1, errorSummary: "Synchronization failed" } });
    throw error;
  }
}

export async function runNextQueuedOrScheduled() {
  const db = getDb(); if (!db) throw new Error("Database unavailable");
  const queued = await db.jobSyncRun.findFirst({ where: { status: "queued", triggerType: "manual" }, orderBy: { startedAt: "asc" } });
  if (queued) return syncJobs("manual", queued.providerId ?? undefined, queued.id);
  return syncJobs("scheduled");
}
