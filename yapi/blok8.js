// v12.67 (Adem ince ayar): kup rough 0.22 / coat 0.90 / 0.10, pati oyugu gunesle pisirildi (ust ic kenar golge, alt parlak), kavanozda pati yok, dikey cam parlamasi.
// Foxi Smash v12.66 deneme (Adem 26 Kas 2026, Blender kurallari: Royal Match / Toy Blast kalitesi). Anahtar: ?b8=1
// Modeller uretici/blender/royal_set.py -> model/royal/*.glb: yumusak pah, kademeli ic cerceve, gomulu 3B pati, pisirilmis renk + AO dokusu.
// Renkli plastik (kup, kavanoz): dokunun GRI kismi blok rengiyle boyanir, krem kisim (pati, kapak) oldugu gibi kalir. Ahsap, varil, buz: dokunun kendisi.
// Olcu: tur eski modelin kutusuna eksen eksen oturur (fizik, ad, kirilma ayni).
export const BLOK8 = !/[?&]b8=0/.test(location.search);   // v12.68 VARSAYILAN (Adem: 'cok iyi oturdu'), eski ?b8=0
// v12.68 TEMAS KARARTMASI (ucuz, golge haritasi gerektirmez): blokun alt %22'si model yuksekligine gore koyulasir (ust bloga / platforma oturma hissi),
// ust kenarda cok hafif aciklik. Model uzayinda hesaplanir; InstancedMesh ile ek cizim yok. Kapatma: ?temas=0
export const TEMAS = !/[?&]temas=0/.test(location.search);
export function temasEkle(m, hy, ad) {
  if (!TEMAS || !m || !(hy > 0)) return m;
  const once = m.onBeforeCompile, k0 = m.customProgramCacheKey ? m.customProgramCacheKey() : '';
  m.onBeforeCompile = (sh, r) => {
    if (once) once(sh, r);
    sh.vertexShader = 'varying float vTy;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vTy = transformed.y / ' + hy.toFixed(4) + ';');
    sh.fragmentShader = 'varying float vTy;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb *= mix( 0.6, 1.0, smoothstep( -1.0, -0.56, vTy ) ) * ( 1.0 + 0.06 * smoothstep( 0.7, 1.0, vTy ) );');
  };
  m.customProgramCacheKey = () => k0 + '|temas' + hy.toFixed(3) + (ad || '');
  m.needsUpdate = true; return m;
}
const DOSYA = ['kup1', 'kup2', 'kup3', 'kup4', 'buz1', 'buz3', 'kav1', 'sandik', 'varil'];
export function blok8Kur({ THREE, GLTFLoader, mergeGeometries, SENV }) {
  const M = {}, HAZ = {};
  function yukle() {
    return Promise.all(DOSYA.map((f) => new Promise((ok) => new GLTFLoader().load('model/royal/' + f + '.glb?v=6', (gl) => {
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
    if (/[?&]b8buz=1/.test(location.search) && k === 'ksBuz') return ['buz1', 0];   // v12.68: Royal buzu oyunda soluk/gri cikiyor; varsayilan blok6 kristal (mavi). Deneme ?b8buz=1
    if (/[?&]b8buz=1/.test(location.search) && k === 'ksBuz3') return ['buz3', 0];
    if (k === 'ksSandik') return ['sandik', 0];
    if (k === 'ksFici') return ['varil', 0];
    return null;
  }
  function boyaliMat(kaynak, hex, boya) {
    const m = new THREE.MeshPhysicalMaterial({ map: kaynak.map, color: boya ? hex : '#ffffff', roughness: kaynak.roughness, metalness: kaynak.metalness || 0,
      clearcoat: kaynak.clearcoat || 0, clearcoatRoughness: kaynak.clearcoatRoughness || 0.12, envMap: SENV || null, envMapIntensity: boya ? 0.8 : kaynak.roughness < 0.16 ? 0.14 : 0.55 });   // v12.68: buz (rough 0.12) stüdyo panosunu ayna gibi yansitip beyaza donuyordu   // v12.67: standart bloklar kavanoz kadar parlak
    if (m.map) { m.map.colorSpace = THREE.SRGBColorSpace; m.map.anisotropy = 8; }
    if (boya) {   // gri piksel (govde, AO) -> renk * parlaklik ; renkli piksel (krem pati, kapak) -> dokunun kendisi
      m.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>',
        'vec4 tx8 = texture2D( map, vMapUv ); float k8 = smoothstep( 0.035, 0.11, tx8.r - tx8.b ), p8 = smoothstep( 0.83, 0.95, min( tx8.r, tx8.b ) ); diffuseColor.rgb = mix( mix( diffuseColor.rgb * clamp( tx8.g / 0.6, 0.0, 1.25 ), min( tx8.rgb * 1.12, vec3( 1.0 ) ), k8 ), vec3( 0.97 ), p8 * 0.85 );'); };
      m.customProgramCacheKey = () => 'blok8boya4';
    }
    m.userData.yeni = 1; return m;
  }
  // k: tur adi, hex: govde rengi, boy: Vector3 eski modelin olculeri
  function yap(k, hex, boy) {
    if (HAZ[k]) return HAZ[k]; const d = dosyaOf(k); if (!d) return null; const S = M[d[0]]; if (!S || !boy) return null;
    const geo = S.geo.clone(), b = S.geo.boundingBox, c = b.getCenter(new THREE.Vector3()), z = b.getSize(new THREE.Vector3());
    geo.translate(-c.x, -c.y, -c.z); geo.scale(boy.x / z.x, boy.y / z.y, boy.z / z.z); geo.computeBoundingBox(); geo.computeBoundingSphere();
    const mat = temasEkle(boyaliMat(S.mat, hex, d[1]), boy.y / 2, 'b8');
    return (HAZ[k] = { geo, mat, golgeKutu: 1, parca: new THREE.MeshStandardMaterial({ color: d[1] ? hex : d[0].startsWith('buz') ? '#3fd6f2' : '#c9742f', roughness: 0.5 }) });
  }
  return { yukle, yap, var: (k) => !!dosyaOf(k) };
}
