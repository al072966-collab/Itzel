'use strict';
// =====================================================================
//  HAMACAS AL ATARDECER, CON SUS ASSETS
//  El mundo ocaso (siluetas contra el sol) se viste con los assets del
//  estero de Campeche, preparados por tools/ocaso-estero.py
//  (Roguelike/assets/estero, a 3 pixeles por unidad del juego):
//    · el telón sigue siendo el cielo dibujado de antes (David no quiere
//      un fondo de imagen); se le agregan, también dibujados, el agua del
//      estero con sus reflejos e islotes de mangle con raíces zancudas;
//    · el terreno sigue siendo silueta con contraluz; se le ponen raíces
//      de mangle en las orillas que dan al agua, tule, carrizo, lirios y
//      nenúfares, y las decoraciones del nivel se vuelven mangles,
//      palmeras, farolas y bolardos del malecón;
//    · la hamaca de red entre sus dos postes, que se hunde al rebotar;
//    · el papalote pintado con el atardecer, los canisteles, el corazón,
//      el arco de salida y los remolinos del viento de Fresita;
//    · murciélago (aleteo), garza (parada, caminando y picando) y el
//      enjambre de zancudos.
//  Nada de esto cambia colisiones ni mecánicas: solo cómo se pinta.
//  Solo aplica al estilo «ocaso»; si una imagen no ha cargado, se pinta
//  lo de antes.
// =====================================================================
(function () {
  if (typeof STYLE_MAP === 'undefined' || !STYLE_MAP.ocaso || typeof MEC === 'undefined') return;
  const { LOOK, FD } = MEC, ST = STYLE_MAP.ocaso, RUTA = '../Roguelike/assets/estero/';
  const TAM = {}, IMG = {};
  const garzaAtaqueForge = new Image();
  garzaAtaqueForge.src = '../Roguelike/assets/forge/estero/garza-ataque-v1/sheet-transparent.png';
  const listo = n => { const im = IMG[n]; return !!(im && im.complete && im.naturalWidth && TAM[n]); };
  let faltan = 1;
  (window.ESTERO_MANIFIESTO ? Promise.resolve(window.ESTERO_MANIFIESTO) : fetch(RUTA + 'estero.json?v=6').then(r => r.json())).then(m => {
    Object.assign(TAM, m); faltan = Object.keys(m).length;
    for (const n of Object.keys(m)) { const im = new Image(); im.decoding = 'async'; im.onload = im.onerror = () => { if (--faltan === 0) rehaz(); }; im.src = RUTA + n + '.png?v=6'; IMG[n] = im; }
  }).catch(() => { faltan = -1; });
  // si el terreno se pintó antes de que cargaran, se vuelve a pintar
  function rehaz() { if (typeof CACHE !== 'undefined') for (const k of [...CACHE.keys()]) if (k.startsWith('ocaso@')) CACHE.delete(k); }

  let ACTIVO = false;
  const esOcaso = st => !!st && st.id === 'ocaso' && !window.estiloArteDerivado;
  if (typeof renderScene === 'function') {
    GANCHOS.en('renderScene', antes => function (ctx, st) { const a = ACTIVO; ACTIVO = esOcaso(st); try { return antes.apply(this, arguments); } finally { ACTIVO = a; } });
  }
  // un sprite en unidades del juego: ancla abajo al centro, o donde diga (ax, ay en 0..1)
  function spr(c, n, x, y, o = {}) {
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';   // las piezas vienen a 6 px por unidad: que se reduzcan bien
    const t = TAM[n], w = t.w * (o.k || 1), h = t.h * (o.k || 1), ax = o.ax ?? .5, ay = o.ay ?? 1;
    if (!o.voltea) { c.drawImage(IMG[n], x - w * ax, y - h * ay, w, h); return; }
    c.save(); c.translate(x, y); c.scale(-1, 1); c.drawImage(IMG[n], -w * ax, -h * ay, w, h); c.restore();
  }
  const h1 = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

  // ---------------- el telón: el cielo dibujado de siempre, con el estero ----------------
  // Todo es dibujo (nada de imagen de fondo): el degradado, el sol, las nubes y la ciudad de antes;
  // entre la ciudad y la orilla cercana entra el agua del estero, con el reflejo del sol y de las
  // ventanas, y en lugar de la selva de en medio, islotes de mangle con sus raíces y su reflejo.
  const MANGLE = '#5c2556';
  function mangle(x, base, k, sd) {
    const cw = 30 * k, ch = 15 * k, cy = base - 21 * k;
    x.beginPath();
    for (let i = 0; i < 7; i++) { const a = -Math.PI + (i + .5) / 7 * Math.PI, rx = cw * (.24 + h1(sd, i) * .12), ry = ch * (.42 + h1(sd, i + 9) * .2); x.moveTo(Math.cos(a) * cw * .42 + rx, cy + Math.sin(a) * ch * .55); x.ellipse(Math.cos(a) * cw * .42, cy + Math.sin(a) * ch * .55, rx, ry, 0, 0, TAU); }
    x.moveTo(cw * .5, cy + ch * .15); x.ellipse(0, cy + ch * .15, cw * .5, ch * .38, 0, 0, TAU); x.fill();
    x.lineCap = 'round';
    // tronco y raíces zancudas que se meten al agua
    x.lineWidth = 1.6 * k; x.beginPath(); x.moveTo(0, cy + 3 * k); x.quadraticCurveTo(1.5 * k, base - 12 * k, 0, base - 9 * k); x.stroke();
    x.lineWidth = .9 * k;
    for (let r = 0; r < 6; r++) { const d = (r - 2.5) / 2.5, fx = d * (11 + h1(sd, r + 20) * 6) * k; x.beginPath(); x.moveTo(d * 2 * k, base - 10 * k + Math.abs(d) * 2 * k); x.quadraticCurveTo(fx * .8, base - 13 * k, fx, base + 1); x.stroke(); }
  }
  function islotes(x, w, base, reflejo) {
    for (let g = 0; g * 120 < w + 120; g++) {
      if (h1(g, 71) < .25) continue;
      const gx = g * 120 + h1(g, 72) * 60, n = 1 + Math.floor(h1(g, 73) * 3);
      for (let m = 0; m < n; m++) {
        const k = .6 + h1(g * 7 + m, 74) * .55, mx = gx + (m - (n - 1) / 2) * 26 * k + (h1(g * 7 + m, 75) - .5) * 10;
        x.save(); x.translate(mx, 0);
        if (reflejo) { x.translate(0, base * 1.55 + 1); x.scale(1, -.55); }
        mangle(x, base, k, g * 7 + m); x.restore();
      }
      // un banco de lodo bajo el grupo
      if (!reflejo) { x.beginPath(); x.ellipse(gx, base + 1, 24 + n * 8, 2.2, 0, 0, TAU); x.fill(); }
    }
  }
  // Telón ilustrado del nivel principal: cada pieza conserva su propia profundidad.
  const telonSeybaplaya = {};
  for (const nombre of ['cielo-mar', 'poblado', 'manglar', 'lancha']) {
    const im = new Image(); im.decoding = 'async';
    im.src = RUTA + (nombre === 'poblado' ? 'seybaplaya-poblado-silueta-v3.png' : 'seybaplaya-' + nombre + '-v1.png'); telonSeybaplaya[nombre] = im;
  }
  const nivelSeybaplaya = f => ((f.g && f.g.def && f.g.def.id) || (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id)) === 'ocaso';
  const telonListo = () => Object.values(telonSeybaplaya).every(im => im.complete && im.naturalWidth);
  window.SEYBAPLAYA_TELON_LISTO = telonListo;
  function pintaSeybaplaya(c, f) {
    const fondo = telonSeybaplaya['cielo-mar'];
    const ancho = VH * fondo.naturalWidth / fondo.naturalHeight;
    const margen = Math.max(0, ancho - VW);
    // El panorama no se repite: la cámara recorre lentamente una parte de él.
    const desplazamiento = margen * (.5 + .24 * Math.sin((f.cam || 0) * .0007));
    c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.drawImage(fondo, -desplazamiento, 0, ancho, VH);
    const fila = (im, sx, sy, sw, sh, anchoPieza, base, par, intervalo) => {
      const alto = anchoPieza * sh / sw, off = ((f.cam || 0) * par % intervalo + intervalo) % intervalo;
      for (let x = -intervalo - off; x < VW + intervalo; x += intervalo)
        c.drawImage(im, sx, sy, sw, sh, x, base - alto, anchoPieza, alto);
    };
    // Las bases coinciden con la línea del agua, nunca con el aire.
    fila(telonSeybaplaya.poblado, 0, 305, 2172, 200, 570, 180, .055, 570);
    fila(telonSeybaplaya.manglar, 21, 4, 2132, 681, 220, 184, .18, 330);
    fila(telonSeybaplaya.lancha, 63, 22, 2046, 662, 42, 190, .12, 480);
    c.restore();
  }
  function cieloEstero(ctx, f) {
    if (nivelSeybaplaya(f) && telonListo()) { pintaSeybaplaya(ctx, f); return; }
    screenLayer(ctx, f, 'sky', x => {
      const g = x.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#1b1036'); g.addColorStop(.32, '#552865'); g.addColorStop(.55, '#b0436c'); g.addColorStop(.72, '#ef7756'); g.addColorStop(.86, '#ffbf72'); g.addColorStop(1, '#ffd89a');
      x.fillStyle = g; x.fillRect(0, 0, VW, VH);
      ambient(70, 4, (i, a, b, c) => { x.fillStyle = `rgba(255,230,240,${(1 - b) * (.2 + c * .6)})`; x.beginPath(); x.arc(a * VW, b * 90, .3 + c * .5, 0, TAU); x.fill(); });
    });
    const sx = 290 - f.cam * .02, t = f.t;
    glowDot(ctx, sx, 128, 140, '#ffb070', .5); glowDot(ctx, sx, 128, 50, '#fff0c0', .7);
    ctx.fillStyle = '#fff1c8'; ctx.beginPath(); ctx.arc(sx, 128, 24, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(120,40,90,.45)';
    for (let i = 0; i < 5; i++) { const x = wrap(i * 120 - f.cam * .05 - t * 2, VW + 200) - 100, y = 70 + i * 14; ctx.beginPath(); ctx.ellipse(x, y, 60 + i * 8, 2.4 + (i % 2), 0, 0, TAU); ctx.fill(); }
    const mist = (y) => { const m = ctx.createLinearGradient(0, y - 30, 0, y + 30); m.addColorStop(0, rgba('#ff9a70', 0)); m.addColorStop(1, rgba('#ff9a70', .22)); ctx.fillStyle = m; ctx.fillRect(0, y - 30, VW, VH); };
    campPath(ctx, f, .05, 152, 'far', 2, 1.15); ctx.fillStyle = '#c3587b'; ctx.fill(); mist(152);
    campPath(ctx, f, .12, 163, 'mid', 5, 1.3); ctx.fillStyle = '#903b6b'; ctx.fill();
    campWindows(ctx, f, .12, 163, 5, 1.3, 'rgba(255,190,120,.7)', .3, 'rgba(0,0,0,0)');
    // el agua del estero: el malecón se para en su orilla, y el agua refleja el sol y las ventanas
    const AG = 165;
    { const g = ctx.createLinearGradient(0, AG, 0, VH); g.addColorStop(0, '#d8707e'); g.addColorStop(.3, '#a8466f'); g.addColorStop(1, '#3e1a48'); ctx.fillStyle = g; ctx.fillRect(0, AG, VW, VH - AG); }
    ctx.fillStyle = 'rgba(255,214,160,.5)'; ctx.fillRect(0, AG, VW, .6);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 18; i++) {                                      // el camino de luz del sol
      const yy = AG + 1.5 + i * 2.2, ancho = (8 + i * 1.8) * (.6 + .4 * Math.sin(t * 2.2 + i * 1.7)), xx = sx + Math.sin(t * 1.3 + i * 2.1) * (1 + i * .3);
      ctx.globalAlpha = .6 * (1 - i / 20); ctx.fillStyle = i % 3 ? '#ffd9a0' : '#fff1c8'; ctx.fillRect(xx - ancho / 2, yy, ancho, .8);
    }
    for (let i = 0; i < 26; i++) {                                      // reflejos de las ventanas
      const px = wrap(h1(i, 41) * 900 - f.cam * .12, VW + 40) - 20, yy = AG + 2 + h1(i, 42) * 9, on = (t * .8 + h1(i, 43) * 5) % 2.5 < 1.8;
      if (!on) continue; ctx.globalAlpha = .45; ctx.fillStyle = '#ffbe78'; ctx.fillRect(px, yy, 1.4 + h1(i, 44) * 2.5, .7);
    }
    ctx.restore();
    mist(170);
    // islotes de mangle sobre el agua, con su reflejo
    strip(ctx, f, 'esteroRefl', .24, (x, w) => { x.fillStyle = 'rgba(70,24,70,.42)'; x.strokeStyle = 'rgba(70,24,70,.42)'; islotes(x, w, 176, true); });
    strip(ctx, f, 'esteroMangle', .24, (x, w) => { x.fillStyle = MANGLE; x.strokeStyle = MANGLE; islotes(x, w, 176, false); });
    ctx.save(); ctx.globalCompositeOperation = 'lighter';                // ondas que pasan frente a los islotes
    for (let i = 0; i < 14; i++) { const k = (t * .12 + h1(i, 51)) % 1, px = wrap(h1(i, 52) * VW * 1.6 - f.cam * .24 + k * 30, VW + 60) - 30, yy = 178 + h1(i, 53) * 12; ctx.globalAlpha = Math.sin(k * Math.PI) * .35; ctx.fillStyle = '#ffc2a0'; ctx.fillRect(px, yy, 8 + h1(i, 54) * 12, .6); }
    ctx.restore();
    mist(180);
    campPath(ctx, f, .42, 214, 'near', 13, .8); ctx.fillStyle = '#33163f'; ctx.fill();
    campProps(ctx, f, .42, 214, 'near', 13, .8, f.t); ctx.fill();
    fragatas(ctx, f, 6, 31, 'rgba(30,10,30,.85)', 52, 30);
  }
  const cieloAntes = ST.sky;
  ST.sky = function (ctx, f) { if (!esOcaso(f.st)) return cieloAntes.call(this, ctx, f); cieloEstero(ctx, f); };
  // flamencos de Los Petenes en uve cruzando el sol, luciérnagas del mangle y pelícano que se clava en el estero
  const cieloEsteroBase = ST.sky;
  ST.sky = function (ctx, f) {
    cieloEsteroBase.call(this, ctx, f);
    if (!esOcaso(f.st)) return;
    const t = f.t;
    ctx.save();
    const per = 26, T = (t + 4) % per, u = T / per, bx = -40 + u * (VW + 120) - f.cam * .03, by = 52 + Math.sin(u * 6) * 4;
    ctx.fillStyle = 'rgba(40,14,44,.88)'; ctx.strokeStyle = 'rgba(40,14,44,.88)'; ctx.lineWidth = .7; ctx.lineCap = 'round';
    for (let i = 0; i < (window.FAUNA_ARTE?.listo('flamenco') ? 7 : 0); i++) {                             // uve de 7 flamencos (lámina, a contraluz)
      const r = Math.ceil(i / 2), lado = i % 2 ? 1 : -1, x = bx - r * 11, y = by + lado * r * 6 * (i ? 1 : 0);
      FAUNA_ARTE.dib(ctx, 'flamenco', t + i * .23, x, y, { w: 10 - r * .6, ay: .5, fps: 5, seq: [0, 1, 2, 3, 2, 1], alfa: .92 });
    }
    ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';                // luciérnagas sobre los manglares
    for (let i = 0; i < 16; i++) {
      const x = wrap(h1(i, 91) * (VW + 80) - f.cam * .22 + Math.sin(t * .7 + i) * 8, VW + 60) - 30, y = 168 + h1(i, 92) * 18 + Math.sin(t * 1.1 + i * 2) * 4, a = Math.max(0, Math.sin(t * 1.6 + h1(i, 93) * 6.3)) * .85;
      if (a < .05) continue; ctx.globalAlpha = a * .5; ctx.fillStyle = '#ffe9a0'; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, TAU); ctx.fill(); ctx.globalAlpha = a; ctx.fillStyle = '#fff6cc'; ctx.fillRect(x - .5, y - .5, 1, 1);
    }
    ctx.restore();
    { const per = 11, T = (t + 2) % per, u = T / per;                      // pelícano: planea, se clava y deja anillos
      if (u < .7 && window.FAUNA_ARTE?.listo('pelicano')) {
        const px = 60 + h1(Math.floor((t + 2) / per), 95) * 200 - f.cam * .1, k = u / .7, py = k < .75 ? 100 + k * 40 + Math.sin(k * 14) * 2 : 130 + (k - .75) * 160;
        if (py < 168) FAUNA_ARTE.pieza(ctx, k < .55 ? 'pelicano0' : k < .75 ? 'pelicano1' : 'pelicano2', px, py, { w: 12, ay: .5 });
        else { if (k < .93) FAUNA_ARTE.pieza(ctx, 'pelicanoAgua', px, 171, { w: 6 }); const r = (k - .87) * 60; ctx.save(); ctx.strokeStyle = 'rgba(255,214,160,' + Math.max(0, .5 - r / 30) + ')'; ctx.lineWidth = .6; ctx.beginPath(); ctx.ellipse(px, 170, r, r * .22, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
      }
    }
  };

  // ---------------- el terreno: silueta con su estero encima ----------------
  const terrenoAntes = ST.terrain;
  ST.terrain = function (ctx, f) {
    if (window.estiloArteDerivado || faltan !== 0) return terrenoAntes.call(this, ctx, f);
    const deco = L.deco; L.deco = [];                                  // la silueta y el contraluz de siempre, sin sus adornos
    try { terrenoAntes.call(this, ctx, f); } finally { L.deco = deco; }
    for (const r of L.tops) {
      // tule, carrizo y lirios sueltos sobre la loma
      for (let x = r.x0 + 18; x < r.x1 - 18; x += 34 + h1(x | 0, r.y) * 40) {
        if (h1(x | 0, 9) < .4) continue;
        const n = ['tule', 'tule2', 'carrizo2', 'hoja-ancha', 'nenufar'][Math.floor(h1(x | 0, 10) * 5)];
        spr(ctx, n, x, r.y + 1.5, { voltea: h1(x | 0, 11) < .5, k: .8 + h1(x | 0, 12) * .3 });
      }
    }
    for (const o of L.deco) {
      const x = o.x, y = o.y + 1.5;
      if (o.k === 'T') { const n = ['mangle', 'palmera', 'mangle2', 'farol', 'mangle3'][o.i % 5]; spr(ctx, n, x, y, { voltea: o.i % 2 === 1 }); if (n === 'farol') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y - 32, 16, '#ffb060', .35); ctx.restore(); } }
      else if (o.k === 'f') spr(ctx, ['carrizo', 'lirio', 'tule'][o.i % 3], x, y, { voltea: o.i % 2 === 1 });
      else if (o.k === 'r') { if (o.i % 2) spr(ctx, 'bolardo', x, y); }   // sin raíces sueltas: no tenían por qué estar ahí
    }
  };

  // ---------------- la hamaca de red entre sus dos postes ----------------
  function hamacaAntes(ctx, pl, f, sk) {
    const x = pl.x, y = pl.y, w = pl.w, sag = 3 + (pl.sq || 0) * 5; pl.sq = (pl.sq || 0) * .9;
    ctx.strokeStyle = sk.line; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(x - 3, y - 14); ctx.lineTo(x, y); ctx.moveTo(x + w + 3, y - 14); ctx.lineTo(x + w, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + w / 2, y + sag * 2, x + w, y); ctx.quadraticCurveTo(x + w / 2, y + sag * 2 + 4, x, y); ctx.fillStyle = sk.plat; ctx.fill();
    ctx.save(); ctx.clip(); for (let i = 0; i < w; i += 4) { ctx.fillStyle = [sk.plat2, sk.accent, sk.plat][(i / 4) % 3]; ctx.fillRect(x + i, y - 2, 2, 12); } ctx.restore();
  }
  LOOK.hammock = (ctx, pl, f, sk) => {
    if (!ACTIVO || !listo('hamaca-red')) return hamacaAntes(ctx, pl, f, sk);
    const im = IMG['hamaca-red'], iw = im.width, ih = im.height, x = pl.x, y = pl.y, w = pl.w;
    const sq = pl.sq || 0; pl.sq = sq * .9;
    ctx.imageSmoothingQuality = 'high';
    // la imagen se reparte: los dos postes (13 % cada uno) y la red del centro, que se estira al rebotar
    const P = .13, H = 30, pw = H * (iw * P) / ih, top = y - H * .55;
    const estira = 1 + sq * .45;
    // los postes de la lámina son cortos: se alargan hasta el suelo (o hasta el agua del estero si abajo es hueco)
    const fin = top + H - 1;
    for (const px of [x - pw / 2, x + w + pw / 2]) {
      const suelo = sueloDebajo(px, y) ?? fondoVista(), ancho = pw * .42;
      if (suelo > fin) { ctx.fillStyle = '#2a1424'; ctx.fillRect(px - ancho / 2, fin, ancho, suelo - fin + 1); ctx.fillStyle = 'rgba(255,190,150,.18)'; ctx.fillRect(px - ancho / 2, fin, ancho * .3, suelo - fin + 1); }
    }
    ctx.drawImage(im, 0, 0, iw * P, ih, x - pw, top, pw, H);
    ctx.drawImage(im, iw * (1 - P), 0, iw * P, ih, x + w, top, pw, H);
    ctx.drawImage(im, iw * P, 0, iw * (1 - 2 * P), ih * .86, x, top, w, H * .86 * estira);
  };

  // ---------------- el papalote pintado ----------------
  const papaloteAntes = LOOK.papalote;
  if (papaloteAntes) LOOK.papalote = (c, pl, f, sk) => {
    if (!ACTIVO || !listo('papalote')) return papaloteAntes(c, pl, f, sk);
    const x = pl.x, y = pl.y, w = pl.w, cx = x + w / 2, t = f.t;
    c.strokeStyle = 'rgba(18,8,26,.6)'; c.lineWidth = .4; c.beginPath(); c.moveTo(cx - 2, y + 6); c.quadraticCurveTo(cx - 12, (y + pl.y0 + 60) / 2, cx - 6, pl.y0 + 60); c.stroke();
    c.save(); c.translate(cx, y + 2); c.rotate(Math.sin(t * 1.6 + pl.x0) * .06 - (pl.vyp < -10 ? .12 : 0));
    spr(c, 'papalote', 0, 0, { ax: .55, ay: .32, k: w / 34 }); c.restore();
  };

  // ---------------- el viento de Fresita ----------------
  // solo cambia cómo se ve la columna (su física sigue en mecanicas.js)
  if (MEC.PINTA_ZONA) MEC.PINTA_ZONA.column = (ctx, z, f) => {
    if (!ACTIVO || !listo('remolino0')) return false;
    const a = z.life !== undefined ? Math.min(1, z.life) : 1, cx = (z.x0 + z.x1) / 2, alto = z.y1 - z.y0;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, z.y0, 0, z.y1); g.addColorStop(0, 'rgba(255,170,200,0)'); g.addColorStop(1, `rgba(255,170,150,${.16 * a})`);
    ctx.fillStyle = g; ctx.fillRect(z.x0 + 3, z.y0, z.x1 - z.x0 - 6, alto);
    for (let i = 0; i < 7; i++) {
      const k = wrap(f.t * .7 + i / 7, 1), y = z.y1 - k * alto, n = 'remolino' + (i % 4);
      ctx.globalAlpha = a * Math.sin(k * Math.PI) * .9; spr(ctx, n, cx + Math.sin(f.t * 2.4 + i * 1.9) * 5, y, { ay: .5, voltea: i % 2 === 1, k: .55 + (i % 3) * .12 });
    }
    ctx.restore(); return true;
  };

  // ---------------- canisteles, corazón y salida ----------------
  if (typeof monedaItzel === 'function') {
    GANCHOS.en('monedaItzel', monedaAntes => function (ctx, x, y, t, f, especial) {
      if (especial || !ACTIVO || !listo('canistel')) return monedaAntes.apply(this, arguments);
      const yy = y + Math.sin(t * 2.4 + x * .04) * 1.4;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, yy, 9, '#ffb060', .3); ctx.restore();
      spr(ctx, 'canistel', x, yy, { ay: .5 });
    });
  }
  if (typeof drawHeart === 'function') {
    GANCHOS.en('drawHeart', corazonAntes => function (ctx, x, y) { if (!ACTIVO || !listo('corazon')) return corazonAntes.apply(this, arguments); spr(ctx, 'corazon', x, y, { ay: .5 }); });
  }
  const metaAntes = ST.goal;
  ST.goal = function (ctx, x, y, t, f) {
    if (!esOcaso(f && f.st) || !listo('salida')) return metaAntes.apply(this, arguments);
    spr(ctx, 'salida', x, y + 2);
    ctx.save(); ctx.globalAlpha = .35 + .3 * Math.sin(t * 2.2); spr(ctx, 'salida-luz', x, y + 2); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y - 20, 26, '#ffb070', .3 + .08 * Math.sin(t * 3)); ctx.restore();
  };

  // ---------------- murciélago, garza y zancudos ----------------
  const envuelve = (k, fn) => {
    const antes = FD[k]; if (!antes) return;
    const nuevo = function (c, e, t, s) { if (!ACTIVO || e.sub || !listo(k === 'zancudo' ? 'zancudo0' : k + '0')) return antes.call(this, c, e, t, s); fn(c, e, Math.max(0, t || 0)); };
    nuevo._assetNuevo = true;
    nuevo._assetListo = () => (ACTIVO && listo(k === 'zancudo' ? 'zancudo0' : k + '0')) || !!(antes._assetListo && antes._assetListo());
    FD[k] = nuevo;
  };
  const CICLO_MUR = [0, 1, 2, 3, 4, 3, 2, 1];
  envuelve('murcielago', (c, e, t) => {
    const i = e.st === 'gone' ? 5 : CICLO_MUR[Math.floor(((e.anim || t) * 14) % CICLO_MUR.length)];
    spr(c, 'murcielago' + i, 0, 1);
    c.fillStyle = '#ffd9a0'; c.fillRect(-1.5, -6.6, .9, .9); c.fillRect(.6, -6.6, .9, .9);                // ojitos que brillan
  });
  envuelve('garza', (c, e, t) => {
    let i;
    if (e.st === 'sleep') i = 1;
    else if (e.st === 'lunge') {
      const cuadro = 1 + Math.min(2, Math.floor((1 - clamp(e.tt / .25, 0, 1)) * 3));
      if (garzaAtaqueForge.complete && garzaAtaqueForge.naturalWidth) {
        c.drawImage(garzaAtaqueForge, (cuadro % 2) * 256 + 45, Math.floor(cuadro / 2) * 256 + 47, 172, 151, -12.25, 1 - 21.5, 24.5, 21.5); return;
      }
      i = 0; // El ataque anterior tenía el pico recortado.
    }
    else if (e.st === 'gone') i = 9;
    else { const anda = Math.abs(e.vx || 0) > 1 || e.beh === 'strike' && e.tt <= 0; i = anda ? [3, 4][Math.floor((e.anim || t) * 3) % 2] : [0, 1, 2, 1][Math.floor((e.anim || t) * 1.2) % 4]; }
    spr(c, 'garza' + i, 0, 1);
  });
  envuelve('zancudo', (c, e, t) => {
    for (let k = 0; k < 4; k++) {
      const a = t * 9 + k * 2.1, x = Math.cos(a) * 5 + Math.sin(t * 3 + k) * 2, y = -5 + Math.sin(a * 1.3) * 3.5;
      spr(c, 'zancudo' + ((Math.floor(t * 20) + k) % 3), x, y, { ay: .5, voltea: Math.cos(a) < 0 });
    }
  });
  window.ESTERO_OCASO = { IMG, TAM, listo, rehaz, garzaAtaqueForge, activo: () => ACTIVO };
})();
