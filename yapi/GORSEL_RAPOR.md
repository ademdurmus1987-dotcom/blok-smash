# Foxi Smash – Görsel Kalite Raporu (26 Kas 2026)

## A. İnceleme (kod değişikliği yok, yalnız `?olc` ölçüm kancası)

**Render mimarisi**
- Three.js r160 (WebGL2), derleme yok, düz ES modülleri. Fizik cannon.js, çizim her karede `ren.render(scene, cam)` (oyun.js ~4589).
- Işık: HemisphereLight (0.78) + yönlü güneş (3.6, sol-üst-ön, gölge) + arka kenar ışığı (0.9). Stüdyo yansıması (PMREM `SENV`) sahne `environment`.
- Ton eşleme: elle yazılmış PBR Neutral (CustomToneMapping), pozlama 0.92. Renkler kremleşmiyor, iyi.
- Gölge: PCFSoft, 1024 harita, ±14 birim; zemin ve kumda özel yumuşak gölge (13 örnek, Vogel diski). Bloklar gölgeyi **görünmez kutu vekilleriyle** düşürüyor (ucuz, ornek.js `gk`).
- Bloklar: tür başına **tek InstancedMesh** (ornek.js); her blokun kendi Mesh'i görünmez katmanda (fizik ve kırılma için). Görünüm katmanları: blok6.js (kodla boyalı dokulu kutu, varsayılan), blok8.js (Blender Royal seti, `?b8=1`), seker.js (eski boyalı set).
- Platform: plat3.js / plat5.js (turkuaz gövde, tahta güverte, burgulu halat). Top arabası Blender modeli.
- Arka plan: tam ekran resim (fon/yeni/*.webp), zemin haritası (su/kum/çim) yalnız düşme davranışı için.
- VFX: parcacik.js havuzu (1500 parçacık, tek çizim), fx/patlama.js (TNT ateş topu, boya, namlu alevi), sarsıntı (`shake`), titreşim. **Zaten havuzlu ve sınırlı.**
- UI: DOM + CSS (menu3.css, tema.css), WebGL'den bağımsız.
- Çözünürlük: telefonda piksel oranı en çok **2.2** (390x844 ekran → ~860x1860 çizim). Uyarlamalı kalite yok.

**Ölçümler** (bulut, yazılım GPU'su ile; ms değerleri telefon değil, yalnız karşılaştırma içindir)

| Bölüm | Blok | Çizim çağrısı | Üçgen (gölge dahil) eski / Royal | Kare süresi eski / Royal |
|---|---|---|---|---|
| 3 | 50 | 110 | 125k / 147k | 496 / 486 ms |
| 60 | 54 | 131 | 144k / 194k | 656 / 821 ms |
| 300 | 96 | 132 | 132k / 254k | 854 / 1167 ms |
| 1200 | 96 | 120-144 | 140k / 391k | 785 / 1482 ms |

**Görsel kaliteyi ve performansı sınırlayan noktalar**
1. Royal setinde (b8) uzun küpler 5-7 bin üçgen: Boolean ile oyulan pati yüzeyi çok parçaya bölüyor. Kalabalık bölümde üçgen 2,8 katına çıkıyor.
2. Platform ve top arabasındaki 12 halat parçası ~45 bin üçgen ve gölge de düşürüyor; ekranda birkaç piksel.
3. Piksel oranı 2.2 sabit; zayıf Android'de düşürülecek bir yol yok.
4. Bloklar arasında ve platformda temas karartması yok: güneş sol-üst-önden geldiği için ön alt kenarda gölge çizgisi oluşmuyor, bloklar "yapışık plaka" gibi okunuyor.
5. Renkli bloklar kavanozlardan daha mat (Adem'in notu); kavanoz patisi silindirde sıkışıyor.

**Riskli alanlar (dokunulmayacak):** bolum.js, egri.js, pilot/tasarim (2000 bölüm verisi), kale.js/sekil.js (fizik ölçüleri, kırılma), kayıt anahtarları (localStorage), ekonomi.

## B-E. Uygulananlar (v12.67 + v12.68)

**Değişen dosyalar:** blok8.js, blok6.js, blok3b.js, oyun.js (yalnız çizim/performans satırları), plat5.js (1 satır), uretici/blender/royal_set.py, model/royal/*.glb, index.html ve sw.js (sürüm).
Bölüm, fizik, kırılma, ekonomi ve kayıt dosyalarına dokunulmadı (bolum.js, egri.js, kale.js, sekil.js, pilot/, merkez.js, kazan2.js).

| Alan | Değişiklik | Geri dönüş |
|---|---|---|
| Bloklar | Blender Royal seti varsayılan: küp (1-4), kavanoz, sandık, varil. 4 dilim pah, kademeli iç çerçeve, gömülü pati | `?b8=0` |
| Malzeme | Küp: roughness 0.22, coat 0.90 / 0.10, yansıma 0.8 (kavanozla eşit) | — |
| Pati | Oyuk, güneşle pişirildi: üst iç kenar koyu, alt kenar açık | — |
| Kavanoz | Pati kaldırıldı, iki yüzde temiz dikey cam parlaması | — |
| Temas karartması | Her blokun alt %22'si koyulaşır, üst kenar hafif açılır (gölgelendiricide, ek çizim yok). Royal ve blok6 türlerinde | `?temas=0` |
| Üçgen | Royal küpler %35-40 hafifledi (kup4 6.826 → 4.104) | — |
| Gölge | Platform ve top arabası halatları gölge çizmiyor: gölge geçişi 67,8k → 46,2k üçgen | `?halatg=1` |
| Çözünürlük | Uyarlamalı kalite 2.2 → 1.75 → 1.5 → 1.25 (yeni ara kademe), düşürülen değer `bs_dpr` ile saklanır | — |
| Buz | Royal buzu oyunda gri çıktı; buz eski mavi kristal olarak kaldı | `?b8buz=1` (deneme) |

**Değiştirilmeyenler ve nedeni**
- VFX: parçacık havuzu (1500, tek çizim), TNT ateş topu, boya, kıymık, sarsıntı zaten var ve sınırlı. Değiştirilmedi.
- Kamera: 300, 777, 1500, 1999. bölümlerde yapı kesilmeden ve dengeli görünüyor. Değiştirilmedi.
- Arayüz ve platform: zaten hacimli ve parlak; işlev riski alınmadı.

## F. Test

- Bölüm dizilimi: 1, 3, 60, 300, 1200, 1999. bölümlerde blok sayısı ve konumları eski ayarla **birebir aynı** (28, 50, 54, 96, 96, 76 blok).
- Oynanış (bölüm 3): duraklat menüsü, 13 atış, sandık kırılması, parçacıklar; sayfa hatası yok.
- Kayıt: kayıt kodu değişmedi; yalnız ayrı `bs_dpr` anahtarı eklendi.
- Ölçüm (bulut yazılım GPU'su, telefon değil):

| Bölüm | Üçgen önce (b8 kapalı) | Üçgen sonra | Çizim çağrısı |
|---|---|---|---|
| 3 | 125k | 147k | 110 |
| 60 | 144k | 178k | 131 |
| 1200 | 140k | 282-310k | 120-145 |

**Test edilemeyenler:** gerçek telefonda FPS, ısınma ve pil; bölüm tamamlama ve kazanma ekranının sonuna kadar oynanması (ağır fizikle 13 atışta bitmedi); güçlendirmelerin tek tek kullanımı.

**Kalan sorunlar**
1. Kalabalık bölümlerde üçgen hâlâ yaklaşık 2 kat. Telefonda takılma olursa arka yüz patileri kaldırılabilir (döner platformda arka yüz görünür, o yüzden şimdilik duruyor).
2. Royal buzu gri çıkıyor (doku mavi; nedeni ışık ve yansıma karışımı, ayrıca incelenmeli).
3. Taş, TNT, yıldız, kalas, direk henüz Royal setinde değil (blok6 parlak plastik + temas karartması).

---
# v12.69 – Royal Smash son iyileştirme (A–G planı, Adem onayı 26 Kas)

**Yedek:** GitHub'da `yedek-v12.68` dalı (değişiklik öncesi hali). Geri dönmek için bu dal main'e alınabilir.

## Değişen dosyalar
blok8.js, blok6.js, blok3b.js, ornek.js, plat5.js, oyun.js (yalnız `?olc` ölçüm satırları ve sürüm numaraları), uretici/blender/royal_set.py, uretici/blender/ayak_halat_hafif.py (yeni), model/royal/*.glb (11 yeni model), model/plat5/ayak2.glb (yeni), index.html, sw.js.
**Dokunulmayanlar:** bölüm verisi ve üretimi (bolum.js, egri.js, pilot/), fizik ve kırılma (kale.js, sekil.js, oyun.js fizik satırları), atış, ekonomi, güçlendirmeler, kayıt.

## Yapılanlar
| Madde | Ne yapıldı | Geri dönüş |
|---|---|---|
| E Buz | Gri çıkmasının nedeni bulundu: ornek.js tüm blok malzemelerine aynı gölgelendirici anahtarını veriyordu, bu yüzden buz başka bir malzemenin programıyla çiziliyordu (aynı hata temas karartmasının yüksekliğini de karıştırıyordu). Anahtar düzeltildi, temas yüksekliği uniform oldu. Buz kristal blokla aynı dilde: ton eşlemesiz, içten hafif ışık. Royal buz artık varsayılan. | `?b8buz=0` |
| A Uzun bloklar | 2'li blokta ortada 1 büyük pati; 3–4'lü blokta ortada büyük, uçlarda iki küçük pati. Üçgen yarıya indi. | yedek dal |
| B Açık renk | Krem ve beyaz bloklarda pati karamel tonunda; krem üstüne krem kaybolmuyor. | — |
| C Yeni modeller | Taş (1–4, boyalı dokulu, oyma halka), TNT (kabarık etiket ve yazı), yıldız (kabarık 3B yıldız), kalas (1–3) ve direk (ahşap damar + metal bant ve perçin), kırmızı varil, mor/kırmızı sandık. Ölçü, bugünkü çizimle aynı kutuya oturtuldu. | `?b8yeni=0` |
| D Metal | Varil çemberi, bant ve perçinler gölgelendiricide metal (yansıma, düşük pürüz, açık gri). | `?metal=0` |
| F Derinlik | Temas karartmasına yan kenarda ince birleşim çizgisi eklendi (yan yana bloklar ayrışıyor, kirli durmuyor). | `?fuga=0`, `?temas=0` |
| G Performans | Görünmeyen (önünde blok olan) bloklar sade kutuyla çiziliyor (LOD), platform halatı 45k → 22k, ayak halatları 46k → 18k üçgen. InstancedMesh, gölge vekilleri ve uyarlamalı DPR aynı. | `?lod=0`, `?halat=eski` |

## Ölçümler (bulut, yazılım GPU'su; telefon değil, yalnız karşılaştırma)
| Bölüm | Blok dizilimi | Üçgen önce → sonra | Çizim çağrısı | Kare süresi (ms) | Sayfa hatası |
|---|---|---|---|---|---|
| 3 | **aynı** (50) | 146.514 → 99.592 | 105 → 106 | 437 → 364 | yok |
| 60 | **aynı** (54) | 177.466 → 126.202 | 127 → 138 | 838 → 672 | yok |
| 300 | **aynı** (96) | 203.808 → 148.990 | 133 → 146 | 1191 → 973 | yok |
| 1200 | **aynı** (96) | 309.652 → **236.286** | 145 → 149 | 1436 → 1334 | yok |
| 1999 | **aynı** (76) | 313.936 → 187.186 | 109 → 137 | 1397 → 1019 | yok |

**220 bin hedefi bölüm 1200'de TUTMADI (236 bin, %7 fazla).** Kalan yük çoğunlukla uzun pembe/gri blokların ön yüzündeki gömülü patiler ve köşe pahları. Daha da düşürmek için pati ve pah kalitesini azaltmak gerekiyordu; "görsel kaliteyi gereksiz düşürme" kuralı gereği yapılmadı. Diğer dört bölüm 220 binin altında.
Çizim çağrısı 1–28 arttı (yeni türler kendi InstancedMesh'iyle çiziliyor).

## Test
- Blok sayısı ve başlangıç konumları 5 bölümde önce/sonra birebir aynı.
- Bölüm 60'ta 14 atışlık oynanış: kavanoz, sandık kırılması, TNT, parçacıklar çalıştı, sayfa hatası yok. Fizik kodu değişmedi.
- Bütün Royal modeller yüklendi (ağ istekleri kontrol edildi).

**Test edilemeyenler:** gerçek Android cihazda FPS, ısınma, pil (mobil performans için başarı iddiası yok); bölüm sonu ve kazanma ekranı; güçlendirmelerin tek tek kullanımı; döner platformlu bölümlerde arka yüz görünümü.

## Kalan sorunlar
1. Bölüm 1200 üçgen hedefi %7 aşıldı (yukarıda).
2. Kemer ve sütun hâlâ blok6 (kod) modelinde.
3. Royal modeller ilk açılışta ~2 MB ek indirme (sonra önbellekte).
