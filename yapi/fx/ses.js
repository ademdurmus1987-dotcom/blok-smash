// Foxi Smash v4.0 - Faz 1B: ses sinirlayici (ses karistirma duzeni)
// Sorun: kayitli sesler (play) dogrudan caliniyordu; altin sayaci 50 ms'de bir, kasaya ucan her altin ayrica 'para' caliyordu,
// buyuk yikimda 'tahta'/'tas' ust uste biniyordu -> tek bir ses 8-10 kez ust uste, sikistirici pompaliyor, cizirti ve bogukluk.
// Cozum: her ses turu icin (1) en kisa tekrar araligi, (2) ayni anda en cok kac tane calabilecegi, (3) toplam ses tavani.
// Tavan doluysa: seri sesler (para, tik) en eski kopyayi 25 ms'de kisip yerini alir (ritim bozulmaz); digerleri atlanir.
// Ayni sesin ust uste gelen kopyalari hafifce kisilir (ilk vurus net, kalanlar dolgun ama bogmaz).
const KURAL = {
  para: { ara: 0.04, en: 3, sur: 1 }, tik: { ara: 0.05, en: 2, sur: 1 }, bonus: { ara: 0.12, en: 2 },
  tahta: { ara: 0.05, en: 3 }, tas: { ara: 0.05, en: 3 }, cam: { ara: 0.06, en: 3 }, buz: { ara: 0.06, en: 3 }, metal: { ara: 0.06, en: 2 },
  vurus: { ara: 0.05, en: 2 }, atis: { ara: 0.08, en: 2 }, patlama: { ara: 0.1, en: 2 },
  yerkum: { ara: 0.07, en: 3 }, yerkar: { ara: 0.07, en: 3 }, yersu: { ara: 0.07, en: 3 }, dusme: { ara: 0.07, en: 3 },
  su: { ara: 0.08, en: 3 }, kabarcik: { ara: 0.08, en: 2 }, sandik: { ara: 0.2, en: 1 }, zincir: { ara: 0.1, en: 2 }
};
const VARSAYILAN = { ara: 0.03, en: 4 }, TAVAN = 14;

export function sesSinirKur() {
  const calan = {}, son = {}; let toplam = 0;
  const kural = (k) => KURAL[k] || VARSAYILAN;
  return {
    // calinabilir mi? { izin, kis }: kis = ust uste binme kisma carpani (1 = tam ses)
    izin(k, now, onemli) {
      const r = kural(k), L = calan[k] || (calan[k] = []);
      if (!onemli && son[k] != null && now - son[k] < r.ara) return null;
      if (L.length >= r.en || toplam >= TAVAN) {
        if (!(r.sur || onemli) || !L.length) return null;
        const e = L.shift(); toplam--; try { e.g.gain.cancelScheduledValues(now); e.g.gain.setTargetAtTime(0, now, 0.008); e.s.stop(now + 0.03); } catch (x) {}
      }
      son[k] = now; return { kis: 1 / (1 + 0.35 * L.length) };
    },
    kaydet(k, s, g) {
      const L = calan[k] || (calan[k] = []), e = { s, g }; L.push(e); toplam++;
      s.onended = () => { const i = L.indexOf(e); if (i >= 0) { L.splice(i, 1); toplam--; } };
    },
    say() { return toplam; }
  };
}
