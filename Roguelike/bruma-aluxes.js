'use strict';
// =====================================================================
//  ALUXES EN LA NIEBLA, CON SUS ASSETS (estilo bruma en blanco y negro)
//  El telón de bosque con niebla y el piso negro en silueta se quedan.
//  Lo de enfrente usa las piezas a lápiz de tools/bruma-aluxes.py
//  (Roguelike/assets/aluxes, 6 px por unidad):
//    · piedras flotantes que revela el faro: la piedra oscura se funde con
//      la piedra alumbrada según su brillo (pl.glow), como antes;
//    · alux, nahual (gato de niebla; de piedra cuando lo alumbran),
//      la cabeza del bejuco (el tallo lo sigue dibujando el juego porque
//      crece) y la calaverita de Pomuch;
//    · ceibas, árboles, raíces, helechos y rocas oscurecidos (siluetas con
//      textura) sobre el piso; canistel, corazón y el cenote como salida.
//  Nada cambia colisiones ni mecánicas. Solo aplica a «Aluxes en la niebla».
// =====================================================================
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.bruma) return;
  const V = vestirNivel({ id: 'bruma', carpeta: 'aluxes', ver: 1, manifiesto: window.ALUXES_MANIFIESTO });
  const { spr, h1, TAM } = V;

  // telón: nieblas que pasan, farolitos de aluxes que van y vienen (único toque cálido) y ojos del bosque
  V.cielo((c, f, antes) => {
    antes();
    const t = f.t;
    for (let b = 0; b < 3; b++) {                                         // bancos de niebla que se arrastran
      const w = VW + 260, x = ((b * 190 - f.cam * (.06 + b * .03) - t * (3 + b * 2)) % w + w) % w - 130, y = 120 + b * 28;
      const g = c.createRadialGradient(x, y, 4, x, y, 90); g.addColorStop(0, 'rgba(230,232,235,' + (.16 - b * .03) + ')'); g.addColorStop(1, 'rgba(230,232,235,0)');
      c.save(); c.translate(0, y); c.scale(1, .28); c.translate(0, -y); c.fillStyle = g; c.beginPath(); c.arc(x, y, 90, 0, 6.2832); c.fill(); c.restore();
    }
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) {                                         // farolitos de los aluxes
      const w = VW + 80, x = ((h1(i, 61) * w * 1.4 - f.cam * (.1 + (i % 3) * .05) + Math.sin(t * .6 + i * 2) * 14) % w + w) % w - 40, y = 70 + h1(i, 62) * 110 + Math.sin(t * .9 + i * 3) * 6;
      const a = .55 + .35 * Math.sin(t * 3.1 + i * 5);
      const g = c.createRadialGradient(x, y, 0, x, y, 12); g.addColorStop(0, 'rgba(255,214,130,' + a + ')'); g.addColorStop(1, 'rgba(255,190,90,0)');
      c.fillStyle = g; c.beginPath(); c.arc(x, y, 12, 0, 6.2832); c.fill(); c.fillStyle = 'rgba(255,244,210,' + a + ')'; c.fillRect(x - .7, y - .7, 1.4, 1.4);
    }
    c.restore();
    for (let i = 0; i < 5; i++) {                                         // pares de ojos que se abren y se cierran entre la niebla
      const cyc = 7 + i * 1.7, tt = (t + i * 3.3) % cyc, n = Math.floor((t + i * 3.3) / cyc);
      if (tt > 1.4) continue;
      const a = Math.sin(tt / 1.4 * Math.PI), x = ((h1(n * 5 + i, 66) * (VW + 60) - f.cam * .14) % (VW + 60) + VW + 60) % (VW + 60) - 30, y = 90 + h1(n * 5 + i, 67) * 70;
      c.fillStyle = 'rgba(255,240,200,' + a * .85 + ')'; c.fillRect(x - 3, y, 1.6, 1 + a); c.fillRect(x + 1.4, y, 1.6, 1 + a);
    }
  });
  // Panorama ilustrado para el nivel principal. Las versiones de subida,
  // bajada y el paseo de ánimas conservan sus propios fondos.
  const bosqueChenes = new Image();
  bosqueChenes.decoding = 'async';
  bosqueChenes.src = '../Roguelike/assets/aluxes/fondo-selva-chenes-ilustrado-v1.png';
  const cieloAnterior = V.ST.sky;
  V.ST.sky = function (c, f) {
    const nivel = f && f.g && f.g.def && f.g.def.id;
    if (nivel !== 'bruma' || window.estiloArteDerivado || !bosqueChenes.complete || !bosqueChenes.naturalWidth)
      return cieloAnterior.call(this, c, f);
    const im = bosqueChenes, ancho = Math.min(im.naturalWidth, im.naturalHeight * VW / VH);
    const margen = Math.max(0, im.naturalWidth - ancho), periodo = margen * 2;
    const avance = periodo ? ((f.cam * .12 % periodo) + periodo) % periodo : 0;
    const x = avance <= margen ? avance : periodo - avance;
    c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.drawImage(im, x, 0, ancho, im.naturalHeight, 0, 0, VW, VH);
    // Una neblina blanca aclara solo el telón: personajes y peligros
    // se dibujan después y conservan todo su contraste.
    c.fillStyle = 'rgba(255,255,255,.58)'; c.fillRect(0, 0, VW, VH);
    c.restore();
  };
  const aluxCaminarForge = Array.from({ length: 4 }, (_, i) => {
    const img = new Image(); img.decoding = 'async';
    img.src = '../Roguelike/assets/forge/aluxes/alux-clips-v1/frames/frame-0' + i + '.png';
    return img;
  });
  const nahualCaminarForge = Array.from({ length: 5 }, (_, i) => {
    const img = new Image(); img.decoding = 'async';
    img.src = '../Roguelike/assets/forge/aluxes/nahual-clips-v1/frames/frame-0' + i + '.png';
    return img;
  });
  window.ALUX_FORGE = { caminar: aluxCaminarForge, nahual: nahualCaminarForge };

  V.terreno((ctx, f) => {
    for (const r of L.tops) for (let x = r.x0 + 12; x < r.x1 - 12; x += 26 + h1(x | 0, r.y) * 44) if (h1(x | 0, 41) > .6) spr(ctx, ['helecho-sombra', 'planta-sombra', 'raiz1-sombra'][Math.floor(h1(x | 0, 42) * 3)], x, r.y + 1.5, { voltea: h1(x | 0, 43) < .5 });
    for (const o of L.deco) {
      const x = o.x, y = o.y + 2, v = h1(o.i, 7);
      if (o.k === 'T') spr(ctx, ['ceiba0', 'arbol0', 'ceiba1', 'arbol1', 'ceiba2', 'arbol2'][o.i % 6] + '-sombra', x, y, { voltea: v < .5 });
      else if (o.k === 'f') spr(ctx, ['helecho-sombra', 'planta-sombra'][o.i % 2], x, y, { voltea: v < .5 });
      else if (o.k === 'r') spr(ctx, ['raiz0-sombra', 'roca2-sombra', 'raiz1-sombra'][o.i % 3], x, y, { voltea: v < .5 });
    }
  });

  // Recursos del nivel principal cargados directamente: también funcionan
  // cuando el juego se abre como archivo local y fetch() no está disponible.
  const imagenDirecta = nombre => { const im = new Image(); im.decoding = 'async'; im.onload = () => V.rehaz(); im.src = '../Roguelike/assets/aluxes/' + nombre + '.png'; return im; };
  const sueloIlustrado = imagenDirecta('suelo-bosque-ilustrado-v1');
  const arbolIlustrado = imagenDirecta('arbol-seco-ilustrado-v1');
  const senalIlustrada = imagenDirecta('senal-bosque-ilustrada-v1');
  const hierbaIlustrada = imagenDirecta('hierba-bosque-ilustrada-v1');
  const espejoIlustrado = imagenDirecta('espejo-obsidiana-ilustrado-v1');
  const piedrasDirectas = [imagenDirecta('piedra0'), imagenDirecta('piedra1')];
  const canistelDirecto = imagenDirecta('canistel');
  const disponible = im => im.complete && im.naturalWidth > 0;
  const brumaPrincipal = f => !!(f && f.g && f.g.def && f.g.def.id === 'bruma' && !window.estiloArteDerivado);
  const efectoOscuroPrevio = V.ST.over;
  V.ST.over = function (c, f) {
    if (brumaPrincipal(f)) return; // La viñeta negra anterior restaba contraste a los enemigos.
    if (efectoOscuroPrevio) return efectoOscuroPrevio.apply(this, arguments);
  };
  const terrenoPrevio = V.ST.terrain;
  V.ST.terrain = function (c, f) {
    const principal = typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id === 'bruma' && !window.estiloArteDerivado;
    if (!principal || !disponible(sueloIlustrado)) return terrenoPrevio.call(this, c, f);
    c.save(); allLoopsPath(c, L.loops, 2); c.clip();
    const lado = 64, ancho = L.ww || VW, alto = (L.wh || VH) + lado;
    for (let x = 0; x < ancho + lado; x += lado) for (let y = 0; y < alto; y += lado) c.drawImage(sueloIlustrado, x, y, lado + .1, lado + .1);
    c.restore();
    if (disponible(hierbaIlustrada)) for (const t of L.tops) {
      const ancho = t.x1 - t.x0; if (ancho <= 0) continue;
      c.save(); c.beginPath(); c.rect(t.x0, t.y - 7, ancho, 9); c.clip();
      for (let x = t.x0; x < t.x1; x += 80) c.drawImage(hierbaIlustrada, 0, 550, 2172, 150, x, t.y - 5, 80, 6);
      c.restore();
    }
    for (const o of L.deco) {
      const t = L.tops.find(q => Math.abs(q.y - o.y) < 3 && o.x >= q.x0 && o.x <= q.x1); if (!t) continue;
      let im, w, sx, sy, sw, sh;
      if (o.k === 'T') { im = arbolIlustrado; w = 46; [sx, sy, sw, sh] = [130, 13, 1302, 991]; }
      else if (o.k === 'r') { im = senalIlustrada; w = 15; [sx, sy, sw, sh] = [300, 65, 725, 1050]; }
      else continue;
      if (!disponible(im) || t.x1 - t.x0 < w) continue;
      const h = w * sh / sw, x = Math.max(t.x0, Math.min(o.x - w / 2, t.x1 - w));
      if (L.tops.some(q => q !== t && q.y < t.y && q.y > t.y - h && q.x1 > x && q.x0 < x + w)) continue;
      c.drawImage(im, sx, sy, sw, sh, x, t.y - h + .5, w, h);
    }
  };

  // ---------------- piedras que revela el faro ----------------
  V.look('fogstone', (c, pl, f, sk) => {
    const v = Math.floor(h1(Math.round(pl.x0 ?? pl.x), 3) * 2), t = TAM['piedra' + v];
    const o = { ay: t.cubierta || .3, w: pl.w + 6, voltea: h1(Math.round(pl.x0 ?? pl.x), 4) < .5 };
    // El negro indica de inmediato que la plataforma tiene colisión.
    c.save(); c.globalAlpha *= pl.on ? .95 : pl.alta ? .42 : .18;
    if (pl.on) c.filter = 'brightness(0)';
    spr(c, 'piedra' + v, pl.x + pl.w / 2, pl.y - .4, o);
    c.restore();
  }, 'piedra0');
  const piedraPrevia = MEC.LOOK.fogstone;
  MEC.LOOK.fogstone = function (c, pl, f, sk) {
    if (!brumaPrincipal(f)) return piedraPrevia && piedraPrevia.apply(this, arguments);
    const im = piedrasDirectas[Math.abs(Math.floor((pl.x0 ?? pl.x) / 48)) % 2];
    if (!disponible(im)) return piedraPrevia && piedraPrevia.apply(this, arguments);
    const w = pl.w, h = w * im.naturalHeight / im.naturalWidth;
    let tramos = [[pl.x, pl.x + w]];
    const recortar = (a, b) => { tramos = tramos.flatMap(([x0, x1]) => b <= x0 || a >= x1 ? [[x0, x1]] : [[x0, Math.min(a, x1)], [Math.max(b, x0), x1]].filter(([l, r]) => r - l > .1)); };
    // Si una pieza generada coincide con piso o con otra piedra al mismo
    // nivel, no pintar dos superficies una encima de otra; la física no cambia.
    for (let x = Math.floor(pl.x / T) * T; x < pl.x + w; x += T)
      if (L.solid(Math.floor(x / T), Math.floor((pl.y + 1) / T))) recortar(x, x + T);
    const piezas = (f.g && f.g.plats) || [], indice = piezas.indexOf(pl);
    if (indice >= 0) for (const otra of piezas.slice(0, indice))
      if (otra.look === 'fogstone' && !otra.dead && Math.abs(otra.y - pl.y) < 3) recortar(otra.x, otra.x + otra.w);
    if (!tramos.length) return;
    c.save(); c.globalAlpha *= pl.on ? .95 : pl.alta ? .42 : .18; c.beginPath();
    for (const [x0, x1] of tramos) c.rect(x0, pl.y - 2, x1 - x0, h + 3);
    c.clip(); c.drawImage(im, pl.x, pl.y - 1, w, h); c.restore();
  };

  if (typeof GANCHOS !== 'undefined') GANCHOS.en('monedaItzel', anterior => function (c, x, y, t, f, especial) {
    if (especial || !brumaPrincipal(f) || !disponible(canistelDirecto)) return anterior.apply(this, arguments);
    const h = 10, w = h * canistelDirecto.naturalWidth / canistelDirecto.naturalHeight;
    c.drawImage(canistelDirecto, x - w / 2, y + Math.sin(t * 2.5 + x * .04) * 1.4 - h / 2, w, h);
  });

  if (MEC.OBJ.obsidiana) {
    const espejoPrevio = MEC.OBJ.obsidiana.draw;
    MEC.OBJ.obsidiana.draw = function (c, o, f) {
      if (!brumaPrincipal(f) || !disponible(espejoIlustrado)) return espejoPrevio.apply(this, arguments);
      const fin = Math.min(1, o.carga * 1.5);
      if (o.carga > 0) {
        c.save(); c.globalCompositeOperation = 'lighter';
        const g = c.createRadialGradient(o.x, o.cy, 3, o.x, o.cy, 150);
        g.addColorStop(0, `rgba(230,215,255,${.5 * fin})`); g.addColorStop(1, 'rgba(230,215,255,0)');
        c.fillStyle = g; c.beginPath(); c.moveTo(o.x, o.cy); c.arc(o.x, o.cy, 150, o.ang - .26, o.ang + .26); c.closePath(); c.fill(); c.restore();
      }
      const h = 25, w = h * 625 / 1187;
      c.drawImage(espejoIlustrado, 246, 75, 625, 1187, o.x - w / 2, o.y - h, w, h);
      if (o.carga > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, o.x, o.cy, 10, '#d8c8ff', .5 * fin); c.restore(); }
    };
  }

  // ---------------- alux, nahual, bejuco y calaverita ----------------
  // los bichos de este nivel se veían muy chicos junto a Itzel: se dibujan más grandes (y sus cajas de golpe crecen en mundos-ampliados2.js)
  const grande = (k, fn) => (c, e, t, s, antes) => { c.save(); c.scale(k, k); try { return fn(c, e, t, s, antes); } finally { c.restore(); } };
  V.fd('alux', grande(1, (c, e, t, s, antes) => {
    if (e.st !== 'sleep') {
      if (Math.abs(e.vx || 0) > 3 && (e.fade ?? 1) >= .98 && (e.tt ?? 1) >= .3) {
        const paso = Math.floor((e.anim || t) * 8) % 4, img = aluxCaminarForge[paso];
        if (img.complete && img.naturalWidth) { c.drawImage(img, -31 / 6, .6 - 91 / 6, 67 / 6, 92 / 6); return; }
      }
      return antes(c, e, t, s);
    }
    const n = e.aturde > 0 ? 6 : e.st === 'sleep' ? 0 : Math.floor(t * 1.5) % 4 === 3 ? 1 : 0;
    spr(c, 'alux' + n, 0, .6);
  }), 'alux0');
  V.fd('nahual', grande(1, (c, e, t) => {
    if (e.piedra) { spr(c, 'nahualPiedra', 0, .6, { voltea: true }); return; }
    const anda = Math.abs(e.vx || 0) > 2 || e.st === 'ok';
    if (anda) {
      const img = nahualCaminarForge[Math.floor(((e.anim ?? t) * 60) / 8) % 5];
      if (img.complete && img.naturalWidth) {
        c.save(); c.globalAlpha *= .92; c.scale(-1, 1);
        c.drawImage(img, -56 / 6, .6 - 99 / 6, 109 / 6, 100 / 6); c.restore(); return;
      }
    }
    spr(c, 'nahual' + (anda ? 1 + Math.floor(((e.anim ?? t) * 60) / 8) % 5 : 0), 0, .6, { alfa: .92, voltea: true });
  }), 'nahual0');
  V.fd('bejuco', grande(1, (c, e, t, s, antes) => {
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('bejuco');
    const n = e.baja ? 2 : e.luz ? 0 : 1, sw = Math.sin(t * 3 + (e.hx || 0)) * .2;
    c.save(); c.rotate(sw);
    if (hoja?.complete && hoja.naturalWidth && e.st !== 'gone') { antes(c, e, t, s); c.restore(); return; }
    spr(c, 'bejuco' + n, 0, 1); c.restore();
  }), 'bejuco0');
  V.fd('calavera', grande(1, (c, e, t, s, antes) => {
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('calavera');
    if (e.st !== 'sleep' && hoja?.complete && hoja.naturalWidth) { antes(c, e, t, s); return; }
    const aire = Math.abs(e.vy || 0) > 1, n = e.st === 'sleep' ? 7 : aire ? 2 + Math.floor((e.anim || t) * 10) % 5 : Math.floor(t * 2) % 2;
    spr(c, 'calavera' + n, 0, .6);
  }), 'calavera0');

  // el tallo del bejuco, en grises (antes verde): el mismo trazo del juego
  const FX = window.FOE_ARTE && FOE_ARTE.FX;
  if (FX && FX.bejuco) {
    const tallo = FX.bejuco;
    FX.bejuco = (c, e, t, s, f) => {
      if (!V.activo() || !V.listo('bejuco0')) return tallo(c, e, t, s, f);
      // El tallo parte de encima del borde visible incluso si el bejuco
      // fue generado más abajo o la cámara se mueve verticalmente.
      const len = Math.max(18, (e.y - Math.min((f && f.y0) || 0, 0) + 20) / (e.escala || 1)), sw = Math.sin(t * 3 + e.hx) * 2;
      c.save(); c.lineCap = 'round'; c.strokeStyle = '#1a1a1a'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -len - 4); c.bezierCurveTo(sw, -len * .6, -sw, -len * .3, 0, -8); c.stroke();
      c.strokeStyle = '#7a7a76'; c.lineWidth = 1.1; c.stroke();
      for (let y = -len + 2; y < -10; y += 7) { const d = ((y / 7) | 0) % 2 ? 1 : -1, x = Math.sin((y / len) * 3) * sw * .5; c.fillStyle = '#8a8a86'; c.beginPath(); c.ellipse(x + d * 2.2, y, 2, .9, d * .5, 0, TAU); c.fill(); c.strokeStyle = '#1a1a1a'; c.lineWidth = .3; c.stroke(); }
      c.restore();
    };
  }
  V.moneda('canistel'); V.corazon('corazon'); V.meta('salida', { dy: 3 });
  window.BRUMA_ALUXES = V;
})();
