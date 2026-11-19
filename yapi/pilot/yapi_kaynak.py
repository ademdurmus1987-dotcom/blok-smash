# Foxi Smash v9.3 (19 Kas 2026, Adem: "boyle kalitesiz sekil istemiyorum, bunlar gibi kaliteli gorunumlu istiyorum"):
# patili kup pikselleri yerine KARISIK BLOKLU MIMARI YAPILAR (uzun kavanoz, dalgali silindir, tas kiris, buz kalas, tugla, kutuk, sise).
# pilot 960+ -> pilot/yapi.json. Ana oyuna BAGLI DEGIL.   python3 yapi/pilot/yapi_kaynak.py
# Parca: (tur, x, y, z, ek)  x,z blok birimi (merkez), y blok birimi (ALT yuz). ek: {'rz': 90} gibi.
import json, os
S = 1.55; G = 1.004
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'yapi.json')
W = {'tas2': 2, 'tas4': 4, 'buzP3': 3, 'raf2': 2, 'raf3': 3, 'tug2': 2, 'tug3': 3, 'ksTas2': 2, 'ksTas3': 3, 'ksTas4': 4, 'ksKalas3': 3, 'ksBuz3': 3, 'ksKalas2': 2, 'cik2': 2, 'kemik': 2, 'ksKemer': 3}
H = {'kvP': 2, 'kvT': 2, 'kvM': 2, 'ahsapD': 2, 'ksDirek': 2, 'ksSutun': 2, 'ksMorSutun': 2, 'raf2': 0.5, 'raf3': 0.5, 'disk': 0.5, 'ksKalas1': 0.5, 'ksKalas2': 0.5, 'ksKalas3': 0.5, 'kur': 0.5, 'mkP': 0.5, 'mkY': 0.5, 'mkM': 0.5, 'ksKemer': 2}

def bolum(ad, P, w=0, kam=None, kaide='mor', top=None):
    out = []
    for n, (t, x, y, z, *ek) in enumerate(P):
        o = {'t': t, 'x': round(x * S * G, 3), 'y': round(y * S + 0.004 * y, 3), 'z': round(z * S * G, 3), 'p': 'ana.0', 'id': '%s%d' % (t, n)}
        if ek: o.update(ek[0])
        if t == 'ksTNT': o['patlama'] = {'r': 4.5, 'guc': 13}
        out.append(o)
    xs = [abs(x) + wd(t) / 2 for t, x, *_ in P]; zs = [abs(z) + 0.5 for _, _, _, z, *__ in P]
    r = max(xs) * S + 0.35; rz = max(zs) * S + 0.35
    kat = {'sekil': 'kare', 'r': round(r, 3), 'rz': round(rz, 3), 'ust': 0, 'kal': 0.75}
    if w: kat = {'sekil': 'kare', 'r': round(max(r, rz), 3), 'ust': 0, 'kal': 0.75}
    b = {'ad': ad, 'top': top or round(len(out) / 2.6 + 6), 'kaide': kaide, 'kam': kam or {'pitch': 6 if not w else 16, 'yaw': 0, 'atis': 0.9, 'genis': 0.92},
         'ada': [{'id': 'ana', 'x': 0, 'z': 0, 'katlar': [kat]}], 'kopru': [], 'parca': out}
    if w: b['hareket'] = {'tip': 'don', 'w': w, 'hemen': 1}; b['hareketTip'] = 'don'
    return b

def duvar(P, z):
    return [(t, x, y, z, *e) for (t, x, y, *e) in P]


def wd(t): return W.get(t) or (int(t[2]) if t[:2] in ('uz', 'kr') else 2 if t[:3] == 'kvB' else 1)
def hg(t): return H.get(t) or (2 if t[:3] in ('kvU', 'kvB') else 3 if t[:3] == 'kvL' else 1)
def ikiz(P, zs=(0, -1)):
    """on duvar listesini derinlik sıralarına cogalt"""
    return [(t, x, y, z, *e) for z in zs for (t, x, y, _z, *e) in P]
YAT = {'rz': 90}   # yatik kavanoz: 2 genis 1 yuksek (alt yuz y - 0.5)
T = {}

# 960 Kavanoz Kalesi: kisa kavanoz duvar, tepede kisa-uzun kavanoz burclari, arkada basamakli kirmizi cubuk piramidi
P = []
for y, des in enumerate(['YYYYYYYYY', 'PPPPYPPPP', 'PPYYYYYPP', 'YYYYYYYYY']):
    for i, c in enumerate(des): P.append(('kj' + c, i - 4, y, 0)); P.append(('kj' + c, i - 4, y, -1))
for i, t in enumerate(['kjP', 'kvUP', 'kjP', 'kvUP', 'kjP', 'kvUP', 'kjP', 'kvUP', 'kjP']):
    P.append((t, i - 4, 4, 0)); P.append(('kjY' if t == 'kjP' else 'kvUY', i - 4, 4, 1)) if False else None
for i in range(9): P.append(('kj' + 'Y', i - 4, 4, -1))
for x in (-3, 0, 3): P.append(('uz3K', x, 5, -1))
for x in (-1.5, 1.5): P.append(('uz3K', x, 6, -1))
P.append(('uz3K', 0, 7, -1)); P.append(('uz1S', 0, 8, -1))
T[960] = bolum('Kavanoz Kalesi', P)

# 961 Buz Rafli Kule: dalgali silindir kose kuleleri, aralarda buz kalas raflar ve turuncu kisa kavanozlar
P = []
for y in range(9):
    for x in (-2, 2): P.append(('dalga', x, y, 0)); P.append(('dalga', x, y, -1))
    if y % 2 == 0: P.append(('buzP3', 0, y, 0)); P.append(('buzP3', 0, y, -1))
    else:
        for x in (-1, 0, 1): P.append(('kjT', x, y, 0))
        P.append(('kjT', 0, y, -1))
for x in (-2, 2): P.append(('tas1', x, 9, 0)); P.append(('tas1', x, 9, -1))
P.append(('uz3M', 0, 9, 0)); P.append(('uz3M', 0, 9, -1))
T[961] = bolum('Buz Raflı Kule', P)

# 962 Silindir Sarayi (3B, doner): dalgali silindir cevre, iki yanda kapi (ustu raf), icinde kavanozlar, koselerde altin tilki kupleri
P = []
for x in range(-2, 3):
    for z in range(-2, 3):
        kenar = abs(x) == 2 or abs(z) == 2
        if not kenar: continue
        kapi = (z == 2 and abs(x) <= 1) or (z == -2 and abs(x) <= 1)
        for y in range(5):
            if kapi and y < 3: continue
            if kapi and y == 3: continue
            P.append(('oyA' if (abs(x) == 2 and abs(z) == 2 and y == 4) else 'dalga', x, y, z))
for z in (2, -2): P.append(('raf3', 0, 3, z)); P.append(('raf3', 0, 3.5, z))
for x in (-1, 0, 1):
    for z in (-1, 0, 1):
        P.append(('kvUY' if (x + z) % 2 == 0 else 'kjT', x, 0, z))
        if (x + z) % 2: P.append(('kjT', x, 1, z))
        P.append(('kjK' if (x + z) % 2 == 0 else 'kjN', x, 2, z))
T[962] = bolum('Silindir Sarayı', P, w=0.3)

# 963 Ikiz Renk Duvari: sol yari mor, sag yari kirmizi uzun cubuklar; aralarinda yatik sari kavanozlar; tepede kavanoz tac
P = []
for (x0, c) in ((-2, 'P'), (2, 'K')):
    for y, tip in enumerate(['uz', 'yat', 'uz', 'uz', 'yat', 'uz']):
        if tip == 'uz': P.append(('uz4' + c, x0, y, 0))
        else: P.append(('uz1' + c, x0 - 1.5, y, 0)); P.append(('kvUS', x0, y - 0.5, 0, YAT)); P.append(('uz1' + c, x0 + 1.5, y, 0))
P = ikiz(P)
for i, t in enumerate(['kjS', 'kvUS', 'kvUS', 'kvUS', 'kvUS', 'kvUS', 'kvUS', 'kjS']):
    P.append((t, i - 3.5, 6, 0)); P.append(('kjS', i - 3.5, 6, -1))
P.append(('uz4P', -2, 7, -1)); P.append(('uz4K', 2, 7, -1))
T[963] = bolum('İkiz Renk Duvarı', P)

# 964 Tas ve Kavanoz Kulesi: koyu mavi tas siralari, aralarinda uzun mavi kavanozlar, altin tilki kupleri
P = []
y = 0
for kat, n in enumerate((7, 7, 6)):
    for i in range(n): P.append(('tas1', i - (n - 1) / 2, y, 0))
    y += 1
    for i in range(n):
        x = i - (n - 1) / 2
        if kat == 1 and i in (0, 3, 6): P.append(('oyA', x, y, 0)); P.append(('tas1', x, y + 1, 0))
        else: P.append(('kvUM', x, y, 0))
    y += 2
for i in range(6): P.append(('tas1', i - 2.5, y, 0))
P = ikiz(P)
T[964] = bolum('Taş ve Kavanoz Kulesi', P)

# 965 Sutunlu Tapinak: altin kupler ustunde gri sutunlar, buz kirisler, uzun turuncu kavanozlar, tepede yildizlar
P = []
for x in (-4, -2, 0, 2, 4): P += [('oyA', x, 0, 0), ('ksSutun', x, 1, 0), ('ksTas', x, 3, 0)]
for x in (-3, 0, 3): P.append(('kr3A', x, 4, 0))
for x in (-4, -2, 0, 2, 4): P.append(('kvUT' if x % 4 else 'kvUM', x, 5, 0))
for x in (-3, -1, 1, 3): P.append(('kjS', x, 5, 0)); P.append(('kjS', x, 6, 0))
for x in (-3, 0, 3): P.append(('kr3A', x, 7, 0))
for x in (-3, 0, 3): P.append(('ksYildiz', x, 8, 0))
P = ikiz(P)
T[965] = bolum('Sütunlu Tapınak', P)

# 966 Kutuk Kosk (3B, doner): kutuk direkler halkasi, raf kirisler, kirmizi kavanozlar ve mavi taslar
P = []
for x in range(-2, 3):
    for z in range(-2, 3):
        if abs(x) == 2 or abs(z) == 2:
            if (x + z) % 2 == 0: P.append(('ahsapD', x, 0, z))
            else: P.append(('kjK', x, 0, z)); P.append(('tas1', x, 1, z))
            if abs(x) == 2 and abs(z) == 2: P.append(('kjK', x, 2, z))
        elif (x, z) == (0, 0): P.append(('kvUN', 0, 0, 0))
        else: P.append(('kjT', x, 0, z)); P.append(('kjS', x, 1, z))
for z in (-2, 2): P.append(('raf3', 0, 2, z))
for x in (-2, 2): P.append(('raf3', x, 2, 0, {'ry': 90}))
for t in (-1, 0, 1):
    for z in (-2, 2): P.append(('kjK', t, 2.5, z))
    for x in (-2, 2): P.append(('tas1', x, 2.5, t))
T[966] = bolum('Kütük Köşk', P, w=0.3)

# 967 Gokkusagi Basamaklari: her kat baska renk uzun cubuk (iki yandan birer blok daralir), basamaklarda pembe kisa kavanozlar, tepede yildiz
P = []
REN = ['K', 'T', 'S', 'Y', 'M']
PAR = {10: (4, 2, 4), 8: (4, 4), 6: (3, 3), 4: (4,), 2: (2,)}
for y, (n, c) in enumerate(zip((10, 8, 6, 4, 2), REN)):
    x = -n / 2
    for w in PAR[n]: P.append(('uz%d%s' % (w, c), x + w / 2, y, 0)); x += w
P = ikiz(P)
for y, n in enumerate((10, 8, 6, 4)):
    for sx in (-1, 1): P.append(('kjN', sx * (n / 2 - 0.5), y + 1, 0))
P.append(('ksYildiz', 0, 5, 0)); P.append(('ksYildiz', 0, 5, -1))
T[967] = bolum('Gökkuşağı Basamakları', P)

# 968 v10.3 Dev Kavanozlar: altta buyuk kavanozlar (2x2), ustunde tugla raf, uzun kavanoz sirasi, tepede tugla ve kisa kavanoz
P = []
for i, c in enumerate('KSYM'): P.append(('kvB' + c, -3 + 2 * i, 0, -0.5))
for z in (0, -1): P += [('uz4P', -2, 2, z), ('uz4T', 2, 2, z)]
for i, c in enumerate('PSKYMTNA'): P.append(('kvL' + c, i - 3.5, 3, 0))
for i, c in enumerate('SPYK'): P.append(('kvU' + c, -3 + 2 * i + 0.5, 3, -1))
P += [('uz4K', -2, 6, 0), ('uz4M', 2, 6, 0), ('uz4K', -2, 6, -1), ('uz4M', 2, 6, -1)]
for i, c in enumerate('TSYP'): P.append(('kj' + c, -1.5 + i, 7, 0))
T[968] = bolum('Dev Kavanozlar', P)

# 989 yeni blok seti sergisi
P = []
for i, c in enumerate('KTSYMP'): P.append(('kvU' + c, i - 2.5, 0, 0))
for i, c in enumerate('KTSYMPNA'): P.append(('kj' + c, i - 3.5, 2, 0))
P += [('uz3K', -3, 3, 0), ('uz2S', -0.5, 3, 0), ('uz3P', 2, 3, 0)]
P += [('kr3A', -1.5, 4, 0), ('dalga', 1, 4, 0), ('dalga', 2, 4, 0), ('uz1Y', 3, 4, 0)]
P += [('uz4M', -2, 5, 0), ('uz4T', 2, 5, 0)]
T[989] = bolum('Yeni Blok Sergisi', P)

# 990 v9.9 sergi: yeni tarzda tas, buz, sandik (ana oyunun turleri)
P = []
P += [('ksTas', -3, 0, 0), ('ksTas2', -0.5, 0, 0), ('ksTas', 2, 0, 0), ('ksSandik', 3, 0, 0)]
P += [('ksBuz', -3, 1, 0), ('ksBuz3', 0, 1, 0), ('ksSandikK', 2, 1, 0), ('ksSandikM', 3, 1, 0)]
P += [('ksTas4', -1.5, 2, 0), ('ksSandik', 1, 2, 0), ('kjS', 2, 2, 0), ('kjK', 3, 2, 0)]
P += [('ksTas3', -2, 3, 0), ('uz3P', 1.5, 3, 0)]
P += [('ksFici', -3, 4, 0), ('ksFiciK', -2, 4, 0), ('ksSutun', 3, 2, 0) if False else ('ksKalas3', -2, 5, 0)]
P += [('ksSutun', 0, 4, 0), ('ksMorSutun', 1, 4, 0)]
T[990] = bolum('Taş Buz Sandık Sergisi', P)

if __name__ == '__main__':
    J = {'surum': 1, 'sira': sorted(T), 'bolumler': T}
    json.dump(J, open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
    for k, b in sorted(T.items()): print(k, b['ad'], len(b['parca']), 'parca', 'top', b['top'])
