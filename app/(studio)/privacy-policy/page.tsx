import { site } from "@/config/site";
import { PageHero } from "@/components/shared/page-hero";
import { pageMetadata } from "@/lib/seo";
import { siteStyles } from "@/config/styles";
import { AnalyticsPreferencesButton } from "@/features/analytics/components/analytics-consent";

export const metadata = pageMetadata(
  "Privacy policy",
  "How Futurvion handles contact enquiries, consent-based analytics, and advertising.",
  "/privacy-policy",
);

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        orb={false}
        eyebrow="PRIVACY"
        title={
          <>
            Privacy <em>policy.</em>
          </>
        }
      >
        <p>What this website collects and how it is used.</p>
      </PageHero>
      <section className={`${siteStyles.pageSection} page-section`}>
        <div className={`${siteStyles.container} content-prose`}>
          <p>
            <strong>Operator:</strong> {site.name}. Contact us at{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a> for privacy
            questions or deletion requests.
          </p>
          <h2>Contact enquiries</h2>
          <p>
            When you submit the contact form, we collect the details you
            provide so we can respond. The form may store your enquiry in a
            configured database and send a notification through Resend. We do
            not use enquiry details for unrelated marketing. A temporary,
            pseudonymous request token may be used to limit abuse; raw IP
            addresses are not stored in the lead record.
          </p>
          <h2>Analytics</h2>
          <p>
            Optional analytics uses Google Analytics 4 and Microsoft Clarity
            only after you choose “Allow analytics”. If configured, Google
            Analytics receives page paths and product-usage event names with
            limited, non-personal counts or categories. Clarity provides
            heatmaps and session recordings; the contact form and
            resume-matching interface are marked for masking using Clarity’s{" "}
            <code>data-clarity-mask</code> attribute. Neither service receives
            resume file contents, extracted resume text, filenames, contact
            details, search terms, or event parameters containing personal
            information. Analytics page paths omit query strings. With a
            configured database, Futurvion also stores page paths, event types,
            coarse device and referrer categories, a random browser identifier,
            and a session identifier. The identifier is stored in your browser.
            A session ends after 30 minutes of inactivity. Unique visitors are
            estimates based on distinct browser identifiers in the selected
            reporting period. No public traffic counter is displayed. You can
            change your choice here at any time using the button below.
          </p>
          <AnalyticsPreferencesButton
            enabled={Boolean(
              (process.env.DATABASE_URL && process.env.ABUSE_HASH_SECRET) ||
                process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
                process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
            )}
          />
          <h2>Advertising</h2>
          <p>
            Google AdSense is disabled by default. If Futurvion enables it,
            manually placed display advertisements may appear on selected blog
            pages. Google and its advertising partners may use cookies or
            similar technologies to serve, measure, and personalize
            advertisements, subject to your choices and applicable settings.
            Advertising is not used on contact, job, or about pages.
          </p>
          <p>
            The analytics choice on this website is not a Google-certified
            advertising consent mechanism. Before enabling AdSense, the site
            operator must configure an applicable Google-certified CMP and
            verify that it communicates the required consent signals,
            including for visitors in the EEA, UK, and Switzerland. Do not
            enable advertising or personalized ads before required consent is
            obtained. Review Google’s current advertising and consent
            requirements and obtain jurisdiction-specific legal advice where
            appropriate.
          </p>
          <h2>Resume job matching</h2>
          <p>
            If you start a resume search, Futurvion processes the PDF or DOCX
            temporarily in server memory. The application does not save resumes,
            extracted profiles, candidate embeddings, or matching results to
            its database, files, or browser storage. Clear the search, refresh,
            or leave the page to remove the selection and results. No external
            AI provider is used. Pseudonymous request tokens and attempt times
            are stored to limit abuse; they contain no resume contents or
            results. Hosting and database operators must configure their own
            logs and request capture consistently with this policy. Releasing
            memory does not guarantee secure erasure.
          </p>
          <h2>Retention and processors</h2>
          <p>
            Before production launch, the site operator must set and publish a
            retention schedule for contact enquiries and analytics events,
            configure database deletion jobs, and review any applicable legal
            requirements. Hosting, database, email, Google Analytics, Microsoft
            Clarity, and—if enabled—Google advertising providers process data
            for the site operator. Do not enter sensitive health or financial
            information in the form.
          </p>
          <h2>Your choices</h2>
          <p>
            You can use the email link instead of the form and decline
            analytics. For access, correction, or deletion requests, email{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
