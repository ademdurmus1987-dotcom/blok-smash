// Foxi Smash v12.2: ilk25.mjs -> pilot/tasarim/t19.json (yapi 5900-5924). node ilk_yaz.mjs
import { writeFileSync } from 'fs';
import { ILK } from './ilk25.mjs';
import { yerlestir } from '../../pilot/izgara.js';
const T = {};
for (const [L, ad, d, h] of ILK) { const r = yerlestir(d); if (r.dolgu < 0) throw new Error('kurulamadi ' + L); T[5900 + L - 1] = Object.assign({ ad }, d, h && h !== 'sabit' ? { h } : {}); console.log(L, ad, r.P.length); }
writeFileSync('../../pilot/tasarim/t19.json', JSON.stringify({ surum: 1, tasarim: T }));
