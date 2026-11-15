# Balance Check: Foxi Smash bölümleri (top, zorluk, altın)

### Data Sources Analyzed
- yapi/bolumler/p00.json, p06.json, p07.json (26-100, 700-800: kayıtlı bölümler)
- yapi/oyun.js `win()` (altın: 10 + yıldız×10 + kalan top×5 (en çok 60), zor bölüm +20), `shotsFor()` (1-25)
- yapi/uretici/arketip.js `zorluk()`, yapi/uretici/dogrula.js `topHesap()`
- Tasarım hedefleri: GDD yok; hedefler bu işin şartnamesinden ve eski dengeden alındı: top başına 2,5-5,5 blok, bot (kusursuz nişan) atışı ≤ top, ilk kazanç 40-120 altın (+20 zor).

### Health Summary: CONCERNS

| Aralık | Bölüm | Ort. top | Blok/top | Zor bölüm blok/top | Normal blok/top | Ort. ilk altın | Ort. yıldız (tahmini) |
|---|---|---|---|---|---|---|---|
| 1-100 | 75 | NaN | NaN | 2.49 | NaN | NaN | 2.35 |
| 700-800 | 0 | 0.0 | 0.00 | 0.00 | 0.00 | 0 | 0.00 |

### Outliers Detected

| Bölüm | Değer | Beklenen | Gerçek | Not |
|---|---|---|---|---|
| 26 | blok/top | 2.5-5.5 | 1.94 | fazla top (kolay) |
| 27 | blok/top | 2.5-5.5 | 2.24 | fazla top (kolay) |
| 27 | bot atışı <= top | <= 17 | 22 | top yetmeyebilir |
| 29 | blok/top | 2.5-5.5 | 2.17 | fazla top (kolay) |
| 31 | blok/top | 2.5-5.5 | 1.80 | fazla top (kolay) |
| 32 | blok/top | 2.5-5.5 | 2.05 | fazla top (kolay) |
| 33 | blok/top | 2.5-5.5 | 2.05 | fazla top (kolay) |
| 35 | blok/top | 2.5-5.5 | 2.08 | fazla top (kolay) |
| 36 | blok/top | 2.5-5.5 | 2.39 | fazla top (kolay) |
| 37 | blok/top | 2.5-5.5 | 2.30 | fazla top (kolay) |
| 38 | blok/top | 2.5-5.5 | 1.86 | fazla top (kolay) |
| 39 | blok/top | 2.5-5.5 | 2.06 | fazla top (kolay) |
| 41 | blok/top | 2.5-5.5 | 1.67 | fazla top (kolay) |
| 42 | blok/top | 2.5-5.5 | 1.67 | fazla top (kolay) |
| 43 | blok/top | 2.5-5.5 | 2.00 | fazla top (kolay) |
| 44 | blok/top | 2.5-5.5 | 2.39 | fazla top (kolay) |
| 45 | blok/top | 2.5-5.5 | 2.15 | fazla top (kolay) |
| 45 | bot atışı <= top | <= 13 | 14 | top yetmeyebilir |
| 46 | blok/top | 2.5-5.5 | 1.67 | fazla top (kolay) |
| 46 | bot atışı <= top | <= 18 | 25 | top yetmeyebilir |
| 47 | blok/top | 2.5-5.5 | 1.82 | fazla top (kolay) |
| 47 | bot atışı <= top | <= 17 | 24 | top yetmeyebilir |
| 47 | ilk kazanç altını | 40-120 | 30 |  |
| 48 | blok/top | 2.5-5.5 | 2.13 | fazla top (kolay) |
| 49 | blok/top | 2.5-5.5 | 1.90 | fazla top (kolay) |
| 50 | blok/top | 2.5-5.5 | 2.14 | fazla top (kolay) |
| 52 | blok/top | 2.5-5.5 | 2.08 | fazla top (kolay) |
| 53 | blok/top | 2.5-5.5 | 1.88 | fazla top (kolay) |
| 54 | blok/top | 2.5-5.5 | 2.24 | fazla top (kolay) |
| 54 | bot atışı <= top | <= 21 | 27 | top yetmeyebilir |
| 55 | blok/top | 2.5-5.5 | 2.19 | fazla top (kolay) |
| 56 | blok/top | 2.5-5.5 | 2.44 | fazla top (kolay) |
| 57 | blok/top | 2.5-5.5 | 2.17 | fazla top (kolay) |
| 59 | blok/top | 2.5-5.5 | 2.17 | fazla top (kolay) |
| 61 | blok/top | 2.5-5.5 | 2.40 | fazla top (kolay) |
| 62 | blok/top | 2.5-5.5 | 1.77 | fazla top (kolay) |
| 63 | blok/top | 2.5-5.5 | 2.05 | fazla top (kolay) |
| 64 | blok/top | 2.5-5.5 | 2.19 | fazla top (kolay) |
| 65 | blok/top | 2.5-5.5 | 2.17 | fazla top (kolay) |
| 66 | blok/top | 2.5-5.5 | 2.00 | fazla top (kolay) |
| 67 | bot atışı <= top | <= undefined |  | top yetmeyebilir |
| 68 | blok/top | 2.5-5.5 | 1.76 | fazla top (kolay) |
| 69 | blok/top | 2.5-5.5 | 2.19 | fazla top (kolay) |
| 70 | bot atışı <= top | <= 17 | 23 | top yetmeyebilir |
| 71 | blok/top | 2.5-5.5 | 1.36 | fazla top (kolay) |
| 72 | blok/top | 2.5-5.5 | 1.86 | fazla top (kolay) |
| 73 | blok/top | 2.5-5.5 | 2.09 | fazla top (kolay) |
| 74 | blok/top | 2.5-5.5 | 1.78 | fazla top (kolay) |
| 75 | blok/top | 2.5-5.5 | 2.07 | fazla top (kolay) |
| 76 | blok/top | 2.5-5.5 | 2.31 | fazla top (kolay) |
| 77 | blok/top | 2.5-5.5 | 2.24 | fazla top (kolay) |
| 78 | blok/top | 2.5-5.5 | 2.25 | fazla top (kolay) |
| 78 | bot atışı <= top | <= 16 | 20 | top yetmeyebilir |
| 79 | blok/top | 2.5-5.5 | 2.24 | fazla top (kolay) |
| 80 | blok/top | 2.5-5.5 | 2.38 | fazla top (kolay) |
| 81 | blok/top | 2.5-5.5 | 1.81 | fazla top (kolay) |
| 82 | blok/top | 2.5-5.5 | 2.27 | fazla top (kolay) |
| 83 | blok/top | 2.5-5.5 | 2.09 | fazla top (kolay) |
| 85 | blok/top | 2.5-5.5 | 1.93 | fazla top (kolay) |
| 86 | blok/top | 2.5-5.5 | 2.00 | fazla top (kolay) |

(+18 satır daha)

### Progression Analysis (10 bölümlük döngü)

| Bölüm | Arketip | Blok | Zorluk | Top | Bot | Blok/top | İlk altın |
|---|---|---|---|---|---|---|---|
| 26 | kale | 33 | 0.36 | 17 | 12 | 1.94 | 80 |
| 27 | raflar | 38 | 0.38 | 17 | 22 | 2.24 | 45 |
| 28 | camKule | 43 | 0.39 | 17 | 6 | 2.53 | 55 |
| 29 | ucKule | 26 | 0.41 | 12 | 8 | 2.17 | 65 |
| 30 (zor) | korsanKale | 57 | 0.57 | 22 | 19 | 2.59 | 85 |
| 31 | domino | 27 | 0.17 | 15 | 13 | 1.80 | 75 |
| 32 | inceKule | 41 | 0.31 | 20 | 8 | 2.05 | 85 |
| 33 | raflar | 39 | 0.32 | 19 | 16 | 2.05 | 80 |
| 34 | ucKule | 48 | 0.34 | 19 | 13 | 2.53 | 60 |
| 35 | kale | 50 | 0.35 | 24 | 24 | 2.08 | 75 |
| 36 | camKule | 43 | 0.37 | 18 | 5 | 2.39 | 60 |
| 37 | inceKule | 53 | 0.38 | 23 | 10 | 2.30 | 75 |
| 38 | piramit | 26 | 0.40 | 14 | 7 | 1.86 | 75 |
| 39 | merdiven | 33 | 0.41 | 16 | 11 | 2.06 | 75 |
| 40 (zor) | ucKule | 30 | 0.57 | 11 | 10 | 2.73 | 65 |
| 41 | asansor | 40 | 0.17 | 24 | 8 | 1.67 | 100 |
| 42 | inceKule | 25 | 0.30 | 15 | 4 | 1.67 | 80 |
| 43 | kopru | 42 | 0.32 | 21 | 20 | 2.00 | 85 |
| 44 | merdiven | 67 | 0.33 | 28 | 28 | 2.39 | 80 |
| 45 | piramit | 28 | 0.34 | 13 | 14 | 2.15 | 50 |
| 46 | domino | 30 | 0.36 | 18 | 25 | 1.67 | 45 |
| 47 | raflar | 31 | 0.37 | 17 | 24 | 1.82 | 30 |
| 48 | inceKule | 49 | 0.38 | 23 | 6 | 2.13 | 90 |
| 49 | kale | 40 | 0.40 | 21 | 16 | 1.90 | 90 |
| 50 (zor) | kopru | 30 | 0.56 | 14 | 8 | 2.14 | 90 |
| 51 | korsanKale | 75 | 0.16 | 30 | 26 | 2.50 | 80 |
| 52 | piramit | 50 | 0.29 | 24 | 19 | 2.08 | 90 |
| 53 | asansor | 30 | 0.30 | 16 | 16 | 1.88 | 60 |
| 54 | raflar | 47 | 0.32 | 21 | 27 | 2.24 | 50 |
| 55 | denge | 35 | 0.33 | 16 | 11 | 2.19 | 60 |
