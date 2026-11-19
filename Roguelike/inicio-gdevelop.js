'use strict';
// Cuando el juego se abre desde el menú de GDevelop (escena «Menu» de Itzel-v3.json) llega con ?jugar=1:
// el jugador ya pulsó «Jugar» allá (y tiene «Cómo se juega» en ese menú), así que no se repite el menú
// del juego: se pulsan «Jugar» y «¡A jugar!» (los botones mJugar y cJugar de menu.js) y arranca la partida.
(function () {
  // la enciclopedia (la página suelta) manda a un mundo concreto con ?mundo=…&nivel=…&jefe=…: se entra directo a ese
  // nivel o jefe, igual que desde la enciclopedia dentro del juego (una visita individual, que al terminar regresa al libro)
  const q = new URLSearchParams(location.search);
  // la pantalla negra de carga (en index.html) se quita cuando ya arrancó el nivel, para que no se vea el menú de inicio
  const quitaCarga = () => setTimeout(() => document.documentElement.classList.remove('directo'), 600);
  if (q.get('mundo') && !q.has('fotos') && !q.has('propuesta') && !q.has('jugar')) {
    addEventListener('load', () => setTimeout(function entra(n = 0) {
      if (typeof jugarDesdeEnci === 'function' && typeof title === 'function' && document.getElementById('mJugar')) { jugarDesdeEnci(q.get('mundo'), q.get('nivel'), q.get('jefe'), q.get('forma'), q.get('lado')); quitaCarga(); }
      else if (n < 80) setTimeout(() => entra(n + 1), 150);
      else quitaCarga();   // si algo falla, no se queda la pantalla negra para siempre
    }, 400));
    return;
  }
  if (!/[?&]jugar=1(&|$)/.test(location.search)) return;
  const pulsa = (id, siguiente, n = 0) => {
    const b = document.getElementById(id);
    if (b && b.offsetParent !== null) { b.click(); if (siguiente) setTimeout(() => pulsa(siguiente), 250); }
    else if (n < 80) setTimeout(() => pulsa(id, siguiente, n + 1), 150);
  };
  addEventListener('load', () => setTimeout(() => pulsa('mJugar', 'cJugar'), 400));
})();
