# Deployment

## Supported configuration evidenced by the repository

`README.md` describes Vercel deployment with a PostgreSQL provider and Resend. The repo has no `vercel.json`, infrastructure-as-code, CI pipeline, health endpoint, or verified production deployment record. The code itself uses the standard Next.js build/start scripts (`npm run build`, `npm run start`) and Node.js runtime for both POST APIs. Vercel is a documented intended platform, not a live environment verified by this task.

## Build and release procedure

1. Use Node.js 22.13.0 or newer with npm 10.9.4, pinned in `package.json` and CI. Install dependencies with `npm ci` from the committed lockfile; its `postinstall` runs `prisma generate`. CI validates the lockfile with the same reproducible install command.
2. Provision PostgreSQL and a Resend sending domain/inbox for the contact flow. Set production environment variables in the host, keeping server-only values private.
3. Apply the committed migration with `npm run db:deploy` against the intended database using migration privileges. Prefer a separate, limited runtime DB role.
4. Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`; deploy the build. `npm run start` serves the production build for a self-hosted process.
5. Set/verify the primary domain and canonical URL. `config/site.ts` defaults to `https://futurvion.in`; `NEXT_PUBLIC_SITE_URL` overrides it, with any leading `www.` removed. Requests to the matching `www` host receive a permanent redirect to the canonical host, preserving their path and query. `app/layout.tsx` emits `noindex` only when the configured URL ends in `.example`. Confirm sitemap, robots, canonical tags, and domain redirects on the live host.

Maintain packages according to [Dependency maintenance](./DEPENDENCIES.md): Dependabot proposes stable compatible patch/minor updates weekly, and dependency changes must pass the pull-request CI checks before merging.

The PR checks workflow runs lint, tests, type-checking, and the production build as separate parallel jobs. Each job installs dependencies independently; `fail-fast` is disabled so all four results are reported.

## Environment variable contract

Jobs also needs server-only `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` for one-time bootstrap, `AUTH_SECRET` for pseudonymous login limits, `APP_URL` for admin mutation origin checks, and `JOB_SYNC_SECRET` for external cron authorization. `DATABASE_URL_UNPOOLED` is an optional direct migration connection preferred by Prisma CLI when set; `.env` is loaded by `prisma.config.ts`. The jobs migration was applied to the configured Neon database on 2026-10-22. Configure a cron service to POST to `/api/internal/jobs/sync` with `Authorization: Bearer <JOB_SYNC_SECRET>` at an appropriate cadence after review. The sync currently runs within the request, so deployment timeouts and provider volume must be checked before enabling it. The admin route is deliberately absent from public navigation.

| Name | Exposure and purpose | Required for |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Browser-exposed canonical base URL; code has a default. | Correct metadata for a different domain. |
| `NEXT_PUBLIC_BUSINESS_EMAIL` | Browser-exposed public email link; code has a placeholder fallback. | Usable email fallback. |
| `NEXT_PUBLIC_BOOKING_URL` | Browser-exposed optional external booking CTA. | Booking link only. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Browser-exposed optional verification token. | HTML-token Search Console verification only. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Browser-exposed optional GA4 measurement ID (`G-...`). | GA4 after analytics consent. |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Browser-exposed optional Microsoft Clarity project ID. | Clarity after analytics consent. |
| `DATABASE_URL` | Server-only PostgreSQL connection. | Lead storage, analytics, and rate limiting. |
| `ABUSE_HASH_SECRET` | Server-only HMAC key of at least 32 characters. | Contact and analytics handlers. |
| `RESEND_API_KEY` | Server-only email provider key. | Contact notification. |
| `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Server-only notification destination and verified sender. | Contact notification. |

`.env.example` contains safe setup placeholders; actual `.env*` files are ignored. Without database and HMAC configuration, the first-party analytics handler returns 204 without storage. The consent interface is enabled when at least one third-party analytics ID or first-party analytics configuration is present. The contact handler returns 503 unless all contact configuration names are present. A configured key/URL still requires working external services and a migrated schema.

## Google Analytics 4 and Microsoft Clarity

The public App Router loads GA4 and Clarity asynchronously only after the visitor explicitly allows optional analytics. Their IDs are public browser configuration; do not put real IDs in source code or commit `.env.local`.

1. In Google Analytics, create a GA4 property and web data stream for the production site, then copy its Measurement ID (`G-...`). In Microsoft Clarity, create a project for the production site and copy its Project ID from **Settings > Setup**.
2. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `NEXT_PUBLIC_CLARITY_PROJECT_ID` in the local `.env.local` file as applicable. Add the same variables to the production hosting provider's environment settings for the correct deployment environment. Leave an unused integration blank.
3. In GA4, disable automatic page-view collection and the Enhanced Measurement option for page changes based on browser history. The app sends one manual page view per pathname, with query strings removed. This avoids initial and client-navigation duplicate page views.
4. In Clarity, enable Consent Mode (turn off cookie setting by default under **Settings > Setup**) so the site's Consent V2 signal governs cookie storage. Keep Balanced or stricter masking. Under **Settings > Masking**, mask `.contact-form` and `.resume-match`; the markup also sets `data-clarity-mask="True"` on both regions, which masks their content and descendants. Do not configure these selectors to be unmasked. Review recordings before launch because dashboard changes affect new recordings and are not retroactive.
5. Redeploy after changing either `NEXT_PUBLIC_*` value: Next.js inlines public environment values into the client build, so changing only the hosting settings does not update an already-built deployment.
6. To verify, test with a fresh browser profile/storage. Reject consent and confirm no requests go to `googletagmanager.com` or `clarity.ms`; then accept and check GA4 **Realtime/DebugView** plus Clarity **Recordings/Dashboard**. In browser DevTools, verify GA4 collection requests and Clarity POST requests to `https://www.clarity.ms/collect`. Review recordings for masked contact/resume sections and confirm the expected custom events.

The implemented event names are `contact_click`, `contact_submit`, `service_view`, `cta_click`, `job_search`, `job_filter`, `job_view`, `apply_click`, `resume_match_start`, and `resume_match_complete`. The event utility sends only fixed event names and limited categories/counts (for example search filter count, service slug, public job slug, and resume-match result count). Search text, resume files/text/filename, contact form values, and application destination URLs are not sent as custom event parameters. Page view tracking removes query strings. The privacy policy includes a control to change consent later. Verify jurisdiction-specific requirements and dashboard settings before launch; code-level checks do not prove that either provider receives live data.

## Checks and operations

After deploy, load the public routes including service/work details and 404, inspect `/robots.txt` and `/sitemap.xml`, check the configured headers, then submit a test enquiry and verify both the lead row and email. Test analytics with consent allowed and declined. Check mobile and reduced-motion rendering. These are deployment checks, not results already obtained.

Errors are currently written with `console.error`; retention, monitoring, alerting, backup/restore, health checks, and rollback steps are **not defined or verified** in code. Vercel's deployment history may provide rollback capability, but this repository does not configure or prove a rollback procedure. Define these operational controls before declaring production readiness.

## Developer toolbox custom domain (manual configuration still required)

1. Deploy this repository to the existing Next.js project. Keep `NEXT_PUBLIC_SITE_URL` set to the main studio origin, not the utility origin; toolbox canonical URLs are separately fixed at `https://utility.futurvion.in`. No toolbox environment variables or database migrations are needed. Existing studio/jobs service configuration remains applicable to those features.
2. On Vercel, open the **same project > Settings > Domains**, add `utility.futurvion.in`, and assign it to the intended production deployment. Configure it as a serving domain, not a redirect to the primary domain. In the DNS provider create a **CNAME** with name `utility`, using the exact target Vercel shows for this project (Vercel may assign a project-specific target; do not guess it). Remove conflicting records for that name, verify the domain, and wait for the TLS certificate to become active. The project-specific DNS target cannot be determined from repository files.
3. For self-hosting, create DNS pointing `utility.futurvion.in` to the existing ingress, provision TLS for that hostname, and route it to this same Next.js process. Preserve the original `Host` header. For nginx, the vhost should include `server_name utility.futurvion.in;`, the existing upstream via `proxy_pass`, and `proxy_set_header Host $host;`. Apply your normal TLS/security configuration. Do not rewrite utility paths in nginx; Next.js Proxy performs the application rewrite.
4. Verify `/` and all six `/tools/*` URLs without cookies, `/privacy`, utility canonical tags, `/robots.txt`, `/sitemap.xml`, and the Works new-tab link. Verify utility `/admin`, `/api/*`, and `/toolbox-internal/*` return 404. Main-domain `/tools/*` and `/toolbox-internal/*` must not expose the toolbox; main `/admin` and `/admin/jobs` must still require a valid session.
5. Keep advertisement slots disabled. Review hosting access-log retention separately: browser-local processing does not prevent routine infrastructure metadata collection. No DNS records, host project settings, TLS certificates, or live deployment were changed during implementation.

Local testing uses `http://utility.localhost:<port>`, with a hosts-file entry if needed. Normal `localhost` and preview deployment hostnames retain the studio site. For a preview of toolbox routing, use a local reverse proxy/Host mapping to the deployment while preserving `Host: utility.futurvion.in`; do not enable broad suffix checks or honor arbitrary forwarded-host values.

### Test on plain localhost

Stop any existing `next dev` process for this checkout, then run `npm run dev:tools` and open `http://localhost:3001`. The dashboard, `/privacy`, and all six `/tools/*` URLs work directly there, with no hosts-file changes. `127.0.0.1:3001` and `[::1]:3001` are also supported. Use `npm run dev` for the main website on its usual port. Run one development server per checkout because these commands share Next.js build output.

Port 3001 on these exact loopback hosts selects the toolbox **only in development**. Production and preview routing remain hostname-isolated; no environment variables, cookies, or persisted mode settings are added. Production-build testing can still use `utility.localhost:<port>` as documented above.
