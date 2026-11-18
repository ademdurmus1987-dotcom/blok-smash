# Foxi Smash v8.7 (19 Kas 2026, Adem: "donen platform, asansor, saga sola kayan ya da 2'li platform goremedim; birden fazla platform olursa
# 2'ye dusur, yanina daha az sayili platform koy"). Resim/duvar bolumlerine (31-108) hareket dagitir: (n - 31) % 6 ->
#   0 sabit, 1 donen, 2 asansor, 3 kayan, 4 iki platform (yanda kucuk yapi), 5 sabit.
S = 1.55; GX = 1.004; GY = 0.003
DONGU = [None, 'don', 'asansor', 'kay', 'iki', None]
KUCUK = [  # ikinci platformdaki kucuk yapi (alttan uste, 2 genis, 3 sira derinlik)
    [['ksSandik', 'ksSandik'], ['oyK', 'oyB'], ['ksTNT', 'ksYildiz']],
    [['ksTas2'], ['oyM', 'oyS'], ['ksSandikM', 'ksSandikM']],
    [['ksFici', 'ksFici'], ['ksSandik', 'ksSandik'], ['oyY', 'oyN']],
]
GEN = {'ksTas2': 2}
def ekle(n, b):
    tip = DONGU[(n - 31) % 6]
    if tip in ('don', 'asansor', 'kay'):
        b['hareket'] = {'don': {'tip': 'don', 'w': 0.35}, 'asansor': {'tip': 'asansor', 'a': 1.4, 'h': 0.85}, 'kay': {'tip': 'kay', 'a': 1.8, 'h': 0.7}}[tip]
    elif tip == 'iki':
        k0 = b['ada'][0]['katlar'][0]; r2 = 1 * S + 0.25; X = k0['r'] + 1.3 + r2
        b['ada'].append({'id': 'yan', 'x': round(X, 3), 'z': 0, 'katlar': [{'sekil': 'kare', 'r': round(r2, 3), 'rz': k0.get('rz', r2), 'ust': 0, 'kal': 0.75}]})
        yap = KUCUK[(n // 6) % len(KUCUK)]
        for r, sira in enumerate(yap):
            x = -0.5 if len(sira) == 2 else 0
            for t in sira:
                for z in (-1, 0, 1):
                    o = {'t': t, 'x': round(X + x * S * GX, 3), 'z': round(z * S * GX, 3), 'y': round(r * S + 2 * r * GY, 3), 'p': 'yan.0', 'id': 'yan%s%d%d%d' % (t, r, int(x * 2), z)}
                    if t == 'ksTNT': o['patlama'] = {'r': 4.5, 'guc': 13}
                    b['parca'].append(o)
                x += GEN.get(t, 1)
    b['hareketTip'] = tip or 'sabit'
    return b
