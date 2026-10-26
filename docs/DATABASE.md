# Database

## Engine and access

The schema in `prisma/schema.prisma` and committed SQL migrations define PostgreSQL tables. Prisma 7 is generated into ignored `generated/prisma/`; `lib/db.ts` creates a `PrismaClient` with `@prisma/adapter-pg` only when `DATABASE_URL` exists and reuses it through a global variable. The jobs models add foreign keys and unique provider/job identity. Both migrations were applied to the configured Neon database on 2026-10-22. Four providers were added and a live sync inserted 297 jobs; public listing and detail reads were verified against those rows.

`prisma/migrations/20261022090000_jobs_portal/migration.sql` adds `JobProvider`, `Job`, `JobSyncRun`, `JobSyncSettings`, `AdminUser`, and `AdminSession`. It includes source identity and slug uniqueness, filter indexes, valid status/work mode and salary checks, and a partial unique index permitting only one running sync. Admin sessions store hashes of random tokens. The migration creates no admin credentials; `scripts/bootstrap-admin.mjs` provisions one separately when explicitly run.

On 2026-10-23, 124 existing Twilio job descriptions in the configured database were updated from their current Greenhouse feed after entity-escaped HTML was found in the stored text. Seven older Twilio rows were absent from that feed; their stored legacy text was cleaned into readable sections and lists after a reviewed preview, with a local backup retained for rollback. All 131 Twilio descriptions now use the structured text format. These targeted backfills did not update job content hashes, so the next provider sync will reconcile hashes and other source fields for jobs still in the feed. The seven unavailable postings remain under the normal sync/expiration policy.

Prisma `String` maps to `TEXT`, `DateTime` to `TIMESTAMP(3)`, and `Boolean` to `BOOLEAN` in the migration. IDs are generated with `cuid()` by Prisma; database default for ID is not in the SQL migration.

## Tables and columns

| Table | Columns (type; constraints/defaults) | Indexes |
| --- | --- | --- |
| `Lead` | `id` TEXT primary key; `createdAt` TIMESTAMP(3) required default now; `name`, `email`, `service`, `description` TEXT required; `company`, `phone`, `budget` TEXT nullable; `privacyConsent` BOOLEAN required; `notificationSent` BOOLEAN required default false. | `createdAt` |
| `AnalyticsEvent` | `id` TEXT primary key; `eventId` TEXT required unique; `createdAt` TIMESTAMP(3) required default now; `type`, `path`, `visitorKey`, `sessionKey` TEXT required; `referrerCategory`, `deviceCategory` TEXT nullable; `consent` BOOLEAN required. | Unique `eventId`; `(createdAt, type)`, `(visitorKey, createdAt)`, `(sessionKey, createdAt)`, `(path, createdAt)` |
| `AbuseAttempt` | `id` TEXT primary key; `key`, `kind` TEXT required; `createdAt` TIMESTAMP(3) required default now. | `(key, kind, createdAt)`, `createdAt` |

There is no relation between the original three tables. The accepted event types, categories, contact budget values, and service slugs are application-level Zod constraints in `lib/validation.ts`, not database enums or CHECK constraints. `privacyConsent` and `consent` record `true` from validated submissions; the schema itself permits either Boolean value.

## Writes, ownership, and transactions

- The public jobs listing runs grouped page-ID and distinct-group count reads concurrently without a transaction, then hydrates only the selected public records. This retains the existing cold-connection transaction workaround. Synchronization looks up existing job hashes once per batch and keeps transactional upsert batches with a longer acquisition and execution timeout.
- `POST /api/contact` inserts a lead, calls Resend, and updates `notificationSent` after a successful send. It does not wrap email and database operations in a transaction; a failed email can leave an unsent lead. Leads contain personal contact and project information.
- `POST /api/analytics` inserts consented events. Raw visitor/session UUIDs are HMACed before storage; path and coarse categories are stored directly. `eventId` prevents duplicate inserts.
- `lib/security.ts` counts matching `AbuseAttempt` rows within a time window, then inserts another row. These are separate queries and can race under concurrent traffic. The index supports the `(key, kind, createdAt)` lookup; there is no automatic expiry.

## Migration and retention

`npm install` runs `prisma generate`; `npm run db:deploy` runs `prisma migrate deploy` against `DATABASE_URL_UNPOOLED` when set, otherwise `DATABASE_URL`. Prisma config loads `.env` with `dotenv`. The repository contains the initial, jobs portal and listing-group migrations, plus a separate one-time admin bootstrap script. Use a migration-capable credential for deployment and a limited runtime database role where possible. Never run a reset against valuable data. There is no automated retention job; `README.md` contains suggested deletion SQL, and the actual retention policy is pending operator approval. Database size, query plans, and production performance are **not verified**.

## Job listing groups (2026-10-25)

`20261025090000_job_listing_groups` adds `Job.listingKey` and its `(status, listingKey)` index. The database function hashes a JSON array of normalized company, title and location using SHA-256: lowercase, collapsed whitespace, trimmed edges, with missing/empty locations treated alike. Different locations remain separate. A BEFORE INSERT OR UPDATE trigger recalculates the key on every write, including existing sync upserts and direct imports; callers cannot leave a stale or empty grouping key. The Prisma default allows the database trigger to supply it. This is intentionally an index, not a unique constraint: distinct source postings/requisitions must remain stored.

The connected database migration was applied and verified on 2026-10-25: all 297 source rows and existing fields/deep links were preserved by a JSON row fingerprint check (excluding the new key). They produce 287 active listing groups, removing ten repeated cards across six groups. A transaction preview additionally verified equivalent case/spacing, key correction on update and separate locations, then rolled back without changing stored data.

Public queries filter active source records first, group before pagination, and select the most recently verified matching posting, then publication/creation time and ID for deterministic ties. Listing totals count groups. Every old slug continues to resolve to its own source record, and internal keys are excluded from both listing and detail APIs. Provider identity uniqueness, sync permissions, the 14-day default missing-posting grace period and source retention remain unchanged. Apply the migration before releasing the new backend query code.


## Resume matching uses public job data only

Migration 20261026100000_job_full_text was applied to the configured Neon database on 2026-10-26. It adds Job.requiredSkills/preferredSkills/qualifications arrays, nullable experienceMinMonths/experienceMaxMonths, experienceMandatory, and a tsvector searchDocument. No candidate, resume, embedding, or match-result table is added.

A BEFORE INSERT/content-update trigger builds the weighted document: A for title and required skills, B for company/category/preferred skills, D for requirements and description. The migration populates the existing catalogue and creates a GIN searchDocument index, GIN requiredSkills array index, and B-tree status/expiry and status/minimum-experience indexes. Existing listingKey grouping and source/external-ID upserts remain in use. Structured metadata is refreshed by normal ingestion, including unchanged provider records.

Matching uses websearch_to_tsquery and ts_rank_cd with parameterized values, active/nonexpired predicates, optional location/mode filters, canonical grouping before LIMIT, and a 100-job shortlist. No candidate embeddings exist. Only pseudonymous key/kind/time abuse attempts are written by a matching request, using a transaction advisory lock to serialize per-caller rate limits.

Validation found all 297 existing jobs indexed and all four new indexes present. A representative broad full-text query on that small catalogue took 1.873 ms server execution (EXPLAIN ANALYZE BUFFERS); PostgreSQL chose a sequential scan for its broad selectivity. This does not establish performance at 100,000 jobs. Network/cold-start time is separate from database execution.

## Public job city locations (2026-10-26)

Migration 20261026120000_job_locations adds JobLocation, related to Job by a cascading jobId foreign key. It stores a public cityKey, city, region, ISO country, latitude and longitude. A unique (jobId, cityKey) index prevents repeated locations; a B-tree (latitude, longitude) index supports the bounding-box stage before exact great-circle filtering. Coordinate constraints reject out-of-range values. No visitor-origin or location-history table is added.

Sync derives only unambiguous city centres from provider location text and refreshes children within its existing upsert transaction, including unchanged source records. Multiple listed cities receive separate rows. A source location/country/work-mode change invalidates previous derived rows through an AFTER UPDATE trigger, preventing stale coordinates from surviving direct source edits. Ordinary sync recreates the correct rows; the backfill CLI can rebuild existing records.

The migration and backfill were applied to the configured Neon database: all 297 original Job rows were preserved (full-row aggregate fingerprint unchanged), 139 jobs received 224 city entries. Remote-only and unresolved/ambiguous labels remain without city coordinates. They are retained in ordinary discovery.

Nearby SQL uses indexed latitude/longitude bounds (including date-line wrapping and polar handling), clamped Haversine distance, explicit active/expiry checks, grouping before pagination, and stable ordering. Values stay parameterized, with statement/transaction deadlines. This does not require PostGIS. Tests against PostgreSQL covered radius inclusion/exclusion, nearest-first order, duplicates, remote/expired/inactive/unresolved jobs, multiple offices, date-line/polar cases, and a rolled-back nested source-location update.
