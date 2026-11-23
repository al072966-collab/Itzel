'use strict';
// Calakmul: los dibujos de flores, nauyaca y carga conservan su animación y mecánica.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.bits64) return;
  const V = vestirNivel({ id: 'bits64', carpeta: 'selva-calakmul', ver: 1, manifiesto: window.SELVA_CALAKMUL_MANIFIESTO });
  function pixel(c, n, x, y, o = {}) {
    if (!V.listo(n)) return false;
    const m = V.TAM[n]; let k = o.k || 1;
    if (o.w) k = o.w / m.w; else if (o.h) k = o.h / m.h;
    const w = m.w * k, h = m.h * k;
    c.save(); c.imageSmoothingEnabled = false; c.globalAlpha *= o.alfa === undefined ? 1 : o.alfa;
    c.drawImage(V.IMG[n], Math.round((x - w * (o.ax ?? .5)) * 3) / 3, Math.round((y - h * (o.ay ?? 1)) * 3) / 3, w, h); c.restore(); return true;
  }
  V.spr = pixel;
  const SELVA_FONDO = {};
  for (const [n, archivo] of Object.entries({ cielo:'fondo-selva-v1', liana:'liana-selva-v1', tierra:'tierra-selva-v1', ruina:'cerro-ruina-v1', pasto:'pasto-selva-v1', dosel:'dosel-selva-v1' })) {
    const im = SELVA_FONDO[n] = new Image(); im.decoding = 'async'; im.onload = () => V.rehaz();
    im.src = '../Roguelike/assets/selva-calakmul/' + archivo + '.png';
  }
  const selvaPrincipal = f => ((f && f.g && f.g.def && f.g.def.id) || (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id)) === 'bits64';
  const selvaListo = () => Object.values(SELVA_FONDO).every(i => i.complete && i.naturalWidth);
  window.SELVA_TELON_LISTO = selvaListo;
  function cieloSelva(c, f) {
    const im = SELVA_FONDO.cielo, H = f.H || VH, sw = Math.min(im.naturalWidth, im.naturalHeight * VW / H);
    const max = Math.max(0, im.naturalWidth - sw), sx = max * (.5 + .3 * Math.sin((f.cam || 0) * .0007));
    c.save(); c.imageSmoothingEnabled = false; c.drawImage(im, sx, 0, sw, im.naturalHeight, 0, 0, VW, H);
    const paso = 600, off = (((f.cam || 0) * .07) % paso + paso) % paso;
    // La colina tiene base propia y se asienta dentro del dosel lejano.
    for (let x = -off - paso; x < VW + paso; x += paso) c.drawImage(SELVA_FONDO.ruina,18,120,2136,524,x,125,240,59);
    // Las lianas empiezan exactamente en el borde superior de la vista.
    const u = 90, ov = (((f.cam || 0) * .25) % u + u) % u;
    for (let k = -1; k * u - ov < VW + u; k++) {
      const x = k * u - ov + 30, h = 42 + V.h1(k,72) * 24;
      c.drawImage(SELVA_FONDO.liana,288,0,277,1741,x - 8,0,16,h);
    }
    // La copa cubre el inicio de cada liana, como ramas por encima de la cámara.
    const anchoDosel = 400, desplazamiento = (((f.cam || 0) * .25) % anchoDosel + anchoDosel) % anchoDosel;
    for (let x = -desplazamiento - anchoDosel; x < VW + anchoDosel; x += anchoDosel)
      c.drawImage(SELVA_FONDO.dosel, 0, 0, 2172, 150, x, 0, anchoDosel, 27.6);
    for (let i = 0; i < (window.FAUNA_ARTE?.listo('mariposaSelva') ? 5 : 0); i++) {
      const w = VW + 40, x = ((V.h1(i,81)*w-f.cam*.22+Math.sin(f.t*.8+i*2)*26)%w+w)%w-20;
      FAUNA_ARTE.dib(c, 'mariposaSelva', f.t+i*.21, x, 70+V.h1(i,82)*80+Math.sin(f.t*1.3+i*3)*10, {w:4.5-(i%2), ay:.5, fps:10, seq:[0,1,2,1], voltea:Math.cos(f.t*.8+i*2)<0});
    }
    c.restore();
  }
  const terrenoSelvaAntes = V.ST.terrain;
  V.ST.terrain = function (ctx, f) {
    if (!selvaPrincipal(f) || !selvaListo()) return terrenoSelvaAntes.call(this, ctx, f);
    const deco = L.deco; L.deco = [];
    try { return terrenoSelvaAntes.call(this, ctx, f); } finally { L.deco = deco; }
  };
  // cielo: cerro con pirámides y la pirámide lejana, con bruma verde-azul que las echa hacia atrás
  V.cielo((c, f, antes) => {
    if (selvaPrincipal(f) && selvaListo()) { cieloSelva(c, f); return; }
    antes();
    // haces de luz que entran entre las copas, despacio
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 5; k++) { const x = ((k * 97 - f.cam * .09 + Math.sin(f.t * .25 + k) * 6) % (VW + 120) + VW + 120) % (VW + 120) - 60, w0 = 10 + (k % 3) * 5; const lg = c.createLinearGradient(x, 0, x + 50, 200); lg.addColorStop(0, 'rgba(255,250,200,.20)'); lg.addColorStop(1, 'rgba(255,250,200,0)'); c.fillStyle = lg; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + w0, 0); c.lineTo(x + 62 + w0, 200); c.lineTo(x + 36, 200); c.closePath(); c.fill(); }
    c.restore();
    // lianas que cuelgan del borde de arriba, con hojitas, y se mecen con el viento
    for (let i = 0; i < 12; i++) {
      const w = VW + 60, x = ((V.h1(i, 71) * w - f.cam * .32) % w + w) % w - 30, len = 30 + V.h1(i, 72) * 46, sw = Math.sin(f.t * 1.1 + i * 1.9) * 3;
      c.strokeStyle = V.h1(i, 73) > .5 ? '#2f6a2a' : '#3f8a35'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x, 0); c.quadraticCurveTo(x + sw * .4, len * .5, x + sw, len); c.stroke();
      for (let q = 1; q < 5; q++) { const t = q / 5, lx = x + sw * t * t + (q % 2 ? 2 : -2), ly = len * t; c.fillStyle = q % 2 ? '#4fa543' : '#2f7a2c'; c.beginPath(); c.ellipse(lx, ly, 3, 1.6, q % 2 ? .6 : -.6, 0, 6.2832); c.fill(); }
    }
    // mariposas de alas azules y naranjas que revolotean, y polen que flota
    for (let i = 0; i < (window.FAUNA_ARTE?.listo('mariposaSelva') ? 5 : 0); i++) {                    // morfos azules (lámina)
      const w = VW + 40, x = ((V.h1(i, 81) * w - f.cam * .22 + Math.sin(f.t * .8 + i * 2) * 26) % w + w) % w - 20, y = 70 + V.h1(i, 82) * 80 + Math.sin(f.t * 1.3 + i * 3) * 10;
      FAUNA_ARTE.dib(c, 'mariposaSelva', f.t + i * .21, x, y, { w: 4.5 - (i % 2), ay: .5, fps: 10, seq: [0, 1, 2, 1], voltea: Math.cos(f.t * .8 + i * 2) < 0 });
    }
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 40; i++) { const w = VW + 30, x = ((V.h1(i, 91) * w - f.cam * (.25 + V.h1(i, 92) * .2) + Math.sin(f.t * .6 + i) * 8) % w + w) % w - 15, y = (V.h1(i, 93) * 190 - f.t * (2 + V.h1(i, 94) * 3) % 190 + 190) % 190, a = .35 + .35 * Math.sin(f.t * 2 + i); c.fillStyle = 'rgba(255,246,170,' + a.toFixed(2) + ')'; c.fillRect(x, y, 1, 1); }
    c.restore();
    const unit = 300, off = (f.cam * .08) % unit, base = Math.floor(f.cam * .08 / unit);
    for (let k = -1; k * unit - off < VW + unit; k++) { const i = base + k; pixel(c, V.h1(i, 5) < .55 ? 'f_cerro' : 'f_piramide', k * unit - off + 40 + V.h1(i, 2) * 80, 176, { ay: 1, alfa: .62, k: 1.3 }); }
    const g = c.createLinearGradient(0, 130, 0, 200); g.addColorStop(0, 'rgba(160,210,200,0)'); g.addColorStop(1, 'rgba(160,210,200,.3)'); c.fillStyle = g; c.fillRect(0, 130, VW, 70);
  });
  V.terreno(ctx => {
    if (selvaPrincipal() && selvaListo()) {
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip();
      const patron = ctx.createPattern(SELVA_FONDO.tierra, 'repeat'); patron.setTransform(new DOMMatrix().scale(128 / SELVA_FONDO.tierra.naturalWidth));
      ctx.fillStyle = patron; ctx.fillRect(0,0,L.ww,VH + 40); ctx.restore();
      for (const r of L.tops) {
        ctx.save(); ctx.beginPath(); ctx.rect(r.x0, r.y - 5, r.x1 - r.x0, 10); ctx.clip();
        for (let x = r.x0; x < r.x1; x += 96) ctx.drawImage(SELVA_FONDO.pasto,0,299,2172,120,x,r.y - 3,96,5.3);
        ctx.restore();
      }
    }
    for (const o of L.deco) {
      const x = o.x + 8, y = o.y + .5, i = o.i, v = V.h1(i, 7);
      if (o.k === 'T') pixel(ctx, ['ceiba', 'arbol', 'arbolito', 'arbol', 'ceiba'][i % 5], x, y);
      else if (o.k === 'f') pixel(ctx, ['heliconia', 'monstera', 'hibisco', 'orquidea', 'abanico', 'frangipani', 'paraiso', 'filodendro'][i % 8], x, y + .5, { ax: .5 });
      else if (o.k === 'r') pixel(ctx, ['casa', 'estela', 'roca1', 'arco', 'roca0', 'pilar0', 'escalon', 'cara', 'roca2', 'ixora', 'pasionaria'][i % 11], x, y + .5);
    }
  }, true);
  V.over((c, f, antes) => {
    if (!selvaPrincipal(f) || !selvaListo()) return antes();
    // Las hojas existentes enmarcan el plano desde las esquinas de la vista.
    pixel(c, 'monstera', -6, VH + 3, { w:34, ay:1, alfa:.65 });
    pixel(c, 'abanico', VW + 7, VH + 3, { w:34, ay:1, alfa:.65 });
  });
  V.fd('mono', (c, e, t, s, antes) => {
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('mono');
    if (e.st === 'sleep') {
      c.save(); c.filter = 'brightness(.72)';
      if (hoja?.complete && hoja.naturalWidth) antes(c, e, t, s); else pixel(c, 'mono', 0, .5);
      c.restore(); return;
    }
    if (hoja?.complete && hoja.naturalWidth) return antes(c, e, t, s);
    if (e.throwT > 0) return antes(c, e, t, s);
    pixel(c, 'mono', 0, .5);
  }, 'mono');
  V.fd('tucan', (c, e, t, s, antes) => {
    if (e.st === 'sleep') { c.save(); c.filter = 'brightness(.72)'; pixel(c, 'tucan', 0, .5); c.restore(); return; }   // dormido: la misma pieza, apagada
    const n = e.pica > 0 ? 'tucanPica' : Math.sin((e.anim || t) * 12) > 0 ? 'tucanAlza' : 'tucan';
    pixel(c, V.listo(n) ? n : 'tucan', 0, .5);
  }, 'tucan');
  V.moneda('canistel'); V.corazon('corazon');
  window.SELVA_CALAKMUL = V;
})();
