'use strict';
// =====================================================================
//  CARRERAS · El Bando, el desfile del Carnaval de Campeche (por el malecón)
//  Itzel va arriba de su carroza y compite contra los carros de los reyes del carnaval (infantil, juvenil y del
//  espectáculo) a lo largo del malecón: el mar a un lado, las familias sentadas en sus sillas apartadas, y por el camino
//  una banda de marcha, las bastoneras y las comparsas. Tres carriles (↑ ↓); → acelera y ← frena; Espacio es el empujón
//  (se carga con cacao). Hay barriles (lastiman), charcos y globos de pintura (frenan), serpentinas (aceleran) y cacao.
//  PODERES (como en las carreras de karts, pedido de David 2026-11-20/21): sobre los carriles flotan burbujas de poder.
//  Itzel las revienta pasándoles encima con la carroza y el poder le toca a Fresita, que es la que lanza: los de ataque
//  se los avienta al carro rival más cercano al cursor (globo de pintadera, serpentina enredadora, cohete al que va
//  primero); los cascarones caen en el carril; la matraca es turbo y la máscara protege a Itzel. Los carros rivales
//  también revientan burbujas y usan lo que les sale: le avientan cosas a Itzel (se ve la sombra en su carril: cámbiate,
//  o que Fresita lo reviente en el aire), sueltan cascarones, se ponen máscara o se echan turbo. Los rivales cambian de
//  carril, se pegan con los obstáculos y se dan empujones. Clic derecho: la canción de cuna duerme un momento a los carros.
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
  const LARGO = 3400, X0 = 112, ESC = 2;    // metros de la ruta, x de la carroza de Itzel y unidades de pantalla por metro
  const BASE = 70;                          // velocidad de crucero
  const COMPARSAS = [   // los carros de los reyes del carnaval
    { n: 'Carro del rey infantil', col: '#4fd0ff', luz: '#d4f2ff', b: 77, ph: 0 },
    { n: 'Carro del rey juvenil', col: '#e85a8a', luz: '#ffd1e6', b: 78.5, ph: 2.1 },
    { n: 'Carro del rey del espectáculo', col: '#f2b233', luz: '#fff0b0', b: 76, ph: 4.2 },
  ];
  // los poderes de las burbujas
  const PODERES = {
    globo: { n: 'Globo de pintadera', txt: 'clic en un carro: lo pinta y lo frena', ataque: true, col: '#ff4f9a' },
    serpentina: { n: 'Serpentina enredadora', txt: 'clic en un carro: se le enredan las ruedas', ataque: true, col: '#7fe0c0' },
    cohete: { n: 'Cohete de feria', txt: 'clic: va solo al carro que va primero', ataque: true, col: '#ffd23f' },
    cascarones: { n: 'Cascarones', txt: 'clic: los suelta detrás, en tu carril', col: '#c8a0e0' },
    matraca: { n: 'Matraca', txt: 'clic: turbo para la carroza de Itzel', col: '#ff9a3a' },
    mascara: { n: 'Máscara de carnaval', txt: 'clic: protege a Itzel del siguiente golpe', col: '#4fd0ff' },
  };
  // qué sale de la burbuja según el lugar en que vas (el último saca lo mejor)
  const SUERTE = [null, ['globo', 'globo', 'cascarones', 'mascara', 'serpentina'], ['globo', 'serpentina', 'matraca', 'cascarones', 'mascara'], ['serpentina', 'matraca', 'cohete', 'globo', 'matraca'], ['cohete', 'matraca', 'matraca', 'serpentina', 'cohete']];
  // por el camino se cruzan los grupos del desfile, que marchan más despacio que los carros
  const LUGARES = [{ d: 700, n: 'La banda de marcha', k: 'banda' }, { d: 1650, n: 'Las bastoneras', k: 'bastonera' }, { d: 2600, n: 'Las comparsas', k: 'comparsa' }];
  const H = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

  function crear(def, st) {
    const r = rng((RUN && RUN.seed || 5) * 7 + 3), obst = [], burbujas = [];
    // la ruta: filas de obstáculos cada tanto; nunca se tapan los tres carriles a la vez
    for (let d = 260; d < LARGO - 160; d += 58 + Math.floor(r() * 50)) {
      const libre = Math.floor(r() * 3), n = 1 + (r() < .4 ? 1 : 0);
      const carriles = [0, 1, 2].filter(c => c !== libre).sort(() => r() - .5).slice(0, n);
      for (const c of carriles) {
        const q = r(), tipo = q < .3 ? 'barril' : q < .5 ? 'charco' : q < .68 ? 'globo' : q < .86 ? 'serpentina' : 'cacao';
        obst.push({ d: d + r() * 14, lane: c, tipo, hecho: 0, ph: r() * 6 });
      }
      if (r() < .5) for (let k = 0; k < 4; k++) obst.push({ d: d + 14 + k * 12, lane: libre, tipo: 'cacao', hecho: 0, ph: k });
    }
    // las burbujas de poder: filas sobre los carriles, cada tanto (a veces en los tres, a veces en dos)
    for (let d = 190; d < LARGO - 120; d += 190 + Math.floor(r() * 90)) { const quita = r() < .45 ? Math.floor(r() * 3) : -1; for (const c of [0, 1, 2]) if (c !== quita) burbujas.push({ d: d + (c - 1) * 3, lane: c, rota: 0, ph: r() * 6 }); }
    return { t: 0, win: 0, shake: 0, bubbles: [], parts: [], def, st, inv: 0, pose: poseItzel(), d: 0, v: 0, carril: 1, meta: 1, kUp: false, kDown: false,
      boost: 0, slow: 0, mancha: 0, empuje: 0, cuna: 0, cunaCd: 0, letreros: [], obst, burbujas, proy: [], trampas: [], coins: 0, lugar: 4, mejor: 4,
      poder: null, escudo: 0, enreda: 0, golpes: 0, usados: 0, cuenta: 3.2, splats: null, manchaPrev: 0,
      rivales: COMPARSAS.map((c, i) => ({ ...c, d: [16, -30, -2][i], v: c.b, lane: [0, 1, 2][i], meta: [0, 1, 2][i], dorm: 0, slow: 0, boost: 0, enreda: 0, pinta: 0, escudo: 0, item: null, usaEn: 0, piensa: 0 })), fre: { x: 300, y: 90, face: 1 }, vertical: true };
  }
  const yDe = c => CARR[0] + (CARR[2] - CARR[0]) * (c / 2);
  const escDe = c => .84 + c * .115;             // tamaño de lo que va en cada carril (lejos, más chico)
  const CORTO = ['Rey infantil', 'Rey juvenil', 'Rey del espectáculo'];
  const xDe = (j, d) => X0 + (d - j.d) * ESC;
  const lugarDe = j => 1 + j.rivales.filter(q => q.d > j.d + .5).length;
  const letrero2 = (j, txt, x, y, col) => j.letreros.push({ txt, x, y, t: 0, col });
  // el costo de ir por un carril: lo que hay adelante (para el piloto del libro y para los rivales)
  function costoCarril(j, c, d0, actual) { let m = 0; for (const o of j.obst) if (!o.hecho && o.lane === c && o.d - d0 > -4 && o.d - d0 < 60) m += o.tipo === 'barril' ? 9 : o.tipo === 'charco' || o.tipo === 'globo' ? 4 : o.tipo === 'serpentina' || o.tipo === 'cacao' ? -3 : 0; for (const tr of j.trampas) if (tr.lane === c && tr.d - d0 > -4 && tr.d - d0 < 50) m += 5; for (const b of j.burbujas) if (!b.rota && b.lane === c && b.d - d0 > 0 && b.d - d0 < 60) m -= 3.5; return m + Math.abs(c - actual) * .3; }

  // un poder que le pega a un carro (rival o la carroza de Itzel)
  function golpea(j, q, tipo) {
    const esItzel = q === j, x = esItzel ? X0 : xDe(j, q.d), y = yDe(esItzel ? j.carril : q.lane);
    if (esItzel) {
      if (j.escudo > 0) { j.escudo = 0; letrero2(j, '¡La máscara lo paró!', x, y - 44, '#d4f2ff'); chispas(j, x, y - 20, ['#4fd0ff', '#ffffff'], 16, 70); return; }
      if (tipo === 'globo') { j.slow = Math.max(j.slow, 1.4); j.mancha = 2; } else if (tipo === 'cascarones') { j.slow = Math.max(j.slow, .9); }
      else if (tipo === 'serpentina') { j.enreda = 1.2; } else if (tipo === 'cohete') { j.enreda = .9; j.slow = Math.max(j.slow, 2); j.shake = .4; }
      j.golpes++; j.shake = Math.max(j.shake, .25); letrero2(j, { globo: '¡Te pintaron!', cascarones: '¡Cascarones!', serpentina: '¡Te enredaron!', cohete: '¡Cohetazo!' }[tipo] || '¡Pum!', x, y - 44, '#ffd1f0');
      chispas(j, x, y - 18, ['#ff4f9a', '#4fd0ff', '#ffd23f'], 18, 80); return;
    }
    if (q.escudo > 0) { q.escudo = 0; letrero2(j, '¡Traía máscara!', x, y - 50, '#d4f2ff'); chispas(j, x, y - 20, ['#4fd0ff', '#ffffff'], 14, 60); return; }
    if (tipo === 'globo') { q.slow = 2; q.pinta = 2.4; letrero2(j, '¡Pintado!', x, y - 50, '#ffd1f0'); }
    else if (tipo === 'serpentina') { q.enreda = 1.5; letrero2(j, '¡Enredado!', x, y - 50, '#c8ffe8'); }
    else if (tipo === 'cohete') { q.enreda = 1.2; q.slow = 2.6; j.shake = .3; letrero2(j, '¡Cohetazo!', x, y - 50, '#ffe9a0'); }
    else if (tipo === 'cascarones') { q.slow = Math.max(q.slow, 1.1); letrero2(j, '¡Cascarones!', x, y - 50, '#e8d8ff'); }
    chispas(j, x, y - 18, tipo === 'cohete' ? ['#ffd23f', '#ff7f3a', '#ffffff'] : tipo === 'serpentina' ? ['#7fe0c0', '#ff7fb0', '#ffd23f'] : ['#ff4f9a', '#4fd0ff', '#ffd23f', '#ffffff'], 22, 90);
    if (typeof SONIDO !== 'undefined' && SONIDO.fx) SONIDO.fx('pisa');
  }
  // Fresita usa el poder que trae
  function usaPoder(j, cx, cy) {
    const k = j.poder; if (!k) return false;
    const P = PODERES[k];
    if (k === 'matraca') { j.boost = Math.max(j.boost, 2.1); letrero2(j, '¡Matraca!', X0, yDe(j.carril) - 46, '#ffd9a0'); chispas(j, X0 - 22, yDe(j.carril) - 8, ['#ff9a3a', '#ffd23f', '#ffffff'], 18, 80); }
    else if (k === 'mascara') { j.escudo = 9; letrero2(j, 'Máscara puesta', X0, yDe(j.carril) - 46, '#d4f2ff'); }
    else if (k === 'cascarones') { for (let i = 0; i < 3; i++) j.trampas.push({ d: j.d - 10 - i * 7, lane: Math.round(j.carril), ph: Math.random() * 6, de: j }); letrero2(j, 'Cascarones en el carril', X0 - 20, yDe(j.carril) - 36, '#e8d8ff'); }
    else {
      // el blanco: el carro más cerca del clic (el cohete se va solo al que va primero)
      let blanco = null;
      if (k === 'cohete') blanco = j.rivales.reduce((a, q) => q.d > (a ? a.d : -1e9) ? q : a, null);
      else { let mejor = 1e9; for (const q of j.rivales) { const x = xDe(j, q.d); if (x < -30 || x > VW + 30) continue; const dd = Math.hypot(x - cx, yDe(q.lane) - 20 - cy); if (dd < mejor) { mejor = dd; blanco = q; } } if (mejor > 90) blanco = null; }
      if (!blanco) { letrero2(j, 'Apunta a un carro', j.fre.x, j.fre.y - 14, '#ffffff'); return true; }
      j.proy.push({ tipo: k, de: 'fresita', x: j.fre.x, y: j.fre.y, blanco, t: 0, dur: k === 'cohete' ? .9 : .45 });
    }
    j.poder = null; j.usados++;
    if (typeof SONIDO !== 'undefined' && SONIDO.fx) SONIDO.fx('poder');
    return true;
  }

  function paso(j, dt) {
    j.t += dt; j.inv = Math.max(0, j.inv - dt); j.shake = Math.max(0, j.shake - dt);
    for (const k of ['boost', 'slow', 'mancha', 'cuna', 'cunaCd', 'escudo', 'enreda']) j[k] = Math.max(0, j[k] - dt);
    const k = teclas(), demo = j.inv > 5;
    // la salida: semáforo de tres luces; mientras, nadie se mueve (Fresita sí)
    if (demo) j.cuenta = 0;
    if (j.cuenta > 0) {
      const antes = j.cuenta; j.cuenta -= dt;
      if (Math.ceil(antes) !== Math.ceil(j.cuenta) && typeof SONIDO !== 'undefined' && SONIDO.fx) SONIDO.fx(j.cuenta <= 0 ? 'fanfarria' : 'canistel');
      if (MOUSE.active) { j.fre.x += (MOUSE.x - j.fre.x) * Math.min(1, dt * 9); j.fre.y += (MOUSE.y - j.fre.y) * Math.min(1, dt * 9); }
      MOUSE.clicks.length = 0; j.kUp = k.up; j.kDown = k.down; pasoChispas(j, dt); return;
    }
    // el carril: ↑ ↓ (un toque, un carril). En el libro se maneja sola: esquiva lo que viene
    if (!j.win) {
      if (demo) {
        if (!j.piloto || j.t > j.piloto) {
          j.piloto = j.t + .25;
          let mejor = j.meta; for (const c of [0, 1, 2]) if (costoCarril(j, c, j.d, j.meta) < costoCarril(j, mejor, j.d, j.meta) - .2) mejor = c; j.meta = mejor;
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
    if (j.boost > 0) obj += 55; if (j.slow > 0) obj *= .55; if (j.enreda > 0) obj *= .2;
    if ((k.space || (demo && j.empuje >= 1 && j.t % 9 < .05)) && j.empuje >= 1 && j.boost < .3 && !j.win) { j.boost = 1.3; j.empuje = 0; chispas(j, X0 - 22, yDe(j.carril) - 8, ['#ffd23f', '#ff7fb0', '#7fe0c0'], 14, 70); }
    if (j.win) obj = 0;
    j.v += (obj - j.v) * Math.min(1, dt * (j.win ? 3.2 : 3));
    j.d += j.v * dt;
    // los carros de los reyes: escogen carril, se pegan con lo que hay, se empujan y revientan burbujas
    const lider = Math.max(j.d, ...j.rivales.map(q => q.d));
    for (const q of j.rivales) {
      for (const kk of ['dorm', 'slow', 'boost', 'enreda', 'pinta', 'escudo']) q[kk] = Math.max(0, q[kk] - dt);
      if (j.cuna > 0) q.dorm = Math.max(q.dorm, .2);
      q.piensa -= dt;
      if (q.piensa <= 0) { q.piensa = .5 + Math.random() * .7; let mejor = q.meta; for (const c of [0, 1, 2]) if (costoCarril(j, c, q.d, q.meta) + Math.random() * 2.5 < costoCarril(j, mejor, q.d, q.meta)) mejor = c; if (Math.abs(mejor - q.meta) <= 1) q.meta = mejor; }
      q.lane += (q.meta - q.lane) * Math.min(1, dt * 6);
      // «liga»: los que se quedan atrás aprietan, el que va muy adelante afloja
      let v = q.b + Math.sin(j.t * .6 + q.ph) * 5 + (q.d < j.d - 45 ? 13 : q.d < j.d - 15 ? 5 : 0) + (q.d > j.d + 110 ? -10 : q.d > j.d + 50 ? -4 : 0) + (q.d >= lider - .1 && q.d > j.d ? -2 : 0);
      if (q.boost > 0) v += 40; if (q.slow > 0) v *= .5; if (q.enreda > 0) v *= .12; if (q.dorm > 0) v *= .35;
      q.v += (v - q.v) * Math.min(1, dt * 2.2); if (!j.win || q.d < LARGO) q.d = Math.min(LARGO + 40, q.d + q.v * dt);
      // lo que pisan
      for (const o of j.obst) {
        if (o.hecho || o.lane !== Math.round(q.lane) || Math.abs(o.d - q.d) > 3 || (o.porRival && o.porRival.has(q))) continue;
        (o.porRival = o.porRival || new Set()).add(q);
        if (o.tipo === 'barril' || o.tipo === 'globo') { q.slow = Math.max(q.slow, 1); if (o.tipo === 'barril') { o.hecho = 2; o.instante = j.t; } }
        else if (o.tipo === 'charco') { q.slow = Math.max(q.slow, .8); q.pinta = Math.max(q.pinta, 1); }
        else if (o.tipo === 'serpentina') q.boost = Math.max(q.boost, 1.2);
      }
      for (const tr of j.trampas) if (!tr.hecho && tr.de !== q && tr.lane === Math.round(q.lane) && Math.abs(tr.d - q.d) < 3) { tr.hecho = true; golpea(j, q, 'cascarones'); }
      // las burbujas que revienta el rival: se queda con lo que salga
      for (const b of j.burbujas) if (!b.rota && b.lane === Math.round(q.lane) && Math.abs(b.d - q.d) < 3) {
        b.rota = j.t; b.quien = q; chispas(j, xDe(j, b.d), yDe(b.lane) - 14, ['#ffffff', '#b8f0ff', '#ffd1f0'], 12, 70);
        if (!q.item) { const lugar = 1 + [j.d, ...j.rivales.map(r => r.d)].filter(d => d > q.d + .01).length, lista = SUERTE[clamp(lugar, 1, 4)]; q.item = lista[Math.floor(Math.random() * lista.length)]; q.usaEn = j.t + .8 + Math.random() * 1.6; q.itemT = j.t; }
      }
      // y lo usa: contra Itzel si la tiene cerca, o para sí
      if (q.item && j.t >= q.usaEn && !j.win && !demo && q.dorm <= 0 && q.enreda <= 0) {
        const it = q.item, x = xDe(j, q.d), cerca = Math.abs(q.d - j.d) < 95;
        if (it === 'matraca') { q.boost = 2; q.item = null; letrero2(j, '¡Matraca!', x, yDe(q.lane) - 54, '#ffd9a0'); }
        else if (it === 'mascara') { q.escudo = 8; q.item = null; letrero2(j, 'Se puso máscara', x, yDe(q.lane) - 54, '#d4f2ff'); }
        else if (it === 'cascarones') { if (q.d > j.d || j.t - q.itemT > 6) { for (let i = 0; i < 3; i++) j.trampas.push({ d: q.d - 9 - i * 7, lane: Math.round(q.lane), ph: Math.random() * 6, de: q }); q.item = null; letrero2(j, '¡Soltó cascarones!', x, yDe(q.lane) - 54, '#e8d8ff'); } else q.usaEn = j.t + .5; }
        else if (it === 'cohete') {
          const lider = [{ q: j, d: j.d }, ...j.rivales.filter(r => r !== q).map(r => ({ q: r, d: r.d }))].sort((a, b) => b.d - a.d)[0].q;
          if (lider === j) { j.proy.push({ tipo: 'cohete', de: 'rival', x, y: yDe(q.lane) - 34, lane: Math.round(j.meta), t: 0, dur: 1.4, quien: q }); letrero2(j, '¡Cohete hacia Itzel!', x, yDe(q.lane) - 54, '#ffe9a0'); }
          else j.proy.push({ tipo: 'cohete', de: 'carro', x, y: yDe(q.lane) - 34, blanco: lider, t: 0, dur: .9 });
          q.item = null;
        }
        else if (cerca) { j.proy.push({ tipo: it, de: 'rival', x, y: yDe(q.lane) - 34, lane: Math.round(j.meta), t: 0, dur: it === 'serpentina' ? .8 : 1, quien: q }); letrero2(j, it === 'globo' ? '¡Ahí va un globo!' : '¡Ahí va una serpentina!', x, yDe(q.lane) - 54, '#ffd1f0'); q.item = null; }
        else { q.usaEn = j.t + .5; if (j.t - q.itemT > 9) q.item = null; }
      }
      // empujones con la carroza de Itzel
      if (!j.win && Math.abs(q.lane - j.carril) < .6 && Math.abs(q.d - j.d) < 7 && !(q.choque > j.t)) {
        q.choque = j.t + .8; const atras = q.d < j.d ? q : null;
        if (atras) { q.slow = Math.max(q.slow, .7); } else { j.slow = Math.max(j.slow, .5); }
        if (q.lane > 0 && q.lane < 2) q.meta = q.lane + (q.lane > j.carril ? 1 : -1); else q.meta = q.lane < 1 ? 1 : 1;
        j.shake = .15; letrero2(j, '¡Empujón!', xDe(j, (q.d + j.d) / 2), yDe(j.carril) - 40, '#ffffff'); chispas(j, xDe(j, (q.d + j.d) / 2), yDe(j.carril) - 12, ['#ffffff', '#ffd23f'], 10, 60);
      }
    }
    // obstáculos
    for (const o of j.obst) {
      if (o.hecho || Math.abs(o.lane - j.carril) > .55) continue;
      const dd = o.d - j.d; if (dd > 7 || dd < -9) continue;
      o.hecho = 1; o.instante = j.t; const x = xDe(j, o.d), y = yDe(o.lane);
      if (o.tipo === 'barril') { if (j.escudo > 0) { j.escudo = 0; letrero2(j, '¡La máscara lo paró!', x, y - 28, '#d4f2ff'); } else if (dañoModo(j)) { j.slow = 1.3; } chispas(j, x, y - 8, ['#a06c34', '#6a4422', '#ffffff'], 14, 70); letrero2(j, '¡Pum!', x, y - 22, '#ffb09a'); }
      else if (o.tipo === 'charco') { j.slow = Math.max(j.slow, 1.1); j.mancha = Math.max(j.mancha, .9); chispas(j, x, y - 2, ['#ff4f9a', '#4fd0ff', '#ffd23f'], 12, 60); letrero2(j, 'pintura…', x, y - 22, '#ffd1f0'); }
      else if (o.tipo === 'globo') { j.slow = Math.max(j.slow, .8); j.mancha = 1.8; chispas(j, x, y - 16, ['#ff4f9a', '#4fd0ff', '#ffd23f', '#ffffff'], 18, 80); letrero2(j, '¡Pintadera!', x, y - 28, '#ffd1f0'); }
      else if (o.tipo === 'serpentina') { j.boost = Math.max(j.boost, 1.5); chispas(j, x, y - 6, ['#ff7fb0', '#7fe0c0', '#ffd23f'], 16, 90); letrero2(j, '¡Serpentina!', x, y - 22, '#ffe9a0'); }
      else { RUN.coins++; j.coins++; j.empuje = Math.min(1, j.empuje + .2); chispas(j, x, y - 10, ['#ffd23f', '#ffffff'], 8, 50); }
    }
    for (const tr of j.trampas) if (!tr.hecho && tr.de !== j && Math.abs(tr.lane - j.carril) < .55 && Math.abs(tr.d - j.d) < 4) { tr.hecho = true; golpea(j, j, 'cascarones'); }
    for (const b of j.burbujas) {
      if (b.rota || Math.abs(b.lane - j.carril) > .55) continue; const dd = b.d - j.d; if (dd > 7 || dd < -9) continue;
      b.rota = j.t; b.quien = j; const x = xDe(j, b.d), y = yDe(b.lane) - 16;
      chispas(j, x, y, ['#ffffff', '#b8f0ff', '#ffd1f0', '#fff4a0'], 20, 90);
      if (j.poder) { RUN.coins++; letrero2(j, '+1 canistel (Fresita ya trae un poder)', x, y - 14, '#ffe9a0'); }
      else { const lista = SUERTE[clamp(j.lugar, 1, 4)]; j.poder = lista[Math.floor(Math.random() * lista.length)]; letrero2(j, '¡' + PODERES[j.poder].n + '!', x, y - 14, '#ffffff'); }
      if (typeof SONIDO !== 'undefined' && SONIDO.fx) SONIDO.fx('canistel');
    }
    j.trampas = j.trampas.filter(tr => !tr.hecho && tr.d > j.d - 260);
    // los proyectiles en el aire
    for (const pr of j.proy) {
      pr.t += dt;
      if (pr.de === 'fresita' || pr.de === 'carro') { const q = pr.blanco, tx = xDe(j, q.d), ty = yDe(q.lane) - 22, u = Math.min(1, pr.t / pr.dur); pr.px = lerp(pr.x, tx, u); pr.py = lerp(pr.y, ty, u) - Math.sin(u * Math.PI) * (pr.tipo === 'cohete' ? 40 : 22); if (u >= 1) { pr.fin = true; golpea(j, q, pr.tipo); } }
      else { const u = Math.min(1, pr.t / pr.dur), tx = X0, ty = yDe(pr.lane) - 16; pr.px = lerp(pr.x, tx, u); pr.py = lerp(pr.y, ty, u) - Math.sin(u * Math.PI) * 46; if (u >= 1) { pr.fin = true; if (Math.abs(j.carril - pr.lane) < .55) golpea(j, j, pr.tipo); else { letrero2(j, '¡Fallaron!', X0, yDe(pr.lane) - 20, '#c8ffe8'); chispas(j, X0, yDe(pr.lane) - 4, ['#ff4f9a', '#4fd0ff'], 10, 50); } } }
    }
    j.proy = j.proy.filter(pr => !pr.fin);
    // Fresita: sigue el mouse. Clic: lanza el poder que trae; también revienta en el aire lo que les avientan
    if (MOUSE.active) { j.fre.x += (MOUSE.x - j.fre.x) * Math.min(1, dt * 9); j.fre.y += (MOUSE.y - j.fre.y) * Math.min(1, dt * 9); }
    else { j.fre.x += (X0 + 18 - j.fre.x) * dt * 3; j.fre.y += (yDe(j.carril) - 44 - j.fre.y) * dt * 3; }
    if (demo && !j.win) {   // en el libro, Fresita avienta lo que le toque
      if (j.poder && j.t % 2 < dt) { const q = j.rivales[0]; MOUSE.clicks.push({ x: xDe(j, q.d), y: yDe(q.lane) - 20, b: 0 }); }
    }
    for (const c of MOUSE.clicks) {
      if (c.up) continue;
      if (c.b === 2) { if (j.cunaCd <= 0) { j.cuna = 1.6; j.cunaCd = 7; chispas(j, j.fre.x, j.fre.y, ['#b9a7ff', '#ffffff'], 16, 60); letrero2(j, 'la canción de cuna…', j.fre.x, j.fre.y - 12, '#d8ccff'); } continue; }
      // un globo que viene hacia Itzel: se revienta en el aire
      const vuela = j.proy.find(pr => pr.de === 'rival' && Math.hypot(pr.px - c.x, pr.py - c.y) < 16);
      if (vuela) { vuela.fin = true; chispas(j, vuela.px, vuela.py, ['#ff4f9a', '#4fd0ff', '#ffd23f', '#ffffff'], 16, 70); letrero2(j, '¡Fresita lo reventó!', vuela.px, vuela.py - 10, '#ffe9a0'); continue; }
      usaPoder(j, c.x, c.y);
    }
    MOUSE.clicks.length = 0;
    if (!j.win) j.lugar = lugarDe(j);
    for (const l of j.letreros) l.t += dt; j.letreros = j.letreros.filter(l => l.t < 1.1);
    // la meta
    if (!j.win && j.d >= LARGO) { j.win = j.t; RUN.coins += [4, 2, 1, 0][j.lugar - 1] || 0; j.final = j.lugar === 1 ? '¡Primer lugar en el Bando!' : `Llegaste en ${j.lugar}.º lugar`; j.podio = [{ n: 'Itzel y Fresita', col: '#ffffff', d: j.d, yo: true }, ...j.rivales.map(q => ({ n: q.n, col: q.col, d: q.d }))].sort((a, b) => b.d - a.d); chispas(j, xDe(j, LARGO) - 30, 90, ['#ffdd94', '#ff7fb0', '#7fe0c0', '#ffffff', '#4fd0ff'], 70, 150); }
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
  // los fuegos artificiales del carnaval: una palmera de chispas que sube, revienta y cae
  function fuegos(ctx, t, y0, alto, n, gr = 1) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const per = 2.6 + H(i, 4) * 1.8, u = ((t + H(i, 5) * per) % per) / per, x = 30 + H(i, 6) * (VW - 60) + Math.floor((t + H(i, 5) * per) / per) * 97 % 60 - 30, yb = y0 + alto * (.2 + H(i, 7) * .5);
      const col = ['#ff4f9a', '#4fd0ff', '#ffd23f', '#7fe0c0', '#c8a0e0'][i % 5];
      if (u < .3) { const yy = lerp(y0 + alto, yb, u / .3); ctx.fillStyle = 'rgba(255,240,200,.8)'; ctx.fillRect(x - .5, yy, 1, 4); }
      else { const k = (u - .3) / .7, r = (6 + k * 26) * gr, a = (1 - k) * .9; glowDot(ctx, x, yb, 18 * (1 - k) + 4, col, a * .35); ctx.fillStyle = col; for (let s = 0; s < 14; s++) { const an = s / 14 * TAU + i, px = x + Math.cos(an) * r, py = yb + Math.sin(an) * r + k * k * 10; ctx.globalAlpha = a; ctx.fillRect(px - .7, py - .7, 1.4, 1.4); } ctx.globalAlpha = 1; }
    }
    ctx.restore();
  }
  // arriba, en la ventana alta: el cielo de la noche de carnaval
  function extiende(ctx, j, ex, f) {
    const g = ctx.createLinearGradient(0, -ex, 0, 0); g.addColorStop(0, '#05030c'); g.addColorStop(.7, '#120a26'); g.addColorStop(1, j.colTope || '#1a1030'); ctx.fillStyle = g; ctx.fillRect(0, -ex, VW, ex + 1);
    for (let i = 0; i < 70; i++) { const x = H(i, 1) * VW, y = -ex + H(i, 2) * ex, a = .3 + .5 * Math.abs(Math.sin(j.t * (1 + H(i, 3)) + i)); ctx.fillStyle = `rgba(255,240,255,${a})`; ctx.fillRect(x, y, H(i, 8) > .85 ? 1.4 : .8, H(i, 8) > .85 ? 1.4 : .8); }
    ctx.fillStyle = '#fff4d8'; ctx.beginPath(); ctx.arc(VW * .82, -ex * .72, 9, 0, TAU); ctx.fill(); ctx.fillStyle = '#120a26'; ctx.beginPath(); ctx.arc(VW * .82 + 4, -ex * .72 - 2, 8, 0, TAU); ctx.fill();
    // dos reflectores que barren el cielo desde el malecón
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const [x0, fase, col] of [[VW * .2, 0, 'rgba(79,208,255,'], [VW * .78, 2.2, 'rgba(255,79,154,']]) { const an = -Math.PI / 2 + Math.sin(j.t * .5 + fase) * .55, L = ex + 60; const g2 = ctx.createLinearGradient(x0, 0, x0 + Math.cos(an) * L, Math.sin(an) * L); g2.addColorStop(0, col + '.22)'); g2.addColorStop(1, col + '0)'); ctx.fillStyle = g2; ctx.beginPath(); ctx.moveTo(x0, 4); ctx.lineTo(x0 + Math.cos(an - .07) * L, Math.sin(an - .07) * L); ctx.lineTo(x0 + Math.cos(an + .07) * L, Math.sin(an + .07) * L); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    fuegos(ctx, j.t, -ex, ex, 7, 1.6);
    // cordones de focos de colores que cruzan la calle, meciéndose
    const off = j.d * ESC;
    for (const [y0, comba, par, paso] of [[-ex * .62, 18, .5, 26], [-ex * .3, 14, .75, 22]]) {
      const per = 220, o = (off * par) % per;
      for (let k = -1; k < VW / per + 2; k++) { const xa = k * per - o; ctx.strokeStyle = 'rgba(255,240,220,.35)'; ctx.lineWidth = .5; ctx.beginPath(); for (let u = 0; u <= 1.001; u += .05) ctx.lineTo(xa + u * per, y0 + Math.sin(u * Math.PI) * comba); ctx.stroke();
        for (let u = paso / per / 2; u < 1; u += paso / per) { const bx = xa + u * per, by = y0 + Math.sin(u * Math.PI) * comba + 3, c = ['#ff4f9a', '#4fd0ff', '#ffd23f', '#7fe0c0'][(((Math.round(u * 20 + k * 3)) % 4) + 4) % 4], prende = .6 + .4 * Math.sin(j.t * 4 + u * 30); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, bx, by, 6, c, .5 * prende); ctx.restore(); ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(bx, by, 1.6, 2.2, 0, 0, TAU); ctx.fill(); } }
    }
    // un cordón de papel picado más, cerca de la escena
    if (listo('papel-picado')) for (let x = -(off * .7 % 165) - 165; x < VW; x += 165) { ctx.globalAlpha = .9; imagen(ctx, 'papel-picado', x, -ex * .16 - 14, 165, 24); ctx.globalAlpha = 1; }
    // la orilla de abajo se funde con el cielo de la escena
    { const g3 = ctx.createLinearGradient(0, -16, 0, 1); g3.addColorStop(0, 'rgba(0,0,0,0)'); g3.addColorStop(1, j.colTope || '#120a26'); ctx.fillStyle = g3; ctx.fillRect(0, -16, VW, 17); }
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
    const g = ctx.createLinearGradient(0, 132, 0, 226); g.addColorStop(0, '#1e1830'); g.addColorStop(.45, '#2a2240'); g.addColorStop(1, '#382c4c'); ctx.fillStyle = g; ctx.fillRect(0, 132, VW, 94);
    // el asfalto mojado refleja las farolas y los neones del malecón
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = -1; i < VW / 48 + 2; i++) { const n = Math.floor(off * .9 / 48) + i, x = n * 48 - off * .9 + 20, col = ['rgba(255,79,154,', 'rgba(79,208,255,', 'rgba(255,210,63,'][((n % 3) + 3) % 3];
      const rg = ctx.createLinearGradient(0, 134, 0, 226); rg.addColorStop(0, col + '.16)'); rg.addColorStop(1, col + '0)'); ctx.fillStyle = rg; ctx.fillRect(x - 3 - H(n, 61) * 3, 134, 6 + H(n, 62) * 6, 92); }
    ctx.restore();
    // confeti y serpentinas tiradas en la calle (fijas al piso: pasan con la carroza)
    for (let i = -1; i < VW / 7 + 2; i++) { const n = Math.floor(off / 7) + i, x = n * 7 - off; if (H(n, 71) < .45) continue; const y = 136 + H(n, 72) * 86, c = PASTEL[(H(n, 73) * 7) | 0]; ctx.save(); ctx.translate(x + H(n, 74) * 6, y); ctx.rotate(H(n, 75) * 6); ctx.globalAlpha = .55; ctx.fillStyle = c; ctx.fillRect(-1.2, -.6, 2.4, 1.2); ctx.restore();
      if (H(n, 76) > .985) { ctx.strokeStyle = c; ctx.globalAlpha = .45; ctx.lineWidth = .8; ctx.beginPath(); for (let q = 0; q < 6; q++) ctx.lineTo(x + q * 3, y + Math.sin(q * 1.4 + n) * 2); ctx.stroke(); ctx.globalAlpha = 1; } }
    ctx.globalAlpha = 1;
    // las orillas de la calle: tiras de luz de neón
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,79,154,.55)'; ctx.fillRect(0, 132, VW, 1.4); ctx.fillStyle = 'rgba(255,79,154,.12)'; ctx.fillRect(0, 132, VW, 6);
    ctx.fillStyle = 'rgba(79,208,255,.55)'; ctx.fillRect(0, 224, VW, 1.4); ctx.fillStyle = 'rgba(79,208,255,.12)'; ctx.fillRect(0, 219, VW, 6);
    // rayas de los carriles, de luz
    ctx.strokeStyle = 'rgba(255,240,210,.5)'; ctx.lineWidth = 1.3; ctx.setLineDash([14, 12]); ctx.lineDashOffset = off % 26;
    for (const y of [(CARR[0] + CARR[1]) / 2 + 4, (CARR[1] + CARR[2]) / 2 + 4]) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(VW, y); ctx.stroke(); }
    ctx.setLineDash([]); ctx.restore();
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
  // una burbuja de poder: jabón tornasol que flota sobre el carril, con el signo del poder escondido adentro
  function burbuja(ctx, x, y, t, b) {
    if (b.rota) { const k = (t - b.rota) / .35; ctx.strokeStyle = `rgba(255,255,255,${1 - k})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y - 16, 10 + k * 14, 0, TAU); ctx.stroke(); return; }
    const by = y - 18 + Math.sin(t * 2.6 + b.ph) * 2, r = 13 + Math.sin(t * 5 + b.ph) * .6;
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, y, 8, 2, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, by, 26, ['#ff4f9a', '#4fd0ff', '#ffd23f'][Math.floor(t * 1.5 + b.ph) % 3], .55); ctx.restore();
    const g = ctx.createRadialGradient(x - 3, by - 4, 1, x, by, r); g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(.75, 'rgba(180,230,255,.12)'); g.addColorStop(1, 'rgba(255,170,230,.45)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, by, r, 0, TAU); ctx.fill();
    ctx.lineWidth = 1.1; for (let k = 0; k < 3; k++) { ctx.strokeStyle = ['rgba(255,79,154,.7)', 'rgba(79,208,255,.7)', 'rgba(255,210,63,.7)'][k]; ctx.beginPath(); ctx.arc(x, by, r - .4, t * 1.2 + k * 2.1, t * 1.2 + k * 2.1 + 1.6); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.ellipse(x - r * .38, by - r * .45, r * .26, r * .14, -.6, 0, TAU); ctx.fill();
    ctx.font = 'bold 12px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 2.4; ctx.strokeStyle = 'rgba(28,20,36,.65)'; ctx.strokeText('?', x, by + 4.2); ctx.fillStyle = '#ffffff'; ctx.fillText('?', x, by + 4.2); ctx.textAlign = 'left';
  }
  // el dibujo de cada poder (en el HUD y en el aire)
  function icono(ctx, k, x, y, s, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (k === 'globo') { ctx.fillStyle = '#ff4f9a'; ctx.beginPath(); ctx.ellipse(0, -1, 5, 6, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(-1.8, -3, 1.2, 2, -.5, 0, TAU); ctx.fill(); ctx.fillStyle = '#ff4f9a'; ctx.beginPath(); ctx.moveTo(-1, 5); ctx.lineTo(1, 5); ctx.lineTo(0, 3.6); ctx.fill(); }
    else if (k === 'serpentina') { ctx.lineWidth = 1.4; ['#7fe0c0', '#ff7fb0', '#ffd23f'].forEach((c, i) => { ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(0, 0, 2 + i * 2, t * 3 + i, t * 3 + i + 4.4); ctx.stroke(); }); }
    else if (k === 'cohete') { ctx.rotate(-.6); ctx.fillStyle = '#ffd23f'; ctx.fillRect(-2, -6, 4, 10); ctx.fillStyle = '#ff4f3a'; ctx.beginPath(); ctx.moveTo(-2, -6); ctx.lineTo(0, -10); ctx.lineTo(2, -6); ctx.fill(); ctx.fillStyle = '#ff9a3a'; ctx.beginPath(); ctx.moveTo(-2, 4); ctx.lineTo(0, 8 + Math.sin(t * 30) * 1.5); ctx.lineTo(2, 4); ctx.fill(); }
    else if (k === 'cascarones') { for (let i = 0; i < 3; i++) { ctx.fillStyle = ['#c8a0e0', '#ff7fb0', '#7fe0c0'][i]; ctx.beginPath(); ctx.ellipse(-4 + i * 4, i % 2, 2.4, 3.2, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(-5 + i * 4, -1 + i % 2, 2, .8); } }
    else if (k === 'matraca') { ctx.fillStyle = '#8a5a2e'; ctx.fillRect(-1, -1, 2, 8); ctx.save(); ctx.rotate(t * 8); ctx.fillStyle = '#ff9a3a'; ctx.fillRect(-6, -2.4, 12, 4.8); ctx.fillStyle = '#ffd23f'; ctx.fillRect(-6, -2.4, 3, 4.8); ctx.fillRect(3, -2.4, 3, 4.8); ctx.restore(); }
    else if (k === 'mascara') { ctx.fillStyle = '#4fd0ff'; ctx.beginPath(); ctx.ellipse(0, 0, 7, 4.4, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#1c1424'; ctx.beginPath(); ctx.ellipse(-3, -.4, 1.8, 1.2, 0, 0, TAU); ctx.ellipse(3, -.4, 1.8, 1.2, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#ff4f9a'; ctx.beginPath(); ctx.moveTo(-7, -2); ctx.lineTo(-10, -7); ctx.lineTo(-5, -3.6); ctx.fill(); ctx.beginPath(); ctx.moveTo(7, -2); ctx.lineTo(10, -7); ctx.lineTo(5, -3.6); ctx.fill(); }
    ctx.restore();
  }
  // las manchas de pintadera en la pantalla: salpicaduras con gotas que escurren
  function manchas(ctx, j, ex) {
    if (!(j.mancha > 0)) { j.splats = null; j.manchaPrev = 0; return; }
    if (!j.splats || j.mancha > j.manchaPrev + .25) j.splats = Array.from({ length: 4 }, (_, i) => ({ x: 40 + Math.random() * (VW - 80), y: -ex * .6 + Math.random() * (VH * .7 + ex * .5), r: 14 + Math.random() * 14, col: ['#ff4f9a', '#4fd0ff', '#ffd23f', '#7fe0c0'][(Math.random() * 4) | 0], sem: Math.random() * 99, t0: j.t }));
    j.manchaPrev = j.mancha;
    ctx.save(); ctx.globalAlpha = Math.min(.72, j.mancha * .5);
    for (const sp of j.splats) {
      const e = Math.min(1, (j.t - sp.t0) * 8), esc = (j.t - sp.t0) * 14; ctx.fillStyle = sp.col;
      ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.r * e, 0, TAU); ctx.fill();
      for (let k = 0; k < 9; k++) { const an = H(sp.sem, k) * TAU, d = sp.r * (1 + H(sp.sem, k + 10) * .7) * e; ctx.beginPath(); ctx.arc(sp.x + Math.cos(an) * d, sp.y + Math.sin(an) * d * .8, 2 + H(sp.sem, k + 20) * 4, 0, TAU); ctx.fill(); }
      for (let k = 0; k < 4; k++) { const dx = (H(sp.sem, k + 30) - .5) * sp.r * 1.4, L = Math.min(40, esc * (.5 + H(sp.sem, k + 40))); ctx.fillRect(sp.x + dx - 1.4, sp.y, 2.8, L); ctx.beginPath(); ctx.arc(sp.x + dx, sp.y + L, 2.2, 0, TAU); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(sp.x - sp.r * .35, sp.y - sp.r * .35, sp.r * .25, sp.r * .12, -.6, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  // la placa de cada carro: su lugar y su nombre, en una pastilla con el color del carro
  function placa(ctx, x, y, nom, col, lugar) {
    ctx.font = 'bold 6px "Alegreya Sans", sans-serif'; const w = ctx.measureText(nom).width + 18;
    ctx.fillStyle = 'rgba(20,12,30,.78)'; ctx.beginPath(); roundRect(ctx, x - w / 2, y - 6, w, 10, 5); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = .9; ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x - w / 2 + 5.5, y - 1, 3.8, 0, TAU); ctx.fill();
    ctx.textAlign = 'center'; ctx.fillStyle = '#1c1424'; ctx.font = 'bold 5.4px "Alegreya Sans", sans-serif'; ctx.fillText(lugar, x - w / 2 + 5.5, y + 1);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 6px "Alegreya Sans", sans-serif'; ctx.fillText(nom, x + 5, y + 1); ctx.textAlign = 'left';
  }
  function pintar(j, view) {
    const M = marcoModo(j, view), ctx = M.ctx, f = M.f, st = M.st, t = j.t;
    j.panCam = j.d * .35; f.cam = (typeof L !== 'undefined' ? L.camMin : 0) + j.panCam;
    ctx.save(); if (j.shake > 0) ctx.translate((Math.random() - .5) * 3 * j.shake / .3, (Math.random() - .5) * 3 * j.shake / .3);
    fondo(ctx, j, f);
    fuegos(ctx, t + 1.3, 0, 60, 2);
    calle(ctx, j, f);
    // de arriba hacia abajo: lo más lejano primero (carril 0 es el de arriba)
    const vivos = [];
    for (const o of j.obst) { const x = xDe(j, o.d); if (x > -24 && x < VW + 24 && (!o.hecho || (Number.isFinite(o.instante) && t - o.instante < .35))) vivos.push({ y: yDe(o.lane), z: 0, f: () => { const y = yDe(o.lane), es = escDe(o.lane); ctx.save(); ctx.translate(x, y); ctx.scale(es, es); ctx.translate(-x, -y); obstaculo(ctx, o, x, y, t, f); ctx.restore(); } }); }
    for (const b of j.burbujas) { const x = xDe(j, b.d); if (x > -20 && x < VW + 20 && (!b.rota || t - b.rota < .35)) vivos.push({ y: yDe(b.lane) - .2, z: 0, f: () => { const y = yDe(b.lane), es = escDe(b.lane); ctx.save(); ctx.translate(x, y); ctx.scale(es, es); burbuja(ctx, 0, 0, t, b); ctx.restore(); } }); }
    for (const tr of j.trampas) { const x = xDe(j, tr.d); if (x > -10 && x < VW + 10) vivos.push({ y: yDe(tr.lane), z: 0, f: () => icono(ctx, 'cascarones', x, yDe(tr.lane) - 3, .8, t) }); }
    COMPARSAS.forEach((c, i) => { const q = j.rivales[i], x = xDe(j, q.d); if (x > -50 && x < VW + 50) vivos.push({ y: yDe(q.lane) - .5, z: 1, f: () => {
      const y = yDe(q.lane), es = escDe(q.lane); ctx.save(); ctx.translate(x, y); ctx.scale(es, es); ctx.translate(-x, -y);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rgba(q.col, .28); ctx.beginPath(); ctx.ellipse(x, y + 1, 36, 6, 0, 0, TAU); ctx.fill(); ctx.restore();
      ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(x, y + 1, 28, 3.4, 0, 0, TAU); ctx.fill();
      if (q.enreda > 0) { ctx.translate(x, y - 14); ctx.rotate(Math.sin(t * 30) * .08); ctx.translate(-x, -(y - 14)); }
      carroza(ctx, x, y, q.col, q.luz, t + i, ['infantil', 'juvenil', 'espectaculo'][i]); ctx.restore();
      if (q.pinta > 0) { ctx.save(); ctx.globalAlpha = Math.min(.8, q.pinta * .5); for (let k = 0; k < 4; k++) { ctx.fillStyle = ['#ff4f9a', '#4fd0ff', '#ffd23f'][k % 3]; ctx.beginPath(); ctx.ellipse(x - 16 + k * 10, y - 20 + (k % 2) * 8, 6, 4, k, 0, TAU); ctx.fill(); } ctx.restore(); }
      if (q.enreda > 0) icono(ctx, 'serpentina', x, y - 8, 1.6, t);
      if (q.item) { const by = y - 50 * escDe(q.lane) - 12; ctx.fillStyle = 'rgba(20,12,30,.8)'; ctx.beginPath(); ctx.arc(x, by, 7, 0, TAU); ctx.fill(); ctx.strokeStyle = PODERES[q.item].col; ctx.lineWidth = .9; ctx.stroke(); icono(ctx, q.item, x, by, .75, t); }
      if (q.escudo > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(79,208,255,${.35 + .25 * Math.sin(t * 8)})`; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.ellipse(x, y - 20, 32, 24, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
      placa(ctx, x, y - 50 * escDe(q.lane), CORTO[i], q.col, 1 + [j.d, ...j.rivales.map(r => r.d)].filter(d => d > q.d + .01).length);
      if (q.dorm > 0) { ctx.font = 'bold 6px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#d8ccff'; ctx.fillText('z z z', x + 14, y - 34 - Math.sin(t * 4) * 2); ctx.textAlign = 'left'; } } }); });
    const yI = yDe(j.carril);
    vivos.push({ y: yI, z: 2, f: () => {
      const es = escDe(j.carril); ctx.save(); ctx.translate(X0, yI); ctx.scale(es, es); ctx.translate(-X0, -yI);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,90,120,.3)'; ctx.beginPath(); ctx.ellipse(X0, yI + 1, 36, 6, 0, 0, TAU); ctx.fill(); ctx.restore();
      ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(X0, yI + 1, 28, 3.4, 0, 0, TAU); ctx.fill();
      if (j.boost > 0) { ctx.globalCompositeOperation = 'lighter'; if (!imagen(ctx, 'estela', X0 - 72, yI - 21, 50, 16)) glowDot(ctx, X0 - 30, yI - 10, 22, '#ffb347', .55); ctx.globalCompositeOperation = 'source-over'; }
      carroza(ctx, X0, yI, '#c8203a', '#ffe08a', t, 'itzel');
      j.pose.x = X0 + 2; j.pose.y = yI - 16; j.pose.on = true; j.pose.vx = Math.max(0, j.v); j.pose.run += j.v * .02; j.pose.face = 1; j.pose.vis = true; j.pose.inv = j.inv > 5 ? 0 : j.inv;
      if (!(j.inv > 0 && j.inv <= 5 && Math.floor(j.inv * 14) % 2)) st.player(ctx, j.pose, f);
      if (j.escudo > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(79,208,255,${.4 + .3 * Math.sin(t * 8)})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(X0, yI - 20, 34, 26, 0, 0, TAU); ctx.stroke(); ctx.restore(); icono(ctx, 'mascara', X0 + 20, yI - 40, .8, t); }
      ctx.restore();
      placa(ctx, X0, yI - 52 * escDe(j.carril), 'Itzel', '#ffffff', j.lugar);
    } });
    // la sombra donde va a caer un globo de los rivales
    for (const pr of j.proy) if (pr.de === 'rival') { const a = .35 + .3 * Math.sin(t * 20); vivos.push({ y: yDe(pr.lane) - .1, z: 0, f: () => { ctx.fillStyle = `rgba(255,79,154,${a})`; ctx.beginPath(); ctx.ellipse(X0, yDe(pr.lane), 18 * Math.min(1, pr.t / pr.dur + .3), 4, 0, 0, TAU); ctx.fill(); } }); }
    vivos.sort((a, b) => a.y - b.y || a.z - b.z); for (const v of vivos) v.f();
    // con turbo, la calle se estira en rayas de luz
    if (j.boost > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const y = 136 + H(i, 81) * 88, x = wrap(H(i, 82) * VW - t * 900, VW + 80) - 40; ctx.strokeStyle = `rgba(255,240,210,${.18 * Math.min(1, j.boost)})`; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 40 + H(i, 83) * 40, y); ctx.stroke(); } ctx.restore(); }
    // los poderes en el aire
    for (const pr of j.proy) if (Number.isFinite(pr.px)) { if (pr.tipo === 'cohete') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, pr.px, pr.py, 10, '#ff9a3a', .6); ctx.restore(); } icono(ctx, pr.tipo, pr.px, pr.py, 1.1, t); }
    // Fresita (con el poder que trae, flotando junto a ella)
    { const fr = { x: j.fre.x, y: j.fre.y + Math.sin(t * 3) * 1.2, face: 1 }; if (st.fresita) st.fresita(ctx, fr, f); else if (typeof drawFresita === 'function') drawFresita(ctx, fr, t, st.pixel); if (j.poder) icono(ctx, j.poder, j.fre.x + 12, j.fre.y - 10, .9, t); }
    pintaChispas(ctx, j);
    for (const l of j.letreros) { ctx.globalAlpha = Math.max(0, 1 - l.t / 1.1); letrero(ctx, l.txt, l.x, l.y - l.t * 14, l.col); } ctx.globalAlpha = 1;
    ctx.restore();
    // la pintura en la cara (ya sin sacudida)
    manchas(ctx, j, f.ex || 0);
    if (st.over) st.over(ctx, f);
    // el cuadro del poder de Fresita (arriba a la izquierda, como en las carreras de karts; en la ventana alta, arriba de todo)
    ctx.save(); ctx.translate(0, -(f.ex || 0) + ((f.ex || 0) > 0 ? 8 : 0));
    ctx.fillStyle = "rgba(30,18,40,.82)"; ctx.beginPath(); roundRect(ctx, 8, 16, 24, 24, 5); ctx.fill(); ctx.strokeStyle = j.poder ? PODERES[j.poder].col : 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.2; ctx.stroke();
    if (j.poder) { icono(ctx, j.poder, 20, 28, 1.2, t); ctx.font = "bold 6.5px \"Alegreya Sans\", sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = "#ffffff"; ctx.fillText(PODERES[j.poder].n, 36, 25); ctx.font = '5.6px "Alegreya Sans", sans-serif'; ctx.fillStyle = '#ffe9f4'; ctx.fillText('Fresita: ' + PODERES[j.poder].txt, 36, 33); }
    else { ctx.font = 'bold 9px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillText('?', 20, 31.5); ctx.textAlign = 'left'; ctx.font = '5.6px "Alegreya Sans", sans-serif'; ctx.fillStyle = '#ffe9f4'; ctx.fillText('Itzel: pásale encima a una burbuja para sacar un poder', 36, 30); }
    ctx.restore();
    // la barra de abajo: el lugar, la ruta y el empujón
    ctx.fillStyle = 'rgba(30,18,40,.82)'; ctx.fillRect(0, VH - 14, VW, 14);
    ctx.font = 'bold 7px "Alegreya Sans", sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = '#ffd23f'; ctx.fillText(`${j.lugar}.º de 4`, 8, VH - 4.5);
    const bx = 52, bw = 190; ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(bx, VH - 9, bw, 3);
    for (const L of LUGARES) { ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(bx + bw * L.d / LARGO - .5, VH - 11, 1.2, 7); }
    for (const q of j.rivales) { ctx.fillStyle = q.col; ctx.beginPath(); ctx.arc(bx + bw * clamp(q.d / LARGO, 0, 1), VH - 7.5, 2.4, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(bx + bw * clamp(j.d / LARGO, 0, 1), VH - 7.5, 3.2, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffd6e4'; ctx.fillText('Empujón', 254, VH - 4.5); ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(290, VH - 9.5, 44, 5); ctx.fillStyle = j.empuje >= 1 ? '#7fe0c0' : '#ff7fb0'; ctx.fillRect(290, VH - 9.5, 44 * j.empuje, 5);
    ctx.font = '5.4px "Alegreya Sans", sans-serif'; ctx.fillStyle = '#fff4e0'; ctx.fillText('↑ ↓ carril · → acelera · Espacio empujón', 342, VH - 4.5);
    const meta = LUGARES.find(L => j.d > L.d - 40 && j.d < L.d + 30); if (meta && !j.win) letrero(ctx, meta.n, 213, 46, '#fff4e0');
    // el semáforo de la salida
    if (j.cuenta > 0 || (j.t < 4.4 && j.cuenta <= 0 && j.t > 3)) {
      const n = Math.ceil(j.cuenta), x = VW / 2, y = 70;
      ctx.fillStyle = 'rgba(20,12,30,.85)'; ctx.beginPath(); roundRect(ctx, x - 34, y - 12, 68, 24, 8); ctx.fill(); ctx.strokeStyle = '#ff4f9a'; ctx.lineWidth = 1; ctx.stroke();
      for (let k = 0; k < 3; k++) { const on = j.cuenta > 0 ? 3 - n >= k : true, col = j.cuenta > 0 ? '#ff4f9a' : '#7fe0c0'; ctx.save(); if (on) { ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x - 20 + k * 20, y, 12, col, .6); } ctx.restore(); ctx.fillStyle = on ? col : '#3a2c48'; ctx.beginPath(); ctx.arc(x - 20 + k * 20, y, 6, 0, TAU); ctx.fill(); }
      ctx.font = 'bold 12px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.6)'; const txt = j.cuenta > 0 ? String(n) : '¡Arranca el Bando!'; ctx.strokeText(txt, x, y + 30); ctx.fillStyle = j.cuenta > 0 ? '#ffffff' : '#7fe0c0'; ctx.fillText(txt, x, y + 30); ctx.textAlign = 'left';
    }
    // al final, el podio del recorrido
    if (j.win && j.podio) {
      const x = VW / 2, y = 46, a = Math.min(1, (j.t - j.win) * 3); ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(20,12,30,.88)'; ctx.beginPath(); roundRect(ctx, x - 80, y - 14, 160, 76, 8); ctx.fill(); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 1; ctx.stroke();
      letrero(ctx, j.final, x, y - 2, '#ffd23f');
      j.podio.forEach((q, i) => { const yy = y + 12 + i * 12; ctx.fillStyle = q.col; ctx.beginPath(); ctx.arc(x - 62, yy - 2, 4.2, 0, TAU); ctx.fill(); ctx.font = 'bold 6px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#1c1424'; ctx.fillText(i + 1, x - 62, yy); ctx.textAlign = 'left'; ctx.font = (q.yo ? 'bold ' : '') + '7px "Alegreya Sans", sans-serif'; ctx.fillStyle = q.yo ? '#ffffff' : 'rgba(255,240,220,.85)'; ctx.fillText(q.n, x - 52, yy + .5); if (i === 0) icono(ctx, 'mascara', x + 64, yy - 2, .7, t); });
      ctx.globalAlpha = 1;
    }
  }
  return { crear, paso, pintar, extiende, vertical: true, PODERES };
})();
MEC.POW.confetiFresita = { name: 'Lanzar poderes', help: 'Cuando Itzel revienta una burbuja de la calle, Fresita se queda con el poder: clic en un carro rival y se lo avienta (globo, serpentina, cohete). También revienta en el aire lo que les avientan. Clic derecho: canción de cuna.', cd: .05, click() { return false; } };
nivel('desfile', {
  nombre: 'El Bando: el desfile del carnaval', lugar: 'Malecón de Campeche',
  lema: 'El Sábado de Bando: Itzel corre su carroza por el malecón contra los carros de los reyes del carnaval. Itzel revienta las burbujas de poder de la calle y Fresita les avienta lo que sale: globos de pintadera, serpentinas y cohetes. Los rivales también.',
  dato: 'El Bando, o Sábado de Bando, es el desfile más grande y tradicional del Carnaval de Campeche, que se considera uno de los más antiguos de México, con registros desde 1582. Hoy el recorrido va por el malecón. Desfilan bandas de marcha, bastoneras, carros alegóricos de los reyes del carnaval (infantil, juvenil y del espectáculo), comparsas y gente disfrazada, y las familias apartan sus sillas a lo largo del recorrido desde la noche anterior.',
  modo: 'carrera', foe: 'pintador', fauna: ['pintador'], power: 'confetiFresita', plat: NIVELES.neon.plat, W: 30, skin: NIVELES.neon.skin, fiesta: 'carnaval', peso: 1.3,
});
(NIVELES_ALT.neon = NIVELES_ALT.neon || []).push('desfile');
