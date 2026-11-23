'use strict';
// =====================================================================
//  CUATRO JEFES MÁS, de la historia y los mitos de Campeche y el Mayab:
//   · Lorencillo, el pirata fantasma (los piratas que atacaban la muralla)
//   · Chaac, el señor de la lluvia (nube con su máscara de nariz larga)
//   · Camazotz, el murciélago de la cueva (Popol Vuh)
//   · Xunán Kab, la abeja reina (la abeja melipona de los mayas)
//  Misma regla que los demás: después de cada ataque abren el núcleo;
//  Fresita sube a Itzel (alcance) o lo aturde (control) e Itzel le cae encima.
// =====================================================================
Object.assign(JEFES, {
  pirata: { nombre: 'Lorencillo, el pirata fantasma', lema: 'Su barco navega por el aire y dispara contra la muralla.', ataques: ['canones', 'ancla', 'loros'],
    texto: 'El pirata que más miedo le dio a Campeche volvió como fantasma, con su balandra flotando entre la niebla. Dispara cañonazos donde marca la mira, deja caer el ancla justo encima de Itzel y suelta loros fantasma que cruzan volando. El farol de la proa es el núcleo.' },
  chaac: { nombre: 'Chaac, el señor de la lluvia', lema: 'Una nube con máscara que suelta rayos, aguaceros y ventarrones.', ataques: ['rayos', 'aguacero', 'ventarron'],
    texto: 'El dios maya de la lluvia, de nariz larga y enroscada, vive en una nube de tormenta. Marca el suelo con glifos y ahí caen sus rayos, se pasea soltando un aguacero y sopla un ventarrón que empuja a Itzel mientras ruedan bolas de granizo. El jade de su frente es el núcleo.' },
  camazotz: { nombre: 'Camazotz, el murciélago de la cueva', lema: 'Se lanza en picada, chilla y apaga la luz.', ataques: ['picada', 'chillido', 'oscuridad'],
    texto: 'El murciélago del Popol Vuh, con nariz de hoja y alas como navajas de obsidiana. Cruza la arena en picada rozando el suelo, chilla en ondas que hay que saltar y apaga todo: en la oscuridad solo se ve alrededor de Itzel y Fresita, y sus murcielaguitos la buscan. El collar de jade de su pecho es el núcleo.' },
  abeja: { nombre: 'Xunán Kab, la abeja reina', lema: 'Manda su enjambre, tira miel pegajosa y clava el aguijón.', ataques: ['enjambre', 'miel', 'aguijon'],
    texto: 'La reina de las abejas meliponas que los mayas cuidaban en troncos. Manda filas de abejas que cruzan bajito (hay que saltar) y luego altito (hay que quedarse abajo), deja caer gotas de miel que hacen charcos pegajosos y baja en picada a clavar el aguijón en el suelo. La celda de su corona es el núcleo.' },
});

(function () {
  const X = JEFES_EXT, FLOOR = X.FLOOR, hurtIfIn = X.hurtIfIn;
  const mid = o => (o.x0 + o.x1) / 2;
  const flota = (o, dt, tx, ty, k = 2) => { o.x += (tx - o.x) * Math.min(1, dt * k); o.y += (ty - o.y) * Math.min(1, dt * k); };
  const cancion = (g, q, r = 6) => g.lull && g.t - g.lull.t < .05 && Math.hypot(q.x - g.lull.x, q.y - g.lull.y) < g.lull.r + r;
  const muere = (c, o) => { if (o.st === 'muere') c.globalAlpha *= clamp(1 - o.at / 2.4, 0, 1); };
  const blanco = (o, t) => o.flash > 0 && Math.sin(t * 40) > 0;
  const nucleo = (c, o, f, x, y, r = 2.2, forma = 'rombo') => {
    const open = o.st === 'ventana' || o.st === 'herido';
    c.save(); if (open) { c.shadowColor = o.pal.core; c.shadowBlur = 10 * f.S; } c.fillStyle = o.pal.core; c.beginPath();
    if (forma === 'rombo') { c.moveTo(x, y - r * 1.5); c.lineTo(x + r, y); c.lineTo(x, y + r * 1.2); c.lineTo(x - r, y); c.closePath(); }
    else if (forma === 'hex') { for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + Math.PI / 6; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); }
    else c.arc(x, y, r, 0, TAU);
    c.fill(); c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(x - r * .35, y - r * .4, r * .3, 0, TAU); c.fill(); c.restore();
  };
  const mareo = (c, x, y, t) => { for (let i = 0; i < 3; i++) { const an = t * 5 + i * 2.1; c.fillStyle = '#fff3a0'; c.beginPath(); c.arc(x + Math.cos(an) * 9, y + Math.sin(an) * 2.6, 1.3, 0, TAU); c.fill(); } };
  const ventanaY = o => o.stunT > 0 ? FLOOR - 26 : 94;

  // ======================= LORENCILLO, EL PIRATA FANTASMA =======================
  X.INIT.pirata = (o) => { o.x = o.x1 + 60; o.y = 60; o.face = -1; o.marcas = []; o.loros = []; o.ay = null; };
  X.CORE.pirata = (o) => ({ x: o.x + o.face * 27, y: o.y - 15, r: 8 });
  X.STEP.pirata = (o, g, dt) => {
    const p = g.p; let tx = mid(o) + Math.sin(o.t * .5) * 110, ty = 62 + Math.sin(o.t * 1.3) * 5;
    if (o.st === 'entra') { tx = mid(o) + 40; ty = 62; }
    if (o.st === 'ventana') { tx = o.x; ty = ventanaY(o) + (o.stunT > 0 ? 6 : 0); }
    if (o.st === 'muere') ty = o.y + 30 * dt;
    if (o.st === 'ataque' && o.atk === 'ancla' && o.tx != null) tx = o.tx;
    const vx = tx - o.x; if (Math.abs(vx) > 3 && o.st !== 'ventana') o.face = Math.sign(vx);
    flota(o, dt, tx, ty, o.stunT > 0 ? 5 : 1.6);
    // loros fantasma
    for (const q of o.loros) { q.t += dt; q.x += q.v * dt; q.y = q.y0 + Math.sin(q.t * 7) * 4; hurtIfIn(g, q.x - 5, q.y - 4, q.x + 5, q.y + 4); if (cancion(g, q)) { q.dead = true; spawn(g, 8, q.x, q.y, { v: 40, life: .4, s: 1.5, k: 'spark', cols: ['#bfffe8', '#ffffff'] }); } }
    o.loros = o.loros.filter(q => !q.dead && q.x > o.x0 - 60 && q.x < o.x1 + 60);
    for (const m of o.marcas) m.t += dt; o.marcas = o.marcas.filter(m => m.t < 1.2);
    if (o.st !== 'ataque') { o.ay = null; return; }
    const a = o.at;
    if (o.atk === 'canones') {
      o.dur = 3;
      const k = Math.floor((a - .3) / .6); if (a > .3 && k !== o.lastK && k >= 0 && k < 3) { o.lastK = k; const tx2 = clamp(p.x + (k - 1) * 24, o.x0 + 8, o.x1 - 8), tt = 1, sx = o.x, sy = o.y + 4; o.marcas.push({ x: tx2, t: 0 }); g.objs.push({ k: 'fireball', kind: 'bala', x: sx, y: sy, vx: (tx2 - sx) / tt, vy: ((FLOOR - 3 - sy) - .5 * 420 * tt * tt) / tt, life: 3 }); g.shake = Math.max(g.shake, .12); spawn(g, 10, sx, sy, { v: 60, life: .5, s: 2, k: 'dust', cols: ['#d8fff0', '#8ab8a8'] }); }
      if (a < .2) o.lastK = -1;
    } else if (o.atk === 'ancla') {
      o.dur = 2.8; if (a < .05) o.tx = clamp(p.x, o.x0 + 20, o.x1 - 20);
      const top = o.y + 8;
      if (a < .95) o.ay = top + 6;
      else if (a < 1.15) { o.ay = lerp(top + 6, FLOOR - 2, (a - .95) / .2); }
      else if (a < 2) { o.ay = FLOOR - 2; if (!o.golpe) { o.golpe = 1; g.shake = .4; spawn(g, 16, o.tx, FLOOR, { ang: -Math.PI / 2, spread: 2.4, v: 100, life: .6, s: 2, k: 'dust', cols: [o.pal.c, o.pal.b] }); } }
      else o.ay = lerp(FLOOR - 2, top + 6, Math.min(1, (a - 2) / .7));
      if (a > .95 && a < 2.1) hurtIfIn(g, o.tx - 8, o.ay - 14, o.tx + 8, o.ay);
      if (a < .1) o.golpe = 0;
    } else if (o.atk === 'loros') {
      o.dur = 3; if (a > .5 && !o.solto) { o.solto = 1; const dir = p.x > o.x ? 1 : -1, x0 = dir > 0 ? o.x0 - 30 : o.x1 + 30; [[FLOOR - 7, 0], [FLOOR - 36, 40], [FLOOR - 7, 80]].forEach(([y, d], i) => o.loros.push({ x: x0 - dir * d, y0: y, y, v: dir * 135, t: i })); }
      if (a < .2) o.solto = 0;
    }
  };
  X.TELL.pirata = (c, o, f) => {
    for (const m of o.marcas) { const k = m.t / 1.2; c.strokeStyle = rgba(o.pal.core, .8 - k * .6); c.lineWidth = .8; c.beginPath(); c.ellipse(m.x, FLOOR, 10 - k * 4, 3 - k, 0, 0, TAU); c.moveTo(m.x - 12, FLOOR); c.lineTo(m.x + 12, FLOOR); c.stroke(); }
    if (o.st === 'ataque' && o.atk === 'ancla' && o.ay != null) {
      if (o.at < .95) { c.strokeStyle = rgba(o.pal.core, .4 + Math.sin(f.t * 30) * .3); c.setLineDash([3, 3]); c.lineWidth = .8; c.strokeRect(o.tx - 8, o.y + 10, 16, FLOOR - o.y - 10); c.setLineDash([]); }
      // cadena y ancla
      c.strokeStyle = '#6a7470'; c.lineWidth = 1; c.setLineDash([2, 1.2]); c.beginPath(); c.moveTo(o.x, o.y + 6); c.lineTo(o.tx, o.ay - 12); c.stroke(); c.setLineDash([]);
      c.save(); c.translate(o.tx, o.ay); c.strokeStyle = '#3a4440'; c.fillStyle = '#4a5450'; c.lineWidth = 2.2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, -12); c.lineTo(0, -1); c.stroke(); c.beginPath(); c.arc(0, -8, 4.5, .15 * Math.PI, .85 * Math.PI, true); c.stroke();
      c.beginPath(); c.moveTo(-9, -6); c.quadraticCurveTo(-8, 0, 0, 0); c.quadraticCurveTo(8, 0, 9, -6); c.stroke();
      c.beginPath(); c.arc(0, -14, 2, 0, TAU); c.stroke(); c.restore();
    }
    for (const q of o.loros) {
      c.save(); c.translate(q.x, q.y); c.scale(Math.sign(q.v), 1); c.globalAlpha = .8;
      c.globalCompositeOperation = 'lighter'; glowDot(c, 0, 0, 9, '#9affd8', .35); c.globalCompositeOperation = 'source-over';
      const w = Math.sin(q.t * 22);
      c.fillStyle = 'rgba(200,255,235,.85)'; c.beginPath(); c.ellipse(0, 0, 5, 3, -.2, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(-1, -1); c.quadraticCurveTo(-4, -6 - w * 3, -7, -3 - w * 4); c.quadraticCurveTo(-4, -1, -1, 1); c.fill();
      c.beginPath(); c.moveTo(-4, 1); c.lineTo(-10, 3); c.lineTo(-9, 0); c.closePath(); c.fill();
      c.fillStyle = '#ffd23a'; c.beginPath(); c.moveTo(5, -1); c.quadraticCurveTo(8, 0, 6, 2); c.lineTo(4.4, .6); c.fill();
      c.fillStyle = '#123'; c.beginPath(); c.arc(3, -1, .8, 0, TAU); c.fill();
      c.restore();
    }
  };
  X.BODY.pirata = (c, o, f) => {
    const P = o.pal, t = f.t, wh = blanco(o, t), stun = o.stunT > 0, lean = stun ? Math.sin(t * 5) * .12 : Math.sin(t * 1.3) * .04;
    c.save(); c.translate(o.x, o.y); c.scale(o.face, 1); c.rotate(lean); muere(c, o);
    // niebla que lo sostiene
    c.save(); c.globalAlpha *= .55; for (let k = 0; k < 6; k++) { const x = -26 + k * 10 + Math.sin(t * 1.5 + k) * 2, y = 14 + Math.sin(t * 2 + k * 1.7) * 1.5; c.fillStyle = rgba(P.c, .5); c.beginPath(); c.ellipse(x, y, 9, 3.5, 0, 0, TAU); c.fill(); } c.restore();
    // mástil y vela rota
    c.strokeStyle = P.b; c.lineWidth = 2; c.beginPath(); c.moveTo(-2, 2); c.lineTo(-2, -50); c.stroke(); c.lineWidth = 1.2; c.beginPath(); c.moveTo(-16, -44); c.lineTo(12, -44); c.moveTo(-14, -20); c.lineTo(10, -20); c.stroke();
    const ola = Math.sin(t * 2.4) * 2;
    c.fillStyle = wh ? '#ffffff' : rgba(P.c, .85); c.beginPath(); c.moveTo(-15, -43); c.quadraticCurveTo(-2 + ola, -36, 11, -43); c.lineTo(10, -30); c.lineTo(7, -24); c.lineTo(4, -28); c.lineTo(0, -21); c.lineTo(-4, -26); c.lineTo(-9, -21); c.lineTo(-13, -26); c.closePath(); c.fill(); c.strokeStyle = P.b; c.lineWidth = .6; c.stroke();
    c.fillStyle = P.b; c.beginPath(); c.arc(-2 + ola * .4, -34, 3.4, Math.PI * .2, Math.PI * 1.8); c.arc(-.6 + ola * .4, -34, 2.6, Math.PI * 1.7, Math.PI * .3, true); c.fill(); // luna en la vela
    c.fillStyle = P.b; c.beginPath(); c.moveTo(-2, -50); c.lineTo(8, -47); c.lineTo(-2, -45); c.fill(); // banderín
    // casco
    c.fillStyle = wh ? '#ffffff' : P.a; c.strokeStyle = P.b; c.lineWidth = 1;
    c.beginPath(); c.moveTo(-30, -8); c.lineTo(-24, -12); c.lineTo(-20, -6); c.lineTo(22, -6); c.lineTo(30, -12); c.quadraticCurveTo(26, 4, 18, 11); c.lineTo(-20, 11); c.quadraticCurveTo(-28, 4, -30, -8); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = rgba(P.b, .8); c.lineWidth = .5; for (const y of [-2, 3, 7]) { c.beginPath(); c.moveTo(-26, y); c.quadraticCurveTo(0, y + 1.4, 26, y - 1); c.stroke(); }
    c.fillStyle = P.b; for (const x of [-12, -2, 8]) { c.beginPath(); c.arc(x, -1, 1.8, 0, TAU); c.fill(); } // troneras
    c.fillStyle = rgba(P.c, .35); c.beginPath(); c.moveTo(-14, 11); c.lineTo(-10, 16); c.lineTo(-6, 11); c.moveTo(6, 11); c.lineTo(10, 18); c.lineTo(13, 11); c.fill(); // casco roto
    // el capitán fantasma, en la popa
    c.save(); c.translate(-20, -12);
    c.fillStyle = wh ? '#ffffff' : rgba(P.c, .9); c.beginPath(); c.moveTo(-5, 6); c.quadraticCurveTo(-7, -6, 0, -9); c.quadraticCurveTo(7, -6, 5, 6); c.quadraticCurveTo(2, 3, 0, 7); c.quadraticCurveTo(-2, 3, -5, 6); c.fill();
    c.fillStyle = P.b; c.beginPath(); c.moveTo(-8, -9); c.quadraticCurveTo(0, -12, 8, -9); c.lineTo(5, -14); c.quadraticCurveTo(0, -12, -5, -14); c.closePath(); c.fill(); // tricornio
    c.fillStyle = P.core; c.fillRect(-1, -12.6, 2, 1.2);
    c.fillStyle = stun ? '#ffffff' : P.eye; c.beginPath(); c.arc(2.4, -5.5, 1.2, 0, TAU); c.fill(); c.fillStyle = P.b; c.fillRect(-3.6, -6.4, 3.4, 1.4); // parche
    c.fillStyle = rgba(P.b, .7); c.beginPath(); c.moveTo(-2, -2); c.quadraticCurveTo(1, 4, 4, -2); c.fill(); // barba
    c.restore();
    // farol de la proa (núcleo)
    c.strokeStyle = P.b; c.lineWidth = 1; c.beginPath(); c.moveTo(24, -9); c.lineTo(30, -20); c.stroke();
    c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 27, -15, 12, P.core, .35 + Math.sin(t * 6) * .1); c.restore();
    c.fillStyle = P.b; c.fillRect(24.5, -19, 5, 1.2); c.fillRect(24.5, -11.6, 5, 1.2);
    nucleo(c, o, f, 27, -15.3, 2.4, 'circulo');
    if (stun) mareo(c, -20, -30, t);
    c.restore();
  };

  // ======================= CHAAC, SEÑOR DE LA LLUVIA =======================
  X.INIT.chaac = (o) => { o.x = mid(o); o.y = -50; o.marcas = []; o.dir = 1; };
  X.CORE.chaac = (o) => ({ x: o.x, y: o.y - 13, r: 8 });
  X.STEP.chaac = (o, g, dt) => {
    const p = g.p; let tx = mid(o) + Math.sin(o.t * .45) * 100, ty = 56 + Math.sin(o.t * 1.1) * 6, k = 1.6;
    if (o.st === 'entra') { tx = mid(o); ty = 56; }
    if (o.st === 'ventana') { tx = o.x; ty = o.stunT > 0 ? FLOOR - 12 : 94; k = o.stunT > 0 ? 5 : 2; } // aturdido, la nube se cae al suelo
    if (o.st === 'muere') ty = o.y - 20 * dt;
    const a = o.at;
    if (o.st === 'ataque' && o.atk === 'aguacero') { const u = clamp(a / 3, 0, 1); tx = o.ida > 0 ? lerp(o.x0 + 20, o.x1 - 20, u) : lerp(o.x1 - 20, o.x0 + 20, u); ty = 50; k = 3; }
    flota(o, dt, tx, ty, k);
    for (const m of o.marcas) { m.t += dt; if (m.t > .85 && !m.cae) { m.cae = 1; g.shake = Math.max(g.shake, .3); spawn(g, 14, m.x, FLOOR, { ang: -Math.PI / 2, spread: 2.6, v: 110, life: .5, s: 2, k: 'spark', cols: ['#ffffff', '#fff3a0', o.pal.core] }); } if (m.t > .85 && m.t < 1.05) hurtIfIn(g, m.x - 7, 0, m.x + 7, FLOOR); }
    o.marcas = o.marcas.filter(m => m.t < 1.3);
    if (o.st !== 'ataque') { o.viento = 0; return; }
    if (o.atk === 'rayos') {
      o.dur = 3.4; const n = Math.floor((a - .2) / .6); if (a > .2 && n !== o.lastK && n >= 0 && n < 4) { o.lastK = n; o.marcas.push({ x: clamp(p.x + (Math.random() - .5) * 10, o.x0 + 6, o.x1 - 6), t: 0 }); }
      if (a < .15) o.lastK = -1;
    } else if (o.atk === 'aguacero') {
      o.dur = 3.2; if (a < .05) o.ida = o.x < mid(o) ? 1 : -1;
      o.lluvia = (o.lluvia || 0) + dt; while (o.lluvia > .09) { o.lluvia -= .09; g.objs.push({ k: 'fireball', kind: 'gota', x: o.x + (Math.random() - .5) * 60, y: o.y + 18, vx: 0, vy: 40, life: 3 }); }
    } else if (o.atk === 'ventarron') {
      o.dur = 3.4; if (a < .05) o.dir = p.x < mid(o) ? -1 : 1;
      o.viento = a > .5 && a < 3.1 ? 1 : 0;
      if (o.viento && !SOLID(p.x + o.dir * 7, p.y - 6)) p.x += o.dir * 58 * dt;
      for (const w of [.9, 1.9]) if (a > w && !o['v' + w]) { o['v' + w] = 1; o.waves.push({ x: o.dir > 0 ? o.x0 - 10 : o.x1 + 10, v: o.dir * 120, life: 4 }); }
      if (a < .2) { o['v0.9'] = 0; o['v1.9'] = 0; }
    }
  };
  X.TELL.chaac = (c, o, f) => {
    for (const m of o.marcas) {
      if (m.t < .85) { const k = m.t / .85; c.strokeStyle = rgba(o.pal.core, .5 + Math.sin(f.t * 30) * .3); c.lineWidth = .9; c.beginPath(); c.ellipse(m.x, FLOOR, 9, 3, 0, 0, TAU); c.stroke(); c.beginPath(); c.arc(m.x, FLOOR - 1, 3, Math.PI, Math.PI * (1 + k * 2)); c.stroke(); c.setLineDash([2, 4]); c.beginPath(); c.moveTo(m.x, o.y + 20); c.lineTo(m.x, FLOOR); c.stroke(); c.setLineDash([]); }
      else if (m.t < 1.1) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = '#fff6c0'; c.lineWidth = 2.4; c.shadowColor = '#ffffff'; c.shadowBlur = 8 * f.S; c.beginPath(); let x = o.x, y = o.y + 16; c.moveTo(x, y); for (let k = 1; k <= 7; k++) { x = lerp(o.x, m.x, k / 7) + (k < 7 ? (Math.random() - .5) * 10 : 0); y = lerp(o.y + 16, FLOOR, k / 7); c.lineTo(x, y); } c.stroke(); c.restore(); }
    }
    if (o.viento) { c.strokeStyle = rgba(o.pal.c, .5); c.lineWidth = .7; for (let k = 0; k < 9; k++) { const y = 60 + k * 13, x = o.x0 + ((f.t * 160 * o.dir + k * 53) % (o.x1 - o.x0) + (o.x1 - o.x0)) % (o.x1 - o.x0); c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + o.dir * 10, y - 3, x + o.dir * 22, y); c.stroke(); } }
  };
  X.BODY.chaac = (c, o, f) => {
    const P = o.pal, t = f.t, wh = blanco(o, t), stun = o.stunT > 0, tormenta = o.st === 'ataque';
    c.save(); c.translate(o.x, o.y); if (stun) c.rotate(Math.sin(t * 6) * .12); muere(c, o);
    // la nube: bocanadas que respiran
    const puffs = [[-30, 4, 13], [-18, -6, 15], [0, -12, 17], [18, -6, 15], [30, 4, 13], [-12, 10, 14], [12, 10, 14]];
    c.fillStyle = shade(P.b, -.1); for (const [x, y, r] of puffs) { c.beginPath(); c.arc(x, y + 4, r + Math.sin(t * 2 + x) * .6, 0, TAU); c.fill(); }
    c.fillStyle = wh ? '#ffffff' : P.c; for (const [x, y, r] of puffs) { c.beginPath(); c.arc(x, y, r * .92 + Math.sin(t * 2 + x) * .6, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,.35)'; for (const [x, y, r] of puffs.slice(1, 4)) { c.beginPath(); c.arc(x - r * .3, y - r * .4, r * .4, 0, TAU); c.fill(); }
    if (tormenta) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, Math.sin(t * 13) * 20, 2, 18, '#fff6c0', Math.max(0, Math.sin(t * 9)) * .5); c.restore(); }
    // orejeras
    for (const d of [-1, 1]) { c.fillStyle = P.a; c.beginPath(); c.arc(d * 15, -4, 4.4, 0, TAU); c.fill(); c.strokeStyle = P.b; c.lineWidth = .8; c.stroke(); c.fillStyle = P.core; c.beginPath(); c.arc(d * 15, -4, 1.6, 0, TAU); c.fill(); c.strokeStyle = P.a; c.lineWidth = 1.4; c.beginPath(); c.moveTo(d * 15, 0); c.lineTo(d * 16, 8); c.stroke(); }
    // máscara
    c.fillStyle = wh ? '#ffffff' : P.a; c.strokeStyle = P.b; c.lineWidth = 1;
    c.beginPath(); c.moveTo(-11, -14); c.lineTo(11, -14); c.lineTo(12, 4); c.quadraticCurveTo(0, 8, -12, 4); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = rgba(P.b, .7); c.lineWidth = .6; c.beginPath(); c.moveTo(-10, -9); c.lineTo(10, -9); c.stroke();
    // ojos de espiral
    for (const d of [-1, 1]) { c.fillStyle = '#f6efe2'; c.beginPath(); c.arc(d * 5.4, -4.6, 3.6, 0, TAU); c.fill(); c.strokeStyle = P.b; c.lineWidth = .7; c.stroke(); c.strokeStyle = stun ? '#ffffff' : P.b; c.lineWidth = .8; c.beginPath(); for (let k = 0; k < 14; k++) { const an = k * .7 + (stun ? t * 6 : 0), r = k * .2; c.lineTo(d * 5.4 + Math.cos(an) * r, -4.6 + Math.sin(an) * r); } c.stroke(); }
    // la nariz larga y enroscada de Chaac
    const sw = Math.sin(t * 2) * 1.5;
    c.strokeStyle = wh ? '#ffffff' : P.a; c.lineWidth = 4.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -3); c.bezierCurveTo(1, 6, 3 + sw, 14, 9 + sw, 13); c.bezierCurveTo(13 + sw, 12, 12 + sw, 6, 8 + sw, 7); c.stroke();
    c.strokeStyle = P.b; c.lineWidth = .7; c.stroke();
    // colmillos
    c.fillStyle = '#ffffff'; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * 7, 4); c.quadraticCurveTo(d * 9, 9, d * 5, 10); c.lineTo(d * 5, 5); c.fill(); }
    // el hacha de rayo
    c.save(); c.translate(-30, 2); c.rotate(-.5 + (tormenta ? Math.sin(t * 8) * .2 : 0)); c.strokeStyle = P.b; c.lineWidth = 1.4; c.beginPath(); c.moveTo(0, 6); c.lineTo(0, -14); c.stroke();
    c.fillStyle = '#ffe36a'; c.beginPath(); c.moveTo(0, -14); c.lineTo(7, -18); c.lineTo(4, -12); c.lineTo(9, -11); c.lineTo(1, -4); c.lineTo(3, -10); c.closePath(); c.fill(); c.restore();
    // diadema y jade (núcleo)
    c.fillStyle = P.b; c.fillRect(-12, -17, 24, 3); for (let k = -10; k <= 10; k += 5) { c.fillStyle = k % 2 ? P.c : P.a; c.beginPath(); c.moveTo(k - 2, -17); c.lineTo(k, -22); c.lineTo(k + 2, -17); c.fill(); }
    nucleo(c, o, f, 0, -13, 2.6, 'circulo');
    // lluvia que cuelga de la nube
    c.strokeStyle = rgba(P.c, .55); c.lineWidth = .6; for (let k = 0; k < 9; k++) { const x = -28 + k * 7, y0 = 20 + ((t * 40 + k * 7) % 12); c.beginPath(); c.moveTo(x, y0); c.lineTo(x - 1, y0 + 4); c.stroke(); }
    if (stun) mareo(c, 0, -26, t);
    c.restore();
  };

  // ======================= CAMAZOTZ, EL MURCIÉLAGO DE LA CUEVA =======================
  X.INIT.camazotz = (o) => { o.x = mid(o); o.y = -40; o.ondas = []; o.crias = []; o.osc = 0; };
  X.CORE.camazotz = (o) => ({ x: o.x, y: o.y + 4, r: 8 });
  X.STEP.camazotz = (o, g, dt) => {
    const p = g.p; let tx = mid(o) + Math.sin(o.t * .6) * 120, ty = 58 + Math.sin(o.t * 2.2) * 8, k = 2;
    if (o.st === 'entra') { tx = mid(o); ty = 58; }
    if (o.st === 'ventana') { tx = o.x; ty = o.stunT > 0 ? FLOOR - 16 : 92; k = o.stunT > 0 ? 6 : 2; }
    if (o.st === 'muere') ty = o.y + 20 * dt;
    const a = o.at;
    o.osc += ((o.st === 'ataque' && o.atk === 'oscuridad' && a > .3 && a < 4.2 ? 1 : 0) - o.osc) * Math.min(1, dt * 3);
    g.oscuro = o.osc;
    let libre = true;
    if (o.st === 'ataque' && o.atk === 'picada') {
      o.dur = 2.9; if (a < .05) { o.lado = o.x < mid(o) ? -1 : 1; }
      const xa = o.lado < 0 ? o.x0 + 6 : o.x1 - 6, xb = o.lado < 0 ? o.x1 - 6 : o.x0 - 6 + 12;
      if (a < .8) { tx = xa; ty = 40; k = 4; }
      else if (a < 2.1) { const u = (a - .8) / 1.3; o.x = lerp(xa, xb, u); o.y = lerp(40, 40, u) + Math.sin(u * Math.PI) * (FLOOR - 52); libre = false; hurtIfIn(g, o.x - 12, o.y - 8, o.x + 12, o.y + 10); }
      else { tx = xb; ty = 50; }
    }
    if (libre) flota(o, dt, tx, ty, k);
    // ondas del chillido: hay que saltarlas
    for (const w of o.ondas) { w.r += 120 * dt; const d = Math.hypot(p.x - w.x, p.y - 7 - w.y); if (!w.pego && Math.abs(d - w.r) < 5 && p.on) { w.pego = 1; MEC.hurt(g, p.x < w.x ? -1 : 1); } const df = Math.hypot(g.fre.x - w.x, g.fre.y - w.y); if (!w.fre && Math.abs(df - w.r) < 5) { w.fre = 1; g.fre.daze = Math.max(g.fre.daze || 0, .8); } }
    o.ondas = o.ondas.filter(w => w.r < 320);
    // murcielaguitos que buscan a Itzel en la oscuridad
    for (const m of o.crias) { m.t += dt; const dx = p.x - m.x, dy = p.y - 8 - m.y, d = Math.hypot(dx, dy) || 1; m.x += dx / d * 62 * dt + Math.sin(m.t * 11) * .5; m.y += dy / d * 62 * dt + Math.cos(m.t * 9) * .5; if (d < 7) { m.dead = true; MEC.hurt(g, dx > 0 ? 1 : -1); } if (cancion(g, m) || m.t > 6) { m.dead = true; spawn(g, 6, m.x, m.y, { v: 40, life: .4, s: 1.4, k: 'spark', cols: ['#b9a7ff', '#ffffff'] }); } }
    o.crias = o.crias.filter(m => !m.dead);
    if (o.st !== 'ataque') return;
    if (o.atk === 'chillido') { o.dur = 2.8; const n = Math.floor((a - .5) / .55); if (a > .5 && n !== o.lastK && n >= 0 && n < 3) { o.lastK = n; o.ondas.push({ x: o.x, y: o.y, r: 6 }); g.shake = Math.max(g.shake, .1); } if (a < .2) o.lastK = -1; }
    else if (o.atk === 'oscuridad') { o.dur = 4.4; if (a > .7 && !o.solto) { o.solto = 1; for (let k2 = 0; k2 < 3; k2++) o.crias.push({ x: o.x + (k2 - 1) * 14, y: o.y, t: k2 * .5 }); } if (a < .2) o.solto = 0; }
  };
  X.TELL.camazotz = (c, o, f) => {
    // la oscuridad: solo se ve alrededor de Itzel y de Fresita
    if (o.osc > .02) {
      const g = f.g, x0 = g.cam - 20, w = VW + 40;
      c.save(); c.fillStyle = `rgba(4,2,10,${.995 * o.osc})`; c.beginPath(); c.rect(x0, -20, w, VH + 40);
      for (const [x, y, r] of [[g.p.x, g.p.y - 8, 30], [g.fre.x, g.fre.y, 38]]) { c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU, true); }
      c.fill('evenodd'); c.restore();
      // en la oscuridad de Camazotz solo se le ven los ojos rojos
      if (o.st !== 'muere') {
        let luz = 0; for (const [x, y, r] of [[g.p.x, g.p.y - 8, 30], [g.fre.x, g.fre.y, 38]]) luz = Math.max(luz, clamp(1 - (Math.hypot(o.x - x, o.y - y) - r + 12) / 14, 0, 1));   // si lo alumbran, no se le ven los ojos
        const k = Math.min(1, o.osc * 1.6) * (1 - luz), pestaña = (f.t % 3.1) < .1 ? .2 : 1;
        // dónde tiene los ojos el arte según la pose (cuadro 0 y 3 de la hoja, ver BODY en jefes-cuerpos.js)
        const picada = o.st === 'ataque' && o.atk === 'picada' && o.at > .8 && o.at < 2.1, chilla = o.st === 'ataque' && (o.atk === 'chillido' && o.at > .4 || o.atk === 'oscuridad');
        const cuadro = picada ? 3 : chilla || o.cineChilla ? 1 : o.cineAlasCerradas || o.st === 'ventana' ? 0 : o.cineColgado ? 2 : Math.floor(f.t * 8) % 3;
        const variante = window.JEFES_VARIANTES && JEFES_VARIANTES.obtener('camazotz', f.st);   // arte propio del estilo (una sola imagen con la cara de frente)
        const [ox, oy, sep] = variante ? [0, -8, 4.6] : [[.3, .6, 2.7], [.2, -6.4, 2.8], [1.1, -21.3, 2.6], [1.5, 16.4, 3.1]][cuadro];
        c.save(); c.globalAlpha = k; c.globalCompositeOperation = 'lighter';
        for (const d of [-1, 1]) {
          const ex = o.x + ox + d * sep, ey = o.y + oy, gr = c.createRadialGradient(ex, ey, 0, ex, ey, 5);
          gr.addColorStop(0, 'rgba(255,70,50,.75)'); gr.addColorStop(1, 'rgba(255,40,30,0)'); c.fillStyle = gr; c.beginPath(); c.arc(ex, ey, 5, 0, TAU); c.fill();
        }
        c.globalCompositeOperation = 'source-over';
        for (const d of [-1, 1]) { c.fillStyle = '#ff2a1c'; c.beginPath(); c.ellipse(o.x + ox + d * sep, o.y + oy, 1.2, .85 * pestaña, 0, 0, TAU); c.fill(); c.fillStyle = '#ffd0c0'; c.fillRect(o.x + ox + d * sep - .3, o.y + oy - .35, .6, .6 * pestaña); }
        c.restore();
      }
    }
    if (o.st === 'ataque' && o.atk === 'picada' && o.at < .8 && o.lado) { const xa = o.lado < 0 ? o.x0 + 6 : o.x1 - 6, xb = o.lado < 0 ? o.x1 - 6 : o.x0 + 6; c.strokeStyle = rgba(o.pal.core, .35 + Math.sin(f.t * 30) * .25); c.setLineDash([3, 3]); c.lineWidth = .8; c.beginPath(); for (let k = 0; k <= 20; k++) { const u = k / 20; c.lineTo(lerp(xa, xb, u), 40 + Math.sin(u * Math.PI) * (FLOOR - 52)); } c.stroke(); c.setLineDash([]); }
    for (const w of o.ondas) { c.strokeStyle = rgba(o.pal.c, Math.max(0, .8 - w.r / 320)); c.lineWidth = 1.6; c.beginPath(); c.arc(w.x, w.y, w.r, 0, TAU); c.stroke(); c.strokeStyle = rgba('#ffffff', Math.max(0, .5 - w.r / 320)); c.lineWidth = .5; c.beginPath(); c.arc(w.x, w.y, w.r - 2, 0, TAU); c.stroke(); }
    for (const m of o.crias) { const fl = Math.sin(m.t * 30); c.fillStyle = o.pal.b; c.beginPath(); c.moveTo(m.x, m.y); c.quadraticCurveTo(m.x - 4, m.y - 4 - fl * 2, m.x - 8, m.y - 1 + fl * 2); c.quadraticCurveTo(m.x - 4, m.y, m.x, m.y + 2); c.quadraticCurveTo(m.x + 4, m.y, m.x + 8, m.y - 1 + fl * 2); c.quadraticCurveTo(m.x + 4, m.y - 4 - fl * 2, m.x, m.y); c.fill(); c.fillStyle = '#ff4a4a'; c.fillRect(m.x - 1.4, m.y - .6, .8, .8); c.fillRect(m.x + .6, m.y - .6, .8, .8); }
  };
  X.BODY.camazotz = (c, o, f) => {
    const P = o.pal, t = f.t, wh = blanco(o, t), stun = o.stunT > 0, quieto = o.st === 'ventana', picada = o.st === 'ataque' && o.atk === 'picada' && o.at > .8 && o.at < 2.1;
    c.save(); c.translate(o.x, o.y); if (stun) c.rotate(Math.sin(t * 6) * .25); muere(c, o);
    const fl = quieto ? .15 : picada ? -.4 : Math.sin(t * 9) * .6;
    // alas de membrana con dedos y orillas de obsidiana
    for (const d of [-1, 1]) {
      c.save(); c.scale(d, 1); c.rotate(-fl * .5); const span = quieto ? 20 : 44;
      c.fillStyle = wh ? '#ffffff' : shade(P.b, .08); c.beginPath(); c.moveTo(4, -6);
      c.lineTo(span * .45, -14 - fl * 10); c.lineTo(span, -8 - fl * 16);
      c.quadraticCurveTo(span * .9, 2, span * .8, 8 - fl * 4); c.quadraticCurveTo(span * .62, 3, span * .55, 12 - fl * 2); c.quadraticCurveTo(span * .38, 6, span * .3, 14); c.quadraticCurveTo(span * .18, 8, 5, 10); c.closePath(); c.fill();
      c.strokeStyle = P.a; c.lineWidth = .9; c.beginPath(); c.moveTo(4, -6); c.lineTo(span * .45, -14 - fl * 10); c.lineTo(span, -8 - fl * 16); c.moveTo(span * .45, -14 - fl * 10); c.lineTo(span * .8, 8 - fl * 4); c.moveTo(span * .45, -14 - fl * 10); c.lineTo(span * .55, 12 - fl * 2); c.moveTo(span * .45, -14 - fl * 10); c.lineTo(span * .3, 14); c.stroke();
      c.fillStyle = P.c; c.beginPath(); c.moveTo(span, -8 - fl * 16); c.lineTo(span + 4, -11 - fl * 17); c.lineTo(span - 1, -5 - fl * 16); c.fill(); // garra de navaja
      c.restore();
    }
    // cuerpo peludo
    c.fillStyle = wh ? '#ffffff' : P.a; c.beginPath(); c.ellipse(0, 2, 8, 11, 0, 0, TAU); c.fill(); c.strokeStyle = P.b; c.lineWidth = .8; c.stroke();
    c.strokeStyle = rgba(P.b, .6); c.lineWidth = .5; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(-5 + k * 2, -2); c.lineTo(-6 + k * 2.2, 2); c.stroke(); }
    // patas
    c.strokeStyle = P.b; c.lineWidth = 1.2; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * 3, 12); c.lineTo(d * 4, 17); c.lineTo(d * 2, 18); c.moveTo(d * 4, 17); c.lineTo(d * 6, 18); c.stroke(); }
    // cabeza: orejas largas y nariz de hoja
    c.fillStyle = wh ? '#ffffff' : P.a; c.beginPath(); c.arc(0, -11, 6.5, 0, TAU); c.fill(); c.strokeStyle = P.b; c.stroke();
    for (const d of [-1, 1]) { c.fillStyle = wh ? '#ffffff' : P.a; c.beginPath(); c.moveTo(d * 3, -15); c.lineTo(d * 9, -27); c.lineTo(d * 7, -13); c.closePath(); c.fill(); c.strokeStyle = P.b; c.lineWidth = .7; c.stroke(); c.fillStyle = P.core; c.globalAlpha *= .5; c.beginPath(); c.moveTo(d * 4.4, -15); c.lineTo(d * 8.2, -24); c.lineTo(d * 6.6, -14.5); c.fill(); c.globalAlpha /= .5; }
    c.fillStyle = shade(P.a, -.25); c.beginPath(); c.moveTo(0, -15); c.quadraticCurveTo(3, -11, 0, -7.5); c.quadraticCurveTo(-3, -11, 0, -15); c.fill(); // la hoja de la nariz
    c.fillStyle = stun ? '#ffffff' : '#ff4a4a'; for (const d of [-1, 1]) { c.beginPath(); c.ellipse(d * 3.2, -12, 1.5, 1.1, d * .3, 0, TAU); c.fill(); }
    c.save(); c.globalCompositeOperation = 'lighter'; for (const d of [-1, 1]) glowDot(c, d * 3.2, -12, 4, '#ff4a4a', .5); c.restore();
    c.fillStyle = '#ffffff'; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * 1.6, -7.4); c.lineTo(d * 2.2, -4.4); c.lineTo(d * 2.8, -7.4); c.fill(); } // colmillos
    // collar de jade (núcleo)
    c.fillStyle = P.c; for (let k = -3; k <= 3; k++) { c.beginPath(); c.arc(k * 2.2, -3 + Math.abs(k) * -.3, 1, 0, TAU); c.fill(); }
    nucleo(c, o, f, 0, 4, 2.6, 'rombo');
    if (stun) mareo(c, 0, -30, t);
    c.restore();
  };

  // ======================= XUNÁN KAB, LA ABEJA REINA =======================
  X.INIT.abeja = (o) => { o.x = mid(o); o.y = -40; o.filas = []; o.gotas = []; o.charcos = []; };
  X.CORE.abeja = (o) => ({ x: o.x + o.face * 4, y: o.y - 19, r: 8 });
  X.STEP.abeja = (o, g, dt) => {
    const p = g.p; let tx = mid(o) + Math.sin(o.t * .55) * 120, ty = 60 + Math.sin(o.t * 3) * 4, k = 1.8;
    if (o.st === 'entra') { tx = mid(o); ty = 60; }
    if (o.st === 'ventana') { tx = o.x; ty = o.stunT > 0 ? FLOOR - 7 : 98; k = o.stunT > 0 ? 6 : 2; }
    if (o.st === 'muere') ty = o.y + 20 * dt;
    const a = o.at; let libre = true;
    if (o.st === 'ataque' && o.atk === 'aguijon') {
      o.dur = 2.9; if (a < .05) o.tx = clamp(p.x, o.x0 + 14, o.x1 - 14);
      if (a < .9) { o.tx = lerp(o.tx, clamp(p.x, o.x0 + 14, o.x1 - 14), dt * 2); tx = o.tx; ty = 44; k = 5; }
      else if (a < 1.2) { libre = false; o.x = o.tx; o.y = lerp(44, FLOOR - 20, (a - .9) / .3); hurtIfIn(g, o.x - 10, o.y - 12, o.x + 10, o.y + 22); }
      else if (a < 2.1) { libre = false; o.x = o.tx + Math.sin(t2(o) * 40) * .8; o.y = FLOOR - 20; if (!o.clavo) { o.clavo = 1; g.shake = .35; spawn(g, 14, o.x, FLOOR, { ang: -Math.PI / 2, spread: 2.4, v: 90, life: .5, s: 2, k: 'dust', cols: [o.pal.c, o.pal.b] }); } hurtIfIn(g, o.x - 7, FLOOR - 8, o.x + 7, FLOOR); }
      else { tx = o.tx; ty = 60; }
      if (a < .1) o.clavo = 0;
    }
    if (libre) flota(o, dt, tx, ty, k);
    if (Math.abs(p.x - o.x) > 4 && o.st !== 'ventana') o.face = Math.sign(p.x - o.x);
    // filas de abejas
    for (const q of o.filas) { q.x += q.v * dt; q.t += dt; hurtIfIn(g, q.x - 3, q.y - 3, q.x + 3, q.y + 3); if (cancion(g, q, 3)) q.dead = true; }
    o.filas = o.filas.filter(q => !q.dead && q.x > o.x0 - 80 && q.x < o.x1 + 80);
    // gotas de miel que dejan charcos
    for (const d of o.gotas) { d.vy += 300 * dt; d.y += d.vy * dt; d.x += d.vx * dt; if (Math.abs(p.x - d.x) < 5 && p.y > d.y - 3 && p.y - p.h < d.y + 3) { d.dead = true; MEC.hurt(g, d.vx > 0 ? 1 : -1); } if (d.y >= FLOOR - 1) { d.dead = true; o.charcos.push({ x: d.x, life: 6, w: 0 }); spawn(g, 6, d.x, FLOOR, { v: 40, life: .4, s: 1.6, k: 'dust', cols: ['#f2a81a', '#ffd25a'] }); } }
    o.gotas = o.gotas.filter(d => !d.dead);
    for (const c2 of o.charcos) { c2.life -= dt; c2.w = Math.min(1, c2.w + dt * 4); if (p.on && Math.abs(p.x - c2.x) < 15 * c2.w && p.y > FLOOR - 3) { p.x -= p.vx * dt * .65; p.pegajosa = .1; } }
    o.charcos = o.charcos.filter(c2 => c2.life > 0);
    if (o.st !== 'ataque') return;
    if (o.atk === 'enjambre') {
      o.dur = 3.6; const dir0 = o.x > mid(o) ? -1 : 1;
      for (const [w, y, dir] of [[.5, FLOOR - 7, dir0], [1.8, FLOOR - 31, -dir0]]) if (a > w && !o['f' + w]) { o['f' + w] = 1; for (let n = 0; n < 6; n++) o.filas.push({ x: (dir > 0 ? o.x0 - 20 : o.x1 + 20) - dir * n * 11, y: y + Math.sin(n) * 2, v: dir * 150, t: n }); }
      if (a < .2) { o['f0.5'] = 0; o['f1.8'] = 0; }
    } else if (o.atk === 'miel') {
      o.dur = 2.8; const n = Math.floor((a - .4) / .5); if (a > .4 && n !== o.lastK && n >= 0 && n < 3) { o.lastK = n; const tx2 = clamp(p.x + (n - 1) * 30, o.x0 + 10, o.x1 - 10), tt = .9, sy = o.y + 14; o.gotas.push({ x: o.x, y: sy, vx: (tx2 - o.x) / tt, vy: ((FLOOR - sy) - .5 * 300 * tt * tt) / tt }); }
      if (a < .2) o.lastK = -1;
    }
  };
  const t2 = o => o.t;
  X.TELL.abeja = (c, o, f) => {
    for (const c2 of o.charcos) { const w = 15 * c2.w, al = Math.min(1, c2.life); c.fillStyle = rgba('#e8960f', .85 * al); c.beginPath(); c.ellipse(c2.x, FLOOR + .5, w, 2.4, 0, 0, TAU); c.fill(); c.fillStyle = rgba('#ffe08a', .7 * al); c.beginPath(); c.ellipse(c2.x - w * .3, FLOOR - .2, w * .3, .7, 0, 0, TAU); c.fill(); }
    if (o.st === 'ataque' && o.atk === 'aguijon' && o.at < .9 && o.tx != null) { c.strokeStyle = rgba(o.pal.core, .5 + Math.sin(f.t * 30) * .3); c.lineWidth = .8; c.beginPath(); c.ellipse(o.tx, FLOOR, 9, 2.6, 0, 0, TAU); c.moveTo(o.tx, FLOOR - 6); c.lineTo(o.tx, FLOOR + 3); c.stroke(); }
    for (const d of o.gotas) { c.fillStyle = '#f2a81a'; c.beginPath(); c.moveTo(d.x, d.y - 4); c.quadraticCurveTo(d.x + 3, d.y, d.x, d.y + 2.6); c.quadraticCurveTo(d.x - 3, d.y, d.x, d.y - 4); c.fill(); c.fillStyle = '#ffe08a'; c.fillRect(d.x - 1, d.y - 1.2, .8, .8); }
    for (const q of o.filas) { const w = Math.sin(q.t * 50); c.save(); c.translate(q.x, q.y); c.scale(Math.sign(q.v), 1); c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(-1, -2.6, 2, 1 + w * .5, -.4, 0, TAU); c.fill(); c.fillStyle = '#f2b01a'; c.beginPath(); c.ellipse(0, 0, 3, 2, 0, 0, TAU); c.fill(); c.fillStyle = '#2a1a0a'; c.fillRect(-1.4, -2, .9, 4); c.fillRect(.4, -2, .9, 4); c.beginPath(); c.arc(2.6, -.3, 1, 0, TAU); c.fill(); c.restore(); }
  };
  X.BODY.abeja = (c, o, f) => {
    // una abeja tiene que leerse amarilla en cualquier mundo: el oro se mezcla con el color del mundo
    const P = Object.assign({}, o.pal, { a: mix('#f2b01a', o.pal.a, .3) }), t = f.t, wh = blanco(o, t), stun = o.stunT > 0, cansada = o.st === 'ventana';
    c.save(); c.translate(o.x, o.y); c.scale(o.face, 1); if (stun) c.rotate(Math.sin(t * 6) * .3); muere(c, o);
    const clavada = o.st === 'ataque' && o.atk === 'aguijon' && o.at > .9 && o.at < 2.1; if (clavada) c.rotate(.5);
    // alas que zumban (cuatro)
    const wv = cansada ? Math.sin(t * 6) * .2 : Math.sin(t * 60) * .5;
    c.save(); c.globalAlpha *= .6; for (const [dx, r, s] of [[-4, -.9, 1], [-2, -.5, .75]]) { c.save(); c.translate(dx, -10); c.rotate(r + wv); c.fillStyle = wh ? '#ffffff' : 'rgba(230,245,255,.75)'; c.strokeStyle = rgba(P.b, .6); c.lineWidth = .5; c.beginPath(); c.ellipse(-12 * s, 0, 13 * s, 5 * s, 0, 0, TAU); c.fill(); c.stroke(); c.beginPath(); c.moveTo(0, 0); c.lineTo(-20 * s, 0); c.moveTo(-8 * s, 0); c.lineTo(-14 * s, -3 * s); c.stroke(); c.restore(); } c.restore();
    // abdomen rayado con aguijón
    c.save(); c.translate(-10, 4); c.rotate(.35);
    c.fillStyle = wh ? '#ffffff' : P.a; c.beginPath(); c.ellipse(-6, 0, 13, 9, 0, 0, TAU); c.fill(); c.strokeStyle = P.b; c.lineWidth = .9; c.stroke();
    c.save(); c.beginPath(); c.ellipse(-6, 0, 13, 9, 0, 0, TAU); c.clip(); c.fillStyle = P.b; for (const x of [-14, -7, 0]) { c.beginPath(); c.ellipse(x, 0, 2.2, 10, 0, 0, TAU); c.fill(); } c.restore();
    c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.ellipse(-6, -4.5, 8, 2, 0, 0, TAU); c.fill();
    c.fillStyle = P.b; c.beginPath(); c.moveTo(-18, -2); c.lineTo(-25 - (clavada ? 6 : 0), 1); c.lineTo(-18, 2.5); c.fill();
    c.restore();
    // tórax peludo
    c.fillStyle = wh ? '#ffffff' : shade(P.a, -.1); c.beginPath(); c.arc(0, -2, 7.5, 0, TAU); c.fill(); c.strokeStyle = P.b; c.lineWidth = .8; c.stroke();
    c.strokeStyle = rgba(P.c, .8); c.lineWidth = .5; for (let k = 0; k < 10; k++) { const an = k / 10 * TAU; c.beginPath(); c.moveTo(Math.cos(an) * 6, -2 + Math.sin(an) * 6); c.lineTo(Math.cos(an) * 8.4, -2 + Math.sin(an) * 8.4); c.stroke(); }
    // patitas con un tarro de miel
    c.strokeStyle = P.b; c.lineWidth = 1; for (const [x, y] of [[-3, 5], [1, 6], [5, 4]]) { c.beginPath(); c.moveTo(x, 3); c.lineTo(x + 1, y + 4); c.lineTo(x + 3, y + 5); c.stroke(); }
    c.fillStyle = '#c8803a'; c.beginPath(); roundRect(c, 6, 6, 7, 7, 2); c.fill(); c.fillStyle = '#f2a81a'; c.fillRect(6.5, 6.4, 6, 2.2); c.strokeStyle = P.b; c.lineWidth = .5; c.strokeRect(6, 6, 7, 7);
    // cabeza: ojos compuestos y antenas
    c.fillStyle = wh ? '#ffffff' : P.a; c.beginPath(); c.arc(7, -10, 6, 0, TAU); c.fill(); c.strokeStyle = P.b; c.lineWidth = .8; c.stroke();
    c.fillStyle = stun ? '#ffffff' : '#1a120a'; c.beginPath(); c.ellipse(9.6, -10.6, 2.8, 3.8, .2, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.55)'; for (const [x, y] of [[9, -12], [10.4, -11], [9.4, -9.6]]) { c.beginPath(); c.arc(x, y, .55, 0, TAU); c.fill(); }
    c.strokeStyle = P.b; c.lineWidth = .7; c.beginPath(); c.moveTo(7, -15); c.quadraticCurveTo(9, -22, 13, -22); c.moveTo(5, -15); c.quadraticCurveTo(5, -21, 8, -23); c.stroke(); c.fillStyle = P.b; c.beginPath(); c.arc(13, -22, 1, 0, TAU); c.arc(8, -23, 1, 0, TAU); c.fill();
    // corona de panal con la celda real (núcleo)
    c.fillStyle = '#f2c94c'; c.strokeStyle = shade('#f2c94c', -.35); c.lineWidth = .5;
    for (const [x, y] of [[0, -17], [4, -19.5], [8, -17], [2, -21.5], [6, -22.5]]) { c.beginPath(); for (let k = 0; k < 6; k++) { const an = k / 6 * TAU + Math.PI / 6; c.lineTo(x + Math.cos(an) * 2.3, y + Math.sin(an) * 2.3); } c.closePath(); c.fill(); c.stroke(); }
    nucleo(c, o, f, 4, -19.5, 2.2, 'hex');
    if (stun) mareo(c, 6, -30, t);
    c.restore();
  };

  // balas de cañón fantasma
  const prev = MEC.OBJ.fireball.draw;
  MEC.OBJ.fireball.draw = (c, o, f) => {
    if (o.kind !== 'bala') return prev(c, o, f);
    c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, o.x - o.vx * .02, o.y - o.vy * .02, 8, '#7affc8', .4); c.restore();
    c.fillStyle = '#2a2e2c'; c.beginPath(); c.arc(o.x, o.y, 3.2, 0, TAU); c.fill(); c.fillStyle = '#6a7470'; c.beginPath(); c.arc(o.x - 1, o.y - 1, 1.2, 0, TAU); c.fill();
  };
})();
