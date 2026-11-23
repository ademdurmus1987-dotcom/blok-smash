// Foxi Smash v12: hayvan ve karakter yuzleri (parcali cizici). Her tur x aksesuar x ifade x renk x zemin ayri bir resim.
export function rng(s) { let a = s >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const W = 11, UST = 5;   // yuz 5. satirdan baslar (ust: kulak, sapka)
// c: ana renkler, p: burun alani, k: kulak [tip, ic renk], s: yuz sekli, b: burun/agiz, e: ek desen
const T = [
  ['Kedi', 'oqzwh', 'w', 'sivri p', 'yuv', 'kedi', ''], ['Köpek', 'hkwo', 'w', 'sarkik h', 'kare', 'burun', 'leke'], ['Tilki', 'o', 'w', 'sivri z', 'cene', 'burun', 'yanak'], ['Ayı', 'h', 'k', 'yuvarlak k', 'yuv', 'burun', ''],
  ['Panda', 'w', 'w', 'yuvarlak z', 'yuv', 'burun', 'panda'], ['Kutup Ayısı', 'w', 'a', 'yuvarlak a', 'yuv', 'burun', ''], ['Koala', 'q', 'q', 'iri w', 'yuv', 'uzunburun', ''], ['Tavşan', 'wqkp', 'w', 'uzun p', 'yuv', 'disli', ''],
  ['Fare', 'q', 'k', 'iri p', 'cene', 'kedi', ''], ['Kurt', 'qz', 'w', 'sivri z', 'cene', 'disli', 'yanak'], ['Aslan', 'y', 'k', 'yuvarlak h', 'yuv', 'burun', 'yele'], ['Kaplan', 'o', 'w', 'yuvarlak z', 'yuv', 'kedi', 'cizgi'],
  ['Leopar', 'y', 'w', 'yuvarlak h', 'yuv', 'kedi', 'benek'], ['Maymun', 'h', 'k', 'iri k', 'yuv', 'gulen', 'maymun'], ['Goril', 'zq', 'q', 'yuvarlak q', 'kare', 'burun', 'maymun'], ['Domuz', 'p', 'r', 'sivri r', 'yuv', 'domuz', ''],
  ['İnek', 'w', 'p', 'boynuz h', 'kare', 'domuz', 'leke'], ['Boğa', 'hz', 'k', 'boynuz w', 'kare', 'domuz', ''], ['Keçi', 'wq', 'k', 'boynuz h', 'cene', 'burun', ''], ['Koyun', 'w', 'z', 'sarkik z', 'yuv', 'koyun', 'koyun'],
  ['Geyik', 'h', 'k', 'geyik k', 'cene', 'burun', ''], ['Zebra', 'w', 'z', 'sivri z', 'cene', 'burun', 'zebra'], ['Zürafa', 'y', 'k', 'zurafa h', 'cene', 'domuz', 'benek'], ['Fil', 'qa', 'q', 'dev p', 'yuv', 'hortum', ''],
  ['Su Aygırı', 'vq', 'p', 'kucuk p', 'kare', 'domuz', 'dis'], ['Gergedan', 'q', 'q', 'kucuk z', 'kare', 'gergedan', ''], ['Kurbağa', 'g', 'g', 'kurbaga w', 'genis', 'kurbaga', ''], ['Timsah', 'g', 'y', 'kurbaga y', 'genis', 'disler', ''],
  ['Kaplumbağa', 'g', 'y', 'yok', 'yuv', 'gulen', 'kabuk'], ['Baykuş', 'hvq', 'k', 'sivri k', 'yuv', 'gaga', 'baykus'], ['Papağan', 'rgba', 'w', 'ibik y', 'yuv', 'gaga', 'papagan'], ['Penguen', 'zb', 'w', 'yok', 'yuv', 'gaga', 'penguen'],
  ['Ördek', 'yw', 'o', 'ibik o', 'yuv', 'gaga2', ''], ['Civciv', 'y', 'o', 'ibik y', 'yuv', 'gaga', ''], ['Horoz', 'wh', 'r', 'ibik r', 'cene', 'gaga', 'horoz'], ['Kartal', 'w', 'y', 'yok', 'cene', 'gaga2', 'kartal'],
  ['Rakun', 'q', 'w', 'sivri z', 'cene', 'burun', 'rakun'], ['Kirpi', 'k', 'k', 'diken h', 'yuv', 'burun', ''], ['Ahtapot', 'vrpa', 'v', 'yok', 'yuv', 'sasir', 'ahtapot'], ['Balon Balığı', 'yo', 'w', 'diken o', 'yuv', 'sasir', ''],
  ['Köpekbalığı', 'qb', 'w', 'yuzgec q', 'cene', 'disler', ''], ['Yengeç', 'ro', 'o', 'yengec r', 'genis', 'gulen', ''], ['Arı', 'y', 'y', 'anten z', 'yuv', 'gulen', 'ari'], ['Uğur Böceği', 'r', 'z', 'anten z', 'yuv', 'gulen', 'ugur'],
  ['Dinozor', 'gva', 'y', 'diken y', 'kare', 'disler', ''], ['Ejderha', 'rgvb', 'y', 'boynuz y', 'cene', 'disler', ''], ['Canavar', 'vagp', 'w', 'boynuz w', 'yuv', 'disler', 'tekgoz'], ['Uzaylı', 'ga', 'g', 'anten g', 'tersu', 'sasir', 'uzay'],
  ['Robot', 'qab', 'z', 'anten r', 'kare', 'izgara', 'robot'], ['Kuru Kafa', 'w', 'w', 'yok', 'tersu', 'dislik', 'kafa'], ['Korsan', 'k', 'h', 'yok', 'kare', 'sakal', 'korsan'], ['Kaptan', 'k', 'w', 'yok', 'kare', 'sakal', ''],
  ['Palyaço', 'w', 'r', 'sacyan o', 'yuv', 'palyaco', ''], ['Kardan Adam', 'w', 'w', 'yok', 'yuv', 'havuc', ''], ['Balkabağı', 'o', 'o', 'sap g', 'genis', 'balkabagi', ''], ['Güneş', 'y', 'o', 'isin o', 'yuv', 'gulen', ''],
  ['Cadı', 'g', 'g', 'sacyan v', 'cene', 'gulen', ''], ['Ninja', 'zr', 'k', 'yok', 'yuv', '', 'ninja'], ['Peri', 'k', 'p', 'sacyan p', 'yuv', 'gulen', ''], ['Viking', 'k', 'y', 'boynuz w', 'kare', 'sakal', ''] ];
const AKS = ['', 'Bandanalı', 'Korsan', 'Göz Bantlı', 'Gözlüklü', 'Partici', 'Çiçekli', 'Papyonlu', 'Atkılı', 'Denizci', 'Hasır Şapkalı', 'Kulaklıklı', 'Uykucu', 'Kızgın', 'Şaşkın', 'Yıldız Gözlü', 'Aşçı', 'Sihirbaz'];
export const TURSAY = T.length, AKSSAY = AKS.length;
const ZEMIN = [['SSSSSSSSSSS'], ['CKCKCKCKCKC'], ['FFFFFFFFFFF'], ['IIIIIIIIIII'], ['ggggggggggg'], ['LLLLLLLLLLL'], ['abababababa'], ['kkkkkkkkkkk', 'SSSSSSSSSSS'], ['RwRwRwRwRwR'], ['SCSCSSSCSCS'], ['vYvYvYvYvYv'], ['PPCPPCPPCPP'], []];
const DL = ['ksSandik', 'ksTas', 'ksBuz', 'oyL', 'oyE', 'ksSandikM', 'ksSandikK', 'ksFici'];
export function yuz(ti, ai, tohum) {
  const [ad, cs, p, kul, sek, bur, ek] = T[ti], r = rng(ti * 977 + ai * 131 + (tohum || 0) * 7 + 5), c = cs[(ai + (tohum || 0)) % cs.length], aks = AKS[ai];
  const G = Array.from({ length: UST + 7 }, () => new Array(W).fill('.')), s = (y, x, ch) => { const yy = y + UST; if (yy >= 0 && yy < G.length && x >= 0 && x < W) G[yy][x] = ch; }, y2 = (y, x, ch) => { s(y, x, ch); s(y, 10 - x, ch); }, al = (y, x) => (G[y + UST] || [])[x];
  const sat = (y, a, b, ch) => { for (let x = a; x <= b; x++) s(y, x, ch); };
  // yuz
  const SK = { yuv: [2, 1, 1, 1, 1, 1, 2], kare: [1, 1, 1, 1, 1, 1, 1], cene: [1, 1, 1, 1, 1, 2, 3], genis: [1, 0, 0, 0, 0, 0, 1], tersu: [2, 1, 1, 1, 2, 3, 3] }[sek];
  SK.forEach((a, y) => sat(y, a, 10 - a, c));
  const g = SK;
  // ek desen (gozden once)
  if (ek === 'leke') { const q = r() < 0.5; for (const [y, x] of [[1, 2], [1, 3], [2, 2], [2, 3], [3, 2], [0, 3]]) s(y, q ? x : 10 - x, c === 'z' ? 'q' : c === 'w' ? 'z' : 'h'); }
  if (ek === 'yanak') for (const [y, x] of [[4, 1], [4, 2], [5, 2], [5, 3], [3, 1]]) if (al(y, x) !== '.') y2(y, x, 'w');
  if (ek === 'panda') for (const [y, x] of [[2, 2], [2, 3], [3, 2], [3, 3], [4, 2]]) y2(y, x, 'z');
  if (ek === 'rakun') sat(2, g[2], 10 - g[2], 'z'), sat(3, g[3], 10 - g[3], 'z'), s(2, 5, 'q'), s(3, 5, 'q');
  if (ek === 'yele') { for (let y = 0; y < 7; y++) y2(y, g[y], 'h'); sat(0, 2, 8, 'h'); for (let x = 1; x <= 9; x++) s(-1, x, 'h'); for (let y = 1; y < 6; y++) y2(y, 0, 'h'); }
  if (ek === 'cizgi') { for (const [y, x] of [[0, 5], [1, 5], [0, 3], [2, 1], [4, 1], [1, 2]]) y2(y, x, 'z'); }
  if (ek === 'zebra') for (let y = 0; y < 7; y++) for (let x = 0; x < 5; x++) if ((x + y) % 2 === 0 && al(y, x) !== '.') y2(y, x, 'z');
  if (ek === 'benek') for (const [y, x] of [[0, 4], [1, 2], [2, 5], [4, 1], [5, 2], [1, 5]]) if (al(y, x) !== '.') y2(y, x, 'h');
  if (ek === 'maymun') { for (const y of [2, 3]) for (const x of [2, 3, 4]) y2(y, x, p); sat(4, 2, 8, p); sat(5, 2, 8, p); }
  if (ek === 'kabuk') { for (let x = 1; x <= 9; x++) s(0, x, 'h'); sat(-1, 2, 8, 'y'); sat(-2, 3, 7, 'h'); }
  if (ek === 'baykus') for (const y of [1, 2, 3]) for (const x of [2, 3, 4]) y2(y, x, p);
  if (ek === 'papagan') for (const [y, x] of [[1, 1], [2, 1], [3, 1], [2, 2], [3, 2]]) y2(y, x, 'w');
  if (ek === 'penguen') { for (const y of [2, 3, 4, 5]) for (const x of [2, 3, 4]) y2(y, x, 'w'); sat(6, 3, 7, 'w'); sat(5, 5, 5, 'w'); sat(4, 5, 5, 'w'); }
  if (ek === 'horoz') { s(6, 5, 'r'); s(6, 4, 'r'); s(6, 6, 'r'); }
  if (ek === 'kartal') { sat(0, 2, 8, 'h'); sat(1, 1, 9, 'h'); }
  if (ek === 'ari') { sat(0, 2, 8, 'z'); sat(6, g[6], 10 - g[6], 'z'); sat(4, 1, 9, 'z'); }
  if (ek === 'ugur') { sat(0, 2, 8, 'z'); sat(1, 1, 9, 'z'); for (const [y, x] of [[3, 1], [5, 2], [5, 4]]) y2(y, x, 'z'); }
  if (ek === 'ahtapot') { for (const x of [0, 2, 4]) y2(6, x, c); y2(5, 0, c); y2(6, 1, '.'); y2(6, 3, 'k'); s(6, 5, 'k'); y2(6, 1, 'k'); }
  if (ek === 'ninja') { for (let x = 1; x <= 9; x++) { s(2, x, 'k'); s(3, x, 'k'); } }
  if (ek === 'koyun') { sat(-1, 2, 8, 'w'); for (let y = 2; y < 6; y++) for (let x = 3; x <= 7; x++) s(y, x, 'z'); }
  if (ek === 'robot') { y2(3, 1, 'r'); sat(0, 1, 9, 'z'); }
  // goz
  const koyu = (ch) => ch === 'z' || ch === 'h' || ch === 'v' || ch === 'b', gz = (koyu(c) && ek !== 'penguen' && ek !== 'ninja') || ek === 'rakun' || ek === 'panda' || ek === 'koyun' ? 'w' : 'z';
  let gs = [0, 1, 2, 1, 5][Math.floor(r() * 5)]; if (aks === 'Uykucu') gs = 3; if (aks === 'Kızgın') gs = 4; if (aks === 'Şaşkın') gs = 6; if (aks === 'Yıldız Gözlü') gs = 7; if (ek === 'kafa' || ek === 'uzay') gs = 8;
  if (kul.startsWith('kurbaga')) { for (const y of [-1, -2]) for (const x of [1, 2, 3]) y2(y, x, c); y2(-1, 2, gs === 3 ? c : 'w'); y2(-2, 2, gs === 3 ? 'z' : 'w'); if (gs !== 3) y2(-1, 2, 'z'); }
  else if (ek === 'tekgoz') { for (const y of [1, 2, 3]) sat(y, 4, 6, 'w'); s(2, 5, 'z'); if (gs === 3) sat(1, 4, 6, c); if (gs === 4) s(1, 5, 'z'); }
  else if (gs === 0) y2(2, 3, gz); else if (gs === 1) { y2(2, 3, 'w'); y2(2, 2, 'w'); y2(3, 2, 'w'); y2(3, 3, 'z'); } else if (gs === 2) { y2(2, 3, gz); y2(3, 3, gz); }
  else if (gs === 3) { y2(3, 2, gz); y2(3, 3, gz); } else if (gs === 4) { y2(1, 2, gz); y2(2, 3, gz); y2(3, 3, 'r'); } else if (gs === 5) { y2(2, 3, 'w'); y2(3, 3, 'b'); }
  else if (gs === 6) { for (const y of [1, 2, 3]) for (const x of [2, 3]) y2(y, x, 'w'); y2(2, 3, 'z'); } else if (gs === 7) { y2(2, 3, 'Y'); y2(2, 2, gz === 'w' ? 'w' : c); y2(3, 3, c === 'y' ? 'o' : c); }
  else if (gs === 8) { for (const y of [2, 3]) for (const x of [2, 3]) y2(y, x, 'z'); if (aks === 'Kızgın' || aks === 'Yıldız Gözlü') y2(3, 3, 'r'); }
  // burun / agiz
  const M = { burun: () => { sat(4, 4, 6, p); sat(5, 3, 7, p); s(4, 5, 'z'); if (p === 'z') s(4, 5, 'k'); s(6, 5, 'z'); }, kedi: () => { s(4, 5, 'p'); s(5, 4, p); s(5, 6, p); s(5, 5, 'z'); y2(4, g[4], 'w'); }, uzunburun: () => { for (const y of [3, 4, 5]) s(y, 5, 'z'); },
    disli: () => { sat(4, 4, 6, p); s(4, 5, 'p'); s(5, 4, 'w'); s(5, 6, 'w'); s(5, 5, 'z'); s(6, 5, 'w'); }, gulen: () => { s(5, 4, 'r'); s(5, 5, 'r'); s(5, 6, 'r'); s(4, 3, 'r'); s(4, 7, 'r'); }, domuz: () => { sat(4, 3, 7, p); sat(5, 3, 7, p); s(4, 4, 'z'); s(4, 6, 'z'); },
    koyun: () => { s(5, 5, 'p'); }, hortum: () => { for (const y of [3, 4, 5, 6]) s(y, 5, 'z'); for (const y of [4, 6]) s(y, 5, 'q'); y2(5, 3, 'w'); y2(6, 3, 'w'); }, gergedan: () => { s(3, 5, 'w'); s(4, 5, 'w'); s(2, 5, 'w'); y2(5, 4, 'z'); },
    kurbaga: () => { sat(3, 1, 9, 'z'); y2(1, 4, 'z'); s(4, 4, 'r'); s(4, 5, 'r'); s(4, 6, 'r'); }, disler: () => { sat(5, 2, 8, 'z'); for (const x of [2, 4]) y2(5, x, 'w'); y2(4, 4, 'z'); }, gaga: () => { sat(4, 4, 6, 'o'); s(5, 5, 'o'); s(3, 5, 'o'); }, gaga2: () => { sat(4, 3, 7, p === 'o' ? 'o' : 'y'); sat(5, 4, 6, 'o'); },
    sasir: () => { for (const y of [4, 5]) sat(y, 4, 6, 'z'); s(5, 5, 'r'); }, izgara: () => { sat(5, 3, 7, 'w'); s(5, 4, 'z'); s(5, 6, 'z'); s(4, 5, 'z'); }, dislik: () => { s(4, 5, 'z'); sat(5, 3, 7, 'w'); s(6, 4, 'z'); s(6, 6, 'z'); },
    sakal: () => { const sk = ['h', 'z', 'o', 'w'][Math.floor(r() * 4)]; sat(4, 3, 7, sk); sat(5, 1, 9, sk); sat(6, 1, 9, sk); s(5, 5, 'r'); s(3, 5, 'p'); }, palyaco: () => { s(4, 5, 'r'); s(3, 5, 'r'); sat(5, 3, 7, 'r'); s(5, 5, 'w'); y2(1, 3, 'b'); }, havuc: () => { sat(4, 5, 7, 'o'); sat(5, 4, 6, 'z'); },
    balkabagi: () => { sat(4, 2, 8, 'z'); y2(4, 4, 'y'); sat(5, 3, 7, 'z'); s(5, 5, 'y'); s(3, 5, 'z'); } };
  if (M[bur]) M[bur]();
  if (ek === 'dis') y2(5, 3, 'w');
  // kulak
  const [kt, kc] = kul.split(' ');
  const K = { sivri: () => { y2(-1, 1, c); y2(-1, 2, kc); y2(-1, 3, c); y2(-2, 2, c); y2(0, 1, c); y2(0, 2, c); }, yuvarlak: () => { y2(-1, 1, c === kc ? 'q' : c); y2(-1, 2, kc); y2(0, 1, c); if (ek === 'panda' || ek === 'yele') { y2(-1, 1, kc); y2(-2, 1, kc); y2(-2, 2, kc); y2(-1, 2, kc); } else { y2(-2, 1, c); y2(-2, 2, c); } }, iri: () => { for (const y of [-1, 0, 1]) { y2(y, 0, c); y2(y, 1, kc); } y2(-2, 0, c); y2(-2, 1, c); y2(-1, 2, c); },
    uzun: () => { for (const y of [-1, -2, -3]) { y2(y, 2, c); y2(y, 3, kc); } y2(-4, 2, c); y2(-4, 3, c); }, sarkik: () => { for (const y of [0, 1, 2, 3]) y2(y, 0, kc === c ? 'z' : kc); y2(0, 1, kc === c ? 'z' : kc); }, boynuz: () => { y2(-1, 1, kc); y2(-2, 0, kc); y2(-1, 0, kc); y2(0, 1, c); y2(0, 0, c); y2(1, 0, c); }, geyik: () => { for (const y of [-1, -2, -3]) y2(y, 2, 'k'); y2(-3, 1, 'k'); y2(-3, 3, 'k'); y2(-2, 1, 'k'); y2(1, 0, c); y2(0, 0, c); },
    zurafa: () => { for (const y of [-1, -2]) y2(y, 3, kc); y2(-3, 3, 'z'); y2(1, 0, c); y2(0, 0, c); }, dev: () => { for (const y of [0, 1, 2, 3, 4]) { y2(y, 0, c); y2(y, 1, kc); } }, kucuk: () => { y2(-1, 2, c); y2(0, 1, c); y2(-1, 1, kc); }, ibik: () => { s(-1, 4, kc); s(-1, 5, kc); s(-1, 6, kc); s(-2, 5, kc); s(-2, 4, kc); }, diken: () => { for (const x of [1, 3, 5]) y2(-2, x, kc); for (let x = 1; x <= 9; x++) s(-1, x, kc); y2(2, 0, kc); y2(4, 0, kc); y2(0, 1, kc); },
    yuzgec: () => { s(-1, 5, kc === c ? 'z' : kc); s(-1, 6, kc === c ? 'z' : kc); s(-1, 4, c); s(-2, 5, c); s(-2, 6, c); s(-3, 6, c); y2(3, 0, c); }, yengec: () => { y2(-1, 0, kc); y2(-2, 0, kc); y2(-2, 1, kc); y2(-3, 0, kc); y2(-3, 1, 'o'); y2(0, 0, kc); y2(-1, 3, 'w'); y2(-2, 3, 'z'); }, anten: () => { y2(-1, 3, 'D'); y2(-2, 3, 'D'); y2(-3, 3, kc); }, sacyan: () => { for (const y of [0, 1, 2, 3]) y2(y, 0, kc); y2(0, 1, kc); y2(1, 1, kc); y2(-1, 1, kc); y2(-1, 2, kc); },
    sap: () => { s(-1, 5, kc); s(-2, 5, kc); s(-1, 4, kc); }, isin: () => { for (const x of [1, 3, 5]) y2(-1, x, kc); s(-2, 5, kc); y2(-2, 2, kc); y2(-1, 2, kc); y2(2, 0, kc); y2(4, 0, kc); }, kurbaga: () => { }, yok: () => { } };
  (K[kt] || K.yok)();
  if (ek === 'uzay' || kt === 'isin') { /* dik */ }
  // aksesuar
  const A = { 'Bandanalı': () => { const q = r() < 0.5 ? 'r' : 'b'; sat(0, g[0], 10 - g[0], q); sat(-1, 3, 7, q); s(0, 4, 'w'); s(0, 6, 'w'); s(-1, 5, 'w'); }, 'Korsan': () => { sat(-1, 1, 9, 'z'); sat(-2, 2, 8, 'z'); sat(-3, 3, 7, 'z'); s(-2, 5, 'w'); s(-1, 4, 'Y'); s(-1, 6, 'Y'); }, 'Göz Bantlı': () => { s(2, 7, 'z'); s(3, 7, 'z'); s(2, 8, 'z'); s(3, 8, 'z'); s(1, 6, 'z'); s(0, 5, 'z'); s(0, 4, 'z'); if (koyu(c)) { s(2, 7, 'r'); s(3, 7, 'r'); s(2, 8, 'r'); s(3, 8, 'r'); s(1, 6, 'r'); s(0, 5, 'r'); } },
    'Gözlüklü': () => { const q = c === 'b' ? 'r' : 'b'; for (const y of [2, 3]) for (const x of [2, 3, 4]) y2(y, x, q); sat(2, 5, 5, 'z'); y2(3, 3, 'w'); y2(2, 1, 'z'); }, 'Partici': () => { sat(-1, 3, 7, 'p'); sat(-2, 4, 6, 'a'); s(-3, 5, 'p'); s(-4, 5, 'Y'); }, 'Çiçekli': () => { s(-1, 8, 'p'); s(-2, 8, 'y'); s(-2, 7, 'p'); s(-2, 9, 'p'); s(-3, 8, 'p'); s(-1, 7, 'g'); s(-1, 9, 'g'); }, 'Papyonlu': () => { y2(6, 3, 'r'); y2(6, 4, 'r'); s(6, 5, 'Y'); y2(6, 2, 'r'); }, 'Atkılı': () => { const q = r() < 0.5 ? 'r' : 'g'; sat(6, 1, 9, q); for (const x of [2, 4]) y2(6, x, 'w'); s(5, 9, q); },
    'Denizci': () => { sat(-1, 2, 8, 'w'); sat(-2, 3, 7, 'b'); s(-2, 5, 'Y'); sat(-3, 4, 6, 'w'); }, 'Hasır Şapkalı': () => { sat(-1, 0, 10, 'y'); sat(-2, 3, 7, 'r'); sat(-3, 3, 7, 'y'); }, 'Kulaklıklı': () => { for (const y of [1, 2, 3]) y2(y, 0, 'v'); sat(-1, 2, 8, 'z'); y2(0, 1, 'z'); y2(0, 0, 'z'); y2(2, 0, 'Y'); }, 'Aşçı': () => { sat(-1, 2, 8, 'w'); sat(-2, 3, 7, 'q'); sat(-3, 2, 8, 'w'); sat(-4, 3, 7, 'w'); }, 'Sihirbaz': () => { sat(-1, 1, 9, 'v'); sat(-2, 3, 7, 'v'); s(-2, 5, 'Y'); sat(-3, 4, 6, 'v'); s(-4, 5, 'v'); s(-5, 5, 'Y'); } };
  if (A[aks]) A[aks]();
  let g2 = G.map((x) => x.join('')); while (/^\.*$/.test(g2[0])) g2.shift();
  const zem = ZEMIN[(ti * 5 + ai * 3 + (tohum || 0)) % ZEMIN.length], dl = DL[(ti + ai * 3) % DL.length];
  g2 = g2.concat(zem);
  // yan bos sutunlari at
  let x0 = 11, x1 = 0; for (const q of g2) for (let x = 0; x < 11; x++) if (q[x] !== '.') { x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
  g2 = g2.map((q) => q.slice(x0, x1 + 1));
  const aName = aks === 'Korsan' ? 'Korsan ' + ad : aks ? aks + ' ' + ad : ad;
  return { ad: ad === 'Korsan' && aks === 'Korsan' ? 'Korsan Kaptanı' : aName, aile: 'yuz', alt: ad, d: { g: g2, m: 'r', s: g2.length * g2[0].length > 88 ? 2 : 3, f: 'SkhCa'[0] === 'S' ? ['S', 'h', 'k', 'b', 'o', 'v', 'a'][(ti + ai) % 7] : 'S', dl } };
}
