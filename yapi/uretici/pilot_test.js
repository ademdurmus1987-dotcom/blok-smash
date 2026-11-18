// Foxi Smash pilot testleri (sayfa ici). pilot_test.py bu modulu oyun sayfasina yukler.
// Hepsi oyunun kendi fizigi ve kendi atis yoluyla calisir (YP.run, YP.aimAt + YP.shoot ya da gercek pointerdown).
const YP = () => window.YP;
const S = 1.55;

// yerlesik durum ozeti (regresyon karsilastirmasi icin)
export function ozet() {
  const P = YP();
  const tur = {}; for (const c of P.cubes) tur[c.kind || c.col] = (tur[c.kind || c.col] || 0) + 1;
  return { L: P.g.L, n: P.cubes.length, top: P.g.max, R: +P.R.toFixed(3), RZ: +P.RZ.toFixed(3), pls: P.PLS.length, tur };
}

// 1) durgunluk: bloklar uyandirilir, sn saniye atissiz beklenir. Her blogun kendi platformuna gore kaymasi olculur.
export function durgunluk(sn = 2.5, tol = 0.35 * S) {
  const P = YP(), q0 = P.PLS.map((q) => ({ x: q.body.position.x, y: q.body.position.y, z: q.body.position.z }));
  const bas = P.cubes.map((c) => ({ x: c.body.position.x, y: c.body.position.y, z: c.body.position.z }));
  for (const c of P.cubes) c.body.wakeUp();
  P.run(sn, true);
  let dus = 0, kay = 0, enCok = 0, enCokTur = '';
  P.cubes.forEach((c, n) => {
    if (c.gone || c.out) { dus++; return; }
    const q = P.PLS[c.pi] || P.PLS[0], a = bas[n], o = q0[c.pi] || q0[0];
    const d = Math.hypot((c.body.position.x - q.body.position.x) - (a.x - o.x), (c.body.position.y - q.body.position.y) - (a.y - o.y), (c.body.position.z - q.body.position.z) - (a.z - o.z));
    if (d > enCok) { enCok = d; enCokTur = c.kind; }
    if (d > tol) kay++;
  });
  return { dus, kay, enCok: +enCok.toFixed(4), enCokTur };
}

// kurulustaki ic ice girme: tek kucuk adim, dinamik-dinamik ve dinamik-statik temaslarin en derin batmasi
export function ortusme() {
  const D = window.PLT_DBG; if (!D) return null;
  const w = D.world, P = YP();
  for (const c of P.cubes) c.body.wakeUp();
  w.step(1 / 600);
  let enDerin = 0, cift = '', n = 0;
  const pos = (b, r) => [b.position.x + r.x, b.position.y + r.y, b.position.z + r.z];
  for (const e of w.contacts) {
    const a = pos(e.bi, e.ri), b = pos(e.bj, e.rj), d = (b[0] - a[0]) * e.ni.x + (b[1] - a[1]) * e.ni.y + (b[2] - a[2]) * e.ni.z;   // < 0: batma
    n++; if (-d > enDerin) { enDerin = -d; cift = (D.ad(e.bi) || 'statik') + ' / ' + (D.ad(e.bj) || 'statik'); }
  }
  return { temas: n, enDerin: +enDerin.toFixed(4), cift };
}

// 2) bot (dogrula.js ile ayni kural): kalanlardan en alcak ve ondekini hedefler
function hedef() {
  const P = YP(), k = P.cubes.filter((c) => !c.gone && !c.out);
  if (!k.length) return null;
  const zs = k.map((c) => c.body.position.z).sort((a, b) => a - b), zm = zs[Math.floor(zs.length / 2)];
  const on = k.filter((c) => c.body.position.z >= zm - 0.01);
  const cx = k.reduce((s, c) => s + c.body.position.x, 0) / k.length;
  on.sort((a, b) => (a.body.position.y - b.body.position.y) * 2 + (Math.abs(a.body.position.x - cx) - Math.abs(b.body.position.x - cx)) * 0.6);
  const t = k.length <= 6 ? k.sort((a, b) => a.body.position.y - b.body.position.y)[0] : on[0];
  return t.body.position;
}
export function bot(sinir = 30, sinirsiz = true) {
  const P = YP(); let n = 0;
  if (sinirsiz) { P.g.shots = 999; P.g.max = 999; }
  for (; n < sinir; n++) {
    if (P.g.state !== 'play') break;
    const h = hedef(); if (!h) break;
    P.run(0.25, true);
    if (!P.shoot(h.x, h.y, h.z)) { P.run(0.3, true); if (!P.shoot(h.x, h.y, h.z)) break; }
    bekle();
  }
  P.run(1.0, true);
  return { atis: n, kazandi: P.g.state === 'win' || P.g.left <= 0, kalan: P.g.left };
}
function bekle(enCok = 12) {
  const P = YP();
  for (let t = 0; t < enCok; t++) { P.run(0.25, true); if (P.g.state !== 'play') break; if (!P.balls.length && P.cubes.every((c) => c.gone || c.out || c.body.sleepState === 2 || c.body.velocity.lengthSquared() < 0.04)) break; }
}

// ---------------- pilot ----------------
// gercek dokunus yolu: parcanin ekrandaki yeri -> canvas'a pointerdown/pointerup (oyunun kendi aimAt + shoot'u calisir)
export function ekranda(c, dy = 0, dx = 0) {
  const P = YP(), v = new P.THREE.Vector3().copy(c.body.position); v.y += dy; v.x += dx; v.project(P.cam);
  return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight];
}
export function dokun(x, y) {
  const gl = document.getElementById('gl'), o = { clientX: x, clientY: y, pointerId: 7, bubbles: true, isPrimary: true, pointerType: 'touch' };
  const once = YP().g.shots;
  gl.dispatchEvent(new PointerEvent('pointerdown', o)); gl.dispatchEvent(new PointerEvent('pointerup', o));
  return YP().g.shots < once;
}
// adli parcaya dokunarak at; isabet: dokunulan noktadaki ilk parca (raycast) kim?
export function parcayaAt(id, dy = 0) {
  const P = YP(), c = P.cubes.find((q) => q.pid === id && !q.gone && !q.out); if (!c) return { ok: false, neden: 'yok' };
  P.scene.updateMatrixWorld(true);   // test kipinde cizim yok: raycast guncel matrisleri gorsun
  const [x, y] = ekranda(c, dy), p = P.aimAt(x, y);
  let ilk = null; if (p) { let en = 1e9; for (const q of P.cubes) { if (q.gone || q.out) continue; const d = q.body.position.distanceTo(p); if (d < en) { en = d; ilk = q.pid || q.kind; } } }
  P.run(0.3, true);
  const ok = dokun(x, y);
  bekle(16);
  return { ok, x: Math.round(x), y: Math.round(y), nisan: ilk };
}
export function sayim() {
  const P = YP(), o = { kalan: 0, gitti: [] };
  for (const c of P.cubes) { if (c.gone || c.out) o.gitti.push(c.pid || c.kind); else o.kalan++; }
  return o;
}
export function grupKalan(onek) { return YP().cubes.filter((c) => (c.pid || '').startsWith(onek) && !c.gone && !c.out).length; }
export function grupToplam(onek) { return YP().cubes.filter((c) => (c.pid || '').startsWith(onek)).length; }
// ekrandaki ilk isabet (raycast) hangi parca? (gercek dokunusun vuracagi parca)
const RC = { r: null, v: null };
function isabet(x, y) {
  const P = YP(), p = P.aimAt(x, y); if (!p) return null;
  // platform (sabit basamaklar, adalar) parcayi kameradan gizliyorsa gorunmez sayilir
  const pl = window.PLT_DBG && window.PLT_DBG.plat;
  if (pl) { if (!RC.r) { RC.r = new P.THREE.Raycaster(); RC.v = new P.THREE.Vector2(); } RC.v.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); RC.r.setFromCamera(RC.v, P.cam);
    const h = RC.r.intersectObject(pl, false)[0]; if (h && h.distance < P.cam.position.distanceTo(p) - 0.4) return null; }
  let en = 1e9, c0 = null; for (const q of P.cubes) { if (q.gone || q.out) continue; const d = q.body.position.distanceTo(p); if (d < en) { en = d; c0 = q; } }
  return en < 2.2 ? c0 : null;
}
// pilot botu: oyuncu gibi ekrana dokunur. Ekranda gorunen (dokununca kendisine isabet eden) parcalardan ekranda en altta olani,
// parcanin alt yarisina nisan alarak vurur (on-alt parca once). Gercek atis yolu: canvas pointerdown -> aimAt -> shoot.
export function botEkran(sinir = 40, sinirsiz = false) {
  const P = YP(); let n = 0; const iz = [];
  if (sinirsiz) { P.g.shots = 999; P.g.max = 999; }
  for (; n < sinir; n++) {
    if (P.g.state !== 'play' || P.g.shots <= 0) break;
    P.scene.updateMatrixWorld(true);
    const k = P.cubes.filter((c) => !c.gone && !c.out); if (!k.length) break;
    let sec = null, sy = -1, sx = 0;
    for (const c of k) for (const dy of [-0.25 * (c.h || S), 0]) {
      if ((c.bosa || 0) >= 2 && c.bekle > n) break;   // iki kez bosuna vurulan parca birkac atis beklenir (oyuncu da baska yere nisan alir)
      const [x, y] = ekranda(c, dy, c.kind === 'ksKemer' ? 1.06 * S : 0); if (x < 8 || x > innerWidth - 8 || y < 8 || y > innerHeight - 8) continue;
      if (isabet(x, y) !== c) continue;
      if (y > sy) { sy = y; sx = x; sec = c; } break;
    }
    if (!sec) { const c = k.sort((a, b) => a.body.position.y - b.body.position.y)[0]; [sx, sy] = ekranda(c); sec = c; }
    P.run(0.3, true);
    const once = P.g.left;
    if (!dokun(sx, sy)) { P.run(0.3, true); if (!dokun(sx, sy)) break; }
    const top = P.balls[P.balls.length - 1];
    bekle(16); iz.push([sec.pid, once - P.g.left, top && top.hc ? top.hc.pid : (top && top.hit ? '?' : '-')]);
    if (once - P.g.left === 0) { sec.bosa = (sec.bosa || 0) + 1; if (sec.bosa >= 2) sec.bekle = n + 4; } else sec.bosa = 0;
  }
  P.run(1.5, true);
  return { atis: n, kazandi: P.g.state === 'win' || P.g.left <= 0, kalan: P.g.left, verilen: P.g.max, iz };
}
// parcanin dik durmaktan sapmasi (derece): domino/dikili tas devrildi mi
export function egim(c) { const q = c.body.quaternion, up = new (YP().THREE.Vector3)(0, 1, 0).applyQuaternion(new (YP().THREE.Quaternion)(q.x, q.y, q.z, q.w)); return Math.acos(Math.max(-1, Math.min(1, up.y))) * 180 / Math.PI; }
const gitti = (c) => c.gone || c.out;
// ---------------- strateji testleri ----------------
export function strateji(N) {
  const P = YP(), byId = (id) => P.cubes.find((c) => c.pid === id), grup = (o) => P.cubes.filter((c) => c.pid.startsWith(o));
  const kalan = (o) => grup(o).filter((c) => !gitti(c)).length, top = (o) => grup(o).length, atis = [];
  const at = (id, dy = 0) => { const s0 = sayim().kalan, r = parcayaAt(id, dy); r.hedef = id; r.giden = s0 - sayim().kalan; atis.push(r); return r; };
  if (N === 1) {
    // 1. atis: sag yandaki TNT'ye dokun (on-sag kose sandigi kismen onunde). Patlamadiysa ikinci atis ayni yere.
    const o0 = { orta: kalan('orta'), kosk: kalan('kosk'), alt: kalan('alt') };
    at('orta-tnt', 0); if (!gitti(byId('orta-tnt'))) at('orta-tnt', 0);
    P.run(3, true);
    const cati = byId('kosk-cati');
    return { atis, tntPatladi: gitti(byId('orta-tnt')), ortaKusak: [o0.orta - kalan('orta'), top('orta')], kosk: [o0.kosk - kalan('kosk'), top('kosk')], altKusak: [o0.alt - kalan('alt'), top('alt')], catiDustu: gitti(cati) || cati.body.position.y < byId('kosk-altin').body.position.y };
  }
  if (N === 7) {
    // on dikili tasa (dikili-0: iki yaninda lento var) tek atis
    const l0 = kalan('lento'), s0 = kalan('sunak'), dus = () => grup('lento').filter((c) => gitti(c) || c.body.position.y < 3.0).length;
    at('dikili-0', 0.3);
    P.run(3, true);
    return { atis, dikili0Devrildi: gitti(byId('dikili-0')) || egim(byId('dikili-0')) > 45, lentoDustu: [dus(), top('lento')], lentoKirildi: l0 - kalan('lento'), sunak: [s0 - kalan('sunak'), top('sunak')], sunakYikildi: gitti(byId('sunak-tabla')) || byId('sunak-tabla').body.position.y < 1.5 };
  }
  if (N === 13) {
    // ilk dominoya tek atis; zincir sonuna kadar gidiyor mu, TNT patliyor mu
    const d = grup('domino'), kule0 = kalan('kule');
    at('domino-00', 0.4);
    let tnt = -1; for (let t = 0; t < 40; t++) { P.run(0.25, true); if (tnt < 0 && gitti(byId('kule-tnt'))) tnt = t * 0.25; }
    const devrik = d.filter((c) => gitti(c) || egim(c) > 40).length;
    return { atis, domino: [devrik, d.length], dominoSirasi: d.map((c) => gitti(c) ? 'K' : Math.round(egim(c))), tntPatladi: gitti(byId('kule-tnt')), tntSn: tnt, kule: [kule0 - kalan('kule'), top('kule')] };
  }
  return null;
}
export function performans() {
  const r = YP().ren; return { cizim: r.info.render.calls, ucgen: r.info.render.triangles };
}
