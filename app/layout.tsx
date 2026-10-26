import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { site } from "@/config/site";
import { paletteCss } from "@/config/palette";
import "./globals.css";

const display = Space_Grotesk({ variable: "--font-display", subsets: ["latin"], display: "swap" });
const body = Inter({ variable: "--font-body", subsets: ["latin"], display: "swap" });
export const metadata: Metadata = {
  metadataBase: new URL(site.url), title: site.seo.title, description: site.seo.description,
  alternates: { canonical: site.url },
  openGraph: { title: site.seo.title, description: site.seo.description, url: site.url, siteName: site.name, type: "website", images: [{ url: site.seo.image, width: 1200, height: 630, alt: "Futurvion" }] },
  twitter: { card: "summary_large_image", title: site.seo.title, description: site.seo.description, images: [site.seo.image] },
  robots: { index: !site.url.endsWith(".example"), follow: true },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : undefined,
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-scroll-behavior="smooth" className={`${display.variable} ${body.variable}`}><head><style dangerouslySetInnerHTML={{ __html: paletteCss() }}/></head><body>{children}</body></html>;
}
