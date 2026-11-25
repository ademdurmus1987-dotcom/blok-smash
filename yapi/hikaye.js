// Foxi Smash v12.43: 8. bolum Pako kafeste karti (Higgsfield). v12.42 (Adem 25 Kas): hikaye kartlari. Bolum basinda (bir kez) tam ekran dikey resim + kisa yazi; dokununca kapanir.
// Resimler: karakter/kart/{id}.webp (Adem'in Gemini cizimleri, 720x1280). Gorulenler SV.kart = [id]. Kapatma ?hikaye=0; ?sv= deneme baglantisinda her seferinde cikar.
export const HIKAYE = !/[?&]hikaye=0/.test(location.search);
// v12.52 (Adem 25 Kas): v'si olan kart tam ekran video olarak oynar (Higgsfield Seedance), baslik ve yazi videonun sonunda cikar. Eski resimli kart: ?hvid=0
import { YOLCULUK, yolculukOynat } from './yolculuk.js?v=3';
const HVID = YOLCULUK && !/[?&]hvid=0/.test(location.search);
export const KARTLAR = [
  { L: 1, id: 'firtina', v: 1, bas: 'Fırtına!', yazi: 'Dev bir fırtına Foxi\'nin tayfasını dört bir yana savurdu. Hepsini tek tek bulmalıyız!' },
  { L: 3, id: 'rako', v: 1, bas: 'Rakun Rako', yazi: 'Bu kuleleri o diziyor! Parlak altınlara bayılıyor ve tayfamızı kafeslere kapatıyor. Kulelerini yık!' },
  { L: 5, id: 'pako_kafes', bas: 'Pako kafeste!', yazi: 'Sinsi Rako gözcümüz Papağan Pako\'yu kafese kilitledi! Kuleleri yıkmaya devam et, anahtarı bulup onu kurtaracağız.' },
  // v12.53 (Adem 25 Kas: 'ara kartlarda tayfa ile ilgili bilgi verelim'): gemi ipucu + her kurtarmadan once tayfa ipucu (resim: kurtarma videosunun acilis karesi)
  { L: 2, id: 'gemi', bas: 'Önce bir gemi lazım!', yazi: 'Fırtına gemimizi parçaladı. Bölüm geç, altın topla ve İnşa sekmesinde yeni gemini yap. Gemi bitince tayfanı toplamaya denize açılacaksın!' },
  { L: 8, id: 'ipucu_papagan', bas: 'Fenerde bir ışık!', yazi: 'Gözcümüz Papağan Pako fenerin tepesinde kafeste! 10. bölümde kurtar. Pako, hazine sandığını 5 yerine 4 bölümde açar.' },
  { L: 90, id: 'ipucu_maymun', bas: 'Şelalede bir kafes!', yazi: 'Direkçi Maymun Miko şelalenin üstünde sallanıyor! 100. bölümde kurtar. Miko, hazine sandığından %25 fazla altın çıkarır.' },
  { L: 190, id: 'ipucu_ahtapot', bas: 'Batık gemide biri var!', yazi: 'Aşçı Ahtapot Ahmo batık geminin mutfağında kafeste! 200. bölümde kurtar. Ahmo, günlük ödülde %25 fazla altın getirir.' },
  { L: 290, id: 'ipucu_kunduz', bas: 'Nehirde bir sal!', yazi: 'Marangoz Kunduz Kundi akıntıya kapılan salda kafeste! 300. bölümde kurtar. Kundi, gemi inşasını %10 ucuzlatır.' },
  { L: 390, id: 'ipucu_penguen', bas: 'Buz mağarası!', yazi: 'Gülle Ustası Penguen Pengo buzun içinde kafeste! 400. bölümde kurtar. Pengo, her bölümde +1 top verir.' },
  { L: 490, id: 'ipucu_kirpi', bas: 'Tapınak zindanı!', yazi: 'Haritacı Kirpi Diken eski tapınağın zindanında kafeste! 500. bölümde kurtar. Diken, bölüm altınına %10 ekler.' },
  { L: 590, id: 'ipucu_kurbaga', bas: 'Ateşböcekli bataklık!', yazi: 'Borazancı Kurbağa Vırak nilüfer yaprağında kafeste! 600. bölümde kurtar. Vırak, 3 yıldızda +10 altın kazandırır.' },
  { L: 690, id: 'ipucu_kedi', bas: 'Rako\'nun gemisi!', yazi: 'Ambar Bekçisi Kedi Mırmır, Rako\'nun kendi gemisinin ambarında! 700. bölümde son kurtarma. Mırmır, devam etmeyi %20 ucuzlatır.' }
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
export function hikayeKart(L, SV, save, kis) {
  if (!HIKAYE) return false;
  const k = KARTLAR.find((x) => x.L === L), gor = SV.kart || [];
  if (!k || (gor.includes(k.id) && !/[?&]sv=/.test(location.search))) return false;
  if (k.v && HVID) { if (!gor.includes(k.id)) { SV.kart = gor.concat(k.id); save(); } yolculukOynat(['../karakter/kart/' + k.id + '.mp4?v=' + k.v], k.bas, k.yazi, null, kis); return true; }
  stil(); const E = document.createElement('div'); E.id = 'hkart';
  E.innerHTML = '<img alt="" src="../karakter/kart/' + k.id + '.webp?v=1"><div class="hk-alt"><h2>' + k.bas + '</h2><p>' + k.yazi + '</p><button>Devam</button></div>';
  document.body.appendChild(E); requestAnimationFrame(() => requestAnimationFrame(() => E.classList.add('on')));
  if (!gor.includes(k.id)) { SV.kart = gor.concat(k.id); save(); }
  let kapandi = false; const kapat = (e) => { if (e) e.stopPropagation(); if (kapandi) return; kapandi = true; E.classList.remove('on'); setTimeout(() => E.remove(), 350); };
  E.addEventListener('pointerdown', (e) => e.stopPropagation()); E.addEventListener('click', kapat);
  return true;
}
