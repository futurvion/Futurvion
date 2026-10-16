import type { Metadata } from "next";
import { site } from "@/config/site";
export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = `${site.url}${path}`;
  return { title: `${title} | ${site.name}`, description, alternates: { canonical: url }, openGraph: { title: `${title} | ${site.name}`, description, url, siteName: site.name, type: "website", images: [{ url: site.seo.image, width: 1200, height: 630, alt: "Futurvion" }] }, twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description, images: [site.seo.image] } };
}
