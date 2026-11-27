import { site } from "@/config/site";
import { PageHero } from "@/components/shared/page-hero";
import { pageMetadata } from "@/lib/seo";
import { siteStyles } from "@/config/styles";
import { AnalyticsPreferencesButton } from "@/features/analytics/components/analytics-consent";
import { adsConfig } from "@/config/ads";
import { legalLastUpdated } from "@/config/legal";

export const metadata = pageMetadata(
  "Privacy policy",
  "How Futurvion handles contact enquiries, cookies, analytics, and Google AdSense advertising.",
  "/privacy-policy",
);

const externalLink = { target: "_blank", rel: "noopener noreferrer" } as const;

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
        <p>What this website collects, why, and the choices you have.</p>
      </PageHero>
      <section className={`${siteStyles.pageSection} page-section`}>
        <div className={`${siteStyles.container} content-prose`}>
          <p>
            <strong>Last updated:</strong> {legalLastUpdated}
          </p>
          <p>
            This policy explains how {site.name} (&ldquo;we&rdquo;,
            &ldquo;us&rdquo;) handles information when you visit{" "}
            <a href={site.url}>{site.url.replace(/^https?:\/\//, "")}</a>, read
            our articles, use our free tools, browse job listings, or contact
            us. For privacy questions or deletion requests, email{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>

          <h2>Information we collect</h2>
          <ul>
            <li>
              <strong>Information you give us.</strong> Details you enter in
              the contact form, such as your name, email address, company,
              phone number, and project description.
            </li>
            <li>
              <strong>Usage information.</strong> Pages visited, events such as
              button clicks, and coarse device and referrer categories, as
              described under Analytics below.
            </li>
            <li>
              <strong>Cookies and similar technologies.</strong> Small files or
              browser storage entries used to remember your privacy choices,
              measure site usage, and—if you allow advertising—serve ads.
            </li>
          </ul>

          <h2>Contact enquiries</h2>
          <p>
            When you submit the contact form, we collect the details you
            provide so we can respond. The enquiry may be stored in our
            database and sent to us as an email notification through our email
            provider, Resend. We do not use enquiry details for unrelated
            marketing and we do not sell them. A temporary, pseudonymous
            request token may be used to limit abuse; raw IP addresses are not
            stored in the enquiry record.
          </p>

          <h2>Analytics</h2>
          <p>
            We use Google Analytics 4, Microsoft Clarity, and first-party usage
            analytics to understand how the site is used and to improve it.
            Analytics runs by default, and you can turn it off at any time
            using the privacy preferences button on this page. Google Analytics
            receives page paths and product-usage event names with limited,
            non-personal counts or categories. Clarity provides heatmaps and
            session recordings; the contact form and resume-matching interface
            are masked using Clarity&rsquo;s <code>data-clarity-mask</code>{" "}
            attribute. Neither service receives resume file contents, extracted
            resume text, filenames, contact details, search terms, or event
            parameters containing personal information. Analytics page paths
            omit query strings.
          </p>
          <p>
            Our first-party analytics stores page paths, event types, coarse
            device and referrer categories, a random browser identifier, and a
            session identifier unless you turn analytics off. The identifier is
            stored in your browser. A session ends after 30 minutes of
            inactivity. Unique visitors are estimates based on distinct browser
            identifiers in the selected reporting period.
          </p>

          <h2>Advertising and Google AdSense</h2>
          <p>
            We use Google AdSense to show advertisements on our blog pages and
            between job-listing cards. Ads are not shown on the homepage,
            service pages, contact forms, or application controls. The AdSense
            script loads only after you allow advertising in privacy
            preferences.
          </p>
          <ul>
            <li>
              Third-party vendors, including Google, use cookies to serve ads
              based on your prior visits to this website or other websites.
            </li>
            <li>
              Google&rsquo;s use of advertising cookies enables it and its
              partners to serve ads to you based on your visits to this site
              and/or other sites on the Internet.
            </li>
            <li>
              You may opt out of personalized advertising by visiting{" "}
              <a href="https://adssettings.google.com" {...externalLink}>
                Google Ads Settings
              </a>
              . You can also opt out of some third-party vendors&rsquo; use of
              cookies for personalized advertising at{" "}
              <a href="https://www.aboutads.info/choices/" {...externalLink}>
                www.aboutads.info
              </a>
              .
            </li>
            <li>
              Learn more about{" "}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                {...externalLink}
              >
                how Google uses information from sites that use its services
              </a>
              .
            </li>
          </ul>
          <p>
            Analytics settings do not control advertising. Advertising has its
            own allow or reject choice, and rejecting it prevents the AdSense
            script from loading on this site. Where the law requires it,
            including for visitors in the EEA, the UK, and Switzerland,
            personalized ads are shown only after the required consent has
            been obtained.
          </p>
          <AnalyticsPreferencesButton
            enabled={
              adsConfig.enabled ||
              Boolean(
                (process.env.DATABASE_URL && process.env.ABUSE_HASH_SECRET) ||
                  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
                  process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
              )
            }
          />
          <h2>Nearby job search</h2>
          <p>
            You can select a city or explicitly allow the browser to share an
            approximate location. Device coordinates are rounded before
            transmission and used for the current job search. We do not
            save your search origin to a profile, location history, browser
            storage, or analytics. City lookup uses a bundled public dataset.
            Your browser may use its own location provider if you grant
            permission. Nearby distances are estimates to listed city centres.
            Hosting and database logging must be configured to avoid capturing
            search origins.
          </p>
          <h2>Resume job matching</h2>
          <p>
            If you start a resume search, {site.name} processes the PDF or DOCX
            temporarily in server memory. We do not save resumes, extracted
            profiles, candidate embeddings, or matching results to our
            database, files, or browser storage. Clear the search, refresh, or
            leave the page to remove the selection and results. No external AI
            provider is used. Pseudonymous request tokens and attempt times are
            stored to limit abuse; they contain no resume contents or results.
          </p>

          <h2>Free tools</h2>
          <p>
            Our free tools, such as the QR code generator, run in your browser.
            The content you enter is not sent to or stored on our servers.
          </p>

          <h2>Service providers and retention</h2>
          <p>
            Our hosting, database, and email providers, along with Google
            Analytics, Microsoft Clarity, and Google advertising services,
            process data on our behalf. We keep contact enquiries only as long
            as needed to respond and to manage any resulting conversation or
            project, and we delete them sooner on request. Please do not enter
            sensitive health or financial information in the form.
          </p>

          <h2>Children&rsquo;s privacy</h2>
          <p>
            This website is intended for businesses and professionals and is
            not directed to children under 13. We do not knowingly collect
            personal information from children. If you believe a child has
            sent us personal information, contact us and we will delete it.
          </p>

          <h2>Your choices and rights</h2>
          <p>
            You can turn analytics off or reject advertising at any time
            through privacy preferences, block or delete cookies in your
            browser settings, or email us instead of using the form. To request
            access to, correction of, or deletion of your information, email{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this policy when our website or services change. The
            &ldquo;Last updated&rdquo; date at the top of this page shows when
            it was last revised.
          </p>
        </div>
      </section>
    </>
  );
}
