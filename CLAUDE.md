# Foxi Smash (blok-smash) — proje kuralları

Sahibi Adem; kod yazmaz, sonuçları telefonda dener. Yanıtlar Türkçe.

## Yapı
- Derleme adımı YOK: Vite, TypeScript, npm paketleri, React kullanılmaz. Oyun düz ES modülleri ve tek sayfa (`yapi/index.html`) olarak GitHub Pages'te çalışır.
- Three.js repoda hazır: `three.module.min.js`, `GLTFLoader.js`, `cannon.min.js` (fizik). Yeni kütüphane gerekiyorsa dosya olarak repoya eklenir, CDN kullanılmaz.
- Oyun: `yapi/oyun.js` · kabuk (ana sayfa, harita, kartlar): `yapi/merkez.js` + `merkez.css` · bölümler: `yapi/bolum.js` · kazanma: `yapi/kazan2.js` · Hazine Adası denemesi (ana sayfadan kaldırıldı, yalnız `?ada=1` ile görünür): `yapi/ada.js` + `ada.css` · korsan tema görünümü: `yapi/tema.css`.
- Blok görünümü (v6.1+): bölümlerde kullanılan bütün bloklar Blender modeli. Üretim: `blender -b --python yapi/uretici/blender/pilot_bloklar.py -- <ad...>` (Blender 5.3 tam yolla: `C:\Program Files\Blender Foundation\Blender 5.3\blender.exe`) → `yapi/model/blok/*.glb` (pilotla ortaklar `yapi/model/pilot/`). Tür ↔ model eşlemesi `yapi/blok3b.js` `LISTE`; ad, fizik, kırılma `kale.js` / `sekil.js`'te aynı kalır. Eski kodla çizilmiş görünüm: adrese `?b3=0`. Ayrıntı: `yapi/sekil_isleri.md` sonu.
- Oyun kamerasında bir blok ~30 piksel: ince ayrıntı ve koyu çerçeve kaybolur; iri, sade kabartma ve açık çerçeve okunur. Yeni modeli her zaman oyun ekranında (390x844) kontrol et.
- Bir dosya değişince onu yükleyen satırdaki `?v=` numarasını artır, `sw.js` içindeki `CACHE` sürümünü bir artır (telefonda eski sürüm takılmasın).

## Skill'ler (`.claude/skills/`)
- `threejs-game-director` ve kardeşleri (gameplay-systems, aaa-graphics-builder, game-ui-designer, debug-profiler, qa-release): bölüm tasarımı, oyun hissi, görsel cila, performans, test.
- `motion-design`: animasyon zamanlaması ve yumuşatma. `ui-ux-pro-max`: arayüz. `balance-check`: zorluk eğrisi ve altın ekonomisi.
- awesome-gamedev-agent-skills'ten: `threejs-scene-setup`, `threejs-materials-lighting`, `threejs-gltf-loading` (Three.js r187 belgelerine göre), `game-feel` (sarsıntı, vuruş donması, esneme), `physics-tuning` (cannon fiziği: titreme, içinden geçme), `performance-optimization`, `audio-design`, `save-systems` (localStorage kayıt sürümü), `create-game-assets` (ikon/doku tutarlılığı). Repodaki Three.js sürümü farklı olabilir; API'yi kullanmadan önce `three.module.min.js` sürümüne bak.
- Bu skill'lerin "yeni Vite/TypeScript projesi kur", "scaffold kopyala", "npm install" adımları bu projede UYGULANMAZ. Mevcut yapıyı değiştirmeden ilkelerini ve kontrol listelerini kullan.
- 3D model, görsel ve ses üreten API skill'leri (Tripo, Gemini, ElevenLabs) kurulu değil; API anahtarı gerektirirler.

## Çalışma şekli
- Mevcut davranışı bozmadan modüler değiştir; eski hâle dönüş yolu bırak.
- Değişiklikten sonra mobil görünümde (390x844) ekran görüntüsü alıp kontrol et.
- Değişiklikleri doğrudan ana dala (main) birleştir; Adem ayrıca onay istemiyor.
