'use strict';
// =====================================================================
//  NIVELES POR PIEZAS
//  Cada run arma su propio nivel. Los niveles diseñados a mano se cortan en
//  piezas por sus tramos de piso firme (todos tienen el piso en la fila 11,
//  así que cualquier pieza encaja con cualquier otra de su mundo) y se
//  rearman en otro orden, sin perder la curva: lo difícil tiende al final.
//  Además cada run estrena tramos nuevos: de los niveles a mano se aprenden
//  las reglas de cada mundo (qué saltos usa, con qué plataformas, qué
//  objetos pone en el piso) y solo se combinan esos pasos ya diseñados.
//  Reglas para no romper nada:
//   · nunca se corta encima de algo que ocupa ese tramo (plataformas con su
//     recorrido, sólidos, zonas, objetos largos) ni entre las partes de un
//     grupo (una válvula y sus rejillas, una estela y sus glifos);
//   · lo que cubre todo el nivel (el mar de agua) se estira al ancho nuevo;
//   · los enemigos genéricos se sortean entre la fauna del mundo;
//   · las rutas altas se generan después, sobre el nivel ya armado, y los
//     doblones se colocan al final, encima de esas rutas o de los canisteles.
//  ?fijo=1 en la dirección juega el nivel original.
// =====================================================================
const PIEZAS = (() => {
  const PISO = 11, ANCHO_MIN = 9, RUIDO = .55;
  const COLUMNAS = ['x', 'x0', 'x1', 'x2'];
  const cortes = {};
  const copia = e => { const c = Object.assign({}, e); if (e.o) c.o = Object.assign({}, e.o); return c; };
  // cuánto se aleja de lado una plataforma, en columnas (lo que sube y baja no estorba un corte)
  function recorrido(o) {
    const k = o.k, px = k === 'move' ? (o.path === 'h' || o.path === 'circle' ? o.amp || 30 : 0) : k === 'cycle' ? o.span || 160 : k === 'swing' ? o.L || 60 : Math.max(o.dist || 0, o.len || 0);
    return px / T;
  }
  function corta(def) {
    if (cortes[def.id]) return cortes[def.id];
    const b = Constructor(def.W); def.build(b);
    const rows = b.rows(), ents = b.ents, W = rows[0].length, regla = (PIEZAS.REGLAS || {})[def.id] || {};
    const top = x => { for (let y = 0; y < 15; y++) if (rows[y][x] === '#') return y; return 15; };
    const ocupado = new Uint8Array(W + 2), marca = (a, z) => { for (let x = Math.max(0, Math.floor(a)); x <= Math.min(W, Math.ceil(z)); x++) ocupado[x] = 1; };
    const globales = [], locales = [], grupos = {};
    for (const e of ents) {
      const o = e.o || {};
      if (e.t === 'obj' && ((e.x2 !== undefined && e.x2 - e.x > W * .7) || (!e.x && !e.y))) { globales.push(e); continue; } // el mar entero o un control de todo el nivel
      locales.push(e);
      if (e.t === 'plat') { const mov = recorrido(Object.assign({}, def.plat, o)); marca(e.x - mov, Math.max(e.x + e.w, o.x2 ?? 0) + mov); } // las opciones del mundo cuentan: de ahí salen muchos recorridos
      else if (e.t === 'zone') marca(e.x0, e.x1);
      else if (e.t === 'solid') marca(e.x, e.x + e.w);
      else if (e.t === 'obj' && e.k !== 'guirnalda') { if (e.x2 !== undefined) marca(e.x, e.x2); else if (e.w) marca(e.x, e.x + e.w); } // la guirnalda es adorno: si la cruza un corte se vuelve dos más cortas
      // lo que trabaja en grupo va junto
      const grp = e.grp ?? o.grp, par = e.par ?? o.par, liga = typeof grp === 'number' ? 'g' + grp : par !== undefined ? e.t + par : null;
      if (liga) { const q = grupos[liga] = grupos[liga] || [e.x, e.x]; q[0] = Math.min(q[0], e.x); q[1] = Math.max(q[1], e.x); }
    }
    for (const q of Object.values(grupos)) marca(q[0], q[1]);
    // ligas por cercanía: la reja abre con la antorcha más próxima y la losa fantasma existe junto a una antorcha prendida
    const antorchas = locales.filter(e => e.t === 'obj' && e.k === 'antorcha');
    for (const e of locales) {
      const fantasma = e.t === 'plat' && ((e.o && e.o.k) || (def.plat || {}).k) === 'ghost'; if (!(fantasma || (e.t === 'obj' && e.k === 'rastrillo')) || !antorchas.length) continue;
      const cerca = antorchas.slice().sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0]; marca(Math.min(e.x, cerca.x), Math.max(e.x + (e.w || 1), cerca.x));
    }
    const P = rows.reduce((n, r) => Math.max(n, r.indexOf('P')), -1), G = rows.reduce((n, r) => Math.max(n, r.indexOf('G')), -1);
    // los puntos de corte: el centro de cada tramo de piso libre. El piso pide 2 columnas firmes de cada lado; los objetos solo no deben cruzar el corte
    const costuras = []; let tramo = null;
    for (let x = 3; x < W - 3; x++) {
      let ok = x > P + 7 && x < G - 7; for (let k = -2; k <= 2 && ok; k++) if (top(x + k) !== PISO || (Math.abs(k) < 2 && ocupado[x + k])) ok = false;
      if (ok) { if (tramo === null) tramo = x; } else if (tramo !== null) { costuras.push((tramo + x - 1) >> 1); tramo = null; }
    }
    if (tramo !== null) costuras.push(tramo);
    const cortesX = [0]; for (const c of costuras) if (c - cortesX[cortesX.length - 1] >= ANCHO_MIN) cortesX.push(c);
    if (cortesX.length > 1 && W - cortesX[cortesX.length - 1] < ANCHO_MIN) cortesX.pop();
    cortesX.push(W);
    const piezas = [];
    for (let i = 0; i + 1 < cortesX.length; i++) {
      const a = cortesX[i], z = cortesX[i + 1];
      piezas.push({ a, z, ancho: z - a, dif: a / W, rows: rows.map(r => r.slice(a, z)), ents: locales.flatMap(e => {
        if (e.k === 'guirnalda' && e.x2 !== undefined) { const x = Math.max(e.x, a), x2 = Math.min(e.x2, z - 1); return x2 - x >= 5 ? [Object.assign(copia(e), { x, x2 })] : []; }
        const x = e.x ?? e.x0; return x >= a && x < z ? [copia(e)] : [];
      }) });
    }
    const quita = regla.quita || [];
    const mids = piezas.slice(1, -1).filter((q, i) => !quita.includes(i));
    return cortes[def.id] = { W, globales, inicio: piezas[0], fin: piezas[piezas.length - 1], mids, todas: piezas.length, reglas: aprende(def, rows, locales, top) };
  }
  // ---------- las reglas de cada mundo, aprendidas de sus niveles a mano ----------
  // van con su lugar o con el nivel entero: la regla es una pared que solo cae hacia su lado, el botón voltea los bloques de junto y la reja necesita su antorcha
  const FIJOS = new Set(['letrero', 'pista', 'carnaval', 'guirnalda', 'peregrinos', 'anima', 'altar', 'pinata', 'ruido', 'water', 'regla', 'boton', 'rastrillo']);
  // los que nacen con su objeto (el cuadrito con su bloque, el cucú con su reloj) no pueden salir sueltos
  const nacenSolos = k => !(MEC.OBJ[k] && MEC.OBJ[k].make);
  // plataformas que dependen de algo de afuera: la losa fantasma existe solo junto a una antorcha prendida y el hongo crece con la luz
  const NO_APRENDER = new Set(['ghost', 'hongoLuz']);
  // las que se mueven: cada una exige esperar su momento, así que un tramo lleva tres cuando mucho
  const SEGURAS = new Set(['static', 'fall', 'sink', 'crack', 'taco', 'taffy', 'ice', 'bloom', 'cycle', 'jelly', 'move', 'creak']);
  const MOVILES = new Set(['move', 'luna', 'swing', 'cycle', 'carro', 'lift', 'velero', 'grua', 'prisma']), MAX_MOVILES = 3;
  function aprende(def, rows, locales, top) {
    const plats = locales.filter(e => e.t === 'plat' && !(e.o && (e.o.x2 !== undefined || e.o.y2 !== undefined || e.o.alta || e.o.par !== undefined || typeof e.o.grp === 'number')) && !NO_APRENDER.has((e.o && e.o.k) || (def.plat || {}).k)).sort((a, b) => a.x - b.x), pasos = [], primeros = [], ultimos = [];
    const opciones = e => { const o = Object.assign({}, e.o); return o; };
    const hayPiso = (a, z) => { for (let x = Math.ceil(a); x < z; x++) if (top(x) < 15) return true; return false; };
    for (let i = 0; i < plats.length; i++) {
      const a = plats[i], z = plats[i + 1], fin = Math.ceil(a.x + a.w);
      let izq = Math.floor(a.x) - 1, n = 0; while (izq >= 0 && top(izq) >= 15 && n < 8) { izq--; n++; }
      if (n < 8 && izq >= 0 && top(izq) >= a.y) primeros.push({ salto: n, fila: a.y, w: a.w, o: opciones(a) });
      let der = fin, m = 0; while (der < rows[0].length && top(der) >= 15 && m < 8) { der++; m++; }
      if (m < 8 && der < rows[0].length && top(der) >= a.y) ultimos.push({ salto: m, fila: a.y });
      if (z && z.x - fin >= 0 && z.x - fin <= 7 && !hayPiso(fin, z.x)) pasos.push({ salto: z.x - fin, sube: z.y - a.y, w: z.w, o: opciones(z) });
    }
    // los mundos con pocos pasos aprendidos (o ninguno) reciben pasos con su plataforma de siempre, la que sus niveles a mano
    // ponen con b.p(x, y, w) sin opciones: los saltos se calculan con el alcance real, y solo para las plataformas que no
    // dependen de nada de afuera (una banda que empuja o un basalto que quema no se encadenan a ciegas)
    const kBase = (def.plat || {}).k || 'static', blando = !MOVILES.has(kBase) || kBase === 'move' || kBase === 'cycle';
    if (pasos.length < 6 && SEGURAS.has(kBase) && !((def.plat || {}).sp >= 1.5)) { // las que van rápido (los pistones dorados) no se sintetizan
      const tope = MOVILES.has(kBase) ? 1 : 4;
      for (let salto = 1; salto <= tope; salto++) for (const sube of MOVILES.has(kBase) ? [-1, 0] : [-2, -1, 0, 1]) for (const w of [2, 3]) if (alcanza(salto, sube) && (kBase !== 'beat' || Math.abs(sube) <= 1)) pasos.push({ salto, sube, w, o: {}, sintetico: true });
      if (!primeros.length) for (const [salto, fila] of [[2, 9], [3, 10], [2, 10]]) primeros.push({ salto, fila, w: 3, o: {} });
      if (!ultimos.length) for (const [salto, fila] of [[2, 9], [3, 10]]) ultimos.push({ salto, fila });
    }
    const objetos = locales.filter(e => e.t === 'obj' && !e.y && !FIJOS.has(e.k) && e.grp === undefined && e.par === undefined && (e.x2 === undefined || e.x2 - e.x <= 12)).map(e => { const c = copia(e); if (c.x2 !== undefined) c.x2 -= c.x; c.x = 0; return c; });
    const islas = rows.some((r, y) => y >= 2 && y <= 8 && /#{3,}/.test(r));
    // qué pone el mundo en el piso y qué en el aire (un carámbano del techo no debe salir caminando)
    const fauna = def.fauna || [def.foe], suelo = new Set(), aire = new Set(); let nf = 0;
    for (const e of locales) { if (e.t !== 'foe') continue; const k = e.k || fauna[nf++ % fauna.length]; if (nacenSolos(k)) (e.y === undefined ? suelo : aire).add(k); }
    if (!suelo.size) suelo.add(def.foe); if (!aire.size) for (const k of suelo) aire.add(k);
    return { pasos, primeros, ultimos, objetos, islas, suelo: [...suelo], aire: [...aire], cadenas: primeros.length > 0 && ultimos.length > 0 };
  }
  const uno = (lista, rand) => lista[Math.floor(rand() * lista.length)];
  // ¿alcanza un brinco normal, sin ayuda de Fresita y sin carrerita? Con la física del juego: «sube» en filas (negativo = hacia arriba)
  function alcanza(salto, sube) {
    const arriba = -sube * T, d = JUMP * JUMP - 2 * G * arriba; if (d <= 0) return false;
    return salto * T <= MAXV * (JUMP + Math.sqrt(d)) / G - 22;
  }
  // un tramo sobre el vacío: solo saltos que el mundo ya usa, encadenados
  function cadena(def, R, rand) {
    // el piso de un tramo nuevo siempre está en la fila 11: si el mundo saltaba desde una meseta, la plataforma baja a donde se alcance
    const ida = 4, q0 = uno(R.primeros, rand), fila0 = clamp(q0.fila, 8, 10), q = Object.assign({}, q0, { fila: fila0, salto: alcanza(q0.salto, fila0 - PISO) ? q0.salto : 2 });
    const lista = [{ x: ida + q.salto, y: q.fila, w: q.w, o: q.o || {} }], n = R.pasos.length >= 3 ? 3 + Math.floor(rand() * 4) : R.pasos.length ? 1 : 0;
    const tipo = p => (p.o && p.o.k) || (def.plat || {}).k, mueve = p => MOVILES.has(tipo(p));
    let x = lista[0].x + q.w, y = q.fila, moviles = mueve(lista[0]) ? 1 : 0;
    for (let i = 0; i < n; i++) {
      const c = R.pasos.filter(p => y + p.sube >= 4 && y + p.sube <= 10 && alcanza(p.salto, p.sube) && (moviles < MAX_MOVILES || !mueve(p)) && (tipo(p) !== 'beat' || Math.abs(p.sube) <= 1)); if (!c.length) break;
      const p = uno(c, rand); if (mueve(p)) moviles++; const nx = x + p.salto, ny = y + p.sube; lista.push({ x: nx, y: ny, w: p.w, o: p.o || {} }); x = nx + p.w; y = ny;
    }
    // las que parpadean van en ola: la siguiente ya está prendida cuando la anterior se apaga (a contratiempo no se podría cruzar)
    let fase = rand(); const ritmo = lista.map(p => p.o.per || (def.plat || {}).per).find(Boolean);
    for (const p of lista) if (tipo(p) === 'timed') { p.o = Object.assign({}, p.o, { off: fase }, ritmo ? { per: ritmo } : {}); fase = wrap(fase - .3, 1); }
    // al compás, un salto por golpe: A, B, A, B. Dos seguidas del mismo color dejarían a Itzel en el aire cuando cambie
    let grupo = rand() < .5 ? 'A' : 'B'; for (const p of lista) if (tipo(p) === 'beat') { p.o = Object.assign({}, p.o, { grp: grupo }); grupo = grupo === 'A' ? 'B' : 'A'; }
    const u = uno(R.ultimos, rand), hasta = Math.ceil(x + Math.min(u.salto, 3)), W = hasta + 5, b = Constructor(W);
    b.g(0, ida - 1); b.g(hasta, W - 1); for (const p of lista) b.p(p.x, p.y, p.w, copia({ o: p.o }).o);
    for (const p of lista) if (rand() < .6) { const a = Math.round(p.x), z = Math.round(p.x + p.w) - 1, fila = Math.max(1, Math.round(p.y) - 3); b.c(Math.max(0, a), Math.min(W - 1, z), fila); }
    if (rand() < .6) b.d(rand() < .5 ? 'T' : 'f', 1); if (rand() < .5) b.d('f', W - 3);
    return hechaDe(b, W, .25 + rand() * .75);
  }
  // un tramo de piso: enemigos del mundo y los objetos que él mismo pone en el suelo
  function piso(def, R, rand) {
    const W = 15 + Math.floor(rand() * 10), b = Constructor(W); b.g(0, W - 1);
    const lugares = []; for (let x = 4; x < W - 4; x += 5) lugares.push(x + Math.floor(rand() * 2));
    for (const x of lugares) { const t = rand(); if (R.objetos.length && t < .62) { const c = copia(uno(R.objetos, rand)); c.x = x; if (c.x2 !== undefined) c.x2 = Math.min(W - 3, x + c.x2); b.ents.push(c); } else if (t < .9) b.e(x, undefined, uno(R.suelo, rand)); }
    if (R.islas && rand() < .6) { const a = 4 + Math.floor(rand() * Math.max(1, W - 12)), z = a + 3 + Math.floor(rand() * 3), f = 6 + Math.floor(rand() * 2); b.isl(a, z, f); b.c(a, z, f - 2); } else { const a = 3 + Math.floor(rand() * 3); b.c(a, Math.min(W - 4, a + 5), 8 + Math.floor(rand() * 2)); }
    // la plataforma de siempre del mundo, a poca altura sobre el piso: así el tramo también enseña su mecánica
    const kB = (def.plat || {}).k || 'static';
    if (kB !== 'static' && !NO_APRENDER.has(kB) && !['carro', 'velero', 'grua', 'balanza', 'prisma', 'luna', 'swing'].includes(kB) && rand() < .7) {
      const a = 3 + Math.floor(rand() * Math.max(1, W - 12)), n = 1 + Math.floor(rand() * 2);
      for (let i = 0; i < n; i++) { const x = a + i * 4, y = 8 - 2 * i; if (x + 3 < W - 1) { b.p(x, y, 3, { opcional: true }); b.c(x, x + 2, y - 2); } }
    }
    if (rand() < .7) b.d('T', 2); if (rand() < .6) b.d(rand() < .5 ? 'f' : 'r', W - 2);
    return hechaDe(b, W, rand() * .7);
  }
  // una colina: el piso sube de escalón en escalón (de a una fila), sigue arriba y vuelve a bajar.
  // Da altura al nivel sin cambiar de motor: arriba van los bichos y objetos del mundo, y desde ahí arrancan las rutas altas
  function colina(def, R, rand) {
    const alto = 2 + Math.floor(rand() * 3), ancho = 3 + Math.floor(rand() * 2), meseta = 6 + Math.floor(rand() * 5), W = 3 + alto * 2 + meseta + alto * 2 + 3, b = Constructor(W);
    b.g(0, W - 1);
    let x = 3; for (let i = 1; i <= alto; i++) { b.g(x, W - 1, PISO - i); x += 2; }
    const m0 = x, m1 = W - 4 - alto * 2; b.g(m0, m1, PISO - alto);
    x = m1 + 1; for (let i = alto - 1; i >= 0; i--) { b.g(x, W - 1, PISO - i); x += 2; }
    // la meseta: un objeto del mundo, un bicho o monedas, y un árbol
    const t = rand(), cx = Math.floor((m0 + m1) / 2);
    if (R.objetos.length && t < .65) { const c = copia(uno(R.objetos, rand)); c.x = cx; if (c.x2 !== undefined) c.x2 = Math.min(m1, cx + c.x2); b.ents.push(c); } else if (t < .8) { b.e(m0 + 1, undefined, uno(R.suelo, rand)); b.e(m1 - 1, undefined, uno(R.suelo, rand)); }
    b.c(m0, m1, PISO - alto - 3); if (rand() < .7) b.d(rand() < .5 ? 'T' : 'f', m0);
    if (rand() < .6) b.e(2, undefined, uno(R.suelo, rand));
    return Object.assign(hechaDe(b, W, .2 + rand() * .7), { tipo: 'colina' });
  }
  // una zanja: el piso baja de a una fila hasta un fondo (de uno a tres escalones) y vuelve a subir: ahí abajo se pelea
  function zanja(def, R, rand) {
    const hondo = 1 + Math.floor(rand() * 2), largo = 5 + Math.floor(rand() * 6), W = 8 + hondo * 4 + largo, b = Constructor(W);
    b.g(0, 3); let x = 4;
    for (let i = 1; i <= hondo; i++) { b.g(x, x + 1, PISO + i); x += 2; }
    b.g(x, x + largo - 1, PISO + hondo); const f0 = x, f1 = x + largo - 1; x += largo;
    for (let i = hondo - 1; i >= 1; i--) { b.g(x, x + 1, PISO + i); x += 2; }
    b.g(x, W - 1);
    const cx = f0 + Math.floor(largo / 2);
    if (R.objetos.length && rand() < .6) { const c = copia(uno(R.objetos, rand)); c.x = cx; if (c.x2 !== undefined) c.x2 = Math.min(f1, cx + c.x2); b.ents.push(c); } else { b.e(cx - 1, undefined, uno(R.suelo, rand)); if (rand() < .6) b.e(cx + 2, undefined, uno(R.suelo, rand)); }
    b.c(f0, f1, PISO + hondo - 3); if (rand() < .6) b.d('f', 1);
    return Object.assign(hechaDe(b, W, .15 + rand() * .75), { tipo: 'zanja' });
  }
  // ---------- tramos nuevos hechos a mano para los mundos que casi no tenían ----------
  // Carnaval solo traía un tramo a mano (y de compás, que no se voltea) y Cyber casi ningún paso aprendido:
  // cada uno arma tramos con sus propias plataformas (el carro que va y viene sobre el barranco, la banda transportadora)
  const EXTRAS = {
    // el desfile: uno a tres carros sobre barrancos, con una calle de por medio
    carnaval(def, R, rand) {
      const n = 1 + Math.floor(rand() * 3), b = Constructor(4 + n * 24); let x = 4; b.g(0, 3);
      for (let i = 0; i < n; i++) {
        const G = 8 + Math.floor(rand() * 3), sp = 24 + Math.floor(rand() * 14), alto = i % 2 ? 8 : 9;
        b.p(x, alto, 5, { k: 'carro', dist: (G - 2) * T, sp, ...(rand() < .4 ? { espera: .8 } : {}) }).c(x + 2, x + G - 1, alto - 3);
        if (G >= 10 && rand() < .45) b.p(x + 3, 5, 3, { k: 'carro', dist: (G - 4) * T, sp: 22 }).c(x + 3, x + G - 2, 3);
        x += G; const L = i === n - 1 ? 6 : 4 + Math.floor(rand() * 3);
        b.g(x, x + L - 1); if (L >= 6) { b.e(x + 3, undefined, uno(R.suelo, rand)); if (rand() < .6) b.o('confeti', x + 1); } else if (rand() < .6) b.o('confeti', x + 1);
        if (rand() < .5) b.d(rand() < .5 ? 'T' : 'f', x + L - 1);
        x += L;
      }
      return Object.assign(hechaDe(b, x, .2 + rand() * .7), { rows: b.rows().map(r => r.slice(0, x)) });
    },
    // las hamacas de Seybaplaya: cada una te avienta sobre el vacío hasta una mesa alta, con canisteles (el rebote es el de su nivel a mano)
    ocaso(def, R, rand) {
      const n = 1 + Math.floor(rand() * 2), b = Constructor(4 + n * 28); let x = 4; b.g(0, 3);
      for (let i = 0; i < n; i++) {
        const fila = 4 + Math.floor(rand() * 2), ancho = 5 + Math.floor(rand() * 3), h0 = x + 2 + (i % 2);
        b.p(h0, 10, 3, { opcional: true }); b.isl(h0 + 5, h0 + 4 + ancho, fila); b.c(h0 + 5, h0 + 4 + ancho, fila - 1);
        x = h0 + 6 + ancho; const L = 6 + Math.floor(rand() * 6); b.g(x, x + L - 1);
        if (rand() < .7) b.e(x + 3, undefined, uno(R.suelo, rand)); if (rand() < .6) b.d(rand() < .5 ? 'T' : 'f', x + 1); x += L;
      }
      return Object.assign(hechaDe(b, x, .25 + rand() * .7), { rows: b.rows().map(r => r.slice(0, x)) });
    },
    // los hongos de luz: rebotan como hamacas y suben a una repisa alta
    biolum(def, R, rand) {
      const S = { k: 'bounce', look: 'shroom', pow: 600, opcional: true }, n = 1 + Math.floor(rand() * 2), b = Constructor(4 + n * 28); let x = 4; b.g(0, 3);
      for (let i = 0; i < n; i++) {
        const fila = 5 + Math.floor(rand() * 2), ancho = 5 + Math.floor(rand() * 3), h0 = x + 1 + (i % 2);
        b.p(h0, 10.5, 2, S); b.isl(h0 + 6, h0 + 5 + ancho, fila); b.c(h0 + 6, h0 + 5 + ancho, fila - 1);
        x = h0 + 7 + ancho; const L = 6 + Math.floor(rand() * 6); b.g(x, x + L - 1);
        if (rand() < .8) b.e(x + 3, undefined, uno(R.suelo, rand)); if (rand() < .6) b.d(rand() < .5 ? 'T' : 'f', x + 1); x += L;
      }
      return Object.assign(hechaDe(b, x, .25 + rand() * .7), { rows: b.rows().map(r => r.slice(0, x)) });
    },
    // las bandas: una o dos bandas largas sobre el vacío, con drones en el aire
    cyber(def, R, rand) {
      const n = 1 + Math.floor(rand() * 2), b = Constructor(4 + n * 34); let x = 4; b.g(0, 3);
      for (let i = 0; i < n; i++) {
        const bw = 8 + Math.floor(rand() * 7), v = rand() < .65 ? 40 + Math.floor(rand() * 26) : -(40 + Math.floor(rand() * 11)), alto = 9 + Math.floor(rand() * 2);
        b.p(x + 2, alto, bw, { v }).c(x + 3, x + 1 + bw, alto - 2); x += bw + 4;
        const L = 8 + Math.floor(rand() * 6); b.g(x, x + L - 1);
        for (const dx of [3, L - 4]) if (rand() < .75) b.e(x + dx, 3 + Math.floor(rand() * 2), uno(R.aire, rand));
        if (rand() < .6) b.d(rand() < .5 ? 'T' : 'f', x + 1); x += L;
      }
      return Object.assign(hechaDe(b, x, .2 + rand() * .7), { rows: b.rows().map(r => r.slice(0, x)) });
    },
  };
  const hechaDe = (b, W, dif) => ({ a: 0, z: W, ancho: W, dif, rows: b.rows(), ents: b.ents.map(copia), nueva: true });
  // pieza por pieza: los enemigos genéricos se resuelven aquí para que cambien entre runs
  function pega(def, lista, C, rand) {
    const rows = Array.from({ length: 15 }, () => ''), ents = [], R = C.reglas; let x0 = 0, corazones = 0;
    for (const q of lista) {
      q.rows.forEach((r, y) => { let t = r; if (t.includes('h')) { if (corazones >= 2) t = t.replace(/h/g, 'o'); else corazones++; } rows[y] += t; });
      for (const e of q.ents) {
        const c = copia(e); for (const k of COLUMNAS) if (c[k] !== undefined) c[k] += x0 - q.a;
        if (c.o && c.o.x2 !== undefined) c.o.x2 += x0 - q.a;
        if (c.t === 'foe' && !c.k) c.k = uno(c.y === undefined ? R.suelo : R.aire, rand);
        ents.push(c);
      }
      x0 += q.ancho;
    }
    for (const e of C.globales) { const c = copia(e); if (c.x2 !== undefined) c.x2 = x0 - 1; ents.unshift(c); }
    return { rows, ents };
  }
  // los doblones: las posiciones originales contaban con las escaleras de las rutas altas, que ahora cambian en cada run.
  // Van sobre las plataformas de la ruta alta recién hecha y, si no alcanzan, en lo más alto de los canisteles: todo eso se puede pisar
  function doblones(nv) {
    const pos = [], W = nv.rows[0].length, lejos = (c, d) => pos.every(q => Math.abs(q.x - c.x) > d);
    const altas = nv.ents.filter(e => e.t === 'coin' && e.platTop);
    for (let i = altas.length - 1; i >= 0 && pos.length < 3; i--) { const c = altas[i]; if (lejos(c, 28)) pos.push({ x: c.x, y: c.y, ent: c }); }
    const cand = []; nv.rows.forEach((r, y) => { for (let x = 6; x < r.length - 6; x++) if (r[x] === 'o') cand.push({ x, y }); }); cand.sort((p, q) => p.y - q.y);
    for (const d of [28, 10, 0]) for (const c of cand) { if (pos.length >= 3) break; if (!pos.some(q => q.celda === c) && lejos(c, d)) pos.push({ x: c.x + .5, y: c.y + .5, celda: c }); }
    pos.slice(0, 3).forEach((q, i) => {
      if (q.ent) nv.ents.splice(nv.ents.indexOf(q.ent), 1);
      if (q.celda) nv.rows[q.celda.y] = nv.rows[q.celda.y].slice(0, q.celda.x) + '.' + nv.rows[q.celda.y].slice(q.celda.x + 1);
      nv.ents.push({ t: 'doblon', i, x: q.x, y: q.y });
    });
  }
  // cada tramo a mano también puede entrar volteado (de derecha a izquierda): duplica las piezas sin diseñar nada nuevo.
  // No se voltea lo que depende de un compás: el orden en que se cruza cambiaría el ritmo (las que parpadean, van al compás, giran…)
  const DE_COMPAS = new Set(['timed', 'beat', 'blink', 'ghost', 'luna', 'cycle', 'lift', 'carro', 'velero', 'grua', 'prisma', 'swing', 'move', 'balanza']);
  function variante(def, q) {
    if (typeof espejar !== 'function' || q.nueva) return [];
    for (const e of q.ents) { if (e.t === 'plat' && DE_COMPAS.has((e.o && e.o.k) || (def.plat || {}).k)) return []; if (e.t === 'plat' && e.o && (e.o.off !== undefined || e.o.per !== undefined)) return []; }
    // los objetos traen la columna del nivel entero: se pasan a columnas de la pieza, se voltean y se devuelven
    const mueve = (e, d) => { const c = copia(e); for (const k of COLUMNAS) if (c[k] !== undefined) c[k] += d; if (c.o && c.o.x2 !== undefined) c.o.x2 += d; return c; };
    const v = espejar({ rows: q.rows, ents: q.ents.map(e => mueve(e, -q.a)) }), ancho = q.rows[0].length;
    return [Object.assign({}, q, { rows: v.rows, ents: v.ents.map(e => mueve(e, q.a)), volteada: true, ancho })];
  }
  function arma(def, semilla) {
    const C = corta(def); if (C.todas < 2 || ((PIEZAS.REGLAS || {})[def.id] || {}).fijo) return null;
    const rand = rng(semilla), bolsa = C.mids.flatMap(q => [q, ...variante(def, q)]), R = C.reglas, yaUsada = q => usadas.some(u => u.a === q.a && u.z === q.z && !u.nueva);
    for (let i = bolsa.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [bolsa[i], bolsa[j]] = [bolsa[j], bolsa[i]]; }
    // lo nuevo de esta partida primero, para que siempre haya; luego lo diseñado a mano hasta completar el largo
    const meta = def.W - C.inicio.ancho - C.fin.ancho, usadas = [], regla = (PIEZAS.REGLAS || {})[def.id] || {}; let ancho = 0;
    const nuevas = []; if (R.cadenas && !regla.sinCadenas) for (let i = 0; i < 2 + (rand() < .5 ? 1 : 0); i++) nuevas.push(cadena(def, R, rand)); nuevas.push(piso(def, R, rand)); if (!R.cadenas || rand() < .5) nuevas.push(piso(def, R, rand)); if (EXTRAS[def.id]) { const k = 1 + (rand() < .5 ? 1 : 0); for (let i = 0; i < k; i++) nuevas.unshift(EXTRAS[def.id](def, R, rand)); }
    if (!regla.sinRelieve) { if (rand() < .9) nuevas.push(colina(def, R, rand)); if (rand() < .7) nuevas.push(zanja(def, R, rand)); }
    // siempre queda un tramo a mano, ahí vive la mecánica del mundo, y siempre entra algo nuevo; lo demás, para que un nivel corto no se duplique, solo si cabe
    const tope = Math.max(meta * .55, def.W * .2); // lo nuevo llena a lo mucho la mitad: el resto son tramos a mano revueltos, que son los que traen las mecánicas del mundo nuevas.sort((p, q) => (tope < 90 ? p.ancho - q.ancho : 0));
    if (bolsa.length) { const q = bolsa.shift(); usadas.push(q); ancho += q.ancho; }
    nuevas.forEach((q, i) => { if (i && ancho + q.ancho > tope) return; usadas.push(q); ancho += q.ancho; });
    for (const q of bolsa) { if (ancho >= meta * .92) break; if (ancho + q.ancho > meta * 1.12 || yaUsada(q)) continue; usadas.push(q); ancho += q.ancho; }
    // desordenado, pero lo de más adelante del diseño tiende a seguir adelante
    const orden = usadas.map(q => ({ q, s: q.dif + rand() * RUIDO })).sort((a, b) => a.s - b.s).map(o => o.q);
    const lista = [C.inicio, ...orden, C.fin], nv = pega(def, lista, C, rand);
    if (typeof window.RUTAS_ALTAS === 'function') { try { window.RUTAS_ALTAS(def, nv); } catch (e) { console.warn('rutas altas', def.id, e); } }
    doblones(nv); nv.lista = lista;
    return nv;
  }
  // el nivel de esta partida: cambia con la semilla y con el mundo
  function nivel(def) {
    const fijo = typeof pedido === 'function' && (pedido('fijo') || new URLSearchParams(location.search).get('fijo'));
    if (fijo || !def.build || def.modo || def.escenarioUayamon) return construirNivel(def);
    return arma(def, ((RUN.seed * 131) ^ (RUN.world * 7919) ^ (RUN.idx * 104729)) >>> 0) || construirNivel(def);
  }
  return { corta, arma, nivel, REGLAS: {} };
})();
