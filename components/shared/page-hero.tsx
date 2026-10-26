import Link from "next/link";
import { ArrowLeft } from "lucide-react";
﻿import type { ReactNode } from "react";
import { HeroAside, type HeroAsideVariant } from "@/components/shared/hero-aside";
import { siteStyles } from "@/config/styles";

export function PageHero({ eyebrow, title, children, visual, backLink }: { eyebrow: ReactNode; title: ReactNode; children?: ReactNode; orb?: boolean; visual?: HeroAsideVariant; backLink?: { href: string; label: string } }) {
  return <section className={`inner-hero${visual ? " inner-hero-with-aside" : ""}`}><div className={`${siteStyles.container} inner-hero-grid`}><div className="inner-hero-copy">{backLink && <Link className="page-back-link" href={backLink.href}><ArrowLeft size={17} aria-hidden="true"/>{backLink.label}</Link>}<h1>{title}</h1><p className="page-context">{eyebrow}</p>{children}</div>{visual && <HeroAside variant={visual}/>}</div></section>;
}
