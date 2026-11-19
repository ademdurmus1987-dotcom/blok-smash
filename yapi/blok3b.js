// Foxi Smash v6.1 (17 Kas 2026): ana oyunun (2000 bolum) bloklari icin Blender modelleri. Kaynak: yapi/uretici/blender/pilot_bloklar.py,
// dosyalar yapi/model/blok/*.glb (pilotla ortak olanlar yapi/model/pilot/). Turun adi, olcusu, fizigi ve kirilma davranisi AYNI kalir
// (kale.js / sekil.js); yalniz gorunum (sekil.js TUR[k].yap) bu modelle degisir. Model inmezse eski cizim kullanilir. Eski gorunum: ?b3=0.
// Modelde renk kose renginde, ortam golgesi + yumusak isik 512'lik dokuya gomulu (malzeme: doku x kose rengi).
// Tam beyaz kose rengi "govde rengi" isaretidir: o.govde verilirse o renge boyanir (tek dosyadan farkli renkli turler: yakut / elmas).
export const B3 = !/[?&]b3=0/.test(location.search);

// tur -> [dosya ('klasor/ad' ya da yalniz ad = model/blok/ad), puruzluluk, kirik parca rengi, secenek { govde, emis, emisG, env, metal }]
const BUZ = { govde: '#2a8ef4', emis: '#0b48c0', emisG: 0.3, env: 0.4 };   // pilotta denendi: saydamlik ve guclu yansima buzu soluk gosteriyordu
const KUP = (r) => ['pilot/pl_kup', 0.3, r, { govde: r }];
const SISE = (r) => ['blok/sise', 0.15, r, { govde: r, emis: r, emisG: 0.22, env: 0.8 }];   // cam: parlak, kendi isigi
const TAS = (r) => ({ govde: r, emis: r, emisG: 0.32, env: 0.6, metal: 0.15 });
const LISTE = {
  ksTas: ['tas1', 0.8, '#9aa2c0'], ksTas2: ['tas2', 0.8, '#9aa2c0'], ksTas3: ['tas3', 0.8, '#9aa2c0'], ksTas4: ['tas4', 0.8, '#9aa2c0'],
  ksSandik: ['sandik_t', 0.44, '#ff9f30'], ksSandikK: ['sandik_k', 0.44, '#ec3d31'], ksSandikM: ['sandik_m', 0.44, '#a453e6'],   // v6.2: X destekli sandik
  // v6.3: buz, yildiz, mucevher
  ksBuz: ['pilot/pl_buz', 0.22, '#5ab4ff', BUZ], ksBuz3: ['pilot/pl_buz3', 0.22, '#5ab4ff', BUZ],
  ksYildiz: ['yildiz', 0.3, '#ffc21a', { emis: '#ffb400', emisG: 0.16, env: 0.6, metal: 0.25 }],
  ksYakut: ['pilot/pl_elmas', 0.14, '#ff2a44', TAS('#e8122e')], ksElmas: ['pilot/pl_elmas', 0.14, '#40a8ff', TAS('#1a6cf4')],
  // v6.4: patili oyuncak kupler (sekil.js oy*) tek dosyadan, govde rengi tur basina; TNT, sutunlar ve direk pilot modelleri
  oyK: KUP('#e8242c'), oyY: KUP('#22b84a'), oyM: KUP('#2276f0'), oyS: KUP('#ffc400'), oyP: KUP('#8a34e6'), oyT: KUP('#f2620f'), oyN: KUP('#ff3d9e'), oyB: KUP('#f1ede4'),
  oyA: ['pilot/pl_kup', 0.26, '#f5b81c', { govde: '#f5b81c', emis: '#c07800', emisG: 0.18, env: 0.7, metal: 0.35 }],
  ksTNT: ['pilot/pl_tnt', 0.4, '#e5302a'], ksDirek: ['pilot/pl_direk', 0.42, '#f08a24'],
  ksSutun: ['pilot/pl_sutun', 0.38, '#b3bad2', { govde: '#b3bad2' }], ksMorSutun: ['pilot/pl_sutun', 0.34, '#9a3ae8', { govde: '#9a3ae8', emis: '#5a12a0', emisG: 0.12 }],
  // v6.5: ince kalaslar, ficilar, siseler (tek dosya, govde rengi), mucevher karosu, kemer
  ksKalas1: ['kalas1', 0.45, '#ffa232'], ksKalas2: ['kalas2', 0.45, '#ffa232'], ksKalas3: ['kalas3', 0.45, '#ffa232'],
  ksFici: ['fici_t', 0.5, '#f08c30'], ksFiciK: ['fici_k', 0.5, '#e0382c'],
  ksSiseM: SISE('#a040ff'), ksSiseY: SISE('#30c850'), ksSiseB: SISE('#2f8cff'),
  ksKaro: ['karo', 0.3, '#2a8cff', { emis: '#0a3a9a', emisG: 0.08 }], ksKemer: ['kemer', 0.8, '#9aa2c0']
};
// v9.6 (Adem 19 Kas: referans kalitesi): TEK TARZDA yeni blok seti (yapi/uretici/blender/yeni_bloklar.py -> model/blok2). Parlak kaplama (cila). ?b2=0 eski cizim
if (!/[?&]b2=0/.test(location.search)) {
  const R2 = { K: '#e3242f', M: '#2b6ef0', S: '#ffcc00', Y: '#1fae48', P: '#8a34e6', T: '#f2620f', N: '#ff4aa6', A: '#8fc8ff' };
  for (const [c, r] of Object.entries(R2)) {
    for (const n of [1, 2, 3, 4]) LISTE['uz' + n + c] = ['blok2/cubuk' + n, 0.18, r, { govde: r, cila: 1, env: 0.75 }];
    LISTE['kj' + c] = ['blok2/kavanoz1', 0.1, r, { govde: r, cila: 1, env: 0.95 }];
    LISTE['kvU' + c] = ['blok2/kavanoz2', 0.1, r, { govde: r, cila: 1, env: 0.95 }];
    LISTE['kr3' + c] = ['blok2/kiris3', 0.24, r, { govde: r, cila: 1, env: 0.5 }];
  }
  LISTE.dalga = ['blok2/silindir', 0.2, '#5b8cf0', { govde: '#4f86f2', cila: 1, env: 0.55 }];
}
const yol = (f) => 'model/' + (f.includes('/') ? f : 'blok/' + f) + '.glb?v=' + (f.startsWith('blok2/') ? 3 : 1);

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
    const ozel = Object.assign({ map: G.map, vertexColors: !!geo.attributes.color, roughness: L[1], metalness: o.metal || 0, envMap: ENV, envMapIntensity: o.env || 0.4 },
      o.emis ? { emissive: o.emis, emissiveIntensity: o.emisG || 0.2 } : {});
    const mat = o.cila ? new THREE.MeshPhysicalMaterial(Object.assign(ozel, { clearcoat: 1, clearcoatRoughness: 0.08 })) : new THREE.MeshStandardMaterial(ozel);   // v9.6: cilali (clearcoat) yeni set
    return (HAZ[k] = { geo, mat, golgeKutu: 1, parca: new THREE.MeshStandardMaterial({ color: L[2], roughness: 0.6 }) });
  }
  return { yukle, yap, TUR: LISTE };
}
