// Foxi Smash v12.66 deneme (Adem 26 Kas 2026, Blender kurallari: Royal Match / Toy Blast kalitesi). Anahtar: ?b8=1
// Modeller uretici/blender/royal_set.py -> model/royal/*.glb: yumusak pah, kademeli ic cerceve, gomulu 3B pati, pisirilmis renk + AO dokusu.
// Renkli plastik (kup, kavanoz): dokunun GRI kismi blok rengiyle boyanir, krem kisim (pati, kapak) oldugu gibi kalir. Ahsap, varil, buz: dokunun kendisi.
// Olcu: tur eski modelin kutusuna eksen eksen oturur (fizik, ad, kirilma ayni).
export const BLOK8 = /[?&]b8=1/.test(location.search);
const DOSYA = ['kup1', 'kup2', 'kup3', 'kup4', 'buz1', 'buz3', 'kav1', 'sandik', 'varil'];
export function blok8Kur({ THREE, GLTFLoader, mergeGeometries, SENV }) {
  const M = {}, HAZ = {};
  function yukle() {
    return Promise.all(DOSYA.map((f) => new Promise((ok) => new GLTFLoader().load('model/royal/' + f + '.glb?v=2', (gl) => {
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
    if (k === 'ksBuz') return ['buz1', 0];
    if (k === 'ksBuz3') return ['buz3', 0];
    if (k === 'ksSandik') return ['sandik', 0];
    if (k === 'ksFici') return ['varil', 0];
    return null;
  }
  function boyaliMat(kaynak, hex, boya) {
    const m = new THREE.MeshPhysicalMaterial({ map: kaynak.map, color: boya ? hex : '#ffffff', roughness: kaynak.roughness, metalness: kaynak.metalness || 0,
      clearcoat: kaynak.clearcoat || 0, clearcoatRoughness: kaynak.clearcoatRoughness || 0.12, envMap: SENV || null, envMapIntensity: 0.55 });
    if (m.map) { m.map.colorSpace = THREE.SRGBColorSpace; m.map.anisotropy = 8; }
    if (boya) {   // gri piksel (govde, AO) -> renk * parlaklik ; renkli piksel (krem pati, kapak) -> dokunun kendisi
      m.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>',
        'vec4 tx8 = texture2D( map, vMapUv ); float k8 = smoothstep( 0.035, 0.11, tx8.r - tx8.b ); diffuseColor.rgb = mix( diffuseColor.rgb * clamp( tx8.g / 0.6, 0.0, 1.25 ), min( tx8.rgb * 1.55 + 0.06, vec3( 1.0 ) ), k8 );'); };
      m.customProgramCacheKey = () => 'blok8boya2';
    }
    m.userData.yeni = 1; return m;
  }
  // k: tur adi, hex: govde rengi, boy: Vector3 eski modelin olculeri
  function yap(k, hex, boy) {
    if (HAZ[k]) return HAZ[k]; const d = dosyaOf(k); if (!d) return null; const S = M[d[0]]; if (!S || !boy) return null;
    const geo = S.geo.clone(), b = S.geo.boundingBox, c = b.getCenter(new THREE.Vector3()), z = b.getSize(new THREE.Vector3());
    geo.translate(-c.x, -c.y, -c.z); geo.scale(boy.x / z.x, boy.y / z.y, boy.z / z.z); geo.computeBoundingBox(); geo.computeBoundingSphere();
    const mat = boyaliMat(S.mat, hex, d[1]);
    return (HAZ[k] = { geo, mat, golgeKutu: 1, parca: new THREE.MeshStandardMaterial({ color: d[1] ? hex : d[0].startsWith('buz') ? '#3fd6f2' : '#c9742f', roughness: 0.5 }) });
  }
  return { yukle, yap, var: (k) => !!dosyaOf(k) };
}
