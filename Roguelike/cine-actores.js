'use strict';
// =====================================================================
//  CINEMÁTICAS · actores de cine
//  Itzel, Fresita y los ajolotes azul, naranja y violeta dibujados a
//  vector, nítidos a cualquier tamaño, con cara que actúa (cejas,
//  párpados, boca, mirada) y física secundaria: coletas, moños, huipil,
//  branquias y cola siguen al cuerpo con retraso (follow-through).
//  Coordenadas locales: Itzel mide 100 de los pies (0) a la corona (-100)
//  y mira a la derecha; a.face = -1 la voltea. a.s = unidades de mundo por
//  unidad local. Cada cuadro: poner pose/cara, ACTOR.paso(a, dt) y dibujar.
// =====================================================================
const ACTOR = (() => {
  const IT = { piel: '#b9784f', piel2: '#93593a', piel3: '#c98d62', pelo: '#241718', pelo2: '#4e3434', huipil: '#fbf6ec', huipil2: '#ddd0c2', short: '#3f8f4a', short2: '#2c6a36', zapato: '#d83a3a', zapato2: '#a02430', mono: '#e0303f', mono2: '#a81c2a', mochila: '#e8a33a', mochila2: '#b8761e', linea: '#3a1a18', ojo: '#2a1210', iris: '#5a2a1a', rubor: 'rgba(232,80,96,.42)', boca: '#7a1e26', lengua: '#e8707e', arete: '#f2c040' };
  const FLORES = ['#e8407a', '#f2b233', '#2fa3a0', '#e0303f', '#ff7fb2', '#f07a2a', '#9a5ad0', '#e8407a'];
  const BORD = ['#e0485a', '#f2b233', '#3fa36b', '#3f7fd6', '#e85a9a', '#f07a2a'];
  const AJO = {
    fresita: { body: '#ffc9e0', body2: '#f59cc2', belly: '#ffe9f3', gill: '#ff4f95', gill2: '#d8306e', tip: '#ff8fbd', line: '#a8396a', glow: '#ff8cc6', cheek: 'rgba(255,80,140,.45)', eye: '#2a1020' },
    azul: { body: '#c4e6ff', body2: '#8ec4f2', belly: '#ecf7ff', gill: '#2f7fd6', gill2: '#1d5aa8', tip: '#7fbdff', line: '#24497e', glow: '#ffcf7a', cheek: 'rgba(90,140,255,.38)', eye: '#10203a' },
    naranja: { body: '#ffd4a6', body2: '#f6a868', belly: '#fff1de', gill: '#ff7a2f', gill2: '#d0521a', tip: '#ffb26e', line: '#9a4a1a', glow: '#ff4f8f', cheek: 'rgba(255,110,60,.42)', eye: '#2a140a' },
    violeta: { body: '#ddcbff', body2: '#b496ee', belly: '#f4edff', gill: '#8a4fd6', gill2: '#5e2fa8', tip: '#bd92ff', line: '#4e3088', glow: '#ff9a8a', cheek: 'rgba(170,100,255,.38)', eye: '#1c1030' },
  };

  // ---------- diseños de Itzel ----------
  // Lo canónico no cambia (piel morena, dos coletas con moños rojos, corona de flores, huipil bordado,
  // short verde, zapatos rojos y mochila); cambian proporciones, ojos, cara, fleco, coletas y corona.
  // cabeza: tamaño de la cabeza · piernas: largo · ojos: sprite | grandes | brillo | punto | almendra
  // cara: redonda | ovalada | cachetona · fleco: recto | lado | raya | cortito · coletas: bajas | altas | trenzas
  // corona: llena | chica | grande
  const DISENOS = [
    { id: 1, nombre: 'La de ahora', cabeza: 1, piernas: 1, ojos: 'sprite', cara: 'redonda', fleco: 'recto', coletas: 'bajas', corona: 'llena' },
    { id: 2, nombre: 'Cabezona tierna', cabeza: 1.2, piernas: .85, ojos: 'grandes', cara: 'cachetona', fleco: 'cortito', coletas: 'altas', corona: 'llena' },
    { id: 3, nombre: 'Trenzas de mercado', cabeza: 1, piernas: 1.05, ojos: 'almendra', cara: 'ovalada', fleco: 'raya', coletas: 'trenzas', corona: 'grande' },
    { id: 4, nombre: 'Ojitos de sprite', cabeza: 1.12, piernas: .92, ojos: 'sprite', cara: 'cachetona', fleco: 'recto', coletas: 'altas', corona: 'chica' },
    { id: 5, nombre: 'Anime', cabeza: 1.1, piernas: 1.08, ojos: 'brillo', cara: 'ovalada', fleco: 'lado', coletas: 'bajas', corona: 'llena' },
    { id: 6, nombre: 'Clásica de cuento', cabeza: 1, piernas: 1, ojos: 'punto', cara: 'redonda', fleco: 'cortito', coletas: 'trenzas', corona: 'llena' },
    { id: 7, nombre: 'Aventurera', cabeza: .95, piernas: 1.15, ojos: 'almendra', cara: 'ovalada', fleco: 'lado', coletas: 'altas', corona: 'chica' },
    { id: 8, nombre: 'Muñequita', cabeza: 1.25, piernas: .8, ojos: 'brillo', cara: 'cachetona', fleco: 'recto', coletas: 'trenzas', corona: 'grande' },
    { id: 9, nombre: 'Sonrisa grande', cabeza: 1.05, piernas: 1, ojos: 'grandes', cara: 'redonda', fleco: 'raya', coletas: 'bajas', corona: 'grande' },
    { id: 10, nombre: 'Pixel a vector', cabeza: 1.15, piernas: .9, ojos: 'punto', cara: 'cachetona', fleco: 'recto', coletas: 'altas', corona: 'llena' },
  ];
  let DIS = DISENOS[0];
  const dis = a => a.dis || DIS;

  // ---------- física: cadenas de puntos (coletas, listones) y resortes ----------
  function cadena(n, len) { const p = []; for (let i = 0; i <= n; i++) p.push({ x: 0, y: 0, px: 0, py: 0 }); return { p, n, len, init: false }; }
  function pasoCadena(c, ax, ay, ang, dt, fx, fy, rig) {
    const p = c.p, dx = Math.sin(ang), dy = Math.cos(ang);
    if (!c.init) { for (let i = 0; i <= c.n; i++) { p[i].x = p[i].px = ax + dx * c.len * i; p[i].y = p[i].py = ay + dy * c.len * i; } c.init = true; }
    p[0].x = p[0].px = ax; p[0].y = p[0].py = ay;
    const fr = Math.pow(.04, dt);
    for (let i = 1; i <= c.n; i++) { const q = p[i], vx = (q.x - q.px) * fr, vy = (q.y - q.py) * fr; q.px = q.x; q.py = q.y; q.x += vx + fx * dt * dt; q.y += vy + fy * dt * dt; }
    for (let it = 0; it < 3; it++) for (let i = 1; i <= c.n; i++) {
      const a = p[i - 1], b = p[i];
      const tx = a.x + dx * c.len, ty = a.y + dy * c.len; b.x += (tx - b.x) * rig; b.y += (ty - b.y) * rig;
      const ex = b.x - a.x, ey = b.y - a.y, d = Math.hypot(ex, ey) || 1, kk = (d - c.len) / d; b.x -= ex * kk; b.y -= ey * kk;
    }
  }
  function resorte(r, objetivo, dt, k = 120, amort = 12, fuerza = 0) { const a = -k * (r.v0 - objetivo) - amort * r.v1 + fuerza; r.v1 += a * dt; r.v0 += r.v1 * dt; return r.v0; }
  const res = () => ({ v0: 0, v1: 0 });

  // ---------- estado base ----------
  function base(tipo) {
    return { tipo, x: 0, y: 0, s: 1, face: 1, t: Math.random() * 10, vista: 'lado', vis: true,
      vx: 0, vy: 0, ax: 0, ay: 0, prev: null, viento: [0, 0], parp: 2 + Math.random() * 2, cerrado: 0 };
  }
  function itzel() {
    const a = base('itzel');
    a.pose = { lean: 0, cabeza: 0, bob: 0, sq: 0, agacha: 0, bD: [.15, .5], bT: [-.1, .4], pD: [0, 0], pT: [0, 0], manoD: 0 };
    a.cara = { cejas: 0, preocupa: 0, enojo: 0, ojos: 1, risa: 0, boca: 0, sonrisa: .5, o: 0, mirar: [0, 0], rubor: .6 };
    a.fis = { cA: cadena(6, 4.6), cB: cadena(6, 4.4), cE1: cadena(6, 4.6), cE2: cadena(6, 4.6), lA: cadena(3, 2.4), lA2: cadena(3, 2.2), lB: cadena(3, 2.4), lB2: cadena(3, 2.2), hem: res() };
    return a;
  }
  function ajolote(color = 'fresita') {
    const a = base('ajolote');
    a.color = color; a.pal = AJO[color];
    a.pose = { giro: 0, sq: 0, cola: 1, nado: 1, patas: 1 };
    a.cara = { ojos: 1, risa: 0, boca: 0, sonrisa: .7, o: 0, mirar: [0, 0], branquias: 0, brillo: .3, mitad: 0 };
    a.fis = { g: [res(), res(), res(), res(), res(), res()], cola: res() };
    return a;
  }

  // integra velocidades y aceleraciones (para la inercia de pelo y branquias)
  function paso(a, dt) {
    if (dt <= 0) return;
    a.t += dt;
    if (a.prev) {
      const vx = (a.x - a.prev[0]) / dt, vy = (a.y - a.prev[1]) / dt;
      const ax = (vx - a.vx) / dt, ay = (vy - a.vy) / dt, f = Math.min(1, dt * 18);
      a.ax += (clamp(ax, -6000, 6000) - a.ax) * f; a.ay += (clamp(ay, -6000, 6000) - a.ay) * f; a.vx = vx; a.vy = vy;
    }
    a.prev = [a.x, a.y];
    // parpadeo automático
    a.parp -= dt; if (a.parp < 0) { a.cerrado = .14; a.parp = 2.2 + Math.random() * 2.6; }
    a.cerrado = Math.max(0, a.cerrado - dt);
    const sub = Math.max(1, Math.ceil(dt / (1 / 120))), h = dt / sub;
    for (let i = 0; i < sub; i++) a.tipo === 'itzel' ? fisItzel(a, h) : fisAjo(a, h);
  }
  // pasar al cuadro siguiente sin arrastrar inercias (cortes de plano)
  function corte(a) { a.prev = null; a.vx = a.vy = a.ax = a.ay = 0; }
  const parpadeo = a => a.cerrado > 0 ? Math.max(.08, Math.abs(a.cerrado / .07 - 1)) : 1;

  // =====================================================================
  //  ITZEL
  // =====================================================================
  // esqueleto: devuelve puntos en coordenadas locales
  function huesos(a) {
    const D = dis(a), kp = D.piernas, P = a.pose, hipY = (-21 + P.agacha) * kp + P.bob, cl = Math.cos(P.lean), sl = Math.sin(P.lean);
    const tor = (x, y) => [x * cl - y * sl, hipY + x * sl + y * cl]; // y relativo a la cadera
    const cuello = tor(1.5, -29), cab = tor(2.5, -48 - (D.cabeza - 1) * 15), ang = P.lean + P.cabeza;
    const cabeza = (x, y) => { const c = Math.cos(ang), s = Math.sin(ang); return [cab[0] + (x * c - y * s), cab[1] + (x * s + y * c)]; };
    const pierna = (hx, [h, b]) => { const H = [hx, hipY]; const K = [H[0] + Math.sin(h) * 10 * kp, H[1] + Math.cos(h) * 10 * kp]; const F = [K[0] + Math.sin(h - b) * 10 * kp, K[1] + Math.cos(h - b) * 10 * kp]; return [H, K, F, h - b]; };
    const brazo = (sx, [s0, e], len1 = 8.6, len2 = 8) => { const S = tor(sx, -25.5); const A = s0 + P.lean; const E = [S[0] + Math.sin(A) * len1, S[1] + Math.cos(A) * len1]; const W = [E[0] + Math.sin(A + e) * len2, E[1] + Math.cos(A + e) * len2]; return [S, E, W, A + e]; };
    return { hipY, tor, cuello, cab, ang, cabeza, k: D.cabeza, pD: pierna(1.8, P.pD), pT: pierna(-1.8, P.pT), bD: brazo(2.6, P.bD), bT: brazo(-2.4, P.bT) };
  }
  function fisItzel(a, dt) {
    const H = huesos(a), f = a.face, s = a.s || 1;
    // fuerzas en coordenadas locales: gravedad, inercia del cuerpo y viento
    const fx = (-a.ax / s * .55 + a.viento[0] / s) * f, fy = 260 + (-a.ay / s * .55 + a.viento[1] / s);
    if (a.vista === 'espalda') {
      const k = H.k, alt = dis(a).coletas === 'altas', A1 = H.cabeza((alt ? -11 : -15.5) * k, (alt ? -14 : 1) * k), A2 = H.cabeza((alt ? 11 : 15.5) * k, (alt ? -14 : 1) * k);
      pasoCadena(a.fis.cE1, A1[0], A1[1], -.32 + H.ang, dt, fx, fy, .16);
      pasoCadena(a.fis.cE2, A2[0], A2[1], .32 + H.ang, dt, fx, fy, .16);
      pasoCadena(a.fis.lA, A1[0] - 1.5, A1[1] + 1, -.2, dt, fx * 1.3, fy, .05); pasoCadena(a.fis.lA2, A1[0] + 1, A1[1] + 1, .3, dt, fx * 1.3, fy, .05);
      pasoCadena(a.fis.lB, A2[0] - 1, A2[1] + 1, -.3, dt, fx * 1.3, fy, .05); pasoCadena(a.fis.lB2, A2[0] + 1.5, A2[1] + 1, .2, dt, fx * 1.3, fy, .05);
    } else {
      const k = H.k, alt = dis(a).coletas === 'altas', A = H.cabeza((alt ? -13 : -14.5) * k, (alt ? -10 : 2.5) * k), B = H.cabeza((alt ? -5 : -9) * k, (alt ? -17 : -11) * k);
      pasoCadena(a.fis.cA, A[0], A[1], -.38 + H.ang * .6, dt, fx, fy, .14);
      pasoCadena(a.fis.cB, B[0], B[1], -.62 + H.ang * .6, dt, fx, fy, .14);
      pasoCadena(a.fis.lA, A[0] - .5, A[1] + 1.2, -.1, dt, fx * 1.3, fy, .05); pasoCadena(a.fis.lA2, A[0] + 1.2, A[1] + 1.2, .35, dt, fx * 1.3, fy, .05);
      pasoCadena(a.fis.lB, B[0] - .5, B[1] + 1.2, -.2, dt, fx * 1.3, fy, .05);
    }
    // el huipil se atrasa con la aceleración y el viento
    resorte(a.fis.hem, 0, dt, 90, 9, (-a.ax / s * .012 + a.viento[0] / s * .01) * f);
  }

  function dibItzel(ctx, a) {
    if (a.vista === 'espalda') return dibItzelEspalda(ctx, a);
    const P = a.pose, C = a.cara, H = huesos(a), t = a.t, L = IT.linea;
    ctx.save(); ctx.translate(a.x, a.y); ctx.scale(a.s * a.face * (1 + P.sq * .45), a.s * (1 - P.sq * .5));
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const lw = 1.25;
    const fs = (fill, line = L, w = lw) => { if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (line) { ctx.lineWidth = w; ctx.strokeStyle = line; ctx.stroke(); } };
    const miembro = (pts, w, col, sombra) => { // trazo grueso con contorno
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.lineWidth = w + lw * 2; ctx.strokeStyle = L; ctx.stroke(); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke();
      if (sombra) { ctx.lineWidth = w * .35; ctx.strokeStyle = sombra; ctx.globalAlpha = .45; ctx.stroke(); ctx.globalAlpha = 1; }
    };
    // ---- coleta de atrás y su moño
    coleta(ctx, a.fis.cB.p, 5, IT.pelo, L, .9, dis(a).coletas === 'trenzas');
    // ---- brazo de atrás
    const bT = H.bT; miembro([bT[0], bT[1], bT[2]], 4.4, IT.piel2); ctx.beginPath(); ctx.arc(bT[2][0], bT[2][1], 2.5, 0, TAU); fs(IT.piel2);
    // ---- mochila
    ctx.save(); const tp = H.tor(-11.5, -17); ctx.translate(tp[0], tp[1]); ctx.rotate(P.lean);
    ctx.beginPath(); roundRect(ctx, -4.6, -9.5, 9, 19, 3); fs(IT.mochila);
    ctx.beginPath(); roundRect(ctx, -4.6, -9.5, 9, 7.5, 3); fs(IT.mochila2);
    ctx.fillStyle = '#ffe9b0'; ctx.beginPath(); ctx.arc(-.2, -4.4, 1, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(120,70,20,.5)'; ctx.lineWidth = .6; ctx.setLineDash([1, .8]); ctx.beginPath(); roundRect(ctx, -3.4, -.5, 6.6, 8.6, 2); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < 4; i++) { ctx.fillStyle = FLORES[i]; ctx.beginPath(); ctx.arc(-.1 + Math.cos(i * 1.57) * 1.3, 3.8 + Math.sin(i * 1.57) * 1.3, .8, 0, TAU); ctx.fill(); }
    ctx.restore();
    // ---- piernas
    const pierna = (p, col, sombra) => { const [Hh, K, F, ang] = p; miembro([[Hh[0], Hh[1] + 2], K, F], 4.6, col, sombra); zapato(ctx, F, ang, sombra ? IT.zapato2 : IT.zapato, L); };
    pierna(H.pT, IT.piel2, true); pierna(H.pD, IT.piel);
    // ---- short
    ctx.beginPath(); const s0 = H.tor(-7.2, -1), s1 = H.tor(7.2, -1), s2 = H.tor(7.6, 4.4), s3 = H.tor(-7.6, 4.4);
    ctx.moveTo(s0[0], s0[1]); ctx.lineTo(s1[0], s1[1]); ctx.lineTo(s2[0], s2[1]); ctx.quadraticCurveTo((s2[0] + s3[0]) / 2, (s2[1] + s3[1]) / 2 + 1.5, s3[0], s3[1]); ctx.closePath(); fs(IT.short);
    // ---- huipil
    const sw = clamp(a.fis.hem.v0, -6, 6);
    const hui = () => {
      const c = H.tor.bind(null); const p = [c(-6.8, -27.4), c(6.8, -27.4), c(9.4, -23.2), c(11.4 + sw, 2.6), c(-11.4 + sw * 1.1, 2.6), c(-9.4, -23.2)];
      ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); ctx.quadraticCurveTo((p[0][0] + p[1][0]) / 2, p[0][1] - 1.4, p[1][0], p[1][1]);
      ctx.quadraticCurveTo(p[1][0] + 2.4, p[1][1], p[2][0], p[2][1]); ctx.lineTo(p[3][0], p[3][1]);
      const m = c(sw * 1.05, 4.2); ctx.quadraticCurveTo(m[0], m[1], p[4][0], p[4][1]); ctx.lineTo(p[5][0], p[5][1]); ctx.quadraticCurveTo(p[0][0] - 2.4, p[0][1], p[0][0], p[0][1]); ctx.closePath();
    };
    hui(); fs(IT.huipil);
    ctx.save(); hui(); ctx.clip();
    // sombra del lado de atrás y pliegues
    ctx.fillStyle = 'rgba(150,120,150,.22)'; const q0 = H.tor(-14, -30), q1 = H.tor(-3, -30), q2 = H.tor(-1 + sw, 6), q3 = H.tor(-14, 6); ctx.beginPath(); ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]); ctx.quadraticCurveTo(H.tor(-5, -10)[0], H.tor(-5, -10)[1], q2[0], q2[1]); ctx.lineTo(q3[0], q3[1]); ctx.fill();
    ctx.strokeStyle = 'rgba(140,110,120,.35)'; ctx.lineWidth = .6; for (const xx of [-3, 4]) { const u0 = H.tor(xx, -16), u1 = H.tor(xx * 1.3 + sw * .8, 1.5); ctx.beginPath(); ctx.moveTo(u0[0], u0[1]); ctx.lineTo(u1[0], u1[1]); ctx.stroke(); }
    // bordado del cuello (cuadro de flores) y cenefa del bajo
    for (let i = 0; i < 7; i++) { const q = H.tor(-4.8 + i * 1.6, -25.6 + Math.abs(i - 3) * .15); flor(ctx, q[0], q[1], .85, BORD[i % BORD.length]); }
    for (let i = 0; i < 3; i++) { const q = H.tor(-3.2 + i * 3.2, -21.6); flor(ctx, q[0], q[1], 1.2, BORD[(i + 2) % BORD.length]); }
    const b0 = H.tor(-12, -2.5);
    ctx.fillStyle = '#e0485a'; for (let i = 0; i < 9; i++) { const q = H.tor(-11 + i * 2.6 + sw * .9, -.6); ctx.beginPath(); ctx.moveTo(q[0] - 1.2, q[1] + 1.4); ctx.lineTo(q[0], q[1] - .6); ctx.lineTo(q[0] + 1.2, q[1] + 1.4); ctx.fill(); }
    for (let i = 0; i < 8; i++) { const q = H.tor(-9.7 + i * 2.6 + sw * .85, -3.4); flor(ctx, q[0], q[1], .95, BORD[(i + 1) % BORD.length]); }
    ctx.strokeStyle = '#3f9a5c'; ctx.lineWidth = .6; ctx.beginPath(); const v0 = H.tor(-12 + sw * .8, -5.5), v1 = H.tor(12 + sw * .8, -5.5); ctx.moveTo(v0[0], v0[1]); ctx.lineTo(v1[0], v1[1]); ctx.stroke();
    void b0;
    ctx.restore();
    hui(); fs(null);
    // ---- tirante de la mochila
    const t0 = H.tor(-1.5, -27.6), t1 = H.tor(4.6, -21), t2 = H.tor(3.4, -13.5);
    ctx.beginPath(); ctx.moveTo(t0[0], t0[1]); ctx.quadraticCurveTo(t1[0], t1[1], t2[0], t2[1]); ctx.lineWidth = 2.6 + lw * 2; ctx.strokeStyle = L; ctx.stroke(); ctx.lineWidth = 2.6; ctx.strokeStyle = IT.mochila2; ctx.stroke();
    // ---- coleta de adelante (cuelga por la nuca)
    coleta(ctx, a.fis.cA.p, 5.6, IT.pelo, L, 1, dis(a).coletas === 'trenzas');
    // ---- cabeza
    dibCabeza(ctx, a, H, lw);
    // ---- moños
    listones(ctx, [a.fis.lB.p], IT.mono2, L); monito(ctx, a.fis.cB.p[0], H.ang - .3, .8);
    listones(ctx, [a.fis.lA.p, a.fis.lA2.p], IT.mono, L); monito(ctx, a.fis.cA.p[0], H.ang + .25, 1);
    // ---- brazo de adelante
    const bD = H.bD; miembro([bD[0], bD[1], bD[2]], 4.4, IT.piel);
    ctx.beginPath(); ctx.arc(bD[2][0], bD[2][1], 2.6, 0, TAU); fs(IT.piel);
    // manga corta con orilla bordada
    ctx.save(); ctx.translate(bD[0][0], bD[0][1]); ctx.rotate(-Math.atan2(bD[1][0] - bD[0][0], bD[1][1] - bD[0][1]));
    ctx.beginPath(); ctx.moveTo(-3.3, -2); ctx.quadraticCurveTo(0, -3.4, 3.3, -2); ctx.quadraticCurveTo(3.9, 1.4, 3.5, 3.4); ctx.quadraticCurveTo(0, 4.4, -3.5, 3.4); ctx.quadraticCurveTo(-3.9, 1.4, -3.3, -2); ctx.closePath(); fs(IT.huipil);
    for (let i = 0; i < 3; i++) flor(ctx, -2 + i * 2, 2.5, .62, BORD[i + 1]);
    ctx.restore();
    ctx.restore();
  }
  function zapato(ctx, F, ang, col, L) {
    ctx.save(); ctx.translate(F[0], F[1]); ctx.rotate(-ang * .4);
    ctx.beginPath(); ctx.ellipse(1.6, -.4, 4.4, 2.6, 0, 0, TAU); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = L; ctx.stroke();
    ctx.fillStyle = '#fff6ea'; ctx.beginPath(); ctx.ellipse(1.8, 1.6, 4.3, .9, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(.2, -1.8); ctx.lineTo(3.2, -1.2); ctx.stroke();
    ctx.restore();
  }
  function flor(ctx, x, y, r, col) {
    ctx.fillStyle = col; for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * .75, y + Math.sin(a) * r * .75, r * .52, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#ffe27a'; ctx.beginPath(); ctx.arc(x, y, r * .38, 0, TAU); ctx.fill();
  }
  // coleta: forma ahusada a lo largo de la cadena, con un brillo
  function coleta(ctx, p, w0, col, L, k = 1, trenza = false) {
    const n = p.length, izq = [], der = [];
    for (let i = 0; i < n; i++) {
      const a = p[Math.max(0, i - 1)], b = p[Math.min(n - 1, i + 1)], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
      const w = w0 * k * (i === 0 ? .55 : (1 - i / n * .7)) * (i === 1 ? 1.05 : 1) / 2;
      izq.push([p[i].x + nx * w, p[i].y + ny * w]); der.push([p[i].x - nx * w, p[i].y - ny * w]);
    }
    const tip = p[n - 1], pre = p[n - 2], ex = tip.x + (tip.x - pre.x) * .55, ey = tip.y + (tip.y - pre.y) * .55;
    ctx.beginPath(); ctx.moveTo(izq[0][0], izq[0][1]);
    for (let i = 1; i < n; i++) { const m = [(izq[i - 1][0] + izq[i][0]) / 2, (izq[i - 1][1] + izq[i][1]) / 2]; ctx.quadraticCurveTo(izq[i - 1][0], izq[i - 1][1], m[0], m[1]); }
    ctx.quadraticCurveTo(izq[n - 1][0], izq[n - 1][1], ex, ey); ctx.quadraticCurveTo(der[n - 1][0], der[n - 1][1], (der[n - 1][0] + der[n - 2][0]) / 2, (der[n - 1][1] + der[n - 2][1]) / 2);
    for (let i = n - 2; i > 0; i--) { const m = [(der[i - 1][0] + der[i][0]) / 2, (der[i - 1][1] + der[i][1]) / 2]; ctx.quadraticCurveTo(der[i][0], der[i][1], m[0], m[1]); }
    ctx.lineTo(der[0][0], der[0][1]); ctx.closePath();
    ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = L; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p[1].x, p[1].y); for (let i = 2; i < n - 1; i++) ctx.lineTo((p[i].x + izq[i][0]) / 2, (p[i].y + izq[i][1]) / 2);
    ctx.strokeStyle = IT.pelo2; ctx.lineWidth = .9; ctx.stroke();
    if (trenza) { // los gajos de la trenza: «v» de un lado al otro
      ctx.strokeStyle = L; ctx.lineWidth = .7;
      for (let i = 1; i < n - 1; i++) for (const u of [.33, .66]) { const x = p[i].x + (p[i + 1].x - p[i].x) * u, y = p[i].y + (p[i + 1].y - p[i].y) * u, j = i + (u > .5 ? 1 : 0), w = Math.hypot(izq[j][0] - der[j][0], izq[j][1] - der[j][1]) / 2, dx = (p[i + 1].x - p[i].x), dy = (p[i + 1].y - p[i].y), d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
        ctx.beginPath(); ctx.moveTo(x + nx * w, y + ny * w); ctx.lineTo(x + dx / d * w * .8, y + dy / d * w * .8); ctx.lineTo(x - nx * w, y - ny * w); ctx.stroke(); }
    }
  }
  function listones(ctx, cadenas, col, L) {
    for (const p of cadenas) {
      ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y); for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y);
      ctx.lineWidth = 2.2 + 2.2; ctx.strokeStyle = L; ctx.stroke(); ctx.lineWidth = 2.2; ctx.strokeStyle = col; ctx.stroke();
      const e = p[p.length - 1]; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(e.x - 1.3, e.y); ctx.lineTo(e.x + 1.3, e.y); ctx.lineTo(e.x, e.y - 1.1); ctx.fill();
    }
  }
  function monito(ctx, q, ang, k) {
    ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(ang); ctx.scale(k, k);
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(s * 2.4, -4.2, s * 6.4, -3.2, s * 5.6, .2); ctx.bezierCurveTo(s * 5.2, 3.2, s * 2.4, 2.6, 0, 0); ctx.fillStyle = IT.mono; ctx.fill(); ctx.lineWidth = 1.1; ctx.strokeStyle = IT.linea; ctx.stroke();
      ctx.strokeStyle = IT.mono2; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(s * 1.4, -.4); ctx.quadraticCurveTo(s * 3.6, -1.4, s * 4.8, -.4); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(0, 0, 1.7, 2, 0, 0, TAU); ctx.fillStyle = IT.mono; ctx.fill(); ctx.lineWidth = 1.1; ctx.strokeStyle = IT.linea; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(-.5, -.6, .5, 0, TAU); ctx.fill();
    ctx.restore();
  }
  function corona(ctx, H, delante, tipo = 'llena') {
    // flores sobre un arco encima de la cabeza; las de atrás primero
    const n = 8, kr = tipo === 'grande' ? 1.3 : tipo === 'chica' ? 1.15 : 1;
    for (let i = 0; i < n; i++) {
      if (tipo === 'chica' && i > 2) continue; // solo un ramito de lado
      const u = i / (n - 1), th = -Math.PI * (.97 - u * .8), x = Math.cos(th) * 17.6, y = -1.5 + Math.sin(th) * 17.2;
      const atras = u < .2; if (atras === delante) continue;
      const q = H.cabeza(x, y);
      if (i < n - 1) { const th2 = th + .2, q2 = H.cabeza(Math.cos(th2) * 18.4, -1.5 + Math.sin(th2) * 18); ctx.fillStyle = i % 2 ? '#3f9a5c' : '#5ab86a'; ctx.beginPath(); ctx.ellipse(q2[0], q2[1], 2.4, 1.2, th2 + Math.PI / 2, 0, TAU); ctx.fill(); }
      const r = (3.2 + Math.sin(u * Math.PI) * .9) * kr;
      ctx.save(); ctx.translate(q[0], q[1]);
      for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + i; ctx.beginPath(); ctx.ellipse(Math.cos(a) * r * .62, Math.sin(a) * r * .62, r * .55, r * .4, a, 0, TAU); ctx.fillStyle = FLORES[i]; ctx.fill(); ctx.lineWidth = .7; ctx.strokeStyle = shade(FLORES[i], -.4); ctx.stroke(); }
      ctx.fillStyle = '#ffe27a'; ctx.beginPath(); ctx.arc(0, 0, r * .3, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(-r * .3, -r * .35, r * .16, 0, TAU); ctx.fill();
      ctx.restore();
    }
  }
  function dibCabeza(ctx, a, H, lw) {
    const C = a.cara, L = IT.linea, P = H.cabeza, t = a.t, D = dis(a);
    ctx.save(); ctx.translate(H.cab[0], H.cab[1]); ctx.scale(H.k, H.k); ctx.translate(-H.cab[0], -H.cab[1]);
    const CARA = { redonda: [[-4, -6], [2, -11, 10, -10.5], [19.5, -8, 19.4, 3], [19.6, 12, 12.5, 15.4], [5, 18, -2.5, 13.5], [-4.5, 10, -4, 4]],
      ovalada: [[-4, -6], [2, -11, 10, -10.5], [19.5, -8, 19.2, 3], [19.2, 14, 12, 18], [4, 21.5, -2.5, 14.5], [-4.5, 10, -4, 4]],
      cachetona: [[-4, -6], [2, -11.5, 10, -11], [21, -8, 21, 4], [21.4, 14, 12.5, 16.4], [3, 19.5, -3, 13.8], [-5, 10, -4, 4]] }[D.cara] || null;
    const ell = (cx0, cy0, rx, ry) => { const q = P(cx0, cy0); ctx.beginPath(); ctx.ellipse(q[0], q[1], rx, ry, H.ang, 0, TAU); };
    const path = pts => { ctx.beginPath(); const q0 = P(...pts[0]); ctx.moveTo(q0[0], q0[1]); for (let i = 1; i < pts.length; i++) { if (pts[i].length === 4) { const c = P(pts[i][0], pts[i][1]), e = P(pts[i][2], pts[i][3]); ctx.quadraticCurveTo(c[0], c[1], e[0], e[1]); } else { const e = P(...pts[i]); ctx.lineTo(e[0], e[1]); } } };
    corona(ctx, H, false, D.corona);
    // pelo: masa de atrás
    ell(-1.5, -1.5, 19.6, 19.2); ctx.fillStyle = IT.pelo; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = L; ctx.stroke();
    // oreja y arete
    ell(-6.5, 4.5, 2.6, 3.4); ctx.fillStyle = IT.piel; ctx.fill(); ctx.strokeStyle = L; ctx.lineWidth = 1; ctx.stroke();
    const ar = P(-6.6, 9.2); ctx.fillStyle = IT.arete; ctx.beginPath(); ctx.arc(ar[0], ar[1], 1.25, 0, TAU); ctx.fill(); ctx.strokeStyle = '#a8761a'; ctx.lineWidth = .5; ctx.stroke();
    // cara
    path(CARA); ctx.closePath();
    ctx.fillStyle = IT.piel; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = L; ctx.stroke();
    // sombra suave del cuello
    ctx.save(); path(CARA); ctx.closePath(); ctx.clip();
    ell(-6, 8, 6, 10); ctx.fillStyle = 'rgba(120,60,40,.18)'; ctx.fill();
    ctx.restore();
    // rubor
    ctx.fillStyle = IT.rubor.replace('.42', (.42 * C.rubor + .1).toFixed(2));
    ell(2.2, 10.4, 3, 1.7); ctx.fill(); ell(15.6, 10.1, 2.3, 1.5); ctx.fill();
    // ojos
    const ab = C.ojos * parpadeo(a), mx = C.mirar[0], my = C.mirar[1];
    for (const [ex, ey, kx] of [[3.6, 4.7, 1], [13.9, 4.5, .8]]) {
      const q = P(ex, ey);
      ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(H.ang);
      if (D.ojos !== 'sprite' && !(C.risa > .5 || (ab < .72 && C.sonrisa > .8))) ojoDiseno(ctx, D.ojos, ab, mx, my, kx, ab < .2);
      else if (C.risa > .5 || (ab < .72 && C.sonrisa > .8)) { // ojos felices (o entrecerrados sonriendo): arquitos, como en su sprite
        ctx.beginPath(); ctx.moveTo(-2.6 * kx, 1); ctx.quadraticCurveTo(0, -2.6, 2.6 * kx, 1); ctx.lineWidth = 1.5; ctx.strokeStyle = IT.ojo; ctx.stroke();
      } else {
        // como en su sprite: óvalo oscuro de arriba abajo, sin blanco, con dos brillitos; la mirada mueve el ojo y los brillos
        const ab2 = clamp(ab, 0, 1.35), ry = 3.15 * Math.max(.08, ab2) * (ab2 > 1 ? 1 + (ab2 - 1) * .5 : 1), rx = 2.15 * kx * (ab2 > 1 ? 1 + (ab2 - 1) * .4 : 1), ox = mx * .55 * kx, oy = my * .45;
        if (ab2 > .18) {
          const g = ctx.createLinearGradient(0, oy - ry, 0, oy + ry); g.addColorStop(0, '#160806'); g.addColorStop(.62, IT.ojo); g.addColorStop(1, '#5a2a1c');
          ctx.beginPath(); ctx.ellipse(ox, oy, rx, ry, 0, 0, TAU); ctx.fillStyle = g; ctx.fill();
          // párpado de arriba cuando entrecierra (lo tapa la piel)
          if (ab2 < .95) { ctx.save(); ctx.beginPath(); ctx.ellipse(ox, oy, rx + .3, ry + .3, 0, 0, TAU); ctx.clip(); ctx.fillStyle = IT.piel; ctx.fillRect(ox - rx - 1, oy - ry - 1, rx * 2 + 2, (ry * 2 + 2) * (1 - ab2) * .55); ctx.restore(); }
          const bx = ox + (.75 + mx * .25) * rx * .45, by = oy - ry * .42 + my * .3;
          ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(bx, by, Math.min(1.05, rx * .42), Math.min(1.15, ry * .36), 0, 0, TAU); ctx.fill();
          ctx.globalAlpha = .75; ctx.beginPath(); ctx.arc(ox - rx * .32, oy + ry * .45, Math.min(.5, rx * .22), 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
          // una pestañita afuera
          ctx.strokeStyle = IT.ojo; ctx.lineWidth = .8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ox - rx * .9, oy - ry * .55); ctx.lineTo(ox - rx * 1.45, oy - ry * .85); ctx.stroke();
        } else { // cerrado: una rayita curva
          ctx.beginPath(); ctx.moveTo(ox - rx * 1.05, oy + .2); ctx.quadraticCurveTo(ox, oy + 1.4, ox + rx * 1.05, oy + .2); ctx.lineWidth = 1.05; ctx.lineCap = 'round'; ctx.strokeStyle = IT.ojo; ctx.stroke();
        }
      }
      ctx.restore();
    }
    // nariz
    path([[18.2, 5.4], [19.4, 7, 17.8, 7.6]]); ctx.lineWidth = .8; ctx.strokeStyle = 'rgba(90,40,30,.7)'; ctx.stroke();
    // boca
    const bo = clamp(C.boca, 0, 1), so = C.sonrisa, oo = C.o, mq = P(10.6, 12.9);
    ctx.save(); ctx.translate(mq[0], mq[1]); ctx.rotate(H.ang);
    if (oo > .1) { ctx.beginPath(); ctx.ellipse(0, .4, 1.3 + oo * .4, 1.2 + oo * 1.2, 0, 0, TAU); ctx.fillStyle = IT.boca; ctx.fill(); ctx.lineWidth = .9; ctx.strokeStyle = IT.linea; ctx.stroke(); }
    else if (bo > .08) {
      const w = 2.6 + so * .6, h = .8 + bo * 2.8;
      ctx.beginPath(); ctx.moveTo(-w, -so * .5); ctx.quadraticCurveTo(0, -so * .2 - .6, w, -so * .5); ctx.quadraticCurveTo(w * .7, h + so * .4, 0, h + so * .5); ctx.quadraticCurveTo(-w * .7, h + so * .4, -w, -so * .5); ctx.closePath();
      ctx.fillStyle = IT.boca; ctx.fill(); ctx.save(); ctx.clip(); ctx.fillStyle = IT.lengua; ctx.beginPath(); ctx.ellipse(.3, h + .5, w * .6, h * .45, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(-w, -so * .5 - 1.2, w * 2, 1.4); ctx.restore();
      ctx.lineWidth = .9; ctx.strokeStyle = IT.linea; ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(-2.4, -so * .9); ctx.quadraticCurveTo(0, so * 1.5, 2.4, -so * .9); ctx.lineWidth = 1.05; ctx.strokeStyle = IT.linea; ctx.stroke();
    }
    ctx.restore();
    // fleco
    path({
      recto: [[-6, -4], [-5, -15, 6, -16.5], [16, -16, 20.2, -6], [19, -4.5, 17.4, -4.8], [16.4, -8, 14, -8], [12.6, -4, 9.4, -4.6], [8.6, -8.5, 5.8, -8.2], [3.8, -3.6, 1, -4.5], [-.5, -8, -3, -7], [-4, -3, -6, -4]],
      lado: [[-6, -4], [-5, -15, 6, -16.5], [16, -16, 20.4, -7], [17, -6, 13, -9], [8, -12, 2, -6.5], [-1, -3.5, -3, -5], [-4.5, -2.5, -6, -4]],
      raya: [[-6, -4], [-5, -15, 6, -16.5], [9, -16.8, 11, -13.5], [13, -15.5, 16, -15], [19.5, -13, 20.4, -8], [17, -12, 12, -11.5], [11, -12.5, 10, -11], [6, -10.5, 2, -7], [-2, -4, -6, -4]],
      cortito: [[-6, -4], [-5, -15, 6, -16.5], [16, -16, 20.2, -8], [19.5, -7.5, 18.5, -7.6], [17, -9.5, 15, -9.4], [13.5, -7.2, 11, -7.6], [10, -9.8, 7.5, -9.6], [5.5, -7, 3, -7.6], [1, -9.6, -1.4, -8.4], [-3.6, -4, -6, -4]],
    }[D.fleco] || null); ctx.closePath();
    ctx.fillStyle = IT.pelo; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = L; ctx.stroke();
    // brillo del pelo
    path([[-8, -13], [0, -18.5, 10, -15.5]]); ctx.lineWidth = 1.8; ctx.strokeStyle = 'rgba(160,120,130,.38)'; ctx.stroke();
    // cejas (encima del fleco, para que siempre se lean)
    const ce = C.cejas, pr = C.preocupa, en = C.enojo;
    for (const [x0, x1, kx] of [[.4, 6.2, 1], [11.2, 16.4, .8]]) {
      const inner = kx === 1 ? x1 : x0, outer = kx === 1 ? x0 : x1;
      const yb = -2.3 - ce * 2.4, yi = yb - pr * 1.6 + en * 1.5 - Math.max(0, ce) * .6, yo = yb + pr * .4 - en * .3;
      path([[outer, yo], [(outer + inner) / 2, Math.min(yo, yi) - 1.1 - ce * .3, inner, yi]]); ctx.lineWidth = 1.35; ctx.strokeStyle = '#1a0e0e'; ctx.stroke();
    }
    corona(ctx, H, true, D.corona);
    ctx.restore();
  }

  // los otros estilos de ojos de los diseños
  function ojoDiseno(ctx, tipo, ab, mx, my, kx, cerrado) {
    const ab2 = clamp(ab, 0, 1.35), abre = ab2 > 1 ? 1 + (ab2 - 1) * .45 : 1;
    if (cerrado) { ctx.beginPath(); ctx.moveTo(-2.6 * kx, .3); ctx.quadraticCurveTo(0, 1.6, 2.6 * kx, .3); ctx.lineWidth = 1.05; ctx.lineCap = 'round'; ctx.strokeStyle = IT.ojo; ctx.stroke(); return; }
    const tapa = (rx, ry) => { if (ab2 < .95) { ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, rx + .3, ry + .3, 0, 0, TAU); ctx.clip(); ctx.fillStyle = IT.piel; ctx.fillRect(-rx - 1, -ry - 1, rx * 2 + 2, (ry * 2 + 2) * (1 - ab2) * .55); ctx.restore(); } };
    if (tipo === 'grandes') { // ojo redondo con blanco, iris café y brillo
      const rx = 3 * kx * abre, ry = 3.6 * abre;
      ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.fillStyle = '#fffaf2'; ctx.fill(); ctx.lineWidth = .7; ctx.strokeStyle = IT.linea; ctx.stroke();
      ctx.save(); ctx.clip(); ctx.beginPath(); ctx.arc(mx * kx, my * .7 + .4, 2.35 * kx, 0, TAU); ctx.fillStyle = '#6a3420'; ctx.fill(); ctx.beginPath(); ctx.arc(mx * kx, my * .7 + .5, 1.35 * kx, 0, TAU); ctx.fillStyle = '#1a0a08'; ctx.fill(); ctx.restore();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(mx * kx + .8 * kx, my * .7 - .6, .75, 0, TAU); ctx.fill();
      tapa(rx, ry); ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.lineWidth = 1.1; ctx.strokeStyle = IT.ojo; ctx.stroke();
    } else if (tipo === 'brillo') { // ojo grande de anime: iris con degradado, brillo grande y pestañas
      const rx = 2.8 * kx * abre, ry = 4.2 * abre;
      ctx.beginPath(); ctx.ellipse(0, .2, rx, ry, 0, 0, TAU); const g = ctx.createLinearGradient(0, -ry, 0, ry); g.addColorStop(0, '#1a0a08'); g.addColorStop(.55, '#5a2a1a'); g.addColorStop(1, '#c0703a'); ctx.fillStyle = g; ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(mx * .5 + .9 * kx, my * .4 - ry * .4, 1.15, 1.5, -.3, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(mx * .5 - .9 * kx, my * .4 + ry * .45, .5, 0, TAU); ctx.fill();
      tapa(rx, ry);
      ctx.strokeStyle = IT.ojo; ctx.lineWidth = 1.3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(0, .2, rx + .2, ry + .2, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(-rx * .95, -ry * .55); ctx.lineTo(-rx * 1.55, -ry * .9); ctx.moveTo(-rx * .7, -ry * .85); ctx.lineTo(-rx * 1.1, -ry * 1.25); ctx.stroke();
    } else if (tipo === 'punto') { // puntito redondo y brillante, como de cuento
      const r = 1.9 * abre; ctx.beginPath(); ctx.arc(mx * .4, my * .3, r * kx, 0, TAU); ctx.fillStyle = IT.ojo; ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(mx * .4 + .6, my * .3 - .6, .55, 0, TAU); ctx.fill(); tapa(r * kx, r);
    } else { // almendra: más alargado y con línea de pestañas
      const rx = 3.1 * kx * abre, ry = 2.5 * abre * Math.max(.3, Math.min(1, ab2 * 1.15));
      ctx.beginPath(); ctx.moveTo(-rx, .3); ctx.quadraticCurveTo(-rx * .2, -ry * 1.35, rx, -.2); ctx.quadraticCurveTo(rx * .2, ry * 1.25, -rx, .3); ctx.closePath(); ctx.fillStyle = '#fffaf2'; ctx.fill();
      ctx.save(); ctx.clip(); ctx.beginPath(); ctx.arc(mx * kx * .9, my * .5, 2.1 * kx, 0, TAU); ctx.fillStyle = '#4a2214'; ctx.fill(); ctx.beginPath(); ctx.arc(mx * kx * .9, my * .5, 1.1 * kx, 0, TAU); ctx.fillStyle = '#120806'; ctx.fill(); ctx.restore();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(mx * kx * .9 + .7, my * .5 - .7, .55, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-rx - .3, .4); ctx.quadraticCurveTo(-rx * .2, -ry * 1.45, rx + .4, -.3); ctx.lineWidth = 1.2; ctx.strokeStyle = IT.ojo; ctx.stroke();
      ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(-rx - .2, .2); ctx.lineTo(-rx - 1.5, -.9); ctx.stroke();
    }
  }

  function dibItzelEspalda(ctx, a) {
    const P = a.pose, H = huesos(a), L = IT.linea, lw = 1.25;
    ctx.save(); ctx.translate(a.x, a.y); ctx.scale(a.s * a.face * (1 + P.sq * .45), a.s * (1 - P.sq * .5));
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const fs = (fill) => { if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.lineWidth = lw; ctx.strokeStyle = L; ctx.stroke(); };
    const miembro = (pts, w, col) => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.lineWidth = w + lw * 2; ctx.strokeStyle = L; ctx.stroke(); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke(); };
    const hy = H.hipY, D = dis(a), kp = D.piernas;
    // piernas
    if (!a.sinPiernas) for (const s of [-1, 1]) { const x = s * 3.6; miembro([[x, hy + 2], [x + s * .4, hy + 11 * kp], [x + s * .3, hy + 20 * kp]], 4.8, IT.piel); ctx.beginPath(); ctx.ellipse(x + s * .3, hy + 20.6 * kp, 2.8, 2.2, 0, 0, TAU); fs(IT.zapato); } // (sentada del otro lado de un muro, no se ven)
    // short y huipil (espalda)
    ctx.beginPath(); roundRect(ctx, -8, hy - 1, 16, 5.6, 1.6); fs(IT.short);
    const sw = clamp(a.fis.hem.v0, -6, 6);
    ctx.beginPath(); ctx.moveTo(-8, hy - 27.5); ctx.quadraticCurveTo(0, hy - 29, 8, hy - 27.5); ctx.quadraticCurveTo(11, hy - 27, 11, hy - 23); ctx.lineTo(12.4 + sw, hy + 2.6); ctx.quadraticCurveTo(0 + sw, hy + 4.4, -12.4 + sw, hy + 2.6); ctx.lineTo(-11, hy - 23); ctx.quadraticCurveTo(-11, hy - 27, -8, hy - 27.5); ctx.closePath();
    ctx.save(); fs(IT.huipil); ctx.clip();
    ctx.fillStyle = '#e0485a'; for (let i = 0; i < 10; i++) { const x = -12 + i * 2.7 + sw; ctx.beginPath(); ctx.moveTo(x - 1.2, hy + 2.4); ctx.lineTo(x, hy + .3); ctx.lineTo(x + 1.2, hy + 2.4); ctx.fill(); }
    for (let i = 0; i < 9; i++) flor(ctx, -10.8 + i * 2.7 + sw * .9, hy - 2.6, 1, BORD[i % BORD.length]);
    ctx.fillStyle = 'rgba(150,120,150,.18)'; ctx.fillRect(-14, hy - 30, 7, 36);
    ctx.restore();
    // brazos
    // (de espaldas los dos cuelgan a los lados, por fuera de la mochila)
    for (const [s, B] of [[-1, H.bT], [1, H.bD]]) { const o = H.tor(s * 10.4, -25), ab = q => o[0] + s * (2 + Math.abs(q[0] - B[0][0]) * .55); miembro([o, [ab(B[1]), B[1][1]], [ab(B[2]), B[2][1]]], 4.4, IT.piel); ctx.beginPath(); ctx.arc(ab(B[2]), B[2][1], 2.6, 0, TAU); fs(IT.piel); }
    // mochila grande, con su parche bordado
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 5, hy - 28); ctx.quadraticCurveTo(s * 7.8, hy - 22, s * 6.2, hy - 15); ctx.lineWidth = 2.4 + lw * 2; ctx.strokeStyle = L; ctx.stroke(); ctx.lineWidth = 2.4; ctx.strokeStyle = IT.mochila2; ctx.stroke(); }
    ctx.beginPath(); roundRect(ctx, -8, hy - 25.5, 16, 20, 4); fs(IT.mochila);
    ctx.beginPath(); roundRect(ctx, -8, hy - 25.5, 16, 8, 4); fs(IT.mochila2);
    ctx.strokeStyle = 'rgba(120,70,20,.5)'; ctx.lineWidth = .6; ctx.setLineDash([1, .8]); ctx.beginPath(); roundRect(ctx, -5.4, hy - 15.5, 10.8, 8.4, 2); ctx.stroke(); ctx.setLineDash([]);
    flor(ctx, 0, hy - 11.3, 2, '#e8407a'); flor(ctx, -3, hy - 9.5, 1, '#f2b233'); flor(ctx, 3, hy - 9.5, 1, '#2fa3a0');
    // cabeza de espaldas: pelo con raya, orejas, coletas y corona
    const cq = H.cab, trenza = D.coletas === 'trenzas', altas = D.coletas === 'altas';
    ctx.save(); ctx.translate(cq[0], cq[1]); ctx.scale(H.k, H.k); ctx.translate(-cq[0], -cq[1]);
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cq[0] + s * 18.6, cq[1] + 4, 2.4, 3.3, 0, 0, TAU); fs(IT.piel); }
    ctx.restore();
    if (!altas) { coleta(ctx, a.fis.cE1.p, 5.6, IT.pelo, L, 1, trenza); coleta(ctx, a.fis.cE2.p, 5.6, IT.pelo, L, 1, trenza); }
    ctx.save(); ctx.translate(cq[0], cq[1]); ctx.scale(H.k, H.k); ctx.translate(-cq[0], -cq[1]);
    ctx.beginPath(); ctx.ellipse(cq[0], cq[1], 19.4, 19.6, 0, 0, TAU); fs(IT.pelo);
    ctx.strokeStyle = 'rgba(170,130,140,.45)'; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(cq[0], cq[1] - 19); ctx.quadraticCurveTo(cq[0] + .6, cq[1] - 6, cq[0], cq[1] + 6); ctx.stroke();
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cq[0] + s * 4, cq[1] - 17); ctx.quadraticCurveTo(cq[0] + s * 13, cq[1] - 12, cq[0] + s * 15, cq[1] + 1); ctx.stroke(); }
    ctx.restore();
    if (altas) { coleta(ctx, a.fis.cE1.p, 5.6, IT.pelo, L); coleta(ctx, a.fis.cE2.p, 5.6, IT.pelo, L); }
    listones(ctx, [a.fis.lA.p, a.fis.lA2.p, a.fis.lB.p, a.fis.lB2.p], IT.mono, L);
    monito(ctx, a.fis.cE1.p[0], -.3, 1); monito(ctx, a.fis.cE2.p[0], .3, 1);
    ctx.save(); ctx.translate(cq[0], cq[1]); ctx.scale(H.k, H.k); ctx.translate(-cq[0], -cq[1]);
    for (let i = 0; i < 9; i++) { if (D.corona === 'chica' && (i < 3 || i > 5)) continue; const u = i / 8, th = -Math.PI * (.98 - u * .96), x = cq[0] + Math.cos(th) * 18.4, y = cq[1] - 1 + Math.sin(th) * 17.6; ctx.save(); ctx.translate(x, y); const r = 3.4 * (D.corona === 'grande' ? 1.3 : D.corona === 'chica' ? 1.15 : 1); for (let k = 0; k < 5; k++) { const an = k / 5 * TAU + i; ctx.beginPath(); ctx.ellipse(Math.cos(an) * r * .62, Math.sin(an) * r * .62, r * .55, r * .4, an, 0, TAU); ctx.fillStyle = FLORES[i % FLORES.length]; ctx.fill(); ctx.lineWidth = .7; ctx.strokeStyle = shade(FLORES[i % FLORES.length], -.4); ctx.stroke(); } ctx.fillStyle = '#ffe27a'; ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.fill(); ctx.restore(); }
    ctx.restore();
    ctx.restore();
  }

  // ---------- poses de Itzel ----------
  const POSE = {
    quieta(a, t) { const P = a.pose; Object.assign(P, { lean: .02, cabeza: Math.sin(t * 1.3) * .03, bob: Math.sin(t * 2.2) * .35, agacha: 0, bD: [.12 + Math.sin(t * 2.2) * .02, .45], bT: [-.12, .4], pD: [.05, .05], pT: [-.05, .05] }); },
    corre(a, fase, k = 1) {
      const P = a.pose, s = Math.sin(fase), c = Math.cos(fase);
      P.lean = .2 * k; P.cabeza = -.08 * k; P.bob = -Math.abs(Math.sin(fase)) * 2.6 * k + 1.2 * k; P.agacha = 0;
      P.pD = [.85 * s * k, (.25 + 1.15 * Math.max(0, c)) * k]; P.pT = [-.85 * s * k, (.25 + 1.15 * Math.max(0, -c)) * k];
      P.bD = [-.95 * s * k, 1.25 * k + .2]; P.bT = [.95 * s * k, 1.25 * k + .2];
    },
    sentada(a, t, piernas = 1) {
      const P = a.pose, ph = t * 2.4;
      Object.assign(P, { lean: -.05, cabeza: 0, bob: 0, agacha: 0, bD: [-.32, .3], bT: [-.4, .25] });
      P.pD = [1.5, 1.35 + Math.sin(ph) * .28 * piernas]; P.pT = [1.42, 1.3 + Math.sin(ph + 2.2) * .28 * piernas];
    },
    agachada(a, k) { const P = a.pose; Object.assign(P, { lean: .32 * k, cabeza: -.15 * k, agacha: 5.2 * k, bD: [-.9 * k, .5], bT: [-1 * k, .4], pD: [.75 * k, 1.5 * k], pT: [.6 * k, 1.4 * k] }); },
    estira(a, k) { const P = a.pose; Object.assign(P, { lean: .12, cabeza: -.2, agacha: -1, bD: [2.5 * k, .2], bT: [2.2 * k, .3], pD: [-.15, .1], pT: [-.4, .35] }); },
    encoge(a, k) { const P = a.pose; Object.assign(P, { lean: .15, cabeza: -.05, agacha: -2, bD: [1.2 * k, 1.1], bT: [.9 * k, 1.2], pD: [1.2 * k, 1.9 * k], pT: [.9 * k, 1.7 * k] }); },
    aletea(a, t) { const P = a.pose; Object.assign(P, { lean: -.1, cabeza: .1, agacha: 0, bD: [2.6 + Math.sin(t * 16) * .5, .3], bT: [2.2 + Math.sin(t * 16 + 1.4) * .5, .3], pD: [.4, .7], pT: [-.2, .9] }); },
  };

  // =====================================================================
  //  AJOLOTES (Fresita y los tres)
  // =====================================================================
  const GILLS = [ // ancla relativa a la cabeza, ángulo de reposo, largo, ¿lado de atrás?
    [-7.5, -8, -2.05, 10.5, 1], [-9, -3.2, -2.5, 11, 1], [-8.6, 1.8, -2.9, 9, 1],
    [-4, -9.6, -1.75, 9, 0], [-6.4, -6.4, -2.15, 9.6, 0], [-7.4, -1.6, -2.55, 8, 0]];
  function fisAjo(a, dt) {
    const s = a.s || 1, f = a.face, C = a.cara;
    const fx = (-a.ax / s * .004 + a.viento[0] / s * .003) * f, fy = (-a.ay / s * .004 + a.viento[1] / s * .003);
    a.fis.g.forEach((r, i) => { const atras = GILLS[i][4], obj = -C.branquias * (atras ? .45 : .55) + Math.sin(a.t * 3 + i) * .05; resorte(r, obj, dt, 140, 10, (fy * .8 + fx * .4) * 60 * (atras ? 1 : .8)); });
    resorte(a.fis.cola, 0, dt, 60, 7, -a.ay / s * .02);
  }
  // de espaldas: cabezota redonda, branquias abiertas a los dos lados, patitas y la cola hacia abajo; no se le ve la cara
  function dibAjoEspalda(ctx, a) {
    const pal = a.pal, P = a.pose, C = a.cara, t = a.t, L = pal.line;
    ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(P.giro); ctx.scale(a.s, a.s); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const fs = (fill, w = 1.3) => { ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = w; ctx.strokeStyle = L; ctx.stroke(); };
    if (C.brillo > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(0, -4, 2, 0, -4, 42); g.addColorStop(0, rgba(pal.glow, .32 * C.brillo)); g.addColorStop(1, rgba(pal.glow, 0)); ctx.fillStyle = g; ctx.fillRect(-44, -46, 88, 88); ctx.restore(); }
    // cola con su aleta, que se mece hacia abajo
    const n = 9, cl = []; for (let i = 0; i <= n; i++) { const u = i / n; cl.push([Math.sin(t * 5 * P.nado - u * 3.6) * u * 6 * P.cola - u * 4, 13 + u * 29]); }
    const cola = extra => { ctx.beginPath(); for (let i = 0; i <= n; i++) { const u = i / n, an = 3.6 * Math.pow(1 - u, .75) + .3 + extra * Math.sin(Math.PI * Math.min(1, u * 1.2)); ctx.lineTo(cl[i][0] - an, cl[i][1]); } for (let i = n; i >= 0; i--) { const u = i / n, an = 3.6 * Math.pow(1 - u, .75) + .3 + extra * Math.sin(Math.PI * Math.min(1, u * 1.2)); ctx.lineTo(cl[i][0] + an, cl[i][1]); } ctx.closePath(); };
    cola(2.6); ctx.fillStyle = rgba(pal.tip, .45); ctx.fill(); ctx.lineWidth = .8; ctx.strokeStyle = rgba(L, .45); ctx.stroke();
    cola(0); fs(pal.body);
    // patitas
    for (const [px, py, gi] of [[-9.5, 7, .7], [9.5, 7, -.7], [-7.6, 17, .5], [7.6, 17, -.5]]) { ctx.save(); ctx.translate(px, py); ctx.rotate(gi + Math.sin(t * 8 * P.patas + px) * .25); ctx.beginPath(); ctx.ellipse(0, 2.2, 1.8, 3.1, 0, 0, TAU); fs(pal.body2, 1); ctx.restore(); }
    // cuerpo con la franja del lomo
    ctx.beginPath(); ctx.ellipse(0, 8, 10, 12, 0, 0, TAU); fs(pal.body);
    ctx.save(); ctx.clip(); ctx.strokeStyle = pal.body2; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(0, 22); ctx.stroke(); ctx.restore();
    // branquias: tres de cada lado, abiertas como abanico
    for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) {
      const ang = (sg < 0 ? Math.PI + .78 - i * .62 : -.78 + i * .62) + (a.fis.g[i].v0 || 0) * .7 * sg, len = 17 - i * 1.6, bx = sg * (10.5 + i * 1.1), by = -13 + i * 5, ex = bx + Math.cos(ang) * len, ey = by + Math.sin(ang) * len, nx = -Math.sin(ang), ny = Math.cos(ang), mx = (bx + ex) / 2, my = (by + ey) / 2;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(mx + nx * 3.4, my + ny * 3.4, ex, ey); ctx.quadraticCurveTo(mx - nx * 3.4, my - ny * 3.4, bx, by); ctx.fillStyle = pal.gill; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = L; ctx.stroke();
      ctx.strokeStyle = pal.tip; ctx.lineWidth = .75; for (let k = 1; k <= 5; k++) { const u = k / 6, px = bx + (ex - bx) * u, py = by + (ey - by) * u, w = 3.5 * Math.sin(u * Math.PI) + .6; for (const s2 of [-1, 1]) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + nx * w * s2 + Math.cos(ang) * 1.4, py + ny * w * s2 + Math.sin(ang) * 1.4); ctx.stroke(); } }
      ctx.fillStyle = pal.tip; ctx.beginPath(); ctx.arc(ex, ey, 1.1, 0, TAU); ctx.fill();
    }
    // la cabeza, por detrás
    ctx.beginPath(); ctx.ellipse(0, -8, 14.6, 12.4, 0, 0, TAU); fs(pal.body);
    ctx.save(); ctx.clip(); ctx.strokeStyle = pal.body2; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.ellipse(0, -5, 13, 10, 0, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.ellipse(-3.5, -16, 6, 2.4, -.2, 0, TAU); ctx.fill(); ctx.restore();
    ctx.restore();
  }
  function dibAjo(ctx, a) {
    if (a.vista === 'espalda') return dibAjoEspalda(ctx, a);
    const pal = a.pal, P = a.pose, C = a.cara, t = a.t;
    ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(P.giro); ctx.scale(a.s * a.face * (1 + P.sq * .5), a.s * (1 - P.sq * .5));
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const L = pal.line, lw = 1.3;
    const fs = (fill, w = lw) => { if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.lineWidth = w; ctx.strokeStyle = L; ctx.stroke(); };
    // aura mágica
    if (C.brillo > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 40); g.addColorStop(0, rgba(pal.glow, .35 * C.brillo)); g.addColorStop(1, rgba(pal.glow, 0)); ctx.fillStyle = g; ctx.fillRect(-42, -42, 84, 84); ctx.restore(); }
    // cola ondulante
    const n = 9, cl = [], ond = P.cola, cu = clamp(a.fis.cola.v0, -1, 1);
    for (let i = 0; i <= n; i++) { const u = i / n; cl.push([-11 - u * 30, 2 + Math.sin(t * 7 * P.nado - u * 4.2) * u * 4.2 * ond + cu * u * u * 10 - u * 1.5]); }
    const ancho = u => 8.4 * Math.pow(1 - u, .8) + .6;
    const cola = (extra) => { ctx.beginPath(); for (let i = 0; i <= n; i++) ctx.lineTo(cl[i][0], cl[i][1] - ancho(i / n) * .5 - extra * Math.sin(Math.PI * Math.min(1, i / n * 1.2))); for (let i = n; i >= 0; i--) ctx.lineTo(cl[i][0], cl[i][1] + ancho(i / n) * .5 + extra * .7 * Math.sin(Math.PI * Math.min(1, i / n * 1.2))); ctx.closePath(); };
    cola(3.2); ctx.fillStyle = rgba(pal.tip, .45); ctx.fill(); ctx.lineWidth = .8; ctx.strokeStyle = rgba(L, .45); ctx.stroke();
    cola(0); fs(pal.body);
    ctx.save(); cola(0); ctx.clip(); ctx.strokeStyle = pal.body2; ctx.lineWidth = 2.4; ctx.beginPath(); for (let i = 0; i <= n; i++) ctx.lineTo(cl[i][0], cl[i][1] - ancho(i / n) * .42); ctx.stroke(); ctx.restore();
    // patas de atrás
    const pata = (x, y, ph, col) => { const sw = Math.sin(t * 9 * P.patas + ph) * .5; ctx.save(); ctx.translate(x, y); ctx.rotate(.5 + sw); ctx.beginPath(); ctx.ellipse(0, 2.4, 1.7, 3, 0, 0, TAU); fs(col, 1); for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.arc(k * 1.1, 5.2, .75, 0, TAU); ctx.fillStyle = col; ctx.fill(); } ctx.restore(); };
    pata(-9, 6, 1.3, pal.body2); pata(5, 6.5, 0, pal.body2);
    // branquias de atrás
    const H0 = [12, -3];
    const branquia = (i) => {
      const [gx, gy, ang0, len, atras] = GILLS[i], ang = ang0 + a.fis.g[i].v0 + (atras ? 0 : .1);
      const bx = H0[0] + gx, by = H0[1] + gy, ex = bx + Math.cos(ang) * len, ey = by + Math.sin(ang) * len;
      const nx = -Math.sin(ang), ny = Math.cos(ang), mx = (bx + ex) / 2 + nx * 1.2, my = (by + ey) / 2 + ny * 1.2;
      const col = atras ? pal.gill : pal.gill2;
      // hoja con plumitas
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(mx + nx * 3.2, my + ny * 3.2, ex, ey); ctx.quadraticCurveTo(mx - nx * 3.2, my - ny * 3.2, bx, by);
      ctx.fillStyle = atras ? pal.gill : shade(pal.gill, -.12); ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = L; ctx.stroke();
      ctx.strokeStyle = atras ? pal.tip : shade(pal.tip, -.1); ctx.lineWidth = .75;
      for (let k = 1; k <= 5; k++) { const u = k / 6, px = bx + (ex - bx) * u + nx * Math.sin(u * Math.PI) * 1.2, py = by + (ey - by) * u + ny * Math.sin(u * Math.PI) * 1.2, w = 3.4 * Math.sin(u * Math.PI) + .6;
        for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + nx * w * sg + Math.cos(ang) * 1.4, py + ny * w * sg + Math.sin(ang) * 1.4); ctx.stroke(); } }
      ctx.fillStyle = pal.tip; ctx.beginPath(); ctx.arc(ex, ey, 1.1, 0, TAU); ctx.fill();
      void col;
    };
    for (let i = 3; i < 6; i++) branquia(i);
    // cuerpo
    ctx.beginPath(); ctx.ellipse(-3, 1.5, 13.5, 8.2, 0, 0, TAU); fs(pal.body);
    ctx.save(); ctx.clip(); ctx.beginPath(); ctx.ellipse(-2, 7.5, 12, 4.6, 0, 0, TAU); ctx.fillStyle = pal.belly; ctx.fill(); ctx.strokeStyle = pal.body2; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.ellipse(-3, -2, 12, 6.5, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); ctx.restore();
    // cabeza
    ctx.beginPath(); ctx.ellipse(H0[0], H0[1], 12.6, 11.4, 0, 0, TAU); fs(pal.body);
    ctx.save(); ctx.clip(); ctx.beginPath(); ctx.ellipse(H0[0] + 1, H0[1] + 8.5, 10, 4.8, 0, 0, TAU); ctx.fillStyle = pal.belly; ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(H0[0] + 1, H0[1] - 7, 6, 2.6, -.2, 0, TAU); ctx.fill(); ctx.restore();
    // rubor
    ctx.fillStyle = pal.cheek; ctx.beginPath(); ctx.ellipse(H0[0] + 2.5, H0[1] + 5, 2.6, 1.5, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(H0[0] + 10.8, H0[1] + 4, 1.8, 1.2, 0, 0, TAU); ctx.fill();
    // ojos
    const ab = C.ojos * parpadeo(a), mx = C.mirar[0], my = C.mirar[1];
    for (const [ex, ey, r] of [[H0[0] + 4.2, H0[1] - .2, 3.3], [H0[0] + 10.6, H0[1] - 1, 2.6]]) {
      if (C.risa > .5) { ctx.beginPath(); ctx.moveTo(ex - r * .9, ey + .6); ctx.quadraticCurveTo(ex, ey - r * .9, ex + r * .9, ey + .6); ctx.lineWidth = 1.4; ctx.strokeStyle = pal.eye; ctx.stroke(); continue; }
      const ry = r * clamp(ab, .08, 1.4) * (1 - .38 * C.mitad);
      ctx.beginPath(); ctx.ellipse(ex, ey, r * (1 + (ab - 1) * .1), ry, 0, 0, TAU); ctx.fillStyle = pal.eye; ctx.fill();
      if (ab > .25) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex + r * .3 + mx * .5, ey - r * .38 + my * .3, r * .36, 0, TAU); ctx.fill(); ctx.globalAlpha = .75; ctx.beginPath(); ctx.arc(ex - r * .32 + mx * .5, ey + r * .38, r * .16, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
      if (C.mitad > 0 && ab > .25) { ctx.beginPath(); ctx.ellipse(ex, ey, r * 1.08, ry * 1.08, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.lineWidth = 1.1; ctx.strokeStyle = L; ctx.stroke(); } // párpado tranquilo
    }
    // boca
    const bx = H0[0] + 8.2, by = H0[1] + 5.4, bo = clamp(C.boca, 0, 1);
    if (C.o > .1) { ctx.beginPath(); ctx.ellipse(bx, by + .6, 1.1 + C.o * .4, .9 + C.o * 1.3, 0, 0, TAU); ctx.fillStyle = '#7a1a3a'; ctx.fill(); }
    else if (bo > .08) { ctx.beginPath(); ctx.moveTo(bx - 3, by - .2); ctx.quadraticCurveTo(bx, by + .4, bx + 3, by - .2); ctx.quadraticCurveTo(bx + 1.6, by + 1 + bo * 2.6, bx, by + 1 + bo * 2.6); ctx.quadraticCurveTo(bx - 1.6, by + 1 + bo * 2.6, bx - 3, by - .2); ctx.closePath(); ctx.fillStyle = '#7a1a3a'; ctx.fill(); ctx.save(); ctx.clip(); ctx.fillStyle = '#ff8aa8'; ctx.beginPath(); ctx.ellipse(bx, by + 1.6 + bo * 2.4, 2, 1.2, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    else { ctx.beginPath(); ctx.moveTo(bx - 3.2, by - .4); ctx.quadraticCurveTo(bx, by + C.sonrisa * 2.2, bx + 3.2, by - .6); ctx.lineWidth = 1; ctx.strokeStyle = L; ctx.stroke(); }
    // branquias de adelante y patas de adelante
    for (let i = 0; i < 3; i++) branquia(i);
    pata(-6, 7.5, 2.5, pal.body); pata(8, 8, 3.6, pal.body);
    ctx.restore();
  }

  // ---------- caja local para componer (en unidades del actor ya escaladas) ----------
  function caja(a) {
    const s = a.s;
    if (a.tipo === 'itzel' && a.cuerpo) return [a.x - 130 * s, a.y - 124 * s, a.x + 130 * s, a.y + 20 * s]; // las poses dibujadas pueden ser anchas (el salto con Fresita)
    if (a.tipo === 'itzel') return a.vista === 'abrazo' ? [a.x - 70 * s, a.y - 120 * s, a.x + 70 * s, a.y + 12 * s] : [a.x - 46 * s, a.y - 112 * s, a.x + 46 * s, a.y + 12 * s];
    if (a.color === 'fresita' && a.vista === 'espalda') return [a.x - 56 * s, a.y - 52 * s, a.x + 56 * s, a.y + 64 * s]; // de espaldas la cola cuelga
    if (a.vista === 'espalda' || a.vista === 'sentada') return [a.x - 52 * s, a.y - 56 * s, a.x + 52 * s, a.y + 70 * s];
    return [a.x - 52 * s, a.y - 44 * s, a.x + 52 * s, a.y + 30 * s];
  }
  // =====================================================================
  //  LOS TÍTERES NUEVOS (los mismos dibujos de anime que usa el juego)
  //  Itzel y Fresita salen con el títere ilustrado; los otros tres ajolotes
  //  siguen con su dibujo. Lo que el títere no trae (de espaldas, sentada y
  //  la boca de Itzel) lo arma cine-titeres.js con piezas del mismo dibujo.
  //  Donde no están cargados (la página de modelos) sale el dibujo de antes.
  // =====================================================================
  const TIT = { itzel: null, fresita: null };
  const ALTO_IT = 3.9, LARGO_FRE = 4.6; // cuántas veces el tamaño del juego, por cada unidad de a.s
  const AJO_K = .8; // todos los ajolotes, un poco más chicos que antes
  function titereDe(a) {
    if (typeof TITERES_DATOS === 'undefined' || typeof hazItzel !== 'function' || typeof hazFresita !== 'function') return null;
    if (a.tipo === 'itzel') return TIT.itzel || (TIT.itzel = hazItzel(TITERES_DATOS.itzelCorto || TITERES_DATOS.itzel));
    if (a.color === 'fresita') return TIT.fresita || (TIT.fresita = hazFresita(TITERES_DATOS.fresita));
    return null;
  }
  function dibTitere(ctx, a, fn) {
    const it = a.tipo === 'itzel', k = (it ? ALTO_IT : LARGO_FRE * AJO_K) * (a.s || 1), P = a.pose || {};
    // el tiempo del títere corre con el de la cinemática (ACTOR.paso lleva a.t); en un corte (o si el tiempo salta) empieza de cero,
    // así no hereda una velocidad falsa que le alce la falda o la voltee
    let q = a._tit; const t = a.t || 0;
    if (!q || t < q.t || t - q.t > .2 || Math.hypot(a.x - q.x, a.y - q.y) > 30) q = a._tit = { p: {}, f: {}, x: a.x, y: a.y, t };
    const dt = clamp(t - q.t, 0, .1); q.t = t;
    let x = a.x, y = a.y, face = a.face || 1;
    const X = typeof CINE_TITERES !== 'undefined' ? CINE_TITERES : null, espalda = a.vista === 'espalda' && X;
    const sentada = it && P.pD && P.pD[0] > 1.3 && P.pD[1] > 1, asiento = y - 21 * (a.dis && a.dis.piernas || 1) * (a.s || 1);
    // de espaldas: armada con piezas de la ilustración (a sentada se le cortan las piernas, que cuelgan del lado del mar)
    if (espalda) {
      const kA = k * (it ? 25 / 1280 : 20 / 1380);
      ctx.save(); ctx.translate(x, it && sentada ? asiento + 700 * kA : y); ctx.scale(kA, kA);
      const ok = it ? X.itzelEspalda(ctx, t, { sentada, viento: clamp(((a.viento && a.viento[0]) || 0) / -2400, -1, 1) }) : X.fresitaEspalda(ctx, t);
      ctx.restore(); if (ok) return;
    }
    // una pose dibujada de cuerpo entero (a.cuerpo: 'brinco', 'corre0'…): se pone tal cual, volteada según hacia dónde ve
    if (it && X && X.itzelCuerpo && a.cuerpo && !espalda) {
      const g = ((a.face || 1) < 0) !== X.cuerpoIzq(a.cuerpo) ? -1 : 1;
      ctx.save(); ctx.translate(x, y); ctx.scale(g, 1); const m = X.itzelCuerpo(ctx, a.cuerpo, 25 * k, t, P.sq || 0, X.bocaCuadro ? X.bocaCuadro(a.cara) : -1); ctx.restore();
      if (m) { if (Array.isArray(m)) a._mano = [x + m[0] * g, y + m[1]]; q.x = x; q.y = y; return; }
    }
    if (it && X && X.itzelPose && (a.vista === 'frente' || a.vista === 'abrazo' || (sentada && !espalda))) {
      const v = a.vista === 'frente' || a.vista === 'abrazo' ? a.vista : 'sentada';
      ctx.save(); ctx.translate(x, v === 'sentada' ? asiento : y); if (v !== 'frente' && face < 0) ctx.scale(-1, 1);
      const ok = X.itzelPose(ctx, a, v, 25 * k, t); ctx.restore(); if (ok) return;
    }
    const vx = dt ? (x - q.x) / dt / k : 0, vy = dt ? (y - q.y) / dt / k : 0; q.x = x; q.y = y;
    const p = q.p;
    if (it) {
      const aire = (P.agacha || 0) < -.5 || Math.abs(vy) > 40;
      Object.assign(p, { x: x / k, y: y / k, face, vx: Math.abs(vx) < 6 ? 0 : vx, vy, on: !aire, sq: P.sq || 0, crouch: (P.agacha || 0) > 2, inv: 0 });
      p.run = (p.run || 0) + Math.abs(p.vx) * dt * .16;
    } else {
      Object.assign(p, { x: x / k, y: y / k, face });
      // habla: cada vez que abre la boca la avisa como un poder recién usado (así el títere abre la suya)
      const boca = a.cara && a.cara.boca || 0; if (boca > .3 && !q.abierta) p.cool = (p.cool || 0) + 1; q.abierta = boca > .3;
    }
    q.f.t = t;
    if (!it || !X) { ctx.save(); ctx.scale(k, k); fn(ctx, p, q.f); ctx.restore(); return; }
    // cuando habla, la boca va justo encima de la cabeza del títere, con su misma transformación
    const bc = X.bocaCuadro ? X.bocaCuadro(a.cara) : -1, oc = X.ojosCuadro ? X.ojosCuadro(a) : -1, D = TITERES_DATOS.itzelCorto || TITERES_DATOS.itzel, PZ = D && D.piezas, QC = PZ && PZ.cabeza;
    // los brazos: los del títere se esconden y van los dibujos de brazo de David, con las poses de la cinemática
    // (P.bD el de enfrente y P.bT el de atrás; [hombro, codo]); se suavizan para que no brinquen
    const conBrazos = !!(PZ && PZ.cuerpo && X.brazoItzel), ESCONDE = conBrazos ? ['brazoN', 'brazoF'].map(n => PZ[n]).filter(Boolean) : [];
    if (conBrazos) {
      const ex = !!P.exacto, D0 = P.bD || [.1, .4], T0 = P.bT || [-.1, .4];
      const abre = !ex && D0[0] > 1.3, dH = ex ? D0[0] : abre ? -.85 : clamp(D0[0] * .5, -.55, .55), dE = ex ? D0[1] : abre ? .55 : clamp(D0[1] * .4 + .1, .1, .9), // brazos abiertos: el de enfrente sale hacia afuera
        tH = clamp(T0[0] * .35, -.35, .4), tE = clamp(T0[1] * .5 + .1, .1, .8);
      const b = q.b || (q.b = { dh: dH, de: dE, th: tH, te: tE }), f = dt ? 1 - Math.exp(-dt * 8) : 1; b.dh += (dH - b.dh) * f; b.de += (dE - b.de) * f; b.th += (tH - b.th) * f; b.te += (tE - b.te) * f;
    }
    const M0 = ctx.getTransform();
    if (QC) { const orig = ctx.drawImage; ctx.drawImage = function (im, sx, sy) {
      if (arguments.length === 9 && ESCONDE.some(r => sx >= r[0] - .5 && sy >= r[1] - .5 && sx < r[0] + r[2] && sy < r[1] + r[3])) return; // el brazo del títere: no
      const cuerpo = conBrazos && arguments.length === 9 && sx === PZ.cuerpo[0] && sy === PZ.cuerpo[1], b = q.b;
      if (cuerpo) { this.save(); this.globalCompositeOperation = 'destination-over'; X.brazoItzel(this, 'F', b.th, b.te); this.restore(); } // el de atrás, detrás de todo
      orig.apply(this, arguments);
      if (cuerpo) { const m = X.brazoItzel(this, 'N', b.dh, b.de, { piedra: P.piedra, mano: P.mano }); if (m) { const w = M0.inverse().multiply(this.getTransform()).transformPoint(new DOMPoint(m[0], m[1])); a._mano = [w.x, w.y]; } }
      if (arguments.length === 9 && sx === QC[0] && sy === QC[1]) { X.ojosItzel(this, oc, QC, orig); X.bocaItzel(this, bc, QC, orig); }
    }; }
    try { dibItzelTitere(); } finally { if (QC) delete ctx.drawImage; }
    function dibItzelTitere() {
    // en el espacio del dibujo de Itzel (sus pies en 680,1312), volteado como el títere
    const kA = k * 25 / 1280, yO = sentada ? asiento + (1312 - 790) * kA : y, g = p.face < 0 ? -1 : 1;
    const enDibujo = fn2 => { ctx.save(); ctx.translate(x, yO); ctx.scale(g * kA, kA); ctx.translate(-680, -1312); fn2(ctx); ctx.restore(); };
    if (sentada) {
      // sentada de lado: piernas colgando, el títere de la cintura para arriba y el regazo encima
      p.y = yO / k; p.vx = 0; p.on = true;
      enDibujo(c => X.piernasSentada(c, t));
      ctx.save(); ctx.beginPath(); ctx.rect(x - 400, yO - 400, 800, 400 - (1312 - 780) * kA); ctx.clip(); ctx.scale(k, k); fn(ctx, p, q.f); ctx.restore();
      enDibujo(c => X.regazo(c, t));
    } else { ctx.save(); ctx.scale(k, k); fn(ctx, p, q.f); ctx.restore(); }
    }
  }
  // los tres ajolotes nuevos (y Fresita de frente) salen con los dibujos de David
  function dibAjoArte(ctx, a) {
    const X = typeof CINE_TITERES !== 'undefined' ? CINE_TITERES : null; if (!X || !X.ajolote) return false;
    if (a.color === 'fresita' && a.vista === 'espalda') return false;
    const P = a.pose, C = a.cara, s = a.s * AJO_K, sq = P.sq || 0, g = a.vista === 'espalda' || a.vista === 'sentada' ? 1 : a.face || 1;
    ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(P.giro || 0);
    if (C.brillo > 0 && a.pal) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const r = 40 * s, gr = ctx.createRadialGradient(0, 0, 2 * s, 0, 0, r); gr.addColorStop(0, rgba(a.pal.glow, .3 * C.brillo)); gr.addColorStop(1, rgba(a.pal.glow, 0)); ctx.fillStyle = gr; ctx.fillRect(-r, -r, r * 2, r * 2); ctx.restore(); }
    ctx.scale(s * g * (1 + sq * .5), s * (1 - sq * .5));
    const ok = X.ajolote(ctx, a); ctx.restore(); return ok;
  }
  setTimeout(() => { titereDe({ tipo: 'itzel' }); titereDe({ color: 'fresita' }); }, 0); // que sus dibujos ya estén cargados cuando empiece la cinemática
  function dibuja(ctx, a) { if (!a.vis) return; if (a.tipo === 'ajolote' && dibAjoArte(ctx, a)) return; const fn = titereDe(a); if (fn) return dibTitere(ctx, a, fn); a.tipo === 'itzel' ? dibItzel(ctx, a) : dibAjo(ctx, a); }

  return { itzel, ajolote, paso, corte, dibuja, caja, POSE, AJO, IT, flor, monito, DISENOS, usaDiseno: id => { DIS = DISENOS.find(d => d.id === id) || DISENOS[0]; } };
})();
