# Blok puan kartı (v5.1)

10 madde (threejs-aaa-graphics-builder puan kartı blok ölçeğine uyarlandı), her biri 0 / 0,5 / 1: tema uyumu, siluet (uzaktan okunur mu), kenar pahı, geometri detayı (perçin, köşebent, kabartma), malzeme/doku, ışık tepkisi, renk, rol okunurluğu (kırılır/sağlam/patlar), kırılma efekti, performans.

Karar kuralı: 6 puanın altı ya da korsan temasına uymayan → ÇIKAR (kapalı bloklar, yapi/kapali.js). Tema uyan ama eksik → İYİLEŞTİR. Eski oyuncak küp Adem'in isteğiyle patili küple değişti.

| Blok | Tür | Önce | Karar | Sonra | Not |
|---|---|---|---|---|---|
| Sandık | `ksSandik` | 7.5 | İYİLEŞTİR | 9.0 | X ve çerçeve boyalı, köşe düz küp |
| Mor Sandık | `ksSandikM` | 7.5 | İYİLEŞTİR | 9.0 | X ve çerçeve boyalı, köşe düz küp |
| Kırmızı Sandık | `ksSandikK` | 7.5 | İYİLEŞTİR | 9.0 | X ve çerçeve boyalı, köşe düz küp |
| TNT | `ksTNT` | 7.5 | İYİLEŞTİR | 9.0 | etiket iyi, kasa düz |
| Tahta Kalas | `ksKalas1` | 8.0 | KALSIN | 8.5 | temiz, okunur |
| Tahta Kalas | `ksKalas2` | 8.0 | KALSIN | 8.5 | temiz, okunur |
| Tahta Kalas | `ksKalas3` | 8.0 | KALSIN | 8.5 | temiz, okunur |
| Taş Blok | `ksTas` | 6.5 | İYİLEŞTİR | 8.5 | taşlar boyalı, siluet düz kutu |
| Taş Blok | `ksTas2` | 6.5 | İYİLEŞTİR | 8.5 | taşlar boyalı, siluet düz kutu |
| Taş Kemer | `ksKemer` | 7.5 | KALSIN | 8.0 | gerçek kemer boşluğu |
| Fıçı | `ksFici` | 8.5 | KALSIN | 9.0 | torna gövde + 3B çember |
| Kırmızı Fıçı | `ksFiciK` | 8.5 | KALSIN | 9.0 | torna gövde + 3B çember |
| Mor Şişe | `ksSiseM` | 8.5 | KALSIN | 9.0 | mantar tıpa, ışık şeridi |
| Yeşil Şişe | `ksSiseY` | 8.5 | KALSIN | 9.0 | mantar tıpa, ışık şeridi |
| Mavi Şişe | `ksSiseB` | 8.5 | KALSIN | 9.0 | mantar tıpa, ışık şeridi |
| Yakut | `ksYakut` | 6.0 | İYİLEŞTİR | 9.0 | az yüzey, soluk renk, iç parıltı yok |
| Elmas | `ksElmas` | 6.0 | İYİLEŞTİR | 9.0 | az yüzey, soluk renk, iç parıltı yok |
| Mücevher Karosu | `ksKaro` | 7.5 | KALSIN | 8.0 | çerçeveli taş okunur |
| Buz Blok | `ksBuz` | 6.5 | İYİLEŞTİR | 8.5 | soluk, pah zayıf |
| Yıldız Blok | `ksYildiz` | 7.5 | İYİLEŞTİR | 9.0 | yıldız boyalı, kabartma yok |
| Taş Sütun | `ksSutun` | 8.0 | KALSIN | 8.5 | başlıklı sütun |
| Mor Sütun | `ksMorSutun` | 6.5 | İYİLEŞTİR | 8.5 | düz boru, başlık yok |
| Oyuncak Küp (kırmızı) | `oyK` | 7.5 | ÇIKAR | 9.5 | → patili küp |
| Oyuncak Küp (yeşil) | `oyY` | 7.5 | ÇIKAR | 9.5 | → patili küp |
| Oyuncak Küp (mavi) | `oyM` | 7.5 | ÇIKAR | 9.5 | → patili küp |
| Oyuncak Küp (sarı) | `oyS` | 7.5 | ÇIKAR | 9.5 | → patili küp |
| Oyuncak Küp (mor) | `oyP` | 7.5 | ÇIKAR | 9.5 | → patili küp |
| Mavi Taş Kiriş | `tas2` | 5.5 | ÇIKAR |  | → ksTas2 |
| Mavi Taş Kiriş 4 | `tas4` | 5.5 | ÇIKAR |  | → ksTas4 |
| Buz Küp (eski) | `buzP` | 5.5 | ÇIKAR |  | → ksBuz |
| Uzun Buz (eski) | `buzP3` | 5.5 | ÇIKAR |  | → ksBuz3 |
| Tahta Direk (eski) | `ahsapD` | 4.5 | ÇIKAR |  | → ksDirek |
| Mermer Sütun | `mermer` | 5.5 | ÇIKAR |  | → ksTas |
| Reçel Kavanozu | `kvP` | 5.5 | ÇIKAR |  | → ? |
| Reçel Kavanozu | `kvT` | 5.5 | ÇIKAR |  | → ? |
| Reçel Kavanozu | `kvM` | 5.5 | ÇIKAR |  | → ? |
| Raf Tahtası | `raf2` | 4.0 | ÇIKAR |  | → ksKalas2 |
| Raf Tahtası | `raf3` | 4.0 | ÇIKAR |  | → ksKalas3 |
| Taş Halka | `dalga` | 3.5 | ÇIKAR |  | → ksFici |
| Taş Disk | `disk` | 3.5 | ÇIKAR |  | → ksKalas1 |
| Jöle | `joP` | 5.0 | ÇIKAR |  | → oyN |
| Jöle | `joY` | 5.0 | ÇIKAR |  | → oyY |
| Jöle | `joT` | 5.0 | ÇIKAR |  | → oyT |
| Hediye Kutusu | `hdK` | 5.5 | ÇIKAR |  | → ksSandikK |
| Hediye Kutusu | `hdM` | 5.5 | ÇIKAR |  | → ksSandikM |
| Hediye Kutusu | `hdY` | 5.5 | ÇIKAR |  | → ksSandik |
| Çikolata | `cik2` | 5.0 | ÇIKAR |  | → ksTas2 |
| Tuğla | `tug2` | 6.0 | ÇIKAR |  | → ksTas2 |
| Tuğla | `tug3` | 6.0 | ÇIKAR |  | → ksTas3 |
| Kristal Küp | `krM` | 5.0 | ÇIKAR |  | → ksYakut |
| Kristal Küp | `krT` | 5.0 | ÇIKAR |  | → ksElmas |
| Kurabiye | `kur` | 5.0 | ÇIKAR |  | → ksKalas1 |
| Makaron | `mkP` | 5.0 | ÇIKAR |  | → ksKalas1 |
| Makaron | `mkY` | 5.0 | ÇIKAR |  | → ksKalas1 |
| Makaron | `mkM` | 5.0 | ÇIKAR |  | → ksKalas1 |
| Konserve | `knK` | 6.0 | ÇIKAR |  | → ksFiciK |
| Konserve | `knM` | 6.0 | ÇIKAR |  | → ksFici |
| Kuru Kafa | `kkK` | 6.0 | ÇIKAR |  | → oyB |
| Altın Kuru Kafa | `kkA` | 6.0 | ÇIKAR |  | → oyA |
| Lanetli Kuru Kafa | `kkL` | 6.0 | ÇIKAR |  | → ksTNT |
| Kemik Kiriş | `kemik` | 5.5 | ÇIKAR |  | → ksTas2 |
| sandik | `sandik` | 4.0 | ÇIKAR |  | → ksSandik |
| metal | `metal` | 4.0 | ÇIKAR |  | → ksTas |
| ahsap | `ahsap` | 4.0 | ÇIKAR |  | → ksSandik |
| kirmizi | `kirmizi` | 4.0 | ÇIKAR |  | → ksSandikK |
| tas | `tas` | 4.0 | ÇIKAR |  | → ksTas |
| ahsapmetal | `ahsapmetal` | 4.0 | ÇIKAR |  | → ksSandik |
| piramitTas | `piramitTas` | 4.0 | ÇIKAR |  | → ksTas |
| kabak | `kabak` | 4.0 | ÇIKAR |  | → ksFiciK |
| tugla | `tugla` | 4.0 | ÇIKAR |  | → ksTas |
| celik | `celik` | 4.0 | ÇIKAR |  | → ksTas |
| kola | `kola` | 4.0 | ÇIKAR |  | → ksSutun |
| buz | `buz` | 4.0 | ÇIKAR |  | → ksBuz |
| fici | `fici` | 4.0 | ÇIKAR |  | → ksTNT |
| bomba | `bomba` | 4.0 | ÇIKAR |  | → ksTNT |
| hediye | `hediye` | 4.0 | ÇIKAR |  | → ksSandikM |
| yildiz | `yildiz` | 4.0 | ÇIKAR |  | → ksYildiz |
| altin | `altin` | 4.0 | ÇIKAR |  | → oyA |
| jole | `jole` | 4.0 | ÇIKAR |  | → oyK |
| cam | `cam` | 4.0 | ÇIKAR |  | → ksSiseB |
| kup | `kup` | 4.0 | ÇIKAR |  | → oyB |
| buz2 | `buz2` | 4.0 | ÇIKAR |  | → ksBuz |
| ahsap2 | `ahsap2` | 4.0 | ÇIKAR |  | → ksSandik |
| buzDikey | `buzDikey` | 4.0 | ÇIKAR |  | → ksMorSutun |
| alevUzun | `alevUzun` | 4.0 | ÇIKAR |  | → ksSutun |
| morDikey | `morDikey` | 4.0 | ÇIKAR |  | → ksMorSutun |
| Cam kup | `g_kup` | 4.0 | ÇIKAR |  | → ksBuz |
| Cam silindir | `g_silindir` | 4.0 | ÇIKAR |  | → ksSiseB |
| Cam altigen | `g_altigen` | 4.0 | ÇIKAR |  | → ksSiseB |
| Cam prizma | `g_prizma` | 4.0 | ÇIKAR |  | → ksSiseY |
| Cam kare | `g_kare` | 4.0 | ÇIKAR |  | → ksSiseB |
| Cam yivli | `g_yivli` | 4.0 | ÇIKAR |  | → ksSiseB |
| Cam L | `g_L` | 4.0 | ÇIKAR |  | → ksBuz |
| Cam kemer | `g_kemer` | 4.0 | ÇIKAR |  | → ksBuz |
| Cam buz | `g_buz` | 4.0 | ÇIKAR |  | → ksBuz |
| Cam kure | `g_kure` | 4.0 | ÇIKAR |  | → ksSiseY |
| Cam kapsul | `g_kapsul` | 4.0 | ÇIKAR |  | → ksSiseM |
| Cam piramit | `g_piramit` | 4.0 | ÇIKAR |  | → ksYakut |
| Cam koni | `g_koni` | 4.0 | ÇIKAR |  | → ksYakut |
| Cam kubbe | `g_kubbe` | 4.0 | ÇIKAR |  | → ksElmas |
| Cam kristal | `g_kristal` | 4.0 | ÇIKAR |  | → ksElmas |
| Cam kama | `g_kama` | 4.0 | ÇIKAR |  | → ksYakut |
| Cam cubuk | `g_cubuk` | 4.0 | ÇIKAR |  | → ksKalas1 |
| Cam ince | `g_ince` | 4.0 | ÇIKAR |  | → ksKalas1 |
| Cam mazgal | `g_mazgal` | 4.0 | ÇIKAR |  | → ksKalas1 |
| Cam Y | `g_Y` | 4.0 | ÇIKAR |  | → ksYakut |

## Yeni bloklar

- `ksTas3` Taş Blok 3 (yeni): 8.5/10
- `ksTas4` Taş Blok 4 (yeni): 8.5/10
- `ksBuz3` Uzun Buz (yeni): 8.5/10
- `ksDirek` Tahta Direk (yeni): 9.0/10
- `oyT` Patili Küp Turuncu: 9.5/10
- `oyN` Patili Küp Pembe: 9.5/10
- `oyB` Patili Küp Beyaz: 9.5/10
- `oyA` Patili Küp Altın: 9.5/10
