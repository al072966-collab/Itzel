'use strict';
// =====================================================================
//  Tercera tanda: seis técnicas nuevas para los mundos nuevos
//  plastilina (barro), diorama 2.5D (jardín de ecos), risografía
//  (fuego), cianotipia (agua), origami (hielo) y carta celeste (espacio)
// =====================================================================
(function () {
  const R = (i, s) => hash1(i, s);
  const pat = (x, f, c) => { const p = x.createPattern(c, 'repeat'); p.setTransform(new DOMMatrix([1 / f.S, 0, 0, 1 / f.S, 0, 0])); return p; };
  const tops = (fn) => { for (const r of L.tops) fn(r.x0, r.x1, r.y); };

  // ===================================================================
  //  PLASTILINA · "El taller de la alfarera"
  // ===================================================================
  const SM = t => Math.floor(t * 12) / 12;                 // reloj de stop-motion (12 cuadros por segundo)
  // relleno de plastilina: sombra interior abajo a la derecha, brillo arriba a la izquierda y huellas
  function clay(x, f, P, base, o = {}) {
    // (sirve con figuras hechas de varios círculos encimados: no usa evenodd)
    const S = f.S, k = Math.abs(o.k ?? 1), inv = (o.k ?? 1) < 0 ? -1 : 1, bl = (o.blur || 3.2) * .45 * S;
    x.save(); x.beginPath(); P(x); x.clip();
    x.fillStyle = shade(base, -.4 * k); x.fillRect(-4000, -4000, 12000, 12000);                 // orilla en sombra
    x.save(); x.filter = `blur(${bl}px)`; x.translate(-1.3 * k * inv, -2 * k * inv); x.beginPath(); P(x); x.fillStyle = base; x.fill(); x.restore();
    x.save(); x.filter = `blur(${bl * .7}px)`; x.translate(.8 * k * inv, 1.1 * k * inv); x.beginPath(); P(x); x.strokeStyle = rgba(shade(base, .35), .42 * k); x.lineWidth = 1; x.stroke(); x.restore();
    if (o.thumb !== false) { x.globalAlpha = o.thumbA ?? .5; x.globalCompositeOperation = 'multiply'; x.fillStyle = pat(x, f, thumbs(f)); x.fillRect(-4000, -4000, 12000, 12000); }
    x.restore();
  }
  // RELIEVE DE PLASTILINA: con la silueta (y un poco del color) se arma un mapa de alturas,
  // se suaviza y se ilumina desde arriba a la izquierda: orillas redondas, sombra y brillo
  function relieve(cv, S, o = {}) {
    const W = cv.width, H = cv.height; if (!W || !H) return;
    const x = cv.getContext('2d'), im = x.getImageData(0, 0, W, H), d = im.data;
    const hc = mkCanvas(W, H), hx = hc.getContext('2d'), hm = hx.createImageData(W, H), hd = hm.data, lum = o.lum ?? .35;
    for (let i = 0; i < d.length; i += 4) { const a = d[i + 3] / 255, l = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255, v = a * (1 - lum + lum * l) * 255; hd[i] = hd[i + 1] = hd[i + 2] = v; hd[i + 3] = 255; }
    hx.putImageData(hm, 0, 0);
    const bc = mkCanvas(W, H), bx = bc.getContext('2d'); bx.filter = `blur(${(o.blur || 3) * S}px)`; bx.drawImage(hc, 0, 0); const b = bx.getImageData(0, 0, W, H).data;
    const off = Math.max(1, Math.round((o.alcance || 1.2) * S)), k = (o.fuerza || 1.4) * 2.2, sp = o.brillo ?? .55;
    for (let y = 0; y < H; y++) { const ya = Math.max(0, y - off) * W, yb = Math.min(H - 1, y + off) * W; for (let xx = 0; xx < W; xx++) {
      const i = (y * W + xx) * 4; if (d[i + 3] < 10) continue;
      const s2 = (b[(yb + Math.min(W - 1, xx + off)) * 4] - b[(ya + Math.max(0, xx - off)) * 4]) / 255, L = s2 * k, fm = Math.max(.58, Math.min(1.32, 1 + L * .48)), add = L > .28 ? Math.min(24, (L - .28) * sp * 65) : 0;
      d[i] = Math.min(255, d[i] * fm + add); d[i + 1] = Math.min(255, d[i + 1] * fm + add); d[i + 2] = Math.min(255, d[i + 2] * fm + add);
    } }
    x.putImageData(im, 0, 0);
  }
  window.relieveArcilla = relieve;
  function thumbs(f) {
    return cached(f, 'clay-thumbs', 90, 90, (x) => {
      const r = rng(77);
      for (let i = 0; i < 7; i++) {
        const cx = r() * 90, cy = r() * 90, a = r() * 3, n = 5 + (r() * 4 | 0);
        x.strokeStyle = 'rgba(90,40,20,.10)'; x.lineWidth = .35;
        for (let k = 1; k <= n; k++) for (const ox of [-90, 0, 90]) for (const oy of [-90, 0, 90]) { x.beginPath(); x.ellipse(cx + ox, cy + oy, k * 1.1, k * .75, a, .3, TAU - .5); x.stroke(); }
      }
      for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(80,40,20,${.04 + r() * .06})`; x.beginPath(); x.arc(r() * 90, r() * 90, .3 + r() * .5, 0, TAU); x.fill(); }
    });
  }
  const blobs = (cs) => (x) => { for (const [cx, cy, rx, ry] of cs) { x.moveTo(cx + rx, cy); x.ellipse(cx, cy, rx, ry ?? rx, 0, 0, TAU); } };
  function wire(x, x0, y0, len) { x.strokeStyle = 'rgba(70,60,60,.55)'; x.lineWidth = .3; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x0, y0 - len); x.stroke(); }
  defStyle({
    id: 'barro', name: 'Plastilina', ref: 'Aardman · Coraline · animación cuadro por cuadro', order: 41,
    desc: 'Todo moldeado en plastilina y fotografiado a 12 cuadros por segundo: huellas de dedo, sombras suaves y el sol colgado de un alambre.',
    fx: { dust: ['#d98a55', '#c66b3d', '#efc08f'], spark: ['#ffd36b', '#ff8a5c', '#ffffff'], confetti: ['#e85a4f', '#f2b233', '#5fae6a', '#4f8fd6', '#f28fb8'] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'fondo', x => {
        const g = x.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#8fc6cf'); g.addColorStop(.55, '#cfe2d6'); g.addColorStop(1, '#f6d6ac'); x.fillStyle = g; x.fillRect(0, 0, VW, VH);
        // brochazos del telón pintado
        const r = rng(4); for (let i = 0; i < 220; i++) { const y = r() * VH, w = 20 + r() * 60; x.strokeStyle = r() < .5 ? 'rgba(255,255,255,.08)' : 'rgba(60,110,120,.05)'; x.lineWidth = 1 + r() * 2.5; x.beginPath(); x.moveTo(r() * VW, y); x.quadraticCurveTo(r() * VW, y + (r() - .5) * 6, r() * VW + w, y + (r() - .5) * 4); x.stroke(); }
      });
      const t = SM(f.t), jit = (i) => (R(Math.floor(f.t * 12), i) - .5) * .5;
      // sol de plastilina colgado
      const sx = 312 - f.cam * .02 + jit(1), sy = 62 + Math.sin(t * 1.2) * 1.2;
      wire(ctx, sx - 6, sy - 14, 80); wire(ctx, sx + 6, sy - 14, 80);
      const sun = cached(f, 'sol', 60, 60, x => { clay(x, f, blobs([[30, 30, 19]]), '#ffb347'); x.save(); x.globalAlpha = .9; clay(x, f, blobs([[30, 30, 12]]), '#ffd36b', { k: .6 }); x.restore(); relieve(x.canvas, f.S, { blur: 3, alcance: 1.2 }); });
      ctx.drawImage(sun, sx - 30, sy - 30, 60, 60);
      // nubes de plastilina en alambres
      for (let i = 0; i < 4; i++) {
        const c = cached(f, 'nube' + i, 80, 40, x => { const cs = []; const n = 3 + i % 2; for (let k = 0; k < n; k++) cs.push([16 + k * 14, 24 - (k % 2) * 5, 9 + R(k, i) * 4, 7 + R(k, i + 3) * 3]); cs.push([12 + (n - 1) * 7, 28, (n - 1) * 8 + 8, 6]); clay(x, f, blobs(cs), '#fbf3e6', { k: .8 }); relieve(x.canvas, f.S, { blur: 2.6, alcance: 1.1 }); });
        const cx = wrap(i * 140 + 40 - f.cam * .06, VW + 120) - 80, cy = 28 + (i * 23) % 44 + Math.sin(t * .8 + i) * 1.5;
        wire(ctx, cx + 30 + jit(i + 4), cy + 14, 60); ctx.drawImage(c, cx + jit(i), cy, 80, 40);
      }
      // Edzná y los lomeríos: cartón pintado
      strip(ctx, f, 'far', .07, (x, w) => {
        x.save(); x.shadowColor = 'rgba(90,60,40,.3)'; x.shadowBlur = 4 * f.S; x.shadowOffsetY = 2 * f.S;
        x.beginPath(); CAMP.skyline(x, 0, w, 168, 'far', 2, 1.15); x.fillStyle = '#e8bf95'; x.fill(); x.restore();
        x.save(); x.beginPath(); CAMP.skyline(x, 0, w, 168, 'far', 2, 1.15); x.clip(); x.globalAlpha = .06; x.strokeStyle = '#8a5a3a'; for (let i = 0; i < w; i += 3) { x.beginPath(); x.moveTo(i, 100); x.lineTo(i + 30, VH); x.stroke(); } x.restore();
        relieve(x.canvas, f.S, { blur: 4, alcance: 1.6, fuerza: 1.1 });
      });
      // el centro histórico, casita por casita en plastilina
      strip(ctx, f, 'ciudad', .18, (x, w) => {
        const base = 190, sc = 1.35;
        clay(x, f, xx => CAMP.skyline(xx, 0, w, base, 'mid', 5, sc), '#e3b48a', { k: .6, thumbA: .3 });
        for (const fa of CAMP.facades(0, w, 5)) {
          const top = base - (4 + fa.h) * sc, col = mix(CAMP.FACHADAS[fa.col], '#f3d9b8', .25);
          clay(x, f, xx => roundRect(xx, fa.x0 + .6, top + 2, fa.w - 1.2, base - top, 2.2), col, { k: .7, blur: 2.4, thumbA: .35 });
          const n = Math.max(1, Math.floor(fa.w / 7)), gp = fa.w / n;
          for (let i = 0; i < n; i++) { const wx = fa.x0 + gp * (i + .5); clay(x, f, xx => { xx.moveTo(wx - 1.7, top + 13); xx.lineTo(wx - 1.7, top + 8); xx.arc(wx, top + 8, 1.7, Math.PI, 0); xx.lineTo(wx + 1.7, top + 13); xx.closePath(); }, '#5a4048', { k: -.7, blur: 1.6, thumb: false }); }
        }
        relieve(x.canvas, f.S, { blur: 2, alcance: 1, fuerza: 1.3, lum: .5 });
      });
      // selva de plastilina
      strip(ctx, f, 'selva', .42, (x, w) => {
        const base = 214, sc = .8, ps = CAMP.props(0, w, 'near', 13);
        clay(x, f, xx => CAMP.skyline(xx, 0, w, base, 'near', 13, sc), '#5f9a5a', { k: .8 });
        clay(x, f, xx => { for (const q of ps) { const b = base - CAMP.h(q.x, 'near', 13) * sc + 3; if (q.k === 'palma') CAMP.palma(xx, q.x, b, q.h * sc, q.lean, q.s, 0, 'trunk'); else CAMP.ceiba(xx, q.x, b, q.h * sc, q.w * sc, q.s, 'trunk'); } }, '#8a5a3c', { k: .7 });
        clay(x, f, xx => { for (const q of ps) { const b = base - CAMP.h(q.x, 'near', 13) * sc + 3; if (q.k === 'palma') CAMP.palma(xx, q.x, b, q.h * sc, q.lean, q.s, 0, 'crown'); else CAMP.ceiba(xx, q.x, b, q.h * sc, q.w * sc, q.s, 'crown'); } }, '#4e8a4a', { k: .9 });
        relieve(x.canvas, f.S, { blur: 2.6, alcance: 1.2, fuerza: 1.4, lum: .5 });
      });
    },
    terrain(ctx, f) {
      const loops = organicLoops({ step: 4, amp: .9, freq: .3, seed: 41 });
      const P = x => { for (const l of loops) pathRound(x, l, 3); };
      clay(ctx, f, P, '#c66b3d', { blur: 4 });
      ctx.save(); ctx.beginPath(); P(ctx); ctx.clip();
      // tiras de plastilina puestas una sobre otra, siguiendo la orilla
      [[22, '#b35c34'], [46, '#d58a56'], [74, '#a24f2c']].forEach(([dy, col], i) => clay(ctx, f, x => { for (const t of L.tops) { x.moveTo(t.x0 - 2, VH + 30); for (let xx = t.x0 - 2; xx <= t.x1 + 2; xx += 6) x.lineTo(xx, t.y + dy + Math.sin(xx * .02 + i * 2) * 4 + (R(xx | 0, dy) - .5) * 1.2); x.lineTo(t.x1 + 2, VH + 30); x.closePath(); } }, col, { k: .7 }));
      // huellas de dedo hundidas y bolitas de barro pegadas
      const rh = rng(43), hue = [], bol = [];
      for (let i = 0; i < L.ww / 20; i++) { const x = rh() * L.ww, y = 20 + rh() * 215, rx = 4.5 + rh() * 3, ry = rx * (.7 + rh() * .2), a = rh() * 3; if (L.depth(x, y) >= 11) hue.push([x, y, rx, ry, a]); }
      for (let i = 0; i < L.ww / 14; i++) { const x = rh() * L.ww, y = 20 + rh() * 215, r = 1.3 + rh() * 2.1; if (L.depth(x, y) >= 11) bol.push([x, y, r]); }
      clay(ctx, f, x => { for (const [hx, hy, rx, ry, a] of hue) { x.moveTo(hx + Math.cos(a) * rx, hy + Math.sin(a) * rx); x.ellipse(hx, hy, rx, ry, a, 0, TAU); x.closePath(); } }, '#b4603a', { k: -.6, blur: 2.4 });
      ctx.strokeStyle = 'rgba(70,25,10,.17)'; ctx.lineWidth = .3;
      for (const [hx, hy, rx, ry, a] of hue) for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.ellipse(hx, hy + .3, rx * k / 4, ry * k / 4, a, .2 + k * .7, 4.2 + k * .7); ctx.stroke(); }
      clay(ctx, f, x => { for (const [bx, by, r] of bol) { x.moveTo(bx + r, by); x.arc(bx, by, r, 0, TAU); x.closePath(); } }, '#e0ac82', { k: .8, blur: 1.8 });
      ctx.restore();
      // cordón de pasto enrollado sobre cada orilla
      tops((a, b, y) => {
        // el cordón de pasto va justo sobre el piso (su filo es la colisión) y no sobresale de la orilla:
        // antes subía hasta 4 unidades y se redondeaba por fuera, y parecía que uno se paraba en la curva
        clay(ctx, f, x => { x.moveTo(a, y + 5); x.lineTo(a, y - .2); for (let xx = a; xx <= b; xx += 3) x.lineTo(xx, y - .6 - Math.abs(Math.sin(xx * .35)) * .5); x.lineTo(b, y - .2); x.lineTo(b, y + 5); x.closePath(); }, '#76b25a', { blur: 2.4 });
        for (let xx = a + 4; xx < b - 3; xx += 9 + R(xx, 3) * 6) { ctx.fillStyle = 'rgba(40,80,30,.25)'; ctx.beginPath(); ctx.ellipse(xx, y + 1.2, 1.6, .9, 0, 0, TAU); ctx.fill(); }
      });
      for (const o of L.deco) {
        const x = o.x, y = o.y;
        if (o.k === 'T') {
          const palm = o.i % 2 === 1, h = 46 + R(o.i, 1) * 12;
          clay(ctx, f, c => palm ? CAMP.palma(c, x, y + 1, h, (R(o.i, 2) - .5) * .4, o.i, 0, 'trunk') : CAMP.ceiba(c, x, y + 1, h + 6, 40, o.i, 'trunk'), '#8f5a3a');
          clay(ctx, f, c => palm ? CAMP.palma(c, x, y + 1, h, (R(o.i, 2) - .5) * .4, o.i, 0, 'crown') : CAMP.ceiba(c, x, y + 1, h + 6, 40, o.i, 'crown'), palm ? '#5f9e4f' : '#6aa85a');
        } else if (o.k === 'f') {
          for (let k = 0; k < 3; k++) { const fx = x - 5 + k * 5, fy = y - 5 - (k % 2) * 3; ctx.strokeStyle = '#4e8a3e'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(fx, y); ctx.lineTo(fx, fy); ctx.stroke(); clay(ctx, f, blobs([[fx, fy, 2.2]]), ['#e85a4f', '#f2b233', '#b77fd6'][(o.i + k) % 3], { k: .6, blur: 1.4, thumb: false }); }
        } else if (o.k === 'r') {
          // cántaro de barro con rayas pintadas
          clay(ctx, f, c => { c.moveTo(x - 3, y - 15); c.lineTo(x + 3, y - 15); c.quadraticCurveTo(x + 2, y - 11, x + 6.5, y - 7); c.quadraticCurveTo(x + 8, y - 1, x + 3.5, y); c.lineTo(x - 3.5, y); c.quadraticCurveTo(x - 8, y - 1, x - 6.5, y - 7); c.quadraticCurveTo(x - 2, y - 11, x - 3, y - 15); c.closePath(); }, '#b8613a', { blur: 2.2 });
          ctx.strokeStyle = 'rgba(250,236,210,.85)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(x - 6.6, y - 6); ctx.quadraticCurveTo(x, y - 4.5, x + 6.6, y - 6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 5.6, y - 3.5); ctx.quadraticCurveTo(x, y - 2, x + 5.6, y - 3.5); ctx.stroke();
        }
      }
      relieve(ctx.canvas, f.S, { blur: 3, alcance: 1.3, fuerza: 1.5, lum: .45 });
    },
    player(ctx, p, f) { drawHero(ctx, p, f, { body: '#e85a4f', skin: '#d9a07a', hair: '#3a2420', leg: '#3a2420', eye: '#241718' }); },
    coin(ctx, x, y, t, f) {
      const tt = SM(t), s = Math.cos(tt * 2.6 + x * .05), yy = y + Math.sin(tt * 2.5 + x) * 1.6;
      const c = cached(f, 'cacao', 18, 18, xx => { clay(xx, f, c => c.ellipse(9, 9, 4.6, 6.4, .25, 0, TAU), '#a5532e', { blur: 1.8 }); xx.strokeStyle = 'rgba(60,20,10,.45)'; xx.lineWidth = .6; xx.beginPath(); xx.moveTo(8, 3.5); xx.quadraticCurveTo(10.5, 9, 9.5, 14.5); xx.stroke(); });
      ctx.save(); ctx.translate(x, yy); ctx.scale(Math.max(.25, Math.abs(s)), 1); ctx.drawImage(c, -9, -9, 18, 18); ctx.restore();
    },
    goal(ctx, x, y, t, f) {
      const tt = SM(t);
      clay(ctx, f, c => roundRect(c, x - 1.4, y - 48, 2.8, 48, 1.3), '#9aa0a8', { k: .7, thumb: false });
      clay(ctx, f, c => { c.moveTo(x + 1, y - 47); for (let i = 0; i <= 8; i++) c.lineTo(x + 1 + i * 2.4, y - 47 + i * .5 + Math.sin(tt * 5 - i * .7) * i * .25); for (let i = 8; i >= 0; i--) c.lineTo(x + 1 + i * 2.4, y - 35 - i * .5 + Math.sin(tt * 5 - i * .7) * i * .25); c.closePath(); }, '#e85a4f', { k: .8, blur: 2 });
      clay(ctx, f, blobs([[x, y - 49, 2.4]]), '#f2b233', { k: .6, thumb: false });
    },
    over(ctx, f) {
      // parpadeo de foto y luz de lámpara del estudio
      const fr = Math.floor(f.t * 12), fl = (R(fr, 9) - .5) * .05;
      ctx.fillStyle = fl > 0 ? `rgba(255,240,210,${fl})` : `rgba(40,20,10,${-fl})`; ctx.fillRect(0, 0, VW, VH);
      const g = ctx.createRadialGradient(VW * .3, -40, 20, VW * .3, -40, VW * .9); g.addColorStop(0, 'rgba(255,230,190,.18)'); g.addColorStop(1, 'rgba(255,230,190,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      vignette(ctx, .38, '#3a2014', .5);
    },
  });

  // ===================================================================
  //  DIORAMA 2.5D · "El jardín de los ecos" (perspectiva de Luma)
  // ===================================================================
  const DX = 12, DY = -8;                                  // vector de profundidad (hacia atrás y arriba)
  const LU = { top: '#4e8878', top2: '#457b70', rim: '#8cc4a2', side: '#173440', front: '#24454e', front2: '#1a3640', seed: '#ffdd94', glow: '#9affee' };
  function isoTile(x, cx, cy, s, h, top, top2, side, side2, rim) {
    const a = [cx, cy - s * .5], b = [cx + s, cy], c = [cx, cy + s * .5], d = [cx - s, cy];
    x.beginPath(); x.moveTo(d[0], d[1]); x.lineTo(c[0], c[1]); x.lineTo(c[0], c[1] + h); x.lineTo(d[0], d[1] + h); x.closePath(); x.fillStyle = side; x.fill();
    x.beginPath(); x.moveTo(c[0], c[1]); x.lineTo(b[0], b[1]); x.lineTo(b[0], b[1] + h); x.lineTo(c[0], c[1] + h); x.closePath(); x.fillStyle = side2; x.fill();
    x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.lineTo(c[0], c[1]); x.lineTo(d[0], d[1]); x.closePath(); x.fillStyle = top; x.fill();
    x.strokeStyle = rim; x.lineWidth = .4; x.stroke();
    x.fillStyle = top2; x.beginPath(); x.moveTo(d[0] + s * .15, d[1]); x.lineTo(c[0], c[1] - s * .08); x.lineTo(c[0], c[1]); x.lineTo(d[0], d[1]); x.closePath(); x.fill();
  }
  function isoIsland(x, cx, cy, s, h, seed, alpha, lit) {
    const r = rng(seed), cells = [[0, 0]], n = 3 + (r() * 5 | 0);
    while (cells.length < n) { const q = cells[(r() * cells.length) | 0], d = [[1, 0], [-1, 0], [0, 1], [0, -1]][(r() * 4) | 0], k = [q[0] + d[0], q[1] + d[1]]; if (!cells.some(c => c[0] === k[0] && c[1] === k[1])) cells.push(k); }
    cells.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));
    x.save(); x.globalAlpha = alpha;
    for (const [i, j] of cells) { const px = cx + (i - j) * s, py = cy + (i + j) * s * .5; isoTile(x, px, py, s, h + R(i * 7 + j, seed) * h * .4, (i + j) % 2 ? LU.top : LU.top2, LU.top, LU.front, LU.side, LU.rim); }
    // arbolito y semillas que brillan
    const [ti, tj] = cells[cells.length - 1], tx = cx + (ti - tj) * s, ty = cy + (ti + tj) * s * .5;
    x.fillStyle = '#2a5048'; x.fillRect(tx - .6, ty - s * .9, 1.2, s * .9);
    x.fillStyle = '#6fb08e'; x.beginPath(); x.arc(tx, ty - s * 1.1, s * .55, 0, TAU); x.fill(); x.fillStyle = '#8fd0a8'; x.beginPath(); x.arc(tx - s * .15, ty - s * 1.25, s * .3, 0, TAU); x.fill();
    if (lit) { const [li, lj] = cells[0], lx = cx + (li - lj) * s, ly = cy + (li + lj) * s * .5; x.globalCompositeOperation = 'lighter'; glowDot(x, lx, ly - 2, s * 1.4, LU.seed, .5); x.globalCompositeOperation = 'source-over'; x.fillStyle = '#fff2c8'; x.beginPath(); x.arc(lx, ly - 2, .9, 0, TAU); x.fill(); }
    x.restore();
  }
  // caja isométrica parada en (cx, cy): a = ancho hacia la derecha, b = fondo hacia la izquierda
  function isoBox(x, cx, cy, a, b, h, col, ventanas) {
    const P = (u, v, z) => [cx + u - v, cy + (u + v) * .5 - z];
    const cara = (pts, c) => { x.beginPath(); pts.forEach(p => x.lineTo(p[0], p[1])); x.closePath(); x.fillStyle = c; x.fill(); };
    cara([P(0, b, 0), P(a, b, 0), P(a, b, h), P(0, b, h)], shade(col, -.12));
    cara([P(a, b, 0), P(a, 0, 0), P(a, 0, h), P(a, b, h)], shade(col, -.4));
    cara([P(0, 0, h), P(a, 0, h), P(a, b, h), P(0, b, h)], shade(col, .12));
    if (ventanas) {
      x.fillStyle = LU.seed;
      for (let u = 1.6; u < a - 1; u += 3.2) for (let z = 2; z < h - 2; z += 4.5) if (hash2(u * 9 + cx, z + cy, 7) < .55) { x.beginPath(); const p = P(u, b, z); x.moveTo(p[0], p[1]); x.lineTo(p[0] + 1.2, p[1] + .6); x.lineTo(p[0] + 1.2, p[1] - 1.2); x.lineTo(p[0], p[1] - 1.8); x.closePath(); x.fill(); }
    }
    return P;
  }
  // isla grande lejana con un pedazo de Campeche encima (catedral, casas, palmeras)
  function islaCampeche(x, cx, cy, S, seed) {
    const r = rng(seed), top = [cx, cy - S * .5], der = [cx + S, cy], abj = [cx, cy + S * .5], izq = [cx - S, cy];
    // panza de roca con facetas y lianas
    const punta = [cx + (r() - .5) * S * .3, cy + S * 1.45], pz = [izq, [cx - S * .55, cy + S * .62], abj, [cx + S * .5, cy + S * .55], der];
    for (let i = 0; i < pz.length - 1; i++) { x.beginPath(); x.moveTo(...pz[i]); x.lineTo(...pz[i + 1]); x.lineTo(...punta); x.closePath(); x.fillStyle = mix(LU.side, '#0b1d24', .15 + i / pz.length * .55); x.fill(); }
    x.strokeStyle = 'rgba(111,176,142,.55)'; x.lineWidth = .5;
    for (let i = 0; i < 6; i++) { const u = r(), bx = lerp(izq[0], der[0], u), by = cy + Math.sin(u * Math.PI) * S * .5, l = 6 + r() * S * .5; x.beginPath(); x.moveTo(bx, by); x.quadraticCurveTo(bx + (r() - .5) * 4, by + l * .5, bx + (r() - .5) * 3, by + l); x.stroke(); x.globalCompositeOperation = 'lighter'; glowDot(x, bx, by + l, 1.6, LU.glow, .5); x.globalCompositeOperation = 'source-over'; }
    // tapa de pasto
    x.beginPath(); x.moveTo(...top); x.lineTo(...der); x.lineTo(...abj); x.lineTo(...izq); x.closePath(); x.fillStyle = LU.top; x.fill(); x.strokeStyle = LU.rim; x.lineWidth = .5; x.stroke();
    x.beginPath(); x.moveTo(...izq); x.lineTo(...abj); x.lineTo(abj[0], abj[1] + 3); x.lineTo(izq[0], izq[1] + 3); x.closePath(); x.fillStyle = LU.front; x.fill();
    x.beginPath(); x.moveTo(...abj); x.lineTo(...der); x.lineTo(der[0], der[1] + 3); x.lineTo(abj[0], abj[1] + 3); x.closePath(); x.fillStyle = LU.side; x.fill();
    // lo que va encima, de atrás hacia adelante; (u, v) en unidades de la tapa (0..1)
    const en = (u, v) => [top[0] + (u - v) * S, top[1] + (u + v) * S * .5];
    const cosas = [];
    if (r() < .6) cosas.push({ k: 'cat', u: .28, v: .22 }); else cosas.push({ k: 'bal', u: .3, v: .25 });
    for (let i = 0; i < 5; i++) cosas.push({ k: 'casa', u: .15 + r() * .65, v: .5 + r() * .35, col: CAMP.FACHADAS[(r() * CAMP.FACHADAS.length) | 0] });
    for (let i = 0; i < 2; i++) cosas.push({ k: 'palma', u: .6 + r() * .3, v: .1 + r() * .4 });
    cosas.sort((p, q) => (p.u + p.v) - (q.u + q.v));
    const s = S / 46;
    for (const o of cosas) {
      const [px, py] = en(o.u, o.v);
      if (o.k === 'cat') {
        const cuerpo = '#cfc3a8';
        isoBox(x, px - 2 * s, py, 14 * s, 9 * s, 13 * s, mix(cuerpo, '#245a58', .35), true);
        for (const dx of [-9, 7]) { const Pt = isoBox(x, px + dx * s, py + 4 * s, 4.5 * s, 4.5 * s, 25 * s, mix(cuerpo, '#245a58', .3), true); const c = Pt(2.25 * s, 2.25 * s, 25 * s); x.fillStyle = mix(cuerpo, '#245a58', .2); x.beginPath(); x.moveTo(c[0] - 3.2 * s, c[1]); x.lineTo(c[0], c[1] - 6 * s); x.lineTo(c[0] + 3.2 * s, c[1]); x.closePath(); x.fill(); x.fillStyle = LU.seed; x.fillRect(c[0] - .5, c[1] - 9 * s, 1, 3 * s); }
      } else if (o.k === 'bal') {
        const Pb = isoBox(x, px, py, 14 * s, 14 * s, 9 * s, mix('#b9a98a', '#245a58', .35), false);
        x.fillStyle = mix('#b9a98a', '#245a58', .2); for (let i = 0; i < 4; i++) { const m = Pb(i * 4 * s, 14 * s, 9 * s); x.fillRect(m[0], m[1] - 2 * s, 2 * s, 2 * s); }
        const g = Pb(14 * s, 14 * s, 9 * s); x.fillStyle = mix('#b9a98a', '#245a58', .25); x.beginPath(); x.arc(g[0], g[1] - 3 * s, 2.2 * s, Math.PI, 0); x.fill(); x.fillRect(g[0] - 2.2 * s, g[1] - 3 * s, 4.4 * s, 3 * s);
      } else if (o.k === 'casa') {
        isoBox(x, px, py, (6 + r() * 4) * s, 5 * s, (6 + r() * 4) * s, mix(o.col, '#245a58', .45), true);
      } else {
        x.beginPath(); CAMP.palma(x, px, py, 18 * s, (r() - .5) * .5, seed + o.u * 99, 0); x.fillStyle = '#2a5048'; x.fill();
      }
    }
    // farolito que brilla en la orilla
    x.globalCompositeOperation = 'lighter'; glowDot(x, ...en(.95, .9), 6 * s, LU.seed, .45); x.globalCompositeOperation = 'source-over';
  }
  defStyle({
    id: 'eco', name: 'Diorama 2.5D', ref: 'Luma, el jardín de los ecos · Captain Toad · Monument Valley', order: 42,
    desc: 'Un jardín de islas flotantes visto en perspectiva: cada loseta tiene cara de arriba, costado y frente, y el fondo son islas isométricas.',
    fx: { dust: ['#9affee', '#c7ffed'], spark: ['#ffdd94', '#9affee', '#ffffff'], confetti: ['#73efd0', '#ffc980', '#cba6ff', '#ffdd94', '#ffffff'] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'cielo', x => {
        const g = x.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#0b1d24'); g.addColorStop(.6, '#163a40'); g.addColorStop(1, '#245a58'); x.fillStyle = g; x.fillRect(0, 0, VW, VH);
        ambient(90, 21, (i, a, b, c) => { x.fillStyle = `rgba(200,255,240,${.1 + c * .4})`; x.beginPath(); x.arc(a * VW, b * 150, .3 + c * .5, 0, TAU); x.fill(); });
        // luna grande con halo y anillo, y rayos de luz que bajan
        const mx = VW * .74, my = 46, h = x.createRadialGradient(mx, my, 4, mx, my, 90); h.addColorStop(0, 'rgba(200,255,236,.28)'); h.addColorStop(1, 'rgba(200,255,236,0)'); x.fillStyle = h; x.fillRect(0, 0, VW, VH);
        x.fillStyle = '#e4fff4'; x.beginPath(); x.arc(mx, my, 15, 0, TAU); x.fill();
        x.fillStyle = 'rgba(140,196,170,.35)'; for (const [dx, dy, rr] of [[-5, -3, 3.4], [4, 4, 2.4], [6, -6, 1.6], [-2, 7, 1.4]]) { x.beginPath(); x.arc(mx + dx, my + dy, rr, 0, TAU); x.fill(); }
        x.strokeStyle = 'rgba(154,255,238,.3)'; x.lineWidth = .6; x.beginPath(); x.ellipse(mx, my, 30, 8, -.25, 0, TAU); x.stroke();
        x.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 4; i++) { const rx = mx - 30 - i * 46; x.fillStyle = `rgba(154,255,238,${.035 - i * .005})`; x.beginPath(); x.moveTo(rx, 0); x.lineTo(rx + 14, 0); x.lineTo(rx - 40, VH); x.lineTo(rx - 70, VH); x.closePath(); x.fill(); }
        x.globalCompositeOperation = 'source-over';
      });
      strip(ctx, f, 'islas-campeche', .05, (x, w) => { for (let i = 0, px = 70; px < w + 60; i++, px += 230 + R(i, 31) * 140) islaCampeche(x, px, 72 + R(i, 32) * 34, 34 + R(i, 33) * 14, i * 29 + 3); }, .8);
      // pulsos de eco que salen de las islas lejanas
      ctx.save(); ctx.strokeStyle = LU.glow; ctx.lineWidth = .6;
      for (let i = 0; i < 3; i++) { const cx = wrap(i * 190 + 80 - f.cam * .08, VW + 160) - 80, cy = 80 + i * 22, k = wrap(f.t * .25 + i * .33, 1); ctx.globalAlpha = (1 - k) * .3; ctx.beginPath(); ctx.ellipse(cx, cy, 10 + k * 60, (10 + k * 60) * .5, 0, 0, TAU); ctx.stroke(); }
      ctx.restore();
      strip(ctx, f, 'islas-lejos', .08, (x, w) => { for (let i = 0; i < w / 70; i++) isoIsland(x, i * 70 + R(i, 3) * 40, 60 + R(i, 4) * 70, 5, 6, i * 13 + 1, .45, R(i, 5) < .5); });
      strip(ctx, f, 'islas-cerca', .2, (x, w) => {
        for (let i = 0; i < w / 120; i++) isoIsland(x, i * 120 + R(i, 6) * 60, 120 + R(i, 7) * 50, 9, 10, i * 17 + 5, .8, R(i, 8) < .7);
        // puentes de luz entre islas
        x.strokeStyle = 'rgba(154,255,238,.25)'; x.setLineDash([2, 3]); x.lineWidth = .7;
        for (let i = 0; i < w / 120 - 1; i++) { x.beginPath(); x.moveTo(i * 120 + R(i, 6) * 60, 120 + R(i, 7) * 50); x.lineTo((i + 1) * 120 + R(i + 1, 6) * 60, 120 + R(i + 1, 7) * 50); x.stroke(); }
        x.setLineDash([]);
      });
      // neblina del jardín
      const m = ctx.createLinearGradient(0, 150, 0, VH); m.addColorStop(0, 'rgba(110,190,170,0)'); m.addColorStop(1, 'rgba(110,190,170,.22)'); ctx.fillStyle = m; ctx.fillRect(0, 150, VW, 90);
    },
    terrain(ctx) {
      // 1) caras de arriba (losetas en tablero) y costados derechos
      for (let cy = 0; cy < L.gh; cy++) for (let cx = 0; cx < L.gw; cx++) {
        if (!L.solid(cx, cy)) continue;
        const X = cx * T, Y = cy * T;
        if (!L.solid(cx + 1, cy)) { ctx.beginPath(); ctx.moveTo(X + T, Y); ctx.lineTo(X + T + DX, Y + DY); ctx.lineTo(X + T + DX, Y + T + DY); ctx.lineTo(X + T, Y + T); ctx.closePath(); const g = ctx.createLinearGradient(0, Y, 0, Y + T); g.addColorStop(0, '#2a5560'); g.addColorStop(1, LU.side); ctx.fillStyle = cy > 12 ? LU.side : g; ctx.fill(); }
        if (!L.solid(cx, cy - 1)) {
          ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X + T, Y); ctx.lineTo(X + T + DX, Y + DY); ctx.lineTo(X + DX, Y + DY); ctx.closePath();
          ctx.fillStyle = (cx + cy) % 2 ? LU.top : LU.top2; ctx.fill(); ctx.strokeStyle = 'rgba(140,196,162,.55)'; ctx.lineWidth = .45; ctx.stroke();
          if (R(cx, cy) < .35) { ctx.strokeStyle = '#7fbf98'; ctx.lineWidth = .5; ctx.beginPath(); const bx = X + 4 + R(cx, 2) * 6, by = Y - 2; ctx.moveTo(bx, by + 1); ctx.lineTo(bx + 1.5, by - 1.5); ctx.lineTo(bx + 3, by + .8); ctx.stroke(); }
        }
      }
      // 2) frente de las losetas
      allLoopsPath(ctx, L.loops);
      const g = ctx.createLinearGradient(0, 120, 0, VH); g.addColorStop(0, '#2c5862'); g.addColorStop(1, '#122830'); ctx.fillStyle = g; ctx.fill();
      ctx.save(); ctx.clip();
      for (let cy = 0; cy < L.gh; cy++) for (let cx = 0; cx < L.gw; cx++) if (L.solid(cx, cy)) { const X = cx * T, Y = cy * T; ctx.strokeStyle = 'rgba(10,25,30,.35)'; ctx.lineWidth = .5; ctx.strokeRect(X + .25, Y + .25, T - .5, T - .5); if (R(cx * 3, cy) < .08) { ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, X + 8, Y + 9, 6, '#73efd0', .35); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#c7ffed'; ctx.beginPath(); ctx.moveTo(X + 8, Y + 6); ctx.lineTo(X + 9.5, Y + 9); ctx.lineTo(X + 8, Y + 12); ctx.lineTo(X + 6.5, Y + 9); ctx.fill(); } }
      for (const r of L.tops) { ctx.fillStyle = '#70ac89'; ctx.fillRect(r.x0, r.y, r.x1 - r.x0, 1.6); ctx.fillStyle = 'rgba(112,172,137,.35)'; ctx.fillRect(r.x0, r.y + 1.6, r.x1 - r.x0, 2.5); }
      ctx.restore();
      // 3) adornos parados sobre la cara de arriba (atrás de Itzel)
      for (const o of L.deco) {
        const x = o.x + DX * .55, y = o.y + DY * .55;
        ctx.fillStyle = 'rgba(10,30,30,.35)'; ctx.beginPath(); ctx.ellipse(x + 2, y, 6, 1.6, 0, 0, TAU); ctx.fill();
        if (o.k === 'T') {
          const h = 26 + R(o.i, 1) * 14; ctx.fillStyle = '#2a5048'; ctx.fillRect(x - 1, y - h * .5, 2, h * .5);
          for (let k = 0; k < 3; k++) { const ry = y - h * .5 - k * h * .17, rr = (h * .3) * (1 - k * .2); ctx.fillStyle = k % 2 ? '#5f9e86' : '#6fb08e'; ctx.beginPath(); ctx.ellipse(x, ry, rr, rr * .75, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(199,255,237,.25)'; ctx.beginPath(); ctx.ellipse(x - rr * .3, ry - rr * .3, rr * .4, rr * .25, 0, 0, TAU); ctx.fill(); }
        } else if (o.k === 'f') {
          for (let k = 0; k < 3; k++) { const fx = x - 4 + k * 4, fy = y - 4 - (k % 2) * 2; ctx.strokeStyle = '#5f9e86'; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(fx, y); ctx.lineTo(fx, fy); ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, fx, fy, 4, ['#73efd0', '#ffc980', '#cba6ff'][(o.i + k) % 3], .5); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(fx, fy, .8, 0, TAU); ctx.fill(); }
        } else if (o.k === 'r') {
          ctx.fillStyle = '#3a6a6a'; ctx.fillRect(x - 2.5, y - 9, 5, 9); ctx.fillStyle = '#4e8878'; ctx.beginPath(); ctx.moveTo(x - 4, y - 9); ctx.lineTo(x, y - 13); ctx.lineTo(x + 4, y - 9); ctx.fill();
          ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y - 6, 7, LU.seed, .45); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#fff0c0'; ctx.fillRect(x - 1, y - 7.5, 2, 2.5);
        }
      }
    },
    player(ctx, p, f) { drawHero(ctx, p, f, { body: '#f3ecdf', skin: '#e0b48a', hair: '#1d3a40', leg: '#1d3a40', eye: '#1d3a40' }); },
    coin(ctx, x, y, t) {
      const yy = y + Math.sin(t * 2.4 + x) * 1.8;
      ctx.fillStyle = 'rgba(10,30,30,.3)'; ctx.beginPath(); ctx.ellipse(x + 3, y + 9, 3.5 - Math.sin(t * 2.4 + x), 1, 0, 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, yy, 11, LU.seed, .5); ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#ffe3a8'; ctx.beginPath(); ctx.ellipse(x, yy, 2.6, 3.6, .3, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff8e4'; ctx.beginPath(); ctx.ellipse(x - .8, yy - 1.2, .9, 1.4, .3, 0, TAU); ctx.fill();
    },
    goal(ctx, x, y, t, f) {
      // el árbol del oeste: se enciende al llegar
      const lit = f.g.win ? 1 : .35 + Math.sin(t * 2) * .1, bx = x + DX * .3, by = y + DY * .3;
      ctx.fillStyle = 'rgba(10,30,30,.35)'; ctx.beginPath(); ctx.ellipse(bx + 3, by, 14, 3, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#3a5a50'; ctx.beginPath(); ctx.moveTo(bx - 2.5, by); ctx.lineTo(bx - 1.5, by - 26); ctx.lineTo(bx + 1.5, by - 26); ctx.lineTo(bx + 2.5, by); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, bx, by - 36, 34, '#f9d58b', .35 * lit); ctx.globalCompositeOperation = 'source-over';
      for (let k = 0; k < 7; k++) { const a = k / 7 * TAU + t * .2, r = k ? 9 : 0; ctx.fillStyle = k % 2 ? '#8fd0a8' : '#6fb08e'; ctx.beginPath(); ctx.arc(bx + Math.cos(a) * r, by - 34 + Math.sin(a) * r * .7, 8, 0, TAU); ctx.fill(); }
      for (let k = 0; k < 5; k++) { const a = k * 1.3 + t * .6; ctx.fillStyle = `rgba(255,230,160,${.5 + lit * .5})`; ctx.beginPath(); ctx.arc(bx + Math.cos(a) * 10, by - 34 + Math.sin(a) * 7, 1.2, 0, TAU); ctx.fill(); }
    },
    over(ctx, f) {
      ctx.globalCompositeOperation = 'lighter';
      ambient(26, 31, (i, a, b, c) => { const x = wrap(a * VW * 1.4 - f.cam * (.5 + c * .5) + Math.sin(f.t * .6 + i) * 12, VW + 20) - 10, y = wrap(b * VH - f.t * (2 + c * 4), VH); glowDot(ctx, x, y, 3 + c * 2, '#9affee', .25 + c * .2); });
      ctx.globalCompositeOperation = 'source-over';
      vignette(ctx, .5, '#061418', .4);
    },
  });

  // ===================================================================
  //  PINTURA EN AMATE · "La muralla en llamas"
  // ===================================================================
  const AM = { papel: '#a87444', fibra: '#4a2c18', fibra2: '#b07a4a', K: '#1a0e08', rosa: '#e0306a', ama: '#ffd23a', tur: '#2ab8b0', verde: '#3a9a4a', nar: '#ff7a2a', azul: '#2a5ad8', blanco: '#fff4e0', rojo: '#c8282a', morado: '#8a3ab8' };
  const BASE_AM = 178, ESC_AM = 1.7; // la ciudad se para justo detrás del piso
  // pinta una forma con color plano y contorno negro, como en el amate
  function pinta(x, P, col, lw = 1) { x.beginPath(); P(x); x.fillStyle = col; x.fill(); x.lineWidth = lw; x.strokeStyle = AM.K; x.lineJoin = 'round'; x.stroke(); }
  function puntitos(x, cx, cy, r, n, col, rr = .55) { x.fillStyle = col; for (let i = 0; i < n; i++) { const a = i / n * TAU; x.beginPath(); x.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, rr, 0, TAU); x.fill(); } }
  function florAmate(x, cx, cy, s, col, centro) {
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; pinta(x, c => c.ellipse(cx + Math.cos(a) * 2.6 * s, cy + Math.sin(a) * 2.6 * s, 2 * s, 1.2 * s, a, 0, TAU), col, .6); }
    pinta(x, c => c.arc(cx, cy, 1.5 * s, 0, TAU), centro, .6); puntitos(x, cx, cy, 2.8 * s, 6, AM.blanco, .35 * s);
  }
  function pajaro(x, cx, cy, s, flap, c1, c2) {
    pinta(x, c => { c.moveTo(cx - 6 * s, cy); c.quadraticCurveTo(cx - 2 * s, cy - 4 * s, cx + 4 * s, cy - 2 * s); c.lineTo(cx + 7 * s, cy - 2.6 * s); c.lineTo(cx + 5 * s, cy - .6 * s); c.quadraticCurveTo(cx, cy + 3 * s, cx - 6 * s, cy); c.closePath(); }, c1, .7);
    pinta(x, c => { c.moveTo(cx - 1 * s, cy - 1.5 * s); c.quadraticCurveTo(cx - 3 * s, cy - (7 + flap * 3) * s, cx + 2 * s, cy - (8 + flap * 2) * s); c.quadraticCurveTo(cx + 2 * s, cy - 3 * s, cx + 1.5 * s, cy - 1.5 * s); c.closePath(); }, c2, .6);
    pinta(x, c => { c.moveTo(cx - 6 * s, cy); c.lineTo(cx - 10 * s, cy - 2 * s); c.lineTo(cx - 9.4 * s, cy + 1.4 * s); c.closePath(); }, c2, .6);
    x.fillStyle = AM.K; x.beginPath(); x.arc(cx + 4.2 * s, cy - 2.2 * s, .5 * s, 0, TAU); x.fill(); puntitos(x, cx - 1, cy, 1.4 * s, 4, AM.blanco, .35 * s);
  }
  function llama(x, cx, base, h, w, fr) {
    const tongue = (s, col) => pinta(x, c => { c.moveTo(cx - w * s, base); c.quadraticCurveTo(cx - w * s * 1.1, base - h * s * .5, cx - w * s * .3 + Math.sin(fr * 2.3) * 1.2, base - h * s * .7); c.quadraticCurveTo(cx - w * s * .1, base - h * s * .85, cx + Math.sin(fr * 1.7) * 1.5, base - h * s); c.quadraticCurveTo(cx + w * s * .6, base - h * s * .7, cx + w * s * .4, base - h * s * .45); c.quadraticCurveTo(cx + w * s * 1.1, base - h * s * .3, cx + w * s, base); c.closePath(); }, col, .7);
    tongue(1, AM.rojo); tongue(.68, AM.nar); tongue(.36, AM.ama);
  }
  defStyle({
    id: 'fuego', name: 'Pintura en amate', ref: 'Amate de Xalitla y San Pablito · arte popular mexicano', order: 43,
    desc: 'Pintado sobre papel amate: colores planos y alegres con contorno negro, puntitos de decoración y la fibra café de la corteza asomándose.',
    fx: { dust: ['#b07a4a', '#4a2c18'], spark: [AM.ama, AM.nar, AM.rosa], confetti: [AM.rosa, AM.ama, AM.tur, AM.verde, AM.nar] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'amate', x => {
        x.drawImage(paperTex(f, 'amate', AM.papel, { grain: 18, blot: 26, fibers: 30 }), 0, 0, VW, VH);
        // las tiras de corteza machacada se cruzan como una malla
        const r = rng(43); x.lineCap = 'round';
        for (let i = 0; i < 260; i++) { const horiz = r() < .5, a = r() * (horiz ? VH : VW), w = .3 + r() * .9; x.strokeStyle = r() < .55 ? 'rgba(60,34,18,.12)' : 'rgba(226,180,120,.14)'; x.lineWidth = w; x.beginPath(); if (horiz) { x.moveTo(-5, a); x.bezierCurveTo(VW * .3, a + (r() - .5) * 14, VW * .7, a + (r() - .5) * 14, VW + 5, a + (r() - .5) * 10); } else { x.moveTo(a, -5); x.bezierCurveTo(a + (r() - .5) * 14, VH * .3, a + (r() - .5) * 14, VH * .7, a + (r() - .5) * 10, VH + 5); } x.stroke(); }
      });
      // sol con cara
      const sol = cached(f, 'sol-amate', 80, 80, x => {
        for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; pinta(x, c => { c.moveTo(40 + Math.cos(a - .18) * 20, 40 + Math.sin(a - .18) * 20); c.lineTo(40 + Math.cos(a) * (i % 2 ? 31 : 36), 40 + Math.sin(a) * (i % 2 ? 31 : 36)); c.lineTo(40 + Math.cos(a + .18) * 20, 40 + Math.sin(a + .18) * 20); c.closePath(); }, i % 2 ? AM.nar : AM.rosa, .7); }
        pinta(x, c => c.arc(40, 40, 20, 0, TAU), AM.ama, 1); puntitos(x, 40, 40, 17, 18, AM.nar, .7);
        x.strokeStyle = AM.K; x.lineWidth = .9; x.lineCap = 'round';
        for (const d of [-1, 1]) { x.beginPath(); x.arc(40 + d * 6, 37, 3, Math.PI * .15, Math.PI * .85); x.stroke(); }
        x.beginPath(); x.arc(40, 44, 6, Math.PI * .2, Math.PI * .8); x.stroke(); x.fillStyle = AM.rosa; for (const d of [-1, 1]) { x.beginPath(); x.arc(40 + d * 10, 44, 2.2, 0, TAU); x.fill(); }
      });
      ctx.save(); ctx.translate(330 - f.cam * .015, 58); ctx.rotate(Math.sin(f.t * .3) * .08); ctx.drawImage(sol, -40, -40, 80, 80); ctx.restore();
      // pájaros
      for (let i = 0; i < (window.FAUNA_ARTE?.listo('aveAmate') ? 3 : 0); i++) { const x = wrap(i * 170 + 40 - f.t * (9 + i * 3) - f.cam * .1, VW + 80) - 40, y = 34 + i * 22 + Math.sin(f.t * 1.4 + i) * 4; FAUNA_ARTE.dib(ctx, 'aveAmate', f.t + i * .3, x, y, { w: 10 - i, ay: .5, fps: 6, seq: [0, 1, 3, 2, 3, 1], voltea: true }); }
      // mar pintado con los barcos piratas
      strip(ctx, f, 'mar-amate', .05, (x, w) => {
        pinta(x, c => { c.moveTo(0, VH); c.lineTo(0, 132); for (let xx = 0; xx <= w; xx += 10) c.quadraticCurveTo(xx + 5, 128, xx + 10, 132); c.lineTo(w, VH); c.closePath(); }, AM.tur, .9);
        x.strokeStyle = AM.blanco; x.lineWidth = .7; for (let y = 138; y < 178; y += 6) { x.beginPath(); for (let xx = (y % 12); xx < w; xx += 12) { x.moveTo(xx, y); x.quadraticCurveTo(xx + 3, y - 2.5, xx + 6, y); } x.stroke(); }
        for (let i = 0; i < w / 170; i++) {
          const sx = i * 170 + 60 + R(i, 2) * 60, sy = 132;
          pinta(x, c => { c.moveTo(sx - 18, sy - 7); c.lineTo(sx + 20, sy - 7); c.lineTo(sx + 14, sy + 1); c.lineTo(sx - 13, sy + 1); c.closePath(); }, '#3a2010', .8);
          x.fillStyle = AM.ama; for (let k = -12; k < 14; k += 5) { x.beginPath(); x.arc(sx + k, sy - 3.5, .8, 0, TAU); x.fill(); }
          x.strokeStyle = AM.K; x.lineWidth = 1; x.beginPath(); x.moveTo(sx, sy - 7); x.lineTo(sx, sy - 36); x.moveTo(sx + 11, sy - 7); x.lineTo(sx + 11, sy - 26); x.stroke();
          pinta(x, c => { c.moveTo(sx + 1, sy - 34); c.quadraticCurveTo(sx + 11, sy - 24, sx + 1, sy - 12); c.closePath(); }, AM.blanco, .7);
          pinta(x, c => { c.moveTo(sx + 12, sy - 24); c.quadraticCurveTo(sx + 19, sy - 17, sx + 12, sy - 10); c.closePath(); }, AM.rojo, .7);
          pinta(x, c => { c.moveTo(sx, sy - 36); c.lineTo(sx - 7, sy - 34); c.lineTo(sx, sy - 32); c.closePath(); }, AM.K, .4);
        }
      });
      // la ciudad amurallada, casa por casa
      strip(ctx, f, 'ciudad-amate', .18, (x, w) => {
        const base = BASE_AM, sc = ESC_AM, cols = [AM.rosa, AM.ama, AM.tur, AM.verde, AM.nar, AM.azul, AM.blanco];
        pinta(x, c => CAMP.skyline(c, 0, w, base, 'mid', 5, sc), '#c8906a', .9);
        for (const fa of CAMP.facades(0, w, 5)) {
          const top = base - (4 + fa.h) * sc, col = cols[fa.col % cols.length];
          pinta(x, c => c.rect(fa.x0 + .6, top + 2, fa.w - 1.2, base - top), col, .8);
          const n = Math.max(1, Math.floor(fa.w / 7)), gp = fa.w / n;
          for (let i = 0; i < n; i++) { const wx = fa.x0 + gp * (i + .5); pinta(x, c => { c.moveTo(wx - 1.6, top + 13); c.lineTo(wx - 1.6, top + 8); c.arc(wx, top + 8, 1.6, Math.PI, 0); c.lineTo(wx + 1.6, top + 13); c.closePath(); }, AM.K, .4); }
          x.fillStyle = col === AM.blanco ? AM.rosa : AM.blanco; for (let k = fa.x0 + 2; k < fa.x0 + fa.w - 1; k += 3) { x.beginPath(); x.arc(k, top + 4, .55, 0, TAU); x.fill(); }
          if (fa.doors) pinta(x, c => { const dx = fa.x0 + fa.w / 2; c.moveTo(dx - 2.4, base); c.lineTo(dx - 2.4, base - 7); c.arc(dx, base - 7, 2.4, Math.PI, 0); c.lineTo(dx + 2.4, base); c.closePath(); }, '#6a3a1a', .5);
        }
      });
      // llamas y humo sobre los techos (cuadros pintados que se alternan)
      const fr = Math.floor(f.t * 6), off = f.cam * .18;
      for (let wx = Math.floor((off - 20) / 28) * 28; wx < off + VW + 20; wx += 28) {
        if (R(wx, 5) < .45) continue;
        const sx = wx - off + R(wx, 6) * 12, top = BASE_AM - CAMP.h(wx + R(wx, 6) * 12, 'mid', 5) * ESC_AM, hh = 14 + R(wx, 7) * 12;
        ctx.strokeStyle = 'rgba(40,24,14,.7)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath(); for (let k = 0; k < 14; k++) { const u = k / 13, a = u * 9 + f.t * .8; ctx.lineTo(sx + Math.cos(a) * (2 + u * 5) + u * 8, top - hh - u * 34 - wrap(f.t * 5, 6)); } ctx.stroke();
        ctx.strokeStyle = 'rgba(220,200,180,.5)'; ctx.lineWidth = .6; ctx.stroke();
        llama(ctx, sx, top + 1, hh, 6.5, fr + wx);
      }
      // plantas de primer plano
      strip(ctx, f, 'plantas-amate', .4, (x, w) => {
        for (let xx = 10; xx < w; xx += 46 + R(xx, 3) * 30) {
          const b0 = 192, h = 26 + R(xx, 4) * 26; x.strokeStyle = AM.K; x.lineWidth = 2.2; x.beginPath(); x.moveTo(xx, b0); x.quadraticCurveTo(xx + 6, b0 - h * .5, xx + 2, b0 - h); x.stroke(); x.strokeStyle = AM.verde; x.lineWidth = 1.2; x.stroke();
          for (let k = 0; k < 3; k++) { const ly = b0 - h * (.3 + k * .2), d = k % 2 ? 1 : -1; pinta(x, c => { c.moveTo(xx + 3, ly); c.quadraticCurveTo(xx + 3 + d * 9, ly - 6, xx + 3 + d * 14, ly - 1); c.quadraticCurveTo(xx + 3 + d * 7, ly + 3, xx + 3, ly); c.closePath(); }, k % 2 ? AM.verde : '#5ab84a', .7); }
          florAmate(x, xx + 2, b0 - h, 1.5, [AM.rosa, AM.ama, AM.morado, AM.nar][(xx / 10 | 0) % 4], AM.ama);
        }
      });
    },
    terrain(ctx) {
      const loops = organicLoops({ step: 4, amp: .6, freq: .4, seed: 43 });
      const P = x => { for (const l of loops) pathRound(x, l, 2); };
      pinta(ctx, P, '#a83a2a', 1.3);
      ctx.save(); ctx.beginPath(); P(ctx); ctx.clip();
      for (const r of L.tops) {
        // cenefa: zigzag amarillo y fila de puntos
        ctx.strokeStyle = AM.ama; ctx.lineWidth = 1; ctx.beginPath(); for (let x = r.x0, k = 0; x <= r.x1; x += 4, k++) ctx.lineTo(x, r.y + 9 + (k % 2 ? 2.5 : -2.5)); ctx.stroke();
        ctx.fillStyle = AM.blanco; for (let x = r.x0 + 2; x < r.x1; x += 4) { ctx.beginPath(); ctx.arc(x, r.y + 15, .7, 0, TAU); ctx.fill(); }
        // banda turquesa con rombos, y abajo el campo oscuro con flores y pájaros, como un amate
        ctx.fillStyle = AM.K; ctx.fillRect(r.x0, r.y + 18, r.x1 - r.x0, 13); ctx.fillStyle = AM.tur; ctx.fillRect(r.x0, r.y + 19, r.x1 - r.x0, 11);
        for (let x = r.x0 + 6, k = 0; x < r.x1; x += 12, k++) { ctx.fillStyle = k % 2 ? AM.ama : AM.rosa; ctx.beginPath(); ctx.moveTo(x, r.y + 20.5); ctx.lineTo(x + 4, r.y + 24.5); ctx.lineTo(x, r.y + 28.5); ctx.lineTo(x - 4, r.y + 24.5); ctx.closePath(); ctx.fill(); ctx.fillStyle = AM.K; ctx.beginPath(); ctx.arc(x, r.y + 24.5, .8, 0, TAU); ctx.fill(); }
        ctx.fillStyle = '#4a1a16'; ctx.fillRect(r.x0, r.y + 31, r.x1 - r.x0, 240);
        ctx.fillStyle = AM.K; ctx.fillRect(r.x0, r.y + 30, r.x1 - r.x0, 1);
        for (let x = r.x0 + 10, k = 0; x < r.x1 - 4; x += 22, k++) { const fy = r.y + 44 + (k % 2) * 12; florAmate(ctx, x, fy, 1.1, [AM.ama, AM.tur, AM.rosa, AM.nar][k % 4], AM.ama); if (k % 3 === 1) pajaro(ctx, x + 11, fy + 9, .7, 0, AM.tur, AM.ama); }
      }
      ctx.restore();
      // pasto pintado: hojitas sobre la orilla
      for (const r of L.tops) for (let x = r.x0 + 2; x < r.x1 - 1; x += 4) { const d = (x / 4 | 0) % 2 ? 1 : -1; pinta(ctx, c => { c.moveTo(x, r.y + 1); c.quadraticCurveTo(x + d * 2.5, r.y - 3, x + d * 1, r.y - 6); c.quadraticCurveTo(x - d * .5, r.y - 3, x, r.y + 1); c.closePath(); }, d > 0 ? AM.verde : '#5ab84a', .5); }
      for (const o of L.deco) {
        const x = o.x, y = o.y;
        if (o.k === 'T') {
          const h = 40 + R(o.i, 1) * 12;
          pinta(ctx, c => { c.moveTo(x - 3, y); c.lineTo(x - 1.6, y - h * .55); c.lineTo(x + 1.6, y - h * .55); c.lineTo(x + 3, y); c.closePath(); }, '#6a3a1a', .9);
          pinta(ctx, c => { c.arc(x, y - h * .75, h * .32, 0, TAU); }, AM.verde, 1);
          for (let k = 0; k < 7; k++) { const a = k * 2.3 + o.i, rr = h * .2; florAmate(ctx, x + Math.cos(a) * rr, y - h * .75 + Math.sin(a) * rr * .8, .55, [AM.rosa, AM.ama, AM.blanco][k % 3], AM.nar); }
          pajaro(ctx, x + 3, y - h * 1.02, .7, 0, AM.tur, AM.ama);
        } else if (o.k === 'f') { for (let k = 0; k < 3; k++) { const fx = x - 6 + k * 6, fy = y - 6 - (k % 2) * 3; ctx.strokeStyle = AM.K; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(fx, y); ctx.lineTo(fx, fy); ctx.stroke(); ctx.strokeStyle = AM.verde; ctx.lineWidth = .5; ctx.stroke(); florAmate(ctx, fx, fy, .8, [AM.rosa, AM.morado, AM.nar][(o.i + k) % 3], AM.ama); } }
        else if (o.k === 'r') { pinta(ctx, c => { c.moveTo(x - 3, y - 15); c.lineTo(x + 3, y - 15); c.quadraticCurveTo(x + 2, y - 11, x + 6.5, y - 7); c.quadraticCurveTo(x + 8, y - 1, x + 3.5, y); c.lineTo(x - 3.5, y); c.quadraticCurveTo(x - 8, y - 1, x - 6.5, y - 7); c.quadraticCurveTo(x - 2, y - 11, x - 3, y - 15); c.closePath(); }, AM.tur, .9); ctx.fillStyle = AM.ama; for (let k = -5; k <= 5; k += 2.5) { ctx.beginPath(); ctx.arc(x + k, y - 6, .8, 0, TAU); ctx.fill(); } ctx.strokeStyle = AM.rosa; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(x - 6.5, y - 3); ctx.lineTo(x + 6.5, y - 3); ctx.stroke(); }
      }
    },
    player(ctx, p, f) { drawHero(ctx, p, f, { lw: .9, line: AM.K, body: AM.rosa, skin: '#c87a4a', hair: AM.K, leg: AM.tur, eye: AM.K }); },
    coin(ctx, x, y, t) {
      const s = Math.cos(t * 2.6 + x * .05), yy = y + Math.sin(t * 2.5 + x) * 1.6;
      ctx.save(); ctx.translate(x, yy); ctx.scale(Math.max(.2, Math.abs(s)), 1);
      pinta(ctx, c => c.ellipse(0, 0, 3.8, 5.4, 0, 0, TAU), AM.nar, .8);
      ctx.strokeStyle = AM.K; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(0, -4.6); ctx.quadraticCurveTo(1.6, 0, 0, 4.6); ctx.stroke();
      ctx.fillStyle = AM.ama; for (let k = -3; k <= 3; k += 2) { ctx.beginPath(); ctx.arc(-1.6, k, .55, 0, TAU); ctx.fill(); }
      ctx.restore();
    },
    goal(ctx, x, y, t) {
      pinta(ctx, c => c.rect(x - 1.2, y - 48, 2.4, 48), '#6a3a1a', .7);
      pinta(ctx, c => { c.moveTo(x + 1, y - 47); for (let i = 0; i <= 8; i++) c.lineTo(x + 1 + i * 2.5, y - 47 + i * .5 + Math.sin(t * 5 - i * .7) * i * .25); for (let i = 8; i >= 0; i--) c.lineTo(x + 1 + i * 2.5, y - 33 - i * .5 + Math.sin(t * 5 - i * .7) * i * .25); c.closePath(); }, AM.rosa, .8);
      florAmate(ctx, x + 10, y - 40, .8, AM.ama, AM.tur);
      pinta(ctx, c => c.arc(x, y - 49, 2.4, 0, TAU), AM.ama, .6);
    },
    over(ctx, f) {
      ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .35; ctx.drawImage(paperTex(f, 'amate-grano', '#d8b088', { grain: 24, blot: 8, fibers: 26 }), 0, 0, VW, VH); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      vignette(ctx, .4, '#2a1408', .45);
    },
  });

  // ===================================================================
  //  CIANOTIPIA · "El fondo del Golfo"
  // ===================================================================
  const CY = ['#0b2a52', '#123f75', '#1f5a96', '#5f8fc0', '#a9c7e3', '#eef5fb'];
  // alga ramificada como las de Anna Atkins
  function alga(x, x0, y0, len, ang, depth, seed, w) {
    const r = rng(seed); const go = (px, py, l, a, d) => {
      if (d <= 0 || l < 2) return;
      const nx = px + Math.cos(a) * l, ny = py + Math.sin(a) * l, mx = (px + nx) / 2 + Math.sin(a) * l * .15, my = (py + ny) / 2 - Math.cos(a) * l * .15;
      x.lineWidth = Math.max(.25, w * d / depth); x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(mx, my, nx, ny); x.stroke();
      if (d === 1) { x.beginPath(); x.ellipse(nx, ny, 1.4, .7, a, 0, TAU); x.fill(); }
      const br = 2 + (r() < .4 ? 1 : 0); for (let i = 0; i < br; i++) go(nx, ny, l * (.62 + r() * .18), a + (i - (br - 1) / 2) * (.5 + r() * .3), d - 1);
    };
    go(x0, y0, len, ang, depth);
  }
  const SURF = 32;                                          // la superficie del agua (fila 2)
  defStyle({
    id: 'agua', name: 'Cianotipia', ref: 'Anna Atkins (1843) · fotogramas de algas · copias al ferroprusiato', order: 44,
    desc: 'Como las copias de sol del siglo XIX: lo que tapó la luz queda blanco sobre azul de Prusia, con orillas de emulsión hechas a brocha.',
    fx: { dust: ['#eef5fb', '#a9c7e3'], spark: ['#ffffff', '#cfe3f6'], confetti: ['#ffffff', '#cfe3f6', '#a9c7e3', '#5f8fc0'] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'emulsion', x => {
        const g = x.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#2f6fab'); g.addColorStop(.25, CY[2]); g.addColorStop(1, CY[0]); x.fillStyle = g; x.fillRect(0, 0, VW, VH);
        x.globalAlpha = .5; x.globalCompositeOperation = 'overlay'; x.drawImage(paperTex(f, 'ciano-papel', '#6a8fb8', { grain: 30, blot: 26, fibers: 18 }), 0, 0, VW, VH);
        x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
        // arriba del agua: el cielo casi blanco (luz que no se expuso)
        const s = x.createLinearGradient(0, 0, 0, SURF); s.addColorStop(0, 'rgba(238,245,251,.5)'); s.addColorStop(1, 'rgba(238,245,251,.15)'); x.fillStyle = s; x.fillRect(0, 0, VW, SURF);
      });
      // rayos de luz que se mecen
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 6; i++) { const x0 = wrap(i * 90 - f.cam * .1 + Math.sin(f.t * .4 + i) * 16, VW + 120) - 60, w = 14 + R(i, 3) * 20; ctx.fillStyle = `rgba(200,225,250,${.05 + R(i, 4) * .04})`; ctx.beginPath(); ctx.moveTo(x0, SURF); ctx.lineTo(x0 + w, SURF); ctx.lineTo(x0 + w + 70, VH); ctx.lineTo(x0 + 40, VH); ctx.closePath(); ctx.fill(); }
      ctx.restore();
      // el muelle de Campeche visto desde abajo y el casco de un galeón hundido
      strip(ctx, f, 'muelle', .12, (x, w) => {
        x.strokeStyle = 'rgba(169,199,227,.35)'; x.fillStyle = 'rgba(169,199,227,.35)';
        for (let i = 0; i < w; i += 46) { x.fillRect(i + 10, 0, 3.2, 150 + R(i, 1) * 30); x.lineWidth = .8; x.beginPath(); x.moveTo(i + 11, 40); x.lineTo(i + 57, 110); x.stroke(); }
        x.fillRect(0, SURF - 6, w, 5);
        for (let i = 0; i < w / 420; i++) {
          const sx = i * 420 + 200 + R(i, 4) * 120, sy = 196; x.save(); x.translate(sx, sy); x.rotate(-.12);
          x.fillStyle = 'rgba(169,199,227,.28)'; x.beginPath(); x.moveTo(-60, -14); x.quadraticCurveTo(-30, 12, 40, 6); x.lineTo(62, -18); x.lineTo(50, -22); x.quadraticCurveTo(0, -8, -55, -22); x.closePath(); x.fill();
          x.fillRect(-12, -70, 2.4, 56); x.fillRect(18, -52, 2, 40); x.strokeStyle = 'rgba(169,199,227,.28)'; x.lineWidth = .6; for (let k = 0; k < 6; k++) { x.beginPath(); x.moveTo(-11, -68 + k * 4); x.lineTo(30 + k * 3, -16); x.stroke(); }
          x.restore();
        }
      });
      strip(ctx, f, 'algas-lejos', .22, (x, w) => {
        x.strokeStyle = 'rgba(169,199,227,.45)'; x.fillStyle = 'rgba(169,199,227,.45)';
        for (let i = 0; i < w / 34; i++) alga(x, i * 34 + R(i, 7) * 20, VH + 4, 26 + R(i, 8) * 20, -Math.PI / 2 + (R(i, 9) - .5) * .5, 6, i * 31 + 3, 1.6);
      });
      // cardumen de peces (siluetas claras)
      ctx.fillStyle = 'rgba(220,235,250,.45)';
      for (let i = 0; i < 14; i++) { const x = wrap(R(i, 11) * 600 + f.t * (10 + R(i, 12) * 6) - f.cam * .3, VW + 60) - 30, y = 70 + R(i, 13) * 70 + Math.sin(f.t * 1.4 + i) * 4; ctx.beginPath(); ctx.ellipse(x, y, 3.4, 1.3, 0, 0, TAU); ctx.moveTo(x - 3, y); ctx.lineTo(x - 6, y - 1.6); ctx.lineTo(x - 6, y + 1.6); ctx.fill(); }
      // la superficie del agua
      ctx.strokeStyle = 'rgba(238,245,251,.85)'; ctx.lineWidth = 1; ctx.beginPath(); for (let x = 0; x <= VW; x += 4) ctx.lineTo(x, SURF + Math.sin(x * .08 + f.t * 2 + f.cam * .08) * 1.2); ctx.stroke();
      ctx.strokeStyle = 'rgba(238,245,251,.3)'; ctx.beginPath(); for (let x = 0; x <= VW; x += 4) ctx.lineTo(x, SURF + 4 + Math.sin(x * .05 - f.t * 1.5 + f.cam * .08) * 1.4); ctx.stroke();
    },
    terrain(ctx, f) {
      const loops = organicLoops({ step: 4, amp: 1.1, freq: .3, seed: 44 });
      const P = x => { for (const l of loops) pathRound(x, l, 2); };
      ctx.beginPath(); P(ctx); const g = ctx.createLinearGradient(0, 130, 0, VH); g.addColorStop(0, '#8fb3d6'); g.addColorStop(1, '#4f7fb0'); ctx.fillStyle = g; ctx.fill();
      ctx.save(); ctx.clip();
      // capas de sedimento como fibras de papel
      ctx.strokeStyle = 'rgba(238,245,251,.22)'; ctx.lineWidth = .4;
      for (let y = 120; y < VH + 10; y += 3.2) { ctx.beginPath(); for (let x = 0; x <= L.ww; x += 8) ctx.lineTo(x, y + Math.sin(x * .03 + y) * 1.4 + fbm1(x * .02, y | 0, 2) * 2); ctx.stroke(); }
      const r0 = rng(44); ctx.fillStyle = 'rgba(11,42,82,.35)'; for (let i = 0; i < L.ww * .25; i++) { ctx.beginPath(); ctx.arc(r0() * L.ww, 110 + r0() * 140, .4 + r0() * .9, 0, TAU); ctx.fill(); }
      // emulsión dada a brocha: franjas desparejas de azul más hondo
      const rb = rng(45);
      for (let i = 0; i < L.ww / 14; i++) {
        const bx = rb() * L.ww, by = 30 + rb() * 205, bw = 30 + rb() * 70, bh = 4 + rb() * 9;
        ctx.fillStyle = `rgba(40,92,150,${.1 + rb() * .14})`; ctx.beginPath();
        for (let k = 0; k <= 12; k++) ctx.lineTo(bx + bw * k / 12, by + (rb() - .5) * 2);
        for (let k = 12; k >= 0; k--) ctx.lineTo(bx + bw * k / 12 + (rb() - .5) * 3, by + bh + (rb() - .5) * 2.4);
        ctx.fill();
      }
      // especímenes prensados: sombra azul honda donde estuvieron sobre el papel
      const rs = rng(46), esp = 'rgba(22,62,118,.5)';
      for (let i = 0; i < L.ww / 12; i++) {
        const sx = rs() * L.ww, sy = 30 + rs() * 205, k = (rs() * 5) | 0, a0 = rs() * TAU, sc = 1 + rs() * .7;
        if (L.depth(sx, sy) < 9) continue;
        ctx.save(); ctx.translate(sx, sy); ctx.rotate(a0); ctx.scale(sc, sc); ctx.fillStyle = esp; ctx.strokeStyle = esp; ctx.lineCap = 'round';
        if (k === 0) { // helecho
          ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(0, 8); ctx.quadraticCurveTo(1.5, 0, 0, -9); ctx.stroke();
          for (let j = 0; j < 8; j++) { const yy = 6 - j * 2, l = 4.5 - j * .45; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * l * .55, yy - .6, l * .55, .9, s * -.5, 0, TAU); ctx.fill(); } }
        } else if (k === 1) { // caracol
          ctx.lineWidth = .9; ctx.beginPath(); for (let j = 0; j <= 40; j++) { const t = j / 40 * TAU * 2.2, rr = .6 + t * .75; ctx.lineTo(Math.cos(t) * rr, Math.sin(t) * rr); } ctx.stroke();
        } else if (k === 2) { // estrella de mar
          ctx.beginPath(); for (let j = 0; j < 10; j++) { const t = j / 10 * TAU, rr = j % 2 ? 1.6 : 5.5; ctx.lineTo(Math.cos(t) * rr, Math.sin(t) * rr); } ctx.closePath(); ctx.fill();
        } else if (k === 3) { // coral
          const rama = (x, y, a, l, n) => { const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; ctx.lineWidth = n * .4 + .3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke(); if (n > 0) { rama(x2, y2, a - .5, l * .72, n - 1); rama(x2, y2, a + .45, l * .7, n - 1); } };
          rama(0, 7, -Math.PI / 2, 5, 3);
        } else { // galleta de mar
          ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, TAU); ctx.fill();
          ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,.6)'; for (let j = 0; j < 5; j++) { const t = j / 5 * TAU; ctx.beginPath(); ctx.ellipse(Math.cos(t) * 2.2, Math.sin(t) * 2.2, 1.5, .45, t, 0, TAU); ctx.fill(); }
        }
        ctx.restore();
      }
      // halo de exposición: la orilla quedó más clara, como luz que se coló bajo el papel
      ctx.lineJoin = 'round'; for (const [lw, a] of [[7, .1], [4, .14], [2, .2]]) { ctx.beginPath(); P(ctx); ctx.strokeStyle = `rgba(238,245,251,${a})`; ctx.lineWidth = lw; ctx.stroke(); }
      ctx.restore();
      ctx.beginPath(); P(ctx); ctx.strokeStyle = 'rgba(238,245,251,.9)'; ctx.lineWidth = .9; ctx.stroke();
      // pastos marinos blancos sobre la orilla
      ctx.strokeStyle = '#eef5fb'; ctx.lineCap = 'round';
      tops((a, b, y) => { for (let x = a + 2; x < b - 1; x += 2.2 + R(x | 0, 4) * 2) { const h = 3 + R(x | 0, 5) * 6; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(x, y + .5); ctx.quadraticCurveTo(x + 1.5, y - h * .5, x + (R(x | 0, 6) - .5) * 4, y - h); ctx.stroke(); } });
      ctx.fillStyle = '#eef5fb';
      for (const o of L.deco) {
        const x = o.x, y = o.y;
        if (o.k === 'T') { ctx.strokeStyle = '#eef5fb'; alga(ctx, x, y + 1, 12 + R(o.i, 1) * 6, -Math.PI / 2, 5, o.i * 7 + 1, 1.3); }
        else if (o.k === 'f') { ctx.strokeStyle = 'rgba(238,245,251,.9)'; ctx.lineWidth = .4; for (let k = 0; k < 11; k++) { const a = -Math.PI / 2 + (k / 10 - .5) * 2.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * 4, y + Math.sin(a) * 6, x + Math.cos(a) * 9, y + Math.sin(a) * 9); ctx.stroke(); } }
        else if (o.k === 'r') { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - Math.PI / 2, rr = i % 2 ? 1.8 : 5; ctx.lineTo(x + Math.cos(a) * rr, y - 4.6 + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
      }
    },
    player(ctx, p, f) { drawHero(ctx, p, f, { body: '#eef5fb', skin: '#eef5fb', hair: '#eef5fb', leg: '#eef5fb', eye: CY[1] }); },
    coin(ctx, x, y, t) {
      const s = Math.cos(t * 2.2 + x * .05), yy = y + Math.sin(t * 2 + x) * 2;
      ctx.save(); ctx.translate(x, yy); ctx.scale(Math.max(.2, Math.abs(s)), 1);
      ctx.fillStyle = '#eef5fb'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(31,90,150,.55)'; for (let i = 0; i < 5; i++) { const a = i / 5 * TAU - Math.PI / 2; ctx.beginPath(); ctx.ellipse(Math.cos(a) * 2.3, Math.sin(a) * 2.3, 1.6, .55, a, 0, TAU); ctx.fill(); }
      ctx.restore();
    },
    goal(ctx, x, y, t) {
      // ancla con su cabo hasta una boya en la superficie
      ctx.strokeStyle = 'rgba(238,245,251,.7)'; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(x, y - 30); ctx.quadraticCurveTo(x + 8 + Math.sin(t) * 3, (y + SURF) / 2, x + 4, SURF); ctx.stroke();
      ctx.fillStyle = '#eef5fb'; ctx.beginPath(); ctx.arc(x + 4, SURF - 1 + Math.sin(t * 2) * 1, 4, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#eef5fb'; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y - 30); ctx.lineTo(x, y - 3); ctx.moveTo(x - 7, y - 24); ctx.lineTo(x + 7, y - 24); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y - 9, 9, .15, Math.PI - .15); ctx.stroke(); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y - 32, 2.6, 0, TAU); ctx.stroke();
    },
    over(ctx, f) {
      // burbujas que suben
      ctx.strokeStyle = 'rgba(238,245,251,.7)'; ctx.lineWidth = .45;
      ambient(22, 17, (i, a, b, c) => { const x = wrap(a * VW * 1.3 - f.cam * (.6 + c * .3) + Math.sin(f.t * 2 + i) * 3, VW + 20) - 10, y = SURF + 4 + wrap(b * VH - f.t * (14 + c * 16), VH - SURF); ctx.beginPath(); ctx.arc(x, y, .6 + c * 1.4, 0, TAU); ctx.stroke(); });
      // orillas de emulsión a brocha
      screenLayer(ctx, f, 'brocha', x => {
        const r = rng(23);
        for (let i = 0; i < 90; i++) { const side = i % 4, k = r(); x.fillStyle = r() < .6 ? `rgba(6,22,46,${.25 + r() * .3})` : `rgba(238,245,251,${.08 + r() * .12})`; x.beginPath(); if (side === 0) x.ellipse(k * VW, -2 + r() * 4, 10 + r() * 30, 2 + r() * 4, (r() - .5) * .2, 0, TAU); else if (side === 1) x.ellipse(k * VW, VH + 2 - r() * 4, 10 + r() * 30, 2 + r() * 4, (r() - .5) * .2, 0, TAU); else if (side === 2) x.ellipse(-2 + r() * 4, k * VH, 2 + r() * 4, 10 + r() * 24, 0, 0, TAU); else x.ellipse(VW + 2 - r() * 4, k * VH, 2 + r() * 4, 10 + r() * 24, 0, 0, TAU); x.fill(); }
      });
      vignette(ctx, .45, CY[0], .45);
    },
  });

  // ===================================================================
  //  ORIGAMI · "El día que nevó en Campeche"
  // ===================================================================
  const OR = { paper: '#f7f6f2', shade: '#dde3ec', ice: '#bcd7ea', ice2: '#8fb8d6', lilac: '#cfc8e8', crease: 'rgba(90,100,130,.18)' };
  function tri(x, a, b, c, col) { x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.lineTo(c[0], c[1]); x.closePath(); x.fillStyle = col; x.fill(); x.strokeStyle = col; x.lineWidth = .35; x.stroke(); }
  function crease(x, a, b, valley) { x.save(); x.strokeStyle = OR.crease; x.lineWidth = .35; if (valley) x.setLineDash([1.6, 1.2]); x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke(); x.restore(); }
  function foldedRidge(x, w, base, kind, seed, sc, light, dark, step) {
    const pts = []; for (let xx = -step; xx <= w + step; xx += step) pts.push([xx, base - CAMP.h(xx, kind, seed) * sc]);
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], m = [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + 18];
      const up = b[1] < a[1]; tri(x, a, b, m, up ? light : dark); tri(x, a, m, [a[0], VH + 6], mix(dark, light, .4)); tri(x, b, [b[0], VH + 6], m, dark); crease(x, a, m, true); crease(x, b, m, false);
    }
  }
  defStyle({
    id: 'hielo', name: 'Origami', ref: 'Akira Yoshizawa · Paper Mario: The Origami King · papel kami', order: 45,
    desc: 'Un Campeche nevado hecho de papel doblado: cada cara plana tiene su luz, se ven los dobleces de valle y de monte, y caen copos recortados.',
    fx: { dust: ['#ffffff', '#dde3ec'], spark: ['#ffffff', '#bcd7ea', '#ffd1dc'], confetti: ['#d9443a', '#f2b233', '#ffffff', '#8fb8d6', '#cfc8e8'] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'cielo', x => {
        const g = x.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#8fbce4'); g.addColorStop(.55, '#c8e0f2'); g.addColorStop(.8, '#f6e6d4'); g.addColorStop(1, '#fcecd8'); x.fillStyle = g; x.fillRect(0, 0, VW, VH);
        x.globalCompositeOperation = 'multiply'; x.globalAlpha = .5; x.drawImage(paperTex(f, 'kami', '#f7f5f0', { grain: 10, blot: 6, fibers: 14 }), 0, 0, VW, VH); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
        // pliegues del papel que estuvo doblado
        for (const [x0, y0, x1, y1] of [[-20, 40, 460, -60], [60, 260, 300, -40], [200, 260, 470, 60], [-30, 140, 440, 170]]) { x.strokeStyle = 'rgba(120,130,160,.12)'; x.lineWidth = .7; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke(); x.strokeStyle = 'rgba(255,255,255,.7)'; x.beginPath(); x.moveTo(x0 + .8, y0 + .8); x.lineTo(x1 + .8, y1 + .8); x.stroke(); }
        // sol pálido de papel
        x.fillStyle = '#fbe7c6'; x.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, r = i % 2 ? 15 : 19; x.lineTo(320 + Math.cos(a) * r, 56 + Math.sin(a) * r); } x.fill(); x.fillStyle = '#f8d9a8'; x.beginPath(); x.arc(320, 56, 11, 0, TAU); x.fill();
      });
      strip(ctx, f, 'lomas', .07, (x, w) => foldedRidge(x, w, 170, 'far', 2, 1.5, '#ffffff', '#a8c4e0', 26));
      strip(ctx, f, 'ciudad', .2, (x, w) => {
        const base = 178, sc = 1.6;
        x.save(); x.shadowColor = 'rgba(80,90,120,.25)'; x.shadowBlur = 3 * f.S; x.shadowOffsetX = 1.5 * f.S; x.shadowOffsetY = 1 * f.S;
        x.beginPath(); CAMP.skyline(x, 0, w, base, 'mid', 5, sc); x.fillStyle = '#e8e2d8'; x.fill(); x.restore();
        for (const fa of CAMP.facades(0, w, 5)) {
          const top = base - (4 + fa.h) * sc, col = mix(CAMP.FACHADAS[fa.col], '#f4f1ea', .08);
          x.fillStyle = col; x.fillRect(fa.x0 + .5, top + 2, fa.w - 1, base - top);
          tri(x, [fa.x0 + .5, top + 2], [fa.x0 + fa.w / 2, top + 6], [fa.x0 + .5, base], mix(col, '#ffffff', .15));
          crease(x, [fa.x0 + fa.w / 2, top + 6], [fa.x0 + fa.w / 2, base], true);
          // nieve doblada en zigzag sobre el pretil
          x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(fa.x0 - .5, top + 2.5); for (let k = 0; k <= 6; k++) x.lineTo(fa.x0 + fa.w * k / 6, top + (k % 2 ? 4.5 : 0)); x.lineTo(fa.x0 + fa.w + .5, top + 2.5); x.closePath(); x.fill();
          const n = Math.max(1, Math.floor(fa.w / 7)), gp = fa.w / n;
          for (let i = 0; i < n; i++) { const wx = fa.x0 + gp * (i + .5); x.fillStyle = '#5a6a8a'; x.fillRect(wx - 1.4, top + 9, 2.8, 4.5); x.fillStyle = '#ffffff'; x.fillRect(wx - 1.8, top + 8.4, 3.6, .8); }
        }
      });
      strip(ctx, f, 'palmas', .4, (x, w) => {
        for (const q of CAMP.props(0, w, 'near', 13)) {
          if (q.k !== 'palma') continue;
          const b = 186, h = q.h * .85, tx = q.x + q.lean * h, ty = b - h;
          for (let k = 0; k < 7; k++) { const y0 = b - k * h / 7, y1 = b - (k + 1) * h / 7, x0 = q.x + q.lean * (b - y0), x1 = q.x + q.lean * (b - y1); tri(x, [x0 - 2, y0], [x0 + 2, y0], [x1, y1 + 1], k % 2 ? '#b98a6a' : '#a87a5c'); }
          for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i / 6 - .5) * 3.4, l = h * .4, ex = tx + Math.cos(a) * l, ey = ty + Math.sin(a) * l * .5 + l * .3; tri(x, [tx, ty], [ex, ey], [(tx + ex) / 2 + Math.sin(a) * 3, (ty + ey) / 2 - 3], '#6aa58a'); tri(x, [tx, ty], [ex, ey], [(tx + ex) / 2 - Math.sin(a) * 2, (ty + ey) / 2 + 2], '#4f8a72'); if (i % 2) tri(x, [(tx + ex) / 2 - 2, (ty + ey) / 2 - 2], [(tx + ex) / 2 + 3, (ty + ey) / 2 - 1], [(tx + ex) / 2, (ty + ey) / 2 - 3.5], '#ffffff'); }
        }
      });
    },
    terrain(ctx, f) {
      ctx.save(); ctx.shadowColor = 'rgba(70,80,110,.3)'; ctx.shadowBlur = 4 * f.S; ctx.shadowOffsetX = 2 * f.S; ctx.shadowOffsetY = 2 * f.S;
      allLoopsPath(ctx, L.loops); ctx.fillStyle = '#7fa8d0'; ctx.fill(); ctx.restore();
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip();
      // plisado: triángulos alternos como papel acordeón
      for (let y = 96; y < VH + 16; y += 16) for (let x = 0; x < L.ww; x += 16) { const k = ((x + y) / 16) % 2; tri(ctx, [x, y], [x + 16, y], [x + 8, y + 16], k ? '#9cc0e0' : '#86aed6'); tri(ctx, [x + 8, y + 16], [x + 16, y], [x + 24, y + 16], k ? '#b8cbe0' : '#c9d8e8'); }
      ctx.restore();
      // nieve: tira blanca doblada con sombra
      tops((a, b, y) => {
        ctx.save(); ctx.shadowColor = 'rgba(70,80,110,.28)'; ctx.shadowBlur = 2 * f.S; ctx.shadowOffsetY = 1.4 * f.S;
        ctx.beginPath(); ctx.moveTo(a - 1.5, y - 2.6); ctx.lineTo(b + 1.5, y - 2.6); for (let x = b + 1.5, k = 0; x >= a - 1.5; x -= 4, k++) ctx.lineTo(x, y + (k % 2 ? 3 : 5.4)); ctx.closePath(); ctx.fillStyle = OR.paper; ctx.fill(); ctx.restore();
        for (let x = a; x < b; x += 8) tri(ctx, [x, y - 2.6], [x + 4, y + 3], [x + 8, y - 2.6], '#ffffff');
        crease(ctx, [a, y - 2.6], [b, y - 2.6], false);
      });
      for (const o of L.deco) {
        const x = o.x, y = o.y;
        if (o.k === 'T') { const h = 40 + R(o.i, 1) * 10; for (let k = 0; k < 4; k++) { const w = 14 - k * 3, yb = y - 6 - k * h * .2; tri(ctx, [x - w, yb], [x, yb - h * .3], [x, yb], '#5f9a82'); tri(ctx, [x, yb], [x, yb - h * .3], [x + w, yb], '#4a8270'); tri(ctx, [x - w * .7, yb - h * .12], [x, yb - h * .3], [x - w * .1, yb - h * .15], '#ffffff'); } tri(ctx, [x - 1.6, y], [x + 1.6, y], [x, y - 8], '#9a7058'); }
        else if (o.k === 'f') for (let k = 0; k < 3; k++) { const fx = x - 5 + k * 5, fy = y - 5 - (k % 2) * 2; ctx.strokeStyle = '#4a8270'; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(fx, y); ctx.lineTo(fx, fy); ctx.stroke(); const c = ['#d9443a', '#e88aa8', '#f2b233'][(o.i + k) % 3]; tri(ctx, [fx - 2.4, fy - 3], [fx, fy + 1], [fx, fy - 2], mix(c, '#000000', .1)); tri(ctx, [fx + 2.4, fy - 3], [fx, fy + 1], [fx, fy - 2], c); tri(ctx, [fx - 1, fy - 3.6], [fx + 1, fy - 3.6], [fx, fy - 1.4], mix(c, '#ffffff', .2)); }
        else if (o.k === 'r') { const oct = (cx, cy, r) => { ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + Math.PI / 8; ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } ctx.closePath(); }; oct(x, y - 5, 5.4); ctx.fillStyle = '#ffffff'; ctx.fill(); tri(ctx, [x, y - 10.4], [x + 5, y - 5], [x, y], '#e6ebf2'); oct(x, y - 13, 3.6); ctx.fillStyle = '#ffffff'; ctx.fill(); tri(ctx, [x, y - 16.6], [x + 3.4, y - 13], [x, y - 9.4], '#e6ebf2'); ctx.fillStyle = '#d9443a'; ctx.fillRect(x - 3.6, y - 10.4, 7.2, 1.4); tri(ctx, [x + 2, y - 13.4], [x + 6, y - 12.6], [x + 2, y - 12], '#f2b233'); ctx.fillStyle = '#2a2a3a'; ctx.fillRect(x + .6, y - 14.4, .9, .9); }
      }
    },
    player(ctx, p, f) { drawHero(ctx, p, f, { body: '#ffffff', skin: '#f0c9a8', hair: '#3a3a5a', leg: '#3a3a5a', eye: '#3a3a5a', poly: 6 }); },
    coin(ctx, x, y, t) {
      const s = Math.cos(t * 2.4 + x * .05), yy = y + Math.sin(t * 2.5 + x) * 1.6;
      ctx.save(); ctx.translate(x, yy); ctx.scale(Math.max(.2, Math.abs(s)), 1);
      for (let i = 0; i < 5; i++) { const a = i / 5 * TAU - Math.PI / 2, b = a + TAU / 10, c2 = a - TAU / 10; tri(ctx, [0, 0], [Math.cos(a) * 6, Math.sin(a) * 6], [Math.cos(b) * 2.4, Math.sin(b) * 2.4], '#f2b233'); tri(ctx, [0, 0], [Math.cos(a) * 6, Math.sin(a) * 6], [Math.cos(c2) * 2.4, Math.sin(c2) * 2.4], '#ffd36b'); }
      ctx.restore();
    },
    goal(ctx, x, y, t) {
      ctx.fillStyle = '#9a7058'; ctx.fillRect(x - .8, y - 30, 1.6, 30);
      // grulla de papel
      const by = y - 36 + Math.sin(t * 2) * 1.5, fl = Math.sin(t * 3) * 2;
      tri(ctx, [x - 10, by + 2], [x + 10, by + 2], [x, by + 6], '#b8302a');
      tri(ctx, [x - 2, by + 2], [x - 12, by - 9 - fl], [x + 2, by + 1], '#e0503f');
      tri(ctx, [x - 1, by + 2], [x + 9, by - 10 + fl], [x + 3, by + 2], '#d9443a');
      tri(ctx, [x + 9, by + 2], [x + 14, by - 6], [x + 11, by + 2], '#b8302a'); tri(ctx, [x + 14, by - 6], [x + 16, by - 4.5], [x + 13, by - 5], '#b8302a');
      tri(ctx, [x - 9, by + 2], [x - 14, by - 4], [x - 11, by + 2], '#c43a32');
    },
    over(ctx, f) {
      // copos de papel recortado
      ambient(30, 45, (i, a, b, c) => {
        const x = wrap(a * VW * 1.3 - f.cam * (.5 + c * .6) + Math.sin(f.t * .7 + i) * 8, VW + 20) - 10, y = wrap(b * VH + f.t * (10 + c * 14), VH + 10) - 5, s = 1.2 + c * 1.6;
        ctx.save(); ctx.translate(x, y); ctx.rotate(f.t * (c - .5) + i);
        ctx.fillStyle = 'rgba(90,100,130,.25)'; ctx.beginPath(); for (let k = 0; k < 12; k++) { const aa = k / 12 * TAU, r = k % 2 ? s * .45 : s; ctx.lineTo(Math.cos(aa) * r + .5, Math.sin(aa) * r + .6); } ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); for (let k = 0; k < 12; k++) { const aa = k / 12 * TAU, r = k % 2 ? s * .45 : s; ctx.lineTo(Math.cos(aa) * r, Math.sin(aa) * r); } ctx.fill();
        ctx.restore();
      });
      vignette(ctx, .22, '#6a7aa0', .5);
    },
  });

  // ===================================================================
  //  CARTA CELESTE · "El cielo de los mayas"
  // ===================================================================
  const CC = { nav0: '#10204e', nav1: '#26408a', oro: '#e2c06e', crema: '#efe3c2', rosa: '#d58a7a' };
  // figuras de constelación grabadas: tortuga (Ak) y alacrán (Sinan Ek)
  function tortuga(x, cx, cy, s) {
    x.save(); x.translate(cx, cy); x.scale(s, s);
    x.beginPath(); x.ellipse(0, 0, 30, 20, 0, 0, TAU); x.stroke();
    for (let i = -2; i <= 2; i++) { x.beginPath(); x.moveTo(i * 10, -18); x.lineTo(i * 12, 18); x.stroke(); }
    x.beginPath(); x.ellipse(36, -4, 8, 6, 0, 0, TAU); x.stroke();
    for (const [lx, ly] of [[-20, 16], [18, 16], [-22, -14], [20, -14]]) { x.beginPath(); x.ellipse(lx + Math.sign(lx) * 4, ly + Math.sign(ly) * 6, 7, 4, Math.sign(lx * ly) * .6, 0, TAU); x.stroke(); }
    for (let i = 0; i < 40; i++) { x.beginPath(); x.moveTo(-26 + i * 1.3, 8 + Math.sin(i) * 2); x.lineTo(-25 + i * 1.3, 14); x.stroke(); }
    x.restore();
  }
  function alacran(x, cx, cy, s) {
    x.save(); x.translate(cx, cy); x.scale(s, s);
    x.beginPath(); x.ellipse(0, 0, 16, 9, 0, 0, TAU); x.stroke();
    let px = 14, py = -2; for (let i = 0; i < 6; i++) { const nx = px + 7 - i * .5, ny = py - 5 - i * 2.4; x.beginPath(); x.ellipse((px + nx) / 2, (py + ny) / 2, 4, 3, 0, 0, TAU); x.stroke(); px = nx; py = ny; }
    x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px - 6, py - 8, px - 10, py - 2); x.stroke();
    for (const d of [-1, 1]) { x.beginPath(); x.moveTo(-14, d * 4); x.lineTo(-24, d * 10); x.lineTo(-30, d * 6); x.stroke(); x.beginPath(); x.ellipse(-33, d * 6, 4, 2.5, d * .4, 0, TAU); x.stroke(); for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(-8 + k * 5, d * 7); x.lineTo(-10 + k * 5, d * 15); x.lineTo(-13 + k * 5, d * 17); x.stroke(); } }
    x.restore();
  }
  function star(x, cx, cy, r, col) { x.fillStyle = col; x.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, rr = i % 4 === 0 ? r : i % 2 ? r * .22 : r * .45; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); x.fill(); }
  defStyle({
    id: 'cielo', name: 'Carta celeste', ref: 'Atlas de Hevelius (1690) · Uranometria · astronomía maya', order: 46,
    desc: 'Un atlas de estrellas antiguo, grabado en oro sobre azul noche: retícula de coordenadas, constelaciones mayas a línea y escala de grados.',
    fx: { dust: ['#e2c06e', '#efe3c2'], spark: ['#fff3c4', '#e2c06e', '#ffffff'], confetti: ['#e2c06e', '#efe3c2', '#d58a7a', '#8fb0e0'] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'fondo', x => { const g = x.createRadialGradient(VW / 2, VH * .4, 20, VW / 2, VH * .4, VW * .75); g.addColorStop(0, CC.nav1); g.addColorStop(1, CC.nav0); x.fillStyle = g; x.fillRect(0, 0, VW, VH); x.globalCompositeOperation = 'overlay'; x.globalAlpha = .35; x.drawImage(paperTex(f, 'pergamino', '#7a7060', { grain: 18, blot: 20, fibers: 10 }), 0, 0, VW, VH); });
      strip(ctx, f, 'carta', .05, (x, w) => {
        // retícula de ascensión y declinación desde un polo fuera de cuadro
        const px = w / 2, py = -420;
        x.strokeStyle = 'rgba(226,192,110,.36)'; x.lineWidth = .55;
        for (let r = 440; r < 760; r += 40) { x.beginPath(); x.arc(px, py, r, Math.PI * .25, Math.PI * .75); x.stroke(); }
        for (let a = -60; a <= 60; a += 4) { const an = Math.PI / 2 + a * Math.PI / 180; x.beginPath(); x.moveTo(px + Math.cos(an) * 440, py + Math.sin(an) * 440); x.lineTo(px + Math.cos(an) * 780, py + Math.sin(an) * 780); x.stroke(); }
        // eclíptica punteada
        x.setLineDash([3, 2]); x.strokeStyle = 'rgba(213,138,122,.45)'; x.beginPath(); for (let xx = 0; xx <= w; xx += 6) x.lineTo(xx, 90 + Math.sin(xx * .006) * 40); x.stroke(); x.setLineDash([]);
        // vía láctea en puntitos
        const r0 = rng(7); for (let i = 0; i < w * 1.6; i++) { const xx = r0() * w, yy = 40 + Math.sin(xx * .004) * 50 + (r0() + r0() + r0() - 1.5) * 22; x.fillStyle = `rgba(239,227,194,${.2 + r0() * .4})`; x.fillRect(xx, yy, .6, .6); }
        // figuras grabadas
        x.strokeStyle = 'rgba(239,227,194,.62)'; x.lineWidth = .8;
        for (let i = 0; i < w / 300; i++) { if (i % 2) alacran(x, i * 300 + 140, 92 + R(i, 3) * 30, 1.5); else tortuga(x, i * 300 + 140, 100 + R(i, 3) * 26, 1.3); }
        // estrellas de catálogo con su magnitud
        for (let i = 0; i < w / 6; i++) { const xx = r0() * w, yy = r0() * 200, m = r0(); if (m > .9) star(x, xx, yy, 2.4 + (m - .9) * 30, CC.oro); else { x.fillStyle = `rgba(239,227,194,${.4 + m * .4})`; x.beginPath(); x.arc(xx, yy, .3 + m * .7, 0, TAU); x.fill(); } }
        // líneas de constelación
        x.strokeStyle = 'rgba(226,192,110,.8)'; x.lineWidth = .55; for (let i = 0; i < w / 90; i++) { const r1 = rng(i * 5 + 1); let xx = i * 90 + r1() * 40, yy = 30 + r1() * 120; x.beginPath(); x.moveTo(xx, yy); for (let k = 0; k < 4; k++) { xx += 8 + r1() * 18; yy += (r1() - .5) * 26; x.lineTo(xx, yy); } x.stroke(); }
      });
      // estrellas que titilan
      ambient(14, 61, (i, a, b, c) => { const tw = .5 + .5 * Math.sin(f.t * (1.5 + c * 2) + i * 3); const x = wrap(a * VW * 1.2 - f.cam * .05, VW + 20) - 10, y = b * 170; ctx.globalAlpha = tw; star(ctx, x, y, 2 + c * 2.5, '#fff3c4'); ctx.globalAlpha = 1; });
      // horizonte grabado: Edzná con achurado
      strip(ctx, f, 'edzna', .1, (x, w) => {
        x.beginPath(); CAMP.skyline(x, 0, w, 182, 'far', 2, 1.5); x.fillStyle = '#16275c'; x.fill();
        x.save(); x.clip(); x.strokeStyle = 'rgba(239,227,194,.26)'; x.lineWidth = .4; for (let i = -60; i < w; i += 2.2) { x.beginPath(); x.moveTo(i, 80); x.lineTo(i + 60, VH); x.stroke(); } x.restore();
        x.beginPath(); for (let xx = 0; xx <= w; xx += 1.5) x.lineTo(xx, 182 - CAMP.h(xx, 'far', 2) * 1.5); x.strokeStyle = CC.oro; x.lineWidth = .8; x.stroke();
      });
    },
    terrain(ctx) {
      { const g = ctx.createLinearGradient(0, 150, 0, VH); g.addColorStop(0, '#31488e'); g.addColorStop(1, '#14224e'); allLoopsPath(ctx, L.loops); ctx.fillStyle = g; ctx.fill(); }
      ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(239,227,194,.2)'; ctx.lineWidth = .4;
      for (let i = -VH; i < L.ww; i += 2.4) { ctx.beginPath(); ctx.moveTo(i, 100); ctx.lineTo(i + 150, VH + 10); ctx.stroke(); }
      for (let i = 0; i < L.ww / 26; i++) { const sx = (i * 26 + R(i, 3) * 20), sy = 186 + R(i, 4) * 50; if (i % 3 === 0) star(ctx, sx, sy, 2 + R(i, 5) * 1.6, CC.oro); else { ctx.fillStyle = 'rgba(239,227,194,.6)'; ctx.fillRect(sx, sy, .8, .8); } }
      ctx.restore();
      allLoopsPath(ctx, L.loops); ctx.strokeStyle = CC.oro; ctx.lineWidth = .7; ctx.stroke();
      // escala de grados sobre cada orilla
      ctx.font = '3.6px Georgia, serif'; ctx.textAlign = 'center';
      tops((a, b, y) => {
        ctx.strokeStyle = CC.oro; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(a, y + .4); ctx.lineTo(b, y + .4); ctx.moveTo(a, y + 2.6); ctx.lineTo(b, y + 2.6); ctx.stroke();
        ctx.lineWidth = .35; ctx.beginPath(); for (let x = Math.ceil(a / 4) * 4; x <= b; x += 4) { const big = x % 16 === 0; ctx.moveTo(x, y + .4); ctx.lineTo(x, y + (big ? 5 : 2.6)); } ctx.stroke();
        ctx.fillStyle = 'rgba(226,192,110,.8)'; for (let x = Math.ceil(a / 64) * 64; x <= b - 6; x += 64) ctx.fillText(((x / 64) % 36 * 10) + '°', x, y + 9);
      });
      for (const o of L.deco) {
        const x = o.x, y = o.y;
        if (o.k === 'T') { ctx.beginPath(); CAMP.ceiba(ctx, x, y + 1, 50 + R(o.i, 1) * 10, 40, o.i); ctx.strokeStyle = 'rgba(226,192,110,.85)'; ctx.lineWidth = .45; ctx.stroke(); star(ctx, x, y - 64 - R(o.i, 1) * 10, 3.4, CC.oro); }
        else if (o.k === 'f') for (let k = 0; k < 3; k++) { const fx = x - 5 + k * 5, fy = y - 6 - (k % 2) * 3; ctx.strokeStyle = 'rgba(226,192,110,.7)'; ctx.lineWidth = .4; ctx.beginPath(); ctx.moveTo(fx, y); ctx.lineTo(fx, fy); ctx.stroke(); star(ctx, fx, fy, 2.2, k % 2 ? CC.crema : CC.oro); }
        else if (o.k === 'r') { ctx.fillStyle = '#16244d'; ctx.fillRect(x - 4, y - 14, 8, 14); ctx.strokeStyle = CC.oro; ctx.lineWidth = .5; ctx.strokeRect(x - 4, y - 14, 8, 14); ctx.beginPath(); for (let k = 0; k < 3; k++) { ctx.moveTo(x - 2.5, y - 11.5 + k * 4); ctx.lineTo(x + 2.5, y - 11.5 + k * 4); ctx.arc(x, y - 11.5 + k * 4 + 1.4, 1, 0, Math.PI); } ctx.stroke(); }
      }
    },
    player(ctx, p, f) { drawHero(ctx, p, f, { lw: .6, line: CC.oro, body: '#14224a', skin: '#14224a', hair: '#14224a', leg: '#14224a', eye: CC.oro }); },
    coin(ctx, x, y, t) {
      const yy = y + Math.sin(t * 2.2 + x) * 1.6, tw = .8 + Math.sin(t * 6 + x) * .2;
      ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, yy, 10, CC.oro, .35 * tw); ctx.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.translate(x, yy); ctx.rotate(t * .6 + x); star(ctx, 0, 0, 6 * tw, CC.oro); ctx.restore(); ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(x, yy, 1.3, 0, TAU); ctx.fill();
    },
    goal(ctx, x, y, t) {
      // esfera armilar
      ctx.strokeStyle = CC.oro; ctx.lineWidth = .9; ctx.fillStyle = CC.oro;
      ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.moveTo(x, y); ctx.lineTo(x, y - 18); ctx.stroke();
      const cy = y - 32;
      ctx.beginPath(); ctx.arc(x, cy, 13, 0, TAU); ctx.stroke();
      for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(x, cy, 13, Math.abs(Math.cos(t * .8 + k * 1.05)) * 13, k * .5, 0, TAU); ctx.lineWidth = .5; ctx.stroke(); }
      ctx.lineWidth = .7; ctx.beginPath(); ctx.ellipse(x, cy, 13, 4, -.4, 0, TAU); ctx.stroke();
      ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, cy, 8, '#fff3c4', .6); ctx.globalCompositeOperation = 'source-over'; ctx.beginPath(); ctx.arc(x, cy, 2.4, 0, TAU); ctx.fill();
    },
    over(ctx, f) {
      // marco del atlas con escala de grados que corre con la cámara
      ctx.strokeStyle = 'rgba(226,192,110,.7)'; ctx.lineWidth = .6; ctx.strokeRect(4, 4, VW - 8, VH - 8); ctx.lineWidth = .3; ctx.strokeRect(7, 7, VW - 14, VH - 14);
      ctx.beginPath(); const o = wrap(f.cam * .5, 8);
      for (let x = 8 - o; x < VW - 6; x += 8) { if (x < 7) continue; const big = Math.round((x + f.cam * .5) / 8) % 4 === 0; ctx.moveTo(x, 4); ctx.lineTo(x, big ? 7 : 5.5); ctx.moveTo(x, VH - 4); ctx.lineTo(x, VH - (big ? 7 : 5.5)); }
      for (let y = 12; y < VH - 8; y += 8) { const big = (y / 8) % 4 === 0; ctx.moveTo(4, y); ctx.lineTo(big ? 7 : 5.5, y); ctx.moveTo(VW - 4, y); ctx.lineTo(VW - (big ? 7 : 5.5), y); }
      ctx.stroke();
      vignette(ctx, .55, '#05091a', .42);
    },
  });

  // ===================================================================
  //  HOLLÍN · "Campeche bajo la ceniza" (siluetas como el proyecto Hollín)
  // ===================================================================
  const HO = { k: '#08080a', fog: '#b8b2a8', red: '#ff3030' };
  defStyle({
    id: 'hollin', name: 'Siluetas de ceniza', ref: 'Hollín · Limbo · Inside', order: 47,
    desc: 'El mundo cubierto de ceniza: todo es silueta negra entre capas de niebla gris, y lo único con color son los ojos rojos y las brasas.',
    fx: { dust: ['#6a6660', '#3a3836'], spark: ['#ff9a40', '#ffd0a0', '#ff3030'], confetti: ['#ff3030', '#ffd0a0', '#ffffff', '#8a8680'] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'cielo', x => {
        const g = x.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#6e6a66'); g.addColorStop(.55, '#a8a39b'); g.addColorStop(1, '#cfc9be'); x.fillStyle = g; x.fillRect(0, 0, VW, VH);
        glowDot(x, 110, 78, 60, '#f0e8d8', .25); x.fillStyle = 'rgba(240,232,215,.55)'; x.beginPath(); x.arc(110, 78, 15, 0, TAU); x.fill();
      });
      const fogBand = (y, a) => { const m = ctx.createLinearGradient(0, y - 30, 0, y + 20); m.addColorStop(0, rgba(HO.fog, 0)); m.addColorStop(1, rgba(HO.fog, a)); ctx.fillStyle = m; ctx.fillRect(0, y - 30, VW, VH - y + 30); };
      strip(ctx, f, 'ruinas', .06, (x, w) => {
        x.beginPath(); CAMP.skyline(x, 0, w, 178, 'mid', 5, 1.5); x.fillStyle = '#8f8a83'; x.fill();
        // techos rotos
        x.globalCompositeOperation = 'destination-out';
        for (let i = 0; i < w; i += 7) if (R(i, 4) < .35) { const t0 = 178 - CAMP.h(i, 'mid', 5) * 1.5 - 1, t1 = 178 - CAMP.h(i + 7, 'mid', 5) * 1.5 - 1; x.beginPath(); x.moveTo(i, t0); x.lineTo(i + 3 + R(i, 5) * 5, t0 + 9 + R(i, 6) * 10); x.lineTo(i + 7, t1); x.fill(); }
        x.globalCompositeOperation = 'source-over';
      });
      fogBand(178, .55);
      // la antena que todavía transmite
      const ax = 330 - f.cam * .1;
      ctx.strokeStyle = '#4a4642'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(ax - 10, 190); ctx.lineTo(ax, 60); ctx.lineTo(ax + 10, 190);
      for (let y = 70; y < 190; y += 12) { const k = (y - 60) / 130 * 10; ctx.moveTo(ax - k, y); ctx.lineTo(ax + k + 1.2, y + 12); ctx.moveTo(ax + k, y); ctx.lineTo(ax - k - 1.2, y + 12); }
      ctx.stroke();
      if (Math.sin(f.t * 3) > .2) { ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, ax, 58, 12, HO.red, .8); ctx.globalCompositeOperation = 'source-over'; }
      strip(ctx, f, 'postes', .22, (x, w) => {
        x.fillStyle = '#4e4a46'; x.strokeStyle = '#4e4a46';
        const P = i => ({ x: i + R(i, 8) * 20, top: 120 + R(i, 10) * 20 });
        for (let i = 0; i < w; i += 64) { const q = P(i), lean = (R(i, 9) - .5) * .12; x.save(); x.translate(q.x, 205); x.rotate(lean); x.fillRect(-1.2, q.top - 205, 2.4, 205 - q.top + 4); x.fillRect(-9, q.top - 199, 18, 1.6); x.restore(); }
        x.lineWidth = .4; x.beginPath(); for (let i = 0; i < w; i += 64) { const a = P(i), b = P(i + 64); x.moveTo(a.x - 8, a.top + 7); x.quadraticCurveTo((a.x + b.x) / 2, Math.max(a.top, b.top) + 21, b.x - 8, b.top + 7); } x.stroke();
        x.beginPath(); CAMP.skyline(x, 0, w, 206, 'near', 13, .55); x.fill();
      });
      fogBand(206, .45);
      strip(ctx, f, 'arboles', .45, (x, w) => { x.beginPath(); for (const q of CAMP.props(0, w, 'near', 17)) { if (q.k === 'ceiba') CAMP.ceiba(x, q.x, 232, q.h * .9, q.w * .9, q.s, 'trunk'); else CAMP.palma(x, q.x, 232, q.h * .8, q.lean, q.s, 0, 'trunk'); } x.rect(0, 230, w, 20); x.fillStyle = '#2a2826'; x.fill(); });
    },
    terrain(ctx) {
      const loops = organicLoops({ step: 3, amp: 1.4, freq: .5, seed: 47 });
      ctx.beginPath(); for (const l of loops) pathPts(ctx, l); ctx.fillStyle = HO.k; ctx.fill();
      // pasto seco y escombro sobre las orillas
      tops((a, b, y) => { for (let x = a; x < b; x += 1.6) { const h = 1 + R(x * 5 | 0, 3) * (R(x | 0, 9) < .1 ? 7 : 3); ctx.beginPath(); ctx.moveTo(x - .5, y + 1); ctx.lineTo(x + (R(x | 0, 4) - .5) * 2, y - h); ctx.lineTo(x + .6, y + 1); ctx.fill(); } });
      for (const o of L.deco) {
        const x = o.x, y = o.y; ctx.fillStyle = HO.k;
        if (o.k === 'T') { ctx.beginPath(); CAMP.ceiba(ctx, x, y + 1, 50 + R(o.i, 1) * 12, 44, o.i, 'trunk'); ctx.fill(); }
        else if (o.k === 'f') { ctx.strokeStyle = HO.k; ctx.lineWidth = .6; for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.moveTo(x - 4 + k * 1.3, y); ctx.quadraticCurveTo(x - 4 + k * 1.3 + (k - 3) * .8, y - 5, x - 4 + k * 1.7 + (k - 3) * 1.4, y - 7 - R(k, o.i) * 4); ctx.stroke(); } }
        else if (o.k === 'r') { ctx.beginPath(); roundRect(ctx, x - 5, y - 11, 10, 11, 1.4); ctx.fill(); ctx.fillStyle = '#2a2826'; ctx.fillRect(x - 5, y - 8, 10, .8); ctx.fillRect(x - 5, y - 4, 10, .8); }
      }
    },
    player(ctx, p, f) { drawHero(ctx, p, f, { body: HO.k, skin: HO.k, hair: HO.k, leg: HO.k, eye: '#ffffff', noFace: true }); },
    coin(ctx, x, y, t) {
      const yy = y + Math.sin(t * 2.4 + x) * 1.6, fl = .8 + Math.sin(t * 9 + x) * .2;
      ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, yy, 9, '#ff9a40', .5 * fl); ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#ffd0a0'; ctx.beginPath(); ctx.moveTo(x, yy - 4 * fl); ctx.quadraticCurveTo(x + 2.6, yy, x, yy + 2.4); ctx.quadraticCurveTo(x - 2.6, yy, x, yy - 4 * fl); ctx.fill();
    },
    goal(ctx, x, y, t) {
      ctx.strokeStyle = HO.k; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x, y - 52); ctx.lineTo(x + 7, y);
      for (let yy = y - 6; yy > y - 50; yy -= 8) { const k = (y - yy) / 52 * 7; ctx.moveTo(x - 7 + k, yy); ctx.lineTo(x + 7 - k - 1, yy - 8); }
      ctx.stroke();
      ctx.fillStyle = HO.k; ctx.beginPath(); ctx.ellipse(x - 5, y - 40, 4, 6, -.5, 0, TAU); ctx.fill();
      const on = Math.sin(t * 4) > 0; if (on) { ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y - 54, 12, HO.red, .9); ctx.globalCompositeOperation = 'source-over'; }
      ctx.fillStyle = on ? '#ffb0b0' : '#5a1010'; ctx.beginPath(); ctx.arc(x, y - 54, 1.6, 0, TAU); ctx.fill();
    },
    over(ctx, f) {
      ctx.fillStyle = 'rgba(40,38,36,.55)';
      ambient(46, 71, (i, a, b, c) => { const x = wrap(a * VW * 1.4 - f.cam * (.4 + c * .7) + Math.sin(f.t * .8 + i) * 10 - f.t * 6, VW + 20) - 10, y = wrap(b * VH + f.t * (6 + c * 10), VH + 6) - 3; ctx.fillRect(x, y, .8 + c, .8 + c * .6); });
      const g = ctx.createLinearGradient(0, VH - 50, 0, VH); g.addColorStop(0, 'rgba(184,178,168,0)'); g.addColorStop(1, 'rgba(184,178,168,.25)'); ctx.fillStyle = g; ctx.fillRect(0, VH - 50, VW, 50);
      vignette(ctx, .5, '#141210', .4);
    },
  });
})();
