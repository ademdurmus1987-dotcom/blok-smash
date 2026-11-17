// Foxi Smash — parlak blok sekil kutuphanesi (prosedurel, dis asset yok).
// Tarz: seker / oyuncak plastik; keskin kose yok, her kenar yuvarlatilmis; guclu parlama, doygun renk.
// Birim: 1 = oyundaki bir kup kenari (oyunda S ile olceklenir). Geometri sekil basina BIR kez kurulur
// ve butun kopyalar/instance'lar paylasir; malzeme (tur, renk) basina bir kez kurulur.
//
// Kullanim:
//   const K = sekilKutuphanesi({ THREE, env, mergeGeometries, dusuk })
//   K.mesh('kavanoz-orta', 'kirmizi')          -> paylasimli Mesh
//   K.instanced('plaka-uzun', 'mor', 20)        -> InstancedMesh
//   K.fizik('kavanoz-uzun', S)                  -> [{ tip:'silindir'|'kutu', ... }] carpisma tanimi
//   K.govde(CANNON, 'tas', S, kutle)            -> CANNON.Body
// NOT: Seviyelere bagli DEGIL (Adem onay verince kale.js/sekil.js'e eklenir).
import { PALET, MALZEME, OLCU } from './ayar.js';

export const SEKILLER = [
  'kavanoz-kisa', 'kavanoz-orta', 'kavanoz-uzun',
  'plaka-uzun', 'plaka-orta', 'plaka-kare', 'plaka-uzun-capa', 'plaka-orta-capa', 'plaka-kare-capa',
  'buz', 'buz-3', 'buz-kolon', 'buz-plaka-4', 'buz-plaka-6', 'tas', 'kutuk', 'foxi', 'platform'
];
// renkli olanlar (paletteki 6 renkle boyanir); digerlerinin rengi malzemesinden gelir
export const RENKLI = (ad) => ad.startsWith('kavanoz') || ad.startsWith('plaka');

export function sekilKutuphanesi({ THREE: T0, env, mergeGeometries, dusuk = false }) {
  // v6.13 (Adem 18 Kas: 168 blokta oyun agirlasti): dusuk kipte (oyun) torna/kure/kose/bevel bolumleri azaltilir; blok ~6900 -> ~800 ucgen
  const THREE = !dusuk ? T0 : Object.assign({}, T0, {
    LatheGeometry: class extends T0.LatheGeometry { constructor(p, n = 12, a, b) { super(p, Math.max(12, Math.round(n / 3)), a, b); } },
    SphereGeometry: class extends T0.SphereGeometry { constructor(r, w = 32, h = 16, ...x) { super(r, Math.max(8, Math.round(w / 2)), Math.max(6, Math.round(h / 2)), ...x); } }
  });
  const GEO = new Map(), MAT = new Map(), TEX = new Map();

  // ---------------- yardimcilar ----------------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function cnv(w, h, ciz, rep) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; ciz(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
    return t;
  }
  // tekrarlanabilir deger gurultusu (dokular icin, sabit tohum: her acilista ayni)
  function gurultu(seed) {
    const h = (x, y) => { let n = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0; n = (n ^ (n >>> 13)) * 1274126177 | 0; return ((n ^ (n >>> 16)) >>> 0) / 4294967295; };
    const sm = (t) => t * t * (3 - 2 * t);
    return (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = sm(x - xi), yf = sm(y - yi);
      const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1); return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf; };
  }
  // yuvarlak koseli kutu: alt bolumlu kutunun koseleri kureye izdusurulur (normaller analitik)
  function yuvarlakKutu(w, h, d, r, seg = 5) {
    r = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3); if (dusuk) seg = Math.min(seg, 2);
    const n = 2 * seg + 1, g = new THREE.BoxGeometry(1, 1, 1, n, n, n), P = g.attributes.position, N = g.attributes.normal;
    const H = [w / 2, h / 2, d / 2], I = H.map((x) => x - r), q = [0, 0, 0], c = [0, 0, 0];
    const yeni = (t, ax) => { const k = Math.round((t + 0.5) * n); return k <= seg ? -H[ax] + (k / seg) * r : I[ax] + ((k - seg - 1) / seg) * r; };
    // UV: kutunun izgara UV'si koseye sikistirilan satirlari da sayar; duz yuz dokunun tamamini gostersin diye UV yeni konumdan hesaplanir
    const UV = g.attributes.uv, eks = (nx, ny) => Math.abs(nx) > 0.5 ? [2, 1] : Math.abs(ny) > 0.5 ? [0, 2] : [0, 1];
    for (let i = 0; i < UV.count; i++) {
      const [au, av] = eks(N.getX(i), N.getY(i)), u = UV.getX(i), v = UV.getY(i);
      UV.setXY(i, (yeni(u - 0.5, au) + H[au]) / (2 * H[au]), (yeni(v - 0.5, av) + H[av]) / (2 * H[av]));
    }
    for (let i = 0; i < P.count; i++) {
      q[0] = yeni(P.getX(i), 0); q[1] = yeni(P.getY(i), 1); q[2] = yeni(P.getZ(i), 2);
      let L = 0; for (let a = 0; a < 3; a++) { c[a] = clamp(q[a], -I[a], I[a]); L += (q[a] - c[a]) ** 2; } L = Math.sqrt(L) || 1;
      const nx = (q[0] - c[0]) / L, ny = (q[1] - c[1]) / L, nz = (q[2] - c[2]) / L;
      P.setXYZ(i, c[0] + nx * r, c[1] + ny * r, c[2] + nz * r); N.setXYZ(i, nx, ny, nz);
    }
    return g;
  }
  // profil koselerine yay (fillet): pts [[r,y,yaricap]], torna (Lathe) icin puruzsuz nokta listesi
  function yumusakProfil(pts, adim = 6) {
    const out = []; if (dusuk) adim = Math.min(adim, 2);
    for (let i = 0; i < pts.length; i++) {
      const [x, y, rr] = pts[i];
      if (!rr || i === 0 || i === pts.length - 1) { out.push(new THREE.Vector2(x, y)); continue; }
      const a = new THREE.Vector2(pts[i - 1][0], pts[i - 1][1]), b = new THREE.Vector2(x, y), cc = new THREE.Vector2(pts[i + 1][0], pts[i + 1][1]);
      const v1 = a.clone().sub(b), v2 = cc.clone().sub(b), l1 = v1.length(), l2 = v2.length(); v1.normalize(); v2.normalize();
      const th = Math.acos(clamp(v1.dot(v2), -1, 1)); if (th > Math.PI - 1e-3) { out.push(b); continue; }
      let t = rr / Math.tan(th / 2); t = Math.min(t, l1 * 0.5, l2 * 0.5); const rad = t * Math.tan(th / 2);
      const p1 = b.clone().addScaledVector(v1, t), p2 = b.clone().addScaledVector(v2, t), bis = v1.clone().add(v2).normalize(), mc = b.clone().addScaledVector(bis, rad / Math.sin(th / 2));
      let a1 = Math.atan2(p1.y - mc.y, p1.x - mc.x), a2 = Math.atan2(p2.y - mc.y, p2.x - mc.x), da = a2 - a1; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      for (let k = 0; k <= adim; k++) { const an = a1 + da * k / adim; out.push(new THREE.Vector2(mc.x + Math.cos(an) * rad, mc.y + Math.sin(an) * rad)); }
    }
    return out;
  }
  // torna profili icin u/v'ye gore boyanan doku: boya(u, r, y, i) -> css renk ; v = nokta sirasi (Lathe UV'si ile ayni)
  function tornaDoku(prof, Wc, Hc, boya) {
    const N = prof.length;
    return cnv(Wc, Hc, (x) => {
      const im = x.createImageData(Wc, Hc), D = im.data;
      for (let py = 0; py < Hc; py++) {
        const v = 1 - (py + 0.5) / Hc, f = v * (N - 1), j = Math.min(N - 2, Math.floor(f)), k = f - j, r = prof[j].x + (prof[j + 1].x - prof[j].x) * k, y = prof[j].y + (prof[j + 1].y - prof[j].y) * k;
        for (let px = 0; px < Wc; px++) { const c = boya((px + 0.5) / Wc, r, y, j); const o = (py * Wc + px) * 4; D[o] = c[0]; D[o + 1] = c[1]; D[o + 2] = c[2]; D[o + 3] = 255; }
      }
      x.putImageData(im, 0, 0);
    });
  }
  const rgb = (h) => { const c = new THREE.Color(h); return [c.r * 255, c.g * 255, c.b * 255]; };   // sRGB hex -> 0..255
  const karis = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  // yuvarlak koseli dikdortgen sekli (Extrude icin)
  function yuvDik(w, h, r, s = new THREE.Shape()) {
    const x = -w / 2, y = -h / 2; r = Math.min(r, w / 2, h / 2);
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  }
  function delik(w, h, r) { return yuvDik(w, h, r, new THREE.Path()); }
  // Extrude: sekil XY duzleminde, derinlik +z yonunde; kenarlar bevel ile yumusak
  function cikinti(sekiller, derin, bevel, seg = 4, egri = 24) {
    if (dusuk) { seg = 1; egri = Math.max(3, Math.round(egri / 4)); }
    const g = new THREE.ExtrudeGeometry(sekiller, { depth: derin, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.85, bevelSegments: seg, curveSegments: egri });
    return g;
  }
  // pati izi: ana taban + 4 parmak (ust uste binmeyen ayri sekiller)
  function patiSekil(boy) {
    const s = boy, L = [];
    const taban = new THREE.Shape(); taban.absellipse(0, -0.17 * s, 0.25 * s, 0.2 * s, 0, Math.PI * 2, false, 0); L.push(taban);
    for (const [x, y, rx, ry, a] of [[-0.31, 0.06, 0.095, 0.12, 0.35], [-0.115, 0.22, 0.1, 0.13, 0.1], [0.115, 0.22, 0.1, 0.13, -0.1], [0.31, 0.06, 0.095, 0.12, -0.35]]) {
      const p = new THREE.Shape(); p.absellipse(x * s, y * s, rx * s, ry * s, 0, Math.PI * 2, false, a); L.push(p);
    }
    return L;
  }
  // capa: halka + govde + kol + alt yay + uclar
  function capaSekil(boy) {
    const s = boy, L = [];
    const halka = new THREE.Shape(); halka.absarc(0, 0.34 * s, 0.1 * s, 0, Math.PI * 2, false); halka.holes.push(new THREE.Path().absarc(0, 0.34 * s, 0.05 * s, 0, Math.PI * 2, true)); L.push(halka);
    const govde = yuvDik(0.075 * s, 0.56 * s, 0.035 * s); L.push(govdeKay(govde, 0, -0.02 * s));
    L.push(govdeKay(yuvDik(0.34 * s, 0.07 * s, 0.035 * s), 0, 0.17 * s));
    const yay = new THREE.Shape(); const R1 = 0.3 * s, R0 = 0.23 * s, cy = -0.02 * s;
    yay.absarc(0, cy, R1, Math.PI * 1.08, Math.PI * 1.92, false); yay.absarc(0, cy, R0, Math.PI * 1.92, Math.PI * 1.08, true); L.push(yay);
    for (const sx of [-1, 1]) { const u = new THREE.Shape(), ax = sx * 0.3 * s, ay = cy - 0.07 * s; u.moveTo(ax - sx * 0.09 * s, ay - 0.02 * s); u.lineTo(ax + sx * 0.06 * s, ay + 0.13 * s); u.lineTo(ax + sx * 0.05 * s, ay - 0.06 * s); u.closePath(); L.push(u); }
    return L.filter(Boolean);
  }
  function govdeKay(sh, dx, dy) { const s2 = new THREE.Shape(sh.getPoints(24).map((p) => new THREE.Vector2(p.x + dx, p.y + dy))); return s2; }

  // birlesik geometri: [[geo, malzemeAnahtari]] -> tek geometri + grup -> malzeme sirasi
  function birlestir(parcalar) {
    const anah = [], gs = [];
    for (const [g0, m] of parcalar) {
      let g = g0.index ? g0.toNonIndexed() : g0;
      if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
      if (!g.attributes.normal) g.computeVertexNormals();
      gs.push(g); if (!anah.includes(m)) anah.push(m);
    }
    const M = mergeGeometries(gs, true);
    M.groups.forEach((gr, i) => { gr.materialIndex = anah.indexOf(parcalar[i][1]); });
    // ayni malzemedeki ardisik gruplari birlestir (daha az cizim)
    M.computeBoundingSphere(); M.computeBoundingBox();
    return { geo: M, anah };
  }

  // ---------------- malzemeler ----------------
  function fizMat(key, opts) {
    if (MAT.has(key)) return MAT.get(key);
    const o = Object.assign({}, opts); if (o.color) o.color = new THREE.Color(o.color);
    if (o.attenuationColor) o.attenuationColor = new THREE.Color(o.attenuationColor);
    if (dusuk) { const ornek = new THREE.MeshStandardMaterial(); for (const k in o) if (!(k in ornek)) delete o[k]; if (o.roughness != null) o.roughness = Math.max(0.12, o.roughness * 0.85); }   // v6.13: telefonda cila katmani yok (Standard)
    const m = dusuk ? new THREE.MeshStandardMaterial(o) : new THREE.MeshPhysicalMaterial(o); m.envMap = env || null; m.name = key; MAT.set(key, m); return m;
  }
  function plastik(hex, ek = {}) { return fizMat('plastik:' + hex + JSON.stringify(ek), Object.assign({}, MALZEME.plastik, { color: hex }, ek)); }
  const altinMat = () => fizMat('altin', MALZEME.altin);
  const beyazMat = () => fizMat('beyaz', MALZEME.beyaz);
  const koyuMat = () => fizMat('koyu', MALZEME.koyu);

  // ---------------- dokular ----------------
  function seritDoku(renk, vSerit) {   // kapak yani: beyaz + govde renginde dikey seritler; ust kapak duz renk
    const k = 'serit:' + renk + vSerit; if (TEX.has(k)) return TEX.get(k);
    const p = PALET[renk], A = rgb('#fffaf3'), B = rgb(p.ana), Bk = rgb(p.koyu);
    const t = tornaDoku(KAPAK_PROF, 256, 64, (u, r, y, j) => {
      if (j >= vSerit) return karis(B, rgb(p.acik), 0.12);
      const s = (u * 14) % 1, h = s < 0.5 ? s * 2 : (s - 0.5) * 2;   // 14 serit; serit icinde 0..1
      const kenar = clamp(Math.min(h, 1 - h) * 9, 0, 1);              // serit kenari yumusak gecis
      return s < 0.5 ? karis(Bk, B, kenar) : karis(karis(A, B, 0.35), A, kenar);
    });
    TEX.set(k, t); return t;
  }
  function catlakDoku() {   // buz: acik mavi uzerinde beyaz catlak cizgileri
    if (TEX.has('catlak')) return TEX.get('catlak');
    const t = cnv(256, 256, (x, w, h) => {
      const gr = x.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#d8f3ff'); gr.addColorStop(1, '#8fd0f5'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
      let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
      x.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        let px = 40 + rnd() * (w - 80), py = 40 + rnd() * (h - 80), a = rnd() * Math.PI * 2; x.beginPath(); x.moveTo(px, py);
        const L = 3 + (rnd() * 3 | 0); for (let k = 0; k < L; k++) { a += (rnd() - 0.5) * 1.3; px += Math.cos(a) * 26; py += Math.sin(a) * 26; x.lineTo(px, py); }
        x.strokeStyle = 'rgba(20,90,180,0.55)'; x.lineWidth = 10 + rnd() * 4; x.stroke(); x.strokeStyle = 'rgba(255,255,255,1)'; x.lineWidth = 4 + rnd() * 3; x.stroke();
      }
    });
    TEX.set('catlak', t); return t;
  }
  function dalgaDoku() {   // buz kolon yani: yatay dalga deseni
    if (TEX.has('dalga')) return TEX.get('dalga');
    const t = cnv(128, 512, (x, w, h) => {
      x.fillStyle = '#9ad8f8'; x.fillRect(0, 0, w, h);
      for (let k = 0; k < 6; k++) {
        const y0 = (k + 0.5) * h / 6; x.beginPath();
        for (let px = 0; px <= w; px += 2) { const y = y0 + Math.sin(px / w * Math.PI * 4) * 9; px ? x.lineTo(px, y) : x.moveTo(px, y); }
        x.strokeStyle = 'rgba(20,90,190,0.6)'; x.lineWidth = 22; x.stroke(); x.strokeStyle = 'rgba(255,255,255,1)'; x.lineWidth = 11; x.stroke();
      }
    });
    TEX.set('dalga', t); return t;
  }
  function tasDoku() {   // lacivert, hafif puruzlu: renk + kabartma (bump) haritasi
    if (TEX.has('tas')) return TEX.get('tas');
    const n = gurultu(3), n2 = gurultu(11), W = 256;
    const renk = cnv(W, W, (x) => { const im = x.createImageData(W, W); for (let y = 0; y < W; y++) for (let i = 0; i < W; i++) { const v = 0.55 * n(i / 18, y / 18) + 0.3 * n2(i / 6, y / 6) + 0.15 * Math.random(); const o = (y * W + i) * 4; im.data[o] = 36 + v * 34; im.data[o + 1] = 52 + v * 40; im.data[o + 2] = 128 + v * 60; im.data[o + 3] = 255; } x.putImageData(im, 0, 0); });
    const bump = cnv(W, W, (x) => { const im = x.createImageData(W, W); for (let y = 0; y < W; y++) for (let i = 0; i < W; i++) { const v = 0.6 * n(i / 14, y / 14) + 0.4 * n2(i / 5, y / 5); const o = (y * W + i) * 4; im.data[o] = im.data[o + 1] = im.data[o + 2] = v * 255; im.data[o + 3] = 255; } x.putImageData(im, 0, 0); });
    bump.colorSpace = THREE.NoColorSpace; const r = { renk, bump }; TEX.set('tas', r); return r;
  }
  function ahsapDoku(prof, ust) {   // yan: ahsap damari ; ust/alt kapak: yillik halkalar
    if (TEX.has('ahsap')) return TEX.get('ahsap');
    const n = gurultu(5), A = rgb('#ffbf5a'), B = rgb('#e8862a'), C = rgb('#ffd98a'), D = rgb('#c96a1c');
    const t = tornaDoku(prof, 512, 256, (u, r, y, j) => {
      if (Math.abs(y) >= ust - 1e-3 && r < OLCU.kutuk.r - 0.05) {   // kapak: halkalar
        const q = r / OLCU.kutuk.r, w = 0.5 + 0.5 * Math.sin(q * 34 + n(u * 8, q * 3) * 2.2);
        return r < 0.02 ? D : karis(C, karis(A, B, 0.5), w * 0.75);
      }
      const g = n(u * 40, y * 1.2) * 0.6 + n(u * 120, y * 4) * 0.4, s = 0.5 + 0.5 * Math.sin(u * Math.PI * 2 * 22 + g * 5);
      return karis(A, B, Math.pow(s, 3) * 0.75);
    });
    TEX.set('ahsap', t); return t;
  }

  // ---------------- sekiller ----------------
  // kapak profili (butun kavanozlarda ayni)
  const KR = OLCU.kavanoz.r, KAPAK_H = 0.26, KAPAK_R = KR * 0.97;
  const KAPAK_PROF = yumusakProfil([[0, 0], [KAPAK_R, 0, 0.07], [KAPAK_R, KAPAK_H, 0.09], [KAPAK_R * 0.55, KAPAK_H], [KAPAK_R * 0.3, KAPAK_H], [0, KAPAK_H]], 6);
  let KAPAK_SERIT = KAPAK_PROF.findIndex((p) => p.y >= KAPAK_H - 1e-4);   // bu noktadan sonrasi ust yuz (duz renk)

  function kavanoz(boy) {
    const H = OLCU.kavanoz.boy[boy], gH = H - KAPAK_H + 0.04, y0 = -H / 2, y1 = y0 + gH, R = KR;
    // hafif bombeli govde: altta ve omuzda daralir, ortada en genis
    const pts = [[0, y0], [R * 0.84, y0, 0.1]];
    const ADIM = 8; for (let k = 0; k <= ADIM; k++) { const t = k / ADIM, y = y0 + 0.12 + t * (gH - 0.3); pts.push([R * (0.93 + 0.07 * Math.sin(Math.PI * t)), y]); }
    pts.push([R * 0.9, y1 - 0.08, 0.06], [R * 0.82, y1], [0, y1]);
    const prof = yumusakProfil(pts, 6), govde = new THREE.LatheGeometry(prof, 48);
    const kap = new THREE.LatheGeometry(KAPAK_PROF, 48); kap.translate(0, y1 - 0.04, 0);
    const dugme = new THREE.LatheGeometry(yumusakProfil([[0, 0], [0.11, 0, 0.03], [0.11, 0.07, 0.05], [0, 0.07]], 4), 32); dugme.translate(0, y1 - 0.04 + KAPAK_H, 0);
    return birlestir([[govde, 'govde'], [kap, 'kapak'], [dugme, 'govde']]);
  }
  function plaka(boy, ikon) {
    const W = OLCU.plaka.boy[boy], Hh = OLCU.plaka.h, D = OLCU.plaka.d, r = OLCU.koseR;
    const govde = yuvarlakKutu(W, Hh, D, r, 5);
    const fw = W - 0.14, fh = Hh - 0.14, cr = 0.13, kal = 0.085;   // cerceve: on yuzde kabarik halka, ortasi gomulu
    const cer = yuvDik(fw, fh, cr); cer.holes.push(delik(fw - 2 * kal, fh - 2 * kal, cr - 0.05));
    const cg = cikinti(cer, 0.02, 0.028, 3, 16); cg.translate(0, 0, D / 2 - 0.03);
    const ik = cikinti(ikon === 'capa' ? capaSekil(0.62 * Hh) : patiSekil(0.6 * Hh), 0.03, 0.026, 3, 20); ik.translate(0, 0, D / 2 - 0.02);
    const P = [[govde, 'govde'], [cg, 'cerceve'], [ik, 'ikon']];
    // uzun plakada ikonun iki yaninda kucuk perciner (gozun cerceveyi okumasina yardim)
    if (W >= 2) for (const sx of [-1, 1]) { const p = new THREE.SphereGeometry(0.075, 16, 10); p.scale(1, 1, 0.55); p.translate(sx * (W / 2 - 0.3), 0, D / 2 + 0.005); P.push([p, 'cerceve']); }
    return birlestir(P);
  }
  function buz() { return birlestir([[yuvarlakKutu(1, 1, 1, 0.13, 5), 'buz']]); }
  function buzPlaka(W) { return birlestir([[yuvarlakKutu(W, OLCU.buzPlakaH, 1, 0.11, 4), 'buz']]); }
  function buzKolon() {
    const H = OLCU.buzKolon.h, kh = 0.26, gv = yuvarlakKutu(0.7, H - 2 * kh + 0.06, 0.7, 0.1, 4);
    const ust = yuvarlakKutu(1, kh, 1, 0.09, 4); ust.translate(0, H / 2 - kh / 2, 0);
    const alt = yuvarlakKutu(1, kh, 1, 0.09, 4); alt.translate(0, -H / 2 + kh / 2, 0);
    const P = [[gv, 'buzDalga'], [ust, 'buzKapak'], [alt, 'buzKapak']];
    for (const yy of [H / 2 - kh / 2, -H / 2 + kh / 2]) {   // kapaklarin on/arka/yan yuzunde cerceve seridi
      const c = yuvDik(0.92, kh - 0.06, 0.05); c.holes.push(delik(0.76, kh - 0.14, 0.03));
      for (let k = 0; k < 4; k++) { const g = cikinti(c, 0.01, 0.012, 2, 8); g.translate(0, 0, 0.5); g.rotateY(k * Math.PI / 2); g.translate(0, yy, 0); P.push([g, 'buzKapak']); }
    }
    return birlestir(P);
  }
  function tas() {
    const g = yuvarlakKutu(1, 1, 1, 0.14, 5);
    const p = cikinti(patiSekil(0.62), 0.03, 0.03, 3, 20); p.translate(0, 0, 0.5 - 0.025);
    const c = yuvDik(0.86, 0.86, 0.12); c.holes.push(delik(0.72, 0.72, 0.08)); const cg = cikinti(c, 0.01, 0.018, 2, 12); cg.translate(0, 0, 0.5 - 0.02);
    return birlestir([[g, 'tas'], [p, 'altin'], [cg, 'tasKenar']]);
  }
  let KUTUK_PROF = null;
  function kutuk() {
    const R = OLCU.kutuk.r, H = OLCU.kutuk.h, y0 = -H / 2, y1 = H / 2;
    const pts = [[0, y0]]; for (let k = 1; k <= 10; k++) pts.push([R * (k / 10) * 0.92, y0]);
    pts.push([R, y0, 0.08], [R * 0.99, y0 + H * 0.5], [R, y1, 0.08]); for (let k = 10; k >= 1; k--) pts.push([R * (k / 10) * 0.92, y1]); pts.push([0, y1]);
    KUTUK_PROF = yumusakProfil(pts, 6);
    return birlestir([[new THREE.LatheGeometry(KUTUK_PROF, 56), 'ahsap']]);
  }
  function foxi() {
    const P = [[yuvarlakKutu(1, 1, 1, 0.17, 5), 'foxi']], z = 0.5;
    // beyaz agiz/yanak maskesi
    const m = new THREE.Shape(); m.moveTo(-0.4, -0.06); m.bezierCurveTo(-0.36, -0.36, -0.12, -0.4, 0, -0.33); m.bezierCurveTo(0.12, -0.4, 0.36, -0.36, 0.4, -0.06); m.bezierCurveTo(0.28, -0.12, 0.1, -0.06, 0, -0.14); m.bezierCurveTo(-0.1, -0.06, -0.28, -0.12, -0.4, -0.06);
    const mg = cikinti(m, 0.012, 0.025, 3, 24); mg.translate(0, 0, z - 0.02); P.push([mg, 'beyaz']);
    // burun
    const bu = new THREE.SphereGeometry(0.075, 24, 16); bu.scale(1.25, 0.85, 0.8); bu.translate(0, -0.14, z + 0.04); P.push([bu, 'koyu']);
    // kapali, gulen gozler (∩)
    for (const sx of [-1, 1]) { const g = new THREE.TorusGeometry(0.085, 0.024, 10, 20, Math.PI); g.translate(sx * 0.21, 0.1, z + 0.012); P.push([g, 'koyu']); }
    // pembe yanaklar
    for (const sx of [-1, 1]) { const y = new THREE.SphereGeometry(0.07, 16, 10); y.scale(1.2, 0.75, 0.25); y.translate(sx * 0.33, -0.03, z + 0.008); P.push([y, 'yanak']); }
    // ustte altin mini kale kenari: cevre seridi + 8 burc disi
    const c = yuvDik(0.96, 0.96, 0.16); c.holes.push(delik(0.78, 0.78, 0.08)); const cg = cikinti(c, 0.03, 0.025, 3, 16); cg.rotateX(-Math.PI / 2); cg.translate(0, 0.5 - 0.01, 0); P.push([cg, 'altin']);
    for (const [x, zz] of [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]) { const b = yuvarlakKutu(0.17, 0.15, 0.17, 0.05, 3); b.translate(x * 0.39, 0.5 + 0.1, zz * 0.39); P.push([b, 'altin']); }
    return birlestir(P);
  }
  function platform() {
    const { w, d, h, ayakH } = OLCU.platform, P = [], bev = 0.12;
    const tab = cikinti(yuvDik(w - 2 * bev, d - 2 * bev, 0.8), h - 2 * bev, bev, 5, 32); tab.rotateX(-Math.PI / 2); tab.translate(0, -h + bev, 0); P.push([tab, 'platform']);
    for (const yy of [-0.12, -h + 0.1]) {   // altin kenar seritleri
      const s = yuvDik(w + 0.04, d + 0.04, 0.86); s.holes.push(delik(w - 0.12, d - 0.12, 0.76)); const g = cikinti(s, 0.05, 0.03, 3, 32); g.rotateX(-Math.PI / 2); g.translate(0, yy - 0.04, 0); P.push([g, 'altin']);
    }
    // ince ayak: altin bilezik, mor govde, ortada altin bogum
    const t0 = -h, lat = (pts, seg = 40) => { const p = yumusakProfil(pts, 5); if (p[0].y > p[p.length - 1].y) p.reverse(); return new THREE.LatheGeometry(p, seg); };   // torna profili alttan uste olmali (normaller disa baksin)
    const a1 = lat([[0, 0], [0.62, 0, 0.06], [0.48, -0.18, 0.05], [0.34, -0.3], [0, -0.3]]); a1.translate(0, t0, 0); P.push([a1, 'altin']);
    const g1 = lat([[0, 0], [0.26, 0], [0.24, -ayakH * 0.45], [0, -ayakH * 0.45]]); g1.translate(0, t0 - 0.28, 0); P.push([g1, 'platform']);
    const bo = lat([[0, 0.14], [0.2, 0.14, 0.04], [0.34, 0, 0.12], [0.2, -0.14, 0.04], [0, -0.14]]); bo.translate(0, t0 - 0.28 - ayakH * 0.45, 0); P.push([bo, 'altin']);
    const g2 = lat([[0, 0], [0.24, 0], [0.3, -ayakH * 0.42], [0, -ayakH * 0.42]]); g2.translate(0, t0 - 0.28 - ayakH * 0.45 - 0.1, 0); P.push([g2, 'platform']);
    // susluu kaide: altin yaka + mor disk + altin genis taban
    const kb = t0 - 0.28 - ayakH * 0.87 - 0.1;
    const k1 = lat([[0, 0], [0.38, 0, 0.05], [0.62, -0.22, 0.08], [0.6, -0.3], [0, -0.3]], 48); k1.translate(0, kb, 0); P.push([k1, 'altin']);
    const k2 = lat([[0, 0], [1.05, 0, 0.1], [1.12, -0.2, 0.08], [0, -0.2]], 56); k2.translate(0, kb - 0.3, 0); P.push([k2, 'platform']);
    const k3 = lat([[0, 0], [1.25, 0, 0.06], [1.42, -0.16, 0.08], [1.38, -0.24], [0, -0.24]], 64); k3.translate(0, kb - 0.5, 0); P.push([k3, 'altin']);
    const R = birlestir(P); R.altY = kb - 0.74; return R;
  }

  // ---------------- tanimlar ----------------
  function kur(ad) {
    if (GEO.has(ad)) return GEO.get(ad);
    let r;
    if (ad.startsWith('kavanoz-')) r = kavanoz(ad.split('-')[1]);
    else if (ad.startsWith('plaka-')) { const p = ad.split('-'); r = plaka(p[1], p[2] === 'capa' ? 'capa' : 'pati'); }
    else if (ad.startsWith('buz-plaka-')) r = buzPlaka(+ad.split('-')[2]);
    else if (ad === 'buz-3') r = birlestir([[yuvarlakKutu(3, 1, 1, 0.13, 5), 'buz']]);   // oyundaki 3'luk buz kirisi
    else r = { buz, 'buz-kolon': buzKolon, tas, kutuk, foxi, platform }[ad]();
    GEO.set(ad, r); return r;
  }
  function matFor(key, renk, ad) {
    const p = PALET[renk] || PALET.kirmizi;
    switch (key) {
      case 'govde': return plastik(p.ana);
      case 'kapak': return fizMat('kapak:' + renk, Object.assign({}, MALZEME.kapak, { color: '#ffffff', map: seritDoku(renk, KAPAK_SERIT) }));
      case 'cerceve': return plastik(p.acik, { roughness: 0.18 });
      case 'ikon': return ad.endsWith('capa') ? altinMat() : beyazMat();
      case 'altin': return altinMat();
      case 'beyaz': return beyazMat();
      case 'koyu': return koyuMat();
      case 'yanak': return plastik('#ff9aa8', { roughness: 0.4, clearcoat: 0.3 });
      case 'foxi': return fizMat('foxi', MALZEME.foxi);
      case 'platform': return fizMat('platform', MALZEME.platform);
      case 'buz': return fizMat('buz', Object.assign({}, dusuk ? MALZEME.buzDusuk : MALZEME.buz, { map: catlakDoku() }));
      case 'buzDalga': return fizMat('buzDalga', Object.assign({}, dusuk ? MALZEME.buzDusuk : MALZEME.buz, { map: dalgaDoku() }));
      case 'buzKapak': return fizMat('buzKapak', Object.assign({}, dusuk ? MALZEME.buzDusuk : MALZEME.buz, { color: '#b8e8ff', transmission: dusuk ? 0 : 0.35, roughness: 0.1 }));
      case 'tas': { const t = tasDoku(); return fizMat('tas', Object.assign({}, MALZEME.tas, { color: '#ffffff', map: t.renk, bumpMap: t.bump, bumpScale: 0.8 })); }
      case 'tasKenar': return fizMat('tasKenar', Object.assign({}, MALZEME.tas, { color: '#4a5cc0', roughness: 0.45 }));
      case 'ahsap': return fizMat('ahsap', Object.assign({}, MALZEME.ahsap, { color: '#ffffff', map: ahsapDoku(KUTUK_PROF, OLCU.kutuk.h / 2) }));
    }
    return plastik('#ff00ff');
  }
  function malzemeler(ad, renk) { const r = kur(ad); return r.anah.map((k) => matFor(k, renk, ad)); }

  return {
    SEKILLER, RENKLI,
    geometri: (ad) => kur(ad).geo,
    malzemeler,
    mesh(ad, renk = 'kirmizi', o = {}) {
      const m = new THREE.Mesh(kur(ad).geo, malzemeler(ad, renk)); m.castShadow = m.receiveShadow = true; m.name = ad + ':' + renk;
      if (o.yatay) m.rotation.z = Math.PI / 2;   // kavanoz/kutuk yatirilmis kullanim
      return m;
    },
    instanced(ad, renk, n) { const m = new THREE.InstancedMesh(kur(ad).geo, malzemeler(ad, renk), n); m.castShadow = m.receiveShadow = true; return m; },
    olcu(ad) { const b = kur(ad).geo.boundingBox; return [b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z]; },
    altY: (ad) => kur(ad).altY,
    // carpisma tanimi (S ile olcekli): sekle uygun basit govdeler; gorunen kenar yumusak, fizik kutusu biraz iceride
    fizik(ad, S = 1) {
      if (ad.startsWith('kavanoz-')) return [{ tip: 'silindir', r: OLCU.kavanoz.r * S, h: OLCU.kavanoz.boy[ad.split('-')[1]] * S }];
      if (ad.startsWith('plaka-')) return [{ tip: 'kutu', yarim: [OLCU.plaka.boy[ad.split('-')[1]] * S / 2, OLCU.plaka.h * S / 2, OLCU.plaka.d * S / 2] }];
      if (ad === 'buz-3') return [{ tip: 'kutu', yarim: [1.5 * S, 0.5 * S, 0.5 * S] }];
      if (ad.startsWith('buz-plaka-')) return [{ tip: 'kutu', yarim: [+ad.split('-')[2] * S / 2, OLCU.buzPlakaH * S / 2, 0.5 * S] }];
      if (ad === 'buz-kolon') return [{ tip: 'kutu', yarim: [0.5 * S, OLCU.buzKolon.h * S / 2, 0.5 * S] }];
      if (ad === 'kutuk') return [{ tip: 'silindir', r: OLCU.kutuk.r * S, h: OLCU.kutuk.h * S }];
      if (ad === 'foxi') return [{ tip: 'kutu', yarim: [0.5 * S, 0.5 * S, 0.5 * S] }, { tip: 'kutu', yarim: [0.48 * S, 0.08 * S, 0.48 * S], ofset: [0, 0.6 * S, 0] }];
      if (ad === 'platform') { const p = OLCU.platform; return [{ tip: 'kutu', yarim: [p.w * S / 2, p.h * S / 2, p.d * S / 2], ofset: [0, -p.h * S / 2, 0] }, { tip: 'silindir', r: 0.3 * S, h: p.ayakH * S, ofset: [0, (-p.h - p.ayakH / 2) * S, 0] }]; }
      return [{ tip: 'kutu', yarim: [0.5 * S, 0.5 * S, 0.5 * S] }];
    },
    govde(CANNON, ad, S = 1, kutle = 1) {
      const b = new CANNON.Body({ mass: ad === 'platform' ? 0 : kutle });
      for (const f of this.fizik(ad, S)) {
        const sh = f.tip === 'silindir' ? new CANNON.Cylinder(f.r, f.r, f.h, 16) : new CANNON.Box(new CANNON.Vec3(...f.yarim));
        b.addShape(sh, f.ofset ? new CANNON.Vec3(...f.ofset) : undefined);
      }
      return b;
    },
    temizle() { for (const r of GEO.values()) r.geo.dispose(); for (const m of MAT.values()) m.dispose(); GEO.clear(); MAT.clear(); }
  };
}
