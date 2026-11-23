'use strict';
// =====================================================================
//  LA ENCICLOPEDIA, YA CARGADA
//  Al abrir la enciclopedia por primera vez tardaba en pintar las miniaturas (y se veían «recargar» las texturas). Aquí se abre
//  escondida mientras pasan los logos y la cinemática de apertura; cuando el jugador la abre, ya está lista (abrirEnci la reutiliza).
//  En teléfonos se prepara durante la apertura; el libro oculto detiene sus animaciones para no competir con la partida.
// =====================================================================
(function () {
  const telefono = matchMedia('(pointer: coarse)').matches;
  const q = new URLSearchParams(location.search);
  if (['mudo', 'fijo', 'fotos', 'jefe', 'nivel', 'mundo', 'jugar', 'gd'].some(k => q.has(k))) return;
  const css = document.createElement('style');
  css.textContent = '#enci.precarga{display:block!important;visibility:hidden;pointer-events:none;z-index:-1}';
  document.head.appendChild(css);
  function precarga() {
    const box = document.getElementById('enci'); if (!box || box.querySelector('iframe') || (telefono && !window.enApertura)) return;
    const fr = document.createElement('iframe'); fr.title = 'Enciclopedia'; fr.tabIndex = -1; fr.setAttribute('aria-hidden', 'true');
    fr.src = '../Estilos/index.html?v=jefes-local-2';           // la misma dirección que usa abrirEnci: así se reutiliza
    box.classList.add('precarga'); box.prepend(fr);
    // se queda «escondida pero viva» hasta que el jugador la abre (abrirEnci quita la marca)
  }
  const inicia = () => setTimeout(() => {
    if (telefono && 'requestIdleCallback' in window) requestIdleCallback(precarga, { timeout: 1800 });
    else precarga();
  }, 1100);
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', inicia, { once: true });
  else inicia();
})();
