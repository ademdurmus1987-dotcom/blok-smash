# Foxi Smash PILOT v5.4: pilot bolumlerinin kaynagi. Calistirinca yapi/pilot/pilot.json yazilir (oyun yalniz JSON'u okur).
#   python3 yapi/pilot/pilot_kaynak.py
# Birimler dunya birimi (kup kenari S = 1.55). Yapi merkezi (0, 0, 0) = ana adanin ust yuzunun ortasi. +z kameraya dogru (on).
# ry: dikey eksende donus (derece); 0 iken parcanin genisligi x ekseninde, inceligi z ekseninde.
import json, math, os
S = 1.55
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pilot.json')
r3 = lambda v: round(v, 3)
def P(t, x, z, y=None, p='ana.0', ry=0, id=None, kir=None, **k):
    o = {'t': t, 'x': r3(x), 'z': r3(z), 'p': p}
    if y is not None: o['y'] = r3(y)
    if ry: o['ry'] = r3(ry)
    if id: o['id'] = id
    if kir is not None: o['kir'] = kir
    o.update(k); return o

# ---------------- P1 Basamakli Tapinak ----------------
# On kamera (yaw 0). Basamaklar arkaya yasli (arka kenarlari ayni hizada): her ust kat bir oncekinin arkasinda ve yuksekte,
# boylece her katin kusagi (on + iki yan) ondeki kusagin ustunden gorunur ve vurulabilir. Arka kenar acik: yana/arkaya itilen dusur.
def sira(L, tipler, bas, son, sabit, eksen, ry, p, onek, kir=None, bosluk=0.04):
    """tipler'i bas..son arasina (eksen 'x' ya da 'z') esit bosluklu dizer; sabit: diger eksendeki konum"""
    gen = {'ksTas': S, 'ksTas2': 2 * S, 'ksSandik': S, 'ksSandikM': S, 'ksSandikK': S, 'ksTNT': S}
    top = sum(gen[t[0]] for t in tipler); bos = ((son - bas) - top) / (len(tipler) + 1)
    assert bos >= bosluk - 1e-9, (onek, bos)
    u = bas + bos
    for (t, ad, ek) in tipler:
        c = u + gen[t] / 2; x, z = (c, sabit) if eksen == 'x' else (sabit, c)
        o = P(t, x, z, ry=ry, p=p, id=onek + ad, **({'kir': kir} if kir else {}), **ek); L.append(o); u += gen[t] + bos
def p1():
    # Ortalanmis uc kare kat: her katin onunde ve iki yaninda gorunur basamak kenari (turkuaz ust + bakir kusak)
    a0, a1, a2 = 5.8, 3.87, 1.95          # kat yarim kenarlari (kusak onunde 0.25 gorunur basamak kenari)
    y1, y2 = 1.9, 3.8                     # orta ve ust kat yuzu (alcak kamerada derinlik yukseklikten okunur)
    L = []
    c0 = a1 + 0.12 + S / 2                # alt kusak cizgisi (orta katin duvarindan 0.12)
    # 1) alt kusak: on koselerde uzun tas sutun; on sira ksTas2 / iki kat ksTas / ksTas2; yanlarda ksTas, ksTas2 ve arkada uzun sutun
    for i, sx in enumerate((-1, 1)): L.append(P('ksSutun', sx * c0, c0, id='alt-kose-%d' % i, kir=6, devril=3.0))
    L.append(P('ksTas2', -2.42, c0, id='alt-on-0', kir=4)); L.append(P('ksTas2', 2.42, c0, id='alt-on-2', kir=4))
    L.append(P('ksTas', 0, c0, id='alt-on-1', kir=4))
    for i, x in enumerate((-3.2, 3.2)): L.append(P('ksTas', x, c0, y=S + 0.004, id='alt-on-u%d' % i, kir=4))   # yanlarda ikinci kat: ortada kosk gorunur
    for ad, sx in (('sol', -1), ('sag', 1)):
        L.append(P('ksTas', sx * c0, 2.85, ry=90, id='alt-%s-0' % ad, kir=4))
        L.append(P('ksTas2', sx * c0, 0.5, ry=90, id='alt-%s-1' % ad, kir=4))
    # 2) orta kusak (orta kat; arka kenari kosk katinin hemen arkasinda: arkaya itilen sandik duser, gorunmez kosede kalmaz): koselerde kirmizi sandik, onde sandik + ustunde sandik, mor sandik; yanlarda fici ve sandik.
    #    TNT sag yanda kose sandiginin arkasinda, disa 0.25 tasar: ondan kosesi gorunur.
    c1 = a2 + 0.12 + S / 2
    for i, sx in enumerate((-1, 1)): L.append(P('ksSandikK', sx * c1, c1, p='ana.1', id='orta-kose-%d' % i))
    L.append(P('ksSandik', -0.85, c1, p='ana.1', id='orta-on-0'))
    L.append(P('ksSandikM', 0.85, c1, p='ana.1', id='orta-on-1'))
    L.append(P('ksTNT', c1 + 0.25, 1.15, p='ana.1', id='orta-tnt', patlama={'r': 5.0, 'guc': 12}))
    L.append(P('ksSandikM', c1, -0.75, p='ana.1', id='orta-sag-1'))
    L.append(P('ksSandikM', -c1, 1.15, p='ana.1', id='orta-sol-0')); L.append(P('ksSandikK', -c1, -0.75, p='ana.1', id='orta-sol-1'))
    # 3) tepe koku: dort ince sutun, genis cati, icinde altin patili kup, catida iki mucevher (odak)
    for i, (sx, sz) in enumerate([(1, 1), (-1, 1), (1, -1), (-1, -1)]):
        L.append(P('plSutunK', sx * 1.17, sz * 1.17, p='ana.2', id='kosk-sutun-%d' % i, patlarKir=True))
    L.append(P('oyA', 0, 0, p='ana.2', id='kosk-altin'))
    L.append(P('plCati', 0, 0, y=y2 + 2.6, p='ana.2', id='kosk-cati', patlarKir=True))
    L.append(P('ksYakut', -0.8, 0, y=y2 + 2.6 + 0.48, p='ana.2', id='kosk-yakut'))
    L.append(P('ksElmas', 0.8, 0, y=y2 + 2.6 + 0.48, p='ana.2', id='kosk-elmas'))
    ada = [{'id': 'ana', 'x': 0, 'z': 0, 'katlar': [{'sekil': 'kare', 'r': a0, 'ust': 0, 'kal': 0.75}, {'sekil': 'kare', 'r': a1, 'rz': (a1 + a2 + 0.3) / 2, 'dz': (a1 - a2 - 0.3) / 2, 'ust': y1}, {'sekil': 'kare', 'r': a2, 'ust': y2}]}]
    # 4) dikilitas adalari: on koselerin capraz onunde, alt kattan alcak, iki farkli yukseklikte; kopru alt katin on kenarindan iner
    kopru = []
    for (ad, x, z, y, r) in [('sol', -5.75, 7.15, -0.75, 1.0), ('sag', 5.75, 7.15, -1.4, 1.0)]:
        ada.append({'id': ad, 'x': x, 'z': z, 'katlar': [{'sekil': 'disk', 'r': r, 'ust': y, 'kal': 0.75}]})
        L.append(P('ksSutun', x, z, p=ad + '.0', id=ad + '-dikili', devril=3.0))
        L.append(P('plTepe', x, z, y=y + 2 * S, p=ad + '.0', id=ad + '-tepe'))
        sx = 1 if x > 0 else -1; axx, azz = sx * 5.0, a0 - 0.05; dx, dz = axx - x, azz - z; dl = math.hypot(dx, dz)
        kopru.append({'tip': 'tahta', 'a': [r3(axx), -0.11, r3(azz)], 'b': [r3(x + dx / dl * (r - 0.12)), r3(y - 0.11), r3(z + dz / dl * (r - 0.12))], 'en': 1.0})
    return {'ad': 'Basamaklı Tapınak', 'top': 0, 'kam': {'pitch': 15, 'yaw': 0, 'atis': 0.9, 'genis': 0.94}, 'ada': ada, 'kopru': kopru, 'parca': L}

# ---------------- P7 Tas Cember ----------------
def p7():
    # On yari alcak dikili taslar (3.3), arka yari uzun (4.2): alcak kamerada arka taslar ve lentolari ondekilerin ustunden gorunur.
    rp, L = 3.75, []
    kopru_bos = {(i) for i in (1, 4, 5)}          # 1 ve 5: alcak-uzun gecisi (lento egik olurdu), 4: kirik halka
    jit = [(0.0, 0), (0.05, 3), (-0.05, -4), (0.04, 2), (-0.05, 5), (0.05, -3), (-0.04, 4), (0.03, -2)]
    dik, boy = [], []
    for i in range(8):
        fd = i * 45 + 22.5; f = math.radians(fd); arka = 90 < fd < 270
        r = rp + jit[i][0]; x, z = r * math.sin(f), r * math.cos(f); dik.append((x, z)); boy.append(4.2 if arka else 3.3)
        L.append(P('plMenhirT' if arka else 'plMenhir', x, z, ry=r3(fd + jit[i][1]), id='dikili-%d' % i, merkez=[0, 0]))
    for i in range(8):
        if i in kopru_bos: continue
        (xa, za), (xb, zb) = dik[i], dik[(i + 1) % 8]
        ry = math.degrees(math.atan2(-(zb - za), xb - xa))
        L.append(P('plLento', (xa + xb) / 2, (za + zb) / 2, y=boy[i], ry=r3(ry), id='lento-%d' % i))
    for p in list(L):
        if p.get('id') == 'lento-3': L.append(P('ksElmas', p['x'], p['z'], y=4.2 + 0.55, id='ust-elmas'))
        if p.get('id') == 'lento-0': L.append(P('ksSiseM', p['x'], p['z'], y=3.3 + 0.55, id='ust-sise'))
    # sunak: tas ayaklar + tabla + mucevher/sise; agir bir govde (devrilen dikili tas) carpinca ezilir
    sz = 0.27
    L.append(P('ksTas', -0.85, sz, p='ana.1', id='sunak-ayak-0', ezil=1.2))
    L.append(P('ksTas', 0.85, sz, p='ana.1', id='sunak-ayak-1', ezil=1.2))
    ys = 0.45 + S
    L.append(P('plSunak', 0, sz, y=ys, p='ana.1', id='sunak-tabla', ezil=0.8))
    L.append(P('ksYakut', -0.75, sz, y=ys + 0.4, p='ana.1', id='sunak-yakut'))
    L.append(P('ksSiseB', 0.75, sz, y=ys + 0.4, p='ana.1', id='sunak-sise'))
    # topuk tasi: sol onde kucuk alcak ada (halkanin onune binmez)
    hx, hz, hy = -5.0, 5.0, -1.3
    L.append(P('plMenhirK', hx, hz, p='topuk.0', ry=18, id='topuk-tas'))
    L.append(P('ksYakut', hx, hz, y=hy + 2.5, p='topuk.0', id='topuk-yakut'))
    ada = [{'id': 'ana', 'x': 0, 'z': 0, 'katlar': [{'sekil': 'disk', 'r': 5.0, 'ust': 0, 'kal': 0.75}, {'sekil': 'disk', 'r': 2.3, 'ust': 0.45}]},
           {'id': 'topuk', 'x': hx, 'z': hz, 'katlar': [{'sekil': 'disk', 'r': 0.95, 'ust': hy, 'kal': 0.75}]}]
    return {'ad': 'Taş Çember', 'top': 0, 'kam': {'pitch': 16, 'yaw': 0, 'atis': 0.75, 'genis': 0.92}, 'ada': ada, 'kopru': [], 'parca': L}

# ---------------- P13 Capraz Domino ----------------
def p13():
    r = 4.8                               # eskenar (45 derece donuk kare) yarim kenar
    e = (math.sqrt(0.5), -math.sqrt(0.5)); n = (math.sqrt(0.5), math.sqrt(0.5))   # e: on-sol -> arka-sag, n: ona dik
    u0, u1, A = -4.2, 4.2, 0.95
    def yol(u): v = -A * math.sin(2 * math.pi * (u - u0) / (u1 - u0)); return (u * e[0] + v * n[0], u * e[1] + v * n[1])
    adim, pts = 0.98, []
    ince = [u0 + (u1 - u0) * i / 3000 for i in range(3001)]
    acc, prev = 0, yol(u0); pts.append((u0, prev))
    for uu in ince[1:]:
        q = yol(uu); acc += math.dist(q, prev); prev = q
        if acc >= adim: pts.append((uu, q)); acc = 0
    L = []
    for i, (uu, (x, z)) in enumerate(pts):
        a, b = yol(uu - 0.01), yol(uu + 0.01)
        L.append(P('plDomino', x, z, ry=r3(math.degrees(math.atan2(b[0] - a[0], b[1] - a[1]))), id='domino-%02d' % i))
    # yuksek altigen kule adasi: zincirin sonunun arkasinda (genisligi artirmaz), TNT kopru basinda, arkasinda karisik kule
    son = pts[-1][1]; d = (0.45, -0.893); pp = (0.893, 0.45); hy, hr = 1.7, 2.4
    tx, tz = son[0] + d[0] * 2.3, son[1] + d[1] * 2.3; ry = r3(math.degrees(math.atan2(d[0], d[1])))
    hx, hz = tx + d[0] * 1.2, tz + d[1] * 1.2
    L.append(P('ksTNT', tx, tz, p='kule.0', ry=ry, id='kule-tnt', patlama={'r': 4.6, 'guc': 12}))
    kx, kz = hx + d[0] * 0.55, hz + d[1] * 0.55; yy = hy
    L.append(P('ksTas2', kx, kz, p='kule.0', ry=ry, id='kule-tas'))
    yy += S
    for t, q in (('ksSandik', -0.8), ('ksSandikM', 0.8)): L.append(P(t, kx + pp[0] * q, kz + pp[1] * q, y=yy, p='kule.0', ry=ry, id='kule-' + t))
    yy += S
    L.append(P('ksKalas3', kx, kz, y=yy, p='kule.0', ry=ry, id='kule-kalas'))
    yy += S / 2
    for t, q in (('ksYakut', -1.56), ('ksYildiz', 0), ('ksElmas', 1.56)): L.append(P(t, kx + pp[0] * q, kz + pp[1] * q, y=yy, p='kule.0', ry=ry, id='kule-' + t))
    yy += S
    L.append(P('ksSiseM', kx, kz, y=yy, p='kule.0', id='kule-sise'))
    # yemler: yolun iki yaninda, yolu kapatmadan
    L.append(P('ksFici', 2.9, 2.6, id='yem-fici-0')); L.append(P('ksSiseB', 3.9, 1.3, id='yem-sise-2'))
    L.append(P('ksSiseM', -4.3, -0.6, id='yem-sise-0')); L.append(P('ksSiseY', -3.4, -2.0, id='yem-sise-1'))
    ada = [{'id': 'ana', 'x': 0, 'z': 0, 'katlar': [{'sekil': 'eskenar', 'r': r, 'ust': 0, 'kal': 1.1}]},
           {'id': 'kule', 'x': r3(hx), 'z': r3(hz), 'katlar': [{'sekil': 'cokgen', 'n': 6, 'r': hr, 'don': 0, 'ust': hy, 'kal': 0.9}]}]
    # tas kopru: eskenarin kenarindan adanin yakin kenarina, zincirin solunda
    kn = -1.25; ax0, az0 = son[0] + pp[0] * kn, son[1] + pp[1] * kn
    a = [r3(ax0 + d[0] * 0.55), -0.21, r3(az0 + d[1] * 0.55)]
    b = [r3(hx - d[0] * 1.9 + pp[0] * kn * 0.75), r3(hy - 0.21), r3(hz - d[1] * 1.9 + pp[1] * kn * 0.75)]
    return {'ad': 'Çapraz Domino', 'top': 0, 'kam': {'pitch': 16, 'yaw': 0, 'atis': 0.6, 'genis': 0.93}, 'ada': ada, 'kopru': [{'tip': 'tas', 'a': a, 'b': b, 'en': 1.1}], 'parca': L}

# ---------------- P21 Buz Sarayi (Fable, 16 Kas: Adem'in ornek dizilimlerine gore: tek yuvarlak kaide, siki ve iri yapi, onden gorunum) ----------------
def p21():
    L = []; G = 0.004
    def Y(k): return k * (S + G)
    n = [0]
    def ek(t, i, k, kat, **kw):
        n[0] += 1; L.append(P(t, i * S, k * S, y=Y(kat), id='s%d' % n[0], **kw))
    # 1) cevre sutunlari (2 kat boyunda): onde kapi boslugu (0, 2)
    for (i, k) in [(-2, 2), (-1, 2), (1, 2), (2, 2), (-2, 0), (2, 0), (-2, -2), (0, -2), (2, -2)]: ek('ksSutun', i, k, 0, devril=3.0)
    # 2) ic dolgu 3x3x2: altta buz + ortada TNT, ustte sandik koseler + buz + altin
    for i in (-1, 0, 1):
        for k in (-1, 0, 1):
            ek('ksTNT' if (i, k) == (0, 0) else 'ksBuz', i, k, 0)
            ek('oyA' if (i, k) == (0, 0) else ('ksSandik' if i and k else 'ksBuz'), i, k, 1)
    # 3) buz cati (kat 2): ortada x boyunca 5 uzun buz, yanlarda z boyunca uzun buz, koselerde kup
    for k in (-2, -1, 0, 1, 2): ek('ksBuz3', 0, k, 2)
    for i in (-2, 2):
        ek('ksBuz3', i, 0, 2, ry=90)
        for k in (-2, 2): ek('ksBuz', i, k, 2)
    # 4) ust kosk (kat 3-4): koselerde tahta direk, kenarlarda ve ortada buz
    for i in (-1, 0, 1):
        for k in (-1, 0, 1):
            if i and k: ek('ksDirek', i, k, 3)
            else: ek('ksBuz', i, k, 3); ek('ksBuz', i, k, 4)
    # 5) tepe: uc uzun buz, ustunde kup ve elmas
    for k in (-1, 0, 1): ek('ksBuz3', 0, k, 5)
    ek('ksBuz', 0, 0, 6); ek('ksElmas', 0, 0, 7)
    ada = [{'id': 'ana', 'x': 0, 'z': 0, 'katlar': [{'sekil': 'kare', 'r': 4.15, 'ust': 0, 'kal': 0.75}]}]
    return {'ad': 'Buz Sarayı', 'top': 0, 'kam': {'pitch': 1, 'yaw': 0, 'atis': 0.9, 'genis': 0.95}, 'ada': ada, 'kopru': [], 'parca': L}

# ---------------- P22 Oyuncak Kale (17 Kas: Blender'da uretilen 5 deneme blogu: patili kup, uzun kalas, kavanoz, tas levha, sutun) ----------------
# Tek kare kaide, 5 genis x 3 derin, simetrik. On ve arka sira ayni (A), orta sira (B) kuplerle dolu.
def p22():
    L = []; G = 0.004; n = [0]
    def Y(k): return k * (S + G)
    def ek(t, i, k, kat, **kw):
        n[0] += 1; L.append(P(t, i * S, k * S, y=Y(kat), id='s%d' % n[0], **kw))
    KUP = ('plKupK', 'plKupY', 'plKupM')
    def kup(i, k, kat, r): ek(KUP[r % 3], i, k, kat)
    for k in (1, -1):                                   # A: on ve arka sira
        for i in (-2, 2): ek('plSutun', i, k, 0, devril=3.0)
        ek('plKalas', 0, k, 0)
        kup(-1, k, 1, 0); ek('plKavanozT', 0, k, 1); kup(1, k, 1, 0)
        ek('plLevha', -1.5, k, 2); kup(0, k, 2, 1); ek('plLevha', 1.5, k, 2)
        ek('plKavanozM', -2, k, 3); ek('plKalas', 0, k, 3); ek('plKavanozM', 2, k, 3)
        ek('plSutun', -1, k, 4, devril=3.0); kup(0, k, 4, 2); ek('plSutun', 1, k, 4, devril=3.0)
        ek('plKavanozT', 0, k, 5)
        ek('plKalas', 0, k, 6)
    # B: orta sira
    kup(-2, 0, 0, 2); ek('plKalas', 0, 0, 0); kup(2, 0, 0, 2)
    for i in (-2, -1, 0, 1, 2): kup(i, 0, 1, abs(i) + 1)
    ek('plLevha', -1.5, 0, 2); kup(0, 0, 2, 0); ek('plLevha', 1.5, 0, 2)
    ek('plKalas', 0, 0, 3)
    for i in (-1, 0, 1): kup(i, 0, 4, abs(i)); kup(i, 0, 5, abs(i) + 1)
    ek('plKalas', 0, 0, 6)
    # tepe: ortada tas levha, ustunde kavanoz
    ek('plLevha', 0, 0, 7); ek('plKavanozM', 0, 0, 8)
    ada = [{'id': 'ana', 'x': 0, 'z': 0, 'katlar': [{'sekil': 'kare', 'r': 4.15, 'ust': 0, 'kal': 0.75}]}]
    return {'ad': 'Oyuncak Kale', 'top': 0, 'kam': {'pitch': 1, 'yaw': 0, 'atis': 0.9, 'genis': 0.95}, 'ada': ada, 'kopru': [], 'parca': L}

TOP = {1: 16, 7: 15, 13: 12, 21: 24, 22: 24}   # top sayilari (pilot_test bot sonucuna gore ayarlandi; bkz. yapi/pilot_isleri.md)
B = {1: p1(), 7: p7(), 13: p13(), 21: p21(), 22: p22()}
for k, v in B.items(): v['top'] = TOP[k]
json.dump({'surum': 2, 'bolumler': B}, open(OUT, 'w', encoding='utf-8', newline=chr(10)), ensure_ascii=False, indent=1)   # Windows'ta da UTF-8 ve LF (Turkce harfler bozulmasin)
print('yazildi', OUT, {k: len(v['parca']) for k, v in B.items()})
