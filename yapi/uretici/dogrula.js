// Foxi Smash v5.0: bolum dogrulayici. Oyun ?test kipinde acilir (dogrula.py), bu modul sayfada calisir.
// Her bolum: arketip.js ile uretilir -> oyunun kendi fizigiyle kurulur -> 1) kendi kendine durur mu (havada/coken blok)
// 2) bot yapiyi kac topta yikar. Hatali cikan bolum yeni tohumla yeniden uretilir. Sonuc: kaydedilecek bolum verisi + rapor.
import { bolumUret, imza, topHesap } from './arketip.js?v=2';

const YP = () => window.YP;
const S = 1.55;

// 1) durgunluk: tum bloklar uyandirilir, 2.5 sn beklenir; dusen ya da devrilen/kayan blok varsa hata
function durgunluk() {
  const P = YP(), q0 = P.PLS.map((q) => ({ x: q.body.position.x, y: q.body.position.y, z: q.body.position.z })), bas = P.cubes.map((c) => ({ x: c.body.position.x, y: c.body.position.y, z: c.body.position.z, pi: c.pi }));
  for (const c of P.cubes) c.body.wakeUp();
  P.run(2.5, true);
  let dus = 0, kay = 0;
  P.cubes.forEach((c, n) => {
    if (c.gone || c.out) { dus++; return; }
    const q = P.PLS[c.pi] || P.PLS[0], a = bas[n], o = q0[c.pi] || q0[0];
    const dx = (c.body.position.x - q.body.position.x) - (a.x - o.x), dy = (c.body.position.y - q.body.position.y) - (a.y - o.y), dz = (c.body.position.z - q.body.position.z) - (a.z - o.z);
    if (Math.hypot(dx, dy, dz) > 0.35 * S) kay++;
  });
  return { dus, kay };
}
// 2) bot: kalan bloklardan en alcak ve ondekini hedefler; az blok kalinca tek tek
function hedef() {
  const P = YP(), k = P.cubes.filter((c) => !c.gone && !c.out);
  if (!k.length) return null;
  let zs = k.map((c) => c.body.position.z).sort((a, b) => a - b), zm = zs[Math.floor(zs.length / 2)];
  const on = k.filter((c) => c.body.position.z >= zm - 0.01);
  const cx = k.reduce((s, c) => s + c.body.position.x, 0) / k.length;
  on.sort((a, b) => (a.body.position.y - b.body.position.y) * 2 + (Math.abs(a.body.position.x - cx) - Math.abs(b.body.position.x - cx)) * 0.6);
  const t = k.length <= 6 ? k.sort((a, b) => a.body.position.y - b.body.position.y)[0] : on[0];
  return t.body.position;
}
function bot(sinir) {
  const P = YP(); let n = 0;
  P.g.shots = 999; P.g.max = 999;
  for (; n < sinir; n++) {
    if (P.g.state !== 'play') break;
    const h = hedef(); if (!h) break;
    P.run(0.25, true);
    if (!P.shoot(h.x, h.y, h.z)) { P.run(0.3, true); if (!P.shoot(h.x, h.y, h.z)) break; }
    // top ve yikilma bitene kadar
    for (let t = 0; t < 12; t++) { P.run(0.25, true); if (P.g.state !== 'play') break; if (!P.balls.length && P.cubes.every((c) => c.gone || c.out || c.body.sleepState === 2 || c.body.velocity.lengthSquared() < 0.04)) break; }
  }
  P.run(1.0, true);
  return { atis: n + (P.g.state === 'win' ? 0 : 0), kazandi: P.g.state === 'win' || P.g.left <= 0, kalan: P.g.left };
}
// top sayisi: bot atislari + zorluga gore pay (bot kusursuz nisan alir, insan almaz)
export async function dogrula(L0, L1, gecmis, opt = {}) {
  const sonuc = [], rapor = { test: 0, yeniden: 0, hata: {} };
  for (let L = L0; L <= L1; L++) {
    let Y = null, dn = 0, son = null;
    for (; dn < (opt.maxDeneme || 12); dn++) {
      Y = bolumUret(L, gecmis, dn); rapor.test++;
      if (!Y) { son = 'uretilemedi'; continue; }
      YP().dene(L, Y);
      const s = durgunluk();
      if (s.dus) { son = 'kendiliginden-dusen'; }
      else if (s.kay > Math.max(1, Y.c.length * 0.05)) { son = 'kayan-coken'; }
      else {
        const b = bot(opt.sinir || 30);   // durgunluktan sonra yapi yerine oturdu: ayni kurulumda bot
        if (!b.kazandi) son = 'cozulemedi';
        else if (b.atis > (opt.botMax || 28)) son = 'cok-top';
        else { Y.L = L; Y.top = topHesap(Y, b.atis); Y.bot = b.atis; delete Y.L; son = null; }
      }
      if (!son) break;
      rapor.hata[son] = (rapor.hata[son] || 0) + 1; rapor.yeniden++;
    }
    if (son) { rapor.basarisiz = (rapor.basarisiz || []).concat(L); }
    console.log('BOLUM', L, Y.a, dn, son || 'ok', Y.bot, Y.top);
    Y.dn = dn; gecmis.push({ a: Y.a, imza: Y.imza || imza(Y) });
    sonuc.push(Y);
  }
  return { sonuc, rapor };
}

// v5.1: kapali bloklari degistirilen kayitli bolumleri yeniden test eder (kapali_test.py).
// isler: [{ L, Y, gecmis }]. Once kayitli (degistirilmis) bolum denenir; gecemezse ayni kurallarla yeni tohumla yeniden uretilir.
// L <= 25 (elle yapilmis) icin Y verilmez: oyunun kendi bolumu (YP.lv) test edilir, yeniden uretilmez.
export async function yenidenTest(isler, opt = {}) {
  const out = [];
  for (const is of isler) {
    const L = is.L; let Y = is.Y, son = null, dn = -1, b = null, hatalar = [];
    if (!Y) { const E = YP().lv(L); Y = Object.assign({}, E, { c: E.make(), el: 1 }); }
    for (; dn < (Y.el ? 0 : (opt.maxDeneme || 12)); dn++) {
      if (dn >= 0) { Y = bolumUret(L, is.gecmis || [], dn); if (!Y) { son = 'uretilemedi'; hatalar.push(son); continue; } }
      YP().dene(L, Y); const top0 = YP().g.max;
      const s = durgunluk();
      if (s.dus) son = 'kendiliginden-dusen';
      else if (s.kay > Math.max(1, Y.c.length * 0.05)) son = 'kayan-coken';
      else {
        b = bot(opt.sinir || 30); b.top0 = top0;
        if (!b.kazandi) son = 'cozulemedi';
        else if (b.atis > (opt.botMax || 28)) son = 'cok-top';
        else son = null;
      }
      if (!son) break;
      hatalar.push(son);
    }
    const r = { L, dn, son, hatalar, bot: b && b.atis };
    if (!son && !Y.el) { Y.L = L; const eski = Y.top; Y.top = topHesap(Y, b.atis); Y.bot = b.atis; delete Y.L; r.top = [eski, Y.top]; r.Y = Y; }
    if (Y.el) { r.top = [b && b.top0]; r.yetti = b ? b.atis <= (b.top0 || 0) : false; }
    console.log('BOLUM', L, dn, son || 'ok', b && b.atis);
    out.push(r);
  }
  return out;
}
