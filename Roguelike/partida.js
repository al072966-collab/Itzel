'use strict';
// =====================================================================
//  CONTINUAR
//  La partida se guarda al llegar a cada mundo: si cierran el juego o
//  salen desde la pausa, «Continuar» los regresa al principio de ese
//  mundo, con sus corazones, canisteles y regalos. Al ganar o perder se
//  borra. Las partidas que manda la enciclopedia no se guardan.
// =====================================================================
const PARTIDA = (() => {
  const conGuardado = () => RUN && !RUN.jefeDirecto && !PIDE;
  function guarda() { if (!conGuardado()) return; const c = Object.assign({}, RUN); delete c.rand; c.styles = RUN.styles.map(s => s.id); PROG.d.partida = c; PROG.save(); }
  const borra = () => { if (conGuardado()) { delete PROG.d.partida; PROG.save(); } };
  function sigue() {
    const c = PROG.d.partida, styles = c && c.styles.map(id => STYLE_MAP[id]).filter(Boolean);
    if (!c || styles.length !== c.styles.length) { delete PROG.d.partida; menuPrincipal(); return; }
    PIDE = null; newRun(c.seed); Object.assign(RUN, c, { styles, rand: rng(c.seed * 31 + c.world * 101) }); precargaPersonajes();
    if (TIPOS_RUN[RUN.world - 1] === 'ruptura') startBoss();
    else { if (c.nivelGuardado && NIVELES[c.nivelGuardado]) RUN.reintentoDef = c.nivelGuardado; startLevel({ continuar: true }); }
  }
  GANCHOS.en('startLevel', _startLevel => function (...a) { guarda(); return _startLevel.apply(this, a); });
  GANCHOS.en('startBoss', _startBoss => function (...a) { if (RUN && TIPOS_RUN[RUN.world - 1] === 'ruptura') guarda(); return _startBoss.apply(this, a); });
  // al perder o ganar, la partida guardada se borra
  GANCHOS.en('gameOver', _gameOver => function () { const jugando = STATE === 'play'; _gameOver(); if (jugando && STATE === 'over') borra(); });
  GANCHOS.en('victory', _victory => function () { const r = _victory.apply(this, arguments); borra(); return r; });
  GANCHOS.en('menuPrincipal', _menu => function () {
    _menu(); const lista = document.querySelector('.menu-lista'); if (!lista) return;
    const pon = (id, icono, titulo, txt, fn, antes) => { const b = document.createElement('button'); b.className = 'opcion'; b.id = id; b.innerHTML = `<img src="${ico(icono, 5)}"><b>${titulo}</b><span>${txt}</span>`; b.onclick = fn; lista.insertBefore(b, antes); };
    const c = PROG.d.partida;
    if (c && c.styles && STYLE_MAP[c.styles[c.world - 1]]) pon('mSigue', 'semilla', 'Continuar', `Mundo ${c.world} de ${WORLDS}: ${(NIVELES[c.styles[c.world - 1]] || STYLE_MAP[c.styles[c.world - 1]]).nombre}`, sigue, lista.firstChild);
  });
  if (STATE === 'title') menuPrincipal();
  return { guarda, sigue };
})();
