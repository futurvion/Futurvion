import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { services } from "@/data/services";
import { portfolio } from "@/data/portfolio";
export default function sitemap(): MetadataRoute.Sitemap { const paths = ["", "/services", ...services.map(s => `/services/${s.slug}`), "/solutions", "/work", ...portfolio.map(p => `/work/${p.slug}`), "/jobs", "/about", "/contact", "/blog", "/blog/what-are-ai-agents", "/blog/benefits-of-ai-agents", "/blog/ai-agents-vs-chatbots", "/blog/ai-agents-vs-assistants-vs-automation", "/privacy-policy", "/terms"]; return paths.map(path => ({ url: `${site.url}${path}`, changeFrequency: path ? "monthly" : "weekly", priority: path ? .6 : 1 })); }
