// Foxi Smash v10.12 (Adem 20 Kas 2026: 'Foxi Smash yazisi daha 3B kabartmali olsun'): ozgun 3B logo (SVG).
// Mor govdeli, altin kenarli, kahverengi dis cizgili rozet; ustte turuncu-altin FOXI, altta krem SMASH; harfler tek tek hafif egik ve
// zipli (oyuncak gibi), kalin koyu kontur, alta dogru 3B yan yuz, ustte parlama; rozetin tepesinde patili top. Eski logo: ?logo=eski
let say = 0;
const H = (s) => s;
function kelime(id, txt, x, y, fs, don, dy, renk, yan, isik) {
  const rot = don.join(' '), dys = dy.join(' ');
  const t = (ek) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="'BS Baslik','Baloo 2',sans-serif" font-weight="900" font-size="${fs}" letter-spacing="-2" ${ek}><tspan rotate="${rot}" dy="${dys}">${txt}</tspan></text>`;
  let s = '', D = Math.round(fs * 0.16);   // 3B derinlik
  s += t(`fill="#1a0630" stroke="#1a0630" stroke-width="${fs * 0.42}" stroke-linejoin="round" transform="translate(0 ${D + 6})" opacity=".45"`);   // golge
  for (let i = D; i >= 0; i -= 2) s += t(`fill="#5a2a00" stroke="#5a2a00" stroke-width="${fs * 0.32}" stroke-linejoin="round" transform="translate(0 ${i})"`);   // dis kahve kenar (derinlikli)
  s += t(`fill="#ffd34a" stroke="#ffd34a" stroke-width="${fs * 0.24}" stroke-linejoin="round"`);   // altin dis kenar: harfleri mor rozetten ayirir
  s += t(`fill="#fff3b0" stroke="#fff3b0" stroke-width="${fs * 0.24}" stroke-linejoin="round" transform="translate(0 -2)" opacity=".55"`);
  for (let i = D; i >= 1; i--) s += t(`fill="${yan}" stroke="#2a0a40" stroke-width="${fs * 0.17}" stroke-linejoin="round" transform="translate(0 ${i})"`);   // 3B yan yuz
  s += t(`fill="${yan}" stroke="#2a0a40" stroke-width="${fs * 0.17}" stroke-linejoin="round"`);   // koyu kontur
  s += t(`fill="url(#${id})" stroke="${isik}" stroke-width="${fs * 0.035}" stroke-linejoin="round"`);   // on yuz
  s += `<g clip-path="url(#${id}c)">` + t(`fill="url(#${id}p)"`) + '</g>';   // ust parlama
  return s;
}
export function logoSVG(o = {}) {
  const n = ++say, A = 'lg' + n;
  const ft = (yy) => `<clipPath id="${A}${yy}c"><rect x="0" y="0" width="400" height="${yy}"/></clipPath>`;
  let s = `<svg class="logo2" viewBox="0 -8 400 312" role="img" aria-label="Foxi Smash"><defs>
  <linearGradient id="${A}f" x1="0" y1="0" x2="0" y2="1"><stop offset=".05" stop-color="#fffbd0"/><stop offset=".42" stop-color="#ffd23a"/><stop offset=".75" stop-color="#ff9a12"/><stop offset="1" stop-color="#ff6a00"/></linearGradient>
  <linearGradient id="${A}s" x1="0" y1="0" x2="0" y2="1"><stop offset=".05" stop-color="#ffffff"/><stop offset=".55" stop-color="#fff4e2"/><stop offset="1" stop-color="#ffd9a8"/></linearGradient>
  <linearGradient id="${A}fp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="${A}sp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="${A}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a52ff"/><stop offset=".55" stop-color="#5a24d6"/><stop offset="1" stop-color="#3a1296"/></linearGradient>
  <radialGradient id="${A}t" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#9a6aff"/><stop offset=".6" stop-color="#5a24d6"/><stop offset="1" stop-color="#2a0a80"/></radialGradient>
  <clipPath id="${A}fc"><rect x="-10" y="-10" width="420" height="100"/></clipPath><clipPath id="${A}sc"><rect x="-10" y="-10" width="420" height="208"/></clipPath>
  </defs>`;
  // rozet: iki yuvarlak kutu birlesimi (once kalin kahve dis cizgi, sonra altin kenar, sonra mor govde) -> tek parca gorunur
  const kutu = (k) => `<rect x="52" y="40" width="296" height="124" rx="48" ${k}/><rect x="14" y="150" width="372" height="122" rx="50" ${k}/>`;
  s += `<g transform="translate(0 10)" opacity=".45">${kutu('fill="#1a0630"')}</g>`;
  s += kutu('fill="#5a2a00" stroke="#5a2a00" stroke-width="30" stroke-linejoin="round"');
  s += kutu('fill="#ffd34a" stroke="#ffd34a" stroke-width="18" stroke-linejoin="round"');
  s += `<g transform="translate(0 6)">${kutu('fill="#2a0a80"')}</g>` + kutu(`fill="url(#${A}r)"`);
  s += `<rect x="70" y="48" width="260" height="30" rx="15" fill="#fff" opacity=".16"/><rect x="34" y="166" width="332" height="26" rx="13" fill="#fff" opacity=".12"/>`;
  // tepede patili top
  s += `<g transform="translate(200 18)"><circle r="31" fill="#5a2a00"/><circle r="27" fill="#ffd34a"/><circle r="23" fill="url(#${A}t)"/>
    <path d="M-23 4 Q0 14 23 4 L23 10 Q0 20 -23 10Z" fill="#ffd34a" opacity=".9"/>
    <g fill="#ffe98a"><ellipse cx="0" cy="-2" rx="7.5" ry="6.5"/><circle cx="-9" cy="-11" r="3.4"/><circle cx="-3" cy="-15.5" r="3.4"/><circle cx="3" cy="-15.5" r="3.4"/><circle cx="9" cy="-11" r="3.4"/></g>
    <ellipse cx="-9" cy="-12" rx="8" ry="5" fill="#fff" opacity=".35" transform="rotate(-30 -9 -12)"/></g>`;
  // yazilar (ust parlama icin kelime basina kirpma yuksekligi)
  s += kelime(A + 'f', 'FOXI', 200, 132, 100, [-9, 6, -6, 8], [0, -7, 8, -7], '#b03a00', '#fff3a0');
  s += kelime(A + 's', 'SMASH', 200, 240, 90, [-7, 5, -5, 7, -6], [0, 7, -8, 8, -7], '#a04a14', '#ffffff');
  return s + '</svg>';
}
