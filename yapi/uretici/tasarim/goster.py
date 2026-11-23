# tasarim listesi (json: [{ad, P:[[tur,x,y,z]]}]) -> 2B onizleme sayfalari (on sira). python goster.py liste.json cikti_on_ek [sutun satir]
import json, sys
from PIL import Image, ImageDraw, ImageFont
R = {'K':'#ea1f31','M':'#1c7cf6','S':'#ffc310','Y':'#22b935','P':'#9a35f2','T':'#ff8016','N':'#ff479f','A':'#22b4ff','B':'#f3ece2','Z':'#2c3560','H':'#a45a24','G':'#97a0b6','E':'#f2c88e','L':'#16bfc4'}
T = {'ksTas':'#6470b4','ksSandik':'#fb9a2e','ksSandikK':'#d8281e','ksSandikM':'#8a30e0','ksTNT':'#ff0000','ksYildiz':'#ffd84a','ksBuz':'#6fd0ff','ksBuz3':'#6fd0ff','ksFici':'#e08a2a','ksFiciK':'#e04030','oyA':'#f7a040','ksSutun':'#c8d0e8','ksMorSutun':'#b060ff','ksDirek':'#d8842a','ksKemer':'#5460a4','ksSiseY':'#22d935','ksSiseB':'#3c9cff','ksSiseM':'#b060ff'}
GEN = {'ksTas2':2,'ksTas3':3,'ksTas4':4,'ksKalas2':2,'ksKalas3':3,'ksKemer':3,'ksBuz3':3}; BOY = {'ksKalas1':.5,'ksKalas2':.5,'ksKalas3':.5,'ksDirek':2,'ksSutun':2,'ksMorSutun':2,'ksKemer':2}
def renk(t):
    if t.startswith('ksTas'): return T['ksTas']
    if t.startswith('ksKalas'): return '#f0a040'
    return T.get(t) or R.get(t[-1], '#888')
def wh(t):
    w = GEN.get(t, 1); h = BOY.get(t, 1)
    if t[:2] == 'uz' or t[:3] == 'kr3': w = int(t[2])
    if t[:3] == 'kvB': w, h = 2, 2
    if t[:3] == 'kvU': h = 2
    if t[:3] == 'kvL': h = 3
    return w, h
L = json.load(open(sys.argv[1], encoding='utf-8')); C = int(sys.argv[3]) if len(sys.argv) > 3 else 14; S = int(sys.argv[4]) if len(sys.argv) > 4 else 6
q = 11; CW, CH = 150, 168; F = ImageFont.truetype('arial.ttf', 11)
for s in range(0, len(L), C * S):
    im = Image.new('RGB', (C * CW, S * CH), '#bfe3f5'); d = ImageDraw.Draw(im)
    for k, b in enumerate(L[s:s + C * S]):
        x0, y0 = k % C * CW + CW // 2, k // C * CH + CH - 18
        for t, x, y, z in sorted(b['P'], key=lambda p: p[3]):
            w, h = wh(t); d.rectangle([x0 + (x - w / 2) * q, y0 - (y + h) * q, x0 + (x + w / 2) * q - 1, y0 - y * q - 1], fill=renk(t), outline='#0003' if 0 else '#00000044'[:7])
        d.text((k % C * CW + 3, y0 + 2), b['ad'][:24], font=F, fill='#000')
    im.save('%s%d.png' % (sys.argv[2], s // (C * S)))
print(len(L))
