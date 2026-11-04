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
  const FORMS = ['반팔 셔츠', '맨투맨', '원피스', '로브', '민소매', '긴팔 원피스'];
  // 내 모자: 앞(32×32, 앞 반 바퀴) · 뒤(32×32, 뒤 반 바퀴) · 챙/접단(32×32). 예전 2048칸(몸통 하나)은 앞뒤에 똑같이 넣어 읽어요
  const HFORMS = ['캡모자', '비니', '버킷햇'];
  const HPARTS = { hfront: [0, 32], hback: [1024, 32], brim: [2048, 32] };
  const HLEN = 3072;
  const HPAL = ['#f3ead6', '#2b2b2b', '#d9383a', '#f4bd4f', '#2f56a6', '#7cc79a', '#fffdf6', '#57779a', '#f0dc8a', '#b39ddb', '#8a5a35', '#c9a77c', '#9a9a9a', '#f28b82', '#3f9a68'];
  // 내 디자인: 칸마다 0(비어 있음 = 윗옷 색) 또는 물감 1~15번. dsg는 칸을 16진수 한 글자씩 이은 문자열
  // 순서: 앞(64×64) · 뒤(64×64) · 왼소매(32×32) · 오른소매(32×32) = 10240칸
  // 예전 형식(앞 32×32만 1024칸, 또는 32·32·16·16 = 2560칸)은 2배로 늘려서 읽어요
  const DN = 64;
  const PARTS = { front: [0, 64], back: [4096, 64], left: [8192, 32], right: [9216, 32] };
  const DLEN = 10240;
  const OLD = { front: [0, 32], back: [1024, 32], left: [2048, 16], right: [2304, 16] };
  const DPAL = ['#ffffff', '#2b2b2b', '#d9383a', '#f28b82', '#ff9f68', '#f4bd4f', '#fff07a', '#7cc79a', '#3f9a68', '#7fb3e0', '#2f56a6', '#b39ddb', '#8a5a35', '#c9a77c', '#9a9a9a'];
  const BOTTOMS = ['긴바지', '반바지', '치마', '롱스커트', '7부바지'];
  const ACCS = ['없음', '나뭇잎', '리본', '안경', '캡모자', '비니', '머리띠', '꽃', '선글라스', '마스크', '내 모자'];
  const HAT_ACC = ACCS.length - 1;
  const TEXS = ['매끈', '약하게', '보통', '강하게'];          // 옷 질감 (주름·그림자·직물 결의 세기)
  const TEX_K = [0, .5, 1, 1.7];
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
  const cleanHdsg = d => typeof d !== 'string' || !DSG.test(d) ? '' : d.length === HLEN ? d : d.length === 2048 ? d.slice(0, 1024) + d.slice(0, 1024) + d.slice(1024) : '';
  const cleanPal = (p, def) => Array.isArray(p) && p.length === def.length && p.every(c => typeof c === 'string' && HEX.test(c.toLowerCase())) ? p.map(c => c.toLowerCase()) : def.slice();
  const cleanDsg = d => typeof d === 'string' && DSG.test(d) ? (d.length === DLEN ? d : d.length === 1024 || d.length === 2560 ? upscale(d) : '') : '';
  function cleanLook(l) {
    const o = {};
    o.dsg = cleanDsg(l && l.dsg);
    o.dform = l && Number.isInteger(l.dform) && l.dform >= 0 && l.dform < FORMS.length ? l.dform : 1;
    o.hdsg = cleanHdsg(l && l.hdsg);
    o.hpal = cleanPal(l && l.hpal, HPAL);
    o.hform = l && Number.isInteger(l.hform) && l.hform >= 0 && l.hform < HFORMS.length ? l.hform : 0;
    o.tex = l && Number.isInteger(l.tex) && l.tex >= 0 && l.tex < TEXS.length ? l.tex : 2;
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
    const [off, n] = PARTS[part] || HPARTS[part];
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
  function paintParts(f, parts = PARTS, len = DLEN) {   // f(part, x, y, n) → 0~15
    const out = Array(len).fill(0);
    for (const p in parts) { const [off, n] = parts[p]; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) out[off + y * n + x] = f(p, x, y, n) || 0; }
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
  // 로브: 검은 겉옷(앞섶·소매 안쪽 파란 안감) 안에 단색 브이넥 조끼(흰색·파랑·흰색 테두리, 밑단 흰색·파랑),
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
      const vHalf = 14.4 - y * .8;                             // 브이넥 (18번째 줄쯤에서 끝나요)
      if (y < 19 && c < vHalf) {
        if (c < 2.6 && y >= 2) return y < 6 ? 7 : ((x + y) % 6 < 3 ? 6 : 7);   // 넥타이: 매듭 + 대각선 줄무늬
        if (y < 8 && c > vHalf - 6) return y >= 6 ? 12 : 5;    // 셔츠 깃
        return 5;
      }
      if (y < 26) { const t = c - vHalf; if (t < 2) return 5; if (t < 4) return 3; if (t < 6) return 5; }   // 브이넥 테두리: 흰색 · 파랑 · 흰색
      if (y === 44 || y === 45) return 5;                      // 조끼 밑단: 흰색 · 파랑
      if (y === 46 || y === 47) return 3;
      if (y < 44) return 4;                                    // 조끼 (단색)
      return x % 8 === 0 ? 11 : 2;                             // 주름 치마
    }) };
  // 별 모양 안에 있는지 (중심 cx, cy, 바깥 반지름 R): 꼭짓점 10개짜리 다각형 안쪽 판정
  function inStar(x, y, cx, cy, R, sx = 1) {   // sx > 1 이면 가로 칸 수를 줄여 그려요 (가로로 긴 칸에서도 별이 동그랗게)
    const px = cx + (x + .5 - cx) * sx, py = y + .5, pts = [];
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? R * .45 : R; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    let inside = false;
    for (let i = 0, j = 9; i < 10; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  // 별무늬 멜빵 원피스: 크림·연노랑 줄무늬 긴팔 셔츠(뾰족한 깃, 소매 끝단) 위에 데님 멜빵 원피스.
  //   어깨끈 박음질과 노란 단추, 가슴판 테두리 박음질과 노란 별, 허리띠, 물 빠진 듯한 데님 얼룩과 가장자리 그림자, 큰 별 몇 개, 밑단 띠
  const STAR_DRESS = { name: '별무늬 멜빵 원피스', kind: 'top', dform: 5,
    dpal: ['#fbf4db', '#efd98d', '#57789b', '#3f5b7c', '#7896b5', '#f5d062', '#dcb246', '#a9bfd6', '#93adc8', '#e3d39f', '#2f4561', '#fffaea', '#4a6a8c', '#c9a77c', '#9a9a9a'],
    dsg: paintParts((p, x, y, n) => {
      const c = Math.abs(x - (n - 1) / 2);
      const shirt = xx => (xx % 3 === 2 ? 2 : 1);                         // 크림 2칸 · 연노랑 1칸 세로 줄무늬
      if (p === 'left' || p === 'right') {
        if (y >= 27) return y === 27 ? 10 : 12;                            // 소매 끝단
        return shirt(x);
      }
      // 물 빠짐 얼룩 + 가장자리·아래쪽 그림자
      const denim = (xx, yy, top) => {
        const w = Math.sin(xx * .31 + yy * .13) * .55 + Math.sin(xx * .12 - yy * .27 + 1.3) * .6 + Math.sin((xx + yy) * .19 + 2.1) * .35;
        const edge = Math.pow(c / 32, 2) * .9 + Math.max(0, yy - top) / 64 * .35;
        if (edge > .97) return 11;
        if (edge > .72 || (w < -1 && edge > .4)) return 4;
        if (w > 1.05) return 9;
        if (w > .5) return 5;
        return (xx * 7 + yy * 5) % 37 === 0 ? 13 : 3;
      };
      const star = (sx, sy, R) => inStar(x, y, sx, sy, R) ? (y + .5 > sy + R * .1 ? 7 : 6) : 0;
      const stitch = (xx, yy) => (xx + yy) % 2 === 0;
      if (p === 'front') {
        // 셔츠 깃
        if (y < 8 && c < 10) { const flap = c > 1 && y < 1.4 * (c - 1) + 1 && y < 8 - (c - 1) * .35; if (flap) return (y === 7 || c > 9) ? 10 : 12; }
        // 치마
        if (y >= 33) {
          if (y >= 61) return 4;                                           // 밑단 띠
          if (y === 60) return stitch(x, y) ? 8 : 4;
          return star(15, 44, 6.5) || star(49, 51, 5.5) || star(29, 58, 3.8) || denim(x, y, 33);
        }
        if (y >= 30) return y === 31 && stitch(x, y) ? 8 : 4;              // 허리띠 + 박음질
        // 가슴판
        if (y >= 14 && c < 12.5) {
          if (c > 11.5 || y === 14) return 4;
          if ((c > 10.3 && c <= 11.5) || y === 15) return stitch(x, y) ? 8 : 3;
          return star(31.5, 22.5, 6.2) || denim(x, y, 14);
        }
        // 어깨끈 + 단추
        for (const sx of [21, 42]) {
          const d = Math.abs(x + .5 - sx);
          if (d < 3.5) {
            if (y >= 12 && y <= 15 && d < 1.6) return y === 12 ? 7 : 6;  // 노란 단추
            if (d < .6) return stitch(x, y) ? 8 : 3;
            return d > 2.9 ? 4 : 3;
          }
        }
        return shirt(x);
      }
      // 뒤: 엑스자로 엇갈린 어깨끈, 치마
      if (y >= 33) { if (y >= 61) return 4; if (y === 60) return stitch(x, y) ? 8 : 4; return star(20, 45, 5.5) || star(46, 55, 4.5) || denim(x, y, 33); }
      if (y >= 30) return y === 31 && stitch(x, y) ? 8 : 4;
      if (y >= 24 && c < 13) return y === 24 ? 4 : denim(x, y, 24);       // 뒤 허리 패널
      for (const [x0, k] of [[17, .62], [46, -.62]]) {
        const d = Math.abs(x + .5 - (x0 + y * k));
        if (d < 3.2) return d < .6 ? (stitch(x, y) ? 8 : 3) : d > 2.6 ? 4 : 3;
      }
      return shirt(x);
    }) };
  // 별 캡모자: 앞은 넓은 크림 앞판에 작은 노란 별과 정수리 단추(옆은 데님), 뒤는 데님에 뒷면 조절 끈, 챙은 노랑·크림 줄무늬
  const STAR_CAP = { name: '별 캡모자', kind: 'hat', hform: 0,
    hpal: ['#f3ece0', '#5f80a3', '#4b6a8c', '#f4cf5a', '#d9b44a', '#f0dc8a', '#fbf3d0', '#e2d6bf', '#3d5673', '#b39ddb', '#8a5a35', '#c9a77c', '#9a9a9a', '#f28b82', '#3f9a68'],
    hdsg: paintParts((p, x, y, n) => {
      const denim = (xx, yy) => (xx * 3 + yy * 7) % 19 === 0 ? 3 : 2;
      if (p === 'brim') return Math.floor(x / 2) % 2 ? 6 : 7;              // 챙: 노랑·크림 줄무늬
      if (p === 'hfront') {
        if (y < 2 && x >= 14 && x <= 17) return 9;                          // 정수리 단추
        if (x < 5 || x > 26) return denim(x, y);                           // 옆판 데님
        if (x === 5 || x === 26) return 8;                                 // 이음선
        if (inStar(x, y, 16, 18, 7.5, 2)) return y > 21 ? 5 : 4;           // 작은 노란 별
        return 1;
      }
      // 뒤
      if (y < 2 && x >= 14 && x <= 17) return 9;
      if (x === 15 || x === 16) { if (y < 21) return 3; }                  // 가운데 이음선
      if (y >= 22 && y <= 24 && x >= 9 && x <= 22) return x === 21 ? 9 : 6;  // 조절 끈
      if (y >= 25 && x >= 12 && x <= 19) return 9;                         // 뒤 트임
      return denim(x, y);
    }, HPARTS, HLEN) };
  // 특정 멤버 옷장에만 한 번 넣어 주는 디자인 (이메일 → 디자인 목록)
  const GIFTS = { 'psh050308@gmail.com': [{ id: 'gift-robe-5', kind: 'top', ...ROBE }, { id: 'gift-stargazer-dress-2', ...STAR_DRESS }, { id: 'gift-stargazer-cap-3', ...STAR_CAP }] };
  window.AZIT_LOOK = { HAT_ACC, TEXS, TEX_K, HFORMS, HPARTS, HLEN, HPAL, cleanHdsg, cleanPal, FORMS, DESIGN_TOP, DN, DPAL, PARTS, DLEN, GIFTS, cleanDsg, designCanvas, PAL, STYLES, EYES, TOPS, BOTTOMS, ACCS, COLOR_KEYS, LIMIT, cleanLook, colorOf, randomLook, shade, lum };
})();
