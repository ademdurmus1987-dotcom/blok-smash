// Foxi Smash v12.59 deneme (25 Kas 2026): rakip kalitesinde blok denemesi, anahtar ?blok7=1.
// Iri yuvarlak pah, tek renk parlak plastik, acik tonlu kabarik cerceve, buyuk 3B korsan isareti (doku yok, gercek geometri; mor-altin ve tac yok).
// Uc aile: renkli kup -> kurukafa, tahta sandik -> capa, tas -> dumen. Olculer (fizik) blok6 ile ayni.
export const BLOK7 = new URLSearchParams(location.search).get('blok7') === '1';
export function blok7Kur({ THREE, ENV }) {
  const KREM = '#fff4dc';
  // pahli kutu: her eksende kose bolgelerine SEG dilim, normaller yumusak
  function kutu(w, h, d, r) {
    const SEG = 3, N = SEG * 2 + 1, g = new THREE.BoxGeometry(w, h, d, N, N, N), p = g.attributes.position, nr = g.attributes.normal, A = [w / 2, h / 2, d / 2], v = new THREE.Vector3(), ic = new THREE.Vector3(), o = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      for (let k = 0; k < 3; k++) { const a = A[k], t = Math.round((v.getComponent(k) + a) / (2 * a) * N), alt = t <= SEG, u = (alt ? SEG - t : t - SEG - 1) / SEG; v.setComponent(k, (alt ? -1 : 1) * (a - r + r * Math.tan(u * Math.PI / 4))); }
      for (let k = 0; k < 3; k++) ic.setComponent(k, Math.max(-(A[k] - r), Math.min(A[k] - r, v.getComponent(k))));
      o.copy(v).sub(ic).normalize(); v.copy(ic).addScaledVector(o, r);
      p.setXYZ(i, v.x, v.y, v.z); nr.setXYZ(i, o.x, o.y, o.z);
    }
    return g;
  }
  // ---------- sekiller (birim: -0.5..0.5) ----------
  const yuv = (w, h, r, P = new THREE.Shape(), cx = 0, cy = 0) => { const a = w / 2, b = h / 2; r = Math.min(r, a, b); P.moveTo(cx - a + r, cy - b); P.lineTo(cx + a - r, cy - b); P.quadraticCurveTo(cx + a, cy - b, cx + a, cy - b + r); P.lineTo(cx + a, cy + b - r); P.quadraticCurveTo(cx + a, cy + b, cx + a - r, cy + b); P.lineTo(cx - a + r, cy + b); P.quadraticCurveTo(cx - a, cy + b, cx - a, cy + b - r); P.lineTo(cx - a, cy - b + r); P.quadraticCurveTo(cx - a, cy - b, cx - a + r, cy - b); return P; };
  const daire = (cx, cy, r) => { const s = new THREE.Shape(); s.absarc(cx, cy, r, 0, Math.PI * 2, false); return s; };
  const halka = (cx, cy, R, r) => { const s = daire(cx, cy, R), d = new THREE.Path(); d.absarc(cx, cy, r, 0, Math.PI * 2, true); s.holes.push(d); return s; };
  const cubuk = (cx, cy, boy, en, aci) => { const s = yuv(boy, en, en / 2), c = Math.cos(aci), n = Math.sin(aci); return new THREE.Shape(s.getPoints(4).map((q) => new THREE.Vector2(cx + q.x * c - q.y * n, cy + q.x * n + q.y * c))); };
  function kurukafa() {   // [sekil, kat, renk]: kat 0 arkadaki kemikler, 1 kafa, 2 goz-burun (koyu)
    const L = [];
    for (const a of [0.6, -0.6]) { L.push([cubuk(0, -0.17, 0.86, 0.115, a), 0]); for (const u of [-1, 1]) for (const y of [-1, 1]) L.push([daire(u * 0.43 * Math.cos(a) - y * 0.05 * Math.sin(a), -0.17 + u * 0.43 * Math.sin(a) + y * 0.05 * Math.cos(a), 0.072), 0]); }
    const k = new THREE.Shape(); k.moveTo(-0.15, -0.2); k.lineTo(-0.16, -0.07); k.bezierCurveTo(-0.27, -0.03, -0.31, 0.07, -0.3, 0.15); k.bezierCurveTo(-0.29, 0.33, -0.15, 0.42, 0, 0.42); k.bezierCurveTo(0.15, 0.42, 0.29, 0.33, 0.3, 0.15); k.bezierCurveTo(0.31, 0.07, 0.27, -0.03, 0.16, -0.07); k.lineTo(0.15, -0.2); k.quadraticCurveTo(0.14, -0.24, 0.1, -0.24); k.lineTo(-0.1, -0.24); k.quadraticCurveTo(-0.14, -0.24, -0.15, -0.2);
    L.push([k, 1]);
    for (const x of [-0.12, 0.12]) L.push([daire(x * 1.05, 0.1, 0.1), 2]);
    const b = new THREE.Shape(); b.moveTo(0, 0.025); b.lineTo(0.045, -0.055); b.quadraticCurveTo(0, -0.075, -0.045, -0.055); b.lineTo(0, 0.025); L.push([b, 2]);
    for (const x of [-0.055, 0.055]) L.push([yuv(0.022, 0.09, 0.01, undefined, x, -0.19), 2]);
    return L;
  }
  function capa() {
    const L = [[halka(0, 0.31, 0.13, 0.058), 1], [yuv(0.11, 0.62, 0.05, undefined, 0, -0.06), 1], [yuv(0.42, 0.095, 0.047, undefined, 0, 0.12), 1]];
    const s = new THREE.Shape(), R = 0.36, r = 0.25, cy = -0.06; s.absarc(0, cy, R, Math.PI * 1.08, Math.PI * 1.92, false); s.absarc(0, cy, r, Math.PI * 1.92, Math.PI * 1.08, true); L.push([s, 1]);
    for (const u of [-1, 1]) { const t = new THREE.Shape(); t.moveTo(u * 0.41, -0.02); t.lineTo(u * 0.39, -0.24); t.lineTo(u * 0.2, -0.15); t.lineTo(u * 0.41, -0.02); L.push([t, 1]); }
    L.push([daire(0, -0.38, 0.075), 1]); return L;
  }
  function dumen() {
    const L = [[halka(0, 0, 0.3, 0.2), 1]];
    for (let i = 0; i < 4; i++) L.push([cubuk(0, 0, 0.84, 0.07, i * Math.PI / 4), 0]);
    for (let i = 0; i < 8; i++) L.push([daire(0.41 * Math.cos(i * Math.PI / 4), 0.41 * Math.sin(i * Math.PI / 4), 0.062), 0]);
    L.push([daire(0, 0, 0.11), 1], [daire(0, 0, 0.045), 2]); return L;
  }
  const ISARET = { boya: kurukafa(), tahta: capa(), tas: dumen() };
  // ---------- birlestirme: her parcaya tek renk (yukseklige gore hafif gecis) ----------
  function boyaEkle(L, g, hex, y0, y1, ust = 0.14, alt = -0.16) {
    const ng = g.index ? g.toNonIndexed() : g, p = ng.attributes.position, c = new Float32Array(p.count * 3), a = new THREE.Color(hex), q = new THREE.Color(), beyaz = new THREE.Color(1, 1, 1);
    for (let i = 0; i < p.count; i++) { const t = Math.max(0, Math.min(1, (p.getY(i) - y0) / (y1 - y0))), k = alt + (ust - alt) * t; q.copy(a); if (k > 0) q.lerp(beyaz, k * 0.35); else q.multiplyScalar(1 + k); c.set([q.r, q.g, q.b], i * 3); }
    ng.setAttribute('color', new THREE.BufferAttribute(c, 3)); L.push(ng);
  }
  function birlestir(L) {
    const g = new THREE.BufferGeometry();
    for (const [ad, n] of [['position', 3], ['normal', 3], ['color', 3]]) { const a = new Float32Array(L.reduce((s, q) => s + q.attributes[ad].count * n, 0)); let o = 0; for (const q of L) { a.set(q.attributes[ad].array, o); o += q.attributes[ad].count * n; } g.setAttribute(ad, new THREE.BufferAttribute(a, n)); }
    g.computeBoundingBox(); g.computeBoundingSphere(); return g;
  }
  const kabart = (s, yuk, pah) => new THREE.ExtrudeGeometry(s, { depth: yuk, bevelEnabled: true, bevelThickness: pah, bevelSize: pah, bevelOffset: -pah, bevelSegments: 1, curveSegments: 6 });
  const TON = { tahta: { govde: '#a9500f', cerceve: '#ee8c22', koyu: '#4a1c02' }, tas: { govde: '#3b4699', cerceve: '#6878d6', koyu: '#151a4a' } };
  function yap(stil, hex, bx, by, bz) {
    const c = new THREE.Color(hex); if (c.getHSL({}).l <= 0.6) c.offsetHSL(0, 0.1, -0.025); hex = '#' + c.getHexString();
    const acikRenk = c.getHSL({}).l > 0.6, T = TON[stil] || { govde: acikRenk ? hex : '#' + c.clone().multiplyScalar(0.9).getHexString(), cerceve: '#' + c.clone().lerp(new THREE.Color(1, 1, 1), 0.22).getHexString(), koyu: '#' + c.clone().multiplyScalar(0.16).getHexString() };
    const kisa = Math.min(bx, by), r = Math.min(kisa * 0.16, bz * 0.2), L = [], y0 = -by / 2, y1 = by / 2;
    // govde on ve arka yuzde biraz iceride: cerceve ve isaret olcunun disina tasmaz
    const iz = kisa * 0.045, govde = kutu(bx, by, bz - 2 * iz, r); boyaEkle(L, govde, T.govde, y0, y1);
    const pay = r * 0.72, fw = bx - 2 * pay, fh = by - 2 * pay, kal = kisa * 0.065;
    for (const yon of [1, -1]) {
      const koy = (g, z, renk, u, a) => { g.translate(0, 0, z); if (yon < 0) g.rotateY(Math.PI); boyaEkle(L, g, renk, y0, y1, u, a); };
      const cer = yuv(fw, fh, r * 0.9); cer.holes.push(yuv(fw - 2 * kal, fh - 2 * kal, r * 0.55, new THREE.Path()));
      const taban = bz / 2 - iz - 0.002;
      koy(kabart(cer, iz * 0.75, iz * 0.35), taban, T.cerceve, 0.3, -0.12);
      const s = Math.min(fh - 2 * kal, fw - 2 * kal) * (stil === 'boya' ? 1.22 : 1.12);
      if (yon > 0) for (const [sek, kat] of ISARET[stil]) {   // isaret yalniz on yuzde (telefonda ucgen sayisi yari)
        const ol = (g) => { g.scale(s, s, 1); return g; };
        const z = taban + [0, 0.28, 1.25][kat] * iz, yuk = iz * [0.5, 0.65, 0.12][kat], pah = iz * [0.18, 0.25, 0.04][kat];
        if (kat < 2) { const gl = ol(new THREE.ShapeGeometry(sek, 5)); gl.translate(s * 0.028, -s * 0.045, 0); koy(gl, taban + 0.006 + kat * 0.004, T.koyu, 0, 0); }   // isaretin altinda koyu golge: uzaktan okunur
        // pah ve yukseklik dunya olcusunde kalsin diye once sekil buyutulur
        const buyuk = new THREE.Shape(sek.getPoints(5).map((q) => q.multiplyScalar(s))); buyuk.holes = sek.holes.map((h) => new THREE.Path(h.getPoints(16).map((q) => q.multiplyScalar(s)))); const g = kabart(buyuk, yuk, pah); koy(g, z, kat === 2 ? T.koyu : acikRenk ? '#c98a4b' : KREM, 0.1, kat === 2 ? 0 : -0.1);
      }
    }
    const geo = birlestir(L);
    const mat = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.32, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.1, envMap: ENV, envMapIntensity: 0.16 }); mat.toneMapped = false; mat.userData.yeni = 1;
    return { geo, mat, golgeKutu: 1, parca: new THREE.MeshStandardMaterial({ color: T.govde, roughness: 0.4 }) };
  }
  return { var: (stil) => !!ISARET[stil], yap };
}
