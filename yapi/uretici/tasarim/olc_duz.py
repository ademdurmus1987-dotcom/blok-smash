import sys, json, time
IW, NW, LST = int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
sys.argv = sys.argv[:1] + [str(IW), str(NW), LST, sys.argv[1], '90']
exec(open('olc.py', encoding='utf-8').read().split("JS = '''")[0])
JS = '''const [L,sinir,cb]=arguments;(async()=>{YP.start(L);for(let i=0;i<300&&!(YP.g&&YP.g.L===L&&YP.cubes.length);i++)await new Promise(r=>setTimeout(r,25));await new Promise(r=>setTimeout(r,300));
const np=YP.cubes.length,top=YP.g.max;const b=PT.bot(sinir,true);cb({np,top,bot:b.atis,kaz:b.kazandi,kalan:b.kalan})})().catch(e=>cb({hata:''+e}))'''
import os
d = ac(); R = json.load(open(OUT)) if os.path.exists(OUT) else {}
for j, L in enumerate(json.load(open(LST))):
    if j % NW != IW or str(L) in R: continue
    try: r = d.execute_async_script(JS, L, 45)
    except Exception as e: r = {'hata': str(e)[:80]}; d.quit(); d = ac()
    R[str(L)] = r; print(L, r, flush=True); json.dump(R, open(OUT, 'w'))
json.dump(R, open(OUT, 'w')); d.quit()
