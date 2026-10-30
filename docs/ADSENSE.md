# Google AdSense

## Current behavior and safety gates

AdSense is disabled by default. The application loads Google’s official
AdSense script only within the `/blog` route segment and only when all of the
following are true:

- `NEXT_PUBLIC_ADSENSE_ENABLED=true`
- A publisher ID is configured
- `NEXT_PUBLIC_ADSENSE_CONSENT_READY=true`
- A placement has a slot ID and is enabled

`NEXT_PUBLIC_ADSENSE_CONSENT_READY` is an operator-controlled deployment
guard, not a CMP and not proof of consent. Set it to `true` only after a
Google-certified CMP or another currently approved consent integration is
configured and tested for the jurisdictions you serve. The existing analytics
preference does not manage advertising consent. Never treat it as a substitute
for an applicable CMP, and do not serve personalized ads before required
consent is obtained.

The code renders only explicit display ad units; it does not create pop-ups,
pop-unders, overlays, sticky ads, forced redirects, or click-triggered ads.
The AdSense account must also have Auto ads and all intrusive formats disabled:
dashboard settings can inject placements independently of this code.

## Account and ad-unit setup

1. Create or sign in to a Google AdSense account and add `futurvion.in` as a
   website.
2. Complete Google's site ownership and review process. Approval and ad
   serving are controlled by Google and are not verified by this repository.
3. In AdSense, create responsive **display** ad units for the placements you
   intend to use. Copy the publisher ID (`ca-pub-...`) and the slot IDs from
   those units. These identifiers are public; do not put account credentials
   or API secrets in `NEXT_PUBLIC_*` variables.
4. Configure the environment variables below in the deployment platform.
5. Configure and test the certified CMP and its consent signaling. Only after
   that, set `NEXT_PUBLIC_ADSENSE_CONSENT_READY=true`.
6. Deploy, verify the production behavior and consent flow, and check the
   AdSense account for policy or serving messages.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | AdSense publisher ID |
| `NEXT_PUBLIC_ADSENSE_ENABLED` | Global master switch; defaults to `false` |
| `NEXT_PUBLIC_ADSENSE_CONSENT_READY` | Explicit operator gate for a configured and tested consent integration; defaults to `false` |
| `NEXT_PUBLIC_ADSENSE_SLOT_BLOG_CONTENT` | Responsive in-content display unit |
| `NEXT_PUBLIC_ADSENSE_SLOT_BLOG_SIDEBAR` | Desktop article sidebar display unit |
| `NEXT_PUBLIC_ADSENSE_SLOT_BLOG_LISTING` | Blog listing display unit |
| `NEXT_PUBLIC_ADSENSE_SLOT_CONTENT_PAGE` | Reserved optional informational-page unit; currently disabled |

Empty slot values safely omit the corresponding unit. These public IDs are
compiled into the client bundle, so configure them before building/deploying.
Restart the development server after changing local environment values.

## Placement policy

- **Blog listing:** an ad may appear after every four cards, never before the
  first card or after the final card. The current listing has four cards, so it
  intentionally renders no listing ad until the listing grows.
- **Blog articles:** one ad after the second major section, then after every
  three additional sections, only at explicit boundaries between complete
  sections. Short articles do not get an ad at the end. Paragraphs, headings,
  lists, tables, images, and code are not split.
- **Article sidebar:** one responsive display unit, shown only at viewport
  widths above 1100px. It is in normal document flow, not sticky or fixed.
- **Services, solutions, about, contact, and jobs:** no placements are
  currently enabled. Contact and job-application routes remain ad-free.

To adjust listing or article frequency, edit the central settings in
`config/ads.ts`. To add an article unit, place `InContentAd` between complete
article sections and supply the correct completed-section count. Keep the
article's existing content and structured data unchanged. To remove a
placement, remove its component call and, if no longer used, its slot setting.
Set the global switch to `false` to disable every placement and avoid loading
the script.

## AdSense dashboard settings

In the AdSense account, use manual display ad units and disable:

- Auto ads
- Vignette ads
- Anchor ads
- Side rail ads
- Other intrusive overlay formats

Verify these settings after account or site configuration changes. Disabling
Auto ads in application code is not sufficient if Auto ads remain enabled in
the AdSense dashboard.

## `ads.txt`

`public/ads.txt` contains a documented placeholder record. Replace
`pub-XXXXXXXXXXXXXXXX` with the exact publisher declaration supplied by
Google; do not invent or deploy the placeholder as a real authorization. After
deployment, check `https://futurvion.in/ads.txt` and confirm it returns the
exact approved record. Production availability has not been verified.

## Privacy, consent, and legal review

Google and its partners may use cookies or similar technologies for
advertisement delivery, measurement, and personalization, subject to consent
and applicable settings. Review and update the privacy policy before
activation. Google requires publishers serving users in the EEA, UK, and
Switzerland to use a certified CMP for applicable ad consent requirements.
Confirm Google's current requirements, certified CMP status, consent-mode or
TCF signaling, non-personalized/personalized settings, and regional rules
directly with the providers and qualified legal counsel. This repository does
not claim a CMP certification or legal compliance.

## Production checklist and troubleshooting

- [ ] AdSense has approved `futurvion.in`.
- [ ] Publisher ID and each intended slot ID are exact and match the account.
- [ ] A currently Google-certified CMP is configured and tested for applicable
      regions before `NEXT_PUBLIC_ADSENSE_CONSENT_READY` is enabled.
- [ ] Auto ads, vignette, anchor, side rail, and other overlay formats are off
      in the AdSense dashboard.
- [ ] Privacy policy and any required legal disclosures have been reviewed.
- [ ] `ads.txt` contains Google's exact publisher record and is reachable in
      production.
- [ ] The production build has the intended environment values; the global
      switch is enabled only after all prior steps are complete.
- [ ] Blog listing, long and short articles, desktop sidebar, mobile layout,
      contact, jobs, and consent behavior have been checked in production.
- [ ] Check the browser network panel and AdSense dashboard for script,
      policy, consent, or serving errors. Ad blockers, unavailable inventory,
      and account review may prevent an ad from appearing; do not bypass
      blockers or simulate impressions.

Missing IDs, disabled placements, and the global off switch omit ad
containers. A blocked or failed script does not display a fake advertisement
or a permanent loading placeholder.
