export interface ProjectConcept {
  slug: string;
  title: string;
  industry: string;
  category: "Branding" | "Websites" | "Software" | "Automation" | "Growth";
  summary: string;
  challenge: string;
  approach: string;
  deliverables: string[];
  implementation: string;
  results: string;
}

// Illustrative concepts only. Replace with permission-backed client work before publication as case studies.
export const portfolio: ProjectConcept[] = [
  { slug: "northline-studio", title: "Northline Studio", industry: "Professional services", category: "Branding", summary: "An illustrative identity system for an independent design advisory.", challenge: "A growing consultancy needs to communicate a focused point of view.", approach: "Explore positioning, visual language, and a practical system for everyday communications.", deliverables: ["Positioning direction", "Identity concept", "Brand application examples"], implementation: "Illustrative concept only. No client implementation is claimed.", results: "No verified results are available for this concept." },
  { slug: "atlas-commerce", title: "Atlas Commerce", industry: "Retail", category: "Websites", summary: "An illustrative shopping experience built around effortless product discovery.", challenge: "A retail team wants to bring its catalogue online with a clear customer journey.", approach: "Map the key shopping moments and design responsive product and checkout flows.", deliverables: ["Experience map", "Responsive website concept", "Online-shop setup plan"], implementation: "Illustrative concept only. No client implementation is claimed.", results: "No verified results are available for this concept." },
  { slug: "kinetic-ops", title: "Kinetic Ops", industry: "Operations", category: "Software", summary: "An illustrative tool that brings scattered work into one clear view.", challenge: "An operations team tracks requests and approvals across disconnected tools.", approach: "Design one shared view of requests, progress, who owns what, and what happens next.", deliverables: ["Work-flow map", "Team dashboard concept", "Outline of the information to track"], implementation: "Illustrative concept only. No client implementation is claimed.", results: "No verified results are available for this concept." },
  { slug: "fieldwork-flow", title: "Fieldwork Flow", industry: "Local services", category: "Automation", summary: "An illustrative workflow for enquiry intake and scheduling.", challenge: "A local service team manually moves enquiries between inboxes and calendars.", approach: "Define a reviewed handoff from enquiry to appointment and follow-up.", deliverables: ["Process map", "Automation concept", "Plan for when things go off-script"], implementation: "Illustrative concept only. No client implementation is claimed.", results: "No verified results are available for this concept." },
  { slug: "lumen-growth", title: "Lumen Growth", industry: "Education", category: "Growth", summary: "An illustrative set of pages and content that help people find and choose a course.", challenge: "A training provider needs clearer routes from search interest to course enquiry.", approach: "Match page content to what people search for, and track the enquiries that matter.", deliverables: ["Content structure", "Course page concept", "Plan for measuring results"], implementation: "Illustrative concept only. No client implementation is claimed.", results: "No verified results are available for this concept." },
];

// Owned product links are distinct from illustrative client concepts.
export const studioProducts = [{
 title: "Futurvion Developer Tools", category: "Software", url: "https://utility.futurvion.in",
 summary: "Free, privacy-focused online utilities for developers. Format JSON, decode JWTs, build cron expressions, test regex patterns, and more."
}] as const;
