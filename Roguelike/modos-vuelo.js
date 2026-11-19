'use strict';
// =====================================================================
//  SHOOT 'EM UP · Vuelo entre constelaciones (arte de la carta celeste)
//  Itzel pilotea un trineo de estrella con el teclado (Espacio = embestida)
//  y Fresita dispara estrellas manteniendo el clic; clic derecho = escudo.
// =====================================================================
MODOS.vuelo = (() => {
  const DUR = 45;   // segundos antes del alacrán
  const PLAN = [];  // [segundo, tipo, y]
  for (let s = 2; s < DUR; s += 2.2) {
    const k = Math.floor(s / 2.2) % 6, y = 40 + ((s * 37) % 150);
    if (k === 0 || k === 3) for (let i = 0; i < 4; i++) PLAN.push([s + i * .35, 'escorpion', y]);
    else if (k === 1) PLAN.push([s, 'cometa', null], [s + .8, 'cometa', null]);
    else if (k === 2) PLAN.push([s, 'meteoro', y]);
    else if (k === 4 && s > 14) PLAN.push([s, 'torreta', 50 + ((s * 13) % 130)]);
    else PLAN.push([s, 'estrella', y]);
  }
  PLAN.sort((a, b) => a[0] - b[0]);
  const VIDA = { escorpion: 3, cometa: 1, meteoro: 9, torreta: 7, jefe: 45 };
  function crear(def, st) {
    setLevel(buildLevelFromRows(['.'.repeat(420), '.P' + '.'.repeat(416) + 'G.', '#'.repeat(420)]));
    return { t: 0, win: 0, shake: 0, bubbles: [], parts: [], def, st, inv: 0, plan: PLAN.slice(), enem: [], tiros: [], balas: [], items: [], nivel: 1,
      p: { x: 70, y: VH / 2, vx: 0, vy: 0, dash: 0, cd: 0, face: 1 }, pose: poseItzel(), fre: { x: 120, y: VH / 2 - 20, daze: 0, cd: 0, escudo: 0, escudoCd: 0, disparando: false }, jefe: null, panCam: 0 };
  }
  const nuevo = (j, tipo, y) => {
    const e = { tipo, x: VW + 20, y: y ?? j.p.y, vida: VIDA[tipo], max: VIDA[tipo], t: 0, y0: y ?? j.p.y, aviso: tipo === 'cometa' ? .8 : 0, dir: -1, anim: 0, st: 'ok', h: 8, w: 16 };
    if (tipo === 'estrella') { j.items.push({ x: VW + 10, y: e.y, t: 0 }); return; }
    if (tipo === 'cometa') { e.y = j.p.y; e.y0 = e.y; }
    j.enem.push(e);
  };
  function paso(j, dt) {
    j.t += dt; j.inv = Math.max(0, j.inv - dt); j.shake = Math.max(0, j.shake - dt); j.panCam = j.t * 34;
    const p = j.p, k = teclas(), fr = j.fre;
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
    if (fr.disparando && fr.daze <= 0 && fr.cd <= 0) { fr.cd = .14; const n2 = j.nivel, abre = n2 === 1 ? [0] : n2 === 2 ? [-.12, .12] : [-.2, 0, .2]; for (const a of abre) j.tiros.push({ x: fr.x + 8, y: fr.y, vx: Math.cos(a) * 330, vy: Math.sin(a) * 330 }); }
    // aparecen enemigos
    while (j.plan.length && j.plan[0][0] <= j.t) { const [, tipo, y] = j.plan.shift(); nuevo(j, tipo, y); }
    if (!j.jefe && j.t > DUR && !j.enem.length) { j.jefe = { tipo: 'jefe', x: VW + 60, y: VH / 2, vida: VIDA.jefe, max: VIDA.jefe, t: 0, ataque: 0, dir: -1, anim: 0, st: 'ok', h: 30, w: 60 }; j.enem.push(j.jefe); if (typeof toast === 'function') toast('¡El alacrán de las estrellas!'); }
    // enemigos
    for (const e of j.enem) {
      e.t += dt; e.anim += dt; e.golpe = Math.max(0, (e.golpe || 0) - dt);
      if (e.tipo === 'escorpion') { e.x -= 80 * dt; e.y = e.y0 + Math.sin(e.t * 3) * 26; }
      else if (e.tipo === 'cometa') { if (e.aviso > 0) { e.aviso -= dt; e.x = VW + 20; } else e.x -= 330 * dt; }
      else if (e.tipo === 'meteoro') { e.x -= 34 * dt; e.rot = e.t * .8; }
      else if (e.tipo === 'torreta') { e.x = Math.max(VW - 60, e.x - 70 * dt); if (e.t > 1.5 && e.t < 8) { e.cd = (e.cd || 0) - dt; if (e.cd <= 0) { e.cd = 1.1; const blanco = Math.random() < .35 ? fr : p, a = Math.atan2(blanco.y - e.y, blanco.x - e.x); j.balas.push({ x: e.x, y: e.y, vx: Math.cos(a) * 95, vy: Math.sin(a) * 95 }); } } if (e.t > 9) e.x -= 120 * dt; }
      else if (e.tipo === 'jefe') {
        e.x = Math.max(VW - 70, e.x - 40 * dt); e.y = VH / 2 + Math.sin(e.t * .8) * 60;
        e.ataque += dt; const fase = e.ataque % 6;
        if (fase < 2.5) { e.cd = (e.cd || 0) - dt; if (e.cd <= 0) { e.cd = .45; for (let i = -2; i <= 2; i++) { const a = Math.PI + i * .2 + Math.sin(e.t) * .1; j.balas.push({ x: e.x - 20, y: e.y, vx: Math.cos(a) * 110, vy: Math.sin(a) * 110 }); } } }
        else if (fase < 3.3) { e.picaY = e.picaY ?? p.y; e.aviso = 1; }
        else if (fase < 3.8) { e.aviso = 0; e.pica = 1; if (Math.abs(p.y - e.picaY) < 9 && j.inv <= 0 && p.dash <= 0) dañoModo(j); }
        else { e.pica = 0; e.picaY = null; }
      }
      // choque con Itzel (en embestida, ella gana)
      if (Math.abs(e.x - p.x) < (e.tipo === 'jefe' ? 40 : e.tipo === 'meteoro' ? 14 : 10) && Math.abs(e.y - p.y) < (e.tipo === 'jefe' ? 26 : e.tipo === 'meteoro' ? 14 : 9)) {
        if (p.dash > 0 && e.tipo !== 'jefe') { e.vida -= 4; e.golpe = .1; chispas(j, e.x, e.y, ['#fff3c4', '#ffffff'], 8, 70); }
        else if (dañoModo(j)) chispas(j, p.x, p.y, ['#ff8080', '#ffffff'], 12, 70);
      }
    }
    // tiros de Fresita
    for (const s of j.tiros) { s.x += s.vx * dt; s.y += s.vy * dt; for (const e of j.enem) { if (e.aviso > 0) continue; const R = e.tipo === 'jefe' ? 34 : e.tipo === 'meteoro' ? 12 : 8; if (Math.abs(e.x - s.x) < R && Math.abs(e.y - s.y) < R) { e.vida -= 1; e.golpe = .08; s.muerto = true; chispas(j, s.x, s.y, ['#fff3c4'], 3, 40); break; } } }
    j.tiros = j.tiros.filter(s => !s.muerto && s.x < VW + 20 && s.y > -10 && s.y < VH + 10);
    for (const e of j.enem) if (e.vida <= 0 && !e.fin) { e.fin = true; RUN.stomps++; chispas(j, e.x, e.y, ['#e2c06e', '#fff3c4', '#ffffff'], e.tipo === 'jefe' ? 80 : 16, e.tipo === 'jefe' ? 160 : 80); if (e.tipo === 'meteoro' || Math.random() < .25) j.items.push({ x: e.x, y: e.y, t: 0 }); if (e.tipo === 'jefe') { j.win = j.t; } }
    j.enem = j.enem.filter(e => !e.fin && e.x > -60);
    // balas enemigas: el escudo de Fresita las borra; le pegan a Itzel o aturden a Fresita
    for (const b of j.balas) {
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (fr.escudo > 0 && Math.hypot(b.x - fr.x, b.y - fr.y) < 22) { b.muerto = true; chispas(j, b.x, b.y, ['#b9a7ff', '#ffffff'], 4, 30); continue; }
      if (Math.hypot(b.x - p.x, b.y - p.y) < 6 && p.dash <= 0) { b.muerto = true; dañoModo(j); }
      else if (Math.hypot(b.x - fr.x, b.y - fr.y) < 6) { b.muerto = true; fr.daze = 1.5; }
    }
    j.balas = j.balas.filter(b => !b.muerto && b.x > -10 && b.x < VW + 10 && b.y > -10 && b.y < VH + 10);
    // estrellas doradas: suben el disparo de Fresita
    for (const it of j.items) { it.t += dt; it.x -= 40 * dt; if (Math.hypot(it.x - p.x, it.y - p.y) < 12) { it.got = true; RUN.coins++; j.nivel = Math.min(3, j.nivel + 1); chispas(j, it.x, it.y, ['#fff3c4', '#e2c06e'], 12, 60); } }
    j.items = j.items.filter(it => !it.got && it.x > -10);
    pasoChispas(j, dt);
  }
  function pintar(j, view) {
    const { ctx, f, st } = marcoModo(j, view), sk = j.def.skin, t = j.t, ORO = '#e2c06e', CREMA = '#fff3c4', p = j.p, fr = j.fre;
    // estelas de velocidad
    ctx.strokeStyle = 'rgba(239,227,194,.25)'; ctx.lineWidth = .5;
    for (let i = 0; i < 26; i++) { const y = hash1(i, 3) * VH, x = wrap(hash1(i, 4) * VW * 2 - t * (120 + hash1(i, 5) * 160), VW + 40) - 20; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 10 + hash1(i, 6) * 18, y); ctx.stroke(); }
    if (typeof VUELO_DETALLES !== 'undefined') VUELO_DETALLES.pinta(ctx, t);
    // estrellas doradas
    for (const it of j.items) { ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.t * 2); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 0, 0, 10, ORO, .5); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = ORO; ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU, r = k % 2 ? 2 : 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.fill(); ctx.restore(); }
    // enemigos
    for (const e of j.enem) {
      const blanco = e.golpe > 0;
      if (e.tipo === 'cometa' && e.aviso > 0) { ctx.strokeStyle = rgba(ORO, .3 + Math.sin(t * 30) * .3); ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(0, e.y); ctx.lineTo(VW, e.y); ctx.stroke(); ctx.setLineDash([]); continue; }
      ctx.save(); ctx.translate(e.x, e.y); if (blanco) ctx.filter = 'brightness(3)';
      // enemigos de la lámina (fauna.js); todos miran a la derecha y vienen por la derecha, por eso van volteados
      const FA = window.FAUNA_ARTE, arte = FA && FA.listo('vueloEsc') && FA.listo('vueloJefe');
      if (arte && e.tipo === 'escorpion') FA.dib(ctx, 'vueloEsc', e.anim, 0, 0, { w: 18, ay: .6, fps: 5, voltea: true });
      else if (arte && e.tipo === 'cometa') FA.dib(ctx, 'vueloCometa', e.anim, 9, 0, { w: 26, ay: .5, fps: 10, voltea: true });
      else if (arte && e.tipo === 'meteoro') FA.pieza(ctx, 'vueloMeteoro0', 0, 0, { w: 28, ay: .5, rot: e.rot });
      else if (arte && e.tipo === 'torreta') FA.pieza(ctx, 'vueloTorreta' + ((e.cd || 0) > .85 ? 1 : 0), 0, 0, { w: 32, ay: .5, voltea: true });
      else if (arte && e.tipo === 'jefe') {
        if (e.aviso) { ctx.restore(); ctx.strokeStyle = rgba('#ff8a6a', .4 + Math.sin(t * 30) * .3); ctx.setLineDash([5, 3]); ctx.beginPath(); ctx.moveTo(0, e.picaY); ctx.lineTo(e.x, e.picaY); ctx.stroke(); ctx.setLineDash([]); ctx.save(); ctx.translate(e.x, e.y); }
        if (e.pica) { ctx.restore(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rgba(ORO, .6); ctx.fillRect(0, e.picaY - 4, e.x - 20, 8); ctx.restore(); ctx.save(); ctx.translate(e.x, e.y); }
        ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 0, 0, 50, ORO, .15); ctx.globalCompositeOperation = 'source-over';
        FA.pieza(ctx, 'vueloJefe' + (e.pica ? 2 : e.aviso ? 1 : 0), 0, 0, { w: 70, ay: .6, voltea: true });
      }
      else if (e.tipo === 'escorpion') { ctx.scale(-1.2, 1.2); MEC.FD.escorpion(ctx, e, t, sk.foe); }
      else if (e.tipo === 'cometa') { ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 8; k++) glowDot(ctx, k * 5, 0, 6 - k * .6, k < 3 ? CREMA : ORO, .5 - k * .05); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, 2.6, 0, TAU); ctx.fill(); }
      else if (e.tipo === 'meteoro') { ctx.rotate(e.rot); ctx.fillStyle = '#2a3460'; ctx.strokeStyle = ORO; ctx.lineWidth = .8; ctx.beginPath(); for (let k = 0; k < 9; k++) { const a = k / 9 * TAU, r = 11 + hash1(k, 9) * 4; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle = rgba(CREMA, .3); for (let k = -8; k < 10; k += 3) { ctx.beginPath(); ctx.moveTo(k, -9); ctx.lineTo(k + 6, 9); ctx.stroke(); } }
      else if (e.tipo === 'torreta') { ctx.fillStyle = '#14224a'; ctx.strokeStyle = ORO; ctx.lineWidth = .9; ctx.beginPath(); ctx.arc(0, 0, 10, 0, TAU); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, 0, 17, 4.5, -.3, 0, TAU); ctx.stroke(); ctx.strokeStyle = rgba(CREMA, .35); for (let k = -6; k < 8; k += 2.4) { ctx.beginPath(); ctx.moveTo(k, -7); ctx.lineTo(k + 3, 7); ctx.stroke(); } ctx.fillStyle = '#ff8a6a'; ctx.beginPath(); ctx.arc(-6, 0, 2, 0, TAU); ctx.fill(); }
      else if (e.tipo === 'jefe') {
        if (e.aviso) { ctx.restore(); ctx.strokeStyle = rgba('#ff8a6a', .4 + Math.sin(t * 30) * .3); ctx.setLineDash([5, 3]); ctx.beginPath(); ctx.moveTo(0, e.picaY); ctx.lineTo(e.x, e.picaY); ctx.stroke(); ctx.setLineDash([]); ctx.save(); ctx.translate(e.x, e.y); }
        if (e.pica) { ctx.restore(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rgba(ORO, .6); ctx.fillRect(0, e.picaY - 4, e.x - 20, 8); ctx.restore(); ctx.save(); ctx.translate(e.x, e.y); }
        ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 0, 0, 50, ORO, .15); ctx.globalCompositeOperation = 'source-over';
        ctx.scale(-4, 4); MEC.FD.escorpion(ctx, Object.assign({}, e, { st: e.pica ? 'lunge' : 'ok' }), t, sk.foe);
      }
      ctx.restore();
      if (e.max > 3 && e.vida < e.max && e.tipo !== 'jefe') { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(e.x - 8, e.y - 16, 16, 1.6); ctx.fillStyle = ORO; ctx.fillRect(e.x - 8, e.y - 16, 16 * e.vida / e.max, 1.6); }
    }
    for (const b of j.balas) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, b.x, b.y, 6, '#ff8a6a', .7); ctx.restore(); if (!(window.FAUNA_ARTE && FAUNA_ARTE.pieza(ctx, 'vueloBala', b.x, b.y, { w: 5, ay: .5 }))) { ctx.fillStyle = '#ffd0c0'; ctx.beginPath(); ctx.arc(b.x, b.y, 1.6, 0, TAU); ctx.fill(); } }
    for (const s of j.tiros) { ctx.fillStyle = CREMA; ctx.beginPath(); ctx.moveTo(s.x + 4, s.y); ctx.lineTo(s.x - 4, s.y - 1.2); ctx.lineTo(s.x - 4, s.y + 1.2); ctx.closePath(); ctx.fill(); }
    // Itzel en su trineo de estrella
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
    if (st.over) st.over(ctx, f);
    // barra
    const jefe = j.jefe;
    if (jefe) { ctx.fillStyle = 'rgba(10,15,40,.7)'; ctx.fillRect(VW / 2 - 70, 10, 140, 10); ctx.fillStyle = ORO; ctx.fillRect(VW / 2 - 67, 15, 134 * clamp(jefe.vida / jefe.max, 0, 1), 3); letrero(ctx, 'El alacrán de las estrellas', VW / 2, 13, CREMA); }
    else { ctx.fillStyle = 'rgba(10,15,40,.6)'; ctx.fillRect(VW / 2 - 60, 12, 120, 3); ctx.fillStyle = ORO; ctx.fillRect(VW / 2 - 60, 12, 120 * clamp(j.t / DUR, 0, 1), 3); }
    ctx.font = '6px "Alegreya Sans", sans-serif'; ctx.fillStyle = CREMA; ctx.fillText(`Disparo de Fresita: ${'★'.repeat(j.nivel)}`, 10, VH - 8);
  }
  return { crear, paso, pintar };
})();
MEC.POW.estrellas = { name: 'Lluvia de estrellas', help: 'Mantén el clic izquierdo para disparar estrellas; clic derecho = escudo que borra las balas.', cd: .3, click() { return false; } };
nivel('vuelo', {
  nombre: 'Vuelo entre constelaciones', lema: 'Itzel pilotea el trineo de estrella; Fresita dispara. Al final espera el alacrán.',
  modo: 'vuelo', foe: 'escorpion', fauna: ['escorpion'], power: 'estrellas', plat: NIVELES.cielo.plat, W: 30, skin: NIVELES.cielo.skin, grav: .5, jumpK: .74,
});
NIVELES_ALT.cielo = ['vuelo'];


