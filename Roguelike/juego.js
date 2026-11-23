'use strict';
// =====================================================================
//  ITZEL · roguelike cooperativo
//  Itzel (teclado) cruza el mundo; Fresita (mouse) cambia las reglas.
//  Cada run: 4 mundos, 2 niveles por mundo, un estilo de arte al azar
//  por mundo y niveles armados con bloques sorteados.
// =====================================================================

// ---------------------------------------------------------------------
//  BLOQUES DE NIVEL (15 filas: 11 de aire + 4 de suelo repetido)
//  '#' suelo · 'o' moneda · 'E' armadillo · 'h' corazón · T f r decoración
// ---------------------------------------------------------------------
const AIR = w => '.'.repeat(w);
function chunk(id, diff, fresita, g, rows) { while (rows.length < 11) rows.unshift(AIR(g.length)); return { id, diff, fresita, g, rows }; }
const CHUNKS = [
  chunk('llano', 0, false, '##############', [
    '....ooo.......',
    '..............',
    '..T........f..',
    'f......r......']),
  chunk('escalones', 0, false, '################', [
    '..........oo....',
    '................',
    '.........####...',
    '....oo..#####...',
    '...####.#####.f.']),
  chunk('hueco', 1, false, '#####...######', [
    '.....ooo......',
    '.T..........f.',
    '...r..........']),
  chunk('isla', 1, false, '####......########', [
    '......ooo.........',
    '..................',
    '......###.........',
    '..................',
    '.f..........T.....']),
  chunk('armadillo', 1, false, '##################', [
    '.....ooo..........',
    '.............T....',
    '..r.......E.....r.']),
  chunk('techo', 1, false, '################', [
    '...##########...',
    '...##########...',
    '................',
    '....o.o.o.o.....',
    '...........E....']),
  chunk('abismo', 1, true, '#####........#####', [
    '.......oooo.......',
    '..................',
    '..................',
    '..................',
    '.r................',
    '...f..........f...']),
  chunk('muro', 2, true, '##############', [
    '.........ooo..',
    '..............',
    '.......#######',
    '.......#######',
    '.......#######',
    '.......#######',
    '.......#######',
    '..f....#######']),
  chunk('escalera', 2, false, '######.......#######', [
    '..............ooo...',
    '.............####...',
    '....................',
    '.........###........',
    '....................',
    '....oo..............',
    '...###..............',
    '.f..................']),
  chunk('dobleHueco', 2, false, '####...####....#####', [
    '..........oo........',
    '....ooo....oooo.....',
    '........f...........',
    '.T..................']),
  chunk('islaAlta', 2, true, '####........######', [
    '.......ooo........',
    '......#####.......',
    '......#####.......',
    '..................',
    '..................',
    '..................',
    '.T..............f.',
    '.....r............']),
  chunk('manada', 3, false, '####################', [
    '.......ooo..........',
    '....................',
    '...E.........E....T.']),
  chunk('pozoArmadillo', 3, true, '#####.........######', [
    '.......ooooo........',
    '....................',
    '....................',
    '....................',
    '..............E.....']),
];
const HEART_CHUNK = chunk('corazon', 0, false, '############', [
  '.....h......',
  '....###.....',
  '............',
  '..........f.']);
const START_CHUNK = chunk('inicio', 0, false, '##########', ['..f...T...', '.P........']);
const END_CHUNK = chunk('meta', 0, false, '################', ['..f.........T...', '.......G........']);
for (const c of [...CHUNKS, HEART_CHUNK, START_CHUNK, END_CHUNK]) for (const r of c.rows) if (r.length !== c.g.length) console.warn('Bloque mal formado:', c.id, JSON.stringify(r));

function genLevel(rand, world, idx, opts = {}) {
  const parts = [START_CHUNK], n = 3 + world + idx, maxDiff = Math.min(3, world + idx);
  let last = null, usedF = false;
  for (let i = 0; i < n; i++) {
    const pool = CHUNKS.filter(c => c.diff <= maxDiff && c.id !== last && !(opts.easy && !['llano', 'escalones', 'hueco', 'armadillo'].includes(c.id)));
    let c;
    const needF = !opts.easy && !usedF && i === n - 2;
    if (needF) { const fp = pool.filter(c => c.fresita); c = fp[Math.floor(rand() * fp.length)]; }
    else { let tot = 0; const w = pool.map(c => { const v = 1 + (c.diff === maxDiff ? 1.2 : 0) + (c.fresita ? .4 : 0); tot += v; return v; }); let r = rand() * tot, k = 0; while (r > w[k]) r -= w[k++]; c = pool[k]; }
    if (c.fresita) usedF = true;
    parts.push(c); last = c.id;
    if (!opts.easy && i === 1 && rand() < .3) parts.push(HEART_CHUNK);
  }
  parts.push(END_CHUNK);
  const rows = [];
  for (let y = 0; y < 15; y++) rows.push(parts.map(c => (y < 11 ? c.rows[y] : c.g)).join(''));
  return rows;
}

// ---------------------------------------------------------------------
//  RUN
// ---------------------------------------------------------------------
const WORLDS = 4;
const BLESS = [
  { id: 'heart', icon: 'jade', name: 'Corazón de jade', desc: '+1 corazón máximo y te cura uno.', apply: R => { R.maxHearts++; R.hearts = Math.min(R.maxHearts, R.hearts + 1); } },
  { id: 'dbl', icon: 'feather', name: 'Pluma de pavo ocelado', desc: 'Itzel puede dar un segundo salto en el aire.', once: true, apply: R => R.upg.dbl = 1 },
  { id: 'dash', icon: 'wind', name: 'Viento de norte', desc: 'Con Shift o K, Itzel se impulsa de golpe, también en el aire.', once: true, apply: R => R.upg.dash = 1 },
  { id: 'dashFilo', req: 'dash', icon: 'wind', name: 'Viento cortante', desc: 'El impulso de Shift o K lastima a los enemigos que atraviesa.', once: true, apply: R => R.upg.dashFilo = 1 },
  { id: 'dashInv', req: 'dash', icon: 'jade', name: 'Impulso de jade', desc: 'Itzel es invulnerable mientras se impulsa.', once: true, apply: R => R.upg.dashInv = 1 },
  { id: 'mag', icon: 'canistel', name: 'Imán de canistel', desc: 'Los canisteles cercanos vuelan hacia Itzel.', once: true, apply: R => R.upg.magnet = 1 },
  { id: 'speed', icon: 'speed', name: 'Huaraches ligeros', desc: 'Itzel corre un 12% más rápido.', max: 2, apply: R => R.upg.speed += .12 },
  { id: 'rebote', icon: 'feather', name: 'Botas de salto', desc: 'Al pisar un enemigo, Itzel rebota con 25% más impulso.', once: true, apply: R => R.upg.rebote = 1 },
  { id: 'suerte', icon: 'heart', name: 'Semilla de la suerte', desc: 'Los enemigos pisados sueltan corazones con 75% de probabilidad si te falta vida.', once: true, apply: R => R.upg.suerte = 1 },
  { id: 'respiro', icon: 'jade', name: 'Amuleto de jade', desc: 'Después de recibir daño, Itzel es invulnerable 0.75 segundos más.', once: true, apply: R => R.upg.respiro = 1 },
  { id: 'cosecha', icon: 'canistel', name: 'Canasta de cosecha', desc: 'Los canisteles recogidos en niveles de plataformas valen el doble.', once: true, apply: R => R.upg.cosecha = 1 },
  { id: 'heal', icon: 'cup', name: 'Pozol frío', desc: 'Recupera todos los corazones.', apply: R => R.hearts = R.maxHearts },
];
let RUN = null;
// dificultad (se escoge en Menú › Opciones y se aplica al empezar cada partida)
//  corazones: con cuántos empiezan · ventana: cuánto dura abierto el núcleo de los jefes · inv: respiro tras un golpe
const DIFS = {
  // las llaves se quedan (así las opciones guardadas siguen sirviendo); cambian nombre y corazones
  tranquila: { nombre: 'Fácil', corazones: 10, ventana: 1.5, inv: 2.5, desc: 'Diez corazones, más tiempo para caerle al núcleo de los jefes y más respiro después de un golpe.' },
  normal: { nombre: 'Medio', corazones: 5, ventana: 1, inv: 2, desc: 'Cinco corazones. Como se pensó el juego.' },
  retadora: { nombre: 'Difícil', corazones: 3, ventana: .75, inv: 1.5, desc: 'Tres corazones y los jefes cierran su núcleo más pronto.' },
};
const opcion = (k, def) => { const o = typeof PROG !== 'undefined' && PROG.d.opciones; return o && o[k] !== undefined ? o[k] : def; };
const difi = () => DIFS[(RUN && RUN.dif) || opcion('dificultad', 'tranquila')] || DIFS.tranquila;
// lo que se pide probar: ?mundo=…&nivel=…&jefe=… en la dirección, o lo que mande la enciclopedia (PIDE)
let PIDE = null;
function pedido(k) { return PIDE ? PIDE[k] || null : new URLSearchParams(location.search).get(k); }
// La partida son cuatro mundos: 1 plataformas sin jefe, 2 un nivel especial (otro género),
// 3 plataformas con jefe y 4 la pelea contra la Ruptura.
const TIPOS_RUN = ['plataforma', 'especial', 'plataforma', 'ruptura'];
function newRun(seed) {
  const rand = rng(seed);
  const styles = ORDERED.filter(s => MUNDOS.includes(s.id) && NIVELES[s.id]); for (let i = styles.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [styles[i], styles[j]] = [styles[j], styles[i]]; }
  // cada lugar de la partida se queda con un mundo que tenga ese tipo de nivel (sin repetir)
  const elegidos = [], usa = tipo => { const i = styles.findIndex(s => !elegidos.includes(s) && (tipo === 'ruptura' || nivelesDe(s.id, tipo).length)); return styles[i >= 0 ? i : 0]; };
  for (const tipo of TIPOS_RUN) elegidos.push(usa(tipo));
  // ?mundo=barro en la dirección (o la enciclopedia) pone ese mundo primero, con el nivel que tenga
  const pide = pedido('mundo'), forz = styles.find(s => s.id === pide);
  if (forz) {
    // El mundo elegido solo sustituye al primero: no debe duplicarse en
    // otra posición, que además puede exigir un nivel especial.
    const repetido = elegidos.indexOf(forz, 1);
    if (repetido >= 0) {
      const tipo = TIPOS_RUN[repetido];
      const reemplazo = styles.find(s => s !== forz && !elegidos.includes(s) && (tipo === 'ruptura' || nivelesDe(s.id, tipo).length));
      if (reemplazo) elegidos[repetido] = reemplazo;
    }
    elegidos[0] = forz;
  }
  RUN = { seed, rand, world: 1, idx: 0, styles: elegidos, hearts: 3, maxHearts: 3, coins: 0, taken: {}, time: 0, naps: 0, stomps: 0,
    upg: { dbl: 0, dash: 0, bubbles: 2, bubbleLife: 5, magnet: 0, lullaby: 1, speed: 1 } };
  if (PRESENTACION.activa() && !pedido('mundo')) {   // la run fija de los jueces
    const ST = id => ORDERED.find(s => s.id === id) || styles[0]; PRESENTACION.PLAN.forEach((m, i) => { elegidos[i] = ST(m.estilo); });
    RUN.styles = elegidos; RUN.presentacion = true; RUN.formaRupturaEntrada = (PRESENTACION.PLAN[3] || {}).forma;
  }
  RUN.desdeEnciclopedia = !!(PIDE && PIDE.desdeEnciclopedia);
  RUN.jugadores = (MULTI.forzar || opcion('jugadores', PRESENTACION.activa() ? 2 : 1)) === 2 ? 2 : 1; MULTI.forzar = 0;   // dos personas: una Itzel (teclado) y otra Fresita (mouse)
  RUN.dif = DIFS[opcion('dificultad', 'tranquila')] ? opcion('dificultad', 'tranquila') : 'tranquila'; RUN.hearts = RUN.maxHearts = DIFS[RUN.dif].corazones;
  // el jefe del mundo 3 sale al azar; al final siempre espera la Ruptura
  const otros = Object.keys(JEFES).filter(k => k !== 'ruptura'); RUN.jefeOrden = [otros[Math.floor(rand() * otros.length)], 'ruptura'];
  if (RUN.presentacion) RUN.jefeOrden = PRESENTACION.PLAN.filter(m => m.jefe).map(m => m.jefe);
  const pj = pedido('jefe'); if (JEFES[pj]) { RUN.jefeOrden = [pj, ...RUN.jefeOrden.filter(k => k !== pj)]; RUN.jefeDirecto = true; }
}
const curStyle = () => RUN.styles[RUN.world - 1];
// Los dibujos de Itzel se piden hasta que hacen falta (imgPerezosa): al armar la partida se piden los de sus cuatro
// mundos, pintando a Itzel una vez en un lienzo aparte, para que ya estén cuando se llegue a cada uno.
function precargaPersonajes() {
  if (!RUN) return; const c = mkCanvas(8, 8).getContext('2d');
  for (const st of RUN.styles) { const fn = st.player || (st.base && STYLE_MAP[st.base] && STYLE_MAP[st.base].player); if (typeof fn !== 'function') continue;
    try { c.save(); fn(c, { x: 4, y: 8, vx: 0, vy: 0, on: true, face: 1, run: 0, inv: 0, sq: 0 }, { t: 0, st }); } catch (e) { /* solo importa que pida la imagen */ } finally { c.restore(); } }
}

// ---------------------------------------------------------------------
//  ESTADO DE UN NIVEL
// ---------------------------------------------------------------------
function makeGame() {
  const g = newGame();
  if (L.espejo) g.p.face = 1; // Empieza mirando a la derecha en los recorridos invertidos.
  { const rec = VISTA.rec || 0; g.cam = clamp(g.p.x - (VW - 2 * rec) * (L.espejo ? .62 : .38) - rec, L.camMin - rec, L.camMax + rec); }   // la cámara arranca ya sobre Itzel (en los niveles al revés, a la derecha)
  g.enemies = []; g.pickups = []; g.bubbles = []; g.rings = []; g.shake = 0;
  for (const e of L.extra) {
    if (e.k === 'E') {
      const cy = Math.floor(e.y / T) - 1; let a = Math.floor(e.x / T), b = a;
      while (a > 0 && Math.floor(e.x / T) - a < 5 && L.solid(a - 1, cy + 1) && !L.solid(a - 1, cy)) a--;
      while (b - Math.floor(e.x / T) < 5 && L.solid(b + 1, cy + 1) && !L.solid(b + 1, cy)) b++;
      g.enemies.push({ x: e.x, y: e.y, dir: -1, x0: a * T + 8, x1: (b + 1) * T - 8, state: 'walk', t: 0, anim: Math.random() * 3 });
    } else if (e.k === 'h') g.pickups.push({ k: 'heart', x: e.x, y: e.cy, got: false });
  }
  g.fre = { x: g.p.x - 20, y: g.p.y - 30, face: 1, cool: 0 };
  g.p.air = 0; g.p.dash = 0; g.p.dashCd = 0; g.p.boost = 0; g.p.plat = null;
  g.plats = []; g.solids = []; g.zones = []; g.foes = []; DYN = g.solids;
  return g;
}

function onBubble(g, x, y) { for (const b of g.bubbles) if (Math.abs(x - b.x) < b.w / 2 + 3 && Math.abs(y - b.y) < .6) return b; return null; }

MEC.setHurt((g, d) => hurt(g, d));
// si David dejó varios diseños para este mundo, cambian cada vez que Itzel recibe daño
function cambiaDiseno(g) {
  const id = curStyle().id; if (!ELEGIDOS[id] || ELEGIDOS[id].length < 2) return;
  RUN.diseno = (RUN.diseno || 0) + 1; aplicaElegido(id, RUN.diseno);
  spawn(g, 16, g.p.x, g.p.y - 8, { v: 70, life: .6, s: 1.8, k: 'spark', cols: ['#ffffff', '#ffd1ea', '#fff3a0'], g: -20 });
}
// Cada pisotón tiene la misma probabilidad, solo si falta vida.
function puedeSoltarCorazon() { return !!RUN && RUN.hearts > 0 && RUN.hearts < RUN.maxHearts && Math.random() < (RUN.upg.suerte ? .75 : .5); }
function sueltaCorazon(g, x, y) {
  if (!g.pickups || !puedeSoltarCorazon()) return false;
  g.pickups.push({ k: 'heart', x, y, got: false, caida: true, vy: -90 }); return true;
}

// Los corazones temporales absorben daño antes que la vida normal.
function recibeDanio(cantidad = 1) {
  const absorbido = Math.min(RUN.escudo || 0, cantidad);
  RUN.escudo = (RUN.escudo || 0) - absorbido;
  RUN.hearts -= cantidad - absorbido;
}
function tiempoInvulnerable() { return difi().inv + (RUN && RUN.upg.respiro ? .75 : 0); }
function reboteEnemigo() { return RUN.upg.rebote ? -531.25 : -425; }

function hurt(g, dir) {
  const p = g.p; if (p.inv > 0 || g.win) return;
  cambiaDiseno(g); if (g.asid && MEC.asideroSuelta) MEC.asideroSuelta(g);
  recibeDanio(); p.inv = tiempoInvulnerable(); p.vx = dir * 170; p.vy = -230; p.on = false; g.shake = .25;
  spawn(g, 14, p.x, p.y - 8, { v: 90, life: .6, s: 2, k: 'spark', cols: ['#ff5d73', '#ffffff'], g: 120 });
  if (RUN.hearts <= 0) animarDerrota(g);
}

// Acentos breves para la entrada, los ataques y los golpes del jefe.
function presenciaJefe(g, dt) {
  if (!g.isBoss || !g.boss) return;
  const b = g.boss, anterior = g.presenciaJefe;
  if (!anterior) {
    g.presenciaJefe = { st: b.st, atk: b.atk, hp: b.hp, espera: 2.8, pulso: 1.6, duracion: 1.6, momento: 'entrada' };
    g.shake = Math.max(g.shake || 0, .85);
    if (typeof SONIDO !== 'undefined') SONIDO.fx('rugidoJefe', b.tipo);
    return;
  }
  anterior.espera = Math.max(0, anterior.espera - dt);
  anterior.pulso = Math.max(0, anterior.pulso - dt);
  const ataque = b.st === 'ataque' && (anterior.st !== 'ataque' || (b.atk && b.atk !== anterior.atk));
  const golpe = Number.isFinite(b.hp) && Number.isFinite(anterior.hp) && b.hp < anterior.hp;
  if (golpe) {
    anterior.pulso = anterior.duracion = .48; anterior.momento = 'golpe';
    g.shake = Math.max(g.shake || 0, .7);
  } else if (ataque && anterior.espera <= 0) {
    anterior.espera = 3.5; anterior.pulso = anterior.duracion = .85; anterior.momento = 'ataque';
    g.shake = Math.max(g.shake || 0, .52);
    if (typeof SONIDO !== 'undefined') SONIDO.fx('rugidoJefe', b.tipo);
  }
  anterior.st = b.st; anterior.atk = b.atk; anterior.hp = b.hp;
}

// La tinta y las líneas de impacto duran solo un instante y no tapan la zona de combate.
function pintaPresenciaJefe(ctx, g, vista) {
  const e = g.presenciaJefe, b = g.boss;
  if (!e || !b || e.pulso <= 0 || !opcion('sacudida', true)) return;
  const u = 1 - e.pulso / e.duracion, fuerza = Math.sin(Math.PI * u), w = ctx.canvas.width, h = ctx.canvas.height;
  const centroX = Math.max(w * .12, Math.min(w * .88, ((b.x ?? g.cam + VW / 2) - g.cam) * vista.S));
  const centroY = Math.max(h * .18, Math.min(h * .72, ((b.y ?? VH / 2) - (g.camY || 0) - (b.hgt || 60) * .45) * vista.S));
  const color = e.momento === 'golpe' ? '255,224,159' : b.tipo === 'ruptura' ? '238,83,170' : '245,189,91';
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over';
  const vi = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .24, w / 2, h / 2, Math.max(w, h) * .72);
  vi.addColorStop(0, 'rgba(19,9,9,0)'); vi.addColorStop(1, `rgba(22,8,12,${fuerza * (e.momento === 'entrada' ? .72 : .48)})`);
  ctx.fillStyle = vi; ctx.fillRect(0, 0, w, h);
  if (e.momento === 'entrada') {
    const altura = h * .055 * fuerza; ctx.fillStyle = 'rgba(23,13,14,.8)'; ctx.fillRect(0, 0, w, altura); ctx.fillRect(0, h - altura, w, altura);
    ctx.fillStyle = `rgba(${color},${.55 * fuerza})`; ctx.fillRect(0, altura, w, Math.max(1, h * .002)); ctx.fillRect(0, h - altura, w, Math.max(1, h * .002));
  }
  ctx.strokeStyle = `rgba(${color},${fuerza * .6})`; ctx.lineWidth = Math.max(1.2, w * .0018);
  const radio = Math.min(w, h) * (.07 + u * .24); ctx.beginPath(); ctx.arc(centroX, centroY, radio, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = Math.max(1, w * .001); ctx.strokeStyle = `rgba(${color},${fuerza * .48})`;
  for (let i = 0; i < 18; i++) {
    const a = i * Math.PI * 2 / 18 + .1, r = radio + 8 + (i % 3) * 5, largo = Math.min(w, h) * (.035 + (i % 3) * .015) * fuerza;
    ctx.beginPath(); ctx.moveTo(centroX + Math.cos(a) * r, centroY + Math.sin(a) * r); ctx.lineTo(centroX + Math.cos(a) * (r + largo), centroY + Math.sin(a) * (r + largo)); ctx.stroke();
  }
  ctx.restore();
}

// Busca el centro del tramo de suelo continuo y con espacio para Itzel.
function centroReaparicion(g) {
  const seguro = g.safe, p = g.p, fila = Math.floor((seguro.y + 2) / T);
  const inicial = Math.floor(seguro.x / T);
  const apta = col => {
    if (col < 0 || col >= L.gw) return false;
    const x = (col + .5) * T, y = seguro.y;
    if (!solidAt(x, fila * T + 2) || solidAt(x, y - 1)) return false;
    for (let dy = 1; dy < p.h; dy += T / 2)
      if (solidAt(x - p.w / 2, y - dy) || solidAt(x + p.w / 2, y - dy)) return false;
    return true;
  };
  if (!apta(inicial)) return seguro;
  let izq = inicial, der = inicial;
  while (izq > 0 && apta(izq - 1)) izq--;
  while (der + 1 < L.gw && apta(der + 1)) der++;
  const x = (izq + der + 1) * T / 2;
  return { x, y: seguro.y };
}

function stepRun(g, inp, dt, st) {
  const p = g.p, U = RUN.upg, fx = st.fx || {}, dust = fx.dust || ['#ffffff'];
  g.inp = inp;
  g.t += dt; RUN.time += dt;
  MEC.stepGlobal(g, dt); presenciaJefe(g, dt); MEC.stepPlats(g, dt); MEC.carry(g, dt);
  const E = MEC.env(g); g.env = E;
  const ice = (p.plat && p.plat.k === 'ice') || E.ice;
  const maxv = MAXV * U.speed * (E.swim ? .78 : 1) * (E.maxK || 1);
  // ---- horizontal / dash
  p.dashCd -= dt;
  if (inp.dashPress && U.dash && p.dashCd <= 0 && !g.win) { p.dash = .16; p.dashCd = .6; p.sq = -.15; spawn(g, 8, p.x, p.y - 7, { ang: Math.PI * (p.face > 0 ? 1 : 0), spread: .6, v: 70, life: .35, s: 2, k: 'dust', cols: dust }); }
  if (inp.dashPress && U.dash && p.dashCd <= 0 && !g.win) p.dashId = (p.dashId || 0) + 1;   // cada impulso es un golpe nuevo
  if (p.dash > 0 && U.dashInv) p.inv = Math.max(p.inv || 0, .15);   // Impulso de jade: invulnerable mientras se impulsa
  if (p.dash > 0 && U.dashFilo) for (const e of g.foes) {          // Viento cortante: el impulso lastima a quien atraviesa
    if (e.st === 'gone' || e.st === 'off' || e.st === 'sleep' || e.sj || e._dashId === p.dashId) continue;
    if (Math.abs(p.x - e.x) < ((e.w || 10) + (p.w || 10)) / 2 + 4 && p.y > e.y - (e.h || 10) - 3 && p.y - (p.h || 14) < e.y + 3) {
      e._dashId = p.dashId; p.inv = Math.max(p.inv || 0, .25); g.shake = Math.max(g.shake || 0, .08); RUN.stomps++;
      spawn(g, 10, e.x, e.y - (e.h || 10) / 2, { v: 90, life: .35, s: 1.8, k: 'spark', cols: ['#ffffff', '#bfe6ff'], g: 20 });
      if (e.hp > 1 && MEC.VIDA && MEC.VIDA.golpe) MEC.VIDA.golpe(e, g); else { e.st = 'gone'; e.tt = 0; if (typeof sueltaCorazon === 'function') sueltaCorazon(g, e.x, e.y - (e.h || 10) / 2); }
    }
  }
  if (p.dash > 0) { p.dash -= dt; p.vx = p.face * 330; p.vy = 0; if (Math.random() < .7) spawn(g, 1, p.x - p.face * 4, p.y - 7, { v: 10, life: .3, s: 2.2, k: 'dust', cols: dust }); }
  else if (p.boost > 0) { p.boost -= dt; }
  else {
    const acc = (ice ? 420 : p.on ? 1150 : 760) * (E.accK || 1), fr = (ice ? 90 : p.on ? 1500 : 260) * (E.frK || 1), dir = g.win ? 0 : inp.dir;
    if (dir) { p.vx += dir * acc * dt; p.vx = clamp(p.vx, -maxv, maxv); p.face = dir; }
    else { const d = Math.sign(p.vx); p.vx -= d * fr * dt; if (Math.sign(p.vx) !== d) p.vx = 0; }
    if (Math.abs(p.vx) > maxv) p.vx *= Math.pow(.02, dt);
  }
  // ---- salto (coyote, buffer, doble salto)
  p.coyote = p.on ? .11 : p.coyote - dt;
  const sinSalto = g.def && g.def.sinSalto; // aquí solo sube con el clic de Fresita al compás
  if (sinSalto && inp.press) g.pideSalto = 1.3;
  const colgada = g.seda || g.sedaSuelta; g.sedaSuelta = false; // en el hilo (o el cuadro en que se suelta) la tecla no es un salto normal
  p.jb = inp.press && !sinSalto && !colgada ? .13 : p.jb - dt;
  if (p.on) p.air = U.dbl;
  if (E.swim && p.jb > 0) { p.vy = Math.min(p.vy, -185); p.jb = 0; p.on = false; p.sq = -.2; spawn(g, 4, p.x, p.y - 6, { ang: -Math.PI / 2, spread: 1.4, v: 25, life: .7, s: 1.6, k: 'bubble', cols: ['#ffffff'], g: -60 }); }
  else if (p.jb > 0 && p.coyote > 0) { p.vy = -JUMP * E.jumpK; p.jb = 0; p.coyote = 0; p.on = false; p.sq = -.28; spawn(g, 6, p.x, p.y, { ang: -Math.PI / 2, spread: 2.2, v: 40, life: .4, s: 2.2, k: 'dust', cols: dust, g: -20 }); }
  else if (p.jb > 0 && !p.on && p.air > 0) { p.vy = -JUMP * .88; p.jb = 0; p.air--; p.sq = -.22; spawn(g, 10, p.x, p.y - 2, { v: 60, life: .5, s: 1.8, k: 'spark', cols: fx.spark || ['#fff'], g: 40 }); }
  if (p.vy >= 0) p.noCut = false;
  if (p.dash <= 0) {
    if (E.swim) { p.vy = Math.min(p.vy + G * .26 * dt, 75); p.vy *= Math.pow(.6, dt); }
    else { if (!inp.jump && p.vy < -140 && !p.noCut) p.vy += G * 1.7 * E.grav * dt; p.vy = Math.min(p.vy + G * E.grav * dt, 520); }
  }
  // El inicio del mapa coincide con el borde visible más a la izquierda.
  // Se limita también después de zonas y reapariciones, que pueden mover a Itzel.
  const limiteIzquierdo = () => {
    const minimo = L.camMin + p.w / 2 + 2;
    if (p.x < minimo) { p.x = minimo; if (p.vx < 0) p.vx = 0; }
  };
  // ---- mover X (las corrientes empujan)
  const xAntesLapiz = p.x, mvx = p.vx + (E.push || 0); p.x += mvx * dt;
  { const top = p.y - p.h + .5, mid = p.y - p.h / 2, bot = p.y - .5;
    if (mvx > 0) { const r = p.x + p.w / 2; if (SOLID(r, top) || SOLID(r, mid) || SOLID(r, bot)) { p.x = Math.min(...[top, mid, bot].map(y => borde(r, y, 'izq'))) - p.w / 2 - .01; p.vx = 0; } }
    else if (mvx < 0) { const l = p.x - p.w / 2; if (SOLID(l, top) || SOLID(l, mid) || SOLID(l, bot)) { p.x = Math.max(...[top, mid, bot].map(y => borde(l, y, 'der'))) + p.w / 2 + .01; p.vx = 0; } } }
  MEC.muroLapiz(g, xAntesLapiz);
  limiteIzquierdo();
  // ---- mover Y (suelo + burbujas de un solo sentido)
  const wasOn = p.on, vyPrev = p.vy, prevY = p.y;
  p.y += p.vy * dt;
  { const l = p.x - p.w / 2 + .5, r = p.x + p.w / 2 - .5; let pisoTinta = false;
    if (p.vy > 0) {
      if (SOLID(l, p.y) || SOLID(r, p.y)) { p.y = Math.min(borde(l, p.y, 'arriba'), borde(r, p.y, 'arriba')); p.vy = 0; p.plat = null; }
      else if ((pisoTinta = MEC.pisoLapiz(g, prevY))) { }
      else if (MEC.land(g, prevY)) { }
      else for (const b of g.bubbles) if (Math.abs(p.x - b.x) < b.w / 2 + 3 && prevY <= b.y + .5 && p.y >= b.y) { p.y = b.y; p.vy = 0; b.squish = 1; break; }
    } else if (p.vy < 0) { const top = p.y - p.h; if (SOLID(l, top) || SOLID(r, top)) { p.y = Math.max(borde(l, top, 'abajo'), borde(r, top, 'abajo')) + p.h; p.vy = 0; } MEC.techoLapiz(g, prevY); }
    const bub = onBubble(g, p.x, p.y);
    p.on = p.vy >= 0 && (SOLID(l, p.y + .5) || SOLID(r, p.y + .5) || !!bub || pisoTinta || MEC.standing(g));
    if (p.on && !wasOn && vyPrev > 160) { p.sq = clamp(vyPrev / 1400, .12, .32); spawn(g, 9, p.x, p.y, { ang: -Math.PI / 2, spread: 3, v: 55, life: .45, s: 2.4, k: 'dust', cols: dust, g: -10 }); }
    if (p.on && !bub && !p.plat && solidAt(p.x - 6, p.y + 2) && solidAt(p.x + 6, p.y + 2)) g.safe = { x: p.x, y: p.y };
  }
  MEC.zones(g, dt);
  limiteIzquierdo();
  MEC.stepFoes(g, dt, prevY);
  if (STATE !== 'play') return;
  if (p.on) { p.run += Math.abs(p.vx) * dt * .16; if (Math.abs(p.vx) > 60 && Math.random() < .12) spawn(g, 1, p.x - p.face * 3, p.y, { ang: -Math.PI / 2 - p.face * .8, spread: .8, v: 20, life: .35, s: 1.6, k: 'dust', cols: dust, g: -10 }); }
  p.sq *= Math.pow(.0008, dt);
  // ---- caida al vacio
  if (p.y > VH + 40 || E.deadly) {
    if (E.deadly) spawn(g, 18, p.x, p.y - 4, { ang: -Math.PI / 2, spread: 1.6, v: 120, life: .7, s: 2.2, k: 'spark', cols: E.deadlyCols || ['#ff7a2f', '#ffd23f'], g: 160 });
    if (p.y > VH + 40 && RUN.jipi > 0) { RUN.jipi--; toast('El sombrero de jipi los salvó de la caída'); } else recibeDanio();
    if (RUN.hearts <= 0) { animarDerrota(g); return; }
    g.shake = .3; cambiaDiseno(g);
    const lugar = centroReaparicion(g);
    p.x = lugar.x; p.y = lugar.y; p.vx = 0; p.vy = 0; p.inv = Math.max(p.inv || 0, tiempoInvulnerable(), 1.9); p.plat = null; p.boost = 0; p.dash = 0; p.jb = 0;
    limiteIzquierdo();
  }
  if (p.inv > 0) { p.inv -= dt; p.vis = Math.floor(p.inv * 14) % 2 === 0 || p.inv <= 0; } else p.vis = true;

  // ---- burbujas
  for (const b of g.bubbles) { b.life -= dt; b.t += dt; b.squish = (b.squish || 0) * Math.pow(.01, dt); }
  for (const b of g.bubbles) if (b.life <= 0) spawn(g, 10, b.x, b.y + 3, { v: 60, life: .45, s: 1.6, k: 'spark', cols: ['#ffd1ea', '#ffffff'], g: 50 });
  g.bubbles = g.bubbles.filter(b => b.life > 0);

  // ---- armadillos
  for (const e of g.enemies) {
    e.anim += dt;
    if (e.state === 'walk') {
      const nx = e.x + e.dir * 26 * dt, ahead = nx + e.dir * 8;
      if (nx < e.x0 || nx > e.x1 || SOLID(ahead, e.y - 4) || !SOLID(ahead, e.y + 2)) e.dir *= -1; else e.x = nx;
      if (Math.abs(p.x - e.x) < 11 && p.y > e.y - 11 && p.y - p.h < e.y && p.vis !== undefined) {
        if (p.vy > 40 && prevY <= e.y - 6) { e.state = 'gone'; e.t = 0; e.dir = p.x < e.x ? 1 : -1; p.vy = reboteEnemigo(); p.noCut = true; p.on = false; p.plat = null; p.air = U.dbl; RUN.stomps++; sueltaCorazon(g, e.x, e.y - 8); spawn(g, 12, e.x, e.y - 6, { v: 80, life: .5, s: 2, k: 'dust', cols: dust }); }
        else hurt(g, p.x < e.x ? -1 : 1);
      }
    } else if (e.state === 'sleep') { e.t -= dt; if (e.t <= 0) e.state = 'walk'; }
    else if (e.state === 'gone') { e.t += dt; e.x += e.dir * 130 * dt; }
  }
  g.enemies = g.enemies.filter(e => !(e.state === 'gone' && e.t > .9));

  // ---- monedas y corazones
  const take = (c) => { c.got = true; g.got++; if (!c.rebrote) RUN.coins += U.cosecha ? 2 : 1; spawn(g, 14, c.x, c.y, { v: 90, life: .6, s: 2, k: 'spark', cols: fx.spark || ['#ffe680', '#fff'], g: 60 }); };
  for (const c of g.coins) {
    if (c.got || c.demora > 0 || c.piedra) continue;   // los canisteles de piedra solo sirven para el poder Ladrillo
    if (U.magnet) { const dx = p.x - c.x, dy = p.y - 7 - c.y, d = Math.hypot(dx, dy); if (d < 52) { c.x += dx / d * 160 * dt; c.y += dy / d * 160 * dt; } }
    // Al caminar alcanza la fruta de la primera fila sobre el suelo;
    // las filas más altas siguen requiriendo saltar o usar plataformas.
    if (Math.abs(c.x - p.x) < 10 && c.y >= p.y - 30 && c.y < p.y + 5) take(c);
  }
  for (const h of g.pickups) {
    if (h.got) continue;
    if (h.caida) {
      h.vy = Math.min((h.vy || 0) + 500 * dt, 220); h.y += h.vy * dt;
      if (h.vy > 0 && SOLID(h.x, h.y + 5)) { h.y = borde(h.x, h.y + 5, 'arriba') - 5; h.vy = 0; h.caida = false; }
      else if (h.y > VH + 50) h.got = true;
    }
    if (!h.got && RUN.hearts < RUN.maxHearts && Math.hypot(h.x - p.x, h.y - (p.y - 7)) < 12) { h.got = true; RUN.hearts = Math.min(RUN.maxHearts, RUN.hearts + 1); spawn(g, 16, h.x, h.y, { v: 80, life: .7, s: 2, k: 'spark', cols: ['#ff5d73', '#ffd1dc', '#ffffff'], g: 40 }); toast('Un corazón más'); }
  }

  // ---- meta
  if (!g.win && Math.abs(p.x - L.goal.x) < 10 && p.y < L.goal.y + 20) {
    g.win = g.t;
    for (let i = 0; i < 4; i++) spawn(g, 16, L.goal.x, L.goal.y - 30, { ang: -Math.PI / 2, spread: 2.4, v: 170, life: 1.4, s: 2.4, k: 'confetti', cols: fx.confetti || ['#ff5d73', '#ffd23f', '#3ec1d3', '#ffffff', '#9b5de5'], g: 220 });
  }
  // ---- particulas y anillos
  for (const q of g.parts) { q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= Math.pow(.25, dt); q.life -= dt; q.r += dt * 6; }
  g.parts = g.parts.filter(q => q.life > 0);
  for (const r of g.rings) r.t += dt; g.rings = g.rings.filter(r => r.t < r.d);
  g.shake = Math.max(0, g.shake - dt);
  // ---- camara
  // en la pelea de jefe, si la ventana recorta la arena (ventana alta), la cámara encuadra a Itzel y al jefe juntos:
  // antes seguía solo a Itzel y el jefe quedaba medio fuera de cuadro sin que se vieran sus ataques
  const rec = VISTA.rec || 0, jefeVivo = g.isBoss && g.boss && rec > 0 && Number.isFinite(g.boss.x) && g.boss.st !== 'fin';
  const target = jefeVivo ? clamp(p.x * .55 + g.boss.x * .45 - VW / 2,L.camMin - rec, L.camMax + rec) : clamp(p.x - (VW - 2 * rec) * (L.espejo ? .62 : .38) - rec + p.vx * .35, L.camMin - rec, L.camMax + rec);
  g.cam = g.arenaSubjefe ? g.arenaSubjefe.cam : clamp(g.cam + (target - g.cam) * Math.min(1, dt * 4.5), L.camMin - rec, L.camMax + rec);
  // vertical: si la vista no alcanza a ver todo lo alto del mundo, sigue a Itzel cuando sube
  const yMin = -ALTO_MUNDO, yMax = VH - VISTA.H, ty = clamp(p.y - VISTA.H * .62, yMin, yMax);
  g.camY = clamp((g.camY ?? yMax) + (ty - (g.camY ?? yMax)) * Math.min(1, dt * 3.5), yMin, yMax);
}

// ---- Fresita (P2) ----
function stepFresita(g, mouse, dt) {
  const fr = g.fre, p = g.p, U = RUN.upg;
  fr.cool -= dt;
  let tx, ty;
  const cy = g.camY || 0;
  // Se usa el movimiento real del cursor o del mando, aunque Fresita esté inmóvil.
  if (fr.atrapada) {
    const bicho = fr.atrapada;
    if (bicho.dead || bicho.st !== 'agarra') fr.atrapada = null;
    else {
      // se zafa a clics (mouse, mando o dedo): cada clic cuenta
      for (const c of mouse.clicks) if (!c.up) { bicho.clics = (bicho.clics || 0) + 1; MEC.ring(g, fr.x, fr.y, '#ffe27a', 8, .2); }
      if ((bicho.clics || 0) >= (MEC.OBJ.plaga.CLICS || 5)) {
        bicho.st = 'huye'; bicho.vx = (Math.random() < .5 ? -1 : 1) * 100; bicho.vy = -90;
        fr.atrapada = null; fr.cool = .2; MEC.ring(g, fr.x, fr.y, '#ffe27a', 18, .5);
        if (typeof toast === 'function') toast('¡Fresita se soltó!');
      }
      mouse.clicks.length = 0;
      return;
    }
  }
  for (const c of mouse.clicks) if (!c.mundo) { c.y += cy; c.mundo = true; } // los clics llegan en pantalla
  // El objetivo queda en coordenadas del mundo hasta que se mueva el puntero.
  const movioPuntero = mouse.active && (fr.mouseX !== mouse.x || fr.mouseY !== mouse.y);
  if (g.haz) {
    fr.objX = fr.x; fr.objY = fr.y;
  } else if (g.asid) {
    // Fresita sólida: se queda donde se hizo clic
  } else if (movioPuntero) {
    fr.objX = g.cam + mouse.x; fr.objY = mouse.y + cy;
  }
  if (mouse.active) { fr.mouseX = mouse.x; fr.mouseY = mouse.y; }
  tx = fr.objX ?? fr.x; ty = fr.objY ?? fr.y;
  const dx = tx - fr.x, dy = ty - fr.y;
  fr.x += dx * Math.min(1, dt * 9); fr.y += dy * Math.min(1, dt * 9);
  if (Math.abs(dx) > 1.5) fr.face = Math.sign(dx);
  if (g.haz && Math.abs(Math.cos(g.haz.ang)) > .05) fr.face = Math.cos(g.haz.ang) < 0 ? -1 : 1;
  fr.x = clamp(fr.x, g.cam + (VISTA.rec || 0) + 4, g.cam + VW - (VISTA.rec || 0) - 4); fr.y = clamp(fr.y, cy + 6, cy + VISTA.H - 6);
  for (const c of mouse.clicks) {
    const wx = g.cam + c.x, wy = c.y;
    if (c.move) { if (g.power === 'lapiz') MEC.trazaLapiz(g, wx, wy); continue; }
    if (g.power && c.b === 0) { MEC.power(g, c); continue; }
    if (c.up) continue;
    if (c.b === 0) {
      if (fr.cool > 0 || SOLID(wx, wy) || SOLID(wx, wy + 4)) { g.rings.push({ x: wx, y: wy, t: 0, d: .3, c: '#ff8080', r: 8 }); continue; }
      while (g.bubbles.length >= U.bubbles) g.bubbles.shift();
      g.bubbles.push({ x: wx, y: wy, w: 30, life: U.bubbleLife, max: U.bubbleLife, t: 0 });
      fr.cool = .3; g.rings.push({ x: wx, y: wy + 3, t: 0, d: .4, c: '#ffd1ea', r: 18 });
    } else if (c.b === 2) {
      if (fr.cool > 0) continue;
      // la canción de cuna tiene 3 usos por nivel (para que no se abuse); gasta uno solo si de verdad duerme a alguien
      if (g.arrullos === undefined) g.arrullos = 3;
      const rad = 40 * U.lullaby;
      const quienes = [...g.enemies.filter(e => e.state !== 'gone' && Math.hypot(e.x - fr.x, e.y - 6 - fr.y) < rad), ...g.foes.filter(e => (e.st === 'ok' || e.st === 'run' || e.st === 'lunge' || e.st === 'dive') && Math.hypot(e.x - fr.x, e.y - e.h / 2 - fr.y) < rad + 6)];
      if (g.arrullos <= 0) { g.rings.push({ x: fr.x, y: fr.y, t: 0, d: .4, c: '#ff8080', r: 14 }); fr.cool = .5; if (typeof toast === 'function' && !g.avisoArrullo) { g.avisoArrullo = 1; toast('Ya no quedan canciones de cuna en este nivel', 2400); } continue; }
      fr.cool = .5; g.lull = { x: fr.x, y: fr.y, r: rad, t: g.t };
      g.rings.push({ x: fr.x, y: fr.y, t: 0, d: .7, c: '#b9a7ff', r: rad });
      if (quienes.length) g.arrullos--;
      for (const e of g.enemies) if (e.state !== 'gone' && Math.hypot(e.x - fr.x, e.y - 6 - fr.y) < rad) { if (e.state !== 'sleep') RUN.naps++; e.state = 'sleep'; e.t = 5 * U.lullaby; }
      for (const e of g.foes) if ((e.st === 'ok' || e.st === 'run' || e.st === 'lunge' || e.st === 'dive') && Math.hypot(e.x - fr.x, e.y - e.h / 2 - fr.y) < rad + 6) { RUN.naps++; e._golpesDormido = 0; e.st = 'sleep'; e.tt = 5 * U.lullaby; }
    }
  }
  if (g.power === 'lapiz' && g.trazoLapiz && mouse.active) MEC.trazaLapiz(g, g.cam + mouse.x, mouse.y + cy);
  mouse.clicks.length = 0;
}

// ---------------------------------------------------------------------
//  DIBUJO DE LO NUEVO (va dentro del mundo de cada estilo)
// ---------------------------------------------------------------------
function drawArmadillo(ctx, e, t) {
  const walk = e.state === 'walk', bob = walk ? Math.abs(Math.sin(e.anim * 9)) * .8 : 0;
  ctx.save(); ctx.translate(e.x, e.y); ctx.scale(e.dir, 1);
  if (e.state === 'gone') { ctx.globalAlpha = clamp(1 - e.t / .9, 0, 1); ctx.rotate(-e.t * 2); }
  ctx.lineWidth = .8; ctx.strokeStyle = '#1d1420';
  ctx.fillStyle = '#3a2a3a';
  for (const [lx, ph] of [[-4, 0], [3, Math.PI]]) { const k = walk ? Math.sin(e.anim * 9 + ph) * 1.5 : 0; ctx.fillRect(lx + k - .8, -3, 1.8, 3); }
  ctx.beginPath(); ctx.moveTo(-8, -3.5 - bob); ctx.quadraticCurveTo(-12, -2, -11, -1); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -5.5 - bob, 8, 5.3, 0, Math.PI, 0); ctx.lineTo(8, -3 - bob); ctx.lineTo(-8, -3 - bob); ctx.closePath(); ctx.fillStyle = '#8a6a7a'; ctx.fill(); ctx.stroke();
  ctx.save(); ctx.clip(); ctx.strokeStyle = '#5a4252'; ctx.lineWidth = .7; for (let k = -6; k <= 6; k += 3) { ctx.beginPath(); ctx.moveTo(k, -11 - bob); ctx.lineTo(k * 1.2, -3 - bob); ctx.stroke(); } ctx.restore();
  ctx.beginPath(); ctx.ellipse(8.5, -5 - bob, 3.4, 2.6, -.2, 0, TAU); ctx.fillStyle = '#c8a0a8'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10.5, -5.5 - bob); ctx.lineTo(14, -4.2 - bob); ctx.lineTo(10.8, -3.6 - bob); ctx.fillStyle = '#c8a0a8'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(7, -8.2 - bob, 1.1, 2, -.4, 0, TAU); ctx.fill(); ctx.stroke();
  if (e.state === 'sleep') { ctx.beginPath(); ctx.arc(9.4, -5.6, .9, 0, Math.PI); ctx.stroke(); }
  else { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(9.4, -5.8 - bob, 1.2, 0, TAU); ctx.fill(); ctx.fillStyle = '#1d1420'; ctx.beginPath(); ctx.arc(9.8, -5.8 - bob, .6, 0, TAU); ctx.fill(); }
  ctx.restore();
  if (e.state === 'sleep') { ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = 'bold 5px "Alegreya Sans", sans-serif'; for (let k = 0; k < 3; k++) { const ph = (t * .8 + k / 3) % 1; ctx.globalAlpha = 1 - ph; ctx.fillText('z', e.x + 4 + ph * 6 + k, e.y - 12 - ph * 12); } ctx.globalAlpha = 1; }
}
function drawBubble(ctx, b, t) {
  const blink = b.life < 1.2 && Math.sin(t * 28) > 0, sq = (b.squish || 0) * 1.5, grow = Math.min(1, b.t * 6);
  ctx.save(); ctx.translate(b.x, b.y + 3.5); ctx.scale(grow * (1 + sq * .08), grow * (1 - sq * .15));
  ctx.globalAlpha = blink ? .35 : .9;
  const g = ctx.createRadialGradient(-4, -2, 1, 0, 0, b.w / 2); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(.6, 'rgba(255,170,215,.28)'); g.addColorStop(1, 'rgba(255,120,190,.45)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, b.w / 2, 5.5, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = .8; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(-4, -1.8, 6, 1.6, 0, Math.PI * 1.1, Math.PI * 1.75); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(-b.w / 2 + 2, -.4, (b.w - 4) * clamp(b.life / b.max, 0, 1), .8);
  ctx.restore();
}
function drawHeart(ctx, x, y, s, col) {
  ctx.beginPath(); ctx.moveTo(x, y + s * .9); ctx.bezierCurveTo(x - s * 1.4, y - s * .1, x - s * .7, y - s * 1.1, x, y - s * .4); ctx.bezierCurveTo(x + s * .7, y - s * 1.1, x + s * 1.4, y - s * .1, x, y + s * .9); ctx.fillStyle = col; ctx.fill();
}
function drawFresita(ctx, fr, t, pixel) {
  ctx.save(); ctx.translate(fr.x, fr.y + Math.sin(t * 3) * 1.4); ctx.scale(fr.face, 1);
  if (!pixel) { ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 0, 0, 18, '#ff8cc6', .35); ctx.globalCompositeOperation = 'source-over'; }
  ctx.lineWidth = .7; ctx.strokeStyle = '#a8396a';
  ctx.beginPath(); ctx.moveTo(-5, -1); for (let i = 0; i <= 8; i++) ctx.lineTo(-5 - i * 1.1, -1 + Math.sin(t * 8 - i * .7) * i * .25); for (let i = 8; i >= 0; i--) ctx.lineTo(-5 - i * 1.1, 1.4 + Math.sin(t * 8 - i * .7) * i * .25 - i * .25); ctx.closePath(); ctx.fillStyle = '#ffb3d4'; ctx.fill(); ctx.stroke();
  for (const [lx, ph] of [[-3, 0], [2, 1]]) { ctx.beginPath(); ctx.ellipse(lx + Math.sin(t * 6 + ph) * .6, 3.3, .9, 1.6, .4, 0, TAU); ctx.fillStyle = '#ffb3d4'; ctx.fill(); }
  ctx.beginPath(); ctx.ellipse(-1, 0, 6.5, 3.8, 0, 0, TAU); ctx.fillStyle = '#ffc9e0'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-1, 1.6, 4.5, 1.6, 0, 0, TAU); ctx.fillStyle = '#ffe6f1'; ctx.fill();
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + s * (.5 + k * .45) - .5, l = 3.6 - Math.abs(k - 1) * .5; const x0 = 3.5, y0 = -1.5; ctx.strokeStyle = '#ff4f95'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(x0, y0); const wob = Math.sin(t * 5 + k + s) * .3; ctx.lineTo(x0 + Math.cos(a + wob) * l, y0 + Math.sin(a + wob) * l); ctx.stroke(); ctx.fillStyle = '#ff7fb2'; ctx.beginPath(); ctx.arc(x0 + Math.cos(a + wob) * l, y0 + Math.sin(a + wob) * l, .8, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = '#a8396a'; ctx.lineWidth = .7;
  ctx.beginPath(); ctx.arc(4.5, -.5, 4.2, 0, TAU); ctx.fillStyle = '#ffc9e0'; ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#2a1020'; ctx.beginPath(); ctx.arc(6.2, -1.4, .95, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(6.5, -1.8, .35, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#a8396a'; ctx.lineWidth = .5; ctx.beginPath(); ctx.arc(6.4, .9, 1.2, .2, Math.PI - .4); ctx.stroke();
  ctx.fillStyle = 'rgba(255,90,150,.5)'; ctx.beginPath(); ctx.ellipse(4.6, 1.2, .9, .5, 0, 0, TAU); ctx.fill();
  ctx.restore();
}
// gancho que el motor llama dentro de cada estilo
function WORLD_HOOK(ctx, f, layer) {
  const g = f.g; if (!g.bubbles) return;
  MEC.draw(ctx, f, layer, g.def);
  if (layer === 'under') {
    for (const b of g.bubbles) drawBubble(ctx, b, f.t);
    for (const e of g.enemies) drawArmadillo(ctx, e, f.t, f);
    for (const h of g.pickups) if (!h.got) { const yy = h.y + Math.sin(f.t * 3) * 1.5; if (!f.st.pixel) { ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, h.x, yy, 12, '#ff6b8a', .4); ctx.globalCompositeOperation = 'source-over'; } drawHeart(ctx, h.x, yy, 5.2, '#7a0f2a'); drawHeart(ctx, h.x, yy - .3, 4.2, '#ff3b5c'); }
  } else {
    for (const r of g.rings) { const k = r.t / r.d; ctx.strokeStyle = rgba(r.c, 1 - k); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(r.x, r.y, r.r * (.3 + k * .7), 0, TAU); ctx.stroke(); }
    if (f.st.fresita) f.st.fresita(ctx, g.fre, f); else drawFresita(ctx, g.fre, f.t, f.st.pixel);
    // Indica el sentido al comenzar sin tapar permanentemente el escenario.
    if (L.espejo && !g.isBoss && g.t < 5) {
      const x = g.p.x, y = g.p.y - 38 + Math.sin(g.t * 4) * 1.5;
      ctx.save();
      ctx.globalAlpha = Math.min(1, Math.max(0, (5 - g.t) / .6));
      ctx.fillStyle = '#fff4bd'; ctx.strokeStyle = '#713c32'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x - 14, y); ctx.lineTo(x - 5, y - 7);
      ctx.lineTo(x - 5, y - 3); ctx.lineTo(x + 10, y - 3);
      ctx.lineTo(x + 10, y + 3); ctx.lineTo(x - 5, y + 3);
      ctx.lineTo(x - 5, y + 7); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  }
}

// ---------------------------------------------------------------------
//  ENTRADA
// ---------------------------------------------------------------------
const KEYS = new Set(), PRESSED = new Set();
addEventListener('keydown', e => {
  if (!KEYS.has(e.code)) PRESSED.add(e.code); KEYS.add(e.code);
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  if (e.code === 'Escape') { if (STATE === 'play') pause(true); else if (STATE === 'pause') pause(false); }
});
addEventListener('keyup', e => KEYS.delete(e.code));
addEventListener('blur', () => KEYS.clear());
let jumpWas = false;
function p1Input() {
  const l = KEYS.has('ArrowLeft') || KEYS.has('KeyA'), r = KEYS.has('ArrowRight') || KEYS.has('KeyD');
  const j = KEYS.has('Space') || KEYS.has('ArrowUp') || KEYS.has('KeyW') || KEYS.has('KeyZ');
  const press = j && !jumpWas; jumpWas = j;
  const dashPress = PRESSED.has('ShiftLeft') || PRESSED.has('ShiftRight') || PRESSED.has('KeyK') || PRESSED.has('KeyX');
  PRESSED.clear();
  return { dir: (r ? 1 : 0) - (l ? 1 : 0), jump: j, press, dashPress };
}
const MOUSE = { x: 0, y: 0, active: false, last: 0, clicks: [] };
const canvas = document.getElementById('game');
function mousePos(e) { const r = canvas.getBoundingClientRect(); MOUSE.x = (e.clientX - r.left) / r.width * VW; MOUSE.y = (e.clientY - r.top) / r.height * VISTA.H; MOUSE.active = MOUSE.x >= 0 && MOUSE.x <= VW && MOUSE.y >= 0 && MOUSE.y <= VISTA.H; MOUSE.last = performance.now(); }
canvas.addEventListener('mousemove', e => { mousePos(e); if (STATE === 'play' && CUR && CUR.power === 'lapiz' && (e.buttons & 1) && MOUSE.active) MOUSE.clicks.push({ x: MOUSE.x, y: MOUSE.y, b: 0, move: true }); });
canvas.addEventListener('mouseleave', () => MOUSE.active = false);
canvas.addEventListener('mousedown', e => { mousePos(e); if (STATE === 'play') MOUSE.clicks.push({ x: MOUSE.x, y: MOUSE.y, b: e.button }); e.preventDefault(); });
canvas.addEventListener('contextmenu', e => e.preventDefault());
addEventListener('mouseup', e => { if (STATE === 'play' && e.button === 0) { mousePos(e); MOUSE.clicks.push({ x: MOUSE.x, y: MOUSE.y, b: 0, up: true }); } });

// ---------------------------------------------------------------------
//  FLUJO DE PANTALLAS
// ---------------------------------------------------------------------
let STATE = 'title', CUR = null;
const view = new View(canvas, ORDERED[0], false);
const $ = id => document.getElementById(id);
// el nivel ocupa todo lo ancho de la ventana. Si la ventana es más alta que 16:9 la vista crece hacia
// arriba (hasta ALTO_MUNDO px más: el mundo tiene cielo y rutas altas ahí); si aun así sobra, el cielo
// se continúa en la franja «relleno». Los modos (isométrico, nave, torres, cocina) siguen en 16:9.
// Si la ventana es más ancha, se recorta un poquito arriba y abajo (no a los lados: las arenas usan todo lo ancho)
const VISTA = { H: VH, rec: 0 };
const relleno = document.createElement('canvas'); relleno.id = 'relleno'; document.body.prepend(relleno);
let franja = 0;
function fit() {
  // En el menú el escenario cubre la ventana como una imagen de fondo:
  // se recortan los lados o el exceso vertical, sin estirar el terreno.
  if (STATE === 'title') {
    const w = Math.max(innerWidth, innerHeight * VW / VH), h = w * VH / VW;
    VISTA.H = VH; VISTA.rec = Math.max(0, (w - innerWidth) / 2) * VW / w; franja = 0;
    Object.assign(canvas.style, { position: 'absolute', width: w + 'px', height: h + 'px', left: (innerWidth - w) / 2 + 'px', top: (innerHeight - h) / 2 + 'px' });
    relleno.style.display = 'none'; view.resize(w, 4, VH);
    return;
  }
  const modo = !!(CUR && CUR.modo && !CUR.modo.alto && !CUR.modo.extiende); // un modo con `alto` crece hacia arriba como los niveles normales
  let w = Math.min(innerWidth, innerHeight * 16 / 9 / .9);
  VISTA.H = modo ? VH : Math.round(clamp(VW * innerHeight / w, VH, VH + (CUR && CUR.modo && CUR.modo.extiende ? 240 : ALTO_MUNDO)));
  // ventana todavía más alta: se agranda la vista y se recortan los lados (hasta 12% de cada lado);
  // la cámara lo toma en cuenta (VISTA.rec) para que Itzel y las orillas sigan a la vista
  if (!modo && !(CUR && CUR.modo && CUR.modo.extiende) && w * VISTA.H / VW < innerHeight) w = Math.min(innerHeight * VW / VISTA.H, innerWidth / .76);
  VISTA.rec = Math.max(0, (w - innerWidth) / 2) * VW / w;
  const h = w * VISTA.H / VW;
  franja = Math.max(0, innerHeight - h);
  Object.assign(canvas.style, { position: 'absolute', width: w + 'px', height: h + 'px', left: (innerWidth - w) / 2 + 'px', top: (franja > 0 ? franja : (innerHeight - h) / 2) + 'px' });
  Object.assign(relleno.style, { position: 'fixed', left: 0, top: 0, width: '100%', height: franja + 'px', display: franja > 0 ? 'block' : 'none', imageRendering: 'auto' });
  view.resize(w, 4, VISTA.H);
}
// copia la orilla de arriba del cuadro (el cielo) y la estira hacia arriba, con un leve desvanecido
function pintaRelleno() {
  if (franja <= 0 || !canvas.width) return;
  const W = 160, H = Math.max(2, Math.round(franja / 6));
  if (relleno.width !== W || relleno.height !== H) { relleno.width = W; relleno.height = H; }
  const x = relleno.getContext('2d'); x.imageSmoothingEnabled = true;
  x.drawImage(canvas, 0, 0, canvas.width, Math.max(1, Math.round(canvas.height / 120)), 0, 0, W, H);
  const gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,255,255,.10)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, W, H);
}
addEventListener('resize', fit);

// ---------------------------------------------------------------------
//  LETRAS NÍTIDAS EN LOS MUNDOS DE PIXEL
//  Esos mundos se dibujan a muy baja resolución y se agrandan, así que un
//  texto de 6 px queda ilegible. Ahí las letras no se pintan en el lienzo:
//  se anotan y se dibujan encima, en otro lienzo a la resolución de la pantalla.
// ---------------------------------------------------------------------
const TEXTOS = (() => {
  const capa = document.getElementById('textos'), cx = capa.getContext('2d'); let cola = [];
  const bajaRes = () => view.st && (view.S < 3 || !!view.st.base);
  function envolver(c) {
    if (!c || c.__textos) return; c.__textos = true;
    for (const fn of ['fillText', 'strokeText']) {
      const orig = c[fn].bind(c);
      c[fn] = function (txt, x, y, maxW) {
        if (!bajaRes()) return orig(txt, x, y, maxW);
        const m = c.getTransform(), W = c.canvas.width, H = c.canvas.height;
        cola.push({ fn, txt: String(txt), fx: (m.a * x + m.c * y + m.e) / W, fy: (m.b * x + m.d * y + m.f) / H, esc: Math.hypot(m.c, m.d) / H, font: c.font, style: typeof c[fn === 'fillText' ? 'fillStyle' : 'strokeStyle'] === 'string' ? c[fn === 'fillText' ? 'fillStyle' : 'strokeStyle'] : '#ffffff', lw: c.lineWidth * Math.hypot(m.c, m.d) / H, align: c.textAlign, base: c.textBaseline, alpha: c.globalAlpha });
      };
    }
  }
  function pintar() {
    if (STATE === 'pause' || STATE === 'ofrenda') return; // congelado: las letras se quedan como estaban
    const r = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1, w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (capa.width !== w || capa.height !== h) { capa.width = w; capa.height = h; }
    Object.assign(capa.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', transform: canvas.style.transform });
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, w, h);
    for (const t of cola) {
      const k = t.esc * h; cx.globalAlpha = t.alpha; cx.textAlign = t.align; cx.textBaseline = t.base;
      cx.font = t.font.replace(/([\d.]+)px/, (_, n) => (parseFloat(n) * k).toFixed(1) + 'px');
      if (t.fn === 'fillText') { cx.fillStyle = t.style; cx.fillText(t.txt, t.fx * w, t.fy * h); } else { cx.strokeStyle = t.style; cx.lineWidth = Math.max(1, t.lw * h); cx.strokeText(t.txt, t.fx * w, t.fy * h); }
    }
    cx.globalAlpha = 1; cola = [];
  }
  return { envolver, pintar };
})();
TEXTOS.envolver(view.ctx);

// pone una pantalla encima del juego. El letrero del nivel se quita (no debe tapar los títulos); las pantallas con letras
// sobre el mundo llevan velo; y si es la misma pantalla que se vuelve a pintar (comprar, cambiar una opción) no repite su entrada
let PANTALLA_ANTES = '';
function showScreen(html) {
  if (!html || !html.includes('pantalla-derrota')) document.getElementById('mundoRotoDerrota')?.remove();
  const sc = $('screen'); sc.innerHTML = html; sc.classList.toggle('on', !!html);
  const raiz = sc.firstElementChild, clase = raiz ? raiz.className : '', misma = !!clase && clase === PANTALLA_ANTES; PANTALLA_ANTES = clase;
  sc.classList.toggle('velo', !!raiz && clase !== 'title' && !raiz.classList.contains('menu')); sc.classList.toggle('quieta', misma);
  if (!html) return; $('banner').classList.remove('on'); if (!misma) sc.scrollTop = 0;
  let i = 0; for (const el of sc.querySelectorAll('.card, .skin-carta, .est, .logro')) el.style.setProperty('--i', i++);
}
function toast(t, ms = 1800) { const el = document.createElement('div'); el.className = 'toast'; el.textContent = t; $('toasts').appendChild(el); setTimeout(() => el.remove(), ms); }

// imagenes bordadas (se generan una sola vez)
const ICO = {}; const ico = (n, c = 5) => ICO[n + c] || (ICO[n + c] = BORDADO.icon(n, c));
const stitched = (t, c, cols) => BORDADO.text(t, c, cols);

// titulo: un nivel facil jugandose solo con un estilo al azar
function title() {
  STATE = 'title'; $('hud').classList.remove('on');
  // El menú se carga después de este archivo; nunca fabricar otra versión.
  if (typeof menuPrincipal === 'function') {
    const seed = (Math.random() * 1e6) | 0, r = rng(seed);
    setLevel(buildLevelFromRows(genLevel(r, 1, 0, { easy: true })));
    view.auto = true; view.setStyle(STYLE_MAP[MUNDOS[Math.floor(Math.random() * MUNDOS.length)]]); fit();
    menuPrincipal();
  } else {
    showScreen(''); fit();
    addEventListener('load', () => { if (STATE === 'title' && typeof menuPrincipal === 'function') title(); }, { once: true });
  }
}

// ---------------------------------------------------------------------
//  ENCICLOPEDIA DENTRO DEL JUEGO (sin recargar: se abre encima y el juego
//  se queda en pausa; se carga una sola vez y luego solo se muestra)
// ---------------------------------------------------------------------
let ENCI_ANTES = null, ENCI_LLEGA = false; // ENCI_LLEGA: el mundo elegido en el libro abre con la llegada, sin el viaje completo
function abrirEnci() {
  if (STATE === 'play') pause(true);
  ENCI_ANTES = STATE; const box = $('enci');
  let fr = box.querySelector('iframe');
  if (!fr) { fr = document.createElement('iframe'); fr.title = 'Enciclopedia'; fr.src = '../Estilos/index.html?v=jefes-local-2'; box.prepend(fr); }
  else try { fr.contentWindow.ENCI_REFRESCA && fr.contentWindow.ENCI_REFRESCA(); } catch (e) {}
  box.classList.add('on');
}
// al cerrar, el teclado vuelve al juego (si no, las teclas se quedan en la enciclopedia e Itzel no se mueve)
function cerrarEnci() { $('enci').classList.remove('on'); try { const fr = $('enci').querySelector('iframe'); if (fr) fr.blur(); if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); } catch (e) {} window.focus(); }
// La enciclopedia abre una visita individual al nivel o jefe elegido.
function jugarDesdeEnci(mundo, nivel, jefe, forma, lado) {
  cerrarEnci(); PIDE = { mundo, nivel, jefe, forma, lado, desdeEnciclopedia: true }; ENCI_LLEGA = !jefe; empezar();
}
function volverMenuDesdeEnci() { cerrarEnci(); PIDE = null; title(); }
function volverAEnci() { PIDE = null; title(); abrirEnci(); }
// arma la partida; con ?jefe=… se pelea contra ese jefe de una vez (en el mundo pedido)
function empezar() {
  newRun((Math.random() * 1e6) | 0); precargaPersonajes();
  if (RUN.jefeDirecto) startBoss(); else startLevel();
}
$('enciCerrar').onclick = cerrarEnci;
// un botón con el foco se activaría con Espacio (el salto): al hacer clic, se suelta el foco
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('button'); if (b) b.blur(); });
$('menuBtn').onclick = () => { if (STATE === 'play') pause(true); else if (STATE === 'pause') pause(false); };
addEventListener('keydown', e => { if (e.code === 'Escape' && $('enci').classList.contains('on')) { cerrarEnci(); e.stopImmediatePropagation(); } }, true);

// ¿este nivel se juega de derecha a izquierda? El ocaso siempre; los demás, en cuatro de cada diez partidas (según la semilla).
// Con ?fijo=1 o ?lado=derecha se juegan como se diseñaron, y ?lado=izquierda los voltea todos
function ladoAlReves(def) {
  const q = typeof pedido === 'function' ? pedido('lado') : new URLSearchParams(location.search).get('lado');
  if (def.espejo === false || def.escenarioUayamon || (typeof pedido === 'function' && pedido('fijo')) || q === 'derecha') return false;
  if (q === 'izquierda') return true;
  return ((((RUN.seed * 2654435761) ^ (RUN.world * 40503) ^ (RUN.idx * 7001)) >>> 0) % 100) < 42;
}
// un nivel de derecha a izquierda: las filas y todo lo que lleva el nivel, al revés
function espejar(nv) {
  const W = nv.rows[0].length, rows = nv.rows.map(r => r.padEnd(W, '.').split('').reverse().join(''));
  const voltea = (o) => {
    const e = Object.assign({}, o), ancho = e.w || 1;
    if (e.t === 'doblon') e.x = W - e.x;                                    // los doblones van en coordenadas continuas
    else if (e.t === 'zone') { e.x0 = W - 1 - o.x1; e.x1 = W - 1 - o.x0; }
    else if (typeof e.x === 'number') e.x = W - e.x - ancho;
    if (e.o && typeof e.o === 'object') { e.o = Object.assign({}, e.o); if (typeof e.o.x2 === 'number') e.o.x2 = W - e.o.x2 - ancho; }
    if (typeof o.x2 === 'number' && e.t !== 'zone') e.x2 = W - o.x2 - ancho;
    if (typeof e.dir === 'number') e.dir = -e.dir;
    if (e.o && typeof e.o.dir === 'number') e.o.dir = -e.o.dir;
    return e;
  };
  return { rows, ents: (nv.ents || []).map(voltea) };
}
// ---- reintentar el nivel: al empezar cada nivel o jefe se guarda cómo venía la partida ----
function fotoNivel(boss) {
  RUN.reintento = { boss, coins: RUN.coins, gastado: RUN.gastado, semillas: RUN.semillas, naps: RUN.naps, stomps: RUN.stomps, subjefes: RUN.subjefes,
    bossIdx: RUN.bossIdx || 0, escudo: RUN.escudo || 0, jipi: RUN.jipi || 0, upg: JSON.parse(JSON.stringify(RUN.upg)), taken: Object.assign({}, RUN.taken), def: null };
}
// el mismo nivel (o el mismo jefe) de este mundo, con la partida como venía y los corazones llenos
function reintentarNivel() {
  const r = RUN && RUN.reintento; if (!r) { empezar(); return; }
  Object.assign(RUN, { coins: r.coins, gastado: r.gastado, semillas: r.semillas, naps: r.naps, stomps: r.stomps, subjefes: r.subjefes, bossIdx: r.bossIdx,
    escudo: r.escudo || 0, jipi: r.jipi || 0, upg: JSON.parse(JSON.stringify(r.upg)), taken: Object.assign({}, r.taken) });
  RUN.hearts = RUN.maxHearts; RUN.reintentando = true;
  if (r.boss && r.formaRuptura) RUN.formaRupturaEntrada = r.formaRuptura;
  if (r.boss) startBoss(); else { RUN.reintentoDef = r.def; startLevel({ directo: true }); }
}
function startLevel() {
  // la espera es la pantalla oscura con las equis (puntadas) en la esquina; se mantiene encendida hasta que el nivel y su demostración estén listos
  STATE = 'loading'; showScreen(''); document.documentElement.classList.add('directo');
  const mantener = setInterval(() => document.documentElement.classList.add('directo'), 120), sueltaEspera = () => { clearInterval(mantener); document.documentElement.classList.remove('directo'); };
  setTimeout(sueltaEspera, 20000);   // por si algo falla armando el nivel: que no se quede trabada
  const st = curStyle();
  $('loadName').textContent = st.name;
  if (!RUN.reintentando) fotoNivel(false); RUN.reintentando = false;
  setTimeout(() => {
    const def = (RUN.reintentoDef && NIVELES[RUN.reintentoDef]) || (RUN.presentacion && NIVELES[(PRESENTACION.mundo(RUN.world) || {}).nivel]) || nivelPara(st.id, RUN.rand, TIPOS_RUN[RUN.world - 1]); RUN.reintentoDef = null;
    if (RUN.reintento) RUN.reintento.def = def ? def.id : null;
    RUN.nivelGuardado = def ? def.id : null;
    if (typeof PARTIDA !== 'undefined') PARTIDA.guarda();
    if (def && def.modo && MODOS[def.modo]) {
      setLevel(buildLevelFromRows(FONDO_MODO)); CUR = MODOS[def.modo].crear(def, st); CUR.def = def; CUR.modo = MODOS[def.modo];
      ENCI.mundo(def);
    }
    else if (def) { let nv = PIEZAS.nivel(def); const alReves = pedido('lado') ? ladoAlReves(def) : (def.espejo || ladoAlReves(def)); if (alReves) nv = espejar(nv); setLevel(buildLevelFromRows(nv.rows)); if (alReves) { L.espejo = true; L.anchoEspejo = nv.rows[0].length; } L.escenarioUayamon = def.escenarioUayamon || null; CUR = makeGame(); MEC.init(CUR, def, nv.ents); CUR.def = def; COOP.init(CUR); ENCI.mundo(def); }
    else { const lr = rng(RUN.seed * 31 + RUN.world * 7 + RUN.idx); setLevel(buildLevelFromRows(genLevel(lr, RUN.world, RUN.idx))); CUR = makeGame(); }
    aplicaElegido(st.id, 0);
    view.auto = false; view.setStyle(st); fit(); view.g = CUR;
    if (CUR.modo) CUR.modo.pintar(CUR, view); else { view.y0 = CUR.camY ?? VH - VISTA.H; view.render(); }
    const pw = def && MEC.POW[def.power];
    const claveDemo = pw ? INTRO_NIVEL.precarga(def.power, st.id, def.id) : null;
    // la pantalla de carga sigue hasta que la demostración del poder esté lista (o falle / tarde demasiado)
    const entra = () => {
    sueltaEspera(); $('loading').classList.remove('on'); $('hud').classList.add('on'); HUDKEY = '';
    STATE = 'play';
    banner(`${RUN.desdeEnciclopedia ? 'Nivel' : `Mundo ${RUN.world} de ${WORLDS}`}${def && def.lugar && def.id !== 'paper' ? ' · ' + def.lugar : ''}`, def ? def.nombre : st.name, def && def.id === 'abordaje' ? '' : def ? `${def.lema} Fresita tiene ${pw.name.toLowerCase()}.` : st.ref, { etiqueta: RUN.desdeEnciclopedia ? 'Nivel' : `Mundo ${RUN.world} de ${WORLDS}`, titulo: def ? def.nombre : st.name, nivel: def && def.id, vistaNivel: !!(def && def.modo), lugar: def && def.lugar, epoca: def && INTRO_NIVEL.epoca(def.id), lema: def ? def.lema : '', poder: pw ? { nombre: pw.name, ayuda: pw.help.replace(/^Fresita:? /, ''), id: def.power, mundo: st.id } : null });
    // cómo se usa el poder: solo la primera vez que sale (después lo recuerda la etiqueta de arriba)
    if (pw && !matchMedia('(pointer: coarse)').matches && def.id !== 'abordaje' && def.id !== 'planos' && !(PROG.d.ayudas = PROG.d.ayudas || {})[def.power]) { PROG.d.ayudas[def.power] = 1; PROG.save(); setTimeout(() => { if (STATE === 'play' && CUR && CUR.def === def) toast(/^Fresita/.test(pw.help) ? pw.help : `Fresita: ${pw.help}`, 4500); }, 4200); }
    };
    INTRO_NIVEL.espera(claveDemo, 9000).then(entra);
  }, 60);
}
function startBoss() {
  STATE = 'loading'; showScreen(''); $('loading').classList.add('on');
  if (!RUN.reintentando) fotoNivel(true); RUN.reintentando = false;
  const st = curStyle(), def = NIVELES[st.id], tipo = RUN.jefeOrden[(RUN.bossIdx = (RUN.bossIdx || 0) + 1) - 1] || 'ruptura';
  $('loadName').textContent = JEFES[tipo].nombre;
  setTimeout(() => {
    const nv = construirArena(def, tipo); setLevel(buildLevelFromRows(nv.rows)); L.goal = { x: -9999, y: -9999 };
    CUR = makeGame(); MEC.init(CUR, def, nv.ents); CUR.def = def; CUR.isBoss = true;
    // La forma se elige al crear el jefe, después de guardar la foto del nivel.
    if (tipo === 'ruptura' && CUR.boss && CUR.boss.F && RUN.reintento) RUN.reintento.formaRuptura = CUR.boss.F.id;
    view.auto = false; view.setStyle(st); fit(); view.g = CUR; view.y0 = CUR.camY ?? VH - VISTA.H; view.render();
    $('loading').classList.remove('on'); $('hud').classList.add('on'); HUDKEY = '';
    const pw = MEC.POW[def.power], modo = modoJefe(def.power);
    const clave = tipo === 'ruptura' && /Huracán/.test(JEFES.ruptura.nombre) ? 'huracan' : tipo;
    STATE = 'play';
    banner(RUN.desdeEnciclopedia ? 'Jefe' : `Jefe del mundo ${RUN.world}`, JEFES[tipo].nombre, modo === 'alcance' ? `Su núcleo se abre arriba después de cada ataque. Fresita, sube a Itzel con ${pw.name.toLowerCase()}.` : `Cuando abra el núcleo, Fresita lo aturde con ${pw.name.toLowerCase()} y Itzel le cae encima.`, { etiqueta: RUN.desdeEnciclopedia ? 'Jefe' : `Jefe del mundo ${RUN.world}`, titulo: JEFES[tipo].nombre, lugar: INTRO_NIVEL.lugar(clave) || def.lugar, epoca: INTRO_NIVEL.epoca(clave), lema: JEFES[tipo].lema, poder: pw ? { id: def.power, mundo: st.id, nombre: pw.name, ayuda: modo === 'alcance' ? `Su núcleo se abre arriba después de cada ataque. Sube a Itzel con ${pw.name.toLowerCase()}.` : `Cuando abra el núcleo, aturde al jefe con ${pw.name.toLowerCase()} y Itzel le cae encima.` } : null });
    if (typeof ENCI !== 'undefined') { ENCI.ver('jefe:' + tipo); ENCI.ver('variante:' + tipo + ':' + st.id); }
  }, 60);
}
let CARTEL_HASTA = 0; const cartelVisible = () => performance.now() < CARTEL_HASTA; // los avisos esperan a que el cartel del nivel se vaya
function banner(a, b, c, info) { if (info && INTRO_NIVEL.mostrar(info, () => { STATE = 'play'; banner(a, b, c); })) return; CARTEL_HASTA = performance.now() + 3500; const el = $('banner'); el.innerHTML = `<div class="panel"><small>${a}</small><b>${b}</b><i>${c}</i></div>`; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); }

function levelDone() {
  if (RUN.desdeEnciclopedia) { volverAEnci(); return; }
  if (!CUR.isBoss && JEFE_EN(RUN.world) && NIVELES[curStyle().id]) { startBoss(); return; }
  if (RUN.world >= WORLDS) { victory(); return; }
  ofrenda();
}
// lo que es cierto del lugar que acaban de recorrer
const datoCampeche = () => {
  if (!CUR) return '';
  const jefe = !!(CUR.isBoss && CUR.boss), d = jefe ? JEFES[CUR.boss.tipo] : CUR.def;
  const id = jefe ? CUR.boss.tipo : d && d.id;
  if (id && typeof DATOS_CAMPECHE !== 'undefined') {
    const dato = DATOS_CAMPECHE.siguiente(id, jefe);
    return `<p class="dato-camp"><b>Campeche de verdad.</b> ${dato.texto}</p>`;
  }
  return d && d.dato ? `<p class="dato-camp"><b>Campeche de verdad.</b> ${d.dato}</p>` : '';
};
// Los corazones y canisteles que llevan, con iconos en vez de texto (corazones llenos y vacíos; canisteles de Itzel + semillas de Fresita a 5 cada una)
function resumenRun() {
  if (!document.getElementById('estiloResumenRun')) {
    const st = document.createElement('style'); st.id = 'estiloResumenRun';
    st.textContent = `.resumenRun { display:flex; align-items:center; justify-content:center; gap:26px; flex-wrap:wrap; margin-top:14px; color:#fff3dc; font:800 22px 'Alegreya Sans', sans-serif }
      .resumenRun .rcan { display:flex; align-items:center; gap:6px } .resumenRun .rcan img { height:24px; margin:0 }
      .resumenRun .rcor { display:flex; align-items:center; gap:3px } .resumenRun .rcor img { height:21px; margin:0 } .resumenRun .rcor img.vacio { opacity:.28; filter:grayscale(1) }`;
    document.head.appendChild(st);
  }
  const total = (RUN.coins || 0) + 5 * (RUN.semillas || 0);
  return `<div class="resumenRun"><span class="rcor" title="${RUN.hearts} de ${RUN.maxHearts} corazones">${Array.from({ length: RUN.maxHearts }, (_, k) => `<img class="${k < RUN.hearts ? '' : 'vacio'}" src="${ico('heart', 3)}" alt="">`).join('')}</span><span class="rcan" title="Canisteles de Itzel y semillas de Fresita (cada semilla vale 5)"><img src="${ico('canistel', 3)}" alt="Canisteles"><b>${total}</b></span></div>`;
}
function ofrenda() {
  STATE = 'ofrenda'; $('hud').classList.remove('on');
  const ok = BLESS.filter(b => !(b.req && !RUN.upg[b.req]) && !(b.once && RUN.taken[b.id]) && !(b.max && (RUN.taken[b.id] || 0) >= b.max) && !(b.id === 'heal' && RUN.hearts === RUN.maxHearts));
  const pick = []; while (pick.length < 3 && ok.length) pick.push(ok.splice(Math.floor(RUN.rand() * ok.length), 1)[0]);
  showScreen(`<div class="ofrenda"><img class="hstitch" alt="Ofrenda" src="${stitched('Ofrenda', 8)}"><p class="sub">Escojan un regalo para el camino</p>
    <div class="cards">${pick.map((b, i) => `<button class="card panel" style="--r:${(i - 1) * 1.5}deg" data-i="${i}"><img src="${ico(b.icon, 7)}"><b>${b.name}</b><span>${b.desc}</span></button>`).join('')}</div>
    ${datoCampeche()}
    <p class="hint">Después escogen por dónde seguir al mundo ${RUN.world + 1}.</p>${resumenRun()}</div>`);
  const cartasOf = [...document.querySelectorAll('.card')], tomaRegalo = k => { MULTI.limpia(); const b = pick[k]; b.apply(RUN); RUN.taken[b.id] = (RUN.taken[b.id] || 0) + 1; eligeCamino(siguienteMundo); };
  cartasOf.forEach((el, k) => el.onclick = () => tomaRegalo(k));
  if (MULTI.dos()) MULTI.elige(cartasOf, tomaRegalo);   // con dos personas, Itzel también puede escoger con el teclado
}
function siguienteMundo() { RUN.world++; RUN.idx = 0; if (TIPOS_RUN[RUN.world - 1] === 'ruptura') startBoss(); else startLevel(); }

// ---------------------------------------------------------------------
//  ELEGIR CAMINO
//  Después de la ofrenda salen dos destinos para el mundo que sigue: el que
//  ya traía la partida y otro que no se ha visitado. Cada carta dice el lugar
//  de Campeche, qué clase de nivel es y el poder de Fresita, con una postal
//  del mundo pintada en su estilo. El nivel queda decidido desde la carta.
// ---------------------------------------------------------------------
const GENEROS = { iso: '2.5D isométrico', torres: 'Tower defense', vuelo: "Shoot 'em up", cocina: 'Cocina cooperativa', jarana: 'Equilibrio en la vaquería', campechanidad: 'Baile de la Campechanita', carrera: 'Carreras', pesca: 'Pesca cooperativa', planos: 'Planta y alzado', vela: 'Navegación a vela', golpes: "Beat 'em up" };
function claseDeNivel(def, tipo, mundo) {
  if (tipo === 'ruptura') return 'Pelea final contra la Ruptura';
  if (esEspecial(def)) return GENEROS[def.modo] || 'Nivel especial';
  const forma = /^subida_/.test(def.id) ? 'Plataformas hacia arriba' : /^bajada_/.test(def.id) ? 'Plataformas hacia abajo' : 'Plataformas';
  return forma + (JEFE_EN(mundo) ? ' y jefe' : '');
}
function postalMundo(lienzo, st) {
  try {
    const v = new View(mkCanvas(1, 1), st, true); v.resize(VW * .9 / (window.devicePixelRatio || 1), .9); for (let i = 0; i < 70; i++) v.update(1 / 60); v.render();
    lienzo.width = v.c.width; lienzo.height = v.c.height; lienzo.getContext('2d').drawImage(v.c, 0, 0);
  } catch (e) { /* sin postal: la carta se queda con su texto */ }
}
function eligeCamino(seguir) {
  const i = RUN.world, tipo = TIPOS_RUN[i], sirve = s => tipo === 'ruptura' || nivelesDe(s.id, tipo).length;
  const libres = ORDERED.filter(s => MUNDOS.includes(s.id) && NIVELES[s.id] && !RUN.styles.includes(s) && sirve(s));
  if (!libres.length || RUN.desdeEnciclopedia) { seguir(); return; }
  const ops = [RUN.styles[i], libres[Math.floor(RUN.rand() * libres.length)]].map(st => ({ st, def: tipo === 'ruptura' ? NIVELES[st.id] : nivelPara(st.id, RUN.rand, tipo) }));
  if (RUN.rand() < .5) ops.reverse();
  STATE = 'ofrenda'; $('hud').classList.remove('on');
  showScreen(`<div class="ofrenda camino"><img class="hstitch" alt="Camino" src="${stitched('Camino', 8)}"><p class="sub">¿Por dónde siguen? Mundo ${i + 1} de ${WORLDS}</p>
    <div class="cards">${ops.map((o, k) => { const pw = MEC.POW[o.def.power]; return `<button class="card panel" style="--r:${k ? 1.2 : -1.2}deg" data-i="${k}"><canvas></canvas>
      <small>${o.def.lugar || o.st.name}</small><b>${tipo === 'ruptura' ? o.st.name : o.def.nombre}</b><i>${claseDeNivel(o.def, tipo, i + 1)}</i>
      <span>${tipo === 'ruptura' ? o.def.nombre + '.' : o.def.lema || ''}${pw ? ` Fresita tiene ${pw.name.toLowerCase()}.` : ''}</span></button>`; }).join('')}</div>
    ${resumenRun()}</div>`);
  const cartas = [...document.querySelectorAll('.camino .card')];
  // mientras se escoge, las demostraciones de poder de las dos opciones ya se van cargando: al entrar al nivel el video está listo
  const demoDe = o => tipo !== 'ruptura' && o.def && o.def.power && typeof INTRO_NIVEL !== 'undefined' ? [o.def.power, o.st.id, o.def.id] : null;
  ops.forEach(o => { const d = demoDe(o); if (d) INTRO_NIVEL.precarga(...d); });
  const sigueCon = k => { const o = ops[k]; ops.forEach((q, n) => { if (n !== k) { const d = demoDe(q); if (d) INTRO_NIVEL.descarta(...d); } }); RUN.styles[i] = o.st; if (tipo !== 'ruptura') RUN.reintentoDef = o.def.id; precargaPersonajes(); seguir(); };
  if (MULTI.dos()) MULTI.vota(cartas, sigueCon);   // cada persona escoge; si no coinciden, decide una moneda
  else cartas.forEach((el, k) => el.onclick = () => sigueCon(k));
  // las postales se pintan sobre un nivel de muestra, ya con la pantalla puesta (y otra vez cuando llegan sus imágenes)
  const pinta = () => { if (!cartas[0].isConnected) return; setLevel(buildLevelFromRows(genLevel(rng(RUN.seed + i), 1, 0, { easy: true }))); cartas.forEach((el, k) => postalMundo(el.querySelector('canvas'), ops[k].st)); };
  setTimeout(pinta, 30); setTimeout(pinta, 900);
}
function stats() {
  const segundos = Math.max(0, Math.floor(RUN.time || 0));
  const horas = Math.floor(segundos / 3600), minutos = Math.floor(segundos % 3600 / 60), seg = segundos % 60;
  const tiempo = horas ? `${horas}:${String(minutos).padStart(2, '0')}:${String(seg).padStart(2, '0')}` : `${minutos}:${String(seg).padStart(2, '0')}`;
  const cantidad = n => Math.max(0, Number(n) || 0).toLocaleString('es-MX');
  const disponibles = Number(RUN.coins) || 0, gastados = Number(RUN.gastado) || 0;
  const datos = [
    ['Tiempo en plataformas', tiempo, 'Sin contar pausas ni otros modos'],
    ['Canisteles obtenidos', cantidad(disponibles + gastados), `${cantidad(gastados)} gastados · ${cantidad(disponibles)} disponibles`],
    ['Semillas de luz', cantidad(RUN.semillas), 'Recogidas por Fresita'],
    ['Corazones restantes', `${cantidad(RUN.hearts)} / ${cantidad(RUN.maxHearts)}`, 'Al terminar la aventura'],
    ['Subjefes vencidos', cantidad(RUN.subjefes), 'Durante la partida']
  ];
  return `<section class="resumen-partida" aria-label="Resumen de la partida"><h3>Su aventura en números</h3><div class="resumen-datos">${datos.map(([etiqueta, valor, detalle]) => `<div class="resumen-dato"><span>${etiqueta}</span><strong>${valor}</strong><small>${detalle}</small></div>`).join('')}</div></section>`;
}
function worldsList() {
  if (RUN.desdeEnciclopedia) { const nombre = CUR && CUR.isBoss && CUR.boss ? JEFES[CUR.boss.tipo].nombre : CUR && CUR.def ? CUR.def.nombre : curStyle().name; return `<div class="worlds"><span class="here">${nombre}</span></div>`; }
  return `<div class="worlds">${RUN.styles.map((s, i) => `<span class="${i + 1 < RUN.world || STATE === 'win' ? 'done' : i + 1 === RUN.world ? 'here' : ''}">${i + 1}. ${(NIVELES[s.id] || s).nombre || s.name}</span>`).join('')}</div>`;
}
// La última vida rompe el cuadro del mundo por una diagonal que pasa por Itzel.
function animarDerrota(g) {
  if (STATE !== 'play') return;
  STATE = 'derrotaAnimacion'; $('hud').classList.remove('on');
  const original = document.getElementById('game'), rect = original.getBoundingClientRect();
  const capa = document.createElement('div');
  capa.id = 'mundoRotoDerrota';
  capa.style.cssText = 'position:fixed;inset:0;z-index:90;background:#170d0d;overflow:hidden;pointer-events:none';
  const p = g && g.p, proporcion = p && Number.isFinite(p.x) && !g.modo ? (p.x - g.cam) / VW : .5;
  const centro = clamp(proporcion, .18, .82) * 100;
  const impactoY = p && Number.isFinite(p.y) && !g.modo ? clamp((p.y - (g.camY || 0) - (p.h || 14) / 2) / VISTA.H, .15, .85) : .5;
  const pendiente = 36, arriba = clamp(centro + pendiente * impactoY, 3, 97), abajo = clamp(centro - pendiente * (1 - impactoY), 3, 97);
  const quiebre = [[arriba,0]], offsets = [1.5,-1.2,1.8,-1.6,1.3,-1.4,1.6,-1.1,1.4];
  for (let i=1; i<10; i++) { const y=i*10; quiebre.push([clamp(arriba+(abajo-arriba)*y/100+offsets[i-1],2,98),y]); }
  quiebre.push([abajo,100]);
  const puntos = quiebre.map(([x,y]) => `${x}% ${y}%`).join(',');
  const puntosReverso = [...quiebre].reverse().map(([x,y]) => `${x}% ${y}%`).join(',');
  for (const [clip, direccion] of [[`polygon(0 0,${puntos},0 100%)`, -1], [`polygon(${arriba}% 0,100% 0,100% 100%,${puntosReverso})`, 1]]) {
    const pieza = document.createElement('canvas'); pieza.width = original.width; pieza.height = original.height;
    pieza.getContext('2d').drawImage(original, 0, 0);
    Object.assign(pieza.style, { position:'absolute', left:rect.left+'px', top:rect.top+'px', width:rect.width+'px', height:rect.height+'px', clipPath:clip, transformOrigin:'center', imageRendering:original.style.imageRendering || 'auto' });
    capa.appendChild(pieza);
    pieza.animate([{transform:'translate(0,0) rotate(0)',filter:'brightness(1)',offset:0}, {transform:`translate(${direccion*3}px, -2px) rotate(${direccion*.3}deg)`,filter:'brightness(3) contrast(1.6)',offset:.09}, {transform:`translate(${-direccion*4}px, 2px) rotate(${-direccion*.5}deg)`,filter:'brightness(.18) contrast(2)',offset:.16}, {transform:`translate(${direccion*7}px, 0) rotate(${direccion*.8}deg)`,filter:'brightness(1.7)',offset:.24}, {transform:`translate(${direccion*innerWidth*.045}px, ${innerHeight*.035}px) rotate(${direccion*2}deg)`,filter:'brightness(.7)',offset:1}], {duration:1150, easing:'cubic-bezier(.2,.7,.3,1)', fill:'forwards'});
  }
  const destello = document.createElement('div'); destello.style.cssText = 'position:absolute;inset:0;background:#fff7dc;pointer-events:none;mix-blend-mode:screen;opacity:0'; capa.appendChild(destello);
  destello.animate([{opacity:0,offset:0},{opacity:.95,offset:.07},{opacity:0,offset:.13},{opacity:.65,offset:.21},{opacity:0,offset:.3},{opacity:0,offset:1}], {duration:1150,fill:'forwards'});
  const grieta = document.createElementNS('http://www.w3.org/2000/svg','svg');
  grieta.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`); grieta.setAttribute('preserveAspectRatio','none');
  Object.assign(grieta.style,{position:'absolute',left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px',overflow:'visible',filter:'drop-shadow(0 0 8px #ff586c)'});
  const linea = document.createElementNS('http://www.w3.org/2000/svg','path');
  linea.setAttribute('d', quiebre.map(([x,y],i) => `${i ? 'L' : 'M'} ${rect.width*x/100} ${rect.height*y/100}`).join(' ')); linea.setAttribute('stroke','#fff2d3'); linea.setAttribute('stroke-width','3'); linea.setAttribute('fill','none'); grieta.appendChild(linea); capa.appendChild(grieta);
  grieta.animate([{opacity:0,offset:0},{opacity:1,offset:.12},{opacity:.9,offset:.3},{opacity:.35,offset:1}],{duration:1150,fill:'forwards'});
  // El golpe parte de Itzel: anillo expansivo y pequeñas fisuras ramificadas.
  const ix = rect.width * centro / 100, iy = rect.height * impactoY;
  const anillo = document.createElementNS('http://www.w3.org/2000/svg','circle');
  anillo.setAttribute('cx',ix); anillo.setAttribute('cy',iy); anillo.setAttribute('r','24'); anillo.setAttribute('fill','none'); anillo.setAttribute('stroke','#fff4d4'); anillo.setAttribute('stroke-width','3');
  anillo.style.transformOrigin = `${ix}px ${iy}px`; grieta.appendChild(anillo);
  anillo.animate([{transform:'scale(.1)',opacity:0,offset:0},{transform:'scale(.8)',opacity:1,offset:.13},{transform:'scale(5)',opacity:0,offset:.55},{opacity:0,offset:1}],{duration:1150,fill:'forwards'});
  for (let i=1; i<10; i+=2) {
    const [x,y]=quiebre[i], px=rect.width*x/100, py=rect.height*y/100, lado=i%4===1?1:-1;
    const rama=document.createElementNS('http://www.w3.org/2000/svg','path');
    rama.setAttribute('d',`M ${px} ${py} l ${lado*13} ${-8} l ${lado*9} ${3} l ${lado*12} ${-11}`); rama.setAttribute('fill','none'); rama.setAttribute('stroke','#ffe1b5'); rama.setAttribute('stroke-width','1.5'); grieta.appendChild(rama);
  }

  for (let i=0;i<14;i++) {
    const fragmento=document.createElement('i'), lado=i%2 ? 1 : -1, x=rect.left+rect.width*(centro/100), y=rect.top+rect.height*clamp(impactoY+(i%5-2)*.045,.05,.95);
    Object.assign(fragmento.style,{position:'absolute',left:x+'px',top:y+'px',width:(5+i%4*3)+'px',height:(7+i%3*4)+'px',background:i%3?'#f6c46b':'#f6e3cf',clipPath:'polygon(50% 0,100% 80%,0 100%)',opacity:'0'}); capa.appendChild(fragmento);
    fragmento.animate([{transform:'translate(0,0) rotate(0)',opacity:0,offset:0},{opacity:1,offset:.18},{transform:`translate(${lado*(30+i*9)}px,${35+i*8}px) rotate(${lado*220}deg)`,opacity:0,offset:.8},{opacity:0,offset:1}],{duration:1100,fill:'forwards'});
  }
  document.body.appendChild(capa);
  setTimeout(() => { if (STATE !== 'derrotaAnimacion') { capa.remove(); return; } capa.style.zIndex = '2'; STATE = 'play'; gameOver(); }, 1150);
}
function gameOver() {
  if (STATE !== 'play') return;
  STATE = 'over'; $('hud').classList.remove('on');
  const corazonVacio = '<svg viewBox="0 0 48 44" aria-hidden="true"><path d="M24 39 6 22C-3 12 8-2 18 5c3 2 5 4 6 6 1-2 3-4 6-6 10-7 21 7 12 17Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 3"/></svg>';
  const encabezado = `<img class="hstitch derrota-titulo" alt="Sin corazones" src="${stitched('Sin corazones', 7, ['#ec2847', '#bb1834'])}"><div class="corazones-vacios" aria-hidden="true">${corazonVacio.repeat(3)}</div>`;
  const reintento = `<button class="patch" id="retry">Reintentar ${CUR && CUR.isBoss ? 'el jefe' : 'el nivel'}</button>`;
  if (RUN.desdeEnciclopedia) {
    showScreen(`<div class="end pantalla-derrota">${encabezado}${worldsList()}<div class="acciones-derrota">${reintento}<button class="patch verde" id="enciVolver">Volver a la enciclopedia</button></div>${datoCampeche()}</div>`);
    $('retry').onclick = reintentarNivel; $('enciVolver').onclick = volverAEnci; return;
  }
  showScreen(`<div class="end pantalla-derrota">${encabezado}<p class="sub">Llegaron al mundo ${RUN.world}: ${CUR && CUR.def ? CUR.def.nombre : ''}</p>${worldsList()}<div class="acciones-derrota">${reintento}<button class="patch amarillo" id="again">Nueva partida</button><button class="patch verde" id="menu">Al inicio</button></div>${datoCampeche()}</div>`);
  $('retry').onclick = reintentarNivel; $('again').onclick = empezar; $('menu').onclick = title;
}
function victory() {
  STATE = 'win'; $('hud').classList.remove('on');
  showScreen(`<div class="end win"><img class="hstitch" alt="Lo lograron" src="${stitched('¡Lo lograron!', 8)}"><p class="sub">Itzel y Fresita cruzaron los ${WORLDS} mundos y cerraron la Ruptura</p>${worldsList()}${stats()}${datoCampeche()}<button class="patch" id="again">Otra vez</button><button class="patch verde" id="menu">Al inicio</button></div>`);
  $('again').onclick = empezar; $('menu').onclick = title;
}
function pause(on) {
  if (on) { STATE = 'pause'; showScreen(`<div class="end pantalla-derrota pantalla-pausa"><img class="hstitch derrota-titulo" alt="Pausa" src="${stitched('Pausa', 8)}">${worldsList()}<div class="acciones-pausa"><button class="patch verde" id="cont">Seguir</button><button class="patch" id="quit">${RUN.desdeEnciclopedia ? 'Volver a la enciclopedia' : 'Salir de la partida'}</button></div>${datoCampeche()}</div>`); $('cont').onclick = () => pause(false); $('quit').onclick = RUN.desdeEnciclopedia ? volverAEnci : title; }
  else { STATE = 'play'; showScreen(''); }
}

let HUDKEY = '';
function hud() {
  const U = RUN.upg, used = CUR.bubbles.length, aire = typeof CUR.air === 'number' ? Math.round(CUR.air * 100) : null, key = [RUN.hearts, RUN.maxHearts, RUN.coins, RUN.semillas || 0, CUR.def && CUR.def.id, used, U.bubbles, aire, JSON.stringify(RUN.taken), RUN.world, RUN.idx].join('|');
  if (key === HUDKEY) return; HUDKEY = key;
  $('hearts').innerHTML = Array.from({ length: RUN.maxHearts }, (_, i) => `<img class="${i < RUN.hearts ? '' : 'off'}" src="${ico('heart', 4)}">`).join('');
  $('coins').innerHTML = `<img src="${ico('canistel', 3)}" alt="Canisteles">${RUN.coins}`;
  $('semillasHUD').innerHTML = `<img style="filter:hue-rotate(${COOP.tono(CUR.def).hue}deg)" src="${ico('semilla', 3)}" alt="Semillas de Fresita">${RUN.semillas || 0}`;
  $('bubbles').innerHTML = aire === null ? '' : `<img src="${ico('bubble', 3)}" alt="Aire"><span>${aire}%</span>`;
  $('bubbles').title = 'Aire de Itzel';
  $('where').innerHTML = CUR.isBoss && CUR.boss ? `${JEFES[CUR.boss.tipo].nombre} <b>· Fresita: ${MEC.POW[CUR.def.power].name}</b>` : CUR.def ? `${CUR.def.nombre} <b>· Fresita: ${MEC.POW[CUR.def.power].name}</b>` : `Mundo ${RUN.world}: <b>${curStyle().name}</b>`;
  $('perks').innerHTML = Object.keys(RUN.taken).map(k => { const mejora = BLESS.find(b => b.id === k); return mejora ? `<img src="${ico(mejora.icon, 3)}">`.repeat(RUN.taken[k]) : ''; }).join('');
}

// ---------------------------------------------------------------------
//  BUCLE
// ---------------------------------------------------------------------
let last = performance.now();
// el bucle vuelve a pedirse al empezar y la lógica va en un try: si un cuadro truena (un estilo, una pieza…) el juego sigue en el
// siguiente cuadro; antes una sola excepción detenía el bucle para siempre y quedaba la música sonando con todo congelado
let errorBucle = 0;
function loop(now) {
  requestAnimationFrame(loop);
  try { cuadroDelBucle(now); } catch (e) { if (errorBucle++ < 5) console.error('[Itzel] cuadro con error:', e); }
}
function cuadroDelBucle(now) {
  const dt = Math.min(.1, (now - last) / 1000); last = now; // con pasos fijos: aunque un mundo pinte lento, el juego va a la misma velocidad
  if (STATE === 'title') { canvas.style.transform = ''; if (VISTA.H !== VH) fit(); view.y0 = 0; view.update(dt); view.render(); }
  else if (STATE === 'play' || STATE === 'win' || STATE === 'over') {
    if (STATE === 'play') {
      let acc = (CUR.acc || 0) + dt; const step = 1 / 60;
      while (acc >= step) {
        acc -= step;
        if (CUR.modo) { PRESSED.clear(); pasoModo(CUR, step); }
        else { const inp = p1Input(); stepFresita(CUR, MOUSE, step); stepRun(CUR, inp, step, view.st); }
        if (CUR.win && CUR.t - CUR.win > 1.8 && STATE === 'play') { STATE = 'next'; setTimeout(levelDone, 0); break; }
      }
      CUR.acc = acc; hud();
    }
    const sh = CUR.shake > 0 && opcion('sacudida', true) ? (Math.random() - .5) * (CUR.isBoss ? 18 : 6) * CUR.shake : 0;
    const presencia = CUR.presenciaJefe, pulso = opcion('sacudida', true) && presencia && presencia.pulso > 0 ? Math.sin(Math.PI * (1 - presencia.pulso / presencia.duracion)) : 0;
    const zoom = 1 + (presencia && presencia.momento === 'entrada' ? .055 : presencia && presencia.momento === 'ataque' ? .035 : .025) * pulso;
    canvas.style.transform = sh || pulso ? `translate(${sh}px,${-sh}px) scale(${zoom})` : '';
    TEXTOS.envolver(view.bctx);
    if (CUR.modo) CUR.modo.pintar(CUR, view); else { view.g = CUR; view.y0 = CUR.camY ?? VH - VISTA.H; view.render(); pintaPresenciaJefe(view.ctx, CUR, view); }
  } else if (STATE === 'pause' || STATE === 'ofrenda') { /* congelado */ }
  pintaRelleno(); TEXTOS.pintar();
}
// las fuentes se piden al abrir, para que el primer letrero del lienzo ya salga con ellas
if (document.fonts && document.fonts.load) for (const f of ['500 12px "Alegreya Sans"', '700 12px "Alegreya Sans"', '800 12px "Alegreya Sans"', '700 12px Alegreya', 'italic 500 12px Alegreya']) document.fonts.load(f);
title();
requestAnimationFrame(loop);
