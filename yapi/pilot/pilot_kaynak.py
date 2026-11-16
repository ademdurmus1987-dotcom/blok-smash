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
    a0x, a0z = 5.6, 4.6                   # alt kat yarim genislik/derinlik (merkez 0)
    a1x, a1z, d1 = 3.8, 3.0, -1.6         # orta kat (arka kenari alt katla ayni: -4.6)
    a2, d2 = 1.75, -2.85                  # ust kat (kare, arka kenar -4.6)
    y1, y2 = 1.1, 2.3                     # kat ust yuzleri: basamak duvari kusaktan (1.55) alcak, arkadaki kusaklar ustten gorunur
    L = []
    # 1) alt kusak: on sira + iki yan; on koselerde tas sutun
    zf = d1 + a1z + 0.12 + S / 2          # on sira merkez cizgisi
    xs = a1x + 0.12 + S / 2               # yan siralar
    for i, sx in enumerate((1, -1)): L.append(P('ksSutun', sx * xs, zf, id='alt-kose-%d' % i, kir=6, devril=3.0))
    sira(L, [('ksTas2', '0', {}), ('ksTas', '1', {}), ('ksTas2', '2', {})], -xs + 0.73, xs - 0.73, zf, 'x', 0, 'ana.0', 'alt-on-', kir=4)
    for ad, sx in (('sag', 1), ('sol', -1)):
        sira(L, [('ksTas2', '0', {}), ('ksTas', '1', {})], -a0z + 0.1, zf - 0.73, sx * xs, 'z', 90, 'ana.0', 'alt-%s-' % ad, kir=4)
    # 2) orta kusak: sandiklar (on sira + iki yan), TNT sag yanda kose sandiginin arkasinda (ondan bakinca gizli)
    zf1 = d2 + a2 + 0.12 + S / 2; xs1 = a2 + 0.12 + S / 2
    sira(L, [('ksSandik', '0', {}), ('ksSandikM', '1', {}), ('ksSandik', '2', {}), ('ksSandikK', '3', {})], -xs1 - S / 2 - 0.1, xs1 + S / 2 + 0.1, zf1, 'x', 0, 'ana.1', 'orta-on-')
    sira(L, [('ksTNT', 'tnt', {'patlama': {'r': 4.6, 'guc': 12}}), ('ksSandikM', '1', {})], -a1z + d1 + 0.1, zf1 - S / 2 - 0.1, xs1 + 0.0, 'z', 0, 'ana.1', 'orta-sag-')
    sira(L, [('ksSandikK', '0', {}), ('ksSandik', '1', {})], -a1z + d1 + 0.1, zf1 - S / 2 - 0.1, -xs1, 'z', 0, 'ana.1', 'orta-sol-')
    for o in L:
        if o.get('id') == 'orta-sag-tnt': o['id'] = 'orta-tnt'
    # 3) tepe kosku
    for i, (sx, sz) in enumerate([(1, 1), (-1, 1), (1, -1), (-1, -1)]):
        L.append(P('plSutunK', sx * 1.05, d2 + sz * 1.05, p='ana.2', id='kosk-sutun-%d' % i, patlarKir=True))
    L.append(P('oyA', 0, d2, p='ana.2', id='kosk-altin'))
    L.append(P('plCati', 0, d2, y=y2 + 2.0, p='ana.2', id='kosk-cati', patlarKir=True))
    L.append(P('ksYakut', -0.76, d2, y=y2 + 2.42, p='ana.2', id='kosk-yakut'))
    L.append(P('ksElmas', 0.76, d2, y=y2 + 2.42, p='ana.2', id='kosk-elmas'))
    ada = [{'id': 'ana', 'x': 0, 'z': 0, 'katlar': [{'sekil': 'kare', 'r': a0x, 'rz': a0z, 'ust': 0, 'kal': 0.75},
                                                   {'sekil': 'kare', 'r': a1x, 'rz': a1z, 'dz': d1, 'ust': y1},
                                                   {'sekil': 'kare', 'r': a2, 'rz': a2, 'dz': d2, 'ust': y2}]}]
    # 4) yan adalar: iki yanda neredeyse simetrik, farkli yukseklikte; tahta kopru alt katin yan kenarindan iner
    kopru = []
    # on koselerin capraz onunde, farkli yukseklikte iki ada; kopru alt katin on kenarindan adaya iner
    for (ad, x, z, y, r) in [('sol', -6.5, 6.5, -0.8, 1.15), ('sag', 6.5, 6.2, -1.6, 1.15)]:
        ada.append({'id': ad, 'x': x, 'z': z, 'katlar': [{'sekil': 'disk', 'r': r, 'ust': y, 'kal': 0.75}]})
        L.append(P('ksSutun', x, z, p=ad + '.0', id=ad + '-dikili', devril=3.0))
        L.append(P('plTepe', x, z, y=y + 2 * S, p=ad + '.0', id=ad + '-tepe'))
        sx = 1 if x > 0 else -1; axx, azz = sx * 5.0, a0z - 0.05; dx, dz = axx - x, azz - z; dl = math.hypot(dx, dz)
        kopru.append({'tip': 'tahta', 'a': [r3(axx), -0.11, r3(azz)], 'b': [r3(x + dx / dl * (r - 0.12)), r3(y - 0.11), r3(z + dz / dl * (r - 0.12))], 'en': 1.0})
    return {'ad': 'Basamaklı Tapınak', 'top': 0, 'kam': {'pitch': 25, 'yaw': 0, 'atis': 0.9, 'genis': 0.8}, 'ada': ada, 'kopru': kopru, 'parca': L}

# ---------------- P7 Tas Cember ----------------
def p7():
    rp, L = 3.75, []
    acik = {3, 5}                         # arka ve sol bosluk acik (kirik halka); on bosluk (7: dikili 7 ile 0 arasi) lentolu, altindan sunak gorunur                         # kopru olmayan bosluklar: duzensiz, kirik halka
    jit = [(0.0, 0), (0.06, 3), (-0.05, -4), (0.04, 2), (-0.06, 5), (0.05, -3), (-0.04, 4), (0.03, -2)]
    dik = []
    for i in range(8):
        f = math.radians(i * 45 + 22.5)
        r = rp + jit[i][0]; x, z = r * math.sin(f), r * math.cos(f)
        dik.append((x, z))
        L.append(P('plMenhir', x, z, ry=r3(i * 45 + 22.5 + jit[i][1]), id='dikili-%d' % i, merkez=[0, 0]))
    for i in range(8):
        if i in acik: continue
        (xa, za), (xb, zb) = dik[i], dik[(i + 1) % 8]
        mx, mz = (xa + xb) / 2, (za + zb) / 2
        ry = math.degrees(math.atan2(-(zb - za), xb - xa))   # yerel x kirise paralel
        L.append(P('plLento', mx, mz, y=3.3, ry=r3(ry), id='lento-%d' % i))
    # sunak (yukseltilmis yuvarlak kaide ustunde): iki kisa tas blok + tabla + mucevher ve sise
    sz = 0.27                             # sunak kaidenin ortasindan biraz onde: on dikili tas ice devrilince tablaya carpar
    L.append(P('ksTas', -0.85, sz, p='ana.1', id='sunak-ayak-0'))
    L.append(P('ksTas', 0.85, sz, p='ana.1', id='sunak-ayak-1'))
    ys = 0.45 + S
    L.append(P('plSunak', 0, sz, y=ys, p='ana.1', id='sunak-tabla'))
    L.append(P('ksYakut', -0.75, sz, y=ys + 0.4, p='ana.1', id='sunak-yakut'))
    L.append(P('ksSiseB', 0.75, sz, y=ys + 0.4, p='ana.1', id='sunak-sise'))
    # halkanin icinde yer yok (kaide ile dikili taslar arasi 1.4): mucevher ve sise iki lentonun ustunde; lento dusunce onlar da duser
    for p in list(L):
        if p.get('id') == 'lento-4': L.append(P('ksElmas', p['x'], p['z'], y=3.3 + 0.55, id='ust-elmas'))
        if p.get('id') == 'lento-1': L.append(P('ksSiseM', p['x'], p['z'], y=3.3 + 0.55, id='ust-sise'))
    # onde ayri alcak ada: topuk tasi ve ustunde mucevher
    hx, hz, hy = 4.6, 5.9, -1.1
    L.append(P('plMenhirK', hx, hz, p='topuk.0', ry=18, id='topuk-tas'))
    L.append(P('ksYakut', hx, hz, y=hy + 2.5, p='topuk.0', id='topuk-yakut'))
    ada = [{'id': 'ana', 'x': 0, 'z': 0, 'katlar': [{'sekil': 'disk', 'r': 5.0, 'ust': 0, 'kal': 0.75}, {'sekil': 'disk', 'r': 2.3, 'ust': 0.45}]},
           {'id': 'topuk', 'x': hx, 'z': hz, 'katlar': [{'sekil': 'disk', 'r': 1.3, 'ust': hy, 'kal': 0.75}]}]
    return {'ad': 'Taş Çember', 'top': 0, 'kam': {'pitch': 27, 'yaw': 0, 'atis': 0.6, 'genis': 0.74}, 'ada': ada, 'kopru': [], 'parca': L}

# ---------------- P13 Capraz Domino ----------------
def p13():
    r = 5.3                               # eskenar (45 derece donuk kare) yarim kenar
    e = (math.sqrt(0.5), -math.sqrt(0.5)); n = (math.sqrt(0.5), math.sqrt(0.5))   # e: on-sol -> arka-sag, n: ona dik
    u0, u1, A = -4.7, 4.7, 0.8
    def yol(u): v = -A * math.sin(2 * math.pi * (u - u0) / (u1 - u0)); return (u * e[0] + v * n[0], u * e[1] + v * n[1])
    # yay uzunlugu boyunca esit aralikli dominolar
    adim, pts, u, son = 1.1, [], u0, None
    ince = [u0 + (u1 - u0) * i / 2000 for i in range(2001)]
    acc, prev = 0, yol(u0); pts.append((u0, prev))
    for uu in ince[1:]:
        q = yol(uu); acc += math.dist(q, prev); prev = q
        if acc >= adim: pts.append((uu, q)); acc = 0
    L = []
    for i, (uu, (x, z)) in enumerate(pts):
        a, b = yol(uu - 0.01), yol(uu + 0.01)
        ry = math.degrees(math.atan2(b[0] - a[0], b[1] - a[1]))   # yerel z (ince eksen) yol yonunde
        L.append(P('plDomino', x, z, ry=r3(ry), id='domino-%02d' % i))
    # yuksek altigen ada (arka-sag) ve tas kopru; TNT kopru basinda, arkasinda mucevher kulesi
    hx, hz, hy, hr = 6.0, -6.0, 1.1, 2.3
    ux, uz = e
    tx, tz = hx - ux * 1.05, hz - uz * 1.05          # TNT: adanin yakin kenari
    L.append(P('ksTNT', tx, tz, p='kule.0', ry=45, id='kule-tnt', patlama={'r': 4.2, 'guc': 12}))
    kx, kz = hx + ux * 0.62, hz + uz * 0.62          # kule merkezi
    yy = hy
    for t, d in [('ksSandik', -0.78), ('ksSandikK', 0.78)]: L.append(P(t, kx + n[0] * d, kz + n[1] * d, p='kule.0', ry=45, id='kule-%s' % t))
    yy += S
    for t, d in [('ksYakut', -0.76), ('ksElmas', 0.76)]: L.append(P(t, kx + n[0] * d, kz + n[1] * d, y=yy, p='kule.0', id='kule-%s' % t))
    yy += S
    L.append(P('ksKalas2', kx, kz, y=yy, p='kule.0', ry=-45, id='kule-kalas'))
    yy += S / 2
    L.append(P('ksSandikM', kx, kz, y=yy, p='kule.0', ry=45, id='kule-sandikM'))
    yy += S
    L.append(P('ksYildiz', kx, kz, y=yy, p='kule.0', ry=45, id='kule-yildiz'))
    # yem kumeleri (yolun yaninda): fiçilar sag-onde, siseler solda
    L.append(P('ksFici', 3.3, 2.2, id='yem-fici-0')); L.append(P('ksSiseB', 3.85, 0.8, id='yem-sise-2'))
    L.append(P('ksSiseM', -4.05, -0.7, id='yem-sise-0')); L.append(P('ksSiseY', -3.25, -2.2, id='yem-sise-1'))
    ada = [{'id': 'ana', 'x': 0, 'z': 0, 'katlar': [{'sekil': 'eskenar', 'r': r, 'ust': 0, 'kal': 0.75}]},
           {'id': 'kule', 'x': hx, 'z': hz, 'katlar': [{'sekil': 'cokgen', 'n': 6, 'r': hr, 'don': 45, 'ust': hy, 'kal': 0.75}]}]
    # tas kopru: eskenarin arka-sag kenarinin ortasindan adaya
    ap, kn = hr * math.cos(math.pi / 6), -0.6           # altigenin kenar ortasi uzakligi; kopru yana kaydirilmis (domino dusus cizgisinin solunda)
    a = [r3(e[0] * (r - 0.1) + n[0] * kn), -0.21, r3(e[1] * (r - 0.1) + n[1] * kn)]
    b = [r3(hx - ux * (ap + 0.05) + n[0] * kn), r3(hy - 0.21), r3(hz - uz * (ap + 0.05) + n[1] * kn)]
    kopru = [{'tip': 'tas', 'a': a, 'b': b, 'en': 1.0}]
    return {'ad': 'Çapraz Domino', 'top': 0, 'kam': {'pitch': 28, 'yaw': 0, 'atis': 0.5, 'genis': 0.76}, 'ada': ada, 'kopru': kopru, 'parca': L}

TOP = {1: 25, 7: 18, 13: 14}   # top sayilari (pilot_test bot sonucuna gore ayarlandi; bkz. yapi/pilot_isleri.md)
B = {1: p1(), 7: p7(), 13: p13()}
for k, v in B.items(): v['top'] = TOP[k]
json.dump({'surum': 2, 'bolumler': B}, open(OUT, 'w'), ensure_ascii=False, indent=1)
print('yazildi', OUT, {k: len(v['parca']) for k, v in B.items()})
