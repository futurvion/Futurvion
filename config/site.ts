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

const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://futurvion.example";

export const site: SiteConfig = {
  name: "Futurvion",
  tagline: "One partner for your brand, technology, and business growth.",
  description: "Branding, digital experiences, custom software, and smarter workflows for ambitious businesses.",
  url: configuredUrl.replace(/\/$/, ""),
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "hello@futurvion.example",
  logo: "/logo.svg",
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
    title: "Futurvion | Brand, technology & business growth",
    description: "Futurvion brings brand strategy, modern websites, custom software, and automation together to help growing businesses move forward.",
    image: "/og-image.svg",
  },
};
