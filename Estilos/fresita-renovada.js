'use strict';
// Fresita: la ilustración como títere. Nada en el aire como un ajolote: la onda corre por la cola, las branquias se
// doblan con el aire de su propio vuelo y las patitas apenas reman; cuando va rápido las pega al cuerpo y la cola se estira.
// Si el jugador la lleva en círculos, se pone feliz y da vueltas siguiendo el círculo, con una estela de destellos.
window.hazFresita = D => {
  const { carga, listo, pon, gira, estado, muelle, suave, enPixel, esPixel, malla, prepara } = TITERE;
  const T = carga(D), ANCHO = 20, E = ANCHO / 1380, [CX, CY] = D.centro, ESTADOS = new WeakMap(), M = D.mallas;
  for (const k in M) prepara(M[k]);
  const CUELLO = [1072, 600];
  // [semilla, hacia dónde las barre el aire]
  const BRANQUIAS = { g1: [.9, -1], g2: [1.1, -.6], g3: [1.2, .12], g4: [.8, .7], g5: [1, -1], g6: [1.3, -1] };
  // [x, y, desfase, cuánto se pega al cuerpo]
  const PATAS = { pdn: [1012, 800, 0, .62], ptn: [672, 792, 2.2, .78], pdf: [1226, 762, 3.6, .6], ptf: [776, 880, 5, .5] };
  // cuánto dobla la cola en reposo: al ir rápido se endereza
  const CURVA = M.cola.n.map((p, i, n) => { if (i < 2) return 0; const a = Math.atan2(p[1] - n[i - 1][1], p[0] - n[i - 1][0]), b = Math.atan2(n[i - 1][1] - n[i - 2][1], n[i - 1][0] - n[i - 2][0]); let d = a - b; while (d > Math.PI) d -= 6.28318; while (d < -Math.PI) d += 6.28318; return d; });
  const hebra = m => ({ th: new Array(m.n.length).fill(0), tv: new Array(m.n.length).fill(0) });
  const nuevo = () => ({ cola: hebra(M.cola), g: Object.fromEntries(Object.keys(BRANQUIAS).map(k => [k, hebra(M[k])])), ojo: 1.5 + Math.random() * 3, boca: 0, cool: 0, fase: Math.random() * 6, vx: 0, vy: 0, ac: 0, quieto: 0, rumbo: 0, rot: 0, gira: false, chispas: [], tc: 0, sentido: 1 });
  // cada nudo tiene un resorte hacia su meta y sigue al de antes con retraso: así la onda viaja hacia la punta
  function mueve(e, n, fijos, meta, k, fr, sigue, dt) {
    if (!dt) return; const pasos = Math.max(1, Math.round(dt * 120)), h = dt / pasos;
    for (let q = 0; q < pasos; q++) for (let i = fijos; i < n; i++) { e.tv[i] += ((meta(i / (n - 1), i) - e.th[i]) * k + (i > fijos ? (e.th[i - 1] - e.th[i]) * sigue : 0) - e.tv[i] * fr) * h; e.th[i] += e.tv[i] * h; }
  }
  function tira(m, th, fijos) {
    const P = m.n, Q = []; let giro = 0;
    for (let i = 0; i < P.length; i++) { if (i < fijos) { Q.push(P[i]); continue; } giro += th[i]; const ax = P[i][0] - P[i - 1][0], ay = P[i][1] - P[i - 1][1], sg = Math.sin(giro), cg = Math.cos(giro), b = Q[i - 1]; Q.push([b[0] + ax * cg - ay * sg, b[1] + ax * sg + ay * cg]); }
    return Q;
  }
  // hacer círculos: se suma cuánto da vuelta su camino. Un zigzag se cancela solo; una vuelta completa, no
  const envuelve = d => { while (d > Math.PI) d -= 6.28318; while (d < -Math.PI) d += 6.28318; return d; };
  function siente(s, fr) {
    const dt = s.dt, pide = fr.face || 1; if (s.x === undefined) { s.x = fr.x; s.y = fr.y; } if (s.pide !== pide) { s.pide = pide; s.cara = pide; } if (!dt) return;
    s.vx = (fr.x - s.x) / dt; s.vy = (fr.y - s.y) / dt; s.x = fr.x; s.y = fr.y; s.ac *= Math.exp(-dt * .35);
    // mira hacia donde va de verdad, venga de donde venga el movimiento (mouse, control o un modo de juego); quieta, sigue viendo hacia donde iba
    if (Math.abs(s.vx) > 16) s.cara = Math.sign(s.vx);
    const a = Math.atan2(s.vy, s.vx), libre = !fr.atrapada && !((fr.daze || 0) > 0);
    if (Math.hypot(s.vx, s.vy) > 55) { if (s.dir !== undefined) { const d = envuelve(a - s.dir); if (Math.abs(d) < 1.2) { s.ac += d; s.rumbo += d; } } s.dir = a; s.quieto = 0; } else s.quieto += dt;
    if (!s.gira && Math.abs(s.ac) > 8.5 && libre && !(s.mareo > 0)) { s.gira = true; s.sentido = s.ac > 0 ? 1 : -1; s.rumbo = a + 6.28318 * Math.round((s.rot - a) / 6.28318); }
    if (s.gira && (Math.abs(s.ac) < 2.2 || s.quieto > .22 || !libre)) s.gira = false;
    fr.feliz = s.gira;
    if (s.gira) { s.rumbo += s.sentido * dt * 5; s.tGira = (s.tGira || 0) + dt; } // la O gira un poco más rápido que el círculo: va alcanzando su cola
    else if (s.tGira) { if (s.tGira > .8) s.mareo = 2.6; s.tGira = 0; } // después de tantas vueltas queda mareada
    s.mareo = Math.max(0, (s.mareo || 0) - dt);
    // nerviosa: si la agarra un bicho le escurren gotitas de sudor
    if (fr.atrapada && (s.ts = (s.ts || 0) - dt) <= 0) { s.ts = .17; const lado = Math.random() < .5 ? -1 : 1; (s.sudor = s.sudor || []).push({ x: fr.x + (s.cara || 1) * 4 + lado * 2.5, y: fr.y - 8, vx: lado * (9 + Math.random() * 10), vy: -16 - Math.random() * 8, t: 0 }); }
    if (s.sudor) { for (const q of s.sudor) { q.t += dt; q.vy += 70 * dt; q.x += q.vx * dt; q.y += q.vy * dt; } s.sudor = s.sudor.filter(q => q.t < .75); }
    s.rot += ((s.gira ? s.rumbo : 6.28318 * Math.round(s.rot / 6.28318)) - s.rot) * Math.min(1, dt * (s.gira ? 14 : 7)); // al terminar llega derechita a la vuelta más cercana
    if (s.gira && (s.tc -= dt) <= 0) { s.tc = .032; s.chispas.push({ x: fr.x + (Math.random() - .5) * 9, y: fr.y + (Math.random() - .5) * 8, t: 0, k: Math.floor(Math.random() * 4), r: 1.4 + Math.random() * 1.5 }); }
    for (const q of s.chispas) q.t += dt; s.chispas = s.chispas.filter(q => q.t < .62);
  }
  // la O: el cuerpo se curva parejo hasta casi cerrar el círculo. La cabeza queda rígida, adelante, persiguiendo la punta de la cola
  const NUDOS = M.entera.n, LARGOS = [], ANGULOS = [], ARCO = [0];
  for (let i = 1; i < NUDOS.length; i++) { const dx = NUDOS[i][0] - NUDOS[i - 1][0], dy = NUDOS[i][1] - NUDOS[i - 1][1]; LARGOS.push(Math.hypot(dx, dy)); let a = Math.atan2(dy, dx); if (i > 1) { const p = ANGULOS[i - 2]; while (a - p > Math.PI) a -= 6.28318; while (a - p < -Math.PI) a += 6.28318; } ANGULOS.push(a); ARCO.push(ARCO[i - 1] + LARGOS[i - 1]); }
  const CABEZA = ARCO.findIndex(d => d > 300), CURVA_O = 6.28318 * .9 / (ARCO[ARCO.length - 1] - ARCO[CABEZA]);
  const PATA_NUDO = { pdn: ARCO.findIndex(d => d > 520), ptn: ARCO.findIndex(d => d > 820) };
  function anillo(k) {
    const Q = [NUDOS[0].slice()], giros = [0];
    for (let i = 1; i < NUDOS.length; i++) {
      const a = ANGULOS[i - 1], b = i - 1 <= CABEZA ? a : ANGULOS[CABEZA] - (ARCO[i] - ARCO[CABEZA]) * CURVA_O, g = lerp(a, b, k), p = Q[i - 1];
      Q.push([p[0] + Math.cos(g) * LARGOS[i - 1], p[1] + Math.sin(g) * LARGOS[i - 1]]); giros.push(g - a);
    }
    return { Q, giros };
  }
  function enO(c, fr, f, s, k) {
    const t = f.t || 0, { Q, giros } = anillo(k); let mx = 0, my = 0; for (const p of Q) { mx += p[0]; my += p[1]; } mx /= Q.length; my /= Q.length;
    const bob = Math.sin(t * 7) * 8 * k; c.translate(CX, CY + bob); c.scale(1 + Math.sin(t * 9) * .012, 1 - Math.sin(t * 9) * .012); c.translate(-CX, -CY); c.translate((CX - mx) * k, (CY - my) * k);
    const rama = n => { const e = s.g[n], m = M[n], lado = BRANQUIAS[n][1]; mueve(e, m.n.length, 1, u => Math.sin(t * 5 + BRANQUIAS[n][0] * 2 - u * 2.4) * .024 * (1 + u) + lado * .03, 74, 8, 18, s.dt); malla(c, T, n, m, tira(m, e.th, 1)); };
    const pata = n => { const [x, y] = PATAS[n], j = PATA_NUDO[n], a = NUDOS[j]; c.save(); c.translate(Q[j][0] - a[0], Q[j][1] - a[1]); gira(c, a[0], a[1], giros[j]); gira(c, x, y, .85 + Math.sin(t * 8 + x) * .08); pon(c, T, n); c.restore(); };
    rama('g6'); rama('g5');
    malla(c, T, 'entera', M.entera, Q);
    if (T.q.parpados) pon(c, T, 'parpados'); if (T.q.boca) pon(c, T, 'boca');
    rama('g1'); rama('g2'); rama('g3'); rama('g4'); pata('ptn'); pata('pdn');
  }
  const COLORES = ['#fff4b8', '#ffb3d9', '#ffffff', '#ffd77a'];
  function destellos(c, s, pix) {
    for (const q of s.chispas) {
      const u = q.t / .62, r = q.r * (1 - u * .75), y = q.y + u * 3; c.globalAlpha = 1 - u * u; c.fillStyle = COLORES[q.k];
      if (pix) { const p = Math.max(1, Math.round(r)); c.fillRect(Math.round(q.x) - p, Math.round(y), p * 2 + 1, 1); c.fillRect(Math.round(q.x), Math.round(y) - p, 1, p * 2 + 1); continue; }
      c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * .7854 + u * 2, l = i % 2 ? r * .26 : r; c.lineTo(q.x + Math.cos(a) * l, y + Math.sin(a) * l); } c.closePath(); c.fill();
    }
    c.globalAlpha = 1;
  }
  // mareada: tres estrellitas le dan vueltas alrededor de la cabeza
  function estrellitas(c, s, fr, giro, t, pix) {
    const k = Math.min(1, s.mareo / .5), hx = fr.x + giro * 4.5, hy = fr.y - 9;
    for (let i = 0; i < 3; i++) {
      const a = t * 5.5 + i * 2.094, x = hx + Math.cos(a) * 7.5, y = hy + Math.sin(a) * 2.3, r = 1.5 + Math.sin(a) * .35, atras = Math.sin(a) < 0;
      c.globalAlpha = k * (atras ? .55 : 1); c.fillStyle = i % 2 ? '#fff3a0' : '#ffd23f'; c.strokeStyle = '#7a4a10'; c.lineWidth = .3;
      if (pix) { c.fillRect(Math.round(x) - 1, Math.round(y), 3, 1); c.fillRect(Math.round(x), Math.round(y) - 1, 1, 3); continue; }
      c.beginPath(); for (let j = 0; j < 10; j++) { const b = j * .6283 - 1.5708, l = j % 2 ? r * .45 : r; c.lineTo(x + Math.cos(b) * l, y + Math.sin(b) * l); } c.closePath(); c.fill(); c.stroke();
    }
    c.globalAlpha = 1;
  }
  function gotas(c, s, pix) {
    for (const q of s.sudor) {
      const a = 1 - Math.max(0, (q.t - .45) / .3); c.globalAlpha = a; c.fillStyle = '#c9ecff'; c.strokeStyle = '#3d76a8'; c.lineWidth = .3;
      if (pix) { c.fillRect(Math.round(q.x), Math.round(q.y), 1, 2); continue; }
      const ang = Math.atan2(q.vy, q.vx) - 1.5708; c.save(); c.translate(q.x, q.y); c.rotate(ang); c.beginPath(); c.moveTo(0, -1.9); c.quadraticCurveTo(1.25, .1, 0, 1.1); c.quadraticCurveTo(-1.25, .1, 0, -1.9); c.fill(); c.stroke(); c.fillStyle = '#ffffff'; c.fillRect(-.4, -.3, .35, .55); c.restore();
    }
    c.globalAlpha = 1;
  }
  function arma(c, fr, f, s) {
    const t = f.t || 0, dt = s.dt, vx = s.vx, vy = s.vy, feliz = s.gira;
    const vel = suave(s, 'vel', clamp(Math.hypot(vx, vy) / 190, 0, 1), 6), sube = suave(s, 'sub', clamp(vy / 190, -1, 1), 6), mareada = (fr.daze || 0) > 0 || s.mareo > 0, presa = !!fr.atrapada;
    // En reposo, Fresita mira su patita y la saluda; se suspende al moverse,
    // usar el poder, girar, estar atrapada o mareada.
    const esperando = f.g && f.g.fre === fr && Math.hypot(vx, vy) < 4 && !presa && !mareada && !feliz && !(fr.cool > 0);
    s.esperaSaludo = esperando ? (s.esperaSaludo || 0) + dt : 0;
    const faseSaludo = s.esperaSaludo > 3 ? (s.esperaSaludo - 3) % 8.5 : -1;
    const saludo = faseSaludo >= 0 && faseSaludo < 2.6 ? Math.sin(Math.PI * faseSaludo / 2.6) ** 2 : 0;
    const nervios = suave(s, 'ner', presa ? 1 : 0, 12); // la agarró un bicho: tiembla, se retuerce, patalea y no parpadea
    if ((fr.cool || 0) > s.cool + .05) s.boca = .42; s.cool = fr.cool || 0; s.boca = Math.max(0, s.boca - dt);
    const salto = muelle(s, 'sal', s.boca > 0 ? 1 : 0, 170, 15);
    s.fase += dt * (2.5 + vel * 6.5);
    // flota despacio; va más arriba al inhalar y la cola responde un poco después
    const bob = Math.sin(t * 1.9) * 20 + Math.sin(t * .83) * 11, tiembla = nervios * (Math.sin(t * 46) * .05 + Math.sin(t * 13) * .08), inc = muelle(s, 'inc', sube * .26 + Math.sin(t * 1.9 - .8) * .022 + tiembla + (mareada ? Math.sin(t * 2.6) * .2 : 0), 46, 9);
    c.translate(CX + nervios * Math.sin(t * 53) * 55, CY + bob + nervios * Math.sin(t * 61) * 40); c.rotate(inc); c.scale(1 + vel * .045 + salto * .05, 1 - vel * .03 - salto * .05); c.translate(-CX, -CY);
    // ---- física de las partes flexibles
    const nc = M.cola.n.length, fijosC = 2, ampl = 1 + vel * .8; mueve(s.cola, nc, fijosC, (u, i) => Math.sin(s.fase - u * 5.2) * (.012 + .028 * u) * ampl - CURVA[i] * vel * .52 + sube * .007 + nervios * Math.sin(t * 15 - u * 6) * .06, 64, 8.5, 22, dt);
    for (const n in BRANQUIAS) {
      const [k, lado] = BRANQUIAS[n], m = M[n], e = s.g[n], flojas = mareada ? .4 : 1, sopla = muelle(s, 'dr' + n, vel, 34, 8);
      mueve(e, m.n.length, 1, u => Math.sin(t * 2.3 + k * 2.3 - u * 2.1) * .018 * (1 + u) * flojas + lado * (sopla * .036 + sube * -.012 - salto * .022 - nervios * .03) + nervios * Math.sin(t * 19 + k * 3 - u * 2) * .05 + (mareada ? lado * .045 : 0), 74, 8, 18, dt);
    }
    const rama = n => malla(c, T, n, M[n], tira(M[n], s.g[n].th, 1));
    const pata = n => { const [x, y, d, pega] = PATAS[n], a = muelle(s, 'p' + n, Math.sin(t * 2.2 + d) * .1 * (1 - vel) * (1 - nervios) + (n === 'pdn' ? saludo * (.42 + .16 * Math.sin(t * 7)) : 0) + vel * pega * (1 - nervios) - salto * .16 + nervios * Math.sin(t * 21 + d * 1.7) * .5, 70, 11); c.save(); gira(c, x, y, a); pon(c, T, n); c.restore(); };
    // ---- de atrás hacia adelante
    rama('g6'); rama('g5'); pata('pdf'); pata('ptf');
    malla(c, T, 'cola', M.cola, tira(M.cola, s.cola.th, fijosC));
    pon(c, T, 'cuerpo');
    gira(c, CUELLO[0], CUELLO[1], muelle(s, 'cab', Math.sin(t * 1.5) * .018 - saludo * .09 - sube * .09 - salto * .05, 60, 10));
    pon(c, T, 'cabeza');
    s.ojo -= dt; if (s.ojo < -.13) s.ojo = 1.4 + Math.random() * 3.4;
    if (T.q.parpados && ((s.ojo < 0 && !presa) || mareada || feliz)) pon(c, T, 'parpados');
    if (T.q.boca && (s.boca > 0 || presa || feliz)) pon(c, T, 'boca');
    rama('g1'); rama('g2'); rama('g3'); rama('g4'); pata('ptn'); pata('pdn');
  }
  const nuevaFresita = function (c, fr, f) {
    if (!listo(T)) return; const s = estado(fr, f, nuevo, ESTADOS); siente(s, fr); const v = suave(s, 'vista', s.gira ? s.sentido : s.cara, 15), giro = (v < 0 ? -1 : 1) * Math.max(.28, Math.abs(v)); // al voltearse da la vuelta en vez de cambiar de golpe
    const kO = suave(s, 'kO', s.gira ? 1 : 0, s.gira ? 8 : 11); // cuánto está enrollada
    const ajusta = q => { q.translate(fr.x, fr.y); q.rotate(s.rot); q.scale(giro * E, E); q.translate(-CX, -CY); if (kO > .03) enO(q, fr, f, s, kO); else arma(q, fr, f, s); };
    if (s.chispas.length) { c.save(); destellos(c, s, esPixel(f)); c.restore(); }
    if (s.sudor && s.sudor.length) { c.save(); gotas(c, s, esPixel(f)); c.restore(); }
    if (esPixel(f)) { enPixel(c, fr.x, fr.y + 16, 40, 34, Math.max(1, Math.round(f.S || 1)), q => { q.save(); ajusta(q); q.restore(); }); if (s.mareo > 0) estrellitas(c, s, fr, giro, f.t || 0, true); return; }
    c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; ajusta(c); c.restore();
    if (s.mareo > 0) { c.save(); estrellitas(c, s, fr, giro, f.t || 0, esPixel(f)); c.restore(); }
  };
  nuevaFresita.img = T.img;
  return nuevaFresita;
};
(() => {
  const nuevaFresita = hazFresita(TITERES_DATOS.fresita);
  window.precargaFresita = () => { const img = nuevaFresita.img; if (img && img.pide) img.pide(); return img || null; };
  // va en los mismos mundos que la Itzel ilustrada, para que las dos sean del mismo dibujo
  function instalar(id) { if (!TITERE_MUNDOS.has(id)) return; const st = STYLE_MAP[id]; if (!st) return; const base = st.base && STYLE_MAP[st.base]; if (base) base.fresita = nuevaFresita; else st.fresita = nuevaFresita; }
  for (const id of Object.keys(STYLE_MAP)) instalar(id);
  GANCHOS.en('aplicaElegido', anterior => function (id, k = 0) { const nombre = anterior(id, k); instalar(id); return nombre; });
})();

// Ilustraciones originales de Fresita para cada técnica. La versión de
// cielo anime conserva el títere anterior con sus animaciones completas.
(() => {
  const hojasReposo = {
    nouveau: imgPerezosa('../Roguelike/assets/forge/fresita/nouveau-idle-cola-v1/sheet-transparent.png'),
    acuarela: imgPerezosa('../Roguelike/assets/forge/fresita/acuarela-idle-burbuja-v2/sheet-transparent.png'),
    paper: imgPerezosa('../Roguelike/assets/forge/fresita/paper-idle-branquias-v1/sheet-transparent.png'),
    bruma: imgPerezosa('../Roguelike/assets/forge/fresita/bruma-idle-mirar-v2/sheet-transparent.png'),
    biolum: imgPerezosa('../Roguelike/assets/forge/fresita/biolum-idle-destellos-v1/sheet-transparent.png'),
    barro: imgPerezosa('../Roguelike/assets/forge/fresita/barro-idle-contoneo-v1/sheet-transparent.png'),
    lowpoly: imgPerezosa('../Roguelike/assets/forge/fresita/lowpoly-idle-curiosa-v1/sheet-transparent.png'),
    neon: imgPerezosa('../Roguelike/assets/forge/fresita/neon-idle-ritmo-v2/sheet-transparent.png'),
    fuego: imgPerezosa('../Roguelike/assets/forge/fresita/fuego-idle-mejilla-v1/sheet-transparent.png'),
    hielo: imgPerezosa('../Roguelike/assets/forge/fresita/hielo-idle-abanico-v1/sheet-transparent.png'),
    agua: imgPerezosa('../Roguelike/assets/forge/fresita/agua-idle-estirar-v1/sheet-transparent.png'),
    cuaderno: imgPerezosa('../Roguelike/assets/forge/fresita/cuaderno-idle-estornudo-v1/sheet-transparent.png'),
    bordado: imgPerezosa('../Roguelike/assets/forge/fresita/bordado-idle-hilo-v1/sheet-transparent.png'),
    grabado: imgPerezosa('../Roguelike/assets/forge/fresita/grabado-idle-rascar-v1/sheet-transparent.png'),
    oleo: imgPerezosa('../Roguelike/assets/forge/fresita/oleo-idle-pincelada-v1/sheet-transparent.png'),
    vitral: imgPerezosa('../Roguelike/assets/forge/fresita/vitral-idle-destello-v1/sheet-transparent.png'),
    deco: imgPerezosa('../Roguelike/assets/forge/fresita/deco-idle-engranaje-v1/sheet-transparent.png'),
    eco: imgPerezosa('../Roguelike/assets/forge/fresita/eco-idle-mariposa-v2/sheet-transparent.png'),
    cyber: imgPerezosa('../Roguelike/assets/forge/fresita/cyber-idle-pez-v1/sheet-transparent.png'),
    cinema: imgPerezosa('../Roguelike/assets/forge/fresita/cinema-idle-curiosa-v2/sheet-transparent.png'),
    hollin: imgPerezosa('../Roguelike/assets/forge/fresita/hollin-idle-sacudir-v1/sheet-transparent.png'),
    sumie: imgPerezosa('../Roguelike/assets/forge/fresita/sumie-idle-respirar-v1/sheet-transparent.png'),
    bits8: imgPerezosa('../Roguelike/assets/forge/fresita/bits8-idle-estrella-v2/sheet-transparent.png'),
    bits32: imgPerezosa('../Roguelike/assets/forge/fresita/bits32-idle-escondite-v2/sheet-transparent.png'),
    bits64: imgPerezosa('../Roguelike/assets/forge/fresita/bits64-idle-mejilla-v1/sheet-transparent.png'),
    flat: imgPerezosa('../Roguelike/assets/forge/fresita/flat-idle-corazon-v1/sheet-transparent.png'),
    codex: imgPerezosa('../Roguelike/assets/forge/fresita/codex-idle-branquias-v1/sheet-transparent.png'),
    cielo: imgPerezosa('../Roguelike/assets/forge/fresita/cielo-idle-estrella-v1/sheet-transparent.png'),
    miniatura: imgPerezosa('../Roguelike/assets/forge/fresita/miniatura-idle-cola-v1/sheet-transparent.png')
  };
  const ids=['pixel','ocaso','acuarela','paper','biolum','flat','sumie','neon','bruma','lowpoly','codex','oleo','vitral','cuaderno','grabado','nouveau','deco','cyber','cinema','barro','eco','fuego','agua','hielo','cielo','hollin','bits8','bits32','bits64','miniatura','bordado'];
  const disponibles=new Set(ids), imagenes=Object.create(null), envolturas=new WeakMap();
  function imagen(id){
    if(!disponibles.has(id)) return null;
    if(!imagenes[id]){const nuevos=new Set(['eco','bits32','bits64','bits8','acuarela','fuego','deco','nouveau','bordado','biolum','bruma','cielo','hollin','agua','codex','cuaderno','cyber','flat','grabado','lowpoly','oleo','hielo','paper','barro','cinema','miniatura','neon','sumie','vitral']);imagenes[id]=imgPerezosa(nuevos.has(id)?'../Roguelike/assets/personajes/fresita-nuevas/'+id+'.png':'../Roguelike/assets/personajes/fresita-estilos/'+id+'.png');}
    const im=imagenes[id];return im.complete&&im.naturalWidth?im:null;
  }
  // lo que siente la ilustración (como el títere): hacia dónde va, sus vueltas cuando la llevan en círculos y el mareo después
  const ESTADOS=new WeakMap(), vuelta=d=>{while(d>Math.PI)d-=6.28318;while(d<-Math.PI)d+=6.28318;return d;};
  function siente(fr,f){
    let s=ESTADOS.get(fr); const ahora=performance.now()/1000;
    if(!s){s={x:fr.x,y:fr.y,tt:ahora,cara:fr.face||1,vista:fr.face||1,ac:0,rot:0,rumbo:0,gira:false,sentido:1,quieto:0,mareo:0,tGira:0,chispas:[],tc:0};ESTADOS.set(fr,s);}
    const dt=Math.min(.1,Math.max(0,ahora-s.tt)); s.tt=ahora; if(!dt)return s;
    const vx=(fr.x-s.x)/dt, vy=(fr.y-s.y)/dt; s.velReposo=Math.hypot(vx,vy); s.x=fr.x; s.y=fr.y; s.ac*=Math.exp(-dt*.35);
    // mira hacia donde se mueve de verdad (mouse, mando o lo que la lleve); quieta, hacia donde la pide el juego
    if(Math.abs(vx)>16)s.cara=Math.sign(vx); else if(Math.hypot(vx,vy)<8&&fr.face)s.cara=fr.face;
    const libre=!fr.atrapada&&!((fr.daze||0)>0), a=Math.atan2(vy,vx);
    if(Math.hypot(vx,vy)>55){ if(s.dir!==undefined){const d=vuelta(a-s.dir); if(Math.abs(d)<1.2){s.ac+=d;s.rumbo+=d;}} s.dir=a; s.quieto=0; } else s.quieto+=dt;
    if(!s.gira&&Math.abs(s.ac)>8.5&&libre&&!(s.mareo>0)){s.gira=true;s.sentido=s.ac>0?1:-1;s.rumbo=a+6.28318*Math.round((s.rot-a)/6.28318);}
    if(s.gira&&(Math.abs(s.ac)<2.2||s.quieto>.22||!libre))s.gira=false;
    fr.feliz=s.gira;
    if(s.gira){s.rumbo+=s.sentido*dt*5;s.tGira+=dt;} else if(s.tGira){if(s.tGira>.8)s.mareo=2.6;s.tGira=0;}
    s.mareo=Math.max(0,s.mareo-dt);
    s.rot+=((s.gira?s.rumbo:6.28318*Math.round(s.rot/6.28318))-s.rot)*Math.min(1,dt*(s.gira?14:7));
    // al voltearse se angosta y da la vuelta, en lugar de cambiar de golpe
    const quiere=s.gira?s.sentido:s.cara; s.vista+=(quiere-s.vista)*Math.min(1,dt*15);
    if(s.gira&&(s.tc-=dt)<=0){s.tc=.032;s.chispas.push({x:fr.x+(Math.random()-.5)*9,y:fr.y+(Math.random()-.5)*8,t:0,k:Math.floor(Math.random()*4),r:1.4+Math.random()*1.5});}
    for(const q of s.chispas)q.t+=dt; s.chispas=s.chispas.filter(q=>q.t<.62);
    return s;
  }
  function chispasYMareo(c,s,fr,t,pixel){
    const COL=['#fff6c8','#ffd1ea','#ffffff','#ffb3d6'];
    for(const q of s.chispas){const k=1-q.t/.62; c.globalAlpha=k; c.fillStyle=COL[q.k]; const r=q.r*k; if(pixel)c.fillRect(Math.round(q.x-r/2),Math.round(q.y-q.t*6-r/2),Math.max(1,Math.round(r)),Math.max(1,Math.round(r))); else {c.beginPath();c.moveTo(q.x,q.y-q.t*6-r);c.lineTo(q.x+r*.35,q.y-q.t*6);c.lineTo(q.x,q.y-q.t*6+r);c.lineTo(q.x-r*.35,q.y-q.t*6);c.closePath();c.fill();}}
    c.globalAlpha=1;
    if(s.mareo>0){const k=Math.min(1,s.mareo/.5); for(let i=0;i<3;i++){const a=t*5+i*2.094, x=fr.x+Math.cos(a)*6, y=fr.y-11+Math.sin(a)*1.8; c.globalAlpha=k; c.fillStyle='#ffe27a'; c.beginPath(); for(let p=0;p<10;p++){const ang=p/10*6.28318-1.5708, rr=p%2?.7:1.7; c.lineTo(x+Math.cos(ang)*rr,y+Math.sin(ang)*rr);} c.closePath(); c.fill();} c.globalAlpha=1;}
  }
  function dibuja(c,fr,f,im,id){
    const t=f.t||0, ancho=22, alto=ancho*im.naturalHeight/im.naturalWidth;
    const pixel=!!(f.st&&(f.st.pixel||f.st.fixedS));
    const nueva=id!=='pixel'&&id!=='ocaso';
    const s=siente(fr,f), v=s.vista, giro=(v<0?-1:1)*Math.max(.28,Math.abs(v));
    // En la enciclopedia se conserva el diseño de referencia; las hojas
    // completas de idle se reproducen durante la partida.
    if(hojasReposo[id]&&!(f&&f.enciclopedia)){
      const idle=hojasReposo[id]; idle.pide();
      const ahora=Number.isFinite(f.t)?f.t:0, dt=Math.max(0,Math.min(.05,ahora-(s.idleT??ahora))); s.idleT=ahora;
      const desplazamiento=Math.hypot(fr.x-(s.idleX??fr.x),fr.y-(s.idleY??fr.y));s.idleX=fr.x;s.idleY=fr.y;
      const quieta=f.g&&f.g.fre===fr&&desplazamiento<Math.max(.07,dt*4)&&!fr.atrapada&&!(fr.daze>0)&&!(fr.cool>0)&&!s.gira&&!(s.mareo>0)&&!f.g.win&&!(id==='bruma'&&f.g.haz);
      s.idleTiempo=quieta?(s.idleTiempo||0)+dt:0;
      const fase=s.idleTiempo-3, ciclo=fase>=0?fase%8.5:-1;
      if(ciclo>=0&&ciclo<1.6&&idle.complete&&idle.naturalWidth===1024&&idle.naturalHeight===512){
        const q=Math.min(7,Math.floor(ciclo/.2)),lado=22*256/(id==='hielo'?204:id==='bits32'?159:id==='bits64'?202:id==='flat'?197:id==='codex'?204:id==='cielo'?199:id==='miniatura'?207:217);
        c.save();c.translate(fr.x,fr.y);c.rotate(s.rot);c.scale(-giro,1);c.imageSmoothingEnabled=!pixel;
        const ajuste=id==='bits8'?([180,200,205,209,209,202,181,180][q]-180)*lado/256:id==='flat'?8*lado/256:id==='codex'?4*lado/256:0;
        c.drawImage(idle,(q%4)*256,Math.floor(q/4)*256,256,256,-lado/2,-lado/2-.7-ajuste,lado,lado);c.restore();return;
      }
    }
    c.save(); chispasYMareo(c,s,fr,t,pixel); c.restore();
    c.save();c.translate(fr.x,fr.y+Math.sin(t*2)*.45);c.rotate(s.rot);c.scale(nueva?-giro:giro,1);
    c.imageSmoothingEnabled=!pixel;
    // Una malla de franjas contiguas ondula cola y cuerpo: cada zona de la
    // ilustración se dibuja una sola vez, sin superponer patas ni branquias.
    const n=32, sw=im.naturalWidth/n, dw=ancho/n;
    for(let i=0;i<n;i++){
      const u=(i+.5)/n, onda=Math.sin(t*4.2-u*6)*Math.pow(nueva?u:1-u,1.5)*1.15;
      c.drawImage(im,i*sw,0,sw,im.naturalHeight,-ancho*(nueva?.5:.65)+i*dw,-alto*.57+onda,dw+.015,alto);
    }
    // En la niebla el haz nace de los ojos: se encienden solo con el faro activo.
    if (id === 'bruma' && f.g && f.g.haz && f.g.def && f.g.def.id === 'bruma') {
      c.fillStyle = '#fffef3'; c.shadowColor = '#ffffff'; c.shadowBlur = 2;
      for (const u of [.126, .266]) {
        const onda = Math.sin(t * 4.2 - u * 6) * Math.pow(u, 1.5) * 1.15;
        c.beginPath(); c.arc(-ancho * .5 + ancho * u, -alto * .57 + alto * .5 + onda, .38, 0, Math.PI * 2); c.fill();
      }
    }
    c.restore();
  }
  // Ocaso en siluetas: la Fresita dorada de ocho poses de flotación (tools/fresita-ocaso.py). Mira a la derecha en la hoja.
  const idleOcaso = imgPerezosa('../Roguelike/assets/forge/fresita/ocaso-idle-cola-v1/sheet-transparent.png');
  const FLOTA={n:8,w:320,h:190,fps:1000/140}, hojaFlota=imgPerezosa('../Roguelike/assets/personajes/fresita-ocaso/flotacion.png?v=1');
  function dibujaFlota(c,fr,f){
    const t=f.t||0, ancho=26, alto=ancho*FLOTA.h/FLOTA.w, s=siente(fr,f), v=s.vista, giro=(v<0?-1:1)*Math.max(.28,Math.abs(v)), q=Math.floor(t*FLOTA.fps)%FLOTA.n;
    const ahora=Number.isFinite(f.t)?f.t:0, dt=Math.max(0,Math.min(.05,ahora-(s.idleT??ahora))); s.idleT=ahora;
    const desplazamiento=Math.hypot(fr.x-(s.idleX??fr.x),fr.y-(s.idleY??fr.y));s.idleX=fr.x;s.idleY=fr.y;
    const quieta=f.g&&f.g.fre===fr&&desplazamiento<Math.max(.07,dt*4)&&!fr.atrapada&&!(fr.daze>0)&&!(fr.cool>0)&&!s.gira&&!(s.mareo>0)&&!f.g.win;
    s.idleTiempo=quieta?(s.idleTiempo||0)+dt:0;
    const fase=s.idleTiempo-3, ciclo=fase>=0?fase%8.5:-1;
    if(ciclo>=0&&ciclo<1.6&&idleOcaso.complete&&idleOcaso.naturalWidth===1024&&idleOcaso.naturalHeight===512){
      const cuadro=Math.min(7,Math.floor(ciclo/.2)), lado=26*256/220;
      c.save();c.translate(fr.x,fr.y);c.rotate(s.rot);c.scale(giro,1);c.imageSmoothingEnabled=true;
      c.drawImage(idleOcaso,(cuadro%4)*256,Math.floor(cuadro/4)*256,256,256,-lado/2,-lado/2,lado,lado);c.restore();return;
    }
    c.save(); chispasYMareo(c,s,fr,t,false); c.restore();
    c.save(); c.translate(fr.x,fr.y+Math.sin(t*2)*.45); c.rotate(s.rot); c.scale(giro,1); c.imageSmoothingEnabled=true; c.imageSmoothingQuality='high';
    c.drawImage(hojaFlota,q*FLOTA.w,0,FLOTA.w,FLOTA.h,-ancho*.5,-alto*.55,ancho,alto);
    c.restore();
  }
  function instalar(st){
    if(!st||typeof st.fresita!=='function'||envolturas.has(st.fresita))return;
    const anterior=st.fresita;
    const envoltura=function(c,fr,f){
      const id=String(window.estiloArteDerivado||(f.st&&f.st.id)||st.id||'').split('~')[0],im=imagen(id);
      if(id==='ocaso'&&hojaFlota.complete&&hojaFlota.naturalWidth)return dibujaFlota(c,fr,f);
      if(im)return dibuja(c,fr,f,im,id);
      return anterior(c,fr,f);
    };
    envolturas.set(envoltura,true);st.fresita=envoltura;
  }
  for(const id of Object.keys(STYLE_MAP))instalar(STYLE_MAP[id]);
  GANCHOS.en('aplicaElegido', anterior => function(id,k=0){const nombre=anterior(id,k);for(const key of Object.keys(STYLE_MAP))instalar(STYLE_MAP[key]);return nombre;});
})();

// Fresita elegida para el mundo de pixel art de 16 bits.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/fresita-pixel16.png');
  const idle = imgPerezosa('../Roguelike/assets/forge/fresita/pixel-idle-bostezo-v1/sheet-transparent.png');
  const reposos = new WeakMap();
  const anterior=STYLE_MAP.pixel.fresita;
  let base=null, animada=null;
  function dibujar(c,fr,f){
    const derivado=String(window.estiloArteDerivado||'').split('~')[0];
    if((derivado&&derivado!=='pixel')||!sprite.complete||!sprite.naturalWidth)return anterior(c,fr,f);
    const t=f.t||0,ancho=38,alto=ancho*sprite.naturalHeight/sprite.naturalWidth;
    let estado=reposos.get(fr);
    if(!estado){estado={t,x:fr.x,y:fr.y,quieto:0};reposos.set(fr,estado);}
    const dt=Math.max(0,Math.min(.05,t-estado.t)), desplazamiento=Math.hypot(fr.x-estado.x,fr.y-estado.y);
    estado.t=t;estado.x=fr.x;estado.y=fr.y;
    const quieta=f.g&&f.g.fre===fr&&desplazamiento<.07&&!fr.atrapada&&!(fr.daze>0)&&!(fr.cool>0)&&!fr.feliz&&!f.g.win;
    estado.quieto=quieta?estado.quieto+dt:0;
    const fase=estado.quieto-3,ciclo=fase>=0?fase%8.5:-1;
    if(ciclo>=0&&ciclo<1.6&&idle.complete&&idle.naturalWidth===1024&&idle.naturalHeight===512){
      const cuadro=Math.min(7,Math.floor(ciclo/.2)),lado=25*256/216;
      c.save();c.translate(fr.x,fr.y);c.scale((fr.face||1)>0?-1:1,1);c.imageSmoothingEnabled=false;
      c.drawImage(idle,(cuadro%4)*256,Math.floor(cuadro/4)*256,256,256,-lado/2,-lado/2,lado,lado);c.restore();return;
    }
    c.save();c.translate(fr.x,fr.y+Math.sin(t*2)*.45);
    // La referencia mira a la izquierda; se invierte cuando avanza a la derecha.
    c.scale((fr.face||1)>0?-1:1,1);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
    // Preparar las franjas en una cuadrícula entera evita líneas visibles
    // al dibujar el personaje a la resolución de pixel del mundo.
    if(!base){base=document.createElement('canvas');base.width=180;base.height=90;const b=base.getContext('2d');b.imageSmoothingEnabled=true;b.imageSmoothingQuality='high';{let w=sprite.naturalWidth,h=sprite.naturalHeight,fu=sprite;while(w>360){const q=document.createElement('canvas');q.width=w=Math.ceil(w/2);q.height=h=Math.ceil(h/2);const x=q.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(fu,0,0,w,h);fu=q;}b.drawImage(fu,0,0,180,90);}animada=document.createElement('canvas');animada.width=180;animada.height=100;}
    const a=animada.getContext('2d');a.clearRect(0,0,180,100);a.imageSmoothingEnabled=false;
    for(let i=0;i<36;i++){
      const u=(i+.5)/36,onda=Math.round(Math.sin(t*4.2-u*5)*u*u*5);
      a.drawImage(base,i*5,0,5,90,i*5,5+onda,5,90);
    }
    c.drawImage(animada,-ancho*.45,-alto*.5-alto*5/90,ancho,alto*100/90);
    c.restore();
  }
  function instalar(id){if(id==='pixel'&&STYLE_MAP.pixel)STYLE_MAP.pixel.fresita=dibujar;}
  instalar('pixel');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();
