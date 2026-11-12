/**
 * GSAP + ScrollTrigger + Lenis Animations
 * Handles boot sequence, masked text reveals, hero parallax, split slide-ins,
 * 3D poster tile tilt, project row toggles, and packet hop progress.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function initAnimations(prefersReducedMotion) {
  initProjectRows();

  if (prefersReducedMotion) {
    skipBootLoaderImmediately();
    initReducedMotionProgress();
    initLightbox(null);
    return;
  }

  // Smooth scrolling synced with GSAP ticker
  const lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true,
    wheelMultiplier: 0.95,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Smooth anchor scrolling for HUD & hero links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        lenis.scrollTo(targetEl, { offset: -56 });
      }
    });
  });

  runBootSequence(() => {
    revealHero();
  });

  setupScrollAnimations();
  initDesignTileTilt();
  initLightbox(lenis);
  refreshOnAssetsReady();
}

function refreshOnAssetsReady() {
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  const images = Array.from(document.querySelectorAll('img'));
  if (images.length === 0) return;

  images.forEach((img) => {
    img.addEventListener('error', () => {
      console.error(`[Design Image Error] Failed to load: ${img.getAttribute('src')}`);
    });
  });

  let remaining = images.filter((img) => !img.complete).length;
  if (remaining === 0) {
    ScrollTrigger.refresh();
    return;
  }

  const onDone = () => {
    remaining -= 1;
    if (remaining <= 0) ScrollTrigger.refresh();
  };

  images.forEach((img) => {
    if (!img.complete) {
      img.addEventListener('load', onDone, { once: true });
      img.addEventListener('error', onDone, { once: true });
    }
  });
}

function skipBootLoaderImmediately() {
  const loader = document.querySelector('.boot-loader');
  if (loader) loader.remove();
  document.body.classList.remove('is-loading');
}

function initReducedMotionProgress() {
  const bar = document.querySelector('.packet-progress-bar');
  if (!bar) return;
  window.addEventListener(
    'scroll',
    () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    },
    { passive: true }
  );
}

function runBootSequence(onComplete) {
  const loader = document.querySelector('.boot-loader');
  const lines = document.querySelectorAll('.boot-line');
  const progressFill = document.querySelector('.boot-progress-fill');

  if (!loader) {
    document.body.classList.remove('is-loading');
    onComplete();
    return;
  }

  gsap.set('.hero .reveal-line', { yPercent: 110 });

  const tl = gsap.timeline({
    onComplete: () => {
      document.body.classList.remove('is-loading');
      loader.remove();
    },
  });

  tl.to(lines, {
    opacity: 1,
    duration: 0.22,
    stagger: 0.24,
    ease: 'power1.out',
  })
    .to(
      progressFill,
      {
        width: '100%',
        duration: 0.8,
        ease: 'power2.inOut',
      },
      0.05
    )
    .to(loader, {
      yPercent: -100,
      duration: 0.7,
      ease: 'power3.inOut',
      delay: 0.15,
      onStart: onComplete,
    });
}

function revealHero() {
  const tl = gsap.timeline();
  tl.to('.hero .reveal-line', {
    yPercent: 0,
    duration: 0.85,
    stagger: 0.11,
    ease: 'power4.out',
  }).from(
    '.hero-fade',
    {
      opacity: 0,
      y: 18,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out',
    },
    '-=0.45'
  );
}

function setupScrollAnimations() {
  // Top packet progress bar
  gsap.to('.packet-progress-bar', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
    },
  });

  // Hero name subtle parallax
  gsap.to('.hero-name-wrap', {
    yPercent: 18,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });

  // Staggered masked text reveals across sections
  document.querySelectorAll('.reveal-on-scroll').forEach((group) => {
    const lines = group.querySelectorAll('.reveal-line');
    if (!lines.length) return;
    gsap.from(lines, {
      yPercent: 110,
      duration: 0.78,
      stagger: 0.09,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: group,
        start: 'top 84%',
        once: true,
      },
    });
  });

  // Split section: scroll-driven (scrubbed) opposing slide-ins & heading parallax
  const mm = gsap.matchMedia();
  mm.add('(min-width: 820px)', () => {
    const splitTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.split-grid',
        start: 'top 85%',
        end: 'top 30%',
        scrub: 1,
      },
    });

    splitTl
      .fromTo(
        '.split-half--net',
        { x: -120, opacity: 0 },
        { x: 0, opacity: 1, ease: 'none', immediateRender: false },
        0
      )
      .fromTo(
        '.split-half--design',
        { x: 120, opacity: 0 },
        { x: 0, opacity: 1, ease: 'none', immediateRender: false },
        0
      );

    const innerItems = document.querySelectorAll(
      '.split-kicker, .split-heading, .split-desc, .split-list li'
    );
    if (innerItems.length) {
      splitTl.fromTo(
        innerItems,
        { y: 40, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
        {
          y: 0,
          opacity: 1,
          clipPath: 'inset(0 0 0% 0)',
          stagger: 0.04,
          ease: 'none',
          immediateRender: false,
        },
        0.15
      );
    }

    // Opposite vertical heading parallax as section passes through viewport
    gsap.fromTo(
      '.split-half--net .split-heading',
      { y: -40 },
      {
        y: 40,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: '.split-grid',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );

    gsap.fromTo(
      '.split-half--design .split-heading',
      { y: 40 },
      {
        y: -40,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: '.split-grid',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );
  });

  mm.add('(max-width: 819px)', () => {
    gsap.fromTo(
      '.split-half',
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.25,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: '.split-grid',
          start: 'top 88%',
          end: 'top 30%',
          scrub: 1,
        },
      }
    );
  });

  // Design poster tiles rotate slightly into place (cycles for any number of tiles)
  const initialRotations = [-3.5, 2.5, -2];
  document.querySelectorAll('.design-tile').forEach((tile, i) => {
    gsap.fromTo(
      tile,
      {
        y: 44,
        rotation: initialRotations[i % initialRotations.length],
        opacity: 0,
      },
      {
        y: 0,
        rotation: 0,
        opacity: 1,
        duration: 0.75,
        delay: (i % 3) * 0.08,
        ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: tile,
          start: 'top 95%',
          once: true,
        },
      }
    );
  });

  // Active Hop HUD tracker
  const hopLabel = document.getElementById('hud-active-hop');
  const navLinks = document.querySelectorAll('.hud-link');

  document.querySelectorAll('[data-hop]').forEach((section) => {
    const hopId = section.getAttribute('data-hop');
    ScrollTrigger.create({
      trigger: section,
      start: 'top 45%',
      end: 'bottom 45%',
      onEnter: () => setActiveHop(hopId),
      onEnterBack: () => setActiveHop(hopId),
    });
  });

  function setActiveHop(hopId) {
    if (hopLabel) hopLabel.textContent = hopId;
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${hopId}`);
    });
  }
}

function initProjectRows() {
  const rows = document.querySelectorAll('.project-row');
  rows.forEach((row) => {
    const btn = row.querySelector('.project-trigger');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const willOpen = !row.classList.contains('is-open');
      rows.forEach((r) => {
        r.classList.remove('is-open');
        r.querySelector('.project-trigger')?.setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        row.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

function initDesignTileTilt() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  document.querySelectorAll('.design-tile').forEach((tile) => {
    const card = tile.querySelector('.design-card');
    if (!card) return;

    tile.addEventListener('pointermove', (e) => {
      const rect = tile.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(card, {
        rotateY: x * 11,
        rotateX: -y * 11,
        duration: 0.35,
        ease: 'power2.out',
      });
    });

    tile.addEventListener('pointerleave', () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.5,
        ease: 'power3.out',
      });
    });
  });
}

function initLightbox(lenis) {
  const lightbox = document.getElementById('lightbox');
  const tiles = Array.from(document.querySelectorAll('.design-tile'));
  if (!lightbox || tiles.length === 0) return;

  const imgEl = document.getElementById('lightbox-img');
  const titleEl = document.getElementById('lightbox-title');
  const roleEl = document.getElementById('lightbox-role');
  const counterEl = document.getElementById('lightbox-counter');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  const items = tiles.map((tile) => {
    const img = tile.querySelector('img');
    return {
      src: img?.getAttribute('src') || '',
      alt: img?.getAttribute('alt') || '',
      title: tile.querySelector('.design-title')?.textContent?.trim() || '',
      role: tile.querySelector('.design-role')?.textContent?.trim() || '',
      trigger: tile.querySelector('.design-tile-btn') || tile,
    };
  });

  let currentIndex = 0;
  let lastTrigger = null;

  function renderSlide(index) {
    currentIndex = (index + items.length) % items.length;
    const item = items[currentIndex];
    if (imgEl) {
      imgEl.src = item.src;
      imgEl.alt = item.alt;
    }
    if (titleEl) titleEl.textContent = item.title;
    if (roleEl) roleEl.textContent = item.role;
    if (counterEl) counterEl.textContent = `${currentIndex + 1} / ${items.length}`;
  }

  function open(index) {
    lastTrigger = items[index]?.trigger || document.activeElement;
    renderSlide(index);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
    closeBtn?.focus();
  }

  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lenis) lenis.start();
    if (lastTrigger && typeof lastTrigger.focus === 'function') {
      lastTrigger.focus();
    }
  }

  items.forEach((item, index) => {
    item.trigger.addEventListener('click', () => open(index));
  });

  lightbox.querySelectorAll('[data-lightbox-close]').forEach((el) => {
    el.addEventListener('click', close);
  });

  prevBtn?.addEventListener('click', () => renderSlide(currentIndex - 1));
  nextBtn?.addEventListener('click', () => renderSlide(currentIndex + 1));

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      renderSlide(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      renderSlide(currentIndex + 1);
    } else if (e.key === 'Tab') {
      const focusables = [closeBtn, prevBtn, nextBtn].filter(Boolean);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
