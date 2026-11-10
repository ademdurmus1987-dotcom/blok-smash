// Blok Smash - oyuncu profili ve kazanilan karakterler (ana ekran ve oyun ortak kullanir).
// Kayit: localStorage 'bloksmash_profil' = { ad, av, kar, gor: { tilki: 1 } }
//   ad: oyuncu adi, av: secili avatar, kar: oyunda topun yaninda duran karakter ('' = yok), gor: "kazandin" karti gosterilen karakterler
const PKEY = 'bloksmash_profil', YKEY = 'blokpop_yapi_v3';
// sart: Yapi modunda bu bolume ulasinca acilir (bir onceki bolum gecilince)
export const KARAKTERLER = [
  { id: 'tilki', ad: 'Korsan Tilki', sart: 3, av: 'karakter/tilki_avatar.webp' }
];
// hazir avatarlar (karakter avatarlari kazanildikca listeye eklenir)
export const AVATARLAR = [
  { id: 'a1', ic: '⚓', renk: ['#5ec8ff', '#1b6fc0'] }, { id: 'a2', ic: '💣', renk: ['#b79cff', '#5a3cc8'] }, { id: 'a3', ic: '⭐', renk: ['#ffe27a', '#f08a1f'] },
  { id: 'a4', ic: '🎯', renk: ['#ff9aa8', '#d8283c'] }, { id: 'a5', ic: '🧱', renk: ['#a8f08a', '#2fa83a'] }
];
export function profilOku() {
  let p = null; try { p = JSON.parse(localStorage.getItem(PKEY) || 'null'); } catch (e) {}
  return Object.assign({ ad: 'Kaptan', av: 'a1', kar: null, gor: {} }, p || {});
}
export function profilYaz(p) { try { localStorage.setItem(PKEY, JSON.stringify(p)); } catch (e) {} }
export function ulasilanBolum() { try { const d = JSON.parse(localStorage.getItem(YKEY) || 'null'); return (d && d.max) || 1; } catch (e) { return 1; } }
export function acikMi(id, max) { const k = KARAKTERLER.find((x) => x.id === id); return !!k && (max || ulasilanBolum()) >= k.sart; }
// oyunda gosterilecek karakter: secili olan aciksa o; hic secim yapilmadiysa acik olan ilk karakter
export function seciliKarakter(max) {
  const p = profilOku(); if (p.kar === '') return null;
  if (p.kar && acikMi(p.kar, max)) return p.kar;
  const k = KARAKTERLER.find((x) => acikMi(x.id, max)); return k ? k.id : null;
}
