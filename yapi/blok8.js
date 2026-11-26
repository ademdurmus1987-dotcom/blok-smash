// v12.67 (Adem ince ayar): kup rough 0.22 / coat 0.90 / 0.10, pati oyugu gunesle pisirildi (ust ic kenar golge, alt parlak), kavanozda pati yok, dikey cam parlamasi.
// Foxi Smash v12.66 deneme (Adem 26 Kas 2026, Blender kurallari: Royal Match / Toy Blast kalitesi). Anahtar: ?b8=1
// Modeller uretici/blender/royal_set.py -> model/royal/*.glb: yumusak pah, kademeli ic cerceve, gomulu 3B pati, pisirilmis renk + AO dokusu.
// Renkli plastik (kup, kavanoz): dokunun GRI kismi blok rengiyle boyanir, krem kisim (pati, kapak) oldugu gibi kalir. Ahsap, varil, buz: dokunun kendisi.
// Olcu: tur eski modelin kutusuna eksen eksen oturur (fizik, ad, kirilma ayni).
export const BLOK8 = !/[?&]b8=0/.test(location.search);   // v12.68 VARSAYILAN (Adem: 'cok iyi oturdu'), eski ?b8=0
// v12.68 TEMAS KARARTMASI (ucuz, golge haritasi gerektirmez): blokun alt %22'si model yuksekligine gore koyulasir (ust bloga / platforma oturma hissi),
// ust kenarda cok hafif aciklik. Model uzayinda hesaplanir; InstancedMesh ile ek cizim yok. Kapatma: ?temas=0
export const FUGA = !/[?&]fuga=0/.test(location.search);   // v12.69 F: yan yana bloklarin birlesim cizgisi, kapatma ?fuga=0
export const TEMAS = !/[?&]temas=0/.test(location.search);
export function temasEkle(m, hy, ad, hx) {
  if (!TEMAS || !m || !(hy > 0)) return m;
  const once = m.onBeforeCompile, k0 = m.customProgramCacheKey ? m.customProgramCacheKey() : '';
  m.onBeforeCompile = (sh, r) => {   // v12.69: yukseklik uniform (tum bloklar tek program paylasir, deger malzemeye ozel)
    if (once) once(sh, r);
    sh.uniforms.uTy = { value: 1 / hy }; sh.uniforms.uTx = { value: hx > 0 ? 1 / hx : 0 };   // v12.69 F: yan kenar (birlesim) icin
    sh.vertexShader = 'uniform float uTy, uTx;\nvarying float vTy, vTx;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vTy = transformed.y * uTy; vTx = transformed.x * uTx;');
    sh.fragmentShader = 'varying float vTy, vTx;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb *= mix( 0.6, 1.0, smoothstep( -1.0, -0.56, vTy ) ) * ( 1.0 + 0.06 * smoothstep( 0.7, 1.0, vTy ) ) * ( 1.0 - ' + (FUGA ? '0.16' : '0.0') + ' * smoothstep( 0.92, 1.0, abs( vTx ) ) );');
  };
  m.customProgramCacheKey = () => k0 + '|temas2' + (FUGA ? 'f' : '');
  m.needsUpdate = true; return m;
}
const METAL = !/[?&]metal=0/.test(location.search);   // v12.69
const LODQ = !/[?&]lod=0/.test(location.search);   // v12.69, kapatma ?lod=0
const YENI = !/[?&]b8yeni=0/.test(location.search);   // v12.69 yeni turler (tas, TNT, yildiz, kalas, direk, kirmizi varil); kapatma ?b8yeni=0
const DOSYA = ['kup1', 'kup2', 'kup3', 'kup4', 'buz1', 'buz3', 'kav1', 'sandik', 'varil'].concat(YENI ? ['tas1', 'tas2', 'tas3', 'tas4', 'tnt', 'yildiz', 'kalas1', 'kalas2', 'kalas3', 'direk', 'varilK'] : []);
export function blok8Kur({ THREE, GLTFLoader, mergeGeometries, SENV }) {
  const M = {}, HAZ = {};
  function yukle() {
    return Promise.all(DOSYA.map((f) => new Promise((ok) => new GLTFLoader().load('model/royal/' + f + '.glb?v=9', (gl) => {
      const gs = [], mats = []; gl.scene.updateMatrixWorld(true);
      gl.scene.traverse((o) => { if (o.isMesh) { const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld); for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k); gs.push(g); mats.push(o.material); } });
      const geo = gs.length > 1 ? mergeGeometries(gs, false) : gs[0]; if (geo) { geo.computeBoundingBox(); M[f] = { geo, mat: mats[0] }; }
      ok();
    }, undefined, () => { console.warn('blok8: yuklenemedi', f); ok(); }))));
  }
  function dosyaOf(k, kutu) {
    let m = /^oy([KMSYPTNBZHGE])$/.exec(k); if (m) return ['kup1', 1];
    m = /^uz([1-4])([KMSYPTNBZHGE])$/.exec(k); if (m) return ['kup' + m[1], 1];
    if (/^(kj[A-Z]|kvU[A-Z]|kvB[A-Z]|ksSise[MYB])$/.test(k)) return ['kav1', 1];
    if (!/[?&]b8buz=0/.test(location.search) && k === 'ksBuz') return ['buz1', 0];   // v12.69: gri cikma nedeni ornek.js program anahtari idi (duzeltildi); Royal buz varsayilan, eski kristal ?b8buz=0
    if (!/[?&]b8buz=0/.test(location.search) && k === 'ksBuz3') return ['buz3', 0];
    if (k === 'ksSandik') return ['sandik', 0];
    if (YENI) {   // [dosya, boya, 'yar': olcu blok6 gibi yarim kup katina yuvarlanir (bugun bu turleri cizen kodla birebir ayni kutu)]
      if (k === 'ksSandikM' || k === 'ksSandikK') return ['sandik', 0];
      m = /^ksTas([234]?)$/.exec(k); if (m) return ['tas' + (m[1] || 1), 0, 'yar'];
      if (k === 'ksTNT') return ['tnt', 0, 'yar'];
      if (k === 'ksYildiz') return ['yildiz', 0, 'yar'];
      m = /^ksKalas([123])$/.exec(k); if (m) return ['kalas' + m[1], 0, 'yar'];
      if (k === 'ksDirek') return ['direk', 0, 'yar'];
      if (k === 'ksFiciK') return ['varilK', 0];
    }
    if (k === 'ksFici') return ['varil', 0];
    return null;
  }
  function boyaliMat(kaynak, hex, boya, dosya) {
    const m = new THREE.MeshPhysicalMaterial({ map: kaynak.map, color: boya ? hex : '#ffffff', roughness: kaynak.roughness, metalness: kaynak.metalness || 0,
      clearcoat: kaynak.clearcoat || 0, clearcoatRoughness: kaynak.clearcoatRoughness || 0.12, envMap: SENV || null, envMapIntensity: boya ? 0.8 : kaynak.roughness < 0.16 ? 0.14 : 0.55 });   // v12.68: buz (rough 0.12) stüdyo panosunu ayna gibi yansitip beyaza donuyordu   // v12.67: standart bloklar kavanoz kadar parlak
    if (m.map) { m.map.colorSpace = THREE.SRGBColorSpace; m.map.anisotropy = 8; }
    if (boya) {   // gri piksel (govde, AO) -> renk * parlaklik ; renkli piksel (krem pati, kapak) -> dokunun kendisi
      const acik = new THREE.Color(hex).getHSL({}).l > 0.72 ? 1 : 0;   // v12.69: krem / beyaz blokta pati karamel tonunda (krem ustune krem kayboluyordu)
      m.onBeforeCompile = (sh) => { sh.uniforms.uAcik = { value: acik }; sh.fragmentShader = 'uniform float uAcik;\n' + sh.fragmentShader.replace('#include <map_fragment>',
        'vec4 tx8 = texture2D( map, vMapUv ); float k8 = smoothstep( 0.035, 0.11, tx8.r - tx8.b ), p8 = smoothstep( 0.83, 0.95, min( tx8.r, tx8.b ) ); vec3 pt8 = mix( min( tx8.rgb * 1.12, vec3( 1.0 ) ), tx8.rgb * vec3( 0.78, 0.56, 0.36 ), uAcik ); diffuseColor.rgb = mix( mix( diffuseColor.rgb * clamp( tx8.g / 0.6, 0.0, 1.25 ), pt8, k8 ), vec3( 0.97 ), p8 * 0.85 );'); };
      m.customProgramCacheKey = () => 'blok8boya5';
    }
    if (!boya && METAL) {   // v12.69 D: varil cemberi, kalas / direk bantlari, percinler: dokuda dusuk doygun koyu gri -> metal (yansima + dusuk puruz)
      const once = m.onBeforeCompile;
      m.onBeforeCompile = (sh, r) => { if (once) once(sh, r);
        sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n float mx8 = max( sampledDiffuseColor.r, max( sampledDiffuseColor.g, sampledDiffuseColor.b ) ), mn8 = min( sampledDiffuseColor.r, min( sampledDiffuseColor.g, sampledDiffuseColor.b ) ); float m8 = ( 1.0 - smoothstep( 0.05, 0.1, mx8 - mn8 ) ) * ( 1.0 - smoothstep( 0.3, 0.42, mx8 ) ) * step( 0.015, mx8 ); diffuseColor.rgb = mix( diffuseColor.rgb, vec3( 0.55, 0.58, 0.64 ) * ( 0.6 + 2.2 * mx8 ), m8 );')
          .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\n metalnessFactor = mix( metalnessFactor, 0.85, m8 );')
          .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = mix( roughnessFactor, 0.28, m8 );'); };
      const k0 = m.customProgramCacheKey ? m.customProgramCacheKey() : ''; m.customProgramCacheKey = () => k0 + '|metal9';
    }
    if (/^tas/.test(dosya || '')) m.color.setScalar(1.22);
    if (dosya === 'yildiz') m.color.setScalar(1.3);   // v12.69: pisirilmis AO yildizi eskisinden soluk gosteriyordu   // v12.69: Royal tas eski tastan koyu duruyordu
    if (!boya && kaynak.roughness < 0.16) {   // v12.69 buz: blok6 kristal ile ayni dil: ton eslemesiz (acik mavi kremlesmez), dokudan hafif ic isik (buz icten parlar)
      m.toneMapped = false; m.emissive = new THREE.Color('#ffffff'); m.emissiveMap = m.map; m.emissiveIntensity = 0.32;
    }
    m.userData.yeni = 1; return m;
  }
  // k: tur adi, hex: govde rengi, boy: Vector3 eski modelin olculeri
  function yap(k, hex, boy) {
    if (HAZ[k]) return HAZ[k]; const d = dosyaOf(k); if (!d) return null; const S = M[d[0]]; if (!S || !boy) return null;
    if (d[2] === 'yar') { const Sk = 1.55, yar = (v) => Math.max(0.5, Math.round(v / Sk * 2) / 2) * Sk; boy = new THREE.Vector3(yar(boy.x) * 0.994, yar(boy.y) * 0.992, yar(boy.z) * 0.992); }   // blok6.yap ile ayni olcu
    const geo = S.geo.clone(), b = S.geo.boundingBox, c = b.getCenter(new THREE.Vector3()), z = b.getSize(new THREE.Vector3());
    geo.translate(-c.x, -c.y, -c.z); geo.scale(boy.x / z.x, boy.y / z.y, boy.z / z.z); geo.computeBoundingBox(); geo.computeBoundingSphere();
    const mat = temasEkle(boyaliMat(S.mat, hex, d[1], d[0]), boy.y / 2, 'b8', boy.x / 2);
    // v12.69 LOD (ornek.js zaten destekliyor): onunde baska blok olan, yani gorunmeyen bloklar sade kutu / silindirle cizilir; UV govdenin yan yuzunden tek noktaya baglanir (renk ayni kalir)
    let lod = null;
    if (LODQ) {
      const p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv; let en = -1, u0 = 0, v0 = 0;
      for (let i = 0; i < n.count; i++) { const sk = n.getX(i) - Math.abs(p.getY(i)) / boy.y; if (sk > en) { en = sk; u0 = uv.getX(i); v0 = uv.getY(i); } }
      lod = d[0] === 'kav1' || d[0] === 'varil' ? new THREE.CylinderGeometry(boy.x / 2 * 0.97, boy.x / 2 * 0.97, boy.y * 0.98, 12, 1) : new THREE.BoxGeometry(boy.x * 0.98, boy.y * 0.98, boy.z * 0.98);
      const lu = lod.attributes.uv; for (let i = 0; i < lu.count; i++) lu.setXY(i, u0, v0); lod.computeBoundingBox(); lod.computeBoundingSphere();
    }
    return (HAZ[k] = { geo, lod, esik: 99999, mat, golgeKutu: 1, parca: new THREE.MeshStandardMaterial({ color: d[1] ? hex : d[0].startsWith('buz') ? '#3fd6f2' : '#c9742f', roughness: 0.5 }) });
  }
  return { yukle, yap, var: (k) => !!dosyaOf(k) };
}
