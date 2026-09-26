(() => {
  const section = document.querySelector('.engineering-stack');
  if (!section || !Element.prototype.animate) return;
  const pieces = [...section.querySelectorAll('.stack-piece')].reverse();
  const labels = [...section.querySelectorAll('.stack-descriptions > div')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let animations = [];
  let started = false;
  const clear = () => { animations.forEach(animation => animation.cancel()); animations = []; };
  const reveal = () => {
    clear();
    if (reduce.matches) return;
    pieces.forEach((piece, index) => animations.push(piece.animate([
      {opacity:0,transform:'translateY(-65px)'},
      {opacity:1,transform:'translateY(0)'}
    ], {duration:550,delay:index * 600,easing:'cubic-bezier(.2,.7,.25,1)',fill:'both'})));
    labels.forEach((label, index) => animations.push(label.animate([
      {opacity:0,transform:'translateX(20px)'},
      {opacity:1,transform:'translateX(0)'}
    ], {duration:450,delay:pieces.length * 600 + index * 120,easing:'ease-out',fill:'both'})));
  };
  reduce.addEventListener('change', clear);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const entry = entries[entries.length - 1];
      if (!entry.isIntersecting) {
        started = false;
        clear();
        return;
      }
      if (!started && entry.intersectionRatio >= 0.3) {
        started = true;
        reveal();
      }
    }, {threshold:[0, 0.3]});
    observer.observe(section.querySelector('.engineering-visual'));
  }
})();
