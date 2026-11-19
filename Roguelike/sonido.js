'use strict';
// =====================================================================
//  SONIDO
//  Todo se genera aquí con Web Audio: no hay archivos de audio.
//  · Efectos: no se llaman desde cada mecánica; paso(g) compara cómo iba la
//    partida en el cuadro anterior y suena lo que cambió (saltó, juntó un
//    canistel, perdió un corazón, el jefe recibió un golpe…).
//  · Música: alterna compases de 6/8 y 3/4, como la jarana, con bajo,
//    punteo, percusión y una melodía sacada de una semilla. Cada mundo
//    tiene su tema: el terreno da el ánimo (ventajas.js) y el arte da el
//    instrumento (los mundos de pixel suenan a consola, el neón a sintetizador).
//    Donde el juego lleva su propio compás (Puerta de Tierra, el carnaval, la
//    jarana) la música la marca el juego, para que coincida con el ritmo.
//  Cinemáticas: cada una trae su guion de sonido (los «cues»: swell, ambiente, efecto, golpe, acento, nota, silencio) y el motor
//  de cinemáticas los avisa con el evento 'cine-cue'; aquí cada cue suena (CUES) con sus matices según su nombre.
//  ?mudo=1 en la dirección no crea el audio (para probar sin ruido).
//  prueba(id, seg) y pruebaFx() lo revisan en silencio, sin bocinas.
// =====================================================================
const SONIDO = (() => {
  const MUDO = new URLSearchParams(location.search).has('mudo');
  const NIVEL = { alta: 1, media: .6, baja: .28, no: 0 };
  const hz = m => 440 * Math.pow(2, (m - 69) / 12), hash = s => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  // ---------------- el cableado ----------------
  function grafo(ctx) {
    const master = ctx.createGain(), comp = ctx.createDynamicsCompressor(), mus = ctx.createGain(), fx = ctx.createGain(), seco = ctx.createGain(), rev = ctx.createConvolver(), wet = ctx.createGain();
    comp.threshold.value = -14; comp.ratio.value = 5; master.gain.value = .85; master.connect(comp); comp.connect(ctx.destination); mus.connect(master); fx.connect(master);
    const n = ctx.sampleRate * 1.3 | 0, ir = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.4); }
    rev.buffer = ir; wet.gain.value = .2; seco.connect(mus); seco.connect(rev); rev.connect(wet); wet.connect(mus);
    const nb = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return { ctx, master, mus, fx, seco, nb };
  }
  function nota(A, dest, o) {
    const c = A.ctx, s = c.createOscillator(), g = c.createGain(), a = o.ataque || .004; s.type = o.tipo || 'sine'; s.frequency.setValueAtTime(o.f, o.t); if (o.f2) s.frequency.exponentialRampToValueAtTime(o.f2, o.t + o.d);
    g.gain.setValueAtTime(.0001, o.t); g.gain.exponentialRampToValueAtTime(Math.max(.0002, o.v), o.t + a); g.gain.exponentialRampToValueAtTime(.0001, o.t + Math.max(o.d, a + .01));
    let sal = s; if (o.corte) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.corte; f.Q.value = o.q || .7; s.connect(f); sal = f; }
    sal.connect(g); g.connect(dest); s.start(o.t); s.stop(o.t + o.d + .04);
  }
  function soplo(A, dest, o) {
    const c = A.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = A.nb; f.type = o.filtro || 'highpass'; f.frequency.value = o.corte; f.Q.value = o.q || .7;
    g.gain.setValueAtTime(.0001, o.t); g.gain.exponentialRampToValueAtTime(Math.max(.0002, o.v), o.t + .004); g.gain.exponentialRampToValueAtTime(.0001, o.t + o.d);
    s.connect(f); f.connect(g); g.connect(dest); s.start(o.t, Math.random() * .5); s.stop(o.t + o.d + .03);
  }
  // ---------------- instrumentos ----------------
  const VOZ = {
    madera(A, m, t, len, v) { const f = hz(m), d = A.seco; nota(A, d, { t, f, d: .55, v }); nota(A, d, { t, f: f * 4, d: .07, v: v * .24 }); },
    punteo(A, m, t, len, v) { const f = hz(m), d = A.seco; nota(A, d, { t, f, d: .5, tipo: 'triangle', v }); nota(A, d, { t, f, d: .2, tipo: 'sawtooth', v: v * .26, corte: 2600 }); },
    clarinete(A, m, t, len, v) { const f = hz(m); nota(A, A.seco, { t, f, d: Math.max(.18, len * 1.05), tipo: 'square', v: v * .5, ataque: .03, corte: f * 3.2 }); },
    chip(A, m, t, len, v) { nota(A, A.seco, { t, f: hz(m), d: Math.max(.1, len * .85), tipo: 'square', v: v * .4, corte: 5200 }); },
    neon(A, m, t, len, v) { const f = hz(m), d = Math.max(.14, len * 1.1); nota(A, A.seco, { t, f, d, tipo: 'sawtooth', v: v * .42, ataque: .012, corte: 1900, q: 3 }); nota(A, A.seco, { t, f: f * 1.006, d, tipo: 'sawtooth', v: v * .24, ataque: .012, corte: 1900 }); },
  };
  // ---------------- la composición ----------------
  const ESC = { mayor: [0, 2, 4, 5, 7, 9, 11], menor: [0, 2, 3, 5, 7, 8, 10], mixo: [0, 2, 4, 5, 7, 9, 10], lidio: [0, 2, 4, 6, 7, 9, 11], dorico: [0, 2, 3, 5, 7, 9, 10] };
  const ANIMO = {
    agua: { esc: 'mayor', e: .21, timbre: 'madera', perc: .3 }, fuego: { esc: 'menor', e: .16, timbre: 'punteo', perc: .9 }, noche: { esc: 'menor', e: .24, timbre: 'clarinete', perc: .2 }, selva: { esc: 'mixo', e: .18, timbre: 'madera', perc: .6 },
    piedra: { esc: 'dorico', e: .19, timbre: 'punteo', perc: .5 }, aire: { esc: 'lidio', e: .22, timbre: 'clarinete', perc: .2 }, metal: { esc: 'mixo', e: .17, timbre: 'punteo', perc: .8 }, frio: { esc: 'lidio', e: .24, timbre: 'madera', perc: .15 },
    papel: { esc: 'mayor', e: .18, timbre: 'punteo', perc: .4 }, luz: { esc: 'dorico', e: .17, timbre: 'neon', perc: .7 },
  };
  const CAMINO = [0, 3, 4, 0, 0, 3, 4, 0, 5, 3, 1, 4, 0, 3, 4, 0]; // los grados de los 16 compases: A, A, B, A
  const R6 = [[0, 3], [0, 2, 3, 5], [0, 1, 2, 3], [0, 3, 4, 5], [0, 2, 3]], R3 = [[0, 2, 4], [0, 2, 3, 4], [0, 1, 2, 4], [0, 2, 4, 5]];
  const grado = (T, gr, oct = 0) => T.raiz + 12 * (Math.floor(gr / 7) + oct) + ESC[T.esc][((gr % 7) + 7) % 7];
  function melodia(T) {
    const r = rng(T.semilla), cerca = (g, c) => { let m = g, d = 99; for (const b of [c, c + 2, c + 4]) for (let o = -7; o <= 14; o += 7) { const q = b + o; if (Math.abs(q - g) < d) { d = Math.abs(q - g); m = q; } } return m; };
    const hace = (b, g0, ritmo) => { let g = g0; const sal = []; ritmo.forEach((s, i) => { g += Math.floor(r() * 5) - 2; g = clamp(g, 4, 13); if (i === 0 || s === 3) g = cerca(g, CAMINO[b]); sal.push({ s, g, len: (ritmo[i + 1] ?? 6) - s }); }); return [sal, g]; };
    const frase = (b0, g0) => { const bars = []; let g = g0; for (let b = b0; b < b0 + 4; b++) { const lista = (b % 2 ? R3 : R6), ritmo = b % 4 === 3 ? [0] : lista[Math.floor(r() * lista.length)], [s, ng] = hace(b, g, ritmo); bars.push(s); g = ng; } return bars; };
    const A = frase(0, 7), B = frase(8, 9), cierre = [{ s: 0, g: 7, len: 6 }];
    return [...A.slice(0, 3), [{ s: 0, g: cerca(8, CAMINO[3]), len: 6 }], ...A.slice(0, 3), cierre, ...B, ...A.slice(0, 3), cierre];
  }
  function compas(A, T, b, t0, e, tres = b % 2 === 1) {
    rejilla = { T, b, t0, e }; // el último compás que se programó: de aquí salen el tiempo y el acorde de las canisteles
    const g = CAMINO[b % 16], toca = VOZ[T.timbre] || VOZ.madera, v = T.vol || 1, acorde = [g, g + 2, g + 4].map(x => grado(T, x)); if (T.esc === 'menor' && g === 4) acorde[1]++;
    // bajo: dos pasos en 6/8, tres en 3/4; en los jefes va pegado a cada corchea
    const bajos = T.denso ? [0, 1, 2, 3, 4, 5].map(s => [s, s % 3 === 2 ? 4 : 0]) : tres ? [[0, 0], [2, 4], [4, 0]] : [[0, 0], [3, 4]];
    for (const [s, q] of bajos) nota(A, A.seco, { t: t0 + s * e, f: hz(grado(T, g + q, -2)), d: T.denso ? e * .9 : e * 1.7, tipo: 'triangle', v: (T.denso ? .24 : .32) * v, corte: 1000 });
    // punteo de acompañamiento, a contratiempo
    (tres ? [1, 3, 5] : [1, 2, 4, 5]).forEach((s, i) => toca(A, acorde[(i + b) % 3], t0 + s * e, e, .085 * v));
    // zapateado
    if (T.perc) for (const s of (tres ? [0, 2, 4] : [0, 3])) { soplo(A, A.seco, { t: t0 + s * e, d: .05, v: (s ? .07 : .11) * T.perc * v, corte: 3400 }); if (!s) nota(A, A.seco, { t: t0, f: 120, f2: 62, d: .14, v: .2 * T.perc * v }); }
    if (T.denso) for (let s = 1; s < 6; s += 2) soplo(A, A.seco, { t: t0 + s * e, d: .03, v: .05 * v, corte: 6000 });
    // melodía
    for (const n of (T.mel || (T.mel = melodia(T)))[b % 16]) if (!T.sinMelodia) toca(A, grado(T, n.g, 1), t0 + n.s * e, n.len * e, .13 * v);
  }
  const TEMAS = {};
  function tema(id) {
    if (TEMAS[id]) return TEMAS[id];
    const [que, cual] = id.split(':'), h = hash(id);
    let T;
    if (que === 'titulo') T = { esc: 'mayor', e: .2, raiz: 62, timbre: 'madera', perc: .35 };
    else if (que === 'calma') T = { esc: 'mayor', e: .27, raiz: 57, timbre: 'punteo', perc: 0, vol: .8 };
    else if (que === 'jefe') { const pix = curStyle && RUN && curStyle().pixel; T = { esc: 'menor', e: .145, raiz: 54 + h % 6, timbre: pix ? 'chip' : ['clarinete', 'punteo', 'neon'][h % 3], perc: 1, denso: true }; }
    else { const st = STYLE_MAP[cual] || {}, tag = ((VENTAJAS.TIERRAS[cual] || [[]])[0] || [])[0], B = ANIMO[tag] || ANIMO.piedra; T = Object.assign({}, B, { raiz: 56 + h % 8, timbre: st.pixel ? 'chip' : cual === 'cyber' || cual === 'neon' ? 'neon' : B.timbre }); }
    T.semilla = h + 11; return (TEMAS[id] = T);
  }
  // las canisteles tocan la canción del mundo: la primera entra donde va la melodía y cada una seguida es la nota que sigue.
  // Suenan a tiempo con la música (en la semicorchea que viene) y se acomodan al acorde que está sonando, para no chocar
  let rejilla = null, sigue = 0, ultimaT = 0;
  function cancion(A, t, k) {
    const M = (rejilla && rejilla.T) || T || tema('titulo'), mel = (M.mel || (M.mel = melodia(M))), lista = [];
    mel.forEach((bar, b) => bar.forEach(n => lista.push({ b, s: n.s, g: n.g })));
    const R = rejilla && t - rejilla.t0 < 12 * rejilla.e ? rejilla : null; if (ultimaT > t + 1) ultimaT = 0;
    let tq = t, b = 0, s = 0;
    if (R) { const paso = R.e / 2, j = Math.ceil((Math.max(t, ultimaT + paso * .9) - R.t0) / paso - .001); tq = R.t0 + j * paso; b = R.b + Math.floor(j / 12); s = ((j % 12) + 12) % 12 / 2; }
    ultimaT = tq;
    if (k === 0) { const i = lista.findIndex(n => n.b === b % 16 && n.s >= s); sigue = i < 0 ? lista.findIndex(n => n.b === (b + 1) % 16) : i; if (sigue < 0) sigue = 0; } else sigue = (sigue + 1) % lista.length;
    // el acorde del compás donde cae: si la nota de la melodía raspa con el acorde (medio tono o tritono), se va a la nota del acorde más cercana
    const c = CAMINO[((b % 16) + 16) % 16], g = lista[sigue].g, notas = [c, c + 2, c + 4].map(x => grado(M, x) % 12);
    let mejor = g;
    if (notas.some(p => [1, 6, 11].includes(((grado(M, g) - p) % 12 + 12) % 12))) { let d = 99; for (const x of [c, c + 2, c + 4]) for (let o = -7; o <= 21; o += 7) if (Math.abs(x + o - g) < d) { d = Math.abs(x + o - g); mejor = x + o; } }
    let m = grado(M, mejor); while (m < 72) m += 12; while (m > 91) m -= 12;
    return [tq, m];
  }
  // ---------------- los efectos ----------------
  const FX = {
    salto(A, t) { nota(A, A.fx, { t, f: 290, f2: 640, d: .13, tipo: 'triangle', v: .2 }); },
    cae(A, t) { nota(A, A.fx, { t, f: 130, f2: 70, d: .09, v: .16 }); soplo(A, A.fx, { t, d: .06, v: .05, corte: 900 }); },
    canistel(A, t, k = 0) { const [tq, m] = cancion(A, t, k), f = hz(m); nota(A, A.fx, { t: tq, f, d: .22, tipo: 'sine', v: .15 }); nota(A, A.fx, { t: tq, f: f * 2, d: .1, tipo: 'triangle', v: .05 }); nota(A, A.fx, { t: tq, f: f * 3, d: .05, tipo: 'sine', v: .02 }); },
    semilla(A, t) { for (const [i, m] of [84, 88, 91].entries()) nota(A, A.fx, { t: t + i * .05, f: hz(m), d: .22, v: .09 }); },
    pisa(A, t) { nota(A, A.fx, { t, f: 240, f2: 70, d: .13, v: .34 }); soplo(A, A.fx, { t, d: .05, v: .14, corte: 1800 }); },
    herida(A, t) { nota(A, A.fx, { t, f: 340, f2: 105, d: .3, tipo: 'sawtooth', v: .22, corte: 1300 }); },
    cura(A, t) { for (const [i, m] of [72, 76, 79, 84].entries()) nota(A, A.fx, { t: t + i * .07, f: hz(m), d: .3, tipo: 'triangle', v: .15 }); },
    impulso(A, t) { soplo(A, A.fx, { t, d: .2, v: .2, corte: 900, filtro: 'bandpass', q: 1.4 }); },
    poder(A, t) { nota(A, A.fx, { t, f: 520, f2: 900, d: .12, tipo: 'triangle', v: .12 }); nota(A, A.fx, { t: t + .03, f: 1300, d: .1, v: .05 }); },
    burbuja(A, t) { nota(A, A.fx, { t, f: 280, f2: 720, d: .12, v: .17 }); },
    arrullo(A, t) { for (const [i, m] of [67, 72, 76].entries()) nota(A, A.fx, { t: t + i * .11, f: hz(m), d: .5, v: .08, ataque: .03 }); },
    aviso(A, t) { nota(A, A.fx, { t, f: hz(79), d: .14, tipo: 'triangle', v: .15 }); nota(A, A.fx, { t: t + .13, f: hz(84), d: .22, tipo: 'triangle', v: .15 }); },
    abre(A, t) { nota(A, A.fx, { t, f: hz(74), d: .16, tipo: 'square', v: .05, corte: 2400 }); nota(A, A.fx, { t: t + .12, f: hz(81), d: .22, tipo: 'square', v: .05, corte: 2400 }); },
    rugidoJefe(A, t, tipo) {
      const metal = ['brawbot', 'golem', 'mascaron'].includes(tipo), agudo = tipo === 'serpiente' || tipo === 'camazotz';
      const base = agudo ? 190 : metal ? 85 : 115;
      soplo(A, A.fx, { t, d: .72, v: .22, corte: agudo ? 1400 : 650, filtro: 'bandpass', q: .8 });
      nota(A, A.fx, { t, f: base, f2: base * .68, d: .76, tipo: 'sawtooth', v: .14, ataque: .08, corte: metal ? 650 : 1100 });
      nota(A, A.fx, { t: t + .05, f: base * 2.1, f2: base * 1.3, d: .55, tipo: 'triangle', v: .08, ataque: .08, corte: 1000 });
      // Golpe de pecho y pulsos ásperos: dan cuerpo sin depender de la música.
      nota(A, A.fx, { t, f: 90, f2: 32, d: .48, v: .28 });
      soplo(A, A.fx, { t, d: .32, v: .2, corte: metal ? 380 : 900, filtro: 'lowpass' });
      for (let i = 0; i < 4; i++) nota(A, A.fx, { t: t + .12 + i * .105, f: base * (1.55 + i * .04), f2: base * .9, d: .13, tipo: metal ? 'square' : 'sawtooth', v: .055, corte: agudo ? 1800 : 850 });
    },
    jefeGolpe(A, t) { nota(A, A.fx, { t, f: 170, f2: 42, d: .42, v: .46 }); soplo(A, A.fx, { t, d: .22, v: .24, corte: 900, filtro: 'lowpass' }); nota(A, A.fx, { t, f: 880, f2: 330, d: .2, tipo: 'triangle', v: .1 }); },
    fanfarria(A, t) { for (const [i, m] of [67, 72, 76, 79, 84].entries()) { nota(A, A.fx, { t: t + i * .1, f: hz(m), d: .4, tipo: 'triangle', v: .17 }); nota(A, A.fx, { t: t + i * .1, f: hz(m + 12), d: .16, v: .05 }); } },
    meta(A, t) { for (const [i, m] of [72, 76, 79, 84].entries()) VOZ.madera({ ctx: A.ctx, seco: A.fx }, m, t + i * .09, .2, .2); },
    pierde(A, t) { for (const [i, m] of [69, 65, 62, 57].entries()) nota(A, A.fx, { t: t + i * .17, f: hz(m), d: .4, tipo: 'triangle', v: .15 }); },
    temblor(A, t) { nota(A, A.fx, { t, f: 72, f2: 38, d: .38, v: .3 }); soplo(A, A.fx, { t, d: .3, v: .5, corte: 260, filtro: 'lowpass' }); },
    atrapa(A, t) { nota(A, A.fx, { t, f: 180, f2: 240, d: .3, tipo: 'sawtooth', v: .1, corte: 800 }); },
    clic(A, t) { nota(A, A.fx, { t, f: 950, f2: 500, d: .05, v: .1 }); },
    compra(A, t) { nota(A, A.fx, { t, f: hz(83), d: .09, v: .13 }); nota(A, A.fx, { t: t + .08, f: hz(88), d: .24, v: .13 }); },
    zapateo(A, t) { soplo(A, A.fx, { t, d: .06, v: .22, corte: 1500 }); nota(A, A.fx, { t, f: 150, f2: 80, d: .08, v: .24 }); },
  };
  // ---------------- los cues de las cinemáticas ----------------
  // tipo: swell (la música se infla), ambiente (olas y gaviotas), efecto, golpe, acento (campanita), nota (una luz), silencio (la música baja).
  // El nombre del cue afina cuál de ellos: «zumbido grave», «se rasga el cielo», «destello», «brinco», «luz azul»…
  const NOTA_LUZ = { azul: 76, naranja: 79, violeta: 83, rosa: 86, 'luz': 81 };
  const ES = (n, ...ks) => ks.some(k => n.includes(k));
  const CUES = {
    swell(A, t, n) {
      const grave = ES(n, 'grieta', 'ruptura', 'cierra'), viento = ES(n, 'viento'), base = grave ? 41 : 57;
      if (viento) { soplo(A, A.fx, { t, d: 2.6, v: .2, corte: 700, filtro: 'bandpass', q: .8 }); soplo(A, A.fx, { t: t + .5, d: 2.2, v: .14, corte: 1400, filtro: 'bandpass', q: 1 }); }
      for (const [i, m] of [0, 7, 12].entries()) { nota(A, A.fx, { t, f: hz(base + m), f2: hz(base + m + (grave ? -1 : 0)), d: 2.4, tipo: grave ? 'sawtooth' : 'triangle', v: grave ? .045 : .07, ataque: 1.4 + i * .1, corte: grave ? 420 : 1600 }); }
    },
    ambiente(A, t, n) {
      // las olas: ruido grave que sube y baja; las gaviotas: dos o tres chillidos
      for (let i = 0; i < 3; i++) soplo(A, A.fx, { t: t + i * 1.5, d: 1.9, v: .11, corte: 420 + i * 60, filtro: 'lowpass', q: .6 });
      if (ES(n, 'gaviota')) for (const [i, d] of [.4, 1.9, 3.1].entries()) { nota(A, A.fx, { t: t + d, f: 1650, f2: 1050, d: .34, tipo: 'sine', v: .05, ataque: .03 }); nota(A, A.fx, { t: t + d + .16, f: 1450, f2: 980, d: .3, tipo: 'sine', v: .04, ataque: .03 }); void i; }
    },
    efecto(A, t, n) {
      if (ES(n, 'zumbido')) { nota(A, A.fx, { t, f: 55, f2: 52, d: 1.5, tipo: 'sawtooth', v: .12, ataque: .5, corte: 300 }); nota(A, A.fx, { t, f: 110, d: 1.4, tipo: 'sine', v: .08, ataque: .5 }); }
      else if (ES(n, 'piedrita', 'cae')) { nota(A, A.fx, { t, f: 1700, f2: 620, d: .13, v: .1 }); nota(A, A.fx, { t: t + .2, f: 900, f2: 420, d: .1, v: .06 }); }
      else if (ES(n, 'tambalea')) for (let i = 0; i < 3; i++) nota(A, A.fx, { t: t + i * .16, f: 330 - i * 40, f2: 260 - i * 40, d: .14, tipo: 'triangle', v: .12 });
      else if (ES(n, 'huyendo', 'huyen')) { soplo(A, A.fx, { t, d: .9, v: .2, corte: 1500, filtro: 'bandpass', q: 1.2 }); for (let i = 0; i < 6; i++) nota(A, A.fx, { t: t + i * .09, f: 880 + i * 120, f2: 1400 + i * 100, d: .1, tipo: 'triangle', v: .05 }); }
      else { soplo(A, A.fx, { t, d: .6, v: .14, corte: 1100, filtro: 'bandpass', q: 1 }); nota(A, A.fx, { t, f: 220, f2: 330, d: .4, tipo: 'triangle', v: .06 }); }
    },
    golpe(A, t, n) {
      if (ES(n, 'brinco', 'da la vuelta')) { nota(A, A.fx, { t, f: 290, f2: 700, d: .14, tipo: 'triangle', v: .16 }); soplo(A, A.fx, { t: t + .12, d: .05, v: .06, corte: 900 }); }
      else if (ES(n, 'destello', 'rendija')) { soplo(A, A.fx, { t, d: .7, v: .16, corte: 4200, filtro: 'highpass' }); for (const [i, m] of [88, 95, 100].entries()) nota(A, A.fx, { t: t + i * .03, f: hz(m), d: .7, v: .05 }); nota(A, A.fx, { t, f: 90, f2: 45, d: .35, v: .22 }); }
      else if (ES(n, 'rasga')) { soplo(A, A.fx, { t, d: 1.1, v: .3, corte: 500, filtro: 'highpass' }); nota(A, A.fx, { t, f: 90, f2: 30, d: .9, tipo: 'sawtooth', v: .2, corte: 500 }); nota(A, A.fx, { t: t + .05, f: 1800, f2: 220, d: .7, tipo: 'sawtooth', v: .06, corte: 3000 }); }
      else if (ES(n, 'cristal', 'orbe')) { const m = ES(n, 'azul') ? 88 : ES(n, 'naranja') ? 91 : ES(n, 'violeta') ? 95 : 84; nota(A, A.fx, { t, f: hz(m), d: .5, v: .13 }); nota(A, A.fx, { t, f: hz(m + 7), d: .3, v: .06 }); soplo(A, A.fx, { t, d: .06, v: .1, corte: 3000 }); }
      else if (ES(n, 'tentáculo', 'tentaculo', 'núcleo', 'nucleo')) { nota(A, A.fx, { t, f: 120, f2: 40, d: .55, v: .34 }); soplo(A, A.fx, { t, d: .35, v: .26, corte: 700, filtro: 'lowpass' }); }
      else if (ES(n, 'visión', 'vision')) { const m = ES(n, 'pixel') ? 84 : ES(n, 'tinta') ? 72 : ES(n, 'neón', 'neon') ? 91 : 79; nota(A, A.fx, { t, f: hz(m), d: .35, tipo: ES(n, 'pixel') ? 'square' : 'triangle', v: ES(n, 'pixel') ? .05 : .12 }); }
      else { nota(A, A.fx, { t, f: 150, f2: 50, d: .3, v: .28 }); soplo(A, A.fx, { t, d: .12, v: .14, corte: 1400 }); }
    },
    acento(A, t) { for (const [i, m] of [79, 84, 88].entries()) nota(A, A.fx, { t: t + i * .08, f: hz(m), d: .6, v: .1 }); },
    nota(A, t, n) { const k = Object.keys(NOTA_LUZ).find(c => ES(n, c)), m = NOTA_LUZ[k] || 81; nota(A, A.fx, { t, f: hz(m), d: 1.1, v: .12, ataque: .01 }); nota(A, A.fx, { t, f: hz(m + 12), d: .5, v: .04 }); },
  };
  // las cinemáticas se oyen un poco más fuertes que los efectos del juego (no hay otra cosa sonando encima)
  const GANA = { swell: 1.9, ambiente: 2.3, efecto: 1.8, golpe: 1.4, acento: 1.4, nota: 1.7 };
  const conGanancia = (A, tipo) => { const g = A.ctx.createGain(); g.gain.value = tipo === 'enemigos' ? valor(O().enemigos, .6) : (GANA[tipo] || 1); g.connect(A.fx); return Object.assign(Object.create(A), { fx: g }); };
  function cue(d) {
    if (d && /rugido|ruge/i.test(String(d.nombre || ''))) { fx('rugidoJefe', d.nombre); return; }
    if (!d || !CUES[d.tipo]) { if (d && d.tipo === 'silencio' && A) apaga = A.ctx.currentTime + 1.4; return; }
    cuenta['cue:' + d.tipo] = (cuenta['cue:' + d.tipo] || 0) + 1;
    if (A && A.ctx.state === 'running' && volFx() > 0) CUES[d.tipo](conGanancia(A, d.tipo), A.ctx.currentTime + .005, String(d.nombre || '').toLowerCase());
  }
  addEventListener('cine-cue', e => { const d = e.detail; if (d && d.cine === 'entrada') return; if (d && d.tipo === 'silencio') { if (A) apaga = A.ctx.currentTime + 1.4; cuenta['cue:silencio'] = (cuenta['cue:silencio'] || 0) + 1; return; } cue(d); });

  // ---------------- el motor ----------------
  let A = null, id = null, T = null, proxT = 0, barra = 0, apaga = 0, U = null, racha = 0, rachaT = 0;
  const O = () => (PROG.d.opciones || {});
  const valor = (v, defecto = .6) => typeof v === 'number' ? Math.max(0, Math.min(1, v / 100)) : (NIVEL[v] ?? defecto);
  const volMus = () => valor(O().musica, 0), volFx = () => valor(O().efectos);
  const enemigos = new Set(['pisa', 'jefeGolpe', 'rugidoJefe', 'abre', 'aviso', 'atrapa']);
  function prende() {
    if (MUDO || A) { if (A && A.ctx.state === 'suspended') A.ctx.resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    A = grafo(new C()); A.mus.gain.value = 0; A.fx.gain.value = volFx();
  }
  addEventListener('pointerdown', prende, true); addEventListener('keydown', prende, true);
  document.addEventListener('visibilitychange', () => { if (!A) return; if (document.hidden) A.ctx.suspend(); else A.ctx.resume(); });
  document.addEventListener('click', e => { if (e.target.closest && e.target.closest('button') && !window.AUDIO_ARCHIVOS) fx('clic'); }, true);
  const cuenta = {}; // cuántas veces se pidió cada efecto (para revisar en silencio que el juego los dispara)
  function fx(n, k) { cuenta[n] = (cuenta[n] || 0) + 1; if (n === 'salto' && window.AUDIO_ARCHIVOS) { window.AUDIO_ARCHIVOS.variante('salto'); return; } const archivo = { herida: 'take damage.mp3' }[n]; if (archivo && window.AUDIO_ARCHIVOS) { window.AUDIO_ARCHIVOS.efecto(archivo); return; } if (A && A.ctx.state === 'running' && FX[n] && volFx() > 0) FX[n](enemigos.has(n) ? conGanancia(A, 'enemigos') : A, A.ctx.currentTime + .005, k); }
  function quiere() {
    if (typeof STATE === 'undefined') return id;
    if (STATE === 'title' || STATE === 'win') return 'titulo'; if (STATE === 'ofrenda' || STATE === 'cine') return 'calma'; if (STATE === 'over') return null;
    if (STATE !== 'play' && STATE !== 'pause') return id;
    if (!CUR) return id; if (CUR.isBoss && CUR.boss) return 'jefe:' + CUR.boss.tipo;
    if (CUR.modo === MODOS.jarana) return 'sincro:jarana'; if (CUR.beatAuto) return 'sincro:' + (CUR.def ? CUR.def.id : 'neon');
    return 'mundo:' + (CUR.def && VENTAJAS.TIERRAS[CUR.def.id] ? CUR.def.id : curStyle().id);
  }
  function tic() {
    if (!A || A.ctx.state !== 'running') return; const c = A.ctx, now = c.currentTime, q = quiere();
    if (q !== id) { id = q; T = !q ? null : q.startsWith('sincro') ? Object.assign({}, tema('mundo:' + q.split(':')[1]), { sincro: true }) : tema(q); barra = 0; proxT = now + .34; apaga = now + .3; }
    A.fx.gain.value = volFx();
    A.mus.gain.setTargetAtTime(now < apaga || !T || window.AUDIO_ARCHIVOS ? 0 : volMus() * (STATE === 'pause' ? .35 : STATE === 'cine' ? .55 : 1), now, .09);
    if (T && !T.sincro) while (proxT < now + .4) { compas(A, T, barra++, proxT, T.e); proxT += 6 * T.e; }
  }
  setInterval(tic, 90);
  // cuando el juego lleva el compás, cada compás lo dispara el juego
  function compasDeJuego(dur, tres) { if (A && T && T.sincro && A.ctx.state === 'running' && volMus() > 0) compas(A, T, barra++, A.ctx.currentTime + .02, dur / 6, tres); }
  function paso(g) {
    const p = g.p, b = g.boss;
    const n = { g, sq: p.sq || 0, on: p.on, vy: p.vy, dash: p.dash > 0, coins: RUN.coins, stomps: RUN.stomps, hearts: RUN.hearts, sem: RUN.semillas || 0, cool: g.fre.cool || 0, bub: g.bubbles.length, lull: g.lull ? g.lull.t : 0, hp: b ? b.hp : 0, st: b ? b.st : '', cura: !!(b && b.cura), win: !!g.win, shake: g.shake || 0, beatT: g.beatT || 0, sub: RUN.subjefes || 0, atr: !!g.fre.atrapada };
    if (U && U.g === g) {
      if (n.sq < U.sq - .1) fx('salto'); if (n.on && !U.on && U.vy > 170) fx('cae'); if (n.dash && !U.dash) fx('impulso');
      if (n.coins > U.coins) { const t = g.t; racha = t - rachaT < .7 ? racha + 1 : 0; rachaT = t; fx('canistel', racha); }
      if (n.stomps > U.stomps) fx('pisa'); if (n.hearts < U.hearts) fx('herida'); else if (n.hearts > U.hearts) fx('cura'); if (n.sem > U.sem) fx('semilla');
      if (n.bub > U.bub) fx('burbuja'); else if (n.lull !== U.lull) fx('arrullo'); else if (n.cool > U.cool + .05) fx('poder');
      if (n.hp < U.hp) fx('jefeGolpe'); if (n.st === 'ventana' && U.st !== 'ventana') fx('abre'); if (n.st === 'muere' && U.st !== 'muere') fx('fanfarria');
      if (n.cura && !U.cura) fx('aviso'); if (n.win && !U.win && !g.isBoss) fx('meta'); if (n.shake > U.shake + .3) fx('temblor'); if (n.sub > U.sub) fx('fanfarria'); if (n.atr && !U.atr) fx('atrapa');
      if (g.beatAuto && n.beatT < U.beatT) compasDeJuego(g.beatAuto);
    }
    U = n;
  }
  GANCHOS.en('stepRun', _stepRun => function (g, inp, dt, st) { _stepRun(g, inp, dt, st); if (RUN) paso(g); });
  GANCHOS.en('gameOver', _go => function () { const j = STATE === 'play'; _go(); if (j) fx('pierde'); });
  GANCHOS.en('victory', _v => function () { const r = _v.apply(this, arguments); fx('fanfarria'); return r; });
  // la jarana: la música sigue sus compases; cada acierto es un zapateado
  if (typeof MODOS !== 'undefined' && MODOS.campechanidad) {
    const _p = MODOS.campechanidad.paso; let Uj = null;
    MODOS.campechanidad.paso = function (j, dt) {
      _p.call(this, j, dt); if (!j.compases) return;
      while (j.compasI < j.compases.length && j.compases[j.compasI].t <= j.t + .02) { const q = j.compases[j.compasI++]; compasDeJuego(q.dur, q.tres); }
      if (Uj && Uj.j === j) { if (j.aciertos > Uj.a) fx('zapateo'); if (j.caidas > Uj.c) fx('herida'); } Uj = { j, a: j.aciertos, c: j.caidas };
    };
  }
  // ---------------- revisión en silencio ----------------
  const mide = b => { let pico = 0, sum = 0, n = 0; for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) { const x = Math.abs(d[i]); if (x > pico) pico = x; sum += x * x; n++; } } return { pico: +pico.toFixed(3), rms: +Math.sqrt(sum / n).toFixed(4) }; };
  async function prueba(q, seg = 12) { const c = new OfflineAudioContext(2, 44100 * seg, 44100), B = grafo(c), Te = tema(q); B.mus.gain.value = .6; for (let t = .05, b = 0; t < seg - 1; b++, t += 6 * Te.e) compas(B, Te, b, t, Te.e); return mide(await c.startRendering()); }
  async function pruebaCue(tipo, nombre) { const c = new OfflineAudioContext(1, 44100 * 4, 44100), B = grafo(c); B.fx.gain.value = .6; CUES[tipo](conGanancia(B, tipo), .02, String(nombre || '').toLowerCase()); return mide(await c.startRendering()); }
  async function pruebaFx() { const out = {}; for (const n in FX) { const c = new OfflineAudioContext(1, 44100 * 2, 44100), B = grafo(c); B.fx.gain.value = .6; FX[n](B, .02, 1); out[n] = mide(await c.startRendering()); } return out; }
  // las canisteles en silencio: música de un mundo y canisteles recogidas en momentos sueltos; regresa cuándo y qué nota sonó cada una
  async function pruebaCancion(q, tiempos) {
    const c = new OfflineAudioContext(2, 44100 * 14, 44100), B = grafo(c), Te = tema(q), sal = [], viejo = rejilla; let b = 0, t0 = .05, racha = 0, rt = -9;
    for (const t of tiempos) { while (t0 <= t + .4) { compas(B, Te, b++, t0, Te.e); t0 += 6 * Te.e; } racha = t - rt < .7 ? racha + 1 : 0; rt = t; const [tq, m] = cancion(B, t, racha); nota(B, B.fx, { t: tq, f: hz(m), d: .22, tipo: 'sine', v: .15 }); sal.push({ t, tq: +tq.toFixed(3), m, racha, g: (() => { const L = []; (Te.mel || []).forEach(bar => bar.forEach(n => L.push(n.g))); return L[sigue]; })(), enRejilla: Math.abs(((tq - .05) / (Te.e / 2)) - Math.round((tq - .05) / (Te.e / 2))) < .01 }); }
    rejilla = viejo; return { e: Te.e, notas: sal, ...mide(await c.startRendering()) };
  }
  return { fx, cue, CUES, pruebaCue, prueba, pruebaFx, pruebaCancion, tema, cuenta, get activo() { return !!A; }, NIVEL };
})();
