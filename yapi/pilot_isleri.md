# Pilot bölüm işleri (v5.4) — nerede kaldık

"2000 bölüm birbirine benziyor" işinin pilot aşaması: yeni bölüm biçimi (v2) ve 3 deneme bölümü (P1, P7, P13). Yeni oturumda "kaldığın yerden devam et" denince buradan sürdürülür.

## Nasıl açılır
- `yapi/index.html?pilot=1`, `?pilot=7`, `?pilot=13`. Başka sayı: "Pilot N yok" kartı ve hazır pilotlara düğmeler.
- Pilot kipte kayda HİÇ yazılmaz (bölüm, altın, yıldız, istatistik, görülen bloklar, güçlendiriciler aynen kalır). Ana sayfa ve güçlendirici kartı açılmaz.
- Kazanınca/kaybedince kart: "Tekrar" ve "Sonraki Pilot".

## Yapı
- `yapi/pilot.js`: yükleyici + v2 kurucu: adalar/katlar (kare, dikdörtgen, disk, çokgen, eşkenar dörtgen), köprüler, kamera ipuçları, yeni kurallar, pilot kartları.
- `yapi/pilot_sekil.js`: yeni bloklar: `plSutunK` ince sütun, `plCati` köşk çatısı, `plTepe` dikilitaş başlığı, `plMenhir`/`plMenhirK` dikili taş, `plLento` lento, `plSunak` sunak tablası, `plDomino` domino taşı.
- `yapi/pilot/pilot_kaynak.py` → `yapi/pilot/pilot.json` (oyun yalnız JSON'u okur). Değişiklikten sonra: `python3 yapi/pilot/pilot_kaynak.py`.
- `yapi/oyun.js`: `PILOT` işaretli kancalar (grep PILOT). Ortak parça kurulumu `parcaKur` + bölüm başlangıcı `bolumBasla` (eski `addCubes` ikiye bölündü, davranış aynı).

## v2 biçimi (pilot.json)
- `ada`: `{ id, x, z, katlar: [{ sekil, r, rz?, dz?, n?, don?, ust, kal? }] }`. Her kat ayrı sabit gövde ve ayrı platform kaydı; kattan aşağı düşen parça "düştü" sayılır.
- `kopru`: `{ tip: 'tahta'|'tas', a, b, en }`.
- `parca`: `{ t, x, y?, z, ry?, p: 'adaId.kat', id, kir?, devril?, merkez?, patlama?: {r, guc}, patlarKir? }` (y = parçanın alt yüzü).
- `kam`: `{ pitch, yaw, atis, genis }`, `top`: top sayısı.

## Pilot kuralları (yalnız pilot parçalarında)
- Sert düşme kırılması (`kir`/`carp`): sabit yüzeye yatay çarpan, yatmış ya da aşağı düşmüş taş kırılır. Top değince kırılmaz.
- Devrilme (`devril`): uzun taş top değince kaymaz, devrilir (oyunun 13 hız sınırı onları buz gibi kaydırıyordu).
- Yatmış taş/domino vurulunca parçalanır.
- Büyük patlama (`patlama`): bu TNT kendi katında patlayınca r içindeki kırılabilir parçalar parçalanır, diğerleri itilir.
- Top çıkış noktası kameradan namluya giden ışın üzerinde (`atis`): ekranda namludan çıkar, derin yapıda atış hattı bakış hattına yakın.
- Domino ve pilot taşları için temas tablosu (cannon-es iki malzemede sürtünme tanımlıysa tabloyu yok sayıp çarpımı alıyordu; dominolar birbirine yapışıyordu).

## Test
- Repo kökünde `python3 -m http.server 8770`.
- `python3 yapi/uretici/pilot_test.py pilot 1,7,13` → `yapi/uretici/rapor/pilot/P{N}.json` + ekran görüntüleri.
- `python3 yapi/uretici/pilot_test.py regresyon 1,6,12,25,781,784 sonra` → `rapor/pilot/regresyon/`.
- `python3 yapi/uretici/pilot_test.py ekran 1,7,13` → yalnız ekran görüntüleri.

## Durum (16 Kas 2026, dal `pilot-bolumler`, main'e birleştirilmedi)
- [x] Altyapı, 3 pilot, testler. Kamera Adem'in isteğiyle önden (yaw 0), derinlik yerleşimden.
- Test sonuçları (rapor/pilot/P{1,7,13}.json): hepsinde açılış hatasız, iç içe girme 0, 3 sn durgunlukta düşen/kayan 0.
  - P1 (29 parça, 25 top): TNT'ye tek atış 10 parça (orta kuşak 4/8, köşk 6/8, çatı düştü). Bot 21/21/23 atışta kazandı.
  - P7 (23 parça, 18 top): ön dikili taş tek atış: taş içe devrildi, 2/6 lento düştü ve kırıldı; sunak YIKILMADI. Bot 12/14/12.
  - P13 (22 parça, 10 domino, 14 top): ilk dominoya tek atış: 10/10 devrildi, TNT patladı, kule 6/8 (TNT dahil); 14 parça. Bot 12/11/8.
  - 390x844 çizim/üçgen: P1 82/53.6k, P7 73/35.0k, P13 80/67.0k. Kayıt: kazanmadan önce/sonra localStorage aynı (3 bölüm).
- Bilinen zayıflık: fizikte gerçek zamana bağlı sayaçlar var; aynı tohumla bile bot atış sayısı ±3 değişiyor (main'de de: bölüm 1'de 15 ve 11).
- [ ] Yönetmen incelemesi, telefonda deneme, sonra main'e birleştirme.

## Geri dönüş
`yapi/pilot.js`, `yapi/pilot_sekil.js`, `yapi/pilot/` silinir; `yapi/oyun.js`'te `PILOT` işaretli satırlar silinir (`let CPITCH`/`CAZ` tekrar `const` yapılabilir). `parcaKur`/`bolumBasla` bölünmesi kalabilir (eski davranışla aynı).

## 17 Kas 2026: YÖN DEĞİŞTİ (Adem'in kararı) — önce bunu oku
- P1, P7, P13 (ayrı adalar, taş çember, domino) Adem'in istediği görüntü değil; RAFA KALKTI. Altyapıları (pilot kipi, serbest yerleşim, kaide şekilleri, kayıtsız kip) kullanılmaya devam.
- İstenen: Adem'in gönderdiği referans dizilimler gibi: TEK kaide (kare/yuvarlak/dikdörtgen), ekranı dolduran iri ve sıkı yapı, ÖNDEN bakış, 3-5 sıra derinlik, uzun kalas / dik sütun / yatık silindir / taşan kat, simetrik desen.
- Kamera standardı: `kam: {pitch: -8, yaw: 0, genis: 0.95}` (kamera kaide hizasında; kaide üstü ince şerit, ayak görünür). Adem onayladı.
- Örnek kabul edilen bölüm: P21 Buz Sarayı (`pilot_kaynak.py` içinde `p21`), `?pilot=21`. Kazanılabilirlik testi henüz yapılmadı.
- Blok görünümü hedefi: temiz "oyuncak" tarzı (canlı düz renk, yuvarlak kenar, hafif parlama, belirgin amblem). Taş sütun ve tahta direk fazla dokulu; yenilenecek. Başka oyunun amblemleri kopyalanmaz: pati/tilki amblemi, korsan renkleri.
- Zemin düzeltmesi (koy iskelesi batmaz, sahil kıyı çizgisi resme göre) main'de: oyun.js?v=100, CACHE v51. Bu dal main'e alınırken sürümler 101 / v52 yapılmalı.

## 17 Kas 2026: Blender bloklari ve P22 (v5.6)
- Blender 5.3 kuruldu (`C:\Program Files\Blender Foundation\Blender 5.3\blender.exe`). Uretim: `blender -b --python yapi/uretici/blender/pilot_bloklar.py` (tek model: `-- kup`).
- 5 model `yapi/model/pilot/pl_*.glb` (39-73 KB, 508-738 ucgen): patili kup, uzun kalas, kavanoz, tilki amblemli tas levha, bilezikli sutun. Sekil gercek geometri; ortam golgesi + yumusak isik Cycles ile hesaplanip 512'lik dokuya gomulu; renk kose renginde (tam beyaz = turun govde rengi).
- Turler `pilot_sekil.js`: `plKupK/Y/M`, `plKalas`, `plKavanozT/M`, `plLevha`, `plSutun`. Model dosyasi yalniz o turu kullanan pilotta iner.
- P22 Oyuncak Kale (`?pilot=22`): 55 parca, 24 top. Test (390x844): konsol hatasi yok, 3 sn kayma 0, atista kavanoz/kalas kiriliyor. Kazanilabilirlik (bot) testi yapilmadi.
- Onizleme ve ekran goruntusu: `yapi/uretici/blender/onizleme/onizleme.png`, `yapi/uretici/rapor/pilot/P22_390x844.jpg`.

## 17 Kas 2026 (aksam): Adem'in uc duzeltmesi (v5.7)
- Kamera standardi artik `kam: {pitch: 1, yaw: 0, genis: 0.95}` (eski -8 asagida kaliyordu). P21 ve P22 guncellendi.
- Top parcalarin icinden geciyordu: top 95 birim/sn ile bir fizik adiminda 0.8 birim gidip silindir govdenin (sutun, kavanoz) icine giriyor, carpisma kaciyordu. `oyun.js` icinde PILOT isaretli `CCD` (postStep): top bir sonraki adimda parcaya girecekse yuzeyine alinir. Yalniz pilot kipte acik; normal bolumlerde ayni hata olabilir ama denge testleri eski davranisa gore, orada acilmadi.
- Kaide ayagi havada gorunuyordu (pilotta tabansiz, yerde duz kesilen ince direk): `pilot.js` `ayakDibi()` oyunun kendi ayak tabanini (kaide, halka, baslik) geri acar ve altina yumusak temas golgesi koyar; `yapi/referans/oyun` gorsellerindeki gibi. Su birikintisi, kum yigini, asagi uzayan direk ve kum adacigi denendi; Adem begenmedi.

## 17 Kas 2026 (gece): blok cilasi, eski bloklarin yenilenmesi, P23 (v5.8)
- Blender betigi: pati parmaklari sekizgen (yuvarlak), kavanoz kapagi tirtiksiz yuvarlak, sutun yivleri belirgin; sutun govdesi isaretli renk (tek dosyadan `plSutun` krem ve `plSutunG` gri tas).
- Yeni blok `plDirek` (`pl_direk.glb`, 724 ucgen): dik tahtali, iki lacivert kusakli, patili tahta direk (1x2).
- P21 Buz Sarayi: eski dokulu `ksSutun` -> `plSutunG`, `ksDirek` -> `plDirek`. Buz, sandik, TNT, elmas hala eski tarzda.
- P23 Fener Kulesi (`?pilot=23`): yuvarlak kaide, 4x4 taban, 58 parca, 24 top. Ekran: `yapi/uretici/rapor/pilot/P23_390x844.jpg`.
- Test (390x844): P21, P22, P23 konsol hatasiz, 3 sn kayma 0; `?sv=6` hatasiz. Kazanilabilirlik (bot) testi yok: top sayilari tahmin.
- Pilot kartindaki sira artik 21, 22, 23 (1, 7, 13 rafta, adresle acilir).

## 17 Kas 2026 (gece, Opus): P21'in eski bloklari yenilendi (v5.9)
- Blender betigine 5 yeni blok: `pl_buz` (1x1), `pl_buz3` (3x1), `pl_sandik` (capraz destekli), `pl_tnt` (bomba etiketli), `pl_elmas` (kesme tas). 96-612 ucgen, 20-67 KB.
- Turler `pilot_sekil.js`: `plBuz`, `plBuz3`, `plSandik`, `plTNT` (oyunun kendi patlama yolu: boom 1.9, guc 11), `plElmas` / `plYakut` (ayni dosya, mavi / kirmizi). Davranis eski ks turleriyle ayni.
- Buz parlak ve hafif saydam denendi: karli fonda soluk kaldi. Saydamlik kaldirildi, yansima kisildi, renk canli mavi (#2a8ef4).
- P21 Buz Sarayi artik tamamen yeni tarzda (yalniz ortadaki altin patili kup `oyA` eski, o zaten oyuncak tarzi). Ekran: `yapi/uretici/rapor/pilot/P21_390x844.jpg`.
- Test (390x844): P21 atista buz kiriliyor, TNT patliyor (cevresindeki 8 buzu kirdi), mucevher kiriliyor; konsol hatasi yok. Sandiklar sutunlarin arkasinda kaldigi icin dogrudan vurulamadi (kirilma yolu patili kupla ayni). P22, P23, `?sv=6` hatasiz.
- Not: betigin tamami yeniden calistirilinca `pl_kup.glb` ve `pl_direk.glb` bayt olarak degisebiliyor (gorunum ayni); gereksizse `git checkout` ile geri alinir.

## 18 Kas 2026 (Opus): resim bolumleri 31-36 (v8.3) — Adem'in Gemini cizimi
- 6 yapi: 31 Korsan Gemisi, 32 Kale, 33 Kuru Kafa, 34 Deniz Feneri, 35 Foxi Tilki Basi, 36 Tas Kopru. Acmak: `yapi/index.html?pilot=31` .. `36` (kayitsiz pilot kip; kartta "Sonraki" 31-36 arasinda doner).
- Kaynak `yapi/pilot/resim_kaynak.py` -> `yapi/pilot/resim.json` (ayri dosya; pilot.json, 2000 bolum ve kayit degismedi). Degisiklikten sonra: `python3 yapi/pilot/resim_kaynak.py`.
- Yalniz oyundaki bloklar (ks*, oy*). Tek sira derinlik, kamera `pitch 1, yaw 0`. `kaide: 'mor'` -> mor-altin kaide + altin elmas susu + mor-altin ayak (pilot.js `morMat`).
- `bos: 1` isaretli ksKemer'in carpismasi iki ayak + ust tas (acikliktan top gecer; pilot.js `kemerBos`). Kale ve fener kapisi boyle.
- Resim bolumlerinde ksTas / ksFici / ksSise Blender modeliyle (gri tas, fici, sise); oyunun "parlak" kutuphane eslemesi (mavi patili tas, kutuk, kavanoz) yalniz bu bolumlerde kapali (oyun.js `RESIMQ`).
- Kurulumda 3 sn gorunmez oturtma (pilot.js `oturt`): 3 mm sira boslugu + temas sikismasi ilk uyanista ~6 cm cokuyordu.
- Test: `python3 yapi/uretici/resim_test.py ekran|fizik|bot 31,32,33,34,35,36`. Sonuc (18 Kas): 5 sn fizikte dusen 0, en cok kayma 0.9-1.8 cm, donme <0.3 derece; bot 3 tohumda kendi top sayisiyla hepsini kazandi.
  Top: 31:18, 32:20, 33:20, 34:20, 35:16, 36:18. Karsilastirma: `yapi/uretici/rapor/resim/karsilastirma_1..3.jpg`.
- v8.4 (18 Kas, Adem: "derinlik 3 olsun, tek sira hemen yikiliyor"): her blok onde/ortada/arkada (3 sira, 87-126 parca). Bosluklar uc sirada da acik.
  3 sira tas yikilmiyordu (60 topla kale 45 blok kaliyordu): bu bolumlerde tas ve kemer kutlesi x0.35 (`km`), devrilip sert carpan tas kirilir (`kir: 4`),
  TNT buyuk patlama (`patlama r 4.5, guc 13`), kaide payi 0.2-0.25. Test botu kemerin ortasina (acikliga) degil ayagina nisan alir (pilot_test.js).
  5 sn fizik: dusen 0, kayan 0 (en cok 1.9 cm, 0.6 derece). Bot (3 tohum) kazandigi atislar: 31: 39/45/40, 32: 41/44/48, 33: 16/12/14, 34: 46/35/38, 35: 43/42/36, 36: 54/44/47.
  Top: 31:50, 32:56, 33:20, 34:50, 35:52, 36:60. Kale cizim 63, ucgen 81 bin (390x844).
- v8.5 (18 Kas aksam): 18 yeni resim bolumu 37-54 (Adem'in 3 yeni cizimi), hepsi 3 sira derinlik, `?pilot=37` .. `54`.
  37 Mor Bayrakli Gemi, 38 Kirmizi Kubbeli Kapi, 39 Yildizli Kale, 40 Renkli Agac, 41 Pazar Tezgahi, 42 Tacli Kemer, 43 Yel Degirmeni, 44 Roket, 45 Tas Robot,
  46 Hazine Sandigi, 47 Mavi Pagoda, 48 Renkli Piramit, 49 Ucak, 50 Kobra Yilani, 51 Taht ve Hazine, 52 Yelkenli Gemi, 53 Kurbaga, 54 Maden Arabasi.
  `Yapi.ek(..., derin=(...))`: parca yalniz verilen sira(lar)da (sandik kapagi arka sirada). Parca basina `km` ile tas kutlesi ezilebilir (maden arabasi rayi km=1).
  Kagit ustu denetim: `python3 yapi/uretici/resim_denetim.py [31,32..]` (ic ice gecen / agirlik merkezi destek disinda kalan blok).
  5 sn fizik: dusen 0; en cok kayma 2.3-3.4 cm (51 tac, 52 direk), digerleri <2.5 cm. Bot 3 tohumda hepsini kazandi; top = en uzun atis x1.15 (+1).
  Karsilastirma: `yapi/uretici/rapor/resim/karsilastirma2_1..6.jpg`.
- v8.6 (18-19 Kas): Adem'in "Foxi smash gorsel referans" zip'i (10 sayfa) -> 54 duvar bolumu `?pilot=55` .. `108` (`pilot/duvar.json`, kaynak `pilot/duvar_kaynak.py`).
  Sayfa 1: 6 sekil (55-60, satirlar ortalanir), sayfa 2-10: dolu duvarlar (61-108). Tekrarlanan tasarimlar (Aslan Yuzu x3, Tas Robot x2, Buz Cerceve, Kemerli Ev, Kirmizi Cerceve x2) bir kez alindi.
  Izgara resimden otomatik cikarildi (`yapi/uretici/izgara/izgara.py` + `ciz.py`: hucre renk/doku -> harf, ustune harf yazilmis kontrol resmi) ve elle duzeltildi.
  Duvar kurallari: tas yan yana birlesir (2/3, kiris 'B' 4'e kadar), sutun/direk 2 boy, kalas 2 kat (ek yerleri kaydirilir), 'd' koyu ic = arka sirada tas; desteksiz her blogun altina kendi sirasinda duz blok.
  Fizik (yalniz duvar bolumleri, pilot.js): fici carpismasi kutu (`kutu:1`), alt 3 sira tas normal agirlik, kalas x2.5; cozucu 24 tur, donme sonumu 0.45.
  5 sn fizik: 54/54 dusen 0, kayma <3 cm. Bot (tohum 12345): 54/54 kazandi, 24-87 atis; top = atis x1.15 + 2 (30-103).
  Karsilastirma: `yapi/uretici/rapor/resim/karsilastirma3_1..9.jpg`.
- v8.7 (19 Kas gece, Adem): (1) top arabasi yerinde (ekranda namlu ucu -0.7); pilotta kamera yukari/asagi kayar, platform yuzeyi arabanin ust ucunun hemen ustunde (oyun.js fit, `TC.ustF`).
  (2) top ilk carpmaya kadar yercekimsiz, duz ve sabit hizla (oyun.js `DUZ`, `?duz=0` eski yay; iskalayan top 1.1 sn sonra duser): uzun kulede yukari atista guc kaybi yoktu.
  (3) seri atista yavaslama: vurus donmasi (hitstop) en fazla 0.6 sn'de bir; pilotta 120+ parcali yapida her vurusta yalniz 7 birim cevre uyanir (wakeAll(p)); duvar cozucu turu 24 -> 18.
  (4) denizde ayak tabansiz duz direk (pilot.js `suAyak`). (5) hareketli platformlar: `B.hareket` {tip: don|asansor|kay} ana platformda (gorunus ayri mesh, kamera hareket yolunu kapsar);
  `pilot/hareket.py` 31-108'e dagitir: (n-31)%6 -> sabit, donen, asansor, kayan, iki platform (yanda 2x3x3 kucuk yapi), sabit.
- v8.8 (19 Kas): duz atis (`DUZ`) ve hitstop 0.6 sn siniri yalniz pilotta (`PILOTQ`); ana oyun 2000 bolum tamamen v8.6 davranisinda.

## KALDIGIM YER (19 Kas 2026, yeni oturum buradan baslar)
- Pilot bolumler: 31-36 + 37-54 (`pilot/resim.json`), 55-108 (`pilot/duvar.json`). Ana oyuna BAGLI DEGIL; yalniz `?pilot=N` ile aciliyor.
- Ana oyunun 2000 bolumu, platformu, kamerasi, top arabasi, kaydi DEGISMEDI (v8.8 ile duz atis/hitstop da pilota cekildi).
- Adem'in karari bekleniyor: sekiller ana oyuna nasil tasinacak? Oneri: (1) mevcut bolumlerin arasina serpistir (or. her 10 bolumde bir sekil bolumu);
  diger yollar (2) haritada ayri sefer, (3) 2000 sonuna ekle. Tasirken ana oyunun kendi platform/kamera/top arabasi kullanilir, pilot kamera ayari tasinmaz.
- Adem oyunun cogunlugu icin yeni gorseller verecek. Kurallar ayni: yalniz oyundaki bloklar, 3 sira derinlik, koyu ic tas, havada blok yok,
  bosluk yalniz kapi/kemer/goz; once pilot bolum + ekran goruntusu + fizik + bot testi; Adem onaylamadan yeni bolume gecme.
- Zorluk/top sayisi testi (31-108, duz atis + hareketli platformlarla) BILEREK ERTELENDI: tasima yeri belli olunca ana oyun ayarlariyla yapilacak.
- Acik not: sise ustune konan kalas/sandik havada gibi gorunebilir (sise modeli kisa): 41, 96, 102, 108.
- Araclar: `python3 -m http.server 8770` (repo kokunden), `python3 yapi/uretici/resim_test.py ekran|fizik|bot|tek|hareket 31,32`,
  `DOSYA=... python3 yapi/uretici/resim_denetim.py`, izgara cikarma `yapi/uretici/izgara/izgara.py` + `ciz.py`. Kaynaklar: `pilot/resim_kaynak.py`, `pilot/duvar_kaynak.py`, `pilot/hareket.py`.

## 19 Kas 2026 (Opus): v9.0 — sekil bolumleri ANA OYUNDA + ikinci zip (98 yeni tasarim)
- Adem'in karari: "zorluk egrisine gore araya serpistir; kayan, asansor, donen, ikili/uclu platform olsun". Yeni gorseller gelmeye devam edecek.
- Ana oyun baglantisi (pilot.js ANA KIPI, `pilotKur(A, true)`): `yapi/pilot/sira.js` (uretilir: `python3 yapi/pilot/sira.py`) bolum -> [pilot no, ad, bot atisi, hareket].
  Sekiller kolaydan zora (bot atisi) siralanir; 26'dan baslayip her 10 bolumde bir (dunyanin 6. bolumu, egri.js'te 'normal') o bolumun yerine gecer. 2000 bolum ve kayit ayni.
  - Kayit, ilerleme, altin, kartlar, guclendirici: ana oyunun. Platform gorunusu ana oyunun temali platformu (temaKur); pilot.js yalniz fizik govdesi, parcalar, kamera cercevesi, hareket kurar.
  - Atis ana oyunun yayli atisi (DUZ yalniz ?pilot kipinde). Kamera pilot standardi (pitch 1, top arabasi sabit); normal bolume donunce `birak()` kamerayi (9 derece), cozucuyu (14), araba kaidesini geri alir.
  - Top: `egri.js sekilTop(L, bot, hareket)` = bot x1.2 x genel egri x testere + 2 (+2 hareketli), en az botun %75'i, en az 12.
  - Tas/fici/sise sekil bolumlerinde Adem'in cizimindeki gibi gri tas / fici / sise: oyun.js `GRI` (ksTasG vb., ayni turun parlak kutuphane oncesi gorunumu). Normal bolumler degismedi.
  - Kapatma: `?sekil=0` (o bolumlerde eski uretilmis yapi). Test kipinde yalniz `?test&sekil=1` ile acik.
- Hareket (`pilot/hareket.py`): (n-31)%6 -> sabit, donen, asansor, kayan, iki platform, UC platform (yapi dar ise; kaide yarim genisligi > 7.3 ise iki).
- Ikinci zip (29 resim): `pilot/yeni_kaynak.py` -> `pilot/yeni.json`, pilot 109-206 (98 tasarim). Ayni harfler ve kurallar (duvar_kaynak.py; fonksiyonlari ice aktarilir).
  Lacivert tas -> S, lacivert sandik -> P, yesil sandik -> g, bombali kutu -> T. Tekrar eden resimler bir kez alindi (406650=591129=384272, 410889=391432, 537414=376517, 544711=363409, 695710=621718, 799943=972870, 807485=951960, 929709 = 946164'un dikey hali).
  Alinmayanlar: yel degirmenleri (capraz kanat havada kalir), helikopter, balik, ucak, 835846/847092 (tren/baykus/fil tekrarlari), 814975'in gemi/fener/tilki/kopru tekrarlari.
- Bot: `pilot/bot.json` (oyuncu botu, yay atis, hareketli platformla, sinirsiz top, tohum 12345). sira.py bunu kullanir.
- Acik isler: Adem telefonda deneyip begenmedigi tasarimi soyler; ozellikle Baykus, Kollu Robot (kollar direge donustu), Patili Kuru Kafa. 300+ parcali duvarlar (Sandik Pati Mozaigi, TNT Carpi Kalesi, Yesil Cerceveli Fici Deposu) telefonda agir olabilir.
- Yeni gorsel gelince: tasarimi `yeni_kaynak.py`'ye ekle (ek(...)), `python3 yapi/pilot/yeni_kaynak.py`, bot (pilot no listesi), bot.json'a yaz, `python3 yapi/pilot/sira.py`.
- v9.1 (19 Kas): Adem "ornek 10 gorsel yap" dedi: Claude'un kendi tasarimi 10 sekil, `pilot/ornek_kaynak.py` -> `pilot/ornek.json`, `?pilot=900` .. `909`
  (Kalpli Duvar, Gokkusagi Piramidi, Yildiz Kapisi, Kurbaga, Penguen, Dogum Gunu Pastasi, Dev Hamburger, Bacali Ev, Basamakli Tapinak, Panda). Ana oyuna BAGLI DEGIL; Adem'in onayi bekleniyor.
- v9.2 (19 Kas): Adem "eksigimiz parlak cilali sekiller; platformda duran 3B de yap, donen platformda her taraf farkli gorunsun" dedi.
  - Cila: oyun.js `CILA_T` / `cilaMat` — sekil bolumlerindeki (pilot ve ana oyun) ks*/oy* bloklarin MeshPhysicalMaterial clearcoat'lu esi (k+'C'). Fizik ayni. Kapatma `?cila=0`.
  - 3B voksel sekiller: `pilot/ucb_kaynak.py` -> `pilot/ucb.json`, `?pilot=950` .. `955` (Dort Yuzlu Kale, Tilki Kafasi, Dort Renkli Piramit, Yilbasi Agaci, Catili Ev, Deniz Feneri).
    Her yuz baska desen; platform bastan doner (`hareket.hemen` -> oyun.js `g.donHemen`). Ana oyuna BAGLI DEGIL; Adem'in onayi bekleniyor.
