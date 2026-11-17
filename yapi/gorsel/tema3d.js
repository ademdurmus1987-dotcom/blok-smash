// Tema arka plan dekorlari (plaj/korsan, kar, kale) — Kenney modelleri.
// Yalniz arka plan katmani: platformun arkasinda ve yanlarinda durur, fizik govdesi YOK, bolum verisine yazmaz.
// Oyun alanini kapatmaz: yerlestir() her dekorun ekrandaki kutusunu yapinin kutusuyla karsilastirir, ustune binen
// dekoru disari kaydirir, yine binerse gizler. Zayif cihazda (ya da FPS dusunce) yogunluk otomatik azalir.
import * as THREE from '../../three.module.min.js';
import { TEMA, YOGUNLUK } from './ayar.js';
import { kenneyYukle, kenneyKopya, kenneyCoklu } from './kenney.js';

// cihaz sinifina gore baslangic yogunlugu
export function baslangicYogunluk() {
  const mem = navigator.deviceMemory || 4, cpu = navigator.hardwareConcurrency || 4;
  return mem <= 2 || cpu <= 2 ? YOGUNLUK.dusuk : mem <= 4 || cpu <= 4 ? YOGUNLUK.orta : YOGUNLUK.yuksek;
}

// bayrak dalgalanmasi: malzemenin kopyasina kucuk bir koseli dalga (vertex) eklenir
const ZAMAN = { value: 0 };
function bayrakMat(m, geo) {
  geo.computeBoundingBox(); const b = geo.boundingBox, sx = b.max.x - b.min.x, sz = b.max.z - b.min.z, sy = b.max.y - b.min.y;
  const asili = sy > 2.2 * Math.max(sx, sz) && Math.max(sx, sz) < 0.2;   // sancak (yukaridan sarkan)
  const eks = sx >= sz ? 'x' : 'z', dik = eks === 'x' ? 'z' : 'x', L = Math.max(sx, sz, 0.01);
  const k = m.clone(); k.onBeforeCompile = (sh) => {
    sh.uniforms.uT = ZAMAN;
    sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      float uz = ${asili ? `clamp((${b.max.y.toFixed(3)} - position.y) / ${sy.toFixed(3)}, 0.0, 1.0)` : `clamp(abs(position.${eks}) / ${L.toFixed(3)}, 0.0, 1.0)`};
      transformed.${asili ? 'x' : dik} += sin(uT * 3.2 + ${asili ? 'position.y * 5.0' : `position.${eks} * 7.0`}) * ${(asili ? 0.05 : 0.06).toFixed(3)} * uz;`);
  };
  k.customProgramCacheKey = () => 'bayrak' + (asili ? 'a' : eks); return k;
}
function bayraklastir(o, hepsi) {
  o.traverse((c) => { if (c.isMesh && (hepsi || /flag/i.test(c.name) || /flag/i.test(c.parent && c.parent.name))) c.material = bayrakMat(c.material, c.geometry); });
}

export function temaDekor(ad, { S = 1.55, zemin = 0, arka = 6, yogunluk = baslangicYogunluk() } = {}) {
  const T = TEMA[ad]; const kok = new THREE.Group(); kok.name = 'tema:' + ad;
  const ogeler = [];   // { nesne, d, x0, z0, def }
  let seviye = yogunluk, fps = { t: 0, n: 0 }, hazir = false;

  async function kur() {
    if (!T) return kok;
    const tekrar = new Map(); for (const e of T.dekor) if (!e.sal && !e.bayrak && !e.kat) tekrar.set(e.m, (tekrar.get(e.m) || 0) + 1);
    const coklu = new Map();
    await Promise.all(T.dekor.map((e) => Promise.all([e.m, ...(e.kat || [])].map(kenneyYukle))));
    for (const e of T.dekor) {
      let n;
      if ((tekrar.get(e.m) || 0) > 1) {   // ayni model 2+ kez: InstancedMesh (tek cizim)
        if (!coklu.has(e.m)) coklu.set(e.m, []);
        coklu.get(e.m).push(e); continue;
      }
      n = await kenneyKopya(e.m); if (!n) continue;
      if (e.kat) {   // ust uste parcalar (kule katlari)
        let y = new THREE.Box3().setFromObject(n).max.y;
        for (const k of e.kat) { const p = await kenneyKopya(k); if (!p) continue; p.position.y = y - 0.002; n.add(p); y += new THREE.Box3().setFromObject(p).max.y; }
      }
      if (e.bayrak) bayraklastir(n, true); else if (e.sal) bayraklastir(n, false);
      const g = new THREE.Group(); g.add(n); n.scale.setScalar(e.s * S / 1.55); n.rotation.y = e.ry || 0;
      kok.add(g); ogeler.push({ nesne: g, d: e.d || 1, def: e });
    }
    for (const [m, list] of coklu) {
      const mats = list.map(() => new THREE.Matrix4());
      // her ornek ayri gizlenebilsin diye: ayni d degerine sahip olanlar bir InstancedMesh grubunda
      const byD = new Map(); list.forEach((e, i) => { const k = e.d || 1; if (!byD.has(k)) byD.set(k, []); byD.get(k).push(i); });
      for (const [d, idx] of byD) {
        const gr = new THREE.Group(); const yerel = await kenneyCoklu(m, idx.map((i) => mats[i])); if (!yerel) continue;
        gr.add(yerel); kok.add(gr); ogeler.push({ nesne: gr, d, def: list[idx[0]], coklu: idx.map((i) => list[i]), yerel });
      }
    }
    konumla(); seviyeUygula(); hazir = true; return kok;
  }
  // konum: x yanda, z platformun arka kenarinin arkasina; zemin y
  function konumla() {
    for (const o of ogeler) {
      if (o.coklu) {   // InstancedMesh: her ornegin donusumu yeniden yazilir
        o.coklu.forEach((e, i) => o.yerel.userData.ayarla(i, new THREE.Matrix4().compose(new THREE.Vector3(e.x * (o.kx || 1), zemin + (e.y || 0), -(arka + e.z)), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, e.ry || 0, 0)), new THREE.Vector3().setScalar(e.s * S / 1.55))));
        o.yerel.userData.bitti();
      } else o.nesne.position.set(o.def.x * (o.kx || 1), zemin + (o.def.y || 0), -(arka + o.def.z));
    }
  }
  function seviyeUygula() { for (const o of ogeler) o.nesne.visible = o.d <= seviye && !o.gizli; }

  return {
    kok, kur, get hazir() { return hazir; }, get seviye() { return seviye; },
    ayarla(o) { if (o.zemin != null) zemin = o.zemin; if (o.arka != null) arka = o.arka; if (o.S) S = o.S; konumla(); },
    yogunluk(v) { seviye = v; seviyeUygula(); },
    // cam: kamera; alan: yapinin ekran kutusu NDC {x0,x1,y0,y1}. Ustune binen dekor once disari kayar, olmazsa gizlenir.
    yerlestir(cam, alan, pay = 0.04) {
      const B = new THREE.Box3(), V = new THREE.Vector3();
      cam.updateMatrixWorld(true);
      for (const o of ogeler) {
        o.gizli = false; o.kx = 1;
        for (let k = 0; k < 8; k++) {
          konumlaTek(o); o.nesne.updateMatrixWorld(true); B.setFromObject(o.nesne);
          let x0 = 9, x1 = -9, y0 = 9, y1 = -9, arkada = true;
          for (let i = 0; i < 8; i++) { V.set(i & 1 ? B.max.x : B.min.x, i & 2 ? B.max.y : B.min.y, i & 4 ? B.max.z : B.min.z).project(cam); if (V.z > 1) continue; arkada = false; x0 = Math.min(x0, V.x); x1 = Math.max(x1, V.x); y0 = Math.min(y0, V.y); y1 = Math.max(y1, V.y); }
          if (arkada) break;
          const ust = x1 > alan.x0 - pay && x0 < alan.x1 + pay && y1 > alan.y0 - pay && y0 < alan.y1 + pay;
          if (!ust) break;
          if (k === 7) o.gizli = true; else o.kx *= 1.18;   // disari dogru kaydir
        }
      }
      konumla(); seviyeUygula();
    },
    kare(dt, t) {
      ZAMAN.value = t;
      for (const o of ogeler) if (o.def.sal && o.nesne.children[0]) { const n = o.nesne.children[0], ph = o.def.x * 0.13; n.rotation.z = Math.sin(t * 0.9 + ph) * 0.035; n.rotation.x = Math.sin(t * 0.7 + ph) * 0.02; n.position.y = Math.sin(t * 1.1 + ph) * 0.12; }
      // otomatik yogunluk: olcum suresince ortalama FPS esigin altindaysa bir kademe dus
      if (dt > 0 && dt < 0.5 && seviye > 1) { fps.t += dt; fps.n++; if (fps.t >= YOGUNLUK.olcSn) { const f = fps.n / fps.t; fps = { t: 0, n: 0 }; if (f < YOGUNLUK.fpsEsik) { seviye--; seviyeUygula(); } } }
    },
    temizle() { kok.parent && kok.parent.remove(kok); ogeler.length = 0; }
  };
  function konumlaTek(o) { if (!o.coklu) o.nesne.position.set(o.def.x * (o.kx || 1), zemin + (o.def.y || 0), -(arka + o.def.z)); else konumla(); }
}
