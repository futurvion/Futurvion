# Security

This describes implemented protections and known review items in the repository; it does not certify a deployment.

## Implemented controls

- `.gitignore` excludes `.env*` except `.env.example`, and the example contains placeholder values. `DATABASE_URL`, `ABUSE_HASH_SECRET`, and Resend settings are read in server-only modules or Node.js Route Handlers. Public site, booking, and search verification variables use `NEXT_PUBLIC_` and are browser-visible by design.
- `lib/validation.ts` validates contact and analytics JSON with Zod. Contact requires explicit contact consent, accepted service and budget values, and an empty honeypot; handlers reject obvious bot user agents. `lib/security.ts` applies database-backed limits of 5 contact and 120 analytics accepted attempts per key per hour.
- Raw request IPs are not placed in the application tables; `requestKey` HMACs the first `x-forwarded-for` value (or `unknown`) using `ABUSE_HASH_SECRET`. Analytics visitor and session UUIDs are HMACed before storage. The secret must be at least 32 characters.
- Prisma parameterizes database operations. React renders ordinary text safely; `components/json-ld.tsx` escapes `<` before inserting serialized JSON-LD into a script tag. External booking links use `rel="noopener noreferrer"`.
- `next.config.ts` removes `X-Powered-By` and sets `nosniff`, `DENY` frame policy, referrer policy, restrictive camera/microphone/geolocation permissions, and HSTS headers. No Content Security Policy is configured.
- The public site has no authenticated read endpoint for leads or analytics. The client collects analytics events only after an allow choice.

## Review items and limitations

- There is no login or role-based authorization. The analytics endpoint trusts the caller's `consent: true` field; the server cannot confirm a browser choice from that field alone. Do not expose private records without server-side access control.
- The first `x-forwarded-for` value is assumed to identify the client. Confirm the deployment proxy sets and sanitizes that header; otherwise rate limits may be bypassed or shared incorrectly. Count and insert are separate DB calls, so concurrent requests can exceed the nominal threshold.
- Body limits rely on the declared `content-length`; streaming/absent-header body sizes are not bounded by application code. Review host-level limits and add an enforced reader limit if abuse warrants it. Bot detection based on user-agent is only a heuristic.
- Email processing follows a lead insert without a transaction or delivery retry. A failed notification leaves stored contact information with `notificationSent = false`. Review operator access, failed-send handling, and data retention.
- There is no configured automated data deletion, CSP, application health endpoint, structured monitoring, or dependency audit gate in the repository. Browser/accessibility behavior and production headers have not been verified in a deployed environment.

## Operational handling

Provide real secrets through deployment environment settings, keep them server-only, and rotate them through the provider if exposed. Apply migrations with separate deployment privileges and use a limited runtime database role where feasible. Agree on retention before launch and align the privacy policy and actual deletion process. Do not log full enquiry payloads or place private data in public analytics responses.
