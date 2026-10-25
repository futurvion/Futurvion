import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/data/services";
import { PageHero } from "@/components/shared/page-hero";
import { pageMetadata } from "@/lib/seo";
import { siteStyles } from "@/config/styles";

export const metadata = pageMetadata("Services", "Explore branding, websites, custom software, automation, and digital growth services shaped around your business goals.", "/services");

export default function ServicesPage() {
  return <><PageHero backLink={{ href: "/", label: "Back to home" }} visual="services" eyebrow="Our capabilities" title={<>Expertise,<br/>connected.</>}><p>From the way your business is seen to the systems that support it, our services help connect your next steps to your wider goals.</p><Link className={`${siteStyles.button} button button-primary ${siteStyles.buttonPrimary}`} href="/contact">Discuss your needs <ArrowUpRight size={17} aria-hidden="true"/></Link></PageHero>
    <section className={`${siteStyles.pageSection} page-section`}><div className={siteStyles.container}><div className="section-heading split"><div><h2>Explore our services.</h2></div><p>Every engagement starts with understanding your business. The capabilities below can stand alone or work together as part of a broader plan.</p></div><div className="service-grid">{services.map(s => <article className="service-card" key={s.slug}><h3>{s.title}</h3><p>{s.short}</p><div className="service-card-links"><Link href={`/services/${s.slug}`}>Explore service <ArrowUpRight size={17} aria-hidden="true"/></Link><Link href={`/contact?service=${s.slug}`}>Discuss this service <ArrowUpRight size={17} aria-hidden="true"/></Link></div></article>)}</div></div></section>
  </>;
}
