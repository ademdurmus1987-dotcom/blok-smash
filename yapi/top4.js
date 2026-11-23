// Foxi Smash v12.3 deneme (24 Kas 2026, Adem: 'kalite farkini gostermek istedim'; Smash Kingdom / Play Store ekranlari referans/oyun2):
// Rakipte top arabasi arkadan bakinca uzun, yukari kalkik bir namlu olarak okunuyor; bizimki ekranin altinda yarisi kesik iri bir top gibiydi.
// Yeni araba arkadan okunacak sekilde kurulur: 26 derece kalkik uzun namlu (govde turuncu, agiz turkuaz), halat ve altin halkalar, namlu arkasinda
// tilki patisi (kameraya bakar), tahta yanaklar ve parmakli tekerlekler. Renk rolleri kaide.js ile ayni (Gardirop: govde, namlu, ahsap, altin, krem).
// Deneme anahtari ?top4=1 (Adem onaylayinca varsayilan olur).
export function topModeli3(THREE, boya, halat) {
  const Pi = Math.PI, V2 = (a) => a.map((q) => new THREE.Vector2(q[0], q[1]));
  const govde = boya('#f2452c', 'top'), namlu = boya('#0f9fb4', 'top'), ahsap = boya('#b9692a', 'kutu'), altin = boya('#f3d49a', 'kutu'), krem = boya('#fff0cf', 'kutu');
  govde.userData.rol = 'govde'; namlu.userData.rol = 'namlu'; ahsap.userData.rol = 'ahsap'; altin.userData.rol = 'altin'; krem.userData.rol = 'krem';
  const ic = new THREE.MeshBasicMaterial({ color: '#160c08' });
  const G = new THREE.Group(), add = (geo, m, x, y, z, par) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; (par || G).add(o); return o; };
  const pati = (s, m) => { const g = new THREE.Group(), ex = { depth: 0.05 * s, bevelEnabled: true, bevelThickness: 0.035 * s, bevelSize: 0.03 * s, bevelSegments: 3, curveSegments: 18 };
    const el = (rx, ry, x, y, r) => { const sh = new THREE.Shape(); sh.absellipse(0, 0, rx * s, ry * s, 0, Pi * 2, false, 0); const o = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, ex), m); o.position.set(x * s, y * s, 0); o.rotation.z = r || 0; g.add(o); };
    el(0.36, 0.29, 0, -0.18); el(0.13, 0.17, -0.42, 0.14, 0.35); el(0.14, 0.18, -0.15, 0.4, 0.1); el(0.14, 0.18, 0.15, 0.4, -0.1); el(0.13, 0.17, 0.42, 0.14, -0.35); return g; };
  // tahta yanaklar: basamakli kizak (yandan bakista merdiven gibi), iki yanda
  const yan = new THREE.Shape(); yan.moveTo(-1.05, 0); yan.lineTo(0.95, 0); yan.lineTo(0.95, 0.55); yan.lineTo(0.55, 0.55); yan.lineTo(0.55, 1.0); yan.lineTo(0.05, 1.0); yan.lineTo(0.05, 1.32); yan.lineTo(-0.45, 1.32); yan.lineTo(-0.45, 0.8); yan.lineTo(-1.05, 0.5); yan.lineTo(-1.05, 0);
  const yG = new THREE.ExtrudeGeometry(yan, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 }); yG.rotateY(-Pi / 2); yG.translate(0.1, 0, 0);
  for (const sx of [-1, 1]) { add(yG, ahsap, sx * 0.58, 0.18, 0); for (const [z, y] of [[0.75, 0.42], [0.3, 0.86], [-0.2, 1.18], [-0.8, 0.4]]) add(new THREE.SphereGeometry(0.06, 10, 8), altin, sx * 0.71, y + 0.18, z); }
  add(new THREE.BoxGeometry(1.3, 0.16, 1.9), ahsap, 0, 0.26, -0.05);   // alt tabla
  // tekerlekler: tahta, altin dis halka, krem parmaklar, altin gobek
  const tek = [];
  for (const sx of [-1, 1]) {
    const W = new THREE.Group(); W.position.set(sx * 1.02, 0.66, 0.15); G.add(W); tek.push(W);
    const t = add(new THREE.CylinderGeometry(0.64, 0.64, 0.34, 40), ahsap, 0, 0, 0, W); t.rotation.z = Pi / 2;
    const r = add(new THREE.TorusGeometry(0.64, 0.09, 10, 48), altin, 0, 0, 0, W); r.rotation.y = Pi / 2;
    for (let i = 0; i < 6; i++) { const s = add(new THREE.BoxGeometry(0.06, 0.9, 0.09), krem, sx * 0.15, 0, 0, W); s.rotation.x = i / 6 * Pi; }
    const gb = add(new THREE.CylinderGeometry(0.17, 0.2, 0.34, 24), altin, sx * 0.06, 0, 0, W); gb.rotation.z = Pi / 2;
  }
  const dingil = add(new THREE.CylinderGeometry(0.09, 0.09, 2.2, 14), altin, 0, 0.66, 0.15); dingil.rotation.z = Pi / 2;
  // namlu: kalkik, uzun; arka tepe (dugme), govde konik, agiz siskin. Eksen +z, ic koordinatta agiz z = UC
  const UC = 2.05, EL = -0.46, N = new THREE.Group(); N.position.set(0, 1.5, -0.05); N.rotation.x = EL; G.add(N);
  const gov = V2([[0.001, -0.96], [0.56, -0.96], [0.68, -0.9], [0.74, -0.76], [0.75, -0.5], [0.7, 0.1], [0.6, 0.9], [0.53, 1.55], [0.001, 1.55]]);   // arkasi duz kapak (patinin zemini)
  const gG = new THREE.LatheGeometry(gov, 48); gG.rotateX(Pi / 2); add(gG, govde, 0, 0, 0, N);
  const agz = V2([[0.38, 1.45], [0.53, 1.45], [0.58, 1.6], [0.65, 1.82], [0.68, 1.98], [0.58, UC], [0.38, UC], [0.38, 1.45]]);
  const aG = new THREE.LatheGeometry(agz, 48); aG.rotateX(Pi / 2); add(aG, namlu, 0, 0, 0, N);
  const halka = [];
  for (const [z, r, t, h] of [[-0.8, 0.76, 0.08, 1], [-0.05, 0.72, 0.065, 0], [0.75, 0.64, 0.075, 1], [1.5, 0.56, 0.06, 0]]) { const tg = new THREE.TorusGeometry(r, t * 1.2, 12, 96), o = add(tg, h && halat ? halat(tg) : altin.clone(), 0, 0, z, N); halka.push(o); }
  const kulak = add(new THREE.CylinderGeometry(0.14, 0.14, 1.62, 16), altin, 0, 0, -0.05, N); kulak.rotation.z = Pi / 2;   // namlu muylusu
  const pA = pati(0.85, krem); pA.position.set(0, 0.06, -0.965); pA.rotation.y = Pi; N.add(pA);   // arkadan bakana tilki patisi
  const pU = pati(0.3, altin); pU.position.set(0, 0.66, 0.45); pU.rotation.x = -Pi / 2 + 0.12; N.add(pU);
  const kor = new THREE.Mesh(new THREE.CircleGeometry(0.39, 28), new THREE.MeshBasicMaterial({ color: '#ff8a2a', transparent: true, opacity: 0 })); kor.position.z = UC + 0.005; N.add(kor);
  add(new THREE.CircleGeometry(0.39, 28), ic, 0, 0, UC, N);
  N.updateMatrix(); const muzzle = new THREE.Vector3(0, 0, UC).applyMatrix4(N.matrix);
  return { G, N, tek, halka, kor, muzzle, uc: UC, nz: N.position.z, ny: N.position.y, el: EL, w: 2.45 };
}
