// v7.0 (Adem 18 Kas 2026): "vuruş hissi" paketi (B+A): tok vuruş + ödül hissi.
// - şok halkası: top bloğa çarpınca çarpma noktasından beyaz ve altın iki halka yayılır
// - bum sesi: vuruşa kalın, kısa bir gümleme katmanı (metal ses yok)
// - yıldızlar: kırılan/düşen her bloktan renkli yıldızlar fışkırır (aynı anda en çok YMAX yıldız; telefon yorulmasın)
// - kombo sayacı: aynı atışta 3+ blok gidince üstte büyüyen, renk değiştiren "x5" sayacı; eşiklerde yükselen zil
// - son blok: kısa ağır çekim + hafif yakınlaşma (oyun.js frame içinde)
// Kapatmak için adrese ?vurus=0 (eski hâl). Korsan modunda kapalı.
export function vurusKur({ THREE, scene, fx, sesAl }) {
  const tuval = (w, h, ciz) => { const c = document.createElement('canvas'); c.width = w; c.height = h; ciz(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  // yumuşak kenarlı halka
  const HALKA = tuval(128, 128, (x, w) => { const g = x.createRadialGradient(w / 2, w / 2, w * 0.28, w / 2, w / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,.9)'); g.addColorStop(0.7, 'rgba(255,255,255,1)'); g.addColorStop(0.85, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, w); });
  // dolgun 5 köşeli yıldız (beyaz parlak kenar + iç renk tint ile)
  const YILDIZ = tuval(64, 64, (x, w) => { x.translate(w / 2, w / 2); const yol = () => { x.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 12 : 29, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); };
    yol(); x.lineJoin = 'round'; x.lineWidth = 5; x.strokeStyle = 'rgb(120,120,120)'; x.stroke();   // renkle karisinca koyu kenar: parlak gokyuzunde de okunur
    const g = x.createRadialGradient(-6, -8, 2, 0, 0, 28); g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgb(225,225,225)'); x.fillStyle = g; yol(); x.fill(); });
  const RENK = ['#ffd23f', '#ff5fa2', '#4fd8ff', '#8dff6a', '#c58bff', '#ff9a1f'];
  const YMAT = RENK.map((c) => new THREE.SpriteMaterial({ map: YILDIZ, color: c, transparent: true, depthWrite: false }));
  const azHareket = matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let yildizSay = 0; const YMAX = 70;

  function halka(p, renk, life, s0, s1, op) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: HALKA, color: renk, transparent: true, opacity: op, depthWrite: false, depthTest: false }));
    m.position.copy(p); m.renderOrder = 20; m.scale.setScalar(s0); scene.add(m);
    fx(m, life, (o, k) => { const e = 1 - (1 - k) ** 3; o.scale.setScalar(s0 + (s1 - s0) * e); o.material.opacity = op * (1 - k) ** 1.6; });
  }

  function bum(s) {
    const S = sesAl(); if (!S) return; const { AC, out } = S, o = out(), t = AC.currentTime, v = Math.min(1, 0.55 + 0.35 * s);
    const os = AC.createOscillator(), g = AC.createGain(); os.type = 'sine';
    os.frequency.setValueAtTime(150, t); os.frequency.exponentialRampToValueAtTime(42, t + 0.2);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.75 * v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    os.connect(g); g.connect(o); os.start(t); os.stop(t + 0.3);
    // kısa, boğuk gürültü: "tok" dokunuş
    const n = Math.floor(AC.sampleRate * 0.09), buf = AC.createBuffer(1, n, AC.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 2;
    const src = AC.createBufferSource(), lp = AC.createBiquadFilter(), ng = AC.createGain(); src.buffer = buf; lp.type = 'lowpass'; lp.frequency.value = 520;
    ng.gain.value = 0.55 * v; src.connect(lp); lp.connect(ng); ng.connect(o); src.start(t);
  }

  // top bloğa çarptı: p dünya konumu, s darbe şiddeti (0..1.4)
  function vurus(p, s) {
    halka(p, '#ffffff', 0.26, 0.4, 3.2 + 1.2 * s, 0.95);
    halka(p, '#ffc21a', 0.42, 0.6, 5 + 1.6 * s, 0.85);
    bum(s);
  }

  // blok gitti: renkli yıldız fışkırması
  function yildizlar(p, n) {
    n = Math.min(n || 5, YMAX - yildizSay); if (n <= 0) return;
    for (let i = 0; i < n; i++) {
      const m = new THREE.Sprite(YMAT[(Math.random() * YMAT.length) | 0]); m.userData.shared = true; m.renderOrder = 19;
      m.position.set(p.x, p.y + 0.2, p.z); const a = Math.random() * Math.PI * 2, h = 2.5 + Math.random() * 2.5;
      const v = new THREE.Vector3(Math.cos(a) * h, 4 + Math.random() * 4, Math.sin(a) * h * 0.5 + 1.2), s0 = 0.6 + Math.random() * 0.3;
      scene.add(m); yildizSay++;
      fx(m, 0.7 + Math.random() * 0.25, (o, k, dt) => { v.y -= 14 * dt; o.position.addScaledVector(v, dt); v.multiplyScalar(1 - dt * 1.5);
        o.scale.setScalar(s0 * (k < 0.15 ? k / 0.15 * 1.25 : k > 0.65 ? Math.max(0.001, (1 - k) / 0.35) : 1.25 - 0.25 * (k - 0.15) / 0.5));
        if (k >= 0.999 && !o.userData.sayd) { o.userData.sayd = 1; yildizSay--; } });
    }
  }

  // kombo sayacı
  const el = document.createElement('div'); el.id = 'kombo'; el.setAttribute('aria-live', 'polite');
  el.innerHTML = '<small>KOMBO</small><b>x0</b>'; document.body.appendChild(el); const sayi = el.querySelector('b');
  let son = 0, gizleT = 0;
  function kombo(n) {
    if (n < 3 || n === son) return; son = n;
    sayi.textContent = 'x' + n;
    el.className = 'gor k' + (n >= 20 ? 4 : n >= 12 ? 3 : n >= 6 ? 2 : 1);
    if (!azHareket) { el.classList.remove('vur'); void el.offsetWidth; el.classList.add('vur'); }
    clearTimeout(gizleT); gizleT = setTimeout(komboBitti, 2200);
  }
  function komboBitti() { clearTimeout(gizleT); if (!son) return; son = 0; el.classList.remove('gor'); el.classList.add('git'); }
  return { vurus, bum, yildizlar, kombo, komboBitti, azHareket, yildizSay: () => yildizSay };
}
