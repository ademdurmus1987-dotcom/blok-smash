// Foxi Smash v5.1 (15 Kas 2026): Adem'in patili oyuncak kupu (model/kup_pati.glb, Tripo).
// Model bir kez yuklenir, kupHazirla ile hizalanip iki malzeme grubuna ayrilir (0 govde, 1 pati izi), pati yuzu +z'ye (kameraya)
// dondurulur ve oyundaki kup olcusune oturtulur. Butun renkler ayni geometriyi paylasir.
// Cizim ornek.js ile: her renk bir InstancedMesh (2 grup = 2 cizim). Arka siradaki ve kalabalik bolumdeki kupler
// dusuk ucgenli surumle (LOD, konum kumelemesiyle sadelestirilmis) cizilir; golge 12 ucgenlik kutudan.
import { kupHazirla } from './kup_pati.js?v=2';

// govde renkleri: doygun, birbirinden kolay ayrilir. turuncu ve sari biraz koyu ve patisi ince koyu konturlu (altin pati net ayrilsin)
export const PATI_RENK = {
  kirmizi: { c: '#cc0e22', ad: 'Kırmızı' },
  turuncu: { c: '#e24a04', ad: 'Turuncu', kontur: 1 },
  sari: { c: '#f2b600', ad: 'Sarı', kontur: 1 },
  yesil: { c: '#0e9c38', ad: 'Yeşil' },
  mavi: { c: '#1452dc', ad: 'Mavi' },
  mor: { c: '#7622cf', ad: 'Mor' },
  pembe: { c: '#f22a8c', ad: 'Pembe' },
  beyaz: { c: '#ece8e0', ad: 'Beyaz' },
  altin: { c: '#d98a00', ad: 'Altın', altin: 1 }
};
const ESIK = 8;   // bundan cok patili kup varsa hepsi LOD (oyun kamerasinda LOD ile tam surum ayirt edilmiyor; 9 bin yerine ~900 ucgen)

// konum kumelemesiyle sadelestirme: govde ve pati ayri kumelenir (pati govdeye karismaz)
function sadele(THREE, G, hucre) {
  const P = G.attributes.position, I = G.index.array, grp = new Uint8Array(P.count);
  for (const g of G.groups) for (let i = g.start; i < g.start + g.count; i++) grp[I[i]] = g.materialIndex;
  const map = new Map(), top = [], say = [], vid = new Int32Array(P.count);
  for (let i = 0; i < P.count; i++) {
    const x = P.getX(i), y = P.getY(i), z = P.getZ(i), k = grp[i] + ':' + Math.round(x / hucre) + ',' + Math.round(y / hucre) + ',' + Math.round(z / hucre);
    let j = map.get(k); if (j === undefined) { j = say.length; map.set(k, j); top.push(0, 0, 0); say.push(0); }
    top[j * 3] += x; top[j * 3 + 1] += y; top[j * 3 + 2] += z; say[j]++; vid[i] = j;
  }
  const pos = new Float32Array(say.length * 3); for (let j = 0; j < say.length; j++) for (let a = 0; a < 3; a++) pos[j * 3 + a] = top[j * 3 + a] / say[j];
  const A = [], B = [], gor = new Set();
  for (const g of G.groups) for (let t = g.start; t < g.start + g.count; t += 3) {
    const a = vid[I[t]], b = vid[I[t + 1]], c = vid[I[t + 2]]; if (a === b || b === c || a === c) continue;
    const k = [a, b, c].sort((u, v) => u - v).join(','); if (gor.has(k)) continue; gor.add(k);
    (g.materialIndex ? B : A).push(a, b, c);
  }
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setIndex(A.concat(B));
  out.addGroup(0, A.length, 0); out.addGroup(A.length, B.length, 1); out.computeVertexNormals(); out.computeBoundingBox(); out.computeBoundingSphere();
  return out;
}

// patinin etrafina ince koyu kontur: her pati adasi kendi ortasina gore yuzeyde %14 buyutulup yassilastirilir (3. grup)
function konturlu(THREE, G) {
  const P = G.attributes.position, I = G.index.array, g1 = G.groups[1];
  const key = (i) => Math.round(P.getX(i) * 4000) + ',' + Math.round(P.getY(i) * 4000) + ',' + Math.round(P.getZ(i) * 4000);
  const ana = new Map(), bul = (a) => { while (ana.get(a) !== a) { ana.set(a, ana.get(ana.get(a))); a = ana.get(a); } return a; };
  const tri = []; for (let t = g1.start; t < g1.start + g1.count; t += 3) { const k = [key(I[t]), key(I[t + 1]), key(I[t + 2])]; for (const x of k) if (!ana.has(x)) ana.set(x, x); ana.set(bul(k[1]), bul(k[0])); ana.set(bul(k[2]), bul(k[0])); tri.push([I[t], I[t + 1], I[t + 2], k[0]]); }
  const ada = new Map(); for (const tr of tri) { const r = bul(tr[3]); if (!ada.has(r)) ada.set(r, []); ada.get(r).push(tr); }
  const pos = [], nor = [];
  for (const L of ada.values()) {
    let cx = 0, cy = 0, n = 0, zmin = 1e9; for (const tr of L) for (let k = 0; k < 3; k++) { cx += P.getX(tr[k]); cy += P.getY(tr[k]); n++; zmin = Math.min(zmin, P.getZ(tr[k])); } cx /= n; cy /= n;
    for (const tr of L) for (let k = 0; k < 3; k++) { const i = tr[k]; pos.push(cx + (P.getX(i) - cx) * 1.14, cy + (P.getY(i) - cy) * 1.14, zmin + (P.getZ(i) - zmin) * 0.45 + 0.004); }
  }
  const K = new THREE.BufferGeometry(); K.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); K.computeVertexNormals();
  // ana geometriyle birlestir (indekssiz)
  const src = G.toNonIndexed(), out = new THREE.BufferGeometry(), n0 = src.attributes.position.count;
  const ps = new Float32Array((n0 + pos.length / 3) * 3), ns = new Float32Array(ps.length);
  ps.set(src.attributes.position.array); ns.set(src.attributes.normal.array); ps.set(K.attributes.position.array, n0 * 3); ns.set(K.attributes.normal.array, n0 * 3);
  out.setAttribute('position', new THREE.BufferAttribute(ps, 3)); out.setAttribute('normal', new THREE.BufferAttribute(ns, 3));
  out.addGroup(0, G.groups[0].count, 0); out.addGroup(G.groups[0].count, G.groups[1].count, 1); out.addGroup(n0, pos.length / 3, 2);
  out.computeBoundingBox(); out.computeBoundingSphere(); return out;
}

export function patiYukle({ THREE, S, ENV, GLTFLoader }) {
  return new Promise((ok) => new GLTFLoader().load('model/kup_pati.glb?v=1', (gl) => {
    try { ok(patiKur(THREE, S, ENV, gl)); } catch (e) { console.warn('pati', e); ok(null); }
  }, undefined, () => ok(null)));
}

function patiKur(THREE, S, ENV, gl) {
  let m = null; gl.scene.updateMatrixWorld(true); gl.scene.traverse((o) => { if (o.isMesh && !m) m = o; });
  // meshopt/quantize: konum Int16, normal Int8 ve ic ice gelebilir; once duz Float32'ye cevrilir
  const src = m.geometry, sp = src.attributes.position, pos = new Float32Array(sp.count * 3);
  for (let i = 0; i < sp.count; i++) { pos[i * 3] = sp.getX(i); pos[i * 3 + 1] = sp.getY(i); pos[i * 3 + 2] = sp.getZ(i); }
  const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  G.setIndex(src.index ? Array.from(src.index.array) : [...Array(sp.count).keys()]);
  G.applyMatrix4(m.matrixWorld); G.computeVertexNormals();
  const bilgi = kupHazirla(THREE, G);
  // pati yuzu +z (kameraya) baksin
  const P = G.attributes.position, I = G.index.array, g1 = G.groups[1], c = new THREE.Vector3();
  for (let i = g1.start; i < g1.start + g1.count; i++) { c.x += P.getX(I[i]); c.y += P.getY(I[i]); c.z += P.getZ(I[i]); }
  const ax = ['x', 'y', 'z'].reduce((a, b) => (Math.abs(c[b]) > Math.abs(c[a]) ? b : a)), sg = Math.sign(c[ax]);
  const R = new THREE.Matrix4();
  if (ax === 'x') R.makeRotationY(-sg * Math.PI / 2); else if (ax === 'y') R.makeRotationX(sg * Math.PI / 2); else if (sg < 0) R.makeRotationY(Math.PI);
  G.applyMatrix4(R);
  // kup olcusune oturt: govdenin kaplayan kutusu (pati kabartmasi haric) hucreye; model biraz basik geldigi icin eksen eksen
  const gv = new THREE.Box3(); for (let i = 0; i < G.groups[0].count; i++) gv.expandByPoint(c.fromBufferAttribute(P, I[i]));
  const sz = gv.getSize(new THREE.Vector3()), mc = gv.getCenter(new THREE.Vector3()), hedef = S * 0.985;
  G.translate(-mc.x, -mc.y, -mc.z); G.scale(hedef / sz.x, hedef / sz.y, hedef / sz.z);
  G.deleteAttribute('normal'); G.computeVertexNormals(); G.computeBoundingBox(); G.computeBoundingSphere();
  const lod = sadele(THREE, G, S / 15), K = konturlu(THREE, G), KL = konturlu(THREE, lod);
  const ucgen = (g) => (g.index ? g.index.count : g.attributes.position.count) / 3;

  // malzemeler: parlak oyuncak plastik (clearcoat), metalik hafif isiltili altin pati; altin govdede gumus pati
  const plastik = (renk) => new THREE.MeshPhysicalMaterial({ color: renk, roughness: 0.38, metalness: 0, clearcoat: 0.8, clearcoatRoughness: 0.08, envMap: ENV, envMapIntensity: 0.45 });
  const ALTIN = new THREE.MeshPhysicalMaterial({ color: '#f5aa14', metalness: 1, roughness: 0.24, clearcoat: 0.5, clearcoatRoughness: 0.12, envMap: ENV, envMapIntensity: 1.25, emissive: '#5a3000', emissiveIntensity: 0.3 });
  const GUMUS = new THREE.MeshPhysicalMaterial({ color: '#eef2f8', metalness: 1, roughness: 0.18, clearcoat: 0.6, envMap: ENV, envMapIntensity: 1.6, emissive: '#3a4250', emissiveIntensity: 0.25 });
  const KONTUR = new THREE.MeshStandardMaterial({ color: '#3a1604', roughness: 0.6 });
  const MAT = {};
  for (const k in PATI_RENK) {
    const r = PATI_RENK[k];
    const govde = r.altin ? new THREE.MeshPhysicalMaterial({ color: r.c, metalness: 1, roughness: 0.28, clearcoat: 0.7, clearcoatRoughness: 0.1, envMap: ENV, envMapIntensity: 0.95, emissive: '#7a3c00', emissiveIntensity: 0.45 }) : plastik(r.c);
    MAT[k] = r.kontur ? [govde, ALTIN, KONTUR] : [govde, r.altin ? GUMUS : ALTIN];
  }
  const geoOf = (k, dusuk) => (PATI_RENK[k].kontur ? (dusuk ? KL : K) : dusuk ? lod : G);
  // kirilinca: govde parcasi kendi renginde, kucuk pati parcalari altin
  const PARCA = {}; for (const k in PATI_RENK) PARCA[k] = MAT[k][0];

  return { G, lod, K, MAT, PARCA, geoOf, bilgi, ucgen: { tam: ucgen(G), lod: ucgen(lod) }, ESIK };
}
