import type { Metadata } from "next";
import { site } from "@/config/site";
export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = `${site.url}${path}`;
  return { title, description, alternates: { canonical: url }, openGraph: { title: `${title} | ${site.name}`, description, url, siteName: site.name, type: "website", images: [{ url: site.seo.image, width: 1200, height: 630, alt: "Futurvion" }] }, twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description, images: [site.seo.image] } };
}

export function organizationJsonLd() {
  return { "@context": "https://schema.org", "@graph": [
    { "@type": "Organization", "@id": `${site.url}/#organization`, name: site.name, url: site.url, logo: `${site.url}${site.logo}`, email: site.email, description: site.description, ...(site.socials.length ? { sameAs: site.socials.map(s => s.url) } : {}) },
    { "@type": "WebSite", "@id": `${site.url}/#website`, name: site.name, url: site.url, publisher: { "@id": `${site.url}/#organization` } },
  ] };
}
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: `${site.url}${item.path}` })) };
}
export function serviceJsonLd(name: string, description: string, path: string) {
  return { "@context": "https://schema.org", "@type": "Service", name, description, url: `${site.url}${path}`, provider: { "@id": `${site.url}/#organization` } };
}
