"use client";

import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import { useRef } from "react";

/** A ticker that drifts on its own, then speeds up, skews and reverses with your scroll speed and direction. */
export function ScrollMarquee({ items }: { items: string[] }) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const track = useRef<HTMLDivElement>(null);
  const direction = useRef(1);
  const { scrollY } = useScroll();
  const smooth = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(smooth, [-2000, 0, 2000], [-5, 0, 5], { clamp: false });
  const skew = useTransform(smooth, [-2000, 0, 2000], [7, 0, -7]);

  useAnimationFrame((_, delta) => {
    if (reduced || !track.current) return;
    const b = boost.get();
    if (b > 0.05) direction.current = 1; else if (b < -0.05) direction.current = -1;
    const half = track.current.scrollWidth / 2;
    let next = x.get() - direction.current * (0.5 + Math.abs(b)) * delta * 0.07;
    if (next <= -half) next += half; else if (next > 0) next -= half;
    x.set(next);
  });

  return <div className="marquee" aria-hidden="true">
    <motion.div ref={track} className="marquee-track" style={{ x, skewX: skew }}>{[0, 1].map(n => <ul key={n}>{items.map(t => <li key={t}>{t}</li>)}</ul>)}</motion.div>
  </div>;
}
