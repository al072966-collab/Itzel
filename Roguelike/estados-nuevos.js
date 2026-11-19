// ============================================================================
//  Estados de enemigos con las láminas de ChatGPT (tools/fauna-nueva.py → assets/fauna).
//  Antes, en estos estados el enemigo volvía a su dibujo de figuras: dormido, aturdido,
//  embistiendo, en el caparazón… Ahora:
//    · se prueba el dibujo de siempre en un lienzo aparte; si ya pinta una imagen (el arte del
//      nivel), se queda tal cual;
//    · si no pinta ninguna (eran figuras), se pone la pose de la lámina que toca al estado
//      (goma aplastada, charrán en picada, rinoceronte embistiendo, rover cargando, tortuga en su
//      caparazón, alacrán picando) o la pose base; dormido/aturdido, ladeada y apagada.
//  Se carga al final, después de todos los vestidos de nivel, para envolverlos.
// ============================================================================
(function () {
  if (typeof MEC === 'undefined' || !MEC.FD) return;
  const FD = MEC.FD;
  // un lienzo de prueba que solo cuenta si el dibujo de siempre pinta imágenes
  const prueba = document.createElement('canvas').getContext('2d'); let imagenes = 0;
  prueba.drawImage = function (im) { if (im instanceof HTMLImageElement || (window.ImageBitmap && im instanceof ImageBitmap)) imagenes++; };   // un lienzo en caché suele ser un dibujo de figuras
  function pintaFiguras(fn, e, t, s) {
    imagenes = 0; prueba.setTransform(1, 0, 0, 1, 0, 0);
    try { fn.call(null, prueba, e, t, s); } catch (err) { return false; }
    return imagenes === 0;
  }
  const quieto = e => e.st === 'sleep' || e.st === 'stun' || (e.aturde || 0) > 0;
  const ciclo = (seq, t, fps) => seq[Math.floor(t * fps) % seq.length];
  // id → { base, ancho (unidades), pose(e, t) → índice o null }
  const ESTADOS = {
    goma: { base: 'gomaB', ancho: 16, pose: e => quieto(e) ? 1 : null },
    charran: { base: 'charranP', ancho: 17, pose: e => (e.amenaza || 0) > .55 ? 2 : (e.amenaza || 0) > 0 ? 1 : e.st === 'dive' ? 2 : null },
    rinoceronte: { base: 'rinoE', ancho: 27, pose: (e, t) => e.st === 'run' ? ciclo([1, 2], t, 8) : e.st === 'stun' ? 0 : null },
    rover: { base: 'roverD', ancho: 21, pose: (e, t) => e.embiste ? ciclo([1, 2], t, 6) : null },
    cocuyo: { base: 'cocuyoL', ancho: 15, pose: e => quieto(e) ? 0 : null },
    tortuga: { base: 'tortugaC', ancho: 19, pose: e => e.st === 'shell' || e.st === 'slide' ? 2 : null, pixel: true },
    mecha: { base: 'mechaF', ancho: 20, pose: () => null },
    alacranMini: { base: 'alacranA', ancho: 30, pose: e => e.st === 'lunge' ? 1 : e.st === 'ok' && (e.tt || 0) > .5 ? 2 : null },
  };
  function envuelve() {
    const FA = window.FAUNA_ARTE; if (!FA) return;
    for (const id in ESTADOS) {
      const antes = FD[id]; if (!antes || antes._estadosNuevos) continue;
      const cfg = ESTADOS[id];
      const nuevo = function (c, e, t, s) {
        if (e.sub || !FA.listo(cfg.base)) return antes.call(this, c, e, t, s);
        // solo se reemplaza lo que era de figuras: si el dibujo de siempre ya pinta una imagen (el arte del nivel), se queda
        if (!pintaFiguras(antes, e, t, s)) return antes.call(this, c, e, t, s);
        let n = cfg.pose(e, t || 0); if (n === null) n = 0;
        const tam = FA.TAM[cfg.base + n], w = Math.min(tam.w, Math.max(cfg.ancho * .7, (e.w || 12) * 1.35));
        const o = { w, ay: 1, pixel: cfg.pixel };
        if (quieto(e)) { o.rot = -.12 + Math.sin((t || 0) * 2.2) * .05; o.filtro = 'saturate(.6) brightness(.82)'; }
        FA.pieza(c, cfg.base + n, 0, .5, o);
      };
      nuevo._estadosNuevos = true; nuevo._assetNuevo = true; nuevo._assetListo = () => FA.listo(cfg.base) || !!(antes._assetListo && antes._assetListo());
      FD[id] = nuevo;
    }
  }
  // al final de la carga: así quedan por fuera de los vestidos de cada nivel
  if (document.readyState === 'complete') envuelve(); else window.addEventListener('load', envuelve);
  window.ESTADOS_NUEVOS = ESTADOS;
})();
