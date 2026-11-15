# Balance Check: Foxi Smash bölümleri (top, zorluk, altın)

### Data Sources Analyzed
- yapi/bolumler/p00.json, p06.json, p07.json (26-100, 700-800: kayıtlı bölümler)
- yapi/oyun.js `win()` (altın: 10 + yıldız×10 + kalan top×5 (en çok 60), zor bölüm +20), `shotsFor()` (1-25)
- yapi/uretici/arketip.js `zorluk()`, yapi/uretici/dogrula.js `topHesap()`
- Tasarım hedefleri: GDD yok; hedefler bu işin şartnamesinden ve eski dengeden alındı: top başına 1,9-3,5 blok (elle yapılmış 1-25 ölçümüne göre), top ≥ botun yuzde 70 kadari (bot kusursuz nişan alır ama yapıyı bilmez), ilk kazanç 40-120 altın (+20 zor).

### Health Summary: CONCERNS

| Aralık | Bölüm | Ort. top | Blok/top | Zor bölüm blok/top | Normal blok/top | Ort. ilk altın | Ort. yıldız (tahmini) |
|---|---|---|---|---|---|---|---|
| 1-100 | 100 | 18.4 | 2.28 | 2.60 | 2.23 | 67 | 2.33 |
| 700-800 | 101 | 18.8 | 2.22 | 2.43 | 2.20 | 67 | 2.29 |

### Outliers Detected

| Bölüm | Değer | Beklenen | Gerçek | Not |
|---|---|---|---|---|
| 31 | blok/top | 1.9-3.5 | 1.80 | fazla top (kolay) |
| 41 | blok/top | 1.9-3.5 | 1.74 | fazla top (kolay) |
| 42 | blok/top | 1.9-3.5 | 1.79 | fazla top (kolay) |
| 51 | blok/top | 1.9-3.5 | 1.85 | fazla top (kolay) |
| 53 | blok/top | 1.9-3.5 | 1.88 | fazla top (kolay) |
| 68 | blok/top | 1.9-3.5 | 1.88 | fazla top (kolay) |
| 71 | blok/top | 1.9-3.5 | 1.46 | fazla top (kolay) |
| 72 | blok/top | 1.9-3.5 | 1.86 | fazla top (kolay) |
| 74 | blok/top | 1.9-3.5 | 1.78 | fazla top (kolay) |
| 86 | blok/top | 1.9-3.5 | 1.76 | fazla top (kolay) |
| 92 | blok/top | 1.9-3.5 | 1.86 | fazla top (kolay) |
| 701 | blok/top | 1.9-3.5 | 1.79 | fazla top (kolay) |
| 724 | ilk kazanç altını | 40-120 | 30 |  |
| 727 | blok/top | 1.9-3.5 | 1.78 | fazla top (kolay) |
| 731 | blok/top | 1.9-3.5 | 1.87 | fazla top (kolay) |
| 741 | blok/top | 1.9-3.5 | 1.84 | fazla top (kolay) |
| 751 | blok/top | 1.9-3.5 | 1.56 | fazla top (kolay) |
| 757 | ilk kazanç altını | 40-120 | 30 |  |
| 761 | blok/top | 1.9-3.5 | 1.82 | fazla top (kolay) |
| 765 | blok/top | 1.9-3.5 | 1.88 | fazla top (kolay) |
| 769 | ilk kazanç altını | 40-120 | 30 |  |
| 771 | blok/top | 1.9-3.5 | 1.82 | fazla top (kolay) |
| 781 | blok/top | 1.9-3.5 | 1.80 | fazla top (kolay) |
| 791 | blok/top | 1.9-3.5 | 1.76 | fazla top (kolay) |
| 792 | blok/top | 1.9-3.5 | 1.88 | fazla top (kolay) |
| 792 | ilk kazanç altını | 40-120 | 30 |  |
| 794 | blok/top | 1.9-3.5 | 1.88 | fazla top (kolay) |
| 794 | ilk kazanç altını | 40-120 | 30 |  |
| 796 | ilk kazanç altını | 40-120 | 30 |  |
| 800 | blok/top | 1.9-3.5 | 1.83 | fazla top (kolay) |


### Progression Analysis (10 bölümlük döngü)

| Bölüm | Arketip | Blok | Zorluk | Top | Bot | Blok/top | İlk altın |
|---|---|---|---|---|---|---|---|
| 26 | kale | 33 | 0.36 | 17 | 18 | 1.94 | 60 |
| 27 | raflar | 38 | 0.38 | 18 | 21 | 2.11 | 55 |
| 28 | camKule | 43 | 0.39 | 18 | 5 | 2.39 | 60 |
| 29 | ucKule | 26 | 0.41 | 12 | 8 | 2.17 | 65 |
| 30 (zor) | merdiven | 41 | 0.57 | 17 | 24 | 2.41 | 50 |
| 31 | domino | 27 | 0.17 | 15 | 11 | 1.80 | 75 |
| 32 | kale | 70 | 0.31 | 30 | 28 | 2.33 | 85 |
| 33 | raflar | 39 | 0.32 | 19 | 17 | 2.05 | 80 |
| 34 | ucKule | 48 | 0.34 | 20 | 13 | 2.40 | 65 |
| 35 | merdiven | 66 | 0.35 | 28 | 22 | 2.36 | 80 |
| 36 | piramit | 45 | 0.37 | 21 | 17 | 2.14 | 85 |
| 37 | inceKule | 53 | 0.38 | 23 | 17 | 2.30 | 75 |
| 38 | korsanKale | 38 | 0.40 | 17 | 15 | 2.24 | 75 |
| 39 | camKule | 43 | 0.41 | 19 | 7 | 2.26 | 65 |
| 40 (zor) | ucKule | 30 | 0.57 | 11 | 9 | 2.73 | 65 |
| 41 | asansor | 40 | 0.17 | 23 | 6 | 1.74 | 100 |
| 42 | inceKule | 25 | 0.30 | 14 | 5 | 1.79 | 75 |
| 43 | kopru | 42 | 0.32 | 21 | 14 | 2.00 | 85 |
| 44 | donen | 46 | 0.33 | 24 | 12 | 1.92 | 95 |
| 45 | domino | 25 | 0.34 | 13 | 10 | 1.92 | 70 |
| 46 | ucKule | 24 | 0.36 | 12 | 13 | 2.00 | 50 |
| 47 | raflar | 31 | 0.37 | 15 | 11 | 2.07 | 70 |
| 48 | merdiven | 42 | 0.38 | 19 | 13 | 2.21 | 65 |
| 49 | kale | 40 | 0.40 | 21 | 13 | 1.90 | 90 |
| 50 (zor) | kopru | 30 | 0.56 | 13 | 6 | 2.31 | 75 |
| 51 | inceKule | 37 | 0.16 | 20 | 4 | 1.85 | 90 |
| 52 | piramit | 50 | 0.29 | 21 | 14 | 2.38 | 65 |
| 53 | asansor | 30 | 0.30 | 16 | 8 | 1.88 | 80 |
| 54 | raflar | 47 | 0.32 | 22 | 28 | 2.14 | 55 |
| 55 | denge | 35 | 0.33 | 17 | 9 | 2.06 | 75 |
| 770 (zor) | asansor | 30 | 0.82 | 14 | 9 | 2.14 | 90 |
| 771 | raflar | 31 | 0.43 | 17 | 17 | 1.82 | 60 |
| 772 | gemi | 36 | 0.57 | 16 | 18 | 2.25 | 55 |
| 773 | magara | 41 | 0.59 | 18 | 20 | 2.28 | 60 |
| 774 | korsanKale | 57 | 0.61 | 24 | 22 | 2.38 | 75 |
| 775 | kopru | 51 | 0.63 | 22 | 13 | 2.32 | 70 |
| 776 | asansor | 32 | 0.65 | 15 | 6 | 2.13 | 70 |
| 777 | ucKule | 34 | 0.67 | 15 | 14 | 2.27 | 70 |
| 778 | merdiven | 68 | 0.69 | 29 | 15 | 2.34 | 85 |
| 779 | hazine | 35 | 0.72 | 16 | 21 | 2.19 | 45 |
| 780 (zor) | donen | 46 | 0.88 | 18 | 14 | 2.56 | 75 |
| 781 | domino | 27 | 0.49 | 15 | 14 | 1.80 | 70 |
| 782 | raflar | 50 | 0.63 | 22 | 24 | 2.27 | 65 |
| 783 | kale | 33 | 0.65 | 15 | 12 | 2.20 | 70 |
| 784 | denge | 39 | 0.67 | 18 | 11 | 2.17 | 65 |
| 785 | magara | 41 | 0.69 | 17 | 20 | 2.41 | 55 |
| 786 | kemerSira | 49 | 0.71 | 22 | 28 | 2.23 | 55 |
| 787 | tnt | 35 | 0.72 | 16 | 18 | 2.19 | 55 |
| 788 | ucKule | 44 | 0.74 | 17 | 13 | 2.59 | 55 |
| 789 | asansor | 40 | 0.76 | 19 | 20 | 2.11 | 65 |
| 790 (zor) | inceKule | 57 | 0.93 | 23 | 7 | 2.48 | 90 |
| 791 | donen | 37 | 0.53 | 21 | 19 | 1.76 | 85 |
| 792 | kopru | 30 | 0.67 | 16 | 22 | 1.88 | 30 |
| 793 | ucKule | 56 | 0.69 | 22 | 16 | 2.55 | 65 |
| 794 | domino | 30 | 0.70 | 16 | 22 | 1.88 | 30 |
| 795 | tnt | 36 | 0.72 | 18 | 22 | 2.00 | 50 |
| 796 | piramit | 36 | 0.74 | 15 | 21 | 2.40 | 30 |
| 797 | denge | 36 | 0.75 | 16 | 9 | 2.25 | 60 |
| 798 | kopru | 30 | 0.77 | 14 | 11 | 2.14 | 70 |
| 799 | ucKule | 60 | 0.79 | 22 | 16 | 2.73 | 60 |
| 800 (zor) | domino | 33 | 0.95 | 18 | 25 | 1.83 | 65 |
