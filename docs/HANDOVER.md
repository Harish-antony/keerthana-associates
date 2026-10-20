# Keerthana Associates — technical handover

## Architecture and local run
The approved white-glass page is plain `index.html` + `assets/css/` + `assets/js/main.js`, with self-hosted fonts and local WebP photos. There is no frontend build. `backend/main.py` provides a same-origin FastAPI API. It serves **only** `/` (the HTML) and `/assets/*` (the asset tree), plus `POST /api/enquiries`; backend files, `.env`, docs and the database are not exposed. The form's `data-endpoint` is deliberately empty by default. Set it to `/api/enquiries` once the API is deployed and tested.

1. From the project root, install `pip install -r requirements.txt`.
2. Set environment variables from `.env.example` **in your shell or deployment secret manager**. The app does not read `.env` files automatically. For local tests without SMTP, leave SMTP vars unset: leads still store and notifications are logged as skipped.
3. Start `uvicorn backend.main:app --host 0.0.0.0 --port 8000` and open `http://localhost:8000/`.
4. Connect the form by changing `data-endpoint=""` to `data-endpoint="/api/enquiries"` in `index.html` only after the server is live. Submit a real test lead and verify its SQLite row **and** the notification inbox.
5. The default database is `backend/enquiries.db`; use `ENQUIRIES_DB=/durable/secure/path/enquiries.db` for production. Back it up and limit filesystem permissions. The SQLite rate limiter is shared across app workers; it allows five valid non-honeypot submissions per IP per rolling ten minutes. Terminate HTTPS at a trusted reverse proxy. If using proxy headers for real client IPs, configure *trusted* proxy addresses in Uvicorn; never trust arbitrary `X-Forwarded-For` supplied by a visitor.

The API validates six approved services and all field lengths and email/phone formats. An occupied `website` honeypot returns HTTP 200 without storing or notifying. Every accepted human lead is committed to SQLite before the SMTP STARTTLS background task runs. An SMTP error is logged and does not change the successful storage response. Invalid payloads return 422; the sixth request within ten minutes returns 429. `SMTP_USER` is the sender and the enquirer's address becomes `Reply-To`.

## What changed
- Added the same-origin FastAPI service, SQLite storage and durable database-backed IP rate limit; added SMTP notification configuration and hidden honeypot.
- Added short consent text and the honeypot to the existing form, a prefilled WhatsApp message, font preloads, `twitter:card` and a service-only JSON-LD `knowsAbout` list. The form endpoint is still **off** until configured.
- The same two-photo hero retains its styling and six-second fade. Dots are generated from slide count; a pause/play control, focus/keyboard and swipe handling, and next-image prewarming were added. No React, Vite or external runtime libraries.
- Recompressed `nature-1000.webp` to under 120 KB without changing dimensions. The existing forest photo is also used in the Process section.

## How to add a slide
Add **one** `<div class="hero-slide" aria-hidden="true">` block inside `.hero-image-frame` in `index.html`, after the existing slides. Include a `<picture>` or `<img>` with meaningful `alt`, explicit `width` and `height`, `loading="lazy"`, `decoding="async"`, `srcset` with 640 and 1000/1200 width WebP files, and `sizes="(max-width: 800px) 100vw, 50vw"`. Put the two local files in `assets/img/`, each ideally below 120 KB. Do not add a dot or edit JS/CSS: dots and loop length update automatically. The first slide alone keeps `fetchpriority="high"` and no lazy loading. Use authentic industrial safety, training, environmental or office photos; do not imply a stock subject is a client.

**Current stock sources and licence:** hero industrial-team photograph: https://images.pexels.com/photos/15947456/pexels-photo-15947456.jpeg (Pexels photo page https://www.pexels.com/photo/15947456/). Forest photograph: https://images.pexels.com/photos/11982280/pexels-photo-11982280.jpeg (page https://www.pexels.com/photo/11982280/). Pexels' published licence at https://www.pexels.com/license/ allows free website use and modification, but forbids implying endorsement by people/brands. Source photo-page access returned 403 to the automated client; confirm the specific images, attribution/rights and any depicted trademarks with the client before launch. Prefer client-owned photography.

## Known tech debt — document only, do not refactor now
- `assets/css/styles.css` contains stacked override passes. Dead selectors include `.card-number`, `.benefits span`, `.steps li>span` and `.industry-list span`. Token names such as `--forest` now hold charcoal values. Consolidation would require pixel-identical proof at 360/768/1024/1440px; none was attempted.
- The API performs notification as an in-process background task: SQLite preserves the lead if SMTP fails, but it does not retry failed emails. Add a transactional outbox/worker if guaranteed notification delivery becomes a requirement.
- SQLite is suitable for the current small deployment but needs durable disk and backups; avoid ephemeral storage. The rate-attempt IP log is pruned during submissions, not by a scheduled retention job. Review data retention and privacy policy with the client.

## Pre-launch checklist
- [ ] Configure same-origin hosting with persistent SQLite storage and HTTPS; set `/api/enquiries` on the form only after API, real SMTP credentials and inbox delivery are verified. Monitor logs and back up DB.
- [ ] Obtain client approval of the visible consent sentence and a full privacy notice / retention policy.
- [ ] Replace the placeholder logo and stock photography with approved client assets or verify the specific stock licences; confirm the industry list and any testimonial permissions.
- [ ] Confirm exact Maps pin and approved embed; the current map is a labelled placeholder with a search link. The same nature photo appears in hero slide 2 and Process.
- [ ] Once a domain is known, add canonical URL, absolute `og:image` URL, `sitemap.xml` and `robots.txt`. None is created without a production domain.
- [ ] Test keyboard and screen readers, real Chrome/Firefox/Safari/mobile, final HTTPS/SMTP and measured Lighthouse scores.

## Roadmap — not built
**Phase 2:** add preferred date/time and timezone fields to a booking-slot request through the same API, with a confirmation email to the enquirer; agree on availability handling first. **Phase 3:** consider Razorpay only for fixed-price items such as training seats, after client confirmation; consultancy work is normally quoted first. **Phase 4:** migrate SQLite and rate-limit state to PostgreSQL when scale or operations warrant it.

## Verification performed for this handover
- Headless Chromium at 360, 768, 1024 and 1440px: no horizontal overflow or console/page errors. The first 250px of baseline and updated full-page captures were pixel-identical at all four widths; expected changes are confined to the new slideshow control, consent text, and recompressed nature image. The consent line naturally increases contact-section height.
- `node --check assets/js/main.js` and `python -m py_compile backend/main.py` passed. Uvicorn started and served the site.
- Browser with form endpoint empty showed the existing required-field errors and honest unavailability message. Browser with `/api/enquiries` set temporarily submitted successfully to FastAPI and created a SQLite row.
- API tests verified validation, honeypot (no row), five accepted submissions followed by HTTP 429, private files returning 404, and five STARTTLS notification messages using a **mock SMTP server**, including `Reply-To`. A simulated SMTP failure still returned 200 with the saved row.
- Temporary 2-, 3- and 5-slide DOM configurations passed generated dot counts, manual wrap, autoplay wrap, keyboard, swipe and pause checks. Reduced-motion disabled autoplay. A delayed image response kept the prior frame visible until the next image decoded. Hover on the image paused autoplay. The temporary extra slides reused local images; no unapproved third photo was shipped.
- Automated axe WCAG 2.0/2.1 A/AA scan in Chromium at 360px and 1440px found no violations. This does not replace manual assistive-technology testing.

**Not verified:** real SMTP delivery (no credentials supplied), exact Maps pin, physical-device/Firefox/Safari rendering, measured Lighthouse score, or pixel identity of the compressed forest photograph. The endpoint remains empty by default, so live enquiries will not be submitted until it is explicitly connected.

## Process video addition
The existing Process-section nature photo remains in place. A small play button opens a `<dialog>` with native video controls; Escape, the close button, or a backdrop click closes it, pauses playback and returns focus. The local `assets/video/process-safety.webm` (VP9/Opus) is preferred for Chromium compatibility; `assets/video/process-safety.mp4` (H.264/AAC) is the fallback. Both are loaded only after the visitor presses play; the modal uses `assets/img/process-video-poster.webp`. No autoplay or third-party video embed is used.

**Source and licence:** Pexels, *A group of men in orange vests and hard hats working on a construction site*, by CP Khanal: https://www.pexels.com/video/a-group-of-men-in-orange-vests-and-hard-hats-working-on-a-construction-site-19832500/ . The source page lists a Free licence; Pexels terms are at https://www.pexels.com/license/ (free website use and modification, no implied endorsement). The locally hosted 1280×720 MP4 came from https://videos.pexels.com/video-files/19832500/19832500-hd_1280_720_25fps.mp4 and was transcoded to WebM. The poster comes from https://images.pexels.com/videos/19832500/pexels-photo-19832500.jpeg . This is illustrative stock footage, **not** an actual Keerthana Associates site or client. Replace it with approved client footage if available.

**Video QA:** The page had no horizontal overflow or page errors at 360/768/1024/1440px. The video made zero network requests before click. In Chromium, the dialog opened, WebM returned HTTP 206, playback reached readyState 4, and closing paused the video. Real Safari/Firefox and real mobile playback remain untested.

## Current video montage — supersedes the earlier dialog addition
The client requested removal of **both** pause/play buttons. The hero keeps its photo arrows and six-second autoplay. The Process image area now plays three **illustrative stock** clips in sequence, muted, and wraps back to the first: construction workers in safety gear, a protected foundry worker, and a forest scene. No client work is represented. JavaScript only loads the first clip near the Process viewport, stops when offscreen/hidden, and leaves the original forest photo visible for reduced-motion users or failed playback. The video itself is clickable or focusable with Space to pause/resume without a visible button.

Each clip is trimmed to five seconds and self-hosted in VP9 WebM with H.264 MP4 fallback. Original high-resolution downloads and the previous video-dialog assets are **not** shipped. The source pages list the Pexels Free licence; terms: https://www.pexels.com/license/ . Confirm all stock use with the client before launch.

| Clip | Pexels source | Creator | Local files |
|---|---|---|---|
| Construction safety | https://www.pexels.com/video/a-group-of-men-in-orange-vests-and-hard-hats-working-on-a-construction-site-19832500/ | CP Khanal | `construction-loop.webm`, `construction-loop.mp4` |
| Foundry safety | https://www.pexels.com/video/factory-workers-working-at-foundry-5121742/ | ArtHouse Studio | `foundry-loop.webm`, `foundry-loop.mp4` |
| Forest / environment | https://www.pexels.com/video/sun-rays-coming-through-the-trees-6327822/ | Matthias Groeneveld | `environment-loop.webm`, `environment-loop.mp4` |

**Current QA:** Chromium loaded no video before the section entered view, played construction → foundry → environment → construction over 17 seconds with no page errors, and allowed click/Space pause and resume. At 360/768/1024/1440px there was no horizontal overflow or page error; reduced-motion requested zero video files. Safari/Firefox and real mobile devices remain untested.

## Scroll-motion enhancement
The landing page layout, copy and section order are unchanged. New motion is restricted to CSS opacity/transform, a one-time hero image reveal mask, a slow three-percent image scale, and a maximum 16px desktop-only shift of the decorative hero arc. IntersectionObserver animates visible headings/section blocks once and staggers card, process-step, benefit, industry, FAQ and contact/footer elements. The existing trust line is duplicated **visually only** for a seamless, slow marquee; screen readers receive it once. Hover or keyboard focus pauses the marquee. Reduced-motion visitors see all content immediately with a static trust line; the Process video montage remains a still photo for them.

**Motion QA performed:** Headless Chromium at 360/768/1024/1440px reported no horizontal overflow or page errors. At all four widths, the hero text finished at full opacity, the two marquee groups had equal widths, and every reveal target became visible after scrolling to the bottom. At 360/1440px with reduced motion, there was no marquee/hero animation and no video requests. Mobile menu, photo arrow and invalid-form error still worked. The marquee's intrinsic width initially widened the mobile hero; `min-width:0` on `.hero-content` fixed it. Firefox/Safari and manual screen-reader motion review remain to be done.
