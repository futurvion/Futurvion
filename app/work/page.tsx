import { WorkFilter } from "@/components/work-filter";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Illustrative work concepts", "Explore clearly labeled sample concepts across branding, websites, software, automation, and growth.", "/work");
export default function WorkPage() { return <><section className="inner-hero"><div className="container"><span className="eyebrow">EXPLORATIONS</span><h1>Ideas made <em>visible.</em></h1><p>These illustrative concepts demonstrate ways to approach business challenges. They are not completed client projects.</p></div></section><section className="page-section"><div className="container"><WorkFilter/></div></section></>; }
