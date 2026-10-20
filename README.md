# Futurvion

Marketing site for Futurvion: Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS 4, Lucide, Zod, Prisma 7 + PostgreSQL, Resend.

## What works immediately vs. what needs credentials

| Works with no setup | Needs setup |
|---|---|
| All pages, animated hero emblem with a static reduced-motion/WebGL fallback, scroll-controlled capability story, scroll reveals for text and cards, scroll progress, responsive navigation, FAQ, sitemap, robots, JSON-LD, security headers | Contact form backend (`DATABASE_URL`, `ABUSE_HASH_SECRET`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`) |
| `mailto:` fallback shown on the contact page | Analytics (`DATABASE_URL`, `ABUSE_HASH_SECRET`) — silently disabled otherwise, and the consent banner is hidden |
| | Booking CTA (`NEXT_PUBLIC_BOOKING_URL`), Search Console (`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`) |

The form reports success only after the lead is stored **and** the notification email is accepted by Resend. If the backend is not configured it returns 503 and the UI points visitors to the email link.

## Local setup

```bash
npm install            # also runs `prisma generate`
cp .env.example .env   # fill in what you need
npm run dev
```

Checks: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.

## Editing content

- Company info, navigation, SEO defaults: [config/site.ts](config/site.ts) (no secrets here).
- Services: [data/services.ts](data/services.ts). Portfolio: [data/portfolio.ts](data/portfolio.ts) — all entries are labelled illustrative concepts; replace with real, approved case studies.
- Logo: replace [public/logo-mark.png](public/logo-mark.png) and the share image [public/og-image.svg](public/og-image.svg) (use a 1200×630 PNG/JPG for best social previews).
- There are deliberately no testimonials, client logos or statistics. Add only verified, approved ones.

## Database

```bash
npx prisma migrate deploy   # applies prisma/migrations
```

Tables: `Lead`, `AnalyticsEvent`, `AbuseAttempt`. Use a DB role limited to those tables (no DDL) at runtime and a separate role for migrations.

## Analytics definitions

- **Page view**: one recorded `page_view` event (de-duplicated client-side within 1.5 s, and by unique `eventId`).
- **Session**: random ID in `sessionStorage`, renewed after 30 minutes of inactivity.
- **Unique visitor**: estimate = distinct `visitorKey` in the reporting period. The key is an HMAC (using `ABUSE_HASH_SECRET`) of a random browser ID; no raw IPs or IDs are stored.
- Events are recorded only after the visitor opts in; bots by user-agent are ignored; the endpoint is rate-limited. There is no public counter and no public dashboard. Query data directly with SQL, or build an authenticated dashboard before exposing any of it.

## Data retention (suggested; run on a schedule)

```sql
DELETE FROM "AbuseAttempt"   WHERE "createdAt" < now() - interval '2 days';
DELETE FROM "AnalyticsEvent" WHERE "createdAt" < now() - interval '14 months';
-- Leads: delete or anonymise per your own policy, e.g. 24 months after last contact.
```

Update the privacy policy to match whatever you actually configure.

## Email (Resend)

Create an API key, verify your sending domain, set `CONTACT_FROM_EMAIL` to an address on it and `CONTACT_TO_EMAIL` to your inbox. Visitor confirmation emails are not implemented.

## Deployment (Vercel)

1. Provision PostgreSQL (e.g. Neon/Supabase/Vercel Postgres) and run `npx prisma migrate deploy` against it.
2. Import the repo in Vercel and add the environment variables from `.env.example` (secrets as server-side only).
3. Set `NEXT_PUBLIC_SITE_URL` to the production domain, attach the domain; HTTPS is automatic. The site sets `noindex` while the URL still ends in `.example`.

## Search Console

Add the property, set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` to the verification token, redeploy, verify, then submit `https://your-domain/sitemap.xml`. Rankings are never guaranteed.

## Smoke test after deploy

- `/`, `/services`, every `/services/*`, `/work`, `/contact`, 404 page load.
- `/robots.txt` and `/sitemap.xml` use the production domain.
- Submit the contact form: lead row exists, email arrives; wrong input shows errors.
- Accept analytics: `page_view` rows appear; decline: none do.
- Test with reduced motion on, WebGL disabled, and a phone viewport; run Lighthouse on `/`.

## Known gaps

- No Playwright end-to-end or axe accessibility tests yet (unit tests cover validation and SEO helpers).
- No authenticated analytics dashboard (intentionally, rather than an unprotected one).
- Rate limiting is DB-backed and keyed on `x-forwarded-for`; confirm your host sets it trustworthily.
