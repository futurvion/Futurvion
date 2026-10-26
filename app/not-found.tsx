import StudioLayout from "./(studio)/layout";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { siteStyles } from "@/config/styles";
export default function NotFound() { return <StudioLayout><PageHero eyebrow="404 / NOT FOUND" title={<>That page took a<br/><em>different path.</em></>}><p>The link may have moved. Let’s get you back to a useful place.</p><Link className={`${siteStyles.button} button button-primary ${siteStyles.buttonPrimary}`} href="/">Return home <ArrowUpRight size={17}/></Link></PageHero></StudioLayout>; }
