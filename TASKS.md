# Project tasks and status

Status is based on the current repository and local checks on 2026-10-22. `DONE` means implementation plus relevant local verification; `NEEDS_VERIFICATION` means code is present but a live integration or browser behavior has not been confirmed. The source files named below are the acceptance evidence, not proof of production operation.

## Project status summary

The public marketing pages and content are implemented. The contact and analytics backends are implemented behind environment configuration, but no live PostgreSQL, Resend, or deployed-site flow was exercised for this documentation task. There is no login, admin dashboard, AI agent runtime, or background job in this repository. The tracked automated suite currently contains seven validation-schema tests in `tests/validation.test.ts`.

## Implemented and verified

| Status | Capability and evidence | Acceptance evidence |
| --- | --- | --- |
| DONE | Public pages, eight service detail pages, five illustrative work detail pages, metadata routes, and 404 UI (`app/`, `data/`). | `npm run build` generated the static pages and compiled the dynamic handlers. |
| DONE | Request payload validation for contact and analytics (`lib/validation.ts`). | Seven Vitest assertions passed in `tests/validation.test.ts`. |
| DONE | Strict TypeScript and repository lint baseline (`tsconfig.json`, `eslint.config.mjs`). | `npm run typecheck` and `npm run lint` passed on 2026-10-22. |

## Present, with verification still needed

| Status | Capability and dependencies | Acceptance criteria / next check |
| --- | --- | --- |
| NEEDS_VERIFICATION | Contact submission: `components/contact-form.tsx`, `app/api/contact/route.ts`, Prisma `Lead`, Resend (`DATABASE_URL`, `ABUSE_HASH_SECRET`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`). | With a migrated test database and verified sending domain, submit valid/invalid requests; confirm the lead row, notification delivery, and error behavior. |
| NEEDS_VERIFICATION | Opt-in analytics: `components/analytics-consent.tsx`, `app/api/analytics/route.ts`, `AnalyticsEvent` (`DATABASE_URL`, `ABUSE_HASH_SECRET`). | In a browser against a migrated test database, accept and decline consent; verify event rows only after acceptance, duplicate handling, and session renewal. |
| NEEDS_VERIFICATION | WebGL and reduced-motion fallback, scroll effects, responsive navigation (`components/hero-scene.tsx`, `components/reveal.tsx`, `components/header.tsx`). | Manual browser check on mobile, reduced-motion, and WebGL-disabled contexts; no browser automation is configured. |
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

1. **NEEDS_VERIFICATION** — Run a live integration pass with a test database and Resend account. Dependency: environment setup. Acceptance: contact success/failure and analytics consent checks above pass, with actual results recorded here.
2. **PLANNED** — Set and enforce a data-retention policy. Dependency: operator policy decision. Acceptance: live deletion schedule and matching privacy notice.
3. **PLANNED** — Add focused API and browser tests for the highest-risk flows. Dependency: test environment and desired browser coverage. Acceptance: critical success and failure paths run automatically.

## Recent progress and validation

- 2026-10-22: Established project context documents from current code, schema, tests, and Git history. No application behavior changed.
- 2026-10-22: `npm run typecheck` passed; `npm run lint` passed; `npm test` passed (1 file, 7 tests); `npm run build` passed (Next.js 16.4.2; static and dynamic routes compiled). Database migration and live email/browser checks were not run because no test service configuration was used.
