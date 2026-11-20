# Foxi Smash v10.35 (21 Kas 2026, Adem: 'altin kup ve kavanozu oyuna koyup deneyelim'): ornek_bloklar.py'deki rakip tarzi
# altin cerceveli kup ve dik cizgili kapakli kavanoz oyun modeli olarak (tek parca, kose rengi; beyaz = turun rengi, blok3b.js govde).
#   canli:     python yapi/uretici/blender/bl.py yapi/uretici/blender/kup3.py
#   ekransiz:  blender -b --python yapi/uretici/blender/kup3.py
# Cikti: yapi/model/blok2/kup3.glb (patili kup, oy* turleri), kav3_1/2/3/B.glb (kj/kvU/kvL/kvB). Oyunda ?b35=0 eski modeller.
import bpy, os, math
KOK = r'C:\Users\elgin\blok-smash'
_src = open(os.path.join(KOK, 'yapi', 'uretici', 'blender', 'ornek_bloklar.py'), encoding='utf-8').read()
exec(compile(_src[:_src.rindex('\nmain()')], 'ornek_bloklar.py', 'exec'))
CIK = os.path.join(KOK, 'yapi', 'model', 'blok2')
S = 1.55                      # oyunda kup kenari (pilot_bloklar.py S)
GOV = (1.0, 1.0, 1.0, 1.0)    # isaret: turun rengi
ALTIN = renk('#ffc21a'); BEY = renk('#fbf6ee')
ACIK = (1.0, 0.0, 1.0, 1.0)   # isaret: oyunda turun renginin ACIK tonu (cerceve, pati; rakip ornek_1 gibi). blok3b.js govde

def boya(o, c):
    me = o.data
    a = me.color_attributes.get('Col') or me.color_attributes.new('Col', 'FLOAT_COLOR', 'CORNER')
    for d in a.data: d.color = c
    me.color_attributes.active_color = a

def birlestir(ad, parcalar, x0, z0):
    for o in bpy.context.scene.objects: o.select_set(False)
    for o in parcalar: o.select_set(True)
    bpy.context.view_layer.objects.active = parcalar[0]; bpy.ops.object.join(); o = bpy.context.active_object; o.name = ad
    o.location.x -= x0; o.location.z -= z0; bpy.ops.object.transform_apply(location=True)
    # Blender'da tasarim 1 birim = 1 kup; oyunda S. Merkez kup ortasi.
    o.scale = (S, S, S); bpy.ops.object.transform_apply(scale=True)
    o.data.materials.clear()
    for x in list(o.modifiers): o.modifiers.remove(x)
    for p in o.data.polygons: p.use_smooth = True
    o.data.set_sharp_from_angle(angle=math.radians(50))   # yumusak golgelendirme (matcap bandi icin sart)
    print(ad, 'ucgen', sum(len(p.vertices) - 2 for p in o.data.polygons))
    return o

def disari(o, ad):
    for x in bpy.context.scene.objects: x.select_set(False)
    o.select_set(True); bpy.context.view_layer.objects.active = o
    yol = os.path.join(CIK, ad + '.glb')
    ist = dict(filepath=yol, export_format='GLB', use_selection=True, export_yup=True, export_apply=True, export_normals=True, export_texcoords=False,
               export_materials='NONE', export_vertex_color='ACTIVE', export_all_vertex_colors=False, export_active_vertex_color_when_no_material=True,
               export_tangents=False, export_animations=False, export_cameras=False, export_lights=False, export_extras=False)
    var = set(bpy.ops.export_scene.gltf.get_rna_type().properties.keys())
    bpy.ops.export_scene.gltf(**{k: v for k, v in ist.items() if k in var})
    print('  yazildi', yol, '%.1f KB' % (os.path.getsize(yol) / 1024))

def pati_hafif(ad, merkez, olc):
    x, y, z = merkez; par = []
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=1, location=(x, y, z - 0.06 * olc)); t = bpy.context.active_object
    t.scale = (0.17 * olc, 0.05, 0.14 * olc); par.append(t)
    for dx, dz, r in ((-0.17, 0.1, 0.065), (-0.065, 0.19, 0.07), (0.065, 0.19, 0.07), (0.17, 0.1, 0.065)):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=1, location=(x + dx * olc, y, z + dz * olc)); p = bpy.context.active_object
        p.scale = (r * olc, 0.045, r * olc * 1.15); par.append(p)
    for p in par: bpy.context.view_layer.objects.active = p; bpy.ops.object.transform_apply(scale=True)
    return par

def kup3():
    x = 20.0
    cer = kafes('k3_cer', (1, 1, 1), KAL, (x, 0, 0.5), mat('altin', '#ffc21a')); boya(cer, ACIK)
    ic = kutu('k3_ic', (0.9, 0.9, 0.9), (x, 0, 0.5), 0.05); boya(ic, GOV)
    p = []
    for yon in (-1, 1):   # pati on ve arka yuzde
        q = pati_hafif('p', (x, 0.45 * yon, 0.5), 1.15)
        if yon > 0:
            for o in q: o.rotation_euler.z = math.pi; o.location.x = 2 * x - o.location.x
        p += q
    for o in p: boya(o, BEY)   # krem pati: 30 px'te okunur (ayni renk pati kayboluyordu)
    return birlestir('kup3', [cer, ic] + p, x, 0.5)

def kav3(ad, h, olc=1):
    """h: kup cinsinden boy (1, 2, 3); olc: buyuk kavanozda 2. Govde + dik cizgili kapak (20 serit beyaz / govde rengi)."""
    x = 30.0; H = h * olc; R = 0.42 * olc; kh = 0.26 * olc
    bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=R, depth=H - kh * 0.6, location=(x, 0, (H - kh * 0.6) / 2)); g = bpy.context.active_object
    bev(g, 0.16 * olc, 5); boya(g, GOV)
    bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=0.46 * olc, depth=kh, location=(x, 0, H - kh / 2)); k = bpy.context.active_object
    me = k.data; a = me.color_attributes.new('Col', 'FLOAT_COLOR', 'CORNER'); me.color_attributes.active_color = a
    for f in me.polygons:
        c = (BEY if (f.index // 2) % 2 == 0 else GOV) if abs(f.normal.z) < 0.5 else GOV
        for li in f.loop_indices: a.data[li].color = c
    bev(k, 0.085 * olc, 4)
    return birlestir(ad, [g, k], x, H / 2)

def main3():
    for o in list(bpy.context.scene.objects):
        if o.name.startswith(('kup3', 'kav3', 'k3_', 'p.')): bpy.data.objects.remove(o, do_unlink=True)
    o = kup3(); disari(o, 'kup3'); o.location.x = 8; o.scale = (1 / S,) * 3
    for ad, h, olc in (('kav3_1', 1, 1), ('kav3_2', 2, 1), ('kav3_3', 3, 1), ('kav3_B', 1, 2)):
        o = kav3(ad, h, olc); disari(o, ad); o.hide_set(True)
    print('KUP3 TAMAM')

main3()
