# Project tasks and status

Status is based on the current repository and local checks on 2026-10-23. `DONE` means implementation plus relevant local verification; `NEEDS_VERIFICATION` means code is present but a live integration or browser behavior has not been confirmed. The source files named below are the acceptance evidence, not proof of production operation.

## Project status summary

The public marketing pages and content are implemented. The contact and analytics backends are implemented behind environment configuration. The jobs portal has public discovery, a URL-only admin login/dashboard, provider adapters, synchronization, and a migration applied to the configured Neon database. A first live provider sync inserted 297 real jobs into Neon and public listing/detail reads work; Resend and deployed-site flows have not been exercised. There is no AI agent runtime or durable background worker. The tracked automated suite includes validation and jobs-core tests.

## Jobs portal status

| Status | Capability and evidence | Remaining check |
| --- | --- | --- |
| DONE | `/jobs` and `/jobs/[slug]` pages, header/mobile Jobs link, database filters and pagination, no admin link in public UI. | Build and local unit checks. |
| NEEDS_VERIFICATION | Prisma jobs/admin schema and `prisma/migrations/20261022090000_jobs_portal/migration.sql`. | Both migrations applied to configured Neon database; 297 job writes and public reads passed. Constraint and long-term expiration behavior still need live checks. |
| NEEDS_VERIFICATION | Remotive, Greenhouse, and Lever adapters; sync and expiration logic. | First live sync succeeded: 10 Remotive, 270 Greenhouse, 17 Lever jobs. Repeated updates and expiration still need live checks. |
| NEEDS_VERIFICATION | Admin login, protected workspace, provider management, schedule and manual/cron sync. | Local request checks passed for redirects, login, protected pages, and sign-out. Test browser hydration and deployed HTTPS cookie/origin behavior, concurrent sync, timeout, and recovery. |

Manual runs process during the authenticated admin request; the external scheduler endpoint processes one queued or due run synchronously. Large feeds or a host with short execution limits need a dedicated worker before production activation. `maxConcurrency` bounds simultaneous provider fetches and `batchSize` bounds transactional upserts. First-party application flow is not implemented. Do not treat the portal as production verified yet.

## Implemented and verified

| Status | Capability and evidence | Acceptance evidence |
| --- | --- | --- |
| DONE | Public pages, eight service detail pages, five illustrative work detail pages, metadata routes, and 404 UI (`app/`, `data/`). | `npm run build` generated the static pages and compiled the dynamic handlers. |
| DONE | Request payload validation for contact and analytics (`lib/validation.ts`). | Seven Vitest assertions passed in `tests/validation.test.ts`. |
| DONE | Strict TypeScript and repository lint baseline (`tsconfig.json`, `eslint.config.mjs`). | `npm run typecheck` and `npm run lint` passed on 2026-10-22. |

## Present, with verification still needed

| Status | Capability and dependencies | Acceptance criteria / next check |
| --- | --- | --- |
| NEEDS_VERIFICATION | Contact submission: `features/contact/components/contact-form.tsx`, `app/api/contact/route.ts`, Prisma `Lead`, Resend (`DATABASE_URL`, `ABUSE_HASH_SECRET`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`). | With a migrated test database and verified sending domain, submit valid/invalid requests; confirm the lead row, notification delivery, and error behavior. |
| NEEDS_VERIFICATION | Opt-in analytics: `features/analytics/components/analytics-consent.tsx`, `app/api/analytics/route.ts`, `AnalyticsEvent` (`DATABASE_URL`, `ABUSE_HASH_SECRET`). | In a browser against a migrated test database, accept and decline consent; verify event rows only after acceptance, duplicate handling, and session renewal. |
| NEEDS_VERIFICATION | WebGL and reduced-motion fallback, scroll effects, responsive navigation (`components/home/hero-scene.tsx`, `components/effects/reveal.tsx`, `components/layout/header.tsx`). | Manual browser check on mobile, reduced-motion, and WebGL-disabled contexts; no browser automation is configured. |
| NEEDS_VERIFICATION | Production deployment and search metadata (`README.md`, `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`). | Confirm host configuration, domain/canonical URLs, migrations, headers, robots output, and API integration on the deployed site. |

## Partially implemented features

No feature has sufficient implementation evidence to be marked `IN_PROGRESS`. The retention section in `README.md` is suggested SQL only; no retention job exists.

## Pending work, blockers, and technical debt

| Status | Item and dependencies | Acceptance criteria |
| --- | --- | --- |
| BLOCKED | Live contact/analytics verification needs test PostgreSQL, Resend settings, and deployment configuration not available in the repository. | Complete the integration checks above once credentials and a test environment are supplied. |
| PLANNED | Define retention schedule and deletion job; owner must approve policy and applicable legal review (`README.md`, privacy policy, `prisma/`). | Published policy matches an active deletion mechanism. |
| PLANNED | Add focused API integration and browser accessibility/end-to-end coverage (`app/api/`, `components/`, `tests/`). | Exercise rate limits, persistence/email failure paths, consent flow, responsive and keyboard behavior. |
| NEEDS_VERIFICATION | Rate limit safety: `lib/security.ts` trusts the first `x-forwarded-for` value and uses separate count/create operations. | Verify trusted proxy header behavior; assess concurrent-request limits and strengthen if needed. |
| NEEDS_VERIFICATION | Request size/consent enforcement: handlers check `content-length`; analytics accepts a client-supplied consent flag (`app/api/`). | Review behavior with absent/false content length and direct API calls; define abuse controls appropriate to deployment. |
| NEEDS_VERIFICATION | No operational health endpoint, structured monitoring, or rollback procedure is configured. | Decide deployment requirements before claiming production readiness. |

No authenticated analytics dashboard or AI agent feature is a confirmed requirement. Service copy describing AI work is marketing content, not an implemented agent system.

## Current focus and next tasks

1. **NEEDS_VERIFICATION** — Verify admin browser hydration and deployed session behavior, then configure/verify external scheduling. Local requests now confirm unauthenticated redirects, login, both protected pages, and session revocation after sign-out. The first provider feeds and `/jobs` filters were exercised locally; review source reuse terms and host timeout before production cron.
2. **NEEDS_VERIFICATION** — Run a live integration pass with a test database and Resend account. Dependency: environment setup. Acceptance: contact success/failure and analytics consent checks above pass, with actual results recorded here.
3. **PLANNED** — Set and enforce a data-retention policy. Dependency: operator policy decision. Acceptance: live deletion schedule and matching privacy notice.
4. **PLANNED** — Add focused API and browser tests for the highest-risk flows. Dependency: test environment and desired browser coverage. Acceptance: critical success and failure paths run automatically.

## Recent progress and validation

- 2026-10-23: Hid the public footer on every admin route, including the login page. The protected dashboard keeps its fixed sidebar and independently scrolling content. Local Chrome confirmed the footer is hidden on `/admin/login`, `/admin`, and `/admin/jobs`. `npm run typecheck`, `npm run lint`, `npm test` (10 files, 33 tests), and `npm run build` passed.
- 2026-10-23: Kept the protected admin sidebar stationary within the viewport while only the content pane scrolls; the narrow layout keeps compact navigation above the scrolling content. A local Chrome check at 1440×900 and 390×844 confirmed an 800px content scroll with unchanged sidebar position, no document or horizontal overflow, and a reset to the top when switching tabs. `npm run typecheck`, `npm run lint`, `npm test` (10 files, 33 tests), and `npm run build` passed. Updated the admin layout CSS; deployed browser behavior remains unverified.

- 2026-10-23: Split admin into `/admin/login`, protected `/admin` overview, and `/admin/jobs` operations with a shared sidebar and sign-out. Session checks run in both protected pages before admin data reads; admin APIs retain independent checks. Local HTTP checks confirmed 307 redirects from both protected routes without a cookie, 200 login and authenticated pages, redirect away from login when signed in, and denied access after sign-out. `npm run typecheck`, `npm run lint`, `npm test` (10 files, 33 tests), and `npm run build` passed. After moving the route, a stale generated `.next/dev/types/validator.ts` initially referenced the old file and blocked typecheck/build; starting `next dev` regenerated it. Browser layout/hydration and deployed auth remain to be checked. Updated README, overview, architecture, authentication, security, and changelog docs.

- 2026-10-23: Fixed the `/admin` hydration mismatch caused by formatting a provider timestamp separately in the server and browser locales. The server now passes a stable UTC label to the interactive dashboard. User-provided logs showed a successful admin login and dashboard response; the earlier jobs import error was transient and the current `/jobs` module compiled in the production build. `npm run typecheck`, `npm run lint`, `npm test` (10 files, 33 tests), and `npm run build` passed. A post-fix browser hydration check and deployed authentication checks remain open.

- 2026-10-23: Bootstrapped the first admin account in the configured Neon database using the user-selected password. Stored only its scrypt hash in the ignored local `.env`; verified that the configured admin row accepts the password using a read-only database check. Admin login, cookie/session behavior, and deployed scheduling remain unverified. No application code changed.

- 2026-10-23: Fixed entity-escaped Greenhouse job descriptions, using the pasted Twilio sample and current provider feed to verify headings, paragraphs, lists, and safe text rendering. Updated the single-job hero, back link, and loading skeleton. Targeted backfill updated 124 Twilio descriptions from the feed and recovered seven older postings from reviewed stored text; all 131 now have readable structured descriptions. The seven older postings remain absent from the live feed and subject to normal expiration. `npm run typecheck`, `npm run lint`, `npm test` (10 files, 33 tests), and `npm run build` passed. A local browser check against the configured database confirmed 19 visible bullets, no markup fragments, the `/jobs` back link, a compact desktop hero, and no mobile horizontal overflow; the streamed response included the detail skeleton. Updated API, architecture, security, database, and changelog docs.

- 2026-10-23: Kept the `/jobs` hero and section headings visible while the first jobs API request loads. Search controls and four card-shaped job placeholders now occupy only their own areas; later searches keep the form visible while job cards load. Grouped secondary filters under an accessible “More filters” control and scoped the route loading fallback to job details. `npm run typecheck`, `npm run lint`, `npm test` (9 files, 29 tests), and `npm run build` passed. A local browser check with delayed mocked API responses confirmed first-load and refetch states, filter behavior, unchanged `/jobs` URL, and no horizontal overflow at 390px. Live database behavior was not exercised.

- 2026-10-23: Moved `/jobs` search, filters, and pagination into client-held state backed by JSON `POST /api/jobs` calls, leaving the page URL unchanged. Kept `GET /api/jobs` for existing API callers. Added bounded body handling and focused POST route tests; updated API and architecture docs. `npm run typecheck`, `npm run lint`, `npm test` (9 files, 29 tests), and `npm run build` passed. A local browser smoke check with mocked jobs responses confirmed initial load, next-page and company-filter POST bodies while the address stayed `/jobs`; browser behavior against a live database remains to be checked.

- 2026-10-22: Reorganized UI into layout, home, effects, shared, and feature-owned folders; moved jobs UI, domain logic, provider adapters, and admin authentication under `features/jobs/` while keeping Next.js routes and APIs in `app/`. Updated source imports and architecture/product/API/security documentation. `npm run typecheck`, `npm run lint`, `npm test` (8 files, 26 tests), and `npm run build` passed. No database or deployment changes were made.

- 2026-10-22: Added an idempotent provider seed script for Remotive, Figma and Twilio Greenhouse boards, and APPLY Digital Lever; enabled them in the configured Neon database. Changed sync to read existing job hashes once per batch and corrected Greenhouse date handling. A first protected sync succeeded with 297 fetched and inserted, zero provider errors. Local production-server `/api/jobs` reported 297 rows (10 Remotive, 270 Greenhouse, 17 Lever); `/jobs` and a job detail page returned 200, displayed source attribution and original links, and kept `/admin` off public navigation. `npm run typecheck`, `npm run lint`, `npm test` (8 files, 26 tests), and `npm run build` passed. Automatic deployed cron and admin login remain unverified.

- 2026-10-22: Fixed a `P2028` jobs listing error by removing an unnecessary read transaction; production-server `/api/jobs` and `/jobs` both returned 200 against Neon, and unauthenticated manual sync returned 401. The Neon database had zero jobs, providers, and admin users, so listings still need provider setup and synchronization; the public empty state now says no roles are available. Made admin **Sync now** process during its request instead of waiting for a scheduler, and increased transaction acquisition/execution limits for sync write batches. Set the ignored local `DATABASE_URL` SSL mode to `verify-full`; a verified TLS query succeeded without a warning. Generated local `AUTH_SECRET` and `JOB_SYNC_SECRET` values without displaying them. Added the Next.js 16 smooth-scroll attribute. `npm run typecheck`, `npm run lint`, `npm test` (8 files, 26 tests), and `npm run build` passed. Admin bootstrap awaits a user-chosen password hash; live provider sync remains unverified.

- 2026-10-22: Applied both committed migrations to the configured Neon database via Prisma Migrate. A follow-up migration status reported the schema up to date; a read-only query found all 9 expected tables. Fixed Prisma CLI `.env` loading with `dotenv` and made it prefer optional `DATABASE_URL_UNPOOLED` for migrations; `npm run db:deploy` then reported no pending migrations. `npm run typecheck`, `npm run lint`, `npm test` (7 files, 23 tests), and `npm run build` passed. Admin bootstrap was skipped because `ADMIN_PASSWORD_HASH` is empty; live application queries, provider sync, and deployed authentication remain unverified.

- 2026-10-22: Added jobs portal code, generated a reviewable Prisma SQL migration without applying it, and kept `/admin` off public navigation. Local checks after implementation: `npm run typecheck` passed, `npm run lint` passed, `npm test` passed (7 files, 23 tests), and `npm run build` passed. A local production-server browser smoke check confirmed `/jobs`, `/admin`, mobile Jobs navigation, no public admin link, no horizontal overflow, public jobs API setup state, and 401 for unauthenticated admin API. No database, external provider, email, or deployed integration was exercised. Live database/provider and broader accessibility verification remain open.

- 2026-10-22: Established project context documents from current code, schema, tests, and Git history. No application behavior changed.
- 2026-10-22: `npm run typecheck` passed; `npm run lint` passed; `npm test` passed (1 file, 7 tests); `npm run build` passed (Next.js 16.4.2; static and dynamic routes compiled). Database migration and live email/browser checks were not run because no test service configuration was used.
