(() => {
  const section = document.querySelector('.proof-strip');
  if (!section || !('IntersectionObserver' in window)) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const formatter = new Intl.NumberFormat('en-IN', { useGrouping: false });
  const counters = [...section.querySelectorAll('.proof-grid > div > strong')]
    .filter(element => /^\d/.test(element.firstChild?.textContent || ''))
    .map(element => {
      const original = element.firstChild;
      const target = Number(original.textContent.replaceAll(',', ''));
      const number = document.createElement('span');
      number.className = 'stat-number';
      number.textContent = original.textContent;
      number.setAttribute('aria-hidden', 'true');
      element.setAttribute('aria-label', element.textContent);
      element.replaceChild(number, original);
      return { number, target };
    });
  let frame = 0;
  let started = false;
  const finish = () => {
    cancelAnimationFrame(frame);
    counters.forEach(({ number, target }) => { number.textContent = formatter.format(target); });
  };
  const observer = new IntersectionObserver(entries => {
    const entry = entries[entries.length - 1];
    if (!entry.isIntersecting) {
      started = false;
      finish();
      return;
    }
    if (started || entry.intersectionRatio < 0.35) return;
    started = true;
    cancelAnimationFrame(frame);
    if (motion.matches) return finish();
    counters.forEach(({ number }) => { number.textContent = '0'; });
    const start = performance.now();
    const tick = now => {
      const progress = Math.min((now - start) / 1800, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counters.forEach(({ number, target }) => {
        number.textContent = formatter.format(Math.floor(target * eased));
      });
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  }, { threshold: [0, 0.35] });
  observer.observe(section);
  motion.addEventListener('change', () => {
    if (motion.matches) finish();
  });
})();
