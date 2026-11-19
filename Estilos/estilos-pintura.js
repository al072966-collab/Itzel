'use strict';
// =====================================================================
//  Estilos pintados a mano: acuarela, óleo, tinta sumi-e,
//  cuaderno a lápiz, crayón, grabado en linóleo
// =====================================================================
(function () {
  const R = (i, s) => hash1(i, s);
  const grainMul = (ctx, f, a = .55, name = 'g', o = { grain: 28, blot: 12, fibers: 10 }) => { ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = a; ctx.drawImage(paperTex(f, name, '#f7f3ea', o), 0, 0, VW, VH); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; };
  function ridgeAt(xx, base, amp, fr, seed, oct = 4) { return typeof fr === 'string' ? base - CAMP.h(xx, fr, seed) * amp : base - fbm1(xx * fr, seed, oct) * amp; }
  function ridgeFill(x, w, base, amp, fr, seed, step = 3, j = 0, jseed = 0) { x.beginPath(); x.moveTo(-2, VH + 4); for (let xx = -2; xx <= w + 2; xx += step) x.lineTo(xx, ridgeAt(xx, base, amp, fr, seed) + (j ? (noise1(xx * .08, jseed) - .5) * j : 0)); x.lineTo(w + 2, VH + 4); x.closePath(); }
  function ridgeLine(x, w, base, amp, fr, seed, step = 3, dy = 0) { x.beginPath(); for (let xx = -2; xx <= w + 2; xx += step) x.lineTo(xx, ridgeAt(xx, base, amp, fr, seed) + dy); }

  // ======================= ACUARELA =======================
  function wcWash(x, f, pathFn, col, o = {}) {
    const passes = o.passes || 5, a = o.alpha || .16, r = rng(o.seed || 1);
    for (let i = 0; i < passes; i++) { x.save(); x.translate((r() - .5) * (o.jit ?? 2), (r() - .5) * (o.jit ?? 2)); pathFn(i); x.globalAlpha = a; x.fillStyle = col; x.fill(); x.restore(); }
    pathFn(0); x.save(); x.filter = `blur(${.7 * f.S}px)`; x.globalAlpha = o.edge ?? .35; x.lineWidth = 1.1; x.strokeStyle = shade(col, -.3); x.stroke(); x.restore();
  }
  function granulate(x, col, x0, y0, w, h, n, seed, a = .18) { const r = rng(seed); x.fillStyle = rgba(col, a); for (let i = 0; i < n; i++) { x.beginPath(); x.arc(x0 + r() * w, y0 + r() * h, .25 + r() * .55, 0, TAU); x.fill(); } }
  defStyle({
    id: 'acuarela', name: 'Acuarela y tinta', ref: 'Ghibli (fondos) · Gris · libros ilustrados', order: 3,
    desc: 'Lavados transparentes que se acumulan en los bordes, flores de agua, granulado del pigmento y línea de tinta sepia.',
    fx: { dust: ['#e9dcc4', '#f2e8d6'], spark: ['#e8b84a', '#d9655b', '#ffffff'], confetti: ['#d9655b', '#e8b84a', '#6f8fcf', '#7fae5a'] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'sky', x => {
        x.drawImage(paperTex(f, 'wcpaper', '#f6efe1', { grain: 10, blot: 8 }), 0, 0, VW, VH);
        x.save(); x.filter = `blur(${10 * f.S}px)`;
        const r = rng(4);
        for (let i = 0; i < 26; i++) { x.globalAlpha = .1 + r() * .12; x.fillStyle = r() < .2 ? '#a8c8e0' : '#7fb0d4'; x.beginPath(); x.ellipse(r() * VW, r() * 90 - 10, 40 + r() * 70, 18 + r() * 30, 0, 0, TAU); x.fill(); }
        for (let i = 0; i < 6; i++) { x.globalAlpha = .55; x.fillStyle = '#f6efe1'; x.beginPath(); x.ellipse(40 + i * 75 + r() * 30, 50 + r() * 40, 26 + r() * 20, 8 + r() * 6, 0, 0, TAU); x.fill(); }
        x.globalAlpha = .28; x.fillStyle = '#f0c48a'; x.beginPath(); x.ellipse(VW * .6, 165, 220, 40, 0, 0, TAU); x.fill();
        x.restore();
        x.globalAlpha = .9; x.fillStyle = '#f7e3b0'; x.beginPath(); x.arc(320, 84, 14, 0, TAU); x.fill(); x.globalAlpha = 1;
        x.strokeStyle = 'rgba(200,150,80,.35)'; x.lineWidth = .8; x.beginPath(); x.arc(320, 84, 14, 0, TAU); x.stroke();
      });
      const hills = [[.1, 160, 1.15, 'far', '#8aa6c4', 2], [.22, 180, 1.35, 'mid', '#c9b8a0', 5], [.38, 204, .9, 'near', '#6f9a6a', 9]];
      for (const [par, base, amp, fr, col, seed] of hills) strip(ctx, f, 'h' + seed, par, (x, w) => {
        wcWash(x, f, i => ridgeFill(x, w, base, amp, fr, seed, 3, 2.5, seed * 10 + i), col, { passes: 5, alpha: .2, seed });
        x.save(); ridgeFill(x, w, base, amp, fr, seed); x.clip(); granulate(x, shade(col, -.4), 0, base - amp, w, VH, w * 1.2, seed);
        if (fr === 'mid') { for (const fa of CAMP.facades(0, w, seed)) { x.globalAlpha = .3; x.fillStyle = CAMP.FACHADAS[fa.col]; x.fillRect(fa.x0 + .6, base - (4 + fa.h) * amp + 1, fa.w - 1.2, (4 + fa.h) * amp); x.globalAlpha = .55; x.fillStyle = '#5a6a8a'; const n = Math.max(1, Math.floor(fa.w / 6.5)), gp = fa.w / n; for (let i = 0; i < n; i++) { const wx = fa.x0 + gp * (i + .5); x.fillRect(wx - 1, base - (4 + fa.h) * amp + 6, 2, 4.5); } x.globalAlpha = 1; } }
        if (fr === 'near') { x.globalAlpha = .45; x.fillStyle = '#4f7f50'; x.beginPath(); for (const q of CAMP.props(0, w, 'near', seed)) { const b = ridgeAt(q.x, base, amp, fr, seed) + 3; if (q.k === 'ceiba') CAMP.ceiba(x, q.x, b, q.h * amp, q.w * amp, q.s); else CAMP.palma(x, q.x, b, q.h * amp, q.lean, q.s); } x.fill(); x.globalAlpha = 1; }
        x.restore();
        x.save(); x.globalCompositeOperation = 'destination-out'; const g = x.createLinearGradient(0, base - 10, 0, base + 40); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.75)'); x.fillStyle = g; x.fillRect(0, base - 10, w, VH); x.restore();
      });
    },
    terrain(ctx, f) {
      const lp = organicLoops({ smooth: 2, step: 3, amp: 1.2, freq: .15, seed: 3 });
      const P = () => { ctx.beginPath(); for (const l of lp) pathPts(ctx, l); };
      wcWash(ctx, f, P, '#d6b37c', { passes: 4, alpha: .3, jit: 1.2, seed: 2, edge: .25 });
      ctx.save(); P(); ctx.clip();
      ctx.filter = `blur(${5 * f.S}px)`; const r = rng(8);
      for (let i = 0; i < 260; i++) { const x = r() * L.ww, y = 150 + r() * 100, d = L.depth(x, y); if (d < 10) continue; ctx.globalAlpha = .22; ctx.fillStyle = d > 34 ? (r() < .6 ? '#8a7aa8' : '#7a6a9a') : ['#b97f4e', '#c9925a', '#a86a42'][(r() * 3) | 0]; ctx.beginPath(); ctx.ellipse(x, y, 8 + r() * 18, 5 + r() * 8, 0, 0, TAU); ctx.fill(); }
      ctx.globalAlpha = .35; const gb = ctx.createLinearGradient(0, 200, 0, VH); gb.addColorStop(0, 'rgba(110,90,150,0)'); gb.addColorStop(1, 'rgba(110,90,150,.6)'); ctx.fillStyle = gb; ctx.fillRect(0, 200, L.ww, VH);
      ctx.filter = 'none'; ctx.globalAlpha = 1;
      granulate(ctx, '#6e4e30', 0, 100, L.ww, 150, 3000, 9, .2);
      // pinceladas húmedas sueltas, retornos de agua y piedritas con borde mojado
      ctx.filter = `blur(${1.6 * f.S}px)`; ctx.lineCap = 'round';
      for (const [dy, col, lw] of [[16, '#a86a42', 7], [36, '#8a7aa8', 10], [60, '#7a6a9a', 12]]) for (const t of L.tops) {
        ctx.strokeStyle = rgba(col, .3); ctx.lineWidth = lw; ctx.beginPath();
        for (let x = t.x0; x <= t.x1; x += 6) ctx.lineTo(x, t.y + dy + (noise1(x * .03, dy) - .5) * 11);
        ctx.stroke();
      }
      ctx.filter = 'none';
      const rb = rng(52);
      for (let i = 0; i < L.ww / 11; i++) {
        const x = rb() * L.ww, y = 20 + rb() * 215, rr = 5 + rb() * 10, s = (rb() * 99) | 0; if (L.depth(x, y) < 12) continue;
        ctx.beginPath(); for (let k = 0; k < 30; k++) { const a = k / 30 * TAU, q = rr * (.8 + noise1(k * .55, s) * .35 + (noise1(k * 2.6, s + 1) - .5) * .22); ctx.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q * .75); } ctx.closePath();
        ctx.fillStyle = 'rgba(255,240,214,.16)'; ctx.fill(); ctx.strokeStyle = 'rgba(120,80,50,.3)'; ctx.lineWidth = .5; ctx.stroke();
      }
      for (let i = 0; i < L.ww / 8; i++) {
        const x = rb() * L.ww, y = 20 + rb() * 215, w = 1.6 + rb() * 3.2, a = rb() * 3; if (L.depth(x, y) < 12) continue;
        ctx.beginPath(); ctx.ellipse(x, y, w, w * .68, a, 0, TAU); ctx.fillStyle = 'rgba(201,176,148,.5)'; ctx.fill(); ctx.strokeStyle = 'rgba(110,78,48,.5)'; ctx.lineWidth = .4; ctx.stroke();
        ctx.fillStyle = 'rgba(255,250,235,.55)'; ctx.beginPath(); ctx.arc(x - w * .3, y - w * .22, w * .2, 0, TAU); ctx.fill();
      }
      ctx.restore();
      for (const t of L.tops) {
        const band = (i) => { ctx.beginPath(); ctx.moveTo(t.x0 - 2, t.y - 1.5); for (let x = t.x0 - 2; x <= t.x1 + 2; x += 3) ctx.lineTo(x, t.y - 1.8 + Math.sin(x * .4 + i) * .6); for (let x = t.x1 + 2; x >= t.x0 - 2; x -= 3) ctx.lineTo(x, t.y + 6 + (noise1(x * .15, i + 3) - .5) * 5); ctx.closePath(); };
        wcWash(ctx, f, band, '#6f9f45', { passes: 4, alpha: .45, jit: .8, seed: t.x0 | 0, edge: .55 });
        const band2 = (i) => { ctx.beginPath(); ctx.moveTo(t.x0 - 1, t.y - 1.5); for (let x = t.x0 - 1; x <= t.x1 + 1; x += 3) ctx.lineTo(x, t.y - 1.6); for (let x = t.x1 + 1; x >= t.x0 - 1; x -= 3) ctx.lineTo(x, t.y + 2 + (noise1(x * .2, i + 9) - .5) * 2.5); ctx.closePath(); };
        wcWash(ctx, f, band2, '#a9cf6a', { passes: 2, alpha: .5, jit: .5, seed: (t.x0 | 0) + 1, edge: .2 });
        ctx.strokeStyle = 'rgba(60,90,40,.55)'; ctx.lineWidth = .5; ctx.beginPath(); for (let x = t.x0 + 1; x < t.x1 - 1; x += 2 + R(x | 0, 7) * 4) { const h = 1.5 + R(x | 0, 8) * 3; ctx.moveTo(x, t.y + .5); ctx.lineTo(x + (R(x | 0, 9) - .5) * 1.5, t.y - h); } ctx.stroke();
      }
      ctx.save(); ctx.strokeStyle = 'rgba(70,52,38,.8)'; ctx.lineWidth = .7; ctx.lineJoin = 'round';
      for (const l of lp) { ctx.beginPath(); pathPts(ctx, jitterPts(l, .5, .4, 7)); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(70,52,38,.25)'; for (const l of lp) { ctx.beginPath(); pathPts(ctx, jitterPts(l, 1, .3, 11)); ctx.stroke(); }
      ctx.restore();
      for (const o of L.deco) {
        const x = o.x, y = o.y;
        if (o.k === 'T') {
          const palm = o.i % 2 === 1, TP = (pt) => { ctx.beginPath(); if (palm) CAMP.palma(ctx, x, y + 1, 50 + R(o.i, 1) * 14, (R(o.i, 2) - .5) * .5, o.i, 0, pt); else CAMP.ceiba(ctx, x, y + 1, 54 + R(o.i, 1) * 10, 44, o.i, pt); };
          ctx.save(); ctx.globalAlpha = .7; TP('trunk'); ctx.fillStyle = '#8a6a50'; ctx.fill();
          ctx.globalAlpha = .45; TP('crown'); ctx.fillStyle = palm ? '#7fae5a' : '#6f9f55'; ctx.fill(); ctx.globalAlpha = .3; ctx.translate(1.4, 1); TP('crown'); ctx.fillStyle = '#3f6a3a'; ctx.fill(); ctx.restore();
          ctx.save(); ctx.globalAlpha = .5; ctx.strokeStyle = '#4a3a2a'; ctx.lineWidth = .45; TP(); ctx.stroke(); ctx.restore();
        } else if (o.k === 'f') {
          for (let k = 0; k < 4; k++) { const fx = x - 7 + k * 4.5, fy = y - 5 - (k % 2) * 3; ctx.strokeStyle = 'rgba(70,90,50,.8)'; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(fx, y); ctx.quadraticCurveTo(fx + 1, y - 3, fx, fy); ctx.stroke(); ctx.globalAlpha = .75; ctx.fillStyle = ['#d9655b', '#e8b84a', '#6f8fcf', '#e89ab0'][(o.i + k) % 4]; ctx.beginPath(); ctx.arc(fx, fy, 1.8, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
        } else if (o.k === 'r') {
          wcWash(ctx, f, () => { ctx.beginPath(); ctx.moveTo(x - 9, y + 1); ctx.quadraticCurveTo(x - 7, y - 8, x, y - 8); ctx.quadraticCurveTo(x + 8, y - 7, x + 9, y + 1); ctx.closePath(); }, '#8f9bb0', { passes: 3, alpha: .35, seed: o.i, edge: .5 });
        }
      }
    },
    player(ctx, p, f) { ctx.globalAlpha = .95; drawHero(ctx, p, f, { lw: .75, line: '#3a2e2a', body: '#d9655b', skin: '#f6dcc2', hair: '#5a3e33', scarf: '#e8b84a', leg: '#4a5a7a', eye: '#3a2e2a', cheek: 'rgba(217,101,91,.5)' }); ctx.globalAlpha = 1; },
    coin(ctx, x, y, t) {
      const yy = y + Math.sin(t * 2.6 + x) * 1.5, s = Math.abs(Math.cos(t * 2.5 + x * .05)) * .7 + .3;
      ctx.save(); ctx.translate(x, yy); ctx.scale(s, 1);
      ctx.globalAlpha = .75; ctx.fillStyle = '#e8b84a'; ctx.beginPath(); ctx.arc(.6, .5, 5, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(90,60,30,.85)'; ctx.lineWidth = .6; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 3, -2, 1); ctx.stroke();
      ctx.restore();
    },
    goal(ctx, x, y, t) {
      ctx.strokeStyle = 'rgba(70,52,38,.9)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + .5, y - 46); ctx.stroke();
      ctx.globalAlpha = .7; ctx.fillStyle = '#d9655b'; ctx.beginPath(); ctx.moveTo(x + 1, y - 46); ctx.quadraticCurveTo(x + 10, y - 44 + Math.sin(t * 3) * 2, x + 19, y - 41); ctx.lineTo(x + 1, y - 34); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(70,52,38,.6)'; ctx.lineWidth = .5; ctx.stroke();
    },
    particle(ctx, q) { const a = clamp(q.life / q.max, 0, 1); ctx.globalAlpha = a * .7; ctx.fillStyle = q.c; ctx.beginPath(); ctx.arc(q.x, q.y, q.s * (q.k === 'dust' ? 1.6 : 1), 0, TAU); ctx.fill(); ctx.globalAlpha = 1; },
    over(ctx, f) { grainMul(ctx, f, .6, 'wcgrain', { grain: 34, blot: 16, fibers: 8 }); vignette(ctx, .18, '#6a4a2a'); },
  });

  // ======================= OLEO / NOCHE ESTRELLADA =======================
  function oil(x, n, seed, sampler, o) {
    const r = rng(seed); x.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const px = o.x0 + r() * o.w, py = o.y0 + r() * o.h, s = sampler(px, py, r());
      if (!s) continue;
      const [col, ang] = s, l = o.len * (.6 + r() * .8), cs = Math.cos(ang) * l / 2, sn = Math.sin(ang) * l / 2, bend = (r() - .5) * l * .35;
      x.strokeStyle = jitterColor(col, .07, r()); x.lineWidth = o.wid * (.7 + r() * .6);
      x.beginPath(); x.moveTo(px - cs, py - sn); x.quadraticCurveTo(px - sn / l * bend * 2, py + cs / l * bend * 2, px + cs, py + sn); x.stroke();
      if (o.impasto && r() < .5) { x.strokeStyle = shade(col, .22); x.lineWidth *= .3; x.beginPath(); x.moveTo(px - cs * .7, py - sn * .7 - .4); x.lineTo(px + cs * .7, py + sn * .7 - .4); x.stroke(); }
    }
  }
  const SWIRLS = [[180, 70, 60], [430, 90, 70], [700, 60, 55], [900, 100, 60]];
  defStyle({
    id: 'oleo', name: 'Óleo impresionista', ref: 'Van Gogh · Okami · The Night Café', order: 13,
    desc: 'Miles de pinceladas con empaste que siguen remolinos; las estrellas giran con halos de pintura.',
    fx: { dust: ['#9fb7d8', '#d8c98a'], spark: ['#f8e27a', '#fff6c4', '#f7a630'], confetti: ['#f8e27a', '#d9542b', '#6c9ad8', '#9aa84a'] },
    sky(ctx, f) {
      strip(ctx, f, 'sky', .15, (x, w) => {
        const g = x.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#0c1c4c'); g.addColorStop(.6, '#2a58a0'); g.addColorStop(1, '#5a8cc8'); x.fillStyle = g; x.fillRect(0, 0, w, VH);
        oil(x, w * VH / 6, 3, (px, py, rr) => {
          const n = fbm2(px * .012, py * .02, 4, 3);
          let col = py < 140 ? mix('#0e2260', '#3566b4', py / 160) : mix('#3566b4', '#7aa8d8', (py - 140) / 100);
          if (n > .62) col = mix(col, '#9cc0ec', .7); else if (n < .36) col = mix(col, '#0a1640', .5);
          if (rr < .006) col = '#f2e6a8';
          let ang = (noise2(px * .006, py * .012, 9) - .5) * 1.8;
          for (const [sx, sy, sr] of SWIRLS) { const dx = px - sx, dy = py - sy, d = Math.hypot(dx, dy); if (d < sr) { const k = 1 - d / sr; ang = lerp(ang, Math.atan2(dy, dx) + Math.PI / 2, k); if (k > .3) col = mix(col, k > .6 ? '#d8e6f8' : '#7aa8e0', .45); } }
          return [col, ang];
        }, { x0: 0, y0: 0, w, h: VH, len: 7, wid: 2.4, impasto: true });
      });
      // luna
      const mx = 372 - f.cam * .03, my = 40;
      ctx.lineCap = 'round';
      for (let ring = 3; ring >= 1; ring--) for (let k = 0; k < ring * 9; k++) { const a = k / (ring * 9) * TAU + f.t * .15 * (ring % 2 ? 1 : -1), rr = 12 + ring * 6; ctx.strokeStyle = ring === 1 ? '#f8d25a' : ring === 2 ? '#f0b040' : 'rgba(220,150,60,.7)'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(mx, my, rr, a, a + .35); ctx.stroke(); }
      ctx.fillStyle = '#ffe27a'; ctx.beginPath(); ctx.arc(mx, my, 11, 0, TAU); ctx.fill(); for (let k = 0; k < 7; k++) { const a = k * .9 + 2; ctx.strokeStyle = k % 2 ? '#fff3b0' : '#f0b840'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(mx, my, 4 + (k % 3) * 2.4, a, a + 1.4); ctx.stroke(); }
      // estrellas giratorias
      const so = stripX(f, .15);
      ambient(11, 6, (i, a, b, c) => {
        const sx = a * stripW(.15) - so, sy = 18 + b * 100; if (sx < -20 || sx > VW + 20) return;
        for (let ring = 2; ring >= 0; ring--) { const n = 6 + ring * 5, rr = 2.5 + ring * 3.2 + c * 1.5; for (let k = 0; k < n; k++) { const an = k / n * TAU + f.t * (.4 + c * .3) * (ring % 2 ? -1 : 1); ctx.strokeStyle = ring === 0 ? '#fff6c4' : ring === 1 ? '#f8e27a' : 'rgba(200,220,255,.7)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(sx, sy, rr, an, an + .4); ctx.stroke(); } }
        ctx.fillStyle = '#fffbe0'; ctx.beginPath(); ctx.arc(sx, sy, 1.6 + c, 0, TAU); ctx.fill();
      });
      strip(ctx, f, 'hills', .35, (x, w) => {
        ridgeFill(x, w, 182, 1.45, 'mid', 5, 1.5); x.fillStyle = '#1e3a4c'; x.fill();
        x.save(); ridgeFill(x, w, 182, 1.45, 'mid', 5, 1.5); x.clip();
        oil(x, w * 70 / 5, 7, (px, py, rr) => { const top = ridgeAt(px, 182, 1.45, 'mid', 5); if (py < top - 2) return null; const d = py - top; const sg = CAMP.seg(px, 'mid', 5).t; const col = d < 2.5 ? '#0e1830' : d < 5 ? mix('#c9a85a', '#e0c070', rr) : sg === 'casas' ? mix('#1c2a44', '#2e4064', rr) : mix('#33354c', '#46485e', rr); return [col, d < 5 ? (rr - .5) * .4 : (rr < .5 ? (rr - .25) * .6 : Math.PI / 2 + (rr - .75) * .4)]; }, { x0: 0, y0: 118, w, h: 122, len: 6, wid: 2, impasto: true });
        x.restore();
        for (const fa of CAMP.facades(0, w, 5)) { const top = 182 - (4 + fa.h) * 1.45, n = Math.max(1, Math.floor(fa.w / 6.5)), gp = fa.w / n; for (let i = 0; i < n; i++) { if (hash1((fa.x0 | 0) + i, 3) > .55) continue; const wx = fa.x0 + gp * (i + .5); x.fillStyle = '#f8d25a'; x.fillRect(wx - 1.1, top + 6, 2.2, 3.4); x.fillStyle = 'rgba(248,210,90,.35)'; x.fillRect(wx - 2, top + 5, 4, 5.4); } }
      });
    },
    terrain(ctx, f) {
      ctx.save(); allLoopsPath(ctx, L.loops, 3);
      const g = ctx.createLinearGradient(0, 130, 0, VH); g.addColorStop(0, '#6f8a3e'); g.addColorStop(.3, '#3a5a5a'); g.addColorStop(1, '#232e50'); ctx.fillStyle = g; ctx.fill(); ctx.clip();
      // las 26 000 pinceladas están pensadas para un nivel largo; una franja de nivel vertical es angosta y las recibía todas
      // (cuatro veces más densas, y cada franja nueva congelaba el cuadro cerca de un segundo): ahí se reparten por área
      oil(ctx, f.franja ? Math.min(26000, Math.round(L.ww * (VH - 52) * .06)) : 26000, 11, (px, py, rr) => {
        const d = L.depth(px, py); if (d < 0) return null;
        let col; if (d < 2.5) col = mix('#d8c45a', '#b8b04a', rr); else if (d < 9) col = ['#8fa04a', '#6f8f3f', '#a9a24a', '#c9b458'][(rr * 4) | 0]; else if (d < 20) col = ['#4f6f4a', '#3a5f5a', '#5a7a4a'][(rr * 3) | 0]; else col = ['#2c3a5e', '#3a4f7a', '#4a5f8f', '#26304f'][(rr * 4) | 0];
        return [col, d < 9 ? (rr - .5) * .35 : (noise2(px * .03, py * .05, 4) - .5) * 2.4];
      }, { x0: 0, y0: 60, w: L.ww, h: VH - 52, len: 5.5, wid: 1.9, impasto: true });
      ctx.restore();
      const dl = organicLoops({ step: 2.5 });
      ctx.lineCap = 'round'; const r = rng(4);
      for (const l of dl) for (let i = 0; i < l.length; i++) { if (r() < .35) continue; const a = l[i], b = l[(i + 1) % l.length]; ctx.strokeStyle = jitterColor('#16224a', .06, r()); ctx.lineWidth = 1.2 + r() * 1; ctx.beginPath(); ctx.moveTo(a[0] + (r() - .5), a[1] + (r() - .5)); ctx.lineTo(b[0] + (r() - .5) * 2, b[1] + (r() - .5)); ctx.stroke(); }
      for (const o of L.deco) {
        const x = o.x, y = o.y;
        if (o.k === 'T') {
          const h = 58 + R(o.i, 1) * 22, w0 = 9 + R(o.i, 2) * 3; const rr = rng(o.i + 3);
          for (let k = 0; k < 90; k++) { const t = rr(), yy = y - t * h, ww = w0 * Math.pow(1 - t, .7) * (.6 + .4 * Math.sin(t * 9 + o.i)), xx = x + (rr() - .5) * 2 * ww + Math.sin(t * 6) * 2; const l = 5 + rr() * 6; ctx.strokeStyle = ['#13261c', '#24402a', '#3a5f3a', '#1a2f3f', '#4a6a3a'][(rr() * 5) | 0]; ctx.lineWidth = 1.8 + rr(); ctx.beginPath(); ctx.moveTo(xx, yy + l / 2); ctx.quadraticCurveTo(xx + (rr() - .5) * 3, yy, xx + Math.sin(t * 8) * 2, yy - l / 2); ctx.stroke(); }
        } else if (o.k === 'f') {
          for (let k = 0; k < 2; k++) { const fx = x - 4 + k * 8, fy = y - 8 - k * 2; ctx.strokeStyle = '#4a6a3a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(fx, y); ctx.lineTo(fx, fy); ctx.stroke(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; ctx.strokeStyle = i % 2 ? '#f8c83a' : '#e8a020'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(fx + Math.cos(a) * 1.4, fy + Math.sin(a) * 1.4); ctx.lineTo(fx + Math.cos(a) * 3.6, fy + Math.sin(a) * 3.6); ctx.stroke(); } ctx.fillStyle = '#6a3a1a'; ctx.beginPath(); ctx.arc(fx, fy, 1.4, 0, TAU); ctx.fill(); }
        } else if (o.k === 'r') {
          const rr = rng(o.i); for (let k = 0; k < 24; k++) { const a = rr() * Math.PI, d = rr() * 7; ctx.strokeStyle = ['#5a6a8a', '#7a8aa8', '#3a4a6a'][(rr() * 3) | 0]; ctx.lineWidth = 1.6; ctx.beginPath(); const px = x + Math.cos(a) * d * 1.2, py = y - Math.sin(a) * d * .8; ctx.moveTo(px - 1.5, py); ctx.lineTo(px + 1.5, py - .5); ctx.stroke(); }
        }
      }
    },
    player(ctx, p, f) { drawHero(ctx, p, f, { lw: 1.1, line: '#14203f', body: '#e8c547', body2: '#c99a2e', skin: '#f0c9a0', hair: '#3a2a1a', scarf: '#d9542b', leg: '#2c3a5e', eye: '#14203f' }); },
    coin(ctx, x, y, t) {
      const yy = y + Math.sin(t * 2.4 + x) * 1.5; ctx.lineCap = 'round';
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + t * 1.6; ctx.strokeStyle = k % 2 ? '#f8e27a' : '#f7a630'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, yy, 5, a, a + .5); ctx.stroke(); }
      ctx.fillStyle = '#fff6c4'; ctx.beginPath(); ctx.arc(x, yy, 2.4, 0, TAU); ctx.fill();
    },
    goal(ctx, x, y, t) {
      ctx.lineCap = 'round'; ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 46); ctx.stroke();
      for (let k = 0; k < 8; k++) { ctx.strokeStyle = k % 2 ? '#d9542b' : '#f0743a'; ctx.lineWidth = 2; const yy = y - 45 + k * 1.5, len = 18 - k * 1.6; ctx.beginPath(); ctx.moveTo(x + 1, yy); ctx.quadraticCurveTo(x + len / 2, yy + Math.sin(t * 4 - k) * 1.2, x + len, yy + k * .4); ctx.stroke(); }
    },
    particle(ctx, q) { const a = clamp(q.life / q.max, 0, 1); ctx.globalAlpha = a; ctx.strokeStyle = q.c; ctx.lineWidth = 1.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(q.x - Math.cos(q.r) * q.s, q.y - Math.sin(q.r) * q.s); ctx.lineTo(q.x + Math.cos(q.r) * q.s, q.y + Math.sin(q.r) * q.s); ctx.stroke(); ctx.globalAlpha = 1; },
    over(ctx, f) {
      const c = cached(f, 'weave', VW, VH, x => { x.strokeStyle = 'rgba(0,0,0,.08)'; x.lineWidth = .4; x.beginPath(); for (let y = 0; y < VH; y += 1.4) { x.moveTo(0, y); x.lineTo(VW, y); } for (let xx = 0; xx < VW; xx += 1.4) { x.moveTo(xx, 0); x.lineTo(xx, VH); } x.stroke(); });
      ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(c, 0, 0, VW, VH); ctx.globalCompositeOperation = 'source-over';
      vignette(ctx, .4, '#0a0f24');
    },
  });

  // ======================= SUMI-E =======================
  const SUMI = '#1d1b19', BENI = '#c23b2e';
  defStyle({
    id: 'sumie', name: 'Tinta sumi-e', ref: 'Okami · Sekiro (arte) · pintura china shan shui', order: 8,
    desc: 'Montañas de tinta lavada que se pierden en la niebla, pinos a pincel, sol rojo y pétalos cayendo.',
    fx: { dust: ['#cfc6b2', '#e8dfc8'], spark: [BENI, SUMI, '#e8a0a8'], confetti: [BENI, SUMI, '#e8a0a8', '#efe6d0'] },
    sky(ctx, f) {
      ctx.drawImage(paperTex(f, 'washi', '#f0e7d2', { grain: 12, blot: 10, fibers: 26 }), 0, 0, VW, VH);
      const sx = 318 - f.cam * .03;
      ctx.globalAlpha = .88; ctx.fillStyle = BENI; ctx.beginPath(); ctx.arc(sx, 58, 22, 0, TAU); ctx.fill(); ctx.globalAlpha = .3; ctx.beginPath(); ctx.arc(sx + .8, 58.5, 23.2, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      const mt = (par, base, amp, fr, seed, a, blur) => strip(ctx, f, 'm' + seed, par, (x, w) => {
        const peaks = typeof fr === 'string' ? (xx => base - CAMP.h(xx, fr, seed) * amp) : (xx => base - Math.pow(1 - Math.abs(fbm1(xx * fr, seed, 4) * 2 - 1), 1.8) * amp);
        x.save(); x.filter = `blur(${blur * f.S}px)`;
        x.beginPath(); x.moveTo(0, VH); for (let xx = 0; xx <= w; xx += 2) x.lineTo(xx, peaks(xx)); x.lineTo(w, VH); x.closePath();
        const g = x.createLinearGradient(0, base - amp, 0, base + 30); g.addColorStop(0, rgba(SUMI, a)); g.addColorStop(.55, rgba(SUMI, a * .35)); g.addColorStop(1, rgba(SUMI, 0)); x.fillStyle = g; x.fill();
        x.restore();
        x.lineCap = 'round';
        for (let k = 0; k < 3; k++) { x.beginPath(); for (let xx = 0; xx <= w; xx += 2) x.lineTo(xx, peaks(xx) + k * .5 + (noise1(xx * .2, seed + k) - .5) * .6); x.strokeStyle = rgba(SUMI, a * (.75 - k * .2)); x.lineWidth = 1 - k * .28; x.stroke(); }
        if (fr === 'near') { x.save(); x.filter = `blur(${blur * f.S}px)`; x.fillStyle = rgba(SUMI, a * .9); x.beginPath(); for (const q of CAMP.props(0, w, 'near', seed)) { const b = peaks(q.x) + 3; if (q.k === 'ceiba') CAMP.ceiba(x, q.x, b, q.h * amp, q.w * amp, q.s); else CAMP.palma(x, q.x, b, q.h * amp, q.lean, q.s); } x.fill(); x.restore(); }
        const r = rng(seed); for (let i = 0; i < w / 3; i++) { const xx = r() * w, y0 = peaks(xx), l = 3 + r() * 8; x.strokeStyle = rgba(SUMI, a * .5); x.lineWidth = .5; x.beginPath(); x.moveTo(xx, y0 + 2 + r() * 10); x.lineTo(xx + l * .5, y0 + 2 + r() * 10 + l); x.stroke(); }
      });
      mt(.06, 140, 70, .007, 2, .2, 1.8);
      mt(.12, 168, 1.5, 'far', 3, .32, 1.2);
      mt(.24, 186, 1.45, 'mid', 7, .45, .6);
      mt(.4, 210, .95, 'near', 11, .65, .3);
      ctx.strokeStyle = rgba(SUMI, .75); ctx.lineWidth = .6; ctx.lineCap = 'round';
      for (let i = 0; i < (window.FAUNA_ARTE?.listo('aveSumi') ? 3 : 0); i++) { const x = wrap(i * 80 + f.t * 9 - f.cam * .12, VW + 100) - 50, y = 40 + i * 9 + Math.sin(f.t + i) * 2; FAUNA_ARTE.dib(ctx, 'aveSumi', f.t + i * .35, x, y, { w: 8 - i, ay: .5, fps: 5, seq: [0, 1, 3, 2, 3, 1], alfa: .85 }); }
    },
    terrain(ctx, f) {
      const lp = organicLoops({ smooth: 1, step: 2.5, amp: .7, freq: .3, seed: 13 });
      const forma = () => { ctx.beginPath(); for (const l of lp) pathPts(ctx, l); };
      // aguada: el papel debajo (para que no se vea el fondo) y la tinta diluida encima
      forma(); ctx.fillStyle = '#ece4d2'; ctx.fill();
      ctx.save(); forma(); ctx.clip();
      const r = rng(5); ctx.fillStyle = rgba(SUMI, .72); ctx.fillRect(0, 0, L.ww, VH + 8);
      // pasadas anchas del pincel que tienden la tinta (en diagonal, encimándose)
      ctx.lineCap = 'round';
      for (let i = 0; i < 240; i++) { const x = r() * L.ww, y = 125 + r() * 125; if (L.depth(x, y) < 8) continue; const l = 20 + r() * 50, a = -.25 + r() * .35; ctx.strokeStyle = rgba(SUMI, .07 + r() * .12); ctx.lineWidth = 6 + r() * 12; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + l * .5, y + Math.sin(a) * l * .5 + (r() - .5) * 6, x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke(); }
      // charcos de tinta donde el papel la absorbió más (manchas suaves de distinto tono)
      for (let i = 0; i < 520; i++) { const x = r() * L.ww, y = 120 + r() * 130; if (L.depth(x, y) < 6) continue; const rr = 5 + r() * 28, g = ctx.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, rgba(SUMI, .2 + r() * .3)); g.addColorStop(.6, rgba(SUMI, .08)); g.addColorStop(1, rgba(SUMI, 0)); ctx.fillStyle = g; ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
      // el borde cargado: el pincel dibuja la forma por dentro del contorno, con la tinta corrida hacia adentro
      ctx.lineJoin = 'round'; for (const [w, a] of [[9, .22], [4.5, .4], [1.8, .8]]) { forma(); ctx.lineWidth = w; ctx.strokeStyle = rgba(SUMI, a); ctx.stroke(); }
      // bajo cada superficie, la franja oscura del primer trazo, que se desvanece al bajar
      for (const t of L.tops) { const g = ctx.createLinearGradient(0, t.y, 0, t.y + 18); g.addColorStop(0, rgba(SUMI, .92)); g.addColorStop(.35, rgba(SUMI, .45)); g.addColorStop(1, rgba(SUMI, 0)); ctx.fillStyle = g; ctx.fillRect(t.x0 - 4, t.y, t.x1 - t.x0 + 8, 18); }
      // pincel seco: una pasada son varias cerdas paralelas, con huecos donde el papel se asoma
      ctx.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < 420; i++) {
        const x = r() * L.ww, y = 120 + r() * 130, d = L.depth(x, y); if (d < 8) continue;
        const l = 14 + r() * 30, n = 4 + (r() * 6 | 0), a = (r() - .5) * .25, fuerza = .25 + r() * .45;
        for (let k = 0; k < n; k++) { if (r() < .3) continue; const oy = k * (.9 + r() * .6), x0 = x + r() * l * .25, x1 = x + l * (.6 + r() * .4); ctx.strokeStyle = `rgba(0,0,0,${fuerza * (.5 + r() * .5)})`; ctx.lineWidth = .35 + r() * .45; ctx.beginPath(); ctx.moveTo(x0, y + oy + (x0 - x) * a); ctx.lineTo(x1, y + oy + (x1 - x) * a + (r() - .5)); ctx.stroke(); }
      }
      ctx.globalCompositeOperation = 'source-over';
      // lo hondo se va oscureciendo, pero sin volverse un bloque
      const g = ctx.createLinearGradient(0, 190, 0, VH + 4); g.addColorStop(0, rgba(SUMI, 0)); g.addColorStop(1, rgba(SUMI, .72)); ctx.fillStyle = g; ctx.fillRect(0, 190, L.ww, VH);
      ctx.restore();
      for (const t of L.tops) for (let k = 0; k < 4; k++) { ctx.strokeStyle = rgba(SUMI, .8 - k * .15); ctx.lineWidth = 1.4 - k * .3; ctx.beginPath(); ctx.moveTo(t.x0 - 3 + k, t.y + .2 + k * .4); for (let x = t.x0 - 3; x <= t.x1 + 3; x += 3) ctx.lineTo(x, t.y - .4 + k * .45 + (noise1(x * .3, k + t.x0) - .5) * .9); ctx.stroke(); }
      ctx.strokeStyle = SUMI; ctx.lineCap = 'round';
      for (const t of L.tops) for (let x = t.x0 + 2; x < t.x1 - 2; x += 2 + R(x | 0, 2) * 7) { const h = 2 + R(x | 0, 3) * 5, l = (R(x | 0, 4) - .4) * 4; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(x, t.y); ctx.quadraticCurveTo(x + l * .2, t.y - h * .6, x + l, t.y - h); ctx.stroke(); }
      for (const o of L.deco) {
        const x = o.x, y = o.y; const r2 = rng(o.i * 3 + 1);
        if (o.k === 'T') {
          const palm = o.i % 2 === 1, TP = (pt) => { ctx.beginPath(); if (palm) CAMP.palma(ctx, x, y + 1, 50 + R(o.i, 1) * 14, (R(o.i, 2) - .5) * .5, o.i, 0, pt); else CAMP.ceiba(ctx, x, y + 1, 54 + R(o.i, 1) * 10, 44, o.i, pt); };
          ctx.save(); ctx.filter = `blur(${.6 * f.S}px)`; TP('crown'); ctx.fillStyle = rgba(SUMI, .55); ctx.fill(); ctx.restore();
          TP('trunk'); ctx.fillStyle = SUMI; ctx.fill(); ctx.save(); ctx.globalAlpha = .55; ctx.translate(.8, .6); TP('crown'); ctx.fillStyle = SUMI; ctx.fill(); ctx.restore();
        } else if (o.k === 'f') {
          for (let k = 0; k < 5; k++) { const d = (k - 2) * .45, l = 8 + r2() * 8; ctx.strokeStyle = SUMI; ctx.lineWidth = .9 - Math.abs(k - 2) * .15; ctx.beginPath(); ctx.moveTo(x + k - 2, y); ctx.quadraticCurveTo(x + d * l * .8, y - l * .7, x + d * l * 1.6, y - l + Math.abs(d) * 4); ctx.stroke(); }
          ctx.fillStyle = BENI; ctx.beginPath(); ctx.arc(x + 3, y - 10, 1.4, 0, TAU); ctx.arc(x + 5, y - 8.5, 1.1, 0, TAU); ctx.fill();
        } else if (o.k === 'r') {
          ctx.fillStyle = rgba(SUMI, .35); ctx.beginPath(); ctx.moveTo(x - 10, y + 1); ctx.quadraticCurveTo(x - 8, y - 10, x - 1, y - 10); ctx.quadraticCurveTo(x + 9, y - 9, x + 10, y + 1); ctx.fill();
          ctx.strokeStyle = SUMI; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x - 10, y + 1); ctx.quadraticCurveTo(x - 8, y - 10, x - 1, y - 10); ctx.quadraticCurveTo(x + 9, y - 9, x + 10, y + 1); ctx.stroke(); ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(x - 3, y - 9); ctx.lineTo(x - 1, y - 3); ctx.moveTo(x + 3, y - 8); ctx.lineTo(x + 5, y - 4); ctx.stroke();
        }
      }
    },
    player(ctx, p, f) { drawHero(ctx, p, f, { body: SUMI, hair: SUMI, leg: SUMI, skin: '#f0e7d2', eye: SUMI, scarf: BENI, scarfW: 2.2 }); },
    coin(ctx, x, y, t) {
      const yy = y + Math.sin(t * 2.2 + x) * 1.5, a0 = t * 1.2 + x;
      ctx.strokeStyle = SUMI; ctx.lineCap = 'round';
      for (let k = 0; k < 10; k++) { const a = a0 + k / 10 * (TAU - .7); ctx.lineWidth = 1.6 - k * .12; ctx.beginPath(); ctx.arc(x, yy, 4.8, a, a + .62); ctx.stroke(); }
      ctx.fillStyle = BENI; ctx.beginPath(); ctx.arc(x, yy, 1.5, 0, TAU); ctx.fill();
    },
    goal(ctx, x, y, t) {
      ctx.strokeStyle = SUMI; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 48); ctx.stroke();
      ctx.lineWidth = 2.4; for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.moveTo(x - .2, y - k * 10); ctx.lineTo(x + .2, y - k * 10 - .6); ctx.stroke(); }
      ctx.fillStyle = BENI; ctx.beginPath(); ctx.moveTo(x + 1, y - 46); ctx.lineTo(x + 8, y - 46); const w = Math.sin(t * 2.5) * 1.5; ctx.lineTo(x + 8 + w, y - 22); ctx.lineTo(x + 4.5 + w, y - 25); ctx.lineTo(x + 1 + w, y - 22); ctx.fill();
      ctx.fillStyle = '#f0e7d2'; ctx.beginPath(); ctx.arc(x + 4.5 + w * .3, y - 38, 1.8, 0, TAU); ctx.fill();
    },
    particle(ctx, q) { const a = clamp(q.life / q.max, 0, 1); ctx.globalAlpha = a * .8; ctx.fillStyle = q.c; ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.r); ctx.beginPath(); ctx.ellipse(0, 0, q.s * 1.2, q.s * .5, 0, 0, TAU); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1; },
    over(ctx, f) {
      ambient(14, 31, (i, a, b, c) => { const x = wrap(a * VW * 1.4 - f.t * (6 + c * 6) - f.cam * (.3 + c * .5), VW + 20) - 10, y = wrap(b * VH + f.t * (8 + c * 10), VH + 10) - 5; ctx.save(); ctx.translate(x, y); ctx.rotate(f.t * (1 + c) + i); ctx.scale(1, Math.abs(Math.sin(f.t * 2 + i)) * .7 + .3); ctx.fillStyle = `rgba(232,160,168,${.55 + c * .3})`; ctx.beginPath(); ctx.ellipse(0, 0, 1.8 + c, 1, 0, 0, TAU); ctx.fill(); ctx.restore(); });
      grainMul(ctx, f, .5, 'washigrain', { grain: 22, blot: 10, fibers: 30 });
      ctx.save(); ctx.translate(VW - 22, VH - 24); ctx.rotate(.03); ctx.fillStyle = 'rgba(194,59,46,.88)'; ctx.beginPath(); roundRect(ctx, -8, -8, 16, 16, 2); ctx.fill();
      ctx.strokeStyle = '#f0e7d2'; ctx.lineWidth = 1.2; ctx.lineJoin = 'miter'; ctx.beginPath(); for (const [px, py] of [[-4.4, 3.6], [-2, 3.6], [-2, 1.2], [.4, 1.2], [.4, -1.2], [2, -1.2], [2, -3.6], [4.2, -3.6], [4.2, -.6]]) ctx.lineTo(px, py); ctx.stroke(); ctx.restore(); // greca maya, sello de la hoja
    },
  });

  // ======================= CUADERNO A LAPIZ =======================
  const PEN = '#3a3a42';
  function skStroke(ctx, pts, seed, amp, passes, col, lw, close) {
    for (let k = 0; k < passes; k++) {
      ctx.beginPath();
      pts.forEach((p, i) => { const nx = (noise1(i * .35 + k * 7.3, seed + k) - .5) * 2 * amp, ny = (noise1(i * .35 + k * 3.1, seed + k + 50) - .5) * 2 * amp; i ? ctx.lineTo(p[0] + nx, p[1] + ny) : ctx.moveTo(p[0] + nx, p[1] + ny); });
      if (close) ctx.closePath();
      ctx.strokeStyle = col; ctx.lineWidth = lw * (k ? .7 : 1); ctx.stroke();
    }
  }
  // contorno de nube/copa hecho de bucles (como garabato de libreta)
  function scribbleBlob(cx, cy, rx, ry, n) { const o = []; for (let i = 0; i <= n * 10; i++) { const t = i / (n * 10) * TAU, lp = t * n; o.push([cx + Math.cos(t) * rx + Math.cos(lp) * rx * .28, cy + Math.sin(t) * ry + Math.sin(lp) * ry * .4]); } return o; }
  const circPts = (cx, cy, r, n = 18, over = 1.15) => { const o = []; for (let i = 0; i <= n * over; i++) { const a = i / n * TAU; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; };
  function hatch(ctx, x0, y0, x1, y1, sp, ang, col, lw, seed) { const r = rng(seed); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); const h = y1 - y0, dx = Math.tan(ang) * h; for (let x = x0 - Math.abs(dx); x < x1 + Math.abs(dx); x += sp * (.8 + r() * .4)) { ctx.moveTo(x + (r() - .5), y1); ctx.lineTo(x + dx + (r() - .5), y0); } ctx.stroke(); }
  defStyle({
    id: 'cuaderno', name: 'Cuaderno a lápiz', ref: 'Doodle Jump · Crayon Physics · bocetos', order: 15,
    desc: 'Dibujado en una libreta rayada: líneas temblorosas que “hierven”, achurado a grafito y toques de color.',
    fx: { dust: ['rgba(58,58,66,.5)'], spark: ['#f2c94c', PEN, '#e05a4f'], confetti: ['#e05a4f', '#3f6fd8', '#f2c94c', '#3a3a42'] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'paper', x => {
        x.drawImage(paperTex(f, 'nb', '#fbfaf3', { grain: 8, blot: 4 }), 0, 0, VW, VH);
        x.strokeStyle = 'rgba(110,150,210,.45)'; x.lineWidth = .45; x.beginPath(); for (let y = 26; y < VH; y += 12) { x.moveTo(0, y); x.lineTo(VW, y); } x.stroke();
        x.fillStyle = 'rgba(0,0,0,.08)'; for (let k = 0; k < 6; k++) { x.beginPath(); x.arc(10, 20 + k * 40, 3.2, 0, TAU); x.fill(); }
        // cosas de libreta: aro de café, cinta washi y el título a mano
        for (let k = 0; k < 3; k++) { x.strokeStyle = `rgba(150,105,60,${.16 - k * .04})`; x.lineWidth = 1.6 - k * .5; x.beginPath(); x.ellipse(72 + k * .6, 64 - k * .4, 19 - k * 1.2, 18 - k, .2, .3 + k, TAU - .5 + k * .3); x.stroke(); }
        x.fillStyle = 'rgba(150,105,60,.05)'; x.beginPath(); x.ellipse(72, 64, 18, 17, .2, 0, TAU); x.fill();
        x.save(); x.translate(VW - 46, 9); x.rotate(.12); x.fillStyle = 'rgba(232,140,150,.45)'; x.fillRect(-26, -6, 52, 12);
        x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 1.2; x.beginPath(); for (let i = -24; i < 26; i += 5) { x.moveTo(i, -6); x.lineTo(i + 4, 6); } x.stroke();
        x.fillStyle = 'rgba(251,250,243,.9)'; for (const s of [-1, 1]) { x.beginPath(); for (let i = 0; i <= 6; i++) x.lineTo(s * 26 + s * (i % 2) * 1.4, -6 + i * 2); x.lineTo(s * 30, 6); x.lineTo(s * 30, -6); x.fill(); }
        x.restore();
        x.fillStyle = 'rgba(58,58,66,.42)'; x.font = 'italic 500 10px Alegreya, serif'; x.fillText('Campeche', 22, 21);
        x.strokeStyle = 'rgba(58,58,66,.35)'; x.lineWidth = .5; x.beginPath(); x.moveTo(21, 24); x.quadraticCurveTo(45, 22.5, 70, 25); x.stroke();
      });
      const mx = L.camMin + 30 - f.cam; ctx.strokeStyle = 'rgba(220,90,90,.5)'; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(mx, 0); ctx.lineTo(mx, VH); ctx.stroke();
      strip(ctx, f, 'doodles', .25, (x, w) => {
        x.lineCap = 'round'; x.lineJoin = 'round';
        const pts = []; for (let xx = 0; xx <= w; xx += 1.5) pts.push([xx, ridgeAt(xx, 180, 1.5, 'mid', 3)]);
        const pf = []; for (let xx = 0; xx <= w; xx += 2) pf.push([xx, ridgeAt(xx, 150, 1.2, 'far', 4)]); skStroke(x, pf, 4, .4, 1, 'rgba(70,110,170,.6)', .7);
        // la ciudad sombreada a grafito, con ventanas, puertas y algo de color de lápiz
        x.save(); x.beginPath(); x.moveTo(0, VH); pts.forEach(p => x.lineTo(p[0], p[1])); x.lineTo(w, VH); x.closePath(); x.clip();
        hatch(x, 0, 120, w, VH, 2.6, .55, 'rgba(58,58,66,.13)', .4, 21);
        for (const fa of CAMP.facades(0, w, 3)) {
          const top = 180 - fa.h * 1.5, r = k => R(fa.x0 | 0, k);
          x.save(); x.beginPath(); x.rect(fa.x0 + .5, top + 1, fa.w - 1, VH); x.clip(); x.fillStyle = rgba(CAMP.FACHADAS[fa.col], .35); x.fillRect(fa.x0, top, fa.w, VH); hatch(x, fa.x0 - 4, top, fa.x0 + fa.w + 4, 182, 1.1, -.5, rgba(CAMP.FACHADAS[fa.col], .95), .65, fa.x0 | 0); x.restore();
          x.strokeStyle = 'rgba(48,48,56,.8)'; x.lineWidth = .6; x.beginPath();
          x.moveTo(fa.x0, top + 2); x.lineTo(fa.x0 + .3, 182);
          const nv = Math.max(1, Math.floor(fa.w / 7)), pw = 2.4;
          for (let i = 0; i < nv; i++) { const wx = fa.x0 + (fa.w - nv * 6) / 2 + i * 6 + 1.8; x.rect(wx, top + 6, pw, 4.2); if (fa.h > 22) x.rect(wx, top + 14, pw, 4.2); }
          const dx = fa.x0 + fa.w / 2; x.moveTo(dx - 2.4, 182); x.lineTo(dx - 2.4, 176); x.arc(dx, 176, 2.4, Math.PI, 0); x.lineTo(dx + 2.4, 182);
          x.stroke();
        }
        x.restore();
        skStroke(x, pts, 3, .5, 2, 'rgba(48,48,56,.85)', .9);
        for (let k = 0; k < w / 50; k++) { const xx = k * 50 + R(k, 1) * 30, top = ridgeAt(xx, 180, 1.5, 'mid', 3); x.strokeStyle = 'rgba(58,58,66,.25)'; x.lineWidth = .5; x.beginPath(); x.moveTo(xx, top + 3); x.lineTo(xx + 8, top + 18); x.moveTo(xx + 4, top + 3); x.lineTo(xx + 12, top + 18); x.stroke(); }
        for (let k = 0; k < w / 140; k++) { const cx = 40 + k * 140 + R(k, 4) * 60, cy = 40 + R(k, 5) * 40; x.fillStyle = 'rgba(120,170,235,.22)'; x.beginPath(); x.ellipse(cx, cy, 15, 6, 0, 0, TAU); x.fill(); skStroke(x, scribbleBlob(cx, cy, 16, 6, 7), k, .3, 2, 'rgba(50,90,170,.75)', .8); }
      });
      const sx = 350 - f.cam * .03;
      skStroke(ctx, circPts(sx, 42, 11, 20, 1.2), Math.floor(f.t * 6), .5, 2, 'rgba(58,58,66,.7)', .7);
      ctx.fillStyle = 'rgba(242,190,50,.85)'; ctx.beginPath(); ctx.arc(sx + 1, 43, 10, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(58,58,66,.6)'; ctx.lineWidth = .6; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + f.t * .2; ctx.moveTo(sx + Math.cos(a) * 15, 42 + Math.sin(a) * 15); ctx.lineTo(sx + Math.cos(a) * 21, 42 + Math.sin(a) * 21); } ctx.stroke();
    },
    terrain(ctx) {
      const dl = organicLoops({ step: 3 });
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip();
      ctx.fillStyle = 'rgba(214,170,120,.5)'; ctx.fillRect(0, 100, L.ww, VH); // colores de palo: tierra y una tira de pasto
      hatch(ctx, 0, 100, L.ww, VH + 8, 1.7, .9, 'rgba(176,120,70,.62)', .7, 9);
      hatch(ctx, 0, 100, L.ww, VH + 8, 3, .6, 'rgba(58,58,66,.38)', .5, 3);
      for (const t of L.tops) { ctx.fillStyle = 'rgba(120,196,96,.6)'; ctx.fillRect(t.x0, t.y, t.x1 - t.x0, 8); ctx.save(); ctx.beginPath(); ctx.rect(t.x0, t.y, t.x1 - t.x0, 8); ctx.clip(); hatch(ctx, t.x0 - 8, t.y - 8, t.x1 + 8, t.y + 16, 1.4, -.8, 'rgba(50,140,60,.85)', .7, 6); ctx.restore(); }
      ctx.restore();
      ctx.save(); ctx.beginPath(); for (let cx = 0; cx < L.gw; cx++) for (let cy = 0; cy < 17; cy++) if (L.solid(cx, cy) && L.solid(cx, cy - 1) && L.solid(cx, cy - 2)) ctx.rect(cx * T, cy * T, T, T); ctx.clip();
      hatch(ctx, 0, 100, L.ww, VH + 8, 3.4, -.6, 'rgba(58,58,66,.22)', .4, 5);
      ctx.restore();
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      dl.forEach((l, i) => skStroke(ctx, l, i * 13 + 1, .45, 3, 'rgba(48,48,56,.62)', .65, true));
      for (const t of L.tops) { ctx.strokeStyle = 'rgba(70,140,70,.75)'; ctx.lineWidth = .55; ctx.beginPath(); for (let x = t.x0 + 2; x < t.x1 - 2; x += 3 + R(x | 0, 2) * 4) { ctx.moveTo(x - 1.2, t.y); ctx.lineTo(x, t.y - 2.5 - R(x | 0, 3) * 2); ctx.lineTo(x + 1.2, t.y); } ctx.stroke(); }
      for (const o of L.deco) {
        const x = o.x, y = o.y;
        if (o.k === 'T') {
          const palm = o.i % 2 === 1, TP = (pt) => { ctx.beginPath(); if (palm) CAMP.palma(ctx, x, y + 1, 50 + R(o.i, 1) * 14, (R(o.i, 2) - .5) * .5, o.i, 0, pt); else CAMP.ceiba(ctx, x, y + 1, 54 + R(o.i, 1) * 10, 44, o.i, pt); };
          ctx.save(); TP('crown'); ctx.fillStyle = 'rgba(90,170,90,.22)'; ctx.fill(); ctx.restore();
          for (let k = 0; k < 2; k++) { ctx.save(); ctx.translate((R(o.i, k + 5) - .5) * .8, (R(o.i, k + 7) - .5) * .8); TP(); ctx.lineWidth = .5; ctx.strokeStyle = 'rgba(48,48,56,.6)'; ctx.stroke(); ctx.restore(); }
          ctx.save(); TP('crown'); ctx.clip(); hatch(ctx, x - 30, y - 80, x + 30, y, 2.2, .7, 'rgba(58,58,66,.25)', .4, o.i); ctx.restore();
        } else if (o.k === 'f') {
          for (let k = 0; k < 2; k++) { const fx = x - 4 + k * 8, fy = y - 8 - k * 2; skStroke(ctx, [[fx, y], [fx + .5, fy]], k + o.i, .2, 1, 'rgba(60,120,60,.8)', .55); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; skStroke(ctx, circPts(fx + Math.cos(a) * 2.2, fy + Math.sin(a) * 2.2, 1.3, 8, 1), i + k * 9, .15, 1, 'rgba(48,48,56,.75)', .45); } ctx.fillStyle = k ? 'rgba(224,90,79,.55)' : 'rgba(63,111,216,.5)'; ctx.beginPath(); ctx.arc(fx, fy, 3, 0, TAU); ctx.fill(); }
        } else if (o.k === 'r') {
          const pts = [[x - 9, y], [x - 6, y - 7], [x + 1, y - 9], [x + 7, y - 5], [x + 9, y]]; skStroke(ctx, pts, o.i, .3, 2, 'rgba(48,48,56,.7)', .6);
          ctx.save(); ctx.beginPath(); pts.forEach(p => ctx.lineTo(p[0], p[1])); ctx.clip(); hatch(ctx, x - 10, y - 10, x + 10, y, 1.6, .7, 'rgba(58,58,66,.4)', .4, o.i); ctx.restore();
        }
      }
    },
    player(ctx, p, f) {
      const g = heroPose(p, f.t), X = heroXf(p, g), seed = Math.floor(f.t * 8) * 7;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const sc = g.sc.map(q => X(q[0], q[1])); skStroke(ctx, sc, seed + 1, .3, 2, 'rgba(224,70,60,.85)', 1.1);
      for (const l of [g.l1, g.l2]) skStroke(ctx, [X(l[0], l[1] + g.bob), X(l[2], l[3])], seed + 2, .25, 2, 'rgba(40,50,140,.9)', .8);
      const body = [[-4, -3], [-4, -9], [-2.5, -10.6], [2.5, -10.6], [4, -9], [4, -3], [-4, -3]].map(q => X(q[0], q[1] + g.bob));
      ctx.fillStyle = 'rgba(63,111,216,.25)'; ctx.beginPath(); body.forEach(q => ctx.lineTo(q[0], q[1])); ctx.fill();
      skStroke(ctx, body, seed + 3, .3, 2, 'rgba(40,50,140,.9)', .75);
      const hc = X(.5, -14.6 + g.bob); skStroke(ctx, circPts(hc[0], hc[1], 4.9, 16, 1.1), seed + 4, .35, 2, 'rgba(40,50,140,.9)', .75);
      const hair = []; for (let i = 0; i < 7; i++) hair.push(X(-4 + i * .9, -16.5 - Math.sin(i) * 1.5 + g.bob)); skStroke(ctx, hair, seed + 5, .3, 1, 'rgba(40,50,140,.9)', .6);
      const e = X(3, -14.4 + g.bob); ctx.fillStyle = 'rgba(30,30,90,.95)'; ctx.beginPath(); ctx.arc(e[0], e[1], .8, 0, TAU); ctx.fill();
    },
    coin(ctx, x, y, t) {
      const yy = y + Math.sin(t * 2.6 + x) * 1.5, seed = Math.floor(t * 8) + (x | 0);
      ctx.fillStyle = 'rgba(242,201,76,.6)'; ctx.beginPath(); ctx.arc(x + .8, yy + .5, 5, 0, TAU); ctx.fill();
      const st = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * TAU - Math.PI / 2, r = i % 2 ? 2.2 : 5; st.push([x + Math.cos(a) * r, yy + Math.sin(a) * r]); }
      skStroke(ctx, st, seed, .25, 2, 'rgba(48,48,56,.8)', .55);
    },
    goal(ctx, x, y, t) {
      const seed = Math.floor(t * 8);
      skStroke(ctx, [[x, y], [x + .3, y - 46]], seed, .3, 2, 'rgba(48,48,56,.8)', .7);
      const fl = [[x, y - 46], [x + 19, y - 41 + Math.sin(t * 3)], [x, y - 35]];
      ctx.fillStyle = 'rgba(224,90,79,.5)'; ctx.beginPath(); fl.forEach(q => ctx.lineTo(q[0], q[1])); ctx.fill();
      skStroke(ctx, fl, seed + 3, .3, 2, 'rgba(48,48,56,.8)', .6);
    },
    particle(ctx, q) { const a = clamp(q.life / q.max, 0, 1); ctx.globalAlpha = a; ctx.strokeStyle = q.c; ctx.lineWidth = .5; ctx.beginPath(); ctx.arc(q.x, q.y, q.s, q.r, q.r + 5); ctx.stroke(); ctx.globalAlpha = 1; },
  });

  // ======================= CRAYON =======================
  function crayonFill(ctx, pathFn, col, ang, sp, seed, a = .8, bb) {
    ctx.save(); pathFn(); ctx.clip();
    const r = rng(seed), [x0, y0, x1, y1] = bb, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rad = Math.hypot(x1 - x0, y1 - y0) / 2 + 4;
    ctx.translate(cx, cy); ctx.rotate(ang); ctx.strokeStyle = col; ctx.globalAlpha = a; ctx.lineWidth = sp * 1.35; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); let dir = 1; ctx.moveTo(-rad, -rad);
    for (let y = -rad; y < rad; y += sp) { ctx.lineTo(dir * rad + (r() - .5) * 3, y + (r() - .5) * sp * .8); dir = -dir; }
    ctx.stroke(); ctx.restore();
  }
  function crayonLine(ctx, pts, col, lw, seed, close) { skStroke(ctx, pts, seed, .4, 2, col, lw, close); }
  function waxTile(f) { return cached(f, 'wax', 40, 40, (x, c) => { x.setTransform(1, 0, 0, 1, 0, 0); const im = x.createImageData(c.width, c.height), d = im.data; for (let j = 0; j < c.height; j++) for (let i = 0; i < c.width; i++) { const p = (j * c.width + i) * 4, v = hash2(i, j, 3), w = noise2(i * .5, j * 2.2, 9); d[p] = d[p + 1] = d[p + 2] = 0; d[p + 3] = v < .1 ? 255 : w > .84 ? 140 : 0; } x.putImageData(im, 0, 0); }); }

  // ======================= GRABADO EN LINOLEO =======================
  const INK = '#1f1a1c', PAP = '#efe5cf', RED = '#b3342b';
  defStyle({
    id: 'grabado', name: 'Grabado en linóleo', ref: 'Posada · xilografía japonesa · Hokusai', order: 17,
    desc: 'Tinta negra y un rojo, con líneas talladas a gubia: el cielo son surcos que se adelgazan hacia el horizonte.',
    fx: { dust: [INK], spark: [RED, INK, PAP], confetti: [RED, INK, PAP] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'sky', x => {
        x.drawImage(paperTex(f, 'lino', PAP, { grain: 12, blot: 10, fibers: 8 }), 0, 0, VW, VH);
        const sx = 300, sy = 70, sr = 26;
        x.fillStyle = INK;
        for (let y = 2; y < 190; y += 3.4) {
          const th = clamp(1.7 - y / 120, .15, 1.7);
          x.beginPath();
          for (let xx = -2; xx <= VW + 2; xx += 3) { const d = Math.hypot(xx - sx, y - sy); const k = d < sr + 8 ? 0 : th * (.7 + noise1(xx * .05 + y, 3) * .6); x.lineTo(xx, y - k / 2); }
          for (let xx = VW + 2; xx >= -2; xx -= 3) { const d = Math.hypot(xx - sx, y - sy); const k = d < sr + 8 ? 0 : th * (.7 + noise1(xx * .05 + y, 3) * .6); x.lineTo(xx, y + k / 2); }
          x.fill();
        }
        x.strokeStyle = INK; x.lineWidth = .9; for (let k = 1; k < 4; k++) { x.beginPath(); x.arc(sx, sy, sr + k * 2.6, 0, TAU); x.stroke(); }
        x.fillStyle = RED; x.beginPath(); x.arc(sx, sy, sr, 0, TAU); x.fill();
        x.strokeStyle = PAP; x.lineWidth = .7; for (let k = 1; k < 5; k++) { x.beginPath(); x.arc(sx, sy, sr - k * 4.6, -2.4, .4); x.stroke(); }
      });
      const mt = (par, base, amp, fr, seed, sp) => strip(ctx, f, 'm' + seed, par, (x, w) => {
        const top = typeof fr === 'string' ? (xx => base - CAMP.h(xx, fr, seed) * amp) : (xx => base - Math.pow(1 - Math.abs(fbm1(xx * fr, seed, 3) * 2 - 1), 1.5) * amp);
        x.beginPath(); x.moveTo(0, VH); for (let xx = 0; xx <= w; xx += 2) x.lineTo(xx, top(xx)); x.lineTo(w, VH); x.closePath(); x.fillStyle = INK; x.fill();
        x.save(); x.clip(); x.strokeStyle = PAP;
        for (let k = 1; k < 16; k++) { x.lineWidth = Math.max(.15, (sp < 3 ? 1.15 : .9) - k * .05); x.beginPath(); for (let xx = 0; xx <= w; xx += 3) x.lineTo(xx, top(xx) + k * sp + (noise1(xx * .1, k) - .5) * 1.2); x.stroke(); }
        x.restore();
      });
      mt(.12, 168, 1.5, 'far', 3, 3.2);
      mt(.3, 192, 1.6, 'mid', 7, 2.6);
    },
    terrain(ctx) {
      const lp = organicLoops({ step: 3, amp: .6, freq: .4, seed: 9 });
      ctx.beginPath(); for (const l of lp) pathPts(ctx, l); ctx.lineWidth = 2.4; ctx.strokeStyle = PAP; ctx.lineJoin = 'round'; ctx.stroke(); ctx.fillStyle = INK; ctx.fill();
      ctx.save(); ctx.beginPath(); for (const l of lp) pathPts(ctx, l); ctx.clip();
      ctx.strokeStyle = PAP; ctx.lineCap = 'round';
      for (const t of L.tops) { ctx.lineWidth = .9; ctx.beginPath(); for (let x = t.x0; x <= t.x1; x += 3) ctx.lineTo(x, t.y + 2.6 + (noise1(x * .2, 3) - .5)); ctx.stroke(); ctx.lineWidth = .4; ctx.beginPath(); for (let x = t.x0; x <= t.x1; x += 3) ctx.lineTo(x, t.y + 5 + (noise1(x * .2, 5) - .5)); ctx.stroke(); }
      const r = rng(4);
      // tallado de linóleo: surcos que siguen la forma de cada superficie, juntos arriba y cada vez más
      // separados (y delgados) al bajar, con cortes donde la gubia se levantó
      const tope = x => { const cx = Math.floor(x / T); for (let cy = 0; cy < 16; cy++) if (L.solid(cx, cy)) return cy * T; return null; };
      const OFF = [8, 10.5, 13.5, 17, 21, 25.5, 31, 37.5, 45, 54, 64, 76];
      for (let k = 0; k < OFF.length; k++) {
        ctx.lineWidth = Math.max(.25, .8 - k * .05); ctx.beginPath(); let pluma = false;
        for (let x = 0; x <= L.ww; x += 2) {
          const t0 = tope(x); if (t0 === null) { pluma = false; continue; }
          const y = t0 + OFF[k] + (noise1(x * .06, k * 7) - .5) * (1.2 + k * .35), corte = noise1(x * .09, k * 13 + 3) > .78 - k * .015;
          if (corte) { pluma = false; continue; }
          if (pluma) ctx.lineTo(x, y); else { ctx.moveTo(x, y); pluma = true; }
        }
        ctx.stroke();
      }
      // piedras talladas en lo hondo: un contorno y medio sombreado de rayas
      for (let i = 0; i < 70; i++) {
        const x = r() * L.ww, y = 150 + r() * 90, d = L.depth(x, y); if (d < 34) continue;
        const w = 4 + r() * 6, h = w * (.5 + r() * .25); ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(x, y, w + 1.2, h + 1.2, 0, 0, TAU); ctx.fill();
        ctx.lineWidth = .6; ctx.beginPath(); ctx.ellipse(x, y, w, h, (r() - .5) * .3, 0, TAU); ctx.stroke();
        ctx.lineWidth = .35; ctx.beginPath(); for (let k = -w; k < w * .1; k += 1.6) { ctx.moveTo(x + k, y - h * .6); ctx.lineTo(x + k + 1.4, y + h * .6); } ctx.stroke();
      }
      ctx.restore();
      ctx.lineCap = 'round';
      for (const t of L.tops) { ctx.strokeStyle = INK; ctx.lineWidth = .7; ctx.beginPath(); for (let x = t.x0 + 1; x < t.x1 - 1; x += 1.6 + R(x | 0, 2) * 2) { const h = 1.5 + R(x | 0, 3) * 4; ctx.moveTo(x, t.y); ctx.lineTo(x + (R(x | 0, 4) - .5) * 2, t.y - h); } ctx.stroke(); }
      for (const o of L.deco) {
        const x = o.x, y = o.y;
        if (o.k === 'T') {
          const palm = o.i % 2 === 1, TP = (pt) => { ctx.beginPath(); if (palm) CAMP.palma(ctx, x, y + 1, 50 + R(o.i, 1) * 14, (R(o.i, 2) - .5) * .5, o.i, 0, pt); else CAMP.ceiba(ctx, x, y + 1, 54 + R(o.i, 1) * 10, 44, o.i, pt); };
          TP(); ctx.fillStyle = INK; ctx.fill();
          ctx.save(); TP('crown'); ctx.clip(); ctx.strokeStyle = PAP; ctx.lineWidth = .4; ctx.beginPath(); for (let k = -20; k < 20; k++) { ctx.moveTo(x + k * 3, y - 20); ctx.lineTo(x + k * 3 + 8, y - 80); } ctx.stroke(); ctx.restore();
        } else if (o.k === 'f') {
          for (let k = 0; k < 3; k++) { const fx = x - 6 + k * 6, fy = y - 8 - (k % 2) * 3; ctx.strokeStyle = INK; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(fx, y); ctx.lineTo(fx, fy); ctx.stroke(); ctx.fillStyle = k === 1 ? RED : INK; ctx.beginPath(); ctx.moveTo(fx - 2.6, fy - 3.5); ctx.lineTo(fx - 1.2, fy - 1.6); ctx.lineTo(fx, fy - 4); ctx.lineTo(fx + 1.2, fy - 1.6); ctx.lineTo(fx + 2.6, fy - 3.5); ctx.quadraticCurveTo(fx + 2.6, fy + 1, fx, fy + 1); ctx.quadraticCurveTo(fx - 2.6, fy + 1, fx - 2.6, fy - 3.5); ctx.fill(); }
        } else if (o.k === 'r') {
          ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(x - 9, y + 1); ctx.lineTo(x - 6, y - 7); ctx.lineTo(x + 2, y - 9); ctx.lineTo(x + 8, y - 4); ctx.lineTo(x + 9, y + 1); ctx.fill();
          ctx.strokeStyle = PAP; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(x - 4, y - 5); ctx.lineTo(x + 1, y - 7); ctx.moveTo(x - 3, y - 2.5); ctx.lineTo(x + 4, y - 4.5); ctx.stroke();
        }
      }
    },
    player(ctx, p, f) {
      const g = drawHero(ctx, p, f, { lw: .7, line: PAP, body: INK, hair: INK, leg: INK, scarf: RED, noFace: true, eye: PAP });
      ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.face * g.sx, g.sy); ctx.strokeStyle = PAP; ctx.lineWidth = .45; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(2.4, -9.6 + g.bob); ctx.lineTo(2.6, -4 + g.bob); ctx.moveTo(.8, -9 + g.bob); ctx.lineTo(1, -5 + g.bob); ctx.moveTo(2.8, -17.6 + g.bob); ctx.quadraticCurveTo(5.2, -16.5 + g.bob, 5.2, -13.5 + g.bob); ctx.stroke(); ctx.restore();
    },
    coin(ctx, x, y, t) {
      const yy = y + Math.sin(t * 2.4 + x) * 1.5, s = Math.max(.2, Math.abs(Math.cos(t * 2.5 + x * .05)));
      ctx.save(); ctx.translate(x, yy); ctx.scale(s, 1); ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill();
      ctx.strokeStyle = PAP; ctx.lineWidth = .6; ctx.beginPath(); ctx.arc(0, 0, 3.3, 0, TAU); ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = .8; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.stroke(); ctx.restore();
    },
    goal(ctx, x, y, t) {
      ctx.fillStyle = INK; ctx.fillRect(x - 1, y - 46, 2, 46);
      ctx.fillStyle = RED; ctx.beginPath(); ctx.moveTo(x + 1, y - 46); ctx.lineTo(x + 19, y - 41 + Math.sin(t * 3)); ctx.lineTo(x + 1, y - 35); ctx.fill();
      ctx.strokeStyle = PAP; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(x + 3, y - 43); ctx.lineTo(x + 12, y - 41); ctx.moveTo(x + 3, y - 40); ctx.lineTo(x + 9, y - 39); ctx.stroke();
    },
    over(ctx, f) {
      const n = cached(f, 'inkwear', VW, VH, x => { x.filter = `blur(${2 * f.S}px)`; const r = rng(7); for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(239,229,207,${.03 + r() * .06})`; x.beginPath(); x.ellipse(r() * VW, r() * VH, 10 + r() * 40, 4 + r() * 14, r() * 3, 0, TAU); x.fill(); } });
      ctx.drawImage(n, 0, 0, VW, VH);
      grainMul(ctx, f, .45, 'linograin', { grain: 30, blot: 12, fibers: 10 });
    },
  });
})();
