import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/effects/scroll-progress";
import { ScrollReveal } from "@/components/effects/reveal";
import { AnalyticsConsent } from "@/features/analytics/components/analytics-consent";
import { JsonLd } from "@/components/shared/json-ld";
import { organizationJsonLd } from "@/lib/seo";
import { siteStyles } from "@/config/styles";
import { adsConfig } from "@/config/ads";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const analyticsEnabled = Boolean(
    (process.env.DATABASE_URL && process.env.ABUSE_HASH_SECRET) ||
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
      process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
  );

  return (
    <>
      <a className={`${siteStyles.skipLink} skip-link`} href="#main-content">
        Skip to content
      </a>
      <JsonLd data={organizationJsonLd()} />
      <ScrollProgress />
      <ScrollReveal />
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
      <AnalyticsConsent
        enabled={analyticsEnabled}
        adsEnabled={adsConfig.enabled}
      />
    </>
  );
}
