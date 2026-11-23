'use strict';
// Acciones terminadas con Sprite Forge. Las acciones que aún no tienen hoja
// conservan el dibujante propio del estilo y la física sigue en el juego.
(() => {
  const consultaDemo = new URLSearchParams(location.search), mundoDemo = consultaDemo.has('demo') ? consultaDemo.get('mundo') : null;
  const conjuntos = {
    acuarela: { archivo: 'acuarela-acciones-v1', caja: [54, 25, 143, 207], alto: 21, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    pixel: { archivo: 'pixel-acciones-v1', caja: [63, 46, 130, 173], alto: 21, pixel: true, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    bruma: { archivo: 'bruma-acciones-v1', caja: [61, 31, 143, 194], alto: 21, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    ocaso: { archivo: 'ocaso-acciones-v1', caja: [60, 30, 138, 193], alto: 21, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    paper: { archivo: 'paper-acciones-v1', caja: [58, 28, 144, 200], alto: 21, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    grabado: { archivo: 'grabado-acciones-v1', caja: [51, 25, 161, 203], alto: 21, activada: true, cuadros: [0, 1, 2], acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    biolum: { archivo: 'biolum-acciones-v1', caja: [48, 24, 166, 205], alto: 21, activada: true, cuadros: [0, 1, 2], acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    vitral: { archivo: 'vitral-acciones-v1', caja: [52, 30, 141, 202], alto: 21, activada: true, cuadros: [0, 1, 2], acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    barro: { archivo: 'barro-acciones-v1', caja: [47, 28, 151, 199], alto: 21, activada: true, cuadros: [0, 1, 2], acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    codex: { archivo: 'codex-acciones-v1', caja: [54, 33, 140, 185], alto: 21, activada: true, cuadros: [0, 1, 2], acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    sumie: { archivo: 'sumie-acciones-v1', caja: [49, 24, 154, 202], alto: 21, activada: true, cuadros: [0, 1, 2], acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    neon: { archivo: 'neon-acciones-v1', caja: [61, 32, 135, 190], alto: 21, activada: true, cuadros: [0, 1, 2], acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    cuaderno: { archivo: 'cuaderno-acciones-v1', caja: [49, 29, 159, 195], alto: 21, activada: true, cuadros: [0, 1, 2], acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    oleo: { archivo: 'oleo-acciones-v1', caja: [54, 27, 148, 198], alto: 21, activada: true, cuadros: [0, 1, 2], acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    hielo: { archivo: 'hielo-acciones-v1', caja: [45, 22, 152, 210], alto: 21, activada: true, cuadros: [0, 1, 2], acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    fuego: { archivo: 'fuego-acciones-v1', caja: [59, 32, 140, 205], alto: 21, activada: true, cuadros: [0, 1, 2], acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    agua: { archivo: 'agua-acciones-v1/processed-v1', caja: [62, 51, 124, 187], alto: 21, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    flat: { archivo: 'flat-acciones-v1/processed-v1', caja: [53, 30, 151, 207], alto: 21, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    lowpoly: { archivo: 'lowpoly-acciones-v1/processed-v1', caja: [66, 32, 153, 206], alto: 21, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    eco: { archivo: 'eco-acciones-v1/processed-v1', caja: [51, 42, 137, 196], alto: 21, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    nouveau: { archivo: 'nouveau-acciones-v1/processed-v1', caja: [41, 39, 136, 199], alto: 21, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    deco: { archivo: 'deco-acciones-v1/processed-v1', caja: [35, 48, 154, 190], alto: 21, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    cyber: { archivo: 'cyber-acciones-v1/processed-v1', caja: [36, 33, 169, 204], alto: 21, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    cinema: { archivo: 'cinema-acciones-v1/processed-v1', caja: [50, 39, 152, 199], alto: 21, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    hollin: { archivo: 'hollin-acciones-v1/processed-v1', caja: [77, 39, 126, 198], alto: 21, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    anime: { archivo: 'anime-salto-identidad-v1/procesado', caja: [18, 0, 220, 238], alto: 31.2, dy: 2.3, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    cielo: { archivo: 'cielo-acciones-identidad-v3', caja: [40, 25, 171, 213], alto: 21, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    alebrije: { archivo: null, caja: [0, 0, 0, 0], alto: 21, activada: true, acciones: ['correr'] },
    bits32: { archivo: 'bits32-acciones-v1/processed-v1', caja: [43, 19, 170, 219], alto: 21, pixel: true, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    bits64: { archivo: 'bits64-acciones-v1/processed-v1', caja: [39, 19, 178, 219], alto: 21, pixel: true, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    bits8: { archivo: 'bits8-acciones-v1/processed-v1', caja: [33, 20, 190, 217], alto: 21, pixel: true, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    bordado: { archivo: 'bordado-acciones-v1/processed-v1', caja: [42, 36, 158, 202], alto: 21, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    chaquira: { archivo: null, caja: [0, 0, 0, 0], alto: 21, activada: true, acciones: ['correr'] },
    ascii: { archivo: null, caja: [0, 0, 0, 0], alto: 21, activada: true, acciones: ['correr'] },
    comic: { archivo: null, caja: [0, 0, 0, 0], alto: 21, activada: true, acciones: ['correr'] },
    exvoto: { archivo: null, caja: [0, 0, 0, 0], alto: 21, activada: true, acciones: ['correr'] },
    loteria: { archivo: null, caja: [0, 0, 0, 0], alto: 21, activada: true, acciones: ['correr'] },
    puntocruz: { archivo: null, caja: [0, 0, 0, 0], alto: 21, activada: true, acciones: ['correr'] },
    rupestre: { archivo: null, caja: [0, 0, 0, 0], alto: 21, activada: true, acciones: ['correr'] },
    ukiyoe: { archivo: null, caja: [0, 0, 0, 0], alto: 21, activada: true, acciones: ['correr'] },
  };
  // Hojas al doble de resolución (celdas de 512 px) hechas con tools/itzel-hd.py; sin ellas se usa la de 256 px.
  const HD = new Set(['acuarela-acciones-v1', 'agua-acciones-v1/processed-v1', 'anime-correr-identidad-v2/procesado', 'anime-salto-identidad-v1/procesado', 'barro-acciones-v1', 'biolum-acciones-v1', 'biolum-correr-blusa-v2', 'bits32-correr-identidad-v2/procesado', 'bits64-correr-identidad-v2/procesado', 'bits8-correr-identidad-v2/procesado', 'bordado-acciones-v1/processed-v1', 'bruma-acciones-v1', 'cinema-acciones-v1/processed-v1', 'cinema-correr-identidad-v2/procesado', 'codex-acciones-v1', 'cuaderno-acciones-v1', 'cyber-acciones-v1/processed-v1', 'cyber-correr-identidad-v2/procesado', 'deco-acciones-v1/processed-v1', 'eco-acciones-v1/processed-v1', 'flat-acciones-v1/processed-v1', 'flat-correr-identidad-v2/procesado', 'fuego-acciones-v1', 'grabado-acciones-v1', 'hielo-acciones-v1', 'hollin-acciones-v1/processed-v1', 'lowpoly-acciones-v1/processed-v1', 'neon-acciones-v1', 'nouveau-acciones-v1/processed-v1', 'ocaso-acciones-v1', 'oleo-acciones-v1', 'paper-acciones-v1', 'pixel-acciones-v1', 'puntocruz-correr-identidad-v2/procesado', 'sumie-acciones-v1', 'vitral-acciones-v1']);
  const hoja = (archivo) => '../Roguelike/assets/forge/itzel/' + archivo + (HD.has(archivo) ? '/sheet-hd.png?v=1' : '/sheet-transparent.png');
  const escalaHoja = img => (img && img.naturalWidth >= 1000 && img.naturalWidth === img.naturalHeight ? img.naturalWidth / 512 : 1);
  const imagenes = Object.create(null);
  const victoriaAnime = new Image(); victoriaAnime.src = '../Roguelike/assets/forge/itzel/anime-victoria-v1/sheet-transparent.png?v=1';
  const saltoCinema = new Image(); saltoCinema.decoding = 'async';
  if (!mundoDemo || mundoDemo === 'cinema') saltoCinema.src = '../Roguelike/assets/forge/itzel/cinema-salto-identidad-v1/sheet-transparent.png?v=1';
  const saltosBits = Object.fromEntries(['bits8', 'bits32', 'bits64'].map(id => {
    const im = new Image(); im.decoding = 'async';
    if (!mundoDemo || mundoDemo === id) im.src = '../Roguelike/assets/forge/itzel/' + id + '-salto-identidad-v1/sheet-transparent.png?v=1';
    return [id, im];
  }));
  const saltoCyber = new Image(); saltoCyber.decoding = 'async';
  if (!mundoDemo || mundoDemo === 'cyber') saltoCyber.src = '../Roguelike/assets/forge/itzel/cyber-salto-identidad-v1/sheet-transparent.png?v=1';
  const saltoBordado = new Image(); saltoBordado.decoding = 'async';
  if (!mundoDemo || mundoDemo === 'bordado') saltoBordado.src = '../Roguelike/assets/forge/itzel/bordado-salto-identidad-v2/sheet-transparent.png?v=1';
  const correr = Object.create(null);
  for (const [id, archivo, caja, pixel, alto] of [
    ['acuarela', 'acuarela-correr-v2', [62, 32, 143, 197], false, 21.0],
    ['pixel', 'pixel-correr-v1', [55, 0, 146, 222], true, 19.7],
    ['bruma', 'bruma-correr-v1', [18, 0, 220, 238], false, 24.03],
    ['ocaso', 'ocaso-correr-v1', [18, 0, 220, 238], false, 24.19],
    ['paper', 'paper-correr-v1', [18, 0, 220, 238], false, 24.03],
    ['biolum', 'biolum-correr-blusa-v2', [18, 0, 220, 238], false, 27.26],
    ['sumie', 'sumie-correr-v1', [18, 0, 220, 238], false, 23.46],
    ['neon', 'neon-correr-v1', [18, 0, 220, 238], false, 23.46],
    ['grabado', 'grabado-correr-v1', [18, 0, 220, 238], false, 23.8],
    ['vitral', 'vitral-correr-v1', [18, 0, 220, 238], false, 23.8],
    ['barro', 'barro-correr-v1', [18, 0, 220, 238], false, 23.8],
    ['codex', 'codex-correr-v1', [18, 0, 220, 238], false, 23.8],
    ['cuaderno', 'cuaderno-correr-v1', [18, 0, 220, 238], false, 23.8],
    ['oleo', 'oleo-correr-v1', [18, 0, 220, 238], false, 23.8],
    ['fuego', 'fuego-correr-v1', [18, 0, 220, 238], false, 23.8],
    ['agua', 'agua-correr-v1', [18, 0, 220, 238], false, 23.8],
    ['hielo', 'hielo-correr-v1', [18, 0, 220, 238], false, 23.8],
    ['flat', 'flat-correr-identidad-v2/procesado', [18, 0, 220, 238], false, 26.73],
    ['lowpoly', 'lowpoly-correr-v1', [18, 0, 220, 238], false, 23.8],
    ['eco', 'eco-correr-v1', [18, 0, 220, 238], false, 23.8],
    ['nouveau', 'nouveau-correr-v1', [18, 0, 220, 238], false, 23.85],
    ['deco', 'deco-correr-v1', [18, 0, 220, 238], false, 23.8],
    ['cyber', 'cyber-correr-identidad-v2/procesado', [18, 0, 220, 238], false, 25.9],
    ['cinema', 'cinema-correr-identidad-v2/procesado', [18, 0, 220, 238], false, 25.63],
    ['hollin', 'hollin-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['anime', 'anime-correr-identidad-v2/procesado', [18, 0, 220, 238], false, 31.2],
    ['cielo', 'cielo-correr-identidad-v3', [18, 0, 220, 238], false, 22.7181818],
    ['alebrije', 'alebrije-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['bits32', 'bits32-correr-identidad-v2/procesado', [18, 0, 220, 238], true, 27.09],
    ['bits64', 'bits64-correr-identidad-v2/procesado', [18, 0, 220, 238], true, 26.28],
    ['bits8', 'bits8-correr-identidad-v2/procesado', [18, 0, 220, 238], true, 27.26],
    ['bordado', 'puntocruz-correr-identidad-v2/procesado', [18, 0, 220, 238], false, 27.8],
    ['chaquira', 'chaquira-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['ascii', 'ascii-correr-v1', [18, 0, 220, 238], true, 22.7181818],
    ['comic', 'comic-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['exvoto', 'exvoto-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['loteria', 'loteria-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['puntocruz', 'puntocruz-correr-identidad-v2/procesado', [18, 0, 220, 238], false, 22.7181818],
    ['rupestre', 'rupestre-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['ukiyoe', 'ukiyoe-correr-v1', [18, 0, 220, 238], false, 22.7181818],
  ]) {
    const img = new Image(); img.decoding = 'async';
    if (!mundoDemo || id === mundoDemo) img.src = hoja(archivo) + (HD.has(archivo) ? '' : '?v=9');
    correr[id] = { id, img, caja, pixel, alto, dy: id === 'anime' ? 2.3 : 0, cuadros: id === 'alebrije' || id === 'hielo' ? [0, 1, 3] : null };
  }
  // Cada hoja se solicita únicamente cuando se dibuja su estilo.
  const hojasReposo = {
    nouveau: imgPerezosa('../Roguelike/assets/forge/itzel/nouveau-idle-sandalia-v1/sheet-transparent.png'),
    ocaso: imgPerezosa('../Roguelike/assets/forge/itzel/ocaso-idle-estirar-v1/sheet-transparent.png'),
    acuarela: imgPerezosa('../Roguelike/assets/forge/itzel/acuarela-idle-piedra-v2/sheet-transparent.png'),
    pixel: imgPerezosa('../Roguelike/assets/forge/itzel/pixel-idle-calentar-v1/sheet-transparent.png'),
    paper: imgPerezosa('../Roguelike/assets/forge/itzel/paper-idle-flores-v1/sheet-transparent.png'),
    bruma: imgPerezosa('../Roguelike/assets/forge/itzel/bruma-idle-frio-v1/sheet-transparent.png'),
    biolum: imgPerezosa('../Roguelike/assets/forge/itzel/biolum-idle-bordado-v1/sheet-transparent.png'),
    barro: imgPerezosa('../Roguelike/assets/forge/itzel/barro-idle-faja-v2/sheet-transparent.png'),
    lowpoly: imgPerezosa('../Roguelike/assets/forge/itzel/lowpoly-idle-equilibrio-v1/sheet-transparent.png'),
    neon: imgPerezosa('../Roguelike/assets/forge/itzel/neon-idle-chasquido-v1/sheet-transparent.png'),
    fuego: imgPerezosa('../Roguelike/assets/forge/itzel/fuego-idle-calor-v1/sheet-transparent.png'),
    hielo: imgPerezosa('../Roguelike/assets/forge/itzel/hielo-idle-grulla-v2/sheet-transparent.png'),
    agua: imgPerezosa('../Roguelike/assets/forge/itzel/agua-idle-horizonte-v1/sheet-transparent.png'),
    cuaderno: imgPerezosa('../Roguelike/assets/forge/itzel/cuaderno-idle-dibujar-v1/sheet-transparent.png'),
    bordado: imgPerezosa('../Roguelike/assets/forge/itzel/bordado-idle-pulsera-v1/sheet-transparent.png'),
    grabado: imgPerezosa('../Roguelike/assets/forge/itzel/grabado-idle-estampa-v1/sheet-transparent.png'),
    oleo: imgPerezosa('../Roguelike/assets/forge/itzel/oleo-idle-reverencia-v1/sheet-transparent.png'),
    vitral: imgPerezosa('../Roguelike/assets/forge/itzel/vitral-idle-reflejo-v1/sheet-transparent.png'),
    deco: imgPerezosa('../Roguelike/assets/forge/itzel/deco-idle-reloj-v1/sheet-transparent.png'),
    eco: imgPerezosa('../Roguelike/assets/forge/itzel/eco-idle-semilla-v1/sheet-transparent.png'),
    cyber: imgPerezosa('../Roguelike/assets/forge/itzel/cyber-idle-interfaz-v1/sheet-transparent.png'),
    cinema: imgPerezosa('../Roguelike/assets/forge/itzel/cinema-idle-manos-v1/sheet-transparent.png'),
    hollin: imgPerezosa('../Roguelike/assets/forge/itzel/hollin-idle-ceniza-v2/sheet-transparent.png'),
    sumie: imgPerezosa('../Roguelike/assets/forge/itzel/sumie-idle-trazo-v1/sheet-transparent.png'),
    bits8: imgPerezosa('../Roguelike/assets/forge/itzel/bits8-idle-moneda-v1/sheet-transparent.png'),
    bits32: imgPerezosa('../Roguelike/assets/forge/itzel/bits32-idle-silbido-v1/sheet-transparent.png'),
    bits64: imgPerezosa('../Roguelike/assets/forge/itzel/bits64-idle-estirar-v1/sheet-transparent.png'),
    flat: imgPerezosa('../Roguelike/assets/forge/itzel/flat-idle-falda-v1/sheet-transparent.png'),
    codex: imgPerezosa('../Roguelike/assets/forge/itzel/codex-idle-flores-v1/sheet-transparent.png'),
    cielo: imgPerezosa('../Roguelike/assets/forge/itzel/cielo-idle-mirar-v2/sheet-transparent.png')
  };
  const repososNouveau = new WeakMap();
  function cuadroReposoNouveau(p, f, estaHerida, imagen, id) {
    const t = f && Number.isFinite(f.t) ? f.t : 0, g = f && f.g;
    let s = repososNouveau.get(p);
    if (!s) { s = { t, quieto: 0 }; repososNouveau.set(p, s); }
    const dt = Math.max(0, Math.min(.05, t - s.t)); s.t = t;
    const quieta = g && (g.p === p || (id === 'pixel' && f.enciclopedia)) && p.on !== false && Math.abs(p.vx || 0) < 3 && Math.abs(p.vy || 0) < 3 && !p.crouch && !p.pared && !(p.dash > 0) && !(p.inv > 0) && !estaHerida && !(p.sq > .1) && !g.win && !(g.env && g.env.swim);
    s.quieto = quieta ? s.quieto + dt : 0;
    const fase = s.quieto - 2.5;
    if (fase < 0 || !imagen.complete || imagen.naturalWidth !== 1024 || imagen.naturalHeight !== 512) return -1;
    const ciclo = fase % 8;
    if (id === 'pixel') {
      // Ocho poses de calentamiento y regreso a la postura inicial.
      const secuencia = [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0];
      const i = Math.floor(ciclo / .18);
      return i < secuencia.length ? secuencia[i] : -1;
    }
    return ciclo < 1.6 ? Math.min(7, Math.floor(ciclo / .2)) : -1;
  }
  const estados = new WeakMap();
  function herida(p, f) {
    const ahora = f && Number.isFinite(f.t) ? f.t : 0, inv = p.inv || 0;
    const estado = estados.get(p) || { inv: 0, heridaHasta: -1 };
    if (inv > estado.inv + .05) estado.heridaHasta = ahora + .35;
    estado.inv = inv; estados.set(p, estado);
    return inv > 0 && ahora < estado.heridaHasta;
  }
  const PIES_CARRERA = {bruma: .76, ocaso: .76, paper: .78, biolum: 2.32, sumie: .59, neon: .59, grabado: .4, vitral: .4, barro: .4, codex: .6, cuaderno: .6, oleo: .6, fuego: .6, agua: .4, hielo: .4, flat: 2.27, lowpoly: .6, eco: .6, nouveau: .4, deco: .6, cyber: 1.88, cinema: 1.83, hollin: 1.15, alebrije: 1.15, bits32: 2.48, bits64: 2.02, bits8: 2.86, bordado: 1.5, chaquira: 1.55, ascii: 1.15, comic: 1.15, exvoto: 1.15, loteria: 1.15, puntocruz: 2.24, rupestre: 1.15, ukiyoe: 1.15};
  function dibujarCarrera(c, p, carrera, altoBase) {
    const cuadros = carrera.cuadros || [0, 1, 2, 3];
    const cuadro = cuadros[Math.floor((p.run || 0) / (Math.PI / 2)) % cuadros.length];
    const [x, y, w, h] = carrera.caja, alto = carrera.alto || altoBase, ancho = alto * w / h;
    // los pies de cada hoja de carrera quedan a distinta altura dentro del cuadro (medido en las hojas): se bajan al suelo
    const pies = PIES_CARRERA[carrera.id] || 0;
    c.save(); c.translate(carrera.pixel ? Math.round(p.x) : p.x, carrera.pixel ? Math.round(p.y) : p.y);
    c.scale((p.face || 1) < 0 ? -1 : 1, 1); c.imageSmoothingEnabled = !carrera.pixel || carrera.id === 'pixel'; c.imageSmoothingQuality = 'high';
    const K = escalaHoja(carrera.img); c.imageSmoothingQuality = 'high';
    c.drawImage(carrera.img, ((cuadro % 2) * 256 + x) * K, (Math.floor(cuadro / 2) * 256 + y) * K, w * K, h * K, -ancho / 2, -alto + (carrera.dy || pies), ancho, alto);
    c.restore();
  }
  for (const [id, datos] of Object.entries(conjuntos)) {
    if (!datos.archivo) continue;
    const img = new Image(); img.decoding = 'async';
    if (!mundoDemo || id === mundoDemo) img.src = hoja(datos.archivo);
    imagenes[id] = img;
  }
  function instalar(id) {
    const estilo = STYLE_MAP[id], datos = conjuntos[id], img = imagenes[id];
    if (!estilo || !datos || !datos.activada || estilo.player?._itzelForge === id) return;
    const anterior = estilo.player;
    function dibujar(c, p, f) {
      // en el primer plano de la enciclopedia, los estilos de 8/32/64 bits usan siempre su Itzel pintada píxel por píxel (quieta, corriendo y saltando);
      // mezclar con las hojas de animación la hacía desaparecer o estirarse
      if (f && f.enciclopedia && (id === 'bits8' || id === 'bits32' || id === 'bits64')) return anterior(c, p, f);
      if (id === 'anime' && f && f.g && f.g.win && victoriaAnime.complete && victoriaAnime.naturalWidth) {
        const alto = 31.2, w = alto * 220 / 238;
        c.save(); c.translate(p.x, p.y); c.scale((p.face || 1) < 0 ? -1 : 1, 1); c.imageSmoothingEnabled = true;
        c.drawImage(victoriaAnime, 18, 256, 220, 238, -w / 2, -alto + 2.3, w, alto); c.restore(); return;
      }
      const estaHerida = herida(p, f);
      // El visor de la enciclopedia presenta poses completas como muestra.
      // Mantener el arte base seleccionado evita sustituir el modelo de idle
      // por otra interpretación generada de la pose.
      if (hojasReposo[id] && (!(f && f.enciclopedia) || id === 'pixel' || (f.g && f.g.demo))) {
        const imagen = hojasReposo[id]; imagen.pide();
        const cuadro = cuadroReposoNouveau(p, f, estaHerida, imagen, id);
        if (cuadro >= 0) {
          const lado = (id === 'pixel' ? 15.5 : 21) * 256 / (id === 'bits64' ? 207 : id === 'flat' ? 187 : id === 'codex' ? 183 : id === 'cielo' ? 204 : id === 'hollin' ? 192 : 217);
          c.save(); c.translate(datos.pixel ? Math.round(p.x) : p.x, datos.pixel ? Math.round(p.y) : p.y); c.scale(((p.face || 1) < 0) !== (id === 'bordado') ? -1 : 1, 1); c.imageSmoothingEnabled = !datos.pixel || id === 'pixel'; c.imageSmoothingQuality = 'high';
          c.drawImage(imagen, (cuadro % 4) * 256, Math.floor(cuadro / 4) * 256, 256, 256, -lado / 2, -(id === 'pixel' ? 235 : id === 'bits64' ? 232 : id === 'flat' ? 221 : id === 'codex' ? 220 : id === 'cielo' ? 230 : id === 'hollin' ? 224 : 236) * lado / 256, lado, lado);
          c.restore(); return;
        }
      }
      const carrera = correr[id];
      if (id === 'cielo' && carrera && !estaHerida && p.on && Math.abs(p.vx || 0) > 25 && carrera.img.complete && carrera.img.naturalWidth) {
        const q = Math.floor((p.run || 0) / (Math.PI / 4)) % 8, lado = 21 * 256 / 194;
        c.save(); c.translate(p.x, p.y); c.scale((p.face || 1) < 0 ? -1 : 1, 1); c.imageSmoothingEnabled = true;
        c.drawImage(carrera.img, (q % 4) * 256, Math.floor(q / 4) * 256, 256, 256, -lado / 2, -227 * lado / 256, lado, lado);
        c.restore(); return;
      }
      if (id === 'cielo' && img && img.complete && img.naturalWidth && (estaHerida || p.on === false)) {
        const q = estaHerida ? 3 : (p.vy || 0) < 0 ? 1 : 2, lado = 21 * 256 / 191;
        c.save(); c.translate(p.x, p.y); c.scale((p.face || 1) < 0 ? -1 : 1, 1); c.imageSmoothingEnabled = true;
        c.drawImage(img, (q % 2) * 256, Math.floor(q / 2) * 256, 256, 256, -lado / 2, -224 * lado / 256, lado, lado);
        c.restore(); return;
      }
      const saltoBits = saltosBits[id];
      if (saltoBits && !estaHerida && p.on === false && saltoBits.complete && saltoBits.naturalWidth) {
        // Cada estilo conserva la escala de su pose neutral y un mismo anclaje.
        const referencia = { bits8: [184, 222], bits32: [179, 218], bits64: [190, 225] }[id];
        const cuadro = (p.vy || 0) < 0 ? 1 : 2, lado = 21 * 256 / referencia[0];
        c.save(); c.translate(Math.round(p.x), Math.round(p.y)); c.scale((p.face || 1) < 0 ? -1 : 1, 1);
        c.imageSmoothingEnabled = false;
        c.drawImage(saltoBits, (cuadro % 2) * 256, Math.floor(cuadro / 2) * 256, 256, 256,
          -lado / 2, -referencia[1] * lado / 256, lado, lado);
        c.restore(); return;
      }
      if (id === 'bordado' && (estaHerida || p.on === false) && saltoBordado.complete && saltoBordado.naturalWidth) {
        // La hoja usa la misma escala en todas las poses y los pies registrados.
        const cuadro = estaHerida ? 3 : (p.vy || 0) < 0 ? 1 : 2, lado = 21 * 256 / 217;
        c.save(); c.translate(p.x, p.y); c.scale((p.face || 1) < 0 ? -1 : 1, 1);
        c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
        c.drawImage(saltoBordado, (cuadro % 2) * 256, Math.floor(cuadro / 2) * 256, 256, 256,
          -lado / 2, -237 * lado / 256, lado, lado);
        c.restore(); return;
      }
      if (id === 'cyber' && !estaHerida && p.on === false && saltoCyber.complete && saltoCyber.naturalWidth) {
        // Escala y punto de apoyo comunes a subida y caída, medidos en la pose neutra.
        const cuadro = (p.vy || 0) < 0 ? 1 : 2, lado = 21 * 256 / 197;
        c.save(); c.translate(p.x, p.y); c.scale((p.face || 1) < 0 ? -1 : 1, 1);
        c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
        c.drawImage(saltoCyber, (cuadro % 2) * 256, Math.floor(cuadro / 2) * 256, 256, 256,
          -lado / 2, -231 * lado / 256, lado, lado);
        c.restore(); return;
      }
      if (id === 'cinema' && !estaHerida && p.on === false && saltoCinema.complete && saltoCinema.naturalWidth) {
        // Las cuatro poses comparten escala; la referencia de pie mide 204 px.
        const cuadro = (p.vy || 0) < 0 ? 1 : 2, lado = 21 * 256 / 204;
        c.save(); c.translate(p.x, p.y); c.scale((p.face || 1) < 0 ? -1 : 1, 1);
        c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
        c.drawImage(saltoCinema, (cuadro % 2) * 256, Math.floor(cuadro / 2) * 256, 256, 256,
          -lado / 2, -234 * lado / 256, lado, lado);
        c.restore(); return;
      }
      if (carrera && !estaHerida && p.on && Math.abs(p.vx || 0) > 25 && carrera.img.complete && carrera.img.naturalWidth) { dibujarCarrera(c, p, carrera, datos.alto); return; }
      if (!img || !img.complete || !img.naturalWidth || (!estaHerida && p.on !== false)) return anterior(c, p, f);
      const [subir, caer, dano] = datos.cuadros || [1, 2, 3];
      const cuadro = estaHerida ? dano : (p.vy || 0) < 0 ? subir : caer;
      const [x, y, w, h] = datos.caja, alto = datos.alto, ancho = alto * w / h;
      c.save(); c.translate(datos.pixel ? Math.round(p.x) : p.x, datos.pixel ? Math.round(p.y) : p.y); c.scale((p.face || 1) < 0 ? -1 : 1, 1);
      c.imageSmoothingEnabled = !datos.pixel || id === 'pixel'; c.imageSmoothingQuality = 'high';
      const K = escalaHoja(img); c.imageSmoothingQuality = 'high';
      c.drawImage(img, ((cuadro % 2) * 256 + x) * K, (Math.floor(cuadro / 2) * 256 + y) * K, w * K, h * K, -ancho / 2, -alto + (datos.dy || 0), ancho, alto);
      c.restore();
    }
    dibujar._itzelForge = id; estilo.player = dibujar;
  }
  Object.keys(conjuntos).forEach(instalar);
  GANCHOS.en('aplicaElegido', previo => function (id, k = 0) { const nombre = previo(id, k); instalar(id); return nombre; });
  window.ITZEL_FORGE = { conjuntos, listoDemo: id => [imagenes[id], correr[id] && correr[id].img].every(im => !im || im.complete) };
})();
