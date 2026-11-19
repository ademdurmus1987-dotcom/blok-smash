// Foxi Smash PILOT v5.4 (16 Kas 2026): yeni bolum bicimi (v2) denemesi. Yalniz yapi/index.html?pilot=N ile acilir.
// Eski bolumler bu dosyayi hic yuklemez. Pilot kipte kayda yazilmaz (oyun.js save PILOT satiri), ana sayfa/guclendirici yok.
//
// v2 bolum (yapi/pilot/pilot.json):
//   ada:   [{ id, x, z, ayak, katlar: [{ sekil: 'kare'|'disk'|'cokgen'|'eskenar', r, n, don, ust, kal }] }]
//          her kat ayri sabit govde ve ayri platform kaydi (PLS): kendi katindan asagi inen parca 'dustu' sayilir.
//          r: kare/eskenar icin yarim kenar, disk/cokgen icin cevre yaricapi. ust: katin ust yuzu (dunya y). kal: kalinlik.
//   kopru: [{ tip: 'tahta'|'tas', a: [x, y, z], b: [x, y, z], en }]   (iki ucu verilen egimli tabliye, sabit govde)
//   parca: [{ t, x, y?, z, ry?, rx?, rz?, p: 'adaId.kat', id?, kir? }]   y: parcanin ALT yuzu (verilmezse katin ustu),
//          ry/rx/rz derece. kir: bu hizdan sert sabit yuzeye carpinca kirilir (turun kendi 'carp' degeri yerine).
//   kam:   { pitch, yaw } derece. top: top sayisi.
import { pilotSekilKur } from './pilot_sekil.js?v=6';

// v9.0 (19 Kas 2026, Adem: 'zorluk egrisine gore araya serpistir'): ana: true -> ANA OYUN KIPI. Sekil bolumleri ana oyunun 2000 bolumunun arasinda
//   (yapi/pilot/sira.js) normal bolum gibi oynanir: kayit, ilerleme, top sayisi (egri.js sekilTop), kartlar ana oyunun. Platform gorunusu ana oyunun
//   temali platformu (oyun.js temaKur); burada yalniz fizik govdeleri, parcalar, kamera cercevesi ve hareket kurulur. Bolum her kurulumda kur(n, Y) ile secilir.
export function pilotKur(A, ana) {
  const { THREE, CANNON, S } = A, Pi = Math.PI, D2R = Pi / 180;
  let N = ana ? 0 : Math.floor(+A.Q.get('pilot')) || 0;
  // v8.3 (18 Kas 2026): 31-36 Adem'in cizimindeki 6 yapi (Korsan Gemisi, Kale, Kuru Kafa, Deniz Feneri, Tilki Basi, Tas Kopru): ayri dosya pilot/resim.json
  // v8.6: 55-108 gorsel referans zip'i (pilot/duvar.json); v9.0: 109+ ikinci zip (pilot/yeni.json), ayni duvar kurallari
  let DUVAR = false, RESIM = false;
  const ayarla = (n) => { N = n; DUVAR = N >= 55 && N <= 999; RESIM = (N >= 31 && N <= 54) || DUVAR; };
  ayarla(N);
  const dosyaOf = (n) => n >= 960 ? 'pilot/yapi.json?v=5' : n >= 950 ? 'pilot/ucb.json?v=1' : n >= 900 ? 'pilot/ornek.json?v=1' : n >= 109 ? 'pilot/yeni.json?v=1' : n >= 55 ? 'pilot/duvar.json?v=5' : n >= 31 ? 'pilot/resim.json?v=6' : 'pilot/pilot.json?v=5';
  const DOS = {}, DOSV = {}, HAZ = new Set();
  const veriAl = (n) => { const u = dosyaOf(n); return DOS[u] || (DOS[u] = fetch(u).then((r) => r.json()).then((v) => (DOSV[u] = v)).catch(() => { delete DOS[u]; return null; })); };
  // v9.0: ana oyunda tas, fici ve sise Adem'in cizimindeki gibi gri tas / fici / sise (oyun.js GRI: ayni turun eski gorunumlu esi)
  // v9.2: sekil bolumlerinde cilali es tur (oyun.js CILA_T, ?cila=0 kapatir)
  const tur = (t) => { const k = (ana && A.GRI && A.GRI[t]) || t; return (A.CILA_T && A.CILA_T[k]) || k; };
  let SIRA = DUVAR ? [] : RESIM ? [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54] : [21, 22, 23];   // 1, 7, 13 rafta (adresle yine acilir)
  let VERI = null, B = null;   // B: bu bolumun verisi
  const BOS = { veri: 1, engel: [], ad: 'Pilot', top: 10, make: () => [] };
  let Y = BOS;

  // ---------- yeni sekiller: oyunun tablolarina eklenir (yalniz pilot kipte) ----------
  const MALZ = {};
  const PS = pilotSekilKur({ THREE, CANNON, S, canvasTex: A.canvasTex, ENV: A.ENV });
  for (const k in PS.TUR) {
    const t = PS.TUR[k]; A.SEK.TUR[k] = t; A.KIND[k] = { mass: t.mass, f: t.f, r: t.r, sek: 1 }; A.MATSND[k] = t.ses;
    if (t.cs) A.SEKSH[k] = t.cs();
    if (t.boom) { A.KIND[k].boom = t.boom; A.KIND[k].guc = t.guc; }   // v5.9: TNT oyunun kendi patlama yolundan
    if (t.kir) A.KIRILGAN.add(k); if (t.yuzer) A.FLOAT.add(k); if (t.topKir) A.KIND[k].kir = t.topKir;   // v5.6: top degince kirilir / suda yuzer / carpinca kirilir (oyunun kendi yolu)
    if (t.temas) {   // tur grubuna ozel temas: taban platformu tutar (kaymaz, devrilir), ayni gruptaki parcalar birbirinin ustunden kayar
      // Malzeme surtunmesi -1: cannon-es iki malzemede de surtunme tanimliysa temas tablosunu yok sayip carpimini alir.
      // (cannon-es surtunme siniri itme basina oldugu icin yuksek surtunme ust uste duran taslari 'yapistirir': lento dikili tasi tutar, domino birbirine yaslanip kalir.)
      const gr = t.temas.grup || k; let m = MALZ[gr];
      if (!m) {
        m = MALZ[gr] = new CANNON.Material({ friction: -1, restitution: -1 });
        A.world.addContactMaterial(new CANNON.ContactMaterial(m, A.PM.plat, { friction: t.temas.plat, restitution: 0 }));
        A.world.addContactMaterial(new CANNON.ContactMaterial(m, m, { friction: t.temas.kendi, restitution: 0.02 }));
      }
      A.KIND[k].pm = m;
    }
  }

  // pilot tas grubu ile oyunun mevcut tas turleri arasinda dusuk surtunme (sunak tablasi tas ayaklarin ustunden kayabilsin).
  // Mevcut turun malzemesi parcaKur'un ilk kullanimda kuracagiyla ayni (surtunme/sekme degerleri KIND'den) burada onceden kurulur.
  if (MALZ.tas) for (const k of ['ksTas', 'ksTas2', 'ksSutun']) { const kd = A.KIND[k]; if (!kd) continue; kd.pm = kd.pm || new CANNON.Material({ friction: kd.f, restitution: kd.r }); A.world.addContactMaterial(new CANNON.ContactMaterial(MALZ.tas, kd.pm, { friction: 0.15, restitution: 0 })); }
  // ---------- platform gorunusu: kaide.js ile ayni turkuaz tahta ust + percinli bakir kusak ----------
  const MAT = A.KAIDE ? A.KAIDE.MAT : { ust: new THREE.MeshStandardMaterial({ color: '#0b9a92' }), yan: new THREE.MeshStandardMaterial({ color: '#0a8a83' }), kus: new THREE.MeshStandardMaterial({ color: '#e8862a', metalness: 0.6 }), alt: new THREE.MeshStandardMaterial({ color: '#0a5552' }) };
  const MLIST = [MAT.ust, MAT.yan, MAT.kus, MAT.alt];
  // v8.3: mor-altin kaide (resim bolumleri, B.kaide === 'mor'): mor tahta ust, altin seritli mor yan, altin kusak, ayak da mor-altin
  let MOR = null;
  function morMat() {
    if (MOR) return MOR;
    const std = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.45, envMap: A.ENV, envMapIntensity: 0.5 }, o));
    const tek = (t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
    const ust = tek(A.canvasTex(256, 256, (x, w, h) => { const n = 4, ph = h / n; for (let i = 0; i < n; i++) { const g = x.createLinearGradient(0, i * ph, 0, (i + 1) * ph); g.addColorStop(0, '#9a52e8'); g.addColorStop(0.5, '#7a32cc'); g.addColorStop(1, '#5a1ea6'); x.fillStyle = g; x.fillRect(0, i * ph, w, ph); x.fillStyle = 'rgba(255,255,255,.3)'; x.fillRect(0, i * ph + 1, w, 2); x.fillStyle = 'rgba(30,0,60,.45)'; x.fillRect(0, (i + 1) * ph - 3, w, 3); } }));
    const yan = tek(A.canvasTex(128, 128, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffe08a'); g.addColorStop(0.1, '#f2b234'); g.addColorStop(0.16, '#8a3ee0'); g.addColorStop(1, '#4a168a'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = '#ffc94a'; x.fillRect(0, h * 0.86, w, h * 0.08); }));
    const kus = tek(A.canvasTex(128, 64, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#fff0b0'); g.addColorStop(0.35, '#f4b42a'); g.addColorStop(1, '#a8640c'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(90,40,0,.35)'; x.fillRect(0, h * 0.48, w, 2); }));
    MOR = [std({ map: ust, roughness: 0.5, envMapIntensity: 0.35 }), std({ map: yan, roughness: 0.4 }), std({ map: kus, metalness: 0.75, roughness: 0.28, envMapIntensity: 1.2, emissive: '#5a3000', emissiveIntensity: 0.18 }), std({ color: '#3a0f70', roughness: 0.7 })];
    const u = A.LEG.userData;   // ayak: mor direk, altin halka ve taban (yalniz bu kipte; sayfa pilot kipte acik)
    if (u.pole) { u.pole.material = std({ color: '#6a28c0', roughness: 0.45 }); u.collar.material = u.ring.material = u.cap.material = MOR[2]; u.base.material = std({ color: '#4a168a', roughness: 0.5 }); }
    return MOR;
  }
  function cevre(k) {   // katin dis cizgisi: [x, z] noktalari (saat yonunun tersine, ustten bakista)
    const r = k.r, don = (k.don || 0) * D2R, P = [];
    let n = k.sekil === 'disk' ? (k.n || 40) : k.sekil === 'cokgen' ? (k.n || 6) : 4, a0 = don;
    if (k.sekil === 'kare') { const rz = k.rz || r, dz = k.dz || 0; if (k.rz || k.dz) return [[r, rz + dz], [-r, rz + dz], [-r, -rz + dz], [r, -rz + dz]];   // dikdortgen (yarim genislik r, yarim derinlik rz, z kaymasi dz)
      const rr = r * Math.SQRT2; for (let i = 0; i < 4; i++) { const a = Pi / 4 + i * Pi / 2 + don; P.push([Math.cos(a) * rr, Math.sin(a) * rr]); } return P; }
    if (k.sekil === 'eskenar' && k.rz) return [[r, 0], [0, k.rz], [-r, 0], [0, -k.rz]];   // uzatilmis eskenar dortgen: kose uzakliklari r (x) ve rz (z)
    if (k.sekil === 'eskenar') { const rr = r * Math.SQRT2; for (let i = 0; i < 4; i++) { const a = i * Pi / 2 + don; P.push([Math.cos(a) * rr, Math.sin(a) * rr]); } return P; }
    for (let i = 0; i < n; i++) { const a = a0 + i * 2 * Pi / n; P.push([Math.cos(a) * r, Math.sin(a) * r]); }
    return P;
  }
  function kaydir(P, d) {   // dis cizgiyi d kadar disari (d<0 iceri) kaydir (dis bukey cokgen)
    const n = P.length, o = [];
    for (let i = 0; i < n; i++) {
      const a = P[(i + n - 1) % n], b = P[i], c = P[(i + 1) % n];
      const n1 = norm(b[0] - a[0], b[1] - a[1]), n2 = norm(c[0] - b[0], c[1] - b[1]);
      const m = [n1[1] + n2[1], -(n1[0] + n2[0])], ml = Math.hypot(m[0], m[1]) || 1, cos = (n1[1] * m[0] - n1[0] * m[1]) / ml;
      o.push([b[0] + m[0] / ml * d / Math.max(0.3, cos), b[1] + m[1] / ml * d / Math.max(0.3, cos)]);
    }
    return o;
  }
  const norm = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
  function ccw(P) { let s = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - b[0] * a[1]; } return s > 0 ? P : P.slice().reverse(); }
  // levha: cizgiyi (x,z) y0..y1 arasinda yukselt; ust yuz dunya biriminde dokulu (0.5), yan v 0..1
  function levha(P, y0, y1, bev, mUst, mYan) {
    const sh = new THREE.Shape(); const Q = kaydir(P, -bev);
    Q.forEach(([x, z], i) => (i ? sh.lineTo(x, -z) : sh.moveTo(x, -z))); sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: Math.max(0.01, y1 - y0 - 2 * bev), bevelEnabled: bev > 0, bevelThickness: bev, bevelSize: bev, bevelSegments: 2, curveSegments: 1 });
    g.rotateX(-Pi / 2); g.translate(0, y0 + bev, 0);
    const uv = g.attributes.uv, [cap, yan] = g.groups;
    for (let i = cap.start; i < cap.start + cap.count; i++) uv.setXY(i, uv.getX(i) * 0.5, uv.getY(i) * 0.5);
    if (yan) { let v0 = 1e9, v1 = -1e9; for (let i = yan.start; i < yan.start + yan.count; i++) { v0 = Math.min(v0, uv.getY(i)); v1 = Math.max(v1, uv.getY(i)); }
      for (let i = yan.start; i < yan.start + yan.count; i++) uv.setXY(i, uv.getX(i) * 0.5, (uv.getY(i) - v0) / Math.max(1e-4, v1 - v0)); }
    return [g, [mUst, mYan]];
  }
  function birlestir(L) {   // [geo, [mKapak, mYan] | m] -> gruplu tek geometri, malzeme listesi MLIST sirasinda
    const parts = [];
    for (const [g, mm] of L) { const gi = g.index ? g.toNonIndexed() : g; const gs = g.groups.length ? g.groups : [{ start: 0, count: gi.attributes.position.count, materialIndex: 0 }]; for (const gr of gs) parts.push([gi, gr.start, gr.count, Array.isArray(mm) ? mm[gr.materialIndex] : mm]); }
    parts.sort((a, b) => a[3] - b[3]);
    let n = 0; for (const p of parts) n += p[2];
    const P = new Float32Array(n * 3), Nn = new Float32Array(n * 3), U = new Float32Array(n * 2), out = new THREE.BufferGeometry(); let o = 0, gs = 0, cur = -1;
    for (const [g, st, cnt, m] of parts) {
      P.set(g.attributes.position.array.subarray(st * 3, (st + cnt) * 3), o * 3); Nn.set(g.attributes.normal.array.subarray(st * 3, (st + cnt) * 3), o * 3); U.set(g.attributes.uv.array.subarray(st * 2, (st + cnt) * 2), o * 2);
      if (m !== cur) { if (cur >= 0) out.addGroup(gs, o - gs, cur); cur = m; gs = o; } o += cnt;
    }
    out.addGroup(gs, o - gs, cur);
    out.setAttribute('position', new THREE.BufferAttribute(P, 3)); out.setAttribute('normal', new THREE.BufferAttribute(Nn, 3)); out.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    out.computeBoundingBox(); out.computeBoundingSphere(); return out;
  }
  // bir katin gorunusu: ust tabla (0.44), altinda disari tasan bakir kusak, kat yuksekse kusagin altinda turkuaz govde
  // bir katin parcalari (ada basina tek mesh'te birlesir: ada basina 3 cizim)
  function katParca(L, P, ust, alt) {
    const tk = Math.min(0.44, ust - alt);
    L.push(levha(P, ust - tk, ust, 0.07, 0, 1));
    const kb = Math.max(alt, ust - 0.74);
    if (ust - tk - kb > 0.05) L.push(levha(kaydir(P, 0.12), kb, ust - tk + 0.02, 0.04, 2, 2));
    if (kb - alt > 0.05) L.push(levha(kaydir(P, -0.06), alt, kb + 0.02, 0.03, 1, 1));
  }
  // ayak (ana ada disindakiler): turkuaz direk + bakir yaka/halka + taban tek mesh (3 cizim, golge yok)
  function ayakParca(x, z, ust) {
    const AY = A.LEG.userData, mDir = AY.pole.material, mBak = AY.collar.material, mTab = AY.base.material, L = [];
    const tepe = ust - 0.3, dip = A.GY + 0.82, g = (geo, y, m) => { geo.translate(0, y, 0); L.push([geo, m]); };
    g(new THREE.CylinderGeometry(0.42, 0.48, tepe - dip, 20), (tepe + dip) / 2, 0);
    g(new THREE.CylinderGeometry(0.8, 0.6, 0.3, 24), ust - 0.15, 1);
    g(new THREE.CylinderGeometry(0.75, 1.05, 0.28, 24), A.GY + 0.7, 1);
    g(new THREE.CylinderGeometry(1.2, 1.45, 0.5, 28), A.GY + 0.27, 2);
    const M = [mDir, mBak, mTab]; return L.map(([geo, mi]) => { geo.translate(x, 0, z); return [geo.index ? geo.toNonIndexed() : geo, M[mi]]; });
  }
  function parcaAl(g, st, cnt) {
    const gi = g.index ? g.toNonIndexed() : g, o = new THREE.BufferGeometry();
    for (const [ad, k] of [['position', 3], ['normal', 3], ['uv', 2]]) o.setAttribute(ad, new THREE.BufferAttribute(gi.attributes[ad].array.slice(st * k, (st + cnt) * k), k));
    return o;
  }
  function birlestirMat(L) {   // [geo, malzemeNo] -> gruplu tek geometri
    const parts = L.map(([g, mi]) => [g.index ? g.toNonIndexed() : g, mi]).sort((a, b) => a[1] - b[1]);
    let n = 0; for (const [g] of parts) n += g.attributes.position.count;
    const P = new Float32Array(n * 3), Nn = new Float32Array(n * 3), U = new Float32Array(n * 2), out = new THREE.BufferGeometry(); let o = 0, gs = 0, cur = -1;
    for (const [g, mi] of parts) { const c = g.attributes.position.count; P.set(g.attributes.position.array, o * 3); Nn.set(g.attributes.normal.array, o * 3); U.set(g.attributes.uv.array, o * 2); if (mi !== cur) { if (cur >= 0) out.addGroup(gs, o - gs, cur); cur = mi; gs = o; } o += c; }
    out.addGroup(gs, o - gs, cur);
    out.setAttribute('position', new THREE.BufferAttribute(P, 3)); out.setAttribute('normal', new THREE.BufferAttribute(Nn, 3)); out.setAttribute('uv', new THREE.BufferAttribute(U, 2)); out.computeBoundingSphere(); return out;
  }
  // fizik: dis bukey prizma (ConvexPolyhedron) ya da kutu
  function prizma(P, y0, y1) {
    const v = [], f = [], n = P.length;
    for (const [x, z] of P) v.push(new CANNON.Vec3(x, y0, z)); for (const [x, z] of P) v.push(new CANNON.Vec3(x, y1, z));
    const alt = [], ust = []; for (let i = 0; i < n; i++) { alt.push(i); ust.push(n + i); } f.push(alt, ust);
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; f.push([i, j, n + j, n + i]); }
    const c = new CANNON.Vec3(0, (y0 + y1) / 2, 0);
    const F = f.map((q) => { const a = v[q[0]], b = v[q[1]], d = v[q[2]], nn = b.vsub(a).cross(d.vsub(a)), m = new CANNON.Vec3(); for (const i of q) m.vadd(v[i], m); m.scale(1 / q.length, m); return nn.dot(m.vsub(c)) < 0 ? q.slice().reverse() : q; });
    return new CANNON.ConvexPolyhedron({ vertices: v, faces: F });
  }
  function katGovde(body, k, P, ax, az, y0, y1) {
    const q = new CANNON.Quaternion();
    if (k.sekil === 'kare' || (k.sekil === 'eskenar' && !k.rz)) { q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -((k.don || 0) + (k.sekil === 'eskenar' ? 45 : 0)) * D2R); body.addShape(new CANNON.Box(new CANNON.Vec3(k.r, (y1 - y0) / 2, k.rz || k.r)), new CANNON.Vec3(ax, (y0 + y1) / 2, az + (k.dz || 0)), q); }
    else { const Pp = k.sekil === 'disk' ? cevre(Object.assign({}, k, { n: 20 })) : P; body.addShape(prizma(ccw(Pp), y0 - (y0 + y1) / 2, y1 - (y0 + y1) / 2), new CANNON.Vec3(ax, (y0 + y1) / 2, az)); }
  }
  function yeniGovde() { const b = new CANNON.Body({ mass: 0, material: A.PM.plat }); b.collisionFilterGroup = 4; return b; }
  const icinde = (P, x, z) => { let s = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], c = (b[0] - a[0]) * (z - a[1]) - (b[1] - a[1]) * (x - a[0]); if (c !== 0) { if (s && Math.sign(c) !== s) return false; s = Math.sign(c); } } return true; };

  const LEKEMAT = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, map: A.canvasTex(64, 64, (x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(30,20,20,.5)'); g.addColorStop(0.55, 'rgba(30,20,20,.25)'); g.addColorStop(1, 'rgba(30,20,20,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }) });
  // ---------- kopru ----------
  const TAHTA = A.canvasTex(256, 64, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f0a050'); g.addColorStop(0.5, '#d9822a'); g.addColorStop(1, '#8a4a14'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(90,40,10,.35)'; x.lineWidth = 2; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(0, 8 + i * 9); for (let k = 0; k <= w; k += 16) x.lineTo(k, 8 + i * 9 + Math.sin(k * 0.05 + i) * 2); x.stroke(); } x.fillStyle = '#5a6070'; for (const cx of [14, w - 14]) { x.beginPath(); x.arc(cx, h / 2, 5, 0, 6.3); x.fill(); } });
  const TASK = A.canvasTex(256, 128, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#b4b9d2'); g.addColorStop(0.5, '#9299b8'); g.addColorStop(1, '#6a7094'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(40,36,90,.45)'; x.lineWidth = 3; for (let i = 1; i < 4; i++) { x.beginPath(); x.moveTo(i * w / 4, 0); x.lineTo(i * w / 4, h); x.stroke(); } x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(0, 0, w, 6); });
  const KMAT = { tahta: new THREE.MeshStandardMaterial({ map: TAHTA, roughness: 0.65, envMap: A.ENV, envMapIntensity: 0.3 }), tas: new THREE.MeshStandardMaterial({ map: TASK, roughness: 0.8, envMap: A.ENV, envMapIntensity: 0.3, emissive: '#20204a', emissiveIntensity: 0.12 }), ip: new THREE.MeshStandardMaterial({ color: '#c89a60', roughness: 0.9 }) };
  function kopruKur(k) {
    const a = new THREE.Vector3(...k.a), b = new THREE.Vector3(...k.b), d = b.clone().sub(a), L = d.length(), en = k.en || 1.2, kal = k.tip === 'tas' ? 0.42 : 0.22;
    const yaw = Math.atan2(d.x, d.z), pit = Math.asin(d.y / L), orta = a.clone().add(b).multiplyScalar(0.5);
    const grp = new THREE.Group(); grp.position.copy(orta); grp.rotation.order = 'YXZ'; grp.rotation.set(-pit, yaw, 0);
    let mesh;
    if (k.tip === 'tas') {
      const LL = [[new THREE.BoxGeometry(en, kal, L + 0.2), 0]];
      for (const sx of [-1, 1]) { const kn = new THREE.BoxGeometry(0.1, 0.12, L + 0.2); kn.translate(sx * (en / 2 + 0.02), kal / 2 - 0.08, 0); LL.push([kn, 1]); }
      mesh = new THREE.Mesh(birlestirMat(LL), [KMAT.tas, MAT.kus]);
    } else {
      const n = Math.max(3, Math.round(L / 0.42)), gs = [];
      for (let i = 0; i < n; i++) { const g = new THREE.BoxGeometry(en * (0.94 + 0.06 * Math.sin(i * 3.7)), kal, L / n - 0.05); g.rotateY(Math.sin(i * 5.3) * 0.04); g.translate(0, Math.sin(i * 2.1) * 0.015, -L / 2 + (i + 0.5) * L / n); gs.push(g); }
      mesh = new THREE.Mesh(birlestirBasit(gs), KMAT.tahta);
      const LL = gs.map((g) => [g, 0]);
      for (const sx of [-1, 1]) {
        for (const zz of [-L / 2 + 0.1, L / 2 - 0.1]) { const dk = new THREE.CylinderGeometry(0.07, 0.08, 0.9, 8); dk.translate(sx * en / 2, 0.45, zz); LL.push([dk, 0]); }
        const ip = new THREE.CylinderGeometry(0.035, 0.035, L - 0.2, 6); ip.rotateX(Pi / 2); ip.translate(sx * en / 2, 0.82, 0); LL.push([ip, 1]);
      }
      mesh.geometry = birlestirMat(LL); mesh.material = [KMAT.tahta, KMAT.ip];
    }
    mesh.receiveShadow = true;   // kopru golge dusurmez (cizim tasarrufu)
    grp.add(mesh); grp.updateMatrixWorld(true);
    const body = yeniGovde(), q = new CANNON.Quaternion(); q.setFromEuler(-pit, yaw, 0, 'YXZ');
    body.addShape(new CANNON.Box(new CANNON.Vec3(en / 2, kal / 2, L / 2)), new CANNON.Vec3(0, 0, 0)); body.position.set(orta.x, orta.y, orta.z); body.quaternion.copy(q);
    A.world.addBody(body);
    // grp'u mesh olarak kaydet (clearPX mesh.geometry'yi atar): kopru govde mesh'i, grubun yerine sahneye konur
    mesh.position.copy(orta); mesh.rotation.copy(grp.rotation); grp.remove(mesh); mesh.updateMatrix();
    const gg = mesh.geometry.clone(); gg.applyMatrix4(mesh.matrix); const ms = [].concat(mesh.material);
    for (const gr of gg.groups.length ? gg.groups : [{ start: 0, count: gg.attributes.position.count, materialIndex: 0 }]) TUM.push([parcaAl(gg, gr.start, gr.count), ms[gr.materialIndex]]);
    mesh.material = []; mesh.geometry.dispose(); mesh.geometry = new THREE.BufferGeometry();   // kayit icin yer tutucu (clearPX kaldirir)
    return { body, mesh, leg: null, x: orta.x, z: orta.z, cx: orta.x, r: 0, rz: 0, cy: orta.y, kopru: 1 };
  }
  function birlestirBasit(gs) { const L = gs.map((g) => [g, 0]); const parts = []; for (const [g] of L) parts.push(g.index ? g.toNonIndexed() : g); let n = 0; for (const g of parts) n += g.attributes.position.count; const P = new Float32Array(n * 3), Nn = new Float32Array(n * 3), U = new Float32Array(n * 2); let o = 0; for (const g of parts) { P.set(g.attributes.position.array, o * 3); Nn.set(g.attributes.normal.array, o * 3); U.set(g.attributes.uv.array, o * 2); o += g.attributes.position.count; } const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.BufferAttribute(P, 3)); out.setAttribute('normal', new THREE.BufferAttribute(Nn, 3)); out.setAttribute('uv', new THREE.BufferAttribute(U, 2)); out.computeBoundingSphere(); return out; }

  // ---------- bolum kurulumu ----------
  let KATLAR = [], CERCEVE = null;
  const KUYRUK = [], PATLAYAN = [], EK = [], HEDEF = [0, 0], TUM = [], TUM0 = [], LEKE = []; let HM = null, HQ = null; let GOLGE = false, D0 = 0;   // EK: pilotun kendi sahne nesneleri (ayaklar); her kurulumda silinir
  function bilinmeyen() {
    A.bolumBasla(Y); A.g.state = 'bilgi';
    A.modal('<div class="rib r">Pilot ' + N + ' yok</div><p>Hazır pilotlar: ' + SIRA.join(', ') + '</p>' + SIRA.map((n) => '<button class="btn kck" data-p="' + n + '">Pilot ' + n + '</button>').join(''));
    for (const b of document.querySelectorAll('[data-p]')) b.onclick = () => { location.search = '?pilot=' + b.dataset.p; };
  }
  function kur(n, Ya) {
    if (ana) { ayarla(n); const V = DOSV[dosyaOf(n)]; B = V && V.bolumler && V.bolumler[n] || null; Y = Ya || BOS; A.world.solver.iterations = 14; }
    KUYRUK.length = 0; PATLAYAN.length = 0; KATLAR = []; CERCEVE = null;
    for (const o of EK) { A.scene.remove(o); o.geometry.dispose(); } EK.length = 0; GOLGE = false;
    const pb = A.platBody; while (pb.shapes.length) pb.removeShape(pb.shapes[0]); pb.position.set(0, 0, 0); pb.quaternion.set(0, 0, 0, 1); pb.angularVelocity.set(0, 0, 0);
    if (A.SIRK.mesh) { A.scene.remove(A.SIRK.mesh); A.SIRK.mesh.geometry.dispose(); A.SIRK.mesh = null; }
    if (!B) { A.R = 4; A.RZ = 4; A.TOPY = 2; A.kamera(9 * D2R, 0); A.fit(); return bilinmeyen(); }
    A.kamera((B.kam && B.kam.pitch != null ? B.kam.pitch : 22) * D2R, (B.kam && B.kam.yaw || 0) * D2R);
    const pts = [], adaKat = {};
    let ilk = true;
    for (const ada of B.ada) {
      const ax = ada.x || 0, az = ada.z || 0, GL = []; adaKat[ada.id] = [];
      ada.katlar.forEach((k, ki) => {
        const P = ccw(cevre(k)).map(([x, z]) => [x + ax, z + az]), Pl = ccw(cevre(k)), alt = ki === 0 ? k.ust - (k.kal || 0.75) : ada.katlar[ki - 1].ust;
        const body = ilk ? pb : yeniGovde(); katGovde(body, k, Pl, ana ? 0 : ax, ana ? 0 : az, alt, k.ust);   // v9.0 ana: govde adanin yerinde (temali platform govdenin yerine cizilir)
        if (ana) body.position.set(ax, 0, az); else katParca(GL, Pl, k.ust, alt);
        // ada gorunusu ilk katin kaydinda; diger katlarin kaydinda bos yer tutucu (clearPX her kaydin mesh'ini kaldirir)
        const mesh = new THREE.Mesh(new THREE.BufferGeometry());   // yer tutucu: gorunus asagida tek birlesik mesh'te
        let leg = null;
        if (ki === 0 && ada.ayak !== 0) {
          if (ana) leg = ilk ? A.LEG : null;   // v9.0: ayagi temaKur cizer
          else if (ilk) { leg = A.LEG; leg.visible = true; leg.position.set(ax, 0, az); A.legBoy(leg, alt + 0.75); }
          else { for (const e of ayakParca(ax, az, alt)) TUM.push(e); LEKE.push([ax, az, Math.max(1.6, Math.min(2.6, k.r * 1.1))]); }
          body.addShape(new CANNON.Box(new CANNON.Vec3(0.55, (alt - A.GY) / 2, 0.55)), new CANNON.Vec3(ana ? 0 : ax, (alt + A.GY) / 2, ana ? 0 : az));
        }
        if (!ilk) A.world.addBody(body);
        // cy: 'dustu' siniri (oyun: parca merkezi cy - 0.45'in altina inince dustu). Alcak basamakta (alt kattan < 1.3) alt kata dusen
        // kup merkezi bu sinirin ustunde kalirdi; sinir alt katin 1.3 ustune cekilir. ust: katin gercek yuzu (yerlesim, kirinti).
        const q = { body, mesh, leg, x: ax, z: az, cx: ax, r: k.r, rz: ana ? (k.rz || k.r) : k.r, cy: ki > 0 ? Math.max(k.ust, alt + 1.3) : k.ust, ust: k.ust, yb: 0, kay: null, ph: 0, den: 0, eg: 0, th: 0.375, P, kat: k, ada: ada.id };
        if (ilk) A.SIRK.mesh = mesh;
        adaKat[ada.id].push(A.PLS.length); A.PLS.push(q); KATLAR.push(q);
        for (const [x, z] of P) { pts.push([x, k.ust, z]); pts.push([x, alt - 0.35, z]); }
        ilk = false;
      });
      const ML = ana ? MLIST : B.kaide === 'mor' ? morMat() : MLIST;   // v8.3
      const HED = B.hareket && ada === B.ada[0] ? TUM0 : TUM;   // v8.7: hareketli ana platformun gorunusu ayri mesh
      for (const [g, mm] of GL) { g.translate(ax, 0, az); for (const gr of g.groups) HED.push([parcaAl(g, gr.start, gr.count), ML[Array.isArray(mm) ? mm[gr.materialIndex] : mm]]); }
      if (ada.katlar.length > 1) GOLGE = true;   // ust katlar alt kata golge dusurur
    }
    for (const k of B.kopru || []) { const q = kopruKur(k); A.PLS.push(q); }
    // butun adalar, ayaklar ve kopruler tek mesh: malzeme basina bir cizim (11 ayri mesh 40+ cizim yapiyordu)
    { const ML = [], L = []; for (const [g, m] of TUM) { let i = ML.indexOf(m); if (i < 0) { i = ML.length; ML.push(m); } L.push([g, i]); }
      const tm = new THREE.Mesh(birlestirMat(L), ML); tm.receiveShadow = true; tm.castShadow = GOLGE; A.scene.add(tm); EK.push(tm); TUM.length = 0; if (window.PLT_DBG) window.PLT_DBG.plat = tm; }
    HM = null; HQ = null;
    if (ana && B.hareket) {   // v9.0: ana oyunda hareket ana oyunun kendi yolu (slide: asansor/kayan, spin: donen)
      HQ = A.PLS[adaKat[B.ada[0].id][0]]; const h = B.hareket;
      if (h.tip === 'asansor') { HQ.asn = { a: h.a || 1.4, h: h.h || 0.85 }; HQ.ah = 0; HQ.yb = 0; }
      else if (h.tip === 'kay') { HQ.kay = { a: h.a || 2, h: h.h || 0.8 }; HQ.ph = 0; HQ.cx = HQ.x; }
    }
    if (!ana && B.hareket && TUM0.length) {   // v8.7 (Adem 19 Kas: donen, asansor, kayan platform yoktu): ana platform hareketli
      const ML = [], L = []; for (const [g, m] of TUM0) { let i = ML.indexOf(m); if (i < 0) { i = ML.length; ML.push(m); } L.push([g, i]); }
      HM = new THREE.Mesh(birlestirMat(L), ML); HM.receiveShadow = true; A.scene.add(HM); EK.push(HM); TUM0.length = 0;
      HQ = A.PLS[adaKat[B.ada[0].id][0]]; HQ.mesh = HM; const h = B.hareket;
      if (h.tip === 'asansor') { HQ.asn = { a: h.a || 1.4, h: h.h || 0.85 }; HQ.ah = 0; HQ.yb = 0; }
      else if (h.tip === 'kay') { HQ.kay = { a: h.a || 2, h: h.h || 0.8 }; HQ.ph = 0; HQ.cx = HQ.x; }
      else if (h.tip === 'don') A.SIRK.mesh = HM;
    }
    // ek ayaklarin dibinde yumusak temas golgesi (ana ayaginki gibi): hepsi tek mesh, tek cizim
    if (LEKE.length) {
      const gs = LEKE.map(([x, z, r]) => { const g = new THREE.PlaneGeometry(r * 2, r * 2); g.rotateX(-Pi / 2); g.translate(x, A.GY + 0.03, z); return [g.toNonIndexed(), 0]; });
      const m = new THREE.Mesh(birlestirMat(gs), LEKEMAT); m.renderOrder = 2; A.scene.add(m); EK.push(m); LEKE.length = 0;
    }
    // parcalar
    let tepe = 0, rmax = 0;
    for (const p of B.parca) {
      const [aid, ki] = String(p.p || (B.ada[0].id + '.0')).split('.'), pi = adaKat[aid][+ki || 0], kat = A.PLS[pi];
      const t = A.SEK.TUR[p.t]; if (!t) { console.warn('pilot: bilinmeyen tur', p.t); continue; }
      const y0 = p.y != null ? p.y : (kat.ust != null ? kat.ust : kat.cy), q = new CANNON.Quaternion(); q.setFromEuler((p.rx || 0) * D2R, (p.ry || 0) * D2R, (p.rz || 0) * D2R, 'YXZ');
      const c = A.parcaKur(tur(p.t), pi, (h) => [p.x, y0 + h / 2 + 0.003, p.z], q);
      c.pid = p.id || p.t;
      if (p.bos && p.t === 'ksKemer') kemerBos(c);
      if (p.kutu) { const b = c.body, h = S / 2; while (b.shapes.length) b.removeShape(b.shapes[0]); b.addShape(new CANNON.Box(new CANNON.Vec3(h, h, h))); b.updateMassProperties(); b.aabbNeedsUpdate = true; }   // v8.6: fici kutu carpismali (duvar bolumleri)
      if (p.km) { c.body.mass *= p.km; c.body.updateMassProperties(); }   // v8.4: parca basina kutle carpani (resim bolumlerinde 3 sira tas)   // v8.3: kemer acikligi gercek bosluk (top icinden gecer)
      if (t.govde) Object.assign(c.body, t.govde);   // tur basina govde ayari (domino: az sonum, gec uyku)
      const esik = p.kir != null ? p.kir : t.carp;
      if (esik) carpmaKir(c, esik);
      if (p.patlama) { c.patlama = p.patlama; PATLAYAN.push(c); }
      if (p.ezil) ezilKir(c, p.ezil);   // agir bir parca (devrilen dikili tas) ya da top carpinca ezilir
      if (p.patlarKir) c.pkir = 1;   // ezilme: kutlesi 2.5'ten buyuk hareketli bir govde (devrilen dikili tas, top) esikten hizli carparsa parca kirilir (sunak)
  // v8.3: ksKemer'in carpisma kutusu tam kutuydu (acikligi gorunuste vardi, fizikte yoktu). Yalniz 'bos' isaretli parcada:
  // iki ayak + acikligin ustundeki tas (kemer.glb olculeri: aciklik yarim genislik 0.62 S, tepe 0.46 S govde ortasindan).
  function kemerBos(c) {
    const b = c.body, s = S;
    while (b.shapes.length) b.removeShape(b.shapes[0]);
    for (const sx of [-1, 1]) b.addShape(new CANNON.Box(new CANNON.Vec3(0.44 * s, s, 0.5 * s)), new CANNON.Vec3(sx * 1.06 * s, 0, 0));
    b.addShape(new CANNON.Box(new CANNON.Vec3(0.62 * s, 0.35 * s, 0.5 * s)), new CANNON.Vec3(0, 0.65 * s, 0));
    b.updateMassProperties(); b.aabbNeedsUpdate = true;
  }
  function ezilKir(c, esik) {
    c.body.addEventListener('collide', (e) => {
      const g = A.g; if (!g || !g.armed || c.out || c.gone || c.kq || e.body.mass < 2.5) return;
      if (Math.abs(e.contact.getImpactVelocityAlongNormal()) > esik) { c.kq = 1; KUYRUK.push(c); }
    });
  }
  // buyuk patlamada parcalanir (or. ince kosk sutunlari)
      if (p.devril || t.devril) c.devril = p.devril || t.devril;
      if (p.merkez) c.merkez = p.merkez;
      if (t.yatik) c.yatik = 1;   // uzun tas: top degince kaymaz, devrilir
      const h = t.h * S, w = Math.max(t.w, t.d) * S / 2; tepe = Math.max(tepe, y0 + h);
      for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) pts.push([p.x + sx * w, y0 + h + 0.2, p.z + sz * w]);
    }
    const ky = (B.kam && B.kam.yaw || 0) * D2R; let on = 0;
    for (const q of pts) { rmax = Math.max(rmax, Math.hypot(q[0], q[2])); on = Math.max(on, q[0] * Math.sin(ky) + q[2] * Math.cos(ky)); }
    { let s0 = 1e9, s1 = -1e9; const rx = Math.cos(ky), rz = -Math.sin(ky); for (const q of pts) { const d = q[0] * rx + q[2] * rz; s0 = Math.min(s0, d); s1 = Math.max(s1, d); } HEDEF[0] = rx * (s0 + s1) / 2; HEDEF[1] = rz * (s0 + s1) / 2; }   // kamera hedefi: yapinin ekrandaki yatay ortasi
    if (B.hareket) {   // hareketin bütün yolu kameraya sigsin
      const h = B.hareket, ek = [];
      if (h.tip === 'asansor') for (const q of pts) ek.push([q[0], q[1] - (h.a || 1.4), q[2]]);
      if (h.tip === 'kay') for (const q of pts) { ek.push([q[0] + (h.a || 2), q[1], q[2]]); ek.push([q[0] - (h.a || 2), q[1], q[2]]); }
      if (h.tip === 'don') for (const q of pts) for (let i = 1; i < 8; i++) { const a = i * Pi / 4, c = Math.cos(a), s2 = Math.sin(a); ek.push([q[0] * c + q[2] * s2, q[1], -q[0] * s2 + q[2] * c]); }
      for (const q of ek) { pts.push(q); rmax = Math.max(rmax, Math.hypot(q[0], q[2])); }
      on = Math.max(on, ...ek.map((q) => q[0] * Math.sin(ky) + q[2] * Math.cos(ky)));
    }
    CERCEVE = pts; A.R = rmax; A.RZ = on; A.RZB = rmax; A.TOPY = tepe;   // RZ: kameraya dogru en on nokta (top arabasinin yeri buna gore)
    ortala(); if (!ana) suAyak(); A.TC.aimYaw = A.TC.yaw = Math.PI + A.CAZ;
    if (A.TC.pad) { A.TC.pad.visible = false; if (A.TC.rim2) A.TC.rim2.visible = false; }   // yukseltilmis kamerada arabanin beyaz kaidesi gorunuyordu; normal bolumlerde gorunmez
    A.bolumBasla(Y);
    if (B.hareket && B.hareket.tip === 'don') { A.g.don = B.hareket.w || 0.4; if (B.hareket.hemen) A.g.donHemen = 1; }   // v9.2: 3B sekil bastan doner (her yuzu gorunsun)   // v8.7: ilk atistan sonra yavasca doner
    if (!ana) { ayakDibi(); hoyuk(); if (B.kaide === 'mor') elmasSus(); }
    if (RESIM) oturt();
  }
  // v8.3: resim bolumleri oyuncu gormeden once oturtulur: bloklar 3 sn fizikle yerine iner (siralar arasi 3 mm bosluk + temas sikismasi
  // ilk atista ~6 cm cokme gibi gorunuyordu), sonra hiz sifirlanir ve uyutulur. Kirilma/dusme sayimi bu sirada kapali (g.armed yok).
  function oturt() {
    const C = A.cubes.filter((c) => !c.gone && !c.out);
    if (DUVAR) {   // v8.6: 9-10 sira yuksek duvarlar (her derinlik sirasi ayri ince duvar) ilk uyanista esniyordu
      A.world.solver.iterations = 18;   // v8.7: 24 seri atista agirdi
      for (const c of C) { c.body.angularDamping = 0.45; c.body.linearDamping = 0.08; }
    }
    for (const c of C) c.body.wakeUp();
    for (let i = 0; i < 360; i++) A.world.step(1 / 120);
    for (const c of C) { c.body.velocity.set(0, 0, 0); c.body.angularVelocity.set(0, 0, 0); c.body.sleep(); c.mesh.position.copy(c.body.position); c.mesh.quaternion.copy(c.body.quaternion); }
  }
  // v8.3: kaidenin on kusaginin ortasinda altin elmas susu (resimdeki gibi)
  let SUS = null;
  function elmasSus() {
    const k = B.ada[0].katlar[0];
    if (!SUS) { SUS = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), MOR[2]); SUS.scale.set(1.25, 0.8, 0.35); }
    SUS.position.set(B.ada[0].x || 0, k.ust - 0.58, (k.rz || k.r) + 0.17); (HM || A.scene).add(SUS);
  }
  // kamera hedefini yapinin ekrandaki yatay ortasina kaydir (perspektif yuzunden tek seferde olmaz: 3 tur)
  const VV = new THREE.Vector3();
  function ortala() {
    for (let i = 0; i < 4; i++) {
      A.fit(); if (!CERCEVE) return;
      let x0 = 9, x1 = -9; for (const p of CERCEVE) { VV.set(p[0], p[1], p[2]).project(A.cam); x0 = Math.min(x0, VV.x); x1 = Math.max(x1, VV.x); }
      const xc = (x0 + x1) / 2; if (Math.abs(xc) < 0.01) break;
      const cam = A.cam, hw = Math.hypot(cam.position.x - HEDEF[0], cam.position.z - HEDEF[1]) * Math.tan(cam.fov * Pi / 360) * cam.aspect, ky = A.CAZ;
      HEDEF[0] += Math.cos(ky) * xc * hw; HEDEF[1] += -Math.sin(ky) * xc * hw;
    }
  }
  addEventListener('resize', () => { if (CERCEVE) { ortala(); suAyak(); } });
  // v8.7 (Adem 19 Kas): denizde platform ayagi tabaniyla suyun ustunde 'emanet gibi' duruyordu: ayak suya gomulu, yalniz duz direk;
  // suya girdigi yerde ince kopuk halkasi. Kumda/karda/cimende eski taban kalir. Su: fonun zemini 'su' ya da ayak resimdeki su cizgisinin otesinde.
  let KOPUK = null;
  function suAyak() {
    const L = A.LEG; if (!L.visible || !B) return;
    const az = B.ada[0].z || 0, su = A.fonZem() === 'su' || (A.ZW > -1e8 && A.ZW > az);
    const [pole, collar, base, ring, cap] = L.children;
    for (const o of [base, ring, cap]) if (o) o.visible = !su;
    for (const o of EK) if (o.material === AYAKG) o.visible = !su;
    if (su) {   // direk alt ucu su yuzunde (GY) kesilir
      const top = pole.position.y + pole.scale.y / 2, bot = A.GY; pole.scale.y = Math.max(0.05, top - bot); pole.position.y = (top + bot) / 2; L.userData.bot = bot;
      if (!KOPUK) {
        const g = new THREE.PlaneGeometry(3.2, 3.2); g.rotateX(-Pi / 2);
        KOPUK = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, map: A.canvasTex(128, 128, (x, w, h) => { const gr = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.17, 'rgba(255,255,255,0)'); gr.addColorStop(0.22, 'rgba(255,255,255,.95)'); gr.addColorStop(0.36, 'rgba(225,246,255,.55)'); gr.addColorStop(0.6, 'rgba(210,240,255,.15)'); gr.addColorStop(1, 'rgba(210,240,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); }) }));
        KOPUK.renderOrder = 3;
      }
      KOPUK.position.set(L.position.x, A.GY + 0.02, L.position.z); A.scene.add(KOPUK);
    } else if (KOPUK) A.scene.remove(KOPUK);
  }
  // karli fonda ana ayagin dibindeki kar yigini 22 ayri kure (22 cizim): pilotta tek mesh'e birlestirilir (gorunus ayni)
  // v5.7 (Adem: kaide suya girmiyor, kuma batmiyor; daha gercekci dursun): pilotta ayak tabansiz, yerde duz kesilmis ince direkti (havada duruyordu).
  // Referans oyunlardaki gibi: ince govde + yere basan genis taban (oyunun kendi ayak tabani: kaide, halka, baslik) + tabanin altinda yumusak temas golgesi.
  // Su birikintisi, kum yigini, uzun direk ve adacik denendi; Adem begenmedi.
  let AYAKG = null;
  function ayakDibi() {
    const L = A.LEG; if (!L.visible) return;
    const kat = B.ada[0].katlar[0], alt = kat.ust - (kat.kal || 0.75);
    A.setLeg(0, L); A.legBoy(L, alt + 0.75);
    for (const n of [2, 3, 4]) if (L.children[n]) L.children[n].visible = true;
    const md = L.userData.mound, sh = L.userData.shade; if (md) md.visible = false; if (sh) sh.visible = false; if (A.HAVUZ) A.HAVUZ.visible = false;
    const g = new THREE.PlaneGeometry(8.4, 6.2); g.rotateX(-Pi / 2); g.translate(L.position.x, A.GY + 0.03, L.position.z + 0.25);
    if (!AYAKG) AYAKG = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, map: A.canvasTex(128, 128, (x, w, h) => { const gr = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(45,28,12,.78)'); gr.addColorStop(0.42, 'rgba(45,28,12,.5)'); gr.addColorStop(0.75, 'rgba(45,28,12,.16)'); gr.addColorStop(1, 'rgba(45,28,12,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); }) });
    const m = new THREE.Mesh(g, AYAKG); m.renderOrder = 2; A.scene.add(m); EK.push(m);
  }
  function hoyuk() {
    const md = A.LEG.userData.mound; if (!md || !md.visible || !md.children.length) return;
    md.updateMatrixWorld(true); const gs = [];
    for (const c of md.children) { const g = c.geometry.clone(); g.applyMatrix4(c.matrixWorld); gs.push([g.index ? g.toNonIndexed() : g, 0]); }
    const m = new THREE.Mesh(birlestirMat(gs), md.children[0].material); m.receiveShadow = true; A.scene.add(m); EK.push(m); md.visible = false;
  }
  // sert dusme kirilmasi: parca sabit bir yuzeye (platform, zemin, kopru, ayak) esikten hizli carparsa kirilir.
  // Top degince kirilmaz (KIRILGAN'da degil): once devrilir/itilir, yere ya da tapinak duvarina carpinca kirilir.
  // Yalniz gercek 'dusus' ya da 'duvara carpma' sayilir: (a) carpma yatay (duvar/yan yuz), (b) parca 60 dereceden fazla devrilmis (yatmis),
  // (c) parca ilk yerinden 0.6'dan fazla asagi inmis. Top parcayi yere bastirinca (dik, yerinde) kirilmaz.
  const UP = new CANNON.Vec3(0, 1, 0), TV = new CANNON.Vec3();
  function carpmaKir(c, esik) {
    const y0 = c.body.position.y;
    c.body.addEventListener('collide', (e) => {
      const g = A.g; if (!g || !g.armed || c.out || c.gone || c.kq || e.body.mass !== 0) return;
      if (Math.abs(e.contact.getImpactVelocityAlongNormal()) <= esik) return;
      c.body.quaternion.vmult(UP, TV);
      if (Math.abs(e.contact.ni.y) < 0.6 || TV.y < 0.5 || c.body.position.y < y0 - 0.6) { c.kq = 1; KUYRUK.push(c); }
    });
  }
  // buyuk patlama (parca basina 'patlama': { r, guc }): TNT kendi platformunda patlayinca (dusup kirilinca degil)
  // r icindeki kirilabilir parcalar (sandik, mucevher, sise, fici...) parcalanir, digerleri patlamadan disari itilir.
  function buyukPatlama(t) {
    const p = t.body.position, { r, guc } = t.patlama;
    for (const o of A.cubes) {
      if (o === t || o.gone || o.out) continue;
      const dx = o.body.position.x - p.x, dy = o.body.position.y - p.y, dz = o.body.position.z - p.z, d = Math.hypot(dx, dy, dz); if (d > r) continue;
      if (A.KIRILGAN.has(o.kind) || o.pkir) { A.breakBlock(o, new THREE.Vector3(dx, dy + 0.5, dz).normalize(), 8); continue; }
      const k = 1 - d / r, m = o.body.mass, dv = guc * (0.35 + 0.65 * k) / Math.max(1, m * 0.6), n = Math.hypot(dx, dz) || 1;
      o.body.wakeUp(); o.body.applyImpulse(new CANNON.Vec3(dx / n * dv * m * 0.85, dv * m * 0.45, dz / n * dv * m * 0.85));
      o.body.angularVelocity.set((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
    }
    A.wakeAll(); if (A.g) A.g.busy = Math.max(A.g.busy, 2.5);
  }
  // uzun tas parcalar (dikili tas, sutun): topun ilk carpmasinda oyunun hiz siniri (yatay 13) onlari buz gibi kaydiriyordu.
  // Vurulan uzun parcanin hareketi devrilmeye cevrilir: alt kenari etrafinda top yonunde 'devril' rad/sn donus, kutle merkezi buna uygun hizda.
  function devrilt() {
    for (const b of A.balls) {
      if (!b.hit || b.pdev || !b.hc) continue; b.pdev = 1; const c = b.hc; if (c.gone || c.out) continue;
      if (c.yatik) { c.body.quaternion.vmult(UP, TV); if (TV.y < 0.5 && !c.kq) { c.kq = 1; KUYRUK.push(c); continue; } }   // yere yatmis tas/domino vurulunca parcalanir (yuksek taban surtunmesi onu itilmez yapiyordu)
      if (!c.devril) continue;
      let dx = b.dir.x, dz = b.dir.z; { const n0 = Math.hypot(dx, dz) || 1; dx /= n0; dz /= n0; }
      if (c.merkez) { const mx = c.merkez[0] - c.body.position.x, mz = c.merkez[1] - c.body.position.z, m = Math.hypot(mx, mz) || 1; dx += mx / m; dz += mz / m; }   // halka tasi: top yonu + halkanin ortasina dogru (ice devrilir)
      const n = Math.hypot(dx, dz) || 1, w = c.devril, h = c.h || 2;
      c.body.velocity.set(dx / n * w * h * 0.42, 0, dz / n * w * h * 0.42); c.body.angularVelocity.set(dz / n * w, 0, -dx / n * w);
      // ustune yuk binen parcalar (lento, cati) bir an kalkar: cannon temas sertligi devrilen tasin donusunu ilk adimda sifirliyordu
      const ust = c.body.position.y + h / 2;
      for (const o of A.cubes) { if (o === c || o.gone || o.out) continue; const q = o.body.position; if (q.y < ust - 0.1 || q.y > ust + 1.4 || Math.hypot(q.x - c.body.position.x, q.z - c.body.position.z) > 1.9) continue;
        o.body.wakeUp(); o.body.position.y += 0.22; }
      b.body.velocity.set(-dx / n * 2.5, 1.5, -dz / n * 2.5); b.body.position.x -= dx / n * 0.25; b.body.position.z -= dz / n * 0.25;   // top enerjisini devrilmeye verdi: geri seker, tasi itmeye/kaldirmaya devam etmez
    }
  }
  // top kameraya yakin cikar: namludan ciksaydi ekranda ne kadar gorunecekse o kadar gorunsun (kamera uzakligi / namlu uzakligi olcegi)
  function topOlcek() {
    if (!D0) return; const kp = A.cam.position;
    for (const b of A.balls) { if (b.t > 0.4) continue; const k = Math.min(1, b.mesh.position.distanceTo(kp) / D0); if (k < 1) b.mesh.scale.setScalar(k);
      for (const p of b.trail) { const kk = Math.min(1, p.m.position.distanceTo(kp) / D0); if (kk < 1) p.m.scale.multiplyScalar(kk); } }
  }
  function kare() {
    if (HQ && HQ.kay) { A.LEG.position.x = HQ.cx; if (KOPUK) KOPUK.position.x = HQ.cx; }
    devrilt(); topOlcek();
    for (const c of PATLAYAN) { if (c.patladi) continue; if (c.out && !c.oncedus) { c.patladi = 1; buyukPatlama(c); } c.oncedus = c.gone; }
    if (!KUYRUK.length) return;
    const g = A.g;
    let sp = null;
    while (KUYRUK.length) { const c = KUYRUK.pop(); if (c.out) continue; sp = c.body.position.clone(); A.breakBlock(c, null, 10); }
    A.wakeAll(sp); if (g) g.busy = Math.max(g.busy, 1);
  }
  function zemin(x, z) {   // dusen kirintilar icin: noktanin altindaki en yuksek kat yuzu
    let y = -1e9; for (const q of KATLAR) if (q.ust > y && icinde(q.P, x, z)) y = q.ust;
    return y > -1e8 ? y : A.GY;
  }

  // ---------- kartlar (kayit yok) ----------
  function sonraki() { const i = SIRA.indexOf(N); return SIRA[(i + 1) % SIRA.length]; }
  function kart(baslik, kirmizi, govde) {
    A.modal('<div class="rib' + (kirmizi ? ' r' : '') + '">' + baslik + '</div>' + govde + '<button class="btn" id="p-tekrar">Tekrar</button><button class="btn o kck" id="p-sonraki">Sonraki Pilot (' + sonraki() + ')</button>');
    document.getElementById('p-tekrar').onclick = () => { A.sfx('tik'); A.start(A.LV); };
    document.getElementById('p-sonraki').onclick = () => { A.sfx('tik'); location.search = '?pilot=' + sonraki(); };
  }
  function kazan() { const g = A.g; kart('Pilot ' + N + ' tamam!', false, '<h2>' + (B ? B.ad : '') + '</h2><div class="stat"><div>ATILAN TOP<b>' + (g.max - g.shots) + '</b></div><div>KALAN TOP<b>' + g.shots + '</b></div></div><p>Deneme bölümü: ilerleme ve altın kaydedilmez.</p>'); }
  function kaybet() { const g = A.g; A.sfx('lose'); kart('Toplar bitti!', true, '<h2>' + g.left + ' parça kaldı</h2><p>Deneme bölümü: ilerleme kaydedilmez.</p>'); }

  // v9.0 ana kip: sekil bolumunden normal bolume gecerken pilotun degistirdigi ortak ayarlar geri alinir
  function birak() {
    for (const o of EK) { A.scene.remove(o); o.geometry.dispose(); } EK.length = 0;
    if (KOPUK) A.scene.remove(KOPUK); if (SUS && SUS.parent) SUS.parent.remove(SUS);
    A.world.solver.iterations = 14; A.kamera(9 * D2R, 0);
    if (A.TC.pad) { A.TC.pad.visible = true; if (A.TC.rim2) A.TC.rim2.visible = true; }
    CERCEVE = null; B = null; HQ = null; HM = null; KUYRUK.length = 0; PATLAYAN.length = 0; KATLAR = [];
  }
  // v9.0 ana kip: bolumun verisi ve Blender modelleri bolum kurulmadan once iner
  async function onyukle(n) {
    if (HAZ.has(n)) return; const V = await veriAl(n), b = V && V.bolumler && V.bolumler[n];
    if (b && PS.yukle) await PS.yukle(b.parca.map((p) => tur(p.t)));
    if (b) HAZ.add(n);
  }
  async function yukle() {
    VERI = await veriAl(N);
    if (DUVAR && VERI) SIRA = VERI.sira;
    B = VERI && VERI.bolumler && VERI.bolumler[N] || null;
    if (B) Y = { veri: 1, engel: [], ad: B.ad, top: B.top, make: () => [] };
    if (B && PS.yukle) await PS.yukle(B.parca.map((p) => p.t));   // v5.6: Blender bloklarinin model dosyalari
    window.PLT_DBG = { world: A.world, B, ad: (b) => { const c = A.cubes.find((q) => q.body === b); return c ? c.pid : null; } };
  }
  return { birak, onyukle, hazir: (n) => HAZ.has(n), get aktif() { return !!B; }, get ustY() { return B && B.ada ? B.ada[0].katlar[0].ust : 0; }, get L() { return N || 1; }, get Y() { return Y; }, yukle, kur, kare, zemin, cerceve: () => CERCEVE, hedef: HEDEF, get genis() { return B && B.kam && B.kam.genis || 0.74; }, kazan, kaybet,
    // top cikis noktasi: kameradan namluya giden isin uzerinde (ekranda yine namlunun agzinda gorunur), 'atis' orani kadar kameraya yakin.
    // Alcak namludan cikan top derin yapida on siradaki parcalara takiliyordu; boylece atis hatti oyuncunun bakis hattina yaklasir.
    cikis(st, kp) { const k = B && B.kam && B.kam.atis != null ? B.kam.atis : 0.5; D0 = st.distanceTo(kp); st.lerp(kp, k); } };
}
