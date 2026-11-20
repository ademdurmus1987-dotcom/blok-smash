# Foxi Smash v10.31 (20 Kas 2026, Adem: 'bizim siseleri gelistir, kalite olarak referanstaki gibi'): YENI KAVANOZ SETI.
#   python -I kavanoz2.py   (bpy modulu)  ya da  blender -b --python kavanoz2.py [-- kav2_1 ...]
# blender-skills (arjun988) prop-artist / stylized-style ilkeleri: siluet once (kalin tirtikli kapak, belirgin boyun, yuvarlak omuz), sekil dili
# (yumusak, yuvarlak = dost), ayrinti dokuda degil geometride, az malzeme. Referanstaki gibi: duz renkli parlak govde (pati ve boyali parlama cizgisi
# yok: parlamayi oyundaki isik verir), kapak gövdeden hafif tasar, beyaz ve govde renkli dikey tirtik dilimleri, ustte beyaz yuvarlak dudak.
# Cikti: yapi/model/blok2/kav2_1 (1 boy), kav2_2 (2 boy), kav2_3 (3 boy), kav2_B (2x buyuk). Govde beyaz isareti oyunda turun rengine boyanir.
import os, sys, math
BURASI = os.path.dirname(os.path.abspath(__file__))
_src = open(os.path.join(BURASI, 'yeni_bloklar.py'), encoding='utf-8').read()
_src = _src[:_src.rindex('\nmain2()')]   # yalniz tanimlar (yeni_bloklar main2 calismasin)
exec(compile(_src, 'yeni_bloklar.py', 'exec'))

BEYAZ = renk('#fbf6ee')
KALIN = '--kalin' in sys.argv   # v10.31 ilk hal: kalin kapak, genis dilim

def kav2(ad, hS, olc=1):
    # v10.31c: 40 dilim (dar parlama bandi dilimler arasinda zikzak yapmasin), az halka. Kapakta 20 beyaz + 20 renkli ince dilim.
    SS = S * olc; k = hS; SEG = 40
    yb, yt = -0.5 * k, 0.5 * k
    kh = 0.15; ka = yt - kh; bo = ka - 0.035
    cizgi = lambda j: BEYAZ if j % 2 == 0 else GOVDE
    R = 0.47
    prof = [
        (0.42, yb, GOVDE), (R, yb + 0.06, GOVDE), (R, yb + 0.1, GOVDE), (R, bo - 0.19, GOVDE), (R, bo - 0.15, GOVDE),   # ara halkalar: govde yuzu duz dik normal
        (0.43, bo - 0.045, GOVDE), (0.39, bo, GOVDE),   # dip, govde, omuz
        (0.39, ka - 0.004, cizgi), (0.475, ka + 0.008, cizgi), (0.495, ka + 0.04, cizgi), (0.495, yt - 0.04, cizgi),   # boyun, tirtikli kapak
        (0.47, yt - 0.004, BEYAZ), (0.42, yt, GOVDE)                                                                    # beyaz dudak, ust yuz
    ]
    prof = [(rr * SS, y * SS, c) for rr, y, c in prof]
    P = [torna(prof, SEG, {i: 0.975 for i in (8, 9, 10)})]
    print('==', ad); ob = nesne(ad, P, 70.0); print('  ucgen', len(ob.data.polygons))   # uret'in 830 siniri 40 dilimde biraz asilir (~876)
    uv_ac(ob); img = pisir(ob, ad); malzeme(ob, ad, img, 0.1); aktar(ob, ad, BLOK2); ob.hide_render = True
    return ob

def main2():
    bpy.ops.wm.read_factory_settings(use_empty=True); dunya()
    T = {'kav2_1': lambda: kav2('kav2_1', 1), 'kav2_2': lambda: kav2('kav2_2', 2), 'kav2_3': lambda: kav2('kav2_3', 3), 'kav2_B': lambda: kav2('kav2_B', 1, 2)}
    sec = [a for a in (sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []) if a in T] or list(T)
    for a in sec: T[a]()

main2()
