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

Sürmekte:
- [ ] Tam doğrulama koşusu: iki süreç (26-1000 ve 1001-2000). Ara kayıtta ~1800 bölüm tamamlandı (2309 deneme test edildi, 635'i yeniden üretildi; en sık hata: çözülemedi). Kayıtlı parçalar: p00-p07, p10-p18. Eksik: p08, p09, p19 (yarım).

Sırada:
1. Koşu bitince `p00` (26-100) yeniden: 67. bölüm düzeltmesi (buzP3 tanıtımında yalnız en üstteki 3'lük parça değişir) → `python3 yapi/uretici/dogrula.py 26 100`
2. `p10` (1001-1100) yeniden: iki süreç sınırında son-10 geçmişi için → `python3 yapi/uretici/dogrula.py 1001 1100`
3. `node yapi/uretici/birlestir.mjs` (adlar + rapor/ozet.md), `node yapi/uretici/denge_kontrol.mjs` (rapor/denge.md)
4. Ekran görüntüleri: önce (`?uret=eski`) ve sonra; 1-25, 26-60, 100..1000 her 50, 770-800; önce/sonra tabloları
5. Normal kipte deneme (kayıt korunuyor mu, 780'den devam), final sahnesi ekran görüntüsü (`BSFINAL()`), main'e birleştirme
