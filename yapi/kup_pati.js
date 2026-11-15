// Foxi Smash: Adem'in patili oyuncak kupu (yapi/model/kup_pati.glb) icin hazirlik.
// Tripo modeli egik geliyor ve tek parca malzemeli. Bu islev kupu eksenlere hizalar, ortalar ve
// geometriyi iki malzeme grubuna ayirir: grup 0 = govde (renk renk boyanir), grup 1 = pati izi (altin).
// Pati izi govdeden ayri 5 ada (4 parmak + taban yastigi) oldugu icin en buyuk bagli parca govde sayilir.
// Kullanim: kupHazirla(THREE, mesh.geometry); mesh.material = [govdeMalzemesi, altinMalzeme];
export function kupHazirla(THREE, G) {
  const P = G.attributes.position, N = G.attributes.normal, n = new THREE.Vector3(), m = new THREE.Vector3();
  // egik kupu hizala: kaplayan kutunun hacmini en kucuk yapan donus (kaba arama + inceltme)
  const S = []; for (let i = 0; i < P.count; i += Math.max(1, Math.floor(P.count / 600))) S.push(new THREE.Vector3().fromBufferAttribute(P, i));
  const q = new THREE.Quaternion(), e = new THREE.Euler(), t = new THREE.Vector3();
  const hacim = (x, y, z) => { e.set(x, y, z); q.setFromEuler(e); let a = [1e9, 1e9, 1e9], b = [-1e9, -1e9, -1e9];
    for (const p of S) { t.copy(p).applyQuaternion(q); a = [Math.min(a[0], t.x), Math.min(a[1], t.y), Math.min(a[2], t.z)]; b = [Math.max(b[0], t.x), Math.max(b[1], t.y), Math.max(b[2], t.z)]; }
    return (b[0] - a[0]) * (b[1] - a[1]) * (b[2] - a[2]); };
  let en = [0, 0, 0], ev = hacim(0, 0, 0);
  for (const [adim, yar] of [[3, 45], [0.6, 3], [0.12, 0.6]]) { const c = en.slice(); const r = (d) => d * Math.PI / 180;
    for (let x = -yar; x <= yar; x += adim) for (let y = -yar; y <= yar; y += adim) for (let z = -yar; z <= yar; z += adim) {
      const h = hacim(c[0] + r(x), c[1] + r(y), c[2] + r(z)); if (h < ev) { ev = h; en = [c[0] + r(x), c[1] + r(y), c[2] + r(z)]; } } }
  const M = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...en));
  G.applyMatrix4(M); G.computeBoundingBox(); const c = G.boundingBox.getCenter(new THREE.Vector3()); G.translate(-c.x, -c.y, -c.z);
  // kabarik pati: yuzeyi cok kez yumusat, kabartmalar duzlesir; normal yonunde belirgin geri cekilen ic-bolge noktalari pati
  G.computeBoundingBox(); const h = G.boundingBox.max.clone(), ax = ['x', 'y', 'z'], v = new THREE.Vector3();
  const key = (i) => Math.round(P.getX(i) * 2000) + ',' + Math.round(P.getY(i) * 2000) + ',' + Math.round(P.getZ(i) * 2000);
  const id = new Int32Array(P.count), map = new Map(); let u = 0; for (let i = 0; i < P.count; i++) { const k = key(i); if (!map.has(k)) map.set(k, u++); id[i] = map.get(k); }
  const pos = new Float32Array(u * 3), cnt = new Float32Array(u); for (let i = 0; i < P.count; i++) { const j = id[i]; if (cnt[j]) continue; cnt[j] = 1; pos[j * 3] = P.getX(i); pos[j * 3 + 1] = P.getY(i); pos[j * 3 + 2] = P.getZ(i); }
  const kom = Array.from({ length: u }, () => new Set()), I0 = G.index.array;
  for (let t = 0; t < I0.length; t += 3) { const a = id[I0[t]], b = id[I0[t + 1]], c = id[I0[t + 2]]; kom[a].add(b).add(c); kom[b].add(a).add(c); kom[c].add(a).add(b); }
  const K = kom.map((s) => [...s]);
  // bagli parcalar
  const par = new Int32Array(u).fill(-1); const boy = []; for (let j = 0; j < u; j++) { if (par[j] >= 0) continue; const c = boy.length; let n2 = 0; const st = [j]; par[j] = c; while (st.length) { const a = st.pop(); n2++; for (const b of K[a]) if (par[b] < 0) { par[b] = c; st.push(b); } } boy.push(n2); }
  // en buyuk parca govde; geri kalan ayri adacilar (4 parmak + taban yastigi) pati izi
  const govdeNo = boy.indexOf(Math.max(...boy)), pati = new Uint8Array(P.count);
  for (let i = 0; i < P.count; i++) if (par[id[i]] !== govdeNo) pati[i] = 1;
  const I = G.index.array, A = [], B = [];
  for (let t = 0; t < I.length; t += 3) (pati[I[t]] + pati[I[t + 1]] + pati[I[t + 2]] >= 2 ? B : A).push(I[t], I[t + 1], I[t + 2]);
  G.setIndex([...A, ...B]); G.clearGroups(); G.addGroup(0, A.length, 0); G.addGroup(A.length, B.length, 1);
  G.computeBoundingBox(); return { parca: boy, aci: en.map((a) => +(a * 180 / Math.PI).toFixed(1)), pati: B.length / 3, govde: A.length / 3, boy: G.boundingBox.getSize(new THREE.Vector3()) };
}
