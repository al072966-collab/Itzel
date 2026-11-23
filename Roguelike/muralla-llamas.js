'use strict';
// Muralla en llamas: acabados de amate; mecánicas y zonas quedan intactas.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.fuego) return;
  const V = vestirNivel({ id: 'fuego', carpeta: 'muralla-llamas', ver: 3, manifiesto: window.MURALLA_LLAMAS_MANIFIESTO });
  const { spr, h1 } = V;
  // ---- el rediseño (tools/toma-1685.py → assets/toma-1685): panorama, terreno, brasas, tablones, agua y decoración nuevos ----
  const NMAN = window.TOMA1685_MANIFIESTO || {}; let nFaltan = Object.keys(NMAN).length;
  for (const n of Object.keys(NMAN)) {
    const im = new Image(); im.decoding = 'async'; im.onload = im.onerror = () => { if (--nFaltan === 0) V.rehaz(); };
    im.src = '../Roguelike/assets/toma-1685/' + n + '.webp?v=1'; V.IMG['n_' + n] = im; V.TAM['n_' + n] = NMAN[n];
  }
  const nuevo = () => nFaltan === 0 && Object.keys(NMAN).length > 0;
  const ciudadAmate = new Image(), solAmate = new Image(), garitaAmate = new Image();
  ciudadAmate.onload = solAmate.onload = garitaAmate.onload = () => V.rehaz();
  ciudadAmate.src = '../Roguelike/assets/muralla-llamas/ciudad-amate-v1.png';
  solAmate.src = '../Roguelike/assets/muralla-llamas/sol-amate-v1.png';
  garitaAmate.src = '../Roguelike/assets/muralla-llamas/garita-amate-v1.png';
  // telón: la ciudad lejana ardiendo (de la lámina) y humo que sube; el telón de amate de antes se queda debajo
  V.cielo((c, f, antes) => {
    const id = (f.g && f.g.def && f.g.def.id) || (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id);
    if (id === 'fuego' && nuevo()) {
      // el panorama nuevo: se recorre de la iglesia (inicio) a los barcos y el ocaso (final); su muralla queda a ras del piso
      const H = VH, base = 176, alto = base / .89,   // (el motor ya agranda el telón cuando la ventana es alta)
         ancho = Math.max(alto * 3, VW * 1.4), im = V.IMG.n_fondo;
      const p = clamp((f.cam - L.camMin) / Math.max(1, L.camMax - L.camMin), 0, 1);
      c.save(); const mar = c.createLinearGradient(0, base, 0, H); mar.addColorStop(0, '#2f8f86'); mar.addColorStop(1, '#14524f'); c.fillStyle = mar; c.fillRect(-2, base - 4, VW + 4, H - base + 8);
      c.drawImage(im, -p * (ancho - VW), base - alto * .89, ancho, alto);
      // brasas del incendio que suben (de adorno: no son peligros)
      c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 26; i++) {
        const ph = (f.t * (.05 + h1(i, 21) * .07) + h1(i, 22)) % 1, x = ((h1(i, 23) * (VW + 40) - f.cam * .2 + Math.sin(f.t + i) * 8) % (VW + 40) + VW + 40) % (VW + 40) - 20;
        c.fillStyle = 'rgba(255,160,55,' + ((1 - ph) * .5).toFixed(3) + ')'; c.fillRect(x, base - 20 - ph * (base - 30), 2, 2);
      }
      c.restore(); return;
    }
    if (id === 'fuego' && ciudadAmate.complete && ciudadAmate.naturalWidth && solAmate.complete && solAmate.naturalWidth) {
      // La base de la hilera queda a ras de la plataforma; se repite en profundidad.
      const ancho = 730, alto = ancho * ciudadAmate.naturalHeight / ciudadAmate.naturalWidth;
      const base = 183 - (f.y0 || 0), off = ((f.cam * .1 % ancho) + ancho) % ancho;
      c.save();
      c.fillStyle = '#a75e32'; c.fillRect(0, 0, VW, f.H || VH);
      for (let x = -off - ancho; x < VW + ancho; x += ancho) c.drawImage(ciudadAmate, x, base - alto, ancho + 1, alto);
      c.drawImage(solAmate, VW * .73, 20 - (f.y0 || 0), 70, 70);
      // Las brasas siguen siendo móviles y no afectan la simulación.
      c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 30; i++) {
        const ph = (f.t * (.05 + h1(i, 21) * .07) + h1(i, 22)) % 1;
        const x = ((h1(i, 23) * (VW + 40) - f.cam * .2 + Math.sin(f.t + i) * 8) % (VW + 40) + VW + 40) % (VW + 40) - 20;
        c.fillStyle = 'rgba(255,160,55,' + ((1 - ph) * .5).toFixed(3) + ')';
        c.fillRect(x, 190 - ph * 190, 2, 2);
      }
      c.restore(); return;
    }
    antes();
    const u = 260, off = (f.cam * .1) % u, base = Math.floor(f.cam * .1 / u);
    c.save(); c.globalAlpha = .5;
    for (let k = -1; k * u - off < VW + u; k++) spr(c, 'skyline', k * u - off, 182, { ay: 1, ax: 0, k: 1.15 });
    c.restore();
    const g = c.createLinearGradient(0, 120, 0, 200); g.addColorStop(0, 'rgba(120,40,20,0)'); g.addColorStop(1, 'rgba(160,60,20,.28)'); c.fillStyle = g; c.fillRect(0, 120, VW, 80);
    // resplandor del incendio que late sobre toda la ciudad
    c.save(); c.globalCompositeOperation = 'lighter'; const pu = .8 + .2 * Math.sin(f.t * 2.3 + Math.sin(f.t * 5) * .5);
    const rg = c.createRadialGradient(VW * .5, 190, 10, VW * .5, 190, 270); rg.addColorStop(0, 'rgba(255,120,40,' + (.28 * pu).toFixed(3) + ')'); rg.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = rg; c.fillRect(0, 40, VW, 200); c.restore();
    // barcos piratas con bandera negra, recortados en tinta, que navegan despacio al fondo; uno ya lleva la vela en llamas
    const ub = 380, offb = (f.cam * .05 + f.t * 3) % ub, baseb = Math.floor((f.cam * .05 + f.t * 3) / ub);
    for (let k = -1; k * ub - offb < VW + ub; k++) {
      const i = baseb + k, x = k * ub - offb + 60 + h1(i, 7) * 120, y = 176, ard = h1(i, 8) > .5;
      c.save(); c.translate(x, y); c.globalAlpha = .85; c.fillStyle = '#2a1810'; c.strokeStyle = '#2a1810'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(-24, -6); c.lineTo(24, -6); c.lineTo(17, 4); c.lineTo(-18, 4); c.closePath(); c.fill();
      c.fillRect(-1, -42, 2, 38); c.fillRect(-14, -28, 2, 22); c.fillRect(11, -24, 2, 18);
      c.fillStyle = ard ? '#7a2a1a' : '#e9d9b4'; c.beginPath(); c.moveTo(1.5, -40); c.quadraticCurveTo(14 + Math.sin(f.t * 2 + i) * 1.5, -28, 1.5, -10); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#e9d9b4'; c.beginPath(); c.moveTo(-12.5, -26); c.quadraticCurveTo(-4, -18, -12.5, -8); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#111'; c.fillRect(-1, -48, 11, 6); c.fillStyle = '#e9d9b4'; c.fillRect(2.5, -46.4, 1.6, 1.6); c.fillRect(6, -46.4, 1.6, 1.6); c.fillRect(3.6, -44.4, 3.2, .8);
      c.restore();
      if (ard) { c.save(); c.globalCompositeOperation = 'lighter'; for (let q = 0; q < 5; q++) { const ph = (f.t * 1.1 + q * .2 + i) % 1; glowDot(c, x + 4 + Math.sin(ph * 8 + q) * 3, y - 14 - ph * 26, 5 + (1 - ph) * 5, '#ff8030', .5 * (1 - ph)); } c.restore(); }
      const cf = (f.t * .5 + h1(i, 9) * 3) % 3; if (cf < .3) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x + 24, y - 2, 11 * (1 - cf / .3) + 3, '#ffe08a', .9 * (1 - cf / .3)); c.restore(); }
      for (let q = 0; q < 5; q++) { const ph = ((f.t * .35 + q / 5 + h1(i, 9)) % 1); c.fillStyle = 'rgba(70,50,40,' + (.35 * (1 - ph)).toFixed(3) + ')'; c.beginPath(); c.arc(x + 26 + ph * 20, y - 2 - ph * 14, 2 + ph * 5, 0, 6.2832); c.fill(); }
    }
    // brasas de papel (rombitos rojos y naranjas) que suben de la ciudad y giran
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 42; i++) {
      const w = VW + 40, ph = (f.t * (.05 + h1(i, 21) * .07) + h1(i, 22)) % 1, x = ((h1(i, 23) * w - f.cam * (.18 + h1(i, 24) * .2) + Math.sin(f.t * 1.2 + i) * 8) % w + w) % w - 20, y = 200 - ph * 190, a = (1 - ph) * (.55 + .45 * Math.sin(f.t * 8 + i));
      c.save(); c.translate(x, y); c.rotate(f.t * 2 + i); c.fillStyle = h1(i, 25) > .5 ? 'rgba(255,100,40,' + a.toFixed(3) + ')' : 'rgba(255,190,70,' + a.toFixed(3) + ')'; c.fillRect(-1.2, -1.2, 2.4, 2.4); c.restore();
    }
    c.restore();
  });
  let piedra = null, yeso = null;
  // terreno nuevo del nivel principal: yeso pintado bajo el piso, cornisa de piedra con abanicos sobre cada borde y adornos apoyados
  const terrAntes = STYLE_MAP.fuego.terrain;
  STYLE_MAP.fuego.terrain = function (ctx, f) {
    if (!nuevo() || !V.es(f.st)) return terrAntes.apply(this, arguments);
    ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip();
    if (!yeso) { yeso = ctx.createPattern(V.IMG.n_yeso, 'repeat'); yeso.setTransform(new DOMMatrix().scale(V.TAM.n_yeso.w / V.IMG.n_yeso.naturalWidth)); }
    ctx.fillStyle = yeso; ctx.fillRect(0, 0, L.ww, VH + 40);
    const gr = ctx.createLinearGradient(0, 150, 0, VH); gr.addColorStop(0, 'rgba(70,26,10,0)'); gr.addColorStop(1, 'rgba(60,20,10,.6)'); ctx.fillStyle = gr; ctx.fillRect(0, 150, L.ww, VH);
    ctx.restore();
    ctx.save(); allLoopsPath(ctx, L.loops); ctx.strokeStyle = 'rgba(46,18,8,.8)'; ctx.lineWidth = 1.1; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
    const sw = V.TAM.n_suelo.w;
    for (const t of L.tops) {
      ctx.save(); ctx.beginPath(); ctx.rect(t.x0, t.y - 2, t.x1 - t.x0, 20); ctx.clip();
      for (let x = t.x0; x < t.x1; x += sw - .5) V.spr(ctx, 'n_suelo', x, t.y - .8, { ax: 0, ay: 0 });
      ctx.restore();
    }
    // adornos apoyados en el borde (solo si caben enteros sobre el tramo; si no, algo más chico o nada)
    const cabe = (x, y, w) => L.tops.some(t => Math.abs(t.y - y) < 2 && x - w / 2 >= t.x0 + 1 && x + w / 2 <= t.x1 - 1);
    const GRANDES = ['n_casa_rosa', 'n_fuerte', 'n_arbol0', 'n_casa_azul', 'n_arbol1', 'n_casa_amarilla'], CHICOS = ['n_flor0', 'n_flor1', 'n_flor2'];
    for (const o of L.deco) {
      const x = o.x + 8, y = o.y + .5, i = o.i;
      if (o.k === 'T') {
        const g = GRANDES[i % GRANDES.length], c2 = CHICOS[i % CHICOS.length];
        if (cabe(x, y, V.TAM[g].w)) V.spr(ctx, g, x, y);
        else if (cabe(x, y, V.TAM[c2].w)) V.spr(ctx, c2, x, y);
      } else if (o.k === 'f') V.spr(ctx, ['barriles', 'caja', 'saco', 'balas', 'cubeta0', 'cubeta1'][i % 6], x, y, { voltea: V.h1(i, 7) < .5 });
      else if (o.k === 'r') V.spr(ctx, ['puerta0', 'balcon', 'puerta1', 'ventana', 'almenas', 'puerta2'][i % 6], x, y);
    }
  };
  V.terreno(ctx => {
    if (V.listo('piedra')) {   // sillares bajo el piso y la cornisa de piedra de la lámina sobre cada borde (el fuego y los tablones siguen siendo los de antes)
      if (!piedra) { piedra = ctx.createPattern(V.IMG.piedra, 'repeat'); piedra.setTransform(new DOMMatrix().scale(V.TAM.piedra.w / V.IMG.piedra.naturalWidth)); }
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip(); ctx.globalAlpha = .4; ctx.fillStyle = piedra; ctx.fillRect(0, 0, L.ww, VH + 40); ctx.globalAlpha = 1; ctx.restore();
    }
    for (const o of L.deco) {
      const x = o.x + 8, y = o.y + .5, i = o.i, v = V.h1(i, 7);
      if (o.k === 'T') {
        const id = typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id;
        if (id === 'fuego' && garitaAmate.complete && garitaAmate.naturalWidth) {
          ctx.drawImage(garitaAmate, 522, 320, 634, 376, x - 20, y - 24, 40, 24);
        } else spr(ctx, ['bandera', 'casaQ', 'garita', 'bandera', 'fuerteQ'][i % 5], x, y);
      }
      else if (o.k === 'f') spr(ctx, ['barriles', 'caja', 'saco', 'balas', 'cubeta0', 'cubeta1'][i % 6], x, y, { voltea: v < .5 });
      else if (o.k === 'r') spr(ctx, ['puerta0', 'balcon', 'puerta1', 'ventana', 'almenas', 'puerta2'][i % 6], x, y);
    }
  });
  V.fd('incendiario', (c, e, t, s, antes) => {
    if (e.st === 'sleep') {
      const assets = window.ENEMIGOS_ASSETS, hoja = assets?.hojaForge('incendiario');
      if (!hoja?.complete || !hoja.naturalWidth) return V.dormido(c, 'pirata0', t);
      c.save(); c.rotate(-.12); c.filter = 'saturate(.6) brightness(.82)';
      assets.pinta(c, e, t, 'incendiario', assets.recurso('incendiario')); c.restore(); return;
    }
    antes(c, e, t, s);                                        // conserva el diseño de amate con las poses Forge
  }, 'pirata0');
  V.fd('magma', (c, e, t, s, antes) => {
    if (e.piedra && e.st === 'glass') {
      // El bloque físico está entre x=-8..8 e y=-14..0: la línea es su techo.
      c.save(); c.beginPath(); c.rect(-8, -14, 16, 14); c.clip(); if (nuevo()) c.drawImage(V.IMG.n_magma_frio, -8, -14, 16, 14); else spr(c, 'magmaFrio', 0, 0, { h: 14 }); c.restore();
      c.strokeStyle = '#d1d6d2'; c.lineWidth = .8; c.beginPath(); c.moveTo(-8, -14); c.lineTo(8, -14); c.stroke(); return;
    }
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('magma');
    if (hoja?.complete && hoja.naturalWidth && e.st !== 'sleep') { antes(c, e, t, s); return; }
    spr(c, 'magma0', 0, .5);
  }, 'magma0');
  V.fd('salamandra', (c, e, t, s, antes) => {
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('salamandra');
    if (e.st === 'sleep') {
      if (!hoja?.complete || !hoja.naturalWidth) return V.dormido(c, 'salamandra0', t);
      c.save(); c.rotate(-.12); c.filter = 'saturate(.6) brightness(.82)'; antes(c, e, t, s); c.restore(); return;
    }
    if (hoja?.complete && hoja.naturalWidth) return antes(c, e, t, s);
    spr(c, 'salamandra' + (Math.floor((e.anim || t) * 4) % 2), 0, .5);
  }, 'salamandra0');
  V.fd('iguana', (c, e, t, s, antes) => {
    if (e.st !== 'ok') return antes(c, e, t, s);
    spr(c, 'iguana' + (Math.floor((e.anim || t) * 5) % 2), 0, .5);
  }, 'iguana0');
  // El fuego, los tablones y el agua siguen a cargo de sus dibujos originales.
  // ---- brasas encendidas, piedra fría, tablones, chorro de agua y meta (solo dibujo: daño, tiempos y zonas siguen siendo los de mecanicas-nuevas.js) ----
  V.obj('brasas', (c, o, f, sk, antes) => {
    const t = f.t, w = o.x1 - o.x0, k = V.TAM.n_brasas_calientes.w, g = c.createLinearGradient(0, o.y, 0, VH);
    g.addColorStop(0, '#9a2a14'); g.addColorStop(.3, '#5a1a12'); g.addColorStop(1, '#240808'); c.fillStyle = g; c.fillRect(o.x0, o.y + 6, w, VH - o.y);
    for (let x = o.x0; x < o.x1 - .5; x += k - .6) { c.save(); c.beginPath(); c.rect(x, o.y - 8, Math.min(k, o.x1 - x), 24); c.clip(); V.spr(c, 'n_brasas_calientes', x, o.y - 1, { ax: 0, ay: 0 }); c.restore(); }
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .22 + Math.sin(t * 6) * .08; const gl = c.createLinearGradient(0, o.y - 4, 0, o.y + 12); gl.addColorStop(0, 'rgba(255,150,40,0)'); gl.addColorStop(.5, 'rgba(255,150,40,1)'); gl.addColorStop(1, 'rgba(255,90,20,0)'); c.fillStyle = gl; c.fillRect(o.x0, o.y - 4, w, 16); c.restore();
    for (let x = o.x0 + 6; x < o.x1 - 4; x += 15) { const a = .8 + Math.sin(t * 11 + x) * .2; V.spr(c, 'n_fuego0', x + Math.sin(t * 3 + x) * .6, o.y + 5, { ay: 1, k: .7 * a, alfa: .95 }); }
    for (let x = o.x0 + 10; x < o.x1 - 8; x += 52) { const u = ((t * .35 + x * .013) % 1); V.spr(c, 'n_humo' + ((x / 52 | 0) % 2), x + Math.sin(u * 5 + x) * 3, o.y - 6 - u * 26, { ay: 1, alfa: .55 * (1 - u), k: .7 + u * .4 }); }
    if (Math.random() < w / 900) spawn(f.g, 1, o.x0 + Math.random() * w, o.y, { ang: -Math.PI / 2, spread: .5, v: 40, life: 1, s: 1, k: 'spark', cols: ['#ffe800', '#ff6c2f'], g: -20 });
  }, 'n_brasas_calientes');
  V.obj('basalto', (c, s, f, sk, antes) => {
    const u = clamp(s.life / 7, 0, 1);
    c.fillStyle = '#5a5660'; c.fillRect(s.x + 1, s.y + 3, s.w - 2, s.h - 3); c.fillStyle = '#7a7680'; c.fillRect(s.x + 1, s.y + 3, s.w - 2, 2);
    V.spr(c, 'n_brasas_frias', s.x, s.y - 3, { ax: 0, ay: 0, w: s.w });
    if (u < .3) { V.spr(c, 'n_brasas_calientes', s.x, s.y - 3, { ax: 0, ay: 0, w: s.w, alfa: 1 - u / .3 }); if (Math.random() < .1) spawn(f.g, 1, s.x + Math.random() * s.w, s.y, { ang: -Math.PI / 2, spread: .4, v: 15, life: 1, s: 2, k: 'dust', cols: ['rgba(220,230,255,.6)'], g: -15 }); }
  }, 'n_brasas_frias', 'drawSolid');
  V.look('tablonArde', (c, pl, f, sk, antes) => {
    const a = clamp((pl.arde || 0) / 2.6, 0, 1);
    V.spr(c, 'n_tablon', pl.x, pl.y - .8, { ax: 0, ay: 0, w: pl.w });
    if (a > .02) V.spr(c, 'n_tablon_quemado', pl.x, pl.y - .8, { ax: 0, ay: 0, w: pl.w, alfa: a });
    if (a > .05) for (let k = 0; k < pl.w / 8; k++) { const h = .55 + hash1(k, Math.floor(f.t * 10)) * .5; V.spr(c, 'n_fuego0', pl.x + 4 + k * 8, pl.y + 2, { ay: 1, k: .7 * a * h + .1, alfa: .95 }); }
  }, 'n_tablon');
  V.obj('chorro', (c, o, f, sk, antes) => {
    const k = 1 - o.life / .35, dx = o.x1 - o.x0, dy = o.y1 - o.y0, d = Math.hypot(dx, dy) || 1, len = d * Math.min(1, k * 2.6 + .3), h = clamp(len * .24, 5, 12);
    c.save(); c.translate(o.x0, o.y0); c.rotate(Math.atan2(dy, dx)); c.globalAlpha = 1 - k * .55; c.imageSmoothingEnabled = true; c.drawImage(V.IMG.n_chorro2, 0, -h / 2, len, h); c.restore();
    if (k > .3) V.spr(c, 'n_salpica', o.x1, o.y1 + 2, { ay: 1, k: .6 + k * .5, alfa: 1 - (k - .3) / .7 });
  }, 'n_chorro2');
  { const metaAntes = STYLE_MAP.fuego.goal;
    STYLE_MAP.fuego.goal = function (ctx, x, y, t, f) { if (!nuevo() || !V.es(f && f.st)) return metaAntes.apply(this, arguments); V.spr(ctx, 'n_puerta', x, y + 1.5, { ay: 1 }); }; }
  V.moneda('n_canistel', 10); V.corazon('n_corazon', 9);
  window.MURALLA_LLAMAS = V;
})();
