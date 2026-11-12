/**
 * Custom Dot + Difference Blob Cursor & Magnetic Buttons
 * Automatically disabled on touch devices and when prefers-reduced-motion is enabled.
 */

export function initCursor(prefersReducedMotion) {
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (!isFinePointer || prefersReducedMotion) return;

  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  const label = document.querySelector('.cursor-label');
  if (!dot || !ring) return;

  document.body.classList.add('has-custom-cursor');

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let isVisible = false;

  const interactiveSelector = [
    'a',
    'button',
    'h1',
    'h2',
    'h3',
    'h4',
    'p',
    'li',
    'span.chip',
    '.chip',
    '.project-row',
    '.design-tile',
    '.split-half',
    '.split-list li',
    '.hop-title',
    '.toolkit-group-title',
    '.scroll-hint',
    '.hud-link',
    'footer a',
    'img',
    'svg',
    '[data-cursor]',
  ].join(', ');

  const smallSelector = 'span.chip, .chip, .split-list li, .toolkit-group-title, .hud-link, li';

  function clearCursorState() {
    document.body.classList.remove('cursor-active', 'cursor-big', 'cursor-small', 'cursor-view');
  }

  function updateCursorState(target) {
    if (!(target instanceof Element)) {
      clearCursorState();
      return;
    }

    // Ignore cursor elements themselves
    if (target.closest('.cursor-dot, .cursor-ring, .cursor-label')) return;

    // Smaller blob over the lightbox image itself (no "View" label)
    if (target.closest('#lightbox-img')) {
      document.body.classList.add('cursor-active', 'cursor-small');
      document.body.classList.remove('cursor-big', 'cursor-view');
      return;
    }

    const tile = target.closest('.design-tile');
    if (tile) {
      document.body.classList.add('cursor-active', 'cursor-view');
      document.body.classList.remove('cursor-big', 'cursor-small');
      return;
    }

    const explicitSizeEl = target.closest('[data-cursor]');
    if (explicitSizeEl) {
      const size = explicitSizeEl.getAttribute('data-cursor');
      document.body.classList.add('cursor-active');
      document.body.classList.toggle('cursor-big', size === 'big');
      document.body.classList.toggle('cursor-small', size === 'small');
      document.body.classList.remove('cursor-view');
      return;
    }

    const matched = target.closest(interactiveSelector);
    if (matched) {
      document.body.classList.add('cursor-active');
      document.body.classList.remove('cursor-big', 'cursor-view');
      document.body.classList.toggle('cursor-small', Boolean(target.closest(smallSelector)));
    } else {
      clearCursorState();
    }
  }

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'touch') return;
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

      if (!isVisible) {
        ringX = mouseX;
        ringY = mouseY;
        isVisible = true;
      }

      updateCursorState(e.target);
    },
    { passive: true }
  );

  document.addEventListener('pointerleave', clearCursorState);
  window.addEventListener('blur', clearCursorState);

  // Smooth ring & label lag
  function renderCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    const pos = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    ring.style.transform = pos;
    if (label) label.style.transform = pos;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Magnetic pull for key buttons and links
  const magneticItems = document.querySelectorAll('[data-magnetic]');
  magneticItems.forEach((el) => {
    const strength = Number(el.dataset.magnetic) || 0.25;

    el.addEventListener('pointermove', (e) => {
      const rect = el.getBoundingClientRect();
      const offsetX = (e.clientX - (rect.left + rect.width / 2)) * strength;
      const offsetY = (e.clientY - (rect.top + rect.height / 2)) * strength;
      el.style.transform = `translate3d(${offsetX.toFixed(1)}px, ${offsetY.toFixed(1)}px, 0)`;
    });

    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
    });
  });
}
