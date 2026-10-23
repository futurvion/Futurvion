import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { JobDescription } from "@/features/jobs/components/job-description";

describe("job description display", () => {
  it("renders headings, paragraphs, and bullets as safe elements", () => {
    const html = renderToStaticMarkup(createElement(JobDescription, { text: "## The role\n\nBuild & improve.\n\n- Lead projects\n- Support teams" }));
    expect(html).toContain("<h3>The role</h3>");
    expect(html).toContain("<p>Build &amp; improve.</p>");
    expect(html).toContain("<ul><li>Lead projects</li><li>Support teams</li></ul>");
  });
  it("escapes untrusted text", () => {
    const html = renderToStaticMarkup(createElement(JobDescription, { text: "<script>alert(1)</script>" }));
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
