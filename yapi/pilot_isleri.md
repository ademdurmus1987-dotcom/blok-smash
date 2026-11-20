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
- v9.3 (19 Kas): Adem pilot 901 (patili kup piramidi) icin "boyle kalitesiz sekil istemiyorum" dedi, karisik bloklu kaliteli yapi ornekleri gonderdi.
  - Yeni bloklar (sekil.js): `uz1/uz2/uz3/uz4` + renk (K M S Y P T N A) uzun parlak oyuncak cubuk (clearcoat, ortada kabartma amblem); `kj`+renk kisa kavanoz;
    `kvU`+renk uzun kavanoz (yeni renkler); `tas1` tek koyu mavi tas. kavanoz(renk, hS) artik yukseklik alir (hS=2 eski hal aynen).
  - Yapilar: `pilot/yapi_kaynak.py` -> `pilot/yapi.json`, `?pilot=960` .. `967` (Kavanoz Kalesi, Buz Rafli Kule, Silindir Sarayi (doner), Ikiz Renk Duvari,
    Tas ve Kavanoz Kulesi, Sutunlu Tapinak, Kutuk Kosk (doner), Gokkusagi Basamaklari). Hepsi duruyor (dusen 0). Ana oyuna BAGLI DEGIL.
- v9.4 (19 Kas): Adem "referans oyundaki tabla ve top arabasi yerini olc, o duzende yap; atis guclu ve seri olsun; top arabasi referanstaki gibi ama ozgun renk ve pati damgali; golge; sekiller hala kotu".
  - Yerlesim (oyun.js `YER`, `?yer=0` eski): referans 390x844'te olculdu: tabla ust yuzu %64, yapi tepesi en fazla %15, araba ust ucu ~%82 (namlu agzi %86), araba genisligi ~%36 (tekerlekler disarida).
    Ana oyunda cerceve platform yaricapina degil kuplerin gercek kutusuna gore (kupler kurulduktan sonra fit() yeniden).
  - Atis (`GUC`, `?guc=0` eski): hiz 95->115, kutle 3.3->4.4, ilk carpmada hiz %60 kalir (eski %45), atis araligi 0.22->0.14 sn (basili tutunca seri). Top sayilari ayni: bolumler kolaylasmis olabilir.
  - Top arabasi (kaide.js `topModeli2`, `?top=eski2` eski): tombul turuncu govde, mor kisa namlu ve iri mor tekerlekler, altin agiz; arkada iri altin pati, tekerlek kapaklarinda krem pati.
  - Golge (`GOLGEZ`, `?golge=0` kapali): zeminde ShadowMaterial duzlemi; platform, ayak ve yapinin golgesi fona duser.
  - v9.4b: Adem 'top arabasi cok soluk': doygun kirmizi-turuncu govde, kirmizi kusak, govdede altin patiler, koyu mor tekerlek/namlu, az yansima.
- v9.5 (19 Kas): Adem 'acik renkler (sari) referansa yaklasmadi': ACES ton eslemesi parlak renkleri kremlestiriyordu. Khronos PBR Neutral (oyun.js, CustomToneMapping), pozlama 0.92 (`?pozlama=`). Eski: `?ton=aces`.
  - v9.5b: Adem 'turuncu ve her acik renk soluk': ortam isigi 1.15->0.78, gunes 3.2->3.6 (oyun.js KONT, `?kontrast=0` eski); kavanoz ve cubuklarda kendi isigi azaldi, alt golge koyu; sari daha saf (#ffcc00 / #ffc400).
- v9.6 (19 Kas): Blender bu ortama kuruldu (pip `bpy` 5.3, venv). Yeni TEK TARZ blok seti: `yapi/uretici/blender/yeni_bloklar.py` (pilot_bloklar.py yardimcilarini kullanir) -> `yapi/model/blok2/`
  cubuk1-4 (uz1..uz4 + renk), kavanoz1 (kj), kavanoz2 (kvU), silindir (dalga: ana oyunda da), kiris3 (yeni kr3 + renk). Kalin yuvarlak kenar, derin pano, iri pati, kavanozda parlama seridi.
  blok3b.js LISTE'ye govde rengi + `cila` (clearcoat) ile baglandi. Eski cizim: `?b2=0`. Sergi: `?pilot=989`.

## v9.7 (19 Kas 2026) — yastik kenarli tugla, studyo yansimasi
- Tugla (cubuk1-4): dis kenar r 0.2, pano kenari ve tabani yuvarlatildi (yeni_bloklar.py `yastik_kenar`), pati biraz kucuk ve alcak. Eski model: `yeni_bloklar.py -- --eski cubuk3`. GLB ?v=4.
- Cilali yeni set: studyo ortam yansimasi SENV (oyun.js), ior 1.6, yansima carpani 1.2 (`?ior=`, `?parlaG=` ile denenir). Kavanozda gri yansima azaldi, kendi rengiyle hafif isik (sari hardal degil). Mor biraz acik (#9842f0).
- Kapatma: `?parla=0` (eski yansima ve renkler).

## v9.8 (19 Kas 2026) — kavanozda genis parlama bandi, cilali patili kup
- Kavanoz (kj, kvU) ve dalgali silindir: karanlik studyo yansimasi JENV (siyah zemin + genis isik kutulari): renk solmadan referanstaki gibi genis parlama bandi. `?bantG=` (guc, 3), `?bantR=` (puruz, 0.16); kapatma `?bant=0`.
- Ana oyundaki patili kup (oyK, oyM...): cilali (clearcoat). Kapatma `?kupcila=0`.

## v9.9 (19 Kas 2026) — tas, buz, sandik da yeni tarzda
- yeni_bloklar.py: yastik_govde (tugla ile ayni yastik kenar), tas_y (tas1-4: koyu harc cukurunda iri acik taslar), buz_y (buz1, buz3: isik seritleri), sandik_y (govde renkli cerceve ve X, krem pano). -> model/blok2.
- blok3b.js: ksTas/2/3/4, ksBuz/ksBuz3, ksSandik/K/M bu modeller (ana oyunda da: oyun.js ESLE'den ksTas, ksBuz cikarildi). Kapatma: `?b2=0` ya da `?parla=0`.
- Sergi: `?pilot=990`.

## v10.0 (19 Kas 2026) — Adem: yayvan isik, kati buz, sivi saçan kavanoz, sade top
- Yayvan isik: kavanoz/silindir yansima kutulari genis ve yumusak kenarli, puruz 0.26, guc 4 (`?yayvan=0` eski).
- Buz (ses 'buz'): ilk sert vurusta catlar (kucuk kup kirintilar + kiragi), kirilmaz; ancak SONRAKI atista ya da yere dusunce kirilir. Kirilinca iri kati kup parcalar (kristal/parilti yok). `?buz2=0` eski.
- Yeni kavanozlar (kj, kvU) kirilinca icindeki renkli sivi damla damla sacilir (eskiden yalniz sise); cam kiriklari havada kisa surede kaybolur.
- Top izi seyrek ve ince, carpinca biter; namlu dumani 3 parca (`?iz=eski`).

## v10.1 (19 Kas 2026) — Adem: sivi az dagilsin, ince damla, havada kaybolsun
- Kavanoz (kj, kvU, sise) kirilinca: govde parcasi/renkli kirinti yok; dar bulutta ~30 kucuk damla (0.5-0.85 sn), havada kuculup kaybolur; yere degen damla kucuk leke birakir, 0.9 sn'de silinir. Cam kiriklari 0.35-0.55 sn. Eski: `?sivi=eski`.

## v10.2 (19 Kas 2026) — fici yeni tarzda, sutun/direk/kalas cilali
- yeni_bloklar.py fici_y -> model/blok2/fici.glb: tombul govde (turun rengi), uclarda ve ortada altin kusak, krem kapakta pati. ksFici (turuncu), ksFiciK (kirmizi); ana oyunda da (ESLE'den cikarildi).
- ksSutun, ksMorSutun, ksDirek, ksKalas1-3: cilali malzeme.
- Hata: deneme bolumlerinde (pilot) yeni modeller iki kez cilalaniyordu (cilaMat): soluk gorunuyordu. Artik bir kez.
- Sergi `?pilot=990` fici, sutun, kalas eklendi.

## v10.3 (19 Kas 2026) — Adem: damla biraz iri ve cok, yildiz/kombo/rakam yok, buyuk kavanoz
- Sivi: 44 damla (buyuk kavanozda 2.2 kat, uzunda 1.4 kat), boy 0.55-1.05, omur 0.6-1.0 sn.
- Kirilinca yildiz (VR.yildizlar, malzemeFx parilti), dusen blok '+n' yazisi, kombo sayaci ve 'Super/Harika' yazilari kapali. Eski: `?sade=0`.
- Yeni turler: kvL+renk (1x3 uzun kavanoz, model blok2/kavanoz3), kvB+renk (2x2x2 buyuk kavanoz, blok2/kavanozB; yeni_bloklar.py kavanoz(ad, hS, olc)).
- Yeni yapi `?pilot=968` Dev Kavanozlar.

## v10.4 (19 Kas 2026) — saydam cam kiriklari
- Kavanoz kirilinca sivi ile birlikte 14 (buyuk kavanozda daha cok) saydam, isikta parlayan cam kirigi; her dorduncusu kavanoz renginde hafif renkli. 0.6-0.95 sn sonra kaybolur.

## v10.5 (19 Kas 2026) — Adem: daha cok sacilan, yakut/elmas yok, TNT/direk/kalas yeni tarz, sade vurus, akici kazanma karti
- Sivi damlasi 62 (buyuk kavanozda 2.2 kat), cam kirigi 22.
- Vurusta sari halka yok: kucuk kisa beyaz parlama + bum sesi (`?sade=0` eski).
- Yakut, elmas, karo: ana oyunda zaten patili kupe ceviriliyordu; artik deneme bolumlerinde de (pilot.js MUC). `?mucevher=1` geri getirir.
- yeni_bloklar.py: tnt_y (kirmizi yastik govde, krem pano, iri siyah bomba, fitil, kivilcim), direk_y (1x2, iki krem kusak, pati), kalas_y (0.5 yuksek, krem damar). ksTNT, ksDirek, ksKalas1-3 bunlar.
- Kazanma karti (kazan2.js k2-akici): beyaz flas ve sarsinti yok, yildizlar yerinde yaylanir, yazi/panel kayarak gelir, altin sayaci 0.9 sn yumusak, DEVAM 1.8 sn; dokununca sona atlar; yildizlar ekrana sigar. Eski: `?kazan=eski`.

## v10.6 (19 Kas 2026) — Adem: kazanma girisi daha havali ve sesli
- Yukselen ugultu (0.7 sn), her yildizda davul + halka, baslik ekrana carpar (2.6x -> 1, ezilip esner), carpista zil + davul + guclu fanfar (bas notalar), renkli (pembe-sari) parlama, tek sarsinti, iki alt koseden konfeti topu, 3 havai fisek. Ses: `?kazanses=0` eski yumusak.

## v10.7 (19 Kas 2026) — karisik yapilar ana oyunda, yeni kaybetme karti
- yapi/pilot/karma_kaynak.py: 7 kalip (duvar, tapinak, basamak, dev kavanoz, kale, raf, ikiz kule) x renk/boy = 105 yapi -> karma.json (pilot 3000-3104). Hepsi bot ile olculdu (bot.json), dengeli (kendiliginden dusen 0), hepsi kazanilir; bot atisi 3-31.
- sira.py: karisik yapilar (karma + elle 960-968; 962 ve 966 cok zor diye disarida) kolaydan zora, ayni kalip art arda gelmez; yer: 7, 13, 19 ve 26'dan sonra her dunyanin 3. ve 8. bolumu (son: 553). Sekil bolumleri (x6) degismedi.
- Kaybetme karti (merkez.js kaybet, kaybet2.css): Foxi, 'Neredeyse!', kalan blok rozeti, buyuk '+3 Top' teklifi (8 sn geri sayim halkasi), kucuk 'Tekrar Dene'. Eski: `?kaybet=eski`.

## v10.8 (19 Kas 2026) — kaybetme karti yazilari, uzgun Foxi yeri
- Baslik ('NEREDEYSE!' / 'TOPLAR BİTTİ!'), '+3 TOP' ve 'TEKRAR DENE' kazanma kartindaki 3B SVG yazi (kazan2.js yazi) ile; goz yasi kaldirildi, avatar basi egik.
- Uzgun Foxi cizimi: karakter/tilki_uzgun.webp dosyasi eklenince kendiliginden kullanilir (kare, yuz ortada).

## v10.9 (19 Kas 2026) — uzgun Foxi (Adem'in Gemini cizimleri)
- karakter/tilki_uzgun_anim.webp: Adem'in hareketli GIF'i (30 kare) yesil zemin ayiklanip 15 karelik saydam hareketli WebP (178x260); kaybetme kartinin ustunde ayakta.
- karakter/tilki_uzgun.webp: buyuk resimden bas portresi (256x256, saydam); hareketli dosya yuklenmezse yuvarlak cercevede.

## v10.10 (19 Kas 2026) — yesil zemin temiz, sevinen Foxi kazanma kartinda
- Yesil zemin yeni ayiklayici (yapi/uretici/yesil_ayikla.py): yesillik orani (koyu golge de silinir), koyu kiyafette yuksek esik, figur icindeki GIF titresim noktalari komsu renkle dolar, tek tuk kirinti kirpmaya girmez.
- karakter/tilki_sevinc_anim.webp (Adem'in sevinc GIF'i): kazanma kartinda panelin sol ustunde ayakta, panelle ziplayarak gelir (yuvarlak avatar yerine).

## v10.11 (19 Kas 2026) — gostergeler tek tarz (hud2.css)
- Oyun ici: Top sayaci, Yapi/Kup rozeti, ilerleme cubugu, duraklat, yardimci dugmeler, ipucu: mor govde, altin cerceve, kahverengi dis cizgi, 3B altin rakam (kartlarla ayni dil).
- Ana sayfa: --lac1/2/3 mora cevrildi (Kaptan rozeti, ayar), yan simgeler, etiketler, altin/yildiz sayaclari ayni.
- Eski gorunum: `?hud=eski`.

## v10.12 (20 Kas 2026) — 3B kabarik logo (logo2.js)
- Ana sayfa logosu SVG: mor govdeli altin kenarli kahve dis cizgili iki katli rozet, tepede patili top; turuncu-altin FOXI, krem SMASH; harfler tek tek egik ve zipli, altin+kahve dis kenar, 3B yan yuz, ust parlama. Eski: `?logo=eski`.

## v10.13 (20 Kas 2026) — gercek 3B logo (Blender)
- yapi/uretici/blender/logo3d.py: FOXI / SMASH harfleri ayri ayri 3B yazi nesnesi (Baloo 800, kalin pah = sisirilmis kenar, parlak vernik), egik ve zipli; iki satiri saran tek parca kabarik rozet (koyu mor dis, altin cerceve, mor ic; boolean birlesim), patili top; Cycles ile isik, saydam zemin -> yapi/ikon/logo3d.webp (640 genis, 28 KB).
- Font: yazi/baloo_lat.woff2 -> fontTools instancer wght=800 -> TTF (betik bunu arguman olarak alir).
- Eski logo: `?logo=eski`. (logo2.js SVG denemesi yedek olarak duruyor.)

## v10.14 (20 Kas 2026) — Adem'in Gemini logosu
- yapi/ikon/logo_foxi.webp: Adem'in yesil zeminli Gemini logosu (Foxi harflere tutunuyor, ahsap FOXI, tas SMASH, gulle ve kirintilar); yesil zemin oran anahtariyla ayiklandi (delik doldurma YOK: O'nun ici ve harf aralari saydam), 720 genis, 106 KB. Ana sayfada 250 px (kisa ekranda 210).
- Blender logosu (ikon/logo3d.webp, logo3d.py) yedek olarak duruyor. Eski logo: `?logo=eski`.

## v10.15 (20 Kas 2026) — acilis hizi, 1. adim
- Olcum (yerel, masaustu): ana menuye kadar 12.5 MB / cubuk 5.2 sn -> 10.8 MB / 3.3 sn.
- top_mermisi.glb 661->383 KB, kup_metal.glb 734->504 KB, parcali/kup_metal_parcali.glb 683->454 KB: yalniz dokular 1024 -> 384/512 (geometri ve meshopt aynen). Arac: yapi/uretici/glb_doku_kucult.py.
- Insa sekmesinin gemi resimleri yalniz sekme acilinca iner; sevinen/uzgun Foxi animasyonlari acilistan 7 sn sonra iner.

## v10.16 (20 Kas 2026) — ogretici ilk 5 bolum + rehber el
- yapi/pilot/ogretici_kaynak.py -> ogretici.json (pilot 2900-2904), sira.py ile ana oyunun 1-5. bolumu:
  1 Ilk Atis (dar yuksek kavanoz kulesi; ilk atista 19/22), 2 Ikiz Kavanoz Kuleleri (24/42), 3 TNT Koprusu (27/39),
  4 Buz Kalesi (buz once catlar, sonra kirilir; 13/18), 5 Buyuk Yikim (50/60, ilk 'zor'). Bot atisi: 2, 5, 9, 5, 15.
- Denenip birakilanlar: genis cift sira kavanoz duvari (2/40) ve kavanoz piramidi (1/28): tatmin etmiyordu.
- Rehber (oyun.js rehberKur/rehberCiz): pilot verisindeki 'ipucu' parcasinin ustunde parlayan halka, dokunan el, mor-altin yazi balonu; ilk atista kaybolur (buzda ikinci atisa kadar, 'Bir daha!'). Bolum basina bir kez (SV.reh). Kapatma: `?rehber=0`.

## v10.17 (20 Kas 2026) — Seker Diyari cikti
- YSIRA 8 dunya (seker yok); eski 9'lu sira: `?seker=1`. Yeni genis manzarali fonlar Adem'in Gemini cizimleriyle gelecek (istemler sohbette).

## v10.18 (20 Kas 2026) — ilk iki yeni genis fon
- fon/yeni/tropik.webp (1. dunya 'Tropik Ada', kum, platform kumda cy 0.80, su sinir sy 0.75) ve fon/yeni/liman.webp (2. dunya 'Korsan Limani', her yer su). Adem'in cizimleri (CapCut AI); ust %6 kirpildi (filigran), 768:1376 oranina, 1080 genis.
- Sira: tropik, liman, col, buz, gunbatimi, volkan, gece, magara. Eski: `?fon2=0`.

## v10.19 (20 Kas 2026) — 10 dunya, hepsi yeni genis fon
- Sira: tropik, liman, col2 (Altin Col), kar2 (Karli Dag Golu), gunbatimi2, liman2 (Korsan Korfezi), volkan2, kanyon (Kizil Kanyon), orman (Selaleli Orman, zemin cim), gece2 (Ay Isigi Koyu).
- Hepsi Adem'in cizimleri (CapCut AI, ust %6 kirpildi), 1080 genis webp. cy/sy oyun ekraninda kontrol edildi. Eski: `?fon2=0`.

## v10.20 (20 Kas 2026) — 11. dunya Kale Cayiri
- fon/yeni/cayir.webp: cicekli cayir, uzakta kale, deniz ve korsan gemisi (zemin cim, cy 0.85). Adem'in ikinci cizimi (harita tabelasi) kullanilmadi: tabelada anlamsiz yazi, duz boyama tarzi.

## v10.21 (20 Kas 2026) — fon hizalama (Adem: 'platformu rastgele yerlestiriyorsun')
- Sorun: YER kamerasi (v9.4) platformun on kenarini ekranda sabit yere koyuyor; fon resmi bagimsizdi, cy hic kullanilmiyordu -> ayak resimde rastgele yere denk geliyordu (yamac, havuz).
- oyun.js fonHizala: fit() sonunda ayagin (PLS[0], GY) ekrandaki yeri bulunur; fon resmi en az gereken kadar buyutulur ve kaydirilir ki resimdeki (0.5, cy) noktasi ayagin altina gelsin (bosluk kalmaz). fonPx (isilti, su cizgisi ZW) ayni donusumu kullanir. Kapatma: `?fonhiza=0`.
- cy degerleri izgarayla olculdu: ayak, ortada, duz zeminin ekrandaki ayak yuksekligine (~%70) en yakin noktasinda (az buyutme, manzara korunur). Gun Batimi ve Orman: kum/cimen cok onde oldugundan platform kiyidaki sig suda (zem su).

## v10.22 (20 Kas 2026) — zemin tabani (Adem: 'platform fizige aykiri, suyun ustunde/yamacta duruyor')
- oyun.js zeminTaban (temaKur): yeni fonlarda platformun altina zemine uygun 3B taban.
  - Suda (liman, liman2, gunbatimi2, orman, gece2): iskele kaziklari: 6 kalin ahsap kazik deniz dibine iner, halat sargilari, ust uclari kirislerle bagli, suya girdigi yerde kopuk.
  - Karada: alcak, kenari alfa ile resme karisan tumsek; rengi fon resminden (ayagin bastigi nokta) okunur; cevrede birkac tas; golge almaz.
- Denenip birakilan: sudan cikan yosunlu kaya adacigi (yapay ve kaba duruyordu).
- Kapatma: `?taban=0`.

## v10.23 (20 Kas 2026) — Adem'in telefon geri bildirimi: mesafe, yazi, su/kara, ucurum, yeni platformlar
- Kamera mesafesi (Adem: 'bazi bolumlerde platform cok yakin, ideal 1196'): YER kamerasi yapi kucukse cok yaklasiyordu (1191: 10 birim, 1196: 22 birim). fit() artik hicbir bolumde 1196'daki uzakliktan (10.6 / thx, 390x844'te ~22) yakina gelmez; kup her bolumde ekranda ayni boyda. Yapi sigmazsa yine geri cekilir. Eski: `?kam=0`.
- Bolum basi bandi (bolum no, dunya, ad, 'ZOR BOLUM' / tur yazisi) gosterilmiyor. Eski: `?yazi=1`.
- Zemin haritasi (Adem: 'her yer su efekti, karaya dusen suya batiyor'): ZHARITA'da her fon icin resim oranlarinda cokgen bolgeler: su (batar), cim (iskele, kaya, sert zemin: kirilir), bos (ucurum). Haritada olmayan yer fonun zemini (zb/zem). zoneAt: zemindeki nokta -> ekran (kamera sarsintisiz) -> fon resmi (BGT) -> bolge. 'Her yer su' (hep) ve su cizgisi (sy/ZW) hesabi yerine gecti. Eski: `?harita=0`. Dogrulama: `?olc` ile window.__zon / __px / __fon (test betigi zemin noktalarini renkli cizer).
- Ucurum (Adem: 'ucurumdan dusen kup havada kalip yok oluyor'): iki hata vardi. (1) Dusen kup 1.4 sn sonra havadayken kuculup siliniyordu: artik yalniz bir yerde takili kalirsa (yavas) ya da 6 sn'den uzun surerse. (2) 'bos' bolgeye gelen kup (bosaDus) fizikten cikar, yercekimiyle dusmeye devam eder; yerin altini gizleyen duzlemden once cizilir ve resimdeki ucurum kenari cizgisinde (ekranda asagi dogru ilk bos olmayan nokta) kameradan gecen bir kesme duzlemiyle kesilir: kenarin arkasina dusup kaybolur. Kanyon: platformun arkasi kanyon (bos). Parca ve top da bosa duserse dusmeye devam eder.
- Yeni platformlar (Adem: 'tekrardan yapilsin, oyuna uygun renk/gorunum, yuvarlak kare dikdortgen'): oyunun mor-altin tarzi. Krem tas karolu ust yuz, parlak mor yanlar (yuvarlatilmis kenar), ust kenarda altin serit, yanlarda altin percinler, altta koyu mor kusak. Sekil: ada bolumlerinde verideki gercek sekil (disk, cokgen, kare); eski bolumlerde bolume gore yuvarlatilmis dikdortgen (kucuk ya da yari yuvarlak uclu) veya sekizgen, donen bolumde daire. Fizik tablasi gorunusle ayni prizmaya cevrilir (pFizik); kose kesigi/yuvarlatma kuplerin disindaki kenar payinda kalir, daire butun kupleri kapsar. Kod icinde uretildi (her bolumde olcu ve sekil degistigi icin Blender modeli yerine): ptUst2, pTabla, pSekil.
- Yeni ayaklar (Adem: 'zemine gercek otursun'): mor sutun, altin bilezikler ve baslik, genis basamakli taban zemine 0.12 gomulu (yerin alti gizli), altinda koyu yumusak temas golgesi; kumda/karda tabanin cevresinde resimle ayni renkte itilmis zemin seti; suda taban gorunmez, sutun suya girer + kopuk halkasi. Zemin turu ayagin bastigi noktadan zemin haritasiyla. Genis platformda (r > 5.2) iki sutun. Asansorlu platformda calisan piston kalir (govdesi mor), denge tahtasi eski. Eski gorunum: `?plat=eski`.

## v10.24 (20 Kas 2026) — ayak dibindeki hilal
- Adem: 'ayak dibinde ay seklinde isik'. Kumda/karda tabanin cevresindeki zemin seti halkasinin on yarisi isik alip acik renkli hilal gibi parliyordu. Halka kapatildi; taban gomulu + temas golgesi kaldi. Eski: `?set=1`.

## v10.25 (20 Kas 2026) — bolum baslamiyordu (hata duzeltme)
- Adem: 'oyun baslamiyor, ana sayfaya atiyor'. Bir bolum bitip yenisi kurulurken eski platform temizlenir (temaSil -> ptAt). Yeni ayagin userData'sindaki 'kopuk' listesi, ptAt'in su kopugu isaretiyle (userData.kopuk) karisti; malzemesi olmayan gruba dispose cagrildi, start() hata verdi, kart kapandi ama oyun acilmadi. Liste adi kpk oldu; ptAt yalniz gercek isarette (=== 1, malzemeli) calisir. Test: ana sayfa -> 1212 oyna -> kazan -> 1213 oyna (Playwright) hatasiz.

## v10.26 (20 Kas 2026) — blender-skills denemesi: donen pervane engeli
- Adem: arjun988/blender-skills ile bir deneme. Paket canli Blender penceresi + BlenderMCP eklentisi istiyor (bulut oturumunda yok); ilkeleri (prop-artist, asset-optimization, export-pipeline) bizim ekransiz bpy hattimizda uygulandi.
- Secilen zayif parca: donen pervane (kurek) engeli, duz kutulardan (kahverengi kol, kirmizi uc, sari silindir).
- uretici/blender/engel_pervane.py -> model/engel/pervane_kol.glb (iki tahta serit + oluk, iki altin kelepce + percin; x=0..1, oyunda boyu olceklenir), pervane_uc.glb (kirmizi yuvarlak kurek ucu, krem serit; olceklenmez), pervane_gobek.glb (basamakli altin gobek, 6 civata, kirmizi kubbe). Kose rengi x Cycles ile pisirilmis isik (pilot_bloklar.py hatti). Toplam ~170 KB.
- oyun.js engKur kurek: modeller yuklendiyse yeni gorunus, degilse eski kutular. Fizik kutulari ayni. Eski: `?pervane=eski`.

## v10.27 (20 Kas 2026) — Adem'in 6 ekran goruntulu geri bildirimi
- Kup/platform: kayan/asansor platform kupu baslangic platformuna (c.pi) gore tasiyordu; baska platforma dusen kup eski platformla kayiyordu. piDuzelt: hareketli platformlu bolumde her karede kupun gercekten ustunde durdugu platform bulunur. Eski: `?pi=eski`.
- 1216: denge tahtali bolumde eski iskele kaziklari (zeminTaban) calisiyordu; kirisleri ince tablanin ustune cikiyordu. Yeni platformda zeminTaban hic yok; denge ayagi mor-altin.
- Hazine avi bolumu (sari hedef kareleri) kapali: o bolumler normal (egri.js). Eski: `?hazine=1`.
- Ada bolumlerinde kamera 22 derece yukaridan bakiyordu (cok ust yuzey): ana oyunda en cok 13 derece (pilot.js). Eski: `?egim=eski`.
- Kale Cayiri fonu (yokuslu) dunya sirasindan cikti (10 dunya; dunyalar kaydi). Eski: `?cayir=1`.
- Ana sayfa Foxi'si ilk acilista genis: tuval yalniz pencere boyu degisince boyutlaniyordu; ResizeObserver eklendi (merkez.js).
- Engeller (`?engel2=eski` hepsini eski hale getirir):
  - Kayan duvar Blender modeli (engel_pervane.py -- duvar -> model/engel/duvar.glb): uc tahta, demir cerceve ve kusak, percin, kirmizi direk, altin baslik.
  - Sallanan kalkan: asilma noktasi ekranin ust kenarinin disinda (ekranUst), cubuk yerine zincir; kalkanda altin percin halkasi.
  - Anahtarli kapi: gercek asma kilit (govde + U kanca). Anahtar ucarken vuus, girince ve ceyrek tur donerken mandal tikirtisi, acilinca klonk; kanca firlar, kilit anahtarla yere duser (kuculmez); kanatlar gicirdayarak kayar, dipten toz, sonda gum.
  - Yeni engeller: capa (zincirle ekran ustunden sallanan gemi capasi), surgu (iki kanat ortada birlesip ayrilir), yukari (inip kalkan duvar). Deneme: `?engel=<tur>`.
  - Siklik: kayitli bolumde engel yoksa 12. bolumden sonra bolume gore ~%45 olasilikla bir engel (anahtar, denge, cok platform haric); eklenen engel basina +1 top. Uretilen bolumlerde olasilik 0.6+0.3d, havuzda yeni engeller.

## v10.28 (20 Kas 2026) — yeni ana sayfa resmi
- Adem'in koy resmi (gemi, kuru kafa kayasi, gozetleme kulesi, hazine) ana sayfa fonu: fon/ana_ada2.webp (1080x1920, 395 KB). Foxi ortadaki cimende. Eski resim fon/ana_ada.webp duruyor (merkez.css .m-bg).

## v10.29 (20 Kas 2026) — ana sayfa videosu
- Adem'in Gemini videosu (ana sayfa resminden, 10 sn, 720x1280, filigran yok): dongu yeri son 1 sn basa karistirilarak (xfade) 9 sn dikissiz donguye cevrildi; ses atildi. fon/ana_ada2.webm (VP9, 875 KB) + .mp4 (H.264, 1.37 MB, faststart).
- merkez.js: .m-bg icinde sessiz, donen video (resim altta, video yuklenene kadar o). Ana sayfa acilinca oynar, kapaninca (oyunda) durur. Eski: `?anavid=0`.
