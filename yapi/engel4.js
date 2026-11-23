// Foxi Smash v12 (23 Kas 2026, Adem: 'yeni engelleyiciler ekle, oyun monoton gitmesin'): 6 yeni engel. Eski havuz: ?eng4=0
//   cark    : delikli dev cark doner; acik dilimden at
//   ahtapot : iki ahtapot kolu asagidan uzanir, sallanir
//   papagan : yapinin onunde sekiz cizerek ucar
//   gulle   : zincirle bagli iki dikenli gulle merkezin cevresinde doner
//   balon   : balona asili fici; balonu vurursan patlar, engel kalkar
//   fici3   : uc fici sirayla ziplar
// Bicim: kur(E, grp, body, o) engeli kurar; kare(E, t, dt) konumlar. Fizik govdeleri kinematik, top carpinca oyun.js engCarp calisir.
import { sekerDuz } from './seker.js?v=7';
export const ENG4 = new URLSearchParams(location.search).get('eng4') !== '0' && !window.KORSAN;
export const ENG4HAVUZ = ['cark', 'ahtapot', 'papagan', 'gulle', 'balon', 'fici3', 'yengec', 'donerkapi', 'martilar'];
export const ENG4KART = {
  cark: ['Delikli Çark', '☸️', 'Dev çark döner. Açık dilim hedefin önüne gelince at!'],
  ahtapot: ['Ahtapot Kolları', '🐙', 'İki kol bir iner bir kalkar. Araları açılınca at!'],
  papagan: ['Papağan', '🦜', 'Yapının önünde sekiz çizerek uçar. Uzaklaşınca at!'],
  gulle: ['İkiz Gülle', '⛓️', 'Dikenli gülleler döner durur. Boşluğu kolla!'],
  balon: ['Balonlu Fıçı', '🎈', 'Balonu vurursan patlar, engel yok olur!'],
  fici3: ['Zıplayan Fıçılar', '🛢️', 'Üç fıçı sırayla zıplar. Yerdekinin üstünden at!'],
  yengec: ['Dev Yengeç', '🦀', 'Platformun önünde yan yan yürür, kıskaçlarını kaldırır. Alt sırayı korur!'],
  donerkapi: ['Döner Kapı', '🚪', 'Kanatlar dik eksende döner. Kanat yan dönünce at!'],
  martilar: ['Martı Sürüsü', '🕊️', 'Üç martı farklı yükseklikte uçar. Aralarından at!'] };
export function engel4Kur({ THREE, CANNON, S, SEK, patla }) {
  const M = {}, mat = (hex, sk) => M[hex + sk] || (M[hex + sk] = sekerDuz(THREE, hex, sk));
  const ekle = (g, geo, m, x, y, z, rx, ry, rz) => { const o = new THREE.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); o.rotation.set(rx || 0, ry || 0, rz || 0); o.castShadow = true; g.add(o); return o; };
  const G = {}, geo = (k, f) => G[k] || (G[k] = f());
  const kure = (r) => geo('k' + r, () => new THREE.SphereGeometry(r, 24, 18));
  const kutu = (body, hx, hy, hz, x, y, rz) => { const q = new CANNON.Quaternion(); q.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), rz || 0); body.addShape(new CANNON.Box(new CANNON.Vec3(hx, hy, hz)), new CANNON.Vec3(x || 0, y || 0, 0), q); };
  const govde = (E, body) => { const b = new CANNON.Body({ mass: 0, type: CANNON.Body.KINEMATIC, material: body.material }); b.collisionFilterGroup = 8; (E.ekB = E.ekB || []).push(b); return b; };
  function papaganMesh() {
    const g = new THREE.Group(), r = mat('#ea1f31', 'top'), sari = mat('#ffc310', 'top'), mavi = mat('#1c7cf6', 'top'), bey = mat('#fff6e8', 'top'), koyu = mat('#1b2040', 'top'), tur = mat('#ff8a1c', 'top');
    const gv = ekle(g, kure(0.62), r, 0, 0, 0); gv.scale.set(1.25, 0.95, 0.9); ekle(g, kure(0.46), r, 0.72, 0.5, 0); ekle(g, kure(0.25), bey, 0.86, 0.52, 0.28).scale.set(1, 1, 0.5); ekle(g, kure(0.1), koyu, 0.93, 0.56, 0.4);
    ekle(g, geo('gaga', () => new THREE.ConeGeometry(0.24, 0.55, 16)), tur, 1.24, 0.4, 0, 0, 0, -1.9); const tp = ekle(g, geo('tepe', () => new THREE.ConeGeometry(0.14, 0.5, 10)), sari, 0.55, 0.98, 0, 0, 0, 0.5); tp.scale.z = 0.5;
    for (const [c, y, a] of [[mavi, -0.02, 0.25], [sari, -0.12, 0.05], [r, 0.1, 0.45]]) { const k = ekle(g, geo('kuyruk', () => new THREE.SphereGeometry(0.5, 16, 10)), c, -1.15, y, 0, 0, 0, a); k.scale.set(1.15, 0.2, 0.36); }
    const kan = []; for (const z of [1, -1]) { const w = new THREE.Group(); w.position.set(0.05, 0.28, z * 0.42); g.add(w); const a = ekle(w, geo('kanat', () => new THREE.SphereGeometry(0.6, 18, 12)), mavi, -0.1, 0, z * 0.5); a.scale.set(0.8, 0.14, 1.15); const b = ekle(w, geo('kanat', null), sari, -0.35, -0.02, z * 0.75); b.scale.set(0.6, 0.12, 0.85); w.userData.z = z; kan.push(w); }
    g.userData.kan = kan; return g;
  }
  const K = {
    cark(E, grp, body, o) {
      const R = E.r = Math.max(2.4, Math.min(3.9, o.R * 0.72, o.TOPY * 0.52)), ah = mat('#fb9a2e', 'tahta'), kr = mat('#f7e6c4', 'tahta'), ko = mat('#b9692a', 'tahta'), al = mat('#ffc41c', 'kutu'), ki = mat('#ee2234', 'kutu');
      const dilim = (a0, a1, m, z) => { const s = new THREE.Shape(); s.moveTo(0, 0); s.absarc(0, 0, R - 0.12, a0, a1, false); s.lineTo(0, 0); ekle(grp, new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2, curveSegments: 14 }), m, 0, 0, z || -0.1); };
      const P = Math.PI; for (let i = 0; i < 6; i++) dilim(P / 2 + P / 4 + i * P / 4, P / 2 + P / 4 + (i + 1) * P / 4, i % 2 ? kr : ah);   // acik: 45..135 derece (ust dilim)
      ekle(grp, new THREE.TorusGeometry(R, 0.2, 14, 64), ko, 0, 0, 0); ekle(grp, new THREE.TorusGeometry(R * 0.55, 0.07, 10, 48, P * 1.5), ko, 0, 0, 0.14, 0, 0, P * 0.75);
      for (let i = 0; i < 8; i++) { const a = i * P / 4; ekle(grp, geo('kol', () => new THREE.CylinderGeometry(0.11, 0.15, 0.7, 12)), ko, Math.cos(a) * (R + 0.42), Math.sin(a) * (R + 0.42), 0, 0, 0, a - P / 2); ekle(grp, kure(0.17), al, Math.cos(a) * (R + 0.82), Math.sin(a) * (R + 0.82), 0); }
      for (const a of [P / 4, 3 * P / 4]) ekle(grp, new THREE.BoxGeometry(R, 0.24, 0.3), ki, Math.cos(a) * R / 2, Math.sin(a) * R / 2, 0.02, 0, 0, a);
      ekle(grp, geo('gobek', () => new THREE.CylinderGeometry(0.5, 0.56, 0.6, 28)), al, 0, 0, 0.05, P / 2); ekle(grp, kure(0.28), ki, 0, 0, 0.36);
      for (let i = 0; i < 6; i++) { const a = P * 0.75 + (i + 0.5) * P / 4; kutu(body, R * 0.46, R * 0.2, 0.2, Math.cos(a) * R * 0.52, Math.sin(a) * R * 0.52, a); kutu(body, 0.35, R * 0.36, 0.2, Math.cos(a) * R * 0.82, Math.sin(a) * R * 0.82, a); }
      E.w = (0.75 + 0.4 * o.d) * o.hiz;
    },
    ahtapot(E, grp, body, o) {
      const c = mat('#ff5a4e', 'top'), v = mat('#ffd9b8', 'top'), kol = (yon) => { const g = new THREE.Group(), H = E.H; let x = 0; for (let i = 0; i < 15; i++) { const k = i / 14, r = 0.62 - 0.42 * k, y = k * H; x = Math.sin(k * 3.6) * 0.5 * yon + k * k * 0.7 * yon; const s = ekle(g, kure(1), c, x, y, 0); s.scale.set(r, r * 1.25, r); if (i % 2 === 0 && i < 14) { const q = ekle(g, kure(1), v, x - yon * r * 0.35, y, r * 0.82); q.scale.set(r * 0.3, r * 0.3, r * 0.16); } } return g; };
      E.H = o.yc + 2.2 + Math.min(2, o.TOPY * 0.2); E.g1 = kol(1); E.g2 = kol(-1); grp.add(E.g1, E.g2); const b2 = govde(E, body); for (const b of [body, b2]) { const sg = b === body ? 1 : -1; kutu(b, 0.46, E.H * 0.3, 0.3, 0.2 * sg, E.H * 0.3); kutu(b, 0.36, E.H * 0.22, 0.3, 0.45 * sg, E.H * 0.78); }
      E.w = (0.95 + 0.45 * o.d) * o.hiz; E.x1 = Math.max(1.5, o.R * 0.42); E.alt = -1.6;
    },
    papagan(E, grp, body, o) { E.kus = papaganMesh(); E.kus.scale.setScalar(1.15); grp.add(E.kus); kutu(body, 1.15, 0.75, 0.3, 0, 0.1); E.ax = Math.max(2, o.R * 0.72); E.ay = Math.max(0.9, Math.min(2.2, o.TOPY * 0.22)); E.w = (0.95 + 0.4 * o.d) * o.hiz; },
    gulle(E, grp, body, o) {
      const r = E.r = Math.max(1.7, Math.min(3.1, o.R * 0.55, o.TOPY * 0.42)), de = mat('#4a5688', 'top'), di = mat('#c9d2ee', 'kutu'), al = mat('#ffc41c', 'kutu');
      for (const s of [1, -1]) { ekle(grp, kure(0.82), de, s * r, 0, 0); for (let i = 0; i < 10; i++) { const a = i * 2.4, z = 1 - 2 * (i + 0.5) / 10, q = Math.sqrt(1 - z * z), dx = Math.cos(a) * q, dy = Math.sin(a) * q, k = ekle(grp, geo('diken', () => new THREE.ConeGeometry(0.17, 0.42, 10)), di, s * r + dx * 0.95, dy * 0.95, z * 0.95); k.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx, dy, z)); } body.addShape(new CANNON.Sphere(0.95), new CANNON.Vec3(s * r, 0, 0));
        const n = Math.round((r - 1) / 0.3); for (let i = 0; i < n; i++) ekle(grp, geo('halka', () => new THREE.TorusGeometry(0.16, 0.055, 8, 14)), di, s * (0.45 + (i + 0.5) * (r - 1.25) / n), 0, 0, i % 2 ? Math.PI / 2 : 0, 0, 0).scale.set(1.35, 1, 1); }
      ekle(grp, kure(0.4), al, 0, 0, 0); kutu(body, r, 0.12, 0.12, 0, 0); E.w = (1.3 + 0.6 * o.d) * o.hiz;
    },
    balon(E, grp, body, o) {
      const c = [mat('#ea1f31', 'top'), mat('#fff0d8', 'top')], ip = mat('#b9692a', 'tahta');
      const bl = E.bl = new THREE.Group(); grp.add(bl); const s = ekle(bl, kure(1.25), c[0], 0, 1.75, 0); s.scale.set(1, 1.12, 1); for (let i = 0; i < 3; i++) { const t = ekle(bl, geo('serit', () => new THREE.TorusGeometry(1.256, 0.09, 8, 48)), c[1], 0, 1.75, 0, 0, i * Math.PI / 3, 0); t.scale.set(1, 1.12, 1); } ekle(bl, geo('dugum', () => new THREE.ConeGeometry(0.2, 0.3, 12)), c[0], 0, 0.32, 0);
      for (const x of [-0.4, 0.4]) ekle(grp, geo('ip', () => new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6)), ip, x * 0.6, -0.1, 0, 0, 0, -x * 0.7);
      const f = SEK.TUR.ksFici && SEK.TUR.ksFici.yap && SEK.TUR.ksFici.yap(); E.fici = f && f.geo ? ekle(grp, f.geo, f.mat, 0, -1.25, 0) : ekle(grp, geo('yf', () => new THREE.CylinderGeometry(0.7, 0.7, 1.5, 24)), ip, 0, -1.25, 0);
      E.top = new CANNON.Sphere(1.2); body.addShape(E.top, new CANNON.Vec3(0, 1.75, 0)); kutu(body, 0.85, 0.85, 0.4, 0, -1.25); E.a = Math.max(1.4, o.R * 0.6); E.w = (0.75 + 0.35 * o.d) * o.hiz;
    },
    yengec(E, grp, body, o) {
      const r = mat('#ff5a3c', 'top'), a = mat('#ffd2b0', 'top'), z = mat('#1b2040', 'top'), b = mat('#fff6e8', 'top');
      const gv = ekle(grp, kure(0.9), r, 0, 0, 0); gv.scale.set(1.35, 0.72, 0.9); for (const s of [1, -1]) { ekle(grp, kure(0.2), b, s * 0.38, 0.72, 0.35); ekle(grp, kure(0.1), z, s * 0.38, 0.74, 0.52); ekle(grp, geo('sap', () => new THREE.CylinderGeometry(0.07, 0.07, 0.5, 8)), r, s * 0.38, 0.5, 0.3);
        for (let i = 0; i < 3; i++) { const l = ekle(grp, geo('bacak', () => new THREE.CylinderGeometry(0.08, 0.06, 0.9, 8)), r, s * (1.05 + i * 0.12), -0.45, 0.25 - i * 0.28, 0, 0, s * 0.8); l.userData.b = i; }
        const k = new THREE.Group(); k.position.set(s * 1.25, 0.35, 0.2); grp.add(k); ekle(k, geo('kol', () => new THREE.CylinderGeometry(0.12, 0.12, 0.8, 8)), r, 0, 0.4, 0, 0, 0, -s * 0.4); const kk = ekle(k, kure(0.42), r, s * 0.32, 0.95, 0); kk.scale.set(0.8, 1.15, 0.6); ekle(k, kure(0.1), a, s * 0.32, 1.42, 0.18); (E.kol = E.kol || []).push([k, s]); }
      ekle(grp, geo('agiz', () => new THREE.TorusGeometry(0.22, 0.06, 8, 16, Math.PI)), z, 0, 0.1, 0.78, 0, 0, Math.PI);
      grp.scale.setScalar(1.6); kutu(body, 2.4, 1.5, 0.6, 0, 0.45); E.ax = Math.max(1.5, o.R * 0.7); E.w = (0.8 + 0.4 * o.d) * o.hiz; E.y0 = 1.2;
    },
    donerkapi(E, grp, body, o) {
      const h = E.h = Math.max(3.4, Math.min(5.2, o.TOPY * 0.7)), w = Math.max(1.9, Math.min(2.6, o.R * 0.38)), ah = mat('#fb9a2e', 'tahta'), ko = mat('#b9692a', 'tahta'), al = mat('#ffc41c', 'kutu'), tb = mat('#0f9fb4', 'kutu');
      E.don = new THREE.Group(); grp.add(E.don); ekle(E.don, geo('mil', () => new THREE.CylinderGeometry(0.16, 0.16, h + 0.6, 14)), al, 0, 0, 0);
      for (let i = 0; i < 4; i++) { const k = new THREE.Group(); k.rotation.y = i * Math.PI / 2; E.don.add(k); ekle(k, new THREE.BoxGeometry(w, h, 0.16), i % 2 ? ah : tb, w / 2 + 0.12, 0, 0); ekle(k, new THREE.BoxGeometry(0.14, h + 0.1, 0.22), ko, w + 0.1, 0, 0); for (const y of [-h / 3, h / 3]) ekle(k, new THREE.BoxGeometry(w, 0.12, 0.2), ko, w / 2 + 0.12, y, 0); }
      ekle(grp, new THREE.BoxGeometry(0.5, 0.25, 0.5), al, 0, h / 2 + 0.4, 0);
      const q = new CANNON.Quaternion(); for (const a of [0, Math.PI / 2]) { q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), a); body.addShape(new CANNON.Box(new CANNON.Vec3(w + 0.15, h / 2, 0.1)), new CANNON.Vec3(0, 0, 0), q.clone()); }
      E.w = (0.9 + 0.5 * o.d) * o.hiz; E.y0 = Math.max(h / 2 + 0.3, o.yc);
    },
    martilar(E, grp, body, o) {
      const b = mat('#fff6e8', 'top'), g = mat('#97a0b6', 'top'), t = mat('#ff9a1c', 'top'), z = mat('#1b2040', 'top'); E.m = [];
      for (let i = 0; i < 3; i++) { const m = new THREE.Group(); m.scale.setScalar(1.8); grp.add(m); const gv = ekle(m, kure(0.45), b, 0, 0, 0); gv.scale.set(1.5, 0.8, 0.8); ekle(m, kure(0.3), b, 0.62, 0.22, 0); ekle(m, kure(0.06), z, 0.78, 0.3, 0.2); ekle(m, geo('mgaga', () => new THREE.ConeGeometry(0.09, 0.36, 8)), t, 0.98, 0.18, 0, 0, 0, -1.6);
        const kn = []; for (const s of [1, -1]) { const k = new THREE.Group(); k.position.set(0, 0.15, s * 0.2); m.add(k); const a = ekle(k, kure(0.5), g, -0.1, 0, s * 0.55); a.scale.set(0.55, 0.08, 1.2); kn.push([k, s]); }
        const bb = i === 0 ? body : govde(E, body); kutu(bb, 1.5, 0.75, 0.4, 0, 0); E.m.push({ g: m, b: bb, kn, y: o.yc - 1.6 + i * Math.max(1.4, o.TOPY * 0.2), f: i * 2.1, s: i % 2 ? -1 : 1 }); }
      E.ax = Math.max(2.4, o.R * 0.9); E.w = (0.7 + 0.35 * o.d) * o.hiz;
    },
    fici3(E, grp, body, o) {
      E.f = []; const f = SEK.TUR.ksFiciK && SEK.TUR.ksFiciK.yap && SEK.TUR.ksFiciK.yap(), dx = Math.max(1.9, o.R * 0.55), yay = mat('#8ea0d8', 'kutu'), tb = mat('#0f9fb4', 'kutu');
      [-1, 0, 1].forEach((k, i) => { const g = new THREE.Group(); grp.add(g); f && f.geo ? ekle(g, f.geo, f.mat, 0, 0, 0).scale.setScalar(1.1) : ekle(g, geo('yf', () => new THREE.CylinderGeometry(0.7, 0.7, 1.5, 24)), tb, 0, 0, 0);
        const b = i === 0 ? body : govde(E, body); kutu(b, 0.82, 0.85, 0.4, 0, 0); E.f.push({ g, b, x: k * dx, fz: i * 2.1 }); });
      E.alt = Math.max(0.9, o.yc - 1.6); E.a = Math.max(2.2, Math.min(4.6, o.TOPY * 0.6)); E.w = (1.5 + 0.5 * o.d) * o.hiz;
    } };
  function konum(b, x, y, z, th, vx, vy, wz) { b.position.set(x, y, z); b.quaternion.setFromAxisAngle(QZ, th || 0); b.velocity.set(vx || 0, vy || 0, 0); b.angularVelocity.set(0, 0, wz || 0); b.aabbNeedsUpdate = true; }
  const QZ = new CANNON.Vec3(0, 0, 1), QY = new CANNON.Vec3(0, 1, 0);
  const H = {
    cark(E, t) { const th = -E.w * t * E.ters; konum(E.body, E.x0, E.y0, E.z0, th, 0, 0, -E.w * E.ters); E.grp.position.set(E.x0, E.y0, E.z0); E.grp.rotation.set(0, 0, th); },
    ahtapot(E, t) { E.grp.position.set(E.x0, 0, E.z0); [[E.body, E.g1, -1, 0], [E.ekB[0], E.g2, 1, 2.4]].forEach(([b, g, s, f]) => { const in_ = Math.max(0, Math.sin(E.w * t + f)) ** 0.8, y = E.alt - E.H * 0.82 * (1 - in_), th = 0.22 * Math.sin(E.w * 1.7 * t + f) * s, x = s * E.x1; g.position.set(x, y, 0); g.rotation.z = th; konum(b, E.x0 + x, y, E.z0, th); }); },
    papagan(E, t) { const a = E.w * t, x = E.ax * Math.sin(a), y = E.y0 + E.ay * Math.sin(2 * a), vx = E.ax * E.w * Math.cos(a), vy = 2 * E.ay * E.w * Math.cos(2 * a); konum(E.body, E.x0 + x, y, E.z0, 0, vx, vy); E.grp.position.set(E.x0 + x, y, E.z0); const k = E.kus; k.rotation.y = vx >= 0 ? -0.25 : Math.PI + 0.25; k.rotation.z = Math.max(-0.35, Math.min(0.35, vy * 0.09)) * (vx >= 0 ? 1 : -1) * (vx >= 0 ? 1 : 1); for (const w of k.userData.kan) w.rotation.x = -w.userData.z * (0.35 + 0.75 * Math.sin(t * 13)); },
    gulle(E, t) { const th = E.w * t * E.ters; konum(E.body, E.x0, E.y0, E.z0, th, 0, 0, E.w * E.ters); E.grp.position.set(E.x0, E.y0, E.z0); E.grp.rotation.set(0, 0, th); },
    balon(E, t) { if (E.bitti != null) { const k = t - E.bitti; E.grp.position.y = E.yb - 12 * k * k; E.grp.rotation.z = k * 1.5; if (k > 1.2) E.grp.visible = false; return; } const x = E.x0 + E.a * Math.sin(E.w * t), y = E.y0 + 0.35 * Math.sin(t * 1.9), th = 0.1 * Math.sin(E.w * t + 1.2); konum(E.body, x, y, E.z0, th, E.a * E.w * Math.cos(E.w * t)); E.grp.position.set(x, y, E.z0); E.grp.rotation.set(0, 0, th); E.yb = y; },
    yengec(E, t) { const x = E.x0 + E.ax * Math.sin(E.w * t), vx = E.ax * E.w * Math.cos(E.w * t), y = E.y0 + Math.abs(Math.sin(t * 6)) * 0.08; konum(E.body, x, y, E.z0, 0, vx); E.grp.position.set(x, y, E.z0); E.grp.rotation.z = Math.sin(t * 6) * 0.04;
      for (const [k, s] of E.kol) k.rotation.z = s * (0.25 + 0.35 * Math.sin(t * 3.1 + s)); E.grp.children.forEach((c) => { if (c.userData.b != null) c.rotation.x = Math.sin(t * 12 + c.userData.b * 2) * 0.35; }); },
    donerkapi(E, t) { const a = E.w * t * E.ters; E.don.rotation.y = a; E.grp.position.set(E.x0, E.y0, E.z0); E.body.position.set(E.x0, E.y0, E.z0); E.body.quaternion.setFromAxisAngle(QY, a); E.body.angularVelocity.set(0, E.w * E.ters, 0); E.body.velocity.set(0, 0, 0); E.body.aabbNeedsUpdate = true; },
    martilar(E, t) { E.grp.position.set(0, 0, E.z0); for (const q of E.m) { const k = Math.sin(E.w * t + q.f) * q.s, x = E.x0 + E.ax * k, vx = E.ax * E.w * Math.cos(E.w * t + q.f) * q.s, y = q.y + 0.25 * Math.sin(t * 2.3 + q.f);
      q.g.position.set(x, y, 0); q.g.rotation.y = vx >= 0 ? 0 : Math.PI; for (const [w, s] of q.kn) w.rotation.x = -s * (0.2 + 0.7 * Math.sin(t * 10 + q.f)); konum(q.b, x, y, E.z0, 0, vx); } },
    fici3(E, t) { E.grp.position.set(E.x0, 0, E.z0); for (const q of E.f) { const s = Math.abs(Math.sin(E.w * t * 0.5 + q.fz)), y = E.alt + E.a * s, ez = 1 - 0.16 * Math.max(0, 1 - s * 5); q.g.position.set(q.x, y, 0); q.g.scale.set(1 / Math.sqrt(ez), ez, 1 / Math.sqrt(ez)); q.g.rotation.z = Math.sin(E.w * t * 0.5 + q.fz) * 0.15; konum(q.b, E.x0 + q.x, y, E.z0, 0, 0, E.a * E.w * 0.5 * Math.cos(E.w * t * 0.5 + q.fz)); } } };
  return { var: (t) => ENG4 && !!K[t], kur(E, grp, body, o) { E.k4 = 1; K[E.t](E, grp, body, o); }, kare(E, t) { E.sonT = t; H[E.t](E, t); },
    // balon: top balona degerse patlar, engel kalkar (fici duser)
    carp(E, y) { if (E.t !== 'balon' || E.bitti != null || y < E.body.position.y + 0.5) return false; E.bitti = E.sonT || 0; E.bl.visible = false; E.body.collisionFilterMask = 0; E.body.collisionFilterGroup = 0; patla(E.body.position.x, E.body.position.y + 1.75, E.body.position.z); return true; } };
}
