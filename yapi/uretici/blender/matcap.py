# Foxi Smash v10.32 (20 Kas 2026, Adem: 'matcap Blender ile'): MATCAP STUDYOSU.
#   python -I matcap.py   (bpy modulu)  ya da  blender -b --python matcap.py [-- parlak yari mat metal]
# Ortografik kamera tam karsidan bir kureye bakar (kure kareyi doldurur). Her malzeme icin iki gecis cizilir:
#   <ad>_d.png : yalniz yayinik (diffuse) isik, beyaz kure -> oyunda govde rengiyle CARPILIR (renk solmaz, hacim verir)
#   <ad>_s.png : yalniz parlama (glossy), siyah zemin -> oyunda ustune BEYAZ olarak karisir
# Isiklar: sol onde buyuk yumusak ana panel (parlama bandi), ustte genis panel (ust yuzler), sag arkada ince kenar isigi, hafif gok dolgu.
# v10.33 secilen kavanoz matcap'i (parlakC): MC2=1 AD=C KW=1.2 KG=5 CW=0.25 CG=35 RG=35 WD=0.2 LO=0.5 GA=1.3 python -I matcap.py -- parlak
# v10.34: parlakE (kavanoz, silindir: yumusak genis bant): MC2=1 AD=E KW=3.0 KG=3.5 CG=0 CW=0.01 RG=20 PZ=0.40 LO=0.6 GA=1.2 -- parlak
#   kutu duzeni (on yuz parlamaz, isik pahlarda): KUTU=1 AD=K PZ=0.28 LO=0.62 GA=1.2 -- yari | PZ=0.22 LO=0.5 GA=1.3 -- metal | PZ=0.5 LO=0.6 GA=1.1 KG=5 UG=5 -- mat
#   oyunda mcS 1.3 (parlama), mcK 1.45 (govde parlakligi).
# Cikti: yapi/doku/matcap/. Oyun: blok3b.js (kavanoz ve digerleri).
import bpy, math, os, sys
BURASI = os.path.dirname(os.path.abspath(__file__))
KOK = os.path.dirname(os.path.dirname(os.path.dirname(BURASI)))
CIK = os.path.join(KOK, 'yapi', 'doku', 'matcap'); os.makedirs(CIK, exist_ok=True)
N = 256

# ad: (puruz, parlama gucu carpani, ana panel genisligi)
MALZ = {
    'parlak': (0.16, 1.0, 1.0),    # kavanoz, silindir: islak seker plastik
    'yari':   (0.22, 0.8, 1.15),   # kup, tahta: yari parlak boyali plastik
    'mat':    (0.55, 0.45, 1.3),   # tas: mat
    'metal':  (0.18, 1.0, 1.0),    # altin, demir (metal kendi rengini yansitir)
}

def sahne():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 256
    try: sc.cycles.use_denoising = True
    except Exception: pass
    sc.render.resolution_x = sc.render.resolution_y = N; sc.render.film_transparent = True
    sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'; sc.view_settings.exposure = 0; sc.view_settings.gamma = 1
    sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGB'
    # kamera: -Y'den +Y'ye bakar; goruntu sagi +X, ustu +Z
    cam = bpy.data.objects.new('kam', bpy.data.cameras.new('kam')); cam.data.type = 'ORTHO'; cam.data.ortho_scale = 2.0
    cam.location = (0, -10, 0); cam.rotation_euler = (math.pi / 2, 0, 0); sc.collection.objects.link(cam); sc.camera = cam
    bpy.ops.mesh.primitive_uv_sphere_add(segments=128, ring_count=64, radius=1.0); kure = bpy.context.active_object
    bpy.ops.object.shade_smooth()
    # dunya: ustte acik, altta los dolgu
    w = bpy.data.worlds.new('gok'); w.use_nodes = True; nt = w.node_tree; nt.nodes.clear()
    tc = nt.nodes.new('ShaderNodeTexCoord'); sx = nt.nodes.new('ShaderNodeSeparateXYZ'); mr = nt.nodes.new('ShaderNodeMapRange'); bg = nt.nodes.new('ShaderNodeBackground'); out = nt.nodes.new('ShaderNodeOutputWorld')
    nt.links.new(tc.outputs['Generated'], sx.inputs[0]); nt.links.new(sx.outputs['Z'], mr.inputs['Value'])
    mr.inputs['From Min'].default_value = 0; mr.inputs['From Max'].default_value = 1; mr.inputs['To Min'].default_value = 0.08; mr.inputs['To Max'].default_value = 0.35
    nt.links.new(mr.outputs['Result'], bg.inputs['Strength']); nt.links.new(bg.outputs[0], out.inputs[0]); sc.world = w
    return kure

def panel(ad, konum, boyut, guc):
    """isik yayan duz panel (genislik x yukseklik), kureye bakar; uzun kenar boyut[1] dunyada dikey"""
    from mathutils import Vector
    bpy.ops.mesh.primitive_plane_add(size=1.0); o = bpy.context.active_object; o.name = ad
    o.scale = (boyut[0], boyut[1], 1); o.location = konum
    d = (Vector((0, 0, 0)) - Vector(konum)).normalized(); o.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
    m = bpy.data.materials.new(ad); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    e = nt.nodes.new('ShaderNodeEmission'); e.inputs['Strength'].default_value = guc; out = nt.nodes.new('ShaderNodeOutputMaterial'); nt.links.new(e.outputs[0], out.inputs[0])
    o.data.materials.append(m); o.visible_camera = False; o['guc'] = guc
    return o

E = lambda k, v: float(os.environ.get(k, v))
def isiklar(gen):
    if os.environ.get('KUTU'):   # v10.34 kup/tahta: on yuz (kameraya bakan) parlamaz, isik yalniz sol-ust pahlarda ve sag kenarda (referans bloklar)
        panel('ana', (-4.6, E('AY', -1.2), 1.4), (E('KW', 1.2), 7.0), E('KG', 8))
        panel('ust', (-0.6, E('AY', -1.2), 4.6), (6.0, E('UW', 1.2)), E('UG', 8))
        panel('kenar', (E('RX', 3.4), E('RY', 3.4), 0.0), (E('RW', 0.5), 7.0), E('RG', 14))
        panel('dolgu', (3.0, -4.5, -1.5), (4.0, 4.0), E('DG', 0.25))
        return
    if os.environ.get('MC2'):   # v10.33 duzen: dar ana panel + keskin cekirdek serit, guclu kenar isigi
        panel('ana', (-3.0, -3.6, 0.3), (E('KW', 1.0), 7.0), E('KG', 6))
        panel('cek', (-2.9, -3.7, 0.3), (E('CW', 0.22), 7.0), E('CG', 30))
        panel('ust', (0.4, -2.2, 4.2), (4.0, 1.2), E('UG', 5))
        panel('kenar', (E('RX', 3.4), E('RY', 3.4), 0.0), (E('RW', 0.5), 7.0), E('RG', 22))
        panel('dolgu', (3.0, -4.5, -1.5), (4.0, 4.0), E('DG', 0.25))
        return
    panel('ana', (-3.0, -3.6, 0.3), (2.4 * gen, 7.0), 9)          # sol onde dikey uzun panel: govdede genis parlama bandi
    panel('ust', (0.4, -2.2, 4.2), (5.0, 1.6), 6)                  # ustte genis panel: ust yuz, kapak
    panel('kenar', (4.2, 1.6, 0.0), (0.35, 7.0), 8)                # sag arkada ince kenar isigi
    panel('dolgu', (3.0, -4.5, -1.5), (4.0, 4.0), 1.2)             # sag onde zayif dolgu

def guc_carp(k):
    for o in bpy.context.scene.objects:
        if 'guc' in o: o.active_material.node_tree.nodes['Emission'].inputs['Strength'].default_value = o['guc'] * k

def malzeme(kure, tur, puruz, metal):
    m = bpy.data.materials.new('m'); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); out = nt.nodes.new('ShaderNodeOutputMaterial')
    if tur == 'd':
        b = nt.nodes.new('ShaderNodeBsdfDiffuse'); b.inputs['Color'].default_value = (0.8, 0.8, 0.8, 1)
    else:
        b = nt.nodes.new('ShaderNodeBsdfGlossy' if 'ShaderNodeBsdfGlossy' in dir(bpy.types) or True else 'ShaderNodeBsdfAnisotropic')
        b.inputs['Color'].default_value = (1, 1, 1, 1); b.inputs['Roughness'].default_value = puruz
    nt.links.new(b.outputs[0], out.inputs[0]); kure.data.materials.clear(); kure.data.materials.append(m)

def ciz(yol):
    bpy.context.scene.render.filepath = yol; bpy.ops.render.render(write_still=True); print('  yazildi', yol)

def duzelt(yol):
    # gölgelendirme: en aydinlik = 1, en koyu ~0.62 (renk solmaz, kenar kararmaz; referans gibi yumusak hacim)
    import numpy as np
    im = bpy.data.images.load(yol); a = np.array(im.pixels[:], dtype=np.float32).reshape(N, N, 4)
    v = a[:, :, :3].mean(axis=2); ic = v > 0.001
    lo, hi = float(np.percentile(v[ic], 2)), float(np.percentile(v[ic], 99.5))
    v = np.clip((v - lo) / max(hi - lo, 1e-6), 0, 1); lo = E('LO', 0.62); v = v ** E('GA', 1.0); v = lo + (1 - lo) * v
    a[:, :, 0] = a[:, :, 1] = a[:, :, 2] = v; a[:, :, 3] = 1
    im.pixels.foreach_set(a.ravel()); im.filepath_raw = yol; im.file_format = 'PNG'; im.save()

def main():
    sec = [a for a in (sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []) if a in MALZ] or list(MALZ)
    ek = os.environ.get('AD', '')
    for ad in sec:
        puruz, g, gen = MALZ[ad]; puruz = E('PZ', puruz)   # v10.34: puruz ortamdan (yumusak genis bant)
        kure = sahne(); isiklar(gen)
        bg = bpy.context.scene.world.node_tree.nodes['Background']
        bg.inputs['Strength'].default_value = E('WD', 1.0); guc_carp(0.28); malzeme(kure, 'd', puruz, 0); ciz(os.path.join(CIK, ad + ek + '_d.png'))
        bg.inputs['Strength'].default_value = 0; bpy.context.scene.world.node_tree.links.clear()   # parlama gecisi: siyah gok
        guc_carp(g); bpy.data.objects['dolgu'].hide_render = True; malzeme(kure, 's', puruz, 0); ciz(os.path.join(CIK, ad + ek + '_s.png'))
        duzelt(os.path.join(CIK, ad + ek + '_d.png'))

main()
