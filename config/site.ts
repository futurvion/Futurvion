export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  email: string;
  phone?: string;
  address?: string;
  logo: string;
  bookingUrl?: string;
  socials: { label: string; url: string }[];
  navigation: { label: string; href: string }[];
  footerLinks: { label: string; href: string }[];
  seo: { title: string; description: string; image: string };
}

// Match the primary domain configured in Vercel even when the optional env var is unset.
const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.futurvion.in";

export const site: SiteConfig = {
  name: "Futurvion",
  tagline: "Digital Solutions for every business",
  description: "Digital Solutions for every business: branding, websites, custom software, and smarter workflows that fit businesses of every size.",
  url: configuredUrl.replace(/\/$/, ""),
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "hello@futurvion.example",
  logo: "/logo-mark.png",
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL || undefined,
  socials: [],
  navigation: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Solutions", href: "/solutions" },
    { label: "Process", href: "/#process" },
    { label: "Work", href: "/work" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  footerLinks: [
    { label: "Privacy policy", href: "/privacy-policy" },
    { label: "Terms", href: "/terms" },
  ],
  seo: {
    title: "Futurvion | Digital Solutions for every business",
    description: "Futurvion is a digital solutions studio: brand strategy, modern websites, custom software, and automation for businesses of every size and industry.",
    image: "/og-image.svg",
  },
};
