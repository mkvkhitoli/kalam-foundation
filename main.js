// Footer year
document.querySelectorAll('.yr').forEach(e => e.textContent = new Date().getFullYear());

// Highlight current page in the menu
(function () {
  const page = location.pathname.split('/').pop().replace('.html', '') || 'index';
  document.querySelectorAll('.menu a[data-page]').forEach(a => {
    if (a.dataset.page === page) a.classList.add('active');
  });
})();

/* ===== Editable content =====
   Slider, gallery, events, highlights and stats come from the files in /content
   (edited through the admin page at app.pagescms.org). The HTML already contains
   a copy, and this script refreshes it with the latest saved content. */
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }[c]));
const md = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
const src = p => esc(String(p ?? '').replace(/^\/+/, ''));

const R = {
  stat: s => {
    const n = String(s.number ?? '');
    return `<div class="stat"><b>${n.endsWith('+') ? esc(n.slice(0, -1)) + '<i>+</i>' : esc(n)}</b><span>${esc(s.label)}</span></div>`;
  },
  slide: (s, i) => `<figure class="ks-slide"><img src="${src(s.image)}" alt="${esc(s.alt)}" loading="${i === 0 ? 'eager' : 'lazy'}"><figcaption>${esc(s.caption)}</figcaption></figure>`,
  hl: h => `<div class="hl"><span class="when">${esc(h.when)}</span><h3>${esc(h.title)}</h3><p>${md(h.text)}</p></div>`,
  event: e => `<div class="event"><div class="date"><b>${esc(e.big)}</b><small>${esc(e.small)}</small></div><div>${e.badge ? `<span class="badge">${esc(e.badge)}</span><br>` : ''}<h3>${esc(e.title)}</h3><p>${esc(e.text)}</p></div></div>`,
  photo: p => `<img class="photo" src="${src(p.image)}" alt="${esc(p.alt)}" loading="lazy"${p.focus === 'top' ? ' style="object-position:center 25%"' : ''}>`,
};

const SOURCES = {
  stats:      ['home',    d => d.stats,      R.stat],
  highlights: ['home',    d => d.highlights, R.hl],
  slider:     ['slider',  d => d.slides,     R.slide],
  upcoming:   ['events',  d => d.upcoming,   R.event],
  past:       ['events',  d => d.past,       R.event],
  gallery:    ['gallery', d => d.photos,     R.photo],
};

async function loadContent() {
  const boxes = [...document.querySelectorAll('[data-cms]')];
  if (!boxes.length || location.protocol === 'file:') return;
  const cache = {};
  const get = name => cache[name] ??= fetch(`content/${name}.json`, { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).catch(() => null);
  await Promise.all(boxes.map(async box => {
    const [file, pick, render] = SOURCES[box.dataset.cms] || [];
    if (!file) return;
    const data = await get(file);
    let items = data && pick(data);
    if (!Array.isArray(items) || !items.length) return; // keep the built-in copy
    if (box.dataset.limit) items = items.slice(0, +box.dataset.limit);
    box.innerHTML = items.map(render).join('');
  }));
}

// Photo slider (home page)
function initSlider() {
  const box = document.getElementById('ks'); if (!box) return;
  const track = box.querySelector('.ks-track'),
        slides = [...box.querySelectorAll('.ks-slide')], dotsBox = box.querySelector('.ks-dots');
  if (!slides.length) return;
  let i = 0, timer, startX = null;
  dotsBox.innerHTML = '';
  slides.forEach((_, n) => { const d = document.createElement('button'); d.setAttribute('aria-label', 'Slide ' + (n + 1)); d.onclick = () => go(n, true); dotsBox.appendChild(d); });
  const dots = [...dotsBox.children];
  function go(n, user) { i = (n + slides.length) % slides.length; track.style.transform = `translateX(-${i * 100}%)`; dots.forEach((d, k) => d.classList.toggle('on', k === i)); if (user) restart(); }
  function restart() { clearInterval(timer); timer = setInterval(() => go(i + 1), 5000); }
  box.querySelector('.ks-prev').onclick = () => go(i - 1, true);
  box.querySelector('.ks-next').onclick = () => go(i + 1, true);
  box.onmouseenter = () => clearInterval(timer);
  box.onmouseleave = restart;
  box.ontouchstart = e => startX = e.touches[0].clientX;
  box.ontouchend = e => { if (startX === null) return; const dx = e.changedTouches[0].clientX - startX; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1), true); startX = null; };
  go(0); restart();
}

loadContent().finally(initSlider);
