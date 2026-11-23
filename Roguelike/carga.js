'use strict';
// =====================================================================
//  PANTALLAS DE CARGA ENTRE MUNDOS
//  No hacen falta para cargar (el mundo se arma en un instante), pero dan
//  respiro entre mundo y mundo: una postal del destino pintada en su estilo,
//  el lugar real de Campeche, un dato para leer y una barra bordada que se
//  llena mientras Fresita nada de un lado a otro. Pidió David que el flujo
//  fuera un poquito más lento (2026-11-19).
//  Se saltan en pruebas (?mudo, ?fijo, ?sinintro…) para no frenar el humo.
// =====================================================================
(() => {
  const Q = new URLSearchParams(location.search);
  const SIN = ['mudo', 'fijo', 'fotos', 'sincarga'].some(k => Q.has(k));
  const DURA = 2600; // ms
  const FRASES = ['Hilvanando el camino…', 'Doblando el mapa de Campeche…', 'Fresita busca la grieta…', 'Itzel se amarra las sandalias…', 'Bordando el siguiente mundo…'];

  const estilo = document.createElement('style');
  estilo.textContent = `
    .carga { display:flex; flex-direction:column; align-items:center; gap:10px; max-width:640px; margin:0 auto; text-align:center; }
    .carga .postal { width:min(560px, 86vw); aspect-ratio:16/9; border-radius:6px; box-shadow:0 0 0 3px #f3dcb4, 0 0 0 5px #8a4a1a, 0 10px 26px rgba(0,0,0,.45);
      overflow:hidden; position:relative; animation:cargaPostal 2.6s ease-out both; background:#2a1d18; }
    .carga .postal canvas { width:100%; height:100%; display:block; object-fit:cover; }
    .carga .postal .lugar { position:absolute; left:10px; bottom:8px; padding:3px 10px; background:rgba(40,22,14,.78); color:#fff3dc; border-radius:4px;
      font:600 15px 'Alegreya Sans', sans-serif; border:1px dashed rgba(255,231,190,.6); }
    .carga .rumbo { font:500 15px 'Alegreya Sans', sans-serif; color:#f3dcb4; letter-spacing:.08em; text-transform:uppercase; margin:2px 0 -4px; }
    .carga .dato { font:italic 500 17px/1.35 'Alegreya', serif; color:#fff3dc; max-width:560px; min-height:46px; margin:0; opacity:0; animation:cargaDato .6s .5s ease-out forwards; }
    .carga .barra { position:relative; width:min(420px, 80vw); height:16px; border-radius:9px; background:#3a241a; box-shadow:inset 0 0 0 2px #8a4a1a; margin-top:8px; }
    .carga .barra i { position:absolute; inset:3px auto 3px 3px; border-radius:6px; width:0; background:repeating-linear-gradient(90deg,#f2b51f 0 6px,#e8742a 6px 12px);
      animation:cargaLlena var(--dura) cubic-bezier(.45,.05,.4,1) forwards; }
    .carga .barra i::after { content:''; position:absolute; inset:0; border-top:2px dashed rgba(255,243,220,.55); border-radius:6px; }
    .carga .barra .fresita { position:absolute; top:-22px; left:0; font-size:20px; animation:cargaNada var(--dura) cubic-bezier(.45,.05,.4,1) forwards; }
    .carga .barra .fresita span { display:inline-block; animation:cargaOla .5s ease-in-out infinite alternate; }
    .carga .frase { font:600 14px 'Alegreya Sans', sans-serif; color:#d8bf98; min-height:18px; }
    @keyframes cargaLlena { to { width:calc(100% - 6px); } }
    @keyframes cargaNada { to { left:calc(100% - 22px); } }
    @keyframes cargaOla { from { transform:translateY(0) rotate(-6deg); } to { transform:translateY(-4px) rotate(6deg); } }
    @keyframes cargaPostal { from { transform:scale(1.06); filter:brightness(.4) blur(2px); } to { transform:scale(1); filter:none; } }
    @keyframes cargaDato { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }`;
  document.head.appendChild(estilo);

  function datoDe(id) {
    const M = typeof CAMPECHE !== 'undefined' && CAMPECHE.MUNDOS && CAMPECHE.MUNDOS[id];
    const H = typeof CAMPECHE_SABER !== 'undefined' ? CAMPECHE_SABER.HALLAZGOS.filter(h => (h.mundos || []).includes(id)) : [];
    const opciones = [M && M.dato, ...H.map(h => h.largo)].filter(Boolean);
    return { nombre: M ? M.nombre : (STYLE_MAP[id] && STYLE_MAP[id].name) || 'el siguiente mundo', lugar: M ? M.lugar : 'Campeche', dato: opciones.length ? opciones[Math.floor(Math.random() * opciones.length)] : '' };
  }

  function pantalla(sigue, forzar) {
    if (!forzar && (SIN || RUN.desdeEnciclopedia)) { sigue(); return; }
    const tipo = typeof TIPOS_RUN !== 'undefined' ? TIPOS_RUN[RUN.world] : '', st = RUN.styles[RUN.world];
    if (!st) { sigue(); return; }
    const ruptura = tipo === 'ruptura', D = datoDe(st.id);
    const titulo = ruptura ? 'La Ruptura' : D.nombre;
    STATE = 'ofrenda'; $('hud').classList.remove('on');
    showScreen(`<div class="carga" style="--dura:${DURA}ms">
      <p class="rumbo">${ruptura ? 'Las dimensiones se rompen' : `Mundo ${RUN.world + 1} · rumbo a`}</p>
      <img class="hstitch" alt="${titulo}" src="${stitched(titulo, 6)}">
      <div class="postal"><canvas id="cargaPostal"></canvas><span class="lugar">${ruptura ? 'Todos los mundos a la vez' : D.lugar}</span></div>
      <p class="dato">${ruptura ? 'Lo que les ayudó en el camino es lo único que trae Fresita. Corran.' : D.dato}</p>
      <div class="barra"><i></i><span class="fresita"><span>🍓</span></span></div>
      <p class="frase" id="cargaFrase">${FRASES[0]}</p></div>`);
    // la postal se pinta al siguiente cuadro para que la pantalla aparezca de inmediato
    requestAnimationFrame(() => { const lz = $('cargaPostal'); if (lz && typeof postalMundo === 'function') postalMundo(lz, st); });
    let n = 0; const frases = setInterval(() => { const el = $('cargaFrase'); if (!el) return clearInterval(frases); el.textContent = FRASES[++n % FRASES.length]; }, 900);
    if (typeof precargaPersonajes === 'function') try { precargaPersonajes(); } catch (e) { /* sin precarga no pasa nada */ }
    setTimeout(() => { clearInterval(frases); showScreen(''); sigue(); }, DURA + 250);
  }
  window.PANTALLA_CARGA = pantalla;
  GANCHOS.en('siguienteMundo', previo => function () { const a = arguments, yo = this; pantalla(() => previo.apply(yo, a)); });
})();
