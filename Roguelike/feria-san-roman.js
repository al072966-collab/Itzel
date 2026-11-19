'use strict';
// Feria: el torito y los adornos se pintan sin modificar la rueda ni sus góndolas.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.deco) return;
  const V = vestirNivel({ id: 'deco', nivel: 'feria', carpeta: 'feria-san-roman', ver: 2 });
  const { spr } = V;
  V.cielo((c, f, antes) => {
    antes();
    // globos de cantoya: farolillos de papel con una llama adentro que suben despacio, se mecen y brillan
    for (let i = 0; i < 9; i++) {
      const w = VW + 60, ph = (f.t * (.018 + V.h1(i, 41) * .016) + V.h1(i, 42)) % 1, x = ((V.h1(i, 43) * w - f.cam * (.12 + V.h1(i, 44) * .1) + Math.sin(f.t * .8 + i * 2) * 9) % w + w) % w - 30, y = 210 - ph * 230, cs = ['255,150,60', '255,200,90', '255,110,80'][i % 3];
      c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x, y, 16, 'rgb(' + cs + ')', .38 * (.75 + .25 * Math.sin(f.t * 7 + i))); c.restore();
      c.fillStyle = 'rgba(' + cs + ',.92)'; c.beginPath(); c.moveTo(x - 4, y + 5); c.quadraticCurveTo(x - 6, y - 4, x, y - 7); c.quadraticCurveTo(x + 6, y - 4, x + 4, y + 5); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,245,200,.85)'; c.fillRect(x - 1, y + 1, 2, 3);
    }
    // guirnalda de foquitos dorados que cuelga entre los postes, con cada foco titilando
    const ug = 190, offg = (f.cam * .2) % ug, baseg = Math.floor(f.cam * .2 / ug);
    for (let k = -1; k * ug - offg < VW + ug; k++) {
      const i = baseg + k, x0 = k * ug - offg, y0 = 96 + (i % 3) * 6;
      c.strokeStyle = 'rgba(40,30,20,.7)'; c.lineWidth = .6; c.beginPath(); for (let q = 0; q <= 14; q++) { const u = q / 14, x = x0 + u * ug, y = y0 + Math.sin(u * Math.PI) * 12; q ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let q = 1; q < 14; q++) { const u = q / 14, x = x0 + u * ug, y = y0 + Math.sin(u * Math.PI) * 12 + 2, a = .6 + .4 * Math.sin(f.t * 3.2 + q * 1.1 + i); glowDot(c, x, y, 3.6 + a * 1.2, '#ffd37a', .6 * a); c.fillStyle = '#fff2c0'; c.fillRect(x - .8, y - .8, 1.6, 1.6); }
      c.restore();
    }
    const u = 330, off = (f.cam * .1) % u, base = Math.floor(f.cam * .1 / u);
    for (let k = -1; k * u - off < VW + u; k++) { const i = base + k; spr(c, ['f_iglesia', 'f_arcadas', 'f_casaRoja'][Math.floor(V.h1(i, 3) * 3)], k * u - off + V.h1(i, 5) * 60, 178, { ay: 1, alfa: .5, k: 1.1 }); }
    const u2 = 210, o2 = (f.cam * .2) % u2, b2 = Math.floor(f.cam * .2 / u2);
    for (let k = -1; k * u2 - o2 < VW + u2; k++) { const i = b2 + k; spr(c, V.h1(i, 4) < .5 ? 'papel' : 'banderines0', k * u2 - o2, 20 + V.h1(i, 6) * 18, { ay: 0, ax: 0, alfa: .85, w: 150 }); }
    c.save(); c.globalCompositeOperation = 'lighter'; const q = Math.floor(f.t / 2.2), ph = (f.t % 2.2) / 2.2;
    spr(c, 'fuegos' + (q % 3), 60 + (q * 97) % 300, 50 + (q * 31) % 40, { ay: .5, alfa: Math.max(0, 1 - ph) * .75, k: .6 + ph * .6 }); c.restore();
  });
  V.terreno(ctx => {
    for (const o of L.deco) {
      const x = o.x + 8, y = o.y + .5, i = o.i, v = V.h1(i, 7);
      if (o.k === 'T') spr(ctx, ['estandarte', 'puestoAlgodon', 'farola', 'maceta', 'puestoLoteria', 'bandera', 'arco', 'florRoja'][i % 8], x, y);
      else if (o.k === 'f') spr(ctx, ['florBlanca', 'banca', 'florRoja', 'cadena', 'maceta'][i % 5], x, y, { voltea: v < .5 });
      else if (o.k === 'r') spr(ctx, ['balaustrada', 'banca', 'cadena', 'florBlanca'][i % 4], x, y);
    }
  });
  V.fd('torito', (c, e, t, s, antes) => {
    // aturdido tras chocar (o dormido): el mismo torito ladeado y con los cohetes apagados, no el armazón viejo
    if (e.st === 'sleep' || e.st === 'stun') return V.dormido(c, 'torito', t, .5, { lado: -.05, vel: 9 });
    const correForge = V.listo('toritoCorre0');
    const n = e.st === 'run' && correForge ? 'toritoCorre' + (Math.floor(((e.anim ?? t) * 60) / 8) % 4) : e.st === 'run' && V.listo('toritoCorre') ? 'toritoCorre' : 'torito';
    spr(c, n, 0, .5);
  }, 'torito');
  V.toritoRunForge = { frames: 4, ticks: 8 };
  window.FERIA_SAN_ROMAN = V;
})();
