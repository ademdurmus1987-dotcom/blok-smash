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
    def ek(s, t, x, y, **kw):
        """t turunu x (blok merkezi) ve y (alt yuz, blok) konumuna koy"""
        s.n += 1; k = round(y * 2)   # kacinci yarim sira (dikey bosluk icin)
        for d in DERIN:
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

V = {'surum': 1, 'sira': [31, 32, 33, 34, 35, 36], 'bolumler': {31: gemi(), 32: kale(), 33: kafa(), 34: fener(), 35: tilki(), 36: kopru()}}
json.dump(V, open(OUT, 'w'), ensure_ascii=False, indent=0)
for k, b in V['bolumler'].items(): print(k, b['ad'], len(b['parca']), 'parca, kaide yarim genislik', b['ada'][0]['katlar'][0]['r'])
