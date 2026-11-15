# Oyun ici ekran goruntusu (390x844): python3 ekran.py PORT CIKTI_KLASORU 1,5,12,25,780 [onek]
import sys, asyncio, os
from playwright.async_api import async_playwright
CHROME = os.environ.get('CHROME', '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome')
PORT, OUT, LS = sys.argv[1], sys.argv[2], [int(x) for x in sys.argv[3].split(',')]
ON = sys.argv[4] if len(sys.argv) > 4 else ''
os.makedirs(OUT, exist_ok=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        for L in LS:
            ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
            pg = await ctx.new_page(); pg.on('pageerror', lambda e: print('HATA', L, e, flush=True))
            await pg.goto(f'http://localhost:{PORT}/yapi/index.html?sv={L}&kart=0')
            await pg.wait_for_function('window.YP && YP.g && YP.g.L == ' + str(L), timeout=300000)
            await pg.wait_for_timeout(9000)
            await pg.evaluate("() => { const n = document.getElementById('nm'); if (n) n.style.display = 'none'; }")
            await pg.screenshot(path=os.path.join(OUT, f'{ON}{L}.jpg'), type='jpeg', quality=88, timeout=180000)
            info = await pg.evaluate("() => ({ calls: YP.ren.info.render.calls, tri: YP.ren.info.render.triangles, n: YP.cubes.length })")
            print(L, info, flush=True)
            await ctx.close()
        await b.close()
asyncio.run(main())
