"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { siteStyles } from "@/config/styles";
import { MATCH_CONFIG } from "../matching-config";

const MAX_RESUME_BYTES = MATCH_CONFIG.maxFileBytes;
type Match = {
  id: string; slug: string; title: string; companyName: string; location: string | null; workMode: string;
  employmentType: string | null; salaryMin: number | null; salaryMax: number | null; salaryCurrency: string | null;
  salaryPeriod: string | null; publishedAt: string | null; applicationUrl: string; sourceName: string;
  matchScore: number; matchedSkills: string[]; missingRequiredSkills: string[]; missingPreferredSkills: string[];
  experienceFit: string; explanation: string;
  eligibility: "review" | "stretch";
};
type MatchResponse = { jobs: Match[]; total: number };

export function ResumeMatch() {
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const controller = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<MatchResponse | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("");
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (isOpen && !element.open) element.showModal();
    if (!isOpen && element.open) element.close();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  useEffect(() => {
    const discard = () => {
      controller.current?.abort();
      if (input.current) input.current.value = "";
      setFile(null); setResults(null); setError(""); setBusy(false); setPage(1);
    };
    window.addEventListener("pagehide", discard);
    return () => { window.removeEventListener("pagehide", discard); controller.current?.abort(); };
  }, []);

  function clear(resetInput = true) {
    controller.current?.abort(); controller.current = null;
    if (resetInput && input.current) input.current.value = "";
    setFile(null); setResults(null); setError(""); setBusy(false); setPage(1);
  }
  function closeDialog() {
    dialog.current?.close();
    setIsOpen(false);
    opener.current?.focus();
  }
  function select(next: File | undefined) {
    clear(false);
    if (!next) return;
    if (!/\.(pdf|docx)$/i.test(next.name)) { clear(); setError("Choose a PDF or DOCX file."); return; }
    if (!next.size) { clear(); setError("Choose a nonempty resume."); return; }
    if (next.size > MAX_RESUME_BYTES) { clear(); setError("The resume must be 2 MB or smaller."); return; }
    setFile(next);
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) { setError("Select a resume first."); return; }
    const nextController = new AbortController();
    controller.current = nextController;
    setBusy(true); setError(""); setResults(null);
    const timeout = setTimeout(() => {
      nextController.abort();
      setBusy(false); setError("The search took too long. Please try again.");
    }, 45_000);
    try {
      const body = new FormData(); body.set("resume", file);
      body.set("location", location); body.set("workMode", workMode);
      const response = await fetch("/api/jobs/match-resume", { method: "POST", body, cache: "no-store", signal: nextController.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Resume matching is temporarily unavailable.");
      if (!nextController.signal.aborted) { setResults(data as MatchResponse); setPage(1); }
    } catch (reason) {
      if (!nextController.signal.aborted) setError(reason instanceof Error ? reason.message : "Resume matching is temporarily unavailable.");
    } finally { clearTimeout(timeout); if (!nextController.signal.aborted) setBusy(false); }
  }
  const visible = results?.jobs.slice((page - 1) * MATCH_CONFIG.pageSize, page * MATCH_CONFIG.pageSize) ?? [];
  const pages = Math.ceil((results?.jobs.length ?? 0) / MATCH_CONFIG.pageSize);

  return <>
    <section className="resume-match" aria-labelledby="resume-match-title">
      <div className="resume-match-intro"><h2 id="resume-match-title">Find roles from your resume</h2><p>Upload your resume to see current openings that match your experience.</p></div>
      <button ref={opener} className={`${siteStyles.button} ${siteStyles.buttonPrimary}`} type="button" aria-haspopup="dialog" aria-controls="resume-match-dialog" aria-expanded={isOpen} onClick={() => setIsOpen(true)}>Match jobs with your resume</button>
    </section>
    <dialog ref={dialog} id="resume-match-dialog" className="resume-match-dialog" aria-labelledby="resume-match-dialog-title" onClose={() => { setIsOpen(false); opener.current?.focus(); }} onClick={event => { if (event.target === dialog.current) closeDialog(); }}>
      <div className="resume-match-dialog-content">
        <div className="resume-match-dialog-heading"><div className="resume-match-intro"><h2 id="resume-match-dialog-title">Find roles from your resume</h2><p>Choose a text-based PDF or DOCX (up to 2 MB). Futurvion processes it temporarily and does not save the file or extracted profile. Refresh, leave this page, or clear the search to remove the selection and results.</p></div><button className="resume-match-close" type="button" onClick={closeDialog}>Close</button></div>
        <form onSubmit={submit} className="resume-match-form"><label htmlFor="resume-upload">Resume (PDF or DOCX)</label><input ref={input} id="resume-upload" type="file" autoComplete="off" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={event => select(event.target.files?.[0])} disabled={busy}/>
      {file && <p className="resume-file">Selected: {file.name}</p>}
      <div className="resume-match-filters"><label>Location (optional)<input value={location} onChange={event => setLocation(event.target.value)} maxLength={100} placeholder="City or country" disabled={busy}/></label><label>Work mode<select value={workMode} onChange={event => setWorkMode(event.target.value)} disabled={busy}><option value="">Any mode</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">Onsite</option></select></label></div>
      <div className="resume-match-actions"><button className={`${siteStyles.button} ${siteStyles.buttonPrimary}`} type="submit" disabled={!file || busy}>{busy ? "Finding matches…" : "Find matching jobs"}</button><button className={`${siteStyles.button} ${siteStyles.buttonGhost}`} type="button" onClick={() => clear()} disabled={!file && !results && !error}>Clear resume and results</button></div>
      <p className="resume-status" role="status" aria-live="polite">{busy ? "Analyzing your resume and searching current jobs…" : results ? `${results.total} estimated matches found.` : ""}</p>
      {error && <p className="resume-error" role="alert">{error} {file && <button type="submit">Try again</button>}</p>}
        </form>
        {results && <div className="resume-results"><h3>Recommended roles <small>Estimated job-fit scores, not hiring probabilities</small></h3>
      {results.jobs.length === 0 ? <p className="jobs-empty">No suitable roles were found in the current catalogue. Try ordinary job search below.</p> : <><div className="jobs-grid">{visible.map(job => <article className="job-card resume-job-card" key={job.id}>
        <div className="job-card-top"><span>{job.sourceName}</span><strong>{job.matchScore}/100 fit</strong></div>
        {job.eligibility === "stretch" && <p className="resume-caution">Stretch opportunity — some stated requirements are unverified or unmet.</p>}
        <h3><Link href={`/jobs/${job.slug}`}>{job.title}</Link></h3><p className="job-company">{job.companyName}</p>
        <div className="job-tags">{[job.location, job.workMode !== "unknown" ? job.workMode : null, job.employmentType].filter(Boolean).map(value => <span key={value}>{value}</span>)}</div>
        <p className="job-excerpt">{job.explanation}</p>
        {job.missingRequiredSkills.length > 0 && <p className="resume-caution">Required skills not verified: {job.missingRequiredSkills.join(", ")}</p>}
        {job.missingPreferredSkills.length > 0 && <p className="resume-caution">Preferred skills not verified: {job.missingPreferredSkills.join(", ")}</p>}
        <p className="resume-experience">{job.experienceFit}</p>
        {job.publishedAt && <p className="resume-experience">Posted <time dateTime={job.publishedAt}>{new Date(job.publishedAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</time></p>}
        {job.salaryMin !== null && <p className="job-salary">{job.salaryCurrency} {job.salaryMin.toLocaleString()}{job.salaryMax !== null && `–${job.salaryMax.toLocaleString()}`} {job.salaryPeriod ?? ""}</p>}
        <div className="job-actions"><Link href={`/jobs/${job.slug}`}>View details →</Link><a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">Apply now ↗</a></div>
      </article>)}</div>{pages > 1 && <nav className="jobs-pagination" aria-label="Resume recommendation pages"><button type="button" disabled={page === 1} onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {page} of {pages}</span><button type="button" disabled={page === pages} onClick={() => setPage(value => value + 1)}>Next</button></nav>}</>}
        </div>}
      </div>
    </dialog>
  </>;
}
