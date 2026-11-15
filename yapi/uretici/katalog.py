# Foxi Smash: blok katalogu. Her blok turunu yakin plan (sol) ve oyun kamerasindan (sag) ceker, gruplara ayirip
# tek bir katalog resmi yapar. Kullanim (repo kokunde 'python3 -m http.server 8765' acik olmali):
#   python3 yapi/uretici/katalog.py CIKTI_KLASORU [--hepsi]
# --hepsi: kapali bloklar dahil (varsayilan: kapali bloklar da cekilir ama ayri grupta gosterilir)
import sys, json, asyncio, os, base64, io
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont

KOK = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = os.environ.get('CHROME', '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome')
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/katalog'
os.makedirs(OUT, exist_ok=True)

JS_LISTE = """() => {
  const Y = window.YP, out = [];
  for (const k in Y.KIND) {
    const kd = Y.KIND[k]; let grup = 'Tripo GLB', ad = k;
    if (k.startsWith('g_')) grup = 'Cam şekiller';
    else if (kd.sek) grup = k.startsWith('ks') ? 'Korsan Kalesi (kale.js)' : 'Eski şekiller (sekil.js)';
    else if (!Y.MOD[k]) continue;   // modeli olmayan eski boya turleri
    out.push({ k, grup });
  }
  return out;
}"""

# tek blogu bos bir bolumde kurar; yakin plan ve oyun kamerasi goruntusu dondurur
JS_CEK = """async (k) => {
  const Y = window.YP, T = Y.SEK.TUR[k], THREE0 = Y.THREE;
  const w = T ? T.w : 1, h = T ? T.h : 1;
  Y.dene(9999, { c: [[0, 0, 0, k, 0]], top: 5, engel: [] });
  Y.run(0.05);
  const c = Y.cubes.find((q) => q.col === k) || Y.cubes[0]; if (!c) return null;
  const cam = Y.cam, ren = Y.ren, sc = Y.scene;
  const o = cam.position.clone(), q = cam.quaternion.clone(), f = cam.fov;
  // oyun kamerasi: bolumun kendi kadraji (tek blok icin fit edilmis); ayni uzaklik icin 7 genis duvar kadraji kullanilir
  ren.render(sc, cam); const oyun = Y.snap();
  // yakin plan: blogun onunden hafif yukaridan
  const p = new THREE0.Vector3(c.body.position.x, c.body.position.y, c.body.position.z), R = (Math.max(w, h * 1.1, 1) * 1.55 * 0.75 + 0.5) / Math.tan(15 * Math.PI / 180) / cam.aspect * 0.62;
  const bg0 = sc.background; sc.background = new THREE0.Color('#2c1f4a');
  cam.fov = 30; cam.updateProjectionMatrix();
  cam.position.set(p.x + R * 0.42, p.y + R * 0.38, p.z + R * 1.0); cam.lookAt(p.x, p.y, p.z); cam.updateMatrixWorld(true);
  ren.render(sc, cam); const yakin = Y.snap(); sc.background = bg0;
  cam.position.copy(o); cam.quaternion.copy(q); cam.fov = f; cam.updateProjectionMatrix();
  // ucgen ve cizim sayisi (tek blok)
  let tri = 0, dc = 0; c.mesh.traverse((m) => { if (m.isMesh && m.geometry) { const g = m.geometry, n = g.index ? g.index.count / 3 : g.attributes.position.count / 3; tri += n; dc += Array.isArray(m.material) ? (g.groups.length || m.material.length) : 1; } });
  return { yakin, oyun, tri: Math.round(tri), dc };
}"""

# oyun kamerasi icin: ayni blogu 7 genislikte bir duvar halinde dizer (bolumdeki boyutuyla gorunsun)
JS_DUVAR = """async (k) => {
  const Y = window.YP, T = Y.SEK.TUR[k]; const w = T ? T.w : 1, h = T ? T.h : 1, L = [];
  const n = Math.max(1, Math.floor(7 / w)), kat = Math.max(1, Math.round(5 / h));
  for (let j = 0; j < kat; j++) for (let i = 0; i < n; i++) L.push([i * w + (w - 1) / 2, j * h, 0, k, 0]);
  Y.dene(9998, { c: L, top: 5, engel: [] }); Y.run(0.05);
  const bg0 = Y.scene.background; Y.scene.background = new Y.THREE.Color('#2c1f4a'); Y.ren.render(Y.scene, Y.cam); const r = Y.snap(); Y.scene.background = bg0; return r;
}"""

def img(d):
    return Image.open(io.BytesIO(base64.b64decode(d.split(',', 1)[1]))).convert('RGB')

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 390, 'height': 844})
        pg.on('pageerror', lambda e: print('HATA', e, flush=True))
        await pg.goto('http://localhost:' + os.environ.get('PORT', '8765') + '/yapi/index.html?test&tilki=0&kart=0&sv=1')
        await pg.wait_for_function('window.YP && YP.g', timeout=240000)
        await pg.wait_for_timeout(1500)
        L = await pg.evaluate(JS_LISTE)
        if len(sys.argv) > 2 and not sys.argv[2].startswith('--'): sec = sys.argv[2].split(','); L = [x for x in L if x['k'] in sec]
        print(len(L), 'tur', flush=True)
        sonuc = []
        for it in L:
            k = it['k']
            try:
                r = await pg.evaluate(JS_CEK, k)
                d = await pg.evaluate(JS_DUVAR, k)
            except Exception as e:
                print('atlandi', k, e, flush=True); continue
            if not r: print('bos', k); continue
            y = img(r['yakin']); o = img(d)
            # yakin plan ortadan kare kirp, oyun gorunumu ust 2/3 kare
            W, H = y.size; s = min(W, H); y = y.crop(((W - s) // 2, (H - s) // 2, (W + s) // 2, (H + s) // 2)).resize((260, 260), Image.LANCZOS)
            W, H = o.size; o = o.crop((0, int(H * 0.08), W, int(H * 0.08) + W)).resize((260, 260), Image.LANCZOS)
            y.save(os.path.join(OUT, k + '_yakin.png')); o.save(os.path.join(OUT, k + '_oyun.png'))
            sonuc.append(dict(it, tri=r['tri'], dc=r['dc']))
            print(k, r['tri'], r['dc'], flush=True)
        json.dump(sonuc, open(os.path.join(OUT, 'liste.json'), 'w'), ensure_ascii=False, indent=0)
        await b.close()

asyncio.run(main())
