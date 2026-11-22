// Foxi Smash v11.2 (22 Kas 2026, Adem: 'once platform'): boyali platform ve ayak (seker.js golgelendirmesi). Yalniz ?plat3=1.
// Tabla: dis cizgi (fizikle ayni cokgen) boyunca profil supurulur: altin kalin ust kenar, parlak mor kusak, ince alt altin serit, ustte mor taban
// ve altin ic cizgi. Ayak: basamakli mor-altin taban, mor parlak sutun, altin bilezikler. Olculer, fizik ve hareketler oyun.js'te ayni.
import { sekerMat, sekerDuz } from './seker.js?v=4';
export const PLAT3 = new URLSearchParams(location.search).get('plat3') === '1' && !window.KORSAN;
const A = '#ffc21c', AA = '#ffd23c', AK = '#b97608', M = '#8232f0', MA = '#9a52fa', MK = '#3b128c', UST = '#7a35e2', USTK = '#4d18ac';
export function plat3Kur({ THREE, pKaydir }) {
  const C = (h) => { const c = new THREE.Color(h); return [c.r, c.g, c.b]; };
  let KM = null, SM = null; const GEO = {};
  const kutuMat = () => KM || (KM = sekerMat(THREE, new THREE.BoxGeometry(1, 1, 1), { sk: 'kutu' })), silMat = () => SM || (SM = sekerMat(THREE, new THREE.BoxGeometry(1, 1, 1), { sk: 'cam' }));
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
  function tabla(Pc, th) {
    let al2 = 0; for (let i = 0; i < Pc.length; i++) { const p = Pc[i], q = Pc[(i + 1) % Pc.length]; al2 += p[0] * q[1] - q[0] * p[1]; } if (al2 < 0) Pc = Pc.slice().reverse();   // pKaydir'de arti = disari olsun
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
      const c0 = C(pr[k][2]), c1 = c0;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n, h0 = kose(i, i), h1 = kose(j, i), a = [...hal[k][i], pr[k][1]], b0 = [...hal[k][j], pr[k][1]], c = [...hal[k + 1][j], pr[k + 1][1]], d = [...hal[k + 1][i], pr[k + 1][1]];
        ekle(a, h0, pn[k][0], c0); ekle(b0, h1, pn[k][0], c0); ekle(c, h1, pn[k][1], c1); ekle(a, h0, pn[k][0], c0); ekle(c, h1, pn[k][1], c1); ekle(d, h0, pn[k][1], c1);
      }
    }
    const kapak = (H, y, ny, c) => { const cc = C(c); for (let i = 1; i < n - 1; i++) for (const q of ny > 0 ? [0, i, i + 1] : [0, i + 1, i]) { P.push(H[q][0], y, H[q][1]); N.push(0, ny, 0); K.push(...cc); } };
    kapak(hal[0], pr[0][1], 1, UST); kapak(hal[hal.length - 1], pr[pr.length - 1][1], -1, MK);
    return duzelt(bitir(P, N, K));
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
    tabla: (P, th) => new THREE.Mesh(tabla(P, th), kutuMat()),
    // paylasilan geometriler her kullanimda kopyalanir (oyun.js ptAt bolum degisince geometrileri bosaltir)
    taban: () => new THREE.Mesh(al('taban', () => torna([[1.2, -0.14, AK], [1.38, -0.1, A], [1.46, -0.02, A], [1.46, 0.08, A], [1.38, 0.17, A], [1.26, 0.21, AK], [1.2, 0.2, MK], [1.17, 0.22, M], [1.14, 0.3, M], [1.05, 0.44, M], [0.92, 0.56, MA], [0.8, 0.62, MA], [0.74, 0.63, MK], [0.72, 0.65, AK], [0.755, 0.68, A], [0.765, 0.74, A], [0.72, 0.8, A], [0.6, 0.83, AK], [0.4, 0.83, AK]], 40)).clone(), silMat()),
    bilezik: () => new THREE.Mesh(al('bil', () => torna([[0.48, -0.1, AK], [0.585, -0.085, A], [0.625, -0.03, A], [0.625, 0.04, AA], [0.585, 0.09, AA], [0.46, 0.1, AK]], 32)).clone(), silMat()),
    baslik: () => new THREE.Mesh(al('bas', () => torna([[0.47, -0.04, AK], [0.56, -0.03, A], [0.6, 0.03, A], [0.64, 0.08, A], [0.78, 0.17, AA], [0.96, 0.24, AA], [1.02, 0.29, A], [1.02, 0.345, AK], [0.5, 0.345, AK]], 36)).clone(), silMat()),
    govde: () => new THREE.Mesh(al('gov', () => torna([[0.55, -0.5, M], [0.5, 0, M], [0.45, 0.5, M]], 32)).clone(), silMat()),
    mat: (hex, sk) => sekerDuz(THREE, hex, sk || 'kutu')
  };
}
