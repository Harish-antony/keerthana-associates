# Roles 7–8 — performance, SEO and accessibility QA

## Automated/static checks completed
- [x] Exactly one H1; section H2 and card/step H3 hierarchy; semantic landmarks and labelled navs.
- [x] Every local linked asset exists; IDs are unique; JavaScript passes `node --check`.
- [x] Responsive `srcset` images have intrinsic width/height, hero preloaded, below-fold image lazy-loaded; locally served WebP files total roughly 450 KB across all sizes, with only one size of each normally downloaded.
- [x] Self-hosted WOFF2 with `font-display: swap`; no third-party runtime CSS, JS or icon library.
- [x] Exact supplied title and meta description; OG title/description/image, SVG favicon, ProfessionalService JSON-LD with phone, email and full address. Final production URL and absolute OG image remain pending domain confirmation.
- [x] Local SEO terminology follows the supplied copy naturally; no awkward keyword stuffing. Add location-specific supporting content only after copy approval.
- [x] Focus-visible ring, skip link, native keyboard-operated FAQ `<details>`, menu expanded state/Escape/close-on-link, form labels/error associations/live status, reduced-motion opt-out.
- [x] Gold on cream is used for decoration/large accents, **not small body text**; cream on deep green and deep green on cream carry primary copy. Bronze `#b8862e` against cream has insufficient small-text contrast; the accent button uses light gold `#e6bb70` with dark text. Some decorative section kickers are non-essential, while the main copy uses high-contrast colours.
- [x] Form has client validation, failure state, pending state, and success only after a successful network response. Server-side validation still required.

## Issues found and fixed
1. A map placeholder initially had `role="img"` around a real link, which could hide that link from assistive technology. Removed the image role.
2. External web-font fetching would add render dependencies. Changed to local WOFF2 files with swap and fallbacks.
3. A third stock candidate returned 404; omitted rather than ship a broken image.

## Manual release checks still required
- [ ] Verify at **360, 768, 1024, 1440px** in Chrome, Firefox, Safari and real mobile browsers. No browser automation/runtime is installed in this environment, so cross-browser testing is **not claimed complete**.
- [ ] Run Lighthouse on deployed HTTPS site. **90+ in all categories is a target, not a measured result**; check Performance, Accessibility, Best Practices and SEO, plus image LCP and CLS.
- [ ] Test keyboard-only full page, VoiceOver/NVDA, 200% and 400% zoom, high contrast and touch targets. Confirm computed contrast with final assets/branding.
- [ ] Configure a real form endpoint, submit a real enquiry, confirm delivery and notifications, test rejection/offline/duplicate submits.
- [ ] Replace placeholder logo/favicon/photos, verify source licensing, approve industries, decide whether to add permissioned testimonials, and confirm map embed.
- [ ] Add final canonical URL and absolute `og:image` for social previews after domain selection.

## Follow-up functional checks (latest revision)
- [x] Local HTTP 200 for homepage, CSS, JS and slideshow photos; all four WebP assets decode; declared image dimensions match.
- [x] Internal anchor targets exist, click-to-call/email values match brief, three consultation CTAs point to contact, all six FAQ items exist.
- [x] Google Maps search URL returned HTTP 200 and contains the full supplied street/locality/postcode. This confirms the link opens a Maps search, **not** that Google pins the exact entrance; client should verify the precise result.
- [x] DOM interaction checks with jsdom: menu open/close, slideshow next/previous and counter, invalid form errors, honest unconfigured endpoint warning, and success only after mocked 2xx response.
- [x] Slideshow uses the two existing approved-placeholder categories (industrial safety and sustainability), supports manual navigation, pauses on hover/focus/hidden tab, and does not auto-advance when reduced motion is requested.
- [ ] Real-browser visual/layout checks, real mobile devices, actual Maps pin selection, and end-to-end email delivery remain pending; no browser binary or live form endpoint is available here.

## Industry and numbering revision
- [x] Six industry explanations appear under “WHO WE SUPPORT”; wording makes no unverifiable project claims.
- [x] No decorative `01 /`–`06 /` labels remain in the HTML; service/process/benefit numbers were removed and slideshow uses dots.
- [x] Slideshow next control updates the active dot in a DOM interaction check; page responds HTTP 200.

## React carousel revision
- [x] Three local, genuine Pexels stock photos (industrial team, factory worker, nature), each in two WebP widths. Third source: Pexels photo 17842695. Confirm the client approves all placeholder photos before launch.
- [x] React/Vite production build passes; dev server and preview host return HTTP 200, including React modules and the third photo.
- [x] Interval is 4.5 seconds; manual arrows/dots, persistent pause/resume, hover/focus pause, tab visibility pause, touch swipe and arrow-key navigation are implemented. Reduced-motion disables autoplay and transitions.
- [x] Fixed-aspect-ratio frame and explicit photo dimensions prevent layout shift. Initial static fallback image appears without JS.
- [ ] Real-browser rendering and assistive technology review are still required.

## Latest end-to-end verification (supersedes earlier “no browser available” notes)
- [x] Headless Chromium tested against the Vite development server and the built `dist/` site at **360, 768, 1024 and 1440px**: no horizontal overflow, JavaScript page errors, or failed local asset responses.
- [x] Real-browser checks: menu opens/closes; all three slider photos decode; arrows, dots, keyboard arrows and pause/resume work; FAQ expands; required form validation works; unconfigured form does not falsely claim delivery; phone/WhatsApp/map URLs are correct.
- [x] Timed real-browser checks: autoplay advances after ~4.5 seconds, hover and persistent pause stop it, swipe advances, and reduced-motion prevents autoplay. Mocked HTTP 2xx returns the approved success message.
- [x] axe-core WCAG 2.0/2.1 A/AA automated scan in Chromium at 360px and 1440px: **0 violations**. Automated checks do not replace a screen-reader audit.
- [x] Vite production build passes; output HTML assets exist; browser smoke checks against the built site pass.
- [ ] **Not verified as working:** real enquiry email delivery. No form endpoint is configured. Add Formspree/backend endpoint and test with a real inbox before launch.
- [ ] Google Maps search URL returns HTTP 200 and contains the supplied address; exact location pin still requires human verification.
- [ ] Firefox, Safari, real mobile devices, screen-reader manual testing and a measured Lighthouse score remain outstanding.

## Restoration note — current live version
The client preferred the design **before the React carousel**. Restored the earlier white-glass hero layout and two-photo vanilla-JS slideshow, while retaining Poppins/Work Sans and the expanded industries copy. React/Vite and the third image were removed. Chromium checks on the restored site at 360px and 1440px found no horizontal overflow or page errors; both slides and the next control worked. The earlier React-specific test results above describe a superseded version, not the current page. Form delivery still requires a real endpoint; exact Maps pin and cross-browser testing remain release checks.
