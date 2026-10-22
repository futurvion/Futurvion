# Futurvion

Futurvion's public marketing site presents its digital services, business solutions, and illustrative work concepts, and lets visitors send an enquiry. It runs on Next.js 16.4.2 (App Router), React 19, strict TypeScript, Tailwind CSS 4, React Three Fiber/Three.js, Framer Motion, Lucide, Zod, Prisma 7 + PostgreSQL, and Resend. The work examples are concepts, not completed client projects.

For verified implementation details and current progress, see [TASKS.md](TASKS.md), [the project overview](docs/PROJECT_OVERVIEW.md), [architecture](docs/ARCHITECTURE.md), [API](docs/API.md), [database](docs/DATABASE.md), [security](docs/SECURITY.md), and [deployment](docs/DEPLOYMENT.md). [AGENTS.md](AGENTS.md) defines the documentation maintenance workflow.

## What works immediately vs. what needs credentials

| Works with no setup | Needs setup |
|---|---|
| All pages, animated hero emblem with a static reduced-motion/WebGL fallback, scroll-controlled capability story, scroll reveals for text and cards, scroll progress, responsive navigation, FAQ, sitemap, robots, JSON-LD, security headers | Contact form backend (`DATABASE_URL`, `ABUSE_HASH_SECRET`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`) |
| `mailto:` fallback shown on the contact page | Analytics (`DATABASE_URL`, `ABUSE_HASH_SECRET`) — silently disabled otherwise, and the consent banner is hidden |
| `/jobs` setup/empty state and `/admin` login screen | Jobs data and admin operations (`DATABASE_URL`, jobs migration, `AUTH_SECRET`, `APP_URL`, admin bootstrap); cron also needs `JOB_SYNC_SECRET` |
| | Booking CTA (`NEXT_PUBLIC_BOOKING_URL`), Search Console (`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`) |

The form reports success only after the lead is stored **and** the notification email is accepted by Resend. If the backend is not configured it returns 503 and the UI points visitors to the email link.

## Jobs portal setup

The public `/jobs` listing and detail pages use PostgreSQL. Without `DATABASE_URL`, the listing displays a setup state. Visit `/admin` directly: no admin link appears in the public UI. The new SQL migration is `prisma/migrations/20261022090000_jobs_portal/migration.sql`. Both committed migrations were applied to the configured Neon database on 2026-10-22. Prisma remains the ORM already used by this repository.

For another database, supply its Neon URL and run `npm run db:deploy` with migration privileges. `DATABASE_URL` is the runtime connection and may be pooled; optional `DATABASE_URL_UNPOOLED` is preferred by the Prisma CLI when set. Set `ADMIN_EMAIL` and create a scrypt hash by setting a temporary `ADMIN_BOOTSTRAP_PASSWORD` and running `node scripts/hash-admin-password.mjs`. Copy the hash to `ADMIN_PASSWORD_HASH`, clear the temporary plaintext variable, then run `node --env-file=.env scripts/bootstrap-admin.mjs` once. The script refuses to create another admin. Use a unique password of at least 12 characters for production. To replace a temporary credential, generate a new hash, set `ADMIN_PASSWORD_HASH` to it, then run `node --env-file=.env scripts/rotate-admin-password.mjs`; this revokes all active admin sessions. No password or admin row is in the migration.

For Neon, use `sslmode=verify-full` in `DATABASE_URL` to verify the server certificate and hostname. A fresh database contains no jobs or providers. Run `npm run jobs:seed-providers` to add the enabled Remotive, Figma and Twilio Greenhouse, and APPLY Digital Lever feeds. The script preserves existing providers and schedule settings and uses a sync batch size of 25 for a new schedule. Start a sync from `/admin` (or call the protected sync endpoint); `/jobs` reads only the imported database rows. The configured Neon database received 297 real jobs on 2026-10-22: 10 Remotive, 270 Greenhouse, and 17 Lever.

In `/admin`, add other providers as disabled, confirm display permission, verify their board/site identifier, then enable them. Supported sources are Remotive, explicitly configured Greenhouse boards, and explicitly configured Lever sites. The public pages show each source and link to the original posting. Remotive requires attribution and a link back to its own URL; the adapter preserves that link and limits requests to one every six hours. Greenhouse `updated_at` is not presented as the posting date. Review the [Remotive terms](https://github.com/remotive-com/remote-jobs-api/blob/main/README.md), [Greenhouse Job Board API](https://docs.greenhouse.io/job-board.html), and [Lever Postings API](https://github.com/lever/postings-api/blob/master/README.md) for ongoing use of these feeds.

Set `APP_URL` to the exact public origin, `AUTH_SECRET` to a random value of at least 32 characters, and `JOB_SYNC_SECRET` to a random value of at least 32 characters. The admin's **Sync now** action processes enabled providers during its request and does not need a scheduler. For automatic sync, configure an external scheduler to send `POST https://YOUR_DOMAIN/api/internal/jobs/sync` with `Authorization: Bearer YOUR_JOB_SYNC_SECRET` at least as often as the selected frequency. Saving the schedule does not create a cron job. Both manual and scheduled sync run within a request, so use a host timeout that covers the configured feeds; large feeds or strict serverless limits require a dedicated worker. The initial local sync succeeded against Neon; deployed cron remains to be configured and verified.

## Local setup

Use Node.js 20.9.0 or newer (the installed Next.js package's engine requirement) and npm; this repository does not pin an exact runtime version. PostgreSQL and a Resend account are needed to exercise the contact backend. Configure `DATABASE_URL` and `ABUSE_HASH_SECRET` to exercise analytics.

```bash
npm install            # runs `prisma generate` via postinstall
cp .env.example .env   # fill in the values needed for your environment
npm run dev
```

The committed scripts are `npm run dev`, `npm run build`, `npm run start`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run db:deploy`, and `npm run jobs:seed-providers`. `npm run start` serves a production build. `npm run db:deploy` applies committed migrations to the configured database. Run it against the intended database before testing data-backed features.

`.env.example` lists every configured variable. `NEXT_PUBLIC_SITE_URL` sets canonical URLs (the code defaults to `https://futurvion.in`); `NEXT_PUBLIC_BUSINESS_EMAIL` supplies public contact links; `NEXT_PUBLIC_BOOKING_URL` adds a booking CTA; `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` supplies an optional verification token. These four names are browser-exposed. Server-only `DATABASE_URL` connects PostgreSQL, `ABUSE_HASH_SECRET` provides HMAC pseudonyms (minimum 32 characters), and `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL` configure contact notifications. Keep actual secret values out of Git; `.env*` files are ignored except `.env.example`.

Local checks: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. The tracked Vitest suite covers validation, job adapters, synchronization, authentication helpers, and bounded request parsing. The first live provider import and local production-server read passed; deployed cron and admin login still need verification.

## Project structure

| Path | Responsibility |
| --- | --- |
| `app/` | Pages, layouts, metadata routes, and public/admin/internal Route Handlers. |
| `components/` | Shared display and browser-interactive components. |
| `config/`, `data/` | Site/palette configuration and service/portfolio content. |
| `lib/` | Validation, SEO, database, email, security, jobs, and admin session helpers. |
| `prisma/`, `tests/`, `public/` | Schema/migration, Vitest tests, and static assets. |

## Editing content

- Company info, navigation, SEO defaults: [config/site.ts](config/site.ts) (no secrets here).
- Services: [data/services.ts](data/services.ts). Portfolio: [data/portfolio.ts](data/portfolio.ts) — all entries are labelled illustrative concepts; replace with real, approved case studies.
- Logo: replace [public/logo-mark.png](public/logo-mark.png) and the share image [public/og-image.svg](public/og-image.svg) (use a 1200×630 PNG/JPG for best social previews).
- There are deliberately no testimonials, client logos or statistics. Add only verified, approved ones.

## Database

```bash
npm run db:deploy   # applies prisma/migrations
```

Tables: `Lead`, `AnalyticsEvent`, `AbuseAttempt`, `Job`, `JobProvider`, `JobSyncRun`, `JobSyncSettings`, `AdminUser`, and `AdminSession`. Use a limited runtime DB role (no DDL) and a separate role for migrations.

## Analytics definitions

- **Page view**: one recorded `page_view` event (de-duplicated client-side within 1.5 s, and by unique `eventId`).
- **Session**: random ID in `sessionStorage`, renewed after 30 minutes of inactivity.
- **Unique visitor**: estimate = distinct `visitorKey` in the reporting period. The key is an HMAC (using `ABUSE_HASH_SECRET`) of a random browser ID; no raw IPs or IDs are stored.
- Events are recorded only after the visitor opts in; bots by user-agent are ignored; the endpoint is rate-limited. There is no public counter and no public dashboard. Query data directly with SQL, or build an authenticated dashboard before exposing any of it.

## Data retention (suggested; run on a schedule)

These SQL statements are examples only; no deletion job is configured in this repository.

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
3. Attach `futurvion.in` as the primary domain and redirect `www.futurvion.in` to it; HTTPS is automatic. The site defaults to `https://futurvion.in` for its canonical URLs, sitemap, and robots file. If `NEXT_PUBLIC_SITE_URL` is set in Vercel, set it to that exact URL and redeploy. An `.example` value triggers `noindex`.

## Search Console

After deploying, add `futurvion.in` as a **Domain property** in [Google Search Console](https://search.google.com/search-console) and verify it with the DNS TXT record Google provides. Submit `https://futurvion.in/sitemap.xml`, then inspect `https://futurvion.in/` and request indexing. Check that the live page has `index, follow`, a canonical URL on `futurvion.in`, and no `X-Robots-Tag: noindex` header. A URL-prefix property can instead use `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` with the verification token and a redeploy. Indexing and rankings are not guaranteed.

## Smoke test after deploy

- `/`, `/services`, every `/services/*`, `/work`, `/contact`, 404 page load.
- `/robots.txt` and `/sitemap.xml` use the production domain.
- Submit the contact form: lead row exists, email arrives; wrong input shows errors.
- Accept analytics: `page_view` rows appear; decline: none do.
- Test with reduced motion on, WebGL disabled, and a phone viewport; run Lighthouse on `/`.

## Known gaps

- No committed Playwright end-to-end or axe accessibility tests yet; a local no-database browser smoke check covered jobs/admin routes and mobile navigation.
- No authenticated analytics dashboard (intentionally, rather than an unprotected one).
- Rate limiting is DB-backed and keyed on `x-forwarded-for`; confirm your host sets it trustworthily.

