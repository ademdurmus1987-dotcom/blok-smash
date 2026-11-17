// Foxi Smash — gorsel ayarlar (tek config dosyasi).
// Parlak blok kutuphanesi (sekiller.js) butun degerlerini buradan okur. Oyun mantigi/bolum verisi burada YOK.

// ---- renk paleti: her sekil bu 6 renkten biriyle boyanir ----
export const PALET = {   // isik altinda patlamasin diye ana renkler bir ton koyu ve cok doygun secildi (ACES parlakta pastele kayar)
  kirmizi: { ana: '#d4142f', acik: '#ff5a6c', koyu: '#8e0618' },
  mor:     { ana: '#7426d9', acik: '#a96bff', koyu: '#4a0f9e' },
  yesil:   { ana: '#12a83c', acik: '#4fdc74', koyu: '#06702a' },
  sari:    { ana: '#f0b000', acik: '#ffd84a', koyu: '#b07400' },
  turuncu: { ana: '#ef6400', acik: '#ff9a3d', koyu: '#a83c00' },
  mavi:    { ana: '#1270e0', acik: '#4fa6ff', koyu: '#0a46a0' }
};
export const RENKLER = Object.keys(PALET);
export const ALTIN = { ana: '#ffc93a', koyu: '#c88a10' };

// ---- malzemeler (MeshPhysicalMaterial) ----
// seker/oyuncak plastik: clearcoat + dusuk roughness; buz: transmission; tas ve ahsap daha mat
export const MALZEME = {
  plastik: { roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.0 },
  kapak:   { roughness: 0.3, metalness: 0, clearcoat: 0.8, clearcoatRoughness: 0.12, envMapIntensity: 1.0 },
  ikon:    { roughness: 0.25, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.1 },
  altin:   { color: '#ffbf1f', roughness: 0.24, metalness: 1, clearcoat: 0, envMapIntensity: 1.8 },
  buz:     { color: '#9adcff', roughness: 0.07, metalness: 0, transmission: 0.42, thickness: 0.9, ior: 1.31, clearcoat: 1, clearcoatRoughness: 0.04, attenuationColor: '#3aa8ff', attenuationDistance: 1.6, envMapIntensity: 1.3 },
  buzDusuk: { color: '#a8e6ff', roughness: 0.1, metalness: 0, transparent: true, opacity: 0.78, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.4 },   // transmission'siz yedek (zayif cihaz)
  tas:     { color: '#2a3a8c', roughness: 0.62, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.4, envMapIntensity: 0.9 },
  ahsap:   { color: '#ffb347', roughness: 0.55, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.35, envMapIntensity: 0.85 },
  foxi:    { color: '#ff8a1c', roughness: 0.24, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.1 },
  beyaz:   { color: '#fffaf2', roughness: 0.25, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.0 },
  koyu:    { color: '#3a1e14', roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 0.8 },
  platform: { color: '#5216b0', roughness: 0.32, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.12, envMapIntensity: 0.8 }
};

// ---- olculer (birim = oyundaki kup kenari; oyunda S=1.55 ile carpilir) ----
export const OLCU = {
  koseR: 0.16,                          // kup/plaka kose yaricapi
  kavanoz: { r: 0.44, boy: { kisa: 1, orta: 1.5, uzun: 2.5 } },
  plaka: { boy: { uzun: 4, orta: 2, kare: 1 }, h: 1, d: 0.92 },
  buzKolon: { h: 3 },
  buzPlakaH: 0.34,
  kutuk: { r: 0.42, h: 1.5 },
  platform: { w: 8, d: 3.2, h: 0.62, ayakH: 2.4 }
};
