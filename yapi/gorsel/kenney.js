// Kenney (CC0, kenney.nl) modelleri icin ortak yukleyici + malzeme yukseltmesi.
// - Her GLB bir kez yuklenir ve onbellege alinir; kopyalar geometri/malzeme paylasir (clone) ya da InstancedMesh ile cizilir.
// - Yukleme hatasinda null doner, oyun kirilmaz (cagiran yedek yolu kullanir ya da dekoru atlar).
// - Klasor yapisi korunur: assets/models/kenney/<paket>/<model>.glb, doku Textures/colormap.png (GLB icinden goreli yol).
import * as THREE from '../../three.module.min.js';
import { GLTFLoader } from '../../GLTFLoader.js?v=2';
import { KENNEY_MALZEME } from './ayar.js';

const KOK = new URL('../../assets/models/kenney/', import.meta.url).href;
const ONB = new Map();       // ad -> Promise<gltf|null>
const MAT = new Map();       // paket+kategori -> yukseltilmis malzeme
const DOKU = new Map();      // paket -> colormap (tek kopya)
let LD = null, ENV = null, UYARI = 0;

export function kenneyOrtam(env) { ENV = env; for (const m of MAT.values()) { m.envMap = env; m.needsUpdate = true; } }

function kategori(ad) {
  const kisa = ad.split('/').pop();
  for (let i = 0; i < KENNEY_MALZEME.length; i++) { const k = KENNEY_MALZEME[i]; if (k.esle.some((e) => e !== 'varsayilan' && kisa.includes(e))) return i; }
  return KENNEY_MALZEME.length - 1;
}
// dokuyu koruyarak MeshPhysicalMaterial'a cevir; ayni paket + ayni kategori tek malzemeyi paylasir
export function malzemeYukselt(eski, ad) {
  // pakettaki butun modeller ayni colormap'i ayni UV ile kullanir (doku donusumu yok): paket + kategori basina tek malzeme/doku
  const paket = ad.split('/')[0], ki = kategori(ad), key = paket + ':' + ki + ':' + (eski.transparent ? 't' : 'o');
  if (MAT.has(key)) { if (eski.map && eski.map !== MAT.get(key).map) eski.map.dispose(); eski.dispose(); return MAT.get(key); }
  if (eski.map && DOKU.has(paket)) { eski.map.dispose(); eski.map = DOKU.get(paket); } else if (eski.map) DOKU.set(paket, eski.map);
  const c = KENNEY_MALZEME[ki], m = new THREE.MeshPhysicalMaterial({
    map: eski.map || null, color: eski.color ? eski.color.clone() : new THREE.Color('#fff'),
    roughness: c.roughness, metalness: c.metalness, clearcoat: c.clearcoat || 0, clearcoatRoughness: c.clearcoatRoughness ?? 0.2,
    envMapIntensity: c.envMapIntensity ?? 1, side: eski.side, transparent: eski.transparent, opacity: eski.opacity, alphaTest: eski.alphaTest
  });
  if (m.map) { m.map.colorSpace = THREE.SRGBColorSpace; m.map.anisotropy = 4; }
  if (c.emissiveIntensity) { m.emissive = new THREE.Color('#ffffff'); m.emissiveMap = m.map; m.emissiveIntensity = c.emissiveIntensity; }
  m.envMap = ENV; m.name = 'kenney:' + key; MAT.set(key, m); return m;
}

// ad: '<paket>/<model>' (uzantisiz). Doner: Promise<{ sahne, ad, anim }|null>
export function kenneyYukle(ad) {
  if (ONB.has(ad)) return ONB.get(ad);
  if (!LD) LD = new GLTFLoader();
  const p = new Promise((res) => {
    LD.load(KOK + ad + '.glb', (g) => {
      g.scene.traverse((o) => { if (o.isMesh) { o.material = Array.isArray(o.material) ? o.material.map((x) => malzemeYukselt(x, ad)) : malzemeYukselt(o.material, ad); o.castShadow = true; o.receiveShadow = true; } });
      res({ sahne: g.scene, ad, anim: g.animations || [] });
    }, undefined, () => { if (UYARI++ < 3) console.warn('[kenney] yuklenemedi:', ad); res(null); });
  });
  ONB.set(ad, p); return p;
}
export const kenneyHepsi = (adlar) => Promise.all(adlar.map(kenneyYukle));

// paylasimli kopya (geometri + malzeme ortak). Animasyonlu parcalar (yelken, bayrak, kapak) icin ad'la bulunur.
export async function kenneyKopya(ad) { const g = await kenneyYukle(ad); return g ? g.sahne.clone(true) : null; }

// tekrarlayan dekor: her mesh icin tek InstancedMesh. mats: THREE.Matrix4 listesi (dunya donusumu)
export async function kenneyCoklu(ad, mats) {
  const g = await kenneyYukle(ad); if (!g || !mats.length) return null;
  const grup = new THREE.Group(); grup.name = 'coklu:' + ad; g.sahne.updateMatrixWorld(true);
  const tmp = new THREE.Matrix4(), parca = [];
  g.sahne.traverse((o) => {
    if (!o.isMesh) return;
    const im = new THREE.InstancedMesh(o.geometry, o.material, mats.length); im.castShadow = o.castShadow; im.receiveShadow = true;
    grup.add(im); parca.push([im, o.matrixWorld.clone()]);
  });
  // i. ornegin dunya donusumunu degistir (konum/olcek/donus)
  grup.userData.ayarla = (i, M) => { for (const [im, yerel] of parca) { im.setMatrixAt(i, tmp.multiplyMatrices(M, yerel)); im.instanceMatrix.needsUpdate = true; } };
  grup.userData.bitti = () => { for (const [im] of parca) { im.computeBoundingSphere(); im.computeBoundingBox(); } };
  mats.forEach((m, i) => grup.userData.ayarla(i, m)); grup.userData.bitti();
  return grup;
}
// modelin olcusu (birim kutu)
export function kenneyOlcu(nesne) { const b = new THREE.Box3().setFromObject(nesne); return b.getSize(new THREE.Vector3()); }
