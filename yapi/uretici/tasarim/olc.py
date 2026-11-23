# Foxi Smash v12: tasarimlari oyunun kendi fizigiyle olcer (denge, bot atisi). python olc.py isci isciSayisi liste.json cikti_on_ek
import sys, json, time, os, base64
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
i, n, liste, on = int(sys.argv[1]), int(sys.argv[2]), json.load(open(sys.argv[3])), sys.argv[4]
OUT = f'{on}_{i}.json'; R = json.load(open(OUT)) if os.path.exists(OUT) else {}
is_ = [k for j, k in enumerate(liste) if j % n == i and str(k) not in R]
def ac():
    o = Options(); o.add_argument('--headless=new'); o.add_argument('--window-size=390,844'); o.add_argument('--mute-audio'); o.add_argument('--disable-background-timer-throttling')
    d = webdriver.Chrome(options=o)
    try: d.command_executor._client_config.timeout = 900
    except Exception: pass
    try: d.command_executor.set_timeout(900)
    except Exception: pass
    d.set_script_timeout(600); d.set_page_load_timeout(120)
    d.get('http://localhost:8770/yapi/index.html?test&sekil=1&tilki=0&kart=0&sv=1&engsiz&egri=1')
    for k in range(90):
        time.sleep(1)
        if d.execute_script('return !!(window.YP&&YP.g)'): break
        if k in (20, 45, 70): d.refresh()
    d.execute_async_script("const cb=arguments[0];Promise.all([import('./uretici/pilot_test.js?v=9'),import(performance.getEntriesByType('resource').map(r=>r.name).find(u=>/sira.js/.test(u)))]).then(([t,s])=>{window.PT=t;window.SK=s.SEKIL;cb()})")
    return d
JS = '''const [n,L,sinir,cb]=arguments;(async()=>{const bas=performance.now();SK[L]=[n,'t',50,'sabit'];YP.start(L);for(let i=0;i<400&&!(YP.g&&YP.g.L===L&&YP.cubes.length&&YP.lv(L).sekil===n&&window.__n!==n);i++)await new Promise(r=>setTimeout(r,25));
window.__n=n;if(!YP.cubes.length)return cb({hata:'kurulamadi'});YP.g.armed=!!window.__HAR;if(window.__HAR){YP.g.kirB=99}const np=YP.cubes.length,d=PT.durgunluk(window.__HAR?4:2.5);const b=sinir?PT.bot(sinir,true):{};cb({np,dus:d.dus,kay:d.kay,en:d.enCok,bot:b.atis,kaz:b.kazandi,kalan:b.kalan,ms:Math.round(performance.now()-bas)})})().catch(e=>cb({hata:''+e}))'''
d = ac()
if len(sys.argv) > 6 and sys.argv[6] == 'm': d.execute_script('window.__HAR=1')
L = 1003 + i; say = 0; t0 = time.time()
for k in is_:
    L += 10
    if L > 1990: L = 1003 + i
    try: r = d.execute_async_script(JS, k, L, int(sys.argv[5]) if len(sys.argv) > 5 else 45)
    except Exception as e:
        r = {'hata': 'zaman'}
        try: d.quit()
        except Exception: pass
        d = ac()
        if len(sys.argv) > 6 and sys.argv[6] == 'm': d.execute_script('window.__HAR=1')
    R[str(k)] = r; say += 1
    if say % 5 == 0: json.dump(R, open(OUT, 'w'))
    if say % 20 == 0: print(i, say, len(is_), round(time.time() - t0), r, flush=True)
    if say % 120 == 0:
        d.quit(); d = ac()
        if len(sys.argv) > 6 and sys.argv[6] == 'm': d.execute_script('window.__HAR=1')
json.dump(R, open(OUT, 'w')); d.quit(); print('bitti', i)
