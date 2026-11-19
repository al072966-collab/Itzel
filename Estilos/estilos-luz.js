'use strict';
// =====================================================================
//  Estilos de luz y atmósfera: ocaso en siluetas, bruma noir,
//  neón synthwave, bosque bioluminiscente
// =====================================================================
(function () {
  const R = (i, s) => hash1(i, s);
  function fracTree(ctx, x, y, ang, len, w, depth, seed, leaf) {
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
    ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(ang + .3) * len * .5, y + Math.sin(ang + .3) * len * .5, x2, y2); ctx.stroke();
    if (depth === 0) { if (leaf) leaf(x2, y2, seed); return; }
    for (let k = 0; k < 2; k++) fracTree(ctx, x2, y2, ang + (k ? 1 : -1) * (.28 + R(seed, k) * .38), len * (.66 + R(seed, k + 4) * .14), w * .68, depth - 1, seed * 3 + k + 1, leaf);
  }
  function blades(ctx, r, col, hmin, hmax, step, seed) {
    ctx.fillStyle = col; ctx.beginPath();
    for (let x = r.x0 + .5; x < r.x1 - .5; x += step) { const h = hmin + hash1(x * 10 | 0, seed) * (hmax - hmin), lean = (hash1(x * 10 | 0, seed + 1) - .5) * 2.4; ctx.moveTo(x - .6, r.y + .5); ctx.quadraticCurveTo(x + lean * .3, r.y - h * .6, x + lean, r.y - h); ctx.quadraticCurveTo(x + lean * .3 + .3, r.y - h * .5, x + .6, r.y + .5); }
    ctx.fill();
  }

  // ======================= OCASO (SILUETAS) =======================
  const INK = '#12081a';
  defStyle({
    id: 'ocaso', name: 'Ocaso en siluetas', ref: 'Limbo a color · Badland · Planet of Lana', order: 2,
    desc: 'Primer plano en silueta total contra un atardecer de capas que se funden con la distancia; solo la bufanda tiene color.',
    fx: { dust: ['#2a1730'], spark: ['#ffd27a', '#ffffff', '#ff9a5a'], confetti: ['#ffd27a', '#ff7a59', '#ffffff', '#ffb38a'] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'sky', x => {
        const g = x.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#1b1036'); g.addColorStop(.32, '#552865'); g.addColorStop(.55, '#b0436c'); g.addColorStop(.72, '#ef7756'); g.addColorStop(.86, '#ffbf72'); g.addColorStop(1, '#ffd89a');
        x.fillStyle = g; x.fillRect(0, 0, VW, VH);
        ambient(70, 4, (i, a, b, c) => { x.fillStyle = `rgba(255,230,240,${(1 - b) * (.2 + c * .6)})`; x.beginPath(); x.arc(a * VW, b * 90, .3 + c * .5, 0, TAU); x.fill(); });
      });
      const sx = 290 - f.cam * .02;
      glowDot(ctx, sx, 128, 140, '#ffb070', .5); glowDot(ctx, sx, 128, 50, '#fff0c0', .7);
      ctx.fillStyle = '#fff1c8'; ctx.beginPath(); ctx.arc(sx, 128, 24, 0, TAU); ctx.fill();
      // nubes alargadas
      ctx.fillStyle = 'rgba(120,40,90,.45)';
      for (let i = 0; i < 5; i++) { const x = wrap(i * 120 - f.cam * .05 - f.t * 2, VW + 200) - 100, y = 70 + i * 14; ctx.beginPath(); ctx.ellipse(x, y, 60 + i * 8, 2.4 + (i % 2), 0, 0, TAU); ctx.fill(); }
      // Campeche al atardecer: Edzna, la ciudad amurallada y la selva, cada vez mas oscuras
      const mist = (y) => { const m = ctx.createLinearGradient(0, y - 30, 0, y + 30); m.addColorStop(0, rgba('#ff9a70', 0)); m.addColorStop(1, rgba('#ff9a70', .22)); ctx.fillStyle = m; ctx.fillRect(0, y - 30, VW, VH); };
      campPath(ctx, f, .05, 168, 'far', 2, 1.15); ctx.fillStyle = '#c3587b'; ctx.fill(); mist(168);
      campPath(ctx, f, .12, 178, 'mid', 5, 1.3); ctx.fillStyle = '#903b6b'; ctx.fill();
      campWindows(ctx, f, .12, 178, 5, 1.3, 'rgba(255,190,120,.7)', .3, 'rgba(0,0,0,0)'); mist(180);
      campPath(ctx, f, .24, 196, 'mid', 9, 1.6); ctx.fillStyle = '#5c2556'; ctx.fill(); mist(196);
      campPath(ctx, f, .42, 214, 'near', 13, .8); ctx.fillStyle = '#33163f'; ctx.fill();
      campProps(ctx, f, .42, 214, 'near', 13, .8, f.t); ctx.fill();
      fragatas(ctx, f, 6, 31, 'rgba(30,10,30,.85)', 52, 30);
    },
    terrain(ctx) {
      allLoopsPath(ctx, L.loops, 3); ctx.fillStyle = INK; ctx.fill();
      // contraluz del atardecer: el sol bajo detrás tiñe la orilla de la silueta y deja una bruma tibia
      // justo debajo de la superficie; adentro, apenas se adivinan piedras y raíces
      ctx.save(); allLoopsPath(ctx, L.loops, 3); ctx.clip();
      for (const r of L.tops) { const g = ctx.createLinearGradient(0, r.y, 0, r.y + 46); g.addColorStop(0, 'rgba(150,60,95,.42)'); g.addColorStop(.3, 'rgba(110,40,80,.18)'); g.addColorStop(1, 'rgba(60,20,50,0)'); ctx.fillStyle = g; ctx.fillRect(r.x0 - 6, r.y, r.x1 - r.x0 + 12, 46); }
      for (const [w, a] of [[34, .05], [20, .06], [10, .07]]) { allLoopsPath(ctx, L.loops, 3); ctx.lineWidth = w; ctx.strokeStyle = `rgba(150,60,100,${a})`; ctx.stroke(); }   // la luz que se cuela por todas las orillas
      for (const [w, a] of [[5, .08], [2.4, .14], [1, .24]]) { allLoopsPath(ctx, L.loops, 3); ctx.lineWidth = w; ctx.strokeStyle = `rgba(255,140,100,${a})`; ctx.stroke(); }
      // vetas de roca en capas, apenas más claras que la silueta
      { const rv = rng(23); for (let i = 0; i < 160; i++) { const x = rv() * L.ww, y = 140 + rv() * 100, d = L.depth(x, y); if (d < 12) continue; const l = 14 + rv() * 40; ctx.strokeStyle = `rgba(110,45,85,${.12 + rv() * .14})`; ctx.lineWidth = .8 + rv() * 1.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + l / 2, y + (rv() - .5) * 4, x + l, y + (rv() - .5) * 3); ctx.stroke(); } }
      const rr = rng(21);
      for (let i = 0; i < 90; i++) { const x = rr() * L.ww, y = 150 + rr() * 90, d = L.depth(x, y); if (d < 14) continue; const w = 3 + rr() * 7; ctx.fillStyle = `rgba(90,35,70,${.18 + rr() * .2})`; ctx.beginPath(); ctx.ellipse(x, y, w, w * .55, (rr() - .5) * .4, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,150,110,.07)'; ctx.beginPath(); ctx.ellipse(x - w * .25, y - w * .2, w * .55, w * .22, 0, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = 'rgba(90,35,70,.35)'; ctx.lineCap = 'round';
      for (const r of L.tops) for (let x = r.x0 + 6; x < r.x1 - 6; x += 9 + R(x | 0, 31) * 16) { if (R(x | 0, 32) < .4) continue; ctx.lineWidth = .6 + R(x | 0, 33) * .8; ctx.beginPath(); let px = x, py = r.y + 3; ctx.moveTo(px, py); for (let k = 0; k < 4; k++) { px += (R(x | 0, 40 + k) - .5) * 6; py += 3 + R(x | 0, 50 + k) * 5; ctx.lineTo(px, py); } ctx.stroke(); }
      ctx.restore();
      for (const r of L.tops) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,150,100,.22)'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(r.x0 + 2, r.y + .6); ctx.lineTo(r.x1 - 2, r.y + .6); ctx.stroke(); ctx.restore(); ctx.strokeStyle = 'rgba(255,175,120,.55)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(r.x0 + 2, r.y + .3); ctx.lineTo(r.x1 - 2, r.y + .3); ctx.stroke(); blades(ctx, r, INK, 1.5, 6, 1.1, 3); }
      for (const r of L.bottoms) { ctx.strokeStyle = INK; ctx.lineWidth = .7; for (let x = r.x0 + 3; x < r.x1 - 2; x += 3 + R(x, 2) * 5) { const l = 4 + R(x, 3) * 9; ctx.beginPath(); ctx.moveTo(x, r.y - 1); ctx.quadraticCurveTo(x + 2, r.y + l * .5, x + (R(x, 4) - .5) * 4, r.y + l); ctx.stroke(); } }
      ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineCap = 'round';
      for (const o of L.deco) {
        const x = o.x, y = o.y;
        if (o.k === 'T') { ctx.beginPath(); if (o.i % 2) CAMP.palma(ctx, x, y + 1, 50 + R(o.i, 1) * 16, (R(o.i, 2) - .5) * .5, o.i); else CAMP.ceiba(ctx, x, y + 1, 56 + R(o.i, 1) * 10, 46, o.i); ctx.fill(); }
        else if (o.k === 'f') { blades(ctx, { x0: x - 8, x1: x + 8, y }, INK, 4, 12, .9, o.i + 5); for (let k = 0; k < 2; k++) { const fx = x - 4 + k * 8, fy = y - 11 - k * 3; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(fx, y); ctx.quadraticCurveTo(fx + 2, y - 6, fx, fy); ctx.stroke(); ctx.beginPath(); ctx.ellipse(fx, fy, 1.4, 2.2, .3, 0, TAU); ctx.fill(); } }
        else if (o.k === 'r') { ctx.beginPath(); ctx.ellipse(x, y, 8, 6, 0, Math.PI, 0); ctx.fill(); }
      }
    },
    front(ctx, f) {
      // particulas de polen
      ctx.globalCompositeOperation = 'lighter';
      ambient(26, 12, (i, a, b, c) => { const x = f.cam + wrap(a * 700 - f.cam * (c * .4) + Math.sin(f.t * .7 + i) * 12, VW + 40) - 20, y = 60 + b * 160 + Math.sin(f.t * 1.1 + i * 2) * 6, tw = .5 + .5 * Math.sin(f.t * 3 + i); glowDot(ctx, x, y, 3 + c * 3, '#ffc98a', .35 * tw); });
      ctx.globalCompositeOperation = 'source-over';
    },
    player(ctx, p, f) { drawHero(ctx, p, f, { body: INK, hair: INK, leg: INK, scarf: '#ff7a59', noFace: true, eye: '#ffd9a0', scarfW: 2.2 }); },
    coin(ctx, x, y, t) {
      const yy = y + Math.sin(t * 2.4 + x) * 2, pu = .8 + Math.sin(t * 4 + x) * .2;
      ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, yy, 14 * pu, '#ffb060', .45); glowDot(ctx, x, yy, 5, '#fff0c0', .9); ctx.globalCompositeOperation = 'source-over';
    },
    goal(ctx, x, y, t) {
      ctx.fillStyle = INK; ctx.fillRect(x - 1, y - 40, 2, 40); ctx.fillRect(x - 1, y - 40, 9, 1.6);
      ctx.beginPath(); roundRect(ctx, x + 4.5, y - 38.5, 6, 8, 1.2); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; const fl = .8 + Math.sin(t * 9) * .08 + Math.sin(t * 23) * .05; glowDot(ctx, x + 7.5, y - 34, 30 * fl, '#ffa050', .5); glowDot(ctx, x + 7.5, y - 34.5, 4, '#fff2c8', 1); ctx.globalCompositeOperation = 'source-over';
    },
    particle(ctx, q) { if (q.k === 'dust') { const a = clamp(q.life / q.max, 0, 1); ctx.globalAlpha = a * .8; ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(q.x, q.y, q.s, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; } else { ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, q.x, q.y, q.s * 2.5, q.c, clamp(q.life / q.max, 0, 1)); ctx.globalCompositeOperation = 'source-over'; } },
    over(ctx, f) {
      ctx.fillStyle = INK; const off = f.cam * 1.45;
      for (let k = Math.floor(off / 260) - 1; k < (off + VW) / 260 + 1; k++) {
        const x = k * 260 + R(k, 7) * 120 - off; if (x < -60 || x > VW + 60) continue;
        ctx.beginPath();
        for (let j = 0; j < 14; j++) { const bx = x + (j - 7) * 3, h = 30 + R(k * 20 + j, 8) * 46, lean = (R(k * 20 + j, 9) - .5) * 26; ctx.moveTo(bx - 1.6, VH + 2); ctx.quadraticCurveTo(bx + lean * .2, VH - h * .6, bx + lean, VH - h); ctx.quadraticCurveTo(bx + lean * .2 + 1, VH - h * .5, bx + 1.6, VH + 2); }
        ctx.fill();
      }
      vignette(ctx, .35, '#1b0a1e', .5);
    },
  });

  // ======================= BRUMA (NOIR) =======================
  defStyle({
    id: 'bruma', name: 'Bruma en blanco y negro', ref: 'Limbo · Inside · cine mudo', order: 10,
    desc: 'Monocromo con niebla en capas desenfocadas, haces de luz, grano de película y un héroe de ojos brillantes.',
    fx: { dust: ['#9a9a92'], spark: ['#ffffff', '#e8e8e0'], confetti: ['#ffffff', '#d0d0c8', '#9a9a92'] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'sky', x => { const g = x.createRadialGradient(VW * .62, 30, 10, VW * .55, VH * .5, VW * .7); g.addColorStop(0, '#f0efe8'); g.addColorStop(.45, '#a9a9a1'); g.addColorStop(1, '#3b3b37'); x.fillStyle = g; x.fillRect(0, 0, VW, VH); });
      const trees = (x, w, col, blur, base, n, tall, seed) => {
        x.filter = `blur(${blur * f.S}px)`; x.fillStyle = col; x.strokeStyle = col; x.lineCap = 'round';
        for (let k = 0; k < w / n; k++) {
          const tx = k * n + R(k, seed) * n * .8, tw = 2 + R(k, seed + 1) * 4 * tall;
          x.beginPath(); x.moveTo(tx - tw, base + 10); x.lineTo(tx - tw * .4, -5); x.lineTo(tx + tw * .4, -5); x.lineTo(tx + tw, base + 10); x.fill();
          for (let b = 0; b < 4; b++) { const by = base - 20 - R(k * 9 + b, seed + 2) * (base - 30), d = R(k * 9 + b, seed + 3) < .5 ? -1 : 1, l = 8 + R(k * 9 + b, seed + 4) * 18; x.lineWidth = tw * .35; x.beginPath(); x.moveTo(tx, by); x.quadraticCurveTo(tx + d * l * .6, by - l * .2, tx + d * l, by - l * .5 + R(b, k) * 6); x.stroke(); }
        }
        x.beginPath(); x.moveTo(0, VH); for (let xx = 0; xx <= w; xx += 4) x.lineTo(xx, base - fbm1(xx * .03, seed, 3) * 12); x.lineTo(w, VH); x.fill();
        x.filter = 'none';
      };
      strip(ctx, f, 'far', .12, (x, w) => trees(x, w, '#b4b4ac', 3, 175, 34, .6, 3));
      { const m = ctx.createLinearGradient(0, 90, 0, 200); m.addColorStop(0, 'rgba(216,216,208,0)'); m.addColorStop(1, 'rgba(216,216,208,.6)'); ctx.fillStyle = m; ctx.fillRect(0, 90, VW, VH); }
      strip(ctx, f, 'mid', .3, (x, w) => trees(x, w, '#7b7b73', 1.6, 192, 46, 1, 7));
      const fog = cached(f, 'fog', VW, 80, x => { x.filter = `blur(${10 * f.S}px)`; x.fillStyle = 'rgba(235,235,228,.55)'; for (let k = 0; k < 14; k++) for (const o of [-VW, 0, VW]) { x.beginPath(); x.ellipse(o + R(k, 1) * VW, 40 + (R(k, 2) - .5) * 30, 40 + R(k, 3) * 50, 8 + R(k, 4) * 10, 0, 0, TAU); x.fill(); } });
      const fx = wrap(f.t * 5 + f.cam * .5, VW);
      ctx.globalAlpha = .7; ctx.drawImage(fog, -fx, 140, VW, 80); ctx.drawImage(fog, VW - fx, 140, VW, 80); ctx.globalAlpha = 1;
      strip(ctx, f, 'near', .55, (x, w) => trees(x, w, '#4a4a44', .6, 206, 90, 1.4, 11));
      const rays = cached(f, 'rays', VW, VH, x => { x.filter = `blur(${4 * f.S}px)`; x.fillStyle = 'rgba(255,255,250,.07)'; for (let k = 0; k < 6; k++) { const a = 250 + k * 22, b = 140 + k * 70 + R(k, 3) * 30; x.beginPath(); x.moveTo(a, -5); x.lineTo(a + 10 + R(k, 1) * 14, -5); x.lineTo(b + 30, VH); x.lineTo(b, VH); x.fill(); } });
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .75 + Math.sin(f.t * .7) * .25; ctx.drawImage(rays, 0, 0, VW, VH); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    },
    terrain(ctx) {
      const K = '#0b0b0a';
      allLoopsPath(ctx, L.loops, 2); ctx.fillStyle = K; ctx.fill();
      for (const r of L.tops) blades(ctx, r, K, 1, 7, 1.7, 9);
      ctx.strokeStyle = K; ctx.lineCap = 'round';
      for (const r of L.bottoms) for (let x = r.x0 + 2; x < r.x1 - 2; x += 2 + R(x, 5) * 4) { const l = 5 + R(x, 6) * 16; ctx.lineWidth = .4 + R(x, 7) * .6; ctx.beginPath(); ctx.moveTo(x, r.y - 1); ctx.bezierCurveTo(x + 3, r.y + l * .3, x - 3, r.y + l * .7, x + (R(x, 8) - .5) * 3, r.y + l); ctx.stroke(); }
      ctx.fillStyle = K;
      for (const o of L.deco) {
        const x = o.x, y = o.y;
        if (o.k === 'T') fracTree(ctx, x, y + 1, -Math.PI / 2 + (R(o.i, 1) - .5) * .4, 15 + R(o.i, 2) * 8, 3.6, 5, o.i * 5 + 3, null);
        else if (o.k === 'f') blades(ctx, { x0: x - 7, x1: x + 7, y }, K, 3, 10, 1.2, o.i);
        else if (o.k === 'r') { ctx.beginPath(); ctx.moveTo(x - 9, y + 1); ctx.lineTo(x - 6, y - 6); ctx.lineTo(x + 2, y - 8); ctx.lineTo(x + 7, y - 3); ctx.lineTo(x + 9, y + 1); ctx.fill(); ctx.fillRect(x + 4, y - 22, 1.4, 16); ctx.beginPath(); ctx.moveTo(x - 2, y - 21); ctx.lineTo(x + 11, y - 19); ctx.lineTo(x + 10, y - 15); ctx.lineTo(x - 2, y - 17); ctx.fill(); }
      }
    },
    player(ctx, p, f) {
      const g = drawHero(ctx, p, f, { body: '#0b0b0a', hair: '#0b0b0a', leg: '#0b0b0a', scarf: '#0b0b0a', noFace: true });
      const X = heroXf(p, g), blink = (f.t % 4.1) < .12 ? .2 : 1;
      ctx.globalCompositeOperation = 'lighter';
      for (const ex of [1.8, 3.9]) { const e = X(ex, -14.4 + g.bob); glowDot(ctx, e[0], e[1], 3.5, '#ffffff', .5 * blink); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(e[0], e[1], .65, .95 * blink, 0, 0, TAU); ctx.fill(); }
      ctx.globalCompositeOperation = 'source-over';
    },
    coin(ctx, x, y, t) { const yy = y + Math.sin(t * 2 + x) * 2; ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, yy, 10 + Math.sin(t * 3 + x) * 2, '#ffffff', .4); glowDot(ctx, x, yy, 2.6, '#ffffff', 1); ctx.globalCompositeOperation = 'source-over'; },
    goal(ctx, x, y, t) {
      ctx.strokeStyle = '#0b0b0a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 44); ctx.quadraticCurveTo(x, y - 50, x + 8, y - 49); ctx.stroke();
      ctx.fillStyle = '#0b0b0a'; ctx.beginPath(); ctx.moveTo(x + 5, y - 49); ctx.lineTo(x + 11, y - 49); ctx.lineTo(x + 10, y - 44); ctx.lineTo(x + 6, y - 44); ctx.fill();
      const fl = hash1(Math.floor(t * 14), 3) < .1 ? .3 : 1;
      ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x + 8, y - 43, 36, '#ffffff', .25 * fl); glowDot(ctx, x + 8, y - 44, 4, '#ffffff', .9 * fl); ctx.globalCompositeOperation = 'source-over';
    },
    over(ctx, f) {
      const fr = Math.floor(f.t * 12) % 3;
      const n = cached(f, 'grain' + fr, VW, VH, (x, c) => { x.setTransform(1, 0, 0, 1, 0, 0); const im = x.createImageData(c.width, c.height), d = im.data; for (let i = 0; i < d.length; i += 4) { const v = hash1(i >> 2, fr * 99 + 5) * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } x.putImageData(im, 0, 0); });
      ctx.globalAlpha = .07; ctx.drawImage(n, 0, 0, VW, VH); ctx.globalAlpha = 1;
      vignette(ctx, .8, '#000000', .3);
      ctx.fillStyle = `rgba(0,0,0,${hash1(Math.floor(f.t * 18), 9) * .05})`; ctx.fillRect(0, 0, VW, VH);
      if (hash1(Math.floor(f.t * 6), 4) < .25) { ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(hash1(Math.floor(f.t * 6), 5) * VW, 0, .6, VH); }
    },
  });

  // ======================= NEON SYNTHWAVE =======================
  const CY = '#00e8ff', MG = '#ff2bd6', YL = '#ffe74c';
  function glowStroke(ctx, f, col, lw, blur) { ctx.shadowColor = col; ctx.shadowBlur = blur * f.S; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke(); ctx.shadowBlur = 0; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = lw * .35; ctx.stroke(); }
  defStyle({
    id: 'neon', name: 'Neón synthwave', ref: 'Outrun · Hotline Miami · Tron', order: 9,
    desc: 'Noche violeta, sol a rayas, retícula en perspectiva y todo delineado con tubos de neón que brillan.',
    fx: { dust: [CY, MG], spark: [YL, '#ffffff', MG], confetti: [CY, MG, YL, '#ffffff'] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'sky', x => {
        const g = x.createLinearGradient(0, 0, 0, 172); g.addColorStop(0, '#07021a'); g.addColorStop(.6, '#2a0b4a'); g.addColorStop(1, '#5a1460'); x.fillStyle = g; x.fillRect(0, 0, VW, VH);
        x.fillStyle = '#12052a'; x.fillRect(0, 172, VW, VH);
        const sun = mkCanvas(90 * f.S, 90 * f.S), s = sun.getContext('2d'); s.scale(f.S, f.S);
        const sg = s.createLinearGradient(0, 0, 0, 90); sg.addColorStop(0, '#ffe74c'); sg.addColorStop(.5, '#ff8a3d'); sg.addColorStop(1, '#ff2b8a'); s.fillStyle = sg; s.beginPath(); s.arc(45, 45, 44, 0, TAU); s.fill();
        s.globalCompositeOperation = 'destination-out'; for (let k = 0; k < 7; k++) { const yy = 50 + k * 6, h = 1 + k * .55; s.fillRect(0, yy, 90, h); }
        x.shadowColor = '#ff4fa0'; x.shadowBlur = 24 * f.S; x.drawImage(sun, VW * .62 - 45, 172 - 76, 90, 90); x.shadowBlur = 0;
      });
      ambient(60, 7, (i, a, b, c) => { const tw = .4 + .6 * Math.abs(Math.sin(f.t * (1 + c * 2) + i)); ctx.fillStyle = `rgba(255,255,255,${tw * (.3 + c * .6)})`; ctx.fillRect(wrap(a * VW - f.cam * .01, VW), b * 110, .7 + c * .5, .7 + c * .5); });
      // montañas de alambre
      const off = f.cam * .08; ctx.beginPath(); const pts = [];
      for (let x = -6; x <= VW + 8; x += 1.5) { const wx = x + off; pts.push([x, 172 - CAMP.h(wx, 'mid', 4) * 1.7]); }
      ctx.moveTo(-20, 172); pts.forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(VW + 30, 172); ctx.closePath(); ctx.fillStyle = '#16063a'; ctx.fill();
      ctx.beginPath(); pts.forEach((p, i) => { if (i % 6) return; ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0], 172); }); ctx.strokeStyle = 'rgba(255,43,214,.22)'; ctx.lineWidth = .4; ctx.stroke();
      campWindows(ctx, f, .08, 172, 4, 1.7, 'rgba(0,232,255,.75)', .35, 'rgba(0,0,0,0)');
      ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); glowStroke(ctx, f, MG, 1, 6);
      // suelo reticulado
      ctx.save(); ctx.beginPath(); ctx.rect(0, 172, VW, VH); ctx.clip();
      const vx = VW * .5, hz = 172; ctx.beginPath();
      const ph = wrap(f.cam * .02, 1);
      for (let i = 0; i < 12; i++) { const z = (i + 1 - ph) / 12, y = hz + (VH - hz) * z * z; ctx.moveTo(0, y); ctx.lineTo(VW, y); }
      const sp = 34, o2 = wrap(f.cam * 1.2, sp);
      for (let k = -20; k <= 20; k++) { const xb = vx + k * sp - o2; ctx.moveTo(vx + (xb - vx) * .04, hz); ctx.lineTo(vx + (xb - vx) * 1.6, VH + 60); }
      ctx.strokeStyle = 'rgba(255,43,214,.75)'; ctx.lineWidth = .6; ctx.shadowColor = MG; ctx.shadowBlur = 4 * f.S; ctx.stroke(); ctx.shadowBlur = 0;
      const hg = ctx.createLinearGradient(0, hz, 0, hz + 22); hg.addColorStop(0, 'rgba(18,5,42,1)'); hg.addColorStop(1, 'rgba(18,5,42,0)'); ctx.fillStyle = hg; ctx.fillRect(0, hz, VW, 22);
      ctx.restore();
      ctx.beginPath(); ctx.moveTo(0, 172); ctx.lineTo(VW, 172); glowStroke(ctx, f, '#ff7ad9', .8, 8);
    },
    terrain(ctx, f) {
      ctx.save(); allLoopsPath(ctx, L.loops); const g = ctx.createLinearGradient(0, 120, 0, VH); g.addColorStop(0, '#1c0838'); g.addColorStop(1, '#0a0218'); ctx.fillStyle = g; ctx.fill(); ctx.clip();
      ctx.beginPath(); for (let x = 0; x < L.ww; x += 8) { ctx.moveTo(x, 0); ctx.lineTo(x, VH + 8); } for (let y = 0; y < VH + 8; y += 8) { ctx.moveTo(0, y); ctx.lineTo(L.ww, y); } ctx.strokeStyle = 'rgba(120,40,200,.25)'; ctx.lineWidth = .4; ctx.stroke();
      ctx.restore();
      allLoopsPath(ctx, L.loops); ctx.lineJoin = 'round'; glowStroke(ctx, f, CY, 1.2, 8);
      ctx.beginPath(); for (const r of L.tops) { ctx.moveTo(r.x0 + 1, r.y + 1.2); ctx.lineTo(r.x1 - 1, r.y + 1.2); } ctx.strokeStyle = 'rgba(255,43,214,.7)'; ctx.lineWidth = .5; ctx.stroke();
      for (const o of L.deco) {
        const x = o.x, y = o.y; ctx.lineCap = 'round';
        if (o.k === 'T') {
          const h = 40 + R(o.i, 1) * 14, lean = (R(o.i, 2) - .3) * 12;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + lean * .2, y - h * .5, x + lean, y - h); glowStroke(ctx, f, MG, 1.4, 6);
          for (let k = 0; k < 7; k++) { const a = -Math.PI + k / 6 * Math.PI + (R(k, o.i) - .5) * .3, l = 13 + R(k, o.i + 1) * 6; ctx.beginPath(); ctx.moveTo(x + lean, y - h); ctx.quadraticCurveTo(x + lean + Math.cos(a) * l * .6, y - h + Math.sin(a) * l * .6 - 5, x + lean + Math.cos(a) * l, y - h + Math.sin(a) * l * .5 + 6); glowStroke(ctx, f, '#3dffa8', .9, 5); }
        } else if (o.k === 'f') {
          for (let k = 0; k < 3; k++) { const fx = x - 6 + k * 6; ctx.beginPath(); ctx.moveTo(fx - 2, y - 1); ctx.lineTo(fx, y - 4 - k % 2 * 2); ctx.lineTo(fx + 2, y - 1); glowStroke(ctx, f, k % 2 ? CY : MG, .7, 4); }
        } else if (o.k === 'r') {
          ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x, y - 12); ctx.lineTo(x + 8, y); ctx.moveTo(x, y - 12); ctx.lineTo(x + 2, y); glowStroke(ctx, f, YL, .8, 5);
        }
      }
    },
    front(ctx, f) {
      const g = f.g; if (!g.trail) g.trail = [];
      const p = g.p; g.trail.unshift([p.x, p.y - 8]); if (g.trail.length > 14) g.trail.pop();
      ctx.lineCap = 'round';
      for (let i = 1; i < g.trail.length; i++) { const a = g.trail[i - 1], b = g.trail[i]; ctx.strokeStyle = rgba(CY, (1 - i / 14) * .5); ctx.lineWidth = 6 * (1 - i / 14); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    },
    player(ctx, p, f) {
      ctx.save(); ctx.shadowColor = MG; ctx.shadowBlur = 7 * f.S;
      drawHero(ctx, p, f, { lw: .9, line: MG, body: '#1a0838', hair: '#1a0838', leg: '#1a0838', scarf: CY, noFace: true, eye: CY });
      ctx.restore();
    },
    coin(ctx, x, y, t, f) {
      const s = Math.cos(t * 3 + x * .05);
      ctx.beginPath(); ctx.ellipse(x, y + Math.sin(t * 3 + x) * 1.5, Math.max(.4, Math.abs(s) * 5), 5, 0, 0, TAU); glowStroke(ctx, f, YL, 1.3, 7);
    },
    goal(ctx, x, y, t, f) {
      ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x - 12, y - 30); ctx.arc(x, y - 30, 12, Math.PI, 0); ctx.lineTo(x + 12, y); glowStroke(ctx, f, CY, 1.5, 9);
      const on = hash1(Math.floor(t * 8), 2) > .08;
      ctx.font = 'bold 7px Arial, sans-serif'; ctx.textAlign = 'center';
      if (on) { ctx.shadowColor = MG; ctx.shadowBlur = 8 * f.S; ctx.fillStyle = '#ffd0f4'; ctx.fillText('META', x, y - 45); ctx.shadowBlur = 0; }
      ctx.textAlign = 'left';
      ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y - 18, 16, CY, .2); ctx.globalCompositeOperation = 'source-over';
    },
    particle(ctx, q) { ctx.globalCompositeOperation = 'lighter'; const a = clamp(q.life / q.max, 0, 1); glowDot(ctx, q.x, q.y, q.s * 2.2, q.c, a); ctx.globalCompositeOperation = 'source-over'; },
    over(ctx, f) {
      const sc = cached(f, 'scan', VW, VH, x => { x.fillStyle = 'rgba(0,0,0,.22)'; for (let y = 0; y < VH; y += 1.5) x.fillRect(0, y, VW, .5); });
      ctx.drawImage(sc, 0, 0, VW, VH); vignette(ctx, .55, '#05010f');
    },
  });

  // ======================= BOSQUE BIOLUMINISCENTE =======================
  defStyle({
    id: 'biolum', name: 'Bosque bioluminiscente', ref: 'Ori · Hollow Knight (Bosque Verde) · Avatar', order: 5,
    desc: 'Noche profunda donde la luz la emiten las plantas, los hongos y el héroe; esporas flotando y niebla azul.',
    fx: { dust: ['#7fffe0', '#b8fff0'], spark: ['#bfffef', '#ffffff', '#ff9ff3'], confetti: ['#7fffe0', '#ff9ff3', '#ffffff', '#9fd8ff'] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'sky', x => { const g = x.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#030a1c'); g.addColorStop(.55, '#0a2a40'); g.addColorStop(1, '#0f4a50'); x.fillStyle = g; x.fillRect(0, 0, VW, VH); glowDot(x, 110, 40, 120, '#3fa8c8', .22); x.fillStyle = 'rgba(200,245,255,.8)'; x.beginPath(); x.arc(110, 40, 9, 0, TAU); x.fill(); glowDot(x, 110, 40, 22, '#d8fbff', .5); });
      const forest = (x, w, col, base, sp, glow, seed, blur) => {
        if (blur) x.filter = `blur(${blur * f.S}px)`;
        x.fillStyle = col; x.strokeStyle = col;
        for (let k = 0; k < w / sp; k++) {
          const tx = k * sp + R(k, seed) * sp * .7, tw = 3 + R(k, seed + 1) * 5, ch = base - 70 - R(k, seed + 2) * 50;
          x.beginPath(); x.moveTo(tx - tw, base + 20); x.bezierCurveTo(tx - tw * .4, base - 30, tx + tw * .6, ch + 30, tx, ch); x.bezierCurveTo(tx + tw * .9, ch + 30, tx + tw * .5, base - 30, tx + tw * 1.3, base + 20); x.fill();
          x.beginPath(); for (let c = 0; c < 6; c++) { const cx = tx + (R(k * 7 + c, seed + 3) - .5) * 40, cy = ch + (R(k * 7 + c, seed + 4) - .2) * 24, r = 10 + R(k * 7 + c, seed + 5) * 14; x.moveTo(cx + r, cy); x.arc(cx, cy, r, 0, TAU); } x.fill();
        }
        x.beginPath(); x.moveTo(0, VH); for (let xx = 0; xx <= w; xx += 4) x.lineTo(xx, base - fbm1(xx * .02, seed, 3) * 16); x.lineTo(w, VH); x.fill();
        x.filter = 'none';
        if (glow) { x.globalCompositeOperation = 'lighter'; for (let k = 0; k < w / 9; k++) { const gx = R(k, seed + 8) * w, gy = base - 60 + R(k, seed + 9) * 90; glowDot(x, gx, gy, 3 + R(k, 3) * 3, R(k, 4) < .7 ? '#5fffd0' : '#ff8ff0', .5); } x.globalCompositeOperation = 'source-over'; }
      };
      strip(ctx, f, 'f1', .1, (x, w) => forest(x, w, '#123c52', 190, 40, true, 3, 2));
      const m = ctx.createLinearGradient(0, 120, 0, VH); m.addColorStop(0, 'rgba(40,140,160,0)'); m.addColorStop(1, 'rgba(40,140,160,.35)'); ctx.fillStyle = m; ctx.fillRect(0, 120, VW, VH);
      strip(ctx, f, 'f2', .26, (x, w) => forest(x, w, '#0a2636', 202, 58, true, 7, .8));
      ctx.globalCompositeOperation = 'lighter';
      const rays = cached(f, 'rays', VW, VH, x => { x.filter = `blur(${5 * f.S}px)`; x.fillStyle = 'rgba(80,220,230,.06)'; for (let k = 0; k < 5; k++) { const a = 60 + k * 80, b = a - 60; x.beginPath(); x.moveTo(a, -5); x.lineTo(a + 16, -5); x.lineTo(b + 40, VH); x.lineTo(b, VH); x.fill(); } });
      ctx.globalAlpha = .7 + Math.sin(f.t * .6) * .3; ctx.drawImage(rays, 0, 0, VW, VH); ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      strip(ctx, f, 'f3', .45, (x, w) => forest(x, w, '#061a26', 214, 90, false, 11, 0));
    },
    terrain(ctx, f) {
      allLoopsPath(ctx, L.loops, 3); ctx.fillStyle = '#04111a'; ctx.fill();
      ctx.save(); allLoopsPath(ctx, L.loops, 3); ctx.clip();
      for (const r of L.tops) { const g = ctx.createLinearGradient(0, r.y, 0, r.y + 14); g.addColorStop(0, 'rgba(40,200,170,.35)'); g.addColorStop(1, 'rgba(40,200,170,0)'); ctx.fillStyle = g; ctx.fillRect(r.x0, r.y, r.x1 - r.x0, 14); }
      // rocas apenas visibles y micelio que baja de la orilla y brilla
      const rb = rng(71);
      for (let i = 0; i < L.ww / 12; i++) {
        const x = rb() * L.ww, y = 20 + rb() * 215, w = 6 + rb() * 14, h = w * (.45 + rb() * .3), ks = [0, 1, 2, 3, 4, 5, 6, 7].map(() => .78 + rb() * .34); if (L.depth(x, y) < 16) continue;
        ctx.beginPath(); ks.forEach((k, j) => { const b = j / 8 * TAU; ctx.lineTo(x + Math.cos(b) * w * k, y + Math.sin(b) * h * k); }); ctx.closePath(); ctx.fillStyle = '#08202a'; ctx.fill(); ctx.strokeStyle = '#103a44'; ctx.lineWidth = .5; ctx.stroke();
      }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      const hebra = (x, y, a, l, n) => {
        const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l;
        ctx.strokeStyle = `rgba(60,230,190,${.16 + n * .08})`; ctx.lineWidth = .3 + n * .14; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo((x + x2) / 2 + (rb() - .5) * 4, (y + y2) / 2, x2, y2); ctx.stroke();
        if (n > 0 && rb() < .88) { hebra(x2, y2, a - .25 - rb() * .5, l * .78, n - 1); hebra(x2, y2, a + .25 + rb() * .5, l * .74, n - 1); } else glowDot(ctx, x2, y2, 1.9, '#5fffd0', .5);
      };
      for (const r of L.tops) for (let x = r.x0 + 4; x < r.x1 - 3; x += 10 + rb() * 15) hebra(x, r.y + 1, Math.PI / 2 + (rb() - .5) * .5, 7 + rb() * 9, 3);
      ctx.restore();
      ctx.restore();
      ctx.shadowColor = '#3fffd0'; ctx.shadowBlur = 6 * f.S; ctx.strokeStyle = '#2de0b0'; ctx.lineWidth = 1.1; ctx.lineCap = 'round';
      ctx.beginPath(); for (const r of L.tops) { ctx.moveTo(r.x0 + 2, r.y); for (let x = r.x0 + 2; x <= r.x1 - 2; x += 3) ctx.lineTo(x, r.y - .3 + Math.sin(x * .7) * .4); } ctx.stroke();
      ctx.fillStyle = '#9fffe6';
      for (const r of L.tops) for (let x = r.x0 + 2; x < r.x1 - 2; x += 1.5) if (hash1(x * 10 | 0, 3) < .3) { const h = 1.5 + hash1(x * 10 | 0, 4) * 4; ctx.fillRect(x, r.y - h, .5, h); if (hash1(x * 10 | 0, 5) < .3) { ctx.beginPath(); ctx.arc(x + .25, r.y - h, .7, 0, TAU); ctx.fill(); } }
      for (const r of L.bottoms) for (let x = r.x0 + 3; x < r.x1 - 3; x += 4 + R(x, 4) * 6) { const l = 6 + R(x, 5) * 18; ctx.shadowBlur = 0; ctx.strokeStyle = '#0c3a3a'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(x, r.y - 1); ctx.quadraticCurveTo(x + 3, r.y + l * .5, x, r.y + l); ctx.stroke(); ctx.shadowBlur = 6 * f.S; ctx.fillStyle = R(x, 6) < .7 ? '#7fffe0' : '#ff9ff3'; ctx.beginPath(); ctx.arc(x, r.y + l, 1.1, 0, TAU); ctx.fill(); }
      for (const o of L.deco) {
        const x = o.x, y = o.y;
        if (o.k === 'T') {
          ctx.shadowBlur = 0; ctx.fillStyle = '#05161f'; ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.bezierCurveTo(x - 2, y - 20, x - 4, y - 30, x - 1, y - 40); ctx.lineTo(x + 2, y - 40); ctx.bezierCurveTo(x + 3, y - 30, x + 2, y - 20, x + 6, y); ctx.fill();
          ctx.beginPath(); for (const [cx, cy, r] of [[x, y - 50, 16], [x - 14, y - 42, 11], [x + 14, y - 42, 11]]) { ctx.moveTo(cx + r, cy); ctx.arc(cx, cy, r, 0, TAU); } ctx.fill();
          ctx.shadowColor = '#5fffd0'; ctx.shadowBlur = 5 * f.S;
          for (let k = 0; k < 14; k++) { const a = R(k, o.i) * TAU, rr = R(k, o.i + 1) * 16; ctx.fillStyle = R(k, o.i + 2) < .75 ? '#5fffd0' : '#ff8ff0'; ctx.beginPath(); ctx.arc(x + Math.cos(a) * rr, y - 46 + Math.sin(a) * rr * .6, .7 + R(k, o.i + 3) * .9, 0, TAU); ctx.fill(); }
          ctx.strokeStyle = 'rgba(95,255,208,.6)'; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.bezierCurveTo(x - 1, y - 20, x - 3, y - 30, x, y - 40); ctx.stroke();
        } else if (o.k === 'f') {
          for (let k = 0; k < 3; k++) {
            const fx = x - 6 + k * 6, h = 4 + ((o.i + k) % 3) * 2.5, pink = (o.i + k) % 3 === 1, c = pink ? '#ff8ff0' : '#5fffe0';
            ctx.shadowBlur = 0; ctx.fillStyle = '#cfe8e0'; ctx.fillRect(fx - .5, y - h, 1, h);
            ctx.shadowColor = c; ctx.shadowBlur = 8 * f.S; ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(fx, y - h, 3, 2, 0, Math.PI, 0); ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(fx - 1, y - h - 1, .4, 0, TAU); ctx.arc(fx + 1, y - h - .7, .3, 0, TAU); ctx.fill();
          }
        } else if (o.k === 'r') {
          ctx.shadowColor = '#7fd8ff'; ctx.shadowBlur = 8 * f.S;
          for (const [dx, h, w, a] of [[-4, 11, 3, -.25], [0, 15, 3.4, 0], [4, 9, 2.6, .3]]) { ctx.save(); ctx.translate(x + dx, y); ctx.rotate(a); ctx.fillStyle = '#7fd8ff'; ctx.beginPath(); ctx.moveTo(-w, 0); ctx.lineTo(-w * .8, -h * .75); ctx.lineTo(0, -h); ctx.lineTo(w * .8, -h * .75); ctx.lineTo(w, 0); ctx.fill(); ctx.fillStyle = '#d8f6ff'; ctx.beginPath(); ctx.moveTo(0, -h); ctx.lineTo(w * .8, -h * .75); ctx.lineTo(w, 0); ctx.lineTo(0, 0); ctx.fill(); ctx.restore(); }
        }
      }
      ctx.shadowBlur = 0;
    },
    front(ctx, f) {
      ctx.globalCompositeOperation = 'lighter';
      ambient(44, 17, (i, a, b, c) => { const x = f.cam + wrap(a * 800 - f.cam * (c * .5 - .1) + Math.sin(f.t * .5 + i) * 14, VW + 40) - 20, y = wrap(b * VH - f.t * (4 + c * 8), VH + 20) - 10, tw = .5 + .5 * Math.sin(f.t * 2 + i * 3); glowDot(ctx, x, y, 2 + c * 3, c < .7 ? '#7fffe0' : '#ff9ff3', .45 * tw); });
      const p = f.g.p; glowDot(ctx, p.x, p.y - 8, 60, '#3fd8c8', .14);
      ctx.globalCompositeOperation = 'source-over';
    },
    player(ctx, p, f) {
      ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, p.x, p.y - 9, 16, '#bfffef', .45); ctx.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.shadowColor = '#bfffef'; ctx.shadowBlur = 6 * f.S;
      drawHero(ctx, p, f, { body: '#e8fffb', body2: '#b8efe6', hair: '#d8fff6', leg: '#c8f5ee', skin: '#ffffff', scarf: '#ff9ff3', eye: '#0a3040' });
      ctx.restore();
      if (Math.random() < .5) spawn(f.g, 1, p.x - p.face * 4, p.y - 8, { v: 12, life: .8, s: 1.2, k: 'spark', cols: ['#bfffef', '#ff9ff3'], g: -15 });
    },
    coin(ctx, x, y, t) {
      const yy = y + Math.sin(t * 2.2 + x) * 2, pu = .85 + Math.sin(t * 4 + x) * .15;
      ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, yy, 13 * pu, '#5fffd0', .35); glowDot(ctx, x, yy, 4.5, '#e8fffb', .9); ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(200,255,240,.7)'; ctx.lineWidth = .5; ctx.beginPath(); for (let i = 0; i < 4; i++) { const a = t * 1.5 + i * Math.PI / 2; ctx.moveTo(x + Math.cos(a) * 5, yy + Math.sin(a) * 5); ctx.lineTo(x + Math.cos(a) * 7.5, yy + Math.sin(a) * 7.5); } ctx.stroke();
    },
    goal(ctx, x, y, t) {
      ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 18; k++) { const a = t * .8 + k / 18 * TAU; glowDot(ctx, x + Math.cos(a) * 12, y - 22 + Math.sin(a) * 18, 3, k % 3 ? '#5fffd0' : '#ff9ff3', .7); }
      glowDot(ctx, x, y - 22, 26, '#5fffd0', .3 + Math.sin(t * 2) * .08);
      ctx.globalCompositeOperation = 'source-over';
    },
    particle(ctx, q) { ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, q.x, q.y, q.s * 2.4, q.c, clamp(q.life / q.max, 0, 1) * .9); ctx.globalCompositeOperation = 'source-over'; },
    over(ctx) { vignette(ctx, .6, '#01060f', .4); },
  });
})();
