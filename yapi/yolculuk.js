// Foxi Smash v12.44 (Adem 25 Kas): "Foxi'nin Yolculugu". Gemi denizde; her kurtarmadan sonra o parca oynar (yeni uye gemiye katilir, gemi siradaki adaya acilir).
// Videolar: karakter/yolculuk/parca{0..8}.mp4 (540x960, sesli; Higgsfield Seedance 2.5, Adem claude.ai sohbetinde sinirsiz haktan uretti).
// parca0 = Foxi yalniz, parca N = N. uye katildi (DOSTLAR sirasi). Kapatma ?yol=0.
export const YOLCULUK = !/[?&]yol=0/.test(location.search);
const YOL = (i) => '../karakter/yolculuk/parca' + i + '.mp4?v=1';
export function yolOnYukle(i) { if (YOLCULUK) fetch(YOL(i)).catch(() => {}); }
let CSS = false;
function stil() {
  if (CSS) return; CSS = true; const s = document.createElement('style');
  s.textContent = `#yolk{position:fixed;inset:0;z-index:72;background:#061024;opacity:0;transition:opacity .35s;touch-action:manipulation}
#yolk.on{opacity:1}#yolk video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity .25s}#yolk video.gec{opacity:0}
#yolk .yk-oy{position:absolute;left:50%;top:45%;width:96px;height:96px;margin:-48px 0 0 -48px;border:4px solid #fff;border-radius:50%;background:#0008;color:#fff;font-size:40px;line-height:1;padding:0 0 0 8px;display:none;box-shadow:0 6px 20px #0008}#yolk.dur .yk-oy{display:block;animation:ykn 1.2s ease-in-out infinite}@keyframes ykn{50%{transform:scale(1.08)}}
#yolk .yk-gec{position:absolute;right:12px;top:calc(env(safe-area-inset-top,0px) + 12px);font:inherit;font-size:15px;font-weight:800;color:#fff;padding:7px 14px;border:2px solid #fff8;border-radius:20px;background:#0006}
#yolk .yk-alt{position:absolute;left:0;right:0;bottom:0;padding:70px 20px calc(env(safe-area-inset-bottom,0px) + 22px);background:linear-gradient(transparent,rgba(4,10,30,.82) 38%,rgba(4,10,30,.95));color:#fff;text-align:center;transform:translateY(30px);opacity:0;transition:all .45s;pointer-events:none}
#yolk.bitti .yk-alt{transform:none;opacity:1;pointer-events:auto}
#yolk h2{margin:0 0 6px;font:400 26px/1.15 var(--disp,system-ui);color:#ffe27a;text-shadow:0 3px 0 #7a3c00}
#yolk p{margin:0 auto 14px;max-width:360px;font-size:16px;line-height:1.4}
#yolk .yk-dv{font:inherit;font-size:20px;font-weight:900;color:#fff;padding:11px 44px;border:0;border-radius:16px;background:linear-gradient(#5fd35a,#2f9a2a);box-shadow:0 5px 0 #1d6a1a,0 8px 14px #0006}`;
  document.head.appendChild(s);
}
// liste: oynatilacak parca numaralari; bas/yazi: sonda cikan yazi; devam: kapaninca; kis(b): oyun muzigini kisar
export function yolculukOynat(liste, bas, yazi, devam, kis) {
  if (!YOLCULUK || !liste.length) { if (devam) devam(); return false; }
  stil(); if (kis) kis(true);
  const E = document.createElement('div'); E.id = 'yolk';
  E.innerHTML = '<video playsinline webkit-playsinline preload="auto"></video><button class="yk-oy" aria-label="Oynat">▶</button><button class="yk-gec">Geç ›</button><div class="yk-alt"><h2></h2><p></p><button class="yk-dv">Devam</button></div>';
  E.querySelector('h2').textContent = bas || ''; E.querySelector('p').textContent = yazi || '';
  document.body.appendChild(E); requestAnimationFrame(() => E.classList.add('on'));
  const v = E.querySelector('video'); let i = 0, kapandi = false;
  // v12.44b (Adem: 'video oynatilmiyor'): telefon kendiliginden baslatmaya izin vermezse (iPhone, dusuk guc modu) ortada Oynat dugmesi; dokununca sesli baslar
  const dur = () => E.classList.add('dur');
  const oynat = () => { const t = v.play(); if (t && t.then) t.then(() => E.classList.remove('dur')).catch(() => { v.muted = true; v.play().then(() => E.classList.remove('dur')).catch(dur); }); };
  v.addEventListener('playing', () => E.classList.remove('dur'));
  setTimeout(() => { if (!kapandi && v.paused && !E.classList.contains('bitti')) dur(); }, 2500);
  const yukle = (k) => { v.src = YOL(liste[k]); v.load(); oynat(); if (liste[k + 1] != null) yolOnYukle(liste[k + 1]); };
  const son = () => { E.classList.add('bitti'); E.querySelector('.yk-gec').style.display = 'none'; };
  const kapat = () => { if (kapandi) return; kapandi = true; v.pause(); if (kis) kis(false); E.classList.remove('on'); setTimeout(() => { E.remove(); if (devam) devam(); }, 350); };
  v.addEventListener('ended', () => { if (++i < liste.length) { v.classList.add('gec'); setTimeout(() => { yukle(i); v.classList.remove('gec'); }, 220); } else son(); });
  v.addEventListener('error', son);
  E.querySelector('.yk-oy').onclick = (e) => { e.stopPropagation(); v.muted = false; E.classList.remove('dur'); v.play().catch(() => { v.muted = true; v.play().catch(dur); }); };
  E.querySelector('.yk-gec').onclick = (e) => { e.stopPropagation(); kapat(); };
  E.querySelector('.yk-dv').onclick = (e) => { e.stopPropagation(); kapat(); };
  E.addEventListener('pointerdown', (e) => e.stopPropagation());
  yukle(0); return true;
}
