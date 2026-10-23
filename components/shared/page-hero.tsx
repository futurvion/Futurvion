import type { ReactNode } from "react";
import { siteStyles } from "@/config/styles";

export function PageHero({ eyebrow, title, children }: { eyebrow: ReactNode; title: ReactNode; children?: ReactNode; orb?: boolean }) {
  return <section className="inner-hero"><div className={`${siteStyles.container} inner-hero-grid`}><div className="inner-hero-copy"><span className={`${siteStyles.eyebrow} eyebrow`}>{eyebrow}</span><h1>{title}</h1>{children}</div><span className="inner-hero-signature" aria-hidden="true">F / FUTURVION</span></div></section>;
}
