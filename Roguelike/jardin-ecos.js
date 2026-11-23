'use strict';
// Piezas para el modo isométrico: sus llamadas suceden dentro del orden de profundidad.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.eco) return;
  const V = vestirNivel({ id: 'eco', carpeta: 'jardin-ecos', ver: 3, manifiesto: window.JARDIN_ECOS_MANIFIESTO });
  const { spr } = V;
  const panorama = new Image();
  panorama.onload = () => V.rehaz(); panorama.src = '../Roguelike/assets/jardin-ecos/maqueta-panorama-v1.png';
  const muroMaqueta = new Image();
  muroMaqueta.onload = () => V.rehaz(); muroMaqueta.src = '../Roguelike/assets/jardin-ecos/muro-maqueta-v1.png';
  const superficieMaqueta = new Image();
  superficieMaqueta.onload = () => V.rehaz(); superficieMaqueta.src = '../Roguelike/assets/jardin-ecos/superficie-maqueta-v1.png';
  const plataformaMaqueta = new Image();
  plataformaMaqueta.onload = () => V.rehaz(); plataformaMaqueta.src = '../Roguelike/assets/jardin-ecos/plataforma-maqueta-v1.png';
  const farolMaqueta = new Image(), floresMaqueta = new Image();
  farolMaqueta.onload = floresMaqueta.onload = () => V.rehaz();
  farolMaqueta.src = '../Roguelike/assets/jardin-ecos/farol-maqueta-v1.png';
  floresMaqueta.src = '../Roguelike/assets/jardin-ecos/flores-maqueta-v1.png';
  const losaAnterior = MEC.LOOK.losa;
  if (typeof losaAnterior === 'function') MEC.LOOK.losa = function (c, pl, f, sk) {
    const id = (f.g && f.g.def && f.g.def.id) || (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id);
    if (id !== 'eco' || !plataformaMaqueta.complete || !plataformaMaqueta.naturalWidth)
      return losaAnterior.call(this, c, pl, f, sk);
    c.save();
    c.drawImage(plataformaMaqueta, 90, 258, 1990, 258, pl.x, pl.y - 8, pl.w + 12, 16);
    c.globalCompositeOperation = 'lighter';
    glowDot(c, pl.x + pl.w / 2, pl.y + 12, 10, sk.accent, .25 + (pl.y0 - pl.y) / 120);
    c.restore();
  };
  V.cielo((c, f, antes) => {
    const id = (f.g && f.g.def && f.g.def.id) || (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id);
    if (id !== 'eco' || !panorama.complete || !panorama.naturalWidth) return antes();
    const ancho = 700, alto = f.H || VH, off = ((f.cam * .08 % ancho) + ancho) % ancho;
    c.save(); c.fillStyle = '#092632'; c.fillRect(0, 0, VW, alto);
    for (let x = -off - ancho; x < VW + ancho; x += ancho) c.drawImage(panorama, x, 0, ancho, alto);
    c.restore();
  });
  // En la vista lateral, sustituir solo los árboles geométricos por el árbol
  // del jardín ya existente; las flores y faroles siguen su dibujo anterior.
  const terrenoAnterior = V.ST.terrain;
  V.ST.terrain = function (c, f) {
    const id = (f.g && f.g.def && f.g.def.id) || (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id);
    if (id !== 'eco' || !V.es(f.st) || !V.listo('arbol')) return terrenoAnterior.call(this, c, f);
    const decoracion = L.deco;
    const farolListo = farolMaqueta.complete && farolMaqueta.naturalWidth;
    const floresListas = floresMaqueta.complete && floresMaqueta.naturalWidth;
    try { L.deco = decoracion.filter(o => o.k !== 'T' && !(o.k === 'r' && farolListo) && !(o.k === 'f' && floresListas)); terrenoAnterior.call(this, c, f); }
    finally { L.deco = decoracion; }
    if (muroMaqueta.complete && muroMaqueta.naturalWidth) {
      c.save(); allLoopsPath(c, L.loops); c.clip();
      const patron = c.createPattern(muroMaqueta, 'repeat');
      patron.setTransform(new DOMMatrix().scale(112 / muroMaqueta.naturalWidth));
      c.fillStyle = patron;
      // El borde verde superior sigue marcando la superficie transitable.
      for (const r of L.tops) c.fillRect(r.x0, r.y + 8, r.x1 - r.x0, VH + 40);
      c.restore();
    }
    if (superficieMaqueta.complete && superficieMaqueta.naturalWidth) {
      // La franja sigue los tramos existentes, con el canto sobre la colisión.
      for (const r of L.tops) {
        c.save(); c.beginPath(); c.rect(r.x0, r.y - 8, r.x1 - r.x0, 11); c.clip();
        for (let x = r.x0; x < r.x1; x += 140)
          c.drawImage(superficieMaqueta, 0, 298, 2172, 130, x, r.y - 8, 140, 11);
        c.restore();
      }
    }
    for (const o of decoracion) {
      if (o.k === 'T') spr(c, 'arbol', o.x + 2, o.y + 1, { h: 32 });
      else if (o.k === 'r' && farolListo) c.drawImage(farolMaqueta, 458, 279, 395, 619, o.x + 2, o.y - 10, 7, 11);
      else if (o.k === 'f' && floresListas) c.drawImage(floresMaqueta, 439, 327, 432, 471, o.x + 1, o.y - 8, 9, 9);
    }
  };
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
