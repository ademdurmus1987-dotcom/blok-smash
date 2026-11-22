// Foxi Smash v11.11 (23 Kas 2026, Adem: 'evet, efektler'; olcu: referans videolardaki guc ve yogunluk): guclu vurus efektleri. Yalniz ?efk=1.
//   boya(p, dir, renk, guc) : kavanoz kirilinca yogun, parlak boya damlalari (hizla 2-3 kup genisler, 0.6 sn'de biter)
//   ates(p, R)              : TNT ates topu: beyaz cakma, sari-turuncu-kirmizi pufler, koyu duman, kor parcalari
//   alev(p, dir)            : namlu agzinda sari-turuncu alev
// Hepsi iki cizim cagrisi: damlalar tek InstancedMesh, pufler tek ornekli dortgen katmani (parcacik.js). Havuz sinirli, telefonu yormaz.
import { parcacikKur } from './parcacik.js?v=2';
import { sekerDuz } from '../seker.js?v=6';
export function patlamaKur({ THREE, scene, S, floorAt, canvasTex }) {
  // ---- puf dokusu: cizgi film bulutu (parlak ic, net kenar) ----
  const PUF = canvasTex(128, 128, (x, w, h) => {
    // tek yuvarlak yerine loblu bulut: alev ve boya 'top' gibi gorunmesin
    for (const [cx, cy, rr] of [[0.5, 0.5, 0.3], [0.3, 0.42, 0.2], [0.68, 0.38, 0.21], [0.72, 0.64, 0.19], [0.4, 0.72, 0.21], [0.24, 0.62, 0.15], [0.5, 0.26, 0.17]]) {
      const g = x.createRadialGradient(w * cx, h * cy, 0, w * cx, h * cy, w * rr);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.72, 'rgba(255,255,255,.96)'); g.addColorStop(0.88, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
    }
    x.globalCompositeOperation = 'source-atop';   // alt yanda hafif koyuluk: hacim
    const q = x.createRadialGradient(w * 0.44, h * 0.4, w * 0.2, w * 0.5, h * 0.5, w * 0.5); q.addColorStop(0, 'rgba(0,0,0,0)'); q.addColorStop(1, 'rgba(0,0,0,.2)'); x.fillStyle = q; x.fillRect(0, 0, w, h);
  });
  const PP = parcacikKur(scene, PUF, { normal: 300, parlak: 60, ton: false, derin: false }), PL = [];
  function puf(o) { const s = PP.al(o.c[0], !!o.add, o.op == null ? 1 : o.op); if (!s) return; s.position.copy(o.p); s.scale.setScalar(0.001); s.material.rotation = Math.random() * 6.28; PL.push(Object.assign({ s, t: 0, dr: 4, gy: 0, w: (Math.random() - 0.5) * 4, C: o.c.map((k) => new THREE.Color(k)) }, o)); }
  // ---- boya damlalari ----
  const MAX = 420, geo = new THREE.IcosahedronGeometry(1, 1); geo.computeVertexNormals();
  const IM = new THREE.InstancedMesh(geo, sekerDuz(THREE, '#ffffff', 'top'), MAX); IM.frustumCulled = false; IM.count = 0; IM.castShadow = false; IM.receiveShadow = false;
  IM.instanceMatrix.setUsage(THREE.DynamicDrawUsage); IM.setColorAt(0, new THREE.Color('#fff')); IM.instanceColor.setUsage(THREE.DynamicDrawUsage); IM.visible = false; scene.add(IM);
  const D = [], M = new THREE.Matrix4(), Q = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0), V = new THREE.Vector3(), SC = new THREE.Vector3();
  function damla(p, v, r, life, c, o) { if (D.length >= MAX) D.shift(); D.push(Object.assign({ p: p.clone(), v, r, t: 0, life, c, dr: 5, gy: 15 }, o)); }
  const yon = () => { const a = Math.random() * 6.283, z = Math.random() * 2 - 1, q = Math.sqrt(1 - z * z); return new THREE.Vector3(Math.cos(a) * q, z, Math.sin(a) * q); };
  function boya(p, dir, renk, guc = 1, h = 1) {
    const c0 = new THREE.Color(renk), acik = c0.clone().lerp(new THREE.Color('#ffffff'), 0.28), koyu = c0.clone().multiplyScalar(0.72);
    const n = Math.round((D.length > 240 ? 44 : 92) * guc);
    for (let i = 0; i < n; i++) {
      const u = yon(), v = u.clone().multiplyScalar(5 + Math.random() * 15); v.y = v.y * 0.85 + 2.2; v.z *= 0.7; v.addScaledVector(dir, 1.2 + Math.random() * 2);
      const q = p.clone().addScaledVector(u, S * 0.22 * Math.random()); q.y += (Math.random() - 0.5) * S * (h - 0.35);
      const iri = Math.random() < 0.22;
      damla(q, v, S * (iri ? 0.12 + Math.random() * 0.1 : 0.045 + Math.random() * 0.07), 0.42 + Math.random() * 0.32, i % 5 === 0 ? acik : i % 4 === 0 ? koyu : c0);
    }
    // ilk anda govdeyi dolduran renkli bulut (3 kare): patlama dolu gorunsun
    for (let i = 0; i < 16 * Math.min(1.8, guc); i++) { const u = yon(); puf({ p: p.clone().addScaledVector(u, S * 0.2).add(V.set(0, (Math.random() - 0.5) * S * (h - 0.4), 0)), v: u.multiplyScalar(6 + Math.random() * 13), life: 0.32 + Math.random() * 0.18, s0: S * 0.5, s1: S * (0.7 + Math.random() * 0.6), c: [acik.getStyle(), c0.getStyle(), c0.getStyle()], op: 0.95, dr: 6.5 }); }
    puf({ p: p.clone(), v: new THREE.Vector3(), life: 0.09, s0: S * 0.5, s1: S * 1.2, c: ['#ffffff', acik.getStyle()], op: 0.4, add: 1 });
  }
  function ates(p, R) {
    puf({ p: p.clone(), v: new THREE.Vector3(), life: 0.14, s0: R * 0.7, s1: R * 1.9, c: ['#ffffff', '#fff2b0'], op: 1, add: 1 });
    for (let i = 0; i < 34; i++) { const u = yon(); u.y = u.y * 0.85 + 0.2; const k = Math.random();   // govde: disarisi kizil, ici sari kalsin diye once buyuk kizil pufler
      const ic = i >= 18;
      puf({ p: p.clone().addScaledVector(u, R * (ic ? 0.1 : 0.25)), v: u.clone().multiplyScalar(R * (ic ? 1.4 + 1.8 * k : 3 + 2.6 * k)), life: 0.4 + Math.random() * 0.28, s0: R * 0.4, s1: R * (ic ? 0.6 : 0.5) * (0.85 + Math.random() * 0.5), c: ic ? ['#fffde0', '#ffe04a', '#ffa41f', '#ff5a10', '#7a2a14'] : ['#ffe04a', '#ff9a1e', '#f4500c', '#a82a10', '#4a241a'], dr: 5.5, gy: 2.5 }); }
    for (let i = 0; i < 14; i++) { const u = yon(); u.y = Math.abs(u.y) + 0.35; puf({ p: p.clone().addScaledVector(u, R * 0.4), v: u.clone().multiplyScalar(R * 1.1), life: 0.8 + Math.random() * 0.5, s0: R * 0.3, s1: R * (0.6 + Math.random() * 0.4), c: ['#6a4a38', '#6e5a50', '#8a7c74'], op: 0.6, dr: 2.5, gy: 3, gec: 0.18 + Math.random() * 0.12 }); }
    const KC = ['#ffd23a', '#ff8a1c', '#ff5a1c'].map((k) => new THREE.Color(k));
    for (let i = 0; i < 46; i++) { const u = yon(); u.y = Math.abs(u.y) * 0.9 + 0.2; damla(p.clone(), u.multiplyScalar(8 + Math.random() * 16), S * (0.03 + Math.random() * 0.06), 0.5 + Math.random() * 0.5, KC[i % 3], { dr: 2.2, gy: 20 }); }
  }
  function alev(p, dir) {
    const yn = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
    for (const [rn, g, u] of [[['#ff9a1e', '#f4600e', '#c83a0a'], 1, 1], [['#fff3a0', '#ffd02e', '#ff9418'], 0.62, 0.72]])   // dis turuncu koni, ic sari koni
      for (let i = 0; i < 11; i++) { const k = i / 10; puf({ p: p.clone().addScaledVector(dir, -0.75 + k * 1.8 * u).addScaledVector(yn, (Math.random() - 0.5) * 0.5 * g).add(V.set(0, (Math.random() - 0.5) * 0.3 * g, 0)), v: dir.clone().multiplyScalar(5 + Math.random() * 4), life: 0.15 + (1 - k) * 0.1 + Math.random() * 0.05, s0: g * (1.7 - k * 1), s1: g * (1.1 - k * 0.8), c: rn, dr: 3 }); }
    puf({ p: p.clone().addScaledVector(dir, -0.4), v: new THREE.Vector3(), life: 0.09, s0: 1, s1: 2.3, c: ['#fff6c8', '#ffe08a'], op: 0.9, add: 1 });
    for (let i = 0; i < 5; i++) puf({ p: p.clone().addScaledVector(dir, -0.5 + Math.random() * 0.6), v: dir.clone().multiplyScalar(1.2).add(V.set((Math.random() - 0.5) * 1.6, 0.9 + Math.random(), 0)), life: 0.4 + Math.random() * 0.2, s0: 0.4, s1: 1.15, c: ['#fff8f0', '#e8e0d8'], op: 0.34, dr: 3, gec: 0.07 });
  }
  const C = new THREE.Color();
  function kare(dt) {
    for (let i = PL.length - 1; i >= 0; i--) {
      const q = PL[i]; if (q.gec > 0) { q.gec -= dt; continue; } q.t += dt; const k = q.t / q.life;
      if (k >= 1) { PP.birak(q.s); PL.splice(i, 1); continue; }
      q.v.multiplyScalar(Math.max(0, 1 - q.dr * dt)); q.v.y += q.gy * dt; q.s.position.addScaledVector(q.v, dt); q.s.material.rotation += q.w * dt;
      q.s.scale.setScalar(q.s0 + (q.s1 - q.s0) * (1 - (1 - k) * (1 - k))); const n = q.C.length - 1, f = Math.min(n - 0.001, k * n), a = Math.floor(f);
      C.copy(q.C[a]).lerp(q.C[a + 1], f - a); q.s.material.color.copy(C); q.s.material.opacity = (q.op == null ? 1 : q.op) * (k < 0.55 ? 1 : 1 - (k - 0.55) / 0.45);
    }
    PP.kare();
    let n = 0;
    for (let i = D.length - 1; i >= 0; i--) {
      const q = D[i]; q.t += dt; if (q.t >= q.life) { D.splice(i, 1); continue; }
      q.v.multiplyScalar(Math.max(0, 1 - q.dr * dt)); q.v.y -= q.gy * dt; q.p.addScaledVector(q.v, dt);
      const f = floorAt(q.p.x, q.p.z); if (q.p.y < f + q.r && q.p.y > f - 0.8 && q.v.y < 0) { q.p.y = f + q.r * 0.4; q.v.set(q.v.x * 0.3, 0, q.v.z * 0.3); q.yas = 1; q.gy = 0; }
      const k = q.t / q.life, r = q.r * (k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1), sp = q.v.length(), e = q.yas ? 0.45 : Math.min(2.4, 1 + sp * 0.07);
      if (sp > 0.2 && !q.yas) Q.setFromUnitVectors(UP, V.copy(q.v).divideScalar(sp)); else Q.identity();
      SC.set(r / Math.sqrt(e), r * e, r / Math.sqrt(e)); M.compose(q.p, Q, SC); IM.setMatrixAt(n, M); IM.setColorAt(n, q.c); n++;
    }
    IM.count = n; IM.visible = n > 0; if (n) { IM.instanceMatrix.needsUpdate = true; IM.instanceColor.needsUpdate = true; }
  }
  function temizle() { for (const q of PL) PP.birak(q.s); PL.length = 0; D.length = 0; IM.count = 0; IM.visible = false; PP.kare(); }
  return { boya, ates, alev, kare, temizle, get n() { return PL.length + D.length; } };
}
