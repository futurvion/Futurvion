# API surface

The contact and analytics endpoints remain public `POST` Route Handlers. Jobs adds public read and protected admin APIs. Unsupported methods are handled by Next.js.

## Jobs API

`POST /api/jobs` is used by the `/jobs` page. It accepts a JSON object with bounded `q`, `company`, `location`, `workMode`, `employmentType`, `category`, `experienceLevel`, `source`, `postedWithin`, `salaryMin`/`salaryMax` with `salaryCurrency`, and `page` filters. Bodies over 4,096 bytes return 413. `GET /api/jobs` continues to accept the same filters as query parameters for existing API callers. Both return up to 12 unique listing groups per page with `{ jobs, total, page, pages, configured }`; invalid filters return 400. `GET /api/jobs/[slug]` returns public job details or 404. Internal IDs, content/grouping hashes, and raw provider payloads are excluded. A listing group matches normalized company, title and location; case and spacing are ignored, while different locations remain separate. Filters run before grouping, and totals/pages count matching groups rather than raw source postings. The representative is the most recently verified matching posting, with deterministic tie-breaking; every original job slug remains available through the detail route.

Job descriptions are plain text with paragraph breaks, `## ` heading markers, and `- ` list markers. The site converts those markers to safe headings and lists; API callers can use the same structure without rendering provider HTML.

`POST /api/admin/auth/login` verifies credentials and sets an HttpOnly session cookie. `POST /api/admin/auth/logout` revokes it; `GET /api/admin/auth/session` returns the signed-in email. Login has a five-attempt per-email limit over 15 minutes. `GET` and `POST /api/admin/providers`, `PATCH /api/admin/providers/[id]`, `GET` and `PATCH /api/admin/schedule`, and `GET` and `POST /api/admin/sync-runs` require an active admin session. Mutations also require a matching Origin. Provider creation/configuration changes require `permissionConfirmed: true`; the confirmation time is stored with non-secret configuration. Manual sync accepts an optional `providerId` UUID.

`POST /api/admin/sync-runs` processes a manual run during the request and returns its result with HTTP 200, or 409 if a run is already active; `GET /api/admin/sync-runs/[id]` returns stored run status. `POST /api/internal/jobs/sync` requires `Authorization: Bearer <JOB_SYNC_SECRET>` and processes a due scheduled run or any older queued run. No anonymous management endpoint is exposed.

## `POST /api/contact`

Purpose: accept a prospective client's enquiry and notify the configured inbox. Called by `features/contact/components/contact-form.tsx`. No query parameters. Request body is JSON:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "company": "Example Ltd",
  "phone": "",
  "service": "branding",
  "budget": "5k-15k",
  "description": "We need a clearer identity for our growing business.",
  "consent": "yes",
  "website": ""
}
```

Required: trimmed name (2–100 chars), valid email (up to 254 chars), service slug from `data/services.ts` or `not-sure`, description (20–5000 chars), and literal `consent: "yes"`. Optional: company (up to 120 chars), phone (up to 30 chars), budget (`""`, `under-5k`, `5k-15k`, `15k-50k`, `50k-plus`), and empty honeypot `website` (up to 100 chars). Extra JSON keys are not used. Authentication: none. A database-backed limit of five accepted attempts per pseudonymized request key per hour applies after payload and bot checks.

| Status | Response and condition |
| --- | --- |
| 200 | `{ "ok": true }` after lead insert, Resend acceptance, and `notificationSent` update. |
| 400 | `{ "message": "Invalid request." }` for malformed JSON; `{ "message": "Please check the required fields.", "errors": { ... } }` for Zod errors; `{ "message": "Unable to accept this enquiry." }` for honeypot or bot signature. |
| 413 | `{ "message": "Message is too long." }` if declared `content-length` exceeds 12,000 bytes. |
| 429 | `{ "message": "Too many enquiries. Please try again later." }` after the rate limit. |
| 502 | `{ "message": "We could not confirm delivery. Please contact us by email." }` if Resend does not accept the notification; the lead may already be stored. |
| 503 | Configuration missing: `{ "message": "The secure form is not configured. Please use the email link." }`; processing exception: `{ "message": "The form is temporarily unavailable. Please contact us by email." }`. |

The route requires `DATABASE_URL`, `ABUSE_HASH_SECRET`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL`. A failed or too-short HMAC secret is caught as a processing error. Client-side validation is advisory; the Zod check in the handler is authoritative.

## `POST /api/analytics`

Purpose: store opt-in interaction events. Called by `features/analytics/components/analytics-consent.tsx`. No query parameters. Example request:

```json
{
  "eventId": "7e7ac0d9-765e-4fd5-a38f-e3d7a760b22a",
  "type": "page_view",
  "path": "/services",
  "visitorId": "9e8d6b22-8431-4e47-b81a-0a1edc2c3941",
  "sessionId": "23907e04-693f-4d86-8d47-6fa03795fd94",
  "consent": true,
  "referrerCategory": "direct",
  "deviceCategory": "desktop"
}
```

Required: UUID `eventId`, `visitorId`, and `sessionId`; `type` in `page_view`, `service_cta`, `contact_conversion`; relative `path` beginning with a single `/`, at most 250 chars, without `?`; literal `consent: true`. Optional categories: referrer (`direct`, `search`, `social`, `external`, `internal`) and device (`desktop`, `tablet`, `mobile`). Authentication: none. Limit: 120 accepted attempts per request key per hour. The server HMACs visitor/session IDs before insertion, and `eventId` is unique.

| Status | Response and condition |
| --- | --- |
| 204, empty body | Stored event, duplicate `eventId`, missing configuration, bot signature, declared body above 2,000 bytes, or caught processing failure. The route intentionally does not reveal whether storage succeeded. |
| 400, empty body | Malformed JSON or invalid schema. |
| 429, empty body | Rate limit exceeded. |

`DATABASE_URL` and `ABUSE_HASH_SECRET` are required to store events. The consent flag is supplied by the client, so direct callers can assert it; it is not an identity or authorization control. No public analytics query endpoint exists.

## Server Actions

None are defined in the current repository.
