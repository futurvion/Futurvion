# Futurvion design system

The public site retains the original animated 3D particle-logo hero at the owner's request, with a typography-led design for the remaining sections: direct language, a confident full-width opening, and connected brand, experience, and systems expertise. Keep the existing full logo. Portfolio entries are illustrative concepts, never client proof.

## Direction and resources

- Taste Skill: **Type and nothing else**, seed `1466014606`, with the existing palette and type retained. No redraws. Resolve the dealt cropped-word hero against the direction's higher-priority two-line, readable statement: the first screen must explain the studio and provide a contact action.
- Idea: Futurvion's promise of connected brand, digital experience, and systems becomes a capability index and a business-priority selector. The selector carries a real service slug into the existing contact workflow.
- Awesome Design: the [collection's Runway entry](https://github.com/VoltAgent/awesome-design-md/) and its [public reference](https://getdesign.md/runwayml/design-md) informed editorial hierarchy and alternating colour fields. The full downloadable analysis was not available in the fetched page; this is an adaptation of the public reference, not a claim to have loaded its complete token system.
- Web Design Guidelines: review against the [current source](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md), focusing on semantic controls, focus, required fields, responsive layout, live feedback, and reduced motion.
- Playwright CLI: installed help and skill reviewed; actual development and production browser checks recorded in TASKS.md.
- Image to Code: [official instructions](https://github.com/Leonxlnx/taste-skill/blob/main/skills/image-to-code-skill/SKILL.md) inspected. Not installed or applied: no supplied reference image, and the user's explicit instruction not to invent one takes precedence over that resource's image-generation-first requirement.

## Tokens and layout

`config/palette.ts` remains the palette source. Paper `#f4f6f3`, white surfaces, field `#e2eae7`, deep blue `#102e3b`, ink `#172b38`, accent `#175d78`, and white text on accent. The aliases in `app/redesign.css` reference these tokens. Concept title studies have their own flat colours as content artwork.

Space Grotesk carries headings; Inter carries body and controls. Two families only. Headings use one colour, no italic accent words. Body copy is at least 16px; supporting labels generally 14px. Mobile inputs use 16px to avoid focus zoom. Keep headings concise and balanced. Long provider job titles may wrap naturally; do not truncate job information to satisfy a visual rule.

Use the existing `siteStyles.container`: equal margins, 1240px maximum, 18px mobile gutters. Public sections use the existing responsive spacing primitives. Use full-width colour fields and varied compositions rather than decorative lines, gradients, shadows, or repeated icon cards. Forms and operational interfaces retain useful boundaries.

Buttons are rectangular, flat, at least 52px high, and use shared `siteStyles`. Primary actions have explicit on-accent text. Text links are underlined. Filters expose pressed state. Form labels remain associated with their fields. Native browser validation runs before the unchanged server validation.

## Components and behavior

- `PageHero`: readable title, supporting content, then page context. No decorative rings.
- `ProjectStartingPoint`: three business priorities, announced recommendation, real service/contact links; default recommendation and links render on the server too.
- `ConceptArtwork`: reusable original typographic title studies, hidden from assistive technology because their titles are repeated in the accompanying text. They are used on the homepage, filtered portfolio and concept details. No stock or generated photographs, third-party media, invented metrics, or invented client evidence were added.
- Header: existing full logo, active links, accessible mobile toggle, Escape focus return, keyboard containment, background inertness and scroll restoration. Mobile closes at the actual 850px layout breakpoint.
- Contact: payload, endpoint, consent and honeypot remain unchanged. Required fields use native validation; async messages retain status/alert semantics and an email fallback.
- Jobs: keep real data, filters, pagination, loading/error/empty states, attribution and original application links. Admin stays a separate operations interface; no authentication or operational action changes.
- Motion: public details enter completely from beyond the left/right viewport edge, selected from their layout position. JavaScript alone marks pending items hidden; the observer measures their untransformed layout and starts the offscreen-to-rest entrance when they enter view. Staggers remain capped at 280ms. Heading, row, artwork, card, panel and disclosure variants keep different durations/settles. Main content clips horizontal motion without introducing a scroll container, preserving the sticky story. Focus cancels pending/active motion; reduced motion, no JavaScript and printing expose the content immediately. Parent/child double-animation is avoided. The original 3D hero owns its animation independently; admin remains excluded. The older Connected capabilities scroll story stays unmounted.

## Review and limitations

Taste's browser inspector cannot execute under the installed Node 20 runtime (requires Node 22 built-in WebSocket). Its source lint was run and flags legacy CSS, data numbering and operational UI; a zero-failure Taste certification is not claimed. Playwright measurements and screenshots provide the actual layout review. The brand logo retains its supplied gradient as a brand exception. No photo floor was fabricated just to pass a style heuristic.

ROUND 2
Seen in one second: a digital studio with a clear contact action.
Idea (one sentence): connect Futurvion's capabilities to the visitor's business priority.
Live thing: business-priority selector with real service preselection.
Layout words by section: hero=type statement / intro=inverted split / capabilities=index / work=title studies / priorities=interactive split / process=stepped list / FAQ=disclosures / close=colour field / footer=compact invitation, logo and navigation.
Scores (self-review): design 6.5 · usability 8 · creativity 6.5 · content 8 → overall 7.1.
Caps applied: fewer than four real pictures; the identity still relies on type and palette more than uniquely owned media.
Top three problems and fixes:
1. Normal-motion full-page captures showed blank offscreen content (`final-service.png`); change pending reveals to remain visible, with transform-only entrances.
2. Secondary pages repeated small context labels above headings (route review sheets); remove redundant labels and index numbers from public markup.
3. The mobile overlay allowed focus into underlying content; make main/footer inert while open, contain keyboard navigation and restore focus on Escape.

Remaining: real, permission-backed studio/project imagery could give the work more identity. Protected admin visuals and real email delivery were not exercised in this redesign. The portfolio remains intentionally illustrative.

Owner preference (2026-10-25): retain the original 3D particle-logo scene and its existing hero composition. Its original motion, orbit treatment, WebGL detection and static/reduced-motion fallback take precedence over the typography-only hero direction.

Owner clarification (2026-10-25): only change slide-in animations; do not restore the Connected capabilities scroll story. Keep the original 3D hero and full side entrances across public details. This supersedes the earlier always-visible pending-animation convention.

Footer update (2026-10-25): use a compact invitation above a three-column desktop layout, the original full logo, grouped navigation, email and Instagram @futurvion. Remove the oversized decorative wordmark. Stack the invitation and brand above two link columns on mobile; keep visible focus and touch targets. Social URLs live in config/site.ts and populate both footer links and existing organization structured data.

Jobs motion exception (2026-10-25): jobs listing and job-detail pages use only a quick 200ms upward settle of 6px, including their shared footer. Pending job content stays visible; there is no opacity change, horizontal movement, scaling or stagger. Other public pages retain the full side entrances. Reduced-motion and focus cancellation still apply.

Header destination visuals (2026-10-25): use page-specific right-side material in opening sections: linked capability strips, business starting points, illustrative concept covers, studio identity, enquiry prompts and a static careers panel. Stack these below the copy on narrow screens. Services, Solutions, Work, About and Contact use a short staggered entrance; respect reduced motion and exclude these panels from generic content reveals. The homepage Process section has a compact four-stage panel; the original homepage 3D hero remains intact.

Process refinement (2026-10-25): the homepage now combines its introduction and four explained stages into a single split composition. A dark left panel carries the heading and contact link; the right side presents numbered stages in order. Stack at 900px and keep the original side entrance behavior. This replaces the earlier duplicate four-stage preview on the homepage.

## Developer toolbox

The toolbox uses Taste's app-screen Framed sheet direction (seed 1239368644), retaining the studio's Space Grotesk/Inter type and teal accent. A pale blue-grey L-frame holds a 228px directory sidebar and a white, 16px-radius sheet inset 8px; on phones the sidebar disappears and the sheet becomes the screen. The primary question is "Which utility do I need?", answered by six searchable cards; tool pages prioritize paired input/output panels. Real tool names, category counts, local samples, and current output replace invented metrics. The existing Futurvion logo mark identifies the shell. No direction redraws, stock imagery, or charts were required. The user-required headline is retained even where it exceeds the app-screen heading length recommendation.

Inventory: six owned utilities; JSON bodies; unverified JWT claims; numeric five-field cron; terminable JavaScript regex; Unicode Base64 text; manually supplied HTTP metadata; free direct URLs; ephemeral state; existing studio branding; disabled ad placements. These working materials are the product-specific visual content. Browser screenshots reviewed at desktop and mobile with tablet overflow checks. Self-review: clear hierarchy, restrained brand, direct actions, consistent forms; main remaining limitation is a manual accessibility/assistive-technology audit and deployed review. No Taste zero-failure certification is claimed.

The automated Taste browser inspector was attempted but cannot run with installed Node 20 (it requires Node 22 built-in WebSocket). Actual Chrome verification used the repository Playwright CLI instead, including screenshots at 1440, 768, and 390px.


Resume matching (2026-10-26): a single section on the existing jobs page follows the shared palette/type/container/buttons. It uses a labeled native file input, explicit start/clear actions, optional location/mode fields, live processing/error/success text, and the existing job-card/application flow. Scores are labeled as estimates; stretch evidence is visible. Browser review checked desktop/tablet/390/320px, clear/refresh, and actual synthetic uploads. The Taste inspector still flags the existing shared skip-link contrast and the existing jobs hero/list layout; this feature does not claim a zero-failure whole-page design certification.

Nearby discovery (2026-10-26): the existing jobs filter form gains one fieldset with city lookup, optional browser location, radius, clear action and readable status/errors. It keeps the shared controls, flat palette and native keyboard interaction; selecting a city returns focus to the radius control. Distances and the matched city are visible on ordinary job cards. Desktop/tablet/390/320px browser checks and screenshots found no horizontal overflow. Existing whole-page Taste findings (skip link, consent overlay and inherited hero/list composition) remain outside this feature's scope; no whole-page zero-failure certification is claimed.
