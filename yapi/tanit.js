// Foxi Smash v12.55 (Adem 25 Kas): 'yeni cisim gelince ilk bolumu sadece o cisim olsun, sonra karma kule'.
// TANIT[L] = o bolumde ILK KEZ gelen blok ailelerinin oyundaki turleri (renk cesitleri). Tablo, 2000 bolumu oyunda tek tek acip
// bloklarini sayarak cikarildi (scratchpad tara.js + tanit_yap.py). oyun.js bu bolumlerde asil yapi yerine yalniz bu turlerden kule kurar.
// 398 (Tas Halka) cikarildi: yalniz sekil bolumlerinin ozel parcasi, duz kule kurucusunda yok. Kapatma: ?tanit=0
export const TANIT = {
  2: ["oyTC", "oyBC"],
  3: ["ksSandikC"],
  4: ["ksKalas2C", "ksKalas3C"],
  5: ["ksTas3C"],
  6: ["kvUM"],
  7: ["uz4B", "uz2B", "uz3M", "uz4M", "uz2M"],
  9: ["ksTNTC"],
  11: ["ksBuzC"],
  12: ["ksFiciC"],
  13: ["ksSutunC"],
  14: ["ksYildizC"],
  26: ["ksMorSutunC"],
  27: ["ksSiseY", "ksSiseB", "ksSiseM"],
  31: ["ksDirek"],
  33: ["kr3P"],
  96: ["ksKemerC"]
};
