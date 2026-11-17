// Yerel HDR ortam haritasi (internetten dosya yok): kod ile uretilen yari-float equirect gokyuzu.
// Icinde 1'den cok parlak gunes ve stüdyo panelleri var -> parlak plastikte guclu, keskin parlama.
// Ayrica oyunun isigi ve on kamerasi (vitrin ayni gorunumu kullansin diye; degerler oyun.js ile ayni).
import * as THREE from '../../three.module.min.js';

const ENVS = new WeakMap();
export function hdrOrtam(ren) {
  if (ENVS.has(ren)) return ENVS.get(ren);
  const W = 256, H = 128, d = new Uint16Array(W * H * 4), h = THREE.DataUtils.toHalfFloat;
  const lerp = (a, b, t) => a + (b - a) * t;
  const ust = [0.3, 0.32, 0.38], ufuk = [0.46, 0.43, 0.42], alt = [0.1, 0.08, 0.11];   // taban koyu: renkler doygun kalir, parlama noktalardan gelir
  // parlak noktalar: [u, v, yaricap, siddet, renk]
  // three equirect: u=0.75 kameraya dogru (+z), 0.5 sag (+x), 0.25 arka (-z). Gunes sol-ust-onde (oyundaki gunesle ayni yon);
  // tam onde yumusak panel: kameraya bakan yuzlerde parlama cizgisi
  const isik = [[0.86, 0.2, 0.045, 26, [1, 0.95, 0.85]], [0.75, 0.36, 0.06, 3.5, [1, 1, 1]], [0.64, 0.26, 0.06, 5, [0.95, 0.98, 1]], [0.25, 0.3, 0.08, 3, [1, 0.92, 0.85]]];
  for (let y = 0; y < H; y++) {
    const v = 1 - y / (H - 1);   // DataTexture satir 0 = alt (equirect'te asagi bakis); v: ustten olcu
    let c;
    if (v < 0.5) { const t = Math.pow(v / 0.5, 1.6); c = [lerp(ust[0], ufuk[0], t), lerp(ust[1], ufuk[1], t), lerp(ust[2], ufuk[2], t)]; }
    else { const t = Math.min(1, (v - 0.5) / 0.25); c = [lerp(ufuk[0] * 0.7, alt[0], t), lerp(ufuk[1] * 0.7, alt[1], t), lerp(ufuk[2] * 0.7, alt[2], t)]; }
    for (let x = 0; x < W; x++) {
      const u = x / W; let r = c[0], g = c[1], b = c[2];
      for (const [cu, cv, cr, s, col] of isik) {
        let du = Math.abs(u - cu); du = Math.min(du, 1 - du); const dv = (v - cv) * 0.5, q = Math.sqrt(du * du + dv * dv) / cr;
        if (q < 1.6) { const k = s * Math.exp(-q * q * 3); r += k * col[0]; g += k * col[1]; b += k * col[2]; }
      }
      const i = (y * W + x) * 4; d[i] = h(r); d[i + 1] = h(g); d[i + 2] = h(b); d[i + 3] = h(1);
    }
  }
  const t = new THREE.DataTexture(d, W, H, THREE.RGBAFormat, THREE.HalfFloatType);
  t.mapping = THREE.EquirectangularReflectionMapping; t.magFilter = t.minFilter = THREE.LinearFilter; t.needsUpdate = true;
  const pm = new THREE.PMREMGenerator(ren), e = pm.fromEquirectangular(t).texture; pm.dispose(); t.dispose();
  ENVS.set(ren, e); return e;
}

// oyunun renderer ayarlari (oyun.js satir ~80 ile ayni)
export function oyunRenderer(ren) {
  ren.outputColorSpace = THREE.SRGBColorSpace; ren.toneMapping = THREE.ACESFilmicToneMapping; ren.toneMappingExposure = 1.12;
  ren.shadowMap.enabled = true; ren.shadowMap.type = THREE.PCFSoftShadowMap;
}
// oyunun isiklari (oyun.js: yarikure + gunes golgeli + arka kenar isigi)
export function oyunIsigi(scene, golgeAlan = 14) {
  scene.add(new THREE.HemisphereLight(0xfffaf0, 0x6a5a7a, 1.15));
  const sun = new THREE.DirectionalLight(0xfff0d0, 3.2); sun.position.set(-8, 18, 10); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -golgeAlan, right: golgeAlan, top: golgeAlan + 2, bottom: -golgeAlan, near: 2, far: 80 });
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03; sun.shadow.radius = 4; scene.add(sun);
  const rim = new THREE.DirectionalLight(0xcfe0ff, 0.9); rim.position.set(9, 6, -8); scene.add(rim);
  return sun;
}
// oyunun on kamerasi: 9 derece yukaridan, tam karsidan; yatay gorus ~52 derece (oyun.js fit())
export function onKamera(cam, W, H, hedef, uzak) {
  cam.aspect = W / H; const HF = 52;
  cam.fov = Math.max(42, Math.min(92, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(HF * Math.PI / 360) / cam.aspect))));
  cam.updateProjectionMatrix();
  const p = 9 * Math.PI / 180; cam.position.set(hedef.x, hedef.y + Math.sin(p) * uzak, hedef.z + Math.cos(p) * uzak); cam.lookAt(hedef);
}
