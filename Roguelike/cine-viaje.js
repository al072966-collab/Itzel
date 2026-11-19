'use strict';
// =====================================================================
//  CINEMÁTICA 2 · CARGA ENTRE MUNDOS: «La grieta entre mundos»
//  Reemplaza a «Bordando el mundo…». Unos 3.8 s:
//   A. en el mundo que se deja se abre una grieta y Itzel se zambulle
//   B. respiro: el mundo viejo se queda quieto y ahí se arma el nuevo
//   C. el mundo viejo se rompe a su manera (según su técnica) y deja ver
//      el nuevo, ya vivo
//   D. Itzel cae de una costurita en el aire; se borda el parche del mundo
//   E. franjas fuera, HUD y a jugar
//  Con opc.salida (el mundo elegido en la enciclopedia) no hay mundo viejo:
//  sale solo la segunda mitad, desde la grieta hasta el mundo pedido.
//  Itzel y Fresita siempre las dibuja el motor del propio mundo (antes de
//  armar el nuevo y después), así que sirve para los 32 estilos. Todo se
//  compone en el lienzo de cinemáticas, a la resolución de la ventana; al
//  final la imagen coincide con el primer cuadro de juego.
// =====================================================================
(() => {
  const FAMILIA = {
    pixel: 'pixel', bits8: 'pixel', bits32: 'pixel', bits64: 'pixel',
    acuarela: 'tinta', sumie: 'tinta', bruma: 'tinta', agua: 'tinta',
    paper: 'papel', cuaderno: 'papel', codex: 'papel', grabado: 'papel', fuego: 'papel', hielo: 'papel',
    neon: 'luz', cyber: 'luz', biolum: 'luz', cielo: 'luz', cinema: 'luz',
    vitral: 'vidrio', deco: 'vidrio', nouveau: 'vidrio', lowpoly: 'vidrio', flat: 'vidrio',
    oleo: 'pintura', ocaso: 'pintura', anime: 'pintura',
    vapor: 'engranes', barro: 'plastilina', eco: 'diorama', hollin: 'ceniza',
  };
  const HILOS = ['#c8203a', '#f2b233', '#3f9a5c', '#2f7fc8', '#e85a8a'];
  let ultimaFamilia = null, vueltas = 0;
  const familiaDe = id => FAMILIA[(STYLE_MAP[id] && STYLE_MAP[id].id) || id] || 'bordado';

  // ---------- utilidades de pantalla (en pixeles del lienzo de cinemáticas) ----------
  const escala = M => M.w / (innerWidth || M.w);
  function rectJuego(M) { const q = escala(M), r = canvas.getBoundingClientRect(); return [r.left * q, r.top * q, r.width * q, r.height * q]; }
  // un punto del mundo en pantalla; también devuelve cuántos pixeles mide una unidad
  function aPantalla(g, titulo, x, y, M) {
    const [X, Y, W, H] = rectJuego(M), Hv = titulo ? VH : VISTA.H, y0 = titulo ? 0 : (g.camY ?? VH - VISTA.H);
    return [X + (x - g.cam) * W / VW, Y + (y - y0) * H / Hv, W / VW];
  }
  // compone lo que se ve del juego: fondo, la franja de cielo de arriba, el lienzo del mundo y las letras nítidas
  function componer(ctx, M, z = 1, ancla = [0, 0], blur = 0, destino = null) {
    const q = escala(M);
    ctx.fillStyle = '#1a120d'; ctx.fillRect(0, 0, M.w, M.h);
    const rl = document.getElementById('relleno');
    if (rl && rl.style.display !== 'none' && rl.width > 1) { const r = rl.getBoundingClientRect(); if (r.height > 0) ctx.drawImage(rl, r.left * q, r.top * q, r.width * q, r.height * q); }
    const [X, Y, W, H] = rectJuego(M);
    ctx.save(); ctx.beginPath(); ctx.rect(X, Y, W, H); ctx.clip();
    if (z !== 1 || destino) { const d = destino || ancla; ctx.translate(d[0], d[1]); ctx.scale(z, z); ctx.translate(-ancla[0], -ancla[1]); } // el punto ancla queda en destino (o se queda donde está)
    ctx.imageSmoothingEnabled = !(view.st && (view.st.pixel || view.st.fixedS));
    if (blur >= .5) ctx.filter = `blur(${Math.round(blur)}px)`; // profundidad de campo (entradas de jefe); en pixeles enteros, que la GPU prepara una vez por radio
    if (canvas.width > 1) ctx.drawImage(canvas, X, Y, W, H);
    ctx.filter = 'none';
    const tx = document.getElementById('textos'); if (tx && tx.width > 1) { const r = tx.getBoundingClientRect(); ctx.drawImage(tx, r.left * q, r.top * q, r.width * q, r.height * q); }
    ctx.restore(); ctx.imageSmoothingEnabled = true;
  }
  // el mundo se dibuja con su propio motor (el mismo que en el juego)
  function pintaMundo(g, titulo) {
    if (g.modo) { g.modo.pintar(g, view); return; }
    view.g = g; view.y0 = titulo ? 0 : (g.camY ?? VH - VISTA.H);
    if (view.bctx) TEXTOS.envolver(view.bctx);
    view.render();
    if (!titulo && typeof pintaRelleno === 'function') pintaRelleno(); // en ventanas altas, la franja de cielo de arriba es la de este mundo
  }
  function pasoParticulas(g, dt) {
    if (!g.parts) return;
    for (const q of g.parts) { q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= Math.pow(.25, dt); q.life -= dt; q.r += dt * 6; }
    g.parts = g.parts.filter(q => q.life > 0);
  }
  function puntada(x, x0, y0, s, col) {
    const a = s * .14, b = s * .86; x.lineCap = 'round';
    x.strokeStyle = shade(col, -.35); x.lineWidth = s * .36; x.beginPath(); x.moveTo(x0 + a, y0 + a + s * .05); x.lineTo(x0 + b, y0 + b + s * .05); x.stroke();
    x.strokeStyle = col; x.lineWidth = s * .32; x.beginPath(); x.moveTo(x0 + a, y0 + a); x.lineTo(x0 + b, y0 + b); x.stroke();
    x.strokeStyle = shade(col, -.2); x.lineWidth = s * .34; x.beginPath(); x.moveTo(x0 + b, y0 + a); x.lineTo(x0 + a, y0 + b); x.stroke();
    x.strokeStyle = 'rgba(255,255,255,.3)'; x.lineWidth = s * .09; x.beginPath(); x.moveTo(x0 + b - s * .08, y0 + a + s * .08); x.lineTo(x0 + a + s * .2, y0 + b - s * .2); x.stroke();
  }
  // el portal: la grieta de la entrada, chiquita y en el aire. abre 0..1, cierra 0..1
  const TRAZO_PORTAL = GRIETA.trazo(4);
  function grietaAire(ctx, x, y, s, alto, abre, cierra, T) {
    if (abre <= 0 || cierra >= 1) return;
    const k = alto * s / 228, cae = 1 - EASE.in3(cierra);
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k * cae);
    GRIETA.dibuja(ctx, TRAZO_PORTAL, { T, alto: Math.min(1, .1 + abre * 1.3), ancho: 84 * EASE.out2(abre) * (1 - cierra * cierra), aspira: .75 });
    ctx.restore();
    // al cerrarse suelta un destello cian y magenta
    if (cierra > .5) { const q = (cierra - .5) / .5; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 12; i++) { const an = i / 12 * TAU + T, r = (4 + q * 22) * s; ctx.globalAlpha = 1 - q; ctx.fillStyle = i % 2 ? '#ff5ad0' : '#62f4ff'; ctx.beginPath(); ctx.arc(x + Math.cos(an) * r, y + Math.sin(an) * r * .7, 1.3 * s * (1 - q * .5), 0, TAU); ctx.fill(); } ctx.restore(); }
  }
  // corta un polígono por el semiplano f(p) >= 0 (f lineal)
  function cortaPoligono(P, f) {
    const out = [];
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length], fa = f(a), fb = f(b);
      if (fa >= 0) out.push(a);
      if ((fa >= 0) !== (fb >= 0)) { const u = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]); }
    }
    return out;
  }
  const traza = (ctx, P) => { ctx.beginPath(); P.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); };
  function engrane(ctx, x, y, r, rot, a) {
    if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = a;
    const n = 12; ctx.beginPath();
    for (let i = 0; i < n * 2; i++) { const an = i / (n * 2) * TAU, rr = i % 2 ? r * .82 : r; ctx.lineTo(Math.cos(an - .08) * rr, Math.sin(an - .08) * rr); ctx.lineTo(Math.cos(an + .08) * rr, Math.sin(an + .08) * rr); }
    ctx.closePath(); ctx.fillStyle = '#8a5a24'; ctx.fill(); ctx.lineWidth = Math.max(1, r * .05); ctx.strokeStyle = '#3a2410'; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * .62, 0, TAU); ctx.fillStyle = '#b8862e'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#5a3a18'; for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate(i * Math.PI / 2 + .4); ctx.beginPath(); ctx.ellipse(r * .34, 0, r * .14, r * .1, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    ctx.beginPath(); ctx.arc(0, 0, r * .13, 0, TAU); ctx.fillStyle = '#ffe2a0'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,230,170,.5)'; ctx.lineWidth = Math.max(1, r * .03); ctx.beginPath(); ctx.arc(0, 0, r * .9, -2.4, -1.2); ctx.stroke();
    ctx.restore();
  }
  // banda de brochazo/espátula (forma ahusada con orillas irregulares) de xa a xb
  function banda(x, xa, y, xb, w, curv, sem) {
    const n = 14; x.beginPath();
    for (let i = 0; i <= n; i++) { const u = i / n, px = lerp(xa, xb, u); x.lineTo(px, y + curv * Math.sin(u * Math.PI) - w / 2 * (.82 + hash1(i, sem) * .3)); }
    for (let i = n; i >= 0; i--) { const u = i / n, px = lerp(xa, xb, u); x.lineTo(px, y + curv * Math.sin(u * Math.PI) + w / 2 * (.82 + hash1(i, sem + 7) * .3)); }
    x.closePath();
  }

  // =====================================================================
  //  LAS FORMAS DE ROMPERSE. P = { img (el mundo viejo), W, H, O (dónde se fue Itzel), rnd }
  //  prep(P) se hace una vez, en el respiro; draw(ctx, P, Q, u, T) con u de 0 a 1.
  // =====================================================================
  const EFECTOS = {
    // pixel: se desarma en cuadritos que caen girando, en cascada desde la grieta
    pixel: {
      prep(P) {
        const b = Math.max(12, Math.round(P.H / 18)), bl = [], D = Math.hypot(P.W, P.H);
        for (let y = 0; y < P.H; y += b) for (let x = 0; x < P.W; x += b) bl.push({ x, y, w: Math.min(b, P.W - x), h: Math.min(b, P.H - y), ts: Math.hypot(x + b / 2 - P.O[0], y + b / 2 - P.O[1]) / D * .72 + P.rnd() * .1, r: (P.rnd() - .5) * 5, vx: (P.rnd() - .5) * b * 4 });
        return { b, bl };
      },
      draw(ctx, P, Q, u) {
        ctx.imageSmoothingEnabled = false;
        for (const k of Q.bl) {
          const v = clamp((u - k.ts) / .38, 0, 1); if (v >= 1) continue;
          if (v <= 0) { ctx.drawImage(P.img, k.x, k.y, k.w, k.h, k.x, k.y, k.w + .6, k.h + .6); continue; }
          const e = v * v; ctx.save(); ctx.globalAlpha = 1 - e * e;
          ctx.translate(k.x + k.w / 2 + k.vx * v, k.y + k.h / 2 + e * P.H * .8 - Math.sin(v * Math.PI) * Q.b * 1.5); ctx.rotate(k.r * v); const s = 1 - v * .45; ctx.scale(s, s);
          ctx.drawImage(P.img, k.x, k.y, k.w, k.h, -k.w / 2, -k.h / 2, k.w, k.h); ctx.restore();
        }
        ctx.imageSmoothingEnabled = true;
      },
    },
    // tinta y agua: se escurre en chorreones con orilla húmeda
    tinta: {
      prep(P) { const n = 120, cols = []; for (let i = 0; i < n; i++) cols.push({ n: fbm1(i * .085, 7 + (P.rnd() * 9 | 0), 3), gota: P.rnd() < .2 ? .2 + P.rnd() * .4 : 0, v: .8 + P.rnd() * .45 }); return { n, cols }; },
      draw(ctx, P, Q, u) {
        const cw = P.W / Q.n;
        for (let i = 0; i < Q.n; i++) {
          const c = Q.cols[i], x = i * cw, dx = Math.abs(x - P.O[0]) / P.W;
          const borde = (u * 1.8 * c.v - .28 - c.n * .45 - dx * .3 + c.gota * u) * P.H; if (borde >= P.H) continue;
          const y0 = Math.max(0, borde), baja = u * u * P.H * .2 * c.v;
          ctx.drawImage(P.img, x, y0, cw, P.H - y0, x, y0 + baja, cw + .8, P.H - y0);
          if (borde > -20) {
            ctx.fillStyle = 'rgba(24,18,34,.5)'; ctx.fillRect(x, y0 + baja, cw + .8, Math.max(2, P.H * .004));
            ctx.fillStyle = 'rgba(24,18,34,.18)'; ctx.fillRect(x, y0 + baja, cw + .8, P.H * .02);
            if (c.gota) { ctx.fillStyle = 'rgba(24,18,34,.4)'; ctx.beginPath(); ctx.ellipse(x + cw / 2, y0 + baja - P.H * .01, cw * .7, cw, 0, 0, TAU); ctx.fill(); }
          }
        }
      },
    },
    // papel: se rasga de arriba abajo; las mitades se abren girando como hojas
    papel: {
      prep(P) {
        const pts = []; let y = -30; while (y < P.H + 30) { pts.push([P.O[0] + (P.rnd() - .5) * P.H * .05 + Math.sin(y * .012) * P.H * .03, y]); y += P.H * (.02 + P.rnd() * .03); }
        const mitad = lado => {
          const c = mkCanvas(P.W, P.H), x = c.getContext('2d');
          x.beginPath(); const bx = lado < 0 ? -10 : P.W + 10; x.moveTo(bx, -30); for (const q of pts) x.lineTo(q[0], q[1]); x.lineTo(bx, P.H + 30); x.closePath();
          x.save(); x.clip(); x.drawImage(P.img, 0, 0);
          // orilla rasgada: el blanco del papel y sus fibras
          x.beginPath(); pts.forEach((q, i) => i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); x.lineWidth = P.H * .022; x.strokeStyle = '#f4efe2'; x.stroke(); x.lineWidth = P.H * .008; x.strokeStyle = '#ffffff'; x.stroke();
          x.strokeStyle = 'rgba(244,239,226,.9)'; x.lineWidth = 1;
          for (let i = 0; i < 160; i++) { const q = pts[(P.rnd() * pts.length) | 0], a = (P.rnd() - .5) * 2, l = P.H * (.005 + P.rnd() * .015); x.beginPath(); x.moveTo(q[0], q[1] + (P.rnd() - .5) * P.H * .03); x.lineTo(q[0] - lado * l * Math.cos(a) * -1, q[1] + l * Math.sin(a)); x.stroke(); }
          x.restore(); return c;
        };
        return { L: mitad(-1), R: mitad(1) };
      },
      draw(ctx, P, Q, u) {
        const e = EASE.io3(u);
        for (const [c, lado] of [[Q.L, -1], [Q.R, 1]]) {
          ctx.save(); const piv = lado < 0 ? 0 : P.W;
          ctx.translate(lado * e * P.W * .48, e * P.H * .06); ctx.translate(piv, P.H); ctx.rotate(lado * e * .32); ctx.translate(-piv, -P.H);
          ctx.globalAlpha = 1 - tramo(u, .85, 1); ctx.drawImage(c, 0, 0); ctx.restore();
        }
      },
    },
    // luz: se apaga como pantalla vieja (glitch, línea, punto)
    luz: {
      prep() { return {}; },
      draw(ctx, P, Q, u) {
        const W = P.W, H = P.H, cy = H / 2;
        if (u < .3) {
          const k = u / .3, n = 18, sh = H / n;
          for (let i = 0; i < n; i++) { const off = hash1(i, 9) > .55 ? (hash1(i, Math.floor(u * 50)) - .5) * W * .1 * k : 0; ctx.drawImage(P.img, 0, i * sh, W, sh + 1, off, i * sh, W, sh + 1); }
          ctx.fillStyle = `rgba(0,0,0,${.2 * k})`; for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1.6);
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(110,255,240,${.07 * k})`; ctx.fillRect(0, 0, W, H); ctx.restore();
          return;
        }
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        if (u < .66) {
          const k = EASE.in3((u - .3) / .36), h = H * Math.max(.004, 1 - k);
          ctx.restore(); ctx.drawImage(P.img, 0, 0, W, H, 0, cy - h / 2, W, h); ctx.save(); ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = `rgba(255,255,255,${k * .85})`; ctx.fillRect(0, cy - h / 2, W, h);
        } else if (u < .86) {
          const k = EASE.in2((u - .66) / .2), w = W * (1 - k) + 6;
          ctx.fillStyle = 'rgba(150,240,255,.35)'; ctx.fillRect(W / 2 - w / 2, cy - H * .012, w, H * .024);
          ctx.fillStyle = '#ffffff'; ctx.fillRect(W / 2 - w / 2, cy - 2, w, 4);
        } else {
          const k = (u - .86) / .14, r = H * .025 * (1 - k) + 1; const g = ctx.createRadialGradient(W / 2, cy, 0, W / 2, cy, r * 3); g.addColorStop(0, `rgba(255,255,255,${1 - k})`); g.addColorStop(1, 'rgba(150,240,255,0)'); ctx.fillStyle = g; ctx.fillRect(W / 2 - r * 3, cy - r * 3, r * 6, r * 6);
        }
        ctx.restore();
      },
    },
    // vidrio: se estrella en esquirlas con brillo en el filo
    vidrio: {
      prep(P) {
        const nx = 9, ny = 6, V = [], D = Math.hypot(P.W, P.H);
        for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) { const bx = i === 0 || i === nx, by = j === 0 || j === ny; V.push([i / nx * P.W + (bx ? 0 : (P.rnd() - .5) * P.W / nx * .7), j / ny * P.H + (by ? 0 : (P.rnd() - .5) * P.H / ny * .7)]); }
        const tri = [];
        for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const a = V[j * (nx + 1) + i], b = V[j * (nx + 1) + i + 1], c = V[(j + 1) * (nx + 1) + i], d = V[(j + 1) * (nx + 1) + i + 1]; if (P.rnd() < .5) tri.push([a, b, d], [a, d, c]); else tri.push([a, b, c], [b, d, c]); }
        const piezas = tri.map(t => {
          const xs = t.map(q => q[0]), ys = t.map(q => q[1]), x0 = Math.floor(Math.min(...xs)) - 2, y0 = Math.floor(Math.min(...ys)) - 2, x1 = Math.ceil(Math.max(...xs)) + 2, y1 = Math.ceil(Math.max(...ys)) + 2;
          const c = mkCanvas(x1 - x0, y1 - y0), x = c.getContext('2d'); x.translate(-x0, -y0); traza(x, t); x.save(); x.clip(); x.drawImage(P.img, 0, 0); x.restore();
          const cx = (t[0][0] + t[1][0] + t[2][0]) / 3, cy = (t[0][1] + t[1][1] + t[2][1]) / 3, an = Math.atan2(cy - P.O[1], cx - P.O[0]);
          return { c, t, x0, y0, cx, cy, ts: Math.hypot(cx - P.O[0], cy - P.O[1]) / D * .55 + P.rnd() * .1, r: (P.rnd() - .5) * 5, vx: Math.cos(an) * (60 + P.rnd() * 160), vy: Math.sin(an) * 80 - 60 };
        });
        const grietas = []; for (let i = 0; i < 11; i++) { const a = i / 11 * TAU + P.rnd() * .4, pts = [[P.O[0], P.O[1]]]; let r = 0; while (r < D * .5) { r += D * (.03 + P.rnd() * .04); pts.push([P.O[0] + Math.cos(a + (P.rnd() - .5) * .3) * r, P.O[1] + Math.sin(a + (P.rnd() - .5) * .3) * r]); } grietas.push(pts); }
        return { piezas, grietas, D };
      },
      draw(ctx, P, Q, u) {
        const k = P.H / 600;
        for (const s of Q.piezas) {
          const v = clamp((u - s.ts) / .55, 0, 1); if (v >= 1) continue;
          if (v <= 0) { ctx.drawImage(s.c, s.x0, s.y0); continue; }
          ctx.save(); ctx.globalAlpha = 1 - v * v * v; ctx.translate(s.cx + s.vx * v * k, s.cy + (s.vy * v + v * v * 900) * k); ctx.rotate(s.r * v); ctx.drawImage(s.c, s.x0 - s.cx, s.y0 - s.cy);
          traza(ctx, s.t.map(q => [q[0] - s.cx, q[1] - s.cy])); ctx.lineWidth = Math.max(1.5, P.H * .003); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.stroke(); ctx.restore(); // el filo brilla al volar
        }
        if (u < .3) { // grietas que anuncian el golpe
          const a = tramo(u, 0, .12) * (1 - tramo(u, .2, .3)); ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${.85 * a})`; ctx.lineWidth = Math.max(1.5, P.H * .003);
          for (const g of Q.grietas) { const n = Math.max(2, Math.ceil(g.length * tramo(u, 0, .15))); ctx.beginPath(); for (let i = 0; i < n && i < g.length; i++) i ? ctx.lineTo(g[i][0], g[i][1]) : ctx.moveTo(g[i][0], g[i][1]); ctx.stroke(); }
          ctx.restore();
        }
      },
    },
    // pintura: se raspa con espátula; cada pasada quita la pintura vieja y deja un borde de pintura empujada
    pintura: {
      prep(P) {
        const N = 20, tr = [], dir = P.rnd() < .5 ? 1 : -1;
        for (let i = 0; i < N; i++) { const y = (i + .5) / N * P.H; tr.push({ y, w: P.H / N * 1.9, ts: Math.abs(y - P.O[1]) / P.H * .55 + P.rnd() * .08, curv: (P.rnd() - .5) * P.H * .07, dir: i % 3 === 0 ? -dir : dir, sem: i * 13 }); }
        return { tr, cop: mkCanvas(P.W, P.H) };
      },
      draw(ctx, P, Q, u) {
        const x = Q.cop.getContext('2d');
        x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, P.W, P.H); x.drawImage(P.img, 0, 0);
        const pasadas = [];
        for (const s of Q.tr) { const v = clamp((u - s.ts) / .32, 0, 1); if (v <= 0) continue; const e = EASE.out2(v), xa = s.dir > 0 ? -40 : P.W + 40, xb = lerp(xa, s.dir > 0 ? P.W + 40 : -40, e); pasadas.push([s, xa, xb]); }
        x.globalCompositeOperation = 'destination-out';
        for (const [s, xa, xb] of pasadas) { banda(x, xa, s.y, xb, s.w, s.curv, s.sem); x.fill(); }
        // la pintura que empuja la espátula: un borde grueso más oscuro
        x.globalCompositeOperation = 'source-atop'; x.lineWidth = Math.max(2, P.H * .006); x.strokeStyle = 'rgba(40,24,20,.4)';
        for (const [s, xa, xb] of pasadas) { banda(x, xa, s.y, xb, s.w * 1.08, s.curv, s.sem); x.stroke(); }
        x.globalCompositeOperation = 'source-over';
        ctx.drawImage(Q.cop, 0, 0);
      },
    },
    // engranes: se abre como diafragma de latón, con engranes y vapor
    engranes: {
      prep(P) { return { D: Math.hypot(P.W, P.H) }; },
      draw(ctx, P, Q, u, T) {
        const e = EASE.in2(clamp((u - .05) / .85, 0, 1)), R = e * Q.D * .78, n = 8, rot = u * 2.2, O = P.O, poly = [];
        for (let i = 0; i < n; i++) { const a = rot + i / n * TAU; poly.push([O[0] + Math.cos(a) * R, O[1] + Math.sin(a) * R]); }
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, P.W, P.H); poly.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.clip('evenodd');
        ctx.drawImage(P.img, 0, 0);
        if (R > 2) {
          ctx.lineCap = 'round';
          for (let i = 0; i < n; i++) { const q = poly[i], a = rot + i / n * TAU + Math.PI / 2 + .55; ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] + Math.cos(a) * Q.D, q[1] + Math.sin(a) * Q.D); ctx.strokeStyle = '#3a2614'; ctx.lineWidth = Math.max(2, P.H * .006); ctx.stroke(); ctx.strokeStyle = 'rgba(240,190,100,.7)'; ctx.lineWidth = 1; ctx.stroke(); }
          traza(ctx, poly); ctx.lineWidth = P.H * .014; ctx.strokeStyle = '#b8862e'; ctx.stroke(); ctx.lineWidth = Math.max(1.5, P.H * .003); ctx.strokeStyle = '#ffe2a0'; ctx.stroke();
        }
        ctx.restore();
        const ap = tramo(u, .02, .12) * (1 - tramo(u, .78, 1));
        for (const [k, an, sz] of [[0, .6, .12], [1, 2.8, .085], [2, 4.4, .065]]) { const r = P.H * sz, d = R + r * .55, gx = O[0] + Math.cos(an + rot * .3) * d, gy = O[1] + Math.sin(an + rot * .3) * d; engrane(ctx, gx, gy, r, (k % 2 ? -1 : 1) * T * 2.5, ap); }
        if (u > .08 && u < .75) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const an = i / 14 * TAU + hash1(i, 3), f = clamp((u - .08 - hash1(i, 4) * .2) / .4, 0, 1); if (f <= 0 || f >= 1) continue; const d = R + f * P.H * .18, r = P.H * (.02 + f * .06); ctx.globalAlpha = (1 - f) * .35; ctx.fillStyle = '#f4f0ea'; ctx.beginPath(); ctx.arc(O[0] + Math.cos(an) * d, O[1] + Math.sin(an) * d, r, 0, TAU); ctx.fill(); } ctx.restore(); }
      },
    },
    // plastilina: la lámina se pela y se enrolla desde una esquina
    plastilina: {
      prep(P) {
        const esq = P.rnd() < .5 ? [P.W, 0] : [0, 0], op = [P.W - esq[0], P.H], dx = op[0] - esq[0], dy = op[1] - esq[1], L = Math.hypot(dx, dy);
        return { esq, d: [dx / L, dy / L], total: L * 1.12 };
      },
      draw(ctx, P, Q, u) {
        const s = (EASE.io2(u) * .92 + u * .08) * Q.total, [dx, dy] = Q.d, [ex, ey] = Q.esq, proj = q => (q[0] - ex) * dx + (q[1] - ey) * dy;
        const R = [[0, 0], [P.W, 0], [P.W, P.H], [0, P.H]], queda = cortaPoligono(R, q => proj(q) - s), alza = cortaPoligono(R, q => s - proj(q));
        if (queda.length > 2) { ctx.save(); traza(ctx, queda); ctx.clip(); ctx.drawImage(P.img, 0, 0); ctx.restore(); }
        if (alza.length > 2 && s > 1) {
          const solapa = alza.map(q => { const k = 2 * (s - proj(q)) * .62; return [q[0] + dx * k, q[1] + dy * k]; }); // se enrolla: no se refleja completa
          ctx.save(); ctx.translate(dx * P.H * .015, dy * P.H * .015); traza(ctx, solapa); ctx.fillStyle = 'rgba(30,15,10,.3)'; ctx.fill(); ctx.restore();
          traza(ctx, solapa); const fx = ex + dx * s, fy = ey + dy * s, g = ctx.createLinearGradient(fx, fy, fx + dx * s * .9, fy + dy * s * .9);
          g.addColorStop(0, '#f0b49a'); g.addColorStop(.25, '#d98a72'); g.addColorStop(1, '#a85e4c'); ctx.fillStyle = g; ctx.fill();
          ctx.lineWidth = Math.max(2, P.H * .004); ctx.strokeStyle = 'rgba(90,40,30,.5)'; ctx.stroke();
          // huellitas de dedos en la plastilina
          ctx.save(); traza(ctx, solapa); ctx.clip(); ctx.strokeStyle = 'rgba(120,60,45,.35)'; ctx.lineWidth = Math.max(1, P.H * .002);
          const cx = solapa.reduce((a, q) => a + q[0], 0) / solapa.length, cy = solapa.reduce((a, q) => a + q[1], 0) / solapa.length;
          for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.ellipse(cx, cy, P.H * .012 * i, P.H * .009 * i, .5, 0, Math.PI * 1.6); ctx.stroke(); }
          ctx.restore();
          // el doblez: un cilindro con brillo
          const n0 = [-dy, dx], len = Q.total; ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = P.H * .03; ctx.strokeStyle = 'rgba(255,215,190,.55)'; ctx.beginPath(); ctx.moveTo(fx - n0[0] * len, fy - n0[1] * len); ctx.lineTo(fx + n0[0] * len, fy + n0[1] * len); ctx.save(); traza(ctx, R); ctx.clip(); ctx.stroke(); ctx.restore(); ctx.restore();
        }
      },
    },
    // diorama: se desarma en capas horizontales que se deslizan a los lados
    diorama: {
      prep(P) { return { n: 7, dir: P.rnd() < .5 ? 1 : -1 }; },
      draw(ctx, P, Q, u) {
        const n = Q.n, h = P.H / n, iO = clamp(Math.floor(P.O[1] / h), 0, n - 1);
        for (let i = 0; i < n; i++) {
          const v = EASE.in3(clamp((u - Math.abs(i - iO) * .06) / .6, 0, 1)); if (v >= 1) continue;
          const dir = (i % 2 ? 1 : -1) * Q.dir, x = dir * v * P.W * 1.05, s = 1 - v * .1;
          ctx.save(); ctx.translate(P.W / 2 + x, i * h + h / 2); ctx.scale(s, s);
          if (v > 0) { ctx.fillStyle = `rgba(0,0,0,${.35 * Math.min(1, v * 4)})`; ctx.fillRect(-P.W / 2 + 8, -h / 2 + 10, P.W, h); }
          ctx.drawImage(P.img, 0, i * h, P.W, Math.min(h + 1, P.H - i * h), -P.W / 2, -h / 2, P.W, Math.min(h + 1, P.H - i * h));
          if (v > 0) { ctx.fillStyle = `rgba(255,255,255,${.25 * Math.min(1, v * 5)})`; ctx.fillRect(-P.W / 2, -h / 2, P.W, 2); } ctx.restore();
        }
      },
    },
    // ceniza: se deshace desde la grieta, con brasas que vuelan
    ceniza: {
      prep(P) {
        const gw = 96, gh = Math.max(24, Math.round(gw * P.H / P.W)), nf = new Float32Array(gw * gh), D = Math.hypot(P.W, P.H);
        for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) { const x = (i + .5) / gw * P.W, y = (j + .5) / gh * P.H; nf[j * gw + i] = Math.hypot(x - P.O[0], y - P.O[1]) / D * 1.4 + (fbm2(i * .12, j * .12, 9, 3) - .5) * .55; }
        let mn = Infinity, mx = -Infinity; for (const v of nf) { mn = Math.min(mn, v); mx = Math.max(mx, v); } for (let k = 0; k < nf.length; k++) nf[k] = (nf[k] - mn) / (mx - mn);
        const mc = mkCanvas(gw, gh), ec = mkCanvas(gw, gh);
        return { gw, gh, nf, mc, ec, mi: mc.getContext('2d').createImageData(gw, gh), ei: ec.getContext('2d').createImageData(gw, gh), tmp: mkCanvas(P.W, P.H) };
      },
      draw(ctx, P, Q, u, T) {
        const thr = u * 1.15 - .06, md = Q.mi.data, ed = Q.ei.data;
        for (let k = 0; k < Q.nf.length; k++) {
          const v = Q.nf[k] - thr, a = clamp(v * 10, 0, 1), e = clamp(1 - Math.abs(v - .015) * 22, 0, 1), i = k * 4;
          md[i] = md[i + 1] = md[i + 2] = 255; md[i + 3] = a * 255; ed[i] = 255; ed[i + 1] = 70 + e * 90; ed[i + 2] = 20 + e * 20; ed[i + 3] = e * e * 170; // brasa naranja, no blanca
        }
        Q.mc.getContext('2d').putImageData(Q.mi, 0, 0); Q.ec.getContext('2d').putImageData(Q.ei, 0, 0);
        const x = Q.tmp.getContext('2d'); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, P.W, P.H); x.drawImage(P.img, 0, 0);
        x.globalCompositeOperation = 'destination-in'; x.imageSmoothingEnabled = true; x.drawImage(Q.mc, 0, 0, P.W, P.H); x.globalCompositeOperation = 'source-over';
        ctx.drawImage(Q.tmp, 0, 0);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.imageSmoothingEnabled = true; ctx.drawImage(Q.ec, 0, 0, P.W, P.H);
        for (let i = 0; i < 90; i++) { // brasas y ceniza que suben desde el frente que se quema
          const c = Math.floor(hash1(i, 3) * Q.nf.length), v = Q.nf[c] - thr; if (v > .02 || v < -.2) continue;
          const age = -v / .2, x0 = ((c % Q.gw) + .5) / Q.gw * P.W, y0 = (Math.floor(c / Q.gw) + .5) / Q.gh * P.H;
          ctx.globalAlpha = 1 - age; ctx.fillStyle = i % 3 ? '#ffb050' : '#c8c0b8'; ctx.beginPath(); ctx.arc(x0 + Math.sin(T * 3 + i) * P.H * .01, y0 - age * P.H * .12, P.H * .0035 * (1 - age * .5), 0, TAU); ctx.fill();
        }
        ctx.restore();
      },
    },
    // bordado (la manta del logo): se descosen las puntadas y la tela se abre como cortina
    bordado: {
      prep(P) {
        const mitad = lado => { const c = mkCanvas(Math.ceil(P.W / 2) + 2, P.H), x = c.getContext('2d'); x.drawImage(P.img, lado < 0 ? 0 : -Math.floor(P.W / 2) + 2, 0); return c; };
        return { n: 16, L: mitad(-1), R: mitad(1) };
      },
      draw(ctx, P, Q, u, T) {
        const cx = P.W / 2, s = P.H / 30, abre = EASE.io3(clamp((u - .3) / .7, 0, 1));
        for (const lado of [-1, 1]) {
          const C = lado < 0 ? Q.L : Q.R, sx = 1 - abre * .22; ctx.save();
          if (lado < 0) { ctx.translate(-abre * P.W * .56, 0); ctx.scale(sx, 1); ctx.drawImage(C, 0, 0); }
          else { ctx.translate(P.W + abre * P.W * .56, 0); ctx.scale(sx, 1); ctx.drawImage(C, -C.width, 0); }
          if (abre > 0) { // pliegues de la tela al correrse
            ctx.beginPath(); ctx.rect(lado < 0 ? 0 : -C.width, 0, C.width, P.H); ctx.clip();
            for (let i = 0; i < 7; i++) { const x0 = (lado < 0 ? 0 : -C.width) + (i + .5) / 7 * C.width, g = ctx.createLinearGradient(x0 - C.width / 14, 0, x0 + C.width / 14, 0); g.addColorStop(0, 'rgba(60,30,20,0)'); g.addColorStop(.5, `rgba(60,30,20,${.22 * abre})`); g.addColorStop(1, 'rgba(60,30,20,0)'); ctx.fillStyle = g; ctx.fillRect(x0 - C.width / 14, 0, C.width / 7, P.H); }
          }
          ctx.restore();
        }
        // la rendija de luz y las puntadas que saltan de arriba abajo
        if (u < .5) { const a = tramo(u, 0, .15) * (1 - tramo(u, .4, .5)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,240,200,${.4 * a})`; ctx.fillRect(cx - s * .09, 0, s * .18, P.H * tramo(u, 0, .32)); ctx.restore(); }
        for (let i = 0; i < Q.n; i++) {
          const y = (i + .5) / Q.n * P.H, v = clamp((u - i / Q.n * .32) / .2, 0, 1), col = HILOS[i % HILOS.length]; if (v >= 1) continue;
          if (v <= 0) { puntada(ctx, cx - s / 2, y - s / 2, s, col); continue; }
          const e = EASE.out2(v); ctx.save(); ctx.globalAlpha = 1 - v; ctx.lineCap = 'round'; ctx.lineWidth = s * .3; ctx.strokeStyle = col;
          ctx.beginPath(); ctx.moveTo(cx - e * s * 2.5 - s * .3, y - s * .3 - e * s * 2); ctx.lineTo(cx - e * s * 2.5 + s * .3, y + s * .3 - e * s * 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx + e * s * 2.5 + s * .3, y - s * .3 + e * s); ctx.quadraticCurveTo(cx + e * s * 3, y + e * s * 2, cx + e * s * 2.2, y + s + e * s * 2.4); ctx.stroke();
          ctx.restore();
        }
      },
    },
  };

  // =====================================================================
  //  LA ESCENA
  // =====================================================================
  const INI_SALIDA = .6; // la llegada entra a la escena justo antes de que se abra la grieta chiquita
  function crearViaje(opc = {}) {
    const cues = opc.salida ? [[.35, 'efecto', 'se abre la grieta'], [.9, 'acento', 'aterriza']] : [[.36, 'golpe', 'se zambulle en la grieta'], [.8, 'silencio', 'el respiro'], [.95, 'swell', 'el mundo se rompe'], [2.25, 'efecto', 'puntadas del parche'], [2.45, 'acento', 'aterriza']];
    if (opc.soloDatos) return { dur: 3.8, cues, subs: [] };
    let M = CINE.M; const titulo = opc.repeticion ? true : !!opc.titulo, seed = (Math.random() * 1e6) | 0, rnd = rng(seed);
    const desdeEntrada = opc.desde === 'entrada';
    const gv = desdeEntrada || opc.salida ? null : (titulo ? view.g : CUR);
    const zambulle = !!(gv && !gv.modo && gv.p);
    let familia = desdeEntrada ? 'bordado' : familiaDe(view.st ? view.st.id : '');
    if (window.__viajeFamilia) familia = window.__viajeFamilia; // pruebas-cine.js fuerza una familia para revisarla
    if (familia === ultimaFamilia) vueltas++; ultimaFamilia = familia;
    const S = { t0C: null, construido: false, construyendo: false, plate: null, P: null, Q: null, a0: null, num: 1, nombre: '', anc: null, aterrizo: false, salioFre: false, bannerArgs: null, curAntes: CUR, z: 1, ancla: [M.w / 2, M.h / 2], O: [M.w / 2, M.h * .45] };
    const bannerOrig = banner;
    if (opc.yaConstruido && CUR) {
      S.construido = true; S.construyendo = true;
      S.num = RUN.world; S.nombre = (CUR.def || NIVELES[curStyle().id] || curStyle()).nombre || curStyle().name;
      if (CUR.p && !CUR.modo) { CUR.p.vis = false; if (CUR.fre) CUR.fre.x = -9999; }
    }
    window.__viaje = S; // para revisar en pruebas-cine.js
    canvas.style.transform = '';

    // ---- construir el nivel nuevo (el de siempre, sin «Bordando el mundo…») ----
    function construir() {
      if (S.construyendo) return; S.construyendo = true;
      banner = (...a) => { S.bannerArgs = a; }; // el letrero sale después del viaje
      if (opc.repeticion) {
        // demostración desde el menú: una partida de mentiras con un mundo distinto
        const viejoId = view.st ? view.st.id : '', vistos = Object.keys(PROG.s.mundos || {}).filter(id => MUNDOS.includes(id));
        const pool = MUNDOS.filter(id => id !== viejoId && familiaDe(id) !== familia && NIVELES[id]), pref = pool.filter(id => vistos.includes(id)), lista = pref.length ? pref : pool;
        newRun(seed); const dest = STYLE_MAP[lista[(rnd() * lista.length) | 0]]; RUN.styles[0] = dest; RUN.world = 1;
        _startLevel();
      } else (opc.construir || _startLevel)();
      $('loading').classList.remove('on');
    }
    function revisaConstruccion() {
      if (S.construido || !S.construyendo) return;
      if (STATE === 'play' && CUR && CUR !== S.curAntes) {
        S.construido = true; STATE = 'cine'; $('hud').classList.remove('on'); banner = bannerOrig;
        S.num = RUN.world; S.nombre = (CUR.def || NIVELES[curStyle().id] || curStyle()).nombre || curStyle().name;
        if (CUR.p && !CUR.modo) { CUR.p.vis = false; if (CUR.fre) CUR.fre.x = -9999; }
      }
    }
    // ---- la imagen del mundo viejo y la preparación de su forma de romperse ----
    function capturaPlaca() {
      const c = mkCanvas(M.w, M.h), x = c.getContext('2d');
      if (opc.salida) { x.fillStyle = '#140c08'; x.fillRect(0, 0, M.w, M.h); S.plate = c; return; } // adentro de la grieta todavía no hay mundo
      if (desdeEntrada && CINE.ultima) x.drawImage(CINE.ultima, 0, 0, M.w, M.h); else componer(x, M, S.z, S.ancla);
      S.plate = c;
      S.P = { img: c, W: M.w, H: M.h, O: S.O, rnd: rng(seed + vueltas * 31) };
      if (vueltas % 2) S.P.O = [M.w - S.O[0], S.O[1]]; // si se repite la familia, la ruptura nace del otro lado
      S.Q = EFECTOS[familia].prep(S.P);
    }

    // ---- A. la grieta en el mundo viejo y la zambullida ----
    function animaViejo(t, dt) {
      const g = gv, p = g.p;
      g.t = (g.t || 0) + dt; pasoParticulas(g, dt);
      if (!S.a0) {
        const [px] = aPantalla(g, titulo, p.x, p.y, M), face = px > M.w * .6 ? -1 : 1;
        S.a0 = { x0: p.x, y0: p.y, face, sx: p.x + face * 34, sy: p.y - 13 }; p.inv = 0; p.vis = true;
        S.ancla = aPantalla(g, titulo, p.x + face * 17, p.y - 12, M);
      }
      const A = S.a0; p.face = A.face; p.inv = 0;
      if (t < .18) { p.vx = 0; p.on = true; p.y = A.y0; }
      else if (t < .42) { const u = tramo(t, .18, .42, 'in2'); p.x = lerp(A.x0, A.sx - A.face * 11, u); p.vx = A.face * 130; p.on = true; p.y = A.y0; p.run += 130 * dt * .16; }
      else if (t < .62) { const u = (t - .42) / .2, [x, y] = arco(u, A.sx - A.face * 11, A.y0, A.sx, A.sy + 4, 8); p.x = x; p.y = y; p.on = false; p.vx = A.face * 160; p.vy = u < .5 ? -260 : 140; p.sq = -.12; }
      else p.vis = false;
      // Fresita va detrás y entra a la grieta
      if (titulo) { if (t > .5) { g.cx = lerp(g.cx ?? A.sx, A.sx, .3); g.cy = lerp(g.cy ?? A.sy, A.sy, .3); } if (t > .7) g.fre = { x: -9999, y: -9999, face: 1 }; }
      else if (g.fre) { const tx = t < .5 ? p.x - A.face * 18 : A.sx, ty = t < .5 ? p.y - 30 : A.sy; g.fre.x = lerp(g.fre.x, tx, Math.min(1, dt * 10)); g.fre.y = lerp(g.fre.y, ty, Math.min(1, dt * 10)); g.fre.face = A.face; if (t > .7) g.fre.x = -9999; }
    }

    // donde arranca la cámara en un nivel al revés (la misma cuenta que makeGame, con Itzel en la derecha)
    function camInicioEspejo() { const rec = VISTA.rec || 0; return clamp(L.start.x - (VW - 2 * rec) * .62 - rec, L.camMin - rec, L.camMax + rec); }

    // ---- D. Itzel cae de una grieta chiquita en el mundo nuevo ----
    function animaNuevo(tc, dt) {
      const g = CUR; g.t = (g.t || 0) + dt; pasoParticulas(g, dt);
      if (g.modo || !g.p) return;
      // al empezar, Itzel queda pegada a la orilla: la cámara la recibe un poco más a la izquierda (el nivel
      // repite su primera columna hacia allá) y se desliza hasta donde arranca el juego
      // en un nivel de derecha a izquierda la llegada es por la derecha: la cámara ya está sobre Itzel (sin enseñar la izquierda)
      const desliza = 64 * (1 - EASE.io3(tramo(tc, 1.75, 2.75)));
      g.cam = L.espejo ? camInicioEspejo() + desliza : L.camMin - desliza;
      const p = g.p, st = L.start; p.x = st.x; p.face = 1; p.inv = 0; p.vx = 0;
      if (tc < 1.15) p.vis = false;
      else if (tc < 1.45) { const u = (tc - 1.15) / .3; p.vis = true; p.y = st.y - 40 * (1 - u * u); p.on = false; p.vy = 120 + u * 300; }
      else {
        p.vis = true; p.y = st.y; p.on = true; p.vy = 0;
        if (!S.aterrizo) { S.aterrizo = true; p.sq = .32; spawn(g, 10, p.x, p.y, { ang: -Math.PI / 2, spread: 3, v: 55, life: .45, s: 2.4, k: 'dust', cols: (view.st.fx && view.st.fx.dust) || ['#ffffff'], g: -10 }); }
        p.sq *= Math.pow(.0008, dt);
      }
      const fr = g.fre; if (fr) {
        if (tc < 1.3) fr.x = -9999;
        else { const u = EASE.outBack(tramo(tc, 1.3, 1.65, 'lin')); fr.x = lerp(st.x, st.x - 18, u); fr.y = lerp(st.y - 46, st.y - 30, u) + Math.sin(g.t * 2) * 1.5 * u; fr.face = 1;
          if (!S.salioFre) { S.salioFre = true; spawn(g, 14, st.x, st.y - 46, { v: 70, life: .6, s: 1.8, k: 'spark', cols: ['#ffffff', '#ffd1ea', '#fff3a0'], g: -20 }); } }
      }
    }

    // ---- el parche bordado: «MUNDO 2 DE 4» y el nombre del estilo ----
    function parche(ctx, tc) {
      const a = tramo(tc, 1.2, 1.4) * (1 - tramo(tc, 2.15, 2.45)); if (a <= 0) return;
      const k = M.k, t1 = opc.elegido ? 'MUNDO ELEGIDO' : `MUNDO ${S.num} DE ${WORLDS}`, t2 = S.nombre;
      ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.font = `700 ${18 * k}px Alegreya, Georgia, serif`; const w2 = ctx.measureText(t2).width;
      ctx.font = `800 ${7.6 * k}px "Alegreya Sans", sans-serif`; if ('letterSpacing' in ctx) ctx.letterSpacing = `${2 * k}px`; const w1 = ctx.measureText(t1).width;
      const W = Math.max(w1, w2) + 44 * k, H = 50 * k, e = EASE.outBack(tramo(tc, 1.2, 1.5, 'lin')), x = M.w / 2 - W / 2, y = M.extra + 34 * k - (1 - e) * 16 * k - tramo(tc, 2.15, 2.45) * 12 * k;
      ctx.globalAlpha = a; ctx.translate(M.w / 2, y + H / 2); ctx.rotate(-.012); ctx.scale(.9 + e * .1, .9 + e * .1); ctx.translate(-M.w / 2, -(y + H / 2));
      ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 14 * k; ctx.shadowOffsetY = 4 * k;
      ctx.fillStyle = '#efe4cc'; ctx.beginPath(); roundRect(ctx, x, y, W, H, 4 * k); ctx.fill(); ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(120,90,50,.1)'; ctx.lineWidth = 1; ctx.beginPath(); for (let i = x + 3 * k; i < x + W; i += 3 * k) { ctx.moveTo(i, y); ctx.lineTo(i, y + H); } ctx.stroke();
      // la orilla de puntadas corre alrededor
      const ins = 5 * k, per = [[x + ins, y + ins], [x + W - ins, y + ins], [x + W - ins, y + H - ins], [x + ins, y + H - ins]], largo = 2 * (W + H - 4 * ins), hasta = largo * EASE.out2(tramo(tc, 1.25, 1.85, 'lin'));
      ctx.strokeStyle = '#c8203a'; ctx.lineWidth = Math.max(1.2, 1.3 * k); ctx.lineCap = 'round'; let rec = 0;
      for (let i = 0; i < 4 && rec < hasta; i++) { const [ax, ay] = per[i], [bx, by] = per[(i + 1) % 4], l = Math.hypot(bx - ax, by - ay); for (let d = 0; d < l && rec + d < hasta; d += 4.2 * k) { const u0 = d / l, u1 = Math.min(1, (d + 2.4 * k) / l); ctx.beginPath(); ctx.moveTo(lerp(ax, bx, u0), lerp(ay, by, u0)); ctx.lineTo(lerp(ax, bx, u1), lerp(ay, by, u1)); ctx.stroke(); } rec += l; }
      for (const [fx, fy, c] of [[x + ins, y + ins, '#c8203a'], [x + W - ins, y + ins, '#f2b233'], [x + W - ins, y + H - ins, '#2f7fc8'], [x + ins, y + H - ins, '#3f9a5c']]) ACTOR.flor(ctx, fx, fy, 3.4 * k * e, c);
      ctx.fillStyle = '#c8203a'; ctx.fillText(t1, M.w / 2, y + 19 * k);
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      ctx.font = `700 ${18 * k}px Alegreya, Georgia, serif`; ctx.fillStyle = '#3a2418'; ctx.fillText(t2, M.w / 2, y + 40 * k);
      ctx.restore();
    }

    const esc = {
      inmediata: true, cues, subs: [],
      get dur() { return S.t0C == null ? 99 : S.t0C + 2.9; },
      barras(t) { return .5 * Math.min(tramo(t, 0, .35), 1 - (S.t0C == null ? 0 : tramo(t, S.t0C + 2.35, S.t0C + 2.85))); },
      saltar(t) { if (!S.construyendo) { if (!S.plate) capturaPlaca(); construir(); } return S.construido && S.t0C != null ? Math.max(t, S.t0C + 2.3) : null; },
      cuadro(ctx, t, dt) {
        M = CINE.M; ctx.setTransform(1, 0, 0, 1, 0, 0);
        revisaConstruccion();
        if (opc.salida && !S.construido) { // lo oscuro de la grieta, mientras se arma el mundo elegido
          if (!S.plate) capturaPlaca();
          if (!S.construyendo) construir();
          ctx.drawImage(S.plate, 0, 0); if (!opc.portal) grietaAire(ctx, M.w / 2, M.h * .45, M.k, 58, tramo(t, 0, .25), 0, t * 2.5); if (t > 7) S.t0C = t;
          return;
        }
        const tA = zambulle ? .8 : 0;
        if (t < tA && !S.construyendo) {
          // A: el mundo viejo, vivo, con la grieta
          animaViejo(t, dt); pintaMundo(gv, titulo);
          S.z = 1 + .06 * EASE.io2(t / .8); componer(ctx, M, S.z, S.ancla);
          const A = S.a0, [sx, sy, s] = aPantalla(gv, titulo, A.sx, A.sy, M), X = S.ancla[0] + (sx - S.ancla[0]) * S.z, Y = S.ancla[1] + (sy - S.ancla[1]) * S.z;
          S.O = [X, Y];
          grietaAire(ctx, X, Y - 10 * s * S.z, s * S.z, 58, tramo(t, .05, .3), tramo(t, .64, .78), t * 2.5);
          return;
        }
        if (!S.plate) { if (gv && !zambulle) S.O = aPantalla(gv, titulo, gv.p ? gv.p.x : gv.cam + VW / 2, gv.p ? gv.p.y - 14 : VH / 2, M).slice(0, 2); capturaPlaca(); }
        if (!S.construyendo) construir();
        if (!S.construido || t < Math.max(tA, .1)) { ctx.drawImage(S.plate, 0, 0); if (t > 7) { S.t0C = t; } return; } // B: respiro mientras se arma el nuevo
        if (S.t0C == null) { S.t0C = t - (opc.salida ? INI_SALIDA : 0); if (CUR.p && !CUR.modo) { const st = L.start; S.anc = aPantalla(CUR, false, st.x, st.y - 16, M); } else S.anc = [M.w / 2, M.h / 2]; }
        // C y D: el mundo nuevo, vivo, y el viejo rompiéndose encima
        const tc = t - S.t0C;
        animaNuevo(tc, dt); pintaMundo(CUR, false);
        const z = 1 + .08 * (1 - EASE.out3(clamp(tc / 1.5, 0, 1)));
        if (CUR.p && !CUR.modo) S.anc = aPantalla(CUR, false, L.start.x, L.start.y - 16, M);
        componer(ctx, M, z, S.anc);
        if (CUR.p && !CUR.modo && tc > .95 && tc < 1.8) { // la grieta chiquita de donde cae Itzel
          const st = L.start, [sx, sy, s] = aPantalla(CUR, false, st.x, st.y - 46, M), X = S.anc[0] + (sx - S.anc[0]) * z, Y = S.anc[1] + (sy - S.anc[1]) * z;
          grietaAire(ctx, X, Y, s * z, 44, tramo(tc, .95, 1.12), tramo(tc, 1.5, 1.75), tc * 2.5);
        }
        if (opc.salida) { const a = 1 - tramo(tc, INI_SALIDA, INI_SALIDA + .32); if (a > 0) { ctx.globalAlpha = a; ctx.drawImage(S.plate, 0, 0); ctx.globalAlpha = 1; } } // se abre de lo oscuro
        else { const u = clamp(tc / 1.35, 0, 1); if (u < 1) EFECTOS[familia].draw(ctx, S.P, S.Q, u, t); }
        parche(ctx, tc);
      },
      fin() {
        banner = bannerOrig;
        if (opc.repeticion) return;
        // a jugar: el último cuadro del viaje es el primero del juego
        if (CUR && S.construido) {
          if (CUR.p && !CUR.modo) { const p = CUR.p, st = L.start; CUR.cam = L.espejo ? camInicioEspejo() : L.camMin; Object.assign(p, { x: st.x, y: st.y, vx: 0, vy: 0, on: true, vis: true, sq: 0, inv: 0 }); if (CUR.fre) { CUR.fre.x = st.x - 18; CUR.fre.y = st.y - 30; } }
          CUR.acc = 0; STATE = 'play'; $('hud').classList.add('on'); HUDKEY = ''; MOUSE.clicks.length = 0;
          if (S.bannerArgs) banner(...S.bannerArgs);
        } else if (!S.construyendo) construir(); // se cortó antes de armar el nivel: se arma igual
      },
    };
    return esc;
  }

  window.CINE_UTIL = { componer, aPantalla, rectJuego, pintaMundo, pasoParticulas, grietaAire, puntada, escala };

  CINE.registrar('viaje', { orden: 2, nombre: 'Viaje entre mundos', desc: 'Cada mundo se rompe a su manera y deja ver el siguiente.', crear: crearViaje });

  // ---------------------------------------------------------------------
  //  ENGANCHE: cada vez que se arma un mundo nuevo (startLevel), en lugar
  //  de «Bordando el mundo…» sale el viaje.
  // ---------------------------------------------------------------------
  // el de menu.js (skins y progreso), que llama al de juego.js
  GANCHOS.en('startLevel', _armaMundo => function (o = {}) {
    const elegido = ENCI_LLEGA; ENCI_LLEGA = false;
    // Se prepara el destino antes de mostrar su ficha. El viaje comienza
    // únicamente cuando la persona pulsa «¡Vamos!».
    const bannerAnterior = banner;
    banner = (a, b, c, info) => {
      banner = bannerAnterior;
      const llega = () => {
        CINE.play('viaje', { salida: true, portal: true, elegido, yaConstruido: true, alTerminar() {} });
      };
      if (!info || !INTRO_NIVEL.mostrar(info, llega)) llega();
    };
    _armaMundo(o);
  });
})();
