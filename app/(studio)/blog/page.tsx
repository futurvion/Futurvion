import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHero } from "@/components/shared/page-hero";
import { pageMetadata } from "@/lib/seo";
import { siteStyles } from "@/config/styles";

const articles = [
  {
    href: "/blog/what-are-ai-agents",
    category: "AI fundamentals",
    artwork: <>AI<br />Agents</>,
    title: "What Are AI Agents? A Practical Business Guide",
    description:
      "Understand how agents interpret goals, use tools, and complete multi-step work—plus practical examples, safeguards, and ways to decide if one fits.",
  },
  {
    href: "/blog/benefits-of-ai-agents",
    category: "Business applications",
    artwork: <>Business<br />Benefits</>,
    title: "Benefits of AI Agents for Businesses",
    description:
      "Explore possible uses in support, sales, marketing, document handling, and operations, alongside costs, risks, and a measured pilot plan.",
  },
  {
    href: "/blog/ai-agents-vs-chatbots",
    category: "Choosing an approach",
    artwork: <>Agents<br />and chatbots</>,
    title: "AI Agents vs AI Chatbots: What Is the Difference?",
    description:
      "Compare task scope, integrations, autonomy, oversight, and maintenance to choose between a chatbot and agent capabilities for a real workflow.",
  },
  {
    href: "/blog/ai-agents-vs-assistants-vs-automation",
    category: "Choosing an approach",
    artwork: <>Assistants<br />and automation</>,
    title: "AI Agents vs AI Assistants vs AI Automation",
    description:
      "Learn what each approach does, how they can work together, and how to select the simplest reliable option for a business task.",
  },
] as const;

export const metadata = pageMetadata(
  "AI and Business Technology Insights",
  "Practical guides for business owners and teams exploring AI agents, automation, and software—from use cases and trade-offs to implementation choices.",
  "/blog",
);

export default function BlogsPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }]} />
      <PageHero
        eyebrow="Practical guides for business decisions"
        title="AI and Business Technology Insights"
      >
        <p>
          For business owners, operators, and teams evaluating new technology,
          these guides explain how AI agents and automation work, where they
          may help, and what to consider before connecting them to real
          workflows. Start with the{" "}
          <Link href="/blog/what-are-ai-agents">AI agents guide</Link>, or compare
          the options in the articles below.
        </p>
        <p>
          If you are assessing a practical implementation, learn about{" "}
          <Link href="/services/ai-automation">AI automation</Link> and{" "}
          <Link href="/services/custom-software">custom software development</Link>
          . The right solution depends on the work to be done, the systems
          involved, and the level of human review required.
        </p>
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
                <span>{article.artwork}</span>
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
