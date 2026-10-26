# Changelog

Only changes supported by the repository or Git history are listed. Unreleased entries describe working-tree changes.

## Unreleased

- Added nearby job discovery with manual city selection, permission-based device location, configurable radius, nearest-first pagination and approximate distance labels. Added public city-location storage/indexes, automatic sync refresh and invalidation, offline GeoNames lookup, a backfill command, and location privacy controls. Applied the migration and backfilled 139 jobs/224 city entries while preserving all 297 source jobs.

- Added temporary PDF/DOCX resume matching on `/jobs`: bounded in-memory parsing, indexed PostgreSQL retrieval, deterministic weighted recommendations, stretch explanations, and clear/refresh cleanup. Applied a public-job metadata/search migration without candidate persistence; retained ordinary discovery and employer application links. Added synthetic parsing, privacy, ranking, retrieval, and API tests, runtime limits, and deployment/privacy documentation.

- Refined the homepage Process section into a cohesive split layout with numbered stages, clearer hierarchy and a direct project enquiry link.

- Added page-specific right-side hero visuals for Services, Solutions, Work, About, Contact and Jobs, plus a compact Process stages panel. Included responsive layouts, useful destination links and reduced-motion support while preserving the original homepage 3D scene and simple jobs motion.

- Grouped public job listings by normalized company, title and location before pagination, with deterministic representatives and correct unique totals. Added and applied a database-maintained grouping-key migration, preserving all source postings and deep links; added query/filter/privacy regression tests.

- Redesigned the public studio site with a typography-led homepage, capability index, business-priority selector, reusable illustrative concept artwork, coherent secondary pages/jobs styling, native enquiry validation, and improved mobile menu focus behavior. Preserved APIs, database, authentication and integrations. Added DESIGN.md.

- Established shared agent instructions, a progress tracker, and implementation-based project documentation. No application code was changed.
- Added public jobs search and details, a protected URL-only admin dashboard, Remotive/Greenhouse/Lever adapters, sync logic, and a Prisma SQL migration. The migrations were applied and a first provider sync imported 297 jobs on 2026-10-22.
- Parsed entity-escaped provider descriptions into safe headings, paragraphs, and lists; compacted the single-job header and matched its loading skeleton to the page. Repaired all 131 Twilio descriptions in the configured database, including seven older postings recovered from stored text.
- Split admin access into a dedicated sign-in page, protected workspace overview, and Jobs route with a shared sidebar. Verified local redirects, login, route access, and sign-out.
- Reworked the admin workspace into a distinct operations dashboard and Jobs control room with health metrics, quick actions, provider cards, sync history, responsive layouts, and accessible custom selectors for admin forms.

## 2026-10-21

- Updated package versions (`5487edb`).

## 2026-10-20

- Revised the site UI and page content across the public routes (`ebd4bf2`).
- Updated SEO-related site configuration and documentation (`c91c35e`).
- Refined colors and animation (`d05e5c5`).

## 2026-10-19

- Fixed a mobile responsiveness issue (`fd334e3`).

## 2026-10-25 - Free developer utility toolbox

Added an anonymous browser-only dashboard and six tools (JSON, JWT, cron, regex, Base64, API response formatting), exact-host routing for `utility.futurvion.in`, isolated layouts, search/category navigation, privacy information, canonical metadata, host-specific discovery, and a new-tab Works product link. No tool storage, authentication, payments, database changes, external processing, or ads. Existing site routes and admin checks are preserved under a URL-neutral route group. Domain/DNS/TLS activation remains a deployment task.
