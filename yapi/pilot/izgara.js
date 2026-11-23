// Foxi Smash v12.0 (23 Kas 2026, Adem: '2000 bolumu ona gore tasarla, ayni gorsel ikinci kez olmasin'): tasarim izgarasi -> bolum verisi.
// Hem oyun (pilot.js, bolum acilirken) hem uretici araclar (uretici/tasarim/*.mjs, node) kullanir. Yalniz hesap: sahne ve kayit yok.
// Kurallar duvar_kaynak.py ile ayni: satirlar USTTEN ALTA, desteksiz blogun alti kendi sirasinda dolar, tas bloklar tugla gibi birlesir.
// Tasarim: { ad, g: ['satir', ...] (harf izgarasi), o: 1 satirlar ortalanir, m: 'r' (resim: on sira resim, arka siralar birlesik dolgu) | 'd' (3 sira ayni),
//            s: sira sayisi (2-3), f: arka dolgu harfi, dl: desteksiz yere konan tur, h: hareket } ya da { ad, p: [[tur, x, y, z], ...] } (dogrudan parca, blok birimi)
const S = 1.55, GX = 1.004, GY = 0.003;
// harf -> tek blok turu
export const TEK = { S: 'ksTas', C: 'ksSandik', K: 'ksSandikK', P: 'ksSandikM', T: 'ksTNT', Y: 'ksYildiz', I: 'ksBuz', r: 'oyK', w: 'oyB', b: 'oyM', g: 'oyY', p: 'oyN', o: 'oyT', y: 'oyS', v: 'oyP', A: 'oyA',
  z: 'oyZ', h: 'oyH', q: 'oyG', k: 'oyE', a: 'oyL', F: 'ksFici', R: 'ksFiciK', e: 'ksSiseY', u: 'ksSiseB', m: 'ksSiseM',
  1: 'kjK', 2: 'kjM', 3: 'kjS', 4: 'kjY', 5: 'kjP', 6: 'kjT', 7: 'kjN', 8: 'kjA' };
// yan yana ayni harf -> tek uzun cubuk
export const CUB = { r: 'K', b: 'M', g: 'Y', p: 'N', o: 'T', y: 'S', v: 'P', w: 'B', z: 'Z', h: 'H', q: 'G', k: 'E', a: 'L' };
export const GEN = { ksTas2: 2, ksTas3: 3, ksTas4: 4, ksKalas2: 2, ksKalas3: 3, ksKemer: 3, ksBuz3: 3 };
for (const c of Object.values(CUB)) for (const n of [2, 3, 4]) GEN['uz' + n + c] = n;
for (const c of 'KMSYPTNA') { GEN['kvB' + c] = 2; GEN['kr3' + c] = 3; }
export const BOY = { ksKalas1: 0.5, ksKalas2: 0.5, ksKalas3: 0.5, ksDirek: 2, ksSutun: 2, ksMorSutun: 2, ksKemer: 2 };
for (const c of 'KMSYPTNA') { BOY['kvU' + c] = 2; BOY['kvL' + c] = 3; BOY['kvB' + c] = 2; }
const genW = (t) => GEN[t] || 1, boyH = (t) => BOY[t] || 1;

// n uzunlugu parcalara boler; kay: tugla kaydirmasi
function bol(n, enCok, kay) {
  const L = []; if (kay && n > enCok) { L.push(2); n -= 2; }
  while (n > enCok) { if (n - enCok === 1 && enCok > 2) { L.push(enCok - 1); n -= enCok - 1; } else { L.push(enCok); n -= enCok; } }
  if (n) L.push(n); return L;
}
// izgara -> [tur, x, y, siralar|null]
export function parcalar(G0, ort, birlestir) {
  let G = G0.slice().reverse(); const R = G.length, K = Math.max(...G.map((r) => r.length)), kay = new Array(R).fill(0);
  if (ort) G = G.map((r, i) => { const d = K - r.length; if (d % 2 === 0) return '.'.repeat(d / 2) + r + '.'.repeat(d / 2); kay[i] = d / 2; return r.padEnd(K, '.'); });
  else G = G.map((r) => r.padEnd(K, '.'));
  const ox = (K - 1) / 2, L = [], kul = G.map(() => new Array(K).fill(false));
  for (let r = 0; r < R; r++) for (let c = 0; c < K;) {
    const h = G[r][c]; if (kul[r][c]) { c++; continue; }
    let n = 1; const es = () => { while (c + n < K && G[r][c + n] === h && !kul[r][c + n]) n++; };
    if (h === 'B') { es(); n = Math.min(n, 4); L.push([['', 'ksTas', 'ksTas2', 'ksTas3', 'ksTas4'][n], c + (n - 1) / 2 - ox, r, null]); c += n; continue; }
    if (h === 'S' || h === 'L' || h === 'l' || (birlestir && CUB[h])) {
      es(); const cub = birlestir && CUB[h], katlar = h === 'L' ? [0, 0.5] : [0];
      katlar.forEach((k, ki) => {
        const pp = bol(n, cub ? 4 : 3, (r + ki) % 2); if (r % 2) pp.reverse(); let x = c;
        for (const w of pp) { const t = cub ? (w === 1 ? TEK[h] : 'uz' + w + cub) : h === 'S' ? ['', 'ksTas', 'ksTas2', 'ksTas3'][w] : 'ksKalas' + w; L.push([t, x + (w - 1) / 2 - ox, r + k, null]); x += w; }
      }); c += n; continue;
    }
    if ('UGDNJ'.includes(h)) {   // dikey 2 boy: mor sutun, gri sutun, direk; N / J uzun kavanoz (mavi / turuncu)
      const t = { U: 'ksMorSutun', G: 'ksSutun', D: 'ksDirek', N: 'kvUM', J: 'kvUT' }[h];
      if (r + 1 < R && G[r + 1][c] === h && !kul[r + 1][c]) { L.push([t, c - ox, r, null]); kul[r + 1][c] = true; }
      else if (h === 'D') { L.push(['ksKalas1', c - ox, r, null], ['ksKalas1', c - ox, r + 0.5, null]); }
      else L.push([{ U: 'oyP', G: 'ksTas', N: 'kjM', J: 'kjT' }[h], c - ox, r, null]);
      c++; continue;
    }
    if (h === 'd') { L.push(['ksTas', c - ox, r, 'arka']); c++; continue; }
    if (TEK[h]) L.push([TEK[h], c - ox, r, null]);
    c++;
  }
  for (const p of L) p[1] += kay[Math.floor(p[2] + 1e-6)] || 0;
  return { L, K, kay, G };
}
const ort2 = (a, b, c, d) => Math.min(a, c) - Math.max(b, d);
// agirlik merkezi alttaki destegin ustunde olmayan blogun altina dolgu (tek derinlik sirasi)
export function destekle(P, dl) {
  let n = 0; const kutu = (p) => { const w = genW(p[0]); return [p[1] - w / 2, p[1] + w / 2, p[2], p[2] + boyH(p[0])]; };
  for (;;) {
    let ek = null; const Z = P.slice().sort((a, b) => a[2] - b[2]);
    for (const p of Z) {
      if (p[2] <= 0) continue; const a = kutu(p), alt = P.map(kutu).filter((q) => Math.abs(q[3] - a[2]) < 0.01 && ort2(a[1], a[0], q[1], q[0]) > 0.05);
      if (alt.length) { const lo = Math.min(...alt.map((q) => Math.max(a[0], q[0]))), hi = Math.max(...alt.map((q) => Math.min(a[1], q[1]))); if (lo + 0.05 < p[1] && p[1] < hi - 0.05) continue; }
      ek = [p, a]; break;
    }
    if (!ek) return n;
    const [p, a] = ek; let yb = a[2] >= 1 ? a[2] - 1 : 0, t = dl || (TEK_TERS[p[0]] ? p[0] : 'ksTas'); const w = Math.round(a[1] - a[0]), aday = [];
    for (let i = 0; i < Math.max(1, w); i++) aday.push(a[0] + 0.5 + i);
    const Q = P.map(kutu), bos = (cx) => !Q.some((q) => ort2(cx + 0.5, cx - 0.5, q[1], q[0]) > 0.05 && ort2(a[2], yb, q[3], q[2]) > 0.05);
    const iyi = aday.filter(bos).sort((x, y) => Math.abs(x - p[1]) - Math.abs(y - p[1])); if (!iyi.length) return -1;
    if (a[2] - yb < 0.99) { yb = a[2] - 0.5; t = 'ksKalas1'; }
    P.push([t, iyi[0], yb, 0]); if (++n > 200) return -1;
  }
}
const TEK_TERS = {}; for (const k in CUB) TEK_TERS[TEK[k]] = k;
// resim kipinde arka sira: her satirda bos olmayan hucreler birlesik dolgu
function arkaSira(G, kay, K, f) {
  const L = [], ox = (K - 1) / 2;
  G.forEach((row, r) => { let c = 0; while (c < K) { if (row[c] === '.') { c++; continue; } let n = 0; while (c + n < K && row[c + n] !== '.') n++;
    const st = f === 'S', pp = bol(n, st ? 3 : 4, r % 2); if (r % 2) pp.reverse(); let x = c;
    for (const w of pp) { L.push([st ? ['', 'ksTas', 'ksTas2', 'ksTas3'][w] : w === 1 ? TEK[f] : 'uz' + w + CUB[f], x + (w - 1) / 2 - ox + (kay[r] || 0), r, 0]); x += w; } c += n; } });
  return L;
}
// tasarim -> [tur, x, y, z] listesi (blok birimi); dolgu < 0: kurulamadi
export function yerlestir(d) {
  if (d.p) return { P: d.p, dolgu: 0 };
  const s = d.s || 3, zs = s === 2 ? [-0.5, 0.5] : s === 1 ? [0] : [-1, 0, 1], on = zs[zs.length - 1], { L, K, kay, G } = parcalar(d.g, d.o, d.b !== 0), out = []; let dolgu = 0;
  for (const z of zs) {
    let P;
    if (d.m === 'r' && z !== on) P = arkaSira(G, kay, K, d.f || 'S'); else P = L.filter((p) => p[3] !== 'arka' || z === zs[0]).map((p) => [p[0], p[1], p[2], 0]);
    const n = destekle(P, d.dl); if (n < 0) return { P: out, dolgu: -1 }; dolgu += n;
    for (const p of P) out.push([p[0], p[1], p[2], z]);
  }
  return { P: out, dolgu };
}
const KUCUK = [[['ksSandik', 'ksSandik'], ['oyK', 'oyB'], ['ksTNT', 'ksYildiz']], [['ksTas2'], ['oyM', 'oyS'], ['ksSandikM', 'ksSandikM']], [['ksFici', 'ksFici'], ['ksSandik', 'ksSandik'], ['oyY', 'oyN']],
  [['ksBuz', 'ksBuz'], ['uz2N'], ['kjS', 'kjM']], [['ksTas2'], ['ksSutun', 'ksSutun']], [['uz2T'], ['uz2L'], ['oyA']]];
export function genislet(n, d) {
  const { P } = yerlestir(d), out = [], zT = P.map((p) => Math.abs(p[3])).reduce((a, b) => Math.max(a, b), 0);
  P.forEach(([t, x, y, z], i) => {
    const o = { t, x: +(x * S * GX).toFixed(3), z: +(z * S * GX).toFixed(3), y: +(y * S + Math.round(y * 2) * GY).toFixed(3), p: 'ana.0', id: t + i };
    if (t.startsWith('ksTas')) { if (y >= 3) o.km = 0.35; o.kir = 4; }
    if (t.startsWith('ksKalas') && y < 3) o.km = 2.5;
    if (t === 'ksFici' || t === 'ksFiciK') o.kutu = 1;
    if (t === 'ksTNT') o.patlama = { r: 4.5, guc: 13 };
    if (t === 'ksKemer') o.bos = 1;
    out.push(o);
  });
  let x0 = 0, x1 = 0; for (const [t, x] of P) { x0 = Math.min(x0, x - genW(t) / 2); x1 = Math.max(x1, x + genW(t) / 2); }
  const r = Math.max(-x0, x1) * S + 0.25, rz = (zT + 0.5 + (P.some((p) => p[0].startsWith('kvB')) ? 0.5 : 0)) * S + 0.2;
  const B = { ad: d.ad, top: 30, kaide: 'mor', kam: { pitch: 1, yaw: 0, atis: 0.9, genis: 0.95 }, ada: [{ id: 'ana', x: 0, z: 0, katlar: [{ sekil: 'kare', r: +r.toFixed(3), rz: +rz.toFixed(3), ust: 0, kal: 0.75 }] }], kopru: [], parca: out, hareketTip: d.h || 'sabit' };
  let tip = d.h;
  if (tip === 'don') B.hareket = { tip, w: 0.35 }; else if (tip === 'asansor') B.hareket = { tip, a: 1.4, h: 0.85 }; else if (tip === 'kay') B.hareket = { tip, a: 1.8, h: 0.7 };
  else if (tip === 'iki' || tip === 'uc') {
    const r2 = S + 0.25, X = r + 1.3 + r2; if (tip === 'uc' && r > 6) tip = B.hareketTip = 'iki';
    (tip === 'iki' ? [['yan', n % 2 ? X : -X]] : [['yan', X], ['sol', -X]]).forEach(([id, XX], yi) => {
      B.ada.push({ id, x: +XX.toFixed(3), z: 0, katlar: [{ sekil: 'kare', r: r2, rz: +rz.toFixed(3), ust: 0, kal: 0.75 }] });
      KUCUK[(n + yi * 2) % KUCUK.length].forEach((sira, rr) => { let x = -sira.reduce((a, t) => a + genW(t), 0) / 2;
        for (const t of sira) { const w = genW(t); for (const z of zT >= 1 ? [-1, 0, 1] : [-0.5, 0.5]) { const o = { t, x: +(XX + (x + w / 2) * S * GX).toFixed(3), z: +(z * S * GX).toFixed(3), y: +(rr * S + 2 * rr * GY).toFixed(3), p: id + '.0', id: id + t + rr + x + z };
          if (t === 'ksTNT') o.patlama = { r: 4.5, guc: 13 }; if (t.startsWith('ksFici')) o.kutu = 1; if (t.startsWith('ksTas')) o.kir = 4; out.push(o); } x += w; } });
    });
  }
  return B;
}
