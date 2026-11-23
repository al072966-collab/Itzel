'use strict';
// =====================================================================
//  ELEVADORES DE CRISTAL, CON SUS ASSETS (estilo low poly)
//  El telón de la gruta y el terreno de facetas se quedan. Lo de enfrente
//  usa las piezas de tools/lowpoly-cristal.py (Roguelike/assets/cristal):
//    · elevadores: la losa de cristal (sin los rieles de la lámina, que se
//      moverían con ella), con la cubierta medida;
//    · prismas que dan media vuelta (avisan temblando) y el pilar de cristal
//      de Fresita (crece del piso como antes);
//    · pecarí (jabalí), carpintero, geoda y escarabajo de cristal;
//    · cristales, árboles, palmas, helechos, rocas y plantas; canistel,
//      corazón y el portal de amatista de salida.
//  Nada cambia colisiones ni mecánicas. Solo aplica a «Elevadores de cristal».
// =====================================================================
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.lowpoly) return;
  const V = vestirNivel({ id: 'lowpoly', carpeta: 'cristal', ver: 2, manifiesto: window.LOWPOLY_CRISTAL_MANIFIESTO });
  const { spr, h1, TAM, IMG } = V;
  const cornisa = new Image();
  cornisa.onload = () => V.rehaz(); cornisa.src = '../Roguelike/assets/cristal/cornisa-facetada-v1.png';
  const paisaje = {};
  for (const [n, archivo] of Object.entries({ fondo:'grutas-panorama-v1', roca:'roca-facetada-v1' })) {
    const im = paisaje[n] = new Image(); im.onload = () => V.rehaz();
    im.src = '../Roguelike/assets/cristal/' + archivo + '.png';
  }
  const principal = f => ((f.g && f.g.def && f.g.def.id) || (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id)) === 'lowpoly';
  const paisajeListo = () => Object.values(paisaje).every(im => im.complete && im.naturalWidth);

  // telón: destellos de cristal en cruz y bandada de murciélagos
  V.cielo((c, f, antes) => {
    if (principal(f) && paisajeListo()) {
      const im = paisaje.fondo, ancho = 720, base = 193 - (f.y0 || 0), off = ((f.cam * .1 % ancho) + ancho) % ancho, alto = f.H || VH;
      c.save(); c.fillStyle = '#292447'; c.fillRect(0, 0, VW, alto);
      for (let x = -off - ancho; x < VW + ancho; x += ancho) {
        const arriba = Math.min(0, base - 193);
        c.drawImage(im, 0, 0, 2172, 650, x, arriba, ancho, base - arriba);
        c.drawImage(im, 0, 650, 2172, 74, x, base, ancho, Math.max(1, alto - base));
      }
      c.restore();
    } else antes();
    const t = f.t;
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 12; i++) {                                         // destellos de cristal en cruz
      const per = 3 + h1(i, 31) * 3, T = (t + h1(i, 32) * 9) % per, n = Math.floor((t + h1(i, 32) * 9) / per);
      if (T > .6) continue;
      const a = Math.sin(T / .6 * Math.PI), w = VW + 40, x = ((h1(n * 12 + i, 33) * w - f.cam * .18) % w + w) % w - 20, y = 15 + h1(n * 12 + i, 34) * 135, r = 2 + 4 * a;
      c.globalAlpha = a * .9; c.fillStyle = i % 2 ? '#bff4ff' : '#f0c8ff'; c.fillRect(x - r, y - .4, 2 * r, .8); c.fillRect(x - .4, y - r, .8, 2 * r);
    }
    c.restore();
    const per = 18, T = (t + 5) % per;                                     // bandada de murciélagos que cruza
    if (T < 6) for (let i = 0; i < (window.FAUNA_ARTE?.listo('murcielagoCristal') ? 6 : 0); i++) {
      const u = T / 6, x = -20 + u * (VW + 60) - i * 9 + Math.sin(i * 3) * 5, y = 40 + (i % 4) * 14 + Math.sin(t * 2 + i) * 6 + h1(i, 41) * 20;
      FAUNA_ARTE.dib(c, 'murcielagoCristal', t + i * .13, x, y, { w: 7 - (i % 3), ay: .5, fps: 9, seq: [0, 1, 2, 1] });
    }
  });

  let texturaSuelo = null;
  V.terreno((ctx, f) => {
    if (principal(f) && paisajeListo()) {
      if (cornisa.complete && cornisa.naturalWidth) {
        // Eliminar los triángulos decorativos anteriores por encima del piso.
        for (const r of L.tops) ctx.clearRect(r.x0, r.y - 5, r.x1 - r.x0, 5);
      }
      if (!texturaSuelo) { texturaSuelo = ctx.createPattern(paisaje.roca, 'repeat'); texturaSuelo.setTransform(new DOMMatrix().scale(500 / paisaje.roca.naturalWidth)); }
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip(); ctx.fillStyle = texturaSuelo;
      for (const r of L.tops) ctx.fillRect(r.x0, r.y + 9, r.x1 - r.x0, VH + 40);
      ctx.restore();
      if (cornisa.complete && cornisa.naturalWidth) {
        ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip();
        for (const r of L.tops) {
          ctx.save(); ctx.beginPath(); ctx.rect(r.x0, r.y, r.x1 - r.x0, 9); ctx.clip();
          for (let x = r.x0; x < r.x1; x += 150) ctx.drawImage(cornisa, 35, 312, 2100, 102, x, r.y, 150, 9);
          ctx.restore();
        }
        ctx.restore();
      }
    }
    for (const r of L.tops) for (let x = r.x0 + 10; x < r.x1 - 10; x += 24 + h1(x | 0, r.y) * 40) if (h1(x | 0, 51) > .58) spr(ctx, ['cristales4', 'helecho2', 'planta3', 'cristales3', 'roca2'][Math.floor(h1(x | 0, 52) * 5)], x, r.y + 1, { voltea: h1(x | 0, 53) < .5 });
    for (const o of L.deco) {
      const x = o.x, y = o.y + 1.2, v = h1(o.i, 7);
      if (o.k === 'T') spr(ctx, ['palma0', 'arbol0', 'palma1', 'cristales0', 'palma2'][o.i % 5], x, y, { voltea: v < .5 });
      else if (o.k === 'f') spr(ctx, ['helecho0', 'planta0', 'planta1', 'helecho1', 'planta2', 'cristales2'][o.i % 6], x, y, { voltea: v < .5 });
      else if (o.k === 'r') spr(ctx, ['roca0', 'roca1', 'cristales1'][o.i % 3], x, y, { voltea: v < .5 });
    }
  });

  // ---------------- elevadores y prismas ----------------
  V.look('crystal', (c, pl) => {
    const n = 'losa' + Math.floor(h1(Math.round(pl.x0 ?? pl.x), 9) * 2), t = TAM[n];
    spr(c, n, pl.x + pl.w / 2, pl.y - .4, { ay: t.cubierta || .25, w: pl.w + 4 });
  }, 'losa0');
  V.look('prisma', (c, pl) => {
    const sh = pl.avisa ? (Math.random() - .5) * 1.2 : 0, g = pl.gira || 0, n = 'prisma' + Math.floor(h1(Math.round(pl.x0 ?? pl.x), 4) * 2), t = TAM[n];
    const w = pl.w + 4, k = w / t.w, hh = t.h * k;
    c.save(); c.translate(pl.x + pl.w / 2 + sh, pl.y + hh / 2 - .4);
    if (g) { c.rotate(g * Math.PI * 2 / 3); c.scale(1, .55 + .45 * Math.abs(Math.cos(g * Math.PI))); c.globalAlpha *= .75; }
    spr(c, n, 0, 0, { ay: .5, k });
    c.restore();
    if (!g) { c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(pl.x + 3 + sh, pl.y, pl.w - 6, .8); }
  }, 'prisma0');
  // el pilar de cristal de Fresita: crece del piso
  V.solido('pillar', (c, s) => {
    const k = s.grow ?? 1, h = s.h * k, n = 'pilar' + (Math.round(s.x / 16) % 2);
    c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    if (s.life !== undefined && s.life < 1.2) c.globalAlpha *= .55 + .45 * Math.abs(Math.sin(f_t() * 14));   // a punto de romperse
    c.drawImage(IMG[n], s.x + 1, s.y + s.h - h - 2, s.w - 2, h + 2);
    c.restore();
  }, 'pilar0');
  const f_t = () => performance.now() / 1000;

  // ---------------- pecarí, carpintero, geoda y escarabajo ----------------
  V.fd('jabali', (c, e, t, s, antes) => {
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('jabali');
    // El recorte de embestida/aturdido sí es Forge; sueño y desaparición
    // conservan sus cierres propios del nivel.
    if (hoja?.complete && hoja.naturalWidth && e.st !== 'gone' && e.st !== 'sleep') return antes(c, e, t, s);
    let n;
    if (e.st === 'stun' || e.st === 'sleep') n = 4;
    else if (e.st === 'run') n = Math.floor(t * 14) % 4;
    else n = Math.floor((e.anim || t) * 5) % 2 ? 1 : 0;
    spr(c, 'jabali' + (e.st === 'gone' ? 5 : n), 0, .8);
  }, 'jabali0');
  const ALETEA = [0, 1, 2, 3, 2, 1];
  V.fd('carpintero', (c, e, t, s, antes) => {
    if (antes) return antes(c, e, t, s);
    const n = e.pica ? (Math.floor(t * 12) % 2 ? 6 : 5) : e.ataca > 0 ? 4 : e.st === 'sleep' ? 7 : ALETEA[Math.floor(t * 10) % 6];
    spr(c, 'carpintero' + n, 0, 1, { ay: .9 });
  }, 'carpintero0');
  V.fd('geoda', (c, e, t, s, antes) => {
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('geoda');
    if (hoja?.complete && hoja.naturalWidth) return antes(c, e, t, s);
    const n = e.choque > 0 ? 6 + Math.floor(t * 20) % 2 : Math.floor(Math.abs(e.giro || 0) * 2) % 6;
    spr(c, 'geoda' + n, 0, .5);
  }, 'geoda0');
  V.fd('escarabajo', (c, e, t) => {
    const bola = e.st === 'shell' || e.st === 'roll' || e.st === 'slide' || e.curl > .5;
    const n = bola ? 4 + Math.floor(t * 6) % 3 : e.st === 'sleep' ? 4 : Math.floor((e.anim || t) * 8) % 4;
    spr(c, 'escarabajo' + n, 0, .8);
  }, 'escarabajo0');

  V.moneda('canistel'); V.corazon('corazon'); V.meta('salida', { dy: 1.5 });
  window.LOWPOLY_CRISTAL = V;
})();
