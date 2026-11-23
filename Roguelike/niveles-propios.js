'use strict';
// =====================================================================
//  NIVELES PROPIOS · tres niveles de plataformas que se salen del molde
//  (motor de modos-propio.js). Cada uno es nivel alterno de su mundo:
//   cyber    La plataforma de cabeza: Fresita invierte la gravedad
//   vitral   Las torres de la Catedral: hacia arriba, con salto de pared
//   cinema   El laberinto de Chicanná: para explorar (llave, pluma, ilusiones)
//   lowpoly  El pozo de Bolonchén: hacia abajo, con cristales flotantes
// =====================================================================
(() => {
  // un lienzo de texto para dibujar los mapas con rectángulos
  function lienzo(W, H, fondo = '.') {
    const G = Array.from({ length: H }, () => Array(W).fill(fondo));
    const o = {
      G, W, H,
      r(c0, c1, r0, r1, ch = '#') { for (let r = Math.max(0, r0); r <= Math.min(H - 1, r1); r++) for (let c = Math.max(0, c0); c <= Math.min(W - 1, c1); c++) G[r][c] = ch; return o; },
      p(c, r, ch) { if (r >= 0 && r < H && c >= 0 && c < W) G[r][c] = ch; return o; },
      monedas(c0, c1, r) { for (let c = c0; c <= c1; c++) if (G[r][c] === '.') G[r][c] = 'o'; return o; },
      filas() { return G.map(f => f.join('')); },
    };
    return o;
  }

  // los poderes de Fresita en estos niveles (para el letrero, el HUD y la enciclopedia)
  const P = MEC.POW;
  P.gravedad = { name: 'Electroimán', help: 'Clic: la gravedad se voltea y Itzel cae hacia el techo (o de vuelta al piso).', cd: .35, click() { return false; } };
  P.cristalFlota = { name: 'Cristal flotante', help: 'Clic: un cristal flotante donde apuntas, para frenar las caídas largas (hasta dos).', cd: .3, click() { return false; } };
  P.luzVitral = { name: 'Empujón y luz de vitral', help: 'Con Itzel resbalándose por una pared, clic: Fresita la avienta a la pared de enfrente. Clic sobre un vitral: se enciende y su luz aguanta a Itzel unos segundos.', cd: .2, click() { return false; } };
  // ---------------------------------------------------------------
  //  CYBER · La plataforma de cabeza
  //  Techo y piso de acero; Fresita hackea los electroimanes y la gravedad
  //  se voltea. Los huecos del piso se cruzan por el techo y al revés.
  // ---------------------------------------------------------------
  const cy = lienzo(204, 15);
  cy.r(0, 203, 0, 1).r(0, 203, 13, 14);
  cy.r(14, 20, 13, 14, '.');                                   // hueco en el piso: por el techo
  cy.r(24, 31, 12, 12, 'x').r(27, 28, 0, 1, '.');               // púas en el piso y un hueco en el techo para brincar de cabeza
  cy.r(35, 38, 13, 14, '.').r(41, 44, 0, 1, '.');               // un hueco abajo y luego uno arriba
  cy.r(50, 51, 6, 12).r(55, 56, 2, 8);                          // muro desde el piso y muro desde el techo
  cy.r(66, 71, 13, 14, '.').r(70, 77, 0, 1, '.');               // los dos huecos se enciman: voltearse en el aire
  cy.r(84, 86, 12, 12, 'x').r(89, 91, 2, 2, 'x').r(94, 96, 12, 12, 'x').r(98, 100, 2, 2, 'x');
  // segunda mitad: compuertas de láser, un zigzag de muros y los huecos encimados más largos
  cy.r(116, 117, 5, 12).r(121, 122, 2, 9).r(126, 127, 5, 12).r(131, 132, 2, 9);
  cy.r(138, 145, 13, 14, '.').r(144, 153, 0, 1, '.');
  cy.r(160, 166, 12, 12, 'x').r(169, 175, 2, 2, 'x').r(179, 184, 13, 14, '.').r(188, 189, 2, 2, 'x').r(188, 189, 12, 12, 'x');
  cy.p(3, 12, 'P').p(199, 12, 'G').p(46, 12, 'C').p(80, 12, 'C').p(112, 12, 'C').p(156, 12, 'C');
  cy.monedas(118, 120, 10).monedas(123, 125, 4).monedas(128, 130, 10).monedas(139, 152, 7).monedas(179, 184, 3).monedas(190, 197, 7);
  cy.p(150, 6, 'v').p(170, 8, 'v').p(190, 5, 'v').p(134, 12, 'w');
  cy.monedas(15, 19, 3).monedas(25, 30, 9).monedas(36, 37, 4).monedas(42, 43, 10).monedas(52, 54, 4).monedas(67, 76, 7).monedas(85, 99, 7);
  cy.p(60, 7, 'v').p(63, 4, 'v').p(88, 12, 'w').p(92, 3, 'v');
  nivelPropio('cabeza', 'cyber', {
    nombre: 'La plataforma de cabeza', lugar: 'Plataformas de la Sonda de Campeche',
    lema: 'Fresita hackea los electroimanes de la plataforma y la gravedad se voltea: los huecos del piso se cruzan por el techo.',
    dato: 'El yacimiento Cantarell, en la Sonda de Campeche, fue de los más grandes del mundo. Sus plataformas están en el mar, a unos 80 kilómetros de la costa.',
    relleno: '#14142a', power: 'gravedad', foe: 'dron', fauna: ['dron'], foes: { v: 'dron', w: 'dron' }, mapa: cy.filas(), cd: .35,
    // compuertas de láser: prenden y apagan; con la luz prendida, cruzarlas lastima
    prepara(j) { j.lasers = [[104, 0], [108, .8], [192, 0], [195, .9]].map(([c, f]) => ({ x: (c + .5) * T, f })); },
    paso(j, dt) { for (const l of j.lasers) { l.on = (j.t + l.f) % 2.4 < 1.25; if (l.on && Math.abs(j.p.x - l.x) < 7 && j.inv <= 0 && dañoModo(j)) { if (typeof SONIDO !== 'undefined') SONIDO.fx('herida'); j.p.x -= 22; j.p.vx = -80; } }
      if (j.p.x > 98 * T) PROPIO.avisa(j, 'laser', 'Compuertas de láser: crúcenlas cuando se apaguen.');
      if (!j.win && j.meta && j.p.x >= j.meta.x - 6) { j.win = j.t; if (typeof SONIDO !== 'undefined') SONIDO.fx('meta'); } }, // la meta cuenta por el piso o por el techo
    poder(j) { if (j.win) return false; const p = j.p, g0 = j.g; j.g = -g0; p.y -= 20 * g0; p.vy = 0; p.on = false; j.cae = null; chispas(j, p.x, p.y, ['#55ffff', '#ff2bd6', '#ffffff'], 16, 60); j.shake = .12; },
    demo(j) { if (j.t % 1.6 < 1 / 60) PROPIO_PODER(j); },
    tinte(ctx, j, Hv) { const a = j.g < 0 ? .16 : 0; if (a) { ctx.fillStyle = `rgba(255,43,214,${a})`; ctx.fillRect(0, 0, VW, Hv); } },
    pinta(ctx, j, f, capa) {
      if (capa === 'medio') for (const l of j.lasers) { if (l.x < j.cam.x - 20 || l.x > j.cam.x + VW + 20) continue; ctx.fillStyle = '#2a2a3a'; ctx.fillRect(l.x - 5, 2 * T, 10, 6); ctx.fillRect(l.x - 5, 13 * T - 6, 10, 6);
        if (l.on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,43,120,.35)'; ctx.fillRect(l.x - 5, 2 * T + 6, 10, 11 * T - 12); ctx.fillStyle = 'rgba(255,200,230,.9)'; ctx.fillRect(l.x - 1.2, 2 * T + 6, 2.4, 11 * T - 12); ctx.restore(); }
        else { const fin = 2.4 - ((j.t + l.f) % 2.4); ctx.strokeStyle = fin < .35 && Math.sin(j.t * 40) > 0 ? 'rgba(255,120,180,.8)' : 'rgba(255,43,120,.3)'; ctx.setLineDash([3, 4]); ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(l.x, 2 * T + 6); ctx.lineTo(l.x, 13 * T - 6); ctx.stroke(); ctx.setLineDash([]); } }
      if (capa !== 'frente') return;
      // los electroimanes: rayitas de campo que apuntan hacia donde jala la gravedad
      ctx.strokeStyle = j.g > 0 ? 'rgba(85,255,255,.35)' : 'rgba(255,43,214,.4)'; ctx.lineWidth = .6; ctx.beginPath();
      for (let x = Math.floor(j.cam.x / 24) * 24; x < j.cam.x + VW; x += 24) { const ph = (j.t * 2 + x * .01) % 1, y = j.g > 0 ? 40 + ph * 150 : 190 - ph * 150; ctx.moveTo(x, y); ctx.lineTo(x, y + 6 * j.g); }
      ctx.stroke();
    },
    ayudas: [{ id: 'g', cuando: j => j.p.x > 9 * T, txt: 'Fresita: clic voltea la gravedad. Itzel camina por el techo y cruza el hueco.' }],
  });
  window.PROPIO_PODER = j => j.def.poder(j);
  // lo de adentro: una pared de fondo (cueva, torre o templo) que tapa el cielo desde cierta fila hacia abajo
  function paredFondo(ctx, j, desde, pinta) {
    const Hv = PROPIO.alto ? (typeof VISTA !== 'undefined' && j.vista === 'juego' ? VISTA.H : VH) : VH, x0 = Math.floor((j.cam.x - 40) / 32) * 32, y0 = Math.max(desde * T, Math.floor((j.cam.y - 40) / 32) * 32);
    for (let y = y0; y < j.cam.y + Hv + 40; y += 32) for (let x = x0; x < j.cam.x + VW + 40; x += 32) pinta(ctx, x, y, hash2(x / 32, y / 32, 61), hash2(x / 32, y / 32, 62));
  }

  // ---------------------------------------------------------------
  //  VITRAL · Las torres de la Catedral (hacia arriba, salto de pared)
  //  Itzel sube por dentro de la torre saltando de pared en pared; donde
  //  los muros quedan lejos, Fresita enciende los vitrales y la luz se
  //  vuelve un escalón. Desde arriba caen pedazos de vidrio.
  // ---------------------------------------------------------------
  const to = lienzo(24, 84);
  to.r(0, 1, 0, 83).r(22, 23, 0, 83).r(0, 23, 82, 83);
  to.p(4, 81, 'P');
  to.r(7, 8, 66, 81);                                            // chimenea 1: entre el muro izquierdo y el pilar
  to.r(9, 21, 66, 81).monedas(3, 6, 70);                        // el piso de la segunda chimenea (lo de abajo, macizo)
  to.r(14, 15, 50, 63);                                          // la chimenea 2 se entra por abajo del pilar                        // chimenea 2, del otro lado
  to.r(18, 21, 50, 50).p(20, 49, 'w').p(19, 49, 'C');
  to.r(9, 12, 47, 47, 'W').r(5, 7, 44, 44, 'W');                  // vitrales que Fresita enciende
  to.r(2, 5, 41, 41).monedas(2, 5, 40);
  to.r(6, 6, 24, 38).r(10, 11, 24, 33);                          // chimenea 3, angosta
  to.r(7, 9, 24, 24).p(8, 23, 'C');
  to.r(13, 16, 22, 22, 'W').r(18, 21, 19, 19);
  to.r(17, 17, 6, 16).r(21, 21, 6, 16).p(19, 18, 'o');           // la última chimenea, hasta el campanario
  to.r(12, 16, 6, 6).r(2, 11, 4, 4).p(6, 3, 'G').monedas(13, 16, 5);
  to.p(15, 30, 'v').p(14, 12, 'v');
  nivelPropio('torres', 'vitral', {
    nombre: 'Las torres de la Catedral', lugar: 'Catedral de Campeche',
    lema: 'Hacia arriba por dentro de la torre. Itzel se resbala por las paredes y Fresita la avienta de una a otra con clic; también enciende los vitrales para que la luz sea escalón.',
    dato: 'La Catedral de Nuestra Señora de la Purísima Concepción tardó casi dos siglos en terminarse: empezó en el siglo XVI y su segunda torre se acabó en el XIX.',
    relleno: '#2e2834', power: 'luzVitral', foe: 'escarabajo', fauna: ['escarabajo', 'murcielago'], foes: { w: 'escarabajo', v: 'murcielago' }, mapa: to.filas(), pared: true, paredFresita: true, cd: .2,
    prepara(j) { j.vidrios = []; j.cuenta = 3; },
    poder(j, x, y) {
      // con Itzel resbalándose por una pared, el clic la avienta a la de enfrente; si no, enciende vitrales
      if (PROPIO.saltaPared(j)) return;
      const v = j.vitrales.filter(q => Math.hypot((q.c + .5) * T - x, (q.r + .5) * T - y) < 40); if (!v.length) return false;
      const fila = v[0].r; for (const q of j.vitrales) if (q.r === fila && Math.abs(q.c - v[0].c) <= 4) q.t = 4.5;
      chispas(j, (v[0].c + .5) * T, (fila + .5) * T, ['#fff3c4', '#f2c230', '#ffffff'], 18, 60);
    },
    demo(j) { if (j.t % 2 < 1 / 60) for (const q of j.vitrales) q.t = 3; PROPIO.saltaPared(j); },
    paso(j, dt) {
      // vidrios que caen desde lo alto: primero se ve su sombra
      j.cuenta -= dt; if (j.cuenta <= 0) { j.cuenta = 2.2 + Math.random() * 1.5; j.vidrios.push({ x: clamp(j.p.x + (Math.random() - .5) * 120, 3 * T, 21 * T), y: j.cam.y - 10, vy: 0, aviso: .8 }); }
      for (const q of j.vidrios) { if (q.aviso > 0) { q.aviso -= dt; continue; } q.vy += 500 * dt; q.y += q.vy * dt; if (PROPIO.solido(j, Math.floor(q.x / T), Math.floor(q.y / T))) { q.fin = true; chispas(j, q.x, q.y, ['#bfe8ff', '#ffffff', '#e04050'], 10, 50); } if (Math.abs(q.x - j.p.x) < 8 && q.y > j.p.y - 22 && q.y < j.p.y) { q.fin = true; if (dañoModo(j) && typeof SONIDO !== 'undefined') SONIDO.fx('herida'); } }
      j.vidrios = j.vidrios.filter(q => !q.fin && q.y < j.cam.y + 400);
    },
    tinte(ctx, j, Hv) { const k = 1 - clamp(j.cam.y / (j.H * T), 0, 1); ctx.fillStyle = `rgba(255,240,200,${k * .2})`; ctx.fillRect(0, 0, VW, Hv); },
    pinta(ctx, j, f, capa) {
      if (capa === 'atras') {
        // por dentro de la torre: sillares de piedra y ventanas con su vitral que da luz de colores
        paredFondo(ctx, j, 5, (c, x, y, a) => { c.fillStyle = mix('#5a5060', '#3a3444', a * .5); c.fillRect(x, y, 32, 32); c.strokeStyle = 'rgba(20,16,24,.45)'; c.lineWidth = .7; c.strokeRect(x + .5, y + .5, 31, 15); c.strokeRect(x + 16.5, y + 16.5, 31, 15); c.strokeRect(x - 15.5, y + 16.5, 31, 15); });
        for (let r = Math.floor(j.cam.y / (T * 9)) * 9 + 3; r < (j.cam.y + 320) / T; r += 9) for (const c of [6, 15]) { const x = c * T, y = r * T, cols = ['#e04050', '#3a7ad8', '#f2c230', '#3aa860'];
          ctx.fillStyle = '#1a1420'; ctx.beginPath(); ctx.moveTo(x, y + 40); ctx.lineTo(x, y + 12); ctx.arc(x + 12, y + 12, 12, Math.PI, 0); ctx.lineTo(x + 24, y + 40); ctx.closePath(); ctx.fill();
          for (let k = 0; k < 6; k++) { ctx.fillStyle = rgba(cols[(k + r) % 4], .55 + Math.sin(j.t + k + r) * .08); ctx.fillRect(x + 2 + (k % 2) * 10, y + 6 + Math.floor(k / 2) * 11, 10, 11); }
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(x, y, x + 50, y + 80); g.addColorStop(0, 'rgba(255,220,160,.18)'); g.addColorStop(1, 'rgba(255,220,160,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y + 10); ctx.lineTo(x + 24, y + 10); ctx.lineTo(x + 70, y + 90); ctx.lineTo(x + 30, y + 90); ctx.closePath(); ctx.fill(); ctx.restore(); }
      }
      if (capa !== 'frente') return;
      for (const q of j.vidrios) { if (q.aviso > 0) { ctx.strokeStyle = `rgba(224,64,80,${.5 + Math.sin(j.t * 30) * .3})`; ctx.setLineDash([3, 3]); ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(q.x, j.cam.y); ctx.lineTo(q.x, j.cam.y + 240); ctx.stroke(); ctx.setLineDash([]); continue; }
        ctx.fillStyle = 'rgba(190,230,255,.85)'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(q.x, q.y + 6); ctx.lineTo(q.x - 3, q.y - 4); ctx.lineTo(q.x + 3, q.y - 6); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    },
    ayudas: [{ id: 'arriba', cuando: j => j.t > 1, txt: 'Hacia arriba: Itzel salta hacia la pared y se resbala; Fresita, clic y la avientas a la de enfrente.' },
      { id: 'vitral', cuando: j => j.p.y < 50 * T, txt: 'Fresita: clic en un vitral lo enciende y su luz aguanta a Itzel un ratito.' }],
  });

  // ---------------------------------------------------------------
  //  CINEMA · El laberinto de Chicanná (para explorar)
  //  Doce cuartos; cuatro se usan. La salida está tras una puerta de jade;
  //  la llave está en lo alto y solo se alcanza con la pluma de quetzal,
  //  que se esconde detrás de un muro falso. Las rocas de ilusión solo
  //  existen a la luz de Fresita, y con clic Fresita trae a Itzel hasta ella.
  // ---------------------------------------------------------------
  const la = lienzo(72, 45, '#'), cuarto = (i, j) => la.r(18 * i + 1, 18 * i + 16, 15 * j + (j ? 0 : 1), 15 * j + 12, '.');
  const L0 = (i, j) => [18 * i, 15 * j]; // esquina de cada cuarto
  for (const [i, j] of [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [0, 2], [3, 1], [3, 2]]) cuarto(i, j);
  const puerta = (i, j) => la.r(18 * i + 17, 18 * i + 18, 15 * j + 10, 15 * j + 12, '.');
  const bajada = (i, j, c0, c1, esc) => { const [x, y] = L0(i, j); la.r(x + c0, x + c1, y + 13, y + 15, '.'); if (esc !== undefined) la.r(x + esc, x + esc, y + 13, y + 27, 'H'); };
  puerta(0, 0); puerta(1, 0); puerta(2, 0); puerta(0, 1);
  // cuarto de salida (0,0)
  la.p(3, 12, 'P').r(7, 9, 9, 9).r(12, 14, 6, 6).monedas(12, 14, 5).monedas(7, 9, 8);
  // (1,0): plataformas y la bajada con escalera al cuarto (1,1)
  { const [x] = L0(1, 0); la.r(x + 3, x + 5, 9, 9).r(x + 11, x + 14, 8, 8).monedas(x + 11, x + 14, 7).p(x + 9, 12, 'w'); bajada(1, 0, 13, 15, 14); }
  // (2,0): babosas y un foso de púas
  { const [x] = L0(2, 0); la.r(x + 5, x + 11, 12, 12, 'x').r(x + 4, x + 5, 10, 10).r(x + 8, x + 9, 8, 8).r(x + 12, x + 13, 10, 10).monedas(x + 8, x + 9, 7).p(x + 2, 12, 'w'); }
  // (3,0): la llave en lo alto (solo con doble salto) y la bajada a (3,1)
  { const [x] = L0(3, 0); la.r(x + 11, x + 16, 7, 7).p(x + 14, 6, 'K').r(x + 9, x + 9, 8, 12).p(x + 6, 12, 'C'); bajada(3, 0, 2, 4, 3); }
  // (1,1): el foso de púas con rocas de ilusión hacia la puerta del cuarto (0,1)
  { const [x, y] = L0(1, 1); la.r(x + 1, x + 13, y + 12, y + 12, 'x').r(x + 2, x + 3, y + 11, y + 11, '-').r(x + 6, x + 7, y + 10, y + 10, '-').r(x + 10, x + 11, y + 11, y + 11, '-').r(x + 14, x + 16, y + 11, y + 11).p(x + 15, y + 10, 'C').monedas(x + 6, x + 7, y + 8); la.r(x - 1, x + 0, y + 9, y + 12, '.'); } // la puerta hacia (0,1) es más alta: se entra caminando desde la roca
  // (0,1): un bloque que parece de piedra y es un muro falso; adentro, la escalera a (0,2)
  { const [x, y] = L0(0, 1); la.r(x + 1, x + 6, y + 7, y + 12, 'F').r(x + 3, x + 3, y + 7, y + 12, 'H'); bajada(0, 1, 2, 4, 3); la.r(x + 10, x + 13, y + 9, y + 9).monedas(x + 10, x + 13, y + 8).p(x + 12, y + 12, 'w'); }
  // (0,2): la pluma de quetzal
  { const [x, y] = L0(0, 2); la.r(x + 9, x + 13, y + 10, y + 10).p(x + 11, y + 9, 'J').monedas(x + 6, x + 15, y + 12); la.p(x + 14, y + 4, 'v'); }
  // (3,1): la puerta de jade y la bajada final; (3,2): la salida
  { const [x, y] = L0(3, 1); la.r(x + 9, x + 9, y, y + 12, 'D'); bajada(3, 1, 12, 14); la.monedas(x + 11, x + 15, y + 6); }
  { const [x, y] = L0(3, 2); la.p(x + 8, y + 12, 'G').r(x + 2, x + 5, y + 9, y + 9).monedas(x + 2, x + 5, y + 8); }
  nivelPropio('chicanna', 'cinema', {
    nombre: 'El laberinto de Chicanná', lugar: 'Chicanná, ruta Río Bec',
    lema: 'Cuartos para explorar: la salida está tras una puerta de jade, la llave en lo alto y la pluma de quetzal detrás de un muro falso. A la luz de Fresita aparecen rocas.',
    dato: 'En la región Río Bec, como en Chicanná, los mayas hacían torres con escalinatas tan empinadas que no se podían subir: eran de adorno, como un escenario.',
    relleno: '#2a2230', power: 'portal', foe: 'babosa', fauna: ['babosa', 'murcielago'], foes: { w: 'babosa', v: 'murcielago' }, mapa: la.filas(), mapita: true, cd: 2.2,
    poder(j, x, y) {
      const p = j.p; if (Math.hypot(x - p.x, y - p.y) > 150) return false;
      const ny = y + 10; for (const [cx2, cy2] of [[x - 5, ny - 2], [x + 5, ny - 2], [x - 5, ny - 18], [x + 5, ny - 18]]) if (PROPIO.solido(j, Math.floor(cx2 / T), Math.floor(cy2 / T))) return false;
      chispas(j, p.x, p.y - 10, ['#7ff0e0', '#ffffff'], 14, 60); p.x = x; p.y = ny; p.vx = 0; p.vy = 0; chispas(j, x, ny - 10, ['#7ff0e0', '#ffffff'], 14, 60);
    },
    demo(j) { j.fre.x = j.p.x - j.cam.x + 40; },
    pinta(ctx, j, f, capa) {
      if (capa !== 'atras') return;
      // los muros de adentro del templo: sillares con mascarones de serpiente cada tanto
      paredFondo(ctx, j, 1, (c, x, y, a, b) => { c.fillStyle = mix('#6a5a48', '#4a3e34', a * .6); c.fillRect(x, y, 32, 32); c.strokeStyle = 'rgba(30,22,16,.4)'; c.lineWidth = .6; c.strokeRect(x + .5, y + .5, 31, 31);
        if (b < .035) { c.fillStyle = 'rgba(30,22,16,.45)'; c.beginPath(); c.arc(x + 10, y + 12, 3.2, 0, TAU); c.arc(x + 22, y + 12, 3.2, 0, TAU); c.fill(); c.fillRect(x + 7, y + 20, 18, 3); for (let k = 0; k < 4; k++) c.fillRect(x + 8 + k * 4.5, y + 23, 2, 4); } });
    },
    ayudas: [{ id: 'mapa', cuando: j => j.t > 1, txt: 'Un laberinto: el mapita de arriba marca lo que ya vieron. Fresita alumbra muros falsos y rocas escondidas.' },
      { id: 'portal', cuando: j => j.p.x > 18 * T && j.p.y > 15 * T, txt: 'Fresita: clic y Itzel aparece donde estás tú (si cabe y está cerca).' },
      { id: 'alto', cuando: j => j.p.x > 54 * T && j.p.y < 15 * T && !j.doble, txt: 'La llave está muy alto. Algún cuarto guarda algo para saltar más.' }],
  });
})();
