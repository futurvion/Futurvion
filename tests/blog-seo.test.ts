import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { metadata as blogMetadata } from "@/app/(studio)/blog/page";
import { metadata as agentsMetadata } from "@/app/(studio)/blog/what-are-ai-agents/page";
import { metadata as benefitsMetadata } from "@/app/(studio)/blog/benefits-of-ai-agents/page";
import { metadata as chatbotsMetadata } from "@/app/(studio)/blog/ai-agents-vs-chatbots/page";
import { metadata as comparisonMetadata } from "@/app/(studio)/blog/ai-agents-vs-assistants-vs-automation/page";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { JsonLd } from "@/components/shared/json-ld";
import { site } from "@/config/site";
import robots from "@/app/robots";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

describe("blog metadata", () => {
  const pages = [
    { path: "/blog", metadata: blogMetadata, type: "website" },
    { path: "/blog/what-are-ai-agents", metadata: agentsMetadata, type: "article" },
    { path: "/blog/benefits-of-ai-agents", metadata: benefitsMetadata, type: "article" },
    { path: "/blog/ai-agents-vs-chatbots", metadata: chatbotsMetadata, type: "article" },
    { path: "/blog/ai-agents-vs-assistants-vs-automation", metadata: comparisonMetadata, type: "article" },
  ] as const;

  it("uses unique titles and descriptions with canonical URLs and matching social metadata", () => {
    const titles = pages.map(({ metadata }) => metadata.title);
    const descriptions = pages.map(({ metadata }) => metadata.description);

    expect(new Set(titles).size).toBe(pages.length);
    expect(new Set(descriptions).size).toBe(pages.length);

    for (const { path, metadata, type } of pages) {
      expect(metadata.alternates?.canonical).toBe(`${site.url}${path}`);
      expect(metadata.description).toBeTruthy();
      expect(metadata.openGraph).toMatchObject({
        title: `${metadata.title} | ${site.name}`,
        description: metadata.description,
        url: `${site.url}${path}`,
        type,
        images: [
          {
            url: site.seo.image,
            width: 1200,
            height: 630,
          },
        ],
      });
      expect(metadata.twitter).toMatchObject({
        card: "summary_large_image",
        description: metadata.description,
      });
    }
  });

  it("escapes less-than characters in JSON-LD data", () => {
    const markup = renderToStaticMarkup(
      createElement(JsonLd, {
        data: { headline: "</script><script>content</script>" },
      }),
    );

    expect(markup).toContain("\\u003c/script>");
    expect(markup).not.toContain("</script><script>");
  });

  it("renders crawlable breadcrumb links and matching structured data", () => {
    const markup = renderToStaticMarkup(
      createElement(Breadcrumbs, {
        items: [
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: "Article", path: "/blog/article" },
        ],
      }),
    );

    expect(markup).toContain('aria-label="Breadcrumb"');
    expect(markup).toContain('href="/blog"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('"@type":"BreadcrumbList"');
  });

  it("keeps the blog indexable and publishes the canonical sitemap URL", () => {
    expect(robots()).toMatchObject({
      sitemap: `${site.url}/sitemap.xml`,
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin"],
      },
    });
  });

  it("links one website schema entity to the organization publisher", () => {
    expect(websiteJsonLd()).toMatchObject({
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      publisher: { "@id": `${site.url}/#organization` },
    });
    expect(organizationJsonLd()).toMatchObject({
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
    });
  });
});
