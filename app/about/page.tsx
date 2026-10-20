import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("About", "Learn how Futurvion connects brand strategy, digital experiences, and technology around business goals.", "/about");

const principles = ["Understand before building", "Design for real people", "Keep things simple to use", "Plan for change", "Communicate clearly", "Measure what matters"];

export default function AboutPage() {
  return <><PageHero eyebrow="About Futurvion" title={<>Connected thinking for <em>better business.</em></>}><p>Futurvion is a digital solutions studio that brings brand, technology, and growth into one considered approach.</p></PageHero>
    <section className="page-section"><div className="container page-intro-grid"><div><span className="eyebrow">Why we exist</span><h2>Digital solution for every business.</h2></div><div><p>Businesses often have to connect separate conversations about identity, websites, software, and operations. Futurvion approaches these needs together, so each decision can support the same business direction.</p><p>We begin with discovery. From there, the right mix of strategy, design, building, and ongoing support can be shaped around your priorities.</p></div></div></section>
    <section className="page-section" style={{background:"var(--panel)"}}><div className="container"><span className="eyebrow">How we think</span><h2>Principles that guide the work.</h2><div className="capability-grid">{principles.map((item,i) => <div className="capability-card" key={item}><span>0{i+1}</span><h3>{item}</h3></div>)}</div></div></section>
    <section className="page-section detail-outcome"><div className="container"><h2>Let&apos;s shape what comes next.</h2><Link className="button button-light" href="/contact">Talk with Futurvion <ArrowUpRight size={17}/></Link></div></section>
  </>;
}
