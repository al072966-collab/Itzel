'use strict';
// =====================================================================
//  OPCIONES, ESTADÍSTICAS Y CRÉDITOS (se carga al final, después del menú
//  y de las cinemáticas)
//  · Opciones: dificultad, pantalla completa, sacudida de la pantalla,
//    cinemáticas (verlas o saltarlas) y vibración del control. Se guardan
//    en el progreso (PROG.d.opciones). La dificultad está en juego.js (DIFS).
//  · Estadísticas: lo que llevan jugado, sumado de todas las partidas.
//  · Créditos: el autor, los recursos de terceros con su licencia y las
//    tipografías; pasan solos como al final de una película.
//  Se agregan al menú principal; Opciones también a la pausa y Créditos al final.
// =====================================================================
(function () {
  const O = PROG.d.opciones = Object.assign({ dificultad: 'tranquila', musica: 'media', efectos: 'media', sacudida: true, cine: 'ver', vibracion: true, tarjetas: true }, PROG.d.opciones || {});
  // una sola vez: las partidas guardadas pasan a Fácil (10 corazones), para probar; después se respeta lo que se escoja
  if (!O.dif10) { O.dificultad = 'tranquila'; O.dif10 = 1; PROG.save(); }
  // por mientras la música empieza apagada (una sola vez: si el jugador la vuelve a prender, se respeta)
  if (!O.musicaApagada1) { O.musicaApagada1 = 1; PROG.save(); }
  const S = PROG.s; for (const k of ['jugados', 'jefesN']) S[k] = S[k] || {};
  const guarda = () => PROG.save();

  // ---------------------------------------------------------------------
  //  LO QUE SE VA ANOTANDO
  // ---------------------------------------------------------------------
  GANCHOS.en('startLevel', _startLevel => function (...a) {
    if (RUN && RUN.world === 1 && RUN.idx === 0 && !RUN._contada) { RUN._contada = true; S.partidas = (S.partidas || 0) + 1; }
    if (RUN) { const id = curStyle().id; S.jugados[id] = (S.jugados[id] || 0) + 1; }
    guarda(); return _startLevel.apply(this, a);
  });
  GANCHOS.en('levelDone', _levelDone => function (...a) { if (CUR && CUR.isBoss && CUR.boss) { const k = CUR.boss.tipo; S.jefesN[k] = (S.jefesN[k] || 0) + 1; } return _levelDone.apply(this, a); });
  GANCHOS.en('victory', _victory => function (...a) {
    if (RUN) S.mejorTiempo = Math.min(S.mejorTiempo || Infinity, Math.round(RUN.time));
    const r = _victory.apply(this, a);
    // al final de la partida, los créditos
    const otra = $('again'); if (otra) { const b = document.createElement('button'); b.className = 'patch verde'; b.textContent = 'Créditos'; b.onclick = () => pantallaCreditos(() => title()); otra.after(b); }
    return r;
  });
  GANCHOS.en('hurt', _hurt => function (g, d) { const h = RUN ? RUN.hearts : 0; _hurt(g, d); if (RUN && RUN.hearts < h) { S.corazones = (S.corazones || 0) + (h - RUN.hearts); if (typeof MANDO !== 'undefined') MANDO.vibra(); } });
  const _power = MEC.power;
  MEC.power = function (g, c) { if (g === CUR && c && !c.up) S.poderes = (S.poderes || 0) + 1; return _power.apply(this, arguments); };
  let seg = 0;
  setInterval(() => { if (STATE === 'play') { S.tiempo = (S.tiempo || 0) + 1; if (++seg % 10 === 0) guarda(); } }, 1000);

  // ---------------------------------------------------------------------
  //  CINEMÁTICAS: si se pidió saltarlas, las de la historia (la entrada y las
  //  presentaciones de los jefes) solo se anotan para verlas después desde el
  //  menú, y el juego sigue; si la escena iba a armar el nivel, se arma directo
  // ---------------------------------------------------------------------
  if (typeof CINE !== 'undefined') {
    const _play = CINE.play;
    CINE.play = function (id, opc = {}) {
      // el viaje entre mundos no es de la historia: es la transición (y arma el mundo), siempre sale
      if (O.cine === 'saltar' && !opc.repeticion && id !== 'viaje') { CINE.marcar(id); if (opc.construir) opc.construir(); else if (opc.alTerminar) opc.alTerminar({ saltada: true }); return; }
      return _play.call(this, id, opc);
    };
  }

  // ---------------------------------------------------------------------
  //  PANTALLA: OPCIONES
  // ---------------------------------------------------------------------
  const jug = () => O.jugadores === undefined ? (typeof PRESENTACION !== 'undefined' && PRESENTACION.activa() ? 2 : 1) : (O.jugadores === 2 ? 2 : 1);   // sin elegir, la run de presentación viene en dos
  const porcentaje = (v, d = 60) => typeof v === 'number' ? v : ({ alta: 100, media: 60, baja: 28, no: 0 }[v] ?? d);
  const volumen = (id, icono, titulo, desc, defecto = 60) => `<div class="op-fila"><img src="${ico(icono, 5)}" alt=""><div class="op-txt"><b>${titulo}</b><span>${desc}</span></div><label class="op-vol"><input type="range" min="0" max="100" step="1" value="${porcentaje(O[id], defecto)}" data-vol="${id}" aria-label="${titulo}"><output>${porcentaje(O[id], defecto)}%</output></label></div>`;
  function conectarVolumen() { document.querySelectorAll('[data-vol]').forEach(slider => slider.oninput = () => { O[slider.dataset.vol] = Number(slider.value); slider.nextElementSibling.value = slider.value + '%'; guarda(); if (window.AUDIO_ARCHIVOS) window.AUDIO_ARCHIVOS.actualiza(); }); }
  function pantallaSonido(volver = () => pause(true)) {
    showScreen(`<div class="title opciones"><img class="hstitch" alt="Sonido" src="${stitched('Sonido', 8)}"><p class="sub">Ajusta el sonido sin salir de la partida</p><div class="op-lista panel">
      ${volumen('musica', 'musica', 'Música', 'Volumen de las canciones del juego.', 0)}
      ${volumen('efectos', 'sonido', 'Sonidos del juego', 'Saltos, pasos, botones y poderes.')}
      ${volumen('enemigos', 'sonido', 'Enemigos y jefes', 'Golpes, avisos y ataques; se combina con el volumen de sonidos.')}
      ${volumen('ambiente', 'sonido', 'Ambiente', 'Agua y sonidos del entorno.')}
      </div><button class="patch" id="sonidoVolver">Volver</button></div>`);
    conectarVolumen(); $('sonidoVolver').onclick = volver;
  }
  const pantallaCompleta = on => { try { if (on && !document.fullscreenElement) return document.documentElement.requestFullscreen(); if (!on && document.fullscreenElement) return document.exitFullscreen(); } catch (e) {} return Promise.resolve(); };
  function pantallaOpciones(volver = menuPrincipal) {
    if (typeof paraVistas === 'function') paraVistas();
    const D = DIFS[O.dificultad] || DIFS.normal, enPartida = STATE === 'pause';
    const fila = (id, icono, titulo, desc, opciones, valor) => `<div class="op-fila"><img src="${ico(icono, 5)}" alt=""><div class="op-txt"><b>${titulo}</b><span>${desc}</span></div>
      <div class="op-elige">${opciones.map(([v, t]) => `<button class="chip ${valor === v ? 'on' : ''}" data-op="${id}" data-v="${JSON.stringify(v).replace(/"/g, '&quot;')}">${t}</button>`).join('')}</div></div>`;
    const n = typeof MANDO !== 'undefined' ? MANDO.conectados() : [];
    showScreen(`<div class="title opciones"><img class="hstitch" alt="Opciones" src="${stitched('Opciones', 8)}">
      <div class="op-lista panel">
        ${fila('dificultad', 'dificultad', 'Dificultad', D.desc + (enPartida && RUN && RUN.dif !== O.dificultad ? ' <i>Se aplica desde la siguiente partida.</i>' : ''), Object.entries(DIFS).map(([k, d]) => [k, d.nombre]), O.dificultad)}
        ${fila('jugadores', 'control', 'Jugadores', 'Con dos personas, una es Itzel (teclado o primer control) y la otra es Fresita (mouse o segundo control). Al terminar un mundo cada una escoge el camino y, si no coinciden, decide una moneda.' + (enPartida && RUN && RUN.jugadores !== jug() ? ' <i>Se aplica desde la siguiente partida.</i>' : ''), [[1, 'Una persona'], [2, 'Dos personas']], jug())}
        ${volumen('musica', 'musica', 'Música', 'Volumen de las canciones del juego.', 0)}
        ${volumen('efectos', 'sonido', 'Sonidos del juego', 'Saltos, pasos, botones y poderes.')}
        ${volumen('enemigos', 'sonido', 'Enemigos y jefes', 'Golpes, avisos y ataques; se combina con el volumen de sonidos.')}
        ${volumen('ambiente', 'sonido', 'Ambiente', 'Agua y sonidos del entorno.')}
        ${fila('pantalla', 'pantalla', 'Pantalla completa', 'El juego ocupa toda la pantalla (también con F11).', [[true, 'Sí'], [false, 'No']], !!document.fullscreenElement)}
        ${fila('sacudida', 'sacudida', 'Sacudida de la pantalla', 'Los golpes fuertes y los jefes sacuden la vista. Apágala si te marea.', [[true, 'Sí'], [false, 'No']], O.sacudida)}
        ${fila('cine', 'claqueta', 'Cinemáticas de la historia', 'La entrada y las presentaciones de los jefes. Siempre se pueden volver a ver en Menú › Cinemáticas.', [['ver', 'Verlas'], ['saltar', 'Saltarlas']], O.cine)}
        ${fila('tarjetas', 'tarjeta', 'Tarjetas de descubrimiento', 'Sale una tarjetita en la esquina cuando encuentran algo nuevo.', [[true, 'Sí'], [false, 'No']], O.tarjetas)}
        ${fila('vibracion', 'control', 'Vibración del control', 'El control vibra cuando Itzel recibe un golpe.', [[true, 'Sí'], [false, 'No']], O.vibracion)}
      </div>
      <div class="op-control panel"><img src="${ico('control', 6)}"><div>
        <b>${n.length ? (n.length > 1 ? `${n.length} controles conectados` : 'Control conectado') : 'Con control'}</b>
        <p><i>Itzel</i> · <kbd>Stick izq.</kbd> o <kbd>Cruceta</kbd> correr · <kbd>A</kbd> saltar · <kbd>B</kbd> o <kbd>X</kbd> impulso · <kbd>Start</kbd> pausa</p>
        <p><i>Fresita</i> · con el mouse, con el <kbd>Stick der.</kbd> del mismo control (<kbd>RT</kbd> poder, <kbd>LT</kbd> canción de cuna) o con un segundo control (<kbd>Stick izq.</kbd>, <kbd>A</kbd> poder, <kbd>B</kbd> canción)</p>
        <p><i>Menús</i> · <kbd>Cruceta</kbd> moverse · <kbd>A</kbd> escoger · <kbd>B</kbd> regresar</p>
        ${n.length ? '' : '<p class="op-nota">Conecta un control y oprime cualquier botón para que el juego lo reconozca.</p>'}
      </div></div>
      <button class="patch volver-esquina" id="oVolver">Volver</button></div>`);
    document.querySelectorAll('.op-elige .chip').forEach(b => b.onclick = () => {
      const id = b.dataset.op, v = JSON.parse(b.dataset.v);
      if (id === 'pantalla') { Promise.resolve(pantallaCompleta(v)).catch(() => {}).finally(() => setTimeout(() => pantallaOpciones(volver), 120)); return; }
      O[id] = v; guarda(); pantallaOpciones(volver);
    });
    conectarVolumen();
    $('oVolver').onclick = volver;
  }

  // ---------------------------------------------------------------------
  //  PANTALLA: ESTADÍSTICAS
  // ---------------------------------------------------------------------
  const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const horas = s => s < 3600 ? `${Math.floor(s / 60)} min` : `${Math.floor(s / 3600)} h ${String(Math.floor(s / 60) % 60).padStart(2, '0')} min`;
  const veces = n => n === 1 ? 'una vez' : `${n} veces`;
  function pantallaEstadisticas() {
    if (typeof paraVistas === 'function') paraVistas();
    const totDob = typeof ESPECIALES !== 'undefined' ? Object.values(ESPECIALES).reduce((n, v) => n + v.length, 0) : 0;
    const visitados = Object.keys(S.mundos).filter(m => MUNDOS.includes(m)).length;
    const jefeN = k => S.jefesN[k] || (S.jefes[k] ? 1 : 0), jefesTot = Object.keys(JEFES).reduce((n, k) => n + jefeN(k), 0);
    const tiles = [
      ['partida', 'Partidas', S.partidas || 0], ['trofeo', 'Ganadas', S.victorias || 0], ['reloj', 'Tiempo jugando', horas(S.tiempo || 0)], ['cronometro', 'Mejor tiempo', S.mejorTiempo ? mmss(S.mejorTiempo) : '—'],
      ['globo', 'Mundos visitados', `${visitados} de ${MUNDOS.length}`], ['corona', 'Jefes vencidos', jefesTot], ['pisoton', 'Enemigos pisoteados', S.stomps || 0], ['dormido', 'Enemigos dormidos', S.naps || 0], ['subjefe', 'Subjefes vencidos', S.subjefesVencidos || 0], ['burbujaCura', 'Burbujas de curación', S.burbujas || 0],
      ['canistel', 'Canisteles', S.coins || 0], ['semilla', 'Semillas de Fresita', S.semillas || 0], ['doblon', 'Doblones de Lorencillo', `${S.doblones || 0} de ${totDob}`], ['corazonRoto', 'Corazones perdidos', S.corazones || 0], ['poderFresita', 'Poderes de Fresita', S.poderes || 0],
    ];
    const top = Object.entries(S.jugados).filter(([id]) => STYLE_MAP[id]).sort((a, b) => b[1] - a[1]).slice(0, 5);
    showScreen(`<div class="title estadisticas"><img class="hstitch" alt="Estadísticas" src="${stitched('Estadísticas', 7)}">
      <p class="sub">Todo lo que llevan jugado en este navegador</p>
      <div class="est-grid">${tiles.map(([i, t, v]) => `<div class="est"><img src="${ico(i, 4)}" alt=""><b>${v}</b><span>${t}</span></div>`).join('')}</div>
      <div class="est-dos">
        <div class="panel est-lista"><h4>Jefes</h4>${Object.keys(JEFES).map(k => { const n = jefeN(k); return `<p class="${n ? 'ok' : ''}"><b>${JEFES[k].nombre}</b><span>${n ? 'vencido ' + veces(n) : 'sin vencer'}</span></p>`; }).join('')}</div>
        <div class="panel est-lista"><h4>Mundos más jugados</h4>${top.length ? top.map(([id, n]) => `<p class="ok"><b>${STYLE_MAP[id].name}</b><span>${veces(n)}</span></p>`).join('') : '<p><span>Todavía no juegan ningún mundo.</span></p>'}
          <h4>Y además</h4><p class="ok"><b>Logros</b><span>${Object.keys(PROG.d.logros).length} de ${LOGROS.length}</span></p><p class="ok"><b>Enciclopedia</b><span>${ENCI.cuantos()} cosas descubiertas</span></p><p class="ok"><b>Partidas perdidas</b><span>${S.derrotas || 0}</span></p></div>
      </div>
      <button class="patch volver-esquina" id="eVolver">Volver</button></div>`);
    $('eVolver').onclick = menuPrincipal;
  }

  // ---------------------------------------------------------------------
  //  PANTALLA: CRÉDITOS (pasan solos; con el mouse encima se detienen)
  // ---------------------------------------------------------------------
  const VAPOR = [
    ['Steampunk Inspired Tiles', 'AR (Anton Revin)', 'CC0'],
    ['Steampunk Level Tileset Mega Pack', 'KnoblePersona', 'CC-BY 3.0'],
    ['Steampunk Turrets', 'mauriku', 'CC-BY 3.0'],
    ['Cog Sheet y Cog Sheet 2', 'Bluce', 'CC-BY-SA 3.0'],
    ['Robot Sprite BrawlBot', 'wuhu', 'CC0'],
    ['Mechanical Spider', 'Umplix', 'CC0'],
    ['Drone 48x48px', 'NettySvit', 'CC0'],
    ['Steam monster', 'Blarumyrran', 'CC0'],
    ['Animated Coins', 'Clint Bellanger', 'CC-BY 3.0'],
    ['Bevouliin Free Game Obstacle Spikes', 'bevouliin.com', 'CC0'],
    ['Industrial Parallax Background', 'Luis Zuno (ansimuz)', 'CC0'],
    ['2D Explosion Animations Frame by Frame', 'Sinestesia', 'CC0'],
  ];
  function pantallaCreditos(volver = menuPrincipal) {
    if (typeof paraVistas === 'function') paraVistas();
    showScreen(`<div class="creditos"><div class="cr-marco"><div class="cr-rollo">
      <img class="cr-logo" alt="Itzel" src="${stitched('Itzel', 12)}">
      <p class="cr-chico">Un juego de</p><h2>David Cervantes Malfavon</h2>
      <p>Proyecto final · 7.º semestre de ITS<br>Universidad Autónoma de Campeche</p>
      <img class="cr-flor" src="${ico('flor', 4)}">
      <h3>Idea, diseño y dirección de arte</h3><p>David Cervantes Malfavon</p>
      <h3>Programación</h3><p>David Cervantes Malfavon<br><small>con ayuda de Claude (Anthropic)</small></p>
      <h3>Arte de referencia y la Ruptura de la pirámide</h3><p>David Cervantes Malfavon</p>
      <h3>Personajes</h3><p>Itzel · Fresita, la ajolote rosa<br>los ajolotes azul, naranja y violeta</p>
      <img class="cr-flor" src="${ico('flor', 4)}">
      <h3>Tipografías</h3><p>Alegreya y Alegreya Sans<br><small>Huerta Tipográfica (Juan Pablo del Peral) · SIL Open Font License</small></p>
      <h3>Fotografía de «Calakmul en miniatura»</h3><p>Calakmul, de xiquinhosilva (Wikimedia Commons), CC BY 4.0. Recortada y adaptada como fondo y texturas.</p>
      <h3>El mundo «Vapor y engranajes»</h3><p><small>Recursos de OpenGameArt.org, adaptados para el juego (recortes, recoloreado a latón y cobre, animaciones reconstruidas)</small></p>
      <ul>${VAPOR.map(([pack, autor, lic]) => `<li><b>${pack}</b><span>${autor} · ${lic}</span></li>`).join('')}</ul>
      <p><small>CC-BY: se menciona al autor. CC-BY-SA: las imágenes derivadas de los engranajes se comparten bajo la misma licencia. CC0: dominio público; el crédito es por cortesía.</small></p>
      <img class="cr-flor" src="${ico('flor', 4)}">
      <h3>Imágenes reales de la enciclopedia</h3><p>De Wikimedia Commons, con licencias libres y reducidas de tamaño.<br>El autor, la licencia y el enlace de cada una están al pie de la imagen, dentro del libro.</p>
      <h3>Inspirado en</h3><p>Campeche: su muralla y sus baluartes, el malecón, Lorencillo y los piratas,<br>Calakmul, el Mayab, Chaac, Kukulkán, el Popol Vuh, la abeja melipona<br>y las fiestas de su gente.</p>
      <h2 class="cr-fin">¡Gracias por jugar!</h2>
    </div></div><button class="patch volver-esquina" id="crVolver">Volver</button></div>`);
    $('crVolver').onclick = volver;
  }

  // ---------------------------------------------------------------------
  //  EN EL MENÚ PRINCIPAL Y EN LA PAUSA
  // ---------------------------------------------------------------------
  GANCHOS.en('menuPrincipal', _menu => function () {
    _menu();
    const lista = document.querySelector('.menu-lista'); if (!lista) return;
    const opc = (id, icono, titulo, txt, fn) => { const b = document.createElement('button'); b.className = 'opcion'; b.id = id; b.innerHTML = `<img src="${ico(icono, 5)}"><b>${titulo}</b><span>${txt}</span>`; b.onclick = fn; lista.appendChild(b); };
    opc('mEst', 'barras', 'Estadísticas', S.partidas ? `${S.partidas} partidas, ${S.victorias || 0} ganadas` : 'Lo que llevan jugado', pantallaEstadisticas);
    opc('mOpc', 'engrane', 'Opciones', `Dificultad: ${(DIFS[O.dificultad] || DIFS.normal).nombre} · ${jug() === 2 ? 'Dos jugadores' : 'Un jugador'}`, () => pantallaOpciones());
    opc('mMulti', 'control', 'Multijugador', 'Dos personas: una es Itzel y la otra Fresita', () => { MULTI.forzar = 2; pantallaControles(); });
    opc('mCred', 'flor', 'Créditos', 'Quién hizo Itzel', () => pantallaCreditos());
    const jugar = document.getElementById('mJugar'); if (jugar) jugar.onclick = () => { MULTI.forzar = 0; pantallaControles(); };   // «Jugar» sigue lo que diga Opciones
    for (const id of ['mJugar', 'mMulti', 'mEnci', 'mLogros', 'mCine', 'mEst', 'mOpc', 'mCred']) {
      const boton = document.getElementById(id); if (boton) lista.appendChild(boton);
    }
  });
  GANCHOS.en('pause', _pause => function (on) {
    _pause(on);
    if (on && $('quit')) { const sonido = document.createElement('button'); sonido.className = 'patch pausa-sonido'; sonido.id = 'pausaSonido'; sonido.textContent = 'Sonido'; sonido.onclick = () => pantallaSonido(); $('quit').before(sonido); }
  });
  // en la pantalla de controles, si hay un control conectado, también sale cómo se juega con él
  const _controles = pantallaControles;
  pantallaControles = function () {
    _controles();
    const caja = document.querySelector('.ctrl2'); if (!caja || typeof MANDO === 'undefined') return;
    if (MANDO.conectados().length) {
      const d = document.createElement('div'); d.className = 'panel';
      d.innerHTML = `<img src="${ico('control', 6)}"><b>Con control</b><p><kbd>Stick izq.</kbd> o <kbd>Cruceta</kbd> correr · <kbd>A</kbd> saltar · <kbd>B</kbd> impulso</p><p>Fresita: <kbd>Stick der.</kbd> la mueve, <kbd>RT</kbd> poder, <kbd>LT</kbd> canción (o un segundo control)</p><p><kbd>Start</kbd> pausa</p>`;
      caja.appendChild(d);
    } else { const h = document.querySelector('.controles .hint'); if (h) h.insertAdjacentHTML('beforeend', ' También se puede jugar con control: conéctalo y oprime cualquier botón.'); }
  };
  window.OPCIONES = { pantallaOpciones, pantallaSonido, pantallaEstadisticas, pantallaCreditos };
  if (STATE === 'title') menuPrincipal();
})();
