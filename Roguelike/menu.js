'use strict';
// =====================================================================
//  MENÚ, SKINS Y LOGROS (se carga después de juego.js)
//  · Menú principal de verdad: Jugar, Skins, Logros, Enciclopedia.
//    Antes de cada partida salen los controles.
//  · Skins: en cada mundo sale un diseño al azar de los que dejó David
//    (primero los que el jugador no ha visto). Cuando ya vio todos los de
//    un mundo, en Menú › Skins escoge su favorita y desde ahí siempre sale esa.
//    Ya no cambian al recibir daño.
//  · Logros: se guardan en este navegador y avisan al cumplirse.
// =====================================================================
const PROG = (() => {
  const KEY = 'itzel-progreso'; let d = {};
  try { d = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) {}
  d.stats = d.stats || {}; d.logros = d.logros || {}; d.skins = d.skins || {};
  for (const k of ['mundos', 'generos', 'jefes']) d.stats[k] = d.stats[k] || {};
  return { d, s: d.stats, save() { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} } };
})();

// ---------------------------------------------------------------------
//  AVISOS (logros y skins): un parche bordado que entra por arriba
// ---------------------------------------------------------------------
// Hablan por turnos: al llegar a un mundo hay unos segundos de calma, nunca salen dos cosas juntas, y logros
// y skins esperan a que termine el mundo. Lo urgente (conectar un control, un doblón) pasa directo.
const TURNO = (() => {
  let hasta = 0, calma = 0;
  return { calma(ms) { calma = performance.now() + ms; }, libre: () => performance.now() >= Math.max(hasta, calma), ocupa(ms) { hasta = performance.now() + ms; }, mundo: 0 };
})();
const AVISOS = (() => {
  const caja = document.createElement('div'); caja.id = 'avisos'; document.body.appendChild(caja);
  const espera = []; let cur = null;
  const pinta = (titulo, texto, icono) => {
    const el = document.createElement('div'); el.className = 'aviso';
    el.innerHTML = `<img src="${ico(icono, 5)}"><div><small>${titulo}</small><b>${texto}</b></div>`;
    caja.appendChild(el); setTimeout(() => el.classList.add('sale'), 3800); setTimeout(() => el.remove(), 4400);
  };
  // varios del mismo tipo salen juntos en un solo aviso
  function junta() {
    const q = espera.shift(), iguales = espera.filter(o => o.tipo === q.tipo); if (!iguales.length) return pinta(q.titulo, q.texto, q.icono);
    for (const o of iguales) espera.splice(espera.indexOf(o), 1);
    const n = iguales.length + 1, nombres = [q, ...iguales].map(o => o.corto);
    pinta(q.tipo === 'logro' ? `¡${n} logros desbloqueados!` : `${n} avisos nuevos`, nombres.length > 3 ? `${nombres.slice(0, 2).join(', ')} y ${n - 2} más` : nombres.join(', '), q.icono);
  }
  setInterval(() => {
    if (CUR !== cur && STATE === 'play') { cur = CUR; TURNO.mundo++; TURNO.calma(9000); }
    if (!espera.length) return;
    if (STATE === 'cine' || STATE === 'loading' || STATE === 'play' || !TURNO.libre()) return; // en el juego no interrumpen: salen al terminar el mundo
    junta(); TURNO.ocupa(1400);
  }, 400);
  const avisa = (titulo, texto, icono = 'cup') => pinta(titulo, texto, icono);
  // lo que puede esperar al final del mundo
  avisa.alFinal = (titulo, texto, icono = 'cup', tipo = titulo, corto = texto) => espera.push({ titulo, texto, icono, tipo, corto });
  return avisa;
})();

// ---------------------------------------------------------------------
//  SKINS
// ---------------------------------------------------------------------
// Cada mundo conserva el modelo elegido para su estilo.
function ponSkin(id) { if (RUN) { aplicaElegido(id, 0); RUN.diseno = 0; } }
// ya no se alterna el diseño al recibir daño
cambiaDiseno = function () {};

// ---------------------------------------------------------------------
//  LOGROS
// ---------------------------------------------------------------------
const N_JEFES = Object.keys(JEFES).length;
const LOGROS = [
  { id: 'primeros', icon: 'feather', nombre: 'Primeros pasos', desc: 'Terminen su primer mundo.', meta: 1, valor: s => s.mundosHechos || 0 },
  { id: 'cazajefes', icon: 'moon', nombre: 'Cazajefes', desc: 'Venzan a un jefe.', meta: 1, valor: s => Object.keys(s.jefes).length },
  { id: 'campeche', icon: 'cup', nombre: 'Campeche completo', desc: 'Terminen una partida: los cuatro mundos.', meta: 1, valor: s => s.victorias || 0 },
  { id: 'pisoton', icon: 'speed', nombre: 'Pisotón', desc: 'Itzel cae encima de 50 enemigos.', meta: 50, valor: s => s.stomps || 0 },
  { id: 'cuna', icon: 'bubble', nombre: 'Canción de cuna', desc: 'Fresita duerme a 30 enemigos.', meta: 30, valor: s => s.naps || 0 },
  { id: 'costal', icon: 'canistel', nombre: 'Costal de canisteles', desc: 'Junten 300 canisteles en total.', meta: 300, valor: s => s.coins || 0 },
  { id: 'rasguno', icon: 'heart', nombre: 'Sin un rasguño', desc: 'Terminen un mundo sin perder ni un corazón.', meta: 1, valor: s => s.sinDano || 0 },
  { id: 'trotamundos', icon: 'rings', nombre: 'Trotamundos', desc: 'Visiten 10 mundos distintos.', meta: 10, valor: s => Object.keys(s.mundos).length },
  { id: 'estilos', icon: 'rings', nombre: 'Todos los estilos', desc: `Visiten los ${MUNDOS.length} mundos.`, meta: MUNDOS.length, valor: s => Object.keys(s.mundos).filter(m => MUNDOS.includes(m)).length },
  { id: 'molde', icon: 'wind', nombre: 'Fuera del molde', desc: 'Jueguen los seis niveles de otro género: 2.5D, tower defense, naves, cocina, jarana y pesca.', meta: 6, valor: s => Object.keys(s.generos).length },
  { id: 'fiestas', icon: 'cup', nombre: 'Fiestas de Campeche', desc: 'Jueguen las cinco fiestas: las posadas, el Paseo de las Ánimas, el carnaval, la feria de San Román y la Campechanidad.', meta: 5, valor: s => Object.keys(s.fiestas || {}).length },
  { id: 'ruptura', icon: 'jade', nombre: 'La Ruptura, sellada', desc: 'Venzan las 10 formas de la Ruptura, hasta la de los tentáculos.', meta: 10, valor: s => s.rupturaFormas || 0 },
  { id: 'jefes', icon: 'jade', nombre: 'Ni uno se escapa', desc: `Venzan a los ${N_JEFES} jefes.`, meta: N_JEFES, valor: s => Object.keys(s.jefes).filter(k => JEFES[k]).length },
  { id: 'veloces', icon: 'speed', nombre: 'Veloces', desc: 'Terminen una partida en menos de 20 minutos.', meta: 1, valor: s => s.veloces || 0 },
  { id: 'maquinista', icon: 'wind', nombre: 'Maquinista', desc: 'Fresita abre 15 válvulas de vapor.', meta: 15, valor: s => s.valvulas || 0 },
  { id: 'anomalias', icon: 'rings', nombre: 'Cazadores de anomalías', desc: 'Atrapen 20 anomalías distintas.', meta: 20, valor: s => s.anomalias || 0 },
  { id: 'enciclopedista', icon: 'feather', nombre: 'Enciclopedista', desc: 'Descubran 60 cosas de la enciclopedia.', meta: 60, valor: () => ENCI.cuantos() },
  { id: 'otravez', icon: 'moon', nombre: 'Una más', desc: 'Pierdan una partida… y vuelvan a intentarlo.', meta: 1, valor: s => s.derrotas || 0 },
];
function revisaLogros() {
  for (const l of LOGROS) if (!PROG.d.logros[l.id] && l.valor(PROG.s) >= l.meta) { PROG.d.logros[l.id] = Date.now(); AVISOS.alFinal('¡Logro desbloqueado!', l.nombre, l.icon, 'logro'); }
  PROG.save();
}
// suma al progreso lo que la partida juntó desde la última vez
function sumaPartida() {
  if (!RUN) return; const f = RUN._sumado || (RUN._sumado = { stomps: 0, naps: 0, coins: 0 });
  for (const k of ['stomps', 'naps', 'coins', 'semillas']) { const d = (RUN[k] || 0) - (f[k] || 0); if (d > 0) PROG.s[k] = (PROG.s[k] || 0) + d; f[k] = RUN[k] || 0; }
}
setInterval(() => { if (STATE === 'play') { sumaPartida(); revisaLogros(); } }, 1000);

// ---------------------------------------------------------------------
//  ENGANCHES CON EL JUEGO
// ---------------------------------------------------------------------

GANCHOS.en('startLevel', _startLevel => function () {
  const id = curStyle().id; ponSkin(id); PROG.s.mundos[id] = true; RUN.corazonesInicio = RUN.hearts; revisaLogros();
  _startLevel();
  setTimeout(() => {
    if (CUR && CUR.def && CUR.def.modo && !(CUR.modo && CUR.modo.plataformas)) { PROG.s.generos[CUR.def.modo] = true; revisaLogros(); }
    // las fiestas: se anotan, y si es su temporada de verdad, se avisa
    if (CUR && CUR.def && CUR.def.fiesta) {
      (PROG.s.fiestas = PROG.s.fiestas || {})[CUR.def.fiesta] = true; revisaLogros();
      const f = typeof FIESTAS !== 'undefined' && FIESTAS.find(q => q.id === CUR.def.fiesta);
      if (f && f.hoy(new Date())) AVISOS.alFinal('¡Es temporada en Campeche!', f.nombre, 'cup');
    }
  }, 200);
});
GANCHOS.en('startBoss', _startBoss => function () { const id = curStyle().id; ponSkin(id); RUN.corazonesInicio = RUN.hearts; _startBoss(); });
GANCHOS.en('levelDone', _levelDone => function () {
  if (CUR && CUR.isBoss && CUR.boss) PROG.s.jefes[CUR.boss.tipo] = true;
  else { PROG.s.mundosHechos = (PROG.s.mundosHechos || 0) + 1; if (RUN.hearts >= (RUN.corazonesInicio || 0)) PROG.s.sinDano = (PROG.s.sinDano || 0) + 1; }
  sumaPartida(); revisaLogros(); _levelDone();
});
GANCHOS.en('gameOver', _gameOver => function () { const jugando = STATE === 'play'; _gameOver(); if (jugando && STATE === 'over') { PROG.s.derrotas = (PROG.s.derrotas || 0) + 1; sumaPartida(); revisaLogros(); } });
GANCHOS.en('victory', _victory => function () {
  _victory(); PROG.s.victorias = (PROG.s.victorias || 0) + 1;
  if (RUN.time < 20 * 60) PROG.s.veloces = 1;
  sumaPartida(); revisaLogros();
});
if (MEC.POW.valvula) { const abre = MEC.POW.valvula.click; MEC.POW.valvula.click = (g, x, y) => { const ok = abre(g, x, y); if (ok && g === CUR) { PROG.s.valvulas = (PROG.s.valvulas || 0) + 1; revisaLogros(); } return ok; }; }

// ---------------------------------------------------------------------
//  PANTALLAS DEL MENÚ
// ---------------------------------------------------------------------
let vistasMenu = [], rafMenu = 0;
function paraVistas() { cancelAnimationFrame(rafMenu); vistasMenu = []; }
title = function () {
  paraVistas(); sumaPartida(); PROG.save();
  STATE = 'title'; $('hud').classList.remove('on');
  const seed = (Math.random() * 1e6) | 0, r = rng(seed);
  setLevel(buildLevelFromRows(genLevel(r, 1, 0, { easy: true })));
  view.auto = true; view.setStyle(STYLE_MAP[MUNDOS[Math.floor(Math.random() * MUNDOS.length)]]); fit();
  menuPrincipal();
};
function menuPrincipal() {
  paraVistas();
  const logros = LOGROS.filter(l => PROG.d.logros[l.id]).length;
  showScreen(`<div class="title menu"><img class="logo" alt="Itzel" src="${stitched('Itzel', 16)}">
    <p class="sub">Hay aventuras que empiezan en Campeche</p>
    <div class="menu-lista panel">
      <button class="opcion" id="mJugar"><img src="${ico('heart', 5)}"><b>Jugar</b><span>Cuatro mundos al azar de ${MUNDOS.length}</span></button>
      <button class="opcion" id="mLogros"><img src="${ico('cup', 5)}"><b>Logros</b><span>${logros} de ${LOGROS.length} desbloqueados</span></button>
      <button class="opcion" id="mEnci"><img src="assets/menu-final/libro-enciclopedia.svg?v=1" alt=""><b>Enciclopedia</b><span>Mundos, enemigos, poderes y jefes</span></button>
    </div></div>`);
  if (!window.enApertura) BORDADO.teje(document.querySelector('.title .logo'));
  $('mJugar').onclick = pantallaControles; $('mLogros').onclick = pantallaLogros; $('mEnci').onclick = abrirEnci;
}
// los controles, siempre antes de jugar
function pantallaControles() {
  showScreen(`<div class="title controles"><img class="hstitch" alt="Controles" src="${stitched('Controles', 8)}">
    <p class="sub">Itzel y Fresita juegan juntas: una con el teclado y otra con el mouse</p>
    <div class="ctrl2">
      <div class="panel"><img src="${ico('heart', 6)}"><b>Itzel · teclado</b>
        <p><kbd>A</kbd><kbd>D</kbd> o <kbd>←</kbd><kbd>→</kbd> correr</p><p><kbd>Espacio</kbd> o <kbd>W</kbd> saltar (mantén para saltar más alto)</p><p><kbd>Shift</kbd> impulso (si lo consiguen en la tienda)</p><p>Cáele encima a los enemigos y a los núcleos de los jefes</p></div>
      <div class="panel"><img src="${ico('bubble', 6)}"><b>Fresita · mouse</b>
        <p>Fresita sigue al puntero</p><p><kbd>Clic izquierdo</kbd> el poder del mundo (arriba a la derecha dice cuál)</p><p><kbd>Clic derecho</kbd> canción de cuna: duerme enemigos y deshace orbes</p></div>
    </div>
    <p class="hint"><kbd>Esc</kbd> o el botón ☰ pausa la partida. Son cuatro mundos: plataformas, un nivel especial, plataformas con jefe y la Ruptura.</p>
    <button class="patch" id="cJugar">¡A jugar!</button><button class="patch verde" id="cVolver">Volver</button></div>`);
  $('cJugar').onclick = () => { PIDE = null; empezar(); }; $('cVolver').onclick = menuPrincipal;
}
function pantallaLogros() {
  paraVistas();
  const hechos = Object.keys(PROG.d.logros).length;
  showScreen(`<div class="title logros"><img class="hstitch" alt="Logros" src="${stitched('Logros', 8)}">
    <p class="sub">${hechos} de ${LOGROS.length} desbloqueados</p>
    <div class="logro-lista">${LOGROS.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')).map(l => { const ok = !!PROG.d.logros[l.id], v = Math.min(l.meta, l.valor(PROG.s)); return `<div class="logro panel ${ok ? 'ok' : ''}"><img src="${ico(l.icon, 5)}"><div><b>${l.nombre}</b><span>${l.desc}</span>${ok ? `<small>Desbloqueado el ${new Date(PROG.d.logros[l.id]).toLocaleDateString('es-MX')}</small>` : l.meta > 1 ? `<i style="--p:${v / l.meta}"></i><small>${v} de ${l.meta}</small>` : ''}</div></div>`; }).join('')}</div>
    <button class="patch volver-esquina" id="lVolver">Volver</button></div>`);
  $('lVolver').onclick = menuPrincipal;
}
// en la pausa también se puede ver el avance

GANCHOS.en('pause', _pause => function (on) { _pause(on); });

title();
