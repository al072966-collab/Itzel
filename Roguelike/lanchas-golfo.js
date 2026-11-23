'use strict';
// =====================================================================
//  LANCHAS DEL GOLFO, CON SUS ASSETS
//  La bahía de Champotón de día, en estilo geométrico: formas planas por
//  capas con el mismo contorno azul marino de los assets. El telón se
//  dibuja aquí, inspirado en el panorama (sin usarlo como imagen): cielo
//  con franjas, nubes crema con contorno, islas, el malecón de Campeche
//  con su baluarte, casas de colores y catedral, y el mar con franjas que
//  se mueven. Lo de enfrente usa los assets de tools/lanchas-golfo.py
//  (Roguelike/assets/golfo, 6 px por unidad):
//    · lanchas, veleros (vela floja y vela inflada con la ráfaga) y boyas,
//      con la cubierta medida en cada sprite para que caiga justo sobre la
//      colisión;
//    · zopilote y fragata (aleteo y picada), bucanero (quieto, lanza su
//      bomba, golpeado y vencido) y su bomba; la ráfaga de Fresita con los
//      remolinos de viento de la lámina (sin el bucanero que sopla);
//    · palmeras, faro, mangle, pilotes, redes, conchas y rocas; canistel,
//      corazón y el muelle con su puerta de llegada.
//  El terreno morado de antes se queda (como las rocas del panorama), con
//  una franja de arena encima. Nada de esto cambia colisiones ni mecánicas.
//  Solo aplica al estilo «flat»; si una imagen no ha cargado, se pinta lo
//  de antes.
// =====================================================================
(function () {
  if (typeof STYLE_MAP === 'undefined' || !STYLE_MAP.flat || typeof MEC === 'undefined') return;
  const { LOOK, FD, OBJ, POW } = MEC, ST = STYLE_MAP.flat, RUTA = '../Roguelike/assets/golfo/', AZUL = '#2a2347';
  const TAM = {}, IMG = {};
  const listo = n => { const im = IMG[n]; return !!(im && im.complete && im.naturalWidth && TAM[n]); };
  let faltan = 1;
  (window.GOLFO_MANIFIESTO ? Promise.resolve(window.GOLFO_MANIFIESTO) : fetch(RUTA + 'golfo.json?v=7').then(r => r.json())).then(m => {
    Object.assign(TAM, m); faltan = Object.keys(m).length;
    for (const n of Object.keys(m)) { const im = new Image(); im.decoding = 'async'; im.onload = im.onerror = () => { if (--faltan === 0) rehaz(); }; im.src = RUTA + n + '.png?v=7'; IMG[n] = im; }
  }).catch(() => { faltan = -1; });
  function rehaz() { if (typeof CACHE !== 'undefined') for (const k of [...CACHE.keys()]) if (k.startsWith('flat@')) CACHE.delete(k); }

  let ACTIVO = false;
  const esGolfo = st => !!st && st.id === 'flat' && !window.estiloArteDerivado;
  if (typeof renderScene === 'function') {
    GANCHOS.en('renderScene', antes => function (ctx, st) { const a = ACTIVO; ACTIVO = esGolfo(st); try { return antes.apply(this, arguments); } finally { ACTIVO = a; } });
  }
  function spr(c, n, x, y, o = {}) {
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';   // las piezas vienen a 6 px por unidad: que se reduzcan bien
    const t = TAM[n], w = t.w * (o.k || 1), h = t.h * (o.k || 1), ax = o.ax ?? .5, ay = o.ay ?? 1;
    if (!o.voltea) { c.drawImage(IMG[n], x - w * ax, y - h * ay, w, h); return; }
    c.save(); c.translate(x, y); c.scale(-1, 1); c.drawImage(IMG[n], -w * ax, -h * ay, w, h); c.restore();
  }
  const h1 = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  // trazo plano con el contorno de los assets
  const plano = (x, col, lw = .8) => { x.fillStyle = col; x.fill(); x.strokeStyle = AZUL; x.lineWidth = lw; x.lineJoin = 'round'; x.stroke(); };

  const FONDO_GOLFO_FLAT = {};
  for (const [n, archivo] of Object.entries({ cielo:'fondo-bahia-champoton.webp', ola:'ola-soporte-v1.png', suelo:'suelo-golfo-v1.png', arena:'arena-golfo-v1.png' })) {   // la bahía nueva (rediseño de ChatGPT) ya trae la ciudad, el faro y las nubes
    const im = FONDO_GOLFO_FLAT[n] = new Image(); im.decoding = 'async'; im.onload = rehaz; im.src = RUTA + archivo;
  }
  const golfoPrincipal = f => ((f && f.g && f.g.def && f.g.def.id) || (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id)) === 'flat';
  const golfoFondoListo = () => Object.values(FONDO_GOLFO_FLAT).every(im => im.complete && im.naturalWidth);
  function bahiaIlustrada(c,f) {
    const im=FONDO_GOLFO_FLAT.cielo,sw=Math.min(im.naturalWidth,im.naturalHeight*VW/VH),max=Math.max(0,im.naturalWidth-sw),sx=max*(.5+.3*Math.sin((f.cam||0)*.0007));
    c.save(); c.imageSmoothingEnabled=true;
    // El borde del mar conserva la altura de las plataformas y los peces.
    // el agua de la bahía nueva empieza en la fila 541 del panorama: ahí queda el nivel de las plataformas (y = 158)
    c.drawImage(im,sx,0,sw,541,0,0,VW,158); c.drawImage(im,sx,541,sw,im.naturalHeight-541,0,158,VW,VH-158);
    // Fragatas en vuelo con los sprites del mundo, sin siluetas geométricas.
    for(let i=0;i<4;i++) { const n='fragata'+(1+Math.floor(((f.t||0)*5+i)%5)); if(!listo(n))continue;
      const z=VW+70,x=((h1(i,42)*z-(f.cam||0)*.07+(f.t||0)*8)%z+z)%z-35;
      spr(c,n,x,35+h1(i,43)*65,{ay:.5,k:.32,voltea:i%2===0}); }
    c.restore();
  }
  // ---------------- el telón: la bahía de día ----------------
  function nube(x, cx, cy, s) {
    x.beginPath(); x.moveTo(cx - 30 * s, cy);
    x.arc(cx - 18 * s, cy - 4 * s, 9 * s, Math.PI, Math.PI * 1.75); x.arc(cx - 2 * s, cy - 10 * s, 13 * s, Math.PI * 1.1, Math.PI * 1.9); x.arc(cx + 16 * s, cy - 4 * s, 9 * s, Math.PI * 1.25, 0);
    x.lineTo(cx + 30 * s, cy); x.closePath(); plano(x, '#fbf1dc', 1);
    x.save(); x.clip(); x.fillStyle = 'rgba(232,200,170,.55)'; x.fillRect(cx - 32 * s, cy - 4 * s, 64 * s, 6 * s); x.restore();
  }
  function islas(x, w, base) {
    for (let k = 0; k * 260 < w + 260; k++) {
      if (h1(k, 3) < .3) continue;
      const cx = k * 260 + h1(k, 4) * 120, an = 40 + h1(k, 5) * 60, al = 8 + h1(k, 6) * 10;
      x.beginPath(); x.moveTo(cx - an, base); x.quadraticCurveTo(cx - an * .5, base - al * 1.1, cx, base - al); x.quadraticCurveTo(cx + an * .5, base - al * 1.1, cx + an, base); x.closePath(); plano(x, '#4cae6a', .7);
      x.beginPath(); x.moveTo(cx - an * .7, base); x.lineTo(cx - an * .5, base - 3); x.lineTo(cx + an * .5, base - 3); x.lineTo(cx + an * .7, base); x.closePath(); plano(x, '#e9c99a', .6);
    }
  }
  function malecon(x, w, base) {
    // tramos de la ciudad amurallada a la orilla del mar, con huecos de mar entre ellos
    const COL = ['#f07a5a', '#f5c84c', '#3cb6b2', '#ef8f6a', '#f6e7c8', '#e85a6a'];
    for (let k = 0; k * 520 < w + 520; k++) {
      if (h1(k, 11) < .25) continue;
      let px = k * 520 + h1(k, 12) * 120; const fin = px + 180 + h1(k, 13) * 140;
      // la muralla con su garita
      x.beginPath(); x.rect(px - 18, base - 14, 28, 14); plano(x, '#e6cf9f', .7);
      x.beginPath(); x.rect(px - 12, base - 24, 9, 10); plano(x, '#e6cf9f', .6); x.beginPath(); x.arc(px - 7.5, base - 24, 4.5, Math.PI, 0); plano(x, '#e6cf9f', .6);
      for (let i = 0; px < fin; i++) {
        const fw = 14 + h1(k * 9 + i, 14) * 12, fh = 12 + h1(k * 9 + i, 15) * 8, col = COL[Math.floor(h1(k * 9 + i, 16) * COL.length)];
        if (h1(k * 9 + i, 17) < .12) {                                 // la catedral con sus dos torres
          const cw = 30; x.beginPath(); x.rect(px, base - 22, cw, 22); plano(x, '#f3e3c2', .6);
          for (const tx of [px + 1, px + cw - 8]) { x.beginPath(); x.rect(tx, base - 34, 7, 14); plano(x, '#f3e3c2', .6); x.beginPath(); x.arc(tx + 3.5, base - 34, 3.5, Math.PI, 0); plano(x, '#f3e3c2', .6); }
          px += cw; continue;
        }
        x.beginPath(); x.rect(px, base - fh, fw, fh); plano(x, col, .6);
        x.fillStyle = AZUL; for (let wx = px + 3; wx < px + fw - 3; wx += 6) { x.beginPath(); x.moveTo(wx, base - 2); x.lineTo(wx, base - fh + 6); x.arc(wx + 1.5, base - fh + 6, 1.5, Math.PI, 0); x.lineTo(wx + 3, base - 2); x.fill(); }
        if (h1(k * 9 + i, 18) < .3) {                                   // una palmera
          const tx = px + fw; x.strokeStyle = AZUL; x.lineWidth = 1.6; x.beginPath(); x.moveTo(tx, base); x.quadraticCurveTo(tx + 1, base - 12, tx + 2, base - 22); x.stroke(); x.strokeStyle = '#9a6a40'; x.lineWidth = .9; x.stroke();
          for (let h = 0; h < 5; h++) { const a = -Math.PI / 2 + (h - 2) * .6; x.beginPath(); x.moveTo(tx + 2, base - 22); x.quadraticCurveTo(tx + 2 + Math.cos(a) * 6, base - 26 + Math.sin(a) * 3, tx + 2 + Math.cos(a) * 9, base - 20 + Math.sin(a) * 4); x.strokeStyle = '#2f9a68'; x.lineWidth = 1.6; x.stroke(); }
        }
        px += fw;
      }
      x.beginPath(); x.rect(k * 520 + h1(k, 12) * 120 - 20, base - 1, fin - (k * 520 + h1(k, 12) * 120) + 22, 3); plano(x, '#cdb486', .5);   // el muro del malecón
    }
  }
  const MAR = 158;
  function cieloGolfo(ctx, f) {
    screenLayer(ctx, f, 'golfoCielo', x => {
      const g = x.createLinearGradient(0, 0, 0, MAR); g.addColorStop(0, '#2ba4dc'); g.addColorStop(1, '#79d4ee'); x.fillStyle = g; x.fillRect(0, 0, VW, VH);
      x.fillStyle = 'rgba(255,255,255,.12)'; for (const [y, a] of [[28, 30], [70, 22], [104, 18]]) { x.beginPath(); x.moveTo(-10, y + a); x.quadraticCurveTo(VW * .4, y - 6, VW + 10, y + 8); x.lineTo(VW + 10, y + 8 + a * .4); x.quadraticCurveTo(VW * .4, y + a * .5, -10, y + a + a * .4); x.fill(); }
    });
    for (let i = 0; i < 4; i++) { const c = cached(f, 'golfoNube' + i, 80, 34, x => nube(x, 40, 26, .9 + (i % 2) * .3)); ctx.drawImage(c, wrap(i * 150 + 30 - f.cam * .05 - f.t * 2, VW + 120) - 90, 18 + (i * 21) % 46, 80, 34); }
    strip(ctx, f, 'golfoIslas', .05, (x, w) => islas(x, w, MAR));
    // el mar: azul hondo con franjas claras que se mueven
    { const g = ctx.createLinearGradient(0, MAR, 0, VH); g.addColorStop(0, '#1f86c8'); g.addColorStop(1, '#155ea6'); ctx.fillStyle = g; ctx.fillRect(0, MAR, VW, VH - MAR); }
    ctx.fillStyle = AZUL; ctx.fillRect(0, MAR - .5, VW, .8);
    strip(ctx, f, 'golfoMalecon', .12, (x, w) => malecon(x, w, MAR + 1));
    for (let i = 0; i < 14; i++) { const y = MAR + 6 + i * 6 + h1(i, 21) * 4, l = 30 + h1(i, 22) * 60, xx = wrap(h1(i, 23) * VW * 1.5 - f.cam * (.15 + y / VH * .25) + Math.sin(f.t * .4 + i) * 6, VW + l) - l; ctx.fillStyle = i % 3 ? 'rgba(80,200,230,.35)' : 'rgba(170,236,250,.35)'; ctx.beginPath(); ctx.ellipse(xx + l / 2, y, l / 2, 1.3, 0, 0, TAU); ctx.fill(); }
    fragatas(ctx, f, 4, 21, 'rgba(42,35,71,.55)', 50);
  }
  const cieloAntes = ST.sky;
  const hg = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  // la bahía de Champotón con vida: lanchas de pescador que se mecen en el mar lejano, peces que saltan y gaviotas
  function vidaBahia(c, f) {
    const t = f.t || 0, L2 = window.LUGARES_CAMPECHE;
    const u = 300, off = (f.cam * .07) % u, base = Math.floor(f.cam * .07 / u);
    for (let k = -1; k * u - off < VW + u; k++) {
      const i = base + k, x = k * u - off + 40 + hg(i, 3) * 160 + Math.sin(t * .25 + i) * 6, y = 176 + Math.sin(t * 1.4 + i) * 1.2;
      c.save(); c.globalAlpha = .85;
      if (golfoPrincipal(f) && listo('lancha0')) spr(c, 'lancha0', x, y + 2, { k: 35 / TAM.lancha0.w, voltea: hg(i,4) > .5 }); else if (!(L2 && L2.dib(c, 'lancha', x, y + 2, { w: 40, voltea: hg(i, 4) > .5, alfa: .9 }))) { c.fillStyle = '#e8d8b0'; c.fillRect(x - 12, y - 3, 24, 4); }
      c.restore();
      c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = .7; c.beginPath(); c.moveTo(x - 20, y + 3); c.quadraticCurveTo(x, y + 6 + Math.sin(t * 3 + i), x + 20, y + 3); c.stroke();
    }
    // peces que saltan: un arco corto sobre el agua con un anillo al caer
    for (let q = 0; q < (window.FAUNA_ARTE?.listo('pez') ? 3 : 0); q++) {
      const per = 4.2, tt = (t + q * 1.4) % per, n = Math.floor((t + q * 1.4) / per); if (tt > 1) continue;
      const x = 40 + hg(n * 3 + q, 31) * (VW - 80), y0 = 190, y = y0 - Math.sin(tt * Math.PI) * 18;
      FAUNA_ARTE.pieza(c, tt < .35 ? 'pez0' : tt < .62 ? 'pez1' : 'pez2', x + tt * 26, y + 2, { w: 7, ay: .5 });
      if (tt < .18) FAUNA_ARTE.pieza(c, 'pezAgua', x, y0 + 2, { w: 6, alfa: 1 - tt / .18 });
      if (tt > .85) { const u2 = (tt - .85) / .15; c.strokeStyle = 'rgba(255,255,255,' + (.7 * (1 - u2)).toFixed(2) + ')'; c.lineWidth = .7; c.beginPath(); c.ellipse(x + 26, y0 + 2, 2 + u2 * 8, .6 + u2 * 1.8, 0, 0, 6.2832); c.stroke(); }
    }
  }
  ST.sky = function (ctx, f) { if (!esGolfo(f.st)) return cieloAntes.call(this, ctx, f); if (golfoPrincipal(f) && golfoFondoListo()) bahiaIlustrada(ctx, f); else cieloGolfo(ctx, f); try { vidaBahia(ctx, f); } catch (e) { /* el telón nunca rompe la partida */ } };

  // ---------------- el terreno: rocas moradas con arena encima ----------------
  const terrenoAntes = ST.terrain;
  ST.terrain = function (ctx, f) {
    if (window.estiloArteDerivado || faltan !== 0) return terrenoAntes.call(this, ctx, f);
    const deco = L.deco; L.deco = [];
    try { terrenoAntes.call(this, ctx, f); } finally { L.deco = deco; }
    if (golfoPrincipal(f) && golfoFondoListo()) {
      ctx.save(); allLoopsPath(ctx,L.loops); ctx.clip();
      const p=ctx.createPattern(FONDO_GOLFO_FLAT.suelo,'repeat'); p.setTransform(new DOMMatrix().scale(160/FONDO_GOLFO_FLAT.suelo.naturalWidth));
      ctx.fillStyle=p; ctx.fillRect(0,0,L.ww,VH+40); ctx.restore();
    }
    for (const r of L.tops) {                                         // la franja de arena, plana y con su contorno
      if (golfoPrincipal(f) && golfoFondoListo()) {
        ctx.save(); ctx.beginPath(); ctx.rect(r.x0,r.y-2,r.x1-r.x0,8); ctx.clip();
        for(let x=r.x0;x<r.x1;x+=110) ctx.drawImage(FONDO_GOLFO_FLAT.arena,0,316,2172,95,x,r.y-1.4,110,4.8);
        ctx.restore();
      } else {
      const a = r.x0 - 1, b = r.x1 + 1;
      ctx.beginPath(); ctx.moveTo(a, r.y - 1.4); ctx.lineTo(b, r.y - 1.4); ctx.lineTo(b, r.y + 4); for (let x = b; x >= a; x -= 6) ctx.lineTo(x, r.y + 4 + Math.sin(x * .25) * 1.2); ctx.closePath();
      ctx.fillStyle = '#f2d39a'; ctx.fill(); ctx.strokeStyle = AZUL; ctx.lineWidth = .7; ctx.stroke();
      ctx.fillStyle = 'rgba(217,170,110,.6)'; for (let x = a + 4; x < b - 4; x += 7 + h1(x | 0, 2) * 9) ctx.fillRect(x, r.y + .6 + h1(x | 0, 3) * 2, 1.4, .8);
      }
      for (let x = r.x0 + 14; x < r.x1 - 14; x += 28 + h1(x | 0, r.y) * 40) if (h1(x | 0, 9) > .55) spr(ctx, 'concha' + Math.floor(h1(x | 0, 10) * 5), x, r.y + .5, { voltea: h1(x | 0, 11) < .5 });
    }
    for (const o of L.deco) {
      const x = o.x, y = o.y + 1;
      if (o.k === 'T') spr(ctx, ['palmera', 'faro', 'mangle', 'palmera'][o.i % 4], x, y, { voltea: o.i % 2 === 1 });
      else if (o.k === 'f') spr(ctx, ['red', 'costal', 'roca0'][o.i % 3], x, y);
      else if (o.k === 'r') spr(ctx, ['pilotes', 'roca1', 'roca0'][o.i % 3], x, y);
    }
  };

  // ---------------- lanchas, veleros y boyas ----------------
  function lanchaAntes(ctx, pl, f, sk) {
    const x = pl.x, y = pl.y, w = pl.w;
    ctx.fillStyle = sk.plat; ctx.beginPath(); ctx.moveTo(x - 3, y); ctx.lineTo(x + w + 4, y); ctx.lineTo(x + w - 2, y + 7); ctx.lineTo(x + 2, y + 7); ctx.closePath(); ctx.fill(); ctx.fillStyle = sk.plat2; ctx.fillRect(x - 2, y + 2, w + 5, 1.6); ctx.fillStyle = sk.accent; ctx.fillRect(x + w * .2, y - 6, 1.2, 6);
    ctx.beginPath(); ctx.moveTo(x + w * .2 + 1.2, y - 6); ctx.lineTo(x + w * .2 + 7, y - 2); ctx.lineTo(x + w * .2 + 1.2, y - 1); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(x - 6, y + 8); ctx.lineTo(x + w + 6, y + 8); ctx.stroke();
  }
  // un sprite de cubierta: la fila de la cubierta cae justo en pl.y
  function cubierta(ctx, n, pl, ancho, voltea, deck, ax) {
    const t = TAM[n], k = ancho / t.w, d = deck ?? t.cubierta ?? 0;
    spr(ctx, n, pl.x + pl.w / 2, pl.y - .4, { ay: d, k, voltea, ax });
    return k;
  }
  function estela(ctx, pl, f, dir) {                                 // la espuma que deja al moverse
    const x0 = dir > 0 ? pl.x - 2 : pl.x + pl.w + 2, y = pl.y + 7;
    ctx.save(); ctx.fillStyle = 'rgba(240,252,255,.75)';
    for (let i = 0; i < 4; i++) { const l = 6 + i * 3, a = (f.t * 3 + i * .7) % 1; ctx.globalAlpha = .7 * (1 - a); ctx.beginPath(); ctx.ellipse(x0 - dir * (i * 4 + a * 6), y + (i % 2), l / 2, 1, 0, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  // una lancha (o velero, o boya) que va más alto que el mar no puede ir flotando en el aire: la carga una ola,
  // una columna de agua con su cresta de espuma que baja hasta el mar (o hasta las rocas) y viaja con ella
  const MAR_JUEGO = 166;
  function ola(c, pl, f, ancho) {
    if (pl.y >= MAR_JUEGO) return;
    const cx = pl.x + pl.w / 2, top = pl.y + 4, fin = sueloDebajo(cx, pl.y) ?? fondoVista(), w = ancho * .62, t = f.t + (pl.x0 || 0) * .01;
    if (golfoPrincipal(f) && golfoFondoListo() && fin > top) {
      c.save(); c.imageSmoothingEnabled=true;
      c.drawImage(FONDO_GOLFO_FLAT.ola,112,86,784,1407,cx-ancho*.48,top-1,ancho*.96,fin-top+1);
      c.restore(); return;
    }
    const onda = k => Math.sin(t * 3 + k) * 1.6;
    c.save(); c.beginPath(); c.moveTo(cx - w / 2 - 6, fin);
    for (let y = fin; y > top + 4; y -= 6) c.lineTo(cx - w / 2 + onda(y * .15), y);
    c.quadraticCurveTo(cx - w / 2 - 3, top, cx - w * .2, top - 1); c.lineTo(cx + w * .25, top - 1); c.quadraticCurveTo(cx + w / 2 + 4, top, cx + w / 2 + 2, top + 5);
    for (let y = top + 5; y < fin; y += 6) c.lineTo(cx + w / 2 + onda(y * .15 + 2), y);
    c.lineTo(cx + w / 2 + 6, fin); c.closePath();
    const g = c.createLinearGradient(0, top, 0, fin); g.addColorStop(0, '#6fd3ee'); g.addColorStop(.4, '#2b9ad3'); g.addColorStop(1, '#1b6fb4');
    c.fillStyle = g; c.fill(); c.strokeStyle = AZUL; c.lineWidth = .7; c.stroke();
    c.clip(); c.fillStyle = 'rgba(240,252,255,.55)';
    for (let i = 0; i < 6; i++) { const y = top + 6 + ((t * 14 + i * 13) % Math.max(8, fin - top)); c.fillRect(cx - w / 2, y, w, .8); }
    c.restore();
    c.fillStyle = '#f4fbff'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(cx - w / 2 + (i + .5) * w / 5, top + Math.sin(t * 5 + i) * .6, 1.6, 0, TAU); c.fill(); }
  }
  LOOK.lancha = (ctx, pl, f, sk) => {
    if (!ACTIVO || !listo('lancha0')) return lanchaAntes(ctx, pl, f, sk);
    const v = Math.floor(h1(Math.round(pl.x0), 7) * 3), dx = pl.x - (pl._px ?? pl.x); pl._px = pl.x;
    if (Math.abs(dx) > .01) pl._dir = Math.sign(dx);
    const dir = pl._dir || 1; ola(ctx, pl, f, pl.w + 12); if (Math.abs(dx) > .01 && pl.y >= MAR_JUEGO) estela(ctx, pl, f, dir);
    cubierta(ctx, 'lancha' + v, pl, pl.w + 12, dir < 0);
  };
  const veleroAntes = LOOK.velero;
  if (veleroAntes) LOOK.velero = (c, pl, f, sk) => {
    if (!ACTIVO || !listo('velero0')) return veleroAntes(c, pl, f, sk);
    const sopla = Math.max(0, (pl.sopla = Math.max(0, (pl.sopla || 0) - 1 / 60)));     // como antes: la ráfaga se apaga sola
    const inflada = sopla > .02 || Math.abs(pl.vx || 0) > 8;
    const t0 = TAM.velero0, t1 = TAM.velero1, deck1 = 1 - (t0.h * (1 - t0.cubierta)) / t1.h;   // el mismo casco: la cubierta se mide desde abajo
    ola(c, pl, f, pl.w + 10); if (Math.abs(pl.vx || 0) > 8 && pl.y >= MAR_JUEGO) estela(c, pl, f, Math.sign(pl.vx));
    // alineados por la proa: la vela inflada sobresale hacia atrás, el casco no se mueve
    cubierta(c, inflada ? 'velero1' : 'velero0', pl, (pl.w + 10) * (inflada ? t1.w / t0.w : 1), false, inflada ? deck1 : t0.cubierta, inflada ? 1 - (t0.w / 2) / t1.w : .5);
  };
  const boyaAntes = LOOK.boya;
  if (boyaAntes) LOOK.boya = (c, pl, f, sk) => {
    if (!ACTIVO || !listo('boya0')) return boyaAntes(c, pl, f, sk);
    const v = Math.floor(h1(Math.round(pl.x0), 8) * 2);
    ola(c, pl, f, pl.w + 8); cubierta(c, 'boya' + v, pl, pl.w + 2, false);
  };

  // ---------------- la ráfaga de Fresita, con los remolinos de la lámina ----------------
  if (POW.rafaga) {
    const soplaAntes = POW.rafaga.click;
    POW.rafaga.click = function (g, x, y, c) {
      const ok = soplaAntes.call(this, g, x, y, c);
      if (ok && g.objs && typeof curStyle === 'function' && curStyle() && curStyle().id === 'flat') {
        const p = g.p, dx = p.x - g.fre.x, dy = (p.y - 8) - g.fre.y, n = Math.hypot(dx, dy) || 1;
        g.objs.push({ k: 'rafagaVista', x: g.fre.x, y: g.fre.y, ux: dx / n, uy: dy / n, t: 0 });
      }
      return ok;
    };
  }
  OBJ.rafagaVista = {
    step(o, g, dt) { o.t += dt; if (o.t > .6) o.dead = true; },
    draw(c, o, f) {
      if (!ACTIVO || !listo('rafaga0')) return;
      const a = 1 - o.t / .6;
      c.save(); c.globalAlpha = a;
      for (let i = 0; i < 4; i++) { const d = 8 + o.t * 90 + i * 10, n = 'rafaga' + (3 - i); spr(c, n, o.x + o.ux * d, o.y + o.uy * d + (i - 1.5) * 3, { ay: .5, voltea: o.ux < 0, k: .5 + i * .08 }); }
      c.restore();
    },
  };

  // ---------------- canistel, corazón y el muelle de llegada ----------------
  if (typeof monedaItzel === 'function') {
    GANCHOS.en('monedaItzel', monedaAntes => function (ctx, x, y, t, f, especial) {
      if (especial || !ACTIVO || !listo('canistel')) return monedaAntes.apply(this, arguments);
      spr(ctx, 'canistel', x, y + Math.sin(t * 2.5 + x * .04) * 1.4, { ay: .5 });
    });
  }
  if (typeof drawHeart === 'function') {
    GANCHOS.en('drawHeart', corazonAntes => function (ctx, x, y) { if (!ACTIVO || !listo('corazon')) return corazonAntes.apply(this, arguments); spr(ctx, 'corazon', x, y, { ay: .5 }); });
  }
  const metaAntes = ST.goal;
  ST.goal = function (ctx, x, y, t, f) {
    if (!esGolfo(f && f.st) || !listo('salida')) return metaAntes.apply(this, arguments);
    spr(ctx, 'salida', x, y + 1, { ay: .8 });
  };

  // ---------------- zopilote, bucanero y fragata ----------------
  const envuelve = (k, fn) => {
    const antes = FD[k]; if (!antes) return;
    const nuevo = function (c, e, t, s) { if (!ACTIVO || e.sub || !listo(k + '0')) return antes.call(this, c, e, t, s); fn(c, e, t, s, antes); };
    nuevo._assetNuevo = true;
    nuevo._assetListo = () => (ACTIVO && listo(k + '0')) || !!(antes._assetListo && antes._assetListo());
    FD[k] = nuevo;
  };
  const ALETEO = [0, 1, 2, 3, 4, 3, 2, 1], PICADA = [5, 6];
  function zopiloteDormido(c, t) {
    c.save(); c.rotate(-.12 + Math.sin(t * 2.2) * .05); c.filter = 'saturate(.6) brightness(.82)';
    spr(c, 'zopilote3', 0, 2); c.restore();
  }
  function cuadroPicada(e, t) {
    if (!e._golfoEnPicada) e._golfoPicadaDesde = t;
    e._golfoEnPicada = true;
    return PICADA[Math.min(PICADA.length - 1, Math.floor(Math.max(0, t - (e._golfoPicadaDesde ?? t)) * 12))];
  }
  envuelve('zopilote', (c, e, t) => {
    if (e.st === 'sleep') return zopiloteDormido(c, t);
    const picada = e.st === 'dive';
    if (!picada) e._golfoEnPicada = false;
    const n = e.st === 'gone' ? 0 : e.st === 'up' ? 1 : picada ? cuadroPicada(e, t) : ALETEO[Math.floor((e.anim ?? t) * 8) % ALETEO.length];
    spr(c, 'zopilote' + n, 0, 2);
  });
  envuelve('fragata', (c, e, t, s, antes) => {
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('fragata');
    if (e.st !== 'gone' && hoja?.complete && hoja.naturalWidth) return antes(c, e, t, s);
    spr(c, 'fragata' + (e.st === 'dive' ? 7 : e.st === 'up' ? 1 : [0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1][Math.floor((e.anim || t) * 8) % 12]), 0, 2);
  });
  function bucaneroDormido(c, t) {
    c.save(); c.rotate(-.08 + Math.sin(t * 2.2) * .04); c.filter = 'saturate(.6) brightness(.82)';
    spr(c, 'bucanero8', 0, 1); c.restore();
  }
  envuelve('bucanero', (c, e, t, s, antes) => {
    let n;
    if (e.st === 'sleep') return bucaneroDormido(c, t);
    if (e.st === 'gone') n = 10;
    else if (e.aturde > 0 || e._golpe > .25) n = 9;
    else {
      const hoja = window.ENEMIGOS_ASSETS?.hojaForge('bucanero');
      if (hoja?.complete && hoja.naturalWidth) { antes(c, e, t, s); return; }
      if (e.tiro > 0) n = e.tiro > .22 ? 5 : e.tiro > .1 ? 6 : 7;
      else n = [0, 1, 2, 3, 4, 3, 2, 1][Math.floor((e.anim ?? t) * 4) % 8];
    }
    spr(c, 'bucanero' + n, 0, 1);
  });
  // la bomba que avienta (antes un coco): la de la lámina, con su mecha prendida
  if (OBJ.bala && OBJ.bala.dibujos.coco) {
    const cocoAntes = OBJ.bala.dibujos.coco;
    OBJ.bala.dibujos.coco = (c, o, f) => {
      if (!ACTIVO || !listo('bomba')) return cocoAntes(c, o, f);
      c.save(); c.translate(o.x, o.y); c.rotate((o.t || 0) * 8); spr(c, 'bomba', 0, 0, { ay: .55, k: 1.1 }); c.restore();
      c.fillStyle = Math.floor(f.t * 20) % 2 ? '#ffd23f' : '#ff6b5b'; c.beginPath(); c.arc(o.x + Math.cos((o.t || 0) * 8 - 1) * 3.4, o.y + Math.sin((o.t || 0) * 8 - 1) * 3.4, .9, 0, TAU); c.fill();
    };
  }
  window.LANCHAS_GOLFO = { IMG, TAM, listo, rehaz, activo: () => ACTIVO };
})();
