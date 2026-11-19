'use strict';
// Piezas de 1-1: muestreo por vecino más próximo y lógica original.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.bits8) return;
  const V = vestirNivel({ id: 'bits8', carpeta: 'campeche-1-1', ver: 2 });
  // vestirNivel normalmente suaviza las imágenes; aquí cada píxel debe quedar nítido.
  function pixel(c, n, x, y, o = {}) {
    if (!V.listo(n)) return false;
    const m = V.TAM[n]; let k = o.k || 1;
    if (o.w) k = o.w / m.w; else if (o.h) k = o.h / m.h;
    const w = m.w * k, h = m.h * k;
    c.save(); c.imageSmoothingEnabled = false; c.globalAlpha *= o.alfa === undefined ? 1 : o.alfa;
    c.drawImage(V.IMG[n], Math.round(x - w * (o.ax ?? .5)), Math.round(y - h * (o.ay ?? 1)), w, h); c.restore(); return true;
  }
  V.spr = pixel;
  function poseSalto(e, prefijo) {
    const vy = e.vy || 0, aire = vy !== 0 || (typeof MEC.onGround === 'function' && !MEC.onGround(e));
    if (vy < -1) e._forgeFaseSalto = 'Sube'; else if (vy > 1) e._forgeFaseSalto = 'Baja';
    if (aire) return prefijo + (e._forgeFaseSalto === 'Baja' ? 'Baja' : 'Sube');
    delete e._forgeFaseSalto;
    return e.tt > 0 && e.tt < .24 ? prefijo + 'Aviso' : prefijo + 'Reposo';
  }
  // cielo: nubes de pixel de la lámina y, lejos, la hilera de casas coloniales de Campeche con el cielo de 1-1
  V.cielo((c, f, antes) => {
    antes();
    // guirnaldas de banderines de papel picado entre las casas, que ondean con el viento (todo en píxeles enteros)
    const COL = ['#e8402a', '#f2b52e', '#2aa0d8', '#7ac043', '#d84a9a'], ug = 150, offg = (f.cam * .14) % ug, baseg = Math.floor(f.cam * .14 / ug);
    for (let k = -1; k * ug - offg < VW + ug; k++) {
      const i = baseg + k, x0 = Math.round(k * ug - offg), y0 = 112 + (i % 3) * 8;
      for (let q = 0; q < 14; q++) {
        const u = q / 13, x = Math.round(x0 + u * ug), y = Math.round(y0 + Math.sin(u * Math.PI) * 9), o = Math.round(Math.sin(f.t * 3 + q * .8 + i) * 1);
        c.fillStyle = '#3a2a22'; c.fillRect(x, y, 1, 1);
        if (q % 1 === 0 && q < 13) { c.fillStyle = COL[(q + i) % 5]; c.fillRect(x, y + 1, 4, 3 + o); c.fillRect(x + 1, y + 4 + o, 2, 1); }
      }
    }
    // gaviotas pixeladas (lámina de ChatGPT, fauna.js) que cruzan el cielo aleteando
    for (let i = 0; i < (window.FAUNA_ARTE?.listo('gaviotaPixel') ? 4 : 0); i++) {
      const w = VW + 80, x = Math.round(((V.h1(i, 41) * w + f.t * (10 + V.h1(i, 42) * 8) - f.cam * .2) % w + w) % w - 40), y = Math.round(40 + V.h1(i, 43) * 60 + Math.sin(f.t * 1.2 + i) * 3), up = Math.sin(f.t * 7 + i * 2) > 0;
      FAUNA_ARTE.dib(c, 'gaviotaPixel', f.t + i * .37, x, y, { h: 5, ay: .5, fps: 6, seq: [0, 1, 3, 2, 3, 1], pixel: true });
    }
    const unit = 170, off = (f.cam * .06) % unit, base = Math.floor(f.cam * .06 / unit);
    for (let k = -1; k * unit - off < VW + unit; k++) { const i = base + k; pixel(c, 'nube' + Math.floor(V.h1(i, 4) * 5), k * unit - off + V.h1(i, 6) * 60, 22 + V.h1(i, 8) * 70, { ay: .5 }); }
    const u2 = 150, o2 = (f.cam * .14) % u2, b2 = Math.floor(f.cam * .14 / u2);
    c.save(); c.globalAlpha = .72;
    for (let k = -1; k * u2 - o2 < VW + u2; k++) { const i = b2 + k; pixel(c, ['casa0', 'casa1', 'casa2', 'casa3', 'casa4', 'casa5'][Math.floor(V.h1(i, 3) * 6)], k * u2 - o2 + V.h1(i, 5) * 20, 176, { ay: 1 }); }
    c.restore();
  });
  let ladr = null;
  V.terreno(ctx => {
    if (V.listo('ladrillo')) {   // sillares dorados de la lámina bajo la superficie, y el remate blanco sobre cada borde
      if (!ladr) { ladr = ctx.createPattern(V.IMG.ladrillo, 'repeat'); ladr.setTransform(new DOMMatrix().scale(V.TAM.ladrillo.w / V.IMG.ladrillo.naturalWidth)); }
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = .9; ctx.fillStyle = ladr; ctx.fillRect(0, 0, L.ww, VH + 40);
      if (V.listo('tope')) { const w = V.TAM.tope.w; for (const r of L.tops) for (let x = r.x0; x < r.x1; x += w) pixel(ctx, 'tope', x, r.y - .5, { ax: 0, ay: 0 }); }
      ctx.restore();
    }
    for (const o of L.deco) {
      const x = o.x + 8, y = o.y + .5, i = o.i;
      if (o.k === 'T') pixel(ctx, ['palma', 'palma2', 'farol2', 'palma', 'buganvilia'][i % 5], x, y);
      else if (o.k === 'f') pixel(ctx, ['farol0', 'hibiscos', 'maceta0', 'farol1', 'maceta1'][i % 5], x, y);
      else if (o.k === 'r') pixel(ctx, ['maceta1', 'hibiscos', 'farol1', 'maceta0'][i % 4], x, y);
    }
  });
  V.fd('halcon', (c, e, t, s, antes) => {
    if (e.st === 'sleep') { c.save(); c.filter = 'brightness(.72)'; pixel(c, 'halcon', 0, .5); c.restore(); return; }   // dormido: la misma pieza, apagada
    if (window.ENEMIGOS_ASSETS?.hojasForge?.halcon && window.ENEMIGOS_ASSETS.hojaForge('halcon')?.complete && window.ENEMIGOS_ASSETS.hojaForge('halcon')?.naturalWidth) { antes(c, e, t, s); return; }
    const n = !e.apunta && V.listo('halconVuelo') ? 'halconVuelo' : 'halcon'; pixel(c, n, 0, .5);
  }, 'halcon');
  V.fd('chapulin', (c, e, t, s, antes) => {
    if (e.st === 'sleep') { c.save(); c.filter = 'brightness(.72)'; pixel(c, 'chapulin', 0, .5); c.restore(); return; }   // dormido: la misma pieza, apagada
    const n = poseSalto(e, 'chapulin');
    if (V.listo(n)) { pixel(c, n, 0, .5); return; }
    pixel(c, (e.vy !== 0 || (typeof MEC.onGround === 'function' && !MEC.onGround(e))) && V.listo('chapulinSalta') ? 'chapulinSalta' : 'chapulin', 0, .5);
  }, 'chapulin');
  V.fd('cangrejo', (c, e, t, s, antes) => { if (e.st === 'sleep') { c.save(); c.filter = 'brightness(.72)'; pixel(c, 'cangrejo', 0, .5); c.restore(); return; }   /* dormido: la misma pieza, apagada */ pixel(c, 'cangrejo', 0, .5); }, 'cangrejo');
  V.moneda('canistel');
  window.CAMPECHE_UNO = V;
})();
