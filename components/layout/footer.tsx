import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/config/site";
import { services } from "@/data/services";
import { siteStyles } from "@/config/styles";

export function Footer() {
  return <footer className="footer">
     <div className={`${siteStyles.container} footer-top`}>
      <div className="footer-intro"><Link className="footer-brand" href="/" aria-label="Futurvion home"><Image src="/logo-mark.png" alt="" width={512} height={451}/><span>FUTURVION</span></Link><p>Connected thinking for brand, digital experiences, and technology.</p><a className="footer-email" href={`mailto:${site.email}`}>{site.email} <ArrowUpRight size={17}/></a></div>
      <div><h3>Company</h3>{site.navigation.filter(i => i.label !== "Home").map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}</div>
      <div><h3>Services</h3>{services.slice(0, 5).map(item => <Link key={item.slug} href={`/services/${item.slug}`}>{item.title}</Link>)}<Link href="/services">All services</Link></div>
       <div className="footer-conversation"><h3>Start a conversation</h3><p>Tell us what you are building, improving, or working through.</p><Link className={`${siteStyles.button} button button-light ${siteStyles.buttonLight}`} href="/contact">Let&apos;s talk <ArrowUpRight size={17}/></Link></div>
    </div>
     <div className={`${siteStyles.container} footer-bottom`}><span>© {new Date().getFullYear()} Futurvion. All rights reserved.</span><span>{site.tagline}</span><div>{site.footerLinks.map(item => <Link href={item.href} key={item.href}>{item.label}</Link>)}</div></div>
  </footer>;
}
