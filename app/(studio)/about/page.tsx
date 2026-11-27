import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { pageMetadata } from "@/lib/seo";
import { siteStyles } from "@/config/styles";
import { site } from "@/config/site";
import { services } from "@/data/services";

export const metadata = pageMetadata("About", "Learn how Futurvion connects brand strategy, digital experiences, and technology around business goals.", "/about");

const principles: [string, string][] = [
  ["Understand before building", "We start with your goals, customers, and current tools so the work solves the right problem."],
  ["Design for real people", "Every page, screen, and workflow is shaped around the people who will actually use it."],
  ["Keep things simple to use", "We favour clear, maintainable solutions over complexity that your team has to work around."],
  ["Plan for change", "We build with room to grow, so the next improvement does not mean starting again."],
  ["Communicate clearly", "You know what we are working on, what has been decided, and what comes next."],
  ["Measure what matters", "We agree on what progress looks like and use it to guide the next decision."],
];

const resources = [
  { href: "/blog", title: "Blog", description: "Plain-language guides on AI agents, automation, and how businesses can use them." },
  { href: "/tools", title: "Free tools", description: "Browser-based utilities, such as a QR code generator, free to use." },
  { href: "/jobs", title: "Jobs", description: "Openings in technology, design, marketing, and product from public career pages." },
];

export default function AboutPage() {
  return <><PageHero visual="about" eyebrow="About Futurvion" title={<>Meet Futurvion.</>}><p>Futurvion is a digital solutions studio that brings brand, technology, and growth into one considered approach.</p></PageHero>
    <section className={`${siteStyles.pageSection} page-section`}><div className={`${siteStyles.container} page-intro-grid`}><div><h2>Digital solution for every business.</h2></div><div><p>Businesses often have to connect separate conversations about identity, websites, software, and operations. Futurvion approaches these needs together, so each decision can support the same business direction.</p><p>We begin with discovery. From there, the right mix of strategy, design, building, and ongoing support can be shaped around your priorities.</p></div></div></section>
    <section className={`${siteStyles.pageSection} page-section`} style={{background:"var(--panel)"}}><div className={siteStyles.container}><h2>Principles that guide the work.</h2><div className="capability-grid">{principles.map(([title, description]) => <div className="capability-card" key={title}><h3>{title}</h3><p>{description}</p></div>)}</div></div></section>
    <section className={`${siteStyles.pageSection} page-section`}><div className={siteStyles.container}><h2>What we do.</h2><div className="capability-grid">{services.map(service => <div className="capability-card" key={service.slug}><h3><Link href={`/services/${service.slug}`}>{service.title}</Link></h3><p>{service.short}</p></div>)}</div><p style={{marginTop:24}}><Link href="/services">Explore all services <ArrowUpRight size={14} aria-hidden="true"/></Link></p></div></section>
    <section className={`${siteStyles.pageSection} page-section`} style={{background:"var(--panel)"}}><div className={siteStyles.container}><h2>Learn and explore.</h2><div className="capability-grid">{resources.map(item => <div className="capability-card" key={item.href}><h3><Link href={item.href}>{item.title}</Link></h3><p>{item.description}</p></div>)}</div></div></section>
    <section className={`${siteStyles.pageSection} page-section detail-outcome`}><div className={siteStyles.container}><h2>Let&apos;s shape what comes next.</h2><p>Email <a href={`mailto:${site.email}`}>{site.email}</a> or send us a message.</p><Link className={`${siteStyles.button} button button-light ${siteStyles.buttonLight}`} href="/contact">Talk with Futurvion <ArrowUpRight size={17} aria-hidden="true"/></Link></div></section>
  </>;
}
