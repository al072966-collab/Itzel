'use strict';
// =====================================================================
//  LA TRAMOYA DEL TEATRO TORO (niveles verticales del art déco)
//  El fondo es el hueco de escena de un teatro visto desde dentro: un muro de ladrillo oscuro con sus pilastras de
//  madera y filetes dorados, y varales (tubos de metal) que cruzan de lado a lado cada cierta altura. TODO lo que
//  cuelga cuelga de un varal con su cuerda (telones a los lados, la luna, la estrella, las máscaras, la araña, los
//  reflectores con su haz de luz), y lo que no cuelga está apoyado sobre un piso (el baúl, el busto, los bastidores de
//  columnas y de abanico). Nada flota «nomás porque sí». Las láminas son tramoya/*.png (ChatGPT); sin ellas se ve el muro
//  con los varales. Solo dibujo: no toca colisiones. La pinta niveles-verticales.js en la capa «atrás» (fondo) y en la
//  «medio» (pasarelas y utilería sobre los pisos).
// =====================================================================
window.TRAMOYA_VERTICAL = (() => {
  const ruta = '../Roguelike/assets/tramoya/';
  const cargar = nombre => { const im = new Image(); im.decoding = 'async'; im.src = ruta + nombre + '.png?v=2'; return im; };
  const util = cargar('utileria'), tel = cargar('telones'), luc = cargar('luces');
  const ok = im => im.complete && im.naturalWidth;
  const H = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const BAT = 448;                                 // distancia entre varales (en unidades del mundo)
  // regiones de cada lámina: [sx, sy, sw, sh] en píxeles de la imagen de 1774 × 887
  const R = {
    luna: [41, 464, 211, 375], estrella: [293, 464, 205, 341], cofre: [546, 607, 348, 232], busto: [962, 464, 198, 389],
    comedia: [1235, 539, 232, 293], tragedia: [1508, 539, 218, 293], columnas: [942, 20, 293, 406], abanico: [1290, 116, 443, 280],
    pasarela: [18, 170, 655, 275],
    refIzq: [68, 14, 300, 395], refDer: [832, 14, 308, 395], arana: [1003, 443, 252, 417], conoAncho: [273, 307, 409, 314], conoEstrecho: [689, 307, 191, 314],
    cortina: [323, 27, 131, 835], cortinaAncha: [20, 20, 260, 842],
  };
  const dib = (c, im, r, x, y, w, h) => c.drawImage(im, r[0], r[1], r[2], r[3], x, y, w, h);

  // ---- el muro: una loseta de 192 × 192 con ladrillo oscuro y una pilastra de madera con filetes dorados
  let loseta = null;
  function armaLoseta() {
    const cv = document.createElement('canvas'); cv.width = cv.height = 192; const x = cv.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 192); g.addColorStop(0, '#171a30'); g.addColorStop(1, '#10132a'); x.fillStyle = g; x.fillRect(0, 0, 192, 192);
    for (let fila = 0; fila < 16; fila++) {
      const off = fila % 2 ? 12 : 0;
      for (let col = -1; col < 9; col++) {
        const bx = col * 24 + off, by = fila * 12, v = H(fila * 9 + col, 7);
        x.fillStyle = `rgba(${40 + v * 30 | 0},${34 + v * 22 | 0},${70 + v * 34 | 0},.55)`; x.fillRect(bx + 1, by + 1, 22, 10);
        x.fillStyle = 'rgba(255,255,255,.035)'; x.fillRect(bx + 1, by + 1, 22, 2);
      }
    }
    x.fillStyle = 'rgba(0,0,0,.28)'; for (let fila = 0; fila < 16; fila++) x.fillRect(0, fila * 12, 192, 1);
    // la pilastra: viga de madera con dos filetes dorados y un herraje cada media loseta
    const pg = x.createLinearGradient(0, 0, 14, 0); pg.addColorStop(0, '#2a1a12'); pg.addColorStop(.5, '#4a3020'); pg.addColorStop(1, '#22150e'); x.fillStyle = pg; x.fillRect(0, 0, 14, 192);
    x.fillStyle = '#d8a83a'; x.fillRect(2, 0, 1, 192); x.fillRect(11, 0, 1, 192);
    for (const y of [24, 120]) { x.fillStyle = '#b98a2c'; x.fillRect(0, y, 14, 4); x.fillStyle = '#ffe08a'; x.fillRect(0, y, 14, 1); x.beginPath(); x.moveTo(7, y - 8); x.lineTo(11, y - 4); x.lineTo(7, y); x.lineTo(3, y - 4); x.closePath(); x.fillStyle = '#d8a83a'; x.fill(); }
    return cv;
  }
  const altoVista = j => (j.vista === 'juego' && typeof VISTA !== 'undefined' ? VISTA.H : VH);

  // un telón (pata) que cuelga del varal hasta el siguiente
  function pata(c, x, y, w, h, espejo) {
    c.save(); if (espejo) { c.translate(x + w, 0); c.scale(-1, 1); x = 0; }
    if (ok(tel)) { c.globalAlpha = .96; dib(c, tel, R.cortina, x, y, w, h); }
    else { const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#5a0f1c'); g.addColorStop(.5, '#a02034'); g.addColorStop(1, '#4a0c18'); c.fillStyle = g; c.fillRect(x, y, w, h); }
    c.restore();
  }
  // una cuerda que cae desde el varal hasta lo que sostiene
  function cuerda(c, x, y0, y1) {
    c.strokeStyle = '#a58a5a'; c.lineWidth = .9; c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y1); c.stroke();
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = .4; c.beginPath(); c.moveTo(x + .6, y0); c.lineTo(x + .6, y1); c.stroke();
  }
  // lo que cuelga: [lámina, región, ancho, alto, dónde se ata (alto desde la parte de arriba del dibujo)]
  const COLGANTES = [
    ['luna', R.luna, 28, 50], ['estrella', R.estrella, 26, 43], ['comedia', R.comedia, 30, 38], ['tragedia', R.tragedia, 29, 37], ['arana', R.arana, 34, 56],
    ['refIzq', R.refIzq, 38, 50], ['refDer', R.refDer, 38, 50],
  ];
  function colgante(c, j, b, i, ax, ay) {
    const k = COLGANTES[Math.floor(H(b, 31 + i) * COLGANTES.length)], largo = 26 + H(b, 41 + i) * 58, t = j.t;
    const [nombre, reg, w, h] = k; if (!ok(util) && !ok(luc)) return;
    const im = nombre === 'arana' || nombre.startsWith('ref') ? luc : util; if (!ok(im)) return;
    const ang = Math.sin(t * .9 + b * 2.3 + i * 1.7) * .035;
    const mascara = nombre === 'comedia' || nombre === 'tragedia';
    c.save(); c.translate(ax, ay);
    if (mascara) { cuerda(c, -w * .28, 0, largo + 3); cuerda(c, w * .28, 0, largo + 3); } else cuerda(c, 0, 0, largo + 2);
    c.rotate(ang); c.translate(0, largo);
    if (nombre.startsWith('ref')) {                      // el reflector: su haz sale del lente hacia el muro
      const der = nombre === 'refDer', lx = (der ? -.2 : .2) * w, ly = h * .62;
      c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .3 + .06 * Math.sin(t * 3 + b);
      c.translate(lx, ly); c.rotate(der ? .55 : -.55);
      if (ok(luc)) dib(c, luc, R.conoAncho, -38, 2, 76, 112); c.restore();
    }
    c.globalAlpha = 1; dib(c, im, reg, -w / 2, 0, w, h);
    c.restore();
  }
  function varal(c, j, b, y, x0, x1) {
    // las patas de telón a cada lado, el tubo con sus remates y las cuerdas con lo que cuelga
    const ancho = 44; pata(c, x0, y, ancho, BAT - 6, false); pata(c, x1 - ancho, y, ancho, BAT - 6, true);
    const g = c.createLinearGradient(0, y - 2, 0, y + 3); g.addColorStop(0, '#9a8454'); g.addColorStop(.5, '#d8c080'); g.addColorStop(1, '#4a3a22'); c.fillStyle = g; c.fillRect(x0, y - 2, x1 - x0, 5);
    c.fillStyle = '#2a2018'; for (const x of [x0, x1]) { c.fillRect(x - 3, y - 4, 6, 9); }
    c.fillStyle = '#e8c870'; c.fillRect(x0 - 3, y - 4, 6, 1); c.fillRect(x1 - 3, y - 4, 6, 1);
    const util0 = x0 + ancho + 10, util1 = x1 - ancho - 10, n = 2 + (H(b, 1) > .55 ? 1 : 0);
    for (let i = 0; i < n; i++) { const fx = (i + .5) / n, jitter = (H(b, 11 + i) - .5) * 34; colgante(c, j, b, i, util0 + (util1 - util0) * fx + jitter, y + 2); }
  }
  function fondo(c, j) {
    if (!loseta) loseta = armaLoseta();
    const x0 = j.cam.x, y0 = j.cam.y, Hv = altoVista(j) + 8, Wm = j.W * T, Hm = j.H * T;
    c.save();
    c.fillStyle = c.createPattern(loseta, 'repeat'); c.fillRect(x0 - 2, y0 - 2, VW + 4, Hv + 4);
    // la luz sube desde el escenario: más clara abajo, más oscura arriba
    const lg = c.createLinearGradient(0, y0, 0, y0 + Hv); lg.addColorStop(0, 'rgba(6,6,20,.35)'); lg.addColorStop(1, 'rgba(60,40,20,.06)'); c.fillStyle = lg; c.fillRect(x0 - 2, y0 - 2, VW + 4, Hv + 4);
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    const b0 = Math.max(0, Math.floor((y0 - 60) / BAT)), b1 = Math.floor((y0 + Hv + 60) / BAT);
    for (let b = b0; b <= b1; b++) { const y = b * BAT + 44; if (y > Hm - 30) break; varal(c, j, b, y, 2 * T, Wm - 2 * T); }
    c.restore();
  }
  // sobre los pisos: pasarelas de latón y la utilería apoyada (el baúl, el busto, los bastidores)
  const PROPS = [['cofre', R.cofre, 24, 16, 3], ['busto', R.busto, 15, 30, 3], ['columnas', R.columnas, 30, 40, 5], ['abanico', R.abanico, 44, 28, 6]];
  function pasarelas(c, j) {
    if (!ok(util)) return;
    const r0 = Math.max(1, Math.floor(j.cam.y / T) - 3), r1 = Math.min(j.H - 1, Math.ceil((j.cam.y + altoVista(j)) / T) + 2);
    c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    for (let r = r0; r <= r1; r++) {
      let col = 2;
      while (col < j.W - 2) {
        if (j.at(col, r) !== '#' || j.at(col, r - 1) === '#') { col++; continue; }
        const inicio = col;
        while (col < j.W - 2 && j.at(col, r) === '#' && j.at(col, r - 1) !== '#') col++;
        const largo = col - inicio; if (largo < 3) continue;
        const x = inicio * T, y = r * T;
        if (largo <= 6 && (r + inicio) % 2 === 0) { dib(c, util, R.pasarela, x, y - 12, largo * T, 24); continue; }   // la pasarela de latón sobre ese piso
        // utilería apoyada: solo en pisos que la aguantan (por ancho) y de forma estable (depende del lugar, no del azar de cada cuadro)
        if (H(r, inicio) > .45) continue;
        const cand = PROPS.filter(p => largo >= p[4]); if (!cand.length) continue;
        const p = cand[Math.floor(H(inicio, r + 5) * cand.length)], px = x + (largo * T - p[2]) * (.25 + .5 * H(r, inicio + 3));
        dib(c, util, p[1], px, y - p[3] + 1, p[2], p[3]);
      }
    }
    c.restore();
  }
  return { fondo, pasarelas };
})();
