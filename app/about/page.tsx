import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { pageMetadata } from "@/lib/seo";
import { siteStyles } from "@/config/styles";

export const metadata = pageMetadata("About", "Learn how Futurvion connects brand strategy, digital experiences, and technology around business goals.", "/about");

const principles = ["Understand before building", "Design for real people", "Keep things simple to use", "Plan for change", "Communicate clearly", "Measure what matters"];

export default function AboutPage() {
  return <><PageHero eyebrow="About Futurvion" title={<>Connected thinking for <em>better business.</em></>}><p>Futurvion is a digital solutions studio that brings brand, technology, and growth into one considered approach.</p></PageHero>
    <section className={`${siteStyles.pageSection} page-section`}><div className={`${siteStyles.container} page-intro-grid`}><div><span className={`${siteStyles.eyebrow} eyebrow`}>Why we exist</span><h2>Digital solution for every business.</h2></div><div><p>Businesses often have to connect separate conversations about identity, websites, software, and operations. Futurvion approaches these needs together, so each decision can support the same business direction.</p><p>We begin with discovery. From there, the right mix of strategy, design, building, and ongoing support can be shaped around your priorities.</p></div></div></section>
    <section className={`${siteStyles.pageSection} page-section`} style={{background:"var(--panel)"}}><div className={siteStyles.container}><span className={`${siteStyles.eyebrow} eyebrow`}>How we think</span><h2>Principles that guide the work.</h2><div className="capability-grid">{principles.map((item,i) => <div className="capability-card" key={item}><span>0{i+1}</span><h3>{item}</h3></div>)}</div></div></section>
    <section className={`${siteStyles.pageSection} page-section detail-outcome`}><div className={siteStyles.container}><h2>Let&apos;s shape what comes next.</h2><Link className={`${siteStyles.button} button button-light ${siteStyles.buttonLight}`} href="/contact">Talk with Futurvion <ArrowUpRight size={17}/></Link></div></section>
  </>;
}
