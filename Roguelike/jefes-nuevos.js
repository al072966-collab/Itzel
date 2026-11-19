'use strict';
// =====================================================================
//  JEFES NUEVOS: el Jaguar de obsidiana, la Reina de las hadas y el
//  Cocodrilo del cenote. Usan la misma regla que los demás: después de
//  cada ataque abren el núcleo; Fresita sube a Itzel (alcance) o lo
//  aturde (control) e Itzel le cae encima.
// =====================================================================
Object.assign(JEFES, {
  jaguar: { nombre: 'El Jaguar de obsidiana', lema: 'Acecha, salta y ruge hasta que se cae el techo.', ataques: ['acecho', 'garras', 'rugido'],
    texto: 'El señor de la selva de Calakmul. Acecha agachado y salta sobre Itzel, cruza la arena dando zarpazos y ruge tan fuerte que caen piedras. Para descansar se sube a una isla; la gema de jade de su frente es el núcleo.' },
  hadas: { nombre: 'La Reina de las hadas', lema: 'Sus hadas se roban a Fresita; Itzel tiene que rescatarla.', ataques: ['secuestro', 'polvo', 'espejos'],
    texto: 'La mujer de la leyenda, que se aparece junto a la ceiba en noches de luna. Manda lucecitas que persiguen a Fresita: si la atrapan la encierran en una jaula: Itzel la abre si llega hasta ella y, si no, el hechizo se acaba a los ocho segundos. Además deja caer polvo de estrellas y manda reflejos suyos que cruzan volando. Cuando queda vulnerable, una luz aparece junto a su cabello.' },
  cocodrilo: { nombre: 'El Cocodrilo del cenote', lema: 'Nada bajo el suelo y sale a morder donde estás parada.', ataques: ['emboscada', 'coletazo', 'escupe'],
    texto: 'Un cocodrilo enorme de la Laguna de Términos. Nada por debajo del suelo (solo se ve su cresta), sale a morder justo debajo de Itzel, barre el suelo con la cola y escupe agua en arco. Cuando se cansa se levanta: la piedra de su lomo es el núcleo.' },
});

(function () {
  const X = JEFES_EXT, FLOOR = X.FLOOR, hurtIfIn = X.hurtIfIn;
  const islas = () => [L.camMin + 6 * T, L.camMin + 22 * T];
  const ISLA_Y = 7 * T;

  // ======================= JAGUAR =======================
  X.INIT.jaguar = (o) => { o.x = o.x1 - 40; o.y = -30; o.vy = 0; o.face = -1; };
  X.CORE.jaguar = (o) => ({ x: o.x + o.face * 12, y: o.y - 15, r: 8 });
  X.STEP.jaguar = (o, g, dt) => {
    const p = g.p;
    const aTierra = () => { if (o.y < FLOOR) { o.vy = (o.vy || 0) + 1200 * dt; o.y = Math.min(FLOOR, o.y + o.vy * dt); if (o.y >= FLOOR) { o.vy = 0; g.shake = Math.max(g.shake, .15); } } };
    if (o.st === 'entra') { aTierra(); return; }
    if (o.st === 'ventana') {
      if (o.stunT > 0) { aTierra(); o.perch = null; return; }
      // se sube a la isla más cercana a descansar
      if (!o.perch) { const [a, b] = islas(); o.perch = Math.abs(o.x - a) < Math.abs(o.x - b) ? a : b; o.sx = o.x; o.sy = o.y; o.pt = 0; }
      o.pt = Math.min(1, o.pt + dt * 2.2); const u = o.pt; o.x = lerp(o.sx, o.perch, u); o.y = lerp(o.sy, ISLA_Y, u) - Math.sin(u * Math.PI) * 40; o.face = Math.sign(p.x - o.x) || o.face;
      return;
    }
    o.perch = null;
    if (o.st === 'herido' || o.st === 'muere') { aTierra(); return; }
    if (o.st !== 'ataque') return;
    const a = o.at;
    if (o.atk === 'acecho') {
      o.dur = 2.5;
      if (a < .9) { aTierra(); o.face = Math.sign(p.x - o.x) || o.face; o.crouch = 1; }
      else if (!o.salto) { o.salto = { x0: o.x, y0: o.y, x1: clamp(p.x, o.x0 + 20, o.x1 - 20), t: 0 }; o.crouch = 0; }
      if (o.salto) { const s = o.salto; s.t = Math.min(1, s.t + dt * 1.6); o.x = lerp(s.x0, s.x1, s.t); o.y = lerp(s.y0, FLOOR, s.t) - Math.sin(s.t * Math.PI) * 70; if (s.t >= 1) { g.shake = .25; o.salto = null; o.dur = 0; } }
    } else if (o.atk === 'garras') {
      if (a < .05) { o.face = o.x > (o.x0 + o.x1) / 2 ? -1 : 1; o.dur = 9; }
      aTierra();
      if (a > .5) { o.x += o.face * 230 * dt; if (o.x < o.x0 + 16 || o.x > o.x1 - 16) { o.x = clamp(o.x, o.x0 + 16, o.x1 - 16); o.dur = 0; g.shake = .3; } }
    } else if (o.atk === 'rugido') {
      o.dur = 2.6; aTierra();
      if (a > .5 && !o.rugio) { o.rugio = 1; g.shake = .5; for (let k = 0; k < 6; k++) { const x = lerp(o.x0, o.x1, (k + Math.random()) / 6); g.objs.push({ k: 'fireball', kind: 'roca', x, y: -10 - k * 14, vx: 0, vy: 60, life: 4 }); } if (Math.hypot(g.fre.x - o.x, g.fre.y - o.y) < 90) { g.fre.daze = 1.5; MEC.ring(g, g.fre.x, g.fre.y, '#ffffff', 16, .5); } }
      if (a < .2) o.rugio = 0;
    }
    if (o.st === 'ataque') hurtIfIn(g, o.x - 15, o.y - 16, o.x + 15, o.y);
  };
  X.TELL.jaguar = (c, o, f) => { if (o.st === 'ataque' && o.atk === 'rugido' && o.at > .4 && o.at < 1.2) { c.strokeStyle = rgba(o.pal.c, .6 * (1.2 - o.at)); c.lineWidth = 1.2; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(o.x + o.face * 14, o.y - 14, 10 + (o.at - .4) * 90 + k * 8, -.7, .7); c.stroke(); } } };
  X.BODY.jaguar = (c, o, f) => {
    const P = o.pal, t = f.t, white = o.flash > 0 && Math.sin(t * 40) > 0, stun = o.stunT > 0, cr = o.crouch ? 3 : 0, run = o.st === 'ataque' && o.atk === 'garras' && o.at > .5;
    c.save(); c.translate(o.x, o.y); c.scale(o.face, 1); if (o.st === 'muere') c.globalAlpha = clamp(1 - o.at / 2.4, 0, 1);
    const a = Math.sin(t * (run ? 22 : 6));
    c.strokeStyle = P.b; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(-14, -12 + cr); c.quadraticCurveTo(-24, -16 + a * 3, -26, -26 + a * 2); c.stroke();
    c.fillStyle = white ? '#ffffff' : P.b;
    for (const [lx, ph] of [[-10, 0], [-5, 1], [6, 0], [11, 1]]) { c.save(); c.translate(lx, -7 + cr); c.rotate((ph ? a : -a) * (run ? .6 : .15)); c.fillRect(-1.6, 0, 3.2, 7 - cr); c.restore(); }
    c.beginPath(); c.ellipse(0, -11 + cr, 16, 6.5 - cr * .3, 0, 0, TAU); c.fillStyle = white ? '#ffffff' : P.a; c.fill(); c.strokeStyle = P.b; c.lineWidth = .8; c.stroke();
    c.fillStyle = P.b; for (const [sx, sy] of [[-10, -12], [-5, -9], [-2, -14], [3, -10], [8, -13], [-7, -15]]) { c.beginPath(); c.arc(sx, sy + cr, 1.5, 0, TAU); c.fill(); c.fillStyle = P.c; c.beginPath(); c.arc(sx, sy + cr, .6, 0, TAU); c.fill(); c.fillStyle = P.b; }
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-3, -15 + cr, 9, 1.4, 0, 0, TAU); c.fill();
    c.beginPath(); c.arc(14, -15 + cr, 6, 0, TAU); c.fillStyle = white ? '#ffffff' : P.a; c.fill(); c.strokeStyle = P.b; c.stroke();
    c.fillStyle = P.b; c.beginPath(); c.moveTo(10, -19 + cr); c.lineTo(11, -23 + cr); c.lineTo(13, -20 + cr); c.moveTo(15, -20 + cr); c.lineTo(17, -23 + cr); c.lineTo(18, -19 + cr); c.fill();
    c.fillStyle = stun ? '#ffffff' : P.eye; c.fillRect(15, -17 + cr, 2.4, 1.2);
    if (o.st === 'ataque' && o.atk === 'rugido' && o.at > .4 && o.at < 1.4) { c.fillStyle = '#2a0a0a'; c.beginPath(); c.ellipse(19, -12 + cr, 2.6, 2, 0, 0, TAU); c.fill(); }
    const open = o.st === 'ventana' || o.st === 'herido';
    c.save(); if (open) { c.shadowColor = P.core; c.shadowBlur = 10 * f.S; } c.fillStyle = P.core; c.beginPath(); c.moveTo(12, -21 + cr); c.lineTo(14, -24 + cr); c.lineTo(16, -21 + cr); c.lineTo(14, -19 + cr); c.closePath(); c.fill(); c.restore();
    if (stun) for (let i = 0; i < 3; i++) { const an = t * 5 + i * 2.1; c.fillStyle = '#fff3a0'; c.beginPath(); c.arc(14 + Math.cos(an) * 8, -27 + Math.sin(an) * 2.5, 1.2, 0, TAU); c.fill(); }
    c.restore();
  };

  // ======================= REINA DE LAS HADAS =======================
  X.INIT.hadas = (o) => { o.x = (o.x0 + o.x1) / 2; o.y = -40; o.minis = []; o.jaula = null; o.reflejos = []; };
  X.CORE.hadas = (o) => ({ x: o.x, y: o.y - 15, r: 8 });
  X.STEP.hadas = (o, g, dt) => {
    const p = g.p, mid = (o.x0 + o.x1) / 2;
    let tx = mid + Math.sin(o.t * .6) * 130, ty = 56 + Math.sin(o.t * 1.2) * 12;
    if (o.st === 'entra') { tx = mid; ty = 60; }
    if (o.st === 'ventana') { tx = o.x; ty = o.stunT > 0 ? FLOOR - 4 : 92; }
    o.x += (tx - o.x) * Math.min(1, dt * (o.stunT > 0 ? 6 : 1.8)); o.y += (ty - o.y) * Math.min(1, dt * (o.stunT > 0 ? 6 : 1.8));
    // hadas que persiguen a Fresita
    for (const m of o.minis) {
      m.t += dt; const dx = g.fre.x - m.x, dy = g.fre.y - m.y, d = Math.hypot(dx, dy) || 1;
      m.x += dx / d * 85 * dt + Math.sin(m.t * 9) * .6; m.y += dy / d * 85 * dt + Math.cos(m.t * 7) * .6;
      if (g.lull && g.t - g.lull.t < .05 && Math.hypot(m.x - g.lull.x, m.y - g.lull.y) < g.lull.r + 8) m.dead = true;
      if (d < 8 && !o.jaula) { const [a, b] = islas(); const jx = Math.abs(p.x - a) > Math.abs(p.x - b) ? a : b; o.jaula = { x: jx, y: ISLA_Y - 12 }; m.dead = true; for (const q of o.minis) q.dead = true; if (typeof toast === 'function') toast('¡Se llevaron a Fresita! Itzel, abre la jaula'); }
      if (m.t > 5) m.dead = true;
    }
    o.minis = o.minis.filter(m => !m.dead);
    // la jaula: Fresita no se puede mover hasta que Itzel la toque; si nadie la abre, el hechizo se acaba
    // a los 8 s (si no, un muro de madera o una columna sin tinta podían dejar la pelea sin salida)
    if (o.jaula) {
      o.jaula.t = (o.jaula.t || 0) + dt; g.fre.x = o.jaula.x; g.fre.y = o.jaula.y; g.fre.daze = .2;
      const abre = Math.abs(p.x - o.jaula.x) < 12 && p.y > o.jaula.y - 6 && p.y - p.h < o.jaula.y + 10;
      if (abre || o.jaula.t > 8) { spawn(g, 20, o.jaula.x, o.jaula.y, { v: 90, life: .6, s: 2, k: 'spark', cols: abre ? ['#ffffff', '#ffd1ea'] : ['#d8c8ff', '#ffffff'] }); o.jaula = null; g.fre.daze = 0; }
    }
    // reflejos que cruzan
    for (const r of o.reflejos) { r.x += r.v * dt; hurtIfIn(g, r.x - 7, r.y - 18, r.x + 7, r.y); }
    o.reflejos = o.reflejos.filter(r => r.x > o.x0 - 60 && r.x < o.x1 + 60);
    if (o.st !== 'ataque') return;
    const a = o.at;
    if (o.atk === 'secuestro') { o.dur = 2.6; if (a > .3 && !o.mandadas && !o.jaula) { o.mandadas = 1; for (let k = 0; k < 3; k++) o.minis.push({ x: o.x + (k - 1) * 10, y: o.y, t: k * .4 }); } if (a < .2) o.mandadas = 0; }
    else if (o.atk === 'polvo') { o.dur = 2.8; const k = Math.floor(a / .3); if (k !== o.lastK && k < 8) { o.lastK = k; o.orbs.push({ c: 'rosa', x: lerp(o.x0, o.x1, Math.random()), y: -6, vx: 0, vy: 110, life: 3 }); } if (a < .1) o.lastK = -1; }
    else if (o.atk === 'espejos') { o.dur = 3; if (a > .5 && !o.lanzo) { o.lanzo = 1; const lado = Math.random() < .5 ? -1 : 1; for (let k = 0; k < 3; k++) o.reflejos.push({ x: lado < 0 ? o.x1 + 40 + k * 70 : o.x0 - 40 - k * 70, y: FLOOR - [0, 30, 0][k], v: -lado * 150 }); } if (a < .2) o.lanzo = 0; }
  };
  X.TELL.hadas = (c, o, f) => {
    for (const m of o.minis) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, m.x, m.y, 7, o.pal.c, .6); c.restore(); c.fillStyle = '#ffffff'; c.beginPath(); c.arc(m.x, m.y, 1.4, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.6)'; const w = Math.sin(m.t * 40); c.beginPath(); c.ellipse(m.x - 2, m.y - 1.5, 2.2, 1 + w * .5, -.5, 0, TAU); c.ellipse(m.x + 2, m.y - 1.5, 2.2, 1 + w * .5, .5, 0, TAU); c.fill(); }
    for (const r of o.reflejos) { c.save(); c.globalAlpha = .45; c.translate(r.x - o.x, r.y - o.y); X.BODY.hadas(c, Object.assign({}, o, { stunT: 0, flash: 0, st: 'ataque' }), f); c.restore(); }
    if (o.jaula) { const j = o.jaula; c.save(); if (j.t > 6) c.globalAlpha = .45 + .55 * Math.abs(Math.cos((j.t - 6) * 9)); c.strokeStyle = o.pal.b; c.lineWidth = 1; c.beginPath(); c.arc(j.x, j.y - 2, 10, Math.PI, 0); for (let k = -8; k <= 8; k += 4) { c.moveTo(j.x + k, j.y - 2 - Math.sqrt(100 - k * k)); c.lineTo(j.x + k, j.y + 10); } c.moveTo(j.x - 10, j.y + 10); c.lineTo(j.x + 10, j.y + 10); c.stroke(); c.strokeStyle = o.pal.c; c.lineWidth = .5; c.stroke(); c.restore(); }
  };
  X.BODY.hadas = (c, o, f) => {
    const P = o.pal, t = f.t, white = o.flash > 0 && Math.sin(t * 40) > 0, stun = o.stunT > 0, open = o.st === 'ventana' || o.st === 'herido';
    c.save(); c.translate(o.x, o.y); if (stun) c.rotate(Math.sin(t * 6) * .3); if (o.st === 'muere') { c.globalAlpha = clamp(1 - o.at / 2.4, 0, 1); }
    const w = Math.sin(t * 14) * .3;
    c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 0, -8, 30, P.c, .25); c.restore();
    for (const d of [-1, 1]) { c.save(); c.scale(d, 1); c.rotate(w); c.fillStyle = rgba(P.c, .45); c.strokeStyle = rgba(P.c, .9); c.lineWidth = .6; c.beginPath(); c.moveTo(1, -10); c.bezierCurveTo(12, -32, 26, -22, 18, -10); c.bezierCurveTo(24, -2, 12, 4, 1, -6); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(2, -9); c.quadraticCurveTo(12, -18, 17, -14); c.stroke(); c.restore(); }
    c.fillStyle = white ? '#ffffff' : P.a; c.beginPath(); c.moveTo(-3, -8); c.lineTo(3, -8); c.lineTo(10, 14); c.quadraticCurveTo(0, 17, -10, 14); c.closePath(); c.fill(); c.strokeStyle = P.b; c.lineWidth = .8; c.stroke();
    c.fillStyle = P.c; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(-7 + k * 3.5, 12.5 + Math.sin(k) * .5, .7, 0, TAU); c.fill(); }
    c.fillStyle = '#f0d0c0'; c.beginPath(); c.arc(0, -12, 4.2, 0, TAU); c.fill(); c.strokeStyle = P.b; c.lineWidth = .6; c.stroke();
    c.fillStyle = P.b; c.beginPath(); c.arc(0, -13.5, 4.4, Math.PI, 0); c.fill(); c.beginPath(); c.moveTo(-4.4, -13.5); c.quadraticCurveTo(-7, -6, -5, -2); c.lineTo(-3.6, -10); c.fill(); c.beginPath(); c.moveTo(4.4, -13.5); c.quadraticCurveTo(7, -6, 5, -2); c.lineTo(3.6, -10); c.fill();
    c.fillStyle = stun ? '#ffffff' : P.eye; c.fillRect(-2.2, -12.4, 1.2, 1.4); c.fillRect(1, -12.4, 1.2, 1.4);
    c.fillStyle = '#f2c94c'; c.beginPath(); c.moveTo(-4, -17); c.lineTo(-3, -21); c.lineTo(-1.2, -18); c.lineTo(0, -22); c.lineTo(1.2, -18); c.lineTo(3, -21); c.lineTo(4, -17); c.closePath(); c.fill();
    c.save(); if (open) { c.shadowColor = P.core; c.shadowBlur = 10 * f.S; } c.fillStyle = P.core; c.beginPath(); c.arc(0, -18.4, 1.5, 0, TAU); c.fill(); c.restore();
    c.strokeStyle = '#f2c94c'; c.lineWidth = .7; c.beginPath(); c.moveTo(6, -4); c.lineTo(13, -14); c.stroke(); c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 13, -14, 5, P.c, .8); c.restore();
    c.restore();
  };

  // ======================= COCODRILO DEL CENOTE =======================
  X.INIT.cocodrilo = (o) => { o.x = (o.x0 + o.x1) / 2; o.y = FLOOR; o.sub = 1; o.face = -1; o.erg = 0; };
  X.CORE.cocodrilo = (o) => o.erg > .5 ? { x: o.x + o.face * 2, y: FLOOR - 20 - o.erg * 50, r: 8 } : { x: o.x - o.face * 4, y: FLOOR - 12 + o.sub * 14, r: 8 };
  X.STEP.cocodrilo = (o, g, dt) => {
    const p = g.p, rodar = (v) => { o.sub += (v - o.sub) * Math.min(1, dt * 5); };
    o.erg += ((o.st === 'ventana' && !(o.stunT > 0) ? 1 : 0) - o.erg) * Math.min(1, dt * 4);
    if (o.st === 'entra') { rodar(1); o.x += (((o.x0 + o.x1) / 2) - o.x) * dt; return; }
    if (o.st === 'ventana' || o.st === 'herido' || o.st === 'muere') { rodar(0); if (o.st === 'ventana' && !(o.stunT > 0)) o.x += (((o.x0 + o.x1) / 2) - o.x) * Math.min(1, dt * 3); return; }
    if (o.st !== 'ataque') return;
    const a = o.at;
    if (o.atk === 'emboscada') {
      o.dur = 2.9;
      if (a < 1.3) { rodar(1); o.x += clamp(p.x - o.x, -140 * dt, 140 * dt); o.face = Math.sign(p.x - o.x) || o.face; o.mordida = 0; }
      else if (a < 1.8) { rodar(1); o.aviso = 1; }
      else if (a < 2.4) { o.aviso = 0; o.mordida = Math.min(1, (o.mordida || 0) + dt * 8); hurtIfIn(g, o.x - 12, FLOOR - 44 * o.mordida, o.x + 12, FLOOR); if (!o.mordio) { o.mordio = 1; g.shake = .35; spawn(g, 16, o.x, FLOOR, { ang: -Math.PI / 2, spread: 2, v: 120, life: .6, s: 2, k: 'dust', cols: [o.pal.c, o.pal.a] }); } }
      else { o.mordida = Math.max(0, o.mordida - dt * 4); }
      if (a < .1) o.mordio = 0;
    } else if (o.atk === 'coletazo') {
      o.dur = 2.6; rodar(.4);
      if (a > .7 && !o.cola) { o.cola = 1; const lado = o.x > (o.x0 + o.x1) / 2 ? -1 : 1; o.waves.push({ x: o.x, v: lado * 210, life: 2.4 }); g.shake = .3; }
      if (a < .2) o.cola = 0;
    } else if (o.atk === 'escupe') {
      o.dur = 2.6; rodar(.3); o.face = Math.sign(p.x - o.x) || o.face;
      const k = Math.floor(a / .55); if (k !== o.lastK && k >= 1 && k <= 3) { o.lastK = k; const tt = .9, tx2 = p.x + (k - 2) * 20, sx = o.x + o.face * 18, sy = FLOOR - 16; g.objs.push({ k: 'fireball', kind: 'gota', x: sx, y: sy, vx: (tx2 - sx) / tt, vy: ((FLOOR - 4 - sy) - .5 * 420 * tt * tt) / tt, life: 3 }); }
      if (a < .1) o.lastK = 0;
    }
    if (o.sub < .5) hurtIfIn(g, o.x - 26, FLOOR - 14, o.x + 26, FLOOR);
  };
  X.TELL.cocodrilo = (c, o, f) => {
    if (o.aviso) { c.strokeStyle = rgba(o.pal.c, .5 + Math.sin(f.t * 30) * .3); c.lineWidth = .8; for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(o.x, FLOOR + 1, 8 + k * 6 + (f.t * 20) % 6, 2 + k, 0, Math.PI, 0); c.stroke(); } }
    // la cresta que se asoma mientras nada bajo el suelo
    if (o.sub > .6 && !(o.mordida > 0)) { c.fillStyle = o.pal.b; for (let k = -3; k <= 3; k++) { const x = o.x + k * 6, h = (4 - Math.abs(k) * .7) * (o.sub); c.beginPath(); c.moveTo(x - 2.5, FLOOR); c.lineTo(x, FLOOR - h - Math.sin(f.t * 6 + k) * .6); c.lineTo(x + 2.5, FLOOR); c.fill(); } c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = .5; c.beginPath(); c.ellipse(o.x, FLOOR + .5, 26, 1.6, 0, 0, TAU); c.stroke(); }
  };
  X.BODY.cocodrilo = (c, o, f) => {
    const P = o.pal, t = f.t, white = o.flash > 0 && Math.sin(t * 40) > 0, stun = o.stunT > 0, open = o.st === 'ventana' || o.st === 'herido';
    if (o.mordida > 0) { // mandíbulas saliendo del suelo
      const m = o.mordida; c.save(); c.translate(o.x, FLOOR); c.fillStyle = P.a; c.strokeStyle = P.b; c.lineWidth = 1;
      for (const d of [-1, 1]) { c.save(); c.scale(d, 1); c.rotate(-.25 + (1 - m) * .2); c.beginPath(); c.moveTo(0, 0); c.lineTo(4, -44 * m); c.lineTo(10, -40 * m); c.lineTo(12, 0); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#ffffff'; for (let k = 1; k < 7; k++) { c.beginPath(); c.moveTo(4 + k * .2, -k * 6 * m); c.lineTo(1.5, -k * 6 * m - 2); c.lineTo(4 + k * .2, -k * 6 * m - 3.5); c.fill(); } c.fillStyle = P.a; c.restore(); }
      c.restore(); return;
    }
    if (o.sub > .7) return;
    const e = o.erg;
    c.save(); c.translate(o.x, FLOOR + o.sub * 16); c.scale(o.face, 1); if (o.st === 'muere') c.globalAlpha = clamp(1 - o.at / 2.4, 0, 1);
    c.rotate(-e * 1.2);
    c.fillStyle = white ? '#ffffff' : P.a; c.strokeStyle = P.b; c.lineWidth = 1;
    c.beginPath(); c.moveTo(-34, -2); c.quadraticCurveTo(-20, -12, 0, -12); c.lineTo(16, -11); c.lineTo(30, -8); c.lineTo(31, -4); c.lineTo(16, -3); c.quadraticCurveTo(0, 0, -34, -2); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = P.c; c.beginPath(); c.moveTo(-20, -2); c.quadraticCurveTo(0, -1, 16, -3); c.lineTo(16, -2); c.quadraticCurveTo(0, 1, -20, -1); c.fill();
    c.fillStyle = P.b; for (let k = -26; k < 12; k += 5) { c.beginPath(); c.moveTo(k, -11 + Math.abs(k) * .02); c.lineTo(k + 2.5, -15); c.lineTo(k + 5, -11); c.fill(); }
    c.fillStyle = '#ffffff'; for (let k = 18; k < 30; k += 3) { c.beginPath(); c.moveTo(k, -4); c.lineTo(k + 1, -6); c.lineTo(k + 2, -4); c.fill(); }
    c.fillStyle = stun ? '#ffffff' : P.eye; c.beginPath(); c.arc(17, -12.5, 1.6, 0, TAU); c.fill(); c.fillStyle = '#111'; if (!stun) { c.fillRect(17, -13.5, .7, 2); }
    c.save(); if (open) { c.shadowColor = P.core; c.shadowBlur = 10 * f.S; } c.fillStyle = P.core; c.beginPath(); c.moveTo(-6, -13); c.lineTo(-2, -18); c.lineTo(2, -13); c.lineTo(-2, -11); c.closePath(); c.fill(); c.restore();
    if (stun) for (let i = 0; i < 3; i++) { const an = t * 5 + i * 2.1; c.fillStyle = '#fff3a0'; c.beginPath(); c.arc(17 + Math.cos(an) * 7, -19 + Math.sin(an) * 2, 1.2, 0, TAU); c.fill(); }
    c.restore();
  };

  // gotas de agua del cocodrilo
  const prev = MEC.OBJ.fireball.draw;
  MEC.OBJ.fireball.draw = (c, o, f) => { if (o.kind !== 'gota') return prev(c, o, f); c.fillStyle = 'rgba(140,210,255,.9)'; c.beginPath(); c.moveTo(o.x, o.y - 4); c.quadraticCurveTo(o.x + 3, o.y, o.x, o.y + 2.6); c.quadraticCurveTo(o.x - 3, o.y, o.x, o.y - 4); c.fill(); c.fillStyle = '#ffffff'; c.fillRect(o.x - 1, o.y - 1.5, .8, .8); };
})();
