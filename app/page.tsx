import Link from "next/link";
import { ArrowRight, ArrowUpRight, MoveUpRight, Sparkles, Globe2, Workflow, Blocks, Check, PenTool, Cpu, LineChart } from "lucide-react";
import { HeroVisual } from "@/components/hero-visual";
import { ServiceIcon } from "@/components/service-icon";
import { Ecosystem } from "@/components/ecosystem";
import { WorkFilter } from "@/components/work-filter";
import { FAQ } from "@/components/faq";
import { ScrollStory } from "@/components/scroll-story";
import { HeroCopy } from "@/components/hero-copy";
import { Reveal } from "@/components/reveal";
import { services } from "@/data/services";

const outcomes = [
  { icon: Sparkles, title: "A brand worth remembering", text: "Show up with a clear story and a consistent identity wherever customers find you." },
  { icon: Globe2, title: "A stronger digital presence", text: "Turn your website and digital touchpoints into useful, welcoming experiences." },
  { icon: Workflow, title: "Less repetitive work", text: "Connect processes and tools so your people can focus on work that matters." },
  { icon: Blocks, title: "Room to grow", text: "Build maintainable technology around the business you are becoming." },
];
const recipe = [
  { icon: PenTool, tool: "Brand", job: "draws", text: "Identity, story and visual language: the shape people recognise before they read a word." },
  { icon: Cpu, tool: "Technology", job: "builds", text: "Websites, apps and automations engineered to fit how your business really runs." },
  { icon: LineChart, tool: "Growth", job: "listens", text: "Measurement and iteration, so every release teaches you what to improve next." },
];
const steps = [
  ["01", "Discover", "Understand your business, customers, goals, and constraints."],
  ["02", "Strategize", "Define priorities, scope, and how success will be measured."],
  ["03", "Design", "Shape the brand, experience, and system architecture."],
  ["04", "Develop", "Build, test, and refine the approved solution."],
  ["05", "Launch & grow", "Deploy, learn from use, and improve over time."],
];

export default function Home() { return <>
  <section className="hero" id="home"><div className="container hero-inner"><HeroCopy/><div className="hero-visual"><div className="hero-visual-glow"/><HeroVisual/></div></div><div className="container hero-tags"><span><b>Brand</b> · identity that is remembered</span><span><b>Technology</b> · software that fits</span><span><b>Growth</b> · measured, then improved</span></div><div className="hero-bottom container"><span>DIGITAL SOLUTIONS FOR EVERY BUSINESS</span><span>BUILT FOR WHAT’S NEXT <MoveUpRight size={14}/></span></div></section>

  <div className="marquee" aria-hidden="true"><div className="marquee-track">{[0, 1].map(n => <ul key={n}>{["Brand strategy","Websites","Custom software","Mobile & web apps","Automation","AI integration","Analytics","Digital marketing","Consulting"].map(t => <li key={t}>{t}</li>)}</ul>)}</div></div>

  <section className="recipe-section section" id="recipe"><div className="container"><div className="section-heading split"><div><span className="eyebrow">SAME RECIPE · EVERY BUSINESS</span><h2>Same recipe,<br/><span>your own feeling.</span></h2></div><p>Three disciplines, one job each. We tune the mix to your business, so a local shop and a growing operation both get something that feels like theirs.</p></div><div className="recipe-grid">{recipe.map((r, i) => <Reveal className="recipe-card" delay={i * .08} key={r.tool}><r.icon size={26} strokeWidth={1.4}/><span className="recipe-job">{String(i + 1).padStart(2, "0")} · {r.tool} <b>{r.job}</b></span><p>{r.text}</p></Reveal>)}</div></div></section>

  <section className="outcomes section" id="outcomes"><div className="container"><div className="section-heading split"><div><span className="eyebrow">01 / THE BIG PICTURE</span><h2>Everything connects.<br/><span>That’s the advantage.</span></h2></div><p>A brand, a website, and the tools behind your business should pull in the same direction. We bring those pieces together, whatever your size or sector.</p></div><div className="outcome-grid">{outcomes.map((item, i) => <Reveal className="outcome-card" delay={i * .07} key={item.title}><span className="outcome-index">0{i + 1}</span><item.icon size={31} strokeWidth={1.4}/><h3>{item.title}</h3><p>{item.text}</p></Reveal>)}</div></div></section>

  <section className="services-section section" id="services"><div className="container"><div className="section-heading split"><div><span className="eyebrow">02 / WHAT WE DO</span><h2>One vision.<br/><span>Every capability.</span></h2></div><div><p>From the first spark of an idea to the systems that support your next stage, we shape solutions that work together.</p><Link className="text-link" href="/services">View all services <ArrowUpRight size={17}/></Link></div></div><div className="service-grid">{services.map((service, i) => <Reveal className={`service-card service-card-${i}`} delay={(i % 4) * .06} key={service.slug}><div className="service-card-top"><span>{service.number} / 08</span><span className="service-icon"><ServiceIcon name={service.icon}/></span></div><div className="service-card-visual" aria-hidden="true"><div/><div/><div/></div><h3>{service.title}</h3><p>{service.short}</p><div className="service-card-links"><Link href={`/services/${service.slug}`} aria-label={`Explore ${service.title}`}>Explore service <ArrowUpRight size={17}/></Link><Link href={`/contact?service=${service.slug}`} aria-label={`Discuss ${service.title}`}>Discuss this <ArrowRight size={16}/></Link></div></Reveal>)}</div></div></section>

  <section className="ecosystem-section section"><div className="container ecosystem-layout"><div className="ecosystem-intro"><span className="eyebrow">03 / CONNECTED THINKING</span><h2>More than the sum<br/>of its <span>parts.</span></h2><p>Your next opportunity rarely fits neatly into one box. Explore how different capabilities can work together around one business.</p><Link className="text-link" href="/solutions">Explore solutions <ArrowUpRight size={17}/></Link></div><Ecosystem/></div></section>

  <ScrollStory/>

  <section className="solutions-preview section"><div className="container"><div className="section-heading split"><div><span className="eyebrow">04 / EVERY BUSINESS</span><h2>Every business.<br/><span>Its own digital path.</span></h2></div><p>There is no preset formula. We look at your customers, operations, and opportunities before recommending what to build.</p></div><div className="solution-tiles"><Link href="/solutions#retail"><span>01</span><h3>Retail & e-commerce</h3><p>From first impression to a smoother purchase journey.</p><ArrowUpRight/></Link><Link href="/solutions#services"><span>02</span><h3>Professional services</h3><p>Make expertise easier to understand, trust, and access.</p><ArrowUpRight/></Link><Link href="/solutions#operations"><span>03</span><h3>Growing operations</h3><p>Bring scattered work into clearer, more connected systems.</p><ArrowUpRight/></Link></div></div></section>

  <section className="process-section section" id="process"><div className="container"><div className="section-heading split"><div><span className="eyebrow">05 / HOW WE WORK</span><h2>A clear path from<br/><span>idea to impact.</span></h2></div><p>Each stage makes the next decision easier. The exact deliverables are shaped by the scope we agree together.</p></div><div className="process-grid">{steps.map(([number, title, text], i) => <Reveal className="process-step" delay={i * .06} key={number}><span className="process-number">{number}</span><span className="process-line"/><h3>{title}</h3><p>{text}</p></Reveal>)}</div></div></section>

  <section className="work-section section" id="work"><div className="container"><div className="section-heading split"><div><span className="eyebrow">06 / EXPLORATIONS</span><h2>Ideas made <span>visible.</span></h2></div><p>These are clearly labeled illustrative concepts showing how a challenge might become a considered digital solution. Client work will appear here only with permission.</p></div><WorkFilter/></div></section>

  <section className="principles-section section"><div className="container principles-layout"><div><span className="eyebrow">07 / OUR APPROACH</span><h2>Thoughtful by design.<br/><span>Useful by default.</span></h2><p>Our working principles keep the focus on what your business and your customers actually need.</p></div><div className="principles-list">{["Brand and technology planned together", "Solutions shaped around your requirements", "Usable, maintainable systems", "Performance and accessibility considered early", "Clear communication at each milestone", "Support beyond launch where agreed"].map((item, i) => <div key={item}><span>0{i + 1}</span><Check size={17}/><h3>{item}</h3></div>)}</div></div></section>

  <section className="faq-section section"><div className="container faq-layout"><div><span className="eyebrow">08 / GOOD TO KNOW</span><h2>Questions, <span>answered.</span></h2><p>Have something more specific in mind? We’re happy to hear it.</p><Link className="text-link" href="/contact">Ask us directly <ArrowUpRight size={17}/></Link></div><FAQ/></div></section>

  <section className="final-cta section"><div className="cta-glow" aria-hidden="true"/><div className="container"><span className="eyebrow">DIGITAL SOLUTIONS FOR EVERY BUSINESS</span><h2>Have an idea?<br/><em>Let’s make it real.</em></h2><div className="final-cta-bottom"><p>Tell us what you’re imagining, improving, or solving. We’ll help find the right place to begin.</p><Link className="button button-light" href="/contact">Start a conversation <ArrowUpRight size={18}/></Link></div></div></section>
</>; }
