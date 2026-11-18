# resim.json kagit ustu denetim: ic ice gecen bloklar ve agirlik merkezi destek disinda kalan bloklar (her z sirasi ayri)
import json, sys, os
S = 1.55; GX = 1.004
GEN = {'ksTas2': 2, 'ksTas3': 3, 'ksTas4': 4, 'ksBuz3': 3, 'ksKalas2': 2, 'ksKalas3': 3, 'ksKemer': 3}
BOY = {'ksKalas1': 0.5, 'ksKalas2': 0.5, 'ksKalas3': 0.5, 'ksDirek': 2, 'ksSutun': 2, 'ksMorSutun': 2, 'ksKemer': 2}
V = json.load(open(os.path.join(os.path.dirname(__file__), '..', 'pilot', 'resim.json')))
liste = [int(x) for x in sys.argv[1].split(',')] if len(sys.argv) > 1 else [int(k) for k in V['bolumler']]
for n in liste:
    b = V['bolumler'][str(n)]; L = []
    for p in b['parca']:
        w = GEN.get(p['t'], 1); h = BOY.get(p['t'], 1); x = p['x'] / S / GX; y = round(p['y'] / S * 2) / 2; z = round(p['z'] / S / GX)
        L.append((p['id'], p['t'], x - w / 2, x + w / 2, y, y + h, z, x))
    sorun = []
    for i, a in enumerate(L):
        for c in L[i + 1:]:
            if a[6] == c[6] and min(a[3], c[3]) - max(a[2], c[2]) > 0.05 and min(a[5], c[5]) - max(a[4], c[4]) > 0.05: sorun.append('ic ice: %s %s' % (a[0], c[0]))
        if a[4] > 0:
            alt = [c for c in L if c[6] == a[6] and abs(c[5] - a[4]) < 0.01 and min(a[3], c[3]) - max(a[2], c[2]) > 0.05]
            if not alt: sorun.append('HAVADA: %s y=%.1f x=%.2f' % (a[0], a[4], a[7])); continue
            lo = min(max(a[2], c[2]) for c in alt); hi = max(min(a[3], c[3]) for c in alt)
            if not (lo + 0.05 < a[7] < hi - 0.05): sorun.append('KENARDA: %s x=%.2f destek %.2f..%.2f' % (a[0], a[7], lo, hi))
    print(n, b['ad'], 'sorun yok' if not sorun else sorun[:8])
