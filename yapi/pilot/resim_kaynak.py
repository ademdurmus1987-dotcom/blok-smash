# Foxi Smash v8.3 (18 Kas 2026): Adem'in Gemini cizimindeki 6 yapi (Korsan Gemisi, Kale, Kuru Kafa, Deniz Feneri, Foxi Tilki Basi, Tas Kopru).
# Calistirinca yapi/pilot/resim.json yazilir; oyun yalniz JSON'u okur (?pilot=31..36). Mevcut 2000 bolum, pilot.json ve kayit sistemine dokunmaz.
#   python3 yapi/pilot/resim_kaynak.py
# Birim: blok (1 = kup kenari S = 1.55 dunya birimi). x: yapinin ortasina gore blok merkezi, y: blogun ALT yuzu (blok cinsinden).
# v8.4 (Adem: 'derinlik 3 olsun, tek sira hemen yikiliyor'): her blok onde, ortada ve arkada ayni yerde (3 sira derinlik, z = -1, 0, +1).
# Kamera tam onden (yaw 0) ve kaide hizasinda (pitch 1).
# Yalniz oyunda var olan bloklar: oy* patili kupler, ksSandik/M/K, ksTNT, ksTas/2/3/4, ksBuz/3, ksKalas1/2/3, ksDirek, ksSutun, ksMorSutun, ksKemer, ksFici/K, ksSise*, ksYildiz.
import json, os
S = 1.55
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'resim.json')
GX = 1.004   # yan yana bloklar arasinda ~6 mm (carpisma kutulari birbirine surtunup titremesin)
GY = 0.003   # her blok sirasi arasinda 3 mm (ust uste oturur, batmaz)
DERIN = (-1, 0, 1)   # sira derinligi (blok)
# v8.4: 3 sira tas 60 topla yikilmiyordu (tas 3 kat agir). Bu bolumlerde tas: kutle x KM, devrilip/dusup sabit yuzeye sert carpan tas kirilir (pilot kurali 'kir')
TAS = {'km': 0.35, 'kir': 4}
GEN = {'ksTas2': 2, 'ksTas3': 3, 'ksTas4': 4, 'ksBuz3': 3, 'ksKalas2': 2, 'ksKalas3': 3, 'ksKemer': 3}
BOY = {'ksKalas1': 0.5, 'ksKalas2': 0.5, 'ksKalas3': 0.5, 'ksDirek': 2, 'ksSutun': 2, 'ksMorSutun': 2, 'ksKemer': 2}

class Yapi:
    def __init__(s, ad): s.ad = ad; s.L = []; s.n = 0
    def ek(s, t, x, y, derin=DERIN, **kw):
        """t turunu x (blok merkezi) ve y (alt yuz, blok) konumuna koy"""
        s.n += 1; k = round(y * 2)   # kacinci yarim sira (dikey bosluk icin)
        for d in derin:
            o = {'t': t, 'x': round(x * S * GX, 3), 'z': round(d * S * GX, 3), 'y': round(y * S + k * GY, 3), 'p': 'ana.0', 'id': '%s%d%s' % (t, s.n, 'aob'[d + 1])}
            if t.startswith('ksTas') or t == 'ksKemer': o.update(TAS)
            if t == 'ksTNT': o['patlama'] = {'r': 4.5, 'guc': 13}   # v8.4: buyuk patlama (pilot kurali): cevredeki kirilabilirler parcalanir, digerleri itilir
            o.update(kw); s.L.append(o)
    def sira(s, y, *parca):
        """bir sira: (tur, x) ciftleri"""
        for t, x in parca: s.ek(t, x, y)
    def sinir(s):
        x0 = min(p['x'] / S / GX - GEN.get(p['t'], 1) / 2 for p in s.L); x1 = max(p['x'] / S / GX + GEN.get(p['t'], 1) / 2 for p in s.L)
        return x0, x1
    def bolum(s, top, r=None, rz=1.5 * S + 0.2):
        x0, x1 = s.sinir(); r = r or max(-x0, x1) * S + 0.25
        return {'ad': s.ad, 'top': top, 'kaide': 'mor', 'kam': {'pitch': 1, 'yaw': 0, 'atis': 0.9, 'genis': 0.95},
                'ada': [{'id': 'ana', 'x': 0, 'z': 0, 'katlar': [{'sekil': 'kare', 'r': round(r, 3), 'rz': rz, 'ust': 0, 'kal': 0.75}]}], 'kopru': [], 'parca': s.L}

# ---------------- 31 Korsan Gemisi ----------------
def gemi():
    Y = Yapi('Korsan Gemisi')
    # 0: fici fici sandik sandik fici fici; uc sutundaki kirmizi ficilarin alti bos -> kirmizi patili kup (dolgu)
    Y.sira(0, ('oyK', -3.5), ('ksFici', -2.5), ('ksFiciK', -1.5), ('ksSandik', -0.5), ('ksSandik', 0.5), ('ksFici', 1.5), ('ksFici', 2.5), ('oyK', 3.5))
    # 1: kirmizi fici, 6 sandik, kirmizi fici
    Y.sira(1, ('ksFiciK', -3.5), *[('ksSandik', x) for x in (-2.5, -1.5, -0.5, 0.5, 1.5, 2.5)], ('ksFiciK', 3.5))
    # 2: guverte: dort 2'lik kalas (-4..4)
    Y.sira(2, *[('ksKalas2', x) for x in (-3, -1, 1, 3)])
    # 2.5: yan ust guverteler (3'luk kalas, 1 blok disari tasar; agirlik merkezi alttaki kalasin ustunde)
    Y.sira(2.5, ('ksKalas3', -3.5), ('ksKalas3', 3.5))
    # sol ust guverte: mavi sise, iki sandik ust uste, yesil sise. sag: sandik, mavi sise
    Y.sira(3, ('ksSiseB', -4.5), ('ksSandik', -3.5), ('ksSiseY', -2.5), ('ksSandik', 3.5), ('ksSiseB', 4.5))
    Y.ek('ksSandik', -3.5, 4)
    # direkler: ince direk yerine oyundaki tahta direk (1 genis); yelken kalaslari direge dayanmaz, direk parcasinin USTUNE oturur
    # (direk -> kalas -> kisa direk parcasi (1'lik kalas) -> kalas ...: her yelken tam ortasindan tasinir, iki yani esit)
    m = -1.25
    Y.ek('ksDirek', m, 2.5); Y.ek('ksKalas1', m, 4.5); Y.ek('ksKalas2', m, 5.0); Y.ek('ksKalas1', m, 5.5); Y.ek('ksKalas2', m, 6.0); Y.ek('ksKalas2', m, 6.5); Y.ek('ksKalas1', m, 7.0)
    m = 1.25
    Y.ek('ksDirek', m, 2.5); Y.ek('ksKalas2', m, 4.5); Y.ek('ksKalas2', m, 5.0); Y.ek('ksKalas1', m, 5.5); Y.ek('ksKalas2', m, 6.0); Y.ek('ksKalas1', m, 6.5)
    return Y.bolum(50, r=4.6 * S)

# ---------------- 32 Kale ----------------
def kale():
    Y = Yapi('Kale')
    for sx in (-1, 1):   # iki kule: 2 genis, 5 sira; tek siralar iki kup, cift siralar tek 2'lik tas (resimdeki orgu)
        c = 4.5 * sx
        for r in range(5):
            if r % 2 == 0: Y.sira(r, ('ksTas', c - 0.5), ('ksTas', c + 0.5))
            else: Y.sira(r, ('ksTas2', c))
        Y.ek('ksTas3', c, 5)   # mazgal kusagi (kulenin iki yanina yarim blok tasar)
    Y.sira(6, ('ksTas', -5.5), ('ksTas', -3.5), ('ksTas', 3.5), ('ksTNT', 4.5), ('ksTas', 5.5))   # dislar; sagda TNT
    # orta: kapi kemeri (gercek bosluk) ve iki yanda tas orgu; koyu gomuk taslar duz tasla dolu
    Y.sira(0, ('ksTas2', -2.5), ('ksKemer', 0), ('ksTas2', 2.5))
    Y.sira(1, ('ksTas', -3), ('ksTas', -2), ('ksTas', 2), ('ksTas', 3))
    Y.sira(2, ('ksTas2', -2.5), ('ksTas3', 0), ('ksTas2', 2.5))   # kemerin ustunde kiris: kemere ve yanlardaki orguye oturur
    Y.sira(3, ('ksTas3', -2), ('ksTas', 0), ('ksTas3', 2))
    Y.sira(4, ('ksTas2', -2.5), ('ksTas3', 0), ('ksTas2', 2.5))
    Y.sira(5, ('ksSandikM', -2), ('ksTNT', 0), ('ksSandikK', 2))
    for p in Y.L:
        if p['t'] == 'ksKemer': p['bos'] = 1
    return Y.bolum(56)

# ---------------- 33 Kuru Kafa ----------------
def kafa():
    Y = Yapi('Kuru Kafa')
    W, T = 'oyB', 'ksTas'
    Y.sira(0, ('ksTNT', -4), ('ksTNT', -3), (T, -2), (W, -1), (W, 0), (W, 1), (T, 2), ('ksTNT', 3), ('ksTNT', 4))   # cene + iki yanda TNT
    Y.sira(1, (W, -3), (T, -2), (T, -1), (T, 0), (T, 1), (T, 2), (W, 3))                                       # disler (gomuk tas -> duz tas)
    Y.sira(2, (T, -3), (T, -2), (W, -1), (W, 0), (W, 1), (T, 2), (T, 3))                                       # ust cene
    Y.sira(3, (W, -2), (W, -1), (W, 1), (W, 2))                                                                 # elmacik kemikleri; ortada BURUN (gercek bosluk)
    Y.sira(4, (T, -2), ('ksTas3', 0), (T, 2))                                                                   # burnun ustunde tas kiris (iki yandaki kupe oturur)
    Y.sira(5, (T, -2), (W, 0), (T, 2))                                                                          # iki GOZ (gercek bosluk), ortada burun koku
    Y.sira(6, (W, -2), ('ksTas3', 0), (W, 2))                                                                   # gozlerin ustunde tas kiris (ortadaki kupe oturur)
    Y.sira(7, (T, -2), (W, -1), (W, 0), (W, 1), (T, 2))                                                         # kafa tepesi
    return Y.bolum(20)

# ---------------- 34 Deniz Feneri ----------------
def fener():
    Y = Yapi('Deniz Feneri')
    R, W = 'oyK', 'oyB'
    Y.sira(0, (R, -4), (W, -3), (R, -2), ('ksKemer', 0), (R, 2), (W, 3), (R, 4))
    Y.sira(1, ('ksYildiz', -4), (R, -3), (R, -2), (R, 2), (R, 3), ('ksYildiz', 4))   # yildizlar alttaki tam kupun ustunde
    Y.sira(2, ('ksTas3', -1.5), ('ksTas3', 1.5))                                    # uzun tas tabla (kemerin ve kuplerin ustunde)
    Y.sira(3, (R, -2), (R, -1), (W, 0), (R, 1), (R, 2))
    Y.sira(4, (R, -1.5), (W, -0.5), (W, 0.5), (R, 1.5))
    Y.sira(5, (R, -1), (W, 0), (R, 1))
    Y.sira(6, ('ksBuz', 0))
    Y.sira(7, (R, 0))
    for p in Y.L:
        if p['t'] == 'ksKemer': p['bos'] = 1
    return Y.bolum(50)

# ---------------- 35 Foxi Tilki Basi ----------------
def tilki():
    Y = Yapi('Foxi Tilki Başı')
    O, W, G = 'oyT', 'oyB', 'ksSandikM'   # G: goz (resimdeki koyu kahve goz kupu yok -> en yakin koyu blok: mor sandik; tahta sandik turuncu yuzde secilmiyordu)
    Y.sira(0, (W, -3), (W, -2), (W, -1), (W, 0), (W, 1), (W, 2), (W, 3))   # resimde alt sira 5 kup; uclardaki 2 beyaz kup ustteki kupleri tasiyan dolgu
    Y.sira(1, (W, -3), (W, -2), (W, -1), (O, 0), (W, 1), (W, 2), (W, 3))   # burun: turuncu kup
    Y.sira(2, (O, -3), (O, -2), (G, -1), (O, 0), (G, 1), (O, 2), (O, 3))
    Y.sira(3, *[(O, x) for x in range(-3, 4)])
    Y.sira(4, *[(O, x) for x in range(-3, 4)])
    Y.sira(5, (O, -3), (O, -2), (O, 2), (O, 3))
    Y.sira(6, (O, -3), (O, 3))
    return Y.bolum(52)

# ---------------- 36 Tas Kopru ----------------
def kopru():
    Y = Yapi('Taş Köprü')
    T, T2, T3 = 'ksTas', 'ksTas2', 'ksTas3'
    # kuleler -4.5..-2.5 ve 2.5..4.5; ortada kemer acikligi (gercek bosluk): altta 3 genis 2 yuksek, ustte 1 genis (basamakli kemer)
    Y.sira(0, (T, -4), (T, -3), (T, -2), (T, 2), (T, 3), (T, 4))
    Y.sira(1, (T2, -3.5), (T, -2), (T, 2), (T2, 3.5))
    Y.sira(2, (T, -4), (T3, -2), (T3, 2), (T, 4))          # kemer omuzlari: kuleye ve yan orguye oturur, 1 blok acikliga uzanir
    Y.sira(3, (T2, -3.5), (T, -2), (T3, 0), (T, 2), (T2, 3.5))   # kemer kirisi: iki omuza 1'er blok oturur
    Y.sira(4, (T, -4), (T, -3), (T2, -1.5), (T, 0), (T2, 1.5), (T, 3), (T, 4))
    Y.sira(5, (T2, -3.5), ('ksSiseY', -2), ('ksSiseB', -1), ('ksSiseB', 2), (T2, 3.5))   # kule baslari (ince tas tabla yok -> 2'lik tas), siseler kopru ustunde
    Y.sira(6, ('ksBuz', -4), ('ksBuz', -3), ('ksSandik', 3), ('ksSandik', 4))
    Y.sira(7, ('ksBuz', -3.5), ('ksSandik', 3.5))
    return Y.bolum(60)


# ======== 2. resim seti (18 Kas 2026 aksam, Adem'in iki yeni cizimi: 12 yapi, 37-48). Hepsi 3 sira derinlik. ========
def gemi2():
    Y = Yapi('Mor Bayrakli Gemi')
    Y.sira(0, *[('ksFici', x) for x in range(-3, 4)])                       # resimdeki 3 iri fici -> 7 fici (oyundaki fici 1 genis)
    for x in (-3, 3): Y.ek('ksKalas1', x, 1); Y.ek('ksKalas1', x, 1.5)        # pruva/kic alti
    for x in (-1, 1): Y.ek('ksKalas1', x, 1); Y.ek('ksKalas1', x, 1.5)
    Y.sira(1, ('ksSandik', -2), ('ksTNT', 0), ('ksSandik', 2))
    Y.sira(2, ('ksKalas3', -3), ('ksKalas3', 0), ('ksKalas3', 3))            # pruva ve kic disari tasar (agirlik merkezi destek ustunde)
    Y.sira(2.5, ('oyK', -2), ('ksKalas3', 0), ('oyK', 2))
    Y.sira(3, ('ksSandikM', -1), ('ksKalas1', 0), ('ksSandikM', 1)); Y.ek('ksKalas1', 0, 3.5)
    for x in (-1, 1): Y.ek('ksSandik', x, 4)                                  # kisa direkler (kalas yigini titriyordu -> tahta sandik)
    Y.ek('ksKalas3', 0, 5)                                                     # ust kiris
    Y.ek('ksDirek', 0, 5.5); Y.ek('oyP', 0, 7.5)                         # bayrak diregi + mor bayrak (oyunda bayrak yok -> mor patili kup)
    return Y.bolum(20)

def kule2():
    Y = Yapi('Kırmızı Kubbeli Kapı')
    Y.sira(0, ('oyK', -2), ('ksTas', -1), ('ksTas', 1), ('oyK', 2))          # ortada gercek bosluk (kapi)
    Y.sira(1, ('ksBuz', -2), ('ksTas', -1), ('ksTas', 1), ('ksBuz', 2))
    Y.sira(2, ('ksBuz', -2), ('ksTas3', 0), ('ksBuz', 2))                     # kapinin ustunde tas kiris, iki ayaga oturur
    Y.sira(3, ('ksSandikK', -1), ('oyY', 0), ('ksSandikK', 1))
    Y.sira(4, ('ksBuz', -1), ('oyM', 0), ('ksBuz', 1))
    Y.sira(5, ('oyK', 0)); Y.sira(6, ('oyK', 0))                              # tepe sivri kubbe yok -> kirmizi patili kup
    return Y.bolum(22)

def kale2():
    Y = Yapi('Yıldızlı Kale')
    Y.sira(0, ('ksTas', -3), ('ksSandikM', -2), ('ksKemer', 0), ('ksSandikM', 2), ('ksTas', 3))
    Y.sira(1, ('ksTas2', -2.5), ('ksTas2', 2.5))
    Y.sira(2, ('ksTas', -3), ('ksTas', -2), ('oyT', -1), ('ksTNT', 0), ('oyT', 1), ('ksTas', 2), ('ksTas', 3))
    Y.sira(3, ('ksTas2', -2.5), ('ksTas2', 2.5))
    Y.sira(4, ('ksTas3', -2.5), ('ksTas3', 2.5))                              # mazgal kusagi (yarim blok tasar)
    Y.sira(5, ('ksTas', -3.5), ('ksYildiz', -2.5), ('ksTas', -1.5), ('ksTas', 1.5), ('ksYildiz', 2.5), ('ksTas', 3.5))
    for p in Y.L:
        if p['t'] == 'ksKemer': p['bos'] = 1
    return Y.bolum(26)

def agac():
    Y = Yapi('Renkli Ağaç')
    Y.sira(0, ('ksDirek', -2), ('ksSandikM', -0.5), ('ksSandikM', 0.5), ('ksDirek', 2))
    Y.sira(1, ('ksSandik', -0.5), ('ksSandik', 0.5))                           # dolgu: masanin ortasini tasir
    Y.sira(2, ('ksKalas2', -1.5), ('ksKalas1', 0), ('ksKalas2', 1.5))
    Y.sira(2.5, ('ksKalas2', -1.5), ('ksKalas1', 0), ('ksKalas2', 1.5))
    Y.sira(3, ('oyM', -2), ('ksSandik', -1), ('oyB', 0), ('oyM', 1), ('oyM', 2))     # en sagdaki mavi kup dolgu
    Y.sira(4, ('oyM', -2), ('oyN', -1), ('oyN', 0), ('ksYildiz', 1), ('oyM', 2))
    Y.sira(5, ('oyK', -2), ('ksYildiz', -1), ('oyK', 0), ('oyB', 1), ('oyK', 2))
    Y.sira(6, ('oyY', -1), ('ksTas', 0), ('oyM', 1))
    Y.sira(7, ('oyK', 0))
    return Y.bolum(29)

def tezgah():
    Y = Yapi('Pazar Tezgahı')
    Y.sira(0, ('ksTas2', -2.5), ('ksTas3', 0), ('ksTas2', 2.5))
    Y.sira(1, ('ksTas3', -2), ('ksTas', 0), ('ksTas3', 2))
    Y.sira(2, ('ksDirek', -3), ('ksSiseM', -2), ('ksSiseY', -1), ('ksTNT', 0), ('ksSiseB', 1), ('ksSiseY', 2), ('ksDirek', 3))   # 5. sise: tenteyi tasiyan dolgu
    for y in (3, 3.5): Y.sira(y, ('ksKalas2', -1.5), ('ksKalas1', 0), ('ksKalas2', 1.5))            # tente kirisi: siselere ve direklere oturur
    Y.sira(4, *[('oyK' if x % 2 == 0 else 'oyB', x) for x in range(-3, 4)])                         # kirmizi-beyaz tente
    return Y.bolum(31)

def tac():
    Y = Yapi('Taçlı Kemer')
    Y.sira(0, ('ksBuz', -2), ('ksKemer', 0), ('ksBuz', 2))
    Y.sira(1, ('oyK', -2), ('oyK', 2))
    Y.sira(2, ('ksSandik', -2), ('oyK', -1), ('oyT', 0), ('oyK', 1), ('ksSandik', 2))
    Y.sira(3, ('ksSandik', -2), ('ksSandikM', -1), ('ksSandik', 0), ('ksSandikM', 1), ('ksSandik', 2))
    Y.sira(4, ('ksTas', -1), ('ksYildiz', 0), ('ksTas', 1))
    Y.sira(5, ('oyA', 0))                                                      # altin tac yok -> altin patili kup
    for p in Y.L:
        if p['t'] == 'ksKemer': p['bos'] = 1
    return Y.bolum(20)

def degirmen():
    Y = Yapi('Yel Değirmeni')
    Y.sira(0, ('oyT', -3), ('ksYildiz', -2), ('ksKemer', 0), ('ksYildiz', 2), ('oyK', 3))
    Y.sira(1, ('oyK', -3), ('ksSiseY', -2), ('ksSiseY', 2), ('oyK', 3))
    Y.sira(2, ('ksSandik', -2.5), ('ksTas3', 0), ('ksSandik', 2.5))
    Y.sira(3, ('ksSandik', -2.5), ('ksTas', -1), ('ksTas', 0), ('ksTas', 1), ('ksSandik', 2.5))       # yan sandiklar: kanatlari tasiyan dolgu
    for y in (4, 4.5): Y.sira(y, ('ksKalas2', -2.5), ('ksKalas1', -1), ('ksKalas1', 1), ('ksKalas2', 2.5))   # yatay kanatlar (capraz X kurulamaz -> +)
    Y.sira(4, ('oyK', 0))                                                      # gobek
    Y.ek('ksDirek', 0, 5)                                                      # dik kanat
    for p in Y.L:
        if p['t'] == 'ksKemer': p['bos'] = 1
    return Y.bolum(39)

def roket():
    Y = Yapi('Roket')
    Y.sira(0, *[('oyT', x) for x in range(-2, 3)])                            # alevler -> turuncu patili kup
    Y.sira(1, ('ksTas', -2), ('ksSandik', -1), ('ksSandikM', 0), ('ksSandik', 1), ('ksTas', 2))
    Y.sira(2, ('oyK', -2), ('oyB', -1), ('oyB', 0), ('oyB', 1), ('oyK', 2))
    Y.sira(3, ('oyK', -2), ('oyB', -1), ('oyM', 0), ('oyB', 1), ('oyK', 2))   # pencere -> mavi patili kup
    Y.sira(4, ('oyB', -1), ('oyB', 0), ('oyB', 1))
    Y.sira(5, ('oyK', -1), ('oyK', 0), ('oyK', 1))
    Y.sira(6, ('oyK', -0.5), ('oyK', 0.5))
    Y.sira(7, ('oyK', 0))
    return Y.bolum(31)

def robot():
    Y = Yapi('Taş Robot')
    Y.sira(0, ('ksTas', -3), ('oyK', -2), ('oyK', -1), ('oyK', 1), ('oyK', 2), ('ksTas', 3))   # kollar yerden destekli (dolgu tas)
    Y.sira(1, ('ksTas', -3), ('ksTas2', -1.5), ('ksTas2', 1.5), ('ksTas', 3))
    Y.sira(2, ('ksTas', -3), ('ksTas', -1), ('ksTas', 1), ('ksTas', 3))        # bacaklar arasi gercek bosluk; +-3 yumruklar
    Y.ek('ksKalas3', 0, 3)                                                     # kemer (bel)
    Y.sira(3, ('oyT', -3), ('oyT', 3)); Y.sira(4, ('oyM', -3), ('oyM', 3)); Y.sira(5, ('oyS', -3), ('oyS', 3))   # kol, omuz, kulak
    Y.sira(3.5, ('ksTas', -1), ('ksYildiz', 0), ('ksTas', 1))
    Y.ek('ksTas3', 0, 4.5)
    Y.ek('ksBuz3', 0, 5.5)                                                     # mavi gozluk -> 3'luk buz
    Y.ek('ksTas3', 0, 6.5); Y.ek('oyK', 0, 7.5)
    return Y.bolum(31)

def sandik():
    Y = Yapi('Hazine Sandığı')
    Y.sira(0, ('oyM', -4), ('ksTas3', -2), ('ksTas', 0), ('ksTas3', 2), ('oyM', 4))
    Y.sira(1, ('ksYildiz', -3), ('oyM', -2), ('oyT', 0), ('oyM', 2), ('ksYildiz', 3))
    for x in (-1, 1): Y.ek('ksKalas1', x, 1); Y.ek('ksKalas1', x, 1.5)
    Y.sira(2, ('oyM', -3), ('oyM', 3))
    for x in (-2, 2): Y.ek('ksKalas1', x, 2); Y.ek('ksKalas1', x, 2.5)
    Y.sira(2, ('ksKalas3', 0)); Y.sira(2.5, ('ksKalas3', 0))
    for y in (3, 3.5): Y.sira(y, ('ksKalas3', -2), ('ksKalas1', 0), ('ksKalas3', 2))   # sandik agzi
    for x, t in ((-1.5, 'ksSiseB'), (-0.5, 'ksSiseY'), (0.5, 'ksTNT'), (1.5, 'ksSiseM')): Y.ek(t, x, 4, derin=(0, 1))   # sandigin ici (on 2 sira)
    for y in (4, 4.5): 
        for x, t in ((-2, 'ksKalas3'), (0, 'ksKalas1'), (2, 'ksKalas3')): Y.ek(t, x, y, derin=(-1,))   # arka duvar
    for x, t in ((-2, 'ksKalas3'), (2, 'ksKalas3')): Y.ek(t, x, 5, derin=(-1,)); Y.ek(t, x, 5.5, derin=(-1,))
    Y.ek('ksYildiz', 0, 5, derin=(-1,))                                        # acik kapak: arka sirada dik, ortasinda yildiz
    return Y.bolum(39)

def pagoda():
    Y = Yapi('Mavi Pagoda')
    Y.sira(0, ('oyT', -3), ('oyK', -2), ('ksKemer', 0), ('oyK', 2), ('oyT', 3))
    Y.sira(1, ('ksYildiz', -3), ('ksDirek', -2), ('ksDirek', 2), ('ksYildiz', 3))
    Y.sira(2, ('oyK', -3), ('ksTas3', 0), ('oyK', 3))
    Y.sira(3, ('ksKalas3', -3), ('ksKalas3', 0), ('ksKalas3', 3))             # alt cati kirisi (saçak 1 blok tasar)
    Y.sira(3.5, *[('oyM', x) for x in range(-4, 5)])                           # mavi cati -> mavi patili kup
    Y.sira(4.5, ('oyK', -2), ('ksTas3', 0), ('oyK', 2))
    Y.sira(5.5, ('ksKalas3', -2), ('ksKalas1', 0), ('ksKalas3', 2))
    Y.sira(6, ('oyM', -3), ('oyM', -2), ('oyM', -1), ('oyK', 0), ('oyM', 1), ('oyM', 2), ('oyM', 3))
    Y.sira(7, ('oyM', -1), ('oyM', 0), ('oyM', 1))
    Y.sira(8, ('ksYildiz', 0))
    for p in Y.L:
        if p['t'] == 'ksKemer': p['bos'] = 1
    return Y.bolum(43)

def piramit2():
    Y = Yapi('Renkli Piramit')
    Y.sira(0, ('ksYildiz', -3), ('ksTas', -2), ('ksKemer', 0), ('ksTas', 2), ('ksYildiz', 3))
    Y.sira(1, ('ksSandik', -3), ('ksTas', -2), ('ksTas', 2), ('ksSandik', 3))
    Y.sira(2, ('ksSandik', -3), ('oyT', -2), ('oyM', -1), ('oyN', 0), ('oyN', 1), ('oyT', 2), ('ksSandik', 3))
    Y.sira(3, ('ksSandik', -2.5), ('oyY', -1.5), ('oyB', -0.5), ('oyB', 0.5), ('oyY', 1.5), ('ksSandik', 2.5))
    Y.sira(4, ('ksSandik', -2), ('oyM', -1), ('oyM', 0), ('oyM', 1), ('ksSandik', 2))
    Y.sira(5, ('oyN', -1), ('oyY', 0), ('oyN', 1))
    Y.sira(6, ('oyA', 0))                                                      # tac -> altin patili kup
    for p in Y.L:
        if p['t'] == 'ksKemer': p['bos'] = 1
    return Y.bolum(39)


# ======== 3. resim seti (18 Kas 2026, 20:06): Ucak, Kobra, Taht, Yelkenli Gemi, Kurbaga, Maden Arabasi (49-54) ========
def ucak():
    Y = Yapi('Uçak')
    Y.sira(0, ('ksFici', -3.5), *[('ksSandik', x) for x in (-2.5, -1.5, -0.5, 0.5, 1.5, 2.5)], ('ksFici', 3.5))   # uclardaki fici: kanat ucunu tasiyan dolgu
    Y.sira(1, ('ksFici', -3.5), ('ksFici', -2), ('ksSandik', -1), ('oyS', 0), ('ksSandik', 1), ('ksFici', 2), ('ksFici', 3.5))
    Y.sira(2, ('ksFici', -3.5), ('ksFici', -2), ('ksSandikK', -1), ('ksYildiz', 0), ('ksSandikK', 1), ('ksFici', 2), ('ksFici', 3.5))   # pervane gobegi: yildiz
    Y.sira(3, ('ksKalas3', -2.5), ('oyM', -0.5), ('oyM', 0.5), ('ksKalas3', 2.5))                     # alt kanat
    Y.sira(3.5, ('ksKalas3', -3.5), ('ksKalas1', -1.5), ('ksKalas1', 1.5), ('ksKalas3', 3.5))          # alt kanadin genis kati
    Y.sira(4, ('ksSandikK', -1.5), ('oyM', -0.5), ('oyM', 0.5), ('ksSandikK', 1.5))
    Y.sira(5, ('ksKalas3', -1.5), ('ksKalas3', 1.5))                                                   # ust kanat
    Y.sira(5.5, ('oyS', -0.5), ('oyS', 0.5))                                                           # sari kokpit
    Y.sira(6.5, ('oyM', 0)); Y.ek('ksKalas3', 0, 7.5); Y.ek('ksKalas1', 0, 8); Y.ek('ksKalas1', 0, 8.5)   # kuyruk
    return Y.bolum(70)

def kobra():
    Y = Yapi('Kobra Yılanı')
    Y.sira(0, *[('ksFici' if x < 0 else 'ksFiciK', x) for x in range(-4, 5)])
    Y.sira(1, ('oyY', -3), ('oyY', -2), ('oyY', -1), ('oyY', 0), ('ksTas3', 2))
    Y.sira(2, ('oyS', -2), ('oyS', -1), ('oyS', 0), ('oyY', 1), ('oyY', 2))
    Y.sira(3, ('oyS', 0))                                                       # boyun
    for x in (-1, 1): Y.ek('ksKalas1', x, 3); Y.ek('ksKalas1', x, 3.5)          # bas kalasinin uclarini tasiyan ince tahta destek (tek kupluk boyunda bas sallaniyordu)
    Y.ek('ksKalas3', 0, 4)                                                      # boyunla bas arasindaki kalas (basi ortadan tasir)
    Y.sira(4.5, ('oyY', -1), ('oyS', 0), ('oyY', 1))
    Y.sira(5.5, ('oyT', -1), ('oyT', 0), ('oyT', 1))                            # yelpaze: resimde 5 genis, 1'lik boyun ustunde kenarlari havada kalir -> 3 genis
    Y.sira(6.5, ('ksSandikM', -1), ('oyY', 0), ('ksSandikM', 1))                # gozler: koyu kup yok -> mor sandik
    Y.sira(7.5, ('oyK', 0))
    return Y.bolum(44)

def taht():
    Y = Yapi('Taht ve Hazine')
    Y.sira(0, ('ksTas3', -3), ('ksTas3', 0), ('ksTas3', 3))
    Y.sira(1, *[('ksSandik', x) for x in (-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5)])
    Y.sira(2, ('ksMorSutun', -3.5), ('oyM', -1.5), ('oyM', 1.5), ('ksMorSutun', 3.5))
    for x in (-2.5, 2.5): Y.ek('ksTas', x, 2); Y.ek('ksMorSutun', x, 3); Y.ek('ksKalas1', x, 5)   # ic sutunlar (uc sirada dolu: ustteki yildizi tasir)
    Y.sira(4, ('ksSiseY', -3.5), ('ksSiseM', 3.5))                              # siseler dis sutunlarin tepesinde
    for y in (2, 2.5, 3): Y.ek('ksKalas2', 0, y)                                # tahtin basamaklari
    Y.sira(3, ('oyM', -1.5), ('oyM', 1.5))
    for y in (3.5, 4.5): Y.sira(y, ('ksSandikK', -0.5), ('ksSandikK', 0.5))
    Y.sira(4, ('oyM', -1.5), ('oyM', 1.5)); Y.sira(5, ('ksKalas1', -1.5), ('ksKalas1', 1.5))   # tahtin yanlari
    Y.sira(5.5, *[('ksYildiz', x) for x in range(-2, 3)])
    Y.sira(6.5, ('ksYildiz', -1.5), ('oyM', -0.5), ('oyM', 0.5), ('ksYildiz', 1.5))
    Y.sira(7.5, ('oyA', 0))                                                     # tac -> altin patili kup
    return Y.bolum(33)

def yelkenli():
    Y = Yapi('Yelkenli Gemi')
    Y.sira(0, ('ksFici', -3.5), ('ksFici', -2.5), *[('ksSandikM', x) for x in (-1.5, -0.5, 0.5, 1.5)], ('ksFici', 2.5), ('ksFici', 3.5))   # 3.5: dolgu
    Y.sira(1, *[('ksSandikK', x) for x in (-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5)])
    Y.sira(2, ('ksFici', -3.5), ('ksFici', -2.5), ('ksFici', -1.5), ('ksKalas2', 0), ('ksFici', 1.5), ('ksFici', 2.5), ('ksFici', 3.5))
    Y.sira(3, ('ksKalas3', -2.5), ('ksKalas3', 2.5))                             # kupeste
    Y.sira(3.5, ('ksTNT', -3.5), ('ksTNT', -2.5), ('ksYildiz', -1.5), ('ksYildiz', 1.5), ('ksSandik', 2.5), ('ksSiseY', 3.5))
    m = 0
    Y.ek('ksDirek', m, 2.5)
    for y, t in ((4.5, 'ksKalas3'), (5, 'ksKalas3'), (5.5, 'ksDirek'), (7.5, 'ksKalas3'), (8, 'ksKalas2'), (8.5, 'ksKalas1')):
        Y.ek(t, m, y)                                                           # direk + uc yelken (her yelken ortadan tasinir)
    return Y.bolum(45)

def kurbaga():
    Y = Yapi('Kurbağa')
    Y.sira(0, ('oyY', -4), ('oyS', -3), ('oyS', -2), ('ksFici', -1), ('oyY', 0), ('ksFici', 1), ('oyS', 2), ('oyS', 3), ('oyY', 4))   # 0: bacak arasi dolgu (karin kupunu tasir)
    for y in (1, 2): Y.sira(y, ('oyY', -3), ('oyY', -2), ('oyB', -1), ('oyB', 0), ('oyB', 1), ('oyY', 2), ('oyY', 3))
    Y.sira(3, ('oyY', -2), ('oyB', -1), ('oyB', 0), ('oyB', 1), ('oyY', 2))
    Y.sira(4, *[('oyY', x) for x in range(-2, 3)])
    Y.sira(5, ('oyB', -1.5), ('oyY', 0), ('oyB', 1.5))                          # gozler (beyaz kup)
    return Y.bolum(66)

def maden():
    Y = Yapi('Maden Arabası')
    for t, x in (('ksTas3', -3), ('ksTas3', 0), ('ksTas3', 3)): Y.ek(t, x, 0, km=1)   # ray (tas normal agirlikta: hafif tas ustunde fici tekerlekler titriyordu)
    Y.sira(1, ('ksFici', -3.1), ('ksFici', -1.9), ('ksFici', 1.9), ('ksFici', 3.1))      # tekerlekler (aralarinda bosluk: yan yana silindirler birbirini itiyordu)
    Y.sira(2, ('ksKalas3', -2), ('ksKalas3', 2))
    Y.sira(2.5, ('ksKalas2', -2.5), ('ksKalas3', 0), ('ksKalas2', 2.5))         # araba tabani (iki kat, ortadaki bosluk ustten kapali)
    Y.sira(3, *[('ksSandikK', x) for x in range(-3, 4)])
    Y.sira(4, ('ksKalas3', -2), ('ksKalas1', 0), ('ksKalas3', 2))               # kenar
    Y.sira(4.5, ('ksTNT', -3), ('ksTNT', -2), ('ksYildiz', -1), ('ksYildiz', 0), ('ksBuz', 1), ('ksBuz', 2), ('ksBuz', 3))
    Y.sira(5.5, ('ksTNT', -2.5), ('ksTNT', -1.5), ('ksYildiz', -0.5), ('ksYildiz', 0.5), ('ksYildiz', 1.5), ('ksBuz', 2.5))
    Y.sira(6.5, ('ksTNT', -1), ('ksBuz', 0), ('ksBuz', 1))
    return Y.bolum(44)

import sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); from hareket import ekle   # v8.7 hareketli platformlar
V = {'surum': 2, 'sira': list(range(31, 55)), 'bolumler': {31: gemi(), 32: kale(), 33: kafa(), 34: fener(), 35: tilki(), 36: kopru(),
     37: gemi2(), 38: kule2(), 39: kale2(), 40: agac(), 41: tezgah(), 42: tac(), 43: degirmen(), 44: roket(), 45: robot(), 46: sandik(), 47: pagoda(), 48: piramit2(),
     49: ucak(), 50: kobra(), 51: taht(), 52: yelkenli(), 53: kurbaga(), 54: maden()}}
for _n, _b in V['bolumler'].items(): ekle(int(_n), _b)
json.dump(V, open(OUT, 'w'), ensure_ascii=False, indent=0)
for k, b in V['bolumler'].items(): print(k, b['ad'], len(b['parca']), 'parca, kaide yarim genislik', b['ada'][0]['katlar'][0]['r'])
