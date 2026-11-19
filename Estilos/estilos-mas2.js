'use strict';
// =====================================================================
//  Segunda tanda (2/3): tiza en pizarrón, cyberpunk lluvioso,
//  polígonos cinemáticos, Bauhaus, vaporwave, guache de cuento
// =====================================================================
(function () {
  const R = (i, s) => hash1(i, s);
  const circles = (ctx, cs) => { ctx.beginPath(); for (const [x, y, r] of cs) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); } };
  const grain = (ctx, f, a, name, o) => { ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = a; ctx.drawImage(paperTex(f, name, '#f7f3ea', o || { grain: 24, blot: 10, fibers: 8 }), 0, 0, VW, VH); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; };

  // ======================= TIZA EN PIZARRON =======================
  function chalk(ctx, pts, col, lw, seed, close, passes = 3) {
    const r = rng(seed);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = col;
    for (let k = 0; k < passes; k++) {
      const d = []; for (let i = 0; i < 6; i++) d.push(.5 + r() * 5, .2 + r() * 1.2);
      ctx.setLineDash(d); ctx.globalAlpha = .45 + r() * .3; ctx.lineWidth = lw * (.6 + r() * .6);
      ctx.beginPath(); pts.forEach((p, i) => { const jx = (noise1(i * .4 + k * 5, seed + k) - .5) * lw * 1.2, jy = (noise1(i * .4 + k * 3, seed + k + 9) - .5) * lw * 1.2; i ? ctx.lineTo(p[0] + jx, p[1] + jy) : ctx.moveTo(p[0] + jx, p[1] + jy); }); if (close) ctx.closePath(); ctx.stroke();
    }
    ctx.setLineDash([]); ctx.globalAlpha = 1;
  }
  const circ = (cx, cy, r, n = 20) => { const o = []; for (let i = 0; i <= n; i++) { const a = i / n * TAU; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; };
  function chalkHatch(ctx, x0, y0, x1, y1, col, sp, ang, seed) { const r = rng(seed); ctx.strokeStyle = col; ctx.lineCap = 'round'; const h = y1 - y0, dx = Math.tan(ang) * h; for (let x = x0 - Math.abs(dx); x < x1 + Math.abs(dx); x += sp * (.7 + r() * .6)) { ctx.globalAlpha = .25 + r() * .3; ctx.lineWidth = .5 + r() * .7; ctx.setLineDash([1 + r() * 6, .3 + r()]); ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x + dx, y0); ctx.stroke(); } ctx.setLineDash([]); ctx.globalAlpha = 1; }
  const CH = '#f2f2ea';

  // ======================= CYBERPUNK LLUVIOSO =======================
  const NP = '#ff2a6d', NC = '#05d9e8', NY = '#f9f871';
  function cityLayer(x, w, f, o) {
    const r = rng(o.seed);
    for (let bx = -10; bx < w + 10;) {
      const bw = o.wmin + r() * o.wvar, bh = o.hmin + r() * o.hvar, top = o.base - bh;
      x.fillStyle = o.col; x.fillRect(bx, top, bw, VH - top);
      if (r() < .4) { x.fillRect(bx + bw * .4, top - 8 - r() * 10, 1, 18); }
      x.fillStyle = o.win;
      for (let wy = top + 4; wy < o.base + 30; wy += o.ws) for (let wx = bx + 2; wx < bx + bw - 2; wx += o.ws * .8) if (r() < o.lit) x.fillRect(wx, wy, o.ws * .4, o.ws * .5);
      if (r() < o.signs) {
        const sy = top + 8 + r() * bh * .4, c = [NP, NC, NY][(r() * 3) | 0], vert = r() < .5;
        x.save(); x.shadowColor = c; x.shadowBlur = 6 * f.S; x.strokeStyle = c; x.lineWidth = .8; x.fillStyle = rgba(c, .25);
        if (vert) { x.fillRect(bx + bw - 6, sy, 5, 26); x.strokeRect(bx + bw - 6, sy, 5, 26); x.fillStyle = c; x.font = '4px sans-serif'; x.textAlign = 'center'; ['ラ', 'ー', 'メ', 'ン'].forEach((ch, i) => x.fillText(ch, bx + bw - 3.5, sy + 6 + i * 6)); }
        else { x.fillRect(bx + 2, sy, bw - 4, 7); x.strokeRect(bx + 2, sy, bw - 4, 7); x.fillStyle = c; x.font = 'bold 5px sans-serif'; x.textAlign = 'center'; x.fillText(['BAR', '24H', 'HOTEL', 'NOODLE', 'ITZEL'][(r() * 5) | 0], bx + bw / 2, sy + 5.3); }
        x.restore(); x.textAlign = 'left';
      }
      bx += bw + o.gap * r();
    }
    const fog = x.createLinearGradient(0, o.base - 40, 0, o.base + 30); fog.addColorStop(0, 'rgba(120,40,160,0)'); fog.addColorStop(1, rgba(o.fog, .5)); x.fillStyle = fog; x.fillRect(0, o.base - 40, w, VH);
  }
  // plataforma petrolera: patas de celosía, cubierta, módulos, torre de perforación, grúa, helipuerto y mechero
  function plataformaMar(x, cx, base, s, col, luz, seed) {
    const dk = base - 34 * s, W = 46 * s;
    x.strokeStyle = col; x.lineWidth = 1.5 * s; x.beginPath();
    for (const d of [-.8, -.3, .3, .8]) { x.moveTo(cx + d * W, dk); x.lineTo(cx + d * W * 1.1, base + 8); }
    for (let y = dk + 8 * s; y < base; y += 11 * s) { x.moveTo(cx - W * .86, y); x.lineTo(cx + W * .86, y); x.moveTo(cx - W * .86, y); x.lineTo(cx - W * .3, y + 9 * s); x.moveTo(cx + W * .3, y + 9 * s); x.lineTo(cx + W * .86, y); }
    x.stroke();
    x.fillStyle = col; x.fillRect(cx - W, dk - 4 * s, W * 2, 5 * s);
    const mods = [[-.92, 22, 15], [-.42, 34, 13], [.12, 26, 18], [.6, 16, 12]];
    for (const [u, mw, mh] of mods) { const mx = cx + u * W, my = dk - 4 * s - mh * s; x.fillStyle = col; x.fillRect(mx, my, mw * s, mh * s); x.fillStyle = luz; for (let i = 0; i < mw / 5; i++) for (let j = 0; j < mh / 5; j++) if (hash2(i + seed * 3, j + (u * 9 | 0), 5) < .4) x.fillRect(mx + (2 + i * 5) * s, my + (2 + j * 5) * s, 1.8 * s, 1.5 * s); }
    // torre de perforación
    const tx0 = cx - W * .16, tb = dk - 17 * s, th = 44 * s; x.strokeStyle = col; x.lineWidth = 1 * s; x.beginPath(); x.moveTo(tx0 - 9 * s, tb); x.lineTo(tx0, tb - th); x.lineTo(tx0 + 9 * s, tb); for (let k = 1; k < 6; k++) { const u = k / 6, a = tx0 - 9 * s * (1 - u), b = tx0 + 9 * s * (1 - u), y = tb - th * u; x.moveTo(a, y); x.lineTo(b, y); x.lineTo(tx0 - 9 * s * (1 - u + 1 / 6), y + th / 6); } x.stroke();
    x.fillStyle = 'rgba(255,42,109,.95)'; x.beginPath(); x.arc(tx0, tb - th - 1, 1.2 * s, 0, TAU); x.fill();
    // helipuerto y grúa
    x.fillStyle = col; x.beginPath(); x.moveTo(cx + W * .7, dk - 20 * s); x.lineTo(cx + W * 1.12, dk - 20 * s); x.lineTo(cx + W * .86, dk - 14 * s); x.closePath(); x.fill();
    x.strokeStyle = col; x.lineWidth = 1.1 * s; x.beginPath(); x.moveTo(cx + W * .3, dk - 22 * s); x.lineTo(cx + W * .86, dk - 42 * s); x.moveTo(cx + W * .86, dk - 42 * s); x.lineTo(cx + W * .86, dk - 32 * s); x.stroke();
    // el mechero, con su llama
    const fx = cx - W - 16 * s, fy = dk - 26 * s; x.strokeStyle = col; x.lineWidth = 1.4 * s; x.beginPath(); x.moveTo(cx - W * .8, dk - 3 * s); x.lineTo(fx, fy); x.stroke();
    x.globalCompositeOperation = 'lighter'; glowDot(x, fx, fy - 5 * s, 20 * s, '#ff7a2a', .5); x.globalCompositeOperation = 'source-over';
    x.fillStyle = '#ffb040'; x.beginPath(); x.moveTo(fx - 2.4 * s, fy); x.quadraticCurveTo(fx - 3.4 * s, fy - 6 * s, fx + 1 * s, fy - 12 * s); x.quadraticCurveTo(fx + 3.4 * s, fy - 5 * s, fx + 2.4 * s, fy); x.closePath(); x.fill();
    x.fillStyle = '#fff0c0'; x.beginPath(); x.ellipse(fx, fy - 2.6 * s, 1.1 * s, 2.6 * s, 0, 0, TAU); x.fill();
  }
  defStyle({
    id: 'cyber', name: 'Cyberpunk lluvioso', ref: 'Blade Runner · Katana Zero · The Last Night', order: 31,
    desc: 'Ciudad nocturna en capas con letreros de neón, lluvia constante, metal mojado que refleja colores y un héroe con visor.',
    fx: { dust: ['#8ab0d0'], spark: [NC, '#ffffff', NP], confetti: [NP, NC, NY, '#ffffff'] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'sky', x => { const g = x.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#070912'); g.addColorStop(.6, '#2a1340'); g.addColorStop(1, '#5a1f5a'); x.fillStyle = g; x.fillRect(0, 0, VW, VH); glowDot(x, VW * .3, 150, 160, '#ff4fa0', .15); });
      // el Golfo de noche: la Sonda de Campeche, con sus plataformas y sus mecheros
      const mar = ctx.createLinearGradient(0, 172, 0, VH); mar.addColorStop(0, '#2a1340'); mar.addColorStop(1, '#070912'); ctx.fillStyle = mar; ctx.fillRect(0, 172, VW, VH - 172);
      ctx.strokeStyle = 'rgba(255,79,160,.2)'; ctx.lineWidth = .5; ctx.beginPath(); for (let y = 176; y < VH; y += 5) { const o = (f.t * 8 + y * 3) % 30; for (let x = -30 + o; x < VW; x += 30) { ctx.moveTo(x, y); ctx.lineTo(x + 12, y); } } ctx.stroke();
      const flota = (par, base, s, paso, col, luz, seed) => strip(ctx, f, 'sonda' + seed, par, (x, w) => { for (let k = 0, px = 40 + R(seed, 1) * 60; px < w + 60; k++, px += paso + R(k, seed) * paso * .5) plataformaMar(x, px, base, s, col, luz, seed + k); });
      flota(.1, 178, .55, 120, '#2a2048', 'rgba(255,200,120,.7)', 3);
      flota(.25, 196, .95, 200, '#151230', 'rgba(120,230,255,.8)', 7);
      flota(.45, 222, 1.5, 330, '#0b0a18', 'rgba(255,220,150,.85)', 11);
    },
    terrain(ctx, f) {
      allLoopsPath(ctx, L.loops); const g = ctx.createLinearGradient(0, 140, 0, VH); g.addColorStop(0, '#22263a'); g.addColorStop(1, '#0a0b12'); ctx.fillStyle = g; ctx.fill();
      ctx.save(); ctx.clip();
      for (const t of L.tops) {
        const rg = ctx.createLinearGradient(0, t.y, 0, t.y + 26); rg.addColorStop(0, 'rgba(255,42,109,.28)'); rg.addColorStop(.5, 'rgba(5,217,232,.12)'); rg.addColorStop(1, 'rgba(5,217,232,0)'); ctx.fillStyle = rg;
        for (let x = t.x0; x < t.x1; x += 3) { ctx.globalAlpha = .4 + R(x, 3) * .6; ctx.fillRect(x, t.y, 2, 6 + R(x, 4) * 20); }
        ctx.globalAlpha = 1;
      }
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = .7; ctx.beginPath(); for (let x = 0; x < L.ww; x += 16) { ctx.moveTo(x, 0); ctx.lineTo(x, VH + 8); } for (let y = 0; y < VH + 8; y += 16) { ctx.moveTo(0, y); ctx.lineTo(L.ww, y); } ctx.stroke();
      ctx.fillStyle = 'rgba(160,170,200,.35)'; for (let x = 3; x < L.ww; x += 16) for (let y = 3; y < VH + 8; y += 16) { ctx.fillRect(x, y, .8, .8); ctx.fillRect(x + 10, y + 10, .8, .8); }
      for (const l of L.loops) for (let i = 0; i < l.length; i++) { const a = l[i], b = l[(i + 1) % l.length]; if (a[0] !== b[0] || a[1] > 200) continue; const y0 = Math.min(a[1], b[1]), y1 = Math.min(Math.max(a[1], b[1]), y0 + 30), dir = b[1] > a[1] ? 1 : -1; ctx.save(); ctx.beginPath(); ctx.rect(a[0] - (dir > 0 ? 4 : 0), y0, 4, y1 - y0); ctx.clip(); ctx.fillStyle = '#f9c80e'; ctx.fillRect(a[0] - 4, y0, 8, y1 - y0); ctx.fillStyle = '#111'; for (let y = y0 - 8; y < y1; y += 5) { ctx.beginPath(); ctx.moveTo(a[0] - 5, y); ctx.lineTo(a[0] + 5, y + 6); ctx.lineTo(a[0] + 5, y + 8.5); ctx.lineTo(a[0] - 5, y + 2.5); ctx.fill(); } ctx.restore(); }
      ctx.restore();
      ctx.save(); ctx.shadowColor = NC; ctx.shadowBlur = 6 * f.S; ctx.strokeStyle = NC; ctx.lineWidth = .8; ctx.beginPath(); for (const t of L.tops) { ctx.moveTo(t.x0 + 1, t.y + .5); ctx.lineTo(t.x1 - 1, t.y + .5); } ctx.stroke(); ctx.restore();
      for (const o of L.deco) {
        const x = o.x, y = o.y;
        if (o.k === 'T') {
          ctx.fillStyle = '#2a2d40'; ctx.fillRect(x - 1, y - 44, 2, 44); ctx.fillRect(x - 1, y - 44, 10, 1.6);
          ctx.save(); ctx.shadowColor = NP; ctx.shadowBlur = 10 * f.S; ctx.fillStyle = '#ffd0e0'; ctx.fillRect(x + 4, y - 42.6, 6, 1.4); ctx.restore();
          ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,42,109,.08)'; ctx.beginPath(); ctx.moveTo(x + 4, y - 42); ctx.lineTo(x + 10, y - 42); ctx.lineTo(x + 22, y); ctx.lineTo(x - 8, y); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
        } else if (o.k === 'f') {
          ctx.save(); ctx.shadowColor = NY; ctx.shadowBlur = 5 * f.S; ctx.strokeStyle = NY; ctx.lineWidth = .6; ctx.strokeRect(x - 6, y - 7, 12, 6); ctx.fillStyle = NY; ctx.font = 'bold 4px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('OPEN', x, y - 2.6); ctx.restore(); ctx.textAlign = 'left'; ctx.fillStyle = '#2a2d40'; ctx.fillRect(x - .5, y - 1, 1, 1);
        } else if (o.k === 'r') {
          ctx.fillStyle = '#3a3f58'; ctx.fillRect(x - 8, y - 9, 10, 9); ctx.fillStyle = '#2c3046'; ctx.fillRect(x + 1, y - 6, 8, 6); ctx.strokeStyle = '#5a6080'; ctx.lineWidth = .5; ctx.strokeRect(x - 8, y - 9, 10, 9); ctx.beginPath(); ctx.moveTo(x - 8, y - 9); ctx.lineTo(x + 2, y); ctx.stroke();
        }
      }
    },
    player(ctx, p, f) {
      const g = drawHero(ctx, p, f, { lw: .6, line: '#4a4f70', body: '#1c1e2e', body2: '#2a2d44', hair: '#24263a', skin: '#24263a', scarf: NP, leg: '#141522', noFace: true });
      const X = heroXf(p, g), a = X(1.5, -14.6 + g.bob), b = X(5, -14.6 + g.bob);
      ctx.save(); ctx.shadowColor = NC; ctx.shadowBlur = 6 * f.S; ctx.strokeStyle = NC; ctx.lineWidth = 1.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore();
    },
    coin(ctx, x, y, t, f) {
      const yy = y + Math.sin(t * 3 + x) * 1.5, s = Math.cos(t * 3 + x * .05);
      ctx.save(); ctx.translate(x, yy); ctx.scale(Math.max(.15, Math.abs(s)), 1); ctx.shadowColor = NC; ctx.shadowBlur = 6 * f.S;
      ctx.fillStyle = 'rgba(5,217,232,.35)'; ctx.strokeStyle = NC; ctx.lineWidth = .8; ctx.beginPath(); ctx.rect(-4, -4, 8, 8); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0; ctx.strokeStyle = '#d0ffff'; ctx.lineWidth = .4; ctx.beginPath(); ctx.moveTo(-4, -1.5); ctx.lineTo(-6, -1.5); ctx.moveTo(-4, 1.5); ctx.lineTo(-6, 1.5); ctx.moveTo(4, -1.5); ctx.lineTo(6, -1.5); ctx.moveTo(4, 1.5); ctx.lineTo(6, 1.5); ctx.stroke(); ctx.restore();
    },
    goal(ctx, x, y, t, f) {
      ctx.fillStyle = '#14162a'; ctx.fillRect(x - 9, y - 28, 18, 28); ctx.strokeStyle = '#3a3f58'; ctx.lineWidth = .8; ctx.strokeRect(x - 9, y - 28, 18, 28);
      ctx.fillStyle = 'rgba(57,255,120,.15)'; ctx.fillRect(x - 7, y - 26, 14, 26);
      const on = hash1(Math.floor(t * 9), 4) > .07; if (on) { ctx.save(); ctx.shadowColor = '#39ff78'; ctx.shadowBlur = 8 * f.S; ctx.fillStyle = '#b0ffc8'; ctx.font = 'bold 6px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('EXIT', x, y - 32); ctx.restore(); ctx.textAlign = 'left'; }
    },
    particle(ctx, q) { ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, q.x, q.y, q.s * 2, q.c, clamp(q.life / q.max, 0, 1) * .8); ctx.globalCompositeOperation = 'source-over'; },
    over(ctx, f) {
      ctx.strokeStyle = 'rgba(170,200,255,.28)'; ctx.lineWidth = .4; ctx.beginPath();
      ambient(140, 21, (i, a, b, c) => { const sp = 200 + c * 120, x = wrap(a * VW * 1.2 - f.t * sp * .18 + f.cam * (c * .2), VW + 20) - 10, y = wrap(b * VH + f.t * sp, VH + 30) - 15, l = 5 + c * 7; ctx.moveTo(x, y); ctx.lineTo(x - l * .18, y + l); });
      ctx.stroke();
      ambient(16, 33, (i, a, b) => { const t = wrap(f.t * 3 + b * 7, 1), x = a * VW; if (t < .3) { ctx.strokeStyle = `rgba(170,200,255,${.5 - t})`; ctx.lineWidth = .4; ctx.beginPath(); ctx.ellipse(x, 182, t * 10, t * 2, 0, 0, TAU); ctx.stroke(); } });
      vignette(ctx, .5, '#05030a');
    },
  });

  // ======================= POLIGONOS CINEMATICOS =======================
  defStyle({
    id: 'cinema', name: 'Polígonos cinemáticos', ref: 'Another World · Flashback · Out of This World', order: 32,
    desc: 'Planeta alienígena hecho de polígonos planos sin contorno, tres tonos por superficie, dos lunas y franjas de cine.',
    fx: { dust: ['#5a4a5a'], spark: ['#7ff0e0', '#ffffff'], confetti: ['#7ff0e0', '#e09a5a', '#ffffff'] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'sky', x => {
        const g = x.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#1a1830'); g.addColorStop(.45, '#5a3048'); g.addColorStop(.75, '#c0604a'); g.addColorStop(1, '#f0a060'); x.fillStyle = g; x.fillRect(0, 0, VW, VH);
        x.fillStyle = '#f2e0c0'; x.beginPath(); x.arc(110, 52, 20, 0, TAU); x.fill(); x.fillStyle = '#d8c0a0'; x.beginPath(); x.moveTo(110, 32); x.arc(110, 52, 20, -Math.PI / 2, Math.PI / 2); x.closePath(); x.fill();
        x.fillStyle = '#c8a0a0'; x.beginPath(); x.arc(150, 38, 7, 0, TAU); x.fill();
        // las lunas con halo, cráteres y mares: se ven redondas y no como discos recortados
        x.save(); x.globalCompositeOperation = 'lighter';
        for (const [mx, my, mr, a] of [[110, 52, 20, .2], [150, 38, 7, .12]]) { const hg = x.createRadialGradient(mx, my, mr * .8, mx, my, mr * 3); hg.addColorStop(0, 'rgba(255,220,180,' + a + ')'); hg.addColorStop(1, 'rgba(255,220,180,0)'); x.fillStyle = hg; x.beginPath(); x.arc(mx, my, mr * 3, 0, TAU); x.fill(); }
        x.restore();
        x.save(); x.beginPath(); x.arc(110, 52, 20, 0, TAU); x.clip();
        x.fillStyle = 'rgba(150,120,105,.35)'; for (const [dx, dy, r] of [[-7, -6, 4.6], [6, 4, 3.6], [-9, 7, 2.6], [8, -9, 2.2], [0, 11, 2.8], [-2, 0, 1.6]]) { x.beginPath(); x.arc(110 + dx, 52 + dy, r, 0, TAU); x.fill(); }
        x.fillStyle = 'rgba(255,240,215,.35)'; for (const [dx, dy, r] of [[-8, -7, 3.2], [5, 3, 2.4]]) { x.beginPath(); x.arc(110 + dx - .8, 52 + dy - .8, r, 0, TAU); x.fill(); }
        x.fillStyle = 'rgba(70,40,70,.28)'; x.beginPath(); x.arc(122, 54, 20, 0, TAU); x.fill();   // el lado en sombra, con un borde suave
        x.restore();
        x.fillStyle = 'rgba(150,100,110,.35)'; for (const [dx, dy, r] of [[-2, -1, 1.8], [2, 2, 1.3]]) { x.beginPath(); x.arc(150 + dx, 38 + dy, r, 0, TAU); x.fill(); }
      });
      // selva de Calakmul, torres de Río Bec y la portada con boca de serpiente de Chicanná
      const selva = (par, base, col, seed) => strip(ctx, f, 'selva' + seed, par, (x, w) => { x.fillStyle = col; x.beginPath(); x.moveTo(0, VH); for (let xx = 0; xx <= w; xx += 9) x.lineTo(xx, base - 8 - R(xx, seed) * 12 - Math.sin(xx * .03 + seed) * 6); x.lineTo(w, VH); x.fill(); });
      const torre = (x, cx, base, tw, h, col, col2) => {
        const n = 7, sh = h / n;
        for (let i = 0; i < n; i++) { const b = tw * (1 - i / n * .55), y = base - (i + 1) * sh; x.fillStyle = col; x.fillRect(cx - b / 2, y, b, sh + .5); x.fillStyle = col2; x.fillRect(cx, y, b / 2, sh + .5); x.fillStyle = 'rgba(0,0,0,.2)'; x.fillRect(cx - b / 2, y + sh - 1, b, 1); }
        x.fillStyle = col; x.fillRect(cx - tw * .17, base - h - 9, tw * .34, 9); x.fillStyle = '#16101f'; x.fillRect(cx - tw * .07, base - h - 6, tw * .14, 6);
      };
      strip(ctx, f, 'riobec', .1, (x, w) => { for (let k = 0, px = 50; px < w + 80; k++, px += 170 + R(k, 3) * 90) { const col = '#6a3a52', col2 = '#8a4a5a', base = 176; x.fillStyle = col; x.fillRect(px - 44, base - 22, 88, 22); x.fillStyle = col2; x.fillRect(px, base - 22, 44, 22); x.fillStyle = '#3a2438'; for (const dx of [-26, 0, 26]) x.fillRect(px + dx - 4, base - 15, 8, 15); torre(x, px - 38, base, 22, 58 + R(k, 4) * 12, col, col2); torre(x, px + 38, base, 22, 58 + R(k, 5) * 12, col, col2); } });
      selva(.16, 176, '#4a2a44', 5);
      strip(ctx, f, 'chicanna', .25, (x, w) => {
        for (let k = 0, px = 120; px < w + 90; k++, px += 250 + R(k, 7) * 120) {
          const base = 172, W = 64, H = 70, col = '#3a2438', col2 = '#52304a', sombra = '#241628';
          x.fillStyle = col; x.fillRect(px - W, base - H, W * 2, H); x.fillStyle = col2; x.fillRect(px, base - H, W, H);
          x.fillStyle = sombra; x.fillRect(px - W - 3, base - H - 5, W * 2 + 6, 5);
          // ojos de grecas escalonadas
          for (const d of [-1, 1]) { const ex = px + d * 24, ey = base - H + 18; x.fillStyle = sombra; x.fillRect(ex - 11, ey - 9, 22, 18); x.fillStyle = col2; x.fillRect(ex - 8, ey - 6, 16, 12); x.fillStyle = sombra; x.fillRect(ex - 5, ey - 3, 10, 6); x.fillStyle = '#7ff0e0'; x.globalAlpha = .55; x.fillRect(ex - 2, ey - 1.5, 4, 3); x.globalAlpha = 1; }
          // la nariz y las fauces: se entra por la boca de la serpiente
          x.fillStyle = col2; x.beginPath(); x.moveTo(px - 5, base - H + 12); x.lineTo(px + 5, base - H + 12); x.lineTo(px + 8, base - H + 30); x.lineTo(px - 8, base - H + 30); x.closePath(); x.fill();
          x.fillStyle = '#120c18'; x.beginPath(); x.moveTo(px - 23, base - 30); x.lineTo(px + 23, base - 30); x.lineTo(px + 17, base); x.lineTo(px - 17, base); x.closePath(); x.fill();
          x.fillStyle = '#e8d8c0'; for (let i = 0; i < 7; i++) { const tx = px - 21 + i * 7; x.beginPath(); x.moveTo(tx - 3, base - 30); x.lineTo(tx + 3, base - 30); x.lineTo(tx, base - 23); x.closePath(); x.fill(); }
          for (let i = 0; i < 5; i++) { const tx = px - 14 + i * 7; x.beginPath(); x.moveTo(tx - 3, base); x.lineTo(tx + 3, base); x.lineTo(tx, base - 6); x.closePath(); x.fill(); }
          x.fillStyle = 'rgba(127,240,224,.2)'; x.beginPath(); x.ellipse(px, base - 8, 11, 9, 0, 0, TAU); x.fill();
        }
      });
      selva(.32, 190, '#2c1a30', 9);
    },
    terrain(ctx) {
      const lp = organicLoops({ step: 10, amp: 2.4, freq: .5, seed: 6 });
      ctx.beginPath(); for (const l of lp) pathPts(ctx, l); ctx.fillStyle = '#1c1826'; ctx.fill();
      ctx.save(); ctx.clip();
      // roca en facetas: triángulos de tonos cercanos, más claros cerca de la superficie (luz de arriba) y
      // cada vez más oscuros al bajar, con una luz fría de rebote en las paredes
      { const st = 13, filas = Math.ceil((VH + 16) / st), cols = Math.ceil(L.ww / st) + 2, P = [];
        for (let j = 0; j <= filas; j++) { P.push([]); for (let i = 0; i <= cols; i++) P[j].push([(i + (j % 2) * .5 + (hash2(i, j, 61) - .5) * .7) * st, 96 + (j + (hash2(i, j, 62) - .5) * .6) * st]); }
        for (let j = 0; j < filas; j++) for (let i = 0; i < cols; i++) for (const tri of j % 2 ? [[P[j][i], P[j][i + 1], P[j + 1][i + 1]], [P[j][i], P[j + 1][i + 1], P[j + 1][i]]] : [[P[j][i], P[j][i + 1], P[j + 1][i]], [P[j][i + 1], P[j + 1][i + 1], P[j + 1][i]]]) {
          const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, cy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3, d = L.depth(cx, cy); if (d < 0) continue;
          const luz = clamp(1 - d / 70, 0, 1), k = (hash2(cx | 0, cy | 0, 63) - .5) * .5 + luz * .7 - .15;
          ctx.fillStyle = k > 0 ? mix('#1c1826', '#4a3a56', Math.min(1, k)) : mix('#1c1826', '#100c16', Math.min(1, -k)); ctx.beginPath(); ctx.moveTo(...tri[0]); ctx.lineTo(...tri[1]); ctx.lineTo(...tri[2]); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = 'rgba(255,220,200,.03)'; ctx.lineWidth = .4; ctx.stroke();
        } }
      for (const [w, a] of [[14, .05], [5, .09], [1.6, .2]]) { ctx.beginPath(); for (const l of lp) pathPts(ctx, l); ctx.lineWidth = w; ctx.strokeStyle = `rgba(120,200,210,${a})`; ctx.stroke(); }
      for (const t of L.tops) {
        ctx.fillStyle = '#3a2e44'; ctx.beginPath(); ctx.moveTo(t.x0 - 4, t.y - 4); for (let x = t.x0; x <= t.x1 + 8; x += 12) ctx.lineTo(x, t.y + 9 + R(x, 3) * 8); ctx.lineTo(t.x1 + 8, t.y - 4); ctx.fill();
        ctx.fillStyle = '#5a3e4e'; ctx.beginPath(); ctx.moveTo(t.x0 - 4, t.y - 4); for (let x = t.x0; x <= t.x1 + 8; x += 18) ctx.lineTo(x, t.y + 3 + R(x, 5) * 3); ctx.lineTo(t.x1 + 8, t.y - 4); ctx.fill();
      }
      const r = rng(9); ctx.fillStyle = '#26202f'; for (let i = 0; i < 70; i++) { const x = r() * L.ww, y = 190 + r() * 50; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 8 + r() * 14, y + 2 + r() * 4); ctx.lineTo(x + 4, y + 8 + r() * 6); ctx.fill(); }
      ctx.restore();
      for (const t of L.tops) { ctx.strokeStyle = '#e08a5a'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(t.x0, t.y + .2); ctx.lineTo(t.x1, t.y + .2); ctx.stroke(); }
      for (const o of L.deco) {
        const x = o.x, y = o.y;
        if (o.k === 'T') { for (let k = 0; k < 4; k++) { const a = -Math.PI / 2 + (k - 1.5) * .35, h = 26 + R(k, o.i) * 22; const tx = x + Math.cos(a) * h, ty = y + Math.sin(a) * h; ctx.fillStyle = k % 2 ? '#1f3a3a' : '#2a5050'; ctx.beginPath(); ctx.moveTo(x - 2.5 + k, y); ctx.quadraticCurveTo(x + Math.cos(a + .4) * h * .5, y + Math.sin(a + .4) * h * .5, tx, ty); ctx.lineTo(tx + 3, ty + 4); ctx.quadraticCurveTo(x + Math.cos(a + .2) * h * .5 + 3, y + Math.sin(a + .2) * h * .5, x + 2.5 + k, y); ctx.fill(); ctx.fillStyle = '#7ff0e0'; ctx.beginPath(); ctx.arc(tx + 1.5, ty + 1.5, 1.4, 0, TAU); ctx.fill(); } }
        else if (o.k === 'f') { ctx.fillStyle = '#2a5050'; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(x - 6 + k * 3, y); ctx.lineTo(x - 7 + k * 3.4, y - 5 - (k % 2) * 4); ctx.lineTo(x - 4.5 + k * 3, y); ctx.fill(); } }
        else if (o.k === 'r') { ctx.fillStyle = '#2e2838'; ctx.beginPath(); ctx.moveTo(x - 10, y + 1); ctx.lineTo(x - 5, y - 9); ctx.lineTo(x + 4, y - 11); ctx.lineTo(x + 10, y + 1); ctx.fill(); ctx.fillStyle = '#4a3e52'; ctx.beginPath(); ctx.moveTo(x - 5, y - 9); ctx.lineTo(x + 4, y - 11); ctx.lineTo(x, y - 3); ctx.fill(); }
      }
    },
    player(ctx, p, f) { drawHero(ctx, p, f, { body: '#e0d8c8', body2: '#8a8478', hair: '#c0502a', skin: '#d8a078', scarf: '#c0502a', leg: '#2a2a3a', noFace: true }); },
    coin(ctx, x, y, t) { const yy = y + Math.sin(t * 2 + x) * 2; ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, yy, 10, '#7ff0e0', .4); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#d8fff8'; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t; ctx.lineTo(x + Math.cos(a) * 3, yy + Math.sin(a) * 3); } ctx.fill(); },
    goal(ctx, x, y, t) {
      ctx.fillStyle = '#2e2838'; ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x - 9, y - 4); ctx.lineTo(x + 9, y - 4); ctx.lineTo(x + 12, y); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(0, y - 50, 0, y - 4); g.addColorStop(0, 'rgba(127,240,224,0)'); g.addColorStop(1, `rgba(127,240,224,${.35 + Math.sin(t * 4) * .1})`); ctx.fillStyle = g; ctx.fillRect(x - 8, y - 50, 16, 46); ctx.globalCompositeOperation = 'source-over';
    },
    particle(ctx, q) { const a = clamp(q.life / q.max, 0, 1); ctx.globalAlpha = a; ctx.fillStyle = q.c; ctx.fillRect(q.x - q.s / 2, q.y - q.s / 2, q.s, q.s); ctx.globalAlpha = 1; },
    over(ctx) { ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, VW, 14); ctx.fillRect(0, VH - 14, VW, 14); },
  });

  // ======================= BAUHAUS =======================
  const BR = '#d6352b', BB = '#1d4e9e', BY = '#f2c230', BK = '#1a1a1a', BC = '#efe8d8';
  function shape(x, k, cx, cy, s, col) {
    x.fillStyle = col; x.beginPath();
    if (k === 0) x.arc(cx, cy, s, 0, TAU);
    else if (k === 1) { x.arc(cx, cy, s, Math.PI, 0); x.closePath(); }
    else if (k === 2) { x.moveTo(cx, cy); x.arc(cx, cy, s, -Math.PI / 2, 0); x.closePath(); }
    else if (k === 3) x.rect(cx - s * .5, cy - s, s, s * 2);
    else { x.moveTo(cx, cy - s); x.lineTo(cx + s, cy + s * .7); x.lineTo(cx - s, cy + s * .7); x.closePath(); }
    x.fill();
  }

  // ======================= VAPORWAVE =======================
  const VP = '#ff71ce', VC = '#01cdfe', VL = '#b967ff', VM = '#fffb96';
  function win98(x, x0, y0, w, h, title, body) {
    x.fillStyle = '#c0c0c0'; x.fillRect(x0, y0, w, h); x.fillStyle = '#ffffff'; x.fillRect(x0, y0, w, .8); x.fillRect(x0, y0, .8, h); x.fillStyle = '#404040'; x.fillRect(x0, y0 + h - .8, w, .8); x.fillRect(x0 + w - .8, y0, .8, h);
    const g = x.createLinearGradient(x0, 0, x0 + w, 0); g.addColorStop(0, '#000080'); g.addColorStop(1, '#1084d0'); x.fillStyle = g; x.fillRect(x0 + 1.5, y0 + 1.5, w - 3, 6);
    x.fillStyle = '#ffffff'; x.font = 'bold 4.5px Tahoma, sans-serif'; x.fillText(title, x0 + 3, y0 + 6); x.fillStyle = '#c0c0c0'; x.fillRect(x0 + w - 7, y0 + 2.3, 4.5, 4.2); x.fillStyle = '#000'; x.fillText('×', x0 + w - 6.4, y0 + 6);
    x.fillStyle = '#000'; x.font = '5px Tahoma, sans-serif'; x.fillText(body, x0 + 5, y0 + 16);
  }

  // ======================= GUACHE DE CUENTO =======================
  const GT = '#2f6f6a', GM = '#e0a83a', GC = '#e2694a', GD = '#1f4a3a', GW = '#f3e6cf';
  function gouache(ctx, path, col, seed, n = 60, bb) {
    path(); ctx.fillStyle = col; ctx.fill();
    ctx.save(); path(); ctx.clip(); const r = rng(seed), [x0, y0, x1, y1] = bb; ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0); ctx.strokeStyle = jitterColor(col, .07, r()); ctx.globalAlpha = .5; ctx.lineWidth = 1.5 + r() * 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 4 + r() * 8, y + (r() - .5) * 2); ctx.stroke(); }
    ctx.globalAlpha = 1; ctx.restore();
  }
  function blairTree(ctx, x, y, kind, seed) {
    const r = rng(seed);
    ctx.fillStyle = '#5a3a2a'; ctx.fillRect(x - .8, y - 22, 1.6, 22);
    if (kind === 0) { ctx.fillStyle = GD; ctx.beginPath(); ctx.ellipse(x, y - 34, 7, 18, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(243,230,207,.7)'; for (let k = 0; k < 9; k++) { ctx.beginPath(); ctx.arc(x + (r() - .5) * 8, y - 48 + k * 3.5, .7, 0, TAU); ctx.fill(); } }
    else if (kind === 1) { ctx.fillStyle = GC; ctx.beginPath(); ctx.arc(x, y - 32, 11, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(243,230,207,.6)'; ctx.lineWidth = .8; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(x, y - 32, 3 + k * 3, 0, TAU); ctx.stroke(); } }
    else { ctx.fillStyle = GT; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(x, y - 50 + k * 9); ctx.lineTo(x + 9 - k, y - 30 + k * 6); ctx.lineTo(x - 9 + k, y - 30 + k * 6); ctx.fill(); } }
  }
  function ridgeG(xx, base, amp, fr, seed) { return base - fbm1(xx * fr, seed, 3) * amp; }
  function ridgeFillG(x, w, base, amp, fr, seed) { x.beginPath(); x.moveTo(0, VH + 4); for (let xx = 0; xx <= w; xx += 3) x.lineTo(xx, ridgeG(xx, base, amp, fr, seed)); x.lineTo(w, VH + 4); x.closePath(); }
})();
