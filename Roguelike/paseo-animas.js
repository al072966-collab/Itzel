'use strict';
// Paseo: las velas, ánimas y radios de luz conservan su lógica y dibujo.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.bruma) return;
  const V = vestirNivel({ id: 'bruma', nivel: 'animas', carpeta: 'paseo-animas', ver: 1 });
  const { spr } = V;
  // veladoras del camino de ánimas: hileras de velas con llama que titila y su charco de luz cálida, y resplandor naranja bajo la bruma
  V.cielo((c, f, antes) => {
    antes();
    const t = f.t, g = c.createLinearGradient(0, 120, 0, 190); g.addColorStop(0, 'rgba(255,150,60,0)'); g.addColorStop(1, 'rgba(255,150,60,' + (.13 + .03 * Math.sin(t * 1.7)).toFixed(3) + ')'); c.fillStyle = g; c.fillRect(0, 120, VW, 70);
    const u = 26, par = .6, off = (f.cam * par) % u, base = Math.floor(f.cam * par / u);
    for (let k = -1; k * u - off < VW + u; k++) {
      const i = base + k; if (V.h1(i, 61) < .45) continue;
      const x = k * u - off + V.h1(i, 62) * 10, y = 176 - (V.h1(i, 63) * 4 | 0), h = 7 + V.h1(i, 64) * 5, fl = Math.sin(t * 9 + i * 2.3) * .5 + Math.sin(t * 15 + i) * .3;
      c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x, y - h - 2, 20, '#ffa84a', .6 + .12 * fl); glowDot(c, x, y + 1, 14, '#ff9030', .3); c.restore();
      c.fillStyle = '#e8d8b8'; c.fillRect(x - 1.4, y - h, 2.8, h); c.fillStyle = '#c9b48c'; c.fillRect(x - 1.4, y - h, 1, h);
      c.fillStyle = '#ffd98a'; c.beginPath(); c.ellipse(x + fl * .5, y - h - 2.4, 1.3, 2.8 + fl * .6, 0, 0, 6.2832); c.fill(); c.fillStyle = '#fff6d0'; c.fillRect(x - .3 + fl * .3, y - h - 2.4, .6, 1.2);
    }
  });
  // telón: pirámide y ruinas lejanas entre brumas, con papel picado de calaveras colgando; bruma baja que se desliza
  V.cielo((c, f, antes) => {
    antes();
    // humo de copal: volutas grises claras que suben de los braseros del camino, se enroscan y se pierden en la bruma
    const us = 210, offs = (f.cam * .22) % us, bases = Math.floor(f.cam * .22 / us);
    for (let k = -1; k * us - offs < VW + us; k++) {
      const i = bases + k, sx = k * us - offs + 50 + V.h1(i, 31) * 110; if (V.h1(i, 32) < .2) continue;
      for (let q = 0; q < 12; q++) { const ph = (f.t * .16 + q / 12 + V.h1(i, 33)) % 1, px = sx + Math.sin(ph * 7 + i) * (4 + ph * 9) + ph * 10, py = 188 - ph * 130, r = 2 + ph * 7; c.fillStyle = 'rgba(235,235,240,' + (.28 * (1 - ph)).toFixed(3) + ')'; c.beginPath(); c.arc(px, py, r, 0, 6.2832); c.fill(); }
      c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, sx, 188, 9, '#ffb060', .35 + .08 * Math.sin(f.t * 8 + i)); c.restore();
    }
    // pétalos de cempasúchil: naranja intenso, caen balanceándose con el aire; alguno gira de canto
    for (let i = 0; i < 46; i++) {
      const w = VW + 40, ph = (f.t * (.045 + V.h1(i, 41) * .05) + V.h1(i, 42)) % 1, x = ((V.h1(i, 43) * w - f.cam * (.18 + V.h1(i, 44) * .22) + Math.sin(f.t * 1.1 + i * 1.7) * 12) % w + w) % w - 20, y = -6 + ph * 220;
      c.save(); c.translate(x, y); c.rotate(Math.sin(f.t * 2 + i) * 1.2 + i); c.scale(1, .5 + .5 * Math.abs(Math.sin(f.t * 2.5 + i)));
      c.fillStyle = V.h1(i, 45) > .6 ? '#ff8a1a' : '#ffb02e'; c.beginPath(); c.ellipse(0, 0, 2.6, 1.3, 0, 0, 6.2832); c.fill();
      c.fillStyle = 'rgba(255,230,160,.5)'; c.fillRect(-1, -.4, 2, .8); c.restore();
    }
    const u = 300, off = (f.cam * .1) % u, base = Math.floor(f.cam * .1 / u);
    for (let k = -1; k * u - off < VW + u; k++) { const i = base + k; spr(c, V.h1(i, 3) < .5 ? 'f_piramide' : 'f_arcoRuina', k * u - off + V.h1(i, 5) * 60, 178, { ay: 1, alfa: .5, k: 1.2 }); }
    const u2 = 200, o2 = (f.cam * .22) % u2, b2 = Math.floor(f.cam * .22 / u2);
    for (let k = -1; k * u2 - o2 < VW + u2; k++) { const i = b2 + k; spr(c, 'papel' + Math.floor(V.h1(i, 4) * 3), k * u2 - o2 + V.h1(i, 6) * 40, 18 + V.h1(i, 7) * 20 + Math.sin(f.t + i) * .6, { ay: 0, alfa: .8 }); }
    spr(c, 'bruma0', ((-f.t * 5 - f.cam * .3) % 300 + 300) % 300 - 40, 188, { ay: 1, alfa: .5 }); spr(c, 'bruma1', ((-f.t * 4 - f.cam * .35) % 380 + 380) % 380 + 80, 192, { ay: 1, alfa: .4 });
  });
  let piedra = null;
  V.terreno(ctx => {
    if (V.listo('piedra')) {
      if (!piedra) { piedra = ctx.createPattern(V.IMG.piedra, 'repeat'); piedra.setTransform(new DOMMatrix().scale(V.TAM.piedra.w / V.IMG.piedra.naturalWidth)); }
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip(); ctx.globalAlpha = .35; ctx.fillStyle = piedra; ctx.fillRect(0, 0, L.ww, VH + 40); ctx.restore();
    }
    for (const o of L.deco) {
      const x = o.x + 8, y = o.y + .5, i = o.i, v = V.h1(i, 7);
      if (o.k === 'T') spr(ctx, ['altar0', 'portal', 'altar1', 'arcos1', 'altar2', 'casaAzul', 'arcoCempasuchil', 'muroPapel'][i % 8], x, y, { alfa: .95 });
      else if (o.k === 'f') spr(ctx, ['cempasuchil1', 'vela0', 'cempasuchil2', 'farolA', 'buganvilia', 'vela1', 'farolB', 'jazmin', 'farolC', 'hibisco'][i % 10], x, y, { voltea: v < .5 });
      else if (o.k === 'r') spr(ctx, ['altarPiedra', 'canasta', 'ruina', 'incensario', 'pilar0', 'escalera2', 'pilar1', 'palma0'][i % 8], x, y);
    }
  });
  V.fd('alux', (c, e, t, s, antes) => {
    if (e.st === 'sleep') return V.dormido(c, 'alux0', t, .5, { alfa: e.fade ?? 1 });
    antes(c, e, t, s);
  }, 'alux0');
  window.PASEO_ANIMAS = V;
})();
