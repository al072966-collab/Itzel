'use strict';
// =====================================================================
//  LOS ASTILLEROS DE JAINA · «Talla de madera» y «La imprenta de estampas» en un solo nivel
//  Antes eran dos versiones del mismo mundo (grabado): una de lado, con la gubia, y la
//  alterna con la estampa. Ahora es una sola: primero los astilleros (ruedas de tablas,
//  muros de madera y calaveritas) y, pasada la mitad, la imprenta (prensas, pliegos y
//  erizos de tinta). Fresita lleva las dos herramientas en el mismo clic: sobre un bloque
//  de madera es gubia; en cualquier otro lugar, estampa.
// =====================================================================
(function () {
  if (typeof NIVELES === 'undefined' || !NIVELES.grabado || !NIVELES.imprenta || typeof Constructor !== 'function' || typeof MEC === 'undefined') return;
  const A = NIVELES.grabado, B = NIVELES.imprenta, WA = A.W, WB = B.W;
  // el poder doble
  MEC.POW.gubiaEstampa = {
    name: 'Gubia y estampa', cd: .25,
    help: 'Clic sobre un bloque de madera: Fresita lo talla con la gubia y desaparece. Clic en cualquier otro lugar: imprime a Itzel en papel donde está parada; la estampa sigue pisando las prensas aunque ella se vaya (solo hay una a la vez).',
    click(g, x, y) { return MEC.POW.gubia.click(g, x, y) || MEC.POW.estampa.click(g, x, y); },
  };
  const platA = Object.assign({}, A.plat), erizos = ['erizoTinta', 'calavera'];
  const fusion = Object.assign({}, B, {
    id: 'grabado', mundo: 'grabado', jaina: true, nombre: 'Los astilleros de Jaina', lugar: 'Astilleros de Campeche e isla de Jaina',
    lema: 'Talla los bloques de madera con la gubia y estampa a Itzel en las prensas: del astillero a la imprenta, en un solo nivel.',
    dato: 'Campeche fue de las pocas ciudades de la América española que hacían sus propios barcos, y en la Isla de Jaina, en su costa, los mayas enterraban a sus élites con figurillas de barro. Este nivel mezcla los dos lugares con el estilo de grabado.',
    power: 'gubiaEstampa', foe: 'calavera', fauna: undefined, W: WA + WB,
    build(b) {
      const a = Constructor(WA), c = Constructor(WB); A.build(a); B.build(c);
      const ra = a.rows(), rc = c.rows();
      const rows = ra.map((r, i) => r.replace(/G/g, '.') + rc[i].replace(/P/g, '.'));
      b.rows = () => rows;
      for (const e of a.ents) b.ents.push(Object.assign({}, e, e.t === 'foe' ? { k: e.k || 'calavera' } : {}, e.t === 'plat' ? { o: Object.assign({}, platA, e.o || {}) } : {}));
      let n = 0;
      for (const e of c.ents) {
        const s = Object.assign({}, e);
        for (const k of ['x', 'x0', 'x1']) if (typeof s[k] === 'number') s[k] += WA;
        if (s.t === 'foe') s.k = e.k || erizos[n++ % erizos.length];
        b.ents.push(s);
      }
    },
  });
  // una sola versión: las dos claves apuntan al mismo nivel y el mundo ya no tiene alterno
  NIVELES.grabado = fusion; NIVELES.imprenta = fusion;
  if (typeof NIVELES_ALT !== 'undefined') NIVELES_ALT.grabado = (NIVELES_ALT.grabado || []).filter(id => id !== 'imprenta');
  if (typeof PIEZAS !== 'undefined') PIEZAS.REGLAS.grabado = Object.assign(PIEZAS.REGLAS.grabado || {}, { fijo: true });
})();
