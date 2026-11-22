// Foxi Smash v11.1 (22 Kas 2026, Adem: 'once engel ve top'): engeller ve top boyali tarzda (seker.js). Varsayilan; eski gorunum ?eng3=0.
// Modeller: uretici/blender/engel_set.py -> model/engel3/*.glb. Yalniz GORUNUM: fizik kutulari, hareket ve sesler oyun.js'te ayni.
import { sekerBoya, sekerMat } from './seker.js?v=6';
export const ENG3 = new URLSearchParams(location.search).get('eng3') !== '0' && !window.KORSAN;   // Adem 22 Kas: 'varsayilan yap'
const T = { duvar: { govde: '#fb9a2e', sk: 'tahta' }, kol: { govde: '#fb9a2e', sk: 'tahta' }, uc: { govde: '#ee2234', sk: 'kutu' }, gobek: { govde: '#ee2234', sk: 'kutu' }, kalkan: { govde: '#ee2234', sk: 'kutu' },
  capa: { govde: '#4460c8', sk: 'kutu' }, halka: { govde: '#7186da', sk: 'kutu' }, top: { govde: '#8a34f0', sk: 'top' } };
export function engel3Kur({ THREE, GLTFLoader, roundBox }) {
  const G = {}, MAT = {};
  const hazir = !ENG3 ? Promise.resolve() : Promise.all(Object.keys(T).map((k) => new Promise((ok) => new GLTFLoader().load('model/engel3/' + k + '.glb?v=1', (gl) => {
    let m = null; gl.scene.traverse((o) => { if (o.isMesh && !m) m = o; });
    if (m) { const geo = sekerBoya(THREE, m.geometry, T[k]); G[k] = { geometry: geo, material: sekerMat(THREE, geo, T[k]) }; }
    ok();
  }, undefined, () => { console.warn('engel3: model yuklenemedi', k); ok(); }))));
  // kodla kurulan engeller (anahtarli kapi, giyotin, anahtar): parcanin rengi ve boyama turu verilir; keskin kutular pahlanir
  function duz(o, hex, sk, dm, emis) {
    let g = o.geometry; const p = g.parameters;
    if (g.type === 'BoxGeometry' && p) { const r = Math.min(0.09, Math.min(p.width, p.height, p.depth) * 0.3); g = roundBox(p.width, p.height, p.depth, r, 5); } else g = g.clone();
    const n = g.attributes.position.count, d = new Float32Array(n * 4), c = new THREE.Color(hex); for (let i = 0; i < n; i++) { d[i * 4] = c.r; d[i * 4 + 1] = c.g; d[i * 4 + 2] = c.b; d[i * 4 + 3] = dm ? 0.5 : 1; }
    g.setAttribute('color', new THREE.BufferAttribute(d, 4)); o.geometry = g;
    if (emis) { o.material = emis; return; }
    const k = sk + (dm || ''); o.material = MAT[k] || (MAT[k] = sekerMat(THREE, g, { sk, dik: dm === 2 ? 1 : 0 }));
  }
  // grup: oyun.js'in kurdugu engel; harita: Map(eski malzeme -> [renk, boyama, damar (1 yatay, 2 dikey)])
  function boya(grup, harita) { if (!ENG3) return; grup.traverse((o) => { if (!o.isMesh || Array.isArray(o.material)) return; const h = harita.get(o.material); if (h) duz(o, h[0], h[1], h[2], h[3]); }); }
  return { hazir, G, boya, emisMat: () => { const m = sekerMat(THREE, new THREE.BoxGeometry(1, 1, 1), { sk: 'kutu' }); m.emissive.set('#ff1a1a'); m.emissiveIntensity = 0; return m; } };
}
