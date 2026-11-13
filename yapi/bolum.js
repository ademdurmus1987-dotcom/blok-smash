import { kaleYapi, hazineYapi } from './kale.js?v=1';   // v4.3
// v3.16 (Adem 12 Kas 2026): bolum dizilisi bastan. Ilk bolumler tek renk tek cesit; her yeni sekil ailesi bir bolumde tanitilir
// (oyun.js ilk gorulen aileyi "Yeni sekil" kartiyla gosterir). Farkli platform sayisi, yukseklik ve hareketiyle farkli yerlesimler.
// Hucre: [i, kat, k, tur, platform]. Genis parcanin i degeri orta noktasidir (tas4 0..3'u kaplar: i = 1.5). Havada hucre yok: her parca altindakine oturur.

// ---------------- sekil aileleri: kartta gorunen ad ve aciklama ----------------
export const AILE = {
  oy: ['Oyuncak Küp', 'Tek atışta kırılır. Hepsini platformdan düşür!'],
  ks: ['Korsan Kalesi', 'Sandık, fıçı ve şişeler kırılır; taşlar ağırdır. TNT\'yi vur, kale çöksün!'],   // v4.3
  ahsapD: ['Tahta Direk', 'İki kat boyunda. Devrilince üstündekileri de düşürür.'],
  buzP: ['Buz Küp', 'Kaygandır, kolay kayar ve çarpınca çatlar.'],
  tas: ['Taş Kiriş', 'Ağır ve sağlam. Altındaki desteği vur!'],
  mermer: ['Mermer Sütun', 'Yuvarlak ve sağlam. Devirmek için yandan vur.'],
  jo: ['Jöle', 'Topu zıplatır, sert çarpınca patlar.'],
  hd: ['Hediye Kutusu', 'Hafiftir, kolayca uçar.'],
  fici: ['Patlayan Fıçı', 'Vur ve patlat! Çevresindeki her şeyi savurur.'],
  kr: ['Kristal', 'Parlak ve kırılgan. Sert çarpınca tuzla buz olur.'],
  tug: ['Tuğla', 'En sağlam parça. Birkaç atış gerekebilir.'],
  kv: ['Reçel Kavanozu', 'Camdır: düşünce ya da vurulunca kırılır.'],
  mk: ['Makaron', 'Yarım boy, hafif ve tatlı.'],
  cik: ['Çikolata', 'Uzun ve sağlam bir kalıp. Sert vurunca kırılır.'],
  kn: ['Konserve', 'Yuvarlanır! Yerinden çıkınca kayıp gider.'],
  altin: ['Altın Küp', 'Düşürünce altın kazanırsın!'],
  kur: ['Kurabiye', 'Yassı ve hafif, üst üste dizilir.'],
  bomba: ['Bomba', 'Fıçıdan da güçlü patlar. Dikkat!'],
  kola: ['Kola Kutusu', 'Vurulunca köpüklü kola fışkırır.'],
  hediye: ['Sürpriz Kutu', 'Düşürünce ekstra top verir.'],
  yildiz: ['Yıldız Küp', 'Düşürünce bonus kazandırır.'],
  raf: ['Raf Tahtası', 'İnce uzun raf; üstündekileri taşır.'],
  dalga: ['Taş Halka', 'Yuvarlak taş parça.'],
  kkK: ['Kuru Kafa', 'Korsanların simgesi! Vurunca takır takır kırılır.'],
  kkA: ['Altın Kuru Kafa', 'Ağır ve sağlam. Düşürürsen hazine senin!'],
  kkL: ['Lanetli Kuru Kafa', 'Gözleri yeşil yanar. Vurunca patlar, çevresini savurur!'],
  kemik: ['Kemik Kiriş', 'Kocaman bir kemik. Üstündekileri taşır, sert vurunca kırılır.']
};
export function aileOf(t) {
  if (typeof t !== 'string') return null;
  const p = { oy: 'oy', ks: 'ks', jo: 'jo', hd: 'hd', kr: 'kr', kv: 'kv', mk: 'mk', kn: 'kn' }[t.slice(0, 2)];
  if (p && /^[a-z]{2}[A-Z]/.test(t)) return p;
  if (t === 'tas2' || t === 'tas4') return 'tas'; if (t === 'tug2' || t === 'tug3') return 'tug'; if (t === 'buzP' || t === 'buzP3') return 'buzP';
  if (t === 'cik2') return 'cik'; if (t === 'raf2' || t === 'raf3') return 'raf'; if (t === 'disk') return 'dalga';
  return AILE[t] ? t : null;
}

// ---------------- yardimcilar ----------------
const ayna = (W) => (i) => Math.round(Math.min(i, W - 1 - i));
function kutu(o, i0, i1, j0, j1, k0, k1, f, pn) { for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) for (let k = k0; k <= k1; k++) { const t = typeof f === 'function' ? f(i, j, k) : f; if (t) o.push([i, j, k, t, pn || 0]); } return o; }
const P = (pn, a) => a.map((c) => (c[4] = pn, c));
// dizilisler (tek platform icin hucre listesi). f(i, j, k) -> tur
const D = {
  duvar: (W, H, Dp, f) => kutu([], 0, W - 1, 0, H - 1, 0, Dp - 1, f),
  kule: (W, H, Dp, f) => kutu([], 0, W - 1, 0, H - 1, 0, Dp - 1, f),
  piramit(B, Dp, f) { const o = []; for (let l = 0; l < B; l++) for (let n = 0; n < B - l; n++) for (let k = 0; k < Dp; k++) { const t = f(n, l, k); if (t) o.push([l / 2 + n, l, k, t, 0]); } return o; },
  merdiven(W, b0, st, Dp, f) { const o = [], m = ayna(W); for (let i = 0; i < W; i++) kutu(o, i, i, 0, b0 + m(i) * st, 0, Dp - 1, f); return o; },
  // kemer: iki ayak (genislik 1) ve ustunde 4'luk kiris; kat kat ust uste
  kemer(kat, Dp, ayak, kiris, ust) { const o = []; let j = 0; for (let n = 0; n < kat; n++) { kutu(o, 0, 0, j, j + 1, 0, Dp - 1, ayak); kutu(o, 3, 3, j, j + 1, 0, Dp - 1, ayak); j += 2; for (let k = 0; k < Dp; k++) o.push([1.5, j, k, kiris, 0]); j++; } if (ust) kutu(o, 0, 3, j, j, 0, Dp - 1, ust); return o; },
  // kale: alt duvar + iki kule + ortada kisa kule
  kale(H, T, Dp, duvar, kule, orta) { const o = []; kutu(o, 0, 6, 0, H - 1, 0, Dp - 1, duvar); kutu(o, 0, 1, H, T - 1, 0, Dp - 1, kule); kutu(o, 5, 6, H, T - 1, 0, Dp - 1, kule); kutu(o, 3, 3, H, H + 1, 0, Dp - 1, orta); return o; },
  // tugla orgusu: cift sira 2'lik + tek sira kaydirilmis (kenarlarda 1'lik)
  orgu(W, H, Dp, uzun, tek) { const o = []; for (let j = 0; j < H; j++) for (let k = 0; k < Dp; k++) { if (j % 2 === 0) { let i = 0; for (; i + 1 < W; i += 2) o.push([i + 0.5, j, k, uzun, 0]); if (i < W) o.push([i, j, k, tek(j), 0]); } else { o.push([0, j, k, tek(j), 0]); let i = 1; for (; i + 1 < W; i += 2) o.push([i + 0.5, j, k, uzun, 0]); if (i < W) o.push([i, j, k, tek(j), 0]); } } return o; },
  // hisar: icı bos kare kule (ic tabanda ozel parca)
  hisar(W, H, f, ic) { const o = []; kutu(o, 0, W - 1, 0, H - 1, 0, W - 1, (i, j, k) => (i > 0 && i < W - 1 && k > 0 && k < W - 1 ? (j === 0 && ic ? ic : null) : f(i, j, k))); return o; }
};
const sira = (a) => (i, j) => a[j % a.length];
const serit = (a) => (i, j) => a[Math.floor(j / 2) % a.length];
const satranc = (a, b) => (i, j, k) => ((Math.round(i) + j + k) % 2 ? a : b);

// ---------------- el yapimi 20 bolum ----------------
export const BOLUMLER = [
  { ad: 'İlk Atış', make: () => D.duvar(5, 4, 2, 'oyK') },
  // v4.3: (Adem 13 Kas) kale gorsellerinden: ayrintili sandik, tas kemer, fici, sise, mucevher, buz, TNT, sutunlar
  { ad: 'Korsan Kalesi', ek: 4, make: () => kaleYapi() },
  { ad: 'Kırmızı Kule', make: () => D.kule(3, 6, 2, (i, j) => (j >= 4 ? 'oyM' : 'oyK')) },
  { ad: 'Tahta Kule', make: () => { const o = []; kutu(o, 0, 5, 0, 0, 0, 1, 'oyK'); kutu(o, 0, 5, 1, 1, 0, 1, (i) => (i % 2 ? null : 'ahsapD')); kutu(o, 0, 5, 1, 2, 0, 1, (i) => (i % 2 ? 'oyM' : null)); kutu(o, 0, 5, 3, 3, 0, 1, 'oyY'); kutu(o, 1, 4, 4, 4, 0, 1, (i) => (i === 1 || i === 4 ? 'ahsapD' : 'oyK')); kutu(o, 2, 3, 5, 5, 0, 1, 'oyK'); return o; } },
  { ad: 'İkiz Kuleler', pl: [{ x: -4.3, z: 0 }, { x: 4.3, z: 0 }], make: () => P(0, D.kule(3, 5, 1, sira(['oyK', 'oyM', 'oyY']))).concat(P(1, D.kule(3, 5, 1, sira(['oyY', 'oyM', 'oyK'])))) },
  { ad: 'Buz Duvarı', make: () => D.duvar(6, 5, 2, (i, j) => (j === 2 ? 'oyM' : 'buzP')) },
  { ad: 'Hazine Kulesi', ek: 4, make: () => hazineYapi({ d: 2 }) },
  { ad: 'Taş Kemerler', pl: [{ x: 0, z: 0, asn: { a: 1.4, h: 0.85 } }], make: () => D.kemer(2, 2, 'oyK', 'tas4', 'buzP') },
  { ad: 'Mermer Tapınak', make: () => { const o = []; kutu(o, 0, 5, 0, 2, 0, 1, (i) => (i === 1 || i === 4 ? 'oyK' : 'mermer')); for (const i of [0.5, 2.5, 4.5]) kutu(o, i, i, 3, 3, 0, 1, 'tas2'); kutu(o, 1, 4, 4, 4, 0, 1, 'oyY'); kutu(o, 2, 3, 5, 5, 0, 1, 'oyK'); return o; } },
  { ad: 'Jöle Piramidi', make: () => D.piramit(6, 2, (i, j) => ['joP', 'joY', 'oyK', 'joP', 'joY', 'oyS'][j]) },
  { ad: 'Hediye Tepesi', pl: [{ x: -5.2, z: 0 }, { x: 0, z: 0, y: 1.6 }, { x: 5.2, z: 0 }],
    make: () => P(0, D.kule(2, 3, 1, sira(['hdY', 'oyY']))).concat(P(1, D.kule(2, 5, 1, sira(['hdK', 'hdM'])))).concat(P(2, D.kule(2, 3, 1, sira(['hdY', 'oyY'])))) },
  { ad: 'Fıçılı Kale', pl: [{ x: 0, z: 0, kay: { a: 2.2, h: 0.8 } }], make: () => { const o = D.kale(2, 5, 2, 'oyM', 'oyK', 'oyS'); for (const c of o) if (c[0] === 3 && c[1] === 2) c[3] = 'fici'; return o; } },
  { ad: 'Kristal Kule', don: 0.4, make: () => D.kule(3, 6, 3, (i, j) => (j % 3 === 2 ? 'oyP' : j % 2 ? 'krT' : 'krM')) },
  { ad: 'Tuğla Duvar', make: () => D.orgu(7, 6, 2, 'tug2', (j) => (j % 2 ? 'oyK' : 'oyY')) },
  { ad: 'Kavanoz Rafı', pl: [{ x: -4.4, z: 0 }, { x: 4.4, z: 0 }], make: () => { const yap = (n, a) => { const o = []; kutu(o, 0, 3, 0, 0, 0, 0, (i) => a[i % 3]); o.push([1.5, 2, 0, 'tas4', 0]); kutu(o, 0, 3, 3, 3, 0, 0, (i) => a[(i + 1) % 3]); kutu(o, 1, 2, 5, 5, 0, 0, 'oyS'); return P(n, o); }; return yap(0, ['kvP', 'kvT', 'kvM']).concat(yap(1, ['kvM', 'kvP', 'kvT'])); } },
  { ad: 'Makaron Kulesi', pl: [{ x: 0, z: 0, asn: { a: 1.2, h: 0.9 } }], make: () => { const o = [], MK = ['mkP', 'mkY', 'mkM']; for (let n = 0; n < 11; n++) for (let i = 0; i < 3; i++) for (let k = 0; k < 2; k++) o.push([i, n * 0.5, k, MK[(n + i) % 3], 0]); kutu(o, 1, 1, 5.5, 5.5, 0, 1, 'oyK'); return o; } },
  { ad: 'Çikolata Katları', pl: [{ x: 0, z: 0, kay: { a: 2, h: 0.9 } }], make: () => { const o = []; for (let j = 0; j < 6; j++) { if (j % 2) for (const i of [0.5, 2.5, 4.5]) kutu(o, i, i, j, j, 0, 1, 'cik2'); else kutu(o, 0, 5, j, j, 0, 1, (i) => (i % 2 ? 'oyS' : 'oyK')); } return o; } },
  { ad: 'Konserve Piramidi', make: () => D.piramit(7, 2, (i, j) => (j % 2 ? 'knM' : 'knK')) },
  { ad: 'Altın Hisar', don: 0.35, make: () => D.hisar(4, 5, (i, j) => (j === 4 ? 'oyS' : j % 2 ? 'oyP' : 'oyM'), 'altin') },
  { ad: 'Kurabiye Basamakları', pl: [{ x: -4.2, z: 0 }, { x: 4.2, z: 0, y: 2 }], make: () => { const yap = (n, h) => { const o = []; for (let m = 0; m < h; m++) for (let i = 0; i < 3; i++) for (let k = 0; k < 2; k++) o.push([i, m * 0.5, k, 'kur', 0]); kutu(o, 0, 2, h * 0.5, h * 0.5, 0, 1, (i) => (i === 1 ? 'oyK' : 'oyY')); return P(n, o); }; return yap(0, 7).concat(yap(1, 5)); } },
  { ad: 'Bomba Kalesi', make: () => { const o = D.kale(3, 6, 2, (i, j) => (j === 2 ? 'oyP' : 'oyM'), 'krM', 'oyS'); for (const c of o) if (c[0] === 3 && c[1] === 1 && c[2] === 0) c[3] = 'bomba'; return o; } },
  { ad: 'Büyük Şenlik', pl: [{ x: -5.4, z: 0, kay: { a: 0.9, h: 1.2 } }, { x: 0, z: 0, y: 1.2 }, { x: 5.4, z: 0, ph: Math.PI, kay: { a: 0.9, h: 1.2 } }],
    make: () => P(0, D.kule(2, 5, 1, sira(['joP', 'hdK', 'oyY']))).concat(P(1, D.piramit(4, 2, (i, j) => ['krM', 'buzP', 'hdM', 'altin'][j]))).concat(P(2, D.kule(2, 5, 1, sira(['joY', 'hdM', 'oyK'])))) },
  { ad: 'Kuru Kafa Kulesi', make: () => { const o = D.kule(3, 6, 2, (i, j) => (j % 2 ? 'oyK' : 'kkK')); for (const c of o) if (c[1] === 5 && c[0] === 1) c[3] = 'kkA'; return o; } },
  { ad: 'Kemik Duvarı', pl: [{ x: 0, z: 0, kay: { a: 1.8, h: 0.9 } }], make: () => D.orgu(6, 6, 2, 'kemik', (j) => (j % 4 === 1 ? 'kkA' : 'kkK')) },
  { ad: 'Lanetli Mağara', pl: [{ x: -4.4, z: 0 }, { x: 4.4, z: 0, y: 1.4 }], make: () => { const yap = (n) => { const o = D.kemer(2, 1, 'kkK', 'tas4', 'kkK'); for (const c of o) if (c[1] === 0 && c[0] === 0) c[3] = 'kkL'; return P(n, o); }; return yap(0).concat(yap(1)); } }
];

// ---------------- 21+ bolum uretici ----------------
// Bolum numarasindan tohum: hep ayni bolum ayni cikar. Dizilis + platform + renk paleti secilir; zorlukla saglam parca ve hareket artar.
function mul32(a) { return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const KOLAY = ['oyK', 'oyM', 'oyY', 'oyS', 'oyP', 'joP', 'joY', 'joT', 'hdK', 'hdM', 'hdY', 'buzP', 'krM', 'krT'];
const ORTA = ['knK', 'knM', 'mermer'];
const ADLAR = ['Renkli', 'Neşeli', 'Şekerli', 'Parlak', 'Dev', 'Gizli', 'Tatlı', 'Sihirli', 'Çılgın', 'Uçan', 'Güneşli', 'Rüzgârlı', 'Gökkuşağı', 'Mini', 'Süper', 'Sallanan'];
export function uret2(L, zor, koy) {
  const r = mul32(L * 7919 + 101), d = zor, ri = (a, b) => a + Math.floor(r() * (b - a + 1)), sec = (a) => a[Math.floor(r() * a.length)];
  const pal = []; const n = ri(2, 3); while (pal.length < n) { const t = r() < 0.2 + 0.3 * d ? sec(ORTA) : sec(KOLAY); if (!pal.includes(t)) pal.push(t); }
  if (koy || r() < 0.12) { pal.length = 0; pal.push('kkK', sec(KOLAY)); if (r() < 0.5) pal.push(r() < 0.6 ? 'kkA' : 'kkL'); }   // v3.17: korsan koyunda kuru kafalar
  const sert = koy && r() < 0.6 ? 'kemik' : d > 0.35 && r() < 0.5 ? sec(['tug2', 'tas2', 'cik2']) : null;
  const boya = sec([sira(pal), serit(pal), satranc(pal[0], pal[1]), (i, j) => pal[(Math.round(i) + j) % pal.length]]);
  const DIZ = ['duvar', 'kule', 'piramit', 'kemer', 'merdiven', 'kale', 'orgu', 'ikiz', 'uclu', 'basamak', 'onarka', 'hisar'];
  const tip = DIZ[(L * 7 + ri(0, 2)) % DIZ.length], Hm = Math.round(4 + 4 * d);
  let o, pl = null, don = 0, ad = sec(ADLAR) + ' ';
  const ozel = () => { if (r() < 0.55) { const c = o[Math.floor(r() * o.length)]; if (c && c[3].length > 2 && !/[24]$/.test(c[3])) c[3] = sec(['fici', 'altin', 'fici', 'bomba']); } };
  if (tip === 'duvar') { o = D.duvar(ri(5, 7), ri(3, Hm), 2, boya); ad += 'Duvar'; }
  else if (tip === 'kule') { const W = ri(2, 3), Dp = r() < 0.4 ? W : 2; o = D.kule(W, ri(5, Hm + 3), Dp, boya); if (Dp === W && r() < 0.5) don = 0.3 + 0.25 * r(); ad += 'Kule'; }
  else if (tip === 'piramit') { o = D.piramit(ri(5, 7), 2, boya); ad += 'Piramit'; }
  else if (tip === 'kemer') { o = D.kemer(ri(2, 3), 2, pal[0], 'tas4', pal[1]); ad += 'Kemer'; }
  else if (tip === 'merdiven') { o = D.merdiven(7, ri(1, 2), ri(1, 2), 2, boya); ad += 'Merdiven'; }
  else if (tip === 'kale') { const H = ri(2, 3); o = D.kale(H, H + ri(2, 3 + Math.round(2 * d)), 2, pal[0], pal[1], pal[2] || pal[0]); ad += 'Kale'; }
  else if (tip === 'orgu') { o = D.orgu(ri(5, 7), ri(4, Hm), 2, sert || 'tug2', (j) => pal[j % pal.length]); ad += sert === 'kemik' ? 'Kemik Duvar' : 'Örgü'; }
  else if (tip === 'hisar') { o = D.hisar(4, ri(3, Hm - 1), boya, r() < 0.5 ? 'altin' : 'fici'); if (r() < 0.6) don = 0.3 + 0.2 * r(); ad += 'Hisar'; }
  else if (tip === 'ikiz') { const H = ri(4, Hm + 1), W = ri(2, 3); o = P(0, D.kule(W, H, 1, boya)).concat(P(1, D.kule(W, H, 1, boya))); pl = [{ x: -4.3, z: 0 }, { x: 4.3, z: 0 }]; if (r() < 0.3 + 0.3 * d) { pl[0].kay = { a: 1.1, h: 1 + 0.5 * d }; pl[1].kay = { a: 1.1, h: 1 + 0.5 * d }; pl[1].ph = Math.PI; } ad += 'İkizler'; }
  else if (tip === 'uclu') { const H = ri(3, Hm), yk = r() < 0.6 ? ri(1, 2) : 0; o = P(0, D.kule(2, H, 1, boya)).concat(P(1, D.kule(2, H + 1, 1, boya))).concat(P(2, D.kule(2, H, 1, boya))); pl = [{ x: -5.2, z: 0 }, { x: 0, z: 0, y: yk }, { x: 5.2, z: 0 }]; if (r() < 0.3 + 0.3 * d) pl[1].asn = { a: 1.2, h: 0.9 }; ad += 'Üçlü'; }
  else if (tip === 'basamak') { const y2 = ri(1, 2) + 0.5 * ri(0, 1); o = P(0, D.kule(3, ri(4, Hm), 1, boya)).concat(P(1, D.kule(2, ri(3, Hm - 1), 2, boya))); pl = r() < 0.5 ? [{ x: -4.3, z: 0 }, { x: 4.3, z: 0, y: y2 }] : [{ x: -4.3, z: 0, y: y2 }, { x: 4.3, z: 0 }]; ad += 'Basamak'; }
  else { o = P(0, D.duvar(5, ri(4, Hm), 1, boya)).concat(P(1, D.kule(2, ri(3, 5), 1, boya))); pl = [{ x: 0, z: -3.2 }, { x: 0, z: 3.0, kay: { a: 2.6, h: 0.8 + 0.4 * d } }]; ad += 'Ön ve Arka'; }
  if (!pl && !don && r() < 0.14 + 0.2 * d) pl = [{ x: 0, z: 0, kay: { a: 2 + r(), h: 0.8 + 0.5 * d } }];
  else if (!pl && !don && r() < 0.18) pl = [{ x: 0, z: 0, asn: { a: 1.3, h: 0.85 } }];
  while (o.length > 110) { const jm = Math.max(...o.map((c) => c[1])); o = o.filter((c) => c[1] < jm); }
  ozel();
  const Y = { ad, uretim: 1, make: () => o.map((c) => c.slice()) };
  if (pl) Y.pl = pl; if (don) Y.don = don;
  return Y;
}
