// Foxi Smash v5.0: balance-check (top sayisi, zorluk, altin) -> yapi/uretici/rapor/denge.md
// Kullanim: node yapi/uretici/denge_kontrol.mjs [el_bolumleri.json]
// el_bolumleri.json: 1-25 icin oyunun verdigi { L, n, top } listesi (ekran goruntusu kosusundan); yoksa o bolum "olculmedi" yazilir.
import fs from 'fs';
import path from 'path';
import { zorluk, SERT } from './arketip.js';
const KOK = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const AYAR = JSON.parse(fs.readFileSync(path.join(KOK, 'yapi/bolumler.json'), 'utf8'));
const B = {};
for (const f of fs.readdirSync(path.join(KOK, 'yapi/bolumler'))) { const p = JSON.parse(fs.readFileSync(path.join(KOK, 'yapi/bolumler', f), 'utf8')); p.b.forEach((v, i) => { B[p.ilk + i] = v; }); }
const EL = {}; const ELF = process.argv[2] || path.join(KOK, 'yapi/uretici/rapor/el_1_25.json'); if (fs.existsSync(ELF)) for (const x of JSON.parse(fs.readFileSync(ELF, 'utf8'))) EL[x.L] = x;
// hedefler (tasarim): top basina 3-5 blok; bot atisi <= top; zor bolumde top/blok en dar; altin: ilk kazanc 40-100 (+20 zor)
const HEDEF = { blokTop: [1.9, 3.5], altin: [40, 120] };   // blok/top: elle yapilmis 1-25 olcumunun (ort. ~2,4) cevresi
// insan tahmini: bot kadar dikkatsiz degil; blok basina ~0.26 atis, en az botun %60'i
const insan = (n, bot) => Math.max(Math.ceil(n / 3.8), Math.ceil((bot || 0) * 0.6));
function altin(top, at, zor) { const kalan = Math.max(0, top - at), r = kalan / top, st = r >= 0.4 ? 3 : r >= 0.15 ? 2 : 1; return { st, kaz: 10 + st * 10 + Math.min(60, kalan * 5) + (zor ? 20 : 0) }; }
function satir(L) {
  if (L <= AYAR.el) { const e = EL[L]; if (!e) return { L, el: 1 }; const at = insan(e.n, 0), a = altin(e.top, at, L % 5 === 0); return { L, el: 1, n: e.n, top: e.top, bot: '-', d: '-', bt: e.n / e.top, ...a, zor: L % 5 === 0 }; }
  const v = B[L]; if (!v || !v.top) return { L, yok: 1 };
  const n = v.c.length, at = insan(n, v.bot), a = altin(v.top, at, v.zor);
  return { L, n, top: v.top, bot: v.bot, d: zorluk(L), bt: n / v.top, sert: v.c.filter((c) => SERT.has(c[3])).length, ...a, zor: !!v.zor, a: v.a, ok: v.top >= Math.ceil(v.bot * 0.7) };
}
function blok(a, b) {
  const S = []; for (let L = a; L <= b; L++) S.push(satir(L));
  const ol = S.filter((x) => x.n), dis = [];
  for (const x of ol) {
    if (x.bt < HEDEF.blokTop[0] || x.bt > HEDEF.blokTop[1]) dis.push([x.L, 'blok/top', HEDEF.blokTop.join('-'), x.bt.toFixed(2), x.bt < HEDEF.blokTop[0] ? 'fazla top (kolay)' : 'az top (zor)']);
    if (x.ok === false) dis.push([x.L, 'top >= bot×0,7', '>= ' + Math.ceil(x.bot * 0.7), x.top, 'top yetmeyebilir']);
    if (x.kaz < HEDEF.altin[0] || x.kaz > HEDEF.altin[1] + 20) dis.push([x.L, 'ilk kazanç altını', HEDEF.altin.join('-'), x.kaz, '']);
  }
  const ort = (f, X = ol) => (X.length ? X.reduce((s, x) => s + f(x), 0) / X.length : 0);
  const z = ol.filter((x) => x.zor), nz = ol.filter((x) => !x.zor);
  return { S, ol, dis, ozet: { bolum: ol.length, top: ort((x) => x.top).toFixed(1), blokTop: ort((x) => x.bt).toFixed(2), altin: ort((x) => x.kaz).toFixed(0), yildiz: ort((x) => x.st).toFixed(2), zorBlokTop: ort((x) => x.bt, z).toFixed(2), normalBlokTop: ort((x) => x.bt, nz).toFixed(2) } };
}
const A = blok(1, 100), C = blok(700, 800);
const md = ['# Balance Check: Foxi Smash bölümleri (top, zorluk, altın)', '', '### Data Sources Analyzed', '- yapi/bolumler/p00.json, p06.json, p07.json (26-100, 700-800: kayıtlı bölümler)', '- yapi/oyun.js `win()` (altın: 10 + yıldız×10 + kalan top×5 (en çok 60), zor bölüm +20), `shotsFor()` (1-25)', '- yapi/uretici/arketip.js `zorluk()`, yapi/uretici/dogrula.js `topHesap()`',
  '- Tasarım hedefleri: GDD yok; hedefler bu işin şartnamesinden ve eski dengeden alındı: top başına 1,9-3,5 blok (elle yapılmış 1-25 ölçümüne göre), top ≥ botun yuzde 70 kadari (bot kusursuz nişan alır ama yapıyı bilmez), ilk kazanç 40-120 altın (+20 zor).', '',
  '### Health Summary: ' + (A.dis.length + C.dis.length === 0 ? 'HEALTHY' : A.dis.some((d) => d[1].startsWith('bot')) || C.dis.some((d) => d[1].startsWith('bot')) ? 'CONCERNS' : 'CONCERNS'), '',
  '| Aralık | Bölüm | Ort. top | Blok/top | Zor bölüm blok/top | Normal blok/top | Ort. ilk altın | Ort. yıldız (tahmini) |', '|---|---|---|---|---|---|---|---|',
  ...[['1-100', A], ['700-800', C]].map(([k, X]) => '| ' + k + ' | ' + X.ozet.bolum + ' | ' + X.ozet.top + ' | ' + X.ozet.blokTop + ' | ' + X.ozet.zorBlokTop + ' | ' + X.ozet.normalBlokTop + ' | ' + X.ozet.altin + ' | ' + X.ozet.yildiz + ' |'), '',
  '### Outliers Detected', '', '| Bölüm | Değer | Beklenen | Gerçek | Not |', '|---|---|---|---|---|', ...[...A.dis, ...C.dis].slice(0, 60).map((d) => '| ' + d.join(' | ') + ' |'), (A.dis.length + C.dis.length > 60 ? '\n(+' + (A.dis.length + C.dis.length - 60) + ' satır daha)' : ''), '',
  '### Progression Analysis (10 bölümlük döngü)', '', '| Bölüm | Arketip | Blok | Zorluk | Top | Bot | Blok/top | İlk altın |', '|---|---|---|---|---|---|---|---|',
  ...[...A.S.slice(25, 55), ...C.S.slice(70, 101)].filter((x) => x.n).map((x) => '| ' + x.L + (x.zor ? ' (zor)' : '') + ' | ' + (x.a || 'el') + ' | ' + x.n + ' | ' + (typeof x.d === 'number' ? x.d.toFixed(2) : x.d) + ' | ' + x.top + ' | ' + x.bot + ' | ' + x.bt.toFixed(2) + ' | ' + x.kaz + ' |')];
fs.writeFileSync(path.join(KOK, 'yapi/uretici/rapor/denge.md'), md.join('\n') + '\n');
console.log(md.slice(0, 16).join('\n')); console.log('aykiri', A.dis.length, C.dis.length);
