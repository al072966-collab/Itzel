'use strict';
// =====================================================================
//  TALLA DE MADERA, CON SUS ASSETS (estilo grabado en linóleo)
//  El taller y el terreno grabado se quedan. Lo de enfrente usa las piezas
//  de tools/grabado-talla.py (Roguelike/assets/talla):
//    · las tablas de las ruedas (con la cubierta medida);
//    · los bloques de madera que talla la gubia: tableros clavados, uno
//      por casilla (sin estirarse), del tamaño exacto de su colisión;
//    · el rodillo de entintar sigue siendo el del juego (su alto es la
//      colisión), con el charco de tinta de la lámina abajo;
//    · catrín (camina, avienta y recibe el sombrero de la lámina),
//      carcoma y calaverita. El jabalí se queda el del juego: el de la
//      lámina salió puercoespín;
//    · árbol, cajas, estantes, prensa y flores; canistel, corazón y puerta.
//  Nada cambia colisiones ni mecánicas. Solo aplica a «Talla de madera».
// =====================================================================
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.grabado) return;
  const V = vestirNivel({ id: 'grabado', carpeta: 'talla', ver: 1 });
  const { spr, h1, TAM, IMG } = V;

  // el casco de un barco a medio hacer sobre su grada (los astilleros de Campeche), grabado en linóleo, al fondo
  V.cielo((c, f, antes) => {
    antes();
    const u = 340, off = (f.cam * .1) % u, base = Math.floor(f.cam * .1 / u);
    c.save(); c.globalAlpha = .7;
    for (let k = -1; k * u - off < VW + u; k++) { const i = base + k; if (h1(i, 2) < .25) continue; const x = k * u - off + 90 + h1(i, 5) * 80; spr(c, 'astillero', x, 168, { ay: 1, k: 1.5 }); spr(c, 'astilleroMastil', x + 38, 150, { ay: 1, k: 1.2 }); }
    c.restore();
  });
  // vida de astillero en grabado: gaviotas de trazo, virutas que flotan y chispas de martillo junto a los cascos
  V.cielo((c, f, antes) => {
    antes();
    const t = f.t, TINTA = '#1a1614', PAPEL = '#efe6d2';
    c.save(); c.strokeStyle = TINTA; c.lineWidth = .9; c.lineCap = 'round';
    for (let i = 0; i < (window.FAUNA_ARTE?.listo('gaviotaGrabado') ? 4 : 0); i++) {                     // gaviotas (lámina)
      const w = VW + 80, x = ((h1(i, 41) * w - f.cam * .08 + t * (7 + i * 2)) % w + w) % w - 40, y = 30 + h1(i, 42) * 60 + Math.sin(t * .9 + i * 2) * 5;
      FAUNA_ARTE.dib(c, 'gaviotaGrabado', t + i * .31, x, y, { w: 8 - (i % 2) * 1.5, ay: .5, fps: 5, seq: [0, 1, 3, 2, 3, 1] });
    }
    c.fillStyle = PAPEL; c.strokeStyle = TINTA; c.lineWidth = .5;
    for (let i = 0; i < 14; i++) {                                        // virutas de madera rizadas
      const w = VW + 40, x = ((h1(i, 51) * w - f.cam * .22 + t * (3 + h1(i, 52) * 3)) % w + w) % w - 20, y = ((h1(i, 53) * 180 + t * (5 + h1(i, 54) * 6)) % 180) + 10, r = t * 2 + i;
      c.save(); c.translate(x, y); c.rotate(r); c.beginPath(); c.arc(0, 0, 2, .3, 5); c.stroke(); c.restore();
    }
    c.restore();
    const u = 340, off = (f.cam * .1) % u, base = Math.floor(f.cam * .1 / u);
    for (let k = -1; k * u - off < VW + u; k++) {                         // martilleo: chispa seca junto al casco
      const i = base + k; if (h1(i, 2) < .25) continue;
      const x = k * u - off + 90 + h1(i, 5) * 80 + 30, ph = (t * 1.6 + h1(i, 6) * 5) % 2;
      if (ph < .5) { const a = 1 - ph / .5; c.save(); c.strokeStyle = '#c23b2e'; c.lineWidth = 1.2; c.lineCap = 'round'; c.globalAlpha = a; for (let q = 0; q < 6; q++) { const an = q * 1.05 + h1(i, q) * .6, r = 2 + ph * 22; c.beginPath(); c.moveTo(x + Math.cos(an) * 2, 140 + Math.sin(an) * 2); c.lineTo(x + Math.cos(an) * r, 140 + Math.sin(an) * r); c.stroke(); } c.restore(); }
    }
  });
  V.terreno((ctx, f) => {
    for (const r of L.tops) for (let x = r.x0 + 14; x < r.x1 - 14; x += 32 + h1(x | 0, r.y) * 48) if (h1(x | 0, 101) > .62) spr(ctx, ['flor0', 'flor1', 'flor2', 'banco'][Math.floor(h1(x | 0, 102) * 4)], x, r.y + 1, { voltea: h1(x | 0, 103) < .5 });
    for (const o of L.deco) {
      const x = o.x, y = o.y + 1, v = h1(o.i, 7);
      if (o.k === 'T') spr(ctx, ['arbol', 'prensa', 'arbol', 'cajas'][o.i % 4], x, y, { voltea: v < .5 });
      else if (o.k === 'f') spr(ctx, ['estante0', 'estante1', 'cajas'][o.i % 3], x, y, { voltea: v < .5 });
      else if (o.k === 'r') spr(ctx, ['banco', 'flor2'][o.i % 2], x, y);
    }
  });

  V.look('plank', (c, pl) => {
    const n = 'tabla' + (pl.w > 40 ? 2 : Math.floor(h1(Math.round((pl.ph || 0) * 10), 3) * 2)), t = TAM[n];
    spr(c, n, pl.x + pl.w / 2, pl.y - .4, { ay: t.cubierta || .15, w: pl.w + 4 });
  }, 'tabla0');
  V.solido('wood', (c, s) => {
    if (s.on === false) return true;
    c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    for (let x = s.x; x < s.x + s.w - .5; x += T) for (let y = s.y; y < s.y + s.h - .5; y += T) c.drawImage(IMG.tablero, x, y, Math.min(T, s.x + s.w - x), Math.min(T, s.y + s.h - y));
    c.restore(); return true;
  }, 'tablero');
  V.look('rodillo', (c, pl, f, sk, antes) => {
    spr(c, 'charco', pl.x + pl.w / 2, (pl.base || pl.y + 32) + 1.2, { w: pl.w + 14, alfa: .85 });
    antes(c, pl, f, sk);
  }, 'charco');
  V.obj('sombrero', (c, o, f) => { c.save(); c.translate(o.x, o.y); c.rotate(Math.sin(f.t * 14) * .5); spr(c, 'sombrero', 0, 1, { ay: .7 }); c.restore(); }, 'sombrero');

  V.fd('catrin', (c, e, t, s, antes) => {
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('catrin');
    if (hoja?.complete && hoja.naturalWidth) return antes(c, e, t, s);
    let n;
    if (e.lanza > 0) n = e.lanza > .15 ? 6 : 7;
    else if (!e.conSombrero) n = [8, 9][Math.floor(t * 3) % 2];
    else if (e.st === 'sleep') n = 0;
    else n = 1 + Math.floor((e.anim || t) * 6) % 4;
    spr(c, 'catrin' + n, 0, .8);
  }, 'catrin0');
  V.fd('carcoma', (c, e, t, s, antes) => antes(c, e, t, s), 'carcoma0');
  V.fd('calavera', (c, e, t) => {
    const n = Math.abs(e.vy || 0) > 1 ? 2 + Math.floor(t * 8) % 4 : e.st === 'sleep' ? 6 : [0, 1, 7, 8][Math.floor(t * 4) % 4];
    spr(c, 'calavera' + n, 0, .6);
  }, 'calavera0');

  V.moneda('canistel'); V.corazon('corazon'); V.meta('salida', { dy: 1.5 });
  window.GRABADO_TALLA = V;
})();
