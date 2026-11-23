'use strict';
// =====================================================================
//  RUPTURA · LA CARRERA ENTRE DIMENSIONES
//  Mientras corren delante de la grieta, se abren rasgaduras delante de
//  Itzel y por ellas caen criaturas de TODOS los mundos de la partida (no
//  solo del cuarto en que van). Primero se ve la rasgadura y el nombre del
//  mundo del que vienen; luego cae el bicho. Hay que esquivarlos o pisarlos
//  sin dejar de correr, con el poder de Fresita del cuarto. Pedido de David
//  (2026-11-19): «que corras mientras enemigos de los 3 mundos aparecen».
//  Probar: ?jefe=ruptura (el prólogo es esta carrera).
// =====================================================================
(() => {
  const { OBJ, FOE, FD } = MEC;
  if (!OBJ.grieta) return;
  // los que no sirven fuera de su mundo (agua, ritmo, techo, lava…) o nacen pegados a un objeto
  const NO = new Set(['morena', 'pezloro', 'mojarra', 'botete', 'koi', 'medusa', 'foca', 'carcoma', 'aplastador', 'carambano', 'bocina', 'bailarin', 'magma', 'cometa', 'bestia', 'invasor', 'fantasma']);
  const AEREOS = new Set(['fly', 'swoop', 'orbit', 'drone']);
  const FLOTAN = new Set(['soplo', 'tucan', 'pajaro', 'aranaCeniza', 'silbato', 'charran', 'bejuco', 'carpintero', 'cuervo', 'polilla', 'zancudo', 'libelula']);
  const sirve = k => FOE[k] && FD[k] && !NO.has(k) && !(OBJ[k] && OBJ[k].make);
  const vuela = k => AEREOS.has(FOE[k].beh) || FLOTAN.has(k);
  const COLORES = ['#ff3ad8', '#3ad8ff', '#ffe07a'];

  // fauna de cada mundo de la partida
  function faunas(ids) {
    return ids.map(id => { const d = NIVELES[id] || {}; return { id, lista: [...new Set([...(d.fauna || []), d.foe].filter(Boolean))].filter(sirve) }; }).filter(m => m.lista.length);
  }
  // piso más cercano debajo de (x, y) dentro de la vista
  function piso(g, x, y) {
    const tope = (g.camY || 0) + VH + 40;
    if (SOLID(x, y)) return null;               // nació dentro de una pared
    for (let yy = y; yy < tope; yy += 2) if (SOLID(x, yy)) return borde(x, yy, 'arriba');
    return null;
  }

  const paso0 = OBJ.grieta.step, pinta0 = OBJ.grieta.draw;
  OBJ.grieta.step = function (o, g, dt) {
    paso0.call(this, o, g, dt);
    if (g.win || o.espera > 0) return;
    const C = o.carrera || (o.carrera = { t: 1.2, abiertas: [], suyos: [], mundos: faunas(o.ids), n: 0 });
    if (!C.mundos.length) return;
    // los que se quedaron detrás de la grieta se los traga el vacío
    for (const e of C.suyos) if (g.foes.includes(e) && e.x < o.x - 4 && e.st !== 'gone') { e.st = 'gone'; e.tt = 1; spawn(g, 8, e.x, e.y - 6, { v: 50, life: .4, s: 1.6, k: 'spark', cols: COLORES }); }
    C.suyos = C.suyos.filter(e => g.foes.includes(e) && e.st !== 'gone');
    // cada vez más seguido conforme avanzan por los cuartos
    const avance = clamp((g.p.x / T - PAD - o.ini) / (28 * o.ids.length), 0, 1);
    C.t -= dt;
    if (C.t <= 0 && C.suyos.length + C.abiertas.length < 4) {
      C.t = 2.1 - avance * .8 + Math.random() * .6;
      // turnándose: un mundo distinto cada vez, para que se note que vienen de los tres
      const m = C.mundos[C.n++ % C.mundos.length], k = m.lista[Math.floor(Math.random() * m.lista.length)];
      const p = g.p, x = clamp(p.x + 85 + Math.random() * 90, g.cam + 40, g.cam + VW - 24);
      let y;
      if (vuela(k)) { y = clamp(p.y - 14 - Math.random() * 20, (g.camY || 0) + 30, (g.camY || 0) + VH - 30); if (SOLID(x, y) || SOLID(x, y - 10)) return; }
      else { y = piso(g, x, Math.max((g.camY || 0) + 10, p.y - 70)); if (y === null) return; }
      C.abiertas.push({ k, mundo: m.id, x, y, t: 0, aire: vuela(k) });
    }
    for (const a of C.abiertas) {
      a.t += dt;
      if (a.t >= .75 && !a.hecho) {
        a.hecho = true;
        const e = MEC.mkFoe(a.k, a.x, a.y); e.dir = g.p.x < e.x ? -1 : 1; e.deRuptura = a.mundo;
        g.foes.push(e); C.suyos.push(e);
        spawn(g, 14, a.x, a.y - 10, { v: 80, life: .5, s: 1.8, k: 'spark', cols: COLORES, g: 30 });
        if (typeof ENCI !== 'undefined') ENCI.ver('enemigo:' + a.k);
      }
    }
    C.abiertas = C.abiertas.filter(a => a.t < 1.3);
  };
  OBJ.grieta.draw = function (c, o, f) {
    pinta0.call(this, c, o, f);
    const C = o.carrera; if (!C) return;
    const CU = window.CINE_UTIL;
    for (const a of C.abiertas) {
      const yc = a.aire ? a.y - 6 : a.y - 26, abre = clamp(a.t / .45, 0, 1), cierra = clamp((a.t - .85) / .4, 0, 1);
      c.save();
      if (CU && CU.grietaAire) CU.grietaAire(c, a.x, yc, .8, 22, abre, cierra, f.t * 2.5);
      else { c.strokeStyle = '#ff3ad8'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(a.x, yc - 11 * abre); c.lineTo(a.x + 3, yc); c.lineTo(a.x - 2, yc + 11 * abre); c.stroke(); }
      // de qué mundo viene: el nombre parpadea encima de la rasgadura
      if (a.t < .9) {
        const M = typeof CAMPECHE !== 'undefined' && CAMPECHE.MUNDOS[a.mundo], nom = M ? M.nombre : (STYLE_MAP[a.mundo] || {}).name || a.mundo;
        c.globalAlpha = Math.min(1, a.t * 4) * (a.t > .7 ? (.9 - a.t) * 5 : 1);
        c.font = '800 8px "Alegreya Sans", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        const w = c.measureText(nom).width + 8, col = COLORES[C.mundos.findIndex(m => m.id === a.mundo) % 3] || '#fff';
        c.fillStyle = 'rgba(16,6,30,.86)'; c.beginPath(); roundRect(c, a.x - w / 2, yc - 23, w, 11, 3); c.fill();
        c.strokeStyle = col; c.lineWidth = .8; c.stroke();
        c.fillStyle = '#ffffff'; c.fillText(nom, a.x, yc - 17.3);
        // en el piso, una sombra que avisa dónde va a caer
        if (!a.aire) { c.globalAlpha = .5 * abre; c.fillStyle = '#10061e'; c.beginPath(); c.ellipse(a.x, a.y, 7 * abre, 1.6, 0, 0, TAU); c.fill(); }
      }
      c.restore();
    }
  };
})();
