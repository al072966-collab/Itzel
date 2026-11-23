'use strict';
// =====================================================================
//  LA ENCICLOPEDIA, YA CARGADA
//  Al abrir la enciclopedia por primera vez tardaba en pintar las miniaturas (y se veían «recargar» las texturas). Aquí se abre
//  escondida mientras pasan los logos y la cinemática de apertura; cuando el jugador la abre, ya está lista (abrirEnci la reutiliza).
//  En teléfonos no se hace (pesa y compite con el juego).
// =====================================================================
(function () {
  if (matchMedia('(pointer: coarse)').matches) return;
  const q = new URLSearchParams(location.search);
  if (['mudo', 'fijo', 'fotos', 'jefe', 'nivel', 'mundo', 'jugar', 'gd'].some(k => q.has(k))) return;
  const css = document.createElement('style');
  css.textContent = '#enci.precarga{display:block!important;visibility:hidden;pointer-events:none;z-index:-1}';
  document.head.appendChild(css);
  function precarga() {
    const box = document.getElementById('enci'); if (!box || box.querySelector('iframe')) return;
    const fr = document.createElement('iframe'); fr.title = 'Enciclopedia'; fr.tabIndex = -1; fr.setAttribute('aria-hidden', 'true');
    fr.src = '../Estilos/index.html?v=jefes-local-2';           // la misma dirección que usa abrirEnci: así se reutiliza
    box.classList.add('precarga'); box.prepend(fr);
    // se queda «escondida pero viva» hasta que el jugador la abre (abrirEnci quita la marca)
  }
  addEventListener('load', () => setTimeout(precarga, 1500));
})();
