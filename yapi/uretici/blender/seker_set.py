# Foxi Smash v11 denemesi (22 Kas 2026, Adem: "sise, kup kalitesini referans oyun kalitesine yukselt"): BOYALI SET. Oyunda yalniz ?yeni=1.
#   blender -b --python yapi/uretici/blender/seker_set.py [-- kup1 kav1 ...]
# Onceki setlerden farki: pisirilmis golge dokusu YOK (ic yuzleri camurlu ve koyu gosteriyordu). Her yuz ic ice halkalardan kurulur:
# yastik cerceve -> koyu ince oluk -> duz, temiz pano. Golge ve parlama oyundaki boyali golgelendiricide (blok3b.js sekerMat).
# Kose rengi (RGBA, ubyte): A=255 duz renk (sRGB) · A=128 duz renk + tahta damari · A=0 TON: R = aciklik (0.5 = turun rengi, 1 acik, 0 koyu),
# G = 1 ise vurgu rengi (o.vurgu, varsayilan altin), B = 1 ise tahta damari. Oyun tonu turun rengine cevirir (tek dosyadan butun renkler).
# Amblemler bizim: pati ve tilki basi. Cikti: yapi/model/blok3/*.glb (oyun eksenleri: x sag, y yukari, z one; 1 kup = S = 1.55)
import bpy, bmesh, math, os, sys, json, struct, random
from mathutils import Vector
S = 1.55; Pi = math.pi
BURASI = os.path.dirname(os.path.abspath(__file__))
KOK = os.path.dirname(os.path.dirname(os.path.dirname(BURASI)))
CIK = os.path.join(KOK, 'yapi', 'model', 'blok3'); os.makedirs(CIK, exist_ok=True)

def hx(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
def duz(h, damar=0): return hx(h) + (0.5 if damar else 1.0,)
def ton(l, vurgu=0, damar=0): return (l, float(vurgu), float(damar), 0.0)
BEYAZ = duz('#fffaf4'); SIYAH = duz('#2b2734')

YUZ = {'on': ((0, 0, 1), (1, 0, 0), (0, 1, 0)), 'arka': ((0, 0, -1), (-1, 0, 0), (0, 1, 0)), 'sag': ((1, 0, 0), (0, 0, -1), (0, 1, 0)),
       'sol': ((-1, 0, 0), (0, 0, 1), (0, 1, 0)), 'ust': ((0, 1, 0), (1, 0, 0), (0, 0, -1)), 'alt': ((0, -1, 0), (1, 0, 0), (0, 0, 1))}

class Model:
    def __init__(s): s.bm = bmesh.new(); s.k = s.bm.loops.layers.float_color.new('Col')
    def yuz(s, pts, c):
        """pts: Vector listesi (disaridan bakinca saat yonunun tersi). c: tek renk, liste ya da konum -> renk"""
        try: f = s.bm.faces.new([p if isinstance(p, bmesh.types.BMVert) else s.bm.verts.new(p) for p in pts])
        except ValueError: return None
        for i, l in enumerate(f.loops): l[s.k] = c(l.vert.co) if callable(c) else c[i] if isinstance(c, list) else c
        return f

def yuz_boyut(y, w, h, d):
    return {'on': (w, h, d), 'arka': (w, h, d), 'sag': (d, h, w), 'sol': (d, h, w), 'ust': (w, d, h), 'alt': (w, d, h)}[y]

def halka(M, o, u, v, n, a, b, rc, der, m):
    """yuvarlak koseli dikdortgen halka (4*(m+1) kose), sag ustten saat yonunun tersine"""
    L = []
    for q in range(4):
        cx = (a - rc) * (1 if q in (0, 3) else -1); cy = (b - rc) * (1 if q in (0, 1) else -1)
        for j in range(m + 1):
            t = Pi / 2 * (q + j / m); L.append(M.bm.verts.new(o + u * (cx + rc * math.cos(t)) + v * (cy + rc * math.sin(t)) + n * der))
    return L

def kutu(M, w, h, d, r, cerceve, halkalar, pano, seg=3, m=2, sade=(), kosegen=None):
    """pahli kutu. halkalar: [(iceri, derinlik, kose yaricapi, bu halkaya kadar olan kusagin rengi)], pano: ic renk ((u,v birim -1..1) -> renk ya da renk).
    sade: bu yuzlerde halka yok. Yuzlerin (merkez, u, v, n, ic yarim en, ic yarim boy) bilgisi doner."""
    b2 = bmesh.new(); bmesh.ops.create_cube(b2, size=1.0)
    for x in b2.verts: x.co = Vector((x.co.x * w, x.co.y * h, x.co.z * d))
    bmesh.ops.bevel(b2, geom=list(b2.edges), offset=r, offset_type='OFFSET', segments=seg, profile=0.5, affect='EDGES')
    bmesh.ops.recalc_face_normals(b2, faces=list(b2.faces))
    buyuk = {}
    for y, (n, _, _) in YUZ.items():
        n = Vector(n)
        for f in b2.faces:
            if f.normal.dot(n) > 0.999 and (y not in buyuk or f.calc_area() > buyuk[y].calc_area()): buyuk[y] = f
    vm = {x: M.bm.verts.new(x.co) for x in b2.verts}; atla = set(buyuk.values()); bilgi = {}
    for f in b2.faces:
        if f in atla: continue
        M.yuz([vm[x] for x in f.verts], cerceve)
    for y, (n, u, v) in YUZ.items():
        n, u, v = Vector(n), Vector(u), Vector(v); W, H, D = yuz_boyut(y, w, h, d); a, b = W / 2 - r, H / 2 - r; o = n * (D / 2)
        kose = [vm[min(b2.verts, key=lambda x: (x.co - (o + u * (a * sx) + v * (b * sy))).length)] for sx, sy in ((1, 1), (-1, 1), (-1, -1), (1, -1))]
        if y in sade or not halkalar:
            M.yuz(kose, cerceve); bilgi[y] = (o, u, v, n, a, b); continue
        onc = None
        for (ic, der, rc, c) in halkalar:
            H2 = halka(M, o, u, v, n, a - ic, b - ic, rc, der, m)
            if onc is None:
                for q in range(4):
                    for j in range(m): M.yuz([kose[q], H2[q * (m + 1) + j + 1], H2[q * (m + 1) + j]], c)
                    q2 = (q + 1) % 4; M.yuz([kose[q], kose[q2], H2[q2 * (m + 1)], H2[q * (m + 1) + m]], c)
            else:
                N = len(H2)
                for j in range(N): M.yuz([onc[j], onc[(j + 1) % N], H2[(j + 1) % N], H2[j]], c)
            onc = H2
        ai, bi = a - halkalar[-1][0], b - halkalar[-1][0]; oi = o + n * halkalar[-1][1]
        M.yuz(onc, (lambda co: pano((co - oi).dot(u) / ai, (co - oi).dot(v) / bi)) if callable(pano) else pano)
        bilgi[y] = (oi, u, v, n, ai, bi)
    b2.free(); return bilgi

def kabart(M, o, u, v, n, pts, halkalar, c):
    """kabartma. halkalar: [(disa kayma, yukseklik, rengi)]; ilk halka koyu etek. pts saat yonunun tersi. Kayma gercek kenar kaymasi (kose ortalamasi)."""
    m = len(pts)
    def kay(k):
        out = []
        for i in range(m):
            p0, p, p1 = Vector(pts[i - 1]), Vector(pts[i]), Vector(pts[(i + 1) % m])
            e0, e1 = (p - p0).normalized(), (p1 - p).normalized(); n0, n1 = Vector((e0.y, -e0.x)), Vector((e1.y, -e1.x))
            nn = (n0 + n1); nn = nn.normalized() if nn.length > 1e-6 else n0; out.append(p + nn * (k / max(0.45, nn.dot(n0))))
        return out
    onc = None
    for (k, hh, cc) in halkalar:
        L = [M.bm.verts.new(o + u * p.x + v * p.y + n * hh) for p in kay(k)]
        if onc:
            for j in range(m): M.yuz([onc[j], onc[(j + 1) % m], L[(j + 1) % m], L[j]], cc)
        onc = L
    M.yuz(onc, c)

def elips(cx, cy, rx, ry, n, don=0.0):
    return [(cx + rx * math.cos(a) * math.cos(don) - ry * math.sin(a) * math.sin(don), cy + rx * math.cos(a) * math.sin(don) + ry * math.sin(a) * math.cos(don)) for a in [2 * Pi * i / n for i in range(n)]]
def olc(p, k): return [(a * k, b * k) for a, b in p]

def egri(pts, adim=3):
    """kapali Catmull-Rom: koseli cizgiyi yumusatir"""
    out = []; m = len(pts)
    for i in range(m):
        p0, p1, p2, p3 = [Vector(pts[(i + k) % m]) for k in (-1, 0, 1, 2)]
        for j in range(adim):
            t = j / adim; q = 0.5 * ((2 * p1) + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (3 * p1 - p0 - 3 * p2 + p3) * t ** 3); out.append((q.x, q.y))
    return out

YASTIK = egri([(0.0, -0.27), (0.17, -0.24), (0.20, -0.10), (0.11, 0.02), (0.0, 0.055), (-0.11, 0.02), (-0.20, -0.10), (-0.17, -0.24)], 1)
def pati(M, B, k, c, koyu, kenar):
    o, u, v, n = B[:4]; e = 0.030 * S * k / (0.8 * S)
    sekil = [olc(YASTIK, k)] + [elips(cx * k, cy * k, 0.072 * k, 0.098 * k, 8, d) for cx, cy, d in ((-0.265, 0.08, 0.45), (-0.094, 0.235, 0.14), (0.094, 0.235, -0.14), (0.265, 0.08, -0.45))]
    for p in sekil: kabart(M, o, u, v, n, p, [(e, 0.003, koyu), (0.0, 0.004, koyu), (-0.75 * e, 0.034 * S, kenar)], c)

TILKI = [(0.0, -0.36), (0.14, -0.27), (0.30, -0.10), (0.40, 0.02), (0.345, 0.14), (0.385, 0.40), (0.30, 0.365), (0.16, 0.225), (0.0, 0.245), (-0.16, 0.225), (-0.30, 0.365), (-0.385, 0.40), (-0.345, 0.14), (-0.40, 0.02), (-0.30, -0.10), (-0.14, -0.27)]
def tilki(M, B, k, c, koyu, kenar, yuzu=True):
    o, u, v, n = B[:4]; e = 0.036 * S * k / (0.8 * S); H = 0.04 * S
    kabart(M, o, u, v, n, olc(TILKI, k), [(e, 0.003, koyu), (0.0, 0.004, koyu), (-0.7 * e, H, kenar)], c)
    if not yuzu: return
    o2 = o + n * (H + 0.004)
    for sx in (-1, 1): kabart(M, o2, u, v, n, elips(sx * 0.15 * k, 0.02 * k, 0.058 * k, 0.08 * k, 8, -sx * 0.5), [(0, 0, koyu)], koyu)
    kabart(M, o2, u, v, n, olc([(0.0, -0.33), (0.085, -0.22), (0.0, -0.185), (-0.085, -0.22)], k), [(0, 0, koyu)], koyu)

def torna(M, prof, seg):
    """prof: [(r, y, renk)] alttan uste; renk(j) o noktadan sonraki kusagin rengi, (alt, ust) ikilisi gecis. r(j) olabilir."""
    R = []
    for (r, y, _) in prof:
        R.append([M.bm.verts.new(Vector(((r(j) if callable(r) else r) * math.cos(2 * Pi * j / seg), y, -(r(j) if callable(r) else r) * math.sin(2 * Pi * j / seg)))) for j in range(seg)])
    for i in range(len(prof) - 1):
        for j in range(seg):
            c = prof[i][2]; c = c(j) if callable(c) else c
            c = [c[0], c[0], c[1], c[1]] if isinstance(c, tuple) and isinstance(c[0], tuple) else c
            M.yuz([R[i][j], R[i][(j + 1) % seg], R[i + 1][(j + 1) % seg], R[i + 1][j]], c)
    M.yuz(R[0][::-1], prof[0][2](0) if callable(prof[0][2]) else prof[0][2] if not isinstance(prof[0][2][0], tuple) else prof[0][2][0])
    M.yuz(R[-1], prof[-1][2](0) if callable(prof[-1][2]) else prof[-1][2])

def yaz(M, ad, keskin=48.0, agirlik=True):
    bmesh.ops.triangulate(M.bm, faces=list(M.bm.faces))
    me = bpy.data.meshes.new(ad); M.bm.to_mesh(me); M.bm.free()
    for p in me.polygons: p.use_smooth = True
    me.set_sharp_from_angle(angle=math.radians(keskin))
    ob = bpy.data.objects.new(ad, me); bpy.context.scene.collection.objects.link(ob)
    if agirlik:
        for o in bpy.context.scene.objects: o.select_set(False)
        ob.select_set(True); bpy.context.view_layer.objects.active = ob
        m = ob.modifiers.new('a', 'WEIGHTED_NORMAL'); m.mode = 'FACE_AREA'; m.weight = 50; m.keep_sharp = True; bpy.ops.object.modifier_apply(modifier=m.name)
    me = ob.data; kat = me.color_attributes['Col'].data; K, P, N, C, I = {}, [], [], [], []
    for f in me.polygons:
        for li in f.loop_indices:
            p = me.vertices[me.loops[li].vertex_index].co; nn = me.corner_normals[li].vector; c = kat[li].color
            a = (tuple(round(x, 5) for x in p), tuple(round(x, 3) for x in nn), tuple(min(255, max(0, int(x * 255 + 0.5))) for x in c))
            if a not in K: K[a] = len(P); P.append(a[0]); N.append(a[1]); C.append(a[2])
            I.append(K[a])
    pb = b''.join(struct.pack('<3f', *x) for x in P); nb = b''.join(struct.pack('<3f', *x) for x in N); cb = b''.join(struct.pack('<4B', *x) for x in C); ib = struct.pack('<%dH' % len(I), *I); ib += b'\0' * (-len(ib) % 4)
    bl, of, B = pb + nb + cb + ib, 0, []
    for x, t in ((pb, 34962), (nb, 34962), (cb, 34962), (ib, 34963)): B.append({'buffer': 0, 'byteOffset': of, 'byteLength': len(x), 'target': t}); of += len(x)
    J = {'asset': {'version': '2.0', 'generator': 'seker_set.py'}, 'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': [{'mesh': 0, 'name': ad}],
         'meshes': [{'primitives': [{'attributes': {'POSITION': 0, 'NORMAL': 1, 'COLOR_0': 2}, 'indices': 3}]}], 'bufferViews': B, 'buffers': [{'byteLength': len(bl)}],
         'accessors': [{'bufferView': 0, 'componentType': 5126, 'count': len(P), 'type': 'VEC3', 'min': [min(x[i] for x in P) for i in range(3)], 'max': [max(x[i] for x in P) for i in range(3)]},
                       {'bufferView': 1, 'componentType': 5126, 'count': len(P), 'type': 'VEC3'}, {'bufferView': 2, 'componentType': 5121, 'normalized': True, 'count': len(P), 'type': 'VEC4'},
                       {'bufferView': 3, 'componentType': 5123, 'count': len(I), 'type': 'SCALAR'}]}
    j = json.dumps(J, separators=(',', ':')).encode(); j += b' ' * (-len(j) % 4)
    with open(os.path.join(CIK, ad + '.glb'), 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(j) + 8 + len(bl)) + struct.pack('<II', len(j), 0x4E4F534A) + j + struct.pack('<II', len(bl), 0x004E4942) + bl)
    print('yazildi %-10s ucgen %d kose %d' % (ad, len(I) // 3, len(P)))

# ------------------------------------------------------------------ bloklar
def oluklu(M, w, h, d, cer, oluk, ic_kenar, pano, r=0.125, k=1.0):
    """referans yapisi: yastik cerceve, ic yamac, koyu ince oluk, panonun acik kenari, duz pano"""
    q = k * S
    return kutu(M, w, h, d, r * S, cer, [(0.018 * q, 0.004 * S, 0.035 * q, cer), (0.052 * q, -0.020 * S, 0.045 * q, ic_kenar), (0.070 * q, -0.042 * S, 0.045 * q, oluk),
                                         (0.084 * q, -0.042 * S, 0.042 * q, oluk), (0.098 * q, -0.030 * S, 0.036 * q, ton(0.60) if pano is None else ton(0.55) if callable(pano) else pano)], (lambda a, b: ton(0.53 + 0.04 * b)) if pano is None else pano)

def kup(ad, wS):
    M = Model(); B = oluklu(M, wS * S * 0.994, S * 0.992, S * 0.992, ton(0.5), ton(0.18), ton(0.40), None)
    for y in ('on', 'arka') + (('sag', 'sol') if wS == 1 else ()): pati(M, B[y], 0.76 * S, ton(0.60), ton(0.17), ton(0.68))
    yaz(M, ad)

def kupA(ad, wS, vurgu=1):
    """altin cerceveli (vurgu rengi), govde renkli panolu, vurgu renkli tilki amblemli"""
    M = Model(); B = oluklu(M, wS * S * 0.994, S * 0.992, S * 0.992, ton(0.5, 1), ton(0.12), ton(0.36, 1), lambda a, b: ton(0.50 + 0.03 * b))
    for y in ('on', 'arka') + (('sag', 'sol', 'ust') if wS == 1 else ()):
        o, u, v, n, a, b = B[y]
        tilki(M, B[y], 0.66 * S, ton(0.5, 1), ton(0.12), ton(0.66, 1))
    yaz(M, ad)

def tas(ad, wS):
    M = Model(); w = wS * S * 0.994; T = ton(0.5)
    B = kutu(M, w, S * 0.992, S * 0.992, 0.085 * S, ton(0.565), [(0.030 * S, 0.0, 0.03 * S, ton(0.555)), (0.062 * S, -0.022 * S, 0.03 * S, ton(0.30))], lambda a, b: ton(0.5 + 0.045 * b), seg=3, m=2)
    rnd = random.Random(wS * 7 + 3)
    for y in ('on', 'arka', 'sag', 'sol', 'ust'):
        o, u, v, n, a, b = B[y]
        # iri, los tas lekeleri (yuzeyi canlandirir) ve kenardan giren catlaklar
        for _ in range(2 * (wS if y in ('on', 'arka', 'ust') else 1)):
            cx, cy = rnd.uniform(-a * 0.8, a * 0.8), rnd.uniform(-b * 0.75, b * 0.75); rr = rnd.uniform(0.14, 0.24) * S
            p = [(cx + rr * rnd.uniform(0.7, 1.15) * math.cos(t), cy + rr * 0.7 * rnd.uniform(0.7, 1.15) * math.sin(t)) for t in [2 * Pi * i / 7 for i in range(7)]]
            p = [(max(-a * 0.96, min(a * 0.96, x)), max(-b * 0.96, min(b * 0.96, yy))) for x, yy in p]
            kabart(M, o, u, v, n, p, [(0, 0.004, ton(0.54))], ton(0.55 if rnd.random() < 0.5 else 0.455))
        for _ in range(1):
            sx = rnd.choice((-1, 1)); sy = rnd.choice((-1, 1)); x0, y0 = sx * a * rnd.uniform(0.55, 0.98), sy * b
            t = 0.032 * S; x0 = sx * a * 0.9; P = [(x0, y0), (x0 - sx * 0.055 * S, y0 - sy * 0.09 * S), (x0 - sx * 0.025 * S, y0 - sy * 0.14 * S), (x0 - sx * 0.10 * S, y0 - sy * 0.25 * S)]
            Q = [(x0 + t, y0), (P[1][0] + t, P[1][1]), (P[2][0] + t, P[2][1]), (P[3][0], P[3][1] - sy * 0.004 * S)]
            p = P + Q[::-1]
            if sum(p[i - 1][0] * p[i][1] - p[i][0] * p[i - 1][1] for i in range(len(p))) < 0: p = p[::-1]
            kabart(M, o, u, v, n, p, [(0, 0.008, ton(0.16))], ton(0.16))
    for y in ('on', 'arka') + (('sag', 'sol') if wS == 1 else ()): tilki(M, B[y], 0.60 * S, ton(0.5, 1), ton(0.10), ton(0.66, 1))
    yaz(M, ad)

def buz(ad, wS):
    M = Model(); kutu(M, wS * S * 0.99, S * 0.988, S * 0.988, 0.085 * S, ton(0.5), [], None, seg=3); yaz(M, ad)

def tahta(ad, w, h, xli=False):
    """gonyeli tahta cerceve + damarli pano (+ X destek: sandik)"""
    M = Model(); k = min(1.0, h * 1.35); q = k * S; d = S * 0.992; CER = ton(0.565, 0, 1)
    B = kutu(M, w * S * 0.994, h * S * 0.99, d, 0.085 * q, CER, [(0.012 * q, 0.002 * S, 0.012 * q, CER), (0.085 * q, 0.0, 0.014 * q, CER), (0.102 * q, -0.020 * S, 0.016 * q, ton(0.42)), (0.116 * q, -0.044 * S, 0.018 * q, ton(0.14))],
             lambda a, b: ton(0.40 + 0.025 * b, 0, 1), seg=3, m=2)
    for y in B:
        o, u, v, n, a, b = B[y]; A0, B0 = a + 0.116 * q, b + 0.116 * q; oo = o + n * (0.044 * S)
        for sx, sy in ((1, 1), (-1, 1), (-1, -1), (1, -1)):      # gonye cizgileri (kosegen koyu cizgi)
            p1, p2 = Vector((sx * (A0 + 0.03 * q), sy * (B0 + 0.03 * q))), Vector((sx * (a + 0.028 * q), sy * (b + 0.028 * q))); e = (p2 - p1).normalized(); nn = Vector((-e.y, e.x)) * (0.008 * q)
            p = [p1 + nn, p1 - nn, p2 - nn, p2 + nn]; p = [(x.x, x.y) for x in p]
            if sum(p[i - 1][0] * p[i][1] - p[i][0] * p[i - 1][1] for i in range(4)) < 0: p = p[::-1]
            kabart(M, oo, u, v, n, p, [(0, 0.006, ton(0.28))], ton(0.28))
        if xli:
            for i, (sx, hh) in enumerate(((1, 0.026), (-1, 0.032))):
                e = Vector((sx * a, b)).normalized(); nn = Vector((-e.y, e.x)) * (0.078 * S); L = Vector((sx * a, b)) * 0.97
                def sinir(p): return (max(-a, min(a, p.x)), max(-b, min(b, p.y)))
                p = [sinir(x) for x in (L + nn, -L + nn, -L - nn, L - nn)]
                if sum(p[k2 - 1][0] * p[k2][1] - p[k2][0] * p[k2 - 1][1] for k2 in range(4)) < 0: p = p[::-1]
                kabart(M, o, u, v, n, p, [(0.016 * S, 0.004, ton(0.18)), (0.0, 0.005 + 0.001 * i, ton(0.18)), (-0.004 * S, hh * S, ton(0.44)), (-0.02 * S, (hh + 0.010) * S, ton(0.62))], ton(0.555, 0, 1))
    yaz(M, ad)

def kavanoz(ad, h, ol=1):
    """tombul parlak govde, koyu boyun, iri beyaz/renkli dilimli sis kapak"""
    M = Model(); SEG = 40; q = S * ol; yb, yt = -0.5 * h, 0.5 * h
    ci = lambda j: BEYAZ if (j // 2) % 2 == 0 else ton(0.5)
    def rr(r, g=0.010):   # her dilim hafif sis
        return lambda j: (r + g * (0.6 if j % 2 else -0.6)) * q
    ks = yt - 0.205
    prof = [(0.30, yb + 0.004, ton(0.24)), (0.395, yb + 0.004, (ton(0.26), ton(0.34))), (0.452, yb + 0.030, (ton(0.34), ton(0.42))), (0.480, yb + 0.085, (ton(0.42), ton(0.48))), (0.486, yb + 0.16, (ton(0.48), ton(0.51))),
            (0.486, ks - 0.14, (ton(0.51), ton(0.54))), (0.476, ks - 0.075, (ton(0.54), ton(0.56))), (0.447, ks - 0.026, (ton(0.56), ton(0.42))), (0.405, ks - 0.004, (ton(0.30), ton(0.14))), (0.400, ks + 0.016, ton(0.14))]
    prof = [(r * q, y * q, c) for r, y, c in prof]
    for r, y, c in [(0.442, ks + 0.016, ci), (0.474, ks + 0.032, ci), (0.486, ks + 0.062, ci), (0.486, ks + 0.140, ci), (0.474, ks + 0.172, ci), (0.440, ks + 0.192, ci)]: prof.append((rr(r), y * q, c))
    prof += [(0.385 * q, (yt - 0.006) * q, ton(0.62)), (0.36 * q, (yt - 0.014) * q, ton(0.42)), (0.335 * q, (yt - 0.014) * q, ton(0.55))]
    torna(M, prof, SEG); yaz(M, ad, 60, agirlik=False)

def fici(ad):
    """tahta fici: damarli dilimler, oluklu, iki altin kusak"""
    M = Model(); SEG = 36; q = S
    st = lambda l: (lambda j: ton((l if j // 4 % 2 else l - 0.045) if j % 4 else 0.34, 0, 1 if j % 4 else 0))
    bel = lambda y: 0.430 + 0.060 * (1 - (y / 0.5) ** 2)
    prof = [(0.385, -0.497, ton(0.30)), (bel(-0.497), -0.480, ton(0.40))]
    ALT = ton(0.5, 1)
    def kus(y0, y1): return [(bel(y0) + 0.0, y0, ton(0.26, 1)), (bel(y0) + 0.016, y0 + 0.006, ALT), (bel(y1) + 0.016, y1 - 0.006, ton(0.30, 1)), (bel(y1), y1, st(0.5))]
    prof += [(bel(-0.46), -0.46, st(0.45))] + kus(-0.36, -0.25) + [(bel(-0.12), -0.12, st(0.5)), (bel(0.12), 0.12, st(0.52))] + kus(0.25, 0.36) + [(bel(0.46), 0.46, ton(0.62)), (bel(0.497), 0.485, ton(0.60)), (0.385, 0.497, ton(0.28)), (0.375, 0.470, ton(0.45, 0, 1))]
    torna(M, [((r * q), y * q, c) for r, y, c in prof], SEG); yaz(M, ad, 40, agirlik=False)

def silindir(ad):
    """parlak tambur: govde renkli, iki ucta krem-beyaz dolgun halka"""
    M = Model(); q = S
    prof = [(0.36, -0.497, ton(0.3)), (0.42, -0.497, duz('#e9dccb')), (0.468, -0.478, duz('#f6ecdd')), (0.484, -0.43, BEYAZ), (0.484, -0.37, duz('#f1e4d2')), (0.468, -0.325, duz('#d9c8b4')), (0.452, -0.318, (ton(0.14), ton(0.30))), (0.452, -0.295, (ton(0.40), ton(0.48))), (0.458, -0.2, (ton(0.48), ton(0.54))),
            (0.458, 0.24, (ton(0.54), ton(0.40))), (0.452, 0.295, (ton(0.24), ton(0.14))), (0.452, 0.318, duz('#d9c8b4')), (0.468, 0.325, duz('#f1e4d2')), (0.484, 0.37, BEYAZ), (0.484, 0.43, BEYAZ), (0.468, 0.478, duz('#fff4e4')), (0.42, 0.497, duz('#e9dccb')), (0.36, 0.49, ton(0.5))]
    torna(M, [(r * q, y * q, c) for r, y, c in prof], 36); yaz(M, ad, 55, agirlik=False)

def sutun(ad):
    """1x2 sutun: yivli govde, altin halkalar, genis taban ve baslik"""
    M = Model(); q = S; SEG = 36; A = lambda l: ton(l, 1)
    yiv = lambda r: (lambda j: (r - (0.022 if j % 3 == 0 else 0)) * q)
    gv = lambda l: (lambda j: ton(l - (0.10 if j % 3 in (0, 2) and False else 0)))
    prof = [(0.44, -0.997, ton(0.35)), (0.475, -0.985, ton(0.45)), (0.478, -0.86, ton(0.56)), (0.455, -0.84, ton(0.28)), (0.425, -0.83, A(0.3)), (0.45, -0.815, A(0.5)), (0.458, -0.775, A(0.5)), (0.45, -0.735, A(0.34)), (0.42, -0.72, ton(0.2))]
    ust = [(0.42, 0.72, A(0.3)), (0.45, 0.735, A(0.5)), (0.458, 0.775, A(0.5)), (0.45, 0.815, A(0.3)), (0.425, 0.83, ton(0.28)), (0.455, 0.84, ton(0.5)), (0.478, 0.86, ton(0.56)), (0.475, 0.985, ton(0.60)), (0.44, 0.997, ton(0.55))]
    p = [(r * q, y * q, c) for r, y, c in prof] + [(yiv(0.405), -0.70 * q, (ton(0.42), ton(0.5))), (yiv(0.395), -0.4 * q, ton(0.5)), (yiv(0.395), 0.4 * q, (ton(0.5), ton(0.46))), (yiv(0.405), 0.70 * q, ton(0.2))] + [(r * q, y * q, c) for r, y, c in ust]
    torna(M, p, SEG); yaz(M, ad, 34, agirlik=False)

def tnt(ad):
    M = Model(); B = oluklu(M, S * 0.994, S * 0.992, S * 0.992, ton(0.5), ton(0.14), ton(0.38), duz('#ffe9c4'))
    for y in ('on', 'arka', 'sag', 'sol'):
        o, u, v, n, a, b = B[y]; k = S
        kabart(M, o, u, v, n, elips(-0.035 * k, -0.045 * k, 0.185 * k, 0.185 * k, 16), [(0.018 * k, 0.004, duz('#d9a860')), (0, 0.005, SIYAH), (-0.03 * k, 0.04 * k, SIYAH), (-0.09 * k, 0.07 * k, SIYAH)], duz('#3d3848'))
        kabart(M, o + n * (0.065 * k), u, v, n, elips(-0.095 * k, 0.03 * k, 0.045 * k, 0.03 * k, 8, 0.7), [(0, 0.01 * k, BEYAZ)], BEYAZ)
        kabart(M, o, u, v, n, [(x * k, yy * k) for x, yy in [(0.07, 0.12), (0.12, 0.07), (0.17, 0.13), (0.13, 0.18)]], [(0, 0.01, duz('#8a5a2a')), (-0.008 * k, 0.05 * k, duz('#b07a3a'))], duz('#c98c46'))
        yl = [((0.195 + (0.085 if i % 2 == 0 else 0.038) * math.cos(Pi * i / 6)) * k, (0.215 + (0.085 if i % 2 == 0 else 0.038) * math.sin(Pi * i / 6)) * k) for i in range(12)]
        kabart(M, o, u, v, n, yl, [(0.01 * k, 0.006, duz('#f0561a')), (0, 0.007, duz('#ff8a1c')), (-0.01 * k, 0.045 * k, duz('#ffc21a'))], duz('#ffe45a'))
    yaz(M, ad)

def yildiz(ad):
    M = Model(); B = oluklu(M, S * 0.994, S * 0.992, S * 0.992, ton(0.5), ton(0.16), ton(0.38), None)
    for y in ('on', 'arka', 'sag', 'sol', 'ust'):
        p = egri([((0.27 if i % 2 == 0 else 0.135) * S * math.cos(Pi / 2 + Pi * i / 5), (0.27 if i % 2 == 0 else 0.135) * S * math.sin(Pi / 2 + Pi * i / 5)) for i in range(10)], 2)
        o, u, v, n = B[y][:4]; kabart(M, o, u, v, n, p, [(0.022 * S, 0.003, ton(0.16)), (0, 0.004, ton(0.2)), (-0.012 * S, 0.04 * S, ton(0.66)), (-0.04 * S, 0.055 * S, ton(0.80))], ton(0.72))
    yaz(M, ad)

def kemer(ad):
    """3x2 tas kemer: duz govde + acik renk kemer taslari"""
    M = Model(); w, h, d = 3 * S * 0.994, 2 * S * 0.992, S * 0.992; R = 0.66 * S; y0 = -h / 2; ym = y0 + 0.62 * S; n = 14; bv = 0.06 * S
    kem = [Vector((R, y0))] + [Vector((R * math.cos(Pi * i / n), ym + R * math.sin(Pi * i / n))) for i in range(n + 1)] + [Vector((-R, y0))]
    dis = [Vector((w / 2, y0))]
    for p in kem[1:-1]:
        t = Vector((p.x, p.y - ym)); t = t.normalized() if t.length > 1e-6 else Vector((1, 0)); k = min((w / 2 - bv) / abs(t.x) if abs(t.x) > 1e-4 else 1e9, (h / 2 - bv - ym) / t.y if t.y > 1e-4 else 1e9); dis.append(Vector((t.x * k, ym + t.y * k)))
    dis.append(Vector((-w / 2, y0))); dis[0] = Vector((w / 2 - bv, y0)); dis[-1] = Vector((-w / 2 + bv, y0))
    # dis cerceve dikdortgenine kose noktalarini ekle
    kw, kh = w / 2 - bv, h / 2 - bv
    for z, yon in ((d / 2, 1), (-d / 2, -1)):
        for i in range(len(kem) - 1):
            a, b, c, e = kem[i], dis[i], dis[i + 1], kem[i + 1]; pts = [a, b]
            if abs(b.x) > kw - 1e-4 and abs(c.y - kh) < 1e-4 and abs(c.x) < kw - 1e-4: pts.append(Vector((math.copysign(kw, b.x), kh)))
            elif abs(c.x) > kw - 1e-4 and abs(b.y - kh) < 1e-4 and abs(b.x) < kw - 1e-4: pts.append(Vector((math.copysign(kw, c.x), kh)))
            pts += [c, e]; P = [Vector((p.x, p.y, z)) for p in pts]
            M.yuz(P if yon > 0 else P[::-1], lambda co: ton(0.5 + 0.03 * co.y / (h / 2)))
        # kemer taslari
        for i in range(7):
            t0, t1 = Pi * (i + 0.04) / 7, Pi * (i + 0.96) / 7; r0, r1 = R + 0.005 * S, R + (0.24 if i == 3 else 0.19) * S
            p = [(r0 * math.cos(t0), ym + r0 * math.sin(t0)), (r1 * math.cos(t0), ym + r1 * math.sin(t0)), (r1 * math.cos((t0 + t1) / 2), ym + r1 * math.sin((t0 + t1) / 2)), (r1 * math.cos(t1), ym + r1 * math.sin(t1)), (r0 * math.cos(t1), ym + r0 * math.sin(t1)), (r0 * math.cos((t0 + t1) / 2), ym + r0 * math.sin((t0 + t1) / 2))]
            u = Vector((yon, 0, 0)); p = p if yon > 0 else p
            kabart(M, Vector((0, 0, z)), u, Vector((0, 1, 0)), Vector((0, 0, yon)), p, [(0.012 * S, 0.003, ton(0.2)), (0, 0.004, ton(0.3)), (-0.006 * S, 0.022 * S, ton(0.60)), (-0.022 * S, 0.034 * S, ton(0.68))], ton(0.60 if i != 3 else 0.5, 1 if i == 3 else 0))
        for sx in (-1, 1):
            for j, (yy, ww) in enumerate(((y0 + 0.30 * S, 0.5), (y0 + 0.80 * S, 0.36), (y0 + 1.72 * S, 0.5))):
                cx = sx * (kw - ww * S / 2 + 0.0 * S - 0.02 * S); hh = 0.17 * S; p = [(cx - ww * S / 2 + 0.03 * S, yy - hh), (cx + ww * S / 2 - 0.03 * S, yy - hh), (cx + ww * S / 2, yy - hh + 0.03 * S), (cx + ww * S / 2, yy + hh - 0.03 * S), (cx + ww * S / 2 - 0.03 * S, yy + hh), (cx - ww * S / 2 + 0.03 * S, yy + hh), (cx - ww * S / 2, yy + hh - 0.03 * S), (cx - ww * S / 2, yy - hh + 0.03 * S)]
                kabart(M, Vector((0, 0, z)), Vector((yon, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, yon)), p, [(0.012 * S, 0.003, ton(0.26)), (0, 0.004, ton(0.34)), (-0.006 * S, 0.016 * S, ton(0.58)), (-0.022 * S, 0.024 * S, ton(0.62))], ton(0.55 if j % 2 else 0.47))
    # kemer ici
    for i in range(len(kem) - 1):
        a, e = kem[i], kem[i + 1]; M.yuz([Vector((a.x, a.y, d / 2)), Vector((e.x, e.y, d / 2)), Vector((e.x, e.y, -d / 2)), Vector((a.x, a.y, -d / 2))], ton(0.22))
    # v11.5 ayak tabanlari (Adem: 'kopru yan yatinca ici bos'): alt yuz kapali
    for sx in (-1, 1):
        P = [(R, d / 2), (kw, d / 2), (w / 2, d / 2 - bv), (w / 2, -d / 2 + bv), (kw, -d / 2), (R, -d / 2)]; P = [Vector((sx * x, y0, z)) for x, z in P]
        n = (P[1] - P[0]).cross(P[2] - P[0]); M.yuz(P if n.y < 0 else P[::-1], ton(0.34))
    # pahli yan ve ust
    def serit(P): # P: 2B dis cizgi (saat yonu tersi), on z'den arka z'ye pahli
        for i in range(len(P) - 1):
            (a, na), (b, nb) = P[i], P[i + 1]
            K = [(0, d / 2), (bv, d / 2 - bv), (bv, -d / 2 + bv), (0, -d / 2)]
            for j in range(3):
                (k0, z0), (k1, z1) = K[j], K[j + 1]; f = lambda p, nn, k, z: Vector((p[0] + nn[0] * k, p[1] + nn[1] * k, z))
                M.yuz([f(a, na, k0, z0), f(a, na, k1, z1), f(b, nb, k1, z1), f(b, nb, k0, z0)], ton(0.56))
    serit([((kw, y0), (1, 0)), ((kw, kh), (1, 0)), ((kw, kh), (0, 1)), ((-kw, kh), (0, 1)), ((-kw, kh), (-1, 0)), ((-kw, y0), (-1, 0))])
    bmesh.ops.remove_doubles(M.bm, verts=list(M.bm.verts), dist=1e-5)
    yaz(M, ad)

T = {**{'kup%d' % n: (lambda n=n: kup('kup%d' % n, n)) for n in (1, 2, 3, 4)}, **{'kupa%d' % n: (lambda n=n: kupA('kupa%d' % n, n)) for n in (1, 2, 3, 4)},
     **{'tas%d' % n: (lambda n=n: tas('tas%d' % n, n)) for n in (1, 2, 3, 4)}, 'buz1': lambda: buz('buz1', 1), 'buz3': lambda: buz('buz3', 3),
     **{'kalas%d' % n: (lambda n=n: tahta('kalas%d' % n, n, 0.5)) for n in (1, 2, 3)}, 'direk': lambda: tahta('direk', 1, 2), 'sandik': lambda: tahta('sandik', 1, 1, True),
     'kav1': lambda: kavanoz('kav1', 1), 'kav2': lambda: kavanoz('kav2', 2), 'kav3': lambda: kavanoz('kav3', 3), 'kavB': lambda: kavanoz('kavB', 1, 2),
     'fici': lambda: fici('fici'), 'silindir': lambda: silindir('silindir'), 'sutun': lambda: sutun('sutun'), 'tnt': lambda: tnt('tnt'), 'yildiz': lambda: yildiz('yildiz'), 'kemer': lambda: kemer('kemer')}
bpy.ops.wm.read_factory_settings(use_empty=True)
sec = [a for a in (sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []) if a in T] or list(T)
for a in sec: T[a]()
