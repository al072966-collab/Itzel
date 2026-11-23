'use strict';
// El baluarte mantiene la luz y las superficies activas del juego.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.bits32) return;
  const V = vestirNivel({ id: 'bits32', carpeta: 'noche-baluarte', ver: 2, manifiesto: window.NOCHE_BALUARTE_MANIFIESTO });
  function pixel(c, n, x, y, o = {}) {
    if (!V.listo(n)) return false;
    const m = V.TAM[n]; let k = o.k || 1;
    if (o.w) k = o.w / m.w; else if (o.h) k = o.h / m.h;
    const w = m.w * k, h = m.h * k;
    c.save(); c.imageSmoothingEnabled = false; c.globalAlpha *= o.alfa === undefined ? 1 : o.alfa;
    c.drawImage(V.IMG[n], Math.round((x - w * (o.ax ?? .5)) * 2) / 2, Math.round((y - h * (o.ay ?? 1)) * 2) / 2, w, h); c.restore(); return true;
  }
  V.spr = pixel;
  function poseSalto(e, prefijo) {
    const vy = e.vy || 0, aire = vy !== 0 || (typeof MEC.onGround === 'function' && !MEC.onGround(e));
    if (vy < -1) e._forgeFaseSalto = 'Sube'; else if (vy > 1) e._forgeFaseSalto = 'Baja';
    if (aire) return prefijo + (e._forgeFaseSalto === 'Baja' ? 'Baja' : 'Sube');
    delete e._forgeFaseSalto;
    return e.tt > 0 && e.tt < .24 ? prefijo + 'Aviso' : prefijo + 'Reposo';
  }
  const BALUARTE_FONDO = {};
  for (const [n, archivo] of Object.entries({ cielo:'cielo-mar-noche-v1', ciudad:'ciudad-baluarte-v1', palma:'palma-noche-v1' })) {
    const im = BALUARTE_FONDO[n] = new Image(); im.decoding = 'async'; im.onload = () => V.rehaz();
    im.src = '../Roguelike/assets/noche-baluarte/' + archivo + '.png';
  }
  const baluartePrincipal = f => ((f && f.g && f.g.def && f.g.def.id) || (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id)) === 'bits32';
  const baluarteListo = () => Object.values(BALUARTE_FONDO).every(i => i.complete && i.naturalWidth);
  const posteAntorcha = new Image(), llamaAntorcha = new Image();
  posteAntorcha.onload = llamaAntorcha.onload = () => V.rehaz();
  posteAntorcha.src = '../Roguelike/assets/noche-baluarte/antorcha-poste-v1.png';
  llamaAntorcha.src = '../Roguelike/assets/noche-baluarte/llama-v1.png';
  window.BALUARTE_TELON_LISTO = baluarteListo;
  function cieloBaluarte(c, f) {
    const im = BALUARTE_FONDO.cielo, H = f.H || VH, sw = Math.min(im.naturalWidth, im.naturalHeight * VW / H);
    const max = Math.max(0, im.naturalWidth - sw), sx = max * (.5 + .25 * Math.sin((f.cam || 0) * .0007));
    c.save(); c.imageSmoothingEnabled = false; c.drawImage(im, sx, 0, sw, im.naturalHeight, 0, 0, VW, H);
    const w = 560, h = w * 161 / 2136, off = (((f.cam || 0) * .1) % w + w) % w, base = 181 - (f.y0 || 0);
    for (let x = -off - w; x < VW + w; x += w) c.drawImage(BALUARTE_FONDO.ciudad, 18,328,2136,161, Math.round(x), Math.round(base - h), w, h);
    for (let i = 0; i < (window.FAUNA_ARTE?.listo('murcielagoNoche') ? 4 : 0); i++) {
      const z = VW + 80, x = ((V.h1(i,61)*z + f.t*(6+V.h1(i,62)*6) - f.cam*.18) % z + z) % z - 40;
      FAUNA_ARTE.dib(c, 'murcielagoNoche', f.t + i*.17, x, 40 + V.h1(i,63)*70 + Math.sin(f.t*1.4+i*2)*6, {w:8-(i%2)*2, ay:.5, fps:9, seq:[0,1,2,1], pixel:true});
    }
    c.restore();
  }
  // Quitar únicamente las decoraciones de figuras de la versión lateral; las variantes conservan su dibujo.
  const terrenoBaseBaluarte = V.ST.terrain;
  V.ST.terrain = function (ctx, f) {
    if (!baluartePrincipal(f) || !baluarteListo()) return terrenoBaseBaluarte.call(this, ctx, f);
    const deco = L.deco; L.deco = [];
    try { return terrenoBaseBaluarte.call(this, ctx, f); } finally { L.deco = deco; }
  };
  // cielo: luna y nubes de la lámina (pixel), y el baluarte lejano con bruma violeta
  V.cielo((c, f, antes) => {
    if (baluartePrincipal(f) && baluarteListo()) { cieloBaluarte(c, f); return; }
    antes();
    // reflejos de luna que titilan en el agua (rayitas pálidas que aparecen y se apagan)
    for (let i = 0; i < 46; i++) { const w = VW + 40, x = ((V.h1(i, 51) * w - f.cam * .3) % w + w) % w - 20, y = 176 + V.h1(i, 52) * 22, tw = Math.max(0, Math.sin(f.t * 2.2 + i * 1.7)); if (tw < .15) continue; c.fillStyle = 'rgba(210,225,255,' + (.5 * tw).toFixed(2) + ')'; c.fillRect(Math.round(x), Math.round(y), 2 + (i % 3), 1); }
    // murciélagos: siluetas oscuras que cruzan despacio, con las alas que suben y bajan
    for (let i = 0; i < (window.FAUNA_ARTE?.listo('murcielagoNoche') ? 4 : 0); i++) {
      const w = VW + 80, x = ((V.h1(i, 61) * w + f.t * (6 + V.h1(i, 62) * 6) - f.cam * .18) % w + w) % w - 40, y = 40 + V.h1(i, 63) * 70 + Math.sin(f.t * 1.4 + i * 2) * 6;
      FAUNA_ARTE.dib(c, 'murcielagoNoche', f.t + i * .17, x, y, { w: 8 - (i % 2) * 2, ay: .5, fps: 9, seq: [0, 1, 2, 1], pixel: true });
    }
    // luces fantasma que flotan sobre el agua: pálidas, cian, con un halo que respira
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) { const w = VW + 50, x = ((V.h1(i, 71) * w - f.cam * .45 + Math.sin(f.t * .5 + i * 2) * 16) % w + w) % w - 25, y = 150 + V.h1(i, 72) * 40 + Math.sin(f.t * 1.1 + i * 1.3) * 7, a = .5 + .5 * Math.sin(f.t * 1.6 + i * 2.4); glowDot(c, x, y, 3 + a * 3, '#9fe8ff', .5 * a); c.fillStyle = 'rgba(235,252,255,' + (.8 * a).toFixed(2) + ')'; c.fillRect(Math.round(x), Math.round(y), 1, 1); }
    c.restore();
    const unit = 200, off = (f.cam * .05) % unit, base = Math.floor(f.cam * .05 / unit);
    for (let k = -1; k * unit - off < VW + unit; k++) { const i = base + k; pixel(c, 'nube' + Math.floor(V.h1(i, 4) * 3), k * unit - off + V.h1(i, 6) * 60, 30 + V.h1(i, 8) * 80, { ay: .5, alfa: .6 }); }
    const u2 = 300, o2 = (f.cam * .1) % u2, b2 = Math.floor(f.cam * .1 / u2);
    for (let k = -1; k * u2 - o2 < VW + u2; k++) { const i = b2 + k; if (V.h1(i, 2) < .4) continue; pixel(c, V.h1(i, 5) < .5 ? 'baluarte' : 'puerta', k * u2 - o2 + 60, 178, { ay: 1, alfa: .38 }); }
    const g = c.createLinearGradient(0, 130, 0, 200); g.addColorStop(0, 'rgba(70,40,110,0)'); g.addColorStop(1, 'rgba(70,40,110,.35)'); c.fillStyle = g; c.fillRect(0, 130, VW, 70);
  });
  let muro = null;
  V.terreno(ctx => {
    if (V.listo('muro')) {   // el muro encalado con manchas de la lámina bajo la losa de antes
      if (!muro) { muro = ctx.createPattern(V.IMG.muro, 'repeat'); muro.setTransform(new DOMMatrix().scale(V.TAM.muro.w / V.IMG.muro.naturalWidth)); }
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip(); ctx.globalAlpha = .5; ctx.fillStyle = muro; ctx.fillRect(0, 0, L.ww, VH + 40);
      const g = ctx.createLinearGradient(0, 140, 0, VH + 20); g.addColorStop(0, 'rgba(20,10,40,0)'); g.addColorStop(1, 'rgba(20,10,40,.75)'); ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 130, L.ww, VH);
      ctx.restore();
    }
    for (const o of L.deco) {
      const x = o.x + 8, y = o.y + .5, i = o.i;
      if (o.k === 'T' && baluartePrincipal() && baluarteListo() && i % 2 === 0) {
        ctx.save(); ctx.imageSmoothingEnabled = false;
        ctx.drawImage(BALUARTE_FONDO.palma, 77,50,874,1450, x - 19, y - 60, 38, 60); ctx.restore();
      } else if (o.k === 'T') pixel(ctx, ['barril', 'garita', 'canon', 'ancla', 'balas', 'bolardo'][i % 6], x, y);
      else if (o.k === 'f') { pixel(ctx, ['antorcha0', 'antorcha1'][i % 2], x, y - 6); }
      else if (o.k === 'r') pixel(ctx, ['farol0', 'farol1', 'canon', 'balas'][i % 4], x, y - (i % 4 < 2 ? 8 : 0));
    }
    // brillo cálido de las antorchas sobre su muro
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const o of L.deco) if (o.k === 'f') glowDot(ctx, o.x + 8, o.y - 14, 16, '#ff9a40', .2 + .05 * Math.sin((o.x + performance.now() / 120) % 6.28));
    ctx.restore();
  }, true);
  // La antorcha interactiva conserva su temporizador y su radio de luz.
  V.obj('antorcha', (c, o, f, sk, antes) => {
    if (!baluartePrincipal(f) || !posteAntorcha.complete || !posteAntorcha.naturalWidth || !llamaAntorcha.complete || !llamaAntorcha.naturalWidth)
      return antes(c, o, f, sk);
    const x = Math.round(o.x), y = o.y, visible = o.lit > 0 && !(o.lit < 1.5 && Math.sin(f.t * 20) > 0);
    c.save(); c.imageSmoothingEnabled = false;
    if (visible) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x, y - 30, 46, '#ff7a1a', .35); c.restore(); }
    c.drawImage(posteAntorcha, 407, 89, 210, 1383, x - 4, y - 25, 8, 25);
    if (visible) {
      const h = 9 + Math.sin(f.t * 14) * .7;
      c.drawImage(llamaAntorcha, 502, 303, 259, 550, x - 3.5, y - 24 - h, 7, h);
    }
    c.restore();
  }, 'antorcha0');
  V.fd('fantasma', (c, e, t, s, antes) => {
    if (e.st === 'sleep') { c.save(); c.filter = 'brightness(.72)'; pixel(c, 'fantasma', 0, 0, { alfa: .35 }); c.restore(); return; }   // dormido: la misma pieza, apagada
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('fantasma');
    if (hoja?.complete && hoja.naturalWidth) {
      antes(c, e, t, s);
      if (!e.visible) { c.fillStyle = '#ffd04a'; c.fillRect(.5, -10.5, 1, 1); c.fillRect(3, -10.5, 1, 1); }
      return;
    }
    const v = Math.max(0, Math.min(1, e.vis || 0));
    pixel(c, 'fantasma', 0, 0, { alfa: .22 + v * .7 });
    if (!e.visible) { c.fillStyle = '#ffd04a'; c.fillRect(.5, -10.5, 1, 1); c.fillRect(3, -10.5, 1, 1); }
  }, 'fantasma');
  V.fd('soplo', (c, e, t, s, antes) => {
    if (e.st === 'sleep') { c.save(); c.filter = 'brightness(.72)'; pixel(c, 'soplo', 0, .5); c.restore(); return; }   // dormido: la misma pieza, apagada
    const n = e.sopla > 0 && V.listo('soploSopla') ? 'soploSopla' : 'soplo'; pixel(c, n, 0, .5);
  }, 'soplo');
  V.fd('calavera', (c, e, t, s, antes) => {
    if (e.st === 'sleep') { c.save(); c.filter = 'brightness(.72)'; pixel(c, 'calavera', 0, .5); c.restore(); return; }   // dormido: la misma pieza, apagada
    const n = poseSalto(e, 'calavera');
    if (V.listo(n)) { pixel(c, n, 0, .5); return; }
    pixel(c, (e.vy !== 0 || (typeof MEC.onGround === 'function' && !MEC.onGround(e))) && V.listo('calaveraSalta') ? 'calaveraSalta' : 'calavera', 0, .5);
  }, 'calavera');
  V.moneda('canistel'); V.corazon('corazon');
  window.NOCHE_BALUARTE = V;
})();
