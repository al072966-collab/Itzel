'use strict';
// =====================================================================
//  LA DEFENSA DE CAMPECHE · el mapa ilustrado (rework visual)
//  Lo que antes eran figuras simples (casas cuadradas, catedral esquemática, pedestales básicos, palmeras de
//  rayas, piratas dibujados a trazos) ahora usa las piezas del rediseño de ChatGPT, recortadas con
//  tools/defensa-mapa.py (Roguelike/assets/defensa-mapa, 5 px por unidad). Aquí solo hay dibujo: las rutas
//  salen de CELDAS/RUTAS de modos-torres.js (el camino se pinta sobre ellas con la arena y la piedra del tramo
//  recto) y nada cambia reglas, costos, alcances ni zonas de clic.
//  Mientras las imágenes no hayan llegado, modos-torres.js sigue dibujando lo de antes.
// =====================================================================
window.DEFENSA_MAPA = (() => {
  const RUTA = '../Roguelike/assets/defensa-mapa/', IM = {}, TAM = {};
  let faltan = 1, listo = false;
  const alCargar = [];
  const pide = () => {
    const m = window.DEFENSA_MAPA_MANIFIESTO; if (!m) { faltan = -1; return; }
    Object.assign(TAM, m);
    const nombres = Object.keys(m); faltan = nombres.length;
    for (const n of nombres) {
      const im = new Image(); im.decoding = 'async';
      im.onload = im.onerror = () => { if (--faltan === 0) { listo = true; for (const f of alCargar) f(); } };
      im.src = RUTA + n + '.webp?v=1'; IM[n] = im;
    }
  };
  pide();
  const hay = n => !!(IM[n] && IM[n].complete && IM[n].naturalWidth);
  // dibuja una pieza por su tamaño en unidades; (x, y) es el punto de anclaje (ax, ay en 0..1)
  function spr(c, n, x, y, o = {}) {
    const t = TAM[n]; if (!t || !hay(n)) return false;
    const k = o.k || 1, w = t.w * k * (o.sx || 1), h = t.h * k, ax = o.ax ?? .5, ay = o.ay ?? .5;
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    if (!o.rot && !o.voltea && o.alfa === undefined) { c.drawImage(IM[n], x - w * ax, y - h * ay, w, h); return true; }
    c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot); if (o.voltea) c.scale(-1, 1); if (o.alfa !== undefined) c.globalAlpha *= o.alfa;
    c.drawImage(IM[n], -w * ax, -h * ay, w, h); c.restore(); return true;
  }
  // una pieza «quemada» (más oscura, con tizne), preparada una vez
  const quemadas = {};
  function quemada(n) {
    if (quemadas[n]) return quemadas[n];
    const im = IM[n]; if (!hay(n)) return null;
    const cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight;
    const x = cv.getContext('2d'); x.drawImage(im, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(30,14,8,.55)'; x.fillRect(0, 0, cv.width, cv.height);
    return quemadas[n] = cv;
  }
  const h1 = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

  // ---------------- el plano de fondo (se pinta una vez; D trae los datos del tablero) ----------------
  function plano(x, D) {
    const { VW, VH, OY, MURO, RUTAS, CASAS, PEDESTALES, cx, cy } = D;
    // 1 · pergamino, costa y mar: la costa de la lámina se corre para que caiga en MAR
    const f = IM.fondo, kx = (VW + 12) / f.naturalWidth;
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(f, -12, 0, VW + 12, f.naturalHeight * kx);
    // 2 · los caminos, desde las rutas reales: borde de piedra y arena del tramo de la lámina
    x.lineCap = 'square'; x.lineJoin = 'miter';
    const patron = n => { const p = x.createPattern(IM[n], 'repeat'); if (p && p.setTransform) p.setTransform(new DOMMatrix().scale(1 / 5)); return p; };
    const linea = (w, estilo) => { x.strokeStyle = estilo; x.lineWidth = w; for (const R of RUTAS) { x.beginPath(); R.pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.stroke(); } };
    linea(17.2, 'rgba(40,26,14,.55)'); linea(16, patron('camino-piedra')); linea(11.4, 'rgba(60,40,20,.5)'); linea(10.6, patron('camino-arena'));
    // 3 · la muralla (vertical, almenas hacia el mar) con sus dos entradas; garitas en cada extremo
    const puertas = RUTAS.map(R => R.pts[0][1]), tramos = []; let ini = OY;
    for (const p of [...puertas].sort((a, b) => a - b)) { tramos.push([ini, p - 12]); ini = p + 12; }
    tramos.push([ini, VH]);
    const m = TAM.muro;
    for (const [a, b] of tramos) {
      if (b - a < 4) continue;
      x.save(); x.beginPath(); x.rect(MURO - 4, a, m.h + 8, b - a); x.clip();
      for (let y = b; y > a - m.w; y -= m.w - .6) { x.save(); x.translate(MURO + m.h / 2, y); x.rotate(-Math.PI / 2); x.drawImage(IM.muro, 0, -m.h / 2, m.w, m.h); x.restore(); }
      x.restore();
      if (a > OY + 1) spr(x, 'torreon', MURO + m.h / 2, a + 1);
      if (b < VH - 1) spr(x, 'torreon', MURO + m.h / 2, b - 1);
    }
    // 4 · casas: apoyadas en su manzana, sin tocar el camino ni los pedestales (se descartan las que estorban)
    const cerca = (px, py, lista, dx, dy) => lista.some(([c, r]) => Math.abs(cx(c) - px) < dx && Math.abs(cy(r) - py) < dy);
    const orden = CASAS.map(([c, r, i]) => ({ a: cx(c), b: cy(r), i })).filter(q => !cerca(q.a, q.b, PEDESTALES, 15, 11)).sort((p, q) => p.b - q.b);
    for (const q of orden) {
      const n = 'casa' + (q.i % 5), t = TAM[n], k = 14.5 / t.w * (.92 + h1(q.i, q.a) * .14);
      x.fillStyle = 'rgba(40,26,14,.28)'; x.beginPath(); x.ellipse(q.a + 1, q.b + t.h * k / 2 - 1, t.w * k / 2, 2.4, 0, 0, Math.PI * 2); x.fill();
      spr(x, n, q.a, q.b, { k });
    }
    // 5 · la catedral, en la meta
    const tx = VW - 28, ty = cy(10);
    x.fillStyle = 'rgba(40,26,14,.3)'; x.beginPath(); x.ellipse(tx + 1, ty + 18, 22, 3.4, 0, 0, Math.PI * 2); x.fill();
    spr(x, 'catedral', tx, ty + 17, { ay: 1 });
    // 6 · la rosa de los vientos y el nombre del mar
    { const a = 340, b = cy(12) + 2; x.strokeStyle = 'rgba(70,46,24,.65)'; x.lineWidth = .5; x.beginPath(); x.arc(a, b, 9, 0, Math.PI * 2); x.stroke();
      for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2, l = i % 2 ? 7 : 12; x.fillStyle = i % 2 ? 'rgba(70,46,24,.5)' : 'rgba(150,50,30,.75)'; x.beginPath(); x.moveTo(a + Math.cos(an - .2) * 2.4, b + Math.sin(an - .2) * 2.4); x.lineTo(a + Math.cos(an) * l, b + Math.sin(an) * l); x.lineTo(a + Math.cos(an + .2) * 2.4, b + Math.sin(an + .2) * 2.4); x.fill(); } }
    x.save(); x.translate(14, 172); x.rotate(-Math.PI / 2); x.font = 'italic 8px Alegreya, Georgia, serif'; x.fillStyle = 'rgba(236,250,255,.75)'; x.textAlign = 'center'; x.fillText('Golfo de México', 0, 3); x.restore(); x.textAlign = 'left';
  }

  // ---------------- las defensas ----------------
  // K, rgba, ico y los colores los pone modos-torres.js (los de siempre y los iconos del menú)
  function defensa(c, t2, t, o) {
    const { x, y, sobre, elegida, ico, rgba, OCRE, PAP, K } = o;
    const sombra = (w, h) => { c.fillStyle = 'rgba(40,26,14,.3)'; c.beginPath(); c.ellipse(x + 1, y + 5, w, h, 0, 0, Math.PI * 2); c.fill(); };
    if (!t2.tipo) {
      sombra(8, 2.2); spr(c, 'pedestal', x, y + 1);
      if (sobre || elegida) { c.strokeStyle = OCRE; c.lineWidth = 1; c.setLineDash([2, 2]); c.strokeRect(x - 9, y - 6, 18, 13); c.setLineDash([]); }
      return;
    }
    const n = Math.min(3, t2.nivel);
    // el cañón: base fija y tubo que gira hacia su objetivo (la lámina del tubo apunta hacia arriba)
    const canon = t2.tipo === 'lanza' && hay('canon-base') && hay('canon-tubo');
    const nom = canon ? 'canon-base' : 'def_' + t2.tipo + '_' + n, T = canon ? { w: [13, 16, 19][n - 1] * .92, h: [13, 16, 19][n - 1] * .92 } : TAM[nom]; if (!T) return;
    sombra(T.w / 2 + 1, 2.6);
    if (t2.ayuda) { c.strokeStyle = rgba('#ffd98a', .6 + Math.sin(t * 9) * .3); c.lineWidth = 1; c.beginPath(); c.ellipse(x, y + 3, 14, 5, 0, 0, Math.PI * 2); c.stroke(); }
    const sacude = t2.tipo === 'viento' && t2.sopla ? Math.sin(t * 40) * .06 : 0, culata = t2.retro > 0 ? 1 - t2.retro * .05 : 1;
    c.save(); c.translate(x, y); c.rotate(sacude); c.scale(culata, culata); c.translate(-x, -y);
    if (canon) {
      const kb = T.w / TAM['canon-base'].w, kt = [.56, .7, .84][n - 1], tt = TAM['canon-tubo'], ang = (t2.ang || 0) + Math.PI / 2, back = (t2.retro || 0) * 2.2 * kt;
      const dib = (nn, px, py, o) => { if (t2.quema) { const q = quemada(nn); if (q) { c.save(); c.translate(px, py); if (o.rot) c.rotate(o.rot); c.drawImage(q, -TAM[nn].w * o.k * .5, -TAM[nn].h * o.k * o.ay, TAM[nn].w * o.k, TAM[nn].h * o.k); c.restore(); return; } } spr(c, nn, px, py, o); };
      dib('canon-base', x, y - 1, { k: kb, ax: .5, ay: .5 });
      const pv = .6;   // el tubo gira por sus muñones, un poco más allá de la mitad
      dib('canon-tubo', x - Math.cos(t2.ang || 0) * back, y - 3 - Math.sin(t2.ang || 0) * back, { k: kt, ax: .5, ay: pv, rot: ang });
      T.long = tt.h * kt * (1 - pv);
    } else if (t2.quema) { const q = quemada(nom); if (q) c.drawImage(q, x - T.w / 2, y - T.h / 2 - 1, T.w, T.h); else spr(c, nom, x, y - 1); }
    else spr(c, nom, x, y - 1);
    c.restore();
    // el fogonazo del disparo, hacia donde apunta
    if (t2.retro > .35 && (t2.tipo === 'lanza' || t2.tipo === 'mosquete')) { const a = t2.ang || 0, d0 = T.long ? T.long + 1 : T.w * .34; spr(c, 'destello', x + Math.cos(a) * d0, y - 3 + Math.sin(a) * d0, { k: t2.tipo === 'lanza' ? .55 : .3, rot: a, ax: 0, alfa: Math.min(1, (t2.retro - .35) * 2.2) }); }
    // la rama elegida (la lámina no trae arte propio de cada una): una insignia con su icono de siempre
    if (t2.rama) { c.fillStyle = PAP; c.beginPath(); c.arc(x + T.w / 2 - 1, y - T.h / 2 + 2, 4.6, 0, Math.PI * 2); c.fill(); c.strokeStyle = K; c.lineWidth = .7; c.stroke(); ico(t2.rama, x + T.w / 2 - 1, y - T.h / 2 + 2, .5); }
    // incendio: llamas y humo sobre la defensa (el juego sigue dando sus chispas)
    if (t2.quema) {
      for (let k = 0; k < 3; k++) {
        const fx = x - T.w * .25 + k * T.w * .25, fy = y - T.h * .22 + (k === 1 ? -1.5 : 0), fr = 'llama' + (Math.floor(t * 9 + k * 2) % 6);
        if (!spr(c, fr, fx, fy, { ay: 1, k: .8 + .25 * (k === 1) })) {
          const al = 6 + Math.sin(t * 16 + k * 2) * 2.2;
          c.fillStyle = '#ff6c2f'; c.beginPath(); c.moveTo(fx - 2.4, fy); c.quadraticCurveTo(fx - 1.8, fy - al * .6, fx, fy - al); c.quadraticCurveTo(fx + 1.8, fy - al * .6, fx + 2.4, fy); c.closePath(); c.fill();
        }
      }
      const u = (t * .6) % 1; spr(c, 'humo', x + Math.sin(t * 2) * 2, y - T.h * .35 - u * 12, { k: .55 + u * .3, alfa: .6 * (1 - u) });
    }
    if (sobre || elegida) { c.strokeStyle = OCRE; c.lineWidth = 1; c.setLineDash([2, 2]); c.strokeRect(x - T.w / 2 - 1, y - T.h / 2 - 2, T.w + 2, T.h + 4); c.setLineDash([]); }
  }
  return { img: n => IM[n], ready: () => listo, alCargar: f => alCargar.push(f), spr, hay, plano, defensa, quemada, TAM };
})();
