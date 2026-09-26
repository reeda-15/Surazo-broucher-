(() => {
  const sections = [...document.querySelectorAll('main > section:not(.proof-strip)')];
  if (sections.length < 2) return;
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
    const tops = sections.map(section => section.getBoundingClientRect().top + y);
    tops[0] = 0;
    const index = Math.max(0, tops.findLastIndex(top => top <= y + 4));
    const top = tops[index];
    const bottom = sections[index].getBoundingClientRect().bottom + y;
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    let destination;
    // Keep every part of a long catalogue or form reachable before leaving it.
    if (direction > 0) {
      const lastPage = bottom - innerHeight;
      destination = index > 0 && y < lastPage - 4
        ? Math.min(y + innerHeight * 0.85, lastPage)
        : (tops[index + 1] ?? max);
    } else {
      destination = y > top + 4 ? Math.max(top, y - innerHeight * 0.85)
        : index > 0 ? Math.max(tops[index - 1], sections[index - 1].getBoundingClientRect().bottom + y - innerHeight) : 0;
      if (index === 1 && y <= top + 4) destination = 0;
    }
    destination = Math.max(0, Math.min(max, destination));
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
