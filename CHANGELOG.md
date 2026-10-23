# Changelog

Only changes supported by the repository or Git history are listed. Unreleased entries describe working-tree changes.

## Unreleased

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
