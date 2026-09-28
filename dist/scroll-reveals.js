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
  const states = new Map(targets.map(el => [el, { entered: false, animation: null, initiallyVisible: el.getBoundingClientRect().top < innerHeight && el.getBoundingClientRect().bottom > 0 }]));
  const clear = state => { state.animation?.cancel(); state.animation = null; };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const state = states.get(entry.target);
      if (!entry.isIntersecting || state.entered) return;
      // Unobserve before transforming: motion must never retrigger its own visibility check.
      state.entered = true;
      observer.unobserve(entry.target);
      // Leave content already on screen at page load, or being used, immediately readable.
      if (reduce.matches || state.initiallyVisible || entry.target.contains(document.activeElement)) return;
      const siblings = [...entry.target.parentElement.children].filter(el => states.has(el));
      const compact = matchMedia('(max-width: 700px)').matches;
      const step = compact ? 50 : 80;
      const delay = Math.min(Math.max(siblings.indexOf(entry.target), 0) * step, 160);
      const element = entry.target;
      const rise = compact ? 24 : 40;
      let frames = [
        { opacity: 0, transform: `translateY(${rise}px)` },
        { opacity: 1, transform: 'translateY(0)' }
      ];
      let duration = 700;
      if (element.matches('.section-heading, .material-heading, .size-intro, .credential-controls')) {
        frames = [
          { opacity: 0, transform: 'translateY(28px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ];
        duration = 750;
      } else if (element.matches('.facility-photo, .load-visual, .detail-overview > figure, .detail-product-image')) {
        frames = [
          { opacity: 0, transform: 'translateY(36px) scale(.92)', clipPath: 'inset(10% 5% 10% 5%)' },
          { opacity: 1, transform: 'translateY(0) scale(1)', clipPath: 'inset(0% 0% 0% 0%)' }
        ];
        duration = 850;
      } else if (element.matches('.product-card, .application-gallery > *, .size-options > article')) {
        frames = [
          { opacity: 0, transform: `translateY(${rise}px) scale(.96)` },
          { opacity: 1, transform: 'translateY(0) scale(1)' }
        ];
        duration = 750;
      } else if (element.matches('.about-copy, .facility-copy, .contact-copy')) {
        frames = [
          { opacity: 0, transform: `translateX(-${compact ? 18 : 40}px)` },
          { opacity: 1, transform: 'translateX(0)' }
        ];
      } else if (element.matches('#quote-form')) {
        frames = [
          { opacity: 0, transform: `translateY(${rise}px) scale(.97)` },
          { opacity: 1, transform: 'translateY(0) scale(1)' }
        ];
      }
      state.animation = element.animate(frames, {
        duration, delay, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards'
      });
      state.animation.onfinish = () => clear(state);
    });
  }, { threshold: 0, rootMargin: '0px 0px -56px 0px' });
  targets.forEach(el => observer.observe(el));
  document.addEventListener('focusin', event => {
    states.forEach((state, el) => { if (el.contains(event.target)) clear(state); });
  });
  reduce.addEventListener('change', () => states.forEach(clear));
  window.addEventListener('pagehide', () => states.forEach(clear));
})();
