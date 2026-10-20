'use strict';
// Site interactions: no external libraries required.
const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const setHeader = () => header.classList.toggle('scrolled', window.scrollY > 18);
setHeader();
window.addEventListener('scroll', setHeader, { passive: true });
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  navigation.classList.remove('open');
}
menuButton.addEventListener('click', () => {
  const opening = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('open', opening);
});
navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!header.contains(event.target)) closeMenu(); });
window.matchMedia('(min-width: 801px)').addEventListener('change', closeMenu);

// Slideshow: add one .hero-slide block in HTML; dots and indexing update automatically.
const slides = [...document.querySelectorAll('.hero-slide')];
const slideControls = document.querySelector('.slide-controls');
const slideFrame = document.querySelector('.hero-image-frame');
const slideVisual = document.querySelector('.hero-visual');
const dotsContainer = document.querySelector('.slide-dots');
const slideDots = slides.map((_, index) => {
  const dot = document.createElement('i');
  dot.classList.toggle('active', index === 0);
  dotsContainer.append(dot);
  return dot;
});
let currentSlide = 0;
let slideTimer;
let transitioning = false;
let touchStart = null;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function prewarmNext() {
  if (slides.length < 2) return;
  const image = slides[(currentSlide + 1) % slides.length].querySelector('img');
  image.loading = 'eager';
  image.decode().catch(() => {}); // Failed prefetch must not interrupt the current slide.
}
async function showSlide(index) {
  if (transitioning || slides.length < 2) return;
  const nextIndex = (index + slides.length) % slides.length;
  if (nextIndex === currentSlide) return;
  transitioning = true;
  const image = slides[nextIndex].querySelector('img');
  image.loading = 'eager';
  try { await image.decode(); }
  catch (error) { transitioning = false; return; } // Never reveal a blank frame.
  currentSlide = nextIndex;
  slides.forEach((slide, i) => {
    const active = i === currentSlide;
    slide.classList.toggle('active', active);
    slide.setAttribute('aria-hidden', String(!active));
  });
  slideDots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
  transitioning = false;
  prewarmNext();
}
function pauseSlides() { clearInterval(slideTimer); slideTimer = undefined; }
function resumeSlides() {
  pauseSlides();
  if (!reduceMotion.matches && !document.hidden &&
      !slideVisual.matches(':hover, :focus-within') && slides.length > 1) {
    slideTimer = setInterval(() => showSlide(currentSlide + 1), 6000);
  }
}
slideControls.addEventListener('click', event => {
  const button = event.target.closest('[data-slide]');
  if (!button) return;
  showSlide(currentSlide + (button.dataset.slide === 'next' ? 1 : -1));
  resumeSlides();
});
slideVisual.addEventListener('mouseenter', pauseSlides);
slideVisual.addEventListener('mouseleave', resumeSlides);
slideVisual.addEventListener('focusin', pauseSlides);
slideVisual.addEventListener('focusout', () => setTimeout(resumeSlides, 0));
slideVisual.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  showSlide(currentSlide + (event.key === 'ArrowRight' ? 1 : -1));
});
slideFrame.addEventListener('touchstart', event => {
  touchStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
}, { passive: true });
slideFrame.addEventListener('touchend', event => {
  if (!touchStart) return;
  const dx = event.changedTouches[0].clientX - touchStart.x;
  const dy = event.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) showSlide(currentSlide + (dx < 0 ? 1 : -1));
  touchStart = null;
}, { passive: true });
slideFrame.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
document.addEventListener('visibilitychange', resumeSlides);
reduceMotion.addEventListener('change', resumeSlides);
prewarmNext();
resumeSlides();

// One-time reveals: content remains visible without JS or when motion is reduced.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const groups = [
    '.service-grid .service-card', '.steps li', '.benefits > div',
    '.industry-list article', '.faq-list details', '.contact-side > *', '.footer-main > *', '.footer-bottom'
  ];
  groups.forEach(selector => {
    document.querySelectorAll(selector).forEach((item, index) => {
      item.setAttribute('data-reveal', '');
      item.style.setProperty('--reveal-delay', `${Math.min(index % 3, 2) * 85}ms`);
    });
  });
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target); // Never replay while scrolling back up.
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px 28px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
  document.documentElement.classList.add('js-motion');
}
// A tiny scroll-linked shift on the decorative hero arc only; never moves text or controls.
const heroArc = document.querySelector('.hero-arc');
if (heroArc && 'requestAnimationFrame' in window) {
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let arcTicking = false;
  function shiftArc() {
    arcTicking = false;
    heroArc.style.transform = (!motionQuery.matches && window.innerWidth > 800)
      ? `translate3d(0, ${Math.min(window.scrollY * 0.055, 16)}px, 0)` : '';
  }
  window.addEventListener('scroll', () => {
    if (!arcTicking) { arcTicking = true; requestAnimationFrame(shiftArc); }
  }, { passive: true });
  window.addEventListener('resize', shiftArc, { passive: true });
  motionQuery.addEventListener('change', shiftArc);
}

// Native <details>/<summary> handles FAQ keyboard and screen reader behaviour.

const form = document.querySelector('#enquiry-form');
const status = document.querySelector('#form-status');
const submit = form.querySelector('button[type="submit"]');
const fields = [...form.querySelectorAll('.field input, .field select, .field textarea')];
const messages = {
  name: 'Please enter your name.', company: 'Please enter your company.',
  phone: 'Please enter a valid phone number.', email: 'Please enter a valid email address.',
  service: 'Please select a service.', message: 'Please tell us about your requirements.'
};
function validate(field) {
  const value = field.value.trim();
  const valid = Boolean(value) && field.checkValidity();
  const error = document.getElementById(`${field.id}-error`);
  field.setAttribute('aria-invalid', String(!valid));
  error.textContent = valid ? '' : messages[field.name];
  return valid;
}
fields.forEach(field => {
  field.addEventListener('blur', () => validate(field));
  field.addEventListener('input', () => { if (field.getAttribute('aria-invalid') === 'true') validate(field); });
  field.addEventListener('change', () => { if (field.getAttribute('aria-invalid') === 'true') validate(field); });
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  status.textContent = '';
  status.classList.remove('error');
  const invalid = fields.filter(field => !validate(field));
  if (invalid.length) { invalid[0].focus(); return; }
  const endpoint = form.dataset.endpoint.trim();
  if (!endpoint) {
    status.classList.add('error');
    status.textContent = 'Online enquiries are not available yet. Please call, email, or WhatsApp us instead.';
    return;
  }
  submit.disabled = true;
  submit.firstChild.textContent = 'Sending… ';
  try {
    // Same-origin FastAPI endpoint or Formspree-compatible JSON POST.
    const response = await fetch(endpoint, {
      method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    if (!response.ok) throw new Error('Submission failed');
    status.textContent = "Thank you! We've received your enquiry and will be in touch shortly.";
    form.reset();
    fields.forEach(field => field.removeAttribute('aria-invalid'));
    // Conversion tracking hook: fire a lead event here only after confirmed success.
  } catch (error) {
    status.classList.add('error');
    status.textContent = 'Your enquiry could not be sent. Please try again or call 9500004272.';
  } finally {
    submit.disabled = false;
    submit.firstChild.textContent = 'Send Enquiry ';
  }
});

// Process montage: muted stock clips play in sequence and wrap to the first clip.
// Sources are assigned only while the Process image is near the viewport.
const processLoop = document.querySelector('.process-loop');
if (processLoop) {
  const clips = ['construction', 'foundry', 'environment'];
  let clipIndex = 0;
  let started = false;
  let inView = false;
  let failedClips = 0;
  let userPausedProcess = false;
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  function loadClip() {
    processLoop.replaceChildren();
    for (const [extension, type] of [['webm', 'video/webm'], ['mp4', 'video/mp4']]) {
      const source = document.createElement('source');
      source.src = `assets/video/${clips[clipIndex]}-loop.${extension}`;
      source.type = type;
      processLoop.append(source);
    }
    processLoop.load();
    processLoop.play().catch(() => {}); // Poster remains if the browser blocks playback.
  }
  function syncProcessVideo() {
    if (motionPreference.matches || document.hidden || !inView) {
      processLoop.pause();
      processLoop.classList.remove('is-playing');
      return;
    }
    if (userPausedProcess) { processLoop.pause(); return; }
    if (!started) { started = true; loadClip(); }
    else processLoop.play().catch(() => {});
  }
  processLoop.addEventListener('playing', () => { failedClips = 0; processLoop.classList.add('is-playing'); });
  function toggleProcessPlayback() {
    userPausedProcess = !userPausedProcess;
    syncProcessVideo();
  }
  processLoop.addEventListener('click', toggleProcessPlayback);
  processLoop.addEventListener('keydown', event => {
    if (event.code === 'Space') { event.preventDefault(); toggleProcessPlayback(); }
  });
  processLoop.addEventListener('ended', () => {
    processLoop.classList.remove('is-playing');
    clipIndex = (clipIndex + 1) % clips.length;
    if (inView && !motionPreference.matches && !document.hidden) loadClip();
  });
  processLoop.addEventListener('error', () => {
    processLoop.classList.remove('is-playing');
    if (++failedClips < clips.length && inView && !motionPreference.matches) {
      clipIndex = (clipIndex + 1) % clips.length;
      loadClip();
    }
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      syncProcessVideo();
    }, { rootMargin: '120px 0px' }).observe(processLoop);
  } else { inView = true; syncProcessVideo(); }
  document.addEventListener('visibilitychange', syncProcessVideo);
  motionPreference.addEventListener('change', syncProcessVideo);
}
