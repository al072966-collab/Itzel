'use strict';
// Carta celeste: la constelación, la gravedad y los avisos siguen intactos.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.cielo) return;
  const V = vestirNivel({ id: 'cielo', carpeta: 'cielo-mayas', ver: 3, manifiesto: window.CIELO_MAYAS_MANIFIESTO });
  const { spr } = V;
  // Recursos independientes para el firmamento y los sillares del nivel lateral.
  const EDZNA_FONDO = {};
  for (const [n, archivo] of Object.entries({ firmamento:'firmamento-edzna-v1', alacran:'constelacion-alacran-v1', muro:'muro-celeste-v1', luna:'luna-completa-v1', observatorio:'observatorio-completo-v1' })) {
    const im = EDZNA_FONDO[n] = new Image(); im.decoding = 'async'; im.onload = () => V.rehaz();
    im.src = '../Roguelike/assets/cielo-mayas/' + archivo + '.png';
  }
  // el vuelo sobre Edzná usa el mismo firmamento ilustrado que el nivel lateral (en la enciclopedia salía con el fondo morado de respaldo)
  const edznaPrincipal = f => ['cielo', 'vuelo'].includes((f && f.g && f.g.def && f.g.def.id) || (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id));
  const recursosEdznaListos = () => Object.values(EDZNA_FONDO).every(i => i.complete && i.naturalWidth);
  function cieloIlustrado(c, f) {
    const im = EDZNA_FONDO.firmamento, H = f.H || VH;
    // Encuadre panorámico sin estirar: se excluye la luna pintada del extremo para usar la pieza móvil existente.
    const sw = Math.min(im.naturalWidth, im.naturalHeight * VW / H), max = Math.max(0, Math.min(580, im.naturalWidth - sw));
    const sx = max * (.5 + .35 * Math.sin((f.cam || 0) * .0008));
    c.save(); c.imageSmoothingEnabled = true; c.drawImage(im, sx, 0, sw, im.naturalHeight, 0, 0, VW, H);
    const x = 60 - ((f.cam || 0) * .025 % 150);
    c.globalAlpha = .78; c.drawImage(EDZNA_FONDO.alacran, x, 21, 105, 70); c.globalAlpha = 1;
    const mx = VW - 78 - (((f.cam || 0) * .015) % 40);
    c.drawImage(EDZNA_FONDO.luna, 368, 105, 782, 795, mx - 14, 32, 28, 28);
    // El observatorio descansa sobre una nube en su propia capa, no en el aire.
    const unit = 340, off = ((f.cam || 0) * .1 % unit + unit) % unit;
    for (let k = -1; k * unit - off < VW + unit; k++) {
      const cx = k * unit - off + 125;
      V.spr(c, 'nube2', cx, 171, { ay:.5, w:95, alfa:.75 });
      c.globalAlpha = .55;
      c.drawImage(EDZNA_FONDO.observatorio, 79, 53, 1616, 800, cx - 47, 121, 94, 47);
      c.globalAlpha = 1;
    }
    c.restore();
  }
  // ---- cielo: de la lámina se toma el ambiente (violeta cálido, luna con halo, bruma y observatorio lejano) ----
  V.cielo((c, f, antes) => {
    if (edznaPrincipal(f) && recursosEdznaListos()) { cieloIlustrado(c, f); return; }
    antes();
    // bruma violeta que apaga la silueta dorada de la carta (para que no parezca terreno) y calienta el cielo
    const g = c.createLinearGradient(0, 0, 0, VH);
    g.addColorStop(0, 'rgba(58,26,110,.38)'); g.addColorStop(.5, 'rgba(96,52,140,.3)'); g.addColorStop(.72, 'rgba(26,18,70,.62)'); g.addColorStop(.88, 'rgba(14,12,50,.78)'); g.addColorStop(1, 'rgba(10,10,40,.2)');
    c.fillStyle = g; c.fillRect(0, 0, VW, VH);
    // la Vía Láctea: una franja inclinada de polvo de estrellas (lejos, casi no se mueve)
    c.save(); c.translate(VW * .5 - ((f.cam * .01) % 30), 90); c.rotate(-.42);
    const vg = c.createLinearGradient(0, -30, 0, 30); vg.addColorStop(0, 'rgba(200,170,255,0)'); vg.addColorStop(.5, 'rgba(210,190,255,.17)'); vg.addColorStop(1, 'rgba(200,170,255,0)');
    c.fillStyle = vg; c.fillRect(-340, -30, 680, 60);
    for (let i = 0; i < 90; i++) { const px = (V.h1(i, 71) - .5) * 640, py = (V.h1(i, 72) - .5) * 44 * (V.h1(i, 73) + .3); c.fillStyle = 'rgba(255,240,255,' + (.2 + V.h1(i, 74) * .5).toFixed(2) + ')'; c.fillRect(px, py, .8, .8); }
    c.restore();
    // estrellas en dos capas con titileo; las más grandes llevan destello en cruz
    for (let capa = 0; capa < 2; capa++) {
      const par = capa ? .035 : .015, N = capa ? 34 : 56;
      for (let i = 0; i < N; i++) {
        const w = VW + 80, x = ((V.h1(i, 80 + capa) * w - f.cam * par) % w + w) % w - 40, y = V.h1(i, 82 + capa) * 150 + 4;
        const tw = .55 + .45 * Math.sin(f.t * (1.2 + V.h1(i, 84) * 2) + i * 2.3), grande = V.h1(i, 85) > (capa ? .72 : .9);
        c.fillStyle = 'rgba(255,244,214,' + ((.35 + .5 * V.h1(i, 86)) * tw).toFixed(2) + ')'; c.fillRect(x, y, capa ? 1.3 : .9, capa ? 1.3 : .9);
        if (grande) { c.strokeStyle = 'rgba(255,236,170,' + (.5 * tw).toFixed(2) + ')'; c.lineWidth = .5; c.beginPath(); c.moveTo(x - 3.2, y + .6); c.lineTo(x + 3.8, y + .6); c.moveTo(x + .6, y - 3.2); c.lineTo(x + .6, y + 3.8); c.stroke(); }
      }
    }
    // Sinán Ek, el alacrán de las estrellas: cuerpo, pinzas y la cola enroscada, con líneas doradas finas
    const ua = 520, offa = (f.cam * .03) % ua, basea = Math.floor(f.cam * .03 / ua);
    for (let k = -1; k * ua - offa < VW + ua; k++) {
      const i = basea + k, ox = k * ua - offa + 90, oy = 52 + V.h1(i, 90) * 22;
      const P = [[0, 0], [14, 6], [26, 10], [38, 12], [50, 9], [60, 2], [66, -9], [60, -20], [48, -22], [42, -13]];
      const pinza = [[-10, -6], [-4, 3], [0, 0], [-8, 10], [-3, 2]];
      c.save(); c.translate(ox, oy); c.strokeStyle = 'rgba(232,200,114,.45)'; c.lineWidth = .6; c.beginPath(); c.moveTo(P[0][0], P[0][1]); for (const [x, y] of P.slice(1)) c.lineTo(x, y); c.stroke();
      c.beginPath(); c.moveTo(pinza[0][0], pinza[0][1]); c.lineTo(pinza[1][0], pinza[1][1]); c.lineTo(0, 0); c.lineTo(pinza[3][0], pinza[3][1]); c.stroke();
      P.concat([pinza[0], pinza[3]]).forEach(([x, y], j) => { const tw = .7 + .3 * Math.sin(f.t * 2 + j + i); c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x, y, j === 4 ? 7 : 4.5, '#fff3c4', .5 * tw); c.restore(); c.fillStyle = '#fff6d8'; c.beginPath(); c.arc(x, y, j === 4 ? 1.5 : 1, 0, 6.2832); c.fill(); });
      c.restore();
    }
    // una estrella fugaz cada pocos segundos
    const tf = f.t % 7.5; if (tf < 1) { const q = tf, sx = 40 + ((Math.floor(f.t / 7.5) * 131) % 260), x = sx + q * 130, y = 12 + q * 52 + (Math.floor(f.t / 7.5) % 3) * 12; const gl = c.createLinearGradient(x - 40, y - 16, x, y); gl.addColorStop(0, 'rgba(255,240,200,0)'); gl.addColorStop(1, 'rgba(255,248,225,' + (1 - q).toFixed(2) + ')'); c.strokeStyle = gl; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x - 40, y - 16); c.lineTo(x, y); c.stroke(); }
    // resplandor de la luna
    const mx = VW - 78 - ((f.cam * .015) % 40), my = 46;
    c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, mx, my, 70, '#ffd98a', .32); c.restore();
    V.spr(c, 'luna', mx, my, { ay: .5, k: 1.5 });
    // observatorio lejano entre bruma, con su parallax
    const off = (f.cam * .1) % 340, base = Math.floor(f.cam * .1 / 340);
    for (let k = -1; k * 340 - off < VW + 340; k++) {
      const i = base + k; if (V.h1(i, 2) < .35) continue;
      V.spr(c, 'observatorio', k * 340 - off + 80 + V.h1(i, 3) * 120, 168, { ay: 1, k: 1.15, alfa: .34 });
    }
    const nubes = ['nube0', 'nube1', 'nube2'], unit = 190, off2 = (f.cam * .05) % unit, base2 = Math.floor(f.cam * .05 / unit);
    for (let k = -1; k * unit - off2 < VW + unit; k++) {
      const i = base2 + k, n = nubes[Math.floor(V.h1(i, 4) * 3)];
      V.spr(c, n, k * unit - off2 + V.h1(i, 6) * 60, 40 + V.h1(i, 8) * 100, { ay: .5, alfa: .62, k: 1.25 });
    }
    // bruma baja que une el cielo con el suelo
    const g2 = c.createLinearGradient(0, 150, 0, 215); g2.addColorStop(0, 'rgba(120,70,170,0)'); g2.addColorStop(1, 'rgba(120,70,170,.4)'); c.fillStyle = g2; c.fillRect(0, 150, VW, 70);
  });
  // ---- terreno: ladrillo de observatorio, borde dorado, greca y banderas; luego columnas y adornos más grandes ----
  V.terreno(ctx => {
    ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip();
    // ladrillos azul-violeta con junta dorada tenue (sobre la losa de antes)
    ctx.globalAlpha = .93;
    const ymax = VH + 40;
    if (edznaPrincipal() && recursosEdznaListos()) {
      const patron = ctx.createPattern(EDZNA_FONDO.muro, 'repeat');
      patron.setTransform(new DOMMatrix().scale(96 / EDZNA_FONDO.muro.naturalWidth));
      ctx.fillStyle = patron; ctx.fillRect(0, 0, L.ww, ymax);
    } else     for (let y = 0, fila = 0; y < ymax; y += 8, fila++) for (let x = -(fila % 2) * 8; x < L.ww; x += 16) {
      const h = V.h1((x / 16 | 0) + 7, fila + 3);
      ctx.fillStyle = h < .33 ? '#1d2158' : h < .66 ? '#232a66' : '#1a1e4d'; ctx.fillRect(x, y, 16, 8);
      ctx.fillStyle = 'rgba(226,192,110,.2)'; ctx.fillRect(x, y, 16, .6); ctx.fillRect(x, y, .6, 8);
      ctx.fillStyle = 'rgba(255,240,200,.05)'; ctx.fillRect(x + 1, y + 1, 14, 2);
      // cada sillar con su biselado (luz arriba, sombra abajo) y, en algunos, un glifo tallado con filo dorado
      ctx.fillStyle = 'rgba(140,150,255,.10)'; ctx.fillRect(x + .6, y + .6, 14.8, 1.2);
      ctx.fillStyle = 'rgba(0,0,20,.30)'; ctx.fillRect(x + .6, y + 6.4, 15, 1.2); ctx.fillRect(x + 14.6, y + .6, 1, 7);
      if (h > .86 && y > 20) {
        const gx = x + 8, gy = y + 4; ctx.strokeStyle = 'rgba(0,0,20,.55)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(gx, gy, 2.2, 0, 6.2832); ctx.moveTo(gx - 3.4, gy); ctx.lineTo(gx + 3.4, gy); ctx.stroke();
        ctx.strokeStyle = 'rgba(232,192,110,.55)'; ctx.lineWidth = .5; ctx.beginPath(); ctx.arc(gx, gy - .5, 2.2, 0, 6.2832); ctx.moveTo(gx - 3.4, gy - .5); ctx.lineTo(gx + 3.4, gy - .5); ctx.stroke();
      }
    }
    // la luz de la luna baña lo alto de la pared: una franja clara que se pierde hacia abajo
    const lz = ctx.createLinearGradient(0, 150, 0, 215); lz.addColorStop(0, 'rgba(190,200,255,.16)'); lz.addColorStop(1, 'rgba(190,200,255,0)'); ctx.fillStyle = lz; ctx.fillRect(0, 150, L.ww, 65);
    const g = ctx.createLinearGradient(0, 130, 0, ymax); g.addColorStop(0, 'rgba(8,8,34,0)'); g.addColorStop(1, 'rgba(8,8,34,.75)'); ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 120, L.ww, ymax);
    if (V.listo('greca')) {
      const w = V.TAM.greca.w;
      for (const r of L.tops) for (let x = r.x0; x < r.x1; x += w) V.spr(ctx, Math.floor(x / w + r.y) % 3 ? 'greca' : 'lunas', x, r.y + 2.5, { ax: 0, ay: 0 });
      for (const r of L.tops) {      // banderas colgadas de la pared, cada tanto
        for (let x = r.x0 + 30; x < r.x1 - 20; x += 76) { const i = Math.floor(x / 76); if (V.h1(i, 9) < .45) V.spr(ctx, 'bandera' + (i % 3), x, r.y + 11.5, { ay: 0 }); }
      }
    }
    ctx.restore();
    // borde dorado y brillo sobre lo que se pisa
    ctx.save(); ctx.shadowColor = '#ffd98a'; ctx.shadowBlur = 4; ctx.strokeStyle = '#e8c872'; ctx.lineWidth = 1;
    ctx.beginPath(); for (const r of L.tops) { ctx.moveTo(r.x0, r.y + .5); ctx.lineTo(r.x1, r.y + .5); } ctx.stroke(); ctx.restore();
    for (const o of L.deco) {
      const x = o.x, y = o.y + .5, v = V.h1(o.i, 7);
      if (o.k === 'T') V.spr(ctx, 'pilar' + (o.i % 4), x, y, { k: 1.3 });
      else if (o.k === 'f') V.spr(ctx, ['telescopio', 'armilar', 'estela'][o.i % 3], x, y, { k: 1.3, voltea: v < .5 && (o.i % 3) === 2 });
      else if (o.k === 'r') V.spr(ctx, ['ruina0', 'ruina1'][o.i % 2], x, y, { k: 1.2 });
    }
  });
  // ---- meteoros: roca de la lámina; se conserva la estela y el desvanecer de antes ----
  V.look('meteoro', (c, pl, f, sk) => {
    const u = pl.u ?? .5, a = clamp(Math.min((u - .02) / .06, (.94 - u) / .06), 0, 1), x = pl.x, y = pl.y, w = pl.w;
    c.save(); c.globalAlpha = a;
    c.strokeStyle = rgba(sk.accent, .35); c.lineWidth = .5; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(x - 2, y + 2 + i * 1.4); c.lineTo(x - 10 - i * 5, y + 1 + i * 1.6); c.stroke(); }
    c.save(); c.globalCompositeOperation = 'lighter'; const gt = .6 + .4 * Math.sin(f.t * 3 + x * .05);   // brasa dorada bajo la roca y chispas que se desprenden
    glowDot(c, x + w / 2, y + 9, w * .55, '#ffb35a', .26 * gt);
    for (let q = 0; q < 4; q++) { const ph = (f.t * .9 + q * .27 + x * .01) % 1; c.fillStyle = 'rgba(255,214,140,' + (.55 * (1 - ph)).toFixed(2) + ')'; c.fillRect(x + w * (.2 + q * .2) - ph * 3, y + 9 + ph * 12, 1, 1); }
    c.restore();
    V.spr(c, ['roca1', 'roca2', 'roca1'][Math.floor(x / 16) % 3], x + w / 2, y - .6, { w: w + 4, ay: .04 });
    c.restore();
  }, 'roca1');
  // ---- estrellas ancla: la estrella de la lámina; el resplandor y la selección siguen siendo los de la mecánica ----
  V.obj('estrella', (c, o, f, sk, antes) => {
    const sel = f.g.selStar === o, tw = .85 + Math.sin(f.t * 3 + o.i) * .15;
    c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, o.x, o.y, sel ? 18 : 11, '#fff3c4', (sel ? .7 : .3) * tw); c.restore();
    V.spr(c, 'estrella', o.x, o.y, { ay: .5, k: sel ? 1.25 : tw * .95, rot: f.t * .25 });
  }, 'estrella');
  V.meta('meta', { h: 36 });
  // los bichos del cielo se veían muy chicos junto a Itzel: se dibujan 1.4 veces más grandes (sus cajas de golpe crecen en mundos-ampliados6.js)
  const grande = (k, fn) => (c, e, t, s, antes) => { c.save(); c.scale(k, k); try { return fn(c, e, t, s, antes); } finally { c.restore(); } };
  V.fd('escorpion', grande(1, (c, e, t, s, antes) => {
    if (e.st === 'sleep') return V.dormido(c, 'escorpion', t);   // dormido: la misma pieza (no el dibujo viejo)
    if (e.st === 'lunge' && V.listo('escorpionAtaque')) { spr(c, 'escorpionAtaque', 0, .5); return; }
    antes(c, e, t, s);
  }), 'escorpion');
  V.fd('conejo', grande(1, (c, e, t, s, antes) => {
    if (e.st === 'sleep') return V.dormido(c, 'conejo', t);   // dormido: la misma pieza (no el dibujo viejo)
    antes(c, e, t, s);
  }), 'conejo');
  V.fd('cometa', grande(1, (c, e, t, s, antes) => {
    if (e.st === 'sleep') return V.dormido(c, 'cometa', t, -4, { ax: .8, ay: .5, h: 8 });   // dormido: la misma pieza (no el dibujo viejo)
    antes(c, e, t, s);
  }), 'cometa');
  V.fd('jaguar', grande(1, (c, e, t, s, antes) => {
    if (e.st === 'sleep') return V.dormido(c, 'jaguar', t);   // dormido: la misma pieza (no el dibujo viejo)
    if (e.st === 'gone') { spr(c, 'jaguar', 0, .5); return; } // no conserva la pose de salto al desvanecerse
    const n = e.vy !== 0 && V.listo('jaguarSalta') ? 'jaguarSalta' : 'jaguar';
    spr(c, n, 0, .5);
  }), 'jaguar');
  V.moneda('canistel'); V.corazon('corazon');
  window.CIELO_MAYAS = V;
})();
