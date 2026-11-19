'use strict';
// Portales de Fresita: solo dibujo; no toca la física ni los pares de tele.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.cinema) return;
  const V = vestirNivel({ id: 'cinema', carpeta: 'portales-cueva', ver: 4 });
  const { spr } = V;
  // telón: montañas lejanas entre bruma y estalactitas colgando del borde de arriba con parallax, que dan techo de cueva
  V.cielo((c, f, antes) => {
    antes();
    // estrellas que titilan sobre el cielo violeta
    for (let i = 0; i < 64; i++) { const w = VW + 60, x = ((V.h1(i, 11) * w - f.cam * .02) % w + w) % w - 30, y = 6 + V.h1(i, 12) * 120, tw = .5 + .5 * Math.sin(f.t * (1 + V.h1(i, 13) * 2) + i * 3); c.fillStyle = 'rgba(255,238,215,' + ((.25 + .5 * V.h1(i, 14)) * tw).toFixed(2) + ')'; c.fillRect(x, y, V.h1(i, 15) > .85 ? 1.6 : 1, V.h1(i, 15) > .85 ? 1.6 : 1); }
    const u = 400, off = (f.cam * .08) % u, base = Math.floor(f.cam * .08 / u);
    for (let k = -1; k * u - off < VW + u; k++) spr(c, 'f_montanas', k * u - off, 180, { ay: 1, ax: 0, alfa: .35, k: .9 });
    const u2 = 220, o2 = (f.cam * .3) % u2, b2 = Math.floor(f.cam * .3 / u2);
    // copas de la selva en dos capas de silueta, con bruma entre ellas, al pie del horizonte
    for (let capa = 0; capa < 2; capa++) {
      c.fillStyle = capa ? 'rgba(34,20,52,.78)' : 'rgba(58,34,76,.55)'; c.beginPath(); c.moveTo(0, 215);
      const par = capa ? .22 : .12; for (let x = 0; x <= VW + 8; x += 8) { const wx = x + f.cam * par; c.lineTo(x, 176 - capa * 8 - (Math.sin(wx * .045 + capa * 2) * 7 + Math.sin(wx * .11 + capa) * 4 + Math.abs(Math.sin(wx * .019)) * 9)); }
      c.lineTo(VW, 215); c.closePath(); c.fill();
      if (!capa) { const mg = c.createLinearGradient(0, 150, 0, 195); mg.addColorStop(0, 'rgba(150,100,180,0)'); mg.addColorStop(1, 'rgba(150,100,180,.22)'); c.fillStyle = mg; c.fillRect(0, 150, VW, 50); }
    }
    // cocuyos: luciérnagas de luz verde-dorada que flotan, se apagan y se prenden
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) { const w = VW + 40, x = ((V.h1(i, 31) * w - f.cam * (.25 + V.h1(i, 32) * .25) + Math.sin(f.t * .7 + i) * 14) % w + w) % w - 20, y = 120 + V.h1(i, 33) * 70 + Math.sin(f.t * .9 + i * 1.7) * 9, a = Math.max(0, Math.sin(f.t * 1.6 + i * 2.1)); glowDot(c, x, y, 1.4 + a * 1.8, V.h1(i, 34) > .5 ? '#c8ff7a' : '#ffe27a', .95 * a); }
    c.restore();
    for (let k = -1; k * u2 - o2 < VW + u2; k++) { const i = b2 + k; c.save(); c.globalAlpha = .75; spr(c, 'f_estalac' + Math.floor(V.h1(i, 3) * 5), k * u2 - o2 + V.h1(i, 4) * 40, -2, { ay: 0 }); c.restore(); }
  });
  let piedra = null;
  V.terreno(ctx => {
    if (V.listo('piedra')) {   // sillares de la lámina bajo el piso y el friso de grecas turquesa sobre cada borde
      if (!piedra) { piedra = ctx.createPattern(V.IMG.piedra, 'repeat'); piedra.setTransform(new DOMMatrix().scale(V.TAM.piedra.w / V.IMG.piedra.naturalWidth)); }
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip(); ctx.globalAlpha = .45; ctx.fillStyle = piedra; ctx.fillRect(0, 0, L.ww, VH + 40); ctx.globalAlpha = 1;
      if (V.listo('friso')) { const w = V.TAM.friso.w; for (const r of L.tops) for (let x = r.x0; x < r.x1; x += w) spr(ctx, 'friso', x, r.y - .5, { ax: 0, ay: 0 }); }
      ctx.restore();
    }
    for (const o of L.deco) {
      const x = o.x, y = o.y + .5, i = o.i, v = V.h1(i, 7);
      if (o.k === 'T') spr(ctx, ['rA', 'rB', 'cristalA', 'rC', 'plantaA', 'rD', 'picos', 'rG', 'rocaGrande'][i % 9], x, y, { voltea: v < .5 && i % 9 > 4 });
      else if (o.k === 'f') spr(ctx, ['planta1', 'plantaB', 'hongos', 'cristalB', 'roca0', 'planta0'][i % 6], x, y, { voltea: v < .5 });
      else if (o.k === 'r') spr(ctx, ['cristal1', 'roca1', 'rE', 'cristal0', 'rF', 'arcoRoca'][i % 6], x, y);
    }
  });
  // Solo se seleccionan poses asociadas a estados reales, sin inventar ciclos.
  V.fd('babosa', (c, e, t, s, antes) => {
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('babosa');
    if (hoja?.complete && hoja.naturalWidth) { antes(c, e, t, s); return; }
    spr(c, 'babosa' + (Math.abs(e.vy || 0) > 1 ? 1 : 0), 0, .5);
  }, 'babosa0');
  V.fd('bestia', (c, e, t, s, antes) => antes(c, e, t, s), 'bestia0');
  V.fd('escorpion', (c, e, t, s, antes) => {
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('escorpion');
    if (hoja?.complete && hoja.naturalWidth) { antes(c, e, t, s); return; }
    spr(c, 'escorpion' + (e.st === 'lunge' ? 1 : 0), 0, .5);
  }, 'escorpion0');
  // El guardia, sus avisos y ambos estados de los teletransportadores se conservan.
  V.moneda('canistel'); V.meta('salida', { dy: 1 });
  window.PORTALES_CUEVA = V;
})();
