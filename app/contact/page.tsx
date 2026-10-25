import { ArrowUpRight } from "lucide-react";
import { ContactForm } from "@/features/contact/components/contact-form";
import { site } from "@/config/site";
import { services } from "@/data/services";
import { PageHero } from "@/components/shared/page-hero";
import { pageMetadata } from "@/lib/seo";
import { siteStyles } from "@/config/styles";

export const metadata = pageMetadata("Contact", "Tell Futurvion about your brand, website, software, or automation project.", "/contact");

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const query = await searchParams;
  const service = typeof query.service === "string" && services.some(item => item.slug === query.service) ? query.service : "";

  return <><PageHero eyebrow="Contact Futurvion" title={<>Let&apos;s talk.</>}><p>Tell us what you are trying to build, improve, or solve. We will use it to start a useful conversation.</p></PageHero>
    <section className={`${siteStyles.pageSection} page-section`}><div className={`${siteStyles.container} contact-layout`}><div className="contact-aside"><h2>Tell us about your business.</h2><p>Whether you have a clear brief or an early idea, share what matters most right now.</p><a href={`mailto:${site.email}`}>{site.email} <ArrowUpRight size={17} aria-hidden="true"/></a>{site.bookingUrl && <p><a href={site.bookingUrl} target="_blank" rel="noopener noreferrer">Book a consultation ↗</a></p>}<p className="contact-note">If the form is unavailable, you can email us directly using the link above.</p></div><ContactForm initialService={service}/></div></section>
  </>;
}
