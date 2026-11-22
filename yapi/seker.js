// Foxi Smash v11 denemesi (22 Kas 2026, Adem: 'sise, kup kalitesini referans oyun kalitesine yukselt'): BOYALI SET. Varsayilan; eski gorunum ?yeni=0.
// Modeller: uretici/blender/seker_set.py -> model/blok3/*.glb (doku yok; kose renginde ton + tahta damari isareti).
// Boyama (sekerMat): sahnenin gercekci isigi yerine elle ayarli, ucuz golgelendirme. On yuz turun tam rengi; ust acik, yan ve alt koyu ama DOYGUN
// (griye kaymaz); parlama yalniz sol ust pahlarda ve kavanozda genis dikey bantta. Ton eslemesine girmez: ekrandaki renk = secilen renk.
export const SEKER = new URLSearchParams(location.search).get('yeni') !== '0';   // v11 (Adem 22 Kas: 'varsayilan yap')
const R = { K: '#ea1f31', M: '#1c7cf6', S: '#ffc310', Y: '#22b935', P: '#9a35f2', T: '#ff8016', N: '#ff479f', A: '#22b4ff', B: '#f3ece2' };
const ALTIN = '#ffc41c', TAHTA = '#fb9a2e', TASR = '#6470b4';
// tur -> [dosya, purz (kullanilmaz), kirik parca rengi, { govde, vurgu, sk: boyama turu 'kutu' | 'cam' | 'buz' | 'tas' | 'tahta', dik }]
export const SEKERL = {};
{
  const ek = (k, d, govde, sk, o) => { SEKERL[k] = ['blok3/' + d, 0.3, govde, Object.assign({ govde, sk }, o || {})]; };
  for (const c of 'KMSYPTNB') ek('oy' + c, 'kup1', R[c], 'kutu');
  for (const c of 'KMSYPTNA') {
    for (const n of [1, 2, 3, 4]) ek('uz' + n + c, 'kup' + n, R[c], 'kutu');
    ek('kj' + c, 'kav1', R[c], 'cam'); ek('kvU' + c, 'kav2', R[c], 'cam'); ek('kvL' + c, 'kav3', R[c], 'cam'); ek('kvB' + c, 'kavB', R[c], 'cam');
    ek('kr3' + c, 'kupa3', R[c], 'kutu', { vurgu: '#fff0d2' }   /* kalin altin cerceve begenilmedi (v10.35) */);
  }
  ek('ksSiseM', 'kav1', R.P, 'cam'); ek('ksSiseY', 'kav1', R.Y, 'cam'); ek('ksSiseB', 'kav1', R.M, 'cam');
  for (const n of [1, 2, 3, 4]) ek('ksTas' + (n > 1 ? n : ''), 'tas' + n, TASR, 'tas');
  ek('ksBuz', 'buz1', '#1c98ff', 'buz'); ek('ksBuz3', 'buz3', '#1c98ff', 'buz');
  ek('ksSandik', 'sandik', TAHTA, 'tahta'); ek('ksSandikK', 'sandik', '#ee2f26', 'tahta'); ek('ksSandikM', 'sandik', '#9436f0', 'tahta');
  for (const n of [1, 2, 3]) ek('ksKalas' + n, 'kalas' + n, TAHTA, 'tahta');
  ek('ksDirek', 'direk', TAHTA, 'tahta', { dik: 1 });
  ek('ksFici', 'fici', '#f5962f', 'tahta', { dik: 1, yuv: 1 }); ek('ksFiciK', 'fici', '#ee3628', 'tahta', { dik: 1, yuv: 1 });
  ek('dalga', 'silindir', '#2f8cff', 'cam');
  ek('ksSutun', 'sutun', '#aeb8da', 'cam'); ek('ksMorSutun', 'sutun', R.P, 'cam');
  ek('ksTNT', 'tnt', R.K, 'kutu'); ek('ksYildiz', 'yildiz', '#ffb90f', 'kutu'); ek('ksKemer', 'kemer', TASR, 'tas');
}
// ton (0..1, 0.5 = tam renk) -> sRGB renk. Koyulasan renk doygunlasir (kirlenmez), acilan renk cok az beyaza gider.
function tonla(c, l) {
  const t = (l - 0.5) * 2; if (t >= 0) return c.map((x) => Math.min(1, x + (1 - x) * t * 0.42 + x * t * 0.30));
  const k = -t, y = 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]; const w = Math.max(0, Math.min(1, (Math.min(c[0], c[1]) - c[2]) * 1.3));   // sari / turuncu koyulasinca zeytin yesili degil, turuncu olur
  return c.map((x, i) => Math.max(0, (y + (x - y) * (1 + 0.35 * k)) * (1 - 0.72 * k) * (i === 1 ? 1 - 0.42 * k * w : 1)));
}
export function sekerBoya(THREE, geo, o) {
  const g = geo.clone(), a = g.attributes.color, n = a.count, d = new Float32Array(n * 4), T = new THREE.Color();
  const al = (h) => { T.set(h); const s = T.clone().convertLinearToSRGB(); return [s.r, s.g, s.b]; }, gv = al(o.govde), vr = al(o.vurgu || ALTIN);
  for (let i = 0; i < n; i++) {
    const r = a.getX(i), y = a.getY(i), b = a.getZ(i), w = a.getW(i); let c, dm = 0;
    if (w < 0.25) { c = tonla(y > 0.5 ? vr : gv, r); dm = b > 0.5 ? 1 : 0; } else { c = [r, y, b]; dm = w < 0.75 ? 1 : 0; }
    T.setRGB(c[0], c[1], c[2], THREE.SRGBColorSpace); d[i * 4] = T.r; d[i * 4 + 1] = T.g; d[i * 4 + 2] = T.b; d[i * 4 + 3] = dm ? 0.5 : w < 0.25 && r < 0.44 ? 0.2 : 1;
  }
  g.setAttribute('color', new THREE.BufferAttribute(d, 4)); return g;
}
const ORTAK = `
  vec3 skN = inverseTransformDirection(normalize(normal), viewMatrix), skV = inverseTransformDirection(normalize(vViewPosition), viewMatrix);
  vec3 sc = pow(diffuseColor.rgb, vec3(0.4545));
  float skDm = vColor.a < 0.75 && vColor.a > 0.35 ? 1.0 : 0.0, skIs = vColor.a < 0.3 ? 0.0 : 1.0;   // oluk: parlama yok
`;
const PARCA = {
  // tahta damari: boyuna ince koyu cizgiler
  tahta: `{ vec3 q = skP / 1.55; float bo = SKDIK > 0 ? q.y : q.x, en = SKDIK > 0 ? (SKYUV > 0 ? atan(q.x, q.z) * 0.5 : q.x + q.z) : q.y + q.z * 0.9;
    float e = en * 3.4 + 0.22 * sin(bo * 3.1 + en * 5.0) + 0.10 * sin(bo * 7.3 + 1.7), f = abs(fract(e) - 0.5) * 2.0;
    float d = smoothstep(0.80, 0.97, f) * (0.55 + 0.45 * sin(bo * 4.0 + floor(e) * 2.4));
    sc = pow(sc, vec3(1.0 + skDm * (0.42 * max(d, 0.0) + 0.06 * sin(e * 6.283)))) * (1.0 - skDm * 0.08 * max(d, 0.0)); }`,
  // buz: kenara dogru acik camgobegi, icte bulutsu beyaz damarlar
  buz: `{ vec3 q = skP / 1.55; float n1 = sin(q.x * 3.1 + 1.7 * sin(q.y * 2.3 + q.z * 2.0)) * sin(q.y * 2.7 + 1.3 * sin(q.x * 2.1)), n2 = abs(sin(q.x * 4.1 + q.y * 5.3 + 1.5 * sin(q.y * 4.7 - q.x * 2.2)));
    vec3 h = abs(skBox - abs(skP)); float k1 = min(min(max(h.x, h.y), max(h.y, h.z)), max(h.x, h.z)); float kn = 1.0 - smoothstep(0.02, 0.42, k1);
    sc = mix(sc, sc * vec3(0.55, 0.80, 1.0), 0.75 * (1.0 - kn)); sc = mix(sc, vec3(0.55, 0.88, 1.0), kn * 0.62);
    sc += vec3(0.16, 0.13, 0.06) * smoothstep(0.25, 0.95, n1) + vec3(0.14) * smoothstep(0.955, 1.0, n2) * smoothstep(-0.2, 0.5, n1); }`,
  kutu: '', tas: '', cam: '', top: ''
};
const GOLGE = `
  float skS = 1.0 + 0.12 * max(skN.y, 0.0) - 0.40 * max(-skN.y, 0.0) - SKX * max(skN.x, 0.0) - 0.12 * max(-skN.x, 0.0) - 0.2 * max(-skN.z, 0.0);
  #if defined( USE_SHADOWMAP )
  { float sm = getShadowMask(); skS *= mix(1.0, mix(0.80, 1.0, sm), smoothstep(0.0, 0.3, dot(skN, normalize(vec3(-8.0, 18.0, 10.0))))); }
  #endif
  { float k = max(1.0 - skS, 0.0), y = dot(sc, vec3(0.3, 0.59, 0.11)); sc = max(mix(vec3(y), sc, 1.0 + 0.45 * k), 0.0) * (1.0 - 0.95 * k); sc.g *= 1.0 - 0.55 * k * clamp((min(sc.r, sc.g) - sc.b) * 1.3, 0.0, 1.0); sc = mix(sc, min(sc * 1.15 + 0.10, 1.0), max(skS - 1.0, 0.0) * 4.0); }
  vec3 skR = reflect(-skV, skN);
`;
const PARLA = {
  kutu: `{ float a = max(dot(skR, normalize(vec3(-0.45, 0.80, 0.42))), 0.0); sc = mix(sc, mix(min(sc * 1.35 + 0.12, 1.0), vec3(1.0), 0.45), smoothstep(0.80, 0.97, a) * 0.62 * skIs);
    float f = max(dot(skR, normalize(vec3(0.85, 0.25, -0.2))), 0.0); sc = mix(sc, min(sc * 1.25 + 0.10, 1.0), smoothstep(0.80, 0.98, f) * 0.45 * skIs); }`,
  tas: `{ float a = max(dot(skR, normalize(vec3(-0.45, 0.80, 0.42))), 0.0); sc = mix(sc, min(sc * 1.25 + 0.16, 1.0), smoothstep(0.72, 0.98, a) * 0.42 * skIs); }`,
  tahta: `{ float a = max(dot(skR, normalize(vec3(-0.45, 0.80, 0.42))), 0.0); sc = mix(sc, min(sc * 1.2 + 0.14, 1.0), smoothstep(0.75, 0.98, a) * 0.5 * skIs); }`,
  buz: `{ float a = max(dot(skR, normalize(vec3(-0.45, 0.80, 0.42))), 0.0); sc = mix(sc, vec3(0.93, 0.99, 1.0), smoothstep(0.84, 0.97, a) * 0.8); }`,
  // top: sol ustte iri yumusak parlama + kucuk beyaz nokta, alt kenarda ince isik
  top: `{ float a = max(dot(skR, normalize(vec3(-0.45, 0.72, 0.55))), 0.0); sc = mix(sc, min(sc * 1.25 + 0.16, 1.0), smoothstep(0.35, 0.95, a) * 0.55); sc = mix(sc, vec3(1.0), smoothstep(0.90, 0.955, a) * 0.85);
    float r = 1.0 - max(dot(skN, skV), 0.0); sc = mix(sc, min(sc * 1.4 + 0.12, 1.0), smoothstep(0.62, 0.80, r) * (1.0 - smoothstep(0.86, 1.0, r)) * 0.5); }`,
  // cam / parlak silindir: parcanin eksenine dik yonde genis yumusak bant + icinde parlak serit, karsi kenarda ince isik
  cam: `{ vec3 ax = normalize(skAx), yan = cross(ax, vec3(0.0, 0.0, 1.0)); float yl = length(yan), nn = dot(normalize(normal), ax);
    if (yl > 0.15) { yan /= yl; if (dot(yan, vec3(0.75, -0.6, 0.0)) < 0.0) yan = -yan; float t = dot(normalize(normal), yan), gv = 1.0 - smoothstep(0.45, 0.85, abs(nn));
      float b1 = smoothstep(-0.80, -0.52, t) * (1.0 - smoothstep(-0.20, 0.10, t)), b2 = smoothstep(-0.56, -0.48, t) * (1.0 - smoothstep(-0.36, -0.28, t));
      float kn = smoothstep(0.70, 0.80, t) * (1.0 - smoothstep(0.88, 0.96, t));
      sc = mix(sc, min(sc * 1.18 + 0.07, 1.0), b1 * gv * 0.62); sc = mix(sc, mix(min(sc * 1.3 + 0.16, 1.0), vec3(1.0), 0.35), b2 * gv * 0.55); sc = mix(sc, min(sc * 1.35 + 0.14, 1.0), kn * gv * 0.50); }
    float a = max(dot(skR, normalize(vec3(-0.35, 0.86, 0.36))), 0.0); sc = mix(sc, vec3(1.0), smoothstep(0.86, 0.98, a) * 0.38 * smoothstep(0.30, 0.6, abs(nn))); }`
};
export function sekerMat(THREE, geo, o) {
  const tur = o.sk; geo.computeBoundingBox(); const b = geo.boundingBox.getSize(new THREE.Vector3()).multiplyScalar(0.5);
  const m = new THREE.MeshLambertMaterial({ vertexColors: true }); m.toneMapped = false;
  const yama = (x) => {
    x.userData.yeni = 1; x.userData.rim = 1; x.defines = Object.assign({}, x.defines, { SKDIK: o.dik ? 1 : 0, SKYUV: o.yuv ? 1 : 0 });
    x.onBeforeCompile = (sh) => {
      sh.uniforms.skBox = { value: b };
      sh.vertexShader = sh.vertexShader.replace('void main() {', 'varying vec3 skP; varying vec3 skAx;\nvoid main() {').replace('#include <begin_vertex>', `#include <begin_vertex>
        skP = position; { vec3 e = vec3(0.0, 1.0, 0.0);
        #ifdef USE_INSTANCING
          e = mat3(instanceMatrix) * e;
        #endif
        skAx = normalMatrix * e; }`);
      let f = sh.fragmentShader.replace('void main() {', '#include <shadowmask_pars_fragment>\nvarying vec3 skP; varying vec3 skAx; uniform vec3 skBox;\nvoid main() {');
      for (const p of ['lights_lambert_fragment', 'lights_fragment_begin', 'lights_fragment_maps', 'lights_fragment_end', 'aomap_fragment']) f = f.replace('#include <' + p + '>', '');
      f = f.replace('vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;',
        ORTAK + PARCA[tur] + GOLGE.replace('SKX', tur === 'cam' || tur === 'top' ? '0.30' : '0.26') + PARLA[tur] + '\nvec3 outgoingLight = pow(clamp(sc, 0.0, 1.0), vec3(2.2)) + totalEmissiveRadiance;');
      sh.fragmentShader = f;
    };
    x.customProgramCacheKey = () => 'seker' + tur + (o.dik ? 1 : 0) + (o.yuv ? 1 : 0);
    x.clone = function () { const c = THREE.MeshLambertMaterial.prototype.clone.call(x); yama(c); return c; };   // kirik parca kopyasi da ayni boyansin
    return x;
  };
  return yama(m);
}
