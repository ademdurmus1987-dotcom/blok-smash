// Foxi Smash v12.57 (Adem 25 Kas: 'bu kartlar bolum baslamadan hazirlanirken cikiyor'): bolume girerken, bolum hazirlanirken rastgele hikaye karti.
// Resimler karakter/acilis/yk/yNN.webp (videolarimizin kareleri), alt yazi komik bir cumle. Hazirlik bitince ve en az 1.6 sn gorununce kapanir; dokununca gecer.
// Kapatma: ?ykart=0
export const YKART = !/[?&]ykart=0/.test(location.search);
export const YK = ['Rako yine kule diziyor. Bu sefer daha yüksek, daha sallantılı!', 'Rako kulenin tepesinde poz veriyor. Topu hazırla Kaptan!',
  'Gemi kendi kendine yapılmaz. Foxi çekici kaptı bile!', 'Kırmızı boya, altın süs… Foxi\'nin gemisi parlıyor!', 'Şapır şupur! Gemi denize indi, sıra tayfada.',
  'Dümen Foxi\'de. Rotamız: Rako\'nun kuleleri!', 'Pako fenerde kafeste. Gözcü olmak da zor iş!', 'Foxi sarmaşığa tutundu. Miko, geliyoruz!',
  'Foxi dalgıç kaskını taktı. Ahmo mutfakta bekliyor!', 'Sal akıntıda hızlanıyor. Kundi, sıkı tutun!', 'Buz mağarası kaygan. Foxi de kayıyor!',
  'Nilüferden nilüfere… Timsahı uyandırmayalım!', 'Rako ambarda nöbette. Ama altına hiç dayanamaz!', 'Anahtar havada! Kafesin kilidi çıt diye açılacak.',
  'TNT patladı, Rako uçtu! Sıradaki kule hazır mı?', 'Tayfa büyüyor! Sıradaki adaya tam yol.', 'Fırtına bitti. Şimdi sıra tayfayı toplamakta!'];
let E = null, t0 = 0, hazir = false, son = -1, CSS = false;
function stil() {
  if (CSS) return; CSS = true; const s = document.createElement('style');
  s.textContent = `#ykart{position:fixed;inset:0;z-index:71;background:#1b2a4a center/cover no-repeat;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;padding:0 16px calc(env(safe-area-inset-bottom,0px) + 46px);opacity:1;transition:opacity .25s}
#ykart.cik{opacity:0}#ykart:before{content:'';position:absolute;left:0;right:0;bottom:0;height:46%;background:linear-gradient(transparent,rgba(5,10,25,.75));pointer-events:none}
#ykart p{position:relative;margin:0 0 16px;max-width:380px;text-align:center;font:400 25px/1.2 var(--disp,system-ui);color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.55),0 0 14px rgba(0,0,0,.7)}
#ykart b{position:relative;font:400 18px/1 var(--disp,system-ui);color:#ffe27a;text-shadow:0 2px 0 #7a3c00;letter-spacing:.5px}
#ykart i{position:relative;display:block;width:min(70vw,280px);height:12px;margin-top:10px;border-radius:8px;background:rgba(0,0,0,.45);overflow:hidden;border:2px solid rgba(255,255,255,.35)}
#ykart i:after{content:'';position:absolute;inset:0;width:40%;border-radius:6px;background:linear-gradient(90deg,#ffd45a,#ffb43a);animation:ykdol 1.4s ease-in-out infinite}
@keyframes ykdol{0%{transform:translateX(-100%)}100%{transform:translateX(260%)}}`;
  document.head.appendChild(s);
}
export function ykGoster() {
  if (!YKART || E) return false; stil(); hazir = false; t0 = performance.now();
  let n = Math.floor(Math.random() * YK.length); if (n === son) n = (n + 1) % YK.length; son = n;
  E = document.createElement('div'); E.id = 'ykart'; E.style.backgroundImage = 'url(../karakter/acilis/yk/y' + String(n + 1).padStart(2, '0') + '.webp?v=2)';
  E.innerHTML = '<p></p><b>Bölüm hazırlanıyor…</b><i></i>'; E.querySelector('p').textContent = YK[n];
  const el = E; el.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (hazir) kapa(el); });
  document.body.appendChild(el); return true;   // yeni acildi: cagiran, agir kurulumu kart cizildikten sonra baslatir
}
function kapa(el) { if (!el || !el.isConnected) return; el.classList.add('cik'); if (E === el) E = null; setTimeout(() => el.remove(), 260); }
export function ykKapat() {
  if (!E) return; hazir = true; const el = E; const b = el.querySelector('b'); if (b) b.textContent = 'Hazır!';
  setTimeout(() => kapa(el), Math.max(0, 1600 - (performance.now() - t0)));
}
