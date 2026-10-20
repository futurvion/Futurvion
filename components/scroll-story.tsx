"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useIsPresent, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
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

function StoryPanel({ index, direction, artwork = false, reduced }: { index: number; direction: number; artwork?: boolean; reduced: boolean }) {
  const stage = stages[index];
  const present = useIsPresent();
  return <motion.div className={artwork ? "story-layer" : "story-stage-content"} data-active="true"
    inert={!present} aria-hidden={!present || artwork}
    custom={direction}
    variants={{
      enter: { opacity: 0, y: reduced ? 0 : direction * (artwork ? 18 : 10), scale: artwork && !reduced ? 0.985 : 1 },
      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: reduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] } },
      exit: (scrollDirection: number) => ({ opacity: 0, y: reduced ? 0 : -scrollDirection * 8, scale: artwork && !reduced ? 0.99 : 1, transition: { duration: reduced ? 0 : 0.18, ease: [0.4, 0, 1, 1] } }),
    }}
    initial="enter" animate="visible" exit="exit"
    style={artwork ? { background: tone(index).bg, color: tone(index).fg } : undefined}>
    {artwork ? <>
      <div className="story-layer-top"><span>0{index + 1} / 0{stages.length}</span><span>Connected capability</span></div>
      <StoryArtwork kind={stage.artwork} />
      <div className="story-layer-bottom"><strong>{stage.word}</strong><span>Futurvion</span></div>
    </> : <>
      <h2>{stage.word}<span>.</span></h2>
      <p>{stage.text}</p>
      <Link className="text-link" href={stage.href}>{stage.cta} <ArrowUpRight size={17} /></Link>
    </>}
  </motion.div>;
}

export function ScrollStory() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [direction, setDirection] = useState(1);
  const [headerHeight, setHeaderHeight] = useState(78);
  useEffect(() => {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const observer = new ResizeObserver(() => setHeaderHeight(header.getBoundingClientRect().height));
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  const { scrollYProgress } = useScroll({ target: ref, offset: [`start ${headerHeight}px`, "end end"] });
  useMotionValueEvent(scrollYProgress, "change", v => {
    // A small dead zone prevents trackpad jitter from repeatedly replaying a reveal.
    const current = activeRef.current;
    const next = Math.max(0, Math.min(stages.length - 1, Math.floor(v * stages.length)));
    if (next === current) return;
    const boundary = (next > current ? current + 1 : current) / stages.length;
    if (Math.abs(v - boundary) < 0.008) return;
    setDirection(next > current ? 1 : -1);
    activeRef.current = next;
    setActive(next);
  });

  function jump(index: number) {
    const el = ref.current; if (!el) return;
    const start = window.scrollY + el.getBoundingClientRect().top - headerHeight;
    const scrollable = el.offsetHeight - window.innerHeight + headerHeight;
    window.scrollTo({ top: start + ((index + 0.5) / stages.length) * scrollable, behavior: reduced ? "auto" : "smooth" });
  }

  return <section ref={ref} className="story" style={{ height: `${stages.length * 60 + 100}svh` }} aria-labelledby="story-title">
    <h2 className="story-static-title" id="story-title">Connected capabilities from idea to growth</h2>
    <div className="story-pin">
      <div className="container story-layout">
        <div className="story-copy">
          <span className="eyebrow">Connected capabilities / From idea to growth</span>
          <div className="story-stage">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
            <StoryPanel key={active} index={active} direction={direction} reduced={Boolean(reduced)} />
            </AnimatePresence>
          </div>
          <div className="story-count">
            <span>0{active + 1} / 0{stages.length}</span>
            <div className="story-dots">{stages.map((s, i) => <button key={s.word} type="button" aria-label={`Show ${s.word} stage`} aria-pressed={i === active} onClick={() => jump(i)} />)}</div>
          </div>
        </div>
        <div className="story-stack" aria-hidden="true">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
          <StoryPanel key={active} index={active} direction={direction} artwork reduced={Boolean(reduced)} />
          </AnimatePresence>
        </div>
      </div>
    </div>
    {/* Keep every stage available without scrolling; this list is shown in reduced-motion mode. */}
    <ol className="story-list">{stages.map(s => <li key={s.word}><Link href={s.href}>{s.word}</Link>: {s.text}</li>)}</ol>
  </section>;
}
