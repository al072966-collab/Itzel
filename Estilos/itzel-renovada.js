'use strict';
// Itzel: la ilustración como títere. Corre, salta, cae, nada, se impulsa, se agacha, se lastima y festeja;
// el pelo y la falda siguen su movimiento con resortes. Las medidas de cada dibujo vienen en D.rig.
window.hazItzel = D => {
  const { carga, listo, pon, gira, estado, muelle, suave, renglones, enPixel, esPixel, malla, prepara } = TITERE;
  const G = Object.assign({ CAD: [720, 800], CINTURA: [735, 690], CUELLO: [700, 455], HOMBRO_N: [606, 536], CODO_N: [476, 790], HOMBRO_F: [825, 628], CODO_F: [912, 805], CAD_N: [616, 830], CAD_F: [770, 830], TOB_N: [515, 1262], TOB_F: [748, 1258], orilla: 1165, alto: 1325, quieto: 88, mechones: {} }, D.rig);
  const { CAD, CINTURA, CUELLO, HOMBRO_N, CODO_N, HOMBRO_F, CODO_F, CAD_N, CAD_F, TOB_N, TOB_F } = G;
  const ALTO = 25, E = ALTO / G.alto, T = carga(D), [PX, PY] = D.pies, ESTADOS = new WeakMap();
  // la rodilla queda escondida bajo la falda, un poco arriba de la orilla
  const rodilla = (H, t) => [lerp(H[0], t[0], .52), lerp(H[1], t[1], .52)], ROD_N = rodilla(CAD_N, TOB_N), ROD_F = rodilla(CAD_F, TOB_F);
  const M = D.mallas; for (const k in M) prepara(M[k]);
  const largoHasta = (m, P) => { let d = 0, mejor = 1e9, sal = 0; m.n.forEach((p, i) => { if (i) d += Math.hypot(p[0] - m.n[i - 1][0], p[1] - m.n[i - 1][1]); const e = Math.hypot(p[0] - P[0], p[1] - P[1]); if (e < mejor) { mejor = e; sal = d; } }); return sal; };
  const CODOS = { brazoN: largoHasta(M.brazoN, CODO_N), brazoF: largoHasta(M.brazoF, CODO_F) };
  const hebra = m => ({ th: new Array(m.n.length).fill(0), tv: new Array(m.n.length).fill(0) }), TRENZA = M.trenza, MECHONES = Object.keys(G.mechones);
  const nuevo = () => ({ fase: Math.random(), ...(TRENZA ? hebra(TRENZA) : {}), pelo: Object.fromEntries(MECHONES.map(k => [k, hebra(M[k])])), vista: 0, pvx: 0, pvy: 0, cara: 1, parpadeo: 2 + Math.random() * 3, herida: 0, inv: 0 });
  // pierna de dos huesos: el muslo va bajo la falda y la rodilla siempre dobla hacia adelante. La espinilla conserva su
  // largo, así que al levantar el pie la pierna se dobla en vez de encogerse
  // el muslo va de la cadera a la rodilla y solo se ve cuando la falda se alza. Se pinta (no sale del dibujo, que no lo
  // tiene): piel con su sombra hacia atrás y contorno a los lados; la espinilla se funde encima en la rodilla
  const MUSLO = { N: [88, 76, 1], F: [76, 64, .88] }; // ancho en la cadera, ancho en la rodilla, luz
  function musloV(c, x0, y0, kx, ky, lado) {
    const [w0, w1, luz] = MUSLO[lado], L = Math.hypot(kx - x0, ky - y0) + 4, a = w0 / 2, b = w1 / 2;
    c.save(); c.translate(x0, y0); c.rotate(Math.atan2(ky - y0, kx - x0));
    const g = c.createLinearGradient(0, -a, 0, a), tono = (r, gg, bb) => `rgb(${r * luz | 0},${gg * luz | 0},${bb * luz | 0})`;
    g.addColorStop(0, tono(222, 146, 92)); g.addColorStop(.45, tono(204, 124, 72)); g.addColorStop(1, tono(160, 88, 50));
    c.beginPath(); c.moveTo(-8, -a); c.quadraticCurveTo(L * .5, -(a + b) / 2 - 3, L, -b); c.arc(L, 0, b, -Math.PI / 2, Math.PI / 2); c.quadraticCurveTo(L * .5, (a + b) / 2 + 3, -8, a); c.closePath();
    c.fillStyle = g; c.fill();
    c.strokeStyle = '#2b1712'; c.lineWidth = 4.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-8, -a); c.quadraticCurveTo(L * .5, -(a + b) / 2 - 3, L, -b); c.moveTo(-8, a); c.quadraticCurveTo(L * .5, (a + b) / 2 + 3, L, b); c.stroke();
    c.restore();
  }
  function pierna(c, n, m, H, rod, tob, pie, bote, inclPie, muslo) {
    const hy = H[1] + bote, l1 = Math.hypot(rod[0] - H[0], rod[1] - H[1]), l2 = Math.hypot(tob[0] - rod[0], tob[1] - rod[1]); let dx = pie[0] - H[0], dy = pie[1] - hy; const d0 = Math.hypot(dx, dy) || 1, d = clamp(d0, Math.abs(l1 - l2) + 40, l1 + l2 - .5); dx *= d / d0; dy *= d / d0;
    const a = Math.atan2(dy, dx) - Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), kx = H[0] + Math.cos(a) * l1, ky = hy + Math.sin(a) * l1, ax = H[0] + dx, ay = hy + dy, rot = Math.atan2(ay - ky, ax - kx) - Math.atan2(tob[1] - rod[1], tob[0] - rod[0]);
    if (muslo) musloV(c, H[0], hy, kx, ky, muslo);
    c.save(); c.translate(kx, ky); c.rotate(rot); c.translate(-rod[0], -rod[1]); pon(c, T, n); c.restore();
    c.save(); c.translate(ax - tob[0], ay - tob[1]); gira(c, tob[0], tob[1], inclPie); pon(c, T, m); c.restore();
  }
  // el brazo se dobla poco a poco alrededor del codo, como un brazo y no como una bisagra
  // los brazos del dibujo son muy delgados para moverse: brazo y antebrazo van bastante más llenos y la mano casi igual
  const GROSOR = u => u < .5 ? 1.34 : u < .7 ? lerp(1.34, 1.1, (u - .5) / .2) : 1.1;
  function brazo(c, n, h, ang, ang2, manga) {
    const m = M[n], Q = [], sa = Math.sin(ang), ca = Math.cos(ang), p0 = m.n[0]; let x = h[0] + (p0[0] - h[0]) * ca - (p0[1] - h[1]) * sa, y = h[1] + (p0[0] - h[0]) * sa + (p0[1] - h[1]) * ca, d = 0; Q.push([x, y]);
    for (let i = 1; i < m.n.length; i++) {
      const ax = m.n[i][0] - m.n[i - 1][0], ay = m.n[i][1] - m.n[i - 1][1], l = Math.hypot(ax, ay), u = clamp((d + l / 2 - CODOS[n] + 30) / 44, 0, 1), b = ang + ang2 * u * u * (3 - 2 * u), sb = Math.sin(b), cb = Math.cos(b);
      d += l; x += ax * cb - ay * sb; y += ax * sb + ay * cb; Q.push([x, y]);
    }
    malla(c, T, n, m, Q, GROSOR);
    if (manga) { c.save(); gira(c, h[0], h[1], ang * .62); pon(c, T, manga); c.restore(); }
  }
  // un paso, como se camina de verdad: el pie se queda plano en el piso mientras el cuerpo pasa encima, despega con la
  // punta, se adelanta bajito y aterriza de talón. fase de 0 a 1; apoya el 62% del tiempo
  function paso(fase, amp, alto) {
    if (fase < .62) { const u = fase / .62, talon = clamp((u - .78) / .22, 0, 1); return [amp * (1 - 2 * u), -talon * 16, talon * .26]; }
    const u = (fase - .62) / .38, e = u * u * (3 - 2 * u); return [amp * (2 * e - 1), -Math.sin(Math.PI * u) * alto - (1 - u) * 16, lerp(.26, -.08, e)];
  }
  function arma(c, p, f, s) {
    const t = f.t || 0, g = f.g, dt = s.dt, env = g && g.env, vx = p.vx || 0, vy = p.vy || 0, sp = Math.abs(vx), dash = p.dash > 0, nada = !!(env && env.swim), aire = p.on === false && !nada, gana = !!(g && g.win), agacha = !!p.crouch;
    // Secuencia larga de espera para la Itzel principal. Se dibuja con
    // el mismo títere a cada cuadro, sin sustituir su cara ni su ropa.
    const puedeEsperar = D === (TITERES_DATOS.itzelCorto || TITERES_DATOS.itzel) && g && (g.p === p || f.enciclopedia) && p.on !== false && sp < 3 && Math.abs(vy) < 3 && !dash && !nada && !gana && !agacha && !(p.inv > 0) && !(p.sq > .1);
    s.esperaFalda = puedeEsperar ? (s.esperaFalda || 0) + dt : 0;
    const faseEspera = s.esperaFalda > 1.2 ? (s.esperaFalda - 1.2) % 16 : -1;
    const gesto = (inicio, fin) => faseEspera >= inicio && faseEspera < fin ? Math.sin(Math.PI * (faseEspera - inicio) / (fin - inicio)) ** 2 : 0;
    const gestoFalda = gesto(0, 3.0), cambiaPeso = gesto(4.1, 6.8), estiraIdle = gesto(8, 10.8), mira = gesto(12, 14.6);
    // poses que se mezclan
    if ((p.inv || 0) > s.inv + .2) s.herida = .55; s.inv = p.inv || 0; s.herida = Math.max(0, s.herida - dt);
    const corre = suave(s, 'kc', !aire && !nada ? clamp(sp / 118, 0, 1) : 0, 13), kAire = suave(s, 'ka', aire ? 1 : 0, 14), sube = suave(s, 'ks', clamp(-vy / 330, -1, 1), 10), kNada = suave(s, 'kn', nada ? 1 : 0, 6), kDash = suave(s, 'kd', dash ? 1 : 0, 24), kHer = suave(s, 'kh', s.herida > 0 ? 1 : 0, 18), kAg = suave(s, 'kg', agacha ? 1 : 0, 12), kGana = suave(s, 'kw', gana ? 1 : 0, 7);
    s.fase = (s.fase + sp * dt * .0146) % 1; const ph = s.fase * 6.28318, resp = Math.sin(t * 2.1), mece = Math.sin(t * 1.3), frente = Math.cos(ph - .4); // frente: 1 cuando el pie de enfrente va adelante; los brazos van al revés y un poco después
    const lleva = suave(s, 'lv', clamp(sp / 140, 0, 1), 8);
    // ---- pies: dónde está cada uno, respecto a donde pisa en reposo
    const pn = paso(s.fase, 104 * corre, 70 * corre), pf = paso((s.fase + .5) % 1, 104 * corre, 70 * corre), sb = sube > 0 ? 1 : 0, K = 1 - corre, nadaP = Math.sin(t * 8) * 90 * kNada;
    const piN = [TOB_N[0] + G.quieto + cambiaPeso * 25 + corre * 48 + pn[0] + kAire * K * (sb ? 170 : 70) + kDash * 165 - kAg * 40 + kNada * 130 + nadaP, TOB_N[1] + pn[1] - kAire * K * (sb ? 210 : 70) - kDash * 110 - kNada * 90];
    const piF = [TOB_F[0] - cambiaPeso * 12 - corre * 14 + pf[0] + kAire * K * (sb ? -110 : -150) - kDash * 190 + kAg * 60 - kNada * 150 - nadaP, TOB_F[1] + pf[1] - kAire * K * (sb ? 90 : 130) - kDash * 60 - kNada * 60];
    const inclN = cambiaPeso * .08 + pn[2] * corre + kAire * K * (sb ? -.2 : .5) - kDash * .3, inclF = pf[2] * corre + kAire * K * .45 + kDash * .3;
    // ---- tronco
    const cae = suave(s, 'kl', !aire ? Math.max(0, p.sq || 0) : 0, 22), bote = (11 + Math.cos(ph * 2) * 7) * corre + resp * 3 * (1 - corre) + cae * 190 + kAg * 118 - (gana ? Math.abs(Math.sin(t * 7)) * 90 : 0); // lo más bajo es al pisar y lo más alto cuando el pie pasa bajo el cuerpo
    const inclina = muelle(s, 'inc', corre * .075 + kDash * .36 + kAire * (sube > 0 ? -.05 : .07) + kNada * .5 + kAg * .28 - kHer * .34, 90, 12), balanceo = Math.cos(ph) * .018 * corre + mece * .012 * (1 - corre);
    // ---- brazos
    let bN = frente * .22 * corre + resp * .018 + mece * .012 * (1 - corre) + corre * .05 + cae * .5, bF = -frente * .22 * corre - resp * .018 - mece * .012 * (1 - corre) - corre * .04 - cae * .5, cN = -(.1 + (.12 + .12 * Math.max(0, -frente)) * corre), cF = -(.08 + (.12 + .12 * Math.max(0, frente)) * corre); // el codo se dobla más cuando el brazo va hacia adelante
    // al subir, el brazo de enfrente se queda atrás y el otro jala hacia arriba; al caer, los dos se abren para equilibrarse
    // en el aire los brazos se abren para equilibrarse, sin estirarse como palitos: los codos van doblados
    if (kAire > .01) { const u = (sube + 1) / 2, ale = Math.sin(t * 11) * .06 * (1 - u); bN = lerp(bN, lerp(.6, .36, u) + ale, kAire); bF = lerp(bF, lerp(-.66, -.95, u) - ale, kAire); cN = lerp(cN, lerp(-.7, -.8, u), kAire); cF = lerp(cF, lerp(-.72, -.85, u), kAire); }
    if (kNada > .01) { const br = Math.sin(t * 4.4); bN = lerp(bN, 1.3 + br * .9, kNada); bF = lerp(bF, -1.3 + br * .9, kNada); }
    bN = lerp(bN, 1, kDash); bF = lerp(bF, .9, kDash); bN = lerp(bN, 1.3, kHer); bF = lerp(bF, -1.3, kHer); bN = lerp(bN, 2.3 + Math.sin(t * 8) * .22, kGana); bF = lerp(bF, -2.3 - Math.sin(t * 8) * .22, kGana);
    bN -= gestoFalda * .40 + estiraIdle * .28; cN += gestoFalda * .35 - estiraIdle * .20; bF += gestoFalda * .12 + estiraIdle * .22; cF -= estiraIdle * .16;
    bN = muelle(s, 'bn', bN, 90, 16); bF = muelle(s, 'bf', bF, 90, 16); cN = muelle(s, 'cn', cN, 70, 14); cF = muelle(s, 'cf', cF, 70, 14); // el brazo cuelga: llega un poco tarde y se asienta
    // ---- falda
    // la falda en el aire: al subir la tela se queda abajo y se cierra contra las piernas; al caer se infla como paraguas;
    // al aterrizar rebota. Los resortes son flojos para que la tela llegue tarde y se pase un poco
    // cuánto se alza depende del salto: la velocidad al caer y cuánto tiempo lleva en el aire. Un brinquito apenas la mueve;
    // una caída larga la infla como paraguas. Al subir, la tela se queda abajo y se cierra contra las piernas
    s.tAire = aire ? (s.tAire || 0) + dt : 0;
    const cae2 = kAire * clamp(vy / 430, 0, 1.3) * (.5 + .5 * clamp(s.tAire / .55, 0, 1)), sube2 = kAire * clamp(-vy / 430, 0, 1.4), aireV = cae2 - sube2;
    const vuelo = muelle(s, 'vue', -lleva * 30 - kDash * 70 - kAire * clamp(vx * (p.face || 1) / 132, -1, 1) * 30, 46, 6);
    // infla: crece rápido al principio y se satura, para que una caída larga sea una campana y no un plato
    const infla = 1 - Math.exp(-cae2 * 1.35);
    const abre = muelle(s, 'abr', .03 * corre + infla * .5 - sube2 * .14 + kNada * .2 + kDash * .12 - cae * .06, 44, 7);
    const alza = muelle(s, 'alz', infla * .3 - sube2 * .05, 46, 7.5), estira = muelle(s, 'est', 1 + sube2 * .1 - infla * .05 + cae * .04, 60, 7.5);
    const largo = v => v * estira - clamp(alza, -.04, .32) * v * v;
    const aleteo = kAire * (8 + infla * 30 + sube2 * 10) + kNada * 10;

    // -------------------- dibujo --------------------
    // ---- trenza: pesa. Cada tramo tiene un resorte suave hacia su forma y sigue al de arriba con retraso, así la onda baja por el pelo
    const lean = inclina + balanceo + cambiaPeso * .025 - estiraIdle * .015, cabeza = gestoFalda * .10 + mira * .11 - estiraIdle * .035 - inclina * .5 + kHer * .2 + (Math.sin(t * .9) * .022 + Math.sin(t * .37 + 1) * .02) * (1 - corre) + Math.cos(ph * 2) * .01 * corre + (kAire * (sube > 0 ? -.08 : .08)) + cae * .16;
    const local = vx * (p.face || 1), acX = dt ? clamp((local - s.pvx) / dt, -2600, 2600) : 0; s.pvx = local;
    if ((p.face || 1) !== s.cara) { s.cara = p.face || 1; if (TRENZA) for (let i = 0; i < s.tv.length; i++) s.tv[i] -= .22; for (const k of MECHONES) { const e = s.pelo[k]; for (let i = 0; i < e.tv.length; i++) e.tv[i] -= .5; } } // al voltearse, el pelo tarda en alcanzarla
    const sc = Math.sin(lean), cc = Math.cos(lean), sh = Math.sin(cabeza), ch = Math.cos(cabeza);
    if (TRENZA) {
      const P = TRENZA.n, n = P.length, RAIZ = 3, arrastre = clamp(local / 132, -1.2, 1.4) * .021 + kDash * .012 + clamp(vy / 420, -1, 1) * (vy > 0 ? .019 : .007) * kAire + kNada * (.016 + Math.sin(t * 1.4) * .01);
      if (dt) { const pasos = Math.max(1, Math.round(dt * 120)), h = dt / pasos; for (let k = 0; k < pasos; k++) for (let i = RAIZ; i < n; i++) {
        const u = i / (n - 1), meta = arrastre * (.55 + .9 * u) + Math.sin(t * 1.5 - u * 2.6) * .0032 + Math.cos(ph * 2 - u * 3) * .0022 * corre, resorte = (meta - s.th[i]) * (58 - 20 * u), sigue = i > RAIZ ? (s.th[i - 1] - s.th[i]) * 24 : 0;
        s.tv[i] += (resorte + sigue + acX * .0005 - s.tv[i] * 8.5) * h; s.th[i] += s.tv[i] * h;
      } }
      const reposo = q => { let x = q[0], y = q[1], dx = x - CUELLO[0], dy = y - CUELLO[1]; x = CUELLO[0] + dx * ch - dy * sh; y = CUELLO[1] + dx * sh + dy * ch; dx = x - CAD[0]; dy = y - CAD[1]; return [CAD[0] + dx * cc - dy * sc, CAD[1] + dx * sc + dy * cc + bote]; };
      const Q = []; let giro = lean + cabeza; for (let i = 0; i < n; i++) {
        if (i < RAIZ) { Q.push(reposo(P[i])); continue; } giro += s.th[i]; const ax = P[i][0] - P[i - 1][0], ay = P[i][1] - P[i - 1][1], sg = Math.sin(giro), cg = Math.cos(giro), b = Q[i - 1]; Q.push([b[0] + ax * cg - ay * sg, b[1] + ax * sg + ay * cg]);
      }
      malla(c, T, 'trenza', TRENZA, Q);
    }
    c.translate(0, bote);
    // brazo de atrás
    c.save(); gira(c, CAD[0], CAD[1], lean); brazo(c, 'brazoF', HOMBRO_F, bF, cF); c.restore();
    // forro, piernas y falda: la tela de adelante cae sobre las piernas
    const ola = u => [(vuelo + gestoFalda * 30 * Math.sin(t * 2.2)) * u * u + Math.sin(ph - .6 - u * 2.4) * u * u * 13 * corre + Math.sin(t * (2.2 + kAire * 6) - u * 3.4) * u * u * (5 + aleteo), 1 + abre * u + Math.sin(t * (1.9 + kAire * 9) - u * 4) * u * (.008 + kAire * .025 + infla * .035)];
    c.save(); gira(c, CINTURA[0], CINTURA[1], inclina * .45 + balanceo * .5); renglones(c, T, 'faldaAtras', CINTURA[0], CINTURA[1], G.orilla, 8, ola, largo); c.restore();
    c.save(); c.translate(0, -bote); pierna(c, 'piernaF', 'pieF', CAD_F, ROD_F, TOB_F, piF, bote, inclF, 'F'); pierna(c, 'piernaN', 'pieN', CAD_N, ROD_N, TOB_N, piN, bote, inclN, 'N'); c.restore();
    c.save(); gira(c, CINTURA[0], CINTURA[1], inclina * .45 + balanceo * .5); renglones(c, T, 'falda', CINTURA[0], CINTURA[1], G.orilla, 18, ola, largo); c.restore();
    // tronco, brazo de enfrente y cabeza
    gira(c, CAD[0], CAD[1], lean); pon(c, T, 'cuerpo'); brazo(c, 'brazoN', HOMBRO_N, bN, cN, 'mangaN');
    gira(c, CUELLO[0], CUELLO[1], cabeza);
    // mechones: pelo corto, se mueve poco y rápido: se va atrás al correr, se levanta al caer y rebota con cada paso
    for (const k of MECHONES) {
      const [peso, lado] = G.mechones[k], m = M[k], e = s.pelo[k], n = m.n.length, caida = clamp(vy / 420, -1, 1) * kAire;
      const meta = u => (clamp(local / 132, -1.2, 1.4) * .026 + kDash * .03 + caida * lado * (vy > 0 ? .05 : .018) + kNada * lado * .03 + Math.cos(ph * 2 - .9 - u * 1.6) * .018 * corre + Math.sin(t * 1.5 + peso * 3 - u * 2) * .006) * peso * (.5 + u);
      if (dt) { const pasos = Math.max(1, Math.round(dt * 120)), h = dt / pasos; for (let q = 0; q < pasos; q++) for (let i = 2; i < n; i++) { const u = i / (n - 1); e.tv[i] += ((meta(u) - e.th[i]) * 96 + (i > 2 ? (e.th[i - 1] - e.th[i]) * 30 : 0) + acX * .0009 - e.tv[i] * 10) * h; e.th[i] += e.tv[i] * h; } }
      const Q = [m.n[0], m.n[1]]; let giro = 0; for (let i = 2; i < n; i++) { giro += e.th[i]; const ax = m.n[i][0] - m.n[i - 1][0], ay = m.n[i][1] - m.n[i - 1][1], sg = Math.sin(giro), cg = Math.cos(giro), b = Q[i - 1]; Q.push([b[0] + ax * cg - ay * sg, b[1] + ax * sg + ay * cg]); }
      malla(c, T, k, m, Q);
    }
    pon(c, T, 'cabeza');
    s.parpadeo -= dt; if (s.parpadeo < -.12) s.parpadeo = 1.8 + Math.random() * 3.6;
    if (T.q.parpados && (s.parpadeo < 0 || s.herida > 0 || p.dormida)) pon(c, T, 'parpados');
  }
  function nuevaItzel(c, p, f) {
    if (!listo(T)) return; const s = estado(p, f, nuevo, ESTADOS), sq = p.sq || 0, cara = p.face || 1; if (!s.vista) s.vista = cara; s.vista += (cara - s.vista) * Math.min(1, s.dt * 22); const giro = (s.vista < 0 ? -1 : 1) * Math.max(.34, Math.abs(s.vista)); // al voltearse da media vuelta en vez de cambiar de golpe
    const ajusta = q => { q.translate(p.x, p.y); q.scale(giro * E * (1 + Math.min(0, sq) * .4), E * (1 - Math.min(0, sq) * .4)); q.translate(-PX, -PY); arma(q, p, f, s); };
    if (esPixel(f)) { enPixel(c, p.x, p.y + 3, 62, 44, Math.max(1, Math.round(f.S || 1)), q => { q.save(); ajusta(q); q.restore(); }); return; }
    c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; ajusta(c); c.restore();
  }
  return nuevaItzel;
};
// En qué mundos sale la Itzel ilustrada (el títere). En los demás sale la Itzel propia de ese estilo (personajes.js y
// sus diseños en elegidos.js), que va con su dibujo: así no se le ponen filtros encima a la ilustración de anime.
// Cuando haya una ilustración nueva para un mundo, se agrega aquí con su títere.
window.TITERE_MUNDOS = new Set(['anime']);
(() => {
  const nuevaItzel = hazItzel(TITERES_DATOS.itzelCorto || TITERES_DATOS.itzel);
  function instalar(id) { if (!TITERE_MUNDOS.has(id)) return; const st = STYLE_MAP[id]; if (!st) return; const base = st.base && STYLE_MAP[st.base]; if (base) base.player = nuevaItzel; else st.player = nuevaItzel; }
  for (const id of Object.keys(STYLE_MAP)) instalar(id);
  GANCHOS.en('aplicaElegido', anterior => function (id, k = 0) { const nombre = anterior(id, k); instalar(id); return nombre; });
})();

// Itzel propia del mundo de 16 bits: diseño 5, sin repintar la versión de anime.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-pixel16-opcion5.png');
  const anteriorPixel = STYLE_MAP.pixel.player;
  function itzelPixel16(c, p, f) {
    // el dibujo grande reducido salía como una mancha: en el mundo de 16 bits va la Itzel pintada píxel por píxel (nítida, y la misma quieta o corriendo)
    if (!window.ITZEL_PIXEL_GRANDE) return anteriorPixel(c, p, f);
    if (!sprite.complete || !sprite.naturalWidth) return anteriorPixel(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anteriorPixel(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, t=f.t||0;
    const bote = corre ? -Math.abs(paso)*.22 : 0;
    // Coordenadas de las piezas en el dibujo original. Las máscaras son
    // excluyentes: al mover un brazo no queda otro debajo.
    const sx=300, sy=150, sw=570, sh=990, e=22/sh;
    const brazos=[[[322,704],[397,625],[449,622],[484,659],[436,734],[420,802],[335,809],[316,773]],[[660,646],[696,635],[720,680],[786,724],[802,790],[775,810],[719,793],[679,746]]];
    function traza(q,pts){q.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)q.lineTo(pts[i][0],pts[i][1]);q.closePath();}
    function capa(y0,y1,transformar){
      c.save();if(transformar)transformar();c.beginPath();c.rect(sx,y0,sw,y1-y0);c.clip();c.beginPath();c.rect(0,0,sprite.width,sprite.height);for(const a of brazos)traza(c,a);c.clip('evenodd');c.drawImage(sprite,0,0);c.restore();
    }
    c.save();c.translate(p.x,p.y);c.scale((p.face||1)<0?-e:e,e);c.translate(-585,-1140+bote/e);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
    // Piernas separadas, debajo de la falda. Un paso corto mantiene el apoyo.
    for(let k=0;k<2;k++){const x0=k?570:sx,w=k?300:270,des=(k?1:-1)*(aire?7:paso*12);c.save();c.translate(des,aire?-4:(k?Math.max(0,-paso):Math.max(0,paso))*-8);c.drawImage(sprite,x0,950,w,190,x0,950,w,190);c.restore();}
    capa(720,950,()=>{c.translate(585,720);c.transform(1,0,corre?paso*.025:aire?.025:Math.sin(t*2)*.006,1,0,0);c.translate(-585,-720);});
    capa(sy,720);
    for(let k=0;k<2;k++){const pts=brazos[k],px=k?690:430,py=k?665:650,ang=corre?(k?-1:1)*paso*.18:aire?(k?.14:-.14):Math.sin(t*2+k)*.012;c.save();c.translate(px,py);c.rotate(ang);c.translate(-px,-py);c.beginPath();traza(c,pts);c.clip();c.drawImage(sprite,0,0);c.restore();}
    // Un parpadeo breve cubre el ojo en lugar de superponer otra cara.
    if(t%3.2<.24){c.fillStyle='#e58a44';c.fillRect(590,418,75,85);c.fillStyle='#241416';c.fillRect(590,415,66,10);c.fillRect(597,466,48,9);}
    c.restore();
  }
  function instalarPixel16(id) { if (id === 'pixel' && STYLE_MAP.pixel) STYLE_MAP.pixel.player = itzelPixel16; }
  instalarPixel16('pixel');
  GANCHOS.en('aplicaElegido', previo => function (id, k=0) { const nombre=previo(id,k); instalarPixel16(id); return nombre; });
})();

// Diseño propio de Itzel para el atardecer: silueta bordada en luz.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-ocaso-opcion1.png');
  const anteriorOcaso = STYLE_MAP.ocaso.player;
  function itzelOcaso(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anteriorOcaso(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anteriorOcaso(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.55 : Math.sin((f.t||0)*2)*.12;
    const sx=220, sy=75, sw=650, sh=1245, corte=1015, mitad=330;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // El torso y cada pierna ocupan regiones exclusivas del dibujo.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.65:paso*.9, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.45),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.45),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='ocaso'&&STYLE_MAP.ocaso) STYLE_MAP.ocaso.player=itzelOcaso; }
  instalar('ocaso');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel de plastilina, creada para el estilo barro.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-plastilina-opcion2.png');
  const anterior = STYLE_MAP.barro.player;
  function itzelPlastilina(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=130, sy=20, sw=800, sh=1395, corte=1170, mitad=435;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // Torso y piernas ocupan regiones exclusivas para no duplicar partes.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='barro'&&STYLE_MAP.barro) STYLE_MAP.barro.player=itzelPlastilina; }
  instalar('barro');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel de papel recortado: la opción 1 tiene ilustración propia.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-papel-opcion1.png');
  const anteriorPapel = STYLE_MAP.paper.player;
  function itzelPapel(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anteriorPapel(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anteriorPapel(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=145, sy=25, sw=790, sh=1405, corte=1145, mitad=390;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // Cada parte se dibuja una sola vez: el torso y las dos piernas no se solapan.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='paper'&&STYLE_MAP.paper) STYLE_MAP.paper.player=itzelPapel; }
  instalar('paper');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel del bosque bioluminiscente: vestido oscuro con bordados de luz.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-biolum-opcion2.png');
  const anterior = STYLE_MAP.biolum.player;
  function itzelBiolum(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=235, sy=20, sw=700, sh=1270, corte=1020, mitad=350;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // Las regiones del torso y de las piernas son exclusivas; no se duplican.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='biolum'&&STYLE_MAP.biolum) STYLE_MAP.biolum.player=itzelBiolum; }
  instalar('biolum');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Diseño geométrico propio de Itzel, elegido para este mundo.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-geometrico-opcion3.png');
  const anterior = STYLE_MAP.flat.player;
  function itzelGeometrica(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=195, sy=100, sw=695, sh=1270, corte=1080, mitad=355;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // Separar torso y piernas sin volver a pintar la misma región.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='flat'&&STYLE_MAP.flat) STYLE_MAP.flat.player=itzelGeometrica; }
  instalar('flat');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel de tinta sumi-e: trazos propios y cinta roja al viento.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-sumie-opcion5.png');
  const anterior = STYLE_MAP.sumie.player;
  function itzelSumie(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=150, sy=10, sw=850, sh=1280, corte=1040, mitad=500;
    const escala=21/sh, x=-(670-sx)*escala, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // Las piernas se animan desde regiones exclusivas del dibujo.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='sumie'&&STYLE_MAP.sumie) STYLE_MAP.sumie.player=itzelSumie; }
  instalar('sumie');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel para Neón synthwave: vestido morado bordado de luz.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-neon-opcion6.png');
  const anterior = STYLE_MAP.neon.player;
  function itzelNeon(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=190, sy=30, sw=740, sh=1320, corte=1120, mitad=370;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // Torso y piernas se pintan a partir de regiones exclusivas del sprite.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='neon'&&STYLE_MAP.neon) STYLE_MAP.neon.player=itzelNeon; }
  instalar('neon');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel propia para Bruma en blanco y negro.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-bruma-opcion2.png');
  const anterior = STYLE_MAP.bruma.player;
  function itzelBruma(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=250, sy=30, sw=680, sh=1240, corte=1040, mitad=370;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // Cada parte procede de una región exclusiva del sprite.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='bruma'&&STYLE_MAP.bruma) STYLE_MAP.bruma.player=itzelBruma; }
  instalar('bruma');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel de Low poly: diseño propio elegido para este mundo.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-lowpoly-opcion1.png');
  const anterior = STYLE_MAP.lowpoly.player;
  function itzelLowpoly(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=250, sy=35, sw=680, sh=1270, corte=1110, mitad=360;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // Torso y piernas proceden de regiones exclusivas del sprite.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='lowpoly'&&STYLE_MAP.lowpoly) STYLE_MAP.lowpoly.player=itzelLowpoly; }
  instalar('lowpoly');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel propia del mundo Códice maya.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-codice-opcion6.png');
  const anterior = STYLE_MAP.codex.player;
  function itzelCodice(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=200, sy=50, sw=760, sh=1270, corte=1085, mitad=400;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // Las piernas se dibujan desde regiones separadas del torso.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='codex'&&STYLE_MAP.codex) STYLE_MAP.codex.player=itzelCodice; }
  instalar('codex');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel pintada para el mundo de óleo impresionista.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-oleo-opcion4.png');
  const anterior = STYLE_MAP.oleo.player;
  function itzelOleo(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=225, sy=60, sw=670, sh=1280, corte=1080, mitad=365;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // El torso y las piernas ocupan regiones exclusivas del dibujo.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='oleo'&&STYLE_MAP.oleo) STYLE_MAP.oleo.player=itzelOleo; }
  instalar('oleo');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel de vitral con el cabello corto del modelo principal.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-vitral-opcion2.png');
  const anterior = STYLE_MAP.vitral.player;
  function itzelVitral(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=195, sy=30, sw=675, sh=1360, corte=1110, mitad=340;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    if (p.pared) return resbala(c, p, f);
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // Torso y piernas se toman de regiones separadas del sprite.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  // resbalándose por una pared: de espaldas a ella (mira hacia donde Fresita la va a aventar), el torso
  // recargado, la pierna de la pared doblada con el pie apoyado, la otra colgando, y la falda que se alza
  // y se abre porque va bajando. La pared queda del lado de su espalda (+x antes de voltear).
  function resbala(c, p, f) {
    const sx=195, sy=30, sw=675, sh=1360, corte=1110, mitad=340, cintura=680;
    const e=21/sh, x=-sw*e/2, y=-21, t=f.t||0, roce=Math.sin(t*40)*.12, cadera=y+corte*e;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1); c.translate(1.1,0); c.imageSmoothingEnabled=true;
    // las piernas van detrás de la falda: la de la pared doblada hacia ella, la otra suelta
    const pierna=(x0,w,px,ang,dy)=>{ c.save(); c.translate(x+px*e,cadera+dy); c.rotate(ang); c.drawImage(sprite,sx+x0,sy+corte,w,sh-corte,(x0-px)*e,0,w*e,(sh-corte)*e); c.restore(); };
    pierna(mitad,sw-mitad,mitad+(sw-mitad)*.45,-1.2,-.7);
    pierna(0,mitad,mitad*.55,.22+Math.sin(t*9)*.16,-.3);
    // torso recargado: gira un poco desde la cadera hacia la pared
    c.save(); c.translate(0,cadera); c.rotate(.14+roce*.2); c.translate(0,-cadera);
    c.drawImage(sprite,sx,sy,sw,cintura,x,y,sw*e,cintura*e);
    // la falda en rebanadas: entre más abajo, más abierta y más alzada
    const N=14, alto=(corte-cintura)/N;
    for(let i=0;i<N;i++){ const u=(i+.5)/N, ab=1+.24*u*u+Math.sin(t*16+i)*.012, sube=u*u*1.3, y0=cintura+i*alto, cx=sw*.5;
      c.drawImage(sprite,sx,sy+y0,sw,alto+1,(x+cx*e)-cx*e*ab,y+y0*e-sube,sw*e*ab,(alto+1)*e); }
    c.restore();
    c.restore();
  }
  function instalar(id) { if(id==='vitral'&&STYLE_MAP.vitral) STYLE_MAP.vitral.player=itzelVitral; }
  instalar('vitral');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel dibujada para el mundo de cuaderno a lápiz.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-cuaderno-opcion3.png');
  const anterior = STYLE_MAP.cuaderno.player;
  function itzelCuaderno(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=220, sy=50, sw=690, sh=1275, corte=1085, mitad=370;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // El torso y las piernas ocupan regiones exclusivas del dibujo.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='cuaderno'&&STYLE_MAP.cuaderno) STYLE_MAP.cuaderno.player=itzelCuaderno; }
  instalar('cuaderno');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel propia para Grabado en linóleo.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-grabado-opcion6.png');
  const anterior = STYLE_MAP.grabado.player;
  function itzelGrabado(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=105, sy=15, sw=825, sh=1510, corte=1285, mitad=415;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // El torso y las piernas ocupan regiones exclusivas del dibujo.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='grabado'&&STYLE_MAP.grabado) STYLE_MAP.grabado.player=itzelGrabado; }
  instalar('grabado');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel para Art nouveau, con piel acorde al modelo principal.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-nouveau-opcion2.png');
  const anterior = STYLE_MAP.nouveau.player;
  function itzelNouveau(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=250, sy=15, sw=660, sh=1280, corte=1030, mitad=330;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // El torso y las piernas ocupan regiones exclusivas del dibujo.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='nouveau'&&STYLE_MAP.nouveau) STYLE_MAP.nouveau.player=itzelNouveau; }
  instalar('nouveau');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel de Art Déco con bordes geométricos dorados.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-deco-opcion3.png');
  const anterior = STYLE_MAP.deco.player;
  function itzelDeco(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=120, sy=90, sw=740, sh=1365, corte=1160, mitad=400;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // El torso y las piernas ocupan regiones exclusivas del dibujo.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='deco'&&STYLE_MAP.deco) STYLE_MAP.deco.player=itzelDeco; }
  instalar('deco');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel de Cyberpunk lluvioso, con bordados de luz.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-cyber-opcion6.png');
  const anterior = STYLE_MAP.cyber.player;
  function itzelCyber(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=160, sy=20, sw=680, sh=1505, corte=1220, mitad=340;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // Torso y piernas se pintan desde regiones separadas.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='cyber'&&STYLE_MAP.cyber) STYLE_MAP.cyber.player=itzelCyber; }
  instalar('cyber');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel propia del mundo Polígonos cinemáticos.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-cinema-opcion1.png');
  const anterior = STYLE_MAP.cinema.player;
  function itzelCinema(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=130, sy=70, sw=740, sh=1425, corte=1220, mitad=385;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // Las regiones del torso y las piernas no se superponen.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='cinema'&&STYLE_MAP.cinema) STYLE_MAP.cinema.player=itzelCinema; }
  instalar('cinema');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

;

// Itzel propia del Diorama 2.5D, con acabado de maqueta.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-diorama-opcion1.png');
  const anterior = STYLE_MAP.eco.player;
  function itzelDiorama(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=220, sy=15, sw=735, sh=1295, corte=1095, mitad=380;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // Cada región se dibuja una sola vez para evitar piernas duplicadas.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='eco'&&STYLE_MAP.eco) STYLE_MAP.eco.player=itzelDiorama; }
  instalar('eco');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel pintada en amate para el mundo fuego.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-amate-opcion6.png');
  const anterior = STYLE_MAP.fuego.player;
  function itzelAmate(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=140, sy=30, sw=810, sh=1380, corte=1190, mitad=410;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // Torso y piernas ocupan regiones exclusivas para no duplicar partes.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='fuego'&&STYLE_MAP.fuego) STYLE_MAP.fuego.player=itzelAmate; }
  instalar('fuego');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel propia para Cianotipia, en azul de Prusia y blanco.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-cianotipia-opcion1.png');
  const anterior = STYLE_MAP.agua.player;
  function itzelCianotipia(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=130, sy=30, sw=800, sh=1380, corte=1200, mitad=425;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // Torso y piernas proceden de regiones distintas del dibujo.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='agua'&&STYLE_MAP.agua) STYLE_MAP.agua.player=itzelCianotipia; }
  instalar('agua');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel de papel plegado para el mundo Origami.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-origami-opcion6.png');
  const anterior = STYLE_MAP.hielo.player;
  function itzelOrigami(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=130, sy=30, sw=760, sh=1490, corte=1260, mitad=390;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // Torso y piernas ocupan regiones exclusivas para no duplicar partes.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='hielo'&&STYLE_MAP.hielo) STYLE_MAP.hielo.player=itzelOrigami; }
  instalar('hielo');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel de Siluetas de ceniza, con la oreja negra.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-ceniza-opcion1.png');
  const anterior = STYLE_MAP.hollin.player;
  let limpia = null;
  function dibujo() {
    if (!sprite.complete || !sprite.naturalWidth) return null;
    if (!limpia) {
      limpia=document.createElement('canvas');limpia.width=sprite.naturalWidth;limpia.height=sprite.naturalHeight;
      const x=limpia.getContext('2d');x.drawImage(sprite,0,0);
      // La oreja queda del mismo negro que la cara; no añade otra pieza.
      x.fillStyle='#000000';x.beginPath();x.moveTo(350,410);x.lineTo(485,410);x.lineTo(485,520);x.lineTo(350,520);x.closePath();x.fill();
      // Uniformar el negro de la silueta evita que se vea un parche oscuro.
      // (con la página abierta como archivo local el navegador no deja leer los píxeles de una imagen: sin este paso se ve igual de bien y no truena)
      try {
        const datos=x.getImageData(0,0,limpia.width,limpia.height);
        for(let i=0;i<datos.data.length;i+=4) if(datos.data[i+3]>0&&datos.data[i]<35&&datos.data[i+1]<35&&datos.data[i+2]<35) datos.data[i]=datos.data[i+1]=datos.data[i+2]=0;
        x.putImageData(datos,0,0);
      } catch (e) { /* lienzo manchado: se queda sin uniformar el negro */ }
    }
    return limpia;
  }
  function itzelCeniza(c, p, f) {
    const img=dibujo();if (!img) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=145, sy=75, sw=715, sh=1440, corte=1215, mitad=365;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);c.imageSmoothingEnabled=true;
    c.drawImage(img,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(img,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(img,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='hollin'&&STYLE_MAP.hollin) STYLE_MAP.hollin.player=itzelCeniza; }
  instalar('hollin');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel propia del mundo de 8 bits.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-8bits-opcion1.png');
  const anterior = STYLE_MAP.bits8.player;
  function itzel8Bits(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    // corriendo ya no se cambia al dibujo viejo (salía enorme y con otros colores): se anima este mismo, con el paso de las piernas
    const paso = corre ? Math.sin((p.run || 0) * 1.5) : 0;
    const aire = !p.on, bote = corre ? -Math.round(Math.abs(paso)) : 0;
    const sx=180, sy=130, sw=590, sh=1310, corte=1135, mitad=320;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(Math.round(p.x),Math.round(p.y)); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=false;
    // El torso y las piernas ocupan regiones distintas del sprite.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?1:Math.round(paso), h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-1:0),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote,(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='bits8'&&STYLE_MAP.bits8) STYLE_MAP.bits8.player=itzel8Bits; }
  instalar('bits8');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel propia para Acuarela y tinta.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-acuarela-opcion5.png');
  const anterior = STYLE_MAP.acuarela.player;
  function itzelAcuarela(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=125, sy=80, sw=735, sh=1390, corte=1190, mitad=385;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    // Torso y piernas se toman de regiones independientes para evitar duplicaciones.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='acuarela'&&STYLE_MAP.acuarela) STYLE_MAP.acuarela.player=itzelAcuarela; }
  instalar('acuarela');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel propia del mundo de pixel art de 32 bits.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-32bits-opcion5.png');
  const anterior = STYLE_MAP.bits32.player;
  function itzel32Bits(c, p, f) {
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre) return anterior(c, p, f);
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.round(Math.abs(paso)*2)/2 : 0;
    const sx=190, sy=125, sw=610, sh=1320, corte=1160, mitad=320;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(Math.round(p.x*2)/2,Math.round(p.y*2)/2); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=false;
    // El torso y las piernas ocupan regiones separadas del sprite.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.5:Math.round(paso*2)/2, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.5:0),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote,(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='bits32'&&STYLE_MAP.bits32) STYLE_MAP.bits32.player=itzel32Bits; }
  instalar('bits32');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();

// Itzel elegida para Pixel art de 64 bits.
(() => {
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-64bits-opcion1.png');
  const anterior=STYLE_MAP.bits64.player;
  function dibujar(c,p,f){
    if(!sprite.complete||!sprite.naturalWidth)return anterior(c,p,f);
    const corre=p.on&&Math.abs(p.vx||0)>25, paso=corre?Math.sin(p.run||0):0, aire=!p.on;
    if(corre)return anterior(c,p,f);
    const bote=corre?-Math.abs(paso)*.5:Math.sin((f.t||0)*2)*.1;
    const sx=190,sy=75,sw=625,sh=1350,corte=1110,mitad=325,escala=21/sh,x=-sw*escala/2,y=-21;
    c.save();c.translate(p.x,p.y);c.scale((p.face||1)<0?-1:1,1);c.imageSmoothingEnabled=false;
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85,h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id){if(id==='bits64'&&STYLE_MAP.bits64)STYLE_MAP.bits64.player=dibujar;}
  instalar('bits64');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();
