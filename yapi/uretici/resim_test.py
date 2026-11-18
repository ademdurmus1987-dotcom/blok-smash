# Foxi Smash v8.3: resim bolumleri (?pilot=31..36) testi. Repo kokunde 'python3 -m http.server 8770' acik olmali.
#   python3 yapi/uretici/resim_test.py ekran 31,32      -> rapor/resim/R{N}.jpg (390x844, on kamera)
#   python3 yapi/uretici/resim_test.py fizik 31,32      -> 5 sn atissiz fizik: kayan/dusen blok, en cok kayma
#   python3 yapi/uretici/resim_test.py bot 31,32        -> bolumun kendi top sayisiyla 3 tohumda oyuncu botu + sinirsiz
import sys, json, asyncio, os
from playwright.async_api import async_playwright
KOK = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = os.environ.get('CHROME', '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome')
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required']
KIP, LISTE = sys.argv[1], [int(x) for x in sys.argv[2].split(',')]
RAPOR = os.path.join(KOK, 'yapi/uretici/rapor/resim'); os.makedirs(RAPOR, exist_ok=True)
TOHUM = "(() => { let a = TOHUMNO; Math.random = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();"
URL = 'http://localhost:8770/yapi/index.html'
async def sayfa(b, sorgu, hatalar, tohum=12345, w=390, h=844, dpr=1):
    ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=dpr)
    await ctx.add_init_script(TOHUM.replace('TOHUMNO', str(tohum)))
    pg = await ctx.new_page()
    pg.on('pageerror', lambda e: hatalar.append('pageerror: ' + str(e)))
    pg.on('console', lambda m: hatalar.append(m.text) if m.type in ('error', 'warning') else None)
    await pg.goto(URL + '?' + sorgu)
    return ctx, pg
async def modul(pg):
    await pg.evaluate("import('./uretici/pilot_test.js?v=' + Date.now()).then((m) => { window.PT = m; })")
    await pg.wait_for_function('window.PT', timeout=60000)
# her blogun 5 sn sonraki kaymasi (dunya birimi) ve donmesi; tum bloklar uyandirilir
FIZIK = """((sn) => { const P = YP, bas = P.cubes.map((c) => [c.body.position.clone(), c.body.quaternion.clone()]);
  for (const c of P.cubes) c.body.wakeUp(); P.run(sn, true);
  const L = P.cubes.map((c, i) => { const d = c.body.position.vsub(bas[i][0]).length(); const q = bas[i][1], r = c.body.quaternion, dot = Math.abs(q.x*r.x+q.y*r.y+q.z*r.z+q.w*r.w); const v = c.body.position.vsub(bas[i][0]); return { id: c.pid, d: +d.toFixed(4), yatay: +Math.hypot(v.x, v.z).toFixed(4), dy: +v.y.toFixed(4), don: +(2*Math.acos(Math.min(1, dot))*180/Math.PI).toFixed(2), dus: c.gone || c.out }; });
  L.sort((a, b) => b.d - a.d); return { n: L.length, dusen: L.filter((x) => x.dus).length, kayan: L.filter((x) => x.d > 0.02 || x.don > 1).length, enCok: L.slice(0, +(window.__K || 3)), enCokYatay: Math.max(...L.map((x) => x.yatay)), enCokDon: Math.max(...L.map((x) => x.don)), uyuyan: P.cubes.filter((c) => c.body.sleepState === 2).length }; })"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, args=ARGS)
        for N in LISTE:
            hatalar = []
            if KIP == 'ekran':
                ctx, pg = await sayfa(b, f'pilot={N}&tilki=0', hatalar, dpr=2)
                await pg.wait_for_function('window.YP && YP.g && window.__bsHazir', timeout=300000)
                await pg.evaluate("() => { const l = document.getElementById('load'); if (l) l.click(); }")
                await pg.wait_for_timeout(5000)
                await pg.evaluate("() => { for (const i of ['nm', 'hint']) { const n = document.getElementById(i); if (n) n.style.display = 'none'; } }")
                await pg.screenshot(path=os.path.join(RAPOR, f'R{N}.jpg'), type='jpeg', quality=88, timeout=180000)
                print(N, 'ekran', [h for h in hatalar if 'GPU' not in h][:5], flush=True); await ctx.close()
            elif KIP == 'fizik':
                ctx, pg = await sayfa(b, f'test&tilki=0&pilot={N}', hatalar)
                await pg.wait_for_function('window.YP && YP.g', timeout=300000)
                r = await pg.evaluate(FIZIK + '(5.0)'); print(N, 'fizik', json.dumps(r, ensure_ascii=False), flush=True); await ctx.close()
            elif KIP == 'tek':
                ctx, pg = await sayfa(b, f'test&tilki=0&pilot={N}', hatalar)
                await pg.wait_for_function('window.YP && YP.g', timeout=300000); await modul(pg)
                r = await pg.evaluate('PT.botEkran(+(window.__MAX || 90), true)'); r.pop('iz', None); print(N, 'tek', json.dumps(r), flush=True); await ctx.close()
            elif KIP == 'bot':
                out = []
                for th in (12345, 777, 4242):
                    ctx, pg = await sayfa(b, f'test&tilki=0&pilot={N}', hatalar, th)
                    await pg.wait_for_function('window.YP && YP.g', timeout=300000); await modul(pg)
                    r = await pg.evaluate('PT.botEkran(80, false)'); r.pop('iz', None); r['tohum'] = th; out.append(r); await ctx.close()
                ctx, pg = await sayfa(b, f'test&tilki=0&pilot={N}', hatalar)
                await pg.wait_for_function('window.YP && YP.g', timeout=300000); await modul(pg)
                r = await pg.evaluate('PT.botEkran(80, true)'); r.pop('iz', None); out.append({'sinirsiz': r}); await ctx.close()
                print(N, 'bot', json.dumps(out), [h for h in hatalar if 'GPU' not in h][:3], flush=True)
        await b.close()
asyncio.run(main())
