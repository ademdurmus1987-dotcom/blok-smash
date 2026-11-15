// Foxi Smash v5.0: kayitli bolumlerin top sayisini arketip.js topHesap ile yeniden hesaplar (fizik testi gerekmez; bot atisi kayitta).
// Kullanim: node yapi/uretici/top_ayar.mjs
import fs from 'fs';
import path from 'path';
import { topHesap } from './arketip.js';
const D = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../bolumler');
let n = 0;
for (const f of fs.readdirSync(D)) {
  const p = JSON.parse(fs.readFileSync(path.join(D, f), 'utf8'));
  p.b.forEach((v, i) => { const L = p.ilk + i, t = topHesap(Object.assign({}, v, { L }), v.bot || 0); if (t !== v.top) { v.top = t; n++; } });
  fs.writeFileSync(path.join(D, f), JSON.stringify(p));
}
console.log('degisen', n);
