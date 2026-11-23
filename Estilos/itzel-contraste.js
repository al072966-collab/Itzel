'use strict';
// =====================================================================
//  ITZEL QUE NO SE PIERDA EN EL FONDO
//  En los mundos de papel claro y tinta (sumi-e) la Itzel de trazos suaves se confundía con el fondo y parecía
//  transparente. Aquí se le pone un contorno de tinta oscuro (una sombra sin desenfoque fuerte) alrededor de la silueta;
//  el dibujo de Itzel es el mismo, solo se distingue mejor. Se vuelve a poner cada vez que otro archivo cambia su dibujo.
// =====================================================================
(function () {
  if (typeof STYLE_MAP === 'undefined' || typeof GANCHOS === 'undefined') return;
  const IDS = { sumie: .8, acuarela: .5, bruma: .5, paper: .45 };    // id → fuerza del contorno
  function envuelve(id) {
    const st = STYLE_MAP[id]; if (!st || !st.player || st.player._contraste) return;
    const antes = st.player, k = IDS[id];
    const nuevo = function (c, p, f) {
      c.save();
      c.shadowColor = 'rgba(28,16,10,' + (.85 * k + .2).toFixed(2) + ')'; c.shadowBlur = Math.max(1, (f && f.S || 3) * k * .55); c.shadowOffsetX = 0; c.shadowOffsetY = 0;
      try { return antes.call(this, c, p, f); } finally { c.restore(); }
    };
    nuevo._contraste = true; st.player = nuevo;
  }
  const todos = () => Object.keys(IDS).forEach(envuelve);
  todos();
  GANCHOS.en('aplicaElegido', previo => function (id, k = 0) { const r = previo(id, k); todos(); return r; });
})();
