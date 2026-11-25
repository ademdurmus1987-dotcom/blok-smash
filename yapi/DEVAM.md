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

## v12.9 DENEME (24 Kas 2026, ?blok6=1): Smash Kingdom kalitesinde boyali bloklar (Adem: 'kalitede yine cok fark var', 23 Kas zip Smash Kingdom ekranlari)
- Rakipte kaliteyi yapan: keskin ince pahli kutu, boyali doku (yuz tek duz renk degil), iri sade kontrastli amblem, yuzde isik gecisi, ust kenarda parlak cizgi.
- blok6.js: BoxGeometry kose pahi (0.065 S), kodla boyanan tek doku atlasi (on/arka amblemli, diger yuzler duz). Stiller: boya (renkli kup/cubuk + iri krem pati),
  kristal (oyL / oyA turkuaz: derin lekeler, ince ic catlaklar, parilti), tahta (ksSandik: kalaslar, damar, demir kose, pati). blok3b.js yap() once B6'ya sorar.
- v12.9b: tas (mavi-gri benekli, oyma halka), kristal buz (ksBuz), kalas (damar, demir uclar), TNT (krem bant, kirmizi yazi), kr3 kiris, kavanoz/sise (LatheGeometry:
  boyali govde, pati, halat serit, bez kapak), fici (tahta cubuklar, demir cember). Olculer mevcut modelin kutusundan (yarim kup katlarina yuvarlanir; fizik degismez).
  Hata dersi: kutuda kose kaydirinca UV yeniden hesaplanmali (yoksa yuzde dokunun yalniz ortasi gorunur).
  Kapsam disi (eski gorunum): oyA Foxi kupu, ksDirek, dalga, ksSutun, ksYildiz, ksKemer. Atis sinamasi bu makinede (swiftshader) zaman asimi; telefonda denenmeli.
- Ornek: uretici/blender/onizleme/blok6_ornek.png. Adem 24 Kas gece: 'sirayla yap, toplu deneyip oyuna aliriz' -> once anahtar arkasinda, sonra birlikte varsayilan.

## v12.8 DENEME (24 Kas 2026, ?blok5=1): sade parlak oyuncak kupler (Adem: 'basla'; 'kuplerdeki cok fazla detay belki kotu gosteriyordur')
- seker_set.py kup5 -> model/blok3/kup5_1..4.glb: oluk ve ic cerceveler yok; tek genis duz pah (2 dilim), hafif cukur duz pano, iri pati. oy* ve uz* (seker.js BLOK5).
- blok3b.js: o.parla -> boyali tonlar korunur, malzeme MeshPhysical (clearcoat 0.85, puruz 0.34, ENV 0.55), toneMapped false (renk solmasin).
- Karsilastirma: uretici/blender/onizleme/blok5_karsilastirma.png (ust yeni, alt simdiki). Adem onaylarsa BLOK5 `!== '0'`; sonra kavanoz, sandik, tas ayni yontem.
- oyun.js?v=236, CACHE v186 (seker.js?v=8: butun ice aktaranlar ayni surum).

## v12.7 (24 Kas 2026): platform sekil cesitleri VARSAYILAN (Adem onayladi), eski platform ?plat5=0. oyun.js?v=235, CACHE v185

## v12.6 DENEME (24 Kas 2026, ?plat5=1): platform sekil cesitleri (Adem: 'platform cesit olsun yuvarlak kare vs')
- plat5.js: sekiller kare (tahta kaplama yan), yuvarlak / hap (turkuaz yumusak kenar), sekizgen / altigen (mercan, keskin pah); tek platformda daire/elips (kupleri icine alir).
  Kamera neredeyse yatay: sekil ailesi yan yuzun renk/stilinden okunur. Ustte ayri pahli guverte kalaslari, 3 iplikli halat, altin bant + percin, MeshPhysical vernik + ENV.
- Tasarim (pilot) bolumleri: tek katli dikdortgen kat yeni sekle doner; yeni cokgen dikdortgeni HER ZAMAN icine alir, fizik ayni cokgen (pilot.js p5Kat).
- Ayak: Blender uretici/blender/platform5.py -> model/plat5/ayak.glb (1.3 MB; Y yuvarlak, K sekizgen takim). Koseli platformda K ayak.
- Deneme: ?psekil=kare|yuvarlak|hap|sekizgen|altigen|daire|elips her bolumde ayni sekil. Selenium (swiftshader) oyun sinamasi cok yavas, yalniz ekran goruntusu alindi.
- YAPILDI v12.7. Sira: ayni Blender yontemiyle bloklar.

## v12.5 (24 Kas 2026): Blender top arabasi ve tek platform sutunu VARSAYILAN (Adem onayladi)
- oyun.js TOP5 / AYAK4 kosulu `!== '0'`. Eski araba `?top5=0`, eski iki ayak `?ayak4=0`. Atis dalgasi kapali: `?dalga=0`. oyun.js?v=233, CACHE v183.

## v12.4 DENEME (24 Kas 2026): Blender top arabasi (Adem: 'bana gorsel kalite ver referanslar gibi, blender dan yapabilir misin')
- uretici/blender/top_arabasi5.py -> model/top5/araba.glb (~49 bin ucgen, 0.97 MB): pahli namlu, 3 iplikli burgulu halat halkalar, altin halkalar ve muylu, kabartma tilki patisi,
  basamakli tahta yanaklar + percin + demir bant, parmakli tekerlek + demir lastik + altin gobek. Malzeme adi = rol (govde namlu ahsap altin krem demir ic halat).
  Onizleme: `-- onizleme` -> uretici/blender/onizleme/top5_arka.png, top5_yan.png.
- Yer (Adem: 'biraz ciksin tamami cikmasin'): namlu agzi ekranin %83'u, genislik %30 (eski araba %86 / %36).
- Atis dalgasi (Adem: 'popo kismi genisleme efekti, animasyon filmlerdeki gibi'): oyun.js namluDalga: atista namlunun arkasi siser, siskinlik 0.3 sn'de agza ilerler (kose deformasyonu, yalniz gorunum). ?dalga=0 kapali. top4/top5/yeni4 denemelerinde.
- oyun.js top5Yukle: ?top5=1 (TOP4 yerlesimi ve animasyonu); once top4.js kod modeli, GLB gelince yerine gecer; malzeme MeshPhysical (clearcoat, ENV). Gardirop rolleri calisir.

## v12.3 DENEME (24 Kas 2026): arkadan okunan top arabasi ve tek platform ayagi (Adem: 'kalite farkini gostermek istedim'; Smash Kingdom / Play Store ekranlari referans/oyun2)
- Sorun: bizim araba ekranin altinda yarisi kesik iri bir top gibi okunuyordu; rakipte arkadan bakinca uzun, kalkik namlu. Platform iki ince ayakta, rakipte tek kalin orta sutun.
- top4.js topModeli3: 26 derece kalkik uzun namlu (turuncu govde, turkuaz agiz, halat/altin halkalar, arkasinda tilki patisi), tahta yanaklar, parmakli tekerlekler. Gardirop rolleri ayni.
  Ekranda namlu agzi %86, genislik %36: eski arabanin yeri ve boyu (Adem 24 Kas: 'araba eski pozisyonda olsun'; ilk deneme %80 ve %22 idi, ?t4y=0.8&t4w=0.22). oyun.js pAyak AYAK4: genis platformda da tek sutun, kalinlik platforma gore x1.35-1.9.
- Anahtar: ?yeni4=1 (ikisi), ?top4=1, ?ayak4=1. Adem onaylayinca varsayilan olacak.

## v12.2 (23 Kas 2026): uzak kamera, genis ilk bolumler, Gardirop (Adem: 'ilk bolumlerde kamera cok yakindi, cok basit; oyuncu cekmek icin iyi olmali; altin yildiz harcayacak bir sey yok'; Kingdom Smash ve Pirate Smash ekranlari: yapi/referans/oyun2/)
- Kamera (oyun.js KAM3, eski ?kam3=0): bir blok ekranin en cok %8.8'i (~34 px; v11.4'te %11.5, ilk bolumlerde 60-74 px oluyordu); sekil (pilot) bolumlerinde de gecerli. Ana kipte platformun tamami cerceveye girer.
- Ilk 25 (uretici/tasarim/ilk25.mjs; t19.json `node ilk_yaz.mjs`): 1-7, 9, 11-14, 17, 18, 21 7-10 sutuna genisledi (desenli, 1-2 renk). Bot olcumu sira.js SEKIL[1..25][2]. Onceki tasarim: git v12.1.
- Gardirop (gorunum.js + gor.css, magazada; eski ?gor=0): 8 top arabasi rengi (kaide.js malzeme rolu govde/namlu/ahsap/altin/krem), 8 gulle rengi (oyun.js gulleBoya: kose parlakligi korunur, ton degisir).
  Altinla alinir (800-30000); pahalilar toplam yildiz ister (yildiz harcanmaz). Kayit SV.gor = { t, g, s: [sahip] }.

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

## SIRADAKI (24 Kas 2026, v12.4 sonrasi)
1. YAPILDI v12.5: top5 ve ayak4 varsayilan (eski ?top5=0, ?ayak4=0).
2. Ayni Blender yontemiyle (pahli form + parlak vernik MeshPhysical + ENV) once platform/ayak, sonra bloklar. Referans: yapi/referans/oyun2 (Smash Kingdom, Play Store ekranlari). Rakibin renk/motifini kopyalama.
3. Kurulan eklentiler (Adem 24 Kas): image-generation (Gemini istemleri icin rehber), CellCog (ses/muzik/gorsel/3B uretimi; Adem'in hesabiyla kurulum gerekir, /cellcog-setup). Onerildi: SoundWeaver (52 hazir ses), parallax-threejs (Three.js hata ayiklama).
   CellCog ile oncelik: oyun sesleri ve muzik (simdi kodla uretiliyor), yeni dunya fonlari.

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

## v12.9c (24 Kas 2026) — Adem'in iki hatası
- Platform ayağının Blender başlığı (plat5) güverte tahtalarının arasından (-0.05) görünüyordu: P5'te başlık/gövde üstü 0.42 aşağıda (`pAyak` `u.upd`).
- Çatlak izi rastgele x'te ön+arka yüze konuyordu: artık topun değdiği noktaya (b.blast) en yakın yüzde, o noktada (`catlakIz(c, p)`). Eski: `?cat2=0`.

## v12.10 deneme (24 Kas 2026, ?blok6=1) — kalan bloklar
- blok6.js: ksYildiz (sari-turuncu boyali kup, iri krem yildiz), ksDirek (dikey damarli tahta, ust-alt demir bant), ksSutun / ksMorSutun (yivli boyali tas sutun, LatheGeometry; mor yerine turkuaz).
- Kapsam disi kalan: ksKemer (kemer bicimi), oyA (Foxi kupu, bilerek eski). Onizleme: uretici/blender/onizleme/blok6_yildiz_sutun.png.
- Siradaki: Kingdom'daki gibi bloklarin altinda koyu yumusak temas golgesi (anahtar arkasinda), sonra ?blok6=1 varsayilan icin Adem onayi.
- v12.11 denendi, yayinlanmadi: blok altina koyu temas golgesi (Kingdom). Bizim neredeyse yatay kamerada golge gorunmuyor, yan kenarlarda ince siyah cizgi olarak tasiyor. Kingdom'da kamera daha yukaridan bakiyor; once kamera acisi denenmeli.

## v12.12 deneme (24 Kas 2026, ?blok6=1) — kemer
- blok6.js kemerYap: ksKemer boyali tas kemer (ExtrudeGeometry, pahli; aciklik ve yay merkezi kemerSekil fizigiyle ayni). On yuzde acik kemer taslari (iri kilit tasi), ayaklarda iki tas; tas rengi ksTas ile ayni. Onizleme: uretici/blender/onizleme/blok6_kemer.png.
- Boylece ?blok6=1'de bolum bloklarinin hepsi boyali (oyA Foxi kupu bilerek eski). Siradaki: Adem onayi ile ?blok6=1 varsayilan; sonra kamera acisi denemesi (temas golgesi icin).

## v12.13 (24 Kas 2026): boyali bloklar (blok6) VARSAYILAN (Adem onayladi), eski ?blok6=0
- Siradaki: kamera biraz daha yukaridan (Kingdom gibi) denemesi, anahtar arkasinda; sonra temas golgesi yeniden.

## v12.14 deneme (24 Kas 2026, ?ses3=1): CellCog sesleri
- oyun.js SES3 / CCS: atis, vurus, tahta, tas, cam/buz, patlama ses/cc/'den; kazan/kaybet zil yerine kayit (kazan3/kaybet3). Yalniz Yapi modu (K degil). Kaynak: ses/KAYNAKLAR.md.
- CellCog her istekte en az 60 kredi; 8 ses tek istekte uretildi. Adem begenirse varsayilan yapilir.

## v12.15 deneme (24 Kas 2026, ?logo4=1): yeni logo acilista
- Logo: Adem'in Gemini cizimi (tabela + Foxi top arabasinin fitilini yakiyor). Damali sahte saydamlik kodla silindi -> simge/logo4.webp (kaynak simge/cc/logo_g1.png).
- index.html: ?logo4=1'de acilis videosu yerine logo, sade gok-deniz-kum fon, en az 3.2 sn gorunur. Eski: anahtarsiz (video).
- Ikon adayi: simge/cc/ikon4-*.png (Gemini, kesildi). Manifest DEGISMEDI; Adem onaylayinca icon-192/512, maskable, apple-touch-icon yerine konur.
- CellCog logo/ikon adaylari (simge/cc/logo_a,b, ikon_a,b) elde top tutma mantik hatasi yuzunden secilmedi.
- v12.15d: fon tek renk turkuaz (#2fb4d8, ortasi hafif acik), Adem goz yormasin diye istedi; ada resmi denemesi (v12.15c) kaldirildi. logo4.webp altinda kesik golge izi yumusatildi, 40 px bos alan eklendi (?v=4).
- v12.15e: ?logo4=2 ikinci secenek: rakip videolarindaki gibi keskin sahne fonu (fon/ana_ada2.webp, kenarlar hafif koyu), Foxi adanin cimeninde duruyor. ?logo4=1 tek renk turkuaz kaldi.
- v12.15f: ada sahnesi 'cok kalabalik' bulundu; ?logo4=2 fonu sade sahil (fon/sahil3_bos.webp: gok, deniz, kum) oldu.
- v12.15g: ?logo4=3 tam ekran tek parca acilis resmi (Adem'in Gemini cizimi, kaynak simge/cc/acilis_g.jpg; alti kum aynalanarak telefon oranina uzatildi -> yapi/fon/acilis5.webp). Ayri logo gizli.

## v12.16 (24 Kas 2026): yeni acilis varsayilan
- Adem onayladi: acilis ekrani artik tam ekran resim (yapi/fon/acilis5.webp). Eski video acilis: ?logo4=0. Denemeler: ?logo4=1 tek renk + ayri logo, ?logo4=2 sahil + ayri logo.
- Ikon (simge/cc/ikon4-*.png) hala manifest'e konmadi; Adem'in onayini bekliyor.

## v12.17 deneme (24 Kas 2026, ?kam4=1): kamera biraz daha yukaridan (Kingdom gibi)
- oyun.js KAM4: her bolumde (pilot dahil) egim 18 derece (eski: ana kip 9, pilot en cok 13). ?kpit=N ile baska aci denenir (kpit verilince kam4 kendiliginden acik).
- Yuksek egimde top arabasi asagida kalip kuculuyordu: KAM4'te araba boyu gercek derinlige gore yeniden olculur (ekranda ayni genislik).
- Karsilastirma (390x844): 16 / 20 / 24 derece denendi; 18 secildi. Atis sinamasi hatasiz. Adem telefonda begenirse KAM4 varsayilan, sonra temas golgesi (v12.11) yeniden.
- Ikon: CellCog kullanilmayacak (Adem 24 Kas). Aday simge/cc/ikon4-*.png Adem'e gosterildi.

## v12.18 deneme (24 Kas 2026, ?ocak=1): Topcu Ocagi basladi, Osmanli Foxi
- Fikir (Adem): oyuncu karakterini sekillendirsin; tarihten topcular (Osmanli, Sovalye, Samuray, Viking, Roma). Kahraman hep Foxi, kostum degisir. Dini simge, bayrak, savas anlatimi, gercek kisi YOK; sevimli oyuncak tarzi.
- Istemler: yapi/uretici/istem/ocak_kostum.md (referans: acilis resminden kesilen boy Foxi). Adem'in Gemini cizimleri: karakter/ocak/kaynak/*.jpg -> yesil_ayikla.py anahtar() -> karakter/ocak/osmanli_{durus,sevinc,uzgun}.webp.
- ?ocak=1: ana sayfada video yerine osmanli_durus (merkez.js ocakTilki: 2B tuval, nefes/salinim, dokununca ziplar, kendi sozleri); kazanma karti sevinc (kazan2.js), kaybetme karti uzgun (merkez.js UZANIM).
- Siradaki: Topcu Ocagi sayfasi (Gardirop yerine: cag kartlari, parca secimi, gelistirme 1-5), tunc Sahi topu + gulle, kayit SV.ocak. Sonra diger cag kostumleri.

## v12.19 deneme (24 Kas 2026, ?ocak=1): Topcu Ocagi kostum secimi (5 kostum)
- Adem'in Gemini cizimleri (her biri durus/el sallama, sevinc, uzgun): Osmanli, Sovalye, Samuray (miğferde pati), Viking (mavi tunik; yesil tunik zeminle silinirdi), Roma (miğferde pati, hac yok).
  Kaynak: karakter/ocak/kaynak/*.jpg -> karakter/ocak/{kostum}_{durus,sevinc,uzgun,kart}.webp. Sarimsi yesil zeminde (roma_uzgun, samuray_sevinc) yesil_ayikla anahtar() yetmedi: ek temizleme (ton 62-170 derece, kenara bagli; alt gölge g>=r, b<0.4g).
- gorunum.js KOSTUM (fiyat altin + gereken yildiz: Osmanli 2000, Sovalye 4000/40, Samuray 7000/90, Viking 10000/150, Roma 15000/250), kostumSec(SV), kayit SV.gor.k.
- merkez.js: Magaza > Gardirop ustunde 'Topcu Ocagi' kostum kartlari; kostumUygula(): ana sayfa Foxi tuvali yenilenir (korsan = eski video, digerleri ocakTilki resim), kazanma (kazan2.js sevincSec) ve kaybetme resmi degisir.
- Siradaki: Adem onaylarsa OCAK varsayilan; her cagin top arabasi/gullesi (Sahi topu ...), gelistirme seviyeleri.

## v12.20 deneme (24 Kas 2026, ?dost=1): kafesteki dost
- Adem'in tarifi: kafes bir yerde durur; yikimda kupun icinden anahtar cikar, kafesi acar; hayvan oyun icinde gorunmez, bolum sonunda ayri ekranda.
- yapi/dost.js: DOSTLAR (8: baykus, kirpi, tavsan, kunduz, kaplumbaga, sincap, penguen, koala), her 5. bolum sirayla (kurtarilmissa yok), kayit SV.dost.
  Kafes: ekranin sag ustunde SVG (#dkafes), anahtar DOM'da yay cizip ucar, kapi acilir. Bolum sonu #dekran: isinlar, acik kafes, hayvan (karakter/dost/{id}.webp; yoksa emoji), 'X'i kurtardin!', Harika -> kazanma karti.
- oyun.js: bolumBasla one bakan orta yukseklikteki kupe kameraya donuk rozet (dostRozet: turkuaz daire + altin anahtar, nabiz parlama); knock -> dostUc; win -> dostEkran sonra M.kazan.
- Bekleyen: Adem'in Gemini hayvan cizimleri (yesil zemin, sevinen poz) -> karakter/dost/*.webp. Sonra: 'Dostlarim' sayfasi, paylas.

## v12.21 deneme (24 Kas 2026, ?dost=1): korsan murettebati (Adem duzeltti)
- Oyunda kafes YOK: anahtar kupten sag ustteki anahtar yuvasina (#dyuva) ucar. Bolum sonu ayri sayfa (#dekran): kilitli kafes, anahtar yuvadan gelip kilide girer, ceyrek tur doner, kafes sarsilir ve acilir (flas, isinlar), uye cikar: '<ad> kurtuldu! <gorev> · Murettebat n/8'.
- Murettebat (dost.js DOSTLAR): Papagan Pako (Gozcu), Kaplumbaga Tosbi (Dumenci), Ahtapot Ahmo (Asci), Kunduz Kundi (Marangoz), Penguen Pengo (Gulle Ustasi), Kirpi Diken (Haritaci), Kurbaga Virak (Borazanci), Fok Foki (Dalgic).
- Bekleyen Gemini resimleri: karakter/dost/{id}.webp (korsan kiyafetli, sevinerek cikan poz) ve kafes_kapali.webp / kafes_acik.webp. Simdilik kodla kafes ve emoji. Istemler: yapi/uretici/istem/murettebat.md

## v12.22-23 deneme (24 Kas 2026, ?dost=1): murettebat resimleri + video
- Adem'in Gemini cizimleri 8 uye -> karakter/dost/{id}.webp (kaynak karakter/dost/kaynak/). Sarimsi zeminde (kaplumbaga, kirpi) yeni yol: satir satir zemin rengi tahmini (kenar medyanlari), renk orani yakinsa silinir + en buyuk parca disindaki yesil lekeler (scratchpad dostek3.py mantigi). Kurbaga: ton 62-170 kenara bagli silme.
- Video: Adem'in Gemini videosu (kunduz, 4 sn, yesil zemin) -> 15 fps kareler, her kare anahtar() + alt golge -> hareketli saydam WebP karakter/dost/kunduz_anim.webp (61 kare, 359x520, ~950 KB). dost.js once {id}_anim.webp, yoksa {id}.webp, yoksa emoji.
- Bitis ekrani: kafes acilinca sola-geri kucilir, uye onde zipler.
- v12.24: Adem'in Gemini kafesi (kapali/acik) -> karakter/dost/kafes_{kapali,acik}.webp. Kafeste delik doldurma YOK (parmaklik arasi saydam): ayri ayiklama (yesil oran anahtari + kucuk parcalari silme), iki resim ayni kutuyla kirpildi. Anahtar kilit deligine (resmin 0.533, 0.746 noktasi) gider.
- v12.25: Adem'in Gemini anahtari (kulpta pati) -> karakter/dost/anahtar.webp (480x208, kulp bosluklari saydam): oyundaki rozet (oyun.js dostRozet tuvaline cizilir), sag ust yuva, ucan anahtar. Gercek kilit sesleri: Kenney RPG Audio (CC0) -> ses/kilitgir.mp3 (metalClick), kilitac.mp3 (metalLatch), kafesac.mp3 (creak1); oyun.js SFILES/SECILEN + sfx. Kaynak ses/KAYNAKLAR.md.
- Ag: kenney.nl ve opengameart.org icin 'Foxi Smash' kisisel bulut ortami olusturuldu (CC0 ses indirmek icin).
- v12.26: kafesteki murettebat VARSAYILAN (Adem: "oyunda yok"; simgeden/normal baglantidan acinca ?dost=1 yoktu). Kapatmak: ?dost=0.
- v12.27: ?tani=1 tani penceresi (surum, murettebat durumu, ayak modeli yuklendi mi, GPU, hatalar). Adem telefonda anahtar ve platform ayagini goremiyor; bilgisayar ve telefon taklidinde ikisi de var.
- v12.28-29 (Adem: "anahtar delige girip kilidi acmiyor, yuzeyinde yapmaya calisiyor"): anahtar ucu delige hizali (donme merkezi uc), kulp perspektifle bize doner (rotateY 62), iceri itilir, sonra kendi govdesi etrafinda doner (rotateX -80), mandal sesi, kafes acilir.
- v12.30 (Adem: "bakis acisi ters dusmesin"): kafes onden; anahtar govdesi delikte kaybolur (clip-path), delikte kulp kalir ve ekran duzleminde 90 derece doner. Perspektif (v12.29) kaldirildi.
- v12.31: murettebat VIDEOSU (Adem Gemini: uye kafeste, anahtar kilide girer, kafes acilir, uye cikar, kendi sesiyle). karakter/dost/video/{id}.mp4 (sessiz 540x960) + {id}.mp3; dost.js VIDEOLU (simdilik papagan), videoEkran: WebGL canli yesil ayiklama, ses oyun.js kayitCal (AudioContext). Videosu olmayan uye eski resimli akis (dostEkranResim). ?dvid=0 videoyu kapatir. Karaktersiz kafes videosu karakter/dost/kaynak/kafes_video.mp4 (kullanilmiyor).
- v12.32: ?sv= ile acilan deneme bolumunde kurtarilmis uye yine cikar (Adem telefonda tekrar denerken anahtar cikmiyordu: uye bir kez kurtarilinca o bolumde bir daha anahtar olmaz).
- v12.33: Kunduz videosu (Adem, Pro + duzenleme istemi: kafes ayni kaldi). 9.0 sn kesildi (sonda kafese geri giriyordu). VIDEOLU: papagan, kunduz.
- v12.34: Penguen videosu (Adem, Google Flow, 6 sn, kesilmedi). VIDEOLU: papagan, kunduz, penguen.
- v12.35: Kirpi videosu (Flow, 6 sn; yesil fular sarimsi, ayiklamada korunuyor). VIDEOLU: papagan, kunduz, penguen, kirpi.
- v12.36: Kurbaga videosu (Flow). Kaplumbaga videosu kabuksuz/kulakli geldi, kullanilmadi (kaynak/kaplumbaga_kafes_video_kabuksuz.mp4). VIDEOLU: papagan, kunduz, penguen, kirpi, kurbaga.
- v12.37: Ahtapot videosu (Flow). Fok videosu kulakli (kedi gibi) geldi, kullanilmadi (kaynak/fok_kafes_video_kulakli.mp4). Adem: bozulan kaplumbaga ve fok yerine baska karakterler. VIDEOLU 6/8.
- v12.38: kaplumbaga -> Maymun Miko (Direkci, 10. bolum), fok -> Kedi Mirmir (Ambar Bekcisi, 40. bolum). Resimler Adem (CapCut AI, Pixar tarzi istem) -> karakter/dost/{maymun,kedi}.webp. Eski kaplumbaga.webp/fok.webp duruyor (kullanilmiyor). Videolari bekleniyor.
- v12.39: Maymun videosu (Flow). Kedi videosunda yelek YESIL geldi, ayiklamada siliniyor; kullanilmadi (kaynak/kedi_kafes_video_yesilyelek.mp4). VIDEOLU 7/8.
- v12.40: Kedi videosu (Flow, kahverengi yelek). MURETTEBAT TAMAM: 8/8 videolu (papagan 5, maymun 10, ahtapot 15, kunduz 20, penguen 25, kirpi 30, kurbaga 35, kedi 40). 45. bolumden sonra sira basa doner ama hepsi kurtarildiysa anahtar cikmaz.

## v12.41 (25 Kas 2026): korsan tayfasi tasarimi, 1. asama
- Adem kararlari: tarihi figur YOK (Topcu Ocagi ?ocak=1 rafta), korsan dunyasi; kotu karakter Rakun Rako (kuleleri o diziyor, sakar/komik); kurtarma seyrek: 10 (tanisma), 100, 200 ... 700; hikaye kartlari (Rako kuleyi diziyor, tayfa su an ne yapiyor) resim bekliyor. Gelistirme asamasi: eski oyuncu yok, kayit tasima gerekmez.
- dost.js TAKVIM, YARDIM, dostVar, dostSonraki. Yardimlar: papagan sandik 4 bolumde (merkez SANDIK_HEDEF valueOf), maymun sandik +%25 altin, ahtapot gunluk +%25, kunduz insa %10 ucuz (insa.js FY), penguen +1 top (oyun.js shotsFor), kirpi bolum altini +%10, kurbaga 3 yildizda +10, kedi devam 80 (DEVAM_FIYAT valueOf).
- Ana sayfa: 'Korsan' dugmesi yerine 'Tayfa' (n/8), Oyna ustunde 'N bolum sonra kafesten kurtar' seridi (siradaki uyenin golgesi). Tayfa sayfasi: 8 kart (kurtarilan renkli + gorev + yardim, kalan golge + Bolum N).
- Siradaki: Rako resmi (Adem) -> hikaye kartlari sistemi; gemi ekraninda tayfa; paylas dugmesi.
- v12.42: hikaye kartlari yapi/hikaye.js (KARTLAR: L, id, bas, yazi). Tam ekran dikey (karakter/kart/{id}.webp 720x1280, Adem Gemini), alt yazi + Devam, bolum basinda bir kez (SV.kart); ?hikaye=0 kapatir, ?sv= her seferinde gosterir. Ilk iki: firtina (1. bolum), rako (3. bolum). Not: firtina kartinda papagan/kurbaga yesil (tayfadan farkli).

- v12.43: 8. bolum karti pako_kafes (Rako Pako'yu kafese kilitliyor). Resim Higgsfield Nano Banana Pro, 3 referansla (kart/rako, dost/papagan, dost/kafes_kapali; Pages adresinden media_import_url) Adem claude.ai sohbetinde sinirsiz haktan uretti (Claude Code'dan sinirsiz hak kullanilamiyor, kredi harciyor). Kaynak kart/kaynak/pako_kafes.jpg.

- v12.44: Foxi'nin Yolculugu (yapi/yolculuk.js, ?yol=0 kapatir). karakter/yolculuk/parca0..8.mp4 (540x960 sesli, 6 sn; Higgsfield Seedance 2.5 omni_reference, Adem claude.ai sohbetinde sinirsiz hakla). parca0 Foxi yalniz, parcaN = DOSTLAR[N-1] gemiye katilir. Kurtarma ekraninda 'Harika!' sonrasi o parca + 'Siradaki kurtarma: Bolum N'. Tayfa sayfasinda 'Yolculugu izle' (0 + kurtarilanlarin parcalari arka arkaya). Istem kalibi: ayni acilis cekimi (guverte) / yeni uye girisi / herkes sevinir + kamera geri ve yukari, gemi adaya. Dersler: gemi resmi referansken Foxi bas heykeliyle karisiyor (parca0'da GEMI referansi verilmedi); 'herkes sevinsin' yabanci hayvan ekleyebiliyor; kalabalikta karakter ikizlenebiliyor ('every character exactly once'). Tam film 50 sn (Adem'e gonderildi, repoda yok).

- v12.45: Insa videolari karakter/insa/asama02..10.mp4 (12 sn; Seedance 2.5 start_image=gemiNN, end_image=gemiNN+1, Foxi calisir, sonda kadrajdan cikar). asama09 (8->9) 4.6 sn'de kesildi: yelken bir asama erken cikiyordu, yeniden uretilecek. 'Insa Et' -> video -> parlama + yeni resim. Son asamadan sonra denize.mp4 (15 sn) + yolculuk [0 + kurtarilanlar]. Hikaye: yolculuk parcalari ancak gemi denize indikten sonra (gemi < 10 iken kurtarmada parca oynamaz, denize inince hepsi sirayla). Tayfa sayfasindaki 'Yolculugu izle' de gemi bitince. ?insav=0 insa videolarini kapatir.

- v12.47: Foxi duygulari yeniden (Seedance 2.5, start=end=foxi_referans.jpg yesil fon, kesintisiz dongu). tilki_dans.mp4 (10 sn, 480x700 kirpildi, final ekrani), tilki_sevinc_anim.webp / tilki_uzgun_anim.webp (260x380, 61 kare, 12 fps, oyunun yesil esigiyle saydam). Eskileri karakter/kaynak_eski/.

- v12.48: tam ekran kurtarma videolari karakter/dost/kurtar/{id}.mp4 (15 sn, Seedance 2.5; Foxi anahtarla kafesi acar). Yerler: papagan fener, maymun selale, ahtapot batik gemi, kunduz nehir sali, penguen buz magarasi, kirpi tapinak zindani, kurbaga atesbocekli bataklik (timsah), kedi Rako'nun ambari (Rako kapaktan duser). oyun.js kurtarSonra: kurtarma videosu + (gemi denizdeyse) yolculuk parcasi + tek yazi (gorev, tayfa n/8, yardim, siradaki bolum). Eski kafes ekrani ?kurt2=0. Deneme: konsolda BSKURTAR('penguen').

- v12.50: acilis videosu (varsayilan ?logo4=5): karakter/acilis/acilis6.mp4 (10 sn, Seedance 2.5 genis yan cekim: Rako kuleyi diziyor, Foxi topla yikar, TNT, altin, kafes acilir, Pako kurtulur) + ilk kare poster. Tabela simge/tabela.webp (logo4.webp'den yalniz tabela kesildi) 6.8. sn'de iner ve sallanir. Video biterse ya da dokununca oyun acilir. Onceki tam ekran resim ?logo4=3, eski sarki videosu ?logo4=0. Sinematik B surumu (yakin cekimler) kullanilmadi, ileride hikaye girisi olabilir.

- v12.51: acilis videosu yeniden: karakter/acilis/acilis7.mp4 (sinematik, gun batimi, az ama iri bloklar; Rako kulenin tepesinde anahtari korur, kafes palmiyede atis hattinin disinda; patlama, anahtar kafesin kilidine ucar, Pako cikar, Foxi + Pako poz). Ders: oyun ekran goruntusunu referans vermek kaliteyi oyunun sade gorunusune indirdi, kalabaliklasti; kafes kulede olunca top papagana ates ediyor gibiydi. Tabela 9.2. sn'de iner (62vw), video bitince son kare 1.6 sn kalir. Onceki genis cekim ?logo4=6.

- v12.52: hikaye kartlari videolu (hikaye.js KARTLAR v alani; yolculukOynat ile tam ekran, baslik+yazi sonda; eski resim ?hvid=0). karakter/kart/firtina.mp4 (12 sn: firtina, Pako savrulur, gemi parcalanir, Foxi adaya vurur) ve rako.mp4 (10 sn: Rako cuvalla gelir, kuleyi dizer, anahtari koyar). Not: ana sayfa foxi_korsan.mp4 zaten yeni Foxi, yenilenmesi gerekmiyor.

- v12.53: ipucu kartlari (hikaye.js): 2 gemi ('Once bir gemi lazim', resim gemi01), 5 pako_kafes (8'den alindi), 8 fener, 90/190/.../690 her tayfa uyesi (yer, kurtarma bolumu, yardimi); resimler kurtarma videolarinin acilis karesi (karakter/kart/ipucu_{id}.webp). Ayarlar > 'Oyunu sifirla' (onayli; ses/muzik/titresim kalir; oyun.js oyunSifirla, save() __bsSifir iken yazmaz).

## SIRADAKI (25 Kas 2026 aksam guncel)
Higgsfield sinirsiz deneme 28 Kas 10:36'da biter (Claude Code'dan sinirsiz yok; Adem claude.ai sohbetinde uretir, ben oyuna eklerim). Otomatik yenileme iptali Adem'in kararinda.
Once uretim isteyenler (deneme bitmeden):
4. Komik Rako karti (50. bolum). ('Pako gemide' karti artik gereksiz: gemi o zaman henuz yapilmiyor.)
Sonra (uretim gerektirmez):
5. Kazanma ekraninda 'sonraki tayfaya N bolum' sayaci.
6. Paylas dugmesi (kurtarma ani).
7. Telefonda denenecek: kurtarma/yolculuk/insa videolarinin sesi ve Oynat dugmesi (iPhone), acilis videosu.
8. Bekleyen eski onaylar: ?kam4=1 kamera, yeni ikon (simge/cc/ikon4), platform ayagi (?tani=1).
