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
  // 내 디자인 옷 형태
  const FORMS = ['반팔 셔츠', '맨투맨', '원피스', '로브', '민소매'];
  // 내 디자인: 칸마다 0(비어 있음 = 윗옷 색) 또는 물감 1~15번. dsg는 칸을 16진수 한 글자씩 이은 문자열
  // 순서: 앞(64×64) · 뒤(64×64) · 왼소매(32×32) · 오른소매(32×32) = 10240칸
  // 예전 형식(앞 32×32만 1024칸, 또는 32·32·16·16 = 2560칸)은 2배로 늘려서 읽어요
  const DN = 64;
  const PARTS = { front: [0, 64], back: [4096, 64], left: [8192, 32], right: [9216, 32] };
  const DLEN = 10240;
  const OLD = { front: [0, 32], back: [1024, 32], left: [2048, 16], right: [2304, 16] };
  const DPAL = ['#ffffff', '#2b2b2b', '#d9383a', '#f28b82', '#ff9f68', '#f4bd4f', '#fff07a', '#7cc79a', '#3f9a68', '#7fb3e0', '#2f56a6', '#b39ddb', '#8a5a35', '#c9a77c', '#9a9a9a'];
  const BOTTOMS = ['긴바지', '반바지', '치마', '롱스커트', '7부바지'];
  const ACCS = ['없음', '나뭇잎', '리본', '안경', '캡모자', '비니', '머리띠', '꽃', '선글라스', '마스크'];
  const COLOR_KEYS = ['skin', 'hair', 'shirt', 'pants'];
  const LIMIT = {
    skin: PAL.skin.length, hair: PAL.hair.length, style: STYLES.length, shirt: PAL.shirt.length,
    pants: PAL.pants.length, top: TOPS.length, bottom: BOTTOMS.length, acc: ACCS.length, eye: EYES.length,
  };
  const HEX = /^#[0-9a-f]{6}$/;

  const DSG = /^[0-9a-f]+$/;
  function upscale(d) {   // 예전 디자인 → 새 형식 (칸 하나를 2×2로)
    const src = d.length === 1024 ? d + '0'.repeat(1536) : d, out = Array(DLEN).fill('0');
    for (const p in PARTS) {
      const [o0, n0] = OLD[p], [o1, n1] = PARTS[p];
      for (let y = 0; y < n1; y++) for (let x = 0; x < n1; x++) out[o1 + y * n1 + x] = src[o0 + (y >> 1) * n0 + (x >> 1)];
    }
    return out.join('');
  }
  const cleanDsg = d => typeof d === 'string' && DSG.test(d) ? (d.length === DLEN ? d : d.length === 1024 || d.length === 2560 ? upscale(d) : '') : '';
  function cleanLook(l) {
    const o = {};
    o.dsg = cleanDsg(l && l.dsg);
    o.dform = l && Number.isInteger(l.dform) && l.dform >= 0 && l.dform < FORMS.length ? l.dform : 1;
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
  // 로브: 검은 겉옷(앞섶·소매 안쪽 파란 안감) 안에 브이넥 니트 조끼, 흰 셔츠 깃, 대각선 줄무늬 넥타이, 주름 치마
  // 방패 모양 배지: 은색 테두리, 파란 바탕, 가운데 흰 독수리 무늬 (x 2~12, y 14~28)
  function badge(x, y) {
    const r = y - 14, cx = 7;
    if (r < 0 || r > 14) return 0;
    const half = r < 9 ? 5 : 5 - (r - 8) * .85;
    const d = Math.abs(x - cx);
    if (d > half) return 0;
    if (r === 0 || d > half - 1.2) return 8;                   // 은색 테두리
    if ((r === 4 && d <= 3) || (r === 5 && d >= 1 && d <= 4) || (r >= 3 && r <= 8 && d === 0)) return 5;   // 흰 무늬
    return 3;
  }
  // 로브: 검은 겉옷(앞섶·소매 안쪽 파란 안감) 안에 단색 브이넥 조끼(파랑·흰색·파랑 테두리, 밑단 파랑·흰색),
  //       흰 셔츠 깃, 대각선 줄무늬 넥타이, 주름 치마, 왼쪽 가슴 배지
  const ROBE = { name: '로브', dform: 3,
    dpal: ['#17181d', '#2a2d36', '#2f56a6', '#737a88', '#fffdf6', '#b9c1cf', '#1f3270', '#d6dae2', '#555c6a', '#3b4f8f', '#0f1014', '#8b93a3', '#8a5a35', '#c9a77c', '#9a9a9a'],
    dsg: paintParts((p, x, y, n) => {
      const c = Math.abs(x - (n - 1) / 2);
      if (p === 'left' || p === 'right') {                    // 나팔 소매: 끝 8줄은 파란 안감이 보여요
        if (y >= 24) return y < 26 ? 10 : 3;
        return c > 14 ? 11 : 1;
      }
      if (p === 'back') {
        if (y < 22) {                                          // 후드
          const hw = 21 - y * 1.1;
          if (c < hw) return (y >= 20 || c > hw - 2.5) ? 3 : (y < 6 ? 2 : 11);
        }
        if (c < 1 && y > 28) return 11;                        // 뒤 트임
        return 1;
      }
      // 앞
      if (c > 15) {                                            // 로브 겉감
        if (c <= 18) return 3;                                 // 앞섶 파란 안감
        if (y < 6 && c <= 22) return 3;                        // 어깨에 걸친 후드 안감
        return badge(x, y) || 1;
      }
      const vHalf = 14.4 - y * .55;                            // 브이넥
      if (y < 27 && c < vHalf) {
        if (c < 2.6 && y >= 2) return y < 6 ? 7 : ((x + y) % 6 < 3 ? 6 : 7);   // 넥타이: 매듭 + 대각선 줄무늬
        if (y < 8 && c > vHalf - 6) return y >= 6 ? 12 : 5;    // 셔츠 깃
        return 5;
      }
      if (y < 33) { const t = c - vHalf; if (t < 2) return 3; if (t < 4) return 5; if (t < 6) return 3; }   // 브이넥 테두리
      if (y === 44 || y === 45) return 3;                      // 조끼 밑단: 파랑 · 흰색
      if (y === 46 || y === 47) return 5;
      if (y < 44) return 4;                                    // 조끼 (단색)
      return x % 8 === 0 ? 11 : 2;                             // 주름 치마
    }) };
  // 특정 멤버 옷장에만 한 번 넣어 주는 디자인 (이메일 → 디자인 목록)
  const GIFTS = { 'psh050308@gmail.com': [{ id: 'gift-robe-4', ...ROBE }] };
  window.AZIT_LOOK = { FORMS, DESIGN_TOP, DN, DPAL, PARTS, DLEN, GIFTS, cleanDsg, designCanvas, PAL, STYLES, EYES, TOPS, BOTTOMS, ACCS, COLOR_KEYS, LIMIT, cleanLook, colorOf, randomLook, shade, lum };
})();
