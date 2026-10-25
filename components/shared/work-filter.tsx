"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { siteStyles } from "@/config/styles";
import { useState } from "react";
import { ConceptArtwork } from "@/components/shared/concept-artwork";
import { portfolio } from "@/data/portfolio";

const filters = ["All", "Branding", "Websites", "Software", "Automation", "Growth"] as const;
export function WorkFilter() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const shown = filter === "All" ? portfolio : portfolio.filter(p => p.category === filter);
  return <><div className="filter-row" role="group" aria-label="Filter concepts by service">{filters.map(item => <button type="button" key={item} aria-pressed={filter === item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><p className="filter-count" role="status">{shown.length} illustrative {shown.length === 1 ? "concept" : "concepts"}</p><div className="work-grid">{shown.map((project, i) => <Link className={`work-card work-card-${i % 3}`} href={`/work/${project.slug}`} key={project.slug}><ConceptArtwork project={project}/><div className="work-card-body"><span className={`${siteStyles.eyebrow} eyebrow`}>{project.industry} / {project.category}</span><h3>{project.title}<ArrowUpRight size={22} aria-hidden="true"/></h3><p>{project.summary}</p></div></Link>)}</div></>;
}
