# Foxi Smash PILOT (17 Kas 2026): oyuncak tarzi 5 deneme blogu. Blender ile uretilir, GLB olarak yapi/model/pilot/ altina yazilir.
#   blender -b --python yapi/uretici/blender/pilot_bloklar.py            (hepsi)
#   blender -b --python yapi/uretici/blender/pilot_bloklar.py -- kup     (yalniz biri: kup kalas kavanoz levha sutun)
# Her model: gercek geometri (yuvarlak kenar, girintili pano, kabartma amblem), en cok ~800 ucgen, pivot merkezde, 1 birim = S = 1.55.
# Renk kose renklerinde (COLOR_0). Ortam golgesi + yumusak gok isigi Cycles ile HESAPLANIR ve 512 piksellik tek dokuya gomulur.
# Tam beyaz (1,1,1) kose rengi = "govde rengi" isareti: oyun (pilot_sekil.js) onu turun rengine cevirir (tek dosyadan 3 renk kup, 2 renk kavanoz).
# Kimlik bizim: pati izi ve tilki amblemi, korsan renkleri. Baska oyunun amblemi kullanilmaz.
import bpy, bmesh, math, os, sys
import numpy as np
from mathutils import Vector, Matrix

S = 1.55
BURASI = os.path.dirname(os.path.abspath(__file__))
KOK = os.path.dirname(os.path.dirname(os.path.dirname(BURASI)))
CIKTI = os.path.join(KOK, 'yapi', 'model', 'pilot')
ONIZ = os.path.join(BURASI, 'onizleme')
os.makedirs(CIKTI, exist_ok=True); os.makedirs(ONIZ, exist_ok=True)
DOKU = 512
ORNEK = 160            # pisirme ornek sayisi
Pi = math.pi

def lin(c): return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
def renk(h): h = h.lstrip('#'); return tuple(lin(int(h[i:i + 2], 16) / 255) for i in (0, 2, 4)) + (1.0,)
GOVDE = (1.0, 1.0, 1.0, 1.0)      # isaret: oyunda turun rengi olur
KREM = renk('#fff0cf'); ALTIN = renk('#ffb62a'); KOYU = renk('#1d2440'); KIRMIZI = renk('#e2302a')

# ------------------------------------------------------------------ geometri yardimcilari (OYUN eksenleri: x sag, y yukari, z one)
def bm_al(bm, sec=None):
    """bmesh -> (kose listesi, yuz listesi, yuz rengi listesi)"""
    bm.verts.index_update()
    V = [tuple(v.co) for v in bm.verts]
    F = [[v.index for v in f.verts] for f in bm.faces]
    C = [sec(f) if sec else GOVDE for f in bm.faces]
    return V, F, C

def kutu_bm(w, h, d, r, seg):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = Vector((v.co.x * w, v.co.y * h, v.co.z * d))
    bmesh.ops.bevel(bm, geom=list(bm.edges), offset=r, offset_type='OFFSET', segments=seg, profile=0.5, affect='EDGES')
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    return bm

def buyuk_yuz(bm, n):
    """n yonune bakan en buyuk duz yuz"""
    n = Vector(n); en = None
    for f in bm.faces:
        if f.normal.dot(n) > 0.999 and (en is None or f.calc_area() > en.calc_area()): en = f
    return en

def pano(bm, f, kalinlik, derinlik):
    """yuzu iceri cercevele ve pano kismini 'derinlik' kadar gom (derinlik < 0: disari cikar). Doner: pano yuzu"""
    n = f.normal.copy()
    bmesh.ops.inset_region(bm, faces=[f], thickness=kalinlik, depth=0.0, use_even_offset=True, use_boundary=True)
    for v in f.verts: v.co -= n * derinlik
    bm.normal_update()
    return f

def kabartma(o, u, v, pts, halkalar, c):
    """duzlem ustunde kabartma kabuk. o: merkez, u/v: duzlem eksenleri (u x v = dis normal), pts: (u, v) saat yonunun tersine,
    halkalar: [(olcek, yukseklik)] alttan uste; ust kapak tek yuz. Alt acik (govdenin icinde kalir)."""
    o, u, v = Vector(o), Vector(u), Vector(v); n = u.cross(v)
    cx = sum(p[0] for p in pts) / len(pts); cy = sum(p[1] for p in pts) / len(pts)
    V, F, m = [], [], len(pts)
    for (s, hh) in halkalar:
        for (a, b) in pts: V.append(tuple(o + u * (cx + (a - cx) * s) + v * (cy + (b - cy) * s) + n * hh))
    for i in range(len(halkalar) - 1):
        for j in range(m):
            k = (j + 1) % m; F.append([i * m + j, i * m + k, (i + 1) * m + k, (i + 1) * m + j])
    F.append([(len(halkalar) - 1) * m + j for j in range(m)])
    return V, F, [c] * len(F)

def elips(cx, cy, rx, ry, n, don=0.0, faz=0.0):
    out = []
    for i in range(n):
        a = faz + 2 * Pi * i / n; x, y = rx * math.cos(a), ry * math.sin(a)
        out.append((cx + x * math.cos(don) - y * math.sin(don), cy + x * math.sin(don) + y * math.cos(don)))
    return out

def yuz_cerceve(yon, uzak):
    """yuz adi -> (merkez, u, v): u x v = dis normal"""
    return {'on': ((0, 0, uzak), (1, 0, 0), (0, 1, 0)), 'arka': ((0, 0, -uzak), (-1, 0, 0), (0, 1, 0)),
            'sag': ((uzak, 0, 0), (0, 0, -1), (0, 1, 0)), 'sol': ((-uzak, 0, 0), (0, 0, 1), (0, 1, 0)),
            'ust': ((0, uzak, 0), (1, 0, 0), (0, 0, -1)), 'alt': ((0, -uzak, 0), (1, 0, 0), (0, 0, 1))}[yon]
YON = {'on': (0, 0, 1), 'arka': (0, 0, -1), 'sag': (1, 0, 0), 'sol': (-1, 0, 0), 'ust': (0, 1, 0), 'alt': (0, -1, 0)}

def pati(o, u, v, k, hh, c):
    """pati izi: buyuk yastik + 4 parmak. k: olcek (iz yaklasik 0.66k genis), hh: kabartma yuksekligi"""
    P = []
    yastik = [(0.0, -0.275), (0.13, -0.26), (0.215, -0.17), (0.20, -0.06), (0.10, 0.03), (0.0, 0.05), (-0.10, 0.03), (-0.20, -0.06), (-0.215, -0.17), (-0.13, -0.26)]
    P.append(kabartma(o, u, v, [(a * k, b * k) for a, b in yastik], [(1.0, -0.006), (0.93, hh * 0.5), (0.70, hh)], c))
    for (cx, cy, don) in [(-0.255, 0.075, 0.45), (-0.092, 0.225, 0.14), (0.092, 0.225, -0.14), (0.255, 0.075, -0.45)]:
        P.append(kabartma(o, u, v, elips(cx * k, cy * k, 0.07 * k, 0.092 * k, 6, don, Pi / 6), [(1.0, -0.006), (0.60, hh)], c))
    return P

def tilki(o, u, v, k, hh):
    """tilki basi: sivri kulaklar, genis yanaklar, sivri cene + goz ve burun"""
    bas = [(0.0, -0.34), (0.17, -0.21), (0.37, -0.03), (0.30, 0.11), (0.37, 0.40), (0.15, 0.25), (0.0, 0.28), (-0.15, 0.25), (-0.37, 0.40), (-0.30, 0.11), (-0.37, -0.03), (-0.17, -0.21)]
    P = [kabartma(o, u, v, [(a * k, b * k) for a, b in bas], [(1.0, -0.006), (0.95, hh * 0.55), (0.80, hh)], ALTIN)]
    ob = Vector(o) + Vector(u).cross(Vector(v)) * (hh - 0.004)
    P.append(kabartma(ob, u, v, [(0.0 * k, -0.33 * k), (0.065 * k, -0.25 * k), (0.0, -0.20 * k), (-0.065 * k, -0.25 * k)], [(1.0, 0.0), (0.7, hh * 0.45)], KOYU))   # burun
    for sx in (-1, 1):
        goz = [(sx * 0.10, -0.02), (sx * 0.20, 0.03), (sx * 0.215, 0.10), (sx * 0.12, 0.06)]
        if sx < 0: goz = goz[::-1]
        P.append(kabartma(ob, u, v, [(a * k, b * k) for a, b in goz], [(1.0, 0.0), (0.7, hh * 0.4)], KOYU))
        ic = [(sx * 0.215, 0.16), (sx * 0.325, 0.325), (sx * 0.305, 0.17)]
        if sx > 0: ic = ic[::-1]
        P.append(kabartma(ob, u, v, [(a * k, b * k) for a, b in ic], [(1.0, 0.0), (0.7, hh * 0.35)], KREM))   # kulak ici
    return P

def torna(prof, seg, dalga=None):
    """prof: [(yaricap, y, renk)] alttan uste; renk o noktadan bir sonrakine giden kusagin rengi (fonksiyon olabilir: dilim no -> renk).
    dalga: {halka no: carpan} tek numarali dilimlerde yaricap carpani (yiv / tirtik). Alt ve ust kapak dolu."""
    V, F, C, n = [], [], [], len(prof)
    for i, (r, y, _) in enumerate(prof):
        for j in range(seg):
            a = 2 * Pi * j / seg; rr = r * (dalga[i] if dalga and i in dalga and j % 2 else 1.0)
            V.append((rr * math.cos(a), y, -rr * math.sin(a)))
    for i in range(n - 1):
        c = prof[i][2]
        for j in range(seg):
            k = (j + 1) % seg; F.append([i * seg + j, i * seg + k, (i + 1) * seg + k, (i + 1) * seg + j]); C.append(c(j) if callable(c) else c)
    F.append([j for j in range(seg)][::-1]); C.append(prof[0][2] if not callable(prof[0][2]) else prof[0][2](0))
    F.append([(n - 1) * seg + j for j in range(seg)]); ust = prof[-1][2]; C.append(ust(0) if callable(ust) else ust)
    return V, F, C

# ------------------------------------------------------------------ nesne kurma, pisirme, disa aktarma
OYUN2BL = Matrix(((1, 0, 0, 0), (0, 0, -1, 0), (0, 1, 0, 0), (0, 0, 0, 1)))   # oyun (x, y, z) -> Blender (x, -z, y); disa aktarim (+Y yukari) geri cevirir

def nesne(ad, parcalar, keskin=62.0):
    bm = bmesh.new(); kat = bm.loops.layers.float_color.new('Col')
    for (V, F, C) in parcalar:
        vs = [bm.verts.new(p) for p in V]
        for f, c in zip(F, C):
            try: yz = bm.faces.new([vs[i] for i in f])
            except ValueError: continue
            for l in yz.loops: l[kat] = c
    bmesh.ops.triangulate(bm, faces=list(bm.faces))
    bmesh.ops.transform(bm, matrix=OYUN2BL, verts=list(bm.verts))
    me = bpy.data.meshes.new(ad); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    me.set_sharp_from_angle(angle=math.radians(keskin))
    ob = bpy.data.objects.new(ad, me); bpy.context.scene.collection.objects.link(ob)
    aktif(ob)
    m = ob.modifiers.new('agirlik', 'WEIGHTED_NORMAL'); m.mode = 'FACE_AREA'; m.weight = 50; m.keep_sharp = True
    bpy.ops.object.modifier_apply(modifier=m.name)
    me = ob.data
    if 'Col' in me.color_attributes: me.color_attributes.active_color = me.color_attributes['Col']; me.color_attributes.render_color_index = list(me.color_attributes.keys()).index('Col')
    return ob

def aktif(ob):
    for o in bpy.context.scene.objects: o.select_set(False)
    ob.select_set(True); bpy.context.view_layer.objects.active = ob

def uv_ac(ob):
    aktif(ob); bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.012, area_weight=0.0, correct_aspect=True, scale_to_bounds=False)
    bpy.ops.object.mode_set(mode='OBJECT')

def dunya():
    """yumusak gok: ustten aydinlik, alttan hafif los (her yonden isik gelir: sert golge yok, girintiler dogal koyulasir)"""
    w = bpy.data.worlds.new('gok'); w.use_nodes = True; nt = w.node_tree; nt.nodes.clear()
    geo = nt.nodes.new('ShaderNodeNewGeometry'); ay = nt.nodes.new('ShaderNodeSeparateXYZ'); mr = nt.nodes.new('ShaderNodeMapRange')
    bg = nt.nodes.new('ShaderNodeBackground'); out = nt.nodes.new('ShaderNodeOutputWorld')
    nt.links.new(geo.outputs['Incoming'], ay.inputs[0]); nt.links.new(ay.outputs['Z'], mr.inputs['Value'])
    mr.inputs['From Min'].default_value = -1; mr.inputs['From Max'].default_value = 1; mr.inputs['To Min'].default_value = 1.0; mr.inputs['To Max'].default_value = 0.62   # Incoming: kameradan disari; z = -1 yukari bakis
    nt.links.new(mr.outputs['Result'], bg.inputs['Strength']); nt.links.new(bg.outputs[0], out.inputs[0])
    bpy.context.scene.world = w

def pisir(ob, ad):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = ORNEK
    try: sc.cycles.use_denoising = False
    except Exception: pass
    img = bpy.data.images.new(ad + '_isik', DOKU, DOKU, alpha=True); img.generated_color = (0, 0, 0, 0)
    mat = bpy.data.materials.new(ad + '_pisir'); mat.use_nodes = True; nt = mat.node_tree; nt.nodes.clear()
    bs = nt.nodes.new('ShaderNodeBsdfDiffuse'); bs.inputs['Color'].default_value = (0.8, 0.8, 0.8, 1); out = nt.nodes.new('ShaderNodeOutputMaterial'); nt.links.new(bs.outputs[0], out.inputs[0])
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = img; nt.nodes.active = tx; tx.select = True
    ob.data.materials.clear(); ob.data.materials.append(mat)
    aktif(ob)
    sc.render.bake.margin = 6
    try: sc.render.bake.margin_type = 'EXTEND'
    except Exception: pass
    bpy.ops.object.bake(type='DIFFUSE', pass_filter={'DIRECT', 'INDIRECT'}, margin=6, use_clear=True)
    # sonradan isleme: en aydinlik duz yuz = 1; golge biraz belirginlesir ve hafif mor-lacivert tona kayar (gri-kirli degil, oyuncak gibi temiz)
    a = np.array(img.pixels[:], dtype=np.float32).reshape(DOKU, DOKU, 4)
    v = a[:, :, :3].mean(axis=2); dolu = a[:, :, 3] > 0.5
    if not dolu.any(): dolu = v > 0
    ust = float(np.percentile(v[dolu], 97)); v = np.clip(v / max(ust, 1e-6), 0, 1)
    v = v ** 1.35
    v[~dolu] = float(np.median(v[dolu]))
    ton = np.array([0.34, 0.27, 0.46], dtype=np.float32)
    rgb = ton[None, None, :] + (1 - ton[None, None, :]) * v[:, :, None]
    a[:, :, :3] = rgb; a[:, :, 3] = 1.0
    img.pixels.foreach_set(a.ravel()); img.update()
    yol = os.path.join(ONIZ, ad + '_isik.jpg'); img.filepath_raw = yol; img.file_format = 'JPEG'
    try: img.save(quality=86)
    except TypeError: img.save()
    print('  pisirildi', ad, 'ust=%.3f' % ust, 'en koyu=%.2f' % float(v[dolu].min()))
    return img

def malzeme(ob, ad, img, puruz):
    """disa aktarilan malzeme: doku (pisirilmis isik) x kose rengi"""
    mat = bpy.data.materials.new(ad); mat.use_nodes = True; nt = mat.node_tree; nt.nodes.clear()
    pr = nt.nodes.new('ShaderNodeBsdfPrincipled'); out = nt.nodes.new('ShaderNodeOutputMaterial'); nt.links.new(pr.outputs[0], out.inputs[0])
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = img
    vc = nt.nodes.new('ShaderNodeVertexColor'); vc.layer_name = 'Col'
    mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'; mx.inputs[0].default_value = 1.0
    nt.links.new(vc.outputs['Color'], mx.inputs[6]); nt.links.new(tx.outputs['Color'], mx.inputs[7]); nt.links.new(mx.outputs[2], pr.inputs['Base Color'])
    pr.inputs['Roughness'].default_value = puruz; pr.inputs['Metallic'].default_value = 0.0
    ob.data.materials.clear(); ob.data.materials.append(mat)

def aktar(ob, ad):
    aktif(ob); yol = os.path.join(CIKTI, ad + '.glb')
    ist = dict(filepath=yol, export_format='GLB', use_selection=True, export_yup=True, export_apply=True, export_normals=True, export_texcoords=True,
               export_materials='EXPORT', export_image_format='JPEG', export_jpeg_quality=84, export_image_quality=84, export_vertex_color='ACTIVE', export_all_vertex_colors=False,
               export_active_vertex_color_when_no_material=True, export_tangents=False, export_animations=False, export_cameras=False, export_lights=False, export_extras=False)
    var = set(bpy.ops.export_scene.gltf.get_rna_type().properties.keys())
    bpy.ops.export_scene.gltf(**{k: v for k, v in ist.items() if k in var})
    print('  yazildi', yol, '%.1f KB' % (os.path.getsize(yol) / 1024))

def uret(ad, parcalar, puruz=0.34, keskin=62.0):
    print('==', ad)
    ob = nesne(ad, parcalar, keskin)
    ucgen = len(ob.data.polygons); print('  ucgen', ucgen, 'kose', len(ob.data.vertices))
    assert ucgen <= 830, (ad, ucgen)
    uv_ac(ob); img = pisir(ob, ad); malzeme(ob, ad, img, puruz); aktar(ob, ad)
    ob.hide_render = True   # sonraki modelin pisirmesinde golge yapmasin (hepsi ayni noktada duruyor)
    return ob

# ------------------------------------------------------------------ 1) amblemli kup (1x1x1)
def kup():
    a = S * 0.995; r = 0.115 * S; hf = a / 2; gom = 0.032 * S
    bm = kutu_bm(a, a, a, r, 2)
    for y in YON.values(): pano(bm, buyuk_yuz(bm, y), 0.065 * S, gom)
    P = [bm_al(bm)]; bm.free()
    for yon in ('on', 'arka', 'sag', 'sol'):
        o, u, v = yuz_cerceve(yon, hf - gom); P += pati(o, u, v, 0.90 * S, 0.05 * S, KREM)
    return uret('pl_kup', P, 0.30)

# ------------------------------------------------------------------ 2) uzun kalas (3x1x1): cerceveli tahta
def kalas():
    w, h, d = 3 * S * 0.998, S * 0.995, S * 0.995; r = 0.085 * S; gom = 0.04 * S; kal = 0.115 * S
    CERCEVE = renk('#e2680f'); TAHTA = renk('#ffa232'); TAHTA2 = renk('#ff9420')
    bm = kutu_bm(w, h, d, r, 2)
    panolar = {}
    for ad, y in YON.items(): panolar[ad] = pano(bm, buyuk_yuz(bm, y), kal, gom)
    # on ve arka panoda uc tahta: pano yatay ucu bolunur, her tahta hafif disari kabarir (aralarda gercek derz)
    tahta = set()
    for ad in ('on', 'arka', 'ust', 'alt'):
        f = panolar[ad]; n = f.normal.copy()
        if ad in ('on', 'arka'): dik = [e for e in f.edges if abs((e.verts[0].co - e.verts[1].co).normalized().y) > 0.9]
        else: dik = [e for e in f.edges if abs((e.verts[0].co - e.verts[1].co).normalized().z) > 0.9]
        bmesh.ops.subdivide_edges(bm, edges=dik, cuts=2, use_grid_fill=True)
        bm.normal_update()
        d0 = f.calc_center_median().dot(n)
        yz = [q for q in bm.faces if q.normal.dot(n) > 0.999 and abs(q.calc_center_median().dot(n) - d0) < 1e-4]
        bmesh.ops.inset_individual(bm, faces=yz, thickness=0.02 * S, depth=0.0, use_even_offset=True)
        for q in yz:
            for vv in q.verts: vv.co += n * 0.016 * S
            tahta.add(q)
        bm.normal_update()
    uclar = {panolar['sag'], panolar['sol']}
    def sec(f):
        if f in tahta: return TAHTA2 if abs(f.calc_center_median().y) < 0.1 * S and abs(f.normal.z) > 0.9 or abs(f.calc_center_median().z) < 0.1 * S and abs(f.normal.y) > 0.9 else TAHTA
        if f in uclar: return TAHTA
        return CERCEVE
    P = [bm_al(bm, sec)]; bm.free()
    # cercevenin koselerinde kabarik civiler (on ve arka)
    for yon in ('on', 'arka'):
        o, u, v = yuz_cerceve(yon, d / 2)
        for sx in (-1, 1):
            for sy in (-1, 1):
                P.append(kabartma(o, u, v, elips(sx * (w / 2 - r - kal * 0.52), sy * (h / 2 - r - kal * 0.52), 0.043 * S, 0.043 * S, 6), [(1.0, -0.004), (0.9, 0.018 * S), (0.5, 0.032 * S)], KREM))
        P += pati(o, u, v, 0.0, 0.0, KREM)[:0]
    return uret('pl_kalas', P, 0.42)

# ------------------------------------------------------------------ 3) kavanoz (cap 1, boy 1): cizgili tirtikli kapak
def kavanoz():
    s = S; SEG = 16
    serit = lambda j: KIRMIZI if (j // 2) % 2 == 0 else KREM
    prof = [(0.405, -0.4975, GOVDE), (0.452, -0.455, GOVDE), (0.468, -0.37, GOVDE), (0.468, -0.215, GOVDE),
            (0.486, -0.195, KREM), (0.486, 0.035, GOVDE), (0.468, 0.055, GOVDE), (0.468, 0.115, GOVDE), (0.435, 0.195, GOVDE), (0.365, 0.245, GOVDE),
            (0.345, 0.268, KREM), (0.415, 0.275, serit), (0.415, 0.425, serit), (0.375, 0.478, KREM), (0.30, 0.4975, KREM)]
    prof = [(r * s, y * s, c) for r, y, c in prof]
    P = [torna(prof, SEG, dalga={11: 0.935, 12: 0.935})]
    # etiket kusaginda on ve arkada pati izi
    for yon in ('on', 'arka'):
        o, u, v = yuz_cerceve(yon, 0.478 * s); o = (o[0], -0.08 * s, o[2])
        P += [ (V, F, [KIRMIZI] * len(F)) for (V, F, C) in pati(o, u, v, 0.30 * s, 0.022 * s, KIRMIZI) ]
    # kapak tepesinde dugme
    P.append(kabartma((0, 0.4975 * s, 0), (1, 0, 0), (0, 0, -1), elips(0, 0, 0.12 * s, 0.12 * s, 8), [(1.0, -0.004), (0.92, 0.03 * s), (0.6, 0.05 * s)], KIRMIZI))
    return uret('pl_kavanoz', P, 0.22)

# ------------------------------------------------------------------ 4) tas levha (2x1x1): catlakli, ortada tilki amblemi
def levha():
    w, h, d = 2 * S * 0.998, S * 0.995, S * 0.995; r = 0.095 * S; gom = 0.03 * S
    TAS = renk('#5b6e9c'); TASP = renk('#6a7fb0'); CATLAK = renk('#232c4a')
    bm = kutu_bm(w, h, d, r, 2)
    pn = set()
    for ad in ('on', 'arka'): pn.add(pano(bm, buyuk_yuz(bm, YON[ad]), 0.075 * S, gom))
    V, F, C = bm_al(bm, lambda f: TASP if f in pn else TAS); bm.free()
    govde = ham_nesne('levha_govde', [(V, F, C)])
    # catlak kesicileri: yuzeyde V kesitli ince yarik (gercek geometri; golgesi pisirmede hesaplanir)
    K = []
    def catlak(yon, cizgi, gen=0.034, der=0.085):
        o, u, v = yuz_cerceve(yon, d / 2); o, u, v = Vector(o), Vector(u), Vector(v); n = u.cross(v)
        for (p, q) in zip(cizgi[:-1], cizgi[1:]):
            p3 = o + u * p[0] * S + v * p[1] * S; q3 = o + u * q[0] * S + v * q[1] * S; yon3 = (q3 - p3).normalized(); t = n.cross(yon3)
            p3 = p3 - yon3 * gen * S * 0.5; q3 = q3 + yon3 * gen * S * 0.5
            vs = [p3 + t * gen * S / 2 + n * 0.03 * S, p3 - t * gen * S / 2 + n * 0.03 * S, p3 - n * der * S, q3 + t * gen * S / 2 + n * 0.03 * S, q3 - t * gen * S / 2 + n * 0.03 * S, q3 - n * der * S]
            tb = bmesh.new(); bv = [tb.verts.new(x) for x in vs]
            for f in ([0, 1, 2], [3, 5, 4], [0, 3, 4, 1], [1, 4, 5, 2], [2, 5, 3, 0]): tb.faces.new([bv[i] for i in f])
            bmesh.ops.recalc_face_normals(tb, faces=list(tb.faces)); K.append(bm_al(tb, lambda f: CATLAK)); tb.free()
    catlak('on', [(-0.74, 0.52), (-0.66, 0.30), (-0.73, 0.14), (-0.62, 0.0)])
    catlak('on', [(-0.66, 0.30), (-0.55, 0.26)], 0.026, 0.07)
    catlak('on', [(0.60, -0.52), (0.66, -0.32), (0.57, -0.17), (0.63, -0.05)])
    catlak('on', [(1.02, 0.24), (0.86, 0.17), (0.76, 0.25)], 0.028, 0.075)
    catlak('arka', [(-0.70, -0.52), (-0.64, -0.28), (-0.72, -0.12)])
    catlak('arka', [(0.72, 0.52), (0.62, 0.30), (0.70, 0.12), (0.60, 0.02)])
    catlak('ust', [(0.30, 0.52), (0.36, 0.20), (0.26, -0.05)], 0.03, 0.075)
    kesici = ham_nesne('levha_kesici', K)
    m = govde.modifiers.new('catlak', 'BOOLEAN'); m.operation = 'DIFFERENCE'; m.object = kesici
    try: m.solver = 'EXACT'; m.use_self = True
    except Exception as e: print('  boolean ayari:', e)
    dg = bpy.context.evaluated_depsgraph_get(); ev = govde.evaluated_get(dg); me = bpy.data.meshes.new_from_object(ev, preserve_all_data_layers=True, depsgraph=dg)
    V = [tuple(vv.co) for vv in me.vertices]; F = [list(p.vertices) for p in me.polygons]
    # yarik yuzleri: yuzeyin (govde kabugunun) icinde kalan yeni yuzler -> koyu
    kat = me.color_attributes.get('Col'); C = []
    for p in me.polygons:
        c = tuple(kat.data[p.loop_start].color) if kat and kat.domain == 'CORNER' else TAS
        nn = p.normal; cc = p.center
        ic = abs(cc.x) < w / 2 - 0.004 and abs(cc.y) < h / 2 - 0.004 and abs(cc.z) < d / 2 - 0.004 and max(abs(nn.x), abs(nn.y), abs(nn.z)) < 0.985
        # pano kenar pahlari ve yuvarlak kose seritleri de egik: onlari renklerinden tani (kesici rengi tasinmadiysa konumdan)
        if ic and (abs(c[0] - CATLAK[0]) < 0.02 or yarik_mi(cc, nn, w, h, d, r, gom)): c = CATLAK
        C.append(c)
    bpy.data.objects.remove(govde); bpy.data.objects.remove(kesici)
    P = [(V, F, C)]
    for yon in ('on', 'arka'):
        o, u, v = yuz_cerceve(yon, d / 2 - gom); P += tilki(o, u, v, 0.86 * S, 0.055 * S)
    return uret('pl_levha', P, 0.5)

def yarik_mi(c, n, w, h, d, r, gom):
    """nokta govdenin dis kabugundan belirgin icerideyse (pano cukuru ve yuvarlak kenar disinda) yarik yuzudur"""
    dx, dy, dz = w / 2 - abs(c.x), h / 2 - abs(c.y), d / 2 - abs(c.z)
    if dz < dx and dz < dy: return dz > gom + 0.006 * S and dx > r and dy > r or (dz > 0.012 * S and (dx < r + 0.075 * S or dy < r + 0.075 * S) and dx > r * 0.3 and dy > r * 0.3 and abs(n.z) < 0.6)
    if dy < dx: return dy > 0.012 * S and dx > r and dz > r
    return dx > 0.012 * S and dy > r and dz > r

def ham_nesne(ad, parcalar):
    """oyun eksenlerinde, donusturmeden nesne (boolean icin)"""
    bm = bmesh.new(); kat = bm.loops.layers.float_color.new('Col')
    for (V, F, C) in parcalar:
        vs = [bm.verts.new(p) for p in V]
        for f, c in zip(F, C):
            yz = bm.faces.new([vs[i] for i in f])
            for l in yz.loops: l[kat] = c
    me = bpy.data.meshes.new(ad); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(ad, me); bpy.context.scene.collection.objects.link(ob); return ob

# ------------------------------------------------------------------ 5) sutun (cap 1, boy 2): acik renk, altta ve ustte bilezik
def sutun():
    s = S; SEG = 16; TASK = renk('#f7ecd6'); TASK2 = renk('#eadbbd'); BIL = ALTIN
    alt = [(0.47, -0.9975, TASK2), (0.47, -0.905, TASK2), (0.435, -0.885, BIL), (0.468, -0.84, BIL), (0.468, -0.765, BIL), (0.435, -0.72, TASK), (0.405, -0.70, TASK), (0.385, -0.63, TASK)]
    ust = [(r, -y, c) for (r, y, c) in alt[::-1]]
    # ust yarida renk bir onceki noktadan gelir: kusak renkleri aynalanir
    ustr = [TASK, TASK, BIL, BIL, BIL, TASK2, TASK2, TASK2]
    prof = alt + [(r, y, ustr[i]) for i, (r, y, c) in enumerate(ust)]
    prof = [(r * s, y * s, c) for r, y, c in prof]
    P = [torna(prof, SEG, dalga={7: 0.94, 8: 0.94})]
    return uret('pl_sutun', P, 0.38)

# ------------------------------------------------------------------ onizleme (Blender icinde bakmak icin; oyunda kullanilmaz)
def onizle(obs):
    sc = bpy.context.scene
    x = -(len(obs) - 1) * 1.3
    for ob in obs: ob.location = (x + 0, 0, 0); x += 2.6
    obs[1].location.z = -2.4; obs[1].location.x = -2.2; obs[3].location.z = -2.4; obs[3].location.x = 2.6
    obs[0].location.x = -3.6; obs[2].location.x = 0; obs[4].location.x = 3.6; obs[4].location.z = 0.6
    for ob in obs: ob.rotation_euler = (0, 0, math.radians(-28)); ob.hide_render = False
    cam = bpy.data.cameras.new('kam'); cam.type = 'ORTHO'; cam.ortho_scale = 12.5; co = bpy.data.objects.new('kam', cam); sc.collection.objects.link(co)
    co.location = (0, -20, 5.2); co.rotation_euler = (math.radians(77), 0, 0); sc.camera = co
    gn = bpy.data.lights.new('gunes', 'SUN'); gn.energy = 2.2; gn.angle = math.radians(12); go = bpy.data.objects.new('gunes', gn); sc.collection.objects.link(go); go.rotation_euler = (math.radians(50), 0, math.radians(35))
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 48; sc.render.resolution_x = 1100; sc.render.resolution_y = 760; sc.render.film_transparent = False
    sc.render.filepath = os.path.join(ONIZ, 'onizleme.png'); sc.render.image_settings.file_format = 'PNG'
    bpy.ops.render.render(write_still=True); print('onizleme', sc.render.filepath)

def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    dunya()
    ist = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    hepsi = {'kup': kup, 'kalas': kalas, 'kavanoz': kavanoz, 'levha': levha, 'sutun': sutun}
    obs = [f() for k, f in hepsi.items() if not ist or k in ist]
    if len(obs) == 5: onizle(obs)
    print('BITTI')

main()
