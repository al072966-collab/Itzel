'use strict';
// =====================================================================
//  RITMO DE CADA MUNDO: el tempo de los enemigos (y su cadencia de ataque).
//  Se envuelve MEC.stepFoes y se le da al paso un multiplicador por mundo; no se
//  toca el motor. Sirve para que un nivel de neón o de 8 bits se sienta nervioso y
//  uno de tinta o de niebla se sienta calmado.
//  Reglas de seguridad: los mundos «rápidos» suben como mucho 20 % y los «calmados»
//  solo bajan (más fáciles). Solo aplica a los mundos de plataformas del run, no a
//  los modos propios.
// =====================================================================
(function () {
  if (typeof MEC === 'undefined' || typeof NIVELES === 'undefined' || typeof MEC.stepFoes !== 'function') return;
  const TEMPO = {
    neon: 1.2, cyber: 1.15, bits8: 1.15, deco: 1.1, flat: 1.1, anime: 1.1,   // nerviosos
    bruma: .85, sumie: .85, biolum: .9, acuarela: .9, hollin: .9, nouveau: .9, cielo: .9,  // calmados
  };
  const antes = MEC.stepFoes;
  MEC.stepFoes = function (g, dt, prevY) {
    const d = g && g.def, k = d && !d.modo && TEMPO[d.id];
    return antes.call(this, g, k ? dt * k : dt, prevY);
  };
  window.RITMO_MUNDOS = TEMPO;
})();
