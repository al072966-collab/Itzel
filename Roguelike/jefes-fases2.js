'use strict';
// =====================================================================
//  FASES DE LOS JEFES (2): los otros ocho prólogos y la FASE FINAL
//  Cuando a un jefe le queda un golpe se enfurece: ataca más rápido y
//  la arena cambia según quién es (se parte el piso, se apaga la luz,
//  sube el agua, sopla el ventarrón, cambian las dimensiones…).
// =====================================================================
(function () {
  const { OBJ, PK, LOOK, FOE, FD, mkPlat, ring, tx, tl } = MEC;
  const { falso, dibuja, aviso, FLOOR } = FASES_UTIL;
  const TAU2 = Math.PI * 2;

  // ---------------- peligros que comparten prólogos y fases finales ----------------
  // mira de cañón: marca el piso y al rato cae la bala
  OBJ.mira = {
    step(o, g, dt) {
      o.t += dt; if (o.t < (o.espera || 1.1)) return;
      o.dead = true; const p = g.p; g.shake = Math.max(g.shake || 0, .2);
      spawn(g, 18, o.x, o.y, { v: 110, life: .6, s: 2.2, k: 'dust', cols: ['#3a3a3a', '#ffb02e', '#ffffff'] });
      if (Math.abs(p.x - o.x) < 15 && p.y > o.y - 20 && p.y <= o.y + 4) MEC.hurt(g, p.x < o.x ? -1 : 1);
    },
    draw(c, o) {
      const k = o.t / (o.espera || 1.1); c.strokeStyle = `rgba(230,60,50,${.5 + Math.sin(o.t * 20) * .3})`; c.lineWidth = .9;
      c.beginPath(); c.ellipse(o.x, o.y, 14 * (1.2 - k * .4), 3.4, 0, 0, TAU2); c.stroke(); c.beginPath(); c.moveTo(o.x - 6, o.y); c.lineTo(o.x + 6, o.y); c.stroke();
      if (k > .55) { const y = lerp(o.y - 150, o.y, (k - .55) / .45); c.fillStyle = '#2a2a2a'; c.beginPath(); c.arc(o.x + (1 - k) * 30, y, 3.2, 0, TAU2); c.fill(); }
    },
  };
  const tiraMira = (g, x) => g.objs.push({ k: 'mira', x, y: L.surfaceY(Math.floor(x / T), 0) * T, t: 0 });
  // rayo: una línea de aviso y luego el rayo de arriba abajo
  OBJ.rayoChaac = {
    step(o, g, dt) { o.t += dt; if (o.t > 1.25) { o.dead = true; return; } if (o.t > .85 && !o.pego) { o.pego = true; g.shake = .25; g.destello = .15; const p = g.p; if (Math.abs(p.x - o.x) < 9) MEC.hurt(g, p.x < o.x ? -1 : 1); } },
    draw(c, o, f) {
      const y0 = (f.y0 || 0) - 4, y1 = L.surfaceY(Math.floor(o.x / T), 0) * T;
      if (o.t < .85) { c.strokeStyle = `rgba(255,255,200,${.25 + Math.sin(o.t * 30) * .2})`; c.setLineDash([3, 3]); c.lineWidth = .8; c.beginPath(); c.moveTo(o.x, y0); c.lineTo(o.x, y1); c.stroke(); c.setLineDash([]); return; }
      c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = o.fuego ? '#ff8a2a' : '#fffbd0'; c.lineWidth = o.fuego ? 3.4 : 2.4; c.beginPath(); let x = o.x; c.moveTo(x, y0); for (let y = y0; y < y1; y += 12) { x = o.x + (Math.random() - .5) * 10; c.lineTo(x, y); } c.lineTo(o.x, y1); c.stroke(); glowDot(c, o.x, y1, 22, o.fuego ? '#ff6a1a' : '#fff6a0', .6); c.restore();
    },
  };
  // charco de miel: hace lento a quien lo pise
  OBJ.miel = {
    step(o, g, dt) { const p = g.p; if (p.on && p.x > o.x0 && p.x < o.x1 && Math.abs(p.y - o.y) < 3) p.vx *= .55; if (o.vida !== undefined) { o.vida -= dt; if (o.vida <= 0) o.dead = true; } },
    env(o, g, e) { const p = g.p; if (p.x > o.x0 && p.x < o.x1 && Math.abs(p.y - o.y) < 3) e.jumpK = (e.jumpK || 1) * .72; },   // pegajosa: se brinca menos
    draw(c, o, f) { const a = o.vida !== undefined ? Math.min(1, o.vida) : 1; c.save(); c.globalAlpha = a; c.fillStyle = 'rgba(232,160,30,.85)'; c.beginPath(); c.moveTo(o.x0, o.y); for (let x = o.x0; x <= o.x1; x += 3) c.lineTo(x, o.y - 1.6 - Math.sin(x * .4 + f.t * 2) * .6); c.lineTo(o.x1, o.y + 1); c.lineTo(o.x0, o.y + 1); c.fill(); c.fillStyle = 'rgba(255,230,150,.7)'; c.fillRect(o.x0 + 3, o.y - 1.4, (o.x1 - o.x0) * .3, .6); c.restore(); },
  };
  // con el polvo de hadas, izquierda y derecha se invierten
  const p1Prev = p1Input;
  p1Input = function () { const r = p1Prev.apply(this, arguments); if (CUR && CUR.invertido > 0) r.dir = -r.dir; return r; };

  // =================================================================
  //  PIRATA · ¡Al abordaje! — por la muralla, bajo el fuego del barco volador
  // =================================================================
  OBJ.barcoPirata = {
    front: false,
    step(o, g, dt) {
      const p = g.p, j = o.j; j.t += dt; j.at += dt;
      j.x += ((p.x + 150 + Math.sin(j.t * .6) * 30) - j.x) * Math.min(1, dt * .8); j.y = (g.camY || 0) + 62 + Math.sin(j.t * 1.3) * 6; j.face = -1;
      o.tiro -= dt; if (o.tiro <= 0 && !g.win) { o.tiro = 1.7; const n = Math.random() < .4 ? 2 : 1; for (let k = 0; k < n; k++) tiraMira(g, p.x + 30 + Math.random() * 70 + k * 40); }
      if (g.win) o.tiro = 99;
    },
    draw(c, o, f) { dibuja(c, o.j, f); },
  };
  FOE.loro = { beh: 'swoop', w: 10, h: 8, v: 0, high: true };
  FD.loro = (c, e, t) => {
    const al = Math.sin(t * 14 + e.anim) * 2;
    c.fillStyle = '#d9443a'; c.beginPath(); c.ellipse(0, -5, 5, 3.4, -.2, 0, TAU2); c.fill();
    c.fillStyle = '#ffd23f'; c.beginPath(); c.moveTo(-2, -5); c.lineTo(-7, -9 - al); c.lineTo(-1, -3); c.fill(); c.fillStyle = '#2274a5'; c.beginPath(); c.moveTo(-3, -4); c.lineTo(-9, -5 - al * .5); c.lineTo(-3, -2); c.fill();
    c.fillStyle = '#3f9a5a'; c.beginPath(); c.moveTo(-4, -5); c.lineTo(-10, -2); c.lineTo(-4, -3); c.fill();
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(3.2, -6, 1.1, 0, TAU2); c.fill(); c.fillStyle = '#2a2a2a'; c.beginPath(); c.moveTo(4.6, -5.4); c.lineTo(6.4, -4.4); c.lineTo(4.4, -3.8); c.fill();
  };
  PROLOGOS.pirata = {
    nombre: '¡Al abordaje!', lema: 'Lorencillo bombardea la muralla desde su barco volador. Corre por el adarve esquivando las balas (mira dónde marcan) hasta el cañón que te sube al barco.', W: 118,
    fauna: ['loro'], foe: 'loro',
    build(b) {
      b.g(0, 20).P(4).d('T', 2).g(23, 40).e(31, 5, 'loro').blk(36, 9, 2, 2).g(43, 60).blk(51, 8, 2, 3).p(62, 9, 2, { k: 'static' }).g(65, 84).e(74, 4, 'loro').blk(80, 9, 2, 2);
      b.p(86, 9, 2, { k: 'static' }).g(89, 117).e(98, 5, 'loro').Gl(112).c(26, 30, 8).c(46, 50, 8).c(68, 72, 8).c(92, 96, 8);
    },
    inicio(g, def) { g.objs.push({ k: 'barcoPirata', tiro: 2.5, j: falso('pirata', def, { x: L.camMin + 300, y: 62, marcas: [], loros: [], ay: null, face: -1 }) }); },
  };

  // =================================================================
  //  CHAAC · La tormenta — sube el agua y caen rayos; hay que llegar a lo alto
  // =================================================================
  OBJ.inundacion = {
    front: true,
    step(o, g, dt) {
      const p = g.p, j = o.j; j.t += dt; j.at += dt; o.t += dt;
      j.x += ((p.x + 20) - j.x) * Math.min(1, dt * .9); j.y = (g.camY || 0) + 26 + Math.sin(j.t) * 4;
      // el agua sube, pero nunca más rápido que Itzel: se queda a su espalda (abajo)
      // el agua sube sin parar; si se quedó muy abajo, se apura (así siempre amenaza si Itzel se entretiene)
      if (o.t > 3 && !g.win) o.nivel = Math.max(40, o.nivel - (o.nivel - p.y > 110 ? 34 : 9) * dt);
      if (p.y > o.nivel + 2 && !(p.inv > 0)) { MEC.hurt(g, 0); p.vy = -420; p.on = false; p.plat = null; }
      o.rayo -= dt; if (o.rayo <= 0 && !g.win) { o.rayo = 2.1; g.objs.push({ k: 'rayoChaac', x: p.x + (Math.random() - .3) * 60, t: 0 }); }
      g.destello = Math.max(0, (g.destello || 0) - dt);
    },
    draw(c, o, f) {
      const g = f.g, x0 = g.cam - 20, x1 = g.cam + VW + 20, y = o.nivel;
      // lluvia
      c.strokeStyle = 'rgba(200,220,255,.35)'; c.lineWidth = .6; for (let k = 0; k < 60; k++) { const rx = x0 + ((k * 53 + f.t * 40) % (VW + 40)), ry = (f.y0 || 0) + ((k * 97 + f.t * 260) % ((f.H || VH) + 20)); c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx - 2, ry + 7); c.stroke(); }
      // el agua que sube
      c.fillStyle = 'rgba(60,110,170,.55)'; c.beginPath(); c.moveTo(x0, y); for (let x = x0; x <= x1; x += 6) c.lineTo(x, y + Math.sin(x * .08 + f.t * 3) * 2); c.lineTo(x1, VH + 80); c.lineTo(x0, VH + 80); c.fill();
      c.strokeStyle = 'rgba(220,240,255,.7)'; c.lineWidth = .8; c.beginPath(); for (let x = x0; x <= x1; x += 6) c.lineTo(x, y + Math.sin(x * .08 + f.t * 3) * 2); c.stroke();
      dibuja(c, o.j, f);
      if (g.destello > 0) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(255,255,240,${g.destello * 2})`; c.fillRect(0, 0, c.canvas.width, c.canvas.height); c.restore(); }
      if (o.t < 3) aviso(c, g, '¡Chaac llama a la tormenta! Sube antes que el agua', '#cfe3ff');
    },
  };
  PROLOGOS.chaac = {
    nombre: 'La tormenta', lema: 'Chaac suelta el aguacero: el agua sube y caen rayos (mira dónde marcan). Sube hasta lo alto antes de que te alcance.', W: 116,
    build(b) {
      b.g(0, 18).P(4).g(21, 36, 10).blk(30, 8, 2, 2).p(38, 8, 2, { k: 'static' }).g(41, 58, 9).blk(50, 7, 2, 2).g(61, 76, 8).p(78, 6, 2, { k: 'static' }).g(81, 96, 7).blk(89, 5, 2, 2).g(99, 115, 6).Gl(110);
      b.c(24, 28, 8).c(44, 48, 7).c(64, 68, 6).c(84, 88, 5).c(102, 106, 4);
    },
    inicio(g, def) { g.objs.push({ k: 'inundacion', t: 0, nivel: VH + 40, rayo: 3.5, j: falso('chaac', def, { x: L.camMin + 120, y: 26, marcas: [], dir: 1 }) }); },
  };

  // =================================================================
  //  ABEJA · El enjambre — huye del enjambre por el panal; la canción de Fresita lo duerme
  // =================================================================
  OBJ.enjambre = {
    front: true,
    step(o, g, dt) {
      const p = g.p, j = o.j; j.t += dt; j.at += dt;
      if (o.espera > 0) { o.espera -= dt; return; }
      if (g.lull && g.t - g.lull.t < .05 && Math.hypot(g.lull.x - o.x, g.lull.y - o.y) < g.lull.r + 40) { o.duerme = 2.6; ring(g, o.x, o.y, '#b9a7ff', 40, .6); }
      o.duerme = Math.max(0, (o.duerme || 0) - dt);
      if (o.duerme <= 0 && !g.win) { const gap = p.x - o.x, v = gap > 220 ? 150 : gap < 60 ? 70 : 100; o.x += v * dt; o.y += ((p.y - 14) - o.y) * Math.min(1, dt * 2); }
      if (p.x < o.x - 10) o.x = p.x - 150;
      j.x = o.x - 26; j.y = o.y - 6 + Math.sin(j.t * 3) * 3; j.face = 1;
      if (Math.hypot(p.x - o.x, p.y - 8 - o.y) < 22 && !(p.inv > 0) && o.duerme <= 0) { MEC.hurt(g, 1); o.x -= 110; }
    },
    draw(c, o, f) {
      dibuja(c, o.j, f);
      const dormido = o.duerme > 0;
      for (let k = 0; k < 34; k++) { const a = f.t * (dormido ? .6 : 4) + k * 2.399, r = 6 + (k % 7) * 3, x = o.x + Math.cos(a) * r, y = o.y + Math.sin(a * 1.3) * r * .7; c.fillStyle = '#2a1a10'; c.beginPath(); c.ellipse(x, y, 1.6, 1.1, 0, 0, TAU2); c.fill(); c.fillStyle = '#ffbf00'; c.fillRect(x - .6, y - .9, 1.2, .6); if (!dormido) { c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(x, y - 1.6, 1.2, .6, Math.sin(f.t * 40 + k), 0, TAU2); c.fill(); } }
      if (dormido) { c.fillStyle = '#ffffff'; c.font = 'bold 6px "Alegreya Sans", sans-serif'; c.fillText('z z', o.x - 4, o.y - 22 - (f.t * 6 % 4)); }
      if (o.espera > 0) aviso(c, f.g, '¡Despertó el enjambre! Corre; Fresita, cántales (clic derecho)', '#ffe27a');
    },
  };
  PROLOGOS.abeja = {
    nombre: 'El enjambre', lema: 'El enjambre de Xunán Kab te persigue por el panal. La miel te hace lenta; la canción de cuna de Fresita (clic derecho) los duerme un rato.', W: 120,
    build(b) {
      b.g(0, 20).P(4).g(23, 42).o('miel', 30, 0, { x2: 34 }).blk(38, 9, 2, 2).p(44, 9, 2, { k: 'static' }).g(47, 66).o('miel', 52, 0, { x2: 57 }).blk(61, 8, 2, 3);
      b.p(68, 9, 2, { k: 'static' }).p(72, 8, 2, { k: 'static' }).g(75, 94).o('miel', 80, 0, { x2: 86 }).blk(90, 9, 2, 2).g(97, 119).o('miel', 101, 0, { x2: 104 }).Gl(114);
      b.c(25, 28, 8).c(49, 51, 8).c(77, 79, 8).c(106, 110, 8);
    },
    inicio(g, def) { g.objs.push({ k: 'enjambre', x: L.camMin - 40, y: 150, espera: 2.2, j: falso('abeja', def, { filas: [], gotas: [], charcos: [] }) }); },
  };
  OBJ.miel.make = (g, en) => { const y = L.surfaceY(en.x + PAD, en.y ?? 0) * T; g.objs.push({ k: 'miel', x0: tx(en.x), x1: tx(en.x2 + 1), y }); };

  // =================================================================

  // =================================================================
  //  JAGUAR · Acecho — se esconde en el zacatal; Fresita encima lo descubre
  // =================================================================
  OBJ.zacatal = {
    make(g, en) { const x0 = tx(en.x), x1 = tx(en.x2 + 1); g.objs.push({ k: 'zacatal', x0, x1, y: L.surfaceY(en.x + PAD, en.y ?? 0) * T, mueve: 0 }); },
    draw(c, o, f) {
      const g = f.g, jg = g.objs.find(q => q.k === 'jaguarAcecho'), aqui = jg && jg.en === o, visto = aqui && Math.abs(g.fre.x - (o.x0 + o.x1) / 2) < (o.x1 - o.x0) / 2 + 10;
      for (let x = o.x0 + 2; x < o.x1 - 1; x += 3) { const h = 16 + ((x * 7) % 9), sw = Math.sin(f.t * 2 + x * .3) * 1.5 + (aqui && jg.aviso > 0 ? Math.sin(f.t * 40 + x) * 3 : 0); c.strokeStyle = (x % 2 ? '#4f7a2a' : '#6a9a3a'); c.lineWidth = 1.4; c.beginPath(); c.moveTo(x, o.y); c.quadraticCurveTo(x + sw * .5, o.y - h * .6, x + sw, o.y - h); c.stroke(); }
      if (visto) { c.save(); c.globalCompositeOperation = 'lighter'; const ex = jg.ex; for (const d of [-3, 3]) glowDot(c, ex + d, o.y - 10, 4, '#ffe24a', .9); c.restore(); }
    },
  };
  OBJ.jaguarAcecho = {
    front: true,
    step(o, g, dt) {
      const p = g.p, j = o.j; j.t += dt; j.at += dt;
      const zs = g.objs.filter(q => q.k === 'zacatal');
      if (!o.en) o.en = zs.find(z => z.x0 > p.x + 40) || null;
      if (!o.en) return;
      o.ex = o.en.x0 + (o.en.x1 - o.en.x0) * (.5 + Math.sin(j.t) * .3);
      if (o.salto) {
        o.salto.t += dt; const u = Math.min(1, o.salto.t / .55); j.x = lerp(o.salto.x0, o.salto.x1, u); j.y = FLOOR - Math.sin(u * Math.PI) * 40; j.face = o.salto.x1 > o.salto.x0 ? 1 : -1;
        if (Math.abs(p.x - j.x) < 16 && p.y > j.y - 26 && p.y - p.h < j.y && !(p.inv > 0)) MEC.hurt(g, j.face);
        if (u >= 1) { o.salto = null; o.en = zs.find(z => z.x0 > p.x + 80) || null; }
        return;
      }
      const dentro = p.x > o.en.x0 - 4 && p.x < o.en.x1 + 4;
      if (g.lull && g.t - g.lull.t < .05 && Math.hypot(g.lull.x - o.ex, g.lull.y - (o.en.y - 10)) < g.lull.r + 30) { o.en = zs.find(z => z.x0 > o.en.x1 + 20) || null; ring(g, o.ex, o.en ? o.en.y - 10 : 0, '#b9a7ff', 30, .5); return; }
      if (dentro && !(o.aviso > 0)) o.aviso = .75;
      if (o.aviso > 0) { o.aviso -= dt; if (o.aviso <= 0) { o.salto = { t: 0, x0: o.ex, x1: p.x }; g.shake = .2; } }
      if (p.x > o.en.x1 + 30) o.en = zs.find(z => z.x0 > p.x + 40) || null;
    },
    draw(c, o, f) { if (o.salto) dibuja(c, o.j, f); else if (o.aviso > 0) aviso(c, f.g, '¡Se mueve el zacate!', '#ffe27a'); },
  };
  PROLOGOS.jaguar = {
    nombre: 'Acecho en la selva', lema: 'El jaguar se esconde en el zacatal y salta si entras donde está. Fresita, vuela encima del zacate: si está ahí, le brillan los ojos.', W: 116,
    build(b) {
      b.g(0, 16).P(4).d('T', 2).g(17, 36).o('zacatal', 22, 0, { x2: 28 }).d('T', 33).p(38, 9, 2, { k: 'static' }).g(41, 64).o('zacatal', 44, 0, { x2: 49 }).o('zacatal', 55, 0, { x2: 61 });
      b.blk(52, 9, 1, 2).p(66, 9, 2, { k: 'static' }).g(69, 92).o('zacatal', 72, 0, { x2: 78 }).o('zacatal', 83, 0, { x2: 89 }).d('T', 80).g(94, 115).o('zacatal', 97, 0, { x2: 102 }).Gl(110);
      b.c(30, 34, 8).c(50, 53, 6).c(79, 81, 6);
    },
    inicio(g, def) { g.objs.push({ k: 'jaguarAcecho', en: null, aviso: 0, j: falso('jaguar', def, { y: FLOOR, vy: 0, face: -1 }) }); },
  };

  // =================================================================
  //  COCODRILO · El río de troncos — salta de tronco en tronco; el cocodrilo muerde desde abajo
  // =================================================================
  LOOK.tronco = (c, pl, f) => {
    const x = pl.x, y = pl.y, w = pl.w; c.save(); c.globalAlpha = pl.on === false ? .25 : 1;
    c.fillStyle = '#6a4228'; c.beginPath(); roundRect(c, x, y, w, 7, 3.5); c.fill(); c.fillStyle = '#8a5a3a'; c.fillRect(x + 2, y + 1, w - 4, 1.4);
    c.strokeStyle = 'rgba(40,24,12,.6)'; c.lineWidth = .5; for (let k = x + 5; k < x + w - 3; k += 6) { c.beginPath(); c.moveTo(k, y + 3); c.lineTo(k + 3, y + 5); c.stroke(); }
    c.fillStyle = '#c8a070'; c.beginPath(); c.ellipse(x + w - 1, y + 3.5, 1.6, 3.2, 0, 0, TAU2); c.fill(); c.restore();
  };
  OBJ.rio = {
    front: true,
    step(o, g, dt) {
      const p = g.p, j = o.j; j.t += dt; j.at += dt; o.t -= dt;
      if (o.mordida) {
        o.mordida.t += dt; const m = o.mordida;
        if (m.t > .9 && !m.pego) { m.pego = true; g.shake = .3; spawn(g, 16, m.x, FLOOR + 20, { v: 110, life: .6, s: 2, k: 'dust', cols: ['#9fd0f0', '#ffffff'], g: 300 }); if (m.pl) { m.pl.on = false; m.pl.apagado = 2.2; } if (Math.abs(p.x - m.x) < 18 && p.y > FLOOR - 40) MEC.hurt(g, p.x < m.x ? -1 : 1); }
        j.x = m.x; j.y = FLOOR + 30 - (m.t > .9 && m.t < 1.6 ? 40 : 0); j.sub = m.t > .9 && m.t < 1.6 ? 0 : 1; j.atk = 'emboscada'; j.st = 'ataque';
        if (m.t > 1.8) o.mordida = null;
      } else { j.sub = 1; if (o.t <= 0 && !g.win) { o.t = 2.6; const pl = p.plat && p.plat.k === 'move' ? p.plat : null; o.mordida = { t: 0, x: pl ? pl.x + pl.w / 2 : p.x + 30, pl }; } }
      for (const pl of g.plats) if (pl.apagado > 0) { pl.apagado -= dt; if (pl.apagado <= 0) pl.on = true; }
    },
    draw(c, o, f) {
      const g = f.g;
      // el agua del río en los barrancos
      for (const [a, b2] of o.tramos) { const x0 = tx(a), x1 = tx(b2 + 1); c.fillStyle = 'rgba(60,120,140,.6)'; c.fillRect(x0, FLOOR + 8, x1 - x0, 120); c.strokeStyle = 'rgba(220,240,255,.6)'; c.lineWidth = .7; c.beginPath(); for (let x = x0; x <= x1; x += 5) c.lineTo(x, FLOOR + 8 + Math.sin(x * .2 + f.t * 3) * 1.2); c.stroke(); }
      const m = o.mordida;
      if (m && m.t < .9) { for (let k = 0; k < 6; k++) { const bx = m.x + Math.sin(f.t * 9 + k) * 10, by = FLOOR + 14 - ((f.t * 30 + k * 7) % 14); c.strokeStyle = '#ffffff'; c.lineWidth = .5; c.beginPath(); c.arc(bx, by, 1.4, 0, TAU2); c.stroke(); } aviso(c, g, '¡Burbujas! Brinca a otro tronco', '#cfefff'); }
      if (m && m.t > .9 && m.t < 1.6) dibuja(c, o.j, f);
    },
  };
  PROLOGOS.cocodrilo = {
    nombre: 'El río de troncos', lema: 'Cruza el río brincando de tronco en tronco. Cuando salgan burbujas, cámbiate: el cocodrilo muerde desde abajo y hunde el tronco.', W: 112,
    build(b) {
      const TR = (amp, sp, ph) => ({ k: 'move', path: 'h', look: 'tronco', amp, sp, ph });
      b.g(0, 14).P(4).d('T', 2).p(17, 10, 4, TR(20, .9, 0)).p(24, 10, 4, TR(24, .8, 1.5)).p(31, 10, 4, TR(18, 1, 3)).g(37, 46).d('r', 41);
      b.p(49, 10, 4, TR(26, .7, 0)).p(56, 10, 4, TR(20, 1.1, 2)).p(63, 10, 4, TR(28, .8, 4)).p(70, 10, 4, TR(22, .9, 1)).g(77, 84).d('T', 80);
      b.p(87, 10, 4, TR(24, 1, 2)).p(94, 10, 4, TR(20, .9, 0)).p(100, 10, 4, TR(18, 1.2, 3)).g(106, 111).Gl(108);
      b.c(18, 34, 8).c(50, 73, 8).c(88, 103, 8);
    },
    inicio(g, def) { g.objs.push({ k: 'rio', t: 2.5, tramos: [[15, 36], [47, 76], [85, 105]], j: falso('cocodrilo', def, { y: FLOOR, sub: 1, face: -1, erg: 0 }) }); },
  };

  // =================================================================
  //  MYTHOS · Lágrimas de estrella — junta tres lágrimas bajo sus orbes para abrir el portal
  // =================================================================
  OBJ.lagrimaEstrella = {
    make(g, en) { g.objs.push({ k: 'lagrimaEstrella', x: tx(en.x) + 8, y: tl(en.y), t: Math.random() * 3 }); },
    step(o, g, dt) { o.t += dt; const p = g.p; if (Math.hypot(p.x - o.x, p.y - 8 - o.y) < 12) { o.dead = true; g.lagrimas = (g.lagrimas || 0) + 1; ring(g, o.x, o.y, '#bfe8ff', 26, .6); spawn(g, 18, o.x, o.y, { v: 90, life: .7, s: 2, k: 'spark', cols: ['#bfe8ff', '#ffffff', '#ffd27a'] }); if (g.lagrimas >= 3) { L.goal = Object.assign({}, g.portal); } } },
    draw(c, o, f) { const y = o.y + Math.sin(o.t * 2.4) * 2; c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, o.x, y, 14, '#9fd8ff', .6); c.restore(); c.fillStyle = '#e8f6ff'; c.beginPath(); c.moveTo(o.x, y - 6); c.quadraticCurveTo(o.x + 4.5, y + 1, o.x, y + 4); c.quadraticCurveTo(o.x - 4.5, y + 1, o.x, y - 6); c.fill(); },
  };
  OBJ.mythosOrbes = {
    front: true,
    step(o, g, dt) {
      const p = g.p, j = o.j; j.t += dt; j.at += dt;
      j.x += ((p.x + Math.sin(j.t * .6) * 90) - j.x) * Math.min(1, dt * .7); j.y = (g.camY || 0) + 50 + Math.sin(j.t * 1.4) * 8; j.atk = 'orbes'; j.st = 'ataque';
      o.tiro -= dt; if (o.tiro <= 0 && !g.win) { o.tiro = 1.6; const a = Math.atan2(p.y - 8 - j.y, p.x - j.x); for (const d of [-.25, 0, .25]) o.orbes.push({ x: j.x, y: j.y, vx: Math.cos(a + d) * 85, vy: Math.sin(a + d) * 85, t: 0 }); }
      if (g.lull && g.t - g.lull.t < .05) for (const b of o.orbes) if (Math.hypot(b.x - g.lull.x, b.y - g.lull.y) < g.lull.r + 6) b.t = 99;
      for (const b of o.orbes) { b.t += dt; b.x += b.vx * dt; b.y += b.vy * dt; if (Math.abs(b.x - p.x) < 6 && b.y > p.y - p.h - 2 && b.y < p.y + 2 && !(p.inv > 0)) { b.t = 99; MEC.hurt(g, b.vx > 0 ? 1 : -1); } if (SOLID(b.x, b.y)) b.t = 99; }
      o.orbes = o.orbes.filter(b => b.t < 5);
    },
    draw(c, o, f) {
      const g = f.g; dibuja(c, o.j, f);
      for (const b of o.orbes) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, b.x, b.y, 8, '#ff7fd0', .7); c.restore(); c.fillStyle = '#ffd6f0'; c.beginPath(); c.arc(b.x, b.y, 2.2, 0, TAU2); c.fill(); }
      const n = g.lagrimas || 0; aviso(c, g, n >= 3 ? '¡El portal se abrió! Corre hacia él' : `Lágrimas de estrella: ${n} de 3`, n >= 3 ? '#ffd27a' : '#cfe8ff');
    },
  };
  PROLOGOS.mythos = {
    nombre: 'Lágrimas de estrella', lema: 'La Máscara de Calakmul cubre el cielo de orbes. Junta las tres lágrimas de estrella para abrir el portal a su arena; la canción de Fresita deshace los orbes.', W: 96,
    meta(ctx, x, y, t, f) {
      if (x < 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 3; k++) { ctx.strokeStyle = ['#9fd8ff', '#ff7fd0', '#ffd27a'][k]; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(x, y - 18, 10 + k * 3 + Math.sin(t * 3 + k) * 1.5, 16 + k * 3, 0, 0, TAU2); ctx.stroke(); }
      glowDot(ctx, x, y - 18, 22, '#bfe8ff', .5); ctx.restore();
    },
    build(b) {
      b.g(0, 16).P(4).g(19, 34).o('lagrimaEstrella', 26, 7).blk(30, 8, 2, 3).p(36, 8, 2, { k: 'static' }).p(40, 6, 2, { k: 'static' }).o('lagrimaEstrella', 41, 3);
      b.g(44, 62).blk(52, 6, 3, 5).o('lagrimaEstrella', 53, 3).p(64, 9, 2, { k: 'static' }).g(67, 95).Gl(90).c(20, 24, 8).c(46, 50, 8).c(70, 76, 8);
    },
    inicio(g, def) { g.portal = Object.assign({}, L.goal); L.goal = { x: -9999, y: -9999 }; g.lagrimas = 0; g.objs.push({ k: 'mythosOrbes', tiro: 2.5, orbes: [], j: falso('mythos', def, { x: L.camMin + 200, y: 50, conLagrima: true }) }); },
  };

  // =================================================================
  //  RUPTURA · Las dimensiones se rompen — un cuarto por cada mundo de la partida, armado
  //  para su poder; al entrar a cada cuarto cambian el arte y el poder de Fresita. Una grieta
  //  borra el camino detrás de Itzel.
  // =================================================================
  const mundosRun = () => {
    const ids = (RUN.styles || []).map(s => typeof s === 'string' ? s : s.id).filter(id => STYLE_MAP[id] && NIVELES[id] && !NIVELES[id].modo);
    return ids.length ? ids : [curStyle().id].filter(id => NIVELES[id]);
  };
  // el tablero de un poder: la arena que le toca, para armarla en cualquier lado (con o sin sus paredes)
  function tablero(id, conMuros) {
    const d = NIVELES[id], b = Constructor(28), hacer = (window.ARENAS || {})[d.power];
    if (hacer) hacer(b, d);
    else { b.g(0, 0, 0).g(27, 27, 0); for (let x = 1; x <= 26; x++) if (!(x >= 9 && x <= 10) && !(x >= 17 && x <= 18)) b.g(x, x); b.p(9, 9, 2).p(17, 9, 2); }
    if ((d.power === 'burbuja' || d.id === 'agua') && !hacer) b.o('water', 0, 2, { x2: 27 }).o('respiro', 2).o('respiro', 25);
    const rows = b.rows().map(r => r.split(''));
    if (!conMuros) for (const r of rows) { r[0] = r[1]; r[27] = r[26]; }      // sin las paredes: los cuartos se conectan
    // cada pieza con la plataforma de su mundo
    const ents = b.ents.map(e => e.t === 'plat' ? Object.assign({}, e, { o: Object.assign({}, d.plat, e.o || {}) }) : Object.assign({}, e));
    return { rows, ents, d };
  }
  const corre = (e, off) => { const n = Object.assign({}, e); for (const k of ['x', 'x2', 'x0', 'x1']) if (typeof n[k] === 'number') n[k] += off; return n; };
  // poner en el juego las piezas de un tablero (plataformas, sólidos, objetos, zonas, enemigos)
  function ponPiezas(g, ents, d) {
    for (const en of ents) {
      if (en.t === 'plat') g.plats.push(mkPlat(Object.assign({}, en.o, { x: tx(en.x), y: tl(en.y), w: tl(en.w) })));
      else if (en.t === 'solid') g.solids.push({ k: en.k, x: tx(en.x), y: tl(en.y), w: tl(en.w), h: tl(en.h), on: en.on !== false, grp: en.grp });
      else if (en.t === 'zone') g.zones.push({ k: 'swirl', x0: tx(en.x0), x1: tx(en.x1), y0: tl(en.y0), y1: tl(en.y1), t: 0 });
      else if (en.t === 'obj' && OBJ[en.k] && OBJ[en.k].make) OBJ[en.k].make(g, en, d);
      else if (en.t === 'foe') g.foes.push(MEC.mkFoe(en.k || (d.fauna ? d.fauna[0] : d.foe), tx(en.x) + T / 2, en.y === undefined ? L.surfaceY(en.x + PAD, 0) * T : tl(en.y)));
    }
    DYN = g.solids;
  }
  // entrar a otra dimensión: arte, poder, luz y ritmo de ese mundo
  function entraDimension(g, id, txt) {
    const st = STYLE_MAP[id], d = NIVELES[id];
    view.setStyle(st); fit(); view.g = g;
    g.power = d.power; g.def = Object.assign({}, g.def, { power: d.power }); g.lightBase = d.light || 0; g.lightR = d.light || 0; g.beatAuto = d.beatAuto || 0;
    ring(g, g.p.x, g.p.y - 10, '#ffffff', 60, .8); g.shake = .3; if (typeof HUDKEY !== 'undefined') HUDKEY = '';
    if (typeof toast === 'function') toast(txt || `Ahora estás en ${st.name}: Fresita tiene ${MEC.POW[d.power].name.toLowerCase()}`);
  }
  OBJ.grieta = {
    front: true,
    step(o, g, dt) {
      const p = g.p, j = o.j; j.t += dt; j.at += dt;
      // ¿en qué cuarto anda Itzel? cada cuarto es la dimensión de un mundo de la partida
      const k = Math.floor((p.x / T - PAD - o.ini) / 28);
      if (k >= 0 && k < o.ids.length && k !== o.sala && !g.win) { o.sala = k; entraDimension(g, o.ids[k]); }
      if (o.espera > 0) { o.espera -= dt; return; }
      // la grieta no corre tanto: hay que darle tiempo a Fresita de usar el poder de cada cuarto
      const gap = p.x - o.x; o.x += (gap > 240 ? 130 : gap < 70 ? 46 : 70) * dt;
      if (p.x < o.x + 6 && !(p.inv > 0)) { MEC.hurt(g, 1); o.x = p.x - 140; }
      if (p.x < o.x - 10) o.x = p.x - 160;
      j.x = g.cam + VW - 70; j.y = (g.camY || 0) + 60;
    },
    draw(c, o, f) {
      const g = f.g, y0 = (f.y0 || 0) - 4, y1 = VH + 60;
      dibuja(c, o.j, f);
      c.save();
      // la costura entre un cuarto y el siguiente
      c.setLineDash([2, 4]); c.lineWidth = .8;
      for (let k = 1; k < o.ids.length; k++) { const sx = (o.ini + k * 28 + PAD) * T; c.strokeStyle = k % 2 ? 'rgba(255,58,216,.4)' : 'rgba(58,216,255,.4)'; c.beginPath(); c.moveTo(sx, y0); c.lineTo(sx, y1); c.stroke(); }
      c.setLineDash([]);
      // lo que queda detrás de la grieta: el vacío entre dimensiones
      c.fillStyle = '#0a0612'; c.beginPath(); c.moveTo(g.cam - 40, y0); c.lineTo(o.x, y0);
      for (let y = y0; y <= y1; y += 8) c.lineTo(o.x + Math.sin(y * .3 + f.t * 6) * 6 + ((y * 13) % 7), y);
      c.lineTo(g.cam - 40, y1); c.fill();
      c.strokeStyle = '#ff3ad8'; c.lineWidth = 1.4; c.beginPath(); for (let y = y0; y <= y1; y += 8) c.lineTo(o.x + Math.sin(y * .3 + f.t * 6) * 6 + ((y * 13) % 7), y); c.stroke();
      c.strokeStyle = '#3ad8ff'; c.lineWidth = .7; c.beginPath(); for (let y = y0; y <= y1; y += 8) c.lineTo(o.x + 2 + Math.sin(y * .3 + f.t * 6 + 1) * 6, y); c.stroke();
      for (let k = 0; k < 10; k++) { const fy = y0 + ((k * 37 + f.t * 40) % (y1 - y0)), fx = o.x - 10 - ((k * 23) % 40); c.fillStyle = ['#ff3ad8', '#3ad8ff', '#ffffff'][k % 3]; c.fillRect(fx, fy, 2, 2); }
      c.restore();
      if (o.espera > 0) aviso(c, g, '¡Las dimensiones se rompen! Corre antes que la grieta', '#ffb0f0');
    },
  };
  const INI_R = 14;
  PROLOGOS.ruptura = {
    nombre: 'Las dimensiones se rompen', lema: 'Cada cuarto es uno de los mundos que visitaste, con su arte y su poder: Fresita cambia de poder al cruzar. Una grieta borra el camino detrás de ti.',
    get W() { return INI_R + 28 * mundosRun().length + 14; },
    build(b) {
      const ids = mundosRun();
      b.g(0, INI_R - 1).P(4).d('T', 2);
      ids.forEach((id, k) => {
        const tb = tablero(id), off = INI_R + k * 28;
        tb.rows.forEach((r, y) => r.forEach((ch, x) => { if (ch === '#') b.blk(off + x, y, 1, 1); else if (ch === 'o') b.c(off + x, off + x, y); }));
        for (const e of tb.ents) b.ents.push(corre(e, off));
      });
      const fin = INI_R + ids.length * 28; b.g(fin, fin + 13).Gl(fin + 9);
    },
    inicio(g, def) { g.objs.push({ k: 'grieta', x: L.camMin - 60, espera: 2.4, ini: INI_R, ids: mundosRun(), sala: -1, j: falso('ruptura', def, { forma: 0, cambio: 0, ang: 0 }) }); },
  };
  // fase final de la Ruptura: la arena se rehace para el poder de otra dimensión (huecos y piezas) y el jefe se adapta
  let PIEZAS = null;
  const piezasArena = () => {
    if (PIEZAS) return PIEZAS; PIEZAS = new Set(['water', 'respiro']);
    for (const f of Object.values(window.ARENAS || {})) { const b = Constructor(28); try { f(b, {}); } catch (e) {} for (const e of b.ents) if (e.t === 'obj') PIEZAS.add(e.k); }
    return PIEZAS;
  };
  function rearmaArena(g, o, id) {
    const tb = tablero(id, true), meta = L.metaPinta, sacar = piezasArena();
    setLevel(buildLevelFromRows(tb.rows.map(r => r.join('')))); L.goal = { x: -9999, y: -9999 }; L.metaPinta = meta;
    g.plats = g.plats.filter(q => q.pw); g.solids = []; g.zones = g.zones.filter(z => z.k !== 'swirl'); g.objs = g.objs.filter(q => !sacar.has(q.k));
    ponPiezas(g, tb.ents, tb.d);
    entraDimension(g, id, `La arena se volvió ${STYLE_MAP[id].name}: Fresita tiene ${MEC.POW[tb.d.power].name.toLowerCase()}`);
    o.mode = modoJefe(tb.d.power);
    const p = g.p; for (let k = 0; k < 12 && SOLID(p.x, p.y - 4); k++) p.y -= T;       // si quedó adentro de algo, sale para arriba
  }

  // =================================================================
  //  FASE FINAL: con un golpe de vida, el jefe se enfurece y la arena cambia
  // =================================================================
  const FURIA = {
    golem: { aviso: '¡El gólem parte el piso!', paso(o, g, dt) { o.ft -= dt; if (o.ft <= 0) { o.ft = 1.6; for (let k = 0; k < 2; k++) g.objs.push({ k: 'penasco', x: o.x0 + Math.random() * (o.x1 - o.x0), y: -30, vy: 0, aviso: .9 }); } } },
    jaguar: { aviso: '¡El rugido tira el techo!', paso(o, g, dt) { o.ft -= dt; if (o.ft <= 0) { o.ft = 1.2; g.objs.push({ k: 'penasco', x: g.p.x + (Math.random() - .5) * 120, y: -30, vy: 0, aviso: .8 }); } } },
    pirata: { aviso: '¡Andanada de cañones!', paso(o, g, dt) { o.ft -= dt; if (o.ft <= 0) { o.ft = 1.3; tiraMira(g, g.p.x + (Math.random() - .5) * 90); } } },
    chaac: { aviso: '¡Ventarrón!', inicio(o) { o.viento = 1; }, paso(o, g, dt) { o.ft -= dt; if (o.ft <= 0) { o.ft = 3; o.viento = -o.viento; } const p = g.p; if (!p.plat) p.x += o.viento * 34 * dt; } },
    abeja: { aviso: '¡La reina derrama miel!', paso(o, g, dt) { o.ft -= dt; if (o.ft <= 0) { o.ft = 2.2; const x = o.x0 + 20 + Math.random() * (o.x1 - o.x0 - 40); g.objs.push({ k: 'miel', x0: x - 14, x1: x + 14, y: FLOOR, vida: 6 }); } } },
    serpiente: { aviso: '¡Lluvia de fuego!', paso(o, g, dt) { o.ft -= dt; if (o.ft <= 0) { o.ft = 1; g.objs.push({ k: 'rayoChaac', x: g.p.x + (Math.random() - .5) * 100, t: .2, fuego: true }); } } },
    camazotz: { aviso: '¡Camazotz apaga la luz!', inicio(o, g) { g.objs.push({ k: 'apagon' }); } },
    hadas: { aviso: '¡Polvo de hadas: todo al revés!', paso(o, g, dt) { o.ft -= dt; g.invertido = Math.max(0, (g.invertido || 0) - dt); if (o.ft <= 0) { o.ft = 5; g.invertido = 2.4; ring(g, g.p.x, g.p.y - 8, '#ff9ad0', 30, .6); } } },
    cocodrilo: { aviso: '¡Sube el agua del cenote!', inicio(o, g) { g.objs.push({ k: 'aguaArena', nivel: FLOOR + 30, meta: FLOOR - 6 }); } },
    mythos: { aviso: '¡Mythos abre su ojo por completo!', paso(o, g, dt) { o.ft -= dt; if (o.ft <= 0) { o.ft = 2.4; const p = g.p, a = Math.atan2(p.y - 8 - o.y, p.x - o.x); for (const d of [-.3, 0, .3]) o.orbs.push({ x: o.x, y: o.y, vx: Math.cos(a + d) * 90, vy: Math.sin(a + d) * 90, life: 4, c: 'rosa' }); } } },
    ruptura: { aviso: '¡Las dimensiones se mezclan! La arena cambia de mundo y de poder', paso(o, g, dt) { o.ft -= dt; if (o.ft <= 0 && o.st !== 'ventana') { o.ft = 9; const ids = mundosRun(); if (ids.length > 1) { o.nd = (o.nd || 0) + 1; rearmaArena(g, o, ids[o.nd % ids.length]); } } } },
  };
  // camazotz: el apagón en la arena (solo alumbran Fresita e Itzel)
  const velo = mkCanvas(1, 1), vx2 = velo.getContext('2d');
  OBJ.apagon = {
    front: true,
    draw(c, o, f) {
      const g = f.g, S = f.S, W = Math.ceil(VW * S), H = Math.ceil((f.H || VH) * S), y0 = f.y0 || 0;
      if (velo.width !== W || velo.height !== H) { velo.width = W; velo.height = H; }
      vx2.setTransform(1, 0, 0, 1, 0, 0); vx2.globalCompositeOperation = 'source-over'; vx2.clearRect(0, 0, W, H); vx2.fillStyle = 'rgba(4,2,8,.9)'; vx2.fillRect(0, 0, W, H); vx2.globalCompositeOperation = 'destination-out';
      const hueco = (x, y, r) => { const X = (x - g.cam) * S, Y = (y - y0) * S, R = r * S, gr = vx2.createRadialGradient(X, Y, R * .2, X, Y, R); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); vx2.fillStyle = gr; vx2.fillRect(X - R, Y - R, R * 2, R * 2); };
      hueco(g.fre.x, g.fre.y, 70); hueco(g.p.x, g.p.y - 8, 30); if (g.boss) { const cr = JEFES_EXT.core(g.boss); hueco(cr.x, cr.y, 22); }
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(velo, 0, 0); c.restore();
    },
  };
  // cocodrilo: el agua sube un poco por encima del piso: ahí Itzel se mueve lento
  OBJ.aguaArena = {
    front: true,
    step(o, g, dt) { o.nivel += (o.meta - o.nivel) * Math.min(1, dt * .5); const p = g.p; if (p.y > o.nivel) { p.vx *= .8; if (p.vy > 60) p.vy = 60; } },
    draw(c, o, f) { const g = f.g; c.fillStyle = 'rgba(60,120,140,.45)'; c.fillRect(g.cam - 20, o.nivel, VW + 40, 100); c.strokeStyle = 'rgba(220,240,255,.7)'; c.lineWidth = .7; c.beginPath(); for (let x = g.cam - 20; x <= g.cam + VW + 20; x += 5) c.lineTo(x, o.nivel + Math.sin(x * .15 + f.t * 3) * 1.2); c.stroke(); },
  };
  const pasoJefe = OBJ.jefe.step;
  OBJ.jefe.step = function (o, g, dt) {
    const F = FURIA[o.tipo];
    if (F && !o.furia && o.hp === 1 && o.st !== 'muere') {
      o.furia = true; o.ft = 1.5; if (F.inicio) F.inicio(o, g); g.shake = .5;
      if (typeof banner === 'function') banner(JEFES[o.tipo].nombre, '¡Fase final!', F.aviso);
    }
    if (o.furia && o.st !== 'muere') { if (F.paso) F.paso(o, g, dt); pasoJefe.call(this, o, g, dt * 1.2); }   // enfurecido: todo un poco más rápido
    else pasoJefe.call(this, o, g, dt);
    if (o.st === 'muere') { g.invertido = 0; }
  };
  window.FURIA = FURIA;
})();
