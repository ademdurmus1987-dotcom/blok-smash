# Foxi Smash v9.6 (19 Kas 2026, Adem: "referanstaki gibi kaliteli bloklar"): TEK TARZDA yeni blok seti (Blender modeli).
#   blender -b --python yapi/uretici/blender/yeni_bloklar.py [-- cubuk3 kavanoz ...]
#   (ya da bpy modulu: python yeni_bloklar.py -- ...)
# Ortak tarz: kalin yuvarlak kenar (r = 0.16 kup), genis ve sig ic pano, ortada iri kabartma pati, temiz yuzey (desen/karalama yok).
# Govde rengi beyaz isaret (GOVDE): oyunda turun rengine boyanir (blok3b.js govde), boylece tek dosyadan 8 renk.
# Yardimcilar (kutu, pano, kabartma, pati, torna, pisirme, disa aktarma) pilot_bloklar.py'den alinir. Cikti: yapi/model/blok2/*.glb
import os, sys, math
BURASI = os.path.dirname(os.path.abspath(__file__))
_src = open(os.path.join(BURASI, 'pilot_bloklar.py'), encoding='utf-8').read()
_src = _src[:_src.rindex('\nmain()')]   # yalniz tanimlar
exec(compile(_src, 'pilot_bloklar.py', 'exec'))
BLOK2 = os.path.join(KOK, 'yapi', 'model', 'blok2'); os.makedirs(BLOK2, exist_ok=True)

KR = 0.16    # kenar yaricapi (kup kenari cinsinden)

YASTIK = '--eski' not in sys.argv   # v9.7 (Adem: 'referanstaki gibi kaliteli'): pano kenarlari yastik gibi yuvarlak (referanstaki kalin cerceve)

def yastik_kenar(bm, f, r):
    """pano cukurunun iki kenarini (cerceve ust kenari ve pano tabani) yuvarlat: keskin basamak yerine yastik gibi kalin cerceve"""
    import bmesh
    alt = set(f.edges); fv = set(f.verts); duvar = set()
    for e in alt:
        for g in e.link_faces:
            if g is not f: duvar.add(g)
    ust = set()
    for g in duvar:
        for e in g.edges:
            if not (set(e.verts) & fv) and all(any(h in duvar for h in vv.link_faces) for vv in e.verts):
                if sum(1 for h in e.link_faces if h in duvar) == 1: ust.add(e)
    bmesh.ops.bevel(bm, geom=list(alt | ust), offset=r, offset_type='OFFSET', segments=2, profile=0.5, affect='EDGES', clamp_overlap=True)
    bm.normal_update()

def cubuk(ad, wS):
    """wS x 1 x 1 parlak oyuncak tugla: kalin yuvarlak kenar, her yuzde sig pano, on ve arkada iri pati (govde renginde kabartma)"""
    w, h, d = wS * S * 0.996, S * 0.994, S * 0.994; r = KR * S; gom = 0.055 * S   # v9.6b: derin pano (golgesi okunur)
    if YASTIK: r = 0.2 * S; gom = 0.07 * S   # v9.7: daha yuvarlak dis kenar, daha derin pano
    bm = kutu_bm(w, h, d, r, 3)
    for y in YON.values():
        f = pano(bm, buyuk_yuz(bm, y), (0.13 if YASTIK else 0.1) * S, gom)
        if YASTIK: yastik_kenar(bm, f, 0.035 * S)
    P = [bm_al(bm)]; bm.free()
    for yon in ('on', 'arka'):
        o, u, v = yuz_cerceve(yon, d / 2 - gom)
        P += pati(o, u, v, (0.74 if YASTIK else 0.86) * S, (0.05 if YASTIK else 0.075) * S, GOVDE)
    return uret(ad, P, 0.25, keskin=55.0, klasor=BLOK2)

def kavanoz(ad, hS):
    """cap 1, boy hS: tombul govde, omuz, boyun, cizgili tirtikli kapak (krem / govde rengi), onde krem pati"""
    SEG = 20; k = hS
    cizgi = lambda j: KREM if (j // 2) % 2 == 0 else GOVDE
    # govde y degerleri boy oranli (alt -0.5k .. ust 0.5k), kapak sabit boy 0.24
    yb, yt = -0.5 * k, 0.5 * k; ks = yt - 0.17   # v9.6b: tombul govde (cap ~0.99), kisa kapak
    prof = [(0.42, yb + 0.003, GOVDE), (0.475, yb + 0.035, GOVDE), (0.494, yb + 0.1, GOVDE), (0.494, ks - 0.12, GOVDE), (0.47, ks - 0.05, GOVDE),
            (0.42, ks - 0.012, KREM), (0.405, ks, KREM), (0.46, ks + 0.008, cizgi), (0.46, yt - 0.03, cizgi), (0.43, yt - 0.005, KREM), (0.36, yt, KREM)]
    prof = [(rr * S, y * S, c) for rr, y, c in prof]
    P = [torna(prof, SEG)]
    o, u, v = yuz_cerceve('on', 0.488 * S); o = (o[0], (yb + (ks - yb) * 0.48) * S, o[2])
    P += pati(o, u, v, 0.4 * S, 0.025 * S, KREM)
    oi, ui, vi = yuz_cerceve('on', 0.466 * S)   # v9.6b: sol onde dikey parlama seridi (cam/plastik isigi, referanstaki gibi)
    y0, y1 = yb + 0.12, ks - 0.12
    P.append(kabartma(oi, ui, vi, SP(serit((-0.18, y0), (-0.18, y1), 0.045)), [(1.0, -0.006), (1.0, 0.01 * S)], ISIK))
    P.append(kabartma(oi, ui, vi, SP(serit((-0.08, y0 + 0.08), (-0.08, y0 + 0.08 + (y1 - y0) * 0.35), 0.018)), [(1.0, -0.006), (1.0, 0.01 * S)], ISIK))
    return uret(ad, P, 0.12, klasor=BLOK2)

def silindir():
    """cap 1 boy 1 tambur: govde renkli, ust ve altta dalgali krem bant (tirtikli halka), ortada ince krem kusak"""
    SEG = 24
    prof = [(0.40, -0.497, KREM), (0.465, -0.47, KREM), (0.48, -0.42, KREM), (0.48, -0.33, GOVDE), (0.472, -0.30, GOVDE), (0.472, -0.05, KREM), (0.485, -0.03, KREM), (0.485, 0.03, GOVDE),
            (0.472, 0.05, GOVDE), (0.472, 0.30, KREM), (0.48, 0.33, KREM), (0.48, 0.42, KREM), (0.465, 0.47, KREM), (0.40, 0.497, KREM)]
    prof = [(rr * S, y * S, c) for rr, y, c in prof]
    P = [torna(prof, SEG, dalga={2: 0.955, 3: 0.955, 10: 0.955, 11: 0.955})]
    return uret('silindir', P, 0.22, klasor=BLOK2)

def kiris(ad, wS):
    """wS x 1 x 1 kiris: govde renkli uzun pano, iki ucta krem kare cerceve icinde govde renkli kare (on, arka, ust)"""
    w, h, d = wS * S * 0.996, S * 0.994, S * 0.994; r = KR * S; gom = 0.025 * S
    bm = kutu_bm(w, h, d, r, 3)
    for y in ('ust', 'alt', 'sag', 'sol'): pano(bm, buyuk_yuz(bm, YON[y]), 0.085 * S, gom)
    P = [bm_al(bm)]; bm.free()
    for yon in ('on', 'arka'):
        o, u, v = yuz_cerceve(yon, d / 2)
        for sx in (-1, 1):
            cx = sx * (w / 2 - 0.5 * S)
            dis = [(cx - 0.36 * S, -0.36 * S), (cx + 0.36 * S, -0.36 * S), (cx + 0.36 * S, 0.36 * S), (cx - 0.36 * S, 0.36 * S)]
            P.append(kabartma(o, u, v, dis, [(1.0, -0.004), (1.0, 0.03 * S), (0.94, 0.05 * S)], KREM))
            ob = Vector(o) + Vector(u).cross(Vector(v)) * (0.05 * S - 0.002)
            ic = [(cx - 0.21 * S, -0.21 * S), (cx + 0.21 * S, -0.21 * S), (cx + 0.21 * S, 0.21 * S), (cx - 0.21 * S, 0.21 * S)]
            P.append(kabartma(ob, u, v, ic, [(1.0, 0.0), (1.0, 0.02 * S), (0.9, 0.035 * S)], GOVDE))
        P.append(kabartma(o, u, v, SP(serit((-wS / 2 + 1.05, 0), (wS / 2 - 1.05, 0), 0.05)), [(1.0, -0.004), (1.0, 0.02 * S)], KREM))   # ortada ince krem cizgi
    return uret(ad, P, 0.25, keskin=55.0, klasor=BLOK2)

def yastik_govde(w, renkler=None, kal=0.13, gom=0.07, seg=3):
    """v9.8: cubuk ile ayni yastik kenarli govde (w genislik). renkler: {'pano': c, 'cerceve': c} (yoksa hepsi GOVDE). Doner: P, gom"""
    h = d = S * 0.994; r = 0.2 * S; gom = gom * S
    bm = kutu_bm(w, h, d, r, seg); pn = set()
    for y in YON.values():
        f = pano(bm, buyuk_yuz(bm, y), kal * S, gom); pn.add(f); yastik_kenar(bm, f, 0.035 * S)
    if renkler:
        # yastik_kenar pano yuzunu daraltir ama ayni yuz kalir; pano duzlemindeki (cukur tabani) yuzler pano rengi
        def sec(f):
            c = f.calc_center_median(); n = f.normal
            ax = max(range(3), key=lambda i: abs(n[i]))
            if abs(n[ax]) < 0.6: return renkler['cerceve']
            lim = (w if ax == 0 else h) / 2
            ic = all(abs(c[i]) < (w if i == 0 else h) / 2 - 0.2 * S for i in range(3) if i != ax)   # pano icinde (dis kenar yuvarlagi degil)
            return renkler['pano'] if ic and abs(c[ax]) < lim - gom * 0.25 else renkler['cerceve']
        P = [bm_al(bm, sec)]
    else: P = [bm_al(bm)]
    bm.free(); return P, gom

def tas_y(ad, wS):
    """gri-mavi yastik tas: cerceve acik tas, cukurda iri yuvarlak tas kabartmalari (on/arka 2 sira, yanlarda 1)"""
    w = wS * S * 0.996
    CER, PAN, T = renk('#8e97b4'), renk('#4c5474'), [renk('#c2c9e0'), renk('#b0b8d4'), renk('#cbd1e6')]
    P, gom = yastik_govde(w, {'pano': PAN, 'cerceve': CER}, seg=2 if wS > 1 else 3)
    import random; rnd = random.Random(wS * 31 + 5)
    for yon in ('on', 'arka'):
        o, u, v = yuz_cerceve(yon, (S * 0.994) / 2 - gom)
        uh, vh = (w / S) / 2 - 0.2, 0.5 - 0.2; g = 0.05
        rh = (2 * vh - g) / 2
        for j in range(2):
            n = max(1, round((2 * uh) / 0.85)) if j == 0 else max(1, round((2 * uh) / 0.85) + (1 if wS > 1 else 0))
            bw = (2 * uh - g * (n - 1)) / n; x = -uh; yc = -vh + j * (rh + g) + rh / 2
            if j == 1 and wS > 1: x += bw * 0.0
            for _ in range(n):
                P.append(kabartma(o, u, v, SP(yuvdik(x + bw / 2, yc, bw, rh, 0.07, 2)), [(1.0, -0.004), (0.9, 0.05 * S)], rnd.choice(T)))
                x += bw + g
    return uret(ad, P, 0.55, keskin=55.0, klasor=BLOK2)

def buz_y(ad, wS):
    """buz: govde rengi (oyunda buz mavisi), yastik kenar, on/arka/ust capraz isik seritleri ve pirilti"""
    w = wS * S * 0.996
    P, gom = yastik_govde(w, None, kal=0.11, gom=0.05)
    for yon in ('on', 'arka', 'ust'):
        o, u, v = yuz_cerceve(yon, (S * 0.994) / 2 - gom)
        x0 = -(w / S) / 2 + 0.26
        P.append(kabartma(o, u, v, SP(serit((x0, -0.02), (x0 + 0.2, 0.22), 0.075)), [(1.0, -0.004), (0.9, 0.02 * S)], ISIK))
        P.append(kabartma(o, u, v, SP(serit((x0 + 0.13, -0.08), (x0 + 0.23, 0.04), 0.04)), [(1.0, -0.004), (0.9, 0.012 * S)], ISIK))
        P.append(kabartma(o, u, v, SP(yildiz((w / S) / 2 - 0.3, -0.16, 0.09, 0.026)), [(1.0, -0.004), (0.7, 0.02 * S)], ISIK))
    return uret(ad, P, 0.1, keskin=55.0, klasor=BLOK2)

def sandik_y(ad):
    """sandik: govde renkli yastik cerceve, krem tahta pano, govde renkli kabarik X destek, koselerde civi"""
    P, gom = yastik_govde(S * 0.996, {'pano': KREM, 'cerceve': GOVDE}, kal=0.14, gom=0.06)
    for yon in ('on', 'arka', 'sag', 'sol', 'ust'):
        o, u, v = yuz_cerceve(yon, (S * 0.994) / 2 - gom)
        P.append(kabartma(o, u, v, SP(serit((-0.25, -0.25), (0.25, 0.25), 0.15)), [(1.0, -0.004), (0.95, 0.04 * S)], GOVDE))
        P.append(kabartma(o, u, v, SP(serit((0.25, -0.25), (-0.25, 0.25), 0.15)), [(1.0, -0.004), (0.95, 0.05 * S)], GOVDE))
    return uret(ad, P, 0.3, keskin=55.0, klasor=BLOK2)

def main2():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    dunya()
    ist = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    hepsi = {'cubuk1': lambda: cubuk('cubuk1', 1), 'cubuk2': lambda: cubuk('cubuk2', 2), 'cubuk3': lambda: cubuk('cubuk3', 3), 'cubuk4': lambda: cubuk('cubuk4', 4),
             'kavanoz1': lambda: kavanoz('kavanoz1', 1), 'kavanoz2': lambda: kavanoz('kavanoz2', 2), 'silindir': silindir, 'kiris3': lambda: kiris('kiris3', 3),
             'tas1': lambda: tas_y('tas1', 1), 'tas2': lambda: tas_y('tas2', 2), 'tas3': lambda: tas_y('tas3', 3), 'tas4': lambda: tas_y('tas4', 4),
             'buz1': lambda: buz_y('buz1', 1), 'buz3': lambda: buz_y('buz3', 3), 'sandik': lambda: sandik_y('sandik')}
    obs = [f() for kk, f in hepsi.items() if not ist or kk in ist]
    print('BITTI', len(obs))

main2()
