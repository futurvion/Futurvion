"use client";

import Link from "next/link";
import { ArrowUpRight, QrCode, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { availableTools } from "@/config/tools";
import { trackEvent } from "@/lib/analytics";

const categories = ["All", ...new Set(availableTools.map((tool) => tool.category))];

export function ToolsDirectory() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return availableTools.filter((tool) => {
      const matchesCategory = category === "All" || tool.category === category;
      const searchableText = `${tool.name} ${tool.description} ${tool.tags.join(" ")}`.toLowerCase();
      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  useEffect(() => {
    trackEvent("tools_page_view", { tool_id: "tools-hub" });
  }, []);

  return (
    <div className="tools-page-shell">
      <section className="tools-hero" aria-labelledby="tools-title">
        <div className="tools-hero-copy">
          <span className="eyebrow">Futurvion tools</span>
          <h1 id="tools-title">Powerful Tools. Simple Solutions.</h1>
          <p>
            Explore free, easy-to-use online tools designed to make your everyday tasks
            faster and simpler.
          </p>
        </div>
        <div className="tools-hero-visual" aria-hidden="true">
          <div className="tools-glow" />
          <QrCode size={90} />
        </div>
      </section>

      <section className="tools-search-panel" aria-labelledby="tool-search-heading">
        <div className="tools-search-label-row">
          <h2 id="tool-search-heading">Find a tool</h2>
        </div>

        <label className="tools-search-field" htmlFor="tool-search">
          <Search size={18} aria-hidden="true" />
          <input
            id="tool-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tools by name or description"
            aria-label="Search tools by name or description"
          />
        </label>

        <div className="tool-category-filters" role="tablist" aria-label="Tool categories">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={item === category ? "tool-category active" : "tool-category"}
              aria-pressed={item === category}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="tools-grid-section" aria-live="polite">
        <div className="tools-grid-header">
          <p>
            {filteredTools.length} tool{filteredTools.length === 1 ? "" : "s"} available
          </p>
        </div>

        {filteredTools.length > 0 ? (
          <div className="tool-grid">
            {filteredTools.map((tool) => (
              <Link className="tool-card" href={tool.route} key={tool.id} onClick={() => trackEvent("tool_card_click", { tool_id: tool.id })}>
                <div className="tool-card-header">
                  <span className="tool-icon" aria-hidden="true">
                    <QrCode size={22} />
                  </span>
                  <span className="tool-badge">{tool.category}</span>
                  <span className="tool-free-badge">Free</span>
                </div>

                <div className="tool-card-body">
                  <h3>{tool.name}</h3>
                  <p>{tool.description}</p>
                </div>

                <div className="tool-card-footer">
                  <span>Use Tool</span>
                  <ArrowUpRight size={18} aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="tools-empty-state" role="status">
            <h3>No tools match your search.</h3>
            <p>Try a broader keyword or switch back to the full directory.</p>
          </div>
        )}
      </section>
    </div>
  );
}
