// Foxi Smash v12.20 deneme (?dost=1, Adem 24 Kas): kafesteki dost.
// Her 5 bolumde bir kupun onunde parlayan altin anahtar olur. Kup kirilinca/dusunce anahtar ekranin sagindaki kafese ucar, kafes acilir.
// Hayvan oyun icinde gorunmez: bolum kazanilinca ayri ekranda kafesten cikar ('Baykusu kurtardin!'), sonra kazanma karti gelir.
// Kayit: SV.dost = [kurtarilan id]. Hayvan resimleri karakter/dost/{id}.webp (Adem'in Gemini cizimleri); yoksa emoji yedegi.
export const DOST = /[?&]dost=1/.test(location.search);
export const DOSTLAR = [
  { id: 'baykus', ad: 'Baykuş', b: 'Baykuşu', e: '🦉' }, { id: 'kirpi', ad: 'Kirpi', b: 'Kirpiyi', e: '🦔' }, { id: 'tavsan', ad: 'Tavşan', b: 'Tavşanı', e: '🐰' }, { id: 'kunduz', ad: 'Kunduz', b: 'Kunduzu', e: '🦫' },
  { id: 'kaplumbaga', ad: 'Kaplumbağa', b: 'Kaplumbağayı', e: '🐢' }, { id: 'sincap', ad: 'Sincap', b: 'Sincabı', e: '🐿️' }, { id: 'penguen', ad: 'Penguen', b: 'Pengueni', e: '🐧' }, { id: 'koala', ad: 'Koala', b: 'Koalayı', e: '🐨' }
];
// bu bolumde kurtarilacak dost (yoksa null): 5, 10, 15 ... sirayla; daha once kurtarildiysa kafes yok
export function dostBolum(L, SV) {
  if (!DOST || L < 5 || L % 5) return null;
  const d = DOSTLAR[(L / 5 - 1) % DOSTLAR.length];
  return (SV.dost || []).includes(d.id) ? null : d;
}
const KAFES = '<svg viewBox="0 0 64 72" aria-hidden="true"><ellipse cx="32" cy="67" rx="24" ry="4" fill="#0004"/>' +
  '<path d="M10 22C10 9 54 9 54 22z" fill="#f0b43a" stroke="#6a3c08" stroke-width="2.5"/><circle cx="32" cy="8" r="4.5" fill="none" stroke="#6a3c08" stroke-width="3"/>' +
  '<rect x="10" y="21" width="44" height="40" rx="3" fill="#2a1a3a" opacity=".55"/><text x="32" y="49" text-anchor="middle" font-size="24" font-weight="900" fill="#ffe7a0" font-family="sans-serif" class="dk-s">?</text>' +
  '<g stroke="#c98a1c" stroke-width="3" stroke-linecap="round"><path d="M14 22v38M50 22v38"/></g>' +
  '<g class="dk-kapi"><g stroke="#ffcf4a" stroke-width="3" stroke-linecap="round"><path d="M20 22v38M26 22v38M32 22v38M38 22v38M44 22v38"/></g><rect x="27" y="36" width="10" height="11" rx="2.5" fill="#ffd54a" stroke="#6a3c08" stroke-width="1.8"/><circle cx="32" cy="41" r="1.6" fill="#6a3c08"/></g>' +
  '<rect x="7" y="58" width="50" height="7" rx="3" fill="#a8641e" stroke="#5a2e06" stroke-width="2"/></svg>';
const ANAHTAR = '<svg viewBox="0 0 48 24" aria-hidden="true"><circle cx="9" cy="12" r="7" fill="none" stroke="#ffcf3a" stroke-width="4.5"/><path d="M15 12h28M36 12v7M42 12v6" stroke="#ffcf3a" stroke-width="4.5" stroke-linecap="round"/>' +
  '<circle cx="9" cy="12" r="7" fill="none" stroke="#7a4a00" stroke-width="1.2"/></svg>';
let CSS = false;
function stil() {
  if (CSS) return; CSS = true; const s = document.createElement('style');
  s.textContent = `#dkafes{position:fixed;right:10px;top:calc(env(safe-area-inset-top,0px) + 92px);width:58px;height:66px;z-index:6;pointer-events:none;filter:drop-shadow(0 3px 4px #0007);transition:transform .3s,opacity .3s;opacity:0;transform:scale(.6)}
#dkafes.on{opacity:1;transform:scale(1)}#dkafes svg{width:100%;height:100%}#dkafes .dk-kapi{transform-origin:14px 40px;transition:transform .6s cubic-bezier(.3,1.6,.5,1)}
#dkafes.acik .dk-kapi{transform:perspective(80px) rotateY(-80deg)}#dkafes.acik{animation:dkzip .6s .05s}#dkafes.acik .dk-s{fill:#fff;filter:drop-shadow(0 0 4px #ffd54a)}
@keyframes dkzip{0%{transform:scale(1)}35%{transform:scale(1.3) rotate(-8deg)}70%{transform:scale(.95) rotate(4deg)}100%{transform:scale(1)}}
.dk-an{position:fixed;width:46px;height:23px;z-index:7;pointer-events:none;filter:drop-shadow(0 0 6px #ffd54a) drop-shadow(0 2px 2px #0008)}.dk-an svg{width:100%;height:100%}
#dekran{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 42%,#2b5fa8 0,#12244e 70%);color:#fff;font-family:inherit;opacity:0;transition:opacity .35s}
#dekran.on{opacity:1}#dekran .de-isin{position:absolute;left:50%;top:42%;width:150vmax;height:150vmax;margin:-75vmax 0 0 -75vmax;background:repeating-conic-gradient(rgba(255,230,150,.16) 0 9deg,transparent 9deg 22deg);animation:dedon 18s linear infinite;pointer-events:none}
@keyframes dedon{to{transform:rotate(360deg)}}
#dekran .de-kutu{position:relative;width:min(72vw,300px);height:min(72vw,300px);display:flex;align-items:flex-end;justify-content:center}
#dekran .de-kafes{position:absolute;left:50%;bottom:0;width:62%;margin-left:-31%;opacity:.95}#dekran .de-kafes svg{width:100%;height:auto}#dekran .de-kafes .dk-kapi{transform-origin:14px 40px;transform:perspective(80px) rotateY(-80deg)}#dekran .de-kafes .dk-s{display:none}
#dekran .de-hay{position:relative;z-index:2;max-width:92%;max-height:92%;transform:translateY(40%) scale(.2);opacity:0;transition:transform .7s cubic-bezier(.3,1.5,.5,1),opacity .3s;filter:drop-shadow(0 8px 10px #0008)}
#dekran .de-hay.em{font-size:min(40vw,170px);line-height:1}#dekran.cik .de-hay{transform:translateY(0) scale(1);opacity:1}
#dekran h2{position:relative;margin:18px 16px 4px;font-size:30px;text-align:center;color:#ffe27a;text-shadow:0 3px 0 #7a3c00,0 0 18px #0008;transform:scale(.6);opacity:0;transition:all .4s .45s cubic-bezier(.3,1.6,.5,1)}
#dekran p{position:relative;margin:0 16px 22px;font-size:16px;opacity:0;transition:opacity .4s .7s;text-align:center}#dekran.cik h2{transform:scale(1);opacity:1}#dekran.cik p{opacity:.92}
#dekran button{position:relative;font:inherit;font-size:22px;font-weight:900;color:#fff;padding:12px 44px;border:0;border-radius:18px;background:linear-gradient(#5fd35a,#2f9a2a);box-shadow:0 5px 0 #1d6a1a,0 8px 14px #0006;opacity:0;transition:opacity .3s 1s}#dekran.cik button{opacity:1}`;
  document.head.appendChild(s);
}
function kafesEl() { let k = document.getElementById('dkafes'); if (!k) { stil(); k = document.createElement('div'); k.id = 'dkafes'; k.innerHTML = KAFES; document.body.appendChild(k); } return k; }
export function dostKafes(goster) { if (!DOST) return; const k = kafesEl(); k.classList.remove('acik'); k.classList.toggle('on', !!goster); }
// anahtar kupten (ekrandaki [x, y]) kafese yay cizerek ucar; varinca kafes acilir
export function dostUc(at, ses) {
  const k = kafesEl(), r = k.getBoundingClientRect(), x1 = r.left + r.width / 2 - 23, y1 = r.top + r.height * 0.55 - 12, x0 = at[0] - 23, y0 = at[1] - 12;
  const a = document.createElement('div'); a.className = 'dk-an'; a.innerHTML = ANAHTAR; document.body.appendChild(a);
  const n = 14, kf = []; for (let i = 0; i <= n; i++) { const u = i / n, e = u * u * (3 - 2 * u), x = x0 + (x1 - x0) * e, y = y0 + (y1 - y0) * e - Math.sin(Math.PI * u) * 150;
    kf.push({ transform: 'translate(' + x + 'px,' + y + 'px) rotate(' + (u * 720) + 'deg) scale(' + (1.4 - 0.5 * u) + ')' }); }
  if (ses) ses('bonus');
  const an = a.animate(kf, { duration: 1000, easing: 'linear', fill: 'forwards' });
  an.onfinish = () => { a.remove(); k.classList.add('acik'); if (ses) ses('bonus'); if (navigator.vibrate) try { navigator.vibrate(40); } catch (e) {} };
}
// bolum sonu: ayri ekranda hayvan kafesten cikar; 'Harika!' ile devam (sonra kazanma karti)
export function dostEkran(d, n, devam) {
  stil(); dostKafes(false);
  const E = document.createElement('div'); E.id = 'dekran';
  E.innerHTML = '<div class="de-isin"></div><div class="de-kutu"><div class="de-kafes">' + KAFES + '</div><img class="de-hay" alt=""></div>' +
    '<h2>' + d.b + ' kurtardın!</h2><p>Dostların: ' + n + ' / ' + DOSTLAR.length + '</p><button>Harika!</button>';
  document.body.appendChild(E);
  const im = E.querySelector('.de-hay');
  im.onerror = () => { const s = document.createElement('div'); s.className = 'de-hay em'; s.textContent = d.e; im.replaceWith(s); };
  im.src = '../karakter/dost/' + d.id + '.webp?v=1';
  requestAnimationFrame(() => { E.classList.add('on'); setTimeout(() => E.classList.add('cik'), 350); });
  E.querySelector('button').onclick = () => { E.classList.remove('on'); setTimeout(() => { E.remove(); devam(); }, 300); };
}
