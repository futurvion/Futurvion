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

export const site: SiteConfig = {
  name: "Futurvion",
  tagline: "AI, Software & Digital Solutions",
  description:
    "Futurvion helps businesses grow through AI automation, custom software development, website development, branding, and digital marketing.",

  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://futurvion.in").replace(
    /\/+$/,
    "",
  ),

  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "futurvion@gmail.com",

  logo: "/Logo%20with%20Full%20Name.png",

  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL || undefined,

  socials: [
    {
      label: "Instagram",
      url: "https://www.instagram.com/futurvion/",
    },
  ],

  navigation: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Solutions", href: "/solutions" },
    { label: "Process", href: "/#process" },
    { label: "Work", href: "/work" },
    { label: "Blogs", href: "/blog" },
    { label: "Jobs", href: "/jobs" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],

  footerLinks: [
    { label: "Privacy policy", href: "/privacy-policy" },
    { label: "Terms", href: "/terms" },
  ],

  seo: {
    title: "Futurvion | AI, Software & Digital Solutions",
    description:
      "Discover Futurvion's AI automation, software development, website development, branding, and digital marketing services.",
    image: "/og-image.svg",
  },
};
