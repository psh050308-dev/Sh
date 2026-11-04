// 캐릭터 모양 정의. index.html(2D 캐릭터)과 room.html(3D 캐릭터)이 같이 써요.
// look = { skin, hair, shirt, pants: 기본 색 번호 또는 '#rrggbb', style, top, bottom, acc: 번호 }
(function () {
  const PAL = {
    skin: ['#ffe3c8', '#f7cfa8', '#e9b38a', '#c98d62', '#8f5d3d', '#5e3a24'],
    hair: ['#2b211c', '#5a3826', '#8a5a35', '#d9a45b', '#f2d58a', '#c9503c', '#6b7fd1', '#9a9a9a', '#f4f1ea', '#e889a6', '#5fb784', '#3a3f8f'],
    shirt: ['#7cc79a', '#f4bd4f', '#f28b82', '#7fb3e0', '#b39ddb', '#fffdf6', '#4b3a2a', '#ff9f68', '#2b2b2b', '#d9383a', '#2f56a6', '#f6a5c0'],
    pants: ['#5b4a3b', '#3b4a6b', '#8a8f98', '#c9a77c', '#2b2b2b', '#6f8f5a', '#a84a3a', '#e9e1cf'],
  };
  const STYLES = ['단정', '삐죽', '포니테일', '단발', '긴 머리', '양갈래', '곱슬', '똥머리',
    '가르마', '일자 앞머리', '바가지', '땋은 머리', '양쪽 똥머리', '반묶음', '옆 포니테일', '웨이브',
    '모히칸', '뻗친 머리', '높은 포니테일', '숏컷', '낮은 묶음', '아프로', '양갈래 땋기', '히메컷', '올백', '앞머리 긴 머리',
    '큰 똥머리', '낮은 똥머리', '옆 똥머리', '반묶음 똥머리', '양갈래 반묶음', '앞머리 똥머리', '앞머리 양쪽 똥머리', '반묶음 앞머리'];
  const EYES = ['기본', '동글', '속눈썹', '졸린 눈', '웃는 눈', '감은 눈', '반짝', '점 눈', '작은 눈동자', '옆 보기', '윙크', '진한 눈썹', '화장 눈', '길쭉 눈', '무심한 눈', '초롱 눈'];
  const TOPS = ['티셔츠', '후드티', '셔츠', '줄무늬', '멜빵', '니트', '체크', '하트 맨투맨', '조끼', '넥타이', '나시', '내 디자인'];
  const DESIGN_TOP = TOPS.length - 1;
  // 내 디자인: 칸마다 0(비어 있음 = 윗옷 색) 또는 물감 1~15번. dsg는 칸을 16진수 한 글자씩 이은 문자열
  // 순서: 앞(32×32) · 뒤(32×32) · 왼소매(16×16) · 오른소매(16×16) = 2560칸. 예전 1024칸(앞만)도 읽어요
  const DN = 32;
  const PARTS = { front: [0, 32], back: [1024, 32], left: [2048, 16], right: [2304, 16] };
  const DLEN = 2560;
  const DPAL = ['#ffffff', '#2b2b2b', '#d9383a', '#f28b82', '#ff9f68', '#f4bd4f', '#fff07a', '#7cc79a', '#3f9a68', '#7fb3e0', '#2f56a6', '#b39ddb', '#8a5a35', '#c9a77c', '#9a9a9a'];
  const BOTTOMS = ['긴바지', '반바지', '치마', '롱스커트', '7부바지'];
  const ACCS = ['없음', '나뭇잎', '리본', '안경', '캡모자', '비니', '머리띠', '꽃', '선글라스', '마스크'];
  const COLOR_KEYS = ['skin', 'hair', 'shirt', 'pants'];
  const LIMIT = {
    skin: PAL.skin.length, hair: PAL.hair.length, style: STYLES.length, shirt: PAL.shirt.length,
    pants: PAL.pants.length, top: TOPS.length, bottom: BOTTOMS.length, acc: ACCS.length, eye: EYES.length,
  };
  const HEX = /^#[0-9a-f]{6}$/;

  const DSG = /^([0-9a-f]{1024}|[0-9a-f]{2560})$/;
  const cleanDsg = d => typeof d === 'string' && DSG.test(d) ? (d.length === DLEN ? d : d + '0'.repeat(DLEN - d.length)) : '';
  function cleanLook(l) {
    const o = {};
    o.dsg = cleanDsg(l && l.dsg);
    o.dpal = l && Array.isArray(l.dpal) && l.dpal.length === DPAL.length && l.dpal.every(c => typeof c === 'string' && HEX.test(c.toLowerCase()))
      ? l.dpal.map(c => c.toLowerCase()) : DPAL.slice();
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
  // 디자인을 32×32 캔버스로 (빈 칸은 투명)
  const dcache = new Map();
  function designCanvas(dsg, dpal, part = 'front') {
    const key = part + dsg + dpal.join();
    if (dcache.has(key)) return dcache.get(key);
    const [off, n] = PARTS[part];
    const c = document.createElement('canvas'); c.width = c.height = n;
    const g = c.getContext('2d');
    for (let i = 0; i < n * n; i++) {
      const v = parseInt(dsg[off + i], 16);
      if (v) { g.fillStyle = dpal[v - 1]; g.fillRect(i % n, Math.floor(i / n), 1, 1); }
    }
    if (dcache.size > 60) dcache.delete(dcache.keys().next().value);
    dcache.set(key, c);
    return c;
  }
  // ---------- 기본 옷장 디자인 ----------
  function paintParts(f) {   // f(part, x, y, n) → 0~15
    const out = Array(DLEN).fill(0);
    for (const p in PARTS) { const [off, n] = PARTS[p]; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) out[off + y * n + x] = f(p, x, y, n) || 0; }
    return out.map(v => v.toString(16)).join('');
  }
  // 로브: 검은 겉옷 + 파란 안감, 회색 조끼, 흰 셔츠 깃, 줄무늬 넥타이
  const ROBE = { name: '로브', dpal: ['#1b1c22', '#2c2f39', '#2f56a6', '#6f7684', '#fffdf6', '#a9b2c2', '#1f3270', '#c9ced8', '#3a3f4c', '#4b5aa0', '#2b2b2b', '#b39ddb', '#8a5a35', '#c9a77c', '#9a9a9a'],
    dsg: paintParts((p, x, y, n) => {
      if (p === 'left' || p === 'right') {
        if (y >= 11 && y <= 13) return 3;                      // 파란 소매 안감
        return (x === 0 || x === n - 1) ? 2 : 1;
      }
      if (p === 'back') {
        const hood = y < 10 && Math.abs(x - 15.5) < 9 - y * .35;
        if (hood) return (y === 9 || Math.abs(x - 15.5) > 7.6 - y * .35) ? 3 : 2;
        if (x === 15 || x === 16) return y > 12 ? 2 : 1;      // 뒤 트임
        return 1;
      }
      // 앞
      const c = Math.abs(x - 15.5);
      if (c > 5.5) {                                           // 겉옷
        if (c < 7) return 3;                                   // 앞 여밈 파란 안감
        if (y < 3 && c < 9) return 3;                          // 후드 안감
        if (y >= 9 && y <= 11 && x >= 4 && x <= 6) return y === 10 && x === 5 ? 8 : 3;   // 가슴 문장
        return 1;
      }
      if (y < 7 && c > 5.5 - (7 - y) * .8) return 5;          // 셔츠 깃
      if (c < 1) { if (y >= 1 && y <= 21) return Math.floor((y - 1) / 2) % 2 ? 6 : 7; }  // 넥타이
      if (y < 7) return 5;
      if (y < 24) return (y + x) % 6 === 0 ? 9 : 4;           // 니트 조끼
      return 2;
    }) };
  // 특정 멤버 옷장에만 한 번 넣어 주는 디자인 (이메일 → 디자인 목록)
  const GIFTS = { 'psh050308@gmail.com': [{ id: 'gift-robe', ...ROBE }] };
  // 부드럽게: 칸 계단을 다듬는 2배 확대(EPX)를 3번 → 8배 크기 캔버스
  function epx(g, n) {
    const o = new Array(n * n * 4), at = (x, y) => g[Math.min(n - 1, Math.max(0, y)) * n + Math.min(n - 1, Math.max(0, x))], m = n * 2;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const p = at(x, y), a = at(x, y - 1), b = at(x + 1, y), c = at(x - 1, y), d = at(x, y + 1);
      o[(2 * y) * m + 2 * x] = c === a && c !== d && a !== b ? a : p;
      o[(2 * y) * m + 2 * x + 1] = a === b && a !== c && b !== d ? b : p;
      o[(2 * y + 1) * m + 2 * x] = d === c && d !== b && c !== a ? c : p;
      o[(2 * y + 1) * m + 2 * x + 1] = b === d && b !== a && d !== c ? d : p;
    }
    return o;
  }
  const scache = new Map();
  function designSmooth(dsg, dpal, part = 'front') {
    const key = part + dsg + dpal.join();
    if (scache.has(key)) return scache.get(key);
    const [off, n0] = PARTS[part];
    let g = Array.from({ length: n0 * n0 }, (_, i) => parseInt(dsg[off + i], 16)), n = n0;
    for (let k = 0; k < 3; k++) { g = epx(g, n); n *= 2; }
    const c = document.createElement('canvas'); c.width = c.height = n;
    const ctx = c.getContext('2d'), img = ctx.createImageData(n, n), rgb = dpal.map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
    for (let i = 0; i < n * n; i++) { const v = g[i]; if (v) { const [r, gg, b] = rgb[v - 1]; img.data[i * 4] = r; img.data[i * 4 + 1] = gg; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = 255; } }
    ctx.putImageData(img, 0, 0);
    if (scache.size > 60) scache.delete(scache.keys().next().value);
    scache.set(key, c);
    return c;
  }
  window.AZIT_LOOK = { designSmooth, DESIGN_TOP, DN, DPAL, PARTS, DLEN, GIFTS, cleanDsg, designCanvas, PAL, STYLES, EYES, TOPS, BOTTOMS, ACCS, COLOR_KEYS, LIMIT, cleanLook, colorOf, randomLook, shade, lum };
})();
