"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { siteStyles } from "@/config/styles";
import { useState } from "react";
import { ConceptArtwork } from "@/components/shared/concept-artwork";
import { portfolio, studioProducts } from "@/data/portfolio";

const filters = ["All", "Branding", "Websites", "Software", "Automation", "Growth"] as const;
export function WorkFilter() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const shown = filter === "All" ? portfolio : portfolio.filter(p => p.category === filter);
  return <><div className="filter-row" role="group" aria-label="Filter concepts by service">{filters.map(item => <button type="button" key={item} aria-pressed={filter === item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><p className="filter-count" role="status">{shown.length} illustrative {shown.length === 1 ? "concept" : "concepts"}</p><div className="work-grid">{studioProducts.filter(p => filter === "All" || filter === p.category).map(product => <a key={product.url} className="work-card" href={product.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${product.title} in a new tab`}><div className="work-card-body"><span className={`${siteStyles.eyebrow} eyebrow`}>Futurvion product / Free tools</span><h3>{product.title}<ArrowUpRight size={22} aria-hidden="true"/></h3><p>{product.summary}</p><p>No login required. Open toolbox</p></div></a>)}{shown.map((project, i) => <Link className={`work-card work-card-${i % 3}`} href={`/work/${project.slug}`} key={project.slug}><ConceptArtwork project={project}/><div className="work-card-body"><span className={`${siteStyles.eyebrow} eyebrow`}>{project.industry} / {project.category}</span><h3>{project.title}<ArrowUpRight size={22} aria-hidden="true"/></h3><p>{project.summary}</p></div></Link>)}</div></>;
}
