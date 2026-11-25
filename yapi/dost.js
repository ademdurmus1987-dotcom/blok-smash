// Foxi Smash v12.21 deneme (?dost=1, Adem 24 Kas): Foxi korsan murettebatini kurtariyor.
// Oyunda: her 5 bolumde bir kupun onunde altin anahtar rozeti. Kup kirilinca/dusunce anahtar ekranin sag ustundeki anahtar yuvasina ucar (kafes oyunda YOK).
// Bolum kazanilinca ayri sayfa: ortada kilitli kafes, anahtar gelip kilide girer, doner, kafes acilir, murettebat uyesi sevinerek cikar; sonra kazanma karti.
// Kayit: SV.dost = [kurtarilan id]. Resimler (Adem'in Gemini cizimleri): karakter/dost/{id}.webp, kafes karakter/dost/kafes_kapali.webp + kafes_acik.webp; yoksa kodla cizim / emoji yedegi.
export const DOST = !/[?&]dost=0/.test(location.search);   // v12.26: VARSAYILAN (Adem: 'oyunda yok'); kapatmak icin ?dost=0
export const DOSTLAR = [
  { id: 'papagan', ad: 'Papağan Pako', gorev: 'Gözcü', e: '🦜' },
  { id: 'maymun', ad: 'Maymun Miko', gorev: 'Direkçi', e: '🐒' },   // v12.38: kaplumbaga yerine (Flow videoda kabugu kayboluyordu)
  { id: 'ahtapot', ad: 'Ahtapot Ahmo', gorev: 'Aşçı', e: '🐙' },
  { id: 'kunduz', ad: 'Kunduz Kundi', gorev: 'Marangoz', e: '🦫' },
  { id: 'penguen', ad: 'Penguen Pengo', gorev: 'Gülle Ustası', e: '🐧' },
  { id: 'kirpi', ad: 'Kirpi Diken', gorev: 'Haritacı', e: '🦔' },
  { id: 'kurbaga', ad: 'Kurbağa Vırak', gorev: 'Borazancı', e: '🐸' },
  { id: 'kedi', ad: 'Kedi Mırmır', gorev: 'Ambar Bekçisi', e: '🐱' }   // v12.38: fok yerine (Flow videoda kulak cikiyordu)
];
// v12.31 (Adem'in Gemini videolari: uye kafeste, anahtar kilide girer, kafes acilir, uye sevincle cikar; kendi sesiyle):
// karakter/dost/video/{id}.mp4 (sessiz, 540x960) + {id}.mp3. Video canli yesil ayiklamayla (WebGL) oynar, ses oyunun ses zincirinden.
export const VIDEOLU = new Set(['papagan', 'maymun', 'ahtapot', 'kunduz', 'penguen', 'kirpi', 'kurbaga', 'kedi']);
const VYOL = (id, uz) => '../karakter/dost/video/' + id + '.' + uz + '?v=1';
export function dostOnYukle(d) { if (!d || !VIDEOLU.has(d.id)) return; for (const u of ['mp4', 'mp3']) fetch(VYOL(d.id, u)).catch(() => {}); }
// v12.41 (Adem 25 Kas: '100 bolumde bir kurtarma, cok sayida murettebat sikinti'): takvim 10 (ilk tanisma), 100, 200 ... 700. Uye kurtarilana kadar o bolumde anahtar cikar.
export const TAKVIM = [10, 100, 200, 300, 400, 500, 600, 700];
// her uyenin kucuk yardimi (oyun.js / merkez.js / insa.js dostVar ile bakar)
export const YARDIM = { papagan: 'Hazine sandığı 5 yerine 4 bölümde açılır', maymun: 'Hazine sandığından %25 fazla altın', ahtapot: 'Günlük ödülde %25 fazla altın',
  kunduz: 'Gemi inşası %10 ucuz', penguen: 'Her bölümde +1 top', kirpi: 'Bölüm altınına +%10', kurbaga: '3 yıldızda +10 altın', kedi: 'Devam etmek %20 ucuz' };
export const dostVar = (SV, id) => DOST && (SV.dost || []).includes(id);
// siradaki kurtarilmamis uye ve bolumu (yoksa null)
export function dostSonraki(SV) { const ds = SV.dost || []; for (let i = 0; i < DOSTLAR.length; i++) if (!ds.includes(DOSTLAR[i].id)) return { d: DOSTLAR[i], L: TAKVIM[i] }; return null; }
// bu bolumde kurtarilacak uye (yoksa null); ?sv= deneme baglantisinda kurtarilmis uye yine cikar
export function dostBolum(L, SV) {
  const i = TAKVIM.indexOf(L); if (!DOST || i < 0) return null;
  const d = DOSTLAR[i]; return (SV.dost || []).includes(d.id) && !/[?&]sv=/.test(location.search) ? null : d;
}
const ANAHTAR = '<img src="../karakter/dost/anahtar.webp?v=1" alt="" draggable="false">';   // v12.25: Adem'in Gemini anahtari (kulpta tilki patisi)
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
#dyuva.on{opacity:1;transform:scale(1)}#dyuva img{width:42px;height:18px;opacity:.28;filter:grayscale(1) brightness(2);transform:rotate(-35deg)}#dyuva.dolu img{opacity:1;filter:none}#dyuva.dolu{animation:dyzip .6s;box-shadow:0 0 16px #ffd54a,0 3px 6px #0007}
@keyframes dyzip{0%{transform:scale(1)}35%{transform:scale(1.35) rotate(-10deg)}70%{transform:scale(.95)}100%{transform:scale(1)}}
.dk-an{position:fixed;left:0;top:0;width:60px;height:26px;z-index:61;pointer-events:none;filter:drop-shadow(0 0 7px #ffd54a) drop-shadow(0 2px 2px #0008)}.dk-an img{width:100%;height:100%;display:block}
#dekran{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 40%,#2a63ad 0,#102048 72%);color:#fff;opacity:0;transition:opacity .35s;overflow:hidden}
#dekran.on{opacity:1}#dekran .de-vid{position:relative;width:min(92vw,calc(62vh * 9 / 16));aspect-ratio:9/16;margin-top:-4vh}#dekran .de-vid canvas{width:100%;height:100%;display:block}#dekran.vid h2{margin-top:-2vh}#dekran .de-isin{position:absolute;left:50%;top:40%;width:150vmax;height:150vmax;margin:-75vmax 0 0 -75vmax;background:repeating-conic-gradient(rgba(255,230,150,.15) 0 9deg,transparent 9deg 22deg);animation:dedon 18s linear infinite;pointer-events:none;opacity:0;transition:opacity .6s}
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
  const n = 16, kf = []; for (let i = 0; i <= n; i++) { const u = i / n, e = u * u * (3 - 2 * u), x = x0 + (x1 - x0) * e - 30, y = y0 + (y1 - y0) * e - 13 - Math.sin(Math.PI * u) * yuk;
    kf.push({ transform: 'translate(' + x + 'px,' + y + 'px) rotate(' + (u * don) + 'deg) scale(' + (1.5 - 0.5 * u) + ')' }); }
  const an = a.animate(kf, { duration: ms, easing: 'linear', fill: 'forwards' }); an.onfinish = () => cb(a);
}
// oyunda: anahtar kupten (ekrandaki [x, y]) sag ustteki yuvaya ucar
export function dostUc(at, ses) {
  const k = yuvaEl(), r = k.getBoundingClientRect(); if (ses) ses('bonus');
  ucur(at[0], at[1], r.left + r.width / 2, r.top + r.height / 2, 950, 140, 720, (a) => { a.remove(); k.classList.add('dolu'); if (ses) ses('bonus'); if (navigator.vibrate) try { navigator.vibrate(40); } catch (e) {} });
}
// bolum sonu sayfasi: kilitli kafes -> anahtar yuvadan gelir, kilide girer, doner -> kafes acilir -> uye cikar
export function dostEkran(d, n, devam, ses, kayit) {
  stil(); if (VIDEOLU.has(d.id) && !/[?&]dvid=0/.test(location.search) && videoEkran(d, n, devam, kayit)) { dostKafes(false); return; }
  dostEkranResim(d, n, devam, ses);
}
function dostEkranResim(d, n, devam, ses) {
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
      lx = kr.left + (kr.width - dw) / 2 + dw * 0.533; ly = kr.top + kr.height - dh + dh * 0.738; }
    if (ses) ses('bonus');
    // v12.28 (Adem: 'anahtar delige girip kilidi acmiyor, yuzeyinde yapmaya calisiyor'): anahtar ucu delige hizali gelir, saga kayarak ICERI girer
    // (delikten sonrasi kirpilir, disarida kulp kalir), sonra kendi ekseninde ceyrek tur doner (dikey basiklasir), mandal tiklar, kafes acilir
    // v12.30 (Adem: 'bakis acisi ters dusmesin'): kafes tam onden; anahtarin govdesi delikte kaybolur (delikten sagi kirpilir), delikte yalniz kulp kalir,
    // sonra kulp ekran duzleminde ceyrek tur doner (onden bakan birinin gordugu). Kulp merkezi anahtar resminde soldan ~%19.
    const W = 60, KX = 11.5, xa = lx - W + 2, xb = lx - KX, tr = (x, r, k) => 'translate(' + x + 'px,' + (ly - 13) + 'px) rotate(' + r + 'deg) scale(' + k + ')', kes = (x) => 'inset(-20px ' + Math.max(0, x + W - Math.max(lx, x + 2 * KX)) + 'px -20px -20px)';   // kulp (soldan 2*KX) hep gorunur, govde delikte kaybolur
    ucur(sx, sy, xa + 30, ly, 900, 120, 720, (a) => {
      a.style.transformOrigin = KX + 'px 13px';
      const t = a.animate([
        { transform: tr(xa, 0, 1), clipPath: kes(xa), offset: 0 },
        { transform: tr(xb, 0, 1), clipPath: kes(xb), offset: 0.42, easing: 'cubic-bezier(.35,.9,.4,1)' },
        { transform: tr(xb, 0, 0.92), clipPath: kes(xb), offset: 0.52 },
        { transform: tr(xb, 90, 0.92), clipPath: kes(xb), offset: 0.85, easing: 'cubic-bezier(.5,0,.3,1)' },
        { transform: tr(xb, 90, 0.92), clipPath: kes(xb), offset: 1 }], { duration: 1150, fill: 'forwards' });
      if (ses) { ses('kilitgir'); setTimeout(() => { kf.classList.add('sars'); ses('kilitac'); }, 960); }   // v12.25 gercek kilit sesleri (Kenney CC0)
      t.onfinish = () => { a.remove(); kafes(true); E.classList.add('acik'); if (ses) { ses('kafesac'); setTimeout(() => ses('bonus'), 250); } if (navigator.vibrate) try { navigator.vibrate([40, 30, 60]); } catch (e) {}
        setTimeout(() => E.classList.add('cik'), 180); };
    });
  }, 700);
  E.querySelector('button').onclick = () => { E.classList.remove('on'); setTimeout(() => { E.remove(); devam(); }, 300); };
}

// v12.31: videolu kurtarma (uye kafeste -> anahtar -> kafes acilir -> uye cikar). Video bitince son kare kalir, yazi ve dugme gelir.
// kayit(url): oyunun ses zincirinden mp3 calar (AudioContext ilk dokunusta acildi; iPhone'da video sesi kilitli olabilir).
function videoEkran(d, n, devam, kayit) {
  const E = document.createElement('div'); E.id = 'dekran'; E.className = 'vid';
  E.innerHTML = '<div class="de-isin"></div><div class="de-vid"><canvas></canvas></div><h2>' + d.ad + ' kurtuldu!</h2><p><b>' + d.gorev + '</b> · Mürettebat ' + n + ' / ' + DOSTLAR.length + '</p><button>Harika!</button>';
  const cv = E.querySelector('canvas'), gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return false;
  document.body.appendChild(E);
  const vid = document.createElement('video'); vid.muted = true; vid.playsInline = true; vid.setAttribute('playsinline', ''); vid.setAttribute('webkit-playsinline', ''); vid.preload = 'auto'; vid.crossOrigin = 'anonymous'; vid.src = VYOL(d.id, 'mp4');
  const sh = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); return o; }, pg = gl.createProgram();
  gl.attachShader(pg, sh(gl.VERTEX_SHADER, 'attribute vec2 p; varying vec2 u; void main(){ u = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5); gl_Position = vec4(p, 0.0, 1.0); }'));
  gl.attachShader(pg, sh(gl.FRAGMENT_SHADER, `precision mediump float; uniform sampler2D v; uniform vec2 px; varying vec2 u;
    float k(vec3 c){ return c.g - max(c.r, c.b); }
    void main(){ vec3 c = texture2D(v, u).rgb; float g = k(c);
      float g2 = max(max(k(texture2D(v, u + vec2(px.x, 0.0)).rgb), k(texture2D(v, u - vec2(px.x, 0.0)).rgb)), max(k(texture2D(v, u + vec2(0.0, px.y)).rgb), k(texture2D(v, u - vec2(0.0, px.y)).rgb)));
      float a = 1.0 - smoothstep(0.06, 0.16, mix(g, g2, 0.35));
      float m = max(c.r, c.b); c.g = min(c.g, m + 0.03);
      gl_FragColor = vec4(c * a, a); }`));
  gl.linkProgram(pg); gl.useProgram(pg);
  const bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const lp = gl.getAttribLocation(pg, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
  const tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
  for (const [a, b] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, a, b);
  gl.uniform2f(gl.getUniformLocation(pg, 'px'), 1 / 540, 1 / 960);
  const boyut = () => { const pr = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(cv.clientWidth * pr); cv.height = Math.round(cv.clientHeight * pr); gl.viewport(0, 0, cv.width, cv.height); };
  const ciz = () => { if (vid.readyState < 2) return; gl.bindTexture(gl.TEXTURE_2D, tx); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, vid); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
  let bitti = false, basladi = false; const son = () => { if (bitti) return; bitti = true; ciz(); E.classList.add('acik', 'cik'); if (navigator.vibrate) try { navigator.vibrate([40, 30, 60]); } catch (e) {} };
  const kare = () => { if (!E.isConnected) return; if (!bitti) { ciz(); requestAnimationFrame(kare); } };
  const basla = () => { if (basladi) return; basladi = true; boyut(); vid.play().then(() => { if (kayit) kayit(VYOL(d.id, 'mp3')); requestAnimationFrame(kare); }).catch(() => son()); };
  vid.addEventListener('canplaythrough', basla); vid.addEventListener('loadeddata', () => setTimeout(basla, 1500)); vid.addEventListener('ended', son);
  vid.addEventListener('error', () => { E.remove(); const g = document.getElementById('dekran'); if (g) g.remove(); dostEkranResim(d, n, devam); });
  setTimeout(() => { if (!basladi) basla(); }, 6000); setTimeout(() => { if (!bitti) son(); }, 16000);   // takilirsa dugme yine de gelir
  vid.load(); requestAnimationFrame(() => E.classList.add('on'));
  E.querySelector('button').onclick = () => { vid.pause(); E.classList.remove('on'); setTimeout(() => { E.remove(); devam(); }, 300); };
  return true;
}
