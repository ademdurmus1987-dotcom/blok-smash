// Foxi Smash v4.4 - Faz 1D: turkuaz-bakir kaide platform ve yeni top arabasi (Adem 13 Kas)
// Kaide: kose pahli (sekizgen) turkuaz boyali tahta tabla, altinda percinli bakir kusak; ayak turkuaz sutun, bakir halkalar.
// Top: parlak lacivert-mavi namlu, altin halkalar ve yildizlar, altin parmakli tekerlekler, arkasinda kirmizi baslik ve fitil.
// Ikisi de kodla kurulur (dosya indirmez); oyun.js eski Tripo modelleri yerine bunlari kullanir (?kaide=0 eski platform, ?top=eski eski top).
export function kaideKur({ THREE, canvasTex, ENV }) {
  const Pi = Math.PI;
  const std = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.45, metalness: 0, envMap: ENV, envMapIntensity: 0.6 }, o));
  const tekrar = (t, a = 4) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = a; return t; };
  const TUR = '#0b9a92', TURK = '#06605c', BAKIR = '#e8862a';
  // ust yuz: genis turkuaz tahtalar (dunya biriminde tekrar: 1 birim = dokunun 1/2'si)
  const ustT = tekrar(canvasTex(256, 256, (x, w, h) => {
    const n = 4, ph = h / n;
    for (let i = 0; i < n; i++) {
      const g = x.createLinearGradient(0, i * ph, 0, (i + 1) * ph); g.addColorStop(0, '#1cb8ae'); g.addColorStop(0.5, TUR); g.addColorStop(1, '#077a74'); x.fillStyle = g; x.fillRect(0, i * ph, w, ph);
      x.globalAlpha = 0.16; x.strokeStyle = '#06504c'; x.lineWidth = 1.5; for (let k = 0; k < 5; k++) { const y = i * ph + 6 + k * (ph - 12) / 4; x.beginPath(); x.moveTo(0, y); for (let px = 0; px <= w; px += 16) x.lineTo(px, y + Math.sin(px * 0.05 + i * 2 + k) * 1.5); x.stroke(); } x.globalAlpha = 1;
      x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(0, i * ph + 1, w, 2); x.fillStyle = 'rgba(0,40,40,.45)'; x.fillRect(0, (i + 1) * ph - 3, w, 3);
    }
  }));
  // yan yuz: turkuaz, ustte acik kenar, ortada ince altin serit
  const yanT = tekrar(canvasTex(128, 128, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3cd2c6'); g.addColorStop(0.12, '#0fa89f'); g.addColorStop(1, TURK); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#ffd36a'; x.fillRect(0, h * 0.55, w, h * 0.08); x.fillStyle = 'rgba(120,60,0,.5)'; x.fillRect(0, h * 0.63, w, 2);
  }));
  // bakir kusak: percinli metal bant
  const kusT = tekrar(canvasTex(128, 64, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffd08a'); g.addColorStop(0.35, BAKIR); g.addColorStop(1, '#a8541a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (const cx of [w * 0.25, w * 0.75]) { const r = h * 0.17, gg = x.createRadialGradient(cx - r * 0.3, h / 2 - r * 0.3, 1, cx, h / 2, r); gg.addColorStop(0, '#fff2d0'); gg.addColorStop(0.5, '#d88a3a'); gg.addColorStop(1, '#6a3010'); x.fillStyle = 'rgba(60,20,0,.4)'; x.beginPath(); x.arc(cx + 2, h / 2 + 2, r, 0, 6.283); x.fill(); x.fillStyle = gg; x.beginPath(); x.arc(cx, h / 2, r, 0, 6.283); x.fill(); }
  }));
  const MAT = {
    ust: std({ map: ustT, roughness: 0.5, envMapIntensity: 0.35 }),
    yan: std({ map: yanT, roughness: 0.4, envMapIntensity: 0.35 }),
    kus: std({ map: kusT, metalness: 0.7, roughness: 0.3, envMapIntensity: 1.2, emissive: '#5a2a00', emissiveIntensity: 0.15 }),
    alt: std({ color: '#0a5552', roughness: 0.7 })
  };
  const sekizgen = (rx, rz, c) => { const s = new THREE.Shape(); s.moveTo(-rx + c, -rz); s.lineTo(rx - c, -rz); s.lineTo(rx, -rz + c); s.lineTo(rx, rz - c); s.lineTo(rx - c, rz); s.lineTo(-rx + c, rz); s.lineTo(-rx, rz - c); s.lineTo(-rx, -rz + c); s.closePath(); return s; };
  // ExtrudeGeometry'yi yatir (derinlik -> y), uv'leri dunya biriminde olcekle, gruplari [kapak, yan] -> [mA, mB]
  function plaka(rx, rz, c, y0, kal, bev, us) {
    const g = new THREE.ExtrudeGeometry(sekizgen(rx - bev, rz - bev, c), { depth: kal - 2 * bev, bevelEnabled: bev > 0, bevelThickness: bev, bevelSize: bev, bevelSegments: 2, curveSegments: 1 });
    g.rotateX(-Pi / 2); g.translate(0, y0 + bev, 0);
    const uv = g.attributes.uv, [cap, yan] = g.groups;
    for (let i = cap.start; i < cap.start + cap.count; i++) uv.setXY(i, uv.getX(i) * us, uv.getY(i) * us);
    if (yan) { let v0 = 1e9, v1 = -1e9; for (let i = yan.start; i < yan.start + yan.count; i++) { v0 = Math.min(v0, uv.getY(i)); v1 = Math.max(v1, uv.getY(i)); }
      for (let i = yan.start; i < yan.start + yan.count; i++) uv.setXY(i, uv.getX(i) * us, (uv.getY(i) - v0) / Math.max(1e-4, v1 - v0)); }
    return g;
  }
  function topla(L) {   // [geo, malzemeNo] -> gruplu tek geometri (Extrude'un kendi gruplari korunur)
    const parts = []; for (const [g, mm] of L) { const gi = g.index ? g.toNonIndexed() : g; const gs = g.groups.length ? g.groups : [{ start: 0, count: gi.attributes.position.count, materialIndex: 0 }]; for (const gr of gs) parts.push([gi, gr.start, gr.count, Array.isArray(mm) ? mm[gr.materialIndex] : mm]); }
    parts.sort((a, b) => a[3] - b[3]);
    let n = 0; for (const p of parts) n += p[2];
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2), out = new THREE.BufferGeometry(); let o = 0, gs = 0, cur = -1;
    for (const [g, st, cnt, m] of parts) {
      P.set(g.attributes.position.array.subarray(st * 3, (st + cnt) * 3), o * 3); N.set(g.attributes.normal.array.subarray(st * 3, (st + cnt) * 3), o * 3); U.set(g.attributes.uv.array.subarray(st * 2, (st + cnt) * 2), o * 2);
      if (m !== cur) { if (cur >= 0) out.addGroup(gs, o - gs, cur); cur = m; gs = o; } o += cnt;
    }
    out.addGroup(gs, o - gs, cur);
    out.setAttribute('position', new THREE.BufferAttribute(P, 3)); out.setAttribute('normal', new THREE.BufferAttribute(N, 3)); out.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    out.computeBoundingBox(); out.computeBoundingSphere(); return out;
  }
  // tabla: ust yuz y=0, kalinlik 0.75 (fizik kutusuyla ayni)
  function tabla(rx, rz) {
    const c = Math.min(rx, rz) * 0.24;
    const ust = plaka(rx, rz, c, -0.44, 0.44, 0.07, 0.5);       // turkuaz tahta tabla
    const kus = plaka(rx + 0.12, rz + 0.12, c + 0.05, -0.74, 0.32, 0.04, 1);   // bakir kusak (disari tasar)
    const alt = plaka(rx - 0.15, rz - 0.15, c, -0.75, 0.08, 0, 1);
    const geo = topla([[ust, [0, 1]], [kus, [2, 2]], [alt, [3, 3]]]);
    return { geo, mat: [MAT.ust, MAT.yan, MAT.kus, MAT.alt] };
  }
  // ayak (oyun.js LEG): direk turkuaz ve parlak, bakir yaka/halka, koyu turkuaz taban
  const direkT = canvasTex(128, 256, (x, w, h) => {
    let g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#05504c'); g.addColorStop(0.3, '#1cb8ae'); g.addColorStop(0.55, TUR); g.addColorStop(1, '#04403c'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (const y of [0.2, 0.5, 0.8]) { g = x.createLinearGradient(0, h * y - 10, 0, h * y + 10); g.addColorStop(0, '#ffd08a'); g.addColorStop(0.5, BAKIR); g.addColorStop(1, '#8a4410'); x.fillStyle = g; x.fillRect(0, h * y - 9, w, 18); }
  });
  const AYAK = { direk: std({ map: direkT, roughness: 0.35, envMapIntensity: 0.5 }), bakir: std({ color: BAKIR, metalness: 0.75, roughness: 0.28, envMapIntensity: 1.2, emissive: '#5a2a00', emissiveIntensity: 0.15 }), taban: std({ color: '#0a8a83', roughness: 0.4, envMapIntensity: 0.5 }) };
  function ayakBoya(L) { const u = L.userData; if (!u.pole) return; u.pole.material = AYAK.direk; u.collar.material = u.ring.material = u.cap.material = AYAK.bakir; u.base.material = AYAK.taban; }

  // ---------------- top arabasi ----------------
  // Eksenler oyun.js'deki eski topla ayni: namlu +z, zemin y=0, namlu grubu (0, 1.3, 0.2), tekerlek merkezi y 0.78, x +-1.02.
  function topModeli() {
    const mavi = new THREE.MeshPhysicalMaterial({ color: '#0a46c8', roughness: 0.3, metalness: 0.0, clearcoat: 0.6, clearcoatRoughness: 0.2, envMap: ENV, envMapIntensity: 0.45, emissive: '#031850', emissiveIntensity: 0.2 });
    const altin = new THREE.MeshStandardMaterial({ color: '#f29a10', metalness: 0.8, roughness: 0.28, emissive: '#5a2a00', emissiveIntensity: 0.3, envMap: ENV, envMapIntensity: 0.9 });
    const kirmizi = new THREE.MeshStandardMaterial({ color: '#e8302a', roughness: 0.3, envMap: ENV, envMapIntensity: 0.8 });
    const ip = new THREE.MeshStandardMaterial({ roughness: 0.9, map: canvasTex(64, 32, (x, w, h) => { x.fillStyle = '#d8a874'; x.fillRect(0, 0, w, h); x.strokeStyle = '#8a5a30'; x.lineWidth = 3; for (let i = -4; i < 12; i++) { x.beginPath(); x.moveTo(i * 8, 0); x.lineTo(i * 8 + 12, h); x.stroke(); } }) });
    const ic = new THREE.MeshBasicMaterial({ color: '#0a0e24' });
    const G = new THREE.Group(), add = (geo, m, x, y, z, par) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; (par || G).add(o); return o; };
    // tekerlekler: altin jant, 8 parmak, mavi gobek, altin kapak
    const tek = [];
    for (const sx of [-1, 1]) {
      const W = new THREE.Group(); W.position.set(sx * 1.0, 0.78, 0.0); G.add(W); tek.push(W);
      const jant = add(new THREE.TorusGeometry(0.66, 0.1, 14, 56), altin, 0, 0, 0, W); jant.rotation.y = Pi / 2; jant.scale.z = 1.7;
      for (let i = 0; i < 8; i++) { const sp = add(new THREE.CylinderGeometry(0.05, 0.065, 1.24, 10), altin, 0, 0, 0, W); sp.rotation.x = i / 8 * Pi; }
      const gob = add(new THREE.CylinderGeometry(0.22, 0.22, 0.26, 24), mavi, sx * 0.03, 0, 0, W); gob.rotation.z = Pi / 2;
      add(new THREE.SphereGeometry(0.12, 16, 12), altin, sx * 0.16, 0, 0, W);
    }
    const dingil = add(new THREE.CylinderGeometry(0.1, 0.1, 1.9, 14), mavi, 0, 0.78, 0); dingil.rotation.z = Pi / 2;
    // namlu: tombul, arkasi yuvarlak, agzi genis altin dudakli
    const N = new THREE.Group(); N.position.set(0, 1.3, 0.2); G.add(N);
    const pr = [[0.001, -1.3], [0.32, -1.28], [0.52, -1.16], [0.64, -0.95], [0.66, -0.6], [0.6, 0.6], [0.54, 1.42], [0.52, 1.56], [0.001, 1.56]].map((q) => new THREE.Vector2(q[0], q[1]));
    const nG = new THREE.LatheGeometry(pr, 56); nG.rotateX(Pi / 2); add(nG, mavi, 0, 0, 0, N);
    const dud = [[0.36, 1.5], [0.6, 1.5], [0.68, 1.6], [0.7, 1.78], [0.64, 1.94], [0.42, 1.98], [0.36, 1.92]].map((q) => new THREE.Vector2(q[0], q[1]));
    const dG = new THREE.LatheGeometry(dud, 56); dG.rotateX(Pi / 2); add(dG, altin, 0, 0, 0, N);
    const halka = [];
    for (const [z, r, t] of [[-0.98, 0.65, 0.07], [0.62, 0.6, 0.06], [-0.4, 0.66, 0.04]]) { const h = add(new THREE.TorusGeometry(r, t, 12, 56), altin.clone(), 0, 0, z, N); halka.push(h); }
    // yildizlar: ustte ve iki yanda
    const yS = new THREE.Shape(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? 0.09 : 0.21, a = Pi / 2 + i * Pi / 5; i ? yS.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : yS.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    const yG = new THREE.ExtrudeGeometry(yS, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.025, bevelSegments: 2 });
    for (const [ax, z] of [[0, -0.2], [Pi / 2, 0.15], [-Pi / 2, 0.15]]) { const y = new THREE.Mesh(yG, altin); y.castShadow = true; const p = new THREE.Group(); p.rotation.z = ax; p.position.z = z; y.position.set(0, 0.64, 0); y.rotation.x = -Pi / 2; p.add(y); N.add(p); }
    // arka: kirmizi baslik ve kivrik fitil
    add(new THREE.CylinderGeometry(0.16, 0.2, 0.22, 20), kirmizi, 0, 0, -1.36, N).rotation.x = Pi / 2;
    add(new THREE.TorusGeometry(0.19, 0.035, 8, 24), altin, 0, 0, -1.27, N);
    const fit = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, -1.46), new THREE.Vector3(0.05, -0.05, -1.62), new THREE.Vector3(0.18, -0.28, -1.66), new THREE.Vector3(0.12, -0.48, -1.58), new THREE.Vector3(0.22, -0.62, -1.7)]);
    add(new THREE.TubeGeometry(fit, 24, 0.045, 8, false), ip, 0, 0, 0, N);
    const kor = new THREE.Mesh(new THREE.CircleGeometry(0.36, 32), new THREE.MeshBasicMaterial({ color: '#ff8a2a', transparent: true, opacity: 0 })); kor.position.z = 1.57; N.add(kor);
    add(new THREE.CircleGeometry(0.37, 32), ic, 0, 0, 1.565, N);
    return { G, N, tek, halka, kor, muzzleZ: 0.2 + 1.98 };
  }
  return { tabla, ayakBoya, topModeli, MAT };
}
