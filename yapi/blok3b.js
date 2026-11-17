// Foxi Smash v6.1 (17 Kas 2026): ana oyunun (2000 bolum) bloklari icin Blender modelleri. Kaynak: yapi/uretici/blender/pilot_bloklar.py,
// dosyalar yapi/model/blok/*.glb (pilotla ortak olanlar yapi/model/pilot/). Turun adi, olcusu, fizigi ve kirilma davranisi AYNI kalir
// (kale.js / sekil.js); yalniz gorunum (sekil.js TUR[k].yap) bu modelle degisir. Model inmezse eski cizim kullanilir. Eski gorunum: ?b3=0.
// Modelde renk kose renginde, ortam golgesi + yumusak isik 512'lik dokuya gomulu (malzeme: doku x kose rengi).
// Tam beyaz kose rengi "govde rengi" isaretidir: o.govde verilirse o renge boyanir (tek dosyadan farkli renkli turler: yakut / elmas).
export const B3 = !/[?&]b3=0/.test(location.search);

// tur -> [dosya ('klasor/ad' ya da yalniz ad = model/blok/ad), puruzluluk, kirik parca rengi, secenek { govde, emis, emisG, env, metal }]
const BUZ = { govde: '#2a8ef4', emis: '#0b48c0', emisG: 0.3, env: 0.4 };   // pilotta denendi: saydamlik ve guclu yansima buzu soluk gosteriyordu
const TAS = (r) => ({ govde: r, emis: r, emisG: 0.32, env: 0.6, metal: 0.15 });
const LISTE = {
  ksTas: ['tas1', 0.8, '#9aa2c0'], ksTas2: ['tas2', 0.8, '#9aa2c0'], ksTas3: ['tas3', 0.8, '#9aa2c0'], ksTas4: ['tas4', 0.8, '#9aa2c0'],
  ksSandik: ['sandik_t', 0.44, '#ff9f30'], ksSandikK: ['sandik_k', 0.44, '#ec3d31'], ksSandikM: ['sandik_m', 0.44, '#a453e6'],   // v6.2: X destekli sandik
  // v6.3: buz, yildiz, mucevher
  ksBuz: ['pilot/pl_buz', 0.22, '#5ab4ff', BUZ], ksBuz3: ['pilot/pl_buz3', 0.22, '#5ab4ff', BUZ],
  ksYildiz: ['yildiz', 0.3, '#ffc21a', { emis: '#ffb400', emisG: 0.16, env: 0.6, metal: 0.25 }],
  ksYakut: ['pilot/pl_elmas', 0.14, '#ff2a44', TAS('#e8122e')], ksElmas: ['pilot/pl_elmas', 0.14, '#40a8ff', TAS('#1a6cf4')]
};
const yol = (f) => 'model/' + (f.includes('/') ? f : 'blok/' + f) + '.glb?v=1';

export function blok3bKur({ THREE, ENV, GLTFLoader }) {
  const GLB = {}, HAZ = {};
  // butun dosyalar acilista paralel iner (her biri 20-80 KB); bolum kurulmadan once beklenir
  function yukle() {
    if (!B3) return Promise.resolve();
    const dosyalar = [...new Set(Object.values(LISTE).map((x) => x[0]))];
    return Promise.all(dosyalar.map((f) => new Promise((ok) => new GLTFLoader().load(yol(f), (gl) => {
      let m = null; gl.scene.traverse((o) => { if (o.isMesh && !m) m = o; });
      if (m) { const map = m.material && m.material.map || null; if (map) map.anisotropy = 8; GLB[f] = { geo: m.geometry, map }; }
      ok();
    }, undefined, () => { console.warn('blok3b: model yuklenemedi', f); ok(); }))));
  }
  // sekil.js TUR[k].yap yerine: model hazirsa onun cizimi, degilse null (eski cizim kullanilir). Tur basina bir kez kurulur.
  function yap(k) {
    const L = LISTE[k]; if (!B3 || !L) return null; if (HAZ[k]) return HAZ[k]; const G = GLB[L[0]]; if (!G) return null;
    const o = L[3] || {};
    let geo = G.geo;
    if (o.govde) {
      geo = G.geo.clone(); const c = geo.attributes.color, kr = new THREE.Color(o.govde);
      if (c) for (let i = 0; i < c.count; i++) if (c.getX(i) > 0.97 && c.getY(i) > 0.97 && c.getZ(i) > 0.97) c.setXYZ(i, kr.r, kr.g, kr.b);
    }
    const mat = new THREE.MeshStandardMaterial(Object.assign({ map: G.map, vertexColors: !!geo.attributes.color, roughness: L[1], metalness: o.metal || 0, envMap: ENV, envMapIntensity: o.env || 0.4 },
      o.emis ? { emissive: o.emis, emissiveIntensity: o.emisG || 0.2 } : {}));
    return (HAZ[k] = { geo, mat, golgeKutu: 1, parca: new THREE.MeshStandardMaterial({ color: L[2], roughness: 0.6 }) });
  }
  return { yukle, yap, TUR: LISTE };
}
