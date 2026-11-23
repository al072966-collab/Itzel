'use strict';
// Siluetas de ceniza: el sigilo y sus avisos siguen siendo los originales.
(function () {
  if (typeof vestirNivel !== 'function' || typeof STYLE_MAP === 'undefined' || !STYLE_MAP.hollin) return;
  const V = vestirNivel({ id: 'hollin', carpeta: 'campeche-ceniza', ver: 1, manifiesto: window.CAMPECHE_CENIZA_MANIFIESTO });
  const { spr } = V;
  const TELON_CENIZA = {};
  for (const [n, archivo] of Object.entries({ cielo:'cielo-ceniza-v1', ciudad:'ciudad-ceniza-v1', postes:'postes-ceniza-v1', antena:'antena-ceniza-v1', arbusto:'arbusto-escondite-v1', suelo:'suelo-ceniza-v1' })) {
    const im = TELON_CENIZA[n] = new Image(); im.decoding = 'async'; im.onload = () => V.rehaz();
    im.src = '../Roguelike/assets/campeche-ceniza/' + archivo + '.png';
  }
  const cenizaPrincipal = f => ((f.g && f.g.def && f.g.def.id) || (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id)) === 'hollin';
  const cenizaListo = () => Object.values(TELON_CENIZA).every(i => i.complete && i.naturalWidth);
  function telonCeniza(c, f) {
    const im = TELON_CENIZA.cielo, H = f.H || VH, sw = Math.min(im.naturalWidth, im.naturalHeight * VW / H);
    const max = Math.max(0, im.naturalWidth - sw), sx = max * (.5 + .35 * Math.sin((f.cam || 0) * .0007));
    c.save(); c.imageSmoothingEnabled = true; c.filter = 'brightness(1.65) saturate(.65)';
    c.drawImage(im, sx, 0, sw, im.naturalHeight, 0, 0, VW, H); c.filter = 'none';
    const fila = (img, rec, w, h, base, par) => {
      const off = (((f.cam || 0) * par) % w + w) % w;
      for (let x = -off - w; x < VW + w; x += w) c.drawImage(img, ...rec, x, base - h, w, h);
    };
    fila(TELON_CENIZA.ciudad, [0,301,2172,281], 550, 71, 181, .08);
    const ax = 330 - ((f.cam || 0) * .1 % 700);
    c.drawImage(TELON_CENIZA.antena, 175,19,372,2139, ax - 13, 49, 26, 139);
    fila(TELON_CENIZA.postes, [27,40,2118,634], 260, 78, 205, .22);
    c.restore();
  }
  // La hoja Forge se dibuja con el recorte y la escala de ENEMIGOS_ASSETS.
  // La cuerda dinámica permanece en FX.aranaCeniza como señal de altura.
  // telón: la ciudad quemada lejos, con bruma fría, y humo que pasa despacio
  V.cielo((c, f, antes) => {
    if (cenizaPrincipal(f) && cenizaListo()) { telonCeniza(c, f); return; }
    antes();
    const unit = 230, off = (f.cam * .1) % unit, base = Math.floor(f.cam * .1 / unit);
    const L2 = ['f_casa0', 'f_casa1', 'f_iglesia', 'f_casa2', 'f_casa3', 'f_fuerte', 'f_casa4'];
    for (let k = -1; k * unit - off < VW + unit; k++) { const i = base + k; spr(c, L2[Math.floor(V.h1(i, 3) * L2.length)], k * unit - off + V.h1(i, 5) * 60, 176, { ay: 1, alfa: .7 }); }
    const u2 = 210, o2 = (f.cam * .04 + f.t * 2) % u2;
    for (let k = -1; k * u2 - o2 < VW + u2; k++) spr(c, k % 2 ? 'humo0' : 'humo1', k * u2 - o2, 40 + (k * 37 % 50 + 50) % 50, { ay: .5, alfa: .4 });
    const g = c.createLinearGradient(0, 120, 0, 200); g.addColorStop(0, 'rgba(60,56,76,0)'); g.addColorStop(1, 'rgba(60,56,76,.4)'); c.fillStyle = g; c.fillRect(0, 120, VW, 80);
  });
  // cae ceniza del Chichonal (1982): copos grises que bajan en diagonal, resplandor rojizo en el horizonte y un relámpago volcánico lejano
  V.cielo((c, f, antes) => {
    antes();
    const t = f.t, h = V.h1;
    const g = c.createLinearGradient(0, 110, 0, 185); g.addColorStop(0, 'rgba(190,70,40,0)'); g.addColorStop(1, 'rgba(190,70,40,' + (.16 + .05 * Math.sin(t * .8)).toFixed(3) + ')'); c.fillStyle = g; c.fillRect(0, 110, VW, 80);
    const per = 13, T = (t + 4) % per;
    if (T < .5) { const k = Math.sin(T / .5 * Math.PI) * (T < .15 || T > .3 ? .35 : 1), x = 60 + h(Math.floor((t + 4) / per), 9) * 300; c.save(); c.globalCompositeOperation = 'lighter'; const lg = c.createRadialGradient(x, 30, 2, x, 30, 90); lg.addColorStop(0, 'rgba(220,210,255,' + (.5 * k).toFixed(3) + ')'); lg.addColorStop(1, 'rgba(220,210,255,0)'); c.fillStyle = lg; c.fillRect(0, 0, VW, 140); c.strokeStyle = 'rgba(240,235,255,' + k.toFixed(3) + ')'; c.lineWidth = .9; c.beginPath(); c.moveTo(x, 0); c.lineTo(x - 5, 22); c.lineTo(x + 3, 36); c.lineTo(x - 4, 62); c.stroke(); c.restore(); }
    c.save();
    for (let i = 0; i < 46; i++) {
      const w = VW + 60, sp = .035 + h(i, 31) * .05, ph = (t * sp + h(i, 32)) % 1, x = ((h(i, 33) * w - f.cam * (.15 + h(i, 35) * .2) + ph * 40) % w + w) % w - 30, y = ph * 215 - 10, r = .5 + h(i, 34) * 1.2;
      c.globalAlpha = .55 * Math.sin(ph * Math.PI); c.fillStyle = i % 4 ? '#cfcbd6' : '#8e8a99'; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill();
    }
    c.restore();
  });
  // suelo: el adoquín de la lámina como borde de cada calle; adornos de la ciudad quemada (siguen siendo solo decoración)
  V.terreno(ctx => {
    const id = typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id;
    if (id === 'hollin' && cenizaListo()) {
      const img = TELON_CENIZA.suelo, ancho = 160, alto = 52;
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip();
      for (const r of L.tops) {
        ctx.save(); ctx.beginPath(); ctx.rect(r.x0, r.y, r.x1 - r.x0, alto); ctx.clip();
        for (let x = r.x0; x < r.x1; x += ancho) {
          const sh = img.naturalHeight - 24, corte = 40;
          ctx.drawImage(img, 0, 24, img.naturalWidth, sh * corte / alto, x, r.y, ancho, corte);
          for (let q = corte; q < alto; q += 1) {
            ctx.globalAlpha = (alto - q) / (alto - corte);
            ctx.drawImage(img, 0, 24 + sh * q / alto, img.naturalWidth, sh / alto + .1, x, r.y + q, ancho, 1.1);
          }
          ctx.globalAlpha = 1;
        }
        ctx.restore();
      }
      ctx.restore();
    } else if (V.listo('adoquin')) {
      const w = V.TAM.adoquin.w;
      ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip(); ctx.globalAlpha = .55;
      for (const r of L.tops) for (let x = r.x0; x < r.x1; x += w) spr(ctx, 'adoquin', x, r.y + 1, { ax: 0, ay: 0 });
      ctx.restore();
    }
    for (const o of L.deco) {
      const x = o.x + 8, y = o.y + .5, i = o.i, v = V.h1(i, 7);
      if (o.k === 'T') spr(ctx, ['palma', 'farola0', 'arbolSeco', 'farola1', 'palma', 'farola2'][i % 6], x, y, { alfa: .8 });
      else if (o.k === 'f') spr(ctx, ['coche0', 'barril', 'caja', 'banca', 'jarron', 'carreta', 'coche1', 'camion'][i % 8], x, y, { voltea: v < .5, alfa: .75 });
      else if (o.k === 'r') spr(ctx, ['ruinaArco', 'escombro0', 'ruinaMuro', 'escombro1', 'barrera', 'columna', 'reja', 'ruinaCasa'][i % 8], x, y, { alfa: .75 });
    }
  });
  // Solo cambia la imagen del escondite; sus límites y detección siguen en OBJ.escondite.step.
  V.obj('escondite', (c, o, f, sk, antes) => {
    if (!cenizaPrincipal(f) || !cenizaListo() || (o.kind === 'auto' && !V.listo('coche0'))) return antes(c, o, f, sk);
    const w = o.x1 - o.x0;
    c.save(); c.imageSmoothingEnabled = true;
    if (o.kind === 'auto') c.drawImage(V.IMG.coche0, o.x0, o.y - 17, w, 17);
    else c.drawImage(TELON_CENIZA.arbusto, 25, 50, 2125, 620, o.x0, o.y - 20, w, 20);
    if (f.g.hidden && f.g.p.x > o.x0 && f.g.p.x < o.x1) {
      c.fillStyle = 'rgba(255,255,255,.7)'; c.font = 'bold 5px "Alegreya Sans", sans-serif'; c.textAlign = 'center';
      c.fillText('oculta', (o.x0 + o.x1) / 2, o.y - 22);
    }
    c.restore();
  });
  function ojo(c, x, y, r = .65) { c.save(); c.fillStyle = '#ff3030'; c.shadowColor = '#ff3030'; c.shadowBlur = 2; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); c.restore(); }
  V.fd('perro', (c, e, t, s, antes) => {
    if (e.st === 'sleep' || e.st === 'stun') return V.dormido(c, 'perro', t);   // dormido: la misma pieza (no el dibujo viejo)
    const assets = window.ENEMIGOS_ASSETS, hoja = assets?.hojaForge('perroCeniza');
    if (hoja?.complete && hoja.naturalWidth >= 512 && e.st !== 'gone') return assets.pinta(c, e, t, 'perroCeniza', assets.recurso('perroCeniza'));
    const n = e.mode === 'hunt' && V.listo('perroCaza') ? 'perroCaza' : 'perro';
    spr(c, n, 0, .5); ojo(c, n === 'perro' ? 6 : 7, n === 'perro' ? -12 : -7);
  }, 'perro');
  V.fd('aranaCeniza', (c, e, t, s, antes) => {
    if (e.st === 'sleep') return V.dormido(c, 'arana', t);   // dormido: la misma pieza (no el dibujo viejo)
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('aranaCeniza');
    if (hoja && hoja.complete && hoja.naturalWidth >= 512) return antes(c, e, t, s);
    spr(c, 'arana', 0, .5); ojo(c, -1, -2, .45); ojo(c, 1, -2, .45);
  }, 'arana');
  V.fd('cuervoCeniza', (c, e, t, s, antes) => {
    if (e.st === 'sleep') return V.dormido(c, 'cuervo', t);   // dormido: la misma pieza (no el dibujo viejo)
    antes(c, e, t, s);
  }, 'cuervo');
  V.fd('jabali', (c, e, t, s, antes) => {
    if (e.st === 'sleep' || e.st === 'stun') return V.dormido(c, 'jabali', t);   // dormido: la misma pieza (no el dibujo viejo)
    const hoja = window.ENEMIGOS_ASSETS?.hojaForge('jabali');
    if (hoja?.complete && hoja.naturalWidth && e.st !== 'gone') {
      // El Forge de cristal se lleva a la paleta carbón y brasa de Ceniza.
      c.save(); c.filter = 'grayscale(1) brightness(.42) sepia(.7) saturate(2.5) hue-rotate(320deg) contrast(1.1)';
      antes(c, e, t, s); c.restore(); return;
    }
    const n = e.st === 'run' && V.listo('jabaliCorre') ? 'jabaliCorre' : 'jabali';
    spr(c, n, 0, .5); ojo(c, 5, -7, .55);
  }, 'jabali');
  window.CAMPECHE_CENIZA = V;
})();
