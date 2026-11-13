// Foxi Smash v4.5 - Faz 1E: hareketli kazanma girisi (Adem 13 Kas: "oyun kazanma ekrani cok hos hareketli")
// Sira (~3.4 sn, dokununca atlanir): sahne kararir -> FOXI SMASH harfleri tek tek damga gibi iner -> iki yandan altin borular
// yukselir ve isilti fiskirtir, arkada havai fisekler -> ortada "+N" altin yigini, paralar tek tek sol ustteki sayaca ucar,
// sayac tik tik artar (perde yukselir) -> logo yukari kayar, ekran acilir ve sonra() (kazanma karti) cagrilir.
const BORU = '<svg viewBox="0 0 120 220" class="kt-boru-s"><defs><linearGradient id="kbA" x1="0" x2="1"><stop offset="0" stop-color="#8a4a00"/><stop offset=".35" stop-color="#ffe27a"/><stop offset=".6" stop-color="#ffb62a"/><stop offset="1" stop-color="#a85a00"/></linearGradient></defs>' +
  '<path d="M52 214h16l-1-150h-14z" fill="url(#kbA)" stroke="#5a2a00" stroke-width="3"/>' +
  '<rect x="47" y="150" width="26" height="10" rx="3" fill="#e8302a" stroke="#6a0a0a" stroke-width="2.5"/><rect x="47" y="100" width="26" height="9" rx="3" fill="#ffd34a" stroke="#5a2a00" stroke-width="2.5"/>' +
  '<path d="M53 70C50 40 22 24 6 10h108C98 24 70 40 67 70z" fill="url(#kbA)" stroke="#5a2a00" stroke-width="3.5" stroke-linejoin="round"/>' +
  '<ellipse cx="60" cy="10" rx="54" ry="8" fill="#5a2a00"/><ellipse cx="60" cy="10" rx="47" ry="5" fill="#2a1400"/><path d="M14 14q46 12 92 0" fill="none" stroke="#fff6c0" stroke-width="3" opacity=".7"/></svg>';

export function kutlamaOyna({ altinOnce, kaz, ses, para, titret, sonra }) {
  const E = document.createElement('div'); E.id = 'kutla';
  const harf = (s, cls, d0) => [...s].map((c, i) => '<i class="' + cls + '" style="animation-delay:' + (d0 + i * 0.07).toFixed(2) + 's">' + c + '</i>').join('');
  E.innerHTML = '<canvas></canvas><div class="kt-say"><em class="kt-coin"></em><b>' + altinOnce + '</b></div>' +
    '<div class="kt-logo"><div class="kt-l1">' + harf('FOXI', 'kt-h', 0.25) + '</div><div class="kt-l2">' + harf('SMASH', 'kt-h', 0.6) + '</div></div>' +
    '<div class="kt-boru sol">' + BORU + '</div><div class="kt-boru sag">' + BORU + '</div>' +
    '<div class="kt-yigin"><span class="kt-n">+' + kaz + '</span><div class="kt-y">' + Array.from({ length: 7 }, (_, i) => '<em class="kt-coin" style="--i:' + i + '"></em>').join('') + '</div></div>';
  document.body.appendChild(E);
  requestAnimationFrame(() => E.classList.add('on'));
  // ---- canvas: havai fisek + borulardan altin isilti ----
  const bS = E.querySelector('.kt-boru.sol'), bG = E.querySelector('.kt-boru.sag'), cv = E.querySelector('canvas'), x = cv.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1), ps = []; let W = 0, H = 0, calis = true, son = 0, fis = 0.5, t0 = 0;
  const boy = () => { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; }; boy();
  const RENK = ['#ffd23f', '#ff9a1c', '#ff5a6e', '#5ee0ff', '#8cf05a', '#d59aff', '#ffffff'];
  const patla = () => { const cx = W * (0.12 + Math.random() * 0.76), cy = H * (0.08 + Math.random() * 0.34), c = RENK[Math.floor(Math.random() * RENK.length)], n = 40 + Math.floor(Math.random() * 24), hz = 150 + Math.random() * 140;
    for (let i = 0; i < n; i++) { const a = (i / n) * 6.283 + Math.random() * 0.2, v = hz * (0.55 + Math.random() * 0.5); ps.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, o: 1, c: Math.random() < 0.25 ? '#fff' : c, r: 1.6 + Math.random() * 1.8, k: 0.8 + Math.random() * 0.6, iz: 1 }); } };
  const fiskir = (sx, sy, yon) => { for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + yon * (0.22 + Math.random() * 0.2), v = 380 + Math.random() * 260; ps.push({ x: sx, y: sy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, o: 1, c: Math.random() < 0.3 ? '#fff6c0' : '#ffc83a', r: 1.4 + Math.random() * 2, k: 0.7 + Math.random() * 0.5, iz: 0 }); } };
  const kare = (ts) => {
    if (!calis) return; requestAnimationFrame(kare); const dt = Math.min(0.05, son ? (ts - son) / 1000 : 0.016); son = ts; t0 += dt;
    fis -= dt; if (fis <= 0 && t0 > 0.6) { patla(); fis = 0.35 + Math.random() * 0.5; }
    if (t0 > 0.75 && t0 < 2.7) { const a = bS.getBoundingClientRect(), b = bG.getBoundingClientRect(); fiskir(a.left + a.width * 0.72, a.top + 14, 1); fiskir(b.left + b.width * 0.28, b.top + 14, -1); }   // borunun agzindan
    x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H); x.globalCompositeOperation = 'lighter'; x.lineCap = 'round';
    for (let i = ps.length - 1; i >= 0; i--) { const p = ps[i]; const sur = p.iz ? 1.6 : 0.9; p.vx *= 1 - dt * sur; p.vy = p.vy * (1 - dt * sur) + (p.iz ? 90 : 320) * dt; const px = p.x, py = p.y; p.x += p.vx * dt; p.y += p.vy * dt; p.o -= dt * p.k; if (p.o <= 0) { ps.splice(i, 1); continue; }
      x.globalAlpha = Math.min(1, p.o * 1.4); x.strokeStyle = p.c; x.lineWidth = p.r; x.beginPath(); x.moveTo(px - p.vx * 0.025, py - p.vy * 0.025); x.lineTo(p.x, p.y); x.stroke(); }
    x.globalAlpha = 1;
  };
  requestAnimationFrame(kare);
  // ---- sesler ve paralar ----
  const T = []; const zaman = (ms, f) => T.push(setTimeout(f, ms));
  zaman(260, () => { ses('bonus'); titret(30); }); zaman(620, () => { ses('bonus'); titret(30); });
  const sayEl = E.querySelector('.kt-say b'), yig = E.querySelector('.kt-yigin'), hedef = E.querySelector('.kt-say .kt-coin');
  const adet = Math.min(14, Math.max(5, Math.round(kaz / 6))); let deger = altinOnce;
  for (let i = 0; i < adet; i++) zaman(1350 + i * 95, () => {
    const a = yig.getBoundingClientRect(), b = hedef.getBoundingClientRect(), c = document.createElement('em'); c.className = 'kt-coin kt-ucan';
    c.style.left = (a.left + a.width / 2 - 14 + (Math.random() - 0.5) * 40) + 'px'; c.style.top = (a.top + a.height * 0.45) + 'px'; E.appendChild(c);
    requestAnimationFrame(() => { c.style.transform = 'translate(' + (b.left - parseFloat(c.style.left)) + 'px,' + (b.top - parseFloat(c.style.top)) + 'px) scale(.7)'; c.style.opacity = '0.95'; });
    setTimeout(() => { c.remove(); deger = i === adet - 1 ? altinOnce + kaz : Math.round(altinOnce + kaz * (i + 1) / adet); sayEl.textContent = deger; sayEl.parentNode.classList.remove('vur'); void sayEl.offsetWidth; sayEl.parentNode.classList.add('vur'); para(0.9 + 0.5 * i / adet); }, 520);
  });
  let bitti = false;
  const bitir = () => { if (bitti) return; bitti = true; T.forEach(clearTimeout); E.classList.add('cik'); setTimeout(() => { calis = false; E.remove(); }, 420); sonra(); };
  zaman(1350 + adet * 95 + 900, bitir);
  E.addEventListener('pointerdown', () => { if (t0 > 0.5) bitir(); });
}
