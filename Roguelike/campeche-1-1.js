'use strict';
// Piezas de 1-1: muestreo por vecino más próximo y lógica original.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.bits8) return;
  const V = vestirNivel({ id: 'bits8', carpeta: 'campeche-1-1', ver: 2, manifiesto: window.CAMPECHE_UNO_MANIFIESTO });
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
  // Capas ilustradas propias del nivel lateral; la simulación no se modifica.
  const paisaje = {};
  for (const [n, archivo] of Object.entries({ ciudad:'ciudad-panorama-v1', papel:'papel-picado-v1', mar:'mar-v1', sol:'sol-v1', cielo:'cielo-nubes-v1', arbol:'flamboyan-v1' })) {
    const im = paisaje[n] = new Image(); im.decoding = 'async';
    im.onload = () => V.rehaz(); im.src = '../Roguelike/assets/campeche-1-1/' + archivo + '.png';
  }
  const paisajeListo = () => Object.values(paisaje).every(im => im.complete && im.naturalWidth);
  function panoramaCampeche(c, f) {
    const ciudad = paisaje.ciudad, mar = paisaje.mar, papel = paisaje.papel;
    const dy = -(f.y0 || 0), base = 182 + dy, ancho = 580, alto = 187;
    const off = ((f.cam * .17 % ancho) + ancho) % ancho;
    c.save(); c.imageSmoothingEnabled = false;
    // La banqueta forma una base continua; el mar empieza exactamente debajo.
    c.drawImage(paisaje.cielo, 0, 0, VW, f.H || VH);
    for (let x = -off - ancho; x < VW + ancho; x += ancho)
      c.drawImage(ciudad, 0, 0, 2172, 700, Math.round(x), Math.round(base - alto), ancho, alto);
    c.drawImage(mar, 0, 312, 2172, 412, 0, Math.round(base), VW, Math.max(1, (f.H || VH) - base));
    c.drawImage(paisaje.sol, 55, Math.round(45 + dy), 30, 30);
    // Guirnaldas pequeñas a la escala de las casas, con sus extremos en la franja de tejados.
    const paso = 200, p = ((f.cam * .17 % paso) + paso) % paso;
    for (let x = -p - paso; x < VW + paso; x += paso)
      c.drawImage(papel, 25, 202, 2123, 340, Math.round(x), Math.round(base - 83), paso, 12);
    for (let i = 0; i < (window.FAUNA_ARTE?.listo('gaviotaPixel') ? 3 : 0); i++) {
      const w = VW + 80, x = ((V.h1(i, 41) * w + f.t * (10 + V.h1(i, 42) * 8) - f.cam * .2) % w + w) % w - 40;
      FAUNA_ARTE.dib(c, 'gaviotaPixel', f.t + i * .37, Math.round(x), Math.round(40 + V.h1(i, 43) * 50 + dy), { h: 5, ay: .5, fps: 6, seq: [0,1,3,2,3,1], pixel: true });
    }
    c.restore();
  }
  // cielo: nubes de pixel de la lámina y, lejos, la hilera de casas coloniales de Campeche con el cielo de 1-1
  V.cielo((c, f, antes) => {
    const id = (f.g && f.g.def && f.g.def.id) || (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id);
    if (id === 'bits8' && paisajeListo()) { panoramaCampeche(c, f); return; }
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
  // El dibujo se adapta al ancho de colisión existente; las cuerdas de la
  // balanza siguen al mecanismo original y no alteran su movimiento.
  const plataformaMovil = new Image();
  plataformaMovil.onload = () => V.rehaz();
  plataformaMovil.src = '../Roguelike/assets/campeche-1-1/plataforma-movil-v1.png';
  const polea = new Image();
  polea.onload = () => V.rehaz();
  polea.src = '../Roguelike/assets/campeche-1-1/polea-v1.png';
  for (const tipo of ['ladrillo8', 'balanza']) {
    const dibujaOriginal = MEC.LOOK[tipo];
    if (typeof dibujaOriginal !== 'function') continue;
    MEC.LOOK[tipo] = function (c, pl, f, sk) {
      const id = (f && f.g && f.g.def && f.g.def.id) || (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id);
      if (id !== 'bits8' || !plataformaMovil.complete || !plataformaMovil.naturalWidth) return dibujaOriginal.call(this, c, pl, f, sk);
      if (tipo === 'balanza' && (!polea.complete || !polea.naturalWidth)) return dibujaOriginal.call(this, c, pl, f, sk);
      c.save(); c.imageSmoothingEnabled = false;
      if (tipo === 'balanza') {
        const x = Math.round(pl.x), y = Math.round(pl.y), w = pl.w, top = Math.round(pl.y0 - 70);
        // Las cuerdas siguen la altura real de cada plataforma de la pareja.
        c.fillStyle = '#513522';
        for (const px of [x + 2, x + w - 3]) {
          c.fillRect(px, top, 2, Math.max(0, y - top));
          c.fillStyle = '#e6b66b'; c.fillRect(px, top, 1, Math.max(0, y - top)); c.fillStyle = '#513522';
        }
        if (pl.guia && pl.otra) {
          const extremo = Math.round(pl.otra.x + pl.otra.w - 3);
          c.fillRect(x + 2, top, extremo - x - 1, 2);
          c.fillStyle = '#e6b66b'; c.fillRect(x + 2, top, extremo - x - 1, 1);
          for (const px of [x + 2, extremo]) c.drawImage(polea, 200, 95, 850, 1110, px - 5, top - 6, 10, 13);
        }
      }
      c.drawImage(plataformaMovil, 351, 295, 1470, 192, Math.round(pl.x), Math.round(pl.y), Math.round(pl.w), 6);
      c.restore();
    };
  }
  V.terreno(ctx => {
    if (V.listo('ladrillo')) {   // sillares dorados de la lámina bajo la superficie, y el remate blanco sobre cada borde
      if (!ladr) { ladr = ctx.createPattern(V.IMG.ladrillo, 'repeat'); ladr.setTransform(new DOMMatrix().scale(V.TAM.ladrillo.w / V.IMG.ladrillo.naturalWidth)); }
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = .9; ctx.fillStyle = ladr; ctx.fillRect(0, 0, L.ww, VH + 40);
      if (V.listo('tope')) { const w = V.TAM.tope.w; for (const r of L.tops) for (let x = r.x0; x < r.x1; x += w) pixel(ctx, 'tope', x, r.y - .5, { ax: 0, ay: 0 }); }
      ctx.restore();
    }
    for (const o of L.deco) {
      const x = o.x + 8, y = o.y + .5, i = o.i;
      if (o.k === 'T') {
        const id = (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id);
        if (id === 'bits8' && i % 5 === 3 && paisaje.arbol.complete && paisaje.arbol.naturalWidth) {
          ctx.save(); ctx.imageSmoothingEnabled = false;
          ctx.drawImage(paisaje.arbol, 26, 119, 1472, 808, Math.round(x - 22), Math.round(y - 25), 44, 25);
          ctx.restore();
        } else pixel(ctx, ['palma', 'palma2', 'farol2', 'palma', 'buganvilia'][i % 5], x, y);
      }
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
