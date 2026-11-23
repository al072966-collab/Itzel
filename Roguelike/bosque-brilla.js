'use strict';
// =====================================================================
//  EL BOSQUE QUE BRILLA, CON SUS ASSETS
//  El telón sigue siendo el bosque dibujado de antes (capas de árboles,
//  niebla, rayos y luciérnagas); se le agregan, también dibujados e
//  inspirados en el panorama, los rayos que bajan de la luna, y el
//  dosel de arriba: hojas oscuras, lianas que cuelgan y flores blancas que
//  brillan. Lo de enfrente usa los assets de tools/bosque-brilla.py
//  (Roguelike/assets/bosque, 3 px por unidad, con su resplendor):
//    · el terreno de siempre, con árboles, helechos, hongos, rocas, raíces
//      en las orillas y lianas colgando de los techos;
//    · los hongos que rebotan (quieto, aplastado y estirado), el hongo que
//      crece con la luz y los caminos de luz (apagado y encendido);
//    · cocuyo (vuela y, aturdido por el destello, se posa), polilla
//      (aleteo y huida) y esporín en rosa (el color del peligro) con su
//      nube; canistel, corazón y el portal de salida.
//  Nada de esto cambia colisiones ni mecánicas. Solo aplica al estilo
//  «biolum»; si una imagen no ha cargado, se pinta lo de antes.
// =====================================================================
(function () {
  if (typeof STYLE_MAP === 'undefined' || !STYLE_MAP.biolum || typeof MEC === 'undefined') return;
  const { LOOK, FD } = MEC, ST = STYLE_MAP.biolum, RUTA = '../Roguelike/assets/bosque/';
  const TAM = {}, IMG = {};
  const listo = n => { const im = IMG[n]; return !!(im && im.complete && im.naturalWidth && TAM[n]); };
  let faltan = 1;
  (window.BOSQUE_MANIFIESTO ? Promise.resolve(window.BOSQUE_MANIFIESTO) : fetch(RUTA + 'bosque.json?v=6').then(r => r.json())).then(m => {
    Object.assign(TAM, m); faltan = Object.keys(m).length;
    for (const n of Object.keys(m)) { const im = new Image(); im.decoding = 'async'; im.onload = im.onerror = () => { if (--faltan === 0) rehaz(); }; im.src = RUTA + n + '.png?v=6'; IMG[n] = im; }
  }).catch(() => { faltan = -1; });
  function rehaz() { if (typeof CACHE !== 'undefined') for (const k of [...CACHE.keys()]) if (k.startsWith('biolum@')) CACHE.delete(k); }

  let ACTIVO = false;
  const esBosque = st => !!st && st.id === 'biolum' && !window.estiloArteDerivado;
  if (typeof renderScene === 'function') {
    GANCHOS.en('renderScene', antes => function (ctx, st) { const a = ACTIVO; ACTIVO = esBosque(st); try { return antes.apply(this, arguments); } finally { ACTIVO = a; } });
  }
  function spr(c, n, x, y, o = {}) {
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';   // las piezas vienen a 6 px por unidad: que se reduzcan bien
    const t = TAM[n], w = t.w * (o.k || 1) * (o.kx || 1), h = t.h * (o.k || 1) * (o.ky || 1), ax = o.ax ?? .5, ay = o.ay ?? 1;
    if (!o.voltea) { c.drawImage(IMG[n], x - w * ax, y - h * ay, w, h); return; }
    c.save(); c.translate(x, y); c.scale(-1, 1); c.drawImage(IMG[n], -w * ax, -h * ay, w, h); c.restore();
  }
  const h1 = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

  const FONDO_BOSQUE = {};
  for (const [n, archivo] of Object.entries({ fondo:'manglar-nocturno-v1', dosel:'dosel-brillante-v1', tierra:'tierra-brillante-v1', borde:'borde-brillante-v1' })) {
    const im = FONDO_BOSQUE[n] = new Image(); im.decoding = 'async'; im.onload = rehaz; im.src = RUTA + archivo + '.png';
  }
  // el fondo ilustrado va en el nivel y también en su subida y su bajada (niveles-verticales.js); antes solo salía en el principal y las otras se veían con el telón viejo
  const bosquePrincipal = f => /^((subida|bajada)_)?biolum$/.test(String((f && f.g && f.g.def && f.g.def.id) || (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id) || ''));
  const cargada = im => !!(im && im.complete && im.naturalWidth);
  // el cielo ilustrado solo necesita su fondo y su dosel; el terreno, su tierra y su borde: cada uno sale en cuanto llegan SUS imágenes
  // (antes, si una de las cuatro tardaba o fallaba, todo el nivel se quedaba con el dibujo viejo)
  const bosqueFondoListo = () => cargada(FONDO_BOSQUE.fondo) && cargada(FONDO_BOSQUE.dosel);
  const bosqueTierraLista = () => cargada(FONDO_BOSQUE.tierra) && cargada(FONDO_BOSQUE.borde);
  function bosqueIlustrado(c, f) {
    const im=FONDO_BOSQUE.fondo,H=f.H||VH,sw=Math.min(im.naturalWidth,im.naturalHeight*VW/H),max=Math.max(0,im.naturalWidth-sw);
    const sx=max*(.5+.3*Math.sin((f.cam||0)*.0007)); c.save(); c.imageSmoothingEnabled=true; c.imageSmoothingQuality='high';
    c.drawImage(im,sx,0,sw,im.naturalHeight,0,0,VW,H);
    const w=540,h=78,off=(((f.cam||0)*.35)%w+w)%w;
    for(let x=-off-w;x<VW+w;x+=w) c.drawImage(FONDO_BOSQUE.dosel,0,0,2172,315,x,0,w,h);
    c.restore();
  }
  // ---------------- el telón: el bosque de antes, con luna y dosel ----------------
  function dosel(x, f, w) {
    // hojas oscuras arriba, lianas que cuelgan y flores blancas que brillan
    x.fillStyle = '#04141a';
    x.beginPath(); x.moveTo(-4, -4);
    for (let xx = -4; xx <= w + 4; xx += 3) x.lineTo(xx, 8 + fbm1(xx * .02, 31, 3) * 22 + Math.max(0, Math.sin(xx * .006 + 1)) * 14);
    x.lineTo(w + 4, -4); x.closePath(); x.fill();
    for (let k = 0; k < w / 7; k++) { const px = k * 7 + h1(k, 32) * 6, py = 10 + fbm1(px * .02, 31, 3) * 22 + h1(k, 33) * 10; x.save(); x.translate(px, py); x.rotate(h1(k, 34) * 2 - 1); x.fillStyle = h1(k, 35) < .5 ? '#0a2a2c' : '#0d3a36'; x.beginPath(); x.ellipse(0, 0, 5 + h1(k, 36) * 3, 2.2, 0, 0, TAU); x.fill(); x.restore(); }
    x.lineCap = 'round';
    for (let k = 0; k * 22 < w; k++) {
      if (h1(k, 37) < .35) continue;
      const px = k * 22 + h1(k, 38) * 14, l = 20 + h1(k, 39) * 60, y0 = 14 + fbm1(px * .02, 31, 3) * 22;
      x.strokeStyle = 'rgba(16,58,52,.95)'; x.lineWidth = .9; x.beginPath(); x.moveTo(px, y0); x.bezierCurveTo(px + 4, y0 + l * .3, px - 4, y0 + l * .7, px + 1, y0 + l); x.stroke();
      for (let j = 0; j < l / 7; j++) { const yy = y0 + j * 7 + 3, xx = px + Math.sin((yy - y0) * .08) * 2.4; x.fillStyle = '#0f4a40'; x.beginPath(); x.ellipse(xx + (j % 2 ? 2 : -2), yy, 2.4, 1.2, j % 2 ? .6 : -.6, 0, TAU); x.fill(); }
    }
    x.globalCompositeOperation = 'lighter';
    for (let k = 0; k < w / 18; k++) { if (h1(k, 40) < .5) continue; const px = h1(k, 41) * w, py = 12 + h1(k, 42) * 30; glowDot(x, px, py, 4, '#e8fff8', .35); x.fillStyle = '#f4fffc'; for (let p = 0; p < 5; p++) { const a = p / 5 * TAU; x.beginPath(); x.ellipse(px + Math.cos(a) * 1.4, py + Math.sin(a) * 1.4, 1.1, .6, a, 0, TAU); x.fill(); } }
    x.globalCompositeOperation = 'source-over';
  }
  const cieloAntes = ST.sky;
  ST.sky = function (ctx, f) {
    if (!esBosque(f.st)) return cieloAntes.call(this, ctx, f);
    const ilustrado = bosquePrincipal(f) && bosqueFondoListo();
    if (ilustrado) bosqueIlustrado(ctx, f); else cieloAntes.call(this, ctx, f);
    // los rayos que bajan de la luna de siempre (fija en la pantalla, en 110, 40) entre los árboles
    const t = f.t;
    if (!ilustrado) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const rayos = cached(f, 'bosqueRayos', VW, VH, x => { x.filter = `blur(${5 * f.S}px)`; for (let k = 0; k < 4; k++) { const g = x.createLinearGradient(0, 40, 0, VH); g.addColorStop(0, 'rgba(170,240,255,.16)'); g.addColorStop(1, 'rgba(170,240,255,0)'); x.fillStyle = g; x.beginPath(); x.moveTo(104 + k * 4, 44); x.lineTo(112 + k * 4, 44); x.lineTo(150 + k * 34 + 30, VH); x.lineTo(150 + k * 34 - 12, VH); x.closePath(); x.fill(); } });
    ctx.globalAlpha = .7 + Math.sin(t * .5) * .3; ctx.drawImage(rayos, 0, 0, VW, VH); ctx.restore();
    strip(ctx, f, 'bosqueDosel', .55, (x, w) => dosel(x, f, w));
    }
    // una ola de luz que recorre el bosque: un frente que avanza y enciende, un instante, todo lo que toca
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const fr = ((t * 38) % (VW + 220)) - 110;
    const og = ctx.createLinearGradient(fr - 70, 0, fr + 70, 0); og.addColorStop(0, 'rgba(90,255,200,0)'); og.addColorStop(.5, 'rgba(90,255,200,.12)'); og.addColorStop(1, 'rgba(90,255,200,0)'); ctx.fillStyle = og; ctx.fillRect(fr - 70, 30, 140, VH - 30);
    // cocuyos con estela: vuelan en curvas y dejan una cola de luz que se apaga
    for (let i = 0; i < 14; i++) {
      const ox = (h1(i, 91) * (VW + 40) - f.cam * (.2 + h1(i, 92) * .2)), oy = 80 + h1(i, 93) * 90;
      for (let q = 7; q >= 0; q--) { const tt = t - q * .06, x2 = ((ox + Math.sin(tt * .9 + i * 2) * 26) % (VW + 40) + VW + 40) % (VW + 40) - 20, y2 = oy + Math.sin(tt * 1.7 + i) * 12; glowDot(ctx, x2, y2, (q ? 1.6 : 3.2) * (1 - q * .1), i % 3 ? '#c8ff8a' : '#8affd8', (q ? .22 : .8) * (1 - q / 8)); }
    }
    // bruma luminosa pegada al suelo, que se desplaza lento
    const bg = ctx.createLinearGradient(0, 150, 0, 215); bg.addColorStop(0, 'rgba(60,220,170,0)'); bg.addColorStop(1, 'rgba(60,220,170,.16)'); ctx.fillStyle = bg; ctx.fillRect(0, 150, VW, 65);
    ctx.restore();
  };

  // ---------------- el terreno: el de siempre, con el bosque encima ----------------
  const terrenoAntes = ST.terrain;
  ST.terrain = function (ctx, f) {
    if (window.estiloArteDerivado || faltan !== 0) return terrenoAntes.call(this, ctx, f);
    const deco = L.deco; L.deco = [];
    try { terrenoAntes.call(this, ctx, f); } finally { L.deco = deco; }
    if (bosquePrincipal(f) && bosqueTierraLista()) {
      ctx.save(); allLoopsPath(ctx,L.loops); ctx.clip();
      const p=ctx.createPattern(FONDO_BOSQUE.tierra,'repeat'); p.setTransform(new DOMMatrix().scale(150/FONDO_BOSQUE.tierra.naturalWidth));
      ctx.fillStyle=p; ctx.fillRect(0,0,L.ww,VH+40); ctx.restore();
      for(const r of L.tops) {
        ctx.save(); ctx.beginPath(); ctx.rect(r.x0,r.y-5,r.x1-r.x0,9); ctx.clip();
        for(let x=r.x0;x<r.x1;x+=110) ctx.drawImage(FONDO_BOSQUE.borde,0,320,2171,59,x,r.y-2,110,3);
        ctx.restore();
      }
    }
    const hueco = (x, y) => !L.solid(Math.floor(x / T), Math.floor(y / T));
    for (const b of L.bottoms) for (let x = b.x0 + 10; x < b.x1 - 10; x += 22 + h1(x | 0, 5) * 30) {   // lianas bajo los techos
      if (b.y > VH - 4 || h1(x | 0, 6) < .4) continue;
      spr(ctx, 'liana' + Math.floor(h1(x | 0, 7) * 7), x, b.y - 2, { ay: 0, k: .7 + h1(x | 0, 8) * .3 });
    }
    for (const r of L.tops) for (let x = r.x0 + 14; x < r.x1 - 14; x += 26 + h1(x | 0, r.y) * 34) {   // hongos, helechos y rocas sueltos
      if (h1(x | 0, 9) < .45) continue;
      const n = ['hongito0', 'hongito1', 'hongito2', 'hongito4', 'planta1', 'planta3', 'planta4', 'roca2'][Math.floor(h1(x | 0, 10) * 8)];
      spr(ctx, n, x, r.y + 1.5, { voltea: h1(x | 0, 11) < .5, k: .75 + h1(x | 0, 12) * .3 });
    }
    for (const o of L.deco) {
      const x = o.x, y = o.y + 2;
      if (o.k === 'T') spr(ctx, 'arbol' + (o.i % 5), x, y, { voltea: o.i % 2 === 1 });
      else if (o.k === 'f') spr(ctx, ['hongito3', 'hongito5', 'planta0', 'planta2'][o.i % 4], x, y, { voltea: o.i % 2 === 1 });
      else if (o.k === 'r') spr(ctx, ['roca0', 'roca1'][o.i % 2], x, y);
    }
  };

  // ---------------- hongos y caminos de luz ----------------
  function reboteAntes(ctx, pl, f, sk) {
    const x = pl.x, y = pl.y, w = pl.w, sq = pl.sq || 0; pl.sq = sq * .88;
    ctx.fillStyle = '#d8f0e8'; ctx.fillRect(x + w / 2 - 2, y + 2, 4, 14); ctx.save(); ctx.shadowColor = sk.accent; ctx.shadowBlur = 8 * f.S; ctx.fillStyle = sk.accent; ctx.beginPath(); ctx.ellipse(x + w / 2, y + 3 + sq * 2, w / 2 + sq * 2, 5 - sq * 2, 0, Math.PI, 0); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#ffffff'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + w * (.25 + i * .25), y - 1 + sq * 2, .8, 0, TAU); ctx.fill(); }
  }
  LOOK.shroom = (ctx, pl, f, sk) => {
    if (!ACTIVO || !listo('rebote0')) return reboteAntes(ctx, pl, f, sk);
    const sq = pl.sq || 0; pl.sq = sq * .88;
    const n = sq > .55 ? 'rebote1' : sq > .15 ? 'rebote2' : 'rebote0', k = (pl.w + 6) / TAM.rebote0.w;
    spr(ctx, n, pl.x + pl.w / 2, pl.y - 3, { ay: 0, k });
  };
  const hongoAntes = LOOK.hongoLuz;
  if (hongoAntes) LOOK.hongoLuz = (c, pl, f, sk) => {
    if (!ACTIVO || !listo('sombrero')) return hongoAntes(c, pl, f, sk);
    const x = pl.x, y = pl.y, w = pl.w, cx = x + w / 2, base = pl.y0 + 70, b = pl.brillo || 0;
    c.fillStyle = '#0d2a30'; c.fillRect(cx - 3.4, y + 4, 6.8, base - y);
    c.strokeStyle = `rgba(95,255,224,${.3 + b * .5})`; c.lineWidth = .6; for (let yy = y + 10; yy < base; yy += 9) { c.beginPath(); c.moveTo(cx - 3.4, yy); c.lineTo(cx + 3.4, yy + 2); c.stroke(); }
    if (b > .05) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, cx, y + 2, 30, '#5fffe0', .4 * b); c.restore(); }
    c.save(); c.globalAlpha = .75 + .25 * b; spr(c, 'sombrero', cx, y - 3, { ay: 0, k: (w + 10) / TAM.sombrero.w, ky: .6 }); c.restore();
  };
  function caminoAntes(ctx, pl, f, sk) {
    const x = pl.x, y = pl.y, w = pl.w, a = pl.glow || 0;
    ctx.strokeStyle = rgba(sk.accent, .5 + a * .5); ctx.lineWidth = 1; ctx.setLineDash(a > .5 ? [] : [1.5, 2]); ctx.save(); if (a > .3) { ctx.shadowColor = sk.accent; ctx.shadowBlur = 8 * f.S * a; } ctx.strokeRect(x, y, w, 5); ctx.fillStyle = rgba(sk.accent, a * .3); ctx.fillRect(x, y, w, 5); ctx.restore(); ctx.setLineDash([]);
  }
  LOOK.glowline = (ctx, pl, f, sk) => {
    if (!ACTIVO || !listo('camino0')) return caminoAntes(ctx, pl, f, sk);
    const a = pl.glow || 0, k = (pl.w + 4) / TAM.camino0.w, cx = pl.x + pl.w / 2;
    // apagado: se adivina apenas, con su contorno punteado; con luz, se enciende
    ctx.save(); ctx.globalAlpha = .28 + (1 - a) * .1; spr(ctx, 'camino0', cx, pl.y - 2, { ay: 0, k }); ctx.restore();
    if ((1 - a) > .3) { ctx.strokeStyle = 'rgba(95,255,224,.45)'; ctx.lineWidth = .6; ctx.setLineDash([1.5, 2]); ctx.strokeRect(pl.x, pl.y, pl.w, 4); ctx.setLineDash([]); }
    if (a > .02) { ctx.save(); ctx.globalAlpha = a; spr(ctx, 'camino1', cx, pl.y - 2, { ay: 0, k }); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, cx, pl.y + 1, pl.w * .7, '#5fffe0', .22 * a); ctx.restore(); }
  };

  // ---------------- canistel, corazón y salida ----------------
  if (typeof monedaItzel === 'function') {
    GANCHOS.en('monedaItzel', monedaAntes => function (ctx, x, y, t, f, especial) {
      if (especial || !ACTIVO || !listo('canistel')) return monedaAntes.apply(this, arguments);
      const yy = y + Math.sin(t * 2.6 + x * .04) * 1.4;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, yy, 8, '#ffd27a', .25); ctx.restore();
      spr(ctx, 'canistel', x, yy, { ay: .5 });
    });
  }
  if (typeof drawHeart === 'function') {
    GANCHOS.en('drawHeart', corazonAntes => function (ctx, x, y) { if (!ACTIVO || !listo('corazon')) return corazonAntes.apply(this, arguments); spr(ctx, 'corazon', x, y, { ay: .5 }); });
  }
  const metaAntes = ST.goal;
  ST.goal = function (ctx, x, y, t, f) {
    if (!esBosque(f && f.st) || !listo('salida')) return metaAntes.apply(this, arguments);
    spr(ctx, 'salida', x, y + 3);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y - 22, 26, '#5fffe0', .25 + .1 * Math.sin(t * 2)); ctx.restore();
  };

  // ---------------- cocuyo, polilla y esporín ----------------
  const envuelve = (k, fn) => {
    const antes = FD[k]; if (!antes) return;
    const nuevo = function (c, e, t, s) { if (!ACTIVO || e.sub || !listo(k + '0')) return antes.call(this, c, e, t, s); fn(c, e, t); };
    nuevo._assetNuevo = true;
    nuevo._assetListo = () => (ACTIVO && listo(k + '0')) || !!(antes._assetListo && antes._assetListo());
    FD[k] = nuevo;
  };
  envuelve('cocuyo', (c, e, t) => {
    const posado = e.st === 'sleep' || e.st === 'stun';
    const n = e.st === 'gone' ? 7 : posado ? 0 : 2 + Math.floor(t * 14 + e.hx) % 5;
    if (!posado) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, 4, -5, 9, '#7fffe0', .35 + Math.sin(t * 5 + e.hx) * .15); c.restore(); }
    const forge = window.ENEMIGOS_ASSETS, hoja = forge && forge.hojaForge('cocuyo');
    if (!posado && e.st !== 'gone' && hoja && hoja.complete && hoja.naturalWidth) { forge.pinta(c, e, t, 'cocuyo', null); return; }
    spr(c, 'cocuyo' + n, 0, 2);
  });
  envuelve('polilla', (c, e, t) => spr(c, 'polilla' + (e.huye > 0 ? 7 : Math.floor(t * 16 + e.anim * 5) % 7), 0, 1));
  envuelve('esporin', (c, e, t) => {
    const forge = window.ENEMIGOS_ASSETS, hoja = forge && forge.hojaForge('esporin');
    if (e.st !== 'gone' && hoja && hoja.complete && hoja.naturalWidth) { forge.pinta(c, e, t, 'esporin', null); return; }
    const n = e.infla > 0 ? 4 + Math.min(3, Math.floor((1 - e.infla / .4) * 4)) : Math.floor(t * 2 + e.hx) % 4;
    spr(c, 'esporin' + n, 0, 1);
  });
  // la nube de esporas también en rosa: es lo que lastima (su daño sigue igual en mundos-ampliados.js)
  if (MEC.OBJ.esporas) {
    const nubeAntes = MEC.OBJ.esporas.draw;
    MEC.OBJ.esporas.draw = function (c, o, f) {
      if (!ACTIVO) return nubeAntes.call(this, c, o, f);
      const r = 6 + o.t * 12, a = Math.max(0, 1 - o.t / 1.8); c.save(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 11; i++) { const an = i * .7 + o.t * 2, rr = r * (.4 + (i % 3) * .3); c.fillStyle = i % 3 ? `rgba(255,110,220,${.3 * a})` : `rgba(255,200,245,${.35 * a})`; c.beginPath(); c.arc(o.x + Math.cos(an) * rr, o.y - o.t * 8 + Math.sin(an) * rr * .7, 2.4 - (i % 2) * .8, 0, TAU); c.fill(); }
      c.restore();
    };
  }
  window.BOSQUE_BRILLA = { IMG, TAM, listo, rehaz, activo: () => ACTIVO };
})();
