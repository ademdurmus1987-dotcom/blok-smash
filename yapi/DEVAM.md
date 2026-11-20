# Foxi Smash — kaldigimiz yer (21 Kas 2026, v10.34)

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

## v10.23 (ayni gun, ikinci sohbet: Adem'in telefon geri bildirimi)
- Kamera her bolumde 1196 uzakliginda (kucuk yapida yaklasmaz). Bolum basi yazisi kaldirildi.
- Zemin haritasi (oyun.js ZHARITA): her fonda su / sert zemin / ucurum bolgeleri resimden. Karaya dusen kirilir/gomulur, suya dusen batar, ucuruma dusen gercekten duser.
- Dusen kup artik havada kuculup kaybolmuyor (eski 1.4 sn kurali).
- Yeni mor-altin platformlar (yuvarlatilmis dikdortgen, sekizgen, daire, ada bolumlerinde verideki sekil) ve zemine gomulu, golgeli sutun ayaklar. Fizik sekli gorunusle ayni.
- Eski hallere donus: `?kam=0`, `?yazi=1`, `?harita=0`, `?plat=eski`. Ayrinti: `yapi/pilot_isleri.md` v10.23.

## v10.24 - v10.33 (ayni gun, devam; ayrinti yapi/pilot_isleri.md)
- v10.25 hata: bolum bitince yenisi baslamiyordu (temaSil/ptAt 'kopuk' adi) duzeltildi.
- v10.26-27: engeller Blender modeli (pervane, duvar; uretici/blender/engel_pervane.py), zincirli sarkac, gercekci sesli kilitli kapi, yeni engeller (capa, surgu, yukari), daha cok engelli bolum. Hazine avi kapali, kamera egimi en cok 13 derece, Kale Cayiri fonu sirada yok, kup-platform tasima duzeltmesi.
- v10.28-30: ana sayfa yeni resim + Gemini videosu (fon/ana_ada2.*, 9 sn dongu), Foxi arkasindaki isinlar kalkti.
- v10.31-33: YENI KAVANOZLAR + MATCAP. Model: uretici/blender/kavanoz2.py -> model/blok2/kav2_*.glb. Isik: Blender matcap studyosu uretici/blender/matcap.py -> doku/matcap/ (parlakC kavanozda; yari, mat, metal hazir ama kullanilmiyor). Oyun: yapi/blok3b.js mcMat (?mcAd ?mcS ?mcK ?kvRenk ?matcap=0).

## Siradaki isler (Adem'in onayladigi sira)
1. (v10.34 YAPILDI: matcap butun bloklarda, canli yesil kavanoz; eski: ?mc2=0.) Adem'in telefondaki geri bildirimi bekleniyor.
0. Adem'in telefonda v10.23'e geri bildirimi: platform renk/sekil, ayak oturusu, kamera uzakligi, zemin haritasi (yanlis bolge varsa ZHARITA cokgenleri).
2. Fonlara canlilik: suzulen martilar, suda parilti, karli dunyada kar.
3. Dil destegi (yazilari ayri dosyaya, Ingilizce) ve magaza ekran goruntuleri.
4. Acilis ekranindaki kucuk logo ve magaza ikonu icin yeni logo.

## Notlar
- CapCut AI ciktilari filigranli (ust %6 kirpildi); ticari kullanim sartlari Adem'e hatirlatildi.
- Test betikleri (Playwright) oturum gecici klasorundeydi; gerekirse yeniden yazilir: pilot ekran goruntusu (`?pilot=N`), ana bolum (`?test&sekil=1`), bot olcumu (`uretici/pilot_test.js` botEkran).
- Blender (bpy 5.3) gecici sanal ortamdaydi; yeni oturumda gerekirse `python3 -m venv bpyenv && bpyenv/bin/pip install bpy` ile yeniden kurulur (v10.23'te kuruldu ama platformlar olcuye gore kodla uretildigi icin kullanilmadi).
- Test: `python3 -m http.server 8765` (repo kokunde) + Playwright, `yapi/index.html?sv=<bolum>&kart=0` dogrudan bolumu acar (Yeni Blok karti yok). `&olc` ile window.__kam, __zon, __px, __fon, __it (kupleri it), __cs (kup durumlari).
