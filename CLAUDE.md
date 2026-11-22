# Foxi Smash (blok-smash) — proje kuralları

Sahibi Adem; kod yazmaz, sonuçları telefonda dener. Yanıtlar Türkçe.

## Yapı
- Derleme adımı YOK: Vite, TypeScript, npm paketleri, React kullanılmaz. Oyun düz ES modülleri ve tek sayfa (`yapi/index.html`) olarak GitHub Pages'te çalışır.
- Three.js repoda hazır: `three.module.min.js`, `GLTFLoader.js`, `cannon.min.js` (fizik). Yeni kütüphane gerekiyorsa dosya olarak repoya eklenir, CDN kullanılmaz.
- Oyun: `yapi/oyun.js` · kabuk (ana sayfa, harita, kartlar): `yapi/merkez.js` + `merkez.css` · bölümler: `yapi/bolum.js` · zorluk eğrisi ve bölüm türleri (v8.0): `yapi/egri.js` (`?egri=0` eski hal) · kazanma: `yapi/kazan2.js` · Hazine Adası denemesi (ana sayfadan kaldırıldı, yalnız `?ada=1` ile görünür): `yapi/ada.js` + `ada.css` · İnşa sekmesi (altınla gemiyi 10 aşamada inşa etme; resimler Adem'in Gemini çizimleri `yapi/insa/gemi01..10.webp`): `yapi/insa.js` + `insa.css` · korsan tema görünümü: `yapi/tema.css`.
- Blok görünümü (v6.1+): bölümlerde kullanılan bütün bloklar Blender modeli. Üretim: `blender -b --python yapi/uretici/blender/pilot_bloklar.py -- <ad...>` (Blender 5.3 tam yolla: `C:\Program Files\Blender Foundation\Blender 5.3\blender.exe`) → `yapi/model/blok/*.glb` (pilotla ortaklar `yapi/model/pilot/`). Tür ↔ model eşlemesi `yapi/blok3b.js` `LISTE`; ad, fizik, kırılma `kale.js` / `sekil.js`'te aynı kalır. Eski kodla çizilmiş görünüm: adrese `?b3=0`. Ayrıntı: `yapi/sekil_isleri.md` sonu.
- Boyalı set (v11+, varsayılan): `yapi/seker.js` (boyama + tür ↔ model) ve `yapi/uretici/blender/seker_set.py` → `yapi/model/blok3/*.glb`. `LISTE`'nin üstüne yazar. Önceki görünüm: `?yeni=0`. Engeller ve top: `yapi/engel3.js` + `yapi/uretici/blender/engel_set.py` → `yapi/model/engel3/`, önceki `?eng3=0`. Platform ve ayak: `yapi/plat3.js` (korsan güvertesi, turkuaz), önceki `?plat3=0`. Foxi küpü ve top arabası önceki `?top3=0`; menüler `yapi/menu3.css`, önceki `?menu3=0`; yakın kamera önceki `?kam2=0`; yumuşak gölge, Yeni Blok kartı ve kazanma ekranı önceki `?kal3=0`. Renk ve şekillerde rakibe benzememe isteği var: mor-altın ve taç kullanma.
- Oyun kamerasında bir blok ~30 piksel: ince ayrıntı ve koyu çerçeve kaybolur; iri, sade kabartma ve açık çerçeve okunur. Yeni modeli her zaman oyun ekranında (390x844) kontrol et.
- Bir dosya değişince onu yükleyen satırdaki `?v=` numarasını artır, `sw.js` içindeki `CACHE` sürümünü bir artır (telefonda eski sürüm takılmasın).

## Skill'ler (`.claude/skills/`)
- `threejs-game-director` ve kardeşleri (gameplay-systems, aaa-graphics-builder, game-ui-designer, debug-profiler, qa-release): bölüm tasarımı, oyun hissi, görsel cila, performans, test.
- `motion-design`: animasyon zamanlaması ve yumuşatma. `ui-ux-pro-max`: arayüz. `balance-check`: zorluk eğrisi ve altın ekonomisi.
- awesome-gamedev-agent-skills'ten: `threejs-scene-setup`, `threejs-materials-lighting`, `threejs-gltf-loading` (Three.js r187 belgelerine göre), `game-feel` (sarsıntı, vuruş donması, esneme), `physics-tuning` (cannon fiziği: titreme, içinden geçme), `performance-optimization`, `audio-design`, `save-systems` (localStorage kayıt sürümü), `create-game-assets` (ikon/doku tutarlılığı). Repodaki Three.js sürümü farklı olabilir; API'yi kullanmadan önce `three.module.min.js` sürümüne bak.
- Bu skill'lerin "yeni Vite/TypeScript projesi kur", "scaffold kopyala", "npm install" adımları bu projede UYGULANMAZ. Mevcut yapıyı değiştirmeden ilkelerini ve kontrol listelerini kullan.
- arjun988/blender-skills (94 skill; giriş `blender-director`; bu proje için en çok `prop-artist`, `stylized-style`, `materials`, `lighting`, `lookdev`, `asset-optimization`, `export-pipeline`): Blender işlerinde kullan. Çıktı her zaman oyun ekranında (390x844) kontrol edilir.
- Canlı Blender (yalnız Adem'in bilgisayarı): BlenderMCP eklentisi Blender 5.3'te kurulu, `blender` MCP sunucusu Claude yerel ayarında (`uvx --python 3.11 blender-mcp`, telemetri kapalı). Blender'ı açıp N > BlenderMCP > Connect (ya da `blender --python C:\Users\elgin\araclar\blender-mcp-indir\baslat.py`). MCP araçları oturum başında yüklenir. Bulut oturumunda yoktur: orada `blender -b --python` hattı.
- 3D model, görsel ve ses üreten API skill'leri (Tripo, Gemini, ElevenLabs) kurulu değil; API anahtarı gerektirirler.

## Çalışma şekli
- Mevcut davranışı bozmadan modüler değiştir; eski hâle dönüş yolu bırak.
- Değişiklikten sonra mobil görünümde (390x844) ekran görüntüsü alıp kontrol et.
- Değişiklikleri doğrudan ana dala (main) birleştir; Adem ayrıca onay istemiyor.
