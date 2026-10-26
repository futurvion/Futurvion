import { ConceptArtwork } from "@/components/shared/concept-artwork";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { portfolio } from "@/data/portfolio";
import { PageHero } from "@/components/shared/page-hero";
import { pageMetadata } from "@/lib/seo";
import { siteStyles } from "@/config/styles";
export const dynamicParams = false;
export function generateStaticParams() { return portfolio.map(p => ({ slug: p.slug })); }
export async function generateMetadata({ params }: PageProps<"/work/[slug]">) { const { slug } = await params; const p = portfolio.find(p => p.slug === slug); return p ? pageMetadata(`${p.title} — illustrative concept`, p.summary, `/work/${slug}`) : {}; }
export default async function WorkDetail({ params }: PageProps<"/work/[slug]">) { const { slug } = await params; const p = portfolio.find(p => p.slug === slug); if (!p) notFound(); return <><PageHero backLink={{ href: "/work", label: "Back to work" }} eyebrow={<>Illustrative concept · Not client work</>} title={<>{p.title}<em>.</em></>}><p>{p.summary}</p></PageHero><section className={`${siteStyles.pageSection} page-section`}><div className={siteStyles.container}><ConceptArtwork project={p}/></div><div className={`${siteStyles.container} case-grid`}><div><h2>The situation</h2><p>{p.challenge}</p></div><div><h2>The direction</h2><p>{p.approach}</p></div><div><h2>The concept includes</h2><ul>{p.deliverables.map(d => <li key={d}>{d}</li>)}</ul></div><div><h2>Concept status</h2><p>{p.implementation} {p.results}</p></div></div></section><section className={`${siteStyles.pageSection} page-section detail-outcome`}><div className={siteStyles.container}><h2>Have a challenge of your own?</h2><Link className={`${siteStyles.button} button button-light ${siteStyles.buttonLight}`} href="/contact">Let’s explore it <ArrowUpRight size={17} aria-hidden="true"/></Link></div></section></>; }
