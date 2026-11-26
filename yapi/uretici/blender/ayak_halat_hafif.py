# v12.69 (performans): plat5 ayak.glb'deki burgulu halat parcalarini (12 parca, ~45 bin ucgen) Decimate ile hafifletir -> ayak2.glb.
# Diger parcalar ve malzeme adlari aynen kalir (plat5.js malzemeyi ada gore atar). Kullanim: python ayak_halat_hafif.py <girdi.glb> <cikti.glb> [oran]
import bpy, sys
a = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
gir, cik, oran = a[0], a[1], float(a[2]) if len(a) > 2 else 0.4
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=gir)
once = sonra = 0
for o in bpy.data.objects:
    if o.type != 'MESH': continue
    t = sum(len(p.vertices) - 2 for p in o.data.polygons)
    if 'halat' in o.name.lower() or (o.parent and 'halat' in o.parent.name.lower()):
        bpy.context.view_layer.objects.active = o; o.select_set(True)
        m = o.modifiers.new('d', 'DECIMATE'); m.ratio = oran; bpy.ops.object.modifier_apply(modifier=m.name)
        t2 = sum(len(p.vertices) - 2 for p in o.data.polygons); print('HALAT', o.name, t, '->', t2); once += t; sonra += t2
print('TOPLAM halat', once, '->', sonra)
bpy.ops.export_scene.gltf(filepath=cik, export_format='GLB', export_yup=True, export_apply=True)
