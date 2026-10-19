"use client";

import { motion, useReducedMotion, type TargetAndTransition, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "left" | "right" | "scale";
const hidden: Record<Direction, TargetAndTransition> = {
  up: { opacity: 0, y: 48, scale: 0.97, filter: "blur(10px)" },
  left: { opacity: 0, x: -56, filter: "blur(10px)" },
  right: { opacity: 0, x: 56, filter: "blur(10px)" },
  scale: { opacity: 0, scale: 0.88, y: 24, filter: "blur(10px)" },
};
const shown = { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" };

/** Scroll-triggered entrance: content rises out of a soft blur, once, with a springy settle. */
export function Reveal({ children, className = "", delay = 0, from = "up" }: { children: ReactNode; className?: string; delay?: number; from?: Direction }) {
  const reduced = useReducedMotion();
  const variants: Variants = { hidden: hidden[from], shown: { ...shown, transition: { type: "spring", stiffness: 90, damping: 18, mass: 0.9, delay } } };
  return <motion.div className={className} variants={variants} initial={reduced ? "shown" : "hidden"} whileInView="shown" viewport={{ once: true, amount: 0.15, margin: "0px 0px -6% 0px" }}>{children}</motion.div>;
}
