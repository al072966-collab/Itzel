'use strict';
// =====================================================================
//  Estilos vectoriales: geométrico, caricatura, papel, low poly,
//  códice maya, plano técnico, vitral
// =====================================================================
(function () {
  const circlesPath = (ctx, cs) => { ctx.beginPath(); for (const [x, y, r] of cs) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); } };
  const R = (i, s) => hash1(i, s);

  // ======================= GEOMETRICO SUAVE =======================
  defStyle({
    id: 'flat', name: 'Geométrico suave', ref: "Alto's Odyssey · Monument Valley", order: 7,
    desc: 'Formas planas sin contorno, degradados atmosféricos por capas y luz de borde del sol poniente.',
    fx: { dust: ['#f6d5b8', '#f2b8a0'], spark: ['#fff1c9', '#ffb38a', '#ffffff'] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'sky', x => {
        const g = x.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#22345a'); g.addColorStop(.42, '#8d5f88'); g.addColorStop(.7, '#ee9c7a'); g.addColorStop(1, '#fad9ab');
        x.fillStyle = g; x.fillRect(0, 0, VW, VH);
        ambient(60, 3, (i, a, b, c) => { x.fillStyle = `rgba(255,240,230,${.15 + c * .55})`; x.beginPath(); x.arc(a * VW, b * 90, .35 + c * .5, 0, TAU); x.fill(); });
      });
      // el sol se pone sobre el Golfo, detras de Edzna
      const sx = 268 - f.cam * .02;
      glowDot(ctx, sx, 134, 120, '#ffd9b0', .5);
      ctx.fillStyle = '#fff1d6'; ctx.beginPath(); ctx.arc(sx, 134, 17, 0, TAU); ctx.fill();
      const fill = (c1, c2, y0, y1) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fill(); };
      const mist = (y) => { const m = ctx.createLinearGradient(0, y - 18, 0, y + 26); m.addColorStop(0, rgba('#f7b895', 0)); m.addColorStop(1, rgba('#f7b895', .34)); ctx.fillStyle = m; ctx.fillRect(0, y - 18, VW, VH); };
      campPath(ctx, f, .05, 164, 'far', 2, 1.1); fill('#c98a8e', '#eca88c', 110, 170); mist(164);
      campPath(ctx, f, .13, 178, 'mid', 4, 1.35); fill('#946688', '#c48a8c', 110, 180);
      campWindows(ctx, f, .13, 178, 4, 1.35, 'rgba(255,214,160,.85)', .4, 'rgba(70,40,80,.35)'); mist(178);
      campPath(ctx, f, .3, 204, 'near', 6, .85); fill('#4e3466', '#6e4b78', 160, 210);
      campProps(ctx, f, .3, 204, 'near', 6, .85, f.t); ctx.fillStyle = '#4e3466'; ctx.fill();
      fragatas(ctx, f, 4, 21, 'rgba(60,40,80,.6)', 50);
    },
    terrain(ctx) {
      allLoopsPath(ctx, L.loops, 2.5);
      const g = ctx.createLinearGradient(0, 120, 0, VH); g.addColorStop(0, '#3b2c5a'); g.addColorStop(1, '#1b1530'); ctx.fillStyle = g; ctx.fill();
      ctx.save(); ctx.clip();
      // diseño plano: estratos de tono parejo con orilla limpia, y piedras con su sombra larga a 45°
      for (const [by, col, amp] of [[176, '#34284f', 3], [198, '#2c2245', 4], [220, '#241c3b', 3]]) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, VH + 8); for (let x = 0; x <= L.ww; x += 6) ctx.lineTo(x, by + Math.sin(x * .021 + by) * amp + Math.sin(x * .053) * amp * .5); ctx.lineTo(L.ww, VH + 8); ctx.fill(); }
      { const rf = rng(17); for (let i = 0; i < 120; i++) { const x = rf() * L.ww, y = 150 + rf() * 90, d = L.depth(x, y); if (d < 14) continue; const w = 2.5 + rf() * 5, h = w * (.55 + rf() * .3);
        ctx.fillStyle = 'rgba(14,8,28,.35)'; ctx.beginPath(); ctx.moveTo(x - w * .7, y + h * .7); ctx.lineTo(x + w * .7, y - h * .7); ctx.lineTo(x + w * .7 + 40, y - h * .7 + 40); ctx.lineTo(x - w * .7 + 40, y + h * .7 + 40); ctx.fill();
        ctx.fillStyle = '#4c3a6c'; ctx.beginPath(); ctx.ellipse(x, y, w, h, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#6a4f82'; ctx.beginPath(); ctx.ellipse(x, y, w, h, 0, Math.PI, TAU); ctx.fill(); ctx.fillStyle = '#4c3a6c'; ctx.beginPath(); ctx.ellipse(x, y, w, h * .35, 0, Math.PI, TAU); ctx.fill(); } }
      for (const r of L.tops) { const gg = ctx.createLinearGradient(0, r.y, 0, r.y + 12); gg.addColorStop(0, '#f4a786'); gg.addColorStop(.2, '#b3697f'); gg.addColorStop(1, rgba('#3b2c5a', 0)); ctx.fillStyle = gg; ctx.fillRect(r.x0, r.y, r.x1 - r.x0, 12); }
      for (const r of L.bottoms) { ctx.fillStyle = 'rgba(10,6,20,.35)'; ctx.fillRect(r.x0, r.y - 5, r.x1 - r.x0, 5); }
      ctx.restore();
      for (const o of L.deco) {
        const x = o.x, y = o.y;
        if (o.k === 'T') {
          ctx.beginPath(); if (o.i % 2) CAMP.palma(ctx, x, y + 1, 52 + R(o.i, 1) * 14, (R(o.i, 2) - .5) * .5, o.i); else CAMP.ceiba(ctx, x, y + 1, 54 + R(o.i, 1) * 10, 44, o.i);
          ctx.fillStyle = '#2f2549'; ctx.fill();
          ctx.save(); ctx.clip(); ctx.fillStyle = '#5d3f6e'; ctx.fillRect(x, y - 80, 40, 80); ctx.restore();
        } else if (o.k === 'f') {
          for (let k = 0; k < 2; k++) { const bx = x - 5 + k * 9, s = .8 + R(o.i + k, 3) * .5; for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i / 8 - .5) * 2.6, l = (6 + Math.cos(a + Math.PI / 2) * 3) * s; ctx.fillStyle = i < 4 ? '#4a3466' : '#6a4a78'; ctx.beginPath(); ctx.moveTo(bx - .8, y); ctx.lineTo(bx + Math.cos(a) * l, y + Math.sin(a) * l); ctx.lineTo(bx + .8, y); ctx.fill(); } }
        } else if (o.k === 'r') {
          ctx.fillStyle = '#3e2d58'; ctx.beginPath(); roundRect(ctx, x - 5, y - 17, 10, 17, 2); ctx.fill();
          ctx.fillStyle = '#6a4a78'; ctx.fillRect(x + 1, y - 17, 4, 17);
          ctx.strokeStyle = 'rgba(244,167,134,.5)'; ctx.lineWidth = .5; for (let k = 0; k < 3; k++) { ctx.beginPath(); roundRect(ctx, x - 3.4, y - 15 + k * 5, 6.8, 4, 1.4); ctx.stroke(); }
        }
      }
    },
    player(ctx, p, f) { drawHero(ctx, p, f, { body: '#f4efe6', body2: '#d9cdc6', skin: '#f6c9a8', hair: '#2a2347', scarf: '#ff6b5b', leg: '#2a2347', eye: '#2a2347', scarfW: 2 }); },
    coin(ctx, x, y, t) {
      const s = Math.cos(t * 2.6 + x * .05), yy = y + Math.sin(t * 2.5 + x) * 1.6;
      glowDot(ctx, x, yy, 12, '#ffe0b0', .45);
      ctx.save(); ctx.translate(x, yy); ctx.scale(Math.abs(s) * .8 + .2, 1);
      ctx.fillStyle = '#fff3d6'; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(4, 0); ctx.lineTo(0, 6); ctx.fill();
      ctx.fillStyle = '#ffb38a'; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(-4, 0); ctx.lineTo(0, 6); ctx.fill();
      ctx.restore();
    },
    goal(ctx, x, y, t) {
      ctx.fillStyle = '#2a2347'; ctx.fillRect(x - .8, y - 46, 1.6, 46);
      ctx.fillStyle = '#ff6b5b'; ctx.beginPath(); ctx.moveTo(x + .8, y - 46);
      for (let i = 0; i <= 10; i++) ctx.lineTo(x + .8 + i * 1.8, y - 46 + i * .55 + Math.sin(t * 5 - i * .6) * i * .18);
      for (let i = 10; i >= 0; i--) ctx.lineTo(x + .8 + i * 1.8, y - 36 - i * .45 + Math.sin(t * 5 - i * .6) * i * .18);
      ctx.fill(); glowDot(ctx, x, y - 47, 9, '#ffd9b0', .6);
    },
    over(ctx, f) {
      ctx.globalCompositeOperation = 'lighter';
      ambient(22, 8, (i, a, b, c) => { const x = wrap(a * VW * 1.3 - f.cam * (.6 + c * .6) + Math.sin(f.t * .5 + i) * 10, VW + 20) - 10, y = wrap(b * VH - f.t * (3 + c * 4), VH); ctx.fillStyle = `rgba(255,210,170,${.12 + c * .2})`; ctx.beginPath(); ctx.arc(x, y, .6 + c * .9, 0, TAU); ctx.fill(); });
      ctx.globalCompositeOperation = 'source-over';
      vignette(ctx, .3, '#1b1530');
    },
  });

  // ======================= CARICATURA =======================
  function toonCloud(ctx, x, y, s, seed) {
    const cs = []; const n = 4;
    for (let k = 0; k < n; k++) cs.push([x + (k - (n - 1) / 2) * 9 * s, y - (k === 1 || k === 2 ? 5 * s : 0) - R(k, seed) * 3 * s, (7 + R(k, seed + 1) * 4) * s]);
    cs.push([x, y + 2 * s, 10 * s]);
    circlesPath(ctx, cs); ctx.lineWidth = 2.6; ctx.strokeStyle = '#2b3a5a'; ctx.stroke(); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.save(); ctx.clip(); ctx.fillStyle = '#d3eeff'; ctx.beginPath(); ctx.ellipse(x, y + 9 * s, 30 * s, 8 * s, 0, 0, TAU); ctx.fill(); ctx.restore();
  }
  function toonHills(ctx, f, par, base, sp, rmin, rmax, col, seed) {
    const off = f.cam * par, k0 = Math.floor((off - rmax * 2) / sp), k1 = Math.ceil((off + VW + rmax * 2) / sp);
    const cs = []; for (let k = k0; k <= k1; k++) cs.push([k * sp + R(k, seed) * sp * .4 - off, base + R(k, seed + 2) * 6, rmin + R(k, seed + 1) * (rmax - rmin)]);
    circlesPath(ctx, cs); ctx.rect(-10, base, VW + 20, VH);
    ctx.lineWidth = 2.4; ctx.strokeStyle = '#24402a'; ctx.stroke(); ctx.fillStyle = col; ctx.fill();
    return cs;
  }

  // ======================= PAPEL RECORTADO =======================
  function picado(f, i) {
    const cols = ['#e83f6f', '#ffbf00', '#2274a5', '#32936f', '#9b5de5', '#ff7f11'];
    return cached(f, 'picado' + i, 30, 34, (x) => {
      const tmp = mkCanvas(30 * f.S, 34 * f.S), t = tmp.getContext('2d'); t.scale(f.S, f.S);
      t.fillStyle = cols[i % cols.length]; t.beginPath(); t.moveTo(3, 3); t.lineTo(25, 3); t.lineTo(25, 26);
      for (let k = 0; k < 8; k++) t.lineTo(25 - k * 2.75 - 1.375, 26 + (k % 2 ? 0 : 2.4));
      t.lineTo(3, 26); t.closePath(); t.fill();
      t.globalCompositeOperation = 'destination-out';
      const cx = 14, cy = 14;
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; t.beginPath(); t.ellipse(cx + Math.cos(a) * 5, cy + Math.sin(a) * 5, 2.2, 1.1, a, 0, TAU); t.fill(); }
      t.beginPath(); t.arc(cx, cy, 1.8, 0, TAU); t.fill();
      for (let k = 0; k < 5; k++) { const dx = 5 + k * 4.5; t.beginPath(); t.moveTo(dx, 5.5); t.lineTo(dx + 1.4, 7); t.lineTo(dx, 8.5); t.lineTo(dx - 1.4, 7); t.fill(); t.beginPath(); t.arc(dx, 23, .9, 0, TAU); t.fill(); }
      if (i % 2) for (let k = 0; k < 4; k++) { t.beginPath(); t.arc(6 + (k % 2) * 16, 11 + Math.floor(k / 2) * 7, 1.4, 0, TAU); t.fill(); }
      x.shadowColor = 'rgba(70,40,20,.35)'; x.shadowBlur = 2 * f.S; x.shadowOffsetY = 1.5 * f.S;
      x.drawImage(tmp, 0, 0, 30, 34);
    });
  }
  function paperShadow(ctx, f, b = 4, oy = 1.8, a = .32) { ctx.shadowColor = `rgba(70,40,20,${a})`; ctx.shadowBlur = b * f.S; ctx.shadowOffsetY = oy * f.S; ctx.shadowOffsetX = 0; }
  function noShadow(ctx) { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }
  defStyle({
    id: 'paper', name: 'Papel recortado', ref: 'Tearaway · Paper Mario · papel picado', order: 4,
    desc: 'Capas de cartulina cortadas a tijera con sombras reales entre ellas, costuras y papel picado colgando.',
    fx: { dust: ['#fff6e6', '#f3e2c4'], spark: ['#ffbf00', '#e83f6f', '#ffffff'], confetti: ['#e83f6f', '#ffbf00', '#2274a5', '#32936f', '#9b5de5'] },
    sky(ctx, f) {
      ctx.drawImage(paperTex(f, 'cream', '#f3e3c3', { grain: 10, blot: 8, fibers: 6 }), 0, 0, VW, VH);
      const sun = cached(f, 'sun', 80, 80, x => { paperShadow(x, f, 4, 2); const c = [['#f29e4c', 26], ['#f6bd60', 19], ['#f9d78f', 12]]; for (const [col, r] of c) { x.beginPath(); x.arc(40, 40, r, 0, TAU); x.fillStyle = col; x.fill(); } });
      ctx.drawImage(sun, 300 - 40 - f.cam * .03, 58 - 40, 80, 80);
      for (let i = 0; i < 4; i++) {
        const c = cached(f, 'cloud' + i, 70, 34, x => { paperShadow(x, f, 3, 1.6, .25); x.beginPath(); const n = 3 + i % 2; for (let k = 0; k < n; k++) { const r = 7 + R(k, i) * 5; x.moveTo(12 + k * 13 + r, 22); x.arc(12 + k * 13, 22 - (k % 2) * 4, r, 0, TAU); } x.rect(6, 20, 13 * (n - 1) + 12, 8); x.fillStyle = '#fffaf0'; x.fill(); });
        ctx.drawImage(c, wrap(i * 130 + 60 - f.cam * .07 - f.t * 3, VW + 100) - 80, 26 + (i * 29) % 52, 70, 34);
      }
      const cut = (x, w, base, kind, seed, sc) => { x.beginPath(); x.moveTo(0, VH + 5); for (let xx = 0; xx <= w; xx += 1.5) x.lineTo(xx, base - CAMP.h(xx, kind, seed) * sc + (R(xx * 3 | 0, seed) - .5) * .5); x.lineTo(w, VH + 5); x.closePath(); };
      strip(ctx, f, 'far', .08, (x, w) => { paperShadow(x, f, 6, 2.2, .3); cut(x, w, 160, 'far', 2, 1.2); x.fillStyle = '#f3d2a2'; x.fill(); noShadow(x); });
      strip(ctx, f, 'city', .2, (x, w) => {
        paperShadow(x, f, 6, 2.2, .3); cut(x, w, 182, 'mid', 5, 1.45); x.fillStyle = '#ecd2b0'; x.fill();
        for (const fa of CAMP.facades(0, w, 5)) {
          const top = 182 - (4 + fa.h) * 1.45; paperShadow(x, f, 2.5, 1.2, .28);
          x.fillStyle = CAMP.FACHADAS[fa.col]; x.fillRect(fa.x0 + .4, top + (fa.top === 'pretil' ? 2.3 : 0), fa.w - .8, VH - top);
          noShadow(x); x.fillStyle = 'rgba(255,255,255,.45)'; x.fillRect(fa.x0 + .4, top + 2.3, fa.w - .8, 1.2);
          const n = Math.max(1, Math.floor(fa.w / 6.5)), gp = fa.w / n;
          for (let i = 0; i < n; i++) { const wx = fa.x0 + gp * (i + .5); x.fillStyle = '#5b4a5e'; x.beginPath(); x.moveTo(wx - 1.6, top + 13); x.lineTo(wx - 1.6, top + 8); x.arc(wx, top + 8, 1.6, Math.PI, 0); x.lineTo(wx + 1.6, top + 13); x.fill(); x.fillStyle = '#f7ead2'; x.fillRect(wx - 2.2, top + 13, 4.4, .9); }
          if (fa.doors) { const dx = fa.x0 + fa.w / 2; x.fillStyle = '#7a5040'; x.beginPath(); x.moveTo(dx - 2.4, 182); x.lineTo(dx - 2.4, 174); x.arc(dx, 174, 2.4, Math.PI, 0); x.lineTo(dx + 2.4, 182); x.fill(); }
        }
        noShadow(x);
      });
      strip(ctx, f, 'muralla', .32, (x, w) => { paperShadow(x, f, 6, 2.2, .32); cut(x, w, 198, 'mid', 9, 1.2); x.fillStyle = '#dc8264'; x.fill(); noShadow(x); });
      strip(ctx, f, 'selva', .5, (x, w) => {
        paperShadow(x, f, 6, 2.2, .34); cut(x, w, 212, 'near', 13, .85); x.fillStyle = '#5a9b88'; x.fill();
        x.beginPath(); for (const q of CAMP.props(0, w, 'near', 13)) { const b = 212 - CAMP.h(q.x, 'near', 13) * .85 + 3; if (q.k === 'ceiba') CAMP.ceiba(x, q.x, b, q.h * .85, q.w * .85, q.s); else CAMP.palma(x, q.x, b, q.h * .85, q.lean, q.s); } x.fillStyle = '#3f7f6e'; x.fill(); noShadow(x);
      });
    },
    terrain(ctx, f) {
      const lp = organicLoops({ step: 4, amp: .7, freq: .35, seed: 5 });
      ctx.save(); paperShadow(ctx, f, 6, 2.5, .4); ctx.beginPath(); for (const l of lp) pathPts(ctx, l); ctx.fillStyle = '#a06d4b'; ctx.fill(); ctx.restore();
      ctx.save(); ctx.beginPath(); for (const l of lp) pathPts(ctx, l); ctx.clip();
      // capas de cartulina recortada que siguen la orilla, cada una con su sombra
      for (const [dy, col] of [[20, '#8f5f40'], [44, '#7b4e35'], [72, '#66402b'], [104, '#523323']]) for (const r of L.tops) {
        paperShadow(ctx, f, 3.5, -1.2, .3); ctx.beginPath(); ctx.moveTo(r.x0 - 1, VH + 30);
        for (let x = r.x0 - 1; x <= r.x1 + 1; x += 4) ctx.lineTo(x, r.y + dy + Math.sin(x * .03 + dy) * 3.2 + (R(x | 0, dy) - .5) * 1.1);
        ctx.lineTo(r.x1 + 1, VH + 30); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
      }
      // raíces recortadas que bajan del pasto
      noShadow(ctx); const rr = rng(62); ctx.fillStyle = '#4e3020';
      for (const r of L.tops) for (let x = r.x0 + 8 + rr() * 20; x < r.x1 - 6; x += 34 + rr() * 50) {
        const l = 14 + rr() * 16, cu = (rr() - .5) * 12; paperShadow(ctx, f, 2, 1, .3);
        ctx.beginPath(); ctx.moveTo(x - 1.6, r.y + 5); ctx.quadraticCurveTo(x - 1 + cu, r.y + 5 + l * .55, x + cu * .5, r.y + 5 + l); ctx.quadraticCurveTo(x + 1.2 + cu, r.y + 5 + l * .5, x + 1.6, r.y + 5); ctx.closePath(); ctx.fill();
      }
      // piedras de papel, cada una recortada por separado
      const rp = rng(61), PIEDRA = ['#c9a27a', '#b38c66', '#d8bb94', '#9c7656'];
      for (let i = 0; i < L.ww / 7; i++) {
        const x = rp() * L.ww, y = 20 + rp() * 215, d = L.depth(x, y), w = 3 + rp() * 5, h = w * (.55 + rp() * .3), a = rp() * 3, col = PIEDRA[(rp() * 4) | 0], ks = [0, 1, 2, 3, 4, 5, 6].map(() => .8 + rp() * .35);
        if (d < 14) continue;
        paperShadow(ctx, f, 2, 1, .42); ctx.beginPath();
        ks.forEach((k, j) => { const b = j / 7 * TAU + a; ctx.lineTo(x + Math.cos(b) * w * k, y + Math.sin(b) * h * k); }); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
      }
      noShadow(ctx);
      for (const r of L.bottoms) { ctx.fillStyle = 'rgba(60,30,15,.25)'; ctx.fillRect(r.x0, r.y - 4, r.x1 - r.x0, 4); }
      ctx.restore();
      for (const r of L.tops) {
        const a = r.x0 - 1.5, b = r.x1 + 1.5;
        paperShadow(ctx, f, 3, 1.6, .38);
        ctx.beginPath(); ctx.moveTo(a, r.y - 2.5); for (let x = a; x <= b; x += 4) ctx.lineTo(x, r.y - 2.5 + Math.sin(x * .3) * .35);
        ctx.lineTo(b, r.y + 6); for (let x = b, k = 0; x >= a; x -= 2.5, k++) ctx.lineTo(x, r.y + (k % 2 ? 6 : 8.2)); ctx.closePath(); ctx.fillStyle = '#6aaa55'; ctx.fill();
        noShadow(ctx);
        ctx.beginPath(); ctx.moveTo(a + .5, r.y - 2.5); ctx.lineTo(b - .5, r.y - 2.5); for (let x = b - .5; x >= a + .5; x -= 3) ctx.lineTo(x, r.y + 1.6 + Math.sin(x * .7) * .7); ctx.closePath(); ctx.fillStyle = '#a2cf7a'; ctx.fill();
        ctx.setLineDash([1.6, 1.4]); ctx.lineWidth = .55; ctx.strokeStyle = 'rgba(255,250,235,.85)'; ctx.beginPath(); ctx.moveTo(a + 2, r.y + 3.6); ctx.lineTo(b - 2, r.y + 3.6); ctx.stroke(); ctx.setLineDash([]);
      }
      for (const o of L.deco) {
        const x = o.x, y = o.y;
        if (o.k === 'T') {
          const palm = o.i % 2 === 1, TP = (pt) => { ctx.beginPath(); if (palm) CAMP.palma(ctx, x, y + 1, 50 + R(o.i, 1) * 14, (R(o.i, 2) - .5) * .5, o.i, 0, pt); else CAMP.ceiba(ctx, x, y + 1, 54 + R(o.i, 1) * 10, 44, o.i, pt); };
          paperShadow(ctx, f, 4, 2, .35); TP('trunk'); ctx.fillStyle = '#8b5a3c'; ctx.fill(); TP('crown'); ctx.fillStyle = palm ? '#3f7f6e' : '#4c9a83'; ctx.fill(); noShadow(ctx);
          ctx.save(); TP('crown'); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(x - 40, y - 90, 38, 90); ctx.restore();
        } else if (o.k === 'f') {
          for (let k = 0; k < 3; k++) {
            const fx = x - 6 + k * 6, fy = y - 6 - (k % 2) * 3;
            noShadow(ctx); ctx.strokeStyle = '#4c8a46'; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(fx, y); ctx.lineTo(fx, fy); ctx.stroke();
            paperShadow(ctx, f, 2, 1, .35); ctx.fillStyle = ['#ef7a85', '#ffbf00', '#9b5de5'][(o.i + k) % 3];
            ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; ctx.moveTo(fx + Math.cos(a) * 2 + 1.4, fy + Math.sin(a) * 2); ctx.arc(fx + Math.cos(a) * 2, fy + Math.sin(a) * 2, 1.4, 0, TAU); } ctx.fill();
            noShadow(ctx); ctx.fillStyle = '#fff2c4'; ctx.beginPath(); ctx.arc(fx, fy, 1, 0, TAU); ctx.fill();
          }
        } else if (o.k === 'r') {
          paperShadow(ctx, f, 3, 1.5, .35); ctx.fillStyle = '#b8ab9a'; ctx.beginPath(); ctx.moveTo(x - 8, y + 1); ctx.quadraticCurveTo(x - 7, y - 8, x, y - 8); ctx.quadraticCurveTo(x + 8, y - 7, x + 8, y + 1); ctx.fill();
          noShadow(ctx); ctx.fillStyle = '#d6ccbd'; ctx.beginPath(); ctx.moveTo(x - 5, y - 4); ctx.quadraticCurveTo(x - 3, y - 7, x + 1, y - 7); ctx.quadraticCurveTo(x - 2, y - 5, x - 5, y - 4); ctx.fill();
        }
      }
      noShadow(ctx);
    },
    player(ctx, p, f) { ctx.save(); paperShadow(ctx, f, 2.5, 1.5, .4); drawHero(ctx, p, f, { lw: 1.3, line: '#fffaf0', body: '#e4572e', skin: '#f6d1b0', hair: '#3b2a20', scarf: '#f3a712', leg: '#29335c', eye: '#29335c' }); ctx.restore(); },
    coin(ctx, x, y, t, f) {
      const s = Math.cos(t * 2.8 + x * .05), yy = y + Math.sin(t * 3 + x) * 1.5;
      ctx.save(); ctx.translate(x, yy); ctx.scale(Math.max(.15, Math.abs(s)), 1);
      paperShadow(ctx, f, 2, 1.4, .4); ctx.beginPath(); ctx.arc(0, 0, 5.4, 0, TAU); ctx.fillStyle = '#f6a93b'; ctx.fill();
      noShadow(ctx); ctx.beginPath(); ctx.arc(0, 0, 3.8, 0, TAU); ctx.fillStyle = '#fbd27a'; ctx.fill();
      ctx.fillStyle = '#f6a93b'; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - Math.PI / 2, r = i % 2 ? 1.1 : 2.6; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.fill();
      ctx.restore();
    },
    goal(ctx, x, y, t, f) {
      ctx.save(); paperShadow(ctx, f, 3, 1.5, .4);
      ctx.fillStyle = '#8b5a3c'; ctx.fillRect(x - 1.2, y - 46, 2.4, 46);
      ctx.fillStyle = '#e83f6f'; ctx.beginPath(); ctx.moveTo(x + 1, y - 46); ctx.lineTo(x + 20 + Math.sin(t * 3) * 1.5, y - 40); ctx.lineTo(x + 1, y - 33); ctx.fill();
      noShadow(ctx); ctx.fillStyle = '#ffbf00'; ctx.beginPath(); ctx.arc(x + 7, y - 39.5, 2.2, 0, TAU); ctx.fill(); ctx.restore();
    },
    front(ctx, f) {},
    over(ctx, f) {
      // papel picado
      const par = .55, sp = 25, off = f.cam * par, k0 = Math.floor(off / sp) - 1;
      ctx.strokeStyle = '#6b4a3a'; ctx.lineWidth = .5; ctx.beginPath();
      const yAt = k => 3 + Math.sin(((wrap(k, 9)) / 9) * Math.PI) * 6;
      for (let k = k0; k <= k0 + VW / sp + 2; k++) { const x = k * sp - off; if (k === k0) ctx.moveTo(x, yAt(k)); else ctx.lineTo(x, yAt(k)); }
      ctx.stroke();
      for (let k = k0; k <= k0 + VW / sp + 2; k++) {
        if (wrap(k, 9) === 0) continue;
        const x = k * sp - off, y = yAt(k), sw = Math.sin(f.t * 1.6 + k * .9) * .07;
        ctx.save(); ctx.translate(x, y); ctx.rotate(sw); ctx.drawImage(picado(f, wrap(k, 6)), -12, -2, 24, 27); ctx.restore();
      }
      ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .55;
      ctx.drawImage(paperTex(f, 'grain', '#f6f1e8', { grain: 26, blot: 6, fibers: 12 }), 0, 0, VW, VH);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    },
  });

  // ======================= LOW POLY =======================
  function lpShade(base, k) { return k >= 0 ? mix(base, '#ffe6d0', k * .55) : mix(base, '#120c2a', -k * .7); }
  function lpMountains(x, w, base, amp, freq, seed, col, snowY) {
    const step = typeof freq === 'string' ? (freq === 'mid' ? 2 : 6) : 26, n = Math.ceil(w / step) + 2, Rp = [], Mp = [], Bp = [];
    for (let i = 0; i <= n; i++) {
      const xx = i * step + (R(i, seed) - .5) * (typeof freq === 'string' ? 0 : 12), y = typeof freq === 'string' ? base - CAMP.h(xx, freq, seed) * amp : base - Math.pow(fbm1(xx * freq, seed, 3), 1.25) * amp;
      Rp.push([xx, y]); Mp.push([xx + step * .5 + (R(i, seed + 1) - .5) * 8, lerp(y, VH, .45) + (R(i, seed + 2) - .5) * 10]); Bp.push([xx, VH + 4]);
    }
    const tri = (a, b, c, k) => { x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.lineTo(c[0], c[1]); x.closePath(); let cl = lpShade(col, k); const cy = (a[1] + b[1] + c[1]) / 3; if (snowY && cy < snowY) cl = mix(cl, '#efe9fb', .75); x.fillStyle = cl; x.strokeStyle = cl; x.lineWidth = .6; x.fill(); x.stroke(); };
    for (let i = 0; i < n; i++) {
      const a = Rp[i], b = Rp[i + 1], m = Mp[i], m2 = Mp[i + 1], s = (b[1] - a[1]) / (b[0] - a[0]);
      tri(a, b, m, clamp(s * 1.2, -1, 1) * .6 + (R(i, seed + 5) - .5) * .2);
      tri(b, m2, m, clamp(s * .8, -1, 1) * .35 - .15 + (R(i, seed + 6) - .5) * .2);
      tri(m, m2, Bp[i + 1], -.3 + (R(i, seed + 7) - .5) * .15);
      tri(m, Bp[i + 1], Bp[i], -.4 + (R(i, seed + 8) - .5) * .15);
    }
  }
  defStyle({
    id: 'lowpoly', name: 'Low poly', ref: 'Monument Valley · Lara Croft GO · poly art', order: 11,
    desc: 'Todo hecho de triángulos sombreados por la orientación de cada faceta, como papiroflexia digital.',
    fx: { dust: ['#d9c9ef', '#ffffff'], spark: ['#bff4ff', '#7fd8f0', '#ffffff'] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'sky', x => {
        const g = x.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#18204a'); g.addColorStop(.4, '#4b4581'); g.addColorStop(.68, '#b5617a'); g.addColorStop(.85, '#f09468'); x.fillStyle = g; x.fillRect(0, 0, VW, VH);
        ambient(40, 5, (i, a, b, c) => { x.fillStyle = `rgba(255,255,255,${.3 + c * .5})`; const sx = a * VW, sy = b * 90, r = .5 + c; x.beginPath(); x.moveTo(sx, sy - r); x.lineTo(sx + r * .6, sy); x.lineTo(sx, sy + r); x.lineTo(sx - r * .6, sy); x.fill(); });
        const cx = 120, cy = 62;
        for (let k = 3; k >= 0; k--) { x.fillStyle = k ? `rgba(255,214,150,${.08})` : '#ffd38a'; x.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .26; x.lineTo(cx + Math.cos(a) * (18 + k * 10), cy + Math.sin(a) * (18 + k * 10)); } x.fill(); }
        x.fillStyle = '#ffe6b3'; x.beginPath(); x.moveTo(cx, cy); for (let i = 0; i < 3; i++) { const a = i / 6 * TAU + .26 - Math.PI; x.lineTo(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18); } x.fill();
      });
      strip(ctx, f, 'm1', .1, (x, w) => lpMountains(x, w, 168, 1.6, 'far', 3, '#7a5f96', 0));
      strip(ctx, f, 'm2', .25, (x, w) => lpMountains(x, w, 188, 1.5, 'mid', 7, '#43376e', 0));
      strip(ctx, f, 'm3', .45, (x, w) => { lpMountains(x, w, 214, .95, 'near', 11, '#2d2a55', 0); x.beginPath(); for (const q of CAMP.props(0, w, 'near', 11)) { const b = 214 - CAMP.h(q.x, 'near', 11) * .95 + 3; if (q.k === 'palma') CAMP.palma(x, q.x, b, q.h * .95, q.lean, q.s); else CAMP.ceiba(x, q.x, b, q.h * .95, q.w * .95, q.s); } x.fillStyle = '#2d2a55'; x.fill(); });
    },
    terrain(ctx) {
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.fillStyle = '#3d2c50'; ctx.fill(); ctx.clip();
      const st = 12, gx = Math.ceil(L.ww / st) + 1, gy = Math.ceil((VH + 8) / st) + 1, P = [];
      for (let j = 0; j <= gy; j++) for (let i = 0; i <= gx; i++) P.push([i * st + (hash2(i, j, 3) - .5) * 9, j * st + (hash2(i, j, 4) - .5) * 9]);
      const at = (i, j) => P[j * (gx + 1) + i];
      for (let j = 7; j < gy; j++) for (let i = 0; i < gx; i++) {
        const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1);
        const tris = hash2(i, j, 5) < .5 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
        tris.forEach((t, k) => {
          const cx = (t[0][0] + t[1][0] + t[2][0]) / 3, cy = (t[0][1] + t[1][1] + t[2][1]) / 3;
          let dep = L.depth(cx, cy); if (dep < 0) dep = Math.max(0, L.depth(cx, cy + 6) - 6, L.depth(cx, cy - 6) + 6);
          const rr = hash2(i * 2 + k, j, 6);
          let col = dep < 9 ? mix('#3f9a72', '#86d29a', rr) : dep < 15 ? mix('#3e6e5e', '#4f5f63', rr) : mix('#523a62', '#6c4c72', rr);
          if (dep > 30) col = shade(col, -.15 - Math.min(.3, (dep - 30) / 120));
          ctx.beginPath(); ctx.moveTo(t[0][0], t[0][1]); ctx.lineTo(t[1][0], t[1][1]); ctx.lineTo(t[2][0], t[2][1]); ctx.closePath(); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = .5; ctx.fill(); ctx.stroke();
        });
      }
      ctx.restore();
      for (const r of L.tops) for (let x = r.x0; x < r.x1 - 1; x += 4) { const h = 2 + hash1(x, 9) * 3; ctx.fillStyle = hash1(x, 10) < .5 ? '#9be0ad' : '#5fb487'; ctx.beginPath(); ctx.moveTo(x, r.y + .5); ctx.lineTo(x + 2, r.y - h); ctx.lineTo(x + 4, r.y + .5); ctx.fill(); }
      for (const o of L.deco) {
        const x = o.x, y = o.y;
        if (o.k === 'T') {
          const palm = o.i % 2 === 1, TP = (pt) => { ctx.beginPath(); if (palm) CAMP.palma(ctx, x, y + 1, 50 + R(o.i, 1) * 14, (R(o.i, 2) - .5) * .5, o.i, 0, pt); else CAMP.ceiba(ctx, x, y + 1, 54 + R(o.i, 1) * 10, 44, o.i, pt); };
          TP('trunk'); ctx.fillStyle = '#4a3448'; ctx.fill(); TP('crown'); ctx.fillStyle = '#23524a'; ctx.fill(); ctx.save(); TP('crown'); ctx.clip(); ctx.fillStyle = '#3f8a6a'; ctx.beginPath(); ctx.moveTo(x, y - 90); ctx.lineTo(x + 40, y - 90); ctx.lineTo(x + 40, y); ctx.lineTo(x + 6, y - 40); ctx.fill(); ctx.restore();
        } else if (o.k === 'f') {
          for (let k = 0; k < 3; k++) { const fx = x - 6 + k * 6, h = 5 + (k % 2) * 3; ctx.fillStyle = '#3f8a6a'; ctx.beginPath(); ctx.moveTo(fx - 1, y); ctx.lineTo(fx, y - h); ctx.lineTo(fx + 1, y); ctx.fill(); ctx.fillStyle = ['#f39bb0', '#ffd166', '#c3a6ff'][(o.i + k) % 3]; ctx.beginPath(); ctx.moveTo(fx, y - h - 3); ctx.lineTo(fx + 2.2, y - h); ctx.lineTo(fx, y - h + 1); ctx.lineTo(fx - 2.2, y - h); ctx.fill(); }
        }
      }
    },
    player(ctx, p, f) { drawHero(ctx, p, f, { poly: 6, body: '#f08a5d', body2: '#c8653f', skin: '#f6c9a0', hair: '#2d2a4a', scarf: '#ffd166', leg: '#2d2a4a', eye: '#2d2a4a' }); },
    coin(ctx, x, y, t) {
      const s = Math.cos(t * 2.4 + x * .05), yy = y + Math.sin(t * 2.6 + x) * 1.6, w = 4.5 * s;
      glowDot(ctx, x, yy, 11, '#9fe8ff', .35);
      const T1 = [x, yy - 7], B1 = [x, yy + 7], Lp = [x - w, yy], Rp = [x + w, yy], C = [x + w * .2, yy - 1];
      const tri = (a, b, c, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.fill(); };
      tri(T1, Lp, C, s > 0 ? '#e2fbff' : '#5bbde0'); tri(T1, C, Rp, s > 0 ? '#8fdcf2' : '#bff4ff'); tri(B1, Lp, C, '#4aa6d4'); tri(B1, C, Rp, '#2f7fb4');
    },
    goal(ctx, x, y, t) {
      ctx.fillStyle = '#2d2a4a'; ctx.fillRect(x - 1, y - 46, 2, 46);
      const fl = Math.sin(t * 4) * 2;
      ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.moveTo(x + 1, y - 46); ctx.lineTo(x + 18, y - 41 + fl); ctx.lineTo(x + 1, y - 40); ctx.fill();
      ctx.fillStyle = '#f0a03c'; ctx.beginPath(); ctx.moveTo(x + 1, y - 40); ctx.lineTo(x + 18, y - 41 + fl); ctx.lineTo(x + 1, y - 34); ctx.fill();
    },
    particle(ctx, q) { const a = clamp(q.life / q.max, 0, 1), s = q.s * (q.k === 'dust' ? 1.3 : a); ctx.globalAlpha = a; ctx.fillStyle = q.c; ctx.beginPath(); ctx.moveTo(q.x + Math.cos(q.r) * s, q.y + Math.sin(q.r) * s); ctx.lineTo(q.x + Math.cos(q.r + 2.1) * s, q.y + Math.sin(q.r + 2.1) * s); ctx.lineTo(q.x + Math.cos(q.r + 4.2) * s, q.y + Math.sin(q.r + 4.2) * s); ctx.fill(); ctx.globalAlpha = 1; },
    over(ctx) { vignette(ctx, .3, '#120c2a'); },
  });

  // ======================= CODICE MAYA =======================
  const K = '#1c1612', RED = '#b0412e', OCH = '#d79a3d', MB = '#4a9eb0', JADE = '#4d8a5c', CRM = '#f1e2bd';
  function volute(ctx, x, y, s) {
    ctx.beginPath(); ctx.moveTo(x - s * 3, y + s * .4); ctx.bezierCurveTo(x - s * 2, y - s * 1.2, x - s * .4, y - s * 1.2, x, y - s * .2);
    for (let a = 0; a <= TAU * 1.3; a += .2) { const r = s * .9 * (1 - a / (TAU * 1.45)); ctx.lineTo(x + s * .3 + Math.cos(a + Math.PI) * r, y + s * .2 + Math.sin(a + Math.PI) * r); }
    ctx.stroke();
  }
  function pyramid(ctx, x, base, w, h, steps) {
    ctx.lineWidth = 1.1; ctx.strokeStyle = K;
    for (let i = 0; i < steps; i++) { const tw = w * (1 - i / steps * .62), th = h / steps; ctx.fillStyle = i % 2 ? '#e6c890' : '#dcb878'; ctx.beginPath(); ctx.rect(x - tw / 2, base - (i + 1) * th, tw, th); ctx.fill(); ctx.stroke(); }
    const sw = w * .14; ctx.fillStyle = '#c9a466'; ctx.beginPath(); ctx.rect(x - sw / 2, base - h, sw, h); ctx.fill(); ctx.stroke();
    ctx.beginPath(); for (let yy = base - h + 3; yy < base; yy += 3) { ctx.moveTo(x - sw / 2, yy); ctx.lineTo(x + sw / 2, yy); } ctx.lineWidth = .5; ctx.stroke();
    const tw = w * .26, th = h * .2; ctx.lineWidth = 1.1; ctx.fillStyle = RED; ctx.beginPath(); ctx.rect(x - tw / 2, base - h - th, tw, th); ctx.fill(); ctx.stroke();
    ctx.fillStyle = K; ctx.fillRect(x - tw * .15, base - h - th * .6, tw * .3, th * .6);
    ctx.fillStyle = '#e6c890'; ctx.beginPath(); ctx.rect(x - tw * .3, base - h - th - th * .7, tw * .6, th * .7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); for (let k = 0; k < 3; k++) ctx.rect(x - tw * .24 + k * tw * .17, base - h - th - th * .55, tw * .08, th * .35); ctx.fillStyle = K; ctx.fill();
  }
  defStyle({
    id: 'codex', name: 'Códice maya', ref: 'Códice de Dresde · murales de Bonampak', order: 12,
    desc: 'Línea negra firme, paleta de pigmentos (rojo, ocre, azul maya, jade), grecas escalonadas y pirámides al fondo.',
    fx: { dust: [CRM, '#e8d3a0'], spark: [JADE, OCH, '#86c29a'], confetti: [RED, OCH, MB, JADE, CRM] },
    sky(ctx, f) {
      ctx.drawImage(paperTex(f, 'amate', '#ecdcb4', { grain: 14, blot: 16, fibers: 22 }), 0, 0, VW, VH);
      // glifo solar
      const sx = 330 - f.cam * .04, sy = 58;
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(f.t * .05);
      ctx.lineWidth = 1.5; ctx.strokeStyle = K;
      for (let i = 0; i < 8; i++) { ctx.rotate(TAU / 8); ctx.beginPath(); ctx.moveTo(-5, -22); ctx.lineTo(0, -32); ctx.lineTo(5, -22); ctx.closePath(); ctx.fillStyle = i % 2 ? OCH : RED; ctx.fill(); ctx.stroke(); }
      ctx.restore();
      ctx.beginPath(); ctx.arc(sx, sy, 22, 0, TAU); ctx.fillStyle = OCH; ctx.fill(); ctx.lineWidth = 1.8; ctx.stroke();
      ctx.beginPath(); ctx.arc(sx, sy, 15, 0, TAU); ctx.fillStyle = RED; ctx.fill(); ctx.stroke();
      ctx.fillStyle = CRM; ctx.beginPath(); ctx.moveTo(sx, sy - 9); ctx.lineTo(sx + 9, sy); ctx.lineTo(sx, sy + 9); ctx.lineTo(sx - 9, sy); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(sx, sy, 2.5, 0, TAU); ctx.fillStyle = K; ctx.fill();
      ctx.strokeStyle = MB; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) { const x = wrap(i * 170 + 50 - f.cam * .08 - f.t * 2.5, VW + 120) - 60, y = 34 + i * 22; volute(ctx, x, y, 6); volute(ctx, x + 22, y + 4, 4.5); }
      strip(ctx, f, 'jungle', .16, (x, w) => {
        x.beginPath(); x.moveTo(0, VH); for (let xx = 0; xx <= w; xx += 3) x.lineTo(xx, 168 - fbm1(xx * .02, 4, 3) * 40); x.lineTo(w, VH); x.closePath();
        x.fillStyle = '#bcc497'; x.fill(); x.lineWidth = 1; x.strokeStyle = K; x.stroke();
        x.fillStyle = 'rgba(28,22,18,.18)'; for (let k = 0; k < w / 6; k++) { const xx = k * 6 + R(k, 2) * 4, yy = 172 - fbm1(xx * .02, 4, 3) * 40 + R(k, 3) * 30; x.beginPath(); x.arc(xx, yy, .8, 0, TAU); x.fill(); }
      });
      strip(ctx, f, 'pyr', .3, (x, w) => {
        for (let k = 0; k < w / 240; k++) { const px = 90 + k * 240 + R(k, 5) * 60, s = .75 + R(k, 6) * .45; pyramid(x, px, 184, 120 * s, 78 * s, 6); }
      });
    },
    terrain(ctx) {
      allLoopsPath(ctx, L.loops); ctx.fillStyle = RED; ctx.fill();
      ctx.save(); ctx.clip();
      ctx.fillStyle = 'rgba(241,226,189,.55)';
      for (let y = 0; y < VH + 8; y += 6) for (let x = (y / 6 % 2) * 3; x < L.ww; x += 6) if (L.depth(x, y) > 20) { ctx.beginPath(); ctx.arc(x, y, .85, 0, TAU); ctx.fill(); }
      for (const r of L.tops) {
        ctx.fillStyle = JADE; ctx.fillRect(r.x0, r.y, r.x1 - r.x0, 5);
        ctx.fillStyle = OCH; ctx.fillRect(r.x0, r.y + 5, r.x1 - r.x0, 9);
        ctx.strokeStyle = K; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(r.x0, r.y + 5); ctx.lineTo(r.x1, r.y + 5); ctx.moveTo(r.x0, r.y + 14); ctx.lineTo(r.x1, r.y + 14); ctx.stroke();
        ctx.lineWidth = 1; ctx.beginPath();
        for (let x = r.x0 + 1; x < r.x1 - 7; x += 8) { const y = r.y + 5; ctx.moveTo(x, y + 8); ctx.lineTo(x, y + 2); ctx.lineTo(x + 6, y + 2); ctx.lineTo(x + 6, y + 6.5); ctx.lineTo(x + 3, y + 6.5); ctx.lineTo(x + 3, y + 4.5); }
        ctx.stroke();
        ctx.fillStyle = '#86c29a'; for (let x = r.x0 + 4; x < r.x1; x += 8) { ctx.beginPath(); ctx.arc(x, r.y + 2.5, .9, 0, TAU); ctx.fill(); }
      }
      ctx.restore();
      allLoopsPath(ctx, L.loops); ctx.lineWidth = 2.2; ctx.strokeStyle = K; ctx.lineJoin = 'miter'; ctx.stroke();
      for (const o of L.deco) {
        const x = o.x, y = o.y; ctx.lineWidth = 1.4; ctx.strokeStyle = K;
        if (o.k === 'T') {
          ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.quadraticCurveTo(x - 3, y - 4, x - 3, y - 28); ctx.lineTo(x + 3, y - 28); ctx.quadraticCurveTo(x + 3, y - 4, x + 8, y); ctx.closePath(); ctx.fillStyle = OCH; ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x - 1, y - 4); ctx.lineTo(x - 1, y - 24); ctx.moveTo(x + 1.5, y - 8); ctx.lineTo(x + 1.5, y - 22); ctx.lineWidth = .6; ctx.stroke(); ctx.lineWidth = 1.4;
          const lobes = [[x - 13, y - 38, 10], [x + 13, y - 38, 10], [x, y - 46, 12]];
          for (const [cx, cy, r] of lobes) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fillStyle = JADE; ctx.fill(); ctx.stroke(); }
          ctx.lineWidth = .8; for (const [cx, cy, r] of lobes) { ctx.beginPath(); for (let a = 0; a < TAU * 1.4; a += .25) { const rr = r * .62 * (1 - a / (TAU * 1.5)); ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } ctx.stroke(); }
          ctx.fillStyle = RED; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(x - 12 + k * 8, y - 29 - (k % 2) * 3, 1.6, 0, TAU); ctx.fill(); ctx.lineWidth = .7; ctx.stroke(); }
        } else if (o.k === 'f') {
          for (let k = 0; k < 2; k++) {
            const fx = x - 4 + k * 8, fy = y - 8 - (k % 2) * 3;
            ctx.beginPath(); ctx.moveTo(fx, y); ctx.lineTo(fx, fy); ctx.lineWidth = 1; ctx.stroke();
            for (let i = 0; i < 4; i++) { const a = i / 4 * TAU; ctx.beginPath(); ctx.ellipse(fx + Math.cos(a) * 2.4, fy + Math.sin(a) * 2.4, 1.9, 1.3, a, 0, TAU); ctx.fillStyle = k ? RED : MB; ctx.fill(); ctx.lineWidth = .8; ctx.stroke(); }
            ctx.beginPath(); ctx.arc(fx, fy, 1.3, 0, TAU); ctx.fillStyle = OCH; ctx.fill(); ctx.stroke();
          }
        } else if (o.k === 'r') {
          ctx.beginPath(); roundRect(ctx, x - 7, y - 10, 14, 10, 2); ctx.fillStyle = '#cdb48a'; ctx.fill(); ctx.stroke();
          ctx.beginPath(); roundRect(ctx, x - 4.5, y - 8, 9, 6, 2); ctx.lineWidth = .8; ctx.stroke(); ctx.beginPath(); ctx.arc(x - 1.5, y - 5, .8, 0, TAU); ctx.arc(x + 1.8, y - 5, .8, 0, TAU); ctx.fillStyle = K; ctx.fill();
        }
      }
    },
    player(ctx, p, f) { drawHero(ctx, p, f, { lw: 1.25, line: K, body: MB, skin: '#b8774a', hair: K, scarf: RED, leg: OCH, eye: K, feather: '#3f9a5c' }); },
    coin(ctx, x, y, t) {
      const yy = y + Math.sin(t * 2.6 + x) * 1.5, s = .8 + Math.sin(t * 4 + x) * .08;
      ctx.beginPath(); ctx.arc(x, yy, 5 * s, 0, TAU); ctx.fillStyle = JADE; ctx.fill(); ctx.lineWidth = 1.3; ctx.strokeStyle = K; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, yy, 3 * s, 0, TAU); ctx.strokeStyle = '#86c29a'; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, yy, 1.2, 0, TAU); ctx.fillStyle = CRM; ctx.fill(); ctx.lineWidth = .6; ctx.strokeStyle = K; ctx.stroke();
    },
    goal(ctx, x, y, t) {
      ctx.lineWidth = 1.5; ctx.strokeStyle = K;
      ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x - 7, y - 34); ctx.quadraticCurveTo(x, y - 42, x + 7, y - 34); ctx.lineTo(x + 7, y); ctx.closePath(); ctx.fillStyle = '#d8c094'; ctx.fill(); ctx.stroke();
      for (let k = 0; k < 3; k++) { ctx.beginPath(); roundRect(ctx, x - 4.5, y - 31 + k * 9, 9, 7, 2); ctx.fillStyle = [RED, MB, JADE][k]; ctx.fill(); ctx.lineWidth = .9; ctx.stroke(); ctx.beginPath(); ctx.arc(x - 1.5, y - 27.5 + k * 9, .8, 0, TAU); ctx.arc(x + 1.5, y - 27.5 + k * 9, .8, 0, TAU); ctx.fillStyle = K; ctx.fill(); }
      const gl = .5 + Math.sin(t * 3) * .2; glowDot(ctx, x, y - 40, 14, '#ffd27a', gl * .6);
    },
    particle(ctx, q) { const a = clamp(q.life / q.max, 0, 1), s = q.s * (q.k === 'dust' ? 1.2 : a + .3); ctx.globalAlpha = a; ctx.fillStyle = q.c; ctx.strokeStyle = K; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(q.x, q.y - s); ctx.lineTo(q.x + s, q.y); ctx.lineTo(q.x, q.y + s); ctx.lineTo(q.x - s, q.y); ctx.closePath(); ctx.fill(); if (q.k !== 'dust') ctx.stroke(); ctx.globalAlpha = 1; },
    over(ctx, f) { ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .5; ctx.drawImage(paperTex(f, 'amgrain', '#f4ecdc', { grain: 24, blot: 14, fibers: 26 }), 0, 0, VW, VH); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; vignette(ctx, .22, '#5a3a1a'); },
  });

  // ======================= PLANO TECNICO =======================
  const WL = 'rgba(235,245,255,.92)';
  function arrowHead(ctx, x, y, dir) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - dir * 2.2, y - 1.1); ctx.lineTo(x - dir * 2.2, y + 1.1); ctx.closePath(); ctx.fill(); }

  // ======================= VITRAL =======================
  function glassQuads(ctx, x0, y0, x1, y1, cell, colorFn, seed, lead) {
    const gx = Math.ceil((x1 - x0) / cell) + 1, gy = Math.ceil((y1 - y0) / cell) + 1, P = [];
    for (let j = 0; j <= gy; j++) for (let i = 0; i <= gx; i++) { const edge = i === 0 || j === 0 || i === gx || j === gy; P.push([x0 + i * cell + (edge ? 0 : (hash2(i, j, seed) - .5) * cell * .7), y0 + j * cell + (edge ? 0 : (hash2(i, j, seed + 1) - .5) * cell * .7)]); }
    const at = (i, j) => P[j * (gx + 1) + i];
    for (let j = 0; j < gy; j++) for (let i = 0; i < gx; i++) {
      const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1);
      const split = hash2(i, j, seed + 2) < .3;
      const polys = split ? [[a, b, c], [a, c, d]] : [[a, b, c, d]];
      polys.forEach((pl, k) => {
        const cx = pl.reduce((s, q) => s + q[0], 0) / pl.length, cy = pl.reduce((s, q) => s + q[1], 0) / pl.length;
        const col = colorFn(cx, cy, hash2(i * 3 + k, j, seed + 3));
        if (!col) return;
        ctx.beginPath(); pl.forEach(q => ctx.lineTo(q[0], q[1])); ctx.closePath();
        const g = ctx.createLinearGradient(cx - cell * .5, cy - cell * .5, cx + cell * .5, cy + cell * .5); g.addColorStop(0, shade(col, .22)); g.addColorStop(1, shade(col, -.18));
        ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = lead; ctx.strokeStyle = '#141414'; ctx.lineJoin = 'round'; ctx.stroke();
      });
    }
  }
  const pick = (arr, r) => arr[Math.floor(r * arr.length) % arr.length];
  // Árboles de vitral con pocas piezas grandes y una silueta continua.
  function arbolVitral(ctx, x, y, palma, altura) {
    ctx.save(); ctx.translate(x, y); ctx.strokeStyle = '#25251f'; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-4, 0); ctx.quadraticCurveTo(-2, -altura * .23, -2, -altura * .68); ctx.lineTo(2, -altura * .68); ctx.quadraticCurveTo(2, -altura * .23, 4, 0); ctx.closePath();
    ctx.fillStyle = '#9a5d31'; ctx.fill(); ctx.lineWidth = 1; ctx.stroke();
    if (palma) {
      const cy = -altura * .68;
      const hojas = [[-23,-13,-12,-15],[-17,-24,-7,-17],[-7,-29,0,-18],[7,-28,3,-18],[18,-23,9,-15],[24,-11,13,-12]];
      hojas.forEach(([ex,ey,mx,my], i) => {
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.quadraticCurveTo(mx, cy + my, ex, cy + ey); ctx.quadraticCurveTo(mx * .7, cy + my + 7, 0, cy + 3); ctx.closePath();
        ctx.fillStyle = ['#57995a', '#79b86b', '#3f8050'][i % 3]; ctx.fill(); ctx.lineWidth = .8; ctx.stroke();
      });
    } else {
      const top = -altura * .88, centro = -altura * .62;
      ctx.beginPath(); ctx.moveTo(-22, centro + 4); ctx.quadraticCurveTo(-27, centro - 5, -19, centro - 10); ctx.quadraticCurveTo(-19, top + 2, -10, top + 4); ctx.quadraticCurveTo(0, top - 5, 9, top + 4); ctx.quadraticCurveTo(20, top + 2, 20, centro - 10); ctx.quadraticCurveTo(27, centro - 5, 22, centro + 4); ctx.quadraticCurveTo(0, centro + 9, -22, centro + 4); ctx.closePath();
      ctx.fillStyle = '#57a665'; ctx.fill(); ctx.lineWidth = 1.2; ctx.stroke();
      ctx.save(); ctx.clip();
      ctx.fillStyle = '#79bf78'; ctx.beginPath(); ctx.moveTo(-22, centro + 4); ctx.lineTo(-13, top + 4); ctx.lineTo(-3, centro - 1); ctx.lineTo(-7, centro + 8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#3d8c55'; ctx.beginPath(); ctx.moveTo(4, centro + 7); ctx.lineTo(10, top + 3); ctx.lineTo(23, centro - 6); ctx.lineTo(22, centro + 5); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#28553c'; ctx.lineWidth = .65; ctx.beginPath(); ctx.moveTo(-13, top + 3); ctx.lineTo(-3, centro - 1); ctx.lineTo(-7, centro + 8); ctx.moveTo(10, top + 3); ctx.lineTo(3, centro + 2); ctx.lineTo(8, centro + 8); ctx.moveTo(-23, centro); ctx.quadraticCurveTo(0, centro - 4, 23, centro); ctx.stroke(); ctx.restore();
    }
    ctx.restore();
  }
  defStyle({
    id: 'vitral', name: 'Vitral', ref: 'Vitrales góticos · Hollow Knight (Lugar de descanso)', order: 14,
    desc: 'Piezas de vidrio de color unidas con plomo; la luz atraviesa el rosetón y brilla sobre todo.',
    fx: { dust: ['#ffe9b0', '#ffffff'], spark: ['#ffd36b', '#ffffff', '#ff9f43'] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'sky', x => {
        const sky = ['#1d3570', '#2b4f96', '#3f6fb5', '#5f93cf', '#8dbbe2', '#b9d8ee'];
        glassQuads(x, 0, 0, VW, VH, 24, (cx, cy, r) => { if (r > .96) return '#e6c35a'; if (r < .03) return '#7a3fa0'; return jitterColor(sky[clamp(Math.floor(cy / VH * 6 + (r - .5) * .9), 0, 5)], .06, hash1(cx | 0, cy | 0)); }, 3, 2);
        const cx = 320, cy = 66;
        x.lineWidth = 1.6; x.strokeStyle = '#141414';
        for (let i = 0; i < 16; i++) { const a0 = i / 16 * TAU, a1 = (i + 1) / 16 * TAU; x.beginPath(); x.arc(cx, cy, 34, a0, a1); x.arc(cx, cy, 22, a1, a0, true); x.closePath(); x.fillStyle = i % 2 ? '#c8402e' : '#f2a33a'; x.fill(); x.stroke(); }
        for (let i = 0; i < 8; i++) { const a0 = i / 8 * TAU, a1 = (i + 1) / 8 * TAU; x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, 22, a0, a1); x.closePath(); x.fillStyle = i % 2 ? '#ffd36b' : '#ffb43a'; x.fill(); x.stroke(); }
        x.beginPath(); x.arc(cx, cy, 7, 0, TAU); x.fillStyle = '#fff1b8'; x.fill(); x.stroke();
        x.beginPath(); x.arc(cx, cy, 34, 0, TAU); x.lineWidth = 2.4; x.stroke();
      });
      ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 320, 66, 70, '#ffcf70', .22 + Math.sin(f.t * 1.3) * .04); ctx.globalCompositeOperation = 'source-over';
      strip(ctx, f, 'mts', .25, (x, w) => {
        x.save(); x.beginPath(); x.moveTo(0, VH); for (let xx = 0; xx <= w; xx += 1.5) x.lineTo(xx, 186 - CAMP.h(xx, 'mid', 6) * 1.6); x.lineTo(w, VH); x.closePath(); x.clip();
        glassQuads(x, 0, 60, w, VH, 18, (cx, cy, r) => jitterColor(pick(['#3c2f6e', '#4b3d88', '#2f5a7a', '#5b4b9a'], r), .05, r), 9, 1.5);
        x.restore();
        x.beginPath(); for (let xx = 0; xx <= w; xx += 1.5) x.lineTo(xx, 186 - CAMP.h(xx, 'mid', 6) * 1.6); x.lineWidth = 2; x.strokeStyle = '#141414'; x.stroke();
        for (const fa of CAMP.facades(0, w, 6)) { const top = 186 - (4 + fa.h) * 1.6; x.fillStyle = '#ffd36b'; const n = Math.max(1, Math.floor(fa.w / 7)), gp = fa.w / n; for (let i = 0; i < n; i++) { const wx = fa.x0 + gp * (i + .5); x.beginPath(); x.moveTo(wx - 1.8, top + 15); x.lineTo(wx - 1.8, top + 9); x.arc(wx, top + 9, 1.8, Math.PI, 0); x.lineTo(wx + 1.8, top + 15); x.closePath(); x.fill(); x.lineWidth = 1; x.stroke(); } x.beginPath(); x.moveTo(fa.x0, top); x.lineTo(fa.x0, 186); x.lineWidth = 1.3; x.stroke(); }
      });
    },
    terrain(ctx) {
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip();
      glassQuads(ctx, 0, 0, L.ww, VH + 8, 11, (cx, cy, r) => {
        let d = L.depth(cx, cy); if (d < 0) d = Math.max(L.depth(cx, cy + 5) - 5, L.depth(cx, cy - 5) + 5, 0);
        if (d < 11) return pick(['#2f8a46', '#4fb05a', '#7ccf6a', '#3d9a50'], r);
        if (r > .97) return '#9c2a3a';
        return shade(pick(['#9a5a26', '#c07a32', '#e0a246', '#7a3e1c', '#b06a2a'], r), -Math.min(.35, d / 220));
      }, 17, 1.3);
      ctx.restore();
      allLoopsPath(ctx, L.loops); ctx.lineWidth = 2.4; ctx.strokeStyle = '#141414'; ctx.stroke();
      for (const o of L.deco) {
        const x = o.x, y = o.y; ctx.strokeStyle = '#141414';
        if (o.k === 'T') {
          arbolVitral(ctx, x, y + 1, o.i % 2 === 1, 50 + R(o.i, 1) * 10);
        } else if (o.k === 'f') {
          for (let k = 0; k < 2; k++) { const fx = x - 4 + k * 8, fy = y - 7 - k * 2; ctx.beginPath(); ctx.moveTo(fx, y); ctx.lineTo(fx, fy); ctx.lineWidth = 1.6; ctx.stroke(); ctx.lineWidth = .8; ctx.strokeStyle = '#4fb05a'; ctx.stroke(); ctx.strokeStyle = '#141414'; for (let i = 0; i < 5; i++) x0(ctx, fx, fy, 3.4, i / 5 * TAU, (i + 1) / 5 * TAU, i % 2 ? '#c0392b' : '#e74c3c', 1.2); ctx.beginPath(); ctx.arc(fx, fy, 1.2, 0, TAU); ctx.fillStyle = '#ffd36b'; ctx.fill(); ctx.lineWidth = .8; ctx.stroke(); }
        } else if (o.k === 'r') {
          ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x - 5, y - 7); ctx.lineTo(x + 3, y - 8); ctx.lineTo(x + 8, y); ctx.closePath(); ctx.fillStyle = '#6f86a8'; ctx.fill(); ctx.lineWidth = 1.5; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x - 5, y - 7); ctx.lineTo(x, y); ctx.lineTo(x + 3, y - 8); ctx.lineWidth = 1; ctx.stroke();
        }
      }
    },
    player(ctx, p, f) { drawHero(ctx, p, f, { lw: 1.3, line: '#141414', body: '#c0392b', body2: '#e2574a', skin: '#f3d6b4', hair: '#2c2a60', scarf: '#f1c40f', leg: '#2c2a60', eye: '#141414' }); },
    coin(ctx, x, y, t) {
      const yy = y + Math.sin(t * 2.6 + x) * 1.5;
      ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, yy, 12, '#ffb43a', .35 + Math.sin(t * 5 + x) * .1); ctx.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.translate(x, yy); ctx.rotate(t * .8);
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 5, i / 6 * TAU, (i + 1) / 6 * TAU); ctx.closePath(); ctx.fillStyle = i % 2 ? '#ffb43a' : '#ffd36b'; ctx.fill(); ctx.lineWidth = .7; ctx.strokeStyle = '#141414'; ctx.stroke(); }
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore();
    },
    goal(ctx, x, y, t) {
      ctx.fillStyle = '#141414'; ctx.fillRect(x - 1.2, y - 46, 2.4, 46);
      const w = Math.sin(t * 3) * 1.2;
      const pc = [[[x + 1, y - 46], [x + 10, y - 44 + w], [x + 10, y - 37 + w], [x + 1, y - 38]], [[x + 10, y - 44 + w], [x + 19, y - 41 + w * 1.5], [x + 10, y - 37 + w]]];
      pc.forEach((pl, k) => { ctx.beginPath(); pl.forEach(q => ctx.lineTo(q[0], q[1])); ctx.closePath(); ctx.fillStyle = k ? '#ffd36b' : '#7a3fa0'; ctx.fill(); ctx.lineWidth = 1.1; ctx.strokeStyle = '#141414'; ctx.stroke(); });
    },
    over(ctx, f) {
      const p = wrap(f.t * 30, VW * 2) - VW * .5;
      const g = ctx.createLinearGradient(p - 60, 0, p + 60, VH * .4); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,250,220,.12)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH); ctx.globalCompositeOperation = 'source-over';
      vignette(ctx, .45, '#0a0a14');
    },
  });
  // cuña de vidrio
  function x0(ctx, cx, cy, r, a0, a1, col, ri) { ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1); ctx.arc(cx, cy, ri, a1, a0, true); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 1.1; ctx.strokeStyle = '#141414'; ctx.stroke(); }
})();
