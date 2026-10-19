import { ArrowUpRight } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { site } from "@/config/site";
import { PageHero } from "@/components/page-hero";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Contact", "Tell Futurvion about your brand, website, software, or automation project.", "/contact");
export default function ContactPage() { return <><PageHero eyebrow="LET’S CONNECT" title={<>Have an idea?<br/><em>Let’s make it real.</em></>}><p>Share a little about your goals. We’ll use it to start a useful conversation.</p></PageHero><section className="page-section"><div className="container contact-layout"><div className="contact-aside"><span className="eyebrow">START HERE</span><h2>Tell us what’s on your mind.</h2><p>Whether you have a clear brief or an early idea, tell us what you’re trying to achieve.</p><a href={`mailto:${site.email}`}>{site.email} <ArrowUpRight size={17}/></a>{site.bookingUrl && <p><a href={site.bookingUrl} target="_blank" rel="noopener noreferrer">Book a consultation ↗</a></p>}<p className="contact-note">The form sends only when the secure backend is configured. If it is unavailable, use the email link above.</p></div><ContactForm/></div></section></>; }
