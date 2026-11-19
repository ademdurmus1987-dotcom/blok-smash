# Foxi Smash v10.7 (19 Kas 2026, Adem: 'yeni yapilari ana oyuna serpistir'): KARISIK BLOKLU YAPI URETICISI.
# Yeni blok setiyle (tugla, kavanoz, uzun/buyuk kavanoz, kiris, tas, buz, sandik, fici, TNT, kalas, sutun) 7 kalip x renk/boy cesidi.
#   python3 yapi/pilot/karma_kaynak.py   -> yapi/pilot/karma.json (pilot 3000-3xxx). Ana oyundaki yerleri: sira.py (bot olcumuyle).
# Kurallar: her parca altindan tam desteklenir (dengeli, kendiliginden dusmez); simetrik; en cok ~70 parca (telefon).
import json, os, random, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import yapi_kaynak as Y
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'karma.json')
RENK = 'KMSYPTNA'
RAD = {'K': 'Kırmızı', 'M': 'Mavi', 'S': 'Sarı', 'Y': 'Yeşil', 'P': 'Mor', 'T': 'Turuncu', 'N': 'Pembe', 'A': 'Buz Mavisi'}

def bol(W):
    """W genisligi simetrik tugla boylarina boler (ortadan disa)"""
    if W <= 4: return [W]
    yari = []; k = W // 2
    while k > 0:
        b = min(4, k) if k != 5 else 3; yari.append(b); k -= b
    orta = [W % 2] if W % 2 else []
    return yari[::-1] + orta + yari

def tugla_sira(P, W, y, c, zs, x0=0.0):
    x = x0 - W / 2
    for b in bol(W):
        for z in zs: P.append(('uz%d%s' % (b, c), x + b / 2, y, z))
        x += b

def kavanoz_sira(P, W, y, cs, zs, tur='kj', x0=0.0):
    for i in range(W):
        c = cs[i % len(cs)] if tur != 'ayna' else cs[min(i, W - 1 - i) % len(cs)]
        for z in zs: P.append(((tur if tur != 'ayna' else 'kj') + c, x0 - W / 2 + 0.5 + i, y, z))

def ad_renk(c): return RAD[c]

# ---------------- kaliplar ----------------
def k_duvar(r, W, H, cs):
    """tugla ve kavanoz katlari sirayla; tepede kavanoz burclari"""
    P, zs, y = [], (0, -1), 0
    for k in range(H):
        if k % 2 == 0: tugla_sira(P, W, y, cs[k // 2 % len(cs)], zs); y += 1
        else:
            tur = r.choice(['kj', 'kvU']) if k < H - 1 else 'kj'; kavanoz_sira(P, W, y, cs[1:] + cs[:1], zs, 'kj' if tur == 'kj' else 'kvU'); y += 1 if tur == 'kj' else 2
    for x in (-(W / 2) + 0.5, W / 2 - 0.5): P.append(('kvU' + cs[-1], x, y, 0))
    return P, '%s %s Kavanoz Duvarı' % (ad_renk(cs[0]), ad_renk(cs[1]))

def k_tapinak(r, W, H, cs):
    """tugla tabanlar arasinda uzun kavanoz / sutun dizileri, tepede kiris ve kisa kavanoz"""
    P, zs, y = [], (0,), 0
    tugla_sira(P, W, y, cs[0], (0, -1)); y += 1
    for k in range(H):
        kol = r.choice(['kvL', 'kvU', 'ksSutun'])
        h = 3 if kol == 'kvL' else 2
        for i in range(W):
            if kol == 'ksSutun' and i % 2: continue
            if kol == 'ksSutun': P.append(('ksSutun', -W / 2 + 0.5 + i, y, 0)); P.append(('ksSutun', -W / 2 + 0.5 + i, y, -1))
            else:
                for z in (0, -1): P.append((kol + cs[(i + k) % len(cs)], -W / 2 + 0.5 + i, y, z))
        if kol == 'ksSutun' and W % 2 == 0:   # cift genislikte son sutun kenarda
            P.append(('ksSutun', W / 2 - 0.5, y, 0)); P.append(('ksSutun', W / 2 - 0.5, y, -1))
        y += h; tugla_sira(P, W, y, cs[(k + 1) % len(cs)], (0, -1)); y += 1
    n3 = W // 3
    for i in range(n3): P.append(('kr3' + cs[-1], -n3 * 1.5 + 1.5 + i * 3, y, 0))
    for i in range(n3): P.append(('kj' + cs[i % len(cs)], -n3 * 1.5 + 1.5 + i * 3, y + 1, 0))
    return P, '%s Sütunlu Tapınak' % ad_renk(cs[0])

def k_basamak(r, W, H, cs):
    """iki yandan daralan basamaklar; her basamagin ucunda kavanoz"""
    P, y = [], 0
    for k in range(H):
        w = W - 2 * k
        if w < 2: break
        tugla_sira(P, w, y, cs[k % len(cs)], (0, -1)); y += 1
        if k < H - 1 and w - 2 >= 2:
            for sx in (-1, 1): P.append(('kj' + cs[(k + 1) % len(cs)], sx * (w / 2 - 0.5), y, 0))
    if W - 2 * (H - 1) >= 2: P.append(('kvU' + cs[0], 0, y, 0))
    return P, '%s Basamaklar' % ad_renk(cs[0])

def k_dev(r, W, H, cs):
    """altta buyuk kavanozlar (2x2), ustunde tugla raf ve uzun kavanoz sirasi"""
    W = W - W % 2; P, y = [], 0
    for i in range(W // 2): P.append(('kvB' + cs[i % len(cs)], -W / 2 + 1 + 2 * i, y, -0.5))
    y += 2
    for k in range(H):
        tugla_sira(P, W, y, cs[(k + 1) % len(cs)], (0, -1)); y += 1
        tur = 'kvL' if k % 2 == 0 else 'kj'
        kavanoz_sira(P, W, y, cs[k % len(cs):] + cs[:k % len(cs)], (0,) if tur == 'kvL' else (0, -1), tur); y += 3 if tur == 'kvL' else 1
        if tur == 'kvL': kavanoz_sira(P, W, y - 3, cs, (-1,), 'kvL')
    tugla_sira(P, W, y, cs[0], (0, -1))
    return P, '%s Dev Kavanozlar' % ad_renk(cs[0])

def k_kale(r, W, H, cs):
    """tas taban, sandik/fici/buz duvar, ortada TNT, kosede kavanoz burclari, tugla catı"""
    P, y = [], 0
    tas = {1: 'ksTas', 2: 'ksTas2', 3: 'ksTas3', 4: 'ksTas4'}
    x = -W / 2
    for b in bol(W):
        for z in (0, -1): P.append((tas[b], x + b / 2, y, z))
        x += b
    y += 1
    dolgu = r.choice([['ksSandik', 'ksSandikK'], ['ksFici', 'ksFiciK'], ['ksBuz', 'ksSandikM'], ['ksSandik', 'ksFici']])
    for k in range(H):
        for i in range(W):
            m = min(i, W - 1 - i); t = dolgu[(m + k) % 2]
            if k == H // 2 and i in (W // 2 - 1 + W % 2, W // 2) and W > 3: t = 'ksTNT'
            for z in (0, -1): P.append((t, -W / 2 + 0.5 + i, y, z))
        y += 1
    tugla_sira(P, W, y, cs[0], (0, -1)); y += 1
    for sx in (-1, 1): P.append(('kvU' + cs[1], sx * (W / 2 - 0.5), y, 0))
    if W >= 5: P.append(('kj' + cs[-1], 0, y, 0))
    return P, '%s Kale' % ad_renk(cs[0])

def k_raf(r, W, H, cs):
    """kalas raflar: her rafta kavanoz sirasi; raflari uzun kavanoz ya da tugla ayaklar tasir"""
    P, y = [], 0
    for k in range(H):
        kavanoz_sira(P, W, y, cs[k % len(cs):] + cs[:k % len(cs)], (0, -1), 'kj' if k % 2 else 'kvU'); y += 1 if k % 2 else 2
        x = -W / 2
        while x < W / 2 - 0.01:
            b = min(3, round(W / 2 - x)); P.append(('ksKalas%d' % b, x + b / 2, y, 0)); P.append(('ksKalas%d' % b, x + b / 2, y, -1)); x += b
        y += 0.5
    kavanoz_sira(P, W, y, cs, (0,), 'ayna')
    return P, '%s Kavanoz Rafı' % ad_renk(cs[0])

def k_ikiz(r, W, H, cs):
    """iki kule (her biri 2 genis) ve aralarinda tugla kopru; tepede kavanozlar"""
    P, gw = [], max(2, W // 2 - 1)
    for sx in (-1, 1):
        x0 = sx * (W / 2 - gw / 2); y = 0
        for k in range(H):
            if k % 2 == 0: tugla_sira(P, gw, y, cs[0], (0, -1), x0); y += 1
            else: kavanoz_sira(P, gw, y, cs[1:], (0, -1), r.choice(['kj', 'kvU']), x0); y = y + (2 if P[-1][0].startswith('kvU') else 1)
        top_y = y
    # kopru: iki kulenin ustunu birlestiren tugla (uzunluk W, kulelerin ustune oturur)
    ys = {}
    for t, x, yy, z, *e in P:
        h = 2 if t.startswith('kvU') else 1
        side = -1 if x < 0 else 1; ys[side] = max(ys.get(side, 0), yy + h)
    y = min(ys.values())
    if ys[-1] != ys[1]:   # boylar esit degilse alcak tarafi kisa kavanozla tamamla
        lo = -1 if ys[-1] < ys[1] else 1; x0 = lo * (W / 2 - gw / 2)
        while ys[lo] < ys[-lo]: kavanoz_sira(P, gw, ys[lo], cs, (0, -1), 'kj', x0); ys[lo] += 1
        y = ys[1]
    tugla_sira(P, W, y, cs[-1], (0, -1)); y += 1
    kavanoz_sira(P, min(W, 6), y, cs, (0,), 'ayna')
    return P, '%s İkiz Kuleler' % ad_renk(cs[0])

ONEK = ['Liman', 'Mercan', 'Fener', 'Kaptan', 'Korsan', 'Rüzgâr', 'Ada', 'Koy', 'Martı', 'Pusula', 'Dalga', 'Yelken', 'Çapa', 'Hazine', 'Tilki', 'Gün Batımı', 'Şeker', 'Bulut']
KALIP = [('duvar', k_duvar, (6, 10), (3, 6)), ('tapinak', k_tapinak, (6, 9), (1, 2)), ('basamak', k_basamak, (8, 10), (3, 5)), ('dev', k_dev, (6, 8), (1, 2)),
         ('kale', k_kale, (5, 8), (2, 4)), ('raf', k_raf, (5, 8), (2, 4)), ('ikiz', k_ikiz, (7, 10), (3, 6))]

def uret(adet=105, tohum=2026):
    r = random.Random(tohum); T = {}; adlar = set(); n = 3000; deneme = 0
    while len(T) < adet and deneme < adet * 20:
        deneme += 1
        kad, f, (w0, w1), (h0, h1) = KALIP[len(T) % len(KALIP)]
        W, H = r.randint(w0, w1), r.randint(h0, h1)
        cs = r.sample(RENK[:7], 3)
        P, ad = f(r, W, H, cs)
        if len(P) > 72 or len(P) < 12: continue
        if ad in adlar:   # v10.7: ayni ad: yer adi on eki (rastgele sayiyi degistirmez; yapilar ayni kalir)
            for on in ONEK:
                if on + ' ' + ad not in adlar: ad = on + ' ' + ad; break
        adlar.add(ad)
        don = 0.35 if r.random() < 0.18 and W <= 7 else 0
        T[n] = Y.bolum(ad, P, w=don); T[n]['kalip'] = kad; n += 1
    return T

if __name__ == '__main__':
    T = uret()
    json.dump({'surum': 1, 'sira': sorted(T), 'bolumler': T}, open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
    from collections import Counter
    print(len(T), 'yapi', Counter(b['kalip'] for b in T.values()), 'parca en cok', max(len(b['parca']) for b in T.values()))
