'use strict';
// =====================================================================
//  MUNDOS AMPLIADOS
//  Cada mundo crece a cuatro actos (enseña la mecánica, la complica con
//  un enemigo nuevo, la mezcla con su plataforma y al final la exige
//  toda) y gana enemigos propios dibujados en su arte, que juegan con su
//  mecánica. Los enemigos van separados, nunca amontonados.
// =====================================================================
(function () {
  const { LOOK, PK, BEH, OBJ, POW, FOE, FD, mkPlat, walkStep, ring, tx, tl } = MEC;
  const TAU2 = Math.PI * 2;
  const amplia = (id, W, build) => { NIVELES[id].W = W; NIVELES[id].build = build; };

  // proyectil genérico: lo para cualquier cosa sólida (también los bloques de Fresita); lastima a Itzel
  OBJ.bala = {
    step(o, g, dt) {
      o.t = (o.t || 0) + dt; o.vy += (o.grav || 0) * dt; o.x += o.vx * dt; o.y += o.vy * dt;
      if (o.t > (o.vida || 6) || o.y > VH + 20) { o.dead = true; return; }
      if (SOLID(o.x + Math.sign(o.vx) * (o.r || 2), o.y)) { o.dead = true; spawn(g, 8, o.x, o.y, { v: 50, life: .4, s: 1.6, k: 'dust', cols: o.polvo || ['#ffffff', '#9badb7'] }); return; }
      const p = g.p; if (!MEC.protegePisoton(g, o) && p.vis && Math.abs(p.x - o.x) < (o.r || 2) + 4 && o.y > p.y - p.h - (o.r || 2) && o.y < p.y + (o.r || 2)) { o.dead = true; MEC.hurt(g, o.vx > 0 ? 1 : -1); }
    },
    draw(c, o, f) { if (OBJ.bala.dibujos[o.dib]) OBJ.bala.dibujos[o.dib](c, o, f); else { c.fillStyle = '#222'; c.beginPath(); c.arc(o.x, o.y, o.r || 2, 0, TAU2); c.fill(); } },
    dibujos: {},
  };
  const dispara = (g, o) => g.objs.push(Object.assign({ k: 'bala' }, o));

  // =================================================================
  //  PIXEL · La muralla de pixel (Campeche amurallado, 16 bits)
  // =================================================================
  const PX = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  const OUT = '#222034';
  // cañón del baluarte: dispara balas de hierro en línea recta; los bloques de Fresita las paran
  OBJ.canon = {
    make(g, en) { const x = tx(en.x) + 8; g.objs.push({ k: 'canon', x, y: L.surfaceY(en.x + PAD, en.y ?? 0) * T, dir: en.dir || -1, per: en.per || 2.6, t: en.off || 0, fogon: 0 }); },
    step(o, g, dt) {
      o.t += dt; o.fogon = Math.max(0, o.fogon - dt);
      if (Math.abs(g.p.x - o.x) > 260) return;          // solo dispara si Itzel anda cerca
      if (o.t >= o.per) { o.t = 0; o.fogon = .25; dispara(g, { x: o.x + o.dir * 10, y: o.y - 7, vx: o.dir * 110, vy: 0, r: 2.6, dib: 'balaPixel', polvo: ['#9badb7', '#cbdbfc', OUT] }); spawn(g, 6, o.x + o.dir * 11, o.y - 7, { v: 40, life: .4, s: 1.4, k: 'dust', cols: ['#cbdbfc', '#9badb7'] }); }
    },
    draw(c, o, f) {
      const x = Math.round(o.x), y = Math.round(o.y), d = o.dir, aviso = o.per - o.t < .5 && Math.abs(f.g.p.x - o.x) <= 260;
      // cureña de madera con ruedas
      PX(c, x - 7, y - 6, 14, 4, OUT); PX(c, x - 6, y - 5, 12, 2, '#8f563b');
      for (const k of [-4, 3]) { PX(c, x + k - 2, y - 4, 5, 4, OUT); PX(c, x + k - 1, y - 3, 3, 2, '#663931'); }
      // tubo de hierro (con su boca hacia donde dispara)
      const bx = d > 0 ? x - 4 : x - 9; PX(c, bx - 1, y - 11, 14, 6, OUT); PX(c, bx, y - 10, 12, 4, '#595652'); PX(c, bx, y - 10, 12, 1, '#9badb7');
      PX(c, d > 0 ? bx + 11 : bx - 2, y - 12, 3, 8, OUT);
      if (aviso && Math.floor(f.t * 10) % 2) PX(c, x - 1, y - 14, 2, 2, '#fbf236');                     // la mecha prendida
      if (o.fogon > 0) { PX(c, x + d * 13 - 2, y - 10, 4, 4, '#fbf236'); PX(c, x + d * 15 - 1, y - 9, 3, 2, '#df7126'); }
    },
  };
  OBJ.bala.dibujos.balaPixel = (c, o) => { const x = Math.round(o.x), y = Math.round(o.y); PX(c, x - 3, y - 2, 6, 4, OUT); PX(c, x - 2, y - 3, 4, 6, OUT); PX(c, x - 2, y - 2, 4, 4, '#595652'); PX(c, x - 1, y - 2, 1, 1, '#cbdbfc'); };
  // centinela de la muralla: patrulla; si Itzel se le pone enfrente, levanta la lanza un momento (ahí no se le puede caer encima)
  FOE.centinela = { beh: 'centinela', w: 10, h: 15, v: 18, spiky: e => e.lanza > 0 };
  BEH.centinela = (e, g, d, toP) => {
    const p = g.p; e.cd = Math.max(0, (e.cd || 0) - d); e.lanza = Math.max(0, (e.lanza || 0) - d);
    if (e.lanza > 0) return;
    if (!e.cd && Math.abs(toP) < 60 && Math.abs(p.y - e.y) < 20 && Math.sign(toP) === e.dir) { e.lanza = .9; e.cd = 2.2; return; }
    if (!walkStep(e, d, e.v)) e.cd = Math.max(e.cd, .4);
  };
  FD.centinela = (c, e, t) => {
    const a = e.lanza > 0, paso = Math.floor(e.anim * 6) % 2;
    PX(c, -4, -2, 3, 2, OUT); PX(c, 1, -2 - paso, 3, 2, OUT);                                    // botas
    PX(c, -4, -9, 8, 7, OUT); PX(c, -3, -8, 6, 5, '#d95763'); PX(c, -3, -6, 6, 1, '#cbdbfc');     // casaca roja con banda
    PX(c, -3, -13, 6, 4, OUT); PX(c, -2, -12, 4, 3, '#eec39a'); PX(c, 0, -11, 1, 1, OUT);          // cara
    PX(c, -5, -15, 10, 2, OUT); PX(c, -3, -17, 6, 3, OUT); PX(c, -2, -16, 4, 2, '#9badb7'); PX(c, -4, -14, 8, 1, '#9badb7'); // morrión
    if (a) { PX(c, 3, -22, 2, 14, '#8f563b'); PX(c, 2, -25, 4, 3, '#cbdbfc'); PX(c, 3, -26, 2, 1, '#cbdbfc'); }                 // lanza arriba
    else { PX(c, 3, -10, 9, 2, '#8f563b'); PX(c, 12, -11, 3, 4, '#cbdbfc'); }                                                     // lanza al frente
  };
  // gaviota del malecón: planea y se lanza en picada
  FOE.gaviota = { beh: 'swoop', w: 12, h: 8, v: 0, high: true };
  FD.gaviota = (c, e, t) => {
    const al = Math.floor(t * 8 + e.anim) % 2, pic = e.st === 'dive';
    PX(c, -5, -5, 10, 4, OUT); PX(c, -4, -4, 8, 2, '#ffffff'); PX(c, 4, -4, 3, 1, '#fbf236'); PX(c, 3, -5, 1, 1, OUT);
    if (pic) { PX(c, -7, -8, 5, 2, OUT); PX(c, -6, -7, 3, 1, '#9badb7'); }
    else if (al) { PX(c, -3, -9, 6, 4, OUT); PX(c, -2, -8, 4, 3, '#cbdbfc'); PX(c, -2, -8, 4, 1, '#595652'); }
    else { PX(c, -3, -2, 6, 3, OUT); PX(c, -2, -2, 4, 2, '#cbdbfc'); }
    PX(c, -7, -4, 2, 2, OUT);
  };
  amplia('pixel', 192, b => {
    // I · la playa: ladrillos que se caen y los primeros bloques
    b.g(0, 13).P(3).d('T', 7).d('f', 10).d('r', 12);
    b.p(15, 10, 2).p(18, 9, 2).p(21, 10, 2).c(15, 23, 7);
    b.g(25, 42).blk(34, 10, 2, 1).e(30, undefined, 'cangrejo').d('f', 27).d('T', 41).c(36, 40, 8);
    // II · el baluarte: hay que subir con bloques; el cañón barre el adarve y el centinela lo cuida
    b.g(43, 46).g(47, 74, 5).c(48, 54, 3).d('T', 52).e(63, 5, 'centinela').o('canon', 73, 0, { dir: -1, per: 2.6 });
    b.g(75, 96).e(85, 5, 'gaviota').e(93, undefined, 'cangrejo').d('f', 79).d('r', 90).c(80, 84, 8);
    // III · la torre: escalones de piedra, ladrillos flojos y un muro que solo se sube con bloques
    b.g(97, 121).blk(103, 8, 3, 3).blk(109, 5, 3, 6).blk(115, 2, 4, 9).c(115, 118, 0).d('T', 99);
    b.p(124, 7, 2).p(128, 8, 2).p(132, 7, 2).c(124, 133, 5);
    b.g(135, 147).blk(144, 4, 2, 7).e(139, undefined, 'centinela').d('f', 136);
    // IV · el puente que se desmorona bajo el fuego del baluarte de enfrente
    b.p(149, 9, 3).p(153, 9, 3).p(157, 9, 3).p(161, 9, 3).p(165, 9, 3).c(150, 167, 7).e(158, 4, 'gaviota');
    b.g(170, 175, 9).o('canon', 172, 0, { dir: -1, per: 2.2, off: 1 }).g(176, 191).e(181, undefined, 'tortuga').h(178, 8).Gl(187).d('T', 184);
  });
  NIVELES.pixel.fauna = ['cangrejo', 'centinela', 'gaviota', 'tortuga'];
  NIVELES.pixel.lema = 'Ladrillos que se desmoronan, cañones en los baluartes y centinelas con lanza.';

  // ¿hay una columna de viento de Fresita en este punto?
  const enViento = (g, x, y) => g.zones.some(z => z.k === 'column' && x > z.x0 && x < z.x1 && y > z.y0 - 10 && y < z.y1 + 4);

  // =================================================================
  //  OCASO · Hamacas al atardecer (siluetas contra el sol)
  // =================================================================
  const SIL = '#12081a', BORDE = '#ff9a70';
  // zancudos: un enjambre que no se puede pisar (son chiquitos); el viento de Fresita se los lleva
  FOE.zancudo = { beh: 'zancudo', w: 14, h: 10, v: 0, spiky: () => true };
  BEH.zancudo = (e, g, d, toP, near) => {
    const p = g.p;
    if (enViento(g, e.x, e.y - 5)) { e.st = 'gone'; e.tt = 0; spawn(g, 8, e.x, e.y - 5, { v: 60, life: .6, s: 1.2, k: 'dust', cols: [SIL, BORDE], g: -120 }); return; }
    const sigue = near && Math.abs(toP) < 110;
    const tx2 = sigue ? p.x : e.hx + Math.sin(e.t * .8) * 20, ty2 = sigue ? p.y - 10 : e.hy + Math.sin(e.t * 1.7) * 6;
    e.x += clamp(tx2 - e.x, -26 * d, 26 * d); e.y += clamp(ty2 - e.y, -20 * d, 20 * d); e.dir = tx2 > e.x ? 1 : -1;
  };
  FD.zancudo = (c, e, t) => {
    for (let k = 0; k < 4; k++) {
      const a = t * 9 + k * 2.1, x = Math.cos(a) * 5 + Math.sin(t * 3 + k) * 2, y = -5 + Math.sin(a * 1.3) * 3.5;
      c.fillStyle = SIL; c.beginPath(); c.ellipse(x, y, 1.6, 1, 0, 0, TAU2); c.fill();
      c.strokeStyle = 'rgba(255,154,112,.55)'; c.lineWidth = .4; c.beginPath(); c.ellipse(x - .4, y - 1.2, 1.3, .6, Math.sin(t * 60 + k), 0, TAU2); c.stroke();
      c.strokeStyle = SIL; c.beginPath(); c.moveTo(x + 1.4, y); c.lineTo(x + 3, y + .6); c.stroke();
    }
  };
  // garza: parada en una pata junto al agua; si Itzel se acerca, estira el cuello y pica
  FOE.garza = { beh: 'strike', w: 10, h: 22, v: 10 };
  FD.garza = (c, e, t) => {
    const pica = e.st === 'lunge', cue = pica ? 9 : 0;
    c.strokeStyle = SIL; c.lineWidth = .9; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -9); c.moveTo(-1, -5); c.lineTo(-3, -8); c.stroke();     // la pata y la otra doblada
    c.fillStyle = SIL; c.beginPath(); c.ellipse(-1, -12, 6, 3.6, -.2, 0, TAU2); c.fill();
    c.beginPath(); c.moveTo(3, -13); c.quadraticCurveTo(4 + cue * .3, -19, 2 + cue * .6, -22 + cue * .3); c.lineWidth = 1.4; c.strokeStyle = SIL; c.stroke();
    c.beginPath(); c.arc(2 + cue * .6, -22.5 + cue * .3, 1.8, 0, TAU2); c.fill();
    c.beginPath(); c.moveTo(3.6 + cue * .6, -22.6 + cue * .3); c.lineTo(9 + cue, -21.5 + cue * .5); c.lineTo(3.6 + cue * .6, -21.6 + cue * .3); c.fill();
    c.strokeStyle = BORDE; c.lineWidth = .4; c.beginPath(); c.ellipse(-1, -12.4, 6, 3.6, -.2, Math.PI * 1.1, Math.PI * 1.7); c.stroke();
  };
  // papalote: un papalote amarrado que flota en su lugar; con el viento de Fresita sube (y Itzel con él)
  PK.papalote = (pl, g, d) => {
    const sube = enViento(g, pl.x + pl.w / 2, pl.y), techo = pl.y0 - (pl.alto || 80);
    pl.vyp = (pl.vyp || 0) + ((sube ? -60 : 18) - (pl.vyp || 0)) * Math.min(1, d * 3);
    pl.y = clamp(pl.y + pl.vyp * d, techo, pl.y0); pl.x = pl.x0 + Math.sin(pl.t * 1.3) * 3;
  };
  LOOK.papalote = (c, pl, f) => {
    const x = pl.x, y = pl.y, w = pl.w, cx = x + w / 2, t = f.t;
    // el hilo hasta el suelo, el papalote de carrizo y papel de china y su cola de moños
    c.strokeStyle = 'rgba(18,8,26,.6)'; c.lineWidth = .4; c.beginPath(); c.moveTo(cx, y + 4); c.quadraticCurveTo(cx - 10, (y + pl.y0 + 60) / 2, cx - 6, pl.y0 + 60); c.stroke();
    c.fillStyle = SIL; c.beginPath(); c.moveTo(x, y + 1); c.lineTo(cx, y - 4); c.lineTo(x + w, y + 1); c.lineTo(cx, y + 6); c.closePath(); c.fill();
    c.strokeStyle = BORDE; c.lineWidth = .5; c.beginPath(); c.moveTo(x, y + 1); c.lineTo(x + w, y + 1); c.moveTo(cx, y - 4); c.lineTo(cx, y + 6); c.stroke();
    c.strokeStyle = SIL; c.lineWidth = .5; c.beginPath(); c.moveTo(cx, y + 6); for (let k = 1; k <= 6; k++) c.lineTo(cx + Math.sin(t * 4 + k) * 3, y + 6 + k * 3.4); c.stroke();
    for (let k = 2; k <= 6; k += 2) { const bx = cx + Math.sin(t * 4 + k) * 3, by = y + 6 + k * 3.4; c.fillStyle = SIL; c.beginPath(); c.moveTo(bx - 2, by - 1); c.lineTo(bx + 2, by + 1); c.lineTo(bx + 2, by - 1); c.lineTo(bx - 2, by + 1); c.fill(); }
  };
  amplia('ocaso', 190, b => {
    // I · las primeras hamacas y el muro que se sube con viento
    b.g(0, 12).P(3).d('T', 8);
    b.p(15, 10, 3).isl(20, 25, 4).c(20, 25, 3);
    b.g(27, 45).e(32, 7, 'murcielago').d('f', 29).d('T', 43).c(36, 41, 8);
    b.g(46, 48).g(49, 60, 4).c(50, 59, 2).d('T', 55);
    // II · el estero: garzas paradas y un enjambre de zancudos que solo el viento espanta
    b.g(61, 74, 8).e(68, undefined, 'garza').d('f', 63).d('T', 72);
    b.p(77, 10, 3).p(84, 9, 3).p(91, 10, 3).c(80, 82, 4).c(87, 89, 3).e(86, 6, 'zancudo');
    b.g(95, 104).e(100, undefined, 'garza').d('T', 97);
    // III · los papalotes: flotan sobre el barranco y suben con el viento hasta la loma alta
    b.p(107, 9, 3, { k: 'papalote', look: 'papalote', alto: 70 }).p(114, 8, 3, { k: 'papalote', look: 'papalote', alto: 80 }).p(121, 7, 3, { k: 'papalote', look: 'papalote', alto: 70 }).e(117, 4, 'zancudo').c(107, 123, 3);
    b.g(126, 140, 3).c(128, 138, 1).d('T', 133).e(137, 3, 'murcielago');
    // IV · bajada en cascada de hamacas al malecón
    b.p(143, 8, 3).p(149, 10, 3).p(155, 7, 3).p(161, 9, 3).c(143, 163, 5);
    b.g(165, 189).e(171, undefined, 'garza').e(178, 6, 'zancudo').h(174, 8).Gl(184).d('T', 167).d('f', 181);
  });
  NIVELES.ocaso.fauna = ['murcielago', 'garza', 'zancudo'];
  NIVELES.ocaso.lema = 'Hamacas que avientan alto, papalotes que suben con el viento, garzas y zancudos.';

  // =================================================================
  //  ACUARELA · El cenote de acuarela
  // =================================================================
  // mojarra: vive en el agua del cenote y salta en arco por encima de los nenúfares
  FOE.mojarra = { beh: 'mojarra', w: 10, h: 7, v: 0 };
  BEH.mojarra = (e, g, d) => {
    e.tt -= d;
    if (e.nada) { e.vy += 900 * d; e.x += e.vx * d; e.y += e.vy * d; e.dir = Math.sign(e.vx) || e.dir; if (e.y > e.hy && e.vy > 0) { e.nada = false; e.y = e.hy; e.x = e.hx; e.tt = e.per || 2.4; spawn(g, 6, e.x, VH - 10, { v: 50, life: .5, s: 1.6, k: 'dust', cols: ['#bfe0f0', '#ffffff'], g: 200 }); } return; }
    e.y = e.hy; if (e.tt <= 0) { e.nada = true; e.vy = -(e.salto || 430); e.vx = (e.lado || 1) * (e.ancho || 40); e.lado = -(e.lado || 1); spawn(g, 8, e.x, VH - 10, { v: 60, life: .5, s: 1.6, k: 'dust', cols: ['#bfe0f0', '#ffffff'], g: 200 }); }
    return 'skip';                                  // sumergida: no toca a nadie
  };
  FD.mojarra = (c, e, t) => {
    if (!e.nada) return;
    c.rotate(Math.atan2(e.vy, Math.abs(e.vx) + 1) * .8);
    c.fillStyle = 'rgba(122,170,200,.85)'; c.beginPath(); c.ellipse(0, -3, 6, 3.4, 0, 0, TAU2); c.fill();
    c.fillStyle = 'rgba(255,214,150,.6)'; c.beginPath(); c.ellipse(1, -2, 4, 1.6, 0, 0, TAU2); c.fill();
    c.fillStyle = 'rgba(90,130,170,.85)'; c.beginPath(); c.moveTo(-5, -3); c.lineTo(-9, -6); c.lineTo(-9, 0); c.fill();
    c.fillStyle = '#2a3a4a'; c.beginPath(); c.arc(3.4, -3.6, .7, 0, TAU2); c.fill();
  };
  // libélula: flota quieta y de repente sale disparada a otro lado
  FOE.libelula = { beh: 'libelula', w: 12, h: 6, v: 0 };
  BEH.libelula = (e, g, d) => {
    e.tt -= d;
    if (e.tt <= 0) { const a = Math.random() * TAU2; e.to = [clamp(e.hx + Math.cos(a) * 60, e.hx - 70, e.hx + 70), clamp(e.hy + Math.sin(a) * 26, e.hy - 30, e.hy + 30)]; e.tt = 1.2 + Math.random() * .8; }
    if (e.to) { const dx = e.to[0] - e.x, dy = e.to[1] - e.y, n = Math.hypot(dx, dy); if (n > 1) { const v = Math.min(n, 170 * d); e.x += dx / n * v; e.y += dy / n * v; e.dir = Math.sign(dx) || e.dir; } }
    e.y += Math.sin(e.t * 9) * .3;
  };
  FD.libelula = (c, e, t) => {
    c.fillStyle = 'rgba(70,150,140,.9)'; c.fillRect(-7, -4, 10, 1.6); c.beginPath(); c.arc(4, -3.2, 1.8, 0, TAU2); c.fill();
    const al = Math.sin(t * 50) * .6; c.fillStyle = 'rgba(200,230,240,.55)';
    for (const [ox, s] of [[-1, 1], [1.6, -1]]) { c.beginPath(); c.ellipse(ox, -6 - al, 4.2, 1.4, -.3 * s, 0, TAU2); c.fill(); c.beginPath(); c.ellipse(ox, -1.6 + al, 4, 1.3, .3 * s, 0, TAU2); c.fill(); }
  };
  // cascada: el agua que cae del techo del cenote empuja hacia abajo y hunde rápido los nenúfares
  OBJ.cascada = {
    make(g, en) { g.objs.push({ k: 'cascada', x0: tx(en.x), x1: tx(en.x + (en.w || 2)), y0: -70, y1: VH }); },
    step(o, g, dt) {
      const p = g.p; if (p.x > o.x0 && p.x < o.x1 && !p.on) p.vy = Math.min(p.vy + 420 * dt, 260);
      for (const pl of g.plats) if (pl.k === 'sink' && pl.x + pl.w > o.x0 && pl.x < o.x1) pl.y = Math.min(pl.y + 30 * dt, pl.y0 + 60);
    },
    draw(c, o, f) {
      const w = o.x1 - o.x0; c.save();
      const gr = c.createLinearGradient(o.x0, 0, o.x1, 0); gr.addColorStop(0, 'rgba(160,200,225,0)'); gr.addColorStop(.5, 'rgba(170,210,235,.5)'); gr.addColorStop(1, 'rgba(160,200,225,0)'); c.fillStyle = gr; c.fillRect(o.x0 - 4, o.y0, w + 8, o.y1 - o.y0);
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = .7; for (let k = 0; k < 5; k++) { const x = o.x0 + 3 + k * (w - 6) / 4, off = (f.t * 120 + k * 37) % 40; c.beginPath(); for (let y = o.y0 - 40 + off; y < o.y1; y += 40) { c.moveTo(x, y); c.lineTo(x + Math.sin(y * .1) * .8, y + 16); } c.stroke(); }
      c.restore();
    },
  };
  amplia('acuarela', 188, b => {
    // I · nenúfares que se hunden y ranas
    b.g(0, 13).P(3).d('f', 6).d('T', 10);
    b.p(15, 10, 2).p(19, 10, 2).p(23, 10, 2).c(15, 24, 8);
    b.g(26, 44).e(30, undefined, 'rana').e(40, undefined, 'rana').d('T', 33).d('f', 43);
    b.p(48, 10, 2).p(60, 10, 2).c(51, 57, 8);
    // II · las mojarras saltan entre los nenúfares
    b.g(64, 82).g(71, 82, 9).e(67, undefined, 'rana').d('T', 74);
    b.p(85, 10, 2).p(90, 9, 2).p(95, 10, 2).c(85, 96, 7).e(88, 15, 'mojarra').e(93, 15, 'mojarra');
    b.g(99, 108).e(104, 7, 'libelula').d('f', 101);
    // III · la gruta de las cascadas: el agua hunde los nenúfares; Fresita pone los suyos entre cascada y cascada
    b.p(111, 10, 2).o('cascada', 114, 0, { w: 2 }).p(117, 9, 2).o('cascada', 120, 0, { w: 2 }).p(123, 10, 2).c(111, 125, 7).e(118, 15, 'mojarra');
    b.g(127, 140).g(133, 140, 8).e(130, undefined, 'rana').e(137, 5, 'libelula').d('T', 129);
    // IV · el ojo del cenote: nenúfares sueltos, mojarras y libélulas antes de salir a la luz
    b.p(144, 10, 2).p(149, 9, 2).p(154, 10, 2).p(159, 8, 2).p(164, 10, 2).c(144, 166, 6).e(151, 15, 'mojarra').e(161, 15, 'mojarra').e(157, 5, 'libelula');
    b.g(168, 187).e(175, undefined, 'rana').h(171, 9).Gl(182).d('f', 170).d('T', 179);
  });
  NIVELES.acuarela.fauna = ['rana', 'mojarra', 'libelula'];
  NIVELES.acuarela.lema = 'Nenúfares que se hunden, mojarras que saltan, libélulas y cascadas en la gruta.';

  // =================================================================
  //  PAPEL PICADO · Papel picado
  // =================================================================
  // tijeras: caminan abriendo y cerrando; abiertas cortan, cerradas se les puede caer encima
  FOE.tijeras = { beh: 'tijeras', w: 12, h: 9, v: 22, spiky: e => (e.t % 1.4) < .55 };
  BEH.tijeras = (e, g, d) => {
    e.corteEspera = Math.max(0, (e.corteEspera || 0) - d);
    const avion = g.plats.find(pl => pl.k === 'plane' && pl.pw && !pl.dead &&
      Math.abs(pl.x + pl.w / 2 - e.x) < 65 && e.y - pl.y >= -4 && e.y - pl.y < 75);
    if (avion && !e.corteEspera && MEC.onGround(e) && !e.vy) {
      const dx = avion.x + avion.w / 2 - e.x;
      e.dir = Math.sign(dx) || e.dir; e.vx = Math.max(-85, Math.min(85, dx * 2));
      e.vy = -300; e.y -= 1; e.corteEspera = 1.4; e.cortando = true;
    }
    if (e.cortando) {
      for (const pl of g.plats) if (pl.k === 'plane' && pl.pw && !pl.dead &&
          e.x + e.w / 2 >= pl.x && e.x - e.w / 2 <= pl.x + pl.w &&
          e.y >= pl.y - 4 && e.y - e.h <= pl.y + pl.h) {
        pl.dead = true; pl.on = false;
        spawn(g, 10, e.x, pl.y, { v: 55, life: .45, s: 1.5, k: 'dust', cols: ['#fffaf0', '#e85a8a', '#ffbf00'] });
      }
      MEC.gravity(e, d);
      if (!e.vy && MEC.onGround(e)) e.cortando = false;
    } else if (!((e.t % 1.4) < .55)) walkStep(e, d, e.v);
  };
  FD.tijeras = (c, e, t) => {
    const ab = (e.t % 1.4) < .55 ? Math.sin(((e.t % 1.4) / .55) * Math.PI) * .7 : 0;
    c.save(); c.shadowColor = 'rgba(70,40,20,.35)'; c.shadowBlur = 2; c.shadowOffsetY = 1;
    for (const s of [1, -1]) { c.save(); c.translate(0, -5); c.rotate(s * ab); c.fillStyle = '#c9d3dc'; c.beginPath(); c.moveTo(0, -.8); c.lineTo(10, -.2 * s); c.lineTo(0, .8); c.fill(); c.restore(); }
    c.fillStyle = '#e83f6f'; for (const s of [1, -1]) { c.beginPath(); c.ellipse(-4, -5 + s * 2.4, 3, 2, 0, 0, TAU2); c.fill(); }
    c.fillStyle = '#fffaf0'; for (const s of [1, -1]) { c.beginPath(); c.ellipse(-4, -5 + s * 2.4, 1.4, .9, 0, 0, TAU2); c.fill(); }
    c.fillStyle = '#7a4a2a'; c.beginPath(); c.arc(0, -5, .9, 0, TAU2); c.fill();
    c.restore();
  };
  // grulla de papel: planea y se lanza en picada
  FOE.grulla = { beh: 'swoop', w: 14, h: 8, v: 0 };
  FD.grulla = (c, e, t) => {
    const al = Math.sin(t * 5 + e.anim) * 3;
    c.save(); c.shadowColor = 'rgba(70,40,20,.3)'; c.shadowBlur = 2; c.shadowOffsetY = 1;
    c.fillStyle = '#fffaf0'; c.beginPath(); c.moveTo(-8, -4); c.lineTo(6, -4); c.lineTo(10, -9); c.lineTo(7, -3); c.lineTo(-2, -1); c.closePath(); c.fill();
    c.fillStyle = '#f6bd60'; c.beginPath(); c.moveTo(-3, -4); c.lineTo(2, -4); c.lineTo(-1, -10 - al); c.fill();
    c.fillStyle = '#e4572e'; c.beginPath(); c.moveTo(-1, -4); c.lineTo(3, -4); c.lineTo(1, 1 + al * .4); c.fill();
    c.restore();
  };
  // rehilete: aspas de papel que giran y se pueden pisar
  OBJ.rehilete = {
    make(g, en) {
      const cx = tx(en.x) + 8, cy = tl(en.y), R = (en.r || 2.4) * T, sp = en.sp || 1.1, o = { k: 'rehilete', cx, cy, R, sp, aspas: [] };
      for (let i = 0; i < 4; i++) { const pl = mkPlat({ k: 'move', path: 'circle', look: 'aspa', x: cx - 9, y: cy - 1, w: 18, amp: R, sp, ph: i * TAU2 / 4 }); pl.col = ['#e83f6f', '#ffbf00', '#2274a5', '#32936f'][i]; o.aspas.push(pl); g.plats.push(pl); }
      g.objs.push(o);
    },
    draw(c, o, f) {
      const base = L.surfaceY(Math.floor(o.cx / T), Math.floor(o.cy / T) + 1) * T;
      c.save(); c.shadowColor = 'rgba(70,40,20,.35)'; c.shadowBlur = 2; c.shadowOffsetY = 1;
      c.fillStyle = '#a0653f'; c.fillRect(o.cx - 1.2, o.cy, 2.4, Math.min(VH, base) - o.cy);
      const a0 = o.aspas[0].t * o.sp;
      for (let i = 0; i < 4; i++) { const a = a0 + i * TAU2 / 4; c.fillStyle = o.aspas[i].col; c.beginPath(); c.moveTo(o.cx, o.cy); c.lineTo(o.cx + Math.cos(a) * o.R, o.cy + Math.sin(a) * o.R); c.lineTo(o.cx + Math.cos(a + .5) * o.R * .7, o.cy + Math.sin(a + .5) * o.R * .7); c.closePath(); c.fill(); }
      c.fillStyle = '#fffaf0'; c.beginPath(); c.arc(o.cx, o.cy, 2, 0, TAU2); c.fill(); c.restore();
    },
  };
  LOOK.aspa = (c, pl) => { c.save(); c.shadowColor = 'rgba(70,40,20,.35)'; c.shadowBlur = 2; c.shadowOffsetY = 1; c.fillStyle = pl.col || '#e83f6f'; c.beginPath(); roundRect(c, pl.x, pl.y, pl.w, 4, 2); c.fill(); c.restore(); c.strokeStyle = 'rgba(255,250,235,.85)'; c.setLineDash([1.4, 1.2]); c.lineWidth = .5; c.beginPath(); c.moveTo(pl.x + 2, pl.y + 2); c.lineTo(pl.x + pl.w - 2, pl.y + 2); c.stroke(); c.setLineDash([]); };
  amplia('paper', 186, b => {
    // I · papel que se dobla solo y avispas
    b.g(0, 12).P(3).d('T', 7).d('f', 10);
    b.p(14, 10, 3, { off: 0 }).p(18, 9, 3, { off: .33 }).p(22, 10, 3, { off: .66 }).c(14, 24, 7);
    b.g(26, 42).e(31, 6, 'avispa').e(38, undefined, 'tijeras').d('f', 28).d('T', 40);
    b.p(49, 9, 2, { off: .2 }).c(45, 56, 6);
    // II · los rehiletes del mercado: aspas que giran sobre el barranco; tijeras abajo
    b.g(58, 64).e(61, undefined, 'tijeras').o('rehilete', 69, 9, { r: 2.4, sp: 1 }).o('rehilete', 78, 9, { r: 2.4, sp: -1.1 }).c(66, 81, 6);
    b.g(84, 96).g(91, 96, 9).e(88, 7, 'grulla').d('T', 86);
    // III · el cielo de papel: un hueco largo que solo se cruza en avión, con grullas en picada
    b.p(100, 9, 2, { off: 0 }).p(118, 9, 2, { off: .5 }).c(102, 116, 7).e(109, 6, 'grulla').e(122, 6, 'grulla');
    b.g(126, 140, 9).e(134, undefined, 'tijeras').c(127, 139, 7).d('T', 138);
    // IV · todo junto: papel que se dobla, un rehilete y el último vuelo
    b.p(143, 9, 3, { off: 0 }).p(147, 9, 3, { off: .4 }).o('rehilete', 154, 9, { r: 2.4, sp: 1.3 }).p(160, 9, 3, { off: .7 }).c(143, 162, 5);
    b.g(165, 185).e(170, undefined, 'tijeras').e(177, 5, 'avispa').h(173, 8).Gl(181).d('f', 167).d('T', 183);
  });
  NIVELES.paper.fauna = ['avispa', 'tijeras', 'grulla'];
  NIVELES.paper.lema = 'Papel que se dobla solo, rehiletes que giran, tijeras que cortan y grullas en picada.';

  // =================================================================
  //  BIOLUMINISCENTE · El bosque que brilla
  // =================================================================
  const NEO = '#5fffe0', NOCHE = '#06141a';
  const iluminado = (g, x, y) => (g.lightR && Math.hypot(g.fre.x - x, g.fre.y - y) < g.lightR) || g.flareT > 0;
  // polilla: no va por Itzel sino por la luz de Fresita; mientras le revolotean, la luz se achica. El destello las espanta.
  FOE.polilla = { beh: 'polilla', w: 8, h: 6, v: 0 };
  BEH.polilla = (e, g, d) => {
    const fr = g.fre;
    if (g.flareT > 0 && Math.hypot(fr.x - e.x, fr.y - e.y) < 140) e.huye = 4;
    e.huye = Math.max(0, (e.huye || 0) - d);
    let tx2, ty2;
    if (e.huye > 0) { tx2 = e.x + (e.x - fr.x); ty2 = e.y - 40; }
    else if (Math.hypot(fr.x - e.x, fr.y - e.y) < 160) { const a = e.t * 3 + e.anim * 7; tx2 = fr.x + Math.cos(a) * 12; ty2 = fr.y + Math.sin(a * 1.3) * 8; }
    else { tx2 = e.hx + Math.sin(e.t * .7) * 30; ty2 = e.hy + Math.sin(e.t * 1.9) * 10; }
    const sp = e.huye > 0 ? 90 : 46; e.x += clamp(tx2 - e.x, -sp * d, sp * d); e.y += clamp(ty2 - e.y, -sp * d, sp * d); e.dir = tx2 > e.x ? 1 : -1;
    if (!e.huye && Math.hypot(fr.x - e.x, fr.y - e.y) < 26 && g.lightBase) g.lightR = Math.max(18, g.lightR - 9);
  };
  FD.polilla = (c, e, t) => {
    const al = Math.sin(t * 22 + e.anim * 5);
    c.fillStyle = 'rgba(191,255,239,.18)'; c.beginPath(); c.arc(0, -3, 6, 0, TAU2); c.fill();
    c.fillStyle = '#c9b8e8'; for (const s of [1, -1]) { c.beginPath(); c.ellipse(-.5, -3 - s * (1.6 + al), 3.2, 1.8 + al * .5, s * .5, 0, TAU2); c.fill(); }
    c.fillStyle = NOCHE; c.fillRect(-2.5, -3.6, 5, 1.4); c.fillStyle = '#ff8ff0'; c.beginPath(); c.arc(2.6, -3, .7, 0, TAU2); c.fill();
  };
  // hongo de esporas: cada tanto suelta una nube que brilla y lastima; se le puede caer encima
  FOE.esporin = { beh: 'esporin', w: 14, h: 10, v: 0 };
  BEH.esporin = (e, g, d) => {
    e.tt -= d; e.infla = Math.max(0, (e.infla || 0) - d);
    if (!e.infla) {
      const dir = e.dir || 1, nx = e.x + dir * 12 * d;
      if (Math.abs(nx - e.hx) > 18 || !SOLID(nx + dir * 5, e.y + 2)) e.dir = -dir;
      else { e.x = nx; e.dir = dir; }
    }
    if (e.tt <= 0) { e.tt = 2.8; e.infla = .4; g.objs.push({ k: 'esporas', x: e.x, y: e.y - 8, t: 0, origen: e }); }
    return;
  };
  FD.esporin = (c, e, t) => {
    const k = e.infla > 0 ? 1 + e.infla : 1 + Math.sin(t * 2) * .05;
    c.fillStyle = '#1a3a4a'; c.fillRect(-2, -5, 4, 5);
    c.fillStyle = '#2a5a6a'; c.beginPath(); c.ellipse(0, -7, 7 * k, 5 * k, 0, Math.PI, 0); c.fill();
    c.fillStyle = NEO; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(-5 + i * 2.5, -8 - (i % 2) * 2, .9, 0, TAU2); c.fill(); }
  };
  OBJ.esporas = {
    step(o, g, dt) { o.t += dt; if (o.t > 1.8) { o.dead = true; return; } const r = 6 + o.t * 12, p = g.p, e = o.origen; const pisando = e && e.st !== 'gone' && p.vy > 0 && p.y <= e.y - e.h + 5 && Math.abs(p.x - e.x) < (p.w + e.w) / 2; if (!pisando && o.t < 1.5 && Math.hypot(p.x - o.x, p.y - 7 - (o.y - o.t * 8)) < r) MEC.hurt(g, p.x < o.x ? -1 : 1); },
    draw(c, o) { const r = 6 + o.t * 12, a = Math.max(0, 1 - o.t / 1.8); c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 9; i++) { const an = i * .7 + o.t * 2, rr = r * (.4 + (i % 3) * .3); c.fillStyle = `rgba(95,255,224,${.25 * a})`; c.beginPath(); c.arc(o.x + Math.cos(an) * rr, o.y - o.t * 8 + Math.sin(an) * rr * .7, 2.4, 0, TAU2); c.fill(); } c.restore(); },
  };
  // hongo de luz: un elevador vivo que crece mientras Fresita lo alumbra y se encoge en lo oscuro
  PK.hongoLuz = (pl, g, d) => {
    const lit = iluminado(g, pl.x + pl.w / 2, pl.y), tope = pl.y0 - (pl.alto || 80);
    pl.y = clamp(pl.y + (lit ? -38 : 22) * d, tope, pl.y0); pl.brillo = (pl.brillo || 0) + ((lit ? 1 : 0) - (pl.brillo || 0)) * Math.min(1, d * 4);
  };
  LOOK.hongoLuz = (c, pl, f) => {
    const x = pl.x, y = pl.y, w = pl.w, cx = x + w / 2, base = pl.y0 + 70, b = pl.brillo || 0;
    c.fillStyle = '#1a3a4a'; c.fillRect(cx - 3, y + 4, 6, base - y);
    c.strokeStyle = `rgba(95,255,224,${.3 + b * .5})`; c.lineWidth = .6; for (let yy = y + 10; yy < base; yy += 9) { c.beginPath(); c.moveTo(cx - 3, yy); c.lineTo(cx + 3, yy + 2); c.stroke(); }
    if (b > .05) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, cx, y + 2, 26, NEO, .35 * b); c.restore(); }
    c.fillStyle = '#2a5a6a'; c.beginPath(); c.ellipse(cx, y + 3, w / 2 + 2, 6, 0, Math.PI, 0); c.fill();
    c.fillStyle = `rgba(95,255,224,${.45 + b * .5})`; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(x + 2 + i * (w - 4) / 5, y - (i % 2 ? 1 : -1), 1.1, 0, TAU2); c.fill(); }
  };
  amplia('biolum', 192, b => {
    const S = { k: 'bounce', look: 'shroom', pow: 600 }, HL = alto => ({ k: 'hongoLuz', look: 'hongoLuz', alto });
    // I · hongos que rebotan y caminos de luz
    b.g(0, 12).P(3).d('f', 6).d('T', 10);
    b.p(13, 10.5, 2, S).isl(19, 25, 6).c(19, 25, 5);
    b.p(28, 7, 3).p(33, 6, 3).p(38, 7, 3);
    b.g(41, 58).e(45, 7, 'cocuyo').e(53, undefined, 'esporin').d('T', 48).d('f', 57);
    // II · el claro de las polillas: buscan la luz de Fresita y la apagan; el destello las corre
    b.p(61, 9, 2).p(65, 7, 2).p(69, 8, 2).p(73, 6, 2).p(77, 8, 2).c(62, 78, 4).e(68, 4, 'polilla').e(76, 3, 'polilla');
    b.g(81, 96).e(88, undefined, 'esporin').d('T', 84).d('f', 94);
    // III · los hongos de luz: Fresita los alumbra para que crezcan hasta el risco
    b.p(99, 10, 3, HL(70)).p(106, 10, 3, HL(90)).p(113, 9, 3, HL(90)).e(109, 4, 'polilla').c(100, 115, 3);
    b.g(118, 132, 4).c(119, 131, 2).e(125, 4, 'esporin').d('T', 130);
    // IV · bajada a oscuras: caminos de luz, hongos que rebotan y hongos de luz entre polillas
    b.p(135, 7, 2).p(139, 9, 2).p(143, 11, 2, S).p(148, 8, 3, HL(60)).p(154, 9, 2).p(158, 7, 2).c(136, 160, 5).e(147, 4, 'polilla').e(156, 4, 'cocuyo');
    b.g(162, 191).e(168, undefined, 'esporin').e(178, 7, 'cocuyo').h(172, 9).Gl(186).d('T', 165).d('f', 182);
  });
  NIVELES.biolum.fauna = ['cocuyo', 'polilla', 'esporin'];
  NIVELES.biolum.lema = 'Hongos que rebotan, caminos de luz, hongos que crecen con la luz y polillas que se la quieren comer.';

  // =================================================================
  //  PLANO · Lanchas del Golfo
  // =================================================================
  const AZUL = '#2a2347', CORAL = '#ff6b5b', CREMA = '#f4efe6';
  // velero: no tiene motor; avanza cuando Fresita le sopla a la vela con su ráfaga
  PK.velero = (pl, g, d) => {
    pl.vx = (pl.vx || 0) * Math.pow(.55, d);
    const nx = clamp(pl.x + pl.vx * d, pl.x0 - (pl.atras || 0), pl.x0 + (pl.dist || 160));
    if (nx !== pl.x + pl.vx * d) pl.vx = 0; pl.x = nx; pl.y = pl.y0 + Math.sin(pl.t * 1.6) * 1.5;
  };
  const rafagaAntes = POW.rafaga.click;
  POW.rafaga.click = function (g, x, y, c) {
    let sopla = false;
    for (const pl of g.plats) if (pl.k === 'velero' && Math.abs(g.fre.x - (pl.x + pl.w / 2)) < 80 && g.fre.y < pl.y + 10 && g.fre.y > pl.y - 70) { pl.vx = Math.sign(pl.x + pl.w / 2 - g.fre.x || 1) * 95; pl.sopla = .6; sopla = true; }
    const ok = rafagaAntes.call(this, g, x, y, c);
    if (sopla && !ok) ring(g, g.fre.x, g.fre.y, '#ffd9b0', 30);
    return ok || sopla;
  };
  LOOK.velero = (c, pl, f) => {
    const x = pl.x, y = pl.y, w = pl.w, sopla = Math.max(0, (pl.sopla = Math.max(0, (pl.sopla || 0) - 1 / 60)));
    c.fillStyle = CREMA; c.beginPath(); c.moveTo(x - 2, y); c.lineTo(x + w + 2, y); c.lineTo(x + w - 4, y + 7); c.lineTo(x + 4, y + 7); c.fill();
    c.fillStyle = CORAL; c.fillRect(x + 2, y + 3, w - 4, 1.4);
    const mx = x + w * .45; c.fillStyle = AZUL; c.fillRect(mx - .6, y - 26, 1.2, 26);
    const panza = 3 + sopla * 6 + Math.sign(pl.vx || 0) * 2; c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(mx + .6, y - 25); c.quadraticCurveTo(mx + 9 + panza, y - 14, mx + .6, y - 3); c.fill();
    c.fillStyle = CORAL; c.beginPath(); c.moveTo(mx - .6, y - 22); c.quadraticCurveTo(mx - 7 - panza * .4, y - 13, mx - .6, y - 5); c.fill();
    c.fillStyle = '#ffd23f'; c.beginPath(); c.moveTo(mx, y - 26); c.lineTo(mx + 6, y - 24); c.lineTo(mx, y - 22); c.fill();
  };
  LOOK.boya = (c, pl, f) => {
    const cx = pl.x + pl.w / 2, y = pl.y;
    c.fillStyle = CORAL; c.beginPath(); c.moveTo(pl.x, y); c.lineTo(pl.x + pl.w, y); c.lineTo(cx + 3, y + 9); c.lineTo(cx - 3, y + 9); c.fill();
    c.fillStyle = CREMA; c.fillRect(pl.x + 2, y + 3, pl.w - 4, 2); c.fillStyle = AZUL; c.fillRect(cx - .5, y - 9, 1, 9); c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(cx, y - 10, 1.8, 0, TAU2); c.fill();
  };
  // bucanero: desde su lancha avienta cocos en arco
  FOE.bucanero = { beh: 'bucanero', w: 10, h: 15, v: 0 };
  BEH.bucanero = (e, g, d, toP, near) => {
    e.tt -= d; e.tiro = Math.max(0, (e.tiro || 0) - d); if (Math.abs(toP) > 4) e.dir = Math.sign(toP);
    if (near && e.tt <= 0 && Math.abs(toP) < 170) { e.tt = 2.4; e.tiro = .35; const tv = .9, dx = g.p.x - e.x, dy = (g.p.y - 8) - (e.y - 16); dispara(g, { origen: e, x: e.x, y: e.y - 16, vx: dx / tv, vy: dy / tv - 250 * tv, grav: 500, r: 2.6, dib: 'coco', polvo: ['#7a4a2a', '#f4efe6'] }); }
    if (e.vy !== 0 || !SOLID(e.x, e.y + 1)) MEC.gravity(e, d);
  };
  OBJ.bala.dibujos.coco = (c, o) => { c.fillStyle = '#7a4a2a'; c.beginPath(); c.arc(o.x, o.y, 2.8, 0, TAU2); c.fill(); c.fillStyle = '#2a1a10'; c.beginPath(); c.arc(o.x - .8, o.y - .8, .6, 0, TAU2); c.arc(o.x + .6, o.y - .9, .6, 0, TAU2); c.fill(); };
  FD.bucanero = (c, e, t) => {
    const brazo = e.tiro > 0 ? -7 : -3;
    c.fillStyle = AZUL; c.fillRect(-3, -6, 2, 6); c.fillRect(1, -6, 2, 6);
    c.fillStyle = CREMA; c.fillRect(-4, -12, 8, 6); c.fillStyle = CORAL; for (let k = 0; k < 3; k++) c.fillRect(-4, -11 + k * 2, 8, .8);
    c.fillStyle = '#c98a5e'; c.beginPath(); c.arc(0, -14.5, 2.6, 0, TAU2); c.fill();
    c.fillStyle = CORAL; c.beginPath(); c.arc(0, -15.4, 2.7, Math.PI, 0); c.fill(); c.beginPath(); c.moveTo(-2.6, -15.4); c.lineTo(-5, -14); c.lineTo(-4, -15.6); c.fill();
    c.fillStyle = AZUL; c.fillRect(.6, -15.2, 2, 1); c.fillRect(-.2, -15.8, 3.2, .4);
    c.strokeStyle = '#c98a5e'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(3, -11); c.lineTo(5, brazo - 8); c.stroke();
    if (e.tiro <= 0) { c.fillStyle = '#7a4a2a'; c.beginPath(); c.arc(5.4, brazo - 9, 2.2, 0, TAU2); c.fill(); }
  };
  // fragata: el pájaro negro de bolsa roja; planea muy alto y baja en picada larga
  FOE.fragata = { beh: 'swoop', w: 18, h: 8, v: 0, high: true, fast: true };
  FD.fragata = (c, e, t) => {
    const al = e.st === 'dive' ? 3 : Math.sin(t * 4 + e.anim) * 2;
    c.fillStyle = AZUL; c.beginPath(); c.moveTo(-10, -4 - al); c.quadraticCurveTo(-3, -7, 0, -4); c.quadraticCurveTo(3, -7, 10, -4 - al); c.lineTo(0, -2); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(0, -4); c.lineTo(-6, -2); c.lineTo(-8, -5); c.fill(); c.fillStyle = CORAL; c.beginPath(); c.ellipse(2.5, -2.2, 1.8, 1.4, 0, 0, TAU2); c.fill();
    c.fillStyle = '#9a9aaa'; c.beginPath(); c.moveTo(3, -4); c.lineTo(7, -3.4); c.lineTo(3, -3); c.fill();
  };
  amplia('flat', 190, b => {
    const V = (dist, atras) => ({ k: 'velero', look: 'velero', dist, atras: atras || 0 }), BOYA = { path: 'bob', look: 'boya', amp: 3, sp: 1.6 };
    // I · las lanchas que van y vienen
    b.g(0, 13).P(3).d('T', 8).d('r', 11);
    b.p(17, 10, 3).p(28, 10, 3, { amp: 44, sp: .75, ph: 2 }).c(16, 33, 7);
    b.g(36, 50).e(42, 4, 'zopilote').d('f', 38).d('T', 45).e(48, undefined, 'bucanero');
    // II · el primer velero: Fresita le sopla a la vela con su ráfaga para cruzar la bahía
    b.p(53, 10, 4, V(150)).c(56, 66, 7).e(62, 3, 'fragata');
    b.g(66, 78).e(73, undefined, 'bucanero').d('T', 69);
    // III · las boyas: se brincan con ráfagas largas; bucaneros en sus lanchas
    b.p(82, 9, 2, BOYA).p(89, 8, 2, BOYA).p(96, 9, 2, BOYA).p(103, 7, 2, BOYA).c(82, 105, 5).p(92, 11, 3, { amp: 30, sp: .8 }).e(93, 11, 'bucanero');
    b.g(107, 120).e(112, 3, 'fragata').d('r', 109).d('T', 118);
    // IV · la travesía larga: dos veleros, lanchas y fragatas hasta el muelle
    b.p(123, 10, 4, V(160)).p(133, 6, 3, { amp: 50, sp: .7 }).c(126, 150, 7).e(140, 2, 'fragata');
    b.g(158, 165, 9).e(161, 9, 'bucanero').p(166, 10, 4, V(60)).g(172, 189).e(178, 4, 'zopilote').h(175, 9).Gl(185).d('T', 182);
  });
  NIVELES.flat.fauna = ['zopilote', 'bucanero', 'fragata'];
  NIVELES.flat.lema = 'Lanchas que van y vienen, veleros que avanzan con la ráfaga de Fresita, bucaneros y fragatas.';

  // =================================================================
  //  SUMI-E · Nubes de tinta
  // =================================================================
  const TIN = '#1d1b19', ROJ = '#c23b2e', PAP = '#f0e7d2';
  // mancha trepadora: sube y baja por la cara de una pared; si se mete en la tinta de Fresita, se queda pegada
  FOE.mancha = { beh: 'mancha', w: 9, h: 9, v: 0 };
  BEH.mancha = (e, g, d) => {
    if (e.pegada > 0) { e.pegada -= d; return; }
    for (const z of g.zones) if (z.k === 'tinta' && Math.abs(z.fx - e.x) < 12 && e.y - 4 > z.y0 && e.y - 4 < z.y1) { e.pegada = 3.5; spawn(g, 8, e.x, e.y - 4, { v: 30, life: .5, s: 1.4, k: 'dust', cols: [TIN, ROJ] }); return; }
    e.sube = e.sube ?? -1; e.y += e.sube * 30 * d; if (e.y < e.hy - 56) e.sube = 1; if (e.y > e.hy) { e.y = e.hy; e.sube = -1; }
  };
  FD.mancha = (c, e, t) => {
    const k = e.pegada > 0 ? .7 : 1; c.fillStyle = TIN; c.beginPath();
    for (let i = 0; i <= 12; i++) { const a = i / 12 * TAU2, r = (4.4 + Math.sin(a * 3 + t * 6) * 1.2) * k; c.lineTo(Math.cos(a) * r, -4.5 + Math.sin(a) * r); } c.fill();
    for (let i = 0; i < 4; i++) { const a = i * 1.6 + t * 2; c.beginPath(); c.arc(Math.cos(a) * 6.5, -4.5 + Math.sin(a) * 6.5, .9, 0, TAU2); c.fill(); }
    c.fillStyle = PAP; c.beginPath(); c.arc(1.4, -5.4, 1, 0, TAU2); c.arc(-1.4, -5.4, 1, 0, TAU2); c.fill();
    if (e.pegada > 0) { c.fillStyle = ROJ; c.fillRect(-2, -1.4, 4, 1.2); }
  };
  // koi de tinta: nada por el aire en ochos, pintado de un brochazo
  FOE.koi = { beh: 'fly', w: 14, h: 7, v: 0, rx: 46, ry: 14, sp: 1.1, fig: true };
  FD.koi = (c, e, t) => {
    const col = Math.sin(t * 6 + e.anim) * 2;
    c.fillStyle = TIN; c.beginPath(); c.moveTo(7, -4); c.quadraticCurveTo(0, -9, -6, -4 + col * .3); c.quadraticCurveTo(0, 0, 7, -4); c.fill();
    c.beginPath(); c.moveTo(-5, -4); c.lineTo(-10, -7 + col); c.lineTo(-9, -4); c.lineTo(-10, -1 + col); c.fill();
    c.fillStyle = ROJ; c.beginPath(); c.ellipse(1, -5.6, 2.6, 1.4, -.2, 0, TAU2); c.fill();
    c.fillStyle = PAP; c.beginPath(); c.arc(4.6, -4.6, .7, 0, TAU2); c.fill();
  };
  // biombo: un panel de papel pintado que gira cada tanto; cerrado es pared (y se le puede untar tinta), abierto se pasa
  OBJ.biombo = {
    make(g, en) {
      const x = tx(en.x) + 5, top = tl(en.y), base = L.surfaceY(en.x + PAD, en.y) * T;
      const s = { k: 'biombo', x, y: top, w: 6, h: base - top, on: !en.abierto };
      g.solids.push(s); g.objs.push({ k: 'biombo', s, per: en.per || 3.2, t: en.off || 0, giro: s.on ? 1 : 0 });
    },
    step(o, g, dt) {
      o.t += dt; const quiere = Math.floor(o.t / o.per) % 2 === 0;
      if (quiere !== o.s.on) { if (!quiere || MEC.freeOf(g, o.s.x, o.s.y, o.s.w, o.s.h)) { o.s.on = quiere; if (!quiere) g.zones = g.zones.filter(z => !(z.k === 'tinta' && Math.abs(z.fx - o.s.x) < 10)); } }
      o.giro += ((o.s.on ? 1 : 0) - o.giro) * Math.min(1, dt * 8);
    },
    draw(c, o, f) {
      const s = o.s, k = Math.max(.08, o.giro), cx = s.x + 3, w = 6 * k;
      c.fillStyle = PAP; c.fillRect(cx - w / 2, s.y, w, s.h); c.strokeStyle = TIN; c.lineWidth = .7; c.strokeRect(cx - w / 2, s.y, w, s.h);
      if (k > .3) { c.strokeStyle = 'rgba(29,27,25,.5)'; c.lineWidth = .5; c.beginPath(); for (let yy = s.y + 6; yy < s.y + s.h; yy += 11) { c.moveTo(cx - w / 2 + 1, yy + 3); c.quadraticCurveTo(cx, yy - 2, cx + w / 2 - 1, yy + 2); } c.stroke(); c.fillStyle = ROJ; c.fillRect(cx - 1, s.y + 3, 2, 2); }
      const t2 = o.per - (o.t % o.per); if (t2 < .6) { c.fillStyle = `rgba(194,59,46,${.5 * (1 - t2 / .6)})`; c.fillRect(cx - 4, s.y - 4, 8, 2); }
    },
  };
  amplia('sumie', 192, b => {
    // I · nubes que aparecen y se borran
    b.g(0, 13).P(3).d('T', 8).d('f', 11);
    b.p(15, 9, 3, { off: 0 }).p(20, 8, 3, { off: .3 }).p(25, 9, 3, { off: .6 }).c(15, 27, 6);
    b.g(29, 46).e(35, undefined, 'culebra').d('T', 38).d('r', 45).e(42, 5, 'koi');
    b.g(47, 49).g(50, 58, 5).c(51, 57, 3).d('T', 55);
    // II · los muros: se trepan con la tinta de Fresita; las manchas suben y bajan por ellos
    b.p(61, 7, 3, { off: .1 }).p(66, 8, 3, { off: .4 }).g(70, 84).blk(76, 4, 2, 7).e(75, undefined, 'mancha').blk(82, 1, 2, 10).c(77, 77, 2).d('f', 72);
    b.g(85, 96, 1).e(90, 1, 'culebra').c(86, 95, 0);
    // III · los biombos: paneles que giran; cerrados se trepan, abiertos se cruzan
    b.p(99, 6, 3, { off: .2 }).g(103, 128).o('biombo', 108, 3, { per: 3 }).o('biombo', 115, 2, { per: 3, off: 1.5 }).o('biombo', 122, 3, { per: 2.6 }).e(112, undefined, 'mancha').e(119, 5, 'koi').d('T', 105);
    // IV · el acantilado de tinta: nubes, una pared alta y koi en el aire
    b.p(131, 9, 3, { off: 0 }).p(136, 8, 3, { off: .35 }).p(141, 9, 3, { off: .7 }).c(131, 143, 6).e(138, 5, 'koi');
    b.g(146, 191).blk(152, 3, 2, 8).e(151, undefined, 'mancha').e(162, undefined, 'culebra').o('biombo', 168, 4, { per: 3.4 }).h(158, 9).Gl(185).d('T', 175).d('f', 180);
  });
  NIVELES.sumie.fauna = ['culebra', 'mancha', 'koi'];
  NIVELES.sumie.lema = 'Nubes que se borran, muros que se trepan con tinta, biombos que giran, manchas trepadoras y koi en el aire.';

  // =================================================================
  //  NEÓN · Ritmo de neón
  // =================================================================
  const golpe = (g, o) => { const bt = g.beatT || 0, son = bt < (o.btAnt ?? bt); o.btAnt = bt; return son; };
  // bocina: en cada compás suelta una onda por el piso, hacia los dos lados; hay que saltarla
  FOE.bocina = { beh: 'bocina', w: 14, h: 16, v: 0, spiky: () => true };
  BEH.bocina = (e, g, d) => {
    e.late = Math.max(0, (e.late || 0) - d);
    if (golpe(g, e)) { e.late = .3; for (const s of [1, -1]) g.objs.push({ k: 'onda', x: e.x + s * 8, y: e.y, dir: s, t: 0 }); }
    return;
  };
  FD.bocina = (c, e, t) => {
    const k = 1 + (e.late || 0) * .6;
    c.save(); c.shadowColor = '#ff2bd6'; c.shadowBlur = 4; c.strokeStyle = '#ff2bd6'; c.lineWidth = 1; c.fillStyle = '#14062a';
    c.fillRect(-7, -16, 14, 16); c.strokeRect(-7, -16, 14, 16);
    c.strokeStyle = '#00e8ff'; c.beginPath(); c.arc(0, -6, 4 * k, 0, TAU2); c.stroke(); c.beginPath(); c.arc(0, -13, 1.8, 0, TAU2); c.stroke();
    c.restore();
  };
  OBJ.onda = {
    step(o, g, dt) { o.t += dt; o.x += o.dir * 95 * dt; if (o.t > 1.6 || SOLID(o.x + o.dir * 3, o.y - 3) || !SOLID(o.x, o.y + 2)) { o.dead = true; return; } const p = g.p; if (Math.abs(p.x - o.x) < 5 && p.y > o.y - 7 && p.y <= o.y + 1) MEC.hurt(g, o.dir); },
    draw(c, o) { const a = 1 - o.t / 1.6; c.save(); c.shadowColor = '#00e8ff'; c.shadowBlur = 4; c.strokeStyle = `rgba(0,232,255,${a})`; c.lineWidth = 1.1; c.beginPath(); c.moveTo(o.x - o.dir * 4, o.y); c.quadraticCurveTo(o.x, o.y - 9, o.x + o.dir * 2, o.y); c.stroke(); c.restore(); },
  };
  // bailarín: solo se mueve en el compás, un brinco hacia Itzel; entre compases se queda congelado en su pose
  FOE.bailarin = { beh: 'bailarin', w: 10, h: 16, v: 0 };
  BEH.bailarin = (e, g, d, toP) => {
    if (golpe(g, e) && SOLID(e.x, e.y + 1)) { e.dir = Math.sign(toP) || e.dir; e.vy = -210; e.vx = e.dir * 70; e.y -= 1; e.pose = (e.pose || 0) + 1; }
    if (e.vy !== 0 || !SOLID(e.x, e.y + 1)) MEC.gravity(e, d);
  };
  FD.bailarin = (c, e, t) => {
    const p = (e.pose || 0) % 3;
    c.save(); c.shadowColor = '#3dff8a'; c.shadowBlur = 3; c.strokeStyle = '#3dff8a'; c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(-3, 0); c.lineTo(0, -7); c.lineTo(3 - p, 0); c.moveTo(0, -7); c.lineTo(0, -13); c.stroke();
    c.beginPath(); if (p === 0) { c.moveTo(-5, -15); c.lineTo(0, -12); c.lineTo(5, -15); } else if (p === 1) { c.moveTo(-5, -9); c.lineTo(0, -12); c.lineTo(6, -17); } else { c.moveTo(-6, -17); c.lineTo(0, -12); c.lineTo(5, -9); } c.stroke();
    c.strokeStyle = '#ff2bd6'; c.beginPath(); c.arc(0, -15.5, 2.4, 0, TAU2); c.stroke();
    c.restore();
  };
  // ecualizador: barras que suben y bajan con la música
  const PAT = [.2, .7, 1, .5, .9, .3, .6, .1];
  PK.eq = (pl, g, d) => { const u = (g.beatT || 0) / (g.beatAuto || 1.6), n = PAT.length, a = PAT[((g.beat || 0) + pl.i) % n], b2 = PAT[((g.beat || 0) + pl.i + 1) % n]; pl.y = pl.y0 - (pl.amp || 48) * lerp(a, b2, smooth(0, 1, u)); };
  LOOK.eq = (c, pl, f) => {
    const x = pl.x, y = pl.y, w = pl.w, base = pl.y0 + 10;
    c.save(); c.shadowColor = '#00e8ff'; c.shadowBlur = 3 * f.S;
    for (let yy = y + 2; yy < base; yy += 4) { const u = (yy - y) / Math.max(1, base - y); c.fillStyle = u < .3 ? '#ff2bd6' : u < .6 ? '#ffd23f' : '#00e8ff'; c.fillRect(x + 1, yy, w - 2, 2.4); }
    c.fillStyle = '#ffffff'; c.fillRect(x, y, w, 1.4); c.restore();
  };
  amplia('neon', 190, b => {
    const EQ = (i, amp) => ({ k: 'eq', look: 'eq', i, amp });
    // I · bloques que se prenden al ritmo
    b.g(0, 12).P(3).d('T', 7);
    b.p(14, 10, 3, { grp: 'A' }).p(18, 8, 3, { grp: 'B' }).p(22, 9, 3, { grp: 'A' }).p(26, 10, 3, { grp: 'B' }).c(14, 28, 6);
    b.g(30, 50).e(35, undefined, 'iguana').e(45, undefined, 'bocina').d('f', 32).d('T', 40);
    // II · el ecualizador: barras que suben y bajan con la música
    b.p(53, 10, 2, EQ(0, 40)).p(56, 10, 2, EQ(1, 40)).p(59, 10, 2, EQ(2, 40)).p(62, 10, 2, EQ(3, 40)).p(65, 10, 2, EQ(4, 40)).c(53, 66, 4);
    b.g(68, 86).e(74, undefined, 'bailarin').e(82, undefined, 'bocina').d('T', 71);
    // III · la pista de baile: bloques A y B, bailarines y bocinas; al compás todo se queda quieto
    b.p(89, 9, 3, { grp: 'A' }).p(93, 7, 3, { grp: 'B' }).p(97, 5, 3, { grp: 'A' }).g(100, 112, 4).e(106, 4, 'bailarin').c(101, 111, 2);
    b.p(115, 6, 3, { grp: 'B' }).p(119, 8, 3, { grp: 'A' }).p(123, 10, 3, { grp: 'B' }).c(115, 125, 5);
    // IV · el gran ecualizador hasta el escenario
    b.g(127, 140).e(133, undefined, 'bocina').d('f', 129);
    b.p(143, 10, 2, EQ(0, 56)).p(146, 10, 2, EQ(2, 56)).p(149, 10, 2, EQ(4, 56)).p(152, 10, 2, EQ(6, 56)).p(155, 10, 2, EQ(1, 56)).p(158, 10, 2, EQ(3, 56)).c(143, 160, 3);
    b.g(162, 189).e(168, undefined, 'bailarin').e(176, undefined, 'iguana').h(172, 9).Gl(184).d('T', 165);
  });
  NIVELES.neon.fauna = ['iguana', 'bocina', 'bailarin'];
  NIVELES.neon.lema = 'Bloques que se prenden al ritmo, un ecualizador para brincar, bocinas que mandan ondas y bailarines que solo se mueven al compás.';
})();
