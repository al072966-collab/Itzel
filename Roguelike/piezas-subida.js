'use strict';
// =====================================================================
//  PIEZAS DE SUBIDA Y BAJADA, UNA LÁMINA POR ESTILO
//  Escalera, picos, bandera de control y burbuja de apoyo de Fresita con el
//  arte de cada mundo (tools/piezas-subida.py -> assets/piezas-subida/<estilo>;
//  el bosque que brilla conserva las suyas de tools/bosque-piezas.py).
//  Solo dibujo: no toca colisiones. Las usan modos-propio.js y
//  niveles-verticales.js. Cada estilo carga sus imágenes la primera vez que
//  se pide; mientras no estén, devuelve false y se pinta lo de antes.
// =====================================================================
window.PIEZAS_SUBIDA = (() => {
  const BASE = '../Roguelike/assets/', META = {}, IMG = {}, CARGANDO = {};
  let json = null;
  const V = 2;
  fetch(BASE + 'piezas-subida/piezas-subida.json?v=' + V).then(r => r.json()).then(m => { json = m; }).catch(() => { json = {}; });
  const clave = j => window.estiloArteDerivado || (j && j.st && j.st.id);
  // nombres de las piezas de un estilo y dónde viven sus imágenes
  function fuente(id) {
    if (id === 'biolum') return { meta: BIOLUM_META, ruta: BASE + 'bosque/piezas/' };
    if (json && json[id]) return { meta: json[id], ruta: BASE + 'piezas-subida/' + id + '/' };
    return null;
  }
  const BIOLUM_META = {}; let biolumListo = false;
  fetch(BASE + 'bosque/bosque-piezas.json?v=1').then(r => r.json()).then(m => { Object.assign(BIOLUM_META, m); biolumListo = true; }).catch(() => {});
  function pide(id) {
    if (IMG[id] || CARGANDO[id]) return IMG[id];
    const f = fuente(id); if (!f || (id === 'biolum' && !biolumListo)) return null;
    CARGANDO[id] = true; const o = IMG[id] = { meta: f.meta };
    for (const n of Object.keys(f.meta)) { if (n[0] === '_') continue; const im = new Image(); im.decoding = 'async'; im.src = f.ruta + n + '.png?v=' + V; o[n] = im; }
    return o;
  }
  const hq = c => { c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; };
  // devuelve { im, m } de la pieza si ya cargó (y si este estilo tiene arte)
  function pieza(j, n) {
    const id = clave(j); if (!id) return null;
    const o = pide(id); if (!o) return null;
    const im = o[n], m = o.meta[n]; return im && m && im.complete && im.naturalWidth ? { im, m, id } : null;
  }
  return {
    // un tramo de escalera por casilla; la pieza mide 4 o 5 casillas de alto y se repite hacia arriba
    escalera(c, j, col, fila, X, Y) {
      const p = pieza(j, 'escalera'); if (!p) return false;
      const n = Math.max(1, Math.round(p.m.h / T)), k = p.im.naturalHeight / n, f = ((fila % n) + n) % n;
      hq(c); c.drawImage(p.im, 0, f * k, p.im.naturalWidth, k, X + (T - p.m.w) / 2, Y, p.m.w, T + .4); return true;
    },
    // un quinto de la fila de picos por casilla, hacia arriba o colgando del techo
    pico(c, j, col, fila, X, Y, colgando) {
      const p = pieza(j, 'picos'); if (!p) return false;
      const w = p.im.naturalWidth / 5, f = ((col % 5) + 5) % 5, h = p.m.h;
      hq(c); c.save();
      if (colgando) { c.translate(X, Y); c.scale(1, -1); c.drawImage(p.im, f * w, 0, w, p.im.naturalHeight, 0, -h, T, h); }
      else c.drawImage(p.im, f * w, 0, w, p.im.naturalHeight, X, Y + T - h + 2, T, h);
      c.restore(); return true;
    },
    // cuánto sobresale el pico dibujado de su casilla (0 si no hay arte): la zona que lastima debe cubrir lo que se ve
    altoPico(j) { const p = pieza(j, 'picos'); return p ? p.m.h : 0; },
    // la bandera de los puntos de control: apagada (gris) hasta que Itzel la toca
    bandera(c, j, x, y, encendida, t) {
      const p = pieza(j, 'bandera'); if (!p) return false;
      const w = p.m.w, h = p.m.h, ax = p.m.ax ?? .36; hq(c); c.save();
      if (!encendida) c.filter = 'grayscale(.85) brightness(.6)';
      else { c.globalCompositeOperation = 'lighter'; glowDot(c, x, y - h + 6, 12, '#fff2c0', .18 + Math.sin(t * 3) * .05); c.globalCompositeOperation = 'source-over'; }
      c.drawImage(p.im, x - w * ax, y - h + 1, w, h); c.restore(); return true;
    },
    // burbuja de apoyo: aparece (cuenco), se sostiene (esfera, su aro es el piso) y revienta en gotas
    burbuja(c, j, q, x, y, t) {
      const esf = pieza(j, 'burbuja'); if (!esf) return false;
      const resta = q.t, vida = 6 - resta, cx = x + 16, ap = pieza(j, 'burbuja-aparece'), re = pieza(j, 'burbuja-revienta');
      hq(c); c.save();
      if (vida < .22 && ap) { const s = .6 + vida / .22 * .4; c.globalAlpha = .6 + vida / .22 * .4; c.drawImage(ap.im, cx - ap.m.w * s / 2, y + 2 - ap.m.h * s / 2, ap.m.w * s, ap.m.h * s); }
      else if (resta < .45 && re) { const s = 1.05 - resta; c.globalAlpha = Math.min(1, resta / .3); c.drawImage(re.im, cx - re.m.w * s / 2, y + 2 - re.m.h * s / 2, re.m.w * s, re.m.h * s); }
      else { const parpadea = resta < 1 && Math.sin(t * 30) > 0; c.globalAlpha = parpadea ? .45 : .95; c.drawImage(esf.im, cx - esf.m.w / 2, y + 2 - esf.m.h / 2 + Math.sin(t * 3 + q.c) * .6, esf.m.w, esf.m.h); }
      c.restore(); return true;
    },
  };
})();
