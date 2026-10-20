import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollProgress } from "@/components/scroll-progress";
import { ScrollReveal } from "@/components/reveal";
import { AnalyticsConsent } from "@/components/analytics-consent";
import { JsonLd } from "@/components/json-ld";
import { organizationJsonLd } from "@/lib/seo";
import { site } from "@/config/site";
import { paletteCss } from "@/config/palette";
import "./globals.css";

const display = Space_Grotesk({ variable: "--font-display", subsets: ["latin"], display: "swap" });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], display: "swap" });
const body = Inter({ variable: "--font-body", subsets: ["latin"], display: "swap" });
export const metadata: Metadata = {
  metadataBase: new URL(site.url), title: site.seo.title, description: site.seo.description,
  alternates: { canonical: site.url },
  openGraph: { title: site.seo.title, description: site.seo.description, url: site.url, siteName: site.name, type: "website", images: [{ url: site.seo.image, width: 1200, height: 630, alt: "Futurvion" }] },
  twitter: { card: "summary_large_image", title: site.seo.title, description: site.seo.description, images: [site.seo.image] },
  robots: { index: !site.url.endsWith(".example"), follow: true },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : undefined,
};
export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}><head><style dangerouslySetInnerHTML={{ __html: paletteCss() }}/></head><body><a className="skip-link" href="#main-content">Skip to content</a><JsonLd data={organizationJsonLd()}/><ScrollProgress/><ScrollReveal/><Header/><main id="main-content">{children}</main><Footer/><AnalyticsConsent enabled={Boolean(process.env.DATABASE_URL && process.env.ABUSE_HASH_SECRET)}/></body></html>;
}
