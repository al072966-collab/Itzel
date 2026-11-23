'use strict';
// =====================================================================
//  ARENAS DE JEFE POR MUNDO
//  La pelea se gana con la mecánica del mundo, no con plataformas regaladas:
//   · mundos de ALCANCE (el poder hace plataformas o sube a Itzel): no hay
//     plataformas libres y el suelo tiene huecos; para llegar al núcleo hay
//     que escalar o cruzar con Fresita (bloques, nenúfares, líneas, viento…);
//   · mundos de CONTROL: los huecos se cruzan con la pieza del mundo
//     (glifos, bloques A y B, neón al pulso, losas que solo se ven con luz,
//     brasas que hay que enfriar, mar helado, losas fantasmales…).
//  Caer en un hueco quita un corazón y regresa a Itzel a la orilla.
//  Las islas altas solo salen con los jefes que las usan (jaguar y hadas).
// =====================================================================
(function () {
  // suelo de 1 a 26 con huecos; paredes a los lados
  function suelo(b, huecos) {
    b.g(0, 0, 0).g(27, 27, 0);
    for (let x = 1; x <= 26; x++) if (!huecos.some(([a, z]) => x >= a && x <= z)) b.g(x, x);
    return b;
  }
  const H2 = [[8, 10], [17, 19]], H4 = [[8, 11], [16, 19]], ANCHO = [[9, 18]];
  // cada poder arma su arena (b: constructor; d: nivel del mundo)
  const ARENA = {
    // ---------------- ALCANCE ----------------
    bloque: b => suelo(b, H2),                                                   // bloques para cruzar y para subir
    nenufar: b => suelo(b, [[10, 17]]),                                         // un estanque: nenúfares que se hunden
    avion: b => suelo(b, [[7, 9], [18, 20]]).isl(12, 15, 6),                    // repisa alta: solo en avión
    nube: b => suelo(b, [[9, 10], [17, 18]]).blk(12, 5, 1, 6).blk(15, 5, 1, 6),     // columnas que se trepan con tinta
    cristal: b => suelo(b, [[11, 15]]).blk(1, 9, 4, 2).blk(23, 9, 4, 2),         // escalones a los lados; pilares para el resto (barranco de 5: desde un pilar en la orilla se cruza con holgura)
    lapiz: b => suelo(b, ANCHO),                                                // un barranco: hay que dibujar el puente
    resorte: b => suelo(b, [[10, 11], [16, 17]]),
    semilla: b => suelo(b, [[12, 15]]),
    viento: b => suelo(b, [[9, 11], [16, 18]]),
    remolino: b => suelo(b, H2),
    rafaga: b => suelo(b, ANCHO),                                               // la ráfaga avienta a Itzel al otro lado
    cargar: b => suelo(b, H4),
    portal: b => suelo(b, ANCHO),
    ladrillo: b => suelo(b, H2).c(8, 10, 9).c(17, 19, 9).c(12, 15, 6).c(9, 9, 6).c(18, 18, 6).o('rebrota', 0, 0),   // los canisteles que Itzel se come vuelven a brotar
    // tres pilares de plastilina (orillas y centro) para subir a la altura del núcleo, esté donde esté el jefe;
    // antes había dos puentes sobre huecos de 2 que se brincaban sin ellos, y el de la derecha nacía pegado a la tierra
    moldear: b => suelo(b, [[8, 9], [18, 19]]).o('clay', 4, 11, { axis: 'y', w: 2, min: .6, max: 6 }).o('clay', 13, 11, { axis: 'y', w: 2, min: .6, max: 6 }).o('clay', 22, 11, { axis: 'y', w: 2, min: .6, max: 6 }),
    constelacion: b => suelo(b, ANCHO).o('estrella', 6, 7).o('estrella', 10, 5).o('estrella', 13, 3).o('estrella', 17, 5).o('estrella', 21, 7),
    // ---------------- CONTROL ----------------
    luz: b => suelo(b, H2).p(8, 10, 3).p(17, 10, 3).p(12, 7, 3),                // raíces que solo se ven con la luz de Fresita
    farol: b => suelo(b, H2).p(8, 10, 3).p(17, 10, 3).p(12, 7, 3),              // piedras en la niebla
    pulso: b => suelo(b, H2).p(8, 10, 3, { grp: 'A' }).p(17, 10, 3, { grp: 'B' }).p(12, 8, 3, { grp: 'A' }),
    glifo: b => suelo(b, H2).s('glyph', 8, 11, 3, 1, { grp: 0 }).s('glyph', 17, 11, 3, 1, { grp: 1, on: false }),
    interruptor: b => suelo(b, H2).s('switch', 8, 11, 3, 1, { grp: 'A' }).s('switch', 17, 11, 3, 1, { grp: 'B' }),
    vidrio: b => suelo(b, H4).e(5).e(22),                                      // los enemigos hechos vidrio son el puente
    gubia: b => suelo(b, []).s('wood', 9, 6, 1, 5).s('wood', 18, 6, 1, 5),       // muros de madera que hay que tallar
    reloj: b => suelo(b, H4).p(8, 10, 3).p(16, 10, 3),                          // engranes rápidos: el reloj los frena
    hackeo: b => suelo(b, ANCHO).p(9, 10, 4, { v: 45 }).p(15, 10, 4, { v: -45 }),// bandas que tiran al hueco
    eco: b => suelo(b, [[9, 12], [16, 19]]).o('plate', 7, 0, { grp: 0, n: 'I' }).s('ecobridge', 9, 11, 4, 1, { grp: 0, on: false }).o('plate', 21, 0, { grp: 1, n: 'II' }).s('ecobridge', 16, 11, 4, 1, { grp: 1, on: false }),
    agua: b => suelo(b, H4).o('brasas', 8, 13, { x2: 11 }).o('brasas', 16, 13, { x2: 19 }).o('geiser', 13),
    burbuja: b => suelo(b, []).o('water', 0, 2, { x2: 27 }).o('respiro', 2).o('respiro', 25).o('respiro', 13),
    tempano: b => suelo(b, [[7, 10], [17, 20]]).o('mar', 7, 12, { x2: 10 }).o('mar', 17, 12, { x2: 20 }),
    bengala: b => suelo(b, [[9, 10], [17, 18]]).p(9, 9, 2, { k: 'static', look: 'tablon' }).p(17, 9, 2, { k: 'static', look: 'tablon' }),
    antorcha: b => suelo(b, H4).o('antorcha', 7).o('antorcha', 20).p(8, 10, 4, { k: 'ghost', look: 'espectral' }).p(16, 10, 4, { k: 'ghost', look: 'espectral' }),
  };
  // en la arena de ladrillos los canisteles son la escalera: si Itzel se los come, a los 4 s vuelven a brotar
  // en su lugar (ya sin valor de moneda, para que la pelea no sea una mina de canisteles)
  MEC.OBJ.rebrota = {
    make(g) { for (const c of g.coins) { c.x0 = c.x; c.y0 = c.y; } g.objs.push({ k: 'rebrota' }); },
    step(o, g, dt) {
      for (const c of g.coins) {
        const ladrillo = g.objs.some(q => q.k === 'ladrilloctl' && q.c === c && !q.dead);
        if (!c.got || ladrillo) { c.rb = 0; continue; }
        c.rb = (c.rb || 0) + dt;
        if (c.rb > 4) { c.got = false; c.rb = 0; c.rebrote = true; c.x = c.x0; c.y = c.y0; spawn(g, 10, c.x, c.y, { v: 40, life: .5, s: 1.6, k: 'spark', cols: ['#ffe680', '#ffffff'], g: -20 }); }
      }
    },
  };
  const PREDETERMINADA =b => suelo(b, [[9, 10], [17, 18]]).p(9, 9, 2).p(17, 9, 2);

  construirArena = function (def, tipo) {
    const b = Constructor(28), hacer = ARENA[def.power] || PREDETERMINADA;
    hacer(b, def);
    if (def.power === 'burbuja' || def.id === 'agua') { if (!ARENA[def.power]) b.o('water', 0, 2, { x2: 27 }).o('respiro', 2).o('respiro', 25); }
    // donde se sube el jaguar y donde va la jaula de Fresita: plataformas que se atraviesan desde abajo
    // (si fueran tierra, en arenas con huecos junto a ellas Itzel se daba de topes al brincar el hueco y caía)
    // (con el look del mundo, abiertas y encendidas; si el look del mundo es de una pieza que hace algo —resorte, banda— se usa otro)
    if (tipo === 'jaguar' || tipo === 'hadas') { const look = { spring: 'petal', belt: 'neon' }[(def.plat || {}).look], isla = Object.assign({ k: 'static', open: 1, glow: 1 }, look ? { look } : {}); b.p(4, 7, 4, isla).p(20, 7, 4, isla); }
    b.P(3);
    b.o('jefe', 13, 0, { tipo });
    return { rows: b.rows(), ents: b.ents };
  };
  window.ARENAS = ARENA;
})();
