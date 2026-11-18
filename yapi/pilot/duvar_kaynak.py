# Foxi Smash v8.6 (18 Kas 2026 gece): Adem'in "Foxi smash gorsel referans" zip'indeki duvar tasarimlari (55+).
# Izgaralar resimden otomatik cikarildi (yapi/uretici/izgara/) ve elle duzeltildi. Her harf bir hucre; satirlar USTTEN ALTA yazili.
#   python3 yapi/pilot/duvar_kaynak.py  ->  yapi/pilot/duvar.json   (oyun ?pilot=55.. ile acar)
# Harfler: S tas, C tahta sandik, K kirmizi sandik, P mor sandik, T TNT, Y yildiz, I buz, r/w/b/g/p/o/y/v kirmizi/beyaz/mavi/yesil/pembe/turuncu/sari/mor patili kup,
#   A altin patili (tac), F fici, L kalas (tam hucre: 2 kat), l yarim kalas (hucrenin alt yarisi), U mor sutun, G gri sutun, D tahta direk (dik kalas),
#   e/u/m yesil/mavi/mor sise, d koyu ic (arka sirada tas, onde girinti), . bos, R kirmizi fici, B kiris tasi (yan yana B'ler tek parca: 2-4 genis, aciklik ustu)
# ortala=True: her satir kendi ortasina hizalanir (piramit gibi yarim blok kayan sekiller)
# Kurallar: 3 sira derinlik; desteksiz kalan her blogun alti, kendi sirasinda, duz blokla doldurulur (Adem'in kurali); tas bloklar tugla gibi birlestirilir.
import json, os
S = 1.55; GX = 1.004; GY = 0.003
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'duvar.json')
TEK = {'S': 'ksTas', 'C': 'ksSandik', 'K': 'ksSandikK', 'P': 'ksSandikM', 'T': 'ksTNT', 'Y': 'ksYildiz', 'I': 'ksBuz', 'r': 'oyK', 'w': 'oyB', 'b': 'oyM',
       'g': 'oyY', 'p': 'oyN', 'o': 'oyT', 'y': 'oyS', 'v': 'oyP', 'A': 'oyA', 'F': 'ksFici', 'e': 'ksSiseY', 'u': 'ksSiseB', 'm': 'ksSiseM', 'R': 'ksFiciK'}
GEN = {'ksTas2': 2, 'ksTas3': 3, 'ksTas4': 4, 'ksKalas2': 2, 'ksKalas3': 3, 'ksKemer': 3, 'ksBuz3': 3}
BOY = {'ksKalas1': 0.5, 'ksKalas2': 0.5, 'ksKalas3': 0.5, 'ksDirek': 2, 'ksSutun': 2, 'ksMorSutun': 2}
TAS = {'km': 0.35, 'kir': 4}
DOLGU = {'oyK': 'oyK', 'oyB': 'oyB', 'oyM': 'oyM', 'oyY': 'oyY', 'oyN': 'oyN', 'oyT': 'oyT', 'oyS': 'oyS', 'oyP': 'oyP'}

def parcalar(G, ortala=False):
    """izgara -> [(tur, x_merkez, y_alt, z_listesi)] (blok birimi)"""
    G = G[::-1]; R = len(G); K = max(len(r) for r in G)
    if ortala: G = [("." * ((K - len(r)) // 2) + r).ljust(K, ".") if (K - len(r)) % 2 == 0 else r for r in G]
    kay = [0.0] * R
    if ortala:
        for i in range(R):
            if len(G[i]) < K: kay[i] = (K - len(G[i])) / 2; G[i] = G[i].ljust(K, ".")
    ox = (K - 1) / 2; L = []
    kul = [[False] * K for _ in range(R)]
    for r in range(R):
        c = 0
        while c < K:
            h = G[r][c]
            if kul[r][c]: c += 1; continue
            if h == 'B':   # kiris: tek parca
                n = 1
                while c + n < K and G[r][c + n] == 'B' and not kul[r][c + n] and n < 4: n += 1
                L.append([{1: 'ksTas', 2: 'ksTas2', 3: 'ksTas3', 4: 'ksTas4'}[n], c + (n - 1) / 2 - ox, r, None])
                for i in range(n): kul[r][c + i] = True
                c += n; continue
            if h in 'SLl':   # yatay birlestirme
                n = 1
                while c + n < K and G[r][c + n] == h and not kul[r][c + n]: n += 1
                if h == 'S':
                    par = [3] * (n // 3) + ([2] if n % 3 == 2 else []) + ([1] if n % 3 == 1 else [])
                    if r % 2 and n >= 3: par = par[::-1]
                    adlar = {1: 'ksTas', 2: 'ksTas2', 3: 'ksTas3'}; katlar = [0]
                else:
                    par = [3] * (n // 3) + ([2] if n % 3 == 2 else []) + ([1] if n % 3 == 1 else [])
                    adlar = {1: 'ksKalas1', 2: 'ksKalas2', 3: 'ksKalas3'}; katlar = [0, 0.5] if h == 'L' else [0]
                for ki, k in enumerate(katlar):   # kalas katlarinda ek yerleri kaydirilir (dikey ek hatti duvari ikiye bolmesin)
                    pp = par if (ki + r) % 2 == 0 or h == 'S' else par[::-1]
                    x = c
                    for w in pp: L.append([adlar[w], x + (w - 1) / 2 - ox, r + k, None]); x += w
                for i in range(n): kul[r][c + i] = True
                c += n; continue
            if h in 'UGD':   # dikey: 2 boyluk parca
                if r + 1 < R and G[r + 1][c] == h and not kul[r + 1][c]:
                    L.append([{'U': 'ksMorSutun', 'G': 'ksSutun', 'D': 'ksDirek'}[h], c - ox, r, None]); kul[r][c] = kul[r + 1][c] = True
                else:
                    if h == 'D': L.append(['ksKalas1', c - ox, r, None]); L.append(['ksKalas1', c - ox, r + 0.5, None])
                    else: L.append([{'U': 'oyP', 'G': 'ksTas'}[h], c - ox, r, None])
                    kul[r][c] = True
                c += 1; continue
            if h == 'd': L.append(['ksTas', c - ox, r, (-1,)]); kul[r][c] = True; c += 1; continue
            if h in TEK: L.append([TEK[h], c - ox, r, None])
            kul[r][c] = True; c += 1
    for p in L:
        rr = int(p[2] + 1e-6)
        if 0 <= rr < R: p[1] += kay[rr]
    return L, K

def destekle(L):
    """her z sirasi icin: agirlik merkezi alttaki destegin ustunde olmayan blogun altina dolgu ekle"""
    dolgu = 0
    for z in (-1, 0, 1):
        while True:
            P = [p for p in L if p[3] is None or z in p[3]]
            def kutu(p): w = GEN.get(p[0], 1); return p[1] - w / 2, p[1] + w / 2, p[2], p[2] + BOY.get(p[0], 1)
            eksik = None
            for p in sorted(P, key=lambda p: p[2]):
                if p[2] <= 0: continue
                a = kutu(p); alt = [kutu(q) for q in P if abs(kutu(q)[3] - a[2]) < 0.01 and min(a[1], kutu(q)[1]) - max(a[0], kutu(q)[0]) > 0.05]
                if alt:
                    lo = min(max(a[0], b[0]) for b in alt); hi = max(min(a[1], b[1]) for b in alt)
                    if lo + 0.05 < p[1] < hi - 0.05: continue
                eksik = (p, a); break
            if not eksik: break
            p, a = eksik
            # dolgu: blogun altina, merkezine en yakin tam hucreye, 1 boy (gerekirse bir sonraki turda o da desteklenir)
            yb = a[2] - 1 if a[2] >= 1 else 0
            # aday dolgu hucreleri: blogun altinda, bos olan, agirlik merkezine en yakin 1 genis hucre (izgara hizasi: blogun sol kenarindan)
            aday = [a[0] + 0.5 + i for i in range(int(round(a[1] - a[0])))] or [p[1]]
            def bos(cx): return not any(min(cx + .5, kutu(q)[1]) - max(cx - .5, kutu(q)[0]) > 0.05 and min(a[2], kutu(q)[3]) - max(yb, kutu(q)[2]) > 0.05 for q in P)
            aday = sorted([c for c in aday if bos(c)], key=lambda c: abs(c - p[1]))
            if not aday: raise SystemExit('dolgu yeri yok: %s' % p)
            cx = aday[0]
            if a[2] - yb < 0.99: yb = a[2] - 0.5; t = 'ksKalas1'
            else: t = DOLGU.get(p[0], 'ksTas')
            L.append([t, cx, yb, (z,)]); dolgu += 1
            if dolgu > 400: raise SystemExit('dolgu dongusu')
    return dolgu

def bolum(ad, G, top=40, kam=None, ortala=False):
    L, K = parcalar(G, ortala); d = destekle(L); out = []; n = 0
    for t, x, y, zs in L:
        n += 1
        for z in (zs or (-1, 0, 1)):
            k = round(y * 2)
            o = {'t': t, 'x': round(x * S * GX, 3), 'z': round(z * S * GX, 3), 'y': round(y * S + k * GY, 3), 'p': 'ana.0', 'id': '%s%d%s' % (t, n, 'aob'[z + 1])}
            if t.startswith('ksTas'): o.update(TAS if y >= 3 else {'kir': 4})   # alt 3 sira tas normal agirlikta (hafif tas yuk altinda titriyordu)
            if t.startswith('ksKalas') and y < 3: o['km'] = 2.5
            if t in ('ksFici', 'ksFiciK'): o['kutu'] = 1                         # fici: carpisma kutusu (yan yana silindirler birbirini itiyordu)
            if t == 'ksTNT': o['patlama'] = {'r': 4.5, 'guc': 13}
            out.append(o)
    x0 = min(p['x'] / S / GX - GEN.get(p['t'], 1) / 2 for p in out); x1 = max(p['x'] / S / GX + GEN.get(p['t'], 1) / 2 for p in out)
    r = max(-x0, x1) * S + 0.25
    return {'ad': ad, 'top': top, 'kaide': 'mor', 'kam': kam or {'pitch': 1, 'yaw': 0, 'atis': 0.9, 'genis': 0.95}, 'dolgu': d,
            'ada': [{'id': 'ana', 'x': 0, 'z': 0, 'katlar': [{'sekil': 'kare', 'r': round(r, 3), 'rz': round(1.5 * S + 0.2, 3), 'ust': 0, 'kal': 0.75}]}], 'kopru': [], 'parca': out}

# ---------------- sayfa 1 (1795021698771.jpg): 6 sekil (satirlar ortalanir) ----------------
SAYFA1 = [
 ('Ejderha', ['A', 'PoP', '.g.ogo.g.', 'ggogKgoog', 'gKKKg', 'CCCCC', 'FSSSSSF']),
 ('Zafer Kemeri', ['..YTYT.Y..', 'rrbbrrbbrr', 'LLLLLLLLLL', 'SSSBBBBSSS', 'SBBB..BBBG', 'UU.S..S.UG', 'UU.S..S.UG', 'SSSS..SSSG']),
 ('Tren', ['.lll.GG.', '.DPI.GG.', '.KPIILL.', 'KPKPPCC.', 'FFCCCFFl']),
 ('Sfenks Piramidi', ['ywy', 'yyoy', 'owwo', 'myowoym', 'KwyoywK', 'YKwwwwwwKY', 'mKwCCCCCwKe', 'KSSSSSSSSSK']),
 ('Denizaltı', ['D', 'D', 'LLL', 'yIy', 'ywy', 'bbbbbbbbb', 'PbbPPPbbP', 'FFLLLFF']),
 ('Muhafız Golem', ['A', 'meYem', 'SSSKKKSSS', 'SS.PTP.SS', 'ww.PPP.ww', 'SS.F.F.SS', 'SF.FS']),
]
# ---------------- sayfa 2 (1795021903920.jpg) ----------------
SAYFA2 = [
 ('Mor Sütunlu Kapı', ['YTPP..PPTY', 'KKKKSSKKKK', 'SSSCCCCSSS', 'CCUUSSUUCC', 'CSUSSSSUSC', 'CCSUCCUSCC', 'SSSUPPUSSS', 'SCCCCCCCCS', 'SSSSKPSSKP']),
 ('Buz Gözlü Duvar', ['rwrrwrrwrK', 'PPLLPPLLPP', 'bobbbobbCo', 'bLooboobLb', 'boIIobIIoo', 'oPIIobIIPb', 'bCLLooLLCb', 'FFCCPPCCFF', 'FFFFCCFFFF']),
 ('Taş Yüzlü Kapı', ['YwwKKKKwwY', 'wPPSSSSPPw', 'wPSSSSSSPw', 'wPSdSSdSPw', 'wPSSddSSPw', 'wPUSSSSUPw', 'wPUUUUUUPw', 'wPPSSSSPPw', 'wwwwwwwwww']),
 ('Taçlı Muhafız', ['....AA....', 'YYYmYYmYYY', 'wSKKSSKKSw', 'wSPPSSPPSw', 'wSKPTTPKSw', 'wS.PPPP.Sw', 'SS.KKKK.SS', '...C..C...', 'FFFSSSSFFF', 'FFFCCCCFFF']),
 ('Altın Kuşaklı Duvar', ['LLLeLLeLLL', 'IwyIIIIywI', 'IwyyyyyywI', 'bbCbbbbCbb', 'bCPPPPPPCb', 'bPCPPPPCPb', 'bbCCCCCCbb', 'FDPbbbbPFD', 'FDCLLLLCFD']),
 ('Gri Sütunlu Hazine', ['..G....G..', '.KGKKKKGK.', '.KGKKKKGK.', '.KGPPPPGK.', 'YPGFKKFGPY', 'rKGFFFFGKb', 'YbCCPPCCbY', 'SCSSLLSSCS', 'CCSSCCSSCC']),
]
# ---------------- sayfa 3 (1795021958501.jpg) ----------------
SAYFA3 = [
 ('Mavi Yüzlü Kale', ['YTY.AA.YTY', 'KTYrrrrYTK', 'KCbbbbbbCK', 'KUbdSSdbUK', 'KUbwSSwbUK', 'KSUwbbwUSK', 'KSUwwwwUSK', 'FFFSSSSFFF', 'FFFCCCCFFF']),
 ('Sandık Ev', ['KwFKvwKFwK', 'PFLLPPLLFP', 'FFCCCCCCFF', 'PLCCCCCCLP', 'PCSSSSSSCP', 'KSSCCCCSSK', 'PSSCCCCSSK', 'KSKPSSPKSK', 'SSKPSSPKSS']),
 ('Aslan Yüzü', ['YorKKKKroY', 'CCoyPPyoCC', 'CKywyywyKC', 'CKydyydyKC', 'CwoyyyyowC', 'CwowPPwowC', 'CywoyyowyC', 'CKKCwwCKKC', 'FFFooooFFF']),
 ('TNT Kutusu', ['...G..G...', '.T.G..G.T.', 'CKKGTTGKKC', 'CKdCLLCdKC', 'CKDbbbbDKC', 'CKDbPPbDKC', 'CKdbPPbdKC', 'CKdCLLCdKC', 'SSSSSSSSSS', 'SSSSSSSSSS']),
 ('Taçlı Sütun Salonu', ['LLLeLLeLLL', 'GCKKYYKKCU', 'GCKKddKKCU', 'GCUdAAdUCG', 'GCUYYYYUCG', 'GCUKCCKUCG', 'GCUKKKKUCG', 'SSSSSSSSSS', 'FFSSFFSSFF']),
 ('Buz Çapası', ['CFFPPPPFFC', 'CIIIIIIIIC', 'PIIICCIIIP', 'PbbdbbdbbP', 'CbbKKKKbbC', 'CFKbbbbKFC', 'CFFKbbKCFC', 'FSSSLLSSSF', 'FFLLFFLLFF']),
]
# ---------------- sayfa 4 (1795022041504.jpg; Aslan Yuzu sayfa 3'le ayni -> alinmadi) ----------------
SAYFA4 = [
 ('Taçlı Mor Çerçeve', ['YrYrrrrYrY', 'PPCCCCCCPP', 'PGdKddKdGP', 'PGddAAddGP', 'PGdYYYYdGP', 'PGdKCCKdGP', 'PGdKPPKdGP', 'SSSSSSSSSS', 'FFSSFFSSFF']),
 ('Taş Robot Yüzü', ['YrYYbrYYbY', 'CFdCSSCdFC', 'SwKCddCKwS', 'SSKPddPKSS', 'wGdPTTPdGw', 'SwdKCCKdwS', 'SSdSKKSdSS', 'FdFSPPSFdF', 'FFSSFFSSFF']),
 ('Buz Çerçeve', ['LLLeLLeLLL', 'CPPPPPPPPC', 'CPIIIIIIIC', 'CPwbbbbwPC', 'CPwwbbwwPC', 'CPwbbbbwPC', 'CPbbbbbbPC', 'FLLFFFFLLF', 'FFLLFFLLFF']),
 ('Kemerli Mor Ev', ['YPY.PP.YPY', 'GPPKCCKPPU', 'GPKCCCCKPU', 'GPUCCCCUPG', 'GPUSSSSUPG', 'GPUSCCSUPG', 'GPUFCCFUPG', 'SSSSSSSSSS', 'FFSSFFSSFF']),
 ('Kırmızı Sütunlu Hazine', ['YKKPKKrKKY', 'CKGGddGGKC', 'CKGGddGGKC', 'CKGYrbYGKC', 'CKYrbSrYKC', 'CYrbSSrbYC', 'CbSSSSSSrC', 'SSSSSSSSSS', 'SSSSSSSSSS']),
]
# ---------------- sayfa 5 (1795022117085.jpg; yalniz ilk tasarim yeni, digerleri sayfa 4 ile ayni) ----------------
SAYFA5 = [
 ('Taçlı Kemer Salonu', ['YLYmLLmYLY', 'PPCmLLeCPP', 'PGUCLLCUGP', 'PGUSSSSUGP', 'PGUSddSUGP', 'PGUSddSUGP', 'PGUFAAFUGP', 'SSSSSSSSSS', 'RRSSRRSSRR']),
]
def X(n):   # capraz desen
    L = []
    for i in range(n):
        a = i if i < (n + 1) // 2 else n - 1 - i
        L.append(''.join('C' if c in (a, n - 1 - a) else 'S' for c in range(n)))
    return L
# ---------------- sayfa 6 (1795022268185.jpg) ve 7 (1795022343853.jpg): sandik-tas desenleri ----------------
SAYFA6 = [
 ('Dağınık Sandıklar', ['SSSSSSSSSS', 'SSCSCSCSCS', 'SCSCSCSCSS', 'SSCSSSCSCS', 'SCSSCCSSSS', 'SCSSCCSSCS', 'SSSCSSSCSS', 'SCSSCSCSCS', 'SSCSCCSCSS', 'SSSSSSSSSS']),
 ('Taş Göbek', ['CCCCCCCCCC', 'CCCCSSCCCC', 'CCCSSSSCCC', 'CCSSSSSSCC', 'CSSSSSSSSC', 'CSSSSSSSSC', 'CCSSSSSSCC', 'CCCSSSSCCC', 'CCCCSSCCCC']),
 ('Dikey Şeritler', ['SCSCSSCSCS'] * 10),
 ('Taş Çerçeve', ['SSSSSSSSSS'] + ['SCCCCCCCCS'] * 7),
 ('Büyük X', X(10)),
 ('Yatay Şeritler', ['SSSSSSSSSS', 'CCCCCCCCCC', 'SSSSSSSSSS', 'CCCCCCCCCC', 'SSSSSSSSSS', 'SSSSSSSSSS', 'CCCCCCCCCC', 'SSSSSSSSSS']),
]
SAYFA7 = [
 ('Dama Sandık', ['SSSCSSCS', 'SCSSCSCS', 'CSCSSCSC', 'SCSCCSCS', 'CSCSCSSC', 'SCSSSCSS', 'SSCSCSCS', 'CSSCSCSC']),
 ('Küçük Taş Göbek', ['CCCCCCCC', 'CCCSSCCC', 'CCSSSSCC', 'CSSSSSSC', 'CSSSSSSC', 'CCSSSSCC', 'CCCSSCCC']),
 ('Sütunlu Şeritler', ['SCSCCSCS'] * 3 + ['SCSCSSCS'] + ['SCSCSCCS'] * 4),
 ('Sütunlu Çerçeve', ['SSSSSSSS'] + ['SGCCCCGS'] * 6 + ['SSSSSSSS']),
 ('Kalın X', ['CSSSSSSC', 'CCSSSSCC', 'SCCSSCCS', 'SSCCCCSS', 'SSSCCSSS', 'SSCCCCSS', 'SCCSSCCS', 'CCSSSSCC', 'CSSSSSSC']),
 ('Kalın Şeritler', ['SSSSSSSS', 'CCCCCCCC', 'SSSSSSSS', 'SSSSSSSS', 'CCCCCCCC', 'SSSSSSSS', 'SSSSSSSS']),
]
# ---------------- sayfa 8 (1795022375205.jpg) ----------------
SAYFA8 = [
 ('Buz ve Mor Taç', ['I.I....I.I', 'IPI.PP.IPI', 'IIIPPPPIII', 'PIIPIIPIIP', 'PPIIIIIIPP', 'IIIPPPPIII', 'PIIIPPIIIP', 'SSSSSSSSSS', 'SSSSSSSSSS']),
 ('Fıçı Çerçeveli Bahçe', ['FFFFFFFFFF', 'FgLLggLLgF', 'FggLLLLggF', 'FLLggggLLF', 'FggDggDggF', 'FLLggggLLF', 'FggLLLLggF', 'FggLLLLggF', 'FFFFFFFFFF']),
 ('Yıldız Harfi', ['KKKKKKKKKK', 'GKYYYYYYKG', 'GKYKYYKYKG', 'GKYKKKKYKG', 'GYKYKKYKYG', 'GKKYYYYKKG', 'GKYYKKYYKG', 'GKKGKKGKKG', 'GKKGKKGKKG']),
 ('TNT Sandığı', ['CCCCCCCCCC', 'CKKCKKCKKC', 'CKdCLLCdKC', 'CKDTTTTDKC', 'CKDTTTTDKC', 'CKDTTTTDKC', 'CKdCLLCdKC', 'CLLCCCCLLC', 'CCCCCCCCCC']),
 ('Kırmızı Beyaz Dama', ['wrwrwrwrwr', 'rwrwrwrwrw', 'wrwrwrwrwr', 'rwrwrwrwrw', 'wrwrwrwrwr', 'SSSSSSSSSS', 'SSSSSSSSSS', 'SSSSSSSSSS', 'SSSSSSSSSS']),
 ('Şişe Rafı', ['CCuummuuCC', 'CCCCCCCCCC', 'umuumuuumu', 'CCCuuumCCC', 'CCCCCCCCCC', 'UUCCCCCCUU', 'UUCCCCCCUU', 'UUCUCCUCUU', 'UUCUCCUCUU']),
]
# ---------------- sayfa 9 (1795023241199.jpg) ----------------
SAYFA9 = [
 ('Yıldız Çerçeveli Mavi', ['Y..YYYY..Y', 'YP.bbbb.PY', 'YbbPPPPbbY', 'YbbPbbPbbY', 'YPbbbbbbPY', 'YbbPPPPbbY', 'YbbbPPbbbY', 'SSSSSSSSSS', 'SSSSSSSSSS']),
 ('Fıçı Çerçeveli Sandık', ['FFFFFFFFFF', 'FgLLCCLLgF', 'FggLLLLggF', 'FLLgCCgLLF', 'FCCDCCDCCF', 'FLLgCCgLLF', 'FggLLLLggF', 'FggLLLLggF', 'FFFFFFFFFF']),
 ('Buz Kalesi', ['IIIIIIIIII', 'GKIIIIIIKG', 'GIIKKKKIIG', 'GKIKIIKIKG', 'GIKIIIIKIG', 'GIIIIIIIIG', 'GKIIKKIIKG', 'GKKGKKGKKG', 'GKKGKKGKKG']),
 ('Kırmızı Fıçılı TNT', ['CCCCCCCCCC', 'CKKCKKCKKC', 'CKRCLLCRKC', 'CKDTTTTDKC', 'CKDTTTTDKC', 'CKDTTTTDKC', 'RKRCLLCRKR', 'RLLRRRRLLR', 'RRRRRRRRRR']),
 ('Mor Kalp', ['wrwrwwrwrw', 'rwrwwrwrwr', 'wrwPPPrwrw', 'rwPPPPPrwr', 'wrwPPPPwrw', 'rwPSSSSPwr', 'PPSSSSSSPP', 'PSSSSSSSSP', 'SSSSSSSSSS']),
 ('Fıçı Mahzeni', ['CCuummuuCC', 'CCCCCCCCCC', 'umuumuuumu', 'CCCumumCCC', 'CCCCCCCCCC', 'UUFFFFFFUU', 'UUFFFFFFUU', 'UUFUFFFUFU', 'UUFUFFFUFU']),
]
# ---------------- sayfa 10 (1795023284919.jpg) ----------------
SAYFA10 = [
 ('Pembe Buz', ['I..IIII..I', 'Ip.IIII.pI', 'IIICCCCIII', 'IIIIppIIII', 'IIppIIppII', 'IIpIppIpII', 'IpIIIIIIpI', 'SCCCCCCCCS', 'SSSSCCSSSS']),
 ('Kırmızı Fıçı Kalesi', ['RRRRRRRRRR', 'RKKCKKCKKR', 'RKRCLLCRKR', 'RKDTTTTDKR', 'RKDTTTTDKR', 'RKDTTTTDKR', 'RKRCLLCRKR', 'RLLRRRRLLR', 'RRRRRRRRRR']),
 ('Yeşil Yıldız Kapısı', ['YYYYYYYYYY', 'UYggggggYU', 'UYggYYggYU', 'GYggYYggYG', 'GYgYYYYgYG', 'UYggYYggYU', 'UUYggggYUU', 'GUGUYYUGUG', 'GUGUGGUGUG']),
 ('Mor Beyaz Desen', ['PPwPwwPwPP', 'PwwPPPPwwP', 'PwPwwwwPwP', 'PwPPwwPPwP', 'PwwPPPPwwP', 'FwPSSSSPwF', 'FFSSSSSSFF', 'FSSFFFFSSF', 'SSSSSSSSSS']),
 ('Yeşil Sandık Çerçeve', ['gggggggggg', 'gYYYYYYYYg', 'gYgCCCCgYg', 'gYCgCCgCYg', 'gYgCCCCgYg', 'gYgCLLCgYg', 'gCCLLLLCCg', 'CLLLLLLLLC', 'LLLLLLLLLL']),
 ('Kırmızı Şişe Rafı', ['CCuummuuCC', 'CCCCCCCCCC', 'umuumuuumu', 'CCCeuumCCC', 'KKKKKKKKKK', 'GGKKGGKKGG', 'GGKKGGKKGG', 'GKGGKKKGKG', 'GKGGKKKGKG']),
]
# top sayisi: 19 Kas 2026 bot testi (tohum 12345) atis x1.15 + 2
TOP = {"55": 47, "56": 57, "57": 51, "58": 68, "59": 53, "60": 61, "61": 58, "62": 89, "63": 69, "64": 61, "65": 71, "66": 74, "67": 58, "68": 103, "69": 71, "70": 73, "71": 47, "72": 65, "73": 59, "74": 71, "75": 65, "76": 75, "77": 66, "78": 83, "79": 68, "80": 62, "81": 68, "82": 77, "83": 67, "84": 47, "85": 76, "86": 43, "87": 63, "88": 50, "89": 45, "90": 59, "91": 63, "92": 54, "93": 77, "94": 39, "95": 67, "96": 62, "97": 84, "98": 53, "99": 71, "100": 30, "101": 59, "102": 59, "103": 65, "104": 37, "105": 88, "106": 57, "107": 47, "108": 55}
TUM = {}; n = 55; SAYFA = {}
for sno, liste in ((1, SAYFA1), (2, SAYFA2), (3, SAYFA3), (4, SAYFA4), (5, SAYFA5), (6, SAYFA6), (7, SAYFA7), (8, SAYFA8), (9, SAYFA9), (10, SAYFA10)):
    for ad, G in liste:
        TUM[n] = bolum(ad, G, top=TOP.get(str(n), 60), ortala=(sno == 1)); TUM[n]['sayfa'] = sno; n += 1
V = {'surum': 1, 'sira': sorted(TUM), 'bolumler': TUM}
json.dump(V, open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
for k, b in TUM.items(): print(k, b['ad'], len(b['parca']), 'parca, dolgu', b['dolgu'])
print('dosya', os.path.getsize(OUT) // 1024, 'KB')
