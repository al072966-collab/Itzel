'use strict';
// Poses de Fresita sólida para el estilo protagonista; solo cambia el dibujo.
(() => {
  const ruta = '../Roguelike/assets/personajes/asidero-anime/';
  const imagen = n => { const im = new Image(); im.decoding = 'async'; im.src = ruta + n + '.png?v=1'; return im; };
  const espera = imagen('fresita'), pareja = [imagen('colgada-0'), imagen('colgada-1')];
  const itzelColgada = imagen('itzel-colgada');
  const listo = im => im.complete && im.naturalWidth > 0;
  const parejaLista = () => listo(espera) && listo(itzelColgada);
  const estado = f => f && f.g && f.g.asid && f.g.def && f.g.def.power === 'asidero' && f.st && String(f.st.id).split('~')[0] === 'anime' ? f.g : null;
  window.ASIDERO_ANIME_ARTE = { parejaLista, activo: f => !!estado(f) && !!estado(f).asid.latch && parejaLista() };
  function instala() {
    const st = STYLE_MAP.anime; if (!st) return;
    if (!st.player._asideroAnime) {
      const antes = st.player;
      const fn = function (c, p, f) {
        const g = estado(f); if (!g || !g.asid.latch || !parejaLista()) return antes.apply(this, arguments);
        // La pose incluye los brazos estirados: su altura total debe contemplarlos.
        // Alineamos sus puños con las manos bajas de Fresita, sin cambiar la física.
        const h = 26, w = h * itzelColgada.naturalWidth / itzelColgada.naturalHeight;
        const anchoFresita = 20, altoFresita = anchoFresita * espera.naturalHeight / espera.naturalWidth;
        const manoX = anchoFresita * .20, manoY = altoFresita * .43;
        c.save(); c.translate(g.fre.x, g.fre.y); c.scale((g.fre.face || 1) < 0 ? -1 : 1, 1); c.imageSmoothingEnabled = true;
        // Conserva la pose que ya funciona hacia la izquierda y, cuando
        // Fresita mira a la derecha, evita invertir a Itzel hacia atrás.
        c.translate(manoX, manoY); if ((g.fre.face || 1) < 0) c.scale(-1, 1);
        c.drawImage(itzelColgada, -w * .78, -h * .035, w, h); c.restore();
      };
      fn._asideroAnime = true; st.player = fn;
    }
    if (!st.fresita._asideroAnime) {
      const antes = st.fresita;
      const fn = function (c, fr, f) {
        const g = estado(f); if (!g) return antes.apply(this, arguments);
        const im = espera;
        if (!listo(im)) return antes.apply(this, arguments);
        // Fresita normal ocupa 20 unidades: usar el mismo ancho también en
        // la lámina conjunta evita que crezca al engancharse Itzel.
        const w = 20, h = w * im.naturalHeight / im.naturalWidth;
        const x = fr.x, y = fr.y + h * .48;
        c.save(); c.translate(x, y); c.scale((fr.face || 1) < 0 ? -1 : 1, 1); c.imageSmoothingEnabled = true;
        c.drawImage(im, -w / 2, -h, w, h); c.restore();
      };
      fn._asideroAnime = true; st.fresita = fn;
    }
  }
  instala();
  if (typeof GANCHOS !== 'undefined') GANCHOS.en('aplicaElegido', previo => function (id, k = 0) { const r = previo(id, k); if (id === 'anime') instala(); return r; });
})();
