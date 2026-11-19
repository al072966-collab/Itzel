'use strict';
// =====================================================================
//  MECÁNICAS RESCATADAS
//  Cuando un mundo cambia de género (el Jardín de los ecos ahora es 2.5D),
//  sus piezas de plataformas no se tiran: se rediseñan para otro mundo
//  plataformero y viven ahí como nivel alterno (NIVELES_ALT).
//
//  · Jardín de los ecos → Talla de madera: «La imprenta de estampas».
//    El eco de Itzel ahora es una estampa (un grabado de ella en papel),
//    los círculos son prensas de madera, los puentes de luz son pliegos
//    que se desenrollan, las losas flotantes son tacos de madera colgados
//    de un husillo y el erizo de musgo es un erizo de linóleo.
// =====================================================================
(function () {
  const { LOOK, PK, BEH, OBJ, POW, FOE, FD, walkStep, ring, freeOf, tx } = MEC;
  const TINTA = '#1f1a1c', PAPEL = '#efe5cf', ROJO = '#b3342b';
  const estampaDe = g => (g.objs || []).find(o => o.k === 'estampa');

  // ---------- taco de madera: sube con el husillo de la prensa mientras lo pisas ----------
  PK.taco = (pl, g, d, dt) => { PK.rise(pl, g, d, dt); pl.vuelta = (pl.vuelta || 0) + (pl.y - (pl.yAnt ?? pl.y)) * .4; pl.yAnt = pl.y; };
  LOOK.taco = (c, pl, f, sk) => {
    const x = pl.x, y = pl.y, w = pl.w, h = 9, cx = x + w / 2;
    // husillo: barra roscada que baja del travesaño
    c.fillStyle = TINTA; c.fillRect(cx - 1.5, y - 70, 3, 70);
    c.strokeStyle = PAPEL; c.lineWidth = .5; c.beginPath();
    for (let k = y - 68 + wrap(pl.vuelta || 0, 4); k < y - 2; k += 4) { c.moveTo(cx - 1.5, k); c.lineTo(cx + 1.5, k + 1.6); }
    c.stroke();
    c.fillStyle = TINTA; c.fillRect(cx - 7, y - 4, 14, 3); c.beginPath(); c.arc(cx, y - 70, 3, 0, TAU); c.fill();
    // el taco: cara superior entintada con la talla, frente con rayado de gubia
    c.fillStyle = TINTA; c.fillRect(x, y, w, h);
    c.fillStyle = PAPEL; c.fillRect(x + .8, y + 3, w - 1.6, h - 3.8);
    c.strokeStyle = TINTA; c.lineWidth = .55; c.beginPath();
    for (let k = x + 2; k < x + w - 1; k += 2.2) { c.moveTo(k, y + 3.4); c.lineTo(k + 2.4, y + h - 1.2); }
    c.stroke();
    c.strokeStyle = PAPEL; c.lineWidth = .6; c.beginPath();
    for (let k = x + 3; k < x + w - 2; k += 5) { c.moveTo(k, y + 1.5); c.quadraticCurveTo(k + 1.2, y + .4, k + 2.5, y + 1.5); }
    c.stroke();
    // gota de tinta roja que escurre cuando sube
    const u = clamp((pl.y0 - y) / (pl.depth || 64), 0, 1);
    if (u > .05) { c.fillStyle = ROJO; c.fillRect(x + w * .7, y + h, 1.2, 1 + u * 5); c.beginPath(); c.arc(x + w * .7 + .6, y + h + 1 + u * 5, 1, 0, TAU); c.fill(); }
  };

  // ---------- prensa: un bloque de madera en el piso; mientras alguien lo pisa, su pliego se desenrolla ----------
  OBJ.prensa = {
    make(g, en) { g.objs.push({ k: 'prensa', x: tx(en.x) + 8, y: L.surfaceY(en.x + PAD, en.y ?? 0) * T, grp: en.grp, n: en.n || ['I', 'II', 'III', 'IV'][en.grp] || '', on: false, a: 0 }); },
    step(o, g, dt) {
      const p = g.p, e = estampaDe(g);
      const sobre = q => q && Math.abs(q.x - o.x) < 10 && Math.abs(q.y - o.y) < 3;
      o.on = (sobre(p) && p.on) || sobre(e);
      o.a += ((o.on ? 1 : 0) - o.a) * Math.min(1, dt * 7);
      for (const s of g.solids) if (s.k === 'pliego' && s.grp === o.grp) { if (o.on && !s.on && !freeOf(g, s.x, s.y, s.w, s.h)) continue; s.on = o.on; }
    },
    draw(c, o, f) {
      const x = o.x, y = o.y, b = o.a * 1.6;
      c.fillStyle = TINTA; c.fillRect(x - 10, y - 3 + b, 20, 3 - b + .5);
      c.fillStyle = o.on ? ROJO : PAPEL; c.fillRect(x - 9, y - 2.4 + b, 18, 1.2);
      c.strokeStyle = TINTA; c.lineWidth = .4; c.beginPath(); for (let k = x - 8; k < x + 9; k += 2) { c.moveTo(k, y - 2.4 + b); c.lineTo(k + 1, y - 1.2 + b); } c.stroke();
      // el número romano tallado, en rojo como un sello
      c.fillStyle = ROJO; c.font = 'bold 6px Alegreya, Georgia, serif'; c.textAlign = 'center'; c.fillText(o.n, x, y - 6 - (1 - o.a) * 1.5); c.textAlign = 'left';
      if (o.a > .1) { c.strokeStyle = rgba(ROJO, o.a * .6); c.lineWidth = .6; const k = wrap(f.t, 1) ; c.beginPath(); c.ellipse(x, y, 10 + k * 8, 2 + k * 2, 0, 0, TAU); c.stroke(); }
    },
  };
  // ---------- pliego: tira de papel impreso que sale de un rodillo; apagado solo quedan las marcas de corte ----------
  OBJ.pliego = {
    drawSolid(c, s, f) {
      s.a = (s.a || 0) + ((s.on ? 1 : 0) - (s.a || 0)) * .14;
      const x = s.x, y = s.y, w = s.w, h = Math.min(s.h, 7), ww = w * s.a;
      // marcas de registro en las esquinas (siempre, como guía)
      c.strokeStyle = rgba(TINTA, .55); c.lineWidth = .5; c.beginPath();
      for (const [cx, sx] of [[x, -1], [x + w, 1]]) { c.moveTo(cx, y - 3); c.lineTo(cx, y - 1); c.moveTo(cx + sx * 1, y); c.lineTo(cx + sx * 3, y); c.moveTo(cx, y + h + 1); c.lineTo(cx, y + h + 3); }
      c.stroke();
      c.beginPath(); c.arc(x + w / 2, y + h / 2, 1.8, 0, TAU); c.moveTo(x + w / 2 - 3, y + h / 2); c.lineTo(x + w / 2 + 3, y + h / 2); c.moveTo(x + w / 2, y + h / 2 - 3); c.lineTo(x + w / 2, y + h / 2 + 3); c.stroke();
      if (ww < 1) { drawRodillo(c, x, y, h, f.t); return; }
      // el papel con su grabado: borde negro, greca de rayas y una franja roja
      c.fillStyle = PAPEL; c.fillRect(x, y, ww, h);
      c.fillStyle = TINTA; c.fillRect(x, y, ww, .9); c.fillRect(x, y + h - .9, ww, .9);
      c.save(); c.beginPath(); c.rect(x, y, ww, h); c.clip();
      c.strokeStyle = TINTA; c.lineWidth = .6; c.beginPath();
      for (let k = x + 1; k < x + ww; k += 6) { c.moveTo(k, y + h - 1); c.lineTo(k + 3, y + 1.5); c.lineTo(k + 6, y + h - 1); }
      c.stroke(); c.fillStyle = rgba(ROJO, .85); c.fillRect(x, y + h / 2 - .6, ww, 1.2);
      c.restore();
      c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x + 2, y + h, ww - 2, 1.5);
      drawRodillo(c, x + ww, y, h, f.t);
    },
  };
  function drawRodillo(c, x, y, h, t) {
    c.fillStyle = PAPEL; c.beginPath(); c.arc(x, y + h / 2, h / 2 + 1, 0, TAU); c.fill();
    c.strokeStyle = TINTA; c.lineWidth = .7; c.stroke();
    c.beginPath(); c.arc(x, y + h / 2, h / 2 - 1.2, t * 2, t * 2 + 4); c.stroke();
  }
  // ---------- estampa: Itzel impresa en papel; se queda parada donde la dejas ----------
  OBJ.estampa = {
    step(o) { o.t = (o.t || 0) + 1 / 60; },
    draw(c, o, f) {
      const k = Math.min(1, o.t * 3), sway = Math.sin(f.t * 1.6) * .03;
      c.save(); c.translate(o.x, o.y); c.rotate(sway); c.scale(1, k);
      // la hoja, con una esquina doblada
      c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-7, -21, 15, 21);
      c.fillStyle = PAPEL; c.beginPath(); c.moveTo(-8, 0); c.lineTo(-8, -22); c.lineTo(4, -22); c.lineTo(7, -19); c.lineTo(7, 0); c.closePath(); c.fill();
      c.strokeStyle = TINTA; c.lineWidth = .6; c.stroke();
      c.fillStyle = shade(PAPEL, -.15); c.beginPath(); c.moveTo(4, -22); c.lineTo(4, -19); c.lineTo(7, -19); c.fill();
      // Itzel dos veces: en rojo un poco corrida (mal registro) y encima en tinta negra
      const fig = { x: 0, y: -2, w: 10, h: 14, vx: 0, vy: 0, on: true, face: o.face, run: 0, sq: 0, vis: true, inv: 0 };
      c.save(); c.beginPath(); c.rect(-7.5, -21.5, 14, 21); c.clip();
      if (f.st.player) {
        c.globalAlpha = .55; c.translate(.8, -.5); c.filter = 'grayscale(1) brightness(.6) sepia(1) saturate(8) hue-rotate(-25deg)'; f.st.player(c, fig, f);
        c.translate(-.8, .5); c.globalAlpha = 1; c.filter = 'grayscale(1) contrast(5) brightness(.55)'; f.st.player(c, fig, f); c.filter = 'none';
      }
      c.restore();
      c.fillStyle = ROJO; c.fillRect(3, -4, 3, 3); c.fillStyle = PAPEL; c.fillRect(3.8, -3.2, 1.4, 1.4); // sello
      c.restore();
    },
  };
  POW.estampa = { name: 'Estampa', help: 'Clic: Fresita imprime a Itzel en papel donde está parada; la estampa sigue pisando las prensas aunque ella se vaya.', cd: .4,
    click(g) {
      const p = g.p; if (!p.on || !solidAt(p.x, p.y + 2)) return false;
      g.objs = g.objs.filter(o => o.k !== 'estampa'); g.objs.push({ k: 'estampa', x: p.x, y: p.y, face: p.face, t: 0 });
      ring(g, p.x, p.y - 9, ROJO, 22, .5);
      spawn(g, 10, p.x, p.y - 10, { v: 60, life: .5, s: 1.6, k: 'confetti', cols: [TINTA, ROJO, PAPEL], g: 160 });
      return true;
    } };

  // ---------- erizo de linóleo: el erizo de musgo tallado en linóleo; se da vuelta al chocar con la estampa ----------
  FOE.erizoTinta = { beh: 'erizoTinta', w: 13, h: 9, v: 16, spiky: e => e.curl > .5 };
  BEH.erizoTinta = (e, g, d) => {
    e.cyc = (e.cyc || 0) + d; const want = (e.cyc % 3.2) > 2.1 ? 1 : 0; e.curl = (e.curl || 0) + (want - (e.curl || 0)) * Math.min(1, d * 8);
    if (e.curl > .5) return;
    const s = estampaDe(g); if (s && Math.abs(s.x - (e.x + e.dir * 9)) < 6 && Math.abs(s.y - e.y) < 8) e.dir *= -1;
    walkStep(e, d, e.v);
  };
  FD.erizoTinta = (c, e, t, s) => {
    const k = e.curl || 0, a = Math.sin(e.anim * 10) * (1 - k), cy = -4 - k;
    // cuerpo de tinta con cortes de gubia que salen como púas
    c.fillStyle = TINTA; c.beginPath();
    for (let i = 0; i <= 14; i++) { const an = Math.PI + i / 14 * Math.PI * (1 + k), r = i % 2 ? 6.2 + k : 9 + k * 2.4; c.lineTo(Math.cos(an) * r, cy + Math.sin(an) * r * (.8 + k * .2)); }
    c.closePath(); c.fill();
    c.strokeStyle = PAPEL; c.lineWidth = .7; c.beginPath();
    for (let i = 1; i < 12; i++) { const an = Math.PI + i / 12 * Math.PI * (1 + k); c.moveTo(Math.cos(an) * 2.5, cy + Math.sin(an) * 2); c.lineTo(Math.cos(an) * (6 + k), cy + Math.sin(an) * (5 + k)); }
    c.stroke();
    if (k < .5) {
      c.fillStyle = PAPEL; c.beginPath(); c.moveTo(4, -6); c.quadraticCurveTo(10, -5, 10, -2.6); c.lineTo(4, -1); c.closePath(); c.fill();
      c.strokeStyle = TINTA; c.lineWidth = .5; c.stroke();
      c.fillStyle = ROJO; c.beginPath(); c.arc(10, -2.8, 1, 0, TAU); c.fill();
      c.fillStyle = TINTA; c.beginPath(); c.arc(6.6, -4.3, .7, 0, TAU); c.fill();
      c.fillRect(-4 + a, -1, 1.6, 1.4); c.fillRect(2 - a, -1, 1.6, 1.4);
    } else { c.fillStyle = ROJO; c.beginPath(); c.arc(0, cy, 1.6, 0, TAU); c.fill(); }
    if (e.st === 'sleep') { c.fillStyle = TINTA; c.font = 'bold 5px Alegreya, Georgia, serif'; c.fillText('z', 6, -12 - (t * 4 % 3)); }
  };

  // ---------- el nivel ----------
  const G = NIVELES.grabado;
  nivel('imprenta', {
    nombre: 'La imprenta de estampas', lema: 'Fresita estampa a Itzel en papel: la estampa pisa las prensas para que los pliegos no se enrollen.',
    foe: 'erizoTinta', fauna: ['erizoTinta', 'calavera'], power: 'estampa', plat: { k: 'taco', look: 'taco', depth: 60 }, W: 120,
    skin: Object.assign({}, G.skin, { foe: { main: PAPEL, dark: TINTA, light: PAPEL, accent: ROJO, eye: '#ffffff' } }),
    build(b) {
      b.g(0, 12).P(3).d('T', 6).o('prensa', 10, 0, { grp: 0, n: 'I' });
      b.s('pliego', 13, 11, 6, 1, { grp: 0, on: false }).c(13, 18, 9);
      b.g(19, 34).e(24).e(30).d('f', 21).d('T', 27).c(22, 32, 9);
      b.p(37, 10, 3).p(42, 10, 3).c(37, 44, 3);
      b.g(46, 58, 5).d('T', 49).o('prensa', 56, 0, { grp: 1, n: 'II' }).c(47, 54, 3);
      b.s('pliego', 59, 5, 7, 1, { grp: 1, on: false }).c(59, 65, 3);
      b.g(66, 80, 5).e(72, 5).d('r', 68).d('T', 77).c(67, 79, 3);
      b.g(81, 96).o('prensa', 85, 0, { grp: 2, n: 'III' }).e(91).d('f', 83).h(94, 9);
      b.s('pliego', 97, 11, 7, 1, { grp: 2, on: false }).p(99, 8, 2).c(97, 103, 6);
      b.g(104, 119).e(110).Gl(115).d('T', 107);
    },
  });
  (NIVELES_ALT.grabado = NIVELES_ALT.grabado || []).push('imprenta');
})();
