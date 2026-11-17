// Foxi Smash — gorsel ayarlar (tek config dosyasi).
// Parlak blok kutuphanesi (sekiller.js), Kenney malzeme yukseltmesi (kenney.js), tema dekorlari (tema3d.js)
// ve odul gorselleri (odul3d.js) butun degerlerini buradan okur. Oyun mantigi/bolum verisi burada YOK.

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
  buz:     { color: '#8fd8ff', roughness: 0.07, metalness: 0, transmission: 0.62, thickness: 0.9, ior: 1.31, clearcoat: 1, clearcoatRoughness: 0.04, attenuationColor: '#3aa8ff', attenuationDistance: 1.6, envMapIntensity: 1.3 },
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

// ---- Kenney malzeme yukseltmesi: dokuyu korur, MeshPhysicalMaterial'a cevirir ----
// anahtar: model adinda gecen kelime (ilk eslesen kullanilir); 'varsayilan' digerleri icin
export const KENNEY_MALZEME = [
  { esle: ['coin-gold', 'star'], roughness: 0.14, metalness: 1, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 2.2, emissiveIntensity: 0.12 },
  { esle: ['coin-silver', 'coin-bronze', 'key'], roughness: 0.16, metalness: 1, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 2.0 },
  { esle: ['jewel', 'crystal', 'heart'], roughness: 0.06, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2.2, emissiveIntensity: 0.18 },
  { esle: ['palm', 'tree', 'wood', 'log', 'barrel', 'crate', 'chest', 'dock', 'ship', 'tower-watch', 'structure'], roughness: 0.78, metalness: 0, clearcoat: 0, envMapIntensity: 0.7 },
  { esle: ['rock', 'stone', 'wall', 'tower', 'gate', 'block-snow', 'patch'], roughness: 0.86, metalness: 0, clearcoat: 0, envMapIntensity: 0.6 },
  { esle: ['bottle'], roughness: 0.1, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.6 },
  { esle: ['bomb', 'cannon'], roughness: 0.35, metalness: 0.6, clearcoat: 0.5, clearcoatRoughness: 0.2, envMapIntensity: 1.2 },
  { esle: ['varsayilan'], roughness: 0.6, metalness: 0, clearcoat: 0.15, clearcoatRoughness: 0.3, envMapIntensity: 0.9 }
];
export const KENNEY_KOK = 'assets/models/kenney/';   // repo kokune gore (yapi/ icinden '../' eklenir)

// ---- tema dekorlari (yalniz arka plan katmani; fizik yok) ----
// x: platform merkezine gore yan uzaklik (birim: oyun dunyasi), z: platformun arkasina uzaklik, s: olcek, d: oncelik (1 = her cihazda)
export const TEMA = {
  plaj: { ad: 'Plaj / Korsan', dekor: [
    { m: 'pirate-kit/ship-pirate-large', x: -30, z: 70, s: 1.5, ry: 0.9, sal: 1, d: 1 },
    { m: 'pirate-kit/ship-pirate-medium', x: 36, z: 85, s: 1.4, ry: -1.0, sal: 1, d: 2 },
    { m: 'pirate-kit/ship-wreck', x: 22, z: 42, s: 0.9, ry: 2.4, d: 2 },
    { m: 'pirate-kit/palm-detailed-bend', x: -15, z: 8, s: 1.55, ry: 0.4, d: 1 },
    { m: 'pirate-kit/palm-detailed-straight', x: 16, z: 11, s: 1.45, ry: 2.1, d: 1 },
    { m: 'pirate-kit/palm-bend', x: -21, z: 20, s: 1.3, ry: 2.6, d: 2 },
    { m: 'pirate-kit/palm-straight', x: 23, z: 22, s: 1.25, ry: 1.0, d: 3 },
    { m: 'pirate-kit/rocks-sand-a', x: -11, z: 4, s: 0.85, ry: 0.3, d: 1 },
    { m: 'pirate-kit/rocks-sand-c', x: 12, z: 5, s: 0.8, ry: 1.7, d: 2 },
    { m: 'pirate-kit/tower-watch', x: -26, z: 30, s: 1.6, ry: 0.6, d: 2 },
    { m: 'pirate-kit/structure-platform-dock', x: 19, z: 16, s: 1.5, ry: 0, d: 3 },
    { m: 'pirate-kit/flag-pirate-high', x: -24.5, z: 28, s: 1.5, ry: 0.3, bayrak: 1, d: 2 },
    { m: 'pirate-kit/flag-pirate', x: 13.5, z: 10, s: 1.4, ry: -0.4, bayrak: 1, d: 3 }
  ] },
  kar: { ad: 'Kar', dekor: [
    { m: 'platformer-kit/block-snow-large-tall', x: -15, z: 10, s: 2.2, ry: 0.2, d: 1 },
    { m: 'platformer-kit/block-snow-large', x: -19.5, z: 13, s: 2.2, ry: 0.5, d: 2 },
    { m: 'platformer-kit/block-snow', x: 14, z: 7, s: 2.2, ry: 0.9, d: 1 },
    { m: 'platformer-kit/block-snow-low', x: 17, z: 9, s: 2.4, ry: 0.3, d: 3 },
    { m: 'platformer-kit/tree-pine-snow', x: -11.5, z: 6, s: 2.6, ry: 0, d: 1 },
    { m: 'platformer-kit/tree-pine-snow', x: 20, z: 18, s: 3.2, ry: 1, d: 1 },
    { m: 'platformer-kit/tree-snow', x: -23, z: 22, s: 3.0, ry: 2, d: 2 },
    { m: 'platformer-kit/tree-pine-snow-small', x: 12, z: 4, s: 2.4, ry: 0.4, d: 2 },
    { m: 'platformer-kit/tree-pine-snow', x: 27, z: 34, s: 4.2, ry: 0.2, d: 3 },
    { m: 'platformer-kit/tree-pine-snow', x: -30, z: 38, s: 4.4, ry: 0.8, d: 3 },
    { m: 'tower-defense-kit/snow-detail-crystal-large', x: 11, z: 3, s: 2.4, ry: 0.2, d: 1 },
    { m: 'tower-defense-kit/snow-detail-crystal', x: -10.5, z: 3, s: 3.0, ry: 1.1, d: 2 },
    { m: 'tower-defense-kit/snow-detail-crystal', x: 15.5, z: 12, s: 3.4, ry: 2.2, d: 3 }
  ] },
  kale: { ad: 'Kale', dekor: [
    { m: 'castle-kit/tower-square', x: -16, z: 14, s: 3.2, ry: 0, kat: ['castle-kit/tower-square-mid-windows', 'castle-kit/tower-square-top-roof-high'], d: 1 },
    { m: 'castle-kit/tower-hexagon-base', x: 17, z: 16, s: 3.2, ry: 0.3, kat: ['castle-kit/tower-hexagon-mid', 'castle-kit/tower-hexagon-mid', 'castle-kit/tower-hexagon-roof'], d: 1 },
    { m: 'castle-kit/wall', x: -12.6, z: 14, s: 3.2, ry: 0, d: 2 },
    { m: 'castle-kit/wall', x: 13.6, z: 16, s: 3.2, ry: 0, d: 2 },
    { m: 'castle-kit/wall-pillar', x: -22.4, z: 14, s: 3.2, ry: 0, d: 2 },
    { m: 'castle-kit/gate', x: 9.8, z: 15.8, s: 3.2, ry: Math.PI / 2, d: 3 },
    { m: 'castle-kit/tower-square', x: -28, z: 36, s: 4, ry: 0.2, kat: ['castle-kit/tower-top'], d: 3 },
    { m: 'castle-kit/flag-banner-long', x: -16, z: 12.3, s: 2.6, ry: Math.PI / 2, y: 1.2, bayrak: 1, d: 1 },
    { m: 'castle-kit/flag-pennant', x: 17, z: 16, s: 3.0, ry: 0.4, y: 10.5, bayrak: 1, d: 2 },
    { m: 'castle-kit/flag', x: -16, z: 14, s: 3.0, ry: 0, y: 12.6, bayrak: 1, d: 2 },
    { m: 'castle-kit/rocks-large', x: 10.5, z: 6, s: 2.2, ry: 0.8, d: 2 },
    { m: 'castle-kit/tree-large', x: -11, z: 5, s: 2.6, ry: 0.3, d: 3 }
  ] }
};
// oyun dunyasi -> tema (yalniz arka plan; bolum verisi degismez). Listede olmayan dunyada dekor yok.
export const DUNYA_TEMA = { dalga: 'plaj', koy: 'plaj', gunbatimi: 'plaj', gece: 'plaj', buz: 'kar', col: 'kale', magara: 'kale', volkan: 'kale' };

// zayif cihaz: dekor yogunlugu (d degeri bu sayiya kadar olanlar cizilir) — FPS dusunce otomatik azalir
export const YOGUNLUK = { yuksek: 3, orta: 2, dusuk: 1, fpsEsik: 48, olcSn: 2.5 };

// odul gorselleri
export const ODUL = { coinBoyPx: 34, ucusMs: 950, sandikPx: 150, fiskirma: 14 };
