'use strict';
// Bandas de la ciudad: acabados nuevos sin alterar el funcionamiento.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.cyber) return;
  const V = vestirNivel({ id: 'cyber', carpeta: 'ciudad-cyber', ver: 1 });
  const { spr, h1 } = V;
  // telón: fachadas coloniales de la ciudad futurista, lejos y con bruma violeta (no compiten con lo jugable)
  V.cielo((c, f, antes) => {
    antes();
    const u = 170, off = (f.cam * .12) % u, base = Math.floor(f.cam * .12 / u);
    const L2 = ['f_casa0', 'f_arcada', 'f_casa1', 'f_casaMuro', 'f_garita'];
    c.save(); c.globalAlpha = .55;
    for (let k = -1; k * u - off < VW + u; k++) { const i = base + k; if (V.h1(i, 2) < .25) continue; spr(c, L2[Math.floor(V.h1(i, 3) * L2.length)], k * u - off + V.h1(i, 5) * 30, 178, { ay: 1 }); }
    c.restore();
    const g = c.createLinearGradient(0, 120, 0, 200); g.addColorStop(0, 'rgba(60,20,110,0)'); g.addColorStop(1, 'rgba(60,20,110,.35)'); c.fillStyle = g; c.fillRect(0, 120, VW, 80);
    // banda magenta del horizonte, como un atardecer de neón detrás de la ciudad
    c.save(); c.globalCompositeOperation = 'lighter';
    const hz = c.createLinearGradient(0, 110, 0, 190); hz.addColorStop(0, 'rgba(255,43,214,0)'); hz.addColorStop(.7, 'rgba(255,43,214,.20)'); hz.addColorStop(1, 'rgba(0,232,255,.10)'); c.fillStyle = hz; c.fillRect(0, 110, VW, 80);
    c.restore();
    // plataformas petroleras de la Sonda en el mar lejano, con luces rojas que parpadean
    const ur = 330, offr = (f.cam * .06) % ur, baser = Math.floor(f.cam * .06 / ur);
    for (let k = -1; k * ur - offr < VW + ur; k++) {
      const i = baser + k, x = k * ur - offr + 40 + h1(i, 31) * 150, y = 186;
      c.save(); c.globalAlpha = .75; c.fillStyle = '#1b1030'; c.strokeStyle = '#1b1030'; c.lineWidth = 1.2;
      c.fillRect(x - 24, y - 20, 48, 5);                                                       // cubierta
      for (const px of [-20, -7, 7, 20]) { c.beginPath(); c.moveTo(x + px, y - 15); c.lineTo(x + px * .85, y); c.stroke(); }
      c.beginPath(); c.moveTo(x - 20, y - 15); c.lineTo(x + 7, y - 2); c.moveTo(x + 20, y - 15); c.lineTo(x - 7, y - 2); c.stroke();
      c.fillRect(x - 12, y - 30, 14, 10); c.beginPath(); c.moveTo(x - 6, y - 30); c.lineTo(x - 2, y - 58); c.lineTo(x + 2, y - 30); c.fill();   // torre de perforación
      c.beginPath(); c.moveTo(x + 6, y - 20); c.lineTo(x + 26, y - 38); c.lineTo(x + 28, y - 36); c.stroke();                             // grúa
      c.restore();
      const blink = (Math.sin(f.t * 3 + i * 2) > .2) ? 1 : .2;
      c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x - 2, y - 58, 6, '#ff3050', .7 * blink); glowDot(c, x + 28, y - 36, 4, '#ff3050', .5 * (2.2 - blink)); glowDot(c, x - 18, y - 21, 4, '#ffd070', .5); c.restore();
      c.save(); c.globalAlpha = .2; c.fillStyle = '#00e8ff'; for (let q = 0; q < 4; q++) c.fillRect(x - 14 + q * 5 + Math.sin(f.t * 2 + q) * 2, y + 6 + q * 4, 12 - q * 2, 1); c.restore();   // reflejo en el agua
    }
  });
  let panel = null;
  V.terreno(ctx => {
    if (V.listo('panel')) {   // placa oscura de la lámina bajo el piso y el filo de neón alternando cian y magenta
      if (!panel) { panel = ctx.createPattern(V.IMG.panel, 'repeat'); panel.setTransform(new DOMMatrix().scale(V.TAM.panel.w / V.IMG.panel.naturalWidth)); }
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip(); ctx.globalAlpha = .35; ctx.fillStyle = panel; ctx.fillRect(0, 0, L.ww, VH + 40); ctx.globalAlpha = 1;
      if (V.listo('neonCian')) { const w = V.TAM.neonCian.w; for (const r of L.tops) for (let x = r.x0, j = 0; x < r.x1; x += w, j++) spr(ctx, (Math.floor(r.x0 / 16) + j) % 2 ? 'neonMagenta' : 'neonCian', x, r.y - .5, { ax: 0, ay: 0 }); }
      ctx.restore();
      // charcos de neón: el filo del piso se refleja hacia abajo en cian y magenta, como en pavimento mojado
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const r of L.tops) for (let x = r.x0 + 6; x < r.x1 - 6; x += 24 + V.h1(x | 0, r.y) * 22) {
        const mg = V.h1(x | 0, 17) > .5, rg = ctx.createLinearGradient(0, r.y, 0, r.y + 16); rg.addColorStop(0, mg ? 'rgba(255,43,214,.32)' : 'rgba(0,232,255,.30)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rg; ctx.fillRect(x, r.y + 1, 9 + V.h1(x | 0, 18) * 14, 16);
        ctx.fillStyle = mg ? 'rgba(255,170,240,.5)' : 'rgba(170,250,255,.5)'; ctx.fillRect(x + 1, r.y + 1.2, 6, .7);
      }
      ctx.restore();
    }
    for (const o of L.deco) {
      const x = o.x, y = o.y + .5, i = o.i, v = V.h1(i, 7);
      if (o.k === 'T') spr(ctx, ['antena', 'farola0', 'poste', 'farola2', 'farol', 'toldo', 'farola1', 'farola3'][i % 8], x, y, { voltea: v < .5 && i % 8 === 1 });
      else if (o.k === 'f') spr(ctx, ['planta', 'flores', 'jardinera', 'maceta', 'banca', 'bolardo0', 'aire', 'bolardo1'][i % 8], x, y);
      else if (o.k === 'r') spr(ctx, ['plato', 'paneles', 'torreAgua', 'muro'][i % 4], x, y);
    }
  });
  // las bandas: la banda de la lámina según hacia dónde lleva; el destello de antes marca el sentido
  V.look('belt', (c, pl, f) => {
    const dir = (pl.v || 50) * (pl.rev > 0 ? -1 : 1);
    spr(c, dir < 0 ? 'bandaIzq' : 'bandaDer', pl.x + pl.w / 2, pl.y - 1, { w: pl.w + 3, ay: 0 });
  }, 'bandaIzq', (c, pl) => { c.fillStyle = '#1a1d2a'; c.fillRect(pl.x, pl.y, pl.w, 7); });
  // FX.dron pinta el aviso y el rayo vertical por separado; el cuerpo Forge
  // solo cambia la silueta, y el cuadro apagado mantiene visible el dron.
  V.fd('dron', (c, e, t, s, antes) => {
    // La hoja dinámica conserva las fases de patrulla, aviso, rayo y apagado.
    antes(c, e, t, s);
  }, 'dron');
  V.fd('rover', (c, e, t, s, antes) => {
    if (e.st === 'glass') {
      // El bloque físico mide 16 × 10: la silueta se recorta a ese espacio
      // y la línea superior marca exactamente la superficie donde se pisa.
      c.save(); c.beginPath(); c.rect(-8, -10, 16, 10); c.clip();
      c.globalAlpha *= .55; spr(c, 'rover', 0, 0); c.restore();
      c.strokeStyle = '#b9faff'; c.lineWidth = .8; c.beginPath(); c.moveTo(-8, -10); c.lineTo(8, -10); c.stroke();
      c.fillStyle = '#8bcbd1'; c.font = 'bold 3px "Alegreya Sans", sans-serif'; c.fillText('Z', 2, -5); return;
    }
    antes(c, e, t, s);
    if (e.embiste) { c.save(); c.strokeStyle = '#ff2a6d'; c.lineWidth = .8; c.beginPath(); c.arc(0, -6, 8.5, -.9, .9); c.stroke(); c.restore(); }
  }, 'rover');
  V.fd('murcielago', (c, e, t, s, antes) => {
    if (e.st !== 'ok') return antes(c, e, t, s);
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('murcielago');
    if (hoja?.complete && hoja.naturalWidth) {
      c.save(); c.filter = 'hue-rotate(32deg) saturate(1.35)'; c.rotate(Math.sin((e.anim || t) * 5) * .05);
      antes(c, e, t, s); c.restore(); return;
    }
    c.save(); c.rotate(Math.sin((e.anim || t) * 5) * .05); spr(c, 'murcielago', 0, 1); c.restore();
  }, 'murcielago');
  V.fd('avispa', (c, e, t, s, antes) => {
    if (e.st !== 'ok') return antes(c, e, t, s);
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('avispa');
    if (hoja?.complete && hoja.naturalWidth) return antes(c, e, t, s);
    spr(c, 'avispa', 0, 1);
  }, 'avispa');
  V.moneda('canistel'); V.corazon('corazon'); V.meta('salida', { dy: 1 });
  window.CIUDAD_CYBER = V;
})();
