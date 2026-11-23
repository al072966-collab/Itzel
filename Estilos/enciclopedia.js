'use strict';
// =====================================================================
//  EL LIBRO · índice a la izquierda, entrada viva a la derecha.
//  Cada entrada se dibuja con el código real del juego, en el estilo
//  del mundo al que pertenece.
// =====================================================================
MEC.setHurt(() => {});
// las demostraciones del libro no cuentan como descubrimientos
ENCI.ver = () => false;
// cambiar de escena sin repintar todo: si el nivel mide lo mismo, los fondos sirven; solo se tira el terreno
setLevel = function (nl) {
  const mismo = L && nl.ww === L.ww && nl.gh === L.gh; L = nl; LOOP_CACHE.clear();
  if (!mismo) { CACHE.clear(); return; }
  for (const k of [...CACHE.keys()]) if (k.endsWith('|terrain')) CACHE.delete(k);
};
const $ = id => document.getElementById(id);
const X = c => (c + PAD + .5) * T;
const C = (col, row) => [X(col), row * T + 8];
const MUNDOS_LIBRO = ORDERED_MUNDOS();
function ORDERED_MUNDOS() { return MUNDOS.filter(id => NIVELES[id] && STYLE_MAP[id]).sort((a, b) => NIVELES[a].nombre.localeCompare(NIVELES[b].nombre, 'es')); } // por nombre del mundo
const POW = MEC.POW, FOE = MEC.FOE;
// cada mundo con sus niveles plataformeros alternos (las mecánicas rescatadas viven ahí)
const PLAT_LIBRO = () => MUNDOS_LIBRO.flatMap(m => [{ m, d: NIVELES[m] }, ...(typeof NIVELES_ALT !== 'undefined' && NIVELES_ALT[m] || []).map(k => NIVELES[k]).filter(d => d && !d.modo).map(d => ({ m, d, nivel: d.id }))]);
const admiteSentidos = it => !!(it && it.def && !it.def.modo && it.def.espejo !== false && !it.def.escenarioUayamon);
const urlJugar = it => it.tipo === 'jefe' ? `../Roguelike/index.html?mundo=${encodeURIComponent(variante || it.mundo)}&jefe=${encodeURIComponent(it.clave)}${it.clave === 'ruptura' && typeof RUPTURA_FORMAS !== 'undefined' ? '&forma=' + encodeURIComponent(RUPTURA_FORMAS.FORMAS[formaRuptura].id) : ''}` : `../Roguelike/index.html?mundo=${encodeURIComponent(it.mundo)}&nivel=${encodeURIComponent((it.def && it.def.id) || it.nivel || it.mundo)}${admiteSentidos(it) ? '&lado=' + encodeURIComponent(ladoSeleccionado) : ''}`;
const modoTxt = pw => modoJefe(pw) === 'alcance' ? 'Alcance: el núcleo se abre arriba y Fresita sube a Itzel con este poder.' : 'Control: Fresita aturde al jefe con este poder cuando abre el núcleo.';

// ===================== CATEGORÍAS =====================
const CATS = [
  { id: 'mundos', nombre: 'Mundos', icono: 'globo', color: '#3f8a4a', intro: 'Cada run toca cuatro mundos al azar. Cada mundo es un lugar o un suceso de Campeche, pintado con su propio estilo de arte, con su nivel, enemigo, plataforma y poder de Fresita.',
    items: MUNDOS_LIBRO.flatMap(m => { const d = NIVELES[m], st = STYLE_MAP[m], GEN = { iso: '2.5D isométrico', torres: 'Tower defense', vuelo: "Shoot 'em up", cocina: 'Cocina cooperativa', jarana: 'Ritmo (jarana)', campechanidad: 'Baile de la Campechanita', carrera: 'Carreras', pesca: 'Pesca cooperativa', planos: 'Planta y alzado', fruncido: 'Plataformas 2D', vela: 'Navegación a vela', propio: 'Plataformas 2D', golpes: "Beat 'em up" };
      const base = { id: 'mundo:' + m, tipo: d.modo ? 'modo' : 'mundo', def: d, mundo: m, nombre: d.nombre, sub: `${st.name} · ${st.ref}`, datos: [['Género', d.modo ? GEN[d.modo] : 'Plataformas 2D'], ['Poder de Fresita', POW[d.power].name], ['Plataforma', PLAT_NOMBRE[d.plat.look || 'plain']], ['Lugar', d.lugar || 'Campeche'], ...VENTAJAS.filaTerreno(m)], tecnica: st.desc, nota: d.lema };
      const ocultarPescaMovil = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
      const alt = (typeof NIVELES_ALT !== 'undefined' && NIVELES_ALT[m] || []).map(k => NIVELES[k]).filter(a => a && !(ocultarPescaMovil && a.id === 'pesca')).map(a => ({ id: 'mundo:' + a.id, tipo: a.modo ? 'modo' : 'mundo', def: a, mundo: m, nivel: a.id, nombre: a.nombre, sub: `${(a.genero || (a.modo ? (GEN[a.modo] || a.modo) : 'Plataformas 2D'))} · ${st.name}`, datos: [['Género', (a.genero || (a.modo ? (GEN[a.modo] || a.modo) : 'Plataformas 2D'))], ['Fresita', POW[a.power].name], ['Cómo se juega', POW[a.power].help]], tecnica: st.desc, nota: a.lema }));
      return [base, ...alt]; }) },
  { id: 'campeche', nombre: 'Campeche', icono: 'catedral', color: '#c98a2a', intro: 'Lo que van aprendiendo al jugar: cada mundo nuevo regala un dato y cada doblón de Lorencillo descubre otro. Todo esto es de verdad.',
    items: CAMPECHE_SABER.HALLAZGOS.map(h => ({ id: 'campeche:' + h.id, tipo: 'vista', mundo: STYLE_MAP[h.mundo] ? h.mundo : (MUNDOS_LIBRO.find(m => (NIVELES_ALT[m] || []).includes(h.mundo)) || h.mundo), niveles: h.mundos, nombre: h.titulo, sub: h.tema, datos: [['En corto', h.breve]], nota: h.largo })) },
  { id: 'personajes', nombre: 'Protagonistas', icono: 'itzel', color: '#c8203a', intro: 'Itzel y Fresita, y las dos juntas. Escoge un estilo para verlas en ese mundo.',
    items: [
      ...['itzel', 'fresita'].map(k => ({ id: 'personaje:' + k, tipo: 'personaje', clave: k, mundo: 'anime', nombre: PERSONAJES[k].nombre, sub: k === 'itzel' ? 'Jugador 1 · teclado' : 'Jugador 2 · mouse', datos: [], nota: PERSONAJES[k].texto })),
      { id: 'personaje:juntas', tipo: 'personaje', clave: 'ambas', mundo: 'anime', nombre: 'Juntas', sub: 'Itzel y Fresita', datos: [], nota: 'Itzel corre y salta con el teclado; Fresita vuela tras el mouse y la ayuda con el poder de cada mundo. Escoge un estilo para verlas juntas en ese arte.' },
    ] },
  { id: 'enemigos', nombre: 'Enemigos', icono: 'cangrejo', color: '#7a3a8a', intro: 'Nadie muere: a los enemigos se les cae encima, se duermen con la canción de Fresita o se espantan. Los fuertes aguantan varios golpes.',
    items: [...PLAT_LIBRO(), { m: 'fuego', d: NIVELES.templo }].flatMap(({ m, d, nivel }) => (d.fauna || [d.foe]).map(k => ({ m, d, nivel, k }))).filter(({ k }, i, a) => ENEMIGO_INFO[k] && a.findIndex(q => q.k === k) === i).map(({ m, d, nivel, k }) => { const I = ENEMIGO_INFO[k]; return { id: 'enemigo:' + k, tipo: 'enemigo', clave: k, mundo: m, nivel, nombre: I[0], sub: `${d.nombre} · ${STYLE_MAP[m].name}`, datos: [['Vida', VIDA_ENEMIGOS.texto(k)], ['Cómo se mueve', I[1]], ['Cómo pasarlo', I[2]]], nota: '' }; }) },
  { id: 'subjefes', nombre: 'Subjefes', icono: 'subjefe', color: '#a0522a', intro: 'Cada mundo de plataformas guarda, cerca del final, a una criatura suya sacada de algo real de Campeche, con dos ataques y varios corazones. Después de atacar se marea: ese es el momento de caerle encima. Al vencerla se rinde y suelta un corazón.',
    items: SUBJEFES.fichas() },
  { id: 'poderes', nombre: 'Poderes de Fresita', icono: 'ajolote', color: '#e0508a', intro: 'Clic izquierdo: el poder del mundo. Clic derecho: la canción de cuna, que duerme enemigos y deshace los orbes de los jefes.',
    items: PLAT_LIBRO().filter(({ d }, i, a) => a.findIndex(q => q.d.power === d.power) === i).map(({ m, d, nivel }) => { const P = POW[d.power]; return { id: 'poder:' + d.power, tipo: 'poder', mundo: m, nivel, poder: d.power, nombre: P.name, sub: `${d.nombre} · ${STYLE_MAP[m].name}`, datos: [['Cómo se usa', P.help], ['Contra los jefes', modoTxt(d.power)]], nota: '' }; }) },
  { id: 'plataformas', nombre: 'Plataformas', icono: 'escalones', color: '#3f7fd6', intro: 'Cada mundo tiene una plataforma que se comporta distinto.',
    items: PLAT_LIBRO().map(({ m, d, nivel }) => { return { id: 'plataforma:' + (nivel || m), tipo: 'plataforma', mundo: m, nivel, nombre: PLAT_NOMBRE[d.plat.look || 'plain'] || 'Plataforma', sub: `${d.nombre} · ${STYLE_MAP[m].name}`, datos: [['Cómo funciona', PLAT_TIPO[d.plat.k] || '']], nota: '' }; }) },
  { id: 'entorno', nombre: 'Cosas del entorno', icono: 'cofre', color: '#8a5a2a', intro: 'Objetos, trampas y ayudas que aparecen en los mundos.',
    items: Object.keys(ENTORNO).map(k => ({ id: 'entorno:' + k, tipo: 'entorno', clave: k, mundo: ENTORNO[k].mundo, nivel: ENTORNO[k].nivel, nombre: ENTORNO[k].nombre, sub: 'Cosa del entorno', datos: [], nota: ENTORNO[k].texto })) },
  { id: 'jefes', nombre: 'Jefes', icono: 'corona', color: '#2a2a4a', intro: 'Salen en cualquier mundo y atacan igual, pero se vencen con el poder del lugar. Cada mundo tiene su propia variante: hay que encontrarlas todas.',
    items: Object.keys(JEFES).map((k, i) => ({ id: 'jefe:' + k, tipo: 'jefe', clave: k, mundo: 'anime', nombre: JEFES[k].nombre, sub: JEFES[k].lema, datos: [['Ataques', JEFES[k].ataques.map(a => ({ orbes: 'orbes de colores', tentaculo: 'tentáculo', rayo: 'rayo', pisoton: 'pisotón con ondas', rocas: 'rocas en arco', embestida: 'embestida', picada: 'picada', fuego: 'lluvia de fuego', cola: 'barrida de cola', acecho: 'acecho y salto', garras: 'zarpazos', rugido: 'rugido que tira piedras', secuestro: 'secuestro de Fresita', polvo: 'polvo de estrellas', espejos: 'reflejos', emboscada: 'mordida desde el suelo', coletazo: 'coletazo', escupe: 'escupitajo de agua', golpe: 'puñetazo con aviso', onda: 'ondas de choque', calderas: 'calderas al rojo', canones: 'cañonazos con mira', ancla: 'ancla que cae', loros: 'loros fantasma', rayos: 'rayos marcados con glifos', aguacero: 'aguacero', ventarron: 'ventarrón con granizo', picada: 'picada', chillido: 'chillido en ondas', oscuridad: 'oscuridad con murcielaguitos', enjambre: 'filas de abejas', miel: 'charcos de miel', aguijon: 'aguijonazo', laser: 'láser de energía', fragmentos: 'fragmentos de piedra', aplastar: 'aplastón con ondas' })[a]).join(', ')], ['Vida', k === 'ruptura' ? `Cada forma tiene la suya: ${VIDA_ENEMIGOS.iconos(3)} 3 golpes, y ${VIDA_ENEMIGOS.iconos(5)} 5 La otra Itzel y Los Tentáculos.` : `${VIDA_ENEMIGOS.iconos(3)} 3 golpes. 4 si pelea con ventaja y 2 si pelea con desventaja.`], ...VENTAJAS.filasJefe(k), ['Cómo se vence', 'Después de cada ataque abre su núcleo. Según el mundo, Fresita sube a Itzel o lo aturde, e Itzel le cae encima. Si a Itzel le faltan corazones, Fresita puede bajar a tocar las burbujas de curación.']], nota: `${JEFES[k].texto}${JEFES[k].dato ? ' Campeche de verdad: ' + JEFES[k].dato : ''}` })) },
];

// ===================== ESCENAS =====================
function montar(def, nv) {
  setLevel(buildLevelFromRows(nv.rows));
  const g = newGame(); g.enemies = []; g.bubbles = []; g.rings = []; g.shake = 0;
  g.fre = { x: g.p.x + 40, y: g.p.y - 46, face: 1, cool: 0 }; Object.assign(g.p, { air: 0, boost: 0, plat: null, dash: 0 });
  MEC.init(g, def, nv.ents); g.def = def; return g;
}
function terrario(def, extra, meta = 37, barrancoAncho = false, filaCanisteles = 8) {
  const b = Constructor(40); b.g(0, barrancoAncho ? 14 : 15).g(barrancoAncho ? 23 : 22, 39).P(6).d('T', 2).d('f', 10).d('r', 30).d('T', 35).c(24, 28, filaCanisteles).Gl(meta);
  if (extra) extra(b);
  return montar(def, { rows: b.rows(), ents: b.ents });
}
// física mínima de Itzel (sin control): gravedad, suelo, plataformas, zonas
function fisica(g, dt) {
  const p = g.p, E = MEC.env(g); g.env = E; MEC.carry(g, dt);
  const M = g.mando; // en las demos de poderes Itzel camina y salta con un guion
  if (M) {
    if (p.boost > 0) p.boost -= dt; else p.vx = M.dir * 115;
    if (M.dir) p.face = M.dir;
    if (M.brincos && p.on) p.jb = .15;
    if (p.jb > 0 && (p.on || (p.coyote || 0) > 0)) { p.vy = -JUMP; p.jb = 0; p.on = false; p.noCut = true; p.plat = null; }
  } else if (p.boost > 0) p.boost -= dt; else p.vx *= Math.pow(.02, dt);
  if (E.swim) { p.vy = Math.min(p.vy + G * .26 * dt, 75); } else p.vy = Math.min(p.vy + G * E.grav * dt, 520);
  const mv = p.vx + (E.push || 0); p.x += mv * dt;
  if (SOLID(p.x + Math.sign(mv) * p.w / 2, p.y - 6)) { p.x -= mv * dt; p.vx = 0; }
  const prevY = p.y; p.y += p.vy * dt;
  const l = p.x - 4.5, r = p.x + 4.5;
  if (p.vy > 0) { if (SOLID(l, p.y) || SOLID(r, p.y)) { p.y = Math.floor(p.y / T) * T; p.vy = 0; p.plat = null; } else MEC.land(g, prevY); }
  else if (p.vy < 0 && (SOLID(l, p.y - p.h) || SOLID(r, p.y - p.h))) { p.y = (Math.floor((p.y - p.h) / T) + 1) * T + p.h; p.vy = 0; }
  p.on = p.vy >= 0 && (SOLID(l, p.y + .5) || SOLID(r, p.y + .5) || MEC.standing(g));
  if (p.on) p.run += Math.abs(p.vx || 0) * dt * .16;
  p.coyote = p.on ? .08 : Math.max(0, (p.coyote || 0) - dt);
  MEC.zones(g, dt);
  p.jb = (p.jb || 0) - dt;
  if (p.y > VH + 40 || E.deadly) { p.x = g.home.x; p.y = g.home.y; p.vx = p.vy = 0; p.plat = null; }
  return prevY;
}
function nuevoPaso(g, dt) {
  g.t += dt; MEC.stepGlobal(g, dt); MEC.stepPlats(g, dt);
  const prevY = g.quieta ? g.p.y : fisica(g, dt);
  MEC.stepFoes(g, dt, prevY);
  // Solo en la demostración: recoger canisteles no modifica la partida.
  if (g.demo) for (const c of g.coins) if (!c.got && Math.abs(c.x - g.p.x) < 10 && Math.abs(c.y - (g.p.y - 7)) < 12) { c.got = true; g.got++; }
  for (const q of g.parts) { q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= Math.pow(.25, dt); q.life -= dt; q.r += dt * 6; }
  g.parts = g.parts.filter(q => q.life > 0); for (const r of g.rings) r.t += dt; g.rings = g.rings.filter(r => r.t < r.d);
  if (g.freT) { g.fre.x += (g.freT[0] - g.fre.x) * Math.min(1, dt * 6); g.fre.y += (g.freT[1] - g.fre.y) * Math.min(1, dt * 6); if (Math.abs(g.freT[0] - g.fre.x) > 1) g.fre.face = Math.sign(g.freT[0] - g.fre.x); }
}
// el motor llama esto dentro de cada estilo
function WORLD_HOOK(ctx, f, layer) {
  const g = f.g; if (!g.plats) return;
  MEC.draw(ctx, f, layer, g.def);
  if (layer === 'over') {
    for (const r of g.rings) { const k = r.t / r.d; ctx.strokeStyle = rgba(r.c, 1 - k); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(r.x, r.y, r.r * (.3 + k * .7), 0, TAU); ctx.stroke(); }
    if (!g.sinFresita && f.st.fresita) f.st.fresita(ctx, g.fre, f);
  }
}
function clic(g, pt, up) { const [x, y] = typeof pt === 'function' ? pt(g) : pt; g.fre.cool = 0; g.fre.daze = 0; MEC.power(g, { x: x - g.cam, y, b: 0, up }); }

// guiones de cada poder: [segundo, punto, 'down'|'up'|undefined], el punto puede depender del juego
const foe1 = g => { const e = g.foes.find(e => e.st === 'ok') || g.foes[0]; return e ? [e.x, e.y - e.h / 2] : C(18, 9); };
// Cada demo cuenta una escenita: Fresita usa su poder y Itzel lo aprovecha para cruzar el barranco
// (columnas 16 a 21), subir una pared o pasar a un enemigo. «pasos»: los clics de Fresita;
// «itzel»: lo que hace Itzel ([segundo | 'x', columna, acción]).
const RELLENA = b => b.g(16, 21);                      // sin barranco
const PARED = (alto = 5) => b => b.g(16, 21, alto);    // una pared alta en vez del barranco
const DEMO = {
  // ---------- crear plataformas ----------
  bloque: { pasos: [[.5, C(16, 11)], [.8, C(17, 11)], [1.1, C(18, 11)]], itzel: [[1.2, 'der'], ['x', 18.5, 'salta'], ['x', 30, 'alto']] },
  nenufar: { pasos: [[.6, C(18.5, 10)]], itzel: [[1, 'der'], ['x', 15.0, 'salta'], ['x', 18.4, 'salta'], ['x', 26, 'alto']], esperaSuelo: true, dura: 8 },
  avion: { pasos: [[1.35, C(16.7, 10)]], itzel: [[.3, 'der'], ['x', 15.2, 'salta'], ['x', 19.2, 'alto'], ['x', 22.6, 'der'], ['x', 30, 'alto']], dura: 8 },
  nube: { arma: PARED(6), pasos: [[.9, C(15.6, 8)]], itzel: [[.3, 'der'], ['x', 14.8, 'salta'], [2.0, 'salta'], ['x', 24, 'alto']] },
  cristal: { arma: PARED(5), pasos: [[.6, C(14, 8)]], itzel: [[.9, 'der'], ['x', 12.7, 'salta'], ['x', 13.8, 'alto'], [2.7, 'der'], [2.72, 'salta'], ['x', 24, 'alto']] },
  lapiz: { pasos: [[.6, C(14, 10), 'down'], [1.5, C(23, 10), 'up']], arrastre: [[.6, C(14, 10)], [1.5, C(23, 10)]], itzel: [[1.7, 'der'], ['x', 14.8, 'salta'], ['x', 30, 'alto']] },
  resorte: { pasos: [[.6, [X(14.6), 170]]], itzel: [[.5, 'der'], ['x', 26, 'alto']] },
  asidero: { arma: b => b.g(16, 21, 5), fija: true, pasos: [[.5, [X(14.4), 118], 'down'], [3.2, [X(14.4), 118], 'up']], itzel: [[.4, 'der'], ['x', 12.9, 'salta'], [1.7, 'salta'], ['x', 26, 'alto']], dura: 6, luego: g => { g.freT = g.asid || g.cyc < 3.3 ? [X(14.4), 118] : [g.p.x - 16, g.p.y - 34]; } },

  semilla: { arma: PARED(5), pasos: [[.3, [X(14), 145]], [.9, [X(14), 105]]], itzel: [[.2, 'der'], ['x', 13.5, 'alto'], [1, 'brincos'], [3.5, 'quieta'], [3.5, 'der'], ['x', 30, 'alto']], dura: 9 },
  constelacion: { arma: b => b.o('estrella', 15, 9).o('estrella', 22, 9).o('estrella', 18, 6), pasos: [[.6, C(15, 9)], [1.1, C(22, 9)]], itzel: [[1.4, 'der'], ['x', 14.2, 'salta'], ['x', 30, 'alto']] },
  ladrillo: { arma: b => b.c(16, 21, 10), pasos: [.4, .7, 1, 1.3, 1.6, 1.9].map((t, k) => [t, C(16 + k, 10)]), itzel: [[2.1, 'der'], ['x', 15.5, 'salta'], ['x', 30, 'alto']] },
  tempano: { arma: b => b.o('mar', 16, 12, { x2: 21 }), pasos: [[.6, C(17, 12)], [1.2, C(20, 12)]], itzel: [[1.3, 'der'], ['x', 15.6, 'salta'], ['x', 18.6, 'salta'], ['x', 21.2, 'salta'], ['x', 30, 'alto']] },
  burbuja: { arma: b => b.o('water', 0, 2, { x2: 39 }), pasos: [[1.6, C(17.2, 11)], [2.6, C(20.3, 10)]], itzel: [[.6, 'der'], ['x', 15.2, 'alto'], [1.9, 'der'], [1.92, 'salta'], ['x', 17, 'alto'], [2.9, 'der'], [2.92, 'salta'], ['x', 20.2, 'alto'], [3.8, 'der'], [3.82, 'salta'], ['x', 30, 'alto']] },
  // ---------- mover a Itzel ----------
  viento: { arma: PARED(5), pasos: [[1.2, [X(15), 120]]], itzel: [[.3, 'der'], ['x', 30, 'alto']] },
  remolino: { arma: b => b.g(22, 39, 7), pasos: [[.6, [X(15.6), 150]], [1.6, [X(18.6), 100]]], itzel: [[.6, 'der'], ['x', 30, 'alto']], dura: 7 },
  rafaga: { pasos: [[2.02, g => [g.p.x - 14, g.p.y + 4]]], itzel: [[.6, 'der'], ['x', 15.3, 'salta'], ['x', 30, 'alto']] },
  portal: { pasos: [[2.2, [X(26), 150]]], fija: true, itzel: [[.2, 'der'], ['x', 15, 'alto'], [2.6, 'der'], ['x', 32, 'alto']], luego: g => { if (g.cyc < 2.2) g.freT = [lerp(X(14), X(26), clamp((g.cyc - .8) / 1.2, 0, 1)), 140]; } },
  cargar: { fija: true, pasos: [[1.5, C(15, 9.6), 'down'], [3.2, C(23, 8), 'up']], arrastre: [[1.5, C(15, 9.6)], [3.2, C(23, 8)]], itzel: [[.2, 'der'], ['x', 15, 'alto'], [3.3, 'der'], ['x', 30, 'alto']], luego: g => { if (g.cyc < 1.5) g.freT = [g.p.x - 14, g.p.y - 26]; } },
  seda: { arma: b => b.o('ramita', 18, 4), pasos: [[1.2, C(18, 4), 'down'], [1.85, C(18, 4), 'up']], arrastre: [[1.2, C(18, 4)], [1.85, C(18, 4)]], itzel: [[.2, 'der'], ['x', 14, 'alto'], [1.25, 'der'], ['x', 30, 'alto']] },
  valvula: { arma: b => b.o('valvula', 9, 0, { grp: 0 }).o('vent', 14, 0, { grp: 0 }).g(16, 21, 7), pasos: [[.7, [X(9), 160]]], itzel: [[.3, 'der'], ['x', 14, 'alto'], [2.3, 'der'], ['x', 26, 'alto']] },
  // ---------- luz y bloques que cambian ----------
  luz: { arma: b => b.p(16, 10, 2).p(19, 10, 2), pasos: [[1.1, [X(17), 130]]], itzel: [[1, 'der'], ['x', 15.5, 'salta'], ['x', 20.4, 'salta'], ['x', 30, 'alto']] },
  farol: { arma: b => b.p(16, 10, 2).p(19, 10, 2), fija: true, pasos: [[.9, [X(18.5), 166], 'down'], [4, [X(18.5), 166], 'up']], itzel: [[1.2, 'der'], ['x', 15.5, 'salta'], ['x', 20.4, 'salta'], ['x', 30, 'alto']], luego: g => { g.fre.x = X(12); g.fre.y = 104; g.freT = [X(12), 104]; } },
  antorcha: { arma: b => b.o('antorcha', 14).p(16, 10, 2, { k: 'ghost', look: 'espectral' }).p(19, 10, 2, { k: 'ghost', look: 'espectral' }), pasos: [[.8, [X(14), 176 - 25]]], itzel: [[1.1, 'der'], ['x', 15.5, 'salta'], ['x', 20.4, 'salta'], ['x', 30, 'alto']] },
  pulso: { arma: PARED(6), pasos: [[1.05, g => [g.p.x - 12, g.p.y - 30]], [3.21, g => [g.p.x - 12, g.p.y - 30]]], itzel: [[.2, 'der'], ['x', 30, 'alto']] },
  glifo: { arma: b => b.s('glyph', 16, 11, 6, 1, { grp: 0, on: false }), pasos: [[.9, C(17, 11)]], itzel: [[1.2, 'der'], ['x', 30, 'alto']] },
  interruptor: { arma: b => b.s('switch', 16, 10, 3, 1, { grp: 'A' }).s('switch', 19, 10, 3, 1, { grp: 'B' }), pasos: [[2.05, C(18, 5)]], itzel: [[.3, 'der'], ['x', 15.5, 'salta'], ['x', 18.3, 'salta'], ['x', 30, 'alto']] },
  reloj: { arma: b => b.p(17, 10, 3), pasos: [[.8, [X(14), 110]]], itzel: [[1, 'der'], ['x', 15.6, 'salta'], ['x', 18.2, 'alto'], [3.3, 'der'], [3.32, 'salta'], ['x', 30, 'alto']] },
  hackeo: { arma: b => b.e(24, 6).p(16, 11, 6, { v: -45 }), pasos: [[.8, C(19, 10)]], itzel: [[1.3, 'der'], ['x', 30, 'alto']] },
  moldear: { arma: b => b.o('clay', 16, 11, { axis: 'x', dir: 1, min: .6, max: 6 }), pasos: [[.6, [X(16) - 2, 180], 'down'], [2.2, [X(21), 180], 'up']], arrastre: [[.6, [X(16), 180]], [2.2, [X(22), 180]]], itzel: [[2.4, 'der'], ['x', 30, 'alto']] },
  eco: { arma: b => b.o('plate', 6, 0, { grp: 0, n: 'I' }).s('ecobridge', 16, 11, 6, 1, { grp: 0, on: false }), pasos: [[.8, [X(8), 140]]], itzel: [[1.3, 'der'], ['x', 30, 'alto']] },
  estampa: { arma: b => b.o('prensa', 6, 0, { grp: 0, n: 'I' }).s('pliego', 16, 11, 6, 1, { grp: 0, on: false }), pasos: [[.8, [X(8), 140]]], itzel: [[1.3, 'der'], ['x', 30, 'alto']] },
  // ---------- con enemigos ----------
  vidrio: { arma: b => b.g(12, 39, 7).e(10), pasos: [[.9, foe1]], itzel: [[1.2, 'der'], ['x', 8.2, 'salta'], ['x', 9.4, 'salta'], ['x', 30, 'alto']] },
  gubia: { arma: b => RELLENA(b).s('wood', 13, 8, 1, 3).s('wood', 14, 9, 1, 2), pasos: [[1.1, C(13, 9)], [1.6, C(14, 10)]], itzel: [[.3, 'der'], ['x', 30, 'alto']] },
  agua: { arma: b => b.g(16, 17).g(20, 21).o('brasas', 18, 12, { x2: 19 }).e(27), pasos: [[.8, C(18.5, 12)], [2.9, foe1]], itzel: [[1.0, 'der'], ['x', 19.3, 'salta'], ['x', 32, 'alto']] },
  bengala: { arma: b => RELLENA(b).o('ruido', 0, 0).e(24), pasos: [[.6, [X(30), 150]]], itzel: [[1.2, 'der'], ['x', 34, 'alto']] },
};
const AIRE = new Set(['fly', 'orbit', 'swoop', 'drone', 'formation', 'puffer', 'zancudo', 'libelula', 'polilla', 'carpintero', 'geoda', 'cuervo', 'bejuco', 'gargola', 'aplastador', 'charran', 'medusa', 'cucu', 'silbato', 'pezloro', 'cometa', 'aranaCeniza', 'cuervoCeniza', 'halcon', 'fantasma', 'soplo', 'tucan', 'pajaro']);
const ARMAR = {
  vista(it) { return { g: terrario(NIVELES[it.nivel || it.mundo]), foco: null }; },
  mundo(it) { const d = NIVELES[it.nivel || it.mundo], nv = construirNivel(d), g = montar(d, nv); g.p.vis = false; g.quieta = true; g.pan = true; COOP.init(g); g.objs = g.objs.filter(o => o.k !== 'plagactl'); return { g, foco: null }; },
  personaje(it, variante) { const m = (esIF(it) && variante) || it.mundo, d = NIVELES[m], g = terrario(d); if (esIF(it)) ponSkinEnci(m); g.retrato = it.clave; return { g, foco: null, mundo: m }; },
  retrato(it) { const d = NIVELES[it.nivel || it.mundo], g = terrario(d); g.retrato = 'ambas'; return { g, foco: null }; },
  enemigo(it) {
    const d = NIVELES[it.nivel || it.mundo], k = it.clave || d.foe, beh = FOE[k].beh;
    const g = terrario(d, b => {
      if (d.id === 'agua') b.o('water', 0, 2, { x2: 39 });
      if (d.id === 'hollin') b.o('ruido', 0, 0);
      if (beh === 'icicle') b.isl(15, 21, 4).e(17, 6, k).e(19, 6, k);
      else if (beh === 'thrower') b.isl(17, 20, 8).e(18, 8, k);
      else if (beh === 'formation') b.e(17, 5, k).e(19, 5, k).e(21, 5, k);
      else if (beh === 'morena') b.blk(18, 5, 3, 6).o('morena', 18, 8, { dir: -1 });   // vive en el agujero de una pared
      else if (beh === 'mojarra') b.e(18, 15, k);
      else if (AIRE.has(beh)) b.e(18, 6, k);
      else b.e(12, undefined, k).e(26, undefined, k);
    });
    g.quieta = d.id === 'agua' && beh !== 'morena';   // la morena sí se mueve: asoma y se esconde
    if (it.subjefe && g.foes[0]) SUBJEFES.vitrina(g, g.foes[0], it.subjefe);
    if (beh === 'morena' && g.foes[0]) g.foes[0].visor = true;   // en el libro sale y se esconde sola, sin esperar a Itzel
    const e0 = g.foes[0];
    // En el nivel espera oculta bajo el agua; la ficha debe mostrarla desde el inicio.
    if (e0 && beh === 'mojarra') { e0.nada = true; e0.y = e0.hy - 80; e0.vx = 35; e0.vy = 0; }
    return { g, foco: e0 ? [e0.x, e0.y - 10] : [X(18), 130], sigue: g => { const e = g.foes[0]; return e ? [e.x, e.y - 10] : null; } };
  },
  plataforma(it) {
    const d = NIVELES[it.nivel || it.mundo], k = d.plat.k;
    const g = terrario(d, b => {
      const o1 = {}, o2 = { ph: 1.5 };
      if (k === 'blink') { o1.pos = [[16, 9], [18, 8], [20, 9]]; o2.pos = [[19, 7], [17, 6]]; }
      if (k === 'seg') { o1.x2 = 21; o1.y2 = 8; }
      if (k === 'beat') { o1.grp = 'A'; o2.grp = 'B'; }
      if (k === 'swing') { o1.len = 4; o2.len = 3; }
      if (d.id === 'agua') b.o('water', 0, 2, { x2: 39 });
      if (d.id === 'hollin') { o1.k = 'creak'; o2.k = 'creak'; }
      b.p(16, 9, 3, o1); if (k !== 'seg') b.p(20, 7, 2, o2);
    });
    g.soltar = true; g.freT = [X(17), 120];
    return { g, foco: [X(18), 140] };
  },
  poder(it) {
    const d = NIVELES[it.nivel || it.mundo], D = DEMO[it.poder] || { pasos: [] };
    const g = terrario(d, D.arma, 37, !D.arma, ['lapiz', 'viento'].includes(it.poder) ? 10 : 8); g.demo = D; g.barrancoAncho = !D.arma;
    if (it.poder === 'lapiz') g.p.x = X(12);
    g.freT = [X(10), 100];
    if (it.poder === 'nenufar') { g.p.x = X(12); g.p.vx = 0; return { g, foco: [X(18), 150] }; }
    return { g, foco: [X(19), 150] };
  },
  entorno(it) {
    const d = NIVELES[it.nivel || it.mundo], k = it.clave;
    const A = {
      corazon: b => b.h(18, 9), glyph: b => b.s('glyph', 16, 10, 2, 1, { grp: 0 }).s('glyph', 19, 9, 2, 1, { grp: 0, on: false }).s('glyph', 12, 8, 1, 3, { grp: 1 }),
      wood: b => b.s('wood', 13, 8, 1, 3).s('wood', 14, 9, 1, 2), switch: b => b.s('switch', 16, 9, 2, 1, { grp: 'A' }).s('switch', 19, 8, 2, 1, { grp: 'B' }),
      zona: b => b.z(17, 19, 3, 12), clay: b => b.o('clay', 16, 11, { axis: 'x', dir: 1, min: .6, max: 6 }).o('clay', 12, 11, { axis: 'y', w: 2, min: .6, max: 4 }),
      plate: b => b.o('plate', 6, 0, { grp: 0, n: 'I' }).s('ecobridge', 16, 11, 6, 1, { grp: 0, on: false }), ecobridge: b => b.o('plate', 6, 0, { grp: 0, n: 'I' }).s('ecobridge', 16, 11, 6, 1, { grp: 0, on: false }),
      brasas: b => b.o('brasas', 16, 13, { x2: 21 }), geiser: b => b.o('geiser', 12).o('geiser', 26, 0, { off: 1.4 }),
      water: b => b.o('water', 0, 2, { x2: 39 }).o('respiro', 12), respiro: b => b.o('water', 0, 2, { x2: 39 }).o('respiro', 18, 0).o('respiro', 12),
      corriente: b => b.o('water', 0, 2, { x2: 39 }).o('corriente', 14, 4, { x2: 23, y2: 10, v: 50 }), mar: b => b.o('mar', 16, 12, { x2: 21 }),
      estrella: b => b.o('estrella', 15, 9).o('estrella', 22, 9).o('estrella', 18, 6), escondite: b => b.o('ruido', 0, 0).o('escondite', 10, 0, { x2: 12 }).o('escondite', 24, 0, { x2: 27, kind: 'auto' }).e(30),
      prensa: b => b.o('prensa', 6, 0, { grp: 0, n: 'I' }).s('pliego', 16, 11, 6, 1, { grp: 0, on: false }), pliego: b => b.o('prensa', 6, 0, { grp: 0, n: 'I' }).s('pliego', 16, 11, 6, 1, { grp: 0, on: false }),
      vent: b => b.o('valvula', 9, 0, { grp: 0 }).o('vent', 14, 0, { grp: 0 }).o('vent', 20, 0, { grp: 0 }), valvula: b => b.o('valvula', 9, 0, { grp: 0 }).o('vent', 14, 0, { grp: 0 }),
      antorcha: b => b.o('antorcha', 14, 0, { lit: true }).o('antorcha', 26).p(16, 9, 3, { k: 'ghost', look: 'espectral' }),
      papelpicado: b => b.o('guirnalda', 3, 6, { x2: 14, cols: ['#d9443a', '#ffd23f', '#3f9a5a', '#4f8fd6', '#ff7fb0'] }).o('guirnalda', 24, 5, { x2: 36, cols: ['#8a3aa8', '#ff9a1f', '#f4efe2'], picado: 'calavera' }),
      pinata: b => b.o('pinata', 13, 4, { cuerda: 34 }).o('pinata', 24, 3, { cuerda: 30 }), peregrinos: b => b.o('peregrinos', 6, 0, { x2: 14 }).isl(9, 14, 5).e(10, 7, 'carambano').e(13, 7, 'carambano'),
      vela: b => b.o('vela', 13).o('vela', 24).p(16, 10, 2, { k: 'reveal', look: 'fogstone' }).p(19, 9, 2, { k: 'reveal', look: 'fogstone' }), altar: b => b.o('altar', 25).o('vela', 23).o('vela', 27),
      anima: b => b.o('anima', 8, 8, { x2: 30 }).p(16, 10, 2, { k: 'reveal', look: 'fogstone' }).p(19, 9, 2, { k: 'reveal', look: 'fogstone' }),
      confeti: b => b.o('confeti', 12).o('confeti', 24), pintadera: b => b.o('carnaval', 0, 0).e(24, undefined, 'pintador'), rueda: b => b.o('rueda', 18, 5, { r: 3.6, n: 6, sp: .55 }),
      canon: b => b.o('canon', 27, 0, { dir: -1, per: 1.8 }), cascada: b => b.o('cascada', 18, 0, { w: 2 }).p(15, 10, 2, { k: 'sink', look: 'lily' }).p(21, 10, 2, { k: 'sink', look: 'lily' }), rehilete: b => b.o('rehilete', 18, 6, { r: 2.6 }), biombo: b => b.o('biombo', 14, 4, { per: 2.4 }).o('biombo', 24, 4, { per: 2.4, off: 1.2 }),
      obsidiana: b => b.o('obsidiana', 10, 0, { ang: -.15 }).p(17, 10, 2, { k: 'reveal', look: 'fogstone' }).p(21, 9, 2, { k: 'reveal', look: 'fogstone' }).p(25, 10, 2, { k: 'reveal', look: 'fogstone' }),
      estela: b => b.o('estela', 11, 0, { grp: 0, per: 2 }).s('glyph', 16, 9, 6, 1, { grp: 0 }),
      regla: b => b.g(0, 14).o('regla', 14, 0, { n: 6, dir: 1 }).g(21, 39), rodillo: b => b.o('rodillo', 16, 9, { amp: 3, sp: .8 }),
      rastrillo: b => b.o('antorcha', 12, 0, { lit: true }).o('rastrillo', 18, 0, { h: 5 }),
      ventisca: b => b.o('ventisca', 0, 0, { x2: 39, v: -60 }), pozo: b => b.o('pozo', 18, 6), vidrios: b => b.o('ruido', 0, 0).o('vidrios', 14, 0, { x2: 22 }),
      tele: b => b.o('tele', 12, 0, { par: 1 }).o('tele', 26, 0, { par: 1 }), torno: b => b.o('torno', 16, 9), almeja: b => b.o('water', 0, 2, { x2: 39 }).o('almeja', 18, 0),
      llamarada: b => b.o('brasas', 24, 13, { x2: 28 }),
      camara: b => b.o('camara', 18, 4, { a0: 1.6, a1: 2.6 }), laser: b => b.o('laser', 16, 11, { h: 5 }).o('laser', 22, 11, { h: 5, off: 1.2 }), relojcucu: b => b.blk(18, 5, 1, 6).o('cucu', 18, 7, { dir: -1 }),
      boton: b => b.o('boton', 14, 0).s('switch', 19, 9, 3, 1, { grp: 'A' }).s('switch', 23, 8, 3, 1, { grp: 'B' }),
      burbujaCura: b => b,
    };
    const g = terrario(d, A[k], k === 'meta' ? 12 : 37);
    if (k === 'semilla') for (const [c, y] of [[14, 60], [18, 46], [22, 66]]) g.objs.push({ k: 'semilla', x: X(c), y, t: c });
    if (k === 'burbujaCura') g.objs.push({ k: 'burbujaDemo', x: X(18), y: 150 });
    if (k === 'plaga') g.objs.push({ k: 'plaga', x: X(26), y: 60, vx: 0, vy: 0, t: 0, st: 'caza', px: 0, py: 0, sp: 0 });
    if (k === 'switch') g.alterna = true;
    if (k === 'clay') g.amasa = true;
    if (k === 'plate' || k === 'ecobridge' || k === 'prensa' || k === 'pliego') g.pisa = true;
    if (k === 'escondite') { g.crouchBot = true; g.p.x = X(11); }
    if (k === 'water' || k === 'respiro' || k === 'corriente') g.quieta = true;
    g.freT = [X(16), 90];
    const foco = k === 'meta' ? [X(12), 150] : k === 'plaga' || k === 'semilla' ? [X(18), 90] : k === 'estrella' ? [X(18), 130] : k === 'escondite' ? [X(11), 160] : [X(17), 160];
    return { g, foco };
  },
  jefe(it, variante) {
    const m = variante || it.mundo, d = NIVELES[m], nv = construirArena(d, it.clave);
    const ruptura = it.clave === 'ruptura' && typeof RUPTURA_FORMAS !== 'undefined';
    const nombre = JEFES.ruptura.nombre, lema = JEFES.ruptura.lema; let g;
    if (ruptura) RUPTURA_FORMAS.fuerza(RUPTURA_FORMAS.FORMAS[formaRuptura].id);
    try { g = montar(d, nv); }
    finally { if (ruptura) { RUPTURA_FORMAS.fuerza(null); JEFES.ruptura.nombre = nombre; JEFES.ruptura.lema = lema; } }
    L.goal = { x: -9999, y: -9999 }; g.isBoss = true; g.freT = [X(8), 60];
    return { g, mundo: m, foco: null };
  },
};

// pinta una escena; los estilos derivados (Game Boy, CGA) se pintan con su base y luego se procesan
function pintaEstilo(esc, ctx, st, g, S, extra) {
  if (!st.base) { renderScene(ctx, st, g, S); if (extra) extra(ctx, S, st); return; }
  const bS = st.baseS(S), bw = Math.round(VW * bS), bh = Math.round(VH * bS);
  if (!esc.buf || esc.buf.width !== bw || esc.buf.height !== bh) { esc.buf = mkCanvas(bw, bh); esc.bctx = esc.buf.getContext('2d', { willReadFrequently: true }); }
  const anteriorArte=window.estiloArteDerivado;
  try { window.estiloArteDerivado=st.id; renderScene(esc.bctx, STYLE_MAP[st.base], g, bS); if (extra) extra(esc.bctx, bS, STYLE_MAP[st.base]); }
  finally { window.estiloArteDerivado=anteriorArte; }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none';
  st.process(esc.buf, esc.bctx, ctx, { S, g, offs: esc.offs || (esc.offs = {}) });
}
class Escena {
  constructor(cv) { this.cv = cv; this.ctx = cv.getContext('2d'); }
  mostrar(it, variante) {
    // el poder de Aguja e hilo se enseña con el nivel real (el hipil fruncido): Itzel camina sola y Fresita jala el hilván que sigue
    if (it.tipo === 'poder' && it.poder === 'aguja' && NIVELES.bordado) it = Object.assign({}, it, { tipo: 'modo', def: NIVELES.bordado, demoAguja: true });
    this.it = it; this.variante = variante; this.modoJ = null;
    if (it.tipo === 'modo') { const st = STYLE_MAP[it.mundo]; setLevel(buildLevelFromRows(FONDO_MODO)); this.st = st; this.mundo = it.mundo; this.foco = null; this.sigue = null; this.zoom = 1; this.modoJ = MODOS[it.def.modo].crear(it.def, st); if (it.demoIntro) this.modoJ.demo = true; if (it.demoAguja) { this.modoJ.demo = true; this.modoJ.camina = true; } this.g = this.modoJ; if (it.def.modo === 'torres') this.modoJ.espera = 0; return; }
    const r = ARMAR[it.tipo](it, variante); this.g = r.g; this.mundo = r.mundo || it.mundo; this.st = STYLE_MAP[this.mundo]; this.foco = r.foco; this.sigue = r.sigue;
    this.zoom = { enemigo: 2, plataforma: 1.6, poder: 1.35, entorno: 1.6 }[it.tipo] || 1;
    const g = this.g; g.home = { x: g.p.x, y: g.p.y }; g.t0 = 0; g.cyc = 0;
    g.cam = this.foco ? clamp(this.foco[0] - VW / 2, L.camMin, L.camMax) : clamp(g.p.x - VW * .3, L.camMin, L.camMax);
  }
  paso(dt) {
    if (this.modoJ) { const j = this.modoJ; MOUSE.clicks.length = 0; RUN.hearts = 9; j.inv = 9; MODOS[this.it.def.modo].paso(j, dt); if (j.t > 40 || (j.camina && (j.p.u > 600 || j.t > 14)) || (this.it.def.modo === 'golpes' && j.win && j.t - j.win > 2)) this.mostrar(this.it); return; }
    const g = this.g; if (!g) return;
    g.cyc += dt;
    // guion del poder
    if (g.demo) {
      const D = g.demo;
      // Itzel: [segundo | 'x', columna, acción]; acciones: der, izq, alto, salta, brincos, quieta
      if (D.itzel) {
        const M = g.mando || (g.mando = { dir: 0 }), hecho = g.hecho || (g.hecho = new Set());
        D.itzel.forEach((a, i) => {
          if (hecho.has(i)) return;
          const columna = g.barrancoAncho && a[0] === 'x' && a[a.length - 1] === 'salta' && a[1] >= 14.8 && a[1] <= 15.9 ? 14.4 : a[1];
          const ya = typeof a[0] === 'number' ? g.cyc >= a[0] : a[0] === 'x' ? g.p.x >= X(columna) : g.p.x <= X(columna);
          if (!ya) return; const acc = a[a.length - 1];
          if (D.esperaSuelo && acc === 'salta' && !g.p.on) return;
          hecho.add(i);
          if (acc === 'der') M.dir = 1; else if (acc === 'izq') M.dir = -1; else if (acc === 'alto') M.dir = 0; else if (acc === 'salta') g.p.jb = .15; else if (acc === 'brincos') M.brincos = true; else if (acc === 'quieta') M.brincos = false;
        });
      }
      // Fresita acompaña a Itzel cuando no va a usar su poder
      if (!D.fija) g.freT = [g.p.x - 16 * g.p.face, g.p.y - 34];
      if (D.arrastre) { const a = D.arrastre; let pt = null; for (let i = 0; i < a.length - 1; i++) if (g.cyc >= a[i][0] && g.cyc <= a[i + 1][0]) { const u = (g.cyc - a[i][0]) / (a[i + 1][0] - a[i][0]), p0 = typeof a[i][1] === 'function' ? a[i][1](g) : a[i][1], p1 = typeof a[i + 1][1] === 'function' ? a[i + 1][1](g) : a[i + 1][1]; pt = [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u)]; } if (pt) { g.fre.x = pt[0]; g.fre.y = pt[1]; g.freT = pt; } }
      for (const [tt, pt, kind] of D.pasos) {
        const tp = typeof pt === 'function' ? pt(g) : pt;
        if (g.cyc > tt - .5 && g.cyc < tt && !D.arrastre) g.freT = [tp[0], tp[1]];
        if (g.cyc >= tt && g.cyc - dt < tt) { if (!D.arrastre || kind === 'down') { g.fre.x = tp[0]; g.fre.y = tp[1]; } clic(g, tp, kind === 'up'); }
      }
      if (D.ronda) g.freT = [D.ronda[0] + Math.sin(g.t * 1.2) * 40, D.ronda[1] + Math.sin(g.t * 2) * 10];
      if (D.luego) D.luego(g);
      if (g.cyc > (D.dura || 7)) { this.mostrar(this.it, this.variante); return; }
    }
    if (g.soltar && g.cyc > 3.6) { const pl = g.plats[0]; g.cyc = 0; if (pl) { g.p.x = pl.x + Math.min(pl.w, 30) / 2; g.p.y = pl.y - 34; g.p.vy = 0; g.p.vx = 0; g.p.plat = null; } }
    if (g.alterna && Math.floor(g.t / 1.6) % 2 !== (g.sw ? 1 : 0)) g.sw = !g.sw;
    if (g.amasa) { const s = g.solids.find(s => s.k === 'clay' && s.axis === 'x'), s2 = g.solids.find(s => s.k === 'clay' && s.axis === 'y'), u = (Math.sin(g.t * .8) * .5 + .5); if (s) s.tgt = lerp(s.min, s.max, u); if (s2) s2.tgt = lerp(s2.min, s2.max, 1 - u); g.freT = [X(18) + u * 40, 160]; }
    if (g.pisa) { const on = Math.floor(g.t / 2.4) % 2 === 0; g.p.x = on ? X(6) : X(3); }
    if (g.pan) { const k = Math.sin(g.t * .09 - Math.PI / 2) * .5 + .5; g.cam = lerp(L.camMin, L.camMax, k); g.freT = [g.cam + VW * .5 + Math.sin(g.t * .7) * 60, 70 + Math.sin(g.t * 1.3) * 20]; }
    if (g.retrato) { g.p.vis = false; g.sinFresita = true; }
    if (!g.freT && !g.retrato) g.freT = [g.p.x - 18, g.p.y - 32];
    nuevoPaso(g, dt);
  }
  pintar(S, zoom = this.zoom) {
    if (this.modoJ) { MODOS[this.it.def.modo].pintar(this.modoJ, { st: this.st, S, ctx: this.ctx }); return; }
    const g = this.g, st = this.st; if (!g) return;
    if (st.base) { S = st.fixedS || S; zoom = 1; }
    // Un estilo derivado puede cambiar la resolución del lienzo; al pasar a
    // otro estilo hay que restaurarla antes de dibujar o se recorta la escena.
    const ancho = Math.round(VW * S), alto = Math.round(VH * S);
    if (this.cv.width !== ancho || this.cv.height !== alto) { this.cv.width = ancho; this.cv.height = alto; }
    if (this.sigue) { const q = this.sigue(g); if (q) this.foco = [lerp(this.foco[0], q[0], .08), lerp(this.foco[1], q[1], .08)]; }
    if (zoom > 1 && this.foco) {
      // se pinta más grande aparte y se recorta alrededor de lo importante
      const Z = Math.max(S, Math.min(4, S * zoom)), w = Math.round(VW * Z), h = Math.round(VH * Z);
      if (!this.big || this.big.width !== w || this.big.height !== h) { this.big = mkCanvas(w, h); this.bigCtx = this.big.getContext('2d'); }
      pintaEstilo(this, this.bigCtx, st, g, Z, g.retrato ? (c, s, st2) => this.retrato(s, c, st2) : null);
      const cw = this.cv.width, ch = this.cv.height, sx = clamp((this.foco[0] - g.cam) * Z - cw / 2, 0, w - cw), sy = clamp(this.foco[1] * Z - ch * .55, 0, h - ch);
      this.ctx.setTransform(1, 0, 0, 1, 0, 0); this.ctx.imageSmoothingEnabled = false; this.ctx.drawImage(this.big, sx, sy, cw, ch, 0, 0, cw, ch);
      return;
    }
    pintaEstilo(this, this.ctx, st, g, S, g.retrato ? (c, s, st2) => this.retrato(s, c, st2) : null);
  }
  // Itzel y Fresita en grande, cambiando de pose
  retrato(S, ctx = this.ctx, st = this.st) {
    // En el retrato la pose Quieto debe ser realmente quieta. Las otras
    // acciones se eligen desde sus botones y no deben cambiar el modelo base.
    const g = this.g, f = { t: g.t, cam: g.cam, S: S * 2.6, g, st, enciclopedia: true, key: st.id + '@' + (S * 2.6).toFixed(3) }, fase = 0;
    const p = this.pose || (this.pose = { w: 10, h: 14, vx: 0, vy: 0, on: true, face: 1, run: 0, sq: 0, vis: true, inv: 0 });
    p.vis = true; p.on = true; p.vx = 0; p.vy = 0;
    ctx.save(); ctx.setTransform(S * 2.6, 0, 0, S * 2.6, 0, 0); ctx.imageSmoothingEnabled = !st.pixel;
    // El retrato comparte la superficie visible del terrario: sus pies
    // deben apoyarse en el césped, no en la tierra que queda debajo.
    const superficie = L.surfaceY(PAD + 4) * T;
    const cx = VW / 2.6 / 2, by = (Number.isFinite(superficie) && superficie <= VH ? superficie : 176) / 2.6;
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(cx - 6, by + .5, 9, 2, 0, 0, TAU); ctx.fill();
    const k = g.retrato;
    if (k === 'itzel' || k === 'ambas') { p.x = k === 'ambas' ? cx - 12 : cx; p.y = by; st.player(ctx, p, f); }
    if (k === 'fresita' || k === 'ambas') { const fr = { x: k === 'ambas' ? cx + 14 : cx, y: by - 26, face: -1 }; st.fresita(ctx, fr, f); }
    ctx.restore();
  }
}

// las pestañas van por lo que más se consulta; lo de adentro de cada una, en orden alfabético
{ const abc = (a, b) => String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es', { sensitivity: 'base', numeric: true });
  const RELEVANCIA = ['mundos', 'personajes', 'poderes', 'jefes', 'subjefes', 'enemigos', 'plataformas', 'entorno', 'campeche'];
  const lugar = c => { const i = RELEVANCIA.indexOf(c.id); return i < 0 ? 99 : i; };
  CATS.sort((a, b) => lugar(a) - lugar(b)); for (const c of CATS) c.items.sort(abc); }
// ===================== PANTALLA =====================
let vistaJugador = false, catActual = 0, itemActual = 0, variante = null, skinSel = 0, formaRuptura = 0, ladoSeleccionado = 'derecha';
// Itzel y Fresita se ven en cualquier mundo y con cualquiera de sus skins (las que dejó David)
const esIF = it => it && it.tipo === 'personaje' && (it.clave === 'itzel' || it.clave === 'fresita' || it.clave === 'ambas');
const skinsDe = m => (ELEGIDOS[m] || []).slice();
const skinsVistas = m => { try { return ((JSON.parse(localStorage.getItem('itzel-progreso') || '{}').skins || {})[m] || {}).vistas || []; } catch (e) { return []; } };
function ponSkinEnci(m) { aplicaElegido(m, 0); }
try { const v = JSON.parse(localStorage.getItem('enci-ui-rel') || '{}'); catActual = v.cat || 0; itemActual = v.item || 0; vistaJugador = !!v.jugador; } catch (e) {}
if (!window.MODO_PUBLICO) vistaJugador = false;   // en desarrollo (local, o ?dev=1) la enciclopedia se ve completa; el libro está en un marco sin ese parámetro, por eso no se lee de la dirección
if (window.MODO_PUBLICO) vistaJugador = true;   // publicada: solo lo descubierto, como en una partida nueva
const guardaUI = () => { try { localStorage.setItem('enci-ui-rel', JSON.stringify({ cat: catActual, item: itemActual, jugador: window.MODO_PUBLICO ? false : vistaJugador, tarjetas: typeof modoTarjetas !== 'undefined' && modoTarjetas })); } catch (e) {} };
const visto = it => !vistaJugador || ENCI.tiene(it.id);
const vivo = new Escena($('escena'));
// Vista ampliada: controla su propia escena y vuelve al reposo al terminar cada acción.
let cercaActivo = false;
function acercarEscena(it) {
  cercaActivo = true;
  const focoAnterior = document.activeElement;
  const caja = document.createElement('div'); caja.id = 'primerPlano';
  caja.setAttribute('role','dialog');caja.setAttribute('aria-modal','true');caja.setAttribute('aria-label','Vista de cerca: '+it.nombre);
  caja.innerHTML = `<div class="pp"><div class="pp-tit"><b></b><span></span><button class="pp-x" aria-label="Cerrar">✕</button></div><div class="pp-navega"><canvas></canvas><button class="pp-ant" aria-label="Anterior">‹</button><button class="pp-sig" aria-label="Siguiente">›</button></div><div class="pp-bot"></div></div>`;
  const css = document.createElement('style');
  css.textContent = `#primerPlano{position:fixed;inset:0;z-index:200;display:grid;place-items:center;background:rgba(20,12,8,.82);backdrop-filter:blur(3px);font-family:'Alegreya Sans',sans-serif} #primerPlano .pp{width:min(1000px,94vw);background:#f3e7cf;border-radius:10px;padding:14px 16px 16px;color:#3a2418;position:relative;box-shadow:0 0 0 4px #6a3a22,0 0 0 7px #3e1e10,0 24px 60px #0009} #primerPlano .pp:before{content:'';position:absolute;inset:6px;border:2px dashed #783c1e73;border-radius:6px;pointer-events:none} #primerPlano .pp-tit{display:flex;align-items:baseline;gap:12px;margin-bottom:10px;position:relative} #primerPlano .pp-tit b{font:700 25px Alegreya,Georgia,serif} #primerPlano .pp-tit span{color:#8a6a4a;font-style:italic;flex:1} #primerPlano canvas{width:100%;aspect-ratio:16/9;display:block;border-radius:4px;background:#1a120d;box-shadow:0 0 0 3px #fffaf0} #primerPlano .pp-bot{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;position:relative} #primerPlano button{font:700 14px 'Alegreya Sans',sans-serif;color:#fff4e0;background:#6a3a22;border:0;border-radius:6px;padding:7px 14px;cursor:pointer;position:relative;box-shadow:0 0 0 2px #3e1e10,0 3px 0 #2a120a} #primerPlano button:after{content:'';position:absolute;inset:3px;border:1.5px dashed #ffe6c88c;border-radius:4px;pointer-events:none} #primerPlano button.on,#primerPlano .pp-x{background:#b8203a;box-shadow:0 0 0 2px #6a0f1e,0 3px 0 #4a0a14} #primerPlano .pp-x{width:38px;height:38px;padding:0;font-size:17px}`;
  css.textContent += `#primerPlano .pp-navega{position:relative} #primerPlano .pp-ant,#primerPlano .pp-sig{position:absolute;top:50%;transform:translateY(-50%);font-size:22px;padding:8px 13px} #primerPlano .pp-ant:hover,#primerPlano .pp-sig:hover{transform:translateY(-50%);background:#7e4628} #primerPlano .pp-ant{left:12px} #primerPlano .pp-sig{right:12px}`;
  caja.appendChild(css); caja.querySelector('b').textContent = it.nombre;
  const mundos = it.tipo === 'enemigo' ? estilosVisor(it) : MUNDOS_LIBRO.filter(m => STYLE_MAP[m] && NIVELES[m] && (!vistaJugador || (it.tipo === 'jefe' ? ENCI.tiene(`variante:${it.clave}:${m}`) : ENCI.tiene('mundo:' + m))));
  let mundoCerca = it.tipo === 'jefe' ? (variante || it.mundo) : it.mundo;
  if (!mundos.includes(mundoCerca)) mundos.unshift(mundoCerca);
  const nombreEstilo = () => STYLE_MAP[mundoCerca].name + (it.tipo === 'enemigo' && !estilosCasa(it).has(mundoCerca) ? ' · Anomalía' : '');
  caja.querySelector('span').textContent = nombreEstilo();
  document.body.appendChild(caja);
  const etiquetaFlecha = it.tipo === 'enemigo' ? 'Enemigo' : 'Estilo';
  for (const [sel, sentido] of [['.pp-ant', 'anterior'], ['.pp-sig', 'siguiente']]) { const boton = caja.querySelector(sel); boton.title = `${etiquetaFlecha} ${sentido}`; boton.setAttribute('aria-label', `${etiquetaFlecha} ${sentido}`); }
  caja.querySelector('.pp-x').focus();
  const cv = caja.querySelector('canvas'), ctx = cv.getContext('2d'), off = document.createElement('canvas');
  cv.width = 1280; cv.height = 720; off.width = VW * 3; off.height = VH * 3;
  const formasRuptura = it.clave === 'ruptura' && typeof RUPTURA_FORMAS !== 'undefined' ? RUPTURA_FORMAS.FORMAS : null;
  const modelosMascaron = it.clave === 'golem' && typeof MASCARON_MODELOS !== 'undefined' ? MASCARON_MODELOS.nombres : null;
  let modeloMascaron = modelosMascaron ? 1 : 0;
  let formaActual = formaRuptura;
  const escena = new Escena(off); let g, sujeto, accion = false, inicio = 0, raf, anterior = performance.now();
  function preparar() {
    escena.mostrar(it, it.tipo === 'jefe' ? mundoCerca : undefined);
    g = escena.g;
    if (it.tipo === 'enemigo') { escena.st = STYLE_MAP[mundoCerca]; escena.mundo = mundoCerca; }
    g.sinFresita = true; g.sinHudJefe = true; g.p.vis = false; g.quieta = true; g.p.inv = 9999;
    sujeto = it.tipo === 'jefe' ? g.boss : g.foes[0];
    if (it.tipo === 'jefe' && sujeto) {
      sujeto.x = L.camMin + VW / 2;
      // los jefes de piso se paran donde hay suelo: el centro de la arena es un foso y se quedaban flotando sobre el vacío
      if (['jaguar', 'golem', 'cocodrilo'].includes(sujeto.tipo)) {
        const m = sujeto.tipo === 'golem' ? 30 : 18, piso = x => [-m, -m / 2, 0, m / 2, m].every(dx => SOLID(x + dx, JEFES_EXT.FLOOR + 4));
        for (let d = 0; d < 260; d += 4) { const c = [sujeto.x - d, sujeto.x + d].find(piso); if (c !== undefined) { sujeto.x = c; break; } }
      }
      if (sujeto.y < 0) sujeto.y = 85;
      if (sujeto.tipo === 'golem') { sujeto.drop = 0; sujeto.landed = 1; if (modelosMascaron) sujeto.modeloMascaron = modeloMascaron; }
      if (sujeto.tipo === 'jaguar') { sujeto.y = JEFES_EXT.FLOOR; sujeto.vy = 0; }
      if (sujeto.tipo === 'cocodrilo') { sujeto.y = JEFES_EXT.FLOOR; sujeto.sub = 0; sujeto.erg = 0; sujeto.mordida = 0; }
      if (sujeto.seg) sujeto.seg.forEach((q, i) => { q.x = sujeto.x + i * 8; q.y = 85; });
      sujeto.st = 'ventana'; sujeto.at = 0; sujeto.stunT = 0; sujeto.orbs = []; sujeto.waves = [];
    } else if (sujeto) { g.foes = [sujeto]; }
    if (sujeto) g.cam = clamp(sujeto.x - VW / 2, L.camMin, L.camMax);
    escena.sigue = null; escena.foco = null; escena.zoom = 1;
  }
  preparar();
  caja.querySelector('.pp').style.width = formasRuptura ? 'min(1000px, 94vw, calc((100vh - 210px) * 16 / 9))' : 'min(1000px, 94vw, calc((100vh - 145px) * 16 / 9))';
  const fila = caja.querySelector('.pp-bot');
  if (modelosMascaron) {
    caja.querySelector('.pp').style.cssText += ';max-height:95vh;overflow:auto;width:min(1000px,94vw,calc((100vh - 320px) * 16 / 9))';
    const selector = document.createElement('div'); selector.className = 'pp-modelos';
    selector.style.cssText = 'display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin-top:10px;position:relative';
    const titulo = document.createElement('b'); titulo.style.cssText = 'grid-column:1/-1;font:700 14px Alegreya Sans,sans-serif'; titulo.textContent = 'Diseños para comparar · En combate se usa Tocado solar'; selector.appendChild(titulo);
    const botonesModelo = [];
    modelosMascaron.forEach((nombre, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.title = `${i + 1}. ${nombre}`; b.setAttribute('aria-label', `Modelo ${i + 1}: ${nombre}`);
      b.style.cssText = 'padding:4px;display:flex;align-items:center;gap:4px;text-align:left;min-width:0;font-size:11px';
      const mini = document.createElement('canvas'); mini.width = 75; mini.height = 90; mini.style.cssText = 'width:auto;height:47px;aspect-ratio:auto;background:#e8d8b7;box-shadow:none;flex:none';
      const mc = mini.getContext('2d'); mc.setTransform(.75, 0, 0, .75, 37.5, 87 - JEFES_EXT.FLOOR * .75); MASCARON_MODELOS.pintar(mc, { x:0, face:1, hgt:92, st:'ventana', drop:0 }, { t:0 }, i + 1);
      const etiqueta = document.createElement('span'); etiqueta.textContent = `${i + 1}. ${nombre}`; etiqueta.style.cssText = 'overflow:hidden;line-height:1.1'; b.append(mini, etiqueta);
      b.onclick = () => { modeloMascaron = i + 1; botonesModelo.forEach((q, j) => q.classList.toggle('on', j === i)); accion = false; preparar(); crearBotones(); };
      b.classList.toggle('on', modeloMascaron === i + 1); botonesModelo.push(b); selector.appendChild(b);
    });
    fila.before(selector);
  }
  if (formasRuptura) {
    const selector = document.createElement('div'); selector.className = 'pp-formas';
    selector.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:12px;position:relative';
    selector.innerHTML = '<b>Forma:</b><button class="forma-ant" aria-label="Forma anterior">‹</button><select aria-label="Forma de la Ruptura" style="flex:1;min-width:150px;padding:7px 9px;border:1px solid #aa8965;border-radius:5px;background:#fff9ec;color:#3a2418;font:700 14px Alegreya Sans,sans-serif"></select><button class="forma-sig" aria-label="Forma siguiente">›</button>';
    fila.before(selector);
    const select = selector.querySelector('select');
    formasRuptura.forEach((forma, i) => { const op = document.createElement('option'); op.value = i; op.textContent = `${i + 1}. ${forma.nombre}`; select.appendChild(op); });
    select.value = formaActual;
    function cambiarForma(i) { formaActual = (i + formasRuptura.length) % formasRuptura.length; formaRuptura = formaActual; select.value = formaActual; accion = false; preparar(); crearBotones(); }
    select.onchange = () => cambiarForma(+select.value);
    selector.querySelector('.forma-ant').onclick = () => cambiarForma(formaActual - 1);
    selector.querySelector('.forma-sig').onclick = () => cambiarForma(formaActual + 1);
  }
  const nombres = {reflejo:'Reflejo',sombras:'Sombras',danza:'Danza',orbes:'Orbes',tentaculo:'Tentáculo',rayo:'Rayo',pisoton:'Pisotón',rocas:'Rocas',embestida:'Embestida',picada:'Picada',fuego:'Fuego',cola:'Cola',acecho:'Acecho',garras:'Garras',rugido:'Rugido',secuestro:'Secuestro',polvo:'Polvo',espejos:'Espejos',emboscada:'Emboscada',coletazo:'Coletazo',escupe:'Escupitajo',golpe:'Golpe',onda:'Onda',calderas:'Calderas',canones:'Cañones',ancla:'Ancla',loros:'Loros',rayos:'Rayos',aguacero:'Aguacero',ventarron:'Ventarrón',chillido:'Chillido',oscuridad:'Oscuridad',enjambre:'Enjambre',miel:'Miel',aguijon:'Aguijón',laser:'Láser',fragmentos:'Fragmentos',aplastar:'Aplastar',raices:'Raíces',barridaRaiz:'Barrida de raíz',filaBaja:'Fila baja',filaAlta:'Fila alta',hormigas:'Escarabajos'};
  function ataquesActuales() { return formasRuptura ? [...new Set(formasRuptura[formaActual].ataques)] : JEFES[it.clave].ataques; }
  function boton(nombre, clave) { const b = document.createElement('button'); b.textContent = nombre; fila.appendChild(b); b.onclick = () => { fila.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); preparar(); accion = !!clave; inicio = performance.now(); if (clave && it.tipo === 'jefe' && sujeto) { sujeto.st = 'ataque'; sujeto.at = 0; sujeto.atk = clave; sujeto.ai = ataquesActuales().indexOf(clave); sujeto.dur = 0; } else if (clave === 'atacar' && sujeto && it.clave === 'abordador') sujeto.ataqueVisual = .001; }; return b; }
  let quieto;
  function crearBotones() {
    fila.innerHTML = ''; quieto = boton('Quieto', null); quieto.classList.add('on');
    if (it.tipo === 'jefe') for (const a of ataquesActuales()) boton(nombres[a] || a.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^\p{Ll}/u, ch => ch.toLocaleUpperCase('es')), a);
    else { boton('Movimiento', 'mover'); if (it.tipo === 'enemigo' && it.clave === 'abordador') boton('Ataque', 'atacar'); }
  }
  crearBotones();
  for (const [selector, dir] of [['.pp-ant', -1], ['.pp-sig', 1]]) caja.querySelector(selector).onclick = () => {
    if (it.tipo === 'enemigo') {
      const categoria = CATS.find(c => c.id === 'enemigos');
      const disponibles = categoria.items.filter(visto);
      if (!disponibles.length) return;
      it = disponibles[(disponibles.findIndex(e => e.id === it.id) + dir + disponibles.length) % disponibles.length];
      itemActual = categoria.items.findIndex(e => e.id === it.id);
      mundoCerca = it.mundo;
      caja.querySelector('.pp-tit b').textContent = it.nombre;
      caja.setAttribute('aria-label', 'Vista de cerca: ' + it.nombre);
    } else mundoCerca = mundos[(mundos.indexOf(mundoCerca) + dir + mundos.length) % mundos.length];
    if (it.tipo === 'jefe') variante = mundoCerca;
    caja.querySelector('.pp-tit span').textContent = nombreEstilo(); quieto.click();
  };
  function cerrar() { cancelAnimationFrame(raf); caja.remove(); removeEventListener('keydown', tecla, true); cercaActivo = false; if (formasRuptura || it.tipo === 'enemigo') abrirItem(); sucio = true; if(focoAnterior&&focoAnterior.isConnected&&typeof focoAnterior.focus==='function')focoAnterior.focus(); }
  function tecla(e) {
    if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); cerrar(); return; }
    if ((e.key==='ArrowLeft'||e.key==='ArrowRight') && !['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)) {
      e.preventDefault();e.stopImmediatePropagation();caja.querySelector(e.key==='ArrowLeft'?'.pp-ant':'.pp-sig').click();
    }
  }
  caja.onclick = e => { if (e.target === caja) cerrar(); }; caja.querySelector('.pp-x').onclick = cerrar; addEventListener('keydown', tecla, true);
  function cuadro(ahora) {
    const dt = Math.min(.04, (ahora - anterior) / 1000); anterior = ahora;
    if (accion) {
      escena.paso(dt); g.sinFresita = true; g.p.vis = false;
      if (ahora - inicio > 4000 || (it.tipo === 'jefe' && sujeto.st !== 'ataque')) quieto.click();
    } else {
      g.t += dt;
      // En reposo la serpiente flota y ondula sin avanzar ni atacar.
      if (it.tipo === 'jefe' && sujeto && sujeto.tipo === 'serpiente' && sujeto.seg) {
        sujeto.seg.forEach((q,i) => { q.x = sujeto.x + i * 8; q.y = 85 + Math.sin(g.t * 1.6 - i * .38) * 5; });
      }
    }
    // El recorte sigue al personaje en el centro sin salirse del lienzo.
    const esOtraItzel = !!(formasRuptura && formasRuptura[formaActual].id === 'espejo');
    const escala = it.tipo === 'jefe' ? (esOtraItzel ? .34 : it.clave === 'hadas' ? .46 : it.clave === 'jaguar' ? .52 : .70) : .32, w = VW * escala, h = w * 9 / 16; 
    // Renderizar el recorte con suficientes píxeles evita agrandar una imagen pequeña.
    // Los estilos deliberadamente pixelados conservan su resolución original.
    const estiloPixel = !!(escena.st.pixel || escena.st.fixedS || escena.st.base);
    const S = estiloPixel ? 3 : Math.min(6, Math.max(3, cv.width / w));
    // Se pinta el escenario primero y el jefe al tamaño final, sin ampliar un recorte pequeño.
    // El duelo del espejo tiene su propio dibujante en la escena y conserva ese camino.
    g.visorSinJefe = it.tipo === 'jefe' && !esOtraItzel && !!(sujeto && JEFES_EXT.BODY[sujeto.tipo]);
    g.vistaJefeNitida = g.visorSinJefe;
    const anteriorNitido = window.visorJefeNitido;
    try { window.visorJefeNitido = it.tipo === 'jefe' && !estiloPixel; escena.pintar(S, 1); }
    finally { window.visorJefeNitido = anteriorNitido; }
    let x = sujeto ? sujeto.x - g.cam : VW / 2, y = sujeto ? sujeto.y : VH / 2;
    if (esOtraItzel) y -= 13;
    else if (it.tipo === 'enemigo') y -= (sujeto.h || 16) / 2;
    else if (y > 140) y -= (sujeto.hgt || 70) / 2;
    x = clamp(x - w / 2, 0, VW - w); y = clamp(y - h / 2, 0, VH - h);
    const resolucion = off.width / VW;
    ctx.imageSmoothingEnabled = !escena.st.pixel; ctx.drawImage(off, x * resolucion, y * resolucion, w * resolucion, h * resolucion, 0, 0, cv.width, cv.height);
    // El jefe se pinta con la técnica del mundo, a la resolución final del visor.
    if (g.visorSinJefe && sujeto && JEFES_EXT.BODY[sujeto.tipo]) {
      const k = cv.width / w, previo = window.visorJefeNitido;
      ctx.save(); ctx.setTransform(k, 0, 0, k, -(x + g.cam) * k, -y * k); ctx.imageSmoothingEnabled = !escena.st.pixel;
      try { window.visorJefeNitido = true; JEFES_EXT.BODY[sujeto.tipo](ctx, sujeto, { t:g.t, cam:g.cam, S:k, g, st:escena.st }); }
      finally { window.visorJefeNitido = previo; ctx.restore(); }
    }
    raf = requestAnimationFrame(cuadro);
  }
  raf = requestAnimationFrame(cuadro);
}
const MINIS = new Map(), cola = [];
// imágenes que se están descargando (se cuentan para saber cuándo una miniatura ya puede pintarse con todos sus assets)
const PENDIENTES = new Set();
(() => { const Nativa = window.Image; function Imagen(w, h) { const im = new Nativa(w, h); PENDIENTES.add(im); return im; } Imagen.prototype = Nativa.prototype; window.Image = Imagen;
  // también cuentan las imágenes que otros archivos crean antes o con document.createElement('img'): cualquier src nuevo queda pendiente hasta que cargue.
  // (Sin esto, una miniatura pintada mientras llegaba un fondo grande —el panorama del bosque, por ejemplo— se quedaba con el dibujo viejo para siempre.)
  try { const d = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (d && d.set && !d.set._pendientes) { const set = function (v) { try { PENDIENTES.add(this); } catch (e) {} return d.set.call(this, v); }; set._pendientes = true; Object.defineProperty(HTMLImageElement.prototype, 'src', { get: d.get, set, configurable: true, enumerable: d.enumerable }); } } catch (e) {}
})();
const hayPendientes = () => { let n = 0; for (const im of PENDIENTES) { if (im.complete || !im.getAttribute('src')) { if (im.complete) PENDIENTES.delete(im); continue; } n++; } return n > 0; };
// ?calienta=1: el juego abre esta página escondida al empezar solo para que el navegador baje y compile los scripts; no pinta miniaturas
const CALIENTA = new URLSearchParams(location.search).has('calienta');
let sucio = true, roto = false;

$('titulo').src = BORDADO.text('Enciclopedia', 5);
function listones() {
  $('listones').innerHTML = CATS.map((c, i) => `<button class="liston ${i === catActual ? 'on' : ''}" style="background:${c.color}" data-i="${i}"><img src="${BORDADO.icon(c.icono, 3, ['#fff4e0', '#ffe0b0', '#ffd0d0', '#ffffff'])}" alt=""><span>${c.nombre}</span></button>`).join('');
  document.querySelectorAll('.liston').forEach(b => b.onclick = () => { catActual = +b.dataset.i; itemActual = 0; variante = null; skinSel = 0; abrirCat(); });
}
function abrirCat() {
  if (!CATS[catActual]) catActual = 0; if (!(itemActual >= 0 && itemActual < CATS[catActual].items.length)) itemActual = 0; // lo guardado puede ya no existir
  const c = CATS[catActual]; guardaUI(); listones();
  $('capTitulo').src = BORDADO.text({ atuendos: 'Atuendos', entorno: 'Entorno', poderes: 'Poderes', plataformas: 'Plataformas' }[c.id] || c.nombre, 4);
  const n = c.items.filter(it => ENCI.tiene(it.id)).length;
  $('cuenta').textContent = `${n} de ${c.items.length} descubiertos`; $('barra').style.width = (n / c.items.length * 100) + '%';
  $('intro').textContent = c.intro;
  $('filtrosMundos').hidden = c.id !== 'mundos';
  if (c.id === 'mundos') {
    const select = $('generoMundo'), anterior = select.value;
    // solo dos grupos: los de plataformas y los especiales (todos los demás géneros)
    const generos = ['Plataformero', 'Especiales'].filter(k => c.items.some(it => visto(it) && tipoMundo(it) === k));
    select.innerHTML = '<option value="">Todos los niveles</option>';
    generos.forEach(g => { const o = document.createElement('option'); o.value = o.textContent = g; select.appendChild(o); });
    select.value = generos.includes(anterior) ? anterior : '';
  }
  $('indice').innerHTML = c.items.map((it, i) => `<div class="sello ${i === itemActual || (c.id === 'mundos' && /^(subida|bajada)_/.test(c.items[itemActual].nivel || '') && !suelto(c.items[itemActual]) && !it.nivel && it.mundo === c.items[itemActual].mundo) ? 'on' : ''} ${visto(it) ? '' : 'oculto'}" style="--r:${((i * 37) % 7 - 3) * .5}deg" data-i="${i}"><span class="cinta"></span><canvas width="240" height="180"></canvas><small>${i + 1}</small><b>${visto(it) ? it.nombre : '¿?'}</b></div>`).join('');
  cola.length = 0;
  document.querySelectorAll('.sello').forEach((el, i) => {
    el.onclick = () => { itemActual = i; ladoSeleccionado = 'derecha'; variante = null; skinSel = 0; abrirItem(); document.querySelectorAll('.sello').forEach(s => s.classList.toggle('on', s === el)); };
    const it = c.items[i], key = it.id + '|' + it.mundo, cv = el.querySelector('canvas');
    const FM = c.id === 'campeche' && fotosDe(it.id)[0];
    if (FM && visto(it)) { const im = new Image(); im.onload = () => { const x = cv.getContext('2d'), k = Math.max(cv.width / im.width, cv.height / im.height), w = im.width * k, h = im.height * k; x.drawImage(im, (cv.width - w) / 2, (cv.height - h) / 2, w, h); }; im.src = '../Roguelike/fotos/saber/' + FM.a; }
    else if (c.id === 'campeche') {
      // sin foto real de Campeche no se enseña una captura del juego: una tarjeta de papel con el tema
      const x = cv.getContext('2d'), g = x.createLinearGradient(0, 0, 0, cv.height); g.addColorStop(0, '#e6d5b3'); g.addColorStop(1, '#d4bf97');
      x.fillStyle = g; x.fillRect(0, 0, cv.width, cv.height); x.strokeStyle = 'rgba(122,90,68,.45)'; x.lineWidth = 2; x.setLineDash([8, 6]); x.strokeRect(10, 10, cv.width - 20, cv.height - 20);
      x.setLineDash([]); x.fillStyle = '#7a5a44'; x.textAlign = 'center'; x.font = 'italic 600 22px Alegreya, serif'; x.fillText(it.sub || 'Campeche', cv.width / 2, cv.height / 2 - 4); x.font = '600 14px "Alegreya Sans", sans-serif'; x.fillText('foto por conseguir', cv.width / 2, cv.height / 2 + 22);
    }
    else if (MINIS.has(key)) cv.getContext('2d').drawImage(MINIS.get(key), 0, 0, cv.width, cv.height); else cola.push({ it, key, cvs: [cv] });
  });
  if (c.id === 'mundos') filtrarMundos();
  if (modoTarjetas) abrirTarjetas();
  abrirItem();
}
// un nivel alterno va en su propia tarjeta si es de otro género que el nivel principal de su mundo (o si se marcó independiente)
const generoDe = it => (it.datos.find(([a]) => a === 'Género') || [])[1] || 'Plataformas 2D';
const suelto = it => { if (!it || !it.nivel) return false; if (it.def && it.def.independiente) return true; const b = CATS.find(c => c.id === 'mundos').items.find(q => !q.nivel && q.mundo === it.mundo); return !!b && generoDe(b) !== generoDe(it); };
const tipoMundo = it => ((it.datos.find(([a]) => a === 'Género') || [])[1] || 'Plataformas 2D') === 'Plataformas 2D' ? 'Plataformero' : 'Especiales';
// la versi\u00f3n de cada nivel: el principal (de lado), la subida, la bajada u otro nivel alterno del mismo mundo
const versionMundo = it => !it.nivel ? 'lado' : /^subida_/.test(it.nivel) ? 'subida' : /^bajada_/.test(it.nivel) ? 'bajada' : 'otros';
const VERSION_TXT = { lado: 'De lado', subida: 'Hacia arriba', bajada: 'Hacia abajo', otros: 'Alterno' };
function filtrarMundos() {
  const c = CATS[catActual]; if (c.id !== 'mundos') return;
  const normaliza = s => s.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const busca = normaliza($('buscarMundo').value.trim()), genero = $('generoMundo').value, version = $('direccionMundo').value;
  let total = 0;
  $('indice').querySelectorAll('.sello').forEach(el => {
    const it = c.items[+el.dataset.i], disponible = visto(it), g = tipoMundo(it);
    // sin filtros cada mundo es una sola tarjeta: sus otras versiones se escogen desde ella (o con el filtro de versión)
    const agrupado = false;   // cada nivel es su propia tarjeta: ya no se esconden las versiones alternas dentro del nivel principal
    el.hidden = agrupado || !!((busca || genero || version) && (!disponible || (busca && !normaliza(it.nombre).includes(busca)) || (genero && g !== genero) || (version && versionMundo(it) !== version)));
    if (!el.hidden) { total++; const num = el.querySelector('small'); if (num) num.textContent = total; }   // la numeración sigue corrida entre las tarjetas que se ven (sin saltos como 5 → 7)
  });
  let aviso = $('indice').querySelector('.sin-resultados');
  if (!aviso) { aviso = document.createElement('p'); aviso.className = 'sin-resultados'; aviso.textContent = 'No hay mundos que coincidan con la búsqueda.'; $('indice').appendChild(aviso); }
  aviso.hidden = total > 0;
}
$('buscarMundo').addEventListener('input', filtrarMundos);
$('generoMundo').addEventListener('change', filtrarMundos);
$('direccionMundo').addEventListener('change', filtrarMundos);
// lo largo del libro: la nota, lo extra de Campeche y, en los mundos, los datos ya descubiertos ahí
function notaAbierta(it) {
  if (it.def) {
    const partes = [`Técnica: ${it.tecnica}`, `Descripción del nivel: ${it.nota || ''}`];
    // La ficha conserva el dato de su propio nivel; los hallazgos se consultan
    // por separado en Campeche, donde no sustituyen el contexto del mundo.
    if (it.def.dato) partes.push(`Campeche de verdad:\n${it.def.dato}`);
    return partes.join('\n\n');
  }
  let t = it.nota || ''; const extra = CAMPECHE_SABER.LIBRO[it.id];
  if (extra) t += `\n\nDe verdad: ${extra}`;
  return t.trim();
}
// Palabras que identifican una ficha concreta, sin adivinar por palabras genéricas.
const REFERENCIAS_CAMPECHE = {
  'hanal-pixan':['Hanal Pixán','Hanal Pixan'], 'choo-baak':['Choo Baak','Pomuch'],
  'pan-pomuch':['pan de Pomuch'], 'pan-cazon':['pan de cazón'],
  lorencillo:['Lorencillo','Laurens de Graaf'], toma1685:['toma de 1685'],
  'isla-tris':['Isla Tris','Isla de Términos'], dampier:['William Dampier'],
  'flota-pirata':['Cornelius Jol','Jacobo Jackson','William Parker','Bartolomé Portugués'],
  fundacion:['Francisco de Montejo el Mozo'], 'ultimo-baluarte':['Baluarte de Santiago','Xmuch Haltún'],
  sancarlos:['Baluarte de San Carlos'], bonete:['El Bonete'], soledad:['Baluarte de la Soledad'],
  'puerta-tierra':['Puerta de Tierra'], 'puerta-mar':['Puerta de Mar'],
  teatro:['Teatro Francisco de Paula Toro','Teatro Toro','Teodoro Journot'],
  'cinco-pisos':['Edificio de los Cinco Pisos'], mascarones:['Templo de los Mascarones','Kinich Ahau'],
  'mascara-jade':['máscara de Calakmul','máscara de jade'], calakmul:['Calakmul'],
  chicanna:['Chicanná'], hormiguero:['Hormiguero'], riobec:['Río Bec'], becan:['Becán'],
  jaina:['Isla de Jaina','Jaina'], 'mala-pelea':['bahía de la Mala Pelea','Moch Couoh'],
  'cenote-azul':['Cenote Azul','Miguel Colorado'], petenes:['Los Petenes','petenes','petén','peten'],
  murcielagos:['Volcán de los Murciélagos'], delfines:['delfines nariz de botella'], cayos:['Cayos Arcas'],
  'palo-tinte':['palo de tinte','Haematoxylum campechianum'], canistel:['canistel','Pouteria campechiana'],
  'nueve-pozos':['Xtacumbilxunaan','Bolonchén','Frederick Catherwood','Catherwood'], chichonal:['Chichonal'],
  balamku:['Balamkú'], 'san-jose':['Fuerte de San José el Alto','San José el Alto'],
  'casa-seis':['Casa No. 6','Casa Seis'], xpujil:['Xpuhil','Xpujil'], hecelchakan:['Hecelchakán'],
  candelaria:['río Candelaria'], sabancuy:['Sabancuy'], guadalupe:['barrio de Guadalupe'],
  'puente-perros':['Puente de los Perros'], palizada:['Palizada'], hochob:['Hochob'], xicalango:['Punta Xicalango','Xicalango'],
  nortes:['los nortes'], 'carnaval-1582':['Carnaval de Campeche'], 'juan-carnaval':['Juan Carnaval'],
  pintadera:['Martes de Pintadera'], 'cristo-negro':['Cristo Negro'], 'feria-sanroman':['Feria de San Román'],
  silbatos:['silbatos de Tepakán','silbato de Tepakán','Tepakán'], jipi:['sombreros de jipi','palma de jipi','Bécal'],
  astilleros:['astilleros de Campeche','astillero de Campeche'], cantarell:['Rudesindo Cantarell'],
  henequen:['henequén'], xtabay:['Xtabay'], 'opal-roxanne':['Opal y Roxanne'], 'opal-quien':['huracán Opal','Opal']
};
const normalizaReferencia = s => s.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const palabrasReferencia = Object.entries(REFERENCIAS_CAMPECHE).flatMap(([id, palabras]) => palabras.map(palabra => ({ id, palabra }))).sort((a,b) => b.palabra.length-a.palabra.length);
const patronReferencia = new RegExp('(?<![\\p{L}\\p{N}])(?:' + palabrasReferencia.map(x => x.palabra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?![\\p{L}\\p{N}])', 'giu');
function enlazaCampeche(contenedor, actual) {
  const fichas = CATS.find(c => c.id === 'campeche').items;
  const nodos = [], caminante = document.createTreeWalker(contenedor, NodeFilter.SHOW_TEXT);
  while (caminante.nextNode()) nodos.push(caminante.currentNode);
  for (const nodo of nodos) {
    const texto = nodo.nodeValue, fragmento = document.createDocumentFragment(); let desde = 0, cambio = false;
    patronReferencia.lastIndex = 0;
    for (const m of texto.matchAll(patronReferencia)) {
      const palabra = palabrasReferencia.find(x => normalizaReferencia(x.palabra) === normalizaReferencia(m[0]));
      const ficha = palabra && fichas.find(x => x.id === 'campeche:' + palabra.id);
      if (!ficha || ficha.id === actual.id || !visto(ficha)) continue;
      fragmento.appendChild(document.createTextNode(texto.slice(desde, m.index)));
      const enlace = document.createElement('button'); enlace.type = 'button'; enlace.className = 'irCampeche';
      enlace.dataset.id = ficha.id; enlace.textContent = m[0]; enlace.title = 'Ver en Campeche: ' + ficha.nombre;
      fragmento.appendChild(enlace); desde = m.index + m[0].length; cambio = true;
    }
    if (cambio) { fragmento.appendChild(document.createTextNode(texto.slice(desde))); nodo.replaceWith(fragmento); }
  }
}
$('nota').addEventListener('click', e => {
  const enlace = e.target.closest('.irCampeche'); if (!enlace) return;
  const i = CATS.findIndex(c => c.id === 'campeche'), k = CATS[i].items.findIndex(q => q.id === enlace.dataset.id);
  if (k < 0 || !visto(CATS[i].items[k])) return;
  catActual = i; itemActual = k; variante = null; skinSel = 0;
  if (modoTarjetas) ponTarjetas(false); else abrirCat();
  $('indice').querySelector('.sello.on')?.scrollIntoView({block:'nearest'});
});

// la galería: una sola imagen en el marco y flechitas para pasar a las demás.
// En los animales primero sale su dibujo del juego; en los datos de Campeche, las imágenes reales.
const fotosDe = id => (typeof CAMPECHE_FOTOS !== 'undefined' && CAMPECHE_FOTOS[id]) || [];
let galeria = [], gi = 0;
function pintaGaleria() {
  const F = galeria[gi], img = $('fotoReal'), pie = $('pieFoto'), cv = $('escena'), varias = galeria.length > 1;
  img.hidden = !F; pie.hidden = !F; cv.classList.toggle('tapado', !!F);
  if (F) { img.src = '../Roguelike/fotos/saber/' + F.a; img.alt = F.que; pie.textContent = F.que; }
  for (const id of ['fotoAnt', 'fotoSig', 'fotoNum']) $(id).hidden = !varias;
  $('fotoNum').textContent = `${gi + 1} de ${galeria.length}`;
}
function ponFotoReal(it, ok) {
  const fotos = ok ? fotosDe(it.id) : [];
  galeria = !fotos.length ? [] : it.tipo === 'vista' ? fotos : [null, ...fotos]; // null = el dibujo del juego
  gi = 0; pintaGaleria();
}
$('fotoAnt').onclick = () => { gi = (gi - 1 + galeria.length) % galeria.length; pintaGaleria(); };
$('fotoSig').onclick = () => { gi = (gi + 1) % galeria.length; pintaGaleria(); };
// dónde sale cada cosa: se averigua recorriendo los niveles del libro, una sola vez
let ORIGEN = null;
const EN_TODOS = ['cacao', 'corazon', 'meta', 'semilla', 'plaga', 'anomalia']; // no dependen del nivel: los pone el juego en todos
function origenes() {
  if (ORIGEN) return ORIGEN;
  ORIGEN = { foe: {}, entorno: {}, poder: {} };
  const pon = (mapa, k, id) => { if (k) (mapa[k] = mapa[k] || new Set()).add(id); };
  for (const q of CATS.find(c => c.id === 'mundos').items) {
    const id = q.id.slice(6), d = NIVELES[id]; if (!d) continue;
    pon(ORIGEN.poder, d.power, id);
    for (const k of d.fauna || [d.foe]) pon(ORIGEN.foe, k, id);
    if (!d.build) continue;
    let ents = []; try { ents = construirNivel(d).ents; } catch (e) {}
    for (const e of ents) {
      if (e.t === 'foe') pon(ORIGEN.foe, e.k || d.foe, id);
      else if (e.t === 'obj' || e.t === 'solid') pon(ORIGEN.entorno, ENCI.ALIAS[e.k] || (ENTORNO[e.k] ? e.k : null), id);
      else if (e.t === 'zone') pon(ORIGEN.entorno, 'zona', id);
    }
  }
  return ORIGEN;
}
function nivelesDe(it) {
  const O = origenes();
  if (it.niveles) return it.niveles.filter(id => NIVELES[id]);
  if (it.tipo === 'enemigo') return [...(O.foe[it.clave] || [it.nivel || it.mundo])];
  if (it.tipo === 'poder') return [...(O.poder[it.poder] || [it.nivel || it.mundo])];
  if (it.tipo === 'entorno') return [...(O.entorno[it.clave] || [it.nivel || it.mundo])];
  if (it.tipo === 'plataforma') return [it.nivel || it.mundo];
  return null;
}
// los estilos donde un enemigo es de casa; en los demás solo sale como anomalía
function estilosCasa(it) { const M = CATS.find(c => c.id === 'mundos').items; return new Set((nivelesDe(it) || []).map(id => (M.find(q => q.id === 'mundo:' + id) || {}).mundo).filter(Boolean)); }
function cuentaAnomalias(it) {
  if (it.tipo !== 'enemigo' || it.subjefe || typeof ANOMALIAS === 'undefined' || !ANOMALIAS.seCuela(it.clave)) return null;
  const casa = estilosCasa(it), otros = MUNDOS_LIBRO.filter(m => STYLE_MAP[m] && !casa.has(m));
  return `${otros.filter(m => ENCI.tiene(ANOMALIAS.id(it.clave, m))).length} de ${otros.length} estilos`;
}
// el visor enseña lo que existe en el juego: sus mundos y, de los demás, las anomalías
function estilosVisor(it) {
  if (it.subjefe) return [it.mundo];
  const casa = estilosCasa(it), cuela = typeof ANOMALIAS !== 'undefined' && ANOMALIAS.seCuela(it.clave);
  return MUNDOS_LIBRO.filter(m => STYLE_MAP[m] && NIVELES[m] && (casa.has(m) ? !vistaJugador || ENCI.tiene('mundo:' + m) : cuela && (!vistaJugador || ENCI.tiene(ANOMALIAS.id(it.clave, m)))));
}
function saleEn(it) {
  if (it.tipo === 'jefe') return 'Cualquier mundo de la partida';
  if (it.clave === 'burbujaCura') return 'Las peleas contra jefes';
  if (it.clave === 'mercado') return 'Entre mundo y mundo';
  if (it.tipo === 'personaje') return 'Todos los mundos';
  if (it.tipo === 'entorno' && EN_TODOS.includes(it.clave)) return 'Todos los niveles de plataformas';
  const ids = nivelesDe(it); if (!ids || !ids.length) return null;
  const ven = ids.filter(id => !vistaJugador || ENCI.tiene('mundo:' + id)), faltan = ids.length - ven.length;
  const ligas = ven.map(id => `<a class="irNivel" data-n="${id}">${NIVELES[id].nombre}</a>`).join(', ');
  if (!faltan) return ligas;
  const resto = faltan === 1 ? 'un nivel que aún no visitan' : `${faltan} niveles que aún no visitan`;
  return ligas ? `${ligas} y ${resto}` : resto;
}
function abrirItem() {
  const c = CATS[catActual], it = c.items[itemActual]; guardaUI();
  const ok = visto(it), ent = $('entrada');
  ent.classList.remove('voltea'); void ent.offsetWidth; ent.classList.add('voltea');
  ent.classList.toggle('bloqueada', !ok);
  $('candado').innerHTML = ok ? '' : `Todavía no lo descubren.<br><small>Sigan jugando: aparece en ${ENCI.tiene('mundo:' + it.mundo) ? NIVELES[it.nivel || it.mundo].nombre : 'algún mundo que aún no visitan'}.</small>`;
  $('nombre').textContent = ok ? it.nombre : '¿?';
  $('subt').textContent = ok ? it.sub : '';
  const donde = ok && saleEn(it), anomalias = ok && cuentaAnomalias(it);
  if (it.tipo === 'jefe' && ok && !variante) variante = !vistaJugador ? it.mundo : (MUNDOS_LIBRO.find(m => ENCI.tiene(`variante:${it.clave}:${m}`)) || it.mundo);
  $('datos').innerHTML = ok ? [...it.datos, ...(it.tipo === 'jefe' ? VENTAJAS.filaVariante(it.clave, variante || it.mundo) : []), ...(donde ? [['Sale en', donde]] : []), ...(anomalias ? [['Anomalías', anomalias]] : [])].map(([a, b]) => `<dt>${a}</dt><dd>${String(b ?? '').replace(/^(\s*[¿¡"“'«(]*)(\p{Ll})/u, (_, inicio, letra) => inicio + letra.toLocaleUpperCase('es'))}</dd>`).join('') : '';
  const nota = $('nota'); nota.textContent = ok ? notaAbierta(it) : '';
  if (ok && it.def) {
    const texto = nota.textContent, partes = texto.split(/(Técnica:|Descripción del nivel:|Campeche de verdad:)/);
    nota.textContent = '';
    for (const parte of partes) {
      if (/^(Técnica:|Descripción del nivel:|Campeche de verdad:)$/.test(parte)) {
        const titulo = document.createElement('strong'); titulo.className = 'nota-etiqueta'; titulo.textContent = parte; nota.appendChild(titulo);
      } else nota.appendChild(document.createTextNode(parte));
    }
  }
  if (ok) enlazaCampeche(nota, it);
  ponFotoReal(it, ok);
  const jugar = $('irJugar'); jugar.style.display = ok && (it.tipo === 'mundo' || it.tipo === 'modo' || it.tipo === 'jefe') ? '' : 'none'; jugar.href = urlJugar(it);
  jugar.textContent = it.tipo === 'jefe' ? 'Pelear contra este jefe' : 'Jugar este mundo'; jugar.onclick = () => { jugar.href = urlJugar(it); }; // la variante (el mundo) se puede cambiar después
  // variantes de los jefes: una por cada mundo
  const vv = $('variantes'); $('deCerca').style.display = 'none';
  if (ok && (it.tipo === 'jefe' || it.tipo === 'enemigo')) {
    $('deCerca').style.display = 'block';
    $('deCerca').onclick = () => acercarEscena(it);
  }
  if (it.tipo === 'jefe' && ok) {
    if (!variante) variante = !vistaJugador ? it.mundo : (MUNDOS_LIBRO.find(m => ENCI.tiene(`variante:${it.clave}:${m}`)) || it.mundo);
    const n = MUNDOS_LIBRO.filter(m => ENCI.tiene(`variante:${it.clave}:${m}`)).length;
    vv.innerHTML = `<div style="width:100%;font:italic 500 14px Alegreya;color:#7a5a44">Variantes encontradas: ${n} de ${MUNDOS_LIBRO.length}</div>` + MUNDOS_LIBRO.map(m => { const has = !vistaJugador || ENCI.tiene(`variante:${it.clave}:${m}`); return `<button class="${m === variante ? 'on' : ''} ${has ? '' : 'no'}" data-m="${m}" ${has ? '' : 'disabled'}>${has ? STYLE_MAP[m].name : '¿?'}</button>`; }).join('');
    vv.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { variante = b.dataset.m; abrirItem(); });
    if (it.clave === 'ruptura' && typeof RUPTURA_FORMAS !== 'undefined') {
      const control = document.createElement('div'); control.style.cssText = 'display:flex;align-items:center;gap:6px;width:100%;margin:3px 0 10px;font:700 14px Alegreya Sans,sans-serif;color:#6a3a22';
      const etiqueta = document.createElement('label'); etiqueta.textContent = 'Forma:'; etiqueta.htmlFor = 'formaRuptura';
      const select = document.createElement('select'); select.id = 'formaRuptura'; select.setAttribute('aria-label', 'Forma de la Ruptura');
      select.style.cssText = 'flex:1;min-width:0;padding:6px 8px;border:1px solid #bd9e74;border-radius:6px;background:#fffaf0;color:#4a2d1c;font:700 13px Alegreya Sans,sans-serif';
      RUPTURA_FORMAS.FORMAS.forEach((f, i) => { const op = document.createElement('option'); op.value = i; op.textContent = `${i + 1}. ${f.nombre}`; select.appendChild(op); });
      select.value = formaRuptura; select.onchange = () => { formaRuptura = +select.value; sucio = true; };
      control.append(etiqueta, select); vv.prepend(control);
    }
  } else if (esIF(it) && ok) {
    $('deCerca').style.display = 'block';
    if (!variante) variante = it.mundo;
    const vistos = MUNDOS_LIBRO.filter(m => !vistaJugador || ENCI.tiene('mundo:' + m));
    const quien = it.clave === 'itzel' ? 'Itzel' : it.clave === 'fresita' ? 'Fresita' : 'Itzel y Fresita';
    vv.innerHTML = `<div style="width:100%;font:italic 500 14px Alegreya;color:#7a5a44">${quien} en cada estilo (${vistos.length} de ${MUNDOS_LIBRO.length})</div>`
      + MUNDOS_LIBRO.slice().sort((a, b) => STYLE_MAP[a].name.localeCompare(STYLE_MAP[b].name, 'es')).map(m => { const has = vistos.includes(m); return `<button class="${m === variante ? 'on' : ''} ${has ? '' : 'no'}" data-m="${m}" ${has ? '' : 'disabled'}>${has ? STYLE_MAP[m].name : '¿?'}</button>`; }).join('');
    vv.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { variante = b.dataset.m; abrirItem(); });
    $('deCerca').onclick = () => {
      const mundos = vistos.slice().sort((a, b) => STYLE_MAP[a].name.localeCompare(STYLE_MAP[b].name, 'es'));   // mismo orden que los botones de estilos
      if (!mundos.includes(variante)) mundos.unshift(variante);
      function datosMundo(m) {
        ponSkinEnci(m);
        return { st: STYLE_MAP[m], titulo: quien, sub: STYLE_MAP[m].name };
      }
      function elegirMundo(m) { variante = m; return datosMundo(m); }
      const inicial = datosMundo(variante);
      PRIMER_PLANO.abrir(inicial.st, inicial.titulo, inicial.sub, { solo: it.clave,
        estilos: { lista: mundos.map(m => ({ id: m, nombre: STYLE_MAP[m].name })).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')), actual: variante, poner: elegirMundo },
        cambiarMundo: dir => elegirMundo(mundos[(mundos.indexOf(variante) + dir + mundos.length) % mundos.length]),
        alCerrar: () => abrirItem() });
    };
  } else if (false) {   // (las «versiones de este mundo» ya no se agrupan: cada nivel tiene su tarjeta)
    // las versiones de este mundo: de lado, hacia arriba, hacia abajo y demás
    const hermanos = c.items.map((q, i) => ({ q, i })).filter(({ q }) => q.mundo === it.mundo && !suelto(q));
    vv.innerHTML = `<div style="width:100%;font:italic 500 14px Alegreya;color:#7a5a44">Versiones de este mundo</div>` + hermanos.map(({ q, i }) => {
      const has = visto(q);
      return `<button class="${i === itemActual ? 'on' : ''} ${has ? '' : 'no'}" data-k="${i}" ${has ? '' : 'disabled'} title="${has ? q.nombre : ''}">${has ? VERSION_TXT[versionMundo(q)] + (versionMundo(q) === 'otros' ? ': ' + q.nombre : '') : '¿?'}</button>`;
    }).join('');
    vv.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { itemActual = +b.dataset.k; ladoSeleccionado = 'derecha'; variante = null; skinSel = 0; abrirCat(); });
  } else vv.innerHTML = '';
  sucio = true;
}
// cada nivel de «Sale en» lleva a su página en Mundos
$('datos').addEventListener('click', e => {
  const a = e.target.closest('.irNivel'); if (!a) return;
  const i = CATS.findIndex(c => c.id === 'mundos'), k = CATS[i].items.findIndex(q => q.id === 'mundo:' + a.dataset.n); if (k < 0) return;
  catActual = i; itemActual = k; variante = null; skinSel = 0; abrirCat();
});
// las flechas saltan las tarjetas escondidas por el filtro o por el agrupado de versiones
function pasa(dir) {
  const c = CATS[catActual], n = c.items.length, tarjetas = $('indice').querySelectorAll('.sello');
  for (let k = 1; k <= n; k++) { const i = (itemActual + dir * k + n * k) % n; if (!tarjetas[i] || !tarjetas[i].hidden) { itemActual = i; break; } }
  variante = null; skinSel = 0; abrirCat();
}
$('ant').onclick = () => pasa(-1);
$('sig').onclick = () => pasa(1);
function vistaBoton() { if (!$('vista')) return; $('vista').classList.toggle('on', vistaJugador); $('vista').textContent = vistaJugador ? 'Viendo como jugador' : 'Ver como jugador'; }
if ($('vista')) { if (window.MODO_PUBLICO) $('vista').style.display = 'none'; else $('vista').onclick = () => { vistaJugador = !vistaJugador; vistaBoton(); abrirCat(); }; }
addEventListener('keydown', e => { if (e.target.matches('input, select, textarea')) return; if (e.key === 'ArrowRight') $('sig').click(); if (e.key === 'ArrowLeft') $('ant').click(); });

// Regenerar todas las vistas (mapas, enemigos, jefes…) con los assets que hay ahora: se borran las miniaturas guardadas y se vuelven a pintar.
// Se hace solo un par de veces después de abrir (cuando ya llegaron las imágenes) y con el botón «Regenerar vistas».
function regeneraVistas() { MINIS.clear(); cola.length = 0; abrirCat(); }
window.regeneraVistas = regeneraVistas;
// (sin repintado automático: refrescaba la enciclopedia una y otra vez y, dentro de las demostraciones del juego, las hacía tardar; queda el botón)
{ const cab = document.querySelector('.cabeza'); if (cab && !document.getElementById('regeneraVistas')) {
    const b = document.createElement('button'); b.id = 'regeneraVistas'; b.type = 'button'; b.textContent = 'Regenerar vistas'; b.title = 'Vuelve a pintar las miniaturas de mapas, enemigos y jefes con los assets actuales';
    b.style.cssText = 'margin-left:10px;padding:3px 10px;font:600 13px "Alegreya Sans",sans-serif;color:#4a2e20;background:#fff3dc;border:1.5px solid #a84442;border-radius:12px;cursor:pointer';
    b.onclick = () => { b.textContent = 'Regenerando…'; regeneraVistas(); setTimeout(() => { b.textContent = 'Regenerar vistas'; }, 2500); };
    if (window.MODO_PUBLICO) b.style.display = 'none';   // botón de trabajo
    cab.appendChild(b); } }
// miniaturas: se pintan una por cuadro con la escena real y se recorta lo importante
const off = mkCanvas(VW, VH), offEsc = new Escena(off);
function miniatura(job) {
  // La tarjeta no debe capturar el escenario mientras la hoja del abordador carga.
  if (job.it.tipo === 'enemigo' && job.it.clave === 'abordador' && window.ENEMIGOS_ASSETS) {
    const hoja = ENEMIGOS_ASSETS.hojaForge('abordador');
    if (hoja && !hoja.complete) {
      if (!job.esperaAbordador) {
        job.esperaAbordador = true;
        const reintenta = () => { job.esperaAbordador = false; cola.push(job); };
        hoja.addEventListener('load', reintenta, { once: true });
        hoja.addEventListener('error', reintenta, { once: true });
      }
      return;
    }
  }
  // Las piezas del nivel mejorado (vestirNivel) aún se descargan: se espera un poco (máx. ~12 s) en vez de pintar el dibujo de respaldo
  // y dejar la miniatura en blanco o con el aspecto viejo para siempre.
  if (job.it.mundo && (window.VESTIDOS || []).some(v => v.id === job.it.mundo && !v.todo()) && (job.esperasV = (job.esperasV || 0) + 1) < 40) {
    setTimeout(() => cola.push(job), 300); return;
  }
  // No guardar el dibujo de respaldo mientras aún se cargan los recursos del abordaje.
  if (job.it.def && job.it.def.id === 'abordaje' && MODOS.golpes.listoVista && !MODOS.golpes.listoVista()) {
    // sus hojas aún se descargan: las demás miniaturas siguen y esta vuelve al frente en cuanto estén listas
    if (!job.espera) { job.espera = true; const reintenta = () => { if (MODOS.golpes.listoVista()) { job.espera = false; cola.unshift(job); } else setTimeout(reintenta, 80); }; setTimeout(reintenta, 80); }
    return;
  }
  offEsc.mostrar(job.it.tipo === 'mundo' ? Object.assign({}, job.it, { tipo: 'vista' }) : job.it); const cuadros = job.it.tipo === 'jefe' ? 150 : job.it.def && job.it.def.id === 'abordaje' ? 170 : 50; for (let i = 0; i < cuadros; i++) offEsc.paso(1 / 60);
  const hojaAbordador = job.it.tipo === 'enemigo' && job.it.clave === 'abordador' && window.ENEMIGOS_ASSETS ? ENEMIGOS_ASSETS.hojaForge('abordador') : null;
  const retratoAbordador = hojaAbordador && hojaAbordador.complete && hojaAbordador.naturalWidth;
  // La escena de fondo se conserva, pero el pirata se dibuja en primer plano
  // para que la miniatura no lo oculte entre las plantas.
  if (retratoAbordador) offEsc.g.foes = [];
  const TW = 240, TH = 180, m = mkCanvas(TW, TH), x = m.getContext('2d');
  if (offEsc.foco && !offEsc.st.base) { off.width = TW; off.height = TH; offEsc.pintar(TW / VW, offEsc.zoom * 1.6); const oh = off.height, ow = Math.min(off.width, oh * TW / TH); x.drawImage(off, (off.width - ow) / 2, 0, ow, oh, 0, 0, TW, TH); }   // la escena sale 16:9: se recorta a 4:3 para llenar la tarjeta (antes dejaba una franja gris abajo)
  else { off.width = VW; off.height = VH; offEsc.pintar(1, 1); const fo = offEsc.foco; if (fo) x.drawImage(off, clamp(fo[0] - offEsc.g.cam - 80, 0, VW - 160), clamp(fo[1] - 70, 0, VH - 120), 160, 120, 0, 0, TW, TH); else x.drawImage(off, (VW - 320) / 2, 0, 320, 240, 0, 0, TW, TH); }
  if (retratoAbordador) x.drawImage(hojaAbordador, 60, 26, 144, 207, 86, 34, 68, 98);
  MINIS.set(job.key, m); for (const cv of job.cvs || [job.cv]) cv.getContext('2d').drawImage(m, 0, 0, cv.width, cv.height);
  // los dibujos de Itzel y Fresita se piden hasta que se pintan por primera vez: la primera pasada sale sin ellos
  // (o con el dibujo de respaldo), así que se repite una vez cuando ya llegaron
  if (job.it.tipo === 'personaje' && !job.repetido) { job.repetido = true; setTimeout(() => cola.push(job), 1500); }
  // las vistas de mapas y enemigos pintan primero el dibujo de respaldo si sus imágenes aún no llegan: la miniatura se repinta
  // dos veces más, a los 2.5 y 8 segundos, para que quede igual que en el juego
  // si al pintar aún había imágenes descargándose (assets del mundo, sprites), se repinta en cuanto terminen de llegar (máx. 3 veces por vista)
  if (!new URLSearchParams(location.search).has('demo') && hayPendientes() && (job.repintes || 0) < 6) {
    job.repintes = (job.repintes || 0) + 1; let n = 0;
    const t = setInterval(() => { if (!hayPendientes() || ++n > 150) { clearInterval(t); MINIS.delete(job.key); cola.push(job); } }, 400);
  }
}

// ===================== BUCLE =====================
let last = performance.now();
const demoControlada = new URLSearchParams(location.search).has('demo');
let demoReproduciendo = !demoControlada;
let demoLista = false, demoCuadrosListos = 0;
if (demoControlada) addEventListener('message', e => {
  if (e.source !== parent || !e.data || !e.data.controlDemo) return;
  if (e.data.controlDemo === 'reiniciar') { sucio = true; roto = false; cola.length = 0; demoReproduciendo = true; }
  else if (e.data.controlDemo === 'reproducir') demoReproduciendo = true;
  else if (e.data.controlDemo === 'pausar') demoReproduciendo = false;
});
// Un libro precargado dentro del juego no debe renderizar durante la cinemática.
function libroOculto() {
  if (window.parent === window || demoControlada) return false;
  try { const caja = window.parent.document.getElementById('enci'); return !!caja && !caja.classList.contains('on'); }
  catch (_) { return false; }
}
function bucle(now) {
  if (libroOculto()) { last = now; setTimeout(() => requestAnimationFrame(bucle), 250); return; }
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (cercaActivo) { requestAnimationFrame(bucle); return; }
  const c = CATS[catActual], it = c.items[itemActual];
  // primero la entrada viva; luego las miniaturas, una por cuadro (la escena viva espera)
  if (CALIENTA) cola.length = 0;
  if (cola.length && !sucio) { const job = cola.shift(); try { miniatura(job); } catch (e) { console.warn('miniatura', job.key, e); } roto = true; }
  else {
    if (sucio || roto) { vivo.mostrar(it, it.tipo === 'jefe' || esIF(it) ? variante : undefined); if (sucio) vivo.pose = null; sucio = false; roto = false; }
    const st = vivo.st, cv = vivo.cv, cssW = cv.clientWidth || 600, dpr = devicePixelRatio || 1;
    const S = st.fixedS ? st.fixedS : Math.min(3, Math.round(cssW * dpr / VW * 100) / 100);
    const w = Math.round(VW * S), h = Math.round(VH * S); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    cv.style.imageRendering = st.pixel ? 'pixelated' : 'auto';
    try {
      if (demoReproduciendo && (!cercaActivo || cercaAccion)) vivo.paso(dt);
      if (cercaActivo) { vivo.g.sinFresita = true; vivo.g.p.vis = false; }
      vivo.pintar(S);
      if (demoControlada && !demoLista) {
        const cargando = (window.imagenesDemoPerezosas || []).some(im => im.demoPedida && !im.complete);
        const forgeListo = !window.ITZEL_FORGE || window.ITZEL_FORGE.listoDemo(vivo.mundo);
        const vestidoListo = (window.VESTIDOS || []).filter(v => v.id === vivo.mundo).every(v => v.todo());   // las piezas del nivel mejorado ya llegaron (si no, la demostración mostraba el dibujo de antes)
        demoCuadrosListos = !cargando && forgeListo && vestidoListo ? demoCuadrosListos + 1 : 0;
        if (demoCuadrosListos >= 3) { demoLista = true; parent.postMessage({ introDemo: 'si' }, '*'); }
      }
    } catch (e) { console.warn('escena', it.id, e); sucio = true; }
  }
  requestAnimationFrame(bucle);
}
// ===================== VISTA EN TARJETAS (como la galería de antes) =====================
let modoTarjetas = false; try { modoTarjetas = !!JSON.parse(localStorage.getItem('enci-ui-rel') || '{}').tarjetas; } catch (e) {}
function abrirTarjetas() {
  const c = CATS[catActual];
  $('pestanas').innerHTML = CATS.map((k, i) => `<button class="${i === catActual ? 'on' : ''}" data-i="${i}" style="--c:${k.color}">${k.nombre}</button>`).join('');
  $('pestanas').querySelectorAll('button').forEach(b => b.onclick = () => { catActual = +b.dataset.i; itemActual = 0; variante = null; skinSel = 0; abrirCat(); });
  const n = c.items.filter(it => ENCI.tiene(it.id)).length;
  $('tarjetasIntro').textContent = `${c.intro} · ${n} de ${c.items.length} descubiertos`;
  $('tarjetas').innerHTML = c.items.map((it, i) => { const ok = visto(it);
    return `<div class="tarjeta ${ok ? '' : 'oculta'}" data-i="${i}"><div class="foto2"><canvas width="240" height="180"></canvas><span>#${i + 1}</span></div>
      <div class="txt"><h3>${ok ? it.nombre : '¿?'}</h3><div class="sub2">${ok ? it.sub : 'Todavía no se descubre'}</div>
      ${ok ? `<dl>${it.datos.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl><p>${it.nota}</p>` : ''}
      ${ok && (it.tipo === 'mundo' || it.tipo === 'modo') ? `<a class="boton" href="${urlJugar(it)}">Jugar este mundo</a>` : ''}</div></div>`; }).join('');
  document.querySelectorAll('.tarjeta').forEach((el, i) => {
    const it = c.items[i], key = it.id + '|' + it.mundo, cv = el.querySelector('canvas');
    el.querySelector('.foto2').onclick = () => { itemActual = i; variante = null; skinSel = 0; ponTarjetas(false); };
    if (MINIS.has(key)) cv.getContext('2d').drawImage(MINIS.get(key), 0, 0, cv.width, cv.height);
    else { const job = cola.find(j => j.key === key); if (job) job.cvs.push(cv); else cola.push({ it, key, cvs: [cv] }); }
  });
}
function ponTarjetas(on) {
  modoTarjetas = on; document.body.classList.toggle('modo-tarjetas', on);
  if ($('modo')) $('modo').textContent = on ? 'Ver como libro' : 'Ver en tarjetas';
  try { const v = JSON.parse(localStorage.getItem('enci-ui-rel') || '{}'); v.tarjetas = on; localStorage.setItem('enci-ui-rel', JSON.stringify(v)); } catch (e) {}
  abrirCat(); scrollTo(0, 0);
}
if ($('modo')) $('modo').onclick = () => ponTarjetas(!modoTarjetas);
document.body.classList.toggle('modo-tarjetas', modoTarjetas); if ($('modo')) $('modo').textContent = modoTarjetas ? 'Ver como libro' : 'Ver en tarjetas';
vistaBoton(); abrirCat(); requestAnimationFrame(bucle);
// las miniaturas también avanzan aunque el navegador frene los cuadros (pestaña en segundo plano)
setInterval(() => { if (!libroOculto() && cola.length && !sucio && performance.now() - last > 120) { const job = cola.shift(); try { miniatura(job); } catch (e) { console.warn('miniatura', job.key, e); } roto = true; } }, 40);

// ===================== DENTRO DEL JUEGO =====================
// Si la enciclopedia se abre desde el menú del juego (en un iframe), «Jugar»
// no recarga la página: le pide al juego que arme la partida en ese mundo.
if (window.parent !== window) {
  const juego = () => { try { return window.parent.jugarDesdeEnci ? window.parent : null; } catch (e) { return null; } };
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href*="Roguelike"]'), P = a && juego(); if (!P) return;
    e.preventDefault();
    if (a.id === 'volverMenu') { P.volverMenuDesdeEnci(); return; }
    const q = new URL(a.href, location.href).searchParams;
    if (q.get('mundo')) P.jugarDesdeEnci(q.get('mundo'), q.get('nivel'), q.get('jefe'), q.get('forma'), q.get('lado')); else P.cerrarEnci();
  });
  if (juego()) { const j = document.getElementById('jugar'); if (j) j.textContent = 'Volver al juego'; }
  window.ENCI_REFRESCA = () => { ENCI.recargar(); abrirCat(); };
  // si el teclado se queda aquí cuando la enciclopedia está cerrada, las teclas se le pasan al juego
  for (const tipo of ['keydown', 'keyup']) addEventListener(tipo, e => { const P = juego(); if (!P) return; const abierta = P.document.getElementById('enci').classList.contains('on'); if (abierta && e.code !== 'Escape') return; P.dispatchEvent(new KeyboardEvent(tipo, { code: e.code, key: e.key })); if (!abierta) e.preventDefault(); });
}

// en pantallas angostas la entrada queda abajo del índice: al escoger algo, se baja a verla
document.addEventListener('click', e => {
  if (!(e.target.closest && e.target.closest('.sello')) || !matchMedia('(max-width: 900px)').matches) return;
  setTimeout(() => { const d = document.querySelector('.pagina.der'); if (d) d.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
});

// ===================== SOLO LA DEMOSTRACIÓN DE UN PODER =====================
// ?demo=asidero&mundo=anime : el juego mete esta página en la tarjeta de inicio de nivel y solo se ve la escena del poder, en bucle.
(() => {
  const q = new URLSearchParams(location.search), pid = q.get('demo'); if (!pid) return;
  const aviso = ok => { try { parent.postMessage({ introDemo: ok ? 'si' : 'no', poder: pid }, '*'); } catch (e) {} };
  let ci = -1, ii = -1; const m = q.get('mundo'), nivel = q.get('nivel'), def = nivel && NIVELES[nivel];
  CATS.forEach((c, i) => c.items.forEach((it, j) => { if (it.id === 'poder:' + pid) { ci = i; ii = j; } }));
  if (def && def.modo && MODOS[def.modo] && STYLE_MAP[m]) {
    ci = CATS.findIndex(c => c.id === 'poderes');
    if (ci < 0) { aviso(false); return; }
    ii = CATS[ci].items.push({ id: 'demo-nivel:' + nivel, tipo: 'modo', mundo: m, def, demoIntro: true }) - 1;
  } else if (ci < 0 || !DEMO[pid] || !DEMO[pid].pasos.length) { aviso(false); return; }
  const it = CATS[ci].items[ii]; if (m && STYLE_MAP[m]) { it.mundo = m; if (def && !def.modo) it.nivel = nivel; else if (NIVELES[m]) it.nivel = m; }
  const css = document.createElement('style'); css.textContent = '#escena{position:fixed!important;inset:0;width:100vw!important;height:100vh!important;z-index:99999;background:#000;object-fit:contain} html,body{overflow:hidden!important}'; document.head.appendChild(css); document.body.appendChild($('escena'));   // fuera de la página que gira, para que cubra todo
  catActual = ci; itemActual = ii; variante = null; skinSel = 0; cola.length = 0; sucio = true;
})();
