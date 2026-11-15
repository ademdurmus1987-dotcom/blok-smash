// Foxi Smash v5.1: kayitli bolumlerde (yapi/bolumler/pNN.json) kapali bloklari kaliteli karsiligiyla degistirir.
// Kullanim: node yapi/uretici/kapali_uygula.mjs   -> degisen bolum numaralari rapor/kapali_degisen.json'a yazilir.
// Sonra: python3 yapi/uretici/kapali_test.py  (degisen bolumleri fizikle yeniden test eder, hatalilari yeniden uretir)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { kapaliMi, kapaliUygula } from '../kapali.js';
const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const B = path.join(KOK, 'yapi/bolumler'), degisen = [], say = {};
for (const f of fs.readdirSync(B).filter((x) => /^p\d+\.json$/.test(x)).sort()) {
  const v = JSON.parse(fs.readFileSync(path.join(B, f), 'utf8')); let n = 0;
  v.b.forEach((Y, i) => {
    if (!Y.c.some((c) => kapaliMi(c[3]))) return;
    for (const c of Y.c) if (kapaliMi(c[3])) say[c[3]] = (say[c[3]] || 0) + 1;
    Y.c = kapaliUygula(Y.c); Y.kapali = 1; degisen.push(v.ilk + i); n++;
  });
  if (n) fs.writeFileSync(path.join(B, f), JSON.stringify(v));
  console.log(f, n);
}
fs.writeFileSync(path.join(KOK, 'yapi/uretici/rapor/kapali_degisen.json'), JSON.stringify({ degisen, blok: say }));
console.log('degisen bolum:', degisen.length, say);
