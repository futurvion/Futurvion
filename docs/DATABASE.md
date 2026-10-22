# Database

## Engine and access

The schema in `prisma/schema.prisma` and committed SQL migrations define PostgreSQL tables. Prisma 7 is generated into ignored `generated/prisma/`; `lib/db.ts` creates a `PrismaClient` with `@prisma/adapter-pg` only when `DATABASE_URL` exists and reuses it through a global variable. The jobs models add foreign keys and unique provider/job identity. Both migrations were applied to the configured Neon database on 2026-10-22; live application queries remain unverified.

`prisma/migrations/20261022090000_jobs_portal/migration.sql` adds `JobProvider`, `Job`, `JobSyncRun`, `JobSyncSettings`, `AdminUser`, and `AdminSession`. It includes source identity and slug uniqueness, filter indexes, valid status/work mode and salary checks, and a partial unique index permitting only one running sync. Admin sessions store hashes of random tokens. The migration creates no admin credentials; `scripts/bootstrap-admin.mjs` provisions one separately when explicitly run.

Prisma `String` maps to `TEXT`, `DateTime` to `TIMESTAMP(3)`, and `Boolean` to `BOOLEAN` in the migration. IDs are generated with `cuid()` by Prisma; database default for ID is not in the SQL migration.

## Tables and columns

| Table | Columns (type; constraints/defaults) | Indexes |
| --- | --- | --- |
| `Lead` | `id` TEXT primary key; `createdAt` TIMESTAMP(3) required default now; `name`, `email`, `service`, `description` TEXT required; `company`, `phone`, `budget` TEXT nullable; `privacyConsent` BOOLEAN required; `notificationSent` BOOLEAN required default false. | `createdAt` |
| `AnalyticsEvent` | `id` TEXT primary key; `eventId` TEXT required unique; `createdAt` TIMESTAMP(3) required default now; `type`, `path`, `visitorKey`, `sessionKey` TEXT required; `referrerCategory`, `deviceCategory` TEXT nullable; `consent` BOOLEAN required. | Unique `eventId`; `(createdAt, type)`, `(visitorKey, createdAt)`, `(sessionKey, createdAt)`, `(path, createdAt)` |
| `AbuseAttempt` | `id` TEXT primary key; `key`, `kind` TEXT required; `createdAt` TIMESTAMP(3) required default now. | `(key, kind, createdAt)`, `createdAt` |

There is no relation between the original three tables. The accepted event types, categories, contact budget values, and service slugs are application-level Zod constraints in `lib/validation.ts`, not database enums or CHECK constraints. `privacyConsent` and `consent` record `true` from validated submissions; the schema itself permits either Boolean value.

## Writes, ownership, and transactions

- `POST /api/contact` inserts a lead, calls Resend, and updates `notificationSent` after a successful send. It does not wrap email and database operations in a transaction; a failed email can leave an unsent lead. Leads contain personal contact and project information.
- `POST /api/analytics` inserts consented events. Raw visitor/session UUIDs are HMACed before storage; path and coarse categories are stored directly. `eventId` prevents duplicate inserts.
- `lib/security.ts` counts matching `AbuseAttempt` rows within a time window, then inserts another row. These are separate queries and can race under concurrent traffic. The index supports the `(key, kind, createdAt)` lookup; there is no automatic expiry.

## Migration and retention

`npm install` runs `prisma generate`; `npm run db:deploy` runs `prisma migrate deploy` against `DATABASE_URL_UNPOOLED` when set, otherwise `DATABASE_URL`. Prisma config loads `.env` with `dotenv`. The repository contains the initial migration and the new jobs migration, plus a separate one-time admin bootstrap script. Use a migration-capable credential for deployment and a limited runtime database role where possible. Never run a reset against valuable data. There is no automated retention job; `README.md` contains suggested deletion SQL, and the actual retention policy is pending operator approval. Database size, query plans, and production performance are **not verified**.
