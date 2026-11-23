# Foxi Smash v12.4 deneme (24 Kas 2026, Adem: 'bana gorsel kalite ver referanslar gibi, blender dan yapabilir misin'):
# Top arabasi Blender'da: pahli yumusak formlar, burgulu halat halkalar, perçinli tahta yanaklar, demir bantli parmakli tekerlekler,
# namlu arkasinda kabartma tilki patisi. Malzeme adi = renk rolu (oyun.js bunlari parlak/vernikli malzemeyle degistirir; Gardirop rolleri):
#   govde (namlu gövdesi), namlu (agiz), ahsap, altin, krem, demir, ic (namlu ici).
# Olculer top4.js ile ayni (oyun birimi). Dugumler: Araba (kok), Namlu (muylu ekseni, yatay; oyun kaldirir), TekerL, TekerR.
#   "C:\Program Files\Blender Foundation\Blender 5.3\blender.exe" -b --python yapi/uretici/blender/top_arabasi5.py [-- onizleme]
# Cikti: yapi/model/top5/araba.glb ; onizleme: yapi/uretici/blender/onizleme/top5_*.png
import bpy, bmesh, math, os, sys
from mathutils import Vector, Matrix
BURASI = os.path.dirname(os.path.abspath(__file__)); KOK = os.path.abspath(os.path.join(BURASI, '..', '..', '..'))
CIK = os.path.join(KOK, 'yapi', 'model', 'top5'); os.makedirs(CIK, exist_ok=True)
ARG = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
bpy.ops.wm.read_factory_settings(use_empty=True)
Pi = math.pi
# Blender: Z yukari, oyunun +z (namlu yonu) = Blender -Y
def hx(h): h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]; return [((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c] + [1]
RENK = {'govde': ('#f2452c', 0.32, 0), 'namlu': ('#0f9fb4', 0.3, 0), 'ahsap': ('#b9692a', 0.55, 0), 'altin': ('#f3c66a', 0.28, 0.85), 'krem': ('#fff0cf', 0.4, 0), 'demir': ('#3b3f4a', 0.4, 0.6), 'ic': ('#120a06', 0.9, 0), 'halat': ('#e9cf9b', 0.75, 0)}
MAT = {}
for k, (c, r, m) in RENK.items():
    M = bpy.data.materials.new(k); M.use_nodes = True; b = next(n for n in M.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = hx(c); b.inputs['Roughness'].default_value = r; b.inputs['Metallic'].default_value = m
    try: b.inputs['Coat Weight'].default_value = 0.5 if k in ('govde', 'namlu', 'krem') else 0
    except Exception: pass
    MAT[k] = M
COL = bpy.context.scene.collection
def obje(ad, bm, mat, par=None, yumusak=True, pah=0.0, alt=0):
    me = bpy.data.meshes.new(ad); bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(ad, me); COL.objects.link(o); o.data.materials.append(MAT[mat])
    for p in me.polygons: p.use_smooth = yumusak
    if pah > 0:
        md = o.modifiers.new('pah', 'BEVEL'); md.width = pah; md.segments = 2; md.limit_method = 'ANGLE'; md.angle_limit = math.radians(35); md.harden_normals = False
    if alt: md = o.modifiers.new('alt', 'SUBSURF'); md.levels = alt; md.render_levels = alt
    if yumusak and pah > 0:
        try: me.set_sharp_from_angle(angle=math.radians(40))
        except Exception: pass
    if par: o.parent = par
    return o
def tor(R, r, nu=64, nv=14, yay=1.0):
    """XY duzleminde halka (eksen Z)"""
    bm = bmesh.new(); rows = []
    for i in range(nu):
        a = 2 * Pi * i / nu; c = Vector((math.cos(a), math.sin(a), 0)); row = []
        for j in range(nv):
            b = 2 * Pi * j / nv; p = c * (R + r * math.cos(b)) + Vector((0, 0, r * math.sin(b))); row.append(bm.verts.new(p))
        rows.append(row)
    for i in range(nu):
        for j in range(nv): bm.faces.new((rows[i][j], rows[(i + 1) % nu][j], rows[(i + 1) % nu][(j + 1) % nv], rows[i][(j + 1) % nv]))
    return bm
def torna(pr, seg=64):
    """pr: [(r, z)] alttan uste; Z ekseni etrafinda doner"""
    bm = bmesh.new(); rows = []
    for (r, z) in pr:
        row = [bm.verts.new((r * math.cos(2 * Pi * i / seg), r * math.sin(2 * Pi * i / seg), z)) for i in range(seg)] if r > 1e-4 else [bm.verts.new((0, 0, z))]
        rows.append(row)
    for k in range(len(rows) - 1):
        A, B = rows[k], rows[k + 1]
        for i in range(seg):
            if len(A) == 1: bm.faces.new((A[0], B[i], B[(i + 1) % seg]))
            elif len(B) == 1: bm.faces.new((A[i], A[(i + 1) % seg], B[0]))
            else: bm.faces.new((A[i], A[(i + 1) % seg], B[(i + 1) % seg], B[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); return bm
def donustur(bm, M): bmesh.ops.transform(bm, matrix=M, verts=bm.verts); return bm
def kutu(w, d, h):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1); bmesh.ops.scale(bm, vec=(w, d, h), verts=bm.verts); return bm
def silindir(r, h, seg=32):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r, depth=h); return bm
def kure(r, u=24, v=16):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, radius=r); return bm
def halat(R, r, par, M, ad, tur=7):
    """burgulu halat: 3 iplik, halka boyunca sarmal (her iplik ayri boru)"""
    for s in range(3):
        cu = bpy.data.curves.new(ad + str(s), 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = r * 0.52; cu.bevel_resolution = 1; cu.resolution_u = 2; sp = cu.splines.new('NURBS'); n = 150
        sp.points.add(n - 1)
        for i in range(n):
            a = 2 * Pi * i / n; b = a * tur * 10 / 7 + s * 2 * Pi / 3; c = Vector((math.cos(a), math.sin(a), 0))
            p = c * (R + r * 0.48 * math.cos(b)) + Vector((0, 0, r * 0.48 * math.sin(b))); sp.points[i].co = (*(M @ p), 1)
        sp.use_cyclic_u = True; sp.order_u = 3
        o = bpy.data.objects.new(ad + str(s), cu); COL.objects.link(o); o.data.materials.append(MAT['halat']); o.parent = par
def pati(s, par, M, mat, kal=0.06):
    """tilki patisi: taban yastigi + 4 parmak, kabartma (pahli silindirler, eksen yerel z)"""
    for (rx, ry, x, y, r) in [(0.36, 0.29, 0, -0.18, 0), (0.13, 0.17, -0.42, 0.14, 0.35), (0.14, 0.18, -0.15, 0.4, 0.1), (0.14, 0.18, 0.15, 0.4, -0.1), (0.13, 0.17, 0.42, 0.14, -0.35)]:
        bm = silindir(1, kal * s, 40); bmesh.ops.scale(bm, vec=(rx * s, ry * s, 1), verts=bm.verts)
        donustur(bm, M @ Matrix.Translation((x * s, y * s, 0)) @ Matrix.Rotation(r, 4, 'Z')); obje('pati', bm, mat, par, pah=0.022 * s)

kok = bpy.data.objects.new('Araba', None); COL.objects.link(kok)
# ---------- namlu (yatay; eksen Blender -Y; muylu ekseni orijinde) ----------
NM = bpy.data.objects.new('Namlu', None); COL.objects.link(NM); NM.parent = kok; NM.location = (0, 0.05, 1.5)
UC = 2.05
gov = [(0.0, -0.96), (0.56, -0.96), (0.66, -0.93), (0.72, -0.86), (0.75, -0.74), (0.755, -0.5), (0.7, 0.1), (0.6, 0.9), (0.53, 1.5)]
obje('govde', donustur(torna(gov, 72), Matrix.Rotation(Pi / 2, 4, 'X')), 'govde', NM)   # torna Z ekseni -> -Y (oyunda +z)
agz = [(0.53, 1.44), (0.6, 1.5), (0.64, 1.64), (0.68, 1.82), (0.7, 1.94), (0.66, 2.02), (0.58, UC), (0.42, UC), (0.4, 1.98), (0.4, 1.6)]
obje('agiz', donustur(torna(agz, 72), Matrix.Rotation(Pi / 2, 4, 'X')), 'namlu', NM)
bm = silindir(0.405, 0.02, 48); donustur(bm, Matrix.Rotation(Pi / 2, 4, 'X') @ Matrix.Translation((0, 0, 1.62))); obje('ic', bm, 'ic', NM)
# halkalar: arka ve on halat, iki altin halka; muylu bandi
RX = Matrix.Rotation(Pi / 2, 4, 'X')
for z, R, r in [(-0.8, 0.765, 0.085), (0.78, 0.655, 0.075)]: halat(R, r, NM, RX @ Matrix.Translation((0, 0, z)), 'halat')
for z, R, r in [(-0.08, 0.725, 0.06), (1.48, 0.565, 0.055)]:
    bm = tor(R, r, 80, 14); donustur(bm, RX @ Matrix.Translation((0, 0, z))); obje('altin_halka', bm, 'altin', NM)
bm = silindir(0.15, 1.66, 32); donustur(bm, Matrix.Rotation(Pi / 2, 4, 'Y')); obje('muylu', bm, 'altin', NM, pah=0.03)
for sx in (-1, 1):
    bm = silindir(0.2, 0.08, 32); donustur(bm, Matrix.Translation((sx * 0.84, 0, 0)) @ Matrix.Rotation(Pi / 2, 4, 'Y')); obje('muylu_kapak', bm, 'altin', NM, pah=0.025)
# arka: krem kabartma pati + altin cerceve disk
bm = silindir(0.5, 0.05, 64); donustur(bm, RX @ Matrix.Translation((0, 0, -0.985))); obje('arka_disk', bm, 'altin', NM, pah=0.02)
pati(0.78, NM, RX @ Matrix.Translation((0, 0.06, -1.03)) @ Matrix.Rotation(Pi, 4, 'Y'), 'krem', 0.08)
# ustte kucuk altin pati
pati(0.28, NM, Matrix.Translation((0, -0.45, 0.66)) @ Matrix.Rotation(Pi, 4, 'Z') @ Matrix.Rotation(-0.12, 4, 'X'), 'altin', 0.07)
# ---------- kizak: tahta yanaklar (basamakli) ----------
prof = [(-1.05, 0), (0.95, 0), (0.95, 0.55), (0.55, 0.55), (0.55, 1.0), (0.05, 1.0), (0.05, 1.32), (-0.45, 1.32), (-0.45, 0.8), (-1.05, 0.5)]
for sx in (-1, 1):
    bm = bmesh.new(); vs = [bm.verts.new((0, -z, y + 0.18)) for z, y in prof]; f = bm.faces.new(vs)
    r = bmesh.ops.extrude_face_region(bm, geom=[f]); bmesh.ops.translate(bm, vec=(0.22, 0, 0), verts=[e for e in r['geom'] if isinstance(e, bmesh.types.BMVert)])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bmesh.ops.translate(bm, vec=(sx * 0.58 - 0.11, 0, 0), verts=bm.verts)
    obje('yanak', bm, 'ahsap', kok, yumusak=True, pah=0.045)
    # tahta derz cizgileri: ince koyu cubuklar yerine demir bantlar ve altin percinler
    for z, y in [(0.75, 0.42), (0.3, 0.86), (-0.2, 1.18), (-0.8, 0.42), (0.75, 0.15), (-0.8, 0.15)]:
        bm = kure(0.055, 16, 10); donustur(bm, Matrix.Translation((sx * 0.705, -z, y + 0.18))); obje('percin', bm, 'altin', kok)
    bm = kutu(0.24, 0.12, 0.6); donustur(bm, Matrix.Translation((sx * 0.58, -0.82, 0.48))); obje('bant', bm, 'demir', kok, pah=0.02)
bm = kutu(1.3, 1.9, 0.16); donustur(bm, Matrix.Translation((0, 0.05, 0.26))); obje('tabla', bm, 'ahsap', kok, pah=0.04)
bm = kutu(1.1, 0.16, 0.22); donustur(bm, Matrix.Translation((0, 0.98, 0.34))); obje('arka_kiris', bm, 'ahsap', kok, pah=0.04)
# ---------- tekerlekler ----------
for sx, ad in ((-1, 'TekerL'), (1, 'TekerR')):
    W = bpy.data.objects.new(ad, None); COL.objects.link(W); W.parent = kok; W.location = (sx * 1.02, -0.15, 0.66)
    RY = Matrix.Rotation(Pi / 2, 4, 'Y')
    bm = tor(0.56, 0.1, 64, 12); bmesh.ops.scale(bm, vec=(1, 1, 1.6), verts=bm.verts); donustur(bm, RY); obje('jant', bm, 'ahsap', W)
    bm = tor(0.645, 0.04, 64, 8); bmesh.ops.scale(bm, vec=(1, 1, 2.6), verts=bm.verts); donustur(bm, RY); obje('lastik', bm, 'demir', W)
    for i in range(8):
        bm = kutu(0.1, 0.075, 1.04); donustur(bm, Matrix.Rotation(i * Pi / 8, 4, 'X')); obje('parmak', bm, 'ahsap', W, pah=0.025)
    bm = silindir(0.17, 0.36, 32); donustur(bm, RY); obje('gobek', bm, 'altin', W, pah=0.03)
    bm = kure(0.1, 16, 10); donustur(bm, Matrix.Translation((sx * 0.2, 0, 0))); obje('gobek_ucu', bm, 'altin', W)
    for i in range(6):
        a = 2 * Pi * i / 6; bm = kure(0.035, 10, 6); donustur(bm, Matrix.Translation((sx * 0.1, 0.56 * math.cos(a), 0.56 * math.sin(a)))); obje('jant_percin', bm, 'altin', W)
bm = silindir(0.09, 2.2, 16); donustur(bm, Matrix.Translation((0, -0.15, 0.66)) @ Matrix.Rotation(Pi / 2, 4, 'Y')); obje('dingil', bm, 'demir', kok)
# egriler mesh'e (glTF egri yazmaz)
bpy.ops.object.select_all(action='DESELECT')
for o in [o for o in bpy.data.objects if o.type == 'CURVE']:
    bpy.context.view_layer.objects.active = o; o.select_set(True)
bpy.ops.object.convert(target='MESH')
for o in bpy.data.objects:
    if o.type == 'MESH':
        for p in o.data.polygons: p.use_smooth = True
dosya = os.path.join(CIK, 'araba.glb')
bpy.ops.export_scene.gltf(filepath=dosya, export_format='GLB', export_apply=True, export_yup=True, export_materials='EXPORT', export_extras=False)
ucg = sum(len(o.evaluated_get(bpy.context.evaluated_depsgraph_get()).data.loop_triangles) for o in bpy.data.objects if o.type == 'MESH')
print('YAZILDI', dosya, os.path.getsize(dosya), 'ucgen~', ucg)
if 'onizleme' in ARG:
    sc = bpy.context.scene
    try: sc.render.engine = 'BLENDER_EEVEE_NEXT'
    except TypeError:
        try: sc.render.engine = 'BLENDER_EEVEE'
        except TypeError as e: print(e)
    sc.render.resolution_x, sc.render.resolution_y = 900, 900; sc.render.film_transparent = False
    w = bpy.data.worlds.new('w'); w.use_nodes = True; bg = next(n for n in w.node_tree.nodes if n.type == 'BACKGROUND'); bg.inputs[0].default_value = (0.8, 0.86, 0.95, 1); bg.inputs[1].default_value = 1.0; sc.world = w
    for ad, loc, en in [('ana', (4, 6, 8), 900), ('arka', (-5, -4, 5), 500), ('yan', (6, -2, 2), 300)]:
        L = bpy.data.lights.new(ad, 'AREA'); L.energy = en; L.size = 4; o = bpy.data.objects.new(ad, L); COL.objects.link(o); o.location = loc
        o.rotation_euler = (Vector((0, 0, 0.8)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    NM.rotation_euler = (math.radians(-26), 0, 0)
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); COL.objects.link(cam); sc.camera = cam; cam.data.lens = 50
    for ad, loc in [('arka', (0, 7.5, 3.8)), ('yan', (6.5, -3.5, 3.2))]:
        cam.location = loc; cam.rotation_euler = (Vector((0, -0.2, 1.0)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = os.path.join(BURASI, 'onizleme', 'top5_' + ad + '.png'); bpy.ops.render.render(write_still=True)
