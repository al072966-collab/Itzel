'use strict';
// =====================================================================
//  MUNDOS AMPLIADOS · LOTE 3 (bruma, lowpoly, codex, óleo)
//  Igual que mundos-ampliados.js: cuatro actos por mundo y dos enemigos y
//  una pieza propios que juegan con el poder de Fresita. Los dibujos de los
//  enemigos están en enemigos-mundos.js (con el kit y la técnica del mundo).
// =====================================================================
(function () {
  const { LOOK, PK, BEH, OBJ, FOE, mkPlat, walkStep, gravity, onGround, ring, tx, tl, freeOf } = MEC;
  const amplia = (id, W, build) => { NIVELES[id].W = W; NIVELES[id].build = build; };
  const dispara = (g, o) => g.objs.push(Object.assign({ k: 'bala' }, o));
  const K = () => window.FOE_KIT;

  // =================================================================
  //  BRUMA · Aluxes en la niebla (el faro de Fresita)
  // =================================================================
  const luzBase = MEC.luzActual();        // el haz del faro (antes de sumar los espejos)
  // luz fuerte: el haz del faro, un espejo cargado o un destello (el farolito de siempre no les hace nada)
  const alumbrado = (g, x, y) => g.flareT > 0 || MEC.luzActual()(g, x, y);
  // nahual de niebla: en lo oscuro se acerca a pasitos; con luz se vuelve piedra (y se puede pisar)
  FOE.nahual = { beh: 'nahual', w: 12, h: 10, v: 0, spiky: e => !e.piedra };
  BEH.nahual = (e, g, d, toP) => {
    const luz = alumbrado(g, e.x, e.y - 5);
    if (luz && !e.piedra) ring(g, e.x, e.y - 5, '#e8e4d8', 14, .3);
    e.piedra = luz;
    if (e.vy !== 0 || !onGround(e)) { gravity(e, d); return; }
    if (e.piedra) return;
    const cerca = Math.abs(toP) < 150; if (cerca) e.dir = Math.sign(toP) || e.dir;
    walkStep(e, d, cerca ? 30 : 12);
  };
  // bejuco: cuelga del dosel; en lo oscuro baja de golpe cuando Itzel pasa abajo; la luz lo hace recogerse
  FOE.bejuco = { beh: 'bejuco', w: 8, h: 9, v: 0, sinSombra: false };
  BEH.bejuco = (e, g, d) => {
    const p = g.p, max = e.max || 92, lit = alumbrado(g, e.x, e.y - 4);
    e.len = e.len ?? 6;
    let quiere = 6;
    if (!lit && Math.abs(p.x - e.x) < 34 && p.y > e.hy) quiere = Math.min(max, p.y - 6 - e.hy);
    e.baja = quiere > e.len + 2; e.luz = lit;
    e.len += clamp(quiere - e.len, -(lit ? 160 : 70) * d, 220 * d);
    e.y = e.hy + e.len;
  };
  // espejo de obsidiana: el haz del faro rebota en él; cargado, sigue alumbrando unos segundos
  const LARGO_E = 150, ABRE_E = .26;
  OBJ.obsidiana = {
    make(g, en) { const x = tx(en.x) + 8, y = L.surfaceY(en.x + PAD, en.y ?? 0) * T; g.objs.push({ k: 'obsidiana', x, y, cy: y - 12, ang: en.ang ?? -.2, gira: en.gira || 0, carga: 0, t: 0 }); },
    step(o, g, dt) {
      o.t += dt; if (o.gira) o.ang = o.ang0 === undefined ? (o.ang0 = o.ang) : o.ang0 + Math.sin(o.t * .6) * o.gira;
      if (g.haz && luzBase(g, o.x, o.cy)) { if (o.carga < .2) ring(g, o.x, o.cy, '#e8d8ff', 18, .35); o.carga = 4; } else o.carga = Math.max(0, o.carga - dt);
    },
    draw(c, o, f) {
      const x = o.x, y = o.y, on = o.carga > 0, fin = Math.min(1, o.carga * 1.5);
      if (on) {
        c.save(); c.globalCompositeOperation = 'lighter';
        const gr = c.createRadialGradient(x, o.cy, 3, x, o.cy, LARGO_E); gr.addColorStop(0, `rgba(230,215,255,${.5 * fin})`); gr.addColorStop(1, 'rgba(230,215,255,0)');
        c.fillStyle = gr; c.beginPath(); c.moveTo(x, o.cy); c.arc(x, o.cy, LARGO_E, o.ang - ABRE_E, o.ang + ABRE_E); c.closePath(); c.fill(); c.restore();
      }
      // pedestal de piedra tallada
      c.fillStyle = '#3a3836'; c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x - 4, y - 5); c.lineTo(x + 4, y - 5); c.lineTo(x + 6, y); c.fill();
      c.fillStyle = '#5a5652'; c.fillRect(x - 4, y - 5, 8, 1); c.strokeStyle = '#1a1816'; c.lineWidth = .4; c.strokeRect(x - 4, y - 5, 8, 5);
      // la luna de obsidiana, inclinada hacia donde rebota
      c.save(); c.translate(x, o.cy); c.rotate(o.ang + Math.PI / 2);
      const g2 = c.createLinearGradient(-5, -7, 5, 7); g2.addColorStop(0, on ? '#8a7aa8' : '#3a3448'); g2.addColorStop(.5, '#0e0c14'); g2.addColorStop(1, on ? '#c8b8f0' : '#2a2436');
      c.fillStyle = g2; c.beginPath(); c.ellipse(0, 0, 5, 7.5, 0, 0, TAU); c.fill(); c.strokeStyle = '#b8a888'; c.lineWidth = .8; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = .5; c.beginPath(); c.arc(-1, -2, 3.6, Math.PI * 1.1, Math.PI * 1.5); c.stroke();
      c.restore();
      if (on) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x, o.cy, 10, '#d8c8ff', .5 * fin); c.restore(); }
    },
  };
  MEC.ponLuzExtra((g, x, y) => {
    for (const o of g.objs || []) {
      if (o.k !== 'obsidiana' || !(o.carga > 0)) continue;
      const dx = x - o.x, dy = y - o.cy, dd = Math.hypot(dx, dy); if (dd > LARGO_E || dd < 2) continue;
      let da = Math.atan2(dy, dx) - o.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) < ABRE_E + 8 / dd) return true;
    }
    return false;
  });
  amplia('bruma', 190, b => {
    // I · la niebla: las piedras solo están donde apunta el faro; el primer nahual
    b.g(0, 13).P(3).d('T', 8).d('r', 11);
    b.p(16, 10, 2).p(20, 9, 2).p(24, 10, 2).c(16, 25, 7);
    b.g(28, 46).e(33, undefined, 'alux').e(42, undefined, 'nahual').d('T', 30).d('r', 38);
    b.p(49, 9, 2).p(53, 7, 2).p(57, 9, 2).c(49, 58, 5);
    // II · nahuales y bejucos: hay que alumbrar al que se acerca y al que cuelga
    b.g(61, 92).e(66, undefined, 'nahual').e(73, 1, 'bejuco').blk(77, 9, 2, 2).e(82, undefined, 'nahual').e(88, 1, 'bejuco').c(70, 80, 7).d('T', 63).d('r', 85);
    // III · el espejo: carga su luz con el faro y alumbra el otro tramo mientras Fresita se ocupa de los bejucos
    b.g(95, 101).o('obsidiana', 99, 0, { ang: -.12 });
    b.p(104, 10, 2).p(108, 9, 2).p(112, 10, 2).p(116, 8, 2).p(120, 9, 2).c(104, 121, 6).e(110, 1, 'bejuco').e(118, 1, 'bejuco');
    // IV · todo junto hasta el cenote: nahuales, bejucos, un espejo que gira y la escalera de piedras
    b.g(124, 140).e(129, undefined, 'nahual').e(134, 1, 'bejuco').o('obsidiana', 139, 0, { ang: -.45, gira: .25 }).d('T', 126);
    b.p(143, 9, 2).p(147, 7, 2).p(151, 5, 2).isl(154, 160, 4).c(155, 159, 3).e(157, 3, 'alux');
    b.p(163, 6, 2).p(167, 8, 2).p(171, 10, 2).c(163, 172, 4);
    b.g(174, 189).e(178, undefined, 'nahual').h(176, 9).Gl(185).d('T', 182);
  });
  NIVELES.bruma.fauna = ['alux', 'nahual', 'bejuco', 'calavera'];
  NIVELES.bruma.lema = 'Piedras que solo existen en el haz del faro, nahuales que se vuelven piedra con la luz, bejucos que bajan en lo oscuro y espejos de obsidiana que rebotan la luz.';

  // =================================================================
  //  LOWPOLY · Elevadores de cristal (pilares de Fresita)
  // =================================================================
  // pájaro carpintero de cristal: si hay un pilar cerca se le pega y lo picotea hasta romperlo; si no, se lanza sobre Itzel
  FOE.carpintero = { beh: 'carpintero', w: 10, h: 9, v: 0 };
  BEH.carpintero = (e, g, d, toP) => {
    const p = g.p, pil = g.solids.filter(s => s.k === 'pillar' && !s.dead && Math.abs(s.x + 8 - e.x) < 130).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0];
    let tx2, ty2; e.pica = false;
    if (pil) { const lado = e.x < pil.x + 8 ? -1 : 1; tx2 = pil.x + 8 + lado * 11; ty2 = Math.max(pil.y + 10, pil.y + pil.h * .3); e.dir = -lado;
      if (Math.abs(e.x - tx2) < 3 && Math.abs(e.y - ty2) < 3) { e.pica = true; pil.life = Math.min(pil.life, (pil.life || 6)) - d * 1.4; if (Math.sin(e.t * 30) > .9) spawn(g, 2, pil.x + 8 - lado * 8, e.y - 3, { v: 40, life: .3, s: 1.2, k: 'dust', cols: ['#bff4ff', '#7fd8f0'] }); } }
    else if (e.ataca > 0) { e.ataca -= d; tx2 = e.tx2; ty2 = e.ty2; if (Math.hypot(e.x - tx2, e.y - ty2) < 6) e.ataca = 0; }
    else { e.cd = (e.cd ?? 2) - d; tx2 = e.hx + Math.sin(e.t * .9) * 26; ty2 = e.hy + Math.sin(e.t * 2.1) * 5; if (e.cd <= 0 && Math.abs(toP) < 90 && p.y > e.y) { e.ataca = 1.2; e.tx2 = p.x; e.ty2 = p.y - 5; e.cd = 3; } }
    const sp = e.ataca > 0 ? 120 : 70; e.x += clamp(tx2 - e.x, -sp * d, sp * d); e.y += clamp(ty2 - e.y, -sp * d, sp * d); if (!pil) e.dir = tx2 > e.x + 1 ? 1 : tx2 < e.x - 1 ? -1 : e.dir;
  };
  // geoda: un cristal que rebota en diagonal contra paredes, piso y los pilares de Fresita (con ellos se le cambia el camino)
  FOE.geoda = { beh: 'geoda', w: 10, h: 10, v: 0 };
  BEH.geoda = (e, g, d) => {
    e.vx = e.vx || 52 * (e.dir || 1); e.vy2 = e.vy2 || -52; e.giro = (e.giro || 0) + d * 3 * Math.sign(e.vx);
    const nx = e.x + e.vx * d, ny = e.y + e.vy2 * d, cy = ny - 5;
    if (SOLID(nx + Math.sign(e.vx) * 5, cy) || Math.abs(nx - e.hx) > (e.rango || 110)) { e.vx = -e.vx; e.choque = .15; } else e.x = nx;
    if (SOLID(e.x, cy + Math.sign(e.vy2) * 5) || ny < 16 || ny > e.hy + 20) { e.vy2 = -e.vy2; e.choque = .15; } else e.y = ny;
    e.dir = Math.sign(e.vx); e.choque = Math.max(0, (e.choque || 0) - d);
  };
  // prisma: plataforma de tres caras que da media vuelta cada tanto (avisa temblando); mientras gira, no se puede pisar
  PK.prisma = (pl, g, d, dt) => {
    const per = pl.per || 2.8, u = ((pl.t + (pl.off || 0)) % (per + .6));
    pl.gira = u > per ? (u - per) / .6 : 0; pl.avisa = u > per - .5 && u <= per; pl.on = !pl.gira; pl.verSiempre = true;
  };
  LOOK.prisma = (c, pl, f) => {
    const x = pl.x, y = pl.y, w = pl.w, a = (pl.gira || 0) * Math.PI * 2 / 3, sh = pl.avisa ? (Math.random() - .5) * 1.2 : 0, cx = x + w / 2 + sh, cy = y + 4, R = 7;
    const pts = [0, 1, 2].map(k => { const an = -Math.PI / 2 + a + k * Math.PI * 2 / 3 + Math.PI / 3; return [Math.cos(an) * R, Math.sin(an) * R]; });
    const cols = ['#bff4ff', '#7fd8f0', '#3a8fc0'];
    // cuerpo alargado del prisma: cada cara con su luz
    for (let k = 0; k < 3; k++) {
      const p1 = pts[k], p2 = pts[(k + 1) % 3], mx = (p1[1] + p2[1]) / 2;
      if (mx > 3.5 && !pl.gira) continue;
      c.fillStyle = cols[(k + Math.round((pl.gira || 0) * 3)) % 3]; c.beginPath(); c.moveTo(x + sh, cy + p1[1]); c.lineTo(x + w + sh, cy + p1[1]); c.lineTo(x + w + sh, cy + p2[1]); c.lineTo(x + sh, cy + p2[1]); c.closePath(); c.fill();
    }
    c.fillStyle = '#e8fbff'; c.beginPath(); pts.forEach(([px, py], i) => i ? c.lineTo(x + w + sh + px * .35, cy + py) : c.moveTo(x + w + sh + px * .35, cy + py)); c.closePath(); c.fill();
    c.strokeStyle = '#2d2a4a'; c.lineWidth = .6; c.strokeRect(x + sh, cy - R * .5, w, R); c.beginPath(); c.moveTo(x + sh, cy); c.lineTo(x + w + sh, cy); c.stroke();
    if (!pl.gira) { c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(x + 2 + sh, y, w - 4, 1); }
  };
  amplia('lowpoly', 190, b => {
    // I · elevadores de cristal y el primer carpintero
    b.g(0, 13).P(3).d('T', 7).d('f', 11);
    b.p(16, 8, 3).g(20, 32, 5).c(21, 31, 3).d('T', 26);
    b.g(33, 50).e(38, undefined, 'jabali').e(46, 6, 'carpintero').d('f', 35).d('T', 48);
    // II · el muro: un pilar para subir… y un carpintero que lo picotea
    b.g(51, 53).g(54, 66, 5).c(55, 65, 3).d('T', 60);
    b.g(67, 90).blk(74, 6, 2, 5).e(70, undefined, 'escarabajo').e(80, 5, 'carpintero').e(86, undefined, 'jabali').c(76, 79, 4).d('f', 69);
    // III · prismas que dan la vuelta y geodas que rebotan (los pilares les cambian el camino)
    b.p(93, 9, 3, { k: 'prisma', look: 'prisma', per: 2.6 }).p(98, 8, 3, { k: 'prisma', look: 'prisma', per: 2.6, off: 1.3 }).p(103, 9, 3, { k: 'prisma', look: 'prisma', per: 2.6 }).c(93, 105, 6);
    b.g(107, 124).e(112, 8, 'geoda').e(120, 7, 'geoda').d('T', 110);
    b.p(126, 10, 3).g(129, 138, 6).c(129, 137, 4).d('f', 133);
    // IV · todo junto hasta la cima
    b.p(141, 7, 3, { amp: 32, sp: 1.1 }).p(147, 9, 3, { k: 'prisma', look: 'prisma', per: 2.4 }).p(152, 8, 3, { amp: 30, sp: .9, ph: 1.5 }).c(141, 155, 5).e(149, 5, 'geoda');
    b.g(157, 189).blk(165, 6, 2, 5).e(161, undefined, 'jabali').e(170, 5, 'carpintero').e(177, 8, 'geoda').h(173, 9).Gl(184).d('T', 159);
  });
  NIVELES.lowpoly.fauna = ['jabali', 'carpintero', 'geoda', 'escarabajo'];
  NIVELES.lowpoly.lema = 'Elevadores de cristal, prismas que dan la vuelta, carpinteros que picotean los pilares de Fresita y geodas que rebotan.';

  // =================================================================
  //  CÓDICE · El glifo de Edzná (glifos que se prenden y apagan)
  // =================================================================
  const grupo = (g, grp) => g.solids.filter(q => q.k === 'glyph' && q.grp === grp);
  function voltea(g, grp, on) {
    const qs = grupo(g, grp); if (!qs.length) return false;
    if (on === undefined) on = !qs[0].on;
    if (on && qs.some(q => !freeOf(g, q.x, q.y, q.w, q.h))) return false;   // no se prende encima de Itzel
    for (const q of qs) q.on = on; const q = qs[0]; ring(g, q.x + q.w / 2, q.y + q.h / 2, '#d79a3d', 24); return true;
  }
  // escribano (mono del códice): cada tanto se para y repinta el glifo más cercano (lo prende o lo apaga)
  FOE.escribano = { beh: 'escribano', w: 10, h: 12, v: 18 };
  BEH.escribano = (e, g, d) => {
    if (e.vy !== 0 || !onGround(e)) { gravity(e, d); return; }
    e.cd = (e.cd ?? 3.5) - d;
    if (e.pinta > 0) { e.pinta -= d; if (e.pinta <= 0 && e.blanco !== undefined) { voltea(g, e.blanco); e.cd = 4; e.blanco = undefined; } return; }
    if (e.cd <= 0) {
      let mejor = null, md = 130; for (const q of g.solids) if (q.k === 'glyph') { const dd = Math.abs(q.x + q.w / 2 - e.x); if (dd < md) { md = dd; mejor = q; } }
      if (mejor) { e.blanco = mejor.grp; e.bx = mejor.x + mejor.w / 2; e.by = mejor.y + mejor.h / 2; e.pinta = .9; e.dir = Math.sign(e.bx - e.x) || e.dir; return; }
      e.cd = 2;
    }
    walkStep(e, d, e.v);
  };
  // guerrero de piedra: su escudo es de un grupo de glifos; mientras esos glifos estén prendidos no se le puede caer encima
  FOE.guerrero = { beh: 'guerrero', w: 12, h: 15, v: 14, spiky: e => e.escudo };
  BEH.guerrero = (e, g, d) => {
    e.escudo = grupo(g, e.grp).some(q => q.on);
    if (e.vy !== 0 || !onGround(e)) { gravity(e, d); return; }
    walkStep(e, d, e.escudo ? e.v : e.v * .5);
  };
  OBJ.guerrero = { make(g, en) { const x = tx(en.x) + T / 2, y = L.surfaceY(en.x + PAD, 0) * T; g.foes.push(Object.assign(MEC.mkFoe('guerrero', x, y), { grp: en.grp })); } };
  // estela: un monumento con un glifo que prende y apaga su grupo cada tanto, al ritmo de su calendario
  OBJ.estela = {
    make(g, en) { const x = tx(en.x) + 8, y = L.surfaceY(en.x + PAD, en.y ?? 0) * T; g.objs.push({ k: 'estela', x, y, grp: en.grp, per: en.per || 3, t: en.off || 0 }); },
    step(o, g, dt) {
      o.t += dt; const n = Math.floor(o.t / o.per);
      if (o.n === undefined) o.n = n;
      if (n !== o.n && voltea(g, o.grp)) o.n = n;            // si Itzel está donde se prendería, espera
      o.prendido = grupo(g, o.grp).some(q => q.on);
    },
    draw(c, o, f) {
      const x = o.x, y = o.y, u = (o.t % o.per) / o.per, on = o.prendido;
      c.fillStyle = '#b8a07a'; c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x - 5, y - 24); c.quadraticCurveTo(x, y - 27, x + 5, y - 24); c.lineTo(x + 6, y); c.closePath(); c.fill();
      c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.moveTo(x + 2, y); c.lineTo(x + 2, y - 25); c.quadraticCurveTo(x + 4, y - 25, x + 5, y - 24); c.lineTo(x + 6, y); c.fill();
      c.strokeStyle = '#1c1612'; c.lineWidth = .6; c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x - 5, y - 24); c.quadraticCurveTo(x, y - 27, x + 5, y - 24); c.lineTo(x + 6, y); c.stroke();
      // el glifo del día
      c.save(); if (on) { c.globalCompositeOperation = 'lighter'; glowDot(c, x, y - 16, 8, '#d79a3d', .5); c.globalCompositeOperation = 'source-over'; }
      c.strokeStyle = on ? '#b0412e' : '#5a4a3a'; c.lineWidth = .8; c.strokeRect(x - 3, y - 19, 6, 6); c.beginPath(); c.arc(x, y - 16, 1.6, 0, TAU); c.moveTo(x - 3, y - 13); c.lineTo(x + 3, y - 19); c.stroke(); c.restore();
      for (let k = 0; k < 3; k++) { c.fillStyle = '#5a4a3a'; c.fillRect(x - 3 + k * 2.2, y - 9, 1.4, 1.4); }
      // el calendario: un aro que se llena antes de cambiar
      c.strokeStyle = 'rgba(176,65,46,.85)'; c.lineWidth = 1; c.beginPath(); c.arc(x, y - 31, 3, -Math.PI / 2, -Math.PI / 2 + u * TAU); c.stroke();
      c.strokeStyle = 'rgba(28,22,18,.4)'; c.lineWidth = .4; c.beginPath(); c.arc(x, y - 31, 3, 0, TAU); c.stroke();
    },
  };
  amplia('codex', 190, b => {
    // I · losas que se hunden y la primera estela: su puente de glifos va y viene solo
    b.g(0, 13).P(3).d('T', 8).d('f', 11);
    b.p(15, 9, 2).p(19, 8, 2).p(23, 9, 2).c(15, 24, 6);
    b.g(26, 44).e(32, undefined, 'jaguar').o('estela', 41, 0, { grp: 3, per: 3 }).d('T', 29);
    b.s('glyph', 45, 11, 6, 1, { grp: 3 }).c(45, 50, 9);
    // II · el escribano repinta los glifos: el puente y el muro cambian cuando él quiere
    b.g(51, 62).e(57, undefined, 'escribano').d('r', 54);
    b.s('glyph', 63, 11, 7, 1, { grp: 4, on: false }).c(63, 69, 9);
    b.g(70, 90).e(75, undefined, 'culebra').s('glyph', 81, 5, 2, 6, { grp: 6 }).e(86, undefined, 'escribano').d('T', 72).c(83, 89, 8);
    // III · los guerreros: el muro y su escudo son del mismo grupo; abrir el paso los deja sin defensa
    b.g(91, 118).o('guerrero', 96, 0, { grp: 7 }).s('glyph', 100, 8, 3, 1, { grp: 7 }).s('glyph', 104, 6, 3, 1, { grp: 7 }).c(104, 106, 5);
    b.s('glyph', 111, 5, 2, 6, { grp: 8 }).o('guerrero', 115, 0, { grp: 8 }).d('f', 93);
    b.p(121, 9, 2).p(125, 7, 2).p(129, 9, 2).c(121, 130, 6);
    // IV · la plaza: estela con su puente, un escribano y el último guerrero frente a la puerta
    b.g(132, 150).o('estela', 136, 0, { grp: 10, per: 2.4 }).s('glyph', 140, 5, 2, 6, { grp: 9 }).e(145, undefined, 'escribano').d('T', 134);
    b.s('glyph', 151, 11, 8, 1, { grp: 10, on: false }).c(151, 158, 9);
    b.g(159, 189).o('guerrero', 165, 0, { grp: 11 }).s('glyph', 170, 5, 2, 6, { grp: 11 }).e(176, undefined, 'jaguar').h(173, 9).Gl(184).d('T', 180);
  });
  NIVELES.codex.fauna = ['jaguar', 'escribano', 'guerrero', 'culebra'];
  NIVELES.codex.lema = 'Losas que se hunden, estelas que prenden sus glifos al ritmo del calendario, monos escribanos que los repintan y guerreros con escudo de glifo.';

  // =================================================================
  //  ÓLEO · Remolinos de la noche (remolino que avienta a Itzel)
  // =================================================================
  // girasol: voltea la cara hacia Itzel y escupe semillas en arco (se echa para atrás antes)
  FOE.girasol = { beh: 'girasol', w: 12, h: 20, v: 0 };
  BEH.girasol = (e, g, d, toP) => {
    const p = g.p; e.mira = Math.atan2(p.y - 12 - (e.y - 17), (p.x - e.x)); e.dir = Math.sign(toP) || e.dir;
    e.tt = (e.tt ?? 1.5) - d; e.carga = e.tt < .6 ? 1 - e.tt / .6 : 0;
    if (e.tt <= 0) {
      e.tt = 2.6;
      if (Math.abs(toP) < 170) { const tt = .85, sx = e.x + e.dir * 5, sy = e.y - 18; dispara(g, { x: sx, y: sy, vx: (p.x - sx) / tt, vy: ((p.y - 8 - sy) - .5 * 380 * tt * tt) / tt, grav: 380, r: 1.8, dib: 'semilla', vida: 3, polvo: ['#3a2a1a', '#f0c030'] }); }
    }
  };
  OBJ.bala.dibujos.semilla = (c, o) => { c.save(); c.translate(o.x, o.y); c.rotate(Math.atan2(o.vy, o.vx)); c.fillStyle = '#2a1e14'; c.beginPath(); c.ellipse(0, 0, 2.4, 1.4, 0, 0, TAU); c.fill(); c.strokeStyle = '#f0e0b0'; c.lineWidth = .4; c.beginPath(); c.moveTo(-1.6, 0); c.lineTo(1.6, 0); c.stroke(); c.restore(); };
  // cuervos del trigal: vuelan en parvada como una ola; un remolino de Fresita los avienta lejos
  FOE.cuervo = { beh: 'cuervo', w: 10, h: 7, v: 0 };
  BEH.cuervo = (e, g, d) => {
    const a = e.t * .55 + e.hx * .01;
    const nx = e.hx + Math.sin(a) * 80, ny = e.hy + Math.sin(a * 2.2 + e.hx * .05) * 12;
    e.dir = nx >= e.x ? 1 : -1; e.x = nx; e.y = ny;
    for (const z of g.zones) if (z.k === 'orbita' && !z.dead && Math.hypot(z.cx - e.x, z.cy - (e.y - 4)) < z.r + 6) { e.st = 'gone'; e.tt = 0; spawn(g, 10, e.x, e.y - 4, { v: 70, life: .5, s: 1.6, k: 'spark', cols: ['#1a1a2a', '#f8e27a', '#5a8ad8'] }); }
  };
  // luna columpio: una luna creciente colgada de una estrella que se mece; se sube uno y lo lleva
  PK.luna = (pl, g, d) => {
    const Lr = pl.L || 60, A = pl.A || .7, ang = Math.sin(pl.t * (pl.sp || 1.3) + (pl.ph || 0)) * A;
    pl.px = pl.x0 + pl.w / 2; pl.py = pl.y0 - Lr; pl.ang = ang;
    pl.x = pl.px + Math.sin(ang) * Lr - pl.w / 2; pl.y = pl.py + Math.cos(ang) * Lr;
  };
  LOOK.luna = (c, pl, f) => {
    const cx = pl.x + pl.w / 2, y = pl.y;
    c.strokeStyle = 'rgba(248,226,122,.7)'; c.lineWidth = .6; c.setLineDash([1.6, 1.2]); c.beginPath(); c.moveTo(pl.px, pl.py); c.lineTo(cx, y - 4); c.stroke(); c.setLineDash([]);
    // la estrella que la sostiene, con su remolino
    c.save(); c.translate(pl.px, pl.py); c.rotate(f.t * .8); c.strokeStyle = 'rgba(248,226,122,.5)'; c.lineWidth = .8; c.beginPath(); c.arc(0, 0, 5, 0, 4.4); c.stroke(); c.restore();
    c.fillStyle = '#f8e27a'; c.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU - Math.PI / 2, r = k % 2 ? 1.2 : 3; c.lineTo(pl.px + Math.cos(a) * r, pl.py + Math.sin(a) * r); } c.closePath(); c.fill();
    // la luna creciente (la parte de arriba es plana para pararse)
    const w = pl.w, hw = w / 2, hd = Math.max(7, w * .22);
    c.save(); c.translate(cx, y); c.rotate(pl.ang * .5);
    c.fillStyle = '#f8e27a'; c.beginPath(); c.moveTo(-hw - 3, -1); c.quadraticCurveTo(-hw * .2, hd * 1.5, hw + 3, -1); c.quadraticCurveTo(hw * .3, hd * .6, -hw - 3, -1); c.closePath(); c.fill();
    c.fillStyle = 'rgba(232,160,40,.8)'; c.beginPath(); c.moveTo(-hw * .2, hd * .62); c.quadraticCurveTo(hw * .3, hd * .55, hw + 3, -1); c.quadraticCurveTo(hw * .2, hd * 1.15, -hw * .2, hd * .62); c.closePath(); c.fill();
    c.strokeStyle = '#fff6c8'; c.lineWidth = .7; c.lineCap = 'round'; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-hw + k * 4, .4 + k * 1.4); c.quadraticCurveTo(-hw * .2 + k * 3, hd * (1 - k * .15), hw - k * 5, .8 + k * .8); c.stroke(); }
    c.strokeStyle = '#14203f'; c.lineWidth = .6; c.beginPath(); c.moveTo(-hw - 3, -1); c.quadraticCurveTo(-hw * .2, hd * 1.5, hw + 3, -1); c.stroke();
    c.fillStyle = '#fff6c8'; c.fillRect(-hw, -1.4, w, 1.4);
    c.fillStyle = '#14203f'; c.beginPath(); c.arc(-hw * .45, hd * .45, .6, 0, TAU); c.fill();
    c.restore();
  };
  amplia('oleo', 190, b => {
    const LUNA = (L, o = {}) => Object.assign({ k: 'luna', look: 'luna', L, A: .7, sp: 1.3 }, o);
    // I · remolinos pintados y el primer girasol
    b.g(0, 13).P(3).d('T', 8);
    b.z(15, 18, 3, 12).isl(20, 26, 5).c(20, 26, 4);
    b.g(28, 46).e(34, undefined, 'girasol').e(41, 4, 'buho').d('T', 30).d('f', 44);
    b.p(49, 7, 3).p(56, 7, 3, { ph: 3.14 }).c(48, 59, 4);
    // II · las lunas columpio sobre el barranco
    b.g(61, 72).e(67, undefined, 'girasol').d('f', 63);
    b.p(76, 9, 4, LUNA(60)).p(84, 9, 4, LUNA(60, { ph: 1.6 })).c(75, 90, 7);
    b.g(92, 108).e(97, 3, 'cuervo').e(99, 3, 'cuervo').e(101, 3, 'cuervo').e(105, undefined, 'girasol').d('T', 94);
    // III · el trigal de noche: un remolino natural, una luna y una parvada que se cruza
    b.g(109, 112).z(116, 118, 2, 12).p(122, 8, 4, LUNA(56, { A: .8 })).c(114, 125, 5);
    b.g(127, 145).e(131, undefined, 'girasol').e(137, 2, 'cuervo').e(139, 2, 'cuervo').e(141, 2, 'cuervo').d('T', 134);
    // IV · hasta la iglesia del pueblo: remolinos de la noche, una luna larga y el último girasol
    b.p(148, 7, 3).p(155, 6, 3, { ph: 2 }).p(162, 9, 4, LUNA(64, { A: .85, sp: 1.15 })).c(147, 166, 5);
    b.g(168, 189).e(173, undefined, 'girasol').e(179, 4, 'buho').h(176, 9).Gl(184).d('T', 170);
  });
  NIVELES.oleo.fauna = ['buho', 'girasol', 'cuervo', 'murcielago'];
  NIVELES.oleo.lema = 'Remolinos que avientan a Itzel, lunas columpio colgadas de las estrellas, girasoles que escupen semillas y cuervos del trigal.';
})();
