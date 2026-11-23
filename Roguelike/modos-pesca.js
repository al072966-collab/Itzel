'use strict';
// =====================================================================
//  PESCA COOPERATIVA · Pesca en el malecón (mundo de cianotipia)
//  Itzel camina por el malecón con su caña: Espacio para bajar el
//  anzuelo (lo baja mientras lo sostienes), otra vez para subirlo. Si
//  pica un pez, sostén Espacio para recoger el hilo y suéltalo cuando se
//  ponga tenso, o se revienta. Fresita nada abajo: los peces la siguen
//  (los lleva al anzuelo) y con clic suelta burbujas que espantan a las
//  aguamalas, que cortan el hilo si lo tocan. Hay que llenar el pedido
//  del mercado: cazón, pámpano, robalo, pulpo y camarones.
//  Más pelea (pedido de David 2026-11-20): el pez enganchado jala hacia un
//  lado; Itzel jala hacia el otro con ← → mientras recoge (si jala para el
//  mismo lado, el hilo se tensa el doble). Fresita, junto al pez enganchado,
//  lo calma con sus burbujas. Los camarones andan en grupitos por el fondo.
// =====================================================================
MODOS.pesca = (() => {
  const AGUA = 74, FONDO = 222, MALECON = 64;
  const AZ = { hondo: '#0b2a52', medio: '#123f75', claro: '#5f8fc0', papel: '#eef5fb', linea: '#cfe3f6' };
  const PECES = {
    sardina: { nombre: 'Sardina', largo: 7, vel: 46, fuerza: .15, prof: [90, 150], vale: 1 },
    pampano: { nombre: 'Pámpano', largo: 11, vel: 34, fuerza: .35, prof: [110, 180], vale: 2 },
    robalo: { nombre: 'Robalo', largo: 15, vel: 28, fuerza: .55, prof: [130, 200], vale: 3 },
    cazon: { nombre: 'Cazón', largo: 17, vel: 36, fuerza: .62, prof: [150, 205], vale: 3 },
    pulpo: { nombre: 'Pulpo', largo: 10, vel: 12, fuerza: .48, prof: [205, 214], vale: 3, fondo: true },
    camaron: { nombre: 'Camarón', largo: 6, vel: 20, fuerza: .1, prof: [196, 212], vale: 1, fondo: true },
  };
  const PEDIDO = { cazon: 1, pampano: 1, robalo: 1, pulpo: 1, camaron: 2 };
  // El nivel es por tiempo: se pesca hasta que se acaba el reloj. Cada pez da canisteles según lo que vale, completar el pedido
  // del mercado da un bono, y al final hay un premio según cuántos peces se sacaron.
  const DURA = 80, BONO_PEDIDO = 6, PREMIOS = [[10, 10], [7, 6], [4, 3]];   // [peces, canisteles extra]
  function crear(def, st) {
    const j = { t: 0, win: 0, shake: 0, bubbles: [], parts: [], def, st, inv: 0, pose: poseItzel(),
      p: { x: 120, face: 1, run: 0 }, anz: { x: 130, y: AGUA - 4, est: 'arriba', pez: null, tension: 0 }, fre: { x: 220, y: 160, cd: 0 },
      tiempo: DURA, pescados: 0, pedidoOk: false, peces: [], malas: [], basura: [], burbujas: [], llevo: { cazon: 0, pampano: 0, robalo: 0, pulpo: 0, camaron: 0 }, extra: 0, cortes: 0, sp: false, avisos: [], nace: 0 };
    for (let i = 0; i < 7; i++) nuevoPez(j, true);
    for (let i = 0; i < 3; i++) j.malas.push({ x: 60 + i * 130, y: 120 + i * 30, vy: 10, t: i * 2 });
    j.basura.push({ x: 300, y: 100, t: 0 });
    return j;
  }
  function nuevoPez(j, enMedio) {
    const faltan = Object.keys(PEDIDO).filter(k => j.llevo[k] < PEDIDO[k]);
    const k = Math.random() < .45 && faltan.length ? faltan[Math.floor(Math.random() * faltan.length)] : ['sardina', 'sardina', 'pampano', 'robalo', 'cazon', 'pulpo', 'camaron'][Math.floor(Math.random() * 7)];
    const P = PECES[k], dir = Math.random() < .5 ? 1 : -1;
    const x0 = enMedio ? 40 + Math.random() * 350 : dir > 0 ? -20 : VW + 20, y0 = P.prof[0] + Math.random() * (P.prof[1] - P.prof[0]);
    for (let n = 0; n < (k === 'camaron' ? 3 : 1); n++) j.peces.push({ k, x: x0 - dir * n * 9, y: y0 + (n % 2) * 4, dir, t: Math.random() * 5, pica: 0, y0: 0 });
  }
  const aviso = (j, txt, col = AZ.papel) => j.avisos.push({ txt, t: 0, col });
  function paso(j, dt) {
    j.t += dt; j.inv = Math.max(0, j.inv - dt); j.shake = Math.max(0, j.shake - dt);
    if (!j.win) { j.tiempo = Math.max(0, j.tiempo - dt); if (j.tiempo <= 0) terminaTiempo(j); }
    const k = teclas(), p = j.p, a = j.anz, fr = j.fre;
    // Itzel por el malecón (no se mueve mientras recoge un pez)
    const dx = (k.right ? 1 : 0) - (k.left ? 1 : 0);
    if (dx && a.est !== 'jala') { p.x = clamp(p.x + dx * 70 * dt, 16, VW - 16); p.face = dx; p.run += dt * 14; p.mov = true; } else p.mov = false;
    const punta = p.x + p.face * 14;
    if (a.est !== 'jala') a.x += (punta - a.x) * Math.min(1, dt * (a.est === 'arriba' ? 10 : 1.4)); else a.x = clamp(a.x + (punta - a.x) * dt * .5, punta - 60, punta + 60);
    // Espacio: bajar / subir / recoger
    const sp = k.space, pres = sp && !j.sp; j.sp = sp;
    // arriba → (aprieta) baja mientras lo sostienes → quieto → (aprieta) sube; subiendo, otra vez baja
    if (pres) { if (a.est === 'arriba' || a.est === 'sube') a.est = 'baja'; else if (a.est === 'quieta') a.est = 'sube'; }
    if (a.est === 'baja') { a.y = Math.min(FONDO - 4, a.y + 70 * dt); if (!sp) a.est = 'quieta'; }
    if (a.est === 'sube') { a.y -= 90 * dt; if (a.y <= AGUA - 4) { a.y = AGUA - 4; a.est = 'arriba'; } }
    if (a.est === 'jala') {
      const P = PECES[a.pez.k];
      // el pez jala hacia un lado y cambia de vez en cuando; Itzel jala hacia el otro con ← →
      a.cambia = (a.cambia || 0) - dt; if (a.cambia <= 0) { a.lado = Math.random() < .5 ? -1 : 1; a.cambia = .9 + Math.random() * 1.4 - P.fuerza * .5; }
      const contra = dx === -a.lado, mismo = dx === a.lado;
      a.x += a.lado * (contra ? 4 : 16) * P.fuerza * dt;
      if (sp) { a.y -= (contra ? 46 : 30) * dt; a.tension += (P.fuerza * 1.3 + .1) * dt * (1 + Math.sin(j.t * 9) * .4) * (contra ? .55 : mismo ? 2 : 1.1); }
      else { a.y = Math.min(FONDO - 4, a.y + P.fuerza * 26 * dt); a.tension = Math.max(0, a.tension - dt * (contra ? 1.3 : .9)); }
      a.pez.x = a.x + Math.sin(j.t * 12) * 2; a.pez.y = a.y + 4;
      if (a.tension >= 1) { aviso(j, '¡Se reventó el hilo!', '#ffb0a0'); a.pez.suelto = 1.5; a.pez = null; a.est = 'sube'; a.tension = 0; j.cortes++; j.shake = .2; if (j.cortes % 3 === 0) dañoModo(j); }
      else if (a.y <= AGUA + 2) {
        const pz = a.pez; j.peces = j.peces.filter(q => q !== pz); a.pez = null; a.est = 'arriba'; a.y = AGUA - 4; a.tension = 0;
        j.pescados++; RUN.coins += PECES[pz.k].vale;
        if (j.llevo[pz.k] !== undefined && j.llevo[pz.k] < PEDIDO[pz.k]) { j.llevo[pz.k]++; aviso(j, `¡Un ${PECES[pz.k].nombre.toLowerCase()} para el mercado! +${PECES[pz.k].vale}`, '#ffe27a'); }
        else { j.extra++; aviso(j, `${PECES[pz.k].nombre}: +${PECES[pz.k].vale} canisteles`); }
        chispas(j, a.x, AGUA, [AZ.papel, AZ.linea, '#ffffff'], 14, 70);
      }
    }
    // Fresita bajo el agua
    if (MOUSE.active) { fr.x += (MOUSE.x - fr.x) * Math.min(1, dt * 9); fr.y += (clamp(MOUSE.y, AGUA + 8, FONDO - 4) - fr.y) * Math.min(1, dt * 9); }
    fr.cd -= dt;
    for (const c of MOUSE.clicks) {
      if (c.up || c.b !== 0 || fr.cd > 0) continue; fr.cd = .6;
      for (let i = 0; i < 8; i++) j.burbujas.push({ x: fr.x, y: fr.y, vx: (Math.random() - .5) * 60, vy: -30 - Math.random() * 30, t: 0 });
      for (const m of j.malas) { const d = Math.hypot(m.x - fr.x, m.y - fr.y); if (d < 48) { m.empuje = { x: (m.x - fr.x) / (d || 1) * 120, y: (m.y - fr.y) / (d || 1) * 120 }; } }
      if (a.est === 'jala' && Math.hypot(a.x - fr.x, a.y - fr.y) < 40) { a.tension = Math.max(0, a.tension - .3); a.cambia = Math.max(a.cambia, .8); aviso(j, 'Fresita calma al pez', '#bfe6ff'); }
      if (typeof ENCI !== 'undefined') ENCI.ver('poder:pescar');
    }
    MOUSE.clicks.length = 0;
    for (const b of j.burbujas) { b.t += dt; b.x += b.vx * dt; b.y += b.vy * dt; b.vy -= 20 * dt; } j.burbujas = j.burbujas.filter(b => b.t < 1.4 && b.y > AGUA);
    // los peces: nadan, siguen a Fresita si la tienen cerca y pican si el anzuelo está quieto cerca
    for (const q of j.peces) {
      const P = PECES[q.k]; q.t += dt; q.suelto = Math.max(0, (q.suelto || 0) - dt);
      if (a.pez === q) continue;
      const df = Math.hypot(fr.x - q.x, fr.y - q.y);
      if (df < 60 && !q.suelto) { q.x += (fr.x - q.x) * dt * .9; q.y += (fr.y + 6 - q.y) * dt * .9; q.dir = fr.x > q.x ? 1 : -1; }
      else { q.x += q.dir * P.vel * (q.suelto ? 2.2 : 1) * dt; if (!P.fondo) q.y += Math.sin(q.t * 1.3) * 6 * dt; }
      q.y = clamp(q.y, P.fondo ? FONDO - 10 : AGUA + 10, FONDO - 6);
      if (q.x < -40 || q.x > VW + 40) q.fuera = true;
      if ((a.est === 'quieta' || a.est === 'baja') && !a.pez && !q.suelto && Math.hypot(q.x + q.dir * P.largo * .5 - a.x, q.y - a.y) < 9) { q.pica += dt; if (q.pica > .35) { a.pez = q; a.est = 'jala'; a.tension = .1; aviso(j, `¡Picó un ${P.nombre.toLowerCase()}!`); } } else q.pica = Math.max(0, q.pica - dt);
    }
    j.peces = j.peces.filter(q => !q.fuera); j.nace -= dt; if (j.peces.length < 9 && j.nace <= 0) { nuevoPez(j); j.nace = 1.2; }
    // aguamalas: suben y bajan despacio; si tocan el hilo, lo cortan
    for (const m of j.malas) {
      // las aguamalas también siguen a Fresita si la tienen cerca (llévalas lejos del hilo… o tenlas a raya con burbujas)
      { const dfm = Math.hypot(fr.x - m.x, fr.y - m.y); if (!m.empuje && dfm < 120 && dfm > 14) { m.x += (fr.x - m.x) / dfm * 26 * dt; m.y += (fr.y - m.y) / dfm * 26 * dt; } }
      m.t += dt; if (m.empuje) { m.x += m.empuje.x * dt; m.y += m.empuje.y * dt; m.empuje.x *= Math.pow(.05, dt); m.empuje.y *= Math.pow(.05, dt); if (Math.abs(m.empuje.x) + Math.abs(m.empuje.y) < 3) m.empuje = null; }
      m.y += Math.sin(m.t * .8) * 14 * dt; m.x += Math.sin(m.t * .3) * 6 * dt; m.x = clamp(m.x, 10, VW - 10); m.y = clamp(m.y, AGUA + 14, FONDO - 10);
      if (a.est !== 'arriba' && a.y > m.y - 6 && Math.abs(m.x - a.x) < 6) {
        aviso(j, '¡Una aguamala cortó el hilo!', '#ffb0a0'); if (a.pez) { a.pez.suelto = 1.5; a.pez = null; } a.est = 'arriba'; a.y = AGUA - 4; a.tension = 0; j.cortes++; j.shake = .2; if (j.cortes % 3 === 0) dañoModo(j);
        m.empuje = { x: (m.x < a.x ? -1 : 1) * 80, y: 20 };
      }
    }
    // la bolsa de basura: si la pescas, se limpia el mar
    for (const b of j.basura) { b.t += dt; b.x += Math.sin(b.t * .4) * 10 * dt + 4 * dt; if (b.x > VW + 20) b.x = -20; b.y = 96 + Math.sin(b.t * .7) * 12; if (a.est !== 'arriba' && !a.pez && Math.hypot(b.x - a.x, b.y - a.y) < 8) { b.x = -40; RUN.coins += 2; aviso(j, '¡Sacaste una bolsa del mar! +2 canisteles', '#bfe6ff'); a.est = 'sube'; } }
    for (const v of j.avisos) v.t += dt; j.avisos = j.avisos.filter(v => v.t < 2.4);
    if (!j.win && !j.pedidoOk && Object.keys(PEDIDO).every(k2 => j.llevo[k2] >= PEDIDO[k2])) { j.pedidoOk = true; RUN.coins += BONO_PEDIDO; aviso(j, `¡Pedido completo! +${BONO_PEDIDO} canisteles. ¡Sigan pescando!`, '#ffe27a'); chispas(j, VW / 2, 60, [AZ.papel, '#ffe27a', '#ffffff'], 60, 140); }
    pasoChispas(j, dt);
  }
  // se acabó el tiempo: el premio depende de cuántos peces se sacaron
  function terminaTiempo(j) {
    const premio = (PREMIOS.find(([n]) => j.pescados >= n) || [0, 0])[1]; RUN.coins += premio; j.premioFinal = premio; j.win = j.t || .001;
    aviso(j, `¡Se acabó el tiempo! ${j.pescados} ${j.pescados === 1 ? 'pez' : 'peces'}${premio ? ` · +${premio} canisteles de premio` : ''}`, '#ffe27a');
    chispas(j, VW / 2, 60, [AZ.papel, '#ffe27a', '#ffffff'], 60, 140);
  }
  // ---------------- dibujo (todo en azul de cianotipia, con trazos blancos) ----------------
  function pez(ctx, q, t, picado) {
    const P = PECES[q.k], L = P.largo, cola = Math.sin(t * 10 + q.t * 3) * 2;
    // los peces de la lámina en cianotipia (fauna.js): dos poses nadando y la de picado con el anzuelo
    const FA = window.FAUNA_ARTE, nom = 'pez' + q.k[0].toUpperCase() + q.k.slice(1);
    if (FA && FA.listo(nom)) {
      const n = picado && FA.listo(nom + 'Anzuelo') ? nom + 'Anzuelo' : nom + (Math.floor(t * 3 + q.t) % 2);
      FA.pieza(ctx, n, q.x, q.y + (q.k === 'pulpo' ? 2 : 0), { w: Math.min(FA.TAM[n].w, L * (q.k === 'pulpo' ? 1.6 : 1.35)), ay: q.k === 'pulpo' ? .85 : .5, voltea: q.dir < 0, rot: picado ? Math.sin(t * 14) * .15 : 0 });
      return;
    }
    ctx.save(); ctx.translate(q.x, q.y); ctx.scale(q.dir, 1); ctx.strokeStyle = AZ.papel; ctx.fillStyle = 'rgba(238,245,251,.18)'; ctx.lineWidth = .7;
    if (q.k === 'pulpo') {
      ctx.beginPath(); ctx.ellipse(0, -4, 5, 4.4, 0, 0, TAU); ctx.fill(); ctx.stroke();
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-4 + i * 1.6, -1); ctx.quadraticCurveTo(-6 + i * 2.4 + Math.sin(t * 3 + i) * 2, 3, -7 + i * 2.8, 2 + Math.sin(t * 4 + i)); ctx.stroke(); }
      ctx.fillStyle = AZ.papel; ctx.beginPath(); ctx.arc(2, -4.6, .8, 0, TAU); ctx.fill();
    } else if (q.k === 'camaron') {
      // camarón de Campeche: el cuerpo curvo en segmentos, las antenas largas y las patitas que reman
      for (let s2 = 0; s2 < 5; s2++) { const an = -.4 + s2 * .32, r = 4.2; ctx.beginPath(); ctx.ellipse(Math.cos(an) * r - 1, Math.sin(an) * r - 2, 2 - s2 * .22, 1.6 - s2 * .15, an, 0, TAU); ctx.fill(); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-5, 1.4); ctx.lineTo(-7.6, 3.4 + Math.sin(t * 8) * .6); ctx.lineTo(-5.4, 3.8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(3, -3); ctx.quadraticCurveTo(9, -7, 12, -3 + Math.sin(t * 3) * 1.4); ctx.moveTo(3, -2.4); ctx.quadraticCurveTo(8, -4, 11, 0 + Math.sin(t * 3.4) * 1.4); ctx.stroke();
      for (let k2 = 0; k2 < 3; k2++) { ctx.beginPath(); ctx.moveTo(-1 + k2 * 1.6, .4); ctx.lineTo(-1.6 + k2 * 1.6 + Math.sin(t * 14 + k2) * .8, 2.6); ctx.stroke(); }
      ctx.fillStyle = AZ.papel; ctx.beginPath(); ctx.arc(3.2, -3.4, .6, 0, TAU); ctx.fill();
    } else {
      ctx.beginPath(); ctx.moveTo(L * .55, 0); ctx.quadraticCurveTo(0, -L * .32, -L * .45, 0); ctx.quadraticCurveTo(0, L * .32, L * .55, 0); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-L * .45, 0); ctx.lineTo(-L * .7, -L * .22 + cola); ctx.lineTo(-L * .7, L * .22 + cola); ctx.closePath(); ctx.stroke();
      if (q.k === 'cazon') { ctx.beginPath(); ctx.moveTo(-1, -L * .25); ctx.lineTo(2, -L * .48); ctx.lineTo(4, -L * .22); ctx.stroke(); }
      if (q.k === 'robalo') { ctx.beginPath(); ctx.moveTo(-L * .4, 0); ctx.lineTo(L * .45, 0); ctx.stroke(); }
      if (q.k === 'pampano') { ctx.beginPath(); ctx.moveTo(0, -L * .3); ctx.lineTo(-2, -L * .5); ctx.moveTo(0, L * .3); ctx.lineTo(-2, L * .5); ctx.stroke(); }
      for (let k = -1; k < 2; k++) { ctx.beginPath(); ctx.arc(k * L * .14, 0, L * .12, -1, 1); ctx.stroke(); }
      ctx.fillStyle = AZ.papel; ctx.beginPath(); ctx.arc(L * .32, -L * .06, .8, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  function pintar(j, view) {
    const { ctx, f, st } = marcoModo(j, view), t = j.t, p = j.p, a = j.anz;
    // el cielo sobre el malecón, también en cianotipia: papel azul claro, el sol, gaviotas y la ciudad
    const cg = ctx.createLinearGradient(0, 0, 0, MALECON); cg.addColorStop(0, '#5f8fc0'); cg.addColorStop(1, '#cfe3f6'); ctx.fillStyle = cg; ctx.fillRect(0, 0, VW, MALECON);
    ctx.strokeStyle = AZ.papel; ctx.lineWidth = .8; ctx.beginPath(); ctx.arc(330, 26, 11, 0, TAU); ctx.stroke(); for (let k = 0; k < 12; k++) { const an = k / 12 * TAU; ctx.beginPath(); ctx.moveTo(330 + Math.cos(an) * 14, 26 + Math.sin(an) * 14); ctx.lineTo(330 + Math.cos(an) * 18, 26 + Math.sin(an) * 18); ctx.stroke(); }
    for (let k = 0; k < (window.FAUNA_ARTE?.listo('gaviotaCiano') ? 3 : 0); k++) { const gx = wrap(60 + k * 120 + t * (8 + k * 3), VW + 40) - 20, gy = 18 + k * 9 + Math.sin(t * 2 + k) * 2; FAUNA_ARTE.dib(ctx, 'gaviotaCiano', t + k * .3, gx, gy, { w: 8 - k, ay: .5, fps: 5, seq: [0, 1, 3, 2, 3, 1] }); }
    // el baluarte, la catedral y las casas de Campeche al fondo
    ctx.fillStyle = 'rgba(18,63,117,.55)'; ctx.beginPath(); ctx.moveTo(0, MALECON - 9);
    const sil = [[0, 10], [40, 12], [52, 22], [70, 22], [78, 12], [140, 14], [150, 30], [156, 30], [158, 38], [162, 30], [168, 30], [170, 22], [196, 22], [198, 30], [204, 30], [206, 38], [210, 30], [216, 30], [218, 14], [300, 12], [308, 20], [330, 20], [336, 12], [VW, 12]];
    for (const [x, h] of sil) ctx.lineTo(x, MALECON - 9 - h); ctx.lineTo(VW, MALECON - 9); ctx.fill();
    // el mar de cianotipia
    const mg = ctx.createLinearGradient(0, AGUA, 0, VH); mg.addColorStop(0, AZ.medio); mg.addColorStop(1, AZ.hondo); ctx.fillStyle = mg; ctx.fillRect(0, AGUA, VW, VH - AGUA);
    ctx.strokeStyle = 'rgba(207,227,246,.18)'; ctx.lineWidth = .5; for (let y = AGUA + 12; y < FONDO; y += 14) { ctx.beginPath(); for (let x = 0; x <= VW; x += 6) ctx.lineTo(x, y + Math.sin(x * .05 + t + y) * 1.5); ctx.stroke(); }
    // rayos de sol que bajan
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 5; k++) { const x = 40 + k * 90 + Math.sin(t * .3 + k) * 10; ctx.fillStyle = 'rgba(207,227,246,.05)'; ctx.beginPath(); ctx.moveTo(x - 8, AGUA); ctx.lineTo(x + 8, AGUA); ctx.lineTo(x + 30, FONDO); ctx.lineTo(x + 6, FONDO); ctx.fill(); } ctx.restore();
    // el fondo: arena, piedras y algas como láminas de botánica
    ctx.fillStyle = '#0a2246'; ctx.beginPath(); ctx.moveTo(0, VH); for (let x = 0; x <= VW; x += 8) ctx.lineTo(x, FONDO + Math.sin(x * .07) * 3); ctx.lineTo(VW, VH); ctx.fill();
    ctx.strokeStyle = AZ.linea; ctx.lineWidth = .6;
    for (let k = 0; k < 14; k++) { const x = 14 + k * 30 + (k % 3) * 7, h = 18 + (k % 4) * 9; ctx.beginPath(); ctx.moveTo(x, FONDO + 2); for (let s = 0; s <= h; s += 3) ctx.lineTo(x + Math.sin(t * 1.4 + s * .25 + k) * (s / h) * 4, FONDO + 2 - s); ctx.stroke(); for (let s = 6; s < h; s += 6) { ctx.beginPath(); ctx.ellipse(x + Math.sin(t * 1.4 + s * .25 + k) * (s / h) * 4 + 2.4, FONDO - s, 2.2, .9, -.5, 0, TAU); ctx.stroke(); } }
    if (typeof PESCA_DETALLES !== 'undefined') PESCA_DETALLES.pinta(ctx, FONDO);
    // el malecón de Campeche: muro de piedra, barandal, faroles y palmeras
    ctx.fillStyle = AZ.papel; ctx.fillRect(0, MALECON, VW, AGUA - MALECON);
    ctx.strokeStyle = AZ.medio; ctx.lineWidth = .5; for (let x = 0; x < VW; x += 12) { ctx.strokeRect(x + (Math.floor(x / 12) % 2 ? 6 : 0) - 6, MALECON + 1, 12, 4.5); }
    ctx.fillStyle = AZ.medio; ctx.fillRect(0, MALECON - 9, VW, .8); for (let x = 4; x < VW; x += 10) ctx.fillRect(x, MALECON - 9, .8, 9);
    for (let x = 30; x < VW; x += 96) { ctx.fillStyle = AZ.hondo; ctx.fillRect(x - .7, MALECON - 30, 1.4, 30); ctx.beginPath(); ctx.arc(x, MALECON - 31, 2.6, 0, TAU); ctx.fill(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, MALECON - 31, 10, '#ffe27a', .25); ctx.restore(); }
    // la línea del agua
    ctx.strokeStyle = AZ.papel; ctx.lineWidth = .9; ctx.beginPath(); for (let x = 0; x <= VW; x += 4) ctx.lineTo(x, AGUA + Math.sin(x * .1 + t * 2) * 1); ctx.stroke();
    // basura, aguamalas, peces y burbujas
    for (const b of j.basura) { ctx.strokeStyle = AZ.papel; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(b.x - 4, b.y - 3); ctx.quadraticCurveTo(b.x, b.y - 7, b.x + 4, b.y - 3); ctx.lineTo(b.x + 3, b.y + 4); ctx.lineTo(b.x - 3, b.y + 4); ctx.closePath(); ctx.stroke(); }
    for (const m of j.malas) {
      ctx.save(); ctx.translate(m.x, m.y); ctx.strokeStyle = '#ffb0d0'; ctx.fillStyle = 'rgba(255,176,208,.18)'; ctx.lineWidth = .7;
      ctx.beginPath(); ctx.arc(0, 0, 6, Math.PI, 0); ctx.quadraticCurveTo(3, 1.6, 0, 1); ctx.quadraticCurveTo(-3, 1.6, -6, 0); ctx.fill(); ctx.stroke();
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-4 + i * 2, 1); for (let s = 0; s < 12; s += 3) ctx.lineTo(-4 + i * 2 + Math.sin(t * 3 + i + s * .4) * 1.4, 1 + s); ctx.stroke(); }
      ctx.restore();
    }
    for (const q of j.peces) pez(ctx, q, t, j.anz.pez === q);
    ctx.strokeStyle = 'rgba(238,245,251,.7)'; ctx.lineWidth = .5; for (const b of j.burbujas) { ctx.beginPath(); ctx.arc(b.x, b.y, 1.2 + b.t, 0, TAU); ctx.stroke(); }
    // la caña, el hilo y el anzuelo
    const px = p.x, py = MALECON - 9, punta = { x: px + p.face * 14, y: py - 18 };
    ctx.strokeStyle = '#3a2418'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px + p.face * 3, py - 8); ctx.lineTo(punta.x, punta.y); ctx.stroke();
    ctx.strokeStyle = a.est === 'jala' ? (a.tension > .75 ? '#ff6a5a' : '#ffe27a') : 'rgba(255,255,255,.85)'; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(punta.x, punta.y); ctx.quadraticCurveTo((punta.x + a.x) / 2 - p.face * 4, (punta.y + a.y) / 2, a.x, a.y); ctx.stroke();
    ctx.strokeStyle = AZ.papel; ctx.lineWidth = .7; ctx.beginPath(); ctx.arc(a.x, a.y + 2, 1.8, 0, Math.PI); ctx.stroke();
    if (a.est === 'jala') {
      const w = 30; ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(px - w / 2, py - 34, w, 3); ctx.fillStyle = a.tension > .75 ? '#ff6a5a' : '#ffe27a'; ctx.fillRect(px - w / 2, py - 34, w * clamp(a.tension, 0, 1), 3);
      // hacia dónde jala el pez, y la flecha que hay que apretar
      const k2 = teclas(), bien = ((k2.right ? 1 : 0) - (k2.left ? 1 : 0)) === -a.lado;
      ctx.save(); ctx.translate(a.x, a.y - 12); ctx.fillStyle = 'rgba(255,176,160,.85)'; ctx.beginPath(); ctx.moveTo(a.lado * 12, 0); ctx.lineTo(a.lado * 5, -4); ctx.lineTo(a.lado * 5, 4); ctx.fill(); ctx.restore();
      ctx.font = 'bold 7px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = bien ? '#9fe0b0' : '#ffe27a'; ctx.fillText(bien ? '¡Así!' : (a.lado > 0 ? '← jala' : 'jala →'), px, py - 38); ctx.textAlign = 'left';
    }
    // Itzel en el malecón
    if (!(j.inv > 0 && Math.floor(j.inv * 14) % 2)) { Object.assign(j.pose, { x: px, y: py, face: p.face, vx: p.mov ? 100 : 0, run: p.run, on: true }); st.player(ctx, j.pose, f); }
    // Fresita nadando
    if (st.fresita) st.fresita(ctx, { x: j.fre.x, y: j.fre.y, face: 1 }, f);
    if (Number.isFinite(j.fre.x) && Number.isFinite(j.fre.y)) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, j.fre.x, j.fre.y, 60, '#cfe3f6', .06); ctx.restore(); }
    pintaChispas(ctx, j);
    if (st.over) st.over(ctx, f);
    // el pedido del mercado
    ctx.fillStyle = 'rgba(238,245,251,.92)'; ctx.beginPath(); roundRect(ctx, VW - 98, 6, 92, 51, 4); ctx.fill();
    ctx.font = 'bold 6.5px "Alegreya Sans", sans-serif'; ctx.fillStyle = AZ.hondo; ctx.fillText('Pedido del mercado', VW - 92, 15);
    ctx.font = '6px "Alegreya Sans", sans-serif'; Object.keys(PEDIDO).forEach((k2, i) => { const ok = j.llevo[k2] >= PEDIDO[k2]; ctx.fillStyle = ok ? '#3f8a4a' : AZ.medio; ctx.fillText(`${ok ? '✓' : '·'} ${PECES[k2].nombre}: ${j.llevo[k2]} de ${PEDIDO[k2]}`, VW - 92, 24 + i * 7); });
    // el reloj y el conteo de peces (arriba al centro)
    { const k = clamp(j.tiempo / DURA, 0, 1), cx = VW / 2 - 40, bajo = j.tiempo < 15 && !j.win && Math.floor(j.t * 3) % 2 === 0;
      ctx.fillStyle = 'rgba(238,245,251,.92)'; ctx.beginPath(); roundRect(ctx, cx, 6, 80, 21, 4); ctx.fill();
      ctx.fillStyle = 'rgba(11,42,82,.25)'; ctx.fillRect(cx + 5, 19, 70, 4); ctx.fillStyle = bajo ? '#d8584a' : (j.tiempo < 15 ? '#e08a3a' : AZ.medio); ctx.fillRect(cx + 5, 19, 70 * k, 4);
      ctx.font = 'bold 7px "Alegreya Sans", sans-serif'; ctx.fillStyle = AZ.hondo; ctx.textAlign = 'center'; ctx.fillText(`Tiempo ${Math.ceil(j.tiempo)} s · Peces ${j.pescados}`, VW / 2, 16); ctx.textAlign = 'left'; }
    for (const [i, v] of j.avisos.entries()) { ctx.globalAlpha = Math.min(1, 2.4 - v.t); letrero(ctx, v.txt, VW / 2, 92 + i * 9, v.col); } ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(11,42,82,.85)'; ctx.fillRect(0, VH - 12, VW, 12);
    ctx.font = '5.5px "Alegreya Sans", sans-serif'; ctx.fillStyle = AZ.papel; ctx.fillText('Itzel: ← → camina · Espacio baja / sube el anzuelo · si pica: sostén Espacio y jala con ← → contra el pez · Fresita: los peces la siguen; clic = burbujas (espantan aguamalas y calman al pez)', 6, VH - 4);
    if (j.t < 3) letrero(ctx, 'Pesca en el malecón', VW / 2, 110, '#ffe27a');
  }
  // arriba, en la ventana alta: más cielo de cianotipia, con nubes de trazo blanco, gaviotas y un papalote
  function extiende(ctx, j, ex, f) {
    const t = j.t, g = ctx.createLinearGradient(0, -ex, 0, 0); g.addColorStop(0, '#2f5f92'); g.addColorStop(1, j.colTope || '#5f8fc0'); ctx.fillStyle = g; ctx.fillRect(0, -ex, VW, ex + 1);
    ctx.strokeStyle = 'rgba(238,245,251,.55)'; ctx.lineWidth = .7;
    for (let k = 0; k < 5; k++) { const x = wrap(40 + k * 97 + t * (3 + k), VW + 120) - 60, y = -ex + 20 + (k * 37) % Math.max(30, ex - 40); ctx.beginPath(); for (let b = 0; b < 4; b++) ctx.arc(x + b * 9, y + (b % 2 ? -2 : 1), 6 + (b % 2) * 3, Math.PI, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 6, y + 1); ctx.lineTo(x + 33, y + 1); ctx.stroke(); }
    for (let k = 0; k < (window.FAUNA_ARTE?.listo('gaviotaCiano') ? 4 : 0); k++) { const gx = wrap(30 + k * 110 + t * (10 + k * 2), VW + 40) - 20, gy = -ex * (.25 + k * .15) + Math.sin(t * 2 + k) * 3; FAUNA_ARTE.dib(ctx, 'gaviotaCiano', t + k * .4, gx, gy, { w: 9 - k, ay: .5, fps: 5, seq: [0, 1, 3, 2, 3, 1] }); }
    // un papalote de alguien en el malecón
    const px = 70 + Math.sin(t * .4) * 12, py = -ex * .45 + Math.sin(t * .9) * 6;
    ctx.save(); ctx.translate(px, py); ctx.rotate(Math.sin(t * .9) * .15); ctx.strokeStyle = AZ.papel; ctx.fillStyle = 'rgba(238,245,251,.25)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(7, 0); ctx.lineTo(0, 12); ctx.lineTo(-7, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 12); ctx.moveTo(-7, 0); ctx.lineTo(7, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 12); for (let s2 = 0; s2 < 5; s2++) ctx.lineTo(Math.sin(t * 3 + s2) * 3, 12 + s2 * 4); ctx.stroke(); ctx.restore();
    ctx.strokeStyle = 'rgba(238,245,251,.35)'; ctx.lineWidth = .4; ctx.beginPath(); ctx.moveTo(px, py + 12); ctx.quadraticCurveTo(px + 30, -ex * .1, 120, 2); ctx.stroke();
  }
  return { crear, paso, pintar, extiende };
})();
MEC.POW.pescar = { name: 'Guía de peces', help: 'Los peces siguen a Fresita bajo el agua: llévalos al anzuelo de Itzel. Las aguamalas también la siguen. Clic: burbujas que espantan a las aguamalas y calman al pez enganchado. Hay tiempo limitado: mientras más peces, más canisteles.', cd: .6, click() { return false; } };
nivel('pesca', {
  nombre: 'Pesca en el malecón', lema: 'Itzel pesca desde el malecón y Fresita, abajo del agua, le lleva los peces del pedido del mercado. Hay 80 segundos: cada pez da canisteles y, al final, un premio según cuántos sacaron.',
  modo: 'pesca', foe: 'botete', fauna: ['botete'], power: 'pescar', plat: NIVELES.agua.plat, W: 30, skin: NIVELES.agua.skin,
});
(NIVELES_ALT.agua = NIVELES_ALT.agua || []).push('pesca');

