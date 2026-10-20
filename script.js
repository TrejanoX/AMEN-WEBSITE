(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Scroll progress */
  const bar = $('#progress');
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Typewriter */
  const typed = $('#typed');
  const lines = [
    'Model for Kid.Up Culture.',
    'Exploring my environments.',
    'Learning new skills.',
    'Basketball, gaming and travel.'
  ];
  if (reduce) {
    typed.textContent = lines[0];
  } else {
    let li = 0, ci = 0, del = false;
    const tick = () => {
      const line = lines[li];
      typed.textContent = line.slice(0, ci);
      if (!del && ci === line.length) { del = true; return setTimeout(tick, 1400); }
      if (del && ci === 0) { del = false; li = (li + 1) % lines.length; return setTimeout(tick, 300); }
      ci += del ? -1 : 1;
      setTimeout(tick, del ? 28 : 55);
    };
    setTimeout(tick, 700);
  }

  /* Profile tilt */
  const tilt = $('#tilt'), arch = $('.arch');
  if (!reduce && matchMedia('(hover: hover)').matches) {
    tilt.addEventListener('mousemove', e => {
      const r = tilt.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      arch.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`;
    });
    tilt.addEventListener('mouseleave', () => { arch.style.transform = ''; });
  }

  /* Compass needle follows the pointer */
  const compass = $('#compass'), needle = $('.needle', compass);
  addEventListener('pointermove', e => {
    const r = compass.querySelector('svg').getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const deg = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI + 90;
    needle.style.transform = `rotate(${deg}deg)`;
  }, { passive: true });

  /* Skill meter */
  const titles = ['Beginner', 'Curious', 'Getting there', 'Skilled', 'Pro', 'Master'];
  let lvl = 1;
  const fill = $('#meterFill'), meter = $('#meter');
  $('#levelBtn').addEventListener('click', () => {
    lvl = Math.min(lvl + 1, titles.length);
    const pct = Math.round((lvl / titles.length) * 100);
    fill.style.width = pct + '%';
    meter.setAttribute('aria-valuenow', pct);
    $('#lvl').textContent = lvl;
    $('#lvlTitle').textContent = ' \u00b7 ' + titles[lvl - 1];
    if (lvl === titles.length) $('#levelBtn').textContent = 'Always more to learn';
  });
  meter.setAttribute('aria-valuenow', 17);

  /* Hobbies */
  const icons = {
    basketball: '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4"><circle cx="50" cy="50" r="44"/><path d="M6 50h88M50 6v88M17 17c20 18 20 48 0 66M83 17c-20 18-20 48 0 66"/></svg>',
    gaming: '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"><path d="M28 32h44c12 0 20 10 22 26l2 16c1 8-8 12-14 6L68 66H32L18 80c-6 6-15 2-14-6l2-16c2-16 10-26 22-26z"/><path d="M32 42v14M25 49h14"/><circle cx="66" cy="45" r="3" fill="currentColor"/><circle cx="75" cy="53" r="3" fill="currentColor"/></svg>',
    traveling: '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"><path d="M50 90S20 60 20 38a30 30 0 0160 0c0 22-30 52-30 52z"/><circle cx="50" cy="38" r="11"/></svg>'
  };
  const hobbies = {
    basketball: ['Basketball', 'Running the court with friends. It keeps me moving and keeps me competitive.'],
    gaming: ['Gaming', 'When I want to switch off and have fun, I load up a game and play.'],
    traveling: ['Traveling', 'My favorite way to explore. Waterfalls, beaches and mangroves are all in my photo roll below.']
  };
  const panel = $('#hobbyPanel');
  const setHobby = key => {
    $$('.hobby-tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.hobby === key));
    $('#hobbyIcon').innerHTML = icons[key];
    $('#hobbyTitle').textContent = hobbies[key][0];
    $('#hobbyText').textContent = hobbies[key][1];
    $('#hobbyLink').hidden = key !== 'traveling';
    panel.setAttribute('aria-labelledby', 'tab-' + key);
    panel.classList.remove('is-swap'); void panel.offsetWidth; panel.classList.add('is-swap');
  };
  $$('.hobby-tabs button').forEach(b => b.addEventListener('click', () => setHobby(b.dataset.hobby)));
  setHobby('basketball');

  /* Lightbox */
  const lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let group = [], idx = 0, opener = null;
  const show = () => {
    const el = group[idx];
    lbImg.src = el.dataset.src;
    lbImg.alt = $('img', el).alt;
    lbCap.textContent = el.dataset.cap || '';
  };
  const open = el => {
    opener = el;
    group = $$(`[data-lb][data-group="${el.dataset.group}"]`);
    idx = group.indexOf(el);
    show();
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#lbClose').focus();
  };
  const close = () => {
    lb.hidden = true;
    document.body.style.overflow = '';
    if (opener) opener.focus();
  };
  const step = d => { idx = (idx + d + group.length) % group.length; show(); };
  $$('[data-lb]').forEach(el => el.addEventListener('click', () => open(el)));
  $('#lbClose').addEventListener('click', close);
  $('#lbPrev').addEventListener('click', () => step(-1));
  $('#lbNext').addEventListener('click', () => step(1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
})();
