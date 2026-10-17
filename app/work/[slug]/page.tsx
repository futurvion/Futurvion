import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { portfolio } from "@/data/portfolio";
import { pageMetadata } from "@/lib/seo";
export const dynamicParams = false;
export function generateStaticParams() { return portfolio.map(p => ({ slug: p.slug })); }
export async function generateMetadata({ params }: PageProps<"/work/[slug]">) { const { slug } = await params; const p = portfolio.find(p => p.slug === slug); return p ? pageMetadata(`${p.title} — illustrative concept`, p.summary, `/work/${slug}`) : {}; }
export default async function WorkDetail({ params }: PageProps<"/work/[slug]">) { const { slug } = await params; const p = portfolio.find(p => p.slug === slug); if (!p) notFound(); return <><section className="inner-hero"><div className="container"><span className="case-label">Illustrative concept · Not client work</span><h1>{p.title}<em>.</em></h1><p>{p.summary}</p></div></section><section className="page-section"><div className="container case-grid"><div><span className="eyebrow">01 / CHALLENGE</span><h2>The situation</h2><p>{p.challenge}</p></div><div><span className="eyebrow">02 / APPROACH</span><h2>The direction</h2><p>{p.approach}</p></div><div><span className="eyebrow">03 / DELIVERABLES</span><h2>The concept includes</h2><ul>{p.deliverables.map(d => <li key={d}>{d}</li>)}</ul></div><div><span className="eyebrow">04 / IMPLEMENTATION & RESULTS</span><h2>Concept status</h2><p>{p.implementation} {p.results}</p></div></div></section><section className="page-section detail-outcome"><div className="container"><h2>Have a challenge of your own?</h2><Link className="button button-light" href="/contact">Let’s explore it <ArrowUpRight size={17}/></Link></div></section></>; }
