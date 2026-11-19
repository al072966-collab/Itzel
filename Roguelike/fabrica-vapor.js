'use strict';
// Fábrica de vapor: telón por código y piezas puntuales, solo para vapor base.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.vapor) return;
  const V = vestirNivel({ id: 'vapor', carpeta: 'fabrica-vapor', ver: 1 });
  const { spr } = V;
  V.cielo((c, f) => {
    const grad = c.createLinearGradient(0, 0, 0, VH);
    grad.addColorStop(0, '#25151e'); grad.addColorStop(.5, '#643322'); grad.addColorStop(1, '#d48648');
    c.fillStyle = grad; c.fillRect(0, 0, VW, VH);
    // Las siluetas y chimeneas son telón, no representan plataformas.
    for (let capa = 0; capa < 2; capa++) {
      const ancho = capa ? 112 : 160, par = capa ? .22 : .08;
      const off = ((f.cam * par) % ancho + ancho) % ancho;
      c.fillStyle = capa ? '#35211e' : '#70402e';
      for (let x = -ancho - off, i = 0; x < VW + ancho; x += ancho, i++) {
        const base = capa ? 186 : 171, h = (capa ? 43 : 58) + (i % 3) * 7;
        c.fillRect(x, base - h, ancho * .78, h + 40);
        c.beginPath(); c.moveTo(x, base - h); c.lineTo(x + ancho * .2, base - h - 12); c.lineTo(x + ancho * .4, base - h); c.fill();
        c.fillRect(x + ancho * .54, base - h - 28, 9, 30);
        c.fillStyle = capa ? 'rgba(239,151,73,.24)' : 'rgba(255,204,130,.25)';
        for (let j = 0; j < 4; j++) { const wx = x + 9 + j * ancho * .15, wy = base - h + 15; c.fillRect(wx, wy, 5, 12); c.beginPath(); c.arc(wx + 2.5, wy, 2.5, Math.PI, 0); c.fill(); }
        c.fillStyle = capa ? '#35211e' : '#70402e';
      }
    }
    // Tubos quebrados y engranes tenues, sin líneas largas que parezcan piso.
    c.save(); c.globalAlpha = .28; c.strokeStyle = '#d28b50'; c.lineWidth = 2.2; c.lineJoin = 'round';
    const off = ((f.cam * .16) % 118 + 118) % 118;
    for (let x = -off - 25; x < VW + 100; x += 118) {
      c.beginPath(); c.moveTo(x, 158); c.lineTo(x, 94); c.quadraticCurveTo(x, 87, x + 7, 87); c.lineTo(x + 45, 87); c.quadraticCurveTo(x + 52, 87, x + 52, 80); c.lineTo(x + 52, 70); c.stroke();
      c.beginPath(); c.arc(x, 117, 5, 0, Math.PI * 2); c.moveTo(x - 5, 117); c.lineTo(x + 5, 117); c.moveTo(x, 112); c.lineTo(x, 122); c.stroke();
      const gx = x + 82, gy = 56, r = 13; c.lineWidth = .7;
      c.beginPath(); c.arc(gx, gy, r, 0, Math.PI * 2); c.arc(gx, gy, r * .7, 0, Math.PI * 2); c.arc(gx, gy, 2, 0, Math.PI * 2); c.stroke();
      for (let j = 0; j < 8; j++) { const a = j * Math.PI / 4 + f.t * .1; c.beginPath(); c.moveTo(gx + Math.cos(a) * 3, gy + Math.sin(a) * 3); c.lineTo(gx + Math.cos(a) * r * .68, gy + Math.sin(a) * r * .68); c.stroke(); }
      c.lineWidth = 2.2;
    }
    c.restore();
    const humo = (f.t * 7) % 34;
    c.fillStyle = 'rgba(225,171,130,.10)'; for (let i = 0; i < 8; i++) { const x = ((i * 79 - f.cam * .08) % (VW + 40) + VW + 40) % (VW + 40) - 20, y = 64 - (humo + i * 11) % 48; c.beginPath(); c.arc(x, y, 5 + (i % 3) * 2, 0, Math.PI * 2); c.fill(); }
  });
  // capa media: siluetas de la fábrica lejana (de la lámina) con bruma de cobre, bajo las chimeneas y tuberías del telón
  V.cielo((c, f, antes) => {
    antes();
    const unit = 260, off = (f.cam * .12) % unit, base = Math.floor(f.cam * .12 / unit);
    for (let k = -1; k * unit - off < VW + unit; k++) {
      const i = base + k, n = ['f_fabrica', 'f_chimenea0', 'f_caldera3'][Math.floor(V.h1(i, 3) * 3)];
      spr(c, n, k * unit - off + V.h1(i, 5) * 90, 176, { ay: 1, alfa: n === 'f_fabrica' ? .5 : .42 });
    }
    const g = c.createLinearGradient(0, 120, 0, 200); g.addColorStop(0, 'rgba(212,134,72,0)'); g.addColorStop(1, 'rgba(212,134,72,.22)'); c.fillStyle = g; c.fillRect(0, 120, VW, 80);
    // resplandor de horno a ras del horizonte (late despacio) y haces de luz naranja que bajan de las ventanas altas
    c.save(); c.globalCompositeOperation = 'lighter';
    const pul = .85 + .15 * Math.sin(f.t * 1.7), hg = c.createRadialGradient(VW * .5, 205, 8, VW * .5, 205, 260); hg.addColorStop(0, 'rgba(255,150,60,' + (.30 * pul).toFixed(3) + ')'); hg.addColorStop(1, 'rgba(255,150,60,0)'); c.fillStyle = hg; c.fillRect(0, 60, VW, 180);
    for (let k = 0; k < 4; k++) { const x = ((k * 143 - f.cam * .07) % (VW + 160) + VW + 160) % (VW + 160) - 80, w0 = 7 + (k % 2) * 4; const lg = c.createLinearGradient(x, 0, x + 60, 190); lg.addColorStop(0, 'rgba(255,196,120,.13)'); lg.addColorStop(1, 'rgba(255,196,120,0)'); c.fillStyle = lg; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + w0, 0); c.lineTo(x + 68 + w0, 190); c.lineTo(x + 44, 190); c.closePath(); c.fill(); }
    c.restore();
    // chimeneas con su humo: volutas que suben, crecen, se aclaran y se van con el viento
    const uc = 250, offc = (f.cam * .12) % uc, basec = Math.floor(f.cam * .12 / uc);
    for (let k = -1; k * uc - offc < VW + uc; k++) {
      const i = basec + k, cx0 = k * uc - offc + 60 + V.h1(i, 41) * 120; if (V.h1(i, 42) < .25) continue;
      c.fillStyle = 'rgba(60,34,28,.9)'; c.fillRect(cx0 - 5, 104, 10, 74); c.fillStyle = 'rgba(90,52,38,.9)'; c.fillRect(cx0 - 7, 100, 14, 6);
      c.fillStyle = 'rgba(255,150,70,.5)'; c.fillRect(cx0 - 4, 101, 8, 1.4);
      for (let q = 0; q < 9; q++) { const ph = ((f.t * .22 + q / 9 + V.h1(i, 43)) % 1), px = cx0 + Math.sin(ph * 6 + i) * 4 + ph * 34, py = 98 - ph * 78, r = 3 + ph * 9; c.fillStyle = 'rgba(' + (70 + ph * 70 | 0) + ',' + (50 + ph * 55 | 0) + ',' + (48 + ph * 48 | 0) + ',' + (.5 * (1 - ph)).toFixed(3) + ')'; c.beginPath(); c.arc(px, py, r, 0, 6.2832); c.fill(); }
    }
    // chorros de vapor que sueltan las tuberías del fondo, a intervalos
    const us = 170, offs = (f.cam * .16) % us, bases = Math.floor(f.cam * .16 / us);
    for (let k = -1; k * us - offs < VW + us; k++) {
      const i = bases + k, sx = k * us - offs + 40 + V.h1(i, 51) * 90, ph = ((f.t * .35 + V.h1(i, 52) * 3) % 3); if (ph > 1) continue;
      for (let q = 0; q < 6; q++) { const u2 = ph * .9 + q * .05, px = sx + u2 * 26 * (q % 2 ? 1 : .7), py = 132 - u2 * 48 - q * 2; c.fillStyle = 'rgba(235,215,195,' + (.30 * (1 - ph)).toFixed(3) + ')'; c.beginPath(); c.arc(px, py, 2.2 + u2 * 6, 0, 6.2832); c.fill(); }
    }
    // brasas que se levantan de los hornos y se apagan arriba
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 46; i++) {
      const w = VW + 40, ph = (f.t * (.06 + V.h1(i, 61) * .08) + V.h1(i, 62)) % 1, x = ((V.h1(i, 63) * w - f.cam * (.2 + V.h1(i, 64) * .2) + Math.sin(f.t * 1.3 + i) * 6) % w + w) % w - 20, y = 215 - ph * 205;
      c.fillStyle = 'rgba(255,' + (150 + V.h1(i, 65) * 70 | 0) + ',70,' + (.85 * (1 - ph) * (.6 + .4 * Math.sin(f.t * 9 + i))).toFixed(3) + ')'; c.fillRect(x, y, 1.2, 1.2);
    }
    c.restore();
  });
  let patron = null;
  V.terreno(ctx => {
    if (V.listo('placa')) {   // placa remachada sobre el terreno de antes; el borde de losa sobre cada piso que se pisa
      if (!patron) { patron = ctx.createPattern(V.IMG.placa, 'repeat'); patron.setTransform(new DOMMatrix().scale(V.TAM.placa.w / V.IMG.placa.naturalWidth)); }
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip(); ctx.globalAlpha = .12; ctx.fillStyle = patron; ctx.fillRect(0, 0, L.ww, VH + 40);
      const g = ctx.createLinearGradient(0, 130, 0, VH + 20); g.addColorStop(0, 'rgba(30,12,10,0)'); g.addColorStop(1, 'rgba(30,12,10,.7)'); ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 120, L.ww, VH);
      if (V.listo('losaBorde')) { const w = V.TAM.losaBorde.w; for (const r of L.tops) for (let x = r.x0; x < r.x1; x += w) spr(ctx, 'losaBorde', x, r.y - .5, { ax: 0, ay: 0 }); }
      ctx.restore();
    }
    for (const o of L.deco) {
      const x = o.x, y = o.y + .5, v = V.h1(o.i, 7);
      if (o.k === 'T') spr(ctx, o.i % 3 === 2 ? (o.i % 2 ? 'manometro' : 'reloj') : 'caldera' + (o.i % 6), x, y, { k: 1.15, voltea: v < .5 && o.i % 3 !== 2 });
      else if (o.k === 'r') spr(ctx, 'maquina' + (o.i % 4), x, y, { k: 1.25, voltea: v < .5 });
      else if (o.k === 'f') spr(ctx, ['lampara', 'chimenea1', 'chimenea2'][o.i % 3], x, y);
    }
  });
  // plataformas de engrane: el engrane que gira de antes, con la cubierta de truss remachado de la lámina
  V.look('engrane', (c, pl, f, sk, antes) => {
    antes.call(this, c, pl, f, sk);                         // el engrane que gira (y la viga de antes) se quedan
    spr(c, 'truss', pl.x + pl.w / 2, pl.y - 1, { w: pl.w + 2, ay: 0 });   // y encima la cubierta de truss de la lámina
  }, 'truss');
  V.fd('calderita', (c, e, t, s, antes) => {
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('calderita');
    if (e.st === 'sleep' || ((e.flota || e.avisa || e.resopla) && hoja?.complete && hoja.naturalWidth)) return antes(c, e, t, s);
    const n = e.flota ? 4 : e.avisa ? 3 : [0, 1, 2, 1][Math.floor((e.anim || t) * 4) % 4];
    const temblor = e.avisa ? Math.sin(t * 35) * .5 : 0;
    spr(c, 'calderita' + n, temblor, .5);
  }, 'calderita0');
  V.fd('pajaro', (c, e, t) => spr(c, 'pajaro' + [0, 1, 2, 3, 2, 1][Math.floor((e.anim || t) * 7) % 6], 0, 1), 'pajaro0');
  // El chorro de la calderita, válvulas, rejillas y grúas siguen dibujándose
  // con los estados y anclajes originales de la mecánica.
  V.moneda('canistel'); V.corazon('corazon');
  window.FABRICA_VAPOR = V;
})();
