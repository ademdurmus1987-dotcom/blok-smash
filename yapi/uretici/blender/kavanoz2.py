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

def kav2(ad, hS, olc=1):
    SS = S * olc; k = hS; SEG = 24
    yb, yt = -0.5 * k, 0.5 * k
    kh = 0.2; ka = yt - kh            # kapak: ust 0.2 (kalin), alt kenari ka
    bo = ka - 0.035                    # boyun ust
    cizgi = lambda j: BEYAZ if (j // 2) % 2 == 0 else GOVDE   # 6 beyaz + 6 renkli dilim
    R = 0.47
    prof = [
        (0.43, yb, GOVDE), (0.462, yb + 0.03, GOVDE), (R, yb + 0.09, GOVDE),                                   # yuvarlak dip
        (R, bo - 0.17, GOVDE), (0.455, bo - 0.09, GOVDE), (0.405, bo - 0.02, GOVDE), (0.39, bo, GOVDE),       # yuvarlak omuz -> boyun
        (0.39, ka - 0.004, cizgi),                                                                             # boyun (kapagin altinda)
        (0.455, ka, cizgi), (0.49, ka + 0.025, cizgi), (0.495, ka + 0.06, cizgi), (0.495, yt - 0.06, cizgi),  # tirtikli kapak
        (0.49, yt - 0.03, BEYAZ), (0.465, yt - 0.006, BEYAZ), (0.42, yt, GOVDE)                                 # beyaz dudak, ust yuz govde renginde
    ]
    prof = [(rr * SS, y * SS, c) for rr, y, c in prof]
    dalga = {i: 0.95 for i in (9, 10, 11)}   # tirtik: tek dilimler iceride
    P = [torna(prof, SEG, dalga)]
    return uret(ad, P, 0.1, keskin=70.0, klasor=BLOK2)

def main2():
    bpy.ops.wm.read_factory_settings(use_empty=True); dunya()
    T = {'kav2_1': lambda: kav2('kav2_1', 1), 'kav2_2': lambda: kav2('kav2_2', 2), 'kav2_3': lambda: kav2('kav2_3', 3), 'kav2_B': lambda: kav2('kav2_B', 1, 2)}
    sec = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else list(T)
    for a in sec: T[a]()

main2()
