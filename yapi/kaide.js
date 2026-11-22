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
  // ---------------- v9.4 top arabasi (Adem 19 Kas: referanstaki gibi tombul, ozgun renk, pati damgali) ----------------
  // Kisa ve kalin namlu, arkasi yuvarlak kubbe (kamera arkadan bakar: ekranda en cok bu gorunur), altin agiz, iri mor tekerlekler.
  // Renkler Foxi: tilki turuncusu govde, mor namlu ve tekerlek, altin susler; arkada ve namlu ustunde kabartma altin pati. Eski: ?top=eski2
  // v11.7 (Adem: 'top arabasi mor-altin'): boya = (renk, tur) -> malzeme verilirse yeni kimlik: turkuaz namlu, mercan govde, halat halkalar, ahsap tekerlek
  function topModeli2(boya, halat) {
    const B3 = !!boya;
    const parlak = (c, o) => new THREE.MeshPhysicalMaterial(Object.assign({ color: c, roughness: 0.26, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12, envMap: ENV, envMapIntensity: 0.55 }, o));
    const turuncu = B3 ? boya('#f2452c', 'top') : parlak('#ff3c00', { emissive: '#c01800', emissiveIntensity: 0.45, envMapIntensity: 0.08, clearcoat: 0.35, clearcoatRoughness: 0.3, roughness: 0.45 });   // v9.4b (Adem: 'cok soluk'): doygun turuncu, kendi renginde isik, az yansima
    const ahsap = B3 ? boya('#b9692a', 'kutu') : null;
    const mor = B3 ? boya('#0f9fb4', 'top') : parlak('#3c0cb0', { emissive: '#5a10ff', emissiveIntensity: 0.6, envMapIntensity: 0.15, clearcoat: 0.45, clearcoatRoughness: 0.25, roughness: 0.42 });
    const altin = B3 ? boya('#f3d49a', 'kutu') : new THREE.MeshStandardMaterial({ color: '#ffb000', metalness: 0.55, roughness: 0.3, emissive: '#ff8a00', emissiveIntensity: 0.45, envMap: ENV, envMapIntensity: 0.9 });
    const krem = B3 ? boya('#fff0cf', 'kutu') : parlak('#fff1d6', { emissive: '#40301a', emissiveIntensity: 0.1 });
    const kirmizi = B3 ? boya('#b9692a', 'kutu') : parlak('#e0102a', { emissive: '#a00018', emissiveIntensity: 0.45, envMapIntensity: 0.1, clearcoat: 0.35, roughness: 0.45 });
    const ic = new THREE.MeshBasicMaterial({ color: '#12081e' });
    const G = new THREE.Group(), add = (geo, m, x, y, z, par) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; (par || G).add(o); return o; };
    // pati sekli (taban yastigi + 4 parmak), z+ yonune bakan kabartma
    const pati = (s, m) => { const g = new THREE.Group(), ex = { depth: 0.05 * s, bevelEnabled: true, bevelThickness: 0.035 * s, bevelSize: 0.03 * s, bevelSegments: 3, curveSegments: 18 };
      const el = (rx, ry, x, y, r) => { const sh = new THREE.Shape(); sh.absellipse(0, 0, rx * s, ry * s, 0, Pi * 2, false, 0); const o = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, ex), m); o.position.set(x * s, y * s, 0); o.rotation.z = r || 0; o.castShadow = true; g.add(o); };
      el(0.36, 0.29, 0, -0.18); el(0.13, 0.17, -0.42, 0.14, 0.35); el(0.14, 0.18, -0.15, 0.4, 0.1); el(0.14, 0.18, 0.15, 0.4, -0.1); el(0.13, 0.17, 0.42, 0.14, -0.35); return g; };
    const tek = [];
    for (const sx of [-1, 1]) {   // iri tekerlek: mor lastik, krem jant halkasi, altin gobek ve kapakta pati
      const W = new THREE.Group(); W.position.set(sx * 1.32, 0.92, -0.25); G.add(W); tek.push(W);
      const las = add(new THREE.CylinderGeometry(0.95, 0.95, 0.5, 48), B3 ? ahsap : mor, 0, 0, 0, W); las.rotation.z = Pi / 2;
      const yan = add(new THREE.TorusGeometry(0.72, 0.08, 12, 48), krem, sx * 0.26, 0, 0, W); yan.rotation.y = Pi / 2;
      const gob = add(new THREE.CylinderGeometry(0.3, 0.34, 0.5, 32), altin, sx * 0.04, 0, 0, W); gob.rotation.z = Pi / 2;
      const p = pati(0.42, krem); p.position.x = sx * 0.34; p.rotation.y = sx * Pi / 2; W.add(p);
    }
    const dingil = add(new THREE.CylinderGeometry(0.14, 0.14, 2.6, 16), altin, 0, 0.92, -0.25); dingil.rotation.z = Pi / 2;
    // namlu grubu: arkada turuncu kubbe govde, onde kisa kalin mor namlu, altin agiz dudagi
    const N = new THREE.Group(); N.position.set(0, 1.3, 0.2); G.add(N);
    const gov = [[0.001, -1.25], [0.45, -1.2], [0.72, -1.02], [0.86, -0.72], [0.9, -0.35], [0.86, 0.0], [0.74, 0.25], [0.001, 0.25]].map((q) => new THREE.Vector2(q[0], q[1]));
    const gG = new THREE.LatheGeometry(gov, 56); gG.rotateX(Pi / 2); add(gG, turuncu, 0, 0, 0, N);
    const nam = [[0.001, 0.1], [0.7, 0.1], [0.66, 0.9], [0.62, 1.2], [0.001, 1.2]].map((q) => new THREE.Vector2(q[0], q[1]));
    const nG = new THREE.LatheGeometry(nam, 56); nG.rotateX(Pi / 2); add(nG, mor, 0, 0, 0, N);
    const dud = [[0.46, 1.12], [0.7, 1.12], [0.8, 1.22], [0.82, 1.42], [0.74, 1.56], [0.5, 1.58], [0.46, 1.5]].map((q) => new THREE.Vector2(q[0], q[1]));
    const dG = new THREE.LatheGeometry(dud, 56); dG.rotateX(Pi / 2); add(dG, B3 ? ahsap : altin, 0, 0, 0, N);
    const halka = [];
    for (const [z, r, t] of [[0.16, 0.76, 0.08], [0.86, 0.68, 0.06], [-0.72, 0.88, 0.05]]) { const tg = new THREE.TorusGeometry(r, B3 ? t * 1.25 : t, 12, B3 ? 112 : 56), h = add(tg, B3 ? halat(tg) : altin.clone(), 0, 0, z, N); halka.push(h); }
    // turuncu govdede krem benekler (tilki kurku gibi), arkada iri altin pati damgasi, namlu ustunde kucuk pati
    for (let i = 0; i < 6; i++) { const a = i / 6 * Pi * 2 + Pi / 6, pp = pati(0.24, altin); pp.position.set(Math.cos(a) * 0.86, Math.sin(a) * 0.86, -0.42); pp.lookAt(Math.cos(a) * 3, Math.sin(a) * 3, -0.9); N.add(pp); }   // govdeyi saran altin patiler
    if (!B3) add(new THREE.TorusGeometry(0.89, 0.09, 12, 56), kirmizi, 0, 0, -0.05, N); else { const tg = new THREE.TorusGeometry(0.885, 0.1, 12, 128); add(tg, halat(tg), 0, 0, -0.05, N); }   // kirmizi kusak
    const pA = pati(0.5, altin); pA.position.set(0, 0.05, -1.24); pA.rotation.y = Pi; N.add(pA);
    const pU = pati(0.3, altin); pU.position.set(0, 0.68, 0.55); pU.rotation.x = -Pi / 2 + 0.06; N.add(pU);
    const kor = new THREE.Mesh(new THREE.CircleGeometry(0.46, 32), new THREE.MeshBasicMaterial({ color: '#ff8a2a', transparent: true, opacity: 0 })); kor.position.z = 1.205; N.add(kor);
    add(new THREE.CircleGeometry(0.47, 32), ic, 0, 0, 1.2, N);
    return { G, N, tek, halka, kor, muzzleZ: 0.2 + 1.58 };
  }
  return { tabla, ayakBoya, topModeli, topModeli2, MAT };
}
