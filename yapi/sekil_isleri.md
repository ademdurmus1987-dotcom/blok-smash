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
- [x] Fizik testi: 1628 bölüm test edildi; 1440'ı değişmiş haliyle geçti, 188'i yeniden üretildi, çözülemeyen kalmadı (rapor/kapali_test.json). birlestir.mjs çalıştı.
- [x] Elle yapılmış 1-25: kapalı bloklar değişti; 9, 10, 12, 15, 17, 23, 24 için küçük ayar (ek top / kırılan kalas). 14, 19, 20, 22'yi bot değişiklikten önce de çözemiyordu.
- [x] Katalog önce/sonra ve puanlar: rapor/katalog/ (katalog_once.jpg, katalog_sonra.jpg, katalog_once_sonra.jpg, puan.md). Bölüm 1/5/12/25/780 önce-sonra: rapor/katalog/bolum_once_sonra.jpg
- [x] Eski kayıtla deneme: 780'deki oyuncu 780'den devam ediyor, altını korunuyor, "görülen bloklar" listesinde kapalı blok olsa da hata yok.
- [x] main'e birleştirildi

## v5.2 (15 Kas 2026 akşam) — "referans kalitesi" turu
- [x] Işık: pozlama 1.32 → 1.12, ortam ışığı 1.6 → 1.15, güneş 2.6 → 3.2 (renkler pastelden doygun hale, hacim ve gölge belirgin)
- [x] Koyu kontur: ornek.js ters kabuk (tür başına +1 çizim). Patili küpte kabuk = düşük sürümün gövdesi, taş/sandıkta tek pahlı kutu, şişede kontur yok (saydam cam)
- [x] Patili küpe ön yüzde pahlı panel çerçevesi (gövdenin koyu tonu)
- [x] Beyaz küpün 6+ olduğu 113 bölümde beyaz yerine canlı renk (fizik aynı); 25. bölüm pembe
- [x] Şişe: saydam cam + iç sıvı + mantar + ip. Fıçı: tahta kapak, tapa, perçinli çember
- [x] Sürüm: oyun.js?v=98, sekil 6, kale 3, pati 2, ornek 2, bolum 7, bolumler.json surum 3, CACHE v49
- Üçgen: 1/5/12/25/780 bölümde 71k-133k (önce 27k-69k); çizim 64-85 (önce 88-226). Orta seviye telefonda yeterli olmalı; telefonda takılma görülürse ilk ayar: ornek.js kontur kapatma (kontur: 0) ya da pati.js ESIK.

## İş tamam.

## İleride yapılabilecekler

- Sandık için LOD (şu an ~4 bin üçgen; arka sırada basit kutu yeterli).
- Taş kemeri de tek tek taşlardan kurmak (şu an doku).
- Elle yapılmış 14, 20, 22. bölümleri bot değişiklikten önce de çözemiyordu (bot sınırı, yapı değil); telefonda denenip gerekirse top eklenebilir.

## v5.3 (15 Kas 2026 gece) — "cila" seti: oyun kamerasina gore yeniden cizim
Adem: "sekiller kalitesiz, cok basit duruyor; referansla fark cok fazla". Yakin planda bloklar iyiydi; sorun telefondaki oyun goruntusuydu.
- [x] Cozunurluk: telefonda 1.25 -> 1.75 (bloklar bulanik ve tirtikliydi). Hareketli sahnede ortalama 45 FPS altina duserse kendiliginden 1.5, sonra 1.25 (`prOlc`).
- [x] Siyah kontur kalkti (dusuk cozunurlukte karalama gibi duruyordu), kenar parlamasi 0.28 -> 0.10 (yan yuzler soluk gorunuyordu).
- [x] `yapi/cila.js` (yeni): patili kup (temiz yuvarlak govde + ice gomuk pano + kabarik pati; sari/turuncuda krem pati, siyah cizgi yok),
      buz (doygun mavi, capraz parlak serit), tas (ton farkli pahli taslar), yildiz blok, mucevher (yuzey yuzey parlak).
      Isik-golge dokuya islendi: karsidan bakinca da hacimli. Patili kup icin Tripo modeli artik yuklenmiyor (acilis hizlandi).
- [x] Geri donus: adrese `?cila=0` eklenince v5.2 gorunumu (kontur, 1.25, Tripo patili kup) aynen gelir.
- [x] Surum: oyun.js?v=99, sekil 7, ornek 3, cila 1, bolum 8, CACHE v50. Once/sonra: `uretici/rapor/katalog/cila_once_sonra.jpg`
- Denenmedi: gercek telefonda isinma. Fazla isinirsa oyun.js'te `CILA ? 1.75` degerini 1.5 yap.
- Siradaki adaylar (dokunulmadi): tas sutun, kemer, fici (uzaktan koyu), sandik X tahtalari (kalinlastirma `kutu`yu bozuyor, ayri geometri gerek).

## 17 Kas 2026: ana oyun bloklari Blender'a geciyor (v6.0-6.1, Opus)
- v6.0: kirilan bloklarin parcalari dolu. `oyun.js` `fragYap`: parcanin acik kenarlari ice dogru bir tepe noktasina kapatilir; kesit yuzleri `kesitMat` ile bloktan acik tonda, mat cizilir. Yalniz `?olc` adresinde `window.__kirik` inceleme kancasi var.
- v6.1: `yapi/blok3b.js`: ana oyun turlerinin gorunumunu `yapi/model/blok/*.glb` ile degistirir (ad, olcu, fizik, kirilma ayni). `sekil.js` `TUR[k].yap` -> model varsa model, yoksa eski cizim. Eski gorunum: `?b3=0`.
- Ilk tur: tas (`ksTas`, `ksTas2`, `ksTas3`, `ksTas4` -> `tas1..tas4.glb`, 420-772 ucgen, ~80 KB). Uretim: `blender -b --python yapi/uretici/blender/pilot_bloklar.py -- tas1 tas2 tas3 tas4`.
- Ders: oyun kamerasinda bir blok ~30 piksel. Kucuk tugla + koyu cerceve 'pencereli gri kutu' gibi okundu; iri tas (yuzde bir tam + iki yarim), acik cerceve ve yumusak harc temiz tas gibi okunuyor.
- Test (390x844): `?sv=582` (38 tas) ve `?sv=25` (uzun tas) hatasiz; atista taslar dusup kiriliyor. Ucgen 123 bin -> 115 bin, cizim 53 -> 53. Once/sonra: `yapi/uretici/rapor/blok3b/tas_once_582.jpg`, `tas_sonra_582.jpg`.
- Siradaki turler (bolumlerde kullanim sirasiyla): ksSandik/K/M, ksBuz, ksYildiz, ksYakut/ksElmas, ksSise Y/B/M, ksKalas1/2/3, ksKaro, ksFici/K, ksTNT, ksKemer, ksSutun, ksDirek, ksMorSutun, ksBuz3. Pilotta karsiligi olanlar (pl_*) dogrudan `LISTE`ye eklenebilir.

- v6.2 (17 Kas): sandiklar (`ksSandik`, `ksSandikK`, `ksSandikM` -> `sandik_t/k/m.glb`, 524 ucgen, 65 KB): cerceve, dik tahtalar, eski sandiktaki gibi X destek, civiler. Uretim: `-- sandik_t sandik_k sandik_m`.
  Test `?sv=239` (32 sandik): hatasiz, atista 8 sandik kirildi. Ucgen 121 bin -> 59 bin (eski sandik agirmis). Once/sonra: `rapor/blok3b/sandik_once_239.jpg`, `sandik_sonra_239.jpg`.
- v6.3 (17 Kas): buz (`ksBuz`, `ksBuz3` -> pilotun `pl_buz`, `pl_buz3`), yildiz (`ksYildiz` -> yeni `yildiz.glb`: altin govde, kabarik bes kollu yildiz), mucevher (`ksYakut`, `ksElmas` -> `pl_elmas`, govde rengi tur basina). `blok3b.js` artik govde rengi, parilti ve metal secenegi aliyor.
  Test `?sv=204`: hatasiz; uc atista 18 buz, 2 elmas, 1 yildiz kirildi/dustu. Ucgen 38,7 bin -> 31,2 bin.
- v6.4 (17 Kas): patili kupler (`oyK oyY oyM oyS oyP oyT oyN oyB oyA` -> `pl_kup`, govde rengi tur basina, altin metalik), `ksTNT` -> `pl_tnt`, `ksDirek` -> `pl_direk`, `ksSutun` / `ksMorSutun` -> `pl_sutun` (gri / mor).
  Test: `?sv=246` hatasiz, ucgen 93 bin -> 44 bin; `?sv=1872` (16 tur karisik) hatasiz, 81 bin ucgen.
- v6.5 (17 Kas): ince kalaslar (`ksKalas1/2/3` -> `kalas1..3.glb`, yarim yukseklik), ficilar (`ksFici`, `ksFiciK` -> `fici_t/k.glb`), siseler (`ksSiseM/Y/B` -> tek `sise.glb`, govde rengi), mucevher karosu (`ksKaro` -> `karo.glb`), kemer (`ksKemer` -> `kemer.glb`, gercek kemer acikligi; carpisma kutusu eskisi gibi).
  Kemer: iki ust uste binen kesiciyle boolean acikligi delmedi (on yuz kapali kaldi); tek parca kemer profili kesiciyle duzeldi (isinla olculdu).
  Test `?sv=1872`: bolumde eski cizimli blok kalmadi; hatasiz; ucgen 130 bin -> 48 bin. Once/sonra: `rapor/blok3b/karisik_once_1872.jpg`, `karisik_sonra_1872.png`.
- Durum (17 Kas gece): bolum dosyalarinda gecen 35 turun hepsi (`ks*` 26, `oy*` 9) Blender modelinde. sekil.js'teki diger turler (tas2, tug2, buzP, jole, kurabiye...) yalniz eski bolum ureticisinde geciyor, hazir bolum dosyalarinda yok: yapilmadi.
  Genel tarama 390x844: `?sv=1, 12, 781, 1999` ve pilot 21, 22: eski cizimli blok yok, konsol hatasi yok. Telefonda denenmedi; kazanilabilirlik (top sayisi) yeni gorunumden etkilenmez (fizik ayni).

## v6.6 (17 Kas, Opus): zemin, ayak, dunyalar (Adem: "1000. bolum 1. gibi", "ayaklar yansimamis", "zeminde bile suya dusuyor")
- Zemin efekti: `groundFx`/`landFx` artik dustugu yerin zeminine bakar (`fxZemin` -> `zoneAt`). Eskiden butun fon icin tek tur (`zemin()`) kullaniliyordu: sahilde kuma, koyda iskeleye dusen top/bloga su sicriyordu. Koy iskelesinde tahta kiymigi (`ZFX.tahta`).
- Kiyi cizgileri resimden olculdu: sahil videosu 0.6 -> 0.67 (`SAHIL_KIYI`); yeni dunyalarda koy 0.54 -> 0.625, gun batimi 0.595 -> 0.635, volkan 0.6 -> 0.625, gece 0.6 -> 0.635. Kontrol: oyun ekraninda zemin noktalarini zoneAt rengine boyayan ekran goruntusu. Eski degerler: `?zfx=0`.
- Ayak tabani: pilottaki taban (kaide + halka + baslik) eski fonlarda da: sahilde taban + yumusak golge, koyda taban suya biraz gomulu + kopuk halkasi (`ayakTaban`). Eski: `?ayak=0`.
- 9 dunya varsayilan (eski 4 fon `?fon=eski`). Her dunya 10 bolum; 90 bolumde bir sira 4 dunya kayar (`dunyaNo`): 1000. bolum Hazine Magarasi, 1. bolum Dalgali Koy. Bolum adinin ustunde dunya adi, dunyanin ilk bolumunde "YENI DUNYA". Oynanisi degistiren deneme kurallari (9/14 kapi-giyotin, denge tahtasi, arka dizilis) yalniz `?fon=yeni` (`FONYENIQ`).
- Olcum (kayitli 26-2000): bolum buyuklugu butun bolumlerde ayni (ort. 40-43 kup, 6 kat, 5 genislik, 2 derinlik, ~18.7 top). Ilk adim olarak top payi ilerledikce azaliyor (`topHesap`: 150 -> 1650 arasi %14; bot alt siniri ayni): 1826-2000 ort. 18.8 -> 16.5 top.
- Yapilmadi (sonraki is): yuksek bolumlerde daha buyuk/karmasik yapi icin uretici egrisi + 1975 bolumun fizikle yeniden testi (dogrula.py, saatler surer).
- Surum: oyun.js?v=112, bolumler.json surum 4, CACHE v62.
