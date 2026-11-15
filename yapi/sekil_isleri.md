# Şekil işleri (v5.1) — nerede kaldık

"Şekillerin kalitesi istediğim seviyede değil" işinin durumu. Yeni oturumda "kaldığın yerden devam et" denince buradan sürdürülür.

## Hedef görünüm

- `yapi/referans/kale_hedef_1.webp`, `kale_hedef_2.webp`: Adem'in iki kale görseli (hedef).
- `yapi/referans/oyun/ornek_*.webp`: referans oyundan ekran görüntüleri (kalın pahlı kenar, içe gömük pano, doygun renk).

## Yapı

- `yapi/kapali.js`: **kapalı bloklar** listesi ve her birinin yerine gelen kaliteli karşılığı. Bir bloğu geri açmak için satırını silmek yeter (kodları silinmedi).
  - Oyun (`oyun.js` `kapaliKur`) bölüm kurulurken kapalı bloğu karşılığıyla değiştirir (eski önbellek / eski kayıt gelirse de bozulmaz).
  - Üretici (`uretici/arketip.js`) kapalı blokları havuzdan çıkarır, arketiplerin doğrudan yazdıklarını da karşılığına çevirir.
- `yapi/pati.js`: patili oyuncak küp (`model/kup_pati.glb`). Yüklenince `kup_pati.js` `kupHazirla` bir kez çalışır, pati yüzü kameraya (+z) döner, küp hücreye oturtulur, LOD (≈900 üçgen) ve turuncu/sarı için konturlu sürüm üretilir. Renkler `PATI_RENK` tablosunda.
  - Bloklar: `oyK` kırmızı, `oyT` turuncu, `oyS` sarı, `oyY` yeşil, `oyM` mavi, `oyP` mor, `oyN` pembe, `oyB` beyaz, `oyA` altın (gümüş pati, sağlam, düşünce "Hazine!").
- `yapi/ornek.js`: kodla çizilen bütün bloklar tür başına tek InstancedMesh (draw call 87 → ~50, 1. bölüm). Arkada kalan ve kalabalık bölümdeki patili küpler LOD ile çizilir. Bloklara hafif kenar parlaması (rim) ekler.
- `yapi/kale.js`: Korsan Kalesi seti. v5.1'de: 3B sandık (çerçeve + X + köşebent + perçin), yontma taşlardan taş blok (ksTas, ksTas2, yeni ksTas3/ksTas4), yeni ksBuz3 ve ksDirek, 10 yüzlü mücevher, kabartma yıldızlı yıldız blok, altın halkalı mor sütun, daha doygun buz.
- `oyun.js` `malzemeFx`: kırılmada malzemeye göre parçacık (tahta kıymık, taş moloz + toz, cam kırığı + parıltı, buz kristali, mücevher kıvılcımı, pati altın parıltısı).

## Araçlar (repo kökünde `python3 -m http.server 8765` açık olmalı)

- `python3 yapi/uretici/katalog.py KLASOR [tur1,tur2]`: blok kataloğu görüntüleri. `katalog_resim.py KLASOR cikti.jpg puan.json`: puanlı katalog sayfası.
- `node yapi/uretici/kapali_uygula.mjs`: kayıtlı bölümlerde kapalı blokları değiştirir, değişenleri `rapor/kapali_degisen.json`'a yazar.
- `python3 yapi/uretici/kapali_test.py`: değişen bölümleri fizikle (YP.run) yeniden test eder, geçemeyeni arketip.js ile yeniden üretir. Yarıda kalırsa kaldığı yerden devam eder (`rapor/kapali_test.json`).
- `python3 yapi/uretici/ekran.py PORT KLASOR 1,5,12,25,780 onek`: oyun içi ekran görüntüsü.

## Durum (15 Kas 2026)

- [x] Blok kataloğu (önce, 105 tür) + puan kartı: `rapor/katalog/katalog_once.jpg`, `puan_once.json`
- [x] Patili küp: 9 renk, clearcoat, altın/gümüş pati, kontur, instancing, LOD, kırılınca gövde rengi + altın parçalar
- [x] Kapalı bloklar: 84 tür (eski şekiller, Tripo GLB blokları, cam şekiller); 1628 kayıtlı bölüm + 1-25 değiştirildi
- [x] Kalanların iyileştirilmesi (sandık, taş, buz, mücevher, yıldız, mor sütun, yeni direk) + malzemeye göre kırılma + rim
- [x] Sürüm: oyun.js?v=97, bolum.js?v=6, sekil.js?v=5, kale.js?v=2, bolumler.json surum 2, sw.js CACHE v48
- [ ] Fizik testi: `kapali_test.py` (bitince `node yapi/uretici/birlestir.mjs` ile bölüm adları ve özet)
- [ ] Katalog (sonra) + 1/5/12/25/780 önce-sonra görüntüleri, main'e birleştirme

## İleride yapılabilecekler

- Sandık için LOD (şu an ~4 bin üçgen; arka sırada basit kutu yeterli).
- Taş kemeri de tek tek taşlardan kurmak (şu an doku).
- Elle yapılmış 14, 20, 22. bölümleri bot değişiklikten önce de çözemiyordu (bot sınırı, yapı değil); telefonda denenip gerekirse top eklenebilir.
