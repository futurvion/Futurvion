import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { services } from "@/data/services";
import { breadcrumbJsonLd } from "@/lib/seo";

describe("seo", () => {
  it("lists every service in the sitemap with absolute URLs", () => {
    const urls = sitemap().map(e => e.url);
    expect(urls.every(u => u.startsWith("http"))).toBe(true);
    for (const s of services) expect(urls.some(u => u.endsWith(`/services/${s.slug}`))).toBe(true);
  });
  it("keeps the API out of robots and links the sitemap", () => {
    const r = robots();
    expect(r.sitemap).toContain("/sitemap.xml");
    expect(JSON.stringify(r.rules)).toContain("/api/");
  });
  it("numbers breadcrumb items from 1", () => {
    const b = breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "X", path: "/x" }]);
    expect(b.itemListElement.map(i => i.position)).toEqual([1, 2]);
  });
});
