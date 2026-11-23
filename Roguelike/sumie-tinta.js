'use strict';
// =====================================================================
//  NUBES DE TINTA, CON SUS ASSETS (estilo sumi-e)
//  El telón y el terreno de tinta lavada se quedan (ya eran sumi-e hecho
//  por código). Lo de enfrente usa las piezas de tools/sumie-tinta.py
//  (Roguelike/assets/tinta, 6 px por unidad):
//    · nubes que se pisan (con la cubierta medida) y se borran como antes;
//    · biombos de perfil que giran (el ancho visible es el de la colisión);
//    · la tinta de Fresita en la pared (brochazo de la lámina) y su salpicadura;
//    · culebra coralillo (se arrastra, se enrosca y muerde), mancha y koi;
//    · pinos, ciruelos, sauces, bambú, carrizo, hierba, rocas y linterna;
//    · canistel, corazón y el arco de piedra de la salida.
//  Nada cambia colisiones ni mecánicas. Solo aplica al estilo «sumie».
// =====================================================================
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.sumie) return;
  const V = vestirNivel({ id: 'sumie', carpeta: 'tinta', ver: 2, manifiesto: window.SUMIE_TINTA_MANIFIESTO });
  const { spr, h1, TAM, IMG, listo } = V, ROJ = '#c23b2e', TIN = '#1d1b19';
  const paisaje = {};
  for (const [n, archivo] of Object.entries({ fondo:'fondo-laguna.webp', suelo:'suelo-tinta-v1.png' })) {   // el telón es la laguna nueva (ChatGPT, rediseño del palo de tinte)
    const im = paisaje[n] = new Image();
    im.onload = () => V.rehaz(); im.src = '../Roguelike/assets/tinta/' + archivo;
  }
  const nivelPrincipal = f => ((f.g && f.g.def && f.g.def.id) || (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id)) === 'sumie';
  const paisajeListo = () => Object.values(paisaje).every(im => im.complete && im.naturalWidth);

  // ---------------- telón: flores de tinta, lluvia a pincel y sello ----------------
  V.cielo((c, f, antes) => {
    if (nivelPrincipal(f) && paisajeListo()) {
      const alto = f.H || VH, im = paisaje.fondo, sw = Math.min(im.naturalWidth, im.naturalHeight * VW / VH);
      // la laguna se recorre despacio con la cámara: del manglar de la izquierda al ocaso de la derecha (ya trae aves y lancha: sin duplicarlas)
      const sx = Math.max(0, (im.naturalWidth - sw) * clamp(.5 + .5 * Math.sin(f.cam * .00045 - 1.2), 0, 1));
      // el agua de la laguna llega justo al borde del terreno (y = 177); debajo se alarga el papel
      c.fillStyle = '#e4d4b2'; c.fillRect(0, 0, VW, alto);
      c.drawImage(im, sx, 0, sw, im.naturalHeight, 0, -14, VW, VH);
    } else antes();
    for (let q = 0; q < 4; q++) {                                  // manchas que se abren sobre el papel como flores de agua
      const per = 5.5, T = f.t + q * 1.4, tt = T % per, n = Math.floor(T / per), u = tt / per, r = 4 + u * 26, al = Math.sin(Math.min(1, u * 1.2) * Math.PI) * .16;
      const x = 40 + h1(n * 4 + q, 71) * (VW - 80), y = 30 + h1(n * 4 + q, 72) * 100;
      const g = c.createRadialGradient(x, y, r * .2, x, y, r);
      g.addColorStop(0, 'rgba(30,28,32,' + al.toFixed(3) + ')'); g.addColorStop(.7, 'rgba(30,28,32,' + (al * .6).toFixed(3) + ')'); g.addColorStop(1, 'rgba(30,28,32,0)');
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill();
    }
    c.save(); c.strokeStyle = 'rgba(50,48,52,.3)'; c.lineWidth = .6; c.lineCap = 'round';   // trazos de lluvia
    for (let i = 0; i < 38; i++) {
      const w = VW + 60, ph = (f.t * (.7 + h1(i, 81) * .5) + h1(i, 82)) % 1, x = ((h1(i, 83) * w - f.cam * .25 + ph * 22) % w + w) % w - 30, y = -10 + ph * 200;
      c.globalAlpha = Math.sin(ph * Math.PI); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 3, y + 11); c.stroke();
    }
    c.restore();
    { const tt = f.t % 9, al = tt < .5 ? tt / .5 : tt > 6 ? Math.max(0, 1 - (tt - 6) / 2.5) : 1;   // sello de lacre en la esquina
      if (al > 0) { const x = VW - 38, y = 30; c.save(); c.globalAlpha = al * .6; c.fillStyle = ROJ; c.beginPath(); c.arc(x, y, 8, 0, 6.2832); c.fill(); c.fillStyle = '#f2ead8'; c.fillRect(x - 3.5, y - 1, 7, 2); c.fillRect(x - 1, y - 3.5, 2, 7); c.restore(); } }
  });

  // ---------------- adornos sobre el terreno de tinta ----------------
  let patronSuelo = null;
  V.terreno((ctx, f) => {
    if (nivelPrincipal(f) && paisajeListo()) {
      if (!patronSuelo) { patronSuelo = ctx.createPattern(paisaje.suelo, 'repeat'); patronSuelo.setTransform(new DOMMatrix().scale(160 / paisaje.suelo.naturalWidth)); }
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip(); ctx.fillStyle = patronSuelo; ctx.fillRect(0, 0, L.ww, VH + 40); ctx.restore();
    }
    for (const r of L.tops) {                                   // matas de hierba a pincel, bajitas y salteadas
      for (let x = r.x0 + 10; x < r.x1 - 10; x += 22 + h1(x | 0, r.y) * 40) if (h1(x | 0, 31) > .55) spr(ctx, 'hierba' + Math.floor(h1(x | 0, 32) * 3), x, r.y + 1.2, { voltea: h1(x | 0, 33) < .5, k: .8 });
    }
    for (const o of L.deco) {
      const x = o.x, y = o.y + 1.5, v = h1(o.i, 7);
      if (o.k === 'T') spr(ctx, ['pino', 'ciruelo', 'sauce', 'bambu', 'pino2'][o.i % 5], x, y, { voltea: v < .5 });
      else if (o.k === 'f') spr(ctx, ['carrizo', 'linterna', 'ciruelo2', 'bambu2'][o.i % 4], x, y, { voltea: v < .5 });
      else if (o.k === 'r') spr(ctx, ['roca0', 'piedras', 'raiz'][o.i % 3], x, y + .5, { voltea: v < .5 });
    }
  });

  // ---------------- nubes que se pisan ----------------
  V.look('inkcloud', (c, pl, f, sk, antes) => {
    const k = pl.k === 'timed' ? (pl.on ? clamp(Math.min(pl.ph / .1, ((pl.duty || .62) - pl.ph) / .15), 0, 1) : 0) : 1;
    if (k < .05 && pl.k === 'timed') return antes(c, pl, f, sk);          // la sombrita de donde va a salir
    const n = 'nube' + Math.floor(h1(Math.round(pl.x0 ?? pl.x), 5) * 3), t = TAM[n];
    const w = pl.w + 8, kk = w / t.w;
    c.save(); c.globalAlpha *= .25 + k * .75;
    // al borrarse se encoge un poco hacia el centro
    spr(c, n, pl.x + pl.w / 2, pl.y - .4, { ay: t.cubierta || .2, k: kk * (.85 + k * .15) });
    c.restore();
  }, 'nube0');

  // ---------------- biombos que giran ----------------
  V.obj('biombo', (c, o, f) => {
    // los biombos son muros altos: un marco laqueado del ancho de su colisión (6) y, como hojas del
    // biombo, los cuatro paneles pintados de la lámina uno sobre otro (sin estirarse), con sus herrajes dorados
    const s = o.s, g = Math.max(.08, o.giro), cx = s.x + 3, P = TAM.panel0, ph = P.h, w = 7 * g;
    c.save(); c.translate(cx, 0); c.scale(g, 1);
    c.fillStyle = TIN; c.fillRect(-3.5, s.y, 7, s.h);
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.save(); c.beginPath(); c.rect(-2.5, s.y + 1, 5, s.h - 2); c.clip();
    let i = Math.round(s.x / 7);
    for (let y = s.y + s.h - 1; y > s.y; y -= ph + 1, i++) c.drawImage(IMG['panel' + (i % 4)], -2.5, y - ph, 5, ph);
    c.restore();
    c.fillStyle = TIN; for (let y = s.y + s.h - 1; y > s.y; y -= ph + 1) c.fillRect(-3.5, y, 7, 1);
    c.fillStyle = '#c9a24a'; for (let y = s.y + s.h - 1; y > s.y; y -= ph + 1) { c.fillRect(-3.5, y - .2, 1.4, 1.4); c.fillRect(2.1, y - .2, 1.4, 1.4); }
    c.restore();
    const t2 = o.per - (o.t % o.per); if (t2 < .6) { c.fillStyle = `rgba(194,59,46,${.6 * (1 - t2 / .6)})`; c.fillRect(s.x - 1, s.y - 4, 8, 2); }
  }, 'panel0');

  // ---------------- la tinta de Fresita en la pared ----------------
  V.zona('tinta', (ctx, z, f) => {
    const a = Math.min(1, z.life, z.t * 4), s = -z.lado, im = IMG.pared, h = z.y1 - z.y0;
    ctx.save(); ctx.globalAlpha = a; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.translate(z.fx, z.y0); ctx.scale(s, 1);
    // un filo de papel mojado alrededor del brochazo: que se lea sobre la pared oscura
    ctx.strokeStyle = 'rgba(240,231,210,.55)'; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(0, -1);
    for (let y = -1; y <= h + 2; y += 3) ctx.lineTo(6 + hash1(Math.floor(y + z.y0), 3) * 2, y); ctx.lineTo(0, h + 2); ctx.stroke();
    ctx.drawImage(im, 0, -2, 7, h + 4 + Math.min(4, z.t * 2));          // el brochazo, un poco corrido hacia abajo
    ctx.restore();
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = ROJ; ctx.fillRect(z.fx + s * 3 - 1.5, z.y0 + 3, 3, 3);   // el sello rojo
    if (z.agarre > 0) { z.agarre -= 1 / 60; ctx.strokeStyle = 'rgba(194,59,46,.7)'; ctx.lineWidth = .7; ctx.strokeRect(z.fx + Math.min(0, s * 7), z.y0, 7, h); }
    ctx.restore();
  }, 'pared');
  if (MEC.POW.nube) {
    const antes = MEC.POW.nube.click;
    MEC.POW.nube.click = function (g, x, y, c) {
      const n = g.zones.length, ok = antes.call(this, g, x, y, c);
      if (ok && g.objs && g.zones.length > n) { const z = g.zones[g.zones.length - 1]; g.objs.push({ k: 'tintaVista', x: z.fx, y, lado: z.lado, t: 0 }); }
      return ok;
    };
  }
  MEC.OBJ.tintaVista = {
    step(o, g, dt) { o.t += dt; if (o.t > .45) o.dead = true; },
    draw(c, o, f) {
      if (!V.activo() || !listo('salpica2')) return;
      const a = 1 - o.t / .45, n = o.t < .1 ? 'salpica0' : o.t < .22 ? 'salpica1' : 'salpica2';
      spr(c, n, o.x - o.lado * 2, o.y + 6, { ay: 1, alfa: a, voltea: o.lado > 0, rot: -o.lado * Math.PI / 2 * .9 });
    },
  };

  // ---------------- culebra, mancha y koi ----------------
  const REPTA = [3, 4, 5, 6, 5, 4];
  V.fd('culebra', (c, e, t) => {
    const assets = window.ENEMIGOS_ASSETS, hoja = null;   // el coralillo nuevo (12 poses) reemplaza a la hoja anterior
    if (hoja && hoja.complete && hoja.naturalWidth && e.st !== 'gone' && e.st !== 'lunge' && e.st !== 'sleep' && !(e.aturde > 0) && !(e.tt > .3 && e.st === 'ok')) {
      assets.pinta(c, e, t, 'culebra', null); return;
    }
    let n;
    if (e.st === 'gone') n = 2;
    else if (e.st === 'lunge') n = 9;
    else if (e.st === 'sleep' || e.aturde > 0) n = 0;
    else if (e.tt > .3 && e.st === 'ok') n = [7, 8][Math.floor(t * 3) % 2];   // recién mordió: se levanta
    else n = REPTA[Math.floor((e.anim || t) * 7) % REPTA.length];
    spr(c, 'culebra' + n, 0, .6);
  }, 'culebra3');
  V.fd('mancha', (c, e, t) => {
    const peg = e.pegada > 0;
    c.save(); c.rotate(Math.sin(t * 3 + (e.x || 0)) * .08);
    if (peg) spr(c, 'mancha2', 0, 2, { h: 13 }); else spr(c, Math.floor(t * 2.5) % 3 === 2 ? 'mancha1' : 'mancha0', 0, 2, { w: 17 });
    c.restore();

  }, 'mancha0');
  const NADA = [0, 1, 2, 3, 4, 6, 4, 3, 2, 1];
  V.fd('koi', (c, e, t) => {
    const n = e.st === 'gone' ? 5 : NADA[Math.floor(t * 6 + (e.anim || 0)) % NADA.length];
    spr(c, 'koi' + n, 0, -4, { ay: .5 });
  }, 'koi0');

  // ---------------- canistel, corazón y el arco de salida ----------------
  V.moneda('canistel'); V.corazon('corazon'); V.meta('salida', { dy: 1.5 });
  window.SUMIE_TINTA = V;
})();
