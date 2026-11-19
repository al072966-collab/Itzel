'use strict';
// =====================================================================
//  MUNDOS AMPLIADOS · LOTE 7 (hielo, cielo maya, hollín, 8 bits)
//  Cuatro actos por mundo; dos enemigos y una pieza que juegan con el
//  poder de Fresita. Los dibujos de los enemigos van en enemigos-mundos.js.
// =====================================================================
(function () {
  const { LOOK, PK, BEH, OBJ, FOE, mkPlat, walkStep, gravity, onGround, ring, tx, tl, freeOf, platTop } = MEC;
  const amplia = (id, W, build) => { NIVELES[id].W = W; NIVELES[id].build = build; };
  const tocaItzel = (g, x0, y0, x1, y1) => { const p = g.p; return p.vis && p.x + p.w / 2 > x0 && p.x - p.w / 2 < x1 && p.y > y0 && p.y - p.h < y1; };
  const vuela = (e, tx2, ty2, sp, d) => { const dx = tx2 - e.x, dy = ty2 - e.y, dd = Math.hypot(dx, dy) || 1, k = Math.min(dd, sp * d); e.x += dx / dd * k; e.y += dy / dd * k; if (Math.abs(dx) > 1) e.dir = Math.sign(dx); return dd; };
  const distSeg = (x, y, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1, u = clamp(((x - ax) * dx + (y - ay) * dy) / L2, 0, 1); return Math.hypot(x - ax - u * dx, y - ay - u * dy); };

  // =================================================================
  //  HIELO · El día que nevó en Campeche (témpanos en el mar helado)
  // =================================================================
  const marDe = (g, x) => g.objs.find(o => o.k === 'mar' && x >= o.x0 && x <= o.x1);
  // foca: nada bajo el hielo; sale junto a Itzel y empuja el témpano (y a Itzel con él)
  FOE.foca = { beh: 'foca', w: 14, h: 8, v: 0 };
  BEH.foca = (e, g, d) => {
    const m = e.mar || (e.mar = marDe(g, e.hx)); if (!m) return;
    if (!g._vigiaFoca) { g._vigiaFoca = true; g.objs.push({ k: 'focas' }); }
    const p = g.p; e.cd = Math.max(0, (e.cd || 0) - d);
    if (e.fuera > 0) {
      e.fuera -= d; e.y = m.y + 3;
      if (!e.empujo) { e.empujo = true; for (const pl of g.plats) if (pl.k === 'floe' && Math.abs(pl.x + pl.w / 2 - e.x) < pl.w / 2 + 10) { pl.vx = (pl.vx || 0) * -1.6 || (Math.random() < .5 ? -14 : 14); pl.y -= 3; if (p.plat === pl) { p.vy = -170; p.plat = null; } ring(g, e.x, m.y, '#ffffff', 16, .3); } }
      if (e.fuera <= 0) { e.cd = 2.6; e.empujo = false; }
      return;
    }
    e.sx = clamp((e.sx ?? e.hx) + clamp(p.x - (e.sx ?? e.hx), -50 * d, 50 * d), m.x0 + 8, m.x1 - 8); e.x = e.sx; e.y = -999; e.dir = p.x > e.x ? 1 : -1;
    if (e.cd <= 0 && Math.abs(p.x - e.sx) < 8 && p.x > m.x0 && p.x < m.x1 && p.y < m.y + 4) e.fuera = .9;
  };
  OBJ.focas = {
    draw(c, o, f) {
      for (const e of f.g.foes) if (e.k === 'foca' && e.mar && !(e.fuera > 0) && e.st === 'ok') {
        const y = e.mar.y + 1, x = e.sx ?? e.hx; c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = .5;
        for (let k = 0; k < 2; k++) { const r = 3 + ((f.t * 6 + k * 3) % 6); c.globalAlpha = 1 - r / 9; c.beginPath(); c.ellipse(x, y, r, r * .3, 0, 0, TAU); c.stroke(); }
        c.globalAlpha = 1; c.fillStyle = 'rgba(40,60,90,.35)'; c.beginPath(); c.ellipse(x, y + 3, 7, 2, 0, 0, TAU); c.fill();
      }
    },
  };
  // muñeco de nieve: avienta bolas de nieve; si caen al mar, dejan un pedacito de hielo flotando
  FOE.muneco = { beh: 'muneco', w: 12, h: 16, v: 0 };
  BEH.muneco = (e, g, d, toP) => {
    const p = g.p; e.dir = Math.sign(toP) || e.dir; e.tt = (e.tt ?? 1.6) - d; e.carga = e.tt < .5;
    if (e.tt <= 0) { e.tt = 2.4; if (Math.abs(toP) < 170) { const tt = .85, sx = e.x + e.dir * 6, sy = e.y - 12; g.objs.push({ k: 'bolaNieve', x: sx, y: sy, vx: (p.x - sx) / tt, vy: ((p.y - 8 - sy) - .5 * 380 * tt * tt) / tt, t: 0 }); } }
  };
  OBJ.bolaNieve = {
    step(o, g, dt) {
      o.t += dt; o.vy += 380 * dt; o.x += o.vx * dt; o.y += o.vy * dt;
      const fin = () => { o.dead = true; spawn(g, 8, o.x, o.y, { v: 40, life: .4, s: 1.4, k: 'dust', cols: ['#ffffff', '#bcd7ea'] }); };
      if (tocaItzel(g, o.x - 2, o.y - 2, o.x + 2, o.y + 2)) { fin(); MEC.hurt(g, o.vx > 0 ? 1 : -1); return; }
      const m = marDe(g, o.x); if (m && o.y >= m.y - 2) { fin(); g.plats.push(Object.assign(mkPlat({ k: 'floe', look: 'tempano', x: o.x - 8, y: m.y - 2, w: 16, life: 3.5, vx: 0 }), { w0: 16, max: 3.5 })); return; }
      if (SOLID(o.x, o.y) || o.t > 3 || o.y > VH + 20) fin();
    },
    draw(c, o) { c.fillStyle = '#ffffff'; c.beginPath(); c.arc(o.x, o.y, 2.2, 0, TAU); c.fill(); c.strokeStyle = '#8fb8d6'; c.lineWidth = .4; c.stroke(); c.fillStyle = 'rgba(143,184,214,.6)'; c.beginPath(); c.arc(o.x + .6, o.y + .6, 1.2, 0, Math.PI); c.fill(); },
  };
  // ventisca: un viento helado que sopla a ratos y empuja a Itzel sobre el piso resbaloso
  OBJ.ventisca = {
    make(g, en) { g.objs.push({ k: 'ventisca', x0: tx(en.x), x1: tx(en.x2 + 1), v: en.v || -70, t: en.off || 0, yTop: (L.surfaceY(en.x + PAD, 0) - (en.alto || 6)) * T }); },   // sopla a ras del malecón: arriba, en las rutas altas, no
    step(o, g, dt) { o.t += dt; const u = o.t % 4.6; o.on = u < 2; o.avisa = u > 3.8; o.fuerza = o.on ? Math.min(1, u * 3, (2 - u) * 3) : 0; },
    env(o, g, e) { const p = g.p; if (o.fuerza > 0 && p.x > o.x0 && p.x < o.x1 && p.y > o.yTop) e.push = (e.push || 0) + o.v * o.fuerza; },
    draw(c, o, f) {
      const dir = Math.sign(o.v), w = o.x1 - o.x0, a = o.fuerza || (o.avisa ? .25 : 0); if (!a) return;
      c.save(); c.strokeStyle = `rgba(255,255,255,${.55 * a})`; c.lineWidth = .6; c.lineCap = 'round';
      for (let i = 0; i < 22; i++) { const y = o.yTop + 4 + hash1(i, 3) * (6 * T - 6), u = ((f.t * 140 * (.7 + hash1(i, 5) * .6) + hash1(i, 7) * w) % w), x = dir > 0 ? o.x0 + u : o.x1 - u; c.beginPath(); c.moveTo(x, y); c.lineTo(x - dir * (6 + a * 6), y - 1); c.stroke(); c.fillStyle = `rgba(255,255,255,${.8 * a})`; c.beginPath(); c.arc(x + dir * 2, y + Math.sin(f.t * 5 + i) * 2, .7, 0, TAU); c.fill(); }
      c.restore();
    },
  };
  amplia('hielo', 190, b => {
    // I · el mar helado: témpanos de Fresita y la primera foca
    b.g(0, 12).P(3).d('T', 7).d('r', 10);
    b.o('mar', 13, 12, { x2: 20 }).c(14, 19, 9);
    b.g(21, 38).isl(26, 32, 5).e(27, 7, 'carambano').e(31, 7, 'carambano').e(35, undefined, 'muneco').d('f', 23).c(26, 32, 9);
    b.o('mar', 39, 12, { x2: 52 }).e(45, 12, 'foca').p(43, 9, 3).c(40, 51, 7);
    // II · la ventisca sobre el malecón congelado
    b.g(53, 72).o('ventisca', 53, 0, { x2: 72, v: -70 }).isl(57, 64, 5).e(58, 7, 'carambano').e(62, 7, 'carambano').e(68, undefined, 'muneco').c(55, 70, 9).d('T', 71);
    b.o('mar', 73, 12, { x2: 86 }).e(79, 12, 'foca').p(77, 9, 2).c(74, 85, 8);
    // III · el muelle: muñecos, carámbanos y dos focas en el mar grande
    b.g(87, 104).e(92, undefined, 'muneco').isl(95, 100, 6).e(96, 8, 'carambano').e(99, 8, 'carambano').h(102, 9).d('T', 89);
    b.o('mar', 105, 12, { x2: 122 }).e(110, 12, 'foca').e(117, 12, 'foca').p(113, 9, 2).c(106, 121, 8);
    // IV · ventisca a favor y el último mar hasta la plaza
    b.g(123, 145).o('ventisca', 128, 0, { x2: 142, v: 80 }).e(134, undefined, 'muneco').isl(137, 141, 5).e(138, 7, 'carambano').c(130, 142, 9);
    b.o('mar', 146, 12, { x2: 158 }).e(152, 12, 'foca').c(147, 157, 8);
    b.g(159, 189).e(166, undefined, 'muneco').isl(170, 176, 6).e(172, 8, 'carambano').h(180, 9).Gl(185).d('T', 182);
  });
  NIVELES.hielo.fauna = ['carambano', 'foca', 'muneco'];
  NIVELES.hielo.lema = 'Todo resbala: carámbanos que caen, el mar helado con focas que voltean los témpanos, muñecos de nieve y la ventisca.';

  // =================================================================
  //  CIELO MAYA (constelaciones; poca gravedad)
  // =================================================================
  // cometa: cruza en diagonal cada tanto; si pasa por una línea de constelación, la rompe
  FOE.cometa = { beh: 'cometa', w: 10, h: 8, v: 0, spiky: () => true, sinSombra: true };
  BEH.cometa = (e, g, d) => {
    e.ct = (e.ct || 0) + d; const per = 4.4, u = (e.ct + (e.off || 0)) % per;
    e.avisa = u > 2.2 && u < 2.8; e.pasa = u >= 2.8 && u < 4.4;
    if (!e.pasa) { e.y = -999; e.x = e.hx - 120; return; }
    const k = (u - 2.8) / 1.6; e.x = e.hx - 120 + k * 240; e.y = e.hy - 50 + k * 100; e.dir = 1;
    for (const pl of g.plats) if (pl.pw && pl.k === 'seg' && !pl.dead && distSeg(e.x, e.y - 4, pl.x, pl.y, pl.x2, pl.y2) < 7) { pl.dead = true; spawn(g, 10, e.x, e.y - 4, { v: 60, life: .5, s: 1.4, k: 'spark', cols: ['#fff3c4', '#e2c06e'] }); }
  };
  // conejo de la luna: brinca enorme con la poca gravedad; cae en el piso o sobre las líneas de Fresita
  FOE.conejo = { beh: 'conejo', w: 10, h: 10, v: 0 };
  BEH.conejo = (e, g, d, toP) => {
    if (e.aire) {
      const vy0 = e.vy; e.vy = Math.min(e.vy + 560 * d, 300); const oy = e.y; e.y += e.vy * d; const nx = e.x + e.vx * d; if (!SOLID(nx + Math.sign(e.vx) * 5, e.y - 4)) e.x = nx; else e.vx = -e.vx * .3;
      let suelo = null; if (e.vy > 0) { if (SOLID(e.x, e.y)) suelo = borde(e.x, e.y, 'arriba'); for (const pl of g.plats) { if (pl.on === false || pl.dead) continue; const [a0, a1] = MEC.platSpan(pl); if (e.x <= a0 || e.x >= a1) continue; const yt = platTop(pl, e.x); if (oy <= yt + 1 && e.y >= yt) suelo = Math.min(suelo ?? 1e9, yt); } }
      if (suelo !== null) { e.y = suelo; e.vy = 0; e.vx = 0; e.aire = false; e.cd = .9; }
      if (e.y > VH + 50) { e.st = 'gone'; e.tt = 1; }
      e.dvy = vy0; return;
    }
    e.cd = (e.cd ?? 1) - d; e.agacha = e.cd < .2;
    if (e.cd <= 0) { e.dir = Math.abs(toP) < 160 ? Math.sign(toP) || e.dir : (Math.random() < .5 ? -1 : 1); e.vy = -250; e.vx = e.dir * 55; e.y -= 1; e.aire = true; }
  };
  // remolino de estrellas: jala a Itzel hacia su centro; en el centro, quema
  OBJ.pozo = {
    make(g, en) { g.objs.push({ k: 'pozo', x: tx(en.x) + 8, y: tl(en.y) + 8, r: (en.r || 4.4) * T }); },
    env(o, g, e) { if (o.jala) e.push = (e.push || 0) + o.jala; },
    step(o, g, dt) {
      const p = g.p, dx = o.x - p.x, dy = o.y - (p.y - 7), dd = Math.hypot(dx, dy) || 1; o.jala = 0; if (dd > o.r) return;
      const k = 1 - dd / o.r; o.jala = dx / dd * 110 * k; p.vy += dy / dd * 300 * k * dt;   // de lado jala como viento (la fricción no lo borra)
      if (dd < 8) { MEC.hurt(g, dx > 0 ? -1 : 1); p.vx = -dx / dd * 160; p.vy = -180; }
    },
    draw(c, o, f) {
      c.save(); c.translate(o.x, o.y);
      for (let a = 0; a < 2; a++) { c.rotate(Math.PI); for (let i = 0; i < 26; i++) { const u = i / 26, an = -f.t * 1.4 + u * 6, r = u * o.r; c.fillStyle = `rgba(${i % 3 ? '226,192,110' : '255,243,196'},${(1 - u) * .8})`; c.beginPath(); c.arc(Math.cos(an) * r, Math.sin(an) * r * .55, .5 + (1 - u) * 1.3, 0, TAU); c.fill(); } }
      c.globalCompositeOperation = 'lighter'; glowDot(c, 0, 0, 12, '#fff3c4', .5); c.globalCompositeOperation = 'source-over';
      c.fillStyle = '#0b1430'; c.beginPath(); c.arc(0, 0, 3.4, 0, TAU); c.fill(); c.strokeStyle = 'rgba(255,243,196,.8)'; c.lineWidth = .6; c.stroke();
      c.restore();
    },
  };
  amplia('cielo', 190, b => {
    // I · estrellas para tender caminos y el primer conejo
    b.g(0, 12).P(3).d('T', 7).d('r', 10);
    b.o('estrella', 12, 9).o('estrella', 23, 9).c(14, 21, 7);
    b.g(23, 40).e(28, undefined, 'escorpion').e(35, undefined, 'conejo').d('f', 25).c(26, 36, 8);
    b.p(42, 9, 3, { ph: 0 }).p(42, 7, 3, { ph: 75 }).c(43, 52, 5).e(48, 4, 'cometa');
    // II · la terraza y el remolino de estrellas debajo del camino
    b.g(55, 66, 7).d('r', 58).c(56, 65, 5).o('estrella', 66, 5);
    b.o('estrella', 73, 4).o('estrella', 81, 5).c(68, 80, 2).o('pozo', 77, 9);
    b.g(83, 98).e(88, undefined, 'conejo').e(94, undefined, 'jaguar').h(91, 8).d('f', 85);
    // III · tres estrellas con su cometa
    b.o('estrella', 100, 7).o('estrella', 108, 5).o('estrella', 116, 7).e(108, 2, 'cometa').c(101, 115, 4);
    b.g(119, 136).e(124, undefined, 'conejo').o('pozo', 131, 4, { r: 3.6 }).d('T', 122);
    // IV · meteoros, estrellas y remolino hasta el observatorio
    b.p(138, 9, 3, { span: 110, sp: 20 }).o('estrella', 137, 7).o('estrella', 147, 6).o('estrella', 156, 7).c(139, 155, 5).e(147, 2, 'cometa').o('pozo', 151, 11);
    b.g(159, 189).e(165, undefined, 'escorpion').e(172, undefined, 'conejo').h(178, 8).Gl(185).d('T', 182);
  });
  NIVELES.cielo.fauna = ['escorpion', 'conejo', 'cometa', 'jaguar'];
  NIVELES.cielo.lema = 'Poca gravedad, meteoros de paso, estrellas para tender caminos, cometas que los rompen, conejos de la luna y remolinos de estrellas.';

  // =================================================================
  //  HOLLÍN · Campeche bajo la ceniza (las criaturas oyen; bengala y escondites)
  // =================================================================
  // araña de ceniza: cuelga de su hilo; si oye ruido abajo, baja de golpe
  FOE.aranaCeniza = { beh: 'aranaCeniza', w: 10, h: 8, v: 0, sinSombra: true };
  BEH.aranaCeniza = (e, g, d) => {
    const p = g.p, oye = (g.noise || 0) > .35 && !g.hidden && Math.abs(p.x - e.x) < 46 && p.y > e.hy;
    const quiere = oye ? Math.max(6, p.y - 8 - e.hy) : 6; e.len = e.len ?? 6; e.baja = quiere > e.len + 2;
    e.len += clamp(quiere - e.len, -50 * d, 180 * d); e.y = e.hy + e.len;
  };
  FOE.cuervoCeniza = { beh: 'cuervoCeniza', w: 10, h: 8, v: 0 };
  // cuervo de ceniza: si ve a Itzel sin esconderse, grazna: el ruido llega al máximo y los perros vienen
  BEH.cuervoCeniza = (e, g, d, toP) => {
    const p = g.p; e.grazna = Math.max(0, (e.grazna || 0) - d); e.cd = Math.max(0, (e.cd || 0) - d);
    if (e.vuela > 0) { e.vuela -= d; vuela(e, e.hx + e.dir * 40, e.hy - 30, 80, d); if (e.vuela <= 0) { e.vuelve = true; } return; }
    if (e.vuelve) { if (vuela(e, e.hx, e.hy, 60, d) < 2) { e.vuelve = false; e.y = e.hy; } return; }
    const ve = !g.hidden && Math.abs(toP) < 95 && Math.abs(p.y - e.y) < 40;
    e.mira = ve ? (e.mira || 0) + d : 0; e.dir = Math.sign(toP) || e.dir;
    if (e.mira > .6 && e.cd <= 0) { e.grazna = .8; e.cd = 4; g.noise = 1; ring(g, e.x, e.y - 6, '#ff3030', 60, .6); e.vuela = 1.4; e.mira = 0; }
  };
  // vidrios rotos en el piso: si Itzel los pisa corriendo, hacen ruido (agachada o despacito no)
  OBJ.vidrios = {
    make(g, en) { g.objs.push({ k: 'vidrios', x0: tx(en.x), x1: tx(en.x2 + 1), y: L.surfaceY(en.x + PAD, 0) * T, cruje: 0 }); },
    step(o, g, dt) { const p = g.p; o.cruje = Math.max(0, o.cruje - dt * 2); if (p.on && p.x > o.x0 && p.x < o.x1 && Math.abs(p.y - o.y) < 2 && Math.abs(p.vx) > 40) { g.noise = Math.min(1, (g.noise || 0) + dt * 1.6); o.cruje = 1; if (Math.random() < .3) spawn(g, 1, p.x, o.y - 1, { v: 30, life: .3, s: 1, k: 'spark', cols: ['#d8d2c8'] }); } },
    draw(c, o, f) {
      c.save(); for (let x = o.x0 + 2; x < o.x1 - 2; x += 3.4) { const h = hash1(x | 0, 9), a = h * Math.PI; c.fillStyle = `rgba(216,210,200,${.35 + h * .4 + o.cruje * .3})`; c.beginPath(); c.moveTo(x, o.y); c.lineTo(x + Math.cos(a) * 2, o.y - 1 - h * 1.6); c.lineTo(x + 1.6, o.y); c.closePath(); c.fill(); }
      if (o.cruje > .3) { c.fillStyle = `rgba(255,48,48,${o.cruje * .7})`; c.font = 'bold 5px "Alegreya Sans", sans-serif'; c.textAlign = 'center'; c.fillText('¡crac!', (o.x0 + o.x1) / 2, o.y - 10); }
      c.restore();
    },
  };
  amplia('hollin', 190, b => {
    b.o('ruido', 0, 0);
    // I · escondites y la primera araña de ceniza
    b.g(0, 14).P(3).d('T', 7).o('escondite', 10, 0, { x2: 12 });
    b.g(15, 40).o('escondite', 19, 0, { x2: 22, kind: 'auto' }).e(27, undefined, 'perro').o('escondite', 31, 0, { x2: 33 }).e(36, 2, 'aranaCeniza').c(24, 30, 9).d('r', 38);
    b.p(42, 10, 2, { k: 'creak' }).p(46, 9, 2, { k: 'creak' }).c(42, 47, 7);
    // II · el cuervo que avisa y los vidrios rotos
    b.g(49, 74).o('escondite', 52, 0, { x2: 54 }).e(57, undefined, 'cuervoCeniza').o('vidrios', 59, 0, { x2: 62 }).e(64, 2, 'aranaCeniza').e(66, undefined, 'perro').o('escondite', 69, 0, { x2: 71, kind: 'auto' }).d('T', 73);
    b.g(75, 78, 8).g(79, 96).o('escondite', 81, 0, { x2: 83 }).h(85, 9).e(87, undefined, 'jabali').o('vidrios', 89, 0, { x2: 92 }).e(94, undefined, 'cuervoCeniza');
    // III · tablones que crujen bajo las arañas
    b.p(98, 10, 2, { k: 'creak' }).p(102, 9, 2, { k: 'creak' }).p(106, 10, 2, { k: 'creak' }).c(98, 107, 7).e(102, 3, 'aranaCeniza');
    b.g(109, 134).o('escondite', 112, 0, { x2: 114 }).e(118, undefined, 'perro').o('vidrios', 121, 0, { x2: 125 }).o('escondite', 127, 0, { x2: 130, kind: 'auto' }).e(132, undefined, 'cuervoCeniza');
    // IV · la calle larga hasta la iglesia
    b.p(136, 10, 2, { k: 'creak' }).p(140, 9, 2, { k: 'creak' }).c(136, 141, 7);
    b.g(143, 189).o('escondite', 146, 0, { x2: 148 }).e(152, undefined, 'perro').e(156, 2, 'aranaCeniza').o('vidrios', 159, 0, { x2: 163 }).o('escondite', 165, 0, { x2: 168, kind: 'auto' }).e(171, undefined, 'cuervoCeniza').e(176, undefined, 'perro').Gl(185).d('T', 181);
  });
  NIVELES.hollin.fauna = ['perro', 'aranaCeniza', 'cuervoCeniza', 'jabali'];
  NIVELES.hollin.lema = 'Las criaturas no ven: oyen. Agáchate en los escondites; cuidado con los vidrios rotos, las arañas que bajan con el ruido y los cuervos que avisan.';

  // =================================================================
  //  8 BITS · Campeche 1-1 (canisteles que se vuelven ladrillos)
  // =================================================================
  // topón: camina y, si tiene un ladrillo encima, brinca y lo rompe de un cabezazo
  FOE.topon = { beh: 'topon', w: 12, h: 12, v: 24 };
  BEH.topon = (e, g, d) => {
    if (e.vy !== 0 || !onGround(e)) {
      gravity(e, d);
      if (e.vy < 0) for (const s of g.solids) if ((s.k === 'ladrillo' || s.k === 'pblock') && !s.dead && e.x > s.x - 2 && e.x < s.x + s.w + 2 && e.y - e.h <= s.y + s.h + 1 && e.y - e.h > s.y) { if (s.k === 'ladrillo') s.life = 0; else s.dead = true; e.vy = 60; spawn(g, 10, s.x + 8, s.y + 8, { v: 80, life: .5, s: 2, k: 'confetti', cols: ['#c84c0c', '#fc9838', '#000000'], g: 300 }); g.shake = Math.max(g.shake || 0, .08); }
      return;
    }
    e.cd = Math.max(0, (e.cd || 0) - d);
    const arriba = g.solids.find(s => (s.k === 'ladrillo' || s.k === 'pblock') && !s.dead && s.on !== false && Math.abs(s.x + 8 - e.x) < 6 && s.y + s.h < e.y - 4 && s.y + s.h > e.y - 70);
    if (arriba && e.cd <= 0) { e.vy = -320; e.y -= 1; e.cd = 1; return; }
    walkStep(e, d, e.v);
  };
  // halcón de 8 bits: vuela en diagonales, se detiene, apunta hacia Itzel y sigue; rebota en ladrillos y paredes
  FOE.halcon = { beh: 'halcon', w: 12, h: 8, v: 0 };
  BEH.halcon = (e, g, d) => {
    const p = g.p; e.ft = (e.ft || 0) + d;
    if (e.ft >= 2.2) { e.ft = 0; e.vx2 = 0; }
    e.apunta = e.ft < .5; if (e.apunta) return;          // se detiene, mira a Itzel… y sale en diagonal hacia ella
    if (!e.vx2) { e.vx2 = (p.x > e.x ? 1 : -1) * 70; e.vy2 = (p.y - 8 > e.y ? 1 : -1) * 70; }
    const nx = e.x + e.vx2 * d, ny = e.y + e.vy2 * d;
    if (SOLID(nx + Math.sign(e.vx2) * 6, e.y - 4) || Math.abs(nx - e.hx) > 120) e.vx2 = -e.vx2; else e.x = nx;
    if (SOLID(e.x, ny - 4 + Math.sign(e.vy2) * 5) || ny < 20 || ny > e.hy + 60) e.vy2 = -e.vy2; else e.y = ny;
    e.dir = Math.sign(e.vx2);
  };
  // balanza: dos plataformas colgadas de la misma cuerda; la que pisas baja y la otra sube
  PK.balanza = (pl, g, d) => {
    if (!pl.otra) { pl.otra = g.plats.find(q => q !== pl && q.k === 'balanza' && q.par === pl.par) || null; pl.guia = !pl.otra || pl.x < pl.otra.x; }
    const o = pl.otra; if (!o || !pl.guia) return;
    const lim = 56, v = pl.stood ? 46 : o.stood ? -46 : 0;
    if (v) { const nd = clamp((pl.y - pl.y0) + v * d, -lim, lim); pl.y = pl.y0 + nd; o.y = o.y0 - nd; }
  };
  LOOK.balanza = (c, pl, f) => {
    const x = Math.round(pl.x), y = Math.round(pl.y), w = pl.w, top = pl.y0 - 70;
    c.fillStyle = '#000000'; c.fillRect(x + 2, top, 1, y - top); c.fillRect(x + w - 3, top, 1, y - top);
    c.fillStyle = '#000000'; c.fillRect(x, y, w, 6); c.fillStyle = '#fc9838'; c.fillRect(x + 1, y + 1, w - 2, 4); c.fillStyle = '#fcd8a8'; c.fillRect(x + 1, y + 1, w - 2, 1);
    if (pl.guia && pl.otra) { const o = pl.otra; c.fillStyle = '#000000'; c.fillRect(x + 2, top, Math.round(o.x) + o.w - 3 - x - 1, 1); for (const px of [x + 2, Math.round(o.x) + o.w - 3]) { c.fillStyle = '#000000'; c.fillRect(px - 3, top - 3, 7, 7); c.fillStyle = '#b8f818'; c.fillRect(px - 2, top - 2, 5, 5); c.fillStyle = '#000000'; c.fillRect(px, top, 1, 1); } }
  };
  amplia('bits8', 190, b => {
    const BAL = par => ({ k: 'balanza', look: 'balanza', par });
    // I · una subida de mampostería: cada escalón tiene dos losetas de alto.
    // Los canisteles sirven para crear atajos, no son necesarios para subir.
    b.g(0, 20).g(21, 23, 9).g(24, 26, 7).g(27, 38, 5);
    b.P(3).d('T', 7).d('f', 10).e(16, undefined, 'topon');
    b.c(7, 11, 9).c(16, 19, 8).c(21, 23, 7).c(24, 26, 5);
    b.e(32, undefined, 'chapulin').c(29, 36, 3).d('T', 36);
    // II · descenso y elevadores; hay pequeñas repisas fijas de respaldo.
    b.g(39, 58).e(46, undefined, 'topon').c(42, 50, 9).d('r', 54);
    b.isl(60, 62, 10).isl(65, 67, 8).isl(70, 72, 10);
    b.p(63, 8, 2, { y0: 0 }).p(68, 6, 2).c(60, 72, 5);
    b.g(75, 91).e(79, undefined, 'topon').d('T', 88);
    b.p(82, 7, 3, BAL(1)).p(87, 7, 3, BAL(1)).c(82, 90, 5);
    // III · un puente de plataformas permanentes y una ruta alta opcional.
    b.isl(93, 95, 10).isl(98, 100, 9).isl(103, 105, 10);
    b.g(108, 123).e(114, undefined, 'cangrejo').h(120, 9);
    b.c(93, 105, 6).c(110, 117, 8).e(104, 4, 'halcon');
    b.isl(125, 127, 10).isl(130, 132, 8).isl(135, 137, 7).isl(140, 142, 9);
    b.c(125, 142, 4).e(134, 3, 'halcon');
    b.g(145, 159).e(151, undefined, 'topon').c(147, 156, 8).d('T', 157);
    // IV · balanza opcional sobre un camino de regreso y llegada al castillo.
    b.isl(161, 163, 10).isl(166, 168, 10).isl(171, 173, 10);
    b.p(161, 7, 3, BAL(2)).p(169, 7, 3, BAL(2)).c(161, 173, 5);
    b.g(176, 189).e(179, undefined, 'chapulin').e(183, undefined, 'tortuga').Gl(186).d('T', 181);
  });
  NIVELES.bits8.fauna = ['chapulin', 'topon', 'halcon', 'cangrejo'];
  NIVELES.bits8.lema = 'Escalones de muralla, elevadores y balanzas. Fresita puede convertir canisteles en ladrillos para crear atajos.';
})();
