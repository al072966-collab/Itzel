'use strict';
// Solo detalles de suelo; el mundo macro y las hojas activas conservan su dibujo.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.miniatura) return;
  const V = vestirNivel({ id: 'miniatura', carpeta: 'macro-detalles', ver: 1 });
  const { spr } = V;
  V.terreno(ctx => {
    if (window.MINIATURA_MACRO_LISTO && window.MINIATURA_MACRO_LISTO()) return;
    for (const o of L.deco) {
      if (o.k === 'f') spr(ctx, o.i % 2 ? 'hongo' : 'hongos', o.x + 8, o.y + 1);
      else if (o.k === 'T') spr(ctx, 'hierba', o.x + 9, o.y + 1, { alfa: .85 });
      else if (o.k === 'r') spr(ctx, 'hojaSeca', o.x + 15, o.y + 1, { alfa: .85 });
    }
  }, true);
  window.MACRO_DETALLES = V;
})();
