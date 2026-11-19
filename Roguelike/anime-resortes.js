'use strict';
// Resortes del malecón: solo dibujo. Las plataformas conservan su aspecto
// original para que su superficie y sus avisos coincidan con la mecánica.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.anime) return;
  const esNubes = () => typeof CUR !== 'undefined' && CUR && CUR.def && (CUR.def.id === 'anime_nubes' || CUR.def.id === 'anime');
  const V = vestirNivel({ id: 'anime', carpeta: 'resortes', ver: 3, es: st => !!st && String(st.id).split('~')[0] === 'anime' && !window.estiloArteDerivado && (esNubes() || typeof CUR === 'undefined' || !CUR || !CUR.def || String(CUR.def.id).replace(/^(subida|bajada)_/, '') === 'anime') });
  const { spr, h1 } = V;
  // Palizada (Pueblo Mágico): casitas de techo de dos aguas con teja francesa junto al río, al fondo y con poca fuerza
  function casaPalizada(c, x, y, col, k) {
    c.save(); c.translate(x, y); c.scale(k, k);
    c.fillStyle = col; c.fillRect(-14, -16, 28, 16);
    c.fillStyle = '#b4502f'; c.beginPath(); c.moveTo(-18, -16); c.lineTo(0, -30); c.lineTo(18, -16); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(110,40,20,.55)'; c.lineWidth = .6; for (let r = 0; r < 3; r++) { c.beginPath(); c.moveTo(-15 + r * 4, -18 - r * 4); c.lineTo(15 - r * 4, -18 - r * 4); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,.75)'; c.fillRect(-9, -11, 5, 7); c.fillRect(4, -11, 5, 7); c.fillStyle = '#6a4630'; c.fillRect(-2, -9, 4, 9);
    c.restore();
  }
  V.cielo((c, f, antes) => {
    antes();
    const u = 190, off = (f.cam * .14) % u, base = Math.floor(f.cam * .14 / u), cols = ['#f3d9a4', '#9cc9d9', '#e6a6a0', '#b7d9a8'];
    c.save(); c.globalAlpha = .95;
    for (let k = -1; k * u - off < VW + u; k++) { const i = base + k; if (h1(i, 2) < .2) continue; casaPalizada(c, k * u - off + 40 + h1(i, 5) * 80, 177, cols[Math.floor(h1(i, 6) * 4)], 1.5 + h1(i, 7) * .3); }
    c.restore();
  });
  // brisa del malecón: velero que cruza la bahía, pétalos de tulipán africano al viento y destellos de sol
  V.cielo((c, f, antes) => {
    antes();
    const t = f.t;
    for (let i = 0; i < 2; i++) {                                         // veleros lejanos
      const w = VW + 100, x = ((i * 260 + t * (3 + i) - f.cam * .06) % w + w) % w - 50, y = 150 + i * 5, b = Math.sin(t * 1.2 + i) * .6;
      c.save(); c.translate(x, y + b); c.globalAlpha = .75; c.fillStyle = '#fff6e6'; c.beginPath(); c.moveTo(0, -14); c.lineTo(7, -2); c.lineTo(0, -2); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(-1, -12); c.lineTo(-6, -2); c.lineTo(-1, -2); c.closePath(); c.fill(); c.fillStyle = '#8a5a3c'; c.fillRect(-7, -1.5, 15, 2); c.restore();
    }
    for (let i = 0; i < 16; i++) {                                        // pétalos rojos que bajan en diagonal
      const w = VW + 60, ph = (t * (.05 + h1(i, 61) * .04) + h1(i, 62)) % 1, x = ((h1(i, 63) * w - f.cam * .25 + ph * 120) % w + w) % w - 30, y = ph * 210 - 10, r = t * 2 + i;
      c.save(); c.translate(x, y); c.rotate(r); c.fillStyle = i % 3 ? '#e8503c' : '#f7a0a0'; c.globalAlpha = .85; c.beginPath(); c.ellipse(0, 0, 2.4, 1.2 + Math.abs(Math.sin(r)) , 0, 0, 6.2832); c.fill(); c.restore();
    }
    c.save(); c.globalCompositeOperation = 'lighter';                     // destellos sobre el agua
    for (let i = 0; i < 16; i++) { const w = VW + 40, x = ((h1(i, 71) * w - f.cam * .08) % w + w) % w - 20, y = 160 + h1(i, 72) * 12, a = Math.max(0, Math.sin(t * 2.4 + h1(i, 73) * 6.3)); c.globalAlpha = a * .8; c.fillStyle = '#fffbe0'; c.fillRect(x - 2, y, 4, .7); }
    c.restore();
  });
  V.terreno(ctx => {
    for (const o of L.deco) {
      const x = o.x, y = o.y + .5, alto = o.y < 150;                         // alto: encima de un muro o cerro
      // palmeras y farolas solo al pie, en el malecón; arriba de los muros solo matas (nada de torres sueltas)
      if (o.k === 'T') spr(ctx, alto ? ['matas0', 'matas1', 'matas2'][o.i % 3] : ['palmera0', 'palmera1', 'farol0', 'palmera2'][o.i % 4], x, y);
      else if (o.k === 'f') spr(ctx, ['matas0', 'matas1', 'matas2'][o.i % 3], x, y);
      else if (o.k === 'r') spr(ctx, ['agave', 'nopal', 'bita'][o.i % 3], x, y);
    }
    // el faro es un solo lugar con sentido: está en tierra firme, junto a la meta del muelle, donde termina el malecón
    if (L.goal && L.goal.x > 0) spr(ctx, 'faro', L.goal.x - 76, L.goal.y + .5);
  });
  // Propuesta 4: panorama de nubes y cometas. El desplazamiento recorre la
  // imagen de ida y vuelta para no introducir un corte en sus extremos.
  const panoramaNubes = new Image();
  panoramaNubes.decoding = 'async';
  panoramaNubes.src = '../Roguelike/assets/resortes/fondo-nubes-opcion4.png?v=1';
  const cargaCometas = nombre => { const im = new Image(); im.decoding = 'async'; im.onload = () => V.rehaz(); im.src = '../Roguelike/assets/resortes/' + nombre + '.png?v=1'; return im; };
  const piedraCometas = cargaCometas('piedra-cometas'), floresCometas = cargaCometas('flores-cometas'), barandalCometas = cargaCometas('barandal-cometas');
  const arbolCometas = cargaCometas('arbol-cometas'), macetaCometas = cargaCometas('maceta-cometas'), metaCometas = cargaCometas('meta-cometas');
  const fachadasMalecon = cargaCometas('fachadas-malecon-ilustradas-v1');
  const fachadasVariantes = [fachadasMalecon, cargaCometas('fachadas-malecon-ilustradas-v2'), cargaCometas('fachadas-malecon-ilustradas-v3')];
  const ceibaMalecon = cargaCometas('ceiba-malecon-ilustrada-v1');
  const globosIlustrados = cargaCometas('plataforma-globos-ilustrada-v1');
  const resorteAlto = cargaCometas('resorte-cometas-alto'), resorteBajo = cargaCometas('resorte-cometas-bajo');
  // Conserva el dibujo y la compresión previos para todos los demás mundos.
  const lookSpringAnterior = MEC.LOOK.spring;
  MEC.LOOK.spring = function (c, pl, f, sk) {
    const sq = pl.sq || 0;
    if (esNubes() && resorteAlto.complete && resorteAlto.naturalWidth && resorteBajo.complete && resorteBajo.naturalWidth) {
      pl.sq = sq * .85;
      c.drawImage(sq > .25 ? resorteBajo : resorteAlto, pl.x, pl.y - 2 + sq * 3, pl.w, 8 - Math.min(2, sq * 2));
      return;
    }
    if (lookSpringAnterior) return lookSpringAnterior.apply(this, arguments);
    pl.sq = sq * .85; const x = pl.x, y = pl.y, w = pl.w, top = y - 2 + sq * 3;
    c.strokeStyle = '#7a8a9a'; c.lineWidth = 1.2; c.beginPath();
    for (let i = 0; i < 4; i++) { c.moveTo(x + 1, top + 2 + i * 1.6); c.lineTo(x + w - 1, top + 2.8 + i * 1.6); }
    c.stroke(); c.fillStyle = sk.accent; c.beginPath(); roundRect(c, x - 1, top - 1, w + 2, 3, 1.2); c.fill();
    c.strokeStyle = '#2a1e2e'; c.lineWidth = .7; c.stroke(); c.fillStyle = '#5a6a7a'; c.fillRect(x - 1, y + 5, w + 2, 1.5);
  };
  const globosAnteriores = MEC.LOOK.globos;
  MEC.LOOK.globos = function (c, pl, f, sk) {
    if (!esNubes() || !globosIlustrados.complete || !globosIlustrados.naturalWidth) return globosAnteriores && globosAnteriores.apply(this, arguments);
    // El borde superior de la tabla coincide con la superficie física.
    const w = pl.w * 1.14, h = w * 680 / 990;
    c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.drawImage(globosIlustrados, 275, 155, 990, 680, pl.x - pl.w * .07, pl.y - h * .825, w, h);
    c.restore();
  };
  const cieloAnterior = V.ST.sky;
  V.ST.sky = function (c, f) {
    if (!esNubes() || !panoramaNubes.complete || !panoramaNubes.naturalWidth) return cieloAnterior.call(this, c, f);
    // Solo la parte de nubes: la zona baja de la ilustración trae casas,
    // muralla y garita, que se recortaban a medias detrás de las plataformas.
    const im = panoramaNubes, altoCielo = im.naturalHeight * .58;
    const fuenteAncho = Math.min(im.naturalWidth * .35, altoCielo * VW / VH);
    const inicio = im.naturalWidth * .185, limite = im.naturalWidth * .535;
    const margen = Math.max(0, limite - inicio - fuenteAncho), periodo = margen * 2;
    const desplazamiento = periodo ? ((f.cam * .16 % periodo) + periodo) % periodo : 0;
    const sx = inicio + (desplazamiento <= margen ? desplazamiento : periodo - desplazamiento);
    c.drawImage(im, sx, 0, fuenteAncho, altoCielo, 0, 0, VW, VH);
  };
  // Adoquines sobre las superficies reales: no cambian el mapa ni colisiones.
  const terrenoAnterior = V.ST.terrain;
  V.ST.terrain = function (c, f) {
    if (!esNubes()) return terrenoAnterior.call(this, c, f);
    // Nunca dejar que la carga diferida vuelva a introducir árboles de figuras.
    if (!piedraCometas.complete || !piedraCometas.naturalWidth) {
      const deco = L.deco; L.deco = [];
      try { return terrenoAnterior.call(this, c, f); } finally { L.deco = deco; }
    }
    if (piedraCometas.complete && piedraCometas.naturalWidth) {
      c.save(); allLoopsPath(c, L.loops, 3); c.clip();
      const lado = 64, ancho = L.ww || VW, alto = (L.wh || VH) + 64;
      for (let x = 0; x < ancho + lado; x += lado) for (let y = 0; y < alto; y += lado) c.drawImage(piedraCometas, x, y, lado + .2, lado + .2);
      c.restore();
    }
    // Las casas se apoyan en cada superficie real; no son un telón que
    // atraviese huecos ni deben quedar cortadas por otra plataforma.
    let tramo = 0;
    if (fachadasMalecon.complete && fachadasMalecon.naturalWidth) for (const t of L.tops) {
      const longitud = t.x1 - t.x0;
      if (longitud < 90) continue;
      for (let x = t.x0 + 2; x + 86 <= t.x1 - 2;) {
        const w = Math.min(280, t.x1 - 2 - x), h = w * 555 / 2120;
        const opcion = fachadasVariantes[tramo++ % fachadasVariantes.length];
        const imagen = opcion.complete && opcion.naturalWidth ? opcion : fachadasMalecon;
        if (!L.tops.some(q => q !== t && q.y < t.y && q.y > t.y - h && q.x1 > x && q.x0 < x + w))
          c.drawImage(imagen, 25, 85, 2120, 555, x, t.y - h + 2.5, w, h);
        x += w;
      }
    }
    for (const o of L.deco) {
      const suelo = L.tops.find(t => Math.abs(t.y - o.y) < 3 && o.x >= t.x0 && o.x <= t.x1);
      if (!suelo) continue;
      const colocar = (im, w, h) => { if (suelo.x1 - suelo.x0 < w) return; const x = Math.max(suelo.x0, Math.min(o.x - w / 2, suelo.x1 - w)); c.drawImage(im, x, suelo.y - h, w, h); };
      if (o.k === 'T' && ceibaMalecon.complete && ceibaMalecon.naturalWidth) {
        const w = Math.min(66, suelo.x1 - suelo.x0), h = w * ceibaMalecon.naturalHeight / ceibaMalecon.naturalWidth;
        const x = Math.max(suelo.x0, Math.min(o.x - w / 2, suelo.x1 - w));
        if (!L.tops.some(q => q !== suelo && q.y < suelo.y && q.y > suelo.y - h && q.x1 > x && q.x0 < x + w))
          c.drawImage(ceibaMalecon, x, suelo.y - h + h * .04, w, h);
      }
      if (o.k === 'f' && floresCometas.complete && floresCometas.naturalWidth) colocar(floresCometas, 20, 12);
      if (o.k === 'r' && barandalCometas.complete && barandalCometas.naturalWidth) colocar(barandalCometas, 28, 10);
    }
    c.save();
    for (const t of L.tops) {
      const ancho = t.x1 - t.x0; if (ancho <= 0) continue;
      for (let x = t.x0; x < t.x1; x += 16) {
        const w = Math.min(16, t.x1 - x);
        c.drawImage(piedraCometas, 0, 0, piedraCometas.naturalWidth * w / 16, piedraCometas.naturalHeight * .16, x, t.y - 1, w, 5);
      }
    }
    c.restore();
  };
  const pelicanoVuelo = [0, 1, 2, 3, 4, 3, 2, 1], pelicanoPicada = [5, 6, 7];
  const zopiloteVuelo = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1], zopilotePicada = [6, 7, 8];
  const cuadro = (seq, t, fps) => seq[Math.floor(t * fps) % seq.length];
  function cuadroPicada(e, t, seq) {
    if (!e._resortesEnPicada) e._resortesPicadaDesde = t;
    e._resortesEnPicada = true;
    const paso = Math.min(seq.length - 1, Math.floor(Math.max(0, t - (e._resortesPicadaDesde ?? t)) * 12));
    return seq[paso];
  }
  V.fd('pelicano', (c, e, t) => {
    const reloj = e.anim ?? t;
    if (e.st === 'sleep') return V.dormido(c, 'pelicano0', t, 1);
    const picada = e.st === 'dive';
    if (!picada) e._resortesEnPicada = false;
    const n = e.st === 'gone' ? 0 : picada ? cuadroPicada(e, t, pelicanoPicada) : cuadro(pelicanoVuelo, reloj, 8);
    spr(c, 'pelicano' + n, 0, 1);
  }, 'pelicano0');
  V.fd('zopilote', (c, e, t) => {
    const reloj = e.anim ?? t;
    if (e.st === 'sleep') return V.dormido(c, 'zopilote0', t, 1);
    const picada = e.st === 'dive';
    if (!picada) e._resortesEnPicada = false;
    const n = e.st === 'gone' ? 0 : picada ? cuadroPicada(e, t, zopilotePicada) : cuadro(zopiloteVuelo, reloj, 8);
    spr(c, 'zopilote' + n, 0, 1);
  }, 'zopilote0');
  V.fd('medusa', (c, e, t) => {
    if (e.st === 'sleep') return V.dormido(c, 'medusa0', t, 2);
    const n = e.st === 'gone' ? 0 : cuadro([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], e.anim ?? t, 8);
    spr(c, 'medusa' + n, 0, 2);
  }, 'medusa0');
  V.fd('charran', (c, e, t, s, antes) => antes(c, e, t, s), 'charran0');
  V.moneda('canistel'); V.corazon('corazon'); V.meta('salida', { dy: 1 });
  const metaAnterior = V.ST.goal;
  V.ST.goal = function (c, x, y, t, f) {
    if (!esNubes() || !metaCometas.complete || !metaCometas.naturalWidth) return metaAnterior.call(this, c, x, y, t, f);
    const w = 80, h = w * metaCometas.naturalHeight / metaCometas.naturalWidth;
    c.drawImage(metaCometas, x - w / 2, y - h, w, h);
  };
  window.ANIME_RESORTES = V;
  if (typeof NIVELES_ALT !== 'undefined' && NIVELES.anime) {
    // El malecón nuevo pasa a ser el nivel principal del mundo anime.
    // La clave antigua del nivel nuevo sigue apuntando al mismo objeto para
    // que los enlaces, reintentos y partidas guardadas continúen funcionando.
    const nuevo = Object.assign({}, NIVELES.anime_nubes || NIVELES.anime, { id: 'anime', mundo: 'anime', nombre: 'Malecón de las cometas', lema: 'Una nueva ruta por el malecón entre nubes, flores y cometas.' });
    NIVELES.anime = nuevo; NIVELES.anime_nubes = nuevo;
    NIVELES_ALT.anime = (NIVELES_ALT.anime || []).filter(id => id !== 'anime_nubes');
  }
})();
