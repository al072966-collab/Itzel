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
    vapor: { archivo: 'vapor-acciones-v1/processed-v1', caja: [56, 42, 139, 196], alto: 21, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    hollin: { archivo: 'hollin-acciones-v1/processed-v1', caja: [77, 39, 126, 198], alto: 21, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    anime: { archivo: 'anime-salto-identidad-v1/procesado', caja: [18, 0, 220, 238], alto: 31.2, dy: 2.3, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
    cielo: { archivo: 'cielo-acciones-v1/processed-v1', caja: [40, 25, 171, 213], alto: 21, activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr'] },
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
  const imagenes = Object.create(null);
  const victoriaAnime = new Image(); victoriaAnime.src = '../Roguelike/assets/forge/itzel/anime-victoria-v1/sheet-transparent.png?v=1';
  const correr = Object.create(null);
  for (const [id, archivo, caja, pixel, alto] of [
    ['acuarela', 'acuarela-correr-v2', [62, 32, 143, 197], false, 21],
    ['pixel', 'pixel-correr-v1', [55, 0, 146, 222], true, 19.7],
    ['bruma', 'bruma-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['ocaso', 'ocaso-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['paper', 'paper-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['biolum', 'biolum-correr-blusa-v2', [18, 0, 220, 238], false, 22.7181818],
    ['sumie', 'sumie-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['neon', 'neon-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['grabado', 'grabado-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['vitral', 'vitral-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['barro', 'barro-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['codex', 'codex-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['cuaderno', 'cuaderno-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['oleo', 'oleo-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['fuego', 'fuego-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['agua', 'agua-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['hielo', 'hielo-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['flat', 'flat-correr-identidad-v2/procesado', [18, 0, 220, 238], false, 22.7181818],
    ['lowpoly', 'lowpoly-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['eco', 'eco-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['nouveau', 'nouveau-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['deco', 'deco-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['cyber', 'cyber-correr-identidad-v2/procesado', [18, 0, 220, 238], false, 22.7181818],
    ['cinema', 'cinema-correr-identidad-v2/procesado', [18, 0, 220, 238], false, 22.7181818],
    ['vapor', 'vapor-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['hollin', 'hollin-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['anime', 'anime-correr-identidad-v2/procesado', [18, 0, 220, 238], false, 31.2],
    ['cielo', 'cielo-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['alebrije', 'alebrije-correr-v1', [18, 0, 220, 238], false, 22.7181818],
    ['bits32', 'bits32-correr-identidad-v2/procesado', [18, 0, 220, 238], true, 22.7181818],
    ['bits64', 'bits64-correr-identidad-v2/procesado', [18, 0, 220, 238], true, 22.7181818],
    ['bits8', 'bits8-correr-identidad-v2/procesado', [18, 0, 220, 238], true, 22.7181818],
    ['bordado', 'bordado-correr-v1', [18, 0, 220, 238], false, 22.7181818],
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
    if (!mundoDemo || id === mundoDemo) img.src = `../Roguelike/assets/forge/itzel/${archivo}/sheet-transparent.png?v=9`;
    correr[id] = { img, caja, pixel, alto, dy: id === 'anime' ? 2.3 : 0, cuadros: id === 'alebrije' || id === 'hielo' ? [0, 1, 3] : null };
  }
  const estados = new WeakMap();
  function herida(p, f) {
    const ahora = f && Number.isFinite(f.t) ? f.t : 0, inv = p.inv || 0;
    const estado = estados.get(p) || { inv: 0, heridaHasta: -1 };
    if (inv > estado.inv + .05) estado.heridaHasta = ahora + .35;
    estado.inv = inv; estados.set(p, estado);
    return inv > 0 && ahora < estado.heridaHasta;
  }
  function dibujarCarrera(c, p, carrera, altoBase) {
    const cuadros = carrera.cuadros || [0, 1, 2, 3];
    const cuadro = cuadros[Math.floor((p.run || 0) / (Math.PI / 2)) % cuadros.length];
    const [x, y, w, h] = carrera.caja, alto = carrera.alto || altoBase, ancho = alto * w / h;
    c.save(); c.translate(carrera.pixel ? Math.round(p.x) : p.x, carrera.pixel ? Math.round(p.y) : p.y);
    c.scale((p.face || 1) < 0 ? -1 : 1, 1); c.imageSmoothingEnabled = !carrera.pixel;
    c.drawImage(carrera.img, (cuadro % 2) * 256 + x, Math.floor(cuadro / 2) * 256 + y, w, h, -ancho / 2, -alto + (carrera.dy || 0), ancho, alto);
    c.restore();
  }
  for (const [id, datos] of Object.entries(conjuntos)) {
    if (!datos.archivo) continue;
    const img = new Image(); img.decoding = 'async';
    if (!mundoDemo || id === mundoDemo) img.src = '../Roguelike/assets/forge/itzel/' + datos.archivo + '/sheet-transparent.png';
    imagenes[id] = img;
  }
  function instalar(id) {
    const estilo = STYLE_MAP[id], datos = conjuntos[id], img = imagenes[id];
    if (!estilo || !datos || !datos.activada || estilo.player?._itzelForge === id) return;
    const anterior = estilo.player;
    function dibujar(c, p, f) {
      if (id === 'anime' && f && f.g && f.g.win && victoriaAnime.complete && victoriaAnime.naturalWidth) {
        const alto = 31.2, w = alto * 220 / 238;
        c.save(); c.translate(p.x, p.y); c.scale((p.face || 1) < 0 ? -1 : 1, 1); c.imageSmoothingEnabled = true;
        c.drawImage(victoriaAnime, 18, 256, 220, 238, -w / 2, -alto + 2.3, w, alto); c.restore(); return;
      }
      const estaHerida = herida(p, f);
      const carrera = correr[id];
      if (carrera && !estaHerida && p.on && Math.abs(p.vx || 0) > 25 && carrera.img.complete && carrera.img.naturalWidth) { dibujarCarrera(c, p, carrera, datos.alto); return; }
      if (!img || !img.complete || !img.naturalWidth || (!estaHerida && p.on !== false)) return anterior(c, p, f);
      const [subir, caer, dano] = datos.cuadros || [1, 2, 3];
      const cuadro = estaHerida ? dano : (p.vy || 0) < 0 ? subir : caer;
      const [x, y, w, h] = datos.caja, alto = datos.alto, ancho = alto * w / h;
      c.save(); c.translate(datos.pixel ? Math.round(p.x) : p.x, datos.pixel ? Math.round(p.y) : p.y); c.scale((p.face || 1) < 0 ? -1 : 1, 1);
      c.imageSmoothingEnabled = !datos.pixel;
      c.drawImage(img, (cuadro % 2) * 256 + x, Math.floor(cuadro / 2) * 256 + y, w, h, -ancho / 2, -alto + (datos.dy || 0), ancho, alto);
      c.restore();
    }
    dibujar._itzelForge = id; estilo.player = dibujar;
  }
  Object.keys(conjuntos).forEach(instalar);
  GANCHOS.en('aplicaElegido', previo => function (id, k = 0) { const nombre = previo(id, k); instalar(id); return nombre; });
  window.ITZEL_FORGE = { conjuntos, listoDemo: id => [imagenes[id], correr[id] && correr[id].img].every(im => !im || im.complete) };
})();
