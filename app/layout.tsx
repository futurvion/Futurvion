
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { site } from "@/config/site";
import { paletteCss } from "@/config/palette";
import { websiteJsonLd } from "@/lib/seo";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const siteTitle = "Futurvion | AI, Software & Digital Solutions";

const siteDescription =
  "Futurvion helps businesses grow through AI automation, custom software development, website development, branding, and digital marketing.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),

  title: {
    default: siteTitle,
    template: "%s | Futurvion",
  },

  description: siteDescription,

  applicationName: "Futurvion",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: site.url,
    siteName: "Futurvion",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: site.seo.image,
        width: 1200,
        height: 630,
        alt: "Futurvion - AI, Software & Digital Solutions",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [site.seo.image],
  },

  robots: {
    index: !site.url.endsWith(".example"),
    follow: true,
    googleBot: {
      index: !site.url.endsWith(".example"),
      follow: true,
    },
  },

  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      }
    : undefined,
};

function WebsiteStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(websiteJsonLd()).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${body.variable}`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: paletteCss() }} />
        <WebsiteStructuredData />
      </head>

      <body>{children}</body>
    </html>
  );
}
