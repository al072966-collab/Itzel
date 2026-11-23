'use strict';
// =====================================================================
//  CÓDICE · Las páginas del códice (nivel especial del mundo de Edzná)
//  Como el códice de Itzel 1: cada página es un tablero de cuadros, y cada
//  cuadro es un cuartito de plataformas pintado como viñeta de códice.
//  Un cuadro está vacío: Fresita hace clic en un cuadro junto al hueco y
//  lo desliza (también el de Itzel, con ella adentro: así sube). Itzel
//  tiene que cruzar de la orilla de entrada a la de salida; al llegar,
//  pasa a la página siguiente. Tres páginas, de una jugada a siete.
//   P cuadro liso · S navajas de obsidiana · G guerrero que camina
//   H piso roto (se cae al cuadro de abajo) · X estela (no deja pasar)
//  Los tableros se revisan con  node tools/resuelve-codice-edzna.mjs
//  Probar: ?mundo=codex&nivel=codice_paginas
// =====================================================================
(() => {
  if (typeof nivelPropio !== 'function' || !NIVELES.codex) return;
  // ---- TABLEROS (el resolvedor lee este bloque) ----
  const TABLEROS = [
    { nombre: 'Primera página', cols: 3, rows: 2, ini: 0, sal: 0, tablero: 'P.PSXP', minimo: 1,
      txt: 'Primera página. Fresita: clic en un cuadro junto al hueco y se desliza. Si Itzel está adentro, viaja con él.' },
    { nombre: 'Segunda página', cols: 3, rows: 2, ini: 1, sal: 0, tablero: 'SGPXH.', minimo: 4,
      txt: 'Segunda página: la salida está arriba. Itzel no sube sola; súbanla deslizando su cuadro.' },
    { nombre: 'Tercera página', cols: 3, rows: 3, ini: 2, sal: 0, tablero: 'SXP.PGXHS', minimo: 7,
      txt: 'Última página: nueve cuadros y dos estelas. Piensen antes de mover.' },
  ];
  // ---- FIN TABLEROS ----
  window.CODICE_PAGINAS = { TABLEROS };

  const RW = 6, RH = 5, BX = 3, BY = 1, MW = BX + RW * 3 + 3, MH = BY + RH * 3 + 2;
  // cada cuadro en losetas: '#' piedra, 's' navajas, 'c' canistel, 'w' guerrero
  const PLANTILLA = {
    P: ['......', '....c.', '......', '......', '######'],
    S: ['......', '..c...', '......', '..ss..', '######'],
    G: ['......', '......', '....c.', '.w....', '######'],
    H: ['......', '.c....', '......', '......', '##..##'],
    X: ['..##..', '..##.c', '..##..', '..##..', '######'],
  };
  const P = MEC.POW;

  // ---------------- recursos ilustrados (láminas de ChatGPT recortadas con tools/codice-paginas.py) ----------------
  // Si alguno no ha llegado, el nivel se dibuja con el arte de código de antes.
  const RUTA = '../Roguelike/assets/codice-paginas/', IMG = {};
  const NOMBRES = ['fondo', 'piso', 'piso-roto-izq', 'piso-roto-der', 'navajas', 'estela', 'entrada', 'salida', 'hueco', 'marco', 'canistel', 'chispas', 'pagina-vuelta', 'guerrero',
    'flecha-arriba', 'flecha-abajo', 'flecha-izquierda', 'flecha-derecha', 'vineta-P', 'vineta-S', 'vineta-G', 'vineta-H', 'vineta-X'];
  for (const n of NOMBRES) { const im = IMG[n] = new Image(); im.decoding = 'async'; im.src = RUTA + n + '.webp?v=1'; }
  const artesListas = () => NOMBRES.every(n => IMG[n].complete && IMG[n].naturalWidth);
  // el guerrero de piedra: seis poses (reposo, dos pasos, daño, caída, sueño), cuadros de 220 px con los pies a 6 px del fondo
  window.CODICE_GUERRERO = {
    activo: () => typeof CUR !== 'undefined' && !!CUR && !!CUR.def && CUR.def.id === 'codice_paginas' && IMG.guerrero.complete && !!IMG.guerrero.naturalWidth,
    dibuja(c, e, t) {
      const camina = Math.abs(e.vx || 0) > 2 || (e.v > 0 && e.st === 'ok' && !e.aturde);
      const pose = e.st === 'gone' ? 4 : e.st === 'sleep' ? 5 : e.aturde > 0 ? 3 : camina ? 1 + (Math.floor((e.anim || t) * 6) % 2) : 0;
      const k = 15 / 170, w = 220 * k;
      c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
      c.drawImage(IMG.guerrero, (pose % 3) * 220, Math.floor(pose / 3) * 220, 220, 220, -w / 2, -214 * k, w, w);
      return true;
    },
  };
  P.paginas = { name: 'Mover los cuadros', help: 'Clic en un cuadro junto al hueco: Fresita lo desliza al hueco (si Itzel está adentro, viaja con él).', cd: .2, click() { return false; } };

  const filaPiso = (j, r) => j.oy + r * RH + RH - 1;            // la fila del piso de la fila r de cuadros
  const posCuadro = (j, i) => ({ x: (BX + (i % j.T.cols) * RW) * T, y: (j.oy + Math.floor(i / j.T.cols) * RH) * T });

  // ---------------- armar una página ----------------
  function carga(j, k) {
    const Tb = j.T = TABLEROS[k]; j.pagina = k; j.oy = BY + Math.round((3 - Tb.rows) * RH / 2);
    j.cuadros = []; j.hueco = -1; j.desliza = null; j.foes = j.foes.filter(e => !e.deCodice);
    for (let i = 0; i < Tb.tablero.length; i++) {
      const tipo = Tb.tablero[i]; if (tipo === '.') { j.hueco = i; j.cuadros.push(null); continue; }
      const q = { tipo, ...posCuadro(j, i), monedas: [], n: i };
      PLANTILLA[tipo].forEach((fila, r) => [...fila].forEach((ch, c) => {
        if (ch === 'c') q.monedas.push({ lx: (c + .5) * T, ly: (r + 1) * T - 8, got: false });
        if (ch === 'w') { const e = MEC.mkFoe(j.def.foes.w, q.x + (c + .5) * T, q.y + (r + 1) * T); e.tipo = 'w'; e.dir = 1; e.deCodice = true; j.foes.push(e); }
      }));
      j.cuadros.push(q);
    }
    // lo fijo: el techo, las paredes con sus aberturas y las orillas de entrada y salida
    const fijo = j.fijo = new Set(), pon = (c, r) => fijo.add(c + ',' + r);
    const x1 = BX + Tb.cols * RW, y0 = j.oy, y1 = j.oy + Tb.rows * RH, fi = filaPiso(j, Tb.ini), fs = filaPiso(j, Tb.sal);
    for (let c = BX - 1; c <= x1; c++) pon(c, y0 - 1);
    for (let r = y0 - 1; r < y1; r++) { if (r < fi - RH + 1 || r > fi - 1) pon(BX - 1, r); if (r < fs - RH + 1 || r > fs - 1) pon(x1, r); }
    for (let r = fi; r < MH; r++) for (let c = 0; c < BX - 1; c++) pon(c, r);
    for (let r = fs; r < MH; r++) for (let c = x1 + 1; c < MW; c++) pon(c, r);
    j.salida = { x: (x1 + 1.6) * T, y: fs * T };
    j.meta = k === TABLEROS.length - 1 ? { x: (MW - 1.5) * T, y: fs * T } : null;
    const s = { x: 1.2 * T, y: fi * T, g: 1 }; Object.assign(j.p, { x: s.x, y: s.y, vx: 0, vy: 0 }); j.safe = s; j.cae = null;
    j.aviso = { txt: Tb.txt, t: 0 };
    if (j.cam) { j.cam.x = 0; j.cam.y = Math.max(0, (j.oy - 1) * T - 8); }
  }
  // el cuadro que tapa la loseta (c, r), con su posición de ahora (a la mitad de un deslizamiento también)
  function enCuadro(j, x, y) {
    for (const q of j.cuadros) if (q && x >= q.x && x < q.x + RW * T && y >= q.y && y < q.y + RH * T) return { q, c: Math.floor((x - q.x) / T), r: Math.floor((y - q.y) / T) };
    return null;
  }
  const celda = (j, x, y) => { const c = Math.floor((x / T - BX) / RW), r = Math.floor((y / T - j.oy) / RH); return c < 0 || r < 0 || c >= j.T.cols || r >= j.T.rows ? -1 : r * j.T.cols + c; };
  const vecinoDelHueco = (j, i) => { if (i < 0 || j.hueco < 0 || !j.cuadros[i]) return false; const C = j.T.cols; return Math.abs(i % C - j.hueco % C) + Math.abs(Math.floor(i / C) - Math.floor(j.hueco / C)) === 1; };
  const adentro = (q, x, y) => x >= q.x && x < q.x + RW * T && y > q.y && y <= q.y + RH * T;

  function desliza(j, i) {
    const q = j.cuadros[i], h = j.hueco, dest = posCuadro(j, h);
    j.cuadros[h] = q; j.cuadros[i] = null; j.hueco = i; q.n = h;
    j.desliza = { q, x0: q.x, y0: q.y, x1: dest.x, y1: dest.y, t: 0, lleva: adentro(q, j.p.x, j.p.y), rx: clamp(j.p.x - q.x, 7, RW * T - 7), ry: j.p.y - q.y, bichos: j.foes.filter(e => e.st !== 'gone' && adentro(q, e.x, e.y)) };
    j.movs = (j.movs || 0) + 1;
    if (typeof SONIDO !== 'undefined' && SONIDO.fx) SONIDO.fx('abre');
  }

  // ---------------- dibujo de una viñeta de códice (se guarda por tipo y escala) ----------------
  const cache = new Map();
  const TINTA = '#1c1612', ROJO = '#b0412e', OCRE = '#d79a3d', PIEL = '#efdcae', PIEDRA = '#cdb48a', JADE = '#4d8a5c';
  function numeral(c, x, y, n, s) {   // número maya: puntos y barras
    c.fillStyle = TINTA; const barras = Math.floor(n / 5), puntos = n % 5;
    for (let b = 0; b < barras; b++) c.fillRect(x, y + b * 2.6 * s, 9 * s, 1.6 * s);
    for (let p = 0; p < puntos; p++) { c.beginPath(); c.arc(x + 1.2 * s + p * 2.2 * s, y - 1.6 * s, .9 * s, 0, TAU); c.fill(); }
  }
  // la viñeta con las láminas: fondo de la viñeta (ya a 6:5), numeral por código, piso, navajas y estela según la plantilla
  function dibujaVineta(c, tipo, n, w, h) {
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.drawImage(IMG['vineta-' + tipo], 0, 0, w, h);
    numeral(c, 6, 15, n + 1, 1);
    const pl = PLANTILLA[tipo], yPiso = (RH - 1) * T;
    if (tipo === 'H') { c.drawImage(IMG['piso-roto-izq'], 0, yPiso, 2 * T, T); c.drawImage(IMG['piso-roto-der'], 4 * T, yPiso, 2 * T, T); }   // ##..##: el hueco del centro queda abierto
    else c.drawImage(IMG.piso, 0, yPiso, w, T);
    for (let r = 0; r < RH - 1; r++) {   // navajas: solo donde la plantilla tiene 's'
      const x0 = pl[r].indexOf('s'); if (x0 < 0) continue; const cuantas = [...pl[r]].filter(ch => ch === 's').length, ancho = cuantas * T, alto = ancho * IMG.navajas.naturalHeight / IMG.navajas.naturalWidth;
      c.drawImage(IMG.navajas, x0 * T, (r + 1) * T - alto, ancho, alto);
    }
    if (tipo === 'X') c.drawImage(IMG.estela, 2 * T, 0, 2 * T, 4 * T);   // la estela ocupa exactamente sus 2 x 4 losetas de '#'
  }
  function viñeta(tipo, n, S) {
    const lista = artesListas(), key = tipo + n + '@' + S.toFixed(3) + (lista ? 'i' : 'p'); let cv = cache.get(key); if (cv) return cv;
    const w = RW * T, h = RH * T; cv = mkCanvas(Math.ceil(w * S), Math.ceil(h * S)); const c = cv.getContext('2d'); c.scale(S, S);
    if (lista) { dibujaVineta(c, tipo, n, w, h); cache.set(key, cv); return cv; }
    // la piel de venado estucada, con fibras y manchas de pigmento
    c.fillStyle = PIEL; c.fillRect(0, 0, w, h);
    for (let k = 0; k < 40; k++) { const a = hash2(k, n, 3), b = hash2(k, n, 4); c.fillStyle = `rgba(150,110,60,${.05 + a * .06})`; c.fillRect(a * w, b * h, 6 + b * 18, .5); }
    for (let k = 0; k < 4; k++) { const a = hash2(k, n, 7), b = hash2(k, n, 8); c.fillStyle = 'rgba(176,65,46,.05)'; c.beginPath(); c.ellipse(a * w, b * h, 10 + a * 14, 6 + b * 8, a * 3, 0, TAU); c.fill(); }
    // franja de arriba: greca escalonada en ocre y tinta
    c.fillStyle = OCRE; c.fillRect(2, 2, w - 4, 6); c.strokeStyle = TINTA; c.lineWidth = .7; c.beginPath();
    for (let x = 4; x < w - 6; x += 8) { c.moveTo(x, 7); c.lineTo(x, 4); c.lineTo(x + 4, 4); c.lineTo(x + 4, 6); c.lineTo(x + 6, 6); }
    c.stroke();
    // el glifo grande de fondo, deslavado
    c.save(); c.globalAlpha = .17; c.translate(w * (tipo === 'X' ? .84 : .5), h * .48); c.scale(.8, .8); c.strokeStyle = ROJO; c.lineWidth = 1.6;
    c.beginPath(); roundRect(c, -12, -12, 24, 22, 7); c.stroke(); c.fillStyle = ROJO;
    const forma = 'PSGHX'.indexOf(tipo);
    if (forma === 0) { c.beginPath(); c.arc(-4, -2, 3, 0, TAU); c.arc(5, -2, 3, 0, TAU); c.fill(); c.fillRect(-6, 4, 12, 2); }
    else if (forma === 1) { for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-8 + k * 6, 6); c.lineTo(-5 + k * 6, -7); c.lineTo(-2 + k * 6, 6); c.fill(); } }
    else if (forma === 2) { c.beginPath(); c.arc(0, -1, 7, Math.PI, 0); c.fill(); c.fillRect(-8, 3, 16, 3); }
    else if (forma === 3) { c.beginPath(); c.moveTo(-8, -6); c.lineTo(0, 6); c.lineTo(8, -6); c.stroke(); }
    else { c.fillRect(-2, -9, 4, 16); c.beginPath(); c.arc(0, -4, 5, 0, TAU); c.stroke(); }
    c.restore();
    numeral(c, 6, 15, n + 1, 1);
    // lo de piedra: piso, estela y navajas
    const pl = PLANTILLA[tipo];
    for (let r = 0; r < RH; r++) for (let x = 0; x < RW; x++) {
      const ch = pl[r][x], X = x * T, Y = r * T;
      if (ch === '#' && r === RH - 1) {
        c.fillStyle = PIEDRA; c.fillRect(X, Y, T, T); c.fillStyle = ROJO; c.fillRect(X, Y, T, 3.2);
        c.fillStyle = TINTA; c.fillRect(X, Y + 3.2, T, .7); c.beginPath(); c.arc(X + 8, Y + 9.5, 1.1, 0, TAU); c.fill();
        if (pl[r][x - 1] !== '#') { c.fillRect(X, Y, .9, T); }
        if (pl[r][x + 1] !== '#') { c.fillRect(X + T - .9, Y, .9, T); }
      } else if (ch === 's') {
        // navajas de obsidiana clavadas en el piso
        for (let k = 0; k < 3; k++) { const bx = X + 2 + k * 5; c.fillStyle = '#16121c'; c.beginPath(); c.moveTo(bx, Y + T); c.lineTo(bx + 2.2, Y + 4 + k % 2 * 2); c.lineTo(bx + 4.4, Y + T); c.fill(); c.fillStyle = 'rgba(200,190,255,.6)'; c.beginPath(); c.moveTo(bx + 1.2, Y + T - 1); c.lineTo(bx + 2.2, Y + 6 + k % 2 * 2); c.lineTo(bx + 2.6, Y + T - 1); c.fill(); }
      }
    }
    if (tipo === 'X') {
      // la estela: piedra tallada con un señor de perfil y su penacho
      const X = 2 * T, Y = 0, W = 2 * T, H = 4 * T;
      c.fillStyle = PIEDRA; c.fillRect(X, Y, W, H); c.strokeStyle = TINTA; c.lineWidth = 1; c.strokeRect(X + .5, Y + .5, W - 1, H - 1);
      c.fillStyle = 'rgba(28,22,18,.12)'; c.fillRect(X + W - 5, Y + 1, 4, H - 2);
      c.fillStyle = JADE; c.beginPath(); c.moveTo(X + 6, Y + 14); c.quadraticCurveTo(X + 4, Y + 3, X + 22, Y + 4); c.quadraticCurveTo(X + 12, Y + 8, X + 10, Y + 14); c.fill();
      c.fillStyle = OCRE; c.beginPath(); c.arc(X + 15, Y + 22, 7, 0, TAU); c.fill(); c.strokeStyle = TINTA; c.lineWidth = .8; c.stroke();
      c.fillStyle = TINTA; c.beginPath(); c.arc(X + 18, Y + 20.5, 1.1, 0, TAU); c.fill(); c.fillRect(X + 16, Y + 25, 4, .8);
      c.fillStyle = ROJO; c.fillRect(X + 8, Y + 31, 16, 3); c.fillStyle = TINTA;
      for (let k = 0; k < 3; k++) { c.beginPath(); roundRect(c, X + 7, Y + 38 + k * 8, 18, 6, 2); c.lineWidth = .7; c.stroke(); c.fillRect(X + 10, Y + 40.4 + k * 8, 3 + k * 3, 1.2); }
    }
    // el marco de la viñeta: línea roja y contorno de tinta
    c.strokeStyle = ROJO; c.lineWidth = 1.4; c.strokeRect(2.2, 2.2, w - 4.4, h - 4.4);
    c.strokeStyle = TINTA; c.lineWidth = 1.1; c.strokeRect(.6, .6, w - 1.2, h - 1.2);
    cache.set(key, cv); return cv;
  }

  nivelPropio('codice_paginas', 'codex', {
    nombre: 'Las páginas del códice', lugar: 'Edzná, en el Edificio de los Cinco Pisos', genero: 'Rompecabezas de plataformas', independiente: true,
    lema: 'Cada página del códice es un tablero de cuadros. Fresita desliza los cuadros al hueco (con Itzel adentro, si hace falta) para armarle el camino de una orilla a la otra.',
    dato: 'Los códices mayas se pintaban en tiras de papel de corteza cubiertas de estuco y se doblaban como acordeón; se leían por páginas, viñeta tras viñeta. De los que se pintaron, hoy solo se conservan cuatro.',
    relleno: 'rgba(0,0,0,0)', power: 'paginas', foe: 'guerrero', fauna: ['guerrero'], foes: { w: 'guerrero' }, peso: 1.4, cd: .2,
    mapa: () => { const M = Array.from({ length: MH }, () => '.'.repeat(MW).split('')); M[BY + RH * 2 - 2][1] = 'P'; return M.map(f => f.join('')); },
    prepara(j) { carga(j, 0); },
    solido(j, c, r) {
      if (j.fijo.has(c + ',' + r)) return true;
      const x = (c + .5) * T, y = (r + .5) * T, e = enCuadro(j, x, y); if (!e) return false;
      const ch = PLANTILLA[e.q.tipo][e.r] && PLANTILLA[e.q.tipo][e.r][e.c]; return ch === '#';
    },
    poder(j, x, y) {
      if (j.desliza || j.pasa) return false;
      const i = celda(j, x, y); if (!vecinoDelHueco(j, i)) return false;
      desliza(j, i); chispas(j, x, y, ['#3ec8b0', '#ffffff', OCRE], 12, 50);
    },
    demo(j) { if (!j.desliza && j.t % 1.4 < 1 / 60) { const C = j.T.cols, ops = j.cuadros.map((q, i) => i).filter(i => vecinoDelHueco(j, i)); if (ops.length) desliza(j, ops[Math.floor(Math.random() * ops.length)]); } },
    paso(j, dt) {
      const p = j.p;
      // el deslizamiento: el cuadro se va al hueco y carga a Itzel y a los bichos que traiga
      const D = j.desliza;
      if (D) {
        const t0 = D.t; D.t = Math.min(1, D.t + dt / .26);
        const e = u => u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2, a = e(D.t) - e(t0);
        const dx = (D.x1 - D.x0) * a, dy = (D.y1 - D.y0) * a; D.q.x += dx; D.q.y += dy;
        // Itzel viaja clavada al cuadro: el motor la empujaría fuera del piso (las losetas quedan a medio cuadro), así que su lugar se fija
        if (D.lleva) { p.x = D.q.x + D.rx; p.y = D.q.y + D.ry; p.vx = 0; p.vy = 0; p.on = true; j.cae = p.y; }
        for (const b of D.bichos) { b.x += dx; b.y += dy; b.hx = (b.hx || b.x) + dx; b.hy = (b.hy || b.y) + dy; }
        if (D.t >= 1) { D.q.x = D.x1; D.q.y = D.y1; j.desliza = null; }
      }
      // red de seguridad: si algo la saca de la página, vuelve a su último punto seguro
      if (!j.desliza && (!Number.isFinite(p.x) || !Number.isFinite(p.y) || p.x < 2 || p.x > MW * T - 2)) { Object.assign(p, { x: j.safe.x, y: j.safe.y, vx: 0, vy: 0 }); j.cae = null; }
      // las navajas lastiman y avientan hacia arriba
      const e = enCuadro(j, p.x, p.y - 3);
      if (e && PLANTILLA[e.q.tipo][e.r][e.c] === 's' && p.y - e.q.y - e.r * T > 6 && dañoModo(j)) { if (typeof SONIDO !== 'undefined') SONIDO.fx('herida'); p.vy = -300; p.vx = -p.face * 90; j.bloqueo = .2; }
      // canisteles de cada cuadro
      for (const q of j.cuadros) if (q) for (const m of q.monedas) if (!m.got && Math.abs(q.x + m.lx - p.x) < 10 && Math.abs(q.y + m.ly - (p.y - 10)) < 16) { m.got = true; RUN.coins++; if (typeof SONIDO !== 'undefined') SONIDO.fx('canistel'); chispas(j, q.x + m.lx, q.y + m.ly, ['#ffdd94', '#ffffff']); }
      // al pisar la orilla de salida, la página se voltea
      if (!j.meta && !j.pasa && p.on && p.x > j.salida.x - 4 && Math.abs(p.y - j.salida.y) < 4) { j.pasa = 1; if (typeof SONIDO !== 'undefined') SONIDO.fx('fanfarria'); }
      if (j.pasa) { const antes = j.pasa; j.pasa = Math.max(0, j.pasa - dt * 1.4); p.vx = 0; if (antes > .5 && j.pasa <= .5) carga(j, j.pagina + 1); }
    },
    tinte(ctx, j, Hv) { const Tb = j.T, cx = (BX + Tb.cols * RW / 2) * T, cy = (j.oy + Tb.rows * RH / 2) * T; const rec = typeof VISTA !== 'undefined' && j.vista === 'juego' ? VISTA.rec || 0 : 0; j.cam.x = clamp(cx - VW / 2, j.p.x - VW + rec + 36, j.p.x - rec - 36); if ((Tb.rows * RH + 4) * T <= Hv) j.cam.y = cy - Hv / 2 - T * .5; ctx.fillStyle = 'rgba(40,24,10,.18)'; ctx.fillRect(0, 0, VW, Hv); },
    pinta(ctx, j, f, capa) {
      const S = f.S || 3, Tb = j.T, x0 = BX * T, y0 = j.oy * T, w = Tb.cols * RW * T, h = Tb.rows * RH * T;
      if (capa === 'atras') {
        // la página: una hoja grande de códice con su marco, y las orillas de entrada y salida en piedra
        const lista = artesListas();
        if (lista) {   // el fondo de códice cubre todo el mapa (recortado a los lados); el tablero queda en el centro despejado
          const iw = IMG.fondo.naturalWidth, ih = IMG.fondo.naturalHeight, kk = Math.max(MW * T / iw, MH * T / ih);
          ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(IMG.fondo, (MW * T - iw * kk) / 2, (MH * T - ih * kk) / 2, iw * kk, ih * kk);
        } else {
          ctx.fillStyle = '#e2c98f'; ctx.fillRect(x0 - T - 8, y0 - T - 8, w + 2 * T + 16, h + 2 * T + 16);
          ctx.strokeStyle = TINTA; ctx.lineWidth = 1.4; ctx.strokeRect(x0 - T - 8, y0 - T - 8, w + 2 * T + 16, h + 2 * T + 16);
          ctx.strokeStyle = ROJO; ctx.lineWidth = 2; ctx.strokeRect(x0 - T - 4, y0 - T - 4, w + 2 * T + 8, h + 2 * T + 8);
        }
        ctx.fillStyle = '#c4a46a';
        for (const k of j.fijo) { const [c, r] = k.split(',').map(Number); ctx.fillRect(c * T - .3, r * T - .3, T + .6, T + .6); }
        if (lista) {   // las orillas de entrada y salida (cada una de 2 losetas de ancho): la salida lleva su flecha, la meta final usa la misma lápida de la entrada
          const fi = filaPiso(j, Tb.ini), fs = filaPiso(j, Tb.sal), x1 = BX + Tb.cols * RW;
          ctx.drawImage(IMG.entrada, 0, fi * T, (BX - 1) * T, T); ctx.drawImage(j.meta ? IMG.entrada : IMG.salida, (x1 + 1) * T, fs * T, (MW - x1 - 1) * T, T);
        } else { ctx.fillStyle = ROJO; for (const k of j.fijo) { const [c, r] = k.split(',').map(Number); if (!j.fijo.has(c + ',' + (r - 1)) && (c < BX - 1 || c > BX + Tb.cols * RW)) ctx.fillRect(c * T, r * T, T, 3); } }
        // el hueco: lo que queda detrás de la página
        const hc = j.hueco % Tb.cols, hr = Math.floor(j.hueco / Tb.cols), hx = x0 + hc * RW * T, hy = y0 + hr * RH * T;
        if (lista) ctx.drawImage(IMG.hueco, hx, hy, RW * T, RH * T);
        else {
          ctx.fillStyle = 'rgba(40,22,10,.55)'; ctx.fillRect(hx + 1, hy + 1, RW * T - 2, RH * T - 2);
          ctx.strokeStyle = 'rgba(239,220,174,.5)'; ctx.setLineDash([3, 3]); ctx.lineWidth = .8; ctx.strokeRect(hx + 3, hy + 3, RW * T - 6, RH * T - 6); ctx.setLineDash([]);
        }
        for (const q of j.cuadros) if (q && q !== (j.desliza && j.desliza.q)) ctx.drawImage(viñeta(q.tipo, q.n0 ?? (q.n0 = q.n), S), q.x, q.y, RW * T, RH * T);
        if (j.desliza) { const q = j.desliza.q; ctx.save(); ctx.shadowColor = 'rgba(28,22,18,.45)'; ctx.shadowBlur = 6 * S; ctx.drawImage(viñeta(q.tipo, q.n0, S), q.x, q.y, RW * T, RH * T); ctx.restore(); }
        return;
      }
      if (capa === 'medio') {
        const lista = artesListas();
        for (const q of j.cuadros) if (q) for (const m of q.monedas) if (!m.got) {
          if (lista) { const flota = Math.sin(j.t * 3 + m.lx) * 1; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(IMG.canistel, q.x + m.lx - 6, q.y + m.ly - 7 + flota, 12, 14); }   // el canistel viaja con su cuadro
          else monedaItzel(ctx, q.x + m.lx, q.y + m.ly, j.t, f);
        }
        return;
      }
      if (capa !== 'frente') return;
      // dónde puede mover Fresita: el cuadro bajo ella se marca en jade, con una flecha hacia el hueco
      const fx = j.fre.x + j.cam.x, fy = j.fre.y + j.cam.y, i = celda(j, fx, fy);
      if (!j.desliza && !j.demo && vecinoDelHueco(j, i)) {
        const q = j.cuadros[i], C = Tb.cols, dx = (j.hueco % C) - (i % C), dy = Math.floor(j.hueco / C) - Math.floor(i / C), a = .7 + .3 * Math.sin(j.t * 6);
        const cx = q.x + RW * T / 2 + dx * RW * T * .42, cy = q.y + RH * T / 2 + dy * RH * T * .42;
        if (artesListas()) {   // marco jade y la flecha hacia el hueco, con la misma dirección de antes
          ctx.save(); ctx.globalAlpha = a; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(IMG.marco, q.x, q.y, RW * T, RH * T);
          const dir = dx > 0 ? 'derecha' : dx < 0 ? 'izquierda' : dy > 0 ? 'abajo' : 'arriba'; ctx.drawImage(IMG['flecha-' + dir], cx - 8, cy - 8, 16, 16); ctx.restore();
        } else {
          ctx.strokeStyle = `rgba(62,200,176,${a})`; ctx.lineWidth = 2; ctx.strokeRect(q.x + 1, q.y + 1, RW * T - 2, RH * T - 2);
          ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.atan2(dy, dx)); ctx.fillStyle = `rgba(62,200,176,${a})`; ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(-4, -6); ctx.lineTo(-4, 6); ctx.fill(); ctx.restore();
        }
      }
      // la salida de la página: una flecha pintada en la orilla
      if (!j.meta && !artesListas()) { const s = j.salida; ctx.fillStyle = ROJO; ctx.beginPath(); ctx.moveTo(s.x + 6, s.y - 12); ctx.lineTo(s.x - 2, s.y - 18); ctx.lineTo(s.x - 2, s.y - 6); ctx.fill(); ctx.strokeStyle = TINTA; ctx.lineWidth = .7; ctx.stroke(); }
      // el número de página y las jugadas
      ctx.font = '700 8px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = TINTA;
      ctx.fillText(`${Tb.nombre} · ${j.pagina + 1} de ${TABLEROS.length}`, x0 + w / 2, y0 + h + T + 20);
      ctx.textAlign = 'left';
      // al voltear la página, un velo de papel
      // destellos de jade mientras el cuadro se desliza
      if (j.desliza && artesListas()) { const q = j.desliza.q, u = j.desliza.t; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.sin(u * Math.PI);
        for (let k = 0; k < 3; k++) { const px = q.x + RW * T * (.2 + .3 * k), py = q.y + RH * T * (.25 + .5 * ((k + 1) % 2)) - u * 8; ctx.drawImage(IMG.chispas, k * 120, 0, 120, 120, px - 7, py - 7, 14, 14); } ctx.restore(); }
      // al voltear la página, un velo de papel y la esquina doblada que se levanta
      if (j.pasa) {
        const a = 1 - Math.abs(j.pasa - .5) * 2; ctx.fillStyle = `rgba(226,201,143,${a})`; ctx.fillRect(j.cam.x - 40, j.cam.y - 40, VW + 80, 600);
        if (artesListas()) { const lado = 40 + 130 * a, ex = j.cam.x + VW - 4, ey = j.cam.y + (typeof VISTA !== 'undefined' ? Math.min(VISTA.H, 300) : 240) - 4; ctx.save(); ctx.globalAlpha = Math.min(1, a * 1.6); ctx.drawImage(IMG['pagina-vuelta'], ex - lado, ey - lado * .8, lado, lado * .8); ctx.restore(); }
      }
    },
    ayudas: [{ id: 'saltar', cuando: j => j.pagina === 0 && j.t > 9 && !j.movs, txt: 'Fresita: pon el cursor sobre el cuadro de Itzel; si brilla en jade, clic y se desliza al hueco.' }],
  });
})();
