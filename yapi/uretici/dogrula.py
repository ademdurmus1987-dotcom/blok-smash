# Foxi Smash v5.0: bolumleri uretir, oyunun fizigiyle dogrular ve yapi/bolumler/*.json'a yazar.
# Kullanim: python3 yapi/uretici/dogrula.py BAS SON [--port 8765]   (repo kokunde 'python3 -m http.server 8765' acik olmali)
# Bir parca (100 bolum) bitince hemen kaydedilir; yarida kalirsa kaldigi parcadan devam edilir (gecmis onceki parcadan okunur).
import sys, json, asyncio, os, time
from playwright.async_api import async_playwright
KOK = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = os.environ.get('CHROME', '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome')
A, B = int(sys.argv[1]), int(sys.argv[2]); PORT = 8765
AYAR = json.load(open(os.path.join(KOK, 'yapi/bolumler.json')))
PARCA = AYAR['parca']
def pyol(n): return os.path.join(KOK, 'yapi/bolumler', 'p%02d.json' % n)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 390, 'height': 844})
        pg.on('pageerror', lambda e: print('HATA', e, flush=True))
        pg.on('console', lambda m: print(m.text, flush=True) if m.text.startswith('BOLUM') else None)
        await pg.goto(f'http://localhost:{PORT}/yapi/index.html?test&tilki=0&kart=0&sv=1')
        await pg.wait_for_function('window.YP && YP.g', timeout=180000)
        await pg.evaluate("import('./uretici/dogrula.js?v=' + Date.now()).then((m) => { window.DG = m; })")
        await pg.wait_for_function('window.DG', timeout=60000)
        L = A
        while L <= B:
            n = (L - 1) // PARCA; ilk = max(AYAR['el'] + 1, n * PARCA + 1); son = min(B, (n + 1) * PARCA)
            # gecmis: onceki 10 bolum (onceki parcadan)
            gec = []
            if ilk > AYAR['el'] + 1 and os.path.exists(pyol((ilk - 2) // PARCA)):
                onceki = json.load(open(pyol((ilk - 2) // PARCA)))
                gec = [{'a': x['a'], 'imza': x['imza']} for x in onceki['b'][-10:]]
            t0 = time.time()
            r = await pg.evaluate(f'DG.dogrula({ilk}, {son}, {json.dumps(gec)}).then((x) => JSON.parse(JSON.stringify(x)))')
            veri = {'ilk': ilk, 'b': []}
            if os.path.exists(pyol(n)): veri = json.load(open(pyol(n)))
            mevcut = {veri['ilk'] + i: x for i, x in enumerate(veri['b'])}
            for Y in r['sonuc']:
                for k in ('d',): pass
                mevcut[Y['L'] if 'L' in Y else None] = None
            # yeniden diz (ilk..son)
            bl = {}
            for i, x in enumerate(veri['b']): bl[veri['ilk'] + i] = x
            for i, Y in enumerate(r['sonuc']): bl[ilk + i] = Y
            k0 = min(bl); veri = {'ilk': k0, 'b': [bl[k] for k in range(k0, max(bl) + 1)]}
            json.dump(veri, open(pyol(n), 'w'), ensure_ascii=False, separators=(',', ':'))
            rp = os.path.join(KOK, 'yapi/uretici/rapor', 'p%02d.json' % n); os.makedirs(os.path.dirname(rp), exist_ok=True)
            json.dump(dict(r['rapor'], ilk=ilk, son=son, sure=round(time.time() - t0)), open(rp, 'w'), ensure_ascii=False)
            print(ilk, son, r['rapor'], round(time.time() - t0), 's', flush=True)
            L = son + 1
        await b.close()
asyncio.run(main())
