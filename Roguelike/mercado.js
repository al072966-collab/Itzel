'use strict';
// =====================================================================
//  EL MERCADO
//  Antes de la ofrenda, entre mundo y mundo, los canisteles por fin sirven:
//  cada puesto vende algo de Campeche que ayuda en el camino. Salen tres
//  puestos al azar y se puede comprar de todos, si alcanza.
// =====================================================================
const MERCADO = (() => {
  const { ring } = MEC;
  const OFERTA = [
    { id: 'cazon', icon: 'cacao', nombre: 'Pan de cazón', precio: 12, efecto: 'Recupera un corazón.', dato: 'Tortillas con frijol y cazón, bañadas en salsa de tomate.', vale: R => R.hearts < R.maxHearts, da: R => { R.hearts++; } },
    { id: 'ciricote', icon: 'canistel', nombre: 'Dulce de ciricote', precio: 18, efecto: 'Reciben 3 corazones temporales que absorben daño antes que su vida.', dato: 'El ciricote se come en almíbar entre los dulces de Campeche.', da: R => { R.escudo = (R.escudo || 0) + 3; } },
    { id: 'jipi', icon: 'rings', nombre: 'Sombrero de jipi', precio: 15, efecto: 'Las siguientes 3 caídas al vacío no les quitan corazón.', dato: 'En Bécal se teje en cuevas: la humedad mantiene flexible la palma.', da: R => { R.jipi = (R.jipi || 0) + 3; } },
  ];
  const estilo = document.createElement('style');
  estilo.textContent = `.mercado .cards { margin-bottom:8px; } .mercado .card { width:216px; } .mercado .card .dato { font:italic 500 13.5px 'Alegreya', serif; color:#7a5a44; line-height:1.25; min-height:34px; }
    .mercado .card .efecto { font-size:15.5px; line-height:1.3; color:#5a3c2c; min-height:62px; } .mercado .card .precio { display:inline-flex; gap:5px; align-items:center; font:800 18px 'Alegreya Sans', sans-serif; color:#8a4a1a; }
    .mercado .card .precio img { height:20px; margin:0; } .mercado .card[disabled] { cursor:default; filter:grayscale(.6) brightness(.78); transform:none; } .mercado .card.comprado { opacity:1; outline:2px dashed #3f8a4a; outline-offset:-5px; } .mercado .bolsa { font:800 19px 'Alegreya Sans', sans-serif; color:#fff3dc; }
    .mercado .botonesMercado { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; } #mercadoReinicia img { height:18px; margin:0 2px -3px 4px; } #mercadoReinicia[disabled] { opacity:.55; cursor:default; }
    #extrasHUD { display:inline-flex; gap:3px; margin-left:4px; vertical-align:middle; } #extrasHUD img { height:20px; }`;
  document.head.appendChild(estilo);
  // precios a la medida de un nivel: cada canistel vale 1 y un mundo deja de 25 a 45
  const PRECIOS_MEJORAS = { heart:34, dbl:28, dash:24, mag:20, speed:18, heal:16, rebote:22, suerte:28, respiro:24, cosecha:26, dashFilo:26, dashInv:26 };
  // Un solo monedero: cada semilla de Fresita vale 5 canisteles. Se gasta primero lo de Itzel; si falta, se cambian semillas (y el cambio vuelve en canisteles).
  const bolsa = () => (RUN.coins || 0) + 5 * (RUN.semillas || 0);
  const gasta = n => {
    let falta = n - (RUN.coins || 0);
    if (falta <= 0) { RUN.coins -= n; return; }
    const semillas = Math.ceil(falta / 5); RUN.semillas = Math.max(0, (RUN.semillas || 0) - semillas); RUN.coins = semillas * 5 - falta;
  };
  const estiloBolsa = document.createElement('style');
  estiloBolsa.textContent = `.mercado .bolsa { display:flex; align-items:center; justify-content:center; gap:26px; flex-wrap:wrap; margin:8px 0 }
    .mercado .bolsaDin { display:flex; align-items:center; gap:7px; position:relative; font:800 24px 'Alegreya Sans', sans-serif; color:#fff3dc }
    .mercado .bolsaDin img { height:26px; margin:0 }
    .mercado .bolsaResta { position:absolute; left:100%; top:-6px; margin-left:8px; color:#ff8a7a; font:800 19px 'Alegreya Sans', sans-serif; opacity:0; pointer-events:none; white-space:nowrap }
    .mercado .bolsaResta.va { animation:mercadoResta 1.1s ease-out forwards }
    @keyframes mercadoResta { 0% { opacity:1; transform:translateY(0) } 100% { opacity:0; transform:translateY(-18px) } }
    .mercado .bolsaCor { display:flex; align-items:center; gap:3px }
    .mercado .bolsaCor img { height:22px; margin:0 }
    .mercado .bolsaCor img.vacio { opacity:.28; filter:grayscale(1) }`;
  document.head.appendChild(estiloBolsa);
  const mejoras = () => BLESS.map(b => ({
    id: b.id, icon: b.icon, nombre: b.name, precio: PRECIOS_MEJORAS[b.id] || 20, efecto: b.desc,
    dato: 'Mejora para el camino.', mejora: true,
    vale: R => !(b.req && !R.upg[b.req]) && !(b.once && R.taken[b.id]) && !(b.max && (R.taken[b.id] || 0) >= b.max) && !(b.id === 'heal' && R.hearts >= R.maxHearts),
    da: R => { b.apply(R); R.taken[b.id] = (R.taken[b.id] || 0) + 1; }
  }));
  const hay = R => [...OFERTA, ...mejoras()].filter(q => !(q.una && R.compras && R.compras[q.id]) && !(q.max && ((R.compras || {})[q.id] || 0) >= q.max) && (!q.vale || q.vale(R)));
  function abrir(seguir) {
    let puestos = [];
    // reparte tres puestos; al reiniciar se evita repetir los que se acaban de ver si hay de dónde escoger
    const surte = (antes = []) => {
      let lista = hay(RUN); const otros = lista.filter(q => !antes.includes(q.id)); if (otros.length >= 3) lista = otros;
      puestos = []; while (puestos.length < 3 && lista.length) puestos.push(lista.splice(Math.floor(RUN.rand() * lista.length), 1)[0]);
    };
    surte();
    STATE = 'ofrenda'; $('hud').classList.remove('on'); if (typeof ENCI !== 'undefined') ENCI.ver('entorno:mercado');
    let hechos = new Set();
    // reiniciar la tienda: 5, 10, 20, 40… por run (el costo no baja al cambiar de mundo)
    const costoReinicio = () => 5 * Math.pow(2, RUN.reinicios || 0);
    let mostrado = bolsa();   // lo que se ve en el monedero: baja poco a poco cuando se gasta
    const pinta = () => {
      showScreen(`<div class="ofrenda mercado"><img class="hstitch" alt="Tienda" src="${stitched('Tienda', 8)}"><p class="sub">Elijan las mejoras que les alcancen</p>
        <div class="cards">${puestos.map((q, i) => { const ya = hechos.has(i), caro = bolsa() < q.precio, noValido = q.vale && !q.vale(RUN); return `<button class="card panel ${ya ? 'comprado' : ''}" style="--r:${(i - 1) * 1.5}deg" data-i="${i}" ${ya || caro || noValido ? 'disabled' : ''}><img src="${ico(q.icon, 7)}"><b>${q.nombre}</b><span class="efecto">${q.efecto}</span><span class="dato">${q.dato}</span><span class="precio">${ya ? '¡Comprado!' : `<img src="${ico('canistel', 3)}" alt="">${q.precio}`}</span></button>`; }).join('')}</div>
        <div class="bolsa"><span class="bolsaCor" title="${RUN.hearts} de ${RUN.maxHearts} corazones">${Array.from({ length: RUN.maxHearts }, (_, k) => `<img class="${k < RUN.hearts ? '' : 'vacio'}" src="${ico('heart', 3)}" alt="">`).join('')}</span><span class="bolsaDin" title="Canisteles de Itzel y semillas de Fresita (cada semilla vale 5)"><img src="${ico('canistel', 3)}" alt="Canisteles"><b id="bolsaNum">${mostrado}</b><i class="bolsaResta" id="bolsaResta"></i></span></div>
        <div class="botonesMercado"><button class="patch" id="mercadoReinicia" ${bolsa() < costoReinicio() ? 'disabled' : ''}>Reiniciar tienda · <img src="${ico('canistel', 3)}" alt="">${costoReinicio()}</button>
        <button class="patch verde" id="mercadoSigue">Seguir</button></div></div>`);
      document.querySelectorAll('.mercado .card').forEach(el => el.onclick = () => {
        const i = +el.dataset.i, q = puestos[i]; if (hechos.has(i) || bolsa() < q.precio || (q.vale && !q.vale(RUN))) return;
        hechos.add(i); gasta(q.precio); RUN.gastado = (RUN.gastado || 0) + q.precio; q.da(RUN);
        if (!q.mejora) (RUN.compras = RUN.compras || {})[q.id] = ((RUN.compras || {})[q.id] || 0) + 1;
        const S = PROG.s; S.gastado = (S.gastado || 0) + q.precio; (S.compras = S.compras || {})[q.id] = true; if (typeof SONIDO !== 'undefined') SONIDO.fx('compra'); revisaLogros(); pinta();
      });
      $('mercadoReinicia').onclick = () => {
        const costo = costoReinicio(); if (bolsa() < costo) return;
        gasta(costo); RUN.gastado = (RUN.gastado || 0) + costo; RUN.reinicios = (RUN.reinicios || 0) + 1;
        const S = PROG.s; S.gastado = (S.gastado || 0) + costo;
        surte(puestos.map(q => q.id)); hechos = new Set(); if (typeof SONIDO !== 'undefined') SONIDO.fx('compra'); pinta();
      };
      // el contador baja de a poquito y sale un «−N» flotando
      { const ahora = bolsa(), antes = mostrado, num = $('bolsaNum'), resta = $('bolsaResta');
        if (ahora < antes && num) {
          resta.textContent = '−' + (antes - ahora); resta.classList.add('va');
          const t0 = performance.now(), dur = 650; const paso = () => { const k = Math.min(1, (performance.now() - t0) / dur), n = $('bolsaNum'); if (!n) return; n.textContent = Math.round(antes + (ahora - antes) * k); if (k < 1) requestAnimationFrame(paso); }; requestAnimationFrame(paso);
        }
        mostrado = ahora; }
      $('mercadoSigue').onclick = () => { MULTI.limpia(); seguir(); };
    };
    pinta();
  }
  // Una sola tienda: al continuar se elige el siguiente mundo.
  GANCHOS.en('ofrenda', () => function () { abrir(() => eligeCamino(siguienteMundo)); });
  // lo que traen comprado se ve junto a los regalos
  const ponIcono = () => {
    let el = $('extrasHUD'); if (!el) { el = document.createElement('span'); el.id = 'extrasHUD'; $('perks').after(el); }
    const k = `${RUN.escudo || 0}|${RUN.jipi || 0}`; if (el.dataset.k === k) return; el.dataset.k = k;
    el.innerHTML = `<img style="filter:sepia(1) saturate(5) hue-rotate(345deg)" src="${ico('heart', 3)}" alt="Corazón temporal" title="Corazón temporal">`.repeat(RUN.escudo || 0) + `<img src="${ico('rings', 3)}" alt="Sombrero de jipi" title="Sombrero de jipi">`.repeat(RUN.jipi || 0);
  };
  GANCHOS.en('hud', _hud => function () { _hud(); ponIcono(); });
  LOGROS.push(
    { id: 'marchante', icon: 'canistel', nombre: 'Marchante', desc: 'Compren algo en el mercado.', meta: 1, valor: s => OFERTA.filter(q => (s.compras || {})[q.id]).length },
    { id: 'desurtido', icon: 'cup', nombre: 'De todo un poco', desc: `Compren los ${OFERTA.length} productos del mercado.`, meta: OFERTA.length, valor: s => OFERTA.filter(q => (s.compras || {})[q.id]).length },
  );
  return { OFERTA, abrir };
})();
