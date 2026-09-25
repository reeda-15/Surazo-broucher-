(() => {
  const video = document.querySelector('#hero-video');
  if (!video) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let inView = true;
  let failed = false;
  const play = () => {
    if (failed) return;
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    video.loop = true;
    video.muted = true;
    video.play().catch(() => {});
  };
  const reconcile = () => {
    if (document.hidden || !inView || motion.matches || connection?.saveData) video.pause();
    else play();
  };
  video.addEventListener('playing', () => { video.classList.add('is-ready'); });
  video.addEventListener('ended', () => { video.currentTime = 0; reconcile(); });
  video.addEventListener('error', () => { failed = true; video.classList.remove('is-ready'); });
  motion.addEventListener('change', reconcile);
  connection?.addEventListener('change', reconcile);
  document.addEventListener('visibilitychange', reconcile);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; reconcile(); }, {threshold:0}).observe(video.closest('.hero'));
  }
  reconcile();
})();
