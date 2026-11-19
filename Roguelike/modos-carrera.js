'use strict';
// =====================================================================
//  CARRERAS · El Bando, el desfile del Carnaval de Campeche (por el malecón)
//  Itzel va arriba de su carroza y compite contra los carros de los reyes del carnaval (infantil, juvenil y del
//  espectáculo) a lo largo del malecón: el mar a un lado, las familias sentadas en sus sillas apartadas, y por el camino
//  una banda de marcha, las bastoneras y las comparsas. Tres carriles (↑ ↓); → acelera y ← frena; Espacio es el empujón
//  (se carga con cacao). Hay barriles (lastiman), charcos y globos de pintura (frenan), serpentinas (aceleran) y cacao.
//  Fresita lanza confeti con el clic izquierdo y revienta lo que haya en su camino; con el derecho canta la canción de
//  cuna y los carros rivales se duermen un momento.
//  Todo está dibujado con código, en el estilo del mundo (el neón del Carnaval).
//  El libro de la enciclopedia lo corre solo (la carroza se maneja sola: ahí `inv` sube a 9).
//  Los datos del Bando (el desfile más grande del carnaval, hoy por el malecón; bandas de marcha, bastoneras, carros de
//  los reyes y comparsas; las sillas que se apartan desde la noche anterior) se confirman con el Ayuntamiento (CAMPECHE.md).
// =====================================================================
MODOS.carrera = (() => {
  const ARTE = Object.create(null);
  for (const n of ['itzel', 'infantil', 'juvenil', 'espectaculo', 'rueda', 'barril', 'barril-roto', 'globo', 'globo-roto', 'charco-rosa', 'charco-azul', 'serpentina', 'publico', 'banda', 'bastoneras', 'comparsa', 'muro', 'farola', 'ciudad', 'papel-picado', 'salida', 'meta', 'estela', 'confeti-efecto', 'pintura']) {
    const im = new Image(); im.decoding = 'async'; im.src = '../Roguelike/assets/desfile/' + n + '.png?v=1'; ARTE[n] = im;
  }
  const listo = n => ARTE[n] && ARTE[n].complete && ARTE[n].naturalWidth;
  function imagen(c, n, x, y, w, h) { if (!listo(n)) return false; c.drawImage(ARTE[n], x, y, w, h); return true; }
  const CARR = [136, 170, 204];             // y de cada carril (donde apoyan las ruedas)
  const LARGO = 2400, X0 = 112, ESC = 2;    // metros de la ruta, x de la carroza de Itzel y unidades de pantalla por metro
  const BASE = 70;                          // velocidad de crucero
  const COMPARSAS = [   // los carros de los reyes del carnaval
    { n: 'Carro del rey infantil', col: '#4fd0ff', luz: '#d4f2ff', b: 69, ph: 0 },
    { n: 'Carro del rey juvenil', col: '#e85a8a', luz: '#ffd1e6', b: 71, ph: 2.1 },
    { n: 'Carro del rey del espectáculo', col: '#f2b233', luz: '#fff0b0', b: 68, ph: 4.2 },
  ];
  // por el camino se cruzan los grupos del desfile, que marchan más despacio que los carros
  const LUGARES = [{ d: 520, n: 'La banda de marcha', k: 'banda' }, { d: 1180, n: 'Las bastoneras', k: 'bastonera' }, { d: 1820, n: 'Las comparsas', k: 'comparsa' }];
  const H = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

  function crear(def, st) {
    const r = rng((RUN && RUN.seed || 5) * 7 + 3), obst = [];
    // la ruta: filas de obstáculos cada tanto; nunca se tapan los tres carriles a la vez
    for (let d = 260; d < LARGO - 160; d += 52 + Math.floor(r() * 46)) {
      const libre = Math.floor(r() * 3), n = 1 + (r() < .45 ? 1 : 0);
      const carriles = [0, 1, 2].filter(c => c !== libre).sort(() => r() - .5).slice(0, n);
      for (const c of carriles) {
        const q = r(), tipo = q < .3 ? 'barril' : q < .52 ? 'charco' : q < .72 ? 'globo' : q < .88 ? 'serpentina' : 'cacao';
        obst.push({ d: d + r() * 14, lane: c, tipo, hecho: 0, ph: r() * 6 });
      }
      if (r() < .5) for (let k = 0; k < 4; k++) obst.push({ d: d + 14 + k * 12, lane: libre, tipo: 'cacao', hecho: 0, ph: k });
    }
    return { t: 0, win: 0, shake: 0, bubbles: [], parts: [], def, st, inv: 0, pose: poseItzel(), d: 0, v: 0, carril: 1, meta: 1, kUp: false, kDown: false,
      boost: 0, slow: 0, mancha: 0, empuje: 0, cuna: 0, cunaCd: 0, confCd: 0, letreros: [], obst, coins: 0, lugar: 4, mejor: 4,
      rivales: COMPARSAS.map((c, i) => ({ ...c, d: -6 - i * 5, v: c.b, lane: i, dorm: 0 })), fre: { x: 300, y: 90, face: 1 }, vertical: true };
  }
  const yDe = c => CARR[0] + (CARR[2] - CARR[0]) * (c / 2);
  const xDe = (j, d) => X0 + (d - j.d) * ESC;
  const lugarDe = j => 1 + j.rivales.filter(q => q.d > j.d + .5).length;

  function paso(j, dt) {
    j.t += dt; j.inv = Math.max(0, j.inv - dt); j.shake = Math.max(0, j.shake - dt);
    for (const k of ['boost', 'slow', 'mancha', 'cuna', 'cunaCd', 'confCd']) j[k] = Math.max(0, j[k] - dt);
    const k = teclas(), demo = j.inv > 5;
    // el carril: ↑ ↓ (un toque, un carril). En el libro se maneja sola: esquiva lo que viene
    if (!j.win) {
      if (demo) {
        if (!j.piloto || j.t > j.piloto) {
          j.piloto = j.t + .25;
          const costo = c => { let m = 0; for (const o of j.obst) if (!o.hecho && o.lane === c && o.d - j.d > -4 && o.d - j.d < 60) m += o.tipo === 'barril' ? 9 : o.tipo === 'charco' || o.tipo === 'globo' ? 4 : o.tipo === 'serpentina' || o.tipo === 'cacao' ? -3 : 0; return m + Math.abs(c - j.meta) * .3; };
          let mejor = j.meta; for (const c of [0, 1, 2]) if (costo(c) < costo(mejor) - .2) mejor = c; j.meta = mejor;
        }
      } else {
        if (k.up && !j.kUp && j.meta > 0) j.meta--;
        if (k.down && !j.kDown && j.meta < 2) j.meta++;
      }
      j.kUp = k.up; j.kDown = k.down;
    }
    j.carril += (j.meta - j.carril) * Math.min(1, dt * 11);
    // la velocidad
    let obj = BASE + (k.right ? 16 : 0) - (k.left ? 22 : 0) + (demo ? 6 : 0);
    if (j.boost > 0) obj += 55; if (j.slow > 0) obj *= .55;
    if ((k.space || (demo && j.empuje >= 1 && j.t % 9 < .05)) && j.empuje >= 1 && j.boost < .3 && !j.win) { j.boost = 1.3; j.empuje = 0; chispas(j, X0 - 22, yDe(j.carril) - 8, ['#ffd23f', '#ff7fb0', '#7fe0c0'], 14, 70); }
    if (j.win) obj = 0;
    j.v += (obj - j.v) * Math.min(1, dt * (j.win ? 3.2 : 3));
    j.d += j.v * dt;
    // las comparsas: cada una a su ritmo, con altibajos, y un poco de «liga» para que no se pierdan de vista
    for (const q of j.rivales) {
      q.dorm = Math.max(0, q.dorm - dt); if (j.cuna > 0) q.dorm = Math.max(q.dorm, .2);
      let v = q.b + Math.sin(j.t * .6 + q.ph) * 6 + (q.d < j.d - 110 ? 5 : 0) + (q.d > j.d + 150 ? -6 : 0); if (q.dorm > 0) v *= .35;
      q.v += (v - q.v) * Math.min(1, dt * 2); q.d = Math.min(LARGO + 40, q.d + q.v * dt);
    }
    // obstáculos
    const cy = Math.round(j.carril);
    for (const o of j.obst) {
      if (o.hecho || Math.abs(o.lane - j.carril) > .55) continue;
      const dd = o.d - j.d; if (dd > 7 || dd < -9) continue;
      o.hecho = 1; o.instante = j.t; const x = xDe(j, o.d), y = yDe(o.lane);
      if (o.tipo === 'barril') { if (dañoModo(j)) { j.slow = 1.3; } chispas(j, x, y - 8, ['#a06c34', '#6a4422', '#ffffff'], 14, 70); j.letreros.push({ txt: '¡Pum!', x, y: y - 22, t: 0, col: '#ffb09a' }); }
      else if (o.tipo === 'charco') { j.slow = Math.max(j.slow, 1.1); j.mancha = Math.max(j.mancha, .9); chispas(j, x, y - 2, ['#ff4f9a', '#4fd0ff', '#ffd23f'], 12, 60); j.letreros.push({ txt: 'pintura…', x, y: y - 22, t: 0, col: '#ffd1f0' }); }
      else if (o.tipo === 'globo') { j.slow = Math.max(j.slow, .8); j.mancha = 1.8; chispas(j, x, y - 16, ['#ff4f9a', '#4fd0ff', '#ffd23f', '#ffffff'], 18, 80); j.letreros.push({ txt: '¡Pintadera!', x, y: y - 28, t: 0, col: '#ffd1f0' }); }
      else if (o.tipo === 'serpentina') { j.boost = Math.max(j.boost, 1.5); chispas(j, x, y - 6, ['#ff7fb0', '#7fe0c0', '#ffd23f'], 16, 90); j.letreros.push({ txt: '¡Serpentina!', x, y: y - 22, t: 0, col: '#ffe9a0' }); }
      else { RUN.coins++; j.coins++; j.empuje = Math.min(1, j.empuje + .2); chispas(j, x, y - 10, ['#ffd23f', '#ffffff'], 8, 50); }
    }
    // Fresita: sigue el mouse; clic izquierdo = confeti (revienta barriles, globos y charcos cerca del clic); derecho = canción de cuna
    if (MOUSE.active) { j.fre.x += (MOUSE.x - j.fre.x) * Math.min(1, dt * 9); j.fre.y += (MOUSE.y - j.fre.y) * Math.min(1, dt * 9); }
    else { j.fre.x += (X0 + 18 - j.fre.x) * dt * 3; j.fre.y += (yDe(j.carril) - 44 - j.fre.y) * dt * 3; }
    for (const c of MOUSE.clicks) {
      if (c.up) continue;
      if (c.b === 2) { if (j.cunaCd <= 0) { j.cuna = 1.6; j.cunaCd = 7; chispas(j, j.fre.x, j.fre.y, ['#b9a7ff', '#ffffff'], 16, 60); j.letreros.push({ txt: 'la canción de cuna…', x: j.fre.x, y: j.fre.y - 12, t: 0, col: '#d8ccff' }); } continue; }
      if (j.confCd > 0) continue;
      j.confCd = .45; chispas(j, c.x, c.y, ['#ff7fb0', '#7fe0c0', '#ffd23f', '#ffffff', '#4fd0ff'], 20, 90);
      for (const o of j.obst) { if (o.hecho || !['barril', 'globo', 'charco'].includes(o.tipo)) continue; if (Math.hypot(xDe(j, o.d) - c.x, yDe(o.lane) - 8 - c.y) < 30) { o.hecho = 2; o.instante = j.t; chispas(j, xDe(j, o.d), yDe(o.lane) - 8, ['#ff7fb0', '#ffffff'], 10, 60); } }
    }
    MOUSE.clicks.length = 0;
    if (!j.win) j.lugar = lugarDe(j);
    for (const l of j.letreros) l.t += dt; j.letreros = j.letreros.filter(l => l.t < .9);
    // la meta
    if (!j.win && j.d >= LARGO) { j.win = j.t; RUN.coins += [3, 2, 1, 0][j.lugar - 1] || 0; j.final = j.lugar === 1 ? '¡Primer lugar en el Bando!' : `Llegaste en ${j.lugar}.º lugar`; chispas(j, xDe(j, LARGO) - 30, 90, ['#ffdd94', '#ff7fb0', '#7fe0c0', '#ffffff', '#4fd0ff'], 70, 150); }
    pasoChispas(j, dt);
  }

  // ---------------- dibujo ----------------
  const PASTEL = ['#e8806a', '#f2c24f', '#6ab0d8', '#d86aa0', '#7cc08a', '#c8a0e0', '#f0e0a0'];
  // una figura de un grupo del desfile (van marchando por la acera de abajo)
  function persona(ctx, x, y, t, i, k) {
    const b = Math.abs(Math.sin(t * 7 + i)) * 1.6, ropa = k === 'banda' ? ['#c8203a', '#f4f4f4'][i % 2] : k === 'bastonera' ? ['#ff4f9a', '#4fd0ff', '#ffd23f'][i % 3] : PASTEL[i % PASTEL.length];
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, y, 5, 1.4, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = ropa; ctx.fillRect(x - 3.4, y - 14 - b, 6.8, 11); ctx.fillStyle = '#2a1c3c'; ctx.fillRect(x - 3, y - 4 - b, 2.6, 4); ctx.fillRect(x + .4, y - 4 + b * .4, 2.6, 4);
    ctx.fillStyle = '#e8c9a0'; ctx.beginPath(); ctx.arc(x, y - 17 - b, 3, 0, TAU); ctx.fill();
    if (k === 'banda') { ctx.fillStyle = '#1c1424'; ctx.fillRect(x - 2.4, y - 26 - b, 4.8, 6); ctx.fillStyle = '#ffd23f'; ctx.fillRect(x - 2.4, y - 21 - b, 4.8, 1); ctx.fillStyle = i % 2 ? '#fff4e0' : '#ffd23f'; ctx.beginPath(); ctx.ellipse(x + 4, y - 8 - b, 3.6, 2.6, 0, 0, TAU); ctx.fill(); }
    else if (k === 'bastonera') { ctx.fillStyle = ropa; ctx.beginPath(); ctx.moveTo(x - 3.4, y - 6 - b); ctx.lineTo(x - 6, y - 2); ctx.lineTo(x + 6, y - 2); ctx.lineTo(x + 3.4, y - 6 - b); ctx.fill(); ctx.strokeStyle = '#fff4e0'; ctx.lineWidth = 1; const a = t * 9 + i; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 7, y - 20 + Math.sin(a) * 7); ctx.lineTo(x - Math.cos(a) * 7, y - 20 - Math.sin(a) * 7); ctx.stroke(); ctx.fillStyle = '#fff4a0'; ctx.fillRect(x + Math.cos(a) * 7 - 1, y - 21 + Math.sin(a) * 7, 2, 2); }
    else { ctx.fillStyle = PASTEL[(i + 2) % PASTEL.length]; ctx.beginPath(); ctx.moveTo(x - 4, y - 24 - b); ctx.lineTo(x, y - 30 - b); ctx.lineTo(x + 4, y - 24 - b); ctx.fill(); ctx.strokeStyle = '#ffe9a0'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(x + 3, y - 12 - b); ctx.lineTo(x + 9, y - 22 - b + Math.sin(t * 8 + i) * 2); ctx.stroke(); }
  }
  function fondo(ctx, j, f) {
    const t = j.t, off = j.d * ESC;
    // el mar de noche, con el reflejo de las luces del malecón
    const g = ctx.createLinearGradient(0, 64, 0, 112); g.addColorStop(0, '#2a2060'); g.addColorStop(.55, '#3b2d84'); g.addColorStop(1, '#1b3a78'); ctx.fillStyle = g; ctx.fillRect(0, 64, VW, 50);
    ctx.fillStyle = 'rgba(255,120,190,.35)'; ctx.fillRect(0, 63, VW, 2); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) { const x = ((i * 53 - off * .08) % (VW + 40) + VW + 40) % (VW + 40) - 20, w = 6 + (i % 4) * 5, y = 70 + (i * 17) % 40 + Math.sin(t * 1.4 + i) * 1.2; ctx.fillStyle = i % 3 ? 'rgba(79,208,255,.28)' : 'rgba(255,127,176,.3)'; ctx.fillRect(x, y, w, 1.2); }
    ctx.globalCompositeOperation = 'source-over';
    // la ciudad lejana, del otro lado de la bahía
    const lejos = off * .12, ancho = 34;
    for (let i = -1; i < VW / ancho + 2; i++) { const n = Math.floor(lejos / ancho) + i, x = n * ancho - lejos, h = 8 + H(n, 1) * 12; ctx.fillStyle = 'rgba(30,22,64,.9)'; ctx.fillRect(x, 66 - h, ancho - 3, h); ctx.fillStyle = 'rgba(255,214,130,.75)'; if (H(n, 5) > .5) ctx.fillRect(x + 6, 66 - h + 3, 2.4, 2.8); }
    // el muro del malecón, con sus farolas
    ctx.fillStyle = '#5a4a72'; ctx.fillRect(0, 108, VW, 16); ctx.fillStyle = '#7a6894'; ctx.fillRect(0, 106, VW, 4); ctx.fillStyle = 'rgba(20,10,40,.35)';
    for (let i = -1; i < VW / 22 + 2; i++) { const x = i * 22 - (off * .9 % 22); ctx.fillRect(x, 111, 1.2, 13); }
    for (let i = -1; i < VW / 96 + 2; i++) {
      const x = i * 96 - (off * .9 % 96) + 40; ctx.fillStyle = '#2a1c3c'; ctx.fillRect(x - 1, 74, 2, 34); ctx.fillStyle = '#ffe9a0'; ctx.beginPath(); ctx.arc(x, 72, 3, 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, 72, 20, '#ffcf70', .38); ctx.globalCompositeOperation = 'source-over';
    }
    // el papel picado entre las farolas
    const cuerda = off * .9 % 96;
    ctx.strokeStyle = 'rgba(255,240,210,.5)'; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(0, 40); ctx.quadraticCurveTo(VW / 2, 56, VW, 40); ctx.stroke();
    for (let i = -1; i < VW / 14 + 2; i++) { const x = i * 14 - (cuerda % 14), u = Math.max(0, Math.min(1, x / VW)), y = 40 + 32 * u * (1 - u); ctx.fillStyle = PASTEL[((i + Math.floor(cuerda / 14) + 700) % PASTEL.length)]; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 10, y); ctx.lineTo(x + 5, y + 9 + Math.sin(t * 3 + i) * 1.2); ctx.fill(); }
    // El malecón ilustrado se desplaza por capas; el mar y la iluminación anteriores permanecen.
    if (listo('ciudad')) for (let x = -(off * .12 % 210) - 210; x < VW; x += 210) imagen(ctx, 'ciudad', x, 42, 210, 50);
    if (listo('muro')) for (let x = -(off * .9 % 110) - 110; x < VW; x += 110) imagen(ctx, 'muro', x, 104, 110, 22);
    if (listo('farola')) for (let x = -(off * .9 % 120) + 40; x < VW + 20; x += 120) imagen(ctx, 'farola', x - 9, 66, 20, 43);
    if (listo('papel-picado')) for (let x = -(off * .9 % 165) - 165; x < VW; x += 165) imagen(ctx, 'papel-picado', x, 30, 165, 24);
  }
  function calle(ctx, j, f) {
    const off = j.d * ESC, t = j.t;
    // la acera del muro, con las familias sentadas en las sillas que apartaron; la de abajo, de pie
    for (const [y0, h, abajo] of [[122, 10, false], [226, 14, true]]) {
      ctx.fillStyle = abajo ? '#3a2c40' : '#4a3a52'; ctx.fillRect(0, y0, VW, h);
      if (!abajo && listo('publico')) {
        for (let x = -(off % 54) - 54; x < VW; x += 54) imagen(ctx, 'publico', x, y0 - 15, 48, 24);
        continue;
      }
      for (let i = -1; i < VW / 18 + 2; i++) {
        const n = Math.floor(off / 18) + i, x = n * 18 - off, s = H(n, 21 + (abajo ? 7 : 0));
        if (s < .35) continue; const y = abajo ? y0 + 12 : y0 + 9, b = Math.sin(t * 5 + n) * 1.4, col = PASTEL[(s * 50 | 0) % PASTEL.length];
        if (!abajo) {      // sentados: la silla, el cuerpo y los brazos arriba
          ctx.fillStyle = '#2a1c3c'; ctx.fillRect(x - 5, y - 9, 2, 9); ctx.fillRect(x - 5, y - 2, 10, 2); ctx.fillStyle = col; ctx.fillRect(x - 3, y - 9 + b * .5, 6, 7); ctx.fillStyle = '#e8c9a0'; ctx.beginPath(); ctx.arc(x, y - 12 + b * .5, 3, 0, TAU); ctx.fill();
          ctx.strokeStyle = '#e8c9a0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 3, y - 7); ctx.lineTo(x - 6, y - 13 - Math.sin(t * 6 + n)); ctx.moveTo(x + 3, y - 7); ctx.lineTo(x + 6, y - 13 + Math.sin(t * 6 + n)); ctx.stroke();
          continue;
        }
        ctx.fillStyle = col; ctx.fillRect(x - 3, y - 8 + b, 6, 8); ctx.fillStyle = '#e8c9a0'; ctx.beginPath(); ctx.arc(x, y - 11 + b, 3, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#e8c9a0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 3, y - 6 + b); ctx.lineTo(x - 6, y - 12 + b - Math.sin(t * 6 + n)); ctx.moveTo(x + 3, y - 6 + b); ctx.lineTo(x + 6, y - 12 + b + Math.sin(t * 6 + n)); ctx.stroke();
      }
    }
    // los grupos del desfile que van marchando por la acera del muro (más despacio que los carros)
    for (const L of LUGARES) { const gx = X0 + (L.d + 26 * t - j.d) * ESC; if (gx < -80 || gx > VW + 80) continue; const nombre = L.k === 'bastonera' ? 'bastoneras' : L.k; if (!imagen(ctx, nombre, gx, 102, 75, 30)) for (let i = 0; i < 5; i++) persona(ctx, gx + i * 15, 132, t, i, L.k); }
    // el asfalto, las rayas y la brillantina de las luces
    const g = ctx.createLinearGradient(0, 132, 0, 226); g.addColorStop(0, '#2a2438'); g.addColorStop(1, '#3a3048'); ctx.fillStyle = g; ctx.fillRect(0, 132, VW, 94);
    ctx.strokeStyle = 'rgba(255,240,210,.35)'; ctx.lineWidth = 1.2; ctx.setLineDash([14, 12]); ctx.lineDashOffset = off % 26;
    for (const y of [(CARR[0] + CARR[1]) / 2 + 4, (CARR[1] + CARR[2]) / 2 + 4]) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(VW, y); ctx.stroke(); }
    ctx.setLineDash([]);
    // la salida y la meta
    for (const [d, txt, col] of [[0, 'SALIDA', '#7fe0c0'], [LARGO, 'META', '#ffd23f']]) {
      const x = xDe(j, d); if (x < -30 || x > VW + 30) continue;
      ctx.fillStyle = 'rgba(255,255,255,.85)'; for (let a = 0; a < 6; a++) for (let b = 0; b < 2; b++) { ctx.fillStyle = (a + b) % 2 ? '#1a1a1a' : '#f4f4f4'; ctx.fillRect(x - 2 + b * 4, 134 + a * 16, 4, 16); }
      if (!imagen(ctx, d === 0 ? 'salida' : 'meta', x - 80, 66, 160, 150)) { ctx.fillStyle = col; ctx.fillRect(x - 3, 88, 3, 46); ctx.fillRect(x + 3, 88, 3, 46); ctx.fillRect(x - 3, 88, 12, 12); ctx.font = 'bold 6px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#2a1c3c'; ctx.fillText(txt, x + 3, 97); }
    }
  }
  function carroza(ctx, x, y, col, luz, t, tema) {
    if (typeof tema === 'string' && imagen(ctx, tema, x - 31, y - 45, 62, 45)) {
      if (tema === 'itzel' && listo('rueda')) for (const dx of [-18, 18]) { ctx.save(); ctx.translate(x + dx, y - 5); ctx.rotate(t * 5); imagen(ctx, 'rueda', -5, -5, 10, 10); ctx.restore(); }
      return;
    }
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0, 1, 30, 4, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = col; ctx.fillRect(-26, -16, 52, 11); ctx.fillStyle = luz;                      // la caja, con su greca
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(-26 + i * 6, -5); ctx.lineTo(-23 + i * 6, -11); ctx.lineTo(-20 + i * 6, -5); ctx.fill(); }
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(-26, -16, 52, 2);
    for (const wx of [-17, 17]) { ctx.fillStyle = '#1c1424'; ctx.beginPath(); ctx.arc(wx, -4, 5.6, 0, TAU); ctx.fill(); ctx.strokeStyle = luz; ctx.lineWidth = .9; ctx.beginPath(); ctx.arc(wx, -4, 3.2, 0, TAU); ctx.stroke(); ctx.save(); ctx.translate(wx, -4); ctx.rotate(t * 6); ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(3, 0); ctx.stroke(); ctx.restore(); }
    // flores de papel y serpentinas
    for (let i = 0; i < 6; i++) { const fx = -22 + i * 9, fy = -17 - Math.abs(Math.sin(t * 3 + i)) * 1.2; ctx.fillStyle = PASTEL[i % PASTEL.length]; ctx.beginPath(); ctx.arc(fx, fy, 3.2, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff4d0'; ctx.beginPath(); ctx.arc(fx, fy, 1.1, 0, TAU); ctx.fill(); }
    ctx.strokeStyle = luz; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(-28, -19); for (let i = 0; i <= 6; i++) ctx.lineTo(-28 - i * 3, -19 + Math.sin(t * 8 + i) * 3 + i * .8); ctx.stroke();
    if (typeof tema === 'function') tema(ctx, t);
    ctx.restore();
  }
  function obstaculo(ctx, o, x, y, t, f) {
    if (o.hecho) {
      if (Number.isFinite(o.instante) && t - o.instante < .35) {
        const n = o.tipo === 'barril' ? 'barril-roto' : o.tipo === 'globo' ? 'globo-roto' : o.tipo === 'charco' ? 'pintura' : 'confeti-efecto';
        ctx.save(); ctx.globalAlpha = 1 - (t - o.instante) / .35; imagen(ctx, n, x - 15, y - 24, 30, 24); ctx.restore();
      }
      return;
    }
    const sprite = o.tipo === 'charco' ? ((o.ph | 0) % 2 ? 'charco-azul' : 'charco-rosa') : o.tipo;
    const dimensiones = { barril: [17, 20], globo: [16, 25], serpentina: [26, 9], 'charco-azul': [32, 11], 'charco-rosa': [32, 11] };
    const tam = dimensiones[sprite];
    if (tam && imagen(ctx, sprite, x - tam[0] / 2, y - tam[1], tam[0], tam[1])) return;
    if (o.tipo === 'barril') { ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, y, 9, 2.4, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#8a5a2e'; ctx.beginPath(); ctx.ellipse(x, y - 8, 7.4, 9, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 1; for (const dy of [-12, -4]) { ctx.beginPath(); ctx.moveTo(x - 7, y + dy); ctx.lineTo(x + 7, y + dy); ctx.stroke(); } ctx.fillStyle = '#ffd23f'; ctx.fillRect(x - 1.5, y - 10, 3, 3); }
    else if (o.tipo === 'charco') { const c = ['#ff4f9a', '#4fd0ff', '#ffd23f'][(o.ph | 0) % 3]; ctx.fillStyle = c; ctx.globalAlpha = .85; ctx.beginPath(); ctx.ellipse(x, y - 3, 16, 5.4, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(x - 5, y - 4.4, 4, 1.3, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
    else if (o.tipo === 'globo') { const by = y - 22 + Math.sin(t * 3 + o.ph) * 2.6; ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(x, by + 9); ctx.lineTo(x + Math.sin(t * 2 + o.ph) * 2, y - 8); ctx.stroke(); const c = ['#ff4f9a', '#4fd0ff', '#ffd23f'][(o.ph | 0) % 3]; ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, by, 7, 8.4, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(x - 2.4, by - 3, 1.8, 2.6, -.5, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x, y, 6, 1.8, 0, 0, TAU); ctx.fill(); }
    else if (o.tipo === 'serpentina') { ctx.fillStyle = 'rgba(255,214,130,.25)'; ctx.fillRect(x - 12, y - 7, 24, 7); for (let i = 0; i < 3; i++) { ctx.strokeStyle = ['#ff7fb0', '#7fe0c0', '#ffd23f'][i]; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x - 10 + i * 6, y - 1); ctx.lineTo(x - 6 + i * 6, y - 6); ctx.lineTo(x - 2 + i * 6, y - 1); ctx.stroke(); } }
    else if (typeof monedaItzel === 'function') monedaItzel(ctx, x, y - 10 + Math.sin(t * 4 + o.ph) * 1.2, t, f);
    else { ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(x, y - 10, 4, 0, TAU); ctx.fill(); }
  }
  function pintar(j, view) {
    const M = marcoModo(j, view), ctx = M.ctx, f = M.f, st = M.st, t = j.t;
    j.panCam = j.d * .35; f.cam = (typeof L !== 'undefined' ? L.camMin : 0) + j.panCam;
    ctx.save(); if (j.shake > 0) ctx.translate((Math.random() - .5) * 3 * j.shake / .3, (Math.random() - .5) * 3 * j.shake / .3);
    fondo(ctx, j, f); calle(ctx, j, f);
    // de arriba hacia abajo: lo más lejano primero (carril 0 es el de arriba)
    const vivos = [];
    for (const o of j.obst) { const x = xDe(j, o.d); if (x > -24 && x < VW + 24 && (!o.hecho || (Number.isFinite(o.instante) && t - o.instante < .35))) vivos.push({ y: yDe(o.lane), z: 0, f: () => obstaculo(ctx, o, x, yDe(o.lane), t, f) }); }
    COMPARSAS.forEach((c, i) => { const q = j.rivales[i], x = xDe(j, q.d); if (x > -50 && x < VW + 50) vivos.push({ y: yDe(q.lane) - .5, z: 1, f: () => {
      carroza(ctx, x, yDe(q.lane), q.col, q.luz, t + i, ['infantil', 'juvenil', 'espectaculo'][i]); ctx.font = 'bold 5.4px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,240,210,.8)'; ctx.fillText(q.n, x, yDe(q.lane) - 46);
      if (q.dorm > 0) { ctx.fillStyle = '#d8ccff'; ctx.fillText('z z z', x + 14, yDe(q.lane) - 34 - Math.sin(t * 4) * 2); } } }); });
    const yI = yDe(j.carril);
    vivos.push({ y: yI, z: 2, f: () => {
      if (j.boost > 0) { ctx.globalCompositeOperation = 'lighter'; if (!imagen(ctx, 'estela', X0 - 72, yI - 21, 50, 16)) glowDot(ctx, X0 - 30, yI - 10, 22, '#ffb347', .55); ctx.globalCompositeOperation = 'source-over'; }
      carroza(ctx, X0, yI, '#c8203a', '#ffe08a', t, 'itzel');
      j.pose.x = X0 + 2; j.pose.y = yI - 16; j.pose.on = true; j.pose.vx = Math.max(0, j.v); j.pose.run += j.v * .02; j.pose.face = 1; j.pose.vis = true; j.pose.inv = j.inv > 5 ? 0 : j.inv;
      if (!(j.inv > 0 && j.inv <= 5 && Math.floor(j.inv * 14) % 2)) st.player(ctx, j.pose, f);
    } });
    vivos.sort((a, b) => a.y - b.y || a.z - b.z); for (const v of vivos) v.f();
    // Fresita
    { const fr = { x: j.fre.x, y: j.fre.y + Math.sin(t * 3) * 1.2, face: 1 }; if (st.fresita) st.fresita(ctx, fr, f); else if (typeof drawFresita === 'function') drawFresita(ctx, fr, t, st.pixel); }
    pintaChispas(ctx, j);
    for (const l of j.letreros) { ctx.globalAlpha = 1 - l.t / .9; letrero(ctx, l.txt, l.x, l.y - l.t * 14, l.col); } ctx.globalAlpha = 1;
    ctx.restore();
    // la pintura en la cara (ya sin sacudida)
    if (j.mancha > 0) { ctx.save(); ctx.globalAlpha = Math.min(.55, j.mancha * .4); for (let i = 0; i < 6; i++) { ctx.fillStyle = ['#ff4f9a', '#4fd0ff', '#ffd23f'][i % 3]; ctx.beginPath(); ctx.ellipse(40 + i * 64, 20 + (i % 3) * 22, 18 + (i % 2) * 8, 10, 0, 0, TAU); ctx.fill(); } ctx.restore(); }
    if (st.over) st.over(ctx, f);
    // la barra de abajo: el lugar, la ruta y el empujón
    ctx.fillStyle = 'rgba(30,18,40,.82)'; ctx.fillRect(0, VH - 14, VW, 14);
    ctx.font = 'bold 7px "Alegreya Sans", sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = '#ffd23f'; ctx.fillText(`${j.lugar}.º de 4`, 8, VH - 4.5);
    const bx = 52, bw = 190; ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(bx, VH - 9, bw, 3);
    for (const L of LUGARES) { ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(bx + bw * L.d / LARGO - .5, VH - 11, 1.2, 7); }
    for (const q of j.rivales) { ctx.fillStyle = q.col; ctx.beginPath(); ctx.arc(bx + bw * clamp(q.d / LARGO, 0, 1), VH - 7.5, 2.4, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(bx + bw * clamp(j.d / LARGO, 0, 1), VH - 7.5, 3.2, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffd6e4'; ctx.fillText('Empujón', 254, VH - 4.5); ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(290, VH - 9.5, 44, 5); ctx.fillStyle = j.empuje >= 1 ? '#7fe0c0' : '#ff7fb0'; ctx.fillRect(290, VH - 9.5, 44 * j.empuje, 5);
    ctx.font = '5.4px "Alegreya Sans", sans-serif'; ctx.fillStyle = '#fff4e0'; ctx.fillText('↑ ↓ carril · → acelera · Espacio empujón · Fresita: clic = confeti', 342 - 60, VH - 4.5);
    const meta = LUGARES.find(L => j.d > L.d - 40 && j.d < L.d + 30); if (meta && !j.win) letrero(ctx, meta.n, 213, 24, '#fff4e0');
    if (j.t < 2.2) letrero(ctx, '¡Arranca el Bando!', 213, 80, '#fff4e0');
    if (j.win) { letrero(ctx, j.final, 213, 70, '#ffd23f'); letrero(ctx, '¡Fin del recorrido por el malecón!', 213, 84, '#fff4e0'); }
  }
  return { crear, paso, pintar, vertical: true };
})();
MEC.POW.confetiFresita = { name: 'Confeti de Fresita', help: 'Clic: lanza confeti donde apuntas y revienta barriles, globos y charcos de pintura. Clic derecho: la canción de cuna duerme un momento a las comparsas.', cd: .05, click() { return false; } };
nivel('desfile', {
  nombre: 'El Bando: el desfile del carnaval', lugar: 'Malecón de Campeche',
  lema: 'El Sábado de Bando: Itzel sube a su carroza y corre por el malecón contra los carros de los reyes del carnaval. Esquiva barriles, pintadera y charcos, junta serpentinas y llega al final del recorrido. Fresita lanza confeti.',
  dato: 'El Bando, o Sábado de Bando, es el desfile más grande y tradicional del Carnaval de Campeche, que se considera uno de los más antiguos de México, con registros desde 1582. Hoy el recorrido va por el malecón. Desfilan bandas de marcha, bastoneras, carros alegóricos de los reyes del carnaval (infantil, juvenil y del espectáculo), comparsas y gente disfrazada, y las familias apartan sus sillas a lo largo del recorrido desde la noche anterior.',
  modo: 'carrera', foe: 'pintador', fauna: ['pintador'], power: 'confetiFresita', plat: NIVELES.neon.plat, W: 30, skin: NIVELES.neon.skin, fiesta: 'carnaval', peso: 1.3,
});
(NIVELES_ALT.neon = NIVELES_ALT.neon || []).push('desfile');
