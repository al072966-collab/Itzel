'use strict';
// =====================================================================
//  PUENTE CON GDEVELOP («Itzel final»)
//  El menú de inicio está hecho en GDevelop (proyecto Itzel-final.json); el resto del juego es este HTML.
//  GDevelop abre el juego en un iframe con  ?gd=1&accion=…  y este archivo:
//   · no deja ver el menú HTML (el de GDevelop es el que se ve);
//   · hace lo que pidió el botón de GDevelop: jugar, continuar, enciclopedia, logros, cine, estadisticas, opciones,
//     creditos; o «datos» (solo manda los textos del menú y no muestra nada);
//   · cuando el juego vuelve a su menú (Volver, Salir de la partida…), avisa a GDevelop con postMessage para que
//     regrese a su escena «Menu».
//  Mensajes al padre:  { itzelGD: 'datos', datos }  y  { itzelGD: 'menu', datos }.
//  Sin ?gd=1 (el juego solo en el navegador) este archivo no hace nada.
// =====================================================================
(() => {
  const q = new URLSearchParams(location.search);
  if (!q.has('gd')) return;
  window.enGD = true;
  const accion = q.get('accion') || 'jugar';
  const css = document.createElement('style');
  css.textContent = 'body.gd-oculto #screen { visibility:hidden; }';
  document.head.appendChild(css); document.body.classList.add('gd-oculto');

  const IDS = { jugar: 'mJugar', continuar: 'mSigue', enciclopedia: 'mEnci', logros: 'mLogros', cine: 'mCine', estadisticas: 'mEst', opciones: 'mOpc', creditos: 'mCred' };
  // lo que dice cada botón del menú (título y texto de abajo), tal como lo arma el juego
  function datos() {
    const out = {};
    for (const [k, id] of Object.entries(IDS)) {
      const b = document.getElementById(id); if (!b) { out[k] = null; continue; }
      out[k] = { titulo: (b.querySelector('b') || {}).textContent || '', texto: (b.querySelector('span') || {}).textContent || '' };
    }
    out.opciones = opcionesFrescas();
    return out;
  }
  // las opciones se leen del almacenamiento (no de la memoria): así se ve lo último que se guardó desde cualquier ventana
  function opcionesFrescas() {
    try { const d = JSON.parse(localStorage.getItem('itzel-progreso') || '{}'); return Object.assign({}, d.opciones || {}); } catch (e) { return {}; }
  }
  // GDevelop pide cambiar una opción: se escribe directo en el almacenamiento (sin tocar la memoria ni guardar todo el progreso de esta ventana)
  addEventListener('message', e => {
    const m = e.data; if (!m || m.itzelGD !== 'opcion') return;
    try { const d = JSON.parse(localStorage.getItem('itzel-progreso') || '{}'); d.opciones = Object.assign(d.opciones || {}, { [m.k]: m.v }); localStorage.setItem('itzel-progreso', JSON.stringify(d)); } catch (er) {}
    avisa('datos', datos());
  });
  const avisa = (tipo, d) => { try { parent.postMessage({ itzelGD: tipo, datos: d }, '*'); } catch (e) {} };
  let primera = true;
  GANCHOS.en('menuPrincipal', _menu => function () {
    _menu.apply(this, arguments);
    const d = datos();
    if (primera) {
      primera = false;
      avisa('datos', d);
      if (accion === 'datos') return;
      document.body.classList.remove('gd-oculto');
      if (accion === 'empezar') { PIDE = null; empezar(); return; }          // «¡A jugar!» de la pantalla de Controles de GDevelop
      const b = document.getElementById(IDS[accion] || 'mJugar') || document.getElementById('mJugar');
      if (b) b.click();
      return;
    }
    // el juego volvió a su menú: se regresa al de GDevelop
    document.body.classList.add('gd-oculto');
    avisa('menu', d);
  });
  // la enciclopedia se cierra encima del menú: si ahí quedó el menú (y no se arrancó un nivel), se regresa al de GDevelop
  GANCHOS.en('cerrarEnci', _cierra => function () {
    const r = _cierra.apply(this, arguments);
    setTimeout(() => { if (!primera && typeof STATE !== 'undefined' && STATE === 'title') { document.body.classList.add('gd-oculto'); avisa('menu', datos()); } }, 0);
    return r;
  });
  if (typeof STATE !== 'undefined' && STATE === 'title') menuPrincipal();
})();
