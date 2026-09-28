(() => {
  const hero = document.querySelector('main > .hero');
  const stats = document.querySelector('#stats');
  if (!hero || !stats) return;
  const desktop = matchMedia('(pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let locked = false;
  let lastWheel = 0;
  let accumulated = 0;
  let previousWheel = 0;
  let travelFrame = 0;
  let releaseFrame = 0;
  let effects = [];
  const stopTransition = () => {
    cancelAnimationFrame(travelFrame);
    cancelAnimationFrame(releaseFrame);
    effects.forEach(effect => effect.cancel());
    effects = [];
    locked = false;
  };
  const animate = (element, frames, options) => {
    if (element?.animate) effects.push(element.animate(frames, options));
  };
  window.addEventListener('touchstart', stopTransition, { passive: true });
  window.addEventListener('keydown', event => {
    if (['Escape', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) stopTransition();
  });
  reducedMotion.addEventListener('change', stopTransition);
  window.addEventListener('pagehide', stopTransition);

  const canScrollInside = (target, direction) => {
    for (let node = target; node instanceof Element && node !== document.body; node = node.parentElement) {
      if (node.matches('input, textarea, select, [contenteditable="true"], [role="dialog"]')) return true;
      const style = getComputedStyle(node);
      if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 2) {
        if (direction > 0 ? node.scrollTop + node.clientHeight < node.scrollHeight - 2 : node.scrollTop > 2) return true;
      }
    }
    return false;
  };

  window.addEventListener('wheel', event => {
    if (!desktop.matches || reducedMotion.matches || event.ctrlKey || event.shiftKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY ||
        document.querySelector('#navigation.open')) return;
    const direction = Math.sign(event.deltaY);
    if (canScrollInside(event.target, direction)) return;
    // Only the downward transition from the hero gets section navigation.
    // All later sections and upward scrolling keep their native behavior.
    if (!locked && (direction < 0 || hero.getBoundingClientRect().bottom <= 4)) {
      accumulated = 0;
      return;
    }
    const now = performance.now();
    lastWheel = now;
    if (locked) { event.preventDefault(); return; }
    if (now - previousWheel > 180 || Math.sign(accumulated) !== direction) accumulated = 0;
    previousWheel = now;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    accumulated += delta;
    event.preventDefault();
    if (Math.abs(accumulated) < 24) return;
    accumulated = 0;

    const y = scrollY;
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const destination = Math.max(0, Math.min(max, stats.getBoundingClientRect().top + y));
    if (Math.abs(destination - y) < 2) return;
    locked = true;
    const started = now;
    effects.forEach(effect => effect.cancel());
    effects = [];
    const duration = 1100;
    const easing = 'cubic-bezier(.22,1,.36,1)';
    animate(hero.querySelector('.hero-copy'), [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0.15, transform: 'translateY(-55px)' }
    ], { duration: 850, easing, fill: 'forwards' });
    animate(hero.querySelector('.hero-media'), [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(.96)', opacity: 0.55 }
    ], { duration, easing, fill: 'forwards' });
    stats.querySelectorAll('.proof-grid > div').forEach((item, index) => {
      animate(item, [
        { opacity: 0, transform: 'translateY(38px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 700, delay: 300 + index * 110, easing, fill: 'both' });
    });
    const travel = time => {
      const progress = Math.min((time - started) / duration, 1);
      const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      window.scrollTo({ top: y + (destination - y) * eased, behavior: 'instant' });
      if (progress < 1) travelFrame = requestAnimationFrame(travel);
    };
    travelFrame = requestAnimationFrame(travel);
    const release = () => {
      const time = performance.now();
      const settled = Math.abs(scrollY - destination) < 3 || time - started > 1600;
      if (settled && time - started > 1300 && time - lastWheel > 180) stopTransition();
      else releaseFrame = requestAnimationFrame(release);
    };
    releaseFrame = requestAnimationFrame(release);
  }, {passive: false});
})();
