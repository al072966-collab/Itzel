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
    { id: 'cazon', icon: 'cacao', nombre: 'Pan de cazón', precio: 25, efecto: 'Recupera un corazón.', dato: 'Tortillas con frijol y cazón, bañadas en salsa de tomate.', vale: R => R.hearts < R.maxHearts, da: R => { R.hearts++; } },
    { id: 'chaya', icon: 'jade', nombre: 'Agua de chaya', precio: 70, efecto: 'Un corazón máximo más, y ya lleno.', dato: 'Agua de la hoja de chaya, de la cocina del mercado.', da: R => { R.maxHearts++; R.hearts++; } },
    { id: 'ciricote', icon: 'canistel', nombre: 'Dulce de ciricote', precio: 35, efecto: 'El siguiente golpe no les quita corazón.', dato: 'El ciricote se come en almíbar entre los dulces de Campeche.', da: R => { R.escudo = (R.escudo || 0) + 1; } },
    { id: 'jipi', icon: 'rings', nombre: 'Sombrero de jipi', precio: 30, efecto: 'La siguiente caída al vacío no les quita corazón.', dato: 'En Bécal se teje en cuevas: la humedad mantiene flexible la palma.', da: R => { R.jipi = (R.jipi || 0) + 1; } },
    { id: 'miel', icon: 'flor', nombre: 'Miel de melipona', precio: 40, efecto: 'En toda la partida, las burbujas de curación salen más seguido.', dato: 'Los mayas han cuidado a la abeja Xunán Kab por siglos.', una: true, da: R => { R.upg.miel = 1; } },
    { id: 'silbato', icon: 'wind', nombre: 'Silbato de Tepakán', precio: 30, efecto: 'La canción de cuna de Fresita llega más lejos.', dato: 'Silbatos de barro de colores, famosos en Tepakán.', max: 2, da: R => { R.upg.lullaby += .4; } },
  ];
  const estilo = document.createElement('style');
  estilo.textContent = `.mercado .cards { margin-bottom:8px; } .mercado .card { width:216px; } .mercado .card .dato { font:italic 500 13.5px 'Alegreya', serif; color:#7a5a44; line-height:1.25; min-height:34px; }
    .mercado .card .efecto { font-size:15.5px; line-height:1.3; color:#5a3c2c; min-height:62px; } .mercado .card .precio { display:inline-flex; gap:5px; align-items:center; font:800 18px 'Alegreya Sans', sans-serif; color:#8a4a1a; }
    .mercado .card .precio img { height:20px; margin:0; } .mercado .card[disabled] { cursor:default; filter:grayscale(.6) brightness(.78); transform:none; } .mercado .card.comprado { opacity:1; outline:2px dashed #3f8a4a; outline-offset:-5px; } .mercado .bolsa { font:800 19px 'Alegreya Sans', sans-serif; color:#fff3dc; }
    #extrasHUD { display:inline-flex; gap:3px; margin-left:4px; vertical-align:middle; } #extrasHUD img { height:20px; }`;
  document.head.appendChild(estilo);
  const PRECIOS_MEJORAS = { heart:70, dbl:55, dash:50, bub:35, life:30, mag:45, lull:35, speed:40, heal:40, anom:40 };
  const mejoras = () => BLESS.map(b => ({
    id: b.id, icon: b.icon, nombre: b.name, precio: PRECIOS_MEJORAS[b.id] || 40, efecto: b.desc,
    dato: 'Mejora para el camino.', mejora: true,
    vale: R => !(b.once && R.taken[b.id]) && !(b.max && (R.taken[b.id] || 0) >= b.max) && !(b.id === 'heal' && R.hearts >= R.maxHearts),
    da: R => { b.apply(R); R.taken[b.id] = (R.taken[b.id] || 0) + 1; }
  }));
  const hay = R => [...OFERTA, ...mejoras()].filter(q => !(q.una && R.compras && R.compras[q.id]) && !(q.max && ((R.compras || {})[q.id] || 0) >= q.max) && (!q.vale || q.vale(R)));
  function abrir(seguir) {
    const lista = hay(RUN), puestos = []; while (puestos.length < 3 && lista.length) puestos.push(lista.splice(Math.floor(RUN.rand() * lista.length), 1)[0]);
    STATE = 'ofrenda'; $('hud').classList.remove('on'); if (typeof ENCI !== 'undefined') ENCI.ver('entorno:mercado');
    const hechos = new Set();
    const pinta = () => {
      showScreen(`<div class="ofrenda mercado"><img class="hstitch" alt="Tienda" src="${stitched('Tienda', 8)}"><p class="sub">Elijan las mejoras que les alcancen</p>
        <div class="cards">${puestos.map((q, i) => { const ya = hechos.has(i), caro = RUN.coins < q.precio, noValido = q.vale && !q.vale(RUN); return `<button class="card panel ${ya ? 'comprado' : ''}" style="--r:${(i - 1) * 1.5}deg" data-i="${i}" ${ya || caro || noValido ? 'disabled' : ''}><img src="${ico(q.icon, 7)}"><b>${q.nombre}</b><span class="efecto">${q.efecto}</span><span class="dato">${q.dato}</span><span class="precio">${ya ? '¡Comprado!' : `<img src="${ico('canistel', 3)}" alt="">${q.precio}`}</span></button>`; }).join('')}</div>
        <p class="bolsa">Les quedan ${RUN.coins} canisteles · ${RUN.hearts} de ${RUN.maxHearts} corazones</p>
        <button class="patch verde" id="mercadoSigue">Seguir</button></div>`);
      document.querySelectorAll('.mercado .card').forEach(el => el.onclick = () => {
        const i = +el.dataset.i, q = puestos[i]; if (hechos.has(i) || RUN.coins < q.precio || (q.vale && !q.vale(RUN))) return;
        hechos.add(i); RUN.coins -= q.precio; RUN.gastado = (RUN.gastado || 0) + q.precio; q.da(RUN);
        if (!q.mejora) (RUN.compras = RUN.compras || {})[q.id] = ((RUN.compras || {})[q.id] || 0) + 1;
        const S = PROG.s; S.gastado = (S.gastado || 0) + q.precio; (S.compras = S.compras || {})[q.id] = true; if (typeof SONIDO !== 'undefined') SONIDO.fx('compra'); revisaLogros(); pinta();
      });
      $('mercadoSigue').onclick = () => { MULTI.limpia(); seguir(); };
    };
    pinta();
  }
  // Una sola tienda: al continuar se elige el siguiente mundo.
  GANCHOS.en('ofrenda', () => function () { abrir(() => eligeCamino(siguienteMundo)); });
  // el dulce de ciricote aguanta un golpe
  GANCHOS.en('hurt', _hurt => function (g, d) {
    const p = g.p; if (!RUN || !(RUN.escudo > 0) || p.inv > 0 || g.win) return _hurt(g, d);
    RUN.escudo--; p.inv = difi().inv; p.vx = d * 170; p.vy = -230; p.on = false; g.shake = .2; ring(g, p.x, p.y - 8, '#ffe07a', 22, .5);
    spawn(g, 14, p.x, p.y - 8, { v: 80, life: .5, s: 2, k: 'spark', cols: ['#ffe07a', '#ffffff'], g: 60 }); toast('El dulce de ciricote aguantó el golpe');
  });
  // lo que traen comprado se ve junto a los regalos
  const ponIcono = () => {
    let el = $('extrasHUD'); if (!el) { el = document.createElement('span'); el.id = 'extrasHUD'; $('perks').after(el); }
    const k = `${RUN.escudo || 0}|${RUN.jipi || 0}`; if (el.dataset.k === k) return; el.dataset.k = k;
    el.innerHTML = `<img src="${ico('canistel', 3)}" alt="Dulce de ciricote" title="Dulce de ciricote">`.repeat(RUN.escudo || 0) + `<img src="${ico('rings', 3)}" alt="Sombrero de jipi" title="Sombrero de jipi">`.repeat(RUN.jipi || 0);
  };
  GANCHOS.en('hud', _hud => function () { _hud(); ponIcono(); });
  LOGROS.push(
    { id: 'marchante', icon: 'canistel', nombre: 'Marchante', desc: 'Compren algo en el mercado.', meta: 1, valor: s => OFERTA.filter(q => (s.compras || {})[q.id]).length },
    { id: 'desurtido', icon: 'cup', nombre: 'De todo un poco', desc: `Compren los ${OFERTA.length} productos del mercado.`, meta: OFERTA.length, valor: s => OFERTA.filter(q => (s.compras || {})[q.id]).length },
  );
  return { OFERTA, abrir };
})();
