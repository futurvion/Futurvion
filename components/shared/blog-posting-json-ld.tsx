import { site } from "@/config/site";

type BlogPostingJsonLdProps = {
  headline: string;
  description: string;
  path: string;
  articleSection: string;
};

export function BlogPostingJsonLd({
  headline,
  description,
  path,
  articleSection,
}: BlogPostingJsonLdProps) {
  const url = `${site.url}${path}`;
  const organizationId = `${site.url}/#organization`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    description,
    image: `${site.url}${site.seo.image}`,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    articleSection,
    author: {
      "@type": "Organization",
      "@id": organizationId,
      name: site.name,
    },
    publisher: {
      "@type": "Organization",
      "@id": organizationId,
      name: site.name,
    },
    inLanguage: "en",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
    />
  );
}
