"use client";
import Link from "next/link";
import { useState } from "react";
import { tools } from "./catalog";
export function HeaderSearch() {
    const [query, setQuery] = useState("");
    const shown = tools.filter(t => `${t.name} ${t.category}`.toLowerCase().includes(query.toLowerCase()));
    return <div className="tb-header-search"><label className="tb-visually-hidden" htmlFor="header-tool-search">Search all tools</label><input id="header-tool-search" type="search" autoComplete="off" value={query} placeholder="Search tools..." onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Escape")
        setQuery(""); }}/>{query && <div className="tb-search-results"><p role="status">{shown.length} matching tools</p>{shown.map(t => <Link key={t.slug} href={`/tools/${t.slug}`} onClick={() => setQuery("")}>{t.name}</Link>)}<button onClick={() => setQuery("")}>Close search</button></div>}</div>;
}
