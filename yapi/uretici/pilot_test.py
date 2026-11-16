# Foxi Smash pilot bolum testleri. Repo kokunde 'python3 -m http.server PORT' acik olmali.
#   python3 yapi/uretici/pilot_test.py regresyon 1,6,12,25,781,784 ONEK [--port 8770]
#       eski bolumler: hata, blok sayisi, platform olcusu, durgunluk, bot sonucu (+ 390x844 ekran goruntusu) -> rapor/pilot/regresyon/ONEK.json
#   python3 yapi/uretici/pilot_test.py pilot 1,7,13 [--port 8770]
#       pilot bolumler: 1-8 arasi tum testler -> rapor/pilot/P{N}.json + ekran goruntuleri
#   python3 yapi/uretici/pilot_test.py ekran 1,7,13     (yalniz ekran goruntuleri)
# Math.random sayfada tohumlanir (ayni girdide ayni sonuc; once/sonra karsilastirmasi icin).
import sys, json, asyncio, os, time
from playwright.async_api import async_playwright
KOK = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = os.environ.get('CHROME', '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome')
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required']
KIP, LISTE = sys.argv[1], [int(x) for x in sys.argv[2].split(',')]
ONEK = sys.argv[3] if len(sys.argv) > 3 and not sys.argv[3].startswith('--') else ''
PORT = int(sys.argv[sys.argv.index('--port') + 1]) if '--port' in sys.argv else 8770
RAPOR = os.path.join(KOK, 'yapi/uretici/rapor/pilot'); os.makedirs(os.path.join(RAPOR, 'regresyon'), exist_ok=True)
TOHUM = "(() => { let a = TOHUMNO; Math.random = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();"
URL = f'http://localhost:{PORT}/yapi/index.html'

async def sayfa(b, w, h, dpr, sorgu, hatalar, tohum=12345):
    ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=dpr)
    await ctx.add_init_script(TOHUM.replace('TOHUMNO', str(tohum)))
    pg = await ctx.new_page()
    pg.on('pageerror', lambda e: hatalar.append('pageerror: ' + str(e)))
    pg.on('console', lambda m: hatalar.append('console.' + m.type + ': ' + m.text) if m.type == 'error' else None)
    await pg.goto(URL + '?' + sorgu)
    return ctx, pg

async def modul(pg):
    await pg.evaluate("import('./uretici/pilot_test.js?v=' + Date.now()).then((m) => { window.PT = m; })")
    await pg.wait_for_function('window.PT', timeout=60000)

async def regresyon(b):
    out = {}
    for L in LISTE:
        hatalar = []; t0 = time.time()
        ctx, pg = await sayfa(b, 390, 844, 1, f'test&tilki=0&kart=0&sv={L}', hatalar)
        await pg.wait_for_function(f'window.YP && YP.g && YP.g.L == {L}', timeout=300000)
        await modul(pg)
        r = await pg.evaluate('(() => { const o = PT.ozet(); o.durgun = PT.durgunluk(); return o; })()')
        await ctx.close()
        ctx, pg = await sayfa(b, 390, 844, 1, f'test&tilki=0&kart=0&sv={L}', hatalar)
        await pg.wait_for_function(f'window.YP && YP.g && YP.g.L == {L}', timeout=300000)
        await modul(pg)
        r['bot'] = await pg.evaluate('PT.durgunluk() && PT.bot(30)')
        await ctx.close()
        # ekran (normal kip, kart yok)
        ctx, pg = await sayfa(b, 390, 844, 2, f'sv={L}&kart=0', hatalar)
        await pg.wait_for_function(f'window.YP && YP.g && YP.g.L == {L} && window.__bsHazir', timeout=300000)
        await pg.evaluate("() => { const l = document.getElementById('load'); if (l) l.click(); }")
        await pg.wait_for_timeout(5000)
        await pg.evaluate("() => { const n = document.getElementById('nm'); if (n) n.style.display = 'none'; }")
        await pg.screenshot(path=os.path.join(RAPOR, 'regresyon', f'{ONEK}_{L}.jpg'), type='jpeg', quality=85, timeout=180000)
        await ctx.close()
        r['hatalar'] = [h for h in hatalar if 'favicon' not in h]; r['sure'] = round(time.time() - t0)
        print(L, json.dumps(r, ensure_ascii=False), flush=True)
        out[L] = r
    json.dump(out, open(os.path.join(RAPOR, 'regresyon', f'{ONEK}.json'), 'w'), ensure_ascii=False, indent=1)

HEDEF = {1: 'orta-tnt', 7: 'dikili-0', 13: 'domino-00'}
DY = {1: 0, 7: 0.3, 13: 0.4}
OLCU = [(360, 640, 2), (390, 844, 2), (768, 1024, 1)]
KAYIT = {'L': 57, 'max': 57, 'altin': 1234, 'yil': {'1': 3, '2': 2}, 'ist': {'ilk': 5, 'seri': 2, 'enSeri': 4, 'kazan': 50, 'blok': 900}, 'gg': {'roket': 2}, 'ark': ['kale'], 'sekil': ['oyK']}
KAYITJS = "if (!localStorage.getItem('blokpop_yapi_v3')) localStorage.setItem('blokpop_yapi_v3', " + json.dumps(json.dumps(KAYIT)) + ");"
LSJS = "(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return JSON.stringify(o); })()"
CERCEVE = """(() => { const P = YP, V = new P.THREE.Vector3(); let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
  const nok = []; for (const q of P.PLS) { if (!q.P) continue; for (const [x, z] of q.P) { nok.push([x, q.cy, z]); nok.push([x, q.cy - 0.75, z]); } }
  for (const c of P.cubes) { if (c.gone || c.out) continue; const b = new P.THREE.Box3().setFromObject(c.mesh); for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) nok.push([x, y, z]); }
  for (const p of nok) { V.set(p[0], p[1], p[2]).project(P.cam); x0 = Math.min(x0, V.x); x1 = Math.max(x1, V.x); y0 = Math.min(y0, V.y); y1 = Math.max(y1, V.y); }
  return { x: [+x0.toFixed(3), +x1.toFixed(3)], y: [+y0.toFixed(3), +y1.toFixed(3)], icinde: x0 > -1 && x1 < 1 && y0 > -1 && y1 < 1 }; })()"""
PERF = "(() => { const P = YP; P.ORNEK.guncelle(P.cubes); P.ren.shadowMap.needsUpdate = true; P.ren.render(P.scene, P.cam); return { cizim: P.ren.info.render.calls, ucgen: P.ren.info.render.triangles }; })()"

async def acik(b, N, w, h, dpr, hatalar, ek=''):
    ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=dpr)
    await ctx.add_init_script(TOHUM.replace('TOHUMNO', '12345'))
    if ek: await ctx.add_init_script(ek)
    pg = await ctx.new_page()
    pg.on('pageerror', lambda e: hatalar.append('pageerror: ' + str(e)))
    pg.on('console', lambda m: hatalar.append('console.' + m.type + ': ' + m.text) if m.type == 'error' else None)
    await pg.goto(URL + f'?pilot={N}&tilki=0')
    await pg.wait_for_function('window.YP && YP.g && window.__bsHazir', timeout=300000)
    await pg.evaluate("() => { const l = document.getElementById('load'); if (l) l.click(); }")
    await pg.wait_for_timeout(1500)
    return ctx, pg

async def pilot(b):
    for N in LISTE:
        R = {'N': N}; hatalar = []; t0 = time.time()
        # 1-2) acilis, ic ice girme, durgunluk (test kipi: adim adim fizik)
        ctx, pg = await sayfa(b, 390, 844, 1, f'test&tilki=0&pilot={N}', hatalar)
        await pg.wait_for_function('window.YP && YP.g', timeout=300000); await modul(pg)
        R['ozet'] = await pg.evaluate('PT.ozet()'); R['ortusme'] = await pg.evaluate('PT.ortusme()'); R['durgunluk'] = await pg.evaluate('PT.durgunluk(3.0, 0.1)')
        await ctx.close()
        # 3) strateji (gercek dokunus yolu)
        ctx, pg = await sayfa(b, 390, 844, 1, f'test&tilki=0&pilot={N}', hatalar)
        await pg.wait_for_function('window.YP && YP.g', timeout=300000); await modul(pg)
        R['strateji'] = await pg.evaluate(f'PT.strateji({N})'); await ctx.close()
        # 4) bot: bolumun kendi top sayisiyla (3 farkli rastgele tohum: patlama/kirilma rastgelelikleri) ve sinirsiz (gereken atis)
        R['bot'] = []
        for th in (12345, 777, 4242):
            ctx, pg = await sayfa(b, 390, 844, 1, f'test&tilki=0&pilot={N}', hatalar, th)
            await pg.wait_for_function('window.YP && YP.g', timeout=300000); await modul(pg)
            r = await pg.evaluate('PT.botEkran(80, false)'); r['tohum'] = th; r.pop('iz', None); R['bot'].append(r); await ctx.close()
        ctx, pg = await sayfa(b, 390, 844, 1, f'test&tilki=0&pilot={N}', hatalar)
        await pg.wait_for_function('window.YP && YP.g', timeout=300000); await modul(pg)
        R['botSinirsiz'] = await pg.evaluate('PT.botEkran(80, true)'); await ctx.close()
        # 5-6) ekran goruntuleri, cerceve, performans (normal kip)
        R['ekran'] = {}
        for (w, h, dpr) in OLCU:
            ctx, pg = await acik(b, N, w, h, dpr, hatalar)
            await pg.wait_for_timeout(3500)
            await pg.evaluate("() => { const n = document.getElementById('nm'); if (n) n.style.display = 'none'; }")
            yol = os.path.join(RAPOR, f'P{N}_{w}x{h}.jpg')
            await pg.screenshot(path=yol, type='jpeg', quality=88, timeout=180000)
            R['ekran'][f'{w}x{h}'] = {'dosya': os.path.relpath(yol, KOK), 'cerceve': await pg.evaluate(CERCEVE)}
            if w == 390:
                R['performans'] = await pg.evaluate(PERF)
                # aksiyon: anahtar parcaya gercek dokunus, fizik ~0.7 sn ilerleyince goruntu
                await modul(pg)
                await pg.evaluate("() => { const n = document.getElementById('hint'); if (n) n.style.display = 'none'; }")
                xy = await pg.evaluate(f"(() => {{ YP.scene.updateMatrixWorld(true); const c = YP.cubes.find((q) => q.pid === '{HEDEF[N]}'); return PT.ekranda(c, {DY[N]}); }})()")
                t1 = await pg.evaluate('YP.g.t')
                await pg.evaluate(f'PT.dokun({xy[0]}, {xy[1]})')
                await pg.wait_for_function(f'YP.g.t > {t1} + 0.75', timeout=120000)
                await pg.screenshot(path=os.path.join(RAPOR, f'P{N}_aksiyon.jpg'), type='jpeg', quality=88, timeout=180000)
            await ctx.close()
        # 7) kayit yalitimi: hazir kayitli oyuncu; pilot bot ile kazanilir; localStorage once/sonra
        ctx, pg = await acik(b, N, 390, 844, 1, hatalar, KAYITJS)
        await modul(pg)
        once = await pg.evaluate(LSJS)
        kz = await pg.evaluate('PT.botEkran(60, true)')
        if not kz['kazandi']: kz2 = await pg.evaluate('PT.botEkran(60, true)'); kz['kazandi'] = kz2['kazandi']; kz['kalan_once'] = kz['kalan']   # kayit testi icin kazanmak sart (atis sayisi onemli degil)
        try: await pg.wait_for_selector('#p-tekrar', timeout=120000); kart = True
        except Exception: kart = False
        await pg.wait_for_timeout(2500)
        kalanlar = await pg.evaluate("YP.cubes.filter((q) => !q.gone && !q.out).map((q) => q.pid + '@' + [q.body.position.x, q.body.position.y, q.body.position.z].map((v) => v.toFixed(2)))")
        sonra = await pg.evaluate(LSJS)
        tekrar = None
        if kart:
            await pg.evaluate("document.getElementById('p-tekrar').click()"); await pg.wait_for_timeout(2500)
            tekrar = {'ls': await pg.evaluate(LSJS) == once, 'yeniden': await pg.evaluate('YP.g.state + "/" + YP.g.left')}
        R['kayit'] = {'kalanlar': kalanlar, 'kazandi': kz['kazandi'], 'ilkDenemeKalan': kz.get('kalan_once', 0), 'kart': kart, 'ayni': once == sonra, 'onceKayit': json.loads(json.loads(once).get('blokpop_yapi_v3', 'null') or 'null') == KAYIT, 'anahtarlar': sorted(json.loads(sonra).keys()), 'tekrar': tekrar}
        await ctx.close()
        R['hatalar'] = [h for h in hatalar if 'GPU stall' not in h]; R['sure'] = round(time.time() - t0)
        json.dump(R, open(os.path.join(RAPOR, f'P{N}.json'), 'w'), ensure_ascii=False, indent=1)
        print(json.dumps(R, ensure_ascii=False), flush=True)

async def ekran(b):
    for N in LISTE:
        hatalar = []
        for (w, h, dpr) in OLCU:
            ctx, pg = await acik(b, N, w, h, dpr, hatalar)
            await pg.wait_for_timeout(3500)
            await pg.evaluate("() => { const n = document.getElementById('nm'); if (n) n.style.display = 'none'; }")
            await pg.screenshot(path=os.path.join(RAPOR, f'P{N}_{w}x{h}.jpg'), type='jpeg', quality=88, timeout=180000)
            print(N, w, h, await pg.evaluate(CERCEVE), (await pg.evaluate(PERF)) if w == 390 else '', flush=True)
            await ctx.close()
        print(N, 'hatalar', hatalar, flush=True)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, args=ARGS)
        if KIP == 'regresyon': await regresyon(b)
        elif KIP == 'pilot': await pilot(b)
        elif KIP == 'ekran': await ekran(b)
        await b.close()
asyncio.run(main())
