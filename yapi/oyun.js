// Blok Smash v3.1 (10 Kas 2026): kodla cizilen 3B sekiller (sekil.js) ve uc yeni yapi: Oyuncak Duvar, Buz Tapinagi, Seker Rafi. v3.0 (10 Kas 2026): (Adem: Royal Smash videosundaki kalite) acilis ekrani, 3B tilkili ana sayfa, magaza, hazine haritasi, bolum karti, havai fisekli kazanma sahnesi, 'Devam Et?' karti, gunluk odul, hazine sandigi, profil istatistikleri, duraklatma - hepsi yapi/merkez.js + merkez.css. v2.0 (10 Kas 2026): gercek 3B kamera (yandan/yukaridan + bolum basi donus), bolum haritasi, gunluk gorevler, ayarlar, muzik, yildiz kaydi, golge hafifletme, denge ve hata duzeltmeleri. v1.7: (Adem 9 Kas 2026) cayir ve karli koy fonlari da video oldu (Adem'in Gemini videolari); sahil videosu 10. saniyede dalga atlamasin diye dikissiz donguye cevrildi (bas ve sona en iyi uyan kareler arandi, son 1 sn baslangicla harmanlandi: sahil 7,6 sn, cayir 7 sn, kar 6,5 sn; mp4 + webm). Video fonlarda canli.js cizimleri (koyun, kus, nehir, on kar) kapali, cunku videonun kendisinde var. Blok Smash v1.6: (Adem 9 Kas 2026) tum modeller sikistirildi (yapi/model, model/parcali ve live_pofi.glb: dokular WebP en fazla 1024px, geometri meshopt, dedup ve prune; toplam 78 MB -> 34 MB); GLTFLoader yerel meshopt_decoder.module.js ile cozer; oyun mantigi degismedi. v6.18: (Adem) sahilde platformun alti 3B kum (bloklar suya batar gibi gorunmuyor), kum ve karda saplanan blok asagi inmez; koyunlar daha uzakta; nehir akiyor; karli koyde kar yagiyor. v6.17: (Adem 5 Kas 2026) kuma dusen kuma gomulur, kara dusen kara saplanir, suya dusen batar (tahta/buz/fici yuzer); sahil bolumlerinde platformun arkasi gercek dalgali deniz; fondaki koyun ve kuslar canli (canli.js). v6.16: (Adem 5 Kas 2026) bloklar Blender ile parcalanmis gercek parcalarina ayrilir (model/parcali), 5 yeni model (buz kup 2, ahsap kup 2, buz/mor dikey ve alev tas sutun) ve 4 yeni kule (bolum 28-31). v6.6: top gorunusu fizige baglandi (v6.3 hatasi), Adem in top mermisi ve platform 2/3 modelleri, denize batis, yumusak kazanma zili, alcak kamera, zor devrilme. v6.5: dusen blok kara/kuma/cimene gomulur (sekmez), yumusak sesler, buyuk 3B top, simetrik kuleler, bazi bolumlerde 360 derece donen platform. v6.4: cam sekiller ve boyali dokular yok, tum bloklar Tripo modeli orijinal renginde; top parlamasi yok; yuksek genis kuleler. v6.3: kayitli (sentezlenip mp3'e basilmis) sesler, yeni yazilar ve bolum bandi, atis dengesi. v6.2: 7 yeni model, platform kameraya duz bakar, top arabasi yerlesimi/olcusu yeniden, top ve kirilma gorunumu, atis/yikilma dengesi. v6.1: cam sekiller, her sey kirilir, boyama yok (Adem'in model renkleri), duz/esit atis, temiz platform ayagi, fon degisimi. v6.0: Royal Smash kalitesi icin atis/kirilma/ses/efekt yenilendi, kamera hafif yandan. v5.5: Pofi yok; onden bakis, altta yakindan buyuk top arabasi, metal kupler boyali. v5.4: cayir fonu + Adem'in Tripo modelleri (cizgili platform, top arabasi, top, ahsap/kirmizi/metal kupler). Direk ustundeki platformda iri metal kuplerden bir yapi; altta Pofi durur.
// Oyuncu yapida bir yere dokunur, Pofi hortumuyla oraya top atar. Kupler gercek fizikle (cannon-es) devrilir, platformdan
// dusen her kup sayilir. Hepsi dusunce bolum biter; toplar biterse kaybedilir.
import * as THREE from '../three.module.min.js';
import * as CANNON from '../cannon.min.js';
import { GLTFLoader } from '../GLTFLoader.js?v=2';   // v1.6: meshopt cozuculu surum (eski onbellek kalmasin)
import { canliFon, canliKare } from './canli.js?v=4';   // v6.17: fondaki canli koyun ve kuslar
import { clone as skClone } from '../SkeletonUtils.js';
import { mergeGeometries } from '../BufferGeometryUtils.js';
import { Tilki, tilkiYukle } from '../karakter/karakter.js?v=1';   // v2.1: Korsan Tilki (kazanilan karakter)
import { KARAKTERLER, acikMi, seciliKarakter } from '../karakter/profil.js?v=1';
import { sekilKur, YAPI } from './sekil.js?v=3';   // v3.1: kodla cizilen 3B sekiller ve uc yeni yapi
import { merkezKur } from './merkez.js?v=11';
import { BOLUMLER, uret2, AILE, aileOf } from './bolum.js?v=2';   // v3.16: bolum dizilisi bastan, yeni sekil kartlari   // v3.0: ana sayfa, kartlar, kazanma/kaybetme sahneleri

const $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search), TEST = Q.has('test'), TEST_TILKISIZ = Q.get('tilki') === '0';
// v6.19: (Adem) Korsan modu pilotu: beta/korsan/index.html ayni motoru window.KORSAN ile acar; korsan.js sahneyi, hedefleri ve kartlari kurar.
// KORSAN yoksa (Yapi modu) K null'dur ve asagidaki 'if (K)' satirlarinin hicbiri calismaz.
const K = window.KORSAN ? await import('../korsan/korsan.js?v=9') : null;
const SKEY = K ? 'blokpop_korsan_v1' : 'blokpop_yapi_v3';
let SV = { L: 1, max: 1 };
try { const d = JSON.parse(localStorage.getItem(SKEY) || 'null'); if (d) SV = Object.assign(SV, d); } catch (e) {}
const save = () => { try { localStorage.setItem(SKEY, JSON.stringify(SV)); } catch (e) {} };
// v3.0: M = merkez (yapi/merkez.js). Korsan modunda ve testte yoktur; o zaman eski kartlar calisir.
let M = null;
const SURUM = 'v3.15', ZOR_ODUL = 20;
const zorMu = (L) => L >= 5 && L % 5 === 0;   // her 5. bolum 'zor bolum': mor dugme, +20 altin
const ist = () => SV.ist || (SV.ist = { ilk: 0, seri: 0, enSeri: 0, kazan: 0, blok: 0 });   // profil istatistikleri

// ---------------- olculer ----------------
const S = 1.55;          // kup kenari (iri)
const R0 = 6.1;          // platform modelinin yaricapi
let R = R0, RZ = R0, RZB = R0, TOPY = 6;   // v3.19: RZB: platformlarin arkaya uzanimi (cok platformda arkadakiler)   // R: platformun yarim genisligi (x), RZ: yarim derinligi (z)              // bu bolumdeki yaricap: yapinin hemen disi, itilen kup kenardan dussun
let GY = -4.0;           // v6.19: korsan modunda deniz seviyesi hedefe gore degisir (sal alcak, kule yuksek)         // zemin: platform kisa bir direk ustunde durur, dusen kupler direk dibindeki zeminde yuvarlanir
const PT = 1.1;          // platform tablasinin kalinligi (ust yuzey y=0)
const POFI = new THREE.Vector3(1.35, GY, 9.6);   // v5.4: Pofi top arabasinin yaninda; ikisi birlikte ortada   // v5.3: Pofi ortada (Adem: kenarda durmasin)
//     // Pofi kaidesiz, cimende durur; direkli platforma yukari atar   // Pofi'nin ayak yeri (z bolume gore platformun onune konur)
const GONE_Y = -0.45;    // bunun altina inen kup platformdan dusmus sayilir

// ---------------- cizim ----------------
const glc = $('gl');
const ren = new THREE.WebGLRenderer({ canvas: glc, antialias: true, alpha: true, preserveDrawingBuffer: TEST }); ren.setClearColor(0, 0);
ren.setPixelRatio(Math.min(Math.min(innerWidth, innerHeight) < 600 ? 1.25 : 2, devicePixelRatio || 1));   // v3.18: (Adem: telefon cok isiniyor) 1.5 -> 1.25   // v6.29: (Adem: telefon cok isiniyor) telefonda en cok 1.5 (2 yerine %44 daha az piksel)
ren.outputColorSpace = THREE.SRGBColorSpace; ren.toneMapping = THREE.ACESFilmicToneMapping; ren.toneMappingExposure = 1.32;   // v6.1: daha parlak
ren.shadowMap.enabled = true; ren.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(40, 1, 0.5, 200);
scene.add(new THREE.HemisphereLight(0xfffaf0, 0x7a8a6a, 1.6));
const sun = new THREE.DirectionalLight(0xfff0d0, 2.6); sun.position.set(-8, 18, 10); sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 16, bottom: -14, near: 2, far: 60 }); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03;
scene.add(sun);
const rim = new THREE.DirectionalLight(0xcfe0ff, 0.9); rim.position.set(9, 6, -8); scene.add(rim);

function canvasTex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; }
// platform temalari: Gemini ile uretilen yan seridi ve ust daire (doku/plat/*), kenar halkasinin rengi
const PTEMA = {
  ahsap: { halka: '#ffc43d' }, buz: { halka: '#9ff0ff', isik: 0.5 }, mercan: { halka: '#ffd6e6' },
  seker: { halka: '#ffd36b' }, neon: { halka: '#c890ff', isik: 0.9 }, tas: { halka: '#d8dcc8' }
};
const PMAT = {}, PTL = new THREE.TextureLoader();
function platMats(t) {
  if (PMAT[t]) return PMAT[t];
  const ld = (n, rep) => { const x = PTL.load('doku/plat/' + t + '_' + n + '.webp?v=1'); x.colorSpace = THREE.SRGBColorSpace; x.anisotropy = 4; if (rep) { x.wrapS = THREE.RepeatWrapping; x.repeat.set(rep, 1); } return x; };
  const T = PTEMA[t], side = new THREE.MeshStandardMaterial({ map: ld('yan', 6), roughness: 0.5 }), top = new THREE.MeshStandardMaterial({ map: ld('ust'), roughness: 0.6 });
  const halka = new THREE.MeshStandardMaterial({ color: T.halka, roughness: 0.3, metalness: 0.45, emissive: T.halka, emissiveIntensity: T.isik || 0.15 });
  const alt = side.clone(); alt.color = new THREE.Color('#9a9a9a');
  return (PMAT[t] = { side, top, halka, alt });
}

// platform: zemine oturan alcak kalin tabla + biraz dar bir taban (yuksek direk yok); Pofi de alcak bir kaidede
const stage = new THREE.Group(), pedG = new THREE.Group(); scene.add(stage, pedG);
const PL = {};
{
  const g1 = new THREE.CylinderGeometry(R0, R0, 1.1, 72), g2 = new THREE.CylinderGeometry(1.05, 1.3, -GY - PT, 40);
  PL.top = new THREE.Mesh(g1); PL.top.position.y = -0.55; PL.top.receiveShadow = PL.top.castShadow = true; stage.add(PL.top);
  // kisa direk ve zemine oturan ayak: platform buyuyunce direk kalinlasmasin diye stage disinda
  PL.base = new THREE.Mesh(g2); PL.base.position.y = (GY - PT) / 2; PL.base.receiveShadow = PL.base.castShadow = true; scene.add(PL.base);
  PL.foot = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.15, 0.35, 48)); PL.foot.position.y = GY + 0.175; PL.foot.receiveShadow = true; scene.add(PL.foot);
  PL.ring = new THREE.Mesh(new THREE.TorusGeometry(R0, 0.13, 12, 96)); PL.ring.rotation.x = Math.PI / 2; stage.add(PL.ring);
  PL.ring2 = PL.ring.clone(); PL.ring2.position.y = -1.1; stage.add(PL.ring2);
  const ph = POFI.y - GY;
  PL.ped = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.6, ph, 48)); PL.ped.position.y = -ph / 2; PL.ped.receiveShadow = true; pedG.add(PL.ped);
  PL.pr = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.09, 10, 48)); PL.pr.rotation.x = Math.PI / 2; pedG.add(PL.pr);
  // zemin golgesi: yumusak koyu leke, platform ve kaide arka plan resmindeki yere oturmus gibi gorunur
  const blob = canvasTex(128, 128, (x, w, h) => { const gg = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gg.addColorStop(0, 'rgba(20,10,30,.55)'); gg.addColorStop(0.7, 'rgba(20,10,30,.35)'); gg.addColorStop(1, 'rgba(20,10,30,0)'); x.fillStyle = gg; x.fillRect(0, 0, w, h); });
  const bm = new THREE.MeshBasicMaterial({ map: blob, transparent: true, depthWrite: false });
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(R0 * 2.7, R0 * 2.7), bm); sh.rotation.x = -Math.PI / 2; sh.position.y = GY + 0.02; stage.add(sh); PL.sh = sh;
  const sh2 = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.4), bm); sh2.rotation.x = -Math.PI / 2; sh2.position.y = GY - POFI.y + 0.02; pedG.add(sh2);
}
// harabe temasi (Adem'in col harabesi resmi): kare tas tabla, ustunde oyuk izgara; kare tas direk ve ayak.
// dokular resmin kendisinden kesildi (doku/plat/harabe_*). Tabla stage icinde (bolume gore buyur), direk disarida.
const HQ = {};
{
  const ld = (n, rx, ry) => { const x = PTL.load('doku/plat/harabe_' + n + '.webp?v=3'); x.colorSpace = THREE.SRGBColorSpace; x.anisotropy = 8; if (rx) { x.wrapS = x.wrapT = THREE.RepeatWrapping; x.repeat.set(rx, ry || 1); } return x; };
  // resimdeki gibi acik renkli boyali tas: dokunun kendisi biraz isik da verir, golgede kahverengiye bogulmaz
  const mk = (tx, c, e, r) => new THREE.MeshStandardMaterial({ map: tx, color: c, emissive: '#ffffff', emissiveMap: tx, emissiveIntensity: e, roughness: r });
  const top = mk(ld('ust'), '#ffffff', 0.12, 0.82);
  const yan = mk(ld('yan'), '#ffe6d2', 0.45, 0.85);
  const dir = mk(ld('direk', 1, 1), '#fff2e6', 0.35, 0.9);
  const alt = new THREE.MeshStandardMaterial({ color: '#8a6a5a', roughness: 0.95 });
  HQ.slab = new THREE.Mesh(new THREE.BoxGeometry(2 * R0, PT, 2 * R0), [yan, yan, top, alt, yan, yan]); HQ.slab.position.y = -PT / 2;
  HQ.slab.castShadow = HQ.slab.receiveShadow = true; stage.add(HQ.slab);
  const ph = -GY - PT;
  HQ.col = new THREE.Mesh(new THREE.BoxGeometry(2.7, ph, 2.7), [dir, dir, alt, alt, dir, dir]); HQ.col.position.y = -PT - ph / 2;
  HQ.col.castShadow = HQ.col.receiveShadow = true; scene.add(HQ.col);
  HQ.foot = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.3, 3.5), [yan, yan, alt, alt, yan, yan]); HQ.foot.position.y = GY + 0.15; HQ.foot.receiveShadow = true; scene.add(HQ.foot);
}
const KARE = (t) => t === 'harabe';
// ---------------- Tripo modelleri (model/*.glb) ----------------
// Adem'in Gemini resimlerinden Tripo'da yapilan gercek 3B modeller (kucultulmus: ~6 bin ucgen kup, ~25 bin platform).
// Renkli kup, sandik ve fici modeli kupun yerine gecer; ahsap ve tas temalarinda platform da model olur.
const MOD = {};
// v5.4: Adem'in yeni Tripo modelleri (4 Kas 2026): ahsap kup sandigin, kirmizi patlayici kup ficinin, metal kup celigin yerine;
// cizgili platform, top ve top arabasi. Anahtar -> dosya adi.
const MFILE = { kup: 'kup_metal', metal: 'kup_metal', ahsap: 'kup_ahsap', kirmizi: 'kup_kirmizi', sandik: 'kup_ahsap', fici: 'varil', tugla: 'kup_tas', tas: 'kup_tas', buz: 'buz_silindir', altin: 'kup_altin', ahsapmetal: 'kup_ahsap_metal', piramitTas: 'piramit_tas', kabak: 'bal_kabagi', platform_ahsap: 'platform_ahsap', platform_tas: 'platform_tas', platform_sirk: 'platform_sirk', platform_2: 'platform_2', platform_3: 'platform_3', platform_4: 'platform_4', top: 'top_mermisi', topcu: 'top_arabasi',
  // v6.4: (Adem) benim dokularim/boyam yok: ozel bloklar da Tripo modeli, orijinal renginde
  celik: 'kup_metal', bomba: 'fici', hediye: 'sandik', yildiz: 'kup_altin', jole: 'kup_kirmizi', cam: 'kup',
  // v6.16: (Adem 5 Kas 2026) yeni Tripo modelleri: buz kup 2, ahsap kup 2 ve uc dikey (iki kat boyunda) sutun
  buz2: 'buz_kup_2', ahsap2: 'ahsap_kup_2', buzDikey: 'buz_dikey_kup', alevUzun: 'alev_tas_uzun_kup', morDikey: 'mor_dikey_kup', kola: 'teneke_kola' };
const V1FILE = new Set(['kup', 'sandik', 'fici', 'platform_ahsap', 'platform_tas']);   // ilk Tripo modelleri (?v=1)
const NEWM = new Set(['kola', 'kup', 'metal', 'ahsap', 'kirmizi', 'sandik', 'platform_sirk', 'top', 'topcu', 'fici', 'tugla', 'tas', 'buz', 'altin', 'ahsapmetal', 'piramitTas', 'kabak', 'celik', 'bomba', 'hediye', 'yildiz', 'jole', 'cam', 'buz2', 'ahsap2', 'buzDikey', 'alevUzun', 'morDikey']);
const GLBP = {};   // ayni dosya iki anahtarda (kup, celik) bir kez yuklenir
const modelReady = Promise.all(Object.keys(MFILE).map((n) => new Promise((res) => {
  const url = 'model/' + MFILE[n] + '.glb?v=' + (V1FILE.has(MFILE[n]) ? 1 : 2);
  (GLBP[url] || (GLBP[url] = new Promise((ok) => new GLTFLoader().load(url, ok, undefined, () => ok(null))))).then((gl) => {
    if (!gl) return res();
    let m = null; gl.scene.updateMatrixWorld(true); gl.scene.traverse((o) => { if (o.isMesh && !m) m = o; });
    if (m) { const geo = m.geometry.clone().applyMatrix4(m.matrixWorld); geo.computeBoundingBox(); MOD[n] = { geo, mat: m.material }; if (!m.material.envMap && !/^platform|^topcu$/.test(n)) { m.material.envMap = NENV; m.material.envMapIntensity = 1; } }   // v6.4: renk degismez; sadece Tripo onizlemesindeki gibi notr (beyaz-gri) ortam isigi
    res();
  });
})));
// kup modeli: kenari S olan, merkezi orijinde bir kupe olceklenir
function fitCube(n) {
  const M = MOD[n]; if (!M) return null; if (M.cube) return M.cube;
  const g = M.geo.clone(), b = g.boundingBox, c = b.getCenter(new THREE.Vector3()), z = b.getSize(new THREE.Vector3());
  g.translate(-c.x, -c.y, -c.z); g.scale(S / z.x, S / z.y, S / z.z); g.computeBoundingSphere();
  M.fc = c; M.fsC = new THREE.Vector3(S / z.x, S / z.y, S / z.z);   // v6.16: Blender parcalari ayni olcekle yerlesir
  return (M.cube = g);
}
// v6.2: oranini koruyan modeller: varil ve buz silindir (silindir), tas piramit (koni), bal kabagi (top). Yukseklik S (kabak genislik).
const KEEP = { fici: 'cyl', buz: 'cyl', piramitTas: 'cone', kabak: 'ball', buzDikey: 'tall', alevUzun: 'tall', morDikey: 'tall', kola: 'tall' };   // v6.16: tall = iki kat boyunda dikey sutun (oranı korunur)
function fitKeep(n) {
  const M = MOD[n]; if (!M) return null; if (M.keep) return M.keep;
  const g = M.geo.clone(), b = g.boundingBox, c = b.getCenter(new THREE.Vector3()), z = b.getSize(new THREE.Vector3());
  const k = KEEP[n] === 'ball' ? S * 0.9 / Math.max(z.x, z.z) : KEEP[n] === 'tall' ? 2 * S / z.y : S / z.y;
  g.translate(-c.x, -c.y, -c.z); g.scale(k, k, k); g.computeBoundingBox(); g.computeBoundingSphere();
  const bb = g.boundingBox; M.dim = { r: Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z) / 2, h: bb.max.y - bb.min.y, w: bb.max.x - bb.min.x, d: bb.max.z - bb.min.z };
  M.fc = c; M.fsK = new THREE.Vector3(k, k, k);
  return (M.keep = g);
}
function keepShape(n) {
  const d = MOD[n].dim, t = KEEP[n];
  if (t === 'cyl') return new CANNON.Cylinder(d.r * 0.96, d.r * 0.96, d.h, 14);
  if (t === 'cone') return new CANNON.Cylinder(d.r * 0.12, d.r * 0.92, d.h, 10);
  if (t === 'tall') return new CANNON.Box(new CANNON.Vec3(d.w * 0.47, d.h / 2, d.d * 0.47));
  return new CANNON.Sphere(Math.min(d.r, d.h / 2) * 1.02);
}
// platform modeli: genisligi 2*R0, ortadaki ust yuzey y=0'da, alti zemine (GY) kadar basik
function fitPlat(n, R1, bottom) {
  const M = MOD[n]; if (!M) return null;
  const g = M.geo.clone(), b = g.boundingBox, c = b.getCenter(new THREE.Vector3()), z = b.getSize(new THREE.Vector3()), pa = g.attributes.position;
  let top = b.min.y; const rr = Math.min(z.x, z.z) * 0.18;
  for (let i = 0; i < pa.count; i++) { const x = pa.getX(i) - c.x, w = pa.getZ(i) - c.z; if (x * x + w * w < rr * rr) top = Math.max(top, pa.getY(i)); }
  const sx = 2 * R1 / z.x, sz = 2 * R1 / z.z, sy = -bottom / Math.max(0.01, top - b.min.y);
  g.translate(-c.x, -top, -c.z); g.scale(sx, sy, sz); g.computeVertexNormals(); g.computeBoundingSphere();
  return g;
}
// v5.4: dikdortgen platform: model genislik 2*rx, derinlik 2*rz olacak sekilde gerilir, ust yuzey y=0, ayagi zeminde (GY)
// v6.1: platform modelinin sadece tablasi kullanilir (gerilmis ayagi cirkin duruyordu); ayak kodla: cizgili direk + kaide
function fitPlatRect(n, rx, rz) {
  const M = MOD[n]; if (!M) return null;
  const src = M.geo, b = src.boundingBox, c = b.getCenter(new THREE.Vector3()), z = b.getSize(new THREE.Vector3()), pa = src.attributes.position;
  // tabla: disariya yakin (direk olamayacak) noktalarin en alti tablanin alt yuzu
  let top = b.min.y, bot = b.max.y; const rr = Math.min(z.x, z.z) * 0.18;
  for (let i = 0; i < pa.count; i++) { const x = pa.getX(i) - c.x, w = pa.getZ(i) - c.z, y = pa.getY(i); if (x * x + w * w < rr * rr) top = Math.max(top, y); if (Math.abs(x) > z.x * 0.3) bot = Math.min(bot, y); }
  const cut = bot - (top - bot) * 0.05, idx = src.index ? src.index.array : null, keep = [];
  const n3 = idx ? idx.length : pa.count;
  for (let t = 0; t < n3; t += 3) { const a0 = idx ? idx[t] : t, a1 = idx ? idx[t + 1] : t + 1, a2 = idx ? idx[t + 2] : t + 2; if (pa.getY(a0) >= cut && pa.getY(a1) >= cut && pa.getY(a2) >= cut) keep.push(a0, a1, a2); }
  const g = src.clone(); g.setIndex(keep);
  const sx = 2 * rx / z.x, sz = 2 * rz / z.z, sy = 0.75 / Math.max(0.001, top - bot);   // tabla kalinligi ~0.75
  g.translate(-c.x, -top, -c.z); g.scale(sx, sy, sz);
  // v6.13: (Adem) tabla ustunde piksel/leke vardi: normaller bastan hesaplaninca Tripo modelinde ucgen ucgen leke oluyordu.
  // Modelin kendi normali korunur, sadece esit olmayan olcekleme icin duzeltilir.
  const nr = g.attributes.normal; if (nr) { for (let i = 0; i < nr.count; i++) { const x = nr.getX(i) / sx, y = nr.getY(i) / sy, z2 = nr.getZ(i) / sz, l = Math.hypot(x, y, z2) || 1; nr.setXYZ(i, x / l, y / l, z2 / l); } nr.needsUpdate = true; } else g.computeVertexNormals();
  if (M.mat && M.mat.map) { M.mat.map.anisotropy = ren.capabilities.getMaxAnisotropy(); M.mat.map.needsUpdate = true; }
  g.computeBoundingSphere();
  return g;
}
const LEG = new THREE.Group(); scene.add(LEG);
{
  const st = canvasTex(128, 256, (x, w, h) => { x.fillStyle = '#2f6fe0'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffd23f'; for (let i = -4; i < 12; i++) { x.beginPath(); x.moveTo(0, i * 32); x.lineTo(w, i * 32 - 40); x.lineTo(w, i * 32 - 22); x.lineTo(0, i * 32 + 18); x.fill(); } }, [2, 2]);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.56, 1, 32), new THREE.MeshStandardMaterial({ map: st, roughness: 0.35, metalness: 0.1 })); pole.castShadow = pole.receiveShadow = true;
  const gold = new THREE.MeshStandardMaterial({ color: '#ffc93a', roughness: 0.28, metalness: 0.55 }), blue = new THREE.MeshStandardMaterial({ color: '#3a6fe8', roughness: 0.35 });
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.7, 0.35, 40), gold), base = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.75, 0.55, 48), blue), ring = new THREE.Mesh(new THREE.TorusGeometry(1.48, 0.1, 10, 48), gold), cap = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.25, 0.32, 40), gold);
  ring.rotation.x = Math.PI / 2; base.castShadow = base.receiveShadow = cap.castShadow = collar.castShadow = true;
  LEG.add(pole, collar, base, ring, cap); LEG.userData = { pole, collar, base, ring, cap };
  // v6.29: (Adem) ayak karda ve kumda hafif gomulu: ayagin etrafinda duzensiz kar/kum yigini ve kucuk yumusak temas golgesi
  const LEGRG = new THREE.SphereGeometry(1, 10, 7), mound = new THREE.Group(), mm = new THREE.MeshStandardMaterial({ color: '#eef4ff', roughness: 1, emissive: '#9db4d8', emissiveIntensity: 0.1 });
  for (let i = 0; i < 22; i++) { const a = i / 22 * 6.283 + Math.sin(i * 7.3) * 0.1, rr = 1.8 + 0.08 * Math.sin(i * 3.1), sz = 0.42 + 0.08 * Math.sin(i * 5.7 + 1);
    const bl = new THREE.Mesh(LEGRG, mm); bl.position.set(Math.cos(a) * rr, 0, Math.sin(a) * rr); bl.scale.set(sz * 1.5, sz * (0.32 + 0.1 * Math.sin(i * 2.3)), sz * 1.5); bl.receiveShadow = true; mound.add(bl); }
  const shd = canvasTex(64, 64, (x, w, h) => { const gg = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gg.addColorStop(0, 'rgba(30,20,20,.42)'); gg.addColorStop(0.55, 'rgba(30,20,20,.22)'); gg.addColorStop(1, 'rgba(30,20,20,0)'); x.fillStyle = gg; x.fillRect(0, 0, w, h); });
  const shade = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 5.4), new THREE.MeshBasicMaterial({ map: shd, transparent: true, depthWrite: false })); shade.rotation.x = -Math.PI / 2;
  mound.visible = shade.visible = false; LEG.add(mound, shade); Object.assign(LEG.userData, { mound, shade, mm });
}
function legBoy(L, oy) {   // v3.10: asansor platformda direk ust ucu platformla iner/kalkar, alt ucu yerde kalir
  const [pole, collar] = L.children, y0 = -0.75; if (L.userData.bot == null) L.userData.bot = pole.position.y - pole.scale.y / 2;
  const top = y0 - 0.3 + oy, bot = L.userData.bot; collar.position.y = y0 - 0.17 + oy; pole.scale.set(1, Math.max(0.05, top - bot), 1); pole.position.y = (top + bot) / 2;
}
function setLeg(sink, leg) {   // sink: ayagin yere gomulme derinligi (yalniz yerin alti gizlenen karda/kumda)
  sink = sink || 0; const L = leg || LEG; L.userData.bot = null; const [pole, collar, base, ring, cap, mound, shade] = L.children, y0 = -0.75, top = y0 - 0.3, bot = GY + 0.82 - sink;
  collar.position.y = y0 - 0.17; pole.scale.set(1, top - bot, 1); pole.position.y = (top + bot) / 2;
  base.position.y = GY + 0.275 - sink; ring.position.y = GY + 0.42 - sink; cap.position.y = GY + 0.7 - sink;
  if (mound) { mound.visible = sink > 0; mound.position.y = GY + 0.02; shade.visible = sink > 0; shade.position.y = GY + 0.012; }
}
setLeg();

// v3.2: (Adem 11 Kas) sahilde platform ayagi suya gomulu: ayagin etrafinda sig, dalgalanan turkuaz su birikintisi; ayak suyun icine iner,
// dibinde kopuk halkasi, disa dogru yayilan halkalar ve isik parlamalari. Su kenari kuma yumusakca karisir.
const HAVUZ = (() => {
  const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { t: { value: 0 } },
    vertexShader: 'varying vec2 vU; void main(){ vU = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `varying vec2 vU; uniform float t;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
      void main(){
        float r = length(vU), a = atan(vU.y, vU.x);
        float kenar = 2.55 + 0.22 * sin(a * 3.0 + 1.3) + 0.14 * sin(a * 7.0 + t * 0.6) + 0.1 * n(vU * 1.6 + t * 0.2);
        if (r > kenar) discard;
        float d = kenar - r;
        vec3 derin = vec3(0.04, 0.55, 0.68), sig = vec3(0.35, 0.88, 0.86);
        vec3 col = mix(sig, derin, smoothstep(0.1, 1.6, d));
        float hal = sin(r * 7.0 - t * 2.6) * 0.5 + 0.5; hal = pow(hal, 8.0) * smoothstep(0.6, 1.2, r) * (1.0 - smoothstep(1.8, kenar, r));
        float kost = pow(n(vU * 3.2 + vec2(t * 0.35, -t * 0.27)) * n(vU * 2.1 - vec2(t * 0.22, t * 0.31)), 1.4) * 2.6;
        col += vec3(0.75, 1.0, 1.0) * (hal * 0.35 + kost * 0.28);
        float ic = 1.0 - smoothstep(0.42, 0.78, r + 0.06 * sin(a * 5.0 + t * 3.0));
        float kop = smoothstep(0.0, 0.16, d) * (1.0 - smoothstep(0.16, 0.42, d));
        col = mix(col, vec3(1.0), clamp(ic * 0.85 + kop * 0.8 * (0.6 + 0.4 * n(vec2(a * 3.0, t))), 0.0, 1.0));
        float al = smoothstep(0.0, 0.3, d) * 0.88 + kop * 0.1;
        gl_FragColor = vec4(col, al);
      }` });
  const m = new THREE.Mesh(new THREE.CircleGeometry(2.9, 96), mat); m.rotation.x = -Math.PI / 2; m.renderOrder = 3; m.visible = false;
  m.onBeforeRender = () => { mat.uniforms.t.value = performance.now() / 1000; };
  LEG.add(m); return m;
})();
const SIRK = { mesh: null };
// v5.5: platform direginin dibinde yuvarlak zemin lekesi; v6.1: rengi fona gore (cayirda toprak, karda kar, sahilde kum)
let TOZ = '#d9c3a0';
const DIRT = (() => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ transparent: true, depthWrite: false, roughness: 1 }));
  m.rotation.x = -Math.PI / 2; m.position.y = GY + 0.015; scene.add(m); return m;   // v6.29: golge almaz (platform golgesi fonda koyu leke yapiyordu)
})();
const DIRTT = {};
function setDirt(fo) {
  TOZ = fo.toz;
  DIRT.material.map = DIRTT[fo.f] || (DIRTT[fo.f] = canvasTex(256, 256, (x, w, h) => {
    const [a, b, c] = fo.dirt, gg = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gg.addColorStop(0, 'rgba(' + a + ',1)'); gg.addColorStop(0.72, 'rgba(' + b + ',0.95)'); gg.addColorStop(0.86, 'rgba(' + c + ',0.55)'); gg.addColorStop(1, 'rgba(' + c + ',0)');
    x.fillStyle = gg; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { const an = Math.random() * 6.283, r = Math.random() * w * 0.36; x.fillStyle = Math.random() < 0.5 ? 'rgba(90,60,30,.12)' : 'rgba(255,255,255,.18)'; x.beginPath(); x.ellipse(w / 2 + Math.cos(an) * r, h / 2 + Math.sin(an) * r, 2 + Math.random() * 9, 1 + Math.random() * 4, Math.random() * 3, 0, 6.283); x.fill(); }
  }));
  DIRT.material.needsUpdate = true;
}
function setSirk(rx, rz, pn) {
  if (SIRK.mesh) { scene.remove(SIRK.mesh); SIRK.mesh.geometry.dispose(); SIRK.mesh = null; }
  pn = MOD[pn] ? pn : 'platform_sirk'; const geo = fitPlatRect(pn, rx, rz); if (!geo) return;
  SIRK.mesh = new THREE.Mesh(geo, MOD[pn].mat); SIRK.mesh.castShadow = SIRK.mesh.receiveShadow = true; scene.add(SIRK.mesh);
}
const PLM = {};
function platModel(t) {
  if (PLM[t] !== undefined) return PLM[t];
  const n = 'platform_' + t; if (!MOD[n]) return (PLM[t] = null);
  const big = new THREE.Mesh(fitPlat(n, R0, -PT), MOD[n].mat), ped = new THREE.Mesh(fitPlat(n, 1.55, GY - POFI.y), MOD[n].mat);
  big.receiveShadow = ped.receiveShadow = true; big.castShadow = true; big.visible = ped.visible = false; stage.add(big); pedG.add(ped);
  return (PLM[t] = { big, ped });
}
function setPlat(t) {
  const kare = KARE(t); for (const k in HQ) HQ[k].visible = kare;
  if (SIRK.mesh) SIRK.mesh.visible = t === 'sirk'; LEG.visible = t === 'sirk'; PL.sh.visible = !(t === 'sirk' && !K);   // v6.29: (Adem) platformun altindaki genis koyu leke fonda tuhaf duruyordu
  if (kare || t === 'sirk') { for (const k in PLM) if (PLM[k]) PLM[k].big.visible = PLM[k].ped.visible = false; for (const o of [PL.top, PL.ring, PL.ring2, PL.ped, PL.pr, PL.base, PL.foot]) o.visible = false; return; }
  PL.base.visible = PL.foot.visible = true;
  const m = platMats(t), pm = platModel(t);
  for (const k in PLM) if (PLM[k]) PLM[k].big.visible = PLM[k].ped.visible = k === t;
  for (const o of [PL.top, PL.ring, PL.ring2, PL.ped, PL.pr]) o.visible = !pm;
  PL.top.material = [m.side, m.top, m.alt]; PL.base.material = PL.foot.material = [m.side, m.top, m.alt]; PL.ring.material = PL.ring2.material = PL.pr.material = m.halka;
  PL.ped.material = [m.side, m.top, m.alt];
  if (POFI.y - GY < 0.2) { PL.ped.visible = PL.pr.visible = false; if (pm) pm.ped.visible = false; }
}
setPlat('ahsap');
// renkli kup modeli: gri metal doku kupun rengiyle carpilir, hafif kendi isigi
const KMOD = {};
let KGRAY = null;
function kupGray() {
  if (KGRAY) return KGRAY;
  const src = MOD.kup.mat.map; if (!src || !src.image) return (KGRAY = src);
  const im = src.image, c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
  const x = c.getContext('2d'); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, c.width, c.height), a = d.data;
  let sum = 0; for (let i = 0; i < a.length; i += 4) sum += 0.3 * a[i] + 0.59 * a[i + 1] + 0.11 * a[i + 2];
  const mean = sum / (a.length / 4) || 1;
  for (let i = 0; i < a.length; i += 4) { const L = 0.3 * a[i] + 0.59 * a[i + 1] + 0.11 * a[i + 2], v = Math.max(0, Math.min(255, 215 + (L - mean) * 1.5)); a[i] = a[i + 1] = a[i + 2] = v; }
  x.putImageData(d, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.flipY = src.flipY; t.anisotropy = 4;
  return (KGRAY = t);
}
function kupModelMat(col) {
  if (KMOD[col]) return KMOD[col];
  // v5.5: metal kup modeli (koyu gri doku) bolum rengine boyanir: dokunun acik gri hali detay olarak kalir, rengi bolum verir
  const m = MOD.kup.mat.clone(); m.map = kupGray(); m.color = new THREE.Color(col).multiplyScalar(1.05);
  m.emissive = new THREE.Color(col); m.emissiveIntensity = 0.16; m.metalness = 0.15; m.roughness = 0.42;
  return (KMOD[col] = m);
}

// ---------------- kup gorunusu ----------------
// Adem'in metal-disli kup yuzu (kup_yuz.webp); metal kupun rengine boyanir, ortadaki cekirdek parlar
function roundBox(w, h, d, r, seg) {
  const g0 = new THREE.BoxGeometry(w, h, d, seg, seg, seg), p = g0.attributes.position, nr = g0.attributes.normal, v = new THREE.Vector3(), c = new THREE.Vector3();
  const hw = w / 2 - r, hh = h / 2 - r, hd = d / 2 - r, cl = (x, a) => Math.max(-a, Math.min(a, x));
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); c.set(cl(v.x, hw), cl(v.y, hh), cl(v.z, hd)); v.sub(c);
    const L = v.length(); if (L > 1e-6) v.multiplyScalar(1 / L); else v.fromBufferAttribute(nr, i); nr.setXYZ(i, v.x, v.y, v.z);
    p.setXYZ(i, c.x + v.x * r, c.y + v.y * r, c.z + v.z * r);
  }
  return g0;
}
const CUBEGEO = roundBox(S, S, S, S * 0.09, 5);
const CORE = { x: 0.4961, y: 0.5181, r: 0.2079 };
const FACE = new Image(); const KMAT = {};
const GLOWMASK = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); const gr = x.createRadialGradient(CORE.x * w, CORE.y * h, 0, CORE.x * w, CORE.y * h, CORE.r * w * 1.02); gr.addColorStop(0, '#fff'); gr.addColorStop(0.75, '#c8c8c8'); gr.addColorStop(1, '#000'); x.fillStyle = gr; x.fillRect(0, 0, w, h); });
function kupMat(col) {
  if (KMAT[col]) return KMAT[col];
  const ok = FACE.complete && FACE.naturalWidth > 0;
  const t = canvasTex(256, 256, (x, w, h) => {
    if (ok) x.drawImage(FACE, 0, 0, w, h); else { x.fillStyle = '#8a8478'; x.fillRect(0, 0, w, h); }
    // metal once aydinlatilir, sonra rengine boyanir: sari/turuncu camurlasmasin, golge ve vida dokusu kalsin
    x.save(); x.globalCompositeOperation = 'screen'; x.globalAlpha = 0.35; x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.restore();
    x.save(); x.globalCompositeOperation = 'color'; x.globalAlpha = 1; x.fillStyle = col; x.fillRect(0, 0, w, h); x.restore();
    x.save(); x.globalCompositeOperation = 'overlay'; x.globalAlpha = 0.55; x.fillStyle = col; x.fillRect(0, 0, w, h); x.restore();
    x.save(); x.globalCompositeOperation = 'screen'; x.globalAlpha = 0.18; x.fillStyle = col; x.fillRect(0, 0, w, h); x.restore();
    const cx = CORE.x * w, cy = CORE.y * h, Rr = CORE.r * w, c = new THREE.Color(col), hi = '#' + c.clone().lerp(new THREE.Color('#ffffff'), 0.55).getHexString();
    const gr = x.createRadialGradient(cx - Rr * 0.25, cy - Rr * 0.3, Rr * 0.05, cx, cy, Rr * 0.98); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.2, hi); gr.addColorStop(0.75, col); gr.addColorStop(1, '#' + c.clone().multiplyScalar(0.45).getHexString());
    x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, Rr * 0.98, 0, 6.283); x.fill();
    x.lineWidth = w * 0.014; x.strokeStyle = 'rgba(255,255,255,.6)'; x.beginPath(); x.arc(cx, cy, Rr * 0.8, 3.6, 5.2); x.stroke();
  });
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.38, metalness: 0.05, emissive: col, emissiveMap: GLOWMASK, emissiveIntensity: 0.75 });
  KMAT[col] = m; return m;
}
const faceReady = new Promise((res) => { FACE.onload = FACE.onerror = res; FACE.src = 'kup_yuz.webp?v=1'; });

// ---------------- ozel malzemeler ----------------
// Gemini ile uretilen dokular (doku/*.webp). Her malzemenin agirligi, kayganligi, sekmesi ve ozel isi farkli:
// cam belli hizda carpinca kirilir; fici/bomba patlar ve cevresini iter (yakindaki ficiyi de patlatir);
// hediye dusunce +2 top, altin hazine, yildiz bolum sonunda +1 yildiz verir.
const TL = new THREE.TextureLoader(), TX = {};
const texReady = Promise.all(['fici_yan', 'fici_kapak', 'sandik', 'cam', 'buz', 'altin', 'celik', 'tugla', 'jole', 'hediye', 'bomba', 'yildiz', 'recel_etiket'].map((n) => new Promise((res) => {
  TX[n] = TL.load('doku/' + n + '.webp?v=1', res, undefined, res); TX[n].colorSpace = THREE.SRGBColorSpace; TX[n].anisotropy = 4; })));
TX.fici_yan.wrapS = THREE.RepeatWrapping; TX.fici_yan.repeat.set(2, 1);
const KIND = {
  sandik: { mass: 0.6, f: 0.6, r: 0.15 },
  metal: { mass: 1.3, f: 0.62, r: 0.12 }, ahsap: { mass: 0.8, f: 0.62, r: 0.15 }, kirmizi: { mass: 1, f: 0.62, r: 0.15 },
  tas: { mass: 1.1, f: 0.7, r: 0.08 }, ahsapmetal: { mass: 1.1, f: 0.65, r: 0.12 }, piramitTas: { mass: 0.8, f: 0.7, r: 0.08 }, kabak: { mass: 0.7, f: 0.55, r: 0.2 },   // v6.2   // v6.1: Adem'in kup modelleri, orijinal renkleri
  tugla: { mass: 1.4, f: 0.75, r: 0.1 },   // v6.11: (Adem) karli koyde kaya kupler gecilmiyordu
  celik: { mass: 2.6, f: 0.7, r: 0.05 },
  kola: { mass: 0.45, f: 0.5, r: 0.25 },
  buz: { mass: 1, f: 0.12, r: 0.1, kir: 7 },
  jole: { mass: 0.8, f: 0.6, r: 0.95, kir: 9 },
  cam: { mass: 0.9, f: 0.5, r: 0.1, kir: 5 },                  // bu hizla carpinca kirilir
  fici: { mass: 0.8, f: 0.6, r: 0.15, boom: 2.3, guc: 15 },   // v6.3: testte tek patlama 63 blogun 44'unu yikiyordu   // patlama yaricapi (kup cinsinden) ve itis hizi
  bomba: { mass: 1.2, f: 0.6, r: 0.1, boom: 3.2, guc: 22 },
  altin: { mass: 1.6, f: 0.6, r: 0.1 },
  hediye: { mass: 0.7, f: 0.6, r: 0.15 },
  yildiz: { mass: 0.9, f: 0.6, r: 0.15 },
  buz2: { mass: 1, f: 0.12, r: 0.1, kir: 7 }, ahsap2: { mass: 0.8, f: 0.62, r: 0.15 },   // v6.16: Adem'in yeni modelleri
  buzDikey: { mass: 1.3, f: 0.15, r: 0.1, kir: 7 }, alevUzun: { mass: 2, f: 0.7, r: 0.08 }, morDikey: { mass: 1.4, f: 0.62, r: 0.1 },
  recel: { mass: 1.3, f: 0.55, r: 0.08, kir: 7, esya: 1 }   // devrilince kirilmaz, ustune kup duserse ya da yere dusunce kirilir
};
const KM = {};
function kindMat(k) {
  if (KM[k]) return KM[k];
  const t = TX[k === 'fici' ? 'fici_yan' : k]; let m;
  if (k === 'cam') m = new THREE.MeshPhysicalMaterial({ map: t, transparent: true, opacity: 0.6, roughness: 0.05, clearcoat: 1, depthWrite: false });
  else if (k === 'buz') m = new THREE.MeshPhysicalMaterial({ map: t, transparent: true, opacity: 0.9, roughness: 0.1, clearcoat: 1 });
  else if (k === 'jole') m = new THREE.MeshPhysicalMaterial({ map: t, transparent: true, opacity: 0.88, roughness: 0.15, clearcoat: 1, emissive: '#ff5aa0', emissiveIntensity: 0.18 });
  else if (k === 'altin') m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.25, metalness: 0.5 });
  else if (k === 'bomba') m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.4, metalness: 0.3, emissive: '#ff2020', emissiveMap: t, emissiveIntensity: 0.4 });
  else if (k === 'yildiz') m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.3, emissive: '#ffcc33', emissiveMap: t, emissiveIntensity: 0.35 });
  else m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.55, metalness: k === 'celik' ? 0.35 : 0 });
  if (k === 'fici') { const top = new THREE.MeshStandardMaterial({ map: TX.fici_kapak, roughness: 0.6 }); m = [m, top, top]; }
  return (KM[k] = m);
}
const FR = S * 0.46, FICIGEO = new THREE.CylinderGeometry(FR, FR, S, 32);

// ---------------- mutfak esyalari: recel kavanozu ----------------
// Tripo yerine burada torna (Lathe) ile kurulur: cam gercekten seffaf, icindeki recel gorunur, kirilinca parcalara ayrilir.
// Kavanoz fici gibi bir izgara hucresine oturan silindirdir (FICISHAPE): devrilir, yuvarlanir; sert carpinca kirilir,
// cam kiriklari ve bez kapak savrulur, recel topaklari sicrar, dustugu yerde yapiskan leke kalir (ustundeki kupler kaymaz).
const JR = FR * 0.97, JB = -S / 2, JT = S / 2 - 0.15;   // govde yaricapi, taban, cam agzi (ustunde bez kapak)
const JS = JT - 0.2, JN = JR * 0.84, JMID = (JB + JS) / 2;  // omuz yuksekligi, boyun yaricapi, kirilma cizgisi
// cam ve recel icin yumusak bir mutfak yansimasi (pencere isiklari); sadece bu malzemeler kullanir
const ENV = (() => {
  const t = canvasTex(512, 256, (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.45, '#ffeedd'); gr.addColorStop(0.55, '#d9b8a0'); gr.addColorStop(1, '#6a5048');
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
    const blob = (cx, cy, rx, ry, a) => { x.save(); x.translate(cx, cy); x.scale(1, ry / rx); const g2 = x.createRadialGradient(0, 0, 0, 0, 0, rx); g2.addColorStop(0, 'rgba(255,255,255,' + a + ')'); g2.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g2; x.beginPath(); x.arc(0, 0, rx, 0, 6.283); x.fill(); x.restore(); };
    blob(150, 70, 70, 50, 1); blob(380, 80, 50, 40, 0.7); blob(260, 40, 120, 30, 0.5);
  });
  t.mapping = THREE.EquirectangularReflectionMapping;
  const pm = new THREE.PMREMGenerator(ren), e = pm.fromEquirectangular(t).texture; pm.dispose(); return e;
})();
// v6.4: Adem'in modelleri icin renksiz ortam isigi (stüdyo gibi: ustte beyaz, altta gri). Modelin rengini degistirmez, koyulugunu acar.
const NENV = (() => {
  const t = canvasTex(512, 256, (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, '#d8d8d8'); gr.addColorStop(1, '#7a7a7a');
    x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,0.9)'; x.fillRect(w * 0.15, h * 0.12, w * 0.18, h * 0.2); x.fillRect(w * 0.62, h * 0.1, w * 0.2, h * 0.16);
  });
  t.mapping = THREE.EquirectangularReflectionMapping;
  const pm = new THREE.PMREMGenerator(ren), e = pm.fromEquirectangular(t).texture; pm.dispose(); return e;
})();

// v3.1: (Adem 10 Kas 2026) kodla cizilen 3B sekiller (sekil.js): parlak oyuncak kup, tas kiris, mermer tambur, buz, ahsap dikme, kavanoz, raf.
// KIND'e eklenir (sek: 1); olculeri kup kenari cinsinden SEK.TUR'da, govde ve malzemesi ilk kullanimda SEK.al(ad) ile kurulur.
const SEK = sekilKur({ THREE, S, canvasTex, ENV });
for (const k in SEK.TUR) { const t = SEK.TUR[k]; KIND[k] = { mass: t.mass, f: t.f, r: t.r, sek: 1 }; if (t.carp) KIND[k].kir = t.carp; if (t.boom) { KIND[k].boom = t.boom; KIND[k].guc = t.guc; } }
const SEKSH = {};
function sekShape(k) { if (SEKSH[k]) return SEKSH[k]; const s = SEK.al(k); return (SEKSH[k] = s.sil ? new CANNON.Cylinder(s.r, s.r, s.h, 16) : new CANNON.Box(new CANNON.Vec3(s.w / 2, s.h / 2, s.d / 2))); }
// parcanin yarim genisligi, yuksekligi, yarim derinligi (kup kenari cinsinden): platform ve kamera yapiya gore ayarlanir
function olcu(col) { const t = SEK.TUR[col]; return t ? [t.w / 2, t.h, t.d / 2] : [0.5, KEEP[col] === 'tall' ? 2 : 1, 0.5]; }

// ---------------- v6.1 cam sekiller (Adem'in 2. sayfasi): kodla, parlak yari saydam cam + beyaz kenar cizgisi ----------------
// 'yig': ust uste konabilen (tam hucre), 'tepe': sadece sutunun tepesine konur. Her biri kirilir: topla vurulunca, sert carpinca, yere dusunce.
const GS = S * 0.98;
function glassGeo(n) {
  const s = GS, h = s / 2; let g, hh = s;   // hh: sekil yuksekligi
  const box = (w, y, d, r) => roundBox(w, y, d, r || s * 0.07, 3);
  const at = (geo, x, y, z) => { geo.translate(x, y, z); return geo; };
  switch (n) {
    case 'kup': g = box(s, s, s); break;
    case 'silindir': g = new THREE.CylinderGeometry(s * 0.42, s * 0.42, s, 36); break;
    case 'altigen': g = new THREE.CylinderGeometry(s * 0.49, s * 0.49, s, 6); break;
    case 'prizma': g = new THREE.CylinderGeometry(s * 0.56, s * 0.56, s, 3); break;
    case 'kare': g = box(s * 0.62, s, s * 0.62); break;
    case 'yivli': { g = new THREE.CylinderGeometry(s * 0.4, s * 0.4, s, 64, 1); const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z); if (r < 1e-4) continue; const a = Math.atan2(z, x), k = 1 - 0.07 * Math.max(0, Math.cos(a * 12)); p.setX(i, x * k); p.setZ(i, z * k); }
      g.computeVertexNormals(); break; }
    case 'L': g = mergeGeometries([at(box(s * 0.4, s, s * 0.9), -s * 0.3, 0, 0), at(box(s, s * 0.36, s * 0.9), 0, -s * 0.32, 0)]); break;
    case 'kemer': { const sh = new THREE.Shape(), R = s * 0.5, r = s * 0.27; sh.moveTo(-R, 0); sh.absarc(0, 0, R, Math.PI, 0, true); sh.lineTo(r, 0); sh.absarc(0, 0, r, 0, Math.PI, false); sh.lineTo(-R, 0);
      g = new THREE.ExtrudeGeometry(sh, { depth: s * 0.7, bevelEnabled: true, bevelSize: s * 0.03, bevelThickness: s * 0.03, bevelSegments: 2, curveSegments: 24 });
      g.computeBoundingBox(); const b = g.boundingBox; g.translate(-(b.max.x + b.min.x) / 2, -(b.max.y + b.min.y) / 2, -(b.max.z + b.min.z) / 2); g.scale(1, s / (b.max.y - b.min.y), 1); break; }
    case 'buz': g = box(s, s, s, s * 0.12); break;
    // tepe sekilleri
    case 'kure': g = new THREE.SphereGeometry(s * 0.46, 32, 20); hh = s * 0.92; break;
    case 'kapsul': g = new THREE.CapsuleGeometry(s * 0.3, s * 0.38, 8, 24); hh = s * 0.98; break;
    case 'piramit': g = new THREE.ConeGeometry(s * 0.6, s * 0.85, 4); g.rotateY(Math.PI / 4); hh = s * 0.85; break;
    case 'koni': g = new THREE.ConeGeometry(s * 0.46, s * 0.9, 36); hh = s * 0.9; break;
    case 'kubbe': g = new THREE.SphereGeometry(s * 0.48, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2); g.translate(0, -s * 0.24, 0); hh = s * 0.48; break;
    case 'kristal': g = new THREE.LatheGeometry([new THREE.Vector2(0.001, -h), new THREE.Vector2(s * 0.27, -h), new THREE.Vector2(s * 0.22, s * 0.18), new THREE.Vector2(0.001, h)], 6); break;
    case 'kama': { const sh = new THREE.Shape(); sh.moveTo(-h, -s * 0.33); sh.lineTo(h, -s * 0.33); sh.lineTo(-h, s * 0.33); sh.lineTo(-h, -s * 0.33);
      g = new THREE.ExtrudeGeometry(sh, { depth: s * 0.8, bevelEnabled: false }); g.translate(0, 0, -s * 0.4); hh = s * 0.66; break; }
    case 'cubuk': g = box(s, s * 0.42, s * 0.5); hh = s * 0.42; break;
    case 'ince': g = box(s, s * 0.24, s * 0.24); hh = s * 0.24; break;
    case 'mazgal': g = mergeGeometries([box(s, s * 0.4, s * 0.62), at(box(s * 0.26, s * 0.24, s * 0.62), -s * 0.37, s * 0.3, 0), at(box(s * 0.26, s * 0.24, s * 0.62), 0, s * 0.3, 0), at(box(s * 0.26, s * 0.24, s * 0.62), s * 0.37, s * 0.3, 0)]);
      g.translate(0, -s * 0.12, 0); hh = s * 0.64; break;
    case 'Y': g = mergeGeometries([at(box(s * 0.36, s * 0.5, s), 0, 0, 0), at(box(s, s * 0.5, s * 0.36), 0, 0, -s * 0.32)]); hh = s * 0.5; break;
  }
  if (g.index === null) g = g; g.computeBoundingSphere();
  return { g, hh };
}
const GLASS = {   // ad: [renk, tur]   (renkler Adem'in resmindeki gibi)
  kup: ['#cfeaf6', 'yig'], silindir: ['#6fb8ff', 'yig'], altigen: ['#8fc8ff', 'yig'], prizma: ['#2fd8c8', 'yig'], kare: ['#2f63ff', 'yig'],
  yivli: ['#cfe3ea', 'yig'], L: ['#b5e6f4', 'yig'], kemer: ['#a5dcef', 'yig'], buz: ['#a9dcff', 'yig'],
  kure: ['#3fd65a', 'tepe'], kapsul: ['#ff63d0', 'tepe'], piramit: ['#ffbe2e', 'tepe'], koni: ['#ff8424', 'tepe'], kubbe: ['#5fb0ea', 'tepe'],
  kristal: ['#a9c6ff', 'tepe'], kama: ['#e27ff0', 'tepe'], cubuk: ['#9ed6ff', 'tepe'], ince: ['#bfe7ff', 'tepe'], mazgal: ['#b5e6f4', 'tepe'], Y: ['#b864ff', 'tepe']
};
const GYIG = Object.keys(GLASS).filter((k) => GLASS[k][1] === 'yig'), GTEPE = Object.keys(GLASS).filter((k) => GLASS[k][1] === 'tepe');
const GG = {}, GM = {}, EDGEM = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.6 });
function glassMat(n) {
  if (GM[n]) return GM[n];
  const c = new THREE.Color(GLASS[n][0]), solid = n === 'kure' || n === 'kapsul' || n === 'piramit' || n === 'koni' || n === 'kare' || n === 'prizma' || n === 'Y' || n === 'kama';
  return (GM[n] = new THREE.MeshPhysicalMaterial({ color: c, transparent: true, opacity: solid ? 0.8 : 0.58, roughness: 0.06, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04,
    envMap: ENV, envMapIntensity: 1.3, emissive: c, emissiveIntensity: solid ? 0.22 : 0.14, side: THREE.DoubleSide, depthWrite: false }));
}
function glassInfo(n) { return GG[n] || (GG[n] = glassGeo(n)); }
function makeGlass(n) {
  const { g } = glassInfo(n), m = new THREE.Mesh(g, glassMat(n));
  if (!g.userData.edges) g.userData.edges = new THREE.EdgesGeometry(g, 28);
  m.add(new THREE.LineSegments(g.userData.edges, EDGEM)); m.renderOrder = 2; return m;
}
function glassShape(n) {
  const s = GS, { hh } = glassInfo(n);
  if (n === 'silindir' || n === 'yivli') return new CANNON.Cylinder(s * 0.42, s * 0.42, s, 12);
  if (n === 'altigen') return new CANNON.Cylinder(s * 0.48, s * 0.48, s, 6);
  if (n === 'kure') return new CANNON.Sphere(s * 0.46);
  if (n === 'piramit' || n === 'koni' || n === 'kristal') return new CANNON.Cylinder(s * 0.06, s * 0.42, hh, 8);
  if (n === 'kubbe') return new CANNON.Cylinder(s * 0.3, s * 0.48, hh, 10);
  if (n === 'kare') return new CANNON.Box(new CANNON.Vec3(s * 0.31, s / 2, s * 0.31));
  if (n === 'kapsul') return new CANNON.Cylinder(s * 0.3, s * 0.3, hh, 10);
  if (n === 'cubuk') return new CANNON.Box(new CANNON.Vec3(s / 2, hh / 2, s * 0.25));
  if (n === 'ince') return new CANNON.Box(new CANNON.Vec3(s / 2, hh / 2, s * 0.12));
  if (n === 'mazgal') return new CANNON.Box(new CANNON.Vec3(s / 2, hh / 2, s * 0.31));
  return new CANNON.Box(new CANNON.Vec3(s / 2, hh / 2, s / 2));
}
for (const n in GLASS) KIND['g_' + n] = { mass: GLASS[n][1] === 'tepe' ? 0.5 : 0.75, f: 0.5, r: 0.12, kir: 6.5, cam: n };

const V2D = (x, y) => new THREE.Vector2(x, y);
// alttan uste cam profili: yuvarlak dip kosesi, duz govde, omuz, boyun
function jarProfile() {
  const p = [V2D(0, JB)];
  for (let i = 0; i <= 6; i++) { const a = (i / 6) * Math.PI / 2; p.push(V2D(JR - 0.1 + 0.1 * Math.sin(a), JB + 0.1 - 0.1 * Math.cos(a))); }
  p.push(V2D(JR, JMID), V2D(JR, JS));
  for (let i = 1; i <= 6; i++) { const a = (i / 6) * Math.PI / 2; p.push(V2D(JN + (JR - JN) * Math.cos(a), JS + (JT - 0.06 - JS) * Math.sin(a))); }
  p.push(V2D(JN, JT), V2D(JN - 0.04, JT));
  return p;
}
let JM = null;
function jarKit() {
  if (JM) return JM;
  const glass = new THREE.MeshPhysicalMaterial({ color: '#f4fbff', transparent: true, opacity: 0.16, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.03, envMap: ENV, envMapIntensity: 1.1, side: THREE.DoubleSide, depthWrite: false });
  const shard = glass.clone(); shard.opacity = 0.55; shard.color = new THREE.Color('#dff4ff'); shard.emissive = new THREE.Color('#bfe8ff'); shard.emissiveIntensity = 0.25;
  const jamTex = canvasTex(256, 256, (x, w, h) => {
    x.fillStyle = '#a00a22'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { x.fillStyle = 'rgba(120,0,20,' + (0.2 + Math.random() * 0.4) + ')'; x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, 6 + Math.random() * 14, 4 + Math.random() * 8, Math.random() * 3, 0, 6.283); x.fill(); }
    for (let i = 0; i < 40; i++) { x.fillStyle = 'rgba(255,70,90,' + (0.3 + Math.random() * 0.4) + ')'; x.beginPath(); x.arc(Math.random() * w, Math.random() * h, 3 + Math.random() * 8, 0, 6.283); x.fill(); }
    x.fillStyle = '#ffd36b'; for (let i = 0; i < 70; i++) { x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, 1.6, 2.6, Math.random() * 3, 0, 6.283); x.fill(); }
  }, [3, 2]);
  const jam = new THREE.MeshPhysicalMaterial({ map: jamTex, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08, envMap: ENV, envMapIntensity: 0.6, color: '#d8d0d0', emissive: '#5a0010', emissiveIntensity: 0.12 });
  // kareli bez: yari saydam kirmizi seritler ust uste binince kesisimler koyulasir
  const ging = canvasTex(128, 128, (x, w, h) => {
    x.fillStyle = '#fff8f0'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(226,36,58,.55)';
    for (let k = 0; k < 4; k++) { x.fillRect(k * 32, 0, 16, h); x.fillRect(0, k * 32, w, 16); }
    for (let i = 0; i < 400; i++) { x.fillStyle = 'rgba(0,0,0,' + Math.random() * 0.05 + ')'; x.fillRect(Math.random() * w, Math.random() * h, 2, 1); }
  }, [7, 3]);
  const cloth = new THREE.MeshStandardMaterial({ map: ging, roughness: 0.85, side: THREE.DoubleSide });
  const rib = new THREE.MeshPhysicalMaterial({ color: '#ffc43d', roughness: 0.3, clearcoat: 1, envMap: ENV, envMapIntensity: 0.7 });
  const lab = new THREE.MeshStandardMaterial({ map: TX.recel_etiket, roughness: 0.55 });
  const prof = jarProfile(), glassGeo = new THREE.LatheGeometry(prof, 40);
  // recel: camin biraz icinde, omzun altina kadar dolu, ustu hafif kubbe
  const ri = JR - 0.035, jb = JB + 0.04, jt = JS - 0.03, jp = [V2D(0, jb)];
  for (let i = 0; i <= 5; i++) { const a = (i / 5) * Math.PI / 2; jp.push(V2D(ri - 0.08 + 0.08 * Math.sin(a), jb + 0.08 - 0.08 * Math.cos(a))); }
  jp.push(V2D(ri, jt), V2D(ri - 0.06, jt + 0.04), V2D(ri * 0.5, jt + 0.07), V2D(0, jt + 0.075));
  const jamGeo = new THREE.LatheGeometry(jp, 32);
  // etiket: on yuzde kavisli kagit (4:3 resim, yay uzunlugu = yukseklik*4/3)
  const lh = 0.6, lr = JR + 0.012, labGeo = new THREE.CylinderGeometry(lr, lr, lh, 20, 1, true, -lh * 4 / 3 / lr / 2, lh * 4 / 3 / lr);
  labGeo.translate(0, JB + 0.1 + (JS - JB - 0.1) / 2 - 0.02, 0);
  // bez kapak (kapak grubunun merkezi y=JT): kubbe ust, boyna sarilan kurdele, asagi sarkan dalgali etek
  const cp = [V2D(0, 0.14), V2D(0.25, 0.135), V2D(JN * 0.8, 0.12), V2D(JN + 0.05, 0.08), V2D(JN + 0.08, 0.03), V2D(JN + 0.1, -0.02), V2D(JR + 0.02, -0.12), V2D(JR + 0.07, -0.21)];
  const clothGeo = new THREE.LatheGeometry(cp, 72), pa = clothGeo.attributes.position;
  for (let i = 0; i < pa.count; i++) {
    const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i); if (y >= 0.03) continue;
    const t = (0.03 - y) / 0.24, ph = Math.atan2(x, z), k = 1 + 0.07 * t * Math.sin(9 * ph);
    pa.setXYZ(i, x * k, y + 0.03 * t * Math.sin(9 * ph + 1), z * k);
  }
  clothGeo.computeVertexNormals();
  const ribGeo = new THREE.TorusGeometry(JN + 0.105, 0.035, 8, 48); ribGeo.rotateX(Math.PI / 2);
  const loopGeo = new THREE.TorusGeometry(0.085, 0.03, 8, 18), knotGeo = new THREE.SphereGeometry(0.05, 12, 10);
  // kirilinca: cam 4 dilim x 2 kat = 8 kavisli parca (her biri kendi merkezine gore)
  const shards = [], lo = prof.filter((v) => v.y <= JMID + 1e-6), hi = prof.filter((v) => v.y >= JMID - 1e-6);
  for (let a = 0; a < 4; a++) for (const band of [lo, hi]) {
    const g0 = new THREE.LatheGeometry(band, 5, a * Math.PI / 2 + (Math.random() - 0.5) * 0.3, Math.PI / 2 * (0.8 + Math.random() * 0.3));
    g0.computeBoundingBox(); const c = g0.boundingBox.getCenter(new THREE.Vector3()); g0.translate(-c.x, -c.y, -c.z); shards.push({ geo: g0, c });
  }
  return (JM = { glass, shard, jam, cloth, rib, lab, glassGeo, jamGeo, labGeo, clothGeo, ribGeo, loopGeo, knotGeo, shards, blobGeo: new THREE.SphereGeometry(0.2, 14, 10) });
}
function makeJar() {
  const K = jarKit(), gr = new THREE.Group();
  const add = (geo, mat, par) => { const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; (par || gr).add(m); return m; };
  add(K.jamGeo, K.jam); add(K.labGeo, K.lab);
  const gl = add(K.glassGeo, K.glass); gl.castShadow = false; gl.renderOrder = 2;
  const lid = new THREE.Group(); lid.position.y = JT; gr.add(lid);
  add(K.clothGeo, K.cloth, lid); add(K.ribGeo, K.rib, lid);
  const bz = JN + 0.14;   // kurdele fiyonku onde
  const l1 = add(K.loopGeo, K.rib, lid); l1.position.set(-0.08, 0.02, bz); l1.rotation.set(0, 0.5, 0.5);
  const l2 = add(K.loopGeo, K.rib, lid); l2.position.set(0.08, 0.02, bz); l2.rotation.set(0, -0.5, -0.5);
  const kn = add(K.knotGeo, K.rib, lid); kn.position.set(0, 0, bz + 0.02);
  gr.userData.lid = lid;
  return gr;
}
// ucusan parcalar (cam, kapak, recel topagi): basit kinematik; platformun ustune ya da zemine duser, sonra kuculup kaybolur
const DEB = [], SPL = [];
const rndV = (k) => new THREE.Vector3((Math.random() - 0.5) * k, (Math.random() - 0.5) * k, (Math.random() - 0.5) * k);
function floorAt(x, z) {
  if (K) return K.floorAt(x, z);
  if (PLS.length > 1 || (PLS[0] && PLS[0].cx)) { for (const q of PLS) if (Math.abs(x - q.cx) < q.r && Math.abs(z - q.z) < q.rz) return 0; return GY; } if (PANG) { const c = Math.cos(PANG), s2 = Math.sin(PANG), lx = x * c - z * s2, lz = x * s2 + z * c; x = lx; z = lz; } return (TEMA_YAPI[1] === 'sirk' ? Math.abs(x) < R && Math.abs(z) < RZ : KARE(TEMA_YAPI[1]) ? Math.abs(x) < R && Math.abs(z) < R : x * x + z * z < R * R) ? 0 : GY; }
function debris(m, pos, vel, spin, life, kind, h, sr) { m.position.copy(pos); scene.add(m); DEB.push({ m, v: vel, w: spin, life, kind, s: m.scale.clone(), h, sr }); return DEB[DEB.length - 1]; }
// v3.2: (Adem 11 Kas) sivi damlasi: hiz yonunde uzar (gercek damla gibi), carpinca kucuk damlalar sacar
const UPV = new THREE.Vector3(0, 1, 0), TVV = new THREE.Vector3();
function damla(mat, geo, p, v, s, col, sr, cok) { const m = new THREE.Mesh(geo, mat); m.scale.setScalar(s); m.castShadow = !!cok; const d = debris(m, p, v, new THREE.Vector3(), 3, 'blob', 0.05, sr); d.str = true; d.col = col; d.mat = mat; d.cok = cok; return d; }
const SPLGEO = new THREE.PlaneGeometry(2, 2);
const SPLMATS = {};
function splat(x, y, z, r, col, ang, el) {
  col = col || '#c4142c'; let SPLMAT = SPLMATS[col];
  if (!SPLMAT) {
    const t = canvasTex(256, 256, (c, w, h) => {
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(128, 128, 78, 0, 6.283); c.fill();
      for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283 + Math.random() * 0.3, d = 66 + Math.random() * 30, rr = 10 + Math.random() * 16; c.beginPath(); c.arc(128 + Math.cos(a) * d, 128 + Math.sin(a) * d, rr, 0, 6.283); c.fill(); }
      for (let i = 0; i < 12; i++) { const a = Math.random() * 6.283, d = 104 + Math.random() * 18, rr = 3 + Math.random() * 6; c.beginPath(); c.arc(128 + Math.cos(a) * d, 128 + Math.sin(a) * d, rr, 0, 6.283); c.fill(); }
      const gr = c.createRadialGradient(128, 128, 10, 128, 128, 110); gr.addColorStop(0, 'rgba(60,60,60,.45)'); gr.addColorStop(1, 'rgba(60,60,60,0)'); c.globalCompositeOperation = 'source-atop'; c.fillStyle = gr; c.fillRect(0, 0, w, h);
      c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(100, 98, 30, 14, -0.6, 0, 6.283); c.fill();
    });
    SPLMAT = SPLMATS[col] = new THREE.MeshStandardMaterial({ map: t, color: col, transparent: true, roughness: 0.12, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, envMap: ENV, envMapIntensity: 0.6 });
  }
  const m = new THREE.Mesh(SPLGEO, SPLMAT); m.rotation.set(-Math.PI / 2, 0, ang == null ? Math.random() * 6.283 : ang); m.position.set(x, y + 0.012 + (SPL.length % 8) * 0.002, z);
  m.scale.setScalar(0.01); m.receiveShadow = true; scene.add(m); SPL.push({ m, x, y, z, r, k: 0, el: el || 1 });
}
function updateDebris(dt) {
  for (let i = DEB.length - 1; i >= 0; i--) {
    const d = DEB[i], m = d.m; d.life -= dt; d.v.y -= 22 * dt; m.position.addScaledVector(d.v, dt);
    if (d.str) { const sp = d.v.length(); if (sp > 0.01) m.quaternion.setFromUnitVectors(UPV, TVV.copy(d.v).divideScalar(sp)); const e = Math.min(2.8, 1 + sp * 0.11); m.scale.set(d.s.x / Math.sqrt(e), d.s.y * e, d.s.z / Math.sqrt(e)); }
    else { m.rotation.x += d.w.x * dt; m.rotation.y += d.w.y * dt; m.rotation.z += d.w.z * dt; }
    const f0 = floorAt(m.position.x, m.position.z), fy = f0 + (d.h || 0.04);
    if (m.position.y < fy && d.v.y < 0 && m.position.y > fy - 0.8) {
      if (d.kind === 'blob') { const hz = Math.hypot(d.v.x, d.v.z), col = d.col || '#c4142c';
        splat(m.position.x, f0, m.position.z, d.sr || 0.3 + Math.random() * 0.25, col, hz > 0.5 ? -Math.atan2(d.v.z, d.v.x) : null, 1 + Math.min(1.4, hz * 0.16));
        if (d.cok || d.sr > 0.5) for (let j = 0; j < (d.sr > 0.5 ? 9 : 4); j++) { const a = Math.random() * 6.283, sp = 1.5 + Math.random() * 2.5; damla(d.mat || jarKit().jam, jarKit().blobGeo, new THREE.Vector3(m.position.x, f0 + 0.08, m.position.z), new THREE.Vector3(Math.cos(a) * sp + d.v.x * 0.15, 2.5 + Math.random() * 3, Math.sin(a) * sp + d.v.z * 0.15), 0.18 + Math.random() * 0.2, col, 0.08 + Math.random() * 0.1, false); }
        burst(new THREE.Vector3(m.position.x, f0 + 0.1, m.position.z), col, d.sr ? 10 : 3, 3); d.life = 0; }
      else if (f0 <= GY + 0.01) { if (!d.gr) { d.gr = true; d.life = Math.min(d.life, 0.9); } d.v.set(0, -0.9, 0); d.w.set(0, 0, 0); }   // v6.5: yerde sekmez, gomulur
      else { m.position.y = fy; d.v.y *= -0.18; d.v.x *= 0.5; d.v.z *= 0.5; d.w.multiplyScalar(0.5); }
    }
    if (d.life < 0.5) m.scale.copy(d.s).multiplyScalar(Math.max(0, d.life / 0.5));
    if (d.life <= 0 || m.position.y < GY - 3) { scene.remove(m); DEB.splice(i, 1); }
  }
  for (const s of SPL) if (s.k < 1) { s.k = Math.min(1, s.k + dt * 7); const f = s.r * (0.3 + 0.7 * (1 - (1 - s.k) ** 3)); s.m.scale.set(f * s.el, f / Math.sqrt(s.el), 1); }
}
function breakJar(c) {
  const K = jarKit(), p = new THREE.Vector3().copy(c.body.position), q = new THREE.Quaternion().copy(c.body.quaternion);
  for (const sh of K.shards) {
    const m = new THREE.Mesh(sh.geo, K.shard); m.quaternion.copy(q); m.renderOrder = 2;
    const ctr = sh.c.clone().applyQuaternion(q), v = new THREE.Vector3(ctr.x, 0, ctr.z).normalize().multiplyScalar(2.5 + Math.random() * 3.5); v.y += 3 + Math.random() * 4;
    debris(m, p.clone().add(ctr), v, rndV(12), 1.8 + Math.random() * 0.6, 'cam');
  }
  const lid = c.mesh.userData.lid, lp = new THREE.Vector3(0, JT, 0).applyQuaternion(q).add(p);
  lid.removeFromParent(); lid.position.set(0, 0, 0); lid.quaternion.copy(q);
  debris(lid, lp, new THREE.Vector3((Math.random() - 0.5) * 3, 7 + Math.random() * 2, (Math.random() - 0.5) * 2), rndV(9), 2.6, 'kapak');
  // icindeki recel tek bir koca topak olarak duser, yere carpinca buyuk leke olur; cevreye damlalar sacilir
  const lump = new THREE.Mesh(K.jamGeo, K.jam); lump.quaternion.copy(q); lump.castShadow = true;
  debris(lump, p.clone(), new THREE.Vector3((Math.random() - 0.5) * 1.5, 1.5, (Math.random() - 0.5) * 1.5), rndV(1.5), 4, 'blob', 0.55, 0.9);
  // v3.2: recel her yone sacilir: iri topaklar, orta damlalar ve ince serpinti; hepsi ucarken uzar, dustugu yerde uzun leke birakir
  for (let i = 0; i < 26; i++) {
    const iri = i < 7, a = Math.random() * 6.283, h = iri ? 2 + Math.random() * 2.5 : 2.5 + Math.random() * 5, v = new THREE.Vector3(Math.cos(a) * h, (iri ? 3.5 : 4.5) + Math.random() * 4, Math.sin(a) * h);
    damla(K.jam, K.blobGeo, p.clone().add(new THREE.Vector3(Math.cos(a) * 0.25, Math.random() * 0.4, Math.sin(a) * 0.25)), v, iri ? 0.7 + Math.random() * 0.5 : 0.22 + Math.random() * 0.3, '#c4142c', iri ? 0.28 + Math.random() * 0.18 : 0.1 + Math.random() * 0.1, iri);
  }
  burst(p, '#e8203a', 18, 6); burst(p, '#ffffff', 8, 5); sfx('cam'); sfx('slap');
  const at = screenAt(p, 0.6); floatText('Şlap!', at[0], at[1]);
  shake = Math.min(0.6, shake + 0.25); wakeAll(); g.busy = Math.max(g.busy, 1.5);
}

// ---------------- bolumler ----------------
const C = { kir: '#ff4256', tur: '#ff9a1f', sar: '#ffd23f', mav: '#3d7bff', mor: '#a25cff', yes: '#2fcf73', pem: '#ff6fcf', tur2: '#22c8e8' };
// her bolum: kup listesi [i, j(kat), k, renk] (izgara birimi), top sayisi, arka plan
function box(o, i0, i1, j0, j1, k0, k1, col) { for (let j = j0; j <= j1; j++) for (let k = k0; k <= k1; k++) for (let i = i0; i <= i1; i++) o.push([i, j, k, typeof col === 'function' ? col(i, j, k) : col]); return o; }
// zorluk egrisi: bolum ilerledikce top sayisi azalir, yapilar agirlasir (tugla/celik) ve ozel bloklar artar.
// renk (#...) yerine malzeme adi da yazilabilir: sandik, tugla, celik, buz, jole, cam, fici, bomba, altin, hediye, yildiz
const LEVELS = [
  { ad: 'Reçel Rafı', top: 7, tema: ['cayir1', 'seker'], make: () => { const o = box([], 0, 4, 0, 0, 0, 1, (i) => [C.kir, C.tur, C.sar, C.yes, C.mav][i]);
    box(o, 0, 4, 1, 1, 0, 1, (i, j, k) => (k === 1 && (i === 1 || i === 3) ? 'recel' : k === 1 ? C.mor : C.tur)); box(o, 0, 4, 2, 2, 0, 1, C.sar);
    o.push([1, 3, 1, 'recel'], [2, 3, 1, 'hediye'], [3, 3, 1, 'recel'], [0, 3, 0, 'recel'], [4, 3, 0, 'recel']); return o; } },
  { ad: 'Renkli Duvar', top: 8, bg: 1, make: () => { const o = box([], 0, 5, 0, 3, 0, 1, (i, j) => (j < 2 ? ((i + j) % 4 === 1 ? C.sar : C.kir) : (i % 3 === 1 && j === 3 ? C.sar : C.tur))); o.push([2.5, 4, 0.5, 'hediye']); return o; } },
  { ad: 'Barut Fıçısı', top: 6, bg: 1, make: () => box([], 0, 5, 0, 2, 0, 1, (i, j, k) => (j === 0 && k === 1 && (i === 1 || i === 4) ? 'fici' : j === 2 ? C.mav : C.kir)) },
  { ad: 'İkiz Kuleler', top: 8, bg: 1, make: () => { const o = []; box(o, 0, 1, 0, 5, 0, 1, (i, j) => (j === 5 ? C.sar : C.mav)); box(o, 5, 6, 0, 5, 0, 1, (i, j) => (j === 5 ? C.sar : C.mav)); box(o, 2, 4, 0, 2, 0, 0, (i, j) => (j === 0 && i === 3 ? 'fici' : j === 1 && i === 3 ? C.sar : C.kir)); box(o, 2, 4, 0, 1, 1, 1, C.tur); return o; } },
  { ad: 'Sandık Piramidi', top: 6, bg: 3, make: () => { const o = []; for (let l = 0; l < 6; l++) box(o, l / 2, 5 - l / 2, l, l, 0, 1, l === 5 ? 'altin' : 'sandik'); return o; } },
  { ad: 'Kale', top: 8, bg: 1, make: () => { const o = []; box(o, 0, 6, 0, 2, 0, 1, (i, j, k) => (i === 3 && j < 2 && k === 1 ? 'celik' : k === 1 && j === 0 && (i === 1 || i === 5) ? 'fici' : 'tugla')); box(o, 0, 0, 3, 5, 0, 1, (i, j) => (j === 5 ? C.mor : C.mav)); box(o, 6, 6, 3, 5, 0, 1, (i, j) => (j === 5 ? C.mor : C.mav)); box(o, 2, 4, 3, 4, 1, 1, (i, j) => (i === 3 && j === 4 ? 'yildiz' : C.tur)); return o; } },
  { ad: 'Cam Kule', top: 6, bg: 2, make: () => { const o = box([], 0, 2, 0, 5, 0, 2, (i, j) => (j % 2 ? 'cam' : [C.yes, C.tur2, C.mav][j / 2])); o.push([1, 6, 1, 'yildiz']); return o; } },
  { ad: 'Buz Basamakları', top: 5, bg: 3, make: () => { const o = []; for (let i = 0; i < 6; i++) box(o, i, i, 0, 5 - i, 0, 1, (ii, j) => (j === 5 - i ? 'jole' : 'buz')); return o; } },
  { ad: 'Cephanelik', top: 4, bg: 1, make: () => box([], 0, 5, 0, 2, 0, 1, (i, j, k) => (i === 2 && j === 1 && k === 1 ? 'bomba' : (i + j + k) % 3 === 0 ? 'fici' : 'sandik')) },
  { ad: 'Buz Sarayı', top: 6, bg: 2, make: () => { const o = []; box(o, 0, 6, 0, 1, 0, 1, 'buz'); box(o, 0, 1, 2, 4, 0, 1, 'cam'); box(o, 5, 6, 2, 4, 0, 1, 'cam'); box(o, 2, 4, 2, 2, 0, 1, (i) => (i === 3 ? 'hediye' : C.tur2)); return o; } },
  { ad: 'Hazine Odası', top: 7, bg: 3, make: () => { const o = box([], 0, 6, 0, 3, 0, 1, (i, j, k) => ((i === 0 || i === 6) && j === 0 ? 'celik' : k === 1 && j === 1 && (i === 2 || i === 4) ? 'altin' : 'tugla')); o.push([3, 4, 0.5, 'yildiz']); return o; } },
  { ad: 'Jöle Kuleleri', top: 5, bg: 2, make: () => { const o = []; box(o, 0, 1, 0, 4, 0, 1, (i, j) => (j % 2 ? 'jole' : C.pem)); box(o, 4, 5, 0, 4, 0, 1, (i, j) => (j % 2 ? 'jole' : C.mor)); box(o, 2, 3, 0, 1, 0, 1, (i, j, k) => (j === 0 && k === 1 && i === 2 ? 'bomba' : 'hediye')); return o; } },
  { ad: 'Dev Kule', top: 6, bg: 2, make: () => box([], 0, 2, 0, 6, 0, 2, (i, j, k) => (j === 3 ? 'cam' : j === 0 && i === 1 && k === 2 ? 'fici' : [C.yes, C.tur2, C.mav, 0, C.pem, C.kir, C.sar][j])) }
];
// her bolumun arka plani (Adem'in Gemini resimleri, fon/*.webp) ve ona uyan platform temasi
const TEMALAR = [['cayir1', 'ahsap'], ['cayir2', 'ahsap'], ['sahil1', 'mercan'], ['col', 'tas'], ['orman', 'tas'], ['kar1', 'buz'],
  ['kar2', 'buz'], ['uzay', 'neon'], ['deniz', 'mercan'], ['sahil2', 'ahsap'], ['seker', 'seker'], ['cayir3', 'ahsap']];
// Yapi bolumunun tek fonu ve platformu (Adem 4 Kas 2026): col harabesi resmi + kare tas platform. Eski temalar yukarida duruyor.
const TEMA_YAPI = ['cayir4', 'sirk'];
// v6.1: fon her 3 bolumde bir degisir: cayir, karli koy, sahil. Zemin lekesi ve toz rengi fona uyar.
const FONLAR = [{ f: 'cayir4', vid: 'cayir4', dirt: ['176,128,82', '160,112,70', '120,92,50'], toz: '#d9c3a0' }, { f: 'koy', vid: 'koy', dirt: ['120,78,40', '104,66,32', '80,50,24'], toz: '#e8c896' }, { f: 'kar3', vid: 'kar3', bs: 'auto 135%', bp: '50% 100%', dirt: ['236,242,252', '222,232,248', '200,214,236'], toz: '#ffffff' }, { f: 'sahil3', vid: 'sahil4', dirt: ['240,214,160', '228,198,140', '210,180,120'], toz: '#f3dfb4' }];
const BOSFON = new Set(['cayir4', 'sahil3']);   // v6.17: cizili koyun/martilari silinmis fon; canlilari canli.js cizer
function fonEski(L) { return FONLAR[Math.floor((L - 1) / 3) % FONLAR.length]; }   // v5.4: Adem'in cayir resmi + cizgili Tripo platformu (harabe kodu duruyor)
// v3.19: (Adem) ?fon=yeni deneme anahtari: 8 tam resim fon (fon/yeni/*.webp, 768x1376), her dunya 10 bolum. Eski gorunum varsayilan.
// cy: resimdeki bos yuvarlak zemin alaninin orta noktasi (yukseklik orani); platform ayagi kamera ile tam buraya oturur (fit).
// isi: gunes/ay/isik huzmesinin resimdeki yeri (yalniz transform+opacity ile yavas parilti). pn: zemine gore zit renkli platform modeli.
const FONYENI = Q.get('fon') === 'yeni';
const YFON = {
  koy: { f: 'y_koy', r: 'koy_gunduz', cy: 0.685, pn: 'platform_4', toz: '#e8c896', ad: 'Korsan Koyu' },
  col: { f: 'y_col', r: 'col', cy: 0.688, pn: 'platform_4', toz: '#e8c48a', ad: 'Altın Çöl' },
  seker: { f: 'y_seker', r: 'seker', cy: 0.700, pn: 'platform_4', toz: '#ffd0e4', ad: 'Şeker Diyarı' },
  buz: { f: 'y_buz', r: 'buz', cy: 0.678, pn: 'platform_3', toz: '#ffffff', ad: 'Buz Koyu', isi: [0.49, 0.36, 0.5] },
  gunbatimi: { f: 'y_gunbatimi', r: 'koy_gunbatimi', cy: 0.695, pn: 'platform_4', toz: '#f0c090', ad: 'Gün Batımı Koyu', isi: [0.51, 0.44, 0.6] },
  volkan: { f: 'y_volkan', r: 'volkan', cy: 0.675, pn: 'platform_3', toz: '#b8a090', ad: 'Volkan Adası' },
  gece: { f: 'y_gece', r: 'gece', cy: 0.670, pn: 'platform_3', toz: '#c8d4e8', ad: 'Gece Koyu', isi: [0.68, 0.26, 0.4] },
  magara: { f: 'y_magara', r: 'magara', cy: 0.650, pn: 'platform_3', toz: '#e0c890', ad: 'Hazine Mağarası', isi: [0.55, 0.12, 0.7] }
};
for (const k in YFON) Object.assign(YFON[k], { yeni: 1, dirt: ['200,170,120', '180,150,100', '150,120,80'] });
const YSIRA = ['koy', 'col', 'seker', 'buz', 'gunbatimi', 'volkan', 'gece', 'magara'];   // 1-10 koy, 11-20 col, ... 71-80 magara, sonra basa doner
function fonOf(L) { return FONYENI && !K ? YFON[YSIRA[Math.floor((L - 1) / 10) % YSIRA.length]] : fonEski(L); }
function platAd(fo) { return fo.pn || (fo.f.startsWith('kar') ? 'platform_3' : fo.f.startsWith('sahil') ? 'platform_2' : 'platform_4'); }
// resim fonun (cover, ortali) ekrandaki yeri: resimdeki (fx, fy) oranlari -> ekran pikseli
function fonPx(fx, fy) { const W = innerWidth, H = innerHeight, s = Math.max(W / 768, H / 1376); return [(W - 768 * s) / 2 + fx * 768 * s, (H - 1376 * s) / 2 + fy * 1376 * s, s]; }
function fonIsi(fo) {
  let d = $('bgisi'); if (!d) { d = document.createElement('div'); d.id = 'bgisi'; $('bg').after(d); }
  if (!fo || !fo.isi) { d.style.display = 'none'; return; }
  const [x, y, s] = fonPx(fo.isi[0], fo.isi[1]), r = 260 * s * fo.isi[2];
  Object.assign(d.style, { display: 'block', left: (x - r) + 'px', top: (y - r) + 'px', width: 2 * r + 'px', height: 2 * r + 'px' });
}
// v6.1: bolum tasarimindaki renkler artik boya degil; renk ailesine gore Adem'in kup modeline (orijinal rengiyle) ya da cam sekle donusur.
// Sutun tepeleri cogunlukla cam tepe sekli (kure, piramit, koni, kristal...), govdenin bir kismi cam yigin sekli olur. Bolume gore sabit.
const NOMETAL = { metal: 'tas', celik: 'tas' };   // v6.27: (Adem) metal kup ve sesi istemiyor
const COLFAM = { '#ff4256': 'kirmizi', '#ff6fcf': 'kirmizi', '#ff9a1f': 'ahsap', '#ffd23f': 'ahsapmetal', '#3d7bff': 'tas', '#a25cff': 'tas', '#22c8e8': 'tas', '#2fcf73': 'ahsapmetal' };
const MTEPE = ['piramitTas', 'kabak', 'buz'];   // v6.2: Adem'in modelleri de sutun tepesinde
function rnd3(a, b, c, d) { let h = (a * 73856093) ^ (b * 19349663) ^ (c * 83492791) ^ (d * 2654435761); h = Math.imul(h ^ (h >>> 15), 2246822519); h = Math.imul(h ^ (h >>> 13), 3266489917); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function convertLevel(list, L) {
  let ia = 1e9, ib = -1e9; for (const [i] of list) { ia = Math.min(ia, i); ib = Math.max(ib, i); }
  const mir = (i) => Math.min(i - ia, ib - i);   // v6.5: sag-sol ayna: rastgele secimler simetrik
  const top = {}; for (const [i, j, k] of list) { const key = i + ',' + k; top[key] = Math.max(top[key] ?? -1, j); }
  return list.map(([i, j, k, col]) => {
    if (col[0] !== '#') return [i, j, k, col];
    const a = rnd3(L, Math.round(mir(i) * 2), j, Math.round(k * 2)), b = rnd3(L + 99, Math.round(mir(i) * 2), j, Math.round(k * 2));
    if (top[i + ',' + k] === j && a < 0.3) return [i, j, k, MTEPE[Math.floor(b * MTEPE.length)]];   // v6.4: cam sekiller kaldirildi
    return [i, j, k, COLFAM[col] || 'tas'];
  });
}
// v6.4: referans oyundaki gibi yuksek ve sik kuleler (renkler COLFAM ile Adem'in modellerine doner). Eski bolumlerin arasina girer.
// v6.5: (Adem) simetrik ve cesitli dizilimler. ayna(W) -> merkezden uzaklik. don: platform 360 derece doner (rad/sn).
const ayna = (W) => (i) => Math.round(Math.min(i, W - 1 - i));
const KULELER = [
  // v3.1: (Adem 10 Kas 2026) uc yeni yapi, kodla cizilen 3B sekillerle (sekil.js)
  { ad: 'Oyuncak Duvar', ek: 4, make: () => YAPI.duvar() },
  { ad: 'Buz Tapınağı', ek: 4, make: () => YAPI.tapinak() },
  { ad: 'Şeker Rafı', make: () => YAPI.raf() },
  // v3.11: (Adem 11 Kas) yeni kodla cizilen sekillerle uc yapi daha
  { ad: 'Pastane', ek: 4, make: () => YAPI.pastane() },
  { ad: 'Hediye Kulesi', ek: 4, make: () => YAPI.hediye() },
  { ad: 'Hazine Deposu', ek: 4, make: () => YAPI.depo() },
  { ad: 'Renkli Kule', make: () => { const m = ayna(5); return box([], 0, 4, 0, 9, 0, 1, (i) => [C.kir, C.sar, C.mav][m(i)]); } },
  { ad: 'Kayan Kule', pl: [{ x: 0, z: 0, kay: { a: 2.6, h: 1.1 } }], make: () => box([], 0, 3, 0, 7, 0, 1, (i, j) => (j % 3 === 2 ? C.sar : i === 0 || i === 3 ? C.kir : C.mav)) },
  { ad: 'Basamaklı Kule', make: () => { const o = []; [[0, 6, 0, 2, C.kir], [1, 5, 3, 5, C.sar], [2, 4, 6, 8, C.mav], [3, 3, 9, 9, 'altin']].forEach(([a, b, c, d, col]) => box(o, a, b, c, d, 0, 1, col)); return o; } },
  { ad: 'Dönen Kule', don: 0.55, make: () => box([], 0, 2, 0, 8, 0, 2, (i, j, k) => (j === 8 && i === 1 && k === 1 ? 'altin' : j % 3 === 2 ? C.sar : (i === 1 && k === 1) ? C.mav : C.kir)) },
  { ad: 'İkiz Platform', pl: [{ x: -4.3, z: 0 }, { x: 4.3, z: 0 }], make: () => { const yap = (n) => box([], 0, 2, 0, 7, 0, 1, (i, j) => (i === 0 || i === 2 || j === 0 || j === 7 ? C.tur : C.mav)).map((c) => (c.push(n), c)); return yap(0).concat(yap(1)); } },
  { ad: 'Kuleli Kale', make: () => { const o = box([], 0, 6, 0, 2, 0, 1, (i, j) => (j === 2 ? C.sar : C.mor)); box(o, 0, 1, 3, 7, 0, 1, (i, j) => (j === 7 ? C.sar : C.kir)); box(o, 5, 6, 3, 7, 0, 1, (i, j) => (j === 7 ? C.sar : C.kir)); box(o, 3, 3, 3, 4, 0, 1, (i, j) => (j === 4 ? 'altin' : C.mav)); return o; } },
  { ad: 'Piramit', make: () => { const o = []; for (let l = 0; l < 7; l++) box(o, l / 2, 6 - l / 2, l, l, 0, 1, l === 6 ? 'altin' : [C.kir, C.kir, C.sar, C.sar, C.mav, C.mav][l]); return o; } },
  { ad: 'Ön ve Arka', pl: [{ x: 0, z: -3.4 }, { x: 0, z: 3.2, kay: { a: 2.8, h: 0.9 } }], make: () => { const o = box([], 0, 5, 0, 5, 0, 1, (i, j) => (j % 2 ? C.sar : ayna(6)(i) === 2 ? C.mav : C.kir)).map((c) => (c.push(0), c)); return o.concat(box([], 0, 2, 0, 3, 0, 0, (i, j) => (j === 3 ? 'altin' : C.mor)).map((c) => (c.push(1), c))); } },
  { ad: 'Dönen Kale', don: 0.5, make: () => box([], 0, 3, 0, 6, 0, 3, (i, j, k) => (i > 0 && i < 3 && k > 0 && k < 3 ? (j === 0 ? 'fici' : null) : j === 6 ? C.sar : (i === 0 || i === 3) && (k === 0 || k === 3) ? C.mor : C.kir)).filter((c) => c[3]) },
  { ad: 'Çizgili Kule', make: () => box([], 0, 5, 0, 10, 0, 1, (i, j) => (Math.floor(j / 2) % 2 ? C.sar : ayna(6)(i) === 2 ? C.mav : C.kir)) },
  { ad: 'Dönen Piramit', don: 0.5, make: () => { const o = box([], 0, 4, 0, 1, 0, 4, (i, j, k) => (Math.min(i, k, 4 - i, 4 - k) === 0 ? C.kir : C.tur)); box(o, 1, 3, 2, 3, 1, 3, C.sar); box(o, 2, 2, 4, 5, 2, 2, (i, j) => (j === 5 ? 'altin' : C.mav)); return o; } },
  { ad: 'Kayan İkizler', pl: [{ x: -4.3, z: 0, kay: { a: 1.3, h: 1.3 } }, { x: 4.3, z: 0, kay: { a: 1.3, h: 1.3 } }], make: () => { const yap = (n) => box([], 0, 2, 0, 6, 0, 1, (i, j) => (j === 6 ? C.sar : i === 1 ? C.mav : C.kir)).map((c) => (c.push(n), c)); return yap(0).concat(yap(1)); } },
  { ad: 'Barut Kulesi', make: () => box([], 0, 4, 0, 9, 0, 1, (i, j, k) => (i === 2 && k === 0 && (j === 2 || j === 6) ? 'fici' : j % 4 === 3 ? C.sar : i === 2 ? C.mav : C.kir)) },
  { ad: 'Dev Kule', don: 0.45, make: () => box([], 0, 3, 0, 9, 0, 3, (i, j, k) => (j === 9 && (i === 1 || i === 2) && (k === 1 || k === 2) ? 'altin' : [C.kir, C.sar, C.mav][Math.floor(j / 3) % 3])) },
  // v6.16: (Adem 5 Kas 2026) yeni modellerle kuleler. Dikey sutunlar iki kat boyundadir (j ve j+1'i kaplar), ustlerine kup kati oturur.
  { ad: 'Buz Sütunları', make: () => { const o = []; box(o, 0, 4, 0, 0, 0, 1, 'buzDikey'); box(o, 0, 4, 2, 2, 0, 1, 'buz2'); box(o, 0, 4, 3, 3, 0, 1, 'buzDikey'); box(o, 0, 4, 5, 5, 0, 1, (i) => (i === 2 ? 'altin' : 'buz2')); return o; } },
  { ad: 'Ahşap Kule', make: () => { const o = []; box(o, 0, 3, 0, 2, 0, 1, 'ahsap2'); box(o, 0, 3, 3, 3, 0, 1, 'morDikey'); box(o, 0, 3, 5, 6, 0, 1, 'ahsap2'); o.push([0, 7, 0.5, 'kabak'], [3, 7, 0.5, 'kabak']); return o; } },
  { ad: 'Alev Kalesi', make: () => { const o = []; box(o, 0, 5, 0, 0, 0, 1, 'alevUzun'); box(o, 0, 5, 2, 2, 0, 1, (i, j, k) => ((i === 2 || i === 3) && k === 1 ? 'fici' : 'ahsap2')); box(o, 1, 4, 3, 3, 0, 1, 'alevUzun'); box(o, 1, 4, 5, 5, 0, 1, (i) => (i === 1 || i === 4 ? 'buz2' : 'ahsap2')); return o; } },
  { ad: 'Renkli Sütunlar', don: 0.4, make: () => { const m = ayna(5), SUT = ['alevUzun', 'morDikey', 'buzDikey']; const o = []; box(o, 0, 4, 0, 0, 0, 1, (i) => SUT[m(i)]); box(o, 0, 4, 2, 2, 0, 1, 'ahsap2'); box(o, 0, 4, 3, 3, 0, 1, (i) => SUT[2 - m(i)]); box(o, 0, 4, 5, 5, 0, 1, 'buz2'); box(o, 1, 3, 6, 6, 0, 1, (i) => (i === 2 ? 'altin' : 'ahsap2')); return o; } }
];
// sira: 1. bolum Recel Rafi, sonra her eski bolumden sonra bir kule
const LSIRA = (() => { const o = [], e = LEVELS.slice(); o.push(e.shift()); for (let i = 0; i < Math.max(e.length, KULELER.length); i++) { if (KULELER[i]) o.push(KULELER[i]); if (e[i]) o.push(e[i]); } return o; })();
// ================= Blok Smash 2. asama (Adem 9 Kas 2026) =================
// Bolum uretici: 1-31 el yapimi bolumler (LSIRA) bir kez oynanir; 32'den sonra her bolum kendi tohumundan uretilir, hicbiri tekrar etmez.
// Zorluk bolumle artar: daha saglam malzeme (tas, tugla, altin), daha az fici, donen/kayan platform ve hareketli engel daha sik.
function mul32(a) { return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const zorluk = (L) => Math.min(1, Math.max(0, (L - 1) / 100));
const USIF = ['Taş', 'Ahşap', 'Kızıl', 'Altın', 'Gizli', 'Eski', 'Dev', 'Sarı', 'Mor', 'Yüksek', 'Çifte', 'Kayıp', 'Güneş', 'Kum', 'Rüzgâr', 'Demir'];
function uretBolum(L) {
  const r = mul32(L * 7919 + 13), d = zorluk(L), ri = (a, b) => a + Math.floor(r() * (b - a + 1)), sec = (a) => a[Math.floor(r() * a.length)];
  if (L % 3 === 2) {   // v3.1: her uc bolumde bir yeni yapilardan biri, her seferinde baska olcu ve renkte
    const OY = ['oyK', 'oyY', 'oyM', 'oyS', 'oyP'], a = ri(0, 4), b = (a + ri(1, 4)) % 5, tip = Math.floor(L / 3) % 6;
    const op = tip === 0 ? { r1: OY[a], r2: OY[b], kat: ri(1, 2), desen: ri(0, 3) } : tip === 1 ? { sut: ri(2, 4) } : tip === 2 ? { kat: ri(2, 3), kay: ri(0, 2) } : tip === 3 ? { kay: ri(0, 2), tepe: sec(['krM', 'krT']) } : tip === 4 ? { kat: ri(1, 2), kay: ri(0, 2) } : { sut: ri(2, 3), kay: ri(0, 1) };
    return { ad: sec(USIF) + ' ' + ['Duvar', 'Tapınak', 'Raf', 'Pastane', 'Hediye Kulesi', 'Depo'][tip], ek: 3, uretim: 1, make: () => YAPI[['duvar', 'tapinak', 'raf', 'pastane', 'hediye', 'depo'][tip]](op) };
  }
  if (Q.get('eski') !== '1') return uret2(L, d, fonEski(L).f === 'koy');   // v3.16: yeni uretici (eski kod asagida duruyor, ?eski=1)
  const KIRIK = [C.kir, C.tur, C.pem], SAGLAM = d > 0.45 ? [C.mav, C.sar, C.mor, 'tugla', 'altin'] : [C.mav, C.sar, C.yes, 'tugla'];
  // her kat (j) ve aynaya gore sutun (m) icin malzeme: saglam payi zorlukla artar; sag-sol simetrik kalir
  const ps = 0.18 + 0.5 * d, katR = [], memo = {};
  const mal = (m, j) => { const key = m + ',' + j; if (memo[key]) return memo[key]; if (!katR[j]) katR[j] = [sec(KIRIK), sec(SAGLAM), r()];
    const [a, b, s] = katR[j]; return (memo[key] = (s < ps ? b : a) === b && r() < 0.25 ? a : (s < ps ? b : a)); };
  const ozel = (o, sayi, tur) => { for (let n = 0; n < sayi && o.length; n++) { const c = o[Math.floor(r() * o.length)]; if (c[3][0] === '#' || c[3] === 'tugla') c[3] = tur; } };
  const SEKIL = ['Kale', 'Kule', 'Duvar', 'Piramit', 'Hisar', 'Merdiven', 'Sütunlar', 'İkizler'];
  const sk = SEKIL[(L * 5 + ri(0, 7)) % SEKIL.length];
  let o = [], pl = null, don = 0;
  const Hmax = Math.round(5 + 5 * d);
  if (sk === 'Duvar') { const W = ri(5, 7), H = ri(3, Hmax), m = ayna(W); box(o, 0, W - 1, 0, H - 1, 0, 1, (i, j) => mal(m(i), j)); }
  else if (sk === 'Kule') { const W = ri(3, 4), H = ri(6, Math.max(7, Hmax + 2)), D = r() < 0.5 ? W : 2, m = ayna(W); box(o, 0, W - 1, 0, H - 1, 0, D - 1, (i, j) => mal(m(i), j)); if (D === W && r() < 0.35 + 0.3 * d) don = 0.35 + 0.25 * r(); }
  else if (sk === 'Piramit') { const B = ri(5, 7), D = r() < 0.3 ? 3 : 2; for (let l = 0; l < B; l++) box(o, l / 2, B - 1 - l / 2, l, l, 0, D - 1, (i, j) => mal(0, j)); }
  else if (sk === 'Kale') { const W = 7, H = ri(2, 3), T = ri(H + 2, H + 3 + Math.round(3 * d)), m = ayna(W);
    box(o, 0, W - 1, 0, H - 1, 0, 1, (i, j) => mal(m(i) + 3, j)); box(o, 0, 1, H, T - 1, 0, 1, (i, j) => mal(m(i), j)); box(o, 5, 6, H, T - 1, 0, 1, (i, j) => mal(m(i), j)); box(o, 3, 3, H, H + 1, 0, 1, (i, j) => mal(2, j)); }
  else if (sk === 'Hisar') { const W = 4, H = ri(3, 4 + Math.round(3 * d)); box(o, 0, W - 1, 0, H - 1, 0, W - 1, (i, j, k) => (i > 0 && i < W - 1 && k > 0 && k < W - 1 && j < H - 1 ? null : mal(Math.min(i, k, W - 1 - i, W - 1 - k), j))); o = o.filter((c) => c[3]); if (r() < 0.5 + 0.3 * d) don = 0.3 + 0.2 * r(); }
  else if (sk === 'Merdiven') { const W = 7, m = ayna(W), b0 = ri(1, 2), st = ri(1, 2); for (let i = 0; i < W; i++) box(o, i, i, 0, b0 + m(i) * st, 0, 1, (ii, j) => mal(m(ii), j)); }
  else if (sk === 'Sütunlar') { const W = 7, H = ri(4, Hmax + 1), m = ayna(W); box(o, 0, W - 1, 0, 0, 0, 1, (i, j) => mal(9, j)); for (let i = 0; i < W; i += 2) box(o, i, i, 1, H, 0, 1, (ii, j) => mal(m(ii), j)); }
  else { const H = ri(5, Hmax + 2), yap = (n) => box([], 0, 2, 0, H - 1, 0, 1, (i, j) => mal(i === 1 ? 1 : 0, j)).map((c) => (c.push(n), c)); o = yap(0).concat(yap(1)); pl = [{ x: -4.3, z: 0 }, { x: 4.3, z: 0 }]; if (r() < 0.25 + 0.35 * d) pl.forEach((q) => (q.kay = { a: 1.3, h: 1 + 0.5 * d })); }
  if (!pl && !don && r() < 0.12 + 0.2 * d && sk !== 'Kale') pl = [{ x: 0, z: 0, kay: { a: 2.2 + r(), h: 0.8 + 0.5 * d } }];
  // telefon yorulmasin: en cok 110 blok, fazlasi en ust katlardan kesilir
  while (o.length > 110) { const jm = Math.max(...o.map((c) => c[1])); o = o.filter((c) => c[1] < jm); }
  // ozel bloklar: fici (yardimci, zorlukla azalir), cam/buz/jole, nadiren hediye (+2 top) ve yildiz
  ozel(o, Math.max(0, Math.round((1.6 - 1.4 * d) * r() * 1.5)), 'fici'); if (r() < 0.4) ozel(o, ri(1, 3), sec(['cam', 'buz', 'jole'])); if (r() < 0.2) ozel(o, 1, 'hediye'); if (r() < 0.25) ozel(o, 1, 'yildiz');
  if (d > 0.5 && r() < 0.3) ozel(o, 1, 'bomba');
  const Y = { ad: sec(USIF) + ' ' + sk, make: () => o.map((c) => c.slice()), uretim: 1 };
  if (pl) Y.pl = pl; if (don) Y.don = don;
  return Y;
}
// hareketli engeller: top yolunda donen kurek, sallanan kalkan, kayan tahta. 1-3 yok; 4, 7, 10 tanitim; sonra sansla.
function engelOf(L, Y) {
  { const qe = Q.get('engel'); if (qe === 'kapi' || qe === 'kapi2' || qe === 'giyotin') return [{ t: qe }]; }   // deneme: ?engel=kapi|kapi2|giyotin her bolumde
  if (FONYENI && !K && L === 9) return [{ t: 'kapi2' }]; if (FONYENI && !K && L === 14) return [{ t: 'giyotin' }];   // v3.21: yalniz resim fonda tanitim bolumleri
  if (L < 4) return [];
  if (L === 4) return [{ t: 'kurek' }]; if (L === 7) return [{ t: 'kalkan' }]; if (L === 10) return [{ t: 'kayan' }];
  const r = mul32(L * 104729 + 7), d = zorluk(L); if (r() > 0.38 + 0.35 * d) return [];
  const t = ['kurek', 'kalkan', 'kayan'][Math.floor(r() * 3)];
  if (d > 0.4 && r() < 0.3 && !(Y.pl && Y.pl.length > 1)) return [{ t: 'kurek', x: -0.5, ters: 1 }, { t: 'kurek', x: 0.5 }];
  return [{ t, hiz: 1 + 0.6 * d }];
}
const UCACHE = new Map();
function asansorMu(L) { return Q.get('asansor') === '1' || (Q.get('asansor') !== '0' && L >= 5 && L % 4 === 1); }
function levelOf(L) { if (K) return K.bolum(L); if (Q.get('eski') === '1' ? L <= LSIRA.length : L <= BOLUMLER.length) return Q.get('eski') === '1' ? LSIRA[L - 1] : BOLUMLER[L - 1]; if (!UCACHE.has(L)) UCACHE.set(L, uretBolum(L)); return UCACHE.get(L); }
// v6.13: kup listesindeki 5. alan platform numarasi (0, 1, ...); bolumun pl dizisi platformlarin yeri ve hareketi

// ---------------- fizik ----------------
const KAGIR = 1.8;   // v6.10: 2 de zordu (v6.9), 3 cok zordu   // v6.8: (Adem) kupler hafif (kagit gibi) hissettiriyordu: tum kup kutleleri bu katsayiyla carpilir
const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -32, 0) });   // v6.8: (Adem) kupler agir dussun
world.broadphase = new CANNON.SAPBroadphase(world); world.allowSleep = true; world.solver.iterations = 14; world.solver.tolerance = 0.0005;
// ozel malzemelerin kendi Material'i var; onlarla carpismada surtunme/sekme iki tarafin carpimidir (cannon-es)
const PM = { cube: new CANNON.Material({ friction: 0.62, restitution: 0.2 }), ball: new CANNON.Material({ friction: 0.45, restitution: 0.5 }), plat: new CANNON.Material({ friction: 0.65, restitution: 0.25 }) };
world.addContactMaterial(new CANNON.ContactMaterial(PM.cube, PM.cube, { friction: 0.48, restitution: 0 }));   // v6.7: eski 0.38, biraz daha tutunur
world.addContactMaterial(new CANNON.ContactMaterial(PM.cube, PM.plat, { friction: 0.45, restitution: 0 }));
world.addContactMaterial(new CANNON.ContactMaterial(PM.ball, PM.cube, { friction: 0.2, restitution: 0.25 }));
world.addContactMaterial(new CANNON.ContactMaterial(PM.ball, PM.plat, { friction: 0.3, restitution: 0.3 }));
const platBody = new CANNON.Body({ mass: 0, material: PM.plat }); platBody.collisionFilterGroup = 4; world.addBody(platBody);   // v6.11: mermi (grup 2) platforma carpmaz
const GB = new CANNON.Body({ mass: 0, material: PM.plat }); GB.addShape(new CANNON.Plane()); GB.quaternion.setFromEuler(-Math.PI / 2, 0, 0); GB.position.y = GY; world.addBody(GB);
const SHBOX = new THREE.BoxGeometry(1, 1, 1), GOLGEM = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
const CUBESHAPE = new CANNON.Box(new CANNON.Vec3(S / 2, S / 2, S / 2)), FICISHAPE = new CANNON.Cylinder(FR, FR, S, 16);

// ---------------- oyun durumu ----------------
let LV = 1, g = null;
const cubes = [], balls = [], CUBE_OF = new Map();
function clearLevel() {
  clearPX();
  for (const c of cubes) { world.removeBody(c.body); scene.remove(c.mesh); if (c.cr) { scene.remove(c.cr); c.cr.material.dispose(); } if (c.rim) { scene.remove(c.rim); c.rim = null; } }   // v6.29: onceki bolumden kalan kar/kum yiginlari sahnede kaliyordu
  for (const b of balls) { world.removeBody(b.body); scene.remove(b.mesh); }
  for (const d of DEB) scene.remove(d.m); for (const s of SPL) scene.remove(s.m);
  CUBE_OF.clear(); cubes.length = 0; balls.length = 0; DEB.length = 0; SPL.length = 0;
}
// ---------------- hareketli engeller (Blok Smash 2. asama) ----------------
// Yapinin onunde, top yolunda: donen kurek, sallanan kalkan, kayan tahta. Kinematik govde: kupleri iter, ona carpan top hizinin
// cogunu kaybeder ve kup kiramaz (top bosa gider). Zamanlamayi oyuncu tutturur.
const ENG = [];
const ENGTAH = canvasTex(256, 64, (x, w, h) => {
  x.fillStyle = '#b8783a'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) { x.strokeStyle = 'rgba(' + (i % 2 ? '120,70,30' : '220,160,95') + ',0.45)'; x.lineWidth = 1 + (i % 3); x.beginPath(); const y = (i * 37) % h; x.moveTo(0, y); x.bezierCurveTo(w * 0.3, y + 6, w * 0.6, y - 6, w, y + 2); x.stroke(); }
  x.fillStyle = 'rgba(70,38,14,0.55)'; x.fillRect(0, 0, w, 5); x.fillRect(0, h - 5, w, 5); x.fillRect(0, 0, 5, h); x.fillRect(w - 5, 0, 5, h);
  x.fillStyle = '#6f7680'; for (const px of [16, w - 16]) for (const py of [14, h - 14]) { x.beginPath(); x.arc(px, py, 5, 0, 7); x.fill(); }
});
const ENGM = { tahta: new THREE.MeshStandardMaterial({ map: ENGTAH, roughness: 0.72 }), kirmizi: new THREE.MeshStandardMaterial({ color: '#e8333f', roughness: 0.35, emissive: '#5a0010', emissiveIntensity: 0.25 }),
  beyaz: new THREE.MeshStandardMaterial({ color: '#fff6e8', roughness: 0.4 }), altin: new THREE.MeshStandardMaterial({ color: '#ffc531', roughness: 0.28, metalness: 0.65, emissive: '#6a4200', emissiveIntensity: 0.35 }) };
const KAPIEN = 508 / 512, KAPITEX = PTL.load('engel/kapi.webp?v=1'); KAPITEX.colorSpace = THREE.SRGBColorSpace; KAPITEX.anisotropy = 8;
ENGM.kapi = new THREE.MeshStandardMaterial({ map: KAPITEX, roughness: 0.6, metalness: 0.15 }); ENGM.demir = new THREE.MeshStandardMaterial({ color: '#4a4f58', roughness: 0.45, metalness: 0.7 });
function kapiSekil(w, h) {   // kemerli ust, resmin dis cizgisi; doku merkezden olculur
  const hw = w / 2, hh = h / 2, ar = h * 0.1, s = new THREE.Shape();
  s.moveTo(-hw, -hh); s.lineTo(hw, -hh); s.lineTo(hw, hh - ar); s.quadraticCurveTo(hw * 0.92, hh, 0, hh); s.quadraticCurveTo(-hw * 0.92, hh, -hw, hh - ar); s.lineTo(-hw, -hh);
  KAPITEX.repeat.set(1 / w, 1 / h); KAPITEX.offset.set(0.5, 0.5); return s;
}
// ================= v3.21 (Adem) anahtarli kapi ve giyotin =================
// Anahtarli kapi (?engel=kapi2; ?fon=yeni'de 9. bolum): arkada yuksek platformdaki yapi iki kanatli, tas cerceveli dev kapiyla ortulu.
// Ondeki kucuk yapida altin ANAHTAR KUP var; kup dusunce/kirilinca anahtar yay cizip kilide ucar, bir tur doner, klik, kanatlar iki yana kayar.
// Kapi kirilmaz; kapaliyken carpan top yavaslar ve kup kiramaz. Giyotin (?engel=giyotin; ?fon=yeni'de 14. bolum): ustten ve alttan dişli
// celik ceneler ortada birlesip yapiyi orter; kapanmadan once kirmizi parlama + sing sesi; kapaliyken carpan top parcalanir.
let AKUP = -1;
function anahtarBolum(Y0) {
  const m0 = Y0.make(), say = {}; for (const c of m0) say[c[4] || 0] = (say[c[4] || 0] || 0) + 1;
  let pa = 0; for (const k in say) if (say[k] > (say[pa] || 0)) pa = +k;
  const ana = m0.filter((c) => (c[4] || 0) === pa).map((c) => [c[0], c[1], c[2], c[3], 0]);
  const sik = {}; for (const c of ana) if (typeof c[3] === 'string' && c[3] !== 'altin') sik[c[3]] = (sik[c[3]] || 0) + 1;
  const rk = Object.keys(sik).sort((a, b) => sik[b] - sik[a]), r0 = rk[0] || 'tas', r1 = rk[1] || r0;
  const on = []; for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) for (let k = 0; k < 2; k++) on.push([i, j, k, (i + j) % 2 ? r1 : r0, 1]);
  const ai = on.findIndex((c) => c[0] === 1 && c[1] === 1 && c[2] === 1); on[ai][3] = 'altin';
  const Y = Object.assign({}, Y0, { anahtar: 1, don: 0, ek: (Y0.ek || 0) + 2, pl: [{ x: 0, z: 0 }, { x: 0, z: 0 }] });
  Y.make = () => ana.map((c) => c.slice()).concat(on.map((c) => c.slice())); Y.anahtarI = ana.length + ai;
  return Y;
}
function e2Ses(tip) {
  if (!AC) return; const o = out(), t = AC.currentTime;
  const ton = (f, v, d, ty, t0) => { const os = AC.createOscillator(), gg = AC.createGain(); os.type = ty || 'sine'; os.frequency.value = f; gg.gain.setValueAtTime(0.0001, t + (t0 || 0)); gg.gain.exponentialRampToValueAtTime(v, t + (t0 || 0) + 0.004); gg.gain.exponentialRampToValueAtTime(0.0001, t + (t0 || 0) + d); os.connect(gg); gg.connect(o); os.start(t + (t0 || 0)); os.stop(t + (t0 || 0) + d + 0.05); };
  if (tip === 'klik') { ton(2400, 0.25, 0.05, 'square'); ton(1600, 0.2, 0.08, 'triangle', 0.07); ton(900, 0.15, 0.12, 'sine', 0.07); }
  else if (tip === 'sing') { ton(2793, 0.12, 0.9); ton(4186, 0.06, 0.6); ton(3520, 0.05, 0.7, 'triangle'); }
  else if (tip === 'kapan') { ton(140, 0.35, 0.25, 'square'); ton(1900, 0.08, 0.35); play('tas', 0.5, 0.7); }
}
function anahtarMesh(s) {
  const g = new THREE.Group(), m = ENGM.altin;
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.3 * s, 0.09 * s, 10, 24), m); bow.position.z = 0.55 * s; bow.rotation.y = Math.PI / 2; g.add(bow);
  const sap = new THREE.Mesh(new THREE.CylinderGeometry(0.075 * s, 0.075 * s, 1.0 * s, 10), m); sap.rotation.x = Math.PI / 2; g.add(sap);
  for (const [z, h] of [[-0.42, 0.26], [-0.25, 0.18]]) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.07 * s, h * s, 0.1 * s), m); d.position.set(0, -h * s / 2, z * s); g.add(d); }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}
function kapiDoku() {
  return PTD.kapi || (PTD.kapi = canvasTex(256, 512, (x, w, h) => {
    const rk = ['#7a4a26', '#6c4021', '#85532b', '#71441f'];
    for (let i = 0; i < 4; i++) { x.fillStyle = rk[i]; x.fillRect(i * 64, 0, 64, h); x.strokeStyle = 'rgba(40,20,6,.35)'; x.lineWidth = 1.5;
      for (let k = 0; k < 6; k++) { const x0 = i * 64 + 6 + Math.random() * 52; x.beginPath(); x.moveTo(x0, 0); for (let y = 32; y <= h; y += 32) x.lineTo(x0 + (Math.random() - 0.5) * 5, y); x.stroke(); }
      x.fillStyle = 'rgba(25,12,4,.7)'; x.fillRect(i * 64, 0, 4, h); }
  }));
}
function kilitDoku() {
  return PTD.kilit || (PTD.kilit = canvasTex(128, 160, (x, w, h) => {
    const gg = x.createLinearGradient(0, 0, w, h); gg.addColorStop(0, '#fff3a8'); gg.addColorStop(0.5, '#f2bd3a'); gg.addColorStop(1, '#a8740e'); x.fillStyle = gg; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#7a4e08'; x.lineWidth = 8; x.strokeRect(4, 4, w - 8, h - 8);
    x.fillStyle = '#2a1a06'; x.beginPath(); x.arc(w / 2, h * 0.42, 17, 0, 6.283); x.fill(); x.beginPath(); x.moveTo(w / 2 - 9, h * 0.45); x.lineTo(w / 2 + 9, h * 0.45); x.lineTo(w / 2 + 14, h * 0.75); x.lineTo(w / 2 - 14, h * 0.75); x.fill();
    x.fillStyle = '#fff6c8'; for (const [a, b] of [[16, 16], [w - 16, 16], [16, h - 16], [w - 16, h - 16]]) { x.beginPath(); x.arc(a, b, 6, 0, 6.283); x.fill(); }
  }));
}
// kapi: E.grp merkezi kapinin alt-orta noktasi; kanatlar E.sol / E.sag
function kapi2Kur(E, grp, body) {
  const q = PLS[0], w = 2 * q.r + 0.5, h = Math.max(3, TOPY - q.cy + 0.6), z = q.z + q.rz + 0.45, demir = ENGM.demir;
  const tas = ptMat('#ffffff', 0.85, 0, { map: ptDoku('acik') }), ah = new THREE.MeshStandardMaterial({ map: kapiDoku(), roughness: 0.75 });
  kapiDoku().repeat.set(1, 1);
  E.x0 = 0; E.y0 = q.cy; E.z0 = z; E.w2 = w / 2; E.h = h; E.ky = h * 0.5;
  const kanat = (sg) => {
    const k = new THREE.Group(), ww = w / 2;
    const lv = new THREE.Mesh(new THREE.BoxGeometry(ww, h, 0.36), ah); lv.position.set(sg * ww / 2, h / 2, 0); lv.castShadow = lv.receiveShadow = true; k.add(lv);
    const uv = lv.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * ww / 2.4, uv.getY(i) * h / 4.8);
    const st = []; for (const fy of [0.14, 0.5, 0.86]) { const b = new THREE.Mesh(new THREE.BoxGeometry(ww - 0.1, 0.26, 0.46), demir); b.position.set(sg * ww / 2, h * fy, 0); b.castShadow = true; k.add(b); for (let xx = 0.3; xx < ww - 0.15; xx += 0.55) st.push([sg * xx, h * fy, 0.24]); }
    for (const fy of [0.32, 0.68]) for (let xx = 0.3; xx < ww - 0.15; xx += 0.9) st.push([sg * xx, h * fy, 0.19]);
    k.add(ptDizi(new THREE.SphereGeometry(0.08, 8, 6), ptMat('#9aa2ac', 0.3, 0.8), st));
    const ken = new THREE.Mesh(new THREE.BoxGeometry(0.16, h, 0.42), demir); ken.position.set(sg * 0.08, h / 2, 0); k.add(ken);
    grp.add(k); return k;
  };
  E.sol = kanat(-1); E.sag = kanat(1);
  const ck = 0.75, cer = [[-w / 2 - ck / 2, h / 2 + 0.1, ck, h + 0.2], [w / 2 + ck / 2, h / 2 + 0.1, ck, h + 0.2]];
  for (const [x, y, ww, hh] of cer) { const p = new THREE.Mesh(new THREE.BoxGeometry(ww, hh, 0.8), tas); p.position.set(x, y, -0.05); p.castShadow = p.receiveShadow = true; grp.add(p); }
  const ust = new THREE.Mesh(new THREE.BoxGeometry(w + 2 * ck + 0.3, 0.75, 0.9), tas); ust.position.set(0, h + 0.375, -0.05); ust.castShadow = true; grp.add(ust);
  const esik = new THREE.Mesh(new THREE.BoxGeometry(w + 2 * ck, 0.2, 0.9), tas); esik.position.set(0, 0.1 - 0.2, -0.05); grp.add(esik);
  grp.add(ptDizi(new THREE.BoxGeometry(0.95, 0.95, 0.95), demir, [[-w / 2 - ck / 2, h + 0.375, 0], [w / 2 + ck / 2, h + 0.375, 0], [-w / 2 - ck / 2, 0.25, 0], [w / 2 + ck / 2, 0.25, 0]]));
  const kil = new THREE.Group(), pl = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.25, 0.16), [ENGM.altin, ENGM.altin, ENGM.altin, ENGM.altin, ptMat('#ffffff', 0.3, 0.5, { map: kilitDoku(), emissive: '#6a4200', emissiveIntensity: 0.3 }), ENGM.altin]);
  kil.add(pl); const hl = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.07, 8, 20), ENGM.altin); hl.position.set(0, -0.85, 0.1); kil.add(hl);
  kil.position.set(0, E.ky, 0.3); grp.add(kil); E.kil = kil;
  engKutu(body, w / 2, h / 2, 0.3, 0, h / 2); body.position.set(0, q.cy, z); grp.position.set(0, q.cy, z);
  E.durum = 'kapali'; E.kup = cubes[AKUP] || null;
  if (E.kup) { const am = anahtarMesh(0.62); am.position.set(0, 0, S / 2 + 0.05); am.rotation.x = -Math.PI / 2; E.kup.mesh.add(am); E.kup.anahtar = E; E.km = am;
    const par = spr('#ffd23f', true, 0.55); par.scale.setScalar(S * 1.9); par.userData.shared = 0; E.par = par; }
}
function anahtarUc(c) {
  const E = c.anahtar; if (!E || E.durum !== 'kapali') return;
  if (E.km) c.mesh.remove(E.km);
  E.durum = 'uc'; E.ta = g.t; E.p0 = new THREE.Vector3().copy(c.body.position);
  E.p1 = new THREE.Vector3(E.x0, E.y0 + E.ky, E.z0 + 1.1); E.pc = E.p0.clone().lerp(E.p1, 0.5); E.pc.y = Math.max(E.p0.y, E.p1.y) + 3.5;
  E.key = anahtarMesh(1); scene.add(E.key); E.key.position.copy(E.p0); sfx('bonus'); burst(E.p0.clone(), '#ffd23f', 16, 6);
}
function kapi2Kare(E, t) {
  if (E.par) { if (E.durum === 'kapali' && E.kup && !E.kup.gone) { E.par.visible = true; E.par.position.copy(E.kup.body.position); E.par.material.opacity = 0.35 + 0.2 * Math.sin(t * 4); } else E.par.visible = false; }
  if (E.durum === 'kapali' || E.durum === 'acik') return;
  const k = t - E.ta, a = E.key;
  if (E.durum === 'uc') {
    const u = Math.min(1, k / 1.1), e = u * u * (3 - 2 * u), v = 1 - e;
    a.position.set(v * v * E.p0.x + 2 * v * e * E.pc.x + e * e * E.p1.x, v * v * E.p0.y + 2 * v * e * E.pc.y + e * e * E.p1.y, v * v * E.p0.z + 2 * v * e * E.pc.z + e * e * E.p1.z);
    a.rotation.set(0, (1 - e) * Math.PI * 4, 0); a.scale.setScalar(0.7 + 0.3 * e);
    if (u >= 1) { E.durum = 'gir'; E.ta = t; }
  } else if (E.durum === 'gir') {
    const u = Math.min(1, k / 0.3); a.position.z = E.p1.z - 0.75 * u; if (u >= 1) { E.durum = 'don'; E.ta = t; }
  } else if (E.durum === 'don') {
    const u = Math.min(1, k / 0.5); a.rotation.z = u * u * (3 - 2 * u) * Math.PI * 2;
    if (u >= 1) { E.durum = 'ac'; E.ta = t; e2Ses('klik'); buzz(40); shake = Math.max(shake, 0.35); world.removeBody(E.body); E.bgit = 1;
      const p = new THREE.Vector3(E.x0, E.y0 + E.ky, E.z0 + 0.4); burst(p, '#ffd23f', 28, 9); burst(p.clone().add(new THREE.Vector3(0, 0.6, 0)), '#fff2a0', 14, 6); }
  } else if (E.durum === 'ac') {
    const u = Math.min(1, k / 1.1), e = u * u * (3 - 2 * u), dx = E.w2 * 1.02 * e;
    E.sol.position.x = -dx; E.sag.position.x = dx; const s = Math.max(0.001, 1 - e * 1.4); E.kil.scale.setScalar(s); a.scale.setScalar(s);
    if (u >= 1) { E.durum = 'acik'; scene.remove(a); E.kil.visible = false; }
  }
}
function giyotinKur(E, grp, body, d) {
  const w = 2 * R + 0.8, zg = RZ + 1.0, ym = Math.min(TOPY / 2, 2.8), ht = TOPY + 0.5 - ym, hb = ym + 0.25, dis = 0.45, pit = 0.62;
  E.x0 = 0; E.y0 = 0; E.z0 = zg; E.ym = ym; E.ht = ht; E.hb = hb; E.dis = dis;
  E.To = 2.5 - 0.8 * d; E.Tc = 1.2 + 0.6 * d; E.P = E.To + 0.6 + 0.3 + E.Tc + 0.5;
  const celik = new THREE.MeshStandardMaterial({ color: '#c3ccd6', roughness: 0.28, metalness: 0.75, emissive: '#ff1a1a', emissiveIntensity: 0 }), celik2 = celik.clone(); celik2.color.set('#7f8994'); E.cm = celik; E.cm2 = celik2;
  const cene = (hh, ust) => {   // ust cene: disler asagi bakar (alt kenar y=0'da), alt cene: disler yukari
    const s = new THREE.Shape(), n = Math.max(2, Math.round(w / pit)), p = w / n;
    s.moveTo(-w / 2, ust ? hh : -hh); s.lineTo(w / 2, ust ? hh : -hh);
    for (let i = 0; i <= 2 * n; i++) { const uc = (i % 2 === 1) === !!ust; s.lineTo(w / 2 - i * p / 2, uc ? (ust ? -dis : dis) : 0); }
    s.lineTo(-w / 2, ust ? hh : -hh);
    const ge = new THREE.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 1 }); ge.translate(0, 0, -0.15);
    const m = new THREE.Group(), me = new THREE.Mesh(ge, ust ? celik : celik2); me.castShadow = true; m.add(me);
    for (const x of [-w / 3, 0, w / 3]) { const kb = new THREE.Mesh(new THREE.BoxGeometry(0.28, hh - 0.5, 0.42), ENGM.demir); kb.position.set(x, ust ? hh / 2 + 0.05 : -hh / 2 - 0.05, 0); m.add(kb); }
    const bant = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.28, 0.4), ENGM.altin); bant.position.y = ust ? hh - 0.3 : -hh + 0.3; m.add(bant);
    const rv = []; for (let x = -w / 2 + 0.4; x < w / 2 - 0.2; x += 0.8) rv.push([x, ust ? hh - 0.3 : -hh + 0.3, 0.22]);
    m.add(ptDizi(new THREE.SphereGeometry(0.08, 8, 6), ENGM.demir, rv));
    grp.add(m); return m;
  };
  E.ust = cene(ht, 1); E.alt = cene(hb, 0);
  const demir = ENGM.demir, ray = (x) => { const p = new THREE.Mesh(new THREE.BoxGeometry(0.4, TOPY + ht + 1.6 - GY, 0.55), demir); p.position.set(x, (GY + TOPY + ht + 1.6) / 2, 0); p.castShadow = true; grp.add(p); };
  ray(-w / 2 - 0.22); ray(w / 2 + 0.22);
  const ub = new THREE.Mesh(new THREE.BoxGeometry(w + 1.0, 0.5, 0.7), demir); ub.position.y = TOPY + ht + 1.6; grp.add(ub);
  const kasa = new THREE.Mesh(new THREE.BoxGeometry(w + 0.9, -GY - 0.05, 0.75), ptMat('#3c434c', 0.5, 0.5)); kasa.position.y = GY / 2 - 0.05; kasa.castShadow = true; grp.add(kasa);
  const ser = canvasTex(128, 32, (x, ww, hh) => { x.fillStyle = '#ffcc1a'; x.fillRect(0, 0, ww, hh); x.fillStyle = '#1a1a1a'; for (let i = -2; i < 10; i++) { x.beginPath(); x.moveTo(i * 16, hh); x.lineTo(i * 16 + 8, hh); x.lineTo(i * 16 + 16, 0); x.lineTo(i * 16 + 8, 0); x.fill(); } }, [w / 2, 1]);
  const sm = new THREE.Mesh(new THREE.BoxGeometry(w + 0.92, 0.22, 0.77), new THREE.MeshStandardMaterial({ map: ser, roughness: 0.6 })); sm.position.y = -0.16; grp.add(sm);
  engKutu(body, w / 2, ht / 2 + dis / 2, 0.25, 0, ht / 2 - dis / 2);
  const b2 = new CANNON.Body({ mass: 0, type: CANNON.Body.KINEMATIC, material: PM.plat }); b2.collisionFilterGroup = 8; engKutu(b2, w / 2, hb / 2 + dis / 2, 0.25, 0, -hb / 2 + dis / 2); E.body2 = b2; body.collisionFilterMask = b2.collisionFilterMask = 2;
  E.kir = 1; E.k = 1; E.dongu = -1;
}
// acik oran (1 acik, 0 kapali) ve evre
function giyAcik(E, t) {
  const f = t % E.P, a = E.To, b = a + 0.6, c = b + 0.3, e = c + E.Tc;
  if (f < a) return [1, 'acik', f]; if (f < b) return [1, 'uyari', f];
  if (f < c) { const u = (f - b) / 0.3; return [1 - u * u, 'kapan', f]; } if (f < e) return [0, 'kapali', f];
  const u = (f - e) / 0.5; return [u * u * (3 - 2 * u), 'acil', f];
}
function giyotinKare(E, t) {
  const [k, ev] = giyAcik(E, t), cyc = Math.floor(t / E.P), dt = Math.max(1e-3, t - (E.pt == null ? t - 0.016 : E.pt));
  E.k = k; E.ev = ev;
  if (ev === 'uyari' && E.dongu !== cyc) { E.dongu = cyc; e2Ses('sing'); }
  if (ev === 'kapali' && E.kpn !== cyc) { E.kpn = cyc; e2Ses('kapan'); buzz(25); }
  E.cm2.emissiveIntensity = E.cm.emissiveIntensity = ev === 'uyari' ? 0.35 + 0.35 * Math.sin(t * 40) : ev === 'kapan' ? 0.4 : 0;
  const yu = E.ym + 0.2 + (1 - k) * 0 + k * (E.ht + 0.7), ya = E.ym - 0.2 - k * (E.hb + 0.5);
  const vu = (yu - (E.pyu == null ? yu : E.pyu)) / dt, va = (ya - (E.pya == null ? ya : E.pya)) / dt; E.pyu = yu; E.pya = ya; E.pt = t;
  E.ust.position.y = yu; E.alt.position.y = ya;
  E.body.position.set(E.x0, yu, E.z0); E.body.velocity.set(0, vu, 0); E.body.aabbNeedsUpdate = true;
  E.body2.position.set(E.x0, ya, E.z0); E.body2.velocity.set(0, va, 0); E.body2.aabbNeedsUpdate = true;
  E.grp.position.set(E.x0, 0, E.z0);
}
function engCarp(E, ev) {
  const b = balls.find((q) => q.body === ev.body); if (!b || b.eng || E.durum === 'acik' || E.durum === 'ac') return;
  const p = new THREE.Vector3().copy(b.body.position);
  if (E.kir) {   // giyotin: top parcalanir, atis bosa gider
    b.eng = 1; b.hit = true; b.body.collisionFilterMask = 0; b.body.velocity.set(0, 0, 0); b.t = 99; b.mesh.visible = false;
    burst(p, '#cfd6de', 18, 8); burst(p, '#ffcc66', 8, 5); sfx('metal'); e2Ses('kapan'); buzz(30); shake = Math.max(shake, 0.15); return;
  }
  b.eng = 1; b.yavas = 1; b.hit = true; burst(p, '#ffe0a0', 8, 5); sfx('kir', 'ahsap2'); buzz(20);
}
const ENGKART = { kapi2: ['Anahtarlı Kapı', '🔑', 'Önce altın anahtar küpü düşür: anahtar kilide uçar, kapı açılır. Sonra arkadaki yapıyı da yık!'],
  giyotin: ['Giyotin', '⚔️', 'Çelik çeneler açılıp kapanır. Açıkken at! Kapalıyken çarpan top parçalanır. Kırmızı parlarsa kapanıyor.'] };
function yeniEngel() {
  if (K || TEST || Q.get('kart') === '0' || !g) return;
  if (!SV.gor) SV.gor = [];
  const e = ENG.find((q) => ENGKART[q.t] && !SV.gor.includes('e_' + q.t)); if (!e) return;
  const [ad, ic, ne] = ENGKART[e.t]; SV.gor.push('e_' + e.t); save();
  setTimeout(() => { modal('<div class="rib ys">YENİ ENGEL!</div><div style="font-size:72px;line-height:1.2;margin:8px 0">' + ic + '</div><h2>' + ad + '</h2><p>' + ne + '</p><button class="btn" id="yeok">Anladım!</button>');
    sfx('bonus'); buzz(25); $('yeok').onclick = () => { sfx('tik'); closeModal(); }; }, 450);
}
function engTemizle() { for (const e of ENG) { if (!e.bgit) world.removeBody(e.body); if (e.body2) world.removeBody(e.body2); if (e.par) scene.remove(e.par); if (e.key) scene.remove(e.key); scene.remove(e.grp); } ENG.length = 0; }
function engMesh(grp, geo, mat, x, y, z, rz) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (rz) m.rotation.z = rz; m.castShadow = true; grp.add(m); return m; }
function engKutu(body, hx, hy, hz, x, y, rz) { const q = new CANNON.Quaternion(); q.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), rz || 0); body.addShape(new CANNON.Box(new CANNON.Vec3(hx, hy, hz)), new CANNON.Vec3(x, y, 0), q); }
function engKur(L, Y) {
  engTemizle(); if (K || Q.has('engsiz')) return;
  const list = engelOf(L, Y), d = zorluk(L); if (!list.length) return;
  const zE = RZ + 1.9, yc = Math.max(S * 1.7, TOPY * 0.5);
  for (const e of list) {
    const grp = new THREE.Group(), body = new CANNON.Body({ mass: 0, type: CANNON.Body.KINEMATIC, material: PM.plat }), x0 = (e.x || 0) * R, hz = (e.hiz || 1);
    body.collisionFilterGroup = 8; const E = { t: e.t, body, grp, x0, y0: yc, z0: zE, w: 0, a: 0, ters: e.ters ? -1 : 1 };
    if (e.t === 'kurek') {
      const Lk = e.x ? Math.max(2.2, R * 0.46) : Math.max(2.6, Math.min(5.2, Math.max(R * 0.8, TOPY * 0.48))), kol = !e.x && d > 0.55 ? 3 : 2;
      for (let n = 0; n < kol; n++) { const a = n * Math.PI * 2 / kol, cx = Math.cos(a) * Lk / 2, cy = Math.sin(a) * Lk / 2;
        engMesh(grp, new THREE.BoxGeometry(Lk, 0.72, 0.34), ENGM.tahta, cx, cy, 0, a); engMesh(grp, new THREE.BoxGeometry(0.5, 0.8, 0.42), ENGM.kirmizi, Math.cos(a) * (Lk - 0.25), Math.sin(a) * (Lk - 0.25), 0, a);
        engKutu(body, Lk / 2, 0.36, 0.2, cx, cy, a); }
      const hub = engMesh(grp, new THREE.CylinderGeometry(0.5, 0.5, 0.62, 28), ENGM.altin, 0, 0, 0); hub.rotation.x = Math.PI / 2;
      engMesh(grp, new THREE.SphereGeometry(0.26, 16, 12), ENGM.kirmizi, 0, 0, 0.32);
      E.w = (1.15 + 0.55 * d) * hz;
    } else if (e.t === 'kalkan') {
      const yTop = TOPY + 1.4, lr = Math.max(2.5, yTop - yc); E.y0 = yTop;
      engMesh(grp, new THREE.CylinderGeometry(0.07, 0.07, lr, 8), ENGM.altin, 0, -lr / 2, 0); engKutu(body, 0.1, lr / 2, 0.1, 0, -lr / 2);
      const disk = engMesh(grp, new THREE.CylinderGeometry(1.35, 1.35, 0.26, 40), ENGM.kirmizi, 0, -lr, 0); disk.rotation.x = Math.PI / 2;
      const hal = engMesh(grp, new THREE.TorusGeometry(0.85, 0.12, 10, 40), ENGM.beyaz, 0, -lr, 0.14), kn = engMesh(grp, new THREE.TorusGeometry(1.35, 0.1, 10, 44), ENGM.altin, 0, -lr, 0);
      engMesh(grp, new THREE.SphereGeometry(0.3, 16, 12), ENGM.altin, 0, -lr, 0.16); engMesh(grp, new THREE.SphereGeometry(0.22, 16, 12), ENGM.altin, 0, 0, 0);
      engKutu(body, 1.3, 1.3, 0.16, 0, -lr);
      E.a = Math.asin(Math.min(0.9, (R * 0.72) / lr)); E.w = (1.05 + 0.5 * d) * hz;
    } else if (e.t === 'kapi') {
      // v3.19: dev kapi (Gemini resminden kalin 3B levha): ayakta durur, aralikla yukari kalkip acilir, inince topu durdurur
      const bw = e.gen || (R * 2 + 0.9), bh = TOPY + 0.7, ge = new THREE.ExtrudeGeometry(kapiSekil(bw * 0.97, bh * 0.97), { depth: 0.42, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.06, bevelSegments: 2, curveSegments: 10 });
      ge.translate(0, 0, -0.21); engMesh(grp, ge, [ENGM.kapi, ENGM.demir], 0, 0, 0);
      engKutu(body, bw / 2, bh / 2, 0.27, 0, 0);
      E.y0 = bh / 2 - 0.2; E.a = bh + 0.5; E.w = (0.85 + 0.4 * d) * hz;
    } else if (e.t === 'kapi2') { kapi2Kur(E, grp, body);
    } else if (e.t === 'giyotin') { giyotinKur(E, grp, body, d);
    } else {
      const bw = 2.7, bh = 1.9; engMesh(grp, new THREE.BoxGeometry(bw, bh, 0.32), ENGM.tahta, 0, 0, 0);
      engMesh(grp, new THREE.BoxGeometry(0.22, bh + 0.1, 0.38), ENGM.kirmizi, -bw / 2, 0, 0); engMesh(grp, new THREE.BoxGeometry(0.22, bh + 0.1, 0.38), ENGM.kirmizi, bw / 2, 0, 0);
      engMesh(grp, new THREE.BoxGeometry(bw, 0.16, 0.36), ENGM.altin, 0, bh / 2, 0); engMesh(grp, new THREE.BoxGeometry(bw, 0.16, 0.36), ENGM.altin, 0, -bh / 2, 0);
      engKutu(body, bw / 2 + 0.1, bh / 2 + 0.05, 0.2, 0, 0);
      E.a = Math.max(1.6, R * 0.72); E.w = (1.1 + 0.6 * d) * hz;
    }
    // top carpinca: hizinin cogu gider, artik kup kirmaz
    body.addEventListener('collide', (ev) => engCarp(E, ev));
    world.addBody(body); scene.add(grp); ENG.push(E); if (E.body2) { E.body2.addEventListener('collide', (ev) => engCarp(E, ev)); world.addBody(E.body2); }
  }
  engKare(0);
}
function engKare(t) {
  for (const E of ENG) {
    if (E.t === 'kapi2') { kapi2Kare(E, t); continue; } if (E.t === 'giyotin') { giyotinKare(E, t); continue; }
    const b = E.body; let x = E.x0, th = 0, vx = 0, wz = 0, y = E.y0, vy = 0;
    if (E.t === 'kapi') { const sn = Math.sin(E.w * t) * 1.7, k = Math.max(-1, Math.min(1, sn)); y = E.y0 + E.a * (0.5 + 0.5 * k); vy = Math.abs(sn) < 1 ? E.a * 0.85 * E.w * Math.cos(E.w * t) : 0; }
    else if (E.t === 'kurek') { th = E.ters * E.w * t; wz = E.ters * E.w; }
    else if (E.t === 'kalkan') { th = E.a * Math.sin(E.w * t); wz = E.a * E.w * Math.cos(E.w * t); }
    else { x = E.x0 + E.a * Math.sin(E.w * t); vx = E.a * E.w * Math.cos(E.w * t); }
    b.position.set(x, y, E.z0); b.quaternion.setFromAxisAngle(QZ, th); b.velocity.set(vx, vy, 0); b.angularVelocity.set(0, 0, wz); b.aabbNeedsUpdate = true;
    E.grp.position.set(x, y, E.z0); E.grp.rotation.set(0, 0, th);
  }
}
const QZ = new CANNON.Vec3(0, 0, 1);
// v1.5: (Adem) teneke kola kutusu: 11. bolumden sonra yaklasik 4 bolumde 1 (bolum numarasina bagli, hep ayni), yapinin en ust katinda
// 2 kup boyunda hafif teneke. Vurulunca ya da dusunce kopuklu kola fiskirir.
function kolaVar(L) { return Q.get('kola') !== '0' && L >= 11 && rnd3(L, 7, 3, 11) < 0.27; }
const KOLAYOK = new Set(['altin', 'yildiz', 'hediye', 'celik', 'fici', 'bomba', 'recel', 'cam', 'jole', 'buz']);
function kolaKoy(list, L) {
  if (!kolaVar(L) || !MOD.kola) return;
  const ust = new Map();
  for (const c of list) { const key = c[0] + ',' + c[2] + ',' + (c[4] || 0); ust.set(key, Math.max(ust.has(key) ? ust.get(key) : -1, c[1])); }
  let n = 0;
  for (const c of list) { if (n >= 14) break; const col = c[3];
    if (typeof col !== 'string' || col.startsWith('g_') || KEEP[col] || KOLAYOK.has(col) || SEK.TUR[col]) continue;
    if (ust.get(c[0] + ',' + c[2] + ',' + (c[4] || 0)) !== c[1]) continue;
    c[3] = 'kola'; n++; }
}
function kolaFis(c) {
  if (!c || !c.mesh || (g && c.fisT && g.t - c.fisT < 0.6)) return; if (g) c.fisT = g.t;
  const p = new THREE.Vector3().copy(c.body.position), up = new THREE.Vector3(0, 1, 0).applyQuaternion(c.mesh.quaternion);
  if (up.y < -0.2) up.negate();
  const tip = p.clone().addScaledVector(up, (c.h || S) * 0.5);
  for (let i = 0; i < 26; i++) {
    const kopuk = i % 3 === 0, m = spr(kopuk ? '#fff6e8' : (i % 2 ? '#6a2e0e' : '#3a1606'), false, kopuk ? 0.95 : 0.9);
    const v = up.clone().multiplyScalar(5 + Math.random() * 6).add(new THREE.Vector3((Math.random() - 0.5) * 3.2, Math.random() * 2, (Math.random() - 0.5) * 3.2));
    const s0 = kopuk ? 0.35 + Math.random() * 0.3 : 0.22 + Math.random() * 0.18; m.position.copy(tip);
    fx(m, 0.6 + Math.random() * 0.5, (o, k, dt) => { v.y -= 14 * dt; o.position.addScaledVector(v, dt); o.scale.setScalar(s0 * (kopuk ? 1 + k * 1.6 : 1)); o.material.opacity = (kopuk ? 0.95 : 0.9) * (1 - k * k); });
  }
  if (!window.KOLAM) window.KOLAM = new THREE.MeshPhysicalMaterial({ color: '#4a1a06', roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05, envMap: ENV, envMapIntensity: 1 });
  for (let i = 0; i < 12; i++) { const v = up.clone().multiplyScalar(4 + Math.random() * 6).add(new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 2, (Math.random() - 0.5) * 4)); damla(window.KOLAM, jarKit().blobGeo, tip.clone(), v, 0.15 + Math.random() * 0.22, '#5a2208', 0.1 + Math.random() * 0.12, i < 3); }
  const pf = spr('#fffaf0', true, 0.8); pf.position.copy(tip);
  fx(pf, 0.25, (o, k) => { o.scale.setScalar(0.6 + k * 1.6); o.material.opacity = 0.8 * (1 - k); });
  if (AC) { out(); play('yersu', 0.3, 1.6 + Math.random() * 0.2); }
}
function buildLevel() {
  clearLevel(); RZB = 0;
  let Y = levelOf(LV); AKUP = -1; if (!K && engelOf(LV, Y).some((e) => e.t === 'kapi2')) { Y = anahtarBolum(Y); AKUP = Y.anahtarI; }   // v3.21: anahtarli kapi bolumu: arkada kapili yapi, onde anahtar kuplu kucuk yapi
  const made = Y.make(), list = convertLevel(made, LV);
  list.forEach((c, n) => { c[4] = made[n][4] || 0; });
  if (!K) kolaKoy(list, LV);
  if (K) return K.kur(Y, list);   // v6.19: korsan hedefi (sal, gemi, kule) kendi platformunu kurar
  let PD = Y.pl || [{ x: 0, z: 0 }];
  // v3.10: (Adem 11 Kas) asansor platform: 5. bolumden sonra her 4 bolumde bir (5, 9, 13...) platform yavasca iner ve kalkar
  if (!Y.pl && !Y.don && asansorMu(LV)) PD = [{ x: 0, z: 0, asn: { a: 1.4, h: 0.85 } }];
  if (PD.length > 1 || PD[0].kay || PD[0].asn || PD[0].y) return buildMulti(Y, list, PD);
  let i0 = 1e9, i1 = -1e9, k0 = 1e9, k1 = -1e9; for (const c of list) { const o = olcu(c[3]); i0 = Math.min(i0, c[0] - o[0] + 0.5); i1 = Math.max(i1, c[0] + o[0] - 0.5); k0 = Math.min(k0, c[2] - o[2] + 0.5); k1 = Math.max(k1, c[2] + o[2] - 0.5); }
  const ci = (i0 + i1) / 2, ck = (k0 + k1) / 2;
  // platform yapiya gore: en uzak kup kosesinin hemen disi
  R = 0;
  for (const [i, , k, col] of list) { const o = olcu(col), x = (Math.abs(i - ci) + o[0]) * S, z = (Math.abs(k - ck) + o[2]) * S; R = Math.max(R, Math.hypot(x, z)); }
  R = Math.max(3.4, R + 0.3); RZ = R; TOPY = 0; for (const c of list) TOPY = Math.max(TOPY, (c[1] + olcu(c[3])[1]) * S);
  if (TEMA_YAPI[1] === 'sirk') {   // dikdortgen masa: yapinin her yanindan ~yarim kup bosluk
    let mx = 0, mz = 0; for (const [i, , k, col] of list) { const o = olcu(col); mx = Math.max(mx, (Math.abs(i - ci) + o[0]) * S); mz = Math.max(mz, (Math.abs(k - ck) + o[2]) * S); }
    // v6.12: (Adem) bolum 166'da kalan bloklar genis platformda yatip kaliyordu: kenar daraldi, kare platform sadece donen bolumde
    R = Math.max(3.6, mx + S * 0.5); RZ = Math.max(2.4, mz + S * 0.45); const kare = Y.don; if (kare) R = RZ = Math.max(R, RZ); setSirk(R, RZ, kare ? 'platform_3' : platAd(fonOf(LV)));   // v6.6: Adem'in platformlari   // v6.5: yapinin her yaninda genis kenar; donen platform kare
    DIRT.scale.set(6.4, 5, 1);
  }
  stage.scale.set(R / R0, 1, RZ / R0);
  while (platBody.shapes.length) platBody.removeShape(platBody.shapes[0]);
  platBody.quaternion.set(0, 0, 0, 1); platBody.angularVelocity.set(0, 0, 0); PANG = 0;
  if (TEMA_YAPI[1] === 'sirk') { platBody.addShape(new CANNON.Box(new CANNON.Vec3(R, 0.375, RZ)), new CANNON.Vec3(0, -0.375, 0)); platBody.addShape(new CANNON.Box(new CANNON.Vec3(0.55, (-GY - 0.75) / 2, 0.55)), new CANNON.Vec3(0, (GY - 0.75) / 2, 0)); }
  else if (KARE(TEMA_YAPI[1])) { platBody.addShape(new CANNON.Box(new CANNON.Vec3(R, PT / 2, R)), new CANNON.Vec3(0, -PT / 2, 0)); platBody.addShape(new CANNON.Box(new CANNON.Vec3(1.35, (-GY - PT) / 2, 1.35)), new CANNON.Vec3(0, (GY - PT) / 2, 0)); }
  else { platBody.addShape(new CANNON.Cylinder(R, R, PT, 32), new CANNON.Vec3(0, -PT / 2, 0)); platBody.addShape(new CANNON.Cylinder(1.05, 1.3, -GY - PT, 16), new CANNON.Vec3(0, (GY - PT) / 2, 0)); }
  POFI.z = RZ + 5.6; pedG.position.copy(POFI); PF.holder.position.copy(POFI); fit(); TC.aimYaw = TC.yaw = Math.PI + CAZ;
  PLS.push({ body: platBody, mesh: SIRK.mesh, leg: LEG, x: 0, z: 0, cx: 0, r: R, rz: RZ, kay: null, ph: 0, den: dengeMu(LV, Y) ? 1 : 0 }); platBody.position.set(0, 0, 0); LEG.position.set(0, 0, 0); if (SIRK.mesh) SIRK.mesh.position.set(0, 0, 0);
  addCubes(Y, list, () => [ci, ck, 0, 0]);
}
// v6.13: birden fazla ya da kayan platformlu bolum
function buildMulti(Y, list, PD) {
  const pn0 = platAd(fonOf(LV)), pn = MOD[pn0] ? pn0 : 'platform_sirk';
  const info = PD.map(() => ({ i0: 1e9, i1: -1e9, k0: 1e9, k1: -1e9 }));
  for (const c of list) { const f = info[c[4]], o = olcu(c[3]); f.i0 = Math.min(f.i0, c[0] - o[0] + 0.5); f.i1 = Math.max(f.i1, c[0] + o[0] - 0.5); f.k0 = Math.min(f.k0, c[2] - o[2] + 0.5); f.k1 = Math.max(f.k1, c[2] + o[2] - 0.5); }
  PD.forEach((d, n) => {
    const f = info[n]; f.ci = (f.i0 + f.i1) / 2; f.ck = (f.k0 + f.k1) / 2;
    const mx = (f.i1 - f.i0) / 2 * S + S / 2, mz = (f.k1 - f.k0) / 2 * S + S / 2;
    f.r = Math.max(2.2, mx + S * 0.5); f.rz = Math.max(1.9, mz + S * 0.45);
  });
  if (Y.anahtar) PD = [{ x: 0, z: -(info[1].rz + 1.7 + info[0].rz), y: 2 * S + 0.6 }, { x: 0, z: 0 }];   // v3.21: kapili yapi arkada ve yukarida, anahtar yapisi onde
  // v3.19: (Adem) resim fonda ana platform (ortadaki) zemin alaninin tam ortasinda; digerleri yan yana degil, onun ARKASINDA ve biraz yukarida
  // (bot testi: arkaya dizince 4. bolum belirgin zorlasti; zorluk degismesin diye yalniz &dizi=arka ile karsilastirma icin acik)
  if (FONYENI && Q.get('dizi') === 'arka' && PD.length > 1) {
    let m = 0; PD.forEach((d, n) => { if (Math.abs(d.x || 0) < Math.abs(PD[m].x || 0) - 0.01) m = n; });
    const hy = PD.map(() => 0); for (const c of list) hy[c[4]] = Math.max(hy[c[4]], (c[1] + olcu(c[3])[1]) * S);   // her platformdaki yapinin yuksekligi
    let zb = -info[m].rz, yb = 0, hb = hy[m]; const yeni = PD.map((d) => ({ ...d }));
    Object.assign(yeni[m], { x: 0, z: 0, y: 0 });
    // arkadaki, ondeki yapinin yarisindan biraz yukarida durur: ust kismi her zaman gorunur, nisan alinabilir
    PD.forEach((d, n) => { if (n === m) return; const z = zb - 1.1 - info[n].rz; yb = Math.max(yb + 1.5, yb + hb * 0.55); Object.assign(yeni[n], { x: 0, z, y: yb }); zb = z - info[n].rz; hb = hy[n]; });
    PD = yeni;
  }
  TOPY = 0;
  for (const c of list) TOPY = Math.max(TOPY, (c[1] + olcu(c[3])[1]) * S + ((PD[c[4]] && PD[c[4]].y) || 0));
  R = 0; RZ = 0; RZB = 0;
  PD.forEach((d, n) => { const f = info[n]; R = Math.max(R, Math.abs(d.x || 0) + f.r + (d.kay ? d.kay.a : 0)); RZ = Math.max(RZ, Math.abs(d.z || 0) + f.rz); RZB = Math.max(RZB, -(d.z || 0) + f.rz); });
  if (FONYENI) RZ = Math.max(...PD.map((d, n) => (d.z || 0) + info[n].rz));   // on kenar: yalniz ana platform (araba, engel, atis kenari buna gore)
  setSirk(info[0].r, info[0].rz, pn);
  platShapes(platBody, info[0].r, info[0].rz); platBody.quaternion.set(0, 0, 0, 1); platBody.angularVelocity.set(0, 0, 0); PANG = 0;
  PD.forEach((d, n) => {
    const x = d.x || 0, z = d.z || 0, f = info[n]; let q;
    if (n === 0) q = { body: platBody, mesh: SIRK.mesh, leg: LEG };
    else {
      const body = new CANNON.Body({ mass: 0, material: PM.plat }); body.collisionFilterGroup = 4; platShapes(body, f.r, f.rz); world.addBody(body);
      const mesh = new THREE.Mesh(fitPlatRect(pn, f.r, f.rz), MOD[pn].mat); mesh.castShadow = mesh.receiveShadow = true; scene.add(mesh);
      const leg = LEG.clone(); leg.visible = true; scene.add(leg); q = { body, mesh, leg };
    }
    const yb = d.y || 0; Object.assign(q, { x, z, cx: x, r: f.r, rz: f.rz, kay: d.kay || null, ph: d.ph || 0, asn: d.asn || null, ah: 0, cy: yb, yb }); if (q.leg) legBoy(q.leg, yb);
    q.body.position.set(x, yb, z); if (q.mesh) q.mesh.position.set(x, yb, z); q.leg.position.set(x, 0, z);
    PLS.push(q);
  });
  DIRT.scale.set(6.4, 5, 1);
  fit(); TC.aimYaw = TC.yaw = Math.PI + CAZ;
  addCubes(Y, list, (n) => [info[n].ci, info[n].ck, PD[n].x || 0, PD[n].z || 0, PD[n].y || 0]);
}
function addCubes(Y, list, ctr) {
  for (let [i, j, k, col, pn] of list) {
    col = NOMETAL[col] || col;
    const [ci, ck, ox, oz, oy] = ctr(pn);
    const kd = col[0] === '#' ? null : KIND[col], mg = fitCube(kd ? col : 'kup'), isF = col === 'fici' && !mg;
    const pm = kd ? (kd.pm || (kd.pm = new CANNON.Material({ friction: kd.f, restitution: kd.r }))) : PM.cube;
    const body = new CANNON.Body({ mass: (kd ? kd.mass : 1) * KAGIR, material: pm, sleepSpeedLimit: 0.25, sleepTimeLimit: 0.4, linearDamping: 0.03, angularDamping: 0.16 });   // v6.8: 3 kat agir, kolay donmez
    const sk = kd && kd.sek ? SEK.al(col) : null;   // v3.1: kodla cizilen sekil
    const isE = kd && kd.esya, gl = kd && kd.cam, kp = KEEP[col] && MOD[col] ? fitKeep(col) : null, ghh = sk ? sk.h : gl ? glassInfo(gl).hh : kp ? MOD[col].dim.h : S;
    body.addShape(sk ? sekShape(col) : gl ? glassShape(gl) : kp ? keepShape(col) : isF || isE ? FICISHAPE : CUBESHAPE); body.position.set(ox + (i - ci) * S, (oy || 0) + ghh / 2 + j * (S + 0.002), oz + (k - ck) * S);
    if (isE) body.quaternion.setFromEuler(0, (Math.random() - 0.5) * 0.5, 0);
    world.addBody(body); body.sleep();
    const mesh = sk ? new THREE.Mesh(sk.geo, sk.mat) : gl ? makeGlass(gl) : kp ? new THREE.Mesh(kp, MOD[col].mat) : isE ? makeJar() : mg ? new THREE.Mesh(mg, kd ? MOD[col].mat : kupModelMat(col)) : new THREE.Mesh(isF ? FICIGEO : CUBEGEO, kd ? kindMat(col) : kupMat(col)); mesh.castShadow = !gl; mesh.receiveShadow = col !== 'cam' && !gl; scene.add(mesh);
    if (!sk && !gl && !isE && (mg || kp)) { mesh.castShadow = false; const d = kp ? MOD[col].dim : null, sp = new THREE.Mesh(SHBOX, GOLGEM); sp.scale.set(d ? d.w * 0.94 : S * 0.96, d ? d.h : S * 0.98, d ? d.d * 0.94 : S * 0.96); sp.castShadow = true; sp.frustumCulled = false; mesh.add(sp); }   // v2.0: golge gecisinde 5-10 bin ucgen yerine 12 ucgen
    const c = { body, mesh, col, kind: kd ? col : null, gone: false, out: false, h: ghh, pi: pn || 0, sek: sk };
    // kirilan/patlayan: carpisma olayi adimin icinde gelir, isi adimdan sonra yapilir (FUSE)
    if (kd && (kd.kir || kd.boom)) body.addEventListener('collide', (e) => {
      if (!g || !g.armed || c.out || c.fuse != null || (c.gone && !kd.esya)) return;   // dusen kavanoz yerde de kirilir
      if (Math.abs(e.contact.getImpactVelocityAlongNormal()) > (kd.kir || 3.2)) { c.fuse = 0; FUSE.push(c); }
    });
    cubes.push(c); CUBE_OF.set(body, c);
    // v6.14: (Adem) dusen kup yere degdigi an kirilsin, sekip sonradan patlamasin: zemine/ayaga (sabit govde) temas aninda isaretlenir
    body.addEventListener('collide', (e) => { if (c.gone && !c.landed && e.body.mass === 0 && c.body.position.y < -1.5) c.yer = true; });
    body.addEventListener('collide', (e) => { if (!KAL()) return; const vn = Math.abs(e.contact.getImpactVelocityAlongNormal()); c.vimp = Math.max(c.vimp || 0, vn); darbeSesi(c, vn); });
  }
  syncMeshes();
  g = { don: Y.don || 0, L: LV, ad: Y.ad, total: cubes.length, left: cubes.length, shots: shotsFor(cubes.length, Y), max: shotsFor(cubes.length, Y), state: 'play', t: 0, busy: 0, quiet: 0, combo: null, armed: false, bonus: 0, gold: 0 };
  FUSE.length = 0;
  if (K) K.sahne(); else { const tm = TEMA_YAPI, fo = fonOf(LV); $('bg').style.backgroundImage = 'url(fon/' + (fo.yeni ? 'yeni/' + fo.r + '.webp?v=1' : fo.f + (BOSFON.has(fo.f) && !fo.vid ? '_bos.webp?v=1' : '.webp?v=2')) + ')'; $('bg').style.backgroundSize = fo.bs || ''; $('bg').style.backgroundPosition = fo.bp || ''; $('bg').classList.toggle('koyu', !!fo.yeni && LV % 5 === 0); setPlat(tm[1]); setDirt(fo); setSea(fo); if (fo.yeni) DIRT.visible = false; canliFon(fo.yeni ? { f: fo.f, vid: 1 } : fo); videoFon(fo); fonIsi(fo); for (const q of PLS) if (q.yb && q.leg) legBoy(q.leg, q.yb); if (fo.yeni) temaKur(); }   // v6.11: (Adem) karli koyde platform koyun icinde duruyordu: fon buyuyup koy yukari, platformun arkasina alindi
  const nm = $('nm'); nm.innerHTML = '<div class="rb1"><small>BÖLÜM ' + LV + '</small><b>' + Y.ad + '</b></div>'; nm.classList.remove('on'); void nm.offsetWidth; nm.classList.add('on'); $('hint').style.opacity = 1;
  hud(true);
}
// v6.26: (Adem 8 Kas) sahil fonu canli: Adem'in sahil resminden yaptigi 10 sn'lik video (bas/son 1 sn karistirilip kesintisiz 9 sn donguye cevrildi).
// Resim altta kalir (video yuklenene kadar o gorunur); videoda dalga, bulut, kus kendisi hareket ettigi icin cizili martilar kapali.
function videoFon(fo) {
  const bg = $('bg'), v = $('bgv'); if (!v) return;
  if (!fo.vid) { bg.classList.remove('vid'); v.pause(); return; }
  if (v.dataset.f !== fo.vid) { v.dataset.f = fo.vid; v.innerHTML = (fo.mp4 ? '' : '<source src="fon/' + fo.vid + '.webm?v=1" type="video/webm; codecs=vp9">') + '<source src="fon/' + fo.vid + '.mp4?v=2" type="video/mp4">'; v.load(); }
  const zm = /auto (\d+)%/.exec(fo.bs || '');   // v1.7: kar fonu resimdeki gibi alta yasli ve buyutulmus (auto 135%)
  v.style.top = zm ? 'auto' : ''; v.style.height = zm ? zm[1] + '%' : ''; v.style.objectPosition = zm ? '50% 100%' : '';
  v.muted = true; bg.classList.add('vid'); const r = v.play(); if (r && r.catch) r.catch(() => {});
  if (!v._d) { v._d = 1; addEventListener('pointerup', () => { if (bg.classList.contains('vid') && v.paused) v.play().catch(() => {}); }, { passive: true }); }   // otomatik oynatma engellenirse ilk dokunusta
}
// v6.1: top sayisi blok sayisina gore (her sey kirildigi icin yaklasik 5 bloga 1 top, en az 6, en cok 16)
function shotsFor(n, Y) {
  if (K) return Math.max(7, Math.min(18, Math.round(n / 4.5) + 2));
  // Blok Smash 2. asama: top artik ilk carpista yavasladigi icin taban biraz yukarida; bolum ilerledikce %15'e kadar azalir, her engel +1 top
  const taban = Math.max(8, Math.min(24, Math.round((n / 3.6 + 3) * (1 - 0.15 * zorluk(LV))) + engelOf(LV, Y).length));
  // v2.0: denge (bot testleri): ilk bolum kolay; cok bloklu bolumde top basina en cok 4,6 blok; saglam malzemeli bolume ek top
  let sert = 0; for (const c of cubes) if (c.kind === 'tugla' || c.kind === 'altin' || c.kind === 'tas' || c.kind === 'alevUzun' || (c.kind && SEK.TUR[c.kind] && SEK.TUR[c.kind].sert)) sert++;
  return Math.min(36, Math.max(taban, Math.ceil(n / 4.6)) + (LV === 1 ? 3 : 0) + (sert / Math.max(1, n) > 0.6 ? 3 : 0) + ((Y && Y.ek) || 0));   // v1.3: darbe yumusadi, top biraz artti
}
// v6.13: (Adem) referanstaki gibi birden fazla platform ve saga sola kayan platform.
// PLS[0] eski platform (platBody, SIRK.mesh, LEG); digerleri her bolumde yeniden kurulur.
// Kayan platform elle tasinir; ustundeki (dusmemis) kupler de ayni miktar kayar, uyuyanlar uyanmaz.
const PLS = [];
function clearPX() { temaSil(); for (let i = PLS.length - 1; i >= 1; i--) { const q = PLS[i]; world.removeBody(q.body); scene.remove(q.mesh); scene.remove(q.leg); q.mesh.geometry.dispose(); } PLS.length = 0; }
function platShapes(body, r, rz) {
  while (body.shapes.length) body.removeShape(body.shapes[0]);
  body.addShape(new CANNON.Box(new CANNON.Vec3(r, 0.375, rz)), new CANNON.Vec3(0, -0.375, 0));
  body.addShape(new CANNON.Box(new CANNON.Vec3(0.55, (-GY - 0.75) / 2, 0.55)), new CANNON.Vec3(0, (GY - 0.75) / 2, 0));
}
function slide(dt) {
  for (let n = 0; n < PLS.length; n++) {
    const q = PLS[n]; if (!q.kay && !q.asn) continue;
    if (q.kay) {
      q.ph += dt * q.kay.h; const nx = q.x + q.kay.a * Math.sin(q.ph), dx = nx - q.cx; q.cx = nx;
      if (dx) { q.body.position.x += dx; q.body.aabbNeedsUpdate = true; if (q.mesh) q.mesh.position.x += dx;
        for (const c of cubes) { if (c.pi !== n || c.gone || c.out) continue; c.body.position.x += dx; c.body.aabbNeedsUpdate = true; } }
    }
    if (q.asn) {   // v3.10: asansor: once asagi iner, yavasca geri kalkar (yumusak kosinus); direk boyu da birlikte kisalir/uzar
      q.ah += dt * q.asn.h; const ny = (q.yb || 0) - q.asn.a * (1 - Math.cos(q.ah)) / 2, dy = ny - q.cy; q.cy = ny;
      if (dy) { q.body.position.y += dy; q.body.aabbNeedsUpdate = true; if (q.mesh) q.mesh.position.y += dy; legBoy(q.leg, ny);
        for (const c of cubes) { if (c.pi !== n || c.gone || c.out) continue; c.body.position.y += dy; c.body.aabbNeedsUpdate = true; } }
    }
  }
}
// v6.5: (Adem) bazi bolumlerde platform 360 derece doner. Platform kinematik govde: uyanik kupleri surtunmeyle tasir;
// uyuyan (henuz dokunulmamis) kupler platformla birlikte elle dondurulur, boylece yapi dagilmadan butun olarak doner.
let PANG = 0; const QSPIN = new CANNON.Quaternion(), QAX = new CANNON.Vec3(0, 1, 0);
function spin(dt) {
  const w = (g && g.don) || 0; if (!w) return;
  // platform statik govde, elle dondurulur (uyuyan kupleri uyandirmaz); platformdaki her kup (uyuyan ya da hareketli) donen
  // cerceveyle birlikte tasinir, hizi da doner. Platformdan dusen (gone) kup artik donmez.
  const a = w * dt; PANG += a; QSPIN.setFromAxisAngle(QAX, a); const ca = Math.cos(a), sa = Math.sin(a);
  platBody.quaternion = QSPIN.mult(platBody.quaternion); platBody.aabbNeedsUpdate = true;
  const rot = (v) => { const x = v.x, z = v.z; v.x = x * ca + z * sa; v.z = -x * sa + z * ca; };
  for (const c of cubes) { if (c.gone || c.out || c.pi) continue; const b = c.body; rot(b.position); rot(b.velocity); b.quaternion = QSPIN.mult(b.quaternion); b.aabbNeedsUpdate = true; }
}
// ================= v3.20 (Adem) ?fon=yeni platform temalari =================
// Ust: dunyaya gore dokulu kutu (ahsap, tas, seker, buz, altin, kemik) + kenar cercevesi; ayak: kodla 3B Group.
// Ayak tipleri: piston (koy), tas ayak (col), lolipop (seker), buz sutun (buz), halat direk (gun batimi), tas+altin (volkan),
// kemik (gece), altin cift sutun (magara). Asansorde makas (koyda piston) kollar acilip kapanir, donen platformda disli doner.
// Fizik govdeleri (platShapes, platBody) DEGISMEZ; yalniz gorunum. Eski gorunum (fon=yeni yok) aynen kalir.
// Denge tahtasi: tek ayak ustunde ince tahta; ustteki yuk bir yana kayinca en cok ~3 derece egilir (kinematik, kupler birlikte doner).
const PTEM = {
  koy: { ust: 'ahsap', kenar: '#d9a441', ayak: 'piston', mk: '#e0a63a' },
  col: { ust: 'tas', kenar: '#9a6a36', ayak: 'tas', mk: '#c8823a' },
  seker: { ust: 'seker', kenar: '#ffffff', ayak: 'lolipop', mk: '#ff6fae' },
  buz: { ust: 'buz', kenar: '#e8fbff', ayak: 'buz', mk: '#7fd4f5' },
  gunbatimi: { ust: 'ahsap', kenar: '#6e4220', ayak: 'halat', mk: '#b8763a' },
  volkan: { ust: 'acik', kenar: '#ffc93a', ayak: 'volkan', mk: '#ffc93a' },
  gece: { ust: 'kemik', kenar: '#cfc4a8', ayak: 'kemik', mk: '#d8cdb0' },
  magara: { ust: 'altin', kenar: '#fff0a0', ayak: 'altin', mk: '#ffc93a' }
};
const DENGE_MAX = 0.06;
const PTD = {}, PTMAT = {};
function ptMat(renk, ro, me, o) {
  const k = renk + ro + me + Object.entries(o || {}).map(([a, v]) => a + (v && v.isTexture ? v.uuid : v)).join();
  return PTMAT[k] || (PTMAT[k] = new THREE.MeshStandardMaterial(Object.assign({ color: renk, roughness: ro, metalness: me }, o || {})));
}
function ptDoku(ad) {
  if (PTD[ad]) return PTD[ad];
  const R = (a, b) => a + Math.random() * (b - a);
  const t = canvasTex(256, 256, (x, w, h) => {
    if (ad === 'ahsap' || ad === 'kemik') {
      const rk = ad === 'ahsap' ? ['#b0743a', '#9c6331', '#c3874c', '#a86d37'] : ['#f1e7cd', '#e4d7b6', '#f7f0de', '#eadfc2'];
      for (let i = 0; i < 4; i++) {
        x.fillStyle = rk[i]; x.fillRect(0, i * 64, w, 64);
        x.strokeStyle = ad === 'ahsap' ? 'rgba(70,35,10,.3)' : 'rgba(130,110,80,.25)'; x.lineWidth = 1.5;
        for (let k = 0; k < 7; k++) { const y0 = i * 64 + R(6, 58); x.beginPath(); x.moveTo(0, y0); for (let s = 32; s <= w; s += 32) x.lineTo(s, y0 + R(-3, 3)); x.stroke(); }
        x.fillStyle = ad === 'ahsap' ? 'rgba(45,22,6,.6)' : 'rgba(110,90,60,.45)'; x.fillRect(0, i * 64, w, 3);
        const ek = (i % 2) * 128 + 64; x.fillRect(ek, i * 64, 3, 64);
        x.fillStyle = ad === 'ahsap' ? '#4a3426' : '#a08c66';
        for (const sx of [ek - 9, ek + 12]) for (const sy of [i * 64 + 12, i * 64 + 52]) { x.beginPath(); x.arc(sx, sy, 3, 0, 6.283); x.fill(); }
      }
    } else if (ad === 'tas' || ad === 'acik') {
      const b = ad === 'tas' ? [216, 180, 122] : [205, 200, 192];
      x.fillStyle = ad === 'tas' ? '#8a6a40' : '#7a7670'; x.fillRect(0, 0, w, h);
      for (let r = 0; r < 4; r++) for (let c = -1; c < 2; c++) {
        const ox = c * 128 + (r % 2) * 64, v = R(-14, 14);
        x.fillStyle = 'rgb(' + (b[0] + v) + ',' + (b[1] + v) + ',' + (b[2] + v) + ')'; x.fillRect(ox + 3, r * 64 + 3, 122, 58);
        x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(ox + 3, r * 64 + 3, 122, 5);
        x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(ox + 3, r * 64 + 56, 122, 5);
      }
      for (let i = 0; i < 500; i++) { x.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.12)'; x.fillRect(R(0, w), R(0, h), R(1, 4), R(1, 3)); }
    } else if (ad === 'seker') {
      x.fillStyle = '#ff8cc0'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#fff3f8'; for (let i = -4; i < 8; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64 + 32, 0); x.lineTo(i * 64 + 32 + h, h); x.lineTo(i * 64 + h, h); x.fill(); }
      const sk = ['#ffd23f', '#6fd3ff', '#8be36b', '#b78cff', '#ff5a5a'];
      for (let i = 0; i < 60; i++) { x.save(); x.translate(R(0, w), R(0, h)); x.rotate(R(0, 3.14)); x.fillStyle = sk[i % 5]; x.fillRect(-7, -2.5, 14, 5); x.restore(); }
    } else if (ad === 'buz') {
      const gg = x.createLinearGradient(0, 0, w, h); gg.addColorStop(0, '#e6fbff'); gg.addColorStop(0.5, '#b4e6f8'); gg.addColorStop(1, '#d4f4ff'); x.fillStyle = gg; x.fillRect(0, 0, w, h);
      x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 2;
      for (let i = 0; i < 9; i++) { let px = R(0, w), py = R(0, h); x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 4; k++) { px += R(-40, 40); py += R(-40, 40); x.lineTo(px, py); } x.stroke(); }
      x.fillStyle = 'rgba(120,190,225,.25)'; for (let i = 0; i < 14; i++) { x.beginPath(); x.ellipse(R(0, w), R(0, h), R(8, 30), R(4, 12), R(0, 3), 0, 6.283); x.fill(); }
    } else if (ad === 'altin') {
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        const ox = c * 64, oy = r * 64, gg = x.createLinearGradient(ox, oy, ox + 64, oy + 64);
        gg.addColorStop(0, '#fff2a6'); gg.addColorStop(0.45, '#f4c542'); gg.addColorStop(1, '#b07d18'); x.fillStyle = gg; x.fillRect(ox, oy, 64, 64);
        x.strokeStyle = '#8a5e10'; x.lineWidth = 3; x.strokeRect(ox + 1.5, oy + 1.5, 61, 61);
        x.fillStyle = '#fff6c8'; x.beginPath(); x.arc(ox + 32, oy + 32, 6, 0, 6.283); x.fill();
      }
    } else if (ad === 'serit') {
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.fillStyle = '#ff4f93';
      for (let i = -4; i < 12; i++) { x.beginPath(); x.moveTo(0, i * 32); x.lineTo(w, i * 32 - 60); x.lineTo(w, i * 32 - 44); x.lineTo(0, i * 32 + 16); x.fill(); }
    } else if (ad === 'girdap') {
      x.fillStyle = '#fff6fa'; x.fillRect(0, 0, w, h); const rk = ['#ff4f93', '#ffd23f', '#6fd3ff'];
      for (let k = 0; k < 3; k++) { x.strokeStyle = rk[k]; x.lineWidth = 14; x.beginPath(); for (let a = 0; a < 18; a += 0.1) { const rr = a * 6.8, aa = a + k * 2.094; x.lineTo(w / 2 + Math.cos(aa) * rr, h / 2 + Math.sin(aa) * rr); } x.stroke(); }
    }
  }, [1, 1]);
  return (PTD[ad] = t);
}
function ptMesh(geo, mat, x, y, z, gol) { const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); if (gol !== 0) m.castShadow = true; m.receiveShadow = true; return m; }
function ptDizi(geo, mat, pos, rot) {
  const im = new THREE.InstancedMesh(geo, mat, pos.length), o = new THREE.Object3D();
  pos.forEach((p, i) => { o.position.set(p[0], p[1], p[2]); o.rotation.set(rot ? rot[0] : 0, p[3] || 0, rot ? rot[2] : 0); o.scale.setScalar(p[4] || 1); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
  im.castShadow = false; im.receiveShadow = true; return im;
}
function ptUst(tm, rx, rz, th) {
  const g = new THREE.Group(), d = ptDoku(tm.ust), geo = new THREE.BoxGeometry(2 * rx, th, 2 * rz), uv = geo.attributes.uv;
  const sc = [[rz, th / 2], [rz, th / 2], [rx, rz], [rx, rz], [rx, th / 2], [rx, th / 2]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * sc[f][0], uv.getY(i) * sc[f][1]); }
  const parla = tm.ust === 'altin', buz = tm.ust === 'buz';
  const ust = ptMat('#ffffff', parla ? 0.3 : buz ? 0.18 : 0.75, parla ? 0.45 : 0, { map: d, emissive: buz ? '#4aa8d8' : parla ? '#6a4a00' : '#000000', emissiveIntensity: buz ? 0.18 : parla ? 0.25 : 0 });
  const yan = ptMat('#c9c2b8', parla ? 0.3 : 0.8, parla ? 0.45 : 0, { map: d, emissive: buz ? '#4aa8d8' : '#000000', emissiveIntensity: buz ? 0.15 : 0 });
  g.add(ptMesh(geo, [yan, yan, ust, yan, yan, yan], 0, -th / 2, 0));
  const km = ptMat(tm.kenar, parla || tm.kenar === '#d9a441' || tm.kenar === '#ffc93a' ? 0.3 : 0.6, parla || tm.kenar === '#d9a441' || tm.kenar === '#ffc93a' ? 0.5 : 0), kb = 0.17, ky = -0.07;
  g.add(ptMesh(new THREE.BoxGeometry(2 * rx + 2 * kb, kb, kb), km, 0, ky, rz + kb / 2 - 0.02, 0), ptMesh(new THREE.BoxGeometry(2 * rx + 2 * kb, kb, kb), km, 0, ky, -rz - kb / 2 + 0.02, 0));
  g.add(ptMesh(new THREE.BoxGeometry(kb, kb, 2 * rz), km, rx + kb / 2 - 0.02, ky, 0, 0), ptMesh(new THREE.BoxGeometry(kb, kb, 2 * rz), km, -rx - kb / 2 + 0.02, ky, 0, 0));
  const kose = [[rx, rz], [-rx, rz], [rx, -rz], [-rx, -rz]];
  if (tm.ust === 'ahsap' || tm.ust === 'altin' || tm.ust === 'acik') g.add(ptDizi(new THREE.BoxGeometry(0.34, th + 0.06, 0.34), ptMat(tm.ust === 'ahsap' && tm.kenar !== '#d9a441' ? '#4a3020' : '#ffc93a', 0.3, 0.5), kose.map(([a, b]) => [a, -th / 2 + 0.02, b])));
  if (tm.ust === 'altin') g.add(ptDizi(new THREE.OctahedronGeometry(0.2), ptMat('#ff2f5a', 0.15, 0.2, { emissive: '#a0002a', emissiveIntensity: 0.4 }), kose.map(([a, b]) => [a, 0.12, b])));
  if (tm.ust === 'kemik') g.add(ptDizi(new THREE.SphereGeometry(0.22, 10, 8), ptMat('#efe6cf', 0.7, 0), kose.map(([a, b]) => [a, -0.02, b])));
  if (buz || tm.ust === 'seker') {   // on ve arka kenardan sarkan buz salkimlari / seker damlalari
    const p = []; for (const zz of [rz + 0.06, -rz - 0.06]) for (let xx = -rx + 0.25; xx < rx - 0.1; xx += buz ? 0.42 : 0.55) p.push([xx + Math.sin(xx * 7) * 0.08, -th - 0.02, zz, 0, 0.7 + 0.5 * Math.abs(Math.sin(xx * 3.7))]);
    g.add(buz ? ptDizi(new THREE.ConeGeometry(0.1, 0.5, 6).translate(0, 0.25, 0), ptMat('#dff7ff', 0.12, 0, { transparent: true, opacity: 0.85, emissive: '#5ab8e0', emissiveIntensity: 0.25 }), p, [Math.PI, 0, 0])
      : ptDizi(new THREE.SphereGeometry(0.17, 10, 8).scale(1, 1.5, 1), ptMat('#ffffff', 0.5, 0), p.map((q) => [q[0], -th * 0.55, q[2], 0, q[4]])));
  }
  return g;
}
function disliGeo(r, n, d) {
  const s = new THREE.Shape(), ri = r * 0.8;
  for (let i = 0; i < n * 4; i++) { const a = (i + 0.5) / (n * 4) * 6.283, rr = [ri, r, r, ri][i % 4]; if (i) s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  const del = new THREE.Path(); del.absarc(0, 0, r * 0.28, 0, 6.283, true); s.holes.push(del);
  return new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 8 }).rotateX(-Math.PI / 2);
}
class PtHelis extends THREE.Curve { constructor(r, h, n) { super(); this.r = r; this.h = h; this.n = n; } getPoint(t, o = new THREE.Vector3()) { const a = t * this.n * 6.283; return o.set(Math.cos(a) * this.r, t * this.h, Math.sin(a) * this.r); } }
// ayak: zeminde (y=0) baslar, platformun alt yuzune (y=h) kadar uzanir
function ptAyak(tip, tm, h) {
  const g = new THREE.Group(), u = g.userData, pir = ptMat('#e0a63a', 0.3, 0.55, { emissive: '#4a2c00', emissiveIntensity: 0.2 }), alt = ptMat('#ffc93a', 0.28, 0.55, { emissive: '#5a3a00', emissiveIntensity: 0.25 });
  const golge = LEG.userData.shade.clone(); golge.visible = true; golge.position.y = 0.012; golge.scale.setScalar(0.62); g.add(golge);
  const sil = (r0, r1, y0, y1, mat, n, x, z) => ptMesh(new THREE.CylinderGeometry(r1, r0, Math.max(0.05, y1 - y0), n || 20), mat, x || 0, (y0 + y1) / 2, z || 0);
  if (tip === 'piston') {
    const ho = Math.min(1.5, h * 0.42), cel = ptMat('#4a5866', 0.35, 0.6), krom = ptMat('#e4ebf2', 0.15, 0.8, { emissive: '#56606a', emissiveIntensity: 0.3 });
    g.add(sil(1.4, 1.25, 0, 0.3, pir, 28), sil(0.64, 0.64, 0.3, 0.3 + ho, cel, 24));
    for (const yy of [0.5, 0.2 + ho]) { const t = ptMesh(new THREE.TorusGeometry(0.66, 0.08, 8, 24), pir, 0, yy, 0, 0); t.rotation.x = Math.PI / 2; g.add(t); }
    const rod = ptMesh(new THREE.CylinderGeometry(0.38, 0.38, 1, 20), krom), fl = ptMesh(new THREE.CylinderGeometry(0.95, 0.6, 0.28, 24), pir);
    g.add(rod, fl);
    u.upd = (hh) => { const y0 = 0.15 + ho, y1 = hh - 0.26; rod.scale.y = Math.max(0.05, y1 - y0); rod.position.y = (y0 + y1) / 2; fl.position.y = hh - 0.14; };
  } else if (tip === 'makas') {
    const N = 3, Lb = Math.max(1.2, (h - 0.45) / N * 1.4), kol = ptMat(tm.mk, 0.35, 0.4), cel = ptMat('#55606c', 0.4, 0.55);
    const taban = ptMesh(new THREE.BoxGeometry(2.1, 0.25, 1.5), cel, 0, 0.125, 0), tepe = ptMesh(new THREE.BoxGeometry(2.0, 0.2, 1.4), cel);
    g.add(taban, tepe); const kollar = [], pim = [];
    for (let i = 0; i < N; i++) for (const zz of [-0.6, 0.6]) for (const sg of [1, -1]) { const m = ptMesh(new THREE.BoxGeometry(1, 0.14, 0.12), kol, 0, 0, zz); m.userData = { i, sg }; kollar.push(m); g.add(m); }
    for (let i = 0; i < N; i++) { const p = ptMesh(new THREE.CylinderGeometry(0.1, 0.1, 1.45, 10), cel, 0, 0, 0, 0); p.rotation.x = Math.PI / 2; p.userData.i = i; pim.push(p); g.add(p); }
    u.upd = (hh) => {
      const hs = Math.max(0.15, (hh - 0.45) / N), wd = Math.sqrt(Math.max(0.09, Lb * Lb - hs * hs)), a = Math.atan2(hs, wd), L = Math.hypot(wd, hs);
      for (const m of kollar) { m.scale.x = L; m.rotation.z = a * m.userData.sg; m.position.y = 0.25 + hs * (m.userData.i + 0.5); }
      for (const p of pim) p.position.y = 0.25 + hs * (p.userData.i + 0.5);
      tepe.position.y = hh - 0.1;
    };
  } else if (tip === 'disli') {
    const kol = ptMat('#5a6470', 0.4, 0.55);
    g.add(sil(1.5, 1.4, 0, 0.22, ptMat('#3c444e', 0.5, 0.4), 28), sil(0.5, 0.5, 0.2, h - 0.25, kol, 20), sil(0.8, 0.95, h - 0.3, h, pir, 24));
    const dg = new THREE.Group(), b = ptMesh(disliGeo(1.45, 16, 0.32), pir, 0, 0.22, 0); dg.add(b); g.add(dg);
    const kg = new THREE.Group(), k = ptMesh(disliGeo(0.62, 8, 0.28), alt, 0, 0.6, 0); kg.position.set(1.95, 0, 0); kg.add(k, sil(0.12, 0.12, 0.22, 0.95, kol, 10)); g.add(kg);
    const ug = new THREE.Group(); ug.add(ptMesh(disliGeo(0.9, 12, 0.24), alt, 0, h - 0.6, 0)); g.add(ug);
    u.don = (a) => { dg.rotation.y = a; ug.rotation.y = a * 1.6; kg.rotation.y = -a * 1.45 / 0.62; };
  } else if (tip === 'denge') {
    const ah = ptDoku('ahsap'), ag = ptMat('#ffffff', 0.75, 0, { map: ah }), d = ptMat(tm.mk, 0.35, 0.45);
    g.add(sil(1.3, 1.15, 0, 0.3, d, 24), sil(0.42, 0.55, 0.3, h - 0.35, ag, 16));
    const sh = new THREE.Shape(); sh.moveTo(-0.75, 0); sh.lineTo(0.75, 0); sh.lineTo(0.18, 0.62); sh.lineTo(-0.18, 0.62); sh.lineTo(-0.75, 0);
    const yg = new THREE.ExtrudeGeometry(sh, { depth: 0.16, bevelEnabled: false });
    for (const zz of [0.5, -0.66]) g.add(ptMesh(yg, d, 0, h - 0.82, zz));
    const aks = ptMesh(new THREE.CylinderGeometry(0.17, 0.17, 1.7, 14), ptMat('#e4ebf2', 0.2, 0.8)); aks.rotation.x = Math.PI / 2; aks.position.y = h - 0.18; g.add(aks);
  } else if (tip === 'tas' || tip === 'volkan') {
    const vk = tip === 'volkan', ms = ptMat('#ffffff', 0.85, 0, { map: ptDoku(vk ? 'acik' : 'tas') });
    g.add(ptMesh(new THREE.BoxGeometry(1.7, 0.45, 1.7), ms, 0, 0.225, 0));
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4, f = ptMesh(new THREE.BoxGeometry(0.55, 0.5, 0.95), ms, Math.cos(a) * 0.95, 0.2, Math.sin(a) * 0.95); f.rotation.y = -a; f.rotation.z = 0; g.add(f); }
    if (vk) { g.add(sil(0.62, 0.7, 0.45, h - 0.3, ms, 8)); for (const yy of [0.75, h * 0.5, h - 0.55]) { const t = ptMesh(new THREE.TorusGeometry(0.68, 0.09, 8, 8), alt, 0, yy, 0, 0); t.rotation.x = Math.PI / 2; g.add(t); } }
    else { const n = Math.max(2, Math.round((h - 0.75) / 0.75)), hs = (h - 0.75) / n; for (let i = 0; i < n; i++) { const w = i % 2 ? 1.08 : 1.2, b = ptMesh(new THREE.BoxGeometry(w, hs * 0.95, w), ms, 0, 0.45 + hs * (i + 0.5), 0); b.rotation.y = Math.sin(i * 2.7) * 0.1; g.add(b); } }
    g.add(ptMesh(new THREE.BoxGeometry(1.6, 0.3, 1.6), vk ? alt : ms, 0, h - 0.15, 0));
  } else if (tip === 'lolipop') {
    const st = ptDoku('serit'); st.repeat.set(1, 1.5);
    g.add(ptMesh(new THREE.SphereGeometry(1.1, 20, 10, 0, 6.283, 0, Math.PI / 2).scale(1, 0.55, 1), ptMat('#ff6fae', 0.35, 0, { emissive: '#7a1040', emissiveIntensity: 0.15 })));
    g.add(sil(0.3, 0.3, 0.3, h - 0.2, ptMat('#ffffff', 0.4, 0, { map: st }), 16));
    const disk = ptMesh(new THREE.CylinderGeometry(1.0, 1.0, 0.24, 32), [ptMat('#ff8cc0', 0.4, 0), ptMat('#ffffff', 0.35, 0, { map: ptDoku('girdap') }), ptMat('#ffffff', 0.35, 0, { map: ptDoku('girdap') })], 0, h - 0.12, 0); g.add(disk);
    for (const [xx, zz, r] of [[1.35, 0.5, 0.42], [-1.3, -0.4, 0.36]]) { g.add(sil(0.06, 0.06, 0, 0.75, ptMat('#ffffff', 0.4, 0), 8, xx, zz)); const l = ptMesh(new THREE.CylinderGeometry(r, r, 0.12, 20), [ptMat('#ffd23f', 0.4, 0), ptMat('#ffffff', 0.35, 0, { map: ptDoku('girdap') }), ptMat('#ffffff', 0.35, 0, { map: ptDoku('girdap') })], xx, 0.75 + r, zz, 0); l.rotation.x = Math.PI / 2; g.add(l); }
  } else if (tip === 'buz') {
    const bz = ptMat('#cdf3ff', 0.12, 0, { transparent: true, opacity: 0.86, emissive: '#5ab8e0', emissiveIntensity: 0.22 });
    g.add(sil(0.8, 0.64, 0, h, bz, 6), sil(0.3, 0.26, 0.1, h - 0.1, ptMat('#ffffff', 0.3, 0, { emissive: '#bfefff', emissiveIntensity: 0.5 }), 6));
    g.add(ptMesh(new THREE.SphereGeometry(1, 16, 8, 0, 6.283, 0, Math.PI / 2).scale(1.5, 0.35, 1.5), ptMat('#f4fbff', 0.9, 0, { emissive: '#a8c8e8', emissiveIntensity: 0.15 }), 0, 0, 0, 0));
    g.add(ptDizi(new THREE.IcosahedronGeometry(0.4, 0), bz, [[1.1, 0.2, 0.4, 0.5, 1], [-1.0, 0.18, 0.6, 1.2, 0.8], [0.3, 0.15, -1.15, 2.1, 0.9], [-0.6, 0.12, -0.9, 0.3, 0.65]]));
    g.add(sil(0.95, 0.75, h - 0.35, h, bz, 6));
  } else if (tip === 'halat') {
    const ah = ptMat('#ffffff', 0.75, 0, { map: ptDoku('ahsap') }), koyu = ptMat('#6b4423', 0.7, 0), ip = ptMat('#d8b878', 0.9, 0), demir = ptMat('#3a3a40', 0.45, 0.5);
    const pr = []; for (let i = 0; i <= 10; i++) { const t = i / 10; pr.push(new THREE.Vector2(0.92 + 0.2 * Math.sin(Math.PI * t), t * 1.3)); }
    g.add(ptMesh(new THREE.LatheGeometry(pr, 20), ah));
    for (const yy of [0.18, 1.12]) { const t = ptMesh(new THREE.TorusGeometry(0.98, 0.05, 6, 24), demir, 0, yy, 0, 0); t.rotation.x = Math.PI / 2; g.add(t); }
    g.add(ptMesh(new THREE.CylinderGeometry(0.92, 0.92, 0.04, 20), koyu, 0, 1.3, 0, 0));
    g.add(sil(0.46, 0.4, 1.3, h - 0.25, koyu, 16));
    const hl = (y0, hh, n) => ptMesh(new THREE.TubeGeometry(new PtHelis(0.47, hh, n), n * 16, 0.075, 6), ip, 0, y0, 0, 0);
    g.add(hl(1.45, 0.55, 4), hl(h - 1.05, 0.6, 4));
    g.add(sil(0.7, 0.55, h - 0.28, h, demir, 16));
  } else if (tip === 'kemik') {
    const km = ptMat('#efe6cf', 0.65, 0, { emissive: '#4a4030', emissiveIntensity: 0.12 }), top = new THREE.SphereGeometry(0.5, 16, 12);
    g.add(sil(0.36, 0.36, 0.5, h - 0.5, km, 16));
    for (const yy of [0.42, h - 0.42]) for (const xx of [-0.3, 0.3]) g.add(ptMesh(top, km, xx, yy, 0));
    const kk = (a, x, z) => { const b = new THREE.Group(); b.add(ptMesh(new THREE.CylinderGeometry(0.11, 0.11, 1.4, 10), km, 0, 0, 0, 0)); for (const yy of [-0.72, 0.72]) for (const zz of [-0.12, 0.12]) b.add(ptMesh(new THREE.SphereGeometry(0.16, 10, 8), km, 0, yy, zz, 0)); b.rotation.set(0, a, Math.PI / 2); b.position.set(x, 0.16, z); return b; };
    g.add(kk(0.7, 0.9, 0.7), kk(-0.7, 0.9, 0.7));
  } else {   // altin cift sutun
    g.add(ptMesh(new THREE.BoxGeometry(2.3, 0.36, 1.4), alt, 0, 0.18, 0), ptMesh(new THREE.BoxGeometry(2.6, 0.12, 1.6), pir, 0, 0.06, 0, 0));
    for (const xx of [-0.62, 0.62]) {
      g.add(sil(0.34, 0.3, 0.36, h - 0.36, alt, 16, xx), ptMesh(new THREE.BoxGeometry(0.85, 0.22, 0.85), pir, xx, h - 0.42, 0, 0), ptMesh(new THREE.BoxGeometry(0.8, 0.2, 0.8), pir, xx, 0.45, 0, 0));
      for (const yy of [h * 0.35, h * 0.65]) { const t = ptMesh(new THREE.TorusGeometry(0.33, 0.06, 6, 16), pir, xx, yy, 0, 0); t.rotation.x = Math.PI / 2; g.add(t); }
    }
    g.add(ptMesh(new THREE.BoxGeometry(2.3, 0.32, 1.4), alt, 0, h - 0.16, 0));
  }
  if (u.upd) u.upd(h);
  return g;
}
function dengeMu(L, Y) { return FONYENI && !Y.pl && !Y.don && !asansorMu(L) && (Q.get('denge') === '1' || (Q.get('denge') !== '0' && L >= 7 && (L % 10 === 7 || L % 10 === 8))); }
function ptAt(o) { o.traverse((m) => { if (m.geometry && m !== o) m.geometry.dispose(); }); }
function temaKur() {
  const tm = PTEM[fonOf(LV).f.slice(2)] || PTEM.koy;
  for (const q of PLS) {
    if (q.cy == null) q.cy = 0; q.th = q.den ? 0.4 : 0.75; q.eg = 0;
    if (q.mesh) q.mesh.visible = false; if (q.leg) q.leg.visible = false;
    const tip = q.den ? 'denge' : q.asn ? (tm.ayak === 'piston' ? 'piston' : 'makas') : g.don ? 'disli' : tm.ayak;
    q.tu = ptUst(tm, q.r, q.rz, q.th); q.ta = ptAyak(tip, tm, q.cy - q.th - GY); q.ta.position.set(q.cx, GY, q.z || 0); q.ah0 = q.cy; scene.add(q.tu, q.ta);
  }
  temaKare();
}
function temaSil() { for (const q of PLS) if (q.tu) { scene.remove(q.tu, q.ta); ptAt(q.tu); ptAt(q.ta); q.tu = q.ta = null; } }
function temaKare() {
  for (const q of PLS) {
    if (!q.tu) continue;
    q.tu.position.copy(q.body.position); q.tu.quaternion.copy(q.body.quaternion); q.ta.position.x = q.cx;
    const u = q.ta.userData; if (u.upd && q.cy !== q.ah0) { q.ah0 = q.cy; u.upd(q.cy - q.th - GY); } if (u.don) u.don(PANG);
  }
}
const QEG = new CANNON.Quaternion();
function denge(dt) {
  for (let n = 0; n < PLS.length; n++) {
    const q = PLS[n]; if (!q.den || !g || !g.armed) continue;
    let m = 0, mx = 0; for (const c of cubes) { if (c.pi !== n || c.gone || c.out) continue; m += c.body.mass; mx += c.body.mass * (c.body.position.x - q.cx); }
    const hedef = m ? -Math.max(-1, Math.min(1, mx / m / (q.r * 0.3))) * DENGE_MAX : 0, yeni = q.eg + (hedef - q.eg) * Math.min(1, dt * 0.8), a = yeni - q.eg;
    if (Math.abs(a) < 1e-5) continue; q.eg = yeni;
    QEG.setFromAxisAngle(QZ, a); const ca = Math.cos(a), sa = Math.sin(a), px = q.cx, py = q.cy - q.th;
    const rot = (v, p) => { const x = v.x - (p ? px : 0), y = v.y - (p ? py : 0); v.x = x * ca - y * sa + (p ? px : 0); v.y = x * sa + y * ca + (p ? py : 0); };
    rot(q.body.position, 1); q.body.quaternion = QEG.mult(q.body.quaternion); q.body.aabbNeedsUpdate = true;
    for (const c of cubes) { if (c.pi !== n || c.gone || c.out) continue; const b = c.body; rot(b.position, 1); rot(b.velocity, 0); b.quaternion = QEG.mult(b.quaternion); b.aabbNeedsUpdate = true; }
  }
}
function syncMeshes() { for (const c of cubes) { if (c.landed === true) continue; c.mesh.position.copy(c.body.position); c.mesh.quaternion.copy(c.body.quaternion); } }
function wakeAll() { for (const c of cubes) if (!c.out) c.body.wakeUp(); }

// ---------------- Pofi ----------------
// live_pofi.glb (Tripo modeli); govde rengi seviyeye gore boyanir. Kosma klibinin bir karesinde durur, nefes alir, atista hortumu kalkar.
const PDEF = { hue1: 0.585, sat0: 0.22, val0: 0.42, bake: 0.35, hue2: [2, 2] };
const POFICOL = ['#3d9bff', '#ff5aa8', '#2fcf73', '#a25cff', '#ff9a1f', '#22c8e8'];
function tintMat(src, d, col) {
  const m = src.clone(); m.metalness = 0; m.roughness = 0.5; m.normalScale = new THREE.Vector2(0.6, 0.6);
  const c = new THREE.Color(col); m.customProgramCacheKey = () => 'yp' + col;
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uCol = { value: c };
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uCol;\n' +
      'vec3 rgb2hsv(vec3 c){vec4 K=vec4(0.,-1./3.,2./3.,-1.);vec4 p=mix(vec4(c.bg,K.wz),vec4(c.gb,K.xy),step(c.b,c.g));vec4 q=mix(vec4(p.xyw,c.r),vec4(c.r,p.yzx),step(p.x,c.r));float d=q.x-min(q.w,q.y);float e=1.0e-10;return vec3(abs(q.z+(q.w-q.y)/(6.0*d+e)),d/(q.x+e),q.x);}')
      .replace('#include <map_fragment>', `#include <map_fragment>
        vec3 sc = pow(max(diffuseColor.rgb, 0.0), vec3(1.0 / 2.2)); vec3 hv = rgb2hsv(sc);
        float bodyW = smoothstep(0.33, 0.37, hv.x) * (1.0 - smoothstep(${d.hue1.toFixed(3)} - 0.02, ${d.hue1.toFixed(3)} + 0.02, hv.x)) * smoothstep(${(d.sat0 - 0.05).toFixed(3)}, ${(d.sat0 + 0.05).toFixed(3)}, hv.y) * smoothstep(${(d.val0 - 0.06).toFixed(3)}, ${(d.val0 + 0.06).toFixed(3)}, hv.z);
        float lum = dot(sc, vec3(0.3, 0.59, 0.11));
        vec3 body = uCol * mix(1.0, clamp(lum / 0.62, 0.55, 1.35), ${d.bake.toFixed(3)});
        vec3 warm = pow(vec3(lum) * vec3(1.03, 1.0, 0.93), vec3(2.2)); vec3 det = mix(diffuseColor.rgb, warm, 1.0 - smoothstep(0.18, 0.4, hv.y));
        diffuseColor.rgb = mix(det, body, bodyW);`);
  };
  return m;
}
const bonesOf = (root) => { const b = {}; root.traverse((o) => { if (o.isBone) b[o.name.replace(/^mixamorig:?/, '')] = o; }); return b; };
// Tripo iskeletinde hortum kemigi yok: basa iki kemik eklenir, hortum noktalari onlara baglanir (live3d.js ile ayni kural)
function addTrunk(model, mesh) {
  const bones = bonesOf(model), head = bones.Head; if (!head) return;
  mesh.skeleton.pose(); model.updateMatrixWorld(true);
  const sk = mesh.skeleton, hi = sk.bones.indexOf(head), T1 = new THREE.Bone(), T2 = new THREE.Bone(); T1.name = 'Trunk1'; T2.name = 'Trunk2';
  head.add(T1); T1.position.copy(head.worldToLocal(new THREE.Vector3(0.02, 0.54, 0.15))); T1.updateMatrixWorld(true);
  T1.add(T2); T2.position.copy(T1.worldToLocal(new THREE.Vector3(0.07, 0.47, 0.21))); T2.updateMatrixWorld(true);
  const i1 = sk.bones.length, i2 = i1 + 1, si = mesh.geometry.attributes.skinIndex, sw = mesh.geometry.attributes.skinWeight, pos = mesh.geometry.attributes.position, w = new THREE.Vector3();
  const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  for (let i = 0; i < pos.count; i++) {
    let bi = 0, bw = -1; for (let k = 0; k < 4; k++) { const ww = sw.getComponent(i, k); if (ww > bw) { bw = ww; bi = si.getComponent(i, k); } }
    if (bi !== hi) continue;
    mesh.getVertexPosition(i, w); w.applyMatrix4(mesh.matrixWorld);
    if (w.z < 0.11 || w.y > 0.57 || w.y < 0.3 || Math.abs(w.x - 0.05) > 0.14) continue;
    const t = Math.max(0, Math.min(1, ((0.57 - w.y) / 0.18) * 0.55 + ((w.z - 0.11) / 0.16) * 0.45)); if (t < 0.05) continue;
    const a = ss(0.05, 0.35, t), b = ss(0.45, 0.85, t);
    si.setXYZW(i, hi, i1, i2, 0); sw.setXYZW(i, 1 - a, a * (1 - b), a * b, 0);
  }
  si.needsUpdate = sw.needsUpdate = true;
  mesh.bind(new THREE.Skeleton(sk.bones.concat([T1, T2]), sk.boneInverses.concat([T1.matrixWorld.clone().invert(), T2.matrixWorld.clone().invert()])), mesh.bindMatrix);
}
const PF = { holder: new THREE.Group(), ok: false, yaw: Math.PI, aimYaw: Math.PI, rec: 0, mats: {}, col: null };
PF.holder.position.copy(POFI); scene.add(PF.holder);
const NOPOFI = true;   // v5.5: Adem fil istemiyor - Pofi yuklenmez ve gosterilmez
const pofiReady = new Promise((res) => {
  if (NOPOFI) { PF.holder.visible = false; pedG.visible = false; return res(); }
  new GLTFLoader().load('../live_pofi.glb', (gl) => {
    const src = gl.scene; let m0 = null; src.traverse((o) => { if (o.isSkinnedMesh) m0 = o; }); if (!m0) return res();
    addTrunk(src, m0);
    const root = skClone(src); let mesh = null; root.traverse((x) => { if (x.isSkinnedMesh) { mesh = x; x.frustumCulled = false; x.castShadow = true; } });
    const bb = new THREE.Box3().setFromObject(src), h0 = bb.max.y - bb.min.y, sc = 3.6 / h0;
    root.scale.setScalar(sc); root.position.y = -bb.min.y * sc;
    PF.body = new THREE.Group(); PF.body.add(root); PF.holder.add(PF.body);
    PF.mixer = new THREE.AnimationMixer(root); PF.act = PF.mixer.clipAction(gl.animations[0]); PF.act.play();
    PF.dur = gl.animations[0].duration; PF.root = root; PF.mesh = mesh; PF.src = m0.material; PF.b = bonesOf(root); PF.ok = true;
    setPofiCol(POFICOL[(LV - 1) % POFICOL.length]); res();
  }, undefined, () => res());
});
function setPofiCol(col) { if (!PF.ok || PF.col === col) return; if (!PF.mats[col]) PF.mats[col] = tintMat(PF.src, PDEF, col); PF.mesh.material = PF.mats[col]; PF.col = col; }
// v5.4: top arabasi (Adem'in Tripo modeli): Pofi'nin yaninda durur, hedefe doner, toplari namludan atar, atista geri teper
const TC = { by: GY, holder: new THREE.Group(), gun: null, muzzle: new THREE.Vector3(), yaw: Math.PI, aimYaw: Math.PI, rec: 0 };
// v3.2: (Adem 11 Kas) kamera tam onden: platform ve top arabasi dumduz karsida (eskiden 0.36 rad yandan)
TC.holder.position.set(-POFI.x, GY, POFI.z); scene.add(TC.holder);
function makeCannon() {
  const M = MOD.topcu; if (!M || TC.gun) return;
  if (!window.KORSAN) { topArabasiKur(); return; }
  const g = M.geo.clone(), b = g.boundingBox, c = b.getCenter(new THREE.Vector3()), z = b.getSize(new THREE.Vector3()), sc = 4.2 / z.x;
  g.translate(-c.x, -b.min.y, -c.z); g.scale(sc, sc, sc); g.computeBoundingBox();
  // namlu ucu: govdenin ust kismindaki (y > %60) noktalarin iki x ucundan hangisi daha yuksekse namlu odur (ayaklar alcakta)
  const pa = g.attributes.position, ym = g.boundingBox.max.y; let x0 = 1e9, x1 = -1e9;
  for (let i = 0; i < pa.count; i++) if (pa.getY(i) > ym * 0.6) { x0 = Math.min(x0, pa.getX(i)); x1 = Math.max(x1, pa.getX(i)); }
  TC.h = g.boundingBox.max.y; TC.w = g.boundingBox.max.z - g.boundingBox.min.z; const band = (x1 - x0) * 0.08, A = new THREE.Vector3(), B = new THREE.Vector3(); let na = 0, nb = 0;
  for (let i = 0; i < pa.count; i++) { const y = pa.getY(i); if (y < ym * 0.45) continue; const x = pa.getX(i);
    if (x < x0 + band) { A.x += x; A.y += y; A.z += pa.getZ(i); na++; } else if (x > x1 - band) { B.x += x; B.y += y; B.z += pa.getZ(i); nb++; } }
  if (na) A.divideScalar(na); if (nb) B.divideScalar(nb);
  const plusX = !na || (nb && B.y >= A.y), mu = plusX ? B : A, rot = plusX ? -Math.PI / 2 : Math.PI / 2;   // namlu -> +z; holder yaw'i +z'yi hedefe cevirir
  const m = new THREE.Mesh(g, M.mat); m.castShadow = m.receiveShadow = true; m.rotation.y = rot;
  TC.gun = new THREE.Group(); TC.gun.add(m); TC.holder.add(TC.gun);
  // altinda krem renkli yuvarlak tas kaide (resimdeki gibi)
  TC.muzzle.copy(mu).applyAxisAngle(new THREE.Vector3(0, 1, 0), rot); TC.info = { plusX, mu: mu.toArray().map((v) => +v.toFixed(2)) };
  // v6.1: top arabasi yuvarlak krem bir kaidenin ustunde; namlusu platform tablasi hizasinda, boylece alta da duz ve guclu atar
  TC.w0 = TC.w; const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.9, 1, 64), new THREE.MeshStandardMaterial({ color: '#f4e8d6', roughness: 0.55 }));
  pad.receiveShadow = true; TC.holder.add(pad); TC.pad = pad;
  const gm = new THREE.MeshStandardMaterial({ color: '#e8b93a', roughness: 0.28, metalness: 0.55 });
  const r1 = new THREE.Mesh(new THREE.TorusGeometry(1.76, 0.09, 10, 72), gm), r2 = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.09, 10, 72), gm);
  r1.rotation.x = r2.rotation.x = Math.PI / 2; TC.holder.add(r1, r2); TC.rim2 = r2;

}
function updateCannon(dt) {
  if (!TC.gun) return;
  if (TC.pro) return topArabasiKare(dt);
  TC.rec = Math.max(0, TC.rec - dt * 3.2);
  let d = TC.aimYaw - TC.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); TC.yaw += d * Math.min(1, dt * 14); TC.holder.rotation.y = TC.yaw;
  const r = TC.rec, k = r > 0.75 ? (1 - r) / 0.25 : r / 0.75; TC.gun.position.z = -k * 0.85; TC.gun.rotation.x = -k * 0.14; TC.gun.scale.set(1 + k * 0.06, 1 - k * 0.08, 1 + k * 0.06);   // v6.0: sert, hizli geri tepme
}

// ---------------- v3.2 top arabasi (Adem 11 Kas: "guzel durmuyor, piksel bozuklugu var") ----------------
// Tripo modelinin dokusu yakindan bakinca pikselleniyordu. Yapi'da top arabasi artik kodla kurulur: dokusuz, keskin, parlak
// malzemeler (dokme demir namlu, altin halkalar, ahsap kizak, parmakli tekerlekler). Hareketler: atista namlu geri teper,
// araba geri kayar ve tekerlekler doner, namlu agzi kor gibi parlar; beklerken altin halkalarda isik gezinir, namlu nefes alir.
// Eksenler eski modelle ayni: namlu +z, zemin y=0. Korsan eski modeli kullanir.
function topArabasiKur() {
  const odunT = canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = '#9a5a26'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) { const y0 = i * h / 4; const gr = x.createLinearGradient(0, y0, 0, y0 + h / 4); gr.addColorStop(0, '#b87436'); gr.addColorStop(0.5, '#a3622a'); gr.addColorStop(1, '#8a4e1e'); x.fillStyle = gr; x.fillRect(0, y0 + 3, w, h / 4 - 6); x.fillStyle = '#4a2408'; x.fillRect(0, y0, w, 3); }
    x.globalAlpha = 0.22; x.strokeStyle = '#5a2c0c'; x.lineWidth = 2;
    for (let i = 0; i < 40; i++) { const y = Math.random() * h; x.beginPath(); x.moveTo(0, y); for (let px = 0; px <= w; px += 32) x.lineTo(px, y + Math.sin(px * 0.02 + i) * 3); x.stroke(); }
    x.globalAlpha = 1;
  });
  odunT.anisotropy = 8;
  const odun = new THREE.MeshStandardMaterial({ map: odunT, roughness: 0.6, envMap: NENV, envMapIntensity: 0.5 });
  const koyu = new THREE.MeshStandardMaterial({ color: '#5e3212', roughness: 0.7, envMap: NENV, envMapIntensity: 0.4 });
  const demir = new THREE.MeshPhysicalMaterial({ color: '#2e3644', metalness: 0.8, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.2, envMap: ENV, envMapIntensity: 1.25 });
  const altin = new THREE.MeshStandardMaterial({ color: '#ffc43a', metalness: 0.92, roughness: 0.2, emissive: '#6a3c00', emissiveIntensity: 0.4, envMap: ENV, envMapIntensity: 1.4 });
  const ic = new THREE.MeshBasicMaterial({ color: '#160804' });
  const G = new THREE.Group(), add = (geo, m, x, y, z, par) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; (par || G).add(o); return o; };
  // kizak: iki yan tahta, arkaya dogru yere iner (kuyruk), arasinda enine tahtalar ve altin percinler
  const yanSh = new THREE.Shape(); [[0.75, 0.62], [0.75, 1.22], [0.25, 1.32], [-0.4, 1.12], [-1.9, 0.16], [-1.9, 0.0], [-1.55, 0.0], [-0.3, 0.62]].forEach((q, i) => i ? yanSh.lineTo(q[0], q[1]) : yanSh.moveTo(q[0], q[1]));
  const yanG = new THREE.ExtrudeGeometry(yanSh, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3 }); yanG.rotateY(-Math.PI / 2);
  for (const sx of [-1, 1]) { add(yanG, odun, sx > 0 ? 0.55 : -0.33, 0, 0);
    for (const [z, y] of [[0.45, 1.12], [-0.2, 1.0], [-0.9, 0.62], [-1.5, 0.3]]) add(new THREE.SphereGeometry(0.055, 12, 8), altin, sx * 0.57, y, z); }
  for (const [z, y, r] of [[0.35, 0.72, 0], [-0.7, 0.5, 0.42], [-1.5, 0.12, 0.42]]) { const o = add(new THREE.BoxGeometry(0.9, 0.12, 0.3), koyu, 0, y, z); o.rotation.x = r; }
  // dingil ve tekerlekler
  const dingil = add(new THREE.CylinderGeometry(0.09, 0.09, 2.3, 16), demir, 0, 0.78, 0.15); dingil.rotation.z = Math.PI / 2;
  TC.tek = [];
  for (const sx of [-1, 1]) {
    const W = new THREE.Group(); W.position.set(sx * 1.02, 0.78, 0.15); G.add(W); TC.tek.push(W);
    const lastik = add(new THREE.TorusGeometry(0.72, 0.075, 12, 48), demir, 0, 0, 0, W); lastik.rotation.y = Math.PI / 2;
    const jant = add(new THREE.TorusGeometry(0.63, 0.07, 10, 48), odun, 0, 0, 0, W); jant.rotation.y = Math.PI / 2; jant.scale.z = 1.6;
    for (let i = 0; i < 10; i++) { const sp = add(new THREE.BoxGeometry(0.07, 1.22, 0.07), odun, 0, 0, 0, W); sp.rotation.x = i / 10 * Math.PI; }
    const gob = add(new THREE.CylinderGeometry(0.17, 0.2, 0.26, 20), altin, sx * 0.04, 0, 0, W); gob.rotation.z = Math.PI / 2;
    add(new THREE.SphereGeometry(0.1, 14, 10), altin, sx * 0.17, 0, 0, W);
  }
  // namlu: torna profili, dokme demir; altin halkalar; arkada topuz; agzinda kor
  const N = new THREE.Group(); N.position.set(0, 1.3, 0.2); G.add(N); TC.namlu = N;
  const pr = [[0.001, -1.22], [0.3, -1.22], [0.44, -1.15], [0.5, -1.0], [0.5, -0.72], [0.45, -0.62], [0.43, 0.4], [0.37, 1.52], [0.36, 1.62], [0.45, 1.7], [0.48, 1.86], [0.42, 1.96], [0.25, 1.96], [0.23, 1.2], [0.001, 1.2]].map((q) => new THREE.Vector2(q[0], q[1]));
  const nG = new THREE.LatheGeometry(pr, 56); nG.rotateX(Math.PI / 2); add(nG, demir, 0, 0, 0, N);
  TC.halka = [];
  for (const [z, r, t] of [[-1.0, 0.505, 0.06], [-0.66, 0.465, 0.05], [0.42, 0.44, 0.045], [1.62, 0.39, 0.04], [1.8, 0.49, 0.05]]) { const h = add(new THREE.TorusGeometry(r, t, 12, 56), altin.clone(), 0, 0, z, N); TC.halka.push(h); }
  add(new THREE.SphereGeometry(0.17, 20, 14), altin, 0, 0, -1.4, N); add(new THREE.CylinderGeometry(0.08, 0.14, 0.2, 16), altin, 0, 0, -1.28, N).rotation.x = Math.PI / 2;
  const muyl = add(new THREE.CylinderGeometry(0.12, 0.12, 1.12, 16), altin, 0, 0, 0, N); muyl.rotation.z = Math.PI / 2;
  const kor = new THREE.Mesh(new THREE.CircleGeometry(0.235, 32), new THREE.MeshBasicMaterial({ color: '#ff8a2a', transparent: true, opacity: 0 })); kor.position.z = 1.21; N.add(kor); TC.kor = kor;
  add(new THREE.CircleGeometry(0.24, 32), ic, 0, 0, 1.205, N);
  TC.gun = new THREE.Group(); TC.gun.add(G); TC.holder.add(TC.gun); TC.pro = true;
  TC.muzzle.set(0, 1.3, 0.2 + 1.98); TC.h = 1.8; TC.w = 2.3; TC.info = { pro: true };
  TC.w0 = TC.w; const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.9, 1, 64), new THREE.MeshStandardMaterial({ color: '#f4e8d6', roughness: 0.55 }));
  pad.receiveShadow = true; TC.holder.add(pad); TC.pad = pad;
  const gm = new THREE.MeshStandardMaterial({ color: '#e8b93a', roughness: 0.28, metalness: 0.55 });
  const r1 = new THREE.Mesh(new THREE.TorusGeometry(1.76, 0.09, 10, 72), gm), r2 = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.09, 10, 72), gm);
  r1.rotation.x = r2.rotation.x = Math.PI / 2; TC.holder.add(r1, r2); TC.rim2 = r2; TC.ti = 0; TC.dz = 0;
}
function topArabasiKare(dt) {
  TC.rec = Math.max(0, TC.rec - dt * 2.6); TC.ti += dt;
  let d = TC.aimYaw - TC.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); TC.yaw += d * Math.min(1, dt * 14); TC.holder.rotation.y = TC.yaw;
  const r = TC.rec, k = r > 0.82 ? (1 - r) / 0.18 : (r / 0.82) ** 1.6;
  const z = -k * 0.7; TC.gun.position.z = z;
  for (const w of TC.tek) w.rotation.x += (z - TC.dz) / 0.72;
  TC.dz = z;
  const nef = Math.sin(TC.ti * 2.2) * 0.012;
  TC.namlu.position.z = 0.2 - k * 0.32; TC.namlu.rotation.x = -k * 0.16 - 0.02 + nef; TC.namlu.scale.set(1 + k * 0.05, 1 + k * 0.05, 1 - k * 0.07);
  TC.gun.rotation.x = -k * 0.05;
  TC.kor.material.opacity = Math.min(1, r * 1.4); TC.kor.material.color.setRGB(1, 0.35 + r * 0.5, 0.1 + r * 0.4);
  TC.halka.forEach((h, i) => { const ph = (TC.ti * 0.9 - i * 0.22) % 3; h.material.emissiveIntensity = 0.35 + Math.max(0, 1 - Math.abs(ph - 0.5) * 3) * 0.9 + r * 0.8; });
}
const TIP = new THREE.Vector3();
function trunkTip(out) {
  if (TC.gun) { TC.holder.updateMatrixWorld(true); TC.gun.updateMatrixWorld(true); return out.copy(TC.muzzle).applyMatrix4(TC.gun.matrixWorld); }
  if (PF.ok && PF.b.Trunk2) { PF.root.updateMatrixWorld(true); PF.b.Trunk2.getWorldPosition(out); return out; }
  return out.set(POFI.x, POFI.y + 2.2, POFI.z - 0.6);
}
function updatePofi(dt) {
  PF.rec = Math.max(0, PF.rec - dt * 3.2);
  let d = PF.aimYaw - PF.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); PF.yaw += d * Math.min(1, dt * 14);
  PF.holder.rotation.y = PF.yaw;
  if (!PF.ok) return;
  // durus: kosma klibinin sakin bir karesi; hafif nefes; atista ezilip uzama
  PF.act.time = PF.dur * 0.12 + Math.sin(g ? g.t * 2 : 0) * PF.dur * 0.02; PF.mixer.update(0);
  const br = Math.sin((g ? g.t : 0) * 3) * 0.015, r = PF.rec, sq = Math.sin(Math.min(1, r) * Math.PI) * 0.18;
  PF.body.scale.set(1 + sq * 0.6 - br, 1 - sq + br, 1 + sq * 0.6 - br);
  PF.body.rotation.x = -r * 0.22;
  if (PF.b.Trunk1) { PF.b.Trunk1.rotation.x -= r * 0.9; PF.b.Trunk2.rotation.x -= r * 0.6; }
}

// ---------------- Korsan Tilki (v2.1) ----------------
// Adem'in Tripo modeli (karakter/tilki.glb). Kazanilan karakter ekranin sol altinda, guclendirici dugmelerinin ustunde durur:
// beklerken nefes alir, etrafa bakar, kuyruk sallar; atista irkilir, bolum kazanilinca ziplar, toplar bitince uzulur.
// Oyun kamerasi cok genis acili oldugu icin (kenarda cisimler egilip uzuyor) tilki kendi kucuk sahnesinde, kendi kamerasiyla
// ana goruntunun ustune cizilir (tilkiCiz): her ekranda ayni yerde, ayni boyda ve bozulmadan gorunur.
const TK = { sahne: new THREE.Scene(), kam: new THREE.PerspectiveCamera(22, 1, 0.1, 20), holder: new THREE.Group(), t: null, yaw: 0.5, yawH: 0.5, yuk: null, gor: false, r: [0, 0, 1, 1] };
TK.sahne.add(TK.holder, new THREE.HemisphereLight(0xfffaf0, 0x8a8a7a, 1.7)); { const l = new THREE.DirectionalLight(0xfff0d0, 2.4); l.position.set(-4, 8, 10); TK.sahne.add(l); }
TK.kam.position.set(0, 0.78, 4.1); TK.kam.lookAt(0, 0.6, 0);
// v3.2: (Adem 11 Kas) oyun alaninda karakter olmasin; tilki yalniz ana sayfada
const OYUN_TILKI = false;
function tilkiGoster() {
  if (K || TK.yuk) return TK.yuk || Promise.resolve();
  return (TK.yuk = tilkiYukle().then((s) => {
    const t = new Tilki(s, 1); t.mesh.castShadow = false; TK.holder.add(t.root);
    const golge = new THREE.Mesh(new THREE.CircleGeometry(0.4, 32), new THREE.MeshBasicMaterial({ map: canvasTex(64, 64, (x, w, h) => { const gg = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gg.addColorStop(0, 'rgba(0,0,0,.45)'); gg.addColorStop(0.6, 'rgba(0,0,0,.2)'); gg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gg; x.fillRect(0, 0, w, h); }), transparent: true, depthWrite: false }));
    golge.rotation.x = -Math.PI / 2; golge.position.y = 0.005; TK.sahne.add(golge); TK.golge = golge;
    TK.t = t; TK.gor = true; tilkiYer();
  }).catch(() => {}));
}
// ekrandaki yeri (CSS pikseli, sol alt koseden): guclendirici dugmelerinin hemen ustu
function tilkiYer() {
  if (!TK.sab) { TK.sab = document.createElement('div'); TK.sab.style.cssText = 'position:fixed;left:0;bottom:0;width:0;height:env(safe-area-inset-bottom,0px);visibility:hidden;pointer-events:none'; document.body.appendChild(TK.sab); }
  const W = innerWidth, H = innerHeight, sab = TK.sab.offsetHeight || 0, boy = Math.max(110, Math.min(180, H * 0.19)), h = boy * 1.42, w = boy * 1.25;
  TK.r = [Math.max(0, (W - 520) / 2) - boy * 0.12, sab + 74, w, h]; TK.kam.aspect = w / h; TK.kam.updateProjectionMatrix();
}
function updateTilki(dt) {
  if (!TK.t || !TK.gor) return;
  TK.yaw += (TK.yawH - TK.yaw) * Math.min(1, dt * 6); TK.holder.rotation.y = TK.yaw; TK.t.update(dt);
  const z = TK.t.zip; TK.golge.scale.setScalar(1 - z * 1.6); TK.golge.material.opacity = 1 - z * 2.2;
}
const TKVP = new THREE.Vector4();
function tilkiCiz() {
  if (!TK.t || !TK.gor) return;
  ren.getViewport(TKVP); const ac = ren.autoClear; ren.autoClear = false; ren.clearDepth();
  ren.setViewport(TK.r[0], TK.r[1], TK.r[2], TK.r[3]); ren.render(TK.sahne, TK.kam);
  ren.setViewport(TKVP); ren.autoClear = ac;
}
// durum: 'oyun' (platforma donuk bekler), 'kazan', 'kaybet'
function tilkiDurum(d) {
  if (!TK.t) return; TK.t.dur();
  if (d === 'kazan') { TK.yawH = 0.1; TK.t.bak(0); TK.t.oyna('sevin'); }
  else if (d === 'kaybet') { TK.yawH = 0.25; TK.t.bak(0); TK.t.oyna('uzul'); }
  else { TK.yawH = 0.5; TK.t.bak(0.2); }
}

// ---------------- toplar ----------------
const BR = 0.47;   // v6.8: (Adem) biraz kucultuldu. v6.5: 3B top mermisi net gorunsun.    // v6.2: top biraz buyudu, parlak ve isikli
const BALLGEO = new THREE.SphereGeometry(BR, 32, 20);
const TRAILGEO = new THREE.SphereGeometry(0.16, 12, 8);
// Blok Smash 1. asama (Adem 9 Kas, Royal Smash referansi): top 62 yerine 95 birim/sn; kutle 5 yerine 3.3, carpma itisi (kutle x hiz) ayni kalsin diye.
function shoot(target) {
  if (!g || g.state !== 'play') return false;
  if (g.kuyruk && g.kuyruk.length) return ggAtis(target);
  if (g.shots <= 0) return false;
  const now = g.t; if (g.lastShot && now - g.lastShot < 0.22) return false;   // v6.0: daha seri
  g.lastShot = now; g.shots--; g.armed = true; PF.rec = 1; if (TK.t) TK.t.oyna('atis', 0.22);
  PF.aimYaw = Math.atan2(target.x - POFI.x, target.z - POFI.z);
  PF.holder.rotation.y = PF.yaw = PF.aimYaw;   // atis aninda hedefe donuk olsun ki top hortumdan ciksin
  if (TC.gun) { TC.aimYaw = Math.atan2(target.x - TC.holder.position.x, target.z - TC.holder.position.z); TC.holder.rotation.y = TC.yaw = TC.aimYaw; TC.rec = 1; }
  const st = trunkTip(TIP).clone();
  if (target.y < S * 0.5) target = target.clone().setY(S * 0.5);   // v6.1: alt siraya nisan: hedef en az alt kup ortasi, top yavas kavise girmesin
  // yay: v = (hedef - baslangic)/T - g*T/2. En kisa ucus suresi secilir ama top platformun on kenarini (z = R) en az
  // 0.9 yukaridan asmali, yoksa kenara carpip geri seker
  const dv = target.clone().sub(st), gy = world.gravity.y, sz = st.x * Math.sin(YAW) + st.z * Math.cos(YAW), tz = target.x * Math.sin(YAW) + target.z * Math.cos(YAW), edge = Math.min(1, Math.max(0, (sz - RZ) / Math.max(0.01, sz - tz)));
  let T = Math.max(0.08, dv.length() / 95);   // v6.10: (Adem) mermi daha da hizli (v6.9: 44)   // v6.5: biraz yavas, top gozle takip edilir   // v6.1: her yone ayni hiz (~44 birim/sn): yukari da asagi da ayni guc
  // v6.11: (Adem) alt siralara atis kavise girip yavasliyordu, karli koyde kare platformun kenarina takilip hic gitmiyordu:
  // mermi platforma carpmaz (carpisma filtresi), her hedefe duz ve ayni hizla gider
  const v = new CANNON.Vec3(dv.x / T, dv.y / T - 0.5 * gy * T, dv.z / T);
  const col = PF.col || '#3d9bff';
  const body = new CANNON.Body({ mass: 3.3, material: PM.ball, linearDamping: 0.01, allowSleep: false }); body.addShape(new CANNON.Sphere(BR)); body.collisionFilterGroup = 2; body.collisionFilterMask = ~4;
  body.position.set(st.x, st.y, st.z); body.velocity.copy(v); world.addBody(body);
  const tg = topGeo(), mesh = tg ? new THREE.Mesh(tg, topMat()) : new THREE.Mesh(BALLGEO, new THREE.MeshStandardMaterial({ color: col, roughness: 0.15, metalness: 0.1, emissive: col, emissiveIntensity: 0.45 })); mesh.castShadow = true; scene.add(mesh);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: SOFT, color: '#ffe6ff', transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(BR * 4.2); halo.visible = false; mesh.add(halo);
  const b = { body, mesh, halo, t: 0, hit: false, trail: [], col, dir: new THREE.Vector3(v.x, v.y, v.z).normalize(), sp: Math.hypot(v.x, v.y, v.z) };
  body.angularVelocity.set(-v.z * 0.9, 0, v.x * 0.9);   // ucarken one dogru donsun
  // ilk kupe carpista vurus dalgasi: carpisma adimin icinde gelir, itis adimdan sonra yapilir (b.blast)
  body.addEventListener('collide', (e) => { if (b.hit) return; const c = CUBE_OF.get(e.body); if (!c) return; b.hit = true; b.hc = c; b.blast = new THREE.Vector3().copy(body.position); b.slow = true; YUM.push([b.blast.clone(), b]); impact(b, e); });
  balls.push(b);
  g.combo = { n: 0, t: 0, shown: 0 };
  if (KAL()) FP = Math.min(6, FP + 1.4);
  muzzleFx(st, b.dir); sfx('shoot'); buzz(18); shake = Math.max(shake, 0.14); hud();
  $('hint').style.opacity = 0;
  return true;
}
let TOPG = null, TOPM = null;
// v6.2: yildizli top malzemesi daha canli (kendi isigi + yansima) ve etrafinda yumusak bir hale
function topMat() { return (TOPM = MOD.top.mat); }   // v6.4: (Adem) topun kendi rengi, ek parlama yok
function topGeo() {
  if (TOPG || !MOD.top) return TOPG;
  const g = MOD.top.geo.clone(), b = g.boundingBox, c = b.getCenter(new THREE.Vector3()), z = b.getSize(new THREE.Vector3());
  g.translate(-c.x, -c.y, -c.z); g.scale(2 * BR / z.x, 2 * BR / z.y, 2 * BR / z.z); g.computeBoundingSphere(); return (TOPG = g);
}
function impact(b, e) {
  if (KAL()) { impactK(b, e); return; }
  buzz([40, 30, 25], 0);   // v6.8: (Adem) kupe carpinca titresim
  wakeAll(); g.busy = 2.5; shake = Math.min(0.5, shake + 0.3);
  const p = new THREE.Vector3().copy(b.body.position); hitFlash(p); burst(p, '#fff3a0', 12, 8); sfx('hit');
}
// v5.3: atis guclendi. Top kupe degdigi an cevresindeki kupler (yaklasik 1.6 kup yaricap) top yonunde itilir;
// itis kupun merkezinin ustunden uygulandigi icin kup sadece kaymaz, devrilir. Agir malzeme (celik, tugla) daha az etkilenir.
const BLAST = { r: S * 1.05, hiz: 0, yukari: 0 };   // v6.14: yapay itme dalgasi kapali (sadece gercek carpisma)   // v6.7: (Adem) eski guce yakin, biraz yumusak   // v6.6: (Adem) kupler cok kolay deviriliyordu   // v6.3: test: ilk atis yapinin yarisini yikiyordu; simdi vurulan kirilir, yakindakiler sarsilir
const IMP = new CANNON.Vec3(), RP = new CANNON.Vec3();
// v6.0: dogrudan vurulan kup parcalara ayrilir (Royal Smash'teki gibi). Agir malzeme (tugla, celik), kendi kirilma/patlama
// kurali olanlar (cam, fici, bomba, recel kavanozu) parcalanmaz, sadece itilir.
// v6.1: (Adem) her sey kirilsin: celik haric hepsi topla dogrudan vurulunca parcalanir; fici/bomba patlar; yere dusen her blok kirilir.
const NOSHAT = new Set(['celik', 'fici', 'bomba', 'recel']);
const KCOL = { kola: '#c8102e', sandik: '#9a6532', hediye: '#3d7bff', yildiz: '#b878ff', altin: '#ffd23f', metal: '#6b7380', ahsap: '#9a6532', kirmizi: '#d83a2e', celik: '#8a9098', tugla: '#b5533a', fici: '#b8432c', bomba: '#3a3a3a', buz: '#bfe6ff', jole: '#ff7ab0', cam: '#cfefff', recel: '#e8203a', buz2: '#bfe6ff', buzDikey: '#bfe6ff', ahsap2: '#9a6532', alevUzun: '#7a6a62', morDikey: '#8a5cd6' };
// v6.2: model bloklarinin parca rengi, modelin kendi dokusunun ortalama rengi (Adem'in orijinal renkleri)
function avgCol(mat) {
  if (!mat || !mat.map || !mat.map.image) return null; if (mat.userData.avg) return mat.userData.avg;
  try { const c = document.createElement('canvas'); c.width = c.height = 16; const x = c.getContext('2d'); x.drawImage(mat.map.image, 0, 0, 16, 16); const d = x.getImageData(0, 0, 16, 16).data;
    let r = 0, g2 = 0, b = 0, n = 0; for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 128) continue; r += d[i]; g2 += d[i + 1]; b += d[i + 2]; n++; }
    const col = new THREE.Color().setRGB(r / n / 255, g2 / n / 255, b / n / 255, THREE.SRGBColorSpace); const hsl = {}; col.getHSL(hsl); col.setHSL(hsl.h, Math.min(1, hsl.s * 1.25), Math.min(0.62, hsl.l * 1.12));
    return (mat.userData.avg = '#' + col.getHexString()); } catch (e) { return null; }
}
// parca rengi icin doku ortalamasi ilk kirilista hesaplaniyordu (buyuk dokuda 100-200 ms takilma): acilista, kareleri bozmadan teker teker onceden hesapla
function avgIsit() { const ks = Object.keys(MOD).filter((k) => NEWM.has(k) && MOD[k] && MOD[k].mat); ks.forEach((k, i) => setTimeout(() => { try { avgCol(MOD[k].mat); } catch (e) {} }, 700 + i * 90)); }
function bColor(c) { const k = c.kind; if (!k) return c.col; if (k.startsWith('g_')) return GLASS[k.slice(2)][0]; return (MOD[k] && NEWM.has(k) && avgCol(MOD[k].mat)) || KCOL[k] || (SEK.TUR[k] && SEK.TUR[k].renk) || '#cccccc'; }
// parcalar blogun kendi malzemesiyle (Adem'in modellerinde gercek doku parcaciklari gorunur; cam parcalari cam)
function bMat(c) { const k = c.kind; if (k && k.startsWith('g_')) return glassMat(k.slice(2)); return null; }
function bChunk(c) { const k = c.kind; return c.sek ? c.sek.parca : k && MOD[k] && NEWM.has(k) ? MOD[k].mat : null; }
// bir blogu parcala: sayilir (knock), parcalar sacilir, tek kisa ses
function breakBlock(c, dir, n) {
  if (c.out) return; const p = new THREE.Vector3().copy(c.body.position), gl = c.kind && (c.kind.startsWith('g_') || c.kind === 'cam' || c.kind === 'buz' || c.kind === 'jole');
  const q = c.mesh.quaternion.clone(), d = dir || new THREE.Vector3(0, 0.3, -1);
  if (!c.gone) knock(c, true); else { c.out = true; world.removeBody(c.body); scene.remove(c.mesh); }
  // v6.16: Blender ile parcalanmis gercek parcalar (Adem'in modeli, kendi dokusuyla); yoksa eski efekt
  const real = realPieces(c, p, q, d, c.landed ? 6 : 99);
  shatter(p, bColor(c), d, bMat(c), real ? Math.round((n || 14) * 0.45) : n, real ? null : bChunk(c)); sfx('kir', c.kind);
}
// ---------------- v6.16: Blender parcalari ----------------
// model/parcali/<dosya>_parcali.glb: her parca ayri dugum (p00, p01...), merkezi kendi ortasinda, konumu modelin icindeki yeri.
// Blok kirilinca parcalar blogun durdugu aci ve olcekle yerine konur, sonra disari ve top yonune sacilir.
const PARFILE = new Set(['kup', 'kup_metal', 'kup_ahsap', 'kup_kirmizi', 'kup_tas', 'kup_altin', 'kup_ahsap_metal', 'varil', 'buz_silindir', 'piramit_tas', 'bal_kabagi',
  'buz_kup_2', 'buz_dikey_kup', 'alev_tas_uzun_kup', 'mor_dikey_kup']);   // sandik.glb ve ahsap_kup_2.glb ic ice yuzeyli, duzgun kesilmedi: eski efekt
const PAR = {};
let PARN = 0;   // sahnedeki gercek parca sayisi (telefon yorulmasin)
function loadPieces() {
  for (const f of PARFILE) {
    if (PAR[f] !== undefined) continue; PAR[f] = null;
    new GLTFLoader().load('model/parcali/' + f + '_parcali.glb?v=1', (gl) => {
      const L = [];
      for (const ch of gl.scene.children) {
        const nd = ch.clone(); const c = ch.position.clone(); nd.position.set(0, 0, 0);
        let hs = 0; nd.traverse((o) => { if (!o.isMesh) return; o.castShadow = true; o.geometry.computeBoundingSphere(); hs = Math.max(hs, o.geometry.boundingSphere.radius);
          if (o.material && o.material.name !== 'ic_yuzey' && !o.material.envMap) { o.material.envMap = NENV; o.material.envMapIntensity = 1; } });
        L.push({ nd, c, hs });
      }
      PAR[f] = L;
      if (KAL()) isitmaParca(L);
    }, undefined, () => {});
  }
}
function realPieces(c, p, q, dir, max) {
  const k = c.kind, f = k && MFILE[k], L = f && PAR[f], M = k && MOD[k];
  if (!L || !M || !M.fc || PARN > 180) return false;
  const fs = KEEP[k] && M.fsK ? M.fsK : M.fsC; if (!fs) return false;
  const list = L.length > max ? L.slice().sort(() => Math.random() - 0.5).slice(0, max) : L;
  const sm = (fs.x + fs.y + fs.z) / 3;
  for (const it of list) {
    const grp = new THREE.Group(), nd = it.nd.clone(); nd.scale.copy(fs); grp.add(nd);
    const off = it.c.clone().sub(M.fc).multiply(fs).applyQuaternion(q);
    grp.position.copy(p).add(off); grp.quaternion.copy(q); grp.userData.shared = true; scene.add(grp); PARN++;
    const ol = off.length() || 1, v = off.clone().multiplyScalar((3.5 + Math.random() * 3) / ol).addScaledVector(dir, 2.5 + Math.random() * 3);
    v.y += 3 + Math.random() * 3.5;
    const w = rndV(11), hs = Math.min(it.hs * sm, S * 0.45) * 0.55, life = 2.1 + Math.random() * 0.6;
    const st = {};
    fx(grp, life, (o, kk, dt) => {
      if (st.in) softPiece(o, v, w, st, hs, dt);
      else { v.y -= 26 * dt; o.position.addScaledVector(v, dt); o.rotation.x += w.x * dt; o.rotation.y += w.y * dt; o.rotation.z += w.z * dt; }
      const fl = floorAt(o.position.x, o.position.z) + hs;
      if (!st.in && softPiece(o, v, w, st, hs, dt)) { /* kuma/kara saplandi ya da suya dustu */ }
      else if (!st.in && o.position.y < fl && o.position.y > fl - 1.2) { o.position.y = fl; if (v.y < 0) { v.y *= -0.28; v.x *= 0.55; v.z *= 0.55; w.multiplyScalar(0.55); } }
      const sc = kk > 0.78 ? Math.max(0.001, (1 - kk) / 0.22) : 1; nd.scale.copy(fs).multiplyScalar(sc);
      if (kk >= 0.999 && !o.userData.cnt) { o.userData.cnt = 1; PARN--; }
    });
  }
  return true;
}
const KIRILGAN = new Set(['ahsap', 'sandik', 'kirmizi', 'hediye', 'buz', 'cam', 'kabak', 'jole', 'buz2', 'ahsap2', 'buzDikey', 'morDikey']);
function blast(b) {
  const c0 = b.hc;
  if (c0 && !c0.gone && !c0.out) {
    // v6.14: (Adem) kupler atistan kirilana kadar fizik kuralina uysun: vurulan kup aninda parcalanmaz, top onu gercekten iter;
    // sadece yere dusunce kirilir. Fici/bomba vurulunca patlar.
    // v6.15: (Adem) vurulunca mantiga uygun olan kirilir: tahta sandik, kirmizi tahta kasa, buz, cam, kabak, jole, hediye kutusu.
    // Metal, celik, tas, tugla, altin ve tas piramit kirilmaz, sadece itilir (yere dusunce kirilir).
    if (KIND[c0.kind] && KIND[c0.kind].boom && c0.fuse == null) { c0.fuse = 0; FUSE.push(c0); }
    else if (KIRILGAN.has(c0.kind)) breakBlock(c0, b.dir, 14);
    else sfx(c0.kind === 'celik' || c0.kind === 'metal' || c0.kind === 'altin' ? 'metal' : 'kir', c0.kind);
    if (!KAL()) buzz(28);
    if (c0.kind === 'kola') kolaFis(c0);
  }
  const p = b.blast, d = b.dir.clone(); d.y = Math.max(-0.2, Math.min(0.25, d.y)); d.normalize();
  for (const c of cubes) {
    if (c.gone || c.out) continue;
    const q = c.body.position, dx = q.x - p.x, dy = q.y - p.y, dz = q.z - p.z, dist = Math.hypot(dx, dy, dz);
    if (dist > BLAST.r) continue;
    const k = 1 - dist / BLAST.r, m = c.body.mass, sp = BLAST.hiz * (0.35 + 0.65 * k) / Math.max(1, m * 0.55);
    // top yonu + biraz merkezden disari + hafif yukari
    const rx = dist > 0.01 ? dx / dist : 0, rz = dist > 0.01 ? dz / dist : 0;
    IMP.set((d.x * 0.8 + rx * 0.3) * sp * m, (d.y * 0.5 + 0.12) * sp * m + BLAST.yukari * k * m, (d.z * 0.8 + rz * 0.3) * sp * m);
    RP.set(0, S * 0.27, 0);   // merkezin ustu: devirme torku
    c.body.wakeUp(); c.body.applyImpulse(IMP, RP);
  }
}
// Blok Smash 2. asama: (Adem: bir atis cok kup deviriyordu) top ilk kupe carpinca hizinin cogunu kaybeder, yapinin icinden surup gitmez
const TOPKAYIP = 0.45;
// v1.3: (Adem: alttaki kupu vurunca ustteki ziplıyor, bolumler pat pat geciyor) top cok hizli (95) oldugu icin carptigi kup ve
// komsulari 40-50 birim/sn hizla firliyordu. Her fizik adimindan sonra: carpisma noktasinin 3 birim cevresindeki kuplerin hizi sinirlanir,
// top hafifler; patlama disinda hicbir kup yukari firlamaz.
const YUM = [], VMAX = 13, VUP = 1.6, VUPG = 3.5; let BOOMT = -9;
world.addEventListener('postStep', () => {
  if (K || !g) return;
  const patlama = g.t - BOOMT < 0.9;
  while (YUM.length) { const [p, b] = YUM.pop();
    if (b && !b.hafif) { b.hafif = 1; b.body.velocity.scale(TOPKAYIP, b.body.velocity); b.body.mass = 2; b.body.updateMassProperties(); }
    if (patlama) continue;
    for (const c of cubes) { if (c.out) continue; const q = c.body.position; if ((q.x - p.x) ** 2 + (q.y - p.y) ** 2 + (q.z - p.z) ** 2 > 9) continue;
      const v = c.body.velocity; if (v.y > VUP) v.y = VUP; const h = Math.hypot(v.x, v.z); if (h > VMAX) { v.x *= VMAX / h; v.z *= VMAX / h; }
      const w = c.body.angularVelocity, wl = w.length(); if (wl > 4) w.scale(4 / wl, w); } }
  if (!patlama) for (const c of cubes) { if (c.out || c.gone) continue; const v = c.body.velocity; if (v.y > VUPG) v.y = VUPG; }
});
function updateBalls(dt) {
  for (let i = balls.length - 1; i >= 0; i--) {
    const b = balls[i]; b.t += dt; if (b.blast) { blast(b); b.blast = null; } if (b.slow) { b.slow = false; } if (b.yavas) { b.yavas = 0; b.body.velocity.scale(0.3, b.body.velocity); }   // ilk carpista enerjisini kaybeder, yapinin icinden gecip gitmez
    // v6.6: (hata) bu satir v6.3'ten beri yorumun icindeydi: top fizikte ucuyor ama gorunusu namlu onunde sabit kaliyordu
    if (b.hit) b.halo.material.opacity = Math.max(0, b.halo.material.opacity - dt * 2); b.mesh.position.copy(b.body.position); b.mesh.quaternion.copy(b.body.quaternion);
    // iz: arkasinda kuculen parlak toplar
    // v6.0: beyaz parlak iz - top hizliyken arkasinda ince bir isik cizgisi (araya ara noktalar eklenir ki kopuk gorunmesin)
    if (b.t < 1.2) { const pos = b.mesh.position, lp = b.lp || pos.clone(), n = Math.min(6, Math.ceil(lp.distanceTo(pos) / 0.25));
      for (let j = 1; j <= n; j++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: SOFT, color: '#e8e4dc', transparent: true, opacity: 0.35, depthWrite: false })); sp.position.lerpVectors(lp, pos, j / n); sp.scale.setScalar(BR * 1.3); scene.add(sp); b.trail.push({ m: sp, life: 0.2 }); }
      b.lp = pos.clone(); }
    for (let j = b.trail.length - 1; j >= 0; j--) { const p = b.trail[j]; p.life -= dt; const k = Math.max(0, p.life / 0.2); p.m.scale.setScalar(BR * 1.3 * (1.6 - 0.6 * k)); p.m.material.opacity = 0.35 * k; if (p.life <= 0) { scene.remove(p.m); p.m.material.dispose(); b.trail.splice(j, 1); } }
    if (!b.pc && b.body.position.y > BR + 0.05) { b.pc = 1; b.body.collisionFilterMask = -1; }   // v6.12: (hata) top platformun icinden dusuyordu: platform hizasini asinca platforma carpar
    if (!b.sunk && b.body.position.y < GY + BR * 1.1) { b.sunk = 1; const bx = b.body.position.x, bz = b.body.position.z; b.zn = zoneAt(bx, bz); if (b.zn === 'su') { splash(bx, bz, 0.9, true); if (K) sfx('su', 0); else sfx('yer', 'su'); } else if (b.zn === 'cim') { groundFx(bx, bz, 0.6); sfx('yer', 'kum'); } else { softBurst(b.zn, bx, bz, 0.6, b.body.velocity); sfx('yer', b.zn); } world.removeBody(b.body); }   // v6.17
    if (b.sunk) { b.sunk += dt; b.mesh.position.y = GY + BR - Math.min(1, b.sunk / (b.zn === 'su' ? 0.9 : 0.5)) * BR * (b.zn === 'kum' ? 1.1 : b.zn === 'kar' ? 1.5 : 2.4); }
    else if (b.t > 1.2 && b.body.velocity.length() < 1.2) b.rest = (b.rest || 0) + dt;
    if (b.rest > 0.6) b.mesh.scale.setScalar(Math.max(0.001, 1 - (b.rest - 0.6) / 0.4));
    if (b.body.position.y < -16 || b.t > 7 || b.sunk > 0.6 || b.rest > 1) { for (const p of b.trail) { scene.remove(p.m); p.m.material.dispose(); } world.removeBody(b.body); scene.remove(b.mesh); b.halo.material.dispose(); if (b.mesh.material !== TOPM) b.mesh.material.dispose(); balls.splice(i, 1); }
  }
}

// ---------------- v6.0 efektler: namlu parlamasi, duman, vurus parlamasi, kup parcalari, toz, konfeti ----------------
const SOFT = canvasTex(64, 64, (x, w, h) => { const gg = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gg.addColorStop(0, 'rgba(255,255,255,1)'); gg.addColorStop(0.35, 'rgba(255,255,255,.75)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gg; x.fillRect(0, 0, w, h); });
const FX = [];
function spr(col, add, op) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: SOFT, color: col, transparent: true, opacity: op, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: false })); scene.add(m); return m; }
function fx(o, life, upd) { FX.push({ o, life, max: life, upd }); }
function updateFX(dt) {
  for (let i = FX.length - 1; i >= 0; i--) {
    const f = FX[i]; f.life -= dt; const k = 1 - Math.max(0, f.life) / f.max; f.upd(f.o, k, dt);
    if (f.life <= 0) { if (!f.keep) { scene.remove(f.o); if (f.o.material && !f.o.userData.shared) f.o.material.dispose(); } FX.splice(i, 1); }
  }
}
const flashLight = new THREE.PointLight('#ffd6f0', 0, 16, 1.5); scene.add(flashLight);
function muzzleFx(p, dir) {
  // pembe-beyaz parlama: hizla buyur ve soner; namlu onune isik; arkasindan yukari suzulen beyaz duman
  const a = spr('#ffd0ec', true, 1); a.position.copy(p).addScaledVector(dir, 0.4);
  fx(a, 0.22, (o, k) => { o.scale.setScalar(0.6 + k * 1.4); o.material.opacity = 0.8 * (1 - k) ** 1.5; });   // v6.12: kucuk parlama, topu saklamaz
  const c = spr('#ffffff', true, 1); c.position.copy(p);
  fx(c, 0.1, (o, k) => { o.scale.setScalar(0.4 + k * 0.8); o.material.opacity = 0.8 * (1 - k); });
  flashLight.position.copy(p); flashLight.intensity = 60;
  for (let i = 0; i < 7; i++) {
    const m = spr('#f4f0f6', false, 0.35), v = dir.clone().multiplyScalar(-0.5 - Math.random() * 1).add(new THREE.Vector3((Math.random() - 0.5) * 1.6, 0.6 + Math.random() * 1.2, (Math.random() - 0.5) * 1.6));
    m.position.copy(p); const s0 = 0.5 + Math.random() * 0.4;
    fx(m, 0.6 + Math.random() * 0.4, (o, k, dt) => { o.position.addScaledVector(v, dt); v.multiplyScalar(1 - dt * 3); o.scale.setScalar(s0 * 0.6 + k * 1.1); o.material.opacity = 0.35 * (1 - k); });   // v6.12: ince duman, namlunun arkasina/yukari suzulur
  }
}
function hitFlash(p) {
  const a = spr('#ffffff', true, 1); a.position.copy(p);
  fx(a, 0.16, (o, k) => { o.scale.setScalar(1.5 + k * 3); o.material.opacity = 1 - k; });
  const r = spr('#ffe48a', true, 0.8); r.position.copy(p);
  fx(r, 0.3, (o, k) => { o.scale.setScalar(2 + k * 4.5); o.material.opacity = 0.8 * (1 - k) ** 2; });
}
// v6.2 kirilma: beyaz halka parlamasi + blogun gercek dokulu 4 iri parcasi + renkli kucuk kirintilar + parilti yildizlari.
// Parcalar top yonunde ve disari sacilir, doner, platforma/zemine seker, kuculup kaybolur.
const SHGEO = [new THREE.BoxGeometry(1, 1, 1), new THREE.TetrahedronGeometry(0.8), new THREE.BoxGeometry(1, 0.45, 0.8), new THREE.OctahedronGeometry(0.7)];
const CHGEO = roundBox(1, 1, 1, 0.08, 2), SHMAT = {};
const STAR = canvasTex(64, 64, (x, w, h) => { x.translate(w / 2, h / 2); x.fillStyle = '#fff'; x.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 6 : 30, a = i * Math.PI / 4; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.fill(); });
function piece(m, p, dir, sz, spd, life) {
  m.scale.setScalar(sz); m.castShadow = true; m.userData.shared = true;
  m.position.set(p.x + (Math.random() - 0.5) * S * 0.6, p.y + (Math.random() - 0.5) * S * 0.6, p.z + (Math.random() - 0.5) * S * 0.6);
  m.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
  const out = m.position.clone().sub(p).normalize(), v = out.multiplyScalar(spd * (0.6 + Math.random() * 0.8)).addScaledVector(dir, spd * (0.4 + Math.random() * 0.6)); v.y += 2.5 + Math.random() * 4;
  const w = new THREE.Vector3((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 16);
  scene.add(m);
  const st = {};
  fx(m, life, (o, k, dt) => {
    if (st.in) { softPiece(o, v, w, st, sz * 0.45, dt); o.scale.setScalar(sz * (k > 0.7 ? Math.max(0, (1 - k) / 0.3) : 1)); return; }
    v.y -= 24 * dt; o.position.addScaledVector(v, dt); o.rotation.x += w.x * dt; o.rotation.y += w.y * dt; o.rotation.z += w.z * dt;
    if (softPiece(o, v, w, st, sz * 0.45, dt)) return;
    const fl = floorAt(o.position.x, o.position.z) + sz * 0.45;
    if (o.position.y < fl && o.position.y > fl - 1.2) { o.position.y = fl; if (v.y < 0) { v.y *= -0.32; v.x *= 0.55; v.z *= 0.55; w.multiplyScalar(0.5); } }
    o.scale.setScalar(sz * (k > 0.7 ? Math.max(0, (1 - k) / 0.3) : 1));
  });
}
function shatter(p, col, dir, mat0, cnt, chunkMat) {
  const mat = mat0 || SHMAT[col] || (SHMAT[col] = new THREE.MeshStandardMaterial({ color: col, roughness: 0.45, metalness: 0.05, emissive: col, emissiveIntensity: 0.18 }));
  const N = cnt || 14;
  // halka parlama
  const ring = spr('#ffffff', true, 0.9); ring.position.copy(p); fx(ring, 0.22, (o, k) => { o.scale.setScalar(S * (0.8 + k * 2.4)); o.material.opacity = 0.9 * (1 - k); });
  // iri dokulu parcalar (blogun kendisi gibi gorunur)
  if (chunkMat) for (let i = 0; i < 4; i++) piece(new THREE.Mesh(CHGEO, chunkMat), p, dir, S * (0.32 + Math.random() * 0.12), 6, 1.6 + Math.random() * 0.4);
  // renkli kirintilar
  for (let i = 0; i < N; i++) piece(new THREE.Mesh(SHGEO[i % 4], mat), p, dir, S * (0.1 + Math.random() * 0.14), 8, 1.1 + Math.random() * 0.5);
  // parilti yildizlari
  for (let i = 0; i < 5; i++) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: STAR, color: i % 2 ? '#ffffff' : col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(m);
    const v = new THREE.Vector3((Math.random() - 0.5) * 6, 2 + Math.random() * 4, (Math.random() - 0.5) * 6).addScaledVector(dir, 2); m.position.copy(p); const s0 = 0.35 + Math.random() * 0.3;
    fx(m, 0.45 + Math.random() * 0.25, (o, k, dt) => { v.y -= 10 * dt; o.position.addScaledVector(v, dt); o.material.rotation += dt * 6; o.scale.setScalar(s0 * (k < 0.3 ? k / 0.3 : 1 - (k - 0.3) / 0.7 * 0.8)); o.material.opacity = 1 - k * k; });
  }
  // toz bulutu
  for (let i = 0; i < 4; i++) {
    const m = spr(col, false, 0.55), v = new THREE.Vector3((Math.random() - 0.5) * 3, 0.6 + Math.random() * 1.5, (Math.random() - 0.5) * 3); m.position.copy(p); const s0 = 0.7 + Math.random() * 0.5;
    fx(m, 0.6, (o, k, dt) => { o.position.addScaledVector(v, dt); o.scale.setScalar(s0 * (1 + k * 1.6)); o.material.opacity = 0.55 * (1 - k); });
  }
}
// v6.5: (Adem) dusen blok zeminde sekmez: fona gore kara gomulur (kar tozu), kuma oturur (kum sicramasi) ya da cimene/topraga
// saplanir (toprak ve cimen parcalari). Fizikten cikar, yavasca batar, sonra zemine girip kaybolur.
function zemin() { if (K) return 'su'; const f = (fonOf(LV) || {}).f || ''; return f.startsWith('kar') ? 'kar' : f.startsWith('sahil') || f === 'koy' ? 'su' : 'cim'; }
const ZFX = { kar: { toz: '#ffffff', toz2: 3, par: ['#ffffff', '#eef6ff', '#dfeeff'], bat: 0.62, n: 22, up: 6.5 }, kum: { toz: '#f1d9a6', toz2: 2.4, par: ['#f3dcae', '#e6c88e', '#d8b678'], bat: 0.4, n: 18, up: 5.5 }, su: { toz: '#e8f8ff', toz2: 1.6, par: ['#ffffff', '#c9f1ff', '#8fdcff', '#5cc8f0'], bat: 1.35, n: 24, up: 8.5, halka: 1, kolon: 1 }, cim: { toz: '#b89468', toz2: 2, par: ['#6b4a2c', '#8a6238', '#4fae3c', '#3d8f2e'], bat: 0.28, n: 16, up: 5 } };
// v6.13: (Adem) efekt gorunmuyordu (parcaciklar kucuktu) ve dusen her cisim kirilsin: blok zemine degince parcalanir,
// parcalar zemine batar; zemine gore buyuk su sicramasi + halkalar, kar bulutu ya da kum puskurmesi.
function land(c) {
  const p = new THREE.Vector3().copy(c.body.position), h = c.h || S, zn0 = zoneAt(p.x, p.z);
  if (zn0 !== 'cim' && c.mesh) { softLand(c, zn0); return; }   // v6.17: (Adem) kuma/kara dusen gomulur, suya dusen batar
  c.landed = 2;
  groundFx(p.x, p.z, 1);
  const sL = KAL() ? Math.min(1.3, 0.35 + (c.vimp || 0) / 18) : 0, mL = MAT_P[matSnd(c.kind)] || MAT_P.tahta;
  if (sL) { withS(sL * mL.v, mL.r * (1.06 - 0.14 * Math.min(1, sL)), () => breakBlock(c, new THREE.Vector3(0, 1, 0), 10)); darbeHaptik(c.kind, sL * mL.w); shake = Math.max(shake, 0.04 + 0.12 * sL * sL); }
  else { breakBlock(c, new THREE.Vector3(0, 1, 0), 10); buzz(22, 90); shake = Math.max(shake, 0.07); }
}

// ---------------- v6.17: gercekci zemin: deniz, kum, kar ----------------
// (Adem 5 Kas 2026) kuma dusen kuma gomulur, suya dusen suya batar, kara dusen kara saplanir.
// Sahil bolumlerinde platformun arkasi gercek (dalgali) deniz, onu ve yanlari kum. Tahta, buz, fici yuzer; tas, metal, altin batar.
const SEA = { mesh: null, z0: -8, t: 0, on: false };
const SEAMAT = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false,
  uniforms: { t: { value: 0 }, z0: { value: -8 }, sunDir: { value: new THREE.Vector3(-0.35, 0.75, -0.55).normalize() } },
  vertexShader: `varying vec3 vW; uniform float t;
    void main() { vec4 w = modelMatrix * vec4(position, 1.0);
      w.y += 0.07 * sin(w.x * 0.8 + t * 1.7) + 0.05 * sin(w.z * 1.1 - t * 1.3);
      vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: `varying vec3 vW; uniform float t; uniform float z0; uniform vec3 sunDir;
    void main() {
      float d = z0 - vW.z + 0.18 * sin(vW.x * 0.45 + 1.3) + 0.12 * sin(vW.x * 1.3 - t * 0.8);
      if (d < 0.0) { float wet = smoothstep(-1.6, 0.0, d); gl_FragColor = vec4(0.62, 0.50, 0.34, wet * 0.45); return; }
      float nx = 0.056 * cos(vW.x * 0.8 + t * 1.7) + 0.03 * cos(vW.x * 3.1 + vW.z * 2.3 + t * 2.4) + 0.015 * sin(vW.x * 7.0 - t * 3.1);
      float nz = 0.055 * cos(vW.z * 1.1 - t * 1.3) + 0.03 * sin(vW.x * 2.7 - vW.z * 3.3 + t * 2.1) + 0.015 * cos(vW.z * 6.0 + t * 2.7);
      vec3 n = normalize(vec3(-nx * 5.0, 1.0, -nz * 5.0)), v = normalize(cameraPosition - vW);
      float fr = pow(1.0 - max(dot(n, v), 0.0), 3.0);
      vec3 col = mix(vec3(0.36, 0.88, 0.86), vec3(0.04, 0.42, 0.68), smoothstep(0.0, 9.0, d));
      col = mix(col, vec3(0.78, 0.93, 1.0), fr * 0.55);
      col += vec3(1.0, 0.97, 0.9) * pow(max(dot(n, normalize(sunDir + v)), 0.0), 140.0) * 1.8;
      float lap = 0.45 + 0.4 * sin(t * 1.1);
      float foam = (1.0 - smoothstep(lap, lap + 0.55, d)) * (0.65 + 0.35 * sin(vW.x * 5.0 + t * 2.6));
      col = mix(col, vec3(1.0), clamp(foam, 0.0, 1.0) * 0.9);
      float a = mix(0.84, 0.95, smoothstep(0.0, 6.0, d)) * (1.0 - smoothstep(45.0, 75.0, d));
      gl_FragColor = vec4(col, max(a, foam * 0.9)); }`
});
// v6.18: (Adem) kuma dusen bloklar suya batiyor gibi gorunuyordu: fondaki resimde platformun altina denk gelen yer cizili deniz.
// Sahilde platformun alti ve onu gercek 3B kum zemin (Adem'in sahil resminin on plan kumundan doku), arkasi deniz.
const SAND = { mesh: null };
function setSand(on) {
  if (!SAND.mesh && on) {
    const t = new THREE.TextureLoader().load('doku/kum_zemin.webp?v=1'); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping; t.repeat.set(9, 7); t.anisotropy = 8;
    SAND.mesh = new THREE.Mesh(new THREE.PlaneGeometry(240, 120), new THREE.MeshStandardMaterial({ map: t, roughness: 1, color: new THREE.Color(1.08, 1.04, 0.98) }));
    SAND.mesh.rotation.x = -Math.PI / 2; SAND.mesh.receiveShadow = true; scene.add(SAND.mesh);
  }
  if (SAND.mesh) { SAND.mesh.visible = on; SAND.mesh.position.set(0, GY + 0.004, SEA.z0 + 60 - 0.3); }
}
function setSea(fo) {
  SEA.on = fo.f.startsWith('sahil');
  if (!SEA.mesh) { SEA.mesh = new THREE.Mesh(new THREE.PlaneGeometry(220, 84, 110, 42), SEAMAT); SEA.mesh.rotation.x = -Math.PI / 2; SEA.mesh.renderOrder = 1; scene.add(SEA.mesh); }
  SEA.mesh.visible = SEA.on && !fo.vid; SEA.z0 = -(RZ + 0.9); SEAMAT.uniforms.z0.value = SEA.z0;
  SEA.mesh.position.set(0, GY + 0.04, SEA.z0 - 40);
  setOcc(fo);
  setSand(SEA.on && !fo.vid);
  // v6.29: (Adem) fon videoysa 3B deniz cizilmez (videonun ustunde keskin kiyi cizgisi ve kumda kayan koyu leke yapiyordu); ayak kara/kuma hafif gomulur
  const kk = fo.f.startsWith('kar'), gom = OCC.mesh.visible, mu = LEG.userData.mm;
  mu.color.set(kk ? '#eef4ff' : '#d6b475'); mu.emissive.set(kk ? '#9db4d8' : '#8a6a3a');
  const koy = fo.f === 'koy', suda = koy || (fo.f.startsWith('sahil') && !PLS.some((q) => q.leg && q.leg !== LEG));
  setLeg(suda ? 1.2 : gom ? 0.3 : 0); for (const q of PLS) if (q.leg && q.leg !== LEG) { setLeg(koy ? 1.2 : gom ? 0.3 : 0, q.leg); for (const n of [2, 3, 4, 5, 6]) if (q.leg.children[n] && (koy || n < 5)) q.leg.children[n].visible = !koy; }
  HAVUZ.visible = false; if (suda) { LEG.userData.mound.visible = false; LEG.userData.shade.visible = false; }
  // v3.4: (Adem 11 Kas) su birikintisi begenilmedi: sahilde alt kaide yok, yalniz dikey direk suyun icine iner (yer alti gizli)
  for (const k of ['base', 'ring', 'cap']) LEG.userData[k].visible = !suda;
  DIRT.visible = !gom && fo.f !== 'koy';   // v6.26: video fonda on plandaki kum ve kiyiya vuran dalgalar videonun kendisi (3B kum ortmesin)
}
// v6.27: (Adem) karda ve kumda kup gercekten icinde gorunsun: yerin altini gizleyen gorunmez derinlik duzlemi (kup yarisi gomulur)
// ve kupun etrafinda kar/kum seti. Denizde bu duzlem yok: batan kup suyun altinda gorunur.
const OCC = { mesh: null }, RIMB = new THREE.SphereGeometry(1, 10, 7), RIMM = {};
function setOcc(fo) {
  const kar = fo.f.startsWith('kar'), sahil = fo.f.startsWith('sahil');
  if (!OCC.mesh) { OCC.mesh = new THREE.Mesh(new THREE.PlaneGeometry(240, 120), new THREE.MeshBasicMaterial({ colorWrite: false })); OCC.mesh.rotation.x = -Math.PI / 2; OCC.mesh.renderOrder = -10; scene.add(OCC.mesh); }
  OCC.mesh.visible = kar || sahil || fo.f === 'koy';
  if (kar || fo.vid) OCC.mesh.position.set(0, GY - 0.004, 0);   // v6.29: video sahilde batan kup suyun yuzeyinde kaybolur
  else if (sahil) OCC.mesh.position.set(0, GY - 0.004, SEA.z0 + 60 - 0.3);
}
function rimOf(zn, c, x, z) {   // gomulen kupun etrafinda duzensiz kar/kum yigini (duz levha gibi durmasin)
  const mat = RIMM[zn] || (RIMM[zn] = new THREE.MeshStandardMaterial({ color: zn === 'kar' ? '#eef4ff' : '#e4c995', roughness: 1, emissive: zn === 'kar' ? '#9db4d8' : '#a98a55', emissiveIntensity: 0.1 }));
  const grp = new THREE.Group(), h = c.h || S, n = 9;
  for (let i = 0; i < n; i++) {
    const a = i / n * 6.283 + (Math.random() - 0.5) * 0.55, rr = h * (0.5 + Math.random() * 0.14), sz = h * (0.17 + Math.random() * 0.15);
    const bl = new THREE.Mesh(RIMB, mat); bl.position.set(Math.cos(a) * rr, 0, Math.sin(a) * rr); bl.scale.set(sz * 1.2, sz * (0.5 + Math.random() * 0.25), sz * 1.2); bl.receiveShadow = true; grp.add(bl);
  }
  grp.position.set(x, GY, z); grp.rotation.y = Math.random() * 6.283; grp.scale.setScalar(0.01); scene.add(grp);
  fx(grp, 0.3, (o, k) => o.scale.setScalar(Math.max(0.01, 1 - (1 - k) ** 3))); FX[FX.length - 1].keep = true;
  return grp;
}
function updSea(dt) { SEA.t += dt; SEAMAT.uniforms.t.value = SEA.t; }
function seaY(x, z) { return GY + 0.04 + 0.07 * Math.sin(x * 0.8 + SEA.t * 1.7) + 0.05 * Math.sin(z * 1.1 - SEA.t * 1.3); }
function zoneAt(x, z) {
  if (K) return K.zone(x, z);
  const f = (fonOf(LV) || {}).f || '';
  if (f.startsWith('kar')) return 'kar';
  if (f === 'koy') return 'su';   // v3.16: korsan koyu videosu: platform denizde
  if (f.startsWith('sahil')) return z < SEA.z0 - 0.18 * Math.sin(x * 0.45 + 1.3) ? 'su' : 'kum';
  return 'cim';
}
// yuzenler (tahta, buz, fici, kabak) ve batanlar (tas, metal, altin, cam, jole)
const FLOAT = new Set(['ahsap', 'ahsap2', 'sandik', 'hediye', 'kirmizi', 'ahsapmetal', 'kabak', 'fici', 'bomba', 'buz', 'buz2', 'buzDikey', 'yildiz']);
const QE = new THREE.Euler();
function flatQuat(q, tall) {
  QE.setFromQuaternion(q, 'YXZ'); const sn = (a) => Math.round(a / (Math.PI / 2)) * (Math.PI / 2);
  QE.x = sn(QE.x); QE.z = sn(QE.z); if (tall && Math.abs(Math.cos(QE.x)) > 0.5 && Math.abs(Math.cos(QE.z)) > 0.5) QE.x = Math.PI / 2;   // sutun yatarak yuzer
  return new THREE.Quaternion().setFromEuler(QE);
}
function softLand(c, zn) {
  const b = c.body, p = new THREE.Vector3().copy(b.position), v = new THREE.Vector3().copy(b.velocity), h = c.h || S;
  world.removeBody(b); c.landed = true; c.lt = 0; c.zn = zn; c.v = v; c.w = new THREE.Vector3().copy(b.angularVelocity).multiplyScalar(0.6);
  c.mesh.position.copy(p); c.mesh.quaternion.copy(b.quaternion); c.y0 = p.y; c.flt = zn === 'su' && FLOAT.has(c.kind) && !K;   // v6.22: korsanda her sey hemen batar c.bub = 0;
  const sp = Math.min(1.7, 0.55 + Math.abs(v.y) / 14), sz = Math.max(0.65, h / S);
  if (zn === 'su') { splash(p.x, p.z, sp * sz, true); c.y0 = seaY(p.x, p.z); }
  else { softBurst(zn, p.x, p.z, sp * sz, v); c.cr = crater(zn, p.x, p.z, S * 0.75 * sz); c.rim = rimOf(zn, c, p.x, p.z); }
  c.bat = (zn === 'kar' ? h * (0.3 + 0.12 * Math.random()) : zn === 'kum' ? h * (0.16 + 0.08 * Math.random()) : 0) * Math.min(1.25, 0.6 + Math.abs(v.y) / 30);   // v6.18: hizla dusen daha derine saplanir
  sfx('yer', zn); buzz(18, 90); shake = Math.max(shake, 0.05);
}
function landTick(c, dt) {
  c.lt += dt; const m = c.mesh, h = c.h || S;
  if (c.zn === 'su') {
    const sy = seaY(m.position.x, m.position.z);
    if (c.flt && c.lt < 3.4) {   // yuzer: bir dalar, geri cikar, dalgayla iner kalkar, yavasca duz yatar
      const tgt = sy - h * 0.16; c.v.y += ((tgt - m.position.y) * 26 - c.v.y * 4.2) * dt;
      c.v.x *= 1 - dt * 1.6; c.v.z = c.v.z * (1 - dt * 1.6) - dt * 0.35;
      m.quaternion.slerp(c.qf || (c.qf = flatQuat(m.quaternion, KEEP[c.kind] === 'tall')), dt * 1.4);
      c.ph = (c.ph || Math.random() * 6) + dt; m.rotateZ(Math.sin(c.ph * 2.1) * dt * 0.06);
      if (c.lt > 0.6 && Math.random() < dt * 2) ripple(m.position.x, m.position.z, 0.7);
    } else {   // batar: suyun icinde yavaslar, takla atarak dibe iner, kabarcik birakir
      c.v.x *= 1 - dt * 2.6; c.v.z *= 1 - dt * 2.6; c.v.y += (-(c.flt ? 0.7 : K ? 3.6 : 2.0) - c.v.y) * dt * (K ? 6 : 3.5);
      m.rotateX(c.w.x * dt * 0.25); m.rotateZ(c.w.z * dt * 0.25); c.w.multiplyScalar(1 - dt * 0.8);
      c.bub += dt; if (c.bub > 0.09 && m.position.y > GY - 6) { c.bub = 0; bubble(m.position.x + (Math.random() - 0.5) * h * 0.6, m.position.y + h * 0.3, m.position.z + (Math.random() - 0.5) * h * 0.6); }
    }
    m.position.addScaledVector(c.v, dt);
    if (m.position.y < GY - h * 3.4 || c.lt > 8) { c.out = true; scene.remove(m); }
    return;
  }
  // kar / kum: carpinca icine saplanir (egik kalir), bir sure durur, sonra yavasca gomulur
  const k = Math.min(1, c.lt / (c.zn === 'kar' ? 0.26 : 0.16)), e = 1 - (1 - k) ** 3;
  if (k < 1) { m.position.x += c.v.x * dt * (1 - k) * 0.35; m.position.z += c.v.z * dt * (1 - k) * 0.35; m.rotateX(c.w.x * dt * 0.15); m.rotateZ(c.w.z * dt * 0.15); }
  m.position.y = c.y0 - c.bat * e;
  if (c.lt > 6.5) {   // v6.18: asagi inmez; yerinde kucukup kaybolur (oyun alani dolmasin)
    if (!c.pf) { c.pf = 1; softBurst(c.zn, m.position.x, m.position.z, 0.35, null); }
    const q = Math.min(1, (c.lt - 6.5) / 0.35); m.scale.setScalar(Math.max(0.001, 1 - q)); if (c.cr) c.cr.material.opacity = 0.9 * (1 - q); if (c.rim) { c.rim.scale.multiplyScalar(Math.max(0.001, 1 - q * 0.08)); c.rim.position.y -= q * 0.02; }
    if (q >= 1) { c.out = true; scene.remove(m); m.scale.setScalar(1); if (c.cr) { scene.remove(c.cr); c.cr.material.dispose(); } if (c.rim) { scene.remove(c.rim); c.rim = null; } } }
}
// su sicramasi: tac seklinde damlalar, ortada yukselen su kolonu, kopuk ve halkalar
function splash(x, z, s, big) {
  const y = seaY(x, z) + 0.05, n = Math.round((big ? 30 : 9) * Math.min(1.5, s));
  for (let i = 0; i < n; i++) {
    const a = i / n * 6.283 + Math.random() * 0.25, r = (big ? 0.55 : 0.2) * s, m = spr(i % 3 ? '#ffffff' : '#c6f1ff', false, 0.95);
    const sp = (big ? 2 : 1.2) * (0.7 + Math.random() * 0.8) * s, w = new THREE.Vector3(Math.cos(a) * sp, (big ? 6.5 : 3.5) * (0.7 + Math.random() * 0.6) * Math.sqrt(s), Math.sin(a) * sp);
    m.position.set(x + Math.cos(a) * r, y, z + Math.sin(a) * r); const s0 = (big ? 0.3 : 0.15) * (0.7 + Math.random() * 0.6);
    fx(m, 0.85 + Math.random() * 0.25, (o, k, dt) => { w.y -= 22 * dt; o.position.addScaledVector(w, dt); if (o.position.y < y - 0.05) { o.position.y = y - 0.05; w.set(0, 0, 0); } o.scale.set(s0, s0 * (1 + Math.min(1.6, Math.abs(w.y) * 0.1)), 1); o.material.opacity = 0.95 * (1 - k * k); });
  }
  if (big) for (let i = 0; i < 10; i++) {   // kolon
    const m = spr(i % 2 ? '#ffffff' : '#d8f6ff', false, 0.9), w = new THREE.Vector3((Math.random() - 0.5) * 0.9, (5.5 + Math.random() * 4.5) * Math.sqrt(s), (Math.random() - 0.5) * 0.9);
    m.position.set(x, y, z); const s0 = (0.45 + Math.random() * 0.35) * Math.min(1.4, s);
    fx(m, 0.8, (o, k, dt) => { w.y -= 20 * dt; o.position.addScaledVector(w, dt); if (o.position.y < y) { o.position.y = y; w.set(0, 0, 0); } o.scale.set(s0 * (1 + k * 0.6), s0 * (1.6 - k * 0.6), 1); o.material.opacity = 0.9 * (1 - k); });
  }
  foam(x, z, (big ? 1.3 : 0.55) * s);
  ripple(x, z, (big ? 2.3 : 1) * s); if (big) setTimeout(() => ripple(x, z, 1.6 * s), 220);
}
const FOAMT = canvasTex(128, 128, (x, w, h) => { for (let i = 0; i < 70; i++) { const a = Math.random() * 6.283, r = Math.random() * w * 0.38; x.fillStyle = 'rgba(255,255,255,' + (0.35 + Math.random() * 0.5) + ')'; x.beginPath(); x.arc(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r, 2 + Math.random() * 7, 0, 6.283); x.fill(); } });
function foam(x, z, s) {
  const m = new THREE.Mesh(SPLGEO, new THREE.MeshBasicMaterial({ map: FOAMT, transparent: true, opacity: 0.9, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, GY + 0.12, z); m.renderOrder = 2; scene.add(m);
  fx(m, 1.6, (o, k) => { o.scale.setScalar(s * (0.6 + k * 0.9)); o.position.y = seaY(o.position.x, o.position.z) + 0.07; o.material.opacity = 0.9 * (1 - k); });
}
function bubble(x, y, z) {
  const m = spr('#eaffff', false, 0.7); m.position.set(x, y, z); const s0 = 0.08 + Math.random() * 0.1, vy = 1.8 + Math.random() * 1.2;
  fx(m, 1.4, (o, k, dt) => { o.position.y += vy * dt; o.position.x += Math.sin(k * 18) * dt * 0.3; o.scale.setScalar(s0 * (1 + k)); const top = seaY(o.position.x, o.position.z); if (o.position.y >= top) { o.position.y = top; o.material.opacity *= 0.8; } else o.material.opacity = 0.7; });
}
// kar ve kum: carpan blogun cevresine toz bulutu ve topaklar savrulur
const SOFTC = { kar: { puf: ['#ffffff', '#f2f8ff', '#e4efff'], top: ['#ffffff', '#eef5ff'], n: 22, up: 5.5, puff: 1.25 }, kum: { puf: ['#f1d9a6', '#e8cc94', '#f6e4bc'], top: ['#e2c288', '#d4b070', '#f0d6a2'], n: 26, up: 4.2, puff: 0.9 } };
function softBurst(zn, x, z, s, v) {
  const C2 = SOFTC[zn], hx = v ? v.x * 0.15 : 0, hz = v ? v.z * 0.15 : 0;
  for (let i = 0; i < C2.n; i++) {   // topaklar / kum taneleri
    const m = spr(C2.top[i % C2.top.length], false, 1), a = Math.random() * 6.283, r = (1.2 + Math.random() * 2.6) * s;
    const w = new THREE.Vector3(Math.cos(a) * r + hx, C2.up * (0.6 + Math.random() * 0.7) * Math.sqrt(s), Math.sin(a) * r + hz);
    m.position.set(x + Math.cos(a) * 0.5, GY + 0.15, z + Math.sin(a) * 0.5); const s0 = (zn === 'kar' ? 0.2 : 0.11) * (0.6 + Math.random() * 0.8);
    fx(m, 0.9 + Math.random() * 0.4, (o, k, dt) => { w.y -= 22 * dt; o.position.addScaledVector(w, dt); if (o.position.y < GY + 0.06) { o.position.y = GY + 0.06; w.set(0, 0, 0); } o.scale.setScalar(s0); o.material.opacity = k > 0.7 ? (1 - k) / 0.3 : 1; });
  }
  for (let i = 0; i < 9; i++) {   // toz bulutu: alcakta yayilir, yavasca dagilir
    const m = spr(C2.puf[i % C2.puf.length], false, 0.8), a = Math.random() * 6.283, w = new THREE.Vector3(Math.cos(a) * (1.4 + Math.random() * 1.6) * s, 0.5 + Math.random() * 1.4, Math.sin(a) * (1.4 + Math.random() * 1.6) * s);
    m.position.set(x, GY + 0.35, z); const s0 = (0.9 + Math.random() * 0.6) * C2.puff * Math.min(1.5, s);
    fx(m, 1.1 + Math.random() * 0.5, (o, k, dt) => { o.position.addScaledVector(w, dt); w.multiplyScalar(1 - dt * 2.2); o.scale.setScalar(s0 * (1 + k * 1.8)); o.material.opacity = 0.8 * (1 - k) ** 1.4; });
  }
}
// gomulen blogun cevresinde kalan cukur (kar: golgeli beyaz cukur, kum: koyu ic, acik kenar)
const CRT = {};
function crater(zn, x, z, r) {
  const t = CRT[zn] || (CRT[zn] = canvasTex(128, 128, (c, w, h) => {
    const gg = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    if (zn === 'kar') { gg.addColorStop(0, 'rgba(150,175,210,.75)'); gg.addColorStop(0.55, 'rgba(190,210,235,.55)'); gg.addColorStop(0.72, 'rgba(255,255,255,1)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); }
    else { gg.addColorStop(0, 'rgba(150,112,64,.7)'); gg.addColorStop(0.55, 'rgba(196,158,104,.5)'); gg.addColorStop(0.74, 'rgba(246,226,184,.95)'); gg.addColorStop(1, 'rgba(246,226,184,0)'); }
    c.fillStyle = gg; c.fillRect(0, 0, w, h); }));
  const m = new THREE.Mesh(SPLGEO, new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.9, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.rotation.z = Math.random() * 6; m.position.set(x, GY + 0.03, z); m.scale.setScalar(r * 0.2); scene.add(m);
  fx(m, 0.25, (o, k) => o.scale.setScalar(r * (0.2 + 0.8 * (1 - (1 - k) ** 2)))); FX[FX.length - 1].keep = true;
  return m;
}
// parcalar ve kirintilar: suya duserse kucuk sicrama + batar, kara/kuma duserse saplanir (sekmez)
function softPiece(o, v, w, st, hs, dt) {
  if (!st.in) {
    if (o.position.y - hs > GY + 0.06 || floorAt(o.position.x, o.position.z) !== GY) return false;
    const zn = zoneAt(o.position.x, o.position.z); if (zn === 'cim') return false;
    st.in = zn;
    if (zn === 'su') { if (PIECEFX++ < 40) splash(o.position.x, o.position.z, 0.3 + hs, false); v.multiplyScalar(0.3); }
    else { if (PIECEFX++ < 40) softBurst(zn, o.position.x, o.position.z, 0.25 + hs * 0.6, null); v.set(0, 0, 0); w.set(0, 0, 0); st.y = GY + hs * 0.15; o.position.y = st.y; }
  }
  if (st.in === 'su') { v.x *= 1 - dt * 3; v.z *= 1 - dt * 3; v.y += (-1.3 - v.y) * dt * 4; o.position.addScaledVector(v, dt); w.multiplyScalar(1 - dt * 2); o.rotation.x += w.x * dt; o.rotation.z += w.z * dt; }
  return true;
}
let PIECEFX = 0; setInterval(() => { PIECEFX = 0; }, 400);
// zemin efekti (s: buyukluk carpani; blok 1, top 0.6)
function groundFx(x, z0, s) {
  const zn = zemin(), z = ZFX[zn];
  for (let i = 0; i < z.n; i++) {
    const m = spr(z.par[i % z.par.length], false, 0.95), a = Math.random() * 6.283, r = (1.5 + Math.random() * 2.5) * s;
    const w = new THREE.Vector3(Math.cos(a) * r, z.up * (0.7 + Math.random() * 0.7) * (0.6 + 0.4 * s), Math.sin(a) * r);
    m.position.set(x + Math.cos(a) * 0.5, GY + 0.2, z0 + Math.sin(a) * 0.5); const s0 = (0.45 + Math.random() * 0.4) * s;
    fx(m, 0.7 + Math.random() * 0.4, (o, k, dt) => { w.y -= 20 * dt; o.position.addScaledVector(w, dt); if (o.position.y < GY + 0.05) { o.position.y = GY + 0.05; w.set(0, 0, 0); } o.scale.setScalar(s0 * (1 - k * 0.4)); o.material.opacity = 0.95 * (1 - k * k); });
  }
  if (z.kolon) for (let i = 0; i < 7; i++) {
    // su: yukari firlayan beyaz su kolonu
    const m = spr(i % 2 ? '#ffffff' : '#bfefff', false, 0.9), w = new THREE.Vector3((Math.random() - 0.5) * 1.2, (6 + Math.random() * 4) * s, (Math.random() - 0.5) * 1.2);
    m.position.set(x, GY + 0.2, z0); const s0 = (0.7 + Math.random() * 0.5) * s;
    fx(m, 0.75, (o, k, dt) => { w.y -= 22 * dt; o.position.addScaledVector(w, dt); o.scale.setScalar(s0 * (1 + k)); o.material.opacity = 0.9 * (1 - k); });
  }
  const t0 = TOZ; TOZ = z.toz; dust(x, GY, z0, z.toz2 * s); TOZ = t0;
  if (z.halka) { ripple(x, z0, 2.2 * s); setTimeout(() => ripple(x, z0, 1.6 * s), 180); }
  // Blok Smash (Adem 9 Kas): cimen sert zemin, ayri dusme sesi yok; blogun kendi kirilma sesi (breakBlock) calar
}
// suya dusen seyin cevresinde genisleyen beyaz halka
const RIPGEO = new THREE.RingGeometry(0.82, 1, 48);
function ripple(x, z, s) { for (let i = 0; i < 2; i++) { const m = new THREE.Mesh(RIPGEO, new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, GY + 0.03, z); scene.add(m);
  const d = i * 0.18; fx(m, 0.9 + d, (o, k) => { const q = Math.max(0, k - d / (0.9 + d)); o.scale.setScalar(s * (0.5 + q * 1.4)); o.material.opacity = 0.8 * (1 - q); }); } }
// top yere/suya dustugunde de ayni zemin efekti (kucuk)
function landFx(x, z, s) { const zn = zemin(), zz = ZFX[zn]; const t0 = TOZ; TOZ = zz.toz; dust(x, GY, z, s); TOZ = t0; if (zz.halka) ripple(x, z, s * 1.4);
  for (let i = 0; i < 6; i++) { const m = spr(zz.par[i % zz.par.length], false, 0.95), a = Math.random() * 6.283, w = new THREE.Vector3(Math.cos(a) * 1.5, zz.up * 0.7, Math.sin(a) * 1.5); m.position.set(x, GY + 0.15, z);
    fx(m, 0.6, (o, k, dt) => { w.y -= 18 * dt; o.position.addScaledVector(w, dt); o.scale.setScalar(0.2 * (1 - k * 0.5)); o.material.opacity = 0.95 * (1 - k); }); } }
function dust(x, y, z, s) {
  for (let i = 0; i < 7; i++) {
    const m = spr(TOZ, false, 0.75), a = Math.random() * 6.283, v = new THREE.Vector3(Math.cos(a) * (1 + Math.random() * 2), 0.6 + Math.random() * 1.2, Math.sin(a) * (1 + Math.random() * 2));
    m.position.set(x, y + 0.3, z); const s0 = (0.6 + Math.random() * 0.5) * s;
    fx(m, 0.7 + Math.random() * 0.4, (o, k, dt) => { o.position.addScaledVector(v, dt); v.multiplyScalar(1 - dt * 2.5); o.scale.setScalar(s0 * (1 + k * 2)); o.material.opacity = 0.75 * (1 - k); });
  }
}
const CONGEO = new THREE.PlaneGeometry(0.28, 0.16), CONCOL = ['#ff4256', '#ffd23f', '#3d7bff', '#2fcf73', '#ff6fcf', '#a25cff', '#22c8e8', '#ff9a1f'];
function confetti() {
  for (let i = 0; i < 170; i++) {
    const m = new THREE.Mesh(CONGEO, new THREE.MeshBasicMaterial({ color: CONCOL[i % CONCOL.length], side: THREE.DoubleSide, transparent: true }));
    m.position.set((Math.random() - 0.5) * R * 3, TOPY + 3 + Math.random() * 6, (Math.random() - 0.5) * 6); scene.add(m);
    const v = new THREE.Vector3((Math.random() - 0.5) * 6, 4 + Math.random() * 6, (Math.random() - 0.5) * 3), w = new THREE.Vector3(Math.random() * 9, Math.random() * 9, Math.random() * 9), ph = Math.random() * 6;
    fx(m, 3.2 + Math.random() * 0.8, (o, k, dt) => { v.y = Math.max(-2.2, v.y - 9 * dt); v.x *= 1 - dt * 0.8; o.position.addScaledVector(v, dt); o.position.x += Math.sin(ph + k * 20) * dt * 0.8; o.rotation.x += w.x * dt; o.rotation.y += w.y * dt; o.material.opacity = k > 0.85 ? (1 - k) / 0.15 : 1; });
  }
}
let lastBuzz = 0;
// v6.23: (Adem 8 Kas) titresim: 18-25 ms cogu telefonun motorunda hissedilmiyordu, en az 35 ms. Ses kapaliyken titresim de yok.
function buzz(ms, gap) { if (SV.sessiz || SV.titresimsiz) return; const t = performance.now(); if (gap && t - lastBuzz < gap) return; lastBuzz = t; try { if (navigator.vibrate) navigator.vibrate(Array.isArray(ms) ? ms.map((v, i) => i % 2 ? v : Math.max(35, v)) : Math.max(35, ms)); } catch (e) {} }
// iPhone'da Safari titresim (navigator.vibrate) vermez; iOS 18+ sadece dokunus aninda 'switch' kutusuna tiklaninca kisa bir dokunsal tik verir.
// Bu yuzden iPhone'da her atis dokunusunda tik hissedilir (carpma/dusme titresimi iOS'ta web'den mumkun degil).
const IOSHAP = !navigator.vibrate && /iP(hone|ad|od)|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document ? (() => {
  const l = document.createElement('label'), i = document.createElement('input'); i.type = 'checkbox'; i.setAttribute('switch', ''); l.appendChild(i);
  l.style.cssText = 'position:fixed;left:-99px;top:0;width:1px;height:1px;opacity:0;pointer-events:none'; document.body.appendChild(l); return l; })() : null;
function dokunTitre() { if (IOSHAP && !SV.sessiz && !SV.titresimsiz) try { IOSHAP.click(); } catch (e) {} }

// ---------------- parcaciklar ----------------
const PGEO = new THREE.BoxGeometry(0.22, 0.22, 0.22), parts = [];
function burst(p, col, n, sp) {
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(PGEO, new THREE.MeshBasicMaterial({ color: Math.random() < 0.4 ? '#ffffff' : col, transparent: true }));
    m.position.copy(p); scene.add(m);
    const a = Math.random() * 6.283, u = Math.random() * 2 - 1, s = sp * (0.5 + Math.random() * 0.7), q = Math.sqrt(1 - u * u);
    parts.push({ m, v: new THREE.Vector3(Math.cos(a) * q * s, Math.abs(u) * s + 2, Math.sin(a) * q * s), life: 0.6 + Math.random() * 0.4, r: new THREE.Vector3(Math.random() * 9, Math.random() * 9, 0) });
  }
}
function updateParts(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]; p.life -= dt; p.v.y -= 20 * dt; p.m.position.addScaledVector(p.v, dt); p.m.rotation.x += p.r.x * dt; p.m.rotation.y += p.r.y * dt;
    p.m.material.opacity = Math.min(1, p.life * 2.5); p.m.scale.setScalar(Math.max(0.1, Math.min(1, p.life * 2)));
    if (p.life <= 0) { scene.remove(p.m); p.m.material.dispose(); parts.splice(i, 1); }
  }
}

// ---------------- kup dusmesi, ovgu, kazanma/kaybetme ----------------
const V = new THREE.Vector3(), V2 = new THREE.Vector3();
let lastFl = 0;
function screenAt(p, dy) { V.copy(p); V.y += dy || 0; V.project(cam); return [(V.x + 1) / 2 * innerWidth, (1 - V.y) / 2 * innerHeight]; }
// kup gitti (dustu, kirildi ya da patladi): sayilir, ozel kuplerin odulu verilir; remove ise sahneden hemen kalkar
function knock(c, remove) {
  c.gone = true; if (c.anahtar) anahtarUc(c); g.left--; gorevArt('blok', 1); if (M) ist().blok = (ist().blok || 0) + 1; if (g.combo) { g.combo.n++; g.combo.t = 0; if (!g.combo.at) g.combo.at = screenAt(c.body.position, 0.3); }
  const p = c.body.position, at = screenAt(p, 0.3);
  if (c.kind === 'hediye') { g.shots += 2; floatText('+2 Top', at[0], at[1], 'blue'); burst(new THREE.Vector3().copy(p), '#ffd23f', 16, 6); sfx('bonus'); }
  else if (c.kind === 'altin' || c.kind === 'kkA') { g.gold++; floatText('Hazine!', at[0], at[1], 'gold'); burst(new THREE.Vector3().copy(p), '#ffd23f', 20, 7); sfx('bonus'); }
  else if (c.kind === 'yildiz') { g.bonus++; floatText('+1 ★', at[0], at[1], 'gold'); burst(new THREE.Vector3().copy(p), '#c58bff', 20, 7); sfx('bonus'); }

  if (c.kind === 'kola') kolaFis(c);
  sfx('pop', g.combo ? g.combo.n : 1); hud();
  if (remove) { c.out = true; world.removeBody(c.body); scene.remove(c.mesh); }
}
// carpisma ile tetiklenen camlar ve ficilar: kisa bir fitilden sonra kirilir/patlar (zincirleme patlama icin)
const FUSE = [], boomLight = new THREE.PointLight('#ffa040', 0, 14, 1.6); scene.add(boomLight);
function updateFuse(dt) {
  boomLight.intensity = Math.max(0, boomLight.intensity - dt * 160);
  for (let i = FUSE.length - 1; i >= 0; i--) {
    const c = FUSE[i]; c.fuse -= dt; if (c.fuse > 0) continue; FUSE.splice(i, 1);
    const kd = KIND[c.kind], p = new THREE.Vector3().copy(c.body.position);
    if (c.out || (c.gone && !kd.esya)) continue;
    if (kd.esya) { breakJar(c); if (!c.gone) knock(c, true); else { c.out = true; world.removeBody(c.body); scene.remove(c.mesh); } continue; }
    if (kd.kir) { breakBlock(c, null, 12); wakeAll(); g.busy = Math.max(g.busy, 1); }
    else { knock(c, true); explode(p, kd); }
  }
}
function explode(p, kd) {
  BOOMT = g ? g.t : 0;
  const RR = kd.boom * S;
  shake = Math.min(0.9, shake + (kd.boom > 4 ? 0.8 : 0.55)); boomLight.position.copy(p); boomLight.intensity = kd.boom > 4 ? 90 : 60;
  burst(p, '#ffb020', 30, 12); burst(p, '#ff4020', 20, 9); burst(p, '#5a4a40', 10, 6); sfx('boom');
  if (KAL()) { hitstop(0.1); FP = Math.min(6, FP + 4); buzz([60, 36, 72, 36, 52], 0); }
  praise(kd.boom > 4 ? 'KABOOM!' : 'BOOM!', '', true);
  wakeAll(); g.busy = Math.max(g.busy, 2.5);
  for (const o of cubes) {
    if (o.gone || o.out) continue;
    V2.copy(o.body.position).sub(p); const L = V2.length(); if (L > RR) continue;
    const k = 1 - L / RR; V2.normalize(); V2.y += 0.55; V2.normalize();
    const m = o.body.mass, dv = kd.guc * (0.35 + 0.65 * k) / Math.max(1, m * 0.6);
    o.body.applyImpulse(new CANNON.Vec3(V2.x * dv * m, V2.y * dv * m, V2.z * dv * m));
    o.body.angularVelocity.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
    const ok = o.kind && KIND[o.kind]; if (ok && (ok.boom || ok.kir) && o.fuse == null && L < RR * 0.6) { o.fuse = ok.boom ? 0.14 + Math.random() * 0.08 : 0.02; FUSE.push(o); }
  }
}
function updateCubes(dt) {
  let moving = false;
  for (const c of cubes) {
    if (c.out) continue;
    const p = c.body.position;
    if (!c.gone && (K ? K.dustu(c) : p.y < GONE_Y + ((PLS[c.pi] && PLS[c.pi].cy) || 0))) knock(c, false);   // v6.22: korsanda kup kendi platformunun disina cikinca (ya da altina inince) dusmus sayilir   // v6.20: korsanda kup, durdugu kursunun altina inince dusmus sayilir
    if (c.landed === true) { landTick(c, dt); continue; }
    if (c.gone && !c.landed && c.kind !== 'recel' && (c.yer || p.y < GY + (c.h || S) * 0.55)) { land(c); continue; }
    if (c.gone && !c.landed && c.kind === 'recel' && p.y < GY + (c.h || S) * 0.62) { c.landed = 2; dust(p.x, GY, p.z, 1); }
    if (c.gone) { c.gt = (c.gt || 0) + dt; if (c.gt > 1.4) { const k = Math.max(0, 1 - (c.gt - 1.4) / 0.4); c.mesh.scale.setScalar(k); if (k <= 0) { c.out = true; world.removeBody(c.body); scene.remove(c.mesh); continue; } } }
    if (SPL.length && !c.gone && !c.sticky && p.y > 0 && p.y < S * 0.75) for (const s of SPL) if (s.y > -0.5 && (p.x - s.x) ** 2 + (p.z - s.z) ** 2 < (s.r + S * 0.3) ** 2) { c.sticky = true; c.body.linearDamping = 0.9; c.body.angularDamping = 0.95; break; }   // recel lekesine basan yapisir
    if (c.body.sleepState !== CANNON.Body.SLEEPING && c.body.velocity.lengthSquared() > 0.6) moving = true;
  }
  // bir sey hareket ettikce hepsi uyanik kalir: alttaki kup gidince ustteki uyurken havada kalmasin
  if (moving) { g.busy = Math.max(g.busy, 0.6); wakeAll(); }
  g.busy = Math.max(0, g.busy - dt);
  if (g.combo) { g.combo.t += dt; const n = g.combo.n;
    const lv = n >= 24 ? 3 : n >= 12 ? 2 : n >= 5 ? 1 : 0;
    if (n > (g.combo.fl || 0) && g.combo.t > 0.35) { const at = g.combo.at || [innerWidth / 2, innerHeight * 0.45]; g.combo.fl = n; }
    if (lv > g.combo.shown) { g.combo.shown = lv; praise(['', 'Süper!', 'Harika!', 'Efsane!'][lv], n + ' blok', lv === 3); }
    if (g.combo.t > 3) g.combo = null; }
  if (g.state === 'play') {
    if (g.left <= 0) { g.state = 'win'; confetti(); sfx('win'); praise('Harika!', 'Yapı yıkıldı', true); const g0 = g; setTimeout(() => { if (g === g0 && g.state === 'win') win(); }, 1600); }
    else if (g.shots <= 0 && !balls.length && g.busy <= 0 && !GGA.length && !(g.kuyruk && g.kuyruk.length)) { g.quiet += dt; if (g.quiet > 1.2) { g.state = 'lose'; lose(); } }
    else g.quiet = 0;
  }
}

// ---------------- ses (kucuk sentez) ----------------
let AC = null;
// v6.0: daha dolgun sentez sesler. Hepsi bir kompresor uzerinden cikar (ust uste binince patlamasin), her cagri hafif farkli perdede.
let MASTER = null, NOISE = null, lastThud = 0;
function out() {
  if (MASTER) return MASTER;
  const cp = AC.createDynamicsCompressor(); cp.threshold.value = -14; cp.ratio.value = 6; cp.attack.value = 0.003; cp.release.value = 0.15;
  const gv = AC.createGain(); gv.gain.value = K ? 0.8 : 0.6; const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = K ? 14000 : 6500; lp.Q.value = 0.5; gv.connect(lp); lp.connect(cp); cp.connect(AC.destination);   // korsan: kayitlar tam frekansla (kesik ve boguk degil); v6.5: (Adem) Yapi'da tiz, tirmalayan kisim kesildi
  // v6.25: (Adem 8 Kas: ses yine yok) v6.22'de bu satirin ortasina yazilan aciklama baglantilari yoruma cevirmisti: ana ses hoparlore hic baglanmiyordu.
  NOISE = AC.createBuffer(1, AC.sampleRate * 1, AC.sampleRate); const d = NOISE.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return (MASTER = gv);
}
function tone(type, f0, f1, t0, dur, vol, dst) {
  const o = AC.createOscillator(), v = AC.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
  v.gain.setValueAtTime(0.0001, t0); v.gain.exponentialRampToValueAtTime(vol, t0 + 0.006); v.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(v); v.connect(dst || out()); o.start(t0); o.stop(t0 + dur + 0.02);
}
function noise(ft, fq, q, t0, dur, vol, sweep) {
  const s = AC.createBufferSource(), f = AC.createBiquadFilter(), v = AC.createGain(); s.buffer = NOISE || (out(), NOISE);
  f.type = ft; f.frequency.setValueAtTime(fq, t0); if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t0 + dur); f.Q.value = q;
  v.gain.setValueAtTime(0.0001, t0); v.gain.exponentialRampToValueAtTime(vol, t0 + 0.004); v.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(f); f.connect(v); v.connect(out()); s.start(t0, Math.random() * 0.5); s.stop(t0 + dur + 0.02);
}
// v6.3: sesler artik onceden uretilmis kayitlar (ses/*.mp3): katmanli, yankili; her olay icin 2-3 cesit, her calista perde hafif degisir.
// Malzemeye gore kirilma: tahta, tas, metal, cam. Ayni ses cok sik calmaz, ayni anda en fazla 6 ses.
const SFILES = { atis: 3, vurus: 3, tahta: 3, tas: 3, metal: 3, cam: 3, buz: 3, yerkum: 3, yerkar: 3, yersu: 3, dusme: 3, patlama: 2, pop: 0, bonus: 0, kazan: 0, kaybet: 0, tik: 0, para: 0, sandik: 0 };   // v3.0: para ve sandik (korsan/ses, gercek kayit)
const RAW = {}, BUF = {};
// v6.29: (Adem: metal sesleri duruyor) yapi/ses/vurus, tahta, tas uretilmis kayitlardi: vurus 0.6 sn cinlayan 'dong', tahta/tas 1 sn boyunca
// sonmeyen, tek perdede cinlayan yanki (metal gibi). Yerine korsanin gercek kisa kayitlari (CC0, korsan/ses/KAYNAKLAR.md).
const GERCEK = new Set(['vurus', 'para', 'sandik']);
// Blok Smash (Adem 9 Kas): tas, cam, tahta, buz kirilma sesleri Adem'in sectigi kayitlar, iki modda da ortak ses/ klasorunden (kaynak: ses/KAYNAKLAR.md)
const SECILEN = new Set(['tahta', 'tas', 'cam', 'buz', 'atis', 'yerkum', 'yerkar', 'yersu']);
// v3.3: (Adem 11 Kas) Yapi'da altin sesi = ses/para.mp3 (aday Altin 6), tus sesi = ses/tik.mp3 (aday Tus 14); Korsan eski seslerinde
const sesYolu = (k) => SECILEN.has(k) || (!K && (k === 'para' || k === 'tik')) ? ['../ses/', 'b9'] : !K && GERCEK.has(k) ? ['../korsan/ses/', 2] : [SDIR, SV2];
// v6.22: (Adem 6 Kas) korsan modunda sesler korsan/ses/ klasorunden: gercek top, su, tahta, zincir, altin kayitlari (kaynaklar: korsan/ses/KAYNAKLAR.md)
if (K) Object.assign(SFILES, { su: 4, kabarcik: 0, zincir: 0, para: 0, sandik: 0, dalga: 0, yelken: 0, pop: undefined });
const SDIR = K ? '../korsan/ses/' : 'ses/', SV2 = K ? 2 : 1;
for (const k in SFILES) { if (SFILES[k] === undefined) continue; const n = SFILES[k] || 1; for (let i = 0; i < n; i++) { const f = SFILES[k] ? k + i : k; const [yol, sv] = sesYolu(k); RAW[f] = fetch(yol + f + '.mp3?v=' + sv).then((r) => r.arrayBuffer()).catch(() => null); } }
function decodeAll() { for (const f in RAW) RAW[f].then((ab) => { if (ab && !BUF[f]) AC.decodeAudioData(ab.slice(0), (b) => { BUF[f] = b; }, () => {}); }); }
const MATSND = { kola: 'metal', ahsap: 'tahta', sandik: 'tahta', ahsapmetal: 'tahta', kirmizi: 'tahta', hediye: 'tahta', kabak: 'tahta', recel: 'cam', tas: 'tas', tugla: 'tas', piramitTas: 'tas', metal: 'metal', celik: 'metal', altin: 'metal', fici: 'metal', yildiz: 'metal', cam: 'cam', buz: 'buz', jole: 'cam', buz2: 'buz', buzDikey: 'buz', ahsap2: 'tahta', alevUzun: 'tas', morDikey: 'tahta' };
for (const k in SEK.TUR) { const t = SEK.TUR[k]; if (t.kir) KIRILGAN.add(k); if (t.yuzer) FLOAT.add(k); MATSND[k] = t.ses; }   // v3.1
function matSnd(kind) { if (!kind) return 'tahta'; if (kind.startsWith('g_')) return 'cam'; const mt = MATSND[kind] || 'tahta'; return mt === 'metal' ? 'tas' : mt; }
const LAST = {}, GAP = { tik: 0.2, atis: 0.06, vurus: 0.06, tahta: 0.05, tas: 0.05, metal: 0.07, cam: 0.06, buz: 0.06, yer: 0.07, patlama: 0.12, pop: 0.09, dusme: 0.07 };
let voices = [];
function play(k, vol, rate) {
  const n = SFILES[k], f = n ? k + Math.floor(Math.random() * n) : k, b = BUF[f]; if (!b) return;
  const src = AC.createBufferSource(), g0 = AC.createGain(); src.buffer = b; src.playbackRate.value = (rate || (0.95 + Math.random() * 0.1)) * RS; g0.gain.value = vol * VS;
  src.connect(g0); g0.connect(out()); src.start();
}
// v6.6: (Adem) kayitli kazanma sesi kotuydu: yerine yumusak zil/arp sesi (sinus + hafif oktav, yavas giris, uzun sonum).
function chime(notes, gap, vol, chord) {
  const o0 = out(), t0 = AC.currentTime + 0.02;
  notes.forEach((f, i) => {
    const t = t0 + i * gap, d = chord && i === notes.length - 1 ? 1.6 : 0.9;
    for (const [m, a, ty] of [[1, 1, 'sine'], [2, 0.18, 'sine'], [1.002, 0.35, 'triangle']]) {
      const o = AC.createOscillator(), v = AC.createGain(); o.type = ty; o.frequency.value = f * m;
      v.gain.setValueAtTime(0.0001, t); v.gain.linearRampToValueAtTime(vol * a, t + 0.025); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(v); v.connect(o0); o.start(t); o.stop(t + d + 0.05);
    }
  });
  if (chord) [523.25, 659.25, 783.99].forEach((f) => { const t = t0 + notes.length * gap; const o = AC.createOscillator(), v = AC.createGain(); o.type = 'sine'; o.frequency.value = f;
    v.gain.setValueAtTime(0.0001, t); v.gain.linearRampToValueAtTime(vol * 0.35, t + 0.08); v.gain.exponentialRampToValueAtTime(0.0001, t + 2); o.connect(v); v.connect(o0); o.start(t); o.stop(t + 2.1); });
}
let SPLB = null;
function splb() { if (SPLB) return; const n = Math.floor(AC.sampleRate * 0.7); SPLB = AC.createBuffer(1, n, AC.sampleRate); const d = SPLB.getChannelData(0); let l = 0; for (let i = 0; i < n; i++) { const r = Math.random() * 2 - 1; l = l * 0.6 + r * 0.4; d[i] = l * Math.pow(1 - i / n, 2.4) * (i < 300 ? i / 300 : 1); } }
function splashSnd(v) {   // v6.17: su sicrama sesi (kayit yok; gurultu kopuk + alcak plop)
  const o = out(), now = AC.currentTime;
  splb();
  const src = AC.createBufferSource(), f = AC.createBiquadFilter(), g0 = AC.createGain(); src.buffer = SPLB; src.playbackRate.value = 0.85 + Math.random() * 0.3;
  f.type = 'lowpass'; f.frequency.setValueAtTime(3200, now); f.frequency.exponentialRampToValueAtTime(500, now + 0.6); g0.gain.value = v;
  src.connect(f); f.connect(g0); g0.connect(o); src.start(now);
  const os = AC.createOscillator(), og = AC.createGain(); os.frequency.setValueAtTime(170, now); os.frequency.exponentialRampToValueAtTime(55, now + 0.16); og.gain.setValueAtTime(v * 0.7, now); og.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  os.connect(og); og.connect(o); os.start(now); os.stop(now + 0.22);
}
// v6.24: (Adem 8 Kas: patla ses efektleri yok) korsanda kup dusup sayilinca hic ses yoktu ('pop' kaydi korsanda yok).
// Simdi tok, tatli bir patlama: kisa tahta catirtisi + yukari kayan 'plop' + parlak tik. Arka arkaya dusenlerde (kombo) perde yukselir.
function popSnd(n) {
  const o = out(), t = AC.currentTime, up = Math.pow(1.06, Math.min(n - 1, 12));
  play('tahta', 0.28, 1.15 + Math.random() * 0.15);
  const os = AC.createOscillator(), og = AC.createGain(); os.type = 'sine';
  os.frequency.setValueAtTime(330 * up, t); os.frequency.exponentialRampToValueAtTime(880 * up, t + 0.05); os.frequency.exponentialRampToValueAtTime(620 * up, t + 0.14);
  og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(0.42, t + 0.006); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  os.connect(og); og.connect(o); os.start(t); os.stop(t + 0.18);
  splb();
  const ns = AC.createBufferSource(), hp = AC.createBiquadFilter(), ng = AC.createGain(); ns.buffer = SPLB; hp.type = 'highpass'; hp.frequency.value = 2600;
  ng.gain.setValueAtTime(0.35, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.035); ns.connect(hp); hp.connect(ng); ng.connect(o); ns.start(t, 0.02, 0.05);
  const tk = AC.createOscillator(), tg = AC.createGain(); tk.type = 'triangle'; tk.frequency.value = 1760 * up;
  tg.gain.setValueAtTime(0.0001, t + 0.03); tg.gain.exponentialRampToValueAtTime(0.12, t + 0.036); tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  tk.connect(tg); tg.connect(o); tk.start(t + 0.03); tk.stop(t + 0.13);
}
// korsan modunun ses eslemesi: her olaya dogru kayit, malzemeye gore kirilma, gercek su sicramasi ve kazanma/kaybetme muzigi
function sfxK(k, n) {
  const key = k === 'kir' ? matSnd(n) : k === 'shatter' ? 'tahta' : k;
  if (k === 'shoot') play('atis', 0.95, 0.96 + Math.random() * 0.08);
  else if (k === 'hit') play('vurus', 0.55);
  else if (k === 'kir' || k === 'shatter') play(key, 0.5, 0.92 + Math.random() * 0.12);
  else if (k === 'cam') play('cam', 0.4);
  else if (k === 'metal') play('tas', 0.45);
  else if (k === 'boom') play('patlama', 0.95, 0.95);
  else if (k === 'yer') sfxK(n === 'su' ? 'su' : 'thud', n === 'su' ? 1 : 0);
  else if (k === 'thud' || k === 'slap') play('dusme', 0.45, 0.9 + Math.random() * 0.15);
  else if (k === 'su') { play('su', n ? 0.6 : 0.35, 0.9 + Math.random() * 0.2); if (n) setTimeout(() => AC && play('kabarcik', 0.18, 0.9 + Math.random() * 0.2), 260); }
  else if (k === 'bonus') play('bonus', 0.55, 1);
  else if (k === 'win') play('kazan', 0.7, 1);
  else if (k === 'lose') play('kaybet', 0.6, 1);
  else if (k === 'tik') play('tik', 0.5, 1);
  else if (k === 'pop') popSnd(n || 1);
  else if (k in SFILES) play(k, n || 0.6, 1);   // zincir, para, sandik
}
// surekli calan ortam sesleri (dalga, yelken): ses seviyesi dongu() ile ayarlanir
const LOOPS = {};
function dongu(k, vol, t) {
  if (!AC || !BUF[k]) return; out();
  let L = LOOPS[k];
  if (!L) { const src = AC.createBufferSource(), g0 = AC.createGain(); src.buffer = BUF[k]; src.loop = true; g0.gain.value = 0; src.connect(g0); g0.connect(out()); src.start(); L = LOOPS[k] = { src, g0 }; }
  L.g0.gain.setTargetAtTime(vol, AC.currentTime, t || 0.5);
}
function sfx(k, n) {
  if (!AC) return; out(); const now = AC.currentTime;
  if (K) { const key = k === 'kir' ? matSnd(n) : k; if (GAP[key] && LAST[key] && now - LAST[key] < GAP[key]) return; LAST[key] = now;
    voices = voices.filter((v) => v > now); if (voices.length >= 6 && k !== 'shoot' && k !== 'win' && k !== 'lose') return; voices.push(now + 0.15); sfxK(k, n); return; }
  const key = k === 'kir' ? matSnd(n) : k === 'shatter' ? 'tahta' : k;
  if (GAP[key] && LAST[key] && now - LAST[key] < GAP[key]) return; LAST[key] = now;
  voices = voices.filter((v) => v > now); if (voices.length >= 4 && k !== 'shoot' && k !== 'win' && k !== 'lose') return; voices.push(now + 0.15);
  if (k === 'shoot') play('atis', 0.7, 0.97 + Math.random() * 0.06);
  else if (k === 'yer') play('yer' + (n === 'su' || n === 'kar' ? n : 'kum'), 0.6, 0.95 + Math.random() * 0.1);
  else if (k === 'hit') play('vurus', 0.45, 0.9);
  else if (k === 'kir' || k === 'shatter') play(key === 'metal' ? 'tas' : key, 0.55, 0.88 + Math.random() * 0.1);
  else if (k === 'cam') play('cam', 0.4);
  else if (k === 'metal') play('tas', 0.3, 0.8);
  else if (k === 'boom') play('patlama', 0.7, 0.9);
  else if (k === 'thud') play('dusme', 0.3, 0.75 + Math.random() * 0.1);
  else if (k === 'su') splashSnd(n ? 0.55 : 0.3);
  else if (k === 'slap') play('dusme', 0.5, 0.8);
  else if (k === 'bonus') chime([1318.5, 1760], 0.07, 0.16);
  else if (k === 'win') chime([523.25, 659.25, 783.99, 1046.5, 1318.5], 0.11, 0.2, true);
  else if (k === 'lose') chime([392, 329.63, 261.63], 0.2, 0.14);
  else if (k === 'tik') play('tik', 0.55, 1);
  else if (k === 'para') play('para', 0.5, 0.97 + Math.random() * 0.06);
  // v6.5: her blokta calan 'pop' sayac sesi kaldirildi (yigilinca kulak tirmaliyordu)
}

// ---------------- arayuz ----------------
const prev = {};
function setNum(id, v, anim) { const e = $(id); if (prev[id] !== v) { e.textContent = v; if (anim && prev[id] != null) { e.classList.remove('bump'); void e.offsetWidth; e.classList.add('bump'); } prev[id] = v; } }
function hud(reset) {
  if (!g) return;
  $('lv').textContent = K ? 'Korsan' : 'Yapı'; setNum('lvn', LV, false);
  setNum('kc', g.left, !reset); setNum('tc', g.shots, !reset);
  $('pb').style.width = Math.round(100 * (1 - g.left / g.total)) + '%';
}
function praise(t, s, big) { return;   // v6.14: (Adem) Harika/Super/Efsane/BOOM yazilari istenmiyor
 const p = $('praise'); p.innerHTML = ''; void p.offsetWidth; p.innerHTML = '<div class="p' + (big ? ' big' : '') + '"><b>' + t + '</b>' + (s ? '<i>' + s + '</i>' : '') + '</div>'; }
function floatText(t, x, y, cls) { const e = document.createElement('div'); e.className = 'fl' + (cls ? ' ' + cls : ''); e.textContent = t; e.style.left = x + 'px'; e.style.top = y + 'px'; document.body.appendChild(e); setTimeout(() => e.remove(), 1050); }
function modal(h) { $('card').innerHTML = h; $('modal').classList.add('on'); }
function closeModal() { $('modal').classList.remove('on'); }
function yildizHtml(st) { return [0, 1, 2].map((i) => '<span' + (i < st ? '' : ' class="off"') + '>★</span>').join(''); }
function win() {
  if (K) return K.kart();   // v6.19: korsan kazanma karti (yildiz, altin sayaci, sandik, harita)
  // v2.0: ilerleme kazanildigi an yazilir (kartta uygulama kapansa da bolum gecilmis sayilir); yildizlar bolum bolum saklanir
  const maxOnce = SV.max; SV.max = Math.max(SV.max, LV + 1); SV.L = LV + 1;
  const yeniK = TEST ? null : KARAKTERLER.find((k) => !acikMi(k.id, maxOnce) && acikMi(k.id, SV.max));   // v2.1: bu bolumle yeni karakter kazanildi mi
  tilkiDurum('kazan');
  const r = g.shots / g.max, st = Math.min(3, (r >= 0.4 ? 3 : r >= 0.15 ? 2 : 1) + g.bonus);
  if (!SV.yil) SV.yil = {}; const ilk = !SV.yil[LV]; SV.yil[LV] = Math.max(SV.yil[LV] || 0, st);
  gorevArt('kazan', 1); if (st >= 3) gorevArt('y3', 1); gorevArt('top', g.shots);
  // her kalan top 5 altin (en cok 60); bolum odulu 10 + yildiz basina 10; tekrar oynanan bolumde yari odul
  const zorB = zorMu(LV) && ilk ? ZOR_ODUL : 0;
  const bonus = Math.min(60, g.shots * 5), kaz = Math.round((10 + st * 10 + bonus) * (ilk ? 1 : 0.5)) + zorB, once = SV.altin || 0; SV.altin = once + kaz;
  if (M) {   // v3.0: istatistik (ilk denemede kazanma, seri), hazine sandigi ilerlemesi ve yeni kazanma sahnesi
    const I = ist(); I.kazan++; if (SV.dus !== LV) { I.ilk++; I.seri++; I.enSeri = Math.max(I.enSeri, I.seri); } else I.seri = 1; SV.dus = 0;
    if (ilk) SV.sn = (SV.sn || 0) + 1;
    gorevKaydet(true); M.kazan({ L: LV, st, kaz, once, kalan: g.shots, bonus, zorB, yeniK, ilk }); return;
  }
  gorevKaydet(true);
  modal('<div class="rib">Tebrikler!</div><div class="stars">' + yildizHtml(st) + '</div><h2>Bölüm ' + LV + ' tamam</h2>' +
    '<div class="stat"><div>KALAN TOP<b>' + g.shots + '</b></div><div>TOP BONUSU<b>+' + bonus + '</b></div></div>' +
    '<div class="kz"><i class="coin"></i><b id="kz">+0</b></div><p class="kasa">Altın: <b id="ks">' + once + '</b></p>' +
    (yeniK ? '<div class="ykar"><img src="../' + yeniK.av + '?v=1" alt=""><div><small>Yeni karakter kazandın!</small><b>' + yeniK.ad + '</b></div></div>' : '') +
    (gorevHazir() ? '<p class="gvuy">🎯 Görev ödülün hazır!</p>' : '') +
    '<button class="btn" id="nx">Sonraki Bölüm</button><button class="btn o kck" id="hrt">Harita</button>');
  for (let i = 0; i < st; i++) setTimeout(() => sfx('bonus'), 120 + i * 250);
  let n = 0; const adim = Math.max(1, Math.round(kaz / 24));
  setTimeout(function say() { n = Math.min(kaz, n + adim); const a = $('kz'), b = $('ks'); if (!a) return; a.textContent = '+' + n; b.textContent = once + n;
    if (n < kaz) { if (n % (adim * 4) < adim) sfx('tik'); setTimeout(say, 45); } else a.parentNode.classList.add('pop'); }, 900);
  $('nx').onclick = () => { sfx('tik'); start(LV + 1); };
  $('hrt').onclick = () => { sfx('tik'); start(LV + 1); haritaAc(); };
}
const DEVAM_FIYAT = 100;
function lose() {
  sfx('lose'); gorevKaydet(true); tilkiDurum('kaybet');
  // v2.0: bolum basina bir kez bedava devam; sonrakiler altinla
  const bedava = !g.devam, yeter = (SV.altin || 0) >= DEVAM_FIYAT;
  if (M) { M.kaybet({ L: LV, kaldi: g.left, bedava, fiyat: DEVAM_FIYAT }); return; }
  modal('<div class="rib r">Toplar bitti!</div><h2>' + g.left + ' blok kaldı</h2><p>' + (g.left <= 5 ? 'Çok az kalmıştı, tekrar dene!' : 'Alt sıraları hedefle, kule devrilsin!') + '</p>' +
    (bedava || yeter ? '<button class="btn o" id="rv">+3 Top ile Devam' + (bedava ? '' : ' <i class="coin"></i> ' + DEVAM_FIYAT) + '</button>' : '') +
    '<button class="btn" id="rt">Tekrar Dene</button><button class="btn o kck" id="hrt">Harita</button>');
  $('rt').onclick = () => { sfx('tik'); start(LV); };
  $('hrt').onclick = () => { sfx('tik'); start(LV); haritaAc(); };
  if ($('rv')) $('rv').onclick = () => { if (!bedava) { if ((SV.altin || 0) < DEVAM_FIYAT) return; SV.altin -= DEVAM_FIYAT; save(); } sfx('tik'); g.devam = (g.devam || 0) + 1; g.shots += 3; g.state = 'play'; g.quiet = 0; closeModal(); hud(); ggHud(); tilkiDurum('oyun'); };
}
// ================= v2.0: gunluk gorevler =================
// Her gun 3 gorev (gune gore sabit secim). Ilerleme oyun icinde bellekte artar, bolum sonunda kaydedilir; odul gorev ekranindan alinir.
const GHAV = [{ k: 'blok', h: 120, o: 60, ad: '120 blok yık' }, { k: 'kazan', h: 3, o: 80, ad: '3 bölüm kazan' }, { k: 'y3', h: 2, o: 100, ad: '2 bölümü 3 yıldızla bitir' },
  { k: 'guc', h: 2, o: 50, ad: '2 güçlendirici kullan' }, { k: 'top', h: 12, o: 70, ad: 'Toplam 12 top artır' }, { k: 'blok', h: 250, o: 120, ad: '250 blok yık' }, { k: 'kazan', h: 5, o: 140, ad: '5 bölüm kazan' }];
let GVKIRLI = false;
function gorevler() {
  const d = new Date(), gun = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  if (!SV.gv || SV.gv.gun !== gun || !Array.isArray(SV.gv.l)) {
    const r = mul32(d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()), l = [], var_ = new Set();
    for (let n = 0; n < 40 && l.length < 3; n++) { const i = Math.floor(r() * GHAV.length); if (var_.has(GHAV[i].k)) continue; var_.add(GHAV[i].k); l.push({ i, n: 0, a: 0 }); }
    SV.gv = { gun, l }; GVKIRLI = true;
  }
  return SV.gv.l.filter((q) => GHAV[q.i]);
}
function gorevArt(k, n) { if (K || TEST || !n) return; for (const q of gorevler()) { const G = GHAV[q.i]; if (G.k !== k || q.n >= G.h) continue; q.n = Math.min(G.h, q.n + n); GVKIRLI = true; } }
function gorevKaydet(zorla) { if (GVKIRLI || zorla) { GVKIRLI = false; save(); } }
function gorevHazir() { if (K || TEST) return 0; return gorevler().filter((q) => !q.a && q.n >= GHAV[q.i].h).length; }
// ================= v3.0: merkez (ana sayfa) baglantisi =================
// Eski bolum haritasi, gorev ve ayar ekranlari (v2.0) kalkti; hepsi yapi/merkez.js icinde, yeni gorunumle.
const FONAD = { cayir4: ['Çiçekli Çayır', 'c'], koy: ['Korsan Koyu', 's'],kar3: ['Karlı Köy', 'k'], sahil3: ['Palmiye Sahili', 's'] };
function haritaAc() {}   // yalniz eski kartlardaki (korsan/test) 'Harita' dugmesi icin; korsanin kendi haritasi korsan.js'te
function ayarDegis(k) {
  if (k === 'ses') { SV.sessiz = !SV.sessiz; save(); if (SV.sessiz) { if (AC) AC.suspend(); if (MZ) MZ.el.pause(); if (SR) SR.el.pause(); } else { sesAc(); muzikBasla(); } }
  else if (k === 'muzik') { SV.muziksiz = !SV.muziksiz; save(); if (SV.muziksiz) muzikDur(); else muzikBasla(); }
  else if (k === 'titresim') { SV.titresimsiz = !SV.titresimsiz; save(); buzz(40); }
}
// bolum kartinda 'Oyna': bolum kurulur (zaten taze kuruluysa yalniz kamera donusu ve bolum adi tekrarlanir),
// secilen guclendiriciler odenir ve sirayla uygulanir
function oyna(L, sec) {
  if (L !== LV || !g || g.state !== 'play' || g.armed) start(L);
  else { CAMI = 1.6; STARTT = performance.now(); const nm = $('nm'); nm.classList.remove('on'); void nm.offsetWidth; nm.classList.add('on'); $('hint').style.opacity = 1; if (TK.t && TK.gor) TK.t.oyna('selam', 1.4); }
  muzikBasla(); ggKur();
  let gec = 0;
  for (const t of GGT) { if (!sec || !sec.has(t.k) || !ggOde(t.k)) continue;
    if (t.k === 'yildirim') { const gg0 = g; setTimeout(() => { if (g === gg0 && g.state === 'play') ggYildirim(); }, 1500); }
    else { const k = t.k; setTimeout(() => { if (g && g.state === 'play') { ggCal(ggT(k).el, 'bas'); ggUygula(k); ggHud(); sfx('bonus'); } }, 700 + gec * 200); gec++; } }
  ggHud();
}
// toplar bitince '+3 top ile devam': bolum basina bir kez bedava, sonrakiler altinla
function devamEt() {
  if (!g || g.state !== 'lose') return false;
  if (g.devam) { if ((SV.altin || 0) < DEVAM_FIYAT) return false; SV.altin -= DEVAM_FIYAT; save(); }
  g.devam = (g.devam || 0) + 1; g.shots += 3; g.state = 'play'; g.quiet = 0; hud(); ggHud(); tilkiDurum('oyun'); return true;
}
// bolumden vazgecme (tekrar dene, ana sayfa): seri biter, bu bolum artik 'ilk denemede' sayilmaz
function pesEt() { if (g && (g.armed || g.state === 'lose')) { SV.dus = LV; ist().seri = 0; save(); } }
function merkezBagla() {
  M = merkezKur({ SV, save, sfx, buzz, GGT, ggSay, ggHud, gorevler, GHAV, gorevHazir, muzikBasla, muzikKis, sarki, sarkiDur, oyna, devam: devamEt, pes: pesEt, ayar: ayarDegis, SURUM, ZOR_ODUL,
    ses: (k, v, r) => { if (AC && !SV.sessiz) { out(); play(k, v, r || 1); } }, zor: zorMu, LV: () => LV,
    bolge: (L) => { const fo = fonOf(L); return FONAD[fo.f] || (fo.yeni ? [fo.ad, fo.f === 'y_buz' ? 'k' : 's'] : ['', 'c']); }, bolumAdi: (L) => { try { return levelOf(L).ad || ''; } catch (e) { return ''; } } });
}
// ================= v3.13: muzik =================
// (Adem 11 Kas) kodla calinan eski notalar yerine Adem'in Gemini ile urettigi muzikler (ses/muzik/):
//  bolum.mp3      'Saltwater Jig' - korsan jig, 108 vurus/dk. Son 2 sn basla harmanlandi: 155 sn dikissiz dongu. Ana sayfa ve bolumde calar.
//  foxi_sarki.mp3 'Foxi's Golden Haul' - vokalli 28 sn sarki. Bolum kazaninca tamami, ana sayfada Foxi'ye dokununca ilk 8 sn calar;
//                 calarken bolum muzigi kisilir, bitince geri acilir.
// Uzun dosyalar <audio> ile akar (Web Audio tamponuna cozulse telefonda ~60 MB bellek yer); ses seviyesi Web Audio kazanciyla ayarlanir
// (iPhone <audio>.volume'u yok sayar). Ses ya da muzik kapaliysa calmaz.
const MZV = 0.32, SRV = 0.85;   // bolum muzigi ve Foxi sarkisi seviyesi (efektlerin altinda kalsin)
let MZ = null, SR = null;
function mzKaynak(yol) {
  const el = new Audio(yol); el.preload = 'auto'; el.setAttribute('playsinline', '');
  const g = AC.createGain(); g.gain.value = 0; AC.createMediaElementSource(el).connect(g); g.connect(AC.destination);
  return { el, g };
}
let FXK = false;   // v3.14: Foxi'nin sarki videosu oynarken bolum muzigi tamamen susar
function mzHedef() { return FXK ? 0 : SR && SR.calar ? MZV * 0.18 : MZV; }   // Foxi sarkisi calarken bolum muzigi kisik
function muzikKis(b) { FXK = !!b; if (MZ && AC) MZ.g.gain.setTargetAtTime(mzHedef(), AC.currentTime, b ? 0.15 : 0.8); }
function muzikBasla() {
  if (K || TEST || !AC || SV.sessiz || SV.muziksiz || $('load')) return;   // v3.14: acilis videosu (sarki) bitene kadar muzik yok
  if (!MZ) { try { MZ = mzKaynak('../ses/muzik/bolum.mp3?v=1'); MZ.el.loop = true; } catch (x) { MZ = null; return; } }
  clearTimeout(MZ.dur); if (MZ.el.paused) MZ.el.play().catch(() => {});
  MZ.g.gain.setTargetAtTime(mzHedef(), AC.currentTime, 0.6);
}
function muzikDur() { if (!MZ) return; MZ.g.gain.setTargetAtTime(0, AC.currentTime, 0.2); clearTimeout(MZ.dur); MZ.dur = setTimeout(() => MZ.el.pause(), 900); sarkiDur(); }
// Foxi sarkisi. ad: 'kazan' (tamami) | 'tilki' (ilk 8 sn, yumusak kapanis). Tekrar cagrilirsa bastan baslar.
function sarki(ad) {
  if (K || TEST || !AC || SV.sessiz || SV.muziksiz) return;
  if (!SR) { try { SR = mzKaynak('../ses/muzik/foxi_sarki.mp3?v=1'); SR.el.addEventListener('ended', sarkiDur); } catch (x) { SR = null; return; } }
  clearTimeout(SR.kes); clearTimeout(SR.dur); SR.calar = true;
  const t = AC.currentTime; SR.g.gain.cancelScheduledValues(t); SR.g.gain.setValueAtTime(SRV, t);
  try { SR.el.currentTime = 0; } catch (x) {} SR.el.play().catch(() => {});
  if (MZ) MZ.g.gain.setTargetAtTime(mzHedef(), t, 0.25);
  if (ad === 'tilki') SR.kes = setTimeout(sarkiDur, 8000);
}
function sarkiDur() {
  if (!SR || !SR.calar) return; SR.calar = false; clearTimeout(SR.kes);
  SR.g.gain.setTargetAtTime(0, AC.currentTime, 0.35); clearTimeout(SR.dur); SR.dur = setTimeout(() => { if (!SR.calar) SR.el.pause(); }, 1600);
  if (MZ && !MZ.el.paused) MZ.g.gain.setTargetAtTime(mzHedef(), AC.currentTime, 0.8);
}
addEventListener('pointerup', () => muzikBasla(), { capture: true, passive: true }); addEventListener('bsacildi', () => muzikBasla());   // v3.13: capture (ana sayfa dokunuslari yukari iletilmiyor); eski satir tanimsiz HRT'ye takilip hata veriyordu, muzik ana sayfada hic baslamiyordu
// ---------------- Blok Smash 3. asama (v1.4): guclendiriciler ----------------
// roket: sonraki atis roket olur, ilk kupe varinca ikiye ayrilip o sirayi saga sola siler
// bomba: sonraki atis bomba olur, ilk degdigi yerde patlar, cevresini kirar
// yildirim: top harcamaz, gokten 4 simsek iner; +5 top: aninda 5 top
// Her biri SV.gg sayacindan harcanir, sayac bitince altinla (SV.altin) alinir. Baslangicta 2'ser hediye.
const GGT = [{ k: 'roket', ic: '<img class="i3" src="ikon/3b/roket.webp?v=1" alt="" draggable="false">', fiyat: 50 }, { k: 'bomba', ic: '<img class="i3" src="ikon/3b/bomba.webp?v=1" alt="" draggable="false">', fiyat: 75 }, { k: 'yildirim', ic: '<img class="i3" src="ikon/3b/yildirim.webp?v=1" alt="" draggable="false">', fiyat: 100 }, { k: 'top', ic: '<img class="i3" src="ikon/3b/top5.webp?v=1" alt="" draggable="false">', fiyat: 150 }];   // v3.17: 3B ikonlar
const GGA = [];
let GGD = null, GGF = null;
function ggSay() { if (!SV.gg) { SV.gg = { roket: 2, bomba: 2, yildirim: 2, top: 2 }; save(); } return SV.gg; }
function ggT(k) { return GGT.find((x) => x.k === k); }
function ggKur() {
  if (K || GGD) return;
  GGD = document.createElement('div'); GGD.id = 'gg';
  const sol = document.createElement('div'), sag = document.createElement('div'); sol.className = 'ggs'; sag.className = 'ggs';
  GGT.forEach((t, i) => {
    const b = document.createElement('button'); b.className = 'gb gb-' + t.k; b.setAttribute('aria-label', t.k);
    b.innerHTML = '<span class="hl"></span><i>' + t.ic + '</i><span class="n"></span><span class="p"><em class="coin"></em>' + t.fiyat + '</span>';
    b.addEventListener('pointerdown', (e) => e.stopPropagation());
    b.onclick = (e) => { e.stopPropagation(); ggBas(t.k); };
    (i < 2 ? sol : sag).appendChild(b); t.el = b;
  });
  GGD.appendChild(sol); GGD.appendChild(sag); document.body.appendChild(GGD);
  GGF = document.createElement('div'); GGF.id = 'flas'; document.body.appendChild(GGF);
  ggHud();
}
function ggHud() {
  if (!GGD) return; const s = ggSay(), a = SV.altin || 0, q = (g && g.kuyruk) || [];
  for (const t of GGT) { const b = t.el, n = s[t.k] || 0; b.querySelector('.n').textContent = n;
    b.classList.toggle('var', n > 0); b.classList.toggle('yok', n <= 0 && a < t.fiyat); b.classList.toggle('sec', q.includes(t.k)); }
}
function ggCal(el, c) { if (!el) return; el.classList.remove(c); void el.offsetWidth; el.classList.add(c); }
function ggOde(k) { const s = ggSay(); if (s[k] > 0) { s[k]--; save(); return true; } const f = ggT(k).fiyat; if ((SV.altin || 0) >= f) { SV.altin -= f; save(); return true; } return false; }
function ggBas(k) {
  if (!g || g.state !== 'play' || $('modal').classList.contains('on')) return;
  const b = ggT(k).el; g.kuyruk = g.kuyruk || [];
  if ((k === 'roket' || k === 'bomba') && g.kuyruk.includes(k)) { g.kuyruk.splice(g.kuyruk.indexOf(k), 1); ggSay()[k]++; save(); sfx('tik'); ggHud(); return; }
  if (!ggOde(k)) { ggCal(b, 'salla'); buzz([40, 40, 40], 0); sfx('tik'); return; }
  ggCal(b, 'bas'); buzz(35); sfx('bonus'); dokunTitre(); gorevArt('guc', 1);
  ggUygula(k); ggHud();
}
function ggUygula(k) {
  if (k === 'roket' || k === 'bomba') { g.kuyruk = g.kuyruk || []; g.kuyruk.push(k); $('hint').style.opacity = 1; }
  else if (k === 'top') ggTop();
  else if (k === 'yildirim') ggYildirim();
}
function ggIade() {
  if (g && g.kuyruk && g.kuyruk.length) { const s = ggSay(); for (const k of g.kuyruk) s[k]++; g.kuyruk = []; save(); }
  for (const e of GGA) ggSil(e); GGA.length = 0;
}
function ggFlas(col, op) { if (!GGF) return; GGF.style.background = col; try { GGF.animate([{ opacity: op }, { opacity: 0 }], { duration: 380, easing: 'ease-out' }); } catch (x) {} }
function ggSil(e) { if (e.grp) { scene.remove(e.grp); e.grp.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); e.grp = null; } }
function yik(c, d) {
  if (!c || c.gone || c.out) return false;
  const kd = c.kind && KIND[c.kind];
  if (kd && (kd.boom || kd.esya)) { if (c.fuse == null) { c.fuse = 0.03; FUSE.push(c); } return true; }
  breakBlock(c, d || null, 10); return true;
}
function ggTop() {
  g.shots += 5; const r = $('tc').getBoundingClientRect();
  floatText('+5', r.left + r.width / 2, r.bottom + 8, 'blue'); hud(); sfx('bonus'); setTimeout(() => sfx('bonus'), 160);
  ggCal($('tc').parentNode, 'ggpar');
}
// atis: shoot() yuklu guclendirici varsa buraya gelir (top harcamaz)
function ggAtis(target) {
  const now = g.t; if (g.lastShot && now - g.lastShot < 0.35) return false; g.lastShot = now;
  const k = g.kuyruk.shift();
  if (TC.gun) { TC.aimYaw = Math.atan2(target.x - TC.holder.position.x, target.z - TC.holder.position.z); TC.holder.rotation.y = TC.yaw = TC.aimYaw; TC.rec = 1; }
  const st = trunkTip(TIP).clone(); if (target.y < S * 0.5) target = target.clone().setY(S * 0.5);
  const dir = target.clone().sub(st).normalize();
  if (k === 'roket') ggRoket(st, target, dir); else ggBomba(st, target);
  muzzleFx(st, dir); sfx('shoot'); buzz(45); shake = Math.max(shake, 0.25); $('hint').style.opacity = 0; HOLD = null; ggHud();
  return true;
}
function rokMesh(sc) {
  const grp = new THREE.Group(), ic = new THREE.Group(); ic.rotation.x = Math.PI / 2; grp.add(ic);
  const kir = new THREE.MeshStandardMaterial({ color: '#e8283c', roughness: 0.35, metalness: 0.3, emissive: '#5a0010', emissiveIntensity: 0.5 });
  const bey = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3, metalness: 0.25 });
  const sar = new THREE.MeshStandardMaterial({ color: '#ffd23f', roughness: 0.25, metalness: 0.6, emissive: '#6a4200', emissiveIntensity: 0.5 });
  const add = (geo, m, y) => { const o = new THREE.Mesh(geo, m); o.position.y = y; o.castShadow = true; ic.add(o); return o; };
  add(new THREE.CylinderGeometry(0.22, 0.24, 1.0, 18), bey, 0);
  add(new THREE.CylinderGeometry(0.235, 0.235, 0.22, 18), kir, 0.18);
  add(new THREE.ConeGeometry(0.22, 0.5, 18), kir, 0.75);
  add(new THREE.CylinderGeometry(0.16, 0.2, 0.14, 14), sar, -0.56);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2, f = add(new THREE.BoxGeometry(0.3, 0.4, 0.05), sar, -0.36); f.position.x = Math.cos(a) * 0.3; f.position.z = Math.sin(a) * 0.3; f.rotation.y = -a; }
  const al = new THREE.Sprite(new THREE.SpriteMaterial({ map: SOFT, color: '#ffa030', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); al.position.y = -0.85; al.scale.setScalar(0.8); ic.add(al);
  const al2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: SOFT, color: '#fff2b0', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); al2.position.y = -0.7; al2.scale.setScalar(0.45); ic.add(al2);
  grp.userData.al = [al, al2]; grp.scale.setScalar(sc); scene.add(grp); return grp;
}
function rokIz(p, dir) {
  const f = spr('#ff9a30', true, 0.9); f.position.copy(p).addScaledVector(dir, -0.6);
  fx(f, 0.18, (o, k) => { o.scale.setScalar(0.7 - k * 0.4); o.material.opacity = 0.9 * (1 - k); });
  const m = spr('#eeeae6', false, 0.45), v = new THREE.Vector3((Math.random() - 0.5) * 0.8, 0.5 + Math.random() * 0.6, (Math.random() - 0.5) * 0.8);
  m.position.copy(p).addScaledVector(dir, -0.75);
  fx(m, 0.7, (o, k, dt) => { o.position.addScaledVector(v, dt); o.scale.setScalar(0.35 + k * 1.1); o.material.opacity = 0.45 * (1 - k); });
}
function ggRoket(st, target, dir) {
  const grp = rokMesh(1); grp.position.copy(st); grp.lookAt(st.clone().add(dir));
  GGA.push({ tur: 'roket', grp, p: st.clone(), dir, kalan: st.distanceTo(target) + 1.5, iz: 0 });
  g.busy = Math.max(g.busy, 2);
}
function ggAyril(e) {
  const p0 = e.p.clone(), dh = new THREE.Vector3(e.dir.x, 0, e.dir.z); if (dh.lengthSq() < 1e-4) dh.set(0, 0, -1); dh.normalize();
  const yan = new THREE.Vector3(dh.z, 0, -dh.x);
  for (const sg of [1, -1]) { const y = yan.clone().multiplyScalar(sg), grp = rokMesh(0.75); grp.position.copy(p0); grp.lookAt(p0.clone().add(y)); GGA.push({ tur: 'yan', grp, p0, yon: y, dh, yol: 0, iz: 0 }); }
  hitFlash(p0); burst(p0, '#ffb020', 26, 10); burst(p0, '#ff4020', 14, 8);
  boomLight.position.copy(p0); boomLight.intensity = 70; sfx('boom'); shake = Math.min(0.7, shake + 0.4); buzz([60, 30, 50], 0); ggFlas('#fff1c8', 0.35);
  wakeAll(); g.busy = Math.max(g.busy, 2.5);
}
function ggBomba(st, target) {
  const dv = target.clone().sub(st), gy = world.gravity.y, T = Math.max(0.1, dv.length() / 60);
  const v = new CANNON.Vec3(dv.x / T, dv.y / T - 0.5 * gy * T, dv.z / T);
  const body = new CANNON.Body({ mass: 3.3, material: PM.ball, linearDamping: 0.01, allowSleep: false }); body.addShape(new CANNON.Sphere(BR)); body.collisionFilterGroup = 2; body.collisionFilterMask = ~4;
  body.position.set(st.x, st.y, st.z); body.velocity.copy(v); world.addBody(body); body.angularVelocity.set(-v.z * 0.3, 0, v.x * 0.3);
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(BR * 1.25, 24, 16), new THREE.MeshStandardMaterial({ color: '#2b2545', roughness: 0.28, metalness: 0.55, emissive: '#3a1478', emissiveIntensity: 0.35 })); mesh.castShadow = true; scene.add(mesh);
  const kap = new THREE.Mesh(new THREE.CylinderGeometry(BR * 0.4, BR * 0.45, BR * 0.4, 14), new THREE.MeshStandardMaterial({ color: '#ffd23f', metalness: 0.6, roughness: 0.3 })); kap.position.y = BR * 1.25; mesh.add(kap);
  const kv = new THREE.Sprite(new THREE.SpriteMaterial({ map: SOFT, color: '#ffcf40', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); kv.position.y = BR * 1.7; kv.scale.setScalar(BR * 2.2); mesh.add(kv);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: SOFT, color: '#c8a0ff', transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(BR * 5); mesh.add(halo);
  const b = { body, mesh, halo, t: 0, hit: false, trail: [], col: '#2b2545', dir: new THREE.Vector3(v.x, v.y, v.z).normalize(), sp: Math.hypot(v.x, v.y, v.z), bomba: true };
  body.addEventListener('collide', () => { if (!b.boom) b.boom = new THREE.Vector3().copy(body.position); });
  balls.push(b); GGA.push({ tur: 'bomba', b, kv });
}
function ggPatla(p) {
  for (const c of cubes) { if (c.gone || c.out) continue; const q = c.body.position; if ((q.x - p.x) ** 2 + (q.y - p.y) ** 2 + (q.z - p.z) ** 2 < (S * 2.2) ** 2) yik(c, null); }
  explode(p, { boom: 4.2, guc: 17 });
  hitstop(0.07); buzz([90, 40, 70, 40, 50], 0); ggFlas('#ffe2a8', 0.55);
  const grp = new THREE.Group(); grp.position.copy(p); scene.add(grp);
  const h1 = new THREE.Mesh(new THREE.RingGeometry(0.7, 1, 48), new THREE.MeshBasicMaterial({ color: '#ffd27a', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); h1.lookAt(cam.position.clone().sub(p)); grp.add(h1);
  const h2 = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 48), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); h2.rotation.x = -Math.PI / 2; grp.add(h2);
  const top = spr('#fff4d0', true, 1); top.position.copy(p);
  fx(top, 0.3, (o, k) => { o.scale.setScalar(3 + k * 8); o.material.opacity = 1 - k; });
  GGA.push({ tur: 'halka', grp, h1, h2, t: 0 });
}
function ggYildirim() {
  const al = cubes.filter((c) => !c.gone && !c.out); if (!al.length) return;
  const sec = []; for (let i = 0; i < 4 && al.length; i++) sec.push(al.splice(Math.floor(Math.random() * al.length), 1)[0]);
  sec.forEach((c, i) => GGA.push({ tur: 'simsek', c, t: -0.2 - i * 0.24 }));
  ggFlas('#bcdcff', 0.3); g.busy = Math.max(g.busy, 3);
}
const BUP = new THREE.Vector3(0, 1, 0);
function simsekMesh(a, b) {
  const grp = new THREE.Group(), n = 9, pts = [];
  for (let i = 0; i <= n; i++) { const k = i / n, p = a.clone().lerp(b, k); if (i > 0 && i < n) { p.x += (Math.random() - 0.5) * 1.3; p.z += (Math.random() - 0.5) * 0.6; } pts.push(p); }
  const mc = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const mg = new THREE.MeshBasicMaterial({ color: '#6cc8ff', transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[i + 1], d = q.clone().sub(p), L = d.length(); d.normalize();
    for (const [m, w] of [[mc, 0.09], [mg, 0.32]]) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, L + w, w), m); o.position.copy(p).lerp(q, 0.5); o.quaternion.setFromUnitVectors(BUP, d); grp.add(o); } }
  const pa = new THREE.Sprite(new THREE.SpriteMaterial({ map: SOFT, color: '#a8dcff', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); pa.position.copy(b); pa.scale.setScalar(4); grp.add(pa);
  grp.userData.m = [mc, mg, pa.material]; scene.add(grp); return grp;
}
function ggCarp(e) {
  let c = e.c;
  if (!c || c.gone || c.out) { const al = cubes.filter((x) => !x.gone && !x.out); if (!al.length) return false; c = al[Math.floor(Math.random() * al.length)]; }
  const p = new THREE.Vector3().copy(c.body.position);
  e.grp = simsekMesh(new THREE.Vector3(p.x + (Math.random() - 0.5) * 3, p.y + 16, p.z - 2), p);
  for (const o of cubes) { if (o.gone || o.out) continue; const q = o.body.position; if ((q.x - p.x) ** 2 + (q.y - p.y) ** 2 + (q.z - p.z) ** 2 < (S * 1.1) ** 2) yik(o, new THREE.Vector3(0, -1, 0)); }
  burst(p, '#bfe8ff', 18, 9); burst(p, '#ffffff', 10, 6); hitFlash(p);
  flashLight.position.copy(p); flashLight.intensity = 90; ggFlas('#e8f4ff', 0.6);
  if (AC) { out(); play('patlama', 0.5, 1.7 + Math.random() * 0.2); play('cam', 0.3, 0.7); }
  shake = Math.min(0.7, shake + 0.35); buzz([50, 25, 40], 0); wakeAll();
  return true;
}
function ggKare(dt) {
  for (let i = GGA.length - 1; i >= 0; i--) {
    const e = GGA[i]; let bitti = false;
    if (e.tur === 'roket') {
      const st = 60 * dt; e.p.addScaledVector(e.dir, st); e.kalan -= st; e.grp.position.copy(e.p);
      e.grp.rotateZ(dt * 9); for (const a of e.grp.userData.al) a.scale.setScalar((a === e.grp.userData.al[0] ? 0.8 : 0.45) * (0.8 + Math.random() * 0.5));
      e.iz += dt; if (e.iz > 0.012) { e.iz = 0; rokIz(e.p, e.dir); }
      let vur = e.kalan <= 0 || e.p.y < GY + 0.2;
      if (!vur) for (const c of cubes) { if (c.gone || c.out) continue; const q = c.body.position; if ((q.x - e.p.x) ** 2 + (q.y - e.p.y) ** 2 + (q.z - e.p.z) ** 2 < (S * 0.8) ** 2) { e.p.y = q.y; vur = true; break; } }
      if (vur) { ggAyril(e); bitti = true; }
    } else if (e.tur === 'yan') {
      e.yol += 30 * dt; e.grp.position.copy(e.p0).addScaledVector(e.yon, e.yol); e.grp.rotateZ(dt * 9);
      for (const a of e.grp.userData.al) a.scale.setScalar((a === e.grp.userData.al[0] ? 0.8 : 0.45) * (0.8 + Math.random() * 0.5));
      e.iz += dt; if (e.iz > 0.02) { e.iz = 0; rokIz(e.grp.position, e.yon); }
      for (const c of cubes) { if (c.gone || c.out) continue; const q = c.body.position, rx = q.x - e.p0.x, ry = q.y - e.p0.y, rz = q.z - e.p0.z;
        const a = rx * e.yon.x + rz * e.yon.z; if (a < -S * 0.6 || a > e.yol) continue; if (Math.abs(ry) > S * 0.55) continue; if (Math.abs(rx * e.dh.x + rz * e.dh.z) > S * 1.7) continue;
        yik(c, e.yon); }
      if (e.yol > 15) { burst(e.grp.position.clone(), '#ffb020', 10, 5); bitti = true; }
    } else if (e.tur === 'bomba') {
      const b = e.b; e.kv.scale.setScalar(BR * (1.6 + Math.random() * 1.4)); e.kv.material.color.setHSL(0.1 + Math.random() * 0.05, 1, 0.6);
      if (b.boom || b.sunk || b.t > 3) { const p = b.boom || b.mesh.position.clone(); b.mesh.visible = false; b.t = 99; ggPatla(p); bitti = true; }
    } else if (e.tur === 'halka') {
      e.t += dt; const k = Math.min(1, e.t / 0.5);
      e.h1.scale.setScalar(1 + k * 6); e.h1.material.opacity = (1 - k) ** 1.5; e.h2.scale.setScalar(1 + k * 8); e.h2.material.opacity = 0.8 * (1 - k) ** 2;
      if (k >= 1) bitti = true;
    } else if (e.tur === 'simsek') {
      e.t += dt;
      if (e.t >= 0 && !e.vurdu) { e.vurdu = true; if (!ggCarp(e)) bitti = true; }
      if (e.grp) { const op = Math.max(0, 1 - e.t / 0.4) * (0.6 + Math.random() * 0.4); for (const m of e.grp.userData.m) m.opacity = op; if (e.t > 0.4) bitti = true; }
    }
    if (bitti) { ggSil(e); GGA.splice(i, 1); }
  }
}
// ---------------- v3.16: Yeni sekil karti ----------------
// Bolumde ilk kez gorulen sekil ailesi icin, oyuna baslamadan once kart: donen 3B sekil, adi ve ne yaptigi.
// Onizleme ana cizici ile ekranin kosesine cizilip 2B tuvale kopyalanir (ayni malzeme ve isik ortami), sonra ana sahne ustune cizilir.
const PRV = { on: false };
function blokMesh(col) {
  const kd = KIND[col], sk = kd && kd.sek ? SEK.al(col) : null, gl = kd && kd.cam, isE = kd && kd.esya, kp = KEEP[col] && MOD[col] ? fitKeep(col) : null, mg = sk || gl || kp || isE ? null : fitCube(kd ? col : 'kup'), isF = col === 'fici' && !mg;
  return sk ? new THREE.Mesh(sk.geo, sk.mat) : gl ? makeGlass(gl) : kp ? new THREE.Mesh(kp, MOD[col].mat) : isE ? makeJar() : mg ? new THREE.Mesh(mg, kd ? MOD[col].mat : kupModelMat(col)) : new THREE.Mesh(isF ? FICIGEO : CUBEGEO, kd ? kindMat(col) : kupMat(col));
}
function prvKur() {
  if (PRV.sc) return;
  PRV.sc = new THREE.Scene(); PRV.cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50); PRV.cam.position.set(0, 1.1, 5.2); PRV.cam.lookAt(0, 0, 0);
  PRV.sc.add(new THREE.HemisphereLight('#ffffff', '#8a6a9a', 1.6)); const d = new THREE.DirectionalLight('#fff4e0', 2.6); d.position.set(3, 5, 4); PRV.sc.add(d);
  const r2 = new THREE.DirectionalLight('#9fd4ff', 1.2); r2.position.set(-4, 2, -3); PRV.sc.add(r2);
  PRV.grp = new THREE.Group(); PRV.sc.add(PRV.grp);
}
function prvGoster(col, cv) {
  prvKur(); while (PRV.grp.children.length) PRV.grp.remove(PRV.grp.children[0]);
  let m; try { m = blokMesh(col); } catch (e) { return; }
  PRV.sc.environment = scene.environment || null;
  const b = new THREE.Box3().setFromObject(m), c = b.getCenter(new THREE.Vector3()), z = b.getSize(new THREE.Vector3()), k = 1.6 / Math.max(z.x, z.y, z.z, 0.01);
  m.position.copy(c).multiplyScalar(-k); m.scale.multiplyScalar(k); PRV.grp.add(m); PRV.grp.rotation.set(0.12, 0.6, 0);
  PRV.cv = cv; PRV.cx = cv.getContext('2d'); PRV.t = 0; PRV.on = true;
}
function prvKare(dt) {
  if (!PRV.on || !PRV.cv || !PRV.cv.isConnected) { PRV.on = false; return; }
  PRV.t += dt; PRV.grp.rotation.y += dt * 1.3; PRV.grp.position.y = Math.sin(PRV.t * 2.2) * 0.08;
  const pr = ren.getPixelRatio(), w = PRV.cv.width, wc = w / pr;
  ren.setScissorTest(true); ren.setScissor(0, 0, wc, wc); ren.setViewport(0, 0, wc, wc);
  const sh = ren.shadowMap.enabled; ren.shadowMap.enabled = false; ren.render(PRV.sc, PRV.cam); ren.shadowMap.enabled = sh;
  PRV.cx.clearRect(0, 0, w, w); PRV.cx.drawImage(glc, 0, glc.height - w, w, w, 0, 0, w, w);
  ren.setScissorTest(false); ren.setViewport(0, 0, innerWidth, innerHeight);
}
function yeniSekil() {
  if (K || TEST || Q.get('kart') === '0' || !g) return;
  if (!SV.gor) SV.gor = [];
  const yeni = []; for (const c of cubes) { const a = aileOf(c.col); if (a && !SV.gor.includes(a) && !yeni.some((y) => y[0] === a)) yeni.push([a, c.col]); }
  if (!yeni.length) return yeniEngel();
  const goster = (n) => {
    const [a, col] = yeni[n], [ad, ne] = AILE[a]; SV.gor.push(a); save();
    const pr = Math.min(2, ren.getPixelRatio()), px = Math.round(200 * ren.getPixelRatio());
    modal('<div class="rib ys">YENİ ŞEKİL!</div><div class="ysk"><span class="ysi"></span><canvas id="yscv" width="' + px + '" height="' + px + '"></canvas></div><h2>' + ad + '</h2><p>' + ne + '</p><button class="btn" id="ysok">Harika!</button>');
    $('card').classList.add('yskart'); prvGoster(col, $('yscv')); sfx('bonus'); buzz(25);
    $('ysok').onclick = () => { sfx('tik'); PRV.on = false; $('card').classList.remove('yskart'); closeModal(); if (n + 1 < yeni.length) setTimeout(() => goster(n + 1), 180); else yeniEngel(); };
  };
  setTimeout(() => goster(0), 450);
}
function ggOnce() {
  if (K || TEST || Q.get('gg') === '0') { ggHud(); return; }
  ggKur(); const s = ggSay(), sec = new Set();
  const maliyet = () => { let m = 0; for (const k of sec) if (!(s[k] > 0)) m += ggT(k).fiyat; return m; };
  modal('<div class="rib">Bölüm ' + LV + '</div><h2>' + (g.ad || '') + '</h2><p>Güçlendirici seç</p><div class="ggk">' +
    GGT.map((t) => '<button class="gt gt-' + t.k + '" data-k="' + t.k + '"><span class="hl"></span><i>' + t.ic + '</i>' + (s[t.k] > 0 ? '<span class="n">' + s[t.k] + '</span>' : '<span class="p"><em class="coin"></em>' + t.fiyat + '</span>') + '<span class="ok">✓</span></button>').join('') +
    '</div><p class="kasa"><em class="coin"></em> <b id="ggal">' + (SV.altin || 0) + '</b></p><button class="btn" id="ggo">Oyna</button>');
  for (const el of document.querySelectorAll('.gt')) el.onclick = () => {
    const k = el.dataset.k;
    if (sec.has(k)) { sec.delete(k); el.classList.remove('on'); sfx('tik'); }
    else { sec.add(k); if (maliyet() > (SV.altin || 0)) { sec.delete(k); ggCal(el, 'salla'); buzz([40, 40, 40], 0); sfx('tik'); return; } el.classList.add('on'); ggCal(el, 'bas'); sfx('bonus'); buzz(30); }
    $('ggal').textContent = (SV.altin || 0) - maliyet();
  };
  $('ggo').onclick = () => {
    sfx('tik'); closeModal();
    const nm = $('nm'); nm.classList.remove('on'); void nm.offsetWidth; nm.classList.add('on');
    let gec = 0;
    for (const t of GGT) { if (!sec.has(t.k) || !ggOde(t.k)) continue;
      if (t.k === 'yildirim') { const gg0 = g; setTimeout(() => { if (g === gg0 && g.state === 'play') ggYildirim(); }, 900); }
      else { const k = t.k; setTimeout(() => { if (g && g.state === 'play') { ggCal(ggT(k).el, 'bas'); ggUygula(k); ggHud(); sfx('bonus'); } }, 250 + gec * 200); gec++; } }
    ggHud();
  };
  ggHud();
}
if ($('re')) $('re').onclick = () => start(LV);
$('home').onclick = () => { if (K) location.href = '../'; else if (M) { if (g && g.state === 'play') { sfx('tik'); M.duraklat(); } } else start(LV); };

// dokunma: once kuplere, yoksa yapinin onundeki dikey duzleme nisan alinir
const ray = new THREE.Raycaster(), NDC = new THREE.Vector2(), AIMPL = new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.0);
function aimAt(cx, cy) {
  NDC.set(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1); ray.setFromCamera(NDC, cam);
  const hits = ray.intersectObjects(cubes.filter((c) => !c.gone).map((c) => c.mesh), true);
  if (hits.length) return hits[0].point.clone().addScaledVector(ray.ray.direction, 0.3);
  const p = new THREE.Vector3(); return ray.ray.intersectPlane(AIMPL, p) ? p : null;
}
// v6.23: (Adem 8 Kas: ses ve titresim cikmiyor) telefonlarda tarayici sesi ancak parmak kalkinca (pointerup/touchend/click) acar;
// eskiden ses sadece pointerdown'da aciliyordu, iPhone'da hic acilmiyordu. Simdi her dokunusta (kart dugmeleri dahil) acilir,
// iPhone'da sessiz anahtar acikken de calar (audioSession 'playback'); sesi kapatmak icin ust kosedeki hoparlor dugmesi.
function sesAc() {
  if (SV.sessiz) return;
  try { if (navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; } catch (x) {}
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); decodeAll(); } catch (x) { return; } }
  if (AC.state !== 'running') { const r = AC.resume(); if (r && r.catch) r.catch(() => {}); }
  if (!AC._kilit) { AC._kilit = 1; try { const b = AC.createBuffer(1, 1, 22050), s = AC.createBufferSource(); s.buffer = b; s.connect(AC.destination); s.start(0); } catch (x) {} }   // eski iOS: sessiz bir ornek calinca kilit acilir
}
for (const ev of ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']) addEventListener(ev, sesAc, { capture: true, passive: true });
document.addEventListener('visibilitychange', () => { const v = $('bgv'); if (v && $('bg').classList.contains('vid')) { if (document.hidden) v.pause(); else v.play().catch(() => {}); }   // v6.29: ekran kapaliyken fon videosu durur
  if (!AC) return; if (document.hidden) { AC.suspend(); if (MZ) MZ.el.pause(); if (SR) SR.el.pause(); } else if (!SV.sessiz) { AC.resume().catch(() => {}); if (MZ && !SV.muziksiz) muzikBasla(); } });   // v3.13: arka planda muzik dosyalari da durur
function sesDugme() { const b = $('ses'); if (b) b.textContent = SV.sessiz ? '🔇' : '🔊'; }
if ($('ses')) { sesDugme(); $('ses').onclick = () => { SV.sessiz = !SV.sessiz; save(); sesDugme(); if (SV.sessiz) { if (AC) AC.suspend(); } else { sesAc(); buzz(30); } }; }
// Blok Smash 1. asama: parmak ekranda kaldikca seri atis (shoot kendi 0.22 sn araligini korur); parmak kayarsa nisan da kayar.
let HOLD = null;
function holdTick() { if (!HOLD) return; if (g && g.state === 'play') { const p = aimAt(HOLD.x, HOLD.y); if (p) shoot(p); } requestAnimationFrame(holdTick); }
glc.addEventListener('pointerdown', (e) => {
  sesAc(); dokunTitre();
  const p = aimAt(e.clientX, e.clientY); if (p) shoot(p);
  const ilk = !HOLD; HOLD = { x: e.clientX, y: e.clientY, id: e.pointerId }; if (ilk) requestAnimationFrame(holdTick);
});
glc.addEventListener('pointermove', (e) => { if (HOLD && HOLD.id === e.pointerId) { HOLD.x = e.clientX; HOLD.y = e.clientY; } });
for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) glc.addEventListener(ev, (e) => { if (HOLD && HOLD.id === e.pointerId) HOLD = null; });

// ---------------- kamera ----------------
// platformun tamami ve altta Pofi ekrana sigar; dar (telefon) ekranda geriye cekilir
const CPITCH = 9 * Math.PI / 180, CAZ = 0, CTG = new THREE.Vector3(); let CAMI = 0;   // v2.0: kamera acisi; CAMI: bolum basinda kisa donus
const CGAP = 8;   // v6.27: (Adem) platform ile top arabasi arasi her bolumde esit (kupler arabanin uzerine devriliyordu)
const YAW = 0;   // v6.2: (Adem) platform kameraya duz baksin; derinligi yukaridan bakis acisi verir
function fit() {
  if (K && K.hazir()) return K.fit();
  // v6.2: 1) kamera: 13 derece yukaridan, tam karsidan. Yapinin tepesi ile platformun alt kenari ekranin ortasina (biraz yukari) oturur,
  //          yapi ekrana sigana kadar geri cekilir. 2) top arabasi: kameradan yapiya olan yolun ~%30'unda, ekran genisliginin ~%40'i kadar,
  //          namlu ucu ekranin alttan ~%24'unde. Platformla arasinda her zaman bosluk kalir.
  const W = innerWidth, H = innerHeight; ren.setSize(W, H, false); cam.aspect = W / H;
  const HF = 52;
  cam.fov = Math.max(42, Math.min(92, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(HF * Math.PI / 360) / cam.aspect)))); cam.updateProjectionMatrix();
  const pitch = CPITCH,   // v2.0: kamera yukaridan ve yandan bakar: bloklarin ustu ve yani gorunur (gercek 3B)
    dir = new THREE.Vector3(Math.sin(CAZ) * Math.cos(pitch), Math.sin(pitch), Math.cos(CAZ) * Math.cos(pitch)), thx = Math.tan(cam.fov * Math.PI / 360) * cam.aspect;
  const V = new THREE.Vector3(), tg = new THREE.Vector3();
  const yD = levelOf(LV), reach = yD && yD.don ? Math.hypot(R, RZ) : RZ;   // donen platformda kose disari tasar
  const tops = [[-R, TOPY + 0.2, -(FONYENI ? Math.max(RZ, RZB) : RZ)], [R, TOPY + 0.2, -(FONYENI ? Math.max(RZ, RZB) : RZ)], [-R, TOPY + 0.2, RZ], [R, TOPY + 0.2, RZ]], bots = [[-R, -0.8, RZ], [R, -0.8, RZ]];
  const yOf = (p) => V.set(p[0], p[1], p[2]).project(cam).y;
  const place = (d, ty) => { tg.set(0, ty, 0); CTG.copy(tg); cam.position.copy(tg).addScaledVector(dir, d); cam.lookAt(tg); cam.updateMatrixWorld(true); };
  const foY = fonOf(LV), ayak = foY && foY.yeni ? 1 - 2 * fonPx(0.5, foY.cy)[1] / H : null;
  let d = Math.max(8, (reach + CGAP + 3.5) / Math.cos(pitch));   // kamera, arabaya yer kalacak kadar geride baslar
  for (; d < 120; d += 0.25) {
    let lo = -10, hi = TOPY + 10;
    // v3.19: resim fonda platform ayagi (0, GY, 0) resimdeki bos yuvarlak zeminin ortasina oturur (ekranda sabit nokta); kamera yapi sigana kadar geri cekilir
    if (ayak != null) { for (let it = 0; it < 28; it++) { const ty = (lo + hi) / 2; place(d, ty); if (yOf([0, GY, 0]) > ayak) lo = ty; else hi = ty; } }
    else for (let it = 0; it < 28; it++) { const ty = (lo + hi) / 2; place(d, ty); const top = Math.max(...tops.map(yOf)), bot = Math.min(...bots.map(yOf)); if ((top + bot) / 2 > 0.13) lo = ty; else hi = ty; }
    place(d, (lo + hi) / 2);
    const top = Math.max(...tops.map(yOf)), bot = Math.min(...bots.map(yOf)), side = Math.max(...tops.concat(bots).map((p) => Math.abs(V.set(p[0], p[1], p[2]).project(cam).x)));
    if (top < 0.74 && (ayak != null || bot > -0.46) && side < 0.92) break;   // v6.5: yapi ekrani daha cok doldurur
  }
  // top arabasi
  if (TC.gun) {
    const dH = Math.hypot(cam.position.x, cam.position.z), dc = Math.max(2.8, Math.min(dH - (reach + CGAP), (dH - reach) / 3.6));   // v6.29: (Adem) gozle gorulen aralik her bolumde ayni: kameranin platforma uzakligi arabaya uzakliginin 3.6 kati
    const k = (0.4 * 2 * dc * thx) / TC.w0; TC.holder.scale.setScalar(k); TC.k = k;
    let lo = GY - 30, hi = cam.position.y; const tipY = Math.max(-0.8, Math.min(-0.6, V.set(0, GY + 0.3, 2).project(cam).y - 0.16));   // v6.29: (Adem) namlu ucu ekranda platform ayaginin altinda kalir, ayagin ustune binmez
    for (let it = 0; it < 30; it++) { const by = (lo + hi) / 2; TC.holder.position.set(cam.position.x - Math.sin(CAZ) * dc, by, cam.position.z - Math.cos(CAZ) * dc); TC.holder.rotation.y = Math.PI + CAZ; TC.holder.updateMatrixWorld(true);
      const m = trunkTip(V); if (m.project(cam).y > tipY) hi = by; else lo = by; }
    TC.by = (lo + hi) / 2; TC.holder.position.y = TC.by;
    const ph = Math.max(0.2, (TC.by - GY) / TC.k); TC.pad.scale.y = ph; TC.pad.position.y = -ph / 2; TC.rim2.position.y = -ph + 0.12;
  }
  cam.userData.base = cam.position.clone(); tilkiYer(); if (FONYENI) fonIsi(fonOf(LV));
}
addEventListener('resize', fit); fit();

// ================= v6.27 KALITE (Adem 8 Kas: ticari kalite; once yalniz 1. bolumde) =================
// Darbe siddeti (s) ses, titresim, kamera ve kisa donmayi birlikte belirler. ?kalite=0 eski hal, ?kalite=1 her bolumde.
const KAL = () => !K && Q.get('kalite') !== '0';   // v2.0: vurus hissi her bolumde
let VS = 1, RS = 1, TS = 1, HS = 0, FP = 0;   // ses carpani, perde carpani, zaman olcegi, donma suresi, gorus acisi vurusu
const MAT_P = { tahta: { v: 1, r: 1, w: 1 }, tas: { v: 1.15, r: 0.88, w: 1.2 }, metal: { v: 0.95, r: 1.06, w: 1.15 }, cam: { v: 0.9, r: 1.14, w: 0.8 }, buz: { v: 0.9, r: 1.1, w: 0.85 } };
const MAT_H = { tahta: (s) => [Math.round(30 + 24 * s)], tas: (s) => [Math.round(40 + 36 * s)], metal: (s) => [34, 26, Math.round(30 + 20 * s)], cam: (s) => [30, 20, 30, 20, Math.round(26 + 12 * s)], buz: (s) => [28, 18, Math.round(28 + 14 * s)] };
function withS(s, rs, fn) { const a = VS, b = RS; VS = s; RS = rs; try { fn(); } finally { VS = a; RS = b; } }
function hitstop(sec) { HS = Math.max(HS, sec); TS = 0.12; }
function darbeHaptik(kind, s) { if (s < 0.35) return; buzz((MAT_H[matSnd(kind)] || MAT_H.tahta)(Math.min(1.4, s)), 70); }
// bir kupun baska bir seye carpma sesi: yalniz yeterince sert ve sik degil; kirilacak cam/kavanoz kendi kirilma sesini cikarir
function darbeSesi(c, vn) {
  if (!g || !g.armed || c.out || vn < 4) return; const now = performance.now(); if (c.sndT && now - c.sndT < 140) return;
  const m = matSnd(c.kind); if (m === 'cam' || m === 'buz') return; c.sndT = now;
  const s = Math.min(1, vn / 18) * 0.7, mp = MAT_P[m] || MAT_P.tahta;
  withS(s * mp.v, mp.r * (1.08 - 0.14 * s), () => sfx('kir', c.kind));
}
const SHV = new THREE.Vector3();
// yumusak kamera sarsintisi: siddet karesiyle artar (hafif darbede neredeyse yok, agirda belirgin), rastgele sicrama yok
function shakeK() { const T = Math.min(1, shake / 0.6), a = 0.32 * T * T, t = performance.now() / 1000; return SHV.set((Math.sin(t * 31) + 0.5 * Math.sin(t * 47 + 1.3)) / 1.5 * a, (Math.sin(t * 37 + 2.1) + 0.5 * Math.sin(t * 53)) / 1.5 * a, 0); }
function fovK(dt) {
  if (FP > 0.01) { if (!cam.userData.f0) cam.userData.f0 = cam.fov; FP *= Math.exp(-dt / 0.18); cam.fov = cam.userData.f0 + FP; cam.updateProjectionMatrix(); }
  else if (cam.userData.f0) { cam.fov = cam.userData.f0; cam.userData.f0 = 0; cam.updateProjectionMatrix(); }
}
// top kupe carpinca: malzemeye gore agirlik, ses, titresim, kisa donma, gorus acisi vurusu
function impactK(b, e) {
  const c = b.hc, vn = e && e.contact ? Math.abs(e.contact.getImpactVelocityAlongNormal()) : 45, mp = MAT_P[matSnd(c ? c.kind : null)] || MAT_P.tahta, s = Math.min(1.4, vn / 70) * mp.w;
  wakeAll(); g.busy = 2.5;
  const p = new THREE.Vector3().copy(b.body.position); hitFlash(p); burst(p, '#fff3a0', 12, 8);
  withS(Math.min(1.3, 0.75 + 0.3 * s), 1.04 - 0.1 * Math.min(1, s), () => sfx('hit'));
  buzz([Math.round(40 + 16 * s), 26, 34], 0); shake = Math.max(shake, 0.12 + 0.3 * s * s); FP = Math.min(6, FP + 2.2 * s); hitstop(0.07 * Math.min(1, s));
}
// kirilan kavanoz parcalarinin malzemeleri ilk kirilista derleniyordu (200 ms takilma): yuklenince bir kez gorunmez yerde derle
function isitmaParca(L) {
  const hold = L.map((x) => x.nd);
  for (const nd of hold) { nd.position.set(0, -80, 0); scene.add(nd); }
  try { scene.traverse((o) => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) for (const k of ['map', 'emissiveMap', 'normalMap', 'roughnessMap', 'envMap']) if (m[k] && m[k].isTexture && !m[k].isCubeTexture) ren.initTexture(m[k]); }); ren.compile(scene, cam); } catch (e) {}
  for (const nd of hold) { scene.remove(nd); nd.position.set(0, 0, 0); }
}
// ilk darbede 200 ms takilma vardi (yeni golgelendirici ve doku yuklemesi): efekt malzemelerini kamera gormeden onceden hazirla
function isitma() {
  if (isitma.k) return; isitma.k = 1;
  const p = new THREE.Vector3(0, -80, 0);
  try { hitFlash(p); burst(p, '#fff3a0', 4, 2); shatter(p, '#cccccc', new THREE.Vector3(0, 1, 0), null, 4, null); splat(0, -80, 0, 1); } catch (e) {}
  scene.traverse((o) => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) for (const k of ['map', 'emissiveMap', 'normalMap', 'roughnessMap']) if (m[k] && m[k].isTexture) ren.initTexture(m[k]); });
  try { ren.compile(scene, cam); } catch (e) {}
  const sp = SPL.pop(); if (sp) scene.remove(sp.m);
}
// ---------------- dongu ----------------
let last = 0, shake = 0, STARTT = 0;
function frame(ts) {
  // v3.0: ana sayfa acikken ya da oyun duraklatilmisken sahne islemez ve cizilmez (telefon isinmasin); bolum kurulduktan sonraki ilk 2,5 sn haric (malzemeler derlensin)
  { const v = $('bgv'), dur = !!(M && M.durdur()); if (v && dur && !v.paused) v.pause(); else if (v && !dur && v.paused && $('bg').classList.contains('vid')) v.play().catch(() => {}); }   // v3.18: ana sayfa/duraklatma acikken fon videosu durur
  { const gi = $('bgisi'); if (gi) gi.classList.toggle('dur', !!(M && M.durdur())); }   // v3.19: menu acikken fon parlamasi durur
  if (M && M.durdur() && performance.now() - STARTT > 2500) { last = 0; if (!TEST) requestAnimationFrame(frame); return; }
  const dt = Math.min(0.05, last ? (ts - last) / 1000 : 0.016); last = ts;
  if (HS > 0) { HS -= dt; if (HS <= 0) TS = 1; }
  if (K) K.kare(dt);   // v6.19: seyir, sallanan hedef, batma
  if (g && ENG.length) engKare(g.t);
  if (g) { g.t += dt; spin(dt); slide(dt); if (FONYENI) { denge(dt); temaKare(); } world.step(1 / 120, dt * TS, 8); if (SIRK.mesh) SIRK.mesh.quaternion.set(platBody.quaternion.x, platBody.quaternion.y, platBody.quaternion.z, platBody.quaternion.w); updateFuse(dt); updateDebris(dt); syncMeshes(); updateBalls(dt); ggKare(dt); updateCubes(dt); if (KM.bomba) KM.bomba.emissiveIntensity = 0.45 + 0.4 * Math.sin(g.t * 8); }
  updatePofi(dt); updateCannon(dt); updateTilki(dt); updateParts(dt); updateFX(dt); updSea(dt); CDT += dt; if (++CN % 2 === 0 || !sahneBos()) { canliKare(CDT); CDT = 0; }   /* v6.29: fondaki kus/koyun katmani boştayken saniyede 30 kez */ if (flashLight.intensity > 0) flashLight.intensity = Math.max(0, flashLight.intensity - dt * 400);
  if (shake > 0) { shake = Math.max(0, shake - dt * 1.4); cam.position.copy(cam.userData.base).add(KAL() ? shakeK() : new THREE.Vector3((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake, 0)); } else if (cam.userData.base) cam.position.copy(cam.userData.base);
  if (CAMI > 0 && cam.userData.base) { CAMI = Math.max(0, CAMI - dt); const k = CAMI / 1.6, a = 0.75 * k * k * (3 - 2 * k), b = cam.userData.base, dx = b.x - CTG.x, dz = b.z - CTG.z, c = Math.cos(a), sn = Math.sin(a); cam.position.set(CTG.x + dx * c + dz * sn, b.y + 2.2 * k * k, CTG.z - dx * sn + dz * c); cam.lookAt(CTG); if (CAMI === 0) { cam.position.copy(b); cam.lookAt(CTG); } }
  fovK(dt);
  // v6.29: (Adem: telefon cok isiniyor) hicbir sey kipirdamiyorsa golge haritasi yeniden cizilmez ve sahne saniyede 20 kez cizilir
  if (PRV.on) prvKare(dt);
  if (sahneBos()) { BOS++; if (BOS > 12) { ren.shadowMap.autoUpdate = false; if (BOS % 3) { if (!TEST) requestAnimationFrame(frame); return; } } }
  else { BOS = 0; ren.shadowMap.autoUpdate = true; }
  ren.render(scene, cam); tilkiCiz();
  if (!TEST) requestAnimationFrame(frame);
}
let BOS = 0, CN = 0, CDT = 0;
function sahneBos() {
  if (ENG.length || GGA.length || PRV.on) return false;
  if (CAMI > 0 || K || TEST || !g || g.don || balls.length || FX.length || parts.length || DEB.length || shake > 0 || HS > 0 || FP > 0.01 || flashLight.intensity > 0 || TC.rec > 0 || Math.abs(TC.aimYaw - TC.yaw) > 1e-3 || PF.holder.visible || (TK.t && TK.gor)) return false;
  for (const q of PLS) if (q.kay || q.asn) return false;
  for (const c of cubes) if (!c.out && (c.landed || c.fuse != null || (c.body.world && c.body.mass > 0 && c.body.sleepState === 0))) return false;
  return true;
}
function start(L) {
  ggIade();
  LV = Math.max(1, Math.floor(+L) || 1); SV.L = LV; gorevKaydet(); save(); if (!TEST && !K) CAMI = 1.6; closeModal(); $('praise').innerHTML = '';
  setPofiCol(POFICOL[(LV - 1) % POFICOL.length]); buildLevel();
  if (OYUN_TILKI && !K && !TEST_TILKISIZ && seciliKarakter(SV.max) === 'tilki') tilkiGoster().then(() => { TK.gor = !!TK.t; tilkiDurum('oyun'); if (TK.t) TK.t.oyna('selam', 1.4); }); else TK.gor = false;
  engKur(LV, levelOf(LV));
  STARTT = performance.now();
  if (M) { ggKur(); ggHud(); yeniSekil(); } else ggOnce();   // v3.0: guclendirici secimi bolum kartinda (merkez.js), bolum kurulmadan once
  if (KAL()) isitma();
}
if (!K) window.BSTUS = () => sfx('tik');   // v3.3: her dugmeye dokununca tus sesi (yapi/index.html)
window.YP = { get M() { return M; }, SV, TK, tilkiDurum, gg: { bas: ggBas, uygula: ggUygula, GGA, say: ggSay }, K, ren, TC, cam, scene, cubes, balls, get g() { return g; }, get R() { return R; }, get RZ() { return RZ; }, get PLS() { return PLS; }, get ENG() { return ENG; }, GY: () => GY, start, shoot: (x, y, z) => shoot(new THREE.Vector3(x, y, z)), aimAt, run(sec) { let t = last || 0; for (let i = 0; i < Math.round(sec * 60); i++) { t += 1000 / 60; frame(t); } }, snap() { return glc.toDataURL('image/png'); } };
if (K) K.bagla({ THREE, CANNON, GLTFLoader, scene, world, cam, ren, sun, rim, MOD, PM, platBody, GB, cubes, balls, S, TC, KEEP, NENV, SV, save, $, Q, TEST,
  get g() { return g; }, get LV() { return LV; }, get GY() { return GY; }, set GY(v) { GY = v; GB.position.y = v; }, get shake() { return shake; }, set shake(v) { shake = v; },
  set TOPY(v) { TOPY = v; }, set R(v) { R = v; }, set RZ(v) { RZ = v; }, LEG, DIRT, KIND, splashSnd: (v) => AC && (K ? play('su', v + 0.2) : splashSnd(v)), dongu, play: (k, v, r) => AC && play(k, v, r),
  clearLevel, addCubes, hud, setPlat, sfx, play, chime, splash, ripple, bubble, foam, seaY, burst, confetti, modal, closeModal, start, buzz, spr, fx, trunkTip, wakeAll, FOAMT, SOFT, canvasTex, floatText, screenAt,
  get AC() { return AC; } });
// v3.0: acilis ekranindaki yukleme cubugu (index.html'deki BSYUK)
{ let n = 0; const P5 = [faceReady, pofiReady, texReady, modelReady]; for (const p of P5) p.then(() => { n++; if (window.BSYUK) window.BSYUK(0.15 + 0.75 * n / P5.length); }); }
Promise.all([faceReady, pofiReady, texReady, modelReady, K ? K.yukle() : 0]).then(() => {
  makeCannon(); fit();
  if (!K && !TEST) merkezBagla();
  for (const k in KMAT) delete KMAT[k];
  start(Math.floor(+(Q.get('sv') || SV.L || 1)) || 1);
  if (M && !Q.has('sv')) M.ac({ ilk: true });
  loadPieces();   // v6.16
  avgIsit();
  if (window.BSYUK) window.BSYUK(1); if (window.BSACILIS) window.BSACILIS(); else { const l = $('load'); setTimeout(() => { l.style.opacity = 0; setTimeout(() => l.remove(), 550); }, 350); }   // v3.14: acilis videosu kendi kapanir
  if (!TEST) requestAnimationFrame(frame); else frame(16);
});
