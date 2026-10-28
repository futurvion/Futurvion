import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/config/site";
import { services } from "@/data/services";
import { siteStyles } from "@/config/styles";

export function Footer() {
  return <footer className="footer footer-refined">
    <div className={`${siteStyles.container} footer-invitation`}>
      <div><h2>Let&apos;s build what&apos;s next.</h2><p>A clearer brand. A better experience. Tools that work for you.</p></div>
      <Link className={`${siteStyles.button} button button-light ${siteStyles.buttonLight}`} href="/contact">Start a conversation <ArrowUpRight size={18} aria-hidden="true"/></Link>
    </div>
    <div className={`${siteStyles.container} footer-top`}>
      <div className="footer-intro">
        <Link className="footer-brand" href="/" aria-label="Futurvion home"><Image src="/logo-full-white.png" alt="Futurvion — Digital Solutions for Every Business" width={2160} height={728} sizes="220px"/></Link>
        <p>Brand, digital experiences, and technology.<br/>One connected approach.</p>
        <div className="footer-connect"><a className="footer-email" href={`mailto:${site.email}`}>{site.email}<ArrowUpRight size={16} aria-hidden="true"/></a>{site.socials.map(social => <a key={social.url} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={`${social.label}: @futurvion (opens in a new tab)`}>{social.label}<span>@futurvion</span><ArrowUpRight size={16} aria-hidden="true"/></a>)}</div>
      </div>
      <div className="footer-link-column"><h3 id="footer-company">Explore</h3><nav aria-labelledby="footer-company">{site.navigation.filter(item => item.label !== "Home").map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav></div>
      <div className="footer-link-column"><h3 id="footer-services">What we do</h3><nav aria-labelledby="footer-services">{services.slice(0, 5).map(item => <Link key={item.slug} href={`/services/${item.slug}`}>{item.title}</Link>)}<Link href="/services">View all services <ArrowUpRight size={14} aria-hidden="true"/></Link></nav></div>
    </div>
    <div className={`${siteStyles.container} footer-bottom`}><span>© {new Date().getFullYear()} Futurvion</span><div>{site.footerLinks.map(item => <Link href={item.href} key={item.href}>{item.label}</Link>)}</div></div>
  </footer>;
}
