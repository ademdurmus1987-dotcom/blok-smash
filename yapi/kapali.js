// Foxi Smash v5.1 (Adem 15 Kas 2026): KAPALI BLOKLAR.
// Blok katalogunda 6 puanin altinda kalan ve korsan temasina uymayan bloklar bolumlerde artik kullanilmaz.
// Kodlari silinmedi (sekil.js, oyun.js GLASS/MFILE); bir blogu geri acmak icin asagidaki KAPALI tablosundan satirini silmek yeter.
// Her kapali blogun yerine gelen kaliteli karsiligi yazilidir:
//   'tur'            -> ayni olculu tek blok
//   ['a', 'b']       -> iki kat boyundaki blok yerine ust uste iki tek kat blok (alttaki a, ustteki b)
// Kullananlar: oyun.js (eski/onbellekte kalmis bolum verisi gelirse kurulurken degistirilir), bolum.js (1-25 elle yapilmis bolumler),
// uretici/arketip.js (yeni uretilen bolumlerde blok havuzu), uretici/kapali_uygula.mjs (kayitli 2000 bolum bir kez donusturuldu).
export const KAPALI = {
  // --- eski sekiller (sekil.js): seker/oyuncak temasi, duz boyali ---
  joP: 'oyN', joY: 'oyY', joT: 'oyT',                         // jole -> patili kup (ayni renk)
  hdK: 'ksSandikK', hdM: 'ksSandikM', hdY: 'ksSandik',        // hediye kutusu -> sandik
  krM: 'ksYakut', krT: 'ksElmas',                             // duz kristal kup -> yuzeyli mucevher
  kkK: 'oyB', kkA: 'oyA', kkL: 'ksTNT',                       // kuru kafa -> beyaz/altin patili kup, lanetli kafa -> TNT
  knK: 'ksFiciK', knM: 'ksFici', dalga: 'ksFici',             // konserve, tas halka -> fici (ayni silindir)
  mermer: 'ksTas', buzP: 'ksBuz', buzP3: 'ksBuz3',
  tas2: 'ksTas2', tas4: 'ksTas4', tug2: 'ksTas2', tug3: 'ksTas3', cik2: 'ksTas2', kemik: 'ksTas2',
  raf2: 'ksKalas2', raf3: 'ksKalas3', disk: 'ksKalas1', kur: 'ksKalas1', mkP: 'ksKalas1', mkY: 'ksKalas1', mkM: 'ksKalas1',
  ahsapD: 'ksDirek',
  kvP: ['ksSiseM', 'ksSiseM'], kvT: ['ksSiseY', 'ksSiseY'], kvM: ['ksSiseB', 'ksSiseB'],   // 2 kat kavanoz -> ust uste iki sise
  // --- Tripo GLB bloklari (gercekci doku, 10-20 bin ucgen, kale setiyle uyumsuz) ---
  altin: 'oyA', fici: 'ksTNT', bomba: 'ksTNT', yildiz: 'ksYildiz', hediye: 'ksSandikM', jole: 'oyK', cam: 'ksSiseB', recel: 'ksSiseM',
  kup: 'oyB', metal: 'ksTas', celik: 'ksTas', tas: 'ksTas', tugla: 'ksTas', piramitTas: 'ksTas',
  ahsap: 'ksSandik', ahsap2: 'ksSandik', sandik: 'ksSandik', ahsapmetal: 'ksSandik', kirmizi: 'ksSandikK',
  buz: 'ksBuz', buz2: 'ksBuz', kabak: 'ksFiciK', kola: 'ksSutun', buzDikey: 'ksMorSutun', alevUzun: 'ksSutun', morDikey: 'ksMorSutun',
  // --- cam sekiller (duz yari saydam ilkel sekiller) ---
  g_kup: 'ksBuz', g_silindir: 'ksSiseB', g_altigen: 'ksSiseB', g_prizma: 'ksSiseY', g_kare: 'ksSiseB', g_yivli: 'ksSiseB', g_L: 'ksBuz', g_kemer: 'ksBuz', g_buz: 'ksBuz',
  g_kure: 'ksSiseY', g_kapsul: 'ksSiseM', g_piramit: 'ksYakut', g_koni: 'ksYakut', g_kubbe: 'ksElmas', g_kristal: 'ksElmas', g_kama: 'ksYakut', g_cubuk: 'ksKalas1', g_ince: 'ksKalas1', g_mazgal: 'ksKalas1', g_Y: 'ksYakut'
};
export const kapaliMi = (t) => typeof t === 'string' && t in KAPALI;

// tek hucreyi donustur: [i, j, k, tur, pn] -> bir ya da iki hucre (yeni dizi; girdi degismez)
export function kapaliHucre(c) {
  const y = KAPALI[c[3]]; if (y === undefined) return [c];
  if (Array.isArray(y)) { const a = c.slice(), b = c.slice(); a[3] = y[0]; b[3] = y[1]; b[1] = c[1] + 1; return [a, b]; }
  const a = c.slice(); a[3] = y; return [a];
}
export function kapaliUygula(list) { const o = []; for (const c of list) for (const x of kapaliHucre(c)) o.push(x); return o; }
