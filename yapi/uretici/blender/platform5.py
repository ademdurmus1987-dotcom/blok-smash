# Foxi Smash v12.6 deneme (24 Kas 2026, Adem: 'basla ama platform cesit olsun yuvarlak kare vs'):
# Platform ayagi Blender'da (top_arabasi5.py yontemi: pahli formlar, burgulu halat, altin percin; oyunda parlak vernikli malzeme).
# Iki takim: _Y yuvarlak (yuvarlak, hap, elips, daire platformlar), _K kose (kare, sekizgen, altigen platformlar; pahli sekizgen kesit).
# Her takimda dort parca (oyun.js pAyak ile ayni olculer, oyun birimi, Blender Z = oyun y):
#   Taban_* (zemine oturan basamakli kaide, y -0.14..0.83), Govde_* (sutun, y -0.5..0.5; oyun boyuna gore uzatir: oluklar dikey),
#   Bilezik_* (halat halka, y -0.1..0.1), Baslik_* (platform altindaki genisleyen baslik, y 0..0.345).
# Malzeme adi = rol: deniz (turkuaz vernik), ahsap, altin, halat, koyu.
#   "C:\Program Files\Blender Foundation\Blender 5.3\blender.exe" -b --python yapi/uretici/blender/platform5.py [-- onizleme]
# Cikti: yapi/model/plat5/ayak.glb ; onizleme: yapi/uretici/blender/onizleme/plat5_ayak.png
import bpy, bmesh, math, os, sys
from mathutils import Vector, Matrix
BURASI = os.path.dirname(os.path.abspath(__file__)); KOK = os.path.abspath(os.path.join(BURASI, '..', '..', '..'))
CIK = os.path.join(KOK, 'yapi', 'model', 'plat5'); os.makedirs(CIK, exist_ok=True)
ARG = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
bpy.ops.wm.read_factory_settings(use_empty=True)
Pi = math.pi
def hx(h): h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]; return [((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c] + [1]
RENK = {'deniz': ('#0f9fb4', 0.3, 0), 'ahsap': ('#c9742f', 0.5, 0), 'altin': ('#f3c66a', 0.28, 0.85), 'halat': ('#e9cf9b', 0.75, 0), 'koyu': ('#06566e', 0.4, 0)}
MAT = {}
for k, (c, r, m) in RENK.items():
    M = bpy.data.materials.new(k); M.use_nodes = True; b = next(n for n in M.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = hx(c); b.inputs['Roughness'].default_value = r; b.inputs['Metallic'].default_value = m
    try: b.inputs['Coat Weight'].default_value = 0.5 if k in ('deniz', 'ahsap') else 0
    except Exception: pass
    MAT[k] = M
COL = bpy.context.scene.collection
def obje(ad, bm, mat, par=None, pah=0.0, aci=35):
    me = bpy.data.meshes.new(ad); bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(ad, me); COL.objects.link(o); o.data.materials.append(MAT[mat])
    for p in me.polygons: p.use_smooth = True
    if pah > 0:
        md = o.modifiers.new('pah', 'BEVEL'); md.width = pah; md.segments = 2; md.limit_method = 'ANGLE'; md.angle_limit = math.radians(aci); md.harden_normals = False
        try: me.set_sharp_from_angle(angle=math.radians(50))
        except Exception: pass
    if par: o.parent = par
    return o
def torna(pr, seg=64, a0=0.0):
    """pr: [(r, z)] alttan uste; Z ekseni etrafinda doner. seg=8 ve a0=pi/8: duz yuzlu sekizgen"""
    bm = bmesh.new(); rows = []
    for (r, z) in pr:
        rows.append([bm.verts.new((r * math.cos(a0 + 2 * Pi * i / seg), r * math.sin(a0 + 2 * Pi * i / seg), z)) for i in range(seg)] if r > 1e-4 else [bm.verts.new((0, 0, z))])
    for k in range(len(rows) - 1):
        A, B = rows[k], rows[k + 1]
        for i in range(seg):
            if len(A) == 1: bm.faces.new((A[0], B[i], B[(i + 1) % seg]))
            elif len(B) == 1: bm.faces.new((A[i], A[(i + 1) % seg], B[0]))
            else: bm.faces.new((A[i], A[(i + 1) % seg], B[(i + 1) % seg], B[i]))
    if len(rows[0]) > 1: bm.faces.new(list(reversed(rows[0])))
    if len(rows[-1]) > 1: bm.faces.new(rows[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); return bm
def kure(r, u=16, v=10):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, radius=r); return bm
def halat(R, r, z, par, ad, tur=9, kose=0):
    """burgulu halat: 3 iplik sarmal. kose>0: sekizgen yol (kose sutunda yuzlere oturur)"""
    for s in range(3):
        cu = bpy.data.curves.new(ad + str(s), 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = r * 0.52; cu.bevel_resolution = 1; cu.resolution_u = 2
        sp = cu.splines.new('NURBS'); n = 160; sp.points.add(n - 1)
        for i in range(n):
            a = 2 * Pi * i / n; b = a * tur * 10 / 7 + s * 2 * Pi / 3
            Rk = R if not kose else R * math.cos(Pi / 8) / math.cos(((a - Pi / 8) % (Pi / 4)) - Pi / 8) * 0.96 + R * 0.04
            c = Vector((math.cos(a), math.sin(a), 0)); p = c * (Rk + r * 0.48 * math.cos(b)) + Vector((0, 0, z + r * 0.48 * math.sin(b)))
            sp.points[i].co = (*p, 1)
        sp.use_cyclic_u = True; sp.order_u = 3
        o = bpy.data.objects.new(ad + str(s), cu); COL.objects.link(o); o.data.materials.append(MAT['halat']); o.parent = par
def bos(ad, x):
    e = bpy.data.objects.new(ad, None); COL.objects.link(e); e.location = (x, 0, 0); return e

for tk, x0 in (('Y', 0.0), ('K', 3.4)):
    kose = tk == 'K'; seg, a0 = (8, Pi / 8) if kose else (64, 0.0); kp = 1 / math.cos(Pi / 8) if kose else 1.0   # sekizgende yuz orta uzakligi = r
    T = lambda pr, sg=None: torna([(r * kp, z) for r, z in pr], sg or seg, a0)
    pah = 0.035 if kose else 0.0
    # ---- taban: turkuaz kalin kaide, halat, ahsap basamak, altin basamak, boyun ----
    tb = bos('Taban_' + tk, x0)
    obje('kaide', T([(1.36, -0.14), (1.46, -0.08), (1.48, 0.02), (1.46, 0.14), (1.38, 0.2), (1.18, 0.21)]), 'deniz', tb, pah)
    halat(1.2, 0.085, 0.27, tb, 'taban_halat', 22, kose)
    obje('basamak', T([(1.12, 0.2), (1.1, 0.42), (1.02, 0.5), (0.86, 0.52)]), 'ahsap', tb, pah)
    obje('altin_basamak', T([(0.86, 0.5), (0.86, 0.6), (0.8, 0.66), (0.66, 0.68)]), 'altin', tb, pah * 0.7)
    obje('boyun', T([(0.62, 0.6), (0.6, 0.83), (0.4, 0.84)]), 'koyu', tb)
    for i in range(8):   # kaide yaninda altin percinler
        a = a0 + 2 * Pi * i / 8 + (Pi / 8 if kose else 0); rr = 1.48 * (1 if not kose else 1.0) + 0.01
        bm = kure(0.07); bmesh.ops.translate(bm, vec=(rr * math.cos(a), rr * math.sin(a), 0.03), verts=bm.verts); obje('percin', bm, 'altin', tb)
    # ---- govde: ahsap direk; yuvarlakta 12 sig dikey oluk (uzayinca bozulmaz) ----
    gv = bos('Govde_' + tk, x0)
    if kose:
        obje('direk', T([(0.5, -0.5), (0.5, 0.5)]), 'ahsap', gv, 0.06, 30)
    else:
        bm = bmesh.new(); n, k = 96, 12; rows = []
        for z in (-0.5, 0.5):
            rows.append([bm.verts.new(((0.5 - 0.035 * max(0.0, math.cos(2 * Pi * i / n * k)) ** 6) * math.cos(2 * Pi * i / n), (0.5 - 0.035 * max(0.0, math.cos(2 * Pi * i / n * k)) ** 6) * math.sin(2 * Pi * i / n), z)) for i in range(n)])
        for i in range(n): bm.faces.new((rows[0][i], rows[0][(i + 1) % n], rows[1][(i + 1) % n], rows[1][i]))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces); obje('direk', bm, 'ahsap', gv)
    # ---- bilezik: halat + ince altin serit ----
    bl = bos('Bilezik_' + tk, x0)
    halat(0.56, 0.09, 0.0, bl, 'bil_halat', 12, kose)
    # ---- baslik: altin bant, turkuaz genisleyen yaka, altin ust kenar ----
    bs = bos('Baslik_' + tk, x0)
    obje('bas_bant', T([(0.5, -0.04), (0.6, -0.03), (0.62, 0.05), (0.56, 0.07)]), 'altin', bs, pah * 0.7)
    obje('yaka', T([(0.56, 0.06), (0.7, 0.12), (0.88, 0.2), (0.98, 0.24)]), 'deniz', bs, pah)
    obje('bas_ust', T([(0.96, 0.23), (1.03, 0.26), (1.04, 0.32), (1.0, 0.345), (0.5, 0.345)]), 'altin', bs, pah * 0.7)

bpy.ops.object.select_all(action='DESELECT')
for o in [o for o in bpy.data.objects if o.type == 'CURVE']:
    bpy.context.view_layer.objects.active = o; o.select_set(True)
bpy.ops.object.convert(target='MESH')
for o in bpy.data.objects:
    if o.type == 'MESH':
        for p in o.data.polygons: p.use_smooth = True
# parcalari kok bosluklara gore sifira al (oyunda her parca kendi yerine konur)
for e in [o for o in bpy.data.objects if o.type == 'EMPTY']: e.location = (0, 0, 0)
dosya = os.path.join(CIK, 'ayak.glb')
bpy.ops.export_scene.gltf(filepath=dosya, export_format='GLB', export_apply=True, export_yup=True, export_materials='EXPORT', export_extras=False)
ucg = sum(len(o.evaluated_get(bpy.context.evaluated_depsgraph_get()).data.loop_triangles) for o in bpy.data.objects if o.type == 'MESH')
print('YAZILDI', dosya, os.path.getsize(dosya), 'ucgen~', ucg)
if 'onizleme' in ARG:
    sc = bpy.context.scene
    for tk, x0 in (('Y', -1.8), ('K', 1.8)):   # onizlemede iki ayak yan yana, govde 2.4 boyunda
        for ad, z, sz in (('Taban_', 0, 1), ('Govde_', 0.5 + 1.2, 2.4), ('Bilezik_', 0.75, 1), ('Baslik_', 2.9, 1)):
            e = bpy.data.objects[ad + tk]; e.location = (x0, 0, z); e.scale = (1, 1, sz)
        b2 = bpy.data.objects['Bilezik_' + tk].copy(); COL.objects.link(b2); b2.location = (x0, 0, 2.7)
        for c in bpy.data.objects['Bilezik_' + tk].children: cc = c.copy(); COL.objects.link(cc); cc.parent = b2
    try: sc.render.engine = 'BLENDER_EEVEE_NEXT'
    except TypeError:
        try: sc.render.engine = 'BLENDER_EEVEE'
        except TypeError as e: print(e)
    sc.render.resolution_x, sc.render.resolution_y = 900, 700
    w = bpy.data.worlds.new('w'); w.use_nodes = True; bg = next(n for n in w.node_tree.nodes if n.type == 'BACKGROUND'); bg.inputs[0].default_value = (0.8, 0.86, 0.95, 1); sc.world = w
    for ad, loc, en in [('ana', (4, -6, 8), 900), ('arka', (-5, 4, 5), 500)]:
        L = bpy.data.lights.new(ad, 'AREA'); L.energy = en; L.size = 4; o = bpy.data.objects.new(ad, L); COL.objects.link(o); o.location = loc
        o.rotation_euler = (Vector((0, 0, 1.2)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); COL.objects.link(cam); sc.camera = cam; cam.data.lens = 40
    cam.location = (0, -9, 3.5); cam.rotation_euler = (Vector((0, 0, 1.4)) - Vector(cam.location)).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = os.path.join(BURASI, 'onizleme', 'plat5_ayak.png'); bpy.ops.render.render(write_still=True)
