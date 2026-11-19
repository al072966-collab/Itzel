'use strict';
// El desfile comparte el estilo neón, pero conserva sus propias mecánicas.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.neon) return;
  const V = vestirNivel({ id: 'neon', nivel: 'carnaval', carpeta: 'carnaval', ver: 1 });
  const { spr } = V;
  // telón: carros alegóricos lejanos con bruma magenta y papel picado de neón colgando; el telón de neón de antes sigue debajo
  V.cielo((c, f, antes) => {
    antes();
    // reflectores de neón que barren el cielo: dos haces que giran en sentidos opuestos desde el suelo
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const [bx, col, sg] of [[70, '255,43,214', 1], [VW - 70, '0,232,255', -1]]) {
      const ang = -Math.PI / 2 + Math.sin(f.t * .6 * sg + bx) * .55, L2 = 210;
      const g = c.createLinearGradient(bx, 200, bx + Math.cos(ang) * L2, 200 + Math.sin(ang) * L2); g.addColorStop(0, 'rgba(' + col + ',.30)'); g.addColorStop(1, 'rgba(' + col + ',0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(bx - 3, 200); c.lineTo(bx + 3, 200); c.lineTo(bx + Math.cos(ang) * L2 + Math.cos(ang + 1.57) * 22, 200 + Math.sin(ang) * L2 + Math.sin(ang + 1.57) * 22); c.lineTo(bx + Math.cos(ang) * L2 - Math.cos(ang + 1.57) * 22, 200 + Math.sin(ang) * L2 - Math.sin(ang + 1.57) * 22); c.closePath(); c.fill();
    }
    c.restore();
    // fuegos artificiales: estallidos de rayitas de neón que se abren, caen y se apagan
    const CF = ['255,43,214', '0,232,255', '255,210,60', '120,255,140'];
    for (let q = 0; q < 3; q++) {
      const per = 3.2, tt = (f.t + q * 1.1) % per, n = Math.floor((f.t + q * 1.1) / per), ph = tt / 1.6; if (ph > 1) continue;
      const cx0 = 60 + V.h1(n * 3 + q, 11) * (VW - 120), cy0 = 30 + V.h1(n * 3 + q, 12) * 55, col = CF[(n + q) % 4], rr = 8 + ph * 34;
      c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(' + col + ',' + (.9 * (1 - ph)).toFixed(2) + ')'; c.lineWidth = 1;
      for (let a = 0; a < 16; a++) { const an = a / 16 * 6.2832, r0 = rr * .6, gy = ph * ph * 16; c.beginPath(); c.moveTo(cx0 + Math.cos(an) * r0, cy0 + Math.sin(an) * r0 + gy); c.lineTo(cx0 + Math.cos(an) * rr, cy0 + Math.sin(an) * rr + gy); c.stroke(); }
      glowDot(c, cx0, cy0, rr * .9, 'rgb(' + col + ')', .16 * (1 - ph)); c.restore();
    }
    // confeti de papel que cae girando, en colores de carnaval
    for (let i = 0; i < 70; i++) {
      const w = VW + 40, ph = (f.t * (.06 + V.h1(i, 21) * .08) + V.h1(i, 22)) % 1, x = ((V.h1(i, 23) * w - f.cam * (.15 + V.h1(i, 24) * .2) + Math.sin(f.t * 1.5 + i) * 10) % w + w) % w - 20, y = -6 + ph * 230;
      c.save(); c.translate(x, y); c.rotate(f.t * 3 + i * 1.7); c.scale(Math.abs(Math.sin(f.t * 4 + i)) * .8 + .2, 1); c.fillStyle = ['#ff2bd6', '#00e8ff', '#ffd23a', '#7dff7a', '#ffffff'][i % 5]; c.globalAlpha = .75; c.fillRect(-1.4, -1, 2.8, 2); c.restore();
    }
    const u = 250, off = (f.cam * .12) % u, base = Math.floor(f.cam * .12 / u);
    c.save(); c.globalAlpha = .4;
    for (let k = -1; k * u - off < VW + u; k++) { const i = base + k; spr(c, 'carro' + Math.floor(V.h1(i, 3) * 3), k * u - off + V.h1(i, 5) * 40, 178, { ay: 1, k: 1.1 }); }
    c.restore();
    const u2 = 190, o2 = (f.cam * .22) % u2, b2 = Math.floor(f.cam * .22 / u2);
    for (let k = -1; k * u2 - o2 < VW + u2; k++) { const i = b2 + k; spr(c, 'papel' + Math.floor(V.h1(i, 4) * 5), k * u2 - o2, 4 + V.h1(i, 6) * 8 + Math.sin(f.t + i) * .6, { ay: 0, ax: 0, alfa: .6, w: 56 }); }
  });
  V.terreno(ctx => {
    for (const o of L.deco) {
      const x = o.x + 8, y = o.y + .5, i = o.i, v = V.h1(i, 7);
      if (o.k === 'T') {
        ctx.save(); ctx.shadowColor = '#ff2bd6'; ctx.shadowBlur = 3; spr(ctx, i % 3 ? 'bocina' : 'bocina2', x, y); ctx.restore();
        if (i % 2 === 0) spr(ctx, ['mascara', 'mascara1', 'mascara2', 'mascara3', 'mascara4'][(i / 2) % 5 | 0], x, y - 22, { h: 13 });
      } else if (o.k === 'f') spr(ctx, ['globos0', 'globos1', 'globos2', 'farol0', 'farol1', 'canon0'][i % 6], x, y, { voltea: v < .5 });
      else if (o.k === 'r') spr(ctx, ['reflector0', 'reflector1', 'canon1', 'globos1'][i % 4], x, y);
    }
  });
  V.fd('pintador', (c, e, t, s, antes) => {
    // mareada o dormida: la misma pintadora, ladeada y apagada (antes salía el robot viejo)
    if (e.st === 'sleep' || e.st === 'stun' || (e.aturde || 0) > 0) return V.dormido(c, 'pintador', t);
    const assets = window.ENEMIGOS_ASSETS, hoja = assets?.hojaForge('pintadorCarnaval');
    if (hoja?.complete && hoja.naturalWidth >= 512 && e.st !== 'gone') return assets.pinta(c, e, t, 'pintadorCarnaval', assets.recurso('pintadorCarnaval'));
    const n = e.lanza > 0 && V.listo('pintadorLanza') ? 'pintadorLanza' : 'pintador';
    c.save(); c.shadowColor = '#00e8ff'; c.shadowBlur = 2; spr(c, n, 0, .5); c.restore();
  }, 'pintador');
  V.fd('iguana', (c, e, t, s, antes) => {
    // mareada: la misma iguana, aplastada y ladeada (antes salía la silueta vieja)
    if (e.st === 'sleep') return V.dormido(c, 'iguana', t, .5, { lado: 0, vel: 6 });
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('iguana');
    if (hoja?.complete && hoja.naturalWidth) {
      c.save(); c.shadowColor = '#ff2bd6'; c.shadowBlur = 2; antes(c, e, t, s); c.restore(); return;
    }
    const n = Math.abs(e.vx || 0) > 35 && V.listo('iguanaCorre') ? 'iguanaCorre' : 'iguana';
    c.save(); c.shadowColor = '#ff2bd6'; c.shadowBlur = 2; spr(c, n, 0, .5); c.restore();
  }, 'iguana');
  window.CARNAVAL_ASSETS = V;
})();
