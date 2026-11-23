'use strict';
// =====================================================================
//  MUNDOS AMPLIADOS · LOTE 4 (vitral, cuaderno, grabado, Game Boy)
//  Cuatro actos por mundo; dos enemigos y una pieza que juegan con el
//  poder de Fresita. Los dibujos de los enemigos van en enemigos-mundos.js.
// =====================================================================
(function () {
  const { LOOK, PK, BEH, OBJ, ZONAS, FOE, mkPlat, walkStep, gravity, onGround, ring, tx, tl, freeOf, platTop } = MEC;
  const amplia = (id, W, build) => { NIVELES[id].W = W; NIVELES[id].build = build; };
  const tocaItzel = (g, x0, y0, x1, y1) => { const p = g.p; return p.vis && p.x + p.w / 2 > x0 && p.x - p.w / 2 < x1 && p.y > y0 && p.y - p.h < y1; };
  const lineas = g => g.plats.filter(pl => pl.pw && pl.k === 'seg' && !pl.dead);
  const distSeg = (x, y, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1, u = clamp(((x - ax) * dx + (y - ay) * dy) / L2, 0, 1); return Math.hypot(x - ax - u * dx, y - ay - u * dy); };

  // =================================================================
  //  VITRAL · La catedral de vidrio (Fresita encierra enemigos en vidrio)
  // =================================================================
  // gárgola: espera en su ménsula y se lanza en picada sobre Itzel; encerrada en vidrio a medio vuelo, queda como bloque en el aire
  FOE.gargola = { beh: 'gargola', w: 12, h: 10, v: 0 };
  BEH.gargola = (e, g, d) => {
    const p = g.p; e.fase = e.fase || 'posada';
    if (e.fase === 'posada') {
      e.x = e.hx; e.y = e.hy; e.cd = (e.cd ?? 1) - d; e.dir = Math.sign(p.x - e.x) || e.dir;
      if (e.cd <= 0 && Math.abs(p.x - e.x) < 100 && p.y > e.y + 20) { e.fase = 'baja'; e.tx = p.x; e.ty = p.y - 6; e.tf = 0; }
      return;
    }
    e.tf = (e.tf || 0) + d;
    if (e.fase === 'baja') { const dx = e.tx - e.x, dy = e.ty - e.y, dd = Math.hypot(dx, dy) || 1; e.x += dx / dd * 120 * d; e.y += dy / dd * 120 * d; e.dir = Math.sign(dx) || e.dir; if (dd < 6 || e.tf > 1.6) e.fase = 'sube'; return; }
    const dx = e.hx - e.x, dy = e.hy - e.y, dd = Math.hypot(dx, dy); if (dd < 3) { e.fase = 'posada'; e.cd = 2.2; return; }
    e.x += dx / dd * 70 * d; e.y += dy / dd * 70 * d; e.dir = Math.sign(dx) || e.dir;
  };
  // campana de bronce: da brincos hacia Itzel y al caer repica: una onda corre por el piso hacia los dos lados
  FOE.campana = { beh: 'campana', w: 12, h: 12, v: 0 };
  BEH.campana = (e, g, d, toP) => {
    if (e.vy !== 0 || !onGround(e)) { e.aire = true; gravity(e, d); return; }
    if (e.aire) { e.aire = false; e.repica = .5; for (const s of [1, -1]) g.objs.push({ k: 'repique', x: e.x + s * 7, y: e.y, dir: s, t: 0 }); g.shake = Math.max(g.shake || 0, .05); }
    e.repica = Math.max(0, (e.repica || 0) - d);
    e.cd = (e.cd ?? 1.2) - d; if (e.cd <= 0 && Math.abs(toP) < 160) { e.dir = Math.sign(toP) || e.dir; e.vy = -240; e.vx = e.dir * 55; e.y -= 1; e.cd = 1.8; }
  };
  OBJ.repique = {
    step(o, g, dt) { o.t += dt; o.x += o.dir * 80 * dt; if (o.t > 1.2 || SOLID(o.x + o.dir * 3, o.y - 3) || !SOLID(o.x, o.y + 2)) { o.dead = true; return; } const p = g.p; if (Math.abs(p.x - o.x) < 5 && p.y > o.y - 6 && p.y <= o.y + 1) MEC.hurt(g, o.dir); },
    draw(c, o) { const a = 1 - o.t / 1.2; c.save(); c.lineCap = 'round'; for (let k = 0; k < 3; k++) { c.strokeStyle = `rgba(${k ? '255,211,107' : '255,250,220'},${a * (1 - k * .25)})`; c.lineWidth = 1.1 - k * .3; c.beginPath(); c.arc(o.x - o.dir * k * 2, o.y, 3 + k * 2, Math.PI + .3, -.3); c.stroke(); } c.restore(); },
  };
  // candelabro: si Itzel se sube, la cadena lo sube despacito; arriba tiembla y se suelta de golpe hasta abajo
  PK.candelabro = (pl, g, d, dt) => {
    const top = pl.y0 - (pl.sube || 80); pl.fase = pl.fase || 'abajo';
    if (pl.fase === 'abajo') { if (pl.stood) { pl.tt = (pl.tt || 0) + dt; if (pl.tt > .25) { pl.fase = 'sube'; pl.tt = 0; } } else pl.tt = 0; }
    else if (pl.fase === 'sube') { pl.y = Math.max(top, pl.y - 34 * d); if (pl.y <= top) { pl.fase = 'arriba'; pl.tt = 0; } }
    else if (pl.fase === 'arriba') { pl.tt += dt; pl.avisa = pl.tt > 1; if (pl.tt > 1.7) { pl.fase = 'cae'; pl.vy = 0; } }
    else { pl.vy = (pl.vy || 0) + 600 * dt; pl.y = Math.min(pl.y0, pl.y + pl.vy * dt); if (pl.y >= pl.y0) { pl.fase = 'abajo'; pl.vy = 0; pl.avisa = false; } }
  };
  LOOK.candelabro = (c, pl, f) => {
    const sh = pl.avisa ? (Math.random() - .5) * 1.4 : 0, x = pl.x + sh, y = pl.y, w = pl.w, cx = x + w / 2, top = pl.y0 - (pl.sube || 80) - 50;
    c.strokeStyle = '#3a3a3a'; c.lineWidth = .9; c.setLineDash([2, 1.2]); c.beginPath(); c.moveTo(pl.x0 + w / 2, top); c.lineTo(cx, y - 8); c.stroke(); c.setLineDash([]);
    c.strokeStyle = '#2a2420'; c.lineWidth = .6; c.beginPath(); c.moveTo(cx, y - 8); c.lineTo(x + 2, y); c.moveTo(cx, y - 8); c.lineTo(x + w - 2, y); c.stroke();
    const gr = c.createLinearGradient(0, y, 0, y + 5); gr.addColorStop(0, '#e8c060'); gr.addColorStop(1, '#8a6420'); c.fillStyle = gr; c.beginPath(); roundRect(c, x, y, w, 4, 2); c.fill(); c.strokeStyle = '#141414'; c.lineWidth = .6; c.stroke();
    for (let k = 0; k < 4; k++) { const vx = x + 4 + k * (w - 8) / 3; c.fillStyle = '#f4ead0'; c.fillRect(vx - 1, y - 5, 2, 5); c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, vx, y - 7, 5, '#ffd36b', .5 + Math.sin(f.t * 9 + k) * .15); c.restore(); c.fillStyle = '#fff2a0'; c.beginPath(); c.ellipse(vx, y - 7, .8, 1.4 + Math.sin(f.t * 12 + k) * .3, 0, 0, TAU); c.fill(); }
    c.fillStyle = '#ffd36b'; for (let k = 0; k < 5; k++) { const vx = x + 3 + k * (w - 6) / 4; c.beginPath(); c.moveTo(vx - 1, y + 4); c.lineTo(vx, y + 7); c.lineTo(vx + 1, y + 4); c.fill(); }
  };
  amplia('vitral', 190, b => {
    const CAND = (sube) => ({ k: 'candelabro', look: 'candelabro', sube });
    // I · el vidrio resbala; la primera campana
    b.g(0, 13).P(3).d('T', 8);
    b.p(15, 10, 4).p(21, 9, 4).c(15, 24, 7);
    b.g(27, 47).e(33, undefined, 'escarabajo').e(42, undefined, 'campana').d('T', 30).d('f', 45);
    b.g(48, 56, 6).c(49, 55, 4);
    // II · gárgolas: si se encierra una en vidrio a medio vuelo, queda un bloque en el aire para llegar arriba
    b.g(57, 62).e(60, 3, 'gargola');
    b.p(66, 10, 3).p(71, 8, 3).c(64, 74, 4);
    b.g(75, 92).e(80, 4, 'gargola').e(86, undefined, 'campana').blk(83, 8, 2, 3).d('f', 90);
    // III · el candelabro sube hasta el coro; arriba, campanas
    b.g(95, 104).p(100, 9, 3, CAND(96)).g(105, 124, 4).e(116, undefined, 'campana').c(112, 122, 2).d('T', 97);
    // IV · la nave central: gárgolas, el último candelabro y la puerta
    b.g(125, 140).e(130, 3, 'gargola').e(136, undefined, 'iguana');
    b.p(143, 10, 4).p(149, 9, 4).p(155, 10, 4).c(143, 158, 7);
    b.g(160, 189).p(166, 9, 3, CAND(64)).blk(171, 6, 4, 5).e(178, undefined, 'campana').e(176, 3, 'gargola').h(182, 9).Gl(186).d('T', 162);
  });
  NIVELES.vitral.fauna = ['escarabajo', 'gargola', 'campana', 'iguana'];
  NIVELES.vitral.lema = 'Vidrio resbaloso, gárgolas que se lanzan desde su ménsula (encerradas en vidrio son un bloque en el aire), campanas que repican y candelabros que suben hasta el coro.';

  // =================================================================
  //  CUADERNO · Garabatos del cuaderno (Fresita dibuja líneas de lápiz)
  // =================================================================
  // goma: camina y da brinquitos; las líneas de lápiz que toca se borran rapidísimo
  FOE.goma = { beh: 'goma', w: 12, h: 8, v: 26 };
  BEH.goma = (e, g, d) => {
    e.borra = false;
    for (const pl of lineas(g)) if (distSeg(e.x, e.y - 4, pl.x, pl.y, pl.x2, pl.y2) < 22) { pl.life = Math.min(pl.life ?? 7, 7) - d * 3.2; e.borra = true; if (Math.random() < .3) spawn(g, 1, e.x, e.y - 6, { v: 30, life: .4, s: 1.2, k: 'dust', cols: ['#e8a0a0', '#ffffff'] }); }
    if (e.vy !== 0 || !onGround(e)) { gravity(e, d); return; }
    walkStep(e, d, e.v); e.cd = (e.cd ?? 2) - d; if (e.cd <= 0) { e.cd = 2.6; e.vy = -210; e.y -= 1; }
  };
  // sacapuntas: gira la manivela y avienta virutas en arco; las líneas de Fresita las detienen
  FOE.sacapuntas = { beh: 'sacapuntas', w: 12, h: 10, v: 0 };
  BEH.sacapuntas = (e, g, d, toP) => {
    const p = g.p; e.dir = Math.sign(toP) || e.dir; e.tt = (e.tt ?? 1.8) - d; e.carga = e.tt < .5; e.gira = (e.gira || 0) + d * (e.carga ? 14 : 3);
    if (e.tt <= 0) { e.tt = 2.4; if (Math.abs(toP) < 170) { const tt = .8, sx = e.x + e.dir * 6, sy = e.y - 7; g.objs.push({ k: 'viruta', x: sx, y: sy, vx: (p.x - sx) / tt, vy: ((p.y - 8 - sy) - .5 * 400 * tt * tt) / tt, t: 0, rot: 0 }); } }
  };
  OBJ.viruta = {
    step(o, g, dt) {
      o.t += dt; o.vy += 400 * dt; const oy = o.y; o.x += o.vx * dt; o.y += o.vy * dt; o.rot += dt * 12;
      const fin = () => { o.dead = true; spawn(g, 6, o.x, o.y, { v: 40, life: .4, s: 1.4, k: 'dust', cols: ['#e8b880', '#2a4ab0'] }); };
      if (o.t > 3 || o.y > VH + 20 || SOLID(o.x, o.y)) { fin(); return; }
      for (const pl of lineas(g)) { if (o.x < Math.min(pl.x, pl.x2) || o.x > Math.max(pl.x, pl.x2)) continue; const yl = platTop(pl, o.x); if ((oy - yl) * (o.y - yl) <= 0) { fin(); return; } }
      if (tocaItzel(g, o.x - 2, o.y - 2, o.x + 2, o.y + 2)) { o.dead = true; MEC.hurt(g, o.vx > 0 ? 1 : -1); }
    },
    draw(c, o) { c.save(); c.translate(o.x, o.y); c.rotate(o.rot); c.strokeStyle = '#c89060'; c.lineWidth = 1.2; c.beginPath(); for (let k = 0; k < 14; k++) { const a = k * .55, r = .4 + k * .17; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.stroke(); c.strokeStyle = '#2a4ab0'; c.lineWidth = .5; c.stroke(); c.restore(); },
  };
  // La barrera encierra a Itzel sin impedir que las abejas entren volando.
  ZONAS.refugioAbejas = {
    paso(z, g) {
      const p = g.p, margen = (p.w || 10) / 2;
      if (p.x < z.x0 + margen) { p.x = z.x0 + margen; p.vx = Math.max(0, p.vx); }
      if (p.x > z.x1 - margen) { p.x = z.x1 - margen; p.vx = Math.min(0, p.vx); }
    },
    pinta(c, z, f) {
      c.save(); c.strokeStyle = 'rgba(42,74,176,.65)'; c.lineWidth = 1; c.setLineDash([3, 3]);
      for (const x of [z.x0, z.x1]) { c.beginPath(); c.moveTo(x, z.base); c.lineTo(x, z.base - (z.alto || 110)); c.stroke(); }
      c.restore();
    },
  };
  // Un enjambre persigue a Itzel; los trazos del lápiz detienen físicamente a cada abeja.
  // Cada nivel trae UNA de estas 10 variantes del refugio, al azar (?refugio=1…10 la fija): cambia dónde están las colmenas,
  // qué tan separados y altos son los postes (los altos son paredes de un hoyo), cuántas oleadas vienen, de dónde y qué tan rápidas.
  // Las colmenas son relativas al centro de la sección y los postes a donde esté Itzel al empezar.
  const REFUGIOS = [
    { nombre: 'El refugio clásico', aviso: 8, postes: [{ dx: -32, alto: 14 }, { dx: 32, alto: 14 }], colmenas: [{ dx: -100, dy: 58 }, { dx: 100, dy: 58 }], oleadas: [{ n: 6, vel: 48, t: 6, de: [0] }, { n: 9, vel: 58, t: 6, de: [0, 1] }] },
    { nombre: 'El hoyo hondo', aviso: 9, postes: [{ dx: -26, alto: 38 }, { dx: 26, alto: 38 }], colmenas: [{ dx: -90, dy: 96 }], oleadas: [{ n: 10, vel: 52, t: 7, de: [0] }] },
    { nombre: 'Dos colmenas', aviso: 8, postes: [{ dx: -44, alto: 14 }, { dx: 44, alto: 14 }], colmenas: [{ dx: -110, dy: 50 }, { dx: 110, dy: 50 }], oleadas: [{ n: 5, vel: 50, t: 6, de: [0, 1] }, { n: 8, vel: 58, t: 6, de: [0, 1] }] },
    { nombre: 'La colmena alta', aviso: 9, postes: [{ dx: -36, alto: 26 }, { dx: 36, alto: 26 }], colmenas: [{ dx: 80, dy: 108 }], oleadas: [{ n: 12, vel: 44, t: 8, de: [0] }] },
    { nombre: 'El pasillo', aviso: 7, postes: [{ dx: -20, alto: 14 }, { dx: 20, alto: 14 }], colmenas: [{ dx: -100, dy: 40 }, { dx: 100, dy: 40 }], oleadas: [{ n: 4, vel: 62, t: 4, de: [0] }, { n: 4, vel: 66, t: 4, de: [1] }, { n: 6, vel: 70, t: 4, de: [0, 1] }] },
    { nombre: 'El refugio ancho', aviso: 10, postes: [{ dx: -62, alto: 14 }, { dx: 62, alto: 14 }], colmenas: [{ dx: -120, dy: 70 }], oleadas: [{ n: 14, vel: 40, t: 8, de: [0] }] },
    { nombre: 'La torre', aviso: 9, postes: [{ dx: -34, alto: 54 }, { dx: 30, alto: 14 }], colmenas: [{ dx: 110, dy: 60 }], oleadas: [{ n: 8, vel: 50, t: 6, de: [0] }, { n: 10, vel: 56, t: 6, de: [0] }] },
    { nombre: 'La colmena que se mueve', aviso: 8, postes: [{ dx: -36, alto: 18 }, { dx: 36, alto: 18 }], colmenas: [{ dx: 0, dy: 100, mueve: 80 }], oleadas: [{ n: 10, vel: 50, t: 8, de: [0] }] },
    { nombre: 'Tres colmenas', aviso: 8, postes: [{ dx: -40, alto: 20 }, { dx: 40, alto: 20 }], colmenas: [{ dx: -110, dy: 45 }, { dx: 0, dy: 112 }, { dx: 110, dy: 45 }], oleadas: [{ n: 3, vel: 46, t: 5, de: [0, 1, 2] }, { n: 5, vel: 52, t: 5, de: [0, 1, 2] }, { n: 7, vel: 58, t: 5, de: [0, 1, 2] }] },
    { nombre: 'La lluvia de abejas', aviso: 8, postes: [{ dx: -50, alto: 30 }, { dx: 50, alto: 30 }], colmenas: [{ dx: -30, dy: 122 }, { dx: 30, dy: 122 }], oleadas: [{ n: 14, vel: 60, t: 6, de: [0, 1] }] },
  ];
  // una sola oleada por refugio (se juntan las abejas de las oleadas de cada variante)
  for (const r of REFUGIOS) { const o = r.oleadas; r.oleadas = [{ n: o.reduce((a, w) => a + w.n, 0), vel: Math.max(...o.map(w => w.vel)), de: [...new Set(o.flatMap(w => w.de))], t: Math.max(9, o.reduce((a, w) => a + w.n, 0) * .3 + 5) }]; }
  OBJ.enjambreCuaderno = {
    make(g, en) {
      // las piezas del nivel repetían la sección varias veces: ahora solo hay un refugio por nivel (el primero que se arma)
      if (g.objs.some(q => q.k === 'enjambreCuaderno')) return;
      const x = tx(en.x), base = L.surfaceY(en.x + PAD, 0) * T;
      const pedida = Number(new URLSearchParams(location.search).get('refugio')), v = pedida >= 1 && pedida <= REFUGIOS.length ? pedida - 1 : Math.floor(Math.random() * REFUGIOS.length);
      g.objs.push({ k: 'enjambreCuaderno', x, base, variante: v, cfg: REFUGIOS[v], fase: 'espera', tiempo: 0, abejas: [], t: 0 });
    },
    colmena(o, i) { const h = o.cfg.colmenas[i]; return { x: o.x + h.dx + (h.mueve ? Math.sin(o.t * .9) * h.mueve : 0), y: o.base - h.dy }; },
    step(o, g, dt) {
      const p = g.p, cfg = o.cfg; o.t += dt;
      if (o.fase === 'espera') {
        if (Math.abs(p.x - o.x) < 65 && Math.abs(p.y - o.base) < 70) {
          o.fase = 'aviso'; o.tiempo = cfg.aviso; o.oleada = 1; o.golpes = 0;
          const ancho = Math.max(...cfg.postes.map(q => Math.abs(q.dx))) + 33;
          o.zona = { k: 'refugioAbejas', x0: p.x - ancho, x1: p.x + ancho, base: o.base, t: 0, alto: Math.max(110, ...cfg.postes.map(q => q.alto + 40)) };
          g.zones.push(o.zona);
          o.postes = cfg.postes.map(q => { const poste = { k: 'posteAbejas', x: p.x + q.dx - 4, y: o.base - q.alto, w: 8, h: q.alto, on: true }; g.solids.push(poste); return poste; });
          if (typeof toast === 'function') toast(`${cfg.nombre}: ${cfg.oleadas.length === 1 ? 'una oleada' : cfg.oleadas.length + ' oleadas'}. Dibuja un refugio y sujétalo a los postes rojos`, 8000);
        }
        return;
      }
      if (o.fase === 'terminado') return;
      // El refugio no caduca durante la prueba, aunque se dibuje al empezar el aviso.
      for (const pl of g.plats) if (pl.trazoLapiz && pl.life !== undefined && pl.x2 >= o.zona.x0 && pl.x <= o.zona.x1) pl.life = Math.max(pl.life, 2);
      o.tiempo -= dt;
      const ola = cfg.oleadas[o.oleada - 1];
      if (o.fase === 'aviso' || o.fase === 'descanso') {
        if (o.tiempo <= 0) {
          o.fase = 'ataque'; o.tiempo = ola.t;
          o.abejas = Array.from({ length: ola.n }, (_, i) => {
            const h = OBJ.enjambreCuaderno.colmena(o, ola.de[i % ola.de.length]);
            return { x: h.x, y: h.y + (i % 3 - 1) * 5, espera: i * .3, fase: i * 1.7 };
          });
        }
        return;
      }
      if (o.tiempo <= 0) {
        o.abejas = [];
        if (o.oleada < cfg.oleadas.length) { o.oleada++; o.fase = 'descanso'; o.tiempo = 3; if (typeof toast === 'function') toast(o.oleada === cfg.oleadas.length && cfg.oleadas.length > 1 ? '¡La última oleada!' : '¡Otra oleada!', 3000); return; }
        o.fase = 'terminado'; if (o.zona) o.zona.dead = true;
        for (const poste of o.postes || []) { poste.on = false; poste.dead = true; }
        if (!o.golpes) { RUN.coins += 3; if (typeof toast === 'function') toast('¡Refugio perfecto! Ganaron 3 canisteles', 3000); }
        else if (typeof toast === 'function') toast('¡Las abejas se fueron!');
        return;
      }
      const barreras = g.plats.filter(pl => pl.trazoLapiz && !pl.dead);
      const empujados = new Set();
      for (const abeja of o.abejas) {
        if (abeja.espera > 0) { abeja.espera -= dt; continue; }
        abeja.fase += dt * 8;
        const dx = p.x - abeja.x, dy = p.y - p.h * .55 - abeja.y, d = Math.hypot(dx, dy) || 1;
        const velocidad = ola.vel, nx = abeja.x + dx / d * velocidad * dt, ny = Math.min(o.base - 3, abeja.y + dy / d * velocidad * dt + Math.sin(abeja.fase) * 8 * dt);
        // La distancia al segmento y el cruce entre trayectorias impiden atravesar trazos finos.
        const barrera = barreras.find(pl => {
          if (distSeg(nx, ny, pl.x, pl.y, pl.x2, pl.y2) < 2.6) return true;
          const cruz = (ax, ay, bx, by, cx, cy) => (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
          const a = cruz(abeja.x, abeja.y, nx, ny, pl.x, pl.y), b = cruz(abeja.x, abeja.y, nx, ny, pl.x2, pl.y2);
          const c = cruz(pl.x, pl.y, pl.x2, pl.y2, abeja.x, abeja.y), d2 = cruz(pl.x, pl.y, pl.x2, pl.y2, nx, ny);
          return a * b < 0 && c * d2 < 0;
        });
        if (barrera) empujados.add(barrera.trazoLapiz);
        if (!barrera && !SOLID(nx, ny)) { abeja.x = nx; abeja.y = ny; }
        if (Math.hypot(p.x - abeja.x, p.y - p.h * .55 - abeja.y) < 7) { const vida = RUN.hearts; MEC.hurt(g, Math.sign(p.x - abeja.x) || 1); if (RUN.hearts < vida) o.golpes++; }
      }
      for (const id of empujados) {
        const partes = barreras.filter(pl => pl.trazoLapiz === id);
        const sujeto = partes.some(pl => (o.postes || []).some(poste => distSeg(poste.x + poste.w / 2, poste.y, pl.x, pl.y, pl.x2, pl.y2) < 7));
        if (sujeto) continue;
        const subida = 25 * dt;
        for (const pl of partes) { pl.y -= subida; pl.y2 -= subida; pl.y0 -= subida; }
        if (g.trazoLapiz && g.trazoLapiz.id === id) g.trazoLapiz.y -= subida;
      }
    },
    draw(c, o, f) {
      const cfg = o.cfg, altoMax = Math.max(0, ...cfg.postes.map(q => q.alto - 14));
      for (const poste of o.postes || []) if (poste.on) {
        c.save(); c.fillStyle = '#d9a75d'; c.strokeStyle = '#493b30'; c.lineWidth = .8; c.fillRect(poste.x, poste.y, poste.w, poste.h); c.strokeRect(poste.x, poste.y, poste.w, poste.h);
        c.fillStyle = '#ed4e61'; c.beginPath(); c.arc(poste.x + poste.w / 2, poste.y, 3.2, 0, TAU); c.fill(); c.stroke(); c.restore();
      }
      cfg.colmenas.forEach((h, i) => {
        const pos = OBJ.enjambreCuaderno.colmena(o, i);
        c.save(); c.translate(pos.x, pos.y);
        c.strokeStyle = '#78511e'; c.fillStyle = '#f4c64b'; c.lineWidth = 1; c.beginPath(); c.ellipse(0, 0, 9, 10, 0, 0, TAU); c.fill(); c.stroke();
        c.beginPath(); for (let y = -5; y <= 5; y += 4) { c.moveTo(-7, y); c.lineTo(7, y); } c.stroke(); c.fillStyle = '#49351f'; c.beginPath(); c.ellipse(1, 3, 2, 2.8, 0, 0, TAU); c.fill(); c.restore();
      });
      if (o.fase === 'aviso' || o.fase === 'ataque' || o.fase === 'descanso') {
        c.save(); c.font = 'bold 6px "Alegreya Sans", sans-serif'; c.textAlign = 'center'; c.lineWidth = 2.4; c.strokeStyle = '#fff9e8'; c.fillStyle = '#653624';
        const msg = o.fase === 'aviso' ? '¡Une el dibujo a un poste! ' + Math.ceil(o.tiempo) : o.fase === 'descanso' ? '¡Repara el refugio! ' + Math.ceil(o.tiempo) : (cfg.oleadas.length > 1 ? 'Oleada ' + o.oleada + '/' + cfg.oleadas.length + ' · ' : '') + '¡Resiste! ' + Math.ceil(o.tiempo);
        c.strokeText(msg, f.g.p.x, o.base - 78 - altoMax); c.fillText(msg, f.g.p.x, o.base - 78 - altoMax); c.restore();
      }
      for (const a of o.abejas) if (a.espera <= 0) {
        c.save(); c.translate(a.x, a.y); c.fillStyle = '#fffdf1'; c.beginPath(); c.ellipse(-1, -3, 2.5, 1.6, -.5, 0, TAU); c.ellipse(2, -3, 2.5, 1.6, .5, 0, TAU); c.fill();
        c.fillStyle = '#f4c837'; c.strokeStyle = '#4a3425'; c.lineWidth = .5; c.beginPath(); c.ellipse(0, 0, 3.8, 2.5, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#4a3425'; c.fillRect(-1.8, -2.2, 1, 4.4); c.fillRect(.7, -2.2, 1, 4.4); c.restore();
      }
    },
  };
  // regla: parada junto a un barranco; Itzel la empuja y cae como puente
  OBJ.regla = {
    make(g, en) {
      const n = en.n || 6, dir = en.dir || 1, px = tx(en.x) + 8, base = L.surfaceY(en.x + PAD, 0) * T;
      const s = { k: 'regla', x: px - 4, y: base - n * T, w: 8, h: n * T, on: true }; g.solids.push(s);
      g.objs.push({ k: 'regla', s, n, dir, px, base, ang: 0, empuje: 0, fase: 'parada' });
    },
    step(o, g, dt) {
      const p = g.p, s = o.s;
      if (o.fase === 'parada') {
        const pega = p.on && p.face === o.dir && Math.abs((p.x + o.dir * p.w / 2) - (o.dir > 0 ? s.x : s.x + s.w)) < 3 && p.y > s.y + 4;
        o.empuje = pega ? o.empuje + dt : Math.max(0, o.empuje - dt); o.tiembla = o.empuje > 0;
        if (o.empuje > .35) { o.fase = 'cae'; s.on = false; }
      } else if (o.fase === 'cae') {
        o.v = (o.v || 0) + 7 * dt; o.ang = Math.min(Math.PI / 2, o.ang + o.v * dt);
        if (o.ang >= Math.PI / 2) { o.fase = 'puente'; const L2 = o.n * T; Object.assign(s, { x: o.dir > 0 ? o.px : o.px - L2, y: o.base - 5, w: L2, h: 6, on: true }); g.shake = Math.max(g.shake || 0, .15); spawn(g, 14, o.px + o.dir * L2, o.base - 2, { v: 60, life: .5, s: 1.6, k: 'dust', cols: ['#ffffff', '#2a4ab0'] }); }
      }
    },
    draw(c, o, f) {
      const L2 = o.n * T, sh = o.tiembla ? (Math.random() - .5) * .8 : 0;
      c.save(); c.translate(o.px + sh, o.fase === 'puente' ? o.base - 2 : o.base); c.rotate(o.dir * (o.fase === 'puente' ? Math.PI / 2 : o.ang));
      c.fillStyle = '#f2d27a'; c.fillRect(-4, -L2, 8, L2); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-4, -L2, 2, L2); c.strokeStyle = '#2a4ab0'; c.lineWidth = .6; c.strokeRect(-4, -L2, 8, L2);
      c.strokeStyle = '#3a3a42'; c.lineWidth = .35; for (let k = 0; k < L2; k += 2) { c.beginPath(); c.moveTo(4, -k); c.lineTo(4 - (k % 10 === 0 ? 3 : 1.5), -k); c.stroke(); }
      c.fillStyle = '#3a3a42'; c.font = '3px "Alegreya Sans", sans-serif'; for (let k = 10; k < L2; k += 10) c.fillText(String(k / 10), -3, -k + 1);
      c.restore();
    },
  };
  amplia('cuaderno', 190, b => {
    const L2 = (x0, y0, x1, y1) => [x0, y0, x1 - x0, { x2: x1, y2: y1 }];
    // I · líneas de lápiz y la primera goma
    b.g(0, 13).P(3).d('T', 8);
    b.c(15, 27, 6);   // (sin las líneas azules del nivel: el hueco se cruza con la tinta de Fresita)
    b.g(30, 46).e(35, undefined, 'garabato').e(42, undefined, 'goma').d('f', 33);
    b.c(49, 61, 8);
    // II · el sacapuntas y la regla: empújala para tener puente
    b.g(63, 80).e(69, undefined, 'sacapuntas').e(76, undefined, 'goma').o('regla', 80, 0, { n: 7, dir: 1 }).d('T', 66);
    // Una pausa en el muelle de papel: dibuja un refugio antes de que salga el enjambre.
    b.g(88, 104).o('enjambreCuaderno', 96, 0).d('f', 102);
    // III · la hoja en blanco: dibuja el camino; gomas y chapulines lo complican
    b.c(106, 118, 6);
    b.g(119, 136).e(124, undefined, 'goma').e(130, undefined, 'chapulin').o('regla', 136, 0, { n: 6, dir: 1 }).d('f', 121);
    // IV · el muro del margen y la última hoja
    b.g(143, 160).e(148, undefined, 'sacapuntas').blk(154, 6, 2, 5).e(158, undefined, 'goma').c(154, 155, 4);
    b.c(162, 174, 6);
    b.g(176, 189).h(179, 9).Gl(185).d('T', 182);
  });
  NIVELES.cuaderno.fauna = ['garabato', 'goma', 'sacapuntas', 'chapulin'];
  NIVELES.cuaderno.lema = 'Líneas de lápiz para caminar, gomas que borran lo que dibuja Fresita, sacapuntas que avientan virutas y reglas que se empujan para hacer puente.';

  // =================================================================
  //  GRABADO · Talla de madera (la gubia de Fresita quita la madera)
  // =================================================================
  // catrín (a la Posada): camina muy propio y avienta su sombrero de copa como bumerán
  FOE.catrin = { beh: 'catrin', w: 10, h: 16, v: 20 };
  BEH.catrin = (e, g, d, toP) => {
    if (e.vy !== 0 || !onGround(e)) { gravity(e, d); return; }
    if (e.conSombrero === undefined) e.conSombrero = true;
    e.cd = (e.cd ?? 2) - d; e.lanza = Math.max(0, (e.lanza || 0) - d);
    if (e.conSombrero && e.cd <= 0 && Math.abs(toP) < 130 && Math.abs(g.p.y - e.y) < 30) { e.dir = Math.sign(toP) || e.dir; e.conSombrero = false; e.lanza = .3; g.objs.push({ k: 'sombrero', x: e.x + e.dir * 6, y: e.y - 16, vx: e.dir * 130, dueno: e, t: 0 }); e.cd = 3; return; }
    if (e.conSombrero) walkStep(e, d, e.v);
  };
  OBJ.sombrero = {
    step(o, g, dt) {
      const e = o.dueno; o.t += dt; if (e.st === 'gone') { o.dead = true; return; }
      if (o.t < .75) o.x += o.vx * dt * (1 - o.t / .75 * .6);
      else { const dx = e.x - o.x, dy = (e.y - 16) - o.y, dd = Math.hypot(dx, dy) || 1; o.x += dx / dd * 140 * dt; o.y += dy / dd * 140 * dt; if (dd < 6 || o.t > 4) { o.dead = true; e.conSombrero = true; return; } }
      if (tocaItzel(g, o.x - 4, o.y - 4, o.x + 4, o.y + 2)) MEC.hurt(g, o.x < g.p.x ? 1 : -1);
    },
    draw(c, o, f) { c.save(); c.translate(o.x, o.y); c.scale(Math.cos(f.t * 14), 1); c.fillStyle = '#1f1a1c'; c.fillRect(-2.6, -5, 5.2, 5); c.fillRect(-4.4, -.6, 8.8, 1.4); c.fillStyle = '#b3342b'; c.fillRect(-2.6, -1.8, 5.2, .9); c.strokeStyle = '#efe5cf'; c.lineWidth = .3; c.strokeRect(-2.6, -5, 5.2, 5); c.restore(); },
  };
  // carcoma: vive dentro de los bloques de madera y se asoma a morder cuando Itzel pasa; si Fresita talla su bloque, se va
  FOE.carcoma = { beh: 'carcoma', w: 8, h: 6, v: 0 };
  BEH.carcoma = (e, g, d) => {
    const p = g.p;
    if (e.hogar === undefined) e.hogar = g.solids.find(s => s.k === 'wood' && e.hx >= s.x && e.hx < s.x + s.w && e.hy - 3 >= s.y && e.hy - 3 < s.y + s.h) || null;
    const h = e.hogar;
    if (!h || h.dead) { e.fuera = true; if (e.vy !== 0 || !onGround(e)) { gravity(e, d); return; } e.huye = (e.huye || 0) + d; walkStep(e, d, 40); if (e.huye > 2.5) { e.st = 'gone'; e.tt = 0; } return; }
    const cx = h.x + h.w / 2, lado = p.x < cx ? -1 : 1, cerca = Math.abs(p.x - cx) < 46 && p.y > h.y - 6 && p.y - p.h < h.y + h.h + 4;
    const meta = cerca ? (lado < 0 ? h.x - 5 : h.x + h.w + 5) : cx;
    e.dir = lado; e.x += clamp(meta - e.x, -70 * d, 70 * d); e.y = e.hy;
    e.fuera = e.x < h.x || e.x > h.x + h.w;
  };
  // rodillo de entintar: rueda de un lado a otro por el piso; arriba se puede viajar, de lado empuja y lastima
  OBJ.rodillo = {
    make(g, en) { const pl = mkPlat({ k: 'move', path: 'h', look: 'rodillo', x: tx(en.x), y: tl(en.y), w: 2 * T, amp: (en.amp || 3) * T, sp: en.sp || .8 }); pl.base = L.surfaceY(en.x + PAD, en.y) * T; g.plats.push(pl); g.objs.push({ k: 'rodillo', pl }); },
    step(o, g) { const pl = o.pl; if (tocaItzel(g, pl.x + 2, pl.y + 5, pl.x + pl.w - 2, pl.base)) MEC.hurt(g, g.p.x < pl.x + pl.w / 2 ? -1 : 1); },
    draw() {},
  };
  LOOK.rodillo = (c, pl, f) => {
    const x = pl.x, y = pl.y, w = pl.w, h = (pl.base || y + 32) - y, r = h / 2, giro = pl.x * .25;
    c.fillStyle = '#efe5cf'; c.fillRect(x + w / 2 - .8, y - 6, 1.6, 6); c.fillRect(x + 2, y - 7, w - 4, 1.6);
    c.save(); c.beginPath(); roundRect(c, x, y, w, h, r * .9); c.clip();
    const gr = c.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#5a5458'); gr.addColorStop(.25, '#1f1a1c'); gr.addColorStop(1, '#0a0809'); c.fillStyle = gr; c.fillRect(x, y, w, h);
    c.strokeStyle = 'rgba(239,229,207,.35)'; c.lineWidth = .6; for (let k = 0; k < 6; k++) { const yy = y + ((k * h / 6 + giro) % h); c.beginPath(); c.moveTo(x, yy); c.lineTo(x + w, yy); c.stroke(); }
    c.restore(); c.strokeStyle = '#efe5cf'; c.lineWidth = .8; c.beginPath(); roundRect(c, x, y, w, h, r * .9); c.stroke();
    c.fillStyle = '#b3342b'; c.beginPath(); c.arc(x + w / 2, y + h / 2, 2, 0, TAU); c.fill();
  };
  amplia('grabado', 190, b => {
    const rueda = (x, y, amp = 40) => { for (const ph of [0, 2.09, 4.19]) b.p(x, y, 3, { ph, amp }); };
    // I · las ruedas de tablas y el primer catrín
    b.g(0, 15).P(3).d('T', 8);
    rueda(20, 8); b.c(18, 24, 4);
    b.g(26, 44).e(32, undefined, 'catrin').e(40, undefined, 'calavera').d('T', 29);
    // II · madera con carcomas: tallar el bloque las saca de su casa
    b.g(45, 66).s('wood', 48, 6, 2, 5).e(48, 9, 'carcoma').s('wood', 57, 8, 1, 3).e(57, 10, 'carcoma').c(51, 55, 9).d('f', 62);
    b.g(67, 68); rueda(73, 8); b.c(71, 77, 4);
    // III · el taller: rodillos de entintar que van y vienen, y más catrines
    b.g(79, 104).o('rodillo', 84, 9, { amp: 3, sp: .7 }).e(92, undefined, 'catrin').o('rodillo', 98, 9, { amp: 3, sp: .9 }).d('T', 89);
    b.g(105, 124).s('wood', 108, 5, 2, 6).e(108, 9, 'carcoma').s('wood', 116, 5, 2, 6).e(116, 8, 'carcoma').c(111, 114, 8);
    // IV · la prensa grande hasta la puerta del taller
    b.g(125, 126); rueda(130, 8, 44); b.c(127, 134, 4);
    b.g(137, 189).o('rodillo', 142, 9, { amp: 3 }).e(150, undefined, 'catrin').s('wood', 156, 4, 2, 7).e(156, 8, 'carcoma').e(164, undefined, 'jabali').s('wood', 170, 6, 1, 5).o('rodillo', 176, 9, { amp: 2, sp: 1.1 }).h(160, 9).Gl(185).d('T', 182);
  });
  NIVELES.grabado.fauna = ['calavera', 'catrin', 'carcoma', 'jabali'];
  NIVELES.grabado.lema = 'Ruedas de tablas, muros de madera con carcomas adentro, catrines que avientan su sombrero y rodillos de entintar.';

  // =================================================================
  //  GAME BOY · Interruptores verdes (bloques A y B)
  // =================================================================
  // aplastador: un bloque con cara que espera arriba y se deja caer sobre Itzel; los bloques A o B lo detienen
  FOE.aplastador = { beh: 'aplastador', w: 16, h: 16, v: 0, spiky: () => true };
  BEH.aplastador = (e, g, d) => {
    const p = g.p; e.fase = e.fase || 'arriba';
    if (e.fase === 'arriba') { e.y = e.hy; if (Math.abs(p.x - e.x) < 16 && p.y > e.y) { e.fase = 'tiembla'; e.tt2 = .35; } }
    else if (e.fase === 'tiembla') { e.tt2 -= d; e.jit = (Math.random() - .5) * 1.4; if (e.tt2 <= 0) { e.fase = 'cae'; e.vy2 = 0; e.jit = 0; } }
    else if (e.fase === 'cae') {
      e.vy2 += 900 * d; const ny = e.y + e.vy2 * d;
      if (SOLID(e.x - 6, ny) || SOLID(e.x + 6, ny)) { e.y = Math.min(SOLID(e.x - 6, ny) ? borde(e.x - 6, ny, 'arriba') : 1e9, SOLID(e.x + 6, ny) ? borde(e.x + 6, ny, 'arriba') : 1e9); e.fase = 'abajo'; e.tt2 = 1; g.shake = Math.max(g.shake || 0, .18); spawn(g, 10, e.x, e.y, { v: 60, life: .4, s: 1.6, k: 'dust', cols: ['#9bbc0f', '#306230'] }); }
      else if (ny > VH + 30) { e.y = e.hy; e.fase = 'arriba'; } else e.y = ny;
    }
    else if (e.fase === 'abajo') { e.tt2 -= d; if (e.tt2 <= 0) e.fase = 'sube'; }
    else { e.y -= 30 * d; if (e.y <= e.hy) { e.y = e.hy; e.fase = 'arriba'; } }
  };
  // cuadrito: un bichito de su letra (A o B); cuando su letra se prende, se vuelve bloque y se puede pisar
  FOE.cuadrito = { beh: 'cuadrito', w: 12, h: 12, v: 22 };
  BEH.cuadrito = (e, g, d) => { if (e.vy !== 0 || !onGround(e)) { gravity(e, d); return; } walkStep(e, d, e.v); };
  OBJ.cuadrito = {
    make(g, en) {
      const x = tx(en.x) + T / 2, y = L.surfaceY(en.x + PAD, 0) * T, e = Object.assign(MEC.mkFoe('cuadrito', x, y), { grp: en.grp || 'A', sinVidrio: true });
      e.bloque = { k: 'cuadrito', x: x - 8, y: y - 16, w: 16, h: 16, on: false, grp: e.grp }; g.solids.push(e.bloque); g.foes.push(e);
      if (!g._vigiaCuadrito) { g._vigiaCuadrito = true; g.objs.push({ k: 'cuadritos' }); }
    },
  };
  OBJ.cuadritos = {
    step(o, g) {
      for (const e of g.foes) {
        if (e.k !== 'cuadrito') continue; const b = e.bloque, on = (e.grp === 'A') !== g.sw;
        if (on && e.st === 'ok' && freeOf(g, e.x - 8, e.y - 16, 16, 16)) { e.st = 'glass'; e.tt = 1e9; e.solid = b; Object.assign(b, { x: e.x - 8, y: e.y - 16, on: true }); ring(g, e.x, e.y - 8, '#9bbc0f', 14, .3); }
        else if (!on && e.st === 'glass') { e.st = 'ok'; e.tt = 0; b.on = false; }
        if (b.dead) { b.dead = false; if (!g.solids.includes(b)) g.solids.push(b); }
      }
    },
    draw() {},
  };
  // botón de piso: al pisarlo cambia los bloques A y B (aunque Fresita no quiera)
  OBJ.boton = {
    make(g, en) { const x = tx(en.x) + 8, y = L.surfaceY(en.x + PAD, 0) * T; g.objs.push({ k: 'boton', x, y, abajo: 0 }); },
    step(o, g, dt) {
      const p = g.p, encima = p.on && Math.abs(p.x - o.x) < 7 && Math.abs(p.y - (o.y - 2)) < 4;
      if (encima && !o.pisado) { const want = !g.sw; if (!g.solids.some(s => s.k === 'switch' && ((s.grp === 'A') !== want) && !freeOf(g, s.x, s.y, s.w, s.h))) { g.sw = want; ring(g, o.x, o.y - 3, '#9bbc0f', 24); } o.abajo = .25; }
      o.pisado = encima; o.abajo = Math.max(0, o.abajo - dt);
    },
    draw(c, o, f) {
      const x = Math.round(o.x), y = Math.round(o.y), h = o.abajo > 0 || o.pisado ? 1 : 3, letra = f.g.sw ? 'B' : 'A';
      c.fillStyle = '#0f380f'; c.fillRect(x - 7, y - 2, 14, 2); c.fillRect(x - 6, y - 2 - h - 1, 12, h + 1);
      c.fillStyle = f.g.sw ? '#8bac0f' : '#306230'; c.fillRect(x - 5, y - 2 - h, 10, h); c.fillStyle = '#9bbc0f'; c.fillRect(x - 5, y - 2 - h, 10, 1);
      c.fillStyle = '#0f380f'; c.font = 'bold 5px monospace'; c.textAlign = 'center'; c.fillText(letra, x, y - 4 - h);
    },
  };
})();
