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
  const PA = parcacikKur(scene, PUF, { normal: 40, parlak: 1, ton: false }), AL = [];   // namlu alevi: derinlik sinamali, namlunun arkasinda kalan kismi gizlenir
  function puf(o) { const s = PP.al(o.c[0], !!o.add, o.op == null ? 1 : o.op); if (!s) return; s.position.copy(o.p); s.scale.setScalar(0.001); s.material.rotation = Math.random() * 6.28; PL.push(Object.assign({ s, t: 0, dr: 4, gy: 0, w: (Math.random() - 0.5) * 4, C: o.c.map((k) => new THREE.Color(k)) }, o)); }
  // ---- boya damlalari ----
  const MAX = 700, geo = new THREE.IcosahedronGeometry(1, 1); geo.computeVertexNormals();
  const IM = new THREE.InstancedMesh(geo, sekerDuz(THREE, '#ffffff', 'top'), MAX); IM.frustumCulled = false; IM.count = 0; IM.castShadow = false; IM.receiveShadow = false;
  IM.instanceMatrix.setUsage(THREE.DynamicDrawUsage); IM.setColorAt(0, new THREE.Color('#fff')); IM.instanceColor.setUsage(THREE.DynamicDrawUsage); IM.visible = false; scene.add(IM);
  const D = [], M = new THREE.Matrix4(), Q = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0), V = new THREE.Vector3(), SC = new THREE.Vector3();
  function damla(p, v, r, life, c, o) { if (D.length >= MAX) D.shift(); D.push(Object.assign({ p: p.clone(), v, r, t: 0, life, c, dr: 5, gy: 15 }, o)); }
  const yon = () => { const a = Math.random() * 6.283, z = Math.random() * 2 - 1, q = Math.sqrt(1 - z * z); return new THREE.Vector3(Math.cos(a) * q, z, Math.sin(a) * q); };
  function boya(p, dir, renk, guc = 1, h = 1) {
    const c0 = new THREE.Color(renk), acik = c0.clone().lerp(new THREE.Color('#ffffff'), 0.28), koyu = c0.clone().multiplyScalar(0.72);
    // v11.12 (Adem: 'duman gibi, sivi sekilde yayilsin'): puf yok; yalniz dolu, parlak sivi damlalari. Govdeden tasar, yay cizip duser, yere degince yassilir.
    const n = Math.round((D.length > 380 ? 60 : 130) * Math.min(2, guc));
    for (let i = 0; i < n; i++) {
      const u = yon(), iri = i % 4 === 0, v = u.clone().multiplyScalar(iri ? 2 + Math.random() * 6 : 3 + Math.random() * 10); v.y = v.y * 0.8 + 2.6; v.z = Math.abs(v.z) * 0.5; v.addScaledVector(dir, 0.5 + Math.random());
      const q = p.clone().addScaledVector(u, S * 0.3 * Math.random()); q.y += (Math.random() - 0.5) * S * Math.max(0.3, h - 0.35);
      damla(q, v, S * (iri ? 0.115 + Math.random() * 0.085 : 0.04 + Math.random() * 0.06), 0.55 + Math.random() * 0.4, i % 7 === 0 ? acik : i % 5 === 0 ? koyu : c0, { dr: 2.4, gy: 17 });
    }
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
  // v11.13 (Adem: 'efekt namlu ucunda degil namlu ustunde cikiyor'): alev namlu agzina bagli, geri tepmede onunla gider. ucu(konum, yon): o anki agiz ve namlu ekseni
  const AP = new THREE.Vector3(), AY = new THREE.Vector3();
  function alev(ucu) {
    for (const [rn, g, u] of [[['#ffb02e', '#ff8a1c', '#ff6a10'], 0.8, 1], [['#fff3a0', '#ffd02e', '#ffb02e'], 0.48, 0.78]])
      for (let i = 0; i < 8; i++) { const k = i / 7, s = PA.al(rn[0], false, 1); if (!s) return; s.scale.setScalar(0.001); s.material.rotation = Math.random() * 6.28;
        AL.push({ s, t: 0, k, d: k * 1.35 * u, v: 0.8 + 0.6 * k, x: (Math.random() - 0.5) * 0.16 * g, life: 0.12 + (1 - k) * 0.05, s0: g * (1.35 - k * 0.85), C: rn.map((c) => new THREE.Color(c)), ucu }); }
  }
  function alevKare(dt) {
    if (AL.length) AL[0].ucu(AP, AY);
    for (let i = AL.length - 1; i >= 0; i--) {
      const q = AL[i]; q.t += dt; const k = q.t / q.life; if (k >= 1) { PA.birak(q.s); AL.splice(i, 1); continue; }
      q.s.position.copy(AP).addScaledVector(AY, q.d * Math.min(1, 0.45 + k * 1.6) + q.v * q.t); q.s.position.x += q.x;
      q.s.scale.setScalar(q.s0 * (1 - 0.55 * k)); const f = Math.min(1.999, k * 2), a = Math.floor(f); q.s.material.color.copy(q.C[a]).lerp(q.C[a + 1], f - a); q.s.material.opacity = k < 0.5 ? 0.95 : 0.95 * (1 - (k - 0.5) * 2);
    }
    PA.kare();
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
    PP.kare(); alevKare(dt);
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
  function temizle() { for (const q of PL) PP.birak(q.s); for (const q of AL) PA.birak(q.s); AL.length = PL.length = 0; PA.kare(); D.length = 0; IM.count = 0; IM.visible = false; PP.kare(); }
  return { boya, ates, alev, kare, temizle, get n() { return PL.length + AL.length + D.length; } };
}
