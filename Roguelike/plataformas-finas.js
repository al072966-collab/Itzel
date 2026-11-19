'use strict';
// =====================================================================
//  PLATAFORMAS CON ACABADO FINO
//  Vuelve a dibujar las plataformas que se veían como una barra plana,
//  cada una con la técnica de su mundo:
//  · lowpoly  (crystal)    cristal facetado con puntas colgando y destello
//  · óleo     (swirlplat)  pasta de óleo a pinceladas con remolino
//  · vitral   (ice)        vidrio emplomado que deja pasar la luz
//  · cinema   (gasrock)    roca flotante con luz de borde y vetas de gas
//  · bruma    (fogstone)   silueta de piedra con pasto y raíces
//  · hielo    (papelhielo) témpano de papel recortado con carámbanos
//  · acuarela (lily)       nenúfar de acuarela con borde mojado y venas
//  Se registran en MEC.LOOK con el mismo nombre del aspecto base, y
//  drawPlat las usa antes que el dibujo plano.
// =====================================================================
(function () {
  const { LOOK } = MEC;
  const TAU = Math.PI * 2;
  // cada plataforma guarda su semilla para que sus detalles no cambien al moverse
  const sem = pl => pl.sem ?? (pl.sem = (Math.random() * 1e6) | 0);

  // ---------------- lowpoly: cristal facetado ----------------
  LOOK.crystal = (c, pl, f, sk) => {
    const x = pl.x, y = pl.y, w = pl.w, s = sem(pl), r = i => hash1(i, s);
    const n = Math.max(3, Math.round(w / 8)), top = [], bot = [];
    for (let i = 0; i <= n; i++) {
      const px = x + w * i / n;
      top.push([px, y + 2]);
      const fin = i === 0 || i === n;
      bot.push([fin ? px + (i ? -1.5 : 1.5) : px + (r(i) - .5) * 3, y + (fin ? 5 : i % 2 ? 7 + r(i + 20) * 7 : 4 + r(i + 40) * 3)]);
    }
    c.save();
    c.shadowColor = rgba(sk.plat, .55); c.shadowBlur = 6 * f.S;
    c.fillStyle = sk.plat2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y);
    for (let i = n; i >= 0; i--) c.lineTo(bot[i][0], bot[i][1]);
    c.closePath(); c.fill(); c.restore();
    // facetas: luz que entra por la izquierda y se apaga hacia la punta
    for (let i = 0; i < n; i++) {
      const k1 = .15 + r(i + 60) * .35, k2 = .45 + r(i + 80) * .4;
      c.fillStyle = mix(sk.plat, sk.plat2, k1); c.beginPath(); c.moveTo(...top[i]); c.lineTo(...top[i + 1]); c.lineTo(...bot[i]); c.closePath(); c.fill();
      c.fillStyle = mix(sk.plat, sk.plat2, k2); c.beginPath(); c.moveTo(...top[i + 1]); c.lineTo(...bot[i + 1]); c.lineTo(...bot[i]); c.closePath(); c.fill();
    }
    c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = .35; c.beginPath();
    for (let i = 0; i <= n; i++) { c.moveTo(...top[i]); c.lineTo(...bot[i]); if (i < n) { c.moveTo(...top[i + 1]); c.lineTo(...bot[i]); } }
    c.stroke();
    // cara de arriba
    c.fillStyle = shade(sk.plat, .5); c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w - 1, y + 2); c.lineTo(x + 1, y + 2); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(x + 1.5, y, w * .35, .6);
    c.strokeStyle = rgba(sk.line, .55); c.lineWidth = .5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y);
    for (let i = n; i >= 0; i--) c.lineTo(bot[i][0], bot[i][1]);
    c.closePath(); c.stroke();
    // destello que recorre el borde
    const u = ((f.t * .45 + r(99)) % 1.6) / 1.6;
    if (u < .62) {
      const gx = x + w * u / .62, a = Math.sin(u / .62 * Math.PI);
      c.fillStyle = `rgba(255,255,255,${.9 * a})`; c.beginPath();
      c.moveTo(gx, y - 2.6 * a); c.lineTo(gx + .5, y - .5); c.lineTo(gx + 2.6 * a, y); c.lineTo(gx + .5, y + .5);
      c.lineTo(gx, y + 2.6 * a); c.lineTo(gx - .5, y + .5); c.lineTo(gx - 2.6 * a, y); c.lineTo(gx - .5, y - .5); c.closePath(); c.fill();
    }
  };

  // ---------------- óleo: pasta a pinceladas con remolino ----------------
  // tonos más oscuros que el cielo pintado, para que la plataforma se lea encima
  const OLEO = ['#22305a', '#2c3a5e', '#1a2448', '#34467a', '#283a6e', '#141c38'];
  LOOK.swirlplat = (c, pl, f, sk) => {
    const x = pl.x, y = pl.y, w = pl.w, s = sem(pl), r = i => hash1(i, s), t = f.t;
    if (!pl.trazos || pl.trazos.w !== w) {
      const tr = []; const n = Math.round(w * 1.1);
      for (let i = 0; i < n; i++) {
        const fila = r(i * 3) * 7, arriba = fila < 2.2;
        tr.push({ x: r(i * 3 + 1) * (w - 2) + 1, y: fila, l: 2.5 + r(i * 3 + 2) * 4, cu: (r(i + 500) - .5) * 1.6,
          col: arriba ? (r(i + 700) < .45 ? sk.accent : '#f4e8b8') : OLEO[(r(i + 900) * OLEO.length) | 0], lw: .9 + r(i + 1100) * .8 });
      }
      tr.sort((a, b) => b.y - a.y); tr.w = w; pl.trazos = tr;
    }
    c.save(); c.shadowColor = 'rgba(8,10,24,.75)'; c.shadowBlur = 3 * f.S; c.shadowOffsetY = 1.2 * f.S;
    c.fillStyle = '#0e1430'; c.beginPath(); roundRect(c, x - .5, y - .5, w + 1, 8.5, 4); c.fill(); c.restore();
    c.lineCap = 'round';
    for (const q of pl.trazos) {
      const x0 = x + q.x - q.l / 2, yy = y + .8 + q.y;
      c.strokeStyle = q.col; c.lineWidth = q.lw; c.beginPath(); c.moveTo(x0, yy); c.quadraticCurveTo(x0 + q.l / 2, yy + q.cu, x0 + q.l, yy); c.stroke();
    }
    // brillo de la pasta: filo claro arriba y sombra de la pincelada abajo
    c.strokeStyle = 'rgba(255,250,220,.55)'; c.lineWidth = .5; c.beginPath(); c.moveTo(x + 3, y + .6); c.quadraticCurveTo(x + w / 2, y - .6, x + w - 3, y + .6); c.stroke();
    c.strokeStyle = 'rgba(10,14,30,.6)'; c.lineWidth = .9; c.beginPath(); c.moveTo(x + 2, y + 7.6); c.quadraticCurveTo(x + w / 2, y + 8.6, x + w - 2, y + 7.6); c.stroke();
    // remolino pintado: espiral que gira y arcos a pinceladas sueltas
    const cx = x + w / 2, cy = y + 3.6, a0 = t * 2.2;
    c.strokeStyle = sk.accent; c.lineWidth = .8; c.beginPath();
    for (let i = 0; i <= 26; i++) { const u = i / 26, a = a0 + u * TAU * 1.6, rr = .4 + u * 2.8; c[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rr * 1.5, cy + Math.sin(a) * rr * .9); }
    c.stroke();
    for (let i = 0; i < 4; i++) {
      const a = t * 2 + i * 1.7, rr = 7 + i * 2.2;
      c.strokeStyle = i % 2 ? 'rgba(248,226,122,.85)' : 'rgba(156,192,240,.8)'; c.lineWidth = 1.2 - i * .18;
      c.beginPath(); c.ellipse(cx, cy, rr, rr * .62, 0, a, a + .9); c.stroke();
    }
    c.lineCap = 'butt';
  };

  // ---------------- vitral: vidrio emplomado ----------------
  LOOK.ice = (c, pl, f, sk) => {
    const x = pl.x, y = pl.y, w = pl.w, h = 8, s = sem(pl), r = i => hash1(i, s);
    if (!pl.panos || pl.panos.w !== w) {
      // cortes inclinados del plomo: [arriba, abajo]
      const cortes = [[0, 0]]; let p = 0, i = 0;
      while (true) { p += 5 + r(i++) * 6; if (p > w - 4) break; const inc = (r(i + 300) - .5) * 4; cortes.push([p - inc, p + inc]); }
      cortes.push([w, w]);
      const VID = [sk.plat, '#5fa8e0', '#bfe4ff', sk.plat2, '#7fc8b0', '#a8d4f8'];
      const panos = [];
      for (let j = 0; j < cortes.length - 1; j++)
        panos.push({ a0: cortes[j][0], a1: cortes[j][1], b0: cortes[j + 1][0], b1: cortes[j + 1][1], col: r(j + 500) < .14 ? sk.accent : VID[(r(j + 600) * VID.length) | 0] });
      panos.w = w; pl.panos = panos;
    }
    // luz de colores que cae debajo
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const q of pl.panos) { c.fillStyle = rgba(q.col, .07); c.beginPath(); c.moveTo(x + q.a1, y + h); c.lineTo(x + q.b1, y + h); c.lineTo(x + q.b1 + 3, y + h + 14); c.lineTo(x + q.a1 + 3, y + h + 14); c.closePath(); c.fill(); }
    c.restore();
    for (const q of pl.panos) {
      const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, shade(q.col, .35)); g.addColorStop(.55, q.col); g.addColorStop(1, shade(q.col, -.25));
      c.fillStyle = g; c.beginPath(); c.moveTo(x + q.a0, y); c.lineTo(x + q.b0, y); c.lineTo(x + q.b1, y + h); c.lineTo(x + q.a1, y + h); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = .45; c.beginPath(); c.moveTo(x + q.a0 + 1.4, y + 1.6); c.lineTo(x + Math.min(q.b0 - 1, q.a0 + 3.5), y + 1.6); c.moveTo(x + q.a0 + 1.4, y + 1.6); c.lineTo(x + q.a0 + 1.2 + (q.a1 - q.a0) * .3, y + 3.6); c.stroke();
    }
    // brillo que resbala por el vidrio
    const u = ((f.t * .35 + r(77)) % 1.4) / 1.4;
    if (u < .7) {
      c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
      const gx = x - 6 + (w + 12) * u / .7; c.fillStyle = 'rgba(255,255,255,.38)';
      c.beginPath(); c.moveTo(gx, y); c.lineTo(gx + 2.5, y); c.lineTo(gx - 1.5, y + h); c.lineTo(gx - 4, y + h); c.closePath(); c.fill(); c.restore();
    }
    // plomo
    c.strokeStyle = sk.line; c.lineJoin = 'round'; c.lineWidth = 1.1; c.beginPath();
    for (const q of pl.panos.slice(1)) { c.moveTo(x + q.a0, y); c.lineTo(x + q.a1, y + h); }
    c.stroke(); c.lineWidth = 1.4; c.strokeRect(x, y, w, h);
    c.strokeStyle = 'rgba(120,130,150,.5)'; c.lineWidth = .35; c.beginPath(); c.moveTo(x, y - .3); c.lineTo(x + w, y - .3); c.stroke();
    c.lineJoin = 'miter';
  };

  // ---------------- cinema: roca flotante con luz de borde ----------------
  LOOK.gasrock = (c, pl, f, sk) => {
    const x = pl.x, y = pl.y, w = pl.w, s = sem(pl), r = i => hash1(i, s), t = f.t;
    const n = Math.max(3, Math.round(w / 7)), bot = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, d = Math.sin(u * Math.PI);
      bot.push([x + w * u + (i && i < n ? (r(i) - .5) * 3 : 0), y + 3 + d * (8 + r(i + 30) * 5)]);
    }
    const punta = [x + w * (.4 + r(50) * .2), y + 18 + r(51) * 5];
    // gas que sale por debajo
    c.save(); c.globalCompositeOperation = 'lighter';
    glowDot(c, punta[0], punta[1] - 3, 9, sk.accent, .18 + Math.sin(t * 3 + s) * .05);
    for (let i = 0; i < 3; i++) { const by = y + 14 + ((t * 14 + i * 6) % 18); glowDot(c, x + w * (.3 + i * .2), by, 2.6, sk.accent, .45 * (1 - (by - y - 14) / 18)); }
    c.restore();
    // facetas, más oscuras hacia la punta
    const centro = [x + w / 2, y + 3];
    for (let i = 0; i < n; i++) {
      c.fillStyle = mix(sk.plat2, '#1c1826', .25 + r(i + 70) * .35);
      c.beginPath(); c.moveTo(...centro); c.lineTo(...bot[i]); c.lineTo(...bot[i + 1]); c.closePath(); c.fill();
      c.fillStyle = mix(sk.plat, '#120e1a', .3 + r(i + 90) * .4);
      c.beginPath(); c.moveTo(...bot[i]); c.lineTo(...bot[i + 1]); c.lineTo(...punta); c.closePath(); c.fill();
    }
    // vetas de gas
    c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = rgba(sk.accent, .45 + Math.sin(t * 2.4 + s) * .2); c.lineWidth = .5;
    c.shadowColor = sk.accent; c.shadowBlur = 3 * f.S; c.beginPath();
    for (let k = 0; k < 2; k++) { let px = x + w * (.25 + k * .45), py = y + 4; c.moveTo(px, py); for (let j = 0; j < 4; j++) { px += (r(k * 9 + j + 200) - .5) * 5; py += 2.5; c.lineTo(px, py); } }
    c.stroke(); c.restore();
    // cara de arriba con luz cálida y borde frío
    c.fillStyle = shade(sk.plat2, .18); c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(bot[n][0], bot[n][1]); c.lineTo(bot[0][0], bot[0][1]); c.closePath(); c.fill();
    c.fillStyle = shade(sk.plat2, .42); c.fillRect(x + 1, y, w - 2, 1);
    c.strokeStyle = rgba(sk.accent, .8); c.lineWidth = .6; c.beginPath(); c.moveTo(x + w * .55, y + .2); c.lineTo(x + w, y + .2); c.lineTo(bot[n][0] - .3, bot[n][1]); c.lineTo(bot[n - 1][0], bot[n - 1][1]); c.stroke();
    // piedritas que flotan con ella
    for (let i = 0; i < 2; i++) { const px = x + w * (.2 + i * .6) + Math.sin(t * 1.3 + i * 2) * 1.5, py = y + 16 + i * 4 + Math.cos(t * 1.7 + i) * 1.2; c.fillStyle = mix(sk.plat, '#120e1a', .4); c.beginPath(); c.moveTo(px - 1.4, py); c.lineTo(px, py - 1.2); c.lineTo(px + 1.4, py); c.lineTo(px, py + 1.4); c.closePath(); c.fill(); c.fillStyle = rgba(sk.accent, .7); c.fillRect(px - .2, py - 1.1, 1.2, .4); }
  };

  // ---------------- bruma: silueta de piedra con pasto y raíces ----------------
  LOOK.fogstone = (c, pl, f, sk) => {
    const x = pl.x, y = pl.y, w = pl.w, s = sem(pl), r = i => hash1(i, s), t = f.t, a = pl.glow || 0;
    c.globalAlpha *= .22 + a * .78;
    c.fillStyle = sk.plat;
    // raíces que cuelgan y se mecen
    c.strokeStyle = sk.plat; c.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      if (r(i + 5) < .25) continue;
      const rx = x + w * (.18 + i * .32 + (r(i) - .5) * .12), l = 3 + r(i + 10) * 6, sw = Math.sin(t * 1.4 + i * 2 + s) * 1.2, cu = (r(i + 15) - .5) * 5;
      for (let k = 0; k < 3; k++) {
        const u0 = k / 3, u1 = (k + 1) / 3; c.lineWidth = .8 * (1 - u0 * .7);
        const pt = u => [rx + Math.sin(u * 3) * cu * .5 + sw * u * u, y + 5.5 + l * u];
        c.beginPath(); c.moveTo(...pt(u0)); c.lineTo(...pt(u1)); c.stroke();
      }
    }
    c.lineCap = 'butt';
    // cuerpo de piedra redondeada con borde de abajo irregular
    c.beginPath(); c.moveTo(x + 1.5, y + .6);
    const n = Math.max(4, Math.round(w / 3));
    for (let i = 0; i <= n; i++) c.lineTo(x + 1.5 + (w - 3) * i / n, y + (r(i + 80) - .5) * .5);
    c.quadraticCurveTo(x + w + .3, y + .4, x + w - .3, y + 3.4);
    for (let i = n; i >= 0; i--) c.lineTo(x + 1 + (w - 2) * i / n, y + 5.4 + r(i + 100) * 2.2);
    c.quadraticCurveTo(x - .4, y + 3.6, x + 1.5, y + .6); c.closePath(); c.fill();
    // matitas de pasto chiquitas y suaves (que no parezcan picos)
    c.strokeStyle = sk.plat; c.lineWidth = .35; c.beginPath();
    for (let i = 0; i < w / 2.5; i++) { if (r(i + 40) < .45) continue; const px = x + 2 + r(i + 41) * (w - 4), bh = .8 + r(i + 60) * 1.1, sw = Math.sin(t * 1.8 + px * .3) * .35; c.moveTo(px, y + .3); c.quadraticCurveTo(px + sw, y - bh * .5, px + sw * 2 + (r(i + 70) - .5), y - bh); }
    c.stroke();
    // filo de luz del faro arriba
    if (a > .1) { c.fillStyle = `rgba(255,255,255,${.22 * a})`; c.fillRect(x + 2, y + 1, w - 4, .6); }
  };

  // ---------------- hielo: témpano de papel recortado ----------------
  LOOK.papelhielo = (c, pl, f, sk) => {
    const x = pl.x, y = pl.y, w = pl.w, k = pl.cracks || 0, s = sem(pl), r = i => hash1(i, s);
    const n = Math.max(3, Math.round(w / 5));
    // carámbanos (capa de atrás)
    c.save(); c.shadowColor = 'rgba(40,60,100,.35)'; c.shadowBlur = 2.5 * f.S; c.shadowOffsetY = 1.2 * f.S;
    c.fillStyle = sk.plat2; c.beginPath();
    for (let i = 0; i < n; i++) { if (r(i + 5) < .35) continue; const px = x + 2 + (w - 4) * (i + .5) / n, l = 3 + r(i + 25) * 6; c.moveTo(px - 1.6, y + 6); c.lineTo(px + .2, y + 6 + l); c.lineTo(px + 1.6, y + 6); }
    c.fill();
    // capa azul de en medio
    c.fillStyle = sk.plat; c.beginPath(); c.moveTo(x - .5, y + 1); c.lineTo(x + w + .5, y + 1); c.lineTo(x + w - 2, y + 7); c.lineTo(x + 2, y + 7.4); c.closePath(); c.fill();
    // capa blanca de arriba con borde de nieve
    c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(x, y + 3);
    for (let i = 0; i <= n; i++) c.lineTo(x + w * i / n, y - .4 - r(i + 45) * 1.2);
    c.lineTo(x + w, y + 3);
    for (let i = n; i >= 0; i--) c.lineTo(x + w * i / n, y + 3.2 + r(i + 65) * 1.4);
    c.closePath(); c.fill(); c.restore();
    // brillo y grano de papel
    c.fillStyle = 'rgba(140,180,220,.35)'; for (let i = 0; i < w / 3; i++) c.fillRect(x + r(i + 200) * w, y + 1 + r(i + 300) * 5, .4, .4);
    c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = .4; c.beginPath(); c.moveTo(x + 1, y + 5.5); c.lineTo(x + w * .45, y + 5.2); c.stroke();
    if (k) {
      c.strokeStyle = sk.line; c.lineWidth = .55; c.beginPath();
      for (let i = 0; i < k; i++) { const cx = x + w * (.3 + i * .22); c.moveTo(cx, y - .5); c.lineTo(cx + 2, y + 2.5); c.lineTo(cx - 1, y + 5); c.lineTo(cx + 1, y + 7); c.moveTo(cx + 2, y + 2.5); c.lineTo(cx + 4, y + 3.2); }
      c.stroke();
    }
  };

  // ---------------- biolum: tronco con hongos que brillan con la luz ----------------
  LOOK.glowline = (c, pl, f, sk) => {
    const x = pl.x, y = pl.y, w = pl.w, s = sem(pl), r = i => hash1(i, s), t = f.t, a = pl.glow || 0;
    if (a < .08) { c.strokeStyle = rgba(sk.accent, .35); c.lineWidth = .6; c.setLineDash([1.5, 2]); c.beginPath(); roundRect(c, x, y, w, 5, 2.5); c.stroke(); c.setLineDash([]); return; }
    c.globalAlpha *= .35 + a * .65;
    // tronco oscuro con vetas
    c.save(); c.shadowColor = rgba(sk.accent, .5 * a); c.shadowBlur = 5 * f.S; c.fillStyle = '#163a42'; c.beginPath(); roundRect(c, x, y + .5, w, 6, 3); c.fill(); c.restore();
    c.strokeStyle = '#2a5a62'; c.lineWidth = .4; c.beginPath();
    for (let i = 0; i < 3; i++) { const yy = y + 2 + i * 1.3; c.moveTo(x + 2 + r(i) * 3, yy); c.quadraticCurveTo(x + w / 2, yy + (r(i + 5) - .5), x + w - 2 - r(i + 9) * 3, yy); }
    c.stroke();
    c.fillStyle = '#081418'; c.beginPath(); c.ellipse(x + w - 1.2, y + 3.25, 1.2, 2.6, 0, 0, TAU); c.fill();
    c.strokeStyle = '#1c4048'; c.beginPath(); c.ellipse(x + w - 1.2, y + 3.25, .6, 1.4, 0, 0, TAU); c.stroke();
    // filamentos que cuelgan y brillan
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) { const fx = x + w * (.15 + i * .23) + (r(i + 20) - .5) * 3, l = 2 + r(i + 30) * 5, sw = Math.sin(t * 1.6 + i) * .6; c.strokeStyle = rgba(sk.accent, .5 * a); c.lineWidth = .3; c.beginPath(); c.moveTo(fx, y + 6); c.quadraticCurveTo(fx + sw, y + 6 + l * .6, fx + sw * 1.5, y + 6 + l); c.stroke(); glowDot(c, fx + sw * 1.5, y + 6 + l, 1.4, sk.accent, .7 * a); }
    // manchas luminosas en la corteza
    for (let i = 0; i < w / 5; i++) glowDot(c, x + 2 + r(i + 40) * (w - 4), y + 2 + r(i + 50) * 3, .9 + r(i + 60) * .6, sk.light || sk.accent, (.35 + Math.sin(t * 2 + i * 1.7) * .15) * a);
    c.restore();
    // hongos encima
    const nh = 2 + ((r(70) * 2) | 0);
    for (let i = 0; i < nh; i++) {
      const hx = x + w * (.15 + (i + r(i + 80) * .6) / nh * .75), hh = 1.6 + r(i + 90) * 1.6, hr = 1.2 + r(i + 95) * 1;
      c.fillStyle = '#bfeee4'; c.fillRect(hx - .25, y + .5 - hh, .5, hh);
      c.save(); c.shadowColor = sk.accent; c.shadowBlur = 5 * f.S * a; c.fillStyle = mix(sk.accent, '#ffffff', .25); c.beginPath(); c.ellipse(hx, y + .6 - hh, hr, hr * .6, 0, Math.PI, 0); c.fill(); c.restore();
    }
    c.fillStyle = rgba(sk.accent, .9 * a); c.fillRect(x + 2, y + .4, w - 4, .6);
  };

  // ---------------- sumie: nube de tinta a pincel ----------------
  LOOK.inkcloud = (c, pl, f, sk) => {
    const x = pl.x, y = pl.y, w = pl.w, s = sem(pl), r = i => hash1(i, s);
    const k = pl.k === 'timed' ? (pl.on ? clamp(Math.min(pl.ph / .1, ((pl.duty || .62) - pl.ph) / .15), 0, 1) : 0) : 1;
    if (k < .05 && pl.k === 'timed') { c.fillStyle = 'rgba(29,27,25,.08)'; c.beginPath(); c.ellipse(x + w / 2, y + 3, w / 2, 3, 0, 0, TAU); c.fill(); return; }
    c.globalAlpha *= .3 + k * .7;
    const n = Math.max(3, Math.round(w / 9)), lob = [];
    for (let i = 0; i < n; i++) lob.push([x + 3 + (w - 6) * (i + .5) / n, y + 2.6 + (r(i) - .5), 3.4 + r(i + 10) * 1.6]);
    // aguada gris: el cuerpo de la nube
    c.fillStyle = rgba(sk.plat2, .55); c.beginPath();
    for (const [cx, cy, rr] of lob) { c.moveTo(cx + rr, cy + 1); c.ellipse(cx, cy + 1, rr, rr * .75, 0, 0, TAU); }
    c.fill();
    c.fillStyle = rgba(sk.plat, .35); c.beginPath(); c.ellipse(x + w / 2, y + 4.2, w / 2 - 1, 2.2, 0, 0, TAU); c.fill();
    // contorno de tinta: lóbulos arriba, cargado al empezar y seco al final
    c.strokeStyle = sk.line; c.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const [cx, cy, rr] = lob[i];
      for (let j = 0; j < 3; j++) { const a0 = Math.PI * (1 + j / 3), a1 = Math.PI * (1 + (j + 1) / 3); c.lineWidth = 1.1 - j * .3; c.beginPath(); c.ellipse(cx, cy + 1, rr, rr * .75, 0, a0, a1 + .05); c.stroke(); }
    }
    // rizo de la cola, como nube de pintura china
    const ex = x + w - 1.5, ey = y + 4;
    c.lineWidth = .7; c.beginPath();
    for (let i = 0; i <= 16; i++) { const u = i / 16, a = Math.PI * .5 - u * TAU * .9, rr = 2.6 * (1 - u * .7); c[i ? 'lineTo' : 'moveTo'](ex + Math.cos(a) * rr, ey + Math.sin(a) * rr * .8); }
    c.stroke();
    c.lineWidth = .5; c.beginPath(); c.moveTo(x + 1.5, y + 5.8); c.quadraticCurveTo(x + w / 2, y + 7.2, ex - 1, y + 6); c.stroke();
    // pincel seco: huecos en el contorno
    c.save(); c.globalCompositeOperation = 'destination-out'; c.fillStyle = 'rgba(0,0,0,.6)';
    for (let i = 0; i < w / 2; i++) c.fillRect(x + r(i + 30) * w, y - 2 + r(i + 40) * 3, .9 + r(i + 50) * 1.6, .25);
    c.restore(); c.lineCap = 'butt';
  };

  // ---------------- cielo: meteoro grabado como carta de estrellas ----------------
  LOOK.meteoro = (c, pl, f, sk) => {
    const u = pl.u ?? .5, al = clamp(Math.min((u - .02) / .06, (.94 - u) / .06), 0, 1), x = pl.x, y = pl.y, w = pl.w, s = sem(pl), r = i => hash1(i, s), t = f.t;
    c.save(); c.globalAlpha *= al;
    // estela: rayas punteadas de oro que se abren hacia atrás
    c.strokeStyle = rgba(sk.accent, .55); c.lineWidth = .45;
    for (let i = 0; i < 5; i++) { c.setLineDash([2 + i, 1.5 + i * .6]); c.lineDashOffset = -t * 20; c.beginPath(); c.moveTo(x + 1, y + 2 + i * 1.5); c.lineTo(x - 12 - i * 6, y + .5 + i * 2.2); c.stroke(); }
    c.setLineDash([]);
    // cuerpo con perfil irregular
    const n = 9, pts = [];
    for (let i = 0; i <= n; i++) { const v = i / n, d = Math.sin(v * Math.PI); pts.push([x + w * v + (i && i < n ? (r(i) - .5) * 2.5 : 0), y + 3 + d * (5 + r(i + 20) * 4)]); }
    const cuerpo = () => { c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); for (let i = n; i >= 0; i--) c.lineTo(...pts[i]); c.closePath(); };
    const g = c.createLinearGradient(0, y, 0, y + 12); g.addColorStop(0, shade(sk.plat, .12)); g.addColorStop(1, sk.plat2);
    c.fillStyle = g; cuerpo(); c.fill();
    // achurado de grabado en la mitad en sombra
    c.save(); cuerpo(); c.clip(); c.strokeStyle = rgba(sk.accent, .28); c.lineWidth = .3; c.beginPath();
    for (let i = -10; i < w; i += 1.6) { c.moveTo(x + i + w * .45, y + 2); c.lineTo(x + i + w * .45 + 8, y + 12); }
    c.stroke();
    // cráteres
    for (let i = 0; i < 3; i++) { const cx = x + w * (.2 + i * .27 + (r(i + 40) - .5) * .08), cy = y + 3 + (i % 2) * 2.2, rr = .9 + r(i + 50) * 1; c.strokeStyle = rgba(sk.accent, .8); c.lineWidth = .4; c.beginPath(); c.arc(cx, cy, rr, 0, TAU); c.stroke(); c.beginPath(); c.arc(cx + .3, cy + .3, rr * .6, Math.PI * .1, Math.PI * .9); c.stroke(); }
    c.restore();
    c.strokeStyle = sk.accent; c.lineWidth = .7; cuerpo(); c.stroke();
    c.fillStyle = shade(sk.accent, .35); c.fillRect(x + 1, y - .1, w - 2, .6);
    // chispa en la punta
    const tw = .6 + Math.sin(t * 6 + s) * .4; c.fillStyle = `rgba(255,244,210,${tw})`;
    c.beginPath(); const sx = x + w + 1, sy = y + 1.5; c.moveTo(sx, sy - 2.4); c.lineTo(sx + .5, sy - .5); c.lineTo(sx + 2.4, sy); c.lineTo(sx + .5, sy + .5); c.lineTo(sx, sy + 2.4); c.lineTo(sx - .5, sy + .5); c.lineTo(sx - 2.4, sy); c.lineTo(sx - .5, sy - .5); c.closePath(); c.fill();
    c.restore();
  };

  // ---------------- acuarela: nenúfar con borde mojado ----------------
  LOOK.lily = (c, pl, f, sk) => {
    const x = pl.x, y = pl.y, w = pl.w, s = sem(pl), r = i => hash1(i, s), t = f.t, cx = x + w / 2, cy = y + 2, rx = w / 2, ry = 3.6;
    // ondas en el agua, como trazo de pincel aguado
    c.strokeStyle = 'rgba(110,150,200,.35)'; c.lineWidth = .7;
    for (let i = 0; i < 2; i++) { const e = (t * .5 + i * .5) % 1; c.globalAlpha *= 1; c.beginPath(); c.ellipse(cx, y + 4.2, rx + 2 + e * 6, 1.8 + e * 1.4, 0, .1, Math.PI - .1); c.strokeStyle = `rgba(110,150,200,${.4 * (1 - e)})`; c.stroke(); }
    const hoja = () => { c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, -1.25, TAU - 1.9); c.lineTo(cx, cy); c.closePath(); };
    c.fillStyle = rgba(sk.plat, .88); hoja(); c.fill();
    c.save(); hoja(); c.clip();
    c.fillStyle = rgba(shade(sk.plat, .3), .7); c.beginPath(); c.ellipse(cx - rx * .25 + (r(1) - .5) * 4, cy - .6, rx * .45, ry * .55, 0, 0, TAU); c.fill();
    c.fillStyle = rgba(sk.plat2, .45); c.beginPath(); c.ellipse(cx + rx * .35, cy + 1.2, rx * .5, ry * .5, 0, 0, TAU); c.fill();
    c.strokeStyle = rgba(sk.line, .3); c.lineWidth = .35; c.beginPath();
    for (let i = 0; i < 7; i++) { const a = -1.1 + i * .62 + (r(i + 10) - .5) * .2; c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry); }
    c.stroke(); c.restore();
    // borde mojado: el pigmento se junta en la orilla
    c.strokeStyle = rgba(sk.plat2, .85); c.lineWidth = .8; hoja(); c.stroke();
    c.strokeStyle = rgba(sk.line, .4); c.lineWidth = .35; c.beginPath(); c.ellipse(cx, cy + .5, rx - .3, ry - .2, 0, .15, Math.PI - .15); c.stroke();
    // flor de loto en algunas hojas
    if (r(3) < .5) {
      const fx = x + w * (.22 + r(4) * .12), fy = y - .6;
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .45; c.fillStyle = i % 2 ? rgba(sk.accent, .9) : rgba(shade(sk.accent, .35), .9); c.beginPath(); c.ellipse(fx + Math.cos(a) * 1.4, fy + Math.sin(a) * 1.4, .9, 2.1, a + Math.PI / 2, 0, TAU); c.fill(); }
      c.fillStyle = '#f6d36a'; c.beginPath(); c.arc(fx, fy + .2, .7, 0, TAU); c.fill();
    } else { c.fillStyle = rgba(sk.accent, .85); c.beginPath(); c.arc(x + w * .3, y + .4, 1.4, 0, TAU); c.fill(); }
  };
})();
