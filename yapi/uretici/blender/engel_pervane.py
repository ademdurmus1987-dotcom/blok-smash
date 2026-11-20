# Foxi Smash v10.26-27 (+ duvar: kayan duvar engeli, '-- duvar' ile yalniz o)
# Foxi Smash v10.26 (20 Kas 2026, Adem: 'blender-skills ile bir deneme yap, iyi olmayan bir seyi yapalim'): DONEN PERVANE ENGELI (kurek).
# Eski hal: duz kutular (kahverengi kol, kirmizi uc, sari silindir gobek). Yeni: oyuncak tarzi Blender modeli, uc parca:
#   pervane_kol.glb : tahta kol, x = 0..1 (oyunda boyu bolume gore x yonunde olceklenir), iki tahta serit + aradaki oluk, iki altin kelepce + percin
#   pervane_uc.glb  : kirmizi yuvarlak kurek ucu (olceklenmez; kolun ucuna oturur), ortasinda krem serit
#   pervane_gobek.glb: altin gobek (torna, basamakli), 6 koyu civata, onde kirmizi kubbe
# blender-skills (arjun988) prop-artist / asset-optimization ilkeleri: oyun kamerasinda okunan siluet (bir blok ~30 px), parcali yapi (olceklenen ve
# olceklenmeyen parca ayri), pivot baglanti noktasinda (kol ve uc: gobek merkezi tarafi x=0; gobek: merkez), az malzeme (kose rengi x pisirilmis isik), dusuk ucgen.
#   python -I engel_pervane.py   (bpy modulu)  ya da  blender -b --python engel_pervane.py
import os, sys, math
BURASI = os.path.dirname(os.path.abspath(__file__))
_src = open(os.path.join(BURASI, 'pilot_bloklar.py'), encoding='utf-8').read()
_src = _src[:_src.rindex('\nmain()')]   # yalniz tanimlar
exec(compile(_src, 'pilot_bloklar.py', 'exec'))
ENGEL = os.path.join(KOK, 'yapi', 'model', 'engel'); os.makedirs(ENGEL, exist_ok=True); os.makedirs(ONIZ, exist_ok=True)

TAHTA1 = renk('#d98a3c'); TAHTA2 = renk('#c2702a'); OLUK = renk('#6a3a16'); TKRM = renk('#fff0cf')
KIRM = renk('#e8302a'); KIRMK = renk('#a8181a'); ALT = renk('#ffbe2e'); ALTK = renk('#c98612'); CIVI = renk('#3a2a40')

H, D = 0.72, 0.34   # kolun kesiti (oyun birimi): eski kutuyla ayni (fizik kutusu degismez)

def kutu(cx, cy, cz, w, h, d, r, seg, c):
    bm = kutu_bm(w, h, d, r, seg)
    for v in bm.verts: v.co.x += cx; v.co.y += cy; v.co.z += cz
    P = bm_al(bm, lambda f: c); bm.free(); return P

def kol():
    # iki tahta serit (ust ve alt), aralarinda koyu oluk; x = 0..1 (olcekte uzar). Uclari hafif yuvarlak.
    P = []
    P.append(kutu(0.5, 0.0, 0.0, 1.0, H * 0.18, D * 0.86, 0.02, 1, OLUK))              # oluk (arkada, iki seridin arasi)
    P.append(kutu(0.5, H * 0.26, 0.0, 1.0, H * 0.47, D, 0.05, 2, TAHTA1))               # ust serit
    P.append(kutu(0.5, -H * 0.26, 0.0, 1.0, H * 0.47, D, 0.05, 2, TAHTA2))              # alt serit
    for x in (0.2, 0.8):                                                                 # altin kelepce + onde/arkada 2 percin
        P.append(kutu(x, 0, 0, 0.075, H * 1.1, D * 1.18, 0.025, 2, ALT))
        for z in (1, -1):
            for y in (H * 0.27, -H * 0.27): P.append(kutu(x, y, z * D * 0.6, 0.05, 0.05, 0.04, 0.012, 1, CIVI))
    return P

def uc():
    # kurek ucu: x = 0..0.62, kolun kesitinden iri (siluet ucunda okunur); kalin yuvarlak kenar, ortasinda krem serit
    w, h, d = 0.62, H * 1.25, D * 1.35
    P = [kutu(w / 2, 0, 0, w, h, d, 0.13, 3, KIRM)]
    P.append(kutu(w * 0.5, 0, 0, w * 0.26, h * 1.01, d * 1.02, 0.04, 2, TKRM))
    P.append(kutu(0.02, 0, 0, 0.06, h * 0.86, d * 0.9, 0.02, 1, KIRMK))                 # kola oturan koyu yaka
    return P

def gobek():
    # torna (eksen y) -> eksen z (kameraya bakar): arka disk, altin basamaklar, onde kirmizi kubbe
    prof = [(0.0, -0.31, ALTK), (0.5, -0.31, ALTK), (0.56, -0.25, ALT), (0.56, 0.08, ALT), (0.5, 0.14, ALT), (0.4, 0.16, ALTK), (0.36, 0.2, ALT),
            (0.3, 0.26, KIRM), (0.29, 0.3, KIRM), (0.25, 0.38, KIRM), (0.17, 0.44, KIRM), (0.0, 0.47, KIRM)]
    V, F, C = torna(prof, 28)
    V = [(x, -z, y) for (x, y, z) in V]   # torna ekseni y -> z
    P = [(V, F, C)]
    for i in range(6):                     # on yuzde 6 koyu civata
        a = i / 6 * 2 * Pi + Pi / 6
        bm = kutu_bm(0.09, 0.09, 0.06, 0.03, 2)
        for v in bm.verts: v.co.x += math.cos(a) * 0.46; v.co.y += math.sin(a) * 0.46; v.co.z += 0.12
        P.append(bm_al(bm, lambda f: CIVI)); bm.free()
    return P

def duvar():
    # v10.27 kayan duvar (eski: duz tahta levha + kirmizi direk): 2.7 x 1.9 x 0.32 tahta kapak; 3 yatay tahta (iki ton, aralari oluk), koyu demir
    # cerceve, iki demir kusak + percin, iki yanda kirmizi yuvarlak direk ve altin baslik. Merkez pivot (fizik kutusu 2.9 x 2.0 x 0.4 ile ayni yer).
    W, Hh, Dd = 2.7, 1.9, 0.32; P = []
    for i, y in enumerate((-Hh / 3, 0, Hh / 3)):
        P.append(kutu(0, y, 0, W - 0.08, Hh / 3 - 0.06, Dd * (0.92 if i % 2 else 1.0), 0.04, 2, TAHTA1 if i % 2 == 0 else TAHTA2))
    P.append(kutu(0, 0, 0, W - 0.1, Hh - 0.1, Dd * 0.7, 0.02, 1, OLUK))
    DEM = renk('#4a4f5c'); DEMA = renk('#8a93a4')
    for y in (Hh / 2 - 0.06, -Hh / 2 + 0.06): P.append(kutu(0, y, 0, W, 0.14, Dd + 0.06, 0.04, 2, DEM))
    for y in (Hh * 0.2, -Hh * 0.2):
        P.append(kutu(0, y, 0, W - 0.1, 0.12, Dd + 0.05, 0.03, 2, DEM))
        for x in (-0.95, -0.32, 0.32, 0.95):
            for z in (1, -1): P.append(kutu(x, y, z * (Dd / 2 + 0.03), 0.07, 0.07, 0.04, 0.015, 1, DEMA))
    for x in (-W / 2, W / 2):
        P.append(kutu(x, 0, 0, 0.26, Hh + 0.12, Dd + 0.12, 0.1, 3, KIRM))
        for y in (Hh / 2 + 0.1, -Hh / 2 - 0.1): P.append(kutu(x, y, 0, 0.34, 0.12, Dd + 0.18, 0.05, 2, ALT))
    return P

def yap(ad, P, puruz):
    print('==', ad)
    ob = nesne(ad, P, 50.0); print('  ucgen', len(ob.data.polygons))
    uv_ac(ob); img = pisir(ob, ad); malzeme(ob, ad, img, puruz); aktar(ob, ad, ENGEL); ob.hide_render = True
    return ob

def main():
    bpy.ops.wm.read_factory_settings(use_empty=True); dunya()
    sec = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else ['kol', 'uc', 'gobek', 'duvar']
    if 'kol' in sec: yap('pervane_kol', kol(), 0.55)
    if 'uc' in sec: yap('pervane_uc', uc(), 0.3)
    if 'gobek' in sec: yap('pervane_gobek', gobek(), 0.28)
    if 'duvar' in sec: yap('duvar', duvar(), 0.5)

main()
