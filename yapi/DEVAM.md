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

## v10.37-v10.39 (21 Kas)
- Logo gizli (?sade=0), Foxi altinda golge. Tek fon: Adem'in Seedream plaj resmi `yapi/fon/yeni/plaj.webp` (ana sayfa + butun bolumler). Eski: `?dunya=cok` (10 dunya), `?anafon=eski` (ana sayfa videosu).

## v10.40 (21 Kas): oyuncak plastigi denemesi
- `yapi/uretici/blender/oyuncak_plastik.py` (bpy 5.3): 59 blok modeli -> `yapi/model/oyuncak/` (bevel 0.045x4 aci 30, weighted normal, AO %35 dokuya gomulu, PBR degerleri, WebP). Oyunda yalniz `?oyuncak=1` (blok3b.js OYUNCAK). Fark ince: bloklar zaten yuvarlak ve cilaliydi.

## v10.41 - v10.44 (21-22 Kas)
- v10.41: renkli blok + kavanoz MeshPhysicalMaterial (blok3b.js PARLAK2: puruz 0.14, metal 0.04, cila 1.0/0.08); sahneye scene.environment = SENV; FPS sayaci ayarlardan kalkti (yalniz ?fps=1); 'Dokun ve ates et!' bandi yerine kucuk el (?ipucu=eski). Eski malzeme: ?parlak2=0
- v10.42: renk solmasi: envMapIntensity 1.05, kavanoz transmission 0.18 / puruz 0.10.
- v10.43: alt menu ikonlari konturu temizlenmis 3B (yapi/ikon/*_3b.webp), aktif sekme -6px / 1.12 + altin parlama (?altnav=eski).
- v10.44: oyun hissi 2 (oyun.js mikroSars / sokDalgasi / kiymik; ?his2=0), el ipucu ilk atista kaybolur, 4 sn dokunulmazsa doner; Korsan Pilot 'Yakinda' (?korsan=1 ile acik).
- Arayuz notu (Adem onayi bekliyor): koyu mor kutular plaj fonunda agir; parlak mavi + altin + krem sayi kutulari onerildi.

## v11 (22 Kas 2026): BOYALI SET VARSAYILAN (Adem onayladi); eski gorunum ?yeni=0
- SIRADAKI 2. maddenin (sade kavanoz ve tugla) karsiligi. Model: uretici/blender/seker_set.py -> model/blok3/ (dokusuz; kose renginde ton). Boyama: seker.js (sekerMat: isiksiz, ton eslemesiz, saydamliksiz, ucuz). Baglanti: blok3b.js LISTE, oyun.js ESLE.
- Piksel orani: en cok 2.2 (eski 1.75); yavaslarsa prOlc kendiliginden dusurur. Telefonda isinma denenmedi.
- Kapsam disi: oyA (Foxi yuzlu kup), engeller, pl* pilot bloklari, top. kupa1/2/4 (altin cerceve) modelleri kullanilmiyor.

## v11.1 (22 Kas 2026): boyali engeller ve top VARSAYILAN (Adem onayladi); eski ?eng3=0
- uretici/blender/engel_set.py -> model/engel3/; engel3.js (yukleme, kodla kurulan anahtarli kapi ve giyotinin boyanmasi). Fizik ayni. ?engel=kapi (dev kapi, hicbir bolumde yok) eski.

## v11.2 (22 Kas 2026): boyali platform ve ayak, varsayilan; eski ?plat3=0
- plat3.js: tabla dis cizgi boyunca profil supurme (gorunus artik fizik sinirinda; eski tablo pKaydir yonu ters oldugu icin tasiyor ve altin serit gorunmuyordu), ayak parcalari torna. Piston/makas/disli/ray renkleri P3RENK. seker.js sekerDuz: tek renkli boyama.

## v11.3 (22 Kas 2026)
- Kemer (ksKemer) fizigi artik gercek kemer (iki ayak + kiris + kose, oyun.js kemerSekil); top altindan gecer. Eski ?kemer=0.
- Platform renkleri bizim: korsan gemisi guvertesi (tahta, halat, turkuaz, direk ayak). Adem: 'rakibin kopyasi olmasin'. VARSAYILAN turkuaz (Adem secti), eski ?plat3=0, ?prenk=mercan | gece | mor.
- Menu incelemesi (yapilmadi, Adem'in secimine sunuldu): kaybetme karti mor (digerleri ahsap), koyu mor gostergeler, Insa basligi okunmuyor, harita bos, kilitli Foxi yazisi, kazanma ekraninda Foxi yaziyi ortuyor.

## v11.4 (23 Kas 2026): kamera yaklastirma, yalniz ?kam2=1 (Adem onayi bekliyor)
- oyun.js fit() KAM2: yapi (kayan / donen / asansor payi dahil) ekran genisligini doldurur, bir blok en cok ekranin %11.5'i (?kam2b=). Yuksek yapilarda sinir tepe (%15). Pilot cercevesi genis siniri 0.9.
- Test: 60 bolum gecisi + 240 atis sorunsuz. Bir kez sekme coktu (33. bolum, test tarayicisi), yeniden uretilemedi.

## SIRADAKI (Adem 22 Kas, rakip ekranlariyla karsilastirma)
Rakipte yapi ekran genisliginin %80-90'i, blok ~90-100 px; bizde yapi ~%30, blok ~30 px. En buyuk fark bu.
1. Kamera yakinlastirma denemesi: her bolumde yapi ekran genisliginin ~%80'ini doldursun (v10.23 '1196 kurali' ?kam ile denenebilir yapilacak). Mevcut modellerle telefonda karsilastirma.
2. Blender'da rakip dilinde SADE kavanoz ve tugla: genis sol parlama seridi, iki renkli cizgili kapak, gomuk pano + kucuk tac kabartma (v10.35 kalin altin cerceveli deneme begenilmedi).
3. Seedream/fal yalniz tasarim taslagi icin (gokayfem/reference-to-game incelendi: yontem faydali, blok kalitesini dogrudan yukseltmez).
- Bulutta Blender: `pip download bpy` (5.3, py3.13) -> venv; yapi/uretici/blender/oyuncak_plastik.py ornek hat.

## Siradaki isler (eski liste) (Adem'in onayladigi sira)
1. v10.34-v10.35 (butun bloklarda matcap, rakip tarzi kup/kavanoz) denendi; Adem begenmedi, varsayilan v10.33 gorunumu. Denemeler: ?mc2=1, ?kvYesil=1, ?b35=1.
0. Adem'in telefonda v10.23'e geri bildirimi: platform renk/sekil, ayak oturusu, kamera uzakligi, zemin haritasi (yanlis bolge varsa ZHARITA cokgenleri).
2. Fonlara canlilik: suzulen martilar, suda parilti, karli dunyada kar.
3. Dil destegi (yazilari ayri dosyaya, Ingilizce) ve magaza ekran goruntuleri.
4. Acilis ekranindaki kucuk logo ve magaza ikonu icin yeni logo.

## Notlar
- CapCut AI ciktilari filigranli (ust %6 kirpildi); ticari kullanim sartlari Adem'e hatirlatildi.
- Test betikleri (Playwright) oturum gecici klasorundeydi; gerekirse yeniden yazilir: pilot ekran goruntusu (`?pilot=N`), ana bolum (`?test&sekil=1`), bot olcumu (`uretici/pilot_test.js` botEkran).
- Blender (bpy 5.3) gecici sanal ortamdaydi; yeni oturumda gerekirse `python3 -m venv bpyenv && bpyenv/bin/pip install bpy` ile yeniden kurulur (v10.23'te kuruldu ama platformlar olcuye gore kodla uretildigi icin kullanilmadi).
- Test: `python3 -m http.server 8765` (repo kokunde) + Playwright, `yapi/index.html?sv=<bolum>&kart=0` dogrudan bolumu acar (Yeni Blok karti yok). `&olc` ile window.__kam, __zon, __px, __fon, __it (kupleri it), __cs (kup durumlari).
