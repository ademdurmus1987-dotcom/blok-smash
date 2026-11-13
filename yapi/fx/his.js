// Foxi Smash v4.2 - Faz 1C: oyun hissi (malzemeye gore geri bildirim)
// Tek tablo: her malzeme vurulunca ne sacar (kivilcim/kiymik/toz rengi, sayisi, parlaklik), yere dusunce parcalar ne kadar kalir.
// Oyun kodu yalniz his.vurus(...) / his.dusus(...) cagirir; efekt ayrintisi burada. Parcaciklar fx/parcacik.js havuzundan gelir.
export const MALZ = {
  tahta: { kiv: ['#e8c48a', '#b98450', '#8a5a30'], toz: '#d8c0a0', n: 9, hiz: 7, parlak: false, kal: 3.0 },
  tas:   { kiv: ['#d8d4cc', '#a8a49c', '#7c7872'], toz: '#c8c4bc', n: 10, hiz: 6, parlak: false, kal: 3.2 },
  metal: { kiv: ['#fff2b0', '#ffc860', '#ff9a30'], toz: '#d0d4dc', n: 12, hiz: 11, parlak: true, kal: 3.0 },
  cam:   { kiv: ['#ffffff', '#d8f4ff', '#a8e4ff'], toz: '#e8f8ff', n: 12, hiz: 9, parlak: true, kal: 2.4 },
  buz:   { kiv: ['#ffffff', '#e0f6ff', '#b8e8ff'], toz: '#f0faff', n: 12, hiz: 8, parlak: true, kal: 2.4 },
  jole:  { kiv: ['#ffd0f0', '#ff9ad8', '#ffffff'], toz: '#ffe0f4', n: 8, hiz: 6, parlak: false, kal: 2.4 }
};
export const malz = (k) => MALZ[k] || MALZ.tahta;

export function hisKur(A) {   // A: { THREE, spr, fx }
  const V = new A.THREE.Vector3();
  return {
    // top bloga carptiginda: malzeme renginde kivilcim/kiymik + ince toz (beyaz genel patlama yerine)
    vurus(p, dir, mk, s) {
      const m = malz(mk), n = Math.round(m.n * (0.6 + 0.4 * Math.min(1, s || 1)));
      for (let i = 0; i < n; i++) {
        const o = A.spr(m.kiv[i % m.kiv.length], m.parlak, 1); o.position.copy(p);
        const v = new A.THREE.Vector3(-dir.x + (Math.random() - 0.5) * 1.6, 0.4 + Math.random() * 1.1, -dir.z + (Math.random() - 0.5) * 1.6).normalize().multiplyScalar(m.hiz * (0.5 + Math.random() * 0.6));
        const s0 = m.parlak ? 0.16 + Math.random() * 0.12 : 0.2 + Math.random() * 0.16, t = 0.32 + Math.random() * 0.25;
        A.fx(o, t, (q, k, dt) => { v.y -= 18 * dt; q.position.addScaledVector(v, dt); q.scale.set(s0 * (m.parlak ? 1 + 1.6 * (1 - k) : 1), s0, 1); q.material.rotation = Math.atan2(v.y, v.x); q.material.opacity = 1 - k * k; });
      }
      for (let i = 0; i < 3; i++) {
        const o = A.spr(m.toz, false, 0.4); o.position.copy(p); V.set((Math.random() - 0.5) * 1.4, 0.3 + Math.random() * 0.6, (Math.random() - 0.5) * 1.4); const v = V.clone(), s0 = 0.6 + Math.random() * 0.4;
        A.fx(o, 0.7, (q, k, dt) => { q.position.addScaledVector(v, dt); v.multiplyScalar(1 - dt * 2.5); q.scale.setScalar(s0 * (1 + k * 1.5)); q.material.opacity = 0.4 * (1 - k); });
      }
    },
    // yere dusup parcalanan blogun parcalari yerde ne kadar kalsin (Royal Smash: birkac saniye)
    kalis(mk) { return malz(mk).kal; }
  };
}
