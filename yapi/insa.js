// Foxi Smash v7.2 (Adem 18 Kas 2026): INSA sayfasi (alt menude ayri sekme).
// Adem: "level ekraninda bunlarin ne isi var, ayri sayfada olur; bir geminin 10 resmi yapilir, sifirdan insa ediliyor havasi
// verilir, her yeni seyde resim degisir; gercekci". Resimler Adem'in Gemini'de urettigi 10 asama (yapi/insa/gemi01..10.webp).
// Akis: altinla bir sonraki asama alinir -> altinlar gemiye ucar, cekic 3 kez vurur (talas, toz, sarsinti), beyaz parlamayla
// resim bir sonraki asamaya gecer, isilti + "Kaburgalar yerlesti!" yazisi. 10. asamada buyuk kutlama.
// Kayit: SV.insa = { gemi: 1..10 } (oyunun ana kaydinda ayri alan).
// Disari: PROJE, insaKur(o) -> { ciz(), goster(bool), hazirMi() }
export const PROJE = [{
  id: 'gemi', ad: 'Foxi\'nin Gemisi', n: 10, res: (i) => 'insa/gemi' + String(i).padStart(2, '0') + '.webp?v=1',
  bas: 'Tersane hazır, omurga kızakta!',
  // adim[k]: k. asamaya gecis (2..10)
  adim: [null, null,
    { ad: 'Kaburgaları Yerleştir', bitti: 'Kaburgalar yerleşti!', f: 100 },
    { ad: 'İskeleyi Kur', bitti: 'İskele kuruldu!', f: 150 },
    { ad: 'Gövde Tahtalarını Çak', bitti: 'Tahtalar çakıldı!', f: 250 },
    { ad: 'Gövdeyi Tamamla', bitti: 'Gövde tamam!', f: 350 },
    { ad: 'Boya ve Altın Süsler', bitti: 'Gemi parlıyor!', f: 450 },
    { ad: 'Direkleri Dik', bitti: 'Direkler dikildi!', f: 600 },
    { ad: 'Direkleri Sağlamla', bitti: 'Direkler sapasağlam!', f: 750 },
    { ad: 'Serenler ve Tilki Başı', bitti: 'Tilki başı yerinde!', f: 900 },
    { ad: 'Yelkenleri Aç!', bitti: 'GEMİ HAZIR!', f: 1200 }],
}];

const CEKIC = '<svg viewBox="0 0 64 64"><path d="M36 26L12 54" stroke="#4a2206" stroke-width="10" stroke-linecap="round"/><path d="M36 26L12 54" stroke="#c8843a" stroke-width="5" stroke-linecap="round"/><path d="M33 29L15 50" stroke="#e8b070" stroke-width="1.6" stroke-linecap="round" opacity=".7"/><g transform="rotate(42 40 18)"><rect x="22" y="9" width="36" height="18" rx="4" fill="#9aa8c0" stroke="#24304a" stroke-width="3"/><rect x="22" y="9" width="36" height="7" rx="3" fill="#dfe7f5"/><rect x="18" y="11" width="7" height="14" rx="2" fill="#6a7690" stroke="#24304a" stroke-width="2.5"/></g></svg>';

export function insaKur(o) {
  const { M, SV, A, sayfa, ucur2d, yazi, altinYaz, tik, oyna } = o;
  const P = PROJE[0];
  // tam ekran resim katmani (ana fonun ustunde, sayfalarin altinda); sekme acikken gorunur
  const F = document.createElement('div'); F.className = 'in-fon';
  F.innerHTML = '<div class="in-sah"><img class="in-r a" alt="" draggable="false"><img class="in-r b" alt="" draggable="false"><div class="in-pk"></div></div><div class="in-fl"></div>';
  M.insertBefore(F, M.querySelector('.m-bg').nextSibling);
  const SAH = F.querySelector('.in-sah'), RA = F.querySelector('.in-r.a'), RB = F.querySelector('.in-r.b'), PK = F.querySelector('.in-pk'), FL = F.querySelector('.in-fl');
  sayfa.innerHTML =
    '<div class="in-ust"><div class="in-lev"><b>' + P.ad + '</b><div class="in-pip" id="in-pip">' + Array.from({ length: P.n }, () => '<i></i>').join('') + '</div><em id="in-as"></em></div></div>' +
    '<div class="in-bos"></div>' +
    '<div class="in-kart" id="in-kart"></div>';
  let mesgul = false, gor = false, onYuk = {};
  const asama = () => Math.min(P.n, Math.max(1, (SV.insa && SV.insa[P.id]) || 1));
  const yukle = (i) => onYuk[i] || (onYuk[i] = new Promise((ok) => { const im = new Image(); im.onload = im.onerror = () => ok(im); im.src = P.res(i); }));
  // v10.15 (acilis hizi): gemi resimleri yalniz Insa sayfasi acilinca iner
  const hapEl = () => M.querySelector('#m-ahap .coin');
  const $ = (id) => sayfa.querySelector('#' + id);

  const FY = (ad) => Math.round(ad.f * ((SV.dost || []).includes('kunduz') && !/[?&]dost=0/.test(location.search) ? 0.9 : 1));   // v12.41 Kunduz Kundi (Marangoz): insa %10 ucuz
  function hazirMi() { const a = asama(); return a < P.n && (SV.altin || 0) >= FY(P.adim[a + 1]); }
  function ciz() {
    const a = asama();
    if (!mesgul && gor) { RA.src = P.res(a); }
    $('in-as').textContent = 'Aşama ' + a + '/' + P.n;
    [...$('in-pip').children].forEach((p, k) => { p.classList.toggle('on', k < a); p.classList.toggle('sr', k === a); });
    const K = $('in-kart'), al = SV.altin || 0;
    if (a >= P.n) {
      K.innerHTML = '<div class="in-bit"><b>Gemi tamamlandı!</b><small>Yeni projeler çok yakında, Kaptan!</small></div>';
    } else {
      const ad = P.adim[a + 1], ok = al >= FY(ad);
      K.innerHTML = '<div class="in-sir"><small>SIRADAKİ AŞAMA</small><b>' + ad.ad + '</b></div>' +
        '<button class="m-btn uz in-btn' + (ok ? ' hazir' : ' az tur') + '" id="in-btn">' + (ok ? 'İnşa Et' : 'Altın Topla') + '<span class="in-f"><i class="coin"></i>' + FY(ad) + '</span></button>' +
        (ok ? '' : '<div class="in-not">' + (FY(ad) - al) + ' altın daha lazım. Bölüm geç, altın kazan!</div>');
      $('in-btn').onclick = () => { tik(); if (ok) insa(); else oyna(); };
    }
    const nb = M.querySelector('.m-alt button[data-s="insa"]'); if (nb) nb.classList.toggle('in-nok', hazirMi());
    if (gor && !onYuk[a + 1] && a < P.n) yukle(a + 1);
  }

  function parca(x, y, n, tur) {   // tur: 't' talas, 'd' toz, 'y' isilti
    for (let k = 0; k < n; k++) {
      const e = document.createElement('i'); e.className = 'in-p in-p' + tur;
      const a = Math.random() * Math.PI * 2, v = tur === 'd' ? 40 + Math.random() * 70 : tur === 'y' ? 70 + Math.random() * 140 : 60 + Math.random() * 120;
      e.style.left = x + 'px'; e.style.top = y + 'px';
      e.style.setProperty('--dx', (Math.cos(a) * v).toFixed(0) + 'px'); e.style.setProperty('--dy', (Math.sin(a) * v * 0.7 - (tur === 'd' ? 20 : 30)).toFixed(0) + 'px');
      e.style.setProperty('--r', ((Math.random() - 0.5) * 900).toFixed(0) + 'deg'); e.style.setProperty('--s', (0.6 + Math.random() * 0.9).toFixed(2));
      e.style.animationDelay = (Math.random() * 60).toFixed(0) + 'ms';
      if (tur === 't') e.style.background = ['#c8843a', '#e8b070', '#9a5a20', '#f2cf94'][k % 4];
      PK.appendChild(e); setTimeout(() => e.remove(), 1400);
    }
  }
  function sars(g) { SAH.style.setProperty('--sg', g + 'px'); SAH.classList.remove('sars'); void SAH.offsetWidth; SAH.classList.add('sars'); }
  function vurus(x, y, n) {   // cekic vurur: buyuk cekic sallanir, tak sesi, talas + toz
    const c = document.createElement('div'); c.className = 'in-cek'; c.innerHTML = CEKIC; c.style.left = x + 'px'; c.style.top = y + 'px'; PK.appendChild(c);
    setTimeout(() => {
      A.ses('tahta', 0.85, 0.85 + Math.random() * 0.25); A.buzz(25); sars(4 + n * 2);
      parca(x - 18, y + 22, 9, 't'); parca(x - 18, y + 26, 5, 'd');
      const h = document.createElement('i'); h.className = 'in-halka'; h.style.left = (x - 18) + 'px'; h.style.top = (y + 24) + 'px'; PK.appendChild(h); setTimeout(() => h.remove(), 600);
    }, 170);
    setTimeout(() => c.remove(), 520);
  }

  async function insa() {
    const a = asama(); if (mesgul || a >= P.n) return; const ad = P.adim[a + 1]; if ((SV.altin || 0) < FY(ad)) return;
    mesgul = true; $('in-btn').disabled = true;
    const eski = SV.altin || 0; SV.altin = eski - FY(ad); SV.insa = SV.insa || {}; SV.insa[P.id] = a + 1; A.save();
    const yeni = yukle(a + 1);
    const r = SAH.getBoundingClientRect(), cx = r.left + r.width * 0.55, cy = r.top + r.height * 0.6;
    const h = hapEl().getBoundingClientRect(), N = 8;
    ucur2d(h.left + h.width / 2, h.top + h.height / 2, cx, cy, N, (k) => { altinYaz(Math.round(eski - FY(ad) * (k + 1) / N)); A.ses('para', 0.35, 1.25 - k * 0.03); });
    await bekle(900 + N * 55);
    const sr = SAH.getBoundingClientRect(), nok = [[0.42, 0.62], [0.66, 0.55], [0.54, 0.7]];
    for (let k = 0; k < 3; k++) { vurus(sr.width * nok[k][0], sr.height * nok[k][1], k); await bekle(330); }
    await yeni; await bekle(120);
    // parlama ve resim degisimi
    FL.classList.remove('on'); void FL.offsetWidth; FL.classList.add('on');
    await bekle(170);
    RB.src = P.res(a + 1); RB.classList.add('gir'); A.ses('sandik', 0.55); A.buzz([60, 30, 60]); sars(10);
    parca(sr.width * 0.55, sr.height * 0.62, 22, 'd'); parca(sr.width * 0.55, sr.height * 0.5, 26, 'y');
    await bekle(650);
    RA.src = RB.src; await bekle(30); RB.classList.remove('gir'); RB.removeAttribute('src');
    A.sfx('bonus');
    const son = a + 1 >= P.n;
    const il = document.createElement('div'); il.className = 'in-ilan' + (son ? ' son' : '');
    il.innerHTML = yazi(ad.bitti.toLocaleUpperCase('tr'), son ? 'altin' : 'altin', { w: 'min(88vw,420px)', derin: 9 }) + '<b>Aşama ' + (a + 1) + '/' + P.n + '</b>';
    sayfa.appendChild(il); setTimeout(() => il.classList.add('cik'), son ? 3000 : 1800); setTimeout(() => il.remove(), son ? 3500 : 2300);
    if (son) { A.sfx('kazan'); for (let k = 0; k < 4; k++) setTimeout(() => parca(sr.width * (0.2 + Math.random() * 0.6), sr.height * (0.25 + Math.random() * 0.4), 24, 'y'), k * 280); }
    const pip = $('in-pip').children[a]; if (pip) { pip.classList.add('on', 'pat'); }
    mesgul = false; altinYaz(SV.altin || 0); ciz();
  }
  const bekle = (ms) => new Promise((ok) => setTimeout(ok, ms));
  function goster(v) { gor = v; F.classList.toggle('on', v); if (v) ciz(); }
  ciz();
  return { ciz, goster, hazirMi };
}
