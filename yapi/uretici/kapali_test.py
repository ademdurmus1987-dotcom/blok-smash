# Foxi Smash v5.1: kapali bloklari degistirilen bolumleri oyunun fizigiyle yeniden test eder (YP.run).
# Gecemeyen bolum ayni kurallarla (arketip.js) yeniden uretilir ve test edilir. Yarida kalirsa kaldigi yerden devam eder.
# Kullanim (repo kokunde 'python3 -m http.server 8765' acik): python3 yapi/uretici/kapali_test.py [--el]
import sys, json, asyncio, os, time
from playwright.async_api import async_playwright
KOK = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = os.environ.get('CHROME', '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome')
AYAR = json.load(open(os.path.join(KOK, 'yapi/bolumler.json'))); PARCA = AYAR['parca']; EL = AYAR['el']
RAP = os.path.join(KOK, 'yapi/uretici/rapor/kapali_test.json')
DEG = json.load(open(os.path.join(KOK, 'yapi/uretici/rapor/kapali_degisen.json')))['degisen']
def pyol(n): return os.path.join(KOK, 'yapi/bolumler', 'p%02d.json' % n)
def pno(L): return (L - 1) // PARCA
sonuc = json.load(open(RAP)) if os.path.exists(RAP) else {}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 390, 'height': 844})
        pg.on('pageerror', lambda e: print('HATA', e, flush=True))
        pg.on('console', lambda m: print(m.text, flush=True) if m.text.startswith('BOLUM') else None)
        await pg.goto('http://localhost:8765/yapi/index.html?test&tilki=0&kart=0&sv=1')
        await pg.wait_for_function('window.YP && YP.g', timeout=240000)
        await pg.evaluate("import('./uretici/dogrula.js?v=' + Date.now()).then((m) => { window.DG = m; })")
        await pg.wait_for_function('window.DG', timeout=60000)
        hedef = list(range(1, EL + 1)) + DEG if '--el' in sys.argv or True else DEG
        veri = {}
        def yukle(n):
            if n not in veri: veri[n] = json.load(open(pyol(n)))
            return veri[n]
        def Yof(L):
            v = yukle(pno(L)); return v['b'][L - v['ilk']]
        def gecmis(L):
            g = []
            for x in range(max(EL + 1, L - 10), L):
                y = Yof(x); g.append({'a': y['a'], 'imza': y['imza']})
            return g
        bekle = [L for L in hedef if str(L) not in sonuc]
        print('test edilecek', len(bekle), flush=True)
        i = 0
        while i < len(bekle):
            grup = []
            while i < len(bekle) and len(grup) < 8:
                L = bekle[i]; i += 1
                grup.append({'L': L} if L <= EL else {'L': L, 'Y': Yof(L), 'gecmis': gecmis(L)})
            t0 = time.time()
            r = await pg.evaluate('(x) => DG.yenidenTest(x).then((o) => JSON.parse(JSON.stringify(o)))', grup)
            yaz = set()
            for x in r:
                L = x['L']
                if x.get('Y'):
                    Y = x.pop('Y'); Y.pop('kapali', None); Y['kapali'] = 1; v = yukle(pno(L)); v['b'][L - v['ilk']] = Y; yaz.add(pno(L))
                sonuc[str(L)] = x
            for n in yaz: json.dump(veri[n], open(pyol(n), 'w'), ensure_ascii=False, separators=(',', ':'))
            json.dump(sonuc, open(RAP, 'w'), ensure_ascii=False)
            print('grup', i, '/', len(bekle), round(time.time() - t0), 's', flush=True)
        await b.close()
asyncio.run(main())
