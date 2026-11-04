// 캐릭터 모양 정의. index.html(2D 캐릭터)과 room.html(3D 캐릭터)이 같이 써요.
// look = { skin, hair, shirt, pants: 기본 색 번호 또는 '#rrggbb', style, top, bottom, acc: 번호 }
(function () {
  const PAL = {
    skin: ['#ffe3c8', '#f7cfa8', '#e9b38a', '#c98d62', '#8f5d3d', '#5e3a24'],
    hair: ['#2b211c', '#5a3826', '#8a5a35', '#d9a45b', '#f2d58a', '#c9503c', '#6b7fd1', '#9a9a9a', '#f4f1ea', '#e889a6', '#5fb784', '#3a3f8f'],
    shirt: ['#7cc79a', '#f4bd4f', '#f28b82', '#7fb3e0', '#b39ddb', '#fffdf6', '#4b3a2a', '#ff9f68', '#2b2b2b', '#d9383a', '#2f56a6', '#f6a5c0'],
    pants: ['#5b4a3b', '#3b4a6b', '#8a8f98', '#c9a77c', '#2b2b2b', '#6f8f5a', '#a84a3a', '#e9e1cf'],
  };
  const STYLES = ['단정', '삐죽', '포니테일', '단발', '긴 머리', '양갈래', '곱슬', '똥머리'];
  const TOPS = ['티셔츠', '후드티', '셔츠', '줄무늬', '멜빵'];
  const BOTTOMS = ['긴바지', '반바지', '치마'];
  const ACCS = ['없음', '나뭇잎', '리본', '안경'];
  const COLOR_KEYS = ['skin', 'hair', 'shirt', 'pants'];
  const LIMIT = {
    skin: PAL.skin.length, hair: PAL.hair.length, style: STYLES.length, shirt: PAL.shirt.length,
    pants: PAL.pants.length, top: TOPS.length, bottom: BOTTOMS.length, acc: ACCS.length,
  };
  const HEX = /^#[0-9a-f]{6}$/;

  function cleanLook(l) {
    const o = {};
    for (const k in LIMIT) {
      const v = l && l[k];
      if (COLOR_KEYS.includes(k) && typeof v === 'string' && HEX.test(v.toLowerCase())) o[k] = v.toLowerCase();
      else o[k] = Number.isInteger(v) && v >= 0 && v < LIMIT[k] ? v : 0;
    }
    return o;
  }
  // 정리된 look에서 실제 색(#rrggbb)
  const colorOf = (l, k) => typeof l[k] === 'string' ? l[k] : PAL[k][l[k]];
  function randomLook() {
    const o = {}; for (const k in LIMIT) o[k] = Math.floor(Math.random() * LIMIT[k]); return o;
  }
  // amt > 0 이면 밝게, < 0 이면 어둡게 (-1 ~ 1)
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16), t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    const f = c => Math.round((t - c) * p + c);
    return '#' + ((1 << 24) | (f(n >> 16) << 16) | (f(n >> 8 & 255) << 8) | f(n & 255)).toString(16).slice(1);
  }
  function lum(hex) {
    const n = parseInt(hex.slice(1), 16);
    return ((n >> 16) * .299 + (n >> 8 & 255) * .587 + (n & 255) * .114) / 255;
  }
  window.AZIT_LOOK = { PAL, STYLES, TOPS, BOTTOMS, ACCS, COLOR_KEYS, LIMIT, cleanLook, colorOf, randomLook, shade, lum };
})();
