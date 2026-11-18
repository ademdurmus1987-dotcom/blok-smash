// Foxi Smash v8.0: zorluk egrisi raporu (eski top sayisi vs egri.js) -> yapi/uretici/rapor/egri.md
// Kullanim: node yapi/uretici/egri_rapor.mjs
import fs from 'fs';
import path from 'path';
import { plan, planY, topSay, genel, AYAR } from '../egri.js';
const KOK = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const B = {};
for (const f of fs.readdirSync(path.join(KOK, 'yapi/bolumler'))) { const p = JSON.parse(fs.readFileSync(path.join(KOK, 'yapi/bolumler', f), 'utf8')); p.b.forEach((v, i) => { B[p.ilk + i] = v; }); }
const S = Object.keys(B).map(Number).sort((a, b) => a - b).map((L) => { const v = B[L], P = planY(L, v), t = topSay(L, v, P); return { L, n: v.c.length, eski: v.top, yeni: t, bot: v.bot, tip: P.tip, et: P.etiket || '', be: v.c.length / v.top, by: v.c.length / t }; });
const ort = (X, f) => X.reduce((s, x) => s + f(x), 0) / Math.max(1, X.length);
const ARAL = [[26, 100], [101, 200], [201, 300], [301, 500], [501, 750], [751, 1000], [1001, 1500], [1501, 2000]];
const md = ['# Zorluk eğrisi raporu (v8.0)', '', 'Ölçü: **küp / top** (bir topla ortalama kaç küp düşürmek gerekir; büyüdükçe zor). Hazine ve Altın Yağmuru bölümleri ortalamaya katılmadı (hedefleri farklı).', '',
  '| Aralık | Eski küp/top (normal) | Yeni küp/top (normal) | Yeni zor | Yeni kaptan | Genel çarpan |', '|---|---|---|---|---|---|'];
for (const [a, b] of ARAL) { const X = S.filter((x) => x.L >= a && x.L <= b), N = X.filter((x) => x.tip === 'normal' && !x.et), Z = X.filter((x) => x.et && x.tip !== 'kaptan'), K = X.filter((x) => x.tip === 'kaptan');
  md.push('| ' + a + '-' + b + ' | ' + ort(N, (x) => x.be).toFixed(2) + ' | ' + ort(N, (x) => x.by).toFixed(2) + ' | ' + ort(Z, (x) => x.by).toFixed(2) + ' | ' + (K.length ? ort(K, (x) => x.by).toFixed(2) : '-') + ' | ' + genel((a + b) / 2).toFixed(2) + ' |'); }
const say = {}; for (const x of S) say[x.tip] = (say[x.tip] || 0) + 1; const et = {}; for (const x of S) if (x.et) et[x.et] = (et[x.et] || 0) + 1;
md.push('', '## Bölüm türleri (26-2000)', '', ...Object.entries(say).map(([k, v]) => '- ' + k + ': ' + v), '', 'Etiket: ' + Object.entries(et).map(([k, v]) => k + ' ' + v).join(', '), '',
  '## Örnek: 2 dünya (41-60) ve 991-1010', '', '| Bölüm | Tür | Etiket | Küp | Bot | Eski top | Yeni top |', '|---|---|---|---|---|---|---|',
  ...S.filter((x) => (x.L >= 41 && x.L <= 60) || (x.L >= 991 && x.L <= 1010)).map((x) => '| ' + x.L + ' | ' + x.tip + ' | ' + x.et + ' | ' + x.n + ' | ' + x.bot + ' | ' + x.eski + ' | ' + x.yeni + ' |'));
const tabanda = S.filter((x) => x.yeni === Math.ceil(x.bot * AYAR.taban[x.tip]) && x.yeni > Math.round(0)).length;
md.push('', 'Top sayısı bot alt sınırına dayanan bölüm: ' + tabanda + ' / ' + S.length);
fs.writeFileSync(path.join(KOK, 'yapi/uretici/rapor/egri.md'), md.join('\n') + '\n');
console.log(md.slice(0, 16).join('\n')); console.log(md.slice(16, 30).join('\n'));
