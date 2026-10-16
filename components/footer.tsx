import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/config/site";
import { services } from "@/data/services";

export function Footer() {
  return <footer className="footer">
    <div className="container footer-top"><div><Link className="brand footer-brand" href="/"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>FUTURVION<span className="brand-dot">.</span></span></Link><p>{site.tagline}</p><a className="footer-email" href={`mailto:${site.email}`}>{site.email} <ArrowUpRight size={17}/></a></div><div><h3>Explore</h3>{site.navigation.filter(i => i.label !== "Home").map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}</div><div><h3>Expertise</h3>{services.slice(0, 5).map(item => <Link key={item.slug} href={`/services/${item.slug}`}>{item.title}</Link>)}</div><div><h3>Let’s connect</h3><p>Tell us where you want to go. We’ll help define a practical next step.</p><Link className="button button-light" href="/contact">Start a conversation <ArrowUpRight size={17}/></Link></div></div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} Futurvion. All rights reserved.</span><span>Built for what’s next.</span><div>{site.footerLinks.map(item => <Link href={item.href} key={item.href}>{item.label}</Link>)}</div></div>
  </footer>;
}
