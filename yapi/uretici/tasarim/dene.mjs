// node dene.mjs aile cikti.json : bir ailenin tasarimlarini kurar (onizleme icin)
import { writeFileSync } from 'fs'; import { yerlestir } from '../../pilot/izgara.js';
const [, , aile, out, n] = process.argv; let L = [];
if (aile === 'yuz') { const m = await import('./yuz.mjs'); for (let t = 0; t < m.TURSAY; t++) for (let a = 0; a < (+n || 1); a++) L.push(m.yuz(t, a === 0 ? 0 : (t * 7 + a * 5) % m.AKSSAY)); }
else { const m = await import('./' + aile + '.mjs'); L = m.uret(+n || 0); }
const O = []; for (const x of L) { const r = yerlestir(x.d); if (r.dolgu < 0) console.log('KURULAMADI', x.ad); O.push({ ad: x.ad + ' ' + r.P.length, P: r.P }); }
writeFileSync(out, JSON.stringify(O)); console.log(O.length, 'ort parca', Math.round(O.reduce((a, b) => a + b.P.length, 0) / O.length), 'en cok', Math.max(...O.map((o) => o.P.length)));
