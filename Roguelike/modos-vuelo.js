'use strict';
// =====================================================================
//  SHOOT 'EM UP · Vuelo sobre Edzná (arte de la carta celeste)
//  Itzel pilotea su canoa de estrellas con el teclado (Espacio = embestida)
//  y Fresita dispara estrellas manteniendo el clic; clic derecho = escudo.
//  Más contenido (pedido de David 2026-11-20, «le falta meterle más»):
//   · tres tramos del cielo maya, cada uno con su nombre y sus enemigos:
//     Tzab, el cascabel (las Pléyades) · Las tres piedras del fogón ·
//     Sinan Ek', el alacrán (que espera al final);
//   · la serpiente de estrellas: se le rompen los segmentos uno por uno;
//   · constelaciones: en cada tramo aparecen estrellas numeradas; si Itzel
//     las toca en orden, la constelación se enciende y cae una lluvia de
//     estrellas que le pega a todo lo que hay en pantalla;
//   · combos de derribos que dan canisteles, y corazones de vez en cuando;
//   · el alacrán tiene segunda fase: aguijonazos en columna y crías.
// =====================================================================
MODOS.vuelo = (() => {
  const TRAMOS = [
    { t: 0, n: 'Tzab, el cascabel', sub: 'Las Pléyades: los mayas las veían como el cascabel de una serpiente', figura: [[0, 0], [14, -10], [30, -6], [40, 8], [24, 16]] },
    { t: 20, n: 'Las tres piedras del fogón', sub: 'Tres estrellas de Orión: las piedras donde se encendió el primer fuego', figura: [[0, 10], [18, -12], [36, 10], [18, 2], [0, 10]] },
    { t: 40, n: "Sinan Ek', el alacrán", sub: 'La constelación del Escorpión, como la pintaron los mayas', figura: [[0, -8], [12, 0], [22, 10], [36, 12], [44, 0]] },
  ];
  const DUR = 58;   // segundos antes del alacrán
  const PLAN = [];  // [segundo, tipo, y]
  for (let s = 2; s < DUR; s += 2.1) {
    const tramo = s < 20 ? 0 : s < 40 ? 1 : 2, k = Math.floor(s / 2.1) % 6, y = 40 + ((s * 37) % 150);
    if (tramo === 0) { if (k === 0 || k === 3) for (let i = 0; i < 4; i++) PLAN.push([s + i * .35, 'escorpion', y]); else if (k === 1) PLAN.push([s, 'cometa', null]); else if (k === 4) PLAN.push([s, 'serpiente', y]); else PLAN.push([s, 'estrella', y]); }
    else if (tramo === 1) { if (k === 0) PLAN.push([s, 'meteoro', 60], [s + .4, 'meteoro', 120], [s + .8, 'meteoro', 180]); else if (k === 2 || k === 5) PLAN.push([s, 'cometa', null], [s + .7, 'cometa', null]); else if (k === 3) PLAN.push([s, 'torreta', 50 + ((s * 13) % 130)]); else for (let i = 0; i < 3; i++) PLAN.push([s + i * .4, 'escorpion', y]); }
    else { if (k % 2 === 0) for (let i = 0; i < 5; i++) PLAN.push([s + i * .3, 'escorpion', 40 + ((s * 53 + i * 31) % 150)]); else if (k === 1) PLAN.push([s, 'serpiente', y]); else if (k === 3) PLAN.push([s, 'torreta', 60 + ((s * 17) % 110)]); else PLAN.push([s, 'cometa', null]); }
  }
  PLAN.sort((a, b) => a[0] - b[0]);
  const VIDA = { escorpion: 5, cometa: 2, meteoro: 14, torreta: 11, serpiente: 3, jefe: 150 };   // más vida (antes 3, 1, 9, 7, 2 y 120): el disparo de Fresita es más lento
  function crear(def, st) {
    setLevel(buildLevelFromRows(['.'.repeat(420), '.P' + '.'.repeat(416) + 'G.', '#'.repeat(420)]));
    return { t: 0, win: 0, shake: 0, bubbles: [], parts: [], def, st, inv: 0, plan: PLAN.slice(), enem: [], tiros: [], balas: [], items: [], corazones: [], nivel: 1,
      p: { x: 70, y: VH / 2, vx: 0, vy: 0, dash: 0, cd: 0, face: 1 }, pose: poseItzel(), fre: { x: 120, y: VH / 2 - 20, daze: 0, cd: 0, escudo: 0, escudoCd: 0, disparando: false }, jefe: null, panCam: 0,
      tramo: -1, banner: 0, conste: null, consteHechas: 0, lluvia: 0, combo: 0, comboT: 0, letreros: [], columnas: [] };
  }
  const dice = (j, txt, x, y, col = '#fff3c4') => j.letreros.push({ txt, x, y, t: 0, col });
  const nuevo = (j, tipo, y) => {
    const e = { tipo, x: VW + 20, y: y ?? j.p.y, vida: VIDA[tipo], max: VIDA[tipo], t: 0, y0: y ?? j.p.y, aviso: tipo === 'cometa' ? .8 : 0, dir: -1, anim: 0, st: 'ok', h: 8, w: 16 };
    if (tipo === 'estrella') { j.items.push({ x: VW + 10, y: e.y, t: 0 }); return; }
    if (tipo === 'cometa') { e.y = j.p.y; e.y0 = e.y; }
    if (tipo === 'serpiente') { e.segs = Array.from({ length: 7 }, (_, i) => ({ vida: i === 6 ? 5 : 3, x: e.x, y: e.y })); e.rastro = []; }
    j.enem.push(e);
  };
  // una constelación: cinco estrellas numeradas que bajan despacio; Itzel las toca en orden
  function constelacion(j, k) {
    const T = TRAMOS[k], x0 = VW + 20, y0 = 70 + (k * 41) % 90;
    j.conste = { k, sig: 0, pts: T.figura.map(([dx, dy], i) => ({ x: x0 + dx * 2.2, y: y0 + dy * 2.6, n: i + 1, ok: false })) };
  }
  function derribo(j, e) {
    j.combo = j.comboT > 0 ? j.combo + 1 : 1; j.comboT = 1.8;
    if (j.combo % 5 === 0) { const premio = Math.min(3, j.combo / 5); RUN.coins += premio; dice(j, `¡Combo ×${j.combo}! +${premio}`, e.x, e.y - 14, '#ffe9a0'); }
  }
  function paso(j, dt) {
    j.t += dt; j.inv = Math.max(0, j.inv - dt); j.shake = Math.max(0, j.shake - dt); j.panCam = j.t * 34;
    j.banner = Math.max(0, j.banner - dt); j.lluvia = Math.max(0, j.lluvia - dt); j.comboT = Math.max(0, j.comboT - dt); if (!j.comboT) j.combo = 0;
    const p = j.p, k = teclas(), fr = j.fre;
    // los tramos del cielo: el nombre y su constelación
    const tr = j.jefe ? 2 : TRAMOS.reduce((a, T, i) => j.t >= T.t ? i : a, 0);
    if (tr !== j.tramo && !j.jefe) { j.tramo = tr; j.banner = 3.2; j.consteEn = j.t + 4.5; }
    if (j.consteEn && j.t >= j.consteEn && !j.conste) { constelacion(j, j.tramo); j.consteEn = 0; }
    // Itzel
    const dx = (k.right ? 1 : 0) - (k.left ? 1 : 0), dy = (k.down ? 1 : 0) - (k.up ? 1 : 0), n = Math.hypot(dx, dy) || 1;
    p.cd = Math.max(0, p.cd - dt);
    if (k.space && p.cd <= 0 && !j.spWas) { p.dash = .32; p.cd = 1; p.dx = dx ? dx / n : 1; p.dy = dy / n; chispas(j, p.x, p.y, ['#fff3c4', '#e2c06e'], 10, 60); }
    j.spWas = k.space;
    if (p.dash > 0) { p.dash -= dt; p.x += p.dx * 300 * dt; p.y += p.dy * 300 * dt; }
    else { p.vx += (dx / n * 135 - p.vx) * Math.min(1, dt * 8); p.vy += (dy / n * 135 - p.vy) * Math.min(1, dt * 8); p.x += p.vx * dt; p.y += p.vy * dt; }
    p.x = clamp(p.x, 18, VW * .62); p.y = clamp(p.y, 26, VH - 16); if (dx) p.face = 1;
    // Fresita
    if (MOUSE.active) { fr.x += (MOUSE.x - fr.x) * Math.min(1, dt * 10); fr.y += (MOUSE.y - fr.y) * Math.min(1, dt * 10); }
    for (const c of MOUSE.clicks) { if (c.b === 2 && !c.up) { if (fr.escudoCd <= 0) { fr.escudo = 2; fr.escudoCd = 5; } } else if (c.b === 0) fr.disparando = !c.up; }
    MOUSE.clicks.length = 0;
    fr.daze = Math.max(0, fr.daze - dt); fr.cd -= dt; fr.escudo = Math.max(0, fr.escudo - dt); fr.escudoCd = Math.max(0, fr.escudoCd - dt);
    if (fr.disparando && fr.daze <= 0 && fr.cd <= 0) { fr.cd = .24; const n2 = j.nivel, abre = n2 === 1 ? [0] : n2 === 2 ? [-.12, .12] : n2 === 3 ? [-.2, 0, .2] : [-.28, -.1, .1, .28]; for (const a of abre) j.tiros.push({ x: fr.x + 8, y: fr.y, vx: Math.cos(a) * 330, vy: Math.sin(a) * 330 }); }
    // aparecen enemigos
    while (j.plan.length && j.plan[0][0] <= j.t) { const [, tipo, y] = j.plan.shift(); nuevo(j, tipo, y); }
    if (!j.jefe && j.t > DUR && !j.enem.length) { j.jefe = { tipo: 'jefe', x: VW + 60, y: VH / 2, vida: VIDA.jefe, max: VIDA.jefe, t: 0, ataque: 0, dir: -1, anim: 0, st: 'ok', h: 30, w: 60, fase2: false }; j.enem.push(j.jefe); j.banner = 3.2; if (typeof toast === 'function') toast("¡Sinan Ek', el alacrán de las estrellas!"); }
    // la constelación
    const C = j.conste;
    if (C) {
      for (const q of C.pts) q.x -= 26 * dt;
      const q = C.pts[C.sig];
      if (q && Math.hypot(q.x - p.x, q.y - p.y) < 12) { q.ok = true; C.sig++; chispas(j, q.x, q.y, ['#fff3c4', '#e2c06e', '#ffffff'], 12, 60); if (typeof SONIDO !== 'undefined' && SONIDO.fx) SONIDO.fx('canistel'); }
      if (C.sig >= C.pts.length) {
        // ¡lluvia de estrellas! le pega a todo lo que está en pantalla y borra las balas
        j.lluvia = 1.4; j.consteHechas++; j.nivel = Math.min(4, j.nivel + 1); RUN.coins += 3; j.shake = .3; j.balas = [];
        for (const e of j.enem) if (e.x < VW + 10) { if (e.segs) for (const s of e.segs) s.vida -= 6; e.vida -= e.tipo === 'jefe' ? 8 : 6; e.golpe = .2; }
        dice(j, `¡${TRAMOS[C.k].n} se encendió! Lluvia de estrellas`, VW / 2, 60, '#ffe9a0'); j.consteViva = { k: C.k, pts: C.pts.map(q2 => ({ ...q2 })), t: 0 }; j.conste = null;
      } else if (C.pts[C.pts.length - 1].x < -20 || (C.pts[C.sig] && C.pts[C.sig].x < -10)) { j.conste = null; dice(j, 'Se fue la constelación…', VW / 2, 60, '#c8d0ff'); }
    }
    if (j.consteViva) { j.consteViva.t += dt; for (const q of j.consteViva.pts) q.x -= 26 * dt; if (j.consteViva.t > 3) j.consteViva = null; }
    // enemigos
    for (const e of j.enem) {
      e.t += dt; e.anim += dt; e.golpe = Math.max(0, (e.golpe || 0) - dt);
      if (e.tipo === 'escorpion') { e.x -= 80 * dt; e.y = e.y0 + Math.sin(e.t * 3) * 26; }
      else if (e.tipo === 'cometa') { if (e.aviso > 0) { e.aviso -= dt; e.x = VW + 20; } else e.x -= 330 * dt; }
      else if (e.tipo === 'meteoro') { e.x -= 34 * dt; e.rot = e.t * .8; }
      else if (e.tipo === 'torreta') { e.x = e.t > 9 ? e.x - 120 * dt : Math.max(VW - 60, e.x - 70 * dt); if (e.t > 1.5 && e.t < 8) { e.cd = (e.cd || 0) - dt; if (e.cd <= 0) { e.cd = 1.1; const blanco = Math.random() < .35 ? fr : p, a = Math.atan2(blanco.y - e.y, blanco.x - e.x); j.balas.push({ x: e.x, y: e.y, vx: Math.cos(a) * 95, vy: Math.sin(a) * 95 }); } } }
      else if (e.tipo === 'serpiente') {
        // la cabeza ondula; cada segmento sigue el camino de la cabeza
        e.x -= 62 * dt; e.y = e.y0 + Math.sin(e.t * 2.4) * 34; e.rastro.unshift([e.x, e.y]); if (e.rastro.length > 80) e.rastro.pop();
        e.segs.forEach((s, i) => { const r = e.rastro[Math.min(e.rastro.length - 1, (i + 1) * 5)]; if (r) { s.x = r[0]; s.y = r[1]; } });
        e.segs = e.segs.filter(s => { if (s.vida <= 0) { chispas(j, s.x, s.y, ['#e2c06e', '#fff3c4'], 8, 50); return false; } return true; });
        if (!e.segs.length) e.vida = 0;
        if (e.t % 2.6 < dt && e.x < VW - 20) { const a = Math.atan2(p.y - e.y, p.x - e.x); j.balas.push({ x: e.x, y: e.y, vx: Math.cos(a) * 85, vy: Math.sin(a) * 85 }); }
      }
      else if (e.tipo === 'jefe') {
        e.x = Math.max(VW - 70, e.x - 40 * dt); e.y = VH / 2 + Math.sin(e.t * .8) * 60;
        if (!e.fase2 && e.vida < e.max / 2) { e.fase2 = true; e.ataque = 0; j.shake = .5; dice(j, '¡Sinan Ek\' se enoja! Llama a sus crías', VW / 2, 50, '#ffb0a0'); for (let i = 0; i < 4; i++) j.plan.push([j.t + i * .5, 'escorpion', 50 + i * 40]); j.plan.sort((a, b) => a[0] - b[0]); }
        e.ataque += dt; const ciclo = e.fase2 ? 8 : 6, fase = e.ataque % ciclo;
        if (fase < 2.5) { e.cd = (e.cd || 0) - dt; if (e.cd <= 0) { e.cd = e.fase2 ? .35 : .45; for (let i = -2; i <= 2; i++) { const a = Math.PI + i * .2 + Math.sin(e.t * (e.fase2 ? 2.2 : 1)) * (e.fase2 ? .35 : .1); j.balas.push({ x: e.x - 20, y: e.y, vx: Math.cos(a) * 110, vy: Math.sin(a) * 110 }); } } }
        else if (fase < 3.3) { e.picaY = e.picaY ?? p.y; e.aviso = 1; }
        else if (fase < 3.8) { e.aviso = 0; e.pica = 1; if (Math.abs(p.y - e.picaY) < 9 && j.inv <= 0 && p.dash <= 0) dañoModo(j); }
        else if (e.fase2 && fase >= 4.5 && fase < 4.5 + dt * 1.5) { // aguijonazos en columna: se marcan y luego caen estrellas por ahí
          j.columnas = [0, 1, 2].map(i => ({ x: clamp(p.x + (i - 1) * 46 + (Math.random() - .5) * 20, 20, VW * .66), t: 0 }));
        }
        else { e.pica = 0; e.picaY = null; }
      }
      // choque con Itzel (en embestida, ella gana)
      const pegaEn = (x, y, rx, ry) => Math.abs(x - p.x) < rx && Math.abs(y - p.y) < ry;
      const choca = e.tipo === 'serpiente' ? [e, ...e.segs].some(s => pegaEn(s.x, s.y, 8, 8)) : pegaEn(e.x, e.y, e.tipo === 'jefe' ? 40 : e.tipo === 'meteoro' ? 14 : 10, e.tipo === 'jefe' ? 26 : e.tipo === 'meteoro' ? 14 : 9);
      if (choca) {
        if (p.dash > 0 && e.tipo !== 'jefe') { if (e.segs) e.segs.forEach(s => s.vida -= 2); else e.vida -= 4; e.golpe = .1; chispas(j, e.x, e.y, ['#fff3c4', '#ffffff'], 8, 70); }
        else if (dañoModo(j)) chispas(j, p.x, p.y, ['#ff8080', '#ffffff'], 12, 70);
      }
    }
    // los aguijonazos en columna
    for (const c of j.columnas) { c.t += dt; if (c.t > 1 && c.t < 1.35 && Math.abs(p.x - c.x) < 8 && p.dash <= 0) dañoModo(j); }
    j.columnas = j.columnas.filter(c => c.t < 1.5);
    // tiros de Fresita
    for (const s of j.tiros) {
      s.x += s.vx * dt; s.y += s.vy * dt;
      for (const e of j.enem) {
        if (e.aviso > 0 && e.tipo === 'cometa') continue;
        if (e.segs) { const sg = e.segs.find(q => Math.abs(q.x - s.x) < 6 && Math.abs(q.y - s.y) < 6); if (sg) { sg.vida -= 1; sg.golpe = .08; s.muerto = true; chispas(j, s.x, s.y, ['#fff3c4'], 3, 40); break; } continue; }
        const R = e.tipo === 'jefe' ? 34 : e.tipo === 'meteoro' ? 12 : 8; if (Math.abs(e.x - s.x) < R && Math.abs(e.y - s.y) < R) { e.vida -= 1; e.golpe = .08; s.muerto = true; chispas(j, s.x, s.y, ['#fff3c4'], 3, 40); break; }
      }
    }
    j.tiros = j.tiros.filter(s => !s.muerto && s.x < VW + 20 && s.y > -10 && s.y < VH + 10);
    for (const e of j.enem) if (e.vida <= 0 && !e.fin) {
      e.fin = true; RUN.stomps++; derribo(j, e); chispas(j, e.x, e.y, ['#e2c06e', '#fff3c4', '#ffffff'], e.tipo === 'jefe' ? 80 : 16, e.tipo === 'jefe' ? 160 : 80);
      if (e.tipo === 'meteoro' || e.tipo === 'serpiente' || Math.random() < .25) j.items.push({ x: e.x, y: e.y, t: 0 });
      if (Math.random() < .06 && typeof puedeSoltarCorazon === 'function' && puedeSoltarCorazon()) j.corazones.push({ x: e.x, y: e.y, t: 0 });
      if (e.tipo === 'jefe') { j.win = j.t; }
    }
    j.enem = j.enem.filter(e => !e.fin && e.x > -60);
    // balas enemigas: el escudo de Fresita las borra; le pegan a Itzel o aturden a Fresita
    for (const b of j.balas) {
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (fr.escudo > 0 && Math.hypot(b.x - fr.x, b.y - fr.y) < 22) { b.muerto = true; chispas(j, b.x, b.y, ['#b9a7ff', '#ffffff'], 4, 30); continue; }
      if (Math.hypot(b.x - p.x, b.y - p.y) < 6 && p.dash <= 0) { b.muerto = true; dañoModo(j); }
      else if (Math.hypot(b.x - fr.x, b.y - fr.y) < 6) { b.muerto = true; fr.daze = 1.5; }
    }
    j.balas = j.balas.filter(b => !b.muerto && b.x > -10 && b.x < VW + 10 && b.y > -10 && b.y < VH + 10);
    // estrellas doradas: suben el disparo de Fresita; corazones: curan
    for (const it of j.items) { it.t += dt; it.x -= 40 * dt; if (Math.hypot(it.x - p.x, it.y - p.y) < 12) { it.got = true; RUN.coins++; j.nivel = Math.min(4, j.nivel + 1); chispas(j, it.x, it.y, ['#fff3c4', '#e2c06e'], 12, 60); } }
    j.items = j.items.filter(it => !it.got && it.x > -10);
    for (const h of j.corazones) { h.t += dt; h.x -= 40 * dt; if (Math.hypot(h.x - p.x, h.y - p.y) < 12 && RUN.hearts < RUN.maxHearts) { h.got = true; RUN.hearts++; dice(j, '+1 corazón', h.x, h.y - 10, '#ffb0c0'); } }
    j.corazones = j.corazones.filter(h => !h.got && h.x > -10);
    for (const l of j.letreros) l.t += dt; j.letreros = j.letreros.filter(l => l.t < 1.8);
    pasoChispas(j, dt);
  }
  // una estrella de cinco puntas
  function estrella(ctx, x, y, r, col, rot = 0) { ctx.fillStyle = col; ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + rot, rr = k % 2 ? r * .42 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.fill(); }
  // arriba, en la ventana alta: más carta celeste, con la Vía Láctea y la figura del alacrán
  function extiende(ctx, j, ex, f) {
    const t = j.t, ORO = '#e2c06e', g = ctx.createLinearGradient(0, -ex, 0, 0); g.addColorStop(0, '#0c1636'); g.addColorStop(1, '#1e2c62'); ctx.fillStyle = g; ctx.fillRect(0, -ex, VW, ex + 1);
    // la Vía Láctea: una banda de polvo de estrellas
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 160; i++) { const u = hash1(i, 71), x = wrap(u * VW * 1.4 - t * 6, VW + 40) - 20, y = -ex * .55 + Math.sin(u * 9) * ex * .18 + (hash1(i, 72) - .5) * ex * .25; ctx.fillStyle = `rgba(230,220,255,${.08 + hash1(i, 73) * .25})`; ctx.fillRect(x, y, 1, 1); }
    ctx.restore();
    // la retícula de la carta: meridianos curvos y un paralelo
    ctx.strokeStyle = 'rgba(226,192,110,.18)'; ctx.lineWidth = .5;
    for (let k = 0; k < 7; k++) { const x = wrap(k * 80 - t * 6, VW + 80) - 40; ctx.beginPath(); ctx.moveTo(x, -ex); ctx.quadraticCurveTo(x + 18, -ex / 2, x, 0); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(0, -ex * .3); ctx.quadraticCurveTo(VW / 2, -ex * .42, VW, -ex * .3); ctx.stroke();
    // estrellas fijas
    for (let i = 0; i < 40; i++) { const x = wrap(hash1(i, 81) * VW - t * 4, VW + 20) - 10, y = -ex + hash1(i, 82) * ex, r = .6 + hash1(i, 83) * 1.4; ctx.fillStyle = `rgba(255,243,196,${.4 + .4 * Math.sin(t * 2 + i)})`; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
    // la figura de la constelación del tramo, dibujada como en el atlas
    const T = TRAMOS[Math.max(0, j.tramo)], cx = VW * .72, cy = -ex * .5;
    ctx.strokeStyle = 'rgba(226,192,110,.35)'; ctx.lineWidth = .7; ctx.beginPath(); T.figura.forEach(([x, y], i) => i ? ctx.lineTo(cx + x * 2, cy + y * 2) : ctx.moveTo(cx + x * 2, cy + y * 2)); ctx.stroke();
    for (const [x, y] of T.figura) estrella(ctx, cx + x * 2, cy + y * 2, 2.6, ORO, t * .3);
    ctx.font = 'italic 7px Alegreya, Georgia, serif'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,243,196,.7)'; ctx.fillText(T.n, cx + 40, cy + 30); ctx.textAlign = 'left';
  }
  function pintar(j, view) {
    const { ctx, f, st } = marcoModo(j, view), sk = j.def.skin, t = j.t, ORO = '#e2c06e', CREMA = '#fff3c4', p = j.p, fr = j.fre;
    ctx.save(); if (j.shake > 0) ctx.translate((Math.random() - .5) * 3 * j.shake / .3, (Math.random() - .5) * 3 * j.shake / .3);
    // estelas de velocidad
    ctx.strokeStyle = 'rgba(239,227,194,.25)'; ctx.lineWidth = .5;
    for (let i = 0; i < 26; i++) { const y = hash1(i, 3) * VH, x = wrap(hash1(i, 4) * VW * 2 - t * (120 + hash1(i, 5) * 160), VW + 40) - 20; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 10 + hash1(i, 6) * 18, y); ctx.stroke(); }
    if (typeof VUELO_DETALLES !== 'undefined') VUELO_DETALLES.pinta(ctx, t);
    // la constelación por unir: líneas punteadas, números y la que sigue brillando
    const C = j.conste;
    if (C) {
      ctx.strokeStyle = rgba(ORO, .35); ctx.setLineDash([2, 3]); ctx.lineWidth = .7; ctx.beginPath(); C.pts.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = ORO; ctx.lineWidth = 1.2; ctx.beginPath(); C.pts.slice(0, C.sig).forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.stroke();
      C.pts.forEach((q, i) => { const sig = i === C.sig; ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, q.x, q.y, sig ? 14 : 8, ORO, q.ok ? .6 : sig ? .4 + .3 * Math.sin(t * 8) : .2); ctx.restore(); estrella(ctx, q.x, q.y, q.ok ? 4 : 3, q.ok ? CREMA : rgba(CREMA, .6), t);
        if (!q.ok) { ctx.font = 'bold 6px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = sig ? '#ffffff' : rgba(CREMA, .6); ctx.fillText(q.n, q.x, q.y - 7); ctx.textAlign = 'left'; } });
    }
    if (j.consteViva) { const V2 = j.consteViva, a = 1 - V2.t / 3; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(CREMA, a); ctx.lineWidth = 2; ctx.beginPath(); V2.pts.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.stroke(); for (const q of V2.pts) glowDot(ctx, q.x, q.y, 20, ORO, a * .7); ctx.restore(); }
    // la lluvia de estrellas
    if (j.lluvia > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const x = hash1(i, 91) * VW, y = ((1.4 - j.lluvia) * 260 + hash1(i, 92) * VH) % (VH + 20) - 10; ctx.strokeStyle = rgba(CREMA, .7); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6, y - 14); ctx.stroke(); estrella(ctx, x, y, 2.4, ORO, t); } ctx.restore(); }
    // estrellas doradas y corazones
    for (const it of j.items) { ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.t * 2); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 0, 0, 10, ORO, .5); ctx.globalCompositeOperation = 'source-over'; estrella(ctx, 0, 0, 5, ORO); ctx.restore(); }
    for (const h of j.corazones) { drawHeart(ctx, h.x, h.y + Math.sin(h.t * 3) * 1.5, 5, '#7a0f2a'); drawHeart(ctx, h.x, h.y + Math.sin(h.t * 3) * 1.5, 4, '#ff3b5c'); }
    // las columnas del aguijón: se marcan y luego cae la estrella
    for (const c of j.columnas) { if (c.t < 1) { ctx.strokeStyle = rgba('#ff8a6a', .3 + Math.sin(t * 30) * .3); ctx.setLineDash([4, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(c.x, 0); ctx.lineTo(c.x, VH); ctx.stroke(); ctx.setLineDash([]); } else { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rgba(ORO, .55 * (1.5 - c.t) / .5); ctx.fillRect(c.x - 6, 0, 12, VH); ctx.restore(); } }
    // enemigos
    for (const e of j.enem) {
      const blanco = e.golpe > 0;
      if (e.tipo === 'cometa' && e.aviso > 0) { ctx.strokeStyle = rgba(ORO, .3 + Math.sin(t * 30) * .3); ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(0, e.y); ctx.lineTo(VW, e.y); ctx.stroke(); ctx.setLineDash([]); continue; }
      if (e.tipo === 'serpiente') { serpiente(ctx, e, t, ORO, CREMA); continue; }
      ctx.save(); ctx.translate(e.x, e.y); if (blanco) ctx.filter = 'brightness(3)';
      // enemigos de la lámina (fauna.js); todos miran a la derecha y vienen por la derecha, por eso van volteados
      const FA = window.FAUNA_ARTE, arte = FA && FA.listo('vueloEsc') && FA.listo('vueloJefe');
      if (arte && e.tipo === 'escorpion') FA.dib(ctx, 'vueloEsc', e.anim, 0, 0, { w: 18, ay: .6, fps: 5, voltea: true });
      else if (arte && e.tipo === 'cometa') FA.dib(ctx, 'vueloCometa', e.anim, 9, 0, { w: 26, ay: .5, fps: 10, voltea: true });
      else if (arte && e.tipo === 'meteoro') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 6, 0, 22, '#ff9a4a', .25); ctx.restore(); FA.pieza(ctx, 'vueloMeteoro0', 0, 0, { w: 28, ay: .5, rot: e.rot }); }
      else if (arte && e.tipo === 'torreta') FA.pieza(ctx, 'vueloTorreta' + ((e.cd || 0) > .85 ? 1 : 0), 0, 0, { w: 32, ay: .5, voltea: true });
      else if (e.tipo === 'jefe') {
        if (e.aviso) { ctx.restore(); ctx.strokeStyle = rgba('#ff8a6a', .4 + Math.sin(t * 30) * .3); ctx.setLineDash([5, 3]); ctx.beginPath(); ctx.moveTo(0, e.picaY); ctx.lineTo(e.x, e.picaY); ctx.stroke(); ctx.setLineDash([]); ctx.save(); ctx.translate(e.x, e.y); }
        if (e.pica) { ctx.restore(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rgba(ORO, .6); ctx.fillRect(0, e.picaY - 4, e.x - 20, 8); ctx.restore(); ctx.save(); ctx.translate(e.x, e.y); }
        ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 0, 0, 50, e.fase2 ? '#ff8a6a' : ORO, e.fase2 ? .22 : .15); ctx.globalCompositeOperation = 'source-over';
        if (arte) FA.pieza(ctx, 'vueloJefe' + (e.pica ? 2 : e.aviso ? 1 : 0), 0, 0, { w: 70, ay: .6, voltea: true });
        else { ctx.scale(-4, 4); MEC.FD.escorpion(ctx, Object.assign({}, e, { st: e.pica ? 'lunge' : 'ok' }), t, sk.foe); }
      }
      else if (e.tipo === 'escorpion') { ctx.scale(-1.2, 1.2); MEC.FD.escorpion(ctx, e, t, sk.foe); }
      else if (e.tipo === 'cometa') { ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 8; k++) glowDot(ctx, k * 5, 0, 6 - k * .6, k < 3 ? CREMA : ORO, .5 - k * .05); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, 2.6, 0, TAU); ctx.fill(); }
      else if (e.tipo === 'meteoro') { ctx.rotate(e.rot); ctx.fillStyle = '#2a3460'; ctx.strokeStyle = ORO; ctx.lineWidth = .8; ctx.beginPath(); for (let k = 0; k < 9; k++) { const a = k / 9 * TAU, r = 11 + hash1(k, 9) * 4; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.stroke(); }
      else if (e.tipo === 'torreta') { ctx.fillStyle = '#14224a'; ctx.strokeStyle = ORO; ctx.lineWidth = .9; ctx.beginPath(); ctx.arc(0, 0, 10, 0, TAU); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, 0, 17, 4.5, -.3, 0, TAU); ctx.stroke(); ctx.fillStyle = '#ff8a6a'; ctx.beginPath(); ctx.arc(-6, 0, 2, 0, TAU); ctx.fill(); }
      ctx.restore();
      if (e.max > 3 && e.vida < e.max && e.tipo !== 'jefe') { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(e.x - 8, e.y - 16, 16, 1.6); ctx.fillStyle = ORO; ctx.fillRect(e.x - 8, e.y - 16, 16 * e.vida / e.max, 1.6); }
    }
    for (const b of j.balas) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, b.x, b.y, 6, '#ff8a6a', .7); ctx.restore(); if (!(window.FAUNA_ARTE && FAUNA_ARTE.pieza(ctx, 'vueloBala', b.x, b.y, { w: 5, ay: .5 }))) { ctx.fillStyle = '#ffd0c0'; ctx.beginPath(); ctx.arc(b.x, b.y, 1.6, 0, TAU); ctx.fill(); } }
    for (const s of j.tiros) { ctx.fillStyle = CREMA; ctx.beginPath(); ctx.moveTo(s.x + 4, s.y); ctx.lineTo(s.x - 4, s.y - 1.2); ctx.lineTo(s.x - 4, s.y + 1.2); ctx.closePath(); ctx.fill(); }
    // Itzel en su canoa de estrellas
    if (!(j.inv > 0 && Math.floor(j.inv * 14) % 2)) {
      ctx.save(); ctx.translate(p.x, p.y + 6); ctx.rotate(clamp(p.vy / 600, -.25, .25));
      if (p.dash > 0) { ctx.globalCompositeOperation = 'lighter'; for (let k = 1; k < 6; k++) glowDot(ctx, -k * 7, 0, 7 - k, ORO, .4); ctx.globalCompositeOperation = 'source-over'; }
      ctx.fillStyle = ORO; ctx.strokeStyle = '#8a6a20'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(-12, -1); ctx.lineTo(10, -1); ctx.quadraticCurveTo(15, -1, 14, -5); ctx.lineTo(12, -5); ctx.quadraticCurveTo(12, 2, 8, 2); ctx.lineTo(-12, 2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
      Object.assign(j.pose, { x: p.x - 1, y: p.y + 5, face: 1, on: false, vy: -40, vx: 0 }); st.player(ctx, j.pose, f);
    }
    // escudo y Fresita
    if (fr.escudo > 0) { ctx.strokeStyle = rgba('#b9a7ff', .4 + Math.sin(t * 20) * .2); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(fr.x, fr.y, 22, 0, TAU); ctx.stroke(); ctx.fillStyle = 'rgba(185,167,255,.08)'; ctx.fill(); }
    ctx.save(); if (fr.daze > 0) ctx.globalAlpha = .55; if (st.fresita) st.fresita(ctx, { x: fr.x, y: fr.y, face: 1 }, f); ctx.restore();
    pintaChispas(ctx, j);
    for (const l of j.letreros) { ctx.globalAlpha = Math.max(0, 1 - l.t / 1.8); letrero(ctx, l.txt, l.x, l.y - l.t * 10, l.col); } ctx.globalAlpha = 1;
    ctx.restore();
    if (st.over) st.over(ctx, f);
    // barra: el avance por los tramos, o la vida del alacrán
    const jefe = j.jefe;
    if (jefe) { ctx.fillStyle = 'rgba(10,15,40,.7)'; ctx.fillRect(VW / 2 - 70, 10, 140, 10); ctx.fillStyle = jefe.fase2 ? '#ff8a6a' : ORO; ctx.fillRect(VW / 2 - 67, 15, 134 * clamp(jefe.vida / jefe.max, 0, 1), 3); letrero(ctx, "Sinan Ek', el alacrán de las estrellas", VW / 2, 13, CREMA); }
    else {
      ctx.fillStyle = 'rgba(10,15,40,.6)'; ctx.fillRect(VW / 2 - 60, 12, 120, 3); ctx.fillStyle = ORO; ctx.fillRect(VW / 2 - 60, 12, 120 * clamp(j.t / DUR, 0, 1), 3);
      for (const T of TRAMOS) { const x = VW / 2 - 60 + 120 * T.t / DUR; ctx.fillStyle = CREMA; ctx.fillRect(x - .5, 10, 1, 7); }
    }
    if (j.banner > 0) { const a = Math.min(1, j.banner * 2, (3.2 - j.banner) * 3), T = jefe ? { n: "Sinan Ek', el alacrán", sub: 'Los mayas también vieron un alacrán en estas estrellas' } : TRAMOS[j.tramo]; ctx.globalAlpha = a; ctx.fillStyle = 'rgba(10,15,40,.72)'; ctx.fillRect(VW / 2 - 130, 26, 260, 26); letrero(ctx, T.n, VW / 2, 37, '#ffe9a0'); ctx.font = 'italic 5.8px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = CREMA; ctx.fillText(T.sub, VW / 2, 47); ctx.textAlign = 'left'; ctx.globalAlpha = 1; }
    ctx.font = '6px "Alegreya Sans", sans-serif'; ctx.fillStyle = CREMA; ctx.fillText(`Disparo de Fresita: ${'★'.repeat(j.nivel)}   ·   Constelaciones: ${j.consteHechas} de 3${j.combo > 1 ? '   ·   combo ×' + j.combo : ''}`, 10, VH - 8);
    if (C) { ctx.font = 'bold 6px "Alegreya Sans", sans-serif'; ctx.fillStyle = '#ffe9a0'; ctx.textAlign = 'right'; ctx.fillText(`Itzel: toca las estrellas en orden (${C.sig} de 5)`, VW - 10, VH - 8); ctx.textAlign = 'left'; }
  }
  // la serpiente de estrellas: cabeza con lengua, cuerpo de estrellas unidas y el cascabel al final
  function serpiente(ctx, e, t, ORO, CREMA) {
    const segs = e.segs; if (!segs.length) return;
    ctx.strokeStyle = rgba(ORO, .6); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(e.x, e.y); for (const s of segs) ctx.lineTo(s.x, s.y); ctx.stroke();
    segs.forEach((s, i) => { const cola = i === segs.length - 1 && s.vida > 0 && segs.length === 7; ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, s.x, s.y, 8, cola ? '#ffb0a0' : ORO, .35); ctx.restore(); if (s.golpe > 0) { s.golpe -= 1 / 60; ctx.filter = 'brightness(3)'; }
      if (cola) { ctx.fillStyle = CREMA; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(s.x + k * 3, s.y + Math.sin(t * 30) * .6, 1.8, 2.6, 0, 0, TAU); ctx.fill(); } }
      else estrella(ctx, s.x, s.y, 3.4, CREMA, t * 2 + i); ctx.filter = 'none'; });
    ctx.save(); ctx.translate(e.x, e.y); ctx.fillStyle = '#14224a'; ctx.strokeStyle = ORO; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(0, -5); ctx.lineTo(5, 0); ctx.lineTo(0, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ff8a6a'; ctx.beginPath(); ctx.arc(-3, -1.6, 1, 0, TAU); ctx.fill(); ctx.strokeStyle = '#ff8a6a'; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-13, Math.sin(t * 20)); ctx.stroke(); ctx.restore();
  }
  return { crear, paso, pintar, extiende };
})();
MEC.POW.estrellas = { name: 'Lluvia de estrellas', help: 'Mantén el clic izquierdo para disparar estrellas; clic derecho = escudo que borra las balas. Cuando Itzel une una constelación, cae una lluvia de estrellas.', cd: .3, click() { return false; } };
nivel('vuelo', {
  nombre: 'Vuelo entre constelaciones', lema: 'Itzel pilotea el trineo de estrella; Fresita dispara. Al final espera el alacrán.',
  modo: 'vuelo', foe: 'escorpion', fauna: ['escorpion'], power: 'estrellas', plat: NIVELES.cielo.plat, W: 30, skin: NIVELES.cielo.skin, grav: .5, jumpK: .74,
});
NIVELES_ALT.cielo = ['vuelo'];
