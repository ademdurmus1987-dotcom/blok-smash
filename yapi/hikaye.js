// Foxi Smash v12.42 (Adem 25 Kas): hikaye kartlari. Bolum basinda (bir kez) tam ekran dikey resim + kisa yazi; dokununca kapanir.
// Resimler: karakter/kart/{id}.webp (Adem'in Gemini cizimleri, 720x1280). Gorulenler SV.kart = [id]. Kapatma ?hikaye=0; ?sv= deneme baglantisinda her seferinde cikar.
export const HIKAYE = !/[?&]hikaye=0/.test(location.search);
export const KARTLAR = [
  { L: 1, id: 'firtina', bas: 'Fırtına!', yazi: 'Dev bir fırtına Foxi\'nin tayfasını dört bir yana savurdu. Hepsini tek tek bulmalıyız!' },
  { L: 3, id: 'rako', bas: 'Rakun Rako', yazi: 'Bu kuleleri o diziyor! Parlak altınlara bayılıyor ve tayfamızı kafeslere kapatıyor. Kulelerini yık!' }
];
let CSS = false;
function stil() {
  if (CSS) return; CSS = true; const s = document.createElement('style');
  s.textContent = `#hkart{position:fixed;inset:0;z-index:70;background:#061024;display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .35s;touch-action:manipulation}
#hkart.on{opacity:1}#hkart img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.08);transition:transform 6s ease-out}#hkart.on img{transform:scale(1)}
#hkart .hk-alt{position:relative;width:100%;padding:70px 20px calc(env(safe-area-inset-bottom,0px) + 22px);background:linear-gradient(transparent,rgba(4,10,30,.82) 38%,rgba(4,10,30,.95));color:#fff;text-align:center;transform:translateY(30px);opacity:0;transition:all .45s .25s}
#hkart.on .hk-alt{transform:none;opacity:1}
#hkart h2{margin:0 0 6px;font:400 28px/1.1 var(--disp,system-ui);color:#ffe27a;text-shadow:0 3px 0 #7a3c00}
#hkart p{margin:0 auto 14px;max-width:360px;font-size:16px;line-height:1.4}
#hkart button{font:inherit;font-size:20px;font-weight:900;color:#fff;padding:11px 44px;border:0;border-radius:16px;background:linear-gradient(#5fd35a,#2f9a2a);box-shadow:0 5px 0 #1d6a1a,0 8px 14px #0006}`;
  document.head.appendChild(s);
}
// bu bolumun karti varsa ve gorulmediyse gosterir; true doner
export function hikayeKart(L, SV, save) {
  if (!HIKAYE) return false;
  const k = KARTLAR.find((x) => x.L === L), gor = SV.kart || [];
  if (!k || (gor.includes(k.id) && !/[?&]sv=/.test(location.search))) return false;
  stil(); const E = document.createElement('div'); E.id = 'hkart';
  E.innerHTML = '<img alt="" src="../karakter/kart/' + k.id + '.webp?v=1"><div class="hk-alt"><h2>' + k.bas + '</h2><p>' + k.yazi + '</p><button>Devam</button></div>';
  document.body.appendChild(E); requestAnimationFrame(() => requestAnimationFrame(() => E.classList.add('on')));
  if (!gor.includes(k.id)) { SV.kart = gor.concat(k.id); save(); }
  let kapandi = false; const kapat = (e) => { if (e) e.stopPropagation(); if (kapandi) return; kapandi = true; E.classList.remove('on'); setTimeout(() => E.remove(), 350); };
  E.addEventListener('pointerdown', (e) => e.stopPropagation()); E.addEventListener('click', kapat);
  return true;
}
