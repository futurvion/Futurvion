import { WorkFilter } from "@/components/shared/work-filter";
import { PageHero } from "@/components/shared/page-hero";
import { pageMetadata } from "@/lib/seo";
import { siteStyles } from "@/config/styles";

export const metadata = pageMetadata("Illustrative work concepts", "Explore clearly labeled sample concepts across branding, websites, software, automation, and growth.", "/work");

export default function WorkPage() {
  return <><PageHero eyebrow="Illustrative concepts" title={<>Thinking made <em>visible.</em></>}><p>These concepts explore how we might approach different business challenges. They are illustrative examples, not completed client projects or verified results.</p></PageHero><section className={`${siteStyles.pageSection} page-section`}><div className={siteStyles.container}><WorkFilter/></div></section></>;
}
