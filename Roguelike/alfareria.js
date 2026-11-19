'use strict';
// Taller de alfarería: decoración y criaturas; la plastilina conserva su física.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.barro) return;
  const V = vestirNivel({ id: 'barro', carpeta: 'alfareria', ver: 4 });
  const { spr, h1 } = V;

  // ================================================================
  //  EL TALLER DE TEPAKÁN (2026-11-15): por dentro, como en fondo-taller.png.
  //  El telón se dibuja por código (muro de adobe rojizo, vigas, arcos que
  //  dejan ver Campeche, papel picado); los estantes, macetas colgantes y
  //  piezas de alfarería son recortes de las láminas. El piso es la hilada
  //  de ladrillos y el barro agrietado de terreno-plastilina.png.
  // ================================================================
  const TAM = V.TAM, IMG = V.IMG;
  const PICADO = ['#e8457a', '#f2b51f', '#2fa7c4', '#8a52c8', '#3fae6a', '#ff7a3a'];
  function muro(x, w) {                                                    // el muro de adobe, con su enjarre y cuarteaduras
    const g = x.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#b4553a'); g.addColorStop(.55, '#c46744'); g.addColorStop(1, '#9c472f');
    x.fillStyle = g; x.fillRect(0, 0, w, VH);
    for (let i = 0; i < w / 6; i++) { const px = h1(i, 1) * w, py = 20 + h1(i, 2) * 150, r = 6 + h1(i, 3) * 22; x.fillStyle = 'rgba(' + (h1(i, 4) < .5 ? '235,160,120' : '120,50,30') + ',' + (.05 + h1(i, 5) * .07) + ')'; x.beginPath(); x.ellipse(px, py, r * 1.4, r, h1(i, 6) * 3, 0, TAU); x.fill(); }
    x.strokeStyle = 'rgba(90,35,20,.28)'; x.lineWidth = .45; x.lineCap = 'round';
    for (let i = 0; i < w / 40; i++) { let px = h1(i, 7) * w, py = 30 + h1(i, 8) * 110; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 4; k++) { px += (h1(i * 5 + k, 9) - .5) * 9; py += 3 + h1(i * 5 + k, 10) * 5; x.lineTo(px, py); } x.stroke(); }
    // guardapolvo rojo oscuro abajo, con su filo de cal
    const gg = x.createLinearGradient(0, 150, 0, VH); gg.addColorStop(0, '#8a3524'); gg.addColorStop(1, '#5e2216'); x.fillStyle = gg; x.fillRect(0, 150, w, VH - 150);
    x.fillStyle = '#f1dcc0'; x.fillRect(0, 146, w, 5); x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(0, 150.6, w, 1.2);
    // cenefa pintada a mano sobre la cal: rombos y puntos de colores, como la loza
    for (let cx2 = 3; cx2 < w; cx2 += 8) { x.fillStyle = ['#2f5fa8', '#c8203a', '#f2b51f'][Math.floor(cx2 / 8) % 3]; x.beginPath(); x.moveTo(cx2, 146.6); x.lineTo(cx2 + 2, 148.5); x.lineTo(cx2, 150.4); x.lineTo(cx2 - 2, 148.5); x.closePath(); x.fill(); x.fillStyle = '#3f8f4a'; x.fillRect(cx2 + 3.6, 148, 1, 1); }
    x.strokeStyle = 'rgba(255,200,170,.06)'; x.lineWidth = 1.4; for (let i = 0; i < w / 5; i++) { const px = h1(i, 11) * w; x.beginPath(); x.moveTo(px, 156); x.lineTo(px + (h1(i, 12) - .5) * 4, VH); x.stroke(); }
  }
  function arcos(x, w) {                                                   // ventanas en arco: el patio, la muralla y las casas de colores
    for (let k = 0; k * 300 < w + 300; k++) {
      const cx = k * 300 + 150 + (h1(k, 21) - .5) * 40, ancho = 70, top = 46, base = 136;
      x.save(); x.beginPath(); x.moveTo(cx - ancho / 2, base); x.lineTo(cx - ancho / 2, top + ancho / 2); x.arc(cx, top + ancho / 2, ancho / 2, Math.PI, 0); x.lineTo(cx + ancho / 2, base); x.closePath(); x.clip();
      const cielo = x.createLinearGradient(0, top, 0, base); cielo.addColorStop(0, '#6fbde8'); cielo.addColorStop(1, '#cfeef7'); x.fillStyle = cielo; x.fillRect(cx - ancho, top, ancho * 2, base - top);
      x.fillStyle = 'rgba(255,255,255,.85)'; for (let n = 0; n < 2; n++) { const nx = cx - 22 + n * 30 + h1(k, 22 + n) * 8, ny = top + 26 + n * 8; x.beginPath(); x.ellipse(nx, ny, 9, 3, 0, 0, TAU); x.ellipse(nx + 5, ny - 2.5, 6, 3, 0, 0, TAU); x.fill(); }
      // el baluarte con su garita y la muralla
      x.fillStyle = '#c9c3b6'; x.fillRect(cx - ancho / 2, base - 26, ancho, 26); x.fillStyle = '#b6aea0'; for (let m = cx - ancho / 2; m < cx + ancho / 2; m += 6) x.fillRect(m, base - 29, 3.5, 3);
      const gx = cx - 18 + h1(k, 25) * 10; x.fillStyle = '#d8d2c6'; x.fillRect(gx - 4, base - 40, 8, 12); x.beginPath(); x.arc(gx, base - 40, 4, Math.PI, 0); x.fill(); x.fillStyle = '#7d756a'; x.fillRect(gx - 1, base - 37, 2, 4);
      // casas de colores
      const COL = ['#f5c84c', '#f08a8a', '#7cc4d8', '#f6e7c8', '#a8d38a', '#e98b5a'];
      for (let m = 0, hx = cx + 2; m < 3; m++) { const hw = 11 + h1(k * 3 + m, 26) * 6, hh = 14 + h1(k * 3 + m, 27) * 8; x.fillStyle = COL[Math.floor(h1(k * 3 + m, 28) * COL.length)]; x.fillRect(hx, base - hh, hw, hh); x.fillStyle = 'rgba(60,40,40,.55)'; x.fillRect(hx + 3, base - hh + 4, 2.4, 4); x.fillRect(hx + hw - 5, base - hh + 4, 2.4, 4); hx += hw; }
      x.restore();
      // el marco de cantera del arco
      x.strokeStyle = '#e7c79c'; x.lineWidth = 4; x.beginPath(); x.moveTo(cx - ancho / 2, base); x.lineTo(cx - ancho / 2, top + ancho / 2); x.arc(cx, top + ancho / 2, ancho / 2, Math.PI, 0); x.lineTo(cx + ancho / 2, base); x.stroke();
      x.strokeStyle = 'rgba(110,60,30,.45)'; x.lineWidth = .6; for (let d = 0; d < 9; d++) { const a = Math.PI + d / 8 * Math.PI; x.beginPath(); x.moveTo(cx + Math.cos(a) * (ancho / 2 - 2), top + ancho / 2 + Math.sin(a) * (ancho / 2 - 2)); x.lineTo(cx + Math.cos(a) * (ancho / 2 + 2), top + ancho / 2 + Math.sin(a) * (ancho / 2 + 2)); x.stroke(); }
      x.fillStyle = '#e7c79c'; x.fillRect(cx - ancho / 2 - 4, base, ancho + 8, 4); x.fillStyle = 'rgba(110,60,30,.35)'; x.fillRect(cx - ancho / 2 - 4, base + 3, ancho + 8, 1);
      // entre arco y arco: un estante con su loza, recargado en el muro (oscurecido para que quede atrás)
      const ex = cx + 150 + (h1(k, 29) - .5) * 30, pieza = ['estante', 'rejilla', 'repisa'][k % 3];
      x.save(); x.filter = 'brightness(.72) saturate(.85)'; V.spr(x, pieza, ex, pieza === 'repisa' ? 108 : 150, { alfa: .95 }); x.restore();
    }
  }
  function vigas(x, w) {                                                   // las vigas del techo y las macetas colgantes
    x.fillStyle = '#4a2a1a'; x.fillRect(0, 0, w, 9); x.fillStyle = '#6b3d24'; x.fillRect(0, 7, w, 3);
    for (let k = 0; k * 46 < w + 46; k++) { const vx = k * 46; x.fillStyle = '#5a321e'; x.fillRect(vx, 0, 9, 13); x.fillStyle = 'rgba(255,220,180,.18)'; x.fillRect(vx + 1, 9, 7, 1.2); }
    for (let k = 0; k * 140 < w + 140; k++) {
      const mx = k * 140 + 60 + h1(k, 31) * 40; if (h1(k, 32) < .25) continue;
      V.spr(x, 'colgante' + Math.floor(h1(k, 33) * 4), mx, 12, { ay: 0, k: .85 });
    }
  }
  function picado(c, f) {                                                  // el papel picado se mece
    const off = f.cam * .45, t = f.t;
    for (let fila = 0; fila < 1; fila++) {
      const y0 = 17, paso = 10;
      c.strokeStyle = 'rgba(60,30,20,.6)'; c.lineWidth = .4; c.beginPath();
      for (let x = -paso; x < VW + paso; x += 2) { const u = ((x + off) % 180 + 180) % 180; c.lineTo(x, y0 + Math.sin(u / 180 * Math.PI) * 7); } c.stroke();
      for (let x = -(off % paso) - paso; x < VW + paso; x += paso) {
        const i = Math.floor((x + off) / paso), u = ((x + off) % 180 + 180) % 180, y = y0 + Math.sin(u / 180 * Math.PI) * 7, sw = Math.sin(t * 2 + i) * .12;
        c.save(); c.translate(x, y); c.rotate(sw); c.fillStyle = PICADO[((i % 6) + 6) % 6]; c.globalAlpha = .92;
        c.globalAlpha = .85; c.beginPath(); c.moveTo(-3.2, 0); c.lineTo(3.2, 0); c.lineTo(3.2, 6.4); for (let z = 3.2; z >= -3.2; z -= 1.6) c.lineTo(z, 6.4 + (Math.round(z / 1.6) % 2 ? 1.1 : 0)); c.closePath(); c.fill();
        c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(0, 2.8, 1.1, 0, TAU); c.fill(); c.globalCompositeOperation = 'source-over'; c.restore();
      }
    }
  }
  V.cielo((c, f) => {
    screenLayer(c, f, 'tallerMuro', x => muro(x, VW));
    strip(c, f, 'tallerArcos', .18, (x, w) => arcos(x, w));
    picado(c, f);
    strip(c, f, 'tallerVigas', .45, (x, w) => vigas(x, w));
    // polvo de barro flotando en la luz de las ventanas
    const t = f.t; c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 18; i++) { const w = VW + 40, x = ((h1(i, 51) * w - f.cam * .2 + Math.sin(t * .7 + i) * 6) % w + w) % w - 20, y = ((h1(i, 52) * 130 - t * (3 + h1(i, 53) * 4)) % 130 + 130) % 130 + 30; c.globalAlpha = .35 * Math.sin(Math.PI * (y - 30) / 130); c.fillStyle = '#ffe0b0'; c.fillRect(x, y, 1, 1); }
    c.restore();
  });

  // ---------------- el piso: hiladas de barro y la orilla de ladrillos ----------------
  let patBarro = null, patLadrillo = null;
  const patron = (c, n) => { const p = c.createPattern(IMG[n], 'repeat'), k = TAM[n].h / IMG[n].naturalHeight; p.setTransform(new DOMMatrix().scale(k)); return p; };
  const terrenoViejo = V.ST.terrain;
  V.ST.terrain = function (c, f) { if (!V.es(f.st) || !V.todo()) return terrenoViejo.call(this, c, f); return pisoTaller(c, f); };
  function pisoTaller(c, f) {
    if (!patBarro) { patBarro = patron(c, 'barro'); patLadrillo = patron(c, 'ladrillos'); }
    const hB = TAM.barro.h;
    c.save(); allLoopsPath(c, L.loops); c.clip();
    // hiladas de barro, cada una corrida para que no se note la repetición
    const yTop = Math.min(0, ...L.tops.map(r => r.y)), yMax = (L.gh || 16) * T + 40;
    for (let y = Math.floor(yTop / hB) * hB, fila = 0; y < yMax; y += hB, fila++) {
      c.save(); c.translate((fila * 37) % TAM.barro.w, y); c.fillStyle = patBarro; c.fillRect(-TAM.barro.w, 0, L.ww + TAM.barro.w * 2, hB); c.restore();
      c.fillStyle = 'rgba(70,25,12,.35)'; c.fillRect(0, y, L.ww, .7);
    }
    // más hondo, más oscuro
    for (const r of L.tops) { const g = c.createLinearGradient(0, r.y, 0, r.y + 70); g.addColorStop(0, 'rgba(60,20,10,0)'); g.addColorStop(1, 'rgba(60,20,10,.45)'); c.fillStyle = g; c.fillRect(r.x0, r.y, r.x1 - r.x0, 70); }
    c.restore();
    c.strokeStyle = '#4a1e12'; c.lineWidth = .9; c.lineJoin = 'round'; allLoopsPath(c, L.loops); c.stroke();
    // la hilada de ladrillos justo sobre lo que se pisa (su filo de arriba es la colisión)
    for (const r of L.tops) {
      c.save(); c.beginPath(); c.rect(r.x0, r.y - .2, r.x1 - r.x0, TAM.ladrillos.h + .4); c.clip();
      c.translate(r.x0 - (r.x0 % TAM.ladrillos.w), r.y); c.fillStyle = patLadrillo; c.fillRect(0, 0, r.x1 - r.x0 + TAM.ladrillos.w, TAM.ladrillos.h); c.restore();
      c.fillStyle = 'rgba(60,20,10,.35)'; c.fillRect(r.x0, r.y + TAM.ladrillos.h, r.x1 - r.x0, 1);
    }
    // piezas del taller sobre el piso (nada que parezca para pararse encima)
    for (const r of L.tops) for (let x = r.x0 + 16; x < r.x1 - 16; x += 30 + h1(x | 0, r.y) * 50) if (h1(x | 0, 61) > .64) spr(c, ['olla', 'jarra', 'cantarito', 'florero', 'banco', 'cajon'][Math.floor(h1(x | 0, 62) * 6)], x, r.y + .6, { voltea: h1(x | 0, 63) < .5 });
    for (const o of L.deco) {
      const x = o.x, y = o.y + .6, v = h1(o.i, 7) < .5;
      if (o.k === 'T') spr(c, ['horno', 'lena', 'torno1', 'horno', 'torno0'][o.i % 5], x, y, { voltea: v });
      else if (o.k === 'f') spr(c, ['florero', 'jarra', 'olla', 'cantarito'][o.i % 4], x, y, { voltea: v });
      else if (o.k === 'r') spr(c, ['olla', 'jarra', 'florero'][o.i % 3], x, y, { voltea: v });
    }
  }
  // la plataforma de barro que se estira: el puente de barro de la lámina, del ancho de su colisión
  V.look('arcilla', (c, pl, f, sk, antes) => {
    if (pl.st === 'snap' && pl.tt > .6) return;
    const t = TAM.puente; spr(c, 'puente', pl.x + pl.w / 2, pl.y + (pl.dropY || 0) - .3, { ay: t.cubierta || .12, w: pl.w + 4 });
  }, 'puente', MEC.LOOK.arcilla);
  V.fd('grumo', (c, e, t, s, antes) => {
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('grumo');
    if (e.st === 'sleep' && hoja?.complete && hoja.naturalWidth) { c.save(); c.filter = 'hue-rotate(105deg)'; window.ENEMIGOS_ASSETS.pinta(c, e, t, 'grumo', null); c.restore(); }
    else if (hoja?.complete && hoja.naturalWidth) { c.save(); c.filter = 'hue-rotate(105deg)'; antes(c, e, t, s); c.restore(); }
    else spr(c, 'grumo' + (e.alert ? 1 : 0), 0, .5);
    if (e.alert && e.alertT < .6) { c.fillStyle = s.accent; c.font = 'bold 7px "Alegreya Sans", sans-serif'; c.fillText('!', -1.5, -14); }
  }, 'grumo0');
  V.fd('ollita', (c, e) => {
    c.save(); if (e.agacha) c.scale(1.08, .82);
    spr(c, 'ollita' + (Math.abs(e.vy || 0) > 1 ? 1 : 0), 0, .5); c.restore();
  }, 'ollita0');
  // Las notas del silbido siguen pintadas por el efecto original del juego.
  V.fd('silbato', (c, e, t, s, antes) => {
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('silbato');
    if (hoja?.complete && hoja.naturalWidth) { antes(c, e, t, s); return; }
    spr(c, 'silbato' + (e.silba > 0 ? 1 : 0), 0, 1);
  }, 'silbato0');
  V.fd('rana', (c, e, t, s, antes) => {
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('rana');
    if (hoja?.complete && hoja.naturalWidth) { antes(c, e, t, s); return; }
    spr(c, 'rana' + (Math.abs(e.vy || 0) > 1 ? 1 : 0), 0, .5);
  }, 'rana0');
  V.moneda('canistel'); V.corazon('corazon'); V.meta('salida', { dy: 1 });
  window.ALFARERIA = V;
})();
