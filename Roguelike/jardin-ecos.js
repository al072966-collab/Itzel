'use strict';
// Piezas para el modo isométrico: sus llamadas suceden dentro del orden de profundidad.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.eco) return;
  const V = vestirNivel({ id: 'eco', carpeta: 'jardin-ecos', ver: 3 });
  const { spr } = V;
  const aplica = j => j && j.def && j.def.id === 'eco' && !window.estiloArteDerivado;
  window.JARDIN_ECOS = {
    listo: V.todo,
    cacao(c, j, x, y) {
      if (!aplica(j) || !V.listo('cacao')) return false;
      spr(c, 'cacao', x, y, { ay: .5, h: 8 }); return true;
    },
    semilla(c, j, indice, x, y) {
      const n = 'semilla' + (indice % 3); if (!aplica(j) || !V.listo(n)) return false;
      c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x, y, 13, ['#73efd0', '#ffc980', '#cba6ff'][indice % 3], .4); c.restore();
      spr(c, n, x, y, { ay: .5 }); return true;
    },
    arbol(c, j, x, y, t) {
      if (!aplica(j) || !V.listo('arbol')) return false;
      c.fillStyle = 'rgba(10,30,30,.3)'; c.beginPath(); c.ellipse(x, y, 11, 3, 0, 0, Math.PI * 2); c.fill();
      spr(c, 'arbol', x, y + 1, { h: 39 });
      c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x, y - 22, 17, '#9affee', j.win ? .65 : .18 + Math.sin(t * 2) * .04); c.restore();
      return true;
    },
    erizo(c, j, e, t) {
      const n = e.duerme ? 'erizoDormido' : e.curl >= .5 ? 'erizoBola' : null;
      if (!aplica(j)) return false;
      if (n) { if (!V.listo(n)) return false; spr(c, n, 0, .5); return true; }
      const forge = window.ENEMIGOS_ASSETS, hoja = forge?.hojaForge('erizo');
      if (hoja && hoja.complete && hoja.naturalWidth) {
        forge.pinta(c, Object.assign({ w: 13, h: 9, anim: e.t, dir: e.face, st: 'ok' }, e), t, 'erizo', null);
        return true;
      }
      const caminar = 'erizo' + [0, 1, 2, 1][Math.floor((e.t || t) * 4) % 4];
      if (!V.listo(caminar)) return false;
      spr(c, caminar, 0, .5); return true;
    }
  };
})();
