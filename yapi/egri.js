// Foxi Smash v8.0 (Adem 18 Kas 2026: '1. bolumle 1000. bolum arasinda fark yok'): zorluk egrisi ve bolum turleri.
// Bu dosya yalniz hesap yapar (oyun durumu, sahne, kayit yok). Hem oyun (oyun.js, merkez.js) hem araclar (uretici/egri_rapor.mjs) kullanir.
// Kapatma: adrese ?egri=0 -> eski top sayisi, eski 'zor bolum' kurali, bolum turleri yok.
//
// YAPI
//  - Dunya: 10 bolum (fonlar zaten 10'arli degisiyor). Her dunyada testere disi: 1. bolum nefes, sona dogru sikisir, 10. bolum ZOR.
//  - Sefer: 50 bolum (5 dunya). Seferin son bolumu KAPTAN BOLUMU (cok zor, buyuk odul), ardindan ALTIN YAGMURU (odul bolumu).
//  - Genel egri: top payi bolum ilerledikce azalir (26. bolumde %100 -> 500. bolumde ~%77 -> 1000. bolumde ~%68 -> 2000'de ~%64).
//    Boylece 1000. bolum 100.'den gercekten zor (tablo: uretici/rapor/egri.md), ama her 10 bolumde bir nefes ve her 50 bolumde bir doruk var.
//  - Bolum turleri (ayni yapilar, farkli hedef):
//      normal  : butun kupleri dusur
//      hazine  : isaretli hazine kuplerini dusur (gerisi kalabilir); top az
//      zincir  : tek atista 6 kup dusurene top geri gelir; top az
//      kaptan  : seferin son bolumu; top en dar, odul +50 ve hediye guclendirici
//      altin   : odul bolumu; top bol, dusen her kup +1 altin
//  - Foxi yardimi: ayni bolumu 2 kez kaybeden +2, 4 kez +4, 6 kez +6 top ile baslar (oyuncu bezip birakmasin).

export const AYAR = {
  dunya: 10, sefer: 50,
  // genel egri: k(L) = 1 - EGIM * (1 - e^(-(L-25)/OLCEK))
  egim: 0.36, olcek: 420,
  // dunya icindeki yer (L % 10): 1 nefes ... 0 zor
  testere: [0.86, 1.18, 1.06, 1.0, 0.98, 0.95, 1.0, 0.96, 0.94, 0.97],
  araZor: 0.9,        // 3. seferden sonra tek dunyalarin 5. bolumu de zor (orta doruk)
  kaptan: 0.82,
  tur: { normal: 1, hazine: 0.62, zincir: 0.8, kaptan: 1, altin: 1.35 },
  taban: { normal: 0.7, hazine: 0.55, zincir: 0.7, kaptan: 0.72, altin: 0.8 },   // en az: botun atisinin bu kadari (bot kusursuz nisan alir)
  tabanAz: 0.12,
  enAz: { normal: 7, hazine: 5, zincir: 6, kaptan: 8, altin: 10 },
  enCok: 30,
  tanit: { hazine: 34, zincir: 47 },   // turlerin ilk ciktigi bolum (ilk kez 'Yeni bolum turu!' karti)
  zincirEsik: 6,
  odul: { zor: 20, cokzor: 35, kaptan: 50 },
  altinTavan: 60,
  yardim: [[6, 6], [4, 4], [2, 2]]   // [kayip sayisi, ek top]
};

const sabit = (x) => Math.round(x * 1000) / 1000;
export const seferNo = (L) => Math.floor((L - 1) / AYAR.sefer) + 1;
export const dunyaIci = (L) => ((L - 1) % AYAR.dunya) + 1;   // 1..10
export const genel = (L) => sabit(1 - AYAR.egim * (1 - Math.exp(-Math.max(0, L - 25) / AYAR.olcek)));

// bolumun plani: yalniz bolum numarasindan (harita, kart ve oyun ayni sonucu gorur)
const HAZINE = typeof location !== 'undefined' && new URLSearchParams(location.search).get('hazine') === '1';
export function plan(L, el = 25) {
  if (L <= el) return { L, tip: 'normal', etiket: L >= 5 && L % 5 === 0 ? 'zor' : null, el: 1 };
  const p = L % AYAR.dunya, s = seferNo(L), dn = Math.floor((L - 1) / AYAR.dunya);
  let tip = 'normal', etiket = null;
  if (L % AYAR.sefer === 0) { tip = 'kaptan'; etiket = 'cokzor'; }
  else if (p === 0) etiket = s >= 8 && dn % 2 === 1 ? 'cokzor' : 'zor';   // ileri seferlerde her 20 bolumde bir 'cok zor'
  else if (L % AYAR.sefer === 1 && L > AYAR.sefer) tip = 'altin';
  else if (p === 5 && s >= 3 && dn % 2 === 1) etiket = 'zor';
  else if (p === 4 && L >= AYAR.tanit.hazine) tip = dn % 2 ? 'zincir' : 'hazine';
  else if (p === 7 && L >= AYAR.tanit.zincir) tip = dn % 2 ? 'hazine' : 'zincir';
  const tanidik = (t) => L >= AYAR.tanit[t];
  if ((tip === 'hazine' || tip === 'zincir') && !tanidik(tip)) { const o = tip === 'hazine' ? 'zincir' : 'hazine'; tip = tanidik(o) ? o : 'normal'; }   // henuz tanitilmayan tur yerine digeri
  if (tip === 'hazine' && !HAZINE) tip = 'normal';   // v10.27 (Adem: 'sari kareler var, kaldiralim'): isaretli hazine avi bolumu kapali, normal bolum. Eski: ?hazine=1
  return { L, tip, etiket, sefer: s, yer: p || 10 };
}

// bolum verisiyle uyum: hazine avi anahtarli kapi ve tahterevalli bolumlerinde zincir olur
export function planY(L, Y, el = 25) {
  const P = plan(L, el);
  if (P.tip === 'hazine' && Y && ((Y.engel || []).some((e) => e.t === 'kapi2' || e.t === 'giyotin') || Y.denge || Y.anahtar)) P.tip = 'zincir';
  return P;
}

// top sayisi. v: kayitli bolum { c, engel, pl, don, denge, bot, zor }
const SERT = new Set(['ksTas3', 'ksTas4', 'oyA', 'ksTas', 'ksTas2', 'ksKemer', 'ksYildiz', 'ksSutun', 'tas2', 'tas4', 'tug2', 'tug3', 'mermer', 'kkA', 'altin']);
export function topSay(L, v, P = planY(L, v)) {
  const n = v.c.length, sert = v.c.filter((c) => SERT.has(c[3])).length;
  const hareket = (v.pl && v.pl.some((p) => p.kay || p.asn) ? 1 : 0) + (v.don || v.denge ? 1 : 0);
  let t = n / 2.9 + 3 + sert / 6 + (v.engel || []).length + hareket;   // yapinin kendi yuku (eski topHesap temeli, zorluk carpani yok)
  let k = AYAR.testere[L % AYAR.dunya];
  if (P.tip === 'kaptan') k = AYAR.kaptan; else if (P.etiket && L % AYAR.dunya === 5) k = AYAR.araZor;
  if (P.etiket === 'cokzor' && P.tip !== 'kaptan') k *= 0.95;
  t *= genel(L) * k * AYAR.tur[P.tip];
  const taban = Math.ceil((v.bot || 0) * AYAR.taban[P.tip] * (1 - AYAR.tabanAz * Math.min(1, Math.max(0, L - 25) / 1000)));   // ileri bolumde oyuncu yapiyi tanir: alt sinir biraz iner
  return Math.max(AYAR.enAz[P.tip], Math.min(AYAR.enCok + (P.tip === 'altin' ? 6 : 0), Math.max(Math.round(t), taban)));
}

// hazine avinda kac hedef: yapinin buyuklugune gore 3-6
export const hedefSay = (n) => Math.max(3, Math.min(6, Math.round(n / 9)));

// ayni bolumde ust uste kayip -> ek top
export function yardim(kayip) { for (const [k, e] of AYAR.yardim) if (kayip >= k) return e; return 0; }

// ilk kazanc odulu (altin) - zor etiketi ve kaptan
export function odul(P) { return P.tip === 'kaptan' ? AYAR.odul.kaptan : P.etiket ? AYAR.odul[P.etiket] : 0; }

// arayuz yazilari
export const TUR = {
  normal: { ad: '', hedef: 'Bütün küpleri platformdan düşür!' },
  hazine: { ad: 'Hazine Avı', hedef: 'Parlayan hazine küplerini düşür, gerisi kalabilir!', ic: '🎯', yeni: 'Yalnız parlayan hazineleri düşürmen yeter. Top az, iyi nişan al!' },
  zincir: { ad: 'Zincir Atış', hedef: 'Tek atışta ' + AYAR.zincirEsik + ' küp düşür, top geri gelsin!', ic: '⛓️', yeni: 'Top az ama tek atışta ' + AYAR.zincirEsik + ' küp düşürürsen top geri gelir. Yapının altını vur!' },
  kaptan: { ad: 'Kaptan Bölümü', hedef: 'Seferin son kalesi! Bütün küpleri düşür.', ic: '☠️' },
  altin: { ad: 'Altın Yağmuru', hedef: 'Düşen her küp +1 altın! Bol top, keyfine bak.', ic: '🪙' }
};
export const ETIKET = { zor: 'Zor bölüm', cokzor: 'Çok zor bölüm' };

// v9.0 (19 Kas 2026): ana oyunun arasina serpistirilen sekil bolumleri (pilot/sira.js). bot: oyuncu botunun ortalama atisi (yay atis, hareketsiz).
// Top: botun atisi x1.2 x genel egri + 2 (hareketli platformda +2); en az botun %75'i (normal bolumlerin tabani gibi), en az 12.
export function sekilTop(L, bot, hareket) {
  const k = genel(L) * AYAR.testere[L % AYAR.dunya];
  return Math.max(12, Math.round(bot * 1.2 * k) + 2 + (hareket && hareket !== 'sabit' ? 2 : 0), Math.ceil(bot * 0.75));
}
