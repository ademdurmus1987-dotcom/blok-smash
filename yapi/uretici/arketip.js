// Foxi Smash v5.0 (Adem 15 Kas 2026): arketip tabanli bolum uretici.
// Oyun bu dosyayi CALISTIRMAZ: bolumler bir kez uretilir (uret.mjs), fizikle test edilir (dogrula.py) ve yapi/bolumler/*.json olarak kaydedilir.
// Toplam bolum sayisi artirilinca ayni kodla yeni bolumler uretilebilir (ayni tohum -> ayni bolum).
// Hucre: [i, j, k, tur, platform]. i: parcanin orta noktasi (kup cinsinden), j: alt kenari, k: derinlik ortasi.

import { kaleYapi, hazineYapi } from '../kale.js';
import { kapaliMi, kapaliUygula } from '../kapali.js';   // v5.1: kapali bloklar uretilmez

// ---------------- olculer (sekil.js ve kale.js TUR tablosuyla ayni) ----------------
const OLCU = {
  tas2: [2, 1], tas4: [4, 1], buzP3: [3, 1], ahsapD: [1, 2], kvP: [1, 2], kvT: [1, 2], kvM: [1, 2], raf2: [2, 0.5], raf3: [3, 0.5], disk: [1, 0.5],
  cik2: [2, 1], tug2: [2, 1], tug3: [3, 1], kur: [1, 0.5], mkP: [1, 0.5], mkY: [1, 0.5], mkM: [1, 0.5], kemik: [2, 1],
  ksKalas1: [1, 0.5], ksKalas2: [2, 0.5], ksKalas3: [3, 0.5], ksTas2: [2, 1], ksKemer: [3, 2], ksSutun: [1, 2], ksMorSutun: [1, 2],
  ksTas3: [3, 1], ksTas4: [4, 1], ksBuz3: [3, 1], ksDirek: [1, 2]
};
export const olcu = (t) => OLCU[t] || [1, 1];
// sert (topla kirilmaz, agir) ve patlayan turler: zorluk ve top hesabinda kullanilir
export const SERT = new Set(['ksTas3', 'ksTas4', 'oyA', 'ksTas', 'ksTas2', 'ksKemer', 'ksYildiz', 'ksSutun', 'tas2', 'tas4', 'tug2', 'tug3', 'mermer', 'kkA', 'altin']);
export const PATLAR = new Set(['ksTNT', 'kkL', 'fici', 'bomba']);

// ---------------- tohum ----------------
export function rngOf(a) { return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------------- yeni sey tanitimi: her 5-8 bolumde bir (1-25'te gorulenler zaten tanidik) ----------------
// tip: 'blok' (aile; bolum.js AILE + "Yeni Blok!" karti), 'mek' (mekanik; "Yeni Mekanik!" karti), 'engel' (mevcut engel karti)
export const TANITIM = [
  [31, 'mek', 'domino'], [37, 'blok', 'raf'], [43, 'mek', 'kopru'], [49, 'blok', 'dalga'], [55, 'mek', 'denge'],
  [61, 'mek', 'tnt'], [67, 'blok', 'buzP3'], [73, 'mek', 'gemi'], [79, 'blok', 'tug3'], [86, 'mek', 'hazine'],
  [92, 'engel', 'kapi2'], [99, 'mek', 'magara'], [106, 'engel', 'giyotin'], [113, 'mek', 'kemerSira'], [120, 'mek', 'ada']
];
const TANIT = {}; for (const [L, , ad] of TANITIM) TANIT[ad] = L;
const acik = (ad, L) => !(ad in TANIT) || L >= TANIT[ad];

// ---------------- malzeme rolleri ----------------
const R = {
  govde: [['ksSandik', 'ksSandikM'], ['ksSandik', 'ksSandikK'], ['ksSandikM', 'ksSandikK'], ['oyK', 'oyS'], ['oyM', 'oyP'], ['oyY', 'oyK'], ['hdK', 'hdM'], ['hdY', 'hdK'],
    ['joP', 'joY'], ['joT', 'joP'], ['knK', 'knM'], ['kkK'], ['ksKaro', 'ksSandik'], ['krM', 'krT'], ['ksBuz', 'buzP'], ['oyS', 'hdY'],
    ['oyT', 'oyN'], ['oyB', 'oyM'], ['oyY', 'oyT'], ['oyN', 'oyP'], ['oyK', 'oyB'], ['ksSandik', 'oyM'], ['ksBuz', 'oyN']],   // v5.1: patili kup renkleri
  sert: [['ksTas'], ['ksYildiz'], ['mermer'], ['kkA'], ['ksTas', 'ksYildiz']],
  kiris2: ['ksTas2', 'tas2', 'tug2', 'cik2', 'kemik', 'raf2', 'ksKalas2'],
  kiris3: ['ksKalas3', 'raf3', 'tug3', 'buzP3', 'ksTas3', 'ksBuz3'],
  dik: ['ksSutun', 'ksMorSutun', 'ksDirek', 'ahsapD', 'kvP', 'kvT', 'kvM'],
  tepe: ['ksYakut', 'ksElmas', 'ksSiseM', 'ksSiseY', 'ksSiseB', 'krM', 'krT', 'ksYildiz'],
  ince: ['ksKalas1', 'kur', 'mkP', 'mkY', 'mkM', 'disk'],
  patlar: ['ksTNT', 'kkL', 'fici', 'bomba'],
  cam: ['ksSiseM', 'ksSiseY', 'ksSiseB', 'krM', 'krT'],
  buz: ['ksBuz', 'buzP']
};
// bir turun tanitimi henuz yapilmadiysa kullanilmaz
const AILEOF = { raf2: 'raf', raf3: 'raf', disk: 'dalga', dalga: 'dalga', buzP3: 'buzP3', tug3: 'tug3' };
function palet(r, L, d) {
  const ok = (t) => !kapaliMi(t) && (!AILEOF[t] || acik(AILEOF[t], L));
  const sec = (a) => { const b = a.filter((x) => (Array.isArray(x) ? x.every(ok) : ok(x))); return b[Math.floor(r() * b.length)]; };
  const P = { govde: sec(R.govde), sert: sec(R.sert), kiris2: sec(R.kiris2), kiris3: sec(R.kiris3), dik: sec(R.dik), tepe: sec(R.tepe), ince: sec(R.ince), patlar: sec(R.patlar.slice(0, d > 0.6 ? 4 : 3)), cam: R.cam, buz: R.buz };
  P.g = (n) => P.govde[n % P.govde.length];
  { const tb = TANITIM.find((x) => x[0] === L && x[1] === 'blok'); const t3 = tb && { raf: 'raf3', tug3: 'tug3', buzP3: 'buzP3' }[tb[2]]; if (t3) P.kiris3 = t3; }   // tanitim bolumunde yeni 3'luk parca kullanilir
  return P;
}

// ---------------- yapi kurucu: doluluk izgarasi (yarim kup) + destek kontrolu ----------------
class Yapi {
  constructor() { this.c = []; this.dol = new Map(); }
  key(pn, x2, y2, k2) { return pn + '|' + x2 + '|' + y2 + '|' + k2; }
  // parcanin kapladigi yarim-kup hucreleri
  hucre(i, j, k, t) { const [w, h] = olcu(t), o = []; for (let x = Math.round((i - w / 2) * 2); x < Math.round((i + w / 2) * 2); x++) for (let y = Math.round(j * 2); y < Math.round((j + h) * 2); y++) for (let z = Math.round((k - 0.5) * 2); z < Math.round((k + 0.5) * 2); z++) o.push([x, y, z]); return o; }
  bos(i, j, k, t, pn = 0) { return this.hucre(i, j, k, t).every(([x, y, z]) => !this.dol.has(this.key(pn, x, y, z))); }
  // destek: alt yuzun en az yarisi dolu hucreye oturmali ve agirlik merkezi destek araliginda olmali
  destekli(i, j, k, t, pn = 0) {
    if (j <= 0) return true;
    const [w] = olcu(t), y = Math.round(j * 2) - 1, xs = [];
    let n = 0, top = 0;
    for (let x = Math.round((i - w / 2) * 2); x < Math.round((i + w / 2) * 2); x++) for (let z = Math.round((k - 0.5) * 2); z < Math.round((k + 0.5) * 2); z++) { top++; if (this.dol.has(this.key(pn, x, y, z))) { n++; xs.push(x); } }
    if (n * 2 < top) return false;
    const a = Math.min(...xs) / 2, b = (Math.max(...xs) + 1) / 2; return i >= a - 1e-6 && i <= b + 1e-6;
  }
  koy(i, j, k, t, pn = 0) {
    if (!t || !this.bos(i, j, k, t, pn) || !this.destekli(i, j, k, t, pn)) return false;
    for (const [x, y, z] of this.hucre(i, j, k, t)) this.dol.set(this.key(pn, x, y, z), t);
    this.c.push([i, j, k, t, pn]); return true;
  }
  // (i, k) sutununda en ust dolu yuksekligi
  ust(i, k, pn = 0, w = 1) { let m = 0; for (const c of this.c) { if (c[4] !== pn) continue; const [cw, ch] = olcu(c[3]); if (Math.abs(c[2] - k) < 0.5 && c[0] - cw / 2 < i + w / 2 - 1e-6 && c[0] + cw / 2 > i - w / 2 + 1e-6) m = Math.max(m, c[1] + ch); } return m; }
  // ust uste dik yigin
  yigin(i, k, j0, turler, pn = 0) { let j = j0; for (const t of turler) { if (!this.koy(i, j, k, t, pn)) break; j += olcu(t)[1]; } return j; }
}

// ---------------- arketipler ----------------
// Her arketip: ad (oyunda gorunen yapi adi), ipucu (cozum fikri; bolum basinda kisaca gosterilir), mek (gereken tanitim), kur(r, d, P, L) -> { y: Yapi, pl?, don?, denge? }
const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const sec = (r, a) => a[Math.floor(r() * a.length)];

export const ARKETIP = {
  kale: { ad: ['Kale', 'Hisar', 'Kale Kapısı'], ipucu: 'Kemerin üstündeki kirişi vur, kuleler içe çöker.',
    kur(r, d, P) {
      const y = new Yapi(), D = r() < 0.5 ? 2 : 1, kw = ri(r, 1, 2), W = 3 + 2 * kw + 2 * ri(r, 0, 1), H = ri(r, 2, 3) + Math.round(2 * d), kc = (W - 1) / 2;
      for (let k = 0; k < D; k++) {
        // kapi: ortada tas kemer, iki yaninda govde duvar
        y.koy(kc, 0, k, 'ksKemer');
        for (let i = 0; i < W; i++) if (Math.abs(i - kc) > 1.5) for (let j = 0; j < 2; j++) y.koy(i, j, k, (i + j) % 3 === 0 ? P.sert[0] : P.g(i + j));
        // kemer ustu: kiris + mazgal
        for (let i = 0; i < W; i++) y.koy(i, 2, k, i % 2 ? P.g(1) : P.g(0));
        // kuleler
        for (const x0 of [0, W - kw]) for (let j = 3; j < 3 + H; j++) for (let i = x0; i < x0 + kw; i++) y.koy(i, j, k, j === 2 + H ? sec(r, ['ksYildiz', P.tepe]) : j % 2 ? P.g(0) : P.sert[0]);
        if (r() < 0.6) y.koy(kc, 3, k, P.patlar);
      }
      y.koy(kc, y.ust(kc, 0), 0, P.tepe);
      return { y };
    } },
  inceKule: { ad: ['Kule', 'Gözcü Kulesi', 'Fener'], ipucu: 'İnce kule: en alttan vur, tümü devrilir.',
    kur(r, d, P) {
      const y = new Yapi(), W = ri(r, 2, 3), D = ri(r, 1, 2), H = ri(r, 6, 8) + Math.round(2 * d), ara = ri(r, 2, 4);
      let j = 0;
      for (let n = 0; n < H; n++) {
        const kat = n % ara === ara - 1;
        for (let i = 0; i < W; i++) for (let k = 0; k < D; k++) y.koy(i, j, k, kat ? P.sert[0] : P.g(n + i));
        j += 1;
        if (kat) { const t = W === 3 ? P.kiris3 : P.kiris2; for (let k = 0; k < D; k++) y.koy((W - 1) / 2, j, k, t); j += olcu(t)[1]; }
      }
      y.koy((W - 1) / 2, j, (D - 1) / 2, P.tepe);
      return { y, don: D === W && r() < 0.25 + 0.3 * d ? 0.35 + 0.2 * r() : 0 };
    } },
  piramit: { ad: ['Piramit', 'Basamaklı Piramit', 'Tepe'], ipucu: 'Alt köşedeki bloğu kır, piramit kayar.',
    kur(r, d, P) {
      const y = new Yapi(), D = r() < 0.3 ? 3 : r() < 0.5 ? 1 : 2, B = ri(r, 5, D === 3 ? 6 : 8), st = B <= 6 && D < 3 && r() < 0.4 ? 2 : 1, oyuk = B >= 6 && r() < 0.4;
      for (let l = 0; l < B; l++) for (let n = 0; n < B - l; n++) for (let k = 0; k < D; k++) {
        if (oyuk && l === 0 && n > 1 && n < B - 2 && k === 0) continue;
        const t = l === B - 1 ? P.tepe : (l + n) % 4 === 0 && l < 2 ? P.sert[0] : P.g(l);
        for (let s = 0; s < st; s++) y.koy(l / 2 + n, l * st + s, k, t);
      }
      return { y };
    } },
  kopru: { ad: ['Köprü', 'Asma Köprü', 'Taş Köprü'], ipucu: 'Köprünün bir ayağını vur, tabliye çöker.', mek: 'kopru',
    kur(r, d, P) {
      // iki ayri platform: ayaklar kendi platformunda; tas tabliye iki ayaga oturur (hucre koordinati ortak, platform 0'a kayitli)
      const y = new Yapi(), aw = ri(r, 1, 2), H = ri(r, 3, 4) + Math.round(d), xR = aw + 2, W = xR + aw, mid = (W - 1) / 2, D = ri(r, 1, 2);
      for (let k = 0; k < D; k++) for (let j = 0; j < H; j++) for (let i = 0; i < aw; i++) { y.koy(i, j, k, j % 2 ? P.g(1) : P.sert[0], 0); y.koy(xR + i, j, k, j % 2 ? P.g(0) : P.sert[0], 1); }
      const ser = [];
      for (let k = 0; k < D; k++) { ser.push([mid, H, k, 'tas4', 0]); if (aw === 2) ser.push([0, H, k, P.g(2), 0], [W - 1, H, k, P.g(2), 0]);
        for (let i = 0; i < W; i++) ser.push([i, H + 1, k, i === Math.round(mid) && k === 0 ? P.tepe : (i + H) % 2 ? P.g(0) : P.g(1), 0]); }
      if (r() < 0.5) ser.push([Math.floor(mid), H + 2, 0, P.patlar, 0]);
      y.c.push(...ser);
      const S = 1.55, r0 = aw * S / 2 + S * 0.5;
      return { y, pl: [{ x: ((aw - 1) / 2 - mid) * S, z: 0, ci: (aw - 1) / 2, r: r0 }, { x: (xR + (aw - 1) / 2 - mid) * S, z: 0, ci: xR + (aw - 1) / 2, r: r0 }] };
    } },
  merdiven: { ad: ['Merdiven', 'Basamaklar', 'Yokuş'], ipucu: 'En yüksek basamağı alttan vur, aşağı yuvarlanır.',
    kur(r, d, P) {
      const y = new Yapi(), bw = r() < 0.4 ? 1 : 2, N = ri(r, 4, bw === 2 ? 4 : 6), D = 2, ters = r() < 0.5, st = N > 4 ? 1 : ri(r, 1, 2);
      for (let n = 0; n < N; n++) { const h = 1 + n * st, i0 = (ters ? N - 1 - n : n) * bw;
        for (let i = i0; i < i0 + bw; i++) for (let k = 0; k < D; k++) for (let j = 0; j < h; j++) y.koy(i, j, k, j === h - 1 ? P.g(n) : (j + n) % 3 === 0 ? P.sert[0] : P.g(j + 1));
        y.koy(i0 + (bw - 1) / 2, h, 0, n === N - 1 ? P.tepe : r() < 0.4 ? P.ince : null); }
      return { y };
    } },
  ikiAda: { ad: ['İki Ada', 'İkiz Adalar', 'Ada Kuleleri'], ipucu: 'Önce yüksek adayı temizle, sonra alçağı.', mek: 'ada',
    kur(r, d, P) {
      const y = new Yapi(), h1 = ri(r, 4, 6), h2 = ri(r, 3, 5), w1 = ri(r, 2, 3), w2 = ri(r, 3, 4), D = ri(r, 1, 2);
      // sol ada: kule; sag ada: kucuk piramit
      for (let k = 0; k < D; k++) for (let j = 0; j < h1; j++) for (let i = 0; i < w1; i++) y.koy(i, j, k, j === h1 - 1 ? P.tepe : (i + j) % 2 ? P.g(0) : P.g(1), 0);
      for (let k = 0; k < D; k++) for (let l = 0; l < h2; l++) for (let n = 0; n < Math.max(1, w2 + 1 - l); n++) y.koy(l / 2 + n, l, k, l === h2 - 1 ? P.tepe : l === 0 && n % 2 ? P.sert[0] : P.g(l), 1);
      const yk = 0.8 + r() * 1.4, sol = r() < 0.5;
      const pl = [{ x: -4.6, z: sol ? -0.6 : 0.4, y: sol ? yk : 0 }, { x: 4.6, z: sol ? 0.4 : -0.6, y: sol ? 0 : yk }];
      if (d > 0.45 && r() < 0.5) pl[sol ? 1 : 0].kay = { a: 0.9, h: 0.9 + 0.4 * d };
      return { y, pl };
    } },
  gemi: { ad: ['Korsan Gemisi', 'Kara Gemi', 'Kaptan Gemisi'], ipucu: 'Direği vur, yelken güverteye devrilir.', mek: 'gemi',
    kur(r, d, P) {
      const y = new Yapi(), W = ri(r, 7, 9), D = r() < 0.6 ? 2 : 1, kic = r() < 0.5;
      for (let k = 0; k < D; k++) {
        // govde: iki sira; burun tarafi alcak
        for (let i = 0; i < W; i++) y.koy(i, 0, k, i === 0 || i === W - 1 ? 'ksFici' : P.g(i));
        for (let i = 1; i < W - 1; i++) y.koy(i, 1, k, i % 2 ? 'ksSandik' : P.g(i + 1));
        // kic kasarasi
        const ks = kic ? W - 3 : 1; for (let i = ks; i < ks + 2; i++) y.koy(i, 2, k, P.g(i)); y.koy(ks + 0.5, 3, k, 'ksKalas2');
      }
      // direkler
      const dir = [Math.round(W * 0.35), Math.round(W * 0.6)].map((x) => (kic ? x - 1 : x + 1));
      for (const x of dir) { const top = y.yigin(x, 0, y.ust(x, 0), [P.dik, P.dik, r() < 0.5 ? P.dik : 'ksKalas1']); if (y.koy(x, top, 0, 'ksKalas3')) y.koy(x, top + 0.5, 0, sec(r, ['ksYakut', 'ksElmas'])); }
      return { y };
    } },
  hazine: { ad: ['Hazine Odası', 'Gizli Hazine', 'Hazine Kasası'], ipucu: 'Ön duvarı kır, mücevherleri dışarı it.', mek: 'hazine',
    kur(r, d, P) {
      const y = new Yapi(), W = ri(r, 3, 4) * 2 - 1, H = ri(r, 2, 3), on = ri(r, 1, 2);
      // arka ve yan duvar (k = 2), ic (k = 1), on duvar (k = 0) alcak
      for (let i = 0; i < W; i++) for (let j = 0; j < H; j++) y.koy(i, j, 2, j % 2 ? P.sert[0] : P.g(i));
      for (const i of [0, W - 1]) for (let j = 0; j < H; j++) y.koy(i, j, 1, P.sert[0]);
      for (let i = 1; i < W - 1; i++) { y.koy(i, 0, 1, i % 2 ? sec(r, ['ksYakut', 'ksElmas', 'altin']) : 'ksKaro'); }
      for (let i = 0; i < W; i++) for (let j = 0; j < Math.min(on, H); j++) y.koy(i, j, 0, (i + j) % 2 ? P.g(0) : 'ksSandik');
      // tavan: kalaslar, ustunde sandiklar
      for (let k = 0; k < 3; k++) for (let i = 1; i + 1 < W; i += 3) y.koy(i + 1 > W - 1 ? i : i + 0.5 + 0.5, H, k, W - i >= 3 ? 'ksKalas3' : 'ksKalas1');
      for (let i = 0; i < W; i++) y.koy(i, H + 0.5, 1, i === (W - 1) / 2 ? 'ksYakut' : null);
      return { y };
    } },
  domino: { ad: ['Domino', 'Sütun Dizisi', 'Domino Yolu'], ipucu: 'Öndeki sütunu devir, zincir arkaya kadar gider.', mek: 'domino',
    kur(r, d, P) {
      // derinlige dogru sirali dik parcalar: ondeki devrilince arkadakine carpar
      const y = new Yapi(), sira = ri(r, 2, 4), N = ri(r, 3, 4), ara = 1.5, dik = sec(r, ['ksSutun', 'ksMorSutun', 'ahsapD']), bos = ri(r, 1, 2);
      // her sira capraz: arkadaki parca yarim kup yana kayar (onden bakinca dizi gorunur)
      const yon = r() < 0.5 ? 1 : -1;
      for (let s = 0; s < sira; s++) { const i0 = s * (1 + bos);
        for (let n = 0; n < N; n++) { const k = n * ara, i = i0 + yon * n * 0.5; y.koy(i, 0, k, dik); if (n === N - 1 || r() < 0.35) y.koy(i, 2, k, n === N - 1 ? P.tepe : P.ince); } }
      // en arkada duvar: zincirin hedefi
      const kz = N * ara, a0 = Math.min(0, yon * (N - 1) * 0.5), W = (sira - 1) * (1 + bos) + 1 + Math.abs((N - 1) * 0.5);
      for (let i = a0; i < a0 + Math.ceil(W); i++) for (let j = 0; j < 2 + Math.round(d * 2); j++) y.koy(i, j, kz, (Math.round(i) + j) % 2 ? P.g(0) : P.g(1));
      return { y };
    } },
  denge: { ad: ['Tahterevalli', 'Terazi', 'Denge Tahtası'], ipucu: 'Bir taraftaki ağırlığı düşür, platform eğilir ve kalanlar kayar.', mek: 'denge',
    kur(r, d, P) {
      const y = new Yapi(), W = 7, D = 2, hL = ri(r, 3, 5), hR = ri(r, 3, 5);
      for (let k = 0; k < D; k++) {
        for (let j = 0; j < hL; j++) for (let i = 0; i < 2; i++) y.koy(i, j, k, j === hL - 1 ? P.tepe : (i + j) % 2 ? P.g(0) : P.sert[0]);
        for (let j = 0; j < hR; j++) for (let i = 5; i < 7; i++) y.koy(i, j, k, j === hR - 1 ? P.tepe : (i + j) % 2 ? P.g(1) : P.g(0));
        y.koy(3, 0, k, P.g(2)); if (r() < 0.6) y.koy(3, 1, k, P.patlar);
      }
      void W; return { y, denge: 1 };
    } },
  asansor: { ad: ['Asansör', 'İnip Kalkan Kule', 'Vinç'], ipucu: 'Platform inerken üst katı, kalkarken alt katı vur.',
    kur(r, d, P) {
      const y = new Yapi(), W = ri(r, 3, 5), H = ri(r, 3, 5), D = 2;
      for (let k = 0; k < D; k++) for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) y.koy(i, j, k, j === H - 1 && i === Math.floor(W / 2) ? P.tepe : j % 2 ? P.g(i) : (i === 0 || i === W - 1) ? P.sert[0] : P.g(i + 1));
      return { y, pl: [{ x: 0, z: 0, asn: { a: 1.2 + 0.5 * r(), h: 0.75 + 0.3 * d } }] };
    } },
  donen: { ad: ['Dönen Kale', 'Dönme Dolap', 'Dönen Hisar'], ipucu: 'Köşe sana dönünce vur, blok dışarı fırlar.',
    kur(r, d, P) {
      const y = new Yapi(), W = ri(r, 3, 4), H = ri(r, 3, 5), oyuk = W === 4 && r() < 0.6;
      for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) for (let k = 0; k < W; k++) {
        if (oyuk && i > 0 && i < W - 1 && k > 0 && k < W - 1 && j > 0) continue;
        const kose = (i === 0 || i === W - 1) && (k === 0 || k === W - 1);
        y.koy(i, j, k, oyuk && j === 0 && !kose && i > 0 && i < W - 1 && k > 0 && k < W - 1 ? 'altin' : kose ? P.sert[0] : P.g(i + j + k));
      }
      if (!oyuk) y.koy((W - 1) / 2, H, (W - 1) / 2, P.tepe);
      return { y, don: 0.3 + 0.25 * r() + 0.15 * d };
    } },
  camKule: { ad: ['Cam Kule', 'Kristal Saray', 'Şişe Kulesi'], ipucu: 'Cam kırılgandır: tek isabet zincirleme kırar.',
    kur(r, d, P) {
      const y = new Yapi(), W = 3, H = ri(r, 4, 6), D = 2, cm = [sec(r, P.cam), sec(r, P.cam)];
      let j = 0;
      for (let n = 0; n < H; n++) {
        for (let i = 0; i < W; i++) for (let k = 0; k < D; k++) y.koy(i, j, k, cm[(i + n) % 2]);
        j += 1; if (n % 2 === 1) { const t = W === 3 ? P.kiris3 : 'ksKalas2'; for (let k = 0; k < D; k++) y.koy((W - 1) / 2, j, k, t); j += olcu(t)[1]; }
      }
      y.koy((W - 1) / 2, j, 0, sec(r, ['ksYakut', 'ksElmas']));
      return { y };
    } },
  magara: { ad: ['Buz Mağarası', 'Buz Kapısı', 'Donmuş Mağara'], ipucu: 'Buz kaygandır: yandan vur, bloklar kayıp düşer.', mek: 'magara',
    kur(r, d, P) {
      const y = new Yapi(), n = ri(r, 1, 2), D = 2, W = n * 3, ust = ri(r, 1, 2);
      for (let k = 0; k < D; k++) {
        y.koy(-1, 0, k, 'ksBuz'); y.koy(-1, 1, k, 'buzP'); y.koy(W, 0, k, 'ksBuz'); y.koy(W, 1, k, 'buzP');
        for (let a = 0; a < n; a++) y.koy(1 + a * 3, 0, k, 'ksKemer');
        for (let i = -1; i <= W; i++) y.koy(i, 2, k, (i + k) % 2 ? 'ksBuz' : 'buzP');
        for (let f = 0; f < ust; f++) for (let i = f; i < W - f; i++) y.koy(i, 3 + f, k, i % 3 === 1 ? 'krT' : (i + f) % 2 ? 'buzP' : 'ksBuz');
      }
      y.koy((W - 1) / 2, y.ust((W - 1) / 2, 0), 0, 'ksElmas');
      return { y };
    } },
  tnt: { ad: ['Barut Deposu', 'TNT Zinciri', 'Cephanelik'], ipucu: 'En alttaki TNT\'yi patlat, zincir yukarı çıkar.', mek: 'tnt',
    kur(r, d, P) {
      const y = new Yapi(), W = ri(r, 5, 7), H = ri(r, 4, 6), D = ri(r, 1, 2), sag = r() < 0.5;
      for (let k = 0; k < D; k++) for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
        const cap = sag ? i === Math.min(W - 1, j + 1) : i === Math.max(0, W - 2 - j);
        y.koy(i, j, k, cap && k === 0 ? 'ksTNT' : (i + j) % 3 === 0 ? P.sert[0] : sec(r, ['ksTas', P.g(0), 'ksSandik']));
      }
      return { y };
    } },
  kemerSira: { ad: ['Su Kemeri', 'Kemerler', 'Kemer Yolu'], ipucu: 'Ortadaki kemeri vur, üst kat iki yana dağılır.', mek: 'kemerSira',
    kur(r, d, P) {
      const y = new Yapi(), n = ri(r, 2, 3), kat = ri(r, 1, 2), D = ri(r, 1, 2);
      let j = 0;
      for (let f = 0; f < kat; f++) {
        for (let k = 0; k < D; k++) for (let a = 0; a < n - f; a++) y.koy(1 + a * 3 + f * 1.5, j, k, 'ksKemer');
        j += 2; for (let k = 0; k < D; k++) for (let i = f * 1.5; i < (n - f) * 3 + f * 1.5; i++) y.koy(i, j, k, (i + k) % 2 ? P.g(0) : P.g(1)); j += 1;
      }
      const a0 = (kat - 1) * 1.5, a1 = (n - kat + 1) * 3 + a0;
      for (let i = a0; i < a1; i++) y.koy(i, j, 0, (i - a0) % 2 ? P.g(2) : P.sert[0]);
      for (let i = a0; i < a1; i += 2) y.koy(i, j + 1, 0, P.tepe);
      return { y };
    } },
  ucKule: { ad: ['Üç Kule', 'Kuleler Tepesi', 'Üçlü Kale'], ipucu: 'Ortadaki yüksek kuleyi önce yık.',
    kur(r, d, P) {
      const y = new Yapi(), hs = [ri(r, 3, 5), ri(r, 4, 7), ri(r, 3, 5)], w = 2, D = ri(r, 1, 2);
      hs.forEach((h, pn) => { for (let k = 0; k < D; k++) for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) y.koy(i, j, k, j === h - 1 ? P.tepe : (j + pn) % 2 ? P.g(pn) : P.g(pn + 1), pn); });
      const yk = r() < 0.6 ? 1 + r() : 0, pl = [{ x: -5.0, z: 0 }, { x: 0, z: -0.8, y: yk }, { x: 5.0, z: 0 }];
      if (d > 0.4 && r() < 0.5) { pl[0].kay = { a: 0.8, h: 1 }; pl[2].kay = { a: 0.8, h: 1 }; pl[2].ph = Math.PI; }
      return { y, pl };
    } },
  raflar: { ad: ['Raflar', 'Kiler', 'Dükkân Rafı'], ipucu: 'Rafın ayağını kır, üstündekiler aşağı döker.', mek: null,
    kur(r, d, P, L) {
      const y = new Yapi(), kat = ri(r, 2, 4), W = 3 * ri(r, 1, 2), raf = P.kiris3, D = ri(r, 1, 2);
      let j = 0;
      for (let f = 0; f < kat; f++) {
        for (let k = 0; k < D; k++) for (let i = 0; i < W; i++) y.koy(i, j, k, (i + f) % 3 === 1 ? P.sert[0] : P.g(i + f));
        j += 1; for (let k = 0; k < D; k++) for (let i = 1; i < W; i += 3) y.koy(i, j, k, raf); j += olcu(raf)[1];
      }
      for (let i = 0; i < W; i++) y.koy(i, j, 0, i % 3 === 1 ? P.tepe : sec(r, ['kvP', 'kvT', 'kvM']));
      // arkada ikinci raf (kayan)
      const ar = d > 0.3 && r() < 0.6;
      if (ar) { for (let i = 0; i < 3; i++) for (let jj = 0; jj < 4; jj++) y.koy(i, jj, 0, jj === 3 && i === 1 ? P.tepe : P.g(i + jj), 1); return { y, pl: [{ x: 0, z: 1.8 }, { x: 0, z: -3.4, y: 1, kay: { a: 2.0, h: 0.7 + 0.3 * d } }] }; }
      return { y };
    } },
  korsanKale: { ad: ['Korsan Kalesi', 'Hazine Kulesi'], ipucu: 'Ortadaki TNT\'yi patlat, kale ikiye ayrılır.',
    kur(r) {
      const y = new Yapi(), op = { d: ri(r, 1, 2), sise: sec(r, ['ksSiseM', 'ksSiseB']), sise2: sec(r, ['ksSiseY', 'ksSiseM']), fici: sec(r, ['ksFici', 'ksFiciK']) };
      y.c = (r() < 0.55 ? kaleYapi : hazineYapi)(op).map((c) => [c[0], c[1], c[2], c[3], 0]); return { y, ek: 4 };
    } }
};
export const ARKETIPLER = Object.keys(ARKETIP);

// ---------------- benzerlik imzasi ----------------
export function imza(Y) {
  const c = Y.c, np = Y.pl ? Y.pl.length : 1; let i0 = 1e9, i1 = -1e9, h = 0, k0 = 1e9, k1 = -1e9;
  const fam = {};
  for (const [i, j, k, t] of c) { const [w, hh] = olcu(t); i0 = Math.min(i0, i - w / 2); i1 = Math.max(i1, i + w / 2); k0 = Math.min(k0, k); k1 = Math.max(k1, k); h = Math.max(h, j + hh); const f = t.replace(/[A-Z0-9].*$/, '') || t; fam[f] = (fam[f] || 0) + 1; }
  const ana = Object.keys(fam).sort((a, b) => fam[b] - fam[a]).slice(0, 2).join('+');
  // simetri: sol-sag ayna
  const ks = new Set(c.map((x) => x[0] + ',' + x[1] + ',' + x[2])), m = (i0 + i1) / 2 - 0.5;
  let es = 0; for (const [i, j, k] of c) if (ks.has((2 * m - i + 1) + ',' + j + ',' + k)) es++;
  const P0 = (Y.pl && Y.pl[0]) || {};
  const hareket = Y.don ? 'don' : Y.denge ? 'denge' : (Y.pl || []).some((p) => p.kay) ? 'kay' : (Y.pl || []).some((p) => p.asn) ? 'asn' : (Y.pl || []).some((p) => p.y) ? 'yuksek' : 'yok';
  void P0;
  return { a: Y.a, np, H: Math.round(h), W: Math.round(i1 - i0), D: Math.round(k1 - k0 + 1), ana, sim: es / c.length > 0.85 ? 1 : 0, hareket, engel: (Y.engel || []).map((e) => e.t).join(','), n: c.length };
}
export const imzaStr = (s) => [s.a, s.np, s.H, s.W, s.D, s.ana, s.sim, s.hareket].join('|');
// iki imza "cok yakin" mi: ayni gorunus (arketip farki olsa bile ayni boy, ayni ana malzeme ve ayni hareket)
export function yakin(a, b) {
  let f = 0; f += a.a === b.a ? 0 : 3; f += a.np === b.np ? 0 : 2; f += Math.min(2, Math.abs(a.H - b.H) / 2); f += Math.min(2, Math.abs(a.W - b.W) / 2); f += a.D === b.D ? 0 : 1; f += a.ana === b.ana ? 0 : 2; f += a.hareket === b.hareket ? 0 : 2;
  return f < 3;
}

// ---------------- zorluk ----------------
// 10 bolumluk donguler: ...0 zor bolum, ...1 rahatlama; ileri bolumlerde artmaz, dalgalanir (0.25-0.85 arasi).
export function zorluk(L) {
  const p = L % 10, taban = 0.25 + 0.4 * (1 - Math.exp(-(L - 25) / 260)), dalga = 0.08 * Math.sin(L / 41) + 0.05 * Math.sin(L / 13.7);
  const dongu = p === 0 ? 0.22 : p === 1 ? -0.18 : (p - 5) * 0.015;
  return Math.max(0.08, Math.min(0.95, taban + dalga + dongu));
}
export const zorBolum = (L) => L % 10 === 0;

// ---------------- ad uretimi ----------------
const SIFAT = ['Fırtına', 'Rüzgâr', 'Kızıl', 'Altın', 'Gizli', 'Eski', 'Dev', 'Mercan', 'Gece', 'Güneş', 'Kum', 'Demir', 'Lanetli', 'Kayıp', 'Yıldız', 'Martı', 'Ay', 'Okyanus', 'Kaptan', 'Pusula', 'Ada', 'Kristal', 'Zümrüt', 'Yakut'];

// ---------------- bir bolum ----------------
// gecmis: son bolumlerin { a, imza } listesi (art arda / son 5 / son 10 kurallari icin). deneme: dogrulamada hatali cikanlar icin yeni tohum.
export function bolumUret(L, gecmis, deneme = 0, ayar = {}) {
  const d = zorluk(L), zor = zorBolum(L);
  for (let t = 0; t < 40; t++) {
    const r = rngOf(L * 7919 + 101 + (deneme * 40 + t) * 104729);
    // tanitim bolumu: o mekanigin arketipi zorla secilir
    const tan = TANITIM.find((x) => x[0] === L && x[1] === 'mek');
    const uygun = ARKETIPLER.filter((a) => { const A = ARKETIP[a]; return (!A.mek || acik(A.mek, L)) && !(a === 'denge' && L < TANIT.denge); });
    let a = tan ? Object.keys(ARKETIP).find((k) => ARKETIP[k].mek === tan[2]) : sec(r, uygun);
    const son5 = gecmis.slice(-4).map((x) => x.a);   // bu bolumle birlikte son 5'te en fazla 1
    if (!tan && (son5.includes(a) || (gecmis.length && gecmis[gecmis.length - 1].a === a))) continue;
    if (zor && ['korsanKale'].includes(a) && r() < 0.5) continue;
    const Y = arketipKur(a, r, d, L);
    if (!Y) continue;
    // hareket katkisi: duz tek platformlu yapilara bazen kayan platform
    if (!Y.pl && !Y.don && !Y.denge && L > 30 && r() < 0.1 + 0.25 * d && ['piramit', 'kale', 'merdiven', 'camKule', 'tnt'].includes(a)) Y.pl = [{ x: 0, z: 0, kay: { a: 1.8 + r(), h: 0.7 + 0.5 * d } }];
    // engel
    Y.engel = engelSec(r, d, L, Y, zor);
    if (Y.engel.some((e) => e.t === 'kapi2' || e.t === 'giyotin') && (Y.pl || Y.don || Y.denge)) continue;   // kapi/giyotin tek sabit platform ister
    Y.a = a; Y.zor = zor ? 1 : 0; Y.d = Math.round(d * 100) / 100;
    Y.ad = sec(r, SIFAT) + ' ' + sec(r, ARKETIP[a].ad);
    Y.ip = ARKETIP[a].ipucu;
    const tn = TANITIM.filter((x) => x[0] === L); if (tn.length) Y.yeni = tn.map((x) => x[1] + ':' + x[2]);
    if (Y.c.length < Math.min(30, 14 + 26 * d) || Y.c.length > (ayar.max || 80)) continue;
    const tb = TANITIM.find((x) => x[0] === L && x[1] === 'blok');
    if (tb && !tanitimKoy(Y, tb[2])) continue;
    Y.c = kapaliUygula(Y.c);   // v5.1: arketiplerin dogrudan yazdigi kapali bloklar karsiligina doner
    const s = imza(Y); Y.imza = s;
    if (!tan && gecmis.slice(-10).some((g) => g.imza && yakin(g.imza, s))) continue;
    return Y;
  }
  return null;
}
// tanitilan blok bu bolumde yoksa uygun bir parca onunla degistirilir (ayni olcu)
const TANBLOK = { raf: [['ksKalas3'], 'raf3'], tug3: [['buzP3'], 'tug3'], buzP3: [['tug3'], 'buzP3'],   // ayni olcu (3x0.5 / 3x1)
  dalga: [['oyK', 'oyM', 'oyY', 'oyS', 'oyP', 'hdK', 'hdM', 'hdY', 'ksSandik', 'ksSandikM', 'ksSandikK', 'knK', 'knM', 'joP', 'joY', 'joT', 'kkK', 'ksKaro'], 'dalga'] };
function tanitimKoy(Y, ad) {
  const [kay, hed] = TANBLOK[ad] || [[], ad];
  if (Y.c.some((c) => c[3] === hed || (ad === 'dalga' && c[3] === 'disk'))) return true;
  const ad2 = Y.c.filter((c) => kay.includes(c[3])); if (!ad2.length) return false;
  ad2.sort((a, b) => b[1] - a[1]); ad2[0][3] = hed; return true;   // en ustteki parca (ustunde yuk yok; buz kalas kaydirmasin)
}
function engelSec(r, d, L, Y, zor) {
  const tan = TANITIM.find((x) => x[0] === L && x[1] === 'engel'); if (tan) return [{ t: tan[2] }];
  if (Y.pl && Y.pl.length > 1) return [];   // cok platformda engel yok (gorus kapanmasin)
  if (Y.don || Y.denge) return [];
  const p = (zor ? 0.55 : 0.12) + 0.3 * d; if (r() > p) return [];
  const tur = ['kurek', 'kalkan', 'kayan']; if (acik('kapi2', L)) tur.push('kapi2'); if (acik('giyotin', L)) tur.push('giyotin');
  const t = sec(r, tur); if (t === 'kapi2' || t === 'giyotin') return [{ t }];
  return [{ t, hiz: Math.round((1 + 0.6 * d) * 100) / 100 }];
}
function arketipKur(a, r, d, L) {
  const A = ARKETIP[a];
  const P = palet(r, L, d);
  const o = A.kur(r, d, P, L); if (!o) return null;
  const c = o.y.c.filter((x) => x[3]);   // bos tur (null) temizligi
  const Y = { c };
  if (o.pl) Y.pl = o.pl; if (o.don) Y.don = Math.round(o.don * 100) / 100; if (o.denge) Y.denge = 1; if (o.ek) Y.ek = o.ek;
  return Y;
}

// onizleme: belirli arketipten bir ornek (dogrulamada kullanilmaz)
export function ornek(a, L, t = 0) {
  for (let n = 0; n < 30; n++) { const r = rngOf(L * 131 + t * 977 + n), d = zorluk(L), Y = arketipKur(a, r, d, L); if (Y && Y.c.length >= 14) { Y.a = a; Y.ad = ARKETIP[a].ad[0]; Y.engel = []; return Y; } }
  return null;
}

// ---------------- top sayisi (dogrulamadan sonra) ----------------
// Temel: blok sayisi (hedef: top basina ~2,7-3,2 blok; agir taslar ve engel icin ek), zorlukla azalir; zor bolum dar, rahatlama bolumu bol.
// Bot kusursuz nisan alir ama yapiyi bilmez: botun atisinin %70'inden az top verilmez. (denge_kontrol.mjs ile denetlenir)
export function topHesap(Y, botAtis) {
  const n = Y.c.length, sert = Y.c.filter((c) => SERT.has(c[3])).length, d = Y.d == null ? zorluk(Y.L || 100) : Y.d;
  let t = (n / 2.9 + 3) * (1.1 - 0.25 * d) + sert / 6 + (Y.engel || []).length + (Y.pl && Y.pl.some((p) => p.kay || p.asn) ? 1 : 0) + (Y.don || Y.denge ? 1 : 0);
  if (Y.zor) t *= 0.88; else if (Y.L % 10 === 1) t *= 1.12;
  return Math.max(8, Math.min(30, Math.max(Math.round(t), Math.ceil(botAtis * 0.7))));
}
