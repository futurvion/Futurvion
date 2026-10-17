"use client";

import { useState } from "react";

const nodes = [
  { title: "Strategy", text: "Start with a clear view of your business goals and priorities." },
  { title: "Brand", text: "Give your message and visual identity a recognizable shape." },
  { title: "Website", text: "Create a useful digital front door for your audience." },
  { title: "Software", text: "Build tools around the work your team actually does." },
  { title: "Automation", text: "Connect steps and reduce repetitive manual work." },
  { title: "Analytics", text: "Learn what is working with meaningful, privacy-aware measurement." },
  { title: "Growth", text: "Use what you learn to decide what to improve next." },
];
export function Ecosystem() {
  const [active, setActive] = useState(0);
  return <div className="ecosystem"><div className="ecosystem-graphic"><svg viewBox="0 0 700 420" role="presentation" preserveAspectRatio="none"><path d="M 98 210 C 230 35, 460 40, 610 210 S 460 390, 98 210"/><path d="M 98 210 C 270 360, 450 310, 610 210"/><path d="M 180 80 L 520 340 M 180 340 L 520 80"/></svg><div className="ecosystem-center">F<span>·</span></div>{nodes.map((node, i) => <button type="button" key={node.title} className={`eco-node eco-node-${i} ${active === i ? "selected" : ""}`} onClick={() => setActive(i)} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} aria-pressed={active === i}><span className="eco-node-dot"/>{node.title}</button>)}</div><div className="ecosystem-caption" aria-live="polite"><span className="eyebrow">0{active + 1} / 07 · Connected capability</span><h3>{nodes[active].title}</h3><p>{nodes[active].text}</p></div></div>;
}
