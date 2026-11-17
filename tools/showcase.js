// Foxi Smash vitrini: oyunun isigi (yarikure + golgeli gunes + kenar isigi, ACES 1.12) ve on kamerasi (9 derece, tam karsidan).
// Adres: tools/showcase.html#<gorunum>   gorunumler: kavanoz, plaka, ozel, tumu, dizilim1, dizilim2
import * as THREE from '../three.module.min.js';
import * as CANNON from '../cannon.min.js';
import { mergeGeometries } from '../BufferGeometryUtils.js';
import { sekilKutuphanesi } from '../yapi/gorsel/sekiller.js';
import { hdrOrtam, oyunRenderer, oyunIsigi, onKamera } from '../yapi/gorsel/ortam.js';
import { RENKLER, OLCU } from '../yapi/gorsel/ayar.js';

const S = 1.55, Q = new URLSearchParams(location.search), $ = (i) => document.getElementById(i);
const ren = new THREE.WebGLRenderer({ canvas: $('gl'), antialias: true, alpha: true, preserveDrawingBuffer: true });
ren.setClearColor(0, 0); ren.setPixelRatio(Math.min(2, devicePixelRatio || 1)); oyunRenderer(ren);
const ENV = hdrOrtam(ren);
const K = sekilKutuphanesi({ THREE, env: ENV, mergeGeometries, dusuk: Q.get('dusuk') === '1' });
const cam = new THREE.PerspectiveCamera(40, 1, 0.3, 400); window.__K = K;   // test icin
let sahne, sun, dunya = null, govdeler = [], etiketler = [], kadr = null, zaman = 0;

const GORUNUM = {
  kavanoz: { ad: 'Kavanozlar', kur: kavanozlar }, plaka: { ad: 'Plakalar', kur: plakalar }, ozel: { ad: 'Buz · Taş · Kütük · Foxi · Platform', kur: ozel },
  tumu: { ad: 'Tümü', kur: tumu }, dizilim1: { ad: 'Dizilim 1', kur: () => dizilim(1) }, dizilim2: { ad: 'Dizilim 2', kur: () => dizilim(2) }
};
for (const k in GORUNUM) { const b = document.createElement('button'); b.textContent = GORUNUM[k].ad; b.dataset.g = k; b.onclick = () => { location.hash = k; }; $('ust').appendChild(b); }
if (Q.get('ust') === '0') $('ust').style.display = 'none';

function yeniSahne(fon) {
  sahne = new THREE.Scene(); sun = oyunIsigi(sahne, 22); govdeler = []; dunya = null; etiketler.forEach((e) => e.el.remove()); etiketler = []; kadr = null;
  const bg = $('bg'); bg.className = fon ? 'foto' : ''; bg.style.backgroundImage = fon ? 'url(' + fon + ')' : '';
  if (!fon) {   // studyo duvari ve zemin: golgeler okunur
    const m = new THREE.MeshStandardMaterial({ color: '#efe6fb', roughness: 0.9 });
    const duvar = new THREE.Mesh(new THREE.PlaneGeometry(400, 200), m); duvar.position.set(0, 60, -6); duvar.receiveShadow = true; sahne.add(duvar);
    const zem = new THREE.Mesh(new THREE.PlaneGeometry(400, 200), new THREE.MeshStandardMaterial({ color: '#e4d8f4', roughness: 0.85 })); zem.rotation.x = -Math.PI / 2; zem.position.y = -0.01; zem.receiveShadow = true; sahne.add(zem);
  }
}
// raf: beyaz yuvarlak kenarli tabla; ustune dizilir
const rafMat = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.5, clearcoat: 0.3 });
function raf(x0, x1, y) { const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.16, 2.4), rafMat); m.position.set((x0 + x1) / 2, y - 0.08, 0); m.receiveShadow = m.castShadow = true; sahne.add(m); }
function koy(ad, renk, x, y, z = 0, o = {}) {
  const m = K.mesh(ad, renk, o); m.scale.setScalar(S);
  const b = K.olcu(ad), h = o.yatay ? b[0] : b[1]; m.position.set(x, y + h * S / 2, z); if (o.ry) m.rotation.y = o.ry; sahne.add(m); return m;
}
function etiket(txt, p) { const el = document.createElement('span'); el.textContent = txt; $('etiket').appendChild(el); etiketler.push({ el, p: p.clone() }); }
// kamera: icerik ekrana sigana kadar geri cekilir (oyunun fit mantigi gibi)
function sigdir(kutu, pay = 0.9, ustPay = 0.78) {
  const W = innerWidth, H = innerHeight, c = kutu.getCenter(new THREE.Vector3()), V = new THREE.Vector3();
  for (let d = 4; d < 300; d += 0.5) {
    onKamera(cam, W, H, c, d); cam.updateMatrixWorld(true); let ok = true;
    for (let i = 0; i < 8 && ok; i++) { V.set(i & 1 ? kutu.max.x : kutu.min.x, i & 2 ? kutu.max.y : kutu.min.y, i & 4 ? kutu.max.z : kutu.min.z).project(cam); if (V.z > 1 || V.z < -1 || Math.abs(V.x) > pay || V.y > ustPay || V.y < -0.86) ok = false; }
    if (ok) break;
  }
  const r = Math.max(kutu.max.x - kutu.min.x, kutu.max.y - kutu.min.y) * 0.75;
  Object.assign(sun.shadow.camera, { left: -r, right: r, top: r, bottom: -r }); sun.position.set(c.x - 8, c.y + 18, c.z + 10); sun.target.position.copy(c); sahne.add(sun.target); sun.shadow.camera.updateProjectionMatrix();
}
const icerik = () => { const b = new THREE.Box3(); sahne.updateMatrixWorld(true); sahne.traverse((o) => { if (o.isMesh && o.castShadow && o.material !== rafMat) b.expandByObject(o); }); return b; };

// ---------------- (A) gorunumleri ----------------
function kavanozlar() {
  yeniSahne(); let y = 0;
  for (const boy of ['uzun', 'orta', 'kisa']) { raf(-7.6, 7.6, y); RENKLER.forEach((r, i) => koy('kavanoz-' + boy, r, (i - 2.5) * 2.5, y)); y += OLCU.kavanoz.boy[boy] * S + 0.9; }
  raf(-7.6, 7.6, y); RENKLER.slice(0, 3).forEach((r, i) => koy('kavanoz-orta', r, (i - 1) * 3.8 - 2.6, y, 0, { yatay: 1 })); koy('kavanoz-uzun', 'mavi', 4.6, y, 0, { yatay: 1 });
  sigdir(icerik());
}
function plakalar() {
  yeniSahne(); let y = 0;
  const sira = (list, ara) => { const gen = list.reduce((a, [ad]) => a + K.olcu(ad)[0] * S, 0) + ara * (list.length - 1); let x = -gen / 2; raf(x - 0.5, x + gen + 0.5, y);
    for (const [ad, r] of list) { const w = K.olcu(ad)[0] * S; koy(ad, r, x + w / 2, y); x += w + ara; } y += S + 0.9; };
  sira([['plaka-kare', 'kirmizi'], ['plaka-kare', 'mor'], ['plaka-kare', 'yesil'], ['plaka-kare', 'sari'], ['plaka-kare', 'turuncu'], ['plaka-kare', 'mavi'], ['plaka-kare-capa', 'mavi'], ['plaka-kare-capa', 'kirmizi']], 0.5);
  sira([['plaka-orta', 'kirmizi'], ['plaka-orta', 'mor'], ['plaka-orta', 'yesil'], ['plaka-orta', 'sari']], 0.5);
  sira([['plaka-orta', 'turuncu'], ['plaka-orta', 'mavi'], ['plaka-orta-capa', 'mor'], ['plaka-orta-capa', 'yesil']], 0.5);
  sira([['plaka-uzun', 'kirmizi'], ['plaka-uzun', 'mor']], 0.6); sira([['plaka-uzun', 'yesil'], ['plaka-uzun', 'sari']], 0.6); sira([['plaka-uzun', 'turuncu'], ['plaka-uzun-capa', 'mavi']], 0.6);
  sigdir(icerik());
}
function ozel() {
  yeniSahne(); raf(-12, 12, 0); { const z = sahne.children.filter((o) => o.isMesh && o.geometry.type === 'PlaneGeometry'); z[1].position.z = 0; }
  koy('buz', 'mavi', -9.5, 0); koy('buz-kolon', 'mavi', -6.6, 0); koy('buz-plaka-4', 'mavi', -2.2, 0); koy('tas', 'mavi', 2.4, 0); koy('kutuk', 'turuncu', 5.2, 0); koy('foxi', 'turuncu', 8.4, 0);
  koy('buz-plaka-4', 'mavi', -2.2, 0.34 * S); koy('tas', 'mavi', 2.4, S);
  const p = K.mesh('platform', 'mor'); p.scale.setScalar(S); p.position.set(0, -K.altY('platform') * S, -3.2); sahne.add(p);
  sigdir(icerik(), 0.92, 0.8);
}
function tumu() {
  yeniSahne(); let x = -30;
  for (const r of RENKLER) { koy('kavanoz-kisa', r, x, 0); koy('kavanoz-orta', r, x, 1.0 * S + 0.3); koy('kavanoz-uzun', r, x, 2.5 * S + 0.6); x += 1.8; }
  x += 1; for (const r of RENKLER) { koy('plaka-kare', r, x, 0); koy('plaka-orta', r, x + 0.8, S + 0.3); x += 1.9; }
  koy('plaka-uzun', 'mor', x + 2, 0); koy('plaka-uzun-capa', 'mavi', x + 2, S + 0.3); koy('plaka-orta-capa', 'yesil', x + 2, 2 * S + 0.6); x += 8.4;
  koy('buz', 'mavi', x, 0); koy('buz-kolon', 'mavi', x + 2.2, 0); koy('tas', 'mavi', x + 4.4, 0); koy('kutuk', 'turuncu', x + 6.4, 0); koy('foxi', 'turuncu', x + 8.6, 0);
  sigdir(icerik());
}

// ---------------- ornek dizilimler (platform ustunde, gercek fizik) ----------------
function dizilim(no, sahneVar) {
  if (!sahneVar) yeniSahne();
  dunya = new CANNON.World({ gravity: new CANNON.Vec3(0, -32, 0) }); dunya.allowSleep = true;
  const pm = K.mesh('platform', 'mor'); pm.scale.setScalar(S); sahne.add(pm);
  const pb = K.govde(CANNON, 'platform', S); dunya.addBody(pb);
  const zemin = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() }); zemin.quaternion.setFromEuler(-Math.PI / 2, 0, 0); zemin.position.y = K.altY('platform') * S; dunya.addBody(zemin);
  if (!sahneVar) { const zm = sahne.children.find((o) => o.isMesh && o.geometry.type === 'PlaneGeometry' && o.rotation.x); if (zm) zm.position.y = K.altY('platform') * S; }
  const ekle = (ad, renk, x, yAlt, z = 0) => {   // yAlt: parcanin alt yuzu (birim)
    const m = K.mesh(ad, renk); m.scale.setScalar(S); sahne.add(m);
    const h = K.olcu(ad)[1], b = K.govde(CANNON, ad, S, ad.startsWith('plaka') ? 2 : 1); b.position.set(x * S, (yAlt + h / 2) * S + 0.002, z * S);
    b.linearDamping = 0.05; b.angularDamping = 0.2; b.sleepSpeedLimit = 0.15; dunya.addBody(b); govdeler.push([m, b]);
  };
  if (no === 1) {   // altta sira sira kavanozlar + ustte basamakli uzun plakalar
    const r6 = ['kirmizi', 'turuncu', 'sari', 'yesil', 'mavi', 'mor'];
    r6.forEach((r, i) => ekle('kavanoz-orta', r, (i - 2.5) * 1.0, 0, 0.45));
    r6.forEach((r, i) => ekle('kavanoz-kisa', r6[(i + 3) % 6], (i - 2.5) * 1.0, 0, -0.6));
    let y = 1.5; ekle('plaka-uzun', 'mor', -2.02, y, 0.45); ekle('plaka-uzun', 'mavi', 2.02, y, 0.45);
    ekle('kavanoz-kisa', 'kirmizi', -2.4, 1, -0.6); ekle('kavanoz-kisa', 'yesil', 2.4, 1, -0.6);
    y += 1; ekle('plaka-uzun', 'kirmizi', -0.7, y, 0.45); ekle('plaka-orta', 'sari', 2.4, y, 0.45);
    y += 1; ekle('plaka-uzun-capa', 'yesil', 0.2, y, 0.45); y += 1; ekle('plaka-orta', 'turuncu', 0.6, y, 0.45);
    y += 1; ekle('foxi', 'turuncu', 0.6, y, 0.45);
  } else {   // buz kolonlu cerceve icinde katlar halinde kavanozlar + buz plakalar
    ekle('buz-kolon', 'mavi', -2.5, 0, 0); ekle('buz-kolon', 'mavi', 2.5, 0, 0);
    const kat = (y, renkler) => renkler.forEach((r, i) => ekle('kavanoz-kisa', r, (i - 1.5) * 1.0, y, 0));
    kat(0, ['kirmizi', 'sari', 'yesil', 'mavi']); ekle('buz-plaka-4', 'mavi', 0, 1, 0);
    kat(1.34, ['mor', 'turuncu', 'kirmizi', 'sari']); ekle('buz-plaka-4', 'mavi', 0, 2.34, 0);
    ekle('buz-plaka-6', 'mavi', 0, 3, 0);
    ekle('kavanoz-orta', 'mor', -1.6, 3.34, 0); ekle('foxi', 'turuncu', 0, 3.34, 0); ekle('kavanoz-orta', 'yesil', 1.6, 3.34, 0);
    ekle('kavanoz-kisa', 'kirmizi', -2.5, 3.34, 0); ekle('kavanoz-kisa', 'sari', 2.5, 3.34, 0);
  }
  for (let i = 0; i < 240; i++) dunya.step(1 / 120);   // yerine otursun
  esitle();
  if (!sahneVar) sigdir(icerik(), 0.86, 0.78);
  $('sars').hidden = false;
}
function esitle() { for (const [m, b] of govdeler) { m.position.copy(b.position); m.quaternion.copy(b.quaternion); } }
$('sars').onclick = () => { for (const [, b] of govdeler) { b.wakeUp(); b.applyImpulse(new CANNON.Vec3((Math.random() - 0.5) * 6, 8, -6 - Math.random() * 4), b.position); } };

// ---------------- dongu ----------------
let FPS = { n: 0, t: 0, d: 0 }, onceki = 0;
function kare(t) {
  const dt = Math.min(0.05, (t - (onceki || t)) / 1000); onceki = t; zaman += dt;
  if (dunya) { dunya.step(1 / 120, dt, 4); esitle(); }
  if (sahne) ren.render(sahne, cam);
  if (etiketler.length) { const V = new THREE.Vector3(); for (const e of etiketler) { V.copy(e.p).project(cam); e.el.style.left = ((V.x + 1) / 2 * innerWidth) + 'px'; e.el.style.top = ((1 - V.y) / 2 * innerHeight) + 'px'; } }
  FPS.n++; FPS.t += dt; if (FPS.t > 1) { FPS.d = Math.round(FPS.n / FPS.t); FPS = { n: 0, t: 0, d: FPS.d }; $('bilgi').textContent = (GORUNUM[gor] || {}).ad + ' · ' + FPS.d + ' FPS · ' + ren.info.render.calls + ' çizim · ' + Math.round(ren.info.render.triangles / 1000) + 'k üçgen'; window.__fps = FPS.d; window.__calls = ren.info.render.calls; }
  requestAnimationFrame(kare);
}
let gor = '';
async function ac() {
  gor = (location.hash || '#kavanoz').slice(1); if (!GORUNUM[gor]) gor = 'kavanoz';
  for (const b of $('ust').children) b.classList.toggle('on', b.dataset.g === gor);
  $('sars').hidden = true;
  window.__hazir = false;
  ren.setSize(innerWidth, innerHeight, false);
  await GORUNUM[gor].kur();
  window.__hazir = true;
}
addEventListener('hashchange', ac); addEventListener('resize', () => ac());
ac(); requestAnimationFrame(kare);
