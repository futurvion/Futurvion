import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
export default function NotFound() { return <PageHero eyebrow="404 / NOT FOUND" title={<>That page took a<br/><em>different path.</em></>}><p>The link may have moved. Let’s get you back to a useful place.</p><Link className="button button-primary" href="/">Return home <ArrowUpRight size={17}/></Link></PageHero>; }
