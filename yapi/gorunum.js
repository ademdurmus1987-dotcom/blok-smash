// Foxi Smash v12.2 (23 Kas 2026, Adem: 'o kadar altin yildiz kazandik harcayacak bir sey yok'): Gardirop.
// Altinla top arabasi ve gulle gorunumu alinir; pahali olanlar yildiz da ister (y: gereken toplam yildiz, harcanmaz).
// Yalniz GORUNUM: atis, fizik, top sayisi ayni. Kayit: SV.gor = { t: secili araba, g: secili gulle, s: [sahip olunanlar] }.
// Eski hal (Gardirop yok): ?gor=0
export const GOR = new URLSearchParams(location.search).get('gor') !== '0';
// araba renkleri: govde (arka kubbe), namlu, ahsap (tekerlek, agiz), altin (gobek, dingil, patiler), krem (jant, benek)
export const ARABA = [
  { id: 't0', ad: 'Korsan Tilki', f: 0, y: 0, r: { govde: '#f2452c', namlu: '#0f9fb4', ahsap: '#b9692a', altin: '#f3d49a', krem: '#fff0cf' } },
  { id: 't1', ad: 'Okyanus', f: 1500, y: 0, r: { govde: '#2b7de0', namlu: '#f5f7fa', ahsap: '#6b4a32', altin: '#ffd65a', krem: '#e8f4ff' } },
  { id: 't2', ad: 'Orman', f: 3000, y: 30, r: { govde: '#3fa047', namlu: '#7a5236', ahsap: '#5a3b24', altin: '#ffe08a', krem: '#f1f7d8' } },
  { id: 't3', ad: 'Mercan', f: 5000, y: 60, r: { govde: '#ff6f91', namlu: '#ffe0b8', ahsap: '#a07a62', altin: '#fff29a', krem: '#fff4f6' } },
  { id: 't4', ad: 'Gece Avcısı', f: 8000, y: 120, r: { govde: '#2c3640', namlu: '#ff7a3c', ahsap: '#3c4a54', altin: '#c6d2dc', krem: '#e6edf2' } },
  { id: 't5', ad: 'Buzul', f: 12000, y: 200, r: { govde: '#9fdcf8', namlu: '#1c6fb4', ahsap: '#8ea2b0', altin: '#ffffff', krem: '#ffffff' } },
  { id: 't6', ad: 'Volkan', f: 18000, y: 320, r: { govde: '#3a2a26', namlu: '#ff4a1a', ahsap: '#5a2e1e', altin: '#ffb23c', krem: '#ffd9a8' } },
  { id: 't7', ad: 'Güneş Tilkisi', f: 30000, y: 500, r: { govde: '#ffb300', namlu: '#e2541a', ahsap: '#4e3426', altin: '#fff3d6', krem: '#fffaf0' } }
];
export const GULLE = [
  { id: 'g0', ad: 'Mor Gülle', f: 0, y: 0, c: '#8a34f0' },
  { id: 'g1', ad: 'Demir Gülle', f: 800, y: 0, c: '#4a5560' },
  { id: 'g2', ad: 'Ateş Gülle', f: 2000, y: 20, c: '#ff5a1f' },
  { id: 'g3', ad: 'Deniz Gülle', f: 3500, y: 50, c: '#1fa6d8' },
  { id: 'g4', ad: 'Yosun Gülle', f: 5500, y: 90, c: '#46b04a' },
  { id: 'g5', ad: 'Pembe Gülle', f: 8000, y: 150, c: '#ff5fa8' },
  { id: 'g6', ad: 'Kar Gülle', f: 12000, y: 240, c: '#eef6ff' },
  { id: 'g7', ad: 'Altın Gülle', f: 25000, y: 450, c: '#ffc21a' }
];
export const gorSec = (SV) => { const g = SV.gor || {}; return { araba: ARABA.find((a) => a.id === g.t) || ARABA[0], gulle: GULLE.find((a) => a.id === g.g) || GULLE[0] }; };
// magazadaki kucuk resim: yandan top arabasi (tekerlek, govde, namlu) ya da gulle
export function arabaSvg(r) {
  return '<svg viewBox="0 0 64 48" aria-hidden="true"><ellipse cx="32" cy="44" rx="24" ry="3" fill="#0003"/>' +
    '<g transform="rotate(-14 30 24)"><rect x="30" y="15" width="24" height="15" rx="4" fill="' + r.namlu + '" stroke="#0005" stroke-width="1.5"/><rect x="51" y="13" width="6" height="19" rx="2.5" fill="' + r.ahsap + '" stroke="#0005" stroke-width="1.5"/>' +
    '<ellipse cx="26" cy="22.5" rx="15" ry="12" fill="' + r.govde + '" stroke="#0005" stroke-width="1.5"/><ellipse cx="22" cy="18" rx="5" ry="3" fill="#fff6"/><rect x="34" y="14" width="3" height="17" rx="1.5" fill="' + r.altin + '"/></g>' +
    '<circle cx="26" cy="35" r="9" fill="' + r.ahsap + '" stroke="#0005" stroke-width="1.5"/><circle cx="26" cy="35" r="6" fill="none" stroke="' + r.krem + '" stroke-width="1.6"/><circle cx="26" cy="35" r="2.6" fill="' + r.altin + '"/></svg>';
}
export function gulleSvg(c) {
  return '<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="43" rx="14" ry="3" fill="#0003"/><circle cx="24" cy="23" r="16" fill="' + c + '" stroke="#0005" stroke-width="1.6"/>' +
    '<ellipse cx="18" cy="16" rx="6" ry="4" fill="#fff8" transform="rotate(-30 18 16)"/><circle cx="31" cy="30" r="3" fill="#0002"/></svg>';
}
// v12.19 deneme (?ocak=1): Topcu Ocagi kostumleri (Adem'in Gemini cizimleri, karakter/ocak/). Kahraman hep Foxi; yalniz gorunum.
// Kayit: SV.gor.k = secili kostum, sahiplik SV.gor.s (araba/gulle ile ayni dizi).
export const OCAK = /[?&]ocak=1/.test(location.search);
export const KOSTUM = [
  { id: 'korsan', ad: 'Korsan', f: 0, y: 0, soz: ['Ahoy Kaptan!', 'Kuleyi yıkalım!', 'Toplar hazır!', 'Yelkenler fora!'] },
  { id: 'osmanli', ad: 'Osmanlı Topçusu', f: 2000, y: 0, soz: ['Şahi topu ateşe hazır!', 'Haydi topçular!', 'Kuleyi yıkalım!'] },
  { id: 'sovalye', ad: 'Şövalye', f: 4000, y: 40, soz: ['Kalkan hazır, top hazır!', 'Kaleyi yıkalım!', 'İleri şövalyeler!'] },
  { id: 'samuray', ad: 'Samuray', f: 7000, y: 90, soz: ['Sabır ve nişan!', 'Tek atış, tam isabet!', 'Kuleyi yıkalım!'] },
  { id: 'viking', ad: 'Viking', f: 10000, y: 150, soz: ['Kuzeyden geldik!', 'Toplar hazır!', 'Haydi tayfa!'] },
  { id: 'roma', ad: 'Roma Lejyoneri', f: 15000, y: 250, soz: ['Lejyon hazır!', 'Hedef kule!', 'İleri!'] }
];
export const kostumSec = (SV) => (OCAK && KOSTUM.find((k) => k.id === (SV.gor || {}).k)) || KOSTUM[0];
export const kostumResim = (id, poz) => '../karakter/ocak/' + id + '_' + poz + '.webp?v=1';
