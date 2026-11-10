// Blok Smash - Korsan Tilki (Adem'in Tripo modeli: karakter/tilki.glb, Mixamo iskeleti, icinde animasyon yok).
// Hareketlerin hepsi burada kodla uretilir: bekleme (nefes, etrafa bakma, kuyruk sallama), selam, atis tepkisi, sevinme, uzulme.
// Modelde kuyruk kemigi yok: yuklerken kalcaya uc kuyruk kemigi eklenir, kuyruk noktalari onlara baglanir.
// Eksenler (model uzayi): +x karakterin solu, +y yukari, +z karakterin baktigi yon.
import * as THREE from '../three.module.min.js';
import { GLTFLoader } from '../GLTFLoader.js?v=2';

export const TILKI_URL = new URL('./tilki.glb?v=1', import.meta.url).href;
export function tilkiYukle() { return new Promise((res, rej) => new GLTFLoader().load(TILKI_URL, (gl) => res(gl.scene), undefined, rej)); }

const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const KEM = ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head', 'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand', 'RightShoulder', 'RightArm', 'RightForeArm', 'RightHand', 'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'RightUpLeg', 'RightLeg', 'RightFoot', 'Tail1', 'Tail2', 'Tail3'];
// kuyruk yolu (model uzayi): kok -> orta -> uc
const KUY = [new THREE.Vector3(-0.02, 0.33, 0.0), new THREE.Vector3(-0.13, 0.26, -0.14), new THREE.Vector3(-0.2, 0.36, -0.22)];

function kuyrukEkle(model, mesh) {
  let hips = null; model.traverse((o) => { if (o.isBone && /Hips$/.test(o.name)) hips = o; }); if (!hips) return;
  mesh.skeleton.pose(); model.updateMatrixWorld(true);
  const sk = mesh.skeleton, inv = new THREE.Matrix4().copy(model.matrixWorld).invert(), bs = []; let par = hips;
  for (let i = 0; i < 3; i++) { const b = new THREE.Bone(); b.name = 'mixamorigTail' + (i + 1); par.add(b); b.position.copy(par.worldToLocal(KUY[i].clone().applyMatrix4(model.matrixWorld))); b.quaternion.copy(par.getWorldQuaternion(new THREE.Quaternion()).invert()); b.updateMatrixWorld(true); bs.push(b); par = b; }
  const n0 = sk.bones.length, si = mesh.geometry.attributes.skinIndex, sw = mesh.geometry.attributes.skinWeight, pos = mesh.geometry.attributes.position, w = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    mesh.getVertexPosition(i, w); w.applyMatrix4(mesh.matrixWorld).applyMatrix4(inv);
    // kuyruk: govdenin arkasinda ve karakterin sag-arkasinda kalan tuylu kisim (kilic +x tarafinda, o bolge disarida)
    if (w.y > 0.66 || w.y < 0.1) continue;
    const arka = -w.z, yan = 0.06 - w.x; if (arka < 0.0 || yan < 0) continue;
    const d = Math.hypot(w.x - KUY[0].x, w.z - KUY[0].z, (w.y - KUY[0].y) * 0.6);
    const t = ss(0.05, 0.3, d) * ss(0.0, 0.05, arka) * ss(0.0, 0.05, yan); if (t < 0.02) continue;
    const a = ss(0.0, 0.3, t), b = ss(0.3, 0.65, t), c = ss(0.65, 1.0, t);
    // kalca -> T1 -> T2 -> T3 arasinda yumusak gecis
    const w0 = 1 - a, w1 = a * (1 - b), w2 = a * b * (1 - c), w3 = a * b * c;
    const hi = sk.bones.indexOf(hips), al = [[hi, w0], [n0, w1], [n0 + 1, w2], [n0 + 2, w3]].sort((p, q) => q[1] - p[1]);
    // eski agirliklarin (bacak, kalca) hepsi kalca payina gecer; en buyuk dort tanesi yazilir
    si.setXYZW(i, al[0][0], al[1][0], al[2][0], al[3][0]); sw.setXYZW(i, al[0][1], al[1][1], al[2][1], al[3][1]);
  }
  si.needsUpdate = sw.needsUpdate = true;
  mesh.bind(new THREE.Skeleton(sk.bones.concat(bs), sk.boneInverses.concat(bs.map((b) => b.matrixWorld.clone().invert()))), mesh.bindMatrix);
}

const Q1 = new THREE.Quaternion(), Q2 = new THREE.Quaternion(), E1 = new THREE.Euler();
export class Tilki {
  // sahne: tilkiYukle() sonucu. boy: sahnedeki boyu (birim). Ayaklar root'un y=0'inda durur.
  constructor(sahne, boy = 1) {
    this.root = new THREE.Group(); this.govde = new THREE.Group(); this.root.add(this.govde); this.govde.add(sahne);
    sahne.traverse((o) => { if (o.isSkinnedMesh) this.mesh = o; });
    const m = this.mesh; m.frustumCulled = false; m.castShadow = true;
    m.material.metalness = Math.min(m.material.metalness, 0.35); m.material.normalScale = new THREE.Vector2(0.8, 0.8); m.material.side = THREE.FrontSide;
    kuyrukEkle(sahne, m);
    sahne.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(sahne), h = bb.max.y - bb.min.y; this.olcek = boy / h; this.boy = boy;
    sahne.scale.setScalar(this.olcek); sahne.position.y = -bb.min.y * this.olcek;
    // kemikler: dinlenme durusu ve ebeveynin model-uzayi yonu (model-ekseninde donus verebilmek icin)
    this.b = {}; const rinv = sahne.getWorldQuaternion(new THREE.Quaternion()).invert();
    sahne.traverse((o) => { if (!o.isBone) return; const ad = o.name.replace(/^mixamorig:?/, ''); if (!KEM.includes(ad)) return;
      const P = o.parent.getWorldQuaternion(new THREE.Quaternion()).premultiply(rinv); this.b[ad] = { o, q0: o.quaternion.clone(), P, Pi: P.clone().invert(), p0: o.position.clone(), r: [0, 0, 0] }; });
    this.t = Math.random() * 10; this.durum = { selam: 0, sevin: 0, uzul: 0, atis: 0 }; this.hedef = { selam: 0, sevin: 0, uzul: 0, atis: 0 }; this.sure = { selam: 0, sevin: 0, uzul: 0, atis: 0 }; this.faz = { selam: 0, sevin: 0, uzul: 0, atis: 0 };
    this.bakis = 0; this.bakisH = 0; this.zip = 0; this.update(0);
  }
  // ad: 'selam' | 'sevin' | 'uzul' | 'atis'; sure: saniye (0 = kapatilana kadar)
  oyna(ad, sure = 0) { if (!(ad in this.hedef)) return; if (ad === 'sevin') this.hedef.uzul = 0; if (ad === 'uzul') this.hedef.sevin = 0; this.hedef[ad] = 1; this.sure[ad] = sure || 1e9; if (ad !== 'uzul') this.faz[ad] = 0; }
  dur(ad) { if (ad) this.hedef[ad] = 0; else for (const k in this.hedef) this.hedef[k] = 0; }
  bak(yaw) { this.bakisH = Math.max(-0.7, Math.min(0.7, yaw)); }
  _r(ad, x, y, z) { const k = this.b[ad]; if (k) { k.r[0] += x; k.r[1] += y; k.r[2] += z; } }
  update(dt) {
    const t = (this.t += dt), D = this.durum, s = Math.sin;
    for (const k in D) { if (this.hedef[k]) { this.sure[k] -= dt; if (this.sure[k] <= 0) this.hedef[k] = 0; } const hz = k === 'atis' ? 16 : k === 'uzul' ? 4 : 8; D[k] += (this.hedef[k] - D[k]) * Math.min(1, dt * hz); this.faz[k] += dt; }
    this.bakis += (this.bakisH - this.bakis) * Math.min(1, dt * 5);
    for (const k in this.b) { const r = this.b[k].r; r[0] = r[1] = r[2] = 0; }
    const sak = 1 - Math.max(D.sevin, D.uzul);   // sakin bekleme payi
    // --- bekleme: nefes, hafif salinim, etrafa bakma, kaldirdigi eliyle ufak oynama, kuyruk
    const nef = s(t * 2.1);
    this._r('Spine1', nef * 0.018, 0, s(t * 0.9) * 0.02 * sak); this._r('Spine2', nef * 0.022, 0, 0);
    this._r('Hips', 0, s(t * 0.7) * 0.03 * sak, s(t * 0.9 + 1) * 0.012 * sak);
    const bk = (s(t * 0.43) * 0.22 + s(t * 0.17 + 2) * 0.12) * sak + this.bakis;
    this._r('Neck', -nef * 0.01, bk * 0.4, 0); this._r('Head', s(t * 0.6 + 1) * 0.04 * sak, bk * 0.6, s(t * 0.5) * 0.05 * sak);
    this._r('LeftForeArm', 0, 0, s(t * 1.7) * 0.05 * sak); this._r('LeftHand', 0, 0, s(t * 1.7 + 0.6) * 0.1 * sak);
    this._r('RightArm', 0, 0, nef * 0.015);
    const kh = 2.6 + D.sevin * 7 + D.selam * 3 - D.uzul * 1.6, kg = 0.2 + D.sevin * 0.22 + D.selam * 0.1 - D.uzul * 0.13; this.kf = (this.kf || 0) + dt * kh;
    this._r('Tail1', -D.uzul * 0.25, s(this.kf) * kg, 0); this._r('Tail2', -D.uzul * 0.2, s(this.kf - 0.7) * kg * 1.2, 0); this._r('Tail3', 0, s(this.kf - 1.4) * kg * 1.4, 0);
    // --- selam: kalkik sol eliyle el sallar, basini hafif yana egip
    if (D.selam > 0.001) { const w = D.selam, f = s(this.faz.selam * 11);
      this._r('LeftArm', 0, 0, 0.3 * w); this._r('LeftForeArm', 0, 0, (0.15 + f * 0.38) * w); this._r('LeftHand', 0, 0, f * 0.3 * w);
      this._r('Head', 0, 0, -0.12 * w); this._r('Spine2', 0, 0, -0.05 * w); }
    // --- atis: topun geri tepmesiyle irkilip one dogru yumruk sallar
    if (D.atis > 0.001) { const w = D.atis;
      this._r('Spine', -0.12 * w, 0, 0); this._r('Head', 0.1 * w, 0, 0); this._r('LeftArm', -0.5 * w, 0, 0.35 * w); this._r('LeftForeArm', -0.3 * w, 0, 0); this._r('RightArm', 0, 0, -0.25 * w); }
    // --- sevinme: ziplar, iki kolunu havaya kaldirip sallar
    let zy = 0, ez = 0;
    if (D.sevin > 0.001) { const w = D.sevin, f = this.faz.sevin, per = 0.62, u = (f % per) / per, hop = 4 * u * (1 - u);
      zy = hop * 0.2 * w; ez = (u < 0.12 ? (0.12 - u) / 0.12 : u > 0.88 ? (u - 0.88) / 0.12 : 0) * 0.14 * w;
      const sl = s(f * 13) * 0.16;
      this._r('LeftArm', 0, 0, (0.75 + sl) * w); this._r('LeftForeArm', 0, 0, -0.35 * w); this._r('LeftHand', 0, 0, sl * w);
      this._r('RightArm', 0, 0, (-0.22 - sl * 0.5) * w);   // sag el yelege yapisik modellenmis: fazla kaldirilinca yelek geriliyor, o yuzden az oynar
      this._r('Spine2', -0.12 * w, 0, 0); this._r('Head', -0.2 * w, 0, s(f * 6.5) * 0.08 * w);
      const bkl = (1 - hop) * 0.35 * w; this._r('LeftUpLeg', -bkl * 0.5, 0, 0); this._r('LeftLeg', bkl, 0, 0); this._r('RightUpLeg', -bkl * 0.5, 0, 0); this._r('RightLeg', bkl, 0, 0); }
    // --- uzulme: basi one duser, omuzlar coker, eli iner, basini iki yana sallar
    if (D.uzul > 0.001) { const w = D.uzul, f = this.faz.uzul;
      this._r('Spine', 0.1 * w, 0, 0); this._r('Spine2', 0.16 * w, 0, 0); this._r('Neck', 0.1 * w, 0, 0); this._r('Head', 0.24 * w, s(f * 2.4) * 0.16 * w * ss(0.6, 1.2, f), 0);
      this._r('LeftArm', 0.1 * w, 0, -0.95 * w); this._r('LeftForeArm', 0, 0, -0.75 * w); this._r('LeftHand', 0, 0, -0.5 * w);
      this._r('RightArm', 0, 0, 0.12 * w); }
    this.zip = zy;
    for (const k in this.b) { const B = this.b[k], r = B.r; if (!r[0] && !r[1] && !r[2]) { B.o.quaternion.copy(B.q0); continue; }
      Q1.setFromEuler(E1.set(r[0], r[1], r[2], 'YXZ')); Q2.copy(B.Pi).multiply(Q1).multiply(B.P); B.o.quaternion.copy(Q2).multiply(B.q0); }
    // govde: ziplama, yere basarken ezilme, atista geri tepme
    const sq = ez + D.atis * 0.07, nb = nef * 0.006;
    this.govde.position.y = zy * this.boy; this.govde.scale.set(1 + sq * 0.6 - nb, 1 - sq + nb, 1 + sq * 0.6 - nb);
    this.govde.rotation.x = -D.atis * 0.1;
  }
}
