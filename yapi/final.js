// Foxi Smash v5.0 (Adem 15 Kas 2026): son bolum (bolumler.json 'toplam') gecilince final sahnesi.
// "Tum hazineleri topladin Kaptan!" + Foxi'nin dans videosu (karakter/tilki_dans.mp4, yesil fon canli olarak saydam yapilir)
// + havai fisek/altin yagmuru. Secenekler: yildizi eksik bolumleri tamamlamak icin haritaya don, ana sayfa; "Yakinda yeni adalar!" bilgisi.
export function finalSahne({ toplam, eksik, ilkEksik, yildiz, ses, titret, harita, anaSayfa }) {
  const E = document.createElement('div'); E.id = 'final';
  const yaz = (s, d0) => [...s].map((c, i) => (c === ' ' ? ' ' : '<i style="animation-delay:' + (d0 + i * 0.045).toFixed(2) + 's">' + c + '</i>')).join('');
  E.innerHTML = '<canvas class="f-fx"></canvas><div class="f-isin"></div>' +
    '<div class="f-bas"><div class="f-b1">' + yaz('Tüm hazineleri', 0.2) + '</div><div class="f-b2">' + yaz('topladın Kaptan!', 0.85) + '</div></div>' +
    '<div class="f-sahne"><div class="f-sandik"></div><canvas class="f-foxi" width="240" height="350"></canvas></div>' +
    '<div class="f-sat"><span><b>' + toplam + '</b> bölüm</span><span><b>' + yildiz + '</b> ★</span></div>' +
    '<div class="f-yakin">🏝️ Yakında yeni adalar!</div>' +
    '<div class="f-dug">' + (eksik ? '<button class="f-btn f-har">Yıldızları tamamla<small>' + eksik + ' bölümde yıldız eksik</small></button>' : '<button class="f-btn f-har">Haritaya bak<small>Bütün yıldızlar senin!</small></button>') +
    '<button class="f-btn f-ana">Ana sayfa</button></div>';
  document.body.appendChild(E);
  for (const ev of ['pointerdown', 'pointerup', 'pointermove']) E.addEventListener(ev, (x) => x.stopPropagation());
  requestAnimationFrame(() => E.classList.add('on'));
  if (ses) { ses('win'); setTimeout(() => ses('bonus'), 900); setTimeout(() => ses('bonus'), 1500); }
  if (titret) titret(60);

  // ---- Foxi dans videosu: yesil fon saydam (kucuk tuvalde islenir, CSS ile buyur) ----
  const cv = E.querySelector('.f-foxi'), cx = cv.getContext('2d', { willReadFrequently: true });
  const v = document.createElement('video'); v.src = '../karakter/tilki_dans.mp4?v=2'; v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.crossOrigin = 'anonymous';
  const p = v.play(); if (p && p.catch) p.catch(() => {});
  let calis = true;
  const kare = () => {
    if (!calis) return;
    if (v.readyState >= 2) {
      cx.drawImage(v, 0, 0, cv.width, cv.height);
      try {
        const im = cx.getImageData(0, 0, cv.width, cv.height), d = im.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2], fz = g - Math.max(r, b);
          if (fz > 11) { const t = Math.min(1, (fz - 11) / 22), a = 1 - t * t * (3 - 2 * t); d[i + 3] = 255 * a; d[i + 1] = Math.min(g, Math.max(r, b) + 8); }   // yesil fon (merkez.js anasayfa ile ayni esik: 0.045-0.13)
        }
        cx.putImageData(im, 0, 0);
      } catch (e) { /* dosyadan acilinca (file://) piksel okunamaz: video oldugu gibi kalir */ }
    }
    requestAnimationFrame(kare);
  };
  kare();

  // ---- havai fisek + altin yagmuru ----
  const fx = E.querySelector('.f-fx'), c2 = fx.getContext('2d'), P = [], W = () => fx.width, H = () => fx.height;
  const boy = () => { fx.width = innerWidth; fx.height = innerHeight; }; boy(); addEventListener('resize', boy);
  const RENK = ['#ffd23f', '#ff5a6e', '#5ad1ff', '#9dff6a', '#ff9a1f', '#d77bff', '#ffffff'];
  let t0 = performance.now(), sonP = 0, sonA = 0;
  const patla = () => { const x = W() * (0.15 + Math.random() * 0.7), y = H() * (0.1 + Math.random() * 0.35), r = RENK[(Math.random() * RENK.length) | 0];
    for (let i = 0; i < 46; i++) { const a = (i / 46) * 6.283, s = 2.2 + Math.random() * 2.6; P.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: 0, o: 1.3 + Math.random() * 0.5, r, k: 2 + Math.random() * 1.5 }); } };
  const ciz = (now) => {
    if (!calis) return;
    const dt = Math.min(0.05, (now - t0) / 1000); t0 = now;
    if (now - sonP > 650) { sonP = now; patla(); if (ses && Math.random() < 0.5) ses('tik'); }
    if (now - sonA > 90) { sonA = now; P.push({ x: Math.random() * W(), y: -10, vx: (Math.random() - 0.5) * 0.6, vy: 1.5 + Math.random() * 1.5, t: 0, o: 6, r: '#ffc531', k: 4 + Math.random() * 3, para: 1, w: Math.random() * 6 }); }
    c2.clearRect(0, 0, W(), H());
    for (let i = P.length - 1; i >= 0; i--) {
      const q = P[i]; q.t += dt; if (q.t > q.o || q.y > H() + 20) { P.splice(i, 1); continue; }
      q.x += q.vx * dt * 60; q.y += q.vy * dt * 60; q.vy += (q.para ? 0.02 : 0.05) * dt * 60; if (!q.para) { q.vx *= 0.985; q.vy *= 0.985; }
      const al = q.para ? 1 : Math.max(0, 1 - q.t / q.o);
      c2.globalAlpha = al; c2.fillStyle = q.r;
      if (q.para) { const sx = Math.abs(Math.cos(q.t * 4 + q.w)); c2.beginPath(); c2.ellipse(q.x, q.y, q.k * sx + 0.5, q.k, 0, 0, 6.283); c2.fill(); c2.strokeStyle = '#a86a00'; c2.lineWidth = 1; c2.stroke(); }
      else { c2.beginPath(); c2.arc(q.x, q.y, q.k * al + 0.4, 0, 6.283); c2.fill(); }
    }
    c2.globalAlpha = 1; requestAnimationFrame(ciz);
  };
  requestAnimationFrame(ciz);

  const kapat = (sonra) => { if (!calis) return; calis = false; v.pause(); E.classList.add('cik'); removeEventListener('resize', boy); setTimeout(() => { E.remove(); sonra(); }, 380); };
  E.querySelector('.f-har').onclick = () => { if (ses) ses('tik'); kapat(() => harita(ilkEksik)); };
  E.querySelector('.f-ana').onclick = () => { if (ses) ses('tik'); kapat(anaSayfa); };
  return E;
}
