// Foxi Smash v11.2 (22 Kas 2026, Adem: 'once platform'): boyali platform ve ayak (seker.js golgelendirmesi). Yalniz ?plat3=1.
// Tabla: dis cizgi (fizikle ayni cokgen) boyunca profil supurulur: altin kalin ust kenar, parlak mor kusak, ince alt altin serit, ustte mor taban
// ve altin ic cizgi. Ayak: basamakli mor-altin taban, mor parlak sutun, altin bilezikler. Olculer, fizik ve hareketler oyun.js'te ayni.
import { sekerMat, sekerDuz } from './seker.js?v=4';
export const PLAT3 = new URLSearchParams(location.search).get('plat3') === '1' && !window.KORSAN;
// v11.3 (Adem: 'rakibin kopyasi olmasin, rengi farkli yapalim'): KORSAN GEMISI renkleri (varsayilan): acik tahta guverte, halat kenar,
// deniz turkuazi kusak, gemi diregi ayak. Deneme: ?prenk=mercan (kirmizi kusak) | gece (lacivert kusak) | mor (v11.2 mor-altin)
const PR = new URLSearchParams(location.search).get('prenk') || 'deniz', MORLU = PR === 'mor';
const [M, MA, MK] = { deniz: ['#0f9fb4', '#25bccb', '#06566e'], mercan: ['#e8413a', '#f8685a', '#8a1420'], gece: ['#2f55b8', '#4672d8', '#142a6e'], mor: ['#8232f0', '#9a52fa', '#3b128c'] }[PR] || ['#0f9fb4', '#25bccb', '#06566e'];
const A = MORLU ? '#ffc21c' : '#f3d49a', AA = MORLU ? '#ffd23c' : '#ffe9bf', AK = MORLU ? '#b97608' : '#9c6a30', UST = '#7a35e2', USTK = MORLU ? '#4d18ac' : '#8a5a2a';
const TABK = MORLU ? A : '#d9862f';
export const P3ALTIN = A, P3YAN = M, P3KOYU = MK, P3AK = AK;
const HALAT = ['#fff0cc', '#c98f48'], GUV = ['#e2a658', '#d9994a', '#e8b066'], GUVK = '#8a5524', DIREK = '#c9742f', CER = '#b9692a';   // guverte, oluk, direk, guverte cercevesi
export function plat3Kur({ THREE, pKaydir }) {
  const C = (h) => { const c = new THREE.Color(h); return [c.r, c.g, c.b]; };
  let KM = null, SM = null, TM = null; const GEO = {};
  const kutuMat = () => KM || (KM = sekerMat(THREE, new THREE.BoxGeometry(1, 1, 1), { sk: 'kutu' })), tahtaMat = () => TM || (TM = sekerMat(THREE, new THREE.BoxGeometry(1, 1, 1), { sk: 'tahta' })), silMat = () => SM || (SM = sekerMat(THREE, new THREE.BoxGeometry(1, 1, 1), { sk: 'cam' }));
  function bitir(P, N, K) {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
    const n = K.length / 3, d = new Float32Array(n * 4); for (let i = 0; i < n; i++) { d[i * 4] = K[i * 3]; d[i * 4 + 1] = K[i * 3 + 1]; d[i * 4 + 2] = K[i * 3 + 2]; d[i * 4 + 3] = 1; }
    g.setAttribute('color', new THREE.BufferAttribute(d, 4)); g.computeBoundingSphere(); return g;
  }
  // profil: [uzaklik, y, renk (bu noktadan sonraki parcanin)] ; parcalar arasi aci kucukse yumusak
  function profilNormal(pr) {
    const s = []; for (let i = 0; i < pr.length - 1; i++) { const dx = pr[i + 1][0] - pr[i][0], dy = pr[i + 1][1] - pr[i][1], l = Math.hypot(dx, dy) || 1; s.push([-dy / l, dx / l]); }   // sagdan disari
    return s.map((a, i) => [-1, 1].map((yon) => { const b = s[i + yon]; if (!b || a[0] * b[0] + a[1] * b[1] < 0.55) return a; const x = a[0] + b[0], y = a[1] + b[1], l = Math.hypot(x, y) || 1; return [x / l, y / l]; }));
  }
  // cokgen kenarlarini kisa parcalara bol (halat orgusu icin)
  function sik(P, adim) { const o = []; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / adim)); for (let k = 0; k < n; k++) o.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); } return o; }
  function tabla(Pc, th) {
    let al2 = 0; for (let i = 0; i < Pc.length; i++) { const p = Pc[i], q = Pc[(i + 1) % Pc.length]; al2 += p[0] * q[1] - q[0] * p[1]; } if (al2 < 0) Pc = Pc.slice().reverse();   // pKaydir'de arti = disari olsun
    if (!MORLU) Pc = sik(Pc, 0.11);
    const ince = th < 0.6, b = ince ? -th + 0.03 : -th;
    // ustten alta, icten disa gider
    const pr = [[-0.44, -0.004, USTK], [-0.41, -0.03, USTK], [-0.385, -0.03, USTK], [-0.36, -0.004, AK], [-0.34, 0, A], [-0.06, 0, AA], [0.02, -0.012, AA], [0.075, -0.05, A], [0.095, -0.105, A], [0.085, -0.16, A], [0.045, -0.205, AK], [-0.01, -0.22, AK], [-0.03, -0.235, MK]];
    if (ince) pr.push([-0.03, -0.26, M], [-0.04, b + 0.05, MK], [-0.1, b, MK], [-0.5, b, MK]);
    else pr.push([-0.03, -0.275, MA], [-0.01, -0.33, M], [-0.005, b + 0.27, M], [-0.03, b + 0.215, MK], [-0.03, b + 0.19, AK], [0.015, b + 0.175, AA], [0.05, b + 0.14, A], [0.055, b + 0.095, A], [0.02, b + 0.05, AK], [-0.05, b + 0.03, MK], [-0.14, b - 0.01, MK], [-0.3, b - 0.12, MK], [-0.6, b - 0.14, MK]);
    const n = Pc.length, hal = pr.map((p) => pKaydir(Pc, p[0])), pn = profilNormal(pr), P = [], N = [], K = [];
    // kose normalleri: komsu kenarlar arasi aci kucukse ortak
    const kn = []; for (let i = 0; i < n; i++) { const a = Pc[i], c = Pc[(i + 1) % n], l = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1; kn.push([(c[1] - a[1]) / l, -(c[0] - a[0]) / l]); }
    const kose = (i, e) => { const o = kn[(i + n - 1) % n], s = kn[i % n], t = kn[e]; if (o[0] * s[0] + o[1] * s[1] < 0.8) return t; const x = o[0] + s[0], z = o[1] + s[1], l = Math.hypot(x, z) || 1; return [x / l, z / l]; };
    const ekle = (p, h, pnn, c) => { P.push(p[0], p[2], p[1]); N.push(h[0] * pnn[0], pnn[1], h[1] * pnn[0]); K.push(c[0], c[1], c[2]); };
    for (let k = 0; k < pr.length - 1; k++) {
      let c0 = C(pr[k][2]), c1 = c0; const ab = !MORLU && (pr[k][2] === A || pr[k][2] === AA), halat = ab && pr[k][0] > -0.08, h0c = C(HALAT[0]), h1c = C(HALAT[1]); if (ab && !halat) c0 = c1 = C(CER);
      const hr = (i, kk) => { const t = 0.5 + 0.5 * Math.sin((i + kk * 1.15) * 1.05), u = t * t * (3 - 2 * t); return h0c.map((v, m) => v * u + h1c[m] * (1 - u)); };   // burgulu halat: capraz yumusak serit
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n, h0 = kose(i, i), h1 = kose(j, i), a = [...hal[k][i], pr[k][1]], b0 = [...hal[k][j], pr[k][1]], c = [...hal[k + 1][j], pr[k + 1][1]], d = [...hal[k + 1][i], pr[k + 1][1]];
        const ca = halat ? hr(i, k) : c0, cb = halat ? hr(i + 1, k) : c0, cc = halat ? hr(i + 1, k + 1) : c1, cd = halat ? hr(i, k + 1) : c1;
        ekle(a, h0, pn[k][0], ca); ekle(b0, h1, pn[k][0], cb); ekle(c, h1, pn[k][1], cc); ekle(a, h0, pn[k][0], ca); ekle(c, h1, pn[k][1], cc); ekle(d, h0, pn[k][1], cd);
      }
    }
    const kapak = (H, y, ny, c) => { const cc = C(c); for (let i = 1; i < n - 1; i++) for (const q of ny > 0 ? [0, i, i + 1] : [0, i + 1, i]) { P.push(H[q][0], y, H[q][1]); N.push(0, ny, 0); K.push(...cc); } };
    if (MORLU) kapak(hal[0], pr[0][1], 1, UST); kapak(hal[hal.length - 1], pr[pr.length - 1][1], -1, MK);
    return duzelt(bitir(P, N, K));
  }
  // guverte: ust yuz z yonunde serit tahtalara bolunur (aralari koyu oluk), tahta damarli
  function guverte(Pc) {
    let al2 = 0; for (let i = 0; i < Pc.length; i++) { const p = Pc[i], q = Pc[(i + 1) % Pc.length]; al2 += p[0] * q[1] - q[0] * p[1]; } if (al2 < 0) Pc = Pc.slice().reverse();
    const H = pKaydir(Pc, -0.44), zs = H.map((p) => p[1]), z0 = Math.min(...zs), z1 = Math.max(...zs), n = Math.max(2, Math.round((z1 - z0) / 0.62)), w = (z1 - z0) / n, P = [], N = [], K = [], D = [];
    const kes = (Q, z, yon) => { const o = []; for (let i = 0; i < Q.length; i++) { const a = Q[i], b = Q[(i + 1) % Q.length], da = (a[1] - z) * yon, db = (b[1] - z) * yon; if (da >= 0) o.push(a); if (da * db < 0) { const t = da / (da - db); o.push([a[0] + (b[0] - a[0]) * t, z]); } } return o; };
    const koy = (Q, y, c, dm) => { const cc = C(c); for (let i = 1; i < Q.length - 1; i++) for (const k of [0, i, i + 1]) { P.push(Q[k][0], y, Q[k][1]); N.push(0, 1, 0); K.push(...cc); D.push(dm ? 0.5 : 1); } };
    koy(H, -0.03, GUVK, 0);
    for (let k = 0; k < n; k++) { const Q = kes(kes(H, z0 + k * w + 0.03, 1), z0 + (k + 1) * w - 0.03, -1); if (Q.length > 2) koy(Q, -0.003, GUV[(k * 5 + 1) % 3], 1); }
    const g = duzelt(bitir(P, N, K)), c = g.attributes.color; for (let i = 0; i < D.length; i++) c.setW(i, D[i]); return g;
  }
  // ucgen yonu normalle ayni olsun (dis cizgi yonu bolume gore degisebilir)
  function duzelt(g) {
    const p = g.attributes.position, n = g.attributes.normal, c = g.attributes.color, a = new THREE.Vector3(), b = new THREE.Vector3(), d = new THREE.Vector3(), t = new THREE.Vector3();
    for (let i = 0; i < p.count; i += 3) {
      a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1).sub(a); d.fromBufferAttribute(p, i + 2).sub(a); b.cross(d); t.fromBufferAttribute(n, i);
      if (b.dot(t) < 0) for (const at of [p, n, c]) { const s = at.itemSize, r = at.array; for (let k = 0; k < s; k++) { const x = r[(i + 1) * s + k]; r[(i + 1) * s + k] = r[(i + 2) * s + k]; r[(i + 2) * s + k] = x; } }
    }
    return g;
  }
  function torna(pr, seg) {   // pr: [r, y, renk] alttan uste
    const P = [], N = [], K = [], pn = profilNormal(pr.map((p) => [p[0], p[1]]));
    for (let k = 0; k < pr.length - 1; k++) for (let i = 0; i < seg; i++) {
      const a0 = i / seg * Math.PI * 2, a1 = (i + 1) / seg * Math.PI * 2, c = C(pr[k][2]);
      const v = (a, q, yon) => { const s = pn[k][yon]; P.push(pr[q][0] * Math.cos(a), pr[q][1], pr[q][0] * Math.sin(a)); N.push(-s[0] * -1 * Math.cos(a) * 1, -s[1] * -1, -s[0] * -1 * Math.sin(a)); K.push(...c); };
      v(a0, k, 0); v(a1, k, 0); v(a1, k + 1, 1); v(a0, k, 0); v(a1, k + 1, 1); v(a0, k + 1, 1);
    }
    const g = bitir(P, N, K), n = g.attributes.normal, p = g.attributes.position;   // normaller disari baksin
    let top = 0; for (let i = 0; i < p.count; i++) top += p.getX(i) * n.getX(i) + p.getZ(i) * n.getZ(i); if (top < 0) for (let i = 0; i < n.array.length; i++) n.array[i] *= -1;
    return duzelt(g);
  }
  const al = (k, f) => GEO[k] || (GEO[k] = f());
  return {
    tabla: (P, th) => { const m = new THREE.Mesh(tabla(P, th), kutuMat()); if (!MORLU) { const u = new THREE.Mesh(guverte(P), tahtaMat()); u.receiveShadow = true; m.add(u); } return m; },
    // paylasilan geometriler her kullanimda kopyalanir (oyun.js ptAt bolum degisince geometrileri bosaltir)
    taban: () => new THREE.Mesh(al('taban', () => torna([[1.2, -0.14, AK], [1.38, -0.1, TABK], [1.46, -0.02, TABK], [1.46, 0.08, TABK], [1.38, 0.17, TABK], [1.26, 0.21, AK], [1.2, 0.2, MK], [1.17, 0.22, M], [1.14, 0.3, M], [1.05, 0.44, M], [0.92, 0.56, MA], [0.8, 0.62, MA], [0.74, 0.63, MK], [0.72, 0.65, AK], [0.755, 0.68, A], [0.765, 0.74, A], [0.72, 0.8, A], [0.6, 0.83, AK], [0.4, 0.83, AK]], 40)).clone(), silMat()),
    bilezik: () => new THREE.Mesh(al('bil', () => torna([[0.48, -0.1, AK], [0.585, -0.085, A], [0.625, -0.03, A], [0.625, 0.04, AA], [0.585, 0.09, AA], [0.46, 0.1, AK]], 32)).clone(), silMat()),
    baslik: () => new THREE.Mesh(al('bas', () => torna([[0.47, -0.04, AK], [0.56, -0.03, A], [0.6, 0.03, A], [0.64, 0.08, A], [0.78, 0.17, AA], [0.96, 0.24, AA], [1.02, 0.29, A], [1.02, 0.345, AK], [0.5, 0.345, AK]], 36)).clone(), silMat()),
    govde: () => new THREE.Mesh(al('gov', () => torna([[0.55, -0.5, MORLU ? M : DIREK], [0.5, 0, MORLU ? M : DIREK], [0.45, 0.5, MORLU ? M : DIREK]], 32)).clone(), silMat()),
    mat: (hex, sk) => sekerDuz(THREE, hex, sk || 'kutu')
  };
}
