# Foxi Smash v12.66 (Adem 26 Kas 2026): Royal Match / Toy Blast kalitesinde oyun cisimleri.
# Kurallar (Adem): kalin yumusak pah (4 dilim), on/arkada kademeli ic cerceve (inset + iceri itme), pati 3B mesh ile
# gomulu (Boolean fark) ve kenari pahli; plastik: canli renk, roughness 0.25, coat 0.85 / 0.12; ahsap: prosedurel damar;
# buz: turkuaz-mavi gecis, roughness 0.12; renk + AO 512/1024 dokuya pisirilir; smooth + weighted normal; tek parca .glb.
# Calistirma: blender -b --python royal_set.py -- [cikti_klasoru]   (ya da: python -c "import bpy" ortaminda python royal_set.py)
# Cikti: model/royal/{kup1..kup4, buz1, buz3, kav1, sandik, varil}.glb
# Renkli parcalarda govde dokusu GRI (yalniz AO): oyun (blok8.js) gri pikselleri blok rengiyle boyar, krem pati ve kapak (renkli piksel) oldugu gibi kalir.
import bpy, bmesh, math, os, sys
import numpy as np
from mathutils import Vector, Matrix

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'model', 'royal')
os.makedirs(OUT, exist_ok=True)
KREM = (1.0, 0.86, 0.62, 1)   # pati ve kapak (oyunda boyanmaz: r-b farki buyuk)

def temizle():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 48
    w = bpy.data.worlds.new('W'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[1].default_value = 1.0

def obj_bm(ad, bm):
    me = bpy.data.meshes.new(ad); bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(ad, me); bpy.context.collection.objects.link(o); return o

def sec(o):
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o

def uygula(o):
    sec(o)
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)

def malzeme(ad, renk, rough=0.25, coat=0.85, coatR=0.12, metal=0.0):
    m = bpy.data.materials.new(ad); m.use_nodes = True; p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = renk; p.inputs['Roughness'].default_value = rough; p.inputs['Metallic'].default_value = metal
    p.inputs['Coat Weight'].default_value = coat; p.inputs['Coat Roughness'].default_value = coatR
    m['ayar'] = (rough, coat, coatR, metal); return m

def ahsap_dugum(m, koyu=(0.16, 0.035, 0.004, 1), acik=(0.8, 0.27, 0.045, 1), olcek=2.6, yon='Z'):
    """stilize (cartoon) ahsap damari: Wave (Bands, kendi hafif carpitmasi) -> ince koyu damar cizgileri, arada sicak acik ton"""
    nt = m.node_tree; p = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord'); wv = nt.nodes.new('ShaderNodeTexWave'); rp = nt.nodes.new('ShaderNodeValToRGB')
    wv.wave_type = 'BANDS'; wv.bands_direction = yon; wv.wave_profile = 'SIN'
    wv.inputs['Scale'].default_value = olcek; wv.inputs['Distortion'].default_value = 2.2; wv.inputs['Detail'].default_value = 1.5; wv.inputs['Detail Scale'].default_value = 0.8
    nt.links.new(tc.outputs['Object'], wv.inputs['Vector'])
    e = rp.color_ramp.elements; e[0].position = 0.0; e[0].color = koyu; e[1].position = 0.22; e[1].color = acik
    e3 = e.new(0.75); e3.color = (acik[0] * 0.9, acik[1] * 0.86, acik[2] * 0.8, 1)
    nt.links.new(wv.outputs['Fac'], rp.inputs['Fac']); nt.links.new(rp.outputs['Color'], p.inputs['Base Color'])

def buz_dugum(m):
    """canli turkuaz-mavi dikey gecis + capraz ic kirilma seritleri"""
    nt = m.node_tree; p = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord'); sp = nt.nodes.new('ShaderNodeSeparateXYZ'); mp = nt.nodes.new('ShaderNodeMapRange'); rp = nt.nodes.new('ShaderNodeValToRGB')
    nt.links.new(tc.outputs['Object'], sp.inputs[0]); nt.links.new(sp.outputs['Z'], mp.inputs['Value'])
    mp.inputs['From Min'].default_value = -0.5; mp.inputs['From Max'].default_value = 0.5
    rp.color_ramp.elements[0].color = (0.02, 0.32, 0.78, 1); rp.color_ramp.elements[1].color = (0.45, 0.93, 1.0, 1)
    el = rp.color_ramp.elements.new(0.55); el.color = (0.1, 0.62, 0.95, 1)
    nt.links.new(mp.outputs['Result'], rp.inputs['Fac'])
    # capraz kirilma: Wave (diagonal) -> acik serit
    wv = nt.nodes.new('ShaderNodeTexWave'); wv.bands_direction = 'DIAGONAL'; wv.inputs['Scale'].default_value = 1.6; wv.inputs['Distortion'].default_value = 1.5
    nt.links.new(tc.outputs['Object'], wv.inputs['Vector'])
    r2 = nt.nodes.new('ShaderNodeValToRGB'); r2.color_ramp.elements[0].position = 0.82; r2.color_ramp.elements[0].color = (0, 0, 0, 1); r2.color_ramp.elements[1].position = 0.97; r2.color_ramp.elements[1].color = (1, 1, 1, 1)
    nt.links.new(wv.outputs['Fac'], r2.inputs['Fac'])
    mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'SCREEN'; mx.inputs['Factor'].default_value = 0.22
    nt.links.new(rp.outputs['Color'], mx.inputs[6]); nt.links.new(r2.outputs['Color'], mx.inputs[7]); nt.links.new(mx.outputs[2], p.inputs['Base Color'])

# ---------- geometri ----------
def kutu_cerceveli(W, H, D, cer=0.085, derin=0.035, pah=0.07, seg=4):
    """once yumusak pah (seg dilim), sonra on (-Y) ve arka (+Y) duz yuzde kademeli ic cerceve"""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0); bmesh.ops.scale(bm, vec=(W, D, H), verts=bm.verts)
    bmesh.ops.bevel(bm, geom=list(bm.edges), offset=pah, offset_type='OFFSET', segments=seg, profile=0.5, affect='EDGES', clamp_overlap=True)
    for yon in (-1, 1):
        f = max((f for f in bm.faces if f.normal.y * yon > 0.99), key=lambda f: f.calc_area())
        bmesh.ops.inset_region(bm, faces=[f], thickness=cer, depth=0.0)
        bmesh.ops.inset_region(bm, faces=[f], thickness=derin * 0.45, depth=-derin)   # egimli basamak, ic yuz iceri
    return obj_bm('blok', bm)

def pati_kesici(cx, cz, s, yuzy, yon, derin=0.028):
    """pati: taban yastigi + 4 parmak; kenari pahli silindirler, birlestirilmis. yuzy: kesilecek yuzun y'si"""
    parcalar = [(0, -0.06, 0.27, 0.22, 0), (-0.31, 0.15, 0.1, 0.13, -0.45), (-0.11, 0.31, 0.105, 0.135, -0.14), (0.11, 0.31, 0.105, 0.135, 0.14), (0.31, 0.15, 0.1, 0.13, 0.45)]
    bm = bmesh.new()
    for (ex, ez, rx, rz, a) in parcalar:
        g = bmesh.ops.create_cone(bm, cap_ends=True, segments=14, radius1=1, radius2=1, depth=1)   # v12.68: 20 -> 14 (ucgen)
        vs = g['verts']
        bmesh.ops.rotate(bm, verts=vs, cent=(0, 0, 0), matrix=Matrix.Rotation(math.pi / 2, 3, 'X'))
        bmesh.ops.scale(bm, vec=(rx * s, (derin + 0.06), rz * s), verts=vs)
        bmesh.ops.rotate(bm, verts=vs, cent=(0, 0, 0), matrix=Matrix.Rotation(-a, 3, 'Y'))
        bmesh.ops.translate(bm, verts=vs, vec=(cx + ex * s, yuzy + yon * (0.06 - derin) / 2, cz + ez * s))
    o = obj_bm('pati', bm)
    b = o.modifiers.new('pah', 'BEVEL'); b.width = 0.006; b.segments = 1; b.limit_method = 'ANGLE'; uygula(o)
    return o

def boolean_fark(hedef, kesici):
    if not kesici.data.materials and hedef.data.materials: kesici.data.materials.append(hedef.data.materials[0])
    m = hedef.modifiers.new('bool', 'BOOLEAN'); m.operation = 'DIFFERENCE'; m.solver = 'EXACT'; m.object = kesici; m.material_mode = 'TRANSFER'
    uygula(hedef); bpy.data.objects.remove(kesici, do_unlink=True)

def tornala(profil, seg=36, ad='torna'):
    """profil: [(r, z)] alttan uste; Z ekseni etrafinda dondur"""
    bm = bmesh.new(); vs = [bm.verts.new((r, 0, z)) for r, z in profil]
    es = [bm.edges.new((vs[i], vs[i + 1])) for i in range(len(vs) - 1)]
    bmesh.ops.spin(bm, geom=vs + es, cent=(0, 0, 0), axis=(0, 0, 1), angle=math.radians(360), steps=seg, use_merge=True)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return obj_bm(ad, bm)

def bitir(o):
    print('ROYAL once', o.name, len(o.data.polygons))
    sec(o); bpy.ops.object.shade_smooth()
    me = o.data; bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5); bmesh.ops.dissolve_degenerate(bm, dist=1e-5, edges=bm.edges)
    bmesh.ops.dissolve_limit(bm, angle_limit=math.radians(0.5), use_dissolve_boundaries=False, verts=bm.verts, edges=bm.edges, delimit={'MATERIAL'})   # v12.68: oyma sonrasi duz yuzeydeki parcali ucgenler birlesir
    bm.to_mesh(me); bm.free()
    w = o.modifiers.new('wn', 'WEIGHTED_NORMAL'); w.keep_sharp = True; w.weight = 50; uygula(o)

# ---------- pisirme ----------
def pisir(o, ad, N=512, ao_guc=0.75, pati_isik=False):
    sec(o)
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.02); bpy.ops.object.mode_set(mode='OBJECT')
    img = bpy.data.images.new(ad, N, N, alpha=False)
    for m in o.data.materials:
        n = m.node_tree.nodes.new('ShaderNodeTexImage'); n.image = img; n.name = 'BAKE'; m.node_tree.nodes.active = n
    sc = bpy.context.scene; sc.render.bake.margin = 8
    sc.render.bake.use_pass_direct = False; sc.render.bake.use_pass_indirect = False; sc.render.bake.use_pass_color = True
    bpy.ops.object.bake(type='DIFFUSE', pass_filter={'COLOR'}, use_clear=True)
    renk = np.array(img.pixels[:]).reshape(N, N, 4).copy()
    sc.world.light_settings.distance = 0.25
    bpy.ops.object.bake(type='AO', use_clear=True)
    ao = np.array(img.pixels[:]).reshape(N, N, 4)[:, :, :1]
    son = renk.copy(); son[:, :, :3] = renk[:, :, :3] * (1 - ao_guc + ao_guc * ao)
    beyaz = renk[:, :, :3].min(axis=2) > 0.97   # cam parlamasi AO almaz
    son[:, :, :3] = np.where(beyaz[:, :, None], 1.0, son[:, :, :3])
    if pati_isik:   # v12.67: krem (pati) pikselleri: AO yerine ust-onden gunes isigiyla pisirilmis gercek oyuk golgesi (ust ic kenar koyu, alt kenar parlak)
        kr = (renk[:, :, 0] - renk[:, :, 2]) > 0.15
        gunes = []
        for yon in (-1, 1):
            L = bpy.data.lights.new('g', 'SUN'); L.energy = 3.0; L.angle = math.radians(3)
            lo = bpy.data.objects.new('g', L); bpy.context.collection.objects.link(lo)
            lo.rotation_euler = (Vector((0, -yon * 0.55, 1.0)).to_track_quat('Z', 'Y')).to_euler(); gunes.append(lo)
        sc.render.bake.use_pass_direct = True; sc.render.bake.use_pass_color = False
        bpy.ops.object.bake(type='DIFFUSE', pass_filter={'DIRECT'}, use_clear=True)
        for lo in gunes: bpy.data.objects.remove(lo, do_unlink=True)
        d = np.array(img.pixels[:]).reshape(N, N, 4)[:, :, 0]
        ref = np.percentile(d[kr], 70) if kr.any() else 1.0
        k = np.clip(d / max(ref, 1e-4), 0.28, 1.35)[:, :, None]
        isik = np.where(k > 1, renk[:, :, :3] + (1 - renk[:, :, :3]) * (k - 1) * 1.6, renk[:, :, :3] * k)
        son[:, :, :3] = np.where(kr[:, :, None], np.clip(isik, 0, 1), son[:, :, :3])
    img.pixels[:] = son.ravel(); img.update()
    # disa aktarim icin: her malzemede taban renk = pisirilmis doku, prosedurel dugumler devre disi
    for m in o.data.materials:
        nt = m.node_tree; p = nt.nodes['Principled BSDF']; n = nt.nodes['BAKE']
        for l in list(p.inputs['Base Color'].links): nt.links.remove(l)
        nt.links.new(n.outputs['Color'], p.inputs['Base Color'])
    img.filepath_raw = os.path.join(OUT, ad + '.png'); img.file_format = 'PNG'

def disa(o, ad):
    sec(o); o.location = (0, 0, 0)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, ad + '.glb'), use_selection=True, export_format='GLB', export_apply=True,
                              export_image_format='JPEG', export_yup=True, export_normals=True,
                              export_texcoords=True, export_materials='EXPORT')
    tri = sum(len(p.vertices) - 2 for p in o.data.polygons); print('ROYAL', ad, 'ucgen', tri)

# ---------- urunler ----------
def kup(n):
    temizle(); W = float(n)
    o = kutu_cerceveli(W, 1.0, 1.0)
    govde = malzeme('govde', (0.8, 0.8, 0.8, 1), 0.22, 0.90, 0.10); pm = malzeme('pati', KREM, 0.24, 0.90, 0.10)   # v12.67: kavanozla esit parlaklik
    o.data.materials.append(govde); o.data.materials.append(pm)
    for yon in (-1, 1):
        for i in range(n):
            cx = -W / 2 + 0.5 + i
            k = pati_kesici(cx, -0.02, 0.62, yon * (0.5 - 0.035), yon); k.data.materials.append(pm); boolean_fark(o, k)
    bitir(o); pisir(o, 'kup' + str(n), 1024 if n > 2 else 512, pati_isik=True); disa(o, 'kup' + str(n))

def buz(n):
    temizle(); W = float(n)
    o = kutu_cerceveli(W, 1.0, 1.0, cer=0.07, derin=0.03, pah=0.08)
    m = malzeme('buz', (0.3, 0.8, 1, 1), 0.12, 0.6, 0.06); buz_dugum(m); o.data.materials.append(m)
    bitir(o); pisir(o, 'buz' + str(n), ao_guc=0.55); disa(o, 'buz' + str(n))

def kavanoz():
    temizle()
    P = [(0.0, -0.5), (0.36, -0.5), (0.42, -0.47), (0.45, -0.42), (0.46, -0.3), (0.46, 0.18), (0.44, 0.25), (0.38, 0.29), (0.36, 0.3),   # govde
         (0.36, 0.31), (0.41, 0.32), (0.43, 0.34), (0.43, 0.45), (0.41, 0.48), (0.36, 0.5), (0.0, 0.5)]   # kapak
    o = tornala(P, 40, 'kavanoz')
    govde = malzeme('govde', (0.8, 0.8, 0.8, 1), 0.18, 0.9, 0.06); kp = malzeme('kapak', KREM, 0.45, 0.3, 0.3)
    o.data.materials.append(govde); o.data.materials.append(kp)
    for f in o.data.polygons: f.material_index = 1 if f.center.z > 0.305 else 0
    # v12.67 (Adem): pati kaldirildi (kavanozda sikisik duruyordu); yerine temiz dikey cam parlamasi (beyaz serit, oyun bunu beyaz birakir)
    pm = malzeme('parilti', (1, 1, 1, 1), 0.1, 1.0, 0.05); o.data.materials.append(pm)
    for f in o.data.polygons:
        c = f.center
        if -0.24 < c.z < 0.16 and ((c.y < 0 and -0.31 < c.x < -0.17) or (c.y > 0 and 0.17 < c.x < 0.31)): f.material_index = 2   # iki yuzde (oyunda hangisi one gelirse)
    bitir(o); pisir(o, 'kav1'); disa(o, 'kav1')

def sandik():
    temizle()
    o = kutu_cerceveli(1.0, 1.0, 1.0, cer=0.13, derin=0.05, pah=0.05, seg=3)
    m = malzeme('ahsap', (0.8, 0.45, 0.15, 1), 0.5, 0.3, 0.25); ahsap_dugum(m, olcek=3.2, yon='Z'); o.data.materials.append(m)
    # ic panel (geri cekik on/arka yuz) koyu ahsap: uzaktan cerceve okunsun
    mi = malzeme('ahsap_ic', (0.5, 0.25, 0.08, 1), 0.55, 0.25, 0.3); ahsap_dugum(mi, koyu=(0.09, 0.02, 0.002, 1), acik=(0.42, 0.12, 0.02, 1), olcek=3.2, yon='Z'); o.data.materials.append(mi)
    for f in o.data.polygons:
        if abs(f.normal.y) > 0.9 and abs(f.center.y) < 0.5 - 0.025: f.material_index = 1
    # ic panelde yatay tahta oluklari (gomulu) on ve arka
    for yon in (-1, 1):
        for z in (-0.12, 0.12):
            bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0); bmesh.ops.scale(bm, vec=(0.66, 0.06, 0.022), verts=bm.verts)
            bmesh.ops.translate(bm, verts=bm.verts, vec=(0, yon * (0.5 - 0.05), z)); k = obj_bm('oluk', bm)
            b = k.modifiers.new('p', 'BEVEL'); b.width = 0.006; b.segments = 2; uygula(k); boolean_fark(o, k)
    bitir(o); pisir(o, 'sandik', 1024, ao_guc=0.85); disa(o, 'sandik')

def varil():
    temizle()
    P = [(0.0, -0.5)]
    for i in range(13):
        t = i / 12; P.append((0.37 + 0.09 * math.sin(t * math.pi), -0.47 + t * 0.94))
    P[1:1] = [(0.33, -0.5)]; P += [(0.33, 0.5), (0.0, 0.5)]
    o = tornala(P, 32, 'varil')
    m = malzeme('ahsap', (0.8, 0.45, 0.15, 1), 0.5, 0.3, 0.25); ahsap_dugum(m, olcek=2.4, yon='X'); o.data.materials.append(m)
    # dikey cita oluklari (16) gomulu
    for i in range(16):
        a = i / 16 * 2 * math.pi; bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0); bmesh.ops.scale(bm, vec=(0.016, 0.06, 1.2), verts=bm.verts)
        bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0.47, 0)); bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(a, 3, 'Z'))
        k = obj_bm('cita', bm); boolean_fark(o, k)
    # iki demir cember (kabarik)
    me = malzeme('demir', (0.24, 0.26, 0.31, 1), 0.35, 0.4, 0.2, metal=0.6); o.data.materials.append(me)
    for z in (-0.3, 0.3):
        r = 0.37 + 0.09 * math.sin((z + 0.47) / 0.94 * math.pi)
        c = tornala([(r - 0.01, z - 0.045), (r + 0.022, z - 0.04), (r + 0.026, z), (r + 0.022, z + 0.04), (r - 0.01, z + 0.045)], 32, 'cember')
        c.data.materials.append(me); sec(o); c.select_set(True); bpy.context.view_layer.objects.active = o; bpy.ops.object.join()
    bitir(o); pisir(o, 'varil', 1024, ao_guc=0.85); disa(o, 'varil')

if __name__ == '__main__':
    ne = [a for a in (sys.argv[sys.argv.index('--') + 2:] if '--' in sys.argv else [])] or ['kup1', 'kup2', 'kup3', 'kup4', 'buz1', 'buz3', 'kav1', 'sandik', 'varil']
    for a in ne:
        if a.startswith('kup'): kup(int(a[3:]))
        elif a.startswith('buz'): buz(int(a[3:]))
        elif a == 'kav1': kavanoz()
        else: globals()[a]()
