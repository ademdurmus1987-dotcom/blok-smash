// Foxi Smash v12.6 deneme (24 Kas 2026, Adem: 'basla ama platform cesit olsun yuvarlak kare vs'). Anahtar ?plat5=1 (Adem onaylayinca varsayilan).
// Top arabasi (v12.4) gibi parlak vernikli malzeme (MeshPhysical clearcoat + ENV) ve pahli formlar.
// Tabla: bolume gore degisen dis cizgi (kare, yuvarlak, hap, sekizgen, altigen, daire, elips), bu yuzden kodla kurulur:
//   pahli turkuaz govde, ustte ayri ayri pahli tahta guverte kalaslari (aralari oluk), ust kenarda 3 iplikli burgulu halat,
//   yanda altin bant ve percinler. Ust yuz y=0 (fizik ayni), alt -th.
// Ayak: Blender modeli (uretici/blender/platform5.py -> model/plat5/ayak.glb), iki takim: Y yuvarlak, K kose (sekizgen kesit).
// Fizik: oyun.js pFizik tablayi ayni cokgenden prizma yapar; floorAt q.poly ile cokgenin icine bakar.
export const PLAT5 = new URLSearchParams(location.search).get('plat5') === '1' && !window.KORSAN;
const R5 = { deniz: ['#0f9fb4', 0.35, 0, 0.8], ahsap: ['#c9742f', 0.5, 0, 0.35], altin: ['#f3c66a', 0.3, 0.85, 0.3], halat: ['#e9cf9b', 0.8, 0, 0], koyu: ['#06566e', 0.45, 0, 0.5],
  mercan: ['#e8503a', 0.35, 0, 0.8], tahta: ['#b9692a', 0.55, 0, 0.4],
  guv0: ['#e2a658', 0.55, 0, 0.3], guv1: ['#d9994a', 0.55, 0, 0.3], guv2: ['#e8b066', 0.55, 0, 0.3], oluk: ['#6e4420', 0.8, 0, 0] };
export function plat5Kur({ THREE, pKaydir, ENV, GLTFLoader }) {
  const MM = {};
  const mat = (ad) => MM[ad] || (MM[ad] = (() => { const r = R5[ad] || R5.ahsap; return new THREE.MeshPhysicalMaterial({ color: r[0], roughness: r[1], metalness: r[2], clearcoat: r[3], clearcoatRoughness: 0.2, envMap: ENV, envMapIntensity: 0.5, side: ad === 'halat' ? THREE.DoubleSide : THREE.FrontSide }); })());
  // ---------- sekil ----------
  // q.kos: (tek platformda) kup koselerinin |x|, |z| listesi; daire/elips buna gore butun kupleri icine alir
  function rrect(r, rz, rho) {
    rho = Math.min(rho, rz * 0.98, r * 0.98); const P = [];
    for (const [cx, cz, a0] of [[r - rho, rz - rho, 0], [-r + rho, rz - rho, 0.5], [-r + rho, -rz + rho, 1], [r - rho, -rz + rho, 1.5]]) for (let k = 0; k <= 6; k++) { const a = (a0 + k / 12) * Math.PI; P.push([cx + Math.cos(a) * rho, cz + Math.sin(a) * rho]); }
    return P;
  }
  function sekil(q, n, LV, S, tek) {
    const r = q.r, rz = q.rz, kos = tek && q.kos && q.kos.length ? q.kos : null, m = 0.3;
    const ADLAR = ['kare', 'daire', 'altigen', 'yuvarlak', 'sekizgen', 'hap'], sec = Q5 || ADLAR[(LV * 7 + n * 3) % ADLAR.length];
    let ad = sec, P = [];
    if (ad === 'daire' || ad === 'elips') {
      ad = 'daire'; if (!kos) ad = 'yuvarlak';
      else {
        const rd = Math.max(...kos.map(([x, z]) => Math.hypot(x, z))) + m;
        if (Q5 !== 'elips' && (rd <= Math.max(r, rz) * 1.12 || Q5 === 'daire')) { const R = Math.max(rd, Math.min(r, rz)); for (let i = 0; i < 48; i++) { const a = i / 48 * 6.2832; P.push([Math.cos(a) * R, Math.sin(a) * R]); } }
        else {   // uzun yapida daire cok buyur: elips (super elips, kosesi dolgun)
          ad = 'elips'; const e = 2.6, k = Math.max(1, ...kos.map(([x, z]) => Math.pow(Math.pow((x + m) / r, e) + Math.pow((z + m) / rz, e), 1 / e)));
          for (let i = 0; i < 56; i++) { const a = i / 56 * 6.2832, c = Math.cos(a), s = Math.sin(a); P.push([Math.sign(c) * Math.pow(Math.abs(c), 2 / e) * r * k, Math.sign(s) * Math.pow(Math.abs(s), 2 / e) * rz * k]); }
        }
      }
    }
    if (ad === 'kare') P = rrect(r, rz, 0.4);
    else if (ad === 'yuvarlak') P = rrect(r, rz, 1.1);
    else if (ad === 'hap') P = rrect(r, rz, 2.4);
    else if (ad === 'sekizgen') { const e = Math.min(S * 0.9, r * 0.45, rz * 0.45); P = [[r, rz - e], [r - e, rz], [-r + e, rz], [-r, rz - e], [-r, -rz + e], [-r + e, -rz], [r - e, -rz], [r, -rz + e]]; }
    else if (ad === 'altigen') { const e = Math.min(rz * 0.55, 1.4); P = [[r + e, 0], [r, rz], [-r, rz], [-r - e, 0], [-r, -rz], [r, -rz]]; }
    let a2 = 0; for (let i = 0; i < P.length; i++) { const p = P[i], o = P[(i + 1) % P.length]; a2 += p[0] * o[1] - o[0] * p[1]; } if (a2 > 0) P = P.slice().reverse();   // oyun.js pCcw ile ayni yon
    const gx = Math.max(...P.map((p) => Math.abs(p[0])));
    return { ad, P, gx, kose: ad === 'kare' || ad === 'sekizgen' || ad === 'altigen' };
  }
  // tasarim (pilot) bolumlerinin dikdortgen kati: yeni sekil dikdortgeni HER ZAMAN icine alir (kupler hep desteklenir); fizik ayni cokgen (pilot.js)
  function katSekil(k, n) {
    const r = k.r, rz = k.rz || k.r, dz = k.dz || 0, ADLAR = ['kare', 'altigen', 'yuvarlak', 'sekizgen', 'hap'];
    let ad = Q5 === 'daire' || Q5 === 'elips' ? 'hap' : Q5 || ADLAR[(n * 7) % ADLAR.length], P = [];
    if (ad === 'hap' && r < rz * 0.6) ad = 'yuvarlak';
    if (ad === 'kare') P = rrect(r, rz, 0.35);
    else if (ad === 'yuvarlak') P = rrect(r + 0.3, rz + 0.3, 1.0);
    else if (ad === 'sekizgen') { const c = Math.min(0.7, r * 0.3, rz * 0.3); P = [[r + c, rz - c], [r - c, rz + c], [-r + c, rz + c], [-r - c, rz - c], [-r - c, -rz + c], [-r + c, -rz - c], [r - c, -rz - c], [r + c, -rz + c]]; }
    else if (ad === 'altigen') { const e = Math.min(rz * 0.55, 1.4); P = [[r + e, 0], [r, rz], [-r, rz], [-r - e, 0], [-r, -rz], [r, -rz]]; }
    else { const R = rz * 1.12, xc = r - rz * 0.504; for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + i / 12 * Math.PI; P.push([xc + Math.cos(a) * R, Math.sin(a) * R]); } for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 + i / 12 * Math.PI; P.push([-xc + Math.cos(a) * R, Math.sin(a) * R]); } }
    P = P.map(([x, z]) => [x, z + dz]);
    return { ad, P, gx: Math.max(...P.map((p) => Math.abs(p[0]))) };
  }
  // ---------- tabla ----------
  const disa = (P) => { let a = 0; for (let i = 0; i < P.length; i++) { const p = P[i], o = P[(i + 1) % P.length]; a += p[0] * o[1] - o[0] * p[1]; } return a < 0 ? P.slice().reverse() : P; };   // pKaydir arti = disari
  function ext(P, y0, y1, bev, del) {   // cokgenden pahli prizma (y0 alt, y1 ust)
    const ic = pKaydir(P, -bev), sh = new THREE.Shape(); ic.forEach(([x, z], i) => (i ? sh.lineTo(x, -z) : sh.moveTo(x, -z)));
    if (del) { const d = new THREE.Path(); del.slice().reverse().forEach(([x, z], i) => (i ? d.lineTo(x, -z) : d.moveTo(x, -z))); sh.holes.push(d); }
    const g = new THREE.ExtrudeGeometry(sh, { depth: Math.max(0.01, y1 - y0 - 2 * bev), bevelEnabled: bev > 0, bevelThickness: bev, bevelSize: bev, bevelSegments: 3, curveSegments: 2 });
    g.rotateX(-Math.PI / 2); g.translate(0, y0 + bev, 0); return g;
  }
  function kes(Q, z, yon) { const o = []; for (let i = 0; i < Q.length; i++) { const a = Q[i], b = Q[(i + 1) % Q.length], da = (a[1] - z) * yon, db = (b[1] - z) * yon; if (da >= 0) o.push(a); if (da * db < 0) { const t = da / (da - db); o.push([a[0] + (b[0] - a[0]) * t, z]); } } return o; }
  // dis cizgiyi esit adimli kapali yola cevir (koseler hafif yuvarlanir)
  function yol(P, adim) {
    const o = []; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / adim)); for (let k = 0; k < n; k++) o.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); }
    for (let t = 0; t < 2; t++) for (let i = 0; i < o.length; i++) { const a = o[(i + o.length - 1) % o.length], c = o[(i + 1) % o.length]; o[i] = [(a[0] + 2 * o[i][0] + c[0]) / 4, (a[1] + 2 * o[i][1] + c[1]) / 4]; }
    return o;
  }
  // 3 iplikli burgulu halat: yol boyunca sarmal borular (tek geometri)
  function halat(P, y, rr, ri) {
    const Y = yol(P, 0.035), n = Y.length, sg = 6, pos = [], nor = [], idx = [];
    let L = 0; const s = [0]; for (let i = 1; i < n; i++) { L += Math.hypot(Y[i][0] - Y[i - 1][0], Y[i][1] - Y[i - 1][1]); s.push(L); } L += Math.hypot(Y[0][0] - Y[n - 1][0], Y[0][1] - Y[n - 1][1]);
    const tur = Math.max(6, Math.round(L / 0.32));   // tam sayi tur: halat kapaninca dikis yok
    for (let k = 0; k < 3; k++) {
      const b0 = pos.length / 3;
      for (let i = 0; i < n; i++) {
        const a = Y[(i + n - 1) % n], c = Y[(i + 1) % n], tx = c[0] - a[0], tz = c[1] - a[1], tl = Math.hypot(tx, tz) || 1, nx = tz / tl, nz = -tx / tl;   // disari normal
        const b = s[i] / L * tur * 6.2832 + k * 2.0944, cx = Y[i][0] + nx * rr * Math.cos(b), cy = y + rr * Math.sin(b), cz = Y[i][1] + nz * rr * Math.cos(b);
        for (let j = 0; j < sg; j++) { const u = j / sg * 6.2832, ux = nx * Math.cos(u), uy = Math.sin(u), uz = nz * Math.cos(u); pos.push(cx + ux * ri, cy + uy * ri, cz + uz * ri); nor.push(ux, uy, uz); }
      }
      for (let i = 0; i < n; i++) for (let j = 0; j < sg; j++) { const a = b0 + i * sg + j, b = b0 + ((i + 1) % n) * sg + j, c = b0 + ((i + 1) % n) * sg + (j + 1) % sg, d = b0 + i * sg + (j + 1) % sg; idx.push(a, d, b, b, d, c); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setIndex(idx); g.computeBoundingSphere(); return g;
  }
  // yandan bakista (oyun kamerasi neredeyse yatay) sekil ailesi yan yuzden okunsun: yuvarlaklar turkuaz yumusak kenar, kare tahta kaplama, koseliler mercan keskin pah
  function tabla(P0, th, ad) {
    const st = ad === 'kare' ? 'tahta' : ad === 'sekizgen' || ad === 'altigen' ? 'mercan' : 'deniz', bv = st === 'deniz' ? th * 0.42 : st === 'mercan' ? 0.05 : 0.09;
    const P = disa(P0), G = new THREE.Group(), M = (g, ad, gol = true) => { const m = new THREE.Mesh(g, Array.isArray(ad) ? ad.map(mat) : mat(ad)); m.castShadow = gol; m.receiveShadow = true; G.add(m); return m; };
    // govde: yanlar turkuaz, ust oluk rengi, alt koyu (yuz gruplari normale gore)
    const gv = ext(P, -th, -0.05, Math.min(bv, (th - 0.05) * 0.45)), nr = gv.attributes.normal, ix = [], A = [[], [], []];
    gv.setIndex(null); for (let t = 0; t < nr.count; t += 3) { const ny = (nr.getY(t) + nr.getY(t + 1) + nr.getY(t + 2)) / 3; A[ny > 0.9 ? 1 : ny < -0.9 ? 2 : 0].push(t, t + 1, t + 2); }
    ix.push(...A[0], ...A[1], ...A[2]); gv.setIndex(ix); gv.clearGroups(); gv.addGroup(0, A[0].length, 0); gv.addGroup(A[0].length, A[1].length, 1); gv.addGroup(A[0].length + A[1].length, A[2].length, 2);
    M(gv, [st, 'oluk', 'koyu']);
    if (st === 'tahta') {   // kare: yan yuzde dikey tahta derzleri (ince koyu cubuklar)
      const Y = yol(pKaydir(P, 0.012), 0.05), adim = Math.max(1, Math.round(0.55 / 0.05)), d = []; for (let i = 0; i < Y.length; i += adim) d.push(Y[i]);
      const dz = new THREE.InstancedMesh(new THREE.BoxGeometry(0.035, th * 0.7, 0.035), mat('oluk'), d.length), o = new THREE.Object3D(); d.forEach(([x, z], i) => { o.position.set(x, -0.05 - th * 0.45, z); o.updateMatrix(); dz.setMatrixAt(i, o.matrix); }); G.add(dz);
    }
    // guverte: z yonunde kalaslar (ayri pahli tahtalar, aralari oluk)
    const H = pKaydir(P, -0.16), zs = H.map((p) => p[1]), z0 = Math.min(...zs), z1 = Math.max(...zs), nk = Math.max(2, Math.round((z1 - z0) / 0.62)), w = (z1 - z0) / nk;
    for (let k = 0; k < nk; k++) { const Qk = kes(kes(H, z0 + k * w + 0.03, 1), z0 + (k + 1) * w - 0.03, -1); if (Qk.length > 2) M(ext(Qk, -0.08, 0, 0.025), 'guv' + ((k * 5 + 1) % 3), false); }
    // ust kenarda halat, yanda altin bant + percinler
    M(halat(pKaydir(P, 0.05), -0.07, 0.05, 0.06), 'halat');
    const yb = -th * 0.62; if (st !== 'deniz') M(ext(pKaydir(P, 0.035), yb - 0.06, yb + 0.06, 0.02, pKaydir(P, -0.12)), 'altin');
    const Y = yol(pKaydir(P, 0.05), 0.05), adim = Math.max(1, Math.round(1.5 / 0.05)), pr = []; for (let i = 0; i < Y.length; i += adim) pr.push(Y[i]);
    const ri = new THREE.InstancedMesh(new THREE.SphereGeometry(st === 'mercan' ? 0.1 : 0.075, 12, 8), mat('altin'), pr.length), o = new THREE.Object3D();
    pr.forEach(([x, z], i) => { o.position.set(x, yb, z); o.updateMatrix(); ri.setMatrixAt(i, o.matrix); }); ri.castShadow = true; G.add(ri);
    return G;
  }
  // ---------- ayak (Blender) ----------
  let GLB = null; const BEK = [];
  const doldur = (g, ad) => { const k = GLB.getObjectByName(ad); if (!k) return; const c = k.clone(true); c.position.set(0, 0, 0); c.traverse((m) => { if (m.isMesh) { m.geometry = m.geometry.clone(); m.castShadow = m.receiveShadow = true; } }); g.add(c); };
  new GLTFLoader().load('model/plat5/ayak.glb?v=1', (gl) => {
    gl.scene.traverse((m) => { if (m.isMesh) m.material = mat((m.material && m.material.name || '').replace(/\.\d+$/, '')); });
    GLB = gl.scene; for (const [g, ad] of BEK.splice(0)) doldur(g, ad);
  }, undefined, () => console.warn('plat5: ayak modeli yuklenemedi'));
  const parca = (ad) => { const g = new THREE.Group(); if (GLB) doldur(g, ad); else BEK.push([g, ad]); return g; };
  return { sekil, katSekil, tabla, parca };
}
const Q5 = new URLSearchParams(location.search).get('psekil');   // deneme: ?psekil=daire|elips|kare|yuvarlak|hap|sekizgen|altigen her bolumde
