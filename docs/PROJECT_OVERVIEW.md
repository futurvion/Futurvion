# Project overview

## Purpose and scope

Futurvion is a public site for a digital solutions studio. Its stated goal is to explain services and possible approaches in plain language and turn interested visitors into enquiries. This purpose is evidenced by `app/(studio)/page.tsx`, `app/(studio)/services/`, `app/(studio)/solutions/`, `app/(studio)/work/`, and `app/(studio)/contact/`. Whether any listed service or concept has been delivered for a real client is **not verified** by this repository. All five work entries in `data/portfolio.ts` explicitly describe illustrative concepts without verified results.

## Users and workflows

| User | Current workflow | Evidence |
| --- | --- | --- |
| Prospective visitor | Browse eight services, sector examples, process, FAQs, and illustrative work; open a service detail page and follow its contact link. | `data/services.ts`, `app/`, `components/home/faq.tsx` |
| Enquirer | Enter contact details, service and project description, agree to contact, submit the form, or use the public email link. | `features/contact/components/contact-form.tsx`, `app/api/contact/route.ts` |
| Analytics participant | Allow or decline optional Google Analytics, Microsoft Clarity, and configured first-party analytics; later change the choice from the privacy policy. | `features/analytics/components/analytics-consent.tsx`, `lib/analytics.ts`, `app/api/analytics/route.ts` |
| Site operator | Configure database/email, review leads and analytics in external tools or direct SQL. | `README.md`, `prisma/schema.prisma`; the admin UI currently covers jobs only |

The jobs portal adds a single administrator role. `/admin/login` signs in, `/admin` opens the protected workspace overview, and `/admin/jobs` contains job operations. Public visitors still have no account workflow.

## Verified functional requirements from code

- Public routes: `/`, `/about`, `/services`, eight `/services/[slug]` pages, `/solutions`, `/work`, five `/work/[slug]` pages, `/jobs`, `/contact`, `/blog`, `/blog/what-are-ai-agents`, `/blog/benefits-of-ai-agents`, `/blog/ai-agents-vs-chatbots`, `/blog/ai-agents-vs-assistants-vs-automation`, `/privacy-policy`, `/terms`, and a custom 404. The server-rendered blog index contains crawlable links to the AI agents overview and its three focused articles. All four articles are static server pages and are listed in the sitemap. Service and work slugs are generated from typed data, and unknown slugs are not generated.
- Service CTAs can preselect a valid service through `/contact?service=<slug>`. The browser form sends JSON to `POST /api/contact`; the server validates, rejects the honeypot and obvious bots, applies a database-backed rate limit, stores a lead, then sends a Resend notification. The UI reports success only after the endpoint succeeds.
- Analytics starts only after the browser stores an `allow` choice. GA4 receives path-only page views and typed, minimized interaction events; Clarity receives custom event names and masked recordings of the contact and resume-matching sections. Configured first-party analytics still stores page views, service CTA clicks, and successful-contact conversion events through `POST /api/analytics`; the server validates, rate-limits, pseudonymizes IDs, and stores records if configured.
- Metadata, canonical URLs, JSON-LD, sitemap, robots, security headers, and public email fallback are implemented. The visible work content is labeled illustrative.

## Quality constraints evidenced by implementation

- Strict TypeScript, schema validation, server-only database/email modules, responsive styles, reduced-motion handling, and a client-loaded 3D hero with static fallback are present. These indicate intended type safety, data boundaries, and accessibility support; representative desktop/mobile browser checks are recorded in TASKS.md; a comprehensive accessibility audit is **not verified**.
- The site needs PostgreSQL plus Resend for a complete contact flow. It can render public content without those services. First-party event storage needs database and HMAC configuration; the consent interface and third-party integrations are available when any analytics ID or first-party configuration is set.
- Contact and analytics data retention is **not implemented** as a scheduled process. The privacy page requests a policy before production use.

## Boundaries and unresolved requirements

The marketing copy mentions customer software, mobile applications, and AI services the studio could provide; this repository implements the marketing site and jobs portal, not those products or an AI agent runtime. There is no client portal, analytics dashboard, payment system, CMS, or background worker. Real client proof, jurisdiction-specific legal review, retention period, operational monitoring, and live deployment state need operator confirmation. Current actionable work is tracked in [TASKS.md](../TASKS.md).

The developer toolbox is an owned Futurvion product, separate from the five illustrative client concepts. It is implemented under `app/toolbox-internal/` and served only on the utility hostname through `proxy.ts`. Six free browser-local utilities require no login or payment. The Works page links to its intended public origin in a new tab. Custom-domain activation remains a deployment task.
