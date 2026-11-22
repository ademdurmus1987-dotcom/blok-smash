# Foxi Smash v11.1 (22 Kas 2026, Adem: 'once engel ve top'): ENGELLER VE TOP, boyali set tarzinda (seker_set.py + seker.js).
#   blender -b --python yapi/uretici/blender/engel_set.py [-- duvar kol uc gobek kalkan capa halka top]
# Olcu ve pivotlar eski engellerle ayni (oyun.js engKur; fizik kutulari degismez). Oyun birimi: 1 kup = 1.55. Cikti: yapi/model/engel3/*.glb
import os, sys, math
BURASI = os.path.dirname(os.path.abspath(__file__))
_src = open(os.path.join(BURASI, 'seker_set.py'), encoding='utf-8').read()
exec(compile(_src[:_src.index('\nT = {**')], 'seker_set.py', 'exec'))
CIK = os.path.join(KOK, 'yapi', 'model', 'engel3'); os.makedirs(CIK, exist_ok=True)
X, Y, Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))
KIRMIZI, KIRMK, KREM, MOR, MORK = duz('#ee2234'), duz('#8e0a1c'), duz('#fff3df'), duz('#8a34f0'), duz('#3d0e84')
ALT, ALTA, ALTK = ton(0.5, 1), ton(0.64, 1), ton(0.22, 1)

def kt(M, cx, cy, cz, w, h, d, r, c, seg=3):
    """pahli sade kutu (merkezi verilir)"""
    n0 = len(M.bm.verts); kutu(M, w, h, d, r, c, [], None, seg=seg); M.bm.verts.ensure_lookup_table()
    for v in list(M.bm.verts)[n0:]: v.co += Vector((cx, cy, cz))

def iki(fn):
    """on ve arka yuze ayni kabartma: fn(isaret, u)"""
    for sg in (1, -1): fn(sg, X * sg)

def percin(M, x, y, z, r, sg, c=ALTA, et=ALTK):
    kabart(M, Vector((x * 1.0, y, z * sg)), X * sg, Y, Z * sg, elips(0, 0, r, r, 10), [(0.35 * r, 0.004, et), (0, 0.006, et), (-0.18 * r, 0.55 * r, c), (-0.55 * r, 0.8 * r, c)], c)

def duvar():
    M = Model(); W, H, D = 2.62, 1.86, 0.32; CER = ton(0.56, 0, 1)
    B = kutu(M, W, H, D, 0.07, CER, [(0.02, 0.0, 0.02, CER), (0.11, 0.0, 0.03, CER), (0.135, -0.02, 0.03, ton(0.40)), (0.155, -0.05, 0.03, ton(0.12))], lambda a, b: ton(0.41 + 0.03 * b, 0, 1), seg=3, m=2, sade=('sag', 'sol', 'ust', 'alt'))
    for y in ('on', 'arka'):
        o, u, v, n, a, b = B[y]
        for yy in (-b / 3, b / 3): kabart(M, o, u, v, n, [(-a, yy - 0.022), (a, yy - 0.022), (a, yy + 0.022), (-a, yy + 0.022)], [(0, 0.005, ton(0.14))], ton(0.14))
    for x in (-0.78, 0.78):
        kt(M, x, 0, 0, 0.20, H + 0.06, D + 0.10, 0.045, ALT)
        for sg in (1, -1):
            for yy in (-0.62, 0.0, 0.62): percin(M, x, yy, (D + 0.10) / 2, 0.06, sg)
    for sg in (1, -1):   # ortada altin cerceveli mor arma + tilki
        o = Vector((0, 0, sg * (D / 2 - 0.05))); kabart(M, o, X * sg, Y, Z * sg, elips(0, 0, 0.50, 0.50, 24), [(0.03, 0.004, ton(0.12)), (0, 0.006, ALTK), (-0.02, 0.11, ALT), (-0.06, 0.135, ALTA), (-0.095, 0.12, ALTK), (-0.10, 0.10, MORK)], MOR)
        tilki(M, (o + Z * (sg * 0.10), X * sg, Y, Z * sg), 0.80, ALT, MORK, ALTA)
    for x in (-1.35, 1.35):
        kt(M, x, 0, 0, 0.32, H + 0.10, D + 0.16, 0.11, KIRMIZI, 4)
        for yy in (1, -1): kt(M, x, yy * (H / 2 + 0.06), 0, 0.42, 0.20, D + 0.24, 0.075, ALT)
        kt(M, x, 0, 0, 0.36, 0.22, D + 0.19, 0.06, KREM)
    yaz(M, 'duvar')

def kol():
    M = Model(); H, D = 0.70, 0.34
    for yy, l in ((0.178, 0.55), (-0.178, 0.50)): kt(M, 0.5, yy, 0, 1.0, 0.335, D, 0.06, ton(l, 0, 1))
    kt(M, 0.5, 0, 0, 1.0, 0.10, D * 0.8, 0.01, ton(0.12), 1)
    for x in (0.28, 0.74):
        kt(M, x, 0, 0, 0.05, 0.80, D + 0.10, 0.02, ALT, 2)
    yaz(M, 'kol')

def uc():
    M = Model(); kt(M, 0.02, 0, 0, 0.16, 0.86, 0.48, 0.05, ALT); kt(M, 0.34, 0, 0, 0.60, 0.94, 0.46, 0.16, KIRMIZI, 4); kt(M, 0.35, 0, 0, 0.17, 0.965, 0.485, 0.07, KREM)
    yaz(M, 'uc')

def don_z(M):   # torna ekseni y -> z (kameraya bakar)
    for v in M.bm.verts: x, y, z = v.co; v.co = Vector((x, -z, y))

def gobek():
    M = Model()
    torna(M, [(0.46, -0.30, ALTK), (0.56, -0.26, ALT), (0.60, -0.16, ALT), (0.60, 0.08, ALT), (0.56, 0.17, ALTA), (0.50, 0.20, ALTK), (0.46, 0.17, ton(0.12, 1)), (0.43, 0.17, ALT), (0.40, 0.22, ALTK), (0.37, 0.20, KIRMK), (0.36, 0.26, KIRMIZI),
              (0.33, 0.35, KIRMIZI), (0.25, 0.43, KIRMIZI), (0.14, 0.475, KIRMIZI), (0.02, 0.485, KIRMIZI)], 32)
    don_z(M); yaz(M, 'gobek', 50, agirlik=False)

def kalkan():
    M = Model()
    torna(M, [(1.10, -0.16, ALTK), (1.30, -0.14, ALT), (1.41, -0.05, ALT), (1.43, 0.04, ALT), (1.39, 0.14, ALTA), (1.31, 0.19, ALTA), (1.24, 0.17, ALTK), (1.21, 0.10, KIRMK), (1.185, 0.10, KIRMIZI), (1.14, 0.14, KIRMIZI), (0.89, 0.19, KIRMIZI), (0.85, 0.17, KIRMK), (0.825, 0.14, KIRMK), (0.80, 0.17, KREM), (0.76, 0.20, KREM),
              (0.55, 0.23, KREM), (0.515, 0.21, duz('#d9b48c')), (0.49, 0.17, KIRMK), (0.47, 0.20, ALT), (0.43, 0.27, ALTA), (0.39, 0.285, ALTK), (0.365, 0.25, MORK), (0.35, 0.25, MOR), (0.02, 0.27, MOR)], 48)
    don_z(M)
    for i in range(12): a = 2 * Pi * i / 12; percin(M, 1.315 * math.cos(a), 1.315 * math.sin(a), 0.185, 0.065, 1)
    tilki(M, (Vector((0, 0, 0.27)), X, Y, Z), 0.66, ALT, MORK, ALTA)
    yaz(M, 'kalkan', 50, agirlik=False)

def tup(M, P, R, c, seg=10):
    """P: Vector yolu (z=0 duzleminde), R: yaricaplar"""
    hal = []
    for i, p in enumerate(P):
        t = (P[min(i + 1, len(P) - 1)] - P[max(i - 1, 0)]).normalized(); nn = Vector((-t.y, t.x, 0))
        hal.append([M.bm.verts.new(p + nn * (R[i] * math.cos(2 * Pi * j / seg)) + Z * (R[i] * math.sin(2 * Pi * j / seg))) for j in range(seg)])
    for i in range(len(P) - 1):
        for j in range(seg): M.yuz([hal[i][j], hal[i][(j + 1) % seg], hal[i + 1][(j + 1) % seg], hal[i + 1][j]][::-1], c)
    M.yuz(hal[0], c); M.yuz(hal[-1][::-1], c)

def capa():
    """gemi capasi (asagi bakar): celik mavisi govde (ton), altin capraz cubuk ve halka. Olcu: eski capaMesh ile ayni"""
    M = Model(); C, CA = ton(0.5), ton(0.60)
    tup(M, [Vector((0, y, 0)) for y in (0.0, -0.5, -1.4, -2.0)], [0.15, 0.155, 0.18, 0.21], C, 14)
    th = [Vector((0.27 * math.cos(2 * Pi * i / 20), 0.19 + 0.27 * math.sin(2 * Pi * i / 20), 0)) for i in range(21)]; tup(M, th, [0.085] * 21, ALT, 10)
    kt(M, 0, -0.36, 0, 1.30, 0.22, 0.27, 0.09, ALT, 3)
    for x in (-0.70, 0.70): kt(M, x, -0.36, 0, 0.32, 0.32, 0.34, 0.14, ALTA, 4)
    kt(M, 0, -0.36, 0, 0.40, 0.34, 0.40, 0.12, ALT, 3)
    a0, a1 = Pi * 1.07, Pi * 1.93
    yol = [Vector((0.97 * math.cos(a0 + (a1 - a0) * i / 22), -1.05 + 0.97 * math.sin(a0 + (a1 - a0) * i / 22), 0)) for i in range(23)]
    tup(M, yol, [0.115 + 0.10 * math.sin(Pi * i / 22) for i in range(23)], C, 12)
    for sx in (-1, 1):
        p = [(sx * 1.02, -0.72), (sx * 1.27, -1.30), (sx * 0.95, -1.18), (sx * 0.62, -1.20)]; p = p[::-1] if sx < 0 else p
        ar = sum(p[i - 1][0] * p[i][1] - p[i][0] * p[i - 1][1] for i in range(len(p)))
        if ar < 0: p = p[::-1]
        kabart(M, Vector((0, 0, 0)), X, Y, Z, p, [(0, 0, C), (0, 0.08, C), (-0.045, 0.15, CA)], CA)
        kabart(M, Vector((0, 0, 0)), -X, Y, -Z, [(-a, b) for a, b in p][::-1], [(0, 0, C), (0, 0.08, C), (-0.045, 0.15, CA)], CA)
    yaz(M, 'capa', 50, agirlik=False)

def zinc():
    """zincir halkasi (yassi oval), boy ~0.44"""
    M = Model(); n = 18; th = [Vector((0.135 * math.cos(2 * Pi * i / n), 0.215 * math.sin(2 * Pi * i / n), 0)) for i in range(n + 1)]
    tup(M, th, [0.062] * (n + 1), ton(0.5), 7); yaz(M, 'halka', 80, agirlik=False)

def topu():
    """Foxi gullesi: mor parlak kure, altin kusak, dort yanda krem pati (yaricap 1; oyun kendi capina getirir)"""
    M = Model(); SEG = 36; halk = []
    def c(t):   # t: enlem derecesi
        a = abs(t)
        return ALTA if a < 5 else ALT if a < 13 else MORK if a < 17 else MOR
    L = [-80, -68, -56, -45, -35, -26, -17, -13, -12.99, -5, 5, 12.99, 13, 17, 26, 35, 45, 56, 68, 80]
    def rr(t): return 1.045 if abs(t) < 13 else 1.0
    for t in L:
        a = math.radians(t); r = rr(t); halk.append([M.bm.verts.new(Vector((r * math.cos(a) * math.cos(2 * Pi * j / SEG), r * math.sin(a), -r * math.cos(a) * math.sin(2 * Pi * j / SEG)))) for j in range(SEG)])
    for i in range(len(L) - 1):
        cc = c((L[i] + L[i + 1]) / 2)
        if L[i + 1] == -12.99 or L[i] == 12.99: cc = ALTK
        for j in range(SEG): M.yuz([halk[i][j], halk[i][(j + 1) % SEG], halk[i + 1][(j + 1) % SEG], halk[i + 1][j]], cc)
    for H, t, ters in ((halk[0], -1, 1), (halk[-1], 1, 0)):
        o = M.bm.verts.new(Vector((0, t, 0)))
        for j in range(SEG): q = [H[j], H[(j + 1) % SEG], o]; M.yuz(q[::-1] if ters else q, MOR)
    # patiler: teget duzlemde cizilir, kureye oturtulur
    for k in range(6):
        ust = k % 2 == 0; al, az = math.radians(52 if ust else -52), 2 * Pi * k / 6
        n = Vector((math.cos(al) * math.cos(az), math.sin(al), -math.cos(al) * math.sin(az))); u = Y.cross(n).normalized(); v = n.cross(u)
        for p in [olc(YASTIK, 1.42)] + [elips(cx * 1.42, cy * 1.42, 0.115, 0.15, 8, d) for cx, cy, d in ((-0.265, 0.08, 0.45), (-0.094, 0.235, 0.14), (0.094, 0.235, -0.14), (0.265, 0.08, -0.45))]:
            n0 = len(M.bm.verts); kabart(M, n, u, v, n, p, [(0.035, 0.006, MORK), (0.0, 0.010, MORK), (-0.012, 0.030, KREM)], KREM); M.bm.verts.ensure_lookup_table()
            for w in list(M.bm.verts)[n0:]: h = (w.co - n).dot(n); d = w.co.normalized(); w.co = d * (1.0 + h)
    yaz(M, 'top', 30, agirlik=False)

T = {'duvar': duvar, 'kol': kol, 'uc': uc, 'gobek': gobek, 'kalkan': kalkan, 'capa': capa, 'halka': zinc, 'top': topu}
bpy.ops.wm.read_factory_settings(use_empty=True)
for a in [a for a in (sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []) if a in T] or list(T): T[a]()
