import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { services } from "@/data/services";
import { portfolio } from "@/data/portfolio";
export default function sitemap(): MetadataRoute.Sitemap { const paths = ["", "/services", ...services.map(s => `/services/${s.slug}`), "/solutions", "/work", ...portfolio.map(p => `/work/${p.slug}`), "/about", "/contact", "/privacy-policy", "/terms"]; return paths.map(path => ({ url: `${site.url}${path}`, changeFrequency: path ? "monthly" : "weekly", priority: path ? .6 : 1 })); }
