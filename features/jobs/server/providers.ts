import "server-only";
import { date, plainText, safeUrl, type NormalizedJob, type ProviderConfig } from "./core";

type FetchResult = { jobs: NormalizedJob[]; complete: boolean };
class ProviderHttpError extends Error { constructor(public status: number) { super(`Provider HTTP ${status}`); } }
async function fetchJson(url: string, retries = 2, retryDelaySeconds = 1): Promise<unknown> {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(12000), headers: { Accept: "application/json" }, cache: "no-store" });
      if (!response.ok) throw new ProviderHttpError(response.status);
      return await response.json();
    } catch (error) {
      if (attempt >= retries || (error instanceof ProviderHttpError && error.status < 500 && error.status !== 429)) throw error;
      await new Promise(resolve => setTimeout(resolve, retryDelaySeconds * 1000 * 2 ** attempt + Math.random() * 300));
    }
  }
}
function valid(jobs: NormalizedJob[]) { return jobs.filter(job => job.externalJobId && job.title && job.companyName && safeUrl(job.applicationUrl)); }
export async function fetchProvider(config: ProviderConfig, name: string, retries = 2, retryDelaySeconds = 1): Promise<FetchResult> {
  if (config.type === "remotive") {
    const payload = await fetchJson("https://remotive.com/api/remote-jobs", retries, retryDelaySeconds) as { jobs?: Record<string, unknown>[] };
    if (!Array.isArray(payload.jobs)) throw new Error("Invalid Remotive response");
    const jobs = valid(payload.jobs.map(row => ({
      externalJobId: String(row.id ?? ""), title: String(row.title ?? ""), companyName: String(row.company_name ?? ""),
      companyLogoUrl: safeUrl(row.company_logo), location: plainText(row.candidate_required_location), workMode: "remote",
      employmentType: plainText(row.job_type)?.replaceAll("_", "-"), category: plainText(row.category), descriptionText: plainText(row.description),
      applicationUrl: safeUrl(row.url) ?? "", publishedAt: date(row.publication_date),
    })));
    if (payload.jobs.length && !jobs.length) throw new Error("No valid Remotive jobs");
    return { complete: jobs.length === payload.jobs.length, jobs };
  }
  if (config.type === "greenhouse") {
    const payload = await fetchJson(`https://boards-api.greenhouse.io/v1/boards/${config.board}/jobs?content=true`, retries, retryDelaySeconds) as { jobs?: Record<string, unknown>[] };
    if (!Array.isArray(payload.jobs)) throw new Error("Invalid Greenhouse response");
    const jobs = valid(payload.jobs.map(row => ({
      externalJobId: String(row.id ?? ""), title: String(row.title ?? ""), companyName: name,
      location: plainText((row.location as { name?: string } | undefined)?.name), workMode: "unknown",
      descriptionText: plainText(row.content), applicationUrl: safeUrl(row.absolute_url) ?? "",
    })));
    if (payload.jobs.length && !jobs.length) throw new Error("No valid Greenhouse jobs");
    return { complete: jobs.length === payload.jobs.length, jobs };
  }
  const host = config.region === "eu" ? "api.eu.lever.co" : "api.lever.co";
  const jobs: NormalizedJob[] = [];
  let complete = false;
  let allValid = true;
  for (let skip = 0; skip < 10000; skip += 100) {
    const payload = await fetchJson(`https://${host}/v0/postings/${config.site}?mode=json&skip=${skip}&limit=100`, retries, retryDelaySeconds);
    if (!Array.isArray(payload)) throw new Error("Invalid Lever response");
    const pageJobs = valid((payload as Record<string, unknown>[]).map(row => {
      const categories = (row.categories ?? {}) as Record<string, unknown>;
      const salary = (row.salaryRange ?? {}) as Record<string, unknown>;
      return { externalJobId: String(row.id ?? ""), title: String(row.text ?? ""), companyName: name,
        location: plainText(categories.location), workMode: row.workplaceType === "on-site" ? "onsite" : ["remote", "hybrid"].includes(String(row.workplaceType)) ? String(row.workplaceType) : "unknown",
        employmentType: plainText(categories.commitment), category: plainText(categories.department ?? categories.team),
        descriptionText: plainText(row.descriptionPlain ?? row.description),
        salaryMin: typeof salary.min === "number" ? Math.round(salary.min) : undefined,
        salaryMax: typeof salary.max === "number" ? Math.round(salary.max) : undefined,
        salaryCurrency: plainText(salary.currency), salaryPeriod: plainText(salary.interval),
        applicationUrl: safeUrl(row.applyUrl) ?? safeUrl(row.hostedUrl) ?? "", publishedAt: date(row.createdAt),
      };
    }));
    jobs.push(...pageJobs);
    if (pageJobs.length !== payload.length) allValid = false;
    if (payload.length < 100) { complete = true; break; }
  }
  if (jobs.length === 0 && !complete) throw new Error("Incomplete Lever jobs");
  return { jobs, complete: complete && allValid };
}
