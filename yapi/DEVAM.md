# Foxi Smash — kaldigimiz yer (20 Kas 2026, v10.22)

Yeni sohbette once bunu ve `CLAUDE.md`'yi oku. Ayrintili surum notlari: `yapi/pilot_isleri.md` (en altta v9.x - v10.x).

## Bu sohbette yapilanlar (ozet)
- Bloklar: Blender ile tek tarz yeni set (`yapi/uretici/blender/yeni_bloklar.py` -> `yapi/model/blok2/`): tugla, kavanoz (kisa/uzun/buyuk), silindir, kiris, tas, buz, sandik, fici, TNT, direk, kalas. Cila + studyo yansimasi.
- Fizik/his: buz iki atista kirilir; kavanoz kirilinca ince sivi damlalari + saydam cam kiriklari; yildiz/kombo/rakam yok; sade vurus parlamasi; top izi ince.
- Kartlar: akici ve sesli kazanma karti (sevinen Foxi), yeni kaybetme karti (uzgun Foxi, +3 top teklifi). Foxi cizimleri: `karakter/tilki_sevinc_anim.webp`, `tilki_uzgun_anim.webp` (yesil zemin ayiklayici: `yapi/uretici/yesil_ayikla.py`).
- Arayuz: gostergeler ve ana sayfa mor-altin tek tarz (`yapi/hud2.css`), Adem'in Gemini logosu (`yapi/ikon/logo_foxi.webp`).
- Bolumler: ogretici 1-5 (`yapi/pilot/ogretici_kaynak.py`, rehber el), 110 karisik yapi (`yapi/pilot/karma_kaynak.py`, bot olcumlu, `sira.py` ile 7/13/19 ve her dunyanin 3. ve 8. bolumu).
- Acilis hizi: dokular kucultuldu (`yapi/uretici/glb_doku_kucult.py`), gemi resimleri ve Foxi animasyonlari ertelendi. Kalite oncelikli: videolar sikistirilmadi.
- Fonlar: 11 dunya, Adem'in genis manzarali cizimleri (`yapi/fon/yeni/`): tropik, liman, col2, kar2, gunbatimi2, liman2, volkan2, kanyon, orman, gece2, cayir. Seker Diyari cikti.
- Fon hizalama (`fonHizala`): fon, platform ayaginin altina olculmus zemin noktasi (cy) gelecek sekilde buyutulup kaydirilir. Zemin tabani (`zeminTaban`): suda iskele kaziklari, karada resimle ayni renkte tumsek.

## Siradaki isler (Adem'in onayladigi sira)
1. Adem'in telefonda fon/taban/iskele gorunumune geri bildirimi (gerekirse cy ve taban ayari).
2. Fonlara canlilik: suzulen martilar, suda parilti, karli dunyada kar.
3. Dil destegi (yazilari ayri dosyaya, Ingilizce) ve magaza ekran goruntuleri.
4. Acilis ekranindaki kucuk logo ve magaza ikonu icin yeni logo.

## Notlar
- CapCut AI ciktilari filigranli (ust %6 kirpildi); ticari kullanim sartlari Adem'e hatirlatildi.
- Test betikleri (Playwright) oturum gecici klasorundeydi; gerekirse yeniden yazilir: pilot ekran goruntusu (`?pilot=N`), ana bolum (`?test&sekil=1`), bot olcumu (`uretici/pilot_test.js` botEkran).
- Blender (bpy 5.3) gecici sanal ortamdaydi; yeni oturumda gerekirse `pip install bpy` ile yeniden kurulur.
