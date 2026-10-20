import { WorkFilter } from "@/components/work-filter";
import { PageHero } from "@/components/page-hero";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Illustrative work concepts", "Explore clearly labeled sample concepts across branding, websites, software, automation, and growth.", "/work");

export default function WorkPage() {
  return <><PageHero eyebrow="Illustrative concepts" title={<>Thinking made <em>visible.</em></>}><p>These concepts explore how we might approach different business challenges. They are illustrative examples, not completed client projects or verified results.</p></PageHero><section className="page-section"><div className="container"><WorkFilter/></div></section></>;
}
