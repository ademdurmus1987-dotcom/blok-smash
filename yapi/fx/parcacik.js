// Foxi Smash v4.0 - Faz 1A: parcacik havuzu (tech-art)
// Eskiden her toz/kivilcim/damla icin yeni bir THREE.Sprite + SpriteMaterial olusturulup omru bitince atiliyordu:
// buyuk yikimda yuzlerce cizim cagrisi ve surekli malzeme cop toplama (telefonda takilma ve isinma).
// Simdi: iki katman (normal + parlak/additive), her katman TEK bir InstancedBufferGeometry ile tek cizim cagrisi.
// Uyumluluk: al() bir "vekil" dondurur; eski Sprite ile ayni alanlar (position, scale, material.opacity, material.color,
// material.rotation, visible, userData). Mevcut efekt kodu hic degismeden calisir. Havuz dolarsa gercek Sprite'a duser.
import * as THREE from '../../three.module.min.js';

const VS = `attribute vec3 iOff; attribute vec2 iSc; attribute vec4 iCol; attribute float iRot;
varying vec2 vUv; varying vec4 vCol;
void main() {
  vUv = uv; vCol = iCol;
  vec4 mv = modelViewMatrix * vec4(iOff, 1.0);
  vec2 p = position.xy * iSc; float c = cos(iRot), s = sin(iRot);
  mv.xy += vec2(c * p.x - s * p.y, s * p.x + c * p.y);
  gl_Position = projectionMatrix * mv;
}`;
const FS = `uniform sampler2D map; varying vec2 vUv; varying vec4 vCol;
void main() {
  vec4 t = texture2D(map, vUv);
  gl_FragColor = vec4(t.rgb * vCol.rgb, t.a * vCol.a);
  if (gl_FragColor.a < 0.004) discard;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

class Vekil {
  constructor(k) {
    this.isPar = true; this.k = k; this.aktif = false; this.visible = true;
    this.position = new THREE.Vector3(); this.scale = new THREE.Vector3(1, 1, 1); this.userData = {};
    this.material = { opacity: 1, color: new THREE.Color(), rotation: 0, dispose() {} };
  }
}

function katman(scene, map, add, max) {
  const base = new THREE.PlaneGeometry(1, 1), g = new THREE.InstancedBufferGeometry();
  g.index = base.index; g.setAttribute('position', base.attributes.position); g.setAttribute('uv', base.attributes.uv);
  const off = new THREE.InstancedBufferAttribute(new Float32Array(max * 3), 3), sc = new THREE.InstancedBufferAttribute(new Float32Array(max * 2), 2),
    col = new THREE.InstancedBufferAttribute(new Float32Array(max * 4), 4), rot = new THREE.InstancedBufferAttribute(new Float32Array(max), 1);
  for (const a of [off, sc, col, rot]) a.setUsage(THREE.DynamicDrawUsage);
  g.setAttribute('iOff', off); g.setAttribute('iSc', sc); g.setAttribute('iCol', col); g.setAttribute('iRot', rot); g.instanceCount = 0;
  const mat = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: FS, uniforms: { map: { value: map } }, transparent: true, depthWrite: false,
    blending: add ? THREE.AdditiveBlending : THREE.NormalBlending });
  const mesh = new THREE.Mesh(g, mat); mesh.frustumCulled = false; mesh.renderOrder = 5; mesh.visible = false; mesh.matrixAutoUpdate = false; scene.add(mesh);
  const bos = [], akt = [];
  for (let i = 0; i < max; i++) bos.push(new Vekil(add ? 1 : 0));
  return { mesh, bos, akt, off, sc, col, rot, max };
}

export function parcacikKur(scene, map, o = {}) {
  const K = [katman(scene, map, false, o.normal || 700), katman(scene, map, true, o.parlak || 200)];
  return {
    // bos vekil yoksa null: cagiran eski Sprite yoluna duser
    al(renk, add, op) {
      const L = K[add ? 1 : 0], p = L.bos.pop(); if (!p) return null;
      p.aktif = true; p.visible = true; p.position.set(0, 0, 0); p.scale.set(1, 1, 1); p.userData = {};
      p.material.opacity = op == null ? 1 : op; p.material.rotation = 0; p.material.color.set(renk);
      L.akt.push(p); return p;
    },
    birak(p) { if (p && p.isPar && p.aktif) { p.aktif = false; K[p.k].bos.push(p); } },
    // her cizimden once: etkin vekillerin bilgisini GPU dizilerine yaz
    kare() {
      for (const L of K) {
        let n = 0, w = 0; const A = L.akt, of = L.off.array, s = L.sc.array, c = L.col.array, r = L.rot.array;
        for (let i = 0; i < A.length; i++) {
          const p = A[i]; if (!p.aktif) continue; A[w++] = p;
          if (!p.visible || p.material.opacity <= 0.003) continue;
          of[n * 3] = p.position.x; of[n * 3 + 1] = p.position.y; of[n * 3 + 2] = p.position.z;
          s[n * 2] = p.scale.x; s[n * 2 + 1] = p.scale.y;
          const m = p.material; c[n * 4] = m.color.r; c[n * 4 + 1] = m.color.g; c[n * 4 + 2] = m.color.b; c[n * 4 + 3] = Math.min(1, m.opacity);
          r[n] = m.rotation; n++;
        }
        A.length = w; L.mesh.geometry.instanceCount = n; L.mesh.visible = n > 0;
        if (n) for (const a of [L.off, L.sc, L.col, L.rot]) a.needsUpdate = true;
      }
    },
    say() { return K[0].akt.length + K[1].akt.length; },
    temizle() { for (const L of K) { for (const p of L.akt) if (p.aktif) { p.aktif = false; L.bos.push(p); } L.akt.length = 0; L.mesh.geometry.instanceCount = 0; L.mesh.visible = false; } }
  };
}
