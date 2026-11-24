// Foxi Smash v12.21 deneme (?dost=1, Adem 24 Kas): Foxi korsan murettebatini kurtariyor.
// Oyunda: her 5 bolumde bir kupun onunde altin anahtar rozeti. Kup kirilinca/dusunce anahtar ekranin sag ustundeki anahtar yuvasina ucar (kafes oyunda YOK).
// Bolum kazanilinca ayri sayfa: ortada kilitli kafes, anahtar gelip kilide girer, doner, kafes acilir, murettebat uyesi sevinerek cikar; sonra kazanma karti.
// Kayit: SV.dost = [kurtarilan id]. Resimler (Adem'in Gemini cizimleri): karakter/dost/{id}.webp, kafes karakter/dost/kafes_kapali.webp + kafes_acik.webp; yoksa kodla cizim / emoji yedegi.
export const DOST = /[?&]dost=1/.test(location.search);
export const DOSTLAR = [
  { id: 'papagan', ad: 'Papağan Pako', gorev: 'Gözcü', e: '🦜' },
  { id: 'kaplumbaga', ad: 'Kaplumbağa Tosbi', gorev: 'Dümenci', e: '🐢' },
  { id: 'ahtapot', ad: 'Ahtapot Ahmo', gorev: 'Aşçı', e: '🐙' },
  { id: 'kunduz', ad: 'Kunduz Kundi', gorev: 'Marangoz', e: '🦫' },
  { id: 'penguen', ad: 'Penguen Pengo', gorev: 'Gülle Ustası', e: '🐧' },
  { id: 'kirpi', ad: 'Kirpi Diken', gorev: 'Haritacı', e: '🦔' },
  { id: 'kurbaga', ad: 'Kurbağa Vırak', gorev: 'Borazancı', e: '🐸' },
  { id: 'fok', ad: 'Fok Foki', gorev: 'Dalgıç', e: '🦭' }
];
// bu bolumde kurtarilacak uye (yoksa null): 5, 10, 15 ... sirayla; daha once kurtarildiysa anahtar yok
export function dostBolum(L, SV) {
  if (!DOST || L < 5 || L % 5) return null;
  const d = DOSTLAR[(L / 5 - 1) % DOSTLAR.length];
  return (SV.dost || []).includes(d.id) ? null : d;
}
const ANAHTAR = '<svg viewBox="0 0 48 24" aria-hidden="true"><g stroke-linecap="round" fill="none"><g stroke="#5a3200" stroke-width="7.5"><circle cx="10" cy="12" r="6.5"/><path d="M16.5 12h27M35 12v7.5M41.5 12v6"/></g>' +
  '<g stroke="#ffd23a" stroke-width="4.2"><circle cx="10" cy="12" r="6.5"/><path d="M16.5 12h27M35 12v7.5M41.5 12v6"/></g></g></svg>';
// yedek kafes (Gemini kafesi gelene kadar): ahsap taban, altin kubbe, demir parmaklik, ortada asma kilit
const KAFES = (acik) => '<svg viewBox="0 0 200 230" aria-hidden="true"><defs><linearGradient id="dkA" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#c8881e"/></linearGradient>' +
  '<linearGradient id="dkT" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#b8742c"/><stop offset="1" stop-color="#6e3c12"/></linearGradient></defs><ellipse cx="100" cy="222" rx="86" ry="8" fill="#0005"/>' +
  '<rect x="26" y="62" width="148" height="140" fill="#1a1030" opacity=".5"/>' +
  '<path d="M20 66C20 18 180 18 180 66z" fill="url(#dkA)" stroke="#5a3200" stroke-width="5"/><circle cx="100" cy="16" r="10" fill="none" stroke="#5a3200" stroke-width="6"/>' +
  '<g stroke="#4a5360" stroke-width="7" stroke-linecap="round"><path d="M30 66v134M170 66v134"/></g>' +
  (acik ? '<g transform="translate(30 0) scale(-.25 1) translate(-30 0)" opacity=".9">' : '<g>') +
  '<g stroke="#6b7685" stroke-width="7" stroke-linecap="round"><path d="M52 66v134M76 66v134M100 66v134M124 66v134M148 66v134"/></g><path d="M30 120h140" stroke="#4a5360" stroke-width="6"/>' +
  (acik ? '' : '<g transform="translate(100 128)"><path d="M-13 -6v-10a13 13 0 0 1 26 0v10" fill="none" stroke="#4a5360" stroke-width="6"/><rect x="-20" y="-8" width="40" height="34" rx="7" fill="url(#dkA)" stroke="#5a3200" stroke-width="4"/><circle cx="0" cy="6" r="4.5" fill="#5a3200"/><path d="M0 8v9" stroke="#5a3200" stroke-width="4" stroke-linecap="round"/></g>') +
  '</g><rect x="12" y="196" width="176" height="20" rx="8" fill="url(#dkT)" stroke="#4a2406" stroke-width="4"/></svg>';
let CSS = false;
function stil() {
  if (CSS) return; CSS = true; const s = document.createElement('style');
  s.textContent = `#dyuva{position:fixed;right:12px;top:calc(env(safe-area-inset-top,0px) + 92px);width:52px;height:52px;z-index:6;pointer-events:none;border-radius:50%;background:radial-gradient(circle at 45% 40%,#3fd2e6,#0b6f88);border:3px solid #fff4d6;box-shadow:0 3px 6px #0007;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(.6);transition:opacity .3s,transform .3s}
#dyuva.on{opacity:1;transform:scale(1)}#dyuva svg{width:40px;height:20px;opacity:.28;filter:grayscale(1) brightness(2);transform:rotate(-35deg)}#dyuva.dolu svg{opacity:1;filter:none}#dyuva.dolu{animation:dyzip .6s;box-shadow:0 0 16px #ffd54a,0 3px 6px #0007}
@keyframes dyzip{0%{transform:scale(1)}35%{transform:scale(1.35) rotate(-10deg)}70%{transform:scale(.95)}100%{transform:scale(1)}}
.dk-an{position:fixed;left:0;top:0;width:52px;height:26px;z-index:61;pointer-events:none;filter:drop-shadow(0 0 7px #ffd54a) drop-shadow(0 2px 2px #0008)}.dk-an svg{width:100%;height:100%}
#dekran{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 40%,#2a63ad 0,#102048 72%);color:#fff;opacity:0;transition:opacity .35s;overflow:hidden}
#dekran.on{opacity:1}#dekran .de-isin{position:absolute;left:50%;top:40%;width:150vmax;height:150vmax;margin:-75vmax 0 0 -75vmax;background:repeating-conic-gradient(rgba(255,230,150,.15) 0 9deg,transparent 9deg 22deg);animation:dedon 18s linear infinite;pointer-events:none;opacity:0;transition:opacity .6s}
#dekran.acik .de-isin{opacity:1}@keyframes dedon{to{transform:rotate(360deg)}}
#dekran .de-ust{position:relative;font-size:20px;font-weight:900;color:#ffe27a;text-shadow:0 2px 0 #6a3400;margin-bottom:10px;transition:opacity .3s}#dekran.acik .de-ust{opacity:0}
#dekran .de-kutu{position:relative;width:min(78vw,320px);height:min(88vw,360px)}
#dekran .de-kafes{position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:center;transition:transform .25s}#dekran .de-kafes>*{width:100%;height:100%;object-fit:contain;object-position:50% 100%;filter:drop-shadow(0 10px 12px #0008)}
#dekran.cik .de-kafes{transform:translate(-22%,10%) scale(.62);opacity:.85;transition:transform .6s cubic-bezier(.3,1.3,.5,1),opacity .6s}#dekran .de-kafes.sars{animation:desars .35s}@keyframes desars{25%{transform:translateX(-6px) rotate(-1.5deg)}75%{transform:translateX(6px) rotate(1.5deg)}}
#dekran .de-hay{position:absolute;left:50%;bottom:6%;width:86%;height:86%;margin-left:-43%;object-fit:contain;transform:translateY(25%) scale(.15);opacity:0;transition:transform .75s cubic-bezier(.3,1.55,.5,1),opacity .25s;filter:drop-shadow(0 10px 12px #0009);z-index:2}
#dekran .de-hay.em{font-size:min(40vw,170px);line-height:1;text-align:center;display:flex;align-items:flex-end;justify-content:center}#dekran.cik .de-hay{transform:translate(14%,4%) scale(1.08);opacity:1}
#dekran .de-flas{position:absolute;inset:-20%;background:radial-gradient(circle,#fff8d0 0,rgba(255,240,170,.6) 30%,transparent 62%);opacity:0;pointer-events:none;z-index:3}#dekran.acik .de-flas{animation:deflas .7s}
@keyframes deflas{0%{opacity:0}20%{opacity:1}100%{opacity:0}}
#dekran h2{position:relative;margin:16px 16px 2px;font-size:28px;text-align:center;color:#ffe27a;text-shadow:0 3px 0 #7a3c00,0 0 18px #0008;transform:scale(.6);opacity:0;transition:all .4s .5s cubic-bezier(.3,1.6,.5,1)}
#dekran p{position:relative;margin:0 16px 20px;font-size:16px;opacity:0;transition:opacity .4s .75s;text-align:center}#dekran p b{color:#9ff0ff}#dekran.cik h2{transform:scale(1);opacity:1}#dekran.cik p{opacity:.95}
#dekran button{position:relative;font:inherit;font-size:22px;font-weight:900;color:#fff;padding:12px 46px;border:0;border-radius:18px;background:linear-gradient(#5fd35a,#2f9a2a);box-shadow:0 5px 0 #1d6a1a,0 8px 14px #0006;opacity:0;pointer-events:none;transition:opacity .3s 1.1s}#dekran.cik button{opacity:1;pointer-events:auto}`;
  document.head.appendChild(s);
}
function yuvaEl() { let k = document.getElementById('dyuva'); if (!k) { stil(); k = document.createElement('div'); k.id = 'dyuva'; k.innerHTML = ANAHTAR; document.body.appendChild(k); } return k; }
// oyundaki anahtar yuvasi (bos anahtar izi); goster=false gizler
export function dostKafes(goster) { if (!DOST) return; const k = yuvaEl(); k.classList.remove('dolu'); k.classList.toggle('on', !!goster); }
// p0 -> p1 yay cizerek ucan anahtar; bitince cb
function ucur(x0, y0, x1, y1, ms, yuk, don, cb) {
  const a = document.createElement('div'); a.className = 'dk-an'; a.innerHTML = ANAHTAR; document.body.appendChild(a);
  const n = 16, kf = []; for (let i = 0; i <= n; i++) { const u = i / n, e = u * u * (3 - 2 * u), x = x0 + (x1 - x0) * e - 26, y = y0 + (y1 - y0) * e - 13 - Math.sin(Math.PI * u) * yuk;
    kf.push({ transform: 'translate(' + x + 'px,' + y + 'px) rotate(' + (u * don) + 'deg) scale(' + (1.5 - 0.5 * u) + ')' }); }
  const an = a.animate(kf, { duration: ms, easing: 'linear', fill: 'forwards' }); an.onfinish = () => cb(a);
}
// oyunda: anahtar kupten (ekrandaki [x, y]) sag ustteki yuvaya ucar
export function dostUc(at, ses) {
  const k = yuvaEl(), r = k.getBoundingClientRect(); if (ses) ses('bonus');
  ucur(at[0], at[1], r.left + r.width / 2, r.top + r.height / 2, 950, 140, 720, (a) => { a.remove(); k.classList.add('dolu'); if (ses) ses('bonus'); if (navigator.vibrate) try { navigator.vibrate(40); } catch (e) {} });
}
// bolum sonu sayfasi: kilitli kafes -> anahtar yuvadan gelir, kilide girer, doner -> kafes acilir -> uye cikar
export function dostEkran(d, n, devam, ses) {
  stil(); const yv = yuvaEl(), yr = yv.getBoundingClientRect(); dostKafes(false);
  const E = document.createElement('div'); E.id = 'dekran';
  E.innerHTML = '<div class="de-isin"></div><div class="de-ust">Mürettebatından biri kafeste!</div><div class="de-kutu"><div class="de-kafes"></div><img class="de-hay" alt=""><div class="de-flas"></div></div>' +
    '<h2>' + d.ad + ' kurtuldu!</h2><p><b>' + d.gorev + '</b> · Mürettebat ' + n + ' / ' + DOSTLAR.length + '</p><button>Harika!</button>';
  document.body.appendChild(E);
  const kf = E.querySelector('.de-kafes'), kafes = (acik) => { const im = new Image(); im.alt = ''; im.onerror = () => { kf.innerHTML = KAFES(acik); }; im.src = '../karakter/dost/kafes_' + (acik ? 'acik' : 'kapali') + '.webp?v=1'; kf.innerHTML = ''; kf.appendChild(im); };
  kafes(false);
  const hy = E.querySelector('.de-hay');
  // once hareketli (Adem'in Gemini videosundan: {id}_anim.webp), yoksa sabit resim, o da yoksa emoji
  let den = 0; hy.onerror = () => { if (!den++) { hy.src = '../karakter/dost/' + d.id + '.webp?v=1'; return; } const s = document.createElement('div'); s.className = 'de-hay em'; s.textContent = d.e; hy.replaceWith(s); };
  hy.src = '../karakter/dost/' + d.id + '_anim.webp?v=1';
  const sx = yr.width ? yr.left + yr.width / 2 : innerWidth - 40, sy = yr.width ? yr.top + yr.height / 2 : 110;
  requestAnimationFrame(() => E.classList.add('on'));
  setTimeout(() => {   // anahtar kilide (kafesin ortasi, biraz alti)
    const kr = E.querySelector('.de-kutu').getBoundingClientRect(), ki = kf.querySelector('img'); let lx = kr.left + kr.width / 2, ly = kr.top + kr.height * 0.56;
    if (ki && ki.naturalWidth) { const ar = ki.naturalWidth / ki.naturalHeight, dw = Math.min(kr.width, kr.height * ar), dh = dw / ar;   // Gemini kafesi: kilit deligi resmin (0.533, 0.746) noktasinda
      lx = kr.left + (kr.width - dw) / 2 + dw * 0.533; ly = kr.top + kr.height - dh + dh * 0.746; }
    if (ses) ses('bonus');
    ucur(sx, sy, lx, ly, 900, 120, 540, (a) => {
      // kilitte ceyrek tur doner, tikirdar
      const t = a.animate([{ transform: a.style.transform || getComputedStyle(a).transform }, { transform: 'translate(' + (lx - 26) + 'px,' + (ly - 13) + 'px) rotate(0deg) scale(1)' }, { transform: 'translate(' + (lx - 26) + 'px,' + (ly - 13) + 'px) rotate(90deg) scale(1)' }], { duration: 650, fill: 'forwards' });
      kf.classList.add('sars'); if (ses) setTimeout(() => ses('slap'), 300);
      t.onfinish = () => { a.remove(); kafes(true); E.classList.add('acik'); if (ses) ses('bonus'); if (navigator.vibrate) try { navigator.vibrate([40, 30, 60]); } catch (e) {}
        setTimeout(() => E.classList.add('cik'), 180); };
    });
  }, 700);
  E.querySelector('button').onclick = () => { E.classList.remove('on'); setTimeout(() => { E.remove(); devam(); }, 300); };
}
