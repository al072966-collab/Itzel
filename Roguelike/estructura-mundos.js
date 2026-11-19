'use strict';
// =====================================================================
//  ESTRUCTURA DE CADA MUNDO (piloto en tres mundos): el largo y el tipo de tramos
//  con que se arma el nivel de cada partida. Usa las dos palancas que ya tiene
//  PIEZAS (niveles por piezas): el largo que busca (def.W) y las reglas del
//  mundo (sinCadenas, sinRelieve); no se toca el motor ni los niveles a mano.
//    · ocaso  · carrera con la brisa: más largo y sin colinas ni zanjas (pista abierta
//               donde las ráfagas empujan)
//    · hielo  · tramos largos y resbalosos: más largo y sin cadenas de saltos
//    · neon   · tramos cortos al compás: un nivel más corto y denso
//  Seguridad: el largo cambiado solo vale mientras se arma por piezas; si el nivel cae
//  al diseño a mano (fijo=1, pocas piezas) se usa su largo original.
// =====================================================================
(function () {
  if (typeof PIEZAS === 'undefined' || typeof NIVELES === 'undefined') return;
  const ESTRUCTURA = {
    ocaso: { largo: 1.3, reglas: { sinRelieve: true } },
    hielo: { largo: 1.15, reglas: { sinCadenas: true } },
    neon:  { largo: .75 },
  };
  for (const id of Object.keys(ESTRUCTURA)) {
    const r = ESTRUCTURA[id].reglas; if (r) PIEZAS.REGLAS[id] = Object.assign(PIEZAS.REGLAS[id] || {}, r);
  }
  const antes = PIEZAS.nivel;
  PIEZAS.nivel = function (def) {
    const e = def && ESTRUCTURA[def.id];
    if (!e || !e.largo || !def.build || def.modo || def.escenarioUayamon) return antes.apply(this, arguments);
    const fijo = typeof pedido === 'function' && (pedido('fijo') || new URLSearchParams(location.search).get('fijo'));
    let C = null; try { C = PIEZAS.corta(def); } catch (x) { /* sin corte, no se cambia el largo */ }
    if (fijo || !C || C.todas < 2 || (PIEZAS.REGLAS[def.id] || {}).fijo) return antes.apply(this, arguments);
    const W0 = def.W; def.W = Math.round(W0 * e.largo);
    try { return antes.apply(this, arguments); } finally { def.W = W0; }
  };
  window.ESTRUCTURA_MUNDOS = ESTRUCTURA;
})();
