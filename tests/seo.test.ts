import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import sitemap from "@/app/sitemap";

describe("SEO sitemap", () => {
  it("uses the canonical host for every public URL", () => {
    const urls = sitemap().map(({ url }) => url);

    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.every(url => new URL(url).origin === site.url)).toBe(true);
    expect(new URL(site.url).hostname.startsWith("www.")).toBe(false);
  });

  it("includes the blog index and every published article", () => {
    const urls = sitemap().map(({ url }) => url);

    expect(urls).toEqual(expect.arrayContaining([
      `${site.url}/blog`,
      `${site.url}/blog/what-are-ai-agents`,
      `${site.url}/blog/benefits-of-ai-agents`,
      `${site.url}/blog/ai-agents-vs-chatbots`,
      `${site.url}/blog/ai-agents-vs-assistants-vs-automation`,
    ]));
  });
});
