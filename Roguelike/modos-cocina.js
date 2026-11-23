'use strict';
// =====================================================================
//  COCINA COOPERATIVA · La cocina del mercado (arte de papel recortado)
//  Itzel corre por los ingredientes y arma los platos (Espacio = tomar /
//  dejar). Fresita voltea las tortillas en los dos comales, licúa la chaya
//  y sirve a los clientes (clic en el plato y luego en el cliente).
//  Más ritmo (pedido de David 2026-11-20, «se ve hecho al chingadazo»):
//   · dos comales; Itzel más rápida; lo que carga Itzel ilumina a dónde va;
//   · propina por servir rápido, y una racha que la hace crecer;
//   · la hora pico: con tres servidos, los clientes llegan más seguido;
//   · el gato del mercado se trepa a la mesa a robarse lo de los platos:
//     Fresita lo espanta con un clic antes de que se lo lleve.
//  Clic derecho = calma (los clientes esperan más).
// =====================================================================
MODOS.cocina = (() => {
  const RECETAS = {
    cazon: { nombre: 'Pan de cazón', pide: ['tortilla', 'frijol', 'pescado'] },
    panucho: { nombre: 'Panucho', pide: ['tortilla', 'frijol', 'pavo'] },
    salbut: { nombre: 'Salbut', pide: ['tortilla', 'pavo'] },
    chaya: { nombre: 'Agua de chaya', pide: ['agua'] },
  };
  const META = 6, CAJAS = [['masa', 34, 104, 'masa'], ['frijol', 34, 136, 'frijol'], ['pescado', 34, 168, 'cazón'], ['pavo', 34, 200, 'pavo'], ['chaya', 74, 216, 'chaya']];
  const PLATOS = [[146, 150], [206, 150], [266, 150]], COMALES = [[250, 205], [292, 205]], LICUA = [352, 200], BOTE = [404, 206], VENT = [130, 220, 310];
  const VEL = 128;
  function crear(def, st) {
    return { t: 0, win: 0, shake: 0, bubbles: [], parts: [], def, st, inv: 0, p: { x: 110, y: 190, face: 1, run: 0, lleva: null }, pose: poseItzel(), fre: { x: 220, y: 120, lleva: null, calma: 0 },
      comales: COMALES.map(([x, y]) => ({ x, y, cosa: null, t: 0 })), licua: { cosa: null, vueltas: 0, gira: 0 }, platos: PLATOS.map(([x, y]) => ({ x, y, cosas: [] })),
      clientes: [null, null, null], llegada: 1.5, servidos: 0, perdidos: 0, racha: 0, propinas: 0, letreros: [], gato: { st: 'fuera', t: 6 + Math.random() * 4, x: -20, y: 150, plato: null, robo: 0 },
      aviso: 'Abre el mercado: ¡llegan los primeros clientes!', pico: false };
  }
  const receta = (cosas) => Object.keys(RECETAS).find(k => { const r = RECETAS[k].pide; return r.length === cosas.length && r.every(i => cosas.includes(i)); });
  const dice = (j, txt, x, y, col = '#fff4e0') => j.letreros.push({ txt, x, y, t: 0, col });
  function paso(j, dt) {
    j.t += dt; j.inv = Math.max(0, j.inv - dt); j.shake = Math.max(0, j.shake - dt);
    const p = j.p, k = teclas(), fr = j.fre;
    const dx = (k.right ? 1 : 0) - (k.left ? 1 : 0), dy = (k.down ? 1 : 0) - (k.up ? 1 : 0), n = Math.hypot(dx, dy);
    if (n) { p.x = clamp(p.x + dx / n * VEL * dt, 46, 410); p.y = clamp(p.y + dy / n * VEL * dt, 112, 230); if (dx) p.face = Math.sign(dx); p.run += dt * 20; }
    p.mov = !!n;
    if (k.space && !j.spWas) usar(j);
    j.spWas = k.space;
    // comales: crudo -> listo para voltear -> se quema si nadie la voltea
    for (const c of j.comales) {
      if (c.cosa === 'masa' || c.cosa === 'volteada') { c.t += dt; if (c.cosa === 'masa' && c.t > 6.5) { c.cosa = 'quemada'; c.t = 0; chispas(j, c.x, c.y - 6, ['#3a2a2a', '#7a6a6a'], 10, 30); j.racha = 0; } if (c.cosa === 'volteada' && c.t > 1.2) c.cosa = 'tortilla'; }
      if (c.cosa === 'quemada') { c.t += dt; if (c.t > 1.6) c.cosa = null; }
    }
    j.licua.gira = Math.max(0, j.licua.gira - dt);
    // Fresita
    if (MOUSE.active) { fr.x += (MOUSE.x - fr.x) * Math.min(1, dt * 10); fr.y += (MOUSE.y - fr.y) * Math.min(1, dt * 10); }
    fr.calma = Math.max(0, fr.calma - dt);
    for (const cl of MOUSE.clicks) { if (cl.up) continue; if (cl.b === 2) { if (fr.calma <= 0) { fr.calma = 8; for (const q of j.clientes) if (q) q.paciencia = Math.min(q.max, q.paciencia + 8); chispas(j, cl.x, cl.y, ['#b9a7ff', '#ffffff'], 16, 60); } continue; } fresita(j, cl.x, cl.y); }
    MOUSE.clicks.length = 0;
    // clientes: con tres servidos empieza la hora pico
    if (!j.pico && j.servidos >= 3) { j.pico = true; dice(j, '¡Hora pico en el mercado!', VW / 2, 108, '#ffbf00'); j.shake = .15; }
    j.llegada -= dt;
    const libre = j.clientes.findIndex(q => !q);
    if (j.llegada <= 0 && libre >= 0 && !j.win) {
      const ks = Object.keys(RECETAS), r = ks[Math.floor(Math.random() * ks.length)], max = (j.pico ? 30 : 38) - Math.min(8, j.servidos);
      j.clientes[libre] = { r, paciencia: max, max, t: 0, cara: Math.floor(Math.random() * 4), feliz: 0 }; j.llegada = j.pico ? 3.5 + Math.random() * 2 : 7 + Math.random() * 2;
    }
    j.clientes.forEach((q, i) => {
      if (!q) return; q.t += dt;
      if (q.feliz > 0) { q.feliz -= dt; if (q.feliz <= 0) j.clientes[i] = null; return; }
      q.paciencia -= dt;
      if (q.paciencia <= 0) { j.clientes[i] = null; j.perdidos++; j.racha = 0; j.shake = .2; dice(j, 'Se fue sin comer…', VENT[i], 30, '#ffb0a0'); if (j.perdidos % 3 === 0) dañoModo(j); }
    });
    // el gato del mercado: entra por el piso, se trepa a un plato con cosas y se lleva lo de arriba
    const g = j.gato; g.t -= dt;
    if (g.st === 'fuera' && g.t <= 0 && !j.win) { const llenos = j.platos.filter(pl => pl.cosas.length); if (llenos.length) { g.st = 'va'; g.plato = llenos[Math.floor(Math.random() * llenos.length)]; g.x = VW + 14; g.y = 232; g.lado = 1; dice(j, '¡El gato del mercado!', VW - 60, 222, '#ffd6e4'); } else g.t = 2; }
    if (g.st === 'va') { const tx = g.plato.x + 14, ty = g.plato.y + 4, d = Math.hypot(tx - g.x, ty - g.y); if (d < 3) { g.st = 'roba'; g.robo = 2.2; } else { g.x += (tx - g.x) / d * 70 * dt; g.y += (ty - g.y) / d * 70 * dt; } }
    if (g.st === 'roba') { g.robo -= dt; if (!g.plato.cosas.length) g.st = 'huye'; else if (g.robo <= 0) { const cosa = g.plato.cosas.pop(); dice(j, `¡Se llevó ${cosa === 'pescado' ? 'el cazón' : cosa === 'pavo' ? 'el pavo' : cosa === 'frijol' ? 'el frijol' : 'la tortilla'}!`, g.plato.x, g.plato.y - 16, '#ffb0a0'); g.st = 'huye'; g.lleva = cosa; } }
    if (g.st === 'huye') { g.x += 150 * dt; g.y += (232 - g.y) * dt * 3; if (g.x > VW + 20) { g.st = 'fuera'; g.lleva = null; g.t = (j.pico ? 9 : 13) + Math.random() * 5; } }
    for (const l of j.letreros) l.t += dt; j.letreros = j.letreros.filter(l => l.t < 1.6);
    if (!j.win && j.servidos >= META) { j.win = j.t; j.aviso = '¡Cerramos el mercado con todo servido!'; RUN.coins += Math.min(5, Math.floor(j.propinas / 2)); chispas(j, VW / 2, 60, ['#e83f6f', '#ffbf00', '#2274a5', '#32936f', '#ffffff'], 60, 140); }
    pasoChispas(j, dt);
  }
  const cerca = (p, [x, y], r = 22) => Math.hypot(p.x - x, p.y - y) < r;
  function usar(j) {
    const p = j.p;
    for (const [cosa, x, y] of CAJAS) if (cerca(p, [x, y], 24)) { if (!p.lleva) { p.lleva = cosa; chispas(j, x, y, ['#ffffff'], 4, 30); } return; }
    for (const c of j.comales) if (cerca(p, [c.x, c.y], 18)) { if (p.lleva === 'masa' && !c.cosa) { c.cosa = 'masa'; c.t = 0; p.lleva = null; } else if (!p.lleva && c.cosa === 'tortilla') { p.lleva = 'tortilla'; c.cosa = null; } return; }
    if (cerca(p, LICUA)) { if (p.lleva === 'chaya' && !j.licua.cosa) { j.licua.cosa = 'chaya'; j.licua.vueltas = 0; p.lleva = null; } return; }
    if (cerca(p, BOTE)) { if (p.lleva) { p.lleva = null; chispas(j, BOTE[0], BOTE[1] - 8, ['#a08060'], 6, 30); } return; }
    for (const pl of j.platos) if (cerca(p, [pl.x, pl.y])) { if (p.lleva && ['tortilla', 'frijol', 'pescado', 'pavo'].includes(p.lleva) && !pl.cosas.includes(p.lleva) && pl.cosas.length < 3) { pl.cosas.push(p.lleva); p.lleva = null; } else if (!p.lleva && pl.cosas.length) pl.cosas = []; return; }
  }
  function fresita(j, x, y) {
    const fr = j.fre, g = j.gato;
    // espantar al gato
    if (g.st !== 'fuera' && g.st !== 'huye' && Math.hypot(x - g.x, y - (g.y - 6)) < 18) { g.st = 'huye'; chispas(j, g.x, g.y - 6, ['#ffffff', '#ffd6e4'], 12, 60); dice(j, '¡Fuera, michi!', g.x, g.y - 20, '#ffffff'); RUN.coins++; return; }
    for (const c of j.comales) if (Math.hypot(x - c.x, y - c.y) < 18) { if (c.cosa === 'masa' && c.t > 3) { c.cosa = 'volteada'; c.t = 0; chispas(j, c.x, c.y - 8, ['#ffe0a0', '#ffffff'], 10, 50); } return; }
    if (Math.hypot(x - LICUA[0], y - LICUA[1]) < 18) { const l = j.licua; if (l.cosa === 'chaya') { l.vueltas++; l.gira = .4; if (l.vueltas >= 4) l.cosa = 'agua'; } else if (l.cosa === 'agua' && !fr.lleva) { fr.lleva = { r: 'chaya', de: 'licua' }; } return; }
    for (const pl of j.platos) if (Math.hypot(x - pl.x, y - pl.y) < 16) { const r = receta(pl.cosas); if (r && !fr.lleva) fr.lleva = { r, de: pl }; return; }
    VENT.forEach((vx, i) => {
      const q = j.clientes[i]; if (!q || q.feliz || !fr.lleva || Math.abs(x - vx) > 22 || y > 80) return;
      if (fr.lleva.r === q.r) {
        q.feliz = 1.4; j.servidos++; RUN.coins += 2; if (fr.lleva.de === 'licua') j.licua.cosa = null; else fr.lleva.de.cosas = []; fr.lleva = null;
        // propina: si el cliente casi no esperó; la racha la hace crecer
        if (q.paciencia > q.max * .55) { j.racha++; const extra = Math.min(3, j.racha); j.propinas += extra; RUN.coins += extra; dice(j, j.racha > 1 ? `¡Propina! racha ×${j.racha}` : '¡Propina!', vx, 18, '#ffbf00'); } else j.racha = 0;
        chispas(j, vx, 52, ['#ffbf00', '#e83f6f', '#ffffff'], 18, 70); if (typeof ENCI !== 'undefined') ENCI.ver('poder:cocinar');
      }
      else { q.paciencia -= 6; j.shake = .1; dice(j, `Pidió ${RECETAS[q.r].nombre}`, vx, 18, '#ffd6e4'); }
    });
  }
  // a dónde va lo que trae Itzel (para iluminarlo)
  function destinos(j) {
    const ll = j.p.lleva, D = [];
    if (!ll) { for (const c of j.comales) if (c.cosa === 'tortilla') D.push([c.x, c.y]); return D; }
    if (ll === 'masa') for (const c of j.comales) if (!c.cosa) D.push([c.x, c.y]);
    if (ll === 'chaya' && !j.licua.cosa) D.push(LICUA);
    if (['tortilla', 'frijol', 'pescado', 'pavo'].includes(ll)) for (const pl of j.platos) if (!pl.cosas.includes(ll) && pl.cosas.length < 3) D.push([pl.x, pl.y]);
    return D;
  }
  // dibujos de los ingredientes (recortes de papel)
  function cosa(ctx, que, x, y, s = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.shadowColor = 'rgba(70,40,20,.35)'; ctx.shadowBlur = 2; ctx.shadowOffsetY = 1;
    const disco = (r, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); };
    if (que === 'masa') disco(4.5, '#f0d8a0');
    else if (que === 'tortilla') { ctx.fillStyle = '#f6dca0'; ctx.beginPath(); ctx.ellipse(0, 0, 6.5, 4.5, 0, 0, TAU); ctx.fill(); ctx.shadowColor = 'transparent'; ctx.fillStyle = '#c89a5a'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(-3 + k * 2, (k % 2) - .5, .7, 0, TAU); ctx.fill(); } }
    else if (que === 'frijol') { ctx.fillStyle = '#7a3a2a'; ctx.beginPath(); ctx.ellipse(0, 1, 5.5, 3.6, 0, 0, Math.PI); ctx.fill(); ctx.fillStyle = '#3a1a14'; ctx.beginPath(); ctx.ellipse(0, 0, 5, 1.6, 0, 0, TAU); ctx.fill(); }
    else if (que === 'pescado') { ctx.fillStyle = '#8aa0b0'; ctx.beginPath(); ctx.ellipse(0, 0, 6, 2.8, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-9, -3); ctx.lineTo(-9, 3); ctx.fill(); ctx.shadowColor = 'transparent'; ctx.fillStyle = '#2a2a3a'; ctx.beginPath(); ctx.arc(3.5, -.6, .7, 0, TAU); ctx.fill(); }
    else if (que === 'pavo') { ctx.fillStyle = '#b8743a'; ctx.beginPath(); ctx.ellipse(1, 0, 5, 3.6, -.4, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff4e0'; ctx.fillRect(-6, 1.6, 4, 1.4); ctx.beginPath(); ctx.arc(-6.4, 1.4, 1, 0, TAU); ctx.arc(-6.4, 3.2, 1, 0, TAU); ctx.fill(); }
    else if (que === 'chaya') { ctx.fillStyle = '#32936f'; for (let k = 0; k < 3; k++) { ctx.save(); ctx.rotate(-.6 + k * .6); ctx.beginPath(); ctx.ellipse(0, -3, 2, 4, 0, 0, TAU); ctx.fill(); ctx.restore(); } }
    else if (que === 'agua' || que === 'chaya-r') { ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fillRect(-3, -5, 6, 9); ctx.fillStyle = '#5ab86a'; ctx.fillRect(-2.4, -2, 4.8, 5.4); }
    else if (que === 'quemada') disco(5, '#3a2a2a');
    ctx.restore();
  }
  function plato(ctx, r, x, y) { if (r === 'chaya') { cosa(ctx, 'agua', x, y); return; } ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.ellipse(x, y + 1, 8, 4.4, 0, 0, TAU); ctx.fill(); RECETAS[r].pide.forEach((q, i) => cosa(ctx, q, x - 1 + i * .8, y - i * 1.6, .75)); }
  // el gato pinto del mercado, recortado en papel
  function gato(ctx, g, t) {
    if (g.st === 'fuera') return;
    const x = g.x, y = g.y, anda = g.st === 'roba' ? 0 : Math.sin(t * 16) * 1.2, dir = g.st === 'huye' ? 1 : -1;
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1); ctx.shadowColor = 'rgba(70,40,20,.35)'; ctx.shadowBlur = 2; ctx.shadowOffsetY = 1;
    ctx.fillStyle = '#e8a050'; ctx.beginPath(); ctx.ellipse(0, -5, 8, 4.4, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff4e0'; ctx.beginPath(); ctx.ellipse(-2, -3.4, 3.4, 2.4, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#e8a050'; ctx.beginPath(); ctx.arc(-8, -9, 4, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(-11, -11); ctx.lineTo(-11.4, -16); ctx.lineTo(-8.6, -12.4); ctx.moveTo(-7.4, -12.6); ctx.lineTo(-5.4, -16); ctx.lineTo(-5, -11); ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.fillStyle = '#3a2418'; ctx.fillRect(-10.6, -10, 1, 1.2); ctx.fillRect(-7.6, -10, 1, 1.2);
    ctx.strokeStyle = '#e8a050'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(7, -6); ctx.quadraticCurveTo(12, -12 + Math.sin(t * 5) * 2, 10, -16); ctx.stroke();
    ctx.fillStyle = '#c87830'; for (const lx of [-5, -2, 3, 6]) ctx.fillRect(lx, -2 + (lx % 2 ? anda : -anda) * .4, 1.6, 3);
    if (g.lleva) { ctx.scale(dir, 1); cosa(ctx, g.lleva, -11 * dir, -8, .6); }
    ctx.restore();
    if (g.st === 'roba') { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x - 10, y - 24, 20, 2.4); ctx.fillStyle = '#e83f6f'; ctx.fillRect(x - 10, y - 24, 20 * (1 - g.robo / 2.2), 2.4); if (Math.sin(t * 12) > 0) letrero(ctx, '¡Fresita, espántalo!', x, y - 28, '#ffd6e4'); }
  }
  // arriba, en la ventana alta: el techo del mercado, con sus vigas, faroles y el letrero
  function extiende(ctx, j, ex, f) {
    const t = j.t, g = ctx.createLinearGradient(0, -ex, 0, 0); g.addColorStop(0, '#7a4a2a'); g.addColorStop(.55, '#b8794a'); g.addColorStop(1, j.colTope || '#d8a878'); ctx.fillStyle = g; ctx.fillRect(0, -ex, VW, ex + 1);
    // las vigas del techo
    ctx.fillStyle = 'rgba(70,40,20,.55)'; for (let k = 0; k < 4; k++) ctx.fillRect(0, -ex + 10 + k * ex * .2, VW, 3);
    for (let x = 20; x < VW; x += 64) { ctx.fillStyle = 'rgba(70,40,20,.45)'; ctx.beginPath(); ctx.moveTo(x - 3, -ex); ctx.lineTo(x + 3, -ex); ctx.lineTo(x + 30, -ex * .25); ctx.lineTo(x + 24, -ex * .25); ctx.closePath(); ctx.fill(); }
    // el letrero del mercado, de papel recortado
    const lw = 170, lx = VW / 2 - lw / 2, ly = -ex * .4;
    ctx.save(); ctx.shadowColor = 'rgba(70,40,20,.4)'; ctx.shadowBlur = 4 * f.S; ctx.shadowOffsetY = 2 * f.S; ctx.fillStyle = '#e4572e'; ctx.beginPath(); roundRect(ctx, lx, ly, lw, 26, 4); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#f6bd60'; ctx.fillRect(lx, ly, lw, 4); ctx.strokeStyle = 'rgba(255,250,235,.85)'; ctx.setLineDash([2, 2]); ctx.lineWidth = .7; ctx.beginPath(); roundRect(ctx, lx + 3, ly + 3, lw - 6, 20, 3); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff4e0'; ctx.font = 'bold 9px "Alegreya Sans", sans-serif'; ctx.fillText('Mercado Pedro Sáinz de Baranda', VW / 2, ly + 13); ctx.font = '6px "Alegreya Sans", sans-serif'; ctx.fillText('cocina económica · Campeche', VW / 2, ly + 21); ctx.textAlign = 'left';
    for (const sx of [lx + 12, lx + lw - 12]) { ctx.strokeStyle = 'rgba(70,40,20,.6)'; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(sx, -ex); ctx.lineTo(sx, ly); ctx.stroke(); }
    // faroles de papel que se mecen
    for (let k = 0; k < 5; k++) { const x = 30 + k * 92 + (k === 2 ? 40 : 0), L = ex * (.3 + (k % 2) * .12), sw = Math.sin(t * 1.3 + k) * 2.4, col = ['#e83f6f', '#ffbf00', '#2274a5', '#32936f', '#9b5de5'][k];
      ctx.strokeStyle = 'rgba(70,40,20,.6)'; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(x, -ex); ctx.lineTo(x + sw, -ex + L); ctx.stroke();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x + sw, -ex + L + 8, 20, '#ffd890', .3); ctx.restore();
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x + sw, -ex + L + 8, 6, 8, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,250,235,.6)'; ctx.lineWidth = .5; for (let r = -4; r <= 4; r += 4) { ctx.beginPath(); ctx.ellipse(x + sw, -ex + L + 8, 6, 8 - Math.abs(r), 0, 0, TAU); ctx.stroke(); } }
  }
  function pintar(j, view) {
    const { ctx, f, st } = marcoModo(j, view), t = j.t, sk = j.def.skin, p = j.p;
    const sombra = (b = 3, oy = 1.6) => { ctx.shadowColor = 'rgba(70,40,20,.38)'; ctx.shadowBlur = b * f.S; ctx.shadowOffsetY = oy * f.S; };
    ctx.save(); if (j.shake > 0) ctx.translate((Math.random() - .5) * 3 * j.shake / .3, 0);
    // piso de la cocina (papel con cuadros) y barra de la ventanilla
    ctx.save(); sombra(5, 2); ctx.fillStyle = '#e8c89a'; ctx.fillRect(0, 96, VW, VH - 96); ctx.restore();
    for (let x = 0; x < VW; x += 24) for (let y = 104; y < VH; y += 24) if (((x + y) / 24) % 2) { ctx.fillStyle = 'rgba(160,100,60,.12)'; ctx.fillRect(x, y, 24, 24); }
    ctx.save(); sombra(4, 2); ctx.fillStyle = '#e4572e'; ctx.fillRect(0, 74, VW, 22); ctx.fillStyle = '#f6bd60'; ctx.fillRect(0, 74, VW, 5); ctx.restore();
    ctx.strokeStyle = 'rgba(255,250,235,.85)'; ctx.setLineDash([2, 2]); ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(0, 82); ctx.lineTo(VW, 82); ctx.stroke(); ctx.setLineDash([]);
    if (typeof COCINA_DETALLES !== 'undefined') COCINA_DETALLES.pinta(ctx);
    // clientes en la ventanilla
    VENT.forEach((vx, i) => {
      const q = j.clientes[i]; ctx.fillStyle = 'rgba(60,40,30,.15)'; ctx.fillRect(vx - 22, 38, 44, 36); if (!q) return;
      const salta = q.feliz ? Math.abs(Math.sin(t * 12)) * 3 : 0, col = ['#2274a5', '#32936f', '#9b5de5', '#e83f6f'][q.cara];
      const FA = window.FAUNA_ARTE, contento = q.feliz || q.paciencia > q.max * .4;
      if (FA && FA.listo('cliente')) { ctx.save(); sombra(3, 1.5); FA.pieza(ctx, 'cliente' + (q.cara * 2 + (contento ? 0 : 1)), vx, 74 - salta, { h: 34 }); ctx.restore(); } else {
      ctx.save(); sombra(3, 1.5); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(vx, 74 - salta, 11, 14, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#c98a5e'; ctx.beginPath(); ctx.arc(vx, 50 - salta, 7, 0, TAU); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#3b2a20'; ctx.beginPath(); ctx.arc(vx, 47 - salta, 7.2, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#2a1a14'; ctx.fillRect(vx - 3, 50 - salta, 1.2, 1.4); ctx.fillRect(vx + 2, 50 - salta, 1.2, 1.4);
      ctx.strokeStyle = '#2a1a14'; ctx.lineWidth = .6; ctx.beginPath(); if (contento) ctx.arc(vx + .5, 53 - salta, 2, .2, Math.PI - .2); else { ctx.moveTo(vx - 1.5, 55 - salta); ctx.lineTo(vx + 2.5, 54 - salta); } ctx.stroke(); }
      if (!q.feliz) {
        // la comanda: el platillo, su nombre y la paciencia
        ctx.save(); sombra(2, 1); ctx.fillStyle = '#fffaf0'; ctx.beginPath(); roundRect(ctx, vx + 8, 18, 34, 26, 4); ctx.fill(); ctx.restore();
        plato(ctx, q.r, vx + 25, 28);
        ctx.font = 'bold 5px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#6a3a22'; ctx.fillText(RECETAS[q.r].nombre, vx + 25, 41); ctx.textAlign = 'left';
        const k2 = clamp(q.paciencia / q.max, 0, 1); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(vx - 14, 66, 28, 3); ctx.fillStyle = k2 > .55 ? '#32936f' : k2 > .25 ? '#ffbf00' : '#e83f6f'; ctx.fillRect(vx - 14, 66, 28 * k2, 3);
        if (j.fre.lleva && j.fre.lleva.r === q.r) { ctx.strokeStyle = `rgba(255,191,0,${.5 + .4 * Math.sin(t * 8)})`; ctx.lineWidth = 1.4; ctx.strokeRect(vx - 22, 38, 44, 36); }
      } else letrero(ctx, '¡Gracias!', vx, 30, '#fff4e0');
    });
    // estaciones (lo que trae Itzel ilumina a dónde va)
    const brilla = destinos(j);
    for (const [x, y] of brilla) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y, 22, '#ffe08a', .35 + .2 * Math.sin(t * 6)); ctx.restore(); }
    const mesa = (x, y, w, h, col) => { ctx.save(); sombra(3, 2); ctx.fillStyle = col; ctx.beginPath(); roundRect(ctx, x - w / 2, y - h / 2, w, h, 3); ctx.fill(); ctx.restore(); ctx.strokeStyle = 'rgba(255,250,235,.8)'; ctx.lineWidth = .6; ctx.setLineDash([1.6, 1.4]); ctx.beginPath(); roundRect(ctx, x - w / 2 + 2, y - h / 2 + 2, w - 4, h - 4, 2); ctx.stroke(); ctx.setLineDash([]); };
    for (const [que, x, y, nom] of CAJAS) { mesa(x, y, 24, 22, '#a0653f'); cosa(ctx, que, x, y); ctx.font = 'bold 4.6px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff4e0'; ctx.fillText(nom, x, y + 9.4); ctx.textAlign = 'left'; }
    for (const pl of j.platos) { mesa(pl.x, pl.y, 30, 20, '#f6eedb'); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(pl.x, pl.y + 1, 9, 5, 0, 0, TAU); ctx.fill(); pl.cosas.forEach((q, i) => cosa(ctx, q, pl.x - 1 + i * .8, pl.y - i * 1.8, .8)); const r = receta(pl.cosas); if (r && Math.sin(t * 6) > 0) letrero(ctx, '¡' + RECETAS[r].nombre + '!', pl.x, pl.y - 12, '#ffbf00'); }
    for (const c of j.comales) {
      mesa(c.x, c.y, 32, 22, '#5a4a4a'); ctx.fillStyle = '#2a2a2a'; ctx.beginPath(); ctx.ellipse(c.x, c.y, 11, 6, 0, 0, TAU); ctx.fill();
      if (!c.cosa) continue;
      cosa(ctx, c.cosa === 'volteada' || c.cosa === 'tortilla' ? 'tortilla' : c.cosa === 'masa' ? (c.t > 2 ? 'tortilla' : 'masa') : 'quemada', c.x, c.y - 1);
      if (c.cosa === 'masa') { const listo = c.t > 3; ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(c.x - 12, c.y + 9, 24, 2.4); ctx.fillStyle = listo ? (c.t > 5.2 ? '#e83f6f' : '#ffbf00') : '#f6dca0'; ctx.fillRect(c.x - 12, c.y + 9, 24 * Math.min(1, c.t / 6.5), 2.4); if (listo && Math.sin(t * 10) > 0) letrero(ctx, c.t > 5.2 ? '¡se quema!' : '¡voltéala!', c.x, c.y - 14, c.t > 5.2 ? '#ff8a7a' : '#ffbf00'); }
      for (let k = 0; k < 2; k++) { ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = .6; ctx.beginPath(); const sx = c.x - 3 + k * 6, sy = c.y - 8 - (t * 10 + k * 5) % 10; ctx.moveTo(sx, sy); ctx.quadraticCurveTo(sx + 2, sy - 3, sx, sy - 6); ctx.stroke(); }
    }
    mesa(LICUA[0], LICUA[1], 24, 22, '#2274a5'); { const l = j.licua; ctx.save(); ctx.translate(LICUA[0], LICUA[1] - 4); if (l.gira) ctx.rotate(Math.sin(t * 60) * .1); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(-5, -10, 10, 14); ctx.fillStyle = l.cosa === 'agua' ? '#5ab86a' : l.cosa === 'chaya' ? '#32936f' : 'rgba(0,0,0,0)'; ctx.fillRect(-4, -4 - (l.cosa === 'agua' ? 4 : 0), 8, 7 + (l.cosa === 'agua' ? 4 : 0)); ctx.restore(); if (l.cosa === 'chaya') letrero(ctx, `Fresita: ${4 - l.vueltas} clics`, LICUA[0], LICUA[1] - 18, '#ffffff'); if (l.cosa === 'agua') letrero(ctx, '¡lista!', LICUA[0], LICUA[1] - 18, '#ffbf00'); }
    mesa(BOTE[0], BOTE[1], 18, 18, '#6a6a6a'); ctx.fillStyle = '#3a3a3a'; ctx.fillRect(BOTE[0] - 6, BOTE[1] - 6, 12, 2);
    gato(ctx, j.gato, t);
    // Itzel con lo que lleva
    if (!(j.inv > 0 && Math.floor(j.inv * 14) % 2)) { ctx.fillStyle = 'rgba(70,40,20,.25)'; ctx.beginPath(); ctx.ellipse(p.x, p.y + 1, 6, 2, 0, 0, TAU); ctx.fill(); Object.assign(j.pose, { x: p.x, y: p.y + 1, face: p.face, vx: p.mov ? 120 : 0, run: p.run, on: true }); st.player(ctx, j.pose, f); if (p.lleva) cosa(ctx, p.lleva, p.x + p.face * 3, p.y - 22); }
    // Fresita (y lo que carga para servir)
    if (st.fresita) st.fresita(ctx, { x: j.fre.x, y: j.fre.y, face: 1 }, f);
    if (j.fre.lleva) plato(ctx, j.fre.lleva.r, j.fre.x, j.fre.y + 12);
    pintaChispas(ctx, j);
    for (const l of j.letreros) { ctx.globalAlpha = Math.max(0, 1 - l.t / 1.6); letrero(ctx, l.txt, l.x, l.y - l.t * 10, l.col); } ctx.globalAlpha = 1;
    ctx.restore();
    if (st.over) st.over(ctx, f);
    ctx.fillStyle = 'rgba(60,30,20,.78)'; ctx.fillRect(0, VH - 12, VW, 12);
    ctx.font = 'bold 7px "Alegreya Sans", sans-serif'; ctx.fillStyle = '#ffbf00'; ctx.fillText(`Servidos ${j.servidos} de ${META}`, 8, VH - 3.5); ctx.fillStyle = '#ffd6e4'; ctx.fillText(`Se fueron: ${j.perdidos}`, 82, VH - 3.5); ctx.fillStyle = '#9fe0b0'; ctx.fillText(`Propinas: ${j.propinas}${j.racha > 1 ? ' · racha ×' + j.racha : ''}`, 140, VH - 3.5);
    ctx.font = '5.5px "Alegreya Sans", sans-serif'; ctx.fillStyle = '#fff4e0'; ctx.fillText('Itzel: Espacio toma/deja · Fresita: voltea, licúa, sirve y espanta al gato · clic derecho = calma', 222, VH - 4);
    if (j.aviso && (j.t < 4 || j.win)) letrero(ctx, j.aviso, VW / 2, 110, '#fff4e0');
    if (j.pico && !j.win) { ctx.font = 'bold 6px "Alegreya Sans", sans-serif'; ctx.fillStyle = `rgba(255,191,0,${.6 + .3 * Math.sin(t * 5)})`; ctx.textAlign = 'right'; ctx.fillText('HORA PICO', VW - 8, 90); ctx.textAlign = 'left'; }
  }
  return { crear, paso, pintar, extiende };
})();
MEC.POW.cocinar = { name: 'Manos de cocinera', help: 'Clic en los comales para voltear las tortillas, clics en la licuadora para la chaya; clic en un plato listo y luego en el cliente para servir. Clic en el gato para espantarlo.', cd: .2, click() { return false; } };
nivel('cocina', {
  nombre: 'La cocina del mercado', lema: 'Pan de cazón, panuchos, salbutes y agua de chaya: Itzel prepara, Fresita cocina, sirve y espanta al gato del mercado. Sirve rápido y hay propina.',
  modo: 'cocina', foe: 'avispa', fauna: ['avispa'], power: 'cocinar', plat: NIVELES.paper.plat, W: 30, skin: NIVELES.paper.skin,
});
NIVELES_ALT.paper = ['cocina'];
