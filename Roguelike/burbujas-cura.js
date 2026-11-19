'use strict';
// =====================================================================
//  BURBUJAS DE CURACIÓN
//  En las peleas de jefe, si a Itzel le faltan corazones, cada tanto sale
//  una burbuja cerca del piso. Itzel la atraviesa: la que tiene que bajar
//  a tocarla es Fresita, y mientras baja deja de cuidar el núcleo. Al
//  tocarla, el corazón vuela hasta Itzel. Si nadie la toca, se revienta.
// =====================================================================
const BURBUJAS_CURA = (() => {
  const { OBJ, ring } = MEC;
  const FLOOR = 11 * T, DURA = 11, ALTO = 13, TOCA = 12;
  const RITMO = { tranquila: .7, normal: 1, retadora: 1.35 };
  const espera = () => (13 + Math.random() * 6) * (RITMO[RUN.dif] || 1) * (RUN.upg.miel ? .6 : 1);
  function nace(o, g) {
    const rec = VISTA.rec || 0, a = Math.max(o.x0 + 18, g.cam + rec + 24), z = Math.min(o.x1 - 18, g.cam + VW - rec - 24);
    for (let i = 0; i < 24; i++) {
      const x = a + Math.random() * (z - a), piso = MEC.surf(x, FLOOR - 30); if (piso > FLOOR + 40 || Math.abs(x - g.p.x) < 50) continue;
      o.cura = { x, y: piso - ALTO, t: 0, st: 'flota', sale: Math.random() * 6 }; ring(g, x, piso - ALTO, '#ffb0dc', 16, .5);
      if (typeof ENCI !== 'undefined') ENCI.ver('entorno:burbujaCura');
      if (typeof PROG !== 'undefined' && !PROG.s.burbujas && typeof toast === 'function') toast('¡Fresita, baja a tocar la burbuja para curar a Itzel!', 3800);
      return;
    }
    o.curaT = 1;
  }
  function cura(o, g) {
    const b = o.cura, p = g.p, antes = RUN.hearts; o.cura = null; o.curaT = espera();
    RUN.hearts = Math.min(RUN.maxHearts, RUN.hearts + 1); ring(g, p.x, p.y - 8, '#ff9ccc', 24, .55); spawn(g, 18, p.x, p.y - 8, { v: 90, life: .7, s: 2, k: 'spark', cols: ['#ff5d73', '#ffd1ea', '#ffffff'], g: 40 });
    if (typeof toast === 'function') toast('Fresita curó a Itzel: un corazón más');
    if (typeof PROG !== 'undefined') { PROG.s.burbujas = (PROG.s.burbujas || 0) + 1; if (antes === 1) PROG.s.porUnPelito = 1; if (typeof revisaLogros === 'function') revisaLogros(); }
  }
  function paso(o, g, dt) {
    if (typeof RUN === 'undefined' || !RUN) return;
    if (o.st === 'muere' || g.win) { if (o.cura && o.cura.st === 'flota') { spawn(g, 10, o.cura.x, o.cura.y, { v: 60, life: .45, s: 1.6, k: 'spark', cols: ['#ffd1ea', '#ffffff'], g: 50 }); o.cura = null; } return; }
    if (o.curaT === undefined) o.curaT = 6;
    const b = o.cura;
    if (!b) { if (o.st !== 'entra' && RUN.hearts < RUN.maxHearts) { o.curaT -= dt; if (o.curaT <= 0) nace(o, g); } return; }
    b.t += dt;
    if (b.st === 'viaja') {
      const u = b.t / .5, p = g.p, tx = p.x, ty = p.y - 10; b.vx = lerp(b.ox, tx, u * u); b.vy = lerp(b.oy, ty, u * u) - Math.sin(u * Math.PI) * 22;
      if (Math.random() < .6) spawn(g, 1, b.vx, b.vy, { v: 20, life: .4, s: 1.4, k: 'spark', cols: ['#ff9ccc', '#ffffff'], g: 20 });
      if (u >= 1) cura(o, g); return;
    }
    const y = b.y + Math.sin(b.t * 2.2) * 2.4;
    if (Math.hypot(g.fre.x - b.x, g.fre.y - y) < TOCA) {
      b.st = 'viaja'; b.t = 0; b.ox = b.x; b.oy = y; b.vx = b.x; b.vy = y; ring(g, b.x, y, '#ffffff', 18, .4);
      spawn(g, 16, b.x, y, { v: 80, life: .5, s: 1.8, k: 'spark', cols: ['#ffd1ea', '#ffffff', '#ffe9a8'], g: 30 });
    } else if (b.t > DURA) { spawn(g, 12, b.x, y, { v: 60, life: .45, s: 1.6, k: 'spark', cols: ['#ffd1ea', '#ffffff'], g: 50 }); o.cura = null; o.curaT = espera() * .6; }
  }
  const CORAZON = ['.RR.RR.', 'RRRRRRR', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...'];
  function pixel(c, x, y, t) {
    x = Math.round(x); y = Math.round(y);
    for (let j = -7; j <= 7; j++) for (let i = -7; i <= 7; i++) {
      const d = Math.hypot(i, j); if (d > 7.4) continue;
      c.fillStyle = d > 6.3 ? '#3a1a3a' : d > 5.4 ? '#ffffff' : (i + j < -6 ? '#ffe0f0' : '#f79ccf'); c.fillRect(x + i, y + j, 1, 1);
    }
    for (let j = 0; j < CORAZON.length; j++) for (let i = 0; i < 7; i++) if (CORAZON[j][i] === 'R') { c.fillStyle = j === 0 ? '#ff8a9a' : '#d92a4a'; c.fillRect(x - 3 + i, y - 3 + j, 1, 1); }
    c.fillStyle = '#ffffff'; c.fillRect(x - 4, y - 4, 2, 1); c.fillRect(x - 4, y - 3, 1, 1);
  }
  function corazon(c, x, y, s, col) {
    c.beginPath(); c.moveTo(x, y + s * .95); c.bezierCurveTo(x - s * 1.55, y - s * .1, x - s * .8, y - s * 1.1, x, y - s * .38); c.bezierCurveTo(x + s * .8, y - s * 1.1, x + s * 1.55, y - s * .1, x, y + s * .95); c.closePath();
    c.fillStyle = col; c.fill(); c.strokeStyle = '#6a1030'; c.lineWidth = .7; c.stroke();
  }
  function fina(c, x, y, t) {
    const r = 8.2 + Math.sin(t * 3) * .4;
    c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x, y, 18, '#ff8cc8', .4); c.restore();
    const gr = c.createRadialGradient(x - 2.6, y - 3, .8, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.92)'); gr.addColorStop(.45, 'rgba(255,190,226,.62)'); gr.addColorStop(1, 'rgba(236,84,168,.78)');
    c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(70,20,70,.85)'; c.lineWidth = 1.1; c.stroke();
    for (const [a, l, col] of [[t * .8, 1.5, '#ffffff'], [t * .8 + 2.1, 1.1, '#9fe9ff'], [t * .8 + 4.2, 1.1, '#ffe48a']]) { c.strokeStyle = col; c.lineWidth = .8; c.beginPath(); c.arc(x, y, r - .9, a, a + l); c.stroke(); }
    corazon(c, x, y + .4, 3.5, '#e8324f');
    c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.ellipse(x - 3.4, y - 4, 1.9, 1, -.7, 0, TAU); c.fill();
  }
  function burbuja(c, x, y, t, pix) { if (pix) pixel(c, x, y, t); else fina(c, x, y, t); }
  function dibuja(c, o, f) {
    const b = o.cura; if (!b) return; const pix = !!(f.st && f.st.pixel), t = f.t;
    if (b.st === 'viaja') { corazon(c, b.vx, b.vy, 3.8, '#ff5d73'); return; }
    const y = b.y + Math.sin(b.t * 2.2) * 2.4, fin = DURA - b.t;
    c.save(); if (fin < 2.5 && Math.sin(t * 22) > 0) c.globalAlpha = .45;
    burbuja(c, b.x, y, t, pix);
    for (let k = 0; k < 3; k++) { const u = (t * .5 + k / 3 + b.sale) % 1, px = b.x + Math.sin(u * 7 + k) * 4; c.globalAlpha = (1 - u) * .7; c.strokeStyle = '#ffffff'; c.lineWidth = .5; c.beginPath(); c.arc(px, y - 9 - u * 13, .9 + k * .3, 0, TAU); c.stroke(); }
    c.restore();
    if (b.t < 5 || !PROG.s.burbujas) {
      const tx = '¡Fresita, tócala!', yy = y - 25 + Math.sin(t * 5) * 1.2; c.save(); c.font = 'bold 5.4px Alegreya, Georgia, serif'; c.textAlign = 'center'; const an = c.measureText(tx).width + 7;
      c.fillStyle = 'rgba(60,14,50,.86)'; c.beginPath(); roundRect(c, b.x - an / 2, yy - 6, an, 8.4, 2); c.fill();
      c.beginPath(); c.moveTo(b.x - 2.4, yy + 2.4); c.lineTo(b.x + 2.4, yy + 2.4); c.lineTo(b.x, yy + 6); c.fill();
      c.fillStyle = '#ffe6f4'; c.fillText(tx, b.x, yy); c.restore();
    }
  }
  const hazStep = OBJ.jefe.step; OBJ.jefe.step = function (o, g, dt) { hazStep.call(this, o, g, dt); paso(o, g, dt); };
  const hazDraw = OBJ.jefe.draw; OBJ.jefe.draw = function (c, o, f) { hazDraw.call(this, c, o, f); if (!f.g.sinHudJefe) dibuja(c, o, f); };
  // la que sale en la enciclopedia
  OBJ.burbujaDemo = { front: true, draw(c, o, f) { burbuja(c, o.x, o.y + Math.sin(f.t * 2.2) * 2.4, f.t, !!(f.st && f.st.pixel)); } };
  if (typeof LOGROS !== 'undefined') LOGROS.push(
    { id: 'salvavidas', icon: 'bubble', nombre: 'Salvavidas', desc: 'Fresita cura a Itzel con 10 burbujas.', meta: 10, valor: s => s.burbujas || 0 },
    { id: 'pelito', icon: 'heart', nombre: 'Por un pelito', desc: 'Fresita toca una burbuja cuando a Itzel le queda un solo corazón.', meta: 1, valor: s => s.porUnPelito || 0 },
  );
  return { paso, dibuja };
})();
