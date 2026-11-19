'use strict';
// Pétalos y enredaderas: solo apariencia; el terreno y las hojas conservan
// sus superficies de colisión y el telón sigue dibujándose por código.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.nouveau) return;
  const V = vestirNivel({ id: 'nouveau', carpeta: 'jardin', ver: 3 });
  const { spr, h1 } = V;
  V.terreno(ctx => {
    for (const o of L.deco) {
      const x = o.x, y = o.y + .5;
      if (o.k === 'T') spr(ctx, ['ceiba', 'palmas', 'maceta'][o.i % 3], x, y, {voltea: o.i % 2 === 1});
      else if (o.k === 'f') spr(ctx, ['flores', 'campanas', 'hortensia', 'blancas'][o.i % 4], x, y);
      else if (o.k === 'r') spr(ctx, 'hierba', x, y);
    }
  });
  // El jardín lejano se traza con líneas y hojas tenues: no son superficies.
  V.cielo((c, f, antes) => {
    antes();
    c.save(); c.globalAlpha = .32; c.lineCap = 'round';
    for (let i = 0; i < 9; i++) {
      const x = ((i * 71 - f.cam * .16) % (VW + 80) + VW + 80) % (VW + 80) - 40;
      const h = 24 + h1(i, 4) * 22, base = 177;
      c.strokeStyle = '#99a181'; c.lineWidth = .7; c.beginPath(); c.moveTo(x, base); c.bezierCurveTo(x - 9, base - h * .35, x + 9, base - h * .7, x + 2, base - h); c.stroke();
      for (let j = 0; j < 4; j++) {
        const yy = base - 7 - j * h / 5, side = j % 2 ? 1 : -1;
        c.save(); c.translate(x + side * 3, yy); c.rotate(side * -.55); c.fillStyle = j % 2 ? '#a6ad8b' : '#d1b5a2'; c.beginPath(); c.ellipse(0, 0, 6, 2.4, 0, 0, Math.PI * 2); c.fill(); c.restore();
      }
    }
    c.restore();
  });
  // más jardín al fondo: enredaderas colgantes con flores, mariposas y polen que sube con la luz
  V.cielo((c, f, antes) => {
    antes();
    const t = f.t, col = ['#d98a8a', '#e6c06a', '#b68ad0', '#f0e2d0'];
    c.save(); c.lineCap = 'round';
    for (let i = 0; i < 8; i++) {                                         // enredaderas que cuelgan del marco y se mecen
      const x = ((i * 63 + 20 - f.cam * .12) % (VW + 60) + VW + 60) % (VW + 60) - 30, len = 40 + h1(i, 8) * 55;
      c.strokeStyle = 'rgba(122,138,98,.55)'; c.lineWidth = .9; c.beginPath(); c.moveTo(x, 0);
      for (let y = 4; y <= len; y += 4) c.lineTo(x + Math.sin(y * .12 + t * .8 + i) * (1 + y * .05), y); c.stroke();
      for (let y = 10; y < len; y += 11) { const px = x + Math.sin(y * .12 + t * .8 + i) * (1 + y * .05); c.fillStyle = 'rgba(138,156,108,.7)'; c.beginPath(); c.ellipse(px + (y % 22 ? 2.5 : -2.5), y, 3.2, 1.4, y % 22 ? .6 : -.6, 0, 6.2832); c.fill(); }
      const fx = x + Math.sin(len * .12 + t * .8 + i) * (1 + len * .05); c.fillStyle = col[i % 4]; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(fx + Math.cos(k * 1.2566) * 2.2, len + Math.sin(k * 1.2566) * 2.2, 1.5, 0, 6.2832); c.fill(); } c.fillStyle = '#7a5a3a'; c.fillRect(fx - .5, len - .5, 1, 1);
    }
    c.restore();
    for (let i = 0; i < (window.FAUNA_ARTE?.listo('mariposaNouveau') ? 4 : 0); i++) {                  // mariposas (lámina)
      const w = VW + 60, x = ((h1(i, 15) * w - f.cam * .3 + t * (6 + i * 2)) % w + w) % w - 30, y = 70 + h1(i, 16) * 70 + Math.sin(t * 1.7 + i * 2) * 14;
      FAUNA_ARTE.dib(c, 'mariposaNouveau', t + i * .19, x, y, { w: 5 - (i % 2), ay: .5, fps: 10, seq: [0, 1, 2, 1] });
    }
    c.save(); c.globalCompositeOperation = 'lighter';                     // polen dorado
    for (let i = 0; i < 24; i++) { const w = VW + 40, x = ((h1(i, 21) * w - f.cam * .2 + Math.sin(t * .5 + i) * 6) % w + w) % w - 20, y = ((h1(i, 22) * 200 - t * (4 + h1(i, 23) * 4)) % 200 + 200) % 200; c.globalAlpha = .55 * Math.sin(Math.PI * y / 200); c.fillStyle = '#ffe9a8'; c.fillRect(x, y, 1.2, 1.2); }
    c.restore();
  });
  // El borde recto coincide con pl.y y el adorno nunca supera su anchura.
  const petaloAnterior = (c, pl, f, sk) => {
    c.fillStyle = sk.plat; c.strokeStyle = sk.line; c.lineWidth = .65; c.beginPath(); c.moveTo(pl.x, pl.y); c.lineTo(pl.x + pl.w, pl.y); c.quadraticCurveTo(pl.x + pl.w * .75, pl.y + 7, pl.x + pl.w / 2, pl.y + 7); c.quadraticCurveTo(pl.x + pl.w * .25, pl.y + 7, pl.x, pl.y); c.fill(); c.stroke();
    c.strokeStyle = sk.accent; c.beginPath(); c.moveTo(pl.x + 4, pl.y + 2); c.lineTo(pl.x + pl.w - 4, pl.y + 2); c.stroke();
  };
  V.look('petal', (c, pl) => {
    c.save(); c.beginPath(); c.rect(pl.x, pl.y, pl.w, 24); c.clip();
    spr(c, 'petalo', pl.x + pl.w / 2, pl.y, {ay: 0, w: pl.w}); c.restore();
    c.strokeStyle = '#684c3c'; c.lineWidth = .7; c.beginPath(); c.moveTo(pl.x, pl.y); c.lineTo(pl.x + pl.w, pl.y); c.stroke();
  }, 'petalo', petaloAnterior);
  const ciclo = (t, fps) => [0, 1, 2, 1][Math.floor(t * fps) % 4];
  V.fd('abeja', (c, e, t, s, antes) => {
    if (e.st === 'sleep') {
      const hoja = window.ENEMIGOS_ASSETS?.hojaForge('abeja');
      if (!hoja?.complete || !hoja.naturalWidth) return V.dormido(c, 'abeja0', t, 1);
      c.save(); c.rotate(-.12); c.filter = 'saturate(.6) brightness(.82)'; antes(c, e, t, s); c.restore(); return;
    }
    antes(c, e, t, s);
  }, 'abeja0');
  V.fd('avispa', (c, e, t, s, antes) => {
    if (e.st === 'sleep') {
      const hoja = window.ENEMIGOS_ASSETS?.hojaForge('avispa');
      if (!hoja?.complete || !hoja.naturalWidth) return V.dormido(c, 'avispa0', t, 1);
      c.save(); c.rotate(-.12); c.filter = 'saturate(.6) brightness(.82)'; antes(c, e, t, s); c.restore(); return;
    }
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('avispa');
    if (hoja?.complete && hoja.naturalWidth) {
      c.save(); c.filter = 'sepia(.18) saturate(1.18)'; antes(c, e, t, s); c.restore(); return;
    }
    spr(c, 'avispa' + ciclo(e.anim || t, 7), 0, 1);
  }, 'avispa0');
  V.fd('oruga', (c, e, t, s, antes) => {
    if (e.st === 'sleep') return V.dormido(c, 'oruga0', t);
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('oruga');
    if (e.trepa && hoja?.complete && hoja.naturalWidth) {
      // El cuerpo mira a la derecha en el dibujante general; al rotarlo queda
      // con la cabeza arriba y conserva el diseño detallado mientras trepa.
      c.save(); c.translate(0, -5); c.rotate(-Math.PI / 2);
      window.ENEMIGOS_ASSETS.pinta(c, e, t, 'oruga', window.ENEMIGOS_ASSETS.recurso('oruga'));
      c.restore(); return;
    }
    if (e.trepa) return antes(c, e, t, s);
    if (hoja?.complete && hoja.naturalWidth) return antes(c, e, t, s);
    spr(c, 'oruga' + ciclo(e.anim ?? t, 5), 0, .5);
  }, 'oruga0');
  V.fd('pavo', (c, e, t) => {
    if (e.st === 'sleep') return V.dormido(c, 'pavo0', t);
    const a = e.abre || 0;
    const n = a > .75 ? 6 : a > .25 ? 4 : ciclo(e.anim ?? t, 4);
    spr(c, 'pavo' + n, 0, .5);
  }, 'pavo0');
  V.moneda('canistel'); V.corazon('corazon');
  window.JARDIN_NOUVEAU = V;
})();
