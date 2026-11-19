# Foxi Smash v9.0 (19 Kas 2026, Adem: 'zorluk egrisine gore araya serpistir'): sekil bolumlerinin ana oyundaki yeri -> yapi/pilot/sira.js
#   python3 yapi/pilot/sira.py   (resim.json, duvar.json, yeni.json degisince yeniden calistir)
# Zorluk: botun atis sayisi (yoksa bolumun top sayisindan geri hesap). Kolaydan zora siralanir, 26'dan baslayip her 10 bolumde bir
# (dunyanin 6. bolumu: egri.js'te 'normal' tur, ne nefes ne zor) ana oyunun bolumunun yerine gecer. Ana oyunun 2000 bolumu ve kaydi degismez.
import json, os
D = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(D, 'sira.js')
BAS, ADIM = 26, 10
# v9.0: bot.json = oyuncu botunun atis sayisi (yay atis, hareketli platform dahil, sinirsiz top, tohum 12345; scratch bot.js ile olculdu)
BOTP = os.path.join(D, 'bot.json'); BOTV = json.load(open(BOTP)) if os.path.exists(BOTP) else {}
L = []
for f, geri in (('resim.json', lambda t: (t - 1) / 1.15), ('duvar.json', lambda t: (t - 2) / 1.15), ('yeni.json', lambda t: (t - 2) / 1.15)):
    p = os.path.join(D, f)
    if not os.path.exists(p): continue
    for n, b in json.load(open(p))['bolumler'].items():
        bot = BOTV.get(n) or b.get('bot') or geri(b['top'])
        L.append((round(bot, 1), int(n), b['ad'], b.get('hareketTip', 'sabit')))
L.sort(key=lambda x: (x[0], x[1]))
S = {}
for i, (bot, n, ad, ht) in enumerate(L):
    Lv = BAS + i * ADIM
    if Lv > 2000: break
    S[Lv] = [n, ad, bot, ht]
with open(OUT, 'w') as f:
    f.write('// Foxi Smash v9.0: sekil bolumlerinin ana oyundaki yeri (uretilir: python3 yapi/pilot/sira.py). Bolum -> [pilot no, ad, bot atisi, hareket]\n')
    f.write('export const SEKIL = ' + json.dumps({str(k): v for k, v in S.items()}, ensure_ascii=False) + ';\n')
print(len(S), 'sekil bolumu,', min(S), '-', max(S))
