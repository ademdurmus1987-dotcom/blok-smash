# resimdeki dolu duvar tasarimini blok izgarasina cevirir (her hucre: tur harfi)
import sys, json
import numpy as np
from PIL import Image
BG = np.array([221, 218, 213])
def yukle(f): return np.asarray(Image.open(f).convert('RGB')).astype(int)
def tasarimlar(im, R, K):
    H, W, _ = im.shape; out = []
    for r in range(R):
        for c in range(K):
            out.append((int(W * c / K), int(H * r / R), int(W * (c + 1) / K), int(H * (r + 1) / R)))
    return out
def bgmask(a): return (np.abs(a - BG).sum(-1) < 26)
def bgayarla(im):
    global BG; BG = np.median(im[5:40, 5:40].reshape(-1, 3), 0)
def kutu(im, b):
    x0, y0, x1, y1 = b; a = im[y0:y1, x0:x1]; m = ~bgmask(a)
    # platform: altin cubuk (r>200,g 140-200,b<110) en genis satirlar
    gold = (a[..., 0] > 190) & (a[..., 1] > 130) & (a[..., 1] < 210) & (a[..., 2] < 120)
    rows = gold.sum(1); W = a.shape[1]
    cand = [y for y in range(len(rows)) if rows[y] > 0.5 * W]
    py = cand[-1] if cand else a.shape[0]
    while py > 0 and rows[py - 1] > 0.3 * W and (cand[-1] - py) < 30: py -= 1   # altin bandin ustu
    py -= 2
    m[max(0, py - 8):] = False
    cx = np.where(m.sum(0) > 0.06 * py)[0]; cy = np.where(m.sum(1) > 0.06 * (cx.max() - cx.min()))[0]
    return int(x0 + cx.min()), int(y0 + cy.min()), int(x0 + cx.max() + 1), int(y0 + py)
if __name__ == '__main__':
    im = yukle(sys.argv[1]); R, K = int(sys.argv[2]), int(sys.argv[3])
    for b in tasarimlar(im, R, K): print(kutu(im, b))
def periyot(a, eks):
    g = np.abs(np.diff(a.mean(-1), axis=eks)).mean(1 - eks)   # eks=0: satir profili, 1: sutun profili
    g = g - g.mean(); n = len(g); best = None
    for p in range(40, 130):
        if p * 2.5 > n: break
        v = np.dot(g[:-p], g[p:]) / (n - p)
        if best is None or v > best[1]: best = (p, v)
    return best[0]
def izgara(im, b):
    x0, y0, x1, y1 = b; a = im[y0:y1, x0:x1]
    px = periyot(a, 1); py = periyot(a, 0)
    K = max(1, round((x1 - x0) / px)); R = max(1, round((y1 - y0) / py))
    return K, R, (x1 - x0) / K, (y1 - y0) / R
def hucreler(im, b, K, R):
    x0, y0, x1, y1 = b; cw = (x1 - x0) / K; ch = (y1 - y0) / R; L = []
    for r in range(R):
        satir = []
        for c in range(K):
            satir.append(oz(im, b, K, R, r, c))
        L.append(satir)
    return L   # L[satir_alttan][sutun]

PROTO = {  # harf: (ortanca renk)
 'S': (176, 171, 179), 'C': (198, 116, 60), 'K': (198, 42, 42), 'P': (130, 56, 172), 'Y': (240, 166, 38), 'I': (185, 222, 240),
 'r': (222, 55, 62), 'w': (238, 222, 200), 'b': (55, 130, 215), 'g': (70, 165, 60), 'p': (232, 105, 165), 'o': (238, 130, 40),
 'F': (165, 85, 40), 'd': (62, 58, 88)}
def sinifla(c):
    m = np.array(c['med']); r, g, b = m
    if c['yarim']: return 'l'    # alt yarisi kalas, ust yarisi bos
    if c['bg'] > 0.6: return '.'
    if c['kbg'] > 0.3 and b > r and b > g and r > 90 and (m.max() - m.min()) > 40: return 'U'
    if c['kbg'] > 0.3 and (m.max() - m.min()) < 40 and c['gy'] < 6: return 'G'
    if c['kbg'] > 0.35 and c['bg'] > 0.1:   # sise (etrafi bos)
        if r > 200 and g > 150 and b < 110: return 'A'   # tac
        if g > r and g > b: return 'e'
        if b > r: return 'u'
        return 'm'
    if c['gy'] < 3.5 and c['gx'] > 3.5:   # dik sutun / dik kalas / sari kulce
        if r > 200 and b < 110 and g > 150: return 'y'
        if r > 150 and r > b + 60: return 'D'
        return 'U' if (b > r and b > g and (m.max() - m.min()) > 40) else 'G'
    if c['gx'] < 3.5 and c['gy'] > 6 and r > 150 and r > b + 60: return 'L'   # yatay kalas
    if r > 150 and g < 70 and c['krem'] > 0.12: return 'T'
    if c['band'] > 0.15 and r > 140 and r > g > b and g < 120: return 'F'
    if r > 235 and 185 < g < 225 and b < 90: return 'y'   # sari pati
    best = min(PROTO, key=lambda k: np.abs(m - PROTO[k]).sum())
    if best == 'w' and m[2] > 205 and m[0] < 215: return 'I'
    return best
def oz(im, b, K, R, r, c):
    x0, y0, x1, y1 = b; cw = (x1 - x0) / K; ch = (y1 - y0) / R
    xa, ya = int(x0 + c * cw), int(y1 - (r + 1) * ch)
    a = im[ya + int(ch * .12): ya + int(ch * .88), xa + int(cw * .12): xa + int(cw * .88)]
    tam = im[ya: ya + int(ch), xa: xa + int(cw)]
    br = a.mean(-1); sat = a.max(-1) - a.min(-1)
    gy = np.abs(np.diff(br, axis=0)).mean(); gx = np.abs(np.diff(br, axis=1)).mean()
    krem = ((a[..., 0] > 215) & (a[..., 1] > 190) & (a[..., 2] > 140) & (sat > 25) & (sat < 110)).mean()
    gri = ((sat < 25) & (br > 90) & (br < 200)).mean()
    yan = np.concatenate([tam[int(ch * .3):int(ch * .7), :int(cw * .14)], tam[int(ch * .3):int(ch * .7), int(cw * .86):]], 1)
    kbg = bgmask(yan).mean(); ust = bgmask(tam[:int(ch * .2), int(cw * .3):int(cw * .7)]).mean()
    ac = ((a[..., 0] > 170) & (a[..., 2] > 210) & (a[..., 1] > 120)).mean()   # acik mor (X)
    beyaz = ((br > 215) & (sat < 45)).mean()
    tb = tam.mean(-1); ts = tam.max(-1) - tam.min(-1); band = ((ts < 60) & (tb > 40) & (tb < 150)).mean()
    alt = tam[int(ch * .55):, int(cw * .15):int(cw * .85)]; ustY = tam[:int(ch * .4), int(cw * .15):int(cw * .85)]
    yarim = bgmask(ustY).mean() > 0.7 and bgmask(alt).mean() < 0.2
    q = int(min(cw, ch) * .16); kose = np.mean([bgmask(tam[:q, :q]).mean(), bgmask(tam[:q, -q:]).mean(), bgmask(tam[-q:, :q]).mean(), bgmask(tam[-q:, -q:]).mean()])
    return dict(med=np.median(a.reshape(-1, 3), 0).astype(int).tolist(), gy=round(gy, 1), gx=round(gx, 1), krem=round(krem, 2), gri=round(gri, 2), kbg=round(kbg, 2), ust=round(ust, 2), ac=round(ac, 2), beyaz=round(beyaz, 2), kose=round(float(kose), 2), band=round(float(band), 3), yarim=bool(yarim), bg=round(bgmask(a).mean(), 2))

def duzelt(L, G):
    """komsuluk duzeltmesi: sutunun alt/ust ucu (altin baslik) mor sandik sanilmasin"""
    G = [list(x) for x in G]; R = len(G); K = len(G[0])
    for _ in range(2):
        for r in range(R):
            for c in range(K):
                if G[r][c] in 'PS' and L[r][c]['kbg'] > 0.12:
                    for rr in (r - 1, r + 1):
                        if 0 <= rr < R and G[rr][c] in 'UG' and (G[r][c] == 'P') == (G[rr][c] == 'U'): G[r][c] = G[rr][c]
    return [''.join(x) for x in G]
