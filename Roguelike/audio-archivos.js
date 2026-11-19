'use strict';
// Música y sonidos suministrados para Itzel.
window.AUDIO_ARCHIVOS = (() => {
  const mudo = new URLSearchParams(location.search).has('mudo');
  // Cada mundo y todas sus variantes comparten una pista estable.
  const archivoNivel = i => i ? `lvl${i + 1}.mp3` : 'lvl.mp3';
  const hashNivel = id => { let h = 2166136261; for (const letra of id) h = Math.imul(h ^ letra.charCodeAt(0), 16777619); return h >>> 0; };
  const mundosMusicales = MUNDOS.filter(id => NIVELES[id]);
  const mezclados = [...mundosMusicales].sort((a, b) => hashNivel(a) - hashNivel(b) || a.localeCompare(b));
  const musicaPorMundo = new Map(mezclados.map((id, i) => [id, archivoNivel(i % 32)]));
  musicaPorMundo.set('biolum', 'cueva.mp3');
  const cancionesNivel = mundosMusicales.map(id => ({ archivo: musicaPorMundo.get(id), nombre: NIVELES[id].nombre, categoria: 'Niveles' }));
  const canciones = [
    ...cancionesNivel,
    { archivo:'campechanita habanera.mp3', nombre:'La Campechanita', categoria:'Niveles' },
    ...[['bossfight.mp3','Combate contra jefe 1'],['boss fight2.mp3','Combate contra jefe 2'],['boss fight3.mp3','Combate contra jefe 3'],['boss fight 4.mp3','Combate contra jefe 4'],['la ruptura.mp3','La Ruptura']].map(([archivo,nombre]) => ({archivo,nombre,categoria:'Jefes'})),
    ...[['menu theme.mp3','Tema del menú'],['bullicio.mp3','Bullicio'],['cenote.mp3','Cenote'],['cueva.mp3','Cueva'],['cinematica 1 se abre la grieta.mp3','Se abre la grieta'],['win.mp3','Victoria'],['loss.mp3','Derrota'],['loss by boss.mp3','Derrota ante un jefe']].map(([archivo,nombre]) => ({archivo,nombre,categoria:'Historia y ambiente'}))
  ];
  const url = nombre => 'assets/audio/' + nombre.split('/').map(encodeURIComponent).join('/');
  const musica = new Audio(); musica.loop = true; musica.preload = 'none';
  const muestra = new Audio(); muestra.preload = 'none';
  let actual = '', manual = false, iniciado = false, pasoAnterior = 0, enAgua = false;
  const valor = (v, defecto = .6) => typeof v === 'number' ? Math.max(0, Math.min(1, v / 100)) : ({alta:1, media:.6, baja:.28, no:0}[v] ?? defecto);
  const opciones = () => PROG.d.opciones || {};
  function actualiza() { musica.volume = valor(opciones().musica, 0) * (STATE === 'pause' ? .35 : 1); muestra.volume = valor(opciones().musica, 0); for (const item of sonidosCine) item.audio.volume = volumenCine(item.categoria); }
  function reproducir(a) { if (!mudo && iniciado && a.paused) a.play().catch(() => {}); }
  function efecto(nombre, categoria = 'efectos') {
    if (mudo || !iniciado) return;
    const a = new Audio(url(nombre)); a.volume = valor(opciones().efectos) * (categoria === 'ambiente' ? valor(opciones().ambiente) : 1); a.play().catch(() => {});
  }
  const sonidosCine = new Set(); let bullicioCine = null, cinePausado = false;
  const volumenCine = categoria => valor(opciones().efectos) * (categoria === 'ambiente' ? valor(opciones().ambiente) : 1);
  function sonidoCine(nombre, categoria = 'efectos') {
    if (mudo || !iniciado) return null;
    const audio = new Audio(url(nombre)), item = { audio, categoria }; audio.volume = volumenCine(categoria); sonidosCine.add(item);
    audio.addEventListener('ended', () => { sonidosCine.delete(item); if (bullicioCine === item) bullicioCine = null; }, { once: true });
    if (!cinePausado && !document.hidden) audio.play().catch(() => { sonidosCine.delete(item); });
    return item;
  }
  function detenerCine(item) { if (!item) return; item.audio.pause(); sonidosCine.delete(item); if (bullicioCine === item) bullicioCine = null; }
  function detenerTodosCine() { for (const item of [...sonidosCine]) detenerCine(item); cinePausado = false; }
  addEventListener('cine-cue', e => {
    const d = e.detail; if (!d || d.cine !== 'entrada') return;
    if (d.nombre === 'Parque Principal: palomas y campanas de la catedral') { detenerCine(bullicioCine); bullicioCine = sonidoCine('bullicio.mp3', 'ambiente'); }
    else if (d.nombre === 'fin del bullicio') detenerCine(bullicioCine);
    else if (d.nombre === 'la grieta se abre') sonidoCine('cinematica 1 se abre la grieta.mp3');
    else if (d.tipo === 'golpe' && d.nombre.startsWith('brinco')) sonidoCine(variantes.salto[Math.floor(Math.random() * variantes.salto.length)]);
  });
  addEventListener('cine-fin', e => { if (e.detail && e.detail.cine === 'entrada') detenerTodosCine(); });
  addEventListener('cine-pausa', e => { if (!e.detail || e.detail.cine !== 'entrada') return; cinePausado = e.detail.pausada; for (const item of sonidosCine) { if (cinePausado) item.audio.pause(); else if (!document.hidden) item.audio.play().catch(() => {}); } });
  const variantes = { salto: Array.from({length: 3}, (_, i) => `variantes/salto-${String(i + 1).padStart(2, '0')}.mp3`), paso: ['pasto', 'suelo'].flatMap(tipo => Array.from({length: 12}, (_, i) => `variantes/paso-${tipo}-${String(i + 1).padStart(2, '0')}.mp3`)) };
  const ultimaVariante = {};
  function variante(tipo) { const lista = variantes[tipo]; if (!lista || !lista.length) return; let i = Math.floor(Math.random() * lista.length); if (lista.length > 1 && i === ultimaVariante[tipo]) i = (i + 1 + Math.floor(Math.random() * (lista.length - 1))) % lista.length; ultimaVariante[tipo] = i; efecto(lista[i]); }
  function pista() {
    if (STATE === 'title') return 'menu theme.mp3';
    if (STATE === 'over') return CUR && CUR.isBoss ? 'loss by boss.mp3' : 'loss.mp3';
    if (STATE === 'win') return 'win.mp3';
    if (STATE !== 'play' && STATE !== 'pause') return '';
    if (!CUR) return '';
    if (CUR.def && CUR.def.id === 'campechanidad') return 'campechanita habanera.mp3';
    if (CUR.isBoss) {
      const tipo = CUR.boss && CUR.boss.tipo;
      if (tipo === 'ruptura') return 'la ruptura.mp3';
      const temas = ['bossfight.mp3', 'boss fight2.mp3', 'boss fight3.mp3', 'boss fight 4.mp3'];
      const indice = typeof JEFES !== 'undefined' ? Object.keys(JEFES).indexOf(tipo) : -1;
      return temas[Math.max(0, indice) % temas.length];
    }
    return musicaPorMundo.get(curStyle().id) || archivoNivel(0);
  }
  function tic() {
    if (manual && STATE !== 'title') detenerReproductor();
    if (bullicioCine && (typeof CINE === 'undefined' || !CINE.activo() || CINE.t >= 6 + CAMPECHE_TOMAS.DUR)) detenerCine(bullicioCine);
    actualiza();
    if (manual || document.hidden) { musica.pause(); return; }
    const nombre = pista();
    if (nombre !== actual) { musica.pause(); actual = nombre; if (nombre) { musica.src = url(nombre); musica.loop = STATE !== 'over' && STATE !== 'win'; } }
    const ritmo = nombre === 'campechanita habanera.mp3' && CUR && CUR.def && CUR.def.id === 'campechanidad';
    if (ritmo && STATE === 'pause') musica.pause();
    else if (nombre && !musica.ended) {
      reproducir(musica);
    }
    else if (!nombre && !musica.paused) musica.pause();
    if (STATE === 'play' && CUR && CUR.p && CUR.p.on && !CUR.p.dash && Math.abs(CUR.p.vx || 0) > 45 && performance.now() - pasoAnterior > 400) {
      pasoAnterior = performance.now(); variante('paso');
    }
    const agua = STATE === 'play' && CUR && CUR.p && MEC.env(CUR).swim;
    if (agua && !enAgua) efecto('pisas agua.mp3', 'ambiente');
    enAgua = !!agua;
  }
  document.addEventListener('click', e => { if (e.target.closest && e.target.closest('button')) efecto('ui.mp3'); }, true);
  addEventListener('pointerdown', () => { iniciado = true; tic(); }, true);
  addEventListener('keydown', () => { iniciado = true; tic(); }, true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { musica.pause(); muestra.pause(); for (const item of sonidosCine) item.audio.pause(); } else { if (!cinePausado && typeof CINE !== 'undefined' && CINE.activo()) for (const item of sonidosCine) item.audio.play().catch(() => {}); tic(); } });
  setInterval(tic, 150);
  function detenerReproductor() { manual = false; muestra.ontimeupdate = muestra.onloadedmetadata = muestra.onplay = muestra.onpause = muestra.onended = muestra.onerror = null; muestra.pause(); muestra.removeAttribute('src'); muestra.load(); }
  function detenerMusicaMenu() { detenerReproductor(); musica.pause(); musica.removeAttribute('src'); musica.load(); actual = ''; }
  GANCHOS.en('startLevel', anterior => function (...args) { detenerMusicaMenu(); return anterior.apply(this, args); });
  GANCHOS.en('startBoss', anterior => function (...args) { detenerMusicaMenu(); return anterior.apply(this, args); });
  function tiempoCampechanidad() { if (mudo || musica.error) return undefined; if (!iniciado) return null; if (actual !== 'campechanita habanera.mp3' || musica.paused || musica.readyState < 2) return null; return musica.currentTime; }
  function cerrar() { detenerReproductor(); tic(); }
  function pantalla() {
    manual = true; musica.pause();
    let seleccion = -1, filtro = 'todas';
    const categoria = i => canciones[i].categoria;
    const tiempo = n => Number.isFinite(n) ? `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}` : '0:00';
    showScreen(`<div class="title reproductor">
      <header class="rep-cabecera"><div><span class="rep-kicker">LA MÚSICA DE ITZEL</span><h1>El cancionero</h1><p>Un pedacito de cada aventura, para llevar en el corazón.</p></div><button class="patch volver-esquina" id="musVolver">Volver</button></header>
      <div class="rep-marco">
        <section class="rep-ahora" aria-label="Reproductor de música">
          <div class="rep-arte" aria-hidden="true"><span class="rep-ornamento rep-ornamento-a">✦</span><div class="rep-disco"><div class="rep-disco-centro">♫</div></div><span class="rep-ornamento rep-ornamento-b">✿</span></div>
          <div class="rep-info"><span class="rep-etiqueta"><span class="rep-punto"></span> AHORA SUENA</span><h2 id="musTitulo">Elige una canción</h2><p id="musCategoria">Tu aventura empieza aquí</p></div>
          <div class="rep-progreso"><input id="musProgreso" type="range" min="0" max="1000" value="0" aria-label="Progreso de la canción"><div><span id="musTiempo">0:00</span><span id="musDuracion">0:00</span></div></div>
          <div class="rep-transporte"><button id="musAnterior" aria-label="Canción anterior" title="Canción anterior">⏮</button><button id="musPausa" class="rep-play" aria-label="Reproducir" title="Reproducir">▶</button><button id="musSiguiente" aria-label="Canción siguiente" title="Canción siguiente">⏭</button></div>
          <div class="rep-volumen"><span aria-hidden="true">♪</span><label for="musVolumen">Volumen</label><input id="musVolumen" type="range" min="0" max="100" value="${Math.round(valor(opciones().musica, 0) * 100)}"><output id="musVolValor">${Math.round(valor(opciones().musica, 0) * 100)}%</output></div>
          <p id="musEstado" class="rep-estado" aria-live="polite">Selecciona una pista para comenzar</p>
        </section>
        <section class="rep-biblioteca" aria-label="Biblioteca de canciones"><div class="rep-lista-titulo"><div><span class="rep-kicker">PARA ESCUCHAR</span><h2>Biblioteca</h2></div><span class="rep-conteo">${canciones.length} canciones</span></div>
          <div class="rep-filtros" aria-label="Filtrar canciones"><button class="activo" data-filtro="todas">Todas</button><button data-filtro="Niveles">Niveles</button><button data-filtro="Jefes">Jefes</button><button data-filtro="Historia y ambiente">Historia</button></div>
          <div class="rep-lista" id="musLista">${canciones.map((c,i) => `<button class="rep-pista" data-pista="${i}"><span class="rep-num">${String(i + 1).padStart(2, '0')}</span><span class="rep-pista-texto"><b>${c.nombre}</b><small>${categoria(i)}</small></span><span class="rep-pista-play" aria-hidden="true">▶</span></button>`).join('')}</div>
        </section>
      </div><p class="rep-pie">✦ &nbsp; Una aventura que suena a Campeche &nbsp; ✦</p></div>`);
    const estado = () => {
      const activa = seleccion >= 0, pausada = muestra.paused;
      $('musPausa').textContent = activa && !pausada ? '❚❚' : '▶';
      $('musPausa').setAttribute('aria-label', activa && !pausada ? 'Pausar' : 'Reproducir');
      $('musPausa').title = activa && !pausada ? 'Pausar' : 'Reproducir';
      document.querySelectorAll('[data-pista]').forEach(b => { const on = Number(b.dataset.pista) === seleccion; b.classList.toggle('activa', on); b.setAttribute('aria-current', on ? 'true' : 'false'); b.querySelector('.rep-pista-play').textContent = on && !pausada ? '❚❚' : '▶'; });
      $('musEstado').textContent = !activa ? 'Selecciona una pista para comenzar' : muestra.volume === 0 ? 'El volumen está en silencio' : pausada ? 'En pausa' : 'Reproduciendo';
    };
    const actualizarTiempo = () => { $('musTiempo').textContent = tiempo(muestra.currentTime); $('musDuracion').textContent = tiempo(muestra.duration); $('musProgreso').value = Number.isFinite(muestra.duration) && muestra.duration > 0 ? Math.round(muestra.currentTime / muestra.duration * 1000) : 0; };
    const elegir = i => { seleccion = (i + canciones.length) % canciones.length; const c = canciones[seleccion]; muestra.src = url(c.archivo); muestra.loop = false; actualiza(); $('musTitulo').textContent = c.nombre; $('musCategoria').textContent = categoria(seleccion); actualizarTiempo(); reproducir(muestra); estado(); };
    document.querySelectorAll('[data-pista]').forEach(b => b.onclick = () => elegir(Number(b.dataset.pista)));
    document.querySelectorAll('[data-filtro]').forEach(b => b.onclick = () => { filtro = b.dataset.filtro; document.querySelectorAll('[data-filtro]').forEach(x => x.classList.toggle('activo', x === b)); document.querySelectorAll('[data-pista]').forEach(x => { x.hidden = filtro !== 'todas' && categoria(Number(x.dataset.pista)) !== filtro; }); $('musLista').scrollTop = 0; });
    $('musPausa').onclick = () => { if (seleccion < 0) elegir(0); else if (muestra.paused) reproducir(muestra); else muestra.pause(); estado(); };
    $('musAnterior').onclick = () => elegir(seleccion < 0 ? 0 : seleccion - 1);
    $('musSiguiente').onclick = () => elegir(seleccion < 0 ? 0 : seleccion + 1);
    $('musProgreso').oninput = e => { if (Number.isFinite(muestra.duration) && muestra.duration > 0) muestra.currentTime = Number(e.target.value) / 1000 * muestra.duration; };
    $('musVolumen').oninput = e => { opciones().musica = Number(e.target.value); PROG.save(); actualiza(); $('musVolValor').textContent = e.target.value + '%'; estado(); };
    muestra.ontimeupdate = actualizarTiempo; muestra.onloadedmetadata = actualizarTiempo; muestra.onplay = estado; muestra.onpause = estado; muestra.onended = () => elegir(seleccion + 1);
    muestra.onerror = () => { if (manual && $('musEstado')) $('musEstado').textContent = 'No se pudo cargar esta canción'; };
    $('musVolver').onclick = () => { muestra.ontimeupdate = muestra.onloadedmetadata = muestra.onplay = muestra.onpause = muestra.onended = muestra.onerror = null; cerrar(); menuPrincipal(); };
  }
  GANCHOS.en('menuPrincipal', anteriorMenu => function () {
    if (manual) cerrar(); anteriorMenu.apply(this, arguments);
    const lista = document.querySelector('.menu-lista'); if (!lista) return;
    const b = document.createElement('button'); b.className = 'opcion'; b.id = 'mMusica'; b.innerHTML = `<img src="${ico('musica',5)}"><b>Música</b><span>Escuchar las canciones del juego</span>`; b.onclick = pantalla; lista.appendChild(b);
    for (const id of ['mSigue', 'mJugar', 'mMulti', 'mEnci', 'mLogros', 'mCine', 'mOpc', 'mMusica', 'mEst', 'mCred']) {
      const opcion = document.getElementById(id); if (opcion && opcion.parentElement === lista) lista.appendChild(opcion);
    }
  });
  if (STATE === 'title' && document.querySelector('.menu-lista')) menuPrincipal();
  return { canciones, pantalla, actualiza, efecto, variante, tiempoCampechanidad };
})();
