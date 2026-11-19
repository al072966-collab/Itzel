'use strict';
// =====================================================================
//  VENTAJAS Y DESVENTAJAS (solo de los jefes)
//  Cada mundo tiene su terreno, y sale de su arte o de su lugar: la
//  acuarela se pinta con agua, Cayos Arcas es mar, Calakmul es selva. El
//  jefe que pelea en su terreno aguanta un golpe más y ataca más rápido (el
//  Cocodrilo en el agua); el que pelea en el de su contrario aguanta uno
//  menos y va más lento (Lorencillo contra las murallas). Los enemigos y
//  los subjefes pelean igual en todos los mundos.
//  El poder de Fresita también cuenta, pero solo en contra: su agua apaga
//  a los de fuego, su luz deslumbra a los de la noche, su viento desbalancea
//  a los que vuelan y su hackeo traba a las máquinas.
//  Lo que importa va primero: el poder de Fresita y luego, en orden, el
//  terreno del mundo. El primero que aplique decide.
// =====================================================================
const VENTAJAS = (() => {
  const { OBJ } = MEC;
  const NOMBRE = { agua: 'agua', fuego: 'fuego', piedra: 'piedra y tierra', aire: 'cielo y viento', noche: 'noche', selva: 'selva', metal: 'máquinas', frio: 'frío', luz: 'luz', papel: 'papel y tinta' };
  // [terreno, de dónde sale, por qué]
  const TIERRAS = {
    pixel: [['piedra', 'lugar', 'las murallas de Campeche']],
    ocaso: [['agua', 'lugar', 'la costa de Seybaplaya'], ['aire', 'lugar', 'el viento de la tarde']],
    acuarela: [['agua', 'arte', 'la acuarela, que se pinta con agua'], ['agua', 'lugar', 'los cenotes de Miguel Colorado']],
    paper: [['papel', 'arte', 'el papel recortado']],
    biolum: [['noche', 'lugar', 'los Petenes de noche'], ['selva', 'lugar', 'el manglar']],
    flat: [['agua', 'lugar', 'la bahía de Champotón']],
    sumie: [['agua', 'lugar', 'la Laguna de Términos'], ['papel', 'arte', 'la tinta sobre papel']],
    neon: [['luz', 'arte', 'el neón'], ['noche', 'lugar', 'el espectáculo de noche']],
    bruma: [['noche', 'arte', 'la bruma de los Chenes'], ['selva', 'lugar', 'el monte']],
    lowpoly: [['piedra', 'lugar', 'las grutas de Bolonchén']],
    codex: [['piedra', 'lugar', 'las piedras de Edzná'], ['papel', 'arte', 'el códice']],
    oleo: [['noche', 'lugar', 'la noche en el fuerte'], ['piedra', 'lugar', 'los muros del fuerte']],
    vitral: [['luz', 'arte', 'la luz del vitral'], ['piedra', 'lugar', 'la catedral']],
    cuaderno: [['papel', 'arte', 'el cuaderno a lápiz']],
    grabado: [['agua', 'lugar', 'los astilleros'], ['papel', 'arte', 'la estampa de linóleo']],
    anime: [['agua', 'lugar', 'el malecón'], ['aire', 'arte', 'el cielo de anime']],
    nouveau: [['selva', 'lugar', 'el jardín del baluarte']],
    deco: [['metal', 'lugar', 'la tramoya del teatro']],
    cyber: [['metal', 'lugar', 'las plataformas'], ['agua', 'lugar', 'el Golfo']],
    cinema: [['piedra', 'lugar', 'los mascarones de Chicanná'], ['selva', 'lugar', 'la selva del Río Bec']],
    vapor: [['metal', 'lugar', 'las máquinas de la hacienda'], ['fuego', 'lugar', 'las calderas']],
    barro: [['piedra', 'arte', 'el barro de Tepakán']],
    eco: [['piedra', 'lugar', 'la maqueta de la ciudad']],
    fuego: [['fuego', 'lugar', 'la ciudad en llamas']],
    agua: [['agua', 'lugar', 'los arrecifes de Cayos Arcas']],
    hielo: [['frio', 'lugar', 'la nevada del cuento'], ['papel', 'arte', 'el origami']],
    cielo: [['aire', 'lugar', 'el cielo sobre Edzná'], ['noche', 'arte', 'la carta celeste']],
    hollin: [['noche', 'lugar', 'la ceniza que oscurece el día']],
    bits8: [['piedra', 'lugar', 'los barrios de ladrillo']],
    bits32: [['noche', 'lugar', 'la noche en el baluarte'], ['piedra', 'lugar', 'el baluarte']],
    bits64: [['selva', 'lugar', 'la selva de Calakmul']],
    miniatura: [['selva', 'lugar', 'la hojarasca de Calakmul']],
    imprenta: [['papel', 'arte', 'las estampas de la imprenta']],
    posadas: [['frio', 'lugar', 'los carámbanos de las posadas']],
    animas: [['noche', 'lugar', 'la noche de ánimas']],
    feria: [['metal', 'lugar', 'los juegos de la feria']],
  };
  TIERRAS.uayamon_selva = TIERRAS.uayamon_taller = TIERRAS.vapor;
  // lo que el poder de Fresita debilita
  const LUZ = { tags: ['noche'], frase: 'la luz de Fresita' }, VIENTO = { tags: ['aire'], frase: 'el viento de Fresita' };
  const PODER = { agua: { tags: ['fuego'], frase: 'el agua de Fresita' }, tempano: { tags: ['fuego'], frase: 'el hielo de Fresita' }, hackeo: { tags: ['metal'], frase: 'el hackeo de Fresita' }, luz: LUZ, farol: LUZ, antorcha: LUZ, bengala: LUZ, viento: VIENTO, rafaga: VIENTO, remolino: VIENTO };
  const JEFE = {
    mythos: { es: ['noche'], fuerte: ['noche', 'aire'], debil: ['luz'], a: 'En lo oscuro y en lo alto se siente en su cielo', d: 'La luz le deslumbra el ojo de jade' },
    golem: { es: ['piedra'], fuerte: ['piedra'], debil: ['agua'], a: 'Entre piedras se siente de vuelta en Edzná', d: 'El agua le reblandece el estuco' },
    serpiente: { es: ['aire'], fuerte: ['aire'], debil: ['frio'], a: 'Con aire de sobra vuela a sus anchas', d: 'El frío le entume el vuelo' },
    jaguar: { es: ['selva'], fuerte: ['selva', 'noche'], debil: ['metal'], a: 'La selva y la noche son su casa', d: 'El ruido de las máquinas lo pone nervioso' },
    hadas: { es: ['noche'], fuerte: ['noche', 'selva'], debil: ['luz', 'metal'], a: 'De noche y entre árboles su encanto es más fuerte', d: 'La luz y las máquinas le deshacen el encanto' },
    cocodrilo: { es: ['agua'], fuerte: ['agua'], debil: ['fuego', 'frio'], a: 'En el agua nada a sus anchas', d: 'Lejos del agua se le reseca el cuero y el frío lo entume' },
    pirata: { es: ['agua'], fuerte: ['agua'], debil: ['piedra'], a: 'En el mar su barco va a toda vela', d: 'Contra las murallas no puede: para eso se levantaron' },
    chaac: { es: ['aire'], fuerte: ['agua', 'aire'], debil: ['fuego'], a: 'Con agua y viento de sobra sus nubes crecen', d: 'El fuego le evapora la lluvia' },
    camazotz: { es: ['noche'], fuerte: ['noche'], debil: ['luz'], a: 'En lo oscuro no necesita ver', d: 'La luz lo deslumbra' },
    abeja: { es: ['selva'], fuerte: ['selva'], debil: ['aire', 'frio'], a: 'Entre flores y selva el enjambre está en casa', d: 'El viento y el frío le desarman el enjambre' },
    brawbot: { es: ['metal', 'fuego'], fuerte: ['metal', 'fuego'], debil: ['agua'], a: 'Entre fierros y calderas trabaja a todo vapor', d: 'El agua le apaga las calderas' },
  };
  const tierras = id => TIERRAS[id] || [];
  function mira(es, fuerte, debil, id) {
    const P = PODER[(NIVELES[id] || {}).power];
    if (P && es.some(t => P.tags.includes(t))) return { tipo: 'debil', por: 'poder', frase: P.frase };
    for (const [tag, por, frase] of tierras(id)) {
      if (debil.includes(tag)) return { tipo: 'debil', por, frase, tag };
      if (fuerte.includes(tag)) return { tipo: 'fuerte', por, frase, tag };
    }
    return null;
  }
  const deJefe = (tipo, id) => { const J = JEFE[tipo]; return J ? mira(J.es, J.fuerte, J.debil, id) : null; };
  const POR = { lugar: 'por el lugar', arte: 'por el arte', poder: 'por el poder de Fresita' };
  const razon = v => `${POR[v.por]}: ${v.frase}`;
  const lista = tags => { const n = tags.map(t => NOMBRE[t]); return n.length > 1 ? `${n.slice(0, -1).join(', ')} y ${n[n.length - 1]}` : n[0]; };
  const poderesContra = es => [...new Set(Object.values(PODER).filter(P => es.some(t => P.tags.includes(t))).map(P => P.frase))];
  const unir = l => l.length > 1 ? `${l.slice(0, -1).join(', ')} y ${l[l.length - 1]}` : l[0];

  // ---------------- lo que dice la enciclopedia ----------------
  function filasJefe(tipo) {
    const J = JEFE[tipo]; if (!J) return [['Ventaja', 'Ninguna: no es de ningún mundo, y pelea igual en todos.']];
    const pod = poderesContra(J.es);
    return [['Ventaja', `En mundos de ${lista(J.fuerte)}: ${J.a.charAt(0).toLowerCase() + J.a.slice(1)}. Aguanta un golpe más y ataca más rápido.`], ['Desventaja', `En mundos de ${lista(J.debil)}${pod.length ? `, y contra ${unir(pod)}` : ''}: ${J.d.charAt(0).toLowerCase() + J.d.slice(1)}. Aguanta un golpe menos y ataca más lento.`]];
  }
  function filaTerreno(id) { const t = tierras(id); return t.length ? [['Terreno', [...new Set(t.map(q => NOMBRE[q[0]]))].join(', ').replace(/^./, c => c.toUpperCase())]] : []; }
  function filaVariante(tipo, id) {
    const v = deJefe(tipo, id), nombre = (STYLE_MAP[id] || {}).name || 'este mundo';
    if (!JEFE[tipo]) return [];
    if (!v) return [[`En ${nombre}`, 'Pelea parejo: ni ventaja ni desventaja.']];
    return [[`En ${nombre}`, `${v.tipo === 'fuerte' ? '▲ Tiene ventaja' : '▼ Tiene desventaja'} ${razon(v)}.`]];
  }

  // ---------------- en la pelea ----------------
  const K = { fuerte: { hp: 1, paso: 1.12, titulo: '▲ VENTAJA', col: '#ffcf5a', fondo: 'rgba(90,24,18,.92)', efecto: 'Aguanta un golpe más y ataca más rápido.' }, debil: { hp: -1, paso: .9, titulo: '▼ DESVENTAJA', col: '#8fe6ff', fondo: 'rgba(14,44,74,.92)', efecto: 'Aguanta un golpe menos y ataca más lento.' } };
  function ponJefe(o, g, def) {
    const v = deJefe(o.tipo, def && def.id); if (!v) return;
    const e = K[v.tipo]; o.ventaja = v; o.hp = o.max = Math.max(2, o.hp + e.hp); o.pasoK = e.paso;
    if (typeof PROG !== 'undefined' && typeof RUN !== 'undefined' && RUN) { (PROG.s.ventajas = PROG.s.ventajas || {})[`${o.tipo}:${def.id}:${v.tipo}`] = true; }
  }
  const hazMake = OBJ.jefe.make; OBJ.jefe.make = function (g, en, def) { hazMake.call(this, g, en, def); if (g.boss) ponJefe(g.boss, g, def); };
  const hazStep = OBJ.jefe.step; OBJ.jefe.step = function (o, g, dt) { hazStep.call(this, o, g, dt * (o.pasoK || 1)); };
  function letrero(c, cx, y, v, tipo, a) {
    const e = K[v.tipo], J = JEFE[tipo], l1 = v.tipo === 'fuerte' ? J.a : J.d, l2 = `${razon(v).replace(/^./, m => m.toUpperCase())}. ${e.efecto}`;
    c.save(); c.globalAlpha = a; c.textAlign = 'center'; c.font = 'bold 5.2px Alegreya, Georgia, serif';
    const an = Math.max(c.measureText(l2).width, c.measureText(l1).width) + 18, x = cx - an / 2;
    c.fillStyle = e.fondo; c.beginPath(); roundRect(c, x, y, an, 27, 2.5); c.fill();
    c.strokeStyle = e.col; c.lineWidth = .7; c.setLineDash([2.2, 1.5]); c.beginPath(); roundRect(c, x + 1.6, y + 1.6, an - 3.2, 23.8, 1.6); c.stroke(); c.setLineDash([]);
    c.fillStyle = e.col; c.font = 'bold 6.6px Alegreya, Georgia, serif'; c.fillText(e.titulo, cx, y + 8.6);
    c.fillStyle = '#fff6e2'; c.font = 'bold 5.2px Alegreya, Georgia, serif'; c.fillText(l1, cx, y + 15.6); c.fillStyle = 'rgba(255,246,226,.82)'; c.fillText(l2, cx, y + 22); c.restore();
  }
  const hazDraw = OBJ.jefe.draw; OBJ.jefe.draw = function (c, o, f) {
    hazDraw.call(this, c, o, f); const v = o.ventaja, g = f.g; if (!v || g.sinHudJefe || o.st === 'muere') return;
    const cx = g.cam + VW / 2, e = K[v.tipo], cb = v.tipo === 'fuerte' ? '▲ Ventaja' : '▼ Desventaja';
    c.save(); c.font = 'bold 5px Alegreya, Georgia, serif'; c.textAlign = 'left'; const an = c.measureText(cb).width + 6; c.fillStyle = e.fondo; c.fillRect(cx + 64, 10, an, 12); c.fillStyle = e.col; c.fillText(cb, cx + 67, 17.6); c.restore();
    if (o.t > .4 && o.t < 7.4) letrero(c, cx, 36, v, o.tipo, Math.min(1, (o.t - .4) * 3, (7.4 - o.t) * 2));
  };

  // ---------------- logros ----------------
  if (typeof LOGROS !== 'undefined') {
    LOGROS.push(
      { id: 'contracorriente', icon: 'wind', nombre: 'Contra la corriente', desc: 'Venzan a 3 jefes que tenían ventaja.', meta: 3, valor: s => s.jefesFuertes || 0 },
      { id: 'conocen', icon: 'rings', nombre: 'Conocen el terreno', desc: 'Venzan a 3 jefes que tenían desventaja.', meta: 3, valor: s => s.jefesDebiles || 0 },
      { id: 'susaguas', icon: 'bubble', nombre: 'En sus propias aguas', desc: 'Venzan al Cocodrilo de Términos en un mundo de agua, donde tiene ventaja.', meta: 1, valor: s => s.cocodriloAgua || 0 },
      { id: 'muralla', icon: 'jade', nombre: 'Para eso es la muralla', desc: 'Venzan a Lorencillo en un mundo de piedra, donde tiene desventaja.', meta: 1, valor: s => s.loroMuralla || 0 },
      { id: 'niconventaja', icon: 'heart', nombre: 'Ni con ventaja', desc: 'Venzan a un jefe con ventaja sin perder ni un corazón.', meta: 1, valor: s => s.ventajaSinDano || 0 },
      { id: 'cartografos', icon: 'feather', nombre: 'Cartógrafos', desc: 'Encuentren 12 ventajas o desventajas distintas de los jefes.', meta: 12, valor: s => Object.keys(s.ventajas || {}).length },
    );
    GANCHOS.en('levelDone', fin => function () {
      const b = CUR && CUR.isBoss && CUR.boss, v = b && b.ventaja;
      if (v) {
        const S = PROG.s; if (v.tipo === 'fuerte') { S.jefesFuertes = (S.jefesFuertes || 0) + 1; if (RUN.hearts >= (RUN.corazonesInicio || 0)) S.ventajaSinDano = 1; } else S.jefesDebiles = (S.jefesDebiles || 0) + 1;
        if (b.tipo === 'cocodrilo' && v.tipo === 'fuerte') S.cocodriloAgua = 1;
        if (b.tipo === 'pirata' && v.tag === 'piedra') S.loroMuralla = 1;
      }
      fin();
    });
  }
  return { TIERRAS, JEFE, deJefe, filasJefe, filaTerreno, filaVariante, razon, K };
})();
