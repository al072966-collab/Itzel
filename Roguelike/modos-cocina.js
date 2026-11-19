'use strict';
// =====================================================================
//  COCINA COOPERATIVA · La cocina del mercado (arte de papel recortado)
//  Itzel corre por los ingredientes y arma los platos (Espacio = tomar /
//  dejar). Fresita voltea las tortillas, licúa la chaya y sirve a los
//  clientes (clic en el plato y luego en el cliente). Clic derecho = calma.
// =====================================================================
MODOS.cocina = (() => {
  const RECETAS = {
    cazon: { nombre: 'Pan de cazón', pide: ['tortilla', 'frijol', 'pescado'] },
    panucho: { nombre: 'Panucho', pide: ['tortilla', 'frijol', 'pavo'] },
    chaya: { nombre: 'Agua de chaya', pide: ['agua'] },
  };
  const META = 5, CAJAS = [['masa', 34, 96], ['frijol', 34, 130], ['pescado', 34, 164], ['pavo', 34, 198], ['chaya', 74, 214]];
  const PLATOS = [[150, 150], [210, 150]], COMAL = [270, 200], LICUA = [340, 200], BOTE = [396, 206], VENT = [130, 220, 310];
  function crear(def, st) {
    return { t: 0, win: 0, shake: 0, bubbles: [], parts: [], def, st, inv: 0, p: { x: 110, y: 190, face: 1, run: 0, lleva: null }, pose: poseItzel(), fre: { x: 220, y: 120, lleva: null, calma: 0 },
      comal: { cosa: null, t: 0 }, licua: { cosa: null, vueltas: 0, gira: 0 }, platos: PLATOS.map(([x, y]) => ({ x, y, cosas: [] })),
      clientes: [null, null, null], llegada: 2, servidos: 0, perdidos: 0, aviso: 'Abre el mercado: ¡llegan los primeros clientes!' };
  }
  const receta = (cosas) => Object.keys(RECETAS).find(k => { const r = RECETAS[k].pide; return r.length === cosas.length && r.every(i => cosas.includes(i)); });
  function paso(j, dt) {
    j.t += dt; j.inv = Math.max(0, j.inv - dt); j.shake = Math.max(0, j.shake - dt);
    const p = j.p, k = teclas(), fr = j.fre;
    const dx = (k.right ? 1 : 0) - (k.left ? 1 : 0), dy = (k.down ? 1 : 0) - (k.up ? 1 : 0), n = Math.hypot(dx, dy);
    if (n) { p.x = clamp(p.x + dx / n * 100 * dt, 56, 410); p.y = clamp(p.y + dy / n * 100 * dt, 112, 230); if (dx) p.face = Math.sign(dx); p.run += dt * 18; }
    p.mov = !!n;
    if (k.space && !j.spWas) usar(j);
    j.spWas = k.space;
    // comal: crudo -> listo para voltear -> se quema
    const c = j.comal; if (c.cosa === 'masa' || c.cosa === 'volteada') { c.t += dt; if (c.cosa === 'masa' && c.t > 6.5) { c.cosa = 'quemada'; c.t = 0; chispas(j, COMAL[0], COMAL[1] - 6, ['#3a2a2a', '#7a6a6a'], 10, 30); } if (c.cosa === 'volteada' && c.t > 1.5) { c.cosa = 'tortilla'; } }
    if (c.cosa === 'quemada') { c.t += dt; if (c.t > 2) c.cosa = null; }
    j.licua.gira = Math.max(0, j.licua.gira - dt);
    // Fresita
    if (MOUSE.active) { fr.x += (MOUSE.x - fr.x) * Math.min(1, dt * 10); fr.y += (MOUSE.y - fr.y) * Math.min(1, dt * 10); }
    fr.calma = Math.max(0, fr.calma - dt);
    for (const cl of MOUSE.clicks) { if (cl.up) continue; if (cl.b === 2) { if (fr.calma <= 0) { fr.calma = 8; for (const q of j.clientes) if (q) q.paciencia = Math.min(q.max, q.paciencia + 8); chispas(j, cl.x, cl.y, ['#b9a7ff', '#ffffff'], 16, 60); } continue; } fresita(j, cl.x, cl.y); }
    MOUSE.clicks.length = 0;
    // clientes
    j.llegada -= dt;
    const libre = j.clientes.findIndex(q => !q);
    if (j.llegada <= 0 && libre >= 0 && j.servidos + j.clientes.filter(Boolean).length < META + 3) { const ks = Object.keys(RECETAS), r = ks[Math.floor(Math.random() * ks.length)], max = 40 - Math.min(12, j.servidos * 1.2); j.clientes[libre] = { r, paciencia: max, max, t: 0, cara: Math.floor(Math.random() * 4), feliz: 0 }; j.llegada = Math.max(5, 10 - j.servidos * .5); }
    j.clientes.forEach((q, i) => {
      if (!q) return; q.t += dt;
      if (q.feliz > 0) { q.feliz -= dt; if (q.feliz <= 0) j.clientes[i] = null; return; }
      q.paciencia -= dt;
      if (q.paciencia <= 0) { j.clientes[i] = null; j.perdidos++; j.shake = .2; if (typeof toast === 'function') toast('Un cliente se fue sin comer…'); if (j.perdidos % 3 === 0) dañoModo(j); }
    });
    if (!j.win && j.servidos >= META) { j.win = j.t; j.aviso = '¡Cerramos el mercado con todo servido!'; chispas(j, VW / 2, 60, ['#e83f6f', '#ffbf00', '#2274a5', '#32936f', '#ffffff'], 60, 140); }
    pasoChispas(j, dt);
  }
  const cerca = (p, [x, y], r = 22) => Math.hypot(p.x - x, p.y - y) < r;
  function usar(j) {
    const p = j.p, c = j.comal;
    for (const [cosa, x, y] of CAJAS) if (cerca(p, [x, y], 20)) { if (!p.lleva) { p.lleva = cosa; chispas(j, x, y, ['#ffffff'], 4, 30); } return; }
    if (cerca(p, COMAL)) { if (p.lleva === 'masa' && !c.cosa) { c.cosa = 'masa'; c.t = 0; p.lleva = null; } else if (!p.lleva && c.cosa === 'tortilla') { p.lleva = 'tortilla'; c.cosa = null; } return; }
    if (cerca(p, LICUA)) { if (p.lleva === 'chaya' && !j.licua.cosa) { j.licua.cosa = 'chaya'; j.licua.vueltas = 0; p.lleva = null; } return; }
    if (cerca(p, BOTE)) { if (p.lleva) { p.lleva = null; chispas(j, BOTE[0], BOTE[1] - 8, ['#a08060'], 6, 30); } return; }
    for (const pl of j.platos) if (cerca(p, [pl.x, pl.y])) { if (p.lleva && ['tortilla', 'frijol', 'pescado', 'pavo'].includes(p.lleva) && !pl.cosas.includes(p.lleva) && pl.cosas.length < 3) { pl.cosas.push(p.lleva); p.lleva = null; } else if (!p.lleva && pl.cosas.length) pl.cosas = []; return; }
  }
  function fresita(j, x, y) {
    const fr = j.fre, c = j.comal;
    if (Math.hypot(x - COMAL[0], y - COMAL[1]) < 18) { if (c.cosa === 'masa' && c.t > 3) { c.cosa = 'volteada'; c.t = 0; chispas(j, COMAL[0], COMAL[1] - 8, ['#ffe0a0', '#ffffff'], 10, 50); } return; }
    if (Math.hypot(x - LICUA[0], y - LICUA[1]) < 18) { const l = j.licua; if (l.cosa === 'chaya') { l.vueltas++; l.gira = .4; if (l.vueltas >= 4) l.cosa = 'agua'; } else if (l.cosa === 'agua' && !fr.lleva) { fr.lleva = { r: 'chaya', de: 'licua' }; } return; }
    for (const pl of j.platos) if (Math.hypot(x - pl.x, y - pl.y) < 16) { const r = receta(pl.cosas); if (r && !fr.lleva) fr.lleva = { r, de: pl }; return; }
    VENT.forEach((vx, i) => {
      const q = j.clientes[i]; if (!q || q.feliz || !fr.lleva || Math.abs(x - vx) > 22 || y > 80) return;
      if (fr.lleva.r === q.r) { q.feliz = 1.4; j.servidos++; RUN.coins += 2; if (fr.lleva.de === 'licua') j.licua.cosa = null; else fr.lleva.de.cosas = []; fr.lleva = null; chispas(j, vx, 52, ['#ffbf00', '#e83f6f', '#ffffff'], 18, 70); if (typeof ENCI !== 'undefined') ENCI.ver('poder:cocinar'); }
      else { q.paciencia -= 6; j.shake = .1; if (typeof toast === 'function') toast(`Pidió ${RECETAS[q.r].nombre}`); }
    });
  }
  // dibujos de los ingredientes (recortes de papel)
  function cosa(ctx, que, x, y, s = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.shadowColor = 'rgba(70,40,20,.35)'; ctx.shadowBlur = 2; ctx.shadowOffsetY = 1;
    const disco = (r, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); };
    if (que === 'masa') disco(4.5, '#f0d8a0');
    else if (que === 'tortilla') { ctx.fillStyle = '#f6dca0'; ctx.beginPath(); ctx.ellipse(0, 0, 6.5, 4.5, 0, 0, TAU); ctx.fill(); ctx.shadowColor = 'transparent'; ctx.fillStyle = '#c89a5a'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(-3 + k * 2, (k % 2) - .5, .7, 0, TAU); ctx.fill(); } }
    else if (que === 'frijol') { ctx.fillStyle = '#7a3a2a'; ctx.beginPath(); ctx.ellipse(0, 1, 5.5, 3.6, 0, 0, Math.PI); ctx.fill(); disco(0, '#000'); ctx.fillStyle = '#3a1a14'; ctx.beginPath(); ctx.ellipse(0, 0, 5, 1.6, 0, 0, TAU); ctx.fill(); }
    else if (que === 'pescado') { ctx.fillStyle = '#8aa0b0'; ctx.beginPath(); ctx.ellipse(0, 0, 6, 2.8, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-9, -3); ctx.lineTo(-9, 3); ctx.fill(); ctx.shadowColor = 'transparent'; ctx.fillStyle = '#2a2a3a'; ctx.beginPath(); ctx.arc(3.5, -.6, .7, 0, TAU); ctx.fill(); }
    else if (que === 'pavo') { ctx.fillStyle = '#b8743a'; ctx.beginPath(); ctx.ellipse(1, 0, 5, 3.6, -.4, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff4e0'; ctx.fillRect(-6, 1.6, 4, 1.4); ctx.beginPath(); ctx.arc(-6.4, 1.4, 1, 0, TAU); ctx.arc(-6.4, 3.2, 1, 0, TAU); ctx.fill(); }
    else if (que === 'chaya') { ctx.fillStyle = '#32936f'; for (let k = 0; k < 3; k++) { ctx.save(); ctx.rotate(-.6 + k * .6); ctx.beginPath(); ctx.ellipse(0, -3, 2, 4, 0, 0, TAU); ctx.fill(); ctx.restore(); } }
    else if (que === 'agua' || que === 'chaya-r') { ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fillRect(-3, -5, 6, 9); ctx.fillStyle = '#5ab86a'; ctx.fillRect(-2.4, -2, 4.8, 5.4); }
    else if (que === 'quemada') disco(5, '#3a2a2a');
    ctx.restore();
  }
  function plato(ctx, r, x, y) { if (r === 'chaya') { cosa(ctx, 'agua', x, y); return; } ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.ellipse(x, y + 1, 8, 4.4, 0, 0, TAU); ctx.fill(); RECETAS[r].pide.forEach((q, i) => cosa(ctx, q, x - 1 + i * .8, y - i * 1.6, .75)); }
  function pintar(j, view) {
    const { ctx, f, st } = marcoModo(j, view), t = j.t, sk = j.def.skin, p = j.p;
    const sombra = (b = 3, oy = 1.6) => { ctx.shadowColor = 'rgba(70,40,20,.38)'; ctx.shadowBlur = b * f.S; ctx.shadowOffsetY = oy * f.S; }, sin = () => { ctx.shadowColor = 'transparent'; };
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
      ctx.strokeStyle = '#2a1a14'; ctx.lineWidth = .6; ctx.beginPath(); if (q.feliz || q.paciencia > q.max * .4) ctx.arc(vx + .5, 53 - salta, 2, .2, Math.PI - .2); else { ctx.moveTo(vx - 1.5, 55 - salta); ctx.lineTo(vx + 2.5, 54 - salta); } ctx.stroke(); }
      if (!q.feliz) {
        ctx.save(); sombra(2, 1); ctx.fillStyle = '#fffaf0'; ctx.beginPath(); roundRect(ctx, vx + 8, 22, 26, 20, 4); ctx.fill(); ctx.restore();
        plato(ctx, q.r, vx + 21, 33);
        const k2 = clamp(q.paciencia / q.max, 0, 1); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(vx - 14, 66, 28, 3); ctx.fillStyle = k2 > .5 ? '#32936f' : k2 > .25 ? '#ffbf00' : '#e83f6f'; ctx.fillRect(vx - 14, 66, 28 * k2, 3);
      } else letrero(ctx, '¡Gracias!', vx, 30, '#fff4e0');
    });
    // estaciones
    const mesa = (x, y, w, h, col) => { ctx.save(); sombra(3, 2); ctx.fillStyle = col; ctx.beginPath(); roundRect(ctx, x - w / 2, y - h / 2, w, h, 3); ctx.fill(); ctx.restore(); ctx.strokeStyle = 'rgba(255,250,235,.8)'; ctx.lineWidth = .6; ctx.setLineDash([1.6, 1.4]); ctx.beginPath(); roundRect(ctx, x - w / 2 + 2, y - h / 2 + 2, w - 4, h - 4, 2); ctx.stroke(); ctx.setLineDash([]); };
    for (const [que, x, y] of CAJAS) { mesa(x, y, 24, 22, '#a0653f'); cosa(ctx, que, x, y); }
    for (const pl of j.platos) { mesa(pl.x, pl.y, 30, 20, '#f6eedb'); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(pl.x, pl.y + 1, 9, 5, 0, 0, TAU); ctx.fill(); pl.cosas.forEach((q, i) => cosa(ctx, q, pl.x - 1 + i * .8, pl.y - i * 1.8, .8)); const r = receta(pl.cosas); if (r && Math.sin(t * 6) > 0) letrero(ctx, '¡listo!', pl.x, pl.y - 12, '#ffbf00'); }
    mesa(COMAL[0], COMAL[1], 32, 22, '#5a4a4a'); ctx.fillStyle = '#2a2a2a'; ctx.beginPath(); ctx.ellipse(COMAL[0], COMAL[1], 11, 6, 0, 0, TAU); ctx.fill();
    { const c = j.comal; if (c.cosa) { cosa(ctx, c.cosa === 'volteada' || c.cosa === 'tortilla' ? 'tortilla' : c.cosa === 'masa' ? (c.t > 2 ? 'tortilla' : 'masa') : 'quemada', COMAL[0], COMAL[1] - 1); if (c.cosa === 'masa') { const listo = c.t > 3; ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(COMAL[0] - 12, COMAL[1] + 9, 24, 2.4); ctx.fillStyle = listo ? '#ffbf00' : '#f6dca0'; ctx.fillRect(COMAL[0] - 12, COMAL[1] + 9, 24 * Math.min(1, c.t / 6.5), 2.4); if (listo && Math.sin(t * 10) > 0) letrero(ctx, '¡Fresita, voltéala!', COMAL[0], COMAL[1] - 14, '#ffbf00'); } for (let k = 0; k < 2; k++) { ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = .6; ctx.beginPath(); const sx = COMAL[0] - 3 + k * 6, sy = COMAL[1] - 8 - (t * 10 + k * 5) % 10; ctx.moveTo(sx, sy); ctx.quadraticCurveTo(sx + 2, sy - 3, sx, sy - 6); ctx.stroke(); } } }
    mesa(LICUA[0], LICUA[1], 24, 22, '#2274a5'); { const l = j.licua; ctx.save(); ctx.translate(LICUA[0], LICUA[1] - 4); if (l.gira) ctx.rotate(Math.sin(t * 60) * .1); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(-5, -10, 10, 14); ctx.fillStyle = l.cosa === 'agua' ? '#5ab86a' : l.cosa === 'chaya' ? '#32936f' : 'rgba(0,0,0,0)'; ctx.fillRect(-4, -4 - (l.cosa === 'agua' ? 4 : 0), 8, 7 + (l.cosa === 'agua' ? 4 : 0)); ctx.restore(); if (l.cosa === 'chaya') letrero(ctx, `Fresita: ${4 - l.vueltas} clics`, LICUA[0], LICUA[1] - 18, '#ffffff'); if (l.cosa === 'agua') letrero(ctx, '¡lista!', LICUA[0], LICUA[1] - 18, '#ffbf00'); }
    mesa(BOTE[0], BOTE[1], 18, 18, '#6a6a6a'); ctx.fillStyle = '#3a3a3a'; ctx.fillRect(BOTE[0] - 6, BOTE[1] - 6, 12, 2);
    // Itzel con lo que lleva
    if (!(j.inv > 0 && Math.floor(j.inv * 14) % 2)) { ctx.fillStyle = 'rgba(70,40,20,.25)'; ctx.beginPath(); ctx.ellipse(p.x, p.y + 1, 6, 2, 0, 0, TAU); ctx.fill(); Object.assign(j.pose, { x: p.x, y: p.y + 1, face: p.face, vx: p.mov ? 120 : 0, run: p.run, on: true }); st.player(ctx, j.pose, f); if (p.lleva) cosa(ctx, p.lleva, p.x + p.face * 3, p.y - 22); }
    // Fresita (y lo que carga para servir)
    if (st.fresita) st.fresita(ctx, { x: j.fre.x, y: j.fre.y, face: 1 }, f);
    if (j.fre.lleva) plato(ctx, j.fre.lleva.r, j.fre.x, j.fre.y + 12);
    pintaChispas(ctx, j);
    if (st.over) st.over(ctx, f);
    ctx.fillStyle = 'rgba(60,30,20,.75)'; ctx.fillRect(0, VH - 12, VW, 12);
    ctx.font = 'bold 7px "Alegreya Sans", sans-serif'; ctx.fillStyle = '#ffbf00'; ctx.fillText(`Servidos ${j.servidos} de ${META}`, 8, VH - 3.5); ctx.fillStyle = '#ffd6e4'; ctx.fillText(`Se fueron: ${j.perdidos}`, 90, VH - 3.5);
    ctx.font = '5.5px "Alegreya Sans", sans-serif'; ctx.fillStyle = '#fff4e0'; ctx.fillText('Itzel: Espacio toma/deja · Fresita: voltea, licúa y sirve (clic en el plato y luego en el cliente) · clic derecho = calma', 160, VH - 4);
    if (j.aviso && j.t < 4) letrero(ctx, j.aviso, VW / 2, 110, '#fff4e0');
  }
  return { crear, paso, pintar };
})();
MEC.POW.cocinar = { name: 'Manos de cocinera', help: 'Clic en el comal para voltear la tortilla, clics en la licuadora para la chaya; clic en un plato listo y luego en el cliente para servir.', cd: .2, click() { return false; } };
nivel('cocina', {
  nombre: 'La cocina del mercado', lema: 'Pan de cazón, panuchos y agua de chaya: Itzel prepara, Fresita cocina y sirve.',
  modo: 'cocina', foe: 'avispa', fauna: ['avispa'], power: 'cocinar', plat: NIVELES.paper.plat, W: 30, skin: NIVELES.paper.skin,
});
NIVELES_ALT.paper = ['cocina'];

