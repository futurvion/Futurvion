"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { palette } from "@/config/palette";

const stages = [
  { word: "Strategy", text: "Every build starts with a clear picture of your goals, customers and constraints, so the next steps are chosen rather than guessed.", href: "/services/technology-consulting", cta: "Technology consulting" },
  { word: "Brand", text: "A recognizable identity gives your message a shape: positioning, visual language and guidelines your whole team can use.", href: "/services/branding", cta: "Branding & identity" },
  { word: "Website", text: "A fast, welcoming website turns visitors into enquiries, and is easy to find, easy to read and easy to keep up to date.", href: "/services/web-development", cta: "Websites" },
  { word: "Software", text: "Custom tools and apps shaped around the way your team really works, not the other way round.", href: "/services/custom-software", cta: "Custom software" },
  { word: "Automation", text: "Connect your tools and remove repetitive hand-offs so people can spend time on work that matters.", href: "/services/ai-automation", cta: "Automation & AI" },
  { word: "Growth", text: "Measure what is working, learn from real use and keep improving, with support that continues after launch where agreed.", href: "/services/digital-marketing", cta: "Digital marketing" },
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
  return <section ref={ref} className="story" style={{ height: `${stages.length * 75 + 25}vh` }} aria-labelledby="story-title">
    <div className="story-pin">
      <div className="container story-layout">
        <div className="story-copy">
          <span className="eyebrow" id="story-title">FROM IDEA TO GROWTH</span>
          <AnimatePresence mode="wait">
            <motion.div key={stage.word} initial={reduced ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -24 }} transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }} aria-hidden="true">
              <h2>{stage.word}<span>.</span></h2>
              <p>{stage.text}</p>
              <Link className="text-link" href={stage.href} tabIndex={-1}>{stage.cta} <ArrowUpRight size={17} /></Link>
            </motion.div>
          </AnimatePresence>
          <div className="story-count" aria-hidden="true">
            <span>0{active + 1} / 0{stages.length}</span>
            <div className="story-dots">{stages.map((s, i) => <button key={s.word} type="button" tabIndex={-1} aria-current={i === active} onClick={() => jump(i)} />)}</div>
          </div>
        </div>
        <div className="story-stack" aria-hidden="true">
          {stages.map((s, i) => {
            const depth = active - i;
            const shown = depth >= 0;
            return <motion.div key={s.word} className="story-layer" data-back={depth > 0} style={{ background: tone(i).bg, color: tone(i).fg, zIndex: i }} initial={false}
              animate={{ opacity: shown ? Math.max(0, 1 - depth * 0.12) : 0, y: shown ? -depth * 34 : 90, scale: shown ? 1 - depth * 0.05 : 0.92, rotateX: shown ? 8 : 0 }}
              transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 20 }}>
              <span>0{i + 1}</span><strong>{s.word}</strong>
            </motion.div>;
          })}
        </div>
      </div>
    </div>
    {/* The visual story above is decorative; this list keeps the full content available to assistive tech and non-visual readers. */}
    <ol className="story-list">{stages.map(s => <li key={s.word}><Link href={s.href}>{s.word}</Link>: {s.text}</li>)}</ol>
  </section>;
}
