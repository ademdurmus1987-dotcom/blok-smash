// Foxi Smash v4.3 - Faz 1D: "Korsan Kalesi" blok seti (Adem 13 Kas: gonderdigi iki kale gorselinin tarzi)
// Kodla cizilen, ayrintili 3B bloklar: metal koseli ve perçinli X kusakli sandik, tahta kalas, yontma tas, tas kemer,
// cemberli fici, mantar tipali sise (icinde parlayan sivi), yuzeyli mucevher, catlakli buz, TNT, altin yildiz blok, tas ve mor sutun.
// Her blok birden cok malzemeli tek geometri (gruplar): govde dokusu + metal + cam/sivi. Dokular canvas ile bir kez uretilir.
// sekil.js icinden cagrilir; dondurdugu tablo SEK.TUR'a eklenir (oyun.js hicbir ozel kod gerektirmez).
export function kaleKur(A) {
  const { THREE, S, canvasTex, ENV, kutu, torna, rng, acik, koyu } = A;
  const Pi = Math.PI;

  // ---------- yardimcilar ----------
  // birden cok [geometri, malzemeNo] -> gruplu tek geometri (konum, normal, uv)
  function topla(L) {
    const ls = L.map(([g, m]) => [g.index ? g.toNonIndexed() : g, m]).sort((a, b) => a[1] - b[1]);
    const out = new THREE.BufferGeometry(); let n = 0; for (const [g] of ls) n += g.attributes.position.count;
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2); let o = 0, gs = 0, cur = -1;
    for (const [g, m] of ls) {
      const c = g.attributes.position.count;
      P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3);
      if (g.attributes.uv) U.set(g.attributes.uv.array, o * 2);
      if (m !== cur) { if (cur >= 0) out.addGroup(gs, o - gs, cur); cur = m; gs = o; }
      o += c;
    }
    out.addGroup(gs, o - gs, cur);
    out.setAttribute('position', new THREE.BufferAttribute(P, 3)); out.setAttribute('normal', new THREE.BufferAttribute(N, 3)); out.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    out.computeBoundingBox(); out.computeBoundingSphere(); return out;
  }
  const std = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.55, metalness: 0, envMap: ENV, envMapIntensity: 0.45 }, o));
  const tex = (w, h, f) => { const t = canvasTex(w, h, f); t.anisotropy = 4; return t; };
  // ahsap damari: ince dalgali cizgiler + budak
  function damar(x, X, Y, W, H, renk, r, yatay = true, yog = 1) {
    x.save(); x.beginPath(); x.rect(X, Y, W, H); x.clip();
    const L = yatay ? H : W, n = Math.max(3, Math.round(L / 7 * yog));
    for (let i = 0; i < n; i++) {
      const t = (i + r() * 0.6) / n; x.strokeStyle = r() < 0.5 ? 'rgba(90,40,10,' + (0.12 + r() * 0.14) + ')' : 'rgba(255,230,180,' + (0.08 + r() * 0.1) + ')'; x.lineWidth = 1 + r() * 2.2;
      x.beginPath(); const a = r() * 6, f = 0.02 + r() * 0.03, amp = 1 + r() * 2.5;
      if (yatay) { const yy = Y + t * H; for (let k = 0; k <= W; k += 6) x.lineTo(X + k, yy + Math.sin(a + k * f) * amp); }
      else { const xx = X + t * W; for (let k = 0; k <= H; k += 6) x.lineTo(xx + Math.sin(a + k * f) * amp, Y + k); }
      x.stroke();
    }
    if (r() < 0.7) { const bx = X + W * (0.2 + r() * 0.6), by = Y + H * (0.2 + r() * 0.6), rr = Math.min(W, H) * 0.08 + 2; x.fillStyle = 'rgba(90,40,10,.28)'; x.beginPath(); x.ellipse(bx, by, rr * (yatay ? 1.8 : 1), rr * (yatay ? 1 : 1.8), 0, 0, 6.283); x.fill(); x.strokeStyle = 'rgba(90,40,10,.25)'; x.lineWidth = 1.5; x.beginPath(); x.ellipse(bx, by, rr * (yatay ? 2.6 : 1.5), rr * (yatay ? 1.5 : 2.6), 0, 0, 6.283); x.stroke(); }
    x.restore();
  }
  // egimli (pahli) tahta: ust-sol acik, alt-sag koyu kenar; ici renk + damar
  function tahta(x, X, Y, W, H, renk, r, yatay, kalin = 5) {
    x.fillStyle = renk; x.fillRect(X, Y, W, H);
    let g = x.createLinearGradient(X, Y, yatay ? X : X + W, yatay ? Y + H : Y); g.addColorStop(0, 'rgba(255,240,200,.22)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(60,20,0,.22)'); x.fillStyle = g; x.fillRect(X, Y, W, H);
    damar(x, X, Y, W, H, renk, r, yatay);
    x.fillStyle = 'rgba(255,236,190,.55)'; x.fillRect(X, Y, W, kalin); x.fillRect(X, Y, kalin, H);
    x.fillStyle = 'rgba(70,25,0,.5)'; x.fillRect(X, Y + H - kalin, W, kalin); x.fillRect(X + W - kalin, Y, kalin, H);
    x.strokeStyle = 'rgba(50,18,0,.75)'; x.lineWidth = 2.5; x.strokeRect(X + 1, Y + 1, W - 2, H - 2);
  }
  function civi(x, cx, cy, rr) {
    let g = x.createRadialGradient(cx - rr * 0.35, cy - rr * 0.35, rr * 0.1, cx, cy, rr); g.addColorStop(0, '#f4f6fa'); g.addColorStop(0.5, '#9aa2ae'); g.addColorStop(1, '#3c4048');
    x.fillStyle = 'rgba(0,0,0,.35)'; x.beginPath(); x.arc(cx + rr * 0.25, cy + rr * 0.3, rr, 0, 6.283); x.fill();
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, rr, 0, 6.283); x.fill();
  }
  // tum yuzu saran yumusak hacim isigi
  function hacim(x, w, h, guc = 1) {
    let g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,' + 0.16 * guc + ')'); g.addColorStop(0.3, 'rgba(255,255,255,0)'); g.addColorStop(0.75, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(20,0,40,' + 0.22 * guc + ')'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  }
  const bumpT = (w, h, f) => tex(w, h, (x, W, H) => { x.fillStyle = '#808080'; x.fillRect(0, 0, W, H); f(x, W, H); });

  // ---------- metal koseler (sandik, TNT) ----------
  const METAL = std({ color: '#b4bcc8', metalness: 0.85, roughness: 0.32, envMapIntensity: 1.1, map: tex(64, 64, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#e8edf4'); g.addColorStop(1, '#7a828e'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(30,34,40,.6)'; x.lineWidth = 3; x.strokeRect(1.5, 1.5, w - 3, h - 3); civi(x, w / 2, h / 2, 9);
  }) });
  function koseler(w, h, d, a = 0.27) {
    const L = [], b = new THREE.BoxGeometry(a * S, a * S, a * S), e = 0.016 * S;
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      const g = b.clone(); g.translate(sx * (w * S / 2 - a * S / 2 + e), sy * (h * S / 2 - a * S / 2 + e), sz * (d * S / 2 - a * S / 2 + e)); L.push([g, 1]);
    }
    return L;
  }

  // ---------- 1) X kusakli sandik ----------
  function sandikDoku(renk, tohum, tnt) {
    const N = 512, f = N * 0.15, br = N * 0.15;
    const map = tex(N, N, (x, w, h) => {
      const r = rng(tohum);
      // ic pano: dikey tahtalar, cukur
      for (let i = 0; i < 4; i++) tahta(x, f + i * (w - 2 * f) / 4, f, (w - 2 * f) / 4, h - 2 * f, koyu(renk, 0.14 + r() * 0.08), r, false, 3);
      let g = x.createLinearGradient(0, f, 0, f + 40); g.addColorStop(0, 'rgba(40,10,0,.5)'); g.addColorStop(1, 'rgba(40,10,0,0)'); x.fillStyle = g; x.fillRect(f, f, w - 2 * f, 40);
      g = x.createLinearGradient(f, 0, f + 30, 0); g.addColorStop(0, 'rgba(40,10,0,.4)'); g.addColorStop(1, 'rgba(40,10,0,0)'); x.fillStyle = g; x.fillRect(f, f, 30, h - 2 * f);
      if (!tnt) {
        // X kusak: iki capraz tahta, golgeli
        for (const s of [1, -1]) {
          x.save(); x.translate(w / 2, h / 2); x.rotate(s * Pi / 4); const L = (w - 2 * f) * 1.32;
          x.fillStyle = 'rgba(40,10,0,.35)'; x.fillRect(-L / 2 + 6, -br / 2 + 8, L, br);
          tahta(x, -L / 2, -br / 2, L, br, acik(renk, 0.04), r, true, 5); x.restore();
        }
      }
      // cerceve: 4 tahta (ust/alt yatay, yanlar dikey)
      tahta(x, 0, 0, w, f, renk, r, true, 6); tahta(x, 0, h - f, w, f, koyu(renk, 0.04), r, true, 6);
      tahta(x, 0, f, f, h - 2 * f, renk, r, false, 6); tahta(x, w - f, f, f, h - 2 * f, koyu(renk, 0.03), r, false, 6);
      for (const [cx, cy] of [[w * 0.5, f / 2], [w * 0.5, h - f / 2], [f / 2, h * 0.5], [w - f / 2, h * 0.5]]) civi(x, cx, cy, 7);
      if (tnt) {
        // TNT etiketi: krem levha, kirmizi yazi, kivilcim
        const lw = w * 0.62, lh = h * 0.3, lx = (w - lw) / 2, ly = h * 0.42;
        x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(lx + 6, ly + 8, lw, lh);
        g = x.createLinearGradient(0, ly, 0, ly + lh); g.addColorStop(0, '#fff6dc'); g.addColorStop(1, '#e8d2a0'); x.fillStyle = g; x.fillRect(lx, ly, lw, lh);
        x.strokeStyle = '#5a1a08'; x.lineWidth = 5; x.strokeRect(lx, ly, lw, lh);
        x.font = '900 ' + Math.round(lh * 0.78) + 'px Arial Black, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.lineWidth = 10; x.strokeStyle = '#5a1a08'; x.strokeText('TNT', w / 2, ly + lh * 0.55); x.fillStyle = '#e82a1c'; x.fillText('TNT', w / 2, ly + lh * 0.55);
        x.save(); x.translate(w / 2, ly - h * 0.1); x.fillStyle = '#ffd23f'; x.strokeStyle = '#8a4a00'; x.lineWidth = 4; x.beginPath();
        for (let i = 0; i < 16; i++) { const rr = i % 2 ? 12 : 34, a = -Pi / 2 + i * Pi / 8; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.closePath(); x.fill(); x.stroke(); x.restore();
      }
      hacim(x, w, h, 0.8);
    });
    const bump = bumpT(128, 128, (x, w, h) => {
      const k = w / N, ff = f * k; x.fillStyle = '#5a5a5a'; x.fillRect(ff, ff, w - 2 * ff, h - 2 * ff);
      if (!tnt) for (const s of [1, -1]) { x.save(); x.translate(w / 2, h / 2); x.rotate(s * Pi / 4); x.fillStyle = '#b0b0b0'; x.fillRect(-w * 0.6, -br * k / 2, w * 1.2, br * k); x.restore(); }
      x.strokeStyle = '#3a3a3a'; x.lineWidth = 2; x.strokeRect(1, 1, w - 2, h - 2); x.strokeRect(ff, ff, w - 2 * ff, h - 2 * ff);
    });
    return { map, bump };
  }
  // v5.1 (Adem'in kale gorselleri): sandik artik gercek 3B. Kenarlarda 12 pahli tahta kiris (cerceve), yan yuzlerde iceride
  // capraz X tahtalari, kosede pahli metal kosebent ve uc yuzunde gercek percin. Ic pano dikey tahtalar (TNT'de etiket).
  // Tek doku atlasi (pano | kalas | ust pano) ile 2 malzeme = instancing'de 2 cizim.
  function sandik(renk, tohum, tnt) {
    const atlas = tex(1536, 512, (x, w, h) => {
      const r = rng(tohum), pw = 512;
      for (const ox of [0, 1024]) {   // ic pano: koyu dikey tahtalar, ustte ve solda cerceve golgesi
        for (let i = 0; i < 4; i++) tahta(x, ox + i * pw / 4, 0, pw / 4, h, koyu(renk, 0.3 + r() * 0.08), r, false, 4);
        let g = x.createLinearGradient(0, 0, 0, 90); g.addColorStop(0, 'rgba(40,10,0,.55)'); g.addColorStop(1, 'rgba(40,10,0,0)'); x.fillStyle = g; x.fillRect(ox, 0, pw, 90);
        g = x.createLinearGradient(ox, 0, ox + 70, 0); g.addColorStop(0, 'rgba(40,10,0,.4)'); g.addColorStop(1, 'rgba(40,10,0,0)'); x.fillStyle = g; x.fillRect(ox, 0, 70, h);
      }
      if (tnt) {   // TNT etiketi (yalniz yan yuzler)
        const lw = pw * 0.8, lh = h * 0.36, lx = (pw - lw) / 2, ly = h * 0.36;
        x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(lx + 8, ly + 10, lw, lh);
        let g = x.createLinearGradient(0, ly, 0, ly + lh); g.addColorStop(0, '#fff6dc'); g.addColorStop(1, '#e8d2a0'); x.fillStyle = g; x.fillRect(lx, ly, lw, lh);
        x.strokeStyle = '#5a1a08'; x.lineWidth = 8; x.strokeRect(lx, ly, lw, lh);
        x.font = '900 ' + Math.round(lh * 0.8) + 'px Arial Black, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.lineWidth = 14; x.strokeStyle = '#5a1a08'; x.strokeText('TNT', pw / 2, ly + lh * 0.55); x.fillStyle = '#e82a1c'; x.fillText('TNT', pw / 2, ly + lh * 0.55);
        x.save(); x.translate(pw / 2, ly - h * 0.12); x.fillStyle = '#ffd23f'; x.strokeStyle = '#8a4a00'; x.lineWidth = 5; x.beginPath();
        for (let i = 0; i < 16; i++) { const rr = i % 2 ? 16 : 46, a = -Pi / 2 + i * Pi / 8; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.closePath(); x.fill(); x.stroke(); x.restore();
      }
      // kalas: yatay damarli tek tahta, kenarlari pahli (acik ust, koyu alt)
      tahta(x, 512, 0, 512, h, renk, r, true, 22);
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,240,200,.25)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(60,20,0,.3)'); x.fillStyle = g; x.fillRect(512, 0, 512, h);
    });
    const bolge = (g, b, ust) => { const uv = g.attributes.uv, n = g.attributes.normal; for (let i = 0; i < uv.count; i++) { const bb = ust && Math.abs(n.getY(i)) > 0.5 ? 2 : b; uv.setX(i, (bb + uv.getX(i)) / 3); } return g; };
    const L = [], fr = 0.17 * S, H = S / 2, ic = S - 2 * fr;
    L.push([bolge(kutu(S * 0.86, S * 0.86, S * 0.86, S * 0.02, 1), 0, true), 0]);
    const kiris = (len) => bolge(kutu(len, fr, fr, S * 0.035, 1), 1);
    for (const a of [-1, 1]) for (const b of [-1, 1]) {
      let g = kiris(S); g.translate(0, a * (H - fr / 2), b * (H - fr / 2)); L.push([g, 0]);                          // x yonunde
      g = kiris(ic + 0.002); g.rotateZ(Pi / 2); g.translate(a * (H - fr / 2), 0, b * (H - fr / 2)); L.push([g, 0]);  // dikey
      g = kiris(ic + 0.002); g.rotateY(Pi / 2); g.translate(a * (H - fr / 2), b * (H - fr / 2), 0); L.push([g, 0]);  // z yonunde
    }
    if (!tnt) for (const yuz of [0, 1, 2, 3]) for (const a of [-1, 1]) {   // capraz X (cercevenin icinde, biraz geride)
      const g = bolge(kutu(ic * Math.SQRT2, S * 0.14, S * 0.06, S * 0.02, 1), 1); g.rotateZ(a * Pi / 4); g.translate(0, 0, S * 0.43 + S * 0.03); g.rotateY(yuz * Pi / 2); L.push([g, 0]);
    }
    const a = fr + S * 0.03, e = S * 0.012;
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {   // pahli kosebent + 3 percin
      const g = kutu(a, a, a, S * 0.03, 1); g.translate(sx * (H - a / 2 + e), sy * (H - a / 2 + e), sz * (H - a / 2 + e)); L.push([g, 1]);
      for (const ax of [0, 1, 2]) {
        const p = new THREE.SphereGeometry(S * 0.032, 7, 3, 0, Pi * 2, 0, Pi / 2), c = [sx * (H - a / 2 + e), sy * (H - a / 2 + e), sz * (H - a / 2 + e)];
        if (ax === 0) { p.rotateZ(-sx * Pi / 2); c[0] = sx * (H + e); } else if (ax === 1) { if (sy < 0) p.rotateX(Pi); c[1] = sy * (H + e); } else { p.rotateX(sz * Pi / 2); c[2] = sz * (H + e); }
        p.translate(c[0], c[1], c[2]); L.push([p, 1]);
      }
    }
    const govde = std({ map: atlas, roughness: 0.6, emissive: koyu(renk, 0.75), emissiveIntensity: 0.14, envMapIntensity: 0.5 });
    // LOD (arka sirada, onunde baska blok olan sandik): kutu + kosebentler, ~1 bin ucgen
    const LL = [[bolge(kutu(S * 0.99, S * 0.99, S * 0.99, S * 0.04, 1), 0, true), 0]];
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) { const g = kutu(a, a, a, S * 0.03, 1); g.translate(sx * (H - a / 2 + e), sy * (H - a / 2 + e), sz * (H - a / 2 + e)); LL.push([g, 1]); }
    return { geo: topla(L), lod: topla(LL), esik: 1e9, mat: [govde, KOSEBENT], parca: std({ color: renk, roughness: 0.7 }) };
  }
  // kosebent: fircalanmis koyu celik, kenarlarda parlak pah
  const KOSEBENT = std({ color: '#c4ccd8', metalness: 0.9, roughness: 0.3, envMapIntensity: 1.3, map: tex(64, 64, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#f0f4fa'); g.addColorStop(0.5, '#a8b0bc'); g.addColorStop(1, '#6a727e'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { x.strokeStyle = 'rgba(255,255,255,.12)'; x.beginPath(); const yy = Math.random() * h; x.moveTo(0, yy); x.lineTo(w, yy + 3); x.stroke(); }
    x.strokeStyle = 'rgba(30,34,40,.7)'; x.lineWidth = 3; x.strokeRect(1.5, 1.5, w - 3, h - 3);
  }) });

  // ---------- 2) tahta kalas (w x 0.5) ----------
  function kalas(wS, renk, tohum) {
    const W = 128 * wS, H = 64;
    const map = tex(W, H, (x, w, h) => { const r = rng(tohum); tahta(x, 0, 0, w, h, renk, r, true, 5); for (const cx of [14, w - 14]) { civi(x, cx, h * 0.3, 5); civi(x, cx, h * 0.72, 5); } hacim(x, w, h, 0.6); });
    const bump = bumpT(64 * wS, 32, (x, w, h) => { x.strokeStyle = '#4a4a4a'; x.lineWidth = 2; x.strokeRect(1, 1, w - 2, h - 2); const r = rng(tohum); for (let i = 0; i < 6; i++) { x.strokeStyle = 'rgba(60,60,60,.5)'; x.beginPath(); x.moveTo(0, r() * h); x.lineTo(w, r() * h); x.stroke(); } });
    return { geo: kutu(wS * S, S * 0.5, S, S * 0.07, 2), mat: std({ map, bumpMap: bump, bumpScale: 1.6, roughness: 0.62, emissive: koyu(renk, 0.75), emissiveIntensity: 0.12 }), parca: std({ color: renk, roughness: 0.7 }) };
  }

  // ---------- 3) yontma tas blok ----------
  function tasCiz(x, w, h, nx, ny, renk, r) {
    x.fillStyle = koyu(renk, 0.55); x.fillRect(0, 0, w, h);
    const cw = w / nx, ch = h / ny, m = 5;
    for (let j = 0; j < ny; j++) {
      const off = j % 2 ? cw / 2 : 0;
      for (let i = -1; i <= nx; i++) {
        const X = i * cw + off + m / 2, Y = j * ch + m / 2, W = cw - m, H = ch - m; if (X + W < 0 || X > w) continue;
        const c = r() < 0.5 ? renk : r() < 0.5 ? acik(renk, 0.08) : koyu(renk, 0.08), rr = Math.min(W, H) * 0.14;
        x.save(); x.beginPath(); x.moveTo(X + rr, Y); x.lineTo(X + W - rr, Y + r() * 2); x.quadraticCurveTo(X + W, Y, X + W, Y + rr); x.lineTo(X + W - r() * 2, Y + H - rr); x.quadraticCurveTo(X + W, Y + H, X + W - rr, Y + H);
        x.lineTo(X + rr, Y + H - r() * 2); x.quadraticCurveTo(X, Y + H, X, Y + H - rr); x.lineTo(X + r() * 2, Y + rr); x.quadraticCurveTo(X, Y, X + rr, Y); x.closePath(); x.clip();
        let g = x.createLinearGradient(X, Y, X + W * 0.3, Y + H); g.addColorStop(0, acik(c, 0.18)); g.addColorStop(1, koyu(c, 0.12)); x.fillStyle = g; x.fillRect(X, Y, W, H);
        for (let k = 0; k < 14; k++) { x.fillStyle = r() < 0.5 ? 'rgba(0,0,0,.07)' : 'rgba(255,255,255,.07)'; x.beginPath(); x.arc(X + r() * W, Y + r() * H, 2 + r() * 7, 0, 6.283); x.fill(); }
        // catlak
        if (r() < 0.55) { x.strokeStyle = 'rgba(30,30,40,.55)'; x.lineWidth = 1.6; x.beginPath(); let px = X + W * (0.2 + r() * 0.6), py = Y + 3; x.moveTo(px, py); for (let k = 0; k < 5; k++) { px += (r() - 0.5) * W * 0.25; py += H * 0.18; x.lineTo(px, py); } x.stroke(); }
        x.lineWidth = 4; x.strokeStyle = 'rgba(255,255,255,.28)'; x.beginPath(); x.moveTo(X + 2, Y + H - 4); x.lineTo(X + 2, Y + 2); x.lineTo(X + W - 4, Y + 2); x.stroke();
        x.strokeStyle = 'rgba(0,0,0,.3)'; x.beginPath(); x.moveTo(X + W - 2, Y + 4); x.lineTo(X + W - 2, Y + H - 2); x.lineTo(X + 4, Y + H - 2); x.stroke();
        x.restore();
      }
    }
  }
  function tasDoku(wS, hS, nx, ny, renk, tohum) {
    const map = tex(Math.round(160 * wS), Math.round(160 * hS), (x, w, h) => { tasCiz(x, w, h, nx, ny, renk, rng(tohum)); hacim(x, w, h, 0.7); });
    const bump = tex(Math.round(64 * wS), Math.round(64 * hS), (x, w, h) => { const r = rng(tohum); x.fillStyle = '#303030'; x.fillRect(0, 0, w, h); const cw = w / nx, ch = h / ny; for (let j = 0; j < ny; j++) for (let i = -1; i <= nx; i++) { const X = i * cw + (j % 2 ? cw / 2 : 0) + 1.5, Y = j * ch + 1.5; x.fillStyle = 'rgb(' + (150 + r() * 40 | 0) + ',' + (150 + r() * 40 | 0) + ',' + (150 + r() * 40 | 0) + ')'; x.fillRect(X, Y, cw - 3, ch - 3); } });
    return { map, bump };
  }
  const TASR = '#8688a0';
  // v5.1: tas blok artik tek tek yontulmus taslardan: her tas ayri pahli govde (aralarda koyu harc gorunur), sira sira kaydirmali orgu.
  // Taslarin yuzu 4 desenli tek atlastan (catlak, benek, kenar isigi). Siluet uzaktan da "tas duvar" okunur.
  const TASATLAS = {};
  function tasAtlas(tohum) {
    return TASATLAS[tohum] || (TASATLAS[tohum] = tex(512, 512, (x, w, h) => {
      const r = rng(tohum);
      for (let v = 0; v < 4; v++) {
        const X = (v % 2) * 256, Y = Math.floor(v / 2) * 256, W = 256, H = 256, c = [TASR, acik(TASR, 0.07), koyu(TASR, 0.07), acik(TASR, 0.03)][v];
        let g = x.createLinearGradient(X, Y, X + W * 0.4, Y + H); g.addColorStop(0, acik(c, 0.16)); g.addColorStop(1, koyu(c, 0.14)); x.fillStyle = g; x.fillRect(X, Y, W, H);
        for (let k = 0; k < 60; k++) { x.fillStyle = r() < 0.5 ? 'rgba(20,16,40,.08)' : 'rgba(255,255,255,.08)'; x.beginPath(); x.arc(X + r() * W, Y + r() * H, 3 + r() * 14, 0, 6.283); x.fill(); }
        for (let k = 0; k < 3; k++) { x.fillStyle = r() < 0.5 ? 'rgba(160,170,210,.12)' : 'rgba(30,30,70,.1)'; x.beginPath(); x.moveTo(X + r() * W, Y + r() * H); x.lineTo(X + r() * W, Y + r() * H); x.lineTo(X + r() * W, Y + r() * H); x.fill(); }
        if (v !== 3) { x.strokeStyle = 'rgba(40,36,60,.6)'; x.lineWidth = 3; x.beginPath(); let px = X + W * (0.2 + r() * 0.6), py = Y + 4; x.moveTo(px, py); for (let k = 0; k < 6; k++) { px += (r() - 0.5) * W * 0.22; py += H * (0.08 + r() * 0.08); x.lineTo(px, py); } x.stroke();
          x.strokeStyle = 'rgba(255,255,255,.25)'; x.lineWidth = 1.5; x.stroke(); }
        x.lineWidth = 10; x.strokeStyle = 'rgba(255,255,255,.22)'; x.beginPath(); x.moveTo(X + 5, Y + H - 8); x.lineTo(X + 5, Y + 5); x.lineTo(X + W - 8, Y + 5); x.stroke();
        x.strokeStyle = 'rgba(20,16,40,.28)'; x.beginPath(); x.moveTo(X + W - 5, Y + 8); x.lineTo(X + W - 5, Y + H - 5); x.lineTo(X + 8, Y + H - 5); x.stroke();
      }
    }));
  }
  const HARC = std({ color: '#55516c', roughness: 1, envMapIntensity: 0.15 });
  function tasBlok(wS, hS, tohum) {
    const r = rng(tohum), L = [], W = wS * S, Hh = hS * S, sira = Math.max(1, Math.round(2 * hS)), rh = Hh / sira, bos = S * 0.026, sw = S / 2;
    L.push([kutu(W * 0.96, Hh * 0.96, S * 0.9, S * 0.02, 1), 1]);   // harc (taslarin arasindan gorunur)
    for (let j = 0; j < sira; j++) {
      const yy = -Hh / 2 + rh * (j + 0.5), kay = j % 2 ? sw / 2 : 0, xs = [];
      let x0 = -W / 2; if (kay) { xs.push([x0, x0 + kay]); x0 += kay; } while (x0 < W / 2 - 1e-4) { const x1 = Math.min(W / 2, x0 + sw); xs.push([x0, x1]); x0 = x1; }
      for (const [a, b] of xs) {
        const tw = b - a - bos; if (tw < S * 0.08) continue;
        const g = kutu(tw, rh - bos, S - bos * 0.6, S * 0.045, 1), v = Math.floor(r() * 4), uv = g.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setXY(i, ((v % 2) + uv.getX(i)) / 2, (Math.floor(v / 2) + uv.getY(i)) / 2);
        g.rotateZ((r() - 0.5) * 0.03); g.translate((a + b) / 2, yy, (r() - 0.5) * S * 0.02); L.push([g, 0]);
      }
    }
    const m = std({ map: tasAtlas(tohum % 3), roughness: 0.82, envMapIntensity: 0.35, emissive: '#1a1830', emissiveIntensity: 0.12 });
    return { geo: topla(L), mat: [m, HARC], parca: std({ color: TASR, roughness: 0.9 }) };
  }
  // ---------- 4) tas kemer (w3 x h2) ----------
  function kemer() {
    const W = 3 * S, H = 2 * S, D = S * 0.92, ar = S * 0.62, ab = 0;   // kemer acikligi: yaricap ar, alt kenar ab
    const sh = new THREE.Shape(); sh.moveTo(-W / 2, -H / 2); sh.lineTo(W / 2, -H / 2); sh.lineTo(W / 2, H / 2); sh.lineTo(-W / 2, H / 2); sh.closePath();
    const ho = new THREE.Path(); const y0 = -H / 2 + ab, yc = y0 + H * 0.42; ho.moveTo(-ar, y0); ho.lineTo(-ar, yc); ho.absarc(0, yc, ar, Pi, 0, true); ho.lineTo(ar, y0); ho.closePath(); sh.holes.push(ho);
    let g = new THREE.ExtrudeGeometry(sh, { depth: D - S * 0.12, bevelEnabled: true, bevelThickness: S * 0.06, bevelSize: S * 0.05, bevelSegments: 2, curveSegments: 18 });
    g.translate(0, 0, -(D - S * 0.12) / 2); g = g.toNonIndexed(); g.computeVertexNormals();
    // ucgen duzlemli doku izdusumu (yuz yonune gore)
    const p = g.attributes.position, n = g.attributes.normal, uv = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) { const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i)), X = p.getX(i), Y = p.getY(i), Z = p.getZ(i);
      if (az >= ax && az >= ay) { uv[i * 2] = X / W + 0.5; uv[i * 2 + 1] = Y / H + 0.5; } else if (ax >= ay) { uv[i * 2] = Z / W + 0.5; uv[i * 2 + 1] = Y / H + 0.5; } else { uv[i * 2] = X / W + 0.5; uv[i * 2 + 1] = Z / H + 0.5; } }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.computeBoundingBox(); g.computeBoundingSphere();
    const d = tasDoku(3, 2, 5, 4, TASR, 61);
    return { geo: g, mat: std({ map: d.map, bumpMap: d.bump, bumpScale: 2.6, roughness: 0.85, envMapIntensity: 0.3 }), parca: std({ color: TASR, roughness: 0.9 }) };
  }

  // ---------- 5) cemberli fici ----------
  function fici(renk, tohum) {
    const prof = []; for (let i = 0; i <= 12; i++) { const t = i / 12, y = (t - 0.5) * S * 0.96; prof.push([S * (0.4 + 0.07 * Math.sin(t * Pi)), y, 0.06 + t * 0.88]); }
    prof.unshift([S * 0.001, -S * 0.48, 0], [S * 0.36, -S * 0.48, 0.03]); prof.push([S * 0.36, S * 0.48, 0.97], [S * 0.001, S * 0.48, 1]);
    const map = tex(512, 256, (x, w, h) => {
      const r = rng(tohum), n = 16, sw = w / n;
      for (let i = 0; i < n; i++) { tahta(x, i * sw, 0, sw, h, i % 2 ? renk : koyu(renk, 0.06), r, false, 3); }
      x.fillStyle = koyu(renk, 0.45); x.fillRect(0, 0, w, h * 0.05); x.fillRect(0, h * 0.95, w, h * 0.05);
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(0,0,0,.25)'); g.addColorStop(0.2, 'rgba(255,255,255,.08)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.3)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    });
    const L = [[torna(prof, 32), 0]];
    for (const yy of [-0.3, 0.3]) { const t = (yy / 0.96) + 0.5, rr = S * (0.4 + 0.07 * Math.sin(t * Pi)); const tr = new THREE.TorusGeometry(rr + S * 0.012, S * 0.035, 8, 40); tr.rotateX(Pi / 2); tr.scale(1, 1.6, 1); tr.translate(0, yy * S, 0); L.push([tr, 1]); }
    for (const yy of [-0.46, 0.46]) { const tr = new THREE.TorusGeometry(S * 0.37, S * 0.03, 8, 40); tr.rotateX(Pi / 2); tr.translate(0, yy * S, 0); L.push([tr, 1]); }
    return { geo: topla(L), mat: [std({ map, roughness: 0.6, emissive: koyu(renk, 0.75), emissiveIntensity: 0.12 }), METAL], parca: std({ color: renk, roughness: 0.7 }) };
  }

  // ---------- 6) mantar tipali sise ----------
  const MANTAR = std({ roughness: 0.9, map: tex(64, 64, (x, w, h) => { x.fillStyle = '#c8945a'; x.fillRect(0, 0, w, h); const r = rng(5); for (let i = 0; i < 80; i++) { x.fillStyle = r() < 0.5 ? 'rgba(90,50,20,.3)' : 'rgba(255,230,190,.25)'; x.beginPath(); x.arc(r() * w, r() * h, 1 + r() * 2.5, 0, 6.283); x.fill(); } }) });
  function sise(renk) {
    const cam = [[S * 0.001, -S * 0.5, 0], [S * 0.3, -S * 0.5, 0.02], [S * 0.36, -S * 0.45, 0.06], [S * 0.37, -S * 0.1, 0.4], [S * 0.34, S * 0.06, 0.55], [S * 0.22, S * 0.18, 0.68], [S * 0.14, S * 0.24, 0.75], [S * 0.13, S * 0.34, 0.85], [S * 0.16, S * 0.36, 0.88], [S * 0.16, S * 0.4, 0.92], [S * 0.12, S * 0.41, 0.95]];
    const mantar = new THREE.CylinderGeometry(S * 0.12, S * 0.105, S * 0.16, 16); mantar.translate(0, S * 0.42, 0);
    // v4.3b: gorseldeki gibi renkli cam: govde renkli ve parlak, yanda dikey isik seridi, altta koyulasan renk, boyunda acik cam
    const camT = tex(256, 128, (x, w, h) => {
      let g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, koyu(renk, 0.5)); g.addColorStop(0.2, renk); g.addColorStop(0.6, koyu(renk, 0.12)); g.addColorStop(1, koyu(renk, 0.5)); x.fillStyle = g; x.fillRect(0, 0, w, h);
      for (const [u, a, sw] of [[0.12, 0.85, 0.035], [0.17, 0.35, 0.02], [0.62, 0.25, 0.05]]) { g = x.createLinearGradient((u - sw) * w, 0, (u + sw) * w, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,' + a + ')'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect((u - sw) * w, h * 0.12, sw * 2 * w, h * 0.8); }
    });
    const camM = std({ map: camT, roughness: 0.06, metalness: 0.05, envMapIntensity: 1.0, emissive: koyu(renk, 0.55), emissiveIntensity: 0.25 });
    return { geo: topla([[torna(cam, 28), 0], [mantar, 1]]), mat: [camM, MANTAR], parca: std({ color: renk, roughness: 0.2, transparent: true, opacity: 0.8 }) };
  }

  // ---------- 7) yuzeyli mucevher ----------
  // v5.1: daha cok yuzeyli (tabla + iki tac sirasi + kusak + kok), koyu doygun renk, ic parilti (emissive) ve parlak kaplama
  function mucevher(renk) {
    const prof = [[S * 0.001, -S * 0.47], [S * 0.3, -S * 0.2], [S * 0.49, S * 0.05], [S * 0.49, S * 0.1], [S * 0.42, S * 0.24], [S * 0.27, S * 0.33], [S * 0.001, S * 0.33]];
    let g = new THREE.LatheGeometry(prof.map(([a, b]) => new THREE.Vector2(a, b)), 10); g = g.toNonIndexed(); g.computeVertexNormals(); g.translate(0, S * 0.03, 0);
    const m = new THREE.MeshPhysicalMaterial({ color: renk, emissive: renk, emissiveIntensity: 0.18, roughness: 0.1, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.03, envMap: ENV, envMapIntensity: 0.75, flatShading: true });
    return { geo: g, mat: m, parca: std({ color: renk, roughness: 0.1, emissive: koyu(renk, 0.3), emissiveIntensity: 0.6 }) };
  }
  // cerceveli mucevher karosu (tahta cerceve icinde mavi tas)
  function mucevherKaro() {
    const renk = '#2a8cff', T = '#e08a30';
    const map = tex(512, 512, (x, w, h) => {
      const r = rng(91); tahta(x, 0, 0, w, h, koyu(T, 0.1), r, true, 6);
      x.save(); x.translate(w / 2, h / 2); x.rotate(Pi / 4); const s = w * 0.5;
      x.fillStyle = 'rgba(40,10,0,.4)'; x.fillRect(-s / 2 + 8, -s / 2 + 10, s, s); tahta(x, -s / 2, -s / 2, s, s, T, r, true, 7);
      const i = s * 0.68; const g = x.createLinearGradient(-i / 2, -i / 2, i / 2, i / 2); g.addColorStop(0, '#bfe6ff'); g.addColorStop(0.45, renk); g.addColorStop(1, '#0a3a9a'); x.fillStyle = g; x.fillRect(-i / 2, -i / 2, i, i);
      x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 3; x.beginPath(); x.moveTo(-i / 2, -i / 2); x.lineTo(0, 0); x.lineTo(i / 2, -i / 2); x.moveTo(-i / 2, i / 2); x.lineTo(0, 0); x.lineTo(i / 2, i / 2); x.stroke();
      x.strokeStyle = '#06286a'; x.lineWidth = 4; x.strokeRect(-i / 2, -i / 2, i, i); x.restore();
      for (const [cx, cy] of [[22, 22], [w - 22, 22], [22, h - 22], [w - 22, h - 22]]) civi(x, cx, cy, 8);
      hacim(x, w, h, 0.7);
    });
    return { geo: kutu(S, S, S, S * 0.06, 2), mat: std({ map, roughness: 0.45, envMapIntensity: 0.8, emissive: '#102040', emissiveIntensity: 0.15 }), parca: std({ color: T }) };
  }

  // ---------- 8) catlakli buz ----------
  function buzKup(tohum, wS = 1) {
    const map = tex(256 * wS, 256, (x, w, h) => {
      const r = rng(tohum); let g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#8fdcff'); g.addColorStop(0.4, '#1c8cf0'); g.addColorStop(1, '#0840b8'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      for (let k = 0; k < 5; k++) { x.strokeStyle = 'rgba(255,255,255,' + (0.4 + r() * 0.4) + ')'; x.lineWidth = 1.5 + r() * 2; x.beginPath(); let px = r() * w, py = r() * h; x.moveTo(px, py); for (let i = 0; i < 4; i++) { px += (r() - 0.5) * w * 0.5; py += (r() - 0.5) * h * 0.5; x.lineTo(px, py); } x.stroke(); }
      x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 8; x.beginPath(); x.moveTo(6, h - 20); x.lineTo(6, 6); x.lineTo(w - 20, 6); x.stroke();
      x.strokeStyle = 'rgba(10,60,160,.55)'; x.lineWidth = 6; x.beginPath(); x.moveTo(w - 4, 16); x.lineTo(w - 4, h - 4); x.lineTo(16, h - 4); x.stroke();
      g = x.createRadialGradient(w * 0.28, h * 0.22, 0, w * 0.28, h * 0.22, w * 0.4); g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    });
    return { geo: kutu(wS * S, S, S, S * 0.11, 3), mat: new THREE.MeshPhysicalMaterial({ map, transparent: true, opacity: 0.96, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.04, envMap: ENV, envMapIntensity: 0.7, emissive: '#0a3a9a', emissiveIntensity: 0.35 }), parca: std({ color: '#bfe6ff', roughness: 0.1, transparent: true, opacity: 0.85 }) };
  }

  // ---------- 9) altin yildiz blok ----------
  function yildizBlok() {
    const R = '#ffc21a', star = (x, s) => { x.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? s * 0.42 : s, a = -Pi / 2 + i * Pi / 5; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.closePath(); };
    const map = tex(256, 256, (x, w, h) => {
      let g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffe680'); g.addColorStop(0.5, R); g.addColorStop(1, '#d88a00'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#b86a00'; x.lineWidth = 8; x.strokeRect(24, 24, w - 48, h - 48); x.strokeStyle = 'rgba(255,250,210,.7)'; x.lineWidth = 3; x.strokeRect(29, 29, w - 58, h - 58);
      x.save(); x.translate(w / 2, h / 2 + 4); star(x, w * 0.3); x.fillStyle = 'rgba(120,60,0,.45)'; x.fill(); x.restore();
      x.save(); x.translate(w / 2, h / 2); star(x, w * 0.3); g = x.createLinearGradient(0, -w * 0.3, 0, w * 0.3); g.addColorStop(0, '#fff6c0'); g.addColorStop(1, '#ffb400'); x.fillStyle = g; x.fill(); x.strokeStyle = '#b86a00'; x.lineWidth = 6; x.stroke(); x.restore();
      hacim(x, w, h, 0.9);
    });
    const bump = bumpT(128, 128, (x, w, h) => { x.translate(w / 2, h / 2); x.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? w * 0.13 : w * 0.3, a = -Pi / 2 + i * Pi / 5; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.closePath(); x.fillStyle = '#e8e8e8'; x.fill(); });
    const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const rr = (i % 2 ? 0.13 : 0.3) * S, a = Pi / 2 + i * Pi / 5; i ? sh.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : sh.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    const L = [[kutu(S, S, S, S * 0.13, 3), 0]];
    for (const z of [1, -1]) { const y = new THREE.ExtrudeGeometry(sh, { depth: S * 0.02, bevelEnabled: true, bevelThickness: S * 0.04, bevelSize: S * 0.03, bevelSegments: 2 }); y.computeVertexNormals(); if (z < 0) y.rotateY(Pi); y.translate(0, 0, z * S * 0.5); L.push([y, 1]); }
    const ALT = new THREE.MeshPhysicalMaterial({ color: '#ffc828', metalness: 1, roughness: 0.18, clearcoat: 0.6, envMap: ENV, envMapIntensity: 1.6, emissive: '#6a3c00', emissiveIntensity: 0.35 });
    return { geo: topla(L), mat: [std({ map, bumpMap: bump, bumpScale: 3, roughness: 0.28, metalness: 0.35, envMapIntensity: 1.2, emissive: '#5a3000', emissiveIntensity: 0.18 }), ALT], parca: std({ color: R, metalness: 0.4, roughness: 0.3 }) };
  }

  // ---------- 10) sutunlar (1 x 2) ----------
  function tasSutun() {
    const prof = [[S * 0.001, -S, 0], [S * 0.48, -S, 0.01], [S * 0.48, -S * 0.86, 0.06], [S * 0.4, -S * 0.8, 0.09], [S * 0.38, -S * 0.7, 0.14], [S * 0.36, 0, 0.5], [S * 0.38, S * 0.7, 0.86], [S * 0.4, S * 0.8, 0.91], [S * 0.48, S * 0.86, 0.94], [S * 0.48, S, 0.99], [S * 0.001, S, 1]];
    const map = tex(256, 256, (x, w, h) => {
      const r = rng(47); tasCiz(x, w, h, 3, 4, '#a4a6b6', r);
      x.globalAlpha = 0.5; for (let i = 0; i < 8; i++) { const X = (i + 0.5) * w / 8; x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(X - 3, h * 0.15, 6, h * 0.7); x.fillStyle = 'rgba(255,255,255,.2)'; x.fillRect(X - 7, h * 0.15, 3, h * 0.7); } x.globalAlpha = 1;
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(0,0,0,.2)'); g.addColorStop(0.12, 'rgba(255,255,255,.15)'); g.addColorStop(0.16, 'rgba(0,0,0,0)'); g.addColorStop(0.84, 'rgba(0,0,0,0)'); g.addColorStop(0.88, 'rgba(255,255,255,.15)'); g.addColorStop(1, 'rgba(0,0,0,.25)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    });
    return { geo: torna(prof, 28), mat: std({ map, roughness: 0.85, envMapIntensity: 0.3 }), parca: std({ color: TASR, roughness: 0.9 }) };
  }
  function morSutun() {
    const prof = [[S * 0.001, -S, 0], [S * 0.46, -S, 0.01], [S * 0.47, -S * 0.82, 0.08], [S * 0.4, -S * 0.78, 0.1], [S * 0.4, S * 0.78, 0.9], [S * 0.47, S * 0.82, 0.92], [S * 0.46, S, 0.99], [S * 0.001, S, 1]];
    const map = tex(256, 256, (x, w, h) => {
      let g = x.createLinearGradient(0, 0, w, 0); for (let i = 0; i <= 8; i++) g.addColorStop(i / 8, i % 2 ? '#9a3ae8' : '#7a20c8'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#d8a0ff'); g.addColorStop(0.09, '#b060f0'); g.addColorStop(0.1, 'rgba(0,0,0,0)'); g.addColorStop(0.9, 'rgba(0,0,0,0)'); g.addColorStop(0.91, '#c070ff'); g.addColorStop(1, '#5a10a0'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    });
    const L = [[torna(prof, 28), 0]];
    for (const yy of [-0.8, 0.8]) { const t = new THREE.TorusGeometry(S * 0.425, S * 0.045, 8, 32); t.rotateX(Pi / 2); t.translate(0, yy * S, 0); L.push([t, 1]); }
    const ALT = new THREE.MeshPhysicalMaterial({ color: '#ffc02a', metalness: 1, roughness: 0.22, envMap: ENV, envMapIntensity: 1.5, emissive: '#5a3400', emissiveIntensity: 0.3 });
    return { geo: topla(L), mat: [std({ map, roughness: 0.25, metalness: 0.1, envMapIntensity: 1.1, emissive: '#3a0a60', emissiveIntensity: 0.2 }), ALT], parca: std({ color: '#8a30e0', roughness: 0.3 }) };
  }

  // ---------- 11) v5.1 tahta direk (1 x 2): dikey kalaslar, iki demir kusak, percinli ----------
  function direk() {
    const renk = '#d9822a';
    const map = tex(128, 256, (x, w, h) => { const r = rng(71); for (let i = 0; i < 3; i++) tahta(x, i * w / 3, 0, w / 3, h, i % 2 ? renk : koyu(renk, 0.07), r, false, 4); hacim(x, w, h, 0.7); });
    const L = [[kutu(S * 0.96, 2 * S, S * 0.96, S * 0.06, 2), 0]];
    for (const yy of [-0.62, 0.62]) { const b = kutu(S * 1.0, S * 0.16, S * 1.0, S * 0.03, 1); b.translate(0, yy * S, 0); L.push([b, 1]);
      for (const [sx, sz] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const p = new THREE.SphereGeometry(S * 0.035, 8, 5, 0, Pi * 2, 0, Pi / 2); p.rotateX(sz ? sz * Pi / 2 : 0); if (sx) p.rotateZ(-sx * Pi / 2); p.translate(sx * S * 0.5, yy * S, sz * S * 0.5); L.push([p, 1]); } }
    return { geo: topla(L), mat: [std({ map, roughness: 0.62, emissive: koyu(renk, 0.75), emissiveIntensity: 0.12 }), METAL], parca: std({ color: renk, roughness: 0.7 }) };
  }

  // ---------- tur tablosu (sekil.js TUR bicimi) ----------
  const T = (w, h, d, o) => Object.assign({ w, h, d, f: 0.62, r: 0.08 }, o);
  return {
    ksSandik: T(1, 1, 1, { mass: 0.9, ses: 'tahta', renk: '#e8892c', kir: 1, yuzer: 1, yap: () => sandik('#e2801e', 11) }),
    ksSandikM: T(1, 1, 1, { mass: 0.9, ses: 'tahta', renk: '#9a42d8', kir: 1, yuzer: 1, yap: () => sandik('#7c26c4', 13) }),
    ksSandikK: T(1, 1, 1, { mass: 0.9, ses: 'tahta', renk: '#e0322a', kir: 1, yuzer: 1, yap: () => sandik('#d82a24', 17) }),
    ksTNT: T(1, 1, 1, { mass: 0.9, ses: 'tahta', renk: '#e0322a', boom: 1.9, guc: 11, yap: () => sandik('#d82a24', 19, true) }),
    ksKalas1: T(1, 0.5, 1, { mass: 0.5, ses: 'tahta', renk: '#e8892c', kir: 1, yuzer: 1, yap: () => kalas(1, '#e8892c', 23) }),
    ksKalas2: T(2, 0.5, 1, { mass: 0.9, ses: 'tahta', renk: '#e8892c', kir: 1, carp: 9, yuzer: 1, yap: () => kalas(2, '#e8892c', 29) }),
    ksKalas3: T(3, 0.5, 1, { mass: 1.3, ses: 'tahta', renk: '#e8892c', kir: 1, carp: 10, yuzer: 1, yap: () => kalas(3, '#e8892c', 31) }),
    ksTas: T(1, 1, 1, { mass: 1.5, f: 0.72, r: 0.05, ses: 'tas', renk: TASR, sert: 1, yap: () => tasBlok(1, 1, 37) }),
    ksTas2: T(2, 1, 1, { mass: 2.6, f: 0.72, r: 0.05, ses: 'tas', renk: TASR, sert: 1, yap: () => tasBlok(2, 1, 41) }),
    ksTas3: T(3, 1, 1, { mass: 2.5, f: 0.72, r: 0.05, ses: 'tas', renk: TASR, sert: 1, yap: () => tasBlok(3, 1, 43) }),   // v5.1
    ksTas4: T(4, 1, 1, { mass: 2.8, f: 0.72, r: 0.05, ses: 'tas', renk: TASR, sert: 1, yap: () => tasBlok(4, 1, 45) }),   // v5.1
    ksBuz3: T(3, 1, 1, { mass: 2.2, f: 0.15, r: 0.08, ses: 'buz', renk: '#5ac0ff', kir: 1, carp: 9, yuzer: 1, yap: () => buzKup(59, 3) }),   // v5.1
    ksDirek: T(1, 2, 1, { mass: 1.2, f: 0.62, r: 0.12, ses: 'tahta', renk: '#d9822a', kir: 1, yuzer: 1, yap: direk }),   // v5.1
    ksKemer: T(3, 2, 1, { mass: 4.2, f: 0.75, r: 0.05, ses: 'tas', renk: TASR, sert: 1, yap: kemer }),
    ksFici: T(1, 1, 1, { mass: 1.0, f: 0.55, ses: 'tahta', renk: '#e8892c', sekil: 'sil', kir: 1, yuzer: 1, yap: () => fici('#e0862c', 43) }),
    ksFiciK: T(1, 1, 1, { mass: 1.0, f: 0.55, ses: 'tahta', renk: '#d8322a', sekil: 'sil', kir: 1, yuzer: 1, yap: () => fici('#d02a22', 47) }),
    ksSiseM: T(1, 1, 1, { mass: 0.7, f: 0.5, ses: 'cam', renk: '#a040ff', sekil: 'sil', kir: 1, carp: 7, yap: () => sise('#9a30ff') }),
    ksSiseY: T(1, 1, 1, { mass: 0.7, f: 0.5, ses: 'cam', renk: '#30d050', sekil: 'sil', kir: 1, carp: 7, yap: () => sise('#22c040') }),
    ksSiseB: T(1, 1, 1, { mass: 0.7, f: 0.5, ses: 'cam', renk: '#3090ff', sekil: 'sil', kir: 1, carp: 7, yap: () => sise('#2080ff') }),
    ksYakut: T(1, 1, 1, { mass: 0.8, f: 0.5, ses: 'cam', renk: '#ff2a44', sekil: 'sil', kir: 1, carp: 8, yap: () => mucevher('#b00018') }),
    ksElmas: T(1, 1, 1, { mass: 0.8, f: 0.5, ses: 'cam', renk: '#40a8ff', sekil: 'sil', kir: 1, carp: 8, yap: () => mucevher('#0a52d0') }),
    ksKaro: T(1, 1, 1, { mass: 0.9, ses: 'tahta', renk: '#2a8cff', kir: 1, yuzer: 1, yap: mucevherKaro }),
    ksBuz: T(1, 1, 1, { mass: 0.95, f: 0.15, r: 0.1, ses: 'buz', renk: '#5ac0ff', kir: 1, carp: 7, yuzer: 1, yap: () => buzKup(53) }),
    ksYildiz: T(1, 1, 1, { mass: 1.2, f: 0.6, r: 0.13, ses: 'tas', renk: '#ffc21a', sert: 1, yap: yildizBlok }),
    ksSutun: T(1, 2, 1, { mass: 2.2, f: 0.7, r: 0.05, ses: 'tas', renk: TASR, sekil: 'sil', sert: 1, yap: tasSutun }),
    ksMorSutun: T(1, 2, 1, { mass: 1.6, f: 0.6, r: 0.06, ses: 'tas', renk: '#8a30e0', sekil: 'sil', yap: morSutun })
  };
}

// ---------- yapilar: Korsan Kalesi (Adem'in kale gorselinden) ----------
// [i (orta), j (alt kenar, kup cinsinden), k (derinlik), tur]. Simetrik, 7 genis.
export function kaleYapi(o = {}) {
  const D = o.d || 1, L = [], s = o.sise || 'ksSiseM', s2 = o.sise2 || 'ksSiseY', fc = o.fici || 'ksFici';
  for (let k = 0; k < D; k++) {
    L.push([0, 0, k, 'ksSandik'], [1, 0, k, 'ksSandik'], [3, 0, k, 'ksKemer'], [5, 0, k, 'ksSandik'], [6, 0, k, 'ksSandik']);
    L.push([0, 1, k, 'ksSutun'], [1, 1, k, 'ksMorSutun'], [5, 1, k, 'ksMorSutun'], [6, 1, k, 'ksSutun']);
    L.push([2, 2, k, 'ksSandikM'], [3, 2, k, k === 0 ? 'ksKaro' : 'ksSandik'], [4, 2, k, 'ksSandikM']);
    L.push([0, 3, k, 'ksYildiz'], [1, 3, k, 'ksBuz'], [2, 3, k, fc], [3, 3, k, 'ksTNT'], [4, 3, k, fc], [5, 3, k, 'ksBuz'], [6, 3, k, 'ksYildiz']);
    L.push([1, 4, k, 'ksKalas3'], [3, 4, k, 'ksKalas1'], [5, 4, k, 'ksKalas3']);
    L.push([0, 4.5, k, s2], [1, 4.5, k, 'ksFiciK'], [2, 4.5, k, 'ksTas'], [3, 4.5, k, 'ksBuz'], [4, 4.5, k, 'ksTas'], [5, 4.5, k, 'ksFiciK'], [6, 4.5, k, s2]);
    L.push([1, 5.5, k, 'ksKalas3'], [3, 5.5, k, 'ksKalas1'], [5, 5.5, k, 'ksKalas3']);
    L.push([1, 6, k, 'ksSandik'], [2, 6, k, s], [3, 6, k, 'ksSandik'], [4, 6, k, s], [5, 6, k, 'ksSandik']);
  }
  L.push([3, 7, (D - 1) / 2, 'ksYakut']);
  return L;
}
// Hazine Kulesi: dar ve yuksek (ikinci gorsel), tas taban, sise/fici katlari, tepede mucevher
export function hazineYapi(o = {}) {
  const D = o.d || 1, L = [];
  for (let k = 0; k < D; k++) {
    for (let i = 0; i < 5; i++) L.push([i, 0, k, 'ksTas']);
    L.push([0, 1, k, 'ksSutun'], [1, 1, k, 'ksSiseB'], [2, 1, k, 'ksSandikK'], [3, 1, k, 'ksSiseB'], [4, 1, k, 'ksSutun']);
    L.push([1, 2, k, 'ksSandik'], [2, 2, k, 'ksElmas'], [3, 2, k, 'ksSandik']);
    L.push([0, 3, k, 'ksKalas1'], [2, 3, k, 'ksKalas3'], [4, 3, k, 'ksKalas1']);
    L.push([0, 3.5, k, 'ksFiciK'], [1, 3.5, k, 'ksBuz'], [2, 3.5, k, 'ksTNT'], [3, 3.5, k, 'ksBuz'], [4, 3.5, k, 'ksFiciK']);
    L.push([1, 4.5, k, 'ksKalas3'], [3.5, 4.5, k, 'ksKalas2']);
    L.push([0, 5, k, 'ksSiseY'], [1, 5, k, 'ksSandikM'], [2, 5, k, 'ksYildiz'], [3, 5, k, 'ksSandikM'], [4, 5, k, 'ksSiseY']);
  }
  L.push([2, 6, (D - 1) / 2, 'ksYakut']);
  return L;
}
