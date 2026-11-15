// Foxi Smash v5.0: dogrulanmis parcalari (yapi/bolumler/pNN.json) toplar -> yapi/bolumler.json (bolum adlari, ayar) ve
// yapi/uretici/rapor/ozet.md (test raporu, imza cesitliligi). Kullanim: node yapi/uretici/birlestir.mjs
import fs from 'fs';
import path from 'path';
import { imzaStr } from './arketip.js';
const KOK = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const AYAR = JSON.parse(fs.readFileSync(path.join(KOK, 'yapi/bolumler.json'), 'utf8'));
const B = [], RP = [];
for (let n = 0; n * AYAR.parca < AYAR.toplam; n++) {
  const f = path.join(KOK, 'yapi/bolumler', 'p' + String(n).padStart(2, '0') + '.json');
  if (!fs.existsSync(f)) { console.log('eksik parca', f); continue; }
  const p = JSON.parse(fs.readFileSync(f, 'utf8')); p.b.forEach((v, i) => { B[p.ilk + i] = v; });
  const r = path.join(KOK, 'yapi/uretici/rapor', 'p' + String(n).padStart(2, '0') + '.json'); if (fs.existsSync(r)) RP.push(JSON.parse(fs.readFileSync(r, 'utf8')));
}
const ad = []; let eksik = 0;
for (let L = AYAR.el + 1; L <= AYAR.toplam; L++) { if (!B[L]) { eksik++; ad.push(''); } else ad.push(B[L].ad); }
AYAR.ad = ad; fs.writeFileSync(path.join(KOK, 'yapi/bolumler.json'), JSON.stringify(AYAR));
// kurallar: art arda ayni arketip yok, son 5'te en fazla 1
let kural = 0; for (let L = AYAR.el + 2; L <= AYAR.toplam; L++) { if (!B[L]) continue; const s5 = [1, 2, 3, 4].map((k) => B[L - k] && B[L - k].a); if (s5.includes(B[L].a)) kural++; }
const say = (f) => { const m = new Map(); for (let L = AYAR.el + 1; L <= AYAR.toplam; L++) if (B[L]) { const k = f(B[L]); m.set(k, (m.get(k) || 0) + 1); } return m; };
const imz = say((v) => imzaStr(v.imza)), kaba = say((v) => [v.imza.a, v.imza.np, v.imza.H, v.imza.W, v.imza.hareket].join('|')), ark = say((v) => v.a);
const test = RP.reduce((s, r) => s + r.test, 0), yeniden = RP.reduce((s, r) => s + r.yeniden, 0), hata = {}; for (const r of RP) for (const k in r.hata) hata[k] = (hata[k] || 0) + r.hata[k];
const basarisiz = RP.flatMap((r) => r.basarisiz || []);
const enSik = [...imz.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
const md = ['# Bölüm üretimi ve otomatik test raporu', '', 'Tarih: ' + new Date().toISOString().slice(0, 10), '',
  '| | |', '|---|---|', '| Bölüm aralığı | ' + (AYAR.el + 1) + '-' + AYAR.toplam + ' |', '| Kayıtlı bölüm | ' + (AYAR.toplam - AYAR.el - eksik) + ' |', '| Test edilen deneme | ' + test + ' |',
  '| Yeniden üretilen | ' + yeniden + ' |', '| Hatalı kalan | ' + basarisiz.length + (basarisiz.length ? ' (' + basarisiz.join(', ') + ')' : '') + ' |', '| Farklı imza | ' + imz.size + ' |', '| Farklı kaba görünüm (arketip, platform, boy, en, hareket) | ' + kaba.size + ' |',
  '| Arka arkaya/son 5 kuralı ihlali | ' + kural + ' |', '', '## Hatalar (yeniden üretme nedeni)', '', ...Object.entries(hata).sort((a, b) => b[1] - a[1]).map(([k, v]) => '- ' + k + ': ' + v), '',
  '## Arketip dağılımı', '', ...[...ark.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => '- ' + k + ': ' + v), '', '## En sık imzalar', '', ...enSik.map(([k, v]) => '- ' + v + ' × `' + k + '`')];
fs.writeFileSync(path.join(KOK, 'yapi/uretici/rapor/ozet.md'), md.join('\n') + '\n');
console.log(md.join('\n'));
