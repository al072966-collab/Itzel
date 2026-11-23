'use strict';
// =====================================================================
//  VESTIR UN NIVEL CON SUS ASSETS (lo común a todos los niveles)
//  Cada nivel nuevo (sumie-tinta.js, neon-ritmo.js, …) llama
//    const V = vestirNivel({ id: 'sumie', carpeta: 'tinta', ver: 1 });
//  y usa sus ayudas. Todo es solo dibujo: nunca toca colisiones, física ni
//  mecánicas, y si una imagen no ha cargado se pinta lo de antes.
//    · V.activo()           ¿se está dibujando este estilo (sin derivado)?
//    · V.listo(n)           ¿ya cargó la pieza n?
//    · V.spr(c, n, x, y, o) dibuja la pieza n (6 px por unidad, suavizado alto)
//                           o: { ax, ay (ancla 0..1), k (escala), w/h (medida), voltea, rot, alfa }
//    · V.cielo(fn)          envuelve ST.sky
//    · V.terreno(fn)        dibuja el terreno de antes sin sus adornos y luego fn
//    · V.look(k, fn)        envuelve LOOK[k] (plataformas)
//    · V.fd(k, fn, pieza)   envuelve FD[k] (enemigos), fn(c, e, t) dibuja mirando a la derecha
//    · V.obj(k, fn)         envuelve OBJ[k].draw
//    · V.zona(k, fn)        PINTA_ZONA[k] (solo el dibujo de una zona, nunca ZONAS)
//    · V.moneda(n), V.corazon(n), V.meta(n, o)
// =====================================================================
(function () {
  if (typeof MEC === 'undefined') return;
  const { LOOK, FD, OBJ } = MEC;
  const h1 = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  // quién está activo ahora: renderScene se envuelve una sola vez para todos
  let ACTUAL = null;
  if (typeof renderScene === 'function') {
    GANCHOS.en('renderScene', antes => function (ctx, st) { const a = ACTUAL; ACTUAL = st || null; try { return antes.apply(this, arguments); } finally { ACTUAL = a; } });
  }
  // el motor propio (niveles verticales y alternos que no son de plataformas) no pasa por renderScene:
  // mientras pinta, también cuenta como «se está dibujando este estilo» para los enemigos, monedas y piezas
  if (typeof MODOS !== 'undefined' && MODOS.propio && MODOS.propio.pintar && !MODOS.propio._vestido) {
    const antes = MODOS.propio.pintar;
    MODOS.propio.pintar = function (j, view) { const a = ACTUAL; ACTUAL = (view && view.st) || ACTUAL; try { return antes.apply(this, arguments); } finally { ACTUAL = a; } };
    MODOS.propio._vestido = true;
  }
  const corazones = [], monedas = [], metas = [];
  if (typeof monedaItzel === 'function') {
    GANCHOS.en('monedaItzel', antes => function (ctx, x, y, t, f, especial) {
      if (!especial) for (const m of monedas) if (m.V.activo() && m.V.listo(m.n)) { m.V.spr(ctx, m.n, x, y + Math.sin(t * 2.5 + x * .04) * 1.4, { ay: .5, h: m.h }); return; }
      return antes.apply(this, arguments);
    });
  }
  if (typeof drawHeart === 'function') {
    GANCHOS.en('drawHeart', antes => function (ctx, x, y) {
      for (const m of corazones) if (m.V.activo() && m.V.listo(m.n)) { m.V.spr(ctx, m.n, x, y, { ay: .5, h: m.h }); return; }
      return antes.apply(this, arguments);
    });
  }

  // dónde está el suelo debajo de un punto (y del mundo); null si abajo es un hueco (agua o vacío).
  // Lo usan las plataformas que necesitan apoyo (postes, pilotes, tallos) para que nada se vea flotando.
  window.sueloDebajo = (x, y) => {
    if (typeof L === 'undefined' || !L.surfaceY) return null;
    const r = L.surfaceY(Math.floor(x / T), Math.max(0, Math.floor(y / T) + 1));
    return r >= L.gh ? null : r * T;
  };
  window.fondoVista = () => (typeof L !== 'undefined' && L.wh ? L.wh : 300) + 20;   // hasta dónde bajar un apoyo que cae a un hueco
  window.vestirNivel = function (cfg) {
    const id = cfg.id, RUTA = '../Roguelike/assets/' + cfg.carpeta + '/', ver = cfg.ver || 1;
    // cada nivel se viste solo: los alternos que comparten estilo (carnaval en neón, …) llevan los suyos
    const nivel = cfg.nivel || id;
    // la subida y la bajada de un mundo (niveles-verticales.js) llevan el mismo vestido que su nivel
    const nivelActual = () => String((typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id) || nivel).replace(/^(subida|bajada)_/, '');
    const es = cfg.es || (st => !!st && String(st.id).split('~')[0] === id && !window.estiloArteDerivado && nivelActual() === nivel);
    const ST = typeof STYLE_MAP !== 'undefined' ? STYLE_MAP[cfg.estilo || id] : null;
    const TAM = {}, IMG = {};
    let faltan = 1;
    const listo = n => { const im = IMG[n]; return !!(im && im.complete && im.naturalWidth && TAM[n]); };
    function rehaz() { if (typeof CACHE !== 'undefined') for (const k of [...CACHE.keys()]) if (k.startsWith(id + '@')) CACHE.delete(k); }
    const nombreJson = cfg.json || cfg.carpeta + '.json';
    const local = cfg.manifiesto || window.ASSETS_MANIFIESTOS_LOCALES?.[cfg.carpeta + '/' + nombreJson];
    const manifiesto = local ? Promise.resolve(local) : fetch(RUTA + nombreJson + '?v=' + ver).then(r => r.json());
    manifiesto.then(m => {
      Object.assign(TAM, m); faltan = Object.keys(m).length;
      for (const n of Object.keys(m)) { const im = new Image(); im.decoding = 'async'; im.onload = im.onerror = () => { if (--faltan === 0) { rehaz(); if (V.alCargar) V.alCargar(); } }; im.src = RUTA + n + '.png?v=' + ver; IMG[n] = im; }
    }).catch(() => { faltan = -1; });

    const activo = () => es(ACTUAL);
    // para revisar que ningún nivel vestido caiga al dibujo viejo: con window.AUDITA = true se anota cada pieza que falta
    const falta = (k, pieza) => { if (!window.AUDITA) return; const A = window.VESTIDO_FALTAS = window.VESTIDO_FALTAS || {}; A[id + ':' + nivel + ':' + k + ':' + pieza] = (A[id + ':' + nivel + ':' + k + ':' + pieza] || 0) + 1; };
    function spr(c, n, x, y, o = {}) {
      const t = TAM[n]; if (!t || !listo(n)) return false;
      c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';   // las piezas vienen a 6 px por unidad: que se reduzcan bien
      let k = o.k || 1; if (o.w) k = o.w / t.w; else if (o.h) k = o.h / t.h;
      const w = t.w * k * (o.sx || 1), h = t.h * k, ax = o.ax ?? .5, ay = o.ay ?? 1;
      if (!o.voltea && !o.rot && o.alfa === undefined) { c.drawImage(IMG[n], x - w * ax, y - h * ay, w, h); return true; }
      c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot); if (o.voltea) c.scale(-1, 1); if (o.alfa !== undefined) c.globalAlpha *= o.alfa;
      c.drawImage(IMG[n], -w * ax, -h * ay, w, h); c.restore(); return true;
    }
    const V = {
      id, IMG, TAM, h1, listo, spr, rehaz, activo, es, ST,
      todo: () => faltan === 0,
      cielo(fn) {
        if (!ST) return; const antes = ST.sky;
        ST.sky = function (ctx, f) { if (!es(f.st) || faltan !== 0) return antes.call(this, ctx, f); return fn.call(this, ctx, f, () => antes.call(this, ctx, f)); };
      },
      terreno(fn, conAdornos) {
        if (!ST) return; const antes = ST.terrain;
        ST.terrain = function (ctx, f) {
          if (!es(f.st) || faltan !== 0) return antes.call(this, ctx, f);
          const deco = L.deco; if (!conAdornos) L.deco = [];
          try { antes.call(this, ctx, f); } finally { L.deco = deco; }
          fn.call(this, ctx, f);
        };
      },
      over(fn) {
        if (!ST) return; const antes = ST.over;
        ST.over = function (ctx, f) { if (!es(f.st) || faltan !== 0) return antes && antes.call(this, ctx, f); return fn.call(this, ctx, f, () => antes && antes.call(this, ctx, f)); };
      },
      // previo: el dibujo de antes cuando ese look vivía en el switch de mecanicas.js (no en LOOK)
      look(k, fn, pieza, previo) {
        const antes = LOOK[k] || previo;
        LOOK[k] = function (c, pl, f, sk) { if (!activo() || !listo(pieza)) { if (activo()) falta('look.' + k, pieza); return antes && antes.apply(this, arguments); } return fn(c, pl, f, sk, antes); };
      },
      fd(k, fn, pieza) {
        const antes = FD[k]; if (!antes) return;
        pieza = pieza || k + '0';
        const nuevo = function (c, e, t, s) { if (!activo() || e.sub || !listo(pieza)) { if (activo() && !e.sub) falta('fd.' + k, pieza); return antes.call(this, c, e, t, s); } return fn(c, e, t, s, antes); };
        nuevo._assetNuevo = true;
        nuevo._assetListo = () => (activo() && listo(pieza)) || !!(antes._assetListo && antes._assetListo());
        FD[k] = nuevo;
      },
      obj(k, fn, pieza, campo = 'draw') {
        const o = OBJ[k]; if (!o || !o[campo]) return; const antes = o[campo];
        o[campo] = function (c, ob, f, sk) { if (!activo() || (pieza && !listo(pieza))) { if (activo()) falta('obj.' + k, pieza); return antes.apply(this, arguments); } return fn(c, ob, f, sk, antes); };
      },
      zona(k, fn, pieza) {
        if (!MEC.PINTA_ZONA) return; const antes = MEC.PINTA_ZONA[k];
        MEC.PINTA_ZONA[k] = (ctx, z, f) => { if (activo() && (!pieza || listo(pieza))) return fn(ctx, z, f) !== false; return antes ? antes(ctx, z, f) : false; };
      },
      solido(k, fn, pieza) {
        if (!MEC.PINTA_SOLIDO) return; const antes = MEC.PINTA_SOLIDO[k];
        MEC.PINTA_SOLIDO[k] = (ctx, s, f, sk) => { if (activo() && (!pieza || listo(pieza))) return fn(ctx, s, f, sk) !== false; return antes ? antes(ctx, s, f, sk) : false; };
      },
      moneda(n, h) { monedas.push({ V, n, h }); },
      corazon(n, h) { corazones.push({ V, n, h }); },
      meta(n, o = {}) {
        if (!ST) return; const antes = ST.goal;
        ST.goal = function (ctx, x, y, t, f) { if (!es(f && f.st) || !listo(n)) return antes.apply(this, arguments); spr(ctx, n, x + (o.dx || 0), y + (o.dy ?? 1), { ay: o.ay ?? 1, h: o.h }); if (o.luego) o.luego(ctx, x, y, t, f); };
      },
      // las poses de un ciclo: [0,1,2,1] a cierta velocidad
      // dormido, mareado o aturdido: la misma pieza ladeada, meciéndose y apagada (así no vuelve el dibujo viejo
      // a media partida; las «z» las sigue poniendo el juego)
      dormido(c, n, t, y = .5, o = {}) {
        c.save(); c.rotate((o.lado ?? -.12) + Math.sin(t * (o.vel || 2.2)) * .05); c.filter = 'saturate(.6) brightness(.82)';
        spr(c, n, 0, y, o); c.restore();
      },
      cuadro(seq, t, fps = 8) { return seq[Math.floor(t * fps) % seq.length]; },
    };
    (window.VESTIDOS = window.VESTIDOS || []).push(V);      // para que la demostración del poder espere a las piezas del mundo (Estilos/enciclopedia.js)
    return V;
  };
})();
