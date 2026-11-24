// Foxi Smash v12.9 deneme (24 Kas 2026, Adem: 'kalitede yine cok fark var referanslarla', Smash Kingdom ekranlari). Anahtar ?blok6=1.
// Rakipte kaliteyi yapan: keskin ince pahli kutu, boyali doku (yuz duz tek renk degil), iri sade kontrastli amblem, yuzde isik gecisi (ust acik, alt koyu,
// ust kenarda ince parlak cizgi). Renk ve motif bizim: turkuaz kristal, tahta sandik, renkli boyali kup + krem tilki patisi (mor-altin ve tac yok).
// Geometri: BoxGeometry kose pahi (tek dilim) ; doku: tek atlas (sol: on/arka yuz amblemli, sag: diger yuzler duz), kodla boyanir, tur basina bir kez.
export const BLOK6 = new URLSearchParams(location.search).get('blok6') === '1';
export function blok6Kur({ THREE, ENV, S }) {
  const HAZ = {};
  let tohum = 1; const rnd = () => ((tohum = (tohum * 16807) % 2147483647) / 2147483647);
  const hx = (h) => { h = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };   // sRGB (THREE.Color dogrusal verir, renk kayiyordu)
  const rgb = (c, k = 0, a = 1) => { const f = (x) => Math.round(Math.max(0, Math.min(255, k >= 0 ? x + (255 - x) * k : x * (1 + k)))); return `rgba(${f(c[0])},${f(c[1])},${f(c[2])},${a})`; };
  // ---------- geometri: pahli kutu ----------
  function kutu(w, h, d, r) {
    const g = new THREE.BoxGeometry(w, h, d, 3, 3, 3), p = g.attributes.position, A = [w / 2, h / 2, d / 2], v = new THREE.Vector3(), ic = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      for (let k = 0; k < 3; k++) { const a = A[k], c = v.getComponent(k); if (Math.abs(Math.abs(c) - a / 3) < 1e-4) v.setComponent(k, Math.sign(c) * (a - r)); }
      for (let k = 0; k < 3; k++) ic.setComponent(k, Math.max(-(A[k] - r), Math.min(A[k] - r, v.getComponent(k))));
      const o = v.clone().sub(ic); if (o.lengthSq() > 1e-9) v.copy(ic).add(o.normalize().multiplyScalar(r));
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals(); return g;
  }
  // BoxGeometry yuz sirasi: +x -x +y -y +z -z ; +z/-z (on/arka) atlasin sol bolumu, digerleri sag (her kose bir kez kaydirilir)
  function uvAtlas2(g, oran) {
    const uv = g.attributes.uv, u0 = uv.array.slice(), gor = new Uint8Array(uv.count);
    for (const q of g.groups) for (let j = q.start; j < q.start + q.count; j++) { const i = g.index.getX(j); if (gor[i]) continue; gor[i] = 1; const u = u0[i * 2]; uv.setX(i, q.materialIndex >= 4 ? u * oran : oran + u * (1 - oran)); }
    g.clearGroups(); return g;
  }
  // ---------- boyama ----------
  function pati(x, cx, cy, s, renk, golge) {
    const e = (ex, ey, rx, ry, a) => { x.beginPath(); x.ellipse(cx + ex * s, cy + ey * s, rx * s, ry * s, a || 0, 0, 6.2832); x.fill(); };
    const ciz = () => { e(0, 0.12, 0.27, 0.22); e(-0.31, -0.13, 0.095, 0.125, -0.45); e(-0.11, -0.3, 0.1, 0.13, -0.14); e(0.11, -0.3, 0.1, 0.13, 0.14); e(0.31, -0.13, 0.095, 0.125, 0.45); };
    x.save(); x.fillStyle = golge; x.translate(s * 0.03, s * 0.05); ciz(); x.restore();
    x.fillStyle = renk; ciz();
    x.save(); x.globalAlpha = 0.5; x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(cx - 0.08 * s, cy + 0.06 * s, 0.11 * s, 0.06 * s, -0.3, 0, 6.2832); x.fill(); x.restore();
  }
  function lekeler(x, X, W, H, c, n, a) { for (let i = 0; i < n; i++) { const r = (0.08 + rnd() * 0.25) * H, px = X + rnd() * W, py = rnd() * H, g = x.createRadialGradient(px, py, 0, px, py, r), k = rnd() < 0.5 ? 0.35 : -0.3; g.addColorStop(0, rgb(c, k, a)); g.addColorStop(1, rgb(c, k, 0)); x.fillStyle = g; x.fillRect(px - r, py - r, 2 * r, 2 * r); } }
  function kenar(x, X, W, H, c) {   // ust kenarda parlak cizgi, altta koyu, yanlarda hafif koyu (her yuz bolgesi icin)
    let g = x.createLinearGradient(0, 0, 0, H * 0.1); g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(X, 0, W, H * 0.1);
    g = x.createLinearGradient(0, H * 0.88, 0, H); g.addColorStop(0, rgb(c, -0.6, 0)); g.addColorStop(1, rgb(c, -0.6, 0.45)); x.fillStyle = g; x.fillRect(X, H * 0.88, W, H * 0.12);
    for (const [a, b] of [[X, X + W * 0.05], [X + W, X + W * 0.95]]) { g = x.createLinearGradient(a, 0, b, 0); g.addColorStop(0, rgb(c, -0.5, 0.3)); g.addColorStop(1, rgb(c, -0.5, 0)); x.fillStyle = g; x.fillRect(Math.min(a, b), 0, Math.abs(b - a), H); }
  }
  function boya(stil, hex, n) {
    const H = 256, W1 = 256 * n, W = W1 + 256, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d'), c = hx(hex); tohum = 7 + n * 13 + hex.length;
    for (const [X, Wb, on] of [[0, W1, 1], [W1, 256, 0]]) {
      x.save(); x.beginPath(); x.rect(X, 0, Wb, H); x.clip();
      if (stil === 'kristal') {
        let g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#6ff0ff'); g.addColorStop(0.45, '#12b8ea'); g.addColorStop(1, '#0670bc'); x.fillStyle = g; x.fillRect(X, 0, Wb, H);
        lekeler(x, X, Wb, H, [20, 160, 230], 12 * (on ? n : 1), 0.45);
        for (let i = 0; i < 4 * (on ? n : 1); i++) { const px = X + rnd() * Wb, py = H * (0.3 + rnd() * 0.6), r = H * (0.15 + rnd() * 0.2), g2 = x.createRadialGradient(px, py, 0, px, py, r); g2.addColorStop(0, 'rgba(0,60,150,0.35)'); g2.addColorStop(1, 'rgba(0,60,150,0)'); x.fillStyle = g2; x.fillRect(px - r, py - r, 2 * r, 2 * r); }   // derin koyu cekirdek
        x.lineCap = 'round';
        for (let i = 0; i < 14 * (on ? n : 1); i++) {   // ic catlaklar: kisa, ince, yari saydam kirik cizgiler (buz ici)
          let px = X + rnd() * Wb, py = rnd() * H; const pts = [[px, py]]; for (let k = 0; k < 3; k++) { px += (rnd() - 0.5) * 50; py += (rnd() - 0.5) * 40; pts.push([px, py]); }
          for (const [st, lw, dx] of [['rgba(0,50,110,0.18)', 2.2, 1.5], ['rgba(230,255,255,' + (0.25 + rnd() * 0.3).toFixed(2) + ')', 1.1, 0]]) { x.strokeStyle = st; x.lineWidth = lw; x.beginPath(); pts.forEach(([a, b], k) => (k ? x.lineTo(a + dx, b + dx) : x.moveTo(a + dx, b + dx))); x.stroke(); }
        }
        g = x.createLinearGradient(X, 0, X + Wb, H); g.addColorStop(0.15, 'rgba(255,255,255,0)'); g.addColorStop(0.3, 'rgba(255,255,255,0.28)'); g.addColorStop(0.42, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(X, 0, Wb, H);   // capraz parilti
        x.strokeStyle = 'rgba(220,255,255,0.75)'; x.lineWidth = 7; x.strokeRect(X + 6, 6, Wb - 12, H - 12);   // ic kenar isigi
      } else if (stil === 'tahta') {
        const T = [201, 116, 47], ns = 3;
        for (let k = 0; k < ns; k++) {
          const y0 = k * H / ns, t = [T[0] * (0.92 + rnd() * 0.16), T[1] * (0.92 + rnd() * 0.16), T[2]]; let g = x.createLinearGradient(0, y0, 0, y0 + H / ns); g.addColorStop(0, rgb(t, 0.18)); g.addColorStop(1, rgb(t, -0.12)); x.fillStyle = g; x.fillRect(X, y0, Wb, H / ns);
          x.strokeStyle = rgb(T, -0.5, 0.45); x.lineWidth = 2.2; for (let j = 0; j < 4; j++) { const yy = y0 + 10 + j * (H / ns - 16) / 3, f = rnd() * 6; x.beginPath(); for (let u = 0; u <= Wb; u += 12) x.lineTo(X + u, yy + Math.sin(u * 0.03 + f) * 3); x.stroke(); }
          x.fillStyle = rgb(T, -0.7, 0.9); x.fillRect(X, y0 - 3, Wb, 6);
        }
        x.fillStyle = '#4a4f5c'; for (const a of [X, X + Wb - 40]) for (const b of [0, H - 40]) { x.fillRect(a, b, 40, 40); x.fillStyle = '#c9cfdb'; x.beginPath(); x.arc(a + 20, b + 20, 7, 0, 6.2832); x.fill(); x.fillStyle = '#4a4f5c'; }   // demir kose
        if (on) for (let i = 0; i < n; i++) pati(x, X + 128 + i * 256, H * 0.55, H * 0.36, '#fff3dc', 'rgba(60,25,5,0.45)');
      } else {
        let g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, rgb(c, 0.22)); g.addColorStop(0.5, rgb(c, 0)); g.addColorStop(1, rgb(c, -0.22)); x.fillStyle = g; x.fillRect(X, 0, Wb, H);
        lekeler(x, X, Wb, H, c, 14 * (on ? n : 1), 0.16);
        if (on) { const k = n === 1 ? 1 : 0; for (let i = 0; i < (k ? 1 : 1); i++) pati(x, X + Wb / 2, H * 0.56, H * 0.48, '#fff3dc', rgb(c, -0.55, 0.55)); }
      }
      if (stil !== 'kristal') kenar(x, X, Wb, H, stil === 'tahta' ? [201, 116, 47] : c);
      x.restore();
    }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { t, oran: W1 / W };
  }
  // ---------- tur secimi ----------
  function stilOf(k) {
    if (/^ksSandik/.test(k)) return ['tahta', 1];
    const m = /^(oy|uz(\d))([A-Z])$/.exec(k); if (!m) return null;
    return [m[3] === 'L' || m[3] === 'A' ? 'kristal' : 'boya', m[2] ? +m[2] : 1, m[3]];
  }
  function yap(k, hex) {
    if (HAZ[k]) return HAZ[k]; const s = stilOf(k); if (!s) return null;
    const [stil, n] = s, { t, oran } = boya(stil, hex, n), geo = uvAtlas2(kutu(n * S * 0.994, S * 0.992, S * 0.992, 0.065 * S), oran);
    const mat = stil === 'kristal' ? new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.22, clearcoat: 0.6, clearcoatRoughness: 0.08, envMap: ENV, envMapIntensity: 0.3, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.35 })
      : new THREE.MeshPhysicalMaterial({ map: t, roughness: stil === 'tahta' ? 0.6 : 0.38, clearcoat: stil === 'tahta' ? 0.2 : 0.5, clearcoatRoughness: 0.2, envMap: ENV, envMapIntensity: 0.35 });
    mat.toneMapped = false; mat.userData.yeni = 1;
    return (HAZ[k] = { geo, mat, golgeKutu: 1, parca: new THREE.MeshStandardMaterial({ color: stil === 'kristal' ? '#3fd6f2' : stil === 'tahta' ? '#c9742f' : hex, roughness: 0.5 }) });
  }
  return { var: (k) => !!stilOf(k), yap };
}
