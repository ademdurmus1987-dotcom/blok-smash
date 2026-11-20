# Foxi Smash v10.16 (Adem 20 Kas 2026: 'ogretici bolumler, ilk bolumler can alici olmali, tatmin etmeli'): ILK 5 BOLUM.
# Her biri tek bir sey ogretir ve ilk iyi atista buyuk bir yikim verir. 'ipucu': ilk oynayista elin gosterdigi parca ve yazi.
#   python3 yapi/pilot/ogretici_kaynak.py -> yapi/pilot/ogretici.json (pilot 2900-2904). Ana oyundaki yeri: sira.py (bolum 1-5).
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import yapi_kaynak as Y
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ogretici.json')
T = {}

def sira(P, tur, W, y, zs=(0, -1), cs='K', x0=0.0):
    for i in range(W):
        for z in zs: P.append((tur + cs[i % len(cs)], x0 - W / 2 + 0.5 + i, y, z))
def tugla(P, W, y, c, zs=(0, -1), x0=0.0):
    x = x0 - W / 2
    for b in Y_bol(W):
        for z in zs: P.append(('uz%d%s' % (b, c), x + b / 2, y, z))
        x += b
def Y_bol(W):
    out = []
    while W > 0: b = min(4, W) if W != 5 else 3; out.append(b); W -= b
    return out

def bolum(no, ad, P, ipucu, yazi, top=None, **k):
    b = Y.bolum(ad, P, top=top, **k)
    # ipucu parcasinin kimligi: yapi_kaynak id = tur + sira no
    t = P[ipucu][0]; b['ipucu'] = {'id': '%s%d' % (t, ipucu), 'yazi': yazi}
    T[no] = b

# 1) Ilk Atis: ince yuksek kavanoz kulesi. En alttaki kavanoz kirilinca ustundeki her sey devrilir.
P = []
sira(P, 'kj', 2, 0, cs='SY')            # 0..3: en alt kisa kavanozlar (hedef: on soldaki)
tugla(P, 2, 1, 'P')
sira(P, 'kvU', 2, 2, cs='KM')
tugla(P, 2, 4, 'T')
sira(P, 'kvU', 2, 5, cs='NA')
tugla(P, 2, 7, 'Y')
sira(P, 'kj', 2, 8, cs='SK')
bolum(2900, 'İlk Atış', P, 0, 'En alttaki kavanoza dokun!', top=10)

# 2) Ikiz Kavanoz Kuleleri: iki dar yuksek kavanoz kulesi, tepede kopru ve kavanozlar. Bir kulenin tabani kirilinca kule devrilir, kopruyu ve otekini ceker.
P = []
for x0, cs in ((-1.6, 'SYKMNA'), (1.6, 'MKYSAN')):
    sira(P, 'kj', 2, 0, cs=cs[0:2], x0=x0)
    tugla(P, 2, 1, 'P', x0=x0)
    sira(P, 'kvU', 2, 2, cs=cs[2:4], x0=x0)
    tugla(P, 2, 4, 'T', x0=x0)
    sira(P, 'kvU', 2, 5, cs=cs[4:6], x0=x0)
for z in (0, -1): P.append(('uz4K', 0, 7, z))
sira(P, 'kj', 4, 8, cs='SYMN')
bolum(2901, 'İkiz Kavanoz Kuleleri', P, 0, 'Kavanozlar kırılır. Alttan vur!', top=10)

# 3) TNT Koprusu: iki tas ayak, ustunde tugla kopru, koprunun ortasinda TNT, cevresinde sandiklar ve kavanozlar.
P = []
for x in (-2.5, 2.5):
    for y in range(3):
        for z in (0, -1): P.append(('ksTas', x, y, z))
tugla(P, 6, 3, 'K')
P.append(('ksTNT', 0, 4, 0))
TNT = len(P) - 1
for x in (-1, 1, -2, 2): P.append(('ksSandik', x, 4, 0))
for x in (-2.5, -1.5, -0.5, 0.5, 1.5, 2.5): P.append(('ksSandikK', x, 4, -1))
sira(P, 'kj', 6, 5, cs='SYMP')
bolum(2902, 'TNT Köprüsü', P, TNT, 'TNT\'ye vur, hepsi patlasın!', top=12)

# 4) Buz Kalesi: kaygan buz bloklari tasiyici alt sirada; vurulan buz catlar ve kayar, ikinci vurusta kirilir; ustundekiler coker.
P = []
for x in (-2, -1, 0, 1, 2): P.append(('ksBuz', x, 0, 0))
BUZ = 2   # ortadaki buz
tugla(P, 5, 1, 'M', zs=(0,))
for i, x in enumerate((-2, 0, 2)): P.append(('kvU' + 'KSY'[i], x, 2, 0))
for x in (-1, 1): P.append(('kj' + 'PN'[x > 0], x, 2, 0))
tugla(P, 5, 4, 'P', zs=(0,))
for x in (-1.5, 0, 1.5): P.append(('ksBuz', x, 5, 0))
P.append(('uz4T', 0, 6, 0))
bolum(2903, 'Buz Kalesi', P, BUZ, 'Buz sağlamdır: aynı yere iki kez vur!', top=14)

# 5) Buyuk Yikim: tas taban, ortada TNT, iki yanda kavanoz kuleleri, tepede dev kavanozlar. Ilk 'zor' bolum.
P = []
for x in (-3, -1, 1, 3):
    for z in (0, -1): P.append(('ksTas2', x, 0, z))
sira(P, 'kj', 8, 1, cs='KSYM')
P.append(('ksTNT', -0.5, 2, 0)); TNT5 = len(P) - 1; P.append(('ksTNT', 0.5, 2, 0))
for x in (-3.5, -2.5, -1.5, 1.5, 2.5, 3.5): P.append(('ksSandik', x, 2, 0))
for x in (-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5): P.append(('ksSandikM', x, 2, -1))
tugla(P, 8, 3, 'T')
for i, c in enumerate('PNKA'): P.append(('kvB' + c, -3 + 2 * i, 4, -0.5))
tugla(P, 8, 6, 'P')
sira(P, 'kvU', 8, 7, zs=(0,), cs='SYMKTN')
bolum(2904, 'Büyük Yıkım', P, TNT5, 'Ortadaki TNT\'yi patlat!', top=16)

if __name__ == '__main__':
    json.dump({'surum': 1, 'sira': sorted(T), 'bolumler': T}, open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
    for k, b in sorted(T.items()): print(k, b['ad'], len(b['parca']), 'parca, ipucu', b['ipucu'])
