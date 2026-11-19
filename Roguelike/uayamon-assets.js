'use strict';
// =====================================================================
//  UAYAMÓN, CON SUS ASSETS (las dos propuestas, cada una con sus piezas)
//  Piezas de tools/uayamon.py. Solo es dibujo: colisiones, bandas, válvulas,
//  vapor, enemigos y meta siguen siendo los de uayamon-propuestas.js.
//    · «La hacienda entre raíces» (uayamon_selva): carpeta uayamon-raices
//    · «El taller del henequén»  (uayamon_taller): carpeta uayamon-taller
//  Si una pieza no ha cargado se dibuja lo de antes. No toca la fábrica de
//  vapor normal (cada V solo está activo en su propio nivel).
// =====================================================================
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.vapor || !STYLE_MAP.vapor.sky) return;
  const SUBE = 96;

  function columna(c, o) {   // la columna de vapor: la misma de la mecánica, para que se lea igual en ambas propuestas
    c.save(); c.globalAlpha = Math.min(1, o.on) * .5;
    const g2 = c.createLinearGradient(0, o.y - SUBE, 0, o.y); g2.addColorStop(0, 'rgba(240,235,230,0)'); g2.addColorStop(1, 'rgba(240,235,230,.8)');
    c.fillStyle = g2; c.fillRect(o.x - 10, o.y - SUBE, 20, SUBE); c.restore();
  }
  // las válvulas y rejillas: abierta = rueda girada + brillo cálido + columna; cerrada = pieza quieta y un destello que invita a clicar
  function objetos(V, hVent) {
    const { spr } = V;
    V.obj('valvula', (c, o, f) => {
      const on = f.g.objs.some(q => q.k === 'vent' && q.grp === o.grp && q.on > 0);
      spr(c, on ? 'valvula1' : 'valvula0', o.x + 4, o.y + 1);
      if (!on) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, o.x, o.y - 24, 7, '#ffb040', .3 + Math.sin(f.t * 4) * .15); c.restore(); }
    }, 'valvula0');
    V.obj('vent', (c, o, f) => {
      spr(c, 'vent', o.x, o.y + 1);
      if (o.on > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, o.x, o.y - hVent, 9, '#ffcf80', .55 + Math.sin(f.t * 14) * .1); c.restore(); columna(c, o); }
    }, 'vent');
  }

  const hay = (V, n) => V.listo(n);
  // el telón: piezas con bruma (f_*) a poca velocidad, apoyadas en la línea de y=160
  function telon(V, c, f, lista, unit, par, y, alfa) {
    const off = (f.cam * par) % unit, base = Math.floor(f.cam * par / unit);
    c.save(); c.globalAlpha = alfa;
    for (let k = -1; k * unit - off < VW + unit; k++) {
      const idx = base + k, n = lista[Math.floor(V.h1(idx, 3) * lista.length)];
      if (hay(V, n)) V.spr(c, n, k * unit - off + unit * (.2 + V.h1(idx, 5) * .4), y, { ay: 1 });
    }
    c.restore();
  }

  // ================= LA HACIENDA ENTRE RAÍCES =================
  (function () {
    const V = vestirNivel({ id: 'vapor', nivel: 'uayamon_selva', carpeta: 'uayamon-raices', ver: 1 });
    const { spr, h1 } = V;
    V.cielo((c, f) => {
      const grd = c.createLinearGradient(0, 0, 0, VH); grd.addColorStop(0, '#80b8b0'); grd.addColorStop(1, '#e9d9aa'); c.fillStyle = grd; c.fillRect(0, 0, VW, VH);
      c.fillStyle = '#9abda6'; for (let i = 0; i < 8; i++) { const x = ((i * 83 - f.cam * .08) % 660 + 660) % 660 - 80; c.beginPath(); c.arc(x, 180, 42 + i % 3 * 7, Math.PI, 0); c.fill(); }
      telon(V, c, f, ['f_campanario', 'f_arcada', 'f_ruina', 'f_arcoV', 'f_columna', 'f_arcada'], 170, .18, 161, .92);
      c.fillStyle = '#78936b'; c.fillRect(0, 159, VW, 3);
      const off = (f.cam * .35) % 62;
      for (let x = -off - 30, i = 0; x < VW + 40; x += 62, i++) spr(c, ['agave1', 'agave2', 'agave1'][i % 3], x, 178, { k: 1.2, voltea: h1(i, 2) < .5 });
    });
    let patron = null;
    V.terreno((c, f) => {
      if (V.listo('piedra')) {   // la piedra de la lámina sobre la losa de antes, con su musgo; no cambia dónde es sólido
        if (!patron) { patron = c.createPattern(V.IMG.piedra, 'repeat'); patron.setTransform(new DOMMatrix().scale(V.TAM.piedra.w / V.IMG.piedra.naturalWidth)); }
        c.save(); allLoopsPath(c, L.loops); c.clip(); c.globalAlpha = .6; c.fillStyle = patron; c.fillRect(0, 0, L.ww, VH + 40); c.restore();
      }
      for (const o of L.deco) {
        const x = o.x, y = o.y + .5, v = h1(o.i, 7);
        if (o.k === 'T') spr(c, ['ceiba', 'palma', 'flamboyan', 'arbol'][o.i % 4], x, y, { voltea: v < .5 });
        else if (o.k === 'f') spr(c, ['agave0', 'agave1', 'vasija1', 'agave0'][o.i % 4], x, y, { voltea: v < .5 });
        else if (o.k === 'r') spr(c, ['vasija0', 'vasija2'][o.i % 2], x, y);
      }
    });
    V.look('uay_losa', (c, p) => { spr(c, 'losa', p.x + p.w / 2, p.y - 1, { w: p.w + 3, ay: .05 }); }, 'losa');
    V.fd('arana', (c, e, t, s, antes) => {
      const hoja = window.ENEMIGOS_ASSETS?.hojaForge('arana');
      if (hoja?.complete && hoja.naturalWidth && !e.avisa) { antes(c, e, t, s); return; }
      const n = e.avisa ? 3 : e.st === 'sleep' ? 0 : [0, 1, 0, 1][Math.floor((e.anim || t) * 5) % 4];
      spr(c, 'arana' + n, 0, .5);
    }, 'arana0');
    V.fd('pajaro', (c, e, t) => spr(c, 'pajaro' + [1, 0][Math.floor((e.anim || t) * 5) % 2], 0, 1), 'pajaro1');
    V.fd('calderita', (c, e, t, s, antes) => {
      const hoja = window.ENEMIGOS_ASSETS?.hojaForge('calderita');
      if (e.st === 'sleep' || ((e.avisa || e.resopla || e.flota) && hoja?.complete && hoja.naturalWidth)) {
        c.save(); if (e.avisa) c.translate(Math.sin(t * 35) * .5, 0);
        antes(c, e, t, s); c.restore(); return;
      }
      spr(c, 'calderita' + (e.avisa ? 2 : [0, 1, 0, 1][Math.floor((e.anim || t) * 4) % 4]), e.avisa ? Math.sin(t * 35) * .5 : 0, .5);
    }, 'calderita0');
    objetos(V, 8);
    V.meta('meta', { h: 32 }); V.corazon('corazon');
    window.UAYAMON_SELVA = V;
  })();

  // ================= EL TALLER DEL HENEQUÉN =================
  (function () {
    const V = vestirNivel({ id: 'vapor', nivel: 'uayamon_taller', carpeta: 'uayamon-taller', ver: 1 });
    const { spr, h1 } = V;
    V.cielo((c, f) => {
      const grd = c.createLinearGradient(0, 0, 0, VH); grd.addColorStop(0, '#e0b484'); grd.addColorStop(1, '#f0dfb3'); c.fillStyle = grd; c.fillRect(0, 0, VW, VH);
      c.fillStyle = '#c99f78'; for (let i = 0; i < 8; i++) { const x = ((i * 83 - f.cam * .08) % 660 + 660) % 660 - 80; c.beginPath(); c.arc(x, 180, 42 + i % 3 * 7, Math.PI, 0); c.fill(); }
      // el riel y los ganchos del taller, como antes
      c.fillStyle = '#6a4b35'; c.fillRect(0, 82, VW, 3); c.fillRect(0, 91, VW, 2);
      for (let i = 0; i < 6; i++) { const x = ((i * 100 - f.cam * .25) % 600 + 600) % 600 - 20; c.fillStyle = '#704c34'; c.fillRect(x, 85, 3, 25); c.fillStyle = '#b57a43'; c.fillRect(x - 4, 108, 12, 3); }
      telon(V, c, f, ['f_muro', 'f_desfibradora', 'f_arco', 'f_tendedero0', 'f_alambique', 'f_arco'], 190, .18, 161, .92);
      c.fillStyle = '#b48b64'; c.fillRect(0, 159, VW, 3);
      const off = (f.cam * .35) % 70;
      for (let x = -off - 30, i = 0; x < VW + 40; x += 70, i++) spr(c, ['agave0', 'agave1', 'agave1'][i % 3], x, 178, { k: .9, voltea: h1(i, 2) < .5 });
    });
    let patron = null;
    V.terreno((c, f) => {
      if (V.listo('piedra')) {
        if (!patron) { patron = c.createPattern(V.IMG.piedra, 'repeat'); patron.setTransform(new DOMMatrix().scale(V.TAM.piedra.w / V.IMG.piedra.naturalWidth)); }
        c.save(); allLoopsPath(c, L.loops); c.clip(); c.globalAlpha = .22; c.fillStyle = patron; c.fillRect(0, 0, L.ww, VH + 40); c.restore();
      }
      for (const o of L.deco) {
        const x = o.x, y = o.y + .5, v = h1(o.i, 7);
        if (o.k === 'f') spr(c, ['agave0', 'agave1', 'barril', 'agave0'][o.i % 4], x, y, { voltea: v < .5 });
        else if (o.k === 'r') spr(c, ['tendedero1', 'madejas', 'cajas', 'carreta', 'mesa'][o.i % 5], x, y, { voltea: v < .5 });
      }
    });
    V.look('uay_banda', (c, p, f) => {
      spr(c, p.rev > 0 ? 'bandaDer' : 'bandaIzq', p.x + p.w / 2, p.y - 1, { w: p.w + 2, ay: 0 });
      // un destello que corre en el sentido de la banda
      const dir = p.rev > 0 ? 1 : -1, ph = (((f.t * dir * 14) % 12) + 12) % 12;
      // chevrones sobre la banda: se leen de lejos y siempre apuntan hacia donde la banda lleva
      c.fillStyle = 'rgba(255,222,140,.9)';
      for (let x = 5 + ph; x < p.w - 6; x += 12) { const a = p.x + x; c.fillRect(a - dir, p.y + 1, 1, 1); c.fillRect(a, p.y + 2, 1, 1); c.fillRect(a - dir, p.y + 3, 1, 1); }
    }, 'bandaIzq');
    V.fd('arana', (c, e, t, s, antes) => {
      const hoja = window.ENEMIGOS_ASSETS?.hojaForge('arana');
      if (hoja?.complete && hoja.naturalWidth && !e.avisa) { antes(c, e, t, s); return; }
      const n = e.avisa ? 3 : e.st === 'sleep' ? 0 : [0, 1, 2, 1][Math.floor((e.anim || t) * 5) % 4];
      spr(c, 'arana' + n, 0, .5);
    }, 'arana0');
    V.fd('calderita', (c, e, t, s, antes) => {
      const hoja = window.ENEMIGOS_ASSETS?.hojaForge('calderita');
      if (hoja?.complete && hoja.naturalWidth) {
        c.save(); if (e.avisa) c.translate(Math.sin(t * 35) * .5, 0);
        antes(c, e, t, s); c.restore(); return;
      }
      spr(c, 'calderita' + (e.avisa ? 3 : [0, 1, 0, 1][Math.floor((e.anim || t) * 4) % 4]), e.avisa ? Math.sin(t * 35) * .5 : 0, .5);
    }, 'calderita0');
    V.fd('mecha', (c, e, t) => spr(c, 'mecha' + (e.avisa ? 3 : [0, 1, 2, 1][Math.floor((e.anim ?? t) * 4) % 4]), 0, .5), 'mecha0');
    V.fd('pajaro', (c, e, t) => spr(c, 'pajaro' + [0, 1, 2, 1][Math.floor((e.anim || t) * 6) % 4], 0, 1), 'pajaro0');
    objetos(V, 8);
    V.meta('meta', { h: 28 }); V.corazon('corazon');
    window.UAYAMON_TALLER = V;
  })();
})();
