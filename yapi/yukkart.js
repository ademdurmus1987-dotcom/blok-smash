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
// v12.62 (Adem 26 Kas, rakip ekranlari: 'kartlari bu sekilde istiyordum, suresi cok az'): en az 3.6 sn, cubuk soldan saga dolar,
// 'Yukleniyor...' noktalari, kenarli beyaz yazi (koyu perde yok), ucusan isiltilar. Hazirlik uzarsa cubuk %90'da bekler.
const MIN = 3600;
// v12.63 (Adem 26 Kas: 'zaten vermistim kartlari'): Adem'in 14 Higgsfield karti karakter/acilis/yk2/kNN.webp, eski video kareleri ?ykart=eski.
// [resim no, yazi, tayfa id]: tayfa kartlari o uye kurtarilinca cikar (surpriz bozulmasin).
const ESKI = /[?&]ykart=eski/.test(location.search);
let DESTE = [];
export const YK2 = [
  [1, 'Kaptan uyuyor, Pako bağırıyor: Rako yine kule dikmiş!', 'papagan'],
  [2, 'Rako kulenin tepesinde. Foxi topu hazırladı!'],
  [3, 'Tek atış, koca kule yerde! Rako ne olduğunu anlamadı.'],
  [4, 'Miko direkte gözcü. Ufukta yeni bir kule var!', 'maymun'],
  [5, 'Mırmır altınların üstünde uyuyor. Ama bir gözü hep açık!', 'kedi'],
  [6, 'Vırak borazanı öttürdü, martılar kaçıştı!', 'kurbaga'],
  [7, 'Diken haritayı çözdü. Sıradaki ada bu yolda!', 'kirpi'],
  [8, 'Pengo topa kar topu doldurdu. Bu da bir fikir!', 'penguen'],
  [9, 'Kundi testereyi kaptı. Gemiye yeni tahta lazım!', 'kunduz'],
  [10, 'Ahmo sekiz koluyla krep yapıyor. Tayfa aç!', 'ahtapot'],
  [11, 'Rako gece gizlice kule diziyor. Şşşt!'],
  [12, 'Ufukta Rako\'nun kulesi! Tam yol ileri, Kaptan!', 'papagan'],
  [13, 'Foxi gülleleri parlatıyor. Kuleler, hazır olun!'],
  [14, 'Rako balonla kuleye blok taşıyor. Ter döküyor!']
];
let E = null, t0 = 0, hazir = false, son = -1, CSS = false, tH = 0;
function stil() {
  if (CSS) return; CSS = true; const s = document.createElement('style');
  const kenar = [[0, 3], [2, 2], [3, 0], [2, -2], [0, -3], [-2, -2], [-3, 0], [-2, 2]].map(([x, y]) => `${x}px ${y}px 0 #2a1606`).join(',');
  s.textContent = `#ykart{position:fixed;inset:0;z-index:71;background:#1b2a4a center/cover no-repeat;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;padding:0 18px calc(env(safe-area-inset-bottom,0px) + 34px);opacity:1;transition:opacity .3s;overflow:hidden}
#ykart.cik{opacity:0}#ykart:before{content:'';position:absolute;left:0;right:0;bottom:0;height:30%;background:linear-gradient(transparent,rgba(10,6,2,.32));pointer-events:none}
#ykart p{position:relative;margin:0 0 14px;max-width:370px;text-align:center;font:400 27px/1.18 var(--disp,system-ui);color:#fff;text-shadow:${kenar},0 5px 6px rgba(0,0,0,.45)}
#ykart b{position:relative;font:400 21px/1 var(--disp,system-ui);color:#fff;text-shadow:${kenar};letter-spacing:.3px;min-width:150px;text-align:left}
#ykart i{position:relative;display:block;width:min(48vw,190px);height:13px;margin-top:12px;border-radius:9px;background:rgba(40,24,8,.55);overflow:hidden;box-shadow:0 0 0 2px rgba(255,255,255,.35)}
#ykart i u{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:9px;background:linear-gradient(#ffe08a,#ffb83a);box-shadow:inset 0 2px 0 rgba(255,255,255,.55)}
#ykart s{position:absolute;top:-30px;width:16px;height:10px;border-radius:50% 50% 50% 0;background:#8fd14f;opacity:.9;animation:ykyap linear infinite;pointer-events:none}
#ykart s.p{width:6px;height:6px;border-radius:50%;background:#fff6c8;box-shadow:0 0 8px 3px rgba(255,230,140,.8);animation-name:ykpar}
@keyframes ykyap{0%{transform:translate(0,0) rotate(0)}50%{transform:translate(30px,55vh) rotate(200deg)}100%{transform:translate(-10px,112vh) rotate(420deg)}}
@keyframes ykpar{0%{transform:translateY(110vh);opacity:0}20%{opacity:1}100%{transform:translateY(-10vh);opacity:0}}`;
  document.head.appendChild(s);
}
function dongu() {
  if (!E) return; const el = E, t = performance.now() - t0, u = el.querySelector('i u'), b = el.querySelector('b');
  let k = Math.min(0.9, t / MIN * 0.9); if (hazir) k = Math.min(1, 0.9 * Math.min(1, tH / MIN) + (t - tH) / Math.max(300, MIN - tH) * (1 - 0.9 * Math.min(1, tH / MIN)));
  if (u) u.style.width = (k * 100).toFixed(1) + '%'; if (b) b.textContent = 'Yükleniyor' + '...'.slice(0, Math.floor(t / 400) % 4);
  requestAnimationFrame(dongu);
}
export function ykGoster(dost) {
  if (!YKART || E) return false; stil(); hazir = false; t0 = performance.now();
  let n, resim, yazi;
  if (ESKI) { n = Math.floor(Math.random() * YK.length); if (n === son) n = (n + 1) % YK.length; resim = '../karakter/acilis/yk/y' + String(n + 1).padStart(2, '0') + '.webp?v=2'; yazi = YK[n]; }
  else { const ac = YK2.filter((k) => !k[2] || (dost || []).includes(k[2]));
    DESTE = DESTE.filter((k) => ac.includes(k)); if (!DESTE.length) { DESTE = ac.slice().sort(() => Math.random() - 0.5); if (DESTE.length > 1 && DESTE[0][0] === son) DESTE.push(DESTE.shift()); }   // karisik deste: hepsi bir kez gorunmeden tekrar yok
    const k = DESTE.shift(); resim = '../karakter/acilis/yk2/k' + String(k[0]).padStart(2, '0') + '.webp?v=1'; yazi = k[1]; n = k[0]; }
  son = n;
  E = document.createElement('div'); E.id = 'ykart'; E.style.backgroundImage = 'url(' + resim + ')';
  let ss = ''; for (let k = 0; k < 9; k++) ss += `<s style="left:${(k * 11 + Math.random() * 8).toFixed(0)}%;animation-duration:${(5 + Math.random() * 4).toFixed(1)}s;animation-delay:-${(Math.random() * 6).toFixed(1)}s"></s>`;
  for (let k = 0; k < 8; k++) ss += `<s class="p" style="left:${(Math.random() * 96).toFixed(0)}%;animation-duration:${(3 + Math.random() * 3).toFixed(1)}s;animation-delay:-${(Math.random() * 4).toFixed(1)}s"></s>`;
  E.innerHTML = ss + '<p></p><b>Yükleniyor</b><i><u></u></i>'; E.querySelector('p').textContent = yazi;
  const el = E; el.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (hazir && performance.now() - t0 > 1500) kapa(el); });
  document.body.appendChild(el); requestAnimationFrame(dongu); return true;   // yeni acildi: cagiran, agir kurulumu kart cizildikten sonra baslatir
}
function kapa(el) { if (!el || !el.isConnected) return; el.classList.add('cik'); if (E === el) E = null; setTimeout(() => el.remove(), 320); }
export function ykKapat() {
  if (!E) return; hazir = true; tH = performance.now() - t0; const el = E;
  setTimeout(() => kapa(el), Math.max(350, MIN - tH));
}
