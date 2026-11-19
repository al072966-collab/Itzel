'use strict';
// =====================================================================
//  REMOLINOS DE LA NOCHE, CON SUS ASSETS (estilo óleo impresionista)
//  El telón nocturno y el terreno al óleo se quedan. Lo de enfrente usa las
//  piezas de tools/oleo-remolinos.py (Roguelike/assets/oleo):
//    · discos de remolino que giran (se pisan, con la cubierta medida);
//    · la luna columpio de la lámina (la cuerda y la estrella las sigue
//      dibujando el juego, porque su largo es la mecánica);
//    · el remolino de Fresita: la pincelada en espiral que gira;
//    · búho, girasol (se carga y escupe la semilla de la lámina), cuervo
//      y murciélago;
//    · ceibas, trigo, girasoles y rocas; canistel, corazón y la iglesia.
//  Nada cambia colisiones ni mecánicas. Solo aplica a «Remolinos de la noche».
// =====================================================================
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.oleo) return;
  const V = vestirNivel({ id: 'oleo', carpeta: 'oleo', ver: 1 });
  const { spr, h1, TAM, IMG } = V;

  // el Fuerte de San Miguel, pintado en el cerro lejano, entre las nubes arremolinadas (símbolo del lugar)
  V.cielo((c, f, antes) => {
    antes();
    const u = 380, off = (f.cam * .08) % u, base = Math.floor(f.cam * .08 / u);
    c.save(); c.globalAlpha = .6;
    for (let k = -1; k * u - off < VW + u; k++) { const i = base + k; if (h1(i, 2) < .2) continue; spr(c, 'sanmiguel', k * u - off + 120 + h1(i, 5) * 60, 150, { ay: 1, k: 1.25 }); spr(c, 'sanmiguelGarita', k * u - off + 120 + h1(i, 5) * 60 + 56, 142, { ay: 1, k: .9 });
      if (window.LUGARES_CAMPECHE) window.LUGARES_CAMPECHE.dib(c, 'sanJose', k * u - off + 120 + h1(i, 5) * 60 + 200, 160, { w: 104, alfa: 1, filtro: 'brightness(.95) saturate(.85) hue-rotate(185deg) contrast(1.1)' }); }
    c.restore();
    c.restore();
  });
  V.terreno((ctx, f) => {
    for (const r of L.tops) for (let x = r.x0 + 10; x < r.x1 - 10; x += 20 + h1(x | 0, r.y) * 36) if (h1(x | 0, 71) > .5) spr(ctx, ['trigo2', 'trigo1', 'roca2', 'trigo2'][Math.floor(h1(x | 0, 72) * 4)], x, r.y + 1.2, { voltea: h1(x | 0, 73) < .5 });
    for (const o of L.deco) {
      const x = o.x, y = o.y + 1.5, v = h1(o.i, 7);
      if (o.k === 'T') spr(ctx, ['ceiba0', 'ceiba1'][o.i % 2], x, y, { voltea: v < .5 });
      else if (o.k === 'f') spr(ctx, ['girasoles1', 'trigo0', 'girasoles0', 'girasoles2'][o.i % 4], x, y, { voltea: v < .5 });
      else if (o.k === 'r') spr(ctx, ['roca0', 'roca1'][o.i % 2], x, y, { voltea: v < .5 });
    }
  });

  // ---------------- discos y lunas ----------------
  V.look('swirlplat', (c, pl) => {
    const n = 'disco' + Math.floor(h1(Math.round(pl.x0 ?? pl.x), 6) * 3), t = TAM[n];
    spr(c, n, pl.x + pl.w / 2, pl.y - .4, { ay: t.cubierta || .3, w: pl.w + 6 });
  }, 'disco0');
  V.look('luna', (c, pl, f) => {
    const cx = pl.x + pl.w / 2, y = pl.y, n = 'luna' + Math.floor(h1(Math.round(pl.x0 ?? pl.x), 8) * 2), t = TAM[n];
    c.strokeStyle = 'rgba(248,226,122,.75)'; c.lineWidth = .7; c.setLineDash([1.6, 1.2]); c.beginPath(); c.moveTo(pl.px, pl.py); c.lineTo(cx, y - 6); c.stroke(); c.setLineDash([]);
    c.save(); c.translate(pl.px, pl.py); c.rotate(f.t * .8); c.strokeStyle = 'rgba(248,226,122,.5)'; c.lineWidth = .8; c.beginPath(); c.arc(0, 0, 5, 0, 4.4); c.stroke(); c.restore();
    spr(c, 'estrella', pl.px, pl.py, { ay: .5 });
    c.save(); c.translate(cx, y); c.rotate(pl.ang * .5); spr(c, n, 0, -.4, { ay: t.cubierta || .3, w: pl.w + 8 }); c.restore();
  }, 'luna0');

  // ---------------- el remolino de Fresita ----------------
  V.zona('orbita', (ctx, z, f) => {
    const a = Math.min(1, z.life) * (z.cap ? 1 : .85), giro = f.t * (z.cap ? 5 : 2), d = z.r * 2.3;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(z.cx, z.cy); ctx.rotate(-giro); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(IMG.espiral, -d / 2, -d / 2 * TAM.espiral.h / TAM.espiral.w, d, d * TAM.espiral.h / TAM.espiral.w);
    ctx.restore();
    ctx.fillStyle = `rgba(255,250,230,${.9 * a})`; ctx.beginPath(); ctx.arc(z.cx, z.cy, 1.6, 0, TAU); ctx.fill();
  }, 'espiral');

  // ---------------- búho, girasol, cuervo y murciélago ----------------
  const ALAS = [0, 1, 2, 1, 0, 3, 4, 5, 4, 3];
  V.fd('buho', (c, e, t, s, antes) => {
    // El fotograma cerrado es una pose de sueño estable; no delegar al
    // dibujante base, que sigue moviendo las alas mientras e.anim avanza.
    if (e.st === 'sleep') { spr(c, 'buho6', 0, 1, { ay: .85 }); return; }
    if (antes) return antes(c, e, t, s);
    const n = e.st === 'dive' || (e.vy || 0) > 40 ? 7 : ALAS[Math.floor(t * 10 + (e.anim || 0)) % ALAS.length];
    spr(c, 'buho' + n, 0, 1, { ay: .85 });
  }, 'buho0');
  V.fd('girasol', (c, e, t, s, antes) => {
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('girasol');
    if (hoja?.complete && hoja.naturalWidth) return antes(c, e, t, s);
    const n = e.tt > 2.35 ? 'girasolEscupe' : e.carga > 0 ? 'girasol' + (e.carga > .5 ? 4 : 3) : 'girasol' + [0, 1, 2, 1][Math.floor(t * 2) % 4];
    spr(c, n, 0, .8);
  }, 'girasol0');
  if (MEC.OBJ.bala && MEC.OBJ.bala.dibujos.semilla) {
    const antes = MEC.OBJ.bala.dibujos.semilla;
    MEC.OBJ.bala.dibujos.semilla = (c, o, f) => {
      if (!V.activo() || !V.listo('semilla')) return antes(c, o, f);
      c.save(); c.translate(o.x, o.y); c.rotate(Math.atan2(o.vy, o.vx)); spr(c, 'semilla', -2, 0, { ay: .5, ax: .7 }); c.restore();
    };
  }
  V.fd('cuervo', (c, e, t, s, antes) => {
    if (e.st === 'gone') { spr(c, 'cuervo8', 0, 1, { ay: .8 }); return; }
    if (e.st === 'sleep') { spr(c, 'cuervo0', 0, 1, { ay: .8 }); return; }
    antes(c, e, t, s);
  }, 'cuervo0');
  V.fd('murcielago', (c, e, t, s, antes) => {
    if (e.st === 'sleep') { spr(c, 'murcielago6', 0, 1, { ay: .8 }); return; }
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('murcielago');
    if (hoja?.complete && hoja.naturalWidth) { antes(c, e, t, s); return; }
    const n = [0, 1, 2, 1, 0, 3, 4, 5][Math.floor(t * 12 + (e.anim || 0)) % 8];
    spr(c, 'murcielago' + n, 0, 1, { ay: .8 });
  }, 'murcielago0');

  V.moneda('canistel'); V.corazon('corazon'); V.meta('salida', { dy: 1.5 });
  window.OLEO_REMOLINOS = V;
})();
