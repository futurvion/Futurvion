import Link from "next/link";
import { site } from "@/config/site";
import { PageHero } from "@/components/shared/page-hero";
import { pageMetadata } from "@/lib/seo";
import { siteStyles } from "@/config/styles";
import { legalLastUpdated } from "@/config/legal";

export const metadata = pageMetadata(
  "Terms and conditions",
  "Terms and conditions for using the Futurvion website, articles, free tools, and job listings.",
  "/terms",
);

export default function TermsPage() {
  return (
    <>
      <PageHero
        orb={false}
        eyebrow="TERMS AND CONDITIONS"
        title={
          <>
            Terms of <em>use.</em>
          </>
        }
      >
        <p>The rules for using this website, its articles, and its free tools.</p>
      </PageHero>
      <section className={`${siteStyles.pageSection} page-section`}>
        <div className={`${siteStyles.container} content-prose`}>
          <p>
            <strong>Last updated:</strong> {legalLastUpdated}
          </p>
          <p>
            These terms apply to your use of the {site.name} website, including
            its articles, free tools, and job listings. By using the website,
            you agree to these terms. If you do not agree, please do not use
            the website.
          </p>

          <h2>Information on this website</h2>
          <p>
            This website provides general information about {site.name}&rsquo;s
            services. It is not an offer of a specific scope, price, timeline,
            or result. Blog articles are general educational content and are
            not professional, legal, or financial advice for your situation.
            We aim to keep content accurate, but it may become outdated.
          </p>

          <h2>Enquiries and projects</h2>
          <p>
            Sending an enquiry does not establish a client relationship.
            Project scope, deliverables, pricing, support, and other
            commitments are agreed in a separate written agreement.
          </p>

          <h2>Illustrative content</h2>
          <p>
            Portfolio concepts on this site are examples of possible work. They
            are not presented as completed client engagements.
          </p>

          <h2>Free tools</h2>
          <p>
            Free tools such as the QR code generator are provided &ldquo;as
            is&rdquo; without charge. Check any output, such as a QR code
            destination, before printing or sharing it. You are responsible
            for the content you create with the tools.
          </p>

          <h2>Job listings</h2>
          <p>
            Job listings are collected from public employer career pages and
            job boards. {site.name} is not the employer and does not take part
            in hiring decisions. Listings may change or close without notice.
            Always confirm details and apply through the employer&rsquo;s own
            page, and never pay a fee to apply for a job.
          </p>

          <h2>Advertising and external links</h2>
          <p>
            Some pages show advertisements served by Google AdSense, and some
            pages link to other websites. We do not control or endorse
            advertisers or third-party websites, and their own terms and
            privacy policies apply. See our{" "}
            <Link href="/privacy-policy">privacy policy</Link> for how
            advertising cookies are used and how to opt out.
          </p>

          <h2>Intellectual property</h2>
          <p>
            Unless stated otherwise, the text, graphics, logos, and design of
            this website belong to {site.name}. You may share links to our
            pages and quote short excerpts with attribution. Do not copy,
            republish, or sell substantial parts of the website without
            written permission.
          </p>

          <h2>Acceptable use</h2>
          <p>
            Do not misuse the website, attempt to disrupt or gain unauthorized
            access to it, scrape it in a way that degrades service, or submit
            unlawful, misleading, or harmful content.
          </p>

          <h2>Disclaimer and limitation of liability</h2>
          <p>
            The website and its tools are provided on an &ldquo;as is&rdquo;
            and &ldquo;as available&rdquo; basis. To the extent permitted by
            law, {site.name} is not liable for any loss arising from your use
            of, or inability to use, the website, its content, its tools, or
            linked third-party services.
          </p>

          <h2>Changes to these terms</h2>
          <p>
            We may update these terms from time to time. The &ldquo;Last
            updated&rdquo; date at the top of this page shows when they were
            last revised. Continued use of the website after a change means
            you accept the updated terms.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms can be sent to{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a> or through our{" "}
            <Link href="/contact">contact page</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
