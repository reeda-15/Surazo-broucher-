(() => {
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const selector = [
    '.section-heading', '.product-card', '.trench-feature', '.range-note',
    '.material-heading', '.comparison-scroll', '.ownership-notes > div',
    '.load-tabs', '.load-summary', '.load-visual', '.selection-guide > div',
    '.about-copy', '.application-gallery > *', '.installation-steps > li',
    '.installation-note', '.resource-grid > div', '.faq',
    '.facility-copy', '.facility-photo', '.credential-controls',
    '.supplier-panel', '.contact-copy', '#quote-form', '.footer-top',
    '.detail-overview > *', '.detail-info-grid > article', '.detail-cta',
    '.related-products', '.detail-hero > *', '.size-intro', '.size-options > article'
  ].join(',');
  const candidates = [...document.querySelectorAll(selector)].filter(el =>
    !el.closest('.hero, .proof-strip, .engineering-stack, .credential-track'));
  // Animate only outermost targets so nested content never receives two transforms.
  const targets = candidates.filter(el => !candidates.some(parent => parent !== el && parent.contains(el)));
  const states = new Map(targets.map(el => [el, { entered: false, animation: null }]));
  const clear = state => { state.animation?.cancel(); state.animation = null; };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const state = states.get(entry.target);
      if (!entry.isIntersecting) {
        state.entered = false;
        clear(state);
        return;
      }
      if (state.entered || reduce.matches) return;
      state.entered = true;
      // Leave content already on screen at page load, or being used, immediately readable.
      if (performance.now() < 400 || entry.target.contains(document.activeElement)) return;
      const siblings = [...entry.target.parentElement.children].filter(el => states.has(el));
      const delay = Math.min(Math.max(siblings.indexOf(entry.target), 0) * 75, 225);
      state.animation = entry.target.animate([
        { opacity: 0.15, transform: 'translateY(28px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 700, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
      state.animation.onfinish = () => clear(state);
    });
  }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
  targets.forEach(el => observer.observe(el));
  document.addEventListener('focusin', event => {
    states.forEach((state, el) => { if (el.contains(event.target)) clear(state); });
  });
  reduce.addEventListener('change', () => states.forEach(clear));
  window.addEventListener('pagehide', () => states.forEach(clear));
})();
