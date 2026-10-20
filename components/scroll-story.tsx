"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { palette } from "@/config/palette";
import { StoryArtwork, type StoryArtworkKind } from "./story-artwork";

const stages: { word: string; text: string; href: string; cta: string; artwork: StoryArtworkKind }[] = [
  { word: "Strategy", text: "Every build starts with a clear picture of your goals, customers and constraints, so the next steps are chosen rather than guessed.", href: "/services/technology-consulting", cta: "Technology consulting", artwork: "strategy" },
  { word: "Brand", text: "A recognizable identity gives your message a shape: positioning, visual language and guidelines your whole team can use.", href: "/services/branding", cta: "Branding & identity", artwork: "brand" },
  { word: "Website", text: "A fast, welcoming website turns visitors into enquiries, and is easy to find, easy to read and easy to keep up to date.", href: "/services/web-development", cta: "Websites", artwork: "website" },
  { word: "Software", text: "Custom tools and apps shaped around the way your team really works, not the other way round.", href: "/services/custom-software", cta: "Custom software", artwork: "software" },
  { word: "Automation", text: "Connect your tools and remove repetitive hand-offs so people can spend time on work that matters.", href: "/services/ai-automation", cta: "Automation & AI", artwork: "automation" },
  { word: "Growth", text: "Measure what is working, learn from real use and keep improving, with support that continues after launch where agreed.", href: "/services/digital-marketing", cta: "Digital marketing", artwork: "growth" },
];

const tone = (i: number) => { const [from, to, text] = palette.story[i % palette.story.length]; return { bg: `linear-gradient(135deg,${from},${to})`, fg: text }; };

export function ScrollStory() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", v => setActive(Math.max(0, Math.min(stages.length - 1, Math.floor(v * stages.length)))));

  function jump(index: number) {
    const el = ref.current; if (!el) return;
    const scrollable = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + ((index + 0.5) / stages.length) * scrollable, behavior: reduced ? "auto" : "smooth" });
  }

  const stage = stages[active];
  return <section ref={ref} className="story" style={{ height: `${stages.length * 55 + 45}vh` }} aria-labelledby="story-title">
    <h2 className="story-static-title" id="story-title">Connected capabilities from idea to growth</h2>
    <div className="story-pin">
      <div className="container story-layout">
        <div className="story-copy">
          <span className="eyebrow">Connected capabilities / From idea to growth</span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={stage.word} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -16 }} transition={reduced ? { duration: 0 } : { duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}>
              <h2>{stage.word}<span>.</span></h2>
              <p>{stage.text}</p>
              <Link className="text-link" href={stage.href}>{stage.cta} <ArrowUpRight size={17} /></Link>
            </motion.div>
          </AnimatePresence>
          <div className="story-count">
            <span>0{active + 1} / 0{stages.length}</span>
            <div className="story-dots">{stages.map((s, i) => <button key={s.word} type="button" aria-label={`Show ${s.word} stage`} aria-pressed={i === active} onClick={() => jump(i)} />)}</div>
          </div>
        </div>
        <div className="story-stack" aria-hidden="true">
          {stages.map((s, i) => {
            const depth = active - i;
            const shown = depth >= 0;
            return <motion.div key={s.word} className="story-layer" data-active={depth === 0} style={{ background: tone(i).bg, color: tone(i).fg, zIndex: i }} initial={false}
              animate={{ opacity: shown ? Math.max(0, 1 - depth * 0.1) : 0, y: shown ? -depth * 14 : 70 }}
              transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 110, damping: 24 }}>
              <div className="story-layer-top"><span>0{i + 1} / 0{stages.length}</span><span>Connected capability</span></div>
              <StoryArtwork kind={s.artwork} />
              <div className="story-layer-bottom"><strong>{s.word}</strong><span>Futurvion</span></div>
            </motion.div>;
          })}
        </div>
      </div>
    </div>
    {/* Keep every stage available without scrolling; this list is shown in reduced-motion mode. */}
    <ol className="story-list">{stages.map(s => <li key={s.word}><Link href={s.href}>{s.word}</Link>: {s.text}</li>)}</ol>
  </section>;
}
