// Foxi Smash v7.0 (Adem 18 Kas 2026): HAZINE ADASI INSASI (ana menu, B yonu).
// Ana sayfanin boyali ada fonunun (fon/ana_ada.webp) ustune seffaf bir 3B katman konur. Altinla sirayla yapilar kurulur;
// yildizlar siradaki yapinin kilidini acar. Yapilar Adem'in kendi 3B modelleri (yapi/model/*.glb).
// Kamera fondaki resmin ufuk cizgisine oturtulur (duz bakan kamera + mercek kaydirma), yapilar resmin koordinatlariyla
// yerlestirilir: her telefonda (genis/dar ekran) fondaki ayni yere duser.
// Disari: ADA (yapi listesi), adaKur(o) -> { boyut, goster(bool), guncelle(), insa(i) -> Promise, ekran(i), resim(i) -> Promise<dataURL> }
// Kayit: SV.ada = { y: ['sal', ...] } (oyunun ana kaydinin icinde ayri alan; bolum/ilerleme verisine dokunmaz).
// Eski menu: adrese ?eskimenu=1 (merkez.js ada katmanini hic kurmaz).
import * as THREE from '../three.module.min.js';
import { GLTFLoader } from '../GLTFLoader.js?v=2';

// ix, iy: fondaki resmin (1116x2000) icinde yapinin taban noktasi (0-1). h: yapinin ekran yuksekligi (tuval yuksekliginin orani).
// su: denizde (sallanir). f: altin. y: gereken toplam yildiz. hazir: false ise 'Yakinda' (ikinci teslimde gelecek).
export const ADA = [
  { id: 'depo', ad: 'Erzak Deposu', ac: 'Fıçılar ve sandıklar: uzun yolculuk için erzak!', f: 150, y: 0, ix: 0.715, iy: 0.728, h: 0.08, ry: -0.45,
    parca: [{ m: 'sandik', x: 0.5, z: -0.6, s: 0.8 }, { m: 'varil', x: -0.42, z: 0.05, s: 1 }, { m: 'fici', x: 0.58, z: 0.45, s: 0.58 }] },
  { id: 'top', ad: 'Top Tabyası', ac: 'Koyu koruyan dev top. Düşman gemileri yaklaşamaz!', f: 300, y: 6, ix: 0.262, iy: 0.733, h: 0.07, ry: -2.5,
    parca: [{ m: 'top_arabasi', x: 0, z: 0, s: 1 }] },
  { id: 'sal', ad: 'Foxi\'nin Salı', ac: 'Varilli sal koyda demir atar. Ada canlanmaya başlıyor!', f: 500, y: 15, ix: 0.711, iy: 0.533, h: 0.055, su: 1, ry: -0.5, rz: [-26, 6],
    parca: [{ m: 'sal', x: 0, z: 0, s: 1 }] },
  { id: 'kule', ad: 'Gözcü Kulesi', ac: 'Uzaktaki hazineleri gören taş kule.', f: 800, y: 30, hazir: false },
  { id: 'gemi', ad: 'Korsan Gemisi', ac: 'Foxi\'nin kendi gemisi!', f: 1200, y: 50, hazir: false },
  { id: 'hazine', ad: 'Hazine Yığını', ac: 'Altın dolu sandıklar.', f: 1800, y: 80, hazir: false },
  { id: 'cadir', ad: 'Korsan Kampı', ac: 'Çizgili çadır ve kamp ateşi.', f: 2500, y: 120, hazir: false },
  { id: 'bayrak', ad: 'Altın Bayrak', ac: 'Ada tamamen senin!', f: 3500, y: 180, hazir: false },
];
const RW = 1116, RH = 2000, UFUK = 0.446, FOV = 34, CH = 3;   // resim boyu, ufuk (resmin %44.6'si), kamera acisi ve yuksekligi

const GLB = {};
const yukle = (m) => GLB[m] || (GLB[m] = new Promise((ok) => new GLTFLoader().load('model/' + m + '.glb?v=1', (g) => ok(g.scene), undefined, () => ok(null))));

function dokuDaire(ic, dis) {   // yumusak daire (golge, toz)
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, ic); g.addColorStop(1, dis); x.fillStyle = g; x.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function dokuYildiz() {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 30); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,240,160,.9)'); g.addColorStop(1, 'rgba(255,200,40,0)');
  x.fillStyle = g; x.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 9 : 31; x.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function dokuHalka() {   // insa yeri: kesikli altin halka
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  x.translate(128, 128); x.lineCap = 'round';
  x.strokeStyle = 'rgba(255,214,74,.95)'; x.lineWidth = 14; x.setLineDash([26, 20]); x.beginPath(); x.arc(0, 0, 104, 0, Math.PI * 2); x.stroke();
  x.setLineDash([]); const g = x.createRadialGradient(0, 0, 40, 0, 0, 118); g.addColorStop(0, 'rgba(255,240,150,0)'); g.addColorStop(0.75, 'rgba(255,220,90,.28)'); g.addColorStop(1, 'rgba(255,220,90,0)');
  x.fillStyle = g; x.beginPath(); x.arc(0, 0, 118, 0, Math.PI * 2); x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const yumus = (t) => 1 - Math.pow(1 - t, 3);

export function adaKur(o) {
  const { kap, SV } = o;
  const cv = document.createElement('canvas'); cv.className = 'ada-c'; kap.appendChild(cv);
  let ren;
  try { ren = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, powerPreference: 'low-power' }); } catch (e) { cv.remove(); return null; }
  ren.outputColorSpace = THREE.SRGBColorSpace; ren.toneMapping = THREE.ACESFilmicToneMapping; ren.toneMappingExposure = 1.2; ren.setClearColor(0, 0);
  const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(FOV, 1, 0.1, 600); cam.position.set(0, CH, 0); cam.lookAt(0, CH, -1);
  sc.add(new THREE.HemisphereLight('#e2f5ff', '#9a8a5a', 2.0));
  const gun = new THREE.DirectionalLight('#fff0d0', 2.3); gun.position.set(-6, 9, 5); sc.add(gun);   // gunes sol-on-ust (fondaki isik)
  const arka = new THREE.DirectionalLight('#9fd8ff', 0.6); arka.position.set(5, 4, -6); sc.add(arka);
  const T = { gol: dokuDaire('rgba(25,35,5,.75)', 'rgba(25,35,5,0)'), golSu: dokuDaire('rgba(10,50,80,.4)', 'rgba(10,50,80,0)'), toz: dokuDaire('rgba(255,248,225,.95)', 'rgba(255,240,200,0)'), yil: dokuYildiz(), halka: dokuHalka() };

  let W = 1, H = 1, pr = 1, gor = false, son = 0, zaman = 0;
  const Y = ADA.map(() => null);   // her yapi: { g: Group, P: taban noktasi, k: olcek, d: durum }
  const PS = [];   // parcaciklar
  const yapildi = () => (SV.ada && SV.ada.y) || [];
  const kurulu = (i) => yapildi().includes(ADA[i].id);
  const sira = () => ADA.findIndex((a, i) => !kurulu(i));

  // resim koordinati -> tuval pikseli (background: center 62% / cover)
  function resimPx(ix, iy) { const s = Math.max(W / RW, H / RH), w = RW * s, h = RH * s; return [(W - w) * 0.5 + ix * w, (H - h) * 0.62 + iy * h]; }
  function boyut() {
    const w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return; W = w; H = h; pr = Math.min(1.75, devicePixelRatio || 1);
    ren.setPixelRatio(pr); ren.setSize(W, H, false);
    cam.aspect = W / H; cam.updateProjectionMatrix();
    const uy = resimPx(0.5, UFUK)[1]; cam.projectionMatrix.elements[9] = -(1 - 2 * uy / H); cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
    Y.forEach((y, i) => { if (y) yerlestir(i); }); ciz();
  }
  const ray = new THREE.Raycaster(), zemin = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  function tabanBul(a) {
    const [x, y] = resimPx(a.ix, a.iy); ray.setFromCamera(new THREE.Vector2(x / W * 2 - 1, -(y / H * 2 - 1)), cam);
    const p = new THREE.Vector3(); return ray.ray.intersectPlane(zemin, p) ? p : new THREE.Vector3(0, 0, -50);
  }
  function yerlestir(i) {
    const a = ADA[i], y = Y[i], P = tabanBul(a), d = -P.z, hw = a.h * 2 * d * Math.tan(FOV * Math.PI / 360);
    y.k = hw / y.boy; y.P = P; y.g.position.copy(P); y.g.scale.setScalar(y.k * (y.sk || 1));
    if (a.su) y.g.position.y = -y.boy * y.k * 0.3;
  }

  // bir yapinin 3B grubunu Adem'in modellerinden kur (birim olcekte: en buyuk parca ~1 yuksek)
  async function yapiKur(i) {
    const a = ADA[i], g = new THREE.Group(), ic = new THREE.Group(); g.add(ic);
    const ms = await Promise.all(a.parca.map((p) => yukle(p.m)));
    let boy = 0;
    a.parca.forEach((p, n) => {
      const m = ms[n]; if (!m) return; const o2 = m.clone(true), b = new THREE.Box3().setFromObject(o2), sz = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
      const k = p.s / sz.y; o2.scale.setScalar(k); o2.position.set(p.x - c.x * k, -b.min.y * k, p.z - c.z * k);
      if (p.ry) o2.rotation.y = p.ry; ic.add(o2); boy = Math.max(boy, p.s);
    });
    ic.rotation.y = a.ry || 0;
    const bb = new THREE.Box3().setFromObject(ic), en = Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z);
    const gm = new THREE.Mesh(new THREE.PlaneGeometry(en * 1.5, en * 1.1), new THREE.MeshBasicMaterial({ map: a.su ? T.golSu : T.gol, transparent: true, depthWrite: false }));
    gm.rotation.x = -Math.PI / 2; gm.position.y = a.su ? boy * 0.28 : 0.01; gm.renderOrder = -1; g.add(gm);
    // hayalet (henuz kurulmamis yapi): parlak, yari saydam
    const hay = ic.clone(true), hm = new THREE.MeshBasicMaterial({ color: '#8fe4ff', transparent: true, opacity: 0.55, depthWrite: false });
    hay.traverse((n) => { if (n.isMesh) n.material = hm; });
    const hal = new THREE.Mesh(new THREE.PlaneGeometry(en * 1.6, en * 1.6), new THREE.MeshBasicMaterial({ map: T.halka, transparent: true, depthWrite: false }));
    hal.rotation.x = -Math.PI / 2; hal.position.y = a.su ? boy * 0.24 : 0.03;
    const yer = new THREE.Group(); yer.add(hay, hal); g.add(yer);
    g.visible = false; Y[i] = { g, ic, gm, yer, hay, hm, hal, boy, en, d: 'yok' }; yerlestir(i); sc.add(g);
    return Y[i];
  }

  // durumlari kayda gore guncelle: kurulanlar gorunur, siradaki hayalet, digerleri gizli
  async function guncelle() {
    const s = sira();
    for (let i = 0; i < ADA.length; i++) {
      const a = ADA[i]; if (a.hazir === false) continue;
      const k = kurulu(i), hay = i === s;
      if (!k && !hay) { if (Y[i]) Y[i].g.visible = false; continue; }
      const y = Y[i] || await yapiKur(i); if (y.d === 'insa') continue;
      y.g.visible = true; y.ic.visible = k; y.gm.visible = k; y.yer.visible = !k; y.d = k ? 'var' : 'hay';
    }
    ciz();
  }

  // ekranda (sayfa koordinati) yapinin rozet noktasi: hayaletin tepesi
  const _v = new THREE.Vector3();
  function ekran(i) {
    const y = Y[i]; if (!y) return null; const r = cv.getBoundingClientRect(), sx = r.width / W, sy = r.height / H;
    _v.set(0, y.boy * 1.05, 0); y.g.localToWorld(_v); _v.project(cam);
    const t = new THREE.Vector3(0, 0, 0); y.g.localToWorld(t); t.project(cam);
    const o2 = ADA[i].rz || [0, 0];
    return { x: r.left + (_v.x + 1) / 2 * W * sx + o2[0], y: r.top + (1 - _v.y) / 2 * H * sy + o2[1], ax: r.left + (t.x + 1) / 2 * W * sx, ay: r.top + (1 - t.y) / 2 * H * sy };
  }

  function parca(tip, p, n, ol) {
    for (let k = 0; k < n; k++) {
      const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tip === 'yil' ? T.yil : T.toz, transparent: true, depthWrite: false, blending: tip === 'yil' ? THREE.AdditiveBlending : THREE.NormalBlending }));
      const a = Math.random() * Math.PI * 2, v = (tip === 'yil' ? 1.4 + Math.random() * 1.6 : 0.8 + Math.random() * 0.9) * ol;
      m.position.set(p.x + Math.cos(a) * ol * 0.3, p.y + (tip === 'yil' ? ol * 0.5 : ol * 0.08), p.z + Math.sin(a) * ol * 0.3);
      const s0 = (tip === 'yil' ? 0.18 + Math.random() * 0.2 : 0.35 + Math.random() * 0.35) * ol; m.scale.setScalar(s0);
      sc.add(m); PS.push({ m, vx: Math.cos(a) * v, vy: tip === 'yil' ? (1.5 + Math.random() * 2) * ol : (0.15 + Math.random() * 0.35) * ol, vz: Math.sin(a) * v * 0.5, g: tip === 'yil' ? 3 * ol : 0, s0, t: 0, T: tip === 'yil' ? 0.9 + Math.random() * 0.5 : 0.8 + Math.random() * 0.4, tip });
    }
  }

  // insa: yapi gokten duser, yere carpar (esneme), toz + isilti. o.carpinca() sarsinti/ses icin.
  function insa(i, cb = {}) {
    return new Promise(async (ok) => {
      const y = Y[i] || await yapiKur(i); y.d = 'insa'; y.g.visible = true; y.ic.visible = true; y.gm.visible = false;
      const ol = y.boy * y.k, t0 = performance.now(), DUS = 520, ES = 650, yuk = ol * 4.5;
      y.hal.material.opacity = 1;
      const adim = (now) => {
        const t = now - t0;
        if (t < DUS) {
          const u = t / DUS; y.ic.position.y = (1 - u * u) * yuk / y.k; y.ic.scale.set(0.85, 1.18, 0.85); y.hm.opacity = 0.4 * (1 - u); y.hal.material.opacity = 1 - u;
        } else if (t < DUS + ES) {
          if (!y.carpti) { y.carpti = 1; y.yer.visible = false; y.gm.visible = true; y.ic.position.y = 0; const p = y.g.position.clone(); p.y = Math.max(0, p.y); parca('toz', p, 16, ol); parca('yil', p, 22, ol); if (cb.carpinca) cb.carpinca(); }
          const u = (t - DUS) / ES, e = Math.exp(-5 * u) * Math.cos(u * 14);
          y.ic.scale.set(1 + 0.22 * e, 1 - 0.3 * e, 1 + 0.22 * e);
        } else { y.ic.scale.set(1, 1, 1); y.ic.position.y = 0; y.d = 'var'; y.carpti = 0; ok(); return; }
        requestAnimationFrame(adim);
      };
      requestAnimationFrame(adim);
    });
  }

  // kart icin onizleme resmi (yapinin kendisi, seffaf fon)
  async function resim(i) {
    const a = ADA[i]; if (a.hazir === false) return null;
    const y = Y[i] || await yapiKur(i);
    const s2 = new THREE.Scene(); s2.add(new THREE.HemisphereLight('#e8f6ff', '#8a7a4a', 1.9)); const l = new THREE.DirectionalLight('#fff0d0', 2.4); l.position.set(-4, 6, 5); s2.add(l);
    const ic = y.ic.clone(true); ic.position.set(0, 0, 0); ic.scale.set(1, 1, 1); ic.visible = true; s2.add(ic);
    const bb = new THREE.Box3().setFromObject(ic), c = bb.getCenter(new THREE.Vector3()), r = bb.getSize(new THREE.Vector3()).length() * 0.5;
    const c2 = new THREE.PerspectiveCamera(30, 1, 0.01, 100); c2.position.set(c.x, c.y + r * 0.9, c.z + r * 3.2); c2.lookAt(c);
    const N = 256, rt = new THREE.WebGLRenderTarget(N, N, { samples: 4 }); rt.texture.colorSpace = THREE.SRGBColorSpace;
    ren.setRenderTarget(rt); ren.setClearColor(0, 0); ren.clear(); ren.render(s2, c2); const px = new Uint8Array(N * N * 4); ren.readRenderTargetPixels(rt, 0, 0, N, N, px); ren.setRenderTarget(null); rt.dispose();
    const k = document.createElement('canvas'); k.width = k.height = N; const x = k.getContext('2d'), im = x.createImageData(N, N);
    for (let r2 = 0; r2 < N; r2++) im.data.set(px.subarray((N - 1 - r2) * N * 4, (N - r2) * N * 4), r2 * N * 4);
    x.putImageData(im, 0, 0); ciz(); return k.toDataURL();
  }

  function ciz() { ren.render(sc, cam); }
  function kare(now) {
    if (!gor) return; requestAnimationFrame(kare);
    if (cv.clientWidth !== W || cv.clientHeight !== H) boyut();
    const dt = Math.min(0.05, son ? (now - son) / 1000 : 0.016); son = now; zaman += dt;
    Y.forEach((y, i) => {
      if (!y || !y.g.visible) return; const a = ADA[i];
      if (a.su && y.d !== 'insa') { y.ic.position.y = Math.sin(zaman * 1.6 + i) * 0.035; y.ic.rotation.z = Math.sin(zaman * 1.1 + i) * 0.035; y.ic.rotation.x = Math.sin(zaman * 1.3) * 0.025; }
      if (y.d === 'hay') { y.hm.opacity = 0.45 + 0.15 * Math.sin(zaman * 4); y.hal.rotation.z = zaman * 0.6; const s = 1 + 0.05 * Math.sin(zaman * 4); y.hal.scale.set(s, s, 1); }
    });
    for (let k = PS.length - 1; k >= 0; k--) {
      const p = PS[k]; p.t += dt; const u = p.t / p.T; if (u >= 1) { sc.remove(p.m); p.m.material.dispose(); PS.splice(k, 1); continue; }
      p.vy -= p.g * dt; p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt; p.vx *= 0.96; p.vz *= 0.96;
      p.m.material.opacity = p.tip === 'yil' ? 1 - u * u : (1 - u) * 0.9; p.m.scale.setScalar(p.s0 * (p.tip === 'yil' ? 1 - u * 0.5 : 1 + u * 1.6));
    }
    if (o.kare) o.kare();
    ciz();
  }
  function goster(v) { if (v === gor) return; gor = v; son = 0; if (v) { boyut(); requestAnimationFrame(kare); } }
  addEventListener('resize', () => setTimeout(boyut, 60));
  boyut();
  return { boyut, goster, guncelle, insa, ekran, resim, sira, kurulu, Y };
}
