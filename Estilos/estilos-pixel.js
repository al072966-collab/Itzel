'use strict';
// =====================================================================
//  Estilos de pixel: 16 bits, Game Boy, 1 bit, punto de cruz, ASCII
// =====================================================================
(function () {
  const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const bayer4 = (x, y) => (B4[(y & 3) * 4 + (x & 3)] + .5) / 16;
  const B8 = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21].map(v => (v + .5) / 64);
  const bayer8 = (x, y) => B8[(y & 7) * 8 + (x & 7)];
  const PX = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

  // mancha de pixeles sombreada (copas de arbol, rocas, nubes)
  function pixelBlob(ctx, circles, pal, seed, clipY = 1e9) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [cx, cy, r] of circles) { x0 = Math.min(x0, cx - r - 1); y0 = Math.min(y0, cy - r - 1); x1 = Math.max(x1, cx + r + 1); y1 = Math.max(y1, cy + r + 1); }
    x0 = Math.floor(x0); y0 = Math.floor(y0);
    const W = Math.ceil(x1) - x0 + 1, H = Math.ceil(y1) - y0 + 1, m = new Int8Array(W * H).fill(-1);
    const deep = new Float32Array(W * H);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const px = x0 + i + .5, py = y0 + j + .5; let best = -1e9, bi = -1;
      circles.forEach(([cx, cy, r], k) => { const d = r - Math.hypot(px - cx, py - cy); if (d > best) { best = d; bi = k; } });
      if (best >= 0 && py < clipY) { m[j * W + i] = bi; deep[j * W + i] = best; }
    }
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const k = m[j * W + i]; if (k < 0) continue;
      const edge = i === 0 || j === 0 || i === W - 1 || j === H - 1 || m[j * W + i - 1] < 0 || m[j * W + i + 1] < 0 || m[(j - 1) * W + i] < 0 || (m[(j + 1) * W + i] < 0 && y0 + j + 1 < clipY);
      const [cx, cy, r] = circles[k], px = x0 + i + .5, py = y0 + j + .5;
      let lum = -((px - cx) * .65 + (py - cy) * .95) / r + (hash2(px | 0, py | 0, seed) - .5) * .3;
      let c;
      if (edge) c = pal[0];
      else if (lum > .5) c = pal[3];
      else if (lum > .38) c = bayer4(i, j) < .5 ? pal[3] : pal[2];
      else if (lum > -.25) c = pal[2];
      else if (lum > -.38) c = bayer4(i, j) < .5 ? pal[2] : pal[1];
      else c = pal[1];
      PX(ctx, x0 + i, y0 + j, 1, 1, c);
    }
  }

  // ---------------- 1 · PIXEL 16 BITS ----------------
  const O = '#222034';
  function pixelHero(ctx, p, t) {
    const X = Math.round(p.x), Y = Math.round(p.y), fc = p.face;
    const run = p.on && Math.abs(p.vx) > 25, fr = run ? Math.floor(p.run / (TAU / 4)) % 4 : 0;
    const b = run ? (fr % 2 ? -1 : 0) : 0;
    const R = [];
    const r = (x, y, w, h, c, out = true) => R.push([x, y, w, h, c, out]);
    let legs;
    if (!p.on) legs = [[-4, -4, 2, 2], [1, -3, 2, 3]];
    else if (!run) legs = [[-3, -3, 2, 3], [1, -3, 2, 3]];
    else legs = [[[-4, -3, 2, 3], [2, -3, 2, 3]], [[-2, -4, 2, 3], [1, -3, 2, 3]], [[2, -3, 2, 3], [-4, -3, 2, 3]], [[1, -3, 2, 3], [-2, -4, 2, 3]]][fr];
    r(legs[0][0], legs[0][1], 2, legs[0][3], '#3f3f74'); r(legs[0][0], legs[0][1] + legs[0][3] - 1, 2, 1, '#45283c', false);
    r(legs[1][0], legs[1][1], 2, legs[1][3], '#5b6ee1'); r(legs[1][0], legs[1][1] + legs[1][3] - 1, 2, 1, '#663931', false);
    // bufanda (cola)
    const wave = run || !p.on ? 1 : .5;
    for (let i = 1; i <= 3; i++) r(-3 - 2 * i, -10 + b + Math.round(Math.sin(t * 10 - i * .9) * wave) + (run || !p.on ? 0 : (i > 1 ? 1 : 0)), 2, 2, i === 3 ? '#d95763' : '#ac3232');
    r(-4, -9 + b, 8, 6, '#306082');
    r(-3, -8 + b, 1, 4, '#639bff', false); r(-4, -4 + b, 8, 1, '#8a6f30', false);
    const arm = run ? (fr < 2 ? 1 : -2) : 0;
    r(arm, -8 + b, 2, 4, '#3f3f74', false); r(arm, -5 + b, 2, 1, '#eec39a', false);
    r(-4, -17 + b, 9, 8, '#45283c');
    r(-1, -14 + b, 6, 5, '#eec39a', false);
    r(-1, -14 + b, 4, 1, '#45283c', false); r(-2, -16 + b, 3, 1, '#76428a', false);
    const blink = (t % 3.7) < .12;
    r(1, -12 + b, 1, blink ? 1 : 2, O, false); r(3, -12 + b, 1, blink ? 1 : 2, O, false); r(4, -10 + b, 1, 1, '#d95763', false);
    r(-3, -10 + b, 7, 2, '#ac3232'); r(-2, -10 + b, 3, 1, '#d95763', false);
    const mx = (x, w) => fc > 0 ? X + x : X - x - w;
    for (const [x, y, w, h, , out] of R) if (out) PX(ctx, mx(x, w) - 1, Y + y - 1, w + 2, h + 2, O);
    for (const [x, y, w, h, c] of R) PX(ctx, mx(x, w), Y + y, w, h, c);
  }
  function pixelCoin(ctx, x, y, t) {
    const X = Math.round(x), Y = Math.round(y + Math.sin(t * 3 + x * .1) * 1.5);
    const w = Math.round(Math.abs(Math.cos(t * 3.2 + x * .05)) * 3);
    for (let r = -4; r <= 4; r++) { const hw = Math.round(w * Math.sqrt(1 - (r / 4.6) ** 2)); PX(ctx, X - hw - 1, Y + r, hw * 2 + 3, 1, O); }
    PX(ctx, X - w, Y - 5, w * 2 + 1, 1, O); PX(ctx, X - w, Y + 5, w * 2 + 1, 1, O);
    for (let r = -4; r <= 4; r++) { const hw = Math.round(w * Math.sqrt(1 - (r / 4.6) ** 2)); PX(ctx, X - hw, Y + r, hw * 2 + 1, 1, '#fbf236'); if (hw > 0) PX(ctx, X + hw, Y + r, 1, 1, '#df7126'); }
    if (w > 0) PX(ctx, X - w + (w > 1 ? 1 : 0), Y - 2, 1, 2, '#ffffff');
  }
  function pixelGoal(ctx, x, y, t) {
    const X = Math.round(x), Y = Math.round(y);
    PX(ctx, X - 1, Y - 42, 3, 42, O); PX(ctx, X, Y - 41, 1, 41, '#9badb7');
    PX(ctx, X - 2, Y - 46, 5, 5, O); PX(ctx, X - 1, Y - 45, 3, 3, '#fbf236');
    for (let i = 0; i < 14; i++) { const o = Math.round(Math.sin(t * 6 - i * .55) * 1.2 * (i / 14)); const h = 9 - Math.floor(i / 5); PX(ctx, X + 1 + i, Y - 40 + o - 1, 1, h + 2, O); PX(ctx, X + 1 + i, Y - 40 + o, 1, h, i % 4 < 2 ? '#ac3232' : '#d95763'); }
    PX(ctx, X - 3, Y - 2, 7, 2, '#595652');
  }

  defStyle({
    id: 'pixel', name: 'Pixel art 16 bits', ref: 'SNES · Celeste · Owlboy', order: 1,
    desc: 'Paleta limitada DB32, cada pixel puesto a mano, tramado (dithering) en el cielo y sombreado por luz.',
    fixedS: 1, pixel: true,
    fx: { dust: ['#cbdbfc', '#ffffff'], spark: ['#fbf236', '#ffffff', '#df7126'] },
    sky(ctx, f) {
      // el cielo llena toda la vista: sus bandas se reparten en lo alto y la ciudad baja junto con el piso
      const H = f.H || VH, alto = H - VH, dy = -(f.y0 || 0);
      ctx.drawImage(cached(f, 'sky-' + H, VW, H, x => {
        const bands = [[0, '#3f3f74'], [26, '#5b6ee1'], [Math.round(74 + alto * .6), '#639bff'], [122 + alto, '#5fcde4'], [166 + alto, '#cbdbfc'], [999 + alto, '#cbdbfc']];
        for (let i = 0; i < bands.length - 1; i++) PX(x, 0, bands[i][0], VW, bands[i + 1][0] - bands[i][0], bands[i][1]);
        for (let i = 1; i < bands.length - 1; i++) {
          const by = bands[i][0];
          for (let y = by - 7; y < by + 7; y++) for (let xx = 0; xx < VW; xx++) { const tt = (y - (by - 7)) / 14; PX(x, xx, y, 1, 1, bayer4(xx, y) < tt ? bands[i][1] : bands[i - 1][1]); }
        }
        // sol con halo tramado
        const sx = 336, sy = 50 + Math.round(alto * .7);
        for (let y = -22; y <= 22; y++) for (let xx = -22; xx <= 22; xx++) { const d = Math.hypot(xx, y); if (d < 21 && d > 12 && bayer4(xx + 64, y + 64) < (21 - d) / 18) PX(x, sx + xx, sy + y, 1, 1, '#cbdbfc'); }
        pixelBlob(x, [[sx, sy, 10]], ['#fbf236', '#fbf236', '#fbf236', '#ffffff'], 3);
      }), 0, 0, VW, H);
      // nubes
      for (let i = 0; i < 5; i++) {
        const c = cached(f, 'cloud' + i, 70, 30, x => {
          const R = rng(40 + i), cs = [];
          const n = 3 + (i % 3);
          for (let k = 0; k < n; k++) cs.push([12 + k * 10 + R() * 4, 18 - R() * 6 - (k > 0 && k < n - 1 ? 5 : 0), 6 + R() * 5]);
          pixelBlob(x, cs, ['#cbdbfc', '#cbdbfc', '#ffffff', '#ffffff'], 9 + i, 25);
          for (let xx = 0; xx < 70; xx++) PX(x, xx, 24, 1, 1, 'rgba(0,0,0,0)');
        });
        const cx = Math.round(wrap(i * 113 + 30 - f.cam * .08 - f.t * (2 + i * .6), VW + 90) - 80), cy = Math.round((14 + (i * 23) % 58) * (1 + alto / 90));
        ctx.drawImage(c, cx, cy);
      }
      ctx.save(); ctx.translate(0, dy);
      // Edzna y la sierrita a lo lejos (azul de distancia, sin nieve: esto es Campeche)
      strip(ctx, f, 'far', .14, (x, w) => {
        const hy = xx => 158 - CAMP.h(xx, 'far', 3) * 1.15;
        for (let xx = 0; xx < w; xx++) {
          const y = Math.round(hy(xx)), lit = hy(xx + 1) < hy(xx) - .01 || (hy(xx + 1) === hy(xx) && hy(xx - 1) > hy(xx));
          PX(x, xx, y, 1, VH - y, lit ? '#9cb2f0' : '#7d93dc');
          if (hy(xx - 1) > y + .5 || hy(xx + 1) > y + .5) PX(x, xx, y, 1, 1, '#b8c9f6');
          for (let yy = 150; yy < 172; yy++) if (bayer4(xx, yy) < (yy - 150) / 22) PX(x, xx, yy, 1, 1, '#a8c7f5');
        }
        PX(x, 0, 172, w, VH, '#a8c7f5');
      });
      // centro historico: fachadas de colores con ventanas de arco, catedral y muralla
      strip(ctx, f, 'city', .3, (x, w) => {
        const fac = CAMP.facades(-10, w + 10, 8); let fi = 0;
        const haze = c => mix(c, '#a8c7f5', .28);
        for (let xx = 0; xx < w; xx++) {
          const y = Math.round(176 - CAMP.h(xx, 'mid', 8) * 1.25), seg = CAMP.seg(xx, 'mid', 8);
          let c = '#cdbb98', top = '#e8d9b4';
          if (seg.t === 'casas') { while (fi < fac.length - 1 && fac[fi].x0 + fac[fi].w <= xx) fi++; const fa = fac[fi]; c = haze(CAMP.FACHADAS[fa.col]); top = shade(c, .35); if (xx - fa.x0 < 1) c = shade(c, -.25); }
          else if (seg.t === 'catedral') { c = haze('#e6d2b0'); top = '#fff4dc'; }
          PX(x, xx, y, 1, VH - y, c); PX(x, xx, y, 1, 1, top);
        }
        for (const fa of fac) { const top = Math.round(176 - (4 + fa.h) * 1.25), n = Math.max(1, Math.floor(fa.w / 6.5)), gap = fa.w / n; for (let i = 0; i < n; i++) { const wx = Math.round(fa.x0 + gap * (i + .5)) - 1; PX(x, wx, top + 7, 2, 4, '#4a5a8a'); PX(x, wx, top + 6, 2, 1, shade(haze(CAMP.FACHADAS[fa.col]), -.2)); if (fa.doors && i === (n >> 1)) PX(x, wx - 1, 176 - 12, 4, 7, '#5a4a6a'); } }
        PX(x, 0, 176, w, VH, '#8fa8c8');
      });
      // selva baja, ceibas y palmeras (rasterizadas a pixel duro)
      strip(ctx, f, 'selva', .52, (x, w, c) => {
        x.fillStyle = '#2f6b56'; x.beginPath(); CAMP.skyline(x, 0, w, 214, 'near', 11, .9, 1);
        for (const q of CAMP.props(0, w, 'near', 11)) { const b = 214 - CAMP.h(q.x, 'near', 11) * .9 + 3; if (q.k === 'ceiba') CAMP.ceiba(x, q.x, b, q.h * .9, q.w * .9, q.s); else CAMP.palma(x, q.x, b, q.h * .9, q.lean, q.s); }
        x.fill();
        const cv = x.canvas, im = x.getImageData(0, 0, cv.width, cv.height), d = im.data;
        for (let yy = 0; yy < cv.height; yy++) for (let xx = 0; xx < cv.width; xx++) {
          const i = (yy * cv.width + xx) * 4; d[i + 3] = d[i + 3] > 110 ? 255 : 0;
          if (d[i + 3] && yy > 0 && d[i + 3 - cv.width * 4] === 0 || (d[i + 3] && yy > 0 && d[i - cv.width * 4 + 3] < 110)) { d[i] = 0x4c; d[i + 1] = 0x9a; d[i + 2] = 0x6f; }
        }
        x.putImageData(im, 0, 0);
      });
      ctx.restore();
    },
    telonPropio: true,
    terrain(ctx) {
      const W = L.ww, H = VH + 8, im = ctx.createImageData(W, H), d = im.data;
      const set = (x, y, c) => { const A = hex(c), p = (y * W + x) * 4; d[p] = A[0]; d[p + 1] = A[1]; d[p + 2] = A[2]; d[p + 3] = 255; };
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const cx = x >> 4, cy = y >> 4; if (!L.solid(cx, cy)) continue;
        const lx = x & 15, ly = y & 15, dep = L.depth(x, y);
        const topE = !L.solid(cx, cy - 1), lE = !L.solid(cx - 1, cy), rE = !L.solid(cx + 1, cy), bE = !L.solid(cx, cy + 1);
        if (topE && ly === 0 && ((lE && lx === 0) || (rE && lx === 15))) continue;
        const gd = 4 + (hash1(x, 5) < .4 ? 1 : 0) + (hash1(x >> 2, 6) < .3 ? 2 : 0);
        let c;
        if (dep < gd) c = dep === 0 ? '#99e550' : dep === gd - 1 ? '#37946e' : (hash2(x, y, 2) < .06 ? '#99e550' : '#6abe30');
        else {
          const band = dep + (bayer4(x, y) - .5) * 8 + (hash1(x >> 3, 77) - .5) * 9;
          c = band < 22 ? '#8f563b' : band < 40 ? '#663931' : '#45283c';
          if (dep < gd + 2) c = '#663931';
          // grano de tierra: terrones de 2×2 en dos tonos, y vetas horizontales que se cortan
          const tg = hash2(x >> 1, y >> 1, 21);
          if (dep >= gd + 2) {
            const [cl, os] = c === '#8f563b' ? ['#a0663f', '#7a4532'] : c === '#663931' ? ['#7a4436', '#552d28'] : ['#56304a', '#371f30'];
            if (tg < .1) c = cl; else if (tg > .86) c = os;
            if ((y + ((hash1(x >> 4, 9) * 7) | 0)) % 14 === 0 && hash2(x >> 3, y, 5) < .55) c = os;
          }
          const bx = x >> 3, by = y >> 3;
          if (dep > 8 && hash2(bx, by, 9) < .08) {
            const sx = bx * 8 + 2 + hash2(bx, by, 10) * 4, sy = by * 8 + 2 + hash2(bx, by, 11) * 4, rr = 1.6 + hash2(bx, by, 12) * 1.5;
            const dd = Math.hypot(x + .5 - sx, (y + .5 - sy) * 1.3);
            if (dd < rr) c = (x + .5 - sx) + (y + .5 - sy) < -1 ? '#c99a74' : (x + .5 - sx) + (y + .5 - sy) > 1 ? '#5a3226' : '#a6735a';
          } else if (hash2(x, y, 3) < .05) c = shade(c, -.25);
        }
        if ((lE && lx === 0) || (rE && lx === 15)) c = dep < gd ? '#4b692f' : '#45283c';
        if (bE && ly >= 14) c = ly === 15 ? '#222034' : '#45283c';
        set(x, y, c);
      }
      // briznas y raices
      for (const r of L.tops) for (let x = r.x0 + 1; x < r.x1 - 1; x++) if (hash1(x, 11) < .32) { const h = 1 + Math.floor(hash1(x, 12) * 3); for (let k = 1; k <= h; k++) set(x, r.y - k, k === h ? '#99e550' : '#6abe30'); }
      // raíces que bajan del pasto, y de vez en cuando un hueso viejo o una gema en lo hondo
      for (const r of L.tops) for (let x = r.x0 + 3; x < r.x1 - 3; x += 1) if (hash1(x, 15) < .045) { let px = x; for (let k = 6; k < 6 + 6 + (hash1(x, 16) * 10 | 0); k++) { if (hash1(x * 31 + k, 17) < .3) px += hash1(x + k, 18) < .5 ? -1 : 1; const yy = r.y + k; if (yy < H && L.depth(px, yy) > 0) set(px, yy, k % 5 === 0 ? '#7a4532' : '#3e2228'); } }
      for (let i = 0; i < Math.floor(W / 90); i++) {
        const fx = Math.floor(hash1(i, 81) * W), fy = 150 + Math.floor(hash1(i, 82) * 80); if (L.depth(fx, fy) < 30 || L.depth(fx + 8, fy) < 30) continue;
        if (i % 3) { for (let k = 0; k < 7; k++) { set(fx + k, fy, '#d8c8a8'); if (k % 3 === 0) { set(fx + k, fy - 1, '#d8c8a8'); set(fx + k, fy + 1, '#a89878'); } } set(fx - 1, fy - 1, '#d8c8a8'); set(fx - 1, fy + 1, '#d8c8a8'); set(fx + 7, fy - 1, '#d8c8a8'); set(fx + 7, fy + 1, '#d8c8a8'); }
        else { set(fx, fy, '#5fcde4'); set(fx + 1, fy, '#cbdbfc'); set(fx, fy + 1, '#306082'); set(fx + 1, fy + 1, '#5fcde4'); set(fx + 2, fy + 1, '#306082'); }
      }
      for (const r of L.bottoms) for (let x = r.x0 + 1; x < r.x1 - 1; x++) if (hash1(x, 13) < .14) { const h = 2 + Math.floor(hash1(x, 14) * 4); for (let k = 0; k < h; k++) if (r.y + k < H) set(x + (k > 2 ? 1 : 0), r.y + k, k === h - 1 ? '#8f563b' : '#663931'); }
      { const tmp = mkCanvas(W, H); tmp.getContext('2d').putImageData(im, 0, 0); ctx.drawImage(tmp, 0, 0); } // drawImage respeta la escala (putImageData no)
      for (const o of L.deco) {
        const x = Math.round(o.x), y = Math.round(o.y);
        if (o.k === 'T') {
          const kind = o.i % 3;
          if (kind === 1) { // palmera: tronco anillado curvo y frondas en lineas de pixel
            const hh = 40 + (o.i % 4) * 4, lean = o.i % 2 ? 1 : -1;
            let tx = x, ty = y;
            for (let j = 0; j < hh; j++) { const xx = Math.round(x + lean * Math.pow(j / hh, 2) * 8), yy = y - j; PX(ctx, xx - 2, yy, 4, 1, O); PX(ctx, xx - 1, yy, 2, 1, j % 3 === 0 ? '#8f563b' : '#a0653f'); tx = xx; ty = yy; }
            for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k / 6 - .5) * 3.4, l = 14 + (k % 2) * 4; for (let j = 0; j < l; j++) { const u = j / l, xx = Math.round(tx + Math.cos(a) * j), yy = Math.round(ty + Math.sin(a) * j * .6 + u * u * l * .55); PX(ctx, xx, yy - 1, 1, 3, O); PX(ctx, xx, yy, 1, 1, u < .5 ? '#37946e' : '#6abe30'); } }
            pixelBlob(ctx, [[tx, ty + 1, 2.5]], [O, '#663931', '#8f563b', '#d9a066'], o.i);
          } else { // ceiba (verde) o flamboyan (rojo): tronco con contrafuertes y copa en pisos
            const flam = kind === 2;
            PX(ctx, x - 3, y - 30, 6, 30, O); PX(ctx, x - 2, y - 30, 4, 30, flam ? '#663931' : '#847e87'); PX(ctx, x - 2, y - 30, 1, 30, flam ? '#8f563b' : '#9badb7');
            PX(ctx, x - 7, y - 3, 14, 3, O); PX(ctx, x - 6, y - 3, 12, 3, flam ? '#663931' : '#847e87'); PX(ctx, x - 4, y - 6, 8, 3, flam ? '#663931' : '#847e87');
            for (const [dy, sp] of [[-24, 15], [-31, 11]]) { PX(ctx, x - sp, y + dy, sp * 2, 2, O); PX(ctx, x - sp + 1, y + dy, sp * 2 - 2, 1, flam ? '#663931' : '#696a6a'); }
            const pal = flam ? ['#45283c', '#ac3232', '#df7126', '#fbf236'] : ['#323c39', '#4b692f', '#37946e', '#6abe30'];
            pixelBlob(ctx, [[x - 13, y - 28, 6], [x - 5, y - 30, 7], [x + 5, y - 30, 7], [x + 13, y - 28, 6], [x - 7, y - 36, 6], [x + 7, y - 36, 6], [x, y - 40, 6]], pal, o.i);
          }
        } else if (o.k === 'f') {
          const cols = ['#d95763', '#fbf236', '#cbdbfc', '#d77bba'];
          for (let k = 0; k < 3; k++) {
            const fx = x - 5 + k * 5, h = 3 + ((k + o.i) % 3), c = cols[(k + o.i) % 4];
            PX(ctx, fx, y - h, 1, h, '#37946e'); PX(ctx, fx + 1, y - 2, 1, 1, '#6abe30');
            PX(ctx, fx - 1, y - h - 1, 3, 1, c); PX(ctx, fx, y - h - 2, 1, 3, c); PX(ctx, fx, y - h - 1, 1, 1, c === '#fbf236' ? '#df7126' : '#fbf236');
          }
        } else if (o.k === 'r') {
          pixelBlob(ctx, [[x - 3, y - 3, 6], [x + 4, y - 2, 5]], [O, '#595652', '#847e87', '#9badb7'], o.i, y);
          PX(ctx, x - 6, y - 7, 2, 1, '#6abe30');
        }
      }
    },
    player(ctx, p, f) { pixelHero(ctx, p, f.t); },
    coin(ctx, x, y, t) { pixelCoin(ctx, x, y, t); },
    goal(ctx, x, y, t) { pixelGoal(ctx, x, y, t); },
    particle(ctx, q) { if (q.life / q.max < .3 && hash1(q.x | 0, 1) < .5) return; const s = q.k === 'dust' ? (q.life / q.max > .5 ? 2 : 1) : Math.max(1, Math.round(q.s * q.life / q.max)); PX(ctx, Math.round(q.x), Math.round(q.y), s, s, q.c); },
  });

  // ---------------- 1 BIT ----------------

  // ---------------- PUNTO DE CRUZ ----------------
  const STITCH = new Map();
  function stitchTiles(cpx) {
    if (STITCH.has(cpx)) return STITCH.get(cpx);
    const mk = (fn) => { const c = mkCanvas(cpx, cpx), x = c.getContext('2d'); fn(x); return c; };
    const a = cpx * .14, b = cpx * .86;
    const mask = mk(x => { x.strokeStyle = '#fff'; x.lineCap = 'round'; x.lineWidth = cpx * .44; x.beginPath(); x.moveTo(a, a); x.lineTo(b, b); x.moveTo(b, a); x.lineTo(a, b); x.stroke(); });
    const shadeT = mk(x => {
      x.lineCap = 'round';
      x.strokeStyle = 'rgba(0,0,0,.2)'; x.lineWidth = cpx * .44; x.beginPath(); x.moveTo(a, a); x.lineTo(b, b); x.stroke();
      x.strokeStyle = 'rgba(0,0,0,.08)'; x.lineWidth = cpx * .44; x.beginPath(); x.moveTo(b, a); x.lineTo(a, b); x.stroke();
      x.strokeStyle = 'rgba(255,255,255,.22)'; x.lineWidth = cpx * .1; x.beginPath(); x.moveTo(b - cpx * .05, a + cpx * .02); x.lineTo(a + cpx * .1, b - cpx * .14); x.stroke();
      x.strokeStyle = 'rgba(255,255,255,.12)'; x.lineWidth = cpx * .08; x.beginPath(); x.moveTo(a + cpx * .05, a + cpx * .12); x.lineTo(b - cpx * .15, b - cpx * .05); x.stroke();
    });
    const fabric = mk(x => {
      x.fillStyle = '#efe6d2'; x.fillRect(0, 0, cpx, cpx);
      x.fillStyle = 'rgba(120,95,60,.10)'; x.fillRect(0, 0, cpx, cpx * .18); x.fillRect(0, 0, cpx * .18, cpx);
      x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(cpx * .25, cpx * .3, cpx * .5, cpx * .08); x.fillRect(cpx * .5, cpx * .25, cpx * .08, cpx * .5);
      x.fillStyle = 'rgba(90,70,45,.45)'; x.beginPath(); x.arc(0, 0, cpx * .11, 0, TAU); x.arc(cpx, 0, cpx * .11, 0, TAU); x.arc(0, cpx, cpx * .11, 0, TAU); x.arc(cpx, cpx, cpx * .11, 0, TAU); x.fill();
    });
    const r = { mask, shadeT, fabric }; STITCH.set(cpx, r); return r;
  }

  // ---------------- ASCII ----------------
  const RAMP = ' .,:;-=+*%#@';
})();
