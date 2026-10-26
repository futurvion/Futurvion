import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { HeroVisual } from "@/components/home/hero-visual";
import { site } from "@/config/site";
import { FAQ } from "@/components/home/faq";
import { ProjectStartingPoint } from "@/components/home/project-starting-point";
import { ConceptArtwork } from "@/components/shared/concept-artwork";
import { services } from "@/data/services";
import { portfolio } from "@/data/portfolio";
import { siteStyles } from "@/config/styles";

const approach = [
  ["Understand", "We learn about your business, your customers, and the tools you already use."],
  ["Define", "Together we agree on priorities, a practical scope, and what progress means."],
  ["Make", "We design, build, and refine with your business in view at every stage."],
  ["Evolve", "After launch, we can review what works and plan the next improvement."],
];

export default function Home() {
  return <>
    <section className="hero" id="home">
      <div className={`${siteStyles.container} hero-grid`}>
        <div className="hero-copy">
          <span className={`${siteStyles.eyebrow} eyebrow`}>
          Futurvion / AI, Software & Digital Solutions
        </span>

        <h1>
          Futurvion<br />
          <em>Digital solutions</em><br />
          for business
        </h1>
          <p>Futurvion brings brand, digital experiences, and technology together to help businesses show up clearly, work more effectively, and grow with purpose.</p>
          <div className="hero-actions">
            <Link className={`${siteStyles.button} button button-primary ${siteStyles.buttonPrimary}`} href="/services">Explore our services <ArrowUpRight size={18}/></Link>
            <Link className={`${siteStyles.button} button button-ghost ${siteStyles.buttonGhost}`} href="/contact">Let&apos;s talk <ArrowRight size={18}/></Link>
          </div>
        </div>
        <div className="hero-composition" aria-label="Brand, digital experience, and systems working together">
          <div className="composition-top"><span>One connected approach</span><span>F / 01</span></div>
          <div className="composition-stage" aria-hidden="true"><HeroVisual contained /></div>
          <div className="composition-center"><span>Clarity in how you&apos;re seen.</span><span>Confidence in how you work.</span></div>
          <div className="composition-diagram" aria-hidden="true"><span>Brand</span><i/><span>Experience</span><i/><span>Systems</span></div>
          <div className="composition-bottom"><span>Strategy</span><span>Design</span><span>Technology</span></div>
        </div>
      </div>
      <div className={`${siteStyles.container} hero-foot`}><span>{site.tagline}</span><span>Explore what&apos;s possible <ArrowRight size={16}/></span></div>
    </section>

    <section className={`studio-intro ${siteStyles.section}`} aria-labelledby="intro-title"><div className={`${siteStyles.container} studio-intro-grid`}><h2 id="intro-title">One business.<br/>Connected thinking.</h2><div><p>Your identity, customer experience, and day-to-day tools should support the same goals. We bring these conversations together, so your next investment makes sense for the whole business.</p><Link className={`${siteStyles.textLink} text-link`} href="/about">Meet Futurvion <ArrowUpRight size={18} aria-hidden="true"/></Link></div></div></section>

    <section className={`studio-services ${siteStyles.section}`} id="services" aria-labelledby="services-title"><div className={siteStyles.container}><div className="section-heading split"><h2 id="services-title">What can we<br/>move forward?</h2><p>Start with one challenge or connect several capabilities. We shape the work around what your business needs.</p></div><div className="capability-index">{services.map(service => <Link href={`/services/${service.slug}`} key={service.slug}><h3>{service.title}</h3><p>{service.short}</p><ArrowUpRight size={24} aria-hidden="true"/></Link>)}</div></div></section>

    <section className={`studio-work ${siteStyles.section}`} aria-labelledby="work-title"><div className={siteStyles.container}><div className="section-heading split"><h2 id="work-title">Ideas made tangible.</h2><div><p>Illustrative concepts that explore business challenges. These are design explorations, not completed client projects.</p><Link className={`${siteStyles.textLink} text-link`} href="/work">Explore all concepts <ArrowUpRight size={18} aria-hidden="true"/></Link></div></div><div className="studio-work-grid">{portfolio.slice(0, 2).map(concept => <Link className="studio-project" href={`/work/${concept.slug}`} key={concept.slug}><ConceptArtwork project={concept}/><div className="studio-project-caption"><div><h3>{concept.title}</h3><p>{concept.category} · Illustrative concept</p></div><ArrowUpRight aria-hidden="true"/></div></Link>)}</div></div></section>

    <ProjectStartingPoint/>

    <section className={`studio-process ${siteStyles.section}`} id="process" aria-labelledby="process-title"><div className={siteStyles.container}><div className="process-layout"><div className="process-intro"><span className="process-label">How we work</span><h2 id="process-title">Clear at <br/>every stage.</h2><p>A practical process, shaped by the scope. You know what we are working toward and what comes next.</p><Link className="process-contact" href="/contact">Talk through your project <ArrowUpRight size={18} aria-hidden="true"/></Link></div><ol className="studio-process-list">{approach.map(([title, description], index) => <li key={title}><span className="process-step-number" aria-hidden="true">0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div><ArrowUpRight className="process-step-arrow" size={22} aria-hidden="true"/></li>)}</ol></div></div></section>

    <section className={`faq-section ${siteStyles.section}`} aria-labelledby="faq-title"><div className={`${siteStyles.container} faq-layout`}><div><h2 id="faq-title">Before we begin.</h2><p>A few things you might want to know. Have a different question?</p><Link className={`${siteStyles.textLink} text-link`} href="/contact">Ask us directly <ArrowUpRight size={18} aria-hidden="true"/></Link></div><FAQ limit={5}/></div></section>

    <section className={`final-cta ${siteStyles.section}`} aria-labelledby="next-title"><div className={`${siteStyles.container} final-cta-layout`}><h2 id="next-title">Your next chapter<br/>starts here.</h2><div><p>Tell us where your business is today and what you want to change. We will help define a practical way forward.</p><Link className={`${siteStyles.button} button button-primary ${siteStyles.buttonPrimary}`} href="/contact">Let&apos;s talk <ArrowUpRight size={18} aria-hidden="true"/></Link></div></div></section>
  </>;
}
