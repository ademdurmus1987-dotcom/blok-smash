// Blok Smash v3.0 (10 Kas 2026) - MERKEZ: oyunun kabugu.
// Adem'in referans videosundaki akis (acilis -> ana sayfa -> bolum karti -> oyun -> kazanma sahnesi -> ana sayfa), Blok Smash'in kendi
// kimligiyle: Korsan Tilki, gun batimi denizi, lacivert + altin panolar, hazine haritasi.
// Icerik: ana sayfa (3B tilki, ust bar, yan dugmeler, alt menu), magaza, hazine haritasi, bolum karti, gunluk gorevler, gunluk odul,
// hazine sandigi, profil + istatistik, ayarlar / duraklatma, kazanma ve kaybetme sahneleri.
// oyun.js bu dosyayi merkezKur(A) ile baglar; A oyunun kayit, ses ve bolum islevlerini verir. Korsan modunda ve testte kurulmaz.
import * as THREE from '../three.module.min.js';
import { KARAKTERLER, AVATARLAR, profilOku, profilYaz, acikMi, seciliKarakter } from '../karakter/profil.js?v=1';

const $ = (id) => document.getElementById(id);
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const svg = (ic, vb = 48) => '<svg viewBox="0 0 ' + vb + ' ' + vb + '" aria-hidden="true">' + ic + '</svg>';
const YILDIZ_YOL = 'M24 3l6.5 13.2 14.5 2.1-10.5 10.2 2.5 14.5L24 36.2 11 43l2.5-14.5L3 18.3l14.5-2.1z';
// simgeler: emoji yerine kendi cizimlerimiz (her telefonda ayni gorunur)
const IK = {
  yildiz: svg('<path d="' + YILDIZ_YOL + '" fill="#ffc81e" stroke="#7a3a00" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 9.5l4.2 8.6 9.4 1.4" fill="none" stroke="#fff6b8" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>'),
  yildizBos: svg('<path d="' + YILDIZ_YOL + '" fill="#39407e" stroke="#12173f" stroke-width="2.5" stroke-linejoin="round"/>'),
  disli: svg('<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>', 24),
  kilit: svg('<path d="M15 21v-6a9 9 0 0 1 18 0v6" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><rect x="9" y="20" width="30" height="23" rx="5" fill="#ffc81e" stroke="#7a3a00" stroke-width="2.5"/><circle cx="24" cy="30" r="3.4" fill="#7a3a00"/><path d="M24 31v6" stroke="#7a3a00" stroke-width="3.4" stroke-linecap="round"/>'),
  // dumen: ana sayfa
  ev: '<img class="ik3" src="ikon/ev.webp?v=1" alt="" draggable="false">',
  // altin kesesi: magaza
  magaza: '<img class="ik3" src="ikon/magaza.webp?v=1" alt="" draggable="false">',
  harita: '<img class="ik3" src="ikon/harita.webp?v=1" alt="" draggable="false">',
  gorev: svg('<circle cx="22" cy="26" r="19" fill="#e8413c" stroke="#6a0a1c" stroke-width="2.5"/><circle cx="22" cy="26" r="13.5" fill="#fff"/><circle cx="22" cy="26" r="8.5" fill="#e8413c"/><circle cx="22" cy="26" r="3.5" fill="#fff"/><path d="M22 26L41 7" stroke="#4a2406" stroke-width="3.2" stroke-linecap="round"/><path d="M36 4l1 7 7 1-5 5-6-1-2-7z" fill="#ffc81e" stroke="#7a3a00" stroke-width="2" stroke-linejoin="round"/>'),
  hediye: svg('<rect x="7" y="21" width="34" height="22" rx="3" fill="#e8413c" stroke="#6a0a1c" stroke-width="2.5"/><rect x="4" y="13" width="40" height="10" rx="3" fill="#ff6a5a" stroke="#6a0a1c" stroke-width="2.5"/><rect x="20" y="13" width="8" height="30" fill="#ffd23f" stroke="#8a5a00" stroke-width="2"/><path d="M24 13c-9-11-17-3-9 0zM24 13c9-11 17-3 9 0z" fill="#ffd23f" stroke="#8a5a00" stroke-width="2.2" stroke-linejoin="round"/>'),
  sandik: svg('<path d="M6 23c0-10 6-14 18-14s18 4 18 14z" fill="#c07a30" stroke="#4a2406" stroke-width="2.5" stroke-linejoin="round"/><rect x="6" y="22" width="36" height="20" rx="3" fill="#9a5a20" stroke="#4a2406" stroke-width="2.5"/><path d="M14.5 10v32M33.5 10v32" stroke="#ffc81e" stroke-width="4.5"/><rect x="6" y="20.5" width="36" height="5" fill="#ffc81e" stroke="#7a4a00" stroke-width="1.6"/><rect x="19.5" y="19" width="9" height="11" rx="2.5" fill="#ffe36b" stroke="#7a4a00" stroke-width="2"/><circle cx="24" cy="24.5" r="1.8" fill="#7a4a00"/>'),
  capa: svg('<g fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="#0c1c58" stroke-width="9"><circle cx="24" cy="9.5" r="4"/><path d="M24 14v27M15 21h18M8 29c1 8 8 12 16 12s15-4 16-12"/></g><g stroke="#fff" stroke-width="4.5"><circle cx="24" cy="9.5" r="4"/><path d="M24 14v27M15 21h18M8 29c1 8 8 12 16 12s15-4 16-12"/></g></g>'),
  alev: svg('<path d="M25 3c1 9 12 13 12 26a13 13 0 0 1-26 0c0-6 3-10 6-13 0 4 2 6 4 6 0-7-1-13 4-19z" fill="#ff7a1c" stroke="#7a1400" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 24c1 4 6 6 6 11a6 6 0 0 1-12 0c0-4 4-6 6-11z" fill="#ffe36b"/>'),
  blok: svg('<path d="M24 4l18 9v21l-18 10L6 34V13z" fill="#3d7bff" stroke="#0c2a78" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 4l18 9-18 10L6 13z" fill="#8fc0ff" stroke="#0c2a78" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 23v21" stroke="#0c2a78" stroke-width="2.5"/>'),
  top: svg('<circle cx="24" cy="26" r="17" fill="#3a3f5c" stroke="#12142a" stroke-width="2.5"/><path d="M13 21a12 12 0 0 1 10-8" fill="none" stroke="#aab0d8" stroke-width="4" stroke-linecap="round"/><path d="M29 10l5-6" stroke="#c8843a" stroke-width="3.5" stroke-linecap="round"/><path d="M36 1l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="#ffd23f"/>')
};
// altin yigini (kazanma sahnesi): alttan uste dizilen paralar
const YIGIN = (() => {
  let h = ''; const sat = [[95, [22, 54, 86, 118, 148]], [80, [38, 70, 102, 134]], [65, [54, 86, 118]], [50, [70, 102]], [35, [86]]];
  for (const [y, xs] of sat) for (const x of xs) h += '<ellipse cx="' + x + '" cy="' + (y + 6) + '" rx="19" ry="8.5" fill="#b87400" stroke="#6a3a00" stroke-width="2"/><ellipse cx="' + x + '" cy="' + y + '" rx="19" ry="8.5" fill="#ffd23f" stroke="#6a3a00" stroke-width="2"/><ellipse cx="' + (x - 3) + '" cy="' + (y - 1) + '" rx="10" ry="3.6" fill="#fff3a0" opacity=".75"/>';
  return '<svg viewBox="0 0 170 120" aria-hidden="true">' + h + '<path d="M30 30l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM140 44l1.5 4.5 4.5 1.5-4.5 1.5-1.5 4.5-1.5-4.5-4.5-1.5 4.5-1.5z" fill="#fff"/></svg>';
})();

// magaza urunleri (altinla; gercek para yok)
const URUN = [
  { ad: 'Korsan Paketi', ac: 'Her güçlendiriciden 2 tane', f: 520, ic: { roket: 2, bomba: 2, yildirim: 2, top: 2 }, one: 'En iyi fiyat' },
  { ad: 'Roket x3', ac: 'Bir sırayı sağa sola siler', f: 120, ic: { roket: 3 } },
  { ad: 'Bomba x3', ac: 'Değdiği yerde patlar', f: 180, ic: { bomba: 3 } },
  { ad: 'Yıldırım x3', ac: 'Gökten 4 şimşek iner', f: 240, ic: { yildirim: 3 } },
  { ad: '+5 Top x3', ac: 'Anında 5 top verir', f: 360, ic: { top: 3 } }
];
// gunluk odul: 7 gunluk dongu (a: altin, g: guclendirici, n: adet)
const GUNLUK = [{ a: 50 }, { a: 75 }, { g: 'roket', n: 1 }, { a: 120 }, { g: 'bomba', n: 1 }, { a: 200 }, { a: 300, g: 'yildirim', n: 1 }];
const SANDIK_HEDEF = 5;   // bu kadar yeni bolum gecilince hazine sandigi acilir
const SOZ = ['Ahoy Kaptan!', 'Kuleyi yıkalım!', 'Toplar hazır!', 'Hazine bizi bekliyor!', 'Alt sıraya nişan al!', 'Yelkenler fora!'];

export function merkezKur(A) {
  const SV = A.SV;
  let acik = false, durak = false, sekmeAd = 'ana', T3 = null, t3yuk = null, popKapat = null;
  const sira = [];   // ana sayfa acilinca sirayla gosterilecek kartlar (yeni karakter, sandik, gunluk odul)
  const maxL = () => Math.max(1, SV.max || 1);
  const bugun = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  const ist = () => SV.ist || (SV.ist = { ilk: 0, seri: 0, enSeri: 0, kazan: 0, blok: 0 });
  const yilTop = () => { let n = 0; for (const k in (SV.yil || {})) n += SV.yil[k] || 0; return n; };
  const tik = () => A.sfx('tik');
  const ggIc = (k) => A.GGT.find((t) => t.k === k).ic;
  const ggAd = { roket: 'Roket', bomba: 'Bomba', yildirim: 'Yıldırım', top: '+5 Top' };

  // ---------------- iskelet ----------------
  const M = document.createElement('div'); M.id = 'merkez';
  let pus = ''; for (let i = 0; i < 14; i++) pus += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;--dx:' + ((Math.random() - 0.5) * 80).toFixed(0) + 'px;animation-duration:' + (7 + Math.random() * 8).toFixed(1) + 's;animation-delay:' + (-Math.random() * 14).toFixed(1) + 's"></i>';
  M.innerHTML = '<div class="m-bg"></div><div class="m-pus">' + pus + '</div>' +
    '<header class="m-ust"><button class="m-prof" id="m-prof" aria-label="Profil"><span class="m-av" id="m-av"></span><span class="m-pt"><b id="m-ad"></b><small id="m-lv"></small></span></button>' +
    '<div class="m-hap" id="m-ahap"><i class="coin"></i><b id="m-altin">0</b><button class="m-arti" id="m-arti" aria-label="Mağaza">+</button></div>' +
    '<div class="m-hap">' + IK.yildiz + '<b id="m-yil">0</b></div><button class="m-yuv" id="m-ayar" aria-label="Ayarlar">' + IK.disli + '</button></header>' +
    '<main class="m-sayfalar" id="m-sayfalar">' +
    '<section class="m-sayfa" id="s-magaza"><div class="m-ic"><h2 class="m-sb">Mağaza</h2><div class="m-kay" id="d-liste"></div></div></section>' +
    '<section class="m-sayfa" id="s-ana"><div class="m-ic"><h1 class="m-logo"><b>FOXI</b><span>SMASH</span></h1>' +
    '<div class="m-sahne" id="m-sahne"><div class="m-isin"></div><canvas id="m-kc" aria-label="Korsan Tilki"></canvas><div class="m-kil">' + IK.kilit + '<b id="m-kilyaz"></b></div><div class="m-balon" id="m-balon"></div>' +
    '<div class="m-yan sol"><button class="m-yb" id="m-gorev"><span class="m-yk">' + IK.gorev + '<em class="m-rz" id="m-gorevn"></em></span><small>Görevler</small></button>' +
    '<button class="m-yb" id="m-gunluk"><span class="m-yk">' + IK.hediye + '<em class="m-rz" id="m-gunlukn">!</em></span><small>Günlük</small></button></div>' +
    '<div class="m-yan sag"><button class="m-yb" id="m-sandik"><span class="m-yk">' + IK.sandik + '<em class="m-rz" id="m-sandikn">!</em><span class="m-mc"><i id="m-sandikc"></i></span></span><small>Hazine</small></button>' +
    '<button class="m-yb" id="m-korsan"><span class="m-yk">' + IK.capa + '</span><small>Korsan</small></button></div></div>' +
    '<div class="m-oynak" id="m-oynak"><div class="m-seri" id="m-seri"></div><span class="m-zor">Zor bölüm!</span><button class="m-btn m-oyna" id="m-oyna"><b></b><small></small></button></div></div></section>' +
    '<section class="m-sayfa" id="s-harita"><div class="m-ic"><h2 class="m-sb">Hazine Haritası</h2><div class="m-kay" id="h-kay"><div class="h-yol" id="h-yol"></div></div></div></section>' +
    '</main><nav class="m-alt"><button data-s="magaza">' + IK.magaza + '<span>Mağaza</span></button><button data-s="ana" class="on">' + IK.ev + '<span>Ana Sayfa</span></button><button data-s="harita">' + IK.harita + '<span>Harita</span></button></nav>';
  const P = document.createElement('div'); P.id = 'mpop';
  const KZ = document.createElement('div'); KZ.id = 'mkazan';
  document.body.append(M, KZ, P);
  // kartlar ve merkez oyun alanina dokunus gecirmesin
  for (const e of [M, P, KZ]) for (const ev of ['pointerdown', 'pointerup', 'pointermove']) e.addEventListener(ev, (x) => x.stopPropagation());

  // ---------------- yardimcilar ----------------
  function avIc(id) {
    const k = KARAKTERLER.find((x) => x.id === id); if (k) return ['radial-gradient(circle at 50% 30%,#8fdcff,#1b6fc0)', '<img src="../' + k.av + '?v=1" alt="">'];
    const a = AVATARLAR.find((x) => x.id === id) || AVATARLAR[0]; return ['radial-gradient(circle at 50% 30%,' + a.renk[0] + ',' + a.renk[1] + ')', a.ic];
  }
  function avKoy(el, id) { const [bg, ic] = avIc(id); el.style.background = bg; el.innerHTML = ic; }
  function salla(el) { el.classList.remove('m-salla'); void el.offsetWidth; el.classList.add('m-salla'); A.buzz([40, 40, 40], 0); }
  function altinYaz(v) { $('m-altin').textContent = v; }
  // altinlar bir noktadan ustteki altin sayacina ucar; sayac vardikca artar
  function ucur(x, y, adet, eski, yeni) {
    const hedef = $('m-ahap').querySelector('.coin').getBoundingClientRect(), tx = hedef.left + hedef.width / 2, ty = hedef.top + hedef.height / 2, n = Math.max(4, Math.min(14, adet));
    altinYaz(eski);
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i'); c.className = 'coin m-ucan'; c.style.left = x + 'px'; c.style.top = y + 'px'; document.body.appendChild(c);
      const sx = (Math.random() - 0.5) * 150, sy = (Math.random() - 0.5) * 110 - 20;
      const an = c.animate([{ transform: 'translate(0,0) scale(.3)', opacity: 0 }, { transform: 'translate(' + sx + 'px,' + sy + 'px) scale(1.15)', opacity: 1, offset: 0.28 }, { transform: 'translate(' + sx + 'px,' + sy + 'px) scale(1)', opacity: 1, offset: 0.42 }, { transform: 'translate(' + (tx - x) + 'px,' + (ty - y) + 'px) scale(.75)', opacity: 1 }],
        { duration: 900, delay: i * 55, easing: 'cubic-bezier(.5,0,.6,1)', fill: 'both' });
      an.onfinish = () => { c.remove(); const hap = $('m-ahap'); hap.classList.remove('pop'); void hap.offsetWidth; hap.classList.add('pop');
        altinYaz(i === n - 1 ? yeni : Math.round(eski + (yeni - eski) * (i + 1) / n)); if (i % 2 === 0) A.ses('para', 0.35, 1 + i * 0.03); };
    }
    setTimeout(() => altinYaz(SV.altin || 0), 900 + n * 55 + 200);
  }
  function odulVer(o) { if (o.a) SV.altin = (SV.altin || 0) + o.a; if (o.g) { const s = A.ggSay(); s[o.g] = (s[o.g] || 0) + (o.n || 1); } A.save(); A.ggHud(); }
  const odulHtml = (o) => (o.a ? '<div class="o-od"><div class="g-ik"><i class="coin"></i></div>' + o.a + '</div>' : '') + (o.g ? '<div class="o-od"><div class="g-ik">' + ggIc(o.g) + '</div>' + ggAd[o.g] + ' x' + (o.n || 1) + '</div>' : '');

  // ---------------- acilir kart ----------------
  const bas = (t, x) => '<div class="p-bas"><h2>' + t + '</h2>' + (x === false ? '' : '<button class="p-x" aria-label="Kapat">✕</button>') + '</div>';
  function pop(h, kapatinca) {
    P.innerHTML = '<div class="p-kart">' + h + '</div>'; P.classList.add('on'); popKapat = kapatinca || null;
    const x = P.querySelector('.p-x'); if (x) x.onclick = () => { tik(); pkapat(true); };
  }
  function pkapat(xIle) { const f = popKapat; popKapat = null; durak = false; P.classList.remove('on'); P.innerHTML = ''; if (xIle && f) f(); else sonraki(); }
  P.addEventListener('click', (e) => { if (e.target === P && P.querySelector('.p-x')) pkapat(true); });
  function sonraki() { if (!acik || P.classList.contains('on')) return; const f = sira.shift(); if (f) setTimeout(f, 250); }

  // ---------------- ana sayfa cizimi ----------------
  function ciz() {
    const Pf = profilOku(), max = maxL(), I = ist();
    avKoy($('m-av'), Pf.av); $('m-ad').textContent = Pf.ad; $('m-lv').textContent = 'Bölüm ' + max;
    altinYaz(SV.altin || 0); $('m-yil').textContent = yilTop();
    const gn = A.gorevHazir(); $('m-gorevn').textContent = gn || ''; $('m-gorevn').classList.toggle('on', gn > 0); $('m-gorev').classList.toggle('hazir', gn > 0);
    const gun = !SV.go || SV.go.gun !== bugun(); $('m-gunlukn').classList.toggle('on', gun); $('m-gunluk').classList.toggle('hazir', gun);
    const sn = SV.sn || 0, sh = sn >= SANDIK_HEDEF; $('m-sandikn').classList.toggle('on', sh); $('m-sandik').classList.toggle('hazir', sh); $('m-sandikc').style.width = Math.min(100, Math.round(100 * sn / SANDIK_HEDEF)) + '%';
    const zor = A.zor(max), b = $('m-oyna'); $('m-oynak').classList.toggle('zor', zor);
    b.querySelector('b').textContent = 'Bölüm ' + max; b.querySelector('small').textContent = A.bolumAdi(max) || '';
    $('m-seri').innerHTML = I.seri >= 2 ? IK.alev + ' ' + I.seri + ' bölümlük seri' : '';
    const tilkiAcik = acikMi('tilki', max), kr = KARAKTERLER.find((k) => k.id === 'tilki');
    $('m-sahne').classList.toggle('kilitli', !tilkiAcik); $('m-kilyaz').textContent = 'Bölüm ' + kr.sart + '\'e ulaş, ' + kr.ad + '\'yi kazan!';
  }

  // ---------------- 3B tilki (ana sayfanin ortasi) ----------------
  // v3.2: (Adem 11 Kas) ana sayfadaki tilki artik Adem'in videosu: goz kirpar, gercekci bakar, el sallar ve dans eder.
  // Video yesil fonlu (karakter/tilki_dans.mp4, kesintisiz 4.5 sn dongu); yesil fon WebGL ile canli olarak saydam yapilir,
  // kenardaki yesil tasma temizlenir. Her telefonda calisir (saydam video bicimi gerekmez).
  function tilkiKur() {
    if (t3yuk) return t3yuk;
    return (t3yuk = (async () => {
      const kc = $('m-kc'), gl = kc.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
      if (!gl) return null;
      const vid = document.createElement('video'); vid.src = '../karakter/tilki_dans.mp4?v=1'; vid.muted = true; vid.loop = true; vid.playsInline = true; vid.setAttribute('playsinline', ''); vid.setAttribute('webkit-playsinline', ''); vid.preload = 'auto'; vid.crossOrigin = 'anonymous';
      const sh = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); return o; };
      const pg = gl.createProgram();
      gl.attachShader(pg, sh(gl.VERTEX_SHADER, 'attribute vec2 p; varying vec2 u; void main(){ u = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5); gl_Position = vec4(p, 0.0, 1.0); }'));
      gl.attachShader(pg, sh(gl.FRAGMENT_SHADER, `precision mediump float; uniform sampler2D v; uniform vec2 px; varying vec2 u;
        float k(vec3 c){ return c.g - max(c.r, c.b); }
        void main(){
          vec3 c = texture2D(v, u).rgb;
          float g = k(c);
          float g2 = max(max(k(texture2D(v, u + vec2(px.x, 0.0)).rgb), k(texture2D(v, u - vec2(px.x, 0.0)).rgb)), max(k(texture2D(v, u + vec2(0.0, px.y)).rgb), k(texture2D(v, u - vec2(0.0, px.y)).rgb)));
          float a = 1.0 - smoothstep(0.045, 0.13, mix(g, g2, 0.35));
          float m = max(c.r, c.b); c.g = min(c.g, m + 0.03);
          c *= 1.0 + 0.06 * (1.0 - a);
          gl_FragColor = vec4(c * a, a);
        }`));
      gl.linkProgram(pg); gl.useProgram(pg);
      const bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const lp = gl.getAttribLocation(pg, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
      const tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform2f(gl.getUniformLocation(pg, 'px'), 1 / 478, 1 / 850);
      let VW = 0, VH = 0;
      const boyut = () => {
        const w = kc.clientWidth, h = kc.clientHeight; if (!w || !h) return; const pr = Math.min(2, devicePixelRatio || 1);
        kc.width = Math.round(w * pr); kc.height = Math.round(h * pr);
        const ar = 478 / 850; VH = kc.height * 0.97; VW = VH * ar; if (VW > kc.width * 0.98) { VW = kc.width * 0.98; VH = VW / ar; }
        gl.viewport(Math.round((kc.width - VW) / 2), 0, Math.round(VW), Math.round(VH)); ciz(true);
      };
      const ciz = (zorla) => {
        if (vid.readyState < 2) return;
        gl.bindTexture(gl.TEXTURE_2D, tx); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, vid);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };
      const oynat = () => { if (acik && sekmeAd === 'ana' && !document.hidden) { if (vid.paused) vid.play().catch(() => {}); } else if (!vid.paused) vid.pause(); };
      const kare = () => { requestAnimationFrame(kare); oynat(); if (!vid.paused) ciz(); };
      vid.addEventListener('loadeddata', () => { boyut(); ciz(true); });
      document.addEventListener('visibilitychange', oynat);
      const zipla = (n) => { kc.classList.remove('zip'); void kc.offsetWidth; kc.style.setProperty('--zn', n || 1); kc.classList.add('zip'); };
      kc.addEventListener('click', () => {
        if ($('m-sahne').classList.contains('kilitli')) { salla($('m-sahne').querySelector('.m-kil')); tik(); return; }
        zipla(1); A.sfx('bonus');
        const b = $('m-balon'); b.textContent = SOZ[Math.floor(Math.random() * SOZ.length)]; b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
      });
      addEventListener('resize', boyut);
      T3 = { t: { oyna: (ad, sn) => zipla(ad === 'sevin' ? 2 : 1) }, boyut }; boyut(); vid.load(); requestAnimationFrame(kare);
      return T3;
    })().catch(() => null));
  }

  // ---------------- sekmeler ----------------
  function sekme(ad, hizli) {
    sekmeAd = ad; const i = ['magaza', 'ana', 'harita'].indexOf(ad), sy = $('m-sayfalar');
    if (hizli) { sy.style.transition = 'none'; requestAnimationFrame(() => { sy.style.transition = ''; }); }
    sy.style.transform = 'translateX(' + (-i * 33.3334) + '%)';
    for (const b of M.querySelectorAll('.m-alt button')) b.classList.toggle('on', b.dataset.s === ad);
    if (ad === 'magaza') magazaCiz(); if (ad === 'harita') haritaCiz(); if (ad === 'ana' && T3) T3.boyut();
  }
  for (const b of M.querySelectorAll('.m-alt button')) b.onclick = () => { if (b.dataset.s !== sekmeAd) { tik(); sekme(b.dataset.s); } };

  // ---------------- magaza ----------------
  function magazaCiz() {
    const s = A.ggSay(), a = SV.altin || 0;
    $('d-liste').innerHTML = '<div class="d-urun"><div class="d-ad"><b>Elindekiler</b><small>Bölümde ya da bölüm kartında kullan</small></div><div class="d-ik" style="width:auto;flex-wrap:nowrap">' +
      A.GGT.map((t) => '<span class="d-g gb-' + t.k + '">' + t.ic + '<em>' + (s[t.k] || 0) + '</em></span>').join('') + '</div></div>' +
      URUN.map((u, n) => { const ks = Object.keys(u.ic);
        return '<div class="d-urun' + (u.one ? ' one' : '') + '">' + (u.one ? '<span class="d-et">' + u.one + '</span>' : '') + '<div class="d-ik' + (ks.length === 1 ? ' tek' : '') + '">' +
          ks.map((k) => '<span class="d-g gb-' + k + '">' + ggIc(k) + '<em>x' + u.ic[k] + '</em></span>').join('') + '</div><div class="d-ad"><b>' + u.ad + '</b><small>' + u.ac + '</small></div>' +
          '<button class="d-al' + (a < u.f ? ' yok' : '') + '" data-n="' + n + '"><i class="coin"></i>' + u.f + '</button></div>'; }).join('') +
      '<p class="p-not" style="color:#dfe8ff!important;text-align:center">Altını bölüm kazanarak, görevlerden, günlük ödülden ve hazine sandığından toplarsın.</p>';
    for (const b of $('d-liste').querySelectorAll('.d-al')) b.onclick = () => {
      const u = URUN[+b.dataset.n]; if ((SV.altin || 0) < u.f) { salla(b); tik(); return; }
      SV.altin -= u.f; const sy = A.ggSay(); for (const k in u.ic) sy[k] = (sy[k] || 0) + u.ic[k]; A.save(); A.ggHud(); A.sfx('bonus'); A.ses('para', 0.5); A.buzz(30); ciz(); magazaCiz();
    };
  }

  // ---------------- hazine haritasi ----------------
  function haritaCiz() {
    const max = maxL(), son = Math.max(max + 7, 16), yil = SV.yil || {}, SAT = 98, UST = 26, Pf = profilOku(); let h = '', yol = '';
    const xOf = (L) => 50 + 30 * Math.sin(L * 1.05), [tbg, tic] = avIc(Pf.av);
    for (let L = son; L >= 1; L--) {
      const bl = A.bolge(L), kilit = L > max, cur = L === max, st = yil[L] || 0, x = xOf(L), y = UST + (son - L) * SAT + 46;
      yol += (yol ? ' L' : 'M') + x.toFixed(1) + ' ' + y;
      h += '<div class="h-s t-' + bl[1] + '"><button class="h-n' + (kilit ? ' kilit' : '') + (cur ? ' cur' : '') + (A.zor(L) && !kilit ? ' zor' : '') + '" data-l="' + L + '" style="left:' + x.toFixed(1) + '%">' + (kilit ? IK.kilit : L) +
        (st ? '<i>' + '★'.repeat(st) + '<u>' + '★'.repeat(3 - st) + '</u></i>' : '') + '</button>' +
        (cur ? '<span class="h-tilki" style="left:' + x.toFixed(1) + '%;background:' + tbg + '">' + tic + '</span>' : '') +
        ((L - 1) % 3 === 0 ? '<span class="h-b" style="' + (x > 50 ? 'left:5%' : 'right:5%') + '">' + bl[0] + '</span>' : '') + '</div>';
    }
    const H = UST + son * SAT + 6;
    $('h-yol').innerHTML = '<svg class="h-cizgi" viewBox="0 0 100 ' + H + '" preserveAspectRatio="none"><path d="' + yol + '" fill="none" stroke="#a03a1a" stroke-width="5" stroke-dasharray="3 13" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" opacity=".75"/></svg>' + h;
    for (const el of $('h-yol').querySelectorAll('.h-n')) el.onclick = () => { const L = +el.dataset.l; tik(); if (L > max) { salla(el); return; } bolumKarti(L); };
    const c = $('h-yol').querySelector('.h-n.cur'); if (c) setTimeout(() => { const k = $('h-kay'); k.scrollTop = c.parentNode.offsetTop - k.clientHeight / 2 + 40; }, 0);
  }

  // ---------------- bolum karti: guclendirici sec, oyna ----------------
  function bolumKarti(L) {
    const s = A.ggSay(), sec = new Set(), zor = A.zor(L), st = (SV.yil || {})[L] || 0;
    const maliyet = () => { let m = 0; for (const k of sec) if (!(s[k] > 0)) m += A.GGT.find((t) => t.k === k).fiyat; return m; };
    // v3.2: (Adem 11 Kas) daha profesyonel bolum karti: sus cizgili baslik, uc yildiz yuvasi, hedef satiri, adli guclendiriciler
    const GAD = { roket: 'Roket', bomba: 'Bomba', yildirim: 'Yıldırım', top: '+5 Top' };
    pop(bas('Bölüm ' + L) + (zor ? '<div class="p-zor">Zor bölüm · +' + A.ZOR_ODUL + ' altın</div>' : '') + '<div class="p-ic bk"><h3>' + esc(A.bolumAdi(L) || '') + '</h3>' +
      '<div class="bk-yil">' + [0, 1, 2].map((i) => i < st ? IK.yildiz : IK.yildizBos).join('') + '</div>' +
      '<div class="bk-hd"><i></i>Bütün küpleri platformdan düşür!</div>' +
      '<div class="p-et">Güçlendirici seç</div><div class="ggk">' +
      A.GGT.map((t) => '<button class="gt gt-' + t.k + '" data-k="' + t.k + '"><span class="hl"></span><i>' + t.ic + '</i>' + (s[t.k] > 0 ? '<span class="n">' + s[t.k] + '</span>' : '<span class="p"><em class="coin"></em>' + t.fiyat + '</span>') + '<span class="ok">✓</span><em class="ad">' + (GAD[t.k] || '') + '</em></button>').join('') +
      '</div><div class="p-altin"><i class="coin"></i><b id="p-al">' + (SV.altin || 0) + '</b></div></div><button class="m-btn" id="p-oyna">Oyna</button>', () => { if (!acik) ac(); });
    for (const el of P.querySelectorAll('.gt')) el.onclick = () => {
      const k = el.dataset.k;
      if (sec.has(k)) { sec.delete(k); el.classList.remove('on'); tik(); }
      else { sec.add(k); if (maliyet() > (SV.altin || 0)) { sec.delete(k); salla(el); tik(); return; } el.classList.add('on'); A.sfx('bonus'); A.buzz(30); }
      $('p-al').textContent = (SV.altin || 0) - maliyet();
    };
    $('p-oyna').onclick = () => { tik(); sira.length = 0; pkapat(); A.oyna(L, sec); if (acik) kapat(); };
  }

  // ---------------- gunluk gorevler ----------------
  function gorevKarti() {
    const l = A.gorevler();
    pop(bas('Günlük Görevler') + '<div class="p-ic">' + l.map((q, n) => { const G = A.GHAV[q.i], bitti = q.n >= G.h;
      return '<div class="gv' + (q.a ? ' alindi' : '') + '"><div class="gva"><b>' + G.ad + '</b><div class="gvp"><span style="width:' + Math.round(100 * q.n / G.h) + '%"></span><em>' + q.n + ' / ' + G.h + '</em></div></div>' +
        (q.a ? '<span class="gvok">✓</span>' : '<button class="gvb' + (bitti ? '' : ' yok') + '" data-n="' + n + '"><i class="coin"></i>' + G.o + '</button>') + '</div>'; }).join('') +
      '<p class="p-not">Görevler her gün yenilenir</p></div><button class="m-btn kck" id="p-tm">Tamam</button>');
    for (const b of P.querySelectorAll('.gvb')) b.onclick = () => {
      const q = l[+b.dataset.n], G = A.GHAV[q.i]; if (q.a || q.n < G.h) { salla(b); tik(); return; }
      const r = b.getBoundingClientRect(), eski = SV.altin || 0; q.a = 1; SV.altin = eski + G.o; A.save(); A.sfx('bonus'); A.buzz(30); gorevKarti(); ciz(); ucur(r.left + r.width / 2, r.top + r.height / 2, 8, eski, SV.altin);
    };
    $('p-tm').onclick = () => { tik(); pkapat(); };
  }

  // ---------------- gunluk odul ----------------
  function gunlukKarti() {
    const go = SV.go || { gun: '', i: 0 }, alinabilir = go.gun !== bugun(), idx = go.i % 7;
    pop(bas('Günlük Ödül') + '<div class="p-ic"><div class="g-izg">' + GUNLUK.map((o, n) => {
      const alindi = n < (alinabilir ? idx : idx || 7), bug = alinabilir && n === idx;
      return '<div class="g-g' + (alindi ? ' alindi' : '') + (bug ? ' bugun' : '') + '">' + (n + 1) + '. gün<div class="g-ik">' + (o.a ? '<i class="coin"></i>' : ggIc(o.g)) + '</div><b>' + (o.a ? o.a : 'x' + o.n) + (o.a && o.g ? ' + ' + ggIc(o.g) : '') + '</b></div>'; }).join('') +
      '</div><p class="p-not">' + (alinabilir ? 'Her gün gel, ödüller büyüsün!' : 'Bugünün ödülünü aldın. Yarın yine gel!') + '</p></div>' +
      '<button class="m-btn' + (alinabilir ? '' : ' mavi kck') + '" id="p-tm">' + (alinabilir ? 'Ödülü Al' : 'Tamam') + '</button>');
    $('p-tm').onclick = () => {
      if (!alinabilir) { tik(); pkapat(); return; }
      const o = GUNLUK[idx], r = P.querySelector('.bugun').getBoundingClientRect(), eski = SV.altin || 0; SV.go = { gun: bugun(), i: go.i + 1 }; odulVer(o);
      A.sfx('bonus'); A.ses('sandik', 0.5); A.buzz(40); pkapat(); ciz(); if (o.a) ucur(r.left + r.width / 2, r.top + r.height / 2, 10, eski, SV.altin);
    };
  }

  // ---------------- hazine sandigi ----------------
  function sandikOdul() { const n = SV.sa || 0; return { a: 120 + 20 * Math.min(n, 9), g: ['roket', 'bomba', 'top', 'yildirim'][n % 4], n: n % 3 === 2 ? 2 : 1 }; }
  function sandikKarti() {
    const sn = SV.sn || 0;
    if (sn < SANDIK_HEDEF) {
      pop(bas('Hazine Sandığı') + '<div class="p-ic"><div class="o-sahne" style="height:120px">' + IK.sandik.replace('<svg ', '<svg class="o-sn" style="width:110px;height:110px;animation:none" ') + '</div><p>Her <b>' + SANDIK_HEDEF + '</b> yeni bölümde bir sandık açılır: altın ve güçlendirici çıkar.</p>' +
        '<div class="k-cub" style="border-color:#c9a56a"><i style="width:' + Math.round(100 * sn / SANDIK_HEDEF) + '%"></i><em>' + sn + ' / ' + SANDIK_HEDEF + '</em></div></div><button class="m-btn kck" id="p-tm">Tamam</button>');
      $('p-tm').onclick = () => { tik(); pkapat(); }; return;
    }
    const o = sandikOdul();
    pop(bas('Hazine Sandığı', false) + '<div class="p-ic"><div class="o-sahne"><div class="m-isin"></div>' + IK.sandik.replace('<svg ', '<svg class="o-sn" ') + '</div><h3>Sandık açıldı!</h3><div class="o-liste">' + odulHtml(o) + '</div></div><button class="m-btn" id="p-tm">Topla</button>');
    A.ses('sandik', 0.7); A.sfx('win'); A.buzz([40, 60, 40], 0);
    $('p-tm').onclick = () => { const r = P.querySelector('.o-od').getBoundingClientRect(), eski = SV.altin || 0; SV.sn = sn - SANDIK_HEDEF; SV.sa = (SV.sa || 0) + 1; odulVer(o); tik(); pkapat(); ciz(); ucur(r.left + r.width / 2, r.top + r.height / 2, 12, eski, SV.altin); };
  }

  // ---------------- yeni karakter ----------------
  function yeniKarakter() {
    const Pf = profilOku(), k = KARAKTERLER.find((x) => acikMi(x.id, maxL()) && !Pf.gor[x.id]); if (!k) return false;
    pop(bas('Yeni Karakter!', false) + '<div class="p-ic"><div class="o-sahne"><div class="m-isin"></div><img src="../' + k.av + '?v=1" alt=""></div><h3>' + k.ad + '</h3><p>Ana sayfada seni karşılar: göz kırpar, el sallar, dans eder!</p></div><button class="m-btn" id="p-tm">Harika!</button>');
    A.sfx('win'); if (T3) T3.t.oyna('sevin', 5);
    $('p-tm').onclick = () => { Pf.gor[k.id] = 1; if (!Pf.kar) Pf.kar = k.id; if (Pf.av === 'a1') Pf.av = k.id; profilYaz(Pf); tik(); pkapat(); ciz(); };
    return true;
  }

  // ---------------- profil ----------------
  function profilKarti() {
    const Pf = profilOku(), max = maxL(), I = ist(); let av = Pf.av, kar = seciliKarakter(max) || '';
    const ciz2 = () => {
      const avl = AVATARLAR.map((a) => a.id).concat(KARAKTERLER.map((k) => k.id));
      avKoy($('p-av'), av);
      $('p-avg').innerHTML = avl.map((id) => { const kpl = KARAKTERLER.some((k) => k.id === id) && !acikMi(id, max), [bg, ic] = avIc(id);
        return '<button data-a="' + id + '" class="' + (kpl ? 'kpl' : id === av ? 'sec' : '') + '"><span class="m-av" style="background:' + bg + '">' + ic + '</span></button>'; }).join('');
      $('p-krg').innerHTML = KARAKTERLER.map((k) => { const ac = acikMi(k.id, max), [bg, ic] = avIc(k.id);
        return '<button data-k="' + k.id + '" class="' + (!ac ? 'kpl' : kar === k.id ? 'sec' : '') + '"><span class="m-av" style="background:' + bg + '">' + ic + '</span><span class="ad">' + k.ad + (ac ? '' : '<br>Bölüm ' + k.sart) + '</span></button>'; }).join('') +
        '<button data-k="" class="' + (kar === '' ? 'sec' : '') + '"><span class="m-av" style="background:#e6d3ba;border-color:#c9b08c;font:400 15px/1 var(--disp);color:#8a6a3a">Yok</span><span class="ad">Karaktersiz</span></button>' +
        '<button class="kpl" disabled><span class="m-av"></span><span class="ad">Yakında</span></button>';
    };
    pop(bas('Profil') + '<div class="p-ic"><div class="p-pro"><span class="m-av" id="p-av"></span><input id="p-in" maxlength="14" autocomplete="off" value="' + esc(Pf.ad) + '" aria-label="İsim"></div>' +
      '<div class="p-ist"><div>' + IK.yildiz + '<b>' + yilTop() + '</b>Yıldız</div><div>' + IK.gorev + '<b>' + I.ilk + '</b>İlk denemede</div><div>' + IK.alev + '<b>' + I.enSeri + '</b>En uzun seri</div><div>' + IK.blok + '<b>' + (I.blok || 0) + '</b>Yıkılan blok</div></div>' +
      '<h4>Avatar</h4><div class="p-izg" id="p-avg"></div><h4>Karakter (oyunda yanında durur)</h4><div class="p-izg kr" id="p-krg"></div></div><button class="m-btn kck" id="p-tm">Kaydet</button>');
    ciz2();
    $('p-avg').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; tik(); if (b.classList.contains('kpl')) { salla(b); return; } av = b.dataset.a; ciz2(); };
    $('p-krg').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; tik(); if (b.classList.contains('kpl')) { salla(b); return; } kar = b.dataset.k; ciz2(); };
    $('p-tm').onclick = () => { Pf.ad = ($('p-in').value || '').trim().slice(0, 14) || 'Kaptan'; Pf.av = av; Pf.kar = kar; profilYaz(Pf); tik(); pkapat(); ciz(); };
  }

  // ---------------- ayarlar / duraklatma ----------------
  function ayarKarti(oyunda) {
    const sat = (id, ad, on) => '<div class="ay"><b>' + ad + '</b><button class="tg' + (on ? ' on' : '') + '" data-a="' + id + '" aria-label="' + ad + '"><i></i></button></div>';
    pop(bas(oyunda ? 'Duraklatıldı' : 'Ayarlar') + '<div class="p-ic">' + sat('ses', 'Ses', !SV.sessiz) + sat('muzik', 'Müzik', !SV.muziksiz) + sat('titresim', 'Titreşim', !SV.titresimsiz) + '<p class="p-not">Foxi Smash ' + A.SURUM + '</p></div>' +
      (oyunda ? '<button class="m-btn" id="p-dv">Devam Et</button><button class="m-btn tur kck" id="p-yb">Yeniden Başla</button><button class="m-btn mavi kck" id="p-as">Ana Sayfa</button>' : '<button class="m-btn kck" id="p-dv">Tamam</button>'));
    durak = !!oyunda;
    for (const b of P.querySelectorAll('.tg')) b.onclick = () => { A.ayar(b.dataset.a); tik(); ayarKarti(oyunda); };
    $('p-dv').onclick = () => { tik(); pkapat(); };
    if (oyunda) { $('p-yb').onclick = () => { tik(); A.pes(); bolumKarti(A.LV()); }; $('p-as').onclick = () => { tik(); A.pes(); pkapat(); ac(); }; }
  }

  // ---------------- kazanma sahnesi ----------------
  let fxDur = null;
  function havaiFisek(cv) {
    const x = cv.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1), ps = []; let W = 0, H = 0, calis = true, son = 0, sonra = 0.2;
    const boy = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; }; boy();
    const RENK = ['#ffd23f', '#ff9a1c', '#ff5a6e', '#5ee0ff', '#8cf05a', '#d59aff', '#ffffff'];
    const patla = () => { const cx = W * (0.14 + Math.random() * 0.72), cy = H * (0.1 + Math.random() * 0.4), c = RENK[Math.floor(Math.random() * RENK.length)], n = 36 + Math.floor(Math.random() * 22), hz = 150 + Math.random() * 130;
      for (let i = 0; i < n; i++) { const a = (i / n) * 6.283 + Math.random() * 0.2, v = hz * (0.55 + Math.random() * 0.55); ps.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, o: 1, c: Math.random() < 0.25 ? '#fff' : c, r: 1.6 + Math.random() * 1.8, k: 0.9 + Math.random() * 0.7 }); } };
    const kare = (ts) => {
      if (!calis) return; requestAnimationFrame(kare); const dt = Math.min(0.05, son ? (ts - son) / 1000 : 0.016); son = ts;
      sonra -= dt; if (sonra <= 0) { patla(); sonra = 0.45 + Math.random() * 0.75; }
      x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H); x.globalCompositeOperation = 'lighter';
      for (let i = ps.length - 1; i >= 0; i--) { const p = ps[i]; p.vx *= 1 - dt * 1.6; p.vy = p.vy * (1 - dt * 1.6) + 90 * dt; const px = p.x, py = p.y; p.x += p.vx * dt; p.y += p.vy * dt; p.o -= dt * p.k; if (p.o <= 0) { ps.splice(i, 1); continue; }
        x.globalAlpha = Math.min(1, p.o * 1.4); x.strokeStyle = p.c; x.lineWidth = p.r; x.lineCap = 'round'; x.beginPath(); x.moveTo(px - p.vx * 0.03, py - p.vy * 0.03); x.lineTo(p.x, p.y); x.stroke(); }
      x.globalAlpha = 1;
    };
    requestAnimationFrame(kare);
    return () => { calis = false; };
  }
  // d: { L, st, kaz, once, kalan, bonus, zorB, yeniK, ilk }
  function kazan(d) {
    const sn = SV.sn || 0, onceSn = d.ilk ? sn - 1 : sn, dolu = sn >= SANDIK_HEDEF, kaldi = Math.max(0, SANDIK_HEDEF - sn);
    KZ.className = 'on';
    KZ.innerHTML = '<canvas></canvas><div class="m-logo k-logo"><b>FOXI</b><span>SMASH</span></div><div class="k-ic"><h1>Tebrikler!</h1><div class="k-bol">Bölüm ' + d.L + ' tamam</div>' +
      '<div class="k-yil">' + [0, 1, 2].map((i) => (i < d.st ? IK.yildiz : IK.yildizBos).replace('<svg ', '<svg ' + (i < d.st ? '' : 'class="off" ') + 'style="animation-delay:' + (1.4 + i * 0.25) + 's" ')).join('') + '</div>' +
      '<div class="k-odul"><div class="m-isin"></div>' + YIGIN + '<b id="k-say">0</b></div>' +
      '<div class="k-sat"><span>Kalan top <b>' + d.kalan + '</b></span><span>Top bonusu <b>+' + d.bonus + '</b></span>' + (d.zorB ? '<span>Zor bölüm <b>+' + d.zorB + '</b></span>' : '') + (d.ilk ? '' : '<span>Tekrar <b>yarı ödül</b></span>') + '</div>' +
      (d.yeniK ? '<div class="k-yeni"><img src="../' + d.yeniK.av + '?v=1" alt=""><div><small>Yeni karakter kazandın!</small><b>' + d.yeniK.ad + '</b></div></div>' : '') +
      '<div class="k-sn' + (dolu ? ' dolu' : '') + '"><small>' + (dolu ? 'Hazine sandığı hazır! Ana sayfada aç.' : 'Hazine sandığına ' + kaldi + ' bölüm kaldı') + '</small><div class="k-cub"><i id="k-snc" style="width:' + Math.round(100 * Math.min(onceSn, SANDIK_HEDEF) / SANDIK_HEDEF) + '%"></i><em>' + Math.min(sn, SANDIK_HEDEF) + ' / ' + SANDIK_HEDEF + '</em></div>' + IK.sandik + '</div>' +
      '<button class="m-btn" id="k-dv">Devam Et</button></div>';
    if (fxDur) fxDur(); fxDur = havaiFisek(KZ.querySelector('canvas'));
    for (let i = 0; i < d.st; i++) setTimeout(() => { if (KZ.classList.contains('on')) { A.sfx('bonus'); A.buzz(25); } }, 1400 + i * 250);
    setTimeout(() => { const c = $('k-snc'); if (c) c.style.width = Math.round(100 * Math.min(sn, SANDIK_HEDEF) / SANDIK_HEDEF) + '%'; }, 2300);
    let n = 0; const adim = Math.max(1, Math.round(d.kaz / 22));
    setTimeout(function say() { const e = $('k-say'); if (!e) return; n = Math.min(d.kaz, n + adim); e.textContent = n; A.ses('para', 0.3, 0.95 + 0.4 * n / Math.max(1, d.kaz));
      if (n < d.kaz) setTimeout(say, 50); else e.classList.add('pop'); }, 1750);
    $('k-dv').onclick = () => {
      tik(); const r = KZ.querySelector('.k-odul').getBoundingClientRect(); KZ.classList.add('cik');
      setTimeout(() => { KZ.className = ''; KZ.innerHTML = ''; if (fxDur) { fxDur(); fxDur = null; } }, 340);
      ac({ ucan: { x: r.left + r.width / 2, y: r.top + r.height / 2, n: Math.round(d.kaz / 8), eski: d.once, yeni: d.once + d.kaz } });
    };
  }

  // ---------------- kaybetme: devam et? ----------------
  // d: { L, kaldi, bedava, fiyat }
  function kaybet(d) {
    const yeter = (SV.altin || 0) >= d.fiyat, I = ist(), dev = d.bedava || yeter;
    pop(bas('Devam Et?') + '<div class="p-ic"><h3>Toplar bitti!</h3><p>' + d.kaldi + ' blok kaldı. ' + (d.kaldi <= 5 ? 'Çok az kalmıştı!' : 'Alt sıraları hedefle, kule devrilsin.') + '</p>' +
      '<div class="y-kay">' + (dev ? '<div class="y-k">' + IK.top + '<b style="color:#2f9a1e">+3</b>Top kazan</div>' : '') + (I.seri >= 2 ? '<div class="y-k">' + IK.alev + '<b>' + I.seri + '</b>Serin bitecek</div>' : '') + '</div>' +
      '<div class="p-altin"><i class="coin"></i><b>' + (SV.altin || 0) + '</b></div></div>' +
      (dev ? '<button class="m-btn uz" id="p-dv">' + (d.bedava ? 'Bedava Devam Et' : 'Devam Et <i class="coin"></i>' + d.fiyat) + '</button>' : '') +
      '<button class="m-btn tur' + (dev ? ' kck' : '') + '" id="p-td">Tekrar Dene</button>', () => { A.pes(); ac(); });
    if (dev) $('p-dv').onclick = () => { tik(); if (A.devam()) pkapat(); };
    $('p-td').onclick = () => { tik(); A.pes(); bolumKarti(d.L); };
  }

  // ---------------- ac / kapat ----------------
  // o.ilk: oyun yeni acildi (gunluk odul karti cikar); o.ucan: kazanilan altinlar sayaca ucar
  function ac(o = {}) {
    durak = false; sekme('ana', true); ciz(); acik = true; M.classList.remove('cik'); M.classList.add('on', 'gir'); setTimeout(() => M.classList.remove('gir'), 450);
    tilkiKur().then((t) => { if (t) { t.boyut(); if (o.ucan) t.t.oyna('sevin', 2.2); else t.t.oyna('selam', 1.6); } });
    A.muzikBasla();
    sira.length = 0; sira.push(() => { if (!yeniKarakter()) sonraki(); });
    if ((SV.sn || 0) >= SANDIK_HEDEF) sira.push(sandikKarti);
    if (o.ilk && (!SV.go || SV.go.gun !== bugun())) sira.push(gunlukKarti);
    if (o.ucan) { const u = o.ucan; altinYaz(u.eski); setTimeout(() => ucur(u.x, u.y, u.n, u.eski, u.yeni), 380); setTimeout(sonraki, 1900); }
    else setTimeout(sonraki, o.ilk ? 900 : 300);
  }
  function kapat() { acik = false; M.classList.add('cik'); setTimeout(() => { if (!acik) M.classList.remove('on', 'cik'); }, 440); }

  $('m-prof').onclick = () => { tik(); profilKarti(); };
  $('m-ayar').onclick = () => { tik(); ayarKarti(false); };
  $('m-arti').onclick = () => { tik(); sekme('magaza'); };
  $('m-gorev').onclick = () => { tik(); gorevKarti(); };
  $('m-gunluk').onclick = () => { tik(); gunlukKarti(); };
  $('m-sandik').onclick = () => { tik(); sandikKarti(); };
  $('m-korsan').onclick = () => { tik(); pop(bas('Korsan Pilot') + '<div class="p-ic"><h3>Deneme modu</h3><p>Açık denizde düşman gemilerini ve kuleleri batır. Bu mod hâlâ yapım aşamasında.</p></div><button class="m-btn tur" id="p-dv">Denize Açıl</button>'); $('p-dv').onclick = () => { location.href = '../korsan/'; }; };
  $('m-oyna').onclick = () => { tik(); bolumKarti(maxL()); };

  return { ac, kapat, kazan, kaybet, bolumKarti, duraklat: () => ayarKarti(true), durdur: () => acik || durak, acik: () => acik };
}
