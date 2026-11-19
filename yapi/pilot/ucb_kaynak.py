# Foxi Smash v9.2 (19 Kas 2026, Adem: "platformda duran 3B de yapabilirsin, donen platformda seklin her tarafi farkli gorunur"):
# gercek 3B (voksel) sekiller -> pilot 950+ (pilot/ucb.json). Her parca tek kup; on (z+), sag (x+), arka (z-), sol (x-) yuzler farkli desen.
# Ana oyuna BAGLI DEGIL (sira.py okumaz); Adem begenirse baglanir.   python3 yapi/pilot/ucb_kaynak.py
# Harfler duvar_kaynak.py ile ayni (S tas, C/K/P sandik, T TNT, Y yildiz, I buz, r/w/b/g/p/o/y/v patili kup, A tac, F fici, e/u/m sise).
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from duvar_kaynak import TEK, S, GX, GY
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ucb.json')

def kutu(V, x0, x1, y0, y1, z0, z1, f):
    """[x0..x1] x [y0..y1] x [z0..z1] (dahil) kutusunu doldurur; f(x, y, z) harf dondurur (None: bos)"""
    for x in range(x0, x1 + 1):
        for y in range(y0, y1 + 1):
            for z in range(z0, z1 + 1):
                h = f(x, y, z)
                if h: V[(x, y, z)] = h

def yuz(x, z, R, RZ):
    """kutunun hangi dis yuzunde: 'on', 'arka', 'sag', 'sol', kose ya da ic"""
    on, ar, sa, so = z == RZ, z == -RZ, x == R, x == -R
    if (on or ar) and (sa or so): return 'kose'
    return 'on' if on else 'arka' if ar else 'sag' if sa else 'sol' if so else 'ic'

def satir(desen, x, y, R, ust):
    """desen: ustten alta satirlar; x -R..R soldan saga (bakan kisinin gozunden), y 0 alttan"""
    r = desen[ust - y]; return r[x + R]

def bolum(ad, V, kam_pitch=20, w=0.3):
    # destek: her voksel altinda voksel (yoksa tas dolgu, yere kadar)
    for (x, y, z) in sorted(list(V), key=lambda k: k[1]):
        yy = y - 1
        while yy >= 0 and (x, yy, z) not in V: V[(x, yy, z)] = 'S'; yy -= 1
    out = []; n = 0
    for (x, y, z), h in sorted(V.items(), key=lambda kv: (kv[0][1], kv[0][2], kv[0][0])):
        t = TEK[h]; n += 1
        o = {'t': t, 'x': round(x * S * GX, 3), 'z': round(z * S * GX, 3), 'y': round(y * S + 2 * y * GY, 3), 'p': 'ana.0', 'id': '%s%d' % (t, n)}
        if t == 'ksTas': o['kir'] = 4
        if t in ('ksFici', 'ksFiciK'): o['kutu'] = 1
        if t == 'ksTNT': o['patlama'] = {'r': 4.5, 'guc': 13}
        out.append(o)
    R = max(max(abs(x) for x, _, _ in V), max(abs(z) for _, _, z in V)) * S + S / 2 + 0.3
    return {'ad': ad, 'top': round(len(out) / 2.3 * 1.15 / 3 * 1.6 + 2), 'kaide': 'mor', 'uc_boyut': 1,
            'kam': {'pitch': kam_pitch, 'yaw': 0, 'atis': 0.9, 'genis': 0.9},
            'ada': [{'id': 'ana', 'x': 0, 'z': 0, 'katlar': [{'sekil': 'kare', 'r': round(R, 3), 'ust': 0, 'kal': 0.75}]}], 'kopru': [],
            'hareket': {'tip': 'don', 'w': w, 'hemen': 1}, 'hareketTip': 'don', 'parca': out}

T = []
# 1) Dort yuzlu kale: her duvar baska renk (on gri tas + kirmizi kapi, sag mavi, arka yesil + TNT, sol sari + yildiz), kose kuleleri, ortada tacli kule
V = {}
def kale(x, y, z):
    R = 3; f = yuz(x, z, R, R)
    if f == 'ic':
        if abs(x) <= 1 and abs(z) <= 1: return 'C' if y < 3 else ('Y' if (x, z) != (0, 0) else 'K')
        return None
    if f == 'kose': return 'S' if y < 4 else None
    if y > 2: return None
    if f == 'on': return 'K' if abs(x) <= 1 and y < 2 else 'S'
    if f == 'sag': return 'b' if (z + y) % 2 else 'w'
    if f == 'arka': return 'T' if (x == 0 and y == 1) else 'g'
    if f == 'sol': return 'Y' if (z == 0 and y == 1) else 'y'
kutu(V, -3, 3, 0, 3, -3, 3, kale); V[(0, 4, 0)] = 'A'
for sx in (-3, 3):
    for sz in (-3, 3): V[(sx, 4, sz)] = 'Y' if sz > 0 else 'r'
T.append(('Dört Yüzlü Kale', V))

# 2) Tilki kafasi: onde yuz, yanlarda turuncu kurk, arkada yildizli sandik; kulaklar ve tac
V = {}
ON = ['ooooooo', 'oPoooPo', 'ooooooo', 'wwwPwww', 'wwwwwww', 'owwwwwo']   # ustten alta, y 5..0
def tilki(x, y, z):
    f = yuz(x, z, 3, 2)
    if f == 'on': return satir(ON, x, y, 3, 5)
    if f == 'arka': return 'Y' if (x == 0 and y in (2, 3)) else 'C'
    if f in ('sag', 'sol', 'kose'): return 'w' if y <= 1 else 'o'
    return 'o' if y == 5 else 'C'
kutu(V, -3, 3, 0, 5, -2, 2, tilki)
for sx in (-1, 1):
    for z in (0, 1):
        V[(3 * sx, 6, z)] = 'o'; V[(2 * sx, 6, z)] = 'K' if z == 1 else 'o'; V[(3 * sx, 7, z)] = 'o'
V[(0, 6, 0)] = 'A'
T.append(('Tilki Kafası', V))

# 3) Renkli basamakli piramit: her yuz baska renk (on kirmizi, sag mavi, arka yesil, sol sari), koseler yildiz
V = {}
REN = {'on': 'r', 'sag': 'b', 'arka': 'g', 'sol': 'y', 'kose': 'Y'}
for kat, R in enumerate((3, 2, 1)):
    kutu(V, -R, R, 2 * kat, 2 * kat + 1, -R, R, lambda x, y, z, R=R: REN.get(yuz(x, z, R, R), 'S'))
V[(0, 6, 0)] = 'A'
T.append(('Dört Renkli Piramit', V))

# 4) Yilbasi agaci: hediye kutulari taban, yesil katlar, her yuzde farkli susler, tepede yildiz
V = {}
HED = 'KPCYKPC'
kutu(V, -3, 3, 0, 0, -3, 3, lambda x, y, z: HED[(x + 3 + 2 * (z + 3)) % 7])
SUS = {'on': 'r', 'sag': 'y', 'arka': 'b', 'sol': 'w'}
for y, R in ((1, 3), (2, 3), (3, 2), (4, 2), (5, 1), (6, 1)):
    def agac(x, yy, z, R=R):
        f = yuz(x, z, R, R)
        if f in SUS and (x + z + yy) % 3 == 0: return SUS[f]
        return 'g'
    kutu(V, -R, R, y, y, -R, R, agac)
V[(0, 7, 0)] = 'Y'; V[(0, 8, 0)] = 'A'
T.append(('Yılbaşı Ağacı', V))

# 5) Cati katli ev: onde kapi ve pencereler, yanlarda pencere, arkada baca; catisi on-arka egimli (yandan ucgen gorunur)
V = {}
def ev(x, y, z):
    f = yuz(x, z, 3, 2)
    if f == 'ic': return 'C'
    if f == 'on':
        if x == 0 and y <= 1: return 'P'
        if abs(x) == 2 and y == 1: return 'I'
        return 'K'
    if f in ('sag', 'sol'): return 'I' if (z == 0 and y == 1) else 'K'
    if f == 'arka': return 'I' if (abs(x) == 1 and y == 1) else 'K'
    return 'K'
kutu(V, -3, 3, 0, 2, -2, 2, ev)
for y, Z in ((3, 2), (4, 1), (5, 0)):
    kutu(V, -3, 3, y, y, -Z, Z, lambda x, yy, z: 'v' if abs(z) == Z else 'p')
for y in (4, 5, 6): V[(2, y, -1)] = 'S'
V[(2, 7, -1)] = 'Y'
T.append(('Çatılı Ev', V))

# 6) Deniz feneri: tas taban, kirmizi-beyaz serit govde (arti kesitli), buz isik, tac
V = {}
kutu(V, -3, 3, 0, 0, -3, 3, lambda x, y, z: None if abs(x) == 3 and abs(z) == 3 else ('F' if yuz(x, z, 3, 3) != 'ic' else 'S'))
for y in range(1, 8):
    kutu(V, -2, 2, y, y, -2, 2, lambda x, yy, z: None if abs(x) == 2 and abs(z) == 2 else ('r' if yy % 2 else 'w'))
kutu(V, -1, 1, 8, 8, -1, 1, lambda x, y, z: 'I'); V[(0, 9, 0)] = 'A'
T.append(('Deniz Feneri', V))

if __name__ == '__main__':
    TUM = {}
    for i, (ad, V) in enumerate(T):
        b = bolum(ad, dict(V)); TUM[950 + i] = b
    J = {'surum': 1, 'sira': sorted(TUM), 'bolumler': TUM}
    json.dump(J, open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
    for k, b in TUM.items(): print(k, b['ad'], len(b['parca']), 'parca')
