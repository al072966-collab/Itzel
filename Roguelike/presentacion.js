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
  const explicita = () => { if (q === '0') return false; if (q === '1') return true; try { return localStorage.getItem('itzel-presentacion') === '1'; } catch (e) { return false; } };
  // En la versión publicada, la PRIMERA partida de cada persona es esta misma run (la que se probó: empieza en el mundo anime); desde la
  // segunda, los mundos vuelven a salir al azar. Se marca al empezar esa primera partida. (?presentacion=0 la apaga; =1 la deja fija siempre.)
  const primera = () => { if (q === '0' || !window.MODO_PUBLICO) return false; try { return !localStorage.getItem('itzel-primera-run'); } catch (e) { return false; } };
  const activa = () => explicita() || primera();
  const marcaPrimera = () => { try { if (primera()) localStorage.setItem('itzel-primera-run', '1'); } catch (e) {} };
  const enCurso = () => !!((typeof RUN !== 'undefined' && RUN && RUN.presentacion) || activa());
  return { PLAN, activa, enCurso, explicita, marcaPrimera, mundo: w => ((typeof RUN !== 'undefined' && RUN && RUN.presentacion) || activa() ? PLAN[w - 1] : null) };
})();
