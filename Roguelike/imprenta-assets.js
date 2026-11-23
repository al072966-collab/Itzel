'use strict';
// Estampas: las prensas, los pliegos y la copia de Itzel siguen siendo dinámicos.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.grabado) return;
  const V = vestirNivel({ id: 'grabado', nivel: 'grabado', carpeta: 'imprenta-estampas', ver: 1 });
  const { spr } = V, pick = (a, i) => a[i % a.length];
  // telón: pliegos estampados colgando del techo y, lejos, las prensas y estantes del taller entre papel
  V.cielo((c, f, antes) => {
    antes();
    // sellos rojos de tinta (círculos con un grabado adentro) que aparecen en el cielo, se quedan un momento y se desvanecen
    for (let q = 0; q < 3; q++) {
      const per = 6, tt = (f.t + q * 2) % per, n = Math.floor((f.t + q * 2) / per), a = tt < .4 ? tt / .4 : tt > 4 ? Math.max(0, 1 - (tt - 4) / 2) : 1; if (a <= 0) continue;
      const x = 50 + V.h1(n * 3 + q, 51) * (VW - 100), y = 30 + V.h1(n * 3 + q, 52) * 60, r = 9 + V.h1(n * 3 + q, 53) * 6;
      c.save(); c.globalAlpha = a * .55; c.strokeStyle = '#b3261e'; c.lineWidth = 1.6; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.stroke(); c.lineWidth = .7; c.beginPath(); c.arc(x, y, r - 3, 0, 6.2832); c.stroke();
      c.fillStyle = '#b3261e'; for (let k = 0; k < 6; k++) { const an = k * 1.0472 + n; c.beginPath(); c.ellipse(x + Math.cos(an) * r * .4, y + Math.sin(an) * r * .4, r * .32, r * .13, an, 0, 6.2832); c.fill(); } c.restore();
    }
    // pliegos estampados que vuelan: papel crema con una huella roja, que gira y se mece como una hoja
    for (let i = 0; i < 9; i++) {
      const w = VW + 60, ph = (f.t * (.03 + V.h1(i, 61) * .03) + V.h1(i, 62)) % 1, x = ((V.h1(i, 63) * w - f.cam * (.14 + V.h1(i, 64) * .16) + ph * 80 + Math.sin(f.t * .9 + i) * 14) % w + w) % w - 30, y = -8 + ph * 214;
      c.save(); c.translate(x, y); c.rotate(Math.sin(f.t * 1.3 + i * 2) * .8); c.scale(1, .45 + .55 * Math.abs(Math.cos(f.t * 1.1 + i)));
      // pliegos de fondo: en tono desvanecido (no se parecen a lo que se recoge)
      c.fillStyle = '#e3d8bb'; c.fillRect(-5.5, -4.5, 10, 8); c.strokeStyle = '#a89c86'; c.lineWidth = .4; c.strokeRect(-5.5, -4.5, 10, 8);
      c.fillStyle = '#b98b80'; c.beginPath(); c.arc(-.5, -.5, 2.4, 0, 6.2832); c.fill(); c.fillStyle = '#e3d8bb'; c.beginPath(); c.arc(-.5, -.5, 1, 0, 6.2832); c.fill(); c.restore();
    }
    // gotas de tinta roja que caen y dejan un círculo que se abre en el suelo lejano
    for (let i = 0; i < 6; i++) {
      const ph = (f.t * .5 + V.h1(i, 71) * 3) % 3, x = ((V.h1(i, 72) * (VW + 40) - f.cam * .25) % (VW + 40) + VW + 40) % (VW + 40) - 20;
      if (ph < 1) { const y = 20 + ph * ph * 165; c.fillStyle = '#b3261e'; c.beginPath(); c.ellipse(x, y, 1, 2 + ph * 1.5, 0, 0, 6.2832); c.fill(); }
      else if (ph < 1.7) { const u = (ph - 1) / .7; c.strokeStyle = 'rgba(179,38,30,' + (.6 * (1 - u)).toFixed(2) + ')'; c.lineWidth = .8; c.beginPath(); c.ellipse(x, 185, 1 + u * 9, .6 + u * 2, 0, 0, 6.2832); c.stroke(); }
    }
    // (antes aquí colgaban prensas y estantes translúcidos a medio cielo: flotaban en la nada y se confundían con lo que se toca)
  });
  // la decoración del taller va en tono desvanecido (tools/imprenta-grabado.py → «-deco»): lo que se toca o lastima va en tinta negra y rojo
  const sprD = (c, n, ...r) => spr(c, n + '-deco', ...r);
  V.terreno(ctx => {
    // figurillas de Jaina sobre las orillas pisables, de trecho en trecho (decoración: no cambian el piso)
    for (const r of L.tops) for (let x = r.x0 + 24; x < r.x1 - 16; x += 70 + V.h1(x | 0, r.y) * 60) if (V.h1(x | 0, 55) > .45) sprD(ctx, ['jaina0', 'jaina1', 'jaina2', 'jaina3', 'jaina4'][Math.floor(V.h1(x | 0, 56) * 5)], x, r.y + .6, { voltea: V.h1(x | 0, 57) < .5 });
    for (const o of L.deco) {
      const x = o.x + 8, y = o.y + .5, i = o.i, v = V.h1(i, 7);
      if (o.k === 'T') sprD(ctx, ['tendedero', 'prensa', 'biombo', 'estante', 'mesa', 'rodillo', 'papeles'][i % 7], x, y);
      else if (o.k === 'f') sprD(ctx, pick(['jaina0', 'taco0', 'jaina2', 'rodilloRojo', 'jaina1', 'tinteros0', 'jaina3', 'taco1', 'jaina4', 'rodilloRojo', 'tinteros0', 'taco1', 'rollos', 'tinteros1', 'taco2', 'cuenco', 'tinteros2'], i), x, y, { voltea: v < .5 });
      else if (o.k === 'r') sprD(ctx, pick(['jaina4', 'baul', 'jaina3', 'banquito', 'banquito', 'resma', 'cajita', 'mortero', 'vaso', 'pliegos', 'gubias', 'bolsa'], i), x, y);
    }
  });
  V.fd('erizoTinta', (c, e, t, s, antes) => {
    if (e.st === 'sleep') return V.dormido(c, 'erizo0', t);
    antes(c, e, t, s);                                      // la hoja Forge incluye caminar, enrollarse y recuperarse
  }, 'erizo0');
  V.fd('calavera', (c, e, t) => {
    if (e.st === 'sleep') return V.dormido(c, 'calavera0', t);
    // La hoja general es una cabeza sin cuerpo; esta variante conserva
    // las dos poses propias de la imprenta también al despertar.
    const n = Math.sin((e.anim || t) * 9) > 0 && V.listo('calavera1') ? 'calavera1' : 'calavera0'; spr(c, n, 0, .5);
  }, 'calavera0');
  window.IMPRENTA_ASSETS = V;
})();
