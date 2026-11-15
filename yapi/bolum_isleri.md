# Bölüm işleri (v5.0) — nerede kaldık

Bu dosya, "bölümler birbirine benziyor" işinin durumunu tutar. Yeni oturumda "kaldığın yerden devam et" denince buradan sürdürülür.

## Yapı

- `yapi/bolumler.json`: tek ayar dosyası. `toplam` (oyundaki bölüm sayısı, şu an 2000), `el` (elle yapılmış bölüm: 25), `parca` (dosya başına bölüm: 100), `surum` (parça önbellek numarası), `ad` (26..toplam bölüm adları; harita ve ana sayfa için).
- `yapi/bolumler/pNN.json`: hazır bölüm verisi. p00 = 26-100, p01 = 101-200 ... p19 = 1901-2000. Oyun yalnız gereken parçayı indirir, oyun sırasında bölüm üretmez.
- `yapi/uretici/arketip.js`: 19 arketip, zorluk eğrisi, tanıtım takvimi, benzerlik imzası, `bolumUret(L, gecmis, deneme)`.
- `yapi/uretici/dogrula.js` + `dogrula.py`: her bölümü oyunun fiziğiyle test eder (durgunluk + bot), hatalıyı yeni tohumla yeniden üretir, top sayısını belirler, parçaları yazar.
- `yapi/uretici/birlestir.mjs`: parçalardan `bolumler.json` adlarını ve `yapi/uretici/rapor/ozet.md` raporunu çıkarır.

## Bölüm sayısını artırmak (ör. 2000 → 3000)

1. `yapi/bolumler.json` içinde `toplam` değerini değiştir.
2. Repo kökünde `python3 -m http.server 8765` aç, sonra `python3 yapi/uretici/dogrula.py 2001 3000` (yeni parçalar p20..p29 yazılır; önceki parçanın son 10 bölümü geçmiş olarak okunur, kurallar korunur).
3. `node yapi/uretici/birlestir.mjs`, sonra `bolumler.json` `surum` ve `sw.js` CACHE artır.

## Durum (ara kayıt: 15 Kas 2026 14:45, dal `bolum-cesitliligi`)

Bitenler:
- [x] Teşhis: eski üretici 26-1000 imzaları ölçüldü (975 bölümde 582 imza ama yalnız 201 farklı kaba görünüm; her 3. bölüm 8 sabit şablondan; L>100'de zorluk tavan, hep aynı boyutlar; neredeyse hepsi simetrik ve tek platform)
- [x] 19 arketip + üretici (arketip.js) + doğrulayıcı (dogrula.js / dogrula.py) + birlestir.mjs + denge_kontrol.mjs
- [x] Oyun kayıtlı bölümleri okuyor (oyun.js `bolumYukle`, `bvY`), tahterevalli her fonda, köprü platform ayarı, kapılı bölüme +4 top
- [x] "Yeni Mekanik!" kartı, yapı ipucu (ilk karşılaşmada), final sahnesi (final.js/final.css), haritada Hazine Adası (merkez.js)
- [x] sw.js CACHE v47, oyun.js?v=96, merkez.js?v=18, bolum.js?v=5

- [x] Tam doğrulama koşusu bitti: 26-2000 arası 1975 bölüm kayıtlı, hepsi testten geçti (2760 deneme, 775 yeniden üretim; en sık hata: çözülemedi 650+). p00 tanıtım düzeltmesiyle, 1001-1010 sınır düzeltmesiyle yeniden test edildi. Son 5 kuralı ihlali: 0. Rapor: yapi/uretici/rapor/ozet.md
- Not: kayıtlı JSON esastır. arketip.js sonradan değiştiği için aynı tohumla yeniden üretim bugünkü kayıttan farklı çıkabilir; yalnız yeni bölümler (toplam artınca) üretilir.

Sırada:
1. Önce/sonra ekran görüntüleri ve tablolar (1-25, 26-60, 100..1000 her 50, 770-800); imza karşılaştırması
2. `node yapi/uretici/denge_kontrol.mjs` (rapor/denge.md) ve gerekirse top ayarı
3. Normal kipte deneme (kayıt korunuyor mu, 780'den devam), final sahnesi ekran görüntüsü, main'e birleştirme
