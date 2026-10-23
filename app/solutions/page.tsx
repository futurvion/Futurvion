import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { pageMetadata } from "@/lib/seo";
import { siteStyles } from "@/config/styles";

export const metadata = pageMetadata("Solutions by business type", "Explore practical brand, website, software, and automation opportunities for different businesses.", "/solutions");

const sectors = [
  ["retail", "Retail businesses", "Build a recognizable store presence, make products easier to discover, and connect online enquiries or sales to your operations."],
  ["services", "Professional services", "Explain your expertise clearly, streamline enquiries and bookings, and give your team better internal tools."],
  ["healthcare", "Healthcare & wellness", "Design accessible patient-facing journeys and operational tools, with applicable privacy and compliance requirements assessed before implementation."],
  ["education", "Education & training", "Help learners find the right offering and give your team clearer registration and communication."],
  ["ecommerce", "Online shops", "Align identity, shopping experience, content, and results tracking around a more useful customer journey."],
  ["startups", "Startups", "Turn an early idea into a clear brand and a focused digital product you can try out and improve."],
  ["local", "Local businesses", "Make it easier for nearby customers to find, understand, and contact your business."],
  ["operations", "Growing operations", "Replace scattered spreadsheets and manual handoffs with tools designed around how you work."],
];

export default function SolutionsPage() {
  return <><PageHero eyebrow="Solutions" title={<>Shaped by your <em>business.</em></>}><p>These examples show ways brand, technology, and growth can support different needs. Each is a starting point for a tailored conversation.</p></PageHero>
    <section className={`${siteStyles.pageSection} page-section`}><div className={siteStyles.container}><div className="section-heading split"><div><span className={`${siteStyles.eyebrow} eyebrow`}>Where we can help</span><h2>Different needs. One considered approach.</h2></div><p>We look at your customers, operations, and priorities before recommending what to build.</p></div><div className="sector-grid">{sectors.map(([id,title,description],i) => <article className="sector-card" id={id} key={id}><span>{String(i+1).padStart(2,"0")} / Business type</span><h2>{title}</h2><p>{description}</p><Link className={`${siteStyles.textLink} text-link`} href="/contact">Discuss your needs <ArrowUpRight size={16}/></Link></article>)}</div></div></section>
  </>;
}
