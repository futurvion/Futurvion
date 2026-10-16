import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, MoveUpRight, Sparkles, Globe2, Workflow, Blocks, Check } from "lucide-react";
import { HeroVisual } from "@/components/hero-visual";
import { ServiceIcon } from "@/components/service-icon";
import { Ecosystem } from "@/components/ecosystem";
import { WorkFilter } from "@/components/work-filter";
import { FAQ } from "@/components/faq";
import { Reveal } from "@/components/reveal";
import { services } from "@/data/services";

const outcomes = [
  { icon: Sparkles, title: "A brand worth remembering", text: "Show up with a clear story and a consistent identity wherever customers find you." },
  { icon: Globe2, title: "A stronger digital presence", text: "Turn your website and digital touchpoints into useful, welcoming experiences." },
  { icon: Workflow, title: "Less repetitive work", text: "Connect processes and tools so your people can focus on work that matters." },
  { icon: Blocks, title: "Room to grow", text: "Build maintainable technology around the business you are becoming." },
];
const steps = [
  ["01", "Discover", "Understand your business, customers, goals, and constraints."],
  ["02", "Strategize", "Define priorities, scope, and how success will be measured."],
  ["03", "Design", "Shape the brand, experience, and system architecture."],
  ["04", "Develop", "Build, test, and refine the approved solution."],
  ["05", "Launch & grow", "Deploy, learn from use, and improve over time."],
];

export default function Home() { return <>
  <section className="hero" id="home"><div className="hero-grid" aria-hidden="true"/><div className="container hero-inner"><div className="hero-copy"><div className="eyebrow eyebrow-line"><span className="pulse-dot"/> THE NEXT CHAPTER STARTS HERE</div><h1>Turn your vision into <em>digital growth<span className="period">.</span></em></h1><p>Futurvion brings branding, technology, and digital experiences together to help ambitious businesses move forward with clarity.</p><div className="hero-actions"><Link className="button button-primary" href="/contact">Let’s build your future <ArrowUpRight size={18}/></Link><Link className="button button-ghost" href="/#services">Explore our services <ArrowRight size={18}/></Link></div><div className="hero-scroll"><ArrowDown size={16}/> SCROLL TO EXPLORE</div></div><div className="hero-visual"><div className="hero-visual-glow"/><HeroVisual/><div className="hero-orbit-label label-one"><span/> BRAND</div><div className="hero-orbit-label label-two"><span/> TECHNOLOGY</div><div className="hero-orbit-label label-three"><span/> GROWTH</div></div></div><div className="hero-bottom container"><span>STRATEGY MEETS EXECUTION</span><span>BUILT FOR WHAT’S NEXT <MoveUpRight size={14}/></span></div></section>

  <section className="outcomes section" id="outcomes"><div className="container"><div className="section-heading split"><div><span className="eyebrow">01 / THE BIG PICTURE</span><h2>Everything connects.<br/><span>That’s the advantage.</span></h2></div><p>A brand, a website, and the tools behind your business should pull in the same direction. We bring those pieces together around your goals.</p></div><div className="outcome-grid">{outcomes.map((item, i) => <Reveal className="outcome-card" delay={i * .07} key={item.title}><span className="outcome-index">0{i + 1}</span><item.icon size={31} strokeWidth={1.4}/><h3>{item.title}</h3><p>{item.text}</p></Reveal>)}</div></div></section>

  <section className="services-section section" id="services"><div className="container"><div className="section-heading split"><div><span className="eyebrow">02 / WHAT WE DO</span><h2>One vision.<br/><span>Every capability.</span></h2></div><div><p>From the first spark of an idea to the systems that support your next stage, we shape solutions that work together.</p><Link className="text-link" href="/services">View all services <ArrowUpRight size={17}/></Link></div></div><div className="service-grid">{services.map((service, i) => <Reveal className={`service-card service-card-${i}`} delay={(i % 4) * .06} key={service.slug}><div className="service-card-top"><span>{service.number} / 08</span><span className="service-icon"><ServiceIcon name={service.icon}/></span></div><div className="service-card-visual" aria-hidden="true"><div/><div/><div/></div><h3>{service.title}</h3><p>{service.short}</p><div className="service-card-links"><Link href={`/services/${service.slug}`} aria-label={`Explore ${service.title}`}>Explore service <ArrowUpRight size={17}/></Link><Link href={`/contact?service=${service.slug}`} aria-label={`Discuss ${service.title}`}>Discuss this <ArrowRight size={16}/></Link></div></Reveal>)}</div></div></section>

  <section className="ecosystem-section section"><div className="container ecosystem-layout"><div className="ecosystem-intro"><span className="eyebrow">03 / CONNECTED THINKING</span><h2>More than the sum<br/>of its <span>parts.</span></h2><p>Your next opportunity rarely fits neatly into one box. Explore how different capabilities can work together around one business.</p><Link className="text-link" href="/solutions">Explore solutions <ArrowUpRight size={17}/></Link></div><Ecosystem/></div></section>

  <section className="solutions-preview section"><div className="container"><div className="section-heading split"><div><span className="eyebrow">04 / BUILT AROUND YOU</span><h2>Different businesses.<br/><span>Different paths forward.</span></h2></div><p>There is no preset formula. We look at your customers, operations, and opportunities before recommending what to build.</p></div><div className="solution-tiles"><Link href="/solutions#retail"><span>01</span><h3>Retail & e-commerce</h3><p>From first impression to a smoother purchase journey.</p><ArrowUpRight/></Link><Link href="/solutions#services"><span>02</span><h3>Professional services</h3><p>Make expertise easier to understand, trust, and access.</p><ArrowUpRight/></Link><Link href="/solutions#operations"><span>03</span><h3>Growing operations</h3><p>Bring scattered work into clearer, more connected systems.</p><ArrowUpRight/></Link></div></div></section>

  <section className="process-section section" id="process"><div className="container"><div className="section-heading split"><div><span className="eyebrow">05 / HOW WE WORK</span><h2>A clear path from<br/><span>idea to impact.</span></h2></div><p>Each stage makes the next decision easier. The exact deliverables are shaped by the scope we agree together.</p></div><div className="process-grid">{steps.map(([number, title, text], i) => <Reveal className="process-step" delay={i * .06} key={number}><span className="process-number">{number}</span><span className="process-line"/><h3>{title}</h3><p>{text}</p></Reveal>)}</div></div></section>

  <section className="work-section section" id="work"><div className="container"><div className="section-heading split"><div><span className="eyebrow">06 / EXPLORATIONS</span><h2>Ideas made <span>visible.</span></h2></div><p>These are clearly labeled illustrative concepts showing how a challenge might become a considered digital solution. Client work will appear here only with permission.</p></div><WorkFilter/></div></section>

  <section className="principles-section section"><div className="container principles-layout"><div><span className="eyebrow">07 / OUR APPROACH</span><h2>Thoughtful by design.<br/><span>Useful by default.</span></h2><p>Our working principles keep the focus on what your business and your customers actually need.</p></div><div className="principles-list">{["Brand and technology planned together", "Solutions shaped around your requirements", "Usable, maintainable systems", "Performance and accessibility considered early", "Clear communication at each milestone", "Support beyond launch where agreed"].map((item, i) => <div key={item}><span>0{i + 1}</span><Check size={17}/><h3>{item}</h3></div>)}</div></div></section>

  <section className="collaboration-section section"><div className="container collaboration-layout"><div><span className="eyebrow">08 / WORKING TOGETHER</span><h2>A process you can<br/><span>participate in.</span></h2></div><div className="collaboration-copy"><p>Good work is collaborative. We use discovery, shared milestones, and regular reviews so decisions stay grounded in your business.</p><div className="collaboration-tags"><span>Shared priorities</span><span>Visible progress</span><span>Considered delivery</span></div></div></div></section>

  <section className="faq-section section"><div className="container faq-layout"><div><span className="eyebrow">09 / GOOD TO KNOW</span><h2>Questions, <span>answered.</span></h2><p>Have something more specific in mind? We’re happy to hear it.</p><Link className="text-link" href="/contact">Ask us directly <ArrowUpRight size={17}/></Link></div><FAQ/></div></section>

  <section className="final-cta section"><div className="container"><span className="eyebrow">THE FUTURE IS A WORK IN PROGRESS</span><h2>Have an idea?<br/><em>Let’s make it real.</em></h2><div className="final-cta-bottom"><p>Tell us what you’re imagining, improving, or solving. We’ll help find the right place to begin.</p><Link className="button button-light" href="/contact">Start a conversation <ArrowUpRight size={18}/></Link></div></div></section>
</>; }
