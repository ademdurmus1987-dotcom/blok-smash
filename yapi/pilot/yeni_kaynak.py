# Foxi Smash v9.0 (19 Kas 2026): Adem'in ikinci "Foxi smash referans gorseller 2" zip'i (29 resim) -> pilot 109+ (pilot/yeni.json).
# Ayni harfler ve kurallar: duvar_kaynak.py (3 sira derinlik, desteksiz blogun altina dolgu, tas birlesir). Satirlar USTTEN ALTA.
#   python3 yapi/pilot/yeni_kaynak.py  ->  yapi/pilot/yeni.json ; sonra python3 yapi/pilot/sira.py (ana oyundaki yerleri)
# Resimlerdeki koyu lacivert tas -> S (oyunda gri tas), lacivert sandik -> P, yesil sandik -> g (yesil patili kup), kahverengi/turuncu sandik -> C,
# bombali kirmizi kutu -> T (TNT), yildizli kup -> Y, tac/tilki -> A, yatik fici ve tekerlek -> F.
# Ayni tasarimin tekrar eden kopyalari (ornek 1795036406650 = 384272 = 591129) bir kez alindi.
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from duvar_kaynak import bolum
from hareket import ekle
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'yeni.json')
P = True   # piramit: satirlar ortalanir (yarim blok kayar)
T = []     # (ad, izgara, ortala)
def ek(kaynak, liste, ortala=False):
    for x in liste: T.append((x[0], x[1], x[2] if len(x) > 2 else ortala, kaynak))

# ---- 1795036283443: renkli piramitler ----
ek('283443', [
 ('Bombalı Piramit', ['A', 'YY', 'obo', 'uDeDm', 'TLLdLLT', 'CCKSSKKC', 'FFFFSFFFF']),
 ('Tilki Yüzü Piramidi', ['KAK', 'KyyK', 'yooy', 'oSoSo', 'TwwwwwT', 'CCoooCC', 'gSSgSgSSg']),
 ('Buz Piramidi', ['A', 'YY', 'III', 'uLLLe', 'IbbwbbI', 'IIIIIIII', 'IIFFFFFII']),
 ('Kemerli Piramit', ['A', 'YY', 'bwb', 'YwwY', 'CBBBBC', 'ggS..Sgg', 'SSSS..SSSS']),
 ('Yeşil Patili Piramit', ['A', 'yy', 'YbbY', 'YbgbY', 'eTgggTe', 'mCCCKCCCm', 'ggSSSSSgg']),
 ('Raflı Fıçı Piramidi', ['A', 'yy', 'ooo', 'mLLLu', 'eKLeLKe', 'CCKKKCC', 'SSFFFFSS']),
], P)
# ---- 1795036303977: piramit cesitleri ----
ek('303977', [
 ('Mavi Patili Piramit', ['A', 'YY', 'bob', 'uouemom', 'TLLLLLT', 'CCLLLCC', 'FFFSSSFFF']),
 ('Kulaklı Tilki Piramidi', ['A', 'KyyK', 'yooy', 'oSoSo', 'TwwwwwT', 'CCoooKK', 'SSSgggSSS']),
 ('Şişeli Buz Piramidi', ['A', 'YY', 'uwu', 'uLLLu', 'bwbbwb', 'IIIIIII', 'SSISSSFFF']),
 ('Yıldızlı Kemer', ['A', 'YY', 'bb', 'CwwC', 'ggYYgg', 'CCBBBBCC', 'SSSS..SSSS']),
 ('Bahçe Piramidi', ['A', 'yy', 'ubgyu', 'YbbbY', 'mTgggTm', 'eCCKCKCCe', 'gggSSSggg']),
 ('Turuncu Raf Piramidi', ['A', 'oo', 'oyo', 'LLLLL', 'mLLeLLu', 'CCKKKCC', 'FFFSSSFFF']),
], P)
# ---- 1795036312245: sade piramitler ----
ek('312245', [
 ('Sarı Basamaklar', ['A', 'yy', 'yyy', 'oooo', 'ggSSgg', 'SSSSSSS']),
 ('Taş Kapılı Piramit', ['A', 'YY', 'ggg', 'KBBBK', 'KS.SK', 'SKS.SKS']),
 ('Buz Kütük Piramidi', ['A', 'YY', 'mIm', 'mLLLu', 'IIFFII', 'FFFSFFF']),
 ('Kalaslı Yeşil Piramit', ['A', 'bb', 'LLL', 'gwgwg', 'CCCCCC', 'ggggggg', 'SSSSSSSS']),
 ('Sandık Basamakları', ['A', 'yy', 'ggg', 'KgKgK', 'KggggK', 'SSgSgSS']),
 ('Bombalı Kule', ['A', 'YY', 'yyy', 'KKKT', 'ggSgg', 'FFFSFFF']),
], P)
# ---- 1795036322599: lacivert-turuncu ----
ek('322599', [
 ('TNT Basamakları', ['A', 'yg', 'eyyYu', 'oTTCK', 'gggggg', 'SSSSSSS', 'SSSSSSSS']),
 ('İki Kuleli Kale', ['..Y....Y..', '.SSS..SSS.', '..SSygSS..', '.gCygyCCg.', 'oCCSSSSCCo', 'SSSBBBBSSS', 'SSSS..SSSS', 'SSSS..SSSS']),
 ('Kalas Kuşaklı Piramit', ['A', 'YCY', 'oTTo', 'eLLLLu', 'bgoogb', 'SSSgSSS', 'FFFSSFFF']),
 ('Lacivert Basamaklar', ['A', 'YY', 'bbb', 'LLLL', 'ggYgg', 'CCCCCC', 'gSSSSSSg']),
 ('Yeşil Kule', ['Y', 'yyy', 'ggg', 'gyoyg', 'gyg', 'CPCPC', 'PTCTP', 'ggSSSgg']),
 ('Şişeli Sandık Yığını', ['eYYu', 'mYToYe', 'CCCCKC', 'ggggggg', 'FFFSSFFF']),
], P)
# ---- 1795036363409: lacivert-turuncu ----
ek('363409', [
 ('Lacivert Taç Piramidi', ['A', 'ebbe', 'eYCYe', 'bSSSb', 'CCKKKT', 'SSSSSSS']),
 ('Turuncu Kuleli Kale', ['.Y......Y.', 'SSS.bb.SSS', 'YoCCTTCCoY', 'KKSBBBBSKK', 'SSSS..SSSS', 'SSSS..SSSS']),
 ('Şişe Raflı Piramit', ['A', 'YPPY', 'uobou', 'LLLLLL', 'bDuuDb', 'bSSSSSb', 'FFFFFCCC']),
 ('TNT Kapısı', ['YbbY', 'oTCCTo', 'KKBBBBKT', 'SSS..SSS', 'SSS..SSS']),
 ('Turuncu Haç', ['oYo', 'obobo', 'obo', 'KKKPP', 'SKPKS', 'CCSSSCC']),
 ('Tekerlekli Yığın', ['YuY', 'mbbbbm', 'CCKKKT', 'SSSSSSS', 'FFFFFFFF']),
], P)
# ---- 1795036367104 ----
ek('367104', [
 ('Turuncu Tuğla Piramit', ['A', 'oo', 'ooo', 'ooYo', 'bPTPb', 'CCCCCC', 'SSSSSSS', 'SSSSSSSS']),
 ('Lacivert Kale', ['.Y.....Y.', 'SSS...SSS', 'SSS...SSS', 'oTooYooTo', 'KKSBBBSKK', 'SSSS.SSSS', 'SSSS.SSSS']),
 ('Direkli Şişe Kulesi', ['A', 'PC', 'oYo', 'uSuSu', 'LLLLLL', 'S.bb.S', 'SSFFFFSS', 'FFFCCFFF']),
 ('Kemerli TNT Kalesi', ['bYYb', 'ooboo', 'CTCCTC', 'SBBBBS', 'CCS..SCC', 'SSS..SSS', 'SSSS..SSSS']),
 ('Turuncu Kurt', ['oYo', 'obobo', 'obobo', 'bob', 'CPCPC', 'CPCPCPC', 'SCCCCCS']),
 ('Mavi Şişeli Vagon', ['YuuY', 'bbbbb', 'uCTCTCu', 'CCCCCCC', 'SSSSSSS', 'FFFFFFFF']),
], P)
# ---- 1795036376517 (= 537414): lacivert-turuncu; 544711 = 363409 ----
ek('376517', [
 ('Lacivert Taçlı Piramit', ['A', 'YC', 'YPbY', 'PbCPP', 'oooKKo', 'SSSSSSSS']),
 ('Mazgallı Kale', ['.Y......Y.', 'SSS....SSS', 'oooooooooo', 'KTSBBBBSTK', 'KKSS..SSKK', 'SSSS..SSSS']),
 ('Şişeli Raf Kulesi', ['A', 'YY', 'uooou', 'LLLLLL', 'ubbbm', 'SSSSS', 'CFFFFFC']),
 ('Küçük TNT Kapısı', ['YY', 'bbb', 'ToooT', 'CBBBBC', 'SS..SS', 'SSS..SSS']),
 ('Lacivert Kuleli Haç', ['SYS', 'ooo', 'obSbo', 'oSo', 'PPoPP', 'KKPKK', 'CSSSSSC']),
 ('Sandık Arabası', ['YY', 'mbbbm', 'bKCKb', 'CCCCCT', 'CCCCCC', 'FFFFSFFF']),
], P)
# ---- 1795036384272 (= 406650 = 591129) ----
ek('384272', [
 ('Mor Kemerli Kale', ['A', 'ww', 'mPPe', 'YbbbY', 'mPKKKKPe', 'SSBBBBSS', 'CKS..SKC', 'SCS..SCS', 'SSSS..SSSS']),
 ('Hazine Vagonu', ['.Ym...Yu.', 'LLIIwIILL', 'LIIIwIIIL', 'vvvvbbbIv', 'CCKKKPSCC', 'CCCKKKTTC', 'LLLLLLLLL', 'RFFRFFRFR']),
 ('Buz Sarayı Kapısı', ['A', 'YY', 'bwwb', 'IIII', 'b.CPPC.b', 'bbIIIIbb', 'IIPIIIPII', 'IIIIIIIIII', 'SSSSSSSSSS']),
 ('Pagoda', ['A', 'LL', 'LLLLLL', 'mmmm', 'rrrr', 'LLLLLLLL', 'YooYoY', 'LLLLLLLLLL', 'KKKPPPK', 'CCCCCCCC', 'SSSSSSSSSS']),
 ('Kedi Yüzü', ['.Y.....Y.', '.K..A..K.', '.ooooooo.', '.vwSoSwv.', '.owovowo.', '.ooooooo.', '.TCPPKCT.', '.KKPKPKK.', 'CSSSSSCCC']),
 ('Çatılı Buz Kulesi', ['LLL', 'LLLLL', 'mmeu', 'YYYY', 'IIIII', 'bbbbbb', 'CCPPCTT', 'SSSSSSSS', 'SSSSSSSSSS']),
], P)
# ---- 1795036391432 (= 410889) ----
ek('391432', [
 ('Renkli Patili Piramit', ['A', 'S', 'eYYu', 'ewwwwu', 'bpbbvT', 'KPKKKPCC', 'SSSSSSSSSS']),
 ('Gri Kale', ['..Y....Y..', '..SSSSSS..', '..SbbvSS..', '..KKTKPS..', 'SSSSSSSSSS', 'SSSBBBBSSS', 'SSSS..SSSS', 'SSSS..SSSS']),
 ('Yolcu Vagonu', ['uYYYYYe', 'LLIpbIILL', 'ppIIIIIbv', 'CKKKKKKPC', 'CCCLLLCCC', 'RFFRFFRFR']),
 ('Ahşap Ev', ['Y', 'moooe', 'LKKKL', 'LLLLLLL', 'LLLLLLLLL', 'CCPTCPC', 'CPCCKTCe', 'SSSSSSSCC']),
 ('Patili Robot', ['A', 'www', 'wYwYw', 'bvvKTvb', 'LKKTKKKL', 'LCBBBBCL', 'CC..CC', 'SS..SS']),
 ('Kamyon', ['.....CPCme', '..bwbCKKTT', 'bbbbbCCPCC', 'YLLLLLSSSS', 'RFRFRFRFRS']),
], P)
# ---- 1795036614799: (yel degirmeni alinmadi: capraz kanatlar havada kalir; 43 Yel Degirmeni zaten var) ----
ek('614799', [
 ('Buharlı Tren', ['.I.....Y...', '.G..eu.LLLL', '.G.....K..K', 'bbvTPPCCKKC', 'vbvTPCCCKKC', 'LLLLLLLLLLL', 'FRFRFRFRFRF']),
 ('Baykuş', ['Y........Y', 'KK.LLLL.KK', 'oYYLCCLYYo', 'oYYoCCoYYo', 'CoooKKoooC', 'CvwwvwwwvC', 'KvwvwwvwvK', '.CwwwwwwC.', '..SCSSCS..']),
 ('Taş Kalpli Piramit', ['A', 'ryr', 'YCbCY', 'mboooe', 'mwSSSwe', 'KvSSSvK', 'KKCSSSCKK', 'SSSSSSSSSS']),
 ('Pencereli Kale', ['.Y.......Y.', 'SSS.....SSS', 'SdS.b.b.SdS', 'SSSKTTTKSSS', 'KKSSSSSSSKK', 'SSSSBBBSSSS', 'SSSSS.SSSSS', 'SSSSS.SSSSS']),
 ('Taş Fil', ['......Y...', '.....LLLL.', '.....DemD.', 'SSS..CKKC.', 'SdSSvbvbvS', 'SSSSbvbvbS', 'S.SSSSSSSS', 'S..SS..SS.', '...SS..SS.']),
], P)
# ---- 1795036621718 (= 695710) ----
ek('621718', [
 ('Direkli Gemi', ['.......Y....', '..LLL.LLL...', '...D...D....', '...D...D....', 'Y..D...D..Y.', 'KTmD.eeDuTLL', 'CCKLLLLLKCCL', 'SRFRFRFRFRS.']),
 ('Mor Bayraklı Kale', ['S.S..A..S.S', 'SSS.YYY.SSS', 'SSS.rbv.SSS', 'SSSPKTKPSSS', 'PKSSSSSSSKP', 'SSSSBBBSSSS', 'SSSSS.SSSSS', 'SSSSS.SSSSS']),
 ('Beyaz Pencereli Ev', ['....Y....', '..wwwww..', '.wwwwwww.', '.BBBBBBB.', '.S.SSS.S.', '.wwwwwww.', 'KwwwwwwwK', 'SwSwSwSwS']),
 ('Buz Deniz Feneri', ['A', 'rrr', 'III', 'III', 'rwr', 'rwrwr', 'YBBBY', 'CCS.SCC', 'SSSS.SSSS']),
 ('Turuncu Tilki', ['Y........Y', 'Ko......oK', 'oCooooooCo', '.oooooooo.', 'ooCvoovCoo', 'wwoCooCoww', '.wwovvoww.', '..wwooww..']),
 ('Taş Köprü Kapısı', ['...IYYI...', 'meYKTTKYem', 'LLLLLLLLLL', 'SSSSSSSSSS', 'SSSBBBBSSS', 'SSSS..SSSS', 'SSSS..SSSS', 'SSSS..SSSS']),
], P)
# ---- 1795036717017 (helikopter, balik, kamyon alinmadi: havada kalan kuyruk/pervane; Kamyon 162'de var) ----
ek('717017', [
 ('Kollu Robot', ['....A....', '...www...', '..wYwYw..', '...www...', 'CLKKKKKLC', 'C.TobKT.C', 'C.KvovK.C', 'S.KvKvK.S', '...D.D...', '..SS.SS..']),
 ('Hazine Sandığı', ['.um.A..em.', 'IPPPLLLLPI', 'ILLLLLLLLI', 'YYYYYYYYYY', 'RPRPPRPRPR', 'RCRCCRCCRR', 'RCRCCRCCRR']),
 ('Saat Kulesi', ['A', 'LLL', 'mDYDe', 'LLLLL', 'YwwwY', 'YwYwY', 'YwwwY', 'uvrvrvm', 'mKBBBKe', 'CKS.SKC', 'SSSS.SSSS']),
], P)
# ---- 1795036814975 (gemi, fener, tilki, kopru digerlerine cok benziyor: alinmadi) ----
ek('814975', [
 ('Renkli Avlulu Kale', ['S.S..rr..S.S', 'SSS.YvbY.SSS', 'SdSrvbTbrSdS', 'SSSKTTPTKSSS', 'SSSPSSSSPSSS', 'SSSPBBBBPSSS', 'SSSSS..SSSSS', 'SSSSS..SSSSS']),
 ('Patili Kuru Kafa', ['...wwwww...', '..wwwwwww..', '.wdddwdddw.', '.wddwwwddw.', '.wwwwdwwww.', '..SwwwwwS..', 'K.SdSdSdS.P', 'KTSSdSdSSTP']),
], P)
# ---- 1795036775708: dolu duvarlar ----
ek('775708', [
 ('Buz Kalpli Kapı', ['..CC..CC..', '.KbbbIIbK.', '.CbbbbIII.', '..bIbbIb..', 'uK.IbbI.Ku', 'KCC.bb.CCK', 'KCCBBBBCCK', 'SuSS..SSuS', 'SFSS..SSFS']),
 ('Mor Sütunlu Tapınak', ['YrYmLLmYCY', 'PPCmLLeCPP', 'PGUCLLCUGP', 'PGUSBBSUGP', 'PGUS..SUGP', 'PGUF..FUGP', 'SSSSSSSSSS', 'FFSSFFSSFF']),
 ('Kırmızı Pati Mozaiği', ['YrKKuuKeoY', 'CKTTTTTTKC', 'CCCCCCCCCC', 'CCdKdCKrKC', 'CorrrrCdKC', 'CCrrCrKdrC', 'CKCrdKrKdC', 'CKCSCCCKKC', 'FFCoCooKFF']),
 ('Yeşil Bahçe Duvarı', ['CCCumuuCCC', 'CKuuCdduKC', 'CgggLLCugC', 'CCgggggggC', 'CgCggggggC', 'CgggggggCC', 'CCgggggggC', 'FuuFFFFFuF', 'FFFFFFFFFF']),
 ('Buz Taçlı Salon', ['wrwrwrwrw', 'rwrwrwrwr', 'PGUIAIUGP', 'PGUIPIUGP', 'PGUIPIUGP', 'SGUIIIUGS', 'PSSSSSSSP', 'PSSSSSSSP', 'SSSSSSSSS']),
 ('Şişe Deposu', ['CCuuummeCC', 'CCCCCCCCCC', 'uKuLLCumeu', 'CCCumuuuCC', 'CCCCuCCCCC', 'CCCCCeCCCC', 'CSCCuuCCCC', 'CCCCCCCCCC', 'CCKCCCCKCC', 'CCKCCCCKCC']),
])
# ---- 1795036790627 (TNT kale ve sise sahnesi 972870'te buyuk cozunurlukte; buradan alinmadi) ----
ek('790627', [
 ('Fıçı Oyun Makinesi', ['Y', 'LLLL', 'FLLLLF', 'FdddYF', 'FdYddF', 'FYdYdF', 'FLLLLF', 'YYYYYF', 'FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFFFF'], True),
 ('TNT Feneri', ['A', 'I', 'CCC', 'CCC', 'CCC', 'TTTT', 'TTTT', 'TTTT', 'CCCC', 'RRRRRR', 'RRRRRRR', 'RRRRRRR'], True),
 ('Mancınıklı Kale', ['.....Y.....', '....CLL....', '...LKKKL...', 'USSSSSSSSSU', 'USSSSSSSSSU', 'USSSSSSSSSU', 'USSSSSSSSSU', 'USSSSSSSSSU', 'USSSSSSSSSU'], False),
 ('Dev Pati Mozaiği', ['bIbwbbwbIb', 'IbrrwwrrbI', 'brrrwwrrrb', 'wgrrwwrrgw', 'ggwwwwwwgg', 'gwwrrrrwwg', 'gwrrrrrrwg', 'wwrrrrrrww', 'bwwrrrrwwb', 'bbgggggggb'], False),
])
# ---- 1795034972870 (= 799943): buyuk sayfa ----
ek('972870', [
 ('Fıçı Piramidi', ['Y', 'F', 'FF', 'FFF', 'FFFF', 'FFFFF', 'FFFFFF', 'FFFFFFF', 'FFFFFFFF', 'FFFFFFFFF', 'FFFFFFFFFF'], True),
 ('Kubbeli TNT Sarayı', ['.....A.....', '.....I.....', 'F..FCCCF..F', 'FCCFCCCFCCF', 'KLLKoCoKLLK', 'KKKFKKKFKKK', 'SSSoTTToSSS', 'SSSSSLSSSSS', 'UTTUSLSUTTU', 'UTTUTTTUTTU'], False),
 ('Renkli Avlu Kalesi', ['b...IKKI...b', 'wb..IKKb..bw', 'SSS.IKgI.SSS', 'SSS.vKYg.SSS', 'SdS.vggv.SdS', 'SSSvwKKYvSSS', 'SSSSSSSSSSSS', 'SSSSSSSSSSSS', 'SSSSBBBBSSSS', 'SSSSS..SSSSS', 'SSSSS..SSSSS'], False),
 ('Sandık Pati Mozaiği', ['CCCCCCCCCC', 'CKKCKKCKKC', 'CKdCLLCdKC', 'CKLTTTTLKC', 'CKLTTTTLKC', 'CKLTTTTLKC', 'CKdCLLCdKC', 'CKCCCCCCKC', 'CCLLCCLLCC', 'CCCCCCCCCC'], False),
 ('TNT Çarpı Kalesi', ['bbbbbbbbbbb', 'SSSKKIKKwSS', 'SbrYITKYrIS', 'SgIYTKTYIIS', 'SKvKTKTKvKS', 'SKgTKTKTgKS', 'SrwKTKTKwrS', 'SKvKKTKKvKS', 'SKvgmTgmvKS', 'SKvKYgKKvKS', 'SSSSSSSSSSS'], False),
 ('Şişe ve Fıçı Sahnesi', ['CCuummuuCC', 'CCCCCCCCCC', 'uuumuuuumu', 'CCCuuumCCC', 'CCCCCCCCCC', 'UUCCCCCCUU', 'UUCCCCCCUU', 'UFUFFFFUFU', 'UFUFFFFUFU'], False),
])
# ---- 1795034951960 (= 807485): buyuk sayfa ----
ek('951960', [
 ('Taçlı Pencere Duvarı', ['CUUmmmUUUUUU', 'CCCCCCCCCCCC', 'CCCCCCCKKCCC', 'CCCCBBBBCCCC', 'CCCCU..UCCCC', 'CCCCU..UCCCC', 'CCCCU..UCCCC', 'CCCCUA.UCCCC', 'CCCSSSSSSCCC', 'CCSSSSSSSSCC'], False),
 ('TNT Kubbesi', ['KKCKK', 'KbIKCbK', 'KKbCdddCbKK', 'IIbYKTTTKYbI', 'KbYbKTTTKYbK', 'KIYIKCCCKKbK', 'KKbYIKKKIKYK', 'KbYbKKKKKKYK', 'FFFFFFFFFFFF', 'FFFFFFFFFFFF'], True),
 ('Mor Kapılı Avlu', ['YuumYSSYmuuY', 'CCCCUSSUCCCC', 'KuuCUdYUCuuK', 'KYYCPSSPCYYK', 'CKrKBBBBKrKC', 'CrgCU..UCgrC', 'CggCU..UCggC', 'SFFSU..USFFS', 'SSSSU..USSSS'], False),
 ('Pembe Buz Piramidi', ['III', 'IIII', 'IpCCpI', 'IIpppII', 'IpIpIIpI', 'IIppIpppII', 'IpIIpppIIpI', 'SIIIIIIIIIS', 'SSSSSSSSSSSS'], True),
 ('Yıldızlı Yeşil Kule', ['Y', 'gYYYg', 'ggYYYgg', 'ggYYYgg', 'ggYYYgg', 'ggYYYgg', 'FFFFFFFFF', 'FFFFFFFFF'], True),
 ('Şişeli Taş Tapınak', ['uumuummuum', 'SuuuueuuuS', 'SSSSSSSSSS', 'SSSSYYSSSS', 'SUKKggKgUS', 'SUKBBBBgUS', 'SUKS..SgUS', 'SUKS..SgUS', 'SSSS..SSSS'], False),
])
# ---- 1795033946164 (= 1795033929709 dikey hali): buyuk sayfa ----
ek('946164', [
 ('Fıçı Sütunlu Salon', ['bwbbwbbwbwwb', 'wFFFFFFFFFFw', 'bFFFFFFFFFFb', 'wUUUUUUUUUUw', 'bUUUUUUUUUUb', 'wFFFFFFFFFFw', 'bFFFFFFFFFFb', 'bwwbwbwwwbww'], False),
 ('Yıldız Buz Duvarı', ['SISKKSSSKKSS', 'KIYYYIIIYYYK', 'KIIYIYIYIYIK', 'SIYIYIYIYIYS', 'SIIYIYIYIYIS', 'KIYIYIYIYIYK', 'KIYYCCCCYYSK', 'KISSKKKKKSSK'], False),
 ('Şişe Sandık Duvarı', ['CLyyLyLyLLy', 'yCCCmmCmCCy', 'LCCmCCCmCmL', 'yCmCCmCCdCy', 'LCdCCmCCCmL', 'ymCdCCmCmCy', 'LCmCCmCCCmL', 'yLLyLyLLLLy'], False),
 ('TNT Kalpli Kale', ['SSSSSSSSSSSS', 'STdppwwppdTS', 'STpppppppppS', 'STwppppppwTS', 'STwwppppwwTS', 'STdwwppwwdTS', 'STwwwppwwwTS', 'STTTwwwwTTTS', 'SSSSSSSSSSSS'], False),
 ('Yeşil Çerçeveli Fıçı Deposu', ['ggwgggggwggg', 'gwKKKKKKKKwg', 'gwKFKKFFFKwg', 'gwKKFFFFFKwg', 'gwKKFKFFFKwg', 'gwKKFFKFFKwg', 'gwKKKKFFFKwg', 'gwKKKFKFFKwg', 'gggwggwggwgg'], False),
 ('Mor Direkli Taş Pano', ['bbSbbbbbSbb', 'USSSSSSSSSU', 'USggSSSggSU', 'bSSgSSSgSSb', 'USSgSSSgSSU', 'USggSSSggSU', 'bSSSSSSSSSb', 'bSbbbbbbbSb'], False),
])
# @@SON@@ (yeni tasarimlar bu satirin ustune)

# top sayisi: bot testi (yay atis, tohum 12345) atis; yoksa parca sayisindan tahmin. TOP: bot atisi x1.15 + 2
BOT = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bot.json'))) if os.path.exists(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bot.json')) else {}
def uret():
    TUM = {}; n = 109; hata = []
    for ad, G, ort, kay in T:
        try:
            b = bolum(ad, G, top=60, ortala=ort)
        except SystemExit as e:
            hata.append((n, ad, str(e))); n += 1; continue
        b['kaynak'] = kay
        bot = BOT.get(str(n))
        if bot: b['bot'] = bot
        b['top'] = round((bot or len(b['parca']) / 3 / 2.3) * 1.15 + 2)
        TUM[n] = b; n += 1
    V = {'surum': 1, 'sira': sorted(TUM), 'bolumler': TUM}
    for _n, _b in V['bolumler'].items(): ekle(int(_n), _b)
    json.dump(V, open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
    for k, b in TUM.items(): print(k, b['ad'], len(b['parca']), 'parca, dolgu', b['dolgu'], b['hareketTip'])
    for h in hata: print('HATA', *h)
    print('dosya', os.path.getsize(OUT) // 1024, 'KB')
if __name__ == '__main__': uret()
