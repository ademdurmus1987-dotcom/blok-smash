// Foxi Smash v5.3 (Adem 15 Kas 2026: "sekiller kalitesiz, cok basit duruyor; referans oyunla fark cok fazla"): CILA blok seti.
// Sorun yakin planda degil, OYUN KAMERASINDAYDI: bloklar tam karsidan ve kucuk goruluyor, bu yuzden ince ayrinti (damar, ince X,
// ince pah) kayboluyor, duz yuzler hacimsiz kaliyor. Bu set ayni bloklari oyun kamerasina gore yeniden cizer:
//   - kalin cerceve + ice gomuk pano (isik-golge dokuya islenmis: karsidan bakinca da hacimli)
//   - temiz yuvarlak govde, iri ve sade amblem (pati, yildiz), doygun tek renk ailesi
//   - siyah kontur yok (ornek.js kontur: 0); bloklari ayiran sey kendi koyu pahi ve golgesi
// Eski gorunum silinmedi: adrese ?cila=0 eklenince v5.2 bloklari geri gelir.
export const CILA = !/[?&]cila=0/.test(location.search);

export function cilaKur(A) {
  const { THREE, S, canvasTex, ENV, kutu, rng, acik, koyu } = A, Pi = Math.PI;
  const tex = (w, h, f) => { const t = canvasTex(w, h, f); t.anisotropy = 8; return t; };
  const std = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.4, metalness: 0, envMap: ENV, envMapIntensity: 0.5 }, o));
  const yuvar = (x, a, b, w, h, r) => { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); };
  // birden cok [geometri, malzemeNo] -> gruplu tek geometri (konum, normal, uv, istenirse renk)
  function topla(L, renkli) {
    const ls = L.map(([g, m]) => [g.index ? g.toNonIndexed() : g, m]).sort((a, b) => a[1] - b[1]);
    const out = new THREE.BufferGeometry(); let n = 0; for (const [g] of ls) n += g.attributes.position.count;
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2), C = renkli ? new Float32Array(n * 3).fill(1) : null; let o = 0, gs = 0, cur = -1;
    for (const [g, m] of ls) {
      const c = g.attributes.position.count;
      P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3);
      if (g.attributes.uv) U.set(g.attributes.uv.array, o * 2);
      if (C && g.attributes.color) C.set(g.attributes.color.array, o * 3);
      if (m !== cur) { if (cur >= 0) out.addGroup(gs, o - gs, cur); cur = m; gs = o; }
      o += c;
    }
    out.addGroup(gs, o - gs, cur);
    out.setAttribute('position', new THREE.BufferAttribute(P, 3)); out.setAttribute('normal', new THREE.BufferAttribute(N, 3)); out.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    if (C) out.setAttribute('color', new THREE.BufferAttribute(C, 3));
    out.computeBoundingBox(); out.computeBoundingSphere(); return out;
  }
  // doku atlasinda sutun secimi: sec(nx, ny, nz) -> 0..n-1
  function bolge(g, n, sec) { const uv = g.attributes.uv, nr = g.attributes.normal; for (let i = 0; i < uv.count; i++) uv.setX(i, (sec(nr.getX(i), nr.getY(i), nr.getZ(i)) + uv.getX(i) * 0.996 + 0.002) / n); return g; }

  // ---------- ortak yuz: kalin cerceve + ice gomuk pano ----------
  // Isik ustten: cercevenin ustu acik alti koyu; panonun ust ic kenari golgede, alt ic kenari isikta (cukur okunur).
  function yuz(x, X, Y, W, H, renk, o = {}) {
    const k = Math.min(W, H), m = (o.m == null ? 0.15 : o.m) * k, rr = (o.r == null ? 0.11 : o.r) * k, pc = o.pano || koyu(renk, 0.22);
    let g = x.createLinearGradient(0, Y, 0, Y + H); g.addColorStop(0, acik(renk, 0.14)); g.addColorStop(0.25, renk); g.addColorStop(0.65, koyu(renk, 0.06)); g.addColorStop(1, koyu(renk, 0.3));
    x.fillStyle = g; x.fillRect(X, Y, W, H);
    if (o.metal) { g = x.createLinearGradient(X, Y, X + W, Y + H); g.addColorStop(0.2, 'rgba(255,255,255,0)'); g.addColorStop(0.42, 'rgba(255,255,230,.5)'); g.addColorStop(0.55, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(X, Y, W, H); }
    // cercevenin ust parlak seridi ve alt koyu seridi (pah)
    x.save(); x.beginPath(); x.rect(X, Y, W, H); x.clip(); x.lineJoin = 'round';
    x.save(); x.beginPath(); x.rect(X, Y, W, H * 0.5); x.clip(); yuvar(x, X + m * 0.36, Y + m * 0.36, W - m * 0.72, H - m * 0.72, rr * 1.5); x.strokeStyle = 'rgba(255,255,255,.3)'; x.lineWidth = m * 0.2; x.stroke(); x.restore();
    x.save(); x.beginPath(); x.rect(X, Y + H * 0.55, W, H * 0.45); x.clip(); yuvar(x, X + m * 0.36, Y + m * 0.36, W - m * 0.72, H - m * 0.72, rr * 1.5); x.strokeStyle = 'rgba(30,0,40,.22)'; x.lineWidth = m * 0.26; x.stroke(); x.restore();
    if (!o.panosuz) {
      const px = X + m, py = Y + m, pw = W - 2 * m, ph = H - 2 * m, e = m * 0.2;
      yuvar(x, px - e, py - e, pw + 2 * e, ph + 2 * e, rr + e); g = x.createLinearGradient(0, py - e, 0, py + ph + e); g.addColorStop(0, koyu(renk, 0.55)); g.addColorStop(0.5, koyu(renk, 0.3)); g.addColorStop(0.75, acik(renk, 0.1)); g.addColorStop(1, acik(renk, 0.34)); x.fillStyle = g; x.fill();
      yuvar(x, px, py, pw, ph, rr); g = x.createLinearGradient(0, py, 0, py + ph); g.addColorStop(0, koyu(pc, 0.3)); g.addColorStop(0.28, pc); g.addColorStop(1, acik(pc, 0.1)); x.fillStyle = g; x.fill();
      if (o.ic) { x.save(); yuvar(x, px, py, pw, ph, rr); x.clip(); o.ic(x, px, py, pw, ph); x.restore(); }
    }
    x.restore();
  }

  // ---------- 1) patili oyuncak kup ----------
  // Govde: temiz yuvarlak kup (Tripo modelinin topakli kenarlari yerine). Pati: on ve arka yuzde kabarik yastiklar (5 parca).
  const PR = {
    kirmizi: { c: '#dc0a1e' }, turuncu: { c: '#f25200', pano: '#c83800', pati: '#fff1d0' }, sari: { c: '#ffc200', pano: '#ee9200', pati: '#fffaea', e: 0.08 }, yesil: { c: '#0a9e30' },
    mavi: { c: '#0e50e6' }, mor: { c: '#7c1ee0' }, pembe: { c: '#f41e8c' }, beyaz: { c: '#efe9df', pano: '#cfc5b6' },
    altin: { c: '#e89600', pano: '#b86a00', pati: '#f6f8ff', metal: 1 }
  };
  const PATIY = [[0, -0.088, 0.128, 0.1, 0.085], [-0.07, -0.152, 0.075, 0.06, 0.07], [0.07, -0.152, 0.075, 0.06, 0.07],
    [-0.172, 0.04, 0.054, 0.07, 0.07, -0.35], [-0.062, 0.148, 0.054, 0.074, 0.075, -0.1], [0.062, 0.148, 0.054, 0.074, 0.075, 0.1], [0.172, 0.04, 0.054, 0.07, 0.07, 0.35]].map((p) => p.map((v, i) => (i < 4 ? v * 1.32 : i === 4 ? v * 1.15 : v)));   // [x, y, rx, ry, kabarma, donus] (kup kenari = 1)
  function patiGeo(seg, sira) {
    const L = [];
    for (const z of [1, -1]) for (const [cx, cy, rx, ry, rz, rot] of PATIY) {
      const g = new THREE.SphereGeometry(1, seg, sira, 0, Pi * 2, 0, Pi / 2); g.rotateX(Pi / 2); g.scale(rx * S, ry * S, rz * S); if (rot) g.rotateZ(-rot);
      g.translate(cx * S, (cy - 0.004) * S, S * 0.484); if (z < 0) g.rotateY(Pi); L.push([g, 1]);
    }
    return L;
  }
  const PATIMAT = {};
  function patiMat(renk) { return PATIMAT[renk] || (PATIMAT[renk] = renk === '#ffc414' ? std({ color: '#ffb000', roughness: 0.25, metalness: 0.1, envMapIntensity: 0.55, emissive: '#ff7800', emissiveIntensity: 0.38 }) : std({ color: renk, roughness: 0.25, envMapIntensity: 0.5, emissive: renk, emissiveIntensity: 0.12 })); }
  function patiKup(ad) {
    const R = PR[ad], c = R.c, pc = R.pano || koyu(c, 0.26);
    const map = tex(512, 256, (x, w, h) => {
      for (const ox of [0, 256]) yuz(x, ox, 0, 256, 256, c, { pano: pc, metal: R.metal, m: 0.14, r: 0.12 });
      // patinin panoya dusen golgesi (yalniz on/arka yuz dokusu)
      x.save(); x.beginPath(); x.rect(0, 0, 256, 256); x.clip(); x.translate(128, 128); x.shadowColor = koyu(pc, 0.6); x.shadowBlur = 9; x.shadowOffsetY = 9; x.fillStyle = koyu(pc, 0.5);
      for (const [cx, cy, rx, ry, , rot] of PATIY) { x.beginPath(); x.ellipse(cx * 256, -cy * 256, rx * 256 * 0.96, ry * 256 * 0.96, rot || 0, 0, Pi * 2); x.fill(); }
      x.restore();
    });
    const govde = (n) => bolge(kutu(S * 0.985, S * 0.985, S * 0.985, S * 0.15, n), 2, (nx, ny, nz) => (Math.abs(nz) > 0.6 ? 0 : 1));
    const gm = std({ map, roughness: R.metal ? 0.32 : 0.48, metalness: R.metal ? 0.5 : 0, envMapIntensity: R.metal ? 0.9 : 0.22, emissive: c, emissiveIntensity: R.e || (R.metal ? 0.25 : 0.2) });
    return { geo: topla([[govde(3), 0], ...patiGeo(12, 5)]), lod: topla([[govde(2), 0], ...patiGeo(8, 3)]), esik: 28, golgeKutu: 1, mat: [gm, patiMat(R.pati || '#ffc414')], parca: std({ color: c, roughness: 0.35 }), pati: ad };
  }

  // ---------- 2) buz ----------
  // Doygun mavi, ici derin; kalin acik kenar (buz kalibi), iki capraz parlak serit. Karalama cizgi yok.
  function buz(wS, tohum) {
    const map = tex(256 * wS, 256, (x, w, h) => {
      const r = rng(tohum), m = h * 0.12;
      let g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#7adcff'); g.addColorStop(0.2, '#30b0ff'); g.addColorStop(0.7, '#1478ea'); g.addColorStop(1, '#0a48bc'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      // ic kutle
      yuvar(x, m * 0.8, m * 0.8, w - m * 1.6, h - m * 1.6, h * 0.13); g = x.createLinearGradient(0, m, 0, h - m); g.addColorStop(0, '#0a50c8'); g.addColorStop(0.5, '#1272e4'); g.addColorStop(1, '#40b0ff'); x.fillStyle = g; x.fill();
      yuvar(x, m, m * 1.05, w - 2 * m, h - 2 * m, h * 0.11); g = x.createLinearGradient(0, m, w * 0.4, h - m); g.addColorStop(0, '#2a9cf8'); g.addColorStop(0.55, '#0f70e6'); g.addColorStop(1, '#0a50d0'); x.fillStyle = g; x.fill();
      x.save(); x.clip();
      // capraz parlak seritler
      for (const [u, bw, a] of [[0.1 + r() * 0.08, 0.2, 0.3], [0.42 + r() * 0.1, 0.07, 0.22]]) { const x0 = u * w - h * 0.25; x.fillStyle = 'rgba(255,255,255,' + a + ')'; x.beginPath(); x.moveTo(x0, h); x.lineTo(x0 + bw * h, h); x.lineTo(x0 + bw * h + h * 0.55, 0); x.lineTo(x0 + h * 0.55, 0); x.closePath(); x.fill(); }
      // alttan yukari derinlik
      g = x.createLinearGradient(0, h * 0.55, 0, h); g.addColorStop(0, 'rgba(8,40,150,0)'); g.addColorStop(1, 'rgba(8,40,150,.38)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.restore();
      // dis kenar: ustte ve solda beyaz isik, altta koyu
      x.save(); x.beginPath(); x.rect(0, 0, w, h * 0.5); x.clip(); yuvar(x, m * 0.34, m * 0.34, w - m * 0.68, h - m * 0.68, h * 0.14); x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = m * 0.26; x.stroke(); x.restore();
      x.save(); x.beginPath(); x.rect(0, h * 0.6, w, h * 0.4); x.clip(); yuvar(x, m * 0.34, m * 0.34, w - m * 0.68, h - m * 0.68, h * 0.14); x.strokeStyle = 'rgba(6,40,140,.4)'; x.lineWidth = m * 0.3; x.stroke(); x.restore();
      // parilti
      const yildiz = (cx, cy, s) => { x.fillStyle = '#ffffff'; x.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? s * 0.22 : s, a = i * Pi / 4; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); x.fill(); };
      yildiz(m * 2.0, m * 2.0, h * 0.085);
    });
    return { geo: kutu(wS * S * 0.99, S * 0.99, S * 0.99, S * 0.12, 3), mat: std({ map, roughness: 0.22, envMapIntensity: 0.45, emissive: '#0a48c8', emissiveIntensity: 0.4 }), parca: std({ color: '#9fdcff', roughness: 0.1, transparent: true, opacity: 0.85 }) };
  }

  // ---------- 3) yontma tas ----------
  // Tek tek pahli taslar (aralarinda koyu harc). Taslarin yuzunde isik-golge dokuda: ust kenar acik, alt kenar koyu, ton farki belirgin.
  const TASR = '#959bb6';
  let TASA = null;
  const tasAtlas = () => TASA || (TASA = tex(512, 512, (x) => {
    const r = rng(7), ton = ['#9299b8', '#7d84a6', '#a2a9c6', '#888fb0'];
    for (let v = 0; v < 4; v++) {
      const X = (v % 2) * 256, Y = Math.floor(v / 2) * 256, W = 256, H = 256, c = ton[v];
      let g = x.createLinearGradient(0, Y, 0, Y + H); g.addColorStop(0, acik(c, 0.2)); g.addColorStop(0.45, c); g.addColorStop(1, koyu(c, 0.26)); x.fillStyle = g; x.fillRect(X, Y, W, H);
      x.save(); x.beginPath(); x.rect(X, Y, W, H); x.clip();
      for (let k = 0; k < 7; k++) { x.fillStyle = r() < 0.5 ? 'rgba(40,36,90,.1)' : 'rgba(255,255,255,.12)'; x.beginPath(); x.ellipse(X + r() * W, Y + r() * H, 18 + r() * 40, 10 + r() * 24, r() * 3, 0, Pi * 2); x.fill(); }
      if (v % 2 === 0) { x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); let px = X + W * (0.3 + r() * 0.4), py = Y + 30; x.moveTo(px, py); for (let k = 0; k < 4; k++) { px += (r() - 0.5) * 60; py += 34 + r() * 16; x.lineTo(px, py); } x.strokeStyle = 'rgba(40,36,80,.5)'; x.lineWidth = 9; x.stroke(); x.strokeStyle = 'rgba(255,255,255,.22)'; x.lineWidth = 3; x.translate(4, 3); x.stroke(); x.translate(-4, -3); }
      // pah: ust ve sol acik, alt ve sag koyu
      g = x.createLinearGradient(0, Y, 0, Y + 46); g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(X, Y, W, 46);
      g = x.createLinearGradient(X, 0, X + 34, 0); g.addColorStop(0, 'rgba(255,255,255,.3)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(X, Y, 34, H);
      g = x.createLinearGradient(0, Y + H - 56, 0, Y + H); g.addColorStop(0, 'rgba(30,24,80,0)'); g.addColorStop(1, 'rgba(30,24,80,.55)'); x.fillStyle = g; x.fillRect(X, Y + H - 56, W, 56);
      g = x.createLinearGradient(X + W - 34, 0, X + W, 0); g.addColorStop(0, 'rgba(30,24,80,0)'); g.addColorStop(1, 'rgba(30,24,80,.3)'); x.fillStyle = g; x.fillRect(X + W - 34, Y, 34, H);
      x.restore();
    }
  }));
  const HARC = std({ color: '#4a4668', roughness: 1, envMapIntensity: 0.1 });
  let TASM = null;
  function tas(wS, tohum) {
    const r = rng(tohum), L = [], W = wS * S, bos = S * 0.03, sw = S / 2, rh = S / 2;
    L.push([kutu(W * 0.95, S * 0.95, S * 0.9, S * 0.02, 1), 1]);
    for (let j = 0; j < 2; j++) {
      const yy = -S / 2 + rh * (j + 0.5), kay = j % 2 ? sw / 2 : 0, xs = [];
      let x0 = -W / 2; if (kay) { xs.push([x0, x0 + kay]); x0 += kay; } while (x0 < W / 2 - 1e-4) { const x1 = Math.min(W / 2, x0 + sw); xs.push([x0, x1]); x0 = x1; }
      for (const [a, b] of xs) {
        const tw = b - a - bos; if (tw < S * 0.08) continue;
        const g = kutu(tw, rh - bos, S - bos * 0.5, S * 0.06, 1), v = Math.floor(r() * 4), uv = g.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setXY(i, ((v % 2) + 0.03 + uv.getX(i) * 0.94) / 2, (Math.floor(v / 2) + 0.03 + uv.getY(i) * 0.94) / 2);
        g.translate((a + b) / 2, yy, 0); L.push([g, 0]);
      }
    }
    TASM = TASM || std({ map: tasAtlas(), roughness: 0.8, envMapIntensity: 0.3, emissive: '#20204a', emissiveIntensity: 0.14 });
    return { geo: topla(L), mat: [TASM, HARC], parca: std({ color: TASR, roughness: 0.9 }) };
  }

  // ---------- 4) altin yildiz blok ----------
  function yildizBlok() {
    const R = '#ffb400';
    const map = tex(256, 256, (x, w, h) => yuz(x, 0, 0, w, h, R, { pano: '#e27c00', metal: 1, m: 0.14, r: 0.12, ic: (c, px, py, pw, ph) => {
      c.translate(px + pw / 2, py + ph / 2 + 10); c.shadowColor = 'rgba(120,50,0,.7)'; c.shadowBlur = 8; c.fillStyle = 'rgba(120,50,0,.6)'; c.beginPath(); for (let i = 0; i < 10; i++) { const rr = (i % 2 ? 0.14 : 0.31) * w, a = -Pi / 2 + i * Pi / 5; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); c.fill(); } }));
    const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const rr = (i % 2 ? 0.135 : 0.3) * S, a = Pi / 2 + i * Pi / 5; i ? sh.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : sh.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    const L = [[kutu(S * 0.985, S * 0.985, S * 0.985, S * 0.14, 3), 0]];
    for (const z of [1, -1]) { const y = new THREE.ExtrudeGeometry(sh, { depth: S * 0.015, bevelEnabled: true, bevelThickness: S * 0.05, bevelSize: S * 0.035, bevelSegments: 2 }); y.computeVertexNormals(); y.translate(0, -S * 0.01, S * 0.47); if (z < 0) y.rotateY(Pi); L.push([y, 1]); }
    const YM = std({ color: '#fff0a0', roughness: 0.2, metalness: 0.2, envMapIntensity: 1.1, emissive: '#ffb400', emissiveIntensity: 0.35 });
    return { geo: topla(L), mat: [std({ map, roughness: 0.36, metalness: 0.25, envMapIntensity: 0.6, emissive: R, emissiveIntensity: 0.16 }), YM], parca: std({ color: R, metalness: 0.4, roughness: 0.3 }) };
  }

  // ---------- 5) mucevher ----------
  // Yuzeyler isiktan bagimsiz parlasin: her yuzeye kendi acikligi (kose rengi) yazilir; tabla en acik, alt yuzeyler koyu.
  function mucevher(renk) {
    const prof = [[S * 0.001, -S * 0.47], [S * 0.3, -S * 0.2], [S * 0.49, S * 0.05], [S * 0.49, S * 0.1], [S * 0.42, S * 0.24], [S * 0.27, S * 0.33], [S * 0.001, S * 0.33]];
    let g = new THREE.LatheGeometry(prof.map(([a, b]) => new THREE.Vector2(a, b)), 8); g = g.toNonIndexed(); g.computeVertexNormals(); g.translate(0, S * 0.03, 0);
    const p = g.attributes.position, n = g.attributes.normal, C = new Float32Array(p.count * 3), r = rng(5), ana = new THREE.Color(renk), ak = new THREE.Color('#ffffff'), t = new THREE.Color();
    for (let i = 0; i < p.count; i += 3) {
      const ny = n.getY(i), nx = n.getX(i), nz = n.getZ(i);
      let k = ny > 0.9 ? 0.38 : ny > 0.2 ? 0.08 + r() * 0.3 : ny > -0.2 ? r() * 0.18 : -0.3 + r() * 0.3;   // + acik, - koyu
      k += (-nx * 0.5 + nz * 0.2) * 0.25;
      t.copy(ana); if (k > 0) t.lerp(ak, Math.min(0.55, k)); else t.multiplyScalar(1 + Math.max(-0.5, k));
      for (let j = 0; j < 3; j++) { C[(i + j) * 3] = t.r; C[(i + j) * 3 + 1] = t.g; C[(i + j) * 3 + 2] = t.b; }
    }
    g.setAttribute('color', new THREE.BufferAttribute(C, 3));
    const m = std({ vertexColors: true, emissive: renk, emissiveIntensity: 0.4, roughness: 0.15, metalness: 0.1, envMapIntensity: 0.6, flatShading: true });
    return { geo: g, mat: m, parca: std({ color: renk, roughness: 0.1, emissive: renk, emissiveIntensity: 0.5 }) };
  }

  const yeni = {
    ksBuz: () => buz(1, 53), ksBuz3: () => buz(3, 59),
    ksTas: () => tas(1, 37), ksTas2: () => tas(2, 41), ksTas3: () => tas(3, 43), ksTas4: () => tas(4, 45),
    ksYildiz: yildizBlok, ksYakut: () => mucevher('#e8122e'), ksElmas: () => mucevher('#1a6cf4')
  };
  return { yeni, patiKup };
}
