'use strict';
// =====================================================================
//  MUNDOS AMPLIADOS · LOTE 8 (32 bits, 64 bits)
//  Cuatro actos por mundo; dos enemigos y una pieza que juegan con el
//  poder de Fresita. Los dibujos de los enemigos van en enemigos-mundos.js.
// =====================================================================
(function () {
  const { LOOK, PK, BEH, OBJ, FOE, mkPlat, walkStep, gravity, onGround, ring, tx, tl, freeOf } = MEC;
  const amplia = (id, W, build) => { NIVELES[id].W = W; NIVELES[id].build = build; };
  const tocaItzel = (g, x0, y0, x1, y1) => { const p = g.p; return p.vis && p.x + p.w / 2 > x0 && p.x - p.w / 2 < x1 && p.y > y0 && p.y - p.h < y1; };
  const vuela = (e, tx2, ty2, sp, d) => { const dx = tx2 - e.x, dy = ty2 - e.y, dd = Math.hypot(dx, dy) || 1, k = Math.min(dd, sp * d); e.x += dx / dd * k; e.y += dy / dd * k; if (Math.abs(dx) > 1) e.dir = Math.sign(dx); return dd; };

  // =================================================================
  //  32 BITS · La noche del baluarte (antorchas que revelan losas)
  // =================================================================
  const luzDeAntorcha = (g, x, y, r = 110) => (g.objs || []).some(o => o.k === 'antorcha' && o.lit > 0 && Math.hypot(o.x - x, o.y - 20 - y) < r);
  // fantasma del baluarte: en lo oscuro persigue a Itzel y no se le puede caer encima; a la luz de una antorcha se ve y se aturde
  FOE.fantasma = { beh: 'fantasma', w: 12, h: 14, v: 0, spiky: e => !e.visible, sinSombra: true };
  BEH.fantasma = (e, g, d) => {
    const p = g.p; e.visible = luzDeAntorcha(g, e.x, e.y - 7); e.vis = (e.vis || 0) + ((e.visible ? 1 : 0) - (e.vis || 0)) * Math.min(1, d * 5);
    if (e.visible) { const t2 = (g.objs || []).filter(o => o.k === 'antorcha' && o.lit > 0).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0]; if (t2) vuela(e, e.x + Math.sign(e.x - t2.x || 1) * 20, e.y - 4, 16, d); return; }
    if (Math.abs(p.x - e.x) < 170) vuela(e, p.x, p.y - 6, 30, d); else vuela(e, e.hx, e.hy + Math.sin(e.t * 2) * 6, 30, d);
  };
  // soplo: un remolinito de viento que va a las antorchas encendidas y las apaga
  FOE.soplo = { beh: 'soplo', w: 10, h: 10, v: 0, sinSombra: true };
  BEH.soplo = (e, g, d) => {
    e.cd = Math.max(0, (e.cd || 0) - d); e.sopla = Math.max(0, (e.sopla || 0) - d);
    const an = e.cd > 0 ? null : (g.objs || []).filter(o => o.k === 'antorcha' && o.lit > 0 && o.lit < 1e8 && Math.abs(o.x - e.x) < 170).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0];
    if (an) { if (vuela(e, an.x + e.dir * -6, an.y - 26, 60, d) < 6) { an.lit = 0; e.sopla = .6; e.cd = 3.5; spawn(g, 12, an.x, an.y - 26, { v: 50, life: .6, s: 1.6, k: 'dust', cols: ['#d8d0c0', '#8a8090'] }); } return; }
    vuela(e, e.hx + Math.sin(e.t * .8) * 40, e.hy + Math.sin(e.t * 1.9) * 8, 40, d);
  };
  // rastrillo: la reja del baluarte; se queda arriba mientras su antorcha esté encendida
  OBJ.rastrillo = {
    make(g, en) {
      const x = tx(en.x) + 5, base = L.surfaceY(en.x + PAD, 0) * T, h = (en.h || 5) * T;
      const s = { k: 'rastrillo', x, y: base - h, w: 6, h, on: true }; g.solids.push(s); g.objs.push({ k: 'rastrillo', s, base, h, sube: 0 });
    },
    step(o, g, dt) {
      if (o.ant === undefined) o.ant = (g.objs.filter(q => q.k === 'antorcha').sort((a, b) => Math.abs(a.x - o.s.x) - Math.abs(b.x - o.s.x))[0]) || null;
      const abierto = !!(o.ant && o.ant.lit > 0);
      if (abierto) { o.s.on = false; o.sube = Math.min(1, o.sube + dt * 2); }
      else { o.sube = Math.max(0, o.sube - dt * 3); if (o.sube <= 0 && !o.s.on && freeOf(g, o.s.x, o.s.y, o.s.w, o.s.h)) { o.s.on = true; g.shake = Math.max(g.shake || 0, .08); } }
    },
    draw(c, o, f) {
      const s = o.s, y = s.y - o.sube * (o.h - 6), x = Math.round(s.x);
      c.fillStyle = '#1c1626'; c.fillRect(x - 2, s.y - 6, 10, 5); c.fillStyle = '#463848'; c.fillRect(x - 1, s.y - 5, 8, 3);
      for (let k = 0; k < 3; k++) { c.fillStyle = '#1c1626'; c.fillRect(x + k * 2.4 - .4, y, 1.6, o.h); c.fillStyle = '#6a5a6a'; c.fillRect(x + k * 2.4, y, .8, o.h); }
      for (let yy = y + 6; yy < y + o.h - 2; yy += 8) { c.fillStyle = '#1c1626'; c.fillRect(x - 1, yy, 8, 1.6); c.fillStyle = '#6a5a6a'; c.fillRect(x - 1, yy, 8, .7); }
      for (let k = 0; k < 3; k++) { c.fillStyle = '#9a8a9a'; c.beginPath(); c.moveTo(x + k * 2.4 - .4, y + o.h); c.lineTo(x + k * 2.4 + .4, y + o.h + 2.4); c.lineTo(x + k * 2.4 + 1.2, y + o.h); c.fill(); }
      if (o.ant && !(o.ant.lit > 0)) { c.strokeStyle = 'rgba(255,208,74,.35)'; c.setLineDash([1.5, 2]); c.lineWidth = .5; c.beginPath(); c.moveTo(x + 3, s.y - 6); c.lineTo(o.ant.x, o.ant.y - 26); c.stroke(); c.setLineDash([]); }
    },
  };
  amplia('bits32', 190, b => {
    const G = { k: 'ghost', look: 'espectral' };
    // I · antorchas, losas fantasmales y el primer fantasma
    b.g(0, 12).P(3).d('T', 5).o('antorcha', 8, 0, { lit: true });
    b.o('antorcha', 11).p(15, 9, 3, G).p(20, 8, 3, G).c(15, 22, 6);
    b.g(25, 42).e(30, undefined, 'pirata').o('antorcha', 27).e(36, 6, 'fantasma').d('r', 33).c(26, 39, 9);
    b.p(45, 7, 3).p(51, 7, 3, { ph: 2 }).c(44, 54, 5);
    // II · el rastrillo: sube con su antorcha encendida; el soplo la apaga
    b.g(56, 74).o('antorcha', 58).o('rastrillo', 64, 0, { h: 5 }).e(66, 4, 'soplo').e(68, undefined, 'calavera').o('antorcha', 71).d('T', 73);
    b.p(76, 9, 3, G).p(80, 8, 2, G).g(83, 83, 9).o('antorcha', 83).p(86, 9, 3, G).c(76, 88, 6);
    // III · la muralla: fantasmas, otro rastrillo y candiles
    b.g(90, 108).e(94, undefined, 'pirata').e(99, 5, 'fantasma').o('antorcha', 101).h(103, 9).o('rastrillo', 106, 0, { h: 5 }).d('r', 92);
    b.p(111, 7, 3, { len: 5, amp: .6 }).p(117, 7, 3, { len: 5, amp: .6, ph: 1.6 }).c(110, 120, 4);
    // IV · el adarve hasta la torre del vigía
    b.g(123, 140).o('antorcha', 125).e(130, 4, 'soplo').o('antorcha', 134).e(137, 6, 'fantasma');
    b.p(143, 9, 3, G).p(147, 8, 2, G).g(150, 150, 10).o('antorcha', 150).p(153, 9, 3, G).c(143, 155, 6);
    b.g(157, 189).e(162, undefined, 'calavera').o('antorcha', 166).o('rastrillo', 170, 0, { h: 5 }).e(176, 5, 'fantasma').h(178, 9).e(180, 4, 'soplo').o('antorcha', 183, 0, { lit: true }).Gl(186);
  });
  NIVELES.bits32.fauna = ['pirata', 'fantasma', 'soplo', 'calavera'];
  NIVELES.bits32.lema = 'Antorchas que revelan losas fantasmales, fantasmas que solo se ven a su luz, soplos que las apagan y rastrillos que suben con su antorcha.';

  // =================================================================
  //  64 BITS · La selva de Calakmul (Fresita carga a Itzel volando)
  // =================================================================
  // tucán: mientras Fresita carga a Itzel, la persigue y la picotea hasta que la suelta
  FOE.tucan = { beh: 'tucan', w: 12, h: 9, v: 0 };
  BEH.tucan = (e, g, d) => {
    e.cd = Math.max(0, (e.cd || 0) - d); e.pica = Math.max(0, (e.pica || 0) - d);
    if (g.carry && e.cd <= 0 && Math.abs(g.fre.x - e.x) < 180) { if (vuela(e, g.fre.x - e.dir * 4, g.fre.y, 115, d) < 9) { g.carry = null; g.fre.cool = 1; e.pica = .5; e.cd = 3; ring(g, g.fre.x, g.fre.y, '#ffe070', 18, .4); } return; }
    vuela(e, e.hx + Math.sin(e.t * .7) * 46, e.hy + Math.sin(e.t * 1.5) * 10, 50, d);
  };
  // nauyaca: enroscada entre las hojas; cascabelea y lanza la mordida
  FOE.nauyaca = { beh: 'nauyaca', w: 14, h: 6, v: 0, spiky: e => e.ataca > 0 };
  BEH.nauyaca = (e, g, d, toP) => {
    if (e.vy !== 0 || !onGround(e)) { gravity(e, d); return; }
    const p = g.p; e.cd = Math.max(0, (e.cd || 0) - d); e.ataca = Math.max(0, (e.ataca || 0) - d);
    if (e.aviso > 0) { e.aviso -= d; if (e.aviso <= 0) { e.ataca = .45; } return; }
    if (e.ataca > 0) { const k = e.ataca > .3 ? (.45 - e.ataca) / .15 : e.ataca / .3; e.ext = k; e.x = e.hx + e.dir * k * 16; return; }
    e.ext = 0; e.x += (e.hx - e.x) * Math.min(1, d * 8);
    if (e.cd <= 0 && Math.abs(toP) < 46 && Math.abs(p.y - e.y) < 16) { e.dir = Math.sign(toP) || e.dir; e.aviso = .35; e.cd = 1.6; }
  };
  // dormilona: hojas que se cierran si Itzel se queda parada encima, y se vuelven a abrir después
  PK.mimosa = (pl, g, d, dt) => {
    pl.verSiempre = true; pl.fase = pl.fase || 'abierta';
    if (pl.fase === 'abierta') { pl.cierra = Math.max(0, (pl.cierra || 0) - dt * 3); if (pl.stood) { pl.tt = (pl.tt || 0) + dt; pl.cierra = Math.min(.5, pl.tt); if (pl.tt > .45) { pl.fase = 'cerrada'; pl.tt = 0; pl.on = false; } } else pl.tt = 0; }
    else { pl.tt += dt; pl.cierra = 1 - clamp((pl.tt - 2.2) / .4, 0, 1); if (pl.tt > 2.6) { pl.fase = 'abierta'; pl.on = true; pl.tt = 0; } }
  };
  LOOK.mimosa = (c, pl, f) => {
    const x = pl.x, y = pl.y, w = pl.w, k = pl.cierra || 0, t = f.t, sw = Math.sin(t * 1.3 + x * .05) * .5;
    const tallo = u => y + 2.6 + Math.sin(u * Math.PI) * 1.4;   // la rama se comba un poquito
    // rama leñosa con sombra
    c.lineCap = 'round'; c.strokeStyle = '#1c2a12'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(x - 1, tallo(0)); c.quadraticCurveTo(x + w / 2, tallo(.5) + 1.4, x + w + 1, tallo(1)); c.stroke();
    c.strokeStyle = '#6a4a2a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x - 1, tallo(0)); c.quadraticCurveTo(x + w / 2, tallo(.5) + 1.4, x + w + 1, tallo(1)); c.stroke();
    c.strokeStyle = '#9a7a4a'; c.lineWidth = .5; c.beginPath(); c.moveTo(x, tallo(0) - .5); c.quadraticCurveTo(x + w / 2, tallo(.5) + .9, x + w, tallo(1) - .5); c.stroke();
    // hojuelas en pares: abiertas hacia arriba; al cerrarse se pliegan y cuelgan
    for (let i = 0; i < w / 4; i++) for (const s of [-1, 1]) {
      const u = (i + .5) / (w / 4), lx = x + 2 + i * 4, ly = tallo(u) - .4;
      const abre = (1 - k), a = s > 0 ? -.35 - abre * .9 + sw * .1 : Math.PI + .35 + abre * .9 + sw * .1;
      c.save(); c.translate(lx, ly); c.rotate(a + k * (s > 0 ? 1.5 : -1.5));
      c.fillStyle = '#1c3a14'; c.beginPath(); c.ellipse(2.9, .35, 3.2, 1.5, 0, 0, TAU); c.fill();
      c.fillStyle = s > 0 ? '#7ac850' : '#5aa83e'; c.beginPath(); c.ellipse(2.8, 0, 2.9, 1.25, 0, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,255,200,.45)'; c.lineWidth = .35; c.beginPath(); c.moveTo(.4, 0); c.lineTo(5, 0); c.stroke();
      c.restore();
    }
    // pompones rosas de la dormilona en las puntas (se encogen al cerrarse)
    for (const [px, py] of [[x + 1, tallo(0) - 3], [x + w - 1, tallo(1) - 3.4]]) {
      const r = 2.2 * (1 - k * .6);
      for (let j = 0; j < 9; j++) { const an = j / 9 * TAU + t * .4; c.strokeStyle = j % 2 ? '#ff9ac8' : '#ff6aa8'; c.lineWidth = .55; c.beginPath(); c.moveTo(px, py); c.lineTo(px + Math.cos(an) * r, py + Math.sin(an) * r); c.stroke(); }
      c.fillStyle = '#ffe0f0'; c.beginPath(); c.arc(px, py, .7, 0, TAU); c.fill();
    }
    if (pl.fase === 'abierta' && k > .05) { c.fillStyle = `rgba(255,154,200,${k * 1.6})`; c.beginPath(); c.arc(x + w / 2, y - 3 - k * 2, 1.1, 0, TAU); c.fill(); }
  };
  amplia('bits64', 190, b => {
    const MIM = { k: 'mimosa', look: 'mimosa' };
    // I · flores que abren con Fresita y la primera nauyaca
    b.g(0, 13).P(3).d('T', 7).d('f', 11);
    b.p(16, 9, 3).p(21, 8, 3).c(16, 23, 6);
    b.g(25, 42).isl(33, 36, 7).e(34, 7, 'mono').e(29, undefined, 'nauyaca').d('r', 27).d('f', 40).c(26, 31, 9);
    b.g(43, 54, 4).c(44, 53, 2).d('T', 49);
    b.p(57, 6, 3, MIM).p(62, 7, 3, MIM).c(56, 65, 4).e(60, 3, 'tucan');
    // II · la ceiba: monos, nauyacas y dormilonas
    b.g(67, 82, 9).e(72, 9, 'nauyaca').e(78, 9, 'mono').d('T', 69).c(68, 81, 7);
    b.p(85, 9, 3).p(90, 8, 3, MIM).p(95, 9, 3).c(84, 98, 6).e(91, 4, 'tucan');
    // III · el gran barranco: Fresita carga a Itzel (y el tucán la persigue)
    b.g(100, 116).e(105, undefined, 'nauyaca').h(108, 9).isl(110, 113, 6).e(111, 6, 'mono').d('r', 102);
    b.p(120, 7, 3).p(126, 6, 3, MIM).c(118, 129, 4).e(124, 3, 'tucan');
    // IV · la terraza de la pirámide y la selva hasta Calakmul
    b.g(131, 148, 6).c(132, 147, 4).e(140, 6, 'nauyaca').d('T', 145);
    b.p(151, 8, 3, MIM).p(156, 9, 3).p(161, 8, 3, MIM).c(150, 164, 6);
    b.g(166, 189).e(171, undefined, 'mono').e(176, 4, 'tucan').e(180, undefined, 'nauyaca').h(183, 9).Gl(186).d('T', 188);
  });
  NIVELES.bits64.fauna = ['mono', 'tucan', 'nauyaca'];
  NIVELES.bits64.lema = 'Flores que solo abren con Fresita cerca, dormilonas que se cierran si te quedas, nauyacas que cascabelean y tucanes que la picotean mientras te carga.';
})();
