# Foxi Smash v9.1 (19 Kas 2026): Claude'un kendi tasarladigi 10 ornek sekil (Adem'in gorsellerinin tarzinda) -> pilot 900-909 (pilot/ornek.json).
# Ana oyuna BAGLI DEGIL (sira.py okumaz); Adem begenirse yeni_kaynak.py'ye tasinir.   python3 yapi/pilot/ornek_kaynak.py
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from duvar_kaynak import bolum
from hareket import ekle
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ornek.json')
T = [
 ('Kalpli Duvar', ['KYKKKAKKKYK', 'KwwwwwwwwwK', 'KwrrwwwrrwK', 'KrpprwrpprK', 'KrpppppppрK'.replace('р', 'r'), 'KwrppppprwK', 'KwwrppprwwK', 'KwwwrprwwwK', 'KwwwwrwwwwK', 'SSSSSSSSSSS'], False),
 ('Gökkuşağı Piramidi', ['A', 'YY', 'vvv', 'bbbb', 'ggggg', 'yyyyyy', 'ooooooo', 'rrrrrrrr', 'SSSSSSSSS'], True),
 ('Yıldız Kapısı', ['.Y........Y.', 'SSS......SSS', 'SdS..YY..SdS', 'SSSKYYYYKSSS', 'SSSKKYYKKSSS', 'SSSSBBBBSSSS', 'SSSSS..SSSSS', 'SSSSS..SSSSS', 'FFSSS..SSSFF'], False),
 ('Kurbağa', ['.www...www.', 'wwPw...wPww', 'gwwwgggwwwg', 'ggggggggggg', 'gKgggggggKg', 'ggKKKKKKKgg', 'ggggggggggg', 'ggggggggggg', 'IIIIIIIIIII'], False),
 ('Penguen', ['...PPP...', '..PPPPP..', '..wPwPw..', '..wwoww..', '.PwwwwwP.', 'PPwwwwwPP', 'PPwwwwwPP', '.PwwwwwP.', '..oo.oo..', 'IIIIIIIII'], False),
 ('Doğum Günü Pastası', ['A', 'eYe', 'ppppp', 'wYwYwYw', 'ppppppppp', 'wwYwwYwwYww', 'rrrrrrrrrrr', 'LLLLLLLLLLLLL'], True),
 ('Dev Hamburger', ['A', 'ooooo', 'ooooooo', 'ggggggggg', 'yyyyyyyyy', 'CCCCCCCCC', 'rrrrrrrrr', 'ooooooooo', 'LLLLLLLLLLL'], True),
 ('Bacalı Ev', ['....LLL....', '...LLLLL.S.', '..LLLLLLLS.', '.LLLLLLLLL.', 'LLLLLLLLLLL', 'KIIKKKKKIIK', 'KIIKKdKKIIK', 'KKKKKdKKKKK', 'SSSSSSSSSSS'], False),
 ('Basamaklı Tapınak', ['A', 'YY', 'SgS', 'SSgSS', 'KSSgSSK', 'SSSSgSSSS', 'KSSSSgSSSSK', 'SSSSSSgSSSSSS'], True),
 ('Panda', ['PP.......PP', 'PPwwwwwwwPP', '.wwwwwwwww.', 'wPPwwwwwPPw', 'wPPwwwwwPPw', 'wwwwwPwwwww', 'wwwwKKKwwww', '.wwwwwwwww.', 'ggPPPPPPPgg', 'ggPPPPPPPgg'], False),
]
if __name__ == '__main__':
    TUM = {}
    for i, (ad, G, ort) in enumerate(T):
        if not ort: assert len(set(map(len, G))) == 1, (ad, [len(r) for r in G])
        n = 900 + i; b = bolum(ad, G, top=60, ortala=ort); b['kaynak'] = 'claude'; b['top'] = round(len(b['parca']) / 3 / 2.3 * 1.15 + 2); TUM[n] = b
    V = {'surum': 1, 'sira': sorted(TUM), 'bolumler': TUM}
    for _n, _b in V['bolumler'].items(): ekle(int(_n), _b)
    json.dump(V, open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
    for k, b in TUM.items(): print(k, b['ad'], len(b['parca']), 'parca, dolgu', b['dolgu'], b['hareketTip'])
