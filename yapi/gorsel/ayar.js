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

// ---- Kenney malzeme yukseltmesi: dokuyu korur, MeshPhysicalMaterial'a cevirir ----
// anahtar: model adinda gecen kelime (ilk eslesen kullanilir); 'varsayilan' digerleri icin
export const KENNEY_MALZEME = [
  { esle: ['coin-gold', 'star'], renk: '#ffc83a', roughness: 0.16, metalness: 1, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 2.2, emissiveIntensity: 0.12 },
  { esle: ['coin-silver', 'coin-bronze', 'key'], roughness: 0.16, metalness: 1, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 2.0 },
  { esle: ['jewel', 'crystal', 'heart'], roughness: 0.08, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2.2, emissiveIntensity: 0.18 },
  { esle: ['palm', 'tree', 'wood', 'log', 'barrel', 'crate', 'chest', 'dock', 'ship', 'tower-watch', 'structure'], roughness: 0.78, metalness: 0, clearcoat: 0, envMapIntensity: 0.7 },
  { esle: ['rock', 'stone', 'wall', 'tower', 'gate', 'block-snow', 'patch'], roughness: 0.86, metalness: 0, clearcoat: 0, envMapIntensity: 0.6 },
  { esle: ['bottle'], roughness: 0.1, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.6 },
  { esle: ['bomb', 'cannon'], roughness: 0.35, metalness: 0.6, clearcoat: 0.5, clearcoatRoughness: 0.2, envMapIntensity: 1.2 },
  { esle: ['varsayilan'], roughness: 0.6, metalness: 0, clearcoat: 0.15, clearcoatRoughness: 0.3, envMapIntensity: 0.9 }
];
export const KENNEY_KOK = 'assets/models/kenney/';   // repo kokune gore (yapi/ icinden '../' eklenir)

// ---- tema dekorlari (yalniz arka plan katmani; fizik yok) ----
// sx: ekrandaki yatay yer (-1 sol kenar, 0 orta, 1 sag kenar; 1'den buyuk = kismen ekran disi) — her ekran oraninda ayni cerceve
// z: platformun arka kenarinin ne kadar arkasinda (oyun dunyasi birimi), s: olcek, ry: donus, d: oncelik (1 = her cihazda cizilir)
// sal: gemi gibi hafif sallanir; bayrak: dalgalanir; kat: ustune eklenen parcalar; ek: modele bagli ek parcalar [model, [x,y,z], ry, bayrak]
// uzak: ufuktaki buyuk nesne (yapinin arkasinda kalabilir, yine de yapiyi ortmez cunku daima arkadadir)
export const TEMA = {
  plaj: { ad: 'Plaj / Korsan', dekor: [
    { m: 'pirate-kit/ship-pirate-large', sx: -0.8, z: 55, s: 1.6, ry: 1.1, sal: 1, uzak: 1, d: 1 },
    { m: 'pirate-kit/ship-pirate-medium', sx: 0.82, z: 70, s: 1.5, ry: -1.2, sal: 1, uzak: 1, d: 2 },
    { m: 'pirate-kit/ship-wreck', sx: 0.5, z: 26, s: 0.7, ry: 2.4, uzak: 1, d: 2 },
    { m: 'pirate-kit/palm-detailed-bend', sx: -1.0, z: 1, s: 1.6, ry: 0.9, d: 1 },
    { m: 'pirate-kit/palm-detailed-straight', sx: 1.02, z: 3, s: 1.5, ry: 2.1, d: 1 },
    { m: 'pirate-kit/palm-bend', sx: -1.08, z: 12, s: 1.4, ry: 2.6, d: 2 },
    { m: 'pirate-kit/palm-straight', sx: 1.1, z: 14, s: 1.3, ry: 1.0, d: 3 },
    { m: 'pirate-kit/rocks-sand-a', sx: -0.86, z: 0, s: 0.6, ry: 0.3, d: 1 },
    { m: 'pirate-kit/rocks-sand-c', sx: 0.9, z: 0, s: 0.6, ry: 1.7, d: 2 },
    { m: 'pirate-kit/tower-watch', sx: -0.84, z: 22, s: 1.3, ry: 0.6, ek: [['pirate-kit/flag-pirate-high', [0.9, 2.6, 0.9], 0.5, 1]], d: 2 },
    { m: 'pirate-kit/structure-platform-dock', sx: 0.86, z: 8, s: 1.3, ry: 0.2, ek: [['pirate-kit/flag-pirate', [0.8, 1.3, 0.8], -0.4, 1]], d: 3 }
  ] },
  kar: { ad: 'Kar', dekor: [
    { m: 'platformer-kit/block-snow-large-tall', sx: -0.98, z: 2, s: 2.0, ry: 0.2, d: 1 },
    { m: 'platformer-kit/block-snow-large', sx: -1.06, z: 8, s: 2.0, ry: 0.5, d: 2 },
    { m: 'platformer-kit/block-snow', sx: 0.96, z: 1, s: 2.0, ry: 0.9, d: 1 },
    { m: 'platformer-kit/block-snow-low', sx: 1.04, z: 6, s: 2.2, ry: 0.3, d: 3 },
    { m: 'platformer-kit/tree-pine-snow', sx: -0.86, z: 12, s: 3.0, ry: 0, d: 1 },
    { m: 'platformer-kit/tree-pine-snow', sx: 0.88, z: 14, s: 3.4, ry: 1, d: 1 },
    { m: 'platformer-kit/tree-snow', sx: -0.74, z: 30, s: 6.5, ry: 2, uzak: 1, d: 1 },
    { m: 'platformer-kit/tree-pine-snow-small', sx: 0.8, z: 3, s: 2.4, ry: 0.4, d: 2 },
    { m: 'platformer-kit/tree-pine-snow', sx: 0.74, z: 34, s: 7.5, ry: 0.2, uzak: 1, d: 1 },
    { m: 'platformer-kit/tree-pine-snow', sx: -0.5, z: 52, s: 7.0, ry: 0.8, uzak: 1, d: 2 },
    { m: 'tower-defense-kit/snow-detail-crystal-large', sx: 0.52, z: 44, s: 9, ry: 0.6, uzak: 1, d: 2 },
    { m: 'tower-defense-kit/snow-detail-crystal-large', sx: 0.78, z: 0, s: 2.2, ry: 0.2, d: 1 },
    { m: 'tower-defense-kit/snow-detail-crystal', sx: -0.78, z: 0, s: 3.0, ry: 1.1, d: 2 },
    { m: 'tower-defense-kit/snow-detail-crystal', sx: 1.0, z: 9, s: 3.4, ry: 2.2, d: 3 }
  ] },
  kale: { ad: 'Kale', dekor: [
    { m: 'castle-kit/tower-square', sx: -0.9, z: 6, s: 2.8, ry: 0, kat: ['castle-kit/tower-square-mid-windows', 'castle-kit/tower-square-top-roof-high'], ek: [['castle-kit/flag-banner-long', [0, 0.5, 0.53], -Math.PI / 2, 1]], d: 1 },
    { m: 'castle-kit/tower-hexagon-base', sx: 0.9, z: 8, s: 2.8, ry: 0.3, kat: ['castle-kit/tower-hexagon-mid', 'castle-kit/tower-hexagon-mid', 'castle-kit/tower-hexagon-roof'], tepe: ['castle-kit/flag-pennant', 1], d: 1 },
    { m: 'castle-kit/wall', sx: -0.7, z: 6.4, s: 2.8, ry: 0, d: 2 },
    { m: 'castle-kit/wall', sx: 0.7, z: 8.4, s: 2.8, ry: 0, d: 2 },
    { m: 'castle-kit/wall-pillar', sx: -1.1, z: 6, s: 2.8, ry: 0, d: 3 },
    { m: 'castle-kit/tower-square', sx: -0.76, z: 34, s: 5.5, ry: 0.2, kat: ['castle-kit/tower-square-mid-windows', 'castle-kit/tower-top'], tepe: ['castle-kit/flag', 1], uzak: 1, d: 1 },
    { m: 'castle-kit/tower-hexagon-base', sx: 0.76, z: 40, s: 5.5, ry: 0.3, kat: ['castle-kit/tower-hexagon-mid', 'castle-kit/tower-hexagon-roof'], tepe: ['castle-kit/flag-pennant', 1], uzak: 1, d: 1 },
    { m: 'castle-kit/wall', sx: 0.0, z: 46, s: 5.5, ry: 0, uzak: 1, d: 3 },
    { m: 'castle-kit/rocks-large', sx: 0.76, z: 0, s: 1.8, ry: 0.8, d: 2 },
    { m: 'castle-kit/tree-large', sx: -0.76, z: 0, s: 2.2, ry: 0.3, d: 3 }
  ] }
};
// oyun dunyasi -> tema (yalniz arka plan; bolum verisi degismez). Listede olmayan dunyada dekor yok.
export const DUNYA_TEMA = { dalga: 'plaj', koy: 'plaj', gunbatimi: 'plaj', gece: 'plaj', buz: 'kar', col: 'kale', magara: 'kale', volkan: 'kale' };

// zayif cihaz: dekor yogunlugu (d degeri bu sayiya kadar olanlar cizilir) — FPS dusunce otomatik azalir
export const YOGUNLUK = { yuksek: 3, orta: 2, dusuk: 1, fpsEsik: 48, olcSn: 2.5 };

// odul gorselleri
export const ODUL = { coinBoyPx: 34, ucusMs: 900, sandikPx: 100, fiskirma: 14 };   // renk: Kenney dokusunun ustune carpilan ton (altin daha doygun)
