import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ConceptArtwork } from "@/components/shared/concept-artwork";
import { portfolio } from "@/data/portfolio";

export type HeroAsideVariant = "services" | "solutions" | "work" | "about" | "contact" | "jobs" | "process";
const Arrow = () => <ArrowUpRight size={18} aria-hidden="true"/>;

/** Page-specific, honest studio material; every interactive item has a real destination. */
export function HeroAside({ variant }: { variant: HeroAsideVariant }) {
  if (variant === "work") return <aside className="hero-aside hero-aside-work" aria-label="Preview illustrative concepts"><div className="hero-concept-spread">{portfolio.slice(0, 2).map(project => <Link className="hero-concept-cover" href={`/work/${project.slug}`} key={project.slug} aria-label={`View ${project.title} illustrative concept`}><ConceptArtwork project={project}/></Link>)}</div><p className="hero-aside-caption">Ideas to explore. Illustrative concepts.</p></aside>;

  if (variant === "services") return <aside className="hero-aside hero-aside-services" aria-label="Connected studio capabilities"><p className="hero-aside-note">One connected approach</p><div className="hero-capability-stack"><Link href="/services/branding"><span>Brand</span><Arrow/></Link><Link href="/services/web-development"><span>Digital</span><Arrow/></Link><Link href="/services/custom-software"><span>Systems</span><Arrow/></Link></div><p className="hero-aside-caption">Designed to work together.</p></aside>;

  if (variant === "solutions") return <aside className="hero-aside hero-aside-solutions" aria-label="Find a starting point for your business"><p className="hero-aside-note">Your business comes first.</p><div className="hero-business-grid"><Link href="/solutions#retail">Retail<Arrow/></Link><Link href="/solutions#services">Expertise<Arrow/></Link><Link href="/solutions#startups">New ventures<Arrow/></Link><Link href="/solutions#operations">Growing teams<Arrow/></Link></div><p className="hero-aside-caption">Different needs. A considered approach.</p></aside>;

  if (variant === "about") return <aside className="hero-aside hero-aside-about" aria-label="Futurvion studio identity"><Image src="/logo-mark.png" alt="" width={512} height={451} sizes="(max-width: 620px) 110px, 160px"/><p>Brand. Experience.<br/>Technology.</p><span>One connected studio.</span></aside>;

  if (variant === "contact") return <aside className="hero-aside hero-aside-contact" aria-label="A starting point for your enquiry"><p className="hero-aside-note">A good place to start.</p><ul><li>What are you building?</li><li>What needs to improve?</li><li>What matters most?</li></ul><a className="hero-aside-link" href="#project-enquiry">Tell us your idea<Arrow/></a></aside>;

  if (variant === "jobs") return <aside className="hero-aside hero-aside-jobs" aria-label="Explore career opportunities"><p className="hero-aside-note">Your next chapter</p><p className="hero-jobs-title">Find your fit.</p><div className="hero-job-disciplines"><span>Technology</span><span>Design</span><span>Business</span></div><a className="hero-aside-link" href="#job-openings">Explore open roles<Arrow/></a></aside>;

  return <aside className="hero-aside hero-aside-process" aria-label="Project stages"><p className="hero-aside-note">From the first question to what&apos;s next.</p><ol>{["Understand", "Define", "Make", "Evolve"].map(stage => <li key={stage}>{stage}</li>)}</ol></aside>;
}
