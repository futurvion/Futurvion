import "server-only";

const aliases: Record<string, string[]> = {
  JavaScript: ["javascript", "js"], TypeScript: ["typescript", "ts"], React: ["react", "react.js", "reactjs"],
  "Node.js": ["node.js", "nodejs", "node"], PostgreSQL: ["postgresql", "postgres", "psql"],
  Python: ["python"], Java: ["java"], "C++": ["c++"], "C#": ["c#"], Go: ["golang"],
  "Next.js": ["next.js", "nextjs"], Vue: ["vue.js", "vue"], Angular: ["angular"], HTML: ["html", "html5"], CSS: ["css", "css3"],
  SQL: ["sql"], MySQL: ["mysql"], MongoDB: ["mongodb"], Redis: ["redis"], AWS: ["aws", "amazon web services"],
  Azure: ["azure"], "Google Cloud": ["google cloud", "gcp"], Docker: ["docker"], Kubernetes: ["kubernetes", "k8s"],
  Git: ["git"], GraphQL: ["graphql"], REST: ["rest api", "restful"], Linux: ["linux"], Terraform: ["terraform"],
  Figma: ["figma"], "UI design": ["ui design", "user interface design"], "UX design": ["ux design", "user experience design", "user research"],
  "Product management": ["product management"], "Project management": ["project management"], Agile: ["agile", "scrum"],
  "Data analysis": ["data analysis", "data analytics"], "Machine learning": ["machine learning", "ml"],
  Excel: ["excel"], Tableau: ["tableau"], "Power BI": ["power bi"],
  SEO: ["seo", "search engine optimization"], Marketing: ["marketing"], Sales: ["sales"], Salesforce: ["salesforce"],
};
const escaped = (value: string) => value.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
export function normalizeSkills(text: string): string[] {
  return Object.entries(aliases).filter(([, names]) => names.some(name => new RegExp("(?<![a-z0-9])" + escaped(name) + "(?![a-z0-9])", "i").test(text))).map(([name]) => name);
}
export function normalizeRole(title: string): string {
  const value = title.toLowerCase().replace(/front[ -]?end/g, "frontend").replace(/back[ -]?end/g, "backend").replace(/full[ -]?stack/g, "fullstack");
  for (const [role, pattern] of Object.entries({ frontend: /frontend/, backend: /backend/, fullstack: /fullstack/,
    devops: /devops|site reliability|platform engineer/, "data science": /data scientist|machine learning engineer/,
    "data analysis": /data analy|business intelligence/, "product design": /product designer|ux designer|ui designer|user experience/,
    "graphic design": /graphic design|visual design/, "product management": /product manag/,
    "project management": /project manag/, qa: /qa engineer|quality assurance|test engineer/,
    software: /software|web developer|application developer/, marketing: /marketing|seo specialist/, sales: /sales/ })) {
    if (pattern.test(value)) return role;
  }
  return value.replace(/\b(senior|junior|lead|principal|staff|sr|jr)\b/g, "").replace(/\s+/g, " ").trim();
}
export function roleSimilarity(candidate: string, target: string): number {
  const a = normalizeRole(candidate), b = normalizeRole(target);
  let score = a === b ? 100 : [a, b].every(role => ["frontend", "backend", "fullstack", "software"].includes(role)) ? (a === "software" || b === "software" || a === "fullstack" || b === "fullstack" ? 65 : 25) : 0;
  if (/junior|\bjr\b/i.test(candidate) && /senior|lead|principal|staff|\bsr\b/i.test(target)) score = Math.max(0, score - 25);
  return score;
}
export type Employment = { title: string | null; start: string; end: string | null; startMonth: number | null; endMonth: number | null; months: number | null; professional: boolean; skills: string[] };
export type CandidateProfile = {
  currentTitle: string | null; previousTitles: string[]; skills: string[]; totalExperienceMonths: number | null;
  employment: Employment[]; education: string[]; certifications: string[]; projects: string[];
  preferredRoles: string[]; keywords: string[];
};
const monthNames: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
function monthIndex(value: string, now: Date): number | null {
  if (/^(present|current|now)$/i.test(value)) return now.getUTCFullYear() * 12 + now.getUTCMonth();
  const match = value.trim().match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+((?:19|20)\d{2})$/i);
  return match ? Number(match[2]) * 12 + monthNames[match[1].toLowerCase()] : null;
}
const titlePattern = /\b(?:(?:senior|junior|lead|principal|staff|sr\.?|jr\.?)\s+)?(?:software engineer|software developer|front[ -]?end (?:developer|engineer)|back[ -]?end (?:developer|engineer)|full[ -]?stack (?:developer|engineer)|web developer|data analyst|data scientist|machine learning engineer|product designer|ux designer|ui designer|graphic designer|product manager|project manager|marketing manager|marketing specialist|seo specialist|sales manager|devops engineer|site reliability engineer|qa engineer|business analyst)\b/i;
const roleFrom = (line: string) => line.match(titlePattern)?.[0] ?? null;
export function unionExperienceMonths(entries: Employment[]): number | null {
  const intervals = entries.filter(entry => entry.professional && entry.startMonth !== null && entry.endMonth !== null).map(entry => [entry.startMonth!, entry.endMonth!] as const).sort((a, b) => a[0] - b[0]);
  if (!intervals.length) return null;
  let total = 0, start = intervals[0][0], end = intervals[0][1];
  for (const interval of intervals.slice(1)) {
    if (interval[0] <= end + 1) end = Math.max(end, interval[1]);
    else { total += end - start + 1; [start, end] = interval; }
  }
  return total + end - start + 1;
}
export function relevantExperienceMonths(profile: CandidateProfile, title: string): number | null {
  const entries = profile.employment.filter(entry => entry.professional && entry.title && roleSimilarity(entry.title, title) >= 60);
  return entries.some(entry => entry.months === null) ? null : unionExperienceMonths(entries);
}

export function extractCandidateProfile(text: string, now = new Date()): CandidateProfile {
  const lines = text.split(/\n/).map(line => line.trim()).filter(Boolean);
  const titles = lines.map(roleFrom).filter((value): value is string => Boolean(value));
  const employment: Employment[] = [];
  const range = /\b((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?(?:19|20)\d{2})\s*(?:-|–|—|to)\s*((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?(?:19|20)\d{2}|present|current|now)\b/i;
  const matches = lines.flatMap((line, index) => { const dates = line.match(range); return dates ? [{ index, dates }] : []; });
  for (let position = 0; position < matches.length; position++) {
    const { index, dates } = matches[position];
    const startMonth = monthIndex(dates[1], now), endMonth = monthIndex(dates[2], now);
    if (startMonth !== null && endMonth !== null && (startMonth > endMonth || endMonth > now.getUTCFullYear() * 12 + now.getUTCMonth())) continue;
    const heading = lines.slice(Math.max(0, index - 2), index + 1).join(" ");
    const title = roleFrom(lines[index]) ?? roleFrom(lines[index - 1] ?? "") ?? roleFrom(lines[index - 2] ?? "");
    const context = lines.slice(index, matches[position + 1]?.index ?? Math.min(lines.length, index + 8)).join(" ");
    employment.push({ title, start: dates[1], end: /present|current|now/i.test(dates[2]) ? null : dates[2], startMonth, endMonth,
      months: startMonth === null || endMonth === null ? null : endMonth - startMonth + 1,
      professional: Boolean(title) && !/intern|university|college|student|academic|project\s*:/i.test(heading), skills: normalizeSkills(context) });
  }
  employment.sort((a, b) => (b.endMonth ?? -1) - (a.endMonth ?? -1) || (b.startMonth ?? -1) - (a.startMonth ?? -1));
  const pick = (pattern: RegExp) => lines.filter(line => pattern.test(line)).slice(0, 10).map(line => line.slice(0, 180));
  const skills = normalizeSkills(text);
  const professionalTitles = employment.filter(entry => entry.professional && entry.title).map(entry => entry.title!);
  const currentTitle = professionalTitles[0] ?? titles[0] ?? null;
  const previousTitles = [...new Set([...professionalTitles.slice(1), ...titles.filter(title => title !== currentTitle)])].slice(0, 10);
  return { currentTitle, previousTitles, skills, totalExperienceMonths: employment.some(entry => entry.professional && entry.months === null) ? null : unionExperienceMonths(employment), employment,
    education: pick(/\b(degree|university|college|bachelor|master|phd|diploma)\b/i),
    certifications: pick(/\b(certif(?:ied|ication)|credential)\b/i), projects: pick(/\b(project|built|developed|designed)\b/i),
    preferredRoles: pick(/\b(seeking|interested in|looking for)\b/i).map(roleFrom).filter((value): value is string => Boolean(value)),
    keywords: [...new Set([currentTitle, ...previousTitles.slice(0, 2), ...skills].filter((value): value is string => Boolean(value)))].slice(0, 16) };
}
