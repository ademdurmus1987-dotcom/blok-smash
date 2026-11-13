// Foxi Smash v4.8 (Adem 14 Kas 2026): yeni kazanma sahnesi. Adem test sayfasinda (test-his/kazan.html) 3. tasarimi
// "Dev yildizlar" ve "Havai fisek gecesi" arka planini secti. Sira: ekran parlar -> dev yildizlar donerek yukaridan cakilir
// (her biri sarsinti, halka, isilti, gum sesi) -> "MUKEMMEL!" 3B yazi carpar ve sallanir, fanfar, havai fisekler, konfeti ->
// bolum levhasi -> altin sayaci tik tik artar -> satirlar -> DEVAM. Yazilar SVG ile cizilir (background-clip:text kullanilmaz:
// Adem'in telefonunda beyaz kutu cikiyordu): kademeli 3B yan yuz, koyu kontur, metal kenar, isikli on yuz, parilti.
// Disari: kazanSahne(KZ, d, o) -> durdur(). o: { sesAg(), ses(k,v,r), buzz(ms), sarki(), sarkiDur(), tik(), HEDEF, sn, onceSn, bitir(rect) }

const IK = 'ikon/3b/';
const COIN = new Image(); COIN.src = IK + 'altin.webp?v=1';
let yid = 0;

const TEMA = {
  altin: { g: ['#ffffff', '#fff27a', '#ffc414', '#ff8f00'], d: '#3e1000', e: '#c25a00' },
  pembe: { g: ['#ffffff', '#ffe0f2', '#ff8ccc', '#f03a96'], d: '#3a0028', e: '#a0105e' },
  yesil: { g: ['#ffffff', '#ffffff', '#f4fff0', '#c8f5c0'], d: '#0a4a16', e: '#14802c', k: 'gumus' },
  mor: { g: ['#ffffff', '#ffffff', '#fff3c0', '#ffd34a'], d: '#1d0848', e: '#4a1aa0' },
};
const KENAR = { altin: ['#fffbe0', '#ffd34a', '#b06a00', '#ffe27a', '#8a4a00'], gumus: ['#ffffff', '#dfe8f5', '#8a9ab8', '#ffffff', '#5a6a88'] };
const isle = (a, b, t) => { const p = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function yazi(txt, tema = 'altin', o = {}) {
  txt = esc(txt);
  const T = TEMA[tema], K = KENAR[T.k || 'altin'], id = 'k2y' + (++yid), fs = 100, w = Math.round(txt.length * fs * 0.62 + fs * 0.6), dz = o.derin ?? 14, ky = fs, cx = w / 2, h = fs * 1.3 + dz + 20, kal = o.ince ? 0.16 : 0.24;
  const tx = (ek = '') => `<text x="${cx}" y="${ky}" text-anchor="middle" font-family="'BS Baslik','Baloo 2',sans-serif" font-weight="900" font-size="${fs}" letter-spacing="3" ${ek}>${txt}</text>`;
  let s = `<svg class="yz" viewBox="-16 -14 ${w + 32} ${h + 14}" style="height:${o.h || 'auto'};width:${o.w || 'auto'}"><defs>
  <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset=".05" stop-color="${T.g[0]}"/><stop offset=".4" stop-color="${T.g[1]}"/><stop offset=".62" stop-color="${T.g[2]}"/><stop offset="1" stop-color="${T.g[3]}"/></linearGradient>
  <linearGradient id="${id}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${K[0]}"/><stop offset=".3" stop-color="${K[1]}"/><stop offset=".55" stop-color="${K[2]}"/><stop offset=".75" stop-color="${K[3]}"/><stop offset="1" stop-color="${K[4]}"/></linearGradient>
  <linearGradient id="${id}p" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="${id}u" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity=".05"/></linearGradient>
  <filter id="${id}f" x="-5%" y="-10%" width="110%" height="130%"><feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="b"/>
   <feSpecularLighting in="b" surfaceScale="5" specularConstant="1.15" specularExponent="18" lighting-color="#ffffff" result="s"><feDistantLight azimuth="240" elevation="48"/></feSpecularLighting>
   <feComposite in="s" in2="SourceAlpha" operator="in" result="si"/>
   <feOffset in="SourceAlpha" dy="-4" result="o"/><feComposite in="SourceAlpha" in2="o" operator="out" result="ic"/><feFlood flood-color="${T.d}" flood-opacity=".55"/><feComposite in2="ic" operator="in" result="gol"/>
   <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="si"/><feMergeNode in="gol"/></feMerge>
  </filter>
  <clipPath id="${id}c">${tx()}</clipPath><clipPath id="${id}h"><path d="M0 -20H${w}V${ky - fs * 0.42}Q${w / 2} ${ky - fs * 0.28} 0 ${ky - fs * 0.42}Z"/></clipPath>
  <path id="${id}y" d="M0-10L2.6-2.6 10 0 2.6 2.6 0 10-2.6 2.6-10 0-2.6-2.6Z"/></defs>`;
  s += tx(`fill="#000" fill-opacity=".35" stroke="#000" stroke-opacity=".35" stroke-width="${fs * kal}" stroke-linejoin="round" transform="translate(4 ${dz + 8})"`);
  for (let i = dz; i >= 1; i--) { const c = isle(T.e, T.d, i / dz); s += tx(`fill="${c}" stroke="${i === dz ? T.d : c}" stroke-width="${fs * kal}" stroke-linejoin="round" transform="translate(0 ${i})"`); }
  s += tx(`fill="${T.d}" stroke="${T.d}" stroke-width="${fs * kal}" stroke-linejoin="round"`);
  s += tx(`fill="${T.e}" stroke="url(#${id}k)" stroke-width="${fs * (kal - 0.1)}" stroke-linejoin="round"`);
  s += `<g filter="url(#${id}f)">${tx(`fill="url(#${id}g)"`)}</g>`;
  s += `<g clip-path="url(#${id}h)">${tx(`fill="url(#${id}u)"`)}</g>`;
  s += `<g clip-path="url(#${id}c)"><rect class="par" x="0" y="-20" width="${w * 0.3}" height="${h}" fill="url(#${id}p)" transform="skewX(-22)"/></g>`;
  if (!o.sade) for (let i = 0; i < 3; i++) { const x = w * (0.18 + i * 0.32) + (Math.random() - 0.5) * w * 0.1, y = ky - fs * (0.55 + Math.random() * 0.3); s += `<use href="#${id}y" class="pir" fill="#fff" style="animation-delay:${(i * 0.9 + Math.random() * 0.5).toFixed(2)}s;transform-origin:${x}px ${y}px" transform="translate(${x} ${y}) scale(1.6)"/>`; }
  return s + '</svg>';
}
const yaziDegis = (svg, t) => svg.querySelectorAll('text').forEach((e) => { e.textContent = t; });

// ---------- parcacik: konfeti, havai fisek, isilti, gece gokyuzu ----------
function fxBasla(cv, ortam, ses) {
  const c = cv.getContext('2d'), P = [], d = Math.min(2, devicePixelRatio || 1); let w, h, dur = false;
  w = cv.width = cv.clientWidth * d; h = cv.height = cv.clientHeight * d;
  const R = ['#ffd34a', '#ff5470', '#3fd45a', '#2fa8ff', '#ff9a2e', '#c86bff', '#fff'];
  const yildizCiz = (z) => { c.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? z * 0.28 : z, a = i * Math.PI / 4; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); };
  const fisek = (x, y) => { const cc = R[Math.random() * R.length | 0], c2 = R[Math.random() * R.length | 0]; for (let i = 0; i < 80; i++) { const a = i / 80 * 6.28, v = (2.5 + Math.random() * 4) * d; P.push({ x: w * x, y: h * y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0.05 * d, s: 0.97, r: 0, vr: 0, z: 2.6 * d, c: i % 2 ? cc : c2, k: 'o', t: 80 + Math.random() * 25 }); } if (ses) ses(); };
  function kare() {
    if (dur) return; requestAnimationFrame(kare); c.clearRect(0, 0, w, h);
    if (ortam) {
      if (Math.random() < 0.3) P.push({ x: Math.random() * w, y: Math.random() * h * 0.7, vx: 0, vy: 0, g: 0, s: 1, r: 0, vr: 0.02, z: (1.5 + Math.random() * 4) * d, c: '#fff8d0', k: 'y', t: 70, T: 70 });
      if (Math.random() < 0.025) { const x = 0.1 + Math.random() * 0.8, y = 0.08 + Math.random() * 0.35, cc = R[Math.random() * R.length | 0]; for (let i = 0; i < 70; i++) { const a = i / 70 * 6.28, v = (2 + Math.random() * 3.5) * d; P.push({ x: w * x, y: h * y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0.04 * d, s: 0.97, r: 0, vr: 0, z: 2.2 * d, c: cc, k: 'o', t: 90 }); } }
    }
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i]; p.vy += p.g; p.vx *= p.s; p.vy *= p.s; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.t--; if (p.t <= 0 || p.y > h + 60) { P.splice(i, 1); continue; }
      c.save(); c.translate(p.x, p.y); c.rotate(p.r);
      if (p.k === 'y') { c.globalAlpha = Math.sin(p.t / p.T * Math.PI); c.fillStyle = p.c; yildizCiz(p.z); }
      else if (p.k === 'p') { c.globalAlpha = Math.min(1, p.t / 20); c.scale(Math.cos(p.r * 2), 1); c.drawImage(COIN, -p.z, -p.z, p.z * 2, p.z * 2); }
      else { c.globalAlpha = Math.min(1, p.t / 25); c.fillStyle = p.c; if (p.k === 'k') c.fillRect(-p.z, -p.z / 2, p.z * 2, p.z * Math.abs(Math.cos(p.r * 3))); else { c.beginPath(); c.arc(0, 0, p.z, 0, 7); c.fill(); } }
      c.restore();
    }
  }
  requestAnimationFrame(kare);
  return {
    dur() { dur = true; }, fisek,
    konfeti(n = 140) { for (let i = 0; i < n; i++) P.push({ x: w * 0.5 + (Math.random() - 0.5) * w, y: -Math.random() * h * 0.4, vx: (Math.random() - 0.5) * 4 * d, vy: (Math.random() * 2 + 1) * d, g: 0.06 * d, s: 0.99, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, z: (4 + Math.random() * 5) * d, c: R[i % R.length], k: 'k', t: 300 }); },
    isilti(x, y, n = 24) { x *= d; y *= d; for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = (2 + Math.random() * 8) * d; P.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0.08 * d, s: 0.95, r: Math.random() * 3, vr: 0.1, z: (4 + Math.random() * 6) * d, c: i % 3 ? '#fff6a8' : '#fff', k: i % 2 ? 'y' : 'o', t: 50, T: 50 }); } },
    yagmur(n = 30) { for (let i = 0; i < n; i++) P.push({ x: Math.random() * w, y: -Math.random() * h * 0.6 - 30, vx: (Math.random() - 0.5) * d, vy: (3 + Math.random() * 3) * d, g: 0.12 * d, s: 0.995, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.25, z: (13 + Math.random() * 9) * d, k: 'p', t: 320 }); },
  };
}

export function kazanSahne(KZ, d, o) {
  const zaman = [], sonra = (ms, f) => zaman.push(setTimeout(f, ms)), $ = (q) => KZ.querySelector(q);
  // ---- sesler (oyunun ana ses zinciri uzerinden; ses kapaliysa o.sesAg() null doner) ----
  const ton = (f, t, v, tip = 'triangle', gec = 0, f1) => { const S = o.sesAg(); if (!S) return; const n = S.AC.currentTime + gec, os = S.AC.createOscillator(), g = S.AC.createGain(); os.type = tip; os.frequency.setValueAtTime(f, n); if (f1) os.frequency.exponentialRampToValueAtTime(f1, n + t); g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(v, n + 0.01); g.gain.exponentialRampToValueAtTime(0.001, n + t); os.connect(g); g.connect(S.out); os.start(n); os.stop(n + t + 0.05); };
  const gur = (t, v, fq, gec = 0, tip = 'bandpass') => { const S = o.sesAg(); if (!S) return; const A = S.AC, n = A.currentTime + gec, len = A.sampleRate * t | 0, b = A.createBuffer(1, len, A.sampleRate), dd = b.getChannelData(0); for (let i = 0; i < len; i++) dd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2); const s = A.createBufferSource(); s.buffer = b; const f = A.createBiquadFilter(); f.type = tip; f.frequency.value = fq; const g = A.createGain(); g.gain.value = v; s.connect(f); f.connect(g); g.connect(S.out); s.start(n); };
  const fanfar = () => { [[523, 0], [659, 0.11], [784, 0.22], [1047, 0.34]].forEach(([f, g]) => { ton(f, 0.45, 0.2, 'square', g); ton(f * 2, 0.45, 0.07, 'triangle', g); }); [523, 659, 784, 1047, 1319].forEach((f) => ton(f, 1.4, 0.1, 'sawtooth', 0.5)); ton(131, 1.2, 0.4, 'sine', 0.5); };
  const yildizSes = (i) => { ton(880 * Math.pow(1.26, i), 0.4, 0.3, 'triangle'); ton(1760 * Math.pow(1.26, i), 0.6, 0.12, 'sine', 0.03); gur(0.2, 0.3, 5000); };
  const gum = () => { ton(110, 0.4, 0.8, 'sine', 0, 40); gur(0.25, 0.6, 300, 0, 'lowpass'); };

  const st = d.st, BAS = st >= 3 ? 'MÜKEMMEL!' : st === 2 ? 'SÜPER!' : 'TEBRİKLER!';
  const H = o.HEDEF, sn = Math.min(o.sn, H), sandik = o.sn >= H ? 'Hazır!' : sn + ' / ' + H;
  const satir = [['Kalan top', d.kalan], ['Top bonusu', '+' + d.bonus], ['Sandık', sandik]];
  if (d.zorB) satir.push(['Zor bölüm', '+' + d.zorB]);
  if (!d.ilk) satir.push(['Tekrar', 'yarı ödül']);
  KZ.className = 'on k2on';
  KZ.innerHTML = '<div class="k2-gok"></div><canvas class="k2-arka"></canvas><div class="k2-vin"></div>' +
    '<div class="k2-ic"><div class="k2-yildizlar">' + [0, 1, 2].map((i) => `<div class="k2-yil ${i < st ? '' : 'off'}"><div class="ns"></div><img src="${IK}yildiz.webp?v=1" alt=""></div>`).join('') + '</div>' +
    `<div class="k2-bas">${yazi(BAS, 'pembe', { derin: 14 })}</div>` +
    `<div class="k2-levha">${yazi('BÖLÜM ' + d.L, 'mor', { h: '30px', derin: 5, sade: 1 })}</div>` +
    `<div class="k2-panel"><div class="k2-ust"><img src="${IK}altin.webp?v=1" alt="">${yazi('+0', 'altin', { h: '56px', derin: 8, sade: 1 })}</div><div class="k2-satir">` + satir.map(([a, b]) => `<div>${esc(a)}<b>${esc(b)}</b></div>`).join('') + '</div></div>' +
    (d.yeniK ? `<div class="k2-yeni"><img src="../${d.yeniK.av}?v=1" alt=""><div><small>Yeni karakter kazandın!</small><b>${esc(d.yeniK.ad)}</b></div></div>` : '') +
    `<button class="k2-devam">${yazi('DEVAM', 'yesil', { h: '46px', derin: 7, sade: 1 })}</button></div>` +
    '<canvas class="k2-fx"></canvas><div class="k2-flas"></div>';
  const ic = $('.k2-ic');
  // ekrana sigdir
  { const ak = [...ic.children], ust = Math.min(...ak.map((c) => c.offsetTop)), alt = Math.max(...ak.map((c) => c.offsetTop + c.offsetHeight)), need = alt - ust + 40, z = Math.min(1, KZ.clientHeight / need); if (z < 1) ic.style.zoom = z.toFixed(3); }
  const arka = fxBasla($('.k2-arka'), true), fx = fxBasla($('.k2-fx'), false, () => gur(0.4, 0.25, 2500));
  const sars = () => { KZ.classList.remove('k2-sars'); void KZ.offsetWidth; KZ.classList.add('k2-sars'); };
  const merkez = (el) => { const r = el.getBoundingClientRect(), q = KZ.getBoundingClientRect(); return [r.left + r.width / 2 - q.left, r.top + r.height / 2 - q.top]; };
  const goster = (el, ms) => sonra(ms, () => { if (!el) return; el.style.opacity = 1; el.animate([{ transform: 'translateY(30px) scale(.6)', opacity: 0 }, { transform: 'scale(1.06)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: 'ease-out' }); });

  sonra(80, () => { $('.k2-flas').classList.add('on'); gur(0.6, 0.3, 1400); });
  [...ic.querySelectorAll('.k2-yil')].forEach((y, i) => sonra(250 + i * 460, () => {
    y.style.opacity = 1; y.animate([{ transform: 'translateY(-70vh) scale(2.6) rotate(-220deg)' }, { transform: 'scale(1.3)', offset: 0.75 }, { transform: 'none' }], { duration: 540, easing: 'cubic-bezier(.5,0,.5,1)', fill: 'forwards' });
    sonra(520, () => {
      if (i < st) { y.classList.add('dolu'); yildizSes(i); o.buzz(65); const [x, yy] = merkez(y); fx.isilti(x, yy, 46); const hk = document.createElement('div'); hk.className = 'k2-halka'; hk.style.left = x + 'px'; hk.style.top = yy + 'px'; KZ.appendChild(hk); setTimeout(() => hk.remove(), 650); gum(); sars(); }
      else ton(220, 0.2, 0.15, 'sine');
    });
  }));
  sonra(1750, () => { const b = $('.k2-bas'); b.classList.add('carp'); gum(); fanfar(); o.buzz([50, 30, 50]); sars(); fx.fisek(0.2, 0.25); fx.konfeti(180); if (st >= 3) fx.yagmur(24); sonra(560, () => { b.classList.remove('carp'); b.classList.add('salin'); }); });
  sonra(2200, () => fx.fisek(0.8, 0.2)); sonra(2600, () => fx.fisek(0.5, 0.1));
  if (o.sarki) sonra(2700, () => { if (KZ.classList.contains('on')) o.sarki(); });   // v3.13: (Adem) kazaninca Foxi'nin sarkisi; fanfardan sonra
  goster($('.k2-levha'), 2300); goster($('.k2-panel'), 2600);
  // altin sayaci
  const pn = $('.k2-panel'), u = $('.k2-ust'), sv = u.querySelector('svg'); let n = 0; const adim = Math.max(1, Math.round(d.kaz / 24));
  const say = () => { n = Math.min(d.kaz, n + adim); yaziDegis(sv, '+' + n); o.ses('para', 0.3, 0.95 + 0.5 * n / Math.max(1, d.kaz));
    if (n < d.kaz) sonra(42, say);
    else { u.classList.add('pop'); o.buzz(35); [...pn.querySelectorAll('.k2-satir div')].forEach((e, i) => goster(e, i * 120)); goster($('.k2-yeni'), 400);
      sonra(500, () => { $('.k2-devam').classList.add('on'); ton(660, 0.1, 0.2); ton(990, 0.15, 0.2, 'triangle', 0.07); }); } };
  sonra(2750, say);
  sonra(3800, () => { fx.fisek(0.25, 0.3); sonra(450, () => fx.fisek(0.75, 0.25)); sonra(900, () => fx.fisek(0.5, 0.18)); });

  const durdur = () => { zaman.forEach(clearTimeout); zaman.length = 0; fx.dur(); arka.dur(); };
  $('.k2-devam').onclick = () => { o.tik(); if (o.sarkiDur) o.sarkiDur(); const r = $('.k2-ust img').getBoundingClientRect(); durdur(); o.bitir(r); };
  return durdur;
}
