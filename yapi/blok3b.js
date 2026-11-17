// Foxi Smash v6.1 (17 Kas 2026): ana oyunun (2000 bolum) bloklari icin Blender modelleri. Kaynak: yapi/uretici/blender/pilot_bloklar.py,
// dosyalar yapi/model/blok/*.glb. Turun adi, olcusu, fizigi ve kirilma davranisi AYNI kalir (kale.js / sekil.js); yalniz gorunum
// (sekil.js TUR[k].yap) bu modelle degisir. Model inmezse eski cizim kullanilir. Eski gorunum: adrese ?b3=0 eklenir.
// Modelde renk kose renginde, ortam golgesi + yumusak isik 512'lik dokuya gomulu (malzeme: doku x kose rengi).
export const B3 = !/[?&]b3=0/.test(location.search);

// tur -> [dosya, puruzluluk, kirik parca rengi]
const LISTE = {
  ksTas: ['tas1', 0.8, '#9aa2c0'], ksTas2: ['tas2', 0.8, '#9aa2c0'], ksTas3: ['tas3', 0.8, '#9aa2c0'], ksTas4: ['tas4', 0.8, '#9aa2c0'],
  ksSandik: ['sandik_t', 0.44, '#ff9f30'], ksSandikK: ['sandik_k', 0.44, '#ec3d31'], ksSandikM: ['sandik_m', 0.44, '#a453e6']   // v6.2: X destekli sandik
};

export function blok3bKur({ THREE, ENV, GLTFLoader }) {
  const GLB = {}, MAT = {};
  // butun dosyalar acilista paralel iner (her biri ~80 KB); bolum kurulmadan once beklenir
  function yukle() {
    if (!B3) return Promise.resolve();
    const dosyalar = [...new Set(Object.values(LISTE).map((x) => x[0]))];
    return Promise.all(dosyalar.map((f) => new Promise((ok) => new GLTFLoader().load('model/blok/' + f + '.glb?v=1', (gl) => {
      let m = null; gl.scene.traverse((o) => { if (o.isMesh && !m) m = o; });
      if (m) { const map = m.material && m.material.map || null; if (map) map.anisotropy = 8; GLB[f] = { geo: m.geometry, map }; }
      ok();
    }, undefined, () => { console.warn('blok3b: model yuklenemedi', f); ok(); }))));
  }
  // sekil.js TUR[k].yap yerine: model hazirsa onun cizimi, degilse null (eski cizim kullanilir)
  function yap(k) {
    const L = LISTE[k]; if (!B3 || !L) return null; const G = GLB[L[0]]; if (!G) return null;
    const mat = MAT[L[0]] || (MAT[L[0]] = new THREE.MeshStandardMaterial({ map: G.map, vertexColors: !!G.geo.attributes.color, roughness: L[1], metalness: 0, envMap: ENV, envMapIntensity: 0.4 }));
    return { geo: G.geo, mat, golgeKutu: 1, parca: new THREE.MeshStandardMaterial({ color: L[2], roughness: 0.9 }) };
  }
  return { yukle, yap, TUR: LISTE };
}
