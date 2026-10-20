# Keerthana Associates landing page

A single-page enquiry site built with semantic HTML5, modern CSS and vanilla JavaScript. No build step, runtime dependencies or paid image services. The earlier white-glass layout and lightweight two-photo hero slideshow have been restored.

## Run locally
Open `index.html` in a browser, or from the project directory run `python3 -m http.server 8000 --bind 0.0.0.0` and visit `http://localhost:8000/`.

## Structure
- `index.html` — approved page copy, sections, SEO tags and schema.
- `assets/css/tokens.css` — colours, type families and spacing tokens.
- `assets/css/styles.css` — layout, glass surfaces, components and breakpoints.
- `assets/js/main.js` — navigation, slideshow, reveal animations and form validation.
- `assets/fonts/` — self-hosted Poppins and Work Sans fonts with `font-display: swap`.
- `assets/img/` — placeholder logo, favicon, responsive WebP photographs.
- `docs/` — section map, style guide, content inventory and QA history.

## Replace placeholders
- Replace `assets/img/logo-placeholder.svg` and `assets/img/favicon.svg` with client-approved marks.
- Replace `assets/img/hero-640.webp`, `hero-1200.webp`, `nature-640.webp` and `nature-1000.webp` with approved photographs. Keep responsive dimensions/alt text accurate. Existing photos are Pexels [15947456](https://www.pexels.com/photo/15947456/) and [11982280](https://www.pexels.com/photo/11982280/); confirm use and suitability before launch.
- The testimonials section is hidden until real permissioned quotes are supplied. Confirm the listed industries with the client.
- Replace the CSS map placeholder with an approved lazy-loaded embed if desired. The external Maps search link already contains the supplied address; verify the exact pin manually.

## Connect the form
The form deliberately has **no endpoint configured**. Until configured, valid submissions show an unavailable message and direct visitors to phone, email or WhatsApp. Set `data-endpoint="https://formspree.io/f/REAL_ID"` on `#enquiry-form` after creating and verifying a Formspree form. `assets/js/main.js` POSTs JSON and only shows the approved success message on a successful response. Test an actual message and email notification before launch. A future FastAPI/PostgreSQL API can use a relative `/api/enquiries` endpoint; validate on the server, rate-limit, protect against spam, store data lawfully and send notification mail server-side. A booking-slot request and payment integration remain documented extension points, not active features. Analytics/conversion hooks are commented in the HTML and JS.

## Deploy
Upload this folder as a static site. Netlify: no build command, publish the project root. Vercel: static project, no build command. GitHub Pages: publish these files from the selected branch/root. After choosing a domain, add a canonical URL and absolute Open Graph image URL. Test the connected form, real photos and map result on the deployed site.

## Design decisions
White-glass surfaces, cool gray backgrounds, charcoal text and bronze CTA accents create a calm B2B appearance. Poppins headings and Work Sans body text keep it approachable. The earlier two-photo hero and restrained controls are intentionally simpler than a standalone carousel component. Repeated consultation prompts lead to one contact section without invented testimonials or statistics.

## Backend (FastAPI)
Install `pip install -r requirements.txt`, then run `uvicorn backend.main:app --host 0.0.0.0 --port 8000` from the project directory. FastAPI serves only `/` and `/assets` plus `POST /api/enquiries`; do not use the Python static server for live enquiries. Copy `.env.example` into your private deployment configuration and export `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `NOTIFY_TO` (this app does not auto-load `.env`). Set `data-endpoint="/api/enquiries"` in `index.html` **only when ready to accept live enquiries**; it remains empty by default. The API stores valid leads in SQLite before scheduling an SMTP STARTTLS notification, so an email failure does not lose the lead. Use durable storage with backups in production. See `docs/HANDOVER.md` for deployment and security notes.

## Process video
The Process photo has an opt-in play button. It opens a native, keyboard-accessible video dialog; the video is not downloaded until clicked. Local WebM and MP4 copies plus a poster are in `assets/video/` and `assets/img/process-video-poster.webp`. To replace the stock clip, keep both formats where possible and update the two `<source>` paths in `index.html`. See `docs/HANDOVER.md` for source and licence details. This footage is illustrative stock material, not Keerthana Associates client work.

### Current Process montage (supersedes the opt-in dialog above)
The Process visual now cycles through three locally hosted, muted stock clips automatically when it enters the viewport: construction safety, foundry work and forest sustainability. Each five-second clip has WebM and MP4 versions in `assets/video/`; the original nature photo stays as the fallback. There are no visible play/pause buttons. Clicking the footage or focusing it and pressing Space pauses or resumes it. Reduced-motion settings keep the still photo instead. Sources and licence URLs are recorded in `docs/HANDOVER.md`.

## Motion layer
The page uses CSS keyframes and the existing IntersectionObserver in `assets/js/main.js`—no animation dependency. Hero content enters once in a short stagger; section elements reveal once on entry; grid items receive small stagger delays. The existing trust line forms a slow, gapless marquee inside its original hero position. Hover or keyboard focus pauses it. `prefers-reduced-motion: reduce` shows a static trust line and disables decorative entrances and autoplay footage. Scroll-linked movement is limited to the decorative hero arc on desktop. See `docs/HANDOVER.md` for verification notes.
