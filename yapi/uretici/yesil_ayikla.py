# Foxi Smash v10.9: Adem'in Gemini GIF/PNG cizimlerinde yesil zemini ayiklar (oran anahtari + figur ici GIF titresim noktalari doldurulur).
# Kullanim: SRC ve anim(...) satirlarini yeni dosyaya gore duzenleyip: python3 yapi/uretici/yesil_ayikla.py
import numpy as np
from PIL import Image, ImageSequence, ImageFilter
SRC = '/root/.claude/uploads/40f5d5a4-4ab7-5b31-b431-620115cbe846/'
def anahtar(im):
    a = np.asarray(im.convert('RGB')).astype(np.float32); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = np.maximum(r, b) + 1; oran = g / m
    global ORAN; ORAN = oran
    bas = 1.27 + 0.28 * np.clip((100 - g) / 60, 0, 1)   # koyu pikselde (kiyafet) yesil yansima daha cok olsa da opak kalsin
    al = np.clip(1 - (oran - bas) / 0.2, 0, 1)          # g, kirmizi/maviden %12 fazlaysa saydamlasmaya baslar, %34 fazlada tam saydam (koyu golge de)
    al = np.where(g < 18, 1.0, al)                         # cok koyu (siyah) piksel: oran gurultulu, opak kalsin
    g2 = np.where(oran > 1.0, np.minimum(g, m), g)         # yesil tasmasi
    o = Image.fromarray(np.dstack([r, g2, b, al * 255]).astype(np.uint8), 'RGBA')
    A0 = o.split()[3]
    M = A0.point(lambda v: 255 if v > 60 else 0).filter(ImageFilter.MaxFilter(3))   # figur maskesi (ince kenar dahil)
    # en buyuk parca: merkezden (figurun govdesi) tasma doldurma
    from PIL import ImageDraw
    w, h = M.size; F = M.copy(); tohum = None
    for yy in range(h // 2, h): 
        if F.getpixel((w // 2, yy)) == 255: tohum = (w // 2, yy); break
    if tohum: ImageDraw.floodfill(F, tohum, 128)
    govde = F.point(lambda v: 255 if v == 128 else 0)                   # yalniz figure bagli pikseller
    # icteki delikler: kenardan ulasilamayan bos alan
    D = govde.copy(); D = Image.eval(D, lambda v: 0 if v else 255)       # bos = 255
    B = D.copy(); ImageDraw.floodfill(B, (0, 0), 100); ImageDraw.floodfill(B, (w - 1, h - 1), 100); ImageDraw.floodfill(B, (0, h - 1), 100); ImageDraw.floodfill(B, (w - 1, 0), 100)
    delik = B.point(lambda v: 255 if v == 255 else 0)
    a0 = np.asarray(A0).astype(np.float32); gv = np.asarray(govde) > 0; dk = np.asarray(delik) > 0
    kapali = np.asarray(govde.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))) > 0
    oranA = ORAN
    dolgu = kapali & ~gv & (oranA < 1.6)                     # figur icindeki yesil yansimali metal/kumas (gercek zemin ~1.8+)
    a = np.where(gv, a0, 0); a = np.where(dk | dolgu, 255, a)
    a = np.where(kapali & (oranA < 1.45), np.maximum(a, 255 * np.clip((1.6 - oranA) / 0.15, 0, 1)), a)
    # GIF titresim noktalari: figur icinde tek tek zemin yesili pikseller -> komsularin ortanca rengi ve opaklik
    Ai = Image.fromarray(a.astype(np.uint8)); Am = np.asarray(Ai.filter(ImageFilter.MedianFilter(5))).astype(np.float32)
    nokta = kapali & (a < 128) & (Am >= 128)
    if nokta.any():
        rgb = np.asarray(o.convert('RGB')).copy(); orta = np.asarray(o.convert('RGB').filter(ImageFilter.MedianFilter(5)))
        # ortanca da yesilse (cok nokta) daha genis pencere
        orta7 = np.asarray(o.convert('RGB').filter(ImageFilter.MedianFilter(9)))
        yes = (orta[..., 1].astype(float) / (np.maximum(orta[..., 0], orta[..., 2]) + 1)) > 1.3
        orta = np.where(yes[..., None], orta7, orta)
        rgb[nokta] = orta[nokta]; o = Image.merge('RGBA', (*Image.fromarray(rgb).split(), o.split()[3]))
        a = np.where(nokta, 255, a)
    A = Image.fromarray(a.astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
    A = A.point(lambda v: 0 if v < 50 else v); o.putalpha(A); return o
def kutu(im):
    a = np.asarray(im.split()[3]) > 200; cx = np.where(a.sum(0) >= 12)[0]; cy = np.where(a.sum(1) >= 6)[0]   # tek tuk kirintilar sayilmaz
    return cx.min(), cy.min(), cx.max() + 1, cy.max() + 1
def anim(dosya, cikti, H=260):
    g = Image.open(SRC + dosya); kare = [anahtar(f.copy()) for f in ImageSequence.Iterator(g)]
    bx = [kutu(k) for k in kare]; L = min(b[0] for b in bx); T = min(b[1] for b in bx); R = max(b[2] for b in bx); B = max(b[3] for b in bx)
    W0, H0 = kare[0].size; k2 = [k.crop((max(0, L - 3), max(0, T - 3), min(W0, R + 3), min(H0, B + 2))) for k in kare]
    w, h = k2[0].size; W = round(w * H / h); k3 = [k.resize((W, H), Image.LANCZOS) for k in k2][::2]
    k3[0].save(cikti, save_all=True, append_images=k3[1:], duration=200, loop=0, quality=70, method=6)
    for i, bg in enumerate([(255, 255, 255, 255), (30, 20, 80, 255)]):
        o = Image.new('RGBA', k3[0].size, bg); o.alpha_composite(k3[len(k3) // 2]); o.convert('RGB').save(cikti + '_onz%d.jpg' % i)
    print(cikti, W, H, len(k3), (L, T, R, B))
anim('a4a5be92-image.gif', 'tilki_uzgun_anim.webp')
anim('62c9c632-image.gif', 'tilki_sevinc_anim.webp')
p = anahtar(Image.open(SRC + 'b6cd79fb-image.png')); cx, cy, s = 750, 960, 940
p.crop((cx - s // 2, cy - s // 2, cx + s // 2, cy + s // 2)).resize((256, 256), Image.LANCZOS).save('tilki_uzgun.webp', quality=82, method=6)
