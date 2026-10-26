# Architectural decisions

## Jobs portal persistence and scheduling

- **Date:** 2026-10-22.
- **Decision:** Extend the existing Prisma/PostgreSQL setup, store normalized jobs and admin sessions in new tables, and trigger sync through a secret-protected external cron request.
- **Reason:** Prisma was already deployed in this repository; a second ORM would duplicate schema and migrations. Next.js requests do not provide a persistent timer.
- **Trade-off:** Manual and scheduled sync work occupy their requests; large feeds need a durable worker and deployment timeout review. Provider data is displayed only after explicit configuration and a successful sync.
- **Status:** Implemented locally; migrations applied to the configured Neon database on 2026-10-22. The first live sync inserted 297 real jobs from Remotive, two Greenhouse boards, and one Lever site. Deployed scheduling remains unverified.

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

## Group matching listings without deleting source requisitions

- **Date:** 2026-10-25.
- **Decision:** At the owner's confirmed preference, public discovery shows one card per normalized company/title/location, while all source records and URLs remain intact.
- **Evidence:** The six repeated-title/location groups in the initial 297-row database contain different Greenhouse requisition IDs. Deleting by title would remove real openings. Grouping produces 287 cards without deleting those records.
- **Implementation:** Database-triggered grouping key, parameterized filtered/ranked listing queries and a stable ID tie-breaker. Filters apply before grouping so a matching provider/salary/employment variant is still discoverable.
- **Trade-off:** Only the chosen matching source posting appears as the card; other requisitions remain available through their original detail URLs. Different location wording is not semantically inferred. Existing source-expiry policy is unchanged.

## Isolate the free toolbox by hostname and layout

- **Date:** 2026-10-25.
- **Decision:** Serve the public, browser-only toolbox from the exact utility hostname with a narrow proxy rewrite and an isolated layout. Keep existing pages in a URL-neutral route group, with their analytics and admin checks unchanged.
- **Reason:** A folder does not create a subdomain, and a shared public layout would mount the studio's persistent consent/analytics behavior in anonymous tool workspaces. Separate layouts preserve static page rendering without a request-time host lookup in every root render.
- **Trade-offs:** Hosting must map the custom domain to the same deployment. The internal route namespace is intentionally blocked externally. Cron validation covers a documented numeric five-field subset and makes no next-run/calendar feasibility claims. Regex safety uses worker termination rather than restricting legitimate JavaScript pattern syntax.
- **Status:** Implemented and verified locally; DNS, TLS, custom-domain assignment, and deployed checks remain manual.


## Temporary, deterministic resume matching

- Date: 2026-10-26.
- Decision: Parse PDF/DOCX in a terminated Node worker, extract conservative typed evidence without an LLM, retrieve a bounded PostgreSQL full-text shortlist, and rank deterministically with the requested 30/10/20/20/15/5 skill/role/experience/description/qualification weights.
- Reason: The repository has a unified job catalogue and no configured AI/embedding provider with reviewed retention settings. This approach works without transmitting resumes to another service or introducing candidate persistence.
- Trade-offs: Skill vocabulary, role aliases, employment-date interpretation, and explicit requirement parsing have limited coverage. Unknowns remain unknown; estimates are not calibrated hiring probabilities. Semantic matching/pgvector is deferred behind the CandidateRetriever boundary, with no unused vector columns or provider secrets.
- Status: Implemented; additive migration applied; synthetic parsing/API/browser checks and local production build verified. Deployment controls and large-catalogue quality/load verification remain open.
