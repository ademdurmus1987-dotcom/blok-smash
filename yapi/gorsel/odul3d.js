// Odul gorselleri (yalniz gorunum; odul mantigi/miktarlari degismez):
//  - ucur(): Kenney coin-gold modeli donerek bir noktadan coin sayacina ucar
//  - sandik(): kazanma kartinda hazine sandigi acilir, icinden coin ve mucevher fiskirir
// Ekranin ustunde tek, saydam, dokunmayi engellemeyen bir WebGL tuvali; is yokken gizli ve cizim durur.
import * as THREE from '../../three.module.min.js';
import { kenneyYukle } from './kenney.js';
import { hdrOrtam } from './ortam.js';
import { ODUL } from './ayar.js';
export { kenneyYukle };

let R = null;
function kur() {
  if (R) return R;
  const cv = document.createElement('canvas'); cv.id = 'odul3d';
  Object.assign(cv.style, { position: 'fixed', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 95, display: 'none' });
  document.body.appendChild(cv);
  let ren;
  try { ren = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, preserveDrawingBuffer: /[?&]test/.test(location.search) }); }
  catch (e) { cv.remove(); return (R = { yok: true }); }
  ren.setClearColor(0, 0); ren.setPixelRatio(Math.min(2, devicePixelRatio || 1)); ren.outputColorSpace = THREE.SRGBColorSpace; ren.toneMapping = THREE.ACESFilmicToneMapping; ren.toneMappingExposure = 1.0;
  const sc = new THREE.Scene(), cam = new THREE.OrthographicCamera(0, 1, 0, -1, -2000, 2000);
  sc.add(new THREE.HemisphereLight(0xfffaf0, 0x6a5a7a, 0.8)); const d = new THREE.DirectionalLight(0xfff0d0, 2.2); d.position.set(-0.6, 1, 1.2); sc.add(d);
  sc.environment = hdrOrtam(ren);
  const boy = () => { const W = innerWidth, H = innerHeight; ren.setSize(W, H, false); cam.right = W; cam.bottom = -H; cam.updateProjectionMatrix(); };
  boy(); addEventListener('resize', boy);
  R = { cv, ren, sc, cam, isler: new Set(), son: 0, raf: 0 }; if (/[?&](test|ust=0)/.test(location.search)) window.__odul = R;
  return R;
}
function dongu(t) {
  const dt = Math.min(0.05, (t - (R.son || t)) / 1000); R.son = t;
  for (const f of [...R.isler]) { let r; try { r = f(dt); } catch (e) { console.warn('[odul3d]', e); r = false; } if (r === false) R.isler.delete(f); }   // bir is hata verirse yalniz o durur
  R.ren.render(R.sc, R.cam);
  if (R.isler.size) R.raf = requestAnimationFrame(dongu); else { R.raf = 0; R.son = 0; R.cv.style.display = 'none'; }
}
function isEkle(f) { R.isler.add(f); R.cv.style.display = 'block'; if (!R.raf) R.raf = requestAnimationFrame(dongu); }
// ekran pikseli -> sahne (y asagi)
const yer = (o, x, y, z = 0) => o.position.set(x, -y, z);

// overlay ayri bir WebGL baglami: oyunun ortam haritasi (baska baglamin dokusu) burada kullanilamaz.
// Kenney malzemelerinin kopyasi alinir, ortam isigi bu sahnenin kendi HDR haritasindan gelir.
const KOPYA = new Map();
function ayir(o) {
  o.traverse((m) => { if (!m.isMesh) return; const k = m.material; if (!KOPYA.has(k)) { const c = k.clone(); c.envMap = null; KOPYA.set(k, c); } m.material = KOPYA.get(k); });
  return o;
}
let COIN = null;
async function coinSablon() {
  if (COIN) return COIN;
  const g = await kenneyYukle('platformer-kit/coin-gold');
  if (g) { const s = ayir(g.sahne.clone(true)), b = new THREE.Box3().setFromObject(s), c = b.getCenter(new THREE.Vector3()); s.position.sub(c); const p = new THREE.Group(); p.add(s); p.userData.boy = b.getSize(new THREE.Vector3()).x; COIN = p; }
  else {   // yedek: model yuklenemezse basit altin disk (oyun kirilmasin)
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 32).rotateX(Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: '#ffc93a', metalness: 1, roughness: 0.2, clearcoat: 1 }));
    const p = new THREE.Group(); p.add(m); p.userData.boy = 0.4; COIN = p;
  }
  return COIN;
}

// coin ucusu: (x,y) -> (tx,ty) ekran pikseli. Her coin varinca vardi(i) cagrilir. Doner: Promise (hepsi vardiginda)
export async function ucur({ x, y, tx, ty, n = 8, vardi, gecikme = 55 }) {
  kur(); if (R.yok) throw new Error('webgl yok');
  const sab = await coinSablon(), k0 = ODUL.coinBoyPx / sab.userData.boy, T = ODUL.ucusMs / 1000;
  return new Promise((bitti) => {
    let kalan = n;
    for (let i = 0; i < n; i++) {
      const c = sab.clone(true); c.scale.setScalar(0.001); R.sc.add(c);
      const sx = (Math.random() - 0.5) * 150, sy = (Math.random() - 0.5) * 110 - 20, don = 9 + Math.random() * 5, ek = Math.random() * 6;
      let t = -i * gecikme / 1000;
      isEkle((dt) => {
        t += dt; if (t < 0) return true;
        const u = Math.min(1, t / T);
        let px, py, s;
        if (u < 0.3) { const e = 1 - Math.pow(1 - u / 0.3, 3); px = x + sx * e; py = y + sy * e; s = 0.3 + 0.85 * e; }
        else { const e = (u - 0.3) / 0.7, q = e * e * (3 - 2 * e), kav = Math.sin(e * Math.PI) * -60; px = x + sx + (tx - x - sx) * q; py = y + sy + (ty - y - sy) * q + kav; s = 1.15 - 0.4 * q; }
        yer(c, px, py, 100 + i); c.scale.setScalar(k0 * s); c.rotation.y = t * don + ek; c.rotation.x = Math.sin(t * 5 + ek) * 0.35;
        if (u >= 1) { R.sc.remove(c); if (vardi) vardi(i); if (--kalan === 0) bitti(); return false; }
        return true;
      });
    }
  });
}

// kazanma karti: el (DOM ogesi) uzerinde sandik acilir, coin + mucevher fiskirir. Doner: durdur()
export function sandik(el, { gecikme = 0, ses } = {}) {
  kur(); if (R.yok) return () => {};
  let dur = false, grup = null;
  const parca = [];
  (async () => {
    const [cg, jw, ch] = await Promise.all([coinSablon(), kenneyYukle('platformer-kit/jewel'), kenneyYukle('pirate-kit/chest')]);
    if (dur || !ch) return;
    grup = new THREE.Group(); const s = ayir(ch.sahne.clone(true)); s.position.set(0, -0.36, 0); grup.add(s);
    const kb = ODUL.sandikPx / 1.3; grup.rotation.set(0.32, -0.42, 0); R.sc.add(grup);
    const lid = s.getObjectByName('lid');
    let t = -gecikme / 1000, acildi = false, fis = 0, ka = 0;   // ka: kapak acilma ilerlemesi (menteseden ~110 derece)
    const renkler = ['#ff3b6b', '#2fd35a', '#2f9bff', '#c06bff'];
    isEkle((dt) => {
      if (dur) { R.sc.remove(grup); for (const p of parca) R.sc.remove(p.o); return false; }
      t += dt; if (t < 0) { grup.visible = false; return true; } grup.visible = true;
      const r = el.getBoundingClientRect(); if (!r.width) return true;
      const cx = r.left + r.width / 2, cy = r.top + r.height * 0.8;
      // giris: yukaridan duser, ezilip zipler
      const gi = Math.min(1, t / 0.45), zip = gi < 1 ? 1 - Math.pow(1 - gi, 3) : 1, sq = t > 0.45 && t < 0.75 ? Math.sin((t - 0.45) / 0.3 * Math.PI) * 0.12 : 0;
      yer(grup, cx, cy - (1 - zip) * 260, 0); grup.scale.set(kb * (1 + sq), kb * (1 - sq), kb * (1 + sq));
      if (t > 0.75 && t < 1.15) grup.rotation.z = Math.sin((t - 0.75) * 40) * 0.06 * (1.15 - t) / 0.4; else grup.rotation.z = 0;   // titreme
      if (!acildi && t > 1.15) { acildi = true; if (ses) ses(); }
      if (acildi && lid && ka < 1) { ka = Math.min(1, ka + dt / 0.38); const c = 1.70158, e = 1 + (c + 1) * Math.pow(ka - 1, 3) + c * Math.pow(ka - 1, 2); lid.rotation.x = -1.95 * e; }   // geri tepen acilis
      if (acildi && fis < ODUL.fiskirma + 6 && t > 1.3) {   // fiskirma: kucuk partilar halinde
        for (let k = 0; k < 2 && fis < ODUL.fiskirma + 6; k++, fis++) {
          const coin = fis < ODUL.fiskirma, o = coin ? cg.clone(true) : (jw ? ayir(jw.sahne.clone(true)) : cg.clone(true));
          if (!coin && jw) o.traverse((m) => { if (m.isMesh) { m.material = m.material.clone(); m.material.color = new THREE.Color(renkler[fis % 4]); } });
          const sk = coin ? ODUL.coinBoyPx / cg.userData.boy * 0.85 : ODUL.coinBoyPx / 0.33 * 0.9;
          o.scale.setScalar(sk); R.sc.add(o);
          parca.push({ o, x: cx, y: cy - 20, vx: (Math.random() - 0.5) * 420, vy: -520 - Math.random() * 380, w: 6 + Math.random() * 8, t: 0 });
        }
      }
      for (let i = parca.length - 1; i >= 0; i--) {
        const p = parca[i]; p.t += dt; p.vy += 1500 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        yer(p.o, p.x, p.y, 200 + i); p.o.rotation.y += p.w * dt; p.o.rotation.x += p.w * 0.4 * dt;
        if (p.y > innerHeight + 80 || p.t > 2.4) { R.sc.remove(p.o); parca.splice(i, 1); }
      }
      // sandik hafifce soluk alir
      grup.rotation.y = -0.42 + Math.sin(t * 1.2) * 0.08;
      return true;
    });
  })();
  return () => { dur = true; };
}
