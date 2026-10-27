import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { pageMetadata } from "@/lib/seo";
import { siteStyles } from "@/config/styles";

export const metadata = pageMetadata(
  "Blogs",
  "Articles and practical insights on AI, software, and digital solutions from Futurvion.",
  "/blog",
);

export default function BlogsPage() {
  return (
    <>
      <PageHero
        eyebrow="Ideas and insights"
        title="Blogs"
      >
        <p>Explore practical perspectives on AI, software, and digital solutions.</p>
      </PageHero>
      <section className={`${siteStyles.pageSection} page-section`}>
        <div className={`${siteStyles.container} blog-list`}>
          <Link
            className="blog-card"
            href="/blog/what-are-ai-agents"
            aria-label="Read What Are AI Agents? Examples, Benefits and Use Cases in 2026"
          >
            <div className="blog-card-art" aria-hidden="true">
              <span>AI<br />Agents</span>
            </div>
            <div className="blog-card-copy">
              <p className="blog-card-category">AI and automation</p>
              <h2>What Are AI Agents? Examples, Benefits and Use Cases in 2026</h2>
              <p>
                Learn how AI agents work, explore real-world examples, and
                understand their benefits, risks, and business use cases.
              </p>
              <span className="blog-card-link">
                Read article <ArrowUpRight size={18} aria-hidden="true" />
              </span>
            </div>
          </Link>
        </div>
      </section>
    </>
  );
}
