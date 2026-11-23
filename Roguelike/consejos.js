'use strict';
// =====================================================================
//  CONSEJOS
//  Quien juega por primera vez aprende jugando: cada consejo sale una sola
//  vez, cuando hace falta (nunca dos juntos) y se guarda en PROG.d.ayudas.
// =====================================================================
(function () {
  const AYUDA = () => PROG.d.ayudas || (PROG.d.ayudas = {});
  const cerca = (g, d) => g.foes.find(e => e.st === 'ok' && Math.abs(e.x - g.p.x) < d && Math.abs(e.y - g.p.y) < 50);
  const LISTA = [
    { id: 'c_corre', si: g => g.t > 5 && !g.movio, txt: () => 'Itzel: A y D (o las flechas) para correr, Espacio para saltar.' },
    { id: 'c_poder', si: g => g.t > 9 && !g.power0 && g.def && !g.isBoss, txt: g => `Fresita: clic izquierdo usa ${MEC.POW[g.def.power].name.toLowerCase()}.` },
    { id: 'c_pisa', si: g => !g.isBoss && cerca(g, 90), txt: () => 'Itzel: cáele encima a los enemigos. No los toques de lado.' },
    { id: 'c_vida', si: g => { const e = cerca(g, 80); return e && e.max > 1 && !e.sub; }, txt: () => 'Este aguanta más de un golpe: arriba se ven sus corazones.' },
    { id: 'c_cuna', si: g => g.t > 30 && !g.isBoss && cerca(g, 110), txt: () => 'Fresita: clic derecho es la canción de cuna, y duerme a los enemigos.' },
    { id: 'c_canistel', si: () => RUN.coins >= 20, txt: () => 'Guarden los canisteles: entre mundo y mundo hay mercado.' },
    { id: 'c_semilla', si: g => !g.isBoss && RUN.hearts < RUN.maxHearts && RUN.hearts === 1, txt: () => 'Les queda un corazón. Fresita: junta semillas de luz, cada 12 curan uno.' },
    { id: 'c_sub', si: g => g.objs && g.objs.some(o => o.k === 'subjefe' && o.fase === 'pelea'), txt: () => 'Un subjefe: si lo vencen, suelta un corazón. También lo pueden rodear.' },
    { id: 'c_jefe', si: g => g.isBoss && g.boss && g.boss.st === 'ventana', txt: () => 'El núcleo está abierto: es el momento de caerle encima.' },
  ];
  let ultimo = -99;
  GANCHOS.en('stepRun', _stepRun => function (g, inp, dt, st) {
    _stepRun(g, inp, dt, st); if (!RUN || g.win || !g.p) return;
    if (matchMedia('(pointer: coarse)').matches) return;   // en el teléfono no salen los cuadros de consejo
    if (inp.dir || inp.jump) g.movio = true; if (g.fre.cool > .05) g.power0 = true;
    if (Math.floor(g.t * 2) === Math.floor((g.t - dt) * 2) || performance.now() / 1000 - ultimo < 7) return; // dos veces por segundo basta
    const A = AYUDA(), c = LISTA.find(q => !A[q.id] && q.si(g)); if (!c) return;
    A[c.id] = 1; ultimo = performance.now() / 1000; PROG.save(); if (typeof toast === 'function') toast(c.txt(g), 4600);
  });
})();
