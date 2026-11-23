// ============================================================================
//  Fauna de fondo, mosca de la plaga y criaturas de los modos, con los assets de ChatGPT
//  (tools/fauna-nueva.py → Roguelike/assets/fauna/fauna.json). Antes eran figuras hechas
//  por código; David pidió que el código solo haga el paisaje.
//
//  FAUNA_ARTE.listo('flamenco')            ¿ya cargó la serie (o la pieza)?
//  FAUNA_ARTE.dib(c, 'flamenco', t, x, y, {h, w, fps, seq, voltea, alfa, filtro, rot, ay})
//      dibuja el cuadro que toca de la serie flamenco0..n (o la pieza si no es serie),
//      centrado en x y con su base en y (ay = .5 lo centra en alto).
// ============================================================================
(function () {
  const RUTA = '../Roguelike/assets/fauna/', V = 'f4';
  const IMG = {}, TAM = {}, SERIES = {};
  const manifiesto = window.FAUNA_MANIFIESTO ? Promise.resolve(window.FAUNA_MANIFIESTO) : fetch(RUTA + 'fauna.json?v=' + V).then(r => r.json());
  manifiesto.then(m => {
    for (const n of Object.keys(m)) {
      TAM[n] = m[n]; const im = new Image(); im.decoding = 'async'; im.src = RUTA + n + '.png?v=' + V; IMG[n] = im;
      const b = n.replace(/\d+$/, ''); if (b !== n) (SERIES[b] = SERIES[b] || []).push(n);
    }
    for (const b in SERIES) SERIES[b].sort((a, c) => +a.slice(b.length) - +c.slice(b.length));
  }).catch(() => {});
  const ok = n => IMG[n] && IMG[n].complete && IMG[n].naturalWidth > 0;
  const cuadros = b => SERIES[b] || (TAM[b] ? [b] : []);
  function listo(b) { const s = cuadros(b); return s.length > 0 && s.every(ok); }
  function cuadro(b, t, o = {}) {
    const s = cuadros(b); if (!s.length) return null;
    const seq = o.seq || s.map((_, i) => i);
    return s[seq[Math.floor((t || 0) * (o.fps || 8)) % seq.length] % s.length];
  }
  function pieza(c, n, x, y, o = {}) {
    if (!ok(n)) return false;
    const t = TAM[n]; let w = t.w, h = t.h;
    if (o.h) { w = w * o.h / h; h = o.h; } else if (o.w) { h = h * o.w / w; w = o.w; }
    c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot); if (o.voltea) c.scale(-1, 1);
    if (o.alfa !== undefined) c.globalAlpha *= o.alfa; if (o.filtro) c.filter = o.filtro;
    c.imageSmoothingEnabled = !o.pixel; c.imageSmoothingQuality = 'high';
    c.drawImage(IMG[n], -w / 2, -h * (o.ay ?? 1), w, h); c.restore(); return true;
  }
  function dib(c, b, t, x, y, o = {}) { const n = cuadro(b, t, o); return n ? pieza(c, n, x, y, o) : false; }
  window.FAUNA_ARTE = { listo, dib, pieza, cuadro, TAM, IMG, SERIES };
})();
