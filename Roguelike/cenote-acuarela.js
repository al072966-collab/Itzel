'use strict';
// =====================================================================
//  EL CENOTE DE ACUARELA, CON SUS ASSETS
//  El mundo acuarela se vuelve un cenote: gruta, luz que baja por el ojo
//  del techo y agua turquesa. Lo de fondo se dibuja aquí con lavados de
//  acuarela (David no quiere fondos de imagen); los assets preparados por
//  tools/cenote-acuarela.py (Roguelike/assets/cenote, 3 px por unidad)
//  visten lo de enfrente:
//    · el terreno, el mismo de antes, pasa a piedra caliza; de las orillas
//      que dan al vacío cuelgan raíces y estalactitas, y arriba crecen
//      helechos, monstera, bromelias, orquídeas, heliconias y rocas;
//    · los nenúfares (a flote, hundiéndose y casi abajo) y el loto que
//      brota del poder de Fresita;
//    · la cascada pintada con su salpicadura, el canistel, el corazón y la
//      salida de la gruta;
//    · rana (sentada, brincando, golpeada), mojarra (nadando y en el
//      salto) y libélula (aleteo y arrancón).
//  En el fondo no hay nenúfares: los únicos nenúfares son los que se pisan.
//  Nada de esto cambia colisiones ni mecánicas. Solo aplica al estilo
//  «acuarela»; si una imagen no ha cargado, se pinta lo de antes.
// =====================================================================
(function () {
  if (typeof STYLE_MAP === 'undefined' || !STYLE_MAP.acuarela || typeof MEC === 'undefined') return;
  const { LOOK, FD, OBJ } = MEC, ST = STYLE_MAP.acuarela, RUTA = '../Roguelike/assets/cenote/';
  const TAM = {}, IMG = {};
  const listo = n => { const im = IMG[n]; return !!(im && im.complete && im.naturalWidth && TAM[n]); };
  let faltan = 1;
  fetch(RUTA + 'cenote.json?v=6').then(r => r.json()).then(m => {
    Object.assign(TAM, m); faltan = Object.keys(m).length;
    for (const n of Object.keys(m)) { const im = new Image(); im.decoding = 'async'; im.onload = im.onerror = () => { if (--faltan === 0) rehaz(); }; im.src = RUTA + n + '.png?v=6'; IMG[n] = im; }
  }).catch(() => { faltan = -1; });
  function rehaz() { if (typeof CACHE !== 'undefined') for (const k of [...CACHE.keys()]) if (k.startsWith('acuarela@')) CACHE.delete(k); }

  let ACTIVO = false;
  const esCenote = st => !!st && st.id === 'acuarela' && !window.estiloArteDerivado;
  if (typeof renderScene === 'function') {
    GANCHOS.en('renderScene', antes => function (ctx, st) { const a = ACTIVO; ACTIVO = esCenote(st); try { return antes.apply(this, arguments); } finally { ACTIVO = a; } });
  }
  function spr(c, n, x, y, o = {}) {
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';   // las piezas vienen a 6 px por unidad: que se reduzcan bien
    const t = TAM[n], w = t.w * (o.k || 1), h = t.h * (o.ky || o.k || 1), ax = o.ax ?? .5, ay = o.ay ?? 1;
    if (!o.voltea) { c.drawImage(IMG[n], x - w * ax, y - h * ay, w, h); return; }
    c.save(); c.translate(x, y); c.scale(-1, 1); c.drawImage(IMG[n], -w * ax, -h * ay, w, h); c.restore();
  }
  const h1 = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  // un lavado de acuarela: varias pasadas translúcidas un poco corridas y la orilla más cargada
  function lavado(x, f, path, col, o = {}) {
    const n = o.pasadas || 4, a = o.alfa || .2, r = rng(o.semilla || 1);
    for (let i = 0; i < n; i++) { x.save(); x.translate((r() - .5) * 2, (r() - .5) * 2); path(i); x.globalAlpha = a; x.fillStyle = col; x.fill(); x.restore(); }
    path(0); x.save(); x.filter = `blur(${.7 * f.S}px)`; x.globalAlpha = o.orilla ?? .3; x.lineWidth = 1; x.strokeStyle = shade(col, -.3); x.stroke(); x.restore();
  }

  // ---------------- el telón: la gruta dibujada ----------------
  const OJOS = 360;                                                    // cada cuánto se abre el techo (en el ancho de su franja)
  function techo(x, f, w) {
    // la piedra del techo, con ojos abiertos por donde entra la luz y estalactitas colgando
    const borde = xx => 10 + fbm1(xx * .012, 11, 4) * 26;
    const P = () => { x.beginPath(); x.moveTo(-4, -4); for (let xx = -4; xx <= w + 4; xx += 4) x.lineTo(xx, borde(xx)); x.lineTo(w + 4, -4); x.closePath(); };
    lavado(x, f, P, '#3f6669', { pasadas: 5, alfa: .28, semilla: 3, orilla: .45 });
    x.fillStyle = 'rgba(40,70,72,.5)';
    for (let xx = 6; xx < w; xx += 9 + h1(xx | 0, 4) * 16) { const y = borde(xx), l = 4 + h1(xx | 0, 5) * 14, a = 2 + h1(xx | 0, 6) * 3; x.beginPath(); x.moveTo(xx - a, y - 2); x.quadraticCurveTo(xx - a * .3, y + l * .6, xx, y + l); x.quadraticCurveTo(xx + a * .3, y + l * .6, xx + a, y - 2); x.fill(); }
    x.save(); x.globalCompositeOperation = 'destination-out';
    for (let k = 0; k * OJOS < w + OJOS; k++) { const cx = k * OJOS + 120 + h1(k, 7) * 90, cy = 6 + h1(k, 8) * 10; x.filter = `blur(${4 * f.S}px)`; x.beginPath(); x.ellipse(cx, cy, 46 + h1(k, 9) * 20, 24, 0, 0, TAU); x.fill(); }
    x.restore(); x.filter = 'none';
    // el cielo que se asoma por cada ojo
    for (let k = 0; k * OJOS < w + OJOS; k++) { const cx = k * OJOS + 120 + h1(k, 7) * 90, cy = 6 + h1(k, 8) * 10; const g = x.createRadialGradient(cx, cy, 2, cx, cy, 50); g.addColorStop(0, 'rgba(255,250,228,.95)'); g.addColorStop(.6, 'rgba(220,240,236,.6)'); g.addColorStop(1, 'rgba(220,240,236,0)'); x.fillStyle = g; x.beginPath(); x.ellipse(cx, cy, 52, 26, 0, 0, TAU); x.fill(); }
    // hojas y lianas en la orilla de cada ojo
    for (let k = 0; k * OJOS < w + OJOS; k++) {
      const cx = k * OJOS + 120 + h1(k, 7) * 90, cy = 6 + h1(k, 8) * 10, rx = 46 + h1(k, 9) * 20;
      for (let i = 0; i < 18; i++) { const a = Math.PI * (.05 + i / 18 * .9), px = cx + Math.cos(a) * rx * (.95 + h1(k * 30 + i, 10) * .2), py = cy + Math.sin(a) * 24 * (.9 + h1(k * 30 + i, 11) * .3); x.globalAlpha = .45; x.fillStyle = i % 3 ? '#6f9f55' : '#9fc46a'; x.beginPath(); x.ellipse(px, py, 4 + h1(k * 30 + i, 12) * 4, 2.4, a, 0, TAU); x.fill(); }
      x.globalAlpha = .5; x.strokeStyle = '#5f8a4a'; x.lineWidth = .7;
      for (let i = 0; i < 4; i++) { const px = cx - rx * .7 + i * rx * .45 + h1(k * 9 + i, 13) * 10, l = 20 + h1(k * 9 + i, 14) * 40; x.beginPath(); x.moveTo(px, cy + 14); x.quadraticCurveTo(px + 4, cy + 14 + l * .5, px - 1, cy + 14 + l); x.stroke(); }
      x.globalAlpha = 1;
    }
  }
  function haces(x, f, w) {
    x.filter = `blur(${6 * f.S}px)`;
    for (let k = 0; k * OJOS < w + OJOS; k++) {
      const cx = k * OJOS + 120 + h1(k, 7) * 90, inc = 26 + h1(k, 15) * 20;
      for (let i = 0; i < 3; i++) {
        const dx = (i - 1) * 22, g = x.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, 'rgba(255,246,214,.55)'); g.addColorStop(.6, 'rgba(255,240,200,.18)'); g.addColorStop(1, 'rgba(255,240,200,0)');
        x.fillStyle = g; x.beginPath(); x.moveTo(cx + dx - 10, 10); x.lineTo(cx + dx + 12, 10); x.lineTo(cx + dx + inc + 34, VH); x.lineTo(cx + dx + inc - 6, VH); x.closePath(); x.fill();
      }
    }
    x.filter = 'none';
  }
  function muros(x, f, w, base, col, sem) {
    // columnas de piedra donde se juntan estalactitas y estalagmitas, con raíces que bajan
    for (let k = 0; k * 150 < w + 150; k++) {
      if (h1(k, sem) < .35) continue;
      const cx = k * 150 + h1(k, sem + 1) * 70, an = 12 + h1(k, sem + 2) * 22, cin = .55 + h1(k, sem + 3) * .25;
      const P = () => { x.beginPath(); x.moveTo(cx - an, -4); x.bezierCurveTo(cx - an * cin, base * .45, cx - an * cin * .8, base * .7, cx - an * 1.3, base + 30); x.lineTo(cx + an * 1.3, base + 30); x.bezierCurveTo(cx + an * cin * .8, base * .7, cx + an * cin, base * .45, cx + an, -4); x.closePath(); };
      lavado(x, f, P, col, { pasadas: 4, alfa: .26, semilla: sem * 31 + k, orilla: .35 });
      x.save(); P(); x.clip(); const r = rng(sem * 7 + k); x.fillStyle = rgba(shade(col, -.45), .25); for (let i = 0; i < 90; i++) { x.beginPath(); x.arc(cx + (r() - .5) * an * 2.6, r() * (base + 20), .3 + r() * .6, 0, TAU); x.fill(); } x.restore();
      x.strokeStyle = 'rgba(110,84,52,.35)'; x.lineWidth = .6;
      for (let i = 0; i < 3; i++) { const px = cx + (i - 1) * an * .5, l = 30 + h1(k * 5 + i, sem + 4) * 60; x.beginPath(); x.moveTo(px, 0); x.bezierCurveTo(px + 5, l * .3, px - 4, l * .7, px + 2, l); x.stroke(); }
    }
  }
  const AGUA = 162;   // a la altura de los nenúfares de siempre (y=160): flotan sobre el agua, no sobre un tallo
  function cieloCenote(ctx, f) {
    screenLayer(ctx, f, 'cenoteFondo', x => {
      x.drawImage(paperTex(f, 'wcpaper', '#f6efe1', { grain: 10, blot: 8 }), 0, 0, VW, VH);
      x.save(); x.globalCompositeOperation = 'multiply';
      const g = x.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#5f8d92'); g.addColorStop(.45, '#9cc8c4'); g.addColorStop(.72, '#cfe6d8'); g.addColorStop(1, '#7fb2b0');
      x.fillStyle = g; x.fillRect(0, 0, VW, VH); x.restore();
      x.save(); x.filter = `blur(${12 * f.S}px)`; const r = rng(6);
      for (let i = 0; i < 16; i++) { x.globalAlpha = .1 + r() * .1; x.fillStyle = r() < .5 ? '#4f7f86' : '#7aa9a0'; x.beginPath(); x.ellipse(r() * VW, 40 + r() * 140, 50 + r() * 70, 26 + r() * 30, 0, 0, TAU); x.fill(); }
      x.restore();
    });
    strip(ctx, f, 'cenoteMuroLejos', .1, (x, w) => muros(x, f, w, AGUA, '#7aa3a4', 21));
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; strip(ctx, f, 'cenoteHaces', .16, (x, w) => haces(x, f, w)); ctx.restore();
    strip(ctx, f, 'cenoteTecho', .16, (x, w) => techo(x, f, w));
    strip(ctx, f, 'cenoteMuroCerca', .3, (x, w) => muros(x, f, w, AGUA + 6, '#4f7d82', 41));
    // el agua del cenote: turquesa, más honda abajo, con brillos que se mueven
    const t = f.t;
    { const g = ctx.createLinearGradient(0, AGUA, 0, VH); g.addColorStop(0, 'rgba(126,200,196,.9)'); g.addColorStop(.35, 'rgba(70,160,168,.92)'); g.addColorStop(1, 'rgba(36,96,112,.95)'); ctx.fillStyle = g; ctx.fillRect(0, AGUA, VW, VH - AGUA); }
    ctx.fillStyle = 'rgba(240,255,250,.6)'; ctx.fillRect(0, AGUA, VW, .7);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = .6;
    for (let i = 0; i < 22; i++) { const k = (t * .25 + h1(i, 31)) % 1, px = wrap(h1(i, 32) * VW * 1.5 - f.cam * .3, VW + 60) - 30, py = AGUA + 3 + h1(i, 33) * (VH - AGUA - 6); ctx.globalAlpha = Math.sin(k * Math.PI) * .45; ctx.strokeStyle = '#e8fff8'; ctx.beginPath(); ctx.ellipse(px, py, 6 + k * 10, 1 + k, 0, 0, TAU); ctx.stroke(); }
    // motas de polvo que flotan en la luz
    for (let i = 0; i < 26; i++) { const px = wrap(h1(i, 21) * VW * 1.3 + Math.sin(t * .3 + i) * 12 - f.cam * .16, VW + 20) - 10, py = 30 + h1(i, 22) * 140 + Math.sin(t * .5 + i * 2) * 6; ctx.globalAlpha = .35 + .3 * Math.sin(t * 1.3 + i); ctx.fillStyle = '#fff6d8'; ctx.beginPath(); ctx.arc(px, py, .5 + h1(i, 23) * .7, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  const cieloAntes = ST.sky;
  const libelulasAmbiente = new Image(); libelulasAmbiente.decoding = 'async';
  libelulasAmbiente.src = '../Roguelike/assets/cenote/libelulas-ambiente.png?v=1';
  const hh = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  // vida pequeña del cenote: libélulas, gotas que caen y motas de luz en el rayo
  function vidaCenote(c, f) {
    const t = f.t || 0;
    // motas de luz que flotan dentro del rayo, a la izquierda
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 28; i++) { const x = (30 + hh(i, 1) * 90 - f.cam * .12 + Math.sin(t * .6 + i) * 5 + 427 * 4) % 427, y = (hh(i, 2) * 170 + t * (3 + hh(i, 3) * 4)) % 170 + 10; c.fillStyle = 'rgba(255,255,225,' + (.2 + .4 * Math.abs(Math.sin(t * 1.4 + i))).toFixed(2) + ')'; c.fillRect(x, y, 1, 1); }
    c.restore();
    // gotas que caen de las estalactitas y abren un anillo en el agua
    for (let i = 0; i < 5; i++) {
      const per = 2.6 + hh(i, 11) * 1.5, ph = ((t + hh(i, 12) * per) % per) / per, x = ((60 + i * 83 + hh(i, 13) * 40 - f.cam * .32) % 460 + 460) % 460 - 15;
      if (ph < .55) { const y = 22 + (ph / .55) ** 2 * 156; c.fillStyle = 'rgba(210,235,240,.85)'; c.beginPath(); c.ellipse(x, y, .9, 2, 0, 0, 6.2832); c.fill(); }
      else { const u = (ph - .55) / .45; c.strokeStyle = 'rgba(220,245,248,' + (.7 * (1 - u)).toFixed(2) + ')'; c.lineWidth = .7; c.beginPath(); c.ellipse(x, 182, 1 + u * 12, .5 + u * 2.4, 0, 0, 6.2832); c.stroke(); }
    }
    // libélulas: vuelan, se quedan quietas y salen disparadas, con las cuatro alas vibrando
    for (let i = 0; i < 3; i++) {
      const cyc = (t * .35 + i * 1.3), seg = Math.floor(cyc), u = cyc - seg, e = u < .7 ? 0 : (u - .7) / .3, ax = 60 + hh(seg + i * 7, 21) * 260, bx = 60 + hh(seg + 1 + i * 7, 21) * 260, ay = 110 + hh(seg + i * 7, 22) * 50, by = 110 + hh(seg + 1 + i * 7, 22) * 50;
      const x = ax + (bx - ax) * e * e * (3 - 2 * e) - f.cam * .2 % 427 + (f.cam * .2) % 427 * 0, y = ay + (by - ay) * e + Math.sin(t * 3 + i) * 1.4, dir = bx >= ax ? 1 : -1, w = Math.sin(t * 60 + i) * 1.4;
      c.save(); c.translate(x, y); c.scale(dir, 1);
      if (libelulasAmbiente.complete && libelulasAmbiente.naturalWidth) {
        const im = libelulasAmbiente, ancho = im.naturalWidth / 4, cuadro = Math.floor(t * 9 + i) % 4;
        c.imageSmoothingEnabled = true; c.drawImage(im, cuadro * ancho, 0, ancho, im.naturalHeight, -9, -12, 18, 24); c.restore(); continue;
      }
      c.strokeStyle = '#2f9fb0'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(-5, 0); c.lineTo(4, 0); c.stroke(); c.fillStyle = '#e04a5a'; c.beginPath(); c.arc(4.6, 0, 1.4, 0, 6.2832); c.fill();
      c.fillStyle = 'rgba(210,240,250,.55)'; c.beginPath(); c.ellipse(-.5, -2 - w * .3, 4, 1.3, -.2, 0, 6.2832); c.ellipse(1, 2.2 + w * .3, 3.5, 1.2, .2, 0, 6.2832); c.fill(); c.restore();
    }
  }
  ST.sky = function (ctx, f) { if (!esCenote(f.st)) return cieloAntes.call(this, ctx, f); cieloCenote(ctx, f); try { vidaCenote(ctx, f); } catch (e) { /* el telón nunca rompe la partida */ } };

  // ---------------- el terreno: la acuarela de siempre, en piedra caliza ----------------
  const terrenoAntes = ST.terrain;
  ST.terrain = function (ctx, f) {
    if (window.estiloArteDerivado || faltan !== 0) return terrenoAntes.call(this, ctx, f);
    const deco = L.deco; L.deco = [];
    try { terrenoAntes.call(this, ctx, f); } finally { L.deco = deco; }
    // la piedra caliza del cenote: más fría y clara que la tierra ocre de antes
    ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = 'rgba(176,206,196,.34)'; ctx.fillRect(0, 0, L.ww, VH + 8);
    const g = ctx.createLinearGradient(0, 160, 0, VH); g.addColorStop(0, 'rgba(60,110,120,0)'); g.addColorStop(1, 'rgba(60,110,120,.35)'); ctx.fillStyle = g; ctx.fillRect(0, 160, L.ww, VH);
    ctx.restore();
    const hueco = (x, y) => !L.solid(Math.floor(x / T), Math.floor(y / T));
    // lo que cuelga: raíces de las orillas que dan al vacío y estalactitas bajo los techos
    for (const r of L.tops) for (const lado of [-1, 1]) {
      const ex = lado < 0 ? r.x0 : r.x1; if (!hueco(ex + lado * 6, r.y + 10) || h1(ex | 0, 3) < .3) continue;
      spr(ctx, ['raiz0', 'raiz1', 'raiz2', 'enredadera', 'raices3'][Math.floor(h1(ex | 0, 4) * 5)], ex - lado * 5, r.y + 2, { ay: 0, voltea: lado < 0, k: .8 });
    }
    for (const b of L.bottoms) for (let x = b.x0 + 8; x < b.x1 - 8; x += 18 + h1(x | 0, 5) * 26) {
      if (b.y > VH - 4 || h1(x | 0, 6) < .35) continue;
      spr(ctx, (h1(x | 0, 7) < .5 ? 'estalactita' : 'estalactitaG') + Math.floor(h1(x | 0, 8) * 4), x, b.y - 2, { ay: 0, k: .6 + h1(x | 0, 9) * .4 });
    }
    // y lo que crece arriba
    for (const r of L.tops) for (let x = r.x0 + 14; x < r.x1 - 14; x += 30 + h1(x | 0, r.y) * 34) {
      if (h1(x | 0, 12) < .45) continue;
      spr(ctx, ['helecho1', 'helecho3', 'roca1', 'roca2', 'roca4', 'planta5'][Math.floor(h1(x | 0, 13) * 6)], x, r.y + 2, { voltea: h1(x | 0, 14) < .5, k: .75 + h1(x | 0, 15) * .3 });
    }
    for (const o of L.deco) {
      const x = o.x, y = o.y + 2;
      if (o.k === 'T') spr(ctx, ['helecho0', 'planta3', 'helecho2', 'planta0', 'planta6'][o.i % 5], x, y, { voltea: o.i % 2 === 1, k: 1.25 });
      else if (o.k === 'f') spr(ctx, ['planta1', 'planta4', 'planta5', 'tule0'][o.i % 4], x, y, { voltea: o.i % 2 === 1 });
      else if (o.k === 'r') spr(ctx, ['roca0', 'roca3', 'roca1'][o.i % 3], x, y);
    }
  };

  // ---------------- los nenúfares ----------------
  function nenufarAntes(ctx, pl, f, sk) {
    const x = pl.x, y = pl.y, w = pl.w, t = f.t;
    ctx.fillStyle = sk.plat; ctx.beginPath(); ctx.ellipse(x + w / 2, y + 2, w / 2, 3.4, 0, .3, TAU - .3); ctx.lineTo(x + w / 2, y + 2); ctx.closePath(); ctx.fill(); ctx.strokeStyle = sk.line; ctx.lineWidth = .5; ctx.stroke();
    ctx.fillStyle = sk.accent; ctx.beginPath(); ctx.arc(x + w * .3, y, 1.6, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(120,160,200,.5)'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + 4, w / 2 + 3 + Math.sin(t * 3) * 1.5, 2, 0, 0, TAU); ctx.stroke();
  }
  LOOK.lily = (ctx, pl, f, sk) => {
    if (!ACTIVO || !listo('nenufar0')) return nenufarAntes(ctx, pl, f, sk);
    const hondo = pl.k === 'sink' ? clamp((pl.y - pl.y0) / (pl.depth || 56), 0, 1) : 0, n = hondo < .25 ? 'nenufar0' : hondo < .6 ? 'nenufar1' : 'nenufar2';
    const k = (pl.w + 6) / TAM.nenufar0.w, cx = pl.x + pl.w / 2;
    // si va más alto que el agua, la hoja no flota en el aire: sale del agua con su tallo, como el loto
    if (pl.y < AGUA - 6) {
      const fin = sueloDebajo(cx, pl.y) ?? fondoVista(), sw = Math.sin(f.t * 1.3 + (pl.x0 || 0)) * 2;
      ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = '#4f7a3c'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(cx + 1, pl.y + 2); ctx.bezierCurveTo(cx + 4 + sw, pl.y + (fin - pl.y) * .35, cx - 3 - sw, pl.y + (fin - pl.y) * .7, cx + 1, fin); ctx.stroke();
      ctx.strokeStyle = 'rgba(190,220,150,.6)'; ctx.lineWidth = .7; ctx.stroke(); ctx.restore();
    }
    spr(ctx, n, cx, pl.y - 2, { ay: .22, k });
    if (pl.pw) {                                                     // el que brota del poder de Fresita: con su loto que brilla
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, cx, pl.y - 5, 14, '#ffb8e0', .35 + .1 * Math.sin(f.t * 4)); ctx.restore();
      const brota = clamp((pl.t || 0) / .35, 0, 1); spr(ctx, brota < 1 ? 'boton1' : 'loto', cx, pl.y + 1, { k: .45 + brota * .25 });
    } else if (h1(Math.round(pl.x0), 2) < .45 && hondo < .6) spr(ctx, 'flor-loto', cx + pl.w * .22, pl.y + .5, { k: .9 });
  };

  // ---------------- la cascada ----------------
  if (OBJ.cascada) {
    const cascadaAntes = OBJ.cascada.draw;
    OBJ.cascada.draw = function (c, o, f) {
      if (!ACTIVO) return cascadaAntes.call(this, c, o, f);
      const w = o.x1 - o.x0, t = f.t; c.save();
      for (let i = 0; i < 4; i++) {                                    // lavados de agua que se encimam
        const g = c.createLinearGradient(o.x0 - 4, 0, o.x1 + 4, 0), a = [.22, .18, .16, .14][i];
        g.addColorStop(0, 'rgba(150,205,225,0)'); g.addColorStop(.2 + i * .05, `rgba(160,215,235,${a})`); g.addColorStop(.8 - i * .05, `rgba(150,205,230,${a})`); g.addColorStop(1, 'rgba(150,205,225,0)');
        c.fillStyle = g; c.fillRect(o.x0 - 5 + Math.sin(t * 2 + i) * .8, o.y0, w + 10, o.y1 - o.y0);
      }
      c.lineCap = 'round';
      for (let k = 0; k < 7; k++) {                                    // los chorros blancos que caen
        const x = o.x0 + 2 + k * (w - 4) / 6, off = (t * 140 + k * 53) % 46;
        c.strokeStyle = k % 2 ? 'rgba(255,255,255,.7)' : 'rgba(220,245,255,.55)'; c.lineWidth = k % 3 ? .6 : 1.1; c.beginPath();
        for (let y = o.y0 - 46 + off; y < o.y1; y += 46) { c.moveTo(x + Math.sin(y * .08 + k) * .8, y); c.lineTo(x + Math.sin((y + 20) * .08 + k) * .8, y + 22); }
        c.stroke();
      }
      // espuma y salpicadura donde cae al agua
      const fy = Math.min(o.y1, 236);
      if (listo('salpica')) { c.globalAlpha = .85; spr(c, 'salpica', (o.x0 + o.x1) / 2, fy, { k: w / 26 * 1.3, ky: (w / 26 * 1.3) * (.9 + .15 * Math.sin(t * 9)) }); c.globalAlpha = 1; }
      c.globalCompositeOperation = 'lighter'; glowDot(c, (o.x0 + o.x1) / 2, fy - 6, w * .9, '#e8fbff', .35);
      c.restore();
    };
  }

  // ---------------- canistel, corazón y salida ----------------
  if (typeof monedaItzel === 'function') {
    GANCHOS.en('monedaItzel', monedaAntes => function (ctx, x, y, t, f, especial) {
      if (especial || !ACTIVO || !listo('canistel')) return monedaAntes.apply(this, arguments);
      spr(ctx, 'canistel', x, y + Math.sin(t * 2.6 + x * .04) * 1.4, { ay: .5 });
    });
  }
  if (typeof drawHeart === 'function') {
    GANCHOS.en('drawHeart', corazonAntes => function (ctx, x, y) { if (!ACTIVO || !listo('corazon')) return corazonAntes.apply(this, arguments); spr(ctx, 'corazon', x, y, { ay: .5 }); });
  }
  const metaAntes = ST.goal;
  ST.goal = function (ctx, x, y, t, f) {
    if (!esCenote(f && f.st) || !listo('salida')) return metaAntes.apply(this, arguments);
    spr(ctx, 'salida', x, y + 3);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y - 18, 24, '#fff2c0', .28 + .1 * Math.sin(t * 2.4)); ctx.restore();
  };

  // ---------------- rana, mojarra y libélula ----------------
  const envuelve = (k, fn) => {
    const antes = FD[k]; if (!antes) return;
    const nuevo = function (c, e, t, s) { if (!ACTIVO || e.sub || !listo(k + '0')) return antes.call(this, c, e, t, s); fn(c, e, Math.max(0, t || 0)); };
    nuevo._assetNuevo = true;
    nuevo._assetListo = () => (ACTIVO && listo(k + '0')) || !!(antes._assetListo && antes._assetListo());
    FD[k] = nuevo;
  };
  envuelve('rana', (c, e, t) => {
    // El cenote tiene su propio dibujante y no pasa por el general. Usar la
    // hoja de salto verificada también aquí; conservar su pose de daño.
    const assets = window.ENEMIGOS_ASSETS, hoja = assets && assets.hojaForge('rana');
    if (e.st !== 'gone' && !(e.aturde > 0) && !(e._golpe > .25) && hoja && hoja.complete && hoja.naturalWidth) {
      assets.pinta(c, e, t, 'rana', null); return;
    }
    const n = e.st === 'gone' || e.aturde > 0 || e._golpe > .25 ? 3 : (e.vy || 0) !== 0 ? 2 : (Math.floor((e.anim || t) * .7) % 4 === 3 ? 1 : 0);
    spr(c, 'rana' + n, 0, 1);
  });
  envuelve('mojarra', (c, e, t) => {
    if (!e.nada) return;                                              // sumergida no se ve, como antes
    const inclinacion = Math.atan2(e.vy, Math.abs(e.vx) + 1) * .4;
    c.save(); c.rotate(inclinacion);
    const assets = window.ENEMIGOS_ASSETS, hoja = assets && assets.hojaForge('mojarra');
    if (e.st !== 'gone' && !(e.aturde > 0) && !(e._golpe > .25) && hoja?.complete && hoja.naturalWidth) {
      // El renderer Forge aporta el arco ascendente; se conserva el giro fuerte del pez.
      c.filter = 'saturate(.86) brightness(1.02) contrast(.94)'; assets.pinta(c, e, t, 'mojarra', null); c.restore(); return;
    }
    c.rotate(inclinacion);
    spr(c, (e.vy || 0) < -150 ? 'mojarra1' : 'mojarra0', 0, -3, { ay: .5 }); c.restore();
  });
  envuelve('libelula', (c, e, t) => {
    const rapida = e.to && Math.hypot(e.to[0] - e.x, e.to[1] - e.y) > 8;
    const assets = window.ENEMIGOS_ASSETS, hoja = assets && assets.hojaForge('libelula');
    if (e.st !== 'sleep' && e.st !== 'stun' && e.st !== 'gone' && !(e.aturde > 0) && !(e._golpe > .25) && hoja?.complete && hoja.naturalWidth) {
      // Mantiene la paleta acuática suave; las poses Forge distinguen reposo y vuelo rápido.
      c.save(); c.filter = 'saturate(.78) brightness(1.04) contrast(.94)'; assets.pinta(c, e, t, 'libelula', null); c.restore(); return;
    }
    spr(c, rapida ? 'libelula2' : 'libelula' + (Math.floor(t * 26) % 2), 0, -3, { ay: .5 });
  });
  window.CENOTE_ACUARELA = { IMG, TAM, listo, rehaz, activo: () => ACTIVO };
})();
