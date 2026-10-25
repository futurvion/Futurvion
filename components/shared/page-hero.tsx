import type { ReactNode } from "react";
import { siteStyles } from "@/config/styles";

export function PageHero({ eyebrow, title, children }: { eyebrow: ReactNode; title: ReactNode; children?: ReactNode; orb?: boolean }) {
  return <section className="inner-hero"><div className={`${siteStyles.container} inner-hero-grid`}><div className="inner-hero-copy"><h1>{title}</h1><p className="page-context">{eyebrow}</p>{children}</div></div></section>;
}
