# Foxi Smash v10.13 (Adem 20 Kas 2026: 'logo referanstaki gibi 3B kabarik olsun'): GERCEK 3B logo (Blender, Cycles).
# Sisirilmis yumusak plastik harfler (kalin pah = kabarik kenar), parlak vernik; ayni tarzda kabarik rozet (altin cerceve + mor ic); patili top.
#   python yapi/uretici/blender/logo3d.py -- <font.ttf> <cikti.png>      (bpy modulu ya da blender -b --python)
# Font: yazi/baloo_lat.woff2'nin 800 kalinlikta TTF'i (fontTools ile: instancer.instantiateVariableFont(f, {'wght': 800})).
import bpy, bmesh, math, sys, random
from mathutils import Vector
arg = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
FONT, OUT = arg[0], arg[1]
rnd = random.Random(7)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
def lin(h): h = h.lstrip('#'); return tuple(((int(h[i:i + 2], 16) / 255) / 12.92 if int(h[i:i + 2], 16) / 255 <= 0.04045 else (((int(h[i:i + 2], 16) / 255) + 0.055) / 1.055) ** 2.4) for i in (0, 2, 4)) + (1,)

def malz(ad, renk, puruz=0.28, kat=0.7, sss=0.0):
    m = bpy.data.materials.new(ad); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = lin(renk); b.inputs['Roughness'].default_value = puruz
    for k, v in (('Coat Weight', kat), ('Coat Roughness', 0.08), ('Specular IOR Level', 0.55)):
        if k in b.inputs: b.inputs[k].default_value = v
    if sss and 'Subsurface Weight' in b.inputs: b.inputs['Subsurface Weight'].default_value = sss; b.inputs['Subsurface Radius'].default_value = (0.4, 0.25, 0.1)
    return m
M_FOXI = malz('foxi', '#ffae00', 0.3, 0.75, 0.1)
M_SMASH = malz('smash', '#fffaf2', 0.34, 0.6, 0.06)
M_ALTIN = malz('altin', '#ffc21e', 0.22, 0.9, 0.05)
M_MOR = malz('mor', '#5a22d8', 0.25, 0.8)
M_MOR2 = malz('mor2', '#3a1296', 0.3, 0.6)
M_PATI = malz('pati', '#ffe27a', 0.3, 0.7)

FNT = bpy.data.fonts.load(FONT)
def harf(ch, mat, boy):
    cu = bpy.data.curves.new('h_' + ch, 'FONT'); cu.body = ch; cu.font = FNT; cu.size = boy
    cu.extrude = 0.1 * boy; cu.bevel_depth = 0.042 * boy; cu.bevel_resolution = 6; cu.offset = 0.0   # offset: harfi kalinlastirir (tombul)
    cu.align_x = 'CENTER'; cu.align_y = 'CENTER'
    ob = bpy.data.objects.new('h_' + ch, cu); sc.collection.objects.link(ob); ob.data.materials.append(mat); return ob
def genislik(ob):
    bpy.context.view_layer.update(); bb = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
    return max(v.x for v in bb) - min(v.x for v in bb)
def kelime(txt, mat, boy, y, aci, zip_, ust=0.0, sik=0.05):
    obs = [harf(c, mat, boy * (1 + rnd.uniform(-0.04, 0.06))) for c in txt]
    ws = [genislik(o) for o in obs]; top = sum(ws) + sik * boy * (len(ws) - 1); x = -top / 2
    for i, (o, w) in enumerate(zip(obs, ws)):
        o.location = (x + w / 2, y + zip_[i] * boy, ust + i * 0.002); o.rotation_euler = (0, 0, math.radians(aci[i])); x += w + sik * boy
    return obs, top

FOX, wF = kelime('FOXI', M_FOXI, 2.05, 0.78, [-8, 5, -5, 7], [0.0, 0.06, -0.05, 0.05])
SMA, wS = kelime('SMASH', M_SMASH, 1.72, -0.86, [-6, 5, -4, 6, -5], [0.0, -0.05, 0.06, -0.05, 0.04])

# ---- rozet: iki kabarik yuvarlak kutu (altin cerceve), onunde biraz kucuk mor ic; ayni tarz yumusak pah
def kutu(ad, w, h, d, r, mat, loc):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc); ob = bpy.context.active_object; ob.name = ad
    ob.scale = (w, h, d); bpy.ops.object.transform_apply(scale=True)
    bv = ob.modifiers.new('pah', 'BEVEL'); bv.width = r; bv.segments = 10; bv.limit_method = 'NONE'
    ob.data.materials.append(mat); bpy.ops.object.shade_smooth(); return ob
WF, WS = wF + 0.85, wS + 0.75
WB = max(WF, WS) + 0.1
def rozet(ad, gen, pay, d, z, mat, r0):
    # iki yuvarlak satir (FOXI dar, SMASH genis) boolean ile tek parca; kabarik pah
    a = kutu(ad + 'a', wF + gen, 1.9 + pay, d, r0, mat, (0, 0.8, z)); b = kutu(ad + 'b', wS + gen, 1.75 + pay, d, r0, mat, (0, -0.86, z))
    for o in (a, b):
        bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier='pah')
    bo = a.modifiers.new('bir', 'BOOLEAN'); bo.operation = 'UNION'; bo.object = b; bo.solver = 'EXACT'
    bpy.context.view_layer.objects.active = a; bpy.ops.object.modifier_apply(modifier='bir'); bpy.data.objects.remove(b)
    bv = a.modifiers.new('yum', 'BEVEL'); bv.width = 0.06; bv.segments = 4; bv.limit_method = 'ANGLE'
    bpy.ops.object.shade_smooth(); return a
rozet('kah', 0.95, 0.5, 0.2, -0.52, M_MOR2, 0.5)
rozet('cer', 0.75, 0.32, 0.36, -0.3, M_ALTIN, 0.45)
rozet('ic', 0.38, -0.02, 0.32, -0.12, M_MOR, 0.36)
WB = wS + 0.95
# ---- patili top (sag ust kose, rozetin ustune oturur)
bx, by = wF / 2 + 0.2, 1.85
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.42, segments=48, ring_count=24, location=(bx, by, 0.25)); top = bpy.context.active_object; top.data.materials.append(M_MOR); bpy.ops.object.shade_smooth()
bpy.ops.mesh.primitive_torus_add(major_radius=0.415, minor_radius=0.045, location=(bx, by, 0.25), rotation=(math.radians(70), 0, math.radians(-25))); bant = bpy.context.active_object; bant.data.materials.append(M_ALTIN); bpy.ops.object.shade_smooth()
def pati_parca(dx, dy, r, sz=0.55):
    p = Vector((bx + dx, by + dy, 0.25)); n = (p - Vector((bx, by, 0.25))).normalized() if (dx or dy) else Vector((0, 0, 1))
    pos = Vector((bx, by, 0.25)) + (Vector((dx, dy, 0.0)) + Vector((0, 0, 0.36))).normalized() * 0.4
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=pos); o = bpy.context.active_object; o.scale = (1, 1, sz); o.data.materials.append(M_PATI); bpy.ops.object.shade_smooth()
    o.rotation_euler = Vector((0, 0, 1)).rotation_difference(pos - Vector((bx, by, 0.25))).to_euler()
pati_parca(0.02, -0.04, 0.11)
for (dx, dy) in ((-0.13, 0.08), (-0.05, 0.15), (0.06, 0.15), (0.14, 0.07)): pati_parca(dx, dy, 0.05)

# ---- isik, dunya, kamera
w = bpy.data.worlds.new('d'); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = (0.75, 0.78, 0.9, 1); bg.inputs[1].default_value = 0.4
def isik(ad, loc, guc, boy, renk=(1, 1, 1)):
    l = bpy.data.lights.new(ad, 'AREA'); l.energy = guc; l.size = boy; l.color = renk; o = bpy.data.objects.new(ad, l); sc.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler(); return o
isik('ana', (-4, 5, 9), 1500, 7)
isik('dolgu', (5, -2, 6), 380, 7, (0.9, 0.92, 1.0))
isik('ust', (0, 9, 3), 520, 5)
isik('alt', (0, -7, 2), 180, 6, (1, 0.85, 0.7))
cd = bpy.data.cameras.new('k'); cd.type = 'ORTHO'; cd.ortho_scale = WB + 0.7
cam = bpy.data.objects.new('k', cd); sc.collection.objects.link(cam); cam.location = (0, 0.1, 20); cam.rotation_euler = (0, 0, 0); sc.camera = cam
sc.render.engine = 'CYCLES'; sc.cycles.samples = 96; sc.cycles.use_denoising = True
try: sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.film_transparent = True; sc.render.resolution_x = 1000; sc.render.resolution_y = 860
sc.view_settings.view_transform = 'Standard'
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'; sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print('BITTI', OUT)
