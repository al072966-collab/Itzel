'use strict';
// =====================================================================
//  FASES DE LOS JEFES
//  Antes de la arena, cada jefe tiene un PRÓLOGO propio que no se parece
//  a los demás: huir de él, cruzar una cueva a oscuras, montarlo, rescatar
//  a Fresita… Al terminarlo empieza la pelea de siempre en la arena.
//  El prólogo se arma en el arte y con el poder del mundo donde toca.
// =====================================================================
const PROLOGOS = {};
(function () {
  const { OBJ, PK, LOOK, FOE, FD, BEH, mkPlat, ring, tx, tl } = MEC;
  const FLOOR = 11 * T, TAU2 = Math.PI * 2;
  const palDe = def => { const s = (def && def.skin) || MEC.DEFAULT_SKIN, f = s.foe || MEC.DEFAULT_SKIN.foe; return { a: f.main, b: f.dark, c: f.light, core: s.accent || '#ff6b9a', eye: f.eye || '#ffffff', glow: s.light || s.accent || '#ffffff' }; };
  // un jefe "de utilería" para dibujarlo fuera de su arena con su mismo cuerpo (y la técnica del mundo)
  const falso = (tipo, def, extra) => Object.assign({ k: 'falso', tipo, pal: palDe(def), x: 0, y: 0, face: 1, t: 0, at: 0, st: 'ataque', atk: JEFES[tipo].ataques[0], ai: 0, hgt: 92, flash: 0, stunT: 0, orbs: [], waves: [], ondas: [], crias: [], mode: 'control', hp: 3, max: 3 }, extra);
  const dibuja = (c, o, f) => { try { JEFES_EXT.BODY[o.tipo](c, o, f); } catch (e) { /* un cuerpo que pide algo que el prólogo no tiene: no se dibuja */ } };
  const aviso = (c, g, txt, col = '#ffffff') => { const cx = g.cam + VW / 2; c.save(); c.font = 'bold 7px "Alegreya Sans", sans-serif'; c.textAlign = 'center'; c.lineWidth = 2.4; c.strokeStyle = 'rgba(0,0,0,.6)'; const y = (g.camY || 0) + 46; c.strokeText(txt, cx, y); c.fillStyle = col; c.fillText(txt, cx, y); c.restore(); };

  // ---------------------------------------------------------------
  //  el flujo: el primer startBoss del mundo arma el prólogo; al llegar a su meta, la arena
  // ---------------------------------------------------------------
  function iniciaPrologo(tipo) {
    STATE = 'loading'; showScreen(''); $('loading').classList.add('on');
    const st = curStyle(), base = NIVELES[st.id], P = PROLOGOS[tipo];
    $('loadName').textContent = P.nombre;
    setTimeout(() => {
      // mismo id que el nivel del mundo: así se viste con el arte actual de su mapa (antes salía el telón viejo del estilo)
      const def = Object.assign({}, base, { id: base.id, prologo: tipo, nombre: P.nombre, lema: P.lema, W: P.W, meta: P.meta || null, fauna: P.fauna || base.fauna, foe: P.foe || base.foe });
      const b = Constructor(P.W); P.build(b, base); setLevel(buildLevelFromRows(b.rows()));
      CUR = makeGame(); MEC.init(CUR, def, b.ents); CUR.def = def; CUR.isPrologo = tipo; COOP.init(CUR);
      if (P.inicio) P.inicio(CUR, base);
      view.auto = false; view.setStyle(st); fit(); view.g = CUR; view.y0 = CUR.camY ?? VH - VISTA.H; view.render();
      $('loading').classList.remove('on'); $('hud').classList.add('on'); HUDKEY = '';
      banner(JEFES[tipo].nombre, P.nombre, P.lema);
      STATE = 'play';
    }, 60);
  }
  const jefeQueSigue = () => RUN.jefeOrden[RUN.bossIdx || 0] || 'ruptura';
  GANCHOS.en('startBoss', sbPrev => function () {
    const tipo = jefeQueSigue();
    if (PROLOGOS[tipo] && RUN.prologo !== RUN.world + ':' + tipo && !RUN.sinPrologo) { RUN.prologo = RUN.world + ':' + tipo; iniciaPrologo(tipo); return; }
    sbPrev.apply(this, arguments);
  });
  GANCHOS.en('levelDone', ldPrev => function () { if (CUR && CUR.isPrologo) { startBoss(); return; } ldPrev.apply(this, arguments); });
  // con Fresita encerrada, el ratón no la mueve ni usa poderes
  GANCHOS.en('stepFresita', sfPrev => function (g, mouse, dt) {
    if (g.jaula && !g.jaula.abierta) { g.fre.x = g.jaula.x; g.fre.y = g.jaula.y - 12 + Math.sin(g.t * 2) * 1.5; mouse.clicks.length = 0; return; }
    return sfPrev.apply(this, arguments);
  });
  window.iniciaPrologo = iniciaPrologo;
  window.FASES_UTIL = { falso, dibuja, aviso, palDe, FLOOR };

  // =================================================================
  //  GÓLEM · ¡Corre! — despierta en el cañón y persigue a Itzel hasta la arena
  // =================================================================
  OBJ.golemPersigue = {
    step(o, g, dt) {
      const p = g.p, j = o.j; j.t += dt; j.at += dt;
      if (o.espera > 0) { o.espera -= dt; if (o.espera <= 0) { g.shake = .5; ring(g, o.x, FLOOR - 50, '#ffffff', 40, .6); } return; }
      // corre un poco más lento que Itzel; si se queda muy atrás, apura el paso (y si la alcanza, la avienta adelante)
      if (o.ruge > 0) { o.ruge -= dt; j.atk = 'pisoton'; return; }
      const gap = p.x - o.x, v = gap > 230 ? 155 : gap < 70 ? 84 : 112;
      o.x += v * dt; j.x = o.x; j.face = 1; j.atk = 'embestida'; j.st = 'ataque'; j.at = (j.at % 2);
      o.paso += dt; if (o.paso > .55) { o.paso = 0; g.shake = Math.max(g.shake || 0, .12); spawn(g, 8, o.x + 10, FLOOR, { ang: -Math.PI / 2, spread: 2, v: 60, life: .5, s: 2, k: 'dust', cols: [j.pal.c, j.pal.b] }); }
      // si la alcanza: le pega, pero él se tambalea hacia atrás y ruge (no avienta a Itzel a un barranco)
      if (p.x < o.x + 24 && p.vis && !(p.inv > 0)) { MEC.hurt(g, 1); o.x = p.x - 110; o.ruge = 1.1; g.shake = .4; }
      if (p.x < o.x - 10) o.x = p.x - 160;          // Itzel volvió a aparecer detrás (se cayó): el gólem se acomoda atrás de ella
      // peñascos que avienta por delante (con aviso de su sombra)
      o.tiro -= dt; if (o.tiro <= 0 && gap < 260) { o.tiro = 2.4; g.objs.push({ k: 'penasco', x: p.x + 50 + Math.random() * 40, y: -30, vy: 0, aviso: .9 }); }
      if (g.win) o.espera = 99;
    },
    draw(c, o, f) { dibuja(c, o.j, f); if (o.espera > 0 && o.espera < 99) aviso(c, f.g, '¡El gólem despertó! ¡Corre!', '#ffd27a'); },
    front: true,
  };
  OBJ.penasco = {
    step(o, g, dt) {
      if (o.aviso > 0) { o.aviso -= dt; return; }
      o.vy += 700 * dt; o.y += o.vy * dt; const p = g.p;
      if (Math.abs(p.x - o.x) < 9 && o.y > p.y - p.h - 4 && o.y < p.y + 2) { o.dead = true; MEC.hurt(g, p.x < o.x ? -1 : 1); }
      if (SOLID(o.x, o.y + 5) || o.y > VH) { o.dead = true; g.shake = Math.max(g.shake || 0, .15); spawn(g, 14, o.x, o.y, { v: 90, life: .6, s: 2, k: 'dust', cols: ['#8a8070', '#5a5448', '#c8b89a'] }); }
    },
    draw(c, o) {
      const gy = L.surfaceY(Math.floor(o.x / T), 0) * T;
      c.fillStyle = `rgba(0,0,0,${o.aviso > 0 ? .25 + Math.sin(o.aviso * 30) * .1 : .3})`; c.beginPath(); c.ellipse(o.x, gy, 9, 2.4, 0, 0, TAU2); c.fill();
      if (o.aviso > 0) return;
      c.fillStyle = '#6a6458'; c.beginPath(); c.moveTo(o.x - 7, o.y); c.lineTo(o.x - 3, o.y - 6); c.lineTo(o.x + 5, o.y - 5); c.lineTo(o.x + 7, o.y + 2); c.lineTo(o.x + 1, o.y + 6); c.lineTo(o.x - 6, o.y + 4); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.moveTo(o.x - 3, o.y - 5); c.lineTo(o.x + 4, o.y - 4); c.lineTo(o.x, o.y - 1); c.fill();
    },
  };
  PROLOGOS.golem = {
    nombre: '¡Corre, que viene el Mascarón!', lema: 'El Mascarón despertó en Edzná. Corre hasta su arena sin que te alcance; cuidado con los peñascos que avienta.', W: 124,
    build(b) {
      b.g(0, 22).P(6).d('T', 3).g(26, 40).blk(33, 9, 2, 2).g(44, 62).blk(52, 8, 2, 3).p(64, 9, 2, { k: 'static' }).g(67, 90).blk(75, 9, 3, 2).blk(84, 8, 2, 3).g(94, 123).Gl(118).d('r', 98).d('T', 110);
      b.c(29, 31, 8).c(55, 57, 6).c(78, 80, 7).c(100, 104, 8);
    },
    inicio(g, def) { g.objs.push({ k: 'golemPersigue', x: L.camMin - 40, espera: 2.2, paso: 0, tiro: 3, j: falso('golem', def, { y: FLOOR, hgt: 92, x: L.camMin - 40 }) }); },
  };

  // =================================================================
  //  CAMAZOTZ · La cueva sin luz — a oscuras; cuando chilla, nadie se mueve
  // =================================================================
  const sombra = mkCanvas(1, 1), sx = sombra.getContext('2d');
  OBJ.cuevaOscura = {
    front: true,
    step(o, g, dt) {
      const p = g.p, j = o.j; j.t += dt; j.at += dt; o.t += dt;
      // Camazotz revolotea arriba de Itzel, lejos de la luz de Fresita
      const lejos = Math.hypot(g.fre.x - j.x, g.fre.y - j.y) < 50 ? -1 : 1;
      if (o.fase === 'picada') { o.tp = (o.tp || 0) + dt; const dx = p.x - j.x, dy = p.y - 8 - j.y, d = Math.hypot(dx, dy); j.x += dx / (d || 1) * 230 * dt; j.y += dy / (d || 1) * 230 * dt; j.atk = 'picada'; j.at = 1; if (d < 12) { MEC.hurt(g, p.x < j.x ? -1 : 1); o.fase = 'sube'; o.tp = 0; } else if (o.tp > 2.5) { o.fase = 'sube'; o.tp = 0; } }
      else { const tx2 = p.x - 70 * lejos + Math.sin(o.t * .9) * 40, ty2 = (g.camY || 0) + 40 + Math.sin(o.t * 1.7) * 12; j.x += (tx2 - j.x) * Math.min(1, dt * 1.5); j.y += (ty2 - j.y) * Math.min(1, dt * 1.5); j.atk = 'chillido'; if (o.fase === 'sube' && Math.abs(j.y - ty2) < 10) o.fase = 'ronda'; }
      j.face = p.x > j.x ? 1 : -1;
      // el ciclo del chillido: aviso, chillido (no te muevas) y descanso
      o.ciclo -= dt;
      if (o.estado === 'calma' && o.ciclo <= 0) { o.estado = 'aviso'; o.ciclo = 1.1; }
      else if (o.estado === 'aviso' && o.ciclo <= 0) { o.estado = 'chilla'; o.ciclo = 1.8; g.shake = .2; }
      else if (o.estado === 'chilla') {
        const mueve = Math.abs(p.vx) > 18 || !p.on;
        if (mueve && o.fase === 'ronda') { o.fase = 'picada'; o.blanco = [p.x, p.y - 8]; }
        if (o.ciclo <= 0) { o.estado = 'calma'; o.ciclo = 3.5 + Math.random() * 2; }
      }
      if (g.win) o.estado = 'calma';
    },
    draw(c, o, f) {
      const g = f.g, S = f.S, W = Math.ceil(VW * S), H = Math.ceil((f.H || VH) * S), y0 = f.y0 || 0;
      dibuja(c, o.j, f);
      // la oscuridad: un velo negro con huecos donde hay luz (Fresita, Itzel, los cristales)
      if (sombra.width !== W || sombra.height !== H) { sombra.width = W; sombra.height = H; }
      sx.setTransform(1, 0, 0, 1, 0, 0); sx.globalCompositeOperation = 'source-over'; sx.clearRect(0, 0, W, H); sx.fillStyle = 'rgba(4,2,8,.95)'; sx.fillRect(0, 0, W, H);
      sx.globalCompositeOperation = 'destination-out';
      const hueco = (x, y, r) => { const X = (x - g.cam) * S, Y = (y - y0) * S, R = r * S, gr = sx.createRadialGradient(X, Y, R * .2, X, Y, R); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); sx.fillStyle = gr; sx.fillRect(X - R, Y - R, R * 2, R * 2); };
      hueco(g.fre.x, g.fre.y, 62 + Math.sin(f.t * 3) * 3); hueco(g.p.x, g.p.y - 8, 26);
      for (const q of g.objs) if (q.k === 'cristalCueva') hueco(q.x, q.y - 6, 40);
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(sombra, 0, 0); c.restore();
      // los ojos de Camazotz brillan aunque esté oscuro
      const j = o.j; c.save(); c.globalCompositeOperation = 'lighter'; for (const d of [-1, 1]) glowDot(c, j.x + d * 3.5, j.y - 2, 6, '#ff3a3a', .8); c.restore();
      if (o.estado === 'aviso') { aviso(c, g, '¡Va a chillar! Quietos…', '#ffb0a0'); c.strokeStyle = `rgba(255,80,80,${.4 + Math.sin(f.t * 20) * .3})`; c.lineWidth = 1; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(j.x, j.y, 10 + k * 8 + (1.1 - o.ciclo) * 20, 0, TAU2); c.stroke(); } }
      if (o.estado === 'chilla') { aviso(c, g, '¡CHILLA! No se muevan', '#ff6a5a'); c.strokeStyle = 'rgba(255,60,60,.5)'; c.lineWidth = 1.4; for (let k = 0; k < 4; k++) { const r = ((f.t * 90 + k * 30) % 120); c.beginPath(); c.arc(j.x, j.y, r, 0, TAU2); c.stroke(); } }
    },
  };
  OBJ.cristalCueva = {
    make(g, en) { g.objs.push({ k: 'cristalCueva', x: tx(en.x) + 8, y: L.surfaceY(en.x + PAD, en.y ?? 0) * T }); },
    draw(c, o, f) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, o.x, o.y - 6, 18, '#9fd8ff', .5 + Math.sin(f.t * 2 + o.x) * .15); c.restore(); c.fillStyle = '#bfe8ff'; c.beginPath(); c.moveTo(o.x - 4, o.y); c.lineTo(o.x - 2, o.y - 10); c.lineTo(o.x + 1, o.y - 14); c.lineTo(o.x + 3, o.y - 8); c.lineTo(o.x + 5, o.y); c.fill(); },
  };
  PROLOGOS.camazotz = {
    nombre: 'La cueva sin luz', lema: 'Solo alumbra Fresita. Cuando Camazotz chille, quédense quietos: si te mueves, te encuentra.', W: 112,
    build(b) {
      b.g(0, 18).P(4).o('cristalCueva', 10).g(21, 36).blk(28, 9, 2, 2).o('cristalCueva', 33).p(38, 9, 2, { k: 'static' }).g(41, 58).o('cristalCueva', 49).blk(54, 8, 2, 3);
      b.p(60, 9, 2, { k: 'static' }).p(64, 8, 2, { k: 'static' }).g(68, 86).o('cristalCueva', 76).blk(82, 9, 2, 2).p(88, 9, 2, { k: 'static' }).g(91, 111).o('cristalCueva', 98).Gl(106);
      b.c(23, 26, 8).c(45, 48, 8).c(70, 74, 8).c(93, 97, 8);
    },
    inicio(g, def) { g.objs.push({ k: 'cuevaOscura', t: 0, ciclo: 4, estado: 'calma', fase: 'ronda', j: falso('camazotz', def, { x: L.camMin + 60, y: 40 }) }); },
  };

  // =================================================================
  //  SERPIENTE · A lomo de Kukulkán — su cuerpo es la plataforma; hay que llegar a la cabeza
  // =================================================================
  OBJ.kukulkan = {
    front: false,
    step(o, g, dt) {
      const j = o.j; j.t += dt; o.a -= dt * o.vel;
      const hx = o.cx + Math.cos(o.a) * o.rx, hy = o.cy + Math.sin(o.a) * o.ry;
      o.hist.unshift([hx, hy]); if (o.hist.length > 400) o.hist.pop();
      // cada segmento va por el camino de la cabeza, a distancia fija
      let k = 0, acc = 0; for (let i = 0; i < j.seg.length; i++) { const dist = i * 11; while (k < o.hist.length - 1 && acc < dist) { acc += Math.hypot(o.hist[k][0] - o.hist[k + 1][0], o.hist[k][1] - o.hist[k + 1][1]); k++; } const q = o.hist[k]; j.seg[i].x = q[0]; j.seg[i].y = q[1]; }
      j.x = j.seg[0].x; j.y = j.seg[0].y; j.atk = 'cola'; j.st = 'ataque';
      // la joya de la frente: si Itzel le cae encima, Kukulkán se rinde y la lleva a su nido
      const p = g.p, h = j.seg[0];
      if (!o.hecho && p.vy > 0 && Math.abs(p.x - h.x) < 9 && p.y > h.y - 12 && p.y < h.y + 4) { o.hecho = true; p.vy = -380; j.flash = .8; g.shake = .4; spawn(g, 24, h.x, h.y, { v: 140, life: .8, s: 2.4, k: 'spark', cols: [j.pal.core, '#ffffff'] }); setTimeout(() => { if (CUR === g) g.win = g.t; }, 1200); }
      j.flash = Math.max(0, j.flash - dt);
    },
    draw(c, o, f) { dibuja(c, o.j, f); if (!o.hecho) { const h = o.j.seg[0]; c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, h.x, h.y - 3, 8 + Math.sin(f.t * 6) * 2, o.j.pal.core, .7); c.restore(); } else aviso(c, f.g, '¡Kukulkán te lleva a su nido!', '#ffd27a'); },
  };
  // el lomo es una rampa continua de segmento a segmento (plataforma inclinada), para poder correr cuesta arriba
  const pkSeg = PK.seg;
  PK.seg = (pl, g, d, dt) => { if (!pl.serp) return pkSeg && pkSeg(pl, g, d, dt); const a = pl.serp.j.seg[pl.i], b2 = pl.serp.j.seg[pl.i - 1]; pl.x = a.x; pl.y = a.y - 5; pl.x2 = b2.x; pl.y2 = b2.y - 5; pl.w = Math.abs(pl.x2 - pl.x) || 1; };
  LOOK.nada = () => {};
  PROLOGOS.serpiente = {
    nombre: 'A lomo de Kukulkán', lema: 'La serpiente vuela sobre el vacío: súbete a su lomo, corre hasta la cabeza y cáele en la joya de la frente.', W: 72,
    build(b) { b.g(0, 13).P(5).d('T', 3).g(66, 71); },
    inicio(g, def) {
      const o = { k: 'kukulkan', a: Math.PI * .75, vel: .26, cx: L.camMin + 37 * T, cy: 104, rx: 22 * T, ry: 58, hist: [], j: falso('serpiente', def, { seg: Array.from({ length: 12 }, () => ({ x: 0, y: 0 })), trail: [] }) };
      for (let i = 0; i < 400; i++) OBJ.kukulkan.step(o, g, 1 / 60);
      g.objs.push(o);
      for (let i = 2; i < o.j.seg.length; i++) { const pl = mkPlat({ k: 'seg', look: 'nada', x: 0, y: 0, w: 11 }); pl.serp = o; pl.i = i; PK.seg(pl, g); g.plats.push(pl); }
    },
  };

  // =================================================================
  //  HADAS · ¡Se llevaron a Fresita! — Itzel sola por el jardín de los espejos hasta la jaula
  // =================================================================
  FOE.hadita = { beh: 'fly', w: 8, h: 8, v: 0, rx: 34, ry: 16, sp: 1.6, fig: true };
  FD.hadita = (c, e, t) => {
    c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 0, -5, 9, '#ffb0f0', .5); c.restore();
    const al = Math.sin(t * 30 + e.anim) * .5; c.fillStyle = 'rgba(220,240,255,.7)'; for (const s of [1, -1]) { c.beginPath(); c.ellipse(-1 + s * .5, -8 - al, 2.6, 4, s * .6, 0, TAU2); c.fill(); }
    c.fillStyle = '#ff7fd0'; c.beginPath(); c.arc(0, -5, 2.2, 0, TAU2); c.fill(); c.fillStyle = '#fff6c8'; c.beginPath(); c.arc(0, -7.6, 1.4, 0, TAU2); c.fill();
  };
  // espejo mágico: entrar en él te saca por su pareja
  OBJ.espejo = {
    make(g, en) { g.objs.push({ k: 'espejo', x: tx(en.x) + 8, y: L.surfaceY(en.x + PAD, en.y ?? 0) * T, par: en.par, cd: 0 }); },
    step(o, g, dt) {
      o.cd = Math.max(0, o.cd - dt); const p = g.p;
      if (o.cd > 0 || Math.abs(p.x - o.x) > 6 || Math.abs(p.y - o.y) > 4) return;
      const otro = g.objs.find(q => q.k === 'espejo' && q !== o && q.par === o.par); if (!otro) return;
      p.x = otro.x + 12; p.y = otro.y; p.vx = 0; otro.cd = 1; o.cd = 1; ring(g, o.x, o.y - 14, '#ffb0f0', 20, .5); ring(g, otro.x, otro.y - 14, '#ffb0f0', 20, .5); spawn(g, 14, otro.x, otro.y - 12, { v: 70, life: .6, s: 1.8, k: 'spark', cols: ['#ffb0f0', '#ffffff', '#b0e0ff'] });
    },
    draw(c, o, f) {
      const x = o.x, y = o.y;
      c.fillStyle = '#c9a24a'; c.beginPath(); c.ellipse(x, y - 14, 7.5, 13, 0, 0, TAU2); c.fill();
      const gr = c.createLinearGradient(x - 6, y - 26, x + 6, y - 2); gr.addColorStop(0, '#e8f6ff'); gr.addColorStop(.5, '#a8c8f0'); gr.addColorStop(1, '#f0d8ff'); c.fillStyle = gr; c.beginPath(); c.ellipse(x, y - 14, 6, 11.5, 0, 0, TAU2); c.fill();
      c.fillStyle = `rgba(255,255,255,${.4 + Math.sin(f.t * 3 + x) * .2})`; c.beginPath(); c.ellipse(x - 2, y - 18, 1.4, 5, -.3, 0, TAU2); c.fill();
      c.fillStyle = '#ff7fd0'; c.beginPath(); c.arc(x, y - 28, 1.6, 0, TAU2); c.fill();
    },
  };
  // la jaula de Fresita: tres golpes desde arriba y se abre
  OBJ.jaula = {
    make(g, en) { const o = { k: 'jaula', x: tx(en.x) + 8, y: L.surfaceY(en.x + PAD, en.y ?? 0) * T, golpes: 0, cd: 0, abierta: false }; g.objs.push(o); g.jaula = o; },
    step(o, g, dt) {
      o.cd = Math.max(0, o.cd - dt); if (o.abierta) return; const p = g.p, top = o.y - 30;
      const antes = o.py ?? p.y; o.py = p.y;
      if (o.cd <= 0 && p.vy > 0 && Math.abs(p.x - o.x) < 11 && antes <= top + 2 && p.y >= top - 2) {
        o.golpes++; o.cd = .4; p.vy = -330; p.y = top - 4; g.shake = .2; spawn(g, 10, o.x, top, { v: 70, life: .5, s: 1.8, k: 'spark', cols: ['#c9a24a', '#ffffff'] });
        if (o.golpes >= 3) { o.abierta = true; ring(g, o.x, o.y - 14, '#ff9ad0', 40, .8); spawn(g, 30, o.x, o.y - 14, { v: 120, life: 1, s: 2.2, k: 'confetti', cols: ['#ff9ad0', '#ffffff', '#ffd27a'], g: 120 }); setTimeout(() => { if (CUR === g) g.win = g.t; }, 1400); }
      }
    },
    draw(c, o, f) {
      const x = o.x, y = o.y, top = o.y - 30;
      if (o.abierta) { c.strokeStyle = '#c9a24a'; c.lineWidth = .9; c.beginPath(); c.moveTo(x - 10, y); c.lineTo(x - 14, top + 8); c.moveTo(x + 10, y); c.lineTo(x + 15, top + 10); c.stroke(); aviso(c, f.g, '¡Fresita es libre! Vamos por la reina', '#ffd27a'); return; }
      c.strokeStyle = '#c9a24a'; c.lineWidth = 1; c.beginPath(); c.arc(x, top + 6, 10, Math.PI, 0); c.stroke();
      for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(x + k * 4.5, top + 2 + Math.abs(k)); c.lineTo(x + k * 4.5, y); c.stroke(); }
      c.fillStyle = '#c9a24a'; c.fillRect(x - 11, y - 2, 22, 2.4); c.fillRect(x - 1.5, top - 6, 3, 6); c.beginPath(); c.arc(x, top - 7, 2.4, 0, TAU2); c.fill();
      for (let k = 0; k < 3; k++) { c.fillStyle = k < o.golpes ? '#ffd27a' : 'rgba(255,255,255,.3)'; c.beginPath(); c.arc(x - 4 + k * 4, top - 12, 1.1, 0, TAU2); c.fill(); }
      if (Math.hypot(f.g.p.x - x, f.g.p.y - y) < 90) aviso(c, f.g, 'Cáele encima a la jaula tres veces', '#ffffff');
    },
  };
  PROLOGOS.hadas = {
    nombre: '¡Se llevaron a Fresita!', lema: 'Las luces de la Xtabay encerraron a Fresita al pie de la ceiba. Itzel va sola: los espejos mágicos llevan al otro lado de los setos.', W: 116,
    fauna: ['hadita'], foe: 'hadita',
    build(b) {
      b.g(0, 20).P(4).d('f', 8).d('T', 14).g(23, 38).e(30, 6, 'hadita').blk(34, 2, 2, 9).o('espejo', 32, 0, { par: 1 }).o('espejo', 41, 0, { par: 1 });
      b.g(39, 56).e(48, 7, 'hadita').d('f', 44).p(58, 9, 2, { k: 'static' }).p(62, 8, 2, { k: 'static' }).g(66, 82).blk(76, 1, 3, 10).o('espejo', 74, 0, { par: 2 }).o('espejo', 85, 0, { par: 2 }).e(70, 6, 'hadita');
      b.g(83, 115).e(94, 6, 'hadita').d('T', 90).o('jaula', 108).c(96, 104, 8);
    },
    inicio(g) { if (g.jaula) { g.fre.x = g.jaula.x; g.fre.y = g.jaula.y - 12; } },
  };
})();
