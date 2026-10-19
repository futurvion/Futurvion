import { WorkFilter } from "@/components/work-filter";
import { PageHero } from "@/components/page-hero";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Illustrative work concepts", "Explore clearly labeled sample concepts across branding, websites, software, automation, and growth.", "/work");
export default function WorkPage() { return <><PageHero eyebrow="EXPLORATIONS" title={<>Ideas made <em>visible.</em></>}><p>These illustrative concepts demonstrate ways to approach business challenges. They are not completed client projects.</p></PageHero><section className="page-section"><div className="container"><WorkFilter/></div></section></>; }
