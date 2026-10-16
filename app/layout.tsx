import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AnalyticsConsent } from "@/components/analytics-consent";
import { site } from "@/config/site";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
export const metadata: Metadata = {
  metadataBase: new URL(site.url), title: site.seo.title, description: site.seo.description,
  alternates: { canonical: site.url },
  openGraph: { title: site.seo.title, description: site.seo.description, url: site.url, siteName: site.name, type: "website", images: [{ url: site.seo.image, width: 1200, height: 630, alt: "Futurvion" }] },
  twitter: { card: "summary_large_image", title: site.seo.title, description: site.seo.description, images: [site.seo.image] },
  robots: { index: !site.url.endsWith(".example"), follow: true },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : undefined,
};
export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en" className={geist.variable}><body><a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:p-3 focus:text-black" href="#main-content">Skip to content</a><Header/><main id="main-content">{children}</main><Footer/><AnalyticsConsent enabled={Boolean(process.env.DATABASE_URL && process.env.ABUSE_HASH_SECRET)}/></body></html>;
}
