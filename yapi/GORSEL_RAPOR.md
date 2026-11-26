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
