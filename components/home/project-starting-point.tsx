"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/data/services";
import { siteStyles } from "@/config/styles";

const goals = [
  { label: "Clarify my brand", index: 0, copy: "Build a recognizable identity and a clearer way to communicate what makes your business valuable." },
  { label: "Improve my website", index: 1, copy: "Give your customers a clear, useful digital experience, from their first visit to their next enquiry." },
  { label: "Connect my operations", index: 2, copy: "Explore software and connected tools built around the way your team actually works." },
];

export function ProjectStartingPoint() {
  const [selected, setSelected] = useState(0);
  const goal = goals[selected];
  const service = services[goal.index];
  return <section className={`starting-point ${siteStyles.section}`} aria-labelledby="starting-title"><div className={`${siteStyles.container} starting-grid`}><div><h2 id="starting-title">Find your<br/>starting point.</h2><p>What would make the biggest difference to your business right now?</p><div className="goal-options" role="group" aria-label="Your business priority">{goals.map((item, index) => <button type="button" key={item.label} aria-pressed={selected === index} onClick={() => setSelected(index)}>{item.label}<ArrowUpRight size={18} aria-hidden="true"/></button>)}</div></div><div className="goal-result" aria-live="polite" aria-atomic="true"><h3>{service.title}</h3><p>{goal.copy}</p><Link className={`${siteStyles.button} button button-light ${siteStyles.buttonLight}`} href={`/contact?service=${service.slug}`}>Discuss this direction <ArrowUpRight size={18} aria-hidden="true"/></Link><Link className="goal-detail" href={`/services/${service.slug}`}>See what this can include</Link></div></div></section>;
}
