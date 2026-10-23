import Link from "next/link";
import { siteStyles } from "@/config/styles";

export default function Loading() {
  return <>
    <span className="sr-only" role="status">Loading job details</span>
    <section className="jobs-hero job-detail-hero"><div className={siteStyles.container}>
      <Link className="job-back" href="/jobs"><span aria-hidden="true">←</span> Back to all jobs</Link>
      <div className="job-detail-loading-hero" aria-hidden="true">
        <span className="jobs-skeleton-line job-detail-skeleton-source"/>
        <span className="jobs-skeleton-line job-detail-skeleton-title"/>
        <span className="jobs-skeleton-line job-detail-skeleton-company"/>
        <div className="job-detail-skeleton-tags"><span className="jobs-skeleton-line"/><span className="jobs-skeleton-line"/><span className="jobs-skeleton-line"/></div>
        <span className="jobs-skeleton-line job-detail-skeleton-button"/>
      </div>
    </div></section>
    <section className={`${siteStyles.pageSection} page-section`}><div className={`${siteStyles.container} job-detail-layout`} aria-hidden="true">
      <article className="job-detail-loading-copy">
        <span className="jobs-skeleton-line job-detail-skeleton-source"/>
        <span className="jobs-skeleton-line job-detail-skeleton-heading"/>
        <span className="jobs-skeleton-line"/><span className="jobs-skeleton-line"/><span className="jobs-skeleton-line"/>
        <span className="jobs-skeleton-line job-detail-skeleton-heading"/>
        <span className="jobs-skeleton-line"/><span className="jobs-skeleton-line"/>
      </article>
      <aside className="job-facts job-detail-loading-facts">
        <span className="jobs-skeleton-line job-detail-skeleton-heading"/>
        {Array.from({ length: 5 }, (_, index) => <div key={index}><span className="jobs-skeleton-line"/><span className="jobs-skeleton-line"/></div>)}
      </aside>
    </div></section>
  </>;
}
