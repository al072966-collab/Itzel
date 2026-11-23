'use strict';
// Cianotipia: solo dibujo; aire, fauna y corrientes conservan su lógica.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.agua) return;
  const V = vestirNivel({ id: 'agua', carpeta: 'fondo-golfo', ver: 1 });
  const { spr } = V;
  const panorama = new Image();
  panorama.onload = () => V.rehaz(); panorama.src = '../Roguelike/assets/fondo-golfo/arrecife-panorama-v1.png';
  const arena = new Image();
  arena.onload = () => V.rehaz(); arena.src = '../Roguelike/assets/fondo-golfo/arena-cianotipia-v1.png';
  // telón: el lecho del arrecife y el barco-arco lejanos, azul profundo, bajo las burbujas; rayos de luz desde arriba
  V.cielo((c, f, antes) => {
    const id = (f.g && f.g.def && f.g.def.id) || (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id);
    const nuevo = id === 'agua' && panorama.complete && panorama.naturalWidth;
    if (nuevo) {
      const ancho = 700, alto = f.H || VH, off = ((f.cam * .08 % ancho) + ancho) % ancho;
      c.save(); c.fillStyle = '#174a80'; c.fillRect(0, 0, VW, alto);
      for (let x = -off - ancho; x < VW + ancho; x += ancho) c.drawImage(panorama, 20, 12, 2132, 698, x, 0, ancho, alto);
      c.restore();
    } else antes();
    // cardúmenes: grupos de pececitos pálidos que nadan juntos, con su ondulación, y dan la vuelta al salir
    for (let g = 0; g < (nuevo ? 0 : 4); g++) {
      const dir = g % 2 ? -1 : 1, w = VW + 120, base = ((V.h1(g, 11) * w + dir * f.t * (9 + g * 3) - f.cam * .28 * dir * 0 - f.cam * .22) % w + w) % w - 60, y0 = 40 + g * 34 + V.h1(g, 12) * 14;
      for (let i = 0; i < 9; i++) {
        const x = base + (i % 3) * 8 * dir * -1 + (V.h1(g * 10 + i, 13) - .5) * 20, y = y0 + (Math.floor(i / 3) - 1) * 6 + Math.sin(f.t * 2 + i + g) * 2.2;
        c.fillStyle = 'rgba(205,232,250,' + (.4 + V.h1(g * 10 + i, 14) * .3).toFixed(2) + ')';
        c.beginPath(); c.moveTo(x + 3.2 * dir, y); c.lineTo(x - 1.2 * dir, y - 1.5); c.lineTo(x - 1.2 * dir, y + 1.5); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(x - 1.2 * dir, y); c.lineTo(x - 3.6 * dir, y - 1.5 - Math.sin(f.t * 9 + i) * .6); c.lineTo(x - 3.6 * dir, y + 1.5 + Math.sin(f.t * 9 + i) * .6); c.closePath(); c.fill();
      }
    }
    // columnas de burbujas que suben desde el fondo, cada una con su ritmo
    for (let col = 0; col < 7; col++) {
      const bx = ((V.h1(col, 21) * (VW + 40) - f.cam * .3) % (VW + 40) + VW + 40) % (VW + 40) - 20;
      for (let q = 0; q < 7; q++) { const ph = (f.t * (.18 + V.h1(col, 22) * .12) + q / 7 + V.h1(col, 23)) % 1, x = bx + Math.sin(ph * 9 + q + col) * 3, y = 205 - ph * 190, r = .8 + ph * 2.4; c.strokeStyle = 'rgba(220,240,255,' + (.6 * (1 - ph)).toFixed(2) + ')'; c.lineWidth = .5; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.stroke(); c.fillStyle = 'rgba(255,255,255,' + (.35 * (1 - ph)).toFixed(2) + ')'; c.fillRect(x - r * .4, y - r * .5, .8, .8); }
    }
    // reflejos de luz ondulantes (cáusticas) sobre el fondo de arena
    c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(170,215,255,.16)'; c.lineWidth = .8;
    for (let k = 0; k < 6; k++) { c.beginPath(); for (let x = 0; x <= VW; x += 5) { const yy = 188 + k * 5 + Math.sin(x * .09 + f.t * 1.4 + k * 1.3) * 2.2 + Math.sin(x * .21 - f.t * 1.9 + k) * 1.2; if (x) c.lineTo(x, yy); else c.moveTo(x, yy); } c.stroke(); }
    c.restore();
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) { const x = ((i * 97 - f.cam * .06) % (VW + 80) + VW + 80) % (VW + 80) - 40, g = c.createLinearGradient(x, 0, x + 40, VH * .8); g.addColorStop(0, 'rgba(120,190,230,.10)'); g.addColorStop(1, 'rgba(120,190,230,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 26, 0); c.lineTo(x + 70, VH * .8); c.lineTo(x + 30, VH * .8); c.fill(); }
    c.restore();
    const u2 = 420, o2 = (f.cam * .1) % u2, b2 = Math.floor(f.cam * .1 / u2);
    for (let k = -1; !nuevo && k * u2 - o2 < VW + u2; k++) { const i = b2 + k; spr(c, V.h1(i, 3) < .5 ? 'barcoArco' : 'arcoRoca', k * u2 - o2 + 40, 186, { ay: 1, alfa: .3 }); }
    const u3 = 290, o3 = (f.cam * .2) % u3;
    for (let k = -1; !nuevo && k * u3 - o3 < VW + u3; k++) spr(c, 'lecho', k * u3 - o3, 200, { ay: 1, ax: 0, alfa: .38 });
  });
  V.terreno(ctx => {
    const id = typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id;
    if (id === 'agua' && arena.complete && arena.naturalWidth) {
      // La máscara respeta cada hueco; el borde claro sigue cada superficie.
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip();
      // Una sola altura evita repetir una unión horizontal bajo el agua.
      for (let x = 0; x < L.ww; x += 700)
        ctx.drawImage(arena, 0, 105, 2172, 619, x, 0, 700, VH + 70);
      for (const r of L.tops) {
        ctx.save(); ctx.beginPath(); ctx.rect(r.x0, r.y, r.x1 - r.x0, 3); ctx.clip();
        for (let x = r.x0; x < r.x1; x += 220)
          ctx.drawImage(arena, 0, 85, 2172, 35, x, r.y, 220, 3);
        ctx.restore();
      }
      ctx.restore();
    }
    for (const o of L.deco) {
      const x = o.x + 8, y = o.y + .5, i = o.i, v = V.h1(i, 7);
      if (o.k === 'T') { const n = ['abanico', 'alga0', 'coral', 'esponjas', 'alga1', 'tubos', 'helecho0', 'cerebro', 'alga2', 'pasto'][i % 10]; spr(ctx, n, x, y, { alfa: .85, voltea: v < .5 }); }
      else if (o.k === 'f') spr(ctx, ['concha0', 'concha1', 'concha2', 'concha3', 'concha4', 'esponjaRoca', 'helecho1', 'helecho2'][i % 8], x, y, { alfa: .85, voltea: v < .5 });
      else if (o.k === 'r') spr(ctx, ['naufragio', 'barril', 'ancla', 'mastil', 'poste', 'timon', 'barandal', 'roca'][i % 8], x, y, { alfa: .85 });
    }
  });
  V.fd('botete', (c, e, t, s, antes) => {
    if (e.st === 'sleep') return V.dormido(c, 'botete0', t, 0, { w: 12 });   // dormido: la misma pieza (no el dibujo viejo)
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('botete');
    if (hoja?.complete && hoja.naturalWidth) { antes(c, e, t, s); return; }
    const k = Math.max(0, Math.min(1, e.puff || 0));
    spr(c, k > .5 ? 'botete1' : 'botete0', 0, 0, { w: 12 + 10 * k });
  }, 'botete0');
  V.fd('pezloro', (c, e, t, s, antes) => {
    if (e.st === 'sleep') return V.dormido(c, 'pezloro0', t, 0);   // dormido: la misma pieza (no el dibujo viejo)
    const assets = window.ENEMIGOS_ASSETS, hoja = assets?.hojaForge('pezloroGolfo');
    if (hoja?.complete && hoja.naturalWidth >= 512 && e.st !== 'gone') return assets.pinta(c, e, t, 'pezloroGolfo', assets.recurso('pezloroGolfo'));
    spr(c, e.muerde ? 'pezloro1' : 'pezloro0', 0, 0);
  }, 'pezloro0');
  window.FONDO_GOLFO = V;
})();

