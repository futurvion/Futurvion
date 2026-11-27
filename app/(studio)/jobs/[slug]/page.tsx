import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { site } from "@/config/site";
import { JobDescription } from "@/features/jobs/components/job-description";
import { safeUrl, sourceLabel } from "@/features/jobs/server/core";
import { getJob } from "@/features/jobs/server/queries";
import { siteStyles } from "@/config/styles";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  return { title: job ? `${job.title} at ${job.companyName} | Futurvion Jobs` : "Job not found", alternates: { canonical: `${site.url}/jobs/${slug}` }, robots: { index: Boolean(job?.status === "active") } };
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) notFound();
  const apply = job.status === "active" ? safeUrl(job.applicationUrl) : undefined;
  const sections = [["Responsibilities", job.responsibilities], ["Requirements", job.requirements], ["Benefits", job.benefits]].filter((item): item is [string, string] => Boolean(item[1]));

  return <>
    <section className="jobs-hero job-detail-hero"><div className={siteStyles.container}>
      <Link className="job-back" href="/jobs"><span aria-hidden="true">←</span> Back to all jobs</Link>
      <span className={`${siteStyles.eyebrow} eyebrow`}>{sourceLabel(job.sourceProvider)} / {job.category ?? "Opportunity"}</span>
      <h1>{job.title}</h1>
      <p className="job-detail-company">{job.companyName}</p>
      <div className="job-tags">{[job.location, job.workMode !== "unknown" ? job.workMode : null, job.employmentType, job.experienceLevel].filter(Boolean).map(value => <span key={value}>{value}</span>)}</div>
      {apply ? <a className={`${siteStyles.button} button button-light ${siteStyles.buttonLight}`} href={apply} data-analytics-event="apply_click" data-job-id={job.slug} target="_blank" rel="noopener noreferrer">View original posting ↗</a> : <p>This opportunity is no longer accepting applications.</p>}
    </div></section>
    <section className={`${siteStyles.pageSection} page-section`}><div className={`${siteStyles.container} job-detail-layout`}>
      <article><span className={`${siteStyles.eyebrow} eyebrow`}>The opportunity</span><h2>About this role</h2>
        <JobDescription text={job.descriptionText ?? "The source has not provided a description. Visit the original posting for details."}/>
        {sections.map(([title, value]) => <section key={title}><h3>{title}</h3><JobDescription text={value}/></section>)}
      </article>
      <aside className="job-facts"><h3>At a glance</h3><dl>
        <dt>Company</dt><dd>{job.companyName}</dd>
        <dt>Location</dt><dd>{job.location ?? "Not specified"}</dd>
        <dt>Work mode</dt><dd>{job.workMode}</dd>
        <dt>Employment</dt><dd>{job.employmentType ?? "Not specified"}</dd>
        {job.salaryMin !== null && <><dt>Salary</dt><dd>{job.salaryCurrency} {job.salaryMin.toLocaleString()}{job.salaryMax !== null && `–${job.salaryMax.toLocaleString()}`} {job.salaryPeriod ?? ""}</dd></>}
        <dt>Posted</dt><dd>{job.publishedAt?.toLocaleDateString() ?? "Not specified"}</dd>
        <dt>Last verified</dt><dd>{job.lastVerifiedAt?.toLocaleDateString() ?? "Not yet verified"}</dd>
        <dt>Source</dt><dd>{sourceLabel(job.sourceProvider)}</dd>
      </dl>{apply && <a className={`${siteStyles.button} button button-primary ${siteStyles.buttonPrimary}`} href={apply} data-analytics-event="apply_click" data-job-id={job.slug} target="_blank" rel="noopener noreferrer">Apply now ↗</a>}</aside>
    </div></section>
  </>;
}
