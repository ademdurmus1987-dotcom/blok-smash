# Foxi Smash v10.35 deneme (tur 3: koyu doygun renk, az cila, tahta damari, amblemsiz tahta; tur 2: cerceve 0.13->0.17, amblem 1.15, kapak 0.26 kabarik) (21 Kas 2026, Adem: 'kup, sise vs ornekler cikar', rakip ornek_1/2/6/8 kalitesinde).
# blender-skills ilkeleri (prop-artist, stylized-style, lookdev): oyun kamerasinda blok ~30 px; iri sade sekil, kalin acik cerceve,
# girintili ic panel, tek iri amblem, yuvarlatilmis kenar (isik pahda parlar). Ince ayrinti yok.
# Canli Blender: python yapi/uretici/blender/bl.py yapi/uretici/blender/ornek_bloklar.py   (BlenderMCP, ekranda gorunur)
# Ekransiz:     blender -b --python yapi/uretici/blender/ornek_bloklar.py
# Cikti: sahnede ornekler + yapi/uretici/blender/onizleme/ornek_bloklar.png (Eevee, on kamera)
import bpy, math, os
from mathutils import Vector

KOK = r'C:\Users\elgin\blok-smash' if not bpy.data.filepath else os.path.dirname(bpy.data.filepath)
CIK = os.path.join(KOK, 'yapi', 'uretici', 'blender', 'onizleme', 'ornek_bloklar.png')

def temizle():
    for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
    for m in list(bpy.data.meshes): bpy.data.meshes.remove(m)
    for m in list(bpy.data.materials): bpy.data.materials.remove(m)

def renk(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c) + (1,)

MAT = {}
def mat(ad, h, puruz=0.28, metal=0.0, cila=0.6):
    if ad in MAT: return MAT[ad]
    m = bpy.data.materials.new(ad); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = renk(h); b.inputs['Roughness'].default_value = puruz; b.inputs['Metallic'].default_value = metal
    try: b.inputs['Coat Weight'].default_value = cila; b.inputs['Coat Roughness'].default_value = 0.12
    except KeyError: pass
    m.diffuse_color = renk(h); MAT[ad] = m; return m

def kutu(ad, boy, yer=(0, 0, 0), pah=0.0, dilim=3):
    bpy.ops.mesh.primitive_cube_add(size=1, location=yer); o = bpy.context.active_object; o.name = ad
    o.scale = boy; bpy.ops.object.transform_apply(scale=True)
    if pah: bev(o, pah, dilim)
    return o

def bev(o, w, seg=3):
    m = o.modifiers.new('pah', 'BEVEL'); m.width = w; m.segments = seg; m.limit_method = 'ANGLE'; m.harden_normals = False
    uygula(o)

def uygula(o):
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)

def fark(o, kesen):
    m = o.modifiers.new('kes', 'BOOLEAN'); m.operation = 'DIFFERENCE'; m.object = kesen; m.solver = 'EXACT'
    uygula(o); bpy.data.objects.remove(kesen, do_unlink=True)

def yumusak(o, aci=40):
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    try: bpy.ops.object.shade_auto_smooth(angle=math.radians(aci))
    except Exception: bpy.ops.object.shade_smooth()

def ver(o, m): o.data.materials.clear(); o.data.materials.append(m)

def kafes(ad, boy, kalin, yer, m):
    """dis cerceve: kutudan uc yonde delik acilir, kalin kenar cubuklari kalir (rakipteki altin cerceve)"""
    o = kutu(ad, boy, yer)
    for ax in range(3):
        b = [s - 2 * kalin for s in boy]; b[ax] = boy[ax] + 1
        fark(o, kutu('k', b, yer))
    bev(o, kalin * 0.42, 4); ver(o, m); yumusak(o); return o

def pati(ad, merkez, olc, m, yon=-1):
    """iri tek amblem: taban + 4 parmak (oyunda 30 px'te okunur)"""
    x, y, z = merkez; par = []
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=1, location=(x, y, z - 0.06 * olc)); t = bpy.context.active_object
    t.scale = (0.17 * olc, 0.05, 0.14 * olc); par.append(t)
    for dx, dz, r in ((-0.17, 0.1, 0.065), (-0.065, 0.19, 0.07), (0.065, 0.19, 0.07), (0.17, 0.1, 0.065)):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=1, location=(x + dx * olc, y, z + dz * olc)); p = bpy.context.active_object
        p.scale = (r * olc, 0.045, r * olc * 1.15); par.append(p)
    for p in par: p.select_set(True)
    bpy.context.view_layer.objects.active = par[0]; bpy.ops.object.join(); o = bpy.context.active_object; o.name = ad
    bpy.ops.object.transform_apply(scale=True); ver(o, m); bpy.ops.object.shade_smooth(); return o

KAL = 0.17   # cerceve kalinligi (rakipte kenarin ~%17'si)
def kup(ad, x, cerceve, ic, amblem):
    """rakip tarzi kup: kalin parlak cerceve + girintili renkli ic + iri amblem (on yuz -Y)"""
    kafes(ad + '_cer', (1, 1, 1), KAL, (x, 0, 0.5), cerceve)
    c = kutu(ad + '_ic', (0.9, 0.9, 0.9), (x, 0, 0.5), 0.05); ver(c, ic); yumusak(c)
    pati(ad + '_pati', (x, -0.45, 0.5), 1.15, amblem)

def damar(m):
    """tahta damari: dalga dokusu govde rengini koyulastirir (iri, 30 px'te seziliyor)"""
    nt = m.node_tree; b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (0.25, 1.0, 3.0)
    w = nt.nodes.new('ShaderNodeTexWave'); w.bands_direction = 'Z'; w.inputs['Scale'].default_value = 1.6; w.inputs['Distortion'].default_value = 3; w.inputs['Detail'].default_value = 1
    r = nt.nodes.new('ShaderNodeValToRGB'); r.color_ramp.elements[0].color = renk('#c86a22'); r.color_ramp.elements[1].color = renk('#f39a3c'); r.color_ramp.elements[0].position = 0.35; r.color_ramp.elements[1].position = 0.6
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], w.inputs['Vector']); nt.links.new(w.outputs['Fac'], r.inputs['Fac']); nt.links.new(r.outputs['Color'], b.inputs['Base Color'])

def tahta(ad, x, cerceve, ic, amblem):
    kafes(ad + '_cer', (2, 0.5, 0.5), 0.11, (x, 0, 0.25), cerceve)
    c = kutu(ad + '_ic', (1.92, 0.42, 0.42), (x, 0, 0.25), 0.03); ver(c, ic); yumusak(c)
    damar(ic)   # rakipte tahtada amblem yok, damar var

def kavanoz(ad, x, govde, kapak1, kapak2):
    """rakip tarzi kavanoz: dolgun govde, kalin dik cizgili (kirmizi/beyaz) kapak, kapagin ustu govde renginde"""
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.42, depth=0.74, location=(x, 0, 0.37)); g = bpy.context.active_object; g.name = ad + '_govde'
    bev(g, 0.16, 6); ver(g, govde); yumusak(g, 60)
    bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=0.46, depth=0.26, location=(x, 0, 0.86)); k = bpy.context.active_object; k.name = ad + '_kapak'
    k.data.materials.append(kapak1); k.data.materials.append(kapak2)
    for f in k.data.polygons:   # yan yuzler sirayla beyaz / renkli (20 serit), ust ve alt kapak renkli
        if abs(f.normal.z) < 0.5: f.material_index = (f.index // 2) % 2
        else: f.material_index = 1
    bev(k, 0.085, 4); yumusak(k, 60)

def silindir(ad, x, govde, bant):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.42, depth=1.0, location=(x, 0, 0.5)); g = bpy.context.active_object; g.name = ad
    bev(g, 0.07, 4); ver(g, govde); yumusak(g, 60)
    for z in (0.17, 0.83):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.425, minor_radius=0.045, major_segments=48, minor_segments=10, location=(x, 0, z))
        t = bpy.context.active_object; ver(t, bant); bpy.ops.object.shade_smooth()

def sahne_kur():
    sc = bpy.context.scene
    try: sc.render.engine = 'BLENDER_EEVEE_NEXT'
    except TypeError: sc.render.engine = 'BLENDER_EEVEE'
    sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'
    sc.render.resolution_x, sc.render.resolution_y = 1400, 700; sc.render.film_transparent = False
    w = bpy.data.worlds.get('ornek') or bpy.data.worlds.new('ornek'); w.use_nodes = True
    w.node_tree.nodes['Background'].inputs['Color'].default_value = renk('#8fc7ff'); w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.9; sc.world = w
    bpy.ops.object.camera_add(location=(1.4, -14, 2.0)); cam = bpy.context.active_object; cam.name = 'ornek_kam'
    cam.rotation_euler = ((Vector((1.4, 0, 0.5)) - cam.location).to_track_quat('-Z', 'Y').to_euler()); cam.data.lens = 52; sc.camera = cam
    def isik(ad, yer, guc, boy, hedef=(1.1, 0, 0.5)):
        bpy.ops.object.light_add(type='AREA', location=yer); l = bpy.context.active_object; l.name = ad
        l.data.energy = guc; l.data.size = boy; l.rotation_euler = (Vector(hedef) - Vector(yer)).to_track_quat('-Z', 'Y').to_euler()
    isik('ana', (-5, -7, 6), 650, 6)      # sol on ust: genis yumusak parlama
    isik('kenar', (8, 5, 3), 700, 2)       # sag arka: kenar isigi
    isik('dolgu', (6, -8, 1), 150, 8)      # sag on: golgeleri acar
    bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0)); z = bpy.context.active_object; z.name = 'zemin'; ver(z, mat('zemin', '#d9b77a', 0.9, 0, 0))

def main():
    temizle()
    altin, mor, kirmizi, kirmiziA = mat('altin', '#ffc21a', 0.25, 0.15), mat('mor', '#8a2be2'), mat('kirmizi', '#d80c1e', 0.3, 0, 0.35), mat('kirmiziA', '#f2333b', 0.3, 0, 0.35)
    yesil, yesilA, beyaz = mat('yesil', '#22b82e', 0.3, 0, 0.35), mat('yesilA', '#46d042', 0.3, 0, 0.35), mat('beyaz', '#fff8f0', 0.35, 0, 0.3)
    tahC, tahI, mavi = mat('tahtaC', '#ffb04e', 0.3, 0, 0.4), mat('tahtaI', '#ee8c34', 0.4, 0, 0.4), mat('mavi', '#2a7cf0')
    kup('kupA', -2.6, altin, mor, altin)               # ornek_2/9: altin cerceve, mor ic
    kup('kupB', -1.35, yesilA, yesil, yesilA)           # ornek_1: ayni renk acik cerceve
    kup('kupC', -0.1, kirmiziA, kirmizi, kirmiziA)
    kavanoz('kavK', 1.15, kirmizi, beyaz, kirmizi)      # ornek_2/6: kirmizi govde, kirmizi/beyaz kapak
    kavanoz('kavY', 2.2, yesil, beyaz, yesil)
    tahta('tahta', 3.85, tahC, tahI, tahC)
    silindir('silM', 5.4, mavi, altin)
    sahne_kur()
    for o in bpy.context.scene.objects: o.select_set(False)
    os.makedirs(os.path.dirname(CIK), exist_ok=True)
    bpy.context.scene.render.filepath = CIK; bpy.ops.render.render(write_still=True)
    print('ORNEK TAMAM', CIK)

main()
