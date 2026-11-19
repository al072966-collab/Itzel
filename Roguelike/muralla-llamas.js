'use strict';
// Muralla en llamas: acabados de amate; mecánicas y zonas quedan intactas.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.fuego) return;
  const V = vestirNivel({ id: 'fuego', carpeta: 'muralla-llamas', ver: 3 });
  const { spr, h1 } = V;
  // telón: la ciudad lejana ardiendo (de la lámina) y humo que sube; el telón de amate de antes se queda debajo
  V.cielo((c, f, antes) => {
    antes();
    const u = 260, off = (f.cam * .1) % u, base = Math.floor(f.cam * .1 / u);
    c.save(); c.globalAlpha = .5;
    for (let k = -1; k * u - off < VW + u; k++) spr(c, 'skyline', k * u - off, 182, { ay: 1, ax: 0, k: 1.15 });
    c.restore();
    const g = c.createLinearGradient(0, 120, 0, 200); g.addColorStop(0, 'rgba(120,40,20,0)'); g.addColorStop(1, 'rgba(160,60,20,.28)'); c.fillStyle = g; c.fillRect(0, 120, VW, 80);
    // resplandor del incendio que late sobre toda la ciudad
    c.save(); c.globalCompositeOperation = 'lighter'; const pu = .8 + .2 * Math.sin(f.t * 2.3 + Math.sin(f.t * 5) * .5);
    const rg = c.createRadialGradient(VW * .5, 190, 10, VW * .5, 190, 270); rg.addColorStop(0, 'rgba(255,120,40,' + (.28 * pu).toFixed(3) + ')'); rg.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = rg; c.fillRect(0, 40, VW, 200); c.restore();
    // barcos piratas con bandera negra, recortados en tinta, que navegan despacio al fondo; uno ya lleva la vela en llamas
    const ub = 380, offb = (f.cam * .05 + f.t * 3) % ub, baseb = Math.floor((f.cam * .05 + f.t * 3) / ub);
    for (let k = -1; k * ub - offb < VW + ub; k++) {
      const i = baseb + k, x = k * ub - offb + 60 + h1(i, 7) * 120, y = 176, ard = h1(i, 8) > .5;
      c.save(); c.translate(x, y); c.globalAlpha = .85; c.fillStyle = '#2a1810'; c.strokeStyle = '#2a1810'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(-24, -6); c.lineTo(24, -6); c.lineTo(17, 4); c.lineTo(-18, 4); c.closePath(); c.fill();
      c.fillRect(-1, -42, 2, 38); c.fillRect(-14, -28, 2, 22); c.fillRect(11, -24, 2, 18);
      c.fillStyle = ard ? '#7a2a1a' : '#e9d9b4'; c.beginPath(); c.moveTo(1.5, -40); c.quadraticCurveTo(14 + Math.sin(f.t * 2 + i) * 1.5, -28, 1.5, -10); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#e9d9b4'; c.beginPath(); c.moveTo(-12.5, -26); c.quadraticCurveTo(-4, -18, -12.5, -8); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#111'; c.fillRect(-1, -48, 11, 6); c.fillStyle = '#e9d9b4'; c.fillRect(2.5, -46.4, 1.6, 1.6); c.fillRect(6, -46.4, 1.6, 1.6); c.fillRect(3.6, -44.4, 3.2, .8);
      c.restore();
      if (ard) { c.save(); c.globalCompositeOperation = 'lighter'; for (let q = 0; q < 5; q++) { const ph = (f.t * 1.1 + q * .2 + i) % 1; glowDot(c, x + 4 + Math.sin(ph * 8 + q) * 3, y - 14 - ph * 26, 5 + (1 - ph) * 5, '#ff8030', .5 * (1 - ph)); } c.restore(); }
      const cf = (f.t * .5 + h1(i, 9) * 3) % 3; if (cf < .3) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x + 24, y - 2, 11 * (1 - cf / .3) + 3, '#ffe08a', .9 * (1 - cf / .3)); c.restore(); }
      for (let q = 0; q < 5; q++) { const ph = ((f.t * .35 + q / 5 + h1(i, 9)) % 1); c.fillStyle = 'rgba(70,50,40,' + (.35 * (1 - ph)).toFixed(3) + ')'; c.beginPath(); c.arc(x + 26 + ph * 20, y - 2 - ph * 14, 2 + ph * 5, 0, 6.2832); c.fill(); }
    }
    // brasas de papel (rombitos rojos y naranjas) que suben de la ciudad y giran
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 42; i++) {
      const w = VW + 40, ph = (f.t * (.05 + h1(i, 21) * .07) + h1(i, 22)) % 1, x = ((h1(i, 23) * w - f.cam * (.18 + h1(i, 24) * .2) + Math.sin(f.t * 1.2 + i) * 8) % w + w) % w - 20, y = 200 - ph * 190, a = (1 - ph) * (.55 + .45 * Math.sin(f.t * 8 + i));
      c.save(); c.translate(x, y); c.rotate(f.t * 2 + i); c.fillStyle = h1(i, 25) > .5 ? 'rgba(255,100,40,' + a.toFixed(3) + ')' : 'rgba(255,190,70,' + a.toFixed(3) + ')'; c.fillRect(-1.2, -1.2, 2.4, 2.4); c.restore();
    }
    c.restore();
  });
  let piedra = null;
  V.terreno(ctx => {
    if (V.listo('piedra')) {   // sillares bajo el piso y la cornisa de piedra de la lámina sobre cada borde (el fuego y los tablones siguen siendo los de antes)
      if (!piedra) { piedra = ctx.createPattern(V.IMG.piedra, 'repeat'); piedra.setTransform(new DOMMatrix().scale(V.TAM.piedra.w / V.IMG.piedra.naturalWidth)); }
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip(); ctx.globalAlpha = .4; ctx.fillStyle = piedra; ctx.fillRect(0, 0, L.ww, VH + 40); ctx.globalAlpha = 1; ctx.restore();
    }
    for (const o of L.deco) {
      const x = o.x + 8, y = o.y + .5, i = o.i, v = V.h1(i, 7);
      if (o.k === 'T') spr(ctx, ['bandera', 'casaQ', 'garita', 'bandera', 'fuerteQ'][i % 5], x, y);
      else if (o.k === 'f') spr(ctx, ['barriles', 'caja', 'saco', 'balas', 'cubeta0', 'cubeta1'][i % 6], x, y, { voltea: v < .5 });
      else if (o.k === 'r') spr(ctx, ['puerta0', 'balcon', 'puerta1', 'ventana', 'almenas', 'puerta2'][i % 6], x, y);
    }
  });
  V.fd('incendiario', (c, e, t, s, antes) => {
    if (e.st === 'sleep') {
      const assets = window.ENEMIGOS_ASSETS, hoja = assets?.hojaForge('incendiario');
      if (!hoja?.complete || !hoja.naturalWidth) return V.dormido(c, 'pirata0', t);
      c.save(); c.rotate(-.12); c.filter = 'saturate(.6) brightness(.82)';
      assets.pinta(c, e, t, 'incendiario', assets.recurso('incendiario')); c.restore(); return;
    }
    antes(c, e, t, s);                                        // conserva el diseño de amate con las poses Forge
  }, 'pirata0');
  V.fd('magma', (c, e, t, s, antes) => {
    if (e.piedra && e.st === 'glass') {
      // El bloque físico está entre x=-8..8 e y=-14..0: la línea es su techo.
      c.save(); c.beginPath(); c.rect(-8, -14, 16, 14); c.clip(); spr(c, 'magmaFrio', 0, 0, { h: 14 }); c.restore();
      c.strokeStyle = '#d1d6d2'; c.lineWidth = .8; c.beginPath(); c.moveTo(-8, -14); c.lineTo(8, -14); c.stroke(); return;
    }
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('magma');
    if (hoja?.complete && hoja.naturalWidth && e.st !== 'sleep') { antes(c, e, t, s); return; }
    spr(c, 'magma0', 0, .5);
  }, 'magma0');
  V.fd('salamandra', (c, e, t, s, antes) => {
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('salamandra');
    if (e.st === 'sleep') {
      if (!hoja?.complete || !hoja.naturalWidth) return V.dormido(c, 'salamandra0', t);
      c.save(); c.rotate(-.12); c.filter = 'saturate(.6) brightness(.82)'; antes(c, e, t, s); c.restore(); return;
    }
    if (hoja?.complete && hoja.naturalWidth) return antes(c, e, t, s);
    spr(c, 'salamandra' + (Math.floor((e.anim || t) * 4) % 2), 0, .5);
  }, 'salamandra0');
  V.fd('iguana', (c, e, t, s, antes) => {
    if (e.st !== 'ok') return antes(c, e, t, s);
    spr(c, 'iguana' + (Math.floor((e.anim || t) * 5) % 2), 0, .5);
  }, 'iguana0');
  // El fuego, los tablones y el agua siguen a cargo de sus dibujos originales.
  V.moneda('canistel'); V.corazon('corazon');
  window.MURALLA_LLAMAS = V;
})();
