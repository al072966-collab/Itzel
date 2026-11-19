'use strict';
// =====================================================================
//  ENEMIGOS DIBUJADOS CON CUIDADO
//  Los enemigos que salen en muchos mundos, vueltos a dibujar con volumen,
//  contorno, ojos que miran a Itzel, texturas propias (rosetas, escudos,
//  crines, pelusa…) y animación con intención: el pecarí agacha la cabeza
//  antes de embestir, la iguana cabecea, el cangrejo truena las pinzas
//  cuando Itzel se acerca, el armadillo se hace bolita al dormirse.
//  Los colores salen de la piel de cada mundo; la técnica del mundo la pone
//  enemigos-arte.js encima.
//  Todos miran a la derecha y tienen los pies en y = 0.
// =====================================================================
(function () {
  const { FD } = MEC, { FX, FXD, GEN } = FOE_ARTE;
  const { pal, tono, sombraDe, luzDe, vol, trazo, ojo, brillo, motas, mareo, globo, parpadea, dormido } = FOE_KIT;
  const NEGRO = '#16121a';
  const brilla = (c, x, y, r, col, a) => { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x, y, r, col, a); c.restore(); };
  const alas = (c, x, y, rx, ry, base, f, n, col = '#eef8ff', venas = 'rgba(70,80,100,.5)') => {
    for (let k = n; k >= 0; k--) {
      c.save(); c.translate(x, y); c.rotate(base + f * .45 - k * .3); c.globalAlpha *= k ? .16 : .55;
      c.fillStyle = col; c.beginPath(); c.ellipse(-rx * .8, 0, rx, ry, 0, 0, TAU); c.fill();
      if (!k) { c.strokeStyle = venas; c.lineWidth = .28; c.stroke(); c.beginPath(); c.moveTo(-.3, 0); c.lineTo(-rx * 1.6, -.2); c.moveTo(-rx * .5, .1); c.lineTo(-rx * 1.2, ry * .7); c.stroke(); }
      c.restore();
    }
  };

  const NUEVOS = {
    // ---------------- cangrejo: pinzas que truenan cuando Itzel se acerca ----------------
    cangrejo(c, e, t, s) {
      const P = pal(s), a = Math.sin(e.anim * 14), pin = Math.max(0, Math.sin(t * (e._cerca ? 16 : 4) + e.hx));
      for (let i = 0; i < 3; i++) for (const d of [-1, 1]) {
        const ph = a * (i % 2 ? 1 : -1) * d, x0 = d * (2.6 + i * 1.3);
        trazo(c, [[x0, -3.4], [d * (6.2 + i * 1.1), -5.4 + i * .6 - ph * .8], [d * (7.6 + i * 1.3) + ph * .5, 0]], .85, P.ms, { lw: .6 });
      }
      const cap = c => { c.moveTo(-6.9, -3.5); c.bezierCurveTo(-7.4, -8.8, 7.4, -8.8, 6.9, -3.5); c.quadraticCurveTo(0, -1.5, -6.9, -3.5); c.closePath(); };
      vol(c, cap, P.m, { hl: [-2.4, -7, 3.2], tex: c => { motas(c, [[-3.6, -6.2, .7], [-.2, -7.3, .8], [3.4, -6.4, .6], [-1.8, -5, .45], [2, -5.1, .45]], P.ml); c.fillStyle = P.ms; c.beginPath(); c.ellipse(0, -2.6, 5, 1, 0, 0, TAU); c.fill(); } });
      c.strokeStyle = P.ln; c.lineWidth = .4; c.lineCap = 'round'; c.beginPath(); c.arc(0, -4.6, 1.2, .25, Math.PI - .25); c.stroke();
      for (const d of [-1, 1]) { trazo(c, [[d * 1.5, -7.3], [d * 2.1, -9.5]], .55, P.ms, { lw: .5 }); ojo(c, e, t, d * 2.2, -10.3, 1.25, { piel: P.m }); }
      for (const d of [-1, 1]) {
        const bx = d * 8.7, by = -7.4 + Math.sin(t * 3 + d) * .4;
        trazo(c, [[d * 5.6, -4.6], [d * 7.3, -6.3]], 1.1, P.m, { lw: .6 });
        vol(c, c => c.ellipse(bx, by, 2.6, 2.05, d * .3, 0, TAU), P.m, { hl: [bx - .8, by - 1, 1.3] });
        c.save(); c.translate(bx + d * 1.3, by - 1); c.rotate(-d * pin * .55);
        vol(c, c => { c.moveTo(0, 0); c.quadraticCurveTo(d * 2.6, -1.7, d * 3.5, .5); c.quadraticCurveTo(d * 1.8, .2, 0, 1); c.closePath(); }, P.ml, { lw: .45 });
        c.restore();
        vol(c, c => { c.moveTo(bx + d * 1.3, by + .3); c.quadraticCurveTo(bx + d * 3.1, by + .4, bx + d * 3.7, by - .8); c.quadraticCurveTo(bx + d * 2.7, by + 1.7, bx + d * .6, by + 1.5); c.closePath(); }, P.m, { lw: .45 });
      }
    },
    // ---------------- murciélago: alas de membrana con dedos ----------------
    murcielago(c, e, t, s) {
      const P = pal(s), f = Math.sin(e.anim * 16);
      c.save(); c.translate(0, -f * .8);
      for (const d of [-1, 1]) {
        const ty = -8 - f * 4;
        const ala = c => { c.moveTo(d * 2, -5.6); c.quadraticCurveTo(d * 6, ty - 1, d * 11, ty); c.quadraticCurveTo(d * 10.2, -4.6 - f, d * 9, -3.2 - f * .6); c.quadraticCurveTo(d * 7.7, -4.6 - f * .6, d * 6.4, -3 - f * .3); c.quadraticCurveTo(d * 5, -4.2, d * 3.6, -2.4); c.quadraticCurveTo(d * 2.6, -3, d * 2, -3.4); c.closePath(); };
        vol(c, ala, P.d, { d: [0, 1], lw: .5, tex: c => { c.fillStyle = P.dl; c.globalAlpha *= .5; c.beginPath(); c.moveTo(d * 3, -5); c.quadraticCurveTo(d * 6, ty, d * 10, ty + .6); c.lineTo(d * 9, -3.6 - f * .6); c.fill(); } });
        c.strokeStyle = P.dh; c.lineWidth = .3; c.beginPath(); c.moveTo(d * 2.4, -5.4); c.lineTo(d * 11, ty); c.moveTo(d * 4.2, -5.6 - f * 1.5); c.lineTo(d * 9, -3.2 - f * .6); c.moveTo(d * 4.2, -5.6 - f * 1.5); c.lineTo(d * 6.4, -3 - f * .3); c.stroke();
      }
      for (const d of [-1, 1]) { vol(c, c => { c.moveTo(d * .7, -7); c.lineTo(d * 2.5, -11.2); c.lineTo(d * 3.1, -6.3); c.closePath(); }, P.d, { lw: .45 }); c.fillStyle = P.a; c.beginPath(); c.moveTo(d * 1.4, -7.4); c.lineTo(d * 2.4, -10); c.lineTo(d * 2.7, -7); c.fill(); }
      vol(c, c => c.ellipse(0, -4.6, 3.3, 3.9, 0, 0, TAU), P.d, { hl: [-1, -6.6, 1.9], tex: c => { c.fillStyle = P.dl; c.beginPath(); c.ellipse(0, -3.2, 2, 2.3, 0, 0, TAU); c.fill(); } });
      c.strokeStyle = P.dl; c.lineWidth = .28; c.beginPath(); for (let k = -2; k <= 2; k++) { c.moveTo(k * .9, -8.2); c.lineTo(k * 1.1, -8.9 + Math.abs(k) * .1); } c.stroke();
      for (const d of [-1, 1]) ojo(c, e, t, d * 1.3, -5.6, .95, { blanco: P.e, piel: P.d, enojo: .35 });
      c.fillStyle = '#fffaf0'; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * .25, -3.9); c.lineTo(d * .85, -3.9); c.lineTo(d * .55, -2.8); c.fill(); }
      trazo(c, [[-.9, -1], [-1.1, .2]], .3, P.d, { lw: .4 }); trazo(c, [[.9, -1], [1.1, .2]], .3, P.d, { lw: .4 });
      c.restore();
    },
    // ---------------- rana: saco vocal que se infla, salta estirada ----------------
    rana(c, e, t, s) {
      const P = pal(s), air = (e.vy || 0) !== 0, sube = air && e.vy < 0, sac = air ? 0 : Math.max(0, Math.sin(t * 2.2 + e.hx)) ** 8;
      c.save(); if (air) c.rotate(sube ? -.3 : .14);
      if (air) { trazo(c, [[-3, -3.6], [-7, -3], [-10.2, sube ? -.6 : -2]], 1.5, P.m); trazo(c, [[-10.2, sube ? -.6 : -2], [-12, sube ? .3 : -1.5]], .7, P.ms, { lw: .6 }); }
      else { vol(c, c => c.ellipse(-3.6, -2.6, 3.2, 2.3, -.25, 0, TAU), P.m, { hl: [-4.6, -3.8, 1.4] }); vol(c, c => c.ellipse(-1.4, -.5, 2.6, .75, 0, 0, TAU), P.ms, { lw: .45 }); }
      trazo(c, [[2.8, -2.6], [3.7, air ? -1.4 : -.3]], .9, P.m, { lw: .6 });
      const cu = c => { c.moveTo(-5.6, -2.4); c.bezierCurveTo(-6.2, -7.8, 1.6, -9.4, 5.4, -6.6); c.bezierCurveTo(7.4, -5, 6.4, -1.6, 3.6, -1.1); c.quadraticCurveTo(-1, -.6, -5.6, -2.4); c.closePath(); };
      vol(c, cu, P.m, { hl: [-.5, -7, 2.6], tex: c => { motas(c, [[-3, -5.4, 1.1, .8], [-.4, -6.8, .8, .6], [-4.4, -3.6, .6], [1.4, -5.6, .5]], P.ms); c.fillStyle = P.l; c.beginPath(); c.ellipse(2.4, -2, 3.4, 1.6, -.15, 0, TAU); c.fill(); } });
      if (sac > .05) vol(c, c => c.ellipse(4.3, -2.3, 1.5 + sac * 1.6, .9 + sac * 1.4, 0, 0, TAU), P.lh, { lw: .4, hl: [3.8, -3.2, 1] });
      c.strokeStyle = P.ln; c.lineWidth = .45; c.lineCap = 'round'; c.beginPath(); c.moveTo(6.2, -4.2); c.quadraticCurveTo(4.4, -3, 1.8, -3.9); c.stroke();
      vol(c, c => c.arc(.6, -7.6, 1.9, 0, TAU), P.ms, { lw: .5 }); ojo(c, e, t, .8, -7.9, 1.2, { piel: P.ms, iris: P.a });
      vol(c, c => c.arc(3.6, -7.4, 2.1, 0, TAU), P.m, { lw: .5 }); ojo(c, e, t, 3.8, -7.7, 1.45, { piel: P.m, iris: P.a });
      c.fillStyle = 'rgba(255,120,140,.35)'; c.beginPath(); c.ellipse(4.9, -4.7, 1, .6, 0, 0, TAU); c.fill();
      c.restore();
    },
    // ---------------- avispa: abdomen rayado con aguijón, ojo compuesto ----------------
    avispa(c, e, t, s) {
      const P = pal(s), dive = e.st === 'dive', f = Math.sin(e.anim * 42);
      c.save(); c.rotate(dive ? .45 : Math.sin(t * 3 + e.hx) * .07);
      alas(c, -.4, -8, 3.6, 1.5, -.55, f, 2);
      for (const [x, ph] of [[-1.6, 0], [0, 1], [1.4, 2]]) trazo(c, [[x, -4], [x - .6, -2.4 + Math.sin(t * 6 + ph) * .3], [x - .2, -1.2]], .4, P.d, { lw: .4 });
      const ab = c => { c.moveTo(-1.6, -6.4); c.bezierCurveTo(-4.6, -7.6, -8.4, -6.4, -9, -4.6); c.lineTo(-11.2, -3.6); c.lineTo(-8.6, -3.4); c.bezierCurveTo(-7, -2.2, -3.4, -2.4, -1.6, -3.6); c.closePath(); };
      vol(c, ab, P.m, { hl: [-5, -6.2, 2], tex: c => { c.fillStyle = P.d; for (const x of [-3.4, -5.6, -7.8]) { c.beginPath(); c.ellipse(x, -4.8, .75, 3, .25, 0, TAU); c.fill(); } } });
      vol(c, c => c.ellipse(.2, -5.2, 2.4, 2.1, 0, 0, TAU), P.d, { hl: [-.4, -6.2, 1.2] });
      vol(c, c => c.ellipse(3.4, -5.6, 2.2, 2.4, .2, 0, TAU), P.m, { hl: [2.8, -6.8, 1.2] });
      ojo(c, e, t, 4.1, -6.1, 1.3, { ax: .8, blanco: P.d, pupila: '#000', piel: P.m, enojo: .6 });
      c.strokeStyle = P.ln; c.lineWidth = .4; c.lineCap = 'round'; c.beginPath(); c.moveTo(3.6, -7.8); c.quadraticCurveTo(4.6, -10.4, 6.6, -10 + Math.sin(t * 7) * .4); c.moveTo(3, -7.8); c.quadraticCurveTo(3.4, -10.8, 5, -11.2 + Math.sin(t * 7 + 1) * .4); c.stroke();
      c.fillStyle = P.d; c.beginPath(); c.moveTo(5.2, -4.6); c.lineTo(6.5, -3.5); c.lineTo(5, -3.7); c.fill();
      c.restore();
    },
    // ---------------- cocuyo: las dos luces del pronoto, como los de Campeche ----------------
    cocuyo(c, e, t, s) {
      const P = pal(s), pul = .6 + Math.sin(t * 5 + e.hx) * .25, f = Math.sin(e.anim * 36), luz = '#c8ff5a';
      brilla(c, 2, -5, 7, luz, .28 * pul);
      alas(c, -1, -6.6, 3.4, 1.3, -.7, f, 1, '#e8fff4');
      const el = c => { c.moveTo(-.2, -6.4); c.bezierCurveTo(-3, -7.6, -7, -6.4, -7.4, -4.2); c.quadraticCurveTo(-6.6, -2.4, -3, -2.6); c.lineTo(0, -3.4); c.closePath(); };
      vol(c, el, P.d, { hl: [-3.6, -6.2, 2], tex: c => { c.strokeStyle = P.dl; c.lineWidth = .3; for (const y of [-5.6, -4.6, -3.6]) { c.beginPath(); c.moveTo(-.6, y); c.quadraticCurveTo(-4, y - .6, -6.8, y + .8); c.stroke(); } } });
      for (const [x, ph] of [[-2.2, 0], [-.4, 1], [1.4, 2]]) trazo(c, [[x, -3], [x - .4, -1.4 + Math.sin(t * 5 + ph) * .3]], .4, P.d, { lw: .4 });
      vol(c, c => c.ellipse(1.8, -5, 2.3, 2, 0, 0, TAU), P.d, { hl: [1.2, -6.2, 1.2] });
      for (const [x, y] of [[1.1, -5.6], [2.8, -5.4]]) { brilla(c, x, y, 2.6, luz, .7 * pul); c.fillStyle = luz; c.beginPath(); c.ellipse(x, y, .7, .58, 0, 0, TAU); c.fill(); c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x - .15, y - .15, .25, 0, TAU); c.fill(); }
      vol(c, c => c.ellipse(4.3, -4.6, 1.35, 1.2, 0, 0, TAU), P.d, { lw: .45 });
      ojo(c, e, t, 4.7, -4.9, .6, { piel: P.d });
      c.strokeStyle = P.ln; c.lineWidth = .35; c.beginPath(); c.moveTo(4.8, -5.6); c.quadraticCurveTo(6.4, -7.6, 7.8, -7 + Math.sin(t * 6) * .4); c.stroke();
    },
    // ---------------- zopilote: plumas abiertas en la punta, cabeza pelona ----------------
    zopilote(c, e, t, s) {
      const P = pal(s), dive = e.st === 'dive', f = dive ? 0 : Math.sin(e.anim * 3.4) * .7;
      c.save(); if (dive) c.rotate(.35);
      for (const d of [-1, 1]) {
        const ty = -6 - f * 4, b = dive ? -5 * d : 0;
        const ala = c => { c.moveTo(d * 2, -6.4); c.quadraticCurveTo(d * 6 + b, ty - 1.6, d * 9.6 + b, ty - .8); for (let k = 0; k < 4; k++) { const fx = d * (10.4 + k * .8) + b, fy = ty + k * 1.15; c.lineTo(fx + d * 1.7, fy - .2); c.lineTo(fx, fy + .7); } c.quadraticCurveTo(d * 7 + b, -2.8 - f, d * 2.2, -2.8); c.closePath(); };
        vol(c, ala, P.d, { d: [0, 1.2], lw: .5, tex: c => { c.fillStyle = P.dl; c.beginPath(); c.moveTo(d * 3, -3.4); c.quadraticCurveTo(d * 7 + b, -3.6 - f * 2, d * 11.4 + b, ty + 2.6); c.lineTo(d * 12 + b, ty + 4.4); c.quadraticCurveTo(d * 7 + b, -2 - f, d * 3, -2.4); c.fill(); } });
      }
      vol(c, c => c.ellipse(0, -4.4, 3.8, 3, 0, 0, TAU), P.d, { hl: [-1, -5.6, 1.8] });
      for (let k = 0; k < 4; k++) vol(c, c => c.arc(2.4 + k * .35, -7 + k * .9, 1.05, 0, TAU), P.dh, { lw: .3 });
      const cab = '#c45a4a'; vol(c, c => c.ellipse(5, -6.6, 1.9, 1.7, -.2, 0, TAU), cab, { hl: [4.4, -7.4, 1], tex: c => { c.strokeStyle = '#8a3a30'; c.lineWidth = .25; c.beginPath(); c.arc(4.3, -6, 1, -1, .4); c.stroke(); } });
      ojo(c, e, t, 5.5, -7.2, .62, { piel: cab, iris: '#6a2a1a', enojo: .45 });
      vol(c, c => { c.moveTo(6.4, -7.2); c.quadraticCurveTo(8.6, -7.4, 8.8, -5.6); c.quadraticCurveTo(8, -6.2, 6.6, -5.9); c.closePath(); }, '#efe2c8', { lw: .4 });
      c.restore();
    },
    // ---------------- coralillo: anillos rojo, negro y amarillo; saca la lengua ----------------
    culebra(c, e, t, s) {
      const P = pal(s), L2 = e.st === 'lunge', n = 16, pts = [];
      for (let i = 0; i < n; i++) { const u = i / (n - 1); pts.push([-10 + u * (L2 ? 19 : 15), -1.8 - Math.sin(e.anim * 7 - i * .55) * (1.2 + u * .3) - (L2 ? u * u * 3 : 0), .9 + Math.min(1, u * 3) * 1.1]); }
      c.fillStyle = P.ln; for (const [x, y, r] of pts) { c.beginPath(); c.arc(x, y, r + .45, 0, TAU); c.fill(); }
      const bandas = [P.m, P.m, NEGRO, P.a, NEGRO];
      for (let i = 0; i < n; i++) { const [x, y, r] = pts[i], col = bandas[i % bandas.length]; c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.fillStyle = sombraDe(col); c.beginPath(); c.arc(x, y + r * .3, r * .85, .1, Math.PI - .1); c.fill(); }
      c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = .4; c.beginPath(); pts.forEach(([x, y, r], i) => i ? c.lineTo(x, y - r * .55) : c.moveTo(x, y - r * .55)); c.stroke();
      const [hx, hy0] = pts[n - 1], hy = hy0 - (L2 ? 1.2 : 0);
      vol(c, c => { c.moveTo(hx - 1.4, hy - 1.8); c.quadraticCurveTo(hx + 2.6, hy - 2.6, hx + 3.8, hy - .4); c.quadraticCurveTo(hx + 3.2, hy + 1.6, hx - 1, hy + 1.6); c.closePath(); }, NEGRO, { hl: [hx + .6, hy - 1.6, 1.2] });
      c.fillStyle = P.a; c.beginPath(); c.ellipse(hx - .7, hy, .7, 1.6, 0, 0, TAU); c.fill();
      ojo(c, e, t, hx + 1.6, hy - .8, .7, { piel: NEGRO, iris: P.a });
      if (L2) { c.fillStyle = '#5a1020'; c.beginPath(); c.moveTo(hx + 1.6, hy + .4); c.lineTo(hx + 4.4, hy - .2); c.lineTo(hx + 4.2, hy + 2); c.closePath(); c.fill(); c.fillStyle = '#fffaf0'; c.beginPath(); c.moveTo(hx + 3.2, hy); c.lineTo(hx + 3.5, hy + 1); c.lineTo(hx + 3.8, hy - .1); c.fill(); }
      if (L2 || (t + e.hx) % 1.6 < .3) { const l = L2 ? 3.4 : 2.4; c.strokeStyle = '#e0304a'; c.lineWidth = .35; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx + 3.6, hy + .2); c.lineTo(hx + 3.6 + l, hy + .3); c.lineTo(hx + 4.4 + l, hy - .4); c.moveTo(hx + 3.6 + l, hy + .3); c.lineTo(hx + 4.4 + l, hy + .9); c.stroke(); }
    },
    // ---------------- iguana: cresta, papada y cabeceo ----------------
    iguana(c, e, t, s) {
      const P = pal(s), run = e.t % 2 < 1, a = run ? Math.sin(e.anim * 20) : 0, bob = run ? 0 : Math.max(0, Math.sin(t * 5 + e.hx)) ** 3 * 1.2;
      const cola = [[-5, -3], [-9, -2.8 + a * .4, -12, -2], [-16, -1.3 + Math.sin(t * 3 + 1) * .7, -16.6, -.8]];
      trazo(c, cola, 1.7, P.m);
      c.save(); c.setLineDash([.8, 1.2]); trazo(c, cola, 1.7, P.ms, { lw: 0, cap: 'butt' }); c.restore();
      const pata = (lx, ph, col) => { const sw = (ph ? -a : a); trazo(c, [[lx, -2.6], [lx + sw * 1.6 - .8, -1.3], [lx + sw * 2 + .4, 0]], .8, col); c.strokeStyle = P.ln; c.lineWidth = .25; c.beginPath(); for (const dx of [-.5, 0, .5]) { c.moveTo(lx + sw * 2 + .4, 0); c.lineTo(lx + sw * 2 + .4 + dx + .5, .2); } c.stroke(); };
      pata(-3.2, 1, P.ms); pata(4, 0, P.ms);
      const cu = c => { c.moveTo(-6, -2.4); c.bezierCurveTo(-5, -5.6, 2, -6, 4.6, -4.8); c.lineTo(5, -2.4); c.bezierCurveTo(2, -1.4, -3, -1.2, -6, -2.4); c.closePath(); };
      vol(c, cu, P.m, { hl: [-1, -5, 2], tex: c => { motas(c, [[-3, -4, .5], [-1, -4.6, .45], [1, -4.4, .5], [2.6, -3.8, .4], [-2, -3, .4], [.4, -3.2, .35]], P.ms); c.fillStyle = P.l; c.beginPath(); c.ellipse(0, -1.7, 5, .9, 0, 0, TAU); c.fill(); } });
      c.fillStyle = P.a; c.strokeStyle = P.ln; c.lineWidth = .3; c.beginPath(); c.moveTo(-5.6, -3.3);
      for (let i = 0; i < 9; i++) { const x = -5.2 + i * 1.15, y = -3.4 - Math.sin((i + 1.5) / 10.5 * Math.PI) * 2.3; c.lineTo(x + .35, y - 1.1 - (i % 2) * .5); c.lineTo(x + .9, y); }
      c.lineTo(4.4, -4.7); c.closePath(); c.fill(); c.stroke();
      pata(-4.8, 0, P.m); pata(2.6, 1, P.m);
      c.save(); c.translate(4.6, -4.2 - bob);
      vol(c, c => { c.moveTo(-.6, -1.6); c.quadraticCurveTo(2.6, -2.6, 4.6, -.6); c.quadraticCurveTo(4.4, .8, 2, 1); c.lineTo(-.4, 1.4); c.closePath(); }, P.m, { hl: [1.2, -1.4, 1.2] });
      vol(c, c => { c.moveTo(.4, .9); c.quadraticCurveTo(1.4, 3.6 + bob * .6, 3, 1); c.closePath(); }, P.a, { lw: .4 });
      ojo(c, e, t, 2, -.6, .65, { piel: P.m, iris: P.e });
      c.fillStyle = P.ln; c.beginPath(); c.arc(4, -.7, .2, 0, TAU); c.fill();
      c.strokeStyle = P.ln; c.lineWidth = .3; c.beginPath(); c.moveTo(4.4, .2); c.lineTo(2, .5); c.stroke();
      c.restore();
    },
    // ---------------- alux: duendecito maya de sombrero de palma y ojos que brillan ----------------
    alux(c, e, t, s) {
      const P = pal(s), sil = '#17120f', rim = P.e, b = Math.sin(t * 4 + e.hx) * .3;
      c.globalAlpha *= e.fade ?? 1;
      for (const d of [-1, 1]) trazo(c, [[d * 1.3, -2], [d * 1.8, 0]], .9, sil, { lw: .4, ln: '#000' });
      vol(c, c => { c.moveTo(-3.6, -1.4); c.lineTo(-2.6, -7.4); c.quadraticCurveTo(0, -8.6, 2.6, -7.4); c.lineTo(3.6, -1.4); c.quadraticCurveTo(0, -.6, -3.6, -1.4); c.closePath(); }, sil, { s: false, l: rgba(rim, .4), d: [1, 1.4], lw: .4, ln: '#000', tex: c => { c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = .3; for (let x = -2; x <= 2; x += 1) { c.beginPath(); c.moveTo(x, -7); c.lineTo(x * 1.3, -1.4); c.stroke(); } } });
      c.fillStyle = sil; c.beginPath(); c.arc(-3.4, -3 + b, .8, 0, TAU); c.arc(3.4, -3 - b, .8, 0, TAU); c.fill();
      vol(c, c => c.arc(0, -9.4, 3, 0, TAU), sil, { s: false, l: rgba(rim, .4), lw: .4, ln: '#000' });
      const paja = '#5a3e22';
      vol(c, c => c.ellipse(0, -11.6, 6.4, 1.5, 0, 0, TAU), paja, { hl: [-2, -12, 2], lw: .4, ln: '#120c08', tex: c => { c.strokeStyle = 'rgba(255,220,150,.3)'; c.lineWidth = .25; for (let k = -5.4; k <= 5.4; k += 1.2) { c.beginPath(); c.moveTo(k, -12.9); c.lineTo(k * 1.12, -10.3); c.stroke(); } } });
      vol(c, c => { c.moveTo(-2.6, -11.8); c.quadraticCurveTo(-2.2, -16.2, 0, -16.4); c.quadraticCurveTo(2.2, -16.2, 2.6, -11.8); c.closePath(); }, paja, { hl: [-.8, -14.6, 1.4], lw: .4, ln: '#120c08', tex: c => { c.strokeStyle = 'rgba(255,220,150,.25)'; c.lineWidth = .25; for (let y = -15.6; y < -12; y += 1) { c.beginPath(); c.moveTo(-2.6, y); c.lineTo(2.6, y + .3); c.stroke(); } } });
      c.fillStyle = '#b8342a'; c.fillRect(-2.6, -12.9, 5.2, .75);
      brilla(c, 0, -9.2, 5, rim, .5);
      const cierra = parpadea(e, t);
      for (const x of [-1.2, 1.3]) { c.fillStyle = rim; c.beginPath(); c.ellipse(x + (e._mx || 0) * .4, -9.3 + (e._my || 0) * .3, .6, cierra ? .1 : .78, 0, 0, TAU); c.fill(); }
      c.strokeStyle = rgba(rim, .8); c.lineWidth = .3; c.beginPath(); c.arc(.3, -8.3, 1.1, .3, Math.PI - .5); c.stroke();
    },
    // ---------------- pecarí de collar: agacha la cabeza y embiste ----------------
    jabali(c, e, t, s) {
      const P = pal(s), run = e.st === 'run', a = Math.sin(e.anim * (run ? 26 : 10)), baja = run ? 1.2 : 0;
      const pata = (lx, ph, col) => { const sw = (ph ? a : -a) * (run ? 1.6 : 1); trazo(c, [[lx, -3.8], [lx + sw, -.8]], 1.3, col); c.fillStyle = P.ln; c.beginPath(); c.ellipse(lx + sw, -.4, .9, .5, 0, 0, TAU); c.fill(); };
      pata(-5, 0, P.ds); pata(3.4, 1, P.ds);
      trazo(c, [[-7.6, -6.4], [-8.8, -5.6 + a * .3]], .6, P.d);
      const cu = c => { c.moveTo(-8, -5.4); c.bezierCurveTo(-8.4, -10.4, 4, -11.6, 6.6, -7.6 + baja); c.lineTo(6.4, -4); c.bezierCurveTo(2, -2.6, -5, -2.6, -8, -5.4); c.closePath(); };
      vol(c, cu, P.m, { hl: [-2, -9, 3], tex: c => { c.strokeStyle = P.ms; c.lineWidth = .3; for (let k = -7; k < 6; k += 1.1) { c.beginPath(); c.moveTo(k, -9.6 + Math.abs(k) * .12); c.lineTo(k + .9, -7.4); c.stroke(); } c.fillStyle = P.l; c.beginPath(); c.moveTo(2.2, -10); c.quadraticCurveTo(3.6, -7, 3, -3.4); c.lineTo(4.2, -3.6); c.quadraticCurveTo(4.8, -7.4, 3.4, -10.4); c.fill(); } });
      c.fillStyle = P.d; c.beginPath(); c.moveTo(-6.6, -8.6);
      for (let i = 0; i < 9; i++) { const x = -6.2 + i * 1.3, y = -9.6 - Math.sin(i / 8 * Math.PI) * 1.2; c.lineTo(x + .4, y - 1.4 - (run ? .8 : 0) - (i % 2) * .5); c.lineTo(x + 1, y + .2); }
      c.lineTo(5, -8.4); c.closePath(); c.fill(); c.strokeStyle = P.ln; c.lineWidth = .35; c.stroke();
      pata(-3.4, 1, P.d); pata(5, 0, P.d);
      c.save(); c.translate(5.6, -6.6 + baja); c.rotate(run ? .25 : 0);
      vol(c, c => { c.moveTo(-1.6, -3); c.quadraticCurveTo(2.4, -3.4, 5.4, -.4); c.lineTo(5.4, 1.4); c.quadraticCurveTo(1.6, 2.6, -1.6, 2); c.closePath(); }, P.m, { hl: [1, -2, 1.4] });
      vol(c, c => { c.moveTo(-.4, -2.6); c.lineTo(-.9, -4.8); c.lineTo(1, -3); c.closePath(); }, P.ms, { lw: .4 });
      vol(c, c => c.ellipse(5.5, .5, .8, 1.2, 0, 0, TAU), P.l, { lw: .4 }); c.fillStyle = P.ln; c.beginPath(); c.arc(5.6, .1, .22, 0, TAU); c.arc(5.6, .9, .22, 0, TAU); c.fill();
      c.fillStyle = '#fffaf0'; c.strokeStyle = P.ln; c.lineWidth = .25; c.beginPath(); c.moveTo(3.6, 1.6); c.quadraticCurveTo(4.6, .6, 4.4, -.2); c.lineTo(4, 1.6); c.closePath(); c.fill(); c.stroke();
      ojo(c, e, t, 1.8, -1, .7, { piel: P.m, iris: '#3a1a10', enojo: run ? .9 : .3 });
      c.restore();
    },
    // ---------------- jaguar: rosetas, cola con anillos, salta con las garras ----------------
    jaguar(c, e, t, s) {
      const P = pal(s), air = (e.vy || 0) !== 0, a = Math.sin(e.anim * 9);
      c.save(); if (air) c.rotate(e.vy < 0 ? -.18 : .12);
      const cola = [[-7.4, -7], [-11.6, -8 + a, -12.6, -12 + Math.sin(t * 2.4) * .8]];
      trazo(c, cola, 1.4, P.m);
      const qx = u => (1 - u) * (1 - u) * -7.4 + 2 * (1 - u) * u * -11.6 + u * u * -12.6, qy = u => (1 - u) * (1 - u) * -7 + 2 * (1 - u) * u * (-8 + a) + u * u * (-12 + Math.sin(t * 2.4) * .8);
      c.fillStyle = P.d; for (const u of [.4, .62, .8]) { c.beginPath(); c.arc(qx(u), qy(u), .55, 0, TAU); c.fill(); } c.beginPath(); c.arc(qx(1), qy(1), .8, 0, TAU); c.fill();
      const leg = (lx, ph, col) => { const sw = air ? (ph ? 3.6 : -3.6) : (ph ? a : -a) * 1.6; trazo(c, [[lx, -5], [lx + sw * .5, -2.4], [lx + sw, 0]], 1.6, col); c.fillStyle = P.l; c.beginPath(); c.ellipse(lx + sw + .4, -.3, 1.1, .55, 0, 0, TAU); c.fill(); if (air && ph) { c.strokeStyle = '#fffaf0'; c.lineWidth = .25; c.beginPath(); for (const dy of [-.5, 0, .5]) { c.moveTo(lx + sw + 1.2, -.3 + dy); c.lineTo(lx + sw + 2, -.1 + dy * 1.4); } c.stroke(); } };
      leg(-5, 1, P.ms); leg(4.6, 0, P.ms);
      const cu = c => { c.moveTo(-8, -6.4); c.bezierCurveTo(-7.6, -10.4, 3, -11, 6.4, -8.6); c.lineTo(6.6, -4.6); c.bezierCurveTo(2, -2.8, -5, -2.8, -8, -6.4); c.closePath(); };
      vol(c, cu, P.m, { hl: [-1, -9.4, 3], tex: c => { c.fillStyle = P.l; c.beginPath(); c.ellipse(0, -3.6, 6.4, 1.6, 0, 0, TAU); c.fill(); for (const [x, y] of [[-5.4, -7.6], [-2.6, -9], [.4, -8.2], [3.2, -8.8], [-3.6, -5.8], [-.6, -6.2], [2.2, -6.2], [4.6, -6.6], [-6.6, -5.6]]) { c.fillStyle = P.ms; c.beginPath(); c.arc(x, y, .55, 0, TAU); c.fill(); c.strokeStyle = P.d; c.lineWidth = .45; c.beginPath(); c.arc(x, y, .95, .4, TAU - .5); c.stroke(); } } });
      leg(-3, 0, P.m); leg(6.2, 1, P.m);
      c.save(); c.translate(7.6, -8.6);
      for (const [ox, oy] of [[-1.8, -2.8], [.8, -3.2]]) vol(c, c => { c.moveTo(ox - 1, oy + .9); c.quadraticCurveTo(ox, oy - 1.6, ox + 1.2, oy + .7); c.closePath(); }, P.m, { lw: .4, tex: c => { c.fillStyle = P.d; c.beginPath(); c.arc(ox + .1, oy - .1, .5, 0, TAU); c.fill(); } });
      vol(c, c => c.arc(0, 0, 3.4, 0, TAU), P.m, { hl: [-.8, -1.4, 1.6], tex: c => motas(c, [[-1.8, -1.8, .4], [-.5, -2.6, .35], [.9, -2.2, .35], [-2.4, .2, .3]], P.d) });
      vol(c, c => c.ellipse(2.3, 1.1, 1.8, 1.35, 0, 0, TAU), P.l, { lw: .4 });
      c.fillStyle = P.ln; c.beginPath(); c.moveTo(3.1, .1); c.lineTo(4.2, .2); c.lineTo(3.6, .9); c.closePath(); c.fill();
      if (air) { c.fillStyle = '#5a1020'; c.beginPath(); c.ellipse(2.8, 2.3, 1.3, .8, 0, 0, TAU); c.fill(); c.fillStyle = '#fffaf0'; c.beginPath(); c.moveTo(2, 1.8); c.lineTo(2.3, 2.8); c.lineTo(2.6, 1.8); c.moveTo(3.4, 1.8); c.lineTo(3.6, 2.6); c.lineTo(3.9, 1.8); c.fill(); }
      ojo(c, e, t, 1.1, -.8, .9, { piel: P.m, iris: P.a, enojo: .5 });
      c.strokeStyle = 'rgba(255,255,255,.65)'; c.lineWidth = .2; c.beginPath(); for (const dy of [-.3, .3]) { c.moveTo(3, 1.2 + dy); c.lineTo(5.6, .8 + dy * 2.4); } c.stroke();
      c.restore(); c.restore();
    },
    // ---------------- búho: disco facial, penachos y plumas de pecho ----------------
    buho(c, e, t, s) {
      const P = pal(s), dive = e.st === 'dive', f = dive ? .9 : Math.sin(e.anim * 6) * .5, up = dive ? -3 : 0;
      for (const d of [-1, 1]) {
        const ala = c => { c.moveTo(d * 3, -9); c.quadraticCurveTo(d * 10, -11 - f * 4, d * 11.4, -4.6 + up); for (let k = 0; k < 3; k++) { c.lineTo(d * (10 - k * 1.8), -3.6 + up * (1 - k / 3)); c.lineTo(d * (9.4 - k * 1.8), -4.6 + up * (1 - k / 3)); } c.quadraticCurveTo(d * 6, -4, d * 3, -3); c.closePath(); };
        vol(c, ala, P.d, { lw: .5, tex: c => { c.strokeStyle = P.dl; c.lineWidth = .3; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(d * (4 + k * 2), -7.6 - f * (k + 1)); c.lineTo(d * (5 + k * 2), -4.4); c.stroke(); } } });
      }
      for (const x of [-1.4, 1.4]) trazo(c, [[x, -1.6], [x + (dive ? 1.4 : 0), dive ? 1 : 0]], .5, P.a, { lw: .5 });
      vol(c, c => c.ellipse(0, -6.4, 4.8, 5.8, 0, 0, TAU), P.m, { hl: [-1.6, -9, 2.2], tex: c => { c.fillStyle = P.l; c.beginPath(); c.ellipse(0, -4.4, 3, 3.4, 0, 0, TAU); c.fill(); c.strokeStyle = P.ms; c.lineWidth = .3; for (let j = 0; j < 3; j++) for (let k = -1; k <= 1; k++) { c.beginPath(); c.arc(k * 1.4 + (j % 2) * .7, -5.4 + j * 1.3, .55, .2, Math.PI - .2); c.stroke(); } } });
      for (const d of [-1, 1]) vol(c, c => { c.moveTo(d * 2, -10.6); c.quadraticCurveTo(d * 4.2, -13, d * 4.6, -14); c.quadraticCurveTo(d * 3.2, -12.8, d * 1, -11.6); c.closePath(); }, P.m, { lw: .4 });
      for (const d of [-1, 1]) vol(c, c => c.arc(d * 1.9, -8.6, 2.2, 0, TAU), P.l, { lw: .35, s: false });
      for (const d of [-1, 1]) ojo(c, e, t, d * 1.9, -8.6, 1.5, { iris: P.e, piel: P.l, enojo: dive ? .7 : .25 });
      vol(c, c => { c.moveTo(-.6, -7.6); c.lineTo(.6, -7.6); c.lineTo(0, -5.8); c.closePath(); }, P.a, { lw: .3 });
    },
    // ---------------- escarabajo: una bola de armadura que rueda (con todo y cara) ----------------
    escarabajo(c, e, t, s) {
      const P = pal(s), r = 5, ang = e.x * .25 * (e.dir || 1);
      c.save(); c.translate(0, -r);
      c.save(); c.rotate(ang); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + .3; trazo(c, [[Math.cos(a) * r * .9, Math.sin(a) * r * .9], [Math.cos(a + .2) * (r + 1.2), Math.sin(a + .2) * (r + 1.2)]], .45, P.d, { lw: .4 }); } c.restore();
      vol(c, c => c.arc(0, 0, r, 0, TAU), P.m, { hl: [-1.8, -2, 3], tex: c => {
        const g = c.createLinearGradient(-r, -r, r, r); g.addColorStop(0, rgba(P.a, .45)); g.addColorStop(.5, 'rgba(0,0,0,0)'); g.addColorStop(1, rgba(P.d, .5)); c.fillStyle = g; c.fillRect(-r, -r, 2 * r, 2 * r);
        c.save(); c.rotate(ang);
        c.fillStyle = P.ms; c.beginPath(); c.arc(0, 0, r, -Math.PI * .32, Math.PI * .32); c.closePath(); c.fill();
        c.strokeStyle = P.ln; c.lineWidth = .45; c.beginPath(); c.moveTo(-r, 0); c.lineTo(r * .85 * Math.cos(Math.PI * .32) - .4, 0); c.stroke();
        c.strokeStyle = P.ml; c.lineWidth = .3; for (const y of [-2.4, 2.4]) { c.beginPath(); c.moveTo(-r * .85, y * .9); c.quadraticCurveTo(0, y * 1.2, 2, y); c.stroke(); }
        c.restore();
      } });
      c.save(); c.rotate(ang);
      vol(c, c => c.ellipse(r - .2, 0, 1.5, 1.9, 0, 0, TAU), P.d, { lw: .4 });
      for (const y of [-.8, .8]) { c.fillStyle = '#fffaf0'; c.beginPath(); c.arc(r + .3, y, .5, 0, TAU); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(r + .45, y, .25, 0, TAU); c.fill(); }
      c.restore(); c.restore();
    },
    // ---------------- garabato: un monstruito de lápiz que no se está quieto ----------------
    garabato(c, e, t, s) {
      const P = pal(s), sd = Math.floor(t * 8), ink = P.d, air = (e.vy || 0) !== 0;
      for (const [x, d] of [[-2, -1], [2, 1]]) { c.strokeStyle = ink; c.lineWidth = .5; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, -1.6); c.lineTo(x + d * (air ? 1.6 : .4) + (hash1(x + 9, sd) - .5) * .6, 0); c.lineTo(x + d * 1.4, .1); c.stroke(); }
      c.fillStyle = rgba(P.m, .55); c.beginPath(); for (let i = 0; i <= 16; i++) { const a = i / 16 * TAU, r = 5 + hash1(i, sd) * .8; c.lineTo(Math.cos(a) * r, -6 + Math.sin(a) * r * .95); } c.fill();
      c.save(); c.clip(); c.strokeStyle = rgba(P.ms, .55); c.lineWidth = .35; for (let k = -12; k < 12; k += 1.3) { c.beginPath(); c.moveTo(k + (hash1(k * 3, sd) - .5), -12); c.lineTo(k + 6, 0); c.stroke(); } c.restore();
      c.strokeStyle = ink; c.lineWidth = .55; c.lineCap = 'round'; for (let p = 0; p < 2; p++) { c.beginPath(); for (let i = 0; i <= 26; i++) { const a = i / 24 * TAU + p * .4, r = 5.2 + (hash1(i + p * 40, sd) - .5) * 1.4; c.lineTo(Math.cos(a) * r, -6 + Math.sin(a) * r); } c.stroke(); }
      ojo(c, e, t, -1.3, -7.3, 1.5, { ln: ink, piel: P.m }); ojo(c, e, t, 2, -7.5, 1.65, { ln: ink, piel: P.m });
      c.strokeStyle = ink; c.lineWidth = .45; c.beginPath(); c.moveTo(-1, -4.2); for (let k = 1; k <= 4; k++) c.lineTo(-1 + k * .7, k % 2 ? -3.6 : -4.2); c.stroke();
    },
    // ---------------- calaverita de azúcar: flores, espirales y risa ----------------
    calavera(c, e, t, s) {
      const P = pal(s), air = (e.vy || 0) !== 0, bo = air ? 1.2 : .25 + Math.max(0, Math.sin(t * 6 + e.hx)) * .2, hueso = tono(P.l, .6);
      vol(c, c => { c.moveTo(-3.2, -3.4 + bo); c.lineTo(3.2, -3.4 + bo); c.quadraticCurveTo(3, -.6 + bo, 0, -.4 + bo); c.quadraticCurveTo(-3, -.6 + bo, -3.2, -3.4 + bo); c.closePath(); }, hueso, { lw: .5 });
      c.fillStyle = '#fffaf0'; c.strokeStyle = P.ln; c.lineWidth = .22; for (let k = -2; k <= 2; k++) { c.beginPath(); c.rect(k * .9 - .38, -3.3 + bo, .76, .8); c.fill(); c.stroke(); }
      c.fillStyle = '#1a1220'; c.fillRect(-2.6, -3.5, 5.2, bo + .1);
      const cr = c => { c.moveTo(-3.6, -3.2); c.bezierCurveTo(-6.6, -5, -6, -11.8, 0, -11.8); c.bezierCurveTo(6, -11.8, 6.6, -5, 3.6, -3.2); c.closePath(); };
      vol(c, cr, hueso, { hl: [-2, -9.6, 2.6], tex: c => {
        for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; c.fillStyle = k % 2 ? P.m : P.ml; c.beginPath(); c.ellipse(Math.cos(a) * 1.15, -10.1 + Math.sin(a) * 1.15, .85, .5, a, 0, TAU); c.fill(); }
        c.fillStyle = P.a; c.beginPath(); c.arc(0, -10.1, .6, 0, TAU); c.fill();
        c.strokeStyle = P.a; c.lineWidth = .35; for (const d of [-1, 1]) { c.beginPath(); for (let k = 0; k < 14; k++) { const a = k * .55, rr = .2 + k * .07; c.lineTo(d * 3.6 + Math.cos(a) * rr * d, -4.6 + Math.sin(a) * rr); } c.stroke(); }
        motas(c, [[-4.2, -8, .32], [-4.6, -6.6, .3], [4.2, -8, .32], [4.6, -6.6, .3], [-2.6, -11, .3], [2.6, -11, .3]], P.a);
      } });
      for (const d of [-1, 1]) {
        const x = d * 2, y = -6.8;
        c.fillStyle = P.m; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; c.beginPath(); c.ellipse(x + Math.cos(a) * 1.95, y + Math.sin(a) * 1.95, .55, .33, a, 0, TAU); c.fill(); }
        vol(c, c => c.ellipse(x, y, 1.5, 1.7, 0, 0, TAU), '#1a1220', { s: false, l: false, lw: .3 });
        if (dormido(e)) { c.strokeStyle = P.e; c.lineWidth = .3; c.beginPath(); c.arc(x, y - .3, .7, .3, Math.PI - .3); c.stroke(); }
        else { brilla(c, x + (e._mx || 0) * .5, y + (e._my || 0) * .4, 1.8, P.e, .6); c.fillStyle = P.e; c.beginPath(); c.arc(x + (e._mx || 0) * .5, y + (e._my || 0) * .4, .5, 0, TAU); c.fill(); }
      }
      c.fillStyle = '#1a1220'; c.beginPath(); c.moveTo(0, -4.2); c.bezierCurveTo(-1.2, -4.8, -.8, -5.8, 0, -5.2); c.bezierCurveTo(.8, -5.8, 1.2, -4.8, 0, -4.2); c.fill();
      c.fillStyle = '#fffaf0'; c.strokeStyle = P.ln; c.lineWidth = .22; for (let k = -2; k <= 2; k++) { c.beginPath(); c.rect(k * .9 - .38, -3.75, .76, .95); c.fill(); c.stroke(); }
    },
    // ---------------- tortuga: escudos del caparazón; se esconde y se asoma ----------------
    tortuga(c, e, t, s) {
      const P = pal(s), sh = e.st === 'shell' || e.st === 'slide', slide = e.st === 'slide', a = Math.sin(e.anim * 8);
      if (!sh) {
        for (const [lx, ph, col] of [[-4.6, 0, P.ls], [3.6, 1, P.ls], [-3, 1, P.l], [5, 0, P.l]]) { const sw = (ph ? a : -a) * 1.1; vol(c, c => c.ellipse(lx + sw, -1.2, 1.3, 1.5, 0, 0, TAU), col, { lw: .45, tex: c => motas(c, [[lx + sw - .3, -1.6, .25], [lx + sw + .4, -.9, .2]], P.ls) }); }
        trazo(c, [[-7, -2.2], [-8.4, -1.6]], .7, P.l);
        trazo(c, [[5, -3.2], [7, -4.6]], 1.7, P.l);
        vol(c, c => c.ellipse(8, -5, 2.4, 1.9, -.15, 0, TAU), P.l, { hl: [7.6, -6, 1], tex: c => motas(c, [[7.2, -5.8, .3], [8.5, -6.1, .25], [7.8, -4.2, .25]], P.ls) });
        ojo(c, e, t, 8.6, -5.5, .72, { piel: P.l });
        c.strokeStyle = P.ln; c.lineWidth = .3; c.beginPath(); c.moveTo(10.3, -4.5); c.quadraticCurveTo(9.2, -3.9, 8.2, -4.1); c.stroke();
      }
      c.save(); if (slide) { c.translate(0, -4); c.rotate(e.t * 20); c.translate(0, 4); }
      const cap = c => { c.moveTo(-7.2, -1.5); c.bezierCurveTo(-7.2, -9.2, 7.2, -9.2, 7.2, -1.5); c.closePath(); };
      vol(c, cap, P.m, { hl: [-2, -6.4, 3], tex: c => {
        const hexa = (x, y, r) => { c.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * .8); } c.closePath(); c.fillStyle = P.ml; c.fill(); c.strokeStyle = P.ms; c.lineWidth = .45; c.stroke(); c.fillStyle = P.mh; c.globalAlpha *= .5; c.beginPath(); c.ellipse(x - r * .2, y - r * .25, r * .35, r * .22, 0, 0, TAU); c.fill(); c.globalAlpha /= .5; };
        hexa(0, -5.6, 1.9); hexa(-3.5, -4.4, 1.7); hexa(3.5, -4.4, 1.7);
        c.fillStyle = P.ms; c.fillRect(-8, -2.7, 16, 1.4); c.strokeStyle = P.mss; c.lineWidth = .3; for (let x = -6; x <= 6; x += 1.5) { c.beginPath(); c.moveTo(x, -2.7); c.lineTo(x, -1.3); c.stroke(); }
      } });
      if (sh && !slide) { c.fillStyle = '#120c10'; c.beginPath(); c.ellipse(6.2, -2.9, 1.3, .95, 0, 0, TAU); c.fill(); if (!parpadea(e, t)) { c.fillStyle = '#fff'; c.beginPath(); c.arc(5.9, -3, .32, 0, TAU); c.arc(6.6, -3, .32, 0, TAU); c.fill(); } }
      c.restore();
    },
    // ---------------- pelícano: bolsa del pico y corona amarilla ----------------
    pelicano(c, e, t, s) {
      const P = pal(s), dive = e.st === 'dive', f = dive ? 0 : Math.sin(e.anim * 5) * .7;
      c.save(); if (dive) c.rotate(.6);
      for (const d of [-1, 1]) {
        const b = dive ? -6 * d : 0, ty = -7 - f * 4;
        const ala = c => { c.moveTo(d * 1.6, -6.4); c.quadraticCurveTo(d * 7 + b, ty - 1.4, d * 12.4 + b, ty); c.lineTo(d * 11 + b, ty + 1.4); c.lineTo(d * 11.8 + b, ty + 2.2); c.quadraticCurveTo(d * 6 + b, -3.4, d * 1.6, -3); c.closePath(); };
        vol(c, ala, P.m, { lw: .5, tex: c => { c.fillStyle = P.ms; c.beginPath(); c.moveTo(d * 6 + b, ty + 1.6); c.lineTo(d * 12.4 + b, ty); c.lineTo(d * 11.8 + b, ty + 2.2); c.quadraticCurveTo(d * 8 + b, -3, d * 5, -3.4); c.fill(); c.strokeStyle = P.ml; c.lineWidth = .25; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(d * (4 + k * 2) + b * .4, -5.6 - f * (k * .8)); c.lineTo(d * (5 + k * 2) + b * .5, -3.6); c.stroke(); } } });
      }
      vol(c, c => c.ellipse(0, -5, 5.2, 3, 0, 0, TAU), P.m, { hl: [-1.6, -6.2, 2.2], tex: c => { c.fillStyle = P.l; c.beginPath(); c.ellipse(.6, -3.4, 3.6, 1.2, 0, 0, TAU); c.fill(); } });
      trazo(c, [[3.4, -6], [4.6, -7.6]], 1.6, P.ms);
      vol(c, c => c.arc(5.2, -8.2, 2.1, 0, TAU), '#f6f0e4', { hl: [4.6, -9, 1], tex: c => { c.fillStyle = '#f2d060'; c.beginPath(); c.ellipse(5, -9.9, 1.6, .7, 0, 0, TAU); c.fill(); } });
      vol(c, c => { c.moveTo(6.6, -9); c.lineTo(14, -6.8); c.lineTo(13.6, -6.2); c.quadraticCurveTo(10, -3.6, 6.8, -6.6); c.closePath(); }, P.a, { lw: .45, tex: c => { c.fillStyle = P.as; c.beginPath(); c.moveTo(7, -7); c.quadraticCurveTo(10, -3.8, 13.6, -6.4); c.lineTo(7, -6.6); c.fill(); } });
      ojo(c, e, t, 5.6, -8.6, .65, { piel: '#f6f0e4', iris: '#5ab0d8' });
      c.restore();
    },
    // ---------------- abeja melipona (Xunán Kab): peludita, con su bolita de polen ----------------
    abeja(c, e, t, s) {
      const P = pal(s), f = Math.sin(e.anim * 44);
      alas(c, -.6, -6.4, 2.6, 1.1, -.7, f, 1, '#f2fbff'); alas(c, .8, -6.4, 2.4, 1, -.25, f, 1, '#f2fbff');
      for (const [x, ph] of [[-1.2, 0], [.4, 1], [1.8, 2]]) trazo(c, [[x, -2.4], [x - .3, -1 + Math.sin(t * 8 + ph) * .2]], .35, P.d, { lw: .35 });
      vol(c, c => c.ellipse(-1.4, -1.3, .9, .7, 0, 0, TAU), '#f2c230', { lw: .3 });
      vol(c, c => c.ellipse(-.6, -4, 3.8, 2.7, 0, 0, TAU), P.m, { hl: [-1.6, -5.4, 1.8], tex: c => { c.fillStyle = P.d; for (const x of [-1.6, -3.4]) { c.beginPath(); c.ellipse(x, -4, .55, 3, .1, 0, TAU); c.fill(); } } });
      c.strokeStyle = P.ml; c.lineWidth = .25; c.beginPath(); for (let k = 0; k < 9; k++) { const a = Math.PI * 1.1 + k / 8 * Math.PI * .8, x = -.6 + Math.cos(a) * 3.8, y = -4 + Math.sin(a) * 2.7; c.moveTo(x, y); c.lineTo(x + Math.cos(a) * .7, y + Math.sin(a) * .7); } c.stroke();
      vol(c, c => c.arc(3.2, -4.6, 1.9, 0, TAU), P.d, { hl: [2.6, -5.4, 1] });
      ojo(c, e, t, 3.9, -4.9, .9, { ax: .8, piel: P.d });
      c.fillStyle = 'rgba(255,140,160,.45)'; c.beginPath(); c.ellipse(3.9, -3.6, .6, .35, 0, 0, TAU); c.fill();
      c.strokeStyle = P.ln; c.lineWidth = .3; c.beginPath(); c.moveTo(3.4, -6.3); c.quadraticCurveTo(3.8, -8.2, 5, -8.4); c.moveTo(2.8, -6.3); c.quadraticCurveTo(2.6, -8.4, 3.6, -9); c.stroke();
      c.fillStyle = P.d; c.beginPath(); c.arc(5, -8.4, .35, 0, TAU); c.arc(3.6, -9, .35, 0, TAU); c.fill();
    },
    // ---------------- autómata de cuerda: llave que gira, reloj en el pecho ----------------
    automata(c, e, t, s) {
      const P = pal(s), m = e.t % 2.4 < 1.6, a = m ? Math.sin(e.anim * 10) : 0, lat = P.a, cu = P.d;
      for (const [x, ph] of [[-1.8, 0], [1.4, 1]]) { const up = Math.max(0, ph ? a : -a) * 1.4; trazo(c, [[x, -4], [x, -.8 - up]], .9, P.ds, { lw: .5 }); vol(c, c => roundRect(c, x - 1.3, -1.2 - up, 2.6, 1.2, .4), lat, { lw: .4 }); }
      c.save(); c.translate(-4.4, -8); c.rotate(e.t * (m ? 5 : 1)); trazo(c, [[0, 0], [-1.6, 0]], .5, lat, { lw: .4 }); for (const d of [-1, 1]) vol(c, c => c.ellipse(-2.3, d * 1.1, .9, 1.2, 0, 0, TAU), lat, { lw: .35 }); c.restore();
      vol(c, c => roundRect(c, -4, -11.4, 8, 7.4, 1.6), cu, { hl: [-2, -10.4, 2], tex: c => { c.fillStyle = lat; c.fillRect(-4, -5.4, 8, .9); motas(c, [[-3.2, -10.6, .3], [3.2, -10.6, .3], [-3.2, -6.4, .3], [3.2, -6.4, .3]], lat); } });
      vol(c, c => c.arc(.4, -8, 1.8, 0, TAU), '#f4ead0', { lw: .4, s: false });
      c.strokeStyle = P.ln; c.lineWidth = .3; c.beginPath(); c.moveTo(.4, -8); c.lineTo(.4 + Math.cos(t * 3) * 1.3, -8 + Math.sin(t * 3) * 1.3); c.moveTo(.4, -8); c.lineTo(.4, -9.1); c.stroke();
      trazo(c, [[2.6, -9.4], [3.6 + a * .8, -6.4]], .8, cu, { lw: .5 }); vol(c, c => c.arc(3.8 + a * .8, -6, .8, 0, TAU), lat, { lw: .35 });
      vol(c, c => roundRect(c, -3, -16, 6.4, 4.6, 1.4), cu, { hl: [-1.6, -15, 1.4] });
      vol(c, c => roundRect(c, -1.6, -14.8, 4.6, 1.8, .8), '#1a1424', { lw: .3, s: false, l: false });
      const sx = Math.sin(t * 2) * 1.2; brilla(c, .8 + sx, -13.9, 2.4, P.e, .7); c.fillStyle = P.e; c.fillRect(.2 + sx, -14.3, 1.2, .8);
      trazo(c, [[.2, -16], [.2, -17.6]], .35, lat, { lw: .3 }); c.fillStyle = Math.sin(t * 6) > 0 ? '#ff5050' : '#7a2020'; c.beginPath(); c.arc(.2, -18, .7, 0, TAU); c.fill();
    },
    // ---------------- dron: rotores, lente que apunta y se pone roja antes del rayo ----------------
    dron(c, e, t, s) {
      const P = pal(s), off = e.st === 'off', aviso = e.warn || e.beam;
      for (const d of [-1, 1]) {
        trazo(c, [[d * 2.6, -4.4], [d * 6.2, -6]], .6, '#3a3f58', { lw: .4 });
        vol(c, c => c.ellipse(d * 6.2, -6.2, .9, .6, 0, 0, TAU), '#4a5070', { lw: .3 });
        if (!off) { c.fillStyle = 'rgba(200,210,240,.28)'; c.beginPath(); c.ellipse(d * 6.2, -6.8, 3.4, .7, 0, 0, TAU); c.fill(); const r = Math.cos(t * 50 + d) * 3.2; c.strokeStyle = 'rgba(230,240,255,.75)'; c.lineWidth = .3; c.beginPath(); c.moveTo(d * 6.2 - r, -6.8); c.lineTo(d * 6.2 + r, -6.8); c.stroke(); }
        else trazo(c, [[d * 6.2 - 2, -6.9], [d * 6.2 + 2, -6.6]], .3, '#8a90b0', { lw: .3 });
      }
      vol(c, c => roundRect(c, -4.6, -6, 9.2, 4.4, 2), '#262a40', { hl: [-2, -5.4, 2.2], ln: '#0a0c16', tex: c => { c.fillStyle = '#3a4060'; c.fillRect(-4.6, -6, 9.2, 1.2); } });
      vol(c, c => c.arc(1, -3.4, 1.7, 0, TAU), '#0c0e18', { lw: .35, s: false, ln: '#0a0c16' });
      const col = off ? '#333333' : aviso ? '#ff3040' : P.e, mx = (e._mx || 0) * .6, my = (e._my || 0) * .5;
      if (!off) brilla(c, 1 + mx, -3.4 + my, 2.6, col, .6);
      c.fillStyle = col; c.beginPath(); c.arc(1 + mx, -3.4 + my, .8, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(.7 + mx, -3.7 + my, .25, 0, TAU); c.fill();
      c.fillStyle = off ? '#222' : (Math.floor(t * 3) % 2 ? '#40ff80' : '#104020'); c.beginPath(); c.arc(-3, -4.6, .4, 0, TAU); c.fill();
      trazo(c, [[-1.6, -6], [-2.4, -7.6]], .25, '#8a90b0', { lw: .25 });
    },
    // ---------------- babosa: brillosa, con manto y ojos en los tentáculos ----------------
    babosa(c, e, t, s) {
      const P = pal(s), air = (e.vy || 0) !== 0, sq = air ? .82 : 1 + Math.sin(e.anim * 4) * .07;
      vol(c, c => { c.moveTo(-8.6, -.2); c.quadraticCurveTo(0, -1.6, 8, -.6); c.lineTo(8.4, 0); c.lineTo(-8.6, 0); c.closePath(); }, P.l, { lw: .4 });
      const cu = c => { c.moveTo(-8.6, -.4); c.bezierCurveTo(-8, -3.6 * sq, -3, -5.6 * sq, 1.4, -5.2 * sq); c.bezierCurveTo(5, -4.8 * sq, 7.6, -3.4, 8.2, -.8); c.closePath(); };
      vol(c, cu, P.m, { hl: [-1, -4.8 * sq, 3], tex: c => { c.strokeStyle = P.ms; c.lineWidth = .3; for (let k = -6; k < 6; k += 1.6) { c.beginPath(); c.moveTo(k, -1); c.quadraticCurveTo(k + .6, -3, k + 1.4, -1.2); c.stroke(); } c.fillStyle = P.ml; c.beginPath(); c.ellipse(-.6, -4 * sq, 3.6, 1.6 * sq, 0, 0, TAU); c.fill(); } });
      brillo(c, -2, -4.6 * sq, 1.8, .45, .7, -.1); brillo(c, 3, -3.4 * sq, .7, .35, .6);
      for (const [d, ph] of [[0, 0], [1, 1.3]]) { const tx = 6.6 + d * 2.4, ty = -9.4 - d * .2 + Math.sin(t * 5 + ph) * .7; trazo(c, [[4.4 + d * 2, -4.2], [5.6 + d * 2, -7, tx, ty]], .7, P.m, { lw: .5 }); ojo(c, e, t, tx, ty, .75, { piel: P.m }); }
      trazo(c, [[7.6, -2], [9, -1.4]], .45, P.m, { lw: .4 });
    },
    // ---------------- grumo de plastilina: huellas de dedo y cara de susto ----------------
    grumo(c, e, t, s) {
      const P = pal(s), k = Math.floor(t * 12) / 12, air = (e.vy || 0) !== 0, sq = air ? .88 : 1 + Math.sin(k * 9) * .05;
      const forma = c => { for (let i = 0; i <= 20; i++) { const a = i / 20 * TAU, r = 1 + Math.sin(a * 3 + 1) * .07 + Math.sin(a * 5) * .04, x = Math.cos(a) * 7.2 / sq * r, y = -5 * sq + Math.sin(a) * 5 * sq * r; c.lineTo(x, Math.min(0, y)); } c.closePath(); };
      vol(c, forma, P.m, { hl: [-2.6, -8 * sq, 2.6], d: [.9, 1.6], tex: c => { c.strokeStyle = P.ms; c.lineWidth = .25; for (let r = .6; r < 3; r += .6) { c.beginPath(); c.ellipse(-2.6, -4 * sq, r * 1.2, r, .4, .3, TAU - .8); c.stroke(); } c.fillStyle = P.ml; c.beginPath(); c.ellipse(3, -2.2, 1.4, .8, 0, 0, TAU); c.fill(); } });
      const en = e.alert ? .6 : 0;
      ojo(c, e, t, 1.2, -6.2 * sq, 1.5, { piel: P.m, enojo: en }); ojo(c, e, t, 4.4, -6 * sq, 1.4, { piel: P.m, enojo: en });
      c.strokeStyle = P.ln; c.lineWidth = .4; c.beginPath(); if (e.alert) c.ellipse(3, -3.4 * sq, .7, .9, 0, 0, TAU); else c.arc(3, -3.8 * sq, .9, .3, Math.PI - .3); c.stroke();
    },
    // ---------------- erizo: púas en dos capas; se hace bolita ----------------
    erizo(c, e, t, s) {
      const P = pal(s), k = e.curl || 0, a = Math.sin(e.anim * 10) * (1 - k), cy = -4 - k;
      const puas = (r0, r1, n, col, off) => { c.fillStyle = col; c.strokeStyle = P.ln; c.lineWidth = .3; c.beginPath(); for (let i = 0; i <= n; i++) { const an = Math.PI * (1 - k * .5) + i / n * Math.PI * (1 + k) + off, r = i % 2 ? r0 : r1; c.lineTo(Math.cos(an) * r, cy + Math.sin(an) * r * (.82 + k * .18)); } c.closePath(); c.fill(); c.stroke(); };
      puas(6, 9.6 + k * 2, 16, P.d, .1); puas(5.4, 8.4 + k * 1.8, 14, P.ms, 0);
      vol(c, c => c.ellipse(0, cy + .2, 6.2, 4.4 + k, 0, Math.PI, 0), P.m, { hl: [-2, cy - 2.4, 2], tex: c => { c.strokeStyle = P.ml; c.lineWidth = .3; for (let i = 1; i < 10; i++) { const an = Math.PI + i / 10 * Math.PI; c.beginPath(); c.moveTo(Math.cos(an) * 2.4, cy + Math.sin(an) * 1.8); c.lineTo(Math.cos(an) * 5.6, cy + Math.sin(an) * 4); c.stroke(); } } });
      if (k < .5) {
        vol(c, c => c.ellipse(4.4, -5.6, 1, .8, 0, 0, TAU), P.ls, { lw: .35 });
        vol(c, c => { c.moveTo(3.2, -5.8); c.bezierCurveTo(6.4, -7, 8.2, -4.6, 10.2, -2.8); c.quadraticCurveTo(9.4, -1.4, 7, -1); c.bezierCurveTo(5, -.4, 3, -1, 3.2, -5.8); c.closePath(); }, P.l, { hl: [5.6, -5, 1.4], lw: .45 });
        c.fillStyle = P.ln; c.beginPath(); c.arc(10, -2.8, .6, 0, TAU); c.fill(); brillo(c, 9.8, -3, .22, .22);
        ojo(c, e, t, 6.6, -4, .78, { piel: P.l });
        c.fillStyle = 'rgba(255,130,150,.4)'; c.beginPath(); c.ellipse(7.2, -2.4, .7, .4, 0, 0, TAU); c.fill();
        vol(c, c => c.ellipse(-3.4 + a, -.6, 1, .6, 0, 0, TAU), P.ls, { lw: .35 }); vol(c, c => c.ellipse(2.4 - a, -.6, 1, .6, 0, 0, TAU), P.ls, { lw: .35 });
      }
    },
    // ---------------- salamandra de fuego: llamas en el lomo, abre la boca antes de escupir ----------------
    salamandra(c, e, t, s) {
      const P = pal(s), a = Math.sin(e.anim * 12), out = e.st === 'sleep', col = out ? '#5a4a4a' : P.m, aim = e.aim > 0;
      const pata = (lx, ph, cc) => { const sw = (ph ? a : -a); trazo(c, [[lx, -2.2], [lx + sw * 1.2 - .8, -1], [lx + sw * 1.6, 0]], .8, cc); };
      pata(-3, 1, tono(col, -.25)); pata(5.4, 0, tono(col, -.25));
      const cu = c => { c.moveTo(-16, -1.6 + a); c.quadraticCurveTo(-10, -4.4, -5, -4.4); c.lineTo(5, -5.2); c.quadraticCurveTo(11, -5.4, 11.4, -2.6); c.quadraticCurveTo(9, -.6, 5, -1.2); c.lineTo(-6, -1.2); c.quadraticCurveTo(-11, -1, -16, -1.6 + a); c.closePath(); };
      vol(c, cu, col, { hl: [2, -4.6, 3], tex: c => { motas(c, [[-9, -2.8, .7, .5], [-5, -3.3, .9, .6], [-1.4, -3.8, .8, .6], [2, -3.9, 1, .7], [5.4, -4.1, .8], [-12.4, -2.1, .5]], out ? '#6a6060' : P.d); c.fillStyle = tono(col, .3); c.beginPath(); c.ellipse(1, -1.6, 6, .8, 0, 0, TAU); c.fill(); } });
      pata(-4.6, 0, col); pata(4, 1, col);
      if (aim) vol(c, c => { c.moveTo(8, -2.8); c.lineTo(11.8, -3.6); c.lineTo(11.6, -1.4); c.closePath(); }, '#5a1020', { lw: .35 });
      else { c.strokeStyle = P.ln; c.lineWidth = .3; c.beginPath(); c.moveTo(11, -2.4); c.quadraticCurveTo(9.4, -2, 8.2, -2.6); c.stroke(); }
      ojo(c, e, t, 8.4, -3.8, .78, { piel: col, iris: '#ffe800', enojo: aim ? .7 : .2 });
      if (!out) {
        for (let i = -6; i < 7; i += 3.2) { const fl = 1.6 + Math.sin(t * 18 + i) * .7, x = i, y = -4.6 - (i > 4 ? .4 : 0); c.fillStyle = '#ff5a1a'; c.beginPath(); c.moveTo(x - 1.7, y + .3); c.quadraticCurveTo(x - 1, y - fl * 1.4, x + .2, y - fl * 2.4); c.quadraticCurveTo(x + .7, y - fl, x + 1.7, y + .3); c.fill(); c.fillStyle = '#ffb02a'; c.beginPath(); c.moveTo(x - 1.1, y); c.quadraticCurveTo(x - .5, y - fl * 1.1, x + .2, y - fl * 1.8); c.quadraticCurveTo(x + .5, y - fl * .7, x + 1.1, y); c.fill(); c.fillStyle = '#fff2a0'; c.beginPath(); c.moveTo(x - .6, y); c.quadraticCurveTo(x - .2, y - fl * .9, x + .2, y - fl * 1.3); c.quadraticCurveTo(x + .3, y - fl * .5, x + .7, y); c.fill(); }
        if (aim) brilla(c, 12.4, -2.6, 3 + (.55 - e.aim) * 8, '#ffe800', .8);
      }
    },
    // ---------------- botete: se infla, saca las púas y frunce el ceño ----------------
    botete(c, e, t, s) {
      const P = pal(s), k = e.puff || 0, r = 5 + k * 5, cy = -5 - k * 3, ax = 1.15 - k * .1;
      vol(c, c => { c.moveTo(-r * ax + .4, cy); c.lineTo(-r * ax - 3.8, cy - 3 + Math.sin(t * 10) * .8); c.quadraticCurveTo(-r * ax - 2.6, cy, -r * ax - 3.8, cy + 3 - Math.sin(t * 10) * .8); c.closePath(); }, P.ms, { lw: .45 });
      if (k > .15) { c.fillStyle = P.l; c.strokeStyle = P.ln; c.lineWidth = .3; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, L = 1 + k * 2.4, x = Math.cos(a) * r * ax, y = cy + Math.sin(a) * r; c.beginPath(); c.moveTo(x + Math.cos(a + 1.4) * .5, y + Math.sin(a + 1.4) * .5); c.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); c.lineTo(x + Math.cos(a - 1.4) * .5, y + Math.sin(a - 1.4) * .5); c.fill(); c.stroke(); } }
      vol(c, c => c.ellipse(0, cy, r * ax, r, 0, 0, TAU), P.m, { hl: [-r * .4, cy - r * .45, r * .6], tex: c => { c.fillStyle = P.l; c.beginPath(); c.ellipse(0, cy + r * .55, r * .95, r * .55, 0, 0, TAU); c.fill(); motas(c, [[-r * .3, cy - r * .3, .5 + k * .3], [r * .05, cy - r * .62, .45 + k * .3], [-r * .65, cy - r * .05, .4 + k * .3], [r * .3, cy - r * .22, .35 + k * .3]], P.ms); } });
      c.save(); c.translate(r * .1, cy + 1); c.rotate(Math.sin(t * 12) * .5); vol(c, c => c.ellipse(-1, 0, 1.8, .9, .4, 0, TAU), P.ml, { lw: .35 }); c.restore();
      ojo(c, e, t, r * .52, cy - r * .3, 1.4 + k * .4, { piel: P.m, iris: P.a, enojo: k * .8 });
      c.strokeStyle = P.ln; c.lineWidth = .4; c.fillStyle = '#e88a9a'; c.beginPath(); c.ellipse(r * ax - .3, cy + .6, .6, .7 + k * .2, 0, 0, TAU); c.fill(); c.stroke();
    },
    // ---------------- carámbano: hielo facetado con cara de pocos amigos ----------------
    carambano(c, e, t, s) {
      const P = pal(s), gr = e.ic === 'regrow' ? e.grow : 1, j = e.jit || 0, hielo = '#dff3ff', azul = '#2a3a5a';
      c.save(); c.translate(j, 0); c.scale(1, gr);
      c.fillStyle = '#f4fbff'; c.beginPath(); c.moveTo(-6.4, -15.4); for (let x = -6.4; x <= 6.4; x += 1.6) c.lineTo(x + .8, -14.2 - ((x * 7) % 3 + 3) % 3 * .4); c.lineTo(6.4, -15.4); c.closePath(); c.fill();
      const forma = c => { c.moveTo(-5.4, -15); c.lineTo(5.4, -15); c.lineTo(4.4, -10); c.lineTo(2.2, -5); c.lineTo(.4, 0); c.lineTo(-1.2, -4.6); c.lineTo(-3.6, -9); c.closePath(); };
      vol(c, forma, hielo, { d: [.6, 0], ln: '#4a6a9a', lw: .5, tex: c => {
        c.fillStyle = 'rgba(150,200,240,.55)'; c.beginPath(); c.moveTo(.6, -15); c.lineTo(5.4, -15); c.lineTo(4.4, -10); c.lineTo(2.2, -5); c.lineTo(.4, 0); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.moveTo(-4.4, -14.6); c.lineTo(-2.4, -14.6); c.lineTo(-1, -6); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(90,140,200,.5)'; c.lineWidth = .25; c.beginPath(); c.moveTo(-2, -15); c.lineTo(.4, -2); c.moveTo(3, -15); c.lineTo(1.4, -5); c.stroke();
        c.fillStyle = rgba(P.l, .25); c.beginPath(); c.ellipse(0, -10, 2.6, 4, 0, 0, TAU); c.fill();
      } });
      const en = e.ic === 'shake' ? 1 : .6;
      ojo(c, e, t, -2, -11.2, 1.1, { piel: hielo, iris: '#4a8ad8', enojo: en, ln: azul }); ojo(c, e, t, 1.8, -11.2, 1.1, { piel: hielo, iris: '#4a8ad8', enojo: en, ln: azul });
      c.strokeStyle = azul; c.lineWidth = .35; c.beginPath(); if (e.ic === 'shake') c.ellipse(0, -8.4, .9, .7, 0, 0, TAU); else c.arc(0, -7.4, 1.1, Math.PI + .5, -.5); c.stroke();
      c.restore();
    },
    // ---------------- alacrán: cola de segmentos que se arquea y pica ----------------
    escorpion(c, e, t, s) {
      const P = pal(s), L2 = e.st === 'lunge' ? 1 : 0, a = Math.sin(e.anim * 10);
      for (let k = 0; k < 4; k++) { const x = -3 + k * 2, sw = a * (k % 2 ? 1 : -1) * .8; trazo(c, [[x, -3], [x - .6 + sw * .4, -4.4], [x - 1.2 + sw, 0]], .45, P.ms, { lw: .4 }); }
      let px = -5.4, py = -4; const segs = [];
      for (let i = 0; i < 5; i++) { const ang = -2.4 + i * (.55 + L2 * .25) + Math.sin(t * 3 + i) * .04; px += Math.cos(ang) * 2; py += Math.sin(ang) * 2; segs.push([px, py, 1.35 - i * .1]); }
      vol(c, c => c.ellipse(0, -3.6, 6.4, 2.8, 0, 0, TAU), P.m, { hl: [-1.6, -5, 2.4], tex: c => { c.strokeStyle = P.ms; c.lineWidth = .4; for (let x = -4.4; x < 3; x += 1.5) { c.beginPath(); c.moveTo(x, -6.4); c.quadraticCurveTo(x + .5, -3.6, x, -1); c.stroke(); } } });
      for (const [x, y, r] of segs) vol(c, c => c.ellipse(x, y, r, r * .9, 0, 0, TAU), P.m, { lw: .4, hl: [x - r * .3, y - r * .4, r * .6] });
      const [sx, sy] = segs[4], ang = -2.4 + 4 * (.55 + L2 * .25) + .6;
      vol(c, c => c.ellipse(sx + Math.cos(ang) * 1.2, sy + Math.sin(ang) * 1.2, 1.3, 1, ang, 0, TAU), P.a, { lw: .4 });
      const tx = sx + Math.cos(ang) * 2.4, ty = sy + Math.sin(ang) * 2.4;
      c.fillStyle = P.d; c.beginPath(); c.moveTo(tx - .4, ty - .4); c.quadraticCurveTo(tx + Math.cos(ang + .8) * 2.2, ty + Math.sin(ang + .8) * 2.2, tx + Math.cos(ang + 1.6) * 2, ty + Math.sin(ang + 1.6) * 2); c.lineTo(tx + .4, ty + .4); c.closePath(); c.fill();
      brilla(c, tx, ty, 2.4, P.a, .35 + L2 * .45);
      for (const [d, col] of [[0, P.ms], [1, P.m]]) {
        const snap = L2 ? .5 : Math.max(0, Math.sin(t * 4 + d)) * .3, bx = 8.6 + L2 * 3 - d * .6, by = -4 - d * 1.4;
        trazo(c, [[5, -3.6 - d], [7, -5 - d * .8], [bx - 1.2, by]], .7, col, { lw: .45 });
        vol(c, c => c.ellipse(bx, by, 1.6, 1.1, 0, 0, TAU), col, { lw: .4 });
        c.save(); c.translate(bx + 1, by - .4); c.rotate(-snap); vol(c, c => { c.moveTo(0, 0); c.quadraticCurveTo(1.6, -.8, 2.2, .2); c.quadraticCurveTo(1.2, 0, 0, .6); c.closePath(); }, col, { lw: .35 }); c.restore();
        vol(c, c => { c.moveTo(bx + 1, by + .2); c.quadraticCurveTo(bx + 2.4, by + .6, bx + 3, by - .2); c.quadraticCurveTo(bx + 2, by + 1.2, bx + .6, by + 1); c.closePath(); }, col, { lw: .35 });
      }
      ojo(c, e, t, 4.4, -5, .55, { piel: P.m, enojo: .6 }); ojo(c, e, t, 3.2, -5.3, .5, { piel: P.m, enojo: .6 });
    },
    // ---------------- perro de sombra: greña, ojo rojo, para las orejas cuando oye ----------------
    perro(c, e, t, s) {
      const P = pal(s), run = e.mode === 'hunt', a = Math.sin(e.anim * (run ? 22 : 9)), oye = run || e.mode === 'flare';
      const pata = (lx, ph, col) => { const sw = (ph ? a : -a) * (run ? 2 : 1); trazo(c, [[lx, -4.6], [lx + sw * .6, -2.2], [lx + sw, 0]], 1.1, col); };
      pata(-5.6, 1, P.ms); pata(5, 0, P.ms);
      trazo(c, [[-7.6, -6.4], [-10.6, -8 + a * .8, -11.4, -10.4 + a]], 1, P.m);
      const cu = c => { c.moveTo(-8.4, -6); c.bezierCurveTo(-8.6, -10.4, 3, -10.8, 6.4, -8.2); c.lineTo(6.4, -4.4); c.bezierCurveTo(1.6, -3.2, -5, -3.4, -8.4, -6); c.closePath(); };
      vol(c, cu, P.m, { hl: [-1.6, -9, 2.6], tex: c => { c.strokeStyle = P.ms; c.lineWidth = .3; for (let k = -7; k < 6; k += 1.2) { c.beginPath(); c.moveTo(k, -8.8 + Math.abs(k) * .1); c.lineTo(k - .6, -6.8); c.stroke(); } } });
      c.fillStyle = P.d; c.beginPath(); c.moveTo(-7.4, -8.4); for (let i = 0; i < 8; i++) { const x = -7 + i * 1.6; c.lineTo(x + .5, -10.6 - (i % 2) * 1.2 - (run ? .8 : 0)); c.lineTo(x + 1.3, -9.2); } c.lineTo(5.6, -8.8); c.closePath(); c.fill(); c.strokeStyle = P.ln; c.lineWidth = .3; c.stroke();
      pata(-3.6, 0, P.m); pata(6.8, 1, P.m);
      c.save(); c.translate(6.6, -8.4 + (run ? .8 : 0)); c.rotate(run ? .15 : -.05);
      vol(c, c => { c.moveTo(-1.6, -1.8); c.quadraticCurveTo(2.4, -2.8, 6.4, -.2); c.lineTo(6.2, 1.2); c.quadraticCurveTo(2, 2.6, -1.4, 1.8); c.closePath(); }, P.m, { hl: [1.4, -1.6, 1.4] });
      vol(c, c => { c.moveTo(-.4, -1.6); c.lineTo(oye ? .2 : -2.4, oye ? -4.8 : -3); c.lineTo(1.4, -1.8); c.closePath(); }, P.d, { lw: .4 });
      const sn = run ? Math.sin(t * 30) * .15 : 0; c.fillStyle = P.ln; c.beginPath(); c.ellipse(6.2, -.2 + sn, .7, .55, 0, 0, TAU); c.fill();
      c.strokeStyle = P.ln; c.lineWidth = .35; c.beginPath(); c.moveTo(6, 1); c.lineTo(2.6, 1.2); c.stroke(); c.fillStyle = '#fffaf0'; c.beginPath(); c.moveTo(4.6, 1.1); c.lineTo(5, 2); c.lineTo(5.3, 1.1); c.fill();
      brilla(c, 3, -.6, 4, '#ff2020', run ? .9 : .45);
      c.fillStyle = '#ff3030'; c.beginPath(); c.ellipse(3, -.6, .9, parpadea(e, t) ? .1 : .55, -.2, 0, TAU); c.fill(); c.fillStyle = '#ffd0d0'; c.beginPath(); c.arc(3.2, -.7, .2, 0, TAU); c.fill();
      c.restore();
    },
    // ---------------- mono araña: cola enroscada, avienta cocos ----------------
    mono(c, e, t, s) {
      const P = pal(s), th = e.throwT > 0, a = Math.sin(e.anim * 3);
      trazo(c, [[-3.6, -4], [-10, -3 + a * 2, -9.6, -10], [-9.2, -12.6, -7.6, -12]], .9, P.d);
      trazo(c, [[-2, -3], [-3.4, -1.4], [-2.4, 0]], 1.1, P.d); trazo(c, [[1.6, -3], [2.6, -1.2], [2, 0]], 1.1, P.d);
      trazo(c, [[-1.8, -8], [-4, -5.6 + a * .4], [-3.4, -3.4]], .9, P.ds);
      vol(c, c => c.ellipse(0, -6.4, 4.2, 4.8, 0, 0, TAU), P.d, { hl: [-1.4, -8.6, 2], tex: c => { c.fillStyle = P.dl; c.beginPath(); c.ellipse(.8, -5.4, 2.4, 3, 0, 0, TAU); c.fill(); } });
      vol(c, c => c.arc(-2.6, -12.4, 1.2, 0, TAU), P.d, { lw: .4 });
      vol(c, c => c.ellipse(1, -12, 3.8, 3.5, 0, 0, TAU), P.d, { hl: [0, -13.6, 1.6] });
      vol(c, c => c.ellipse(2, -11.4, 2.7, 2.5, 0, 0, TAU), P.l, { lw: .4, hl: [1.4, -12.6, 1] });
      ojo(c, e, t, 1.3, -12.3, .8, { piel: P.l }); ojo(c, e, t, 3.3, -12.3, .8, { piel: P.l });
      c.fillStyle = P.ln; c.beginPath(); c.arc(2.9, -10.8, .25, 0, TAU); c.arc(3.7, -10.8, .25, 0, TAU); c.fill();
      c.strokeStyle = P.ln; c.lineWidth = .35; c.beginPath(); if (th) c.ellipse(3.2, -9.8, .8, .6, 0, 0, TAU); else c.arc(3, -10.4, 1, .4, Math.PI - .6); c.stroke();
      const hx = th ? 5.6 : 5, hy = th ? -16 : -4.4; trazo(c, [[2.6, -8.4], [hx * .75, (hy - 8.4) / 2 - 1], [hx, hy]], .9, P.d);
      if (!th) vol(c, c => c.arc(hx + .4, hy - .4, 1.8, 0, TAU), '#7a4a2a', { hl: [hx - .2, hy - 1.2, 1], lw: .4, tex: c => motas(c, [[hx + .9, hy - 1, .3], [hx + .2, hy - 1.3, .3]], '#4a2a1a') });
    },
    // ---------------- armadillo: bandas de armadura; dormido, se hace bolita ----------------
    armadillo(c, e, t, s) {
      const P = pal(s);
      if (e.st === 'sleep') {
        const r = 5.4;
        vol(c, c => c.ellipse(-4.6, -1.2, 1.4, .7, -.4, 0, TAU), P.ls, { lw: .35 });
        vol(c, c => c.arc(0, -r, r, 0, TAU), P.m, { hl: [-2, -r - 2, 2.6], tex: c => { c.strokeStyle = P.ms; c.lineWidth = .45; for (const k of [-3.6, -1.8, .01, 1.8, 3.6]) { c.beginPath(); c.ellipse(0, -r, Math.abs(k), r, 0, k < 0 ? Math.PI / 2 : -Math.PI / 2, k < 0 ? Math.PI * 1.5 : Math.PI / 2); c.stroke(); } c.fillStyle = P.ml; for (let k = -4; k <= 4; k += 1.8) for (let j = -4; j <= 4; j += 1.6) { c.fillRect(k + (j % 2 ? .9 : 0) - .3, -r + j - .2, .6, .4); } } });
        vol(c, c => c.ellipse(3, -9.6, .9, 1.7, .5, 0, TAU), P.l, { lw: .35 });
        return;
      }
      const walk = e._walk !== false, bob = walk ? Math.abs(Math.sin(e.anim * 9)) * .8 : 0;
      for (const [lx, ph, col] of [[-4, 0, P.ds], [3, Math.PI, P.ds], [-2.4, Math.PI, P.d], [4.6, 0, P.d]]) { const k = walk ? Math.sin(e.anim * 9 + ph) * 1.5 : 0; trazo(c, [[lx, -3.4], [lx + k, -.6]], 1.2, col, { lw: .6 }); c.strokeStyle = P.ln; c.lineWidth = .25; c.beginPath(); c.moveTo(lx + k, -.3); c.lineTo(lx + k + .9, 0); c.stroke(); }
      trazo(c, [[-7.6, -3.6 - bob], [-10, -3, -11.6, -1.2]], 1, P.l);
      c.save(); c.setLineDash([.6, .9]); trazo(c, [[-7.6, -3.6 - bob], [-10, -3, -11.6, -1.2]], 1, P.ls, { lw: 0, cap: 'butt' }); c.restore();
      const cap = c => { c.moveTo(-8.4, -3 - bob); c.bezierCurveTo(-8.6, -11.6 - bob, 8.6, -11.6 - bob, 8.4, -3 - bob); c.closePath(); };
      vol(c, cap, P.m, { hl: [-2.6, -9 - bob, 3.2], tex: c => {
        c.fillStyle = P.ms; c.fillRect(-9, -4.4 - bob, 18, 1.4);
        for (let k = -2; k <= 2; k++) { c.fillStyle = k % 2 ? P.ml : P.m; c.fillRect(k * 1.7 - .8, -12 - bob, 1.6, 8); c.strokeStyle = P.mss; c.lineWidth = .4; c.beginPath(); c.moveTo(k * 1.7 - .8, -12 - bob); c.lineTo(k * 1.7 - .8, -4.4 - bob); c.stroke(); }
        c.fillStyle = P.mh; c.globalAlpha *= .5; for (let k = -6; k <= 6; k += 1.4) for (let j = 0; j < 3; j++) { const y = -9.6 + j * 1.8 - bob, x = k + (j % 2) * .7; if (Math.abs(x) < 7.6 - j * .4) c.fillRect(x - .25, y, .5, .35); }
      } });
      c.save(); c.translate(7.6, -5 - bob);
      vol(c, c => { c.moveTo(-1.6, -2.4); c.quadraticCurveTo(2.4, -2.6, 6.6, -.2); c.quadraticCurveTo(3, 1.6, -1.6, 1.8); c.closePath(); }, P.l, { hl: [1, -1.6, 1.4] });
      vol(c, c => c.ellipse(-.2, -3.8, .9, 2, -.35, 0, TAU), P.l, { lw: .4, tex: c => { c.fillStyle = P.ls; c.beginPath(); c.ellipse(-.1, -3.6, .4, 1.3, -.35, 0, TAU); c.fill(); } });
      c.fillStyle = P.ln; c.beginPath(); c.arc(6.4, -.2, .32, 0, TAU); c.fill();
      ojo(c, e, t, 1.6, -.7, .8, { piel: P.l });
      c.restore();
    },
  };
  Object.assign(FD, NUEVOS);
  for (const k of Object.keys(NUEVOS)) GEN.add(k);

  // ---------------- efectos que acompañan ----------------
  FX.dron = (c, e, t, s) => {
    if (!(e.beam || e.warn)) return;
    const by = MEC.surf(e.x, e.y) - e.y; c.save();
    if (e.beam) { brilla(c, 0, by, 8, s.eye || '#ff3040', .5); c.shadowColor = s.eye; c.shadowBlur = 8; c.fillStyle = rgba(s.eye || '#ff3040', .85); c.fillRect(-1.8, -1, 3.6, by + 1); c.fillStyle = '#ffffff'; c.fillRect(-.5, -1, 1, by + 1); }
    else { c.strokeStyle = rgba(s.eye || '#ff3040', Math.sin(t * 40) > 0 ? .7 : .2); c.setLineDash([2, 3]); c.lineWidth = .6; c.beginPath(); c.moveTo(0, -1); c.lineTo(0, by); c.stroke(); c.setLineDash([]); c.beginPath(); c.ellipse(0, by, 3 + Math.sin(t * 20), 1, 0, 0, TAU); c.stroke(); }
    c.restore();
  };
  FX.jabali = (c, e, t) => { if (e.st !== 'run') return; for (let k = 0; k < 3; k++) { const ph = (t * 4 + k / 3) % 1; c.fillStyle = `rgba(210,190,160,${.45 * (1 - ph)})`; c.beginPath(); c.arc(-7 - ph * 6, -1 - ph * 2, 1 + ph * 2, 0, TAU); c.fill(); } };
  FX.tortuga = (c, e, t) => { if (e.st !== 'slide') return; c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = .5; c.lineCap = 'round'; for (let k = 0; k < 3; k++) { const y = -2 - k * 2.2, l = 4 + ((t * 30 + k * 7) % 4); c.beginPath(); c.moveTo(-8 - k, y); c.lineTo(-8 - k - l, y); c.stroke(); } };
  FX.babosa = (c, e, t) => { if ((e.vy || 0) !== 0) return; const g = c.createLinearGradient(-20, 0, -7, 0); g.addColorStop(0, 'rgba(230,250,255,0)'); g.addColorStop(1, 'rgba(230,250,255,.4)'); c.fillStyle = g; c.fillRect(-20, -.5, 13, .7); };
  FX.carambano = (c, e, t) => { if (e.ic) return; const ph = (t * .5 + e.hx * .13) % 1; c.fillStyle = `rgba(190,230,255,${1 - ph})`; c.beginPath(); c.ellipse(.4, ph * ph * 14, .45, .7, 0, 0, TAU); c.fill(); };
  FXD.jabali = (c, e, t) => { if (e.st === 'stun') mareo(c, 0, -14, t, 5); };
  FXD.grumo = (c, e, t) => { if (e.alert && e.alertT < .7) globo(c, 2 * (e.dir || 1), -16, '¡!'); };
  FXD.perro = (c, e, t) => { if (e.mode === 'flare') globo(c, 0, -18, '¿?'); };
  FXD.mono = (c, e, t) => { if (e.throwT > 0) globo(c, -2 * (e.dir || 1), -21, '¡uh!'); };
  FXD.salamandra = (c, e, t) => { if (e.st !== 'sleep') return; for (let k = 0; k < 2; k++) { const ph = (t * .8 + k / 2) % 1; c.fillStyle = `rgba(200,200,220,${.5 * (1 - ph)})`; c.beginPath(); c.arc(2 + Math.sin(ph * 6) * 1.5, -6 - ph * 8, .8 + ph * 1.4, 0, TAU); c.fill(); } };
  FXD.dron = (c, e, t) => { if (e.st !== 'off' || Math.sin(t * 13) < .6) return; c.strokeStyle = '#ffe080'; c.lineWidth = .4; c.beginPath(); for (let k = 0; k < 3; k++) { const a = k * 2.1 + t * 9; c.moveTo(0, -4); c.lineTo(Math.cos(a) * 3, -4 + Math.sin(a) * 3); } c.stroke(); };

  // ---------------- el armadillo del juego base pasa por el mismo acabado ----------------
  const ARM = { main: '#8a6a7a', dark: '#3a2a3a', light: '#c8a0a8', accent: '#e8b84a', eye: '#ffffff' };
  if (typeof drawArmadillo === 'function') {
    drawArmadillo = function (ctx, e, t, f) {
      const A = e._a || (e._a = { k: 'armadillo', hx: ((e.x0 || e.x) * .37) % 7, w: 16, h: 10, vy: 0 });
      Object.assign(A, { x: e.x, y: e.y, dir: e.dir, anim: e.anim, t: e.t, st: e.state === 'sleep' ? 'sleep' : e.state === 'gone' ? 'gone' : 'ok', tt: e.state === 'gone' ? e.t * .78 : 0, _walk: e.state === 'walk' });
      FOE_ARTE.pinta(ctx, A, f || { t, st: view.st, g: CUR, cam: CUR && CUR.cam }, ARM, FD.armadillo);
    };
  }
})();
