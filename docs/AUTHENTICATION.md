# Authentication and authorization

The current public marketing site has **no login, logout, account creation, identity provider, password store, session cookie, JWT, role model, or protected route**. `package.json`, `app/`, and `prisma/schema.prisma` contain no authentication implementation or `User` table. Both custom POST APIs accept anonymous requests and protect themselves through validation and rate limits, not authorization.

`components/analytics-consent.tsx` stores an `allow`/`deny` preference in browser `localStorage`. It also creates a random browser visitor ID and a short-lived session ID for analytics grouping. These values are not user identities, login sessions, or proof of consent to the server. The analytics API trusts a client-supplied `consent: true` field.

The contact form requires a contact-consent checkbox and persists `privacyConsent: true` after validation. This records an enquiry preference, not an authenticated account. No dashboard or API exposes stored leads or events to a visitor; operators must use external database tooling. If a future private read/admin feature is approved, it needs an explicit identity provider, server-side authorization, and tests before exposing data.
