'use strict';
// =====================================================================
//  EL CUADERNO DE CATHERWOOD, TODO DIBUJADO EN CÓDIGO
//  Sin láminas: árboles de crayola, pastito a lápiz, estrellas y pajaritos garabateados en el cielo.
//  Todo con trazos finos y un poco temblorosos, como dibujados a mano en una libreta rayada.
//  Solo pinta en el nivel «cuaderno»; no toca plataformas ni colisiones.
// =====================================================================
(function () {
  if (typeof GANCHOS === 'undefined') return;
  const hs = (i, s) => { let h = (i * 374761393 + s * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const LAPIZ = '#3d4350', VERDE = '#4f9a45', VERDE2 = '#2f6f33', CAFE = '#9a6a3c', AMARILLO = '#f0c53c', AZUL = '#4a6bb8';

  // un trazo con temblor: de a a b pasando por un punto algo desviado
  function trazo(c, ax, ay, bx, by, sem, tiemb = .8) {
    const mx = (ax + bx) / 2 + (hs(sem, 1) - .5) * tiemb * 2, my = (ay + by) / 2 + (hs(sem, 2) - .5) * tiemb * 2;
    c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo(mx, my, bx, by); c.stroke();
  }
  // rayado de crayola dentro de una forma (diagonales finas)
  function rayado(c, forma, x0, y0, x1, y1, color, alfa, paso = 1.6) {
    c.save(); forma(); c.clip(); c.strokeStyle = color; c.globalAlpha = alfa; c.lineWidth = .7; c.lineCap = 'round';
    for (let x = x0 - (y1 - y0); x < x1; x += paso) { c.beginPath(); c.moveTo(x, y1); c.lineTo(x + (y1 - y0) * .7, y0); c.stroke(); }
    c.restore();
  }
  function arbol(c, x, y, i, t) {
    const alto = 36 + hs(i, 3) * 14, ancho = 21 + hs(i, 4) * 7, grosor = 2.2 + hs(i, 5) * .8, sw = Math.sin(t * .8 + i) * .5;
    c.save(); c.translate(x, y); c.lineCap = 'round'; c.lineJoin = 'round';
    // tronco: relleno de crayola café y dos trazos de lápiz
    const tronco = () => { c.beginPath(); c.moveTo(-grosor, 0); c.quadraticCurveTo(-grosor * .7, -alto * .3, -grosor * .6, -alto * .55); c.lineTo(grosor * .6, -alto * .55); c.quadraticCurveTo(grosor * .7, -alto * .3, grosor, 0); c.closePath(); };
    c.fillStyle = 'rgba(154,106,60,.35)'; tronco(); c.fill(); rayado(c, tronco, -grosor, -alto * .55, grosor, 0, CAFE, .7, 1.3);
    c.strokeStyle = LAPIZ; c.lineWidth = .5; trazo(c, -grosor, 0, -grosor * .6, -alto * .55, i * 7 + 1, .4); trazo(c, grosor, 0, grosor * .6, -alto * .55, i * 7 + 2, .4);
    trazo(c, -grosor * .6, -alto * .3, -ancho * .35, -alto * .62, i * 7 + 3, .5);   // una rama
    // copa: tres nubes redondas encimadas
    const bolas = [[-ancho * .32, -alto * .72, ancho * .42], [ancho * .3, -alto * .74, ancho * .4], [0, -alto * .92, ancho * .48], [0, -alto * .66, ancho * .45]];
    const copa = () => { c.beginPath(); for (const [bx, by, r] of bolas) { c.moveTo(bx + r + sw * .2, by); c.arc(bx + sw * .2, by, r, 0, Math.PI * 2); } };
    c.fillStyle = 'rgba(120,190,100,.30)'; copa(); c.fill();
    rayado(c, copa, -ancho, -alto * 1.45, ancho, -alto * .3, VERDE, .55, 1.5);
    rayado(c, copa, -ancho, -alto * 1.45, ancho, -alto * .3, VERDE2, .3, 3.4);
    c.strokeStyle = LAPIZ; c.lineWidth = .5; c.globalAlpha = .85;
    for (let k = 0; k < bolas.length; k++) { const [bx, by, r] = bolas[k]; c.beginPath(); c.arc(bx + sw * .2, by, r, Math.PI * (.95 + hs(i, 10 + k) * .2), Math.PI * (2.1 + hs(i, 20 + k) * .15)); c.stroke(); }
    // frutitas
    c.globalAlpha = 1; c.fillStyle = '#e0533f'; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc((hs(i, 30 + k) - .5) * ancho * 1.1, -alto * (.62 + hs(i, 40 + k) * .3), .9, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }
  function estrella(c, x, y, r, i) {
    c.save(); c.translate(x, y); c.rotate((hs(i, 6) - .5) * .5); c.lineJoin = 'round'; c.lineCap = 'round';
    const forma = () => { c.beginPath(); for (let k = 0; k < 10; k++) { const rr = k % 2 ? r * .45 : r, a = -Math.PI / 2 + k * Math.PI / 5; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); };
    c.fillStyle = 'rgba(240,197,60,.35)'; forma(); c.fill(); rayado(c, forma, -r, -r, r, r, AMARILLO, .8, 1.2);
    c.strokeStyle = LAPIZ; c.lineWidth = .45; c.globalAlpha = .8; forma(); c.stroke(); c.restore();
  }
  function pajaro(c, x, y, s, t, i) {
    const ala = Math.sin(t * 5 + i) * .35 * s; c.save(); c.strokeStyle = LAPIZ; c.lineWidth = .55; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x - s * 1.6, y + ala); c.quadraticCurveTo(x - s * .6, y - s * .8, x, y); c.quadraticCurveTo(x + s * .6, y - s * .8, x + s * 1.6, y + ala); c.stroke(); c.restore();
  }
  function pasto(c, x, y, i) {
    c.save(); c.strokeStyle = VERDE2; c.lineWidth = .5; c.lineCap = 'round';
    for (let k = 0; k < 4; k++) { const dx = (k - 1.5) * 1.6, h = 3 + hs(i, 50 + k) * 3.4, ln = (hs(i, 60 + k) - .5) * 2.4; c.beginPath(); c.moveTo(x + dx, y + .5); c.quadraticCurveTo(x + dx + ln * .4, y - h * .5, x + dx + ln, y - h); c.stroke(); }
    c.restore();
  }

  // ---------------- la tinta del lápiz de Fresita ----------------
  // En el cuaderno las líneas azules del nivel ya no existen: los huecos se cruzan dibujando, y dibujar gasta tinta.
  // La tinta vuelve despacito y, sobre todo, cada enemigo vencido suelta un poco.
  const TINTA_MAX = 500, TINTA_ENEMIGO = 130, TINTA_REGRESA = 12;
  if (typeof MEC !== 'undefined') {
    MEC.OBJ.tintaCtl = {
      step(o, g, dt) {
        g.tinta = Math.min(g.tintaMax, g.tinta + TINTA_REGRESA * dt); g.sinTintaT = Math.max(0, (g.sinTintaT || 0) - dt); o.brillo = Math.max(0, (o.brillo || 0) - dt);
        for (const e of g.foes) {
          if (e.st !== 'gone' || e._tintaDada || e.sj) continue; e._tintaDada = true;
          g.tinta = Math.min(g.tintaMax, g.tinta + TINTA_ENEMIGO); o.brillo = 1;
          for (let k = 0; k < 8; k++) spawn(g, 1, e.x, e.y - 6, { v: 50, life: .6, s: 1.8, k: 'spark', cols: ['#3d63c4', '#7fa0f0', '#ffffff'], g: -30 });
          // y canisteles: saltan en arco y van hacia Itzel (incentivo para derrotar enemigos)
          if (MEC.OBJ.canistelSubjefe) for (let k = 0; k < 2; k++) {
            const an = Math.PI * (1.15 + Math.random() * .7), v = 55 + Math.random() * 60, c = { x: e.x, y: e.y - 8, got: false, demora: .3 };
            g.coins.push(c); g.objs.push({ k: 'canistelSubjefe', moneda: c, vx: Math.cos(an) * v, vy: Math.sin(an) * v, t: 0 });
          }
          if (typeof toast === 'function' && !g.avisoTinta) { g.avisoTinta = 1; toast('¡Soltó tinta y canisteles! Cada enemigo vencido recompensa', 2800); }
        }
      },
    };
    const iniTinta = MEC.init;
    MEC.init = function (g, def) {
      const r = iniTinta.apply(this, arguments);
      if (def && def.id === 'cuaderno' && !g.isBoss) { g.tintaMax = TINTA_MAX; g.tinta = TINTA_MAX; g.objs.push({ k: 'tintaCtl' }); }
      return r;
    };
  }
  // el indicador: un tintero y su barra, arriba a la izquierda debajo de los corazones
  GANCHOS.en('WORLD_HOOK', prev => function (ctx, f, layer) {
    prev.apply(this, arguments);
    const g = f && f.g; if (!g || layer !== 'over' || g.tintaMax === undefined || g.win) return;
    const o = (g.objs || []).find(q => q.k === 'tintaCtl'), k = Math.max(0, Math.min(1, g.tinta / g.tintaMax)), m = ctx.getTransform(), x = -m.e / m.a + 10 + ((typeof VISTA !== 'undefined' && VISTA.rec) || 0), y = -m.f / m.d + 25;   // esquina de la pantalla, sin importar la cámara
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // el tintero
    ctx.fillStyle = '#2c3f86'; ctx.strokeStyle = '#1b254f'; ctx.lineWidth = .8;
    ctx.beginPath(); ctx.moveTo(x + 1, y + 11); ctx.lineTo(x + 1, y + 5); ctx.quadraticCurveTo(x + 1, y + 3, x + 3, y + 3); ctx.lineTo(x + 9, y + 3); ctx.quadraticCurveTo(x + 11, y + 3, x + 11, y + 5); ctx.lineTo(x + 11, y + 11); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e9e3d2'; ctx.fillRect(x + 3.5, y, 5, 3.4); ctx.strokeRect(x + 3.5, y, 5, 3.4);
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(x + 3, y + 6); ctx.lineTo(x + 3, y + 9); ctx.stroke();
    // la barra
    const bx = x + 15, bw = 62, bh = 5;
    ctx.fillStyle = 'rgba(40,36,30,.55)'; ctx.fillRect(bx, y + 4.5, bw, bh);
    const bajo = k < .2, titila = bajo && Math.sin((f.t || 0) * 12) > 0;
    ctx.fillStyle = titila ? '#d8584a' : (o && o.brillo > 0 ? '#8fb0ff' : '#3d63c4'); ctx.fillRect(bx, y + 4.5, bw * k, bh);
    ctx.strokeStyle = 'rgba(30,24,20,.85)'; ctx.lineWidth = .7; ctx.strokeRect(bx, y + 4.5, bw, bh);
    if (g.sinTintaT > 0) { ctx.font = 'bold 6px "Alegreya Sans", sans-serif'; ctx.textAlign = 'left'; ctx.lineWidth = 2; ctx.strokeStyle = '#fff9e8'; ctx.fillStyle = '#a02a2a'; ctx.strokeText('¡Sin tinta! Vence enemigos', bx, y + 17); ctx.fillText('¡Sin tinta! Vence enemigos', bx, y + 17); }
    ctx.restore();
  });

  GANCHOS.en('WORLD_HOOK', prev => function (ctx, f, layer) {
    prev.apply(this, arguments);
    const g = f && f.g, def = g && g.def; if (!def || def.id !== 'cuaderno' || def.modo || layer !== 'under') return;
    const cam = f.cam || 0, t = f.t || 0, W = typeof VW === 'number' ? VW : 400;
    ctx.save();
    // el cielo de la libreta: estrellas y pajaritos garabateados (se mueven poco con la cámara)
    for (let k = 0; k < 7; k++) {
      const par = .12, u = 330, x = ((k * 97 + hs(k, 7) * 60 - cam * par) % (u * 2) + u * 2) % (u * 2) - 40, y = 18 + hs(k, 8) * 70;
      if (x < -20 || x > W + 20) continue;
      if (k % 3 === 0) pajaro(ctx, x, y + Math.sin(t * .9 + k) * 2, 3.5 + hs(k, 9) * 1.5, t, k); else if (k % 3 === 1) estrella(ctx, x, y + 6, 3.4 + hs(k, 9) * 1.6, k);
    }
    // pastito a lápiz sobre el suelo y árboles de crayola en las decoraciones de árbol
    const c0 = Math.floor(cam / T) - 1, c1 = Math.ceil((cam + W) / T) + 1;
    for (let col = c0; col <= c1; col += 1) {
      const s = L.surfaceY(col, 0); if (s >= 14 || hs(col, 70) < .35) continue;
      pasto(ctx, col * T + hs(col, 71) * T, s * T, col);
    }
    // (los árboles de crayola ya no se dibujan: el estilo del cuaderno trae los suyos en cada árbol y quedaban dos encimados)
    ctx.restore();
  });
})();
