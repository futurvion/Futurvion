"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HeroAside } from "@/components/shared/hero-aside";
import { JobsSearch, JobsSearchSkeleton, type JobFilters } from "./jobs-search";
import { siteStyles } from "@/config/styles";
import { ResumeMatch } from "./resume-match";

type Job = {
  slug: string;
  title: string;
  companyName: string;
  location: string | null;
  workMode: string;
  employmentType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryPeriod: string | null;
  publishedAt: string | null;
  descriptionText: string | null;
  applicationUrl: string;
  sourceProvider: { name: string; providerType: string };
};
type JobsResponse = { jobs: Job[]; total: number; page: number; pages: number; configured: boolean };

function sourceLabel(provider: Job["sourceProvider"]) {
  return provider.providerType === "remotive" ? provider.name : `${provider.name} via ${provider.providerType === "greenhouse" ? "Greenhouse" : "Lever"}`;
}

function jobExcerpt(description: string) {
  const text = description.replace(/^## .+$/gm, "").replace(/^- /gm, "").replace(/\s+/g, " ").trim();
  return text.length > 170 ? `${text.slice(0, 170)}…` : text;
}

function JobsResultsSkeleton() {
  return <div role="status">
    <span className="sr-only">Loading jobs</span>
    <div className="jobs-grid" aria-hidden="true">{Array.from({ length: 4 }, (_, index) => <div className="job-card job-card-skeleton" key={index}>
      <span className="jobs-skeleton-line jobs-skeleton-source"/>
      <span className="jobs-skeleton-line jobs-skeleton-title"/>
      <span className="jobs-skeleton-line jobs-skeleton-company"/>
      <span className="jobs-skeleton-line jobs-skeleton-tags"/>
      <span className="jobs-skeleton-line jobs-skeleton-excerpt"/>
      <span className="jobs-skeleton-line jobs-skeleton-actions"/>
    </div>)}</div>
  </div>;
}

export function JobsBoard() {
  const [filters, setFilters] = useState<JobFilters>({});
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<JobsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError("");
    fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...filters, page }),
      signal: controller.signal,
      cache: "no-store",
    }).then(async response => {
      if (!response.ok) {
        if (response.status === 400) throw new Error("Please check the selected filters and salary range.");
        throw new Error("Jobs are temporarily unavailable.");
      }
      return response.json() as Promise<JobsResponse>;
    }).then(data => { setResult(data); setLoading(false); }).catch(reason => {
      if (controller.signal.aborted) return;
      setError(reason instanceof Error ? reason.message : "Jobs are temporarily unavailable.");
      setLoading(false);
    });
    return () => controller.abort();
  }, [filters, page]);

  function search(next: JobFilters) {
    setLoading(true);
    setFilters(next);
    setPage(1);
  }

  return <>
    <section className="jobs-hero jobs-hero-with-aside"><div className={`${siteStyles.container} jobs-hero-grid`}><div className="jobs-hero-copy"><span className={`${siteStyles.eyebrow} eyebrow`}>Careers / Opportunities</span><h1>Find your next role.</h1><p>Discover roles across technology, design, marketing, product, and business. Explore real openings from public career boards.</p><div className="jobs-hero-line"><span>Explore what&apos;s next</span>{!loading && !error && result?.configured && <strong>{result.total} matching {result.total === 1 ? "role" : "roles"}</strong>}</div></div><HeroAside variant="jobs"/></div></section>
    <section id="job-openings" className={`${siteStyles.pageSection} page-section jobs-section`}><div className={siteStyles.container}><ResumeMatch/></div><div className={`${siteStyles.container} jobs-layout`}><aside><h2>Discover roles</h2><p>Refine your search. Filters combine to help you find a better fit.</p>{loading && !result ? <JobsSearchSkeleton/> : <JobsSearch onSearch={search}/>}</aside><div className="jobs-results"><div className="jobs-results-heading"><div><span className={`${siteStyles.eyebrow} eyebrow`}>Open positions</span><h2>Latest opportunities</h2></div>{!loading && !error && result?.configured && <span>{result.total} results</span>}</div>
      {loading ? <JobsResultsSkeleton/> : error ? <div className="jobs-empty" role="alert">{error} <button type="button" onClick={() => search({ ...filters })}>Try again</button></div> : !result?.configured ? <div className="jobs-empty">Job listings will appear here once the database and providers are configured.</div> : result.jobs.length === 0 ? <div className="jobs-empty">{Object.keys(filters).length ? "No roles match these filters. Use Clear filters to explore all openings." : "No roles are available yet. Please check back soon."}</div> : <><div className="jobs-grid">{result.jobs.map(job => <article className="job-card" key={job.slug}><div className="job-card-top"><span>{sourceLabel(job.sourceProvider)}</span>{job.publishedAt && <time dateTime={job.publishedAt}>{new Date(job.publishedAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</time>}</div><h3><Link href={`/jobs/${job.slug}`}>{job.title}</Link></h3><p className="job-company">{job.companyName}</p><div className="job-tags">{[job.location, job.workMode !== "unknown" ? job.workMode : null, job.employmentType].filter(Boolean).map(value => <span key={value}>{value}</span>)}</div>{job.descriptionText && <p className="job-excerpt">{jobExcerpt(job.descriptionText)}</p>}{job.salaryMin !== null && <p className="job-salary">{job.salaryCurrency} {job.salaryMin.toLocaleString()}{job.salaryMax !== null && `–${job.salaryMax.toLocaleString()}`} {job.salaryPeriod ?? ""}</p>}<div className="job-actions"><Link href={`/jobs/${job.slug}`}>View details →</Link><a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">Apply now ↗</a></div></article>)}</div><nav className="jobs-pagination" aria-label="Job pages">{result.page > 1 && <button type="button" onClick={() => { setLoading(true); setPage(result.page - 1); }}>← Previous</button>}<span>Page {result.page} of {result.pages}</span>{result.page < result.pages && <button type="button" onClick={() => { setLoading(true); setPage(result.page + 1); }}>Next →</button>}</nav></>}
    </div></div></section>
  </>;
}
