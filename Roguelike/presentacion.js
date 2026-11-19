'use strict';
// =====================================================================
//  RUN DE PRESENTACIÓN
//  Una partida fija para cuando juegan los jueces: los mismos cuatro mundos, en el mismo orden, con los mismos niveles y jefes.
//  Se enciende con ?presentacion=1 en la dirección (queda guardado en este navegador) y se apaga con ?presentacion=0.
//  Para cambiar un mundo solo se edita PLAN: estilo = el mundo, nivel = el id del nivel, jefe = el jefe que sale al terminarlo.
// =====================================================================
const PRESENTACION = (() => {
  const PLAN = [
    { estilo: 'anime',   nivel: 'anime',   jefe: 'pirata' },                         // 1 · cielo anime, el malecón, con su jefe
    { estilo: 'cuaderno', nivel: 'planos' },                                          // 2 · planta y alzado de la muralla
    { estilo: 'bits64',  nivel: 'bits64' },                                           // 3 · pixel art 64 bits, la selva de Calakmul
    { estilo: 'bruma',   jefe: 'ruptura', forma: 'huracan' },                         // 4 · el huracán (la Ruptura toma esa forma)
  ];
  const q = new URLSearchParams(location.search).get('presentacion');
  try { if (q === '1') localStorage.setItem('itzel-presentacion', '1'); else if (q === '0') localStorage.removeItem('itzel-presentacion'); } catch (e) {}
  const activa = () => { if (q === '0') return false; if (q === '1') return true; try { return localStorage.getItem('itzel-presentacion') === '1'; } catch (e) { return false; } };
  return { PLAN, activa, mundo: w => (activa() ? PLAN[w - 1] : null) };
})();
