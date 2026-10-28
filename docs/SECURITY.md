# Security

This describes implemented protections and known review items in the repository; it does not certify a deployment.

## Implemented controls

- `.gitignore` excludes `.env*` except `.env.example`, and the example contains placeholder values. `DATABASE_URL`, `ABUSE_HASH_SECRET`, and Resend settings are read in server-only modules or Node.js Route Handlers. Public site, booking, and search verification variables use `NEXT_PUBLIC_` and are browser-visible by design.
- `lib/validation.ts` validates contact and analytics JSON with Zod. Contact requires explicit contact consent, accepted service and budget values, and an empty honeypot; handlers reject obvious bot user agents. `lib/security.ts` applies database-backed limits of 5 contact and 120 analytics accepted attempts per key per hour.
- Raw request IPs are not placed in the application tables; `requestKey` HMACs the first `x-forwarded-for` value (or `unknown`) using `ABUSE_HASH_SECRET`. Analytics visitor and session UUIDs are HMACed before storage. The secret must be at least 32 characters.
- Prisma parameterizes database operations. React renders ordinary text safely; `components/shared/json-ld.tsx` escapes `<` before inserting serialized JSON-LD into a script tag. External booking links use `rel="noopener noreferrer"`.
- `next.config.ts` removes `X-Powered-By` and sets `nosniff`, `DENY` frame policy, referrer policy, restrictive camera/microphone/geolocation permissions, and HSTS headers. No Content Security Policy is configured.
- The public site has no authenticated read endpoint for leads or analytics. Browser analytics events and third-party scripts are enabled only after an explicit allow choice; GA4 ad storage/signals remain denied. Contact and resume-matching DOM regions use Clarity's `data-clarity-mask` attribute.

## Review items and limitations

- `/admin` and `/admin/jobs` redirect to `/admin/login` without a valid database-backed session. Each admin page checks the session before reading private data; admin APIs keep their own checks. Mutations also check Origin against `APP_URL`. The admin cookie is HttpOnly, SameSite Strict, and Secure in production. Tokens are hashed in PostgreSQL. Login has a per-email attempt limit. Configure `APP_URL` precisely and use HTTPS in production. Local request checks covered login, protected routes, and sign-out; deployed authentication and browser testing remain open.
- Provider job HTML, including entity-escaped Greenhouse markup, is parsed into heading, paragraph, and list text before storage. The detail page renders those blocks as React text, without inserting source HTML. Application links require HTTP(S) and disallow embedded credentials. Provider identifiers are validated; URL hosts are fixed by adapter. The scheduler endpoint compares a bearer secret. Long sync requests require adequate hosting timeouts or a durable worker before high-volume deployment.

- The analytics endpoint trusts the caller's `consent: true` field; the server cannot confirm a browser choice from that field alone. Admin authorization does not grant analytics or lead reads.
- The optional GA4 and Clarity integrations run in the browser after opt-in. The operator must configure GA4 to avoid automatic/history page views overlapping the path-only manual page views, enable Clarity Consent Mode in the dashboard, and confirm the masked regions in recordings before launch. The site code does not verify external dashboard settings or live receipt.
- The first `x-forwarded-for` value is assumed to identify the client. Confirm the deployment proxy sets and sanitizes that header; otherwise rate limits may be bypassed or shared incorrectly. Count and insert are separate DB calls, so concurrent requests can exceed the nominal threshold.
- Body limits rely on the declared `content-length`; streaming/absent-header body sizes are not bounded by application code. Review host-level limits and add an enforced reader limit if abuse warrants it. Bot detection based on user-agent is only a heuristic.
- Email processing follows a lead insert without a transaction or delivery retry. A failed notification leaves stored contact information with `notificationSent = false`. Review operator access, failed-send handling, and data retention.
- There is no configured automated data deletion, CSP, application health endpoint, structured monitoring, or dependency audit gate in the repository. Browser/accessibility behavior and production headers have not been verified in a deployed environment.

## Operational handling

Provide real secrets through deployment environment settings, keep them server-only, and rotate them through the provider if exposed. Apply migrations with separate deployment privileges and use a limited runtime database role where feasible. Agree on retention before launch and align the privacy policy and actual deletion process. Do not log full enquiry payloads or place private data in public analytics responses.

## Public toolbox boundary

The developer toolbox is public without authentication. No accounts, sessions, payments, login secrets, user tables, or database changes were added for it. Existing jobs/admin authorization remains enforced independently on the main site. The hostname proxy is an allowlist for toolbox pages, not a bypass around main-site session checks: admin and every API are denied on the utility hostname. Main-site internal toolbox paths are denied as well. Platform ingress must preserve and validate the actual Host header and must not expose alternate direct origins that bypass Next.js Proxy.

Tool content stays in React state and a short-lived regex worker; it is not sent to an endpoint, logged, or stored in URLs/cookies/browser storage. Page lifecycle reset also clears content on back-forward cache restoration. Copy is an explicit system clipboard write, whose retention is outside the app. JWT decoding never verifies signatures. Regex runs in a terminable worker with bounded sizes and matches. JSON parse errors use generic guidance to avoid echoing sensitive snippets. Ordinary hosting metadata remains subject to infrastructure policies; no absolute anonymity is promised. No analytics or ad scripts are mounted in the utility shell.
