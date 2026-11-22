// Foxi Smash v6.1 (17 Kas 2026): ana oyunun (2000 bolum) bloklari icin Blender modelleri. Kaynak: yapi/uretici/blender/pilot_bloklar.py,
// dosyalar yapi/model/blok/*.glb (pilotla ortak olanlar yapi/model/pilot/). Turun adi, olcusu, fizigi ve kirilma davranisi AYNI kalir
// (kale.js / sekil.js); yalniz gorunum (sekil.js TUR[k].yap) bu modelle degisir. Model inmezse eski cizim kullanilir. Eski gorunum: ?b3=0.
// Modelde renk kose renginde, ortam golgesi + yumusak isik 512'lik dokuya gomulu (malzeme: doku x kose rengi).
// Tam beyaz kose rengi "govde rengi" isaretidir: o.govde verilirse o renge boyanir (tek dosyadan farkli renkli turler: yakut / elmas).
import { SEKER, SEKERL, sekerBoya, sekerMat } from './seker.js?v=6';   // v11: varsayilan, eski ?yeni=0
export const B3 = !/[?&]b3=0/.test(location.search);

// tur -> [dosya ('klasor/ad' ya da yalniz ad = model/blok/ad), puruzluluk, kirik parca rengi, secenek { govde, emis, emisG, env, metal }]
const BUZ = { govde: '#2a8ef4', emis: '#0b48c0', emisG: 0.3, env: 0.4 };   // pilotta denendi: saydamlik ve guclu yansima buzu soluk gosteriyordu
// v10.35 (Adem: 'altin kup ve kavanozu oyuna koyup deneyelim'): rakip tarzi kalin altin cerceveli, girintili renkli icli patili kup ve
// dik cizgili kapakli kavanoz (uretici/blender/kup3.py, ornek_bloklar.py). Eski modeller: ?b35=0
const B35 = /[?&]b35=1/.test(location.search);   // v10.35d (Adem: 'bozdun, eskisi daha iyiydi'): yeni kup/kavanoz yalniz ?b35=1 ile
const KUP = (r) => [B35 ? 'blok2/kup3' : 'pilot/pl_kup', 0.3, r, /[?&]kupcila=0/.test(location.search) ? { govde: r } : { govde: r, cila: 1, env: 0.55 }];   // v9.8: patili kup de cilali (?kupcila=0 eski)
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
  const YENI = !/[?&]parla=0/.test(location.search);   // v9.7: biraz daha acik mor, altin sari; kavanozda gri yansima azaldi
  const R2 = { K: '#e3242f', M: '#2b6ef0', S: '#ffcc00', Y: '#1fae48', P: YENI ? '#9842f0' : '#8a34e6', T: '#f2620f', N: '#ff4aa6', A: '#8fc8ff' };
  for (let [c, r] of Object.entries(R2)) {
    for (const n of [1, 2, 3, 4]) LISTE['uz' + n + c] = ['blok2/cubuk' + n, 0.18, r, { govde: r, cila: 1, env: 0.75 }];
    // v10.31 (Adem: 'siseleri gelistir, referans kalitesi'): yeni kavanoz modeli (uretici/blender/kavanoz2.py: kalin tirtikli kapak, boyun, yuvarlak omuz,
    // pati ve boyali parlama yok) ve daha az ic isik (golge ve hacim gorunsun). Eski: ?sise=eski
    const KV2 = !/[?&]sise=eski/.test(location.search), KE = +((/[?&]kemis=([0-9.]+)/.exec(location.search) || [])[1] || 0.14);
    const KG = +((/[?&]kenv=([0-9.]+)/.exec(location.search) || [])[1] || 4.5), KR = +((/[?&]krough=([0-9.]+)/.exec(location.search) || [])[1] || 0.14);
    const KVR = (/[?&]kvRenk=([0-9a-f]{6})/.exec(location.search) || [])[1];   // deneme: butun kavanozlar bu renkte
    // v10.34: yesil yalniz kavanozda referanstaki gibi acik ve canli (ornek_1 yesili ~#32cc34). Deneme: ?kvYesil=rrggbb, eski: ?kvYesil=0
    const KYS = (/[?&]kvYesil=([0-9a-f]{6}|0|1)/.exec(location.search) || [])[1];
    const rk = KVR ? '#' + KVR : c === 'Y' && KYS !== '0' ? '#' + (KYS && KYS !== '1' ? KYS : '3ad23e') : r;   // v10.35f (Adem: 'bozan senden sonraki'): v10.34 canli yesil yine varsayilan, eski: ?kvYesil=0
    const kvo = YENI ? { govde: rk, cila: 1, env: 0.7, emis: rk, emisG: KV2 ? KE : 0.26, bant: 1, kav: KV2 ? 1 : 0, kenv: KG, krough: KR } : { govde: r, cila: 1, env: 0.95 };
    LISTE['kj' + c] = [KV2 ? (B35 ? 'blok2/kav3_1' : 'blok2/kav2_1') : 'blok2/kavanoz1', 0.1, r, kvo];
    LISTE['kvU' + c] = [KV2 ? (B35 ? 'blok2/kav3_2' : 'blok2/kav2_2') : 'blok2/kavanoz2', 0.1, r, kvo];
    LISTE['kvL' + c] = [KV2 ? (B35 ? 'blok2/kav3_3' : 'blok2/kav2_3') : 'blok2/kavanoz3', 0.1, r, kvo];   // v10.3
    LISTE['kvB' + c] = [KV2 ? (B35 ? 'blok2/kav3_B' : 'blok2/kav2_B') : 'blok2/kavanozB', 0.1, r, kvo];
    LISTE['kr3' + c] = ['blok2/kiris3', 0.24, r, { govde: r, cila: 1, env: 0.5 }];
  }
  if (YENI) {   // v9.9: tas, buz, sandik da ayni yastik kenarli tarzda (yeni_bloklar.py tas_y / buz_y / sandik_y)
    for (const n of [1, 2, 3, 4]) LISTE['ksTas' + (n > 1 ? n : '')] = ['blok2/tas' + n, 0.5, '#9aa2c0', { cila: 1, env: 0.45 }];
    LISTE.ksBuz = ['blok2/buz1', 0.1, '#8fd8ff', { govde: '#12a4ee', emis: '#0a5cc0', emisG: 0.14, cila: 1, env: 0.6 }];
    LISTE.ksBuz3 = ['blok2/buz3', 0.1, '#8fd8ff', { govde: '#12a4ee', emis: '#0a5cc0', emisG: 0.14, cila: 1, env: 0.6 }];
    LISTE.ksFici = ['blok2/fici', 0.3, '#f08c30', { govde: '#e8801e', cila: 1, env: 0.5, bant: 1 }];   // v10.2
    LISTE.ksFiciK = ['blok2/fici', 0.3, '#e0382c', { govde: '#d8322a', cila: 1, env: 0.5, bant: 1 }];
    LISTE.ksTNT = ['blok2/tnt', 0.3, '#e5302a', { govde: '#e5302a', cila: 1, env: 0.5 }];   // v10.5: TNT, direk, kalas yeni tarzda
    LISTE.ksDirek = ['blok2/direk', 0.3, '#f08a24', { govde: '#ee8420', cila: 1, env: 0.5 }];
    for (const n of [1, 2, 3]) LISTE['ksKalas' + n] = ['blok2/kalas' + n, 0.3, '#ffa232', { govde: '#f39a2e', cila: 1, env: 0.5 }];
    for (const k of ['ksSutun', 'ksMorSutun']) if (LISTE[k]) LISTE[k] = [LISTE[k][0], Math.min(0.3, LISTE[k][1]), LISTE[k][2], Object.assign({}, LISTE[k][3] || {}, { cila: 1, env: 0.5 })];   // v10.2: cilali
    LISTE.ksSandik = ['blok2/sandik', 0.3, '#ff9f30', { govde: '#f07a14', cila: 1, env: 0.5 }];
    LISTE.ksSandikK = ['blok2/sandik', 0.3, '#ec3d31', { govde: '#e0302a', cila: 1, env: 0.5 }];
    LISTE.ksSandikM = ['blok2/sandik', 0.3, '#a453e6', { govde: '#9842f0', cila: 1, env: 0.5 }];
  }
  LISTE.dalga = ['blok2/silindir', 0.2, '#5b8cf0', { govde: '#4f86f2', cila: 1, env: 0.55, bant: 1 }];
}
// v10.34: matcap malzeme grubu (blok3b mcMat MCG). kup/tahta yari, silindir parlak, tas mat, altin metal. Kavanoz kendi grubunda (kav). Eski: ?mc2=0
{
  const GR = [[/^(oy[KYMSPTNB]|uz\d|kr3|ksSandik|ksKalas|ksDirek|ksFici|ksTNT)/, 'yari'], [/^(dalga|ksSutun|ksMorSutun)/, 'parlak'], [/^(ksTas|ksKemer)/, 'mat'], [/^(oyA|ksYildiz)$/, 'metal']];
  for (const [k, L] of Object.entries(LISTE)) { if (L[3] && L[3].kav) continue; const g = GR.find(([r]) => r.test(k)); if (g) L[3] = Object.assign({}, L[3] || {}, { mc: g[1] }, /^ksFici/.test(k) ? { mcMap: 1 } : {}); }   // fici rengi dokuda
}
// v10.40 (Adem 21 Kas): OYUNCAK PLASTIGI. Bloklar Blender'da yeniden islendi (uretici/blender/oyuncak_plastik.py -> model/oyuncak/): bevel 0.045 x 4,
// weighted normal, ortam golgesi dokuya gomulu (%35). Malzeme Adem'in degerleriyle: renkli 0.18 puruz + 0.85 cila, tas 0.35 + 0.25 cila,
// kavanoz %70 saydam 0.08 puruz, altin 0.85 metal. Yalniz ?oyuncak=1 ile (onaydan sonra varsayilan yapilir).
const OYUNCAK = /[?&]oyuncak=1/.test(location.search);
const PARLAK2 = !/[?&]parlak2=0/.test(location.search);   // v10.41: parlak oyuncak plastigi malzemesi (varsayilan); eski: ?parlak2=0
const oyTur = (f) => /(^|\/)(kav|kavanoz|sise|pl_kavanoz)/.test(f) ? 'kavanoz' : /(^|\/)(tas|kemer)/.test(f) ? 'tas' : /(^|\/)(yildiz|pl_elmas)/.test(f) ? 'metal' : 'renkli';
if (SEKER) Object.assign(LISTE, SEKERL);   // v11: boyali set (seker.js), eski ?yeni=0
const yol = (f) => OYUNCAK ? 'model/oyuncak/' + (f.includes('/') ? f : 'blok/' + f) + '.glb?v=1' : 'model/' + (f.includes('/') ? f : 'blok/' + f) + '.glb?v=' + (f.startsWith('blok2/') ? 17 : f.startsWith('blok3/') ? 2 : 1);

export function blok3bKur({ THREE, ENV, SENV, JENV, KENV, GLTFLoader }) {
  const IOR = +(new URLSearchParams(location.search).get('ior') || 1.6);   // v9.7: yuksek kirilma = guclu yuzey yansimasi (islak, seker gibi)
  const BG = +(new URLSearchParams(location.search).get('bantG') || (/[?&]yayvan=0/.test(location.search) ? 3 : 4)), BR = +(new URLSearchParams(location.search).get('bantR') || (/[?&]yayvan=0/.test(location.search) ? 0.16 : 0.26));
  const PG = +(new URLSearchParams(location.search).get('parlaG') || 1.2);   // v9.7: studyo yansima gucu
  const GLB = {}, HAZ = {};
  // v10.31b (Adem: 'referansa yaklasamamis'): kavanozlar referanstaki gibi BOYALI ISIKLA (matcap) cizilir. Gercekci isik koyu kenar ve dar
  // parlama veriyordu; referans mobil oyunlarin yontemi: yuzeyin kameraya gore yonune bakip onceden cizilmis bir kureden renk okunur.
  // MC: carpim (govde rengi korunur, sol yari acik, sag ve alt hafif koyu), MH: ustune beyaz (sol-orta genis yumusak bant + ince sert cekirdek,
  // sag kenarda ince isik, ust yuzde hafif parlaklik). Golge almaz (referanstaki gibi temiz). Ayar: ?mcH= parlama gucu, ?mcB= bant yeri. Eski: ?matcap=0
  const Qs = new URLSearchParams(location.search), MCAP = !/[?&]matcap=0/.test(location.search);
  const mcH = +(Qs.get('mcH') || 0.85), mcB = +(Qs.get('mcB') || -0.4), mcK = +(Qs.get('mcK') || (/[?&]mc=kod/.test(location.search) ? 1.05 : 1.45)), mcW = +(Qs.get('mcW') || 1);
  function mcTex(f) { const N = 256, c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d'), im = x.createImageData(N, N);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const nx = (i + 0.5) / N * 2 - 1, ny = 1 - (j + 0.5) / N * 2, v = f(nx, ny), k = (j * N + i) * 4;
      const r = Math.max(0, Math.min(1, v[0])), g = Math.max(0, Math.min(1, v.length > 1 ? v[1] : v[0])), b = Math.max(0, Math.min(1, v.length > 2 ? v[2] : v[0]));
      im.data[k] = r * 255; im.data[k + 1] = g * 255; im.data[k + 2] = b * 255; im.data[k + 3] = 255; }
    x.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
  const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  let MC = null, MH = null;
  // v10.32: matcap Blender stüdyosundan (uretici/blender/matcap.py -> doku/matcap/<ad>_d.png golgelendirme, _s.png parlama). Kodla cizilen eski hal: ?mc=kod
  const MCB = !/[?&]mc=kod/.test(location.search), MCVAR = 'parlakC', MCT = {}, mcS = +(Qs.get('mcS') || (MCB ? 1.3 : 1));
  function mcYukle(ad) { if (MCT[ad]) return MCT[ad]; const L = new THREE.TextureLoader(), d = L.load('doku/matcap/' + ad + '_d.png?v=1'), s2 = L.load('doku/matcap/' + ad + '_s.png?v=1');
    d.colorSpace = THREE.SRGBColorSpace; s2.colorSpace = THREE.NoColorSpace; return (MCT[ad] = [d, s2]); }
  function mcHazirla() {
    if (MC) return;
    if (MCB) { [MC, MH] = mcYukle(Qs.get('mcAd') || MCVAR); return; }

    MC = mcTex((nx, ny) => { const v = 1.02 - 0.2 * sm(0.1, 1, nx) - 0.28 * sm(0.0, -1, ny) - 0.1 * sm(-0.8, -1, nx) + 0.04 * sm(0.5, 1, ny); return [v, v, v * 1.02]; });
    MH = mcTex((nx, ny) => { const yb = 1 - sm(0.55, 0.95, Math.abs(ny)) * 0.6;
      const bant = mcH * (0.6 * Math.exp(-(((nx - mcB) / (0.22 * mcW)) ** 2)) + 0.45 * Math.exp(-(((nx - mcB) / (0.07 * mcW)) ** 2))) * yb, cek = 0;   // yumusak genis parlama + ortada keskin cekirdek (ayni merkez)
      const kenar = 0.28 * sm(0.74, 0.84, nx) * (1 - sm(0.9, 0.97, nx)) * yb, ust = 0.16 * sm(0.55, 0.9, ny);
      const v = bant + cek + kenar + ust; return [v, v, v]; });
    MH.colorSpace = THREE.NoColorSpace;
  }
  // v10.34 (Adem: 'referans kalitesi: parlak, temiz renk, yumusak genis parlama bandi, kenar isigi'): matcap butun bloklarda.
  // c = { ad: doku/matcap/<ad>, K: govde parlakligi, S: parlama gucu, T: parlamanin beyaza gitme payi (0: govde renginin acik tonu, 1: saf beyaz) }.
  // Referansta genis bant BEYAZ degil, rengin acik tonu: T kucuk tutulur (renk solmaz). T verilmezse eski karisim (saf beyaz). Eski: ?mc2=0
  const MC2 = /[?&]mc2=1/.test(location.search);   // v10.35g (Adem onayi): v10.33 isigi ve golgesi varsayilan (bloklar daha derin), yalniz canli yesil kalir; butun bloklarda matcap: ?mc2=1
  const qn = (k, v) => (Qs.get(k) != null ? +Qs.get(k) : v);
  function mcMat(ozel, c) {
    let mc = MC, mh = MH, K = mcK, S = mcS, T = -1;
    if (c) { [mc, mh] = mcYukle(c.ad); K = c.K; S = c.S; T = c.T == null ? -1 : c.T; if (ozel.mcMap) c = Object.assign({}, c, { map: 1 }); } else mcHazirla(), mc = MC, mh = MH;
    const m = new THREE.MeshMatcapMaterial({ matcap: mc, map: /[?&]mcMap=1/.test(location.search) || (c && c.map) ? ozel.map : null, vertexColors: ozel.vertexColors });   // pisirilmis golge dokusu silindirde seritler yapiyordu: kapali
    const karis = T < 0 ? 'outgoingLight = mix(outgoingLight, vec3(1.0), clamp(texture2D(mcHl, uv).r * ' + S.toFixed(3) + ', 0.0, 1.0));'
      : 'float mcA = clamp(texture2D(mcHl, uv).r * ' + S.toFixed(3) + ', 0.0, 1.0); outgoingLight = mix(outgoingLight, mix(min(outgoingLight * 1.6 + 0.08, vec3(1.0)), vec3(1.0), ' + T.toFixed(3) + '), mcA);';
    m.onBeforeCompile = (sh) => { sh.uniforms.mcHl = { value: mh };
      sh.fragmentShader = 'uniform sampler2D mcHl;\n' + sh.fragmentShader.replace('vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;',
        'vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb * ' + K.toFixed(3) + '; ' + karis); };
    const ck = 'mcHl' + (c ? c.ad + (c.map ? 'm' : '') : '') + K + '_' + S + '_' + T; m.customProgramCacheKey = () => ck; m.userData.yeni = 1; return m;
  }
  // v10.35c (Adem: 'soluk duruyor'): olculen doygunluk kupte 0.71 -> 0.84, kavanozda 0.57 -> 0.79 (rakip 0.78): parlama beyaza gitmez (T kucuk).
  // malzeme gruplari (Adem'in istedigi): kavanoz parlak, kup ve tahta yari, silindir parlak, tas mat, altin ve engel metal. Her biri adresten ayarlanir:
  // ?kvAd= ?kvK= ?kvS= ?kvT=  (kavanoz), ?yaAd= ?yaK= ... (yari), ?paAd= (silindir), ?maAd= (tas), ?meAd= (metal)
  const grup = (on, ad, K, S, T) => ({ ad: Qs.get(on + 'Ad') || ad, K: qn(on + 'K', K), S: qn(on + 'S', S), T: qn(on + 'T', T) });
  const MCG = {
    kav: grup('kv', 'parlakE', 1.25, 0.9, 0.3),
    yari: grup('ya', 'yariK', 1.2, 0.85, 0.45),
    parlak: grup('pa', 'parlakE', 1.2, 0.75, 0.35),
    mat: grup('ma', 'matK', 1.0, 0.3, 0.25),
    metal: grup('me', 'metalK', 1.5, 0.9, 0.5)
  };
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
    if (o.sk) { const g = sekerBoya(THREE, G.geo, o); return (HAZ[k] = { geo: g, mat: sekerMat(THREE, g, o), golgeKutu: 1, parca: new THREE.MeshStandardMaterial({ color: L[2], roughness: 0.5 }) }); }   // v11
    let geo = G.geo;
    if (o.govde) {
      geo = G.geo.clone(); const c = geo.attributes.color, kr = new THREE.Color(o.govde);
      const cq = new URLSearchParams(location.search), ka = cq.get('cerA') ? kr.clone().lerp(new THREE.Color(1, 1, 1), +cq.get('cerA')) : kr.clone().offsetHSL(0, +(cq.get('cerS') || 0.08), +(cq.get('cerL') || 0));   // v10.35c: aciklik 0 (Adem: 'soluk duruyor')   // v10.35b: acik ton rengi soldurmadan (HSL: ayni doygunluk, biraz acik). Eski: ?cerA=0.2
      if (c) for (let i = 0; i < c.count; i++) { const x = c.getX(i), y = c.getY(i), z = c.getZ(i);
        if (x > 0.97 && y > 0.97 && z > 0.97) c.setXYZ(i, kr.r, kr.g, kr.b);
        else if (x > 0.97 && y < 0.03 && z > 0.97) c.setXYZ(i, ka.r, ka.g, ka.b); }   // mor isaret (1,0,1) = turun acik tonu
    }
    const ozel = Object.assign({ map: G.map, vertexColors: !!geo.attributes.color, roughness: L[1], metalness: o.metal || 0, envMap: ENV, envMapIntensity: o.env || 0.4 },
      o.emis ? { emissive: o.emis, emissiveIntensity: o.emisG || 0.2 } : {});
    if (o.kav && KENV) { ozel.envMap = KENV; ozel.envMapIntensity = o.kenv || 2.2; ozel.roughness = o.krough || 0.2; }   // v10.31: kavanoz studyosu
    else if (o.bant && JENV) { ozel.envMap = JENV; ozel.envMapIntensity = BG; ozel.roughness = BR; }   // v9.8: genis parlama bandi (karanlik studyo)
    else if (o.cila && SENV && SENV !== ENV) { ozel.envMap = SENV; ozel.envMapIntensity = (o.env || 0.4) * PG; }   // v9.7: studyo yansimasi
    // v10.41 (Adem 21 Kas: 'parlak oyuncak plastigi, Royal Smash kalitesi'): renkli bloklar ve kavanoz/silindirler MeshPhysicalMaterial,
    // puruz 0.14, metal 0.04, tam cila (1.0 / 0.08), studyo yansimasi 1.05 (v10.42). Kavanoz/silindir ayrica %18 saydam, puruz 0.10 (ior 1.5, kalinlik 0.6).
    // Tas ve altin eski ayarinda kalir. Eski hal: ?parlak2=0
    if (PARLAK2) {
      const t = oyTur(L[0]), sil = /silindir/.test(L[0]);
      if (t === 'renkli' || t === 'kavanoz') {
        const oz = Object.assign({}, ozel, { envMap: SENV || ENV, roughness: 0.14, metalness: 0.04, clearcoat: 1.0, clearcoatRoughness: 0.08, envMapIntensity: 1.05 });   // v10.42: 1.8 renkleri solduruyordu
        if (t === 'kavanoz' || sil) Object.assign(oz, { roughness: 0.10, transmission: 0.18, ior: 1.5, thickness: 0.6, emissiveIntensity: Math.min(ozel.emissiveIntensity || 0, 0.1) });
        const mat = new THREE.MeshPhysicalMaterial(oz); mat.userData.yeni = 1;
        return (HAZ[k] = { geo, mat, golgeKutu: 1, parca: new THREE.MeshStandardMaterial({ color: L[2], roughness: 0.4 }) });
      }
    }
    if (OYUNCAK) {   // v10.40: oyuncak plastigi malzemesi (matcap ve bant yerine)
      const t = oyTur(L[0]), oz = Object.assign({}, ozel, { envMap: SENV || ENV, envMapIntensity: (o.env || 0.5) * PG });
      if (t === 'renkli') Object.assign(oz, { roughness: 0.18, ior: 1.48, clearcoat: 0.85, clearcoatRoughness: 0.12, metalness: o.metal || 0 });
      else if (t === 'tas') Object.assign(oz, { roughness: 0.35, clearcoat: 0.25, clearcoatRoughness: 0.2, metalness: 0 });
      else if (t === 'kavanoz') Object.assign(oz, { roughness: 0.08, ior: 1.5, transmission: 0.7, thickness: 0.6, metalness: 0, emissiveIntensity: Math.min(ozel.emissiveIntensity || 0, 0.1) });
      else Object.assign(oz, { roughness: 0.2, metalness: 0.85 });
      if (o.govde && /^(oyA)$/.test(k)) Object.assign(oz, { roughness: 0.2, metalness: 0.85, clearcoat: 0 });   // altin kup
      const mat = new THREE.MeshPhysicalMaterial(oz); mat.userData.yeni = 1;
      return (HAZ[k] = { geo, mat, golgeKutu: 1, parca: new THREE.MeshStandardMaterial({ color: L[2], roughness: 0.4 }) });
    }
    const mg = MCAP && MC2 && !/[?&]mc=kod/.test(location.search) && !Qs.get('mcAd') ? MCG[o.mc || (o.kav ? 'kav' : '')] : null;   // v10.34
    const mat = mg ? mcMat(Object.assign({ mcMap: o.mcMap }, ozel), mg) : o.kav && MCAP ? mcMat(ozel) : o.cila ? new THREE.MeshPhysicalMaterial(Object.assign(ozel, { clearcoat: 1, clearcoatRoughness: SENV && SENV !== ENV ? 0.035 : 0.08 }, SENV && SENV !== ENV ? { ior: IOR } : {})) : new THREE.MeshStandardMaterial(ozel);   // v9.6: cilali (clearcoat) yeni set
    if (o.cila) mat.userData.yeni = 1;   // v10.2: oyun.js cilaMat ikinci kez cilalamasin
    return (HAZ[k] = { geo, mat, golgeKutu: 1, parca: new THREE.MeshStandardMaterial({ color: L[2], roughness: 0.6 }) });
  }
  // v10.34: engeller icin renkli matcap (oyun.js ENGM altin, demir). Kapali (?mc2=0 ya da ?matcap=0) ise null.
  const mcRenk = (g, renk) => { if (!MCAP || !MC2 || !MCG[g]) return null; const m = mcMat({ vertexColors: false }, MCG[g]); m.color.set(renk); return m; };
  return { yukle, yap, TUR: LISTE, mcRenk };
}
