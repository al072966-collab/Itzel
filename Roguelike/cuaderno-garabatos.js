'use strict';
// =====================================================================
//  GARABATOS DEL CUADERNO, CON SUS ASSETS (estilo cuaderno a lápiz)
//  La libreta rayada y el terreno a grafito se quedan, y las líneas de
//  lápiz de Fresita también (su inclinación es la mecánica). Lo de enfrente
//  usa las piezas de tools/cuaderno-garabatos.py (Roguelike/assets/cuaderno):
//    · la regla de madera (de pie y caída como puente, la misma pieza);
//    · garabato, goma (borra ladeada), sacapuntas (gira y escupe la viruta
//      de la lámina), chapulín y calaverita;
//    · árboles y flores a lápiz, estrellitas; canistel, corazón y la hoja
//      con su puerta de salida.
//  No se usan lápices, gomas ni sacapuntas sueltos (se confundirían con
//  plataformas o con los enemigos), ni la Fresita dibujada ni las flechas.
//  Nada cambia colisiones ni mecánicas. Solo aplica a «Garabatos del cuaderno».
// =====================================================================
(function () {
  // Apagado a pedido de David: el cuaderno se dibuja todo en código (Roguelike/cuaderno-dibujos.js), sin láminas.
  if (true) return;
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.cuaderno) return;
  const V = vestirNivel({ id: 'cuaderno', carpeta: 'cuaderno', ver: 3, manifiesto: window.CUADERNO_GARABATOS_MANIFIESTO });
  const { spr, h1, TAM, IMG } = V;
  const jaguarBoceto = new Image();
  jaguarBoceto.onload = () => V.rehaz(); jaguarBoceto.src = '../Roguelike/assets/cuaderno/jaguar-boceto-v1.png';
  const paisaje = {};
  for (const [n, archivo] of Object.entries({ fondo:'hochob-cuaderno-v1', suelo:'tierra-lapiz-v1' })) {
    const im = paisaje[n] = new Image(); im.onload = () => V.rehaz();
    im.src = '../Roguelike/assets/cuaderno/' + archivo + '.png';
  }
  const principal = f => ((f.g && f.g.def && f.g.def.id) || (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id)) === 'cuaderno';
  // El fondo y el suelo de láminas se apagan: el nivel vuelve al arte de antes (el del mapa de la enciclopedia, dibujado en código)
  const paisajeListo = () => false;

  // los Chenes de Hochob dibujados a lápiz al fondo (fachadas de piedra con mascarones), muy tenues: es el «lugar» de este cuaderno
  V.cielo((c, f, antes) => {
    if (principal(f) && paisajeListo()) {
      const ancho = 650, base = 178 - (f.y0 || 0), alto = f.H || VH, off = ((f.cam * .1 % ancho) + ancho) % ancho;
      const arriba = Math.min(0, base - 178);
      c.save(); c.fillStyle = '#eeeae1'; c.fillRect(0, 0, VW, alto);
      for (let x = -off - ancho; x < VW + ancho; x += ancho) {
        c.drawImage(paisaje.fondo, 0, 0, 1850, 680, x, arriba, ancho, base - arriba);
        c.drawImage(paisaje.fondo, 0, 708, 1850, 16, x, base, ancho, Math.max(1, alto - base));
      }
      c.restore(); return;
    }
    antes();
    // (quitadas las fachadas de Hochob a lápiz del fondo: no pintaban nada en el cuaderno)
  });
  // garabatos que se dibujan solos a lápiz (espiral, estrella, flor, jaguarcito) y migajas de goma que caen
  function trazo(c, tipo, x, y, u) {
    const N = 60, n = Math.floor(N * Math.min(1, u)), pts = [];
    for (let i = 0; i <= N; i++) {
      const k = i / N;
      if (tipo === 0) { const a = k * 6.2832 * 3, r = 2 + k * 14; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
      else if (tipo === 1) { const a = (k * 2 * 5 % 5) / 5 * 6.2832 * 2 - 1.57, q = Math.floor(k * 5); pts.push([x + Math.cos((q * 2 % 5 + (k * 5 - q)) * 1.2566 - 1.57) * 14, y + Math.sin((q * 2 % 5 + (k * 5 - q)) * 1.2566 - 1.57) * 14]); }
      else { const a = k * 6.2832, r = 8 + Math.sin(a * 5) * 6; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
    }
    c.beginPath(); for (let i = 0; i <= n; i++) i ? c.lineTo(pts[i][0], pts[i][1]) : c.moveTo(pts[i][0], pts[i][1]); c.stroke();
  }
  V.cielo((c, f, antes) => {
    antes();
    const t = f.t;
    c.save(); c.strokeStyle = '#4a4a56'; c.lineWidth = .8; c.lineCap = 'round'; c.lineJoin = 'round';
    for (let i = 0; i < 4; i++) {
      const per = 10, T = (t + i * 2.5) % per, n = Math.floor((t + i * 2.5) / per), u = T / 4, al = T > 8 ? 1 - (T - 8) / 2 : 1;
      const w = VW + 60, x = ((h1(n * 4 + i, 81) * w - f.cam * .12) % w + w) % w - 30, y = 30 + h1(n * 4 + i, 82) * 90;
      c.globalAlpha = .55 * al;
      if (principal(f) && jaguarBoceto.complete && jaguarBoceto.naturalWidth && V.listo('flor0') && V.listo('estrella0')) {
        // Revelar cada dibujo sin alterar el papel ni señalar superficies.
        c.save(); c.beginPath(); c.rect(x - 15, y - 13, 30 * Math.min(1, u), 26); c.clip();
        const tipo = (n + i) % 3;
        if (tipo === 0) c.drawImage(jaguarBoceto, 377, 174, 791, 655, x - 14, y - 11, 28, 22);
        else spr(c, tipo === 1 ? 'estrella0' : 'flor0', x, y, { ay: .5, w: 17 });
        c.restore();
      } else trazo(c, (n + i) % 3, x, y, u);
    }
    c.restore();
    c.save(); c.fillStyle = '#e8a0b0';
    for (let i = 0; i < 8; i++) {                                         // migajas de goma
      const w = VW + 40, x = ((h1(i, 91) * w - f.cam * .2) % w + w) % w - 20, y = ((h1(i, 92) * 200 + t * (6 + h1(i, 93) * 6)) % 200), r = t * 3 + i;
      c.globalAlpha = .6 * Math.sin(Math.PI * y / 200); c.save(); c.translate(x, y); c.rotate(r); c.fillRect(-1.2, -.8, 2.4, 1.6); c.restore();
    }
    c.restore();
  });
  let tierra = null;
  V.terreno((ctx, f) => {
    if (principal(f) && paisajeListo()) {
      if (!tierra) { tierra = ctx.createPattern(paisaje.suelo, 'repeat'); tierra.setTransform(new DOMMatrix().scale(500 / paisaje.suelo.naturalWidth)); }
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip(); ctx.fillStyle = tierra;
      for (const r of L.tops) ctx.fillRect(r.x0, r.y + 8, r.x1 - r.x0, VH + 40);
      ctx.restore();
    }
    for (const r of L.tops) for (let x = r.x0 + 14; x < r.x1 - 14; x += 34 + h1(x | 0, r.y) * 50) if (h1(x | 0, 91) > .65) spr(ctx, ['flor0', 'flor1', 'estrella0', 'estrella1'][Math.floor(h1(x | 0, 92) * 4)], x, r.y + .8, { voltea: h1(x | 0, 93) < .5 });
    for (const o of L.deco) {
      const x = o.x, y = o.y + 1, v = h1(o.i, 7);
      if (o.k === 'T') spr(ctx, ['arbol0', 'arbol1'][o.i % 2], x, y, { voltea: v < .5 });
      else if (o.k === 'f') spr(ctx, ['flor0', 'flor1'][o.i % 2], x, y, { voltea: v < .5 });
      else if (o.k === 'r') spr(ctx, 'estrella' + (o.i % 3), x, y);
    }
  });

  // ---------------- la regla ----------------
  V.obj('regla', (c, o) => {
    const L2 = o.n * T, sh = o.tiembla ? (Math.random() - .5) * .8 : 0;
    c.save(); c.translate(o.px + sh, o.fase === 'puente' ? o.base - 2 : o.base); c.rotate(o.dir * (o.fase === 'puente' ? Math.PI / 2 : o.ang));
    c.rotate(-Math.PI / 2); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.drawImage(IMG.regla, 0, -4, L2, 8);                      // a lo largo de la regla, 8 de grueso como su colisión
    c.restore();
  }, 'regla');
  V.obj('viruta', (c, o) => { c.save(); c.translate(o.x, o.y); c.rotate(o.rot); spr(c, 'viruta', 0, 0, { ay: .5 }); c.restore(); }, 'viruta');

  // ---------------- garabato, goma, sacapuntas, chapulín y calaverita ----------------
  V.fd('garabato', (c, e, t) => {
    const anim = e.anim ?? t, aire = Math.abs(e.vy || 0) > 1, n = e.st === 'sleep' ? 0 : aire ? [0, 2][Math.floor(anim * 6) % 2] : 4 + Math.floor(anim * 9) % 7;
    spr(c, 'garabato' + n, 0, .8);
  }, 'garabato0');
  V.fd('goma', (c, e, t, s, antes) => {
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('goma');
    if (hoja?.complete && hoja.naturalWidth) return antes(c, e, t, s);
    const n = e.borra ? 4 + Math.floor(t * 10) % 4 : Math.abs(e.vy || 0) > 1 ? 4 : Math.floor((e.anim || t) * 6) % 4;
    spr(c, 'goma' + n, 0, .8);
  }, 'goma0');
  V.fd('sacapuntas', (c, e, t) => {
    const n = e.tt > 2.2 ? 9 : e.carga ? 6 + Math.floor(t * 12) % 3 : 1 + Math.floor(t * 4) % 5;
    spr(c, 'sacapuntas' + n, 0, .8);
  }, 'sacapuntas0');
  V.fd('chapulin', (c, e, t, s, antes) => {
    if (e.st === 'sleep') return V.dormido(c, 'chapulin3', t, .8);
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('chapulin');
    if (hoja?.complete && hoja.naturalWidth) return antes(c, e, t, s);
    const anim = e.anim ?? t;
    const n = (e.vy || 0) < -1 ? 6 : (e.vy || 0) > 1 ? 7 : Math.floor(anim * 5) % 4;
    spr(c, 'chapulin' + n, 0, .8);
  }, 'chapulin0');
  V.fd('calavera', (c, e, t, s, antes) => {
    if (e.st === 'sleep') return V.dormido(c, 'calavera7', t, .8);
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('calavera');
    if (hoja?.complete && hoja.naturalWidth) return antes(c, e, t, s);
    const anim = e.anim ?? t;
    const n = Math.abs(e.vy || 0) > 1 ? 2 + Math.floor(anim * 8) % 3 : [0, 5][Math.floor(anim * 2) % 2];
    spr(c, 'calavera' + n, 0, .8);
  }, 'calavera0');

  V.moneda('canistel'); V.corazon('corazon'); V.meta('salida', { dy: 1.5 });
  window.CUADERNO_GARABATOS = V;
})();
