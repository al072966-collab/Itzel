'use strict';
// =====================================================================
//  LA MURALLA DE PIXEL, CON SUS ASSETS
//  El mundo pixel (16 bits) se viste con los assets del malecón de
//  Campeche, ya reducidos a la cuadrícula del juego por
//  tools/muralla-pixel.py (Roguelike/assets/muralla):
//    · el telón sigue siendo el cielo pixel dibujado de antes (sin fondo
//      de imagen);
//    · el terreno: sillares de muralla con su cornisa (pintado aquí, para
//      que se repita sin costuras), con farolas, palmeras, balaustradas,
//      macetas, bolardos, piedras, pasto y garitas en las esquinas;
//    · las plataformas de ladrillo: entera, cuarteada cuando se pisa y
//      desmoronándose cuando cae;
//    · el cañón con su fogonazo, la bala, el bloque de Fresita, los
//      canisteles, los corazones y la puerta de la meta;
//    · cangrejo, centinela, gaviota y tortuga en sus cuatro estados.
//  Nada de esto cambia colisiones ni mecánicas: solo cómo se pinta.
//  Solo aplica al estilo «pixel» (no a los derivados, como el Game Boy);
//  si una imagen no ha cargado, se pinta lo de antes.
// =====================================================================
(function () {
  if (typeof STYLE_MAP === 'undefined' || !STYLE_MAP.pixel || typeof MEC === 'undefined') return;
  const { OBJ, LOOK, FD } = MEC, ST = STYLE_MAP.pixel, RUTA = '../Roguelike/assets/muralla/';
  const NOMBRES = ['garita', 'plat-entera', 'plat-cuarteada', 'plat-cae', 'rocas-grandes', 'rocas', 'piedrita', 'pasto-chico', 'pasto', 'pasto-espiga', 'pasto-rocas',
    'palmera', 'farol', 'balaustrada', 'poste', 'buganvilia', 'maceta', 'bolardo', 'canon', 'canon-fuego', 'bala', 'humo', 'bloque', 'canistel', 'corazon', 'meta',
    ...['cangrejo', 'centinela', 'gaviota', 'tortuga'].flatMap(k => ['reposo', 'movimiento', 'accion', 'derrota'].map(s => `${k}-${s}`))];
  const IMG = {};
  let faltan = NOMBRES.length;
  const listo = n => { const im = IMG[n]; return !!(im && im.complete && im.naturalWidth); };
  for (const n of NOMBRES) {
    const im = new Image(); im.decoding = 'async';
    im.onload = im.onerror = () => { if (--faltan === 0) rehaz(); };
    im.src = RUTA + n + '.png'; IMG[n] = im;
  }
  // si el terreno se pintó antes de que cargaran, se vuelve a pintar
  function rehaz() { if (typeof CACHE !== 'undefined') for (const k of [...CACHE.keys()]) if (k.startsWith('pixel@')) CACHE.delete(k); }

  // ¿lo que se está pintando es el mundo pixel de verdad (no un estilo derivado)?
  let ACTIVO = false;
  const esPixel = st => !!st && st.id === 'pixel' && !window.estiloArteDerivado;
  if (typeof renderScene === 'function') {
    GANCHOS.en('renderScene', antes => function (ctx, st) { ACTIVO = esPixel(st); try { return antes.apply(this, arguments); } finally { ACTIVO = false; } });
  }
  // un sprite con el ancla abajo al centro (o donde diga ax/ay), en pixeles enteros
  const spr = (c, n, x, y, voltea = false, ax, ay) => {
    const im = IMG[n], w = im.width, h = im.height, X = Math.round(x), Y = Math.round(y), aX = ax ?? Math.floor(w / 2), aY = ay ?? h;
    if (!voltea) { c.drawImage(im, X - aX, Y - aY); return; }
    c.save(); c.translate(X, Y); c.scale(-1, 1); c.drawImage(im, -aX, -aY); c.restore();
  };
  const h1 = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

  const FONDO_MURALLA = {};
  for (const [n, archivo] of Object.entries({ cielo:'cielo-mar-muralla-v1', ciudad:'ciudad-muralla-v1', piedra:'sillares-muralla-v1' })) {
    const im = FONDO_MURALLA[n] = new Image(); im.decoding = 'async'; im.onload = rehaz; im.src = RUTA + archivo + '.png';
  }
  const murallaPrincipal = f => ((f && f.g && f.g.def && f.g.def.id) || (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id)) === 'pixel';
  const fondoMurallaListo = () => Object.values(FONDO_MURALLA).every(im => im.complete && im.naturalWidth);
  window.MURALLA_TELON_LISTO = fondoMurallaListo;
  const cieloMurallaAntes = ST.sky;
  ST.sky = function (c, f) {
    if (!esPixel(f.st) || !murallaPrincipal(f) || !fondoMurallaListo()) return cieloMurallaAntes.call(this,c,f);
    const im = FONDO_MURALLA.cielo, H = f.H || VH, sw = Math.min(im.naturalWidth, im.naturalHeight * VW / H);
    const max = Math.max(0, im.naturalWidth - sw), sx = max * (.5 + .25 * Math.sin((f.cam || 0) * .0007));
    c.save(); c.imageSmoothingEnabled = false; c.drawImage(im,sx,0,sw,im.naturalHeight,0,0,VW,H);
    const w = 560, h = w * 346 / 2156, off = (((f.cam || 0) * .1) % w + w) % w, base = H * .81;
    for (let x = -off - w; x < VW + w; x += w) c.drawImage(FONDO_MURALLA.ciudad,8,188,2156,346,Math.round(x),Math.round(base-h),w,h);
    c.restore();
  };
  // ---------------- el terreno: sillares con cornisa ----------------
  // los colores de las piezas de muralla del asset: sillar anaranjado, junta oscura, cornisa clara
  const PIEDRA = ['#c96f3c', '#bb6434', '#d27b44', '#c0683a', '#d8864c', '#b45e32'].map(hex);
  const C = { cornisa: hex('#f8cf8c'), cornisa2: hex('#e59a5a'), cornisa3: hex('#c8743e'), sombra: hex('#5e2c1c'), junta: hex('#5a2a1c'), luz: hex('#eba066'),
    hondo: hex('#5a3024'), hondo2: hex('#45251e'), orilla: hex('#3a1e18'), hueco: hex('#2e1814'), musgo: hex('#6f8a32'), musgo2: hex('#4f6a24') };
  const mezcla = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5], bayer = (x, y) => (B4[(y & 3) * 4 + (x & 3)] + .5) / 16;
  function colorSillar(x, y, dep) {
    if (dep === 0) return C.cornisa;
    if (dep <= 2) return bayer(x, y) < .25 && dep === 2 ? C.cornisa3 : C.cornisa2;
    if (dep === 3) return C.cornisa3;
    if (dep === 4) return C.sombra;
    // hiladas de 7 de alto; cada sillar de 13 a 15 de ancho, cuatrapeados
    const d = dep - 5, fila = Math.floor(d / 7), fy = d % 7, corr = (fila * 7) % 13, bx = x + corr, ancho = 13 + (fila % 3 === 1 ? 2 : 0), col = Math.floor(bx / ancho), fx = bx - col * ancho;
    if (fy === 6 || fx === 0) return C.junta;
    const id = col * 31 + fila * 7;
    if (dep > 14 && h1(id, 41) < .035) return fy === 0 || fx === 1 ? C.sombra : C.hueco;   // un sillar que ya se cayó
    let c = PIEDRA[Math.floor(h1(id, 40) * PIEDRA.length)];
    if (fy === 0 || fx === 1) c = mezcla(c, C.luz, .55);
    else if (fy === 5) c = mezcla(c, C.junta, .35);
    else if (h1(x * 7 + y, 43) < .07) c = mezcla(c, C.junta, .4);
    if (dep < 12 && h1(x, y * 3 + 5) < .025) c = h1(x, y) < .5 ? C.musgo : C.musgo2;                 // musgo cerca de arriba
    if (fy === 3 && h1(id, 44) < .08 && fx > 3 && fx < ancho - 3) c = mezcla(c, C.hueco, .5);       // grieta
    // a lo hondo la muralla se oscurece, con tramado
    const k = clamp((dep - 30 + (bayer(x, y) - .5) * 10) / 50, 0, 1);
    return k > 0 ? mezcla(c, k > .7 ? C.hondo2 : C.hondo, Math.min(1, k * 1.2)) : c;
  }
  function terrenoMuralla(ctx) {
    const W = L.ww, H = VH + 8, im = ctx.createImageData(W, H), d = im.data;
    const set = (x, y, c) => { if (x < 0 || x >= W || y < 0 || y >= H) return; const p = (y * W + x) * 4; d[p] = c[0]; d[p + 1] = c[1]; d[p + 2] = c[2]; d[p + 3] = 255; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const cx = x >> 4, cy = y >> 4; if (!L.solid(cx, cy)) continue;
      const lx = x & 15, ly = y & 15, dep = L.depth(x, y);
      const topE = !L.solid(cx, cy - 1), lE = !L.solid(cx - 1, cy), rE = !L.solid(cx + 1, cy), bE = !L.solid(cx, cy + 1);
      if (topE && ly === 0 && ((lE && lx === 0) || (rE && lx === 15))) continue;          // esquinas redondeadas
      let c = colorSillar(x, y, dep);
      if ((lE && lx === 0) || (rE && lx === 15)) c = dep < 4 ? C.sombra : C.orilla;
      else if ((lE && lx === 1) || (rE && lx === 14)) c = mezcla(c, C.orilla, .45);
      if (bE && ly >= 14) c = ly === 15 ? C.orilla : C.hondo;
      set(x, y, c);
    }
    { const tmp = mkCanvas(W, H); tmp.getContext('2d').putImageData(im, 0, 0); ctx.drawImage(tmp, 0, 0); }
    if (murallaPrincipal() && fondoMurallaListo()) {
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip(); ctx.imageSmoothingEnabled = false;
      const p = ctx.createPattern(FONDO_MURALLA.piedra, 'repeat'); p.setTransform(new DOMMatrix().scale(112 / FONDO_MURALLA.piedra.naturalWidth));
      ctx.fillStyle = p; ctx.fillRect(0, 0, W, H); ctx.restore();
      // La misma pieza de plataforma remata los bordes sin cambiar su colisión.
      if (listo('plat-entera')) for (const t of L.tops) if (t.x1 - t.x0 >= 12) tira(ctx,'plat-entera',t.x0,t.y - 1,t.x1 - t.x0);
    }
    // lo de arriba de la muralla: pasto entre las piedras, piedritas y, en las esquinas altas, garitas
    const SUELO = ['pasto-chico', 'pasto', 'pasto-espiga', 'pasto-rocas', 'piedrita', 'rocas'];
    for (const r of L.tops) {
      const largo = r.x1 - r.x0;
      for (let x = r.x0 + 10; x < r.x1 - 10; x += 22 + Math.floor(h1(x, r.y) * 30)) {
        if (h1(x, 61) < .45) continue; const n = SUELO[Math.floor(h1(x, 62) * SUELO.length)]; if (!listo(n)) continue;
        spr(ctx, n, x, r.y + 2);
      }
      // garita: cuelga de la esquina de los tramos de muralla altos y largos (es de fondo: no estorba el paso)
      if (largo >= 8 * 16 && r.y < VH - 40 && listo('garita')) {
        for (const lado of [1, -1]) {
          const ex = lado > 0 ? r.x1 : r.x0, cae = !L.solid((ex + lado * 8) >> 4, (r.y + 8) >> 4);
          if (!cae || h1(ex, 77) < .5) continue;
          spr(ctx, 'garita', ex - lado * 4, r.y + 16);
          break;
        }
      }
    }
    // las decoraciones del nivel con las piezas del malecón
    for (const o of L.deco) {
      const x = Math.round(o.x), y = Math.round(o.y) + 1;
      let n;
      if (o.k === 'T') n = ['farol', 'palmera', 'balaustrada'][o.i % 3];
      else if (o.k === 'f') n = o.i % 2 ? 'maceta' : 'buganvilia';
      else if (o.k === 'r') n = o.i % 3 === 2 ? 'bolardo' : 'rocas-grandes';
      if (!n || !listo(n)) continue;
      if (n === 'balaustrada') { spr(ctx, 'poste', x - 26, y); spr(ctx, n, x, y); spr(ctx, 'poste', x + 26, y); }
      else spr(ctx, n, x, y, o.i % 2 === 1 && n === 'palmera');
    }
  }
  const terrenoAntes = ST.terrain;
  ST.terrain = function (ctx, f) {
    if (window.estiloArteDerivado || faltan > 0) return terrenoAntes.call(this, ctx, f);
    terrenoMuralla(ctx);
  };

  // ---------------- las plataformas de ladrillo ----------------
  function ladrillosAntes(ctx, pl, f, sk) {
    const x = pl.x, y = pl.y, w = pl.w;
    ctx.fillStyle = sk.plat; ctx.fillRect(x, y, w, 8); ctx.fillStyle = sk.plat2;
    for (let i = 0; i < w; i += 8) { ctx.fillRect(x + i, y + 3.5, 8, 1); ctx.fillRect(x + i + ((i / 8) % 2 ? 0 : 4), y, 1, 3.5); ctx.fillRect(x + i + ((i / 8) % 2 ? 4 : 0), y + 4.5, 1, 3.5); }
    ctx.fillStyle = sk.line || '#222034'; ctx.fillRect(x, y + 8, w, 1);
    if (pl.tt > .2) { ctx.fillStyle = sk.line || '#222034'; ctx.fillRect(x + w * .4, y + 1, 1, 6); ctx.fillRect(x + w * .4 + 1, y + 3, 2, 1); }
  }
  // tira de cualquier ancho: las dos puntas y el centro repetido
  function tira(ctx, n, x, y, w) {
    const im = IMG[n], iw = im.width, ih = im.height, P = 6, X = Math.round(x), Y = Math.round(y);
    ctx.drawImage(im, 0, 0, P, ih, X - 1, Y, P, ih);
    const mid = iw - P * 2; let px = X - 1 + P; const fin = X + Math.round(w) + 1 - P;
    while (px < fin) { const a = Math.min(mid, fin - px); ctx.drawImage(im, P, 0, a, ih, px, Y, a, ih); px += a; }
    ctx.drawImage(im, iw - P, 0, P, ih, fin, Y, P, ih);
  }
  LOOK.bricks = (ctx, pl, f, sk) => {
    if (!ACTIVO || !listo('plat-entera')) return ladrillosAntes(ctx, pl, f, sk);
    const cae = pl.k === 'fall' && pl.st === 'fall', pisada = pl.k === 'fall' && pl.st === null && pl.tt > 0;
    tira(ctx, cae ? 'plat-cae' : pisada ? 'plat-cuarteada' : 'plat-entera', pl.x, pl.y - 1, pl.w);
    if (cae && !pl._polvo && f.g && typeof spawn === 'function') { pl._polvo = true; spawn(f.g, 10, pl.x + pl.w / 2, pl.y + 6, { v: 50, life: .6, s: 2, k: 'dust', cols: ['#c47a48', '#e3ac6c', '#6e3a26'] }); }
    if (!cae) pl._polvo = false;
  };

  // ---------------- el cañón, la bala y el humo ----------------
  if (OBJ.canon) {
    const canonAntes = OBJ.canon.draw;
    OBJ.canon.draw = function (c, o, f) {
      if (!ACTIVO || !listo('canon')) return canonAntes.call(this, c, o, f);
      const fuego = o.fogon > 0, n = fuego ? 'canon-fuego' : 'canon', im = IMG[n], voltea = o.dir > 0;
      // los dos cuadros se alinean por la culata: la boca mira hacia donde dispara
      spr(c, n, o.x, o.y + 1, voltea, im.width - 13, im.height);
      const aviso = o.per - o.t < .5 && f.g && Math.abs(f.g.p.x - o.x) <= 260;
      if (aviso && Math.floor(f.t * 10) % 2) { c.fillStyle = '#fbf236'; c.fillRect(Math.round(o.x - o.dir * 9) - 1, Math.round(o.y) - 14, 2, 2); c.fillStyle = '#df7126'; c.fillRect(Math.round(o.x - o.dir * 9), Math.round(o.y) - 15, 1, 1); }
      if (o.fogon > 0 && listo('humo')) { c.save(); c.globalAlpha = Math.min(1, o.fogon * 4); spr(c, 'humo', o.x + o.dir * (20 + (.25 - o.fogon) * 30), o.y - 9 - (.25 - o.fogon) * 12, false, 4, 4); c.restore(); }
    };
  }
  if (OBJ.bala && OBJ.bala.dibujos.balaPixel) {
    const balaAntes = OBJ.bala.dibujos.balaPixel;
    OBJ.bala.dibujos.balaPixel = (c, o, f) => { if (!ACTIVO || !listo('bala')) return balaAntes(c, o, f); spr(c, 'bala', o.x, o.y, false, 4, 4); };
  }

  // ---------------- el bloque de Fresita ----------------
  OBJ.pblock = Object.assign(OBJ.pblock || {}, {
    drawSolid(ctx, s, f) {
      if (!ACTIVO || !listo('bloque')) return false;
      if (s.life !== undefined && s.life < 1 && Math.floor(f.t * 12) % 2) return true;           // parpadea antes de irse
      const k = s.grow ?? 1; ctx.save(); ctx.translate(s.x + 8, s.y + 8); ctx.scale(k, k); ctx.drawImage(IMG.bloque, -8, -8); ctx.restore();
      return true;
    },
  });

  // ---------------- canisteles, corazones y la meta ----------------
  if (typeof monedaItzel === 'function') {
    GANCHOS.en('monedaItzel', monedaAntes => function (ctx, x, y, t, f, especial) {
      if (especial || !ACTIVO || !listo('canistel')) return monedaAntes.apply(this, arguments);
      spr(ctx, 'canistel', x, y + Math.round(Math.sin(t * 2.5 + x * .04) * 1.2), false, 5, 5);
      if ((t * 1.3 + x * .013) % 3 < .12) { ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(x) - 2, Math.round(y) - 3, 1, 1); }
    });
  }
  if (typeof drawHeart === 'function') {
    GANCHOS.en('drawHeart', corazonAntes => function (ctx, x, y) { if (!ACTIVO || !listo('corazon')) return corazonAntes.apply(this, arguments); spr(ctx, 'corazon', x, y, false, 6, 6); });
  }
  const metaAntes = ST.goal;
  ST.goal = function (ctx, x, y, t, f) {
    if (!esPixel(f && f.st) || !listo('meta')) return metaAntes.apply(this, arguments);
    spr(ctx, 'meta', x, y + 1);
    // la luz de la puerta respira
    const a = .18 + .14 * Math.sin(t * 3); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#fff4c0'; ctx.fillRect(Math.round(x) - 6, Math.round(y) - 22, 12, 21); ctx.restore();
  };

  // ---------------- los enemigos del malecón ----------------
  const POSE = {
    cangrejo: e => e.st === 'gone' ? 'derrota' : (e.aturde > 0 || e._golpe > .25 || e.st === 'stun') ? 'accion' : null,
    tortuga: e => e.st === 'gone' || e.st === 'shell' || e.st === 'slide' ? 'derrota' : (e.aturde > 0 || e._golpe > .25) ? 'accion' : null,
    centinela: e => e.st === 'gone' ? 'derrota' : e.lanza > 0 ? 'accion' : null,
    gaviota: e => e.st === 'gone' ? 'derrota' : e.st === 'dive' ? 'accion' : null,
  };
  const BAJA = { gaviota: 2 };   // la gaviota vuela: su caja va más arriba que sus «pies»
  for (const k of Object.keys(POSE)) {
    const antes = FD[k]; if (!antes) continue;
    const nuevo = function (c, e, t, s) {
      if (!ACTIVO || e.sub || !listo(k + '-reposo')) return antes.call(this, c, e, t, s);
      if (k === 'cangrejo' && e.st !== 'sleep' && e.st !== 'gone' && !(e.aturde > 0 || e._golpe > .25 || e.st === 'stun')) {
        const hoja = window.ENEMIGOS_ASSETS?.hojaForge('cangrejo');
        if (hoja?.complete && hoja.naturalWidth) return antes.call(this, c, e, t, s);
      }
      let n = POSE[k](e);
      if (!n) { const anda = e.st === 'sleep' ? false : k === 'gaviota' || Math.abs(e.vx || 0) > 1 || e.beh === 'walk' || e.beh === 'centinela'; n = anda && Math.floor((e.anim || t) * 5) % 2 ? 'movimiento' : 'reposo'; }
      const im = IMG[`${k}-${n}`]; if (!im.naturalWidth) return antes.call(this, c, e, t, s);
      c.drawImage(im, -Math.floor(im.width / 2), -im.height + (BAJA[k] || 0) + 1);
    };
    nuevo._assetNuevo = true;
    nuevo._assetListo = () => (ACTIVO && listo(k + '-reposo')) || !!(antes._assetListo && antes._assetListo());
    FD[k] = nuevo;
  }
  window.MURALLA_PIXEL = { IMG, listo, rehaz, activo: () => ACTIVO };
})();
