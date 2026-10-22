# Architectural decisions

## Jobs portal persistence and scheduling

- **Date:** 2026-10-22.
- **Decision:** Extend the existing Prisma/PostgreSQL setup, store normalized jobs and admin sessions in new tables, and trigger sync through a secret-protected external cron request.
- **Reason:** Prisma was already deployed in this repository; a second ORM would duplicate schema and migrations. Next.js requests do not provide a persistent timer.
- **Trade-off:** Sync work currently occupies the request; large feeds need a durable worker and deployment timeout review. Provider data is displayed only after explicit configuration and a successful sync.
- **Status:** Implemented locally; migration and live integrations unverified.

This record separates current code choices from historical approval. Dates and alternatives are marked unknown where the repository does not establish them. `Accepted (observed)` means the approach is present in code; it does not claim a formal decision meeting occurred.

## Public App Router site with static content

- **Date:** Unknown.
- **Decision:** Use Next.js App Router pages backed by typed in-repository service and illustrative portfolio data.
- **Context/problem:** Present studio services and example approaches with navigable detail pages.
- **Chosen approach:** `app/` pages render `data/services.ts` and `data/portfolio.ts`; detail routes use `generateStaticParams` and `dynamicParams = false`.
- **Alternatives considered:** Unknown; no CMS selection record found.
- **Consequences/trade-offs:** Content changes require code and redeployment; only listed slugs are generated. Portfolio content must remain labeled illustrative until approved evidence replaces it.
- **Status:** Accepted (observed).

## Database-backed public submissions

- **Date:** Unknown; initial migration filename indicates 2026-10-16, which does not establish a decision date.
- **Decision:** Store leads, analytics events, and abuse attempts in PostgreSQL via Prisma.
- **Context/problem:** Persist enquiries and consented events and enforce request limits.
- **Chosen approach:** Three independent Prisma models, Node.js POST handlers, Zod validation, and Resend for contact notifications.
- **Alternatives considered:** Unknown.
- **Consequences/trade-offs:** Contact and analytics depend on a configured database. Contact email is outside a DB transaction; rate-limit count/create operations can race. There is no admin read UI or automated retention.
- **Status:** Accepted (observed).

## Browser opt-in analytics

- **Date:** Unknown.
- **Decision:** Collect a small event set only after a browser allow choice and pseudonymize grouping IDs on the server.
- **Context/problem:** Measure site usage while limiting directly identifying data.
- **Chosen approach:** `localStorage` choice and visitor ID, `sessionStorage` session ID, HMAC keys in the analytics handler, coarse referrer/device categories.
- **Alternatives considered:** Unknown.
- **Consequences/trade-offs:** Events are not sent before the browser choice; direct API clients can still self-assert consent. No dashboard is provided.
- **Status:** Accepted (observed).

## Shared documentation maintenance

- **Date:** 2026-10-22.
- **Decision:** Maintain root context files and focused `docs/` references, with real validation results in `TASKS.md` or the final task report.
- **Context/problem:** AI coding agents need current implementation and task status without repeatedly reconstructing the repository.
- **Chosen approach:** `AGENTS.md` defines the update workflow; `CLAUDE.md` imports it; domain documents describe source-backed behavior.
- **Alternatives considered:** A separate testing document was explicitly excluded by the project owner.
- **Consequences/trade-offs:** Future work must update only affected documents and keep status claims tied to verification; documentation can still drift if this workflow is skipped.
- **Status:** Accepted.
