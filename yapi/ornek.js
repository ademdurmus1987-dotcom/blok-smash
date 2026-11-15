// Foxi Smash v5.1 (15 Kas 2026): blok instancing'i. Kodla cizilen butun bloklar (sekil.js + kale.js + patili kup) tur basina
// tek InstancedMesh ile cizilir: 40 sandik = 2 cizim (eskiden 80). Bloklarin kendi Mesh'leri gorunmez katmanda (layer 1) kalir;
// fizik, nisan (raycast), kirilma parcalari ve olcek/konum animasyonlari onlari kullanmaya devam eder; her karede matrisleri
// instance tamponuna kopyalanir. Turun dusuk ucgenli surumu (lod) varsa: arkada kalan (onunde baska blok olan) bloklar ve
// cok kalabalik bolumde hepsi dusuk surumle cizilir.
export function ornekKur({ THREE, scene, S }) {
  const T = new Map(), ONZ = new Map();
  const anahtar = (p) => Math.round(p.x / S * 2) + ',' + Math.round(p.y / S * 2);
  function im(r, d, n) {
    let m = r.im[d];
    if (m && n <= m.userData.max) return m;
    if (m) { scene.remove(m); m.dispose(); }
    const max = Math.max(16, Math.ceil(n * 1.5)), o = r.o;
    m = new THREE.InstancedMesh(d ? o.lod : o.geo, o.mat, max); m.userData.max = max; m.count = 0;
    m.frustumCulled = false; m.receiveShadow = true; m.castShadow = !o.golgeKutu; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(m); r.im[d] = m;
    if (o.golgeKutu && !r.gk) {   // agir modellerde golge 12 ucgenlik kutudan (ust kat golgesi yine dogru)
      const b = o.geo.boundingBox || (o.geo.computeBoundingBox(), o.geo.boundingBox), sz = b.getSize(new THREE.Vector3());
      r.gkGeo = new THREE.BoxGeometry(sz.x * 0.95, sz.y * 0.97, sz.z * 0.95);
    }
    if (o.golgeKutu && (!r.gk || n > r.gk.userData.max)) {
      if (r.gk) { scene.remove(r.gk); r.gk.dispose(); }
      r.gk = new THREE.InstancedMesh(r.gkGeo, new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }), max * 2);
      r.gk.userData.max = max * 2; r.gk.count = 0; r.gk.frustumCulled = false; r.gk.castShadow = true; scene.add(r.gk);
    }
    return m;
  }
  // kenar parlamasi (rim): kameraya yan bakan yuzeylerde hafif sicak isik; bloklarin siluetini fonun onunde ayirir
  function rimEkle(m) {
    if (!m || m.userData.rim || !(m.isMeshStandardMaterial)) return; m.userData.rim = 1;
    const eski = m.onBeforeCompile;
    m.onBeforeCompile = (sh, r) => { if (eski) eski(sh, r); sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n  totalEmissiveRadiance += vec3(1.0, 0.93, 0.8) * pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 3.0) * 0.28;'); };
    m.customProgramCacheKey = () => 'rim1'; m.needsUpdate = true;
  }
  // tur kaydi (bir kez): o = { geo, mat, lod?, golgeKutu?, esik? }
  function tanim(k, o) { if (T.has(k)) return; T.set(k, { o, im: [null, null], n: [0, 0], gk: null }); for (const m of [].concat(o.mat)) rimEkle(m); }
  function guncelle(cubes) {
    ONZ.clear(); const say = new Map();
    for (const c of cubes) {
      if (c.out || !c.mesh || !c.mesh.parent) continue; const p = c.mesh.position, k = anahtar(p); if (!(ONZ.get(k) > p.z)) ONZ.set(k, p.z);
      if (c.ik) say.set(c.ik, (say.get(c.ik) || 0) + 1);
    }
    for (const r of T.values()) { r.n[0] = r.n[1] = 0; r.g = 0; }
    for (const c of cubes) {
      const m = c.ik && c.mesh; if (!m || !m.parent || !m.visible || c.out) continue;
      const r = T.get(c.ik); if (!r) continue; const n = say.get(c.ik), o = r.o;
      const d = o.lod && (n > (o.esik || 36) || ONZ.get(anahtar(m.position)) > m.position.z + S * 0.5) ? 1 : 0;
      m.updateMatrixWorld();
      const I = im(r, d, n); I.setMatrixAt(r.n[d]++, m.matrixWorld);
      if (r.gk) r.gk.setMatrixAt(r.g++, m.matrixWorld);
    }
    for (const r of T.values()) {
      for (const d of [0, 1]) { const I = r.im[d]; if (!I) continue; I.count = r.n[d]; if (I.count) I.instanceMatrix.needsUpdate = true; }
      if (r.gk) { r.gk.count = r.g; if (r.g) r.gk.instanceMatrix.needsUpdate = true; }
    }
  }
  function cizim() { let d = 0; for (const r of T.values()) { for (const I of r.im) if (I && I.count) d += Array.isArray(I.material) ? I.geometry.groups.length : 1; if (r.gk && r.gk.count) d++; } return d; }
  return { tanim, guncelle, cizim };
}
