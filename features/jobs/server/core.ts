import { createHash } from "node:crypto";
import { decodeHTML } from "entities";
import { parseDocument } from "htmlparser2";
import { z } from "zod";

export const identifier = z.string().regex(/^[a-z0-9][a-z0-9_-]{0,62}$/);
export const providerConfig = z.discriminatedUnion("type", [
  z.object({ type: z.literal("remotive") }),
  z.object({ type: z.literal("greenhouse"), board: identifier }),
  z.object({ type: z.literal("lever"), site: identifier, region: z.enum(["global", "eu"]).default("global") }),
]);
export type ProviderConfig = z.infer<typeof providerConfig>;
export const scheduleSchema = z.object({
  enabled: z.boolean(), frequencyMinutes: z.number().int().min(60).max(10080),
  timezone: z.string().min(1).max(80).refine(value => { try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; } catch { return false; } }),
  batchSize: z.number().int().min(1).max(500), maxConcurrency: z.number().int().min(1).max(4),
  retryLimit: z.number().int().min(0).max(3), retryDelaySeconds: z.number().int().min(1).max(60),
  expireAfterDays: z.number().int().min(1).max(90),
});
export const listQuery = z.object({
  q: z.string().trim().max(120).optional(), company: z.string().trim().max(100).optional(),
  location: z.string().trim().max(100).optional(), workMode: z.enum(["remote", "hybrid", "onsite"]).optional(),
  employmentType: z.string().trim().max(60).optional(), category: z.string().trim().max(80).optional(),
  experienceLevel: z.string().trim().max(60).optional(), source: z.enum(["remotive", "greenhouse", "lever"]).optional(),
  postedWithin: z.coerce.number().int().min(1).max(365).optional(),
  salaryMin: z.coerce.number().int().min(0).max(100000000).optional(),
  salaryMax: z.coerce.number().int().min(0).max(100000000).optional(),
  salaryCurrency: z.enum(["USD", "EUR", "GBP", "INR", "CAD", "AUD"]).optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
}).refine(value => (value.salaryMin === undefined && value.salaryMax === undefined) || Boolean(value.salaryCurrency), { message: "Choose a currency for salary search" })
  .refine(value => value.salaryMin === undefined || value.salaryMax === undefined || value.salaryMin <= value.salaryMax, { message: "Minimum salary must not exceed maximum salary" });
export type NormalizedJob = {
  externalJobId: string; title: string; companyName: string; companyLogoUrl?: string;
  location?: string; countryCode?: string; workMode: string; employmentType?: string;
  experienceLevel?: string; category?: string; descriptionText?: string;
  requirements?: string; responsibilities?: string; benefits?: string;
  salaryMin?: number; salaryMax?: number; salaryCurrency?: string; salaryPeriod?: string;
  applicationUrl: string; publishedAt?: Date;
};
export function safeUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : undefined; } catch { return; }
}
export function plainText(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  return value.replace(/<[^>]*>/g, " ").replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, " ").replace(/\s+/g, " ").trim().slice(0, 30000) || undefined;
}
export function jobDescriptionText(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  const html = /&lt;\s*\/?[a-z]/i.test(value) ? decodeHTML(value) : value;
  if (!/<\/?[a-z][\s>]/i.test(html)) {
    return decodeHTML(html).replace(/\r\n?/g, "\n").replace(/\u00a0/g, " ").replace(/[\t ]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, 30000) || undefined;
  }

  type Node = ReturnType<typeof parseDocument>["children"][number];
  const blocks: string[] = [];
  const blockTags = new Set(["p", "div", "section", "article", "blockquote", "ul", "ol", "li", "table", "tr", "h1", "h2", "h3", "h4", "h5", "h6"]);
  const normalize = (text: string) => text.replace(/\u00a0/g, " ").replace(/\s+/g, " ").replace(/\s+([,.!?;:])/g, "$1").trim();
  function textOf(nodes: Node[]): string {
    return nodes.map(node => {
      if (node.type === "text") return node.data;
      if (node.type === "script" || node.type === "style") return "";
      if ("name" in node && node.name === "span" && "attribs" in node && /color:\s*rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)/i.test(node.attribs.style ?? "") && textOf(node.children).trim() === ".") return "";
      if ("name" in node && node.name === "br") return " ";
      return "children" in node ? textOf(node.children) : "";
    }).join("");
  }
  function visit(node: Node) {
    if (node.type === "script" || node.type === "style") return;
    if (node.type === "text") {
      const text = normalize(node.data);
      if (text) blocks.push(text);
      return;
    }
    if (!("children" in node)) return;
    const name = "name" in node ? node.name : "";
    if (["script", "style", "noscript", "iframe", "svg"].includes(name)) return;
    if (name === "p" || name === "li" || /^h[1-6]$/.test(name)) {
      const text = normalize(textOf(node.children));
      if (!text) return;
      const meaningful = node.children.filter(child => child.type !== "text" || child.data.trim());
      const strongOnly = name === "p" && meaningful.length === 1 && "name" in meaningful[0] && ["strong", "b", "em", "i"].includes(meaningful[0].name);
      blocks.push(name === "li" ? `- ${text}` : strongOnly || /^h[1-6]$/.test(name) ? `## ${text}` : text);
      return;
    }
    if (!node.children.some(child => "name" in child && blockTags.has(child.name))) {
      const text = normalize(textOf(node.children));
      if (text) blocks.push(text);
      return;
    }
    node.children.forEach(visit);
  }
  parseDocument(html, { decodeEntities: true }).children.forEach(visit);
  const output = blocks.reduce((text, block, index) => text + (index ? block.startsWith("- ") && blocks[index - 1].startsWith("- ") ? "\n" : "\n\n" : "") + block, "");
  return output.slice(0, 30000) || undefined;
}
export function date(value: unknown): Date | undefined {
  if (typeof value !== "string" && typeof value !== "number") return;
  const normalized = typeof value === "string" && /^\d{12,13}$/.test(value) ? Number(value) : value;
  const result = new Date(normalized); return Number.isNaN(result.getTime()) ? undefined : result;
}
export function slugFor(job: Pick<NormalizedJob, "title" | "companyName" | "externalJobId">, source: string) {
  const base = `${job.title}-${job.companyName}`.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
  return `${base || "job"}-${createHash("sha256").update(`${source}:${job.externalJobId}`).digest("hex").slice(0, 12)}`;
}
export function contentHash(job: NormalizedJob) { return createHash("sha256").update(JSON.stringify(job)).digest("hex"); }
export function sourceLabel(provider: { name: string; providerType: string }) {
  return provider.providerType === "remotive" ? provider.name : `${provider.name} via ${provider.providerType === "greenhouse" ? "Greenhouse" : "Lever"}`;
}
