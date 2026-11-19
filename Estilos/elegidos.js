'use strict';
// =====================================================================
//  DISEÑOS (SKINS) DE CADA ESTILO
//  En las páginas se alternan cada pocos segundos; en el juego sale uno
//  al azar por mundo (o el favorito del jugador). Ya no cambian con el daño.
// =====================================================================
// Los diseños de cada estilo son los de VARIANTES menos los que David borró para siempre
// (disenos-borrados.js, lo escribe disenos.html). En las partidas sale uno al azar de estos
// y, cuando el jugador ya los vio todos, puede escoger su favorito (menu.js).
const BORRADOS_SET = new Set(typeof DISENOS_BORRADOS !== 'undefined' ? DISENOS_BORRADOS : []);
function disenosDe(id) { return ((typeof VARIANTES !== 'undefined' && VARIANTES[id]) || []).filter(d => !BORRADOS_SET.has(id + ':' + d.nombre)); }
const ELEGIDOS = {};
for (const id of Object.keys(typeof VARIANTES !== 'undefined' ? VARIANTES : {})) { const l = disenosDe(id).map(d => d.nombre); ELEGIDOS[id] = l.length ? l : ['El de ahora']; }
// pone en el estilo el diseño número k de los elegidos (da la vuelta si se pasa)
function aplicaElegido(id, k = 0) {
  const lista = ELEGIDOS[id], vs = typeof VARIANTES !== 'undefined' && VARIANTES[id], st = STYLE_MAP[id];
  if (!lista || !lista.length || !vs || !st) return null;
  const nombre = lista[((k % lista.length) + lista.length) % lista.length], d = vs.find(d => d.nombre === nombre);
  if (!d) return null;
  // Game Boy y CGA dibujan con el estilo base, así que el diseño va en una copia de la base
  if (st.base) { if (!d.itzel) return nombre; const b0 = STYLE_MAP[st.base], bid = b0.id + '~elegido'; STYLE_MAP[bid] = Object.assign(Object.create(b0), { id: bid, player: d.itzel, fresita: d.fresita || b0.fresita }); st.base = bid; return nombre; }
  if (d.itzel) st.player = d.itzel; if (d.fresita) st.fresita = d.fresita;
  return nombre;
}
for (const id of Object.keys(ELEGIDOS)) aplicaElegido(id, 0);
