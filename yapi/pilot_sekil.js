// Foxi Smash PILOT v5.4 (16 Kas 2026): pilot bolumlerinin yeni blok sekilleri. Yalniz ?pilot=N kipinde yuklenir; eski turlere dokunmaz.
// Korsan kale tarzi: pahli kenar, dokuya islenmis isik-golge (karsidan bakinca da hacimli), doygun renk.
// Her tur sekil.js TUR bicimindedir (w, h, d kup kenari S cinsinden) + gerekiyorsa ozel carpisma sekli (cs).
//   plSutunK  ince kisa tas sutun (tapinak kosku)        plCati   tapinak cati tasi (altin kornisli kalin tabla)
//   plTepe    dikilitas sivri basligi (altin uclu)        plMenhir dikili tas (yontulmamis, yosunlu)   plMenhirK kisa dikili tas
//   plLento   lento (iki dikili tasin ustune yatan tas)   plSunak  sunak tablasi (krem mermer, altin kakma)
//   plDomino  domino tasi (lacivert cilali tas, altin noktalar)
// v5.6 (17 Kas 2026): Blender'da uretilen oyuncak bloklar (model/pilot/*.glb): plKupK/Y/M patili kup, plKalas uzun kalas (3x1x1),
//   plKavanozT/M cizgili kapakli kavanoz, plLevha tilki amblemli tas levha (2x1x1), plSutun bilezikli sutun (1x2).
// carp: bu hizdan sert sabit yuzeye (platform, zemin) carpinca kirilir (pilot.js uygular; top degince kirilmaz, devrilir).
import { mergeVertices } from '../BufferGeometryUtils.js';
import { GLTFLoader } from '../GLTFLoader.js?v=2';   // v5.6: Blender bloklari (oyun.js ile ayni adres: ayni modul)

export function pilotSekilKur({ THREE, CANNON, S, canvasTex, ENV }) {
  const Pi = Math.PI;
  const col = (h) => new THREE.Color(h), mix = (a, b, t) => '#' + col(a).lerp(col(b), t).getHexString();
  const koyu = (h, t) => mix(h, '#000000', t), acik = (h, t) => mix(h, '#ffffff', t);
  const rng = (a) => () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const tex = (w, h, f) => { const t = canvasTex(w, h, f); t.anisotropy = 8; return t; };
  const std = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.6, metalness: 0, envMap: ENV, envMapIntensity: 0.4 }, o));
  const ALTIN = new THREE.MeshPhysicalMaterial({ color: '#ffc02a', metalness: 1, roughness: 0.24, envMap: ENV, envMapIntensity: 1.5, emissive: '#5a3400', emissiveIntensity: 0.35 });

  // ---------- govde yardimcilari ----------
  // yuvarlak kenarli kutu (sekil.js kutu ile ayni): her yuze duz izdusum uv
  function kutu(w, h, d, r, n = 2) {
    const sg = 2 * n + 1, g = new THREE.BoxGeometry(w, h, d, sg, sg, sg), p = g.attributes.position, nr = g.attributes.normal, uv = g.attributes.uv;
    const H = [w / 2, h / 2, d / 2], v = new THREE.Vector3(), c = new THREE.Vector3(), q = [0, 0, 0];
    const yer = (x, a) => { const i = Math.round((x + a) / (2 * a) * sg); return i <= n ? -a + r * (i / n) : a - r * ((sg - i) / n); };
    for (let i = 0; i < p.count; i++) {
      const nx = nr.getX(i), ny = nr.getY(i), nz = nr.getZ(i);
      q[0] = yer(p.getX(i), H[0]); q[1] = yer(p.getY(i), H[1]); q[2] = yer(p.getZ(i), H[2]);
      if (nx > 0.5) uv.setXY(i, (-q[2] + H[2]) / d, (q[1] + H[1]) / h); else if (nx < -0.5) uv.setXY(i, (q[2] + H[2]) / d, (q[1] + H[1]) / h);
      else if (ny > 0.5) uv.setXY(i, (q[0] + H[0]) / w, (-q[2] + H[2]) / d); else if (ny < -0.5) uv.setXY(i, (q[0] + H[0]) / w, (q[2] + H[2]) / d);
      else if (nz > 0.5) uv.setXY(i, (q[0] + H[0]) / w, (q[1] + H[1]) / h); else uv.setXY(i, (-q[0] + H[0]) / w, (q[1] + H[1]) / h);
      v.set(q[0], q[1], q[2]); c.set(Math.max(-H[0] + r, Math.min(H[0] - r, v.x)), Math.max(-H[1] + r, Math.min(H[1] - r, v.y)), Math.max(-H[2] + r, Math.min(H[2] - r, v.z)));
      v.sub(c); const L = v.length(); if (L > 1e-6) v.multiplyScalar(1 / L); else v.set(nx, ny, nz);
      nr.setXYZ(i, v.x, v.y, v.z); p.setXYZ(i, c.x + v.x * r, c.y + v.y * r, c.z + v.z * r);
    }
    g.computeBoundingBox(); g.computeBoundingSphere(); return g;
  }
  // torna govde: [yaricap, y, dokuV]
  function torna(prof, seg = 24) {
    const g = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(Math.max(r, 1e-4), y)), seg), uv = g.attributes.uv, n = prof.length;
    for (let i = 0; i <= seg; i++) for (let j = 0; j < n; j++) uv.setXY(i * n + j, i / seg, prof[j][2]);
    g.computeVertexNormals(); g.computeBoundingBox(); g.computeBoundingSphere(); return g;
  }
  function topla(L) {
    const ls = L.map(([g, m]) => [g.index ? g.toNonIndexed() : g, m]).sort((a, b) => a[1] - b[1]);
    const out = new THREE.BufferGeometry(); let n = 0; for (const [g] of ls) n += g.attributes.position.count;
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2); let o = 0, gs = 0, cur = -1;
    for (const [g, m] of ls) {
      const c = g.attributes.position.count; P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); if (g.attributes.uv) U.set(g.attributes.uv.array, o * 2);
      if (m !== cur) { if (cur >= 0) out.addGroup(gs, o - gs, cur); cur = m; gs = o; } o += c;
    }
    out.addGroup(gs, o - gs, cur);
    out.setAttribute('position', new THREE.BufferAttribute(P, 3)); out.setAttribute('normal', new THREE.BufferAttribute(N, 3)); out.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    out.computeBoundingBox(); out.computeBoundingSphere(); return out;
  }
  // yumusak deger gurultusu (konumdan): ayni noktada her yuzde ayni deger -> dikis acilmaz
  const hs = (x, y, z, t) => { let h = Math.imul(x | 0, 73856093) ^ Math.imul(y | 0, 19349663) ^ Math.imul(z | 0, 83492791) ^ Math.imul(t, 2654435761); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  function gur(x, y, z, t) {
    const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z), fx = x - X, fy = y - Y, fz = z - Z, s = (a) => a * a * (3 - 2 * a), u = s(fx), v = s(fy), w = s(fz);
    let r = 0; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) r += hs(X + i, Y + j, Z + k, t) * (i ? u : 1 - u) * (j ? v : 1 - v) * (k ? w : 1 - w);
    return r;
  }
  // yontulmamis tas: yuzey normal yonunde ICE dogru dalgalanir (carpisma kutusunun disina tasmaz), ust kisim hafif daralir
  function kaba(g, amp, frek, tohum, daral = 0) {
    const p = g.attributes.position, nr = g.attributes.normal, bb = g.boundingBox || (g.computeBoundingBox(), g.boundingBox), h = bb.max.y - bb.min.y;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n1 = gur(x * frek + 11, y * frek + 7, z * frek + 3, tohum), n2 = gur(x * frek * 2.7, y * frek * 2.7, z * frek * 2.7, tohum + 5);
      const d = amp * (0.65 * n1 + 0.35 * n2), t = (y - bb.min.y) / h, k = 1 - daral * t * t;
      p.setXYZ(i, x * k - nr.getX(i) * d, y - Math.max(0, nr.getY(i)) * d, z * k - nr.getZ(i) * d);
    }
    // normaller: ayni konumdaki koseler birlestirilip hesaplanir (yuz sinirinda kirisik cizgi olmasin)
    const tmp = new THREE.BufferGeometry(); tmp.setAttribute('position', p.clone()); tmp.setIndex(g.index ? g.index.clone() : null);
    const m = mergeVertices(tmp, 1e-4); m.computeVertexNormals();
    const key = (x, y, z) => Math.round(x * 1e3) + ',' + Math.round(y * 1e3) + ',' + Math.round(z * 1e3), map = new Map(), mp = m.attributes.position, mn = m.attributes.normal;
    for (let i = 0; i < mp.count; i++) map.set(key(mp.getX(i), mp.getY(i), mp.getZ(i)), i);
    for (let i = 0; i < p.count; i++) { const j = map.get(key(p.getX(i), p.getY(i), p.getZ(i))); if (j != null) nr.setXYZ(i, mn.getX(j), mn.getY(j), mn.getZ(j)); }
    p.needsUpdate = nr.needsUpdate = true; g.computeBoundingBox(); g.computeBoundingSphere(); return g;
  }

  // ---------- dokular ----------
  // tas yuzu: ton lekeleri, catlak, benek, istenirse yosun; kenarda pah isigi (ust-sol acik, alt-sag koyu)
  function tasBoya(x, X, Y, W, H, renk, r, o = {}) {
    let g = x.createLinearGradient(0, Y, 0, Y + H); g.addColorStop(0, acik(renk, 0.16)); g.addColorStop(0.5, renk); g.addColorStop(1, koyu(renk, 0.22)); x.fillStyle = g; x.fillRect(X, Y, W, H);
    x.save(); x.beginPath(); x.rect(X, Y, W, H); x.clip();
    const k = Math.min(W, H);
    for (let i = 0; i < 14; i++) { x.fillStyle = r() < 0.5 ? 'rgba(30,26,70,.10)' : 'rgba(255,255,255,.10)'; x.beginPath(); x.ellipse(X + r() * W, Y + r() * H, k * (0.08 + r() * 0.2), k * (0.05 + r() * 0.12), r() * 3, 0, Pi * 2); x.fill(); }
    for (let i = 0; i < 90; i++) { x.fillStyle = r() < 0.5 ? 'rgba(20,18,50,.22)' : 'rgba(255,255,255,.2)'; x.fillRect(X + r() * W, Y + r() * H, 1.5 + r() * 2, 1.5 + r() * 2); }
    if (o.catlak) { x.lineCap = x.lineJoin = 'round'; for (let c = 0; c < o.catlak; c++) { let px = X + W * (0.2 + r() * 0.6), py = Y + H * (0.05 + r() * 0.3); x.beginPath(); x.moveTo(px, py); for (let s = 0; s < 4; s++) { px += (r() - 0.5) * W * 0.25; py += H * (0.08 + r() * 0.1); x.lineTo(px, py); } x.strokeStyle = 'rgba(30,24,70,.55)'; x.lineWidth = k * 0.025; x.stroke(); x.strokeStyle = 'rgba(255,255,255,.22)'; x.lineWidth = k * 0.01; x.translate(-k * 0.012, -k * 0.012); x.stroke(); x.translate(k * 0.012, k * 0.012); } }
    if (o.yosun) { for (let i = 0; i < 40; i++) { const bx = X + r() * W, by = Y + H * (1 - Math.pow(r(), 2.2) * o.yosun); x.fillStyle = r() < 0.5 ? 'rgba(70,150,40,.5)' : 'rgba(120,190,60,.45)'; x.beginPath(); x.ellipse(bx, by, k * (0.03 + r() * 0.07), k * (0.02 + r() * 0.05), r() * 3, 0, Pi * 2); x.fill(); } }
    const p = k * (o.pah || 0.09);
    g = x.createLinearGradient(0, Y, 0, Y + p); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(X, Y, W, p);
    g = x.createLinearGradient(X, 0, X + p, 0); g.addColorStop(0, 'rgba(255,255,255,.3)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(X, Y, p, H);
    g = x.createLinearGradient(0, Y + H - p * 1.2, 0, Y + H); g.addColorStop(0, 'rgba(30,24,80,0)'); g.addColorStop(1, 'rgba(30,24,80,.55)'); x.fillStyle = g; x.fillRect(X, Y + H - p * 1.2, W, p * 1.2);
    g = x.createLinearGradient(X + W - p, 0, X + W, 0); g.addColorStop(0, 'rgba(30,24,80,0)'); g.addColorStop(1, 'rgba(30,24,80,.35)'); x.fillStyle = g; x.fillRect(X + W - p, Y, p, H);
    x.restore();
  }
  const TAS = '#9299b8', TASK = '#7f88aa';
  const tasMat = (o) => std(Object.assign({ roughness: 0.82, envMapIntensity: 0.3, emissive: '#20204a', emissiveIntensity: 0.14 }, o));

  // ---------- 1) ince kisa sutun ----------
  function sutunK() {
    const R = 0.33, H = 2.6, h = H / 2;
    const prof = [[0.001, -h, 0], [0.43, -h, 0.01], [0.43, -h + 0.18, 0.06], [0.37, -h + 0.25, 0.09], [R, -h + 0.34, 0.13], [R * 0.94, 0, 0.5], [R, h - 0.34, 0.87], [0.37, h - 0.25, 0.91], [0.43, h - 0.18, 0.94], [0.43, h, 0.99], [0.001, h, 1]];
    const map = tex(256, 256, (x, w, hh) => {
      const r = rng(31); tasBoya(x, 0, 0, w, hh, '#a7acc6', r, { pah: 0.02 });
      for (let i = 0; i < 10; i++) { const X = (i + 0.5) * w / 10; x.fillStyle = 'rgba(30,26,80,.28)'; x.fillRect(X - 3, hh * 0.15, 6, hh * 0.7); x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(X - 7, hh * 0.15, 3, hh * 0.7); }
      const g = x.createLinearGradient(0, 0, 0, hh); g.addColorStop(0, 'rgba(255,215,90,.9)'); g.addColorStop(0.1, 'rgba(255,190,40,.8)'); g.addColorStop(0.12, 'rgba(0,0,0,0)'); g.addColorStop(0.88, 'rgba(0,0,0,0)'); g.addColorStop(0.9, 'rgba(255,190,40,.8)'); g.addColorStop(1, 'rgba(200,120,0,.9)'); x.fillStyle = g; x.fillRect(0, 0, w, hh);
    });
    return { geo: torna(prof, 20), mat: tasMat({ map, roughness: 0.6, metalness: 0.1, envMapIntensity: 0.5 }), parca: tasMat({ color: TAS }), r: 0.41 };
  }
  // ---------- 2) cati tasi ----------
  function cati() {
    const W = 3.4, H = 0.48, L = [];
    const govde = kutu(W, H * 0.62, W, 0.06, 2); govde.translate(0, -H * 0.19, 0); L.push([govde, 0]);
    const ust = kutu(W * 0.9, H * 0.38, W * 0.9, 0.08, 2); ust.translate(0, H * 0.31, 0); L.push([ust, 0]);
    const kor = kutu(W * 1.0, 0.07, W * 1.0, 0.025, 1); kor.translate(0, H * 0.13, 0); L.push([kor, 1]);   // altin korniz
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const s = new THREE.SphereGeometry(0.11, 12, 8); s.translate(sx * (W / 2 - 0.12), H * 0.12 + 0.08, sz * (W / 2 - 0.12)); L.push([s, 1]); }
    const map = tex(512, 512, (x, w, h) => { const r = rng(91); tasBoya(x, 0, 0, w, h, TAS, r, { catlak: 1, pah: 0.05 }); x.strokeStyle = 'rgba(30,24,80,.35)'; x.lineWidth = 6; x.strokeRect(w * 0.12, h * 0.12, w * 0.76, h * 0.76); x.strokeStyle = 'rgba(255,255,255,.25)'; x.lineWidth = 3; x.strokeRect(w * 0.12 - 4, h * 0.12 - 4, w * 0.76, h * 0.76); });
    return { geo: topla(L), mat: [tasMat({ map }), ALTIN], parca: tasMat({ color: TAS }) };
  }
  // ---------- 3) dikilitas basligi (piramit) ----------
  const TEPE = { b: 1.1, h: 1.15, p: 0.18 };
  function tepe() {
    const { b, h, p } = TEPE, y0 = -h / 2, L = [];
    const ayak = kutu(b, p, b, 0.03, 1); ayak.translate(0, y0 + p / 2, 0); L.push([ayak, 1]);
    // piramit govde (tas) + altin uc
    const pir = (bb, ya, yb, m) => { const g = new THREE.ConeGeometry(bb / Math.SQRT2, yb - ya, 4, 1); g.rotateY(Pi / 4); g.translate(0, (ya + yb) / 2, 0); g.toNonIndexed(); const gg = g.toNonIndexed(); gg.computeVertexNormals(); return [gg, m]; };
    const kes = 0.72;   // tasin kesildigi yukseklik orani; ustu altin
    const gTas = new THREE.CylinderGeometry(b * 0.92 * (1 - kes) / Math.SQRT2, b * 0.92 / Math.SQRT2, (h - p) * kes, 4, 1); gTas.rotateY(Pi / 4); gTas.translate(0, y0 + p + (h - p) * kes / 2, 0);
    const gt = gTas.toNonIndexed(); gt.computeVertexNormals(); L.push([gt, 0]);
    L.push(pir(b * 0.92 * (1 - kes) * 1.06, y0 + p + (h - p) * kes - 0.01, h / 2, 1));
    const map = tex(256, 256, (x, w, hh) => { const r = rng(17); tasBoya(x, 0, 0, w, hh, '#a2a8c4', r, { pah: 0.04 }); for (let i = 0; i < 3; i++) { x.fillStyle = 'rgba(40,30,90,.35)'; x.font = 'bold 54px serif'; x.fillText(['☥', '◈', '✦'][i], w * (0.2 + i * 0.25), hh * (0.45 + (i % 2) * 0.25)); } });
    return { geo: topla(L), mat: [tasMat({ map }), ALTIN], parca: tasMat({ color: TAS }) };
  }
  function tepeSekil() {
    const { b, h, p } = TEPE, y0 = -h / 2, a = b / 2 * 0.98, V = (x, y, z) => new CANNON.Vec3(x, y, z);
    const v = [V(-a, y0, -a), V(a, y0, -a), V(a, y0, a), V(-a, y0, a), V(-a, y0 + p, -a), V(a, y0 + p, -a), V(a, y0 + p, a), V(-a, y0 + p, a), V(0, h / 2, 0)];
    return yonluCokyuzlu(v, [[0, 1, 2, 3], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7], [4, 5, 8], [5, 6, 8], [6, 7, 8], [7, 4, 8]]);
  }
  // yuzlerin sirasini disari bakacak sekilde duzeltir (CCW disaridan)
  function yonluCokyuzlu(v, faces) {
    const c = new CANNON.Vec3(); for (const p of v) c.vadd(p, c); c.scale(1 / v.length, c);
    const F = faces.map((f) => { const a = v[f[0]], b = v[f[1]], d = v[f[2]], n = b.vsub(a).cross(d.vsub(a)), m = new CANNON.Vec3(); for (const i of f) m.vadd(v[i], m); m.scale(1 / f.length, m); return n.dot(m.vsub(c)) < 0 ? f.slice().reverse() : f; });
    return new CANNON.ConvexPolyhedron({ vertices: v, faces: F });
  }
  // ---------- 4) dikili tas, lento, sunak, domino ----------
  function menhir(W, H, D, tohum, renk) {
    const g = kaba(kutu(W, H, D, 0.16, 3), 0.11, 1.6, tohum, 0.12);
    const map = tex(256, 512, (x, w, h) => { const r = rng(tohum); tasBoya(x, 0, 0, w, h, renk, r, { catlak: 2, yosun: 0.35, pah: 0.06 }); });
    return { geo: g, mat: tasMat({ map }), parca: tasMat({ color: renk }) };   // tek malzeme: tur basina tek cizim
  }
  function lento() {
    const g = kaba(kutu(2.45, 0.55, 0.8, 0.12, 3), 0.07, 1.8, 77);
    const map = tex(512, 128, (x, w, h) => { const r = rng(77); tasBoya(x, 0, 0, w, h, '#8c93b4', r, { catlak: 2, pah: 0.16 }); });
    const m = tasMat({ map });
    return { geo: g, mat: m, parca: tasMat({ color: '#8c93b4' }) };
  }
  function sunak() {
    const W = 2.8, H = 0.4, D = 1.3, L = [];
    L.push([kutu(W, H, D, 0.07, 2), 0]);
    const kk = kutu(W * 0.96, 0.06, D * 0.9, 0.02, 1); kk.translate(0, H / 2, 0); L.push([kk, 1]);   // ustte ince altin kakma serit
    const map = tex(512, 256, (x, w, h) => {
      const r = rng(51); tasBoya(x, 0, 0, w, h, '#f0dfc0', r, { pah: 0.1 });
      x.strokeStyle = 'rgba(190,120,20,.9)'; x.lineWidth = 7; x.strokeRect(w * 0.06, h * 0.18, w * 0.88, h * 0.64);
      x.fillStyle = 'rgba(190,120,20,.85)'; for (let i = 0; i < 7; i++) { x.beginPath(); x.arc(w * (0.15 + i * 0.117), h * 0.5, h * 0.07, 0, Pi * 2); x.fill(); }
    });
    return { geo: topla(L), mat: [std({ map, roughness: 0.4, envMapIntensity: 0.5, emissive: '#3a2a10', emissiveIntensity: 0.08 }), ALTIN], parca: std({ color: '#f0dfc0', roughness: 0.5 }) };
  }
  function domino() {
    const W = 1.5, H = 3.3, D = 0.44, L = [[kutu(W, H, D, 0.1, 2), 0]];
    // altin cerceve cizgisi ve noktalar (on ve arka yuz): ust yari 3, alt yari 5
    const bar = kutu(W * 0.78, 0.07, 0.04, 0.015, 1);
    for (const z of [1, -1]) {
      const b = bar.clone(); b.translate(0, 0, z * (D / 2 + 0.005)); L.push([b, 1]);
      const nok = (px, py) => { const s = new THREE.SphereGeometry(0.13, 12, 6, 0, Pi * 2, 0, Pi / 2); s.rotateX(z * Pi / 2); s.scale(1, 1, 0.55); s.translate(px, py, z * (D / 2 - 0.01)); L.push([s, 1]); };
      for (const [px, py] of [[-0.36, 0.5], [0, 0.85], [0.36, 1.2]]) nok(px, py);
      for (const [px, py] of [[-0.36, -0.5], [0.36, -0.5], [0, -0.85], [-0.36, -1.2], [0.36, -1.2]]) nok(px, py);
    }
    const map = tex(256, 512, (x, w, h) => {
      let g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#3a5cf0'); g.addColorStop(0.45, '#1a3cc8'); g.addColorStop(1, '#0c2080'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      const r = rng(13); for (let i = 0; i < 26; i++) { x.strokeStyle = 'rgba(160,190,255,' + (0.06 + r() * 0.1) + ')'; x.lineWidth = 1 + r() * 2; x.beginPath(); let px = r() * w, py = r() * h; x.moveTo(px, py); for (let k = 0; k < 4; k++) { px += (r() - 0.5) * 60; py += (r() - 0.5) * 60; x.lineTo(px, py); } x.stroke(); }
      g = x.createLinearGradient(0, 0, 0, h * 0.08); g.addColorStop(0, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h * 0.08);
      g = x.createLinearGradient(0, h * 0.9, 0, h); g.addColorStop(0, 'rgba(0,0,40,0)'); g.addColorStop(1, 'rgba(0,0,40,.5)'); x.fillStyle = g; x.fillRect(0, h * 0.9, w, h * 0.1);
      x.strokeStyle = 'rgba(255,200,60,.85)'; x.lineWidth = 9; x.strokeRect(9, 9, w - 18, h - 18);
    });
    return { geo: topla(L), mat: [std({ map, roughness: 0.22, envMapIntensity: 0.8, emissive: '#0a1a70', emissiveIntensity: 0.25 }), ALTIN], parca: std({ color: '#2244d8', roughness: 0.25 }) };
  }

  // ---------- v5.6 (17 Kas 2026): Blender'da uretilen oyuncak bloklar (yapi/model/pilot/*.glb; kaynak: yapi/uretici/blender/pilot_bloklar.py) ----------
  // Sekil gercek geometri (yuvarlak kenar, girintili pano, kabartma pati/tilki amblemi). Renk kose renginde; ortam golgesi ve yumusak isik
  // Blender'da hesaplanip 512'lik tek dokuya gomulu (map = isik dokusu x kose rengi). Tam beyaz kose rengi "govde rengi" isaretidir:
  // tek dosyadan uc renk kup, iki renk kavanoz cikar. Dosya yalniz o turu kullanan pilot bolumde iner (yukle).
  const T = (w, h, d, o) => Object.assign({ w: w / S, h: h / S, d: d / S, f: 0.72, r: 0.05, ses: 'tas', sert: 1 }, o);
  const GLB = {}, GLBP = {};
  const glbYukle = (ad) => GLBP[ad] || (GLBP[ad] = new Promise((ok) => new GLTFLoader().load('model/pilot/' + ad + '.glb?v=1', (gl) => {
    let m = null; gl.scene.traverse((o) => { if (o.isMesh && !m) m = o; });
    if (m) { const map = m.material && m.material.map || null; if (map) map.anisotropy = 8; GLB[ad] = { geo: m.geometry, map }; }
    ok();
  }, undefined, () => { console.warn('pilot: model yuklenemedi', ad); ok(); })));
  // o: { govde: govde rengi (isaretli koseler), puruz, sil: silindir mi, olcu: [w, h, d] (dunya birimi) }
  function blok(ad, renk, o) {
    const [w, h, d] = o.olcu, G = GLB[ad], parca = std({ color: renk, roughness: o.puruz + 0.1 });
    const kontur = o.sil ? new THREE.CylinderGeometry(w * 0.47, w * 0.47, h, 16) : kutu(w, h, d, S * 0.1, 1);   // koyu kontur sade govdeden (amblemin cevresinde cizgi olmasin)
    if (!G) return { geo: o.sil ? new THREE.CylinderGeometry(w * 0.47, w * 0.47, h, 20) : kutu(w, h, d, S * 0.1, 2), mat: std({ color: renk, roughness: o.puruz }), parca };   // dosya gelmediyse sade govde (oyun durmasin)
    let geo = G.geo;
    if (o.govde) {
      geo = G.geo.clone(); const c = geo.attributes.color, k = col(o.govde);
      if (c) for (let i = 0; i < c.count; i++) if (c.getX(i) > 0.97 && c.getY(i) > 0.97 && c.getZ(i) > 0.97) c.setXYZ(i, k.r, k.g, k.b);
    }
    const mat = std({ map: G.map, vertexColors: !!geo.attributes.color, roughness: o.puruz, envMapIntensity: o.env || 0.55 });
    return { geo, mat, parca, konturGeo: kontur, golgeKutu: 1 };
  }
  const KUPR = { K: '#e8242c', Y: '#22b84a', M: '#2276f0' }, KAVR = { T: '#12b8b0', M: '#9a3cf0' };
  const kupTur = (r) => T(S, S, S, { mass: 0.85, f: 0.6, r: 0.14, ses: 'tahta', sert: 0, renk: KUPR[r], kir: 1, yuzer: 1, glb: 'pl_kup', yap: () => blok('pl_kup', KUPR[r], { govde: KUPR[r], puruz: 0.3, olcu: [S, S, S] }) });
  // kavanoz kirilgan: top degince ya da sert carpinca tuzla buz (topKir: oyunun kendi carpisma kirilmasi, sise ile ayni yol)
  const kavTur = (r) => T(S, S, S, { mass: 0.6, f: 0.5, r: 0.08, ses: 'cam', sert: 0, renk: KAVR[r], sekil: 'sil', kir: 1, topKir: 6.5, glb: 'pl_kavanoz', yap: () => blok('pl_kavanoz', KAVR[r], { govde: KAVR[r], puruz: 0.2, env: 0.8, sil: 1, olcu: [S, S, S] }) });
  // ---------- tur tablosu (w, h, d: kup kenari S cinsinden) ----------
  const TUR = {
    plSutunK: T(0.86, 2.6, 0.86, { temas: { grup: 'tas', plat: 0.8, kendi: 0.12 }, mass: 0.45, renk: '#a7acc6', sekil: 'sil', yap: sutunK }),
    plCati: T(3.4, 0.48, 3.4, { temas: { grup: 'tas', plat: 0.8, kendi: 0.12 }, mass: 1.4, renk: TAS, carp: 6, yap: cati }),
    plTepe: T(TEPE.b, TEPE.h, TEPE.b, { mass: 0.35, renk: TAS, yap: tepe, cs: tepeSekil }),
    plMenhir: T(1.3, 3.3, 0.75, { yatik: 1, temas: { grup: 'tas', plat: 0.8, kendi: 0.12 }, mass: 1.7, f: 0.75, renk: '#9097b6', carp: 6, devril: 3.6, yap: () => menhir(1.3, 3.3, 0.75, 21, '#9097b6') }),
    plMenhirT: T(1.3, 4.2, 0.78, { yatik: 1, temas: { grup: 'tas', plat: 0.8, kendi: 0.12 }, mass: 2.1, f: 0.75, renk: '#8a92b2', carp: 6, devril: 3.4, yap: () => menhir(1.3, 4.2, 0.78, 33, '#8a92b2') }),
    plMenhirK: T(1.25, 2.5, 0.85, { yatik: 1, temas: { grup: 'tas', plat: 0.8, kendi: 0.12 }, mass: 1.3, f: 0.75, renk: '#8f9ab0', carp: 6, devril: 2.6, yap: () => menhir(1.25, 2.5, 0.85, 63, '#8f9ab0') }),
    plLento: T(2.45, 0.55, 0.8, { yatik: 1, temas: { grup: 'tas', plat: 0.8, kendi: 0.12 }, mass: 0.6, f: 0.7, renk: '#8c93b4', carp: 5, yap: lento }),
    plSunak: T(2.8, 0.4, 1.3, { temas: { grup: 'tas', plat: 0.8, kendi: 0.12 }, mass: 0.7, f: 0.7, renk: '#f0dfc0', carp: 4.5, yap: sunak }),
    plDomino: T(1.5, 3.3, 0.44, { yatik: 1, mass: 0.85, f: 0.35, r: 0.02, renk: '#2244d8', carp: 5.5, yap: domino, temas: { plat: 0.95, kendi: 0 }, govde: { angularDamping: 0.01, linearDamping: 0.01, sleepSpeedLimit: 0.04, sleepTimeLimit: 1.2 } }),
    // v5.6: Blender bloklari. Tahta hafif ve kirilir, tas agir ve serttir, kavanoz kirilgandir.
    plKupK: kupTur('K'), plKupY: kupTur('Y'), plKupM: kupTur('M'),
    plKalas: T(3 * S, S, S, { mass: 1.7, f: 0.62, r: 0.08, ses: 'tahta', sert: 0, renk: '#f08a24', kir: 1, yuzer: 1, glb: 'pl_kalas', yap: () => blok('pl_kalas', '#f08a24', { puruz: 0.42, olcu: [3 * S, S, S] }) }),
    plKavanozT: kavTur('T'), plKavanozM: kavTur('M'),
    plLevha: T(2 * S, S, S, { mass: 2.6, f: 0.72, r: 0.05, ses: 'tas', renk: '#5b6e9c', glb: 'pl_levha', yap: () => blok('pl_levha', '#5b6e9c', { puruz: 0.5, env: 0.4, olcu: [2 * S, S, S] }) }),
    plSutun: T(S, 2 * S, S, { mass: 2.2, f: 0.7, r: 0.05, ses: 'tas', renk: '#f3e6cc', sekil: 'sil', glb: 'pl_sutun', yap: () => blok('pl_sutun', '#f3e6cc', { puruz: 0.38, sil: 1, olcu: [S, 2 * S, S] }) })
  };
  // bolumun kullandigi turlerin model dosyalarini indirir (pilot.js bolum kurulmadan once bekler)
  const yukle = (turler) => Promise.all([...new Set(turler.map((k) => TUR[k] && TUR[k].glb).filter(Boolean))].map(glbYukle));
  return { TUR, yukle };
}
