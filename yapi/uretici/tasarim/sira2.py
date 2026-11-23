# Foxi Smash v12 (23 Kas 2026, Adem: '2000 bolumu ona gore tasarla, ayni gorsel ikinci kez olmasin, oyun monoton gitmesin'):
# 26-2000 arasindaki her bolume bir yapi atar ve yapi/pilot/sira.js yazar.
#   - Adem'in cizimlerinden cikan 176 tasarim yerinde kalir (26, 36, ... 1776: dunyanin 6. bolumu)
#   - ogretici 1-5 ve karisik yapilar 7/13/19/23 yerinde; diger karisik yapilardan her kaliptan en cok 3 tane kalir
#   - her dunyada (10 bolum) 1 kayitli 'oyun duzenekli' bolum (denge, asansor, donen, kopru ...), birbirine benzemeyenlerden
#   - geri kalan her yer yeni tasarim (yuz, cizim, bina, duvar, duzen): her biri bir kez, aileler sirayla, boyut zorluk egrisine gore
#   python sira2.py olcum_klasoru
import json, math, os, sys, glob, random
D = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(D, '..', '..', 'pilot')
random.seed(20261123)
H = {h['n']: h for h in json.load(open(os.path.join(D, 'havuz.json'), encoding='utf-8'))}
OLC = {}
for f in glob.glob(os.path.join(sys.argv[1], 'den_*.json')) + glob.glob(os.path.join(sys.argv[1], 'bot_*.json')):
    for k, v in json.load(open(f)).items():
        o = OLC.setdefault(int(k), {}); o.update({a: b for a, b in v.items() if b is not None})
# --- bot tahmini: olculen orneklerden aile basina dogru (np) ---
olc = [(H[k], v['bot']) for k, v in OLC.items() if k in H and v.get('bot') and v.get('kaz')]
def egri(L):
    xs = [h['np'] for h, b in L]; ys = [b for h, b in L]; n = len(xs)
    if n < 6: return None
    mx, my = sum(xs) / n, sum(ys) / n; a = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / max(1e-6, sum((x - mx) ** 2 for x in xs)); return (a, my - a * mx)
GENEL = egri(olc) or (0.2, 2.0); AE = {}
for a in ('yuz', 'cizim', 'bina', 'duvar', 'duzen'):
    AE[a] = egri([x for x in olc if x[0]['aile'] == a]) or GENEL
def bot(n):
    o = OLC.get(n, {})
    if o.get('bot') and o.get('kaz'): return o['bot']
    a, b = AE[H[n]['aile']]; return max(4, round((a * H[n]['np'] + b) * 1.1, 1))
# --- kullanilabilir yeni tasarimlar ---
iyi = [n for n in H if (n in OLC and not OLC[n].get('hata') and not OLC[n].get('dus') and OLC[n].get('kay', 0) <= max(1, H[n]['np'] * 0.03) and OLC[n].get('en', 0) < 0.6 and OLC[n].get('kaz', True) is not False)]
print('yeni tasarim', len(H), 'kullanilir', len(iyi), 'olculen bot', len(olc), 'egri', {k: (round(v[0], 3), round(v[1], 1)) for k, v in AE.items()})
# --- eski sira ---
s = open(os.path.join(D, 'sira_eski.js'), encoding='utf-8').read(); ESKI = {int(k): v for k, v in json.loads(s[s.index('{'):s.rindex('}') + 1]).items()}
KARMA = json.load(open(os.path.join(P, 'karma.json'), encoding='utf-8'))['bolumler']
S = {}; kalip = {}
for L, v in sorted(ESKI.items()):
    n = v[0]
    if n < 900: S[L] = v; continue                     # Adem'in cizimleri
    if L <= 25: S[L] = v; continue                     # ogretici ve ilk karisik yapilar
    if n >= 3000:
        k = KARMA.get(str(n), {}).get('kalip', 'el'); kalip[k] = kalip.get(k, 0) + 1
        if kalip[k] <= 3: S[L] = v
    elif 960 <= n <= 968: S[L] = v
print('kalan eski', len(S))
# --- kayitli duzenekli bolumler: dunya basina 1 ---
ONC = {'denge': 5, 'asansor': 5, 'donen': 5, 'domino': 5, 'kopru': 4, 'ikiAda': 5, 'gemi': 4, 'magara': 4, 'tnt': 4, 'korsanKale': 3, 'hazine': 3, 'raflar': 3, 'kemerSira': 3, 'merdiven': 2, 'kale': 1, 'piramit': 1, 'inceKule': 1, 'ucKule': 1, 'camKule': 1}
KAY = {}
for f in sorted(glob.glob(os.path.join(P, '..', 'bolumler', 'p*.json'))):
    V = json.load(open(f, encoding='utf-8'))
    for i, b in enumerate(V['b']): KAY[V['ilk'] + i] = b
def oz(c):
    g = {}
    for q in sorted(c, key=lambda q: q[2]):
        if len(q) > 4 and q[4]: continue
        g['%d,%d' % (round(q[0]), int(q[1] + 0.01))] = q[3][:2]
    return g
def benzer(a, b):
    en = 0
    for s_ in (-1, 0, 1):
        ay = o_ = 0
        for k, v in a.items():
            x, y = k.split(','); w = b.get('%d,%s' % (int(x) + s_, y))
            if w: o_ += 1; ay += w == v
        en = max(en, ay / max(1, len(a) + len(b) - o_))
    return en
secilen = []; sonA = []; DUZ = set()
bos_say = sum(1 for L in range(26, 2001) if L not in S) - 197 - len(iyi)   # havuz yetmezse bazi dunyalarda ikinci duzenekli bolum (esit aralikla)
ekW = set(round(2 + (i + 0.5) * 197 / bos_say) for i in range(bos_say)) if bos_say > 0 else set()
for w in [w for w in range(2, 200)] + sorted(ekW):
    L0 = w * 10 + 1; aday = []
    for L in range(L0, L0 + 10):
        if L in S or L in DUZ or L not in KAY or L % 50 in (0, 1): continue
        b = KAY[L]; a = b.get('a', ''); pu = ONC.get(a, 1) - (3 if a in sonA[-4:] else 0) - (20 if a in sonA[-1:] or any(abs(L - q) < 12 and KAY[q].get('a') == a for q in DUZ) else 0) + random.random()
        aday.append((pu, L, a))
    for pu, L, a in sorted(aday, reverse=True):
        o = oz(KAY[L]['c'])
        if any(benzer(o, q) > 0.7 for q in secilen[-120:]): continue
        secilen.append(o); sonA.append(a); DUZ.add(L); break
print('duzenekli bolum', len(DUZ))
# --- yeni tasarimlarin yerlesimi ---
ORAN = {'yuz': 0.27, 'cizim': 0.24, 'bina': 0.26, 'duvar': 0.09, 'duzen': 0.14}
havuz = {a: sorted([n for n in iyi if H[n]['aile'] == a], key=lambda n: H[n]['np']) for a in ORAN}
TES = [1.35, 0.72, 1.05, 0.95, 1.0, 0.92, 1.0, 1.08, 0.95, 1.12]   # L % 10 (0: dunyanin zor sonu)
HAR = ['sabit', 'sabit', 'kay', 'sabit', 'asansor', 'sabit', 'don', 'sabit', 'iki', 'uc', 'sabit', 'asansor', 'sabit', 'kay']
say = {a: 0 for a in ORAN}; son = []; bos = []
for L in range(26, 2001):
    if L in S or L in DUZ: continue
    if not any(havuz.values()): bos.append(L); continue
    hedef = (40 + 85 * (1 - math.exp(-(L - 25) / 520))) * TES[L % 10] * random.uniform(0.85, 1.15)
    top = sum(say.values()) + 1
    fam = sorted([a for a in ORAN if havuz[a] and a not in son[-1:]], key=lambda a: say[a] / top - ORAN[a])
    if not fam: fam = [a for a in ORAN if havuz[a]]
    a = fam[0]; hv = havuz[a]
    # hedef boyuta en yakin, son 40 bolumdeki alt turlerden farkli
    yakin = sorted(hv, key=lambda n: abs(H[n]['np'] - hedef))[:12]; n = next((m for m in yakin if H[m]['alt'] not in [H[q]['alt'] for q in son[-40:] if q in H]), yakin[0])
    hv.remove(n); say[a] += 1; son.append(n)
    ht = HAR[(L * 3 + L // 10) % len(HAR)]
    if ht == 'don' and H[n]['aile'] in ('yuz', 'cizim', 'duvar'): ht = 'kay'
    if ht in ('iki', 'uc') and H[n]['np'] > 120: ht = 'sabit'
    if L < 60 and ht != 'sabit': ht = 'sabit'
    S[L] = [n, H[n]['ad'], bot(n), ht]
# kalan yer (havuz bittiyse): ikinci duzenekli bolum (kayitli uretilmis bolum yerinde kalir)
print('aile', say, 'bos kalan (uretilmis bolum)', len(bos))
# --- hareketi tasarim dosyalarina yaz ---
HT = {v[0]: v[3] for v in S.values() if v[0] >= 4000}
for f in glob.glob(os.path.join(P, 'tasarim', 't*.json')):
    V = json.load(open(f, encoding='utf-8'))
    for k, d in V['tasarim'].items():
        if int(k) in HT: d['h'] = HT[int(k)]
        elif 'h' in d: del d['h']
    json.dump(V, open(f, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
S = dict(sorted(S.items()))
with open(os.path.join(P, 'sira.js'), 'w', encoding='utf-8') as f:
    f.write('// Foxi Smash v12: bolum -> [yapi no, ad, bot atisi, hareket]. Uretilir: python yapi/uretici/tasarim/sira2.py OLCUM (eski uretici: pilot/sira.py)\n')
    f.write('export const SEKIL = ' + json.dumps({str(k): v for k, v in S.items()}, ensure_ascii=False) + ';\n')
yeni = sum(1 for v in S.values() if v[0] >= 4000); print('sekil bolumu', len(S), 'yeni', yeni, 'duzenekli', len(DUZ), 'toplam', len(S) + len(DUZ) + len(bos))
json.dump({'duz': sorted(DUZ), 'bos': bos}, open(os.path.join(D, 'sira_rapor.json'), 'w'))
