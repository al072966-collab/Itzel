'use strict';
// =====================================================================
//  LA CATEDRAL DE VIDRIO, CON SUS ASSETS (estilo vitral)
//  El telón (la nave con sus vitrales) y el terreno se quedan. Lo de
//  enfrente usa las piezas de tools/vitral-catedral.py
//  (Roguelike/assets/catedral):
//    · vidrio resbaloso (losas de vidrio azul, con la cubierta medida);
//    · el candelabro que sube y cae (la bandeja de la lámina; las cadenas
//      y las velas de aviso siguen siendo del juego);
//    · escarabajo joya (camina y rueda), gárgola (posada sin la roca de la
//      lámina, en vuelo, y encerrada en el cubo de vidrio de Fresita),
//      campana (brinca y repica con los arcos de sonido) e iguana;
//    · velas y gemas; canistel, corazón y la portada de salida.
//  Los vitrales, columnas y candelabros colgantes de la lámina no se usan
//  de frente: se confundirían con muros y plataformas.
//  Nada cambia colisiones ni mecánicas. Solo aplica a «La catedral de vidrio».
// =====================================================================
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.vitral) return;
  const V = vestirNivel({ id: 'vitral', carpeta: 'catedral', ver: 1, manifiesto: window.VITRAL_CATEDRAL_MANIFIESTO });
  const { spr, h1, TAM } = V;
  const cenefaVidrio = new Image();
  cenefaVidrio.onload = () => V.rehaz(); cenefaVidrio.src = '../Roguelike/assets/catedral/cenefa-vidrio-v1.png';
  const paisaje = {};
  for (const [n, archivo] of Object.entries({ fondo:'panorama-catedral-v2.webp', suelo:'mosaico-oscuro-v1.png' })) {   // el panorama nuevo es el del rediseño de ChatGPT (misma proporción que el anterior)
    const im = paisaje[n] = new Image(); im.onload = () => V.rehaz();
    im.src = '../Roguelike/assets/catedral/' + archivo;
  }
  const principal = f => ((f.g && f.g.def && f.g.def.id) || (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id)) === 'vitral';
  const paisajeListo = () => Object.values(paisaje).every(im => im.complete && im.naturalWidth);
  window.VITRAL_PANORAMA_LISTO = paisajeListo;

  // telón: palomas que cruzan, polvo de colores en la luz del vitral y humo de incienso
  V.cielo((c, f, antes) => {
    if (principal(f) && paisajeListo()) {
      const ancho = 700, base = 176 - (f.y0 || 0), alto = f.H || VH, off = ((f.cam * .10 % ancho) + ancho) % ancho;
      const arriba = Math.min(0, base - 176);
      c.save(); c.fillStyle = '#17132e'; c.fillRect(0, 0, VW, alto);
      for (let x = -off - ancho; x < VW + ancho; x += ancho) {
        c.drawImage(paisaje.fondo, 0, 0, 2172, 520, x, arriba, ancho, base - arriba);
        c.drawImage(paisaje.fondo, 0, 520, 2172, 204, x, base, ancho, Math.max(1, alto - base));
      }
      c.fillStyle = 'rgba(16,12,38,.26)'; c.fillRect(0, 0, VW, alto); c.restore();
    } else antes();
    const t = f.t;
    c.save(); c.globalCompositeOperation = 'lighter';
    const col = ['255,120,110', '120,190,255', '255,220,120', '150,255,170'];
    for (let i = 0; i < 44; i++) {
      const w = VW + 40, x = ((h1(i, 51) * w - f.cam * .15 + Math.sin(t * .4 + i) * 6) % w + w) % w - 20, y = ((h1(i, 52) * 220 + t * (2 + h1(i, 53) * 3)) % 220);
      c.globalAlpha = .9 * Math.sin(Math.PI * y / 220); c.fillStyle = 'rgb(' + col[i % 4] + ')'; c.fillRect(x - .5, y - .5, 2.2, 2.2); c.globalAlpha *= .35; c.fillRect(x - 1.5, y - 1.5, 4.2, 4.2);
    }
    c.restore();
    for (let k = 0; k < 3; k++) {                                          // humo de incienso que sube y se ondula
      const x0 = ((k * 150 + 60 - f.cam * .3) % (VW + 100) + VW + 100) % (VW + 100) - 50;
      c.save(); c.strokeStyle = 'rgba(235,225,210,.22)'; c.lineWidth = 1.1; c.lineCap = 'round'; c.beginPath();
      for (let y = 170; y > 90; y -= 4) { const u = (170 - y) / 80, x = x0 + Math.sin(y * .09 + t * 1.2 + k) * (2 + u * 7); y === 170 ? c.moveTo(x, y) : c.lineTo(x, y); }
      c.globalAlpha = .8; c.stroke(); c.restore();
    }
    const per = 15, T = (t + 3) % per;                                     // parvada de palomas
    if (T < 6) for (let i = 0; i < (window.FAUNA_ARTE?.listo('palomaVitral') ? 5 : 0); i++) {         // parvada de palomas (lámina)
      const u = T / 6, x = VW + 20 - u * (VW + 70) + i * 11, y = 36 + (i % 3) * 11 + Math.sin(u * 8 + i) * 4;
      FAUNA_ARTE.dib(c, 'palomaVitral', t + i * .17, x, y, { w: 7 - (i % 2), ay: .5, fps: 8, seq: [0, 1, 2, 1], voltea: true });
    }
  });

  let mosaico = null;
  V.terreno((ctx, f) => {
    if (principal(f) && paisajeListo()) {
      if (!mosaico) { mosaico = ctx.createPattern(paisaje.suelo, 'repeat'); mosaico.setTransform(new DOMMatrix().scale(500 / paisaje.suelo.naturalWidth)); }
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip(); ctx.fillStyle = mosaico;
      for (const r of L.tops) ctx.fillRect(r.x0, r.y + 8, r.x1 - r.x0, VH + 40);
      ctx.restore();
      if (cenefaVidrio.complete && cenefaVidrio.naturalWidth) {
        ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip();
        for (const r of L.tops) {
          ctx.save(); ctx.beginPath(); ctx.rect(r.x0, r.y, r.x1 - r.x0, 8); ctx.clip();
          for (let x = r.x0; x < r.x1; x += 110)
            ctx.drawImage(cenefaVidrio, 0, 278, 2172, 158, x, r.y, 110, 8);
          ctx.restore();
        }
        ctx.restore();
      }
    }
    for (const r of L.tops) for (let x = r.x0 + 12; x < r.x1 - 12; x += 30 + h1(x | 0, r.y) * 50) if (h1(x | 0, 81) > .6) spr(ctx, 'gema' + Math.floor(h1(x | 0, 82) * 5), x, r.y + 1, { voltea: h1(x | 0, 83) < .5 });
    for (const o of L.deco) {
      const x = o.x, y = o.y + 1;
      if (o.k === 'T') spr(ctx, 'velaGrande', x, y);
      else if (o.k === 'f') spr(ctx, 'vela', x, y);
      else if (o.k === 'r') spr(ctx, 'gema' + (o.i % 5), x, y);
    }
  });

  // ---------------- vidrio y candelabro ----------------
  V.look('ice', (c, pl) => {
    const n = 'vidrio' + Math.floor(h1(Math.round(pl.x0 ?? pl.x), 2) * 4), t = TAM[n];
    spr(c, n, pl.x + pl.w / 2, pl.y - .4, { ay: t.cubierta || .2, w: pl.w + 4 });
  }, 'vidrio0');
  V.look('candelabro', (c, pl, f, sk, antes) => {
    const sh = pl.avisa ? (Math.random() - .5) * 1.4 : 0, cx = pl.x + pl.w / 2 + sh, top = pl.y0 - (pl.sube || 80) - 50;
    c.strokeStyle = '#5a4a2a'; c.lineWidth = .7; c.setLineDash([1.4, 1]); for (const dx of [-pl.w * .35, pl.w * .35]) { c.beginPath(); c.moveTo(cx, top); c.lineTo(cx + dx, pl.y - 1); c.stroke(); } c.setLineDash([]);
    const t = TAM.candelabro; spr(c, 'candelabro', cx, pl.y - .4, { ay: t.cubierta || .2, w: pl.w + 6 });
    for (let k = 0; k < 4; k++) { const vx = pl.x + sh + 4 + k * (pl.w - 8) / 3; c.fillStyle = '#f4ead0'; c.fillRect(vx - .8, pl.y - 4.5, 1.6, 4); c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, vx, pl.y - 6, pl.avisa ? 5 : 3.5, pl.avisa ? '#ff8040' : '#ffd36b', .6); c.restore(); }
  }, 'candelabro');

  // ---------------- escarabajo, gárgola, campana e iguana ----------------
  V.fd('escarabajo', (c, e, t) => {
    const anim = e.anim ?? t;
    const bola = e.st === 'shell' || e.st === 'roll' || e.st === 'slide' || e.curl > .5 || Math.abs(e.vx || 0) > 60;
    const n = e.st === 'sleep' || e.aturde > 0 ? 7 : bola ? 4 + Math.floor(anim * 10) % 3 : Math.floor(anim * 8) % 4;
    spr(c, 'escarabajo' + n, 0, .8);
  }, 'escarabajo0');
  V.fd('gargola', (c, e, t, s, antes) => {
    if (e.st === 'glass') { spr(c, 'gargolaVidrio', 0, 1); return; }
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('gargola');
    if (hoja?.complete && hoja.naturalWidth) return antes(c, e, t, s);
    if (e.fase === 'posada' || !e.fase) { spr(c, 'gargola' + [0, 1, 0, 2][Math.floor(t * 1.5) % 4], 0, 1); return; }
    spr(c, 'gargolaVuela' + (e.fase === 'baja' ? 3 + Math.floor(t * 8) % 2 : Math.floor(t * 9) % 3), 0, 2, { ay: .9 });
  }, 'gargola0');
  V.fd('campana', (c, e, t, s, antes) => antes(c, e, t, s), 'campana0');
  V.obj('repique', (c, o) => {
    const a = 1 - o.t / 1.2; spr(c, 'repique', o.x, o.y + .5, { alfa: a, voltea: o.dir < 0, k: .8 + o.t * .4 });
  }, 'repique');
  V.fd('iguana', (c, e, t) => {
    const n = e.st === 'sleep' || e.aturde > 0 ? 7 : Math.abs(e.vx || 0) > 50 ? 'Grita' : Math.floor((e.anim || t) * 8) % 6;
    spr(c, 'iguana' + n, 0, .8);
  }, 'iguana0');

  V.moneda('canistel'); V.corazon('corazon'); V.meta('salida', { dy: 1.5 });
  window.VITRAL_CATEDRAL = V;
})();
