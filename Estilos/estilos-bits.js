'use strict';
// =====================================================================
//  Pixel art en tres épocas: 8 bits (NES), 32 bits (consolas de los 90
//  con transparencias) y 64 bits (pixel art moderno en alta definición)
// =====================================================================
const BAYER8 = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21].map(v => (v + .5) / 64);
// quita el antialias de un lienzo y pone los colores en escalones (con tramado opcional)
function hardenCanvas(cv, levels = 0, dither = 0, alphaCut = 110) {
  const x = cv.getContext('2d'), W = cv.width; let im; try { im = x.getImageData(0, 0, W, cv.height); } catch (e) { if (e.name === 'SecurityError') return; throw e; } const d = im.data;
  for (let i = 0, n = d.length >> 2; i < n; i++) {
    const p = i << 2; if (d[p + 3] < alphaCut) { d[p + 3] = 0; continue; }
    d[p + 3] = 255;
    if (levels) { const o = dither ? (BAYER8[(((i / W) | 0) & 7) * 8 + ((i % W) & 7)] - .5) * dither : 0; for (let k = 0; k < 3; k++) d[p + k] = clamp(Math.round(d[p + k] / 255 * levels + o), 0, levels) / levels * 255; }
  }
  x.putImageData(im, 0, 0);
}
// color más cercano de una paleta (con memoria para que sea rápido)
function paletteMapper(pal) {
  const P = pal.map(hex), memo = new Map();
  return (r, g, b) => { const k = (r >> 2) << 12 | (g >> 2) << 6 | (b >> 2); let c = memo.get(k); if (c) return c; let bd = 1e9; for (const q of P) { const dd = (r - q[0]) ** 2 * .9 + (g - q[1]) ** 2 * 1.2 + (b - q[2]) ** 2 * .7; if (dd < bd) { bd = dd; c = q; } } memo.set(k, c); return c; };
}
// convierte el dibujo de un personaje en sprite de pixel: sin antialias, colores en escalones y contorno
function pixelSprite(fn, o) {
  const W = o.w || 32, H = o.h || 32, oy = o.oy ?? H - 4, cv = mkCanvas(1, 1), cx = cv.getContext('2d', { willReadFrequently: true });
  const OUT = o.outline ? hex(o.outline) : null, map = o.palette ? paletteMapper(o.palette) : null;
  return (ctx, a, f) => {
    const S = f.S, w = Math.round(W * S), h = Math.round(H * S);
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    const ax = Math.round(a.x * S) / S, ay = Math.round(a.y * S) / S;
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, w, h); cx.imageSmoothingEnabled = false;
    cx.setTransform(S, 0, 0, S, (W / 2 - ax) * S, (oy - ay) * S);
    fn(cx, a, f);
    let im; try { im = cx.getImageData(0, 0, w, h); } catch (e) { if (e.name !== 'SecurityError') throw e; ctx.drawImage(cv, ax - W / 2, ay - oy, W, H); return; } const d = im.data, L2 = o.levels || 0;
    for (let i = 0, n = d.length >> 2; i < n; i++) {
      const p = i << 2; if (d[p + 3] < 100) { d[p + 3] = 0; continue; } d[p + 3] = 255;
      if (map) { const c = map(d[p], d[p + 1], d[p + 2]); d[p] = c[0]; d[p + 1] = c[1]; d[p + 2] = c[2]; }
      else if (L2) for (let k = 0; k < 3; k++) d[p + k] = Math.round(d[p + k] / 255 * L2) / L2 * 255;
    }
    if (OUT) {
      const al = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) al[i] = d[i * 4 + 3];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (al[i]) continue; if ((x > 0 && al[i - 1]) || (x < w - 1 && al[i + 1]) || (y > 0 && al[i - w]) || (y < h - 1 && al[i + w])) { const p = i * 4; d[p] = OUT[0]; d[p + 1] = OUT[1]; d[p + 2] = OUT[2]; d[p + 3] = 255; } }
    }
    cx.putImageData(im, 0, 0);
    ctx.drawImage(cv, ax - W / 2, ay - oy, W, H);
  };
}

(function () {
  const R = (i, s) => hash1(i, s);
  const PX = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const bay = (x, y) => BAYER8[(y & 7) * 8 + (x & 7)];
  // mancha de pixeles de 3 colores (contorno, base, luz) a escala 1
  function blob(x, cs, out, base, hi, sh) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [cx, cy, r] of cs) { x0 = Math.min(x0, cx - r - 1); y0 = Math.min(y0, cy - r - 1); x1 = Math.max(x1, cx + r + 1); y1 = Math.max(y1, cy + r + 1); }
    x0 = Math.floor(x0); y0 = Math.floor(y0); const W = Math.ceil(x1) - x0 + 1, H = Math.ceil(y1) - y0 + 1, m = new Int16Array(W * H).fill(-1);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const px = x0 + i + .5, py = y0 + j + .5; cs.forEach(([cx, cy, r], k) => { if (Math.hypot(px - cx, py - cy) < r && m[j * W + i] < 0) m[j * W + i] = k; }); }
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const k = m[j * W + i]; if (k < 0) continue;
      const edge = i === 0 || j === 0 || i === W - 1 || j === H - 1 || m[j * W + i - 1] < 0 || m[j * W + i + 1] < 0 || m[(j - 1) * W + i] < 0 || m[(j + 1) * W + i] < 0;
      const [cx, cy, r] = cs[k], dy = (y0 + j + .5 - cy) / r;
      PX(x, x0 + i, y0 + j, 1, 1, edge ? out : dy < -.45 ? hi : (sh && dy > .45) ? sh : base);
    }
  }

  // ===================================================================
  //  8 BITS · paleta de la NES, mosaicos de 8×8 que se repiten
  // ===================================================================
  const N = { K: '#000000', W: '#fcfcfc', SKY: '#3cbcfc', SKY2: '#a4e4fc', BL: '#0078f8', G0: '#005800', G1: '#00a800', G2: '#b8f818', BR: '#c84c0c', OR: '#fc9838', TAN: '#fcd8a8', RED: '#f83800', PK: '#f878f8', GR: '#7c7c7c', GR2: '#bcbcbc', BRN: '#503000', YEL: '#f8b800', TL: '#008888', TL2: '#00e8d8', MINT: '#b8f8d8', LAV: '#d8b8f8' };
  const SILLAR = [['#e8c090', '#fce0b8', '#c89868', '#a87048', '#dcb080'], ['#c89868', '#e4b888', '#a87848', '#885830', '#bc8c5c'], ['#a07048', '#b88858', '#805030', '#684020', '#946440']]; // cara, luz, sombra, junta y sillar manchado
  // el cielo: franjas de la paleta unidas con tramado, y un sol quieto a media altura
  function cielo8(x, H, dy) {
    const yh = 150 + dy, cols = ['#3878f8', '#4898fc', N.SKY, N.SKY2, '#fce0a8'], bordes = [yh - 124, yh - 84, yh - 44, yh - 12];
    PX(x, 0, 0, VW, H, cols[4]);
    for (let i = bordes.length - 1; i >= 0; i--) {
      PX(x, 0, 0, VW, bordes[i], cols[i]);
      for (let y = 0; y < 10; y++) for (let xx = 0; xx < VW; xx++) if (bay(xx, bordes[i] + y) < (10 - y) * 5.6) PX(x, xx, bordes[i] + y, 1, 1, cols[i]);
    }
    const sx = 76, sy = yh - 62;
    for (let j = -20; j <= 20; j++) for (let i = -20; i <= 20; i++) { const d = Math.hypot(i, j); if (d < 15) PX(x, sx + i, sy + j, 1, 1, d < 11 ? '#fcfcfc' : '#fce0a8'); else if (d < 20 && bay(sx + i, sy + j) < (20 - d) * 8) PX(x, sx + i, sy + j, 1, 1, '#fce0a8'); }
  }
  // Campeche a lo lejos, sin detalle: la catedral, el baluarte y una pirámide de Edzná
  function lejos8(x, w) {
    const C1 = '#6888fc', C2 = '#a4c8fc', base = 164, rect = (a, b, c, d) => { PX(x, a, b, c, d, C1); PX(x, a, b, 1, d, C2); PX(x, a, b, c, 1, C2); };
    for (let i = 0; i * 190 < w; i++) {
      const cx = i * 190 + 60 + Math.round(R(i, 3) * 40), tipo = i % 3;
      if (tipo === 0) { rect(cx - 22, base - 26, 44, 26); for (const q of [-30, 18]) { rect(cx + q, base - 44, 12, 44); rect(cx + q + 2, base - 52, 8, 8); rect(cx + q + 5, base - 58, 2, 6); } rect(cx - 10, base - 34, 20, 8); PX(x, cx - 1, base - 42, 2, 8, C1); PX(x, cx - 3, base - 40, 6, 2, C1); }
      else if (tipo === 1) { rect(cx - 34, base - 22, 68, 22); for (let k = 0; k < 8; k++) PX(x, cx - 34 + k * 10, base - 26, 6, 4, C1); rect(cx + 20, base - 36, 12, 14); PX(x, cx + 22, base - 40, 8, 4, C1); }
      else for (let k = 0; k < 6; k++) { const hw = 42 - k * 7, y = base - (k + 1) * 6; rect(cx - hw, y, hw * 2, 6); }
    }
    PX(x, 0, base, w, VH, C1);
  }
  // la calle: cada casa con su cornisa, ventanas con postigos, balcón y puerta de arco
  function casas8(x, w) {
    const base = 182, tonos = [['#fcd8a8', '#e8a870'], ['#b8f8d8', '#60c8a8'], ['#a4e4fc', '#68a8e0'], ['#d8b8f8', '#a080d8'], ['#fce0a8', '#e8b050'], ['#f8b8c8', '#e08098'], ['#fcfcfc', '#c8c0c8']];
    for (let xx = 0, i = 0; xx < w; i++) {
      const fw = 40 + (R(i, 5) * 3 | 0) * 8, pisos = 1 + (R(i, 6) * 2 | 0), top = base - 24 - pisos * 22, [c, c2] = tonos[(R(i, 7) * tonos.length) | 0], post = i % 2 ? '#2f7f58' : '#3f6a9a';
      PX(x, xx, top - 1, fw, base - top + 1, N.K); PX(x, xx + 1, top, fw - 2, base - top, c); PX(x, xx + fw - 4, top, 3, base - top, c2);
      PX(x, xx + 1, top, fw - 2, 3, N.W); PX(x, xx + 1, top + 3, fw - 2, 1, c2); for (let k = 3; k < fw - 3; k += 5) PX(x, xx + k, top - 3, 3, 2, c);
      PX(x, xx + 1, base - 5, fw - 2, 5, c2);
      const vent = Math.max(2, Math.floor((fw - 8) / 14));
      for (let n = 0; n < pisos; n++) for (let k = 0; k < vent; k++) {
        const vx = xx + 7 + k * Math.floor((fw - 14) / vent), vy = top + 9 + n * 22;
        PX(x, vx, vy, 7, 11, '#203048'); PX(x, vx + 1, vy + 1, 2, 4, '#68a8e0'); PX(x, vx - 2, vy, 2, 11, post); PX(x, vx + 7, vy, 2, 11, post); PX(x, vx - 2, vy - 2, 11, 2, N.W);
        if (n === 0 && (i + k) % 2 === 0) { PX(x, vx - 3, vy + 11, 13, 1, N.K); for (let q = 0; q < 7; q++) PX(x, vx - 3 + q * 2, vy + 8, 1, 3, N.K); PX(x, vx - 3, vy + 8, 13, 1, N.K); }
      }
      const px = xx + Math.floor(fw / 2) - 4; PX(x, px, base - 18, 8, 18, N.BRN); PX(x, px + 1, base - 19, 6, 1, N.BRN); PX(x, px + 1, base - 17, 3, 17, '#885830'); PX(x, px + 6, base - 9, 1, 1, N.YEL);
      xx += fw + (i % 5 === 4 ? 8 : 0);
    }
    PX(x, 0, base, w, VH, '#d8c8a8'); for (let xx = 0; xx < w; xx += 24) PX(x, xx, base + 3, 12, 1, '#b8a888');
  }
  // el seto del parque, y abajo el mar que se asoma en los barrancos
  function seto8(x, w) {
    for (let xx = 0; xx < w; xx += 34) { const n = 2 + (R(xx, 9) * 3 | 0), cs = []; for (let k = 0; k < n; k++) cs.push([xx + 10 + k * 9, 190 - (k % 2) * 3, 8]); blob(x, cs, N.G0, N.G1, N.G2); }
    PX(x, 0, 190, w, 12, N.G1); for (let xx = 0; xx < w; xx += 6) PX(x, xx + (R(xx, 4) * 4 | 0), 192 + (R(xx, 5) * 6 | 0), 2, 1, N.G2);
    PX(x, 0, 202, w, VH, '#0058f8'); PX(x, 0, 202, w, 2, N.G0);
    for (let y = 208; y < VH; y += 7) for (let xx = (y * 7) % 23; xx < w; xx += 31) PX(x, xx, y, 12 - (y % 3) * 2, 1, N.BL);
  }
  defStyle({
    id: 'bits8', name: 'Pixel art 8 bits', ref: 'NES · Famicom · paleta de 54 colores', order: 48,
    desc: 'Como en la NES: cielo de un solo color, tres colores por mosaico, bloques de 8×8 que se repiten y contorno negro.',
    fixedS: 2, pixel: true,
    fx: { dust: [N.W, N.TAN], spark: [N.YEL, N.W, N.OR], confetti: [N.RED, N.YEL, N.G2, N.SKY2, N.PK] },
    sky(ctx, f) {
      // el cielo llena toda la vista; la ciudad baja junto con el piso, así queda detrás de él en cualquier ventana
      const H = f.H || VH, dy = -(f.y0 || 0);
      ctx.drawImage(cached(f, 'cielo8-' + H, VW, H, x => cielo8(x, H, dy)), 0, 0, VW, H);
      for (let i = 0; i < 5; i++) {
        const c = cached(f, 'nube8-' + i, 72, 30, x => { const cs = []; const n = 3 + i % 3; for (let k = 0; k < n; k++) cs.push([13 + k * 11, 16 - (k % 2) * 5, 8 + (k + i) % 3]); blob(x, cs, N.SKY2, N.W, N.W, N.SKY2); });
        ctx.drawImage(c, Math.round(wrap(i * 97 + 40 - f.cam * (.06 + i * .02) - f.t * (2 + i * .5), VW + 90) - 75), Math.round(14 + (i * 37) % 86 + dy * .55));
      }
      for (let i = 0; i < (window.FAUNA_ARTE?.listo('gaviotaPixel') ? 3 : 0); i++) { // las gaviotas (lámina de pixel art)
        const gx = Math.round(wrap(60 + i * 150 - f.t * (13 + i * 3), VW + 40) - 20), gy = Math.round(42 + i * 15 + dy * .7 + Math.sin(f.t * .9 + i) * 3);
        FAUNA_ARTE.dib(ctx, 'gaviotaPixel', f.t + i * .4, gx, gy, { h: 5, ay: .5, fps: 5, seq: [0, 1, 3, 2, 3, 1], voltea: true, pixel: true });
      }
      ctx.save(); ctx.translate(0, dy);
      strip(ctx, f, 'lejos8', .08, lejos8); strip(ctx, f, 'casas8', .25, casas8); strip(ctx, f, 'seto8', .5, seto8);
      // destellos del mar en los barrancos
      for (let i = 0; i < 16; i++) if ((Math.floor(f.t * 2.4) + i) % 3 === 0) PX(ctx, Math.round(wrap(i * 37 - f.cam * .5, VW)), 206 + (i * 13) % 32, 5, 1, N.SKY2);
      ctx.restore();
    },
    telonPropio: true, // la ciudad baja con el piso y el cielo llena todo lo alto
    terrain(ctx) {
      const W = L.ww, H = VH + 8, im = ctx.createImageData(W, H), d = im.data;
      const set = (x, y, c) => { const A = hex(c), p = (y * W + x) * 4; d[p] = A[0]; d[p + 1] = A[1]; d[p + 2] = A[2]; d[p + 3] = 255; };
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const cx = x >> 4, cy = y >> 4; if (!L.solid(cx, cy)) continue;
        const lx = x & 15, ly = y & 15, topE = !L.solid(cx, cy - 1), dep = L.depth(x, y);
        let c;
        const lip = 4 + (R(x >> 1, 11) * 3 | 0); // el pasto cuelga parejo pero no recto
        if (topE && ly === 0) c = N.G0;
        else if (topE && ly < lip - 1) c = ly === 1 ? N.G2 : ((lx * 3 + ly * 5) % 7 === 0 ? N.G2 : N.G1);
        else if (topE && ly === lip - 1) c = N.G0;
        else { // sillares de piedra, cada vez más en sombra hacia adentro
          const row = y >> 3, bx = (x + (row % 2 ? 8 : 0)) & 15, by = y & 7, q = (x + (row % 2 ? 8 : 0)) >> 4, luz = dep < 14 ? 0 : dep < 30 ? (bay(x, y) < (dep - 14) * 4 ? 1 : 0) : dep < 50 ? (bay(x, y) < (dep - 30) * 3.2 ? 2 : 1) : 2, T3 = SILLAR[luz], m = R(q * 7 + row, 13) < .22 ? 1 : 0;
          c = by === 7 || bx === 15 ? T3[3] : by === 0 || bx === 0 ? T3[1] : by === 6 || bx === 14 ? T3[2] : m ? T3[4] : T3[0];
        }
        if ((!L.solid(cx - 1, cy) && lx === 0) || (!L.solid(cx + 1, cy) && lx === 15) || (!L.solid(cx, cy + 1) && ly === 15)) c = N.BRN;
        set(x, y, c);
      }
      { const tmp = mkCanvas(W, H); tmp.getContext('2d').putImageData(im, 0, 0); ctx.drawImage(tmp, 0, 0); } // drawImage respeta la escala (putImageData no)
      for (const o of L.deco) {
        const x = Math.round(o.x), y = Math.round(o.y);
        if (o.k === 'T') {
          for (let j = 0; j < 36; j++) { const xx = x + Math.round(Math.sin(j * .06) * 3); PX(ctx, xx - 2, y - j, 4, 1, N.K); PX(ctx, xx - 1, y - j, 2, 1, (j >> 2) % 2 ? N.OR : N.BR); }
          const tx = x + Math.round(Math.sin(2.1) * 3), ty = y - 36;
          for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k / 5 - .5) * 3.2; for (let j = 0; j < 13; j++) { const xx = Math.round(tx + Math.cos(a) * j), yy = Math.round(ty + Math.sin(a) * j * .5 + j * j * .06); PX(ctx, xx, yy - 1, 1, 3, N.K); PX(ctx, xx, yy, 1, 1, j < 6 ? N.G1 : N.G2); } }
          PX(ctx, tx - 2, ty, 2, 2, N.BRN); PX(ctx, tx + 1, ty + 1, 2, 2, N.BRN);
        } else if (o.k === 'f') {
          for (let k = 0; k < 3; k++) { const fx = x - 5 + k * 5, c = [N.RED, N.YEL, N.PK][(k + o.i) % 3]; PX(ctx, fx, y - 4, 1, 4, N.G1); PX(ctx, fx - 1, y - 6, 3, 1, c); PX(ctx, fx, y - 7, 1, 3, c); PX(ctx, fx, y - 6, 1, 1, N.W); }
        } else if (o.k === 'r') {
          PX(ctx, x - 6, y - 10, 12, 10, N.K); PX(ctx, x - 5, y - 9, 10, 9, N.BR); PX(ctx, x - 5, y - 9, 10, 2, N.OR); PX(ctx, x - 5, y - 5, 10, 1, N.K);
        }
      }
    },
    player(ctx, p, f) { drawHero(ctx, p, f, { body: N.RED, skin: N.TAN, hair: N.BRN, leg: N.BL, eye: N.K }); },
    coin(ctx, x, y, t) {
      const X = Math.round(x), Y = Math.round(y + (Math.floor(t * 4) % 2)), w = [3, 2, 1, 0, 1, 2][Math.floor(t * 8 + x * .01) % 6];
      PX(ctx, X - w - 1, Y - 5, w * 2 + 3, 11, N.K); PX(ctx, X - w - 2, Y - 3, w * 2 + 5, 7, N.K);
      PX(ctx, X - w, Y - 4, w * 2 + 1, 9, N.YEL); PX(ctx, X - w - 1, Y - 2, w * 2 + 3, 5, N.YEL); if (w) { PX(ctx, X + w, Y - 2, 1, 5, N.OR); PX(ctx, X - w, Y - 3, 1, 2, N.W); }
      PX(ctx, X, Y - 7, 1, 2, N.G1);
    },
    goal(ctx, x, y, t) {
      const X = Math.round(x), Y = Math.round(y), fr = Math.floor(t * 4) % 2;
      PX(ctx, X - 1, Y - 60, 3, 52, N.K); PX(ctx, X, Y - 60, 1, 52, N.G2);
      PX(ctx, X - 3, Y - 65, 7, 7, N.K); PX(ctx, X - 2, Y - 64, 5, 5, N.G1); PX(ctx, X - 1, Y - 63, 1, 1, N.W);
      for (let i = 0; i < 12; i++) { const h = 10 - Math.floor(i * .8), o = fr && i > 4 ? 1 : 0; PX(ctx, X + 2 + i, Y - 58 + o + Math.floor(i * .4), 1, Math.max(1, h - Math.floor(i * .4)), i === 11 ? N.K : N.RED); }
      PX(ctx, X - 8, Y - 8, 16, 8, N.K); PX(ctx, X - 7, Y - 7, 14, 7, N.BR); PX(ctx, X - 7, Y - 7, 14, 1, N.OR);
    },
    particle(ctx, q) { const s = q.life / q.max > .5 ? 2 : 1; PX(ctx, Math.round(q.x), Math.round(q.y), s, s, q.c); },
  });

  // ===================================================================
  //  32 BITS · "La noche del baluarte": rampas de color, tramado fino y
  //  transparencias, a doble resolución
  // ===================================================================
  const C3 = { sky: ['#0b0a1f', '#15123a', '#231d55', '#3a2c6e', '#5a3f86', '#7a5596'], moon: ['#f6efd2', '#d9cfae', '#b2a88a', '#8a8070'], sea: ['#0d1c3a', '#16305a', '#28507a'], st: ['#140f1c', '#1c1626', '#2e2436', '#3a2e42', '#463848', '#62525e', '#857478', '#a99a94'], moss: ['#1e3a2a', '#2f5a38', '#4f8a4a', '#7ab85a'], fire: ['#ff7a1a', '#ffd04a', '#fff6c0'] };
  function rampPix(x, c, stops) {   // degradado vertical con tramado de Bayer, en pixeles del dispositivo
    x.setTransform(1, 0, 0, 1, 0, 0); const W = c.width, H = c.height, im = x.createImageData(W, H), d = im.data, P = stops.map(([t, h]) => [t, hex(h)]);
    for (let y = 0; y < H; y++) { const u = y / H; let k = 0; while (k < P.length - 2 && u > P[k + 1][0]) k++; const f = clamp((u - P[k][0]) / (P[k + 1][0] - P[k][0]), 0, 1); for (let xx = 0; xx < W; xx++) { const C = f > bay(xx, y) ? P[k + 1][1] : P[k][1], p = (y * W + xx) * 4; d[p] = C[0]; d[p + 1] = C[1]; d[p + 2] = C[2]; d[p + 3] = 255; } }
    x.putImageData(im, 0, 0);
  }
  defStyle({
    id: 'bits32', name: 'Pixel art 32 bits', ref: 'Castlevania: Symphony of the Night · Metal Slug · Saturn y PlayStation', order: 49,
    desc: 'Doble resolución, rampas de 6 a 8 tonos con tramado fino, transparencias de luz y niebla, y la luna sobre el mar del Golfo.',
    fixedS: 2, pixel: true,
    fx: { dust: ['#857478', '#62525e'], spark: ['#ffd04a', '#fff6c0', '#ff7a1a'], confetti: ['#ffd04a', '#b8203a', '#7ab85a', '#a99a94', '#fff6c0'] },
    sky(ctx, f) {
      // el degradado llena toda la vista; la luna, el mar y la ciudad bajan junto con el piso
      const H = f.H || VH, alto = H - VH, dy = -(f.y0 || 0), baja = u => (u * VH + alto) / H;
      ctx.drawImage(cached(f, 'cielo-' + H, VW, H, (x, c) => {
        rampPix(x, c, [[0, C3.sky[0]], [baja(.18), C3.sky[1]], [baja(.4), C3.sky[2]], [baja(.62), C3.sky[3]], [baja(.78), C3.sky[4]], [1, C3.sky[5]]]);
        const S = f.S, r = rng(32);
        for (let i = 0; i < 260; i++) { const sx = (r() * VW * S) | 0, sy = (r() * (150 + alto) * S) | 0, b = r(); x.fillStyle = b > .9 ? '#ffffff' : 'rgba(220,210,255,.7)'; x.fillRect(sx, sy, 1, 1); if (b > .96) { x.fillRect(sx - 1, sy, 3, 1); x.fillRect(sx, sy - 1, 1, 3); } }
        // luna sombreada pixel por pixel con cráteres
        const mx = 330 * S, my = (58 + alto) * S, mr = 22 * S;
        for (let y = -mr; y <= mr; y++) for (let xx = -mr; xx <= mr; xx++) {
          const dd = Math.hypot(xx, y) / mr; if (dd > 1) { if (dd < 1.35 && bay(xx + 999, y + 999) < (1.35 - dd) * 1.2) { x.fillStyle = C3.sky[4]; x.fillRect(mx + xx, my + y, 1, 1); } continue; }
          let l = -(xx * .55 + y * .45) / mr + (1 - dd) * .6; for (const [cx2, cy2, cr] of [[-.3, -.2, .22], [.25, .3, .16], [.1, -.45, .12], [-.45, .35, .1]]) if (Math.hypot(xx / mr - cx2, y / mr - cy2) < cr) l -= .45;
          x.fillStyle = l > .55 ? C3.moon[0] : l > .15 ? (l > .35 && bay(xx + 99, y + 99) > .5 ? C3.moon[0] : C3.moon[1]) : l > -.25 ? C3.moon[2] : C3.moon[3]; x.fillRect(mx + xx, my + y, 1, 1);
        }
      }), 0, 0, VW, H);
      ctx.save(); ctx.translate(0, dy);
      strip(ctx, f, 'mar', .04, (x, w) => {
        x.beginPath(); CAMP.skyline(x, 0, w, 180, 'mid', 9, .9); x.fillStyle = '#15123a'; x.fill();
        x.save(); x.beginPath(); CAMP.skyline(x, 0, w, 180, 'mid', 9, .9); x.clip(); x.translate(-1, 1); x.beginPath(); CAMP.skyline(x, 0, w, 180, 'mid', 9, .9); x.restore();
        x.strokeStyle = '#3a2c6e'; x.lineWidth = .6; x.beginPath(); for (let xx = 0; xx <= w; xx += 1) x.lineTo(xx, 180 - CAMP.h(xx, 'mid', 9) * .9); x.stroke();
        for (const fa of CAMP.facades(0, w, 9)) { const top = 180 - (4 + fa.h) * .9; for (let i = 0; i < fa.w / 6; i++) if (R(fa.x0 * 3 + i, 4) < .35) { x.fillStyle = C3.fire[1]; x.fillRect(fa.x0 + 2 + i * 6, top + 6, 1.5, 2); } }
        const g = x.createLinearGradient(0, 180, 0, VH); g.addColorStop(0, C3.sea[2]); g.addColorStop(.3, C3.sea[1]); g.addColorStop(1, C3.sea[0]); x.fillStyle = g; x.fillRect(0, 180, w, VH);
        hardenCanvas(x.canvas, 6, 1.2);
      });
      // reflejo de la luna en el mar
      const mx = 330 - f.cam * .02; ctx.fillStyle = C3.moon[1];
      for (let y = 184; y < VH; y += 2) { const k = (y - 184) / 60, wv = Math.round((6 + k * 14) * (.5 + .5 * Math.sin(f.t * 2 + y * .7)) * 2) / 2; ctx.globalAlpha = .7 - k * .4; ctx.fillRect(Math.round((mx - wv / 2 + Math.sin(y + f.t) * 2) * 2) / 2, y, wv, .5); }
      ctx.globalAlpha = 1;
      strip(ctx, f, 'palmas', .3, (x, w) => {
        const P = () => { x.beginPath(); for (const q of CAMP.props(0, w, 'near', 21)) { if (q.k === 'palma') CAMP.palma(x, q.x, 224, q.h, q.lean, q.s); else CAMP.ceiba(x, q.x, 224, q.h, q.w, q.s); } x.rect(0, 222, w, 30); };
        P(); x.fillStyle = C3.sky[3]; x.fill(); x.save(); x.translate(-.8, .8); P(); x.fillStyle = '#0b0a1f'; x.fill(); x.restore();
        hardenCanvas(x.canvas, 0);
      });
      // niebla con transparencia, en franjas escalonadas
      for (let k = 0; k < 3; k++) { const y0 = 196 + k * 10; ctx.fillStyle = `rgba(122,85,150,${.07 + k * .03})`; for (let xx = -40; xx < VW; xx += 40) { const h = 4 + Math.round(Math.sin((xx + f.t * 12 + k * 30 - f.cam * .4) * .05) * 2); ctx.fillRect(xx + wrap(f.t * 6 * (k + 1) - f.cam * .4, 40), y0, 40, h); } }
      ctx.restore();
    },
    telonPropio: true,
    terrain(ctx, f) {
      const S = f.S, W = Math.round(L.ww * S), H = Math.round((VH + 8) * S), im = ctx.createImageData(W, H), d = im.data;
      const P = C3.st.map(hex), M = C3.moss.map(hex);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const ux = x / S, uy = y / S, cx = Math.floor(ux / T), cy = Math.floor(uy / T); if (!L.solid(cx, cy)) continue;
        const dep = L.depth(ux, uy), row = Math.floor(uy / 8), bx = (ux + (row % 2 ? 8 : 0)) % 16, by = uy % 8, bid = Math.floor((ux + (row % 2 ? 8 : 0)) / 16) * 31 + row;
        let C;
        const drip = dep < 9 + R(Math.floor(ux), 7) * 6 * (R(Math.floor(ux / 2), 8) < .25 ? 1 : 0);
        if (dep < 4.5 || drip) C = dep < 1 ? M[3] : dep < 2.5 ? M[2] : M[1 - (drip && dep > 5 ? 1 : 0)];
        else if (bx < .5 || by < .5) C = P[0];
        else {
          let k = 3 + Math.floor(R(bid, 5) * 2) - (dep > 70 ? 1 : 0);
          if (by < 1 || bx < 1) k += 2; else if (by > 7 || bx > 15) k -= 1;
          if (hash2(x, y, 3) < .05) k -= 1;
          C = P[clamp(k, 1, 7)];
        }
        if (!L.solid(cx, cy + 1) && uy > (cy + 1) * T - 1) C = P[0];
        const p = (y * W + x) * 4; d[p] = C[0]; d[p + 1] = C[1]; d[p + 2] = C[2]; d[p + 3] = 255;
      }
      ctx.putImageData(im, 0, 0);
      // briznas
      for (const r of L.tops) for (let x = r.x0 + 1; x < r.x1 - 1; x += .5) if (R(x * 2 | 0, 11) < .3) { const h = 1 + R(x * 2 | 0, 12) * 2.5; PX(ctx, x, r.y - h, .5, h, R(x * 2 | 0, 13) < .5 ? C3.moss[3] : C3.moss[2]); }
      for (const o of L.deco) {
        const x = o.x, y = o.y;
        if (o.k === 'T') { const TP = (pt) => { ctx.beginPath(); CAMP.palma(ctx, x, y + 1, 48 + R(o.i, 1) * 10, (R(o.i, 2) - .5) * .5, o.i, 0, pt); }; TP('trunk'); ctx.fillStyle = C3.st[4]; ctx.fill(); TP('crown'); ctx.fillStyle = C3.moss[1]; ctx.fill(); ctx.save(); TP('crown'); ctx.clip(); ctx.translate(-1, 1); TP('crown'); ctx.fillStyle = C3.moss[0]; ctx.fill(); ctx.restore(); }
        else if (o.k === 'f') for (let k = 0; k < 3; k++) { const fx = x - 5 + k * 5; PX(ctx, fx, y - 5, .5, 5, C3.moss[2]); PX(ctx, fx - 1, y - 6.5, 2.5, 2, ['#b8203a', '#ffd04a', '#a99a94'][(o.i + k) % 3]); }
        else if (o.k === 'r') { PX(ctx, x - 6, y - 6, 12, 6, C3.st[2]); PX(ctx, x - 6, y - 6, 12, 1, C3.st[6]); PX(ctx, x - 3, y - 9, 6, 3, C3.st[4]); PX(ctx, x + 3, y - 8, 7, 2, C3.st[1]); }
      }
      hardenCanvas(ctx.canvas, 0);
    },
    player(ctx, p, f) { drawHero(ctx, p, f, { body: '#a99a94', skin: '#d9cfae', hair: '#1c1626', leg: '#2e2436', eye: '#1c1626' }); },
    coin(ctx, x, y, t, f) {
      const fr = Math.floor(t * 10 + x * .01) % 8;
      const c = cached(f, 'gema' + fr, 14, 14, xx => { const k = Math.cos(fr / 8 * TAU); xx.fillStyle = '#7a3a10'; xx.beginPath(); xx.ellipse(7, 7, Math.max(.6, Math.abs(k) * 4.6), 5.6, 0, 0, TAU); xx.fill(); xx.fillStyle = '#ff7a1a'; xx.beginPath(); xx.ellipse(7, 7, Math.max(.4, Math.abs(k) * 3.8), 4.8, 0, 0, TAU); xx.fill(); xx.fillStyle = '#ffd04a'; xx.beginPath(); xx.ellipse(7 - k * 1.2, 5.6, Math.max(.3, Math.abs(k) * 1.8), 2.4, 0, 0, TAU); xx.fill(); xx.fillStyle = '#fff6c0'; xx.fillRect(7 - k * 2, 4, 1, 1.5); hardenCanvas(xx.canvas, 0); });
      const X = Math.round(x * 2) / 2, Y = Math.round((y + Math.sin(t * 3 + x) * 1.5) * 2) / 2;
      ctx.drawImage(c, X - 7, Y - 7, 14, 14); if (Math.floor(t * 3 + x) % 6 === 0) { PX(ctx, X - 2.5, Y - 3, .5, .5, '#fff6c0'); PX(ctx, X - 3, Y - 2.5, 1.5, .5, '#fff6c0'); }
    },
    goal(ctx, x, y, t) {
      const X = Math.round(x * 2) / 2;
      PX(ctx, X - 1.5, y - 46, 3, 46, C3.st[2]); PX(ctx, X - 1.5, y - 46, 1, 46, C3.st[5]);
      PX(ctx, X - 6, y - 58, 12, 12, C3.st[1]); PX(ctx, X - 5, y - 57, 10, 10, C3.fire[0]); PX(ctx, X - 3.5, y - 55.5, 7, 7, C3.fire[1]); PX(ctx, X - 1.5, y - 53.5, 3, 3, C3.fire[2]);
      PX(ctx, X - 7, y - 60, 14, 2, C3.st[4]); PX(ctx, X - 4, y - 62, 8, 2, C3.st[3]);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .18 + Math.sin(t * 6) * .04; ctx.fillStyle = C3.fire[0]; for (let r = 30; r > 8; r -= 6) ctx.fillRect(X - r, y - 52 - r, r * 2, r * 2); ctx.restore();
    },
    over(ctx) { vignette(ctx, .4, '#05040f', .45); },
    particle(ctx, q) { const s = q.life / q.max > .5 ? 1.5 : 1; PX(ctx, Math.round(q.x * 2) / 2, Math.round(q.y * 2) / 2, s, s, q.c); },
  });

  // ===================================================================
  //  64 BITS · "La selva de Calakmul": pixel art HD a triple resolución
  // ===================================================================
  const C6 = { sky: ['#5ab4e8', '#7ec8ee', '#a6dcf2', '#cdeef4', '#f2f2d8'], far: '#8dbdd2', far2: '#a9d0dc', can: ['#2a6e52', '#3f8a62', '#5aa86c', '#8acb7c'], near: ['#14402f', '#1f5a46', '#2f7a5a'], soil: ['#3a2418', '#5a3a26', '#7a5034', '#9a6a42', '#c08a58'], grass: ['#2f7a34', '#4c9c38', '#78c048', '#b8e06a'] };
  function cloud64(f, i) {
    return cached(f, 'nube64-' + i, 110, 48, x => {
      const r = rng(64 + i), cs = []; const n = 4 + (i % 3); for (let k = 0; k < n; k++) cs.push([18 + k * 16 + r() * 6, 30 - Math.sin(k / (n - 1) * Math.PI) * 12 - r() * 4, 10 + r() * 7]);
      const P = (dx, dy, k) => { x.beginPath(); for (const [cx, cy, rr] of cs) { x.moveTo(cx + dx + rr * k, cy + dy); x.arc(cx + dx, cy + dy, rr * k, 0, TAU); } };
      P(0, 0, 1); x.fillStyle = '#a8cfe4'; x.fill(); P(-1.5, -2, .94); x.fillStyle = '#d6ecf4'; x.fill(); P(-2.5, -4, .82); x.fillStyle = '#ffffff'; x.fill();
      x.fillStyle = '#a8cfe4'; x.fillRect(0, 34, 110, 14); x.globalCompositeOperation = 'destination-out'; x.fillRect(0, 38, 110, 10);
      hardenCanvas(x.canvas, 0);
    });
  }
  function leafCluster(f, i) {
    return cached(f, 'hojas64-' + i, 90, 70, x => {
      const r = rng(640 + i);
      for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + (r() - .5) * 2.6, l = 26 + r() * 30, bx = 45, by = 70; x.save(); x.translate(bx, by); x.rotate(a + Math.PI / 2); x.fillStyle = k % 2 ? '#0e2a1e' : '#123526'; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-l * .32, -l * .5, 0, -l); x.quadraticCurveTo(l * .32, -l * .5, 0, 0); x.fill(); x.strokeStyle = '#1c4a34'; x.lineWidth = .5; x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -l * .9); x.stroke(); x.restore(); }
      hardenCanvas(x.canvas, 0);
    });
  }
  defStyle({
    id: 'bits64', name: 'Pixel art 64 bits', ref: 'Owlboy · Eastward · Dead Cells (pixel art moderno)', order: 50,
    desc: 'Pixel art en alta definición: triple resolución, cielo tramado, nubes con volumen, rayos de sol y hojas que pasan por delante.',
    fixedS: 3, pixel: true,
    fx: { dust: ['#c08a58', '#9a6a42'], spark: ['#fff4a0', '#ffe070', '#ffffff'], confetti: ['#f07aa8', '#ffe070', '#5aa86c', '#5ab4e8', '#ffffff'] },
    sky(ctx, f) {
      // el degradado llena toda la vista; el sol, las nubes y la selva bajan junto con el piso
      const H = f.H || VH, alto = H - VH, dy = -(f.y0 || 0), baja = u => (u * VH + alto) / H;
      ctx.drawImage(cached(f, 'cielo-' + H, VW, H, (x, c) => {
        rampPix(x, c, [[0, C6.sky[0]], [baja(.3), C6.sky[1]], [baja(.55), C6.sky[2]], [baja(.78), C6.sky[3]], [1, C6.sky[4]]]);
        x.setTransform(f.S, 0, 0, f.S, 0, 0);
        const sx = 352, sy = 40 + alto; x.fillStyle = 'rgba(255,250,220,.35)'; for (let rr = 34; rr > 12; rr -= 5) { x.beginPath(); x.arc(sx, sy, rr, 0, TAU); x.fill(); }
        x.fillStyle = '#fffbe0'; x.beginPath(); x.arc(sx, sy, 11, 0, TAU); x.fill();
        hardenCanvas(c, 0);
      }), 0, 0, VW, H);
      ctx.save(); ctx.translate(0, dy);
      for (let i = 0; i < 5; i++) { const cx = wrap(i * 120 + 20 - f.cam * .05 - f.t * (2 + i * .4), VW + 140) - 120, cy = 14 + (i * 31) % 70; ctx.drawImage(cloud64(f, i), Math.round(cx * 3) / 3, cy, 110, 48); }
      strip(ctx, f, 'calakmul', .06, (x, w) => {
        x.beginPath(); CAMP.skyline(x, 0, w, 176, 'far', 2, 1.6); x.fillStyle = C6.far; x.fill();
        x.strokeStyle = C6.far2; x.lineWidth = .7; x.beginPath(); for (let xx = 0; xx <= w; xx += 1) x.lineTo(xx, 176.5 - CAMP.h(xx, 'far', 2) * 1.6); x.stroke();
        hardenCanvas(x.canvas, 0);
      });
      // rayos de sol
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 5; i++) { const x0 = 352 - 30 + i * 18 - f.cam * .02, a = .05 + .03 * Math.sin(f.t * .7 + i); ctx.fillStyle = `rgba(255,248,210,${a})`; ctx.beginPath(); ctx.moveTo(x0, 40); ctx.lineTo(x0 + 8, 40); ctx.lineTo(x0 - 120 + i * 30, VH); ctx.lineTo(x0 - 160 + i * 30, VH); ctx.closePath(); ctx.fill(); }
      ctx.restore();
      strip(ctx, f, 'dosel', .2, (x, w) => {
        const base = 204, bump = xx => base - CAMP.h(xx, 'near', 31) * 1.1;
        x.beginPath(); x.moveTo(0, VH); for (let xx = 0; xx <= w; xx += 2) x.lineTo(xx, bump(xx)); x.lineTo(w, VH); x.fillStyle = C6.can[0]; x.fill();
        for (let xx = 0; xx < w; xx += 9) { const yy = bump(xx) + 3, rr = 5 + R(xx, 2) * 5; x.fillStyle = C6.can[1]; x.beginPath(); x.arc(xx, yy, rr, 0, TAU); x.fill(); x.fillStyle = C6.can[2]; x.beginPath(); x.arc(xx - rr * .25, yy - rr * .3, rr * .6, 0, TAU); x.fill(); if (R(xx, 3) < .4) { x.fillStyle = C6.can[3]; x.beginPath(); x.arc(xx - rr * .35, yy - rr * .45, rr * .3, 0, TAU); x.fill(); } }
        hardenCanvas(x.canvas, 0);
      });
      strip(ctx, f, 'ceibas', .42, (x, w) => {
        for (const q of CAMP.props(0, w, 'near', 37)) { if (q.k !== 'ceiba') continue; x.beginPath(); CAMP.ceiba(x, q.x, 232, q.h * 1.3, q.w * 1.3, q.s, 'trunk'); x.fillStyle = C6.near[0]; x.fill(); x.beginPath(); CAMP.ceiba(x, q.x, 232, q.h * 1.3, q.w * 1.3, q.s, 'crown'); x.fillStyle = C6.near[1]; x.fill(); x.save(); x.clip(); x.translate(1.5, 1.5); x.beginPath(); CAMP.ceiba(x, q.x, 232, q.h * 1.3, q.w * 1.3, q.s, 'crown'); x.restore(); x.strokeStyle = C6.near[2]; x.lineWidth = .8; x.beginPath(); for (let k = 0; k < 4; k++) { x.moveTo(q.x + (k - 1.5) * 8, 232 - q.h * 1.1); x.quadraticCurveTo(q.x + (k - 1.5) * 9 + 3, 232 - q.h * .6, q.x + (k - 1.5) * 8 - 2, 232 - q.h * .3 + k * 4); } x.stroke(); }
        x.fillStyle = C6.near[0]; x.fillRect(0, 230, w, 20);
        hardenCanvas(x.canvas, 0);
      });
      ctx.restore();
    },
    telonPropio: true,
    terrain(ctx, f) {
      const loops = organicLoops({ step: 3, amp: .6, freq: .45, seed: 64 });
      const P = () => { ctx.beginPath(); for (const l of loops) pathRound(ctx, l, 1.5); };
      P(); ctx.fillStyle = C6.soil[2]; ctx.fill();
      ctx.save(); P(); ctx.clip();
      for (let y = 100; y < VH + 10; y += 14) { ctx.fillStyle = (y / 14 | 0) % 2 ? C6.soil[1] : C6.soil[2]; ctx.beginPath(); ctx.moveTo(0, VH + 10); for (let x = 0; x <= L.ww; x += 6) ctx.lineTo(x, y + Math.sin(x * .03 + y) * 3); ctx.lineTo(L.ww, VH + 10); ctx.fill(); }
      const r0 = rng(64); for (let i = 0; i < L.ww / 14; i++) { const x = r0() * L.ww, y = 120 + r0() * 120, rr = 1.5 + r0() * 3; ctx.fillStyle = C6.soil[0]; ctx.beginPath(); ctx.ellipse(x + .6, y + .6, rr * 1.3, rr, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#8a8a7a'; ctx.beginPath(); ctx.ellipse(x, y, rr * 1.3, rr, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#b4b4a0'; ctx.beginPath(); ctx.ellipse(x - rr * .3, y - rr * .35, rr * .6, rr * .35, 0, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = C6.soil[0]; ctx.lineWidth = .7; for (const r of L.tops) for (let x = r.x0 + 6; x < r.x1 - 4; x += 18) { ctx.beginPath(); ctx.moveTo(x, r.y + 4); ctx.quadraticCurveTo(x + 3, r.y + 10, x - 2, r.y + 16 + R(x, 4) * 8); ctx.stroke(); }
      for (const r of L.bottoms) { ctx.fillStyle = C6.soil[0]; ctx.fillRect(r.x0, r.y - 3, r.x1 - r.x0, 3); }
      ctx.restore();
      // pasto grueso con briznas
      for (const r of L.tops) {
        ctx.fillStyle = C6.grass[0]; ctx.beginPath(); ctx.moveTo(r.x0 - 1, r.y + 6); for (let x = r.x0 - 1; x <= r.x1 + 1; x += 2) ctx.lineTo(x, r.y + 5 + (x % 4 ? 1.5 : 0)); ctx.lineTo(r.x1 + 1, r.y - 1); ctx.lineTo(r.x0 - 1, r.y - 1); ctx.fill();
        ctx.fillStyle = C6.grass[1]; ctx.fillRect(r.x0 - 1, r.y - 1, r.x1 - r.x0 + 2, 3.5);
        for (let x = r.x0; x < r.x1; x += 1) { const h = 1.5 + R(x, 7) * 3.5; ctx.fillStyle = R(x, 8) < .5 ? C6.grass[2] : C6.grass[1]; ctx.beginPath(); ctx.moveTo(x - .5, r.y); ctx.lineTo(x + (R(x, 9) - .5) * 1.5, r.y - h); ctx.lineTo(x + .5, r.y); ctx.fill(); if (R(x, 10) < .08) { ctx.fillStyle = C6.grass[3]; ctx.fillRect(x, r.y - h, .7, .7); } }
      }
      for (const o of L.deco) {
        const x = o.x, y = o.y;
        if (o.k === 'T') { const h = 56 + R(o.i, 1) * 12; ctx.beginPath(); CAMP.ceiba(ctx, x, y + 1, h, 46, o.i, 'trunk'); ctx.fillStyle = '#6a5a4a'; ctx.fill(); ctx.beginPath(); CAMP.ceiba(ctx, x, y + 1, h, 46, o.i, 'crown'); ctx.fillStyle = C6.can[1]; ctx.fill(); ctx.save(); ctx.clip(); ctx.translate(-1.5, -1.5); ctx.beginPath(); CAMP.ceiba(ctx, x, y + 1, h, 46, o.i, 'crown'); ctx.fillStyle = C6.can[2]; ctx.fill(); ctx.translate(-1.2, -1.2); ctx.beginPath(); CAMP.ceiba(ctx, x, y + 1, h, 46, o.i, 'crown'); ctx.fillStyle = C6.can[3]; ctx.globalAlpha = .6; ctx.fill(); ctx.restore(); }
        else if (o.k === 'f') for (let k = 0; k < 2; k++) { const fx = x - 4 + k * 8; ctx.strokeStyle = C6.grass[0]; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(fx, y); ctx.lineTo(fx, y - 10); ctx.stroke(); for (let j = 0; j < 4; j++) { ctx.fillStyle = j % 2 ? '#ffd23f' : '#e8402a'; ctx.beginPath(); ctx.moveTo(fx, y - 10 + j * 2.4); ctx.lineTo(fx + (j % 2 ? -4 : 4), y - 9 + j * 2.4); ctx.lineTo(fx, y - 8 + j * 2.4); ctx.fill(); } }
        else if (o.k === 'r') { ctx.fillStyle = '#7a7a6a'; ctx.fillRect(x - 6, y - 16, 12, 16); ctx.fillStyle = '#9a9a88'; ctx.fillRect(x - 6, y - 16, 12, 2); ctx.fillRect(x - 6, y - 16, 2, 16); ctx.fillStyle = '#5a5a4c'; ctx.fillRect(x - 3, y - 12, 6, 1); ctx.fillRect(x - 3, y - 9, 2, 4); ctx.fillRect(x + 1, y - 9, 2, 4); ctx.fillRect(x - 3, y - 4, 6, 1); ctx.fillStyle = C6.grass[1]; ctx.fillRect(x - 6, y - 17, 5, 1.5); }
      }
      hardenCanvas(ctx.canvas, 14, 1);
    },
    player(ctx, p, f) { drawHero(ctx, p, f, { body: '#f6f1e6', skin: '#c98a5e', hair: '#241718', leg: '#3f8f4a', eye: '#241718' }); },
    coin(ctx, x, y, t, f) {
      const c = cached(f, 'canistel64', 14, 16, xx => { xx.fillStyle = '#b86a10'; xx.beginPath(); xx.ellipse(7, 9, 5, 6, .2, 0, TAU); xx.fill(); xx.fillStyle = '#f2a51a'; xx.beginPath(); xx.ellipse(6.5, 8.5, 4.2, 5.2, .2, 0, TAU); xx.fill(); xx.fillStyle = '#ffd25a'; xx.beginPath(); xx.ellipse(5.4, 7, 2, 2.6, .2, 0, TAU); xx.fill(); xx.fillStyle = '#fff4c0'; xx.fillRect(4.6, 5.6, 1, 1); xx.fillStyle = '#3f8a3a'; xx.beginPath(); xx.ellipse(9, 2.6, 3, 1.3, -.5, 0, TAU); xx.fill(); xx.fillStyle = '#5a3a1a'; xx.fillRect(7, 2, .8, 2); hardenCanvas(xx.canvas, 0); });
      const X = Math.round(x * 3) / 3, Y = Math.round((y + Math.sin(t * 2.6 + x) * 1.8) * 3) / 3;
      ctx.drawImage(c, X - 7, Y - 8, 14, 16); if (Math.floor(t * 2 + x) % 5 === 0) { ctx.fillStyle = '#ffffff'; ctx.fillRect(X - 3, Y - 5, 1, 1); }
    },
    goal(ctx, x, y, t) {
      const X = Math.round(x * 3) / 3, pulse = .6 + Math.sin(t * 3) * .3;
      ctx.fillStyle = '#5a5a4c'; ctx.fillRect(X - 9, y - 40, 18, 40); ctx.fillStyle = '#7a7a6a'; ctx.fillRect(X - 8, y - 40, 16, 39); ctx.fillStyle = '#9a9a88'; ctx.fillRect(X - 8, y - 40, 16, 2); ctx.fillRect(X - 8, y - 40, 2, 39);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, X, y - 26, 26, '#5affd8', .25 * pulse); ctx.restore();
      ctx.fillStyle = `rgba(90,255,216,${.5 + pulse * .5})`; ctx.fillRect(X - 4, y - 32, 8, 1.5); ctx.fillRect(X - 4, y - 32, 1.5, 10); ctx.fillRect(X + 2.5, y - 32, 1.5, 10); ctx.fillRect(X - 4, y - 23.5, 8, 1.5); ctx.fillRect(X - 1, y - 29, 2, 3);
      for (let k = 0; k < 3; k++) { ctx.fillStyle = ['#2fa86a', '#1f7a5a', '#e8402a'][k]; ctx.beginPath(); ctx.moveTo(X + 6, y - 40); ctx.quadraticCurveTo(X + 12 + k * 3, y - 54 - k * 3 + Math.sin(t * 2 + k) * 2, X + 18 + k * 4, y - 60 - k * 2); ctx.lineTo(X + 7, y - 41); ctx.fill(); }
    },
    over(ctx, f) {
      // hojas en primer plano que pasan por delante (más rápido que la cámara)
      for (let i = 0; i < 4; i++) { const x = wrap(i * 260 + 60 - f.cam * 1.25, VW + 240) - 120; ctx.drawImage(leafCluster(f, i), Math.round(x * 3) / 3, i % 2 ? VH - 54 : -24, 90, 70); }
      ctx.fillStyle = 'rgba(255,250,210,.7)';
      ambient(20, 64, (i, a, b, c) => { const x = wrap(a * VW * 1.3 - f.cam * (.5 + c * .4) + Math.sin(f.t + i) * 6, VW + 10) - 5, y = wrap(b * VH - f.t * (3 + c * 3), VH); ctx.fillRect(Math.round(x * 3) / 3, Math.round(y * 3) / 3, 2 / 3, 2 / 3); });
      vignette(ctx, .25, '#0e2a1e', .5);
    },
    particle(ctx, q) { const s = q.life / q.max > .5 ? 1 : 2 / 3; PX(ctx, Math.round(q.x * 3) / 3, Math.round(q.y * 3) / 3, s, s, q.c); },
  });
})();
