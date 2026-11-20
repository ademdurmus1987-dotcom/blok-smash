# Foxi Smash v10.15 (acilis hizi): GLB icindeki WebP dokulari kucultur, geometriye (meshopt sikistirmasi dahil) DOKUNMAZ.
#   python3 yapi/uretici/glb_doku_kucult.py <dosya.glb> <en_buyuk_kenar> [kalite]
# Dokular buffer 0'in sonunda olmali (gltfpack ciktilari boyle); degilse dosya degistirilmez.
import io, json, struct, sys
from PIL import Image
yol, KEN = sys.argv[1], int(sys.argv[2]); Q = int(sys.argv[3]) if len(sys.argv) > 3 else 80
b = open(yol, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n])
bin0 = b[20 + n + 8:]; bl = struct.unpack('<I', b[20 + n:24 + n])[0]; bin0 = b[28 + n:28 + n + bl]
iv = {im['bufferView'] for im in j['images']}
bas = min(j['bufferViews'][i]['byteOffset'] for i in iv)
diger = [v for k, v in enumerate(j['bufferViews']) if k not in iv and v.get('buffer', 0) == 0]
for v in diger:
    e = v.get('extensions', {}).get('EXT_meshopt_compression')
    son = (e['byteOffset'] + e['byteLength']) if e and e.get('buffer', 0) == 0 else (v.get('byteOffset', 0) + v['byteLength'] if v.get('buffer', 0) == 0 and not e else 0)
    assert son <= bas, ('doku sonda degil', yol)
yeni = bytearray(bin0[:bas]); once = len(bin0)
for i in sorted(iv, key=lambda k: j['bufferViews'][k]['byteOffset']):
    v = j['bufferViews'][i]; im = Image.open(io.BytesIO(bin0[v['byteOffset']:v['byteOffset'] + v['byteLength']]))
    w0 = im.size; s = min(1.0, KEN / max(im.size))
    if s < 1: im = im.resize((max(1, round(im.size[0] * s)), max(1, round(im.size[1] * s))), Image.LANCZOS)
    o = io.BytesIO(); im.save(o, 'WEBP', quality=Q, method=6); d = o.getvalue()
    while len(yeni) % 4: yeni.append(0)
    v['byteOffset'] = len(yeni); v['byteLength'] = len(d); yeni += d
    print('  doku', w0, '->', im.size, len(d) // 1024, 'KB')
while len(yeni) % 4: yeni.append(0)
j['buffers'][0]['byteLength'] = len(yeni)
js = json.dumps(j, separators=(',', ':')).encode()
while len(js) % 4: js += b' '
cikti = b'glTF' + struct.pack('<II', 2, 12 + 8 + len(js) + 8 + len(yeni)) + struct.pack('<I', len(js)) + b'JSON' + js + struct.pack('<I', len(yeni)) + b'BIN\x00' + bytes(yeni)
open(yol, 'wb').write(cikti); print(yol, len(b) // 1024, '->', len(cikti) // 1024, 'KB')
