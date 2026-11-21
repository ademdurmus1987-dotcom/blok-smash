# Foxi Smash v10.40 (21 Kas 2026, Adem: "butun bloklari Royal Smash seviyesinde parlak, puruzsuz, derinlikli oyuncak plastigi yap"):
# Mevcut blok modellerini (yapi/model/blok2, pilot, blok) OYUNCAK PLASTIGI tarzina donusturur ve yapi/model/oyuncak/<ayni yol>.glb olarak yazar.
# Eski dosyalara dokunmaz. Oyunda gorunmesi icin adres: ?oyuncak=1 (yapi/blok3b.js).
#
# Calistirma (Adem'in bilgisayari, tek tik):
#   "C:\Program Files\Blender Foundation\Blender 5.3\blender.exe" -b --python yapi/uretici/blender/oyuncak_plastik.py
#   yalniz bazilari:  ... --python yapi/uretici/blender/oyuncak_plastik.py -- cubuk1 tas2 kav2_1
# Bulut oturumu (bpy modulu):  python oyuncak_plastik.py [-- ad ...]
# Blender MCP bagliyken: betigin icerigini Blender'in Text Editor'unde acip Run Script (sahnede de uygular, sonra disa aktarir).
#
# Her model icin:
#  1. GEOMETRI: Bevel (0.045, 4 parca, aci siniri 30 derece, ust uste binme engeli) -> kalan keskin kenarlar ve kabartmalar (pati, X citasi,
#     tugla derzleri) yumusak, isik yakalayan yuvarlak kenar olur. Shade Smooth + Weighted Normal (yuz alani, keskinleri koru).
#  2. MALZEME (Principled BSDF): renkli blok: Roughness 0.18, IOR 1.48, Coat 0.85 / 0.12. Tas/kemer: Roughness 0.35, Coat 0.25.
#     Kavanoz/sise: Transmission 0.70, Roughness 0.08, IOR 1.50. Altin/yildiz: Metallic 0.85, Roughness 0.20.
#  3. ORTAM GOLGESI: Cycles ile AO pisirilir ve mevcut isik dokusuyla Multiply (faktor 0.35) birlestirilir. glTF bir 'Ambient Occlusion'
#     dugumunu tasiyamaz; bu yuzden golge dokuya GOMULUR (Three.js'te de aynen gorunur). Blender'da onizleme icin malzeme agacinda
#     AO dugumu de vardir ama disa aktarmadan once cikarilir (yoksa doku baglantisi kopar).
#  4. DISA AKTARMA: pivot oyundaki gibi tam merkezde kalir (fizik govdesi merkeze gore yerlesir; alta alinirsa bloklar yarim blok kayar),
#     Apply All Transforms, doku WebP (gomulu), tek mesh, tek malzeme.
import os, sys, math, glob

try:
    import bpy
except ImportError:
    print('bpy yok: Blender ile calistirin'); sys.exit(1)
import numpy as np

BURASI = os.path.dirname(os.path.abspath(__file__))
KOK = os.path.abspath(os.path.join(BURASI, '..', '..', '..'))
MODEL = os.path.join(KOK, 'yapi', 'model')
CIKTI = os.path.join(MODEL, 'oyuncak')
KLASOR = ['blok2', 'pilot', 'blok']

BEVEL_W, BEVEL_SEG, BEVEL_ACI = 0.045, 4, 30.0
AO_KAT = 0.35          # Multiply faktoru
AO_ORNEK = 48          # Cycles ornek sayisi (AO pisirme)
AO_MESAFE = 0.35       # AO arama mesafesi (blok ~1.5 birim)
DOKU_KALITE = 88       # WebP

def tur(ad):
    if ad.startswith(('kav', 'kavanoz', 'sise', 'pl_kavanoz')): return 'kavanoz'
    if ad.startswith(('tas', 'kemer')): return 'tas'
    if ad.startswith(('yildiz', 'pl_elmas')): return 'metal'
    return 'renkli'

PBR = {
    'renkli':  dict(Roughness=0.18, IOR=1.48, **{'Coat Weight': 0.85, 'Coat Roughness': 0.12}),
    'tas':     dict(Roughness=0.35, **{'Coat Weight': 0.25, 'Coat Roughness': 0.2}),
    'kavanoz': dict(Roughness=0.08, IOR=1.50, **{'Transmission Weight': 0.70}),
    'metal':   dict(Metallic=0.85, Roughness=0.20),
}

def secili_yap(ob):
    for o in bpy.context.view_layer.objects: o.select_set(False)
    ob.select_set(True); bpy.context.view_layer.objects.active = ob

def ice_al(yol):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=yol)
    mesler = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    if not mesler: return None
    ob = mesler[0]
    # ust nesne (glTF dugumu) varsa donusumu mesh'e aktar
    for o in list(bpy.context.scene.objects):
        if o is not ob and o.type != 'MESH': pass
    secili_yap(ob)
    if ob.parent:
        mw = ob.matrix_world.copy(); ob.parent = None; ob.matrix_world = mw
    return ob

def geometri(ob):
    secili_yap(ob)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)   # Apply All Transforms (merkez yerinde kalir)
    bpy.ops.object.shade_smooth()
    bv = ob.modifiers.new('Bevel', 'BEVEL')
    bv.width = BEVEL_W; bv.segments = BEVEL_SEG; bv.limit_method = 'ANGLE'; bv.angle_limit = math.radians(BEVEL_ACI)
    bv.use_clamp_overlap = True; bv.harden_normals = False; bv.profile = 0.5
    try: bv.miter_outer = 'MITER_ARC'
    except Exception: pass
    wn = ob.modifiers.new('WeightedNormal', 'WEIGHTED_NORMAL'); wn.keep_sharp = True; wn.mode = 'FACE_AREA'; wn.weight = 50
    for m in list(ob.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)

def eski_doku(ob):
    for m in ob.data.materials:
        if m and m.use_nodes:
            for n in m.node_tree.nodes:
                if n.type == 'TEX_IMAGE' and n.image: return n.image
    return None

def ao_pisir(ob, ad, boyut):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = AO_ORNEK
    try: sc.cycles.use_denoising = False
    except Exception: pass
    if sc.world is None: sc.world = bpy.data.worlds.new('dunya')
    sc.world.light_settings.distance = AO_MESAFE
    img = bpy.data.images.new(ad + '_ao', boyut, boyut, alpha=False)
    gec = bpy.data.materials.new(ad + '_aopisir'); gec.use_nodes = True
    tx = gec.node_tree.nodes.new('ShaderNodeTexImage'); tx.image = img; gec.node_tree.nodes.active = tx
    eski = list(ob.data.materials); ob.data.materials.clear(); ob.data.materials.append(gec)
    secili_yap(ob)
    sc.render.bake.margin = 8
    try: sc.render.bake.margin_type = 'EXTEND'
    except Exception: pass
    bpy.ops.object.bake(type='AO', margin=8, use_clear=True)
    ob.data.materials.clear()
    for m in eski: ob.data.materials.append(m)
    return np.array(img.pixels[:], dtype=np.float32).reshape(boyut, boyut, 4)[:, :, 0]

def doku_birlestir(ad, isik, ao):
    """isik dokusu x (1 - 0.35 * (1 - AO)): girintiler (kemer ici, pati cevresi, sandik cercevesi) koyulasir"""
    if isik is not None:
        w, h = isik.size
        a = np.array(isik.pixels[:], dtype=np.float32).reshape(h, w, 4)
    else:
        h = w = ao.shape[0]; a = np.ones((h, w, 4), dtype=np.float32)
    if ao.shape[0] != h:   # boyut farkliysa en yakin komsu ile olcekle
        yy = (np.arange(h) * ao.shape[0] // h); xx = (np.arange(w) * ao.shape[1] // w); ao = ao[yy][:, xx]
    k = 1.0 - AO_KAT * (1.0 - np.clip(ao, 0, 1))
    a[:, :, :3] *= k[:, :, None]; a[:, :, 3] = 1.0
    yeni = bpy.data.images.new(ad + '_isik', w, h, alpha=False)
    yeni.pixels.foreach_set(a.ravel()); yeni.update(); yeni.pack()
    return yeni

def malzeme(ob, ad, img, t, onizleme_ao=False):
    mat = bpy.data.materials.new(ad); mat.use_nodes = True; nt = mat.node_tree; nt.nodes.clear()
    pr = nt.nodes.new('ShaderNodeBsdfPrincipled'); out = nt.nodes.new('ShaderNodeOutputMaterial'); nt.links.new(pr.outputs[0], out.inputs[0])
    for k, v in PBR[t].items():
        if k in pr.inputs: pr.inputs[k].default_value = v
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = img
    vc = nt.nodes.new('ShaderNodeVertexColor')
    renkler = ob.data.color_attributes
    if len(renkler): vc.layer_name = renkler[0].name
    mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'; mx.inputs[0].default_value = 1.0
    nt.links.new(vc.outputs['Color'], mx.inputs[6]); nt.links.new(tx.outputs['Color'], mx.inputs[7])
    if onizleme_ao:   # yalniz Blender onizlemesi (disa aktarmada yok; golge zaten dokuda)
        ao = nt.nodes.new('ShaderNodeAmbientOcclusion'); m2 = nt.nodes.new('ShaderNodeMix'); m2.data_type = 'RGBA'; m2.blend_type = 'MULTIPLY'
        m2.inputs[0].default_value = AO_KAT; nt.links.new(mx.outputs[2], m2.inputs[6]); nt.links.new(ao.outputs['Color'], m2.inputs[7])
        nt.links.new(m2.outputs[2], pr.inputs['Base Color'])
    else:
        nt.links.new(mx.outputs[2], pr.inputs['Base Color'])
    ob.data.materials.clear(); ob.data.materials.append(mat)

def aktar(ob, yol):
    os.makedirs(os.path.dirname(yol), exist_ok=True)
    secili_yap(ob)
    ist = dict(filepath=yol, export_format='GLB', use_selection=True, export_yup=True, export_apply=True, export_normals=True, export_texcoords=True,
               export_materials='EXPORT', export_image_format='WEBP', export_image_quality=DOKU_KALITE, export_vertex_color='ACTIVE', export_all_vertex_colors=False,
               export_active_vertex_color_when_no_material=True, export_tangents=False, export_animations=False, export_cameras=False, export_lights=False, export_extras=False)
    var = set(bpy.ops.export_scene.gltf.get_rna_type().properties.keys())
    bpy.ops.export_scene.gltf(**{k: v for k, v in ist.items() if k in var})

def isle(yol):
    ad = os.path.splitext(os.path.basename(yol))[0]; t = tur(ad)
    ob = ice_al(yol)
    if ob is None: print('  atlandi (mesh yok)', ad); return
    v0 = len(ob.data.polygons)
    isik = eski_doku(ob)
    geometri(ob)
    boyut = isik.size[0] if isik else 512
    if not ob.data.uv_layers:   # uv'siz model (kav3, kup3): AO icin otomatik acilim
        secili_yap(ob); bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.02); bpy.ops.object.mode_set(mode='OBJECT')
        isik = None
    ao = ao_pisir(ob, ad, boyut)
    img = doku_birlestir(ad, isik, ao)
    malzeme(ob, ad, img, t)
    rel = os.path.relpath(yol, MODEL)
    hedef = os.path.join(CIKTI, rel)
    aktar(ob, hedef)
    print('  %-10s %-8s yuz %5d -> %5d  %5.1f KB  %s' % (ad, t, v0, len(ob.data.polygons), os.path.getsize(hedef) / 1024, os.path.relpath(hedef, KOK)))

def main():
    secim = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    dosyalar = []
    for k in KLASOR:
        for f in sorted(glob.glob(os.path.join(MODEL, k, '*.glb'))):
            ad = os.path.splitext(os.path.basename(f))[0]
            if secim and ad not in secim: continue
            dosyalar.append(f)
    print('oyuncak plastigi:', len(dosyalar), 'model ->', os.path.relpath(CIKTI, KOK))
    for f in dosyalar:
        try: isle(f)
        except Exception as e: print('  HATA', f, e)

main()
