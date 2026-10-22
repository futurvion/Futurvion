# Deployment

## Supported configuration evidenced by the repository

`README.md` describes Vercel deployment with a PostgreSQL provider and Resend. The repo has no `vercel.json`, infrastructure-as-code, CI pipeline, health endpoint, or verified production deployment record. The code itself uses the standard Next.js build/start scripts (`npm run build`, `npm run start`) and Node.js runtime for both POST APIs. Vercel is a documented intended platform, not a live environment verified by this task.

## Build and release procedure

1. Install dependencies with `npm install`; its `postinstall` runs `prisma generate`. Use a Node.js/npm version supported by the installed Next.js release; no exact version is pinned in this repo.
2. Provision PostgreSQL and a Resend sending domain/inbox for the contact flow. Set production environment variables in the host, keeping server-only values private.
3. Apply the committed migration with `npm run db:deploy` against the intended database using migration privileges. Prefer a separate, limited runtime DB role.
4. Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`; deploy the build. `npm run start` serves the production build for a self-hosted process.
5. Set/verify the primary domain and canonical URL. `config/site.ts` defaults to `https://futurvion.in`; `NEXT_PUBLIC_SITE_URL` overrides it. `app/layout.tsx` emits `noindex` only when the configured URL ends in `.example`. Confirm sitemap, robots, canonical tags, and domain redirects on the live host.

## Environment variable contract

Jobs also needs server-only `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` for one-time bootstrap, `AUTH_SECRET` for pseudonymous login limits, `APP_URL` for admin mutation origin checks, and `JOB_SYNC_SECRET` for external cron authorization. `DATABASE_URL_UNPOOLED` is an optional operator-held direct migration connection; the current Prisma config reads `DATABASE_URL`, so set that to the intended migration connection when applying migrations. The jobs migration has not been applied. Configure a cron service to POST to `/api/internal/jobs/sync` with `Authorization: Bearer <JOB_SYNC_SECRET>` at an appropriate cadence after review. The sync currently runs within the request, so deployment timeouts and provider volume must be checked before enabling it. The admin route is deliberately absent from public navigation.

| Name | Exposure and purpose | Required for |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Browser-exposed canonical base URL; code has a default. | Correct metadata for a different domain. |
| `NEXT_PUBLIC_BUSINESS_EMAIL` | Browser-exposed public email link; code has a placeholder fallback. | Usable email fallback. |
| `NEXT_PUBLIC_BOOKING_URL` | Browser-exposed optional external booking CTA. | Booking link only. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Browser-exposed optional verification token. | HTML-token Search Console verification only. |
| `DATABASE_URL` | Server-only PostgreSQL connection. | Lead storage, analytics, and rate limiting. |
| `ABUSE_HASH_SECRET` | Server-only HMAC key of at least 32 characters. | Contact and analytics handlers. |
| `RESEND_API_KEY` | Server-only email provider key. | Contact notification. |
| `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Server-only notification destination and verified sender. | Contact notification. |

`.env.example` contains safe setup placeholders; actual `.env*` files are ignored. Without database and HMAC configuration, the analytics handler returns 204 without storage and the consent banner is hidden. The contact handler returns 503 unless all contact configuration names are present. A configured key/URL still requires working external services and a migrated schema.

## Checks and operations

After deploy, load the public routes including service/work details and 404, inspect `/robots.txt` and `/sitemap.xml`, check the configured headers, then submit a test enquiry and verify both the lead row and email. Test analytics with consent allowed and declined. Check mobile and reduced-motion rendering. These are deployment checks, not results already obtained.

Errors are currently written with `console.error`; retention, monitoring, alerting, backup/restore, health checks, and rollback steps are **not defined or verified** in code. Vercel's deployment history may provide rollback capability, but this repository does not configure or prove a rollback procedure. Define these operational controls before declaring production readiness.
