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
  musicaPorMundo.set('fuego', 'lvl3.mp3');
  musicaPorMundo.set('cuaderno', 'cenote.mp3');
  const temaSubjefe = 'lvl21.mp3';
  const cancionesNivel = mundosMusicales.map(id => ({ archivo: musicaPorMundo.get(id), nombre: NIVELES[id].nombre, categoria: 'Niveles' }));
  const canciones = [
    ...cancionesNivel,
    { archivo:'campechanita habanera.mp3', nombre:'La Campechanita', categoria:'Niveles' },
    ...[['bossfight.mp3','Combate contra jefe 1'],['boss fight2.mp3','Combate contra jefe 2'],['boss fight3.mp3','Combate contra jefe 3'],['boss fight 4.mp3','Combate contra jefe 4'],['la ruptura.mp3','La Ruptura'],[temaSubjefe,'Combate contra subjefe']].map(([archivo,nombre]) => ({archivo,nombre,categoria:'Jefes'})),
    ...[['menu theme.mp3','Tema del menú'],['bullicio.mp3','Bullicio'],['cueva.mp3','Cueva'],['cinematica 1 se abre la grieta.mp3','Se abre la grieta'],['win.mp3','Victoria'],['loss.mp3','Derrota'],['loss by boss.mp3','Derrota ante un jefe']].map(([archivo,nombre]) => ({archivo,nombre,categoria:'Historia y ambiente'}))
  ];
  // ---- el cancionero se va desbloqueando: cada canción se puede escuchar ahí hasta que te sale por primera vez en el juego ----
  // (en la versión publicada; en local todo está abierto para trabajar)
  const desbloqueadas = () => (PROG.d.canciones || (PROG.d.canciones = {}));
  const abierta = archivo => !window.MODO_PUBLICO || !!desbloqueadas()[archivo];
  function marca(archivo) { if (!archivo || !window.MODO_PUBLICO || typeof PROG === 'undefined') return; const d = desbloqueadas(); if (d[archivo]) return; d[archivo] = 1; try { PROG.save(); } catch (e) {} }
  const url = nombre => 'assets/audio/' + nombre.split('/').map(encodeURIComponent).join('/');
  const musica = new Audio(); musica.loop = true; musica.preload = 'auto';
  const muestra = new Audio(); muestra.preload = 'none';
  const musicaSub = new Audio(); musicaSub.preload = 'auto'; musicaSub.loop = true;   // la canción del subjefe va en su propio elemento: la del nivel solo se pausa y sigue donde iba
  let nivelPausado = null;
  let memoriaNivel = null, actual = '', manual = false, iniciado = false, pasoAnterior = 0, enAgua = false, pausaNivel = null;
  const valor = (v, defecto = .6) => typeof v === 'number' ? Math.max(0, Math.min(1, v / 100)) : ({alta:1, media:.6, baja:.28, no:0}[v] ?? defecto);
  const opciones = () => PROG.d.opciones || {};
  function actualiza() { musica.volume = valor(opciones().musica, 0) * (STATE === 'pause' ? .35 : 1); musicaSub.volume = musica.volume; muestra.volume = valor(opciones().musica, 0); for (const item of sonidosCine) item.audio.volume = volumenCine(item.categoria) * (item.factor ?? 1); }
  function reproducir(a) { if (!mudo && iniciado && a.paused) a.play().catch(() => {}); }
  function efecto(nombre, categoria = 'efectos', factor = 1) {
    if (mudo || !iniciado) return;
    const a = new Audio(url(nombre)); a.volume = valor(opciones().efectos) * (categoria === 'ambiente' ? valor(opciones().ambiente) : 1) * Math.max(0, Math.min(1, factor)); a.play().catch(() => {});
  }
  // un efecto de enemigo o jefe: sigue al volumen de sonidos y al de «Enemigos y jefes»
  function efectoEnemigo(nombre, factor = 1) {
    if (mudo || !iniciado) return;
    const a = new Audio(url(nombre)); a.volume = valor(opciones().efectos) * valor(opciones().enemigos) * Math.max(0, Math.min(1, factor)); a.play().catch(() => {});
  }
  // sonidos de la apertura (logos y portada): no esperan al primer clic (si el navegador los frena, no pasa nada)
  function apertura(nombre, categoria = 'efectos') {
    if (mudo) return null; const a = new Audio(url(nombre)); a.volume = valor(opciones().efectos) * (categoria === 'ambiente' ? valor(opciones().ambiente) : 1); a.play().catch(() => {}); return a;
  }
  const sonidosCine = new Set(); let bullicioCine = null, cinePausado = false;
  // la música de las cinemáticas no depende del control «Música» (que empieza apagado): sigue al de efectos, o al de música si está más alto
  const volumenCine = categoria => categoria === 'musica' ? Math.max(valor(opciones().musica, 0), valor(opciones().efectos)) : valor(opciones().efectos) * (categoria === 'ambiente' ? valor(opciones().ambiente) : 1);
  function sonidoCine(nombre, categoria = 'efectos') {
    if (mudo) return null; // (no espera al primer clic: en la apertura la cinemática arranca sola, sin que nadie haya tocado nada; si el navegador lo frena, no pasa nada)
    marca(nombre);
    const audio = new Audio(url(nombre)), item = { audio, categoria }; audio.volume = volumenCine(categoria); sonidosCine.add(item);
    audio.addEventListener('ended', () => { sonidosCine.delete(item); if (bullicioCine === item) bullicioCine = null; }, { once: true });
    if (!cinePausado && !document.hidden) audio.play().catch(() => { sonidosCine.delete(item); });
    return item;
  }
  // lleva el volumen de un sonido de la cinemática a «a» (0–1) en ms milisegundos; fin: lo que sigue
  function rampaCine(item, a, ms, fin) {
    if (!item) return; clearInterval(item.rampa); const de = item.factor ?? 1, t0 = performance.now();
    item.rampa = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / ms); item.factor = de + (a - de) * k; item.audio.volume = volumenCine(item.categoria) * item.factor; if (k >= 1) { clearInterval(item.rampa); if (fin) fin(); } }, 40);
  }
  // baja un sonido de la cinemática hasta apagarlo (seg segundos)
  function fundirCine(item, seg = 2) {
    if (!item || item.fundiendo) return; item.fundiendo = true; const t0 = performance.now();
    const base = item.base ?? 1, paso = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / (seg * 1000)); item.factor = base * (1 - k); item.audio.volume = volumenCine(item.categoria) * item.factor; if (k >= 1) { clearInterval(paso); detenerCine(item); } }, 80);
  }
  function detenerCine(item) { if (!item) return; item.audio.pause(); sonidosCine.delete(item); if (bullicioCine === item) bullicioCine = null; }
  function detenerTodosCine() { for (const item of [...sonidosCine]) detenerCine(item); cinePausado = false; }
  // ---- la entrada («La tarde que se rompió el cielo»): qué suena en cada marca (los nombres son los de cine-entrada.js) ----
  // suena con un volumen relativo (factor), por ejemplo la música debajo de las voces
  const suena = (nombre, categoria, factor = 1, repite = false) => { const it = sonidoCine(nombre, categoria); if (it) { it.base = factor; it.factor = factor; it.audio.loop = repite; it.audio.volume = volumenCine(categoria) * factor; } return it; };
  let puntadas = null;
  const SALTOS_CINE = ['cine/salto-cine-1.mp3', 'cine/salto-cine-2.mp3', 'cine/salto-cine-3.mp3']; let saltoCine = 0;
  const vivos = {}; // los que duran: rugido de la Ruptura y mar con gaviotas
  const ENTRADA = {
    'olas y gaviotas': () => { detenerCine(vivos.mar0); vivos.mar0 = sonidoCine('agua y gaviotas apartir del seg 50 cinematica.mp3', 'ambiente'); if (vivos.mar0) { vivos.mar0.factor = 0; rampaCine(vivos.mar0, 1, 900); } },
    'Parque Principal: palomas y campanas de la catedral': () => { fundirCine(vivos.mar0, .9); detenerCine(bullicioCine); bullicioCine = sonidoCine('cine/bullicio-1.mp3', 'ambiente'); },
    // cada toma de Campeche tiene su pedazo del bullicio (cortados de bullicio.mp3 en puntos distintos): entre toma y toma se corta,
    // queda un respiro y regresa distinto, para que no suene como un solo sonido corrido
    'la muralla: viento y bandera': () => { detenerCine(bullicioCine); bullicioCine = sonidoCine('cine/bullicio-2.mp3', 'ambiente'); suena('cine/viento-muralla.mp3', 'ambiente'); },
    'calle del centro: marimba lejana': () => { detenerCine(bullicioCine); bullicioCine = sonidoCine('cine/bullicio-3.mp3', 'ambiente'); suena('cine/marimba-calle.mp3', 'ambiente', .9); },
    'pasa la bicicleta': () => sonidoCine('cine/bicicleta.mp3'),
    'se tambalea': () => sonidoCine('cine/tambalea.mp3'),
    'visión: pixel': () => sonidoCine('cine/vision-pixel.mp3'), 'visión: tinta': () => sonidoCine('cine/vision-tinta.mp3'),
    'visión: neón': () => sonidoCine('cine/vision-neon.mp3'), 'visión: acuarela': () => sonidoCine('cine/vision-acuarela.mp3'),
    'acepta': () => sonidoCine('cine/acepta.mp3'), 'cámara lenta': () => sonidoCine('cine/camara-lenta.mp3'),
    'fin del bullicio': () => detenerCine(bullicioCine),
    'Itzel lanza la piedrita': () => sonidoCine('cine/roca-lanza.mp3'),
    'la piedrita cae en el 3': () => sonidoCine('cine/roca-cae.mp3'),
    'llega al cielo': () => sonidoCine('itzel wins.mp3'),
    'el mundo se detiene (las olas se frenan)': () => sonidoCine('para algo de la cinematica.mp3'),
    'empieza la tarde: música y mar': () => { vivos.musica = suena('cine/musica-tarde.mp3', 'musica', .6); vivos.mar1 = suena('cine/mar-calma.mp3', 'ambiente', 1, true); },
    'la grieta se abre': () => { sonidoCine('cinematica 1 se abre la grieta.mp3'); vivos.tension = suena('cine/musica-tension.mp3', 'musica', .6); },
    'zumbido grave': () => sonidoCine('cine/zumbido-rendija.mp3'),
    'luz azul': () => sonidoCine('cine/luz-azul.mp3'), 'luz naranja': () => sonidoCine('cine/luz-naranja.mp3'),
    'luz violeta': () => sonidoCine('cine/luz-violeta.mp3'), 'luz rosa': () => sonidoCine('cine/luz-rosa.mp3'),
    'salen huyendo los ajolotes': () => sonidoCine('cine/ajolotes-huyen.mp3'),
    'tentáculos': () => sonidoCine('cine/tentaculo.mp3'),
    'encierra a Fresita en un cristal': () => sonidoCine('cine/cristal-forma.mp3'),
    'orbe azul': () => sonidoCine('cine/orbe-1.mp3'), 'orbe naranja': () => sonidoCine('cine/orbe-2.mp3'), 'orbe violeta': () => sonidoCine('cine/orbe-3.mp3'),
    'Fresita cae en el pretil': () => sonidoCine('cine/fresita-cae.mp3'),
    'sube la música para entrar a la grieta': () => { vivos.resuelve = suena('cine/musica-resuelve.mp3', 'musica', .7); },
    'entran a la grieta': () => sonidoCine('cine/entran-grieta.mp3'),
    // el logo se borda puntada por puntada: una puntada por cada pasito, con el tono y la fuerza un poco distintos
    'se empieza a bordar el logo': () => { clearInterval(puntadas); let n = 0; puntadas = setInterval(() => { if (n++ >= 14) { clearInterval(puntadas); return; } const it = suena('cine/puntada.mp3', 'efectos', .55 + Math.random() * .45); if (it) { it.audio.preservesPitch = false; it.audio.playbackRate = .88 + Math.random() * .3; } }, 80); },
    // (el acorde del logo se quitó: no le gustó a David; el archivo sigue en assets/audio/cine/acorde-logo.mp3)
    'sale la Ruptura': () => { detenerCine(vivos.rugido); vivos.rugido = sonidoCine('rugido de la ruptura, cinematica.mp3'); },
    'se va la Ruptura': () => fundirCine(vivos.rugido, 1.1),
    'azul golpea el cristal': () => sonidoCine('cine/cristal-golpe-1.mp3'),
    'naranja golpea el cristal': () => sonidoCine('cine/cristal-golpe-2.mp3'),
    'el cristal revienta: Fresita sale volando': () => sonidoCine('cine/cristal-rompe.mp3'),
    'vuelven el mar y las gaviotas': () => { fundirCine(vivos.mar1, 1.5); detenerCine(vivos.mar); vivos.mar = sonidoCine('agua y gaviotas apartir del seg 50 cinematica.mp3', 'ambiente'); },
    'se va el mar': () => fundirCine(vivos.mar, 1.8),
    'la grieta crece': () => sonidoCine('sonido de la grieta cinematica.mp3'),
  };
  addEventListener('cine-cue', e => {
    const d = e.detail; if (!d || d.cine !== 'entrada') return;
    if (d.tipo === 'golpe' && d.nombre.startsWith('brinco')) { sonidoCine(SALTOS_CINE[saltoCine++ % SALTOS_CINE.length]); return; }
    const f = ENTRADA[d.nombre]; if (f) f();
  });
  // ---- la cinemática final: una canción tranquila y melancólica de fondo, que baja mientras hablan Itzel y Fresita ----
  const MF = .6; let musicaFinal = null;
  addEventListener('cine-cue', e => { const d = e.detail; if (d && d.cine === 'final' && d.nombre === 'la grieta se cierra') { detenerCine(musicaFinal); musicaFinal = suena('cine/musica-final.mp3', 'musica', MF); } });
  addEventListener('cine-voz', e => { const d = e.detail; if (!d || d.cine !== 'final' || !musicaFinal) return; const m = musicaFinal; clearTimeout(m.restaura); rampaCine(m, MF * .5, 250); m.restaura = setTimeout(() => { if (musicaFinal === m && !m.fundiendo) rampaCine(m, MF, 700); }, (d.dur + .3) * 1000); });
  addEventListener('cine-fin', e => { if (!e.detail || e.detail.cine !== 'final') return; for (const item of [...sonidosCine]) fundirCine(item, .6); musicaFinal = null; });
  // ---- las entradas de jefe: cada marca de la cinemática (cine-jefes.js) suena con su archivo de ElevenLabs ----
  // [archivo, categoría]; los «ambiente» son camas que se apagan solas al terminar; lo demás son efectos
  const JEFES = {"mythos":{"se agrieta el cielo":["jefes/mythos-cielo-se-agrieta.mp3"],"se abre el ojo":["jefes/mythos-ojo-se-abre.mp3"],"orbes":["jefes/mythos-orbes.mp3"]},"golem":{"retumbo lejano":["jefes/golem-retumbo.mp3"],"se enciende el cristal":["jefes/golem-cristal.mp3"],"se levanta":["jefes/golem-se-levanta-pisoton.mp3"],"cae el peñasco":["jefes/golem-penasco.mp3"]},"serpiente":{"viento del vacío":["jefes/serpiente-viento-vacio.mp3","ambiente"],"sube Kukulkán":["jefes/serpiente-sube.mp3"],"se abre el penacho":["jefes/serpiente-penacho.mp3"]},"jaguar":{"chicharras":["jefes/jaguar-chicharras.mp3","ambiente"],"ojos en el zacate":["jefes/jaguar-zacate.mp3"],"cae el jaguar":["jefes/jaguar-cae.mp3"],"ruge":["jefes/jaguar-ruge.mp3"]},"hadas":{"campanitas":["jefes/hadas-campanitas.mp3","ambiente"],"baja la reina":["jefes/hadas-baja-la-reina.mp3"],"risitas, espiral de hadas":["jefes/hadas-risitas.mp3"],"Itzel no la alcanza":["jefes/hadas-polvo-escapa.mp3"]},"cocodrilo":{"agua y ranas":["jefes/cocodrilo-pantano.mp3","ambiente"],"burbujas":["jefes/cocodrilo-burbujas.mp3"],"la mordida (cámara lenta)":["jefes/cocodrilo-mordida.mp3"],"rugido y chorro":["jefes/cocodrilo-rugido.mp3"]},"pirata":{"olas y campana":["jefes/pirata-olas-campana.mp3","ambiente"],"loro fantasma":["jefes/pirata-loro.mp3"],"sale el barco de la niebla":["jefes/pirata-barco.mp3"],"risa del capitán":["jefes/pirata-risa.mp3"],"cañonazos":["jefes/pirata-canonazos.mp3"],"cae la bala":["jefes/pirata-bala.mp3"]},"chaac":{"viento que sube":["jefes/chaac-viento-sube.mp3","ambiente"],"la primera gota":["jefes/chaac-gota.mp3"],"se abre la nube":["jefes/chaac-nube.mp3"],"el aguacero":["jefes/chaac-aguacero.mp3"],"el rayo":["jefes/chaac-rayo.mp3"]},"camazotz":{"eco y se va la luz":["jefes/camazotz-eco-luz.mp3"],"aleteo de murcielaguitos":["jefes/camazotz-aleteo.mp3"],"el chillido":["jefes/camazotz-chillido.mp3"],"picada":["jefes/camazotz-picada.mp3"]},"abeja":{"zumbido lejano":["jefes/abeja-zumbido-lejano.mp3","ambiente"],"gota de miel":["jefes/abeja-miel.mp3"],"llega el enjambre":["jefes/abeja-enjambre.mp3"],"el aguijón":["jefes/abeja-aguijon.mp3"],"canción de cuna":["jefes/abeja-cuna.mp3"],"zumbido furioso":["jefes/abeja-furioso.mp3"]},"ruptura":{"latido grave":["jefes/ruptura-latido.mp3"],"la Ruptura cambia":["jefes/ruptura-cambia.mp3"],"revela su forma":["jefes/ruptura-revela.mp3"],"el núcleo late":["jefes/ruptura-nucleo.mp3"]}};
  // marcas que cortan una cama: cuando llega la marca, la cama de la otra marca baja y se apaga
  const JEFES_CORTA = { jaguar: { 'se callan las chicharras': 'chicharras' }, hadas: { 'se detienen las lucecitas': 'campanitas' }, };
  const vivosJ = {}, VJ = .55; // volumen de los sonidos de las entradas de jefe (1 = al máximo del archivo ya emparejado)
  addEventListener('cine-cue', e => {
    const d = e.detail; if (!d || !/^jefe-/.test(d.cine)) return; const tipo = d.cine.slice(5);
    const corta = (JEFES_CORTA[tipo] || {})[d.nombre]; if (corta) fundirCine(vivosJ[corta], .35);
    // la Ruptura reutiliza tres sonidos de la cinemática de inicio: las campanitas de los ajolotes, su rugido y la grieta
    if (tipo === 'ruptura') {
      if (d.nombre === 'tres notas: los ajolotes') { ['luz-azul', 'luz-naranja', 'luz-violeta'].forEach((n, i) => setTimeout(() => suena('cine/' + n + '.mp3', 'efectos', VJ), i * 330)); return; }
      if (d.nombre === 'aparece la Ruptura') { vivosJ.rugido = suena('rugido de la ruptura, cinematica.mp3', 'efectos', VJ * .9); return; }
      if (d.nombre === 'revela su forma') fundirCine(vivosJ.rugido, 1.2);
      if (d.nombre === 'se abre la grieta') { vivosJ.grieta = suena('sonido de la grieta cinematica.mp3', 'efectos', VJ * .8); return; }
    }
    if (d.nombre.startsWith('carta')) { suena('jefes/carta.mp3', 'efectos', VJ); return; } // la carta con el nombre del jefe: el mismo golpe en las 12
    const spec = (JEFES[tipo] || {})[d.nombre]; if (!spec) return;
    vivosJ[d.nombre] = suena(spec[0], spec[1] || 'efectos', spec[1] === 'ambiente' ? VJ * .8 : VJ);
  });
  // al terminar la entrada (o saltarla) todo baja en medio segundo, para que las colas no se corten de golpe
  addEventListener('cine-fin', e => { if (!e.detail || !/^jefe-/.test(e.detail.cine)) return; for (const item of [...sonidosCine]) fundirCine(item, .5); for (const k of Object.keys(vivosJ)) delete vivosJ[k]; });
  // ---- las voces (ElevenLabs): cada línea sale con su archivo en cuanto empieza su subtítulo (cinemática de inicio y final) ----
  const VOCES = {
    '¡Ey! ¿Estás bien?': 'voces/itzel-ey-estas-bien.mp3', 'Soy Fresita. ¡Esa cosa se llevó a mis amigos!': 'voces/fresita-soy-fresita.mp3',
    'Los escondió en otros mundos. ¿Me ayudas?': 'voces/fresita-me-ayudas.mp3', 'Va, Fresita. Vamos por ellos.': 'voces/itzel-va-fresita.mp3',
    '¡Fresita, conmigo!': 'voces/itzel-fresita-conmigo.mp3', 'Y Campeche sigue en su lugar.': 'voces/itzel-campeche-sigue.mp3',
    '¡Están todos! ¡Lo logramos!': 'voces/fresita-estan-todos.mp3', 'Gracias, Itzel. Por todo.': 'voces/fresita-gracias.mp3',
  };
  addEventListener('cine-voz', e => { const d = e.detail; if (!d || (d.cine !== 'entrada' && d.cine !== 'final')) return; const f = VOCES[d.texto]; if (f) sonidoCine(f, 'voces'); });
  addEventListener('cine-fin', e => {
    if (!e.detail || e.detail.cine !== 'entrada') return;
    clearInterval(puntadas); const acorde = vivos.acorde; if (acorde) sonidosCine.delete(acorde); // el acorde del logo se apaga poco a poco, no de golpe
    detenerTodosCine(); saltoCine = 0; for (const k of Object.keys(vivos)) delete vivos[k];
    if (acorde) { const v0 = acorde.audio.volume, t0 = performance.now(), id = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / 1400); acorde.audio.volume = v0 * (1 - k); if (k >= 1) { clearInterval(id); acorde.audio.pause(); } }, 60); }
  });
  addEventListener('cine-pausa', e => { if (!e.detail || (e.detail.cine !== 'entrada' && e.detail.cine !== 'final' && !/^jefe-/.test(e.detail.cine))) return; cinePausado = e.detail.pausada; for (const item of sonidosCine) { if (cinePausado) item.audio.pause(); else if (!document.hidden) item.audio.play().catch(() => {}); } });
  const variantes = { salto: Array.from({length: 3}, (_, i) => `variantes/salto-${String(i + 1).padStart(2, '0')}.mp3`), paso: ['pasto', 'suelo'].flatMap(tipo => Array.from({length: 12}, (_, i) => `variantes/paso-${tipo}-${String(i + 1).padStart(2, '0')}.mp3`)) };
  const ultimaVariante = {};
  function variante(tipo) { const lista = variantes[tipo]; if (!lista || !lista.length) return; let i = Math.floor(Math.random() * lista.length); if (lista.length > 1 && i === ultimaVariante[tipo]) i = (i + 1 + Math.floor(Math.random() * (lista.length - 1))) % lista.length; ultimaVariante[tipo] = i; efecto(lista[i]); }
  // La apertura se instala después de este archivo: reservar silencio desde el inicio.
  const qsApertura = new URLSearchParams(location.search);
  let esperaApertura = (qsApertura.has('gdapertura') || window.MODO_PUBLICO || qsApertura.has('intro')) && !['propuesta', 'jugar', 'gd', 'mundo', 'nivel', 'jefe', 'fotos', 'mudo', 'fijo', 'sinintro'].some(k => qsApertura.has(k));
  function pista() {
    if (window.enApertura) { esperaApertura = false; return ''; }
    if (esperaApertura && !window.inicioAperturaRegistrado) return '';
    esperaApertura = false;
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
    if ((CUR.objs || []).some(o => o.k === 'subjefe' && o.fase === 'pelea' && !o.dead)) return temaSubjefe;
    return musicaPorMundo.get(curStyle().id) || archivoNivel(0);
  }
  function tic() {
    if (manual && STATE !== 'title') detenerReproductor();
    if (bullicioCine && (typeof CINE === 'undefined' || !CINE.activo() || CINE.t >= 6 + CAMPECHE_TOMAS.DUR)) detenerCine(bullicioCine);
    actualiza();
    if (manual || document.hidden) { musica.pause(); musicaSub.pause(); return; }
    const nombre = pista(), enSub = nombre === temaSubjefe;
    if (nombre && iniciado) marca(nombre);   // sonó por primera vez: ya se puede escuchar en el cancionero
    // se recuerda siempre dónde va la canción del nivel: al vencer a un subjefe continúa de ahí, no desde el principio
    if (nombre && nombre !== temaSubjefe && nombre === actual && CUR && STATE === 'play' && !musica.paused && musica.currentTime > 0) memoriaNivel = { juego: CUR, archivo: actual, tiempo: musica.currentTime };
    if (enSub) {
      if (actual !== temaSubjefe) {            // empieza la pelea: la canción del nivel se pausa (conserva archivo y posición) y entra la del subjefe
        nivelPausado = actual && CUR ? { juego: CUR, archivo: actual } : null;
        musica.pause(); actual = temaSubjefe; musicaSub.src = url(temaSubjefe); musicaSub.loop = true;
      }
      reproducir(musicaSub);
    } else if (actual === temaSubjefe) {       // terminó la pelea: se apaga la del subjefe y la del nivel continúa donde se quedó
      musicaSub.pause();
      if (nivelPausado && nombre === nivelPausado.archivo && CUR === nivelPausado.juego) actual = nombre;
      nivelPausado = null;
    }
    if (!enSub && nombre !== actual) {
      if (nombre === temaSubjefe && CUR && actual && actual !== temaSubjefe) pausaNivel = { juego: CUR, archivo: actual, tiempo: musica.currentTime };
      const deSubjefe = actual === temaSubjefe && memoriaNivel && nombre === memoriaNivel.archivo && CUR === memoriaNivel.juego;
      const recuperar = deSubjefe ? memoriaNivel.tiempo : (pausaNivel && nombre === pausaNivel.archivo && CUR === pausaNivel.juego ? pausaNivel.tiempo : null);
      if (nombre !== temaSubjefe) pausaNivel = null;
      musica.pause(); actual = nombre;
      if (nombre) {
        musica.src = url(nombre); musica.loop = STATE !== 'over' && STATE !== 'win';
        if (recuperar !== null && recuperar > 0) musica.addEventListener('loadedmetadata', () => { if (actual === nombre) { try { musica.currentTime = recuperar; } catch (_) {} } }, { once: true });
      }
    }
    const ritmo = nombre === 'campechanita habanera.mp3' && CUR && CUR.def && CUR.def.id === 'campechanidad';
    if (ritmo && STATE === 'pause') musica.pause();
    else if (nombre && !enSub && !musica.ended) {
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
  document.addEventListener('visibilitychange', () => { if (document.hidden) { musica.pause(); musicaSub.pause(); muestra.pause(); for (const item of sonidosCine) item.audio.pause(); } else { if (!cinePausado && typeof CINE !== 'undefined' && CINE.activo()) for (const item of sonidosCine) item.audio.play().catch(() => {}); tic(); } });
  setInterval(tic, 150);
  function detenerReproductor() { manual = false; muestra.ontimeupdate = muestra.onloadedmetadata = muestra.onplay = muestra.onpause = muestra.onended = muestra.onerror = null; muestra.pause(); muestra.removeAttribute('src'); muestra.load(); }
  function detenerMusicaMenu() { detenerReproductor(); musica.pause(); musicaSub.pause(); nivelPausado = null; musica.removeAttribute('src'); musica.load(); actual = ''; pausaNivel = null; }
  GANCHOS.en('startLevel', anterior => function (...args) { detenerMusicaMenu(); const resultado = anterior.apply(this, args); tic(); return resultado; });
  GANCHOS.en('startBoss', anterior => function (...args) { detenerMusicaMenu(); const resultado = anterior.apply(this, args); tic(); return resultado; });
  function asegurarCampechanidad(j) {
    if (STATE === 'play' && CUR === j && actual !== 'campechanita habanera.mp3') tic();
  }
  function tiempoCampechanidad() { if (mudo || musica.error) return undefined; if (!iniciado) return null; if (actual !== 'campechanita habanera.mp3' || musica.paused || musica.readyState < 2) return null; return musica.currentTime; }
  function cerrar() { detenerReproductor(); tic(); }
  function pantalla() {
    manual = true; musica.pause(); musicaSub.pause();
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
        <section class="rep-biblioteca" aria-label="Biblioteca de canciones"><div class="rep-lista-titulo"><div><span class="rep-kicker">PARA ESCUCHAR</span><h2>Biblioteca</h2></div><span class="rep-conteo">${canciones.filter(c => abierta(c.archivo)).length} de ${canciones.length} canciones</span></div>
          <div class="rep-filtros" aria-label="Filtrar canciones"><button class="activo" data-filtro="todas">Todas</button><button data-filtro="Niveles">Niveles</button><button data-filtro="Jefes">Jefes</button><button data-filtro="Historia y ambiente">Historia</button></div>
          <div class="rep-lista" id="musLista">${canciones.map((c,i) => `<button class="rep-pista${abierta(c.archivo) ? '' : ' bloqueada'}" data-pista="${i}"${abierta(c.archivo) ? '' : ' disabled'}><span class="rep-num">${String(i + 1).padStart(2, '0')}</span><span class="rep-pista-texto"><b>${abierta(c.archivo) ? c.nombre : '¿?'}</b><small>${abierta(c.archivo) ? categoria(i) : 'Sin descubrir: te saldrá jugando'}</small></span><span class="rep-pista-play" aria-hidden="true">${abierta(c.archivo) ? '▶' : '🔒'}</span></button>`).join('')}</div>
        </section>
      </div><p class="rep-pie">✦ &nbsp; Una aventura que suena a Campeche &nbsp; ✦</p></div>`);
    const estado = () => {
      const activa = seleccion >= 0, pausada = muestra.paused;
      $('musPausa').textContent = activa && !pausada ? '❚❚' : '▶';
      $('musPausa').setAttribute('aria-label', activa && !pausada ? 'Pausar' : 'Reproducir');
      $('musPausa').title = activa && !pausada ? 'Pausar' : 'Reproducir';
      document.querySelectorAll('[data-pista]').forEach(b => { const on = Number(b.dataset.pista) === seleccion; b.classList.toggle('activa', on); b.setAttribute('aria-current', on ? 'true' : 'false'); b.querySelector('.rep-pista-play').textContent = b.disabled ? '🔒' : on && !pausada ? '❚❚' : '▶'; });
      $('musEstado').textContent = !activa ? 'Selecciona una pista para comenzar' : muestra.volume === 0 ? 'El volumen está en silencio' : pausada ? 'En pausa' : 'Reproduciendo';
    };
    const actualizarTiempo = () => { $('musTiempo').textContent = tiempo(muestra.currentTime); $('musDuracion').textContent = tiempo(muestra.duration); $('musProgreso').value = Number.isFinite(muestra.duration) && muestra.duration > 0 ? Math.round(muestra.currentTime / muestra.duration * 1000) : 0; };
    const elegir = (i, paso = 1) => { let n = 0; i = (i + canciones.length) % canciones.length; while (!abierta(canciones[i].archivo) && n++ < canciones.length) i = (i + paso + canciones.length) % canciones.length; if (!abierta(canciones[i].archivo)) return;   // (se salta lo que aún no te ha salido)
      seleccion = i; const c = canciones[seleccion]; muestra.src = url(c.archivo); muestra.loop = false; actualiza(); $('musTitulo').textContent = c.nombre; $('musCategoria').textContent = categoria(seleccion); actualizarTiempo(); reproducir(muestra); estado(); };
    document.querySelectorAll('[data-pista]').forEach(b => b.onclick = () => elegir(Number(b.dataset.pista)));
    document.querySelectorAll('[data-filtro]').forEach(b => b.onclick = () => { filtro = b.dataset.filtro; document.querySelectorAll('[data-filtro]').forEach(x => x.classList.toggle('activo', x === b)); document.querySelectorAll('[data-pista]').forEach(x => { x.hidden = filtro !== 'todas' && categoria(Number(x.dataset.pista)) !== filtro; }); $('musLista').scrollTop = 0; });
    $('musPausa').onclick = () => { if (seleccion < 0) elegir(0); else if (muestra.paused) reproducir(muestra); else muestra.pause(); estado(); };
    $('musAnterior').onclick = () => elegir(seleccion < 0 ? 0 : seleccion - 1, -1);
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
  return { canciones, pantalla, actualiza, efecto, efectoEnemigo, apertura, variante, tiempoCampechanidad, asegurarCampechanidad };
})();
