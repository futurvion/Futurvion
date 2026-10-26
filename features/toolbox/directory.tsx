"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Braces, Binary, Clock, Regex, FileJson, KeyRound } from "lucide-react";
import { tools } from "./catalog";
const icons = [Braces, KeyRound, Clock, Regex, Binary, FileJson];
export function Directory() {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All tools");
    const categories = ["All tools", ...new Set(tools.map(t => t.category))];
    const shown = tools.filter(t => (category === "All tools" || t.category === category) && `${t.name} ${t.description} ${t.category}`.toLowerCase().includes(query.toLowerCase()));
    return <><div className="tb-intro"><p className="tb-kicker">A little less busywork.</p><h1>Free Developer Tools. Fast, Simple, Private.</h1><p>Format, decode, validate, and debug everyday developer data directly in your browser. No account, payment, or API key required.</p></div><section id="directory" aria-label="Find a tool"><label htmlFor="tool-search">Find your next tool</label><input id="tool-search" type="search" placeholder="Search JSON, Base64, regex..." value={query} onChange={e => setQuery(e.target.value)}/><div className="tb-tabs" role="group" aria-label="Tool categories">{categories.map(c => <button key={c} aria-pressed={c === category} onClick={() => setCategory(c)}>{c}</button>)}</div><p role="status" className="tb-muted">{shown.length} tools - Free - No Login Required</p><div className="tb-directory">{shown.map(t => { const Icon = icons[tools.indexOf(t)]; return <Link className="tb-tool-card" href={`/tools/${t.slug}`} key={t.slug}><div className="tb-card-top"><Icon size={19} aria-hidden="true"/><span>{t.category}</span><ArrowUpRight size={18} aria-hidden="true"/></div><h2>{t.name}</h2><p>{t.description}</p><span className="tb-open">Open tool</span></Link>; })}</div>{!shown.length && <p>No tools match. Try another search or choose All tools.</p>}</section><section className="tb-privacy-note"><h2>Your data is your working material.</h2><p>All six tools process content in this browser. We do not save tool inputs, outputs, or usage history. Refreshing or leaving a tool clears its workspace. Ordinary hosting requests can still include network metadata.</p><Link href="/privacy">Read the privacy details</Link></section></>;
}
