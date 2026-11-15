# Katalog goruntulerini gruplara ayrilmis tek bir sayfada birlestirir; her blogun altina adi, puani ve onerisi yazilir.
# Kullanim: python3 katalog_resim.py KLASOR CIKTI.jpg [puan.json] [--sadece-yakin]
import sys, json, os
from PIL import Image, ImageDraw, ImageFont
D = sys.argv[1]; OUT = sys.argv[2]; PUAN = json.load(open(sys.argv[3])) if len(sys.argv) > 3 and sys.argv[3].endswith('.json') else {}
L = json.load(open(os.path.join(D, 'liste.json')))
F = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
f1, f2, f3 = ImageFont.truetype(F, 15), ImageFont.truetype(F, 13), ImageFont.truetype(F, 30)
SIRA = ['Korsan Kalesi (kale.js)', 'Patili Oyuncak Küp', 'Eski şekiller (sekil.js)', 'Tripo GLB', 'Cam şekiller']
RENK = {'KALSIN': (60, 190, 90), 'İYİLEŞTİR': (240, 170, 30), 'ÇIKAR': (225, 60, 60)}
CW, CH, COLS = 260 * 2 + 12, 260 + 64, 4
gruplar = {}
for it in L: gruplar.setdefault(it['grup'], []).append(it)
rows = []
for g in SIRA + [g for g in gruplar if g not in SIRA]:
    if g in gruplar: rows.append(g)
H = 40
for g in rows: H += 56 + ((len(gruplar[g]) + COLS - 1) // COLS) * (CH + 10)
W = COLS * (CW + 14) + 20
im = Image.new('RGB', (W, H), (24, 18, 40)); d = ImageDraw.Draw(im); y = 20
for g in rows:
    d.text((20, y + 10), g + '  (' + str(len(gruplar[g])) + ')', font=f3, fill=(255, 214, 90)); y += 56
    for n, it in enumerate(gruplar[g]):
        x = 20 + (n % COLS) * (CW + 14); yy = y + (n // COLS) * (CH + 10)
        d.rectangle([x - 4, yy - 4, x + CW + 4, yy + CH], fill=(44, 34, 70))
        for m, s in enumerate(['_yakin.png', '_oyun.png']):
            p = os.path.join(D, it['k'] + s)
            if os.path.exists(p): im.paste(Image.open(p), (x + m * (260 + 12), yy))
        P = PUAN.get(it['k'], {})
        ad = P.get('ad', it['k']); d.text((x + 4, yy + 266), ad + '  [' + it['k'] + ']', font=f1, fill=(255, 255, 255))
        alt = f"{it.get('tri', 0)} üçgen · {it.get('dc', 0)} çizim"
        if 'puan' in P: alt = f"Puan {P['puan']}/10 · " + alt
        d.text((x + 4, yy + 288), alt, font=f2, fill=(200, 200, 220))
        if 'karar' in P:
            k = P['karar']; tw = d.textlength(k, font=f1); d.rectangle([x + CW - tw - 14, yy + 268, x + CW - 2, yy + 290], fill=RENK.get(k, (120, 120, 120))); d.text((x + CW - tw - 8, yy + 270), k, font=f1, fill=(255, 255, 255))
        if P.get('not'): d.text((x + 4, yy + 306), P['not'][:70], font=f2, fill=(255, 200, 150))
    y += ((len(gruplar[g]) + COLS - 1) // COLS) * (CH + 10)
im.save(OUT, quality=88)
print(OUT, im.size)
