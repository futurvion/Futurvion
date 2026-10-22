# API surface

Both custom endpoints are public `POST` Route Handlers using the Node.js runtime. There is no login, role check, Server Action, or authenticated read API. The current source of truth is `app/api/contact/route.ts`, `app/api/analytics/route.ts`, `lib/validation.ts`, `lib/security.ts`, `lib/db.ts`, and `lib/email.ts`. Unsupported methods are handled by Next.js. `app/robots.ts` and `app/sitemap.ts` generate public metadata routes (`/robots.txt`, `/sitemap.xml`), not application JSON endpoints.

## `POST /api/contact`

Purpose: accept a prospective client's enquiry and notify the configured inbox. Called by `components/contact-form.tsx`. No query parameters. Request body is JSON:

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

Purpose: store opt-in interaction events. Called by `components/analytics-consent.tsx`. No query parameters. Example request:

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
