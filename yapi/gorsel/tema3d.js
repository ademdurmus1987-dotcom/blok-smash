// Tema arka plan dekorlari (plaj/korsan, kar, kale) — Kenney modelleri.
// Yalniz arka plan katmani: hepsi platformun ARKA kenarinin arkasinda durur (bloklarin onune hic gecemez), fizik govdesi YOK,
// bolum verisine yazmaz. Yatay yer ekrana gore verilir (sx): telefonda da genis ekranda da sahneyi kenarlardan cerceveler.
// yerlestir(): yakin dekorun ekrandaki kutusu yapinin kutusuna fazla girerse disari kaydirilir, yine olmazsa gizlenir.
// Zayif cihazda (ya da FPS dusunce) yogunluk otomatik azalir.
import * as THREE from '../../three.module.min.js';
import { TEMA, YOGUNLUK } from './ayar.js';
import { kenneyYukle, kenneyKopya, kenneyCoklu } from './kenney.js';
import { mergeGeometries } from '../../BufferGeometryUtils.js';

export function baslangicYogunluk() {
  const mem = navigator.deviceMemory || 4, cpu = navigator.hardwareConcurrency || 4;
  return mem <= 2 || cpu <= 2 ? YOGUNLUK.dusuk : mem <= 4 || cpu <= 4 ? YOGUNLUK.orta : YOGUNLUK.yuksek;
}

// bayrak dalgalanmasi: malzemenin kopyasina kucuk bir dalga (vertex) eklenir; direk sabit kalir
const ZAMAN = { value: 0 };
function bayrakMat(m, geo) {
  geo.computeBoundingBox(); const b = geo.boundingBox, sx = b.max.x - b.min.x, sz = b.max.z - b.min.z, sy = b.max.y - b.min.y;
  const asili = sy > 2.2 * Math.max(sx, sz) && Math.min(sx, sz) < 0.08;   // sancak: yukaridan sarkan bez
  const eks = sx >= sz ? 'x' : 'z', dik = eks === 'x' ? 'z' : 'x', L = Math.max(sx, sz, 0.01);
  const ince = asili ? (sx < sz ? 'x' : 'z') : dik;
  const k = m.clone(); k.onBeforeCompile = (sh) => {
    sh.uniforms.uT = ZAMAN;
    sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      float uz = ${asili ? `clamp((${b.max.y.toFixed(3)} - position.y) / ${sy.toFixed(3)}, 0.0, 1.0)` : `clamp(abs(position.${eks}) / ${L.toFixed(3)}, 0.0, 1.0)`};
      transformed.${ince} += sin(uT * 3.2 + ${asili ? 'position.y * 5.0' : `position.${eks} * 7.0`}) * ${(asili ? 0.04 : 0.07).toFixed(3)} * uz;`);
  };
  k.customProgramCacheKey = () => 'bayrak' + (asili ? 'a' : eks) + L.toFixed(2); return k;
}
function bayraklastir(o, hepsi) {
  o.traverse((c) => { if (c.isMesh && (hepsi || /flag/i.test(c.name) || (c.parent && /flag/i.test(c.parent.name)))) c.material = bayrakMat(c.material, c.geometry); });
}
// ayni malzemeyi kullanan sabit parcalari tek meshte birlestir (gemi gibi cok parcali modeller tek cizim olur)
function birlestirStatik(n) {
  n.updateMatrixWorld(true); const ters = n.matrixWorld.clone().invert(), gr = new Map();
  n.traverse((c) => { if (c.isMesh && !c.material.onBeforeCompile.toString().includes('uT')) { const k = c.material.uuid; if (!gr.has(k)) gr.set(k, []); gr.get(k).push(c); } });
  for (const list of gr.values()) {
    if (list.length < 2) continue;
    try {
      const gs = list.map((c) => { const g = c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone(); for (const a of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(a)) g.deleteAttribute(a); return g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(ters, c.matrixWorld)); });
      const m = new THREE.Mesh(mergeGeometries(gs, false), list[0].material); m.castShadow = m.receiveShadow = true;
      for (const c of list) c.parent.remove(c); n.add(m);
    } catch (e) { /* birlesmezse parcalar oldugu gibi kalir */ }
  }
}
const yukseklik = (o) => { o.updateMatrixWorld(true); return new THREE.Box3().setFromObject(o).max.y; };

export { kenneyOrtam } from './kenney.js';
export { hdrOrtam } from './ortam.js';
export { DUNYA_TEMA } from './ayar.js';

export function temaDekor(ad, { S = 1.55, zemin = 0, arka = 6, yogunluk = baslangicYogunluk(), sabit = false, golge = true } = {}) {
  const T = TEMA[ad], kok = new THREE.Group(); kok.name = 'tema:' + ad;
  const ogeler = [];   // { nesne, defs, yerel?, d, x[] }
  let seviye = yogunluk, fps = { t: 0, n: 0 }, hazir = false;
  const olc = (e) => e.s * S / 1.55;

  async function tekKur(e) {
    const n = await kenneyKopya(e.m); if (!n) return null;
    if (e.kat) { let y = yukseklik(n); for (const k of e.kat) { const p = await kenneyKopya(k); if (!p) continue; p.position.y = y - 0.002; n.add(p); y = yukseklik(n); } }
    if (e.tepe) { const p = await kenneyKopya(e.tepe[0]); if (p) { p.position.y = yukseklik(n) - 0.05; if (e.tepe[1]) bayraklastir(p, true); n.add(p); } }
    for (const [m, pos, ry, bay] of e.ek || []) { const p = await kenneyKopya(m); if (!p) continue; p.position.set(...pos); p.rotation.y = ry || 0; if (bay) bayraklastir(p, true); n.add(p); }
    if (e.sal) bayraklastir(n, false);   // gemilerin bayraklari
    birlestirStatik(n);
    n.rotation.y = e.ry || 0; n.scale.setScalar(olc(e));
    const g = new THREE.Group(); g.add(n); return g;
  }
  async function kur() {
    if (!T) return kok;
    const adlar = new Set(); for (const e of T.dekor) { adlar.add(e.m); (e.kat || []).forEach((k) => adlar.add(k)); (e.ek || []).forEach((k) => adlar.add(k[0])); if (e.tepe) adlar.add(e.tepe[0]); }
    await Promise.all([...adlar].map(kenneyYukle));
    // ayni model 2+ kez ve sade (ek parcasi yok): tek InstancedMesh (oncelik basina ayri, tek tek gizlenebilsin)
    const say = new Map(); for (const e of T.dekor) if (!e.sal && !e.kat && !e.ek && !e.tepe) say.set(e.m, (say.get(e.m) || 0) + 1);
    const coklu = new Map();
    for (const e of T.dekor) {
      if ((say.get(e.m) || 0) > 1) { const k = e.m + '|' + (e.d || 1) + '|' + (e.uzak ? 1 : 0); if (!coklu.has(k)) coklu.set(k, []); coklu.get(k).push(e); continue; }
      const g = await tekKur(e); if (!g) continue; kok.add(g); ogeler.push({ nesne: g, defs: [e], d: e.d || 1, x: [e.sx * 12] });
    }
    for (const [k, list] of coklu) {
      const gr = await kenneyCoklu(k.split('|')[0], list.map(() => new THREE.Matrix4())); if (!gr) continue;
      kok.add(gr); ogeler.push({ nesne: gr, defs: list, yerel: gr, d: list[0].d || 1, x: list.map((e) => e.sx * 12) });
    }
    kok.traverse((c) => { if (c.isMesh) { c.castShadow = golge; c.receiveShadow = golge; } });   // oyunda uzak dekor golge cizmez (performans)
    konumla(); seviyeUygula(); hazir = true; return kok;
  }
  function konumla() {
    for (const o of ogeler) {
      if (o.yerel) {
        o.defs.forEach((e, i) => o.yerel.userData.ayarla(i, new THREE.Matrix4().compose(new THREE.Vector3(o.x[i], zemin + (e.y || 0), -(arka + e.z)), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, e.ry || 0, 0)), new THREE.Vector3().setScalar(olc(e)))));
        o.yerel.userData.bitti();
      } else { const e = o.defs[0]; o.nesne.position.set(o.x[0], zemin + (e.y || 0), -(arka + e.z)); }
    }
  }
  function seviyeUygula() { for (const o of ogeler) o.nesne.visible = !o.gizli && o.d <= seviye; }

  return {
    kok, kur, get hazir() { return hazir; }, get seviye() { return seviye; },
    ayarla(o) { if (o.zemin != null) zemin = o.zemin; if (o.arka != null) arka = o.arka; if (o.S) S = o.S; konumla(); },
    yogunluk(v) { seviye = v; seviyeUygula(); },
    // cam: oyun kamerasi. alan: yapinin ekran kutusu (NDC {x0,x1,y0,y1}); yakin dekor buna en fazla 'tolerans' kadar girebilir.
    yerlestir(cam, alan, tolerans = 0.1) {
      cam.updateMatrixWorld(true);
      const ileri = cam.getWorldDirection(new THREE.Vector3()), V = new THREE.Vector3(), B = new THREE.Box3();
      const tanH = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * cam.aspect;
      // sx -> dunya x: o derinlikte ekranin yarim genisligi = D * tanH
      for (const o of ogeler) o.defs.forEach((e, i) => { V.set(0, zemin, -(arka + e.z)).sub(cam.position); const D = V.dot(ileri); o.x[i] = cam.position.x + e.sx * D * tanH; });
      konumla();
      for (const o of ogeler) {
        o.gizli = false; if (o.defs.every((e) => e.uzak)) continue;
        for (let k = 0; k < 6; k++) {
          o.nesne.updateMatrixWorld(true); B.setFromObject(o.nesne);
          let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
          for (let j = 0; j < 8; j++) { V.set(j & 1 ? B.max.x : B.min.x, j & 2 ? B.max.y : B.min.y, j & 4 ? B.max.z : B.min.z).project(cam); x0 = Math.min(x0, V.x); x1 = Math.max(x1, V.x); y0 = Math.min(y0, V.y); y1 = Math.max(y1, V.y); }
          const girer = Math.min(x1, alan.x1) - Math.max(x0, alan.x0), dikey = y1 > alan.y0 && y0 < alan.y1;
          if (!dikey || girer < tolerans) break;
          if (k === 5) { o.gizli = true; break; }
          o.x = o.x.map((x) => x * 1.12); konumla();   // ekranin disina dogru kaydir
        }
      }
      seviyeUygula();
    },
    kare(dt, t) {
      ZAMAN.value = t;
      for (const o of ogeler) { const e = o.defs[0]; if (e.sal && !o.yerel) { const n = o.nesne.children[0], ph = e.sx * 2; n.rotation.z = Math.sin(t * 0.9 + ph) * 0.035; n.rotation.x = Math.sin(t * 0.7 + ph) * 0.02; n.position.y = Math.sin(t * 1.1 + ph) * 0.15; } }
      // otomatik yogunluk: olcum suresince ortalama FPS esigin altindaysa bir kademe dus
      if (!sabit && dt > 0 && dt < 0.5 && seviye > 1) { fps.t += dt; fps.n++; if (fps.t >= YOGUNLUK.olcSn) { const f = fps.n / fps.t; fps = { t: 0, n: 0 }; if (f < YOGUNLUK.fpsEsik) { seviye--; seviyeUygula(); } } }
    },
    temizle() { if (kok.parent) kok.parent.remove(kok); ogeler.length = 0; }
  };
}
