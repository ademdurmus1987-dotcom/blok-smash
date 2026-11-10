// Blok Smash v3.1 (10 Kas 2026): kodla cizilen 3B sekiller (Adem'in gonderdigi uc ornek yapi icin).
// Parlak oyuncak kupler, uzun tas kirisler, mermer sutun tamburlari, buz kup/kirisleri, ahsap dikme,
// seker kavanozlari, raf tahtalari ve dalgali porselen tamburlar. Hepsi gercek 3B: yuvarlak kenarli govde,
// ustune boyanmis isik-golge, kabartma (bump) ve parlak yansima. Dosya indirmez, model beklemez.
// Olculer kup kenari (S) cinsindendir: w genislik (x), h yukseklik (y), d derinlik (z).
export function sekilKur({ THREE, S, canvasTex, ENV }) {
  const col = (h) => new THREE.Color(h);
  const mix = (a, b, t) => '#' + col(a).lerp(col(b), t).getHexString();
  const koyu = (h, t) => mix(h, '#000000', t), acik = (h, t) => mix(h, '#ffffff', t);
  const rng = (a) => () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const P = 144;   // doku: bir kup kenari basina piksel

  // ---------------- govdeler ----------------
  // Gercek yuvarlak kenarli kutu: kenar ve koseler r yaricapli yay (n dilim). Doku her yuze duz izdusumle oturur.
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
  // Torna govde: profil [yaricap, y, dokuV] noktalarindan dondurulur. dokuV: o noktanin dokudaki yuksekligi (0 alt, 1 ust).
  function torna(prof, seg = 28) {
    const g = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(Math.max(r, 1e-4), y)), seg), uv = g.attributes.uv, n = prof.length;
    for (let i = 0; i <= seg; i++) for (let j = 0; j < n; j++) uv.setXY(i * n + j, i / seg, prof[j][2]);
    g.computeVertexNormals();
    // dikis: ilk ve son dilimin normalleri ayni olsun (cizgi gorunmesin)
    const nr = g.attributes.normal; for (let j = 0; j < n; j++) { const a = j, b = seg * n + j, x = nr.getX(a) + nr.getX(b), y = nr.getY(a) + nr.getY(b), z = nr.getZ(a) + nr.getZ(b), L = Math.hypot(x, y, z) || 1; nr.setXYZ(a, x / L, y / L, z / L); nr.setXYZ(b, x / L, y / L, z / L); }
    g.computeBoundingBox(); g.computeBoundingSphere(); return g;
  }
  const mat = (map, o) => new THREE.MeshStandardMaterial(Object.assign({ map, roughness: 0.4, metalness: 0, envMap: ENV, envMapIntensity: 0.4 }, o));
  const yuvar = (x, a, b, w, h, r) => { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); };
  // yuzun kenarlarina yumusak isik (ust-sol) ve golge (alt-sag): duz yuz bile hacimli gorunur
  function kenarIsik(x, w, h, guc = 1) {
    let g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,' + 0.2 * guc + ')'); g.addColorStop(0.16, 'rgba(255,255,255,0)'); g.addColorStop(0.8, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,30,' + 0.3 * guc + ')'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(255,255,255,' + 0.1 * guc + ')'); g.addColorStop(Math.min(0.4, 0.14 * h / w), 'rgba(255,255,255,0)'); g.addColorStop(1 - Math.min(0.4, 0.14 * h / w), 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,30,' + 0.2 * guc + ')'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  }

  // ---------------- amblemler (kabartma) ----------------
  const AMB = {
    pati(x, s) { const el = (a, b, rx, ry, rot) => { x.moveTo(a + rx, b); x.ellipse(a, b, rx, ry, rot || 0, 0, 6.2832); }; x.beginPath(); el(0, s * 0.26, s * 0.4, s * 0.31); el(-s * 0.47, -s * 0.12, s * 0.15, s * 0.2, -0.35); el(-s * 0.17, -s * 0.42, s * 0.15, s * 0.21, -0.1); el(s * 0.17, -s * 0.42, s * 0.15, s * 0.21, 0.1); el(s * 0.47, -s * 0.12, s * 0.15, s * 0.2, 0.35); },
    yildiz(x, s) { x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? s * 0.33 : s * 0.68, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(Math.cos(a) * r, Math.sin(a) * r + s * 0.04); } x.closePath(); },
    elmas(x, s) { x.beginPath(); x.moveTo(0, -s * 0.66); x.lineTo(s * 0.52, 0); x.lineTo(0, s * 0.66); x.lineTo(-s * 0.52, 0); x.closePath(); },
    kivilcim(x, s) { x.beginPath(); for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 + i * Math.PI / 2, b = a + Math.PI / 4, c = a + Math.PI / 2; if (!i) x.moveTo(Math.cos(a) * s, Math.sin(a) * s); x.quadraticCurveTo(Math.cos(b) * s * 0.2, Math.sin(b) * s * 0.2, Math.cos(c) * s, Math.sin(c) * s); } x.closePath(); }
  };

  // ---------------- parlak oyuncak kup ----------------
  function oyuncak(renk, amblem) {
    const N = 256, m = N * 0.13, ic = N - 2 * m;
    const map = canvasTex(N, N, (x, w, h) => {
      let g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, acik(renk, 0.05)); g.addColorStop(0.5, renk); g.addColorStop(1, koyu(renk, 0.26)); x.fillStyle = g; x.fillRect(0, 0, w, h);
      kenarIsik(x, w, h, 0.9);
      // ic pano: hafif cukur cerceve (ustte golge, altta isik)
      x.lineJoin = 'round'; x.lineCap = 'round';
      yuvar(x, m, m + 4, ic, ic, N * 0.09); x.strokeStyle = acik(renk, 0.3); x.lineWidth = 6; x.globalAlpha = 0.75; x.stroke(); x.globalAlpha = 1;
      yuvar(x, m, m, ic, ic, N * 0.09); g = x.createLinearGradient(0, m, 0, m + ic); g.addColorStop(0, acik(renk, 0.03)); g.addColorStop(1, koyu(renk, 0.16)); x.fillStyle = g; x.fill();
      x.strokeStyle = koyu(renk, 0.42); x.lineWidth = 8; x.stroke();
      // amblem: kabarik, koyu konturlu, ustunde isik
      x.save(); x.translate(w / 2, h / 2 + 2); const s = N * 0.25;
      x.save(); x.translate(0, 7); AMB[amblem](x, s); x.fillStyle = koyu(renk, 0.4); x.strokeStyle = koyu(renk, 0.4); x.lineWidth = 12; x.stroke(); x.fill(); x.restore();
      AMB[amblem](x, s); x.strokeStyle = koyu(renk, 0.42); x.lineWidth = 12; x.stroke();
      g = x.createLinearGradient(0, -s, 0, s); g.addColorStop(0, acik(renk, 0.26)); g.addColorStop(1, renk); x.fillStyle = g; x.fill();
      x.save(); AMB[amblem](x, s); x.clip(); x.fillStyle = 'rgba(255,255,255,.2)'; x.beginPath(); x.ellipse(-s * 0.2, -s * 0.75, s * 1.1, s * 0.6, -0.3, 0, 6.2832); x.fill(); x.restore();
      x.restore();
      // sol ustte parlama lekesi
      g = x.createRadialGradient(w * 0.2, h * 0.14, 0, w * 0.2, h * 0.14, w * 0.26); g.addColorStop(0, 'rgba(255,255,255,.2)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    });
    const bump = canvasTex(128, 128, (x, w, h) => {
      const k = w / N; x.fillStyle = '#808080'; x.fillRect(0, 0, w, h); x.lineJoin = 'round';
      yuvar(x, m * k, m * k, ic * k, ic * k, N * 0.09 * k); x.fillStyle = '#6c6c6c'; x.fill(); x.strokeStyle = '#3c3c3c'; x.lineWidth = 5; x.stroke();
      x.translate(w / 2, h / 2 + 1); for (const [lw, c] of [[8, '#9a9a9a'], [4, '#c4c4c4'], [0, '#eaeaea']]) { AMB[amblem](x, N * 0.25 * k); x.fillStyle = c; x.strokeStyle = c; if (lw) { x.lineWidth = lw; x.stroke(); } x.fill(); }
    });
    bump.colorSpace = THREE.NoColorSpace;
    const mt = mat(map, { bumpMap: bump, bumpScale: 2.2, roughness: 0.36, envMapIntensity: 0.45, emissive: renk, emissiveIntensity: 0.14 });
    return { geo: kutu(S, S, S, S * 0.13, 3), mat: mt, parca: mat(null, { color: renk, roughness: 0.35 }) };
  }

  // ---------------- tas kiris ----------------
  function tasYuz(wS, hS, amblem, tohum, renk) {
    return canvasTex(Math.round(wS * P), Math.round(hS * P), (x, w, h) => {
      const r = rng(tohum); let g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, acik(renk, 0.12)); g.addColorStop(0.5, renk); g.addColorStop(1, koyu(renk, 0.2)); x.fillStyle = g; x.fillRect(0, 0, w, h);
      // benekler: acik ve koyu yumusak lekeler
      for (let i = 0; i < 26 * wS; i++) { const a = r() * w, b = r() * h, rr = (0.06 + r() * 0.2) * h, li = r() < 0.5; g = x.createRadialGradient(a, b, 0, a, b, rr); g.addColorStop(0, li ? 'rgba(170,196,255,.2)' : 'rgba(20,30,110,.17)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(a - rr, b - rr, rr * 2, rr * 2); }
      // yontulmus duzlemler: genis, kose yapan acik seritler
      x.lineCap = 'round'; x.lineJoin = 'round';
      for (let i = 0; i < 3 * wS; i++) { const a = r() * w, b = r() * h; x.beginPath(); x.moveTo(a, b); x.lineTo(a + (r() - 0.5) * h * 1.3, b + (r() - 0.5) * h * 0.5); x.lineTo(a + (r() - 0.5) * h * 1.3, b + (r() - 0.5) * h * 0.9); x.closePath(); x.fillStyle = r() < 0.5 ? 'rgba(150,180,255,.13)' : 'rgba(15,25,100,.1)'; x.fill(); }
      // catlaklar: koyu cizgi + yaninda ince isik
      for (let i = 0; i < Math.round(2.4 * wS); i++) { let a = r() * w, b = r() < 0.5 ? 0 : h; const yon = b ? -1 : 1, pts = [[a, b]]; for (let s2 = 0, n2 = 2 + Math.floor(r() * 3); s2 < n2; s2++) { a += (r() - 0.5) * h * 0.5; b += yon * h * (0.1 + r() * 0.16); pts.push([a, b]); }
        for (const [dx, dy, st, lw] of [[1.6, 1.8, 'rgba(190,210,255,.5)', 1.6], [0, 0, koyu(renk, 0.52), 2.4]]) { x.beginPath(); pts.forEach(([px, py], n3) => (n3 ? x.lineTo(px + dx, py + dy) : x.moveTo(px + dx, py + dy))); x.strokeStyle = st; x.lineWidth = lw; x.stroke(); } }
      kenarIsik(x, w, h, 1.15);
      if (amblem) {   // altin kivilcim: koyu kontur, altin gecis, beyaz parilti
        x.save(); x.translate(w / 2, h / 2); const s = h * 0.27;
        x.save(); x.translate(2, 5); AMB.kivilcim(x, s); x.fillStyle = 'rgba(10,20,80,.45)'; x.fill(); x.restore();
        AMB.kivilcim(x, s); x.strokeStyle = '#7a4706'; x.lineWidth = 7; x.stroke(); g = x.createLinearGradient(0, -s, 0, s); g.addColorStop(0, '#fff6b8'); g.addColorStop(0.45, '#ffd034'); g.addColorStop(1, '#e58a0c'); x.fillStyle = g; x.fill();
        AMB.kivilcim(x, s * 0.45); x.fillStyle = 'rgba(255,255,255,.75)'; x.fill(); x.restore();
      }
    });
  }
  function tasBump(wS, hS, tohum) {
    const t = canvasTex(Math.round(wS * 64), Math.round(hS * 64), (x, w, h) => { const r = rng(tohum + 7); x.fillStyle = '#808080'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 30 * wS; i++) { const a = r() * w, b = r() * h, rr = (0.08 + r() * 0.2) * h, g = x.createRadialGradient(a, b, 0, a, b, rr); g.addColorStop(0, r() < 0.5 ? 'rgba(255,255,255,.3)' : 'rgba(0,0,0,.3)'); g.addColorStop(1, 'rgba(128,128,128,0)'); x.fillStyle = g; x.fillRect(a - rr, b - rr, rr * 2, rr * 2); } });
    t.colorSpace = THREE.NoColorSpace; return t;
  }
  function tas(wS, tohum) {
    const renk = '#3151cc', o = { roughness: 0.62, envMapIntensity: 0.3, bumpScale: 1.6, emissive: '#2040c0', emissiveIntensity: 0.1 };
    const on = mat(tasYuz(wS, 1, true, tohum, renk), Object.assign({ bumpMap: tasBump(wS, 1, tohum) }, o)), ust = mat(tasYuz(wS, 1, false, tohum + 3, acik(renk, 0.08)), Object.assign({ bumpMap: tasBump(wS, 1, tohum + 3) }, o)), yan = mat(tasYuz(1, 1, false, tohum + 5, renk), Object.assign({ bumpMap: tasBump(1, 1, tohum + 5) }, o));
    return { geo: kutu(wS * S, S, S, S * 0.085, 2), mat: [yan, yan, ust, ust, on, on], parca: yan };
  }

  // ---------------- buz ----------------
  function buzYuz(wS, hS, tohum) {
    return canvasTex(Math.round(wS * P), Math.round(hS * P), (x, w, h) => {
      const r = rng(tohum); let g = x.createLinearGradient(0, 0, w * 0.3, h); g.addColorStop(0, '#36adff'); g.addColorStop(0.5, '#1287f0'); g.addColorStop(1, '#0a5fd4'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      // buzun icindeki bulutlu damarlar
      x.lineCap = 'round'; x.lineJoin = 'round';
      for (let i = 0; i < 5 * wS; i++) { let a = r() * w, b = r() * h; x.beginPath(); x.moveTo(a, b); for (let s2 = 0; s2 < 3; s2++) { const a2 = a + (r() - 0.5) * h * 0.9, b2 = b + (r() - 0.5) * h * 0.9; x.quadraticCurveTo(a + (r() - 0.5) * h * 0.5, b + (r() - 0.5) * h * 0.5, a2, b2); a = a2; b = b2; }
        x.strokeStyle = 'rgba(210,244,255,' + (0.1 + r() * 0.16) + ')'; x.lineWidth = h * (0.03 + r() * 0.07); x.stroke(); x.strokeStyle = 'rgba(255,255,255,' + (0.25 + r() * 0.3) + ')'; x.lineWidth = 1.6 + r() * 1.6; x.stroke(); }
      // capraz parlak yansima seridi
      x.save(); x.beginPath(); x.moveTo(w * 0.04, h * 0.5); x.lineTo(Math.min(w * 0.5, h * 0.5), h * 0.04); x.lineTo(Math.min(w * 0.5, h * 0.5) + h * 0.2, h * 0.04); x.lineTo(w * 0.04, h * 0.74); x.closePath(); x.fillStyle = 'rgba(255,255,255,.16)'; x.fill(); x.restore();
      // kiragi kenar
      x.strokeStyle = 'rgba(200,238,255,.4)'; x.lineWidth = h * 0.045; x.strokeRect(0, 0, w, h);
      kenarIsik(x, w, h, 1);
      for (let i = 0; i < 8 * wS; i++) { x.fillStyle = 'rgba(255,255,255,' + (0.3 + r() * 0.5) + ')'; x.beginPath(); x.arc(r() * w, r() * h, 0.8 + r() * 2, 0, 6.2832); x.fill(); }
    });
  }
  function buz(wS, tohum) {
    const o = { roughness: 0.14, envMapIntensity: 0.7, emissive: '#0a54d0', emissiveIntensity: 0.3 };
    const on = mat(buzYuz(wS, 1, tohum), o), yan = wS === 1 ? on : mat(buzYuz(1, 1, tohum + 2), o);
    return { geo: kutu(wS * S, S, S, S * 0.11, 3), mat: wS === 1 ? on : [yan, yan, on, on, on, on], parca: yan };
  }

  // ---------------- ahsap dikme (iki kat boyunda) ----------------
  function ahsap() {
    const renk = '#ee8a14';
    const yan = canvasTex(P, 2 * P, (x, w, h) => {
      const r = rng(41); let g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, acik(renk, 0.1)); g.addColorStop(0.5, renk); g.addColorStop(1, koyu(renk, 0.12)); x.fillStyle = g; x.fillRect(0, 0, w, h);
      // damarlar: dalgali dikey cizgiler, birkac budak
      for (let i = 0; i < 15; i++) { const a0 = (i + 0.5) / 15 * w + (r() - 0.5) * 6, ph = r() * 6, am = 2 + r() * 4; x.beginPath(); for (let b = 0; b <= h; b += 8) { const a = a0 + Math.sin(b / 46 + ph) * am; b ? x.lineTo(a, b) : x.moveTo(a, b); } x.strokeStyle = r() < 0.3 ? 'rgba(255,214,140,.5)' : 'rgba(150,70,8,' + (0.25 + r() * 0.3) + ')'; x.lineWidth = 1.2 + r() * 2.6; x.stroke(); }
      for (const [a, b] of [[w * 0.32, h * 0.27], [w * 0.68, h * 0.7]]) for (let k = 3; k >= 0; k--) { x.beginPath(); x.ellipse(a, b, 5 + k * 5, 9 + k * 8, 0, 0, 6.2832); x.strokeStyle = 'rgba(140,62,6,' + (0.55 - k * 0.1) + ')'; x.lineWidth = 2; x.stroke(); if (!k) { x.fillStyle = 'rgba(140,62,6,.6)'; x.fill(); } }
      kenarIsik(x, w, h, 1.1);
    });
    const ust = canvasTex(P, P, (x, w, h) => { x.fillStyle = acik(renk, 0.22); x.fillRect(0, 0, w, h); for (let k = 9; k > 0; k--) { x.beginPath(); x.ellipse(w * 0.52, h * 0.48, k * w * 0.075, k * h * 0.07, 0.3, 0, 6.2832); x.strokeStyle = 'rgba(170,84,12,.45)'; x.lineWidth = 2.2; x.stroke(); } kenarIsik(x, w, h, 0.9); });
    const o = { roughness: 0.55, envMapIntensity: 0.3, emissive: '#e07000', emissiveIntensity: 0.08 }, my = mat(yan, o), mu = mat(ust, o);
    return { geo: kutu(S * 0.98, 2 * S, S * 0.98, S * 0.08, 2), mat: [my, my, mu, mu, my, my], parca: mat(null, { color: renk, roughness: 0.6 }) };
  }

  // ---------------- mermer sutun tamburu ----------------
  function mermer() {
    const R = S * 0.47, y0 = -S / 2, pv = (y) => 0.1 + 0.8 * (y - y0) / S;
    const ys = [0, 0.09, 0.115, 0.15, 0.185, 0.21, 0.79, 0.815, 0.85, 0.885, 0.91, 1], rs = [1, 1, 0.9, 0.98, 0.9, 0.82, 0.82, 0.9, 0.98, 0.9, 1, 1];
    const prof = [[0, y0, 0.02]].concat(ys.map((t, i) => [R * rs[i], y0 + t * S, pv(y0 + t * S)]), [[0, y0 + S, 0.98]]);
    const map = canvasTex(512, 256, (x, w, h) => {
      const r = rng(77), Y = (t) => h * (1 - (0.1 + 0.8 * t)); x.fillStyle = '#f6efe2'; x.fillRect(0, 0, w, h);
      let g = x.createLinearGradient(0, Y(1), 0, Y(0)); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#e2d6c2'); x.fillStyle = g; x.fillRect(0, Y(1), w, Y(0) - Y(1));
      // mermer damarlari
      x.lineCap = 'round'; for (let i = 0; i < 12; i++) { let a = r() * w, b = Y(1) + r() * (Y(0) - Y(1)); x.beginPath(); x.moveTo(a, b); for (let s2 = 0; s2 < 4; s2++) { a += (r() - 0.3) * 50; b += (r() - 0.5) * 40; x.lineTo(a, b); } x.strokeStyle = 'rgba(150,140,130,' + (0.15 + r() * 0.2) + ')'; x.lineWidth = 1 + r() * 2; x.stroke(); }
      // govdede oyma oluklar (8 adet): ic golge + alt isik
      const a0 = Y(0.74), a1 = Y(0.26); for (let i = 0; i < 8; i++) { const cx = (i + 0.5) / 8 * w, ww = w / 8 * 0.42;
        yuvar(x, cx - ww / 2 + 1.5, a0 + 3, ww, a1 - a0, ww / 2); x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = 3; x.stroke();
        yuvar(x, cx - ww / 2, a0, ww, a1 - a0, ww / 2); g = x.createLinearGradient(cx - ww / 2, 0, cx + ww / 2, 0); g.addColorStop(0, '#b9ab95'); g.addColorStop(0.5, '#e6dccb'); g.addColorStop(1, '#d2c6b2'); x.fillStyle = g; x.fill(); x.strokeStyle = '#a89a84'; x.lineWidth = 2.5; x.stroke(); }
      // altin bilezikler (profildeki iki cikinti)
      for (const [t0, t1] of [[0.1, 0.2], [0.8, 0.9]]) { const b0 = Y(t1), b1 = Y(t0); g = x.createLinearGradient(0, b0, 0, b1); g.addColorStop(0, '#fff3a6'); g.addColorStop(0.4, '#ffcf30'); g.addColorStop(1, '#d98a10'); x.fillStyle = g; x.fillRect(0, b0, w, b1 - b0); x.fillStyle = 'rgba(120,70,0,.5)'; x.fillRect(0, b1 - 2, w, 2.5); x.fillRect(0, b0 - 1, w, 2); }
      // alt ve ust tabla golgesi
      x.fillStyle = 'rgba(120,100,80,.18)'; x.fillRect(0, Y(0.09), w, Y(0) - Y(0.09));
    });
    return { geo: torna(prof, 28), mat: mat(map, { roughness: 0.34, envMapIntensity: 0.5 }), parca: mat(null, { color: '#f1e8d8', roughness: 0.4 }) };
  }

  // ---------------- seker kavanozu (iki kat boyunda) ----------------
  function kavanoz(renk) {
    const R = S * 0.46, H = 2 * S, y0 = -S, T = (y) => y / H;   // y: tabandan yukseklik
    const pr = [[0, 0], [0.8, 0], [0.95, 0.05 * S], [1, 0.14 * S], [1, 1.36 * S], [0.97, 1.48 * S], [0.86, 1.58 * S], [0.76, 1.63 * S], [0.76, 1.66 * S], [0.9, 1.67 * S], [0.92, 1.72 * S], [0.92, 1.9 * S], [0.86, 1.97 * S], [0.7, 2 * S], [0, 2 * S]];
    const prof = pr.map(([r, y]) => [R * r, y0 + y, T(y)]); prof[0][2] = 0.001; prof[prof.length - 1][2] = 0.999;
    const map = canvasTex(512, 512, (x, w, h) => {
      const Y = (y) => h * (1 - T(y)), kap = Y(1.665 * S);
      let g = x.createLinearGradient(0, kap, 0, h); g.addColorStop(0, acik(renk, 0.1)); g.addColorStop(0.25, renk); g.addColorStop(1, koyu(renk, 0.25)); x.fillStyle = g; x.fillRect(0, 0, w, h);
      // govdede dikey parlak yansimalar (cam hissi)
      for (const [u, ww, a] of [[0.12, 0.045, 0.5], [0.2, 0.016, 0.34], [0.62, 0.035, 0.22], [0.9, 0.012, 0.2]]) { g = x.createLinearGradient((u - ww) * w, 0, (u + ww) * w, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,' + a + ')'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; yuvar(x, (u - ww) * w, Y(1.3 * S), 2 * ww * w, Y(0.2 * S) - Y(1.3 * S), ww * w); x.fill(); }
      // omuz isigi ve dip golgesi
      g = x.createLinearGradient(0, Y(1.62 * S), 0, Y(1.3 * S)); g.addColorStop(0, 'rgba(255,255,255,.3)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, Y(1.62 * S), w, Y(1.3 * S) - Y(1.62 * S));
      g = x.createLinearGradient(0, Y(0.3 * S), 0, h); g.addColorStop(0, 'rgba(0,0,40,0)'); g.addColorStop(1, 'rgba(0,0,40,.3)'); x.fillStyle = g; x.fillRect(0, Y(0.3 * S), w, h);
      // kapak: beyaz - renkli dikey cizgiler, ustu acik
      const k0 = Y(1.9 * S), kr = koyu(renk, 0.12); for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#ffffff' : kr; x.fillRect(i / 16 * w, 0, w / 16 + 1, kap); }
      g = x.createLinearGradient(0, 0, 0, k0); g.addColorStop(0, acik(renk, 0.55)); g.addColorStop(1, acik(renk, 0.3)); x.fillStyle = g; x.fillRect(0, 0, w, k0 - 6);
      g = x.createLinearGradient(0, k0 - 6, 0, kap); g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(0.3, 'rgba(255,255,255,0)'); g.addColorStop(0.75, 'rgba(0,0,40,0)'); g.addColorStop(1, 'rgba(0,0,40,.28)'); x.fillStyle = g; x.fillRect(0, k0 - 6, w, kap - k0 + 6);
    });
    return { geo: torna(prof, 28), mat: mat(map, { roughness: 0.2, envMapIntensity: 0.65, emissive: renk, emissiveIntensity: 0.16 }), parca: mat(null, { color: renk, roughness: 0.2, envMapIntensity: 1.1 }) };
  }

  // ---------------- raf tahtasi (yarim kat) ve dalgali tambur ----------------
  const RAFR = '#6384ee', RAFA = '#c9dcff', RAFK = '#2f5fe0';
  const dalgaCiz = (x, a0, a1, b, am, n, lw, st) => { x.beginPath(); for (let i = 0; i <= 40; i++) { const t = i / 40, a = a0 + (a1 - a0) * t, bb = b + Math.sin(t * n * 6.2832) * am; i ? x.lineTo(a, bb) : x.moveTo(a, bb); } x.strokeStyle = st; x.lineWidth = lw; x.lineCap = 'round'; x.stroke(); };
  function rafYuz(wS, hS) {
    return canvasTex(Math.round(wS * P), Math.round(hS * P), (x, w, h) => {
      let g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, acik(RAFR, 0.14)); g.addColorStop(1, koyu(RAFR, 0.1)); x.fillStyle = g; x.fillRect(0, 0, w, h);
      // iki ucta acik bant, icinde dikey dalga susu
      const bw = Math.min(P * 0.42, w * 0.3); for (const a of [0, w - bw]) { x.fillStyle = RAFA; x.fillRect(a, 0, bw, h); x.save(); x.translate(a + bw / 2, 0); x.rotate(Math.PI / 2); dalgaCiz(x, h * 0.08, h * 0.92, 0, bw * 0.17, Math.max(1, Math.round(h / P * 2.5)), bw * 0.13, RAFK); x.restore();
        x.fillStyle = 'rgba(40,70,170,.35)'; x.fillRect(a ? a - 2 : bw - 1, 0, 3, h); }
      kenarIsik(x, w, h, 1.1);
    });
  }
  function raf(wS) {
    const o = { roughness: 0.34, envMapIntensity: 0.45 }, on = mat(rafYuz(wS, 0.5), o), ust = mat(rafYuz(wS, 1), o), yan = mat(canvasTex(P, P / 2, (x, w, h) => { x.fillStyle = RAFA; x.fillRect(0, 0, w, h); kenarIsik(x, w, h, 1); }), o);
    return { geo: kutu(wS * S, S * 0.5, S, S * 0.09, 2), mat: [yan, yan, ust, ust, on, on], parca: mat(null, { color: RAFR, roughness: 0.35 }) };
  }
  function dalga(hS = 1) {
    const R = S * 0.47, HH = hS * S, y0 = -HH / 2, pv = (y) => 0.1 + 0.8 * (y - y0) / HH;
    const prof = [[0, y0, 0.02], [R * 0.9, y0, 0.1], [R, y0 + S * 0.06, pv(y0 + S * 0.06)], [R, y0 + HH - S * 0.06, pv(y0 + HH - S * 0.06)], [R * 0.9, y0 + HH, 0.9], [0, y0 + HH, 0.98]];
    if (hS < 1) {   // yarim tambur (disk): beyaz govde, ortada mavi dalga
      const map = canvasTex(512, 128, (x, w, h) => { x.fillStyle = '#eef5ff'; x.fillRect(0, 0, w, h); const g = x.createLinearGradient(0, 0, w, 0); for (let i = 0; i <= 8; i++) g.addColorStop(i / 8, i % 2 ? 'rgba(255,255,255,.5)' : 'rgba(120,150,230,.22)'); x.fillStyle = g; x.fillRect(0, h * 0.1, w, h * 0.8); dalgaCiz(x, 0, w, h * 0.5, h * 0.12, 8, 9, RAFK); });
      return { geo: torna(prof, 28), mat: mat(map, { roughness: 0.3, metalness: 0.1, envMapIntensity: 0.6 }), parca: mat(null, { color: RAFA, roughness: 0.3 }) };
    }
    const map = canvasTex(512, 256, (x, w, h) => {
      const Y = (t) => h * (1 - (0.1 + 0.8 * t)); x.fillStyle = acik(RAFR, 0.2); x.fillRect(0, 0, w, h);
      // silindirin cevresinde acik-koyu parlak seritler (saten metal hissi)
      let g = x.createLinearGradient(0, 0, w, 0); for (let i = 0; i <= 8; i++) g.addColorStop(i / 8, i % 2 ? acik(RAFR, 0.3) : koyu(RAFR, 0.1)); x.fillStyle = g; x.fillRect(0, Y(1), w, Y(0) - Y(1));
      // ustte ve altta beyaz dalga bandi, ortada mavi dalga
      for (const [t, yon] of [[1, 1], [0, -1]]) { x.beginPath(); x.moveTo(0, Y(t)); for (let i = 0; i <= 80; i++) { const u = i / 80; x.lineTo(u * w, Y(t) + yon * h * (0.14 + 0.05 * Math.sin(u * 8 * 6.2832))); } x.lineTo(w, Y(t)); x.closePath(); x.fillStyle = '#dfeaff'; x.fill(); dalgaCiz(x, 0, w, Y(t) + yon * h * 0.14, h * 0.05, 8, 5, RAFK); }
      dalgaCiz(x, 0, w, Y(0.5), h * 0.07, 4, 15, 'rgba(40,84,214,.6)'); dalgaCiz(x, 0, w, Y(0.5) - 3, h * 0.07, 4, 4, 'rgba(255,255,255,.65)');
    });
    return { geo: torna(prof, 28), mat: mat(map, { roughness: 0.3, metalness: 0.1, envMapIntensity: 0.6 }), parca: mat(null, { color: RAFR, roughness: 0.3 }) };
  }

  // ================= v3.11 (Adem 11 Kas): yeni sekil cesitleri, ayni boyama yontemiyle =================
  // ---------------- jole kup: yari saydam, ici parlayan, ustu seker serpintili ----------------
  function jole(renk) {
    const N = 256;
    const map = canvasTex(N, N, (x, w, h) => {
      const r = rng(renk.length * 31 + 7);
      let g = x.createRadialGradient(w * 0.42, h * 0.38, 0, w / 2, h / 2, w * 0.75); g.addColorStop(0, acik(renk, 0.35)); g.addColorStop(0.55, renk); g.addColorStop(1, koyu(renk, 0.3)); x.fillStyle = g; x.fillRect(0, 0, w, h);
      // icteki kabarciklar
      for (let i = 0; i < 9; i++) { const a = w * (0.15 + r() * 0.7), b = h * (0.2 + r() * 0.65), rr = 4 + r() * 9; g = x.createRadialGradient(a - rr * 0.3, b - rr * 0.3, 0, a, b, rr); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(0.6, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.beginPath(); x.arc(a, b, rr, 0, 6.2832); x.fill(); }
      // seker serpintisi (kucuk beyaz kristaller)
      for (let i = 0; i < 70; i++) { const a = r() * w, b = r() * h; x.fillStyle = 'rgba(255,255,255,' + (0.35 + r() * 0.5) + ')'; x.save(); x.translate(a, b); x.rotate(r() * 3); x.fillRect(-1.5, -1.5, 3, 3); x.restore(); }
      kenarIsik(x, w, h, 0.8);
      // buyuk kavisli parlama
      x.save(); x.beginPath(); x.ellipse(w * 0.3, h * 0.22, w * 0.2, h * 0.08, -0.5, 0, 6.2832); x.fillStyle = 'rgba(255,255,255,.5)'; x.fill(); x.restore();
    });
    return { geo: kutu(S * 0.97, S * 0.97, S * 0.97, S * 0.2, 3), mat: mat(map, { roughness: 0.08, envMapIntensity: 0.9, transparent: true, opacity: 0.93, emissive: renk, emissiveIntensity: 0.3 }), parca: mat(null, { color: renk, roughness: 0.1, transparent: true, opacity: 0.9, emissive: renk, emissiveIntensity: 0.25 }) };
  }

  // ---------------- hediye kutusu: puantiyeli kagit, capraz kurdele ----------------
  function hediye(renk, kur) {
    const yuz = (ust) => canvasTex(P, P, (x, w, h) => {
      let g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, acik(renk, 0.08)); g.addColorStop(1, koyu(renk, 0.2)); x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.fillStyle = 'rgba(255,255,255,.22)'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.beginPath(); x.arc((i + 0.5 + (j % 2) * 0.5) / 4 * w, (j + 0.5) / 4 * h, w * 0.035, 0, 6.2832); x.fill(); }
      const band = (dik) => { const bw = w * 0.2; x.save(); if (!dik) { x.translate(w / 2, h / 2); x.rotate(Math.PI / 2); x.translate(-w / 2, -h / 2); }
        g = x.createLinearGradient(w / 2 - bw / 2, 0, w / 2 + bw / 2, 0); g.addColorStop(0, koyu(kur, 0.25)); g.addColorStop(0.3, acik(kur, 0.25)); g.addColorStop(0.55, kur); g.addColorStop(1, koyu(kur, 0.3)); x.fillStyle = g; x.fillRect(w / 2 - bw / 2, 0, bw, h);
        x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(w / 2 - bw / 2 - 2, 0, 2, h); x.fillRect(w / 2 + bw / 2, 0, 2, h); x.restore(); };
      band(true); if (ust) { band(false);
        // fiyonk: iki ilmek ve dugum
        x.save(); x.translate(w / 2, h / 2); for (const sg of [-1, 1]) { x.beginPath(); x.ellipse(sg * w * 0.16, -h * 0.02, w * 0.17, h * 0.1, sg * 0.5, 0, 6.2832); g = x.createLinearGradient(0, -h * 0.12, 0, h * 0.1); g.addColorStop(0, acik(kur, 0.35)); g.addColorStop(1, koyu(kur, 0.2)); x.fillStyle = g; x.fill(); x.strokeStyle = koyu(kur, 0.4); x.lineWidth = 3; x.stroke(); }
        x.beginPath(); x.arc(0, 0, w * 0.07, 0, 6.2832); x.fillStyle = acik(kur, 0.15); x.fill(); x.stroke(); x.restore(); }
      kenarIsik(x, w, h, 1);
    });
    const o = { roughness: 0.38, envMapIntensity: 0.45, emissive: renk, emissiveIntensity: 0.08 }, yan = mat(yuz(false), o), ust = mat(yuz(true), o);
    return { geo: kutu(S, S, S, S * 0.07, 2), mat: [yan, yan, ust, ust, yan, yan], parca: mat(null, { color: renk, roughness: 0.4 }) };
  }

  // ---------------- cikolata kiris: kabarik kareler, uclari altin yaldiz ----------------
  function cikolata(wS) {
    const renk = '#6a3414';
    const yuz = (hS, kare) => canvasTex(Math.round(wS * P), Math.round(hS * P), (x, w, h) => {
      x.fillStyle = koyu(renk, 0.2); x.fillRect(0, 0, w, h);
      const n = kare ? wS * 2 : 1, m = kare ? Math.max(1, Math.round(hS * 2)) : 1, cw = w / n, ch = h / m, b = Math.min(cw, ch) * 0.12;
      for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { const a = i * cw + 3, c = j * ch + 3, ww = cw - 6, hh = ch - 6;
        let g = x.createLinearGradient(a, c, a + ww, c + hh); g.addColorStop(0, acik(renk, 0.22)); g.addColorStop(0.5, renk); g.addColorStop(1, koyu(renk, 0.25)); x.fillStyle = g; yuvar(x, a, c, ww, hh, b); x.fill();
        g = x.createLinearGradient(a, c, a, c + hh); g.addColorStop(0, 'rgba(255,220,180,.25)'); g.addColorStop(0.2, 'rgba(255,220,180,0)'); x.fillStyle = g; yuvar(x, a + b, c + b, ww - 2 * b, hh - 2 * b, b); x.fill(); }
      // iki ucta altin yaldiz kagidi
      for (const a of [0, w - P * 0.22]) { const g = x.createLinearGradient(a, 0, a + P * 0.22, 0); g.addColorStop(0, '#c98a10'); g.addColorStop(0.4, '#ffe58a'); g.addColorStop(1, '#d99a18'); x.fillStyle = g; x.fillRect(a, 0, P * 0.22, h);
        x.strokeStyle = 'rgba(120,70,0,.35)'; x.lineWidth = 1.2; for (let y = 4; y < h; y += 7) { x.beginPath(); x.moveTo(a, y); x.lineTo(a + P * 0.22, y + 3); x.stroke(); } }
      kenarIsik(x, w, h, 0.9);
    });
    const bump = canvasTex(wS * 64, 64, (x, w, h) => { x.fillStyle = '#5a5a5a'; x.fillRect(0, 0, w, h); const n = wS * 2, cw = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) { x.fillStyle = '#a8a8a8'; yuvar(x, i * cw + 3, j * h / 2 + 3, cw - 6, h / 2 - 6, 4); x.fill(); } });
    bump.colorSpace = THREE.NoColorSpace;
    const o = { roughness: 0.3, envMapIntensity: 0.5 }, on = mat(yuz(1, true), Object.assign({ bumpMap: bump, bumpScale: 2 }, o)), ust = mat(yuz(1, true), o), yan = mat(canvasTex(P, P, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#c98a10'); g.addColorStop(0.5, '#ffe58a'); g.addColorStop(1, '#d99a18'); x.fillStyle = g; x.fillRect(0, 0, w, h); kenarIsik(x, w, h, 1); }), { roughness: 0.25, metalness: 0.5, envMapIntensity: 0.9 });
    return { geo: kutu(wS * S, S, S, S * 0.07, 2), mat: [yan, yan, ust, ust, on, on], parca: mat(null, { color: renk, roughness: 0.35 }) };
  }

  // ---------------- tugla kiris: harcli kirmizi tuglalar ----------------
  function tugla(wS, tohum) {
    const yuz = (ww, hh, t) => canvasTex(Math.round(ww * P), Math.round(hh * P), (x, w, h) => {
      const r = rng(t); x.fillStyle = '#f2dfc0'; x.fillRect(0, 0, w, h);
      const sat = 3, sh = h / sat, tw = P * 0.5;
      for (let j = 0; j < sat; j++) for (let a = -(j % 2) * tw / 2; a < w; a += tw) { const ton = ['#c8402a', '#d24e30', '#b83a24', '#dc5a36'][Math.floor(r() * 4)], c = j * sh + 2.5, bb = Math.max(a + 2.5, 0);
        let g = x.createLinearGradient(0, c, 0, c + sh - 5); g.addColorStop(0, acik(ton, 0.15)); g.addColorStop(1, koyu(ton, 0.18)); x.fillStyle = g; yuvar(x, bb, c, Math.min(a + tw - 2.5, w) - bb, sh - 5, 4); x.fill();
        for (let k = 0; k < 6; k++) { x.fillStyle = r() < 0.5 ? 'rgba(255,200,170,.18)' : 'rgba(80,10,0,.16)'; x.beginPath(); x.arc(bb + r() * (tw - 5), c + r() * (sh - 5), 1 + r() * 2.5, 0, 6.2832); x.fill(); } }
      kenarIsik(x, w, h, 1.1);
    });
    const bump = canvasTex(wS * 64, 64, (x, w, h) => { x.fillStyle = '#404040'; x.fillRect(0, 0, w, h); const sh = h / 3, tw = 32; for (let j = 0; j < 3; j++) for (let a = -(j % 2) * tw / 2; a < w; a += tw) { x.fillStyle = '#b0b0b0'; x.fillRect(Math.max(a + 1.5, 0), j * sh + 1.5, tw - 3, sh - 3); } });
    bump.colorSpace = THREE.NoColorSpace;
    const o = { roughness: 0.75, envMapIntensity: 0.25, bumpMap: bump, bumpScale: 2.4 }, on = mat(yuz(wS, 1, tohum), o), yan = mat(yuz(1, 1, tohum + 4), Object.assign({}, o, { bumpMap: null }));
    return { geo: kutu(wS * S, S, S, S * 0.05, 2), mat: [yan, yan, on, on, on, on], parca: mat(null, { color: '#c8402a', roughness: 0.8 }) };
  }

  // ---------------- kristal kup: yuzlu mucevher, parilti ----------------
  function kristal(renk) {
    const map = canvasTex(256, 256, (x, w, h) => {
      const cx = w / 2, cy = h / 2, R0 = w * 0.2, R1 = w * 0.5, n = 8;
      x.fillStyle = koyu(renk, 0.3); x.fillRect(0, 0, w, h);
      for (let i = 0; i < n; i++) { const a0 = i / n * 6.2832 + 0.39, a1 = (i + 1) / n * 6.2832 + 0.39, isik = 0.5 + 0.5 * Math.cos(a0 + 2.3);
        x.beginPath(); x.moveTo(cx + Math.cos(a0) * R0, cy + Math.sin(a0) * R0); x.lineTo(cx + Math.cos(a0) * R1 * 1.5, cy + Math.sin(a0) * R1 * 1.5); x.lineTo(cx + Math.cos(a1) * R1 * 1.5, cy + Math.sin(a1) * R1 * 1.5); x.lineTo(cx + Math.cos(a1) * R0, cy + Math.sin(a1) * R0); x.closePath();
        x.fillStyle = mix(koyu(renk, 0.25), acik(renk, 0.45), isik); x.fill(); x.strokeStyle = acik(renk, 0.55); x.lineWidth = 2; x.stroke(); }
      x.beginPath(); for (let i = 0; i < n; i++) { const a = i / n * 6.2832 + 0.39; x.lineTo(cx + Math.cos(a) * R0, cy + Math.sin(a) * R0); } x.closePath();
      const g = x.createLinearGradient(cx - R0, cy - R0, cx + R0, cy + R0); g.addColorStop(0, acik(renk, 0.6)); g.addColorStop(1, renk); x.fillStyle = g; x.fill(); x.strokeStyle = '#ffffff'; x.lineWidth = 2.5; x.stroke();
      x.save(); x.translate(w * 0.3, h * 0.28); AMB.kivilcim(x, w * 0.09); x.fillStyle = 'rgba(255,255,255,.9)'; x.fill(); x.restore();
      x.save(); x.translate(w * 0.72, h * 0.7); AMB.kivilcim(x, w * 0.05); x.fillStyle = 'rgba(255,255,255,.7)'; x.fill(); x.restore();
      kenarIsik(x, w, h, 0.7);
    });
    return { geo: kutu(S, S, S, S * 0.1, 2), mat: mat(map, { roughness: 0.08, metalness: 0.15, envMapIntensity: 1.1, emissive: renk, emissiveIntensity: 0.3 }), parca: mat(null, { color: renk, roughness: 0.08, envMapIntensity: 1.2, emissive: renk, emissiveIntensity: 0.25 }) };
  }

  // ---------------- kurabiye (yarim kat disk): citir kenar, damla cikolatalar ----------------
  function kurabiye() {
    const R = S * 0.47, HH = S * 0.5, y0 = -HH / 2, pv = (y) => 0.1 + 0.8 * (y - y0) / HH;
    const prof = [[0, y0, 0.02], [R * 0.86, y0, 0.08], [R * 0.98, y0 + HH * 0.18, pv(y0 + HH * 0.18)], [R, y0 + HH * 0.5, pv(y0 + HH * 0.5)], [R * 0.95, y0 + HH * 0.85, pv(y0 + HH * 0.85)], [R * 0.78, y0 + HH, 0.93], [R * 0.4, y0 + HH * 1.04, 0.97], [0, y0 + HH * 1.05, 0.99]];
    const map = canvasTex(512, 256, (x, w, h) => {
      const r = rng(99); let g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f0b464'); g.addColorStop(0.5, '#d88c3c'); g.addColorStop(1, '#a8601e'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 140; i++) { x.fillStyle = r() < 0.5 ? 'rgba(255,230,170,.25)' : 'rgba(120,60,10,.22)'; x.beginPath(); x.arc(r() * w, r() * h, 1 + r() * 3, 0, 6.2832); x.fill(); }
      for (let i = 0; i < 26; i++) { const a = r() * w, b = h * (0.05 + r() * 0.75), rr = 5 + r() * 6; g = x.createRadialGradient(a - 2, b - 2, 0, a, b, rr); g.addColorStop(0, '#7a4020'); g.addColorStop(0.6, '#3a1806'); g.addColorStop(1, '#2a1004'); x.fillStyle = g; x.beginPath(); x.ellipse(a, b, rr * 1.2, rr, r(), 0, 6.2832); x.fill(); }
    });
    return { geo: torna(prof, 30), mat: mat(map, { roughness: 0.7, envMapIntensity: 0.25 }), parca: mat(null, { color: '#d88c3c', roughness: 0.8 }) };
  }

  // ---------------- makaron (yarim kat): iki kabuk, arada krema, kenarda tirtikli etek ----------------
  function makaron(renk) {
    const R = S * 0.46, HH = S * 0.5, y0 = -HH / 2, pv = (y) => 0.1 + 0.8 * (y - y0) / HH;
    const ys = [[0, 0.82], [0.02, 0.95], [0.1, 1], [0.2, 0.96], [0.26, 0.98], [0.32, 0.9], [0.4, 0.86], [0.6, 0.86], [0.68, 0.9], [0.74, 0.98], [0.8, 0.96], [0.9, 1], [0.98, 0.95], [1, 0.82]];
    const prof = [[0, y0, 0.02]].concat(ys.map(([t, k]) => [R * k, y0 + t * HH, pv(y0 + t * HH)]), [[R * 0.5, y0 + HH * 1.03, 0.95], [0, y0 + HH * 1.04, 0.99]]);
    const map = canvasTex(512, 256, (x, w, h) => {
      const Y = (t) => h * (1 - (0.1 + 0.8 * t)), r = rng(renk.length * 13);
      x.fillStyle = renk; x.fillRect(0, 0, w, h);
      for (const [t0, t1] of [[0, 0.32], [0.68, 1.04]]) { const g = x.createLinearGradient(0, Y(t1), 0, Y(t0)); g.addColorStop(0, acik(renk, 0.3)); g.addColorStop(0.6, renk); g.addColorStop(1, koyu(renk, 0.12)); x.fillStyle = g; x.fillRect(0, Y(t1) - 30, w, Y(t0) - Y(t1) + 30); }
      // etek (tirtikli ayak): kucuk benekler
      for (const [t0, t1] of [[0.2, 0.32], [0.68, 0.8]]) for (let i = 0; i < 160; i++) { x.fillStyle = r() < 0.5 ? acik(renk, 0.35) : koyu(renk, 0.15); x.beginPath(); x.arc(r() * w, Y(t0 + r() * (t1 - t0)), 1.5 + r() * 2, 0, 6.2832); x.fill(); }
      // krema
      const g = x.createLinearGradient(0, Y(0.62), 0, Y(0.38)); g.addColorStop(0, '#fffaf2'); g.addColorStop(0.5, '#fff0dc'); g.addColorStop(1, '#ead6bc'); x.fillStyle = g; x.fillRect(0, Y(0.62), w, Y(0.38) - Y(0.62));
      x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(0, Y(0.95), w, 6);
    });
    return { geo: torna(prof, 30), mat: mat(map, { roughness: 0.55, envMapIntensity: 0.35, emissive: renk, emissiveIntensity: 0.08 }), parca: mat(null, { color: renk, roughness: 0.55 }) };
  }

  // ---------------- konserve kutusu: parlak teneke, renkli etiket ----------------
  function konserve(renk) {
    const R = S * 0.45, y0 = -S / 2, pv = (y) => 0.1 + 0.8 * (y - y0) / S;
    const ys = [[0, 0.9], [0.02, 1], [0.06, 1], [0.08, 0.96], [0.12, 0.98], [0.88, 0.98], [0.92, 0.96], [0.94, 1], [0.98, 1], [1, 0.9]];
    const prof = [[0, y0 + 0.01 * S, 0.02]].concat(ys.map(([t, k]) => [R * k, y0 + t * S, pv(y0 + t * S)]), [[R * 0.88, y0 + S * 0.985, 0.93], [0, y0 + S * 0.985, 0.99]]);
    const map = canvasTex(512, 256, (x, w, h) => {
      const Y = (t) => h * (1 - (0.1 + 0.8 * t));
      let g = x.createLinearGradient(0, 0, w, 0); for (let i = 0; i <= 10; i++) g.addColorStop(i / 10, i % 2 ? '#f4f6fa' : '#9aa2b2'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      // etiket
      const e0 = Y(0.86), e1 = Y(0.14); g = x.createLinearGradient(0, e0, 0, e1); g.addColorStop(0, acik(renk, 0.15)); g.addColorStop(1, koyu(renk, 0.15)); x.fillStyle = g; x.fillRect(0, e0, w, e1 - e0);
      x.fillStyle = '#ffffff'; x.fillRect(0, e0 + (e1 - e0) * 0.12, w, 5); x.fillRect(0, e1 - (e1 - e0) * 0.12 - 5, w, 5);
      for (let i = 0; i < 4; i++) { x.save(); x.translate((i + 0.5) / 4 * w, (e0 + e1) / 2); const s2 = (e1 - e0) * 0.26; AMB.yildiz(x, s2); x.fillStyle = '#ffd23f'; x.fill(); x.strokeStyle = koyu(renk, 0.4); x.lineWidth = 3; x.stroke(); x.restore(); }
      g = x.createLinearGradient(0, 0, w, 0); for (let i = 0; i <= 10; i++) g.addColorStop(i / 10, i % 2 ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.08)'); x.fillStyle = g; x.fillRect(0, e0, w, e1 - e0);
    });
    return { geo: torna(prof, 30), mat: mat(map, { roughness: 0.22, metalness: 0.45, envMapIntensity: 0.9 }), parca: mat(null, { color: '#c8ccd6', roughness: 0.25, metalness: 0.6 }) };
  }

  // ---------------- tur tablosu ----------------
  // sekil: 'kutu' (dikdortgen carpisma) ya da 'sil' (dik silindir). kir: topla vurulunca / sert carpinca kirilir. ses: darbe sesi ailesi.
  const TUR = {
    oyK: { w: 1, h: 1, d: 1, mass: 0.85, f: 0.6, r: 0.14, ses: 'tahta', renk: '#f0323c', kir: 1, yuzer: 1, yap: () => oyuncak('#dc1420', 'pati') },
    oyY: { w: 1, h: 1, d: 1, mass: 0.85, f: 0.6, r: 0.14, ses: 'tahta', renk: '#22c244', kir: 1, yuzer: 1, yap: () => oyuncak('#10a52c', 'yildiz') },
    oyM: { w: 1, h: 1, d: 1, mass: 0.85, f: 0.6, r: 0.14, ses: 'tahta', renk: '#2f7df2', kir: 1, yuzer: 1, yap: () => oyuncak('#1a58e2', 'elmas') },
    oyS: { w: 1, h: 1, d: 1, mass: 0.85, f: 0.6, r: 0.14, ses: 'tahta', renk: '#ffc21f', kir: 1, yuzer: 1, yap: () => oyuncak('#f2a300', 'yildiz') },
    oyP: { w: 1, h: 1, d: 1, mass: 0.85, f: 0.6, r: 0.14, ses: 'tahta', renk: '#a04cf0', kir: 1, yuzer: 1, yap: () => oyuncak('#8526dc', 'elmas') },
    tas2: { w: 2, h: 1, d: 1, mass: 1.7, f: 0.7, r: 0.06, ses: 'tas', renk: '#4a6cdb', sert: 1, yap: () => tas(2, 11) },
    tas4: { w: 4, h: 1, d: 1, mass: 2.8, f: 0.7, r: 0.06, ses: 'tas', renk: '#4a6cdb', sert: 1, yap: () => tas(4, 23) },
    buzP: { w: 1, h: 1, d: 1, mass: 0.95, f: 0.14, r: 0.1, ses: 'buz', renk: '#39b4ff', kir: 1, carp: 7, yuzer: 1, yap: () => buz(1, 5) },
    buzP3: { w: 3, h: 1, d: 1, mass: 2.2, f: 0.16, r: 0.08, ses: 'buz', renk: '#39b4ff', kir: 1, carp: 9, yuzer: 1, yap: () => buz(3, 9) },
    ahsapD: { w: 1, h: 2, d: 1, mass: 1.2, f: 0.62, r: 0.12, ses: 'tahta', renk: '#f39a2c', kir: 1, yuzer: 1, yap: ahsap },
    mermer: { w: 1, h: 1, d: 1, mass: 1.25, f: 0.66, r: 0.06, ses: 'tas', renk: '#f1e8d8', sekil: 'sil', sert: 1, yap: mermer },
    kvP: { w: 1, h: 2, d: 1, mass: 1.0, f: 0.55, r: 0.08, ses: 'cam', renk: '#f23fc6', sekil: 'sil', kir: 1, carp: 8, yap: () => kavanoz('#e31bb0') },
    kvT: { w: 1, h: 2, d: 1, mass: 1.0, f: 0.55, r: 0.08, ses: 'cam', renk: '#ff8a1c', sekil: 'sil', kir: 1, carp: 8, yap: () => kavanoz('#fa7300') },
    kvM: { w: 1, h: 2, d: 1, mass: 1.0, f: 0.55, r: 0.08, ses: 'cam', renk: '#8b46f0', sekil: 'sil', kir: 1, carp: 8, yap: () => kavanoz('#6f22e0') },
    raf2: { w: 2, h: 0.5, d: 1, mass: 0.9, f: 0.6, r: 0.1, ses: 'tahta', renk: RAFR, yuzer: 1, yap: () => raf(2) },
    raf3: { w: 3, h: 0.5, d: 1, mass: 1.3, f: 0.6, r: 0.1, ses: 'tahta', renk: RAFR, yuzer: 1, yap: () => raf(3) },
    dalga: { w: 1, h: 1, d: 1, mass: 1.0, f: 0.62, r: 0.08, ses: 'tas', renk: RAFR, sekil: 'sil', yap: () => dalga(1) },
    disk: { w: 1, h: 0.5, d: 1, mass: 0.6, f: 0.62, r: 0.08, ses: 'tas', renk: RAFA, sekil: 'sil', yap: () => dalga(0.5) },
    // v3.11 yeni sekiller
    joP: { w: 1, h: 1, d: 1, mass: 0.7, f: 0.4, r: 0.3, ses: 'buz', renk: '#ff4fa8', kir: 1, carp: 7, yuzer: 1, yap: () => jole('#f2268a') },
    joY: { w: 1, h: 1, d: 1, mass: 0.7, f: 0.4, r: 0.3, ses: 'buz', renk: '#7ee83a', kir: 1, carp: 7, yuzer: 1, yap: () => jole('#4ccc14') },
    joT: { w: 1, h: 1, d: 1, mass: 0.7, f: 0.4, r: 0.3, ses: 'buz', renk: '#ff9a2a', kir: 1, carp: 7, yuzer: 1, yap: () => jole('#ff7a00') },
    hdK: { w: 1, h: 1, d: 1, mass: 0.8, f: 0.6, r: 0.1, ses: 'tahta', renk: '#e8283c', kir: 1, yuzer: 1, yap: () => hediye('#d81e36', '#ffd23f') },
    hdM: { w: 1, h: 1, d: 1, mass: 0.8, f: 0.6, r: 0.1, ses: 'tahta', renk: '#2f7df2', kir: 1, yuzer: 1, yap: () => hediye('#1f5fd8', '#ffffff') },
    hdY: { w: 1, h: 1, d: 1, mass: 0.8, f: 0.6, r: 0.1, ses: 'tahta', renk: '#22b04a', kir: 1, yuzer: 1, yap: () => hediye('#169a3c', '#ff4fa8') },
    cik2: { w: 2, h: 1, d: 1, mass: 1.5, f: 0.65, r: 0.06, ses: 'tahta', renk: '#6a3414', kir: 1, carp: 10, yap: () => cikolata(2) },
    tug2: { w: 2, h: 1, d: 1, mass: 1.9, f: 0.75, r: 0.05, ses: 'tas', renk: '#c8402a', sert: 1, yap: () => tugla(2, 31) },
    tug3: { w: 3, h: 1, d: 1, mass: 2.5, f: 0.75, r: 0.05, ses: 'tas', renk: '#c8402a', sert: 1, yap: () => tugla(3, 37) },
    krM: { w: 1, h: 1, d: 1, mass: 1.1, f: 0.5, r: 0.1, ses: 'cam', renk: '#a64cff', kir: 1, carp: 8, yap: () => kristal('#8a2cf0') },
    krT: { w: 1, h: 1, d: 1, mass: 1.1, f: 0.5, r: 0.1, ses: 'cam', renk: '#2ad4e8', kir: 1, carp: 8, yap: () => kristal('#10b4d8') },
    kur: { w: 1, h: 0.5, d: 1, mass: 0.5, f: 0.7, r: 0.05, ses: 'tahta', renk: '#d88c3c', sekil: 'sil', kir: 1, yuzer: 1, yap: kurabiye },
    mkP: { w: 1, h: 0.5, d: 1, mass: 0.45, f: 0.6, r: 0.1, ses: 'tahta', renk: '#ff8ac4', sekil: 'sil', kir: 1, yuzer: 1, yap: () => makaron('#ff7ab8') },
    mkY: { w: 1, h: 0.5, d: 1, mass: 0.45, f: 0.6, r: 0.1, ses: 'tahta', renk: '#9be06a', sekil: 'sil', kir: 1, yuzer: 1, yap: () => makaron('#8ad65a') },
    mkM: { w: 1, h: 0.5, d: 1, mass: 0.45, f: 0.6, r: 0.1, ses: 'tahta', renk: '#9ab8ff', sekil: 'sil', kir: 1, yuzer: 1, yap: () => makaron('#86a8ff') },
    knK: { w: 1, h: 1, d: 1, mass: 1.0, f: 0.5, r: 0.12, ses: 'tas', renk: '#e8283c', sekil: 'sil', yap: () => konserve('#d81e36') },
    knM: { w: 1, h: 1, d: 1, mass: 1.0, f: 0.5, r: 0.12, ses: 'tas', renk: '#2f7df2', sekil: 'sil', yap: () => konserve('#1f5fd8') }
  };
  const HAZIR = {};
  function al(k) { if (HAZIR[k]) return HAZIR[k]; const t = TUR[k], y = t.yap(); return (HAZIR[k] = Object.assign({ w: t.w * S, h: t.h * S, d: t.d * S, sil: t.sekil === 'sil', r: S * 0.47 }, y)); }
  return { TUR, al };
}

// ---------------- yapilar ----------------
// Uc ornek yapinin olculebilir halleri. Hepsi sag-sol simetrik; kup listesi [i, kat, k, tur] dondurur.
// Uzun parcanin i degeri orta noktasidir (2 genislikte tas, 0 ve 1. hucreyi kaplar: i = 0.5).
const ayna = (W) => (i) => Math.round(Math.min(i, W - 1 - i));
export const YAPI = {
  // Oyuncak duvar: tas kiris temel, renkli kup siralari, arada tas kirisler, ustte pencere ve mazgal.
  duvar(o = {}) {
    const R1 = o.r1 || 'oyK', R2 = o.r2 || 'oyY', kat = o.kat || 2, D = o.d || 2, m = ayna(8), L = [];
    const des = [(i, j) => ((m(i) + j) % 2 ? R1 : R2), (i, j) => (j % 2 ? R1 : R2), (i, j) => (m(i) === 1 || m(i) === 2 ? R1 : R2), (i, j) => ((m(i) >> 1) % 2 === j % 2 ? R1 : R2)][(o.desen || 0) % 4];
    for (let k = 0; k < D; k++) {
      let j = 0; const sira = (f) => { for (let i = 0; i < 8; i++) { const t = f(i); if (t) L.push([i, j, k, t]); } j++; };
      L.push([1.5, j, k, 'tas4'], [5.5, j, k, 'tas4']); j++;
      sira((i) => R2);
      L.push([3.5, j, k, 'tas4']); sira((i) => (i < 2 || i > 5 ? des(i, j) : null));
      for (let n = 0; n < kat; n++) sira((i) => des(i, j));
      L.push([3.5, j, k, 'tas2']); sira((i) => (i === 3 || i === 4 ? null : des(i, j)));
      sira((i) => (i === 3 || i === 4 ? null : i === 2 || i === 5 ? R1 : R2));
      L.push([0.5, j, k, 'tas2'], [3.5, j, k, 'tas4'], [6.5, j, k, 'tas2']); j++;
      L.push([2, j, k, R1], [5, j, k, R1]);
    }
    return L;
  },
  // Buz tapinagi: mermer sutunlar ustunde buz kirisler, onun ustunde ahsap cekirdekli buz piramidi.
  tapinak(o = {}) {
    const sut = o.sut || 3, D = o.d || 2, L = [];
    for (let k = 0; k < D; k++) {
      for (const i of [0, 2, 3, 5]) for (let j = 0; j < sut; j++) L.push([i, j, k, 'mermer']);
      L.push([1, 0, k, 'buzP'], [4, 0, k, 'buzP']); if (sut > 2 && k === 0) L.push([1, 1, k, 'buzP'], [4, 1, k, 'buzP']);
      let j = sut; L.push([1, j, k, 'buzP3'], [4, j, k, 'buzP3']); j++;
      for (const i of [0, 1, 4, 5]) L.push([i, j, k, 'buzP']); L.push([2, j, k, 'ahsapD'], [3, j, k, 'ahsapD']);
      L.push([1, j + 1, k, 'buzP'], [4, j + 1, k, 'buzP']);
      for (const i of [1, 2, 3, 4]) L.push([i, j + 2, k, 'buzP']);
      for (const i of [1.5, 2.5, 3.5]) L.push([i, j + 3, k, 'buzP']);
      L.push([2, j + 4, k, 'buzP'], [3, j + 4, k, 'buzP']);
    }
    L.push([2.5, sut + 6, (D - 1) / 2, 'altin']);
    return L;
  },
  // v3.11: Pastane: cikolata kirisler, makaron ve kurabiye katlari, jole ve hediye kutulari, tepede kristal
  pastane(o = {}) {
    const D = o.d || 2, MK = ['mkP', 'mkY', 'mkM'], JO = ['joP', 'joY', 'joT'], HD = ['hdK', 'hdM', 'hdY'], s0 = o.kay || 0, L = [];
    for (let k = 0; k < D; k++) {
      L.push([0.5, 0, k, 'cik2'], [2.5, 0, k, 'cik2'], [4.5, 0, k, 'cik2']);
      for (let i = 0; i < 6; i++) L.push([i, 1, k, MK[(i + s0) % 3]]);
      for (let i = 0; i < 6; i++) L.push([i, 1.5, k, 'kur']);
      for (let i = 0; i < 6; i++) L.push([i, 2, k, i === 0 || i === 5 ? HD[(k + s0) % 3] : JO[(i + k + s0) % 3]]);
      L.push([1.5, 3, k, 'cik2'], [3.5, 3, k, 'cik2']);
      for (let i = 1; i < 5; i++) L.push([i, 4, k, MK[(i + 1 + s0) % 3]]);
      L.push([2, 4.5, k, 'kur'], [3, 4.5, k, 'kur']);
      L.push([2, 5, k, JO[(s0 + 1) % 3]], [3, 5, k, JO[(s0 + 2) % 3]]);
    }
    L.push([2.5, 6, (D - 1) / 2, o.tepe || 'krM']);
    return L;
  },
  // v3.11: Hediye kulesi: tugla kirisler arasinda hediye kutulari ve jole katlari
  hediye(o = {}) {
    const D = o.d || 2, kat = o.kat || 1, JO = ['joP', 'joY', 'joT'], HD = ['hdK', 'hdM', 'hdY'], s0 = o.kay || 0, L = [];
    for (let k = 0; k < D; k++) {
      let j = 0; L.push([0.5, j, k, 'tug2'], [2.5, j, k, 'tug2'], [4.5, j, k, 'tug2']); j++;
      for (let n = 0; n < kat; n++) {
        for (let i = 0; i < 6; i++) L.push([i, j, k, HD[(i + n + s0) % 3]]); j++;
        for (let i = 0; i < 6; i++) L.push([i, j, k, JO[(i + k + n + s0) % 3]]); j++;
      }
      L.push([1, j, k, 'tug3'], [4, j, k, 'tug3']); j++;
      for (let i = 1; i < 5; i++) L.push([i, j, k, HD[(i + s0 + 1) % 3]]); j++;
      L.push([2.5, j, k, 'tug2']); j++;
      L.push([2, j, k, 'krT'], [3, j, k, 'krM']);
    }
    return L;
  },
  // v3.11: Hazine deposu: konserve sutunlari arasinda kristaller, tugla ve cikolata kirisler
  depo(o = {}) {
    const D = o.d || 2, sut = o.sut || 2, KN = ['knK', 'knM'], KR = ['krM', 'krT'], s0 = o.kay || 0, L = [];
    for (let k = 0; k < D; k++) {
      let j = 0;
      for (let n = 0; n < sut; n++) { for (const i of [0, 1, 4, 5]) L.push([i, j, k, KN[(i + n + s0) % 2]]); L.push([2, j, k, n % 2 ? 'joP' : KR[(k + s0) % 2]], [3, j, k, n % 2 ? 'joY' : KR[(k + s0 + 1) % 2]]); j++; }
      L.push([0.5, j, k, 'tug2'], [2.5, j, k, 'cik2'], [4.5, j, k, 'tug2']); j++;
      for (const i of [1, 4]) L.push([i, j, k, KN[(i + s0) % 2]]); L.push([2, j, k, 'hdK'], [3, j, k, 'hdM']); j++;
      L.push([1.5, j, k, 'tug2'], [3.5, j, k, 'tug2']); j++;
      L.push([2, j, k, KN[s0 % 2]], [3, j, k, KN[(s0 + 1) % 2]]);
    }
    return L;
  },
  // Seker rafi: ortada dalgali tambur sutunu, iki yaninda raflara dizili kavanozlar.
  raf(o = {}) {
    const kat = o.kat || 2, D = o.d || 2, KV = ['kvP', 'kvT', 'kvM'], L = [];
    for (let k = 0; k < D; k++) {
      let y = 0;
      for (let n = 0; n < kat; n++) {
        for (const i of [0, 1, 2]) { L.push([i, y, k, KV[(i + n + (o.kay || 0)) % 3]], [6 - i, y, k, KV[(i + n + (o.kay || 0)) % 3]]); }
        L.push([3, y, k, 'dalga'], [3, y + 1, k, 'dalga']);
        if (n === kat - 1) { y += 2; break; }   // son katin ustune dogrudan uzun tahtalar gelir
        L.push([1, y + 2, k, 'raf3'], [5, y + 2, k, 'raf3'], [3, y + 2, k, 'disk']);   // orta sutun raf yuksekligine tamamlanir
        y += 2.5;
      }
      // ustte uzun tahtalar ve tepe kavanozlari
      L.push([0.5, y, k, 'raf2'], [3, y, k, 'raf3'], [5.5, y, k, 'raf2']);
      L.push([2, y + 0.5, k, KV[0]], [4, y + 0.5, k, KV[0]], [3, y + 0.5, k, k === 0 ? 'altin' : 'oyS']);
    }
    return L;
  }
};
