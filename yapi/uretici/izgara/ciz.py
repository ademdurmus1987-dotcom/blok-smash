# izgara harflerini orijinal kirpimin ustune yazar (dogrulama icin)
import sys, json
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import izgara as I
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
KUTULAR = None
def kontrol(f, R, K, cikti, sec=None, oz=None):
    im = I.yukle(f); I.bgayarla(im); src = Image.open(f).convert('RGB'); sonuc = {}
    tiles = []
    for i, b in enumerate(KUTULAR or I.tasarimlar(im, R, K)):
        if sec and i not in sec: continue
        kb = I.kutu(im, b); k, r, cw, ch = I.izgara(im, kb)
        if KUTULAR is None and abs(cw - 68) > 4 and abs((kb[2] - kb[0]) / 68 - round((kb[2] - kb[0]) / 68)) < .2: k = round((kb[2] - kb[0]) / 68)
        if oz and i in oz: k, r = oz[i]
        L = I.hucreler(im, kb, k, r); G = I.duzelt(L, [''.join(I.sinifla(c) for c in row) for row in L])
        sonuc[i] = {'kutu': kb, 'K': k, 'R': r, 'G': G}
        x0, y0, x1, y1 = kb; t = src.crop((x0, y0, x1, y1)).copy(); d = ImageDraw.Draw(t); cw = (x1 - x0) / k; ch = (y1 - y0) / r
        for rr in range(r):
            for cc in range(k):
                xa, ya = cc * cw, (y1 - y0) - (rr + 1) * ch
                d.rectangle([xa, ya, xa + cw, ya + ch], outline=(0, 255, 0))
                d.text((xa + 4, ya + 2), G[rr][cc], font=F, fill=(0, 0, 0), stroke_width=2, stroke_fill=(255, 255, 255))
        t.thumbnail((520, 560)); tiles.append(t)
    W = Image.new('RGB', (520 * min(3, len(tiles)), 560 * ((len(tiles) + 2) // 3)), 'white')
    for j, t in enumerate(tiles): W.paste(t, ((j % 3) * 520, (j // 3) * 560))
    W.save(cikti, quality=85); return sonuc
if __name__ == '__main__':
    s = kontrol(sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4])
    json.dump(s, open(sys.argv[4] + '.json', 'w'))
    for i, v in s.items(): print(i, v['K'], v['R'])
