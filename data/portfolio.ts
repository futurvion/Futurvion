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
  { slug: "atlas-commerce", title: "Atlas Commerce", industry: "Retail", category: "Websites", summary: "An illustrative shopping experience built around effortless product discovery.", challenge: "A retail team wants to bring its catalogue online with a clear customer journey.", approach: "Map the key shopping moments and design responsive product and checkout flows.", deliverables: ["Experience map", "Responsive website concept", "Commerce integration plan"], implementation: "Illustrative concept only. No client implementation is claimed.", results: "No verified results are available for this concept." },
  { slug: "kinetic-ops", title: "Kinetic Ops", industry: "Operations", category: "Software", summary: "An illustrative dashboard that brings scattered work into one view.", challenge: "An operations team tracks requests and approvals across disconnected tools.", approach: "Design a shared view of requests, status, ownership, and next actions.", deliverables: ["Workflow map", "Dashboard concept", "Data model outline"], implementation: "Illustrative concept only. No client implementation is claimed.", results: "No verified results are available for this concept." },
  { slug: "fieldwork-flow", title: "Fieldwork Flow", industry: "Local services", category: "Automation", summary: "An illustrative workflow for enquiry intake and scheduling.", challenge: "A local service team manually moves enquiries between inboxes and calendars.", approach: "Define a reviewed handoff from enquiry to appointment and follow-up.", deliverables: ["Process map", "Automation concept", "Exception-handling plan"], implementation: "Illustrative concept only. No client implementation is claimed.", results: "No verified results are available for this concept." },
  { slug: "lumen-growth", title: "Lumen Growth", industry: "Education", category: "Growth", summary: "An illustrative content and landing-page system for course discovery.", challenge: "A training provider needs clearer routes from search interest to course enquiry.", approach: "Align page content, search intent, and meaningful conversion tracking.", deliverables: ["Content architecture", "Landing-page concept", "Measurement plan"], implementation: "Illustrative concept only. No client implementation is claimed.", results: "No verified results are available for this concept." },
];
