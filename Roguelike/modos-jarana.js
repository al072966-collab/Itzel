'use strict';
// Baile de la Campechanidad: Itzel sigue las flechas y Fresita las palmas.
// Los tiempos corresponden a los acentos de la grabación.
MODOS.campechanidad = (() => {
  const BPM = 99.4, OCT = 60 / BPM / 2;                  // duración de una corchea
  const CAE = 1.7;                                      // segundos que tarda en bajar una nota
  const VENT = [.075, .16];                             // ventana de «¡así!» y de «bien»
  const CARRILES = [{ k: ['ArrowLeft', 'KeyA'], col: '#e85a4f', dir: 'izq' }, { k: ['ArrowDown', 'KeyS'], col: '#4f8fd6', dir: 'abajo' }, { k: ['ArrowUp', 'KeyW'], col: '#5fae6a', dir: 'arriba' }, { k: ['ArrowRight', 'KeyD'], col: '#f2b233', dir: 'der' }];
  const LX = [30, 54, 78, 102], LY = 206, RX = 386, RY = 196;
  const plaza = new Image(); plaza.src = '../Roguelike/assets/jarana-nueva/plaza-textura.png';
  const baileItzel = new Image();
  baileItzel.src = 'assets/forge/itzel/nouveau-baile-lento-expresivo-v1/sheet-transparent.png';
  const tropiezoItzel = new Image();
  tropiezoItzel.src = 'assets/forge/itzel/nouveau-tropiezo-v1/sheet-transparent.png';
  const DUR_TROPIEZO = .64;
  // Acentos detectados en la grabación «Campechanita habanera», en segundos.
  const ACENTOS = [2.601, 2.879, 3.158, 3.808, 4.11, 4.412, 4.737, 4.992, 5.341, 5.619, 5.944, 6.223, 6.525, 6.827, 7.129, 7.454, 7.732, 8.034, 8.522, 8.916, 9.265, 9.799, 10.101, 10.542, 11.006, 11.471, 11.749, 12.237, 12.678, 12.98, 13.607, 13.909, 14.211, 14.489, 14.814, 15.441, 15.882, 16.324, 16.649, 17.136, 17.601, 17.903, 18.506, 18.785, 19.11, 19.412, 19.714, 20.039, 20.341, 20.782, 21.246, 21.571, 21.85, 22.175, 22.477, 22.802, 23.266, 23.568, 24.033, 24.311, 24.636, 24.938, 25.24, 25.542, 25.844, 26.122, 26.448, 26.889, 27.353, 27.655, 27.957, 28.282, 28.537, 28.886, 29.164, 29.489, 29.814, 30.093, 30.72, 31.347, 31.602, 31.927, 32.276, 32.554, 33.019, 33.785, 34.087, 34.412, 34.691, 35.016, 35.318, 35.643, 35.921, 36.246, 36.688, 37.129, 37.454, 37.756, 38.058, 38.592, 39.033, 39.335, 39.636, 39.915, 40.565, 40.844, 41.123, 41.587, 42.051, 42.376, 42.701, 42.957, 43.305, 43.584, 43.909, 44.188, 44.489, 44.791, 45.093, 45.418, 45.697, 45.999, 46.463, 46.881, 47.206, 47.763, 48.205, 48.506, 48.971, 49.435, 49.714, 50.341, 50.643, 50.945, 51.548, 51.873, 52.152, 52.477, 52.779, 53.081, 53.383, 53.847, 54.288, 54.613, 55.101, 55.565, 55.844, 56.471, 56.75, 57.075, 57.377, 57.678, 58.003, 58.305, 58.746, 59.211, 59.536, 59.815, 60.14, 60.442, 60.767, 61.208, 61.533, 61.974, 62.601, 62.903, 63.205, 63.483, 63.808, 64.064, 64.389, 64.853, 65.318, 65.62, 65.898, 66.223, 66.502, 66.85, 67.129, 67.454, 67.779, 68.058, 68.685, 69.288, 69.567, 69.892, 70.194, 70.519, 70.983, 71.75, 72.052, 72.353, 72.655, 72.98, 73.282, 73.607, 73.863, 74.211, 74.652, 75.117, 75.418, 76.022, 76.533, 76.997, 77.299, 77.601, 77.88, 78.53, 78.809, 79.087, 79.552, 80.016, 80.318, 80.643, 80.922, 81.27, 81.548, 81.874, 82.175, 82.454, 82.756, 83.058, 83.36, 83.661, 83.963, 84.428, 84.846, 85.171, 85.728, 86.169, 86.471, 86.936, 87.377, 87.679, 88.305, 88.607, 88.909, 89.513, 89.838, 90.117, 90.442, 90.744, 91.045, 91.347, 91.812, 92.253, 92.578, 93.042, 93.53, 93.809, 94.436, 94.714, 95.039, 95.318, 95.643, 95.945, 96.247, 96.711, 97.176, 97.477, 97.779, 98.104, 98.406, 98.708, 99.172, 99.498, 99.939, 100.566, 100.867, 101.169, 101.448, 101.773, 102.028, 102.354, 102.818, 103.282, 103.584, 103.863, 104.188, 104.467, 104.815, 105.094, 105.419, 105.72, 106.022, 106.649, 107.253, 107.532, 107.857, 108.182, 108.484, 108.925, 109.273, 109.714, 109.993, 110.318, 110.62, 110.922, 111.224];
  function coreografia(rand) {
    const notas = [], palmas = [], bombas = [], compases = []; let lastLane = -1;
    ACENTOS.forEach((t, i) => {
      if (t < 5.3) return; // Deja una breve introducción antes de mostrar notas.
      // Empieza con espacio para aprender y añade acentos en cada etapa.
      const etapa = t < 30 ? 0 : t < 65 ? 1 : 2;
      if (etapa === 0 && i % 4 !== 0 && i % 4 !== 2) return;
      if (etapa === 1 && i % 2 && i % 8 !== 7) return;
      if (i % 4 === 2) { palmas.push({ t, dur: 0, st: null }); return; }
      let lane = Math.floor(rand() * 4); if (lane === lastLane) lane = (lane + 1 + Math.floor(rand() * 3)) % 4;
      lastLane = lane; notas.push({ t, lane, dur: 0, st: null });
    });
    // No se coloca otra nota del mismo control dentro de una sostenida.
    const largas = (lista, mismoControl) => lista.forEach((n, i) => {
      if (n.t < 18 || i % (n.t < 65 ? 7 : 5) !== 3) return;
      const siguiente = lista.slice(i + 1).find(otra => mismoControl(n, otra));
      const espacio = siguiente ? siguiente.t - n.t : 2;
      const dur = Math.min(n.t < 65 ? .65 : .9, espacio - .24, 113.2 - n.t);
      if (dur >= .35) n.dur = dur;
    });
    largas(notas, (a, b) => a.lane === b.lane);
    largas(palmas, () => true);
    return { notas, palmas, bombas, compases, compasI: 0, fin: 113.4 };
  }
  function crear(def, st) {
    const r = rng((RUN && RUN.seed || 7) + 11);
    const c = coreografia(r);
    return { t: 0, win: 0, shake: 0, bubbles: [], parts: [], def, st, inv: 0, ...c, pose: poseItzel(), teclas: {}, tamb: 0, caidas: 0,
      tropiezo: 0, inicioBaile: null, palmaPulsada: false, aciertos: 0, total: c.notas.length + c.palmas.length, combo: 0, mejor: 0, letreros: [], paso: 0, giro: 0, fre: { x: 300, y: 130 } };
  }
  const enBomba = (j, t = j.t) => j.bombas.find(b => t >= b.t && t < b.t + b.dur);
  function califica(j, dt, x, y, col) {
    const ok = Math.abs(dt) < VENT[0] ? '¡Así!' : '¡Bien!';
    j.aciertos++; j.combo++; j.mejor = Math.max(j.mejor, j.combo); j.tamb = Math.max(0, j.tamb - .5);
    j.letreros.push({ txt: ok, x, y, t: 0, col }); chispas(j, x, y, [col, '#ffffff'], ok === '¡Así!' ? 10 : 5, 50);
    if (j.combo % 10 === 0) { RUN.coins += 1; j.letreros.push({ txt: `${j.combo} seguidos`, x: 213, y: 70, t: 0, col: '#ffd23f' }); }
  }
  function falla(j, x, y) {
    j.combo = 0; j.tamb += 1; j.letreros.push({ txt: 'uy…', x, y, t: 0, col: '#c9c0b0' });
    if (j.tamb >= 6) { j.tamb = 0; j.caidas++; dañoModo(j); j.letreros.push({ txt: '¡Sigan el ritmo!', x: 213, y: 90, t: 0, col: '#ff9a8a' }); }
  }
  function tropezar(j) { if (j.inicioBaile !== null && j.tropiezo <= 0) j.tropiezo = DUR_TROPIEZO; }
  function paso(j, dt) {
    const reloj = window.AUDIO_ARCHIVOS && window.AUDIO_ARCHIVOS.tiempoCampechanidad();
    if (reloj === undefined) j.t += dt; else if (reloj !== null) j.t = reloj;
    j.tropiezo = Math.max(0, j.tropiezo - dt);
    j.inv = Math.max(0, j.inv - dt); j.shake = Math.max(0, j.shake - dt);
    const t = j.t;
    // Una nota larga se califica al terminar; soltarla antes cuenta como fallo una sola vez.
    CARRILES.forEach((cr, lane) => {
      const on = cr.k.some(k => KEYS.has(k)), antes = !!j.teclas[lane]; j.teclas[lane] = on;
      const sostenida = j.notas.find(q => q.lane === lane && q.st === 'sosteniendo');
      if (sostenida) {
        if (t >= sostenida.t + sostenida.dur - .08) {
          sostenida.st = 'ok'; califica(j, sostenida.precision, LX[lane], LY - 14, cr.col);
        } else if (!on) { sostenida.st = 'x'; falla(j, LX[lane], LY - 14); tropezar(j); }
      }
      if (!on || antes || enBomba(j)) return;
      j.paso = .18; j.giro = lane;
      const n = j.notas.filter(q => q.lane === lane && !q.st).sort((a, b) => Math.abs(a.t - t) - Math.abs(b.t - t))[0];
      if (n && Math.abs(n.t - t) < VENT[1]) {
        if (j.inicioBaile === null) j.inicioBaile = t;
        if (n.dur) { n.st = 'sosteniendo'; n.precision = n.t - t; }
        else { n.st = 'ok'; califica(j, n.t - t, LX[lane], LY - 14, cr.col); }
      } else { tropezar(j); j.combo = 0; j.letreros.push({ txt: '·', x: LX[lane], y: LY - 14, t: 0, col: '#c9c0b0' }); }
    });
    // Las palmas largas se mantienen con el botón izquierdo y se califican al terminar.
    const terminarPalma = (n, exito) => {
      n.st = exito ? 'ok' : 'x';
      if (exito) { califica(j, n.precision, RX, RY - 16, '#ff7fb0'); j.aplauso = .25; }
      else falla(j, RX, RY - 16);
    };
    for (const c of MOUSE.clicks) {
      if (c.b !== 0 || c.move) continue;
      const sostenida = j.palmas.find(q => q.st === 'sosteniendo');
      if (c.up) {
        j.palmaPulsada = false;
        if (sostenida) terminarPalma(sostenida, t >= sostenida.t + sostenida.dur - .08);
        continue;
      }
      if (j.palmaPulsada || enBomba(j)) continue;
      j.palmaPulsada = true;
      const n = j.palmas.filter(q => !q.st).sort((a, b) => Math.abs(a.t - t) - Math.abs(b.t - t))[0];
      if (n && Math.abs(n.t - t) < VENT[1]) {
        if (n.dur) { n.st = 'sosteniendo'; n.precision = n.t - t; }
        else { n.st = 'ok'; califica(j, n.t - t, RX, RY - 16, '#ff7fb0'); j.aplauso = .25; }
      } else j.combo = 0;
    }
    const palmaSostenida = j.palmas.find(q => q.st === 'sosteniendo');
    if (palmaSostenida && j.palmaPulsada && t >= palmaSostenida.t + palmaSostenida.dur - .08) terminarPalma(palmaSostenida, true);
    MOUSE.clicks.length = 0;
    if (MOUSE.active) { j.fre.x += (MOUSE.x - j.fre.x) * Math.min(1, dt * 8); j.fre.y += (MOUSE.y - j.fre.y) * Math.min(1, dt * 8); }
    // las que se pasaron
    for (const n of j.notas) if (!n.st && t - n.t > VENT[1]) { n.st = 'x'; falla(j, LX[n.lane], LY - 14); tropezar(j); }
    for (const n of j.palmas) if (!n.st && t - n.t > VENT[1]) { n.st = 'x'; falla(j, RX, RY - 16); }
    j.paso = Math.max(0, j.paso - dt); j.aplauso = Math.max(0, (j.aplauso || 0) - dt);
    for (const l of j.letreros) l.t += dt; j.letreros = j.letreros.filter(l => l.t < .8);
    if (!j.win && t > j.fin) {
      j.win = t; const pct = j.aciertos / j.total;
      j.final = pct > .9 ? '¡Campechanita de corazón!' : pct > .7 ? '¡Qué bonito bailan!' : pct > .45 ? 'Ya le van agarrando el paso' : '¡A seguir bailando!';
      RUN.coins += Math.round(j.aciertos / 4); chispas(j, 213, 80, ['#e85a4f', '#f2b233', '#5fae6a', '#4f8fd6', '#ffffff'], 60, 140);
      if (typeof ENCI !== 'undefined') ENCI.ver('poder:jaranear');
    }
    pasoChispas(j, dt);
  }
  // ---------------- dibujo ----------------
  function flecha(ctx, x, y, dir, col, lleno, s = 1) {
    ctx.save(); ctx.translate(x, y); ctx.rotate({ izq: Math.PI, abajo: Math.PI / 2, arriba: -Math.PI / 2, der: 0 }[dir]); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(0, -7); ctx.lineTo(0, -3.4); ctx.lineTo(-7, -3.4); ctx.lineTo(-7, 3.4); ctx.lineTo(0, 3.4); ctx.lineTo(0, 7); ctx.closePath();
    if (lleno) { ctx.fillStyle = col; ctx.fill(); }
    ctx.strokeStyle = lleno ? 'rgba(255,250,235,.9)' : col; ctx.setLineDash(lleno ? [1.4, 1.2] : []); ctx.lineWidth = lleno ? .7 : 1.2; ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
  }
  function catedral(ctx, x, y, t, pulso) {
    // la catedral de Campeche: dos torres con sus remates, la fachada y la plaza delante
    ctx.save(); ctx.fillStyle = 'rgba(40,26,40,.82)';
    const torre = (tx2) => { ctx.fillRect(tx2 - 9, y - 66, 18, 66); ctx.fillRect(tx2 - 7, y - 80, 14, 14); ctx.fillRect(tx2 - 5, y - 92, 10, 12); ctx.beginPath(); ctx.arc(tx2, y - 92, 5, Math.PI, 0); ctx.fill(); ctx.fillRect(tx2 - .6, y - 103, 1.2, 7); ctx.fillRect(tx2 - 2.4, y - 100, 4.8, 1.2); };
    torre(x - 42); torre(x + 42);
    ctx.fillRect(x - 33, y - 52, 66, 52); ctx.beginPath(); ctx.moveTo(x - 33, y - 52); ctx.quadraticCurveTo(x, y - 70, x + 33, y - 52); ctx.fill();
    ctx.fillStyle = `rgba(255,214,140,${.35 + pulso * .25})`;
    ctx.beginPath(); ctx.arc(x, y - 18, 7, Math.PI, 0); ctx.lineTo(x + 7, y); ctx.lineTo(x - 7, y); ctx.fill();
    for (const tx2 of [x - 42, x + 42]) for (const ty of [y - 74, y - 58]) { ctx.beginPath(); ctx.arc(tx2, ty, 2.4, Math.PI, 0); ctx.lineTo(tx2 + 2.4, ty + 5); ctx.lineTo(tx2 - 2.4, ty + 5); ctx.fill(); }
    ctx.beginPath(); ctx.arc(x, y - 42, 4.5, 0, TAU); ctx.fill();
    ctx.restore();
  }
  function pintar(j, view) {
    const { ctx, f, st } = marcoModo(j, view), t = j.t, pulso = Math.max(0, 1 - ((t - 2.2) / OCT % 3) / 1.2);
    // la plaza de noche
    if (plaza.complete && plaza.naturalWidth) ctx.drawImage(plaza, 0, 0, VW, VH);
    else catedral(ctx, 213, 168, t, pulso);
    const pg = ctx.createLinearGradient(0, 168, 0, VH); pg.addColorStop(0, 'rgba(75,43,48,.1)'); pg.addColorStop(1, 'rgba(42,28,35,.38)'); ctx.fillStyle = pg; ctx.fillRect(0, 168, VW, VH - 168);
    ctx.strokeStyle = 'rgba(255,240,220,.08)'; ctx.lineWidth = .6; for (let k = -10; k < 20; k++) { ctx.beginPath(); ctx.moveTo(213 + k * 26, 168); ctx.lineTo(213 + k * 60, VH); ctx.stroke(); }
    // farolitos colgados de lado a lado, que se prenden con el compás
    for (let row = 0; row < 2; row++) {
      const y0 = 30 + row * 22; ctx.strokeStyle = 'rgba(255,240,220,.45)'; ctx.lineWidth = .5; ctx.beginPath();
      for (let k = 0; k <= 20; k++) { const u = k / 20, x = u * VW, y = y0 + Math.sin(u * Math.PI) * 18; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      for (let k = 1; k < 14; k++) { const u = k / 14, x = u * VW, y = y0 + Math.sin(u * Math.PI) * 18 + 2, col = ['#e85a4f', '#f2b233', '#5fae6a', '#4f8fd6', '#ff7fb0'][(k + row) % 5], on = (k + Math.floor((t - 2.2) / OCT)) % 3 === 0;
        if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y + 3, 9, col, .5); ctx.restore(); }
        ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y + 3, 2.6, 3.4, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(x - 2.6, y + 2.6, 5.2, .6); }
    }
    if (typeof JARANA_DETALLES !== 'undefined') JARANA_DETALLES.pinta(ctx);
    // la tarima
    ctx.fillStyle = '#8a5a3a'; ctx.fillRect(140, 196, 146, 10); ctx.fillStyle = '#6a4228'; ctx.fillRect(140, 206, 146, 6); for (let x = 144; x < 286; x += 12) { ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(x, 196, .8, 16); }
    // Itzel baila sin la charola ni la botella de la vaquería
    const p = j.pose, salta = j.inicioBaile !== null && j.paso > 0 ? Math.sin(j.paso / .18 * Math.PI) * 3 : 0, vaiven = j.inicioBaile !== null ? Math.sin((t - j.inicioBaile) / OCT * Math.PI / 3) * 4 : 0;
    Object.assign(p, { x: 213 + vaiven, y: 196 - salta, face: j.giro % 2 ? -1 : 1, vx: j.paso > 0 ? 100 : 0, run: t * 8, on: salta < .5 });
    if (!(j.inv > 0 && Math.floor(j.inv * 14) % 2)) {
      if (j.tropiezo > 0 && tropiezoItzel.complete && tropiezoItzel.naturalWidth === 512 && tropiezoItzel.naturalHeight === 512) {
        const cuadro = Math.min(3, Math.floor((DUR_TROPIEZO - j.tropiezo) / .16)), lado = 68;
        ctx.drawImage(tropiezoItzel, (cuadro % 2) * 256, Math.floor(cuadro / 2) * 256, 256, 256, p.x - lado / 2, p.y - lado * 238 / 256, lado, lado);
      } else if (baileItzel.complete && baileItzel.naturalWidth === 1280 && baileItzel.naturalHeight === 1536) {
        const cuadro = j.inicioBaile === null ? 0 : Math.floor(Math.max(0, t - j.inicioBaile) / .16) % 30, lado = 68;
        ctx.drawImage(baileItzel, (cuadro % 5) * 256, Math.floor(cuadro / 5) * 256, 256, 256, p.x - lado / 2, p.y - lado * 238 / 256, lado, lado);
      } else st.player(ctx, p, f);
    }
    // Fresita aplaudiendo arriba de la tarima (o donde esté el ratón)
    if (st.fresita) st.fresita(ctx, { x: j.fre.x, y: j.fre.y + Math.sin(t * 4) * 2 - (j.aplauso > 0 ? 3 : 0), face: j.fre.x < 213 ? 1 : -1 }, f);
    // carriles de Itzel
    ctx.fillStyle = 'rgba(20,12,20,.45)'; ctx.fillRect(16, 18, 100, LY + 10 - 18);
    CARRILES.forEach((cr, lane) => { flecha(ctx, LX[lane], LY, cr.dir, cr.col, false, j.teclas[lane] ? 1.15 : 1); });
    if (!enBomba(j)) for (const n of j.notas) {
      if (n.st === 'ok') continue;
      const u = (n.t - j.t) / CAE, fin = (n.t + (n.dur || 0) - j.t) / CAE;
      if (u > 1 || fin < -.12) continue;
      const cr = CARRILES[n.lane], y = LY - u * (LY - 26), cola = LY - fin * (LY - 26);
      ctx.save(); ctx.beginPath(); ctx.rect(16, 18, 100, LY + 6); ctx.clip();
      ctx.globalAlpha = n.st === 'x' ? .3 : 1;
      if (n.dur) {
        const cabeza = Math.min(LY, y), arriba = Math.max(20, cola);
        ctx.fillStyle = cr.col; ctx.globalAlpha *= .65; ctx.fillRect(LX[n.lane] - 3, arriba, 6, Math.max(0, cabeza - arriba));
        ctx.globalAlpha = n.st === 'x' ? .3 : 1; ctx.strokeStyle = '#fff4df'; ctx.lineWidth = .6; ctx.strokeRect(LX[n.lane] - 3, arriba, 6, Math.max(0, cabeza - arriba));
      }
      flecha(ctx, LX[n.lane], Math.min(LY, y), cr.dir, cr.col, true); ctx.restore();
    }
    // aro de Fresita
    ctx.fillStyle = 'rgba(20,12,20,.45)'; ctx.fillRect(RX - 22, 18, 44, LY + 10 - 18);
    ctx.strokeStyle = j.aplauso > 0 ? '#ffffff' : '#ff7fb0'; ctx.lineWidth = 1.4; ctx.setLineDash([2, 1.6]); ctx.beginPath(); ctx.arc(RX, RY, 11, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    if (!enBomba(j)) for (const n of j.palmas) {
      if (n.st === 'ok') continue;
      const u = (n.t - j.t) / CAE, fin = (n.t + (n.dur || 0) - j.t) / CAE;
      if (u > 1 || fin < -.12) continue;
      const y = RY - u * (RY - 26), cola = RY - fin * (RY - 26);
      ctx.save(); ctx.beginPath(); ctx.rect(RX - 22, 18, 44, LY + 10); ctx.clip();
      ctx.globalAlpha = n.st === 'x' ? .3 : 1;
      if (n.dur) { ctx.fillStyle = '#ff7fb0'; ctx.globalAlpha *= .65; ctx.fillRect(RX - 4, Math.max(20, cola), 8, Math.max(0, Math.min(RY, y) - Math.max(20, cola))); ctx.globalAlpha = n.st === 'x' ? .3 : 1; }
      ctx.fillStyle = '#ff7fb0'; ctx.beginPath(); ctx.ellipse(RX - 3, Math.min(RY, y), 3.6, 5, -.4, 0, TAU); ctx.ellipse(RX + 3, Math.min(RY, y), 3.6, 5, .4, 0, TAU); ctx.fill(); ctx.strokeStyle = '#fff4e0'; ctx.lineWidth = .5; ctx.stroke(); ctx.restore();
    }
    // Indicador visible de racha y etapa de dificultad.
    ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(40,20,30,.78)'; ctx.beginPath(); roundRect(ctx, 167, 16, 92, 30, 6); ctx.fill();
    ctx.fillStyle = '#ffd23f'; ctx.font = 'bold 11px "Alegreya Sans", sans-serif'; ctx.fillText(`${j.combo} COMBO`, 213, 29);
    ctx.fillStyle = '#fff4e0'; ctx.font = '6px "Alegreya Sans", sans-serif'; ctx.fillText(t < 30 ? 'INICIO' : t < 65 ? 'SUBE EL RITMO' : 'RITMO INTENSO', 213, 39); ctx.restore();
    // letreros de cada golpe
    for (const l of j.letreros) { ctx.globalAlpha = 1 - l.t / .8; letrero(ctx, l.txt, l.x, l.y - l.t * 12, l.col); } ctx.globalAlpha = 1;
    // la bomba: se para la música y sale el verso
    const b = enBomba(j);
    if (b) {
      const k = Math.min(1, (t - b.t) * 3, (b.t + b.dur - t) * 3);
      ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = 'rgba(250,240,220,.95)'; ctx.beginPath(); roundRect(ctx, 120, 34, 187, 92, 6); ctx.fill();
      ctx.strokeStyle = '#c8203a'; ctx.setLineDash([2, 1.6]); ctx.lineWidth = .8; ctx.beginPath(); roundRect(ctx, 124, 38, 179, 84, 4); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = 'bold 9px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#c8203a'; ctx.fillText('¡Bomba!', 213, 54);
      ctx.font = 'italic 6.6px Alegreya, Georgia, serif'; ctx.fillStyle = '#3a2418'; b.verso.forEach((v, i) => ctx.fillText(v, 213, 68 + i * 11)); ctx.textAlign = 'left'; ctx.restore();
    }
    pintaChispas(ctx, j);
    if (st.over) st.over(ctx, f);
    // barra de abajo
    ctx.fillStyle = 'rgba(40,20,30,.8)'; ctx.fillRect(0, VH - 12, VW, 12);
    ctx.font = 'bold 7px "Alegreya Sans", sans-serif'; ctx.fillStyle = '#ffd23f'; ctx.fillText(`Pasos ${j.aciertos} de ${j.total} · ${j.combo} seguidos`, 8, VH - 3.5);
    ctx.fillStyle = '#ffd6e4'; ctx.fillText('Ritmo: ' + '●'.repeat(6 - Math.ceil(j.tamb)) + '○'.repeat(Math.ceil(j.tamb)), 150, VH - 3.5);
    ctx.font = '5.5px "Alegreya Sans", sans-serif'; ctx.fillStyle = '#fff4e0'; ctx.fillText('Flechas y clic: mantén en notas largas', 228, VH - 4);
    if (j.t < 2.2) letrero(ctx, '¡Que empiece la Campechanita!', 213, 120, '#fff4e0');
    if (j.win) { letrero(ctx, j.final, 213, 110, '#ffd23f'); letrero(ctx, `Mejor racha: ${j.mejor}`, 213, 124, '#fff4e0'); }
  }
  return { crear, paso, pintar };
})();
MEC.POW.jaranear = { name: 'Palmas al compás', help: 'Pulsa al ritmo y mantén presionadas las notas largas: flechas para Itzel y clic para Fresita.', cd: .05, click() { return false; } };
nivel('campechanidad', {
  nombre: 'La Campechanita', lema: 'Celebren la Campechanidad bailando al ritmo de la Campechanita habanera.',
  modo: 'campechanidad', foe: 'abeja', fauna: ['abeja'], power: 'jaranear', plat: NIVELES.nouveau.plat, W: 30, skin: NIVELES.nouveau.skin, fiesta: 'campechanidad',
});
(NIVELES_ALT.nouveau = NIVELES_ALT.nouveau || []).push('campechanidad');
if (typeof FIESTAS !== 'undefined') FIESTAS.push({ id: 'campechanidad', nombre: 'Día de la Campechanidad', nivel: 'campechanidad', mundo: 'nouveau', hoy: d => d.getMonth() === 9 && d.getDate() <= 12 });

