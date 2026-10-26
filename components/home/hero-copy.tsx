"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { siteStyles } from "@/config/styles";

const ease = [0.2, 0.8, 0.2, 1] as const;
const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } };
const word: Variants = { hidden: { y: "110%", opacity: 0 }, show: { y: "0%", opacity: 1, transition: { duration: 0.8, ease } } };
const rise: Variants = { hidden: { y: 22, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.7, ease } } };
const lead = ["Digital", "solution"];
const second = ["for"];
const accent = ["every", "business"];

/** Hero copy: the headline rises word by word, then the rest follows. */
export function HeroCopy() {
  const reduced = useReducedMotion();
  return <motion.div className="hero-copy" variants={container} initial={reduced ? "show" : "hidden"} animate="show">
    <motion.div variants={rise} className={`${siteStyles.eyebrow} eyebrow eyebrow-line`}><span className="pulse-dot" />FUTURVION · DIGITAL STUDIO</motion.div>
    <h1 aria-label="Digital solution for every business">
      <span aria-hidden="true">
        {lead.map(w => <span key={w}><span className="word"><motion.span variants={word}>{w}</motion.span></span>{" "}</span>)}
        <br />
        {second.map(w => <span key={w}><span className="word"><motion.span variants={word}>{w}</motion.span></span>{" "}</span>)}
        <em>{accent.map((w, i) => <span key={w}><span className="word"><motion.span variants={word}>{w}</motion.span></span>{i < accent.length - 1 && " "}</span>)}<span className="period">.</span></em>
      </span>
    </h1>
    <motion.p variants={rise}>From the first brand idea to the software behind it, Futurvion builds websites, tools and everyday processes that fit businesses of every size and every industry.</motion.p>
    <motion.div variants={rise} className="hero-actions">
      <Link className={`${siteStyles.button} button button-primary ${siteStyles.buttonPrimary}`} href="/contact">Let’s build your future <ArrowUpRight size={18} /></Link>
      <Link className={`${siteStyles.button} button button-ghost ${siteStyles.buttonGhost}`} href="/#services">Explore our services <ArrowRight size={18} /></Link>
    </motion.div>
    <motion.div variants={rise} className="hero-scroll"><ArrowDown size={14} /> SCROLL — THE POINTS OF LIGHT BECOME A WAVE</motion.div>
  </motion.div>;
}
