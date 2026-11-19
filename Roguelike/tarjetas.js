'use strict';
// =====================================================================
//  TARJETAS DE DESCUBRIMIENTO
//  Cuando la enciclopedia anota algo nuevo durante la partida, sale una
//  tarjetita en la esquina con una descripción breve (la larga está en el
//  libro). Enemigos, objetos y solidos se anotan cuando de verdad entran
//  a la pantalla, no al empezar el nivel. Salen de una en una, con aire
//  entre ellas y pocas por mundo; las demás se quedan en el libro y al
//  terminar el mundo se avisa cuántas fueron. Se apagan en Opciones.
// =====================================================================
const TARJETAS = (() => {
  const caja = document.createElement('div'); caja.id = 'tarjetas'; document.body.appendChild(caja);
  const cola = []; let viva = null, mundo = -1, salieron = 0, guardadas = 0;
  const POR_MUNDO = 3, DURA = 5000, AIRE = 9000, VENCE = 14000, VENCE_SUELTA = 60000;
  // datos y lugares: no vienen de algo que esté a la vista, así que no deben salir en plena acción
  const suelta = id => id.startsWith('campeche:') || id.startsWith('mundo:');
  let sinPeligro = 0, calmaVista = false;
  function tranquilo(ahora) {
    const g = CUR; if (!g || !g.p || g.modo || g.isBoss || g.isPrologo || !g.foes) return false;
    const p = g.p, pelea = (g.objs || []).some(o => o.k === 'subjefe' && o.fase === 'pelea');
    const cerca = g.foes.some(e => e.st !== 'gone' && Math.abs(e.x - p.x) < 170 && Math.abs(e.y - p.y) < 90);
    const mal = pelea || cerca || p.inv > 0 || !p.on || (g.projs || []).length > 0;
    // hace falta un rato seguido sin peligro (y parado en el piso) antes de que salga
    if (mal) { sinPeligro = 0; calmaVista = false; return false; }
    if (!sinPeligro) sinPeligro = ahora;
    return ahora - sinPeligro > 1000;
  }
  const frase = s => { const m = String(s || '').match(/^.*?[.!?](\s|$)/); return (m ? m[0] : String(s || '')).trim(); };
  function ficha(id) {
    const [tipo, k] = [id.slice(0, id.indexOf(':')), id.slice(id.indexOf(':') + 1)];
    if (tipo === 'enemigo' && ENEMIGO_INFO[k]) return { cat: 'Bicho o enemigo nuevo', titulo: ENEMIGO_INFO[k][0], breve: frase(ENEMIGO_INFO[k][1]), icono: 'speed', foe: k };
    if (tipo === 'entorno' && ENTORNO[k]) return { cat: 'Cosa nueva', titulo: ENTORNO[k].nombre, breve: frase(ENTORNO[k].texto), icono: 'cacao' };
    if (tipo === 'poder' && MEC.POW[k]) return { cat: 'Poder de Fresita', titulo: MEC.POW[k].name, breve: frase(MEC.POW[k].help), icono: 'bubble' };
    if (tipo === 'jefe' && JEFES[k]) return { cat: 'Jefe', titulo: JEFES[k].nombre, breve: frase(JEFES[k].lema), icono: 'moon' };
    if (tipo === 'mundo' && NIVELES[k] && NIVELES[k].lugar) return { cat: 'Lugar de Campeche', titulo: NIVELES[k].lugar, breve: frase(NIVELES[k].dato), icono: 'jade' };
    if (tipo === 'anomalia') { const [e, m] = k.split(':'); if (ENEMIGO_INFO[e] && STYLE_MAP[m]) return { cat: '¡Anomalía atrapada!', titulo: ENEMIGO_INFO[e][0], breve: `Se coló en ${STYLE_MAP[m].name}. Ya quedó en su ficha del libro.`, icono: 'rings', foe: e }; }
    if (tipo === 'campeche') { const h = CAMPECHE_SABER.de(id); if (h) return { cat: `Campeche · ${h.tema}`, titulo: h.titulo, breve: h.breve, icono: 'flor', foto: (CAMPECHE_FOTOS[id] || [])[0] }; }
    return null;
  }
  // el retrato del bicho, dibujado con el mismo código que en el juego
  function retrato(k) {
    const cv = document.createElement('canvas'); cv.width = 92; cv.height = 72; const c = cv.getContext('2d'), d = MEC.FD[k];
    if (!d) return null;
    try { const sk = (CUR && CUR.def && CUR.def.skin || MEC.DEFAULT_SKIN).foe; c.translate(46, 62); c.scale(2.1, 2.1); d(c, { st: 'ok', anim: 0, t: 0, tt: 0, dir: 1, w: 14, h: 12, vy: 0, on: true }, 1, sk); return cv; } catch (e) { return null; }
  }
  function muestra() {
    if (TURNO.mundo !== mundo) { mundo = TURNO.mundo; salieron = 0; }
    // lo que ya pasó de largo no se enseña tarde: se queda anotado en el libro
    const ahora = performance.now();
    for (let i = cola.length - 1; i >= 0; i--) if (ahora - cola[i].desde > (suelta(cola[i].id) ? VENCE_SUELTA : VENCE) || salieron >= POR_MUNDO) { cola.splice(i, 1); guardadas++; }
    if (STATE !== 'play' && guardadas) { AVISOS.alFinal('Enciclopedia', guardadas === 1 ? 'Una cosa nueva anotada' : `${guardadas} cosas nuevas anotadas`, 'feather'); guardadas = 0; }
    if (viva || !cola.length || STATE !== 'play' || !TURNO.libre() || !opcion('tarjetas', true)) return;
    // lo que no es de algo que se ve en pantalla (datos de Campeche, el lugar) espera a un momento tranquilo
    const i = cola.findIndex(q => q.desde <= ahora && (!suelta(q.id) || tranquilo(ahora)));
    if (i < 0) return;
    const q = cola.splice(i, 1)[0];
    const f = ficha(q.id); if (!f) return muestra();
    const el = document.createElement('div'); el.className = 'tarjeta';
    el.innerHTML = `<div class="t-foto"></div><div class="t-txt"><small>${f.cat}</small><b>${f.titulo}</b><span>${f.breve}</span><em>Anotado en la enciclopedia</em></div>`;
    const foto = el.querySelector('.t-foto'), r = f.foe && retrato(f.foe);
    if (f.foto) { const i = new Image(); i.className = 'real'; i.src = 'fotos/saber/' + f.foto.a; foto.appendChild(i); }
    else if (r) foto.appendChild(r); else { const i = new Image(); i.src = ico(f.icono, 6); foto.appendChild(i); }
    caja.appendChild(el); viva = el;
    salieron++; TURNO.ocupa(DURA + AIRE); sinPeligro = 0;
    setTimeout(() => el.classList.add('sale'), DURA);
    setTimeout(() => { el.remove(); if (viva === el) viva = null; }, DURA + 600);
  }
  ENCI.alNuevo = (id, espera = 0) => { if (ficha(id)) cola.push({ id, desde: performance.now() + espera }); };

  // lo que está a la vista se anota
  function mira() {
    if (STATE !== 'play' || !CUR || CUR.modo || !CUR.foes) return;
    const a = CUR.cam - 8, b = CUR.cam + VW + 8, dentro = x => x > a && x < b;
    for (const e of CUR.foes) if (e.st !== 'gone' && dentro(e.x)) ENCI.ver('enemigo:' + e.k);
    for (const lista of [CUR.objs, CUR.solids]) for (const o of lista || []) { const k = ENCI.ALIAS[o.k]; if (k && dentro(o.x ?? o.x0 ?? a - 1)) ENCI.ver('entorno:' + k); }
    if ((CUR.zones || []).length) ENCI.ver('entorno:zona');
  }
  setInterval(() => { mira(); muestra(); }, 500);

  // un dato de Campeche: el doblón nuevo lo descubre; la primera visita a un mundo regala uno
  function descubre(def) {
    if (!def) return; const h = CAMPECHE_SABER.siguiente(def, ENCI.tiene); if (h) ENCI.ver('campeche:' + h.id);
  }
  const previo = ENCI.alNuevo;
  ENCI.alNuevo = (id, espera) => { previo(id, id.startsWith('mundo:') ? 5000 : espera); if (id.startsWith('mundo:')) { const k = id.slice(6); setTimeout(() => { if (STATE === 'play' && CUR && CUR.def && CUR.def.id === k) descubre(CUR.def); }, 15000); } };
  return { descubre, cola };
})();
