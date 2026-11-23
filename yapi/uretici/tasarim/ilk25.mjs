// Foxi Smash v12.2 (Adem 23 Kas: 'kamera cok yakindi, ilk bolumler cok basit, oyuncu cekmek icin iyi olmali'): kucuk yapilar
// 7-10 sutuna genisledi (kamera artik blogu ~34 px gosterir; kucuk yapi cilız kaliyordu). Onceki: v12.1
// Foxi Smash v12.1 (Adem: 'oyunun ilk 25 tasarimini sen yap, cok renkli olmasin, oyuncu oyuna adapte olsun, her yeni sekilde tanitim karti'):
// Her bolum tek bir seyi ogretir; renk az (1-2 renk + malzeme). Yeni blok ilk geldigi bolumde oyunun kendi karti ile tanitilir (bolum.js AILE),
// platform hareketi ve engel de ilk geldigi yerde kartla. ip: ilk oynayista elin gosterdigi parca (tur, satir: alttan, sutun: soldan) ve yazi.
// Bicim: [L, ad, tasarim, hareket, engel]
export const ILK = [
  [1, 'İlk Atış', { g: ['3333333', '6666666', '3333333', '6666666'], s: 1, ip: { t: 'kjS', yazi: 'Alttaki kavanoza dokun!' } }],
  [2, 'Turuncu Kule', { g: ['...o...', '..owo..', '.oowoo.', 'ooowooo', 'SSSSSSS'], s: 2, b: 0, ip: { t: 'oyT', yazi: 'Küp ilk vuruşta çatlar. Alttan vur, devir!' } }],
  [3, 'Sandık Piramidi', { g: ['....C....', '...CCC...', '..CCCCC..', '.CCCCCCC.', 'CCCCCCCCC'], s: 2, ip: { t: 'ksSandik', yazi: 'Sandıklar vurunca parçalanır!' } }],
  [4, 'Kalas Köprü', { g: ['3333333', 'LLLLLLL', 'C..C..C', 'C..C..C', 'LLLLLLL', 'CCCCCCC'], s: 2 }],
  [5, 'Sarı Kale', { g: ['y.y.y.y.y', 'yyyyyyyyy', 'yyoyyyoyy', 'yyyyyyyyy', 'SSSSSSSSS'], s: 2, b: 0 }],
  [6, 'Uzun Kavanozlar', { g: ['LLLLLLLLL', 'N.N.N.N.N', 'N.N.N.N.N', 'LLLLLLLLL', 'CCCCCCCCC'], s: 2 }],
  [7, 'Mavi Merdiven', { g: ['.......bbb', '.....bbbbb', '...bbbbbbb', '.bbbbbbbbb', 'wwwwwwwwww'], s: 2 }],
  [8, 'Kedi Yüzü', { g: ['o.....o', 'oo...oo', 'ooooooo', 'ozooozo', 'ooopooo', 'ozzzzzo', 'ooooooo', 'CCCCCCC'], s: 2, m: 'r', f: 'o' }],
  [9, 'TNT Sürprizi', { g: ['CCCCCCCCC', 'CCCCTCCCC', 'CCCCCCCCC', 'CCCCCCCCC', 'SSSSSSSSS'], s: 2, ip: { t: 'ksTNT', yazi: "TNT'yi vur, patlasın!" } }],
  [10, 'Küçük Kale', { g: ['S.S...S.S', 'SSS...SSS', 'SCS.C.SCS', 'SCCCCCCCS', 'SSSBBBSSS', 'SSS...SSS'], s: 2 }],
  [11, 'Buz Duvarı', { g: ['IIIIIIII', 'IIIIIIII', 'IIIIIIII', 'SSSSSSSS'], s: 1, ip: { t: 'ksBuz', yazi: 'Buz ilk vuruşta çatlar, ikincide kırılır.' } }],
  [12, 'Fıçı Yığını', { g: ['....F....', '...FFF...', '..FFFFF..', '.FFFFFFF.', 'LLLLLLLLL', 'C...C...C'], s: 2 }, 'sabit', 'kurek'],
  [13, 'Sütunlu Çatı', { g: ['..33333..', 'LLLLLLLLL', 'G.G.G.G.G', 'G.G.G.G.G', 'SSSSSSSSS'], s: 2 }],
  [14, 'Yıldız Küpler', { g: ['Y.......Y', 'YgggggggY', 'ggggggggg', 'ggYgggYgg', 'ggggggggg'], s: 2, b: 0 }],
  [15, 'Kurbağa Yüzü', { g: ['ww...ww', 'wz...zw', 'ggggggg', 'ggggggg', 'grrrrrg', 'ggggggg', 'IIIIIII'], s: 2, m: 'r', f: 'g' }],
  [16, 'Kayan Ev', { g: ['...r...', '..rrr..', '.rrrrr.', 'kkkkkkk', 'kakkkak', 'kkkhkkk'], s: 2, m: 'r', f: 'k' }, 'kay'],
  [17, 'Kavanoz Piramidi', { g: ['....7....', '...777...', '..7N7N7..', '.7777777.', '777777777', 'CCCCCCCCC'], s: 2 }],
  [18, 'Asansör Kulesi', { g: ['.bbb.', 'bbbbb', 'wwwww', 'bbbbb', 'wwwww', 'bbbbb'], s: 2 }, 'asansor'],
  [19, 'Dev Kavanoz', { p: [['kvBT', -1, 0, 0], ['kvBT', 1, 0, 0], ['ksKalas3', -1.5 + 1.5, 2, -0.5], ['ksKalas3', 0, 2, 0.5], ['kjT', -1, 2.5, -0.5], ['kjT', 0, 2.5, -0.5], ['kjT', 1, 2.5, -0.5], ['kjT', -1, 2.5, 0.5], ['kjT', 0, 2.5, 0.5], ['kjT', 1, 2.5, 0.5]] }],
  [20, 'Deniz Feneri', { g: ['.y.', 'yyy', 'www', 'rrr', 'www', 'rrr', 'www', 'SSSSS'], o: 1, s: 2, m: 'r', f: 'w' }],
  [21, 'Sarkaç Duvarı', { g: ['ppwppwp', 'ppwppwp', 'ppwppwp', 'CCCCCCC'], s: 2, b: 0 }, 'sabit', 'kalkan'],
  [22, 'Dönen Kule', { g: ['.v.', 'vvv', 'CCC', 'vvv', 'CCC'], s: 3 }, 'don'],
  [23, 'İki Ada', { g: ['ooo', 'ooo', 'CCC'], s: 3 }, 'iki'],
  [24, 'Delikli Çark', { g: ['.yyyyy.', 'yyzyzyy', 'yyyyyyy', 'yzyyyzy', 'yyzzzyy', '.yyyyy.', 'SSSSSSS'], s: 2, m: 'r', f: 'y' }, 'sabit', 'cark'],
  [25, 'Korsan Gemisi', { g: ['....z.....', '...www....', '..wwwww...', '....h.....', 'hhhhhhhhhh', '.hyhyhyhh.', '..hhhhhh..'], s: 2, m: 'r', f: 'h' }],
];
