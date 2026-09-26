(() => {
  const hero = document.querySelector('main > .hero');
  const products = document.querySelector('#products');
  if (!hero || !products) return;
  const desktop = matchMedia('(pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let locked = false;
  let lastWheel = 0;
  let accumulated = 0;
  let previousWheel = 0;

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
    const destination = Math.max(0, Math.min(max, products.getBoundingClientRect().top + y));
    if (Math.abs(destination - y) < 2) return;
    locked = true;
    const started = now;
    window.scrollTo({top: destination, behavior: 'smooth'});
    const release = () => {
      const time = performance.now();
      const settled = Math.abs(scrollY - destination) < 3 || time - started > 1600;
      if (settled && time - started > 450 && time - lastWheel > 180) locked = false;
      else requestAnimationFrame(release);
    };
    requestAnimationFrame(release);
  }, {passive: false});
})();
