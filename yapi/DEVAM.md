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

## v11.4 (23 Kas 2026): yakin kamera VARSAYILAN (Adem onayladi), eski ?kam2=0
- oyun.js fit() KAM2: yapi (kayan / donen / asansor payi dahil) ekran genisligini doldurur, bir blok en cok ekranin %11.5'i (?kam2b=). Yuksek yapilarda sinir tepe (%15). Pilot cercevesi genis siniri 0.9.
- Test: 60 bolum gecisi + 240 atis sorunsuz. Bir kez sekme coktu (33. bolum, test tarayicisi), yeniden uretilemedi.

## v11.5 (23 Kas 2026)
- 5'in katlarindaki fon karartmasi (#bg.koyu, 13 Kas kurali) kapali; eski ?koyufon=1. Kemer modelinin ayak tabanlari kapatildi (yan yatinca ici bos gorunuyordu).

## v11.6 (23 Kas 2026): menuler VARSAYILAN (Adem onayladi), eski ?menu3=0
- menu3.css (html.menu3): turkuaz-krem-ahsap gostergeler, ahsap kaybetme karti, ana sayfa etiketleri, alt menu adlari, Insa basligi, kazanma Foxi yeri, harita (numara + susler; merkez.js M3). Kalan mor: top arabasi ayrintilari, acilis videosu ustundeki yazilar.

## v11.7 (23 Kas 2026): Foxi yuzlu kup (oyA) ve top arabasi VARSAYILAN (Adem onayladi), eski ?top3=0
- seker_set.py foxikup -> model/blok3/foxi.glb; seker.js TOP3; kaide.js topModeli2(boya, halat): turkuaz namlu, mercan govde, halat halkalar, ahsap tekerlek.

## v11.8 (23 Kas 2026): top fici / silindir icinde kalmiyor
- oyun.js silindirdenCikar: adim sonunda top kirilmamis silindirin icindeyse girdigi yuze konur, kalan hiz momentumla aktarilir. Eski ?sikis=0. Olcum: fici 4/35 -> 0/35, mor sutun 1/21 -> 0, kavanoz 1/18 -> 0; kirilma sayilari ayni.
- Test tarayicisi oturumda 3 kez coktu (33, 1, 582); tekrar uretilemedi, bosta bellek buyumuyor.

## v11.9 (23 Kas 2026): kumdaki yumusak golge, ahsap Yeni Blok karti, kazanma ekrani (v11.10: sade koyu fon, buyuk yildiz, ortada Foxi; ?kzrenk=deniz|kirmizi|orman); VARSAYILAN, kazanma fonu lacivert (Adem secti), eski ?kal3=0
- oyun.js golgeYumusak (GOLGEZ), menu3.css sonu html.kal3. Kalan kalite isleri: acilis ekrani (mor gece, eski yazi), giyotin ve anahtarli kapi sekli, kart arkasi koyu mor, bomba dugmesi mor, asansor / denge ayaklari.

## v11.11 (23 Kas, deneme, yalniz ?efk=1): guclu vurus efektleri
- `yapi/fx/patlama.js`: TNT ates topu, kavanoz boya patlamasi, namlu alevi (2 puf katmani + 1 InstancedMesh). Pufler `derin:false` (bloklarin onunde), `ton:false` (canli renk).
- Kirilan parcalar 1 sn daha uzun kalir (fragPieces 3.2 sn).
- Herkeste acik: parcacik havuzu 700 -> 1500, havuz dolunca tek tek Sprite acilmaz (kalabalik yikimda 700+ cizim cagrisi gidiyordu).
- Adem onaylarsa: `PAT` kosulunu `Q.get('efk') !== '0'` yap.

## v11.12 (23 Kas, deneme, ?efk=1)
- Adem: 'duman gibi, sivi sekilde yayilsin': kavanozda puf kalkti, yalniz dolu sivi damlalari. 'Namluda cok fazla efekt': kisa tek alev, cakma ve duman yok.

## v11.13 (23 Kas, deneme, ?efk=1)
- Adem: 'efekt namlu ucunda degil namlu ustunde': neden: alev derinlik sinamasiz ciziliyordu ve top yonundeydi. Simdi ayri katman (derinlik sinamali), namlu agzina bagli (TC.namlu z ekseni), geri tepmede onunla gider.

## v11.14 (23 Kas): vurus efektleri varsayilan (Adem onayi), eski ?efk=0

## v12.1 (23 Kas 2026): gercekci vurus, ilk 25 bolum, yeni engel ve hareketler (Adem: 'birini vururken cevresindeki kiriliyor, bolumler cok basit, kiymik platforma giriyor, dikey kup donen platformdan geciyor, ilk 25 sade olsun, tanitim karti, engel ve hareket artsin, zorluk egrisi')
- Fizik (eski: ?fiz=eski): oyuncak kup/cubuk (oy*, uz*, kr3) ilk dogrudan vurusta catlar (catlak izi + kiymik), ikinci vurusta kirilir; top ilk carpismada hizinin %32'sini tutar (eski %45);
  ilk vurustan sonra topun ve kuplerin kirma esigi 2.2-2.4 kat, atis basina carpismayla en cok 1 kirilma (eski 3); vurus yalniz 7 birim cevreyi uyandirir (uzak kose kipirdamaz).
- Kiymiklar: pilot zemin() kayan/asansor/donen platformun o anki yerini kullanir; parca platformun yanindan girerse geri seker, yukaridan gelirse konar (kiyZemin).
- Donen platform: dusen kup platform tablasinin icinde kalirsa disari itilir.
- Ilk 25 bolum: uretici/tasarim/ilk25.mjs (yapi 5900-5924, pilot/tasarim/t19.json): az renk, her bolum bir sey ogretir; 12 pervane, 21 sarkac, 24 cark; 16 kayan, 18 asansor, 22 donen, 23 iki platform.
- Kartlar: uzun cubuk, kucuk kavanoz, serit blok ve her platform hareketi (kay, asansor, don, iki, uc, daire, denge) ilk geldigi bolumde (bolum.js AILE, oyun.js yeniSekil).
- Engeller: +3 (dev yengec, doner kapi, marti surusu); engeller sirayla acilir (oyun.js ENGACIL: 12 pervane ... 226 martilar), siklik %30'dan %62'ye.
- Hareketler: +3 (daire: kayar ve iner kalkar, hizli kayan, denge: tahterevalli); sira2.py HACIL ile sirayla acilir, hareketli bolum orani %24'ten %60'a.
- Top sayisi (egri.js sekilTop): bot atisi x (0.45 + genel egri) x testere: 26'da ~1.45 kat, 1000'de ~1.13, 2000'de ~1.09; en az botun %90'i. Butun yapilar yeni fizikle botla olculdu
  (yeni tasarimlarin ornegi, Adem'in 176 cizimi, ilk 25, butun duzenekli bolumler). Duzenekli bolumlerin olcumu sira.js DUZBOT; 45 atista bitirilemeyenler sirada baska bolumle degisti.
  Agir bloga (tas, kemer, sutun, yildiz) carpan top eski gucunu korur (TOPKAYIP 0.45).

## v12.0 (23 Kas 2026): 2000 bolum yeniden dizildi, 6 yeni engel (Adem: 'ayni gorsel ikinci kez olmasin, yeni engelleyiciler, monoton gitmesin; onay sende, tekte yayinla')
- Sorun: 1601-1700 arasinda 100 bolumun yalniz 10'u Adem'in cizimlerinden, 1776'dan sonra hic yoktu; geri kalan 19 kaliptan uretilmis kule/kale/piramit.
- Yeni tasarimlar (pilot 4000+, `yapi/pilot/tasarim/t*.json`, 100'er): izgara harfleri, oyunda `pilot/izgara.js` ile bloklara cevrilir (on sira resim, arka siralar birlesik dolgu).
  Uretici: `yapi/uretici/tasarim/` -- yuz.mjs (60 hayvan/karakter yuzu x aksesuar x ifade), cizim.mjs (117 elle cizim: hayvan govdeleri, cisimler, yiyecek, tasit),
  bina.mjs (kale, ev, gemi, tren, robot, agac, pasta, roket, tapinak, pagoda, sehir, maske, canavar ...), duvar.mjs (simge mozaikleri, desenler), duzen.mjs (kavanoz raflari, dev kavanoz, sutunlu katlar ...).
  `node topla.mjs` kurar + benzerleri eler (on yuz resmi, eski ve yeni tasarimlarla benzerlik > 0.7 alinmaz) -> havuz.json, t*.json.
  `python olc.py i n liste.json ON 0|45`: oyunun fizigiyle denge (0) ya da bot atisi (45). `python sira2.py OLCUM_KLASORU` -> pilot/sira.js (bolum -> yapi).
- Yeni blok renkleri: oyZ lacivert, oyH kahverengi, oyG gri, oyE bej, oyL turkuaz (+ uz2-4 cubuklari; beyaz cubuk uz*B). seker.js + sekil.js.
- Sira: Adem'in 176 cizimi yerinde (26, 36 .. 1776), ogretici 1-5, karisik yapilardan her kaliptan en cok 3; her dunyada 1 kayitli duzenekli bolum (denge, asansor, donen, kopru ...);
  geri kalan her bolum yeni tasarim, her biri bir kez. Eski sira: `uretici/tasarim/sira_eski.js` (geri donus: pilot/sira.js yerine kopyala).
- Engeller (`yapi/engel4.js`, eski havuz `?eng4=0`): delikli cark, ahtapot kollari, papagan, ikiz gulle, balonlu fici (balonu vurunca patlar), ziplayan ficilar. Kayitli bolumlerde %55 engel, tur sirayla doner; yeni engel +2 top.
- egri.js sekilTop: sekil bolumlerinde de zincir/kaptan/altin turu top carpani.

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
