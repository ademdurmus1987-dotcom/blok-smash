// Foxi Smash v12.9 deneme (24 Kas 2026, Adem: 'kalitede yine cok fark var referanslarla', Smash Kingdom ekranlari). Anahtar ?blok6=1.
// Rakipte kaliteyi yapan: keskin ince pahli kutu, boyali doku (yuz duz tek renk degil), iri sade kontrastli amblem, yuzde isik gecisi (ust acik, alt koyu,
// ust kenarda ince parlak cizgi). Renk ve motif bizim: turkuaz kristal, tahta sandik, renkli boyali kup + krem tilki patisi (mor-altin ve tac yok).
// Geometri: BoxGeometry kose pahi (tek dilim) ; doku: tek atlas (sol: on/arka yuz amblemli, sag: diger yuzler duz), kodla boyanir, tur basina bir kez.
import { BLOK7, blok7Kur } from './blok7.js?v=1';
import { temasEkle } from './blok8.js?v=16';   // v12.68 temas karartmasi
export const BLOK6 = new URLSearchParams(location.search).get('blok6') !== '0';   // v12.13: VARSAYILAN (Adem onayladi 24 Kas), eski gorunum ?blok6=0
// v12.65 (Adem 26 Kas, yapay zeka ile iyilestirilmis ekran goruntusu: 'kalite farkina bak'): CILA2 VARSAYILAN, eski ?cila2=0.
// Renkli bloklarda leke yok (puruzsuz plastik), daha kalin pah, vernik + studyo yansimasi (SENV: ust kenarda beyaz parlama).
const CILA2 = !/[?&]cila2=0/.test(location.search);
export function blok6Kur({ THREE, ENV, S, SENV }) {
  const PENV = CILA2 && SENV ? SENV : ENV; let LEKE = true;
  const HAZ = {}, B7 = BLOK7 ? blok7Kur({ THREE, ENV }) : null;
  let tohum = 1; const rnd = () => ((tohum = (tohum * 16807) % 2147483647) / 2147483647);
  const hx = (h) => { h = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };   // sRGB (THREE.Color dogrusal verir, renk kayiyordu)
  const doyur = (c, f) => { const m = (c[0] + c[1] + c[2]) / 3; return c.map((v) => Math.max(0, Math.min(255, m + (v - m) * f))); };
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
    // UV konumdan yeniden: kose kaydirma ara koselerin UV'sini 1/3, 2/3'te birakiyordu (yuzde dokunun yalniz ortasi gorunuyordu)
    const uv = g.attributes.uv, U = (x, a) => (x + a) / (2 * a);
    for (const q of g.groups) for (let j = q.start; j < q.start + q.count; j++) {
      const i = g.index.getX(j), x = p.getX(i), y = p.getY(i), z = p.getZ(i), [a, b, c] = A;
      const [u, vv] = [[U(-z, c), U(y, b)], [U(z, c), U(y, b)], [U(x, a), U(-z, c)], [U(x, a), U(z, c)], [U(x, a), U(y, b)], [U(-x, a), U(y, b)]][q.materialIndex];
      uv.setXY(i, u, vv);
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
  function yildiz(x, cx, cy, r, renk, golge) {   // v12.10: iri bes koseli yildiz amblemi (yuvarlak uclu)
    const ciz = () => { x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.47 : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); };
    x.save(); x.lineJoin = 'round'; x.translate(r * 0.05, r * 0.08); ciz(); x.fillStyle = golge; x.strokeStyle = golge; x.lineWidth = r * 0.16; x.fill(); x.stroke(); x.restore();
    x.save(); x.lineJoin = 'round'; ciz(); x.fillStyle = renk; x.strokeStyle = renk; x.lineWidth = r * 0.16; x.fill(); x.stroke();
    x.globalAlpha = 0.5; x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(cx - r * 0.18, cy - r * 0.12, r * 0.2, r * 0.09, -0.5, 0, 6.2832); x.fill(); x.restore();
  }
  function lekeler(x, X, W, H, c, n, a) { if (!LEKE) return; for (let i = 0; i < n; i++) { const r = (0.08 + rnd() * 0.25) * H, px = X + rnd() * W, py = rnd() * H, g = x.createRadialGradient(px, py, 0, px, py, r), k = rnd() < 0.5 ? 0.35 : -0.3; g.addColorStop(0, rgb(c, k, a)); g.addColorStop(1, rgb(c, k, 0)); x.fillStyle = g; x.fillRect(px - r, py - r, 2 * r, 2 * r); } }
  function kenar(x, X, W, H, c) {   // ust kenarda parlak cizgi, altta koyu, yanlarda hafif koyu (her yuz bolgesi icin)
    let g = x.createLinearGradient(0, 0, 0, H * 0.1); g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(X, 0, W, H * 0.1);
    g = x.createLinearGradient(0, H * 0.88, 0, H); g.addColorStop(0, rgb(c, -0.6, 0)); g.addColorStop(1, rgb(c, -0.6, 0.45)); x.fillStyle = g; x.fillRect(X, H * 0.88, W, H * 0.12);
    for (const [a, b] of [[X, X + W * 0.05], [X + W, X + W * 0.95]]) { g = x.createLinearGradient(a, 0, b, 0); g.addColorStop(0, rgb(c, -0.5, 0.3)); g.addColorStop(1, rgb(c, -0.5, 0)); x.fillStyle = g; x.fillRect(Math.min(a, b), 0, Math.abs(b - a), H); }
  }
  function boya(stil, hex, n) {
    const H = 256, W1 = 256 * n, W = W1 + 256, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d'), c = hx(hex); tohum = 7 + n * 13 + hex.length; LEKE = !CILA2 || stil === 'tas' || stil === 'tnt' || stil === 'kristal';
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
        if (on) for (let i = 0; i < n; i++) pati(x, X + 128 + i * 256, H * 0.55, H * 0.62, '#fff3dc', 'rgba(60,25,5,0.45)');
      } else if (stil === 'tas') {   // boyali tas: mavi-gri, lekeler, ince benekler, her birimde oyma halka
        let g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, rgb(c, 0.2)); g.addColorStop(1, rgb(c, -0.3)); x.fillStyle = g; x.fillRect(X, 0, Wb, H);
        lekeler(x, X, Wb, H, c, 16 * (on ? n : 1), 0.22);
        for (let i = 0; i < 260 * (on ? n : 1); i++) { x.fillStyle = rnd() < 0.5 ? rgb(c, -0.4, 0.35) : rgb(c, 0.4, 0.35); x.fillRect(X + rnd() * Wb, rnd() * H, 2, 2); }
        x.strokeStyle = rgb(c, -0.55, 0.5); x.lineWidth = 3; for (let i = 0; i < 3; i++) { x.beginPath(); let px = X + rnd() * Wb, py = rnd() * H; x.moveTo(px, py); for (let k = 0; k < 3; k++) { px += (rnd() - 0.5) * 60; py += (rnd() - 0.5) * 50; x.lineTo(px, py); } x.stroke(); }   // catlak
        if (on) for (let i = 0; i < n; i++) { const cx = X + 128 + i * 256, cy = H * 0.52; x.lineWidth = 22; x.strokeStyle = rgb(c, 0.45, 0.7); x.beginPath(); x.arc(cx + 3, cy + 4, 70, 0, 6.2832); x.stroke(); x.strokeStyle = rgb(c, -0.6, 0.8); x.beginPath(); x.arc(cx, cy, 70, 0, 6.2832); x.stroke(); }
      } else if (stil === 'tnt') {
        let g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ff5a44'); g.addColorStop(1, '#b8160f'); x.fillStyle = g; x.fillRect(X, 0, Wb, H);
        lekeler(x, X, Wb, H, [230, 40, 30], 10, 0.2);
        x.fillStyle = '#fff1d6'; x.fillRect(X, H * 0.33, Wb, H * 0.34); x.fillStyle = 'rgba(90,20,10,0.35)'; x.fillRect(X, H * 0.64, Wb, H * 0.03);
        if (on) { x.font = 'bold 84px Arial Black, Arial, sans-serif'; { const m = x.measureText('TNT').width; if (m > Wb * 0.8) x.font = 'bold ' + Math.floor(84 * Wb * 0.8 / m) + 'px Arial Black, Arial, sans-serif'; } x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = 'rgba(80,10,5,0.35)'; x.fillText('TNT', X + Wb / 2 + 3, H * 0.505 + 4); x.fillStyle = '#c4170f'; x.fillText('TNT', X + Wb / 2, H * 0.505); }
      } else if (stil === 'kalas') {   // uzun tahta kalas: boyuna damar, iki ucta demir bant
        const T = [214, 128, 52]; let g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, rgb(T, 0.2)); g.addColorStop(1, rgb(T, -0.2)); x.fillStyle = g; x.fillRect(X, 0, Wb, H);
        x.strokeStyle = rgb(T, -0.5, 0.4); x.lineWidth = 2.4; for (let j = 0; j < 6; j++) { const yy = 20 + j * 40, f = rnd() * 6; x.beginPath(); for (let u = 0; u <= Wb; u += 10) x.lineTo(X + u, yy + Math.sin(u * 0.02 + f) * 5); x.stroke(); }
        for (let i = 0; i < 2 * (on ? n : 1); i++) { const bx = X + rnd() * Wb, by = rnd() * H; x.fillStyle = rgb(T, -0.55, 0.6); x.beginPath(); x.ellipse(bx, by, 14, 8, 0, 0, 6.2832); x.fill(); }   // budak
        if (on) for (const a of [X + 30, X + Wb - 60]) { x.fillStyle = '#4a4f5c'; x.fillRect(a, 0, 30, H); x.fillStyle = '#c9cfdb'; for (const b of [H * 0.25, H * 0.75]) { x.beginPath(); x.arc(a + 15, b, 7, 0, 6.2832); x.fill(); } }
      } else if (stil === 'yildiz') {   // v12.10: sari-turuncu boyali kup, iri krem yildiz
        let g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ffd84a'); g.addColorStop(0.55, '#ffb21e'); g.addColorStop(1, '#e9780c'); x.fillStyle = g; x.fillRect(X, 0, Wb, H);
        lekeler(x, X, Wb, H, [255, 180, 30], 12, 0.18);
        if (on) yildiz(x, X + Wb / 2, H * 0.53, H * 0.4, '#fff3dc', 'rgba(150,60,0,0.5)');
      } else if (stil === 'direk') {   // v12.10: dikey tahta direk: boyuna (dikey) damar, ust-altta demir bant
        const T = [214, 128, 52]; let g = x.createLinearGradient(X, 0, X + Wb, 0); g.addColorStop(0, rgb(T, -0.2)); g.addColorStop(0.45, rgb(T, 0.2)); g.addColorStop(1, rgb(T, -0.2)); x.fillStyle = g; x.fillRect(X, 0, Wb, H);
        x.strokeStyle = rgb(T, -0.5, 0.4); x.lineWidth = 2.4; for (let j = 0; j < 6; j++) { const xx = X + 22 + j * (Wb - 44) / 5, f = rnd() * 6; x.beginPath(); for (let v = 0; v <= H; v += 10) x.lineTo(xx + Math.sin(v * 0.03 + f) * 4, v); x.stroke(); }
        x.fillStyle = rgb(T, -0.55, 0.6); x.beginPath(); x.ellipse(X + Wb * (0.3 + rnd() * 0.4), H * 0.5, 7, 12, 0, 0, 6.2832); x.fill();
        if (on) for (const b of [12, H - 34]) { x.fillStyle = '#4a4f5c'; x.fillRect(X, b, Wb, 22); x.fillStyle = '#c9cfdb'; for (const a of [0.25, 0.75]) { x.beginPath(); x.arc(X + Wb * a, b + 11, 5, 0, 6.2832); x.fill(); } }
      } else if (CILA2 && stil === 'boya') {   // v12.65: puruzsuz parlak plastik: doygun renk, ust yuz acik, onde belirgin gecis, ustte kalin parlama bandi
        const k2 = doyur(c, 1.18);
        let g = x.createLinearGradient(0, 0, 0, H);
        if (on) { g.addColorStop(0, rgb(k2, 0.34)); g.addColorStop(0.22, rgb(k2, 0.08)); g.addColorStop(0.62, rgb(k2, -0.04)); g.addColorStop(1, rgb(k2, -0.3)); }
        else { g.addColorStop(0, rgb(k2, 0.3)); g.addColorStop(1, rgb(k2, 0.12)); }
        x.fillStyle = g; x.fillRect(X, 0, Wb, H);
        if (on) { const gb = x.createLinearGradient(0, H * 0.07, 0, H * 0.24); gb.addColorStop(0, 'rgba(255,255,255,0)'); gb.addColorStop(0.35, 'rgba(255,255,255,0.5)'); gb.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gb; x.fillRect(X + Wb * 0.06, H * 0.07, Wb * 0.88, H * 0.17); }
        if (on) { const kk = n === 1 ? 1 : 0; pati(x, X + Wb / 2, H * 0.56, H * 0.8, '#fff6e6', rgb(k2, -0.6, 0.6)); }
      } else {
        let g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, rgb(c, 0.22)); g.addColorStop(0.5, rgb(c, 0)); g.addColorStop(1, rgb(c, -0.22)); x.fillStyle = g; x.fillRect(X, 0, Wb, H);
        lekeler(x, X, Wb, H, c, 14 * (on ? n : 1), 0.16);
        if (on) { const k = n === 1 ? 1 : 0; for (let i = 0; i < (k ? 1 : 1); i++) pati(x, X + Wb / 2, H * 0.55, H * 0.8, '#fff3dc', rgb(c, -0.55, 0.55)); }
      }
      if (stil !== 'kristal') kenar(x, X, Wb, H, stil === 'tahta' ? [201, 116, 47] : stil === 'kalas' || stil === 'direk' ? [214, 128, 52] : stil === 'yildiz' ? [233, 120, 12] : stil === 'tnt' ? [200, 30, 20] : c);
      x.restore();
    }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { t, oran: W1 / W };
  }
  // ---------- silindirler: kavanoz ve fici (LatheGeometry; v = yukseklik orani, u = cevre, u 0 ve 0.5 on/arka) ----------
  function torna(pr, seg) { const pts = pr.map(([r, y]) => new THREE.Vector2(r, y)), g = new THREE.LatheGeometry(pts, seg), p = g.attributes.position, uv = g.attributes.uv; let y0 = 1e9, y1 = -1e9; for (const [, y] of pr) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); } for (let i = 0; i < p.count; i++) uv.setY(i, (p.getY(i) - y0) / (y1 - y0)); g.computeVertexNormals(); return g; }
  function kavanozGeo(R, H) { const h = H / 2; return torna([[0, -h], [R * 0.82, -h], [R * 0.97, -h + 0.05 * H], [R, -h + 0.16 * H], [R, h - 0.3 * H], [R * 0.9, h - 0.2 * H], [R * 0.74, h - 0.17 * H], [R * 0.84, h - 0.155 * H], [R * 0.86, h - 0.04 * H], [R * 0.7, h], [0, h]], 40); }
  function ficiGeo(R, H) { const h = H / 2, pr = []; for (let i = 0; i <= 10; i++) { const t = i / 10; pr.push([R * (0.86 + 0.14 * Math.sin(t * Math.PI)), -h + t * H]); } return torna([[0, -h], ...pr, [0, h]], 40); }
  function sutunGeo(R, H) { const h = H / 2; return torna([[0, -h], [R, -h], [R, -h + 0.1 * H], [R * 0.86, -h + 0.13 * H], [R * 0.8, -h + 0.16 * H], [R * 0.76, h - 0.16 * H], [R * 0.86, h - 0.13 * H], [R, h - 0.1 * H], [R, h], [0, h]], 40); }   // v12.10: tas sutun (alt-ust bilezikli)
  function silBoya(stil, hex) {
    const Wt = 512, Ht = 256, cv = document.createElement('canvas'); cv.width = Wt; cv.height = Ht; const x = cv.getContext('2d'), c = hx(hex); tohum = 31 + hex.length; LEKE = !CILA2 || stil !== 'kavanoz';
    const yv = (v) => Ht * (1 - v);   // doku v (alt 0) -> tuval y
    if (stil === 'kavanoz') {
      const g = x.createLinearGradient(0, 0, Wt, 0), L = [0.18, 0.05, -0.15, 0.05, 0.18, 0.05, -0.15, 0.05, 0.18]; for (let i = 0; i <= 8; i++) g.addColorStop(i / 8, rgb(c, L[i])); x.fillStyle = g; x.fillRect(0, 0, Wt, Ht);
      lekeler(x, 0, Wt, Ht, c, 14, 0.14);
      x.fillStyle = CILA2 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)'; for (const u of [0.08, 0.58]) x.fillRect(u * Wt, yv(0.78), 14, yv(0.12) - yv(0.78));   // dikey parlama seridi
      for (const px of [0, Wt / 2, Wt]) pati(x, px, yv(0.42), Ht * 0.42, '#fff3dc', rgb(c, -0.55, 0.55));
      x.fillStyle = '#fff0cf'; x.fillRect(0, 0, Wt, yv(0.83));   // bez kapak
      x.fillStyle = 'rgba(150,100,50,0.5)'; x.fillRect(0, yv(0.93), Wt, 5);
      x.fillStyle = '#e9cf9b'; x.fillRect(0, yv(0.86), Wt, yv(0.8) - yv(0.86)); x.strokeStyle = 'rgba(140,90,40,0.6)'; x.lineWidth = 3; for (let u = 0; u < Wt; u += 12) { x.beginPath(); x.moveTo(u, yv(0.86)); x.lineTo(u + 9, yv(0.8)); x.stroke(); }   // halat serit
      x.fillStyle = rgb(c, -0.35); x.fillRect(0, yv(0.8), Wt, yv(0.76) - yv(0.8));   // boyun
    } else if (stil === 'sutun') {   // v12.10: boyali tas sutun: dikey yivler, acik bilezikler
      let g = x.createLinearGradient(0, 0, 0, Ht); g.addColorStop(0, rgb(c, 0.2)); g.addColorStop(1, rgb(c, -0.25)); x.fillStyle = g; x.fillRect(0, 0, Wt, Ht);
      lekeler(x, 0, Wt, Ht, c, 14, 0.2);
      for (let i = 0; i < 12; i++) { const u = (i + 0.5) * Wt / 12; g = x.createLinearGradient(u - 14, 0, u + 14, 0); g.addColorStop(0, rgb(c, -0.45, 0)); g.addColorStop(0.5, rgb(c, -0.45, 0.55)); g.addColorStop(1, rgb(c, -0.45, 0)); x.fillStyle = g; x.fillRect(u - 14, yv(0.84), 28, yv(0.16) - yv(0.84)); x.fillStyle = rgb(c, 0.5, 0.45); x.fillRect(u + 9, yv(0.84), 4, yv(0.16) - yv(0.84)); }   // yiv: koyu oluk + acik kenar
      for (const [v0, v1] of [[0, 0.16], [0.84, 1]]) { x.fillStyle = rgb(c, 0.35); x.fillRect(0, yv(v1), Wt, yv(v0) - yv(v1)); x.fillStyle = rgb(c, -0.5, 0.6); x.fillRect(0, v0 ? yv(v0) - 3 : yv(v1), Wt, 4); }
      for (let i = 0; i < 300; i++) { x.fillStyle = rnd() < 0.5 ? rgb(c, -0.4, 0.3) : rgb(c, 0.4, 0.3); x.fillRect(rnd() * Wt, rnd() * Ht, 2, 2); }
    } else {   // fici: dikey tahta cubuklar, iki demir cember
      const T = hex === '#ee3628' ? [226, 60, 40] : [214, 128, 52], nS = 14;
      for (let i = 0; i < nS; i++) { const t = [T[0] * (0.9 + rnd() * 0.2), T[1] * (0.9 + rnd() * 0.2), T[2]], g = x.createLinearGradient(i * Wt / nS, 0, (i + 1) * Wt / nS, 0); g.addColorStop(0, rgb(t, -0.1)); g.addColorStop(0.5, rgb(t, 0.15)); g.addColorStop(1, rgb(t, -0.15)); x.fillStyle = g; x.fillRect(i * Wt / nS, 0, Wt / nS, Ht); x.fillStyle = rgb(T, -0.7, 0.8); x.fillRect(i * Wt / nS - 1, 0, 3, Ht); }
      for (const v of [0.16, 0.84]) { x.fillStyle = '#3f4450'; x.fillRect(0, yv(v + 0.06), Wt, Ht * 0.12); x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(0, yv(v + 0.06), Wt, 3); x.fillStyle = '#c9cfdb'; for (let u = 18; u < Wt; u += 64) { x.beginPath(); x.arc(u, yv(v), 5, 0, 6.2832); x.fill(); } }
      for (const px of [0, Wt / 2, Wt]) pati(x, px, yv(0.5), Ht * 0.4, '#fff3dc', 'rgba(60,25,5,0.45)');
    }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = THREE.RepeatWrapping; return t;
  }
  // ---------- v12.12: tas kemer (3x2, aciklik R=0.66 kup, yay merkezi tabandan 0.62 kup; olculer kemerSekil / seker_set.py ile ayni) ----------
  function kemerYap(boy) {
    const w = boy.x, h = boy.y, d = boy.z, Sk = h / 2, R = 0.66 * Sk, ym = -h / 2 + 0.62 * Sk, r = Math.min(0.065 * Sk, d * 0.2);
    const sh = new THREE.Shape(); sh.moveTo(-w / 2, -h / 2); sh.lineTo(-R, -h / 2); sh.lineTo(-R, ym); sh.absarc(0, ym, R, Math.PI, 0, true); sh.lineTo(R, -h / 2); sh.lineTo(w / 2, -h / 2); sh.lineTo(w / 2, h / 2); sh.lineTo(-w / 2, h / 2); sh.lineTo(-w / 2, -h / 2);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: d - 2 * r, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelOffset: -r, bevelSegments: 1, curveSegments: 28 }); geo.translate(0, 0, -(d - 2 * r) / 2);
    const FW = 384, SW = 128, H = 256, oran = FW / (FW + SW), cv = document.createElement('canvas'); cv.width = FW + SW; cv.height = H; const x = cv.getContext('2d'), c = hx('#6470b4'); tohum = 57;
    const P = (px, py) => [(px + w / 2) / w * FW, H * (1 - (py + h / 2) / h)], k = FW / w;
    for (const [X, Wb] of [[0, FW], [FW, SW]]) {
      x.save(); x.beginPath(); x.rect(X, 0, Wb, H); x.clip();
      let g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, rgb(c, 0.2)); g.addColorStop(1, rgb(c, -0.3)); x.fillStyle = g; x.fillRect(X, 0, Wb, H);
      lekeler(x, X, Wb, H, c, X ? 5 : 16, 0.22);
      for (let i = 0; i < (X ? 90 : 260); i++) { x.fillStyle = rnd() < 0.5 ? rgb(c, -0.4, 0.35) : rgb(c, 0.4, 0.35); x.fillRect(X + rnd() * Wb, rnd() * H, 2, 2); }
      if (!X) {
        const tas = (pts, ton) => {   // acik kabartma tas: golge, govde, ust parlak kenar
          x.save(); x.translate(3, 4); x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); x.fillStyle = rgb(c, -0.6, 0.55); x.fill(); x.restore();
          x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); x.fillStyle = rgb(c, ton); x.fill(); x.lineWidth = 3; x.strokeStyle = rgb(c, 0.6, 0.6); x.stroke();
        };
        for (let i = 0; i < 7; i++) {   // kemer taslari (ortadaki kilit tasi iri ve daha acik)
          const t0 = Math.PI * (i + 0.05) / 7, t1 = Math.PI * (i + 0.95) / 7, r0 = R * 1.01, r1 = R + (i === 3 ? 0.3 : 0.22) * Sk, pts = [];
          for (const [rr, a] of [[r0, t0], [r1, t0], [r1, (t0 + t1) / 2], [r1, t1], [r0, t1], [r0, (t0 + t1) / 2]]) pts.push(P(rr * Math.cos(a), ym + rr * Math.sin(a)));
          tas(pts, i === 3 ? 0.5 : 0.36);
        }
        for (const sx of [-1, 1]) for (const [yy, ww] of [[0.3, 0.5], [0.8, 0.36]]) {   // ayaklarda iki tas (yay baslangicinin altinda)
          const cx = sx * (w / 2 - r - ww * Sk / 2 - 0.03 * Sk), cy = -h / 2 + yy * Sk, hh = 0.17 * Sk, [a0, b0] = P(cx - ww * Sk / 2, cy + hh), [a1, b1] = P(cx + ww * Sk / 2, cy - hh), e = 5;
          tas([[a0 + e, b0], [a1 - e, b0], [a1, b0 + e], [a1, b1 - e], [a1 - e, b1], [a0 + e, b1], [a0, b1 - e], [a0, b0 + e]], 0.3);
        }
      }
      kenar(x, X, Wb, H, c); x.restore();
    }
    const uv = geo.attributes.uv, p = geo.attributes.position, A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
    for (let i = 0; i < p.count; i += 3) {   // yuz yonune gore: on/arka atlas solu, digerleri sag serit
      A.fromBufferAttribute(p, i); B.fromBufferAttribute(p, i + 1); C.fromBufferAttribute(p, i + 2); const n = B.clone().sub(A).cross(C.clone().sub(A)).normalize();
      for (let j = 0; j < 3; j++) { const X = p.getX(i + j), Y = p.getY(i + j), Z = p.getZ(i + j), U = (X + w / 2) / w, V = (Y + h / 2) / h, W = (Z + d / 2) / d;
        if (Math.abs(n.z) > 0.7) uv.setXY(i + j, U * oran, V); else if (Math.abs(n.x) > Math.abs(n.y)) uv.setXY(i + j, oran + W * (1 - oran), V); else uv.setXY(i + j, oran + U * (1 - oran), W); }
    }
    geo.clearGroups(); geo.computeVertexNormals();
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    const mat = new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.2, envMap: ENV, envMapIntensity: 0.35 }); mat.toneMapped = false; mat.userData.yeni = 1;
    return { geo, mat, golgeKutu: 1, parca: new THREE.MeshStandardMaterial({ color: '#6470b4', roughness: 0.5 }) };
  }
  // ---------- tur secimi ----------
  function stilOf(k) {
    if (/^ksSandik/.test(k)) return ['tahta', 1];
    if (/^ksTas\d?$/.test(k)) return ['tas', 0];
    if (/^ksBuz/.test(k)) return ['kristal', 0];
    if (/^ksKalas/.test(k)) return ['kalas', 0];
    if (k === 'ksTNT') return ['tnt', 1];
    if (/^kr3[A-Z]$/.test(k)) return ['boya', 3];
    if (/^(kj|kvU|kvL|kvB)[A-Z]$/.test(k) || /^ksSise/.test(k)) return ['kavanoz', -1];
    if (/^ksFici/.test(k)) return ['fici', -1];
    if (k === 'ksYildiz') return ['yildiz', 1];   // v12.10
    if (k === 'ksDirek') return ['direk', 1];
    if (k === 'ksSutun' || k === 'ksMorSutun') return ['sutun', -1];
    if (k === 'ksKemer') return ['kemer', 0];   // v12.12
    const m = /^(oy|uz(\d))([A-Z])$/.exec(k); if (!m) return null;
    return [m[3] === 'L' || m[3] === 'A' ? 'kristal' : 'boya', m[2] ? +m[2] : 1, m[3]];
  }
  // boy: mevcut modelin olculeri (Vector3; fizik ayni kalir)
  function yap(k, hex, boy) {
    if (HAZ[k]) return HAZ[k]; const s = stilOf(k); if (!s) return null;
    let [stil, n] = s;
    if (stil === 'kemer') return (HAZ[k] = kemerYap(boy));
    if (n < 0) {   // silindir
      if (stil === 'sutun') hex = /Mor/.test(k) ? '#2aa9b4' : '#8790c4';   // mor yerine turkuaz (rakip mor-altin)
      const R = Math.min(boy.x, boy.z) / 2 * 0.99, Hh = boy.y * 0.99, geo = stil === 'kavanoz' ? kavanozGeo(R, Hh) : stil === 'sutun' ? sutunGeo(R, Hh) : ficiGeo(R, Hh), t = silBoya(stil, hex);
      const mat = CILA2 && stil === 'kavanoz' ? new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.04, envMap: PENV, envMapIntensity: 0.7 })
        : new THREE.MeshPhysicalMaterial({ map: t, roughness: stil === 'fici' ? 0.55 : stil === 'sutun' ? 0.45 : 0.3, clearcoat: stil === 'fici' ? 0.2 : stil === 'sutun' ? 0.35 : 0.7, clearcoatRoughness: 0.12, envMap: ENV, envMapIntensity: 0.4 }); mat.toneMapped = false; mat.userData.yeni = 1;
      temasEkle(mat, Hh / 2, 'b6s', R); return (HAZ[k] = { geo, mat, golgeKutu: 1, parca: new THREE.MeshStandardMaterial({ color: hex, roughness: 0.5 }) });
    }
    const yar = (v) => Math.max(0.5, Math.round(v / S * 2) / 2) * S;   // modelin cikintilari (TNT fitili vb.) olcuye girmesin: yarim kup katlari
    const bx = boy ? yar(boy.x) * 0.994 : n * S * 0.994, by = boy ? yar(boy.y) * 0.992 : S * 0.992, bz = boy ? yar(boy.z) * 0.992 : S * 0.992;
    if (!n) n = Math.max(1, Math.round(bx / Math.max(by, 0.3)));   // dokudaki birim sayisi (uzun taslarda her birimde halka)
    if (stil === 'tas') hex = '#6470b4';
    if (B7 && B7.var(stil)) return (HAZ[k] = B7.yap(stil, hex, bx, by, bz));   // v12.59 deneme ?blok7=1: kabartmali parlak plastik
    const { t, oran } = boya(stil, hex, n), geo = uvAtlas2(kutu(bx, by, bz, CILA2 && stil !== 'tahta' && stil !== 'kalas' && stil !== 'direk' ? Math.min(0.11 * S, by * 0.24) : Math.min(0.065 * S, by * 0.2)), oran);
    const mat = stil === 'kristal' ? new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.22, clearcoat: 0.6, clearcoatRoughness: 0.08, envMap: ENV, envMapIntensity: 0.3, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.35 })
      : CILA2 && !/tahta|kalas|direk/.test(stil) ? new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.05, envMap: PENV, envMapIntensity: stil === 'tas' ? 0.45 : 0.6 })
      : new THREE.MeshPhysicalMaterial({ map: t, roughness: stil === 'tahta' ? 0.6 : 0.38, clearcoat: stil === 'tahta' ? 0.2 : 0.5, clearcoatRoughness: 0.2, envMap: ENV, envMapIntensity: 0.35 });
    mat.toneMapped = false; mat.userData.yeni = 1; temasEkle(mat, by / 2, 'b6k', bx / 2);
    return (HAZ[k] = { geo, mat, golgeKutu: 1, parca: new THREE.MeshStandardMaterial({ color: stil === 'kristal' ? '#3fd6f2' : stil === 'tahta' ? '#c9742f' : hex, roughness: 0.5 }) });
  }
  return { var: (k) => !!stilOf(k), yap };
}
