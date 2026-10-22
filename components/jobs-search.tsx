"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
export function JobsSearch() {
  const router = useRouter(); const params = useSearchParams();
  const [keyword, setKeyword] = useState(params.get("q") ?? "");
  useEffect(() => { const timer = setTimeout(() => {
    if (keyword === (params.get("q") ?? "")) return;
    const next = new URLSearchParams(params.toString());
    if (keyword.trim()) next.set("q", keyword.trim()); else next.delete("q");
    next.delete("page"); router.replace(`/jobs?${next}`);
  }, 400); return () => clearTimeout(timer); }, [keyword, params, router]);
  return <form className="jobs-search" action="/jobs" method="get" onSubmit={event => { event.preventDefault(); const next = new URLSearchParams(); new FormData(event.currentTarget).forEach((value, key) => { if (typeof value === "string" && value.trim()) next.set(key, value.trim()); }); router.push(next.size ? `/jobs?${next}` : "/jobs"); }}>
    <label>Role, skill, or keyword<input name="q" value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="e.g. Product designer" maxLength={120}/></label>
    <label>Company<input name="company" defaultValue={params.get("company") ?? ""} placeholder="Company" maxLength={100}/></label>
    <label>Location<input name="location" defaultValue={params.get("location") ?? ""} placeholder="City or country" maxLength={100}/></label>
    <label>Work mode<select name="workMode" defaultValue={params.get("workMode") ?? ""}><option value="">Any mode</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">Onsite</option></select></label>
    <label>Employment<select name="employmentType" defaultValue={params.get("employmentType") ?? ""}><option value="">Any type</option>{["Full-time", "Part-time", "Contract", "Internship", "Temporary"].map(value => <option key={value}>{value}</option>)}</select></label>
    <label>Category<input name="category" defaultValue={params.get("category") ?? ""} placeholder="Department" maxLength={80}/></label>
    <label>Experience<input name="experienceLevel" defaultValue={params.get("experienceLevel") ?? ""} placeholder="Experience level" maxLength={60}/></label>
    <label>Posted<select name="postedWithin" defaultValue={params.get("postedWithin") ?? ""}><option value="">Any time</option><option value="7">Past week</option><option value="30">Past month</option><option value="90">Past 90 days</option></select></label>
    <label>Minimum salary<input name="salaryMin" type="number" min="0" defaultValue={params.get("salaryMin") ?? ""} placeholder="When listed"/></label>
    <label>Maximum salary<input name="salaryMax" type="number" min="0" defaultValue={params.get("salaryMax") ?? ""} placeholder="When listed"/></label>
    <label>Salary currency<select name="salaryCurrency" defaultValue={params.get("salaryCurrency") ?? ""}><option value="">Choose currency</option>{["USD", "EUR", "GBP", "INR", "CAD", "AUD"].map(value => <option key={value}>{value}</option>)}</select></label>
    <label>Source<select name="source" defaultValue={params.get("source") ?? ""}><option value="">All sources</option><option value="remotive">Remotive</option><option value="greenhouse">Greenhouse</option><option value="lever">Lever</option></select></label>
    <div className="jobs-search-actions"><button className="button button-primary" type="submit">Search jobs ↗</button><Link className="button button-ghost" href="/jobs">Clear filters</Link></div>
  </form>;
}
