# Authentication and authorization

The jobs portal adds a URL-only `/admin` login. `AdminUser` stores a scrypt password hash; `AdminSession` stores the SHA-256 hash of a random 32-byte opaque cookie token. Login applies a keyed per-email database attempt limit. Protected operations recheck the session, active account, and admin role. Mutations require a matching Origin. Logout revokes the session. No public admin registration exists; `scripts/bootstrap-admin.mjs` creates the first account only when explicitly run after migration. `scripts/rotate-admin-password.mjs` replaces its hash and revokes active sessions. This flow has not been verified against a live database.

The original contact and analytics POST APIs remain anonymous and protected by validation and rate limits, not admin authorization. Admin sessions do not expose lead or analytics records.

`components/analytics-consent.tsx` stores an `allow`/`deny` preference in browser `localStorage`. It also creates a random browser visitor ID and a short-lived session ID for analytics grouping. These values are not user identities, login sessions, or proof of consent to the server. The analytics API trusts a client-supplied `consent: true` field.

The contact form requires a contact-consent checkbox and persists `privacyConsent: true` after validation. This records an enquiry preference, not an authenticated account. No dashboard or API exposes stored leads or events to a visitor; operators must use external database tooling. Any future lead or analytics read API needs explicit authorization and tests before exposing that data.
