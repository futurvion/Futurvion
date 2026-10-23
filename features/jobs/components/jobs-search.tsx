"use client";

import { useEffect, useRef, useState } from "react";
import { siteStyles } from "@/config/styles";

export type JobFilters = Record<string, string>;

export function JobsSearchSkeleton() {
  return <div className="jobs-search jobs-search-loading" aria-hidden="true">
    {Array.from({ length: 4 }, (_, index) => <div className="jobs-filter-skeleton" key={index}><span className="jobs-skeleton-line jobs-skeleton-label"/><span className="jobs-skeleton-line jobs-skeleton-input"/></div>)}
    <div className="jobs-skeleton-line jobs-skeleton-more"/>
    <div className="jobs-search-actions"><span className="jobs-skeleton-line jobs-skeleton-button"/><span className="jobs-skeleton-line jobs-skeleton-button"/></div>
  </div>;
}

export function JobsSearch({ onSearch }: { onSearch: (filters: JobFilters) => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const pendingSearch = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [keyword, setKeyword] = useState("");
  const [revision, setRevision] = useState(0);

  function filtersFromForm(): JobFilters {
    const filters: JobFilters = {};
    if (!formRef.current) return filters;
    new FormData(formRef.current).forEach((value, key) => {
      if (typeof value === "string" && value.trim()) filters[key] = value.trim();
    });
    return filters;
  }

  useEffect(() => {
    if (revision === 0) return;
    pendingSearch.current = setTimeout(() => { pendingSearch.current = null; onSearch(filtersFromForm()); }, 400);
    return () => { if (pendingSearch.current) clearTimeout(pendingSearch.current); };
    // Only keyword edits trigger the debounced search; other fields apply on submit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision]);

  return <form ref={formRef} className="jobs-search" onSubmit={event => { event.preventDefault(); if (pendingSearch.current) clearTimeout(pendingSearch.current); pendingSearch.current = null; onSearch(filtersFromForm()); }}>
    <label>Role, skill, or keyword<input name="q" value={keyword} onChange={event => { setKeyword(event.target.value); setRevision(value => value + 1); }} placeholder="e.g. Product designer" maxLength={120}/></label>
    <label>Company<input name="company" placeholder="Company" maxLength={100}/></label>
    <label>Location<input name="location" placeholder="City or country" maxLength={100}/></label>
    <label>Work mode<select name="workMode"><option value="">Any mode</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">Onsite</option></select></label>
    <details className="jobs-more-filters"><summary>More filters</summary><div className="jobs-more-fields">
      <label>Employment<select name="employmentType"><option value="">Any type</option>{["Full-time", "Part-time", "Contract", "Internship", "Temporary"].map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Category<input name="category" placeholder="Department" maxLength={80}/></label>
      <label>Experience<input name="experienceLevel" placeholder="Experience level" maxLength={60}/></label>
      <label>Posted<select name="postedWithin"><option value="">Any time</option><option value="7">Past week</option><option value="30">Past month</option><option value="90">Past 90 days</option></select></label>
      <label>Minimum salary<input name="salaryMin" type="number" min="0" placeholder="When listed"/></label>
      <label>Maximum salary<input name="salaryMax" type="number" min="0" placeholder="When listed"/></label>
      <label>Salary currency<select name="salaryCurrency"><option value="">Choose currency</option>{["USD", "EUR", "GBP", "INR", "CAD", "AUD"].map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Source<select name="source"><option value="">All sources</option><option value="remotive">Remotive</option><option value="greenhouse">Greenhouse</option><option value="lever">Lever</option></select></label>
    </div></details>
     <div className="jobs-search-actions"><button className={`${siteStyles.button} button button-primary ${siteStyles.buttonPrimary}`} type="submit">Search jobs ↗</button><button className={`${siteStyles.button} button button-ghost ${siteStyles.buttonGhost}`} type="button" onClick={() => { if (pendingSearch.current) clearTimeout(pendingSearch.current); pendingSearch.current = null; formRef.current?.reset(); setKeyword(""); setRevision(0); onSearch({}); }}>Clear filters</button></div>
  </form>;
}
