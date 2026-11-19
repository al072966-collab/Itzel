'use strict';
// Adornos nevados: las superficies, el viento y el mar conservan su dibujo y física.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.hielo) return;
  const V = vestirNivel({ id: 'hielo', carpeta: 'nevo-campeche', ver: 1 });
  const { spr } = V;
  // el telón de papel recortado se conserva tal cual (mis casas lo repetían y chocaban con su estilo)
  // Isla Aguada: un delfín de papel recortado salta cada pocos segundos sobre el mar lejano (el telón de papel de antes se queda)
  function delfin(c, x, y, ang, k) {
    c.save(); c.translate(x, y); c.rotate(ang); c.scale(k, k);
    c.fillStyle = '#7ea5c8'; c.strokeStyle = '#f3f8ff'; c.lineWidth = .7; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(-9, 0); c.quadraticCurveTo(-3, -5, 5, -2.5); c.lineTo(11, -2); c.lineTo(5, -.3); c.quadraticCurveTo(-2, 3.5, -9, 1); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-9, 0); c.lineTo(-13, -3.5); c.lineTo(-12, 0); c.lineTo(-13, 3.5); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-2, -3.8); c.lineTo(-1, -7.5); c.lineTo(2, -3.2); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#f3f8ff'; c.beginPath(); c.arc(5.5, -1.3, .5, 0, 6.3); c.fill(); c.restore();
  }
  V.cielo((c, f, antes) => {
    antes();
    // nubes grandes de papel recortado que cruzan rápido empujadas por el norte (dos capas, la lejana más lenta)
    for (let capa = 0; capa < 2; capa++) {
      const u = capa ? 300 : 420, vel = capa ? 14 : 8, off = ((f.t * vel + f.cam * (capa ? .12 : .05)) % u + u) % u;
      for (let k = -1; k * u + u - off < VW + u; k++) {
        const i = Math.floor((f.t * vel + f.cam * (capa ? .12 : .05)) / u) - k, x = VW - (k * u + u - off) + 0, y = (capa ? 36 : 58) + V.h1(i + capa * 9, 5) * 28;
        c.fillStyle = capa ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(x, y, 12, 0, 6.2832); c.arc(x + 14, y - 5, 15, 0, 6.2832); c.arc(x + 30, y, 12, 0, 6.2832); c.rect(x, y, 30, 12); c.fill();
        c.fillStyle = 'rgba(160,190,225,.25)'; c.fillRect(x - 2, y + 9, 36, 3);
      }
    }
    // olas de papel recortado en el mar de atrás: semicírculos que suben y bajan
    c.fillStyle = 'rgba(120,170,215,.55)'; c.fillRect(0, 194, VW, 30);
    for (let r = 0; r < 3; r++) { c.fillStyle = r % 2 ? 'rgba(150,195,235,.7)' : 'rgba(95,150,200,.7)'; for (let x = -12; x < VW + 12; x += 12) { const wx = x - ((f.cam * (.1 + r * .06) + f.t * (4 + r * 2)) % 12); c.beginPath(); c.arc(wx + 6, 196 + r * 6 + Math.sin(f.t * 1.5 + x * .05 + r) * 1.2, 6, Math.PI, 0); c.fill(); } }
    // ráfagas de viento: rayitas blancas que cruzan en diagonal, muy rápidas
    c.save(); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = .7; c.lineCap = 'round';
    for (let i = 0; i < 16; i++) { const ph = (f.t * (.45 + V.h1(i, 61) * .5) + V.h1(i, 62)) % 1, x = VW + 30 - ph * (VW + 90), y = 20 + V.h1(i, 63) * 160 + ph * 18, len = 14 + V.h1(i, 64) * 22; c.globalAlpha = Math.sin(ph * Math.PI) * .8; c.beginPath(); c.moveTo(x, y); c.lineTo(x + len, y - len * .22); c.stroke(); }
    c.restore();
    const T0 = 6.5, n = Math.floor(f.t / T0), ph = (f.t % T0) / 2.2;
    if (ph < 1) {
      const x0 = 60 + ((n * 137) % 260), a = ph * Math.PI, x = x0 + ph * 70, y = 128 - Math.sin(a) * 40, ang = -Math.cos(a) * .9;
      c.save(); c.globalAlpha = .85; delfin(c, x, y, ang, 1.15); c.restore();
    }
  });
  V.terreno(ctx => {
    if (V.listo('nieve')) {   // capa de nieve con carámbanos sobre cada borde que se pisa
      const w = V.TAM.nieve.w;
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip();
      for (const r of L.tops) for (let x = r.x0; x < r.x1; x += w) spr(ctx, 'nieve', x, r.y - 1.2, { ax: 0, ay: 0 });
      ctx.restore();
    }
    for (const o of L.deco) {
      const x = o.x + 8, y = o.y + .5, i = o.i, v = V.h1(i, 7);
      if (o.k === 'T') spr(ctx, ['farol', 'palma0', 'farol1', 'maceta', 'palma1', 'farol2', 'macetaRosa'][i % 7], x, y);
      else if (o.k === 'f') spr(ctx, ['banca', 'canon', 'barril', 'caja', 'bolardo'][i % 5], x, y, { voltea: v < .5 });
      else if (o.k === 'r') spr(ctx, ['barril', 'caja', 'banca', 'bolardo', 'almenas'][i % 5], x, y);
    }
  });
  V.fd('foca', (c, e, t, s, antes) => {
    if (e.st === 'sleep') return V.dormido(c, 'foca', t, 2);   // dormido: la misma pieza (no el dibujo viejo)
    antes(c, e, t, s);
  }, 'foca');
  V.fd('muneco', (c, e, t, s, antes) => {
    if (e.st === 'sleep') return V.dormido(c, 'muneco', t);   // dormido: la misma pieza (no el dibujo viejo)
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('muneco');
    if (hoja?.complete && hoja.naturalWidth) antes(c, e, t, s);
    else spr(c, 'muneco', 0, .5);
    if (e.carga) { c.fillStyle = '#fff'; c.strokeStyle = '#7596b5'; c.lineWidth = .45; c.beginPath(); c.arc(5.8, -9, 1.8, 0, Math.PI * 2); c.fill(); c.stroke(); }
  }, 'muneco');
  V.moneda('canistel'); V.corazon('corazon');
  window.NEVO_CAMPECHE = V;
})();
