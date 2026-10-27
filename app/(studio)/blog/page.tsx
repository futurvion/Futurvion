import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { pageMetadata } from "@/lib/seo";
import { siteStyles } from "@/config/styles";

const articles = [
  {
    href: "/blog/what-are-ai-agents",
    category: "AI and automation",
    artwork: <>AI<br />Agents</>,
    title: "What Are AI Agents? Examples, Benefits and Use Cases in 2026",
    description:
      "Learn how AI agents work, explore real-world examples, and understand their benefits, risks, and business use cases.",
  },
  {
    href: "/blog/benefits-of-ai-agents",
    category: "AI and business",
    artwork: <>Business<br />Benefits</>,
    title: "Benefits of AI Agents for Businesses",
    description:
      "Explore where AI agents can help with repetitive work, productivity, decisions, customer service, and connected workflows.",
  },
  {
    href: "/blog/ai-agents-vs-chatbots",
    category: "AI explained",
    artwork: <>Agents<br />and chatbots</>,
    title: "AI Agents vs AI Chatbots: What Is the Difference?",
    description:
      "Compare chatbots and AI agents, understand how their capabilities can overlap, and learn when each approach may fit.",
  },
  {
    href: "/blog/ai-agents-vs-assistants-vs-automation",
    category: "AI explained",
    artwork: <>Assistants<br />and automation</>,
    artworkSize: "compact",
    title: "AI Agents vs AI Assistants vs AI Automation",
    description:
      "Understand how assistants, agents, and traditional automation differ—and how they can work together in a business process.",
  },
] as const;

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
          {articles.map(article => (
            <Link
              className="blog-card"
              href={article.href}
              key={article.href}
              aria-label={`Read ${article.title}`}
            >
              <div className="blog-card-art" aria-hidden="true">
                <span
                  className={
                    "artworkSize" in article
                      ? `blog-card-artwork-${article.artworkSize}`
                      : undefined
                  }
                >
                  {article.artwork}
                </span>
              </div>
              <div className="blog-card-copy">
                <p className="blog-card-category">{article.category}</p>
                <h2>{article.title}</h2>
                <p>{article.description}</p>
                <span className="blog-card-link">
                  Read article <ArrowUpRight size={18} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
