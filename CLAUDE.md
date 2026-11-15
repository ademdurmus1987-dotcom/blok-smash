# Foxi Smash (blok-smash) — proje kuralları

Sahibi Adem; kod yazmaz, sonuçları telefonda dener. Yanıtlar Türkçe.

## Yapı
- Derleme adımı YOK: Vite, TypeScript, npm paketleri, React kullanılmaz. Oyun düz ES modülleri ve tek sayfa (`yapi/index.html`) olarak GitHub Pages'te çalışır.
- Three.js repoda hazır: `three.module.min.js`, `GLTFLoader.js`, `cannon.min.js` (fizik). Yeni kütüphane gerekiyorsa dosya olarak repoya eklenir, CDN kullanılmaz.
- Oyun: `yapi/oyun.js` · kabuk (ana sayfa, harita, kartlar): `yapi/merkez.js` + `merkez.css` · bölümler: `yapi/bolum.js` · kazanma: `yapi/kazan2.js` · korsan tema görünümü: `yapi/tema.css`.
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
