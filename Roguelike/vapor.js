'use strict';
// =====================================================================
//  MUNDO «LA FÁBRICA DE VAPOR» (arte de Vapor y Engranajes, la Práctica 4)
//  · Poder de Fresita: VÁLVULA. Clic en una válvula (o en una rejilla): sus
//    rejillas sueltan una columna de vapor que sube a Itzel.
//  · Plataformas: engranes que giran con una tabla encima.
//  · Enemigos: araña de engranes, zángano de vapor, mecha y torreta.
//  · Jefe nuevo: el BrawBot de latón (golpe con aviso, onda de choque y calderas).
// =====================================================================
(function () {
  const { LOOK, BEH, OBJ, POW, FOE, FD, walkStep, gravity, onGround, ring, tx } = MEC;
  const { pinta, img, listo } = VAPOR;

  // ---------------- plataforma: engrane que gira con una tabla encima ----------------
  LOOK.engrane = (c, pl, f) => {
    const cx = pl.x + pl.w / 2;
    c.save(); c.translate(cx, pl.y + 9); c.rotate(f.t * 1.4 + pl.x * .01); pinta(c, 'engranaje_sierra', 0, 0, .2, 38, 37.5); c.restore();
    const viga = img('tile_viga_acero');
    if (listo(viga)) { const s0 = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false; c.drawImage(viga, pl.x, pl.y, pl.w, 8); c.imageSmoothingEnabled = s0; }
    else { c.fillStyle = '#6a4a30'; c.fillRect(pl.x, pl.y, pl.w, 6); }
  };

  // ---------------- rejillas de vapor y válvulas ----------------
  const SUBE = 96; // alto de la columna de vapor (arriba Itzel flota)
  OBJ.vent = {
    make(g, en) { g.objs.push({ k: 'vent', x: tx(en.x) + 8, y: L.surfaceY(en.x + PAD, en.y ?? 0) * T, grp: en.grp || 0, on: 0, t: Math.random() * 3 }); },
    step(o, g, dt) {
      o.t += dt; o.on = Math.max(0, o.on - dt);
      if (o.on > 0 && !o.zona) { o.zona = { k: 'vapor', x0: o.x - 14, x1: o.x + 14, y0: o.y - SUBE, y1: o.y + 2, life: 99 }; g.zones.push(o.zona); }
      if (o.on <= 0 && o.zona) { g.zones = g.zones.filter(z => z !== o.zona); o.zona = null; }
      if (o.on > 0 && Math.random() < dt * 30) spawn(g, 1, o.x + (Math.random() - .5) * 12, o.y - 4, { ang: -Math.PI / 2, spread: .4, v: 90 + Math.random() * 60, life: .9, s: 3, k: 'dust', cols: ['#e8e0d8', '#c8c0b8'], g: -40 });
      else if (o.on <= 0 && (o.t % 2.6) < dt) spawn(g, 4, o.x, o.y - 4, { ang: -Math.PI / 2, spread: .5, v: 30, life: .6, s: 2, k: 'dust', cols: ['#d8d0c8'], g: -20 }); // resoplido de aviso
    },
    draw(c, o, f) {
      pinta(c, 'vent_' + (o.on > 0 ? Math.floor(f.t * 12) % 3 : 0), o.x, o.y + 1, .25, 32, 64);
      if (o.on > 0) { c.save(); c.globalAlpha = Math.min(1, o.on) * .5; const g2 = c.createLinearGradient(0, o.y - SUBE, 0, o.y); g2.addColorStop(0, 'rgba(240,235,230,0)'); g2.addColorStop(1, 'rgba(240,235,230,.8)'); c.fillStyle = g2; c.fillRect(o.x - 10, o.y - SUBE, 20, SUBE); c.restore(); }
    },
  };
  OBJ.valvula = {
    make(g, en) { g.objs.push({ k: 'valvula', x: tx(en.x) + 8, y: L.surfaceY(en.x + PAD, en.y ?? 0) * T, grp: en.grp || 0 }); },
    draw(c, o, f) { const on = f.g.objs.some(q => q.k === 'vent' && q.grp === o.grp && q.on > 0); pinta(c, on ? 'valvula_on' : 'valvula_off', o.x, o.y + 1, .22, 24, 144); if (!on) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, o.x, o.y - 26, 7, '#ffb040', .3 + Math.sin(f.t * 4) * .15); c.restore(); } },
  };
  POW.valvula = { name: 'Válvula de vapor', help: 'Clic en una válvula (o en una rejilla): sus rejillas sueltan una columna de vapor que sube a Itzel.', cd: .4,
    click(g, x, y) {
      const cerca = (g.objs || []).filter(o => (o.k === 'valvula' || o.k === 'vent') && Math.abs(o.x - x) < 16 && y > o.y - 40 && y < o.y + 10);
      if (!cerca.length) return false;
      const grp = cerca[0].grp; for (const o of g.objs) if (o.k === 'vent' && o.grp === grp) { o.on = 6; ring(g, o.x, o.y - 6, '#f0e8e0', 18, .5); }
      return true;
    } };

  // ---------------- enemigos con sus sprites ----------------
  Object.assign(FOE, {
    arana: { beh: 'walk', v: 28, w: 14, h: 9 },
    zangano: { beh: 'drone', w: 14, h: 9 },
    mecha: { beh: 'charge', v: 20, w: 12, h: 19 },
    torreta: { beh: 'torreta', w: 20, h: 12 },
  });
  BEH.torreta = (e, g, d, toP) => {
    const p = g.p; if (e.vy !== 0 || !onGround(e)) { gravity(e, d); return; }
    e.tt -= d; e.dir = Math.sign(toP) || e.dir;
    if (e.tt <= 0 && Math.abs(toP) < 170) { const tt = .85; g.objs.push({ k: 'fireball', kind: 'tornillo', x: e.x + e.dir * 8, y: e.y - 9, vx: (p.x - e.x) / tt, vy: ((p.y - 8 - (e.y - 9)) - .5 * 420 * tt * tt) / tt, life: 3 }); e.tt = 2.4; e.disparo = .3; spawn(g, 6, e.x + e.dir * 10, e.y - 9, { v: 40, life: .4, s: 2, k: 'dust', cols: ['#d8d0c8'] }); }
    e.disparo = Math.max(0, (e.disparo || 0) - d);
  };
  // los sprites miran a la derecha; drawFoe ya voltea con e.dir
  Object.assign(FD, {
    arana(c, e, t) { pinta(c, e.st === 'gone' ? 'cogbot_dead_' + Math.min(5, Math.floor(e.tt * 9)) : 'cogbot_walk_' + Math.floor(e.anim * 9) % 3, 0, 0, .3, 35, 49); },
    zangano(c, e, t) { pinta(c, 'dron_' + Math.floor(t * 14) % 2, 0, 0, .32, 24, 38); },
    mecha(c, e, t) { pinta(c, 'mecha_' + (Math.abs(e.vx || 0) > 1 || e.charging ? Math.floor(e.anim * 8) % 3 : 0), 0, 0, .3, 22, 96); },
    torreta(c, e, t) { pinta(c, 'torreta_' + (e.disparo > 0 ? 1 : 0), 0, 0, .28, 40, 80); },
  });
  const fbPrev = MEC.OBJ.fireball.draw;
  MEC.OBJ.fireball.draw = (c, o, f) => {
    if (o.kind === 'tornillo') { c.save(); c.translate(o.x, o.y); c.rotate(o.rot || 0); pinta(c, 'bolt_0', 0, 0, .4, 7, 6); c.restore(); return; }
    if (o.kind === 'caldera') { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, o.x, o.y, 9, '#ff9040', .5); c.restore(); pinta(c, 'boss_orb', o.x, o.y, .26, 18, 18); return; }
    fbPrev(c, o, f);
  };

  // ---------------- el nivel ----------------
  nivel('vapor', {
    nombre: 'La fábrica de vapor', lema: 'Calderas, engranes que giran y rejillas de vapor: Fresita abre las válvulas para que Itzel suba.',
    foe: 'arana', fauna: ['arana', 'zangano', 'mecha', 'torreta'], power: 'valvula', plat: { k: 'move', path: 'circle', look: 'engrane', amp: 22, sp: .9 }, W: 120,
    skin: { plat: '#6a4a30', plat2: '#c8743a', line: '#1a0c06', accent: '#ffb040', foe: { main: '#c8902a', dark: '#2a1a10', light: '#f2d090', accent: '#ffb040', eye: '#ffe08a' } },
    build(b) {
      b.g(0, 14).P(3).d('T', 7).d('r', 11).o('valvula', 9, 0, { grp: 0 }).o('vent', 13, 0, { grp: 0 }).c(5, 10, 9);
      b.g(15, 27, 6).e(20, 6, 'arana').d('r', 25).c(16, 24, 4);                              // la plataforma alta: se sube con vapor
      for (const ph of [0, 3.14]) b.p(31, 7, 3, { ph });
      b.c(29, 34, 4);
      b.g(37, 52).e(42).e(49, 0, 'torreta').d('T', 45).c(38, 44, 9);
      b.p(55, 9, 3, { amp: 18 }).c(54, 57, 6);
      b.g(59, 75).e(63, 0, 'mecha').o('valvula', 61, 0, { grp: 1 }).o('vent', 66, 0, { grp: 1 }).isl(68, 73, 5).c(68, 73, 4).d('T', 74).h(70, 4);
      b.p(80, 8, 3).p(85, 7, 3, { ph: 2 }).e(83, 5, 'zangano').c(79, 88, 5);
      b.g(90, 119).e(96).e(102, 0, 'torreta').o('valvula', 106, 0, { grp: 2 }).o('vent', 109, 0, { grp: 2 }).isl(110, 113, 6).c(110, 113, 5).d('r', 99).Gl(116);
    },
  });
  if (typeof FAUNA !== 'undefined') FAUNA.vapor = ['zangano', 'mecha'];
  if (typeof PODER_ALCANCE !== 'undefined') PODER_ALCANCE.add('valvula');

  // ---------------- datos de la enciclopedia ----------------
  if (typeof ENEMIGO_INFO !== 'undefined') Object.assign(ENEMIGO_INFO, {
    arana: ['Araña de engranes', 'Camina por las vigas de la fábrica dando la vuelta en las orillas.', 'Cáele encima.'],
    zangano: ['Zángano de vapor', 'Un dron de hélices que patrulla flotando.', 'Pásale por abajo o cáele encima.'],
    mecha: ['Mecha de vapor', 'Un robot alto que embiste cuando te ve.', 'Espera a que se detenga y cáele encima.'],
    torreta: ['Torreta de tornillos', 'No se mueve, pero dispara tornillos en arco hacia Itzel.', 'Acércate entre disparos y cáele encima.'],
  });
  if (typeof PLAT_NOMBRE !== 'undefined') PLAT_NOMBRE.engrane = 'Engrane que gira';
  if (typeof ENTORNO !== 'undefined') Object.assign(ENTORNO, {
    vent: { nombre: 'Rejilla de vapor', mundo: 'vapor', texto: 'Resopla de vez en cuando. Con su válvula abierta suelta una columna de vapor que sube a Itzel.' },
    valvula: { nombre: 'Válvula', mundo: 'vapor', texto: 'Fresita la abre con un clic y todas las rejillas de su grupo sueltan vapor por unos segundos.' },
  });

  // ======================= JEFE: EL BRAWBOT DE LATÓN =======================
  Object.assign(JEFES, {
    brawbot: { nombre: 'El BrawBot de latón', lema: 'El guardián de la fábrica: golpes, ondas de choque y calderas al rojo.', ataques: ['golpe', 'onda', 'calderas'],
      texto: 'La raspadora de henequén más grande de la hacienda Uayamón, que se quedó trabajando sola. Avisa dónde va a golpear y luego suelta el puñetazo, azota el suelo para mandar ondas de choque y lanza calderas al rojo en arco. Cuando se sobrecalienta abre la caldera de su cabeza: ese es el núcleo.' },
  });
  const X = JEFES_EXT, FLOOR = X.FLOOR, hurtIfIn = X.hurtIfIn, KB = .36; // escala del sprite (332×287; los pies en y=249)
  const FR = { idle: 24, walk: 19, attack: 16, die: 19 };
  for (const [n, c] of Object.entries(FR)) for (let k = 0; k < c; k++) img(`jefe_${n}_${k}`);
  for (let k = 0; k < 64; k += 2) img('fx_explosion_' + k);
  X.INIT.brawbot = (o) => { o.x = o.x1 - 50; o.y = FLOOR; o.face = -1; o.bolas = []; o.ventanaT = 6.5; };
  // el núcleo: la caldera de la cabeza (de pie queda alto; noqueado de rodillas, bajo)
  X.CORE.brawbot = (o) => o.stunT > 0 ? { x: o.x + o.face * 6, y: FLOOR - 34, r: 9 } : { x: o.x + o.face * 4, y: FLOOR - 74, r: 9 };
  X.STEP.brawbot = (o, g, dt) => {
    const p = g.p, a = o.at; o.y = FLOOR;
    if (o.st === 'entra') { o.x += ((o.x1 - 70) - o.x) * dt; return; }
    const camina = (x, v) => { const dx = x - o.x; if (Math.abs(dx) < 3) return false; o.x += clamp(dx, -v * dt, v * dt); o.face = Math.sign(dx); o.anim = 'walk'; return true; };
    if (o.st === 'ventana' && !(o.stunT > 0)) {
      // sobrecalentado: se va a parar junto a la rejilla más cercana, para que el vapor suba a Itzel justo encima de su cabeza
      const rejillas = g.objs.filter(q => q.k === 'vent'); o.anim = 'idle';
      if (rejillas.length) {
        if (!o.junto) { const r = rejillas.reduce((m, q) => Math.abs(q.x - o.x) < Math.abs(m.x - o.x) ? q : m); const lado = Math.sign(o.x - r.x) || (r.x < (o.x0 + o.x1) / 2 ? 1 : -1); o.junto = clamp(r.x + lado * 26, o.x0 + 20, o.x1 - 20); o.rejilla = r; }
        if (!camina(o.junto, 70)) { o.anim = 'idle'; o.face = Math.sign(o.rejilla.x - o.x) || o.face; }
      }
      return;
    }
    o.junto = null;
    if (o.st !== 'ataque') { o.anim = 'idle'; return; }
    o.anim = 'walk';
    // entre ataques se acerca a Itzel caminando (no se queda en una esquina)
    if (o.atk !== 'golpe' && Math.abs(p.x - o.x) > 60) camina(p.x, 26);
    if (o.atk === 'golpe') {
      o.dur = 2.4; if (a < .05) o.face = Math.sign(p.x - o.x) || o.face;
      if (a < .8) { const dx = p.x - o.x; if (Math.abs(dx) > 34) o.x += Math.sign(dx) * 40 * dt; o.face = Math.sign(dx) || o.face; o.aviso = a > .2; }
      else if (a < 1.4) { o.aviso = false; o.anim = 'attack'; if (a > .95 && a < 1.2) hurtIfIn(g, o.x + (o.face > 0 ? 6 : -46), FLOOR - 40, o.x + (o.face > 0 ? 46 : -6), FLOOR - 6); if (!o.pegó && a > .95) { o.pegó = 1; g.shake = .3; } }
      else o.anim = 'idle';
      if (a < .1) o.pegó = 0;
    } else if (o.atk === 'onda') {
      o.dur = 2.6; o.anim = a > .5 && a < 1.2 ? 'attack' : 'idle';
      if (a > .9 && !o.azotó) { o.azotó = 1; g.shake = .45; o.waves.push({ x: o.x - 20, v: -165, life: 2.2 }, { x: o.x + 20, v: 165, life: 2.2 }); spawn(g, 20, o.x, FLOOR, { ang: -Math.PI / 2, spread: 3, v: 110, life: .6, s: 2.2, k: 'dust', cols: ['#8a6a50', '#e8d0a0'] }); }
      if (a < .1) o.azotó = 0;
    } else if (o.atk === 'calderas') {
      o.dur = 2.8; o.anim = 'attack'; o.face = Math.sign(p.x - o.x) || o.face;
      const n = Math.floor((a - .4) / .6); if (a > .4 && n !== o.lastK && n >= 0 && n < 3) { o.lastK = n; const tt = 1, tx2 = p.x + (n - 1) * 26, sx = o.x + o.face * 10, sy = FLOOR - 70; g.objs.push({ k: 'fireball', kind: 'caldera', x: sx, y: sy, vx: (tx2 - sx) / tt, vy: ((FLOOR - 4 - sy) - .5 * 420 * tt * tt) / tt, life: 3 }); }
      if (a < .2) o.lastK = -1;
    }
    // el cuerpo lastima al tocarlo mientras ataca
    hurtIfIn(g, o.x - 16, FLOOR - 60, o.x + 16, FLOOR);
  };
  X.TELL.brawbot = (c, o, f) => {
    if (o.aviso && o.st === 'ataque') { c.save(); c.globalAlpha = .55 + Math.sin(f.t * 30) * .25; pinta(c, 'boss_warning', o.x + o.face * 26, FLOOR - 4, .34, 64, 80, o.face); c.restore(); }
    if (o.st === 'ataque' && o.atk === 'golpe' && o.at > .9 && o.at < 1.2) pinta(c, 'boss_punch', o.x + o.face * 30, FLOOR - 6, .34, 64, 80, o.face);
    for (const w of o.waves) pinta(c, 'boss_wave', w.x, FLOOR + 1, .32, 32, 44, Math.sign(w.v));
  };
  X.BODY.brawbot = (c, o, f) => {
    const t = f.t, stun = o.stunT > 0, open = o.st === 'ventana' || o.st === 'herido';
    let n = 'idle', k = Math.floor(t * (open ? 6 : 12)) % FR.idle;
    if (o.st === 'muere') { n = 'die'; k = Math.min(FR.die - 1, Math.floor(o.at / 1.6 * FR.die)); }
    else if (stun) { n = 'die'; k = Math.min(8, Math.floor((3.4 - o.stunT) * 14)); }
    else if (o.anim === 'attack') { n = 'attack'; k = Math.floor(o.at * 12) % FR.attack; }
    else if (o.anim === 'walk') { n = 'walk'; k = Math.floor(t * 14) % FR.walk; }
    c.save(); if (o.flash > 0 && Math.sin(t * 40) > 0) c.filter = 'brightness(3)';
    pinta(c, `jefe_${n}_${k}`, o.x, FLOOR + 1, KB, 200, 249, o.face);
    c.restore();
    // la caldera de la cabeza: el núcleo
    const cr = X.core(o);
    c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, cr.x, cr.y, open ? 16 : 8, '#ff7a20', open ? .8 : .35 + Math.sin(t * 5) * .1); c.restore();
    c.fillStyle = open ? '#ffe08a' : '#ff9040'; c.beginPath(); c.arc(cr.x, cr.y, open ? 2.6 : 1.8, 0, TAU); c.fill();
    if (open && !stun) for (let q = 0; q < 3; q++) { const u = (t * .9 + q / 3) % 1; c.fillStyle = `rgba(240,235,230,${.5 * (1 - u)})`; c.beginPath(); c.arc(cr.x + Math.sin(t * 2 + q) * 3, cr.y - 6 - u * 22, 2 + u * 5, 0, TAU); c.fill(); } // vapor por la cabeza
    if (stun) for (let q = 0; q < 3; q++) { const an = t * 5 + q * 2.1; c.fillStyle = '#fff3a0'; c.beginPath(); c.arc(cr.x + Math.cos(an) * 10, cr.y - 10 + Math.sin(an) * 3, 1.3, 0, TAU); c.fill(); }
    // la explosión final
    if (o.st === 'muere' && o.at > 1) { const e = Math.min(63, Math.floor((o.at - 1) / 1.2 * 64)) & ~1; pinta(c, 'fx_explosion_' + e, o.x, FLOOR - 40, .35, 128, 128); }
  };
})();
