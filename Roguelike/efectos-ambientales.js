'use strict';
// Efectos de ambiente con recortes ilustrados (hojas de efectos-ambientales-datos.js, cortadas por
// tools/efectos-ambientales.py). Son partículas ligeras DELANTE del mundo: no cambian plataformas
// ni dan información de juego. Cada estilo-nivel principal trae sus capas; sin imagen no pinta nada.
(function () {
  if (typeof GANCHOS === 'undefined' || !window.EFECTOS_AMB_HOJAS) return;
  const HOJAS = window.EFECTOS_AMB_HOJAS, IMG = {};
  const imagen = k => {
    if (!IMG[k]) { const im = new Image(); im.decoding = 'async'; im.src = '../Roguelike/assets/' + HOJAS[k].src + '?v=1'; IMG[k] = im; }
    const im = IMG[k]; return im.complete && im.naturalWidth ? im : null;
  };
  const hs = (i, s) => { let h = (i * 374761393 + s * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const frac = x => x - Math.floor(x);
  const celdas = (k, filas) => filas.flatMap(i => HOJAS[k].filas[i] || []);
  // tipo: caida (cae con vaivén) · sube · viento (ráfaga que cruza) · flota (pulsa, suma luz) · rayo (destello ocasional)
  // n: cantidad · alto/ancho: tamaño en pantalla · a: opacidad · v: velocidad · par: parallax con la cámara
  const CAPAS = {
    hollin: [
      { hoja: 'ceniza', filas: [0], tipo: 'caida', n: 14, ancho: 8, a: .55, v: 9, par: .35 },
      { hoja: 'ceniza', filas: [2], tipo: 'caida', n: 8, ancho: 5, a: .7, v: 14, par: .5 },
      { hoja: 'ceniza', filas: [1], tipo: 'rayo', n: 1, alto: 56, a: .8, ciclo: 9 },
    ],
    hielo: [{ hoja: 'rafagas', filas: [0, 1], tipo: 'viento', n: 5, ancho: 74, a: .5, v: 150, par: .6 }],
    bits64: [{ hoja: 'rayos64', filas: [4], tipo: 'flota', n: 12, ancho: 5, a: .8, v: 6, par: .4, luz: true }],
    bits32: [{ hoja: 'fatuos', filas: [0, 1, 2], tipo: 'flota', n: 9, alto: 20, a: .85, v: 5, par: .3, luz: true, abajo: true }],
    cuaderno: [{ hoja: 'migajas', filas: [1, 2], tipo: 'caida', n: 10, ancho: 6, a: .7, v: 10, par: .4 }],
  };
  function capa(c, f, C, t) {
    const im = imagen(C.hoja); if (!im) return;
    const cs = celdas(C.hoja, C.filas); if (!cs.length) return;
    const W = typeof VW === 'number' ? VW : 400, H = f.H || (typeof VH === 'number' ? VH : 200), cam = f.cam || 0;
    for (let i = 0; i < C.n; i++) {
      const cel = cs[Math.floor(hs(i, 1) * cs.length) % cs.length], [sx, sy, sw, sh] = cel;
      const w = C.ancho ? C.ancho * (.8 + hs(i, 2) * .5) : C.alto * (.8 + hs(i, 2) * .5) * sw / sh, h = w * sh / sw;
      let x, y, a = C.a, rot = 0;
      const px = hs(i, 3), py = hs(i, 4), par = C.par || 0;
      if (C.tipo === 'caida' || C.tipo === 'sube') {
        const dir = C.tipo === 'caida' ? 1 : -1, v = C.v * (.6 + hs(i, 5) * .8);
        x = frac(px + (Math.sin(t * .7 + i * 1.7) * 6 - cam * par + t * (hs(i, 6) - .3) * 5) / (W + 60)) * (W + 60) - 30;
        y = frac(py + dir * t * v / (H + 60)) * (H + 60) - 30;
        const e = Math.min(1, Math.min(y + 30, H + 30 - y) / 30); a *= Math.max(0, e); rot = Math.sin(t * 1.3 + i) * .4;
      } else if (C.tipo === 'viento') {
        const ciclo = (W + 2 * w) / C.v + 2.5, u = frac((t + hs(i, 7) * ciclo) / ciclo), rec = u * ciclo * C.v;
        x = rec - w - cam * 0 ; y = 24 + py * (H * .55);
        a *= Math.sin(Math.PI * Math.min(1, u * 1.15)) ** .7; if (u > .87) a = 0;
      } else if (C.tipo === 'flota') {
        x = frac(px - cam * par / (W + 80)) * (W + 80) - 40 + Math.sin(t * .6 * (.6 + hs(i, 8)) + i * 2) * 12;
        y = (C.abajo ? H * (.35 + py * .55) : H * (.12 + py * .75)) + Math.cos(t * .5 + i * 1.3) * 7;
        a *= .55 + .45 * Math.sin(t * (1.2 + hs(i, 9)) + i * 3);
      } else if (C.tipo === 'rayo') {
        const ciclo = C.ciclo, T = t + hs(i, 1) * ciclo, n = Math.floor(T / ciclo), u = (T - n * ciclo);
        if (u > .35) continue;
        const k = Math.floor(hs(n, 11) * cs.length), c2 = cs[k], hh = C.alto, ww = hh * c2[2] / c2[3];
        x = hs(n, 12) * (W - 40) + 20; y = 4;
        const al = (u < .08 || (u > .14 && u < .2) ? 1 : .35) * C.a;
        c.save(); c.translate(cam, 0); c.globalAlpha = al; c.drawImage(im, c2[0], c2[1], c2[2], c2[3], x - ww / 2, y, ww, hh); c.restore(); continue;
      }
      if (a <= .01) continue;
      c.save(); c.translate(cam, 0); c.globalAlpha = Math.min(1, a);
      if (C.luz) c.globalCompositeOperation = 'lighter';
      c.translate(x, y); if (rot) c.rotate(rot);
      c.drawImage(im, sx, sy, sw, sh, -w / 2, -h / 2, w, h); c.restore();
    }
  }
  GANCHOS.en('WORLD_HOOK', prev => function (ctx, f, layer) {
    prev.apply(this, arguments);
    if (layer !== 'over') return;
    const g = f && f.g, def = g && g.def; if (!def || def.modo || !f.st || !CAPAS[def.id] || g.win) return;
    ctx.save(); ctx.imageSmoothingEnabled = !f.st.pixel; ctx.imageSmoothingQuality = 'high';
    for (const C of CAPAS[def.id]) capa(ctx, f, C, f.t || 0);
    ctx.restore();
  });
})();
