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
