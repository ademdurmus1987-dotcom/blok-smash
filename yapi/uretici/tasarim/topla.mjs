// Foxi Smash v12: butun aileleri kurar, birbirine benzeyenleri eler, pilot/tasarim/t*.json (100'er) ve havuz.json yazar.
//   node topla.mjs
import { writeFileSync, readFileSync, readdirSync, unlinkSync } from 'fs';
import { yerlestir, GEN, BOY } from '../../pilot/izgara.js';
import * as Y from './yuz.mjs'; import * as C from './cizim.mjs'; import * as B from './bina.mjs'; import * as D from './duvar.mjs'; import * as Z from './duzen.mjs';
const P = '../../pilot/', S = 1.55 * 1.004;
// --- resim ozeti: on yuz 15x14 hucre, renk sinifi ---
const sinif = (t) => t.startsWith('ksTas') || t === 'ksKemer' ? 'S' : t.startsWith('ksKalas') || t === 'ksSandik' || t.startsWith('ksFici') || t === 'ksDirek' ? 'C' : t === 'ksSandikK' || t === 'ksTNT' ? 'K' : t === 'ksSandikM' || t === 'ksMorSutun' ? 'P' : t.startsWith('ksBuz') ? 'A' : t === 'ksYildiz' ? 'S2' : t === 'ksSutun' ? 'G' : t === 'ksSiseY' ? 'Y' : t === 'ksSiseB' ? 'M' : t === 'ksSiseM' ? 'P' : t === 'oyA' ? 'T' : t[t.length - 1];
export function ozet(L) { const g = {}; for (const [t, x, y, z] of L.slice().sort((a, b) => a[3] - b[3])) { const w = GEN[t] || 1, h = BOY[t] || 1, c = sinif(t); for (let i = 0; i < w; i++) for (let j = 0; j < Math.max(1, Math.round(h)); j++) { const X = Math.round(x - w / 2 + i + 0.5 - 0.01), Yy = Math.floor(y + j + 0.01); g[X + ',' + Yy] = c; } } return g; }
export function benzer(a, b) { let en = 0; const ka = Object.keys(a), nb = Object.keys(b).length; for (const s of [-1, 0, 1]) { let ay = 0, or = 0; for (const k of ka) { const [x, y] = k.split(','); const v = b[(+x + s) + ',' + y]; if (v) { or++; if (v === a[k]) ay++; } } const bir = ka.length + nb - or; en = Math.max(en, ay / bir); } return en; }
// --- eski tasarimlar ---
const ESKI = [];
for (const f of ['resim', 'duvar', 'yeni', 'yapi', 'ornek', 'ucb', 'karma', 'ogretici']) { const V = JSON.parse(readFileSync(P + f + '.json', 'utf8')).bolumler; for (const n in V) { if (+n >= 960 && +n <= 999 && !(+n <= 968)) continue; const L = V[n].parca.filter((p) => p.p === 'ana.0').map((p) => [p.t, p.x / S, p.y / 1.553, p.z / S]); ESKI.push({ n: +n, ad: V[n].ad, o: ozet(L), np: V[n].parca.length, f, kalip: V[n].kalip }); } }
// --- adaylar ---
const SIFAT = 'Şirin,Neşeli,Cesur,Uykucu,Şanslı,Küçük,Büyük,Gizemli,Parlak,Sessiz,Coşkun,Mercan,Zümrüt,Kızıl,Gizli,Altın,Gümüş,Yakut,Safir,Amber,Kehribar,Turkuaz,Lacivert,Mor,Pembe,Turuncu,Yeşil,Mavi,Sarı,Beyaz,Minik,Dev,Tatlı,Hızlı,Yaramaz,Kocaman,Şık,Süslü,Renkli,Benekli,Çizgili,Uzun,Kısa,Geniş,Dar,Yüksek,Alçak,Yuvarlak,Köşeli,Eğik'.split(',');
let A = [];
const YUZN = 9; for (let a = 0; a < YUZN; a++) for (let t = 0; t < Y.TURSAY; t++) A.push(Y.yuz(t, a === 0 ? 0 : ((t * 7 + a * 5) % (Y.AKSSAY - 1)) + 1, a));
const CZ = C.uret(); A.push(...CZ);
const SIN = { taht: 8, saatkulesi: 10, tori: 0, kemerler: 14, piramit: 18, bayrak: 12, roket: 12, pagoda: 12, tapinak: 16, agac: 16 };
const bn = {}; for (const x of B.uret(26)) { bn[x.alt] = bn[x.alt] || 0; if (bn[x.alt] >= (SIN[x.alt] == null ? 24 : SIN[x.alt])) continue; bn[x.alt]++; x.ad = SIFAT[(bn[x.alt] * 7 + x.alt.length * 11 + x.alt.charCodeAt(0)) % SIFAT.length] + ' ' + x.ad; A.push(x); }
A.push(...D.uret()); const zn = {}; for (const x of Z.uret(18)) { zn[x.alt] = (zn[x.alt] || 0) + 1; x.ad = SIFAT[(zn[x.alt] * 11 + x.alt.charCodeAt(1)) % SIFAT.length] + ' ' + x.ad; A.push(x); }
const red = { kurulamadi: 0, buyuk: 0, benzer: 0, ad: 0 }, HAV = [], adlar = new Set(ESKI.map((e) => e.ad)); const alt = {};
for (const x of A) {
  const r = yerlestir(x.d); if (r.dolgu < 0) { red.kurulamadi++; continue; } const L = r.P;
  if (L.length > 175) { red.buyuk++; continue; } if (L.length < 14) { red.buyuk++; continue; }
  const o = ozet(L), hc = Object.keys(o).length; let b = 0; for (const e of ESKI) { b = benzer(o, e.o); if (b > 0.7) break; } if (b > 0.7) { red.benzer++; continue; }
  let kot = false; for (const h of HAV) { const e = x.alt === h.alt && x.aile === h.aile ? (x.aile === 'cizim' ? 0.62 : 0.74) : 0.72; if (benzer(o, h.o) > e) { kot = true; break; } } if (kot) { red.benzer++; continue; }
  let ad = x.ad; if (adlar.has(ad)) { let i = 0; do { ad = SIFAT[(i * 5 + HAV.length) % SIFAT.length] + ' ' + x.ad; i++; } while (adlar.has(ad) && i < 90); } if (adlar.has(ad)) { red.ad++; continue; } adlar.add(ad);
  HAV.push({ ad, aile: x.aile, alt: x.alt, o, np: L.length, hc, d: x.d });
}
const say = {}; HAV.forEach((h) => { say[h.aile] = (say[h.aile] || 0) + 1; const k = h.aile + ':' + h.alt; alt[k] = (alt[k] || 0) + 1; });
console.log('aday', A.length, 'kalan', HAV.length, say, red); console.log(Object.entries(alt).filter(([k]) => /bina|duzen/.test(k)).map(([k, v]) => k.split(':')[1] + v).join(' '));
// kimlik: kararli (ad'a bagli degil, sirayla); eski havuz varsa korunmaz
for (const f of readdirSync(P + 'tasarim')) unlinkSync(P + 'tasarim/' + f);
const dosya = {}; HAV.forEach((h, i) => { h.n = 4000 + i; const f = Math.floor(i / 100); (dosya[f] = dosya[f] || {})[h.n] = Object.assign({ ad: h.ad }, h.d); });
let bt = 0; for (const f in dosya) { const s = JSON.stringify({ surum: 1, tasarim: dosya[f] }); bt += s.length; writeFileSync(P + 'tasarim/t' + f + '.json', s); }
writeFileSync('havuz.json', JSON.stringify(HAV.map(({ n, ad, aile, alt, np, hc }) => ({ n, ad, aile, alt, np, hc })))); console.log('dosya', Object.keys(dosya).length, 'bayt', bt);
export { HAV, ESKI };
