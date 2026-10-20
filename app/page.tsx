import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { FAQ } from "@/components/faq";
import { HeroVisual } from "@/components/hero-visual";
import { ScrollStory } from "@/components/scroll-story";
import { ServiceIcon } from "@/components/service-icon";
import { services } from "@/data/services";
import { portfolio } from "@/data/portfolio";
import { site } from "@/config/site";

const approach = [
  ["01", "Understand", "We learn about your business, customers, goals, and the systems you already use."],
  ["02", "Define", "Together we set priorities, agree a practical scope, and make the next decisions clear."],
  ["03", "Make", "We design, build, and refine the agreed solution with your business in view."],
  ["04", "Evolve", "After launch, we can review what is working and plan further improvements."],
];

export default function Home() {
  return <>
    <section className="hero" id="home">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Futurvion / Digital solutions</span>
          <h1 aria-label={site.tagline}>Digital solution<br/><em>for every</em><br/>business</h1>
          <p>Futurvion brings brand, digital experiences, and technology together to help businesses show up clearly, work more effectively, and grow with purpose.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/services">Explore our services <ArrowUpRight size={18}/></Link>
            <Link className="button button-ghost" href="/contact">Let&apos;s talk <ArrowRight size={18}/></Link>
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
      <div className="container hero-foot"><span>{site.tagline}</span><span>Explore what&apos;s possible <ArrowRight size={16}/></span></div>
    </section>

    <section className="intro-band section" aria-labelledby="intro-title">
      <div className="container intro-grid">
        <span className="eyebrow">What we believe</span>
        <div><h2 id="intro-title">The strongest digital work starts with the business behind it.</h2><p>Whether you are establishing your presence, improving a customer journey, or connecting the tools your team relies on, we begin with the same question: what will make a meaningful difference for you?</p></div>
      </div>
    </section>

    <section className="section services-section" id="services" aria-labelledby="services-title">
      <div className="container">
        <div className="section-heading split"><div><span className="eyebrow">Our services</span><h2 id="services-title">Expertise that works <em>together.</em></h2></div><div><p>From a clear identity to a useful website and the technology behind your operations, we shape the right combination around your goals.</p><Link className="text-link" href="/services">Explore all services <ArrowUpRight size={18}/></Link></div></div>
        <div className="service-grid">{services.map(service => <article className="service-card" key={service.slug}><div className="service-card-top"><span>{service.number} / 08</span><span className="service-icon"><ServiceIcon name={service.icon}/></span></div><h3>{service.title}</h3><p>{service.short}</p><Link href={`/services/${service.slug}`} aria-label={`Explore ${service.title}`}>Explore service <ArrowUpRight size={18}/></Link></article>)}</div>
      </div>
    </section>

    <ScrollStory/>

    <section className="section solutions-preview" aria-labelledby="solutions-title"><div className="container"><div className="section-heading split"><div><span className="eyebrow">Who we help</span><h2 id="solutions-title">Built around your <em>business.</em></h2></div><p>Different organizations need different starting points. We adapt the work to your customers, team, and stage of growth.</p></div><div className="solution-tiles"><Link href="/solutions#retail"><span>01 / Commerce</span><h3>Retail & e-commerce</h3><p>Make it easier for people to discover, choose, and buy.</p><ArrowUpRight size={20}/></Link><Link href="/solutions#services"><span>02 / Expertise</span><h3>Professional services</h3><p>Present your expertise clearly and turn interest into enquiries.</p><ArrowUpRight size={20}/></Link><Link href="/solutions#operations"><span>03 / Operations</span><h3>Growing teams</h3><p>Connect daily work with tools designed for the way you operate.</p><ArrowUpRight size={20}/></Link></div><Link className="text-link" href="/solutions">See more business solutions <ArrowUpRight size={18}/></Link></div></section>

    <section className="section process-section" id="process" aria-labelledby="process-title"><div className="container"><div className="section-heading split"><div><span className="eyebrow">How we work</span><h2 id="process-title">A considered path <em>forward.</em></h2></div><p>Each engagement is shaped by its scope. Our process keeps the work grounded in what your business needs and gives every stage a clear purpose.</p></div><div className="process-grid">{approach.map(([number, title, description]) => <div className="process-step" key={number}><span className="process-number">{number}</span><h3>{title}</h3><p>{description}</p></div>)}</div></div></section>

    <section className="section work-section" aria-labelledby="work-title"><div className="container"><div className="section-heading split"><div><span className="eyebrow">Thinking in practice</span><h2 id="work-title">An idea of what&apos;s <em>possible.</em></h2></div><div><p>These explorations are illustrative concepts, not completed client projects. They show how we think about real business challenges.</p><Link className="text-link" href="/work">View all concepts <ArrowUpRight size={18}/></Link></div></div><div className="work-preview">{portfolio.slice(0, 2).map((concept, index) => <Link className="work-preview-item" href={`/work/${concept.slug}`} key={concept.slug}><span className="work-preview-number">0{index + 1}</span><div><span className="eyebrow">Illustrative concept / {concept.category}</span><h3>{concept.title}</h3><p>{concept.summary}</p></div><ArrowUpRight size={22}/></Link>)}</div></div></section>

    <section className="section faq-section" aria-labelledby="faq-title"><div className="container faq-layout"><div><span className="eyebrow">Good to know</span><h2 id="faq-title">A few common <em>questions.</em></h2><p>If you have something more specific in mind, we would be glad to hear it.</p><Link className="text-link" href="/contact">Ask us directly <ArrowUpRight size={18}/></Link></div><FAQ limit={5}/></div></section>

    <section className="final-cta section"><div className="container final-cta-layout"><div><span className="eyebrow">Start a conversation</span><h2>Let&apos;s make the next step <em>clear.</em></h2></div><div><p>Tell us where your business is today and what you want to change. We can help define a practical way forward.</p><Link className="button button-light" href="/contact">Let&apos;s talk <ArrowUpRight size={18}/></Link></div></div></section>
  </>;
}
