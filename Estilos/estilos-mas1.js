'use strict';
// =====================================================================
//  Segunda tanda (1/3): cielo anime, ukiyo-e, art nouveau, art déco,
//  cómic pop art, alebrije, talavera
// =====================================================================
(function () {
  const R = (i, s) => hash1(i, s);
  const circles = (ctx, cs) => { ctx.beginPath(); for (const [x, y, r] of cs) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); } };
  // patron en unidades de mundo, nitido a cualquier escala
  function pat(ctx, f, name, w, h, draw) { const c = cached(f, 'pat-' + name, w, h, draw); const p = ctx.createPattern(c, 'repeat'); p.setTransform(new DOMMatrix([1 / f.S, 0, 0, 1 / f.S, 0, 0])); return p; }
  const grain = (ctx, f, a, name, o) => { ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = a; ctx.drawImage(paperTex(f, name, '#f7f3ea', o || { grain: 24, blot: 10, fibers: 8 }), 0, 0, VW, VH); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; };

  // ======================= CIELO ANIME =======================
  function animeCloud(x, cx, cy, w, h, seed) {
    const r = rng(seed), cs = [];
    for (let i = 0; i < 16; i++) { const t = i / 15, rr = h * (.35 + Math.sin(t * Math.PI) * .55) * (.7 + r() * .5); cs.push([cx - w / 2 + t * w + (r() - .5) * 8, cy - Math.sin(t * Math.PI) * h * .55 + (r() - .5) * h * .3, rr]); }
    for (let i = 0; i < 6; i++) { const t = .2 + r() * .6; cs.push([cx - w / 2 + t * w, cy - h * (.7 + r() * .5), h * (.25 + r() * .3)]); }
    x.save(); x.beginPath(); x.rect(cx - w, cy - h * 3, w * 2, h * 3 + h * .25); x.clip();
    circles(x, cs); x.fillStyle = '#a9bce4'; x.fill();
    circles(x, cs.map(([a, b, c]) => [a - c * .12, b - c * .22, c * .86])); x.fillStyle = '#f4f8ff'; x.fill();
    circles(x, cs.map(([a, b, c]) => [a - c * .25, b - c * .4, c * .5])); x.fillStyle = '#ffffff'; x.fill();
    x.restore();
    x.fillStyle = 'rgba(150,170,215,.5)'; x.fillRect(cx - w * .55, cy + h * .25 - 1.2, w * 1.1, 1.2);
  }
  defStyle({
    id: 'anime', name: 'Cielo anime', ref: 'Makoto Shinkai · Ghibli · A Short Hike', order: 23,
    desc: 'Cúmulos enormes con sombreado cel, postes de luz con cables, pasto con dos tonos duros y destellos de lente.',
    fx: { dust: ['#ffffff', '#e8f4ff'], spark: ['#fffbe0', '#ffe27a', '#ffffff'], confetti: ['#ff8fb0', '#ffffff', '#7fd0ff', '#ffe27a'] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'sky', x => { const g = x.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#1f5fcf'); g.addColorStop(.45, '#5aa6ee'); g.addColorStop(.8, '#bfe4ff'); g.addColorStop(1, '#e8f6ff'); x.fillStyle = g; x.fillRect(0, 0, VW, VH); });
      strip(ctx, f, 'clouds', .05, (x, w) => { for (let k = 0; k < w / 170; k++) animeCloud(x, 60 + k * 170 + R(k, 1) * 60, 120 + R(k, 2) * 30, 110 + R(k, 3) * 70, 34 + R(k, 4) * 22, k + 3); });
      strip(ctx, f, 'smallc', .12, (x, w) => { for (let k = 0; k < w / 120; k++) animeCloud(x, 30 + k * 120 + R(k, 5) * 50, 40 + R(k, 6) * 40, 40 + R(k, 7) * 30, 10 + R(k, 8) * 6, k + 50); });
      campPath(ctx, f, .08, 172, 'far', 3, 1.3); ctx.fillStyle = '#9ec0e8'; ctx.fill();
      strip(ctx, f, 'town', .2, (x, w) => {
        x.beginPath(); CAMP.skyline(x, 0, w, 188, 'mid', 5, 1.55, 1); x.fillStyle = '#f2e6cc'; x.fill();
        x.save(); x.clip(); x.fillStyle = 'rgba(120,130,170,.35)'; for (let xx = 0; xx < w; xx += 1) { const s = CAMP.seg(xx, 'mid', 5); if (s.t !== 'casas' && (xx - s.x0) % 11 > 7) x.fillRect(xx, 120, 1, 70); } x.restore();
        for (const fa of CAMP.facades(0, w, 5)) {
          const top = 188 - (4 + fa.h) * 1.55, c = CAMP.FACHADAS[fa.col];
          x.fillStyle = c; x.fillRect(fa.x0, top + (fa.top === 'pretil' ? 2.5 : 0), fa.w, VH - top);
          x.fillStyle = shade(c, -.16); x.fillRect(fa.x0 + fa.w * .72, top + 2.5, fa.w * .28, VH - top);
          x.fillStyle = 'rgba(40,40,80,.18)'; x.fillRect(fa.x0, top + 2.5, fa.w, 2.2);
          x.fillStyle = '#ffffff'; x.fillRect(fa.x0, top + 2.5, fa.w, .7);
          const n = Math.max(1, Math.floor(fa.w / 6.5)), gp = fa.w / n;
          for (let i = 0; i < n; i++) { const wx = fa.x0 + gp * (i + .5); x.fillStyle = '#ffffff'; x.fillRect(wx - 2.2, top + 7, 4.4, 8.4); x.fillStyle = '#3a4a78'; x.beginPath(); x.moveTo(wx - 1.6, top + 15); x.lineTo(wx - 1.6, top + 10); x.arc(wx, top + 10, 1.6, Math.PI, 0); x.lineTo(wx + 1.6, top + 15); x.fill(); x.fillStyle = '#7fa8e0'; x.fillRect(wx - 1.6, top + 9, 1, 3); x.fillStyle = '#2a2a3a'; x.fillRect(wx - 2.6, top + 15, 5.2, .8); }
          if (fa.doors) { const dx = fa.x0 + fa.w / 2; x.fillStyle = '#6a3a2a'; x.beginPath(); x.moveTo(dx - 2.6, 188); x.lineTo(dx - 2.6, 180); x.arc(dx, 180, 2.6, Math.PI, 0); x.lineTo(dx + 2.6, 188); x.fill(); }
        }
      });
      campPath(ctx, f, .32, 208, 'near', 6, .8); ctx.fillStyle = '#3f8a56'; ctx.fill();
      campProps(ctx, f, .32, 208, 'near', 6, .8, f.t); ctx.fillStyle = '#3f8a56'; ctx.fill();
      // postes y cables
      const par = .6, off = f.cam * par, sp = 150, k0 = Math.floor((off - 40) / sp);
      const top = [];
      for (let k = k0; k <= k0 + VW / sp + 2; k++) { const x = k * sp - off; top.push([x, 70 + R(k, 3) * 6]); }
      ctx.strokeStyle = '#26303f'; ctx.lineWidth = .5;
      for (let i = 0; i < top.length - 1; i++) for (const dy of [0, 5]) { const [a, b] = [top[i], top[i + 1]]; ctx.beginPath(); ctx.moveTo(a[0] - 6, a[1] + dy); ctx.quadraticCurveTo((a[0] + b[0]) / 2, a[1] + dy + 16, b[0] - 6, b[1] + dy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(a[0] + 6, a[1] + dy); ctx.quadraticCurveTo((a[0] + b[0]) / 2, a[1] + dy + 14, b[0] + 6, b[1] + dy); ctx.stroke(); }
      ctx.fillStyle = '#26303f';
      for (const [x, y] of top) { ctx.fillRect(x - 1.2, y - 4, 2.4, VH); ctx.fillRect(x - 9, y - 1, 18, 1.8); ctx.fillRect(x - 7, y + 4, 14, 1.4); }
    },
    terrain(ctx) {
      allLoopsPath(ctx, L.loops, 3); ctx.fillStyle = '#a8704c'; ctx.fill();
      ctx.save(); allLoopsPath(ctx, L.loops, 3); ctx.clip();
      ctx.fillStyle = '#7e5038'; ctx.beginPath(); ctx.moveTo(0, VH + 8); for (let x = 0; x <= L.ww; x += 8) ctx.lineTo(x, 214 + Math.sin(x * .03) * 4); ctx.lineTo(L.ww, VH + 8); ctx.fill();
      for (const t of L.tops) {
        ctx.fillStyle = '#86593e'; ctx.beginPath(); ctx.moveTo(t.x0, t.y + 6); for (let x = t.x0; x <= t.x1; x += 4) ctx.lineTo(x, t.y + 12 + (R(x, 3) - .5) * 3); ctx.lineTo(t.x1, t.y + 6); ctx.fill();
        ctx.fillStyle = '#4f9e48'; ctx.beginPath(); ctx.moveTo(t.x0 - 2, t.y - 1); ctx.lineTo(t.x1 + 2, t.y - 1); for (let x = t.x1 + 2; x >= t.x0 - 2; x -= 3) ctx.lineTo(x, t.y + 7 + ((x / 3 | 0) % 2) * 2.5); ctx.fill();
        ctx.fillStyle = '#7fd05c'; ctx.beginPath(); ctx.moveTo(t.x0 - 2, t.y - 1); ctx.lineTo(t.x1 + 2, t.y - 1); for (let x = t.x1 + 2; x >= t.x0 - 2; x -= 5) ctx.lineTo(x, t.y + 3.5 + R(x, 4) * 2); ctx.fill();
        ctx.fillStyle = '#c8f59a'; ctx.fillRect(t.x0 + 1, t.y, t.x1 - t.x0 - 2, .9);
      }
      // celuloide: capas de tierra con su línea, sombra dura bajo el pasto, piedras con brillo duro y raíces
      // capas que siguen la forma de cada superficie: cada una un poco más oscura, con su línea
      { const tope = x => { const cx = Math.floor(x / T); for (let cy = 0; cy < 16; cy++) if (L.solid(cx, cy)) return cy * T; return VH + 40; };
        for (const off of [26, 48, 74, 104, 140]) {
          const yy = x => tope(x) + off + Math.sin(x * .028 + off) * 3.5 + Math.sin(x * .07 + off * .3) * 1.2;
          ctx.fillStyle = 'rgba(70,35,18,.13)'; ctx.beginPath(); ctx.moveTo(0, VH + 8); for (let x = 0; x <= L.ww; x += 4) ctx.lineTo(x, yy(x)); ctx.lineTo(L.ww, VH + 8); ctx.fill();
          ctx.strokeStyle = 'rgba(90,50,28,.6)'; ctx.lineWidth = .7; ctx.beginPath(); for (let x = 0; x <= L.ww; x += 4) ctx.lineTo(x, yy(x)); ctx.stroke();
          ctx.strokeStyle = 'rgba(230,175,130,.35)'; ctx.lineWidth = .4; ctx.beginPath(); for (let x = 0; x <= L.ww; x += 4) ctx.lineTo(x, yy(x) - 1); ctx.stroke();
        } }
      for (const t of L.tops) { ctx.fillStyle = 'rgba(70,35,20,.42)'; ctx.beginPath(); ctx.moveTo(t.x0 - 2, t.y + 6); for (let x = t.x0 - 2; x <= t.x1 + 2; x += 3) ctx.lineTo(x, t.y + 15 + Math.sin(x * .4) * 1.4 + (R(x | 0, 21) - .5) * 2); ctx.lineTo(t.x1 + 2, t.y + 6); ctx.fill(); }
      const r = rng(3);
      for (let i = 0; i < 520; i++) { const x = r() * L.ww, y = 20 + r() * 230; if (L.depth(x, y) < 18) continue; const w = 1.6 + r() * 3.4, h = w * (.55 + r() * .2);
        ctx.fillStyle = '#6a4028'; ctx.beginPath(); ctx.ellipse(x, y, w + .6, h + .6, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#b98058'; ctx.beginPath(); ctx.ellipse(x, y, w, h, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#8a5638'; ctx.beginPath(); ctx.ellipse(x + w * .2, y + h * .3, w * .85, h * .6, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#f2d2b0'; ctx.beginPath(); ctx.ellipse(x - w * .35, y - h * .35, w * .28, h * .18, -.3, 0, TAU); ctx.fill(); }
      for (let i = 0; i < 220; i++) { const x = r() * L.ww, y = 20 + r() * 230; if (L.depth(x, y) < 20) continue; ctx.strokeStyle = 'rgba(232,180,140,.45)'; ctx.lineWidth = .7; const l = 4 + r() * 8; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l, y + (r() - .5)); ctx.stroke(); }
      ctx.lineCap = 'round';
      for (const t of L.tops) for (let x = t.x0 + 4; x < t.x1 - 4; x += 10 + R(x | 0, 22) * 18) { if (R(x | 0, 23) < .45) continue; let px = x, py = t.y + 9; const n = 3 + (R(x | 0, 24) * 3 | 0); ctx.strokeStyle = '#5a3420'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(px, py); for (let k = 0; k < n; k++) { px += (R(x | 0, 30 + k) - .5) * 4; py += 2.5 + R(x | 0, 40 + k) * 3; ctx.lineTo(px, py); } ctx.stroke(); ctx.strokeStyle = 'rgba(232,180,140,.5)'; ctx.lineWidth = .35; ctx.stroke(); }
      ctx.restore();
      for (const r of L.tops) for (let x = r.x0 + 1; x < r.x1 - 1; x += 1.4) { if (R(x * 10 | 0, 5) > .45) continue; const h = 1.5 + R(x * 10 | 0, 6) * 3.5; ctx.fillStyle = R(x * 10 | 0, 7) < .5 ? '#7fd05c' : '#4f9e48'; ctx.beginPath(); ctx.moveTo(x - .7, r.y); ctx.lineTo(x + (R(x * 10 | 0, 8) - .5), r.y - h); ctx.lineTo(x + .7, r.y); ctx.fill(); }
      for (const o of L.deco) {
        const x = o.x, y = o.y;
        if (o.k === 'T') {
          const palm = o.i % 2 === 1, TP = (pt) => { ctx.beginPath(); if (palm) CAMP.palma(ctx, x, y + 1, 50 + R(o.i, 1) * 14, (R(o.i, 2) - .5) * .5, o.i, 0, pt); else CAMP.ceiba(ctx, x, y + 1, 54 + R(o.i, 1) * 10, 44, o.i, pt); };
          TP('trunk'); ctx.fillStyle = '#6a4430'; ctx.fill();
          TP('crown'); ctx.fillStyle = '#2f7a44'; ctx.fill(); ctx.save(); TP('crown'); ctx.clip(); ctx.translate(-1.2, -1.8); TP('crown'); ctx.fillStyle = '#56b052'; ctx.fill(); ctx.translate(-1, -1.4); TP('crown'); ctx.fillStyle = '#9ee07a'; ctx.globalAlpha = .55; ctx.fill(); ctx.restore();
        } else if (o.k === 'f') {
          for (let k = 0; k < 4; k++) { const fx = x - 7 + k * 4.5, fy = y - 3 - (k % 2) * 2; ctx.fillStyle = '#3f8a3f'; ctx.fillRect(fx - .3, fy, .6, y - fy); ctx.fillStyle = k % 2 ? '#ffffff' : '#ffb3c8'; ctx.beginPath(); ctx.arc(fx, fy, 1.5, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffe27a'; ctx.beginPath(); ctx.arc(fx, fy, .5, 0, TAU); ctx.fill(); }
        } else if (o.k === 'r') {
          ctx.fillStyle = '#7f8aa0'; ctx.beginPath(); ctx.ellipse(x, y, 8, 6, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#b4c0d4'; ctx.beginPath(); ctx.ellipse(x - 2, y - 2, 5, 3.5, 0, Math.PI, 0); ctx.fill();
        }
      }
    },
    player(ctx, p, f) { drawHero(ctx, p, f, { lw: .8, line: '#2a1e2e', body: '#ffffff', body2: '#c8d4ee', skin: '#ffe4d0', hair: '#3a2a4a', scarf: '#e83a4a', leg: '#2a3a6a', eye: '#3a5aa0', glint: '#ffffff', cheek: 'rgba(255,120,140,.6)' }); },
    coin(ctx, x, y, t) {
      const yy = y + Math.sin(t * 2.6 + x) * 1.5, s = 4 + Math.sin(t * 5 + x) * 1.2;
      ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, yy, 10, '#fff2a0', .5); ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#fffbe0'; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t, r = i % 2 ? s * .3 : s; ctx.lineTo(x + Math.cos(a) * r, yy + Math.sin(a) * r); } ctx.fill();
    },
    goal(ctx, x, y, t) {
      ctx.fillStyle = '#d0d8e8'; ctx.fillRect(x - .8, y - 46, 1.6, 46);
      ctx.fillStyle = '#ff6f91'; ctx.beginPath(); ctx.moveTo(x + .8, y - 46); for (let i = 0; i <= 8; i++) ctx.lineTo(x + .8 + i * 2.2, y - 46 + Math.sin(t * 5 - i * .6) * i * .2); for (let i = 8; i >= 0; i--) ctx.lineTo(x + .8 + i * 2.2, y - 35 + Math.sin(t * 5 - i * .6) * i * .2); ctx.fill();
    },
    over(ctx, f) {
      ctx.globalCompositeOperation = 'lighter';
      const sx = 400, sy = 18; glowDot(ctx, sx, sy, 160, '#fff4d0', .35); glowDot(ctx, sx, sy, 30, '#ffffff', .8);
      for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI + .9 + Math.sin(f.t * .3 + k) * .04; ctx.fillStyle = 'rgba(255,250,220,.06)'; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(a - .03) * 400, sy + Math.sin(a - .03) * 400); ctx.lineTo(sx + Math.cos(a + .03) * 400, sy + Math.sin(a + .03) * 400); ctx.fill(); }
      [[.3, 10, '#a0ffd0'], [.5, 6, '#ffd0a0'], [.75, 14, '#a0c8ff'], [.9, 4, '#ffffff']].forEach(([k, r, c]) => glowDot(ctx, sx + (VW * .45 - sx) * k * 1.6, sy + (VH * .6 - sy) * k * 1.6, r, c, .18));
      ctx.globalCompositeOperation = 'source-over';
      ambient(10, 41, (i, a, b, c) => { const x = wrap(a * VW * 1.3 - f.t * (10 + c * 8) - f.cam * .4, VW + 20) - 10, y = wrap(b * VH + f.t * (12 + c * 8), VH + 10) - 5; ctx.save(); ctx.translate(x, y); ctx.rotate(f.t * 2 + i); ctx.fillStyle = 'rgba(255,190,210,.85)'; ctx.beginPath(); ctx.ellipse(0, 0, 1.8, 1, 0, 0, TAU); ctx.fill(); ctx.restore(); });
    },
  });

  // ======================= UKIYO-E =======================
  const PRU = '#24497a', UK = '#1e1a16', WASHI = '#efe2c4';

  // ======================= ART NOUVEAU =======================
  const NB = '#4a3426', GOLD = '#c9a24a', ROSE = '#d89a8a', SAGE = '#9fb08a', TEAL = '#4f7f7a', CRM = '#f1e6c8';
  function vine(ctx, x, y, len, ang, curl, lw) {
    ctx.beginPath(); ctx.moveTo(x, y); let a = ang, px = x, py = y;
    for (let i = 0; i < 40; i++) { const k = i / 40; a += curl * k * k * .5; px += Math.cos(a) * len / 40; py += Math.sin(a) * len / 40; ctx.lineTo(px, py); }
    ctx.lineWidth = lw; ctx.stroke(); return [px, py];
  }
  defStyle({
    id: 'nouveau', name: 'Art Nouveau', ref: 'Alphonse Mucha · Gaudí · carteles 1900', order: 25,
    desc: 'Curvas “latigazo”, halo ornamental detrás del mundo, marco con lirios, oro viejo y colores empolvados.',
    fx: { dust: [CRM, '#e8d8b0'], spark: [GOLD, '#fff2c0', ROSE], confetti: [GOLD, ROSE, TEAL, CRM] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'sky', x => { const g = x.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#e9d9b4'); g.addColorStop(1, '#f3e8cc'); x.fillStyle = g; x.fillRect(0, 0, VW, VH); });
      const cx = VW * .72 - f.cam * .03, cy = 80;
      ctx.save(); ctx.translate(cx, cy);
      ctx.globalAlpha = .42; ctx.scale(.68, .68);
      ctx.fillStyle = '#ead6a8'; ctx.beginPath(); ctx.arc(0, 0, 78, 0, TAU); ctx.fill();
      ctx.strokeStyle = GOLD; ctx.lineWidth = 1.2; for (const r of [78, 72, 50]) { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); }
      ctx.rotate(f.t * .03); ctx.lineWidth = .6;
      for (let i = 0; i < 24; i++) { ctx.rotate(TAU / 24); ctx.beginPath(); ctx.moveTo(0, -50); ctx.quadraticCurveTo(5, -61, 0, -72); ctx.quadraticCurveTo(-5, -61, 0, -50); ctx.fillStyle = i % 2 ? 'rgba(216,154,138,.6)' : 'rgba(201,162,74,.5)'; ctx.fill(); ctx.stroke(); }
      ctx.restore();
      ctx.strokeStyle = NB; ctx.lineCap = 'round';
      const hill = (par, base, amp, fr, seed, col) => { ridgePath(ctx, f, par, base, amp, fr, seed, 2, 3); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = .8; ctx.stroke(); };
      campPath(ctx, f, .12, 188, 'far', 3, .85); ctx.fillStyle = '#ddd6b8'; ctx.fill(); ctx.strokeStyle = '#c0b89a'; ctx.lineWidth = .5; ctx.stroke();
      campPath(ctx, f, .26, 210, 'mid', 7, .85); ctx.fillStyle = '#c2c9aa'; ctx.fill(); ctx.strokeStyle = '#a9b394'; ctx.lineWidth = .5; ctx.stroke();
      campWindows(ctx, f, .26, 210, 7, .85, 'rgba(201,162,74,.5)', .4, 'rgba(112,111,83,.3)');
    },
    terrain(ctx) {
      // La silueta usa exactamente las mismas losetas que la física.
      ctx.fillStyle = '#6f805c';
      for (let y = 0; y < L.gh; y++) for (let x = 0; x < L.gw; x++) if (L.solid(x, y)) ctx.fillRect(x * T, y * T, T, T);
      // La cenefa queda dentro de la tierra: su borde superior es el suelo real.
      for (const t of L.tops) {
        ctx.fillStyle = '#b7c69a'; ctx.fillRect(t.x0, t.y, t.x1 - t.x0, 8);
        ctx.fillStyle = '#c5a34f'; ctx.fillRect(t.x0, t.y, t.x1 - t.x0, 1.2);
        ctx.fillStyle = '#45583e'; ctx.fillRect(t.x0, t.y + 7, t.x1 - t.x0, 1);
        for (let x = t.x0 + 7; x < t.x1 - 4; x += 14) {
          ctx.fillStyle = '#e9bcaa'; ctx.beginPath(); ctx.ellipse(x, t.y + 4, 2, 1.5, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = '#e8d99d'; ctx.beginPath(); ctx.arc(x + 6, t.y + 4, .8, 0, TAU); ctx.fill();
        }
      }
      // Flores y árboles son decoración, siempre encima de superficies sólidas.
      for (const o of L.deco) {
        const x = o.x, y = o.y; ctx.strokeStyle = NB; ctx.lineCap = 'round';
        if (o.k === 'T') {
          ctx.beginPath(); CAMP.ceiba(ctx, x, y, 44, 34, o.i, 'trunk'); ctx.fillStyle = '#80654a'; ctx.fill(); ctx.lineWidth = .8; ctx.stroke();
          ctx.beginPath(); CAMP.ceiba(ctx, x, y, 44, 34, o.i, 'crown'); ctx.fillStyle = '#dbaaa3'; ctx.fill(); ctx.lineWidth = .7; ctx.stroke();
        } else if (o.k === 'f') {
          for (let k = -1; k <= 1; k++) { const fx = x + k * 4; ctx.strokeStyle = '#516f45'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(fx, y); ctx.lineTo(fx, y - 7); ctx.stroke(); ctx.fillStyle = k ? '#e7b4aa' : '#f3db9d'; ctx.beginPath(); ctx.arc(fx, y - 8, 2, 0, TAU); ctx.fill(); }
        }
      }
    },
    player(ctx, p, f) { drawHero(ctx, p, f, { lw: .9, line: NB, body: ROSE, body2: '#c4857a', skin: '#f3dcc0', hair: '#9a5a2a', scarf: GOLD, leg: TEAL, eye: NB }); },
    coin(ctx, x, y, t) {
      const yy = y + Math.sin(t * 2.2 + x) * 1.5;
      ctx.save(); ctx.translate(x, yy); ctx.rotate(t * .7);
      ctx.beginPath(); ctx.arc(0, 0, 5.2, 0, TAU); ctx.fillStyle = GOLD; ctx.fill(); ctx.lineWidth = .8; ctx.strokeStyle = NB; ctx.stroke();
      ctx.fillStyle = '#f3e2a8'; for (let i = 0; i < 5; i++) { ctx.rotate(TAU / 5); ctx.beginPath(); ctx.ellipse(0, -2.4, 1.1, 2, 0, 0, TAU); ctx.fill(); }
      ctx.restore();
    },
    goal(ctx, x, y, t) {
      ctx.strokeStyle = NB; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 36); ctx.bezierCurveTo(x, y - 48, x + 14, y - 48, x + 12, y - 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 9, y - 40); ctx.lineTo(x + 15, y - 40); ctx.lineTo(x + 14, y - 33); ctx.lineTo(x + 10, y - 33); ctx.closePath(); ctx.fillStyle = GOLD; ctx.fill(); ctx.lineWidth = .8; ctx.stroke();
      ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x + 12, y - 35, 18, '#ffd88a', .35 + Math.sin(t * 3) * .08); ctx.globalCompositeOperation = 'source-over';
    },
    over(ctx, f) {
      screenLayer(ctx, f, 'frame', x => {
        x.strokeStyle = NB; x.lineWidth = 1.6; x.beginPath(); roundRect(x, 5, 5, VW - 10, VH - 10, 10); x.stroke();
        x.strokeStyle = GOLD; x.lineWidth = .7; x.beginPath(); roundRect(x, 8, 8, VW - 16, VH - 16, 8); x.stroke();
        x.strokeStyle = NB; x.lineCap = 'round';
        for (const [cx, cy, sx, sy] of [[8, 8, 1, 1], [VW - 8, 8, -1, 1], [8, VH - 8, 1, -1], [VW - 8, VH - 8, -1, -1]]) {
          x.save(); x.translate(cx, cy); x.scale(sx, sy);
          vine(x, 0, 18, 30, -.2, -3.5, .9); vine(x, 18, 0, 30, 1.7, 3.5, .9);
          x.beginPath(); x.arc(6, 6, 4, 0, TAU); x.fillStyle = GOLD; x.fill(); x.lineWidth = .7; x.stroke();
          for (let k = 0; k < 3; k++) { x.beginPath(); x.ellipse(16 + k * 7, 4 + k, 3, 1.4, .4, 0, TAU); x.fillStyle = k % 2 ? ROSE : SAGE; x.fill(); x.lineWidth = .5; x.stroke(); }
          x.restore();
        }
      });
      grain(ctx, f, .35, 'nvg');
    },
  });

  // ======================= ART DECO =======================
  const DG = '#d4af37', DK = '#0b0e14';
  function tower(x, cx, base, w, h) {
    const steps = 4; x.fillStyle = DK; x.strokeStyle = DG; x.lineWidth = .6;
    for (let i = 0; i < steps; i++) { const tw = w * (1 - i * .2), th = h * (i === 0 ? .55 : .14); const y0 = base - h * (i === 0 ? .55 : .55 + i * .14); x.beginPath(); x.rect(cx - tw / 2, y0, tw, th + .5); x.fill(); x.stroke(); }
    const ty = base - h * (.55 + (steps - 1) * .14);
    x.beginPath(); x.moveTo(cx - w * .2, ty); x.lineTo(cx, ty - h * .25); x.lineTo(cx + w * .2, ty); x.fill(); x.stroke();
    x.beginPath(); for (let k = -2; k <= 2; k++) { x.moveTo(cx + k * w * .14, base); x.lineTo(cx + k * w * .14, base - h * .5); } x.globalAlpha = .55; x.stroke(); x.globalAlpha = 1;
    x.fillStyle = 'rgba(255,220,140,.5)'; for (let k = 0; k < 10; k++) x.fillRect(cx - w * .4 + R(k, cx | 0) * w * .8, base - R(k + 9, cx | 0) * h * .5, .9, 1.4);
  }
  // fachada neoclásica del teatro: frontón, columnas, tres puertas de arco y balcón; el dorado es del estilo
  function teatroToro(x, cx, base) {
    const W = 74, H = 74, col = 8, tope = base - H;
    x.fillStyle = '#0b0e14'; x.fillRect(cx - W, tope, W * 2, H + 40);
    x.strokeStyle = DG; x.lineWidth = .9; x.strokeRect(cx - W, tope, W * 2, H + 40);
    x.fillStyle = '#0b0e14'; x.beginPath(); x.moveTo(cx - W - 6, tope); x.lineTo(cx, tope - 20); x.lineTo(cx + W + 6, tope); x.closePath(); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(cx - W + 12, tope - 2); x.lineTo(cx, tope - 15); x.lineTo(cx + W - 12, tope - 2); x.closePath(); x.lineWidth = .5; x.stroke();
    x.fillStyle = DG; x.beginPath(); x.arc(cx, tope - 6, 3, 0, TAU); x.fill();
    x.lineWidth = .7; x.beginPath(); x.moveTo(cx - W - 3, tope + 5); x.lineTo(cx + W + 3, tope + 5); x.moveTo(cx - W - 3, tope + 34); x.lineTo(cx + W + 3, tope + 34); x.stroke();
    for (let i = 0; i < col; i++) {
      const px = cx - W + 7 + i * (W * 2 - 14) / (col - 1);
      x.fillStyle = 'rgba(212,175,55,.2)'; x.fillRect(px - 2.2, tope + 5, 4.4, 29); x.strokeStyle = DG; x.lineWidth = .5; x.strokeRect(px - 2.2, tope + 5, 4.4, 29);
      x.beginPath(); for (const d of [-1, 0, 1]) { x.moveTo(px + d, tope + 7); x.lineTo(px + d, tope + 32); } x.lineWidth = .25; x.stroke();
      x.lineWidth = .5; x.strokeRect(px - 3.2, tope + 34, 6.4, 40);
    }
    x.fillStyle = 'rgba(255,214,120,.8)';
    for (let i = 0; i < 3; i++) { const dx = cx + (i - 1) * 40, y0 = tope + 48; x.beginPath(); x.moveTo(dx - 8, base + 2); x.lineTo(dx - 8, y0); x.arc(dx, y0, 8, Math.PI, 0); x.lineTo(dx + 8, base + 2); x.closePath(); x.fill(); x.strokeStyle = DG; x.lineWidth = .8; x.stroke(); }
    x.fillStyle = '#0b0e14'; for (let i = 0; i < 3; i++) { const dx = cx + (i - 1) * 40; x.fillRect(dx - .5, tope + 41, 1, 40); }
    x.strokeStyle = DG; x.lineWidth = .6; x.beginPath(); for (let i = -W + 6; i < W - 4; i += 5) { x.moveTo(cx + i, tope + 34); x.lineTo(cx + i, tope + 38); } x.moveTo(cx - W + 4, tope + 38); x.lineTo(cx + W - 4, tope + 38); x.stroke();
  }
  defStyle({
    id: 'deco', name: 'Art Déco', ref: 'Gran Gatsby · BioShock · Chrysler Building', order: 26,
    desc: 'Negro y oro: rayos de sol en abanico, rascacielos escalonados, chevrones y simetría geométrica de los años 20.',
    fx: { dust: ['#8a7a4a'], spark: [DG, '#fff2c0', '#ffffff'], confetti: [DG, '#fff2c0', '#ffffff', '#b8962e'] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'sky', x => {
        const g = x.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#0b1424'); g.addColorStop(1, '#1e2f4a'); x.fillStyle = g; x.fillRect(0, 0, VW, VH);
        const cx = VW / 2, cy = 196;
        for (let i = 0; i < 36; i++) { const a0 = Math.PI + i / 36 * Math.PI, a1 = a0 + Math.PI / 72; x.fillStyle = i % 2 ? 'rgba(212,175,55,.16)' : 'rgba(212,175,55,.05)'; x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, 300, a0, a1 + (i % 2 ? Math.PI / 72 : 0)); x.fill(); }
        x.strokeStyle = DG; for (let k = 0; k < 6; k++) { x.lineWidth = k === 0 ? 1.4 : .6; x.beginPath(); x.arc(cx, cy, 44 + k * 7, Math.PI, 0); x.stroke(); }
        x.fillStyle = 'rgba(212,175,55,.85)'; x.beginPath(); x.arc(cx, cy, 40, Math.PI, 0); x.fill();
        x.fillStyle = '#0b1424'; for (let k = 0; k < 5; k++) x.fillRect(cx - 42, cy - 8 - k * 7, 84, 1.6);
      });
      // la ciudad en filo de oro y, enfrente, las fachadas neoclásicas del Teatro Toro
      campPath(ctx, f, .15, 192, 'mid', 7, 1.6); ctx.fillStyle = '#0d1626'; ctx.fill(); ctx.strokeStyle = DG; ctx.lineWidth = .7; ctx.stroke();
      strip(ctx, f, 'teatro', .35, (x, w) => { for (let k = 0, px = 90; px < w + 90; k++, px += 240 + R(k, 4) * 90) teatroToro(x, px, 204); });
    },
    terrain(ctx) {
      allLoopsPath(ctx, L.loops); ctx.fillStyle = DK; ctx.fill();
      ctx.save(); ctx.clip(); ctx.strokeStyle = DG;
      for (const t of L.tops) {
        ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(t.x0, t.y + 2.5); ctx.lineTo(t.x1, t.y + 2.5); ctx.moveTo(t.x0, t.y + 12); ctx.lineTo(t.x1, t.y + 12); ctx.stroke();
        ctx.lineWidth = .7; ctx.beginPath(); for (let x = t.x0; x < t.x1; x += 6) { ctx.moveTo(x, t.y + 10.5); ctx.lineTo(x + 3, t.y + 4.5); ctx.lineTo(x + 6, t.y + 10.5); } ctx.stroke();
        ctx.globalAlpha = .3; ctx.lineWidth = .5; ctx.beginPath(); for (let x = t.x0 + 4; x < t.x1; x += 8) { ctx.moveTo(x, t.y + 14); ctx.lineTo(x, VH + 8); } ctx.stroke(); ctx.globalAlpha = 1;
        for (let x = t.x0 + 24; x < t.x1 - 16; x += 48) { ctx.lineWidth = .6; for (let k = 1; k <= 3; k++) { ctx.beginPath(); ctx.arc(x, t.y + 34, k * 5, Math.PI, 0); ctx.stroke(); } ctx.fillStyle = DK; ctx.beginPath(); ctx.arc(x, t.y + 34, 15.5, 0, Math.PI); ctx.fill(); }
      }
      ctx.restore();
      allLoopsPath(ctx, L.loops); ctx.lineWidth = .9; ctx.strokeStyle = DG; ctx.stroke();
      for (const o of L.deco) {
        const x = o.x, y = o.y; ctx.strokeStyle = DG; ctx.fillStyle = DK; ctx.lineWidth = .7;
        if (o.k === 'T') {
          ctx.beginPath(); ctx.moveTo(x, y - 54); ctx.lineTo(x + 9, y - 8); ctx.lineTo(x - 9, y - 8); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.beginPath(); for (let k = 1; k < 7; k++) { const yy = y - 8 - k * 6.5, hw = 9 * (1 - k / 7.2); ctx.moveTo(x - hw, yy); ctx.lineTo(x, yy - 4); ctx.lineTo(x + hw, yy); } ctx.stroke();
          ctx.beginPath(); ctx.rect(x - 4, y - 8, 8, 8); ctx.fill(); ctx.stroke();
        } else if (o.k === 'f') {
          for (let k = 0; k < 2; k++) { const fx = x - 4 + k * 8; ctx.beginPath(); ctx.moveTo(fx, y); for (let i = 0; i <= 4; i++) { const a = Math.PI + .3 + i / 4 * (Math.PI - .6); ctx.lineTo(fx + Math.cos(a) * 6, y - 1 + Math.sin(a) * 6); ctx.moveTo(fx, y); } ctx.stroke(); }
        } else if (o.k === 'r') {
          ctx.beginPath(); ctx.rect(x - 8, y - 4, 16, 4); ctx.rect(x - 5, y - 8, 10, 4); ctx.fill(); ctx.stroke();
        }
      }
    },
    player(ctx, p, f) { drawHero(ctx, p, f, { lw: .7, line: DG, body: '#efe3c8', body2: '#d4c4a0', skin: '#f3dcc0', hair: DK, scarf: DG, leg: DK, eye: DK }); },
    coin(ctx, x, y, t) {
      const yy = y + Math.sin(t * 2.4 + x) * 1.5, s = Math.max(.15, Math.abs(Math.cos(t * 2.4 + x * .05)));
      ctx.save(); ctx.translate(x, yy); ctx.scale(s, 1); ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(4, 0); ctx.lineTo(0, 6); ctx.lineTo(-4, 0); ctx.closePath(); ctx.fillStyle = DG; ctx.fill();
      ctx.strokeStyle = DK; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(2.4, 0); ctx.lineTo(0, 4); ctx.lineTo(-2.4, 0); ctx.closePath(); ctx.stroke(); ctx.restore();
    },
    goal(ctx, x, y, t) {
      ctx.fillStyle = DK; ctx.strokeStyle = DG; ctx.lineWidth = .8;
      ctx.beginPath(); ctx.rect(x - 6, y - 30, 12, 30); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.rect(x - 4, y - 40, 8, 10); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 3, y - 40); ctx.lineTo(x, y - 56); ctx.lineTo(x + 3, y - 40); ctx.fill(); ctx.stroke();
      ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y - 50, 14, '#ffd870', .4 + Math.sin(t * 3) * .15); ctx.globalCompositeOperation = 'source-over';
    },
    over(ctx) {
      ctx.strokeStyle = DG; ctx.lineWidth = .8; ctx.strokeRect(5, 5, VW - 10, VH - 10); ctx.lineWidth = .4; ctx.strokeRect(8, 8, VW - 16, VH - 16);
      for (const [x, y] of [[5, 5], [VW - 5, 5], [5, VH - 5], [VW - 5, VH - 5]]) { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.fillStyle = DG; ctx.fillRect(-3, -3, 6, 6); ctx.restore(); }
    },
  });

  // ======================= COMIC POP ART =======================
  const PR = '#e4202a', PY = '#ffd400', PB = '#1f5fbf', PK = '#111111';
  const dots = (ctx, f, name, col, bg, sp, r) => pat(ctx, f, name, sp, sp, x => { if (bg) { x.fillStyle = bg; x.fillRect(0, 0, sp, sp); } x.fillStyle = col; x.beginPath(); x.arc(sp / 2, sp / 2, r, 0, TAU); x.arc(0, 0, r, 0, TAU); x.arc(sp, 0, r, 0, TAU); x.arc(0, sp, r, 0, TAU); x.arc(sp, sp, r, 0, TAU); x.fill(); });
  function burst(ctx, x, y, s, word, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(-.12); ctx.scale(s, s);
    ctx.beginPath(); for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, r = i % 2 ? 9 : 15 + R(i, 3) * 4; ctx.lineTo(Math.cos(a) * r * 1.4, Math.sin(a) * r); } ctx.closePath();
    ctx.fillStyle = PY; ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = PK; ctx.stroke();
    ctx.font = 'bold 9px Impact, "Arial Black", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 2; ctx.strokeStyle = PK; ctx.strokeText(word, 0, 1); ctx.fillStyle = PR; ctx.fillText(word, 0, 1);
    ctx.restore(); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  }

  // ======================= ALEBRIJE =======================
  const AM = '#e6207a', AT = '#13b5b1', AY = '#ffd000', AO = '#ff6a13', AP = '#6a2c91', AL = '#8ccf2a', AK = '#1a0f1f';
  function motif(ctx, kind, x0, y0, x1, y1, col, s = 4) {
    ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = s * .22; ctx.beginPath();
    if (kind === 'dots') { for (let y = y0; y < y1; y += s) for (let x = x0 + ((y / s | 0) % 2) * s / 2; x < x1; x += s) { ctx.moveTo(x + s * .18, y); ctx.arc(x, y, s * .18, 0, TAU); } ctx.fill(); }
    else if (kind === 'zig') { for (let y = y0; y < y1; y += s * 1.4) { ctx.moveTo(x0, y); for (let x = x0; x < x1; x += s) ctx.lineTo(x + s / 2, y + ((x / s | 0) % 2 ? -s * .4 : s * .4)); } ctx.stroke(); }
    else if (kind === 'scales') { for (let y = y0; y < y1; y += s * .8) for (let x = x0 + ((y / (s * .8) | 0) % 2) * s / 2; x < x1; x += s) { ctx.moveTo(x + s / 2, y); ctx.arc(x, y, s / 2, 0, Math.PI); } ctx.stroke(); }
    else if (kind === 'stripes') { for (let x = x0; x < x1; x += s * 1.2) { ctx.moveTo(x, y0); ctx.lineTo(x, y1); } ctx.stroke(); }
  }

  // ======================= TALAVERA =======================
  const CO = '#1f3f9a', TW = '#f7f4ec', TY = '#e8b830', TG = '#3f8a4a';
  function talaTile(x, x0, y0, s, v, solid) {
    x.fillStyle = solid ? CO : TW; x.fillRect(x0, y0, s, s);
    const fg = solid ? TW : CO, cx = x0 + s / 2, cy = y0 + s / 2;
    x.strokeStyle = fg; x.fillStyle = fg; x.lineWidth = s * .04;
    x.beginPath(); for (const [qx, qy] of [[x0, y0], [x0 + s, y0], [x0, y0 + s], [x0 + s, y0 + s]]) { x.moveTo(qx + s * .22, qy); x.arc(qx, qy, s * .22, 0, TAU); } x.save(); x.clip(); x.fillStyle = solid ? TY : CO; x.fillRect(x0, y0, s, s); x.restore();
    if (v % 2 === 0) { for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; x.beginPath(); x.ellipse(cx + Math.cos(a) * s * .17, cy + Math.sin(a) * s * .17, s * .12, s * .06, a, 0, TAU); x.fillStyle = i % 2 ? fg : (solid ? TY : '#3a62c8'); x.fill(); } }
    else { x.beginPath(); x.moveTo(cx, y0 + s * .15); x.lineTo(x0 + s * .85, cy); x.lineTo(cx, y0 + s * .85); x.lineTo(x0 + s * .15, cy); x.closePath(); x.lineWidth = s * .05; x.stroke(); x.beginPath(); x.arc(cx, cy, s * .12, 0, TAU); x.fillStyle = TG; x.fill(); }
    x.beginPath(); x.arc(cx, cy, s * .06, 0, TAU); x.fillStyle = TY; x.fill();
    x.strokeStyle = 'rgba(160,150,130,.6)'; x.lineWidth = s * .03; x.strokeRect(x0, y0, s, s);
  }
})();
