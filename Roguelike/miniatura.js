'use strict';
// =====================================================================
//  MUNDO «CALAKMUL EN MINIATURA»
//  Itzel y Fresita siguen en el mundo real, pero encogidas: las piedras de
//  la foto son edificios, el pasto son árboles, las hojas son plataformas
//  y los bichos miden lo mismo que Itzel.
//  Lo caro se pinta una sola vez (fondo, terreno, hojas, cuerpos de los
//  bichos) y cada cuadro solo pega esas imágenes, sin filtros ni degradados
//  nuevos: así la foto no le pega al rendimiento.
//  Las texturas salen de art/fotos con tools/fotos-texturas.sh.
// =====================================================================
(function () {
  const { LOOK, FD, FOE } = MEC, RUTA = '../Roguelike/fotos/', ID = 'miniatura';
  const IM = {}; let faltan = 3;
  for (const k of ['fondo', 'muro', 'piso']) {
    const i = IM[k] = new Image();
    i.onload = () => { if (--faltan === 0) for (const c of [...CACHE.keys()]) if (String(c).includes(ID)) CACHE.delete(c); }; // lo que se pintó antes de que llegaran las fotos
    i.src = `${RUTA}${k}-calakmul.jpg`;
  }
  const MACRO = {};
  for (const [nombre, archivo] of Object.entries({ pasto:'pasto-macro-v1', hongos:'hongos-macro-v1', hoja:'hoja-plataforma-v1', seca:'hoja-seca-macro-v1', rama:'rama-macro-v1' })) {
    const im = MACRO[nombre] = new Image(); im.decoding = 'async';
    im.onload = () => { for (const c of [...CACHE.keys()]) if (String(c).includes(ID)) CACHE.delete(c); };
    im.src = '../Roguelike/assets/macro-detalles/' + archivo + '.png';
  }
  const macroListo = n => MACRO[n] && MACRO[n].complete && MACRO[n].naturalWidth;
  window.MINIATURA_MACRO_LISTO = () => ['pasto','hongos','hoja','seca'].every(macroListo);
  function macroPieza(c, n, x, y, w, h, voltea = false) {
    const im = MACRO[n]; if (!macroListo(n)) return false;
    c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; c.translate(x, y); if (voltea) c.scale(-1, 1);
    const recortes = { pasto:[11,16,1290,1168], hongos:[76,49,1124,1101], seca:[35,58,2103,605], rama:[68,295,2037,198] };
    const r = recortes[n];
    if (r) c.drawImage(im, r[0], r[1], r[2], r[3], -w / 2, -h, w, h);
    else c.drawImage(im, -w / 2, -h, w, h);
    c.restore(); return true;
  }
  const listo = () => faltan === 0;
  const R = (i, s) => hash1(Math.round(i * 10), s);
  const patron = (ctx, img, k, dy = 0) => { const p = ctx.createPattern(img, 'repeat'); p.setTransform(new DOMMatrix().translate(0, dy).scale(k, k)); return p; };

  // ---------------- imágenes pintadas una vez ----------------
  const SPR = new Map();
  function sprite(llave, w, h, pinta, esc = 4) {
    let s = SPR.get(llave);
    if (!s) { s = mkCanvas(Math.ceil(w * esc), Math.ceil(h * esc)); const x = s.getContext('2d'); x.scale(esc, esc); x.lineCap = 'round'; x.lineJoin = 'round'; pinta(x); SPR.set(llave, s); }
    return s;
  }
  // volumen brillante, como caparazón visto de cerca
  function bola(x, cx, cy, rx, ry, col, rot = 0) {
    x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(rx, ry);
    const g = x.createRadialGradient(-.34, -.42, .05, 0, 0, 1.05); g.addColorStop(0, shade(col, .5)); g.addColorStop(.42, col); g.addColorStop(1, shade(col, -.62));
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, 1, 0, TAU); x.fill();
    x.fillStyle = 'rgba(255,255,255,.62)'; x.beginPath(); x.ellipse(-.3, -.46, .24, .11, -.5, 0, TAU); x.fill();
    x.strokeStyle = 'rgba(190,226,190,.3)'; x.lineWidth = .08; x.beginPath(); x.arc(0, 0, .92, .4, 1.9); x.stroke();
    x.restore();
  }
  // pata de dos tramos que camina
  function pata(c, hx, hy, kx, ky, fx, fy, col, w) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(hx, hy); c.lineTo(kx, ky); c.lineTo(fx, fy); c.stroke(); }
  function patas(c, caderas, paso, t, col, w, alto, largo) {
    caderas.forEach(([hx, hy], i) => {
      for (const lado of [0, 1]) {
        const ph = t + i * 2.1 + lado * Math.PI, a = Math.sin(ph) * paso, sube = Math.max(0, Math.cos(ph)) * 1.8 * Math.min(1, paso), ab = (i - (caderas.length - 1) / 2) * largo;
        pata(c, hx, hy, hx + ab * .5 + a * .5, hy - alto, hx + ab + a, -sube, lado ? shade(col, -.3) : col, w);
      }
    });
  }

  // hormiga arriera: cabezona, cintura fina y su pedazo de hoja
  const HORMIGA = '#8a3c16';
  FD.hormiga = (c, e, t) => {
    const a = t * 13 + e.anim, mueve = e.st === 'ok' ? 3.4 : 0;
    patas(c, [[5.6, -7], [3, -7], [.6, -7]], mueve, a, '#3a1a0a', .95, 3.2, 6);
    c.drawImage(sprite('hormiga', 38, 28, x => {
      x.translate(17, 26);
      bola(x, -8.6, -8, 8.4, 6.6, HORMIGA); bola(x, -.6, -7.6, 1.9, 1.9, shade(HORMIGA, -.25)); bola(x, 3.4, -9.4, 5.2, 3.9, shade(HORMIGA, .06), -.1); bola(x, 11, -11, 5.4, 5, HORMIGA);
      x.fillStyle = '#120806'; x.beginPath(); x.ellipse(13.2, -12.4, 1.3, 1.5, 0, 0, TAU); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(12.8, -12.9, .45, 0, TAU); x.fill();
      x.strokeStyle = '#2a1006'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(15.4, -9.4); x.quadraticCurveTo(19, -9.6, 19.6, -7); x.stroke();
    }), -17, -26, 38, 28);
    // la hoja que carga se mece con el paso
    c.save(); c.translate(14, -11); c.rotate(-.5 + Math.sin(t * 6 + e.anim) * .06);
    c.drawImage(sprite('corte', 26, 24, x => { x.translate(13, 22); const g = x.createLinearGradient(-10, -20, 10, 0); g.addColorStop(0, '#7fb24a'); g.addColorStop(1, '#2f6a2a'); x.fillStyle = g; x.beginPath(); x.moveTo(-2, 0); x.quadraticCurveTo(-11, -9, -7, -19); x.lineTo(1, -15); x.lineTo(6, -20); x.quadraticCurveTo(11, -8, 2, 0); x.closePath(); x.fill(); x.strokeStyle = 'rgba(214,240,170,.65)'; x.lineWidth = .4; x.beginPath(); x.moveTo(0, -1); x.lineTo(-1, -17); for (const k of [5, 9, 13]) { x.moveTo(-.2, -k); x.lineTo(-6, -k - 4); x.moveTo(-.4, -k); x.lineTo(5, -k - 4); } x.stroke(); }), -13, -22, 26, 24);
    c.restore();
    for (const s of [0, 1]) { c.strokeStyle = '#2a1006'; c.lineWidth = .6; c.beginPath(); c.moveTo(14, -15); c.lineTo(17 + s * 2, -19); c.quadraticCurveTo(20 + s * 2, -20 + Math.sin(t * 8 + s) * 1.2, 22 + s, -17); c.stroke(); }
  };

  // araña saltarina: peluda, de ojazos, se agacha y salta
  FD.saltarina = (c, e, t) => {
    const ag = e.vy === 0 ? Math.max(0, 1 - e.tt) * 2.4 : 0, vuela = e.vy !== 0;
    c.translate(0, ag * .5);
    patas(c, [[5, -8], [3, -8], [.8, -8], [-1.4, -8]], vuela ? 0 : .8, t * 5 + e.anim, '#1a1414', 1, 5.6 - ag, 7);
    c.drawImage(sprite('saltarina', 30, 22, x => {
      x.translate(14, 20);
      bola(x, -6, -9.6, 8.4, 7.4, '#2a2424'); bola(x, 5.4, -9.8, 6.2, 5.4, '#3a2c28');
      x.fillStyle = '#e8e2d2'; for (const [px, py, r] of [[-8, -12, 1.1], [-4, -13.6, .8], [-9, -7.6, .8], [-3, -7, .9]]) { x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); }
      x.strokeStyle = 'rgba(232,226,210,.55)'; x.lineWidth = .28; for (let i = 0; i < 46; i++) { const a = R(i, 1) * TAU, q = 6 + R(i, 2) * 2.8; x.beginPath(); x.moveTo(-6 + Math.cos(a) * q, -9.6 + Math.sin(a) * q * .9); x.lineTo(-6 + Math.cos(a) * (q + 1.5), -9.6 + Math.sin(a) * (q * .9 + 1.5)); x.stroke(); }
      for (const [px, py, r] of [[10.2, -10.4, 2.5], [6.6, -11.4, 1.5], [8.8, -13.2, .9]]) { const g = x.createRadialGradient(px - r * .3, py - r * .35, 0, px, py, r); g.addColorStop(0, '#6a8a74'); g.addColorStop(.5, '#141414'); g.addColorStop(1, '#040404'); x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); x.fillStyle = 'rgba(255,255,255,.85)'; x.beginPath(); x.arc(px - r * .34, py - r * .4, r * .24, 0, TAU); x.fill(); }
      const q = x.createLinearGradient(9, -8, 10, -3); q.addColorStop(0, '#2fc0a8'); q.addColorStop(1, '#6a2a9a'); x.fillStyle = q; x.beginPath(); x.ellipse(10, -6.6, 1.5, 2.3, .2, 0, TAU); x.fill();
    }), -14, -20, 30, 22);
  };

  // avispa: rayada, con alas transparentes que vibran
  FD.avispaMini = (c, e, t) => {
    const assets = window.ENEMIGOS_ASSETS, hoja = assets?.hojaForge('avispaMini');
    if (e.st !== 'sleep' && e.st !== 'stun' && e.st !== 'gone' && !(e.aturde > 0) && !(e._golpe > .25) && hoja?.complete && hoja.naturalWidth) {
      assets.pinta(c, e, t, 'avispaMini'); return;
    }
    const al = Math.sin(t * 44) * .5, dv = e.st === 'dive' ? .35 : 0;
    c.translate(0, -12); c.rotate(dv);
    for (const [ang, l] of [[-1.15 + al, 19], [-.82 + al * .8, 14]]) { c.save(); c.translate(3, -5); c.rotate(ang - Math.PI / 2); c.drawImage(sprite('ala' + l, l + 2, 10, x => { x.translate(0, 5); x.fillStyle = 'rgba(214,236,255,.38)'; x.strokeStyle = 'rgba(70,60,50,.7)'; x.lineWidth = .24; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(l * .5, -5, l, -.6); x.quadraticCurveTo(l * .55, 3.6, 0, 0); x.fill(); x.stroke(); x.beginPath(); x.moveTo(1, 0); x.lineTo(l * .9, -.8); x.moveTo(l * .35, -2); x.lineTo(l * .5, 2); x.stroke(); }), 0, -5, l + 2, 10); c.restore(); }
    patas(c, [[5, 2], [2, 2], [-1, 2]], .6, t * 4, '#2a1a0a', .7, -2.6, 2.4);
    c.drawImage(sprite('avispa', 38, 18, x => {
      x.translate(20, 9);
      bola(x, -9, 2, 9.4, 4.8, '#e6b422', .14);
      x.save(); x.beginPath(); x.ellipse(-9, 2, 9.4, 4.8, .14, 0, TAU); x.clip(); x.fillStyle = 'rgba(18,12,6,.92)'; for (const k of [-15.5, -11, -6.6, -2.4]) { x.beginPath(); x.moveTo(k, -6); x.quadraticCurveTo(k + 1.6, 2, k + .4, 9); x.lineTo(k + 2.2, 9); x.quadraticCurveTo(k + 3.4, 2, k + 2, -6); x.closePath(); x.fill(); } x.restore();
      x.fillStyle = '#1a120a'; x.beginPath(); x.moveTo(-18, 3); x.lineTo(-21, 4.4); x.lineTo(-18, 5); x.fill();
      bola(x, 3.6, -.4, 4.8, 4, '#2a2014'); bola(x, 10, -1, 4, 3.8, '#c89a24');
      x.fillStyle = '#120a06'; x.beginPath(); x.ellipse(11.4, -1.6, 2, 2.6, .1, 0, TAU); x.fill(); x.fillStyle = 'rgba(255,255,255,.75)'; x.beginPath(); x.arc(11, -2.6, .5, 0, TAU); x.fill();
    }), -20, -9, 38, 18);
    c.strokeStyle = '#1a120a'; c.lineWidth = .5; c.beginPath(); c.moveTo(12, -4); c.quadraticCurveTo(16, -9, 18, -7 + Math.sin(t * 7)); c.stroke();
  };

  // escarabajo rinoceronte: negro brillante, con cuerno; embiste
  FD.rinoceronte = (c, e, t) => {
    const a = t * (e.st === 'run' ? 24 : 9) + e.anim;
    patas(c, [[6, -6], [1, -6], [-5, -6]], e.st === 'stun' ? 0 : 2.6, a, '#160e0a', 1.15, 3, 7);
    c.drawImage(sprite('rinoceronte', 42, 28, x => {
      x.translate(20, 26);
      bola(x, -5, -9.4, 13.4, 8.6, '#3a2418'); x.strokeStyle = 'rgba(0,0,0,.6)'; x.lineWidth = .4; x.beginPath(); x.moveTo(-17, -10); x.quadraticCurveTo(-5, -12, 7, -11); x.stroke();
      bola(x, 9, -10, 6, 6.2, '#2c1c14');
      const cu = x.createLinearGradient(12, -12, 20, -22); cu.addColorStop(0, '#2c1c14'); cu.addColorStop(1, '#7a5238'); x.fillStyle = cu; x.beginPath(); x.moveTo(10, -14); x.quadraticCurveTo(16, -15, 20.5, -24); x.quadraticCurveTo(19, -14, 14.5, -8); x.closePath(); x.fill();
      x.fillStyle = 'rgba(255,255,255,.4)'; x.beginPath(); x.ellipse(16.6, -17, .5, 2.6, .6, 0, TAU); x.fill();
      x.fillStyle = '#080404'; x.beginPath(); x.arc(13, -8.6, 1.1, 0, TAU); x.fill();
    }), -20, -26, 42, 28);
  };

  // alacrán de Campeche: cola de segmentos sobre el lomo
  FD.alacranMini = (c, e, t) => {
    c.scale(1.22, 1.32);
    const a = t * 11 + e.anim, pica = e.st === 'lunge' ? 1 : 0, s = Math.sin(t * 3 + e.anim) * .06;
    patas(c, [[5, -5], [2, -5], [-1, -5], [-4, -5]], 1.6, a, '#5a3a18', .8, 3.2, 3.6);
    c.drawImage(sprite('alacran', 40, 16, x => {
      x.translate(18, 14);
      for (let i = 0; i < 6; i++) bola(x, 6 - i * 3.3, -5, 2.9 - i * .1, 2.6, i % 2 ? '#a8742c' : '#b88434');
      bola(x, 8.6, -5, 3, 2.4, '#94642a');
      x.fillStyle = '#100a06'; x.beginPath(); x.arc(9.6, -6.2, .6, 0, TAU); x.fill();
    }), -18, -14, 40, 16);
    // las pinzas al frente
    for (const sg of [0, 1]) { c.save(); c.translate(10, -5 + sg); c.rotate(-.2 + sg * .4 + Math.sin(t * 4 + sg) * .1); c.drawImage(sprite('pinza', 14, 8, x => { x.translate(1, 4); x.strokeStyle = '#94642a'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(0, 0); x.lineTo(5, 0); x.stroke(); bola(x, 8, 0, 3.2, 2.2, '#a8742c'); x.strokeStyle = '#6a4418'; x.lineWidth = .8; x.beginPath(); x.moveTo(10, -1.4); x.lineTo(12.4, -.2); x.moveTo(10, 1.4); x.lineTo(12.4, .2); x.stroke(); }), -1, -4, 14, 8); c.restore(); }
    // la cola se arquea y se lanza
    let px = -13, py = -5, ang = -2.5 + s + pica * .9;
    for (let i = 0; i < 6; i++) { const q = 3.6 - i * .15; px += Math.cos(ang) * q; py += Math.sin(ang) * q; ang += .55; c.drawImage(sprite('seg', 7, 7, x => bola(x, 3.5, 3.5, 2.5, 2.5, '#b88434')), px - 2 - i * .05, py - 2, 4.4 - i * .25, 4.4 - i * .25); }
    c.fillStyle = '#3a1a0c'; c.beginPath(); c.moveTo(px, py - 1); c.lineTo(px + Math.cos(ang) * 4, py + Math.sin(ang) * 4); c.lineTo(px + 1.6, py + .8); c.closePath(); c.fill();
  };
  Object.assign(FOE, {
    hormiga: { beh: 'walk', v: 34, w: 20, h: 16 },
    saltarina: { beh: 'jumper', w: 15, h: 15 },
    avispaMini: { beh: 'swoop', w: 20, h: 13 },
    rinoceronte: { beh: 'charge', v: 24, w: 22, h: 17 },
    alacranMini: { beh: 'strike', v: 16, w: 24, h: 12 },
  });
  if (typeof ENEMIGO_INFO !== 'undefined') Object.assign(ENEMIGO_INFO, {
    hormiga: ['Hormiga arriera', 'Del tamaño de Itzel y cargando su pedazo de hoja rumbo al nido. No se detiene por nada.', 'Cáele encima o brinca sobre ella: va siempre derecho.'],
    saltarina: ['Araña saltarina', 'Te mira con sus ojazos, se agacha y da un brinco enorme hacia Itzel.', 'Cuando se agacha, muévete; al aterrizar, cáele encima.'],
    avispaMini: ['Avispa', 'De este tamaño suena como avioneta. Da vueltas en el aire y se lanza en picada.', 'Muévete cuando se lance; Fresita la duerme con la canción de cuna.'],
    rinoceronte: ['Escarabajo rinoceronte', 'Camina despacio hasta que te ve; entonces baja el cuerno y embiste.', 'Hazlo chocar contra una piedra y cáele encima mientras está mareado.'],
    alacranMini: ['Alacrán', 'Se acerca despacio con las pinzas abiertas y lanza la cola de golpe.', 'Brínquelo por atrás, lejos de la cola.'],
  });

  // ---------------- la hoja que hace de plataforma ----------------
  function hoja(x, w, h, tono) {
    const cx = w / 2, g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, shade(tono, .28)); g.addColorStop(.5, tono); g.addColorStop(1, shade(tono, -.42));
    const borde = () => { x.beginPath(); x.moveTo(.6, h * .5); x.bezierCurveTo(w * .2, -.4, w * .72, -.2, w - .4, h * .46); x.bezierCurveTo(w * .74, h + .6, w * .22, h + .4, .6, h * .5); x.closePath(); };
    borde(); x.fillStyle = g; x.fill();
    x.save(); borde(); x.clip();
    x.strokeStyle = 'rgba(226,246,180,.6)'; x.lineWidth = .55; x.beginPath(); x.moveTo(1, h * .5); x.lineTo(w - 1, h * .47); x.stroke();
    x.lineWidth = .3; x.beginPath(); for (let i = 1; i < 11; i++) { const px = w * i / 11; x.moveTo(px, h * .49); x.quadraticCurveTo(px + 3, h * .26, px + 7, -1); x.moveTo(px, h * .49); x.quadraticCurveTo(px + 3, h * .74, px + 7, h + 1); } x.stroke();
    x.fillStyle = 'rgba(120,88,30,.32)'; for (let i = 0; i < 16; i++) { x.beginPath(); x.arc(R(i + w, 3) * w, R(i + w, 4) * h, .3 + R(i, 5) * .9, 0, TAU); x.fill(); }
    x.restore();
    x.fillStyle = 'rgba(255,255,255,.7)'; for (const [u, v, r] of [[.3, .32, 1], [.62, .24, .7]]) { x.beginPath(); x.ellipse(w * u, h * v, r * 1.3, r * .8, 0, 0, TAU); x.fill(); }
    void cx;
  }
  LOOK.hojaMini = (c, pl, f, sk) => {
    const k = pl.open ?? 1, w = pl.w, cx = pl.x + w / 2, y = pl.y;
    c.drawImage(sprite('tallo', 10, 90, x => { x.strokeStyle = '#4a5a2a'; x.lineWidth = 2.2; x.beginPath(); x.moveTo(5, 0); x.quadraticCurveTo(8, 42, 3, 90); x.stroke(); x.strokeStyle = 'rgba(190,210,130,.5)'; x.lineWidth = .5; x.beginPath(); x.moveTo(4.4, 0); x.quadraticCurveTo(7.4, 42, 2.4, 90); x.stroke(); }, 3), cx - 5, y + 2, 10, 90);
    const W = w + 12, H = 12, sx = lerp(.3, 1, k), sy = lerp(.55, 1, k);
    c.save(); c.translate(cx, y + 3); c.scale(sx, sy); c.rotate(Math.sin(f.t * 1.4 + pl.x) * .012 + (1 - k) * .3);
    if (macroListo('hoja')) c.drawImage(MACRO.hoja, 0, 140, 2172, 470, -W / 2, -H / 2 + 1.4, W, H + 1);
    else c.drawImage(sprite('hoja' + w, W, H + 1, x => hoja(x, W, H, '#4c8a34')), -W / 2, -H / 2 + 1.4, W, H + 1);
    c.restore();
  };

  // ---------------- detalles de escala, pintados en el terreno ----------------
  function hojaSeca(ctx, x, y, w, rot, s) {
    if (macroPieza(ctx, 'seca', x, y + 1, w * 2, w * .65, s < .5)) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, .42);
    const col = ['#8a5a2a', '#a06c34', '#6a4422', '#b08a48'][(s * 4) | 0], g = ctx.createLinearGradient(0, -w * .4, 0, w * .4); g.addColorStop(0, shade(col, .22)); g.addColorStop(1, shade(col, -.38));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-w, 0); ctx.bezierCurveTo(-w * .4, -w * .62, w * .5, -w * .5, w, 0); ctx.bezierCurveTo(w * .5, w * .55, -w * .4, w * .6, -w, 0); ctx.fill();
    ctx.strokeStyle = 'rgba(40,24,10,.55)'; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(-w, 0); ctx.lineTo(w, 0); for (let i = 1; i < 7; i++) { const px = -w + w * 2 * i / 7; ctx.moveTo(px, 0); ctx.lineTo(px + w * .2, -w * .42); ctx.moveTo(px, 0); ctx.lineTo(px + w * .2, w * .42); } ctx.stroke();
    ctx.restore();
  }
  function brizna(ctx, x, y, h, inc, w, col) {
    const g = ctx.createLinearGradient(0, y - h, 0, y); g.addColorStop(0, shade(col, .32)); g.addColorStop(1, shade(col, -.42));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - w, y); ctx.quadraticCurveTo(x - w * .4, y - h * .6, x + inc, y - h); ctx.quadraticCurveTo(x + w * .9, y - h * .55, x + w, y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(236,250,200,.35)'; ctx.lineWidth = .3; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x, y - h * .6, x + inc * .96, y - h * .96); ctx.stroke();
  }
  function hongo(ctx, x, y, h, s) {
    if (macroPieza(ctx, 'hongos', x, y + 1, h * 1.2, h * 1.15, s < .5)) return;
    const r = h * .62, g = ctx.createLinearGradient(x - 3, 0, x + 3, 0); g.addColorStop(0, '#e6d6b8'); g.addColorStop(1, '#a08c6c');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 1.8, y); ctx.quadraticCurveTo(x - 1, y - h * .5, x - 1.2, y - h * .86); ctx.lineTo(x + 1.2, y - h * .86); ctx.quadraticCurveTo(x + 1, y - h * .5, x + 1.8, y); ctx.fill();
    const q = ctx.createRadialGradient(x - r * .3, y - h - r * .1, 1, x, y - h * .78, r * 1.1); q.addColorStop(0, s < .5 ? '#d8824a' : '#c8a868'); q.addColorStop(1, s < .5 ? '#6a2e16' : '#6a5230');
    ctx.fillStyle = q; ctx.beginPath(); ctx.ellipse(x, y - h * .82, r, r * .62, 0, Math.PI, 0); ctx.quadraticCurveTo(x, y - h * .72, x - r, y - h * .82); ctx.fill();
  }
  function piedrita(ctx, x, y, w, h) {
    ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(x + 2, y, w * 1.1, 2.2, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.ellipse(x, y - h * .7, w, h, 0, 0, TAU); ctx.clip(); ctx.fillStyle = patron(ctx, IM.muro, .3); ctx.fillRect(x - w, y - h * 2, w * 2, h * 2.4);
    const g = ctx.createRadialGradient(x - w * .4, y - h * 1.2, 1, x, y - h * .6, w * 1.3); g.addColorStop(0, 'rgba(255,250,235,.32)'); g.addColorStop(.6, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.6)'); ctx.fillStyle = g; ctx.fillRect(x - w, y - h * 2, w * 2, h * 2.4); ctx.restore();
  }

  const base = STYLE_MAP.anime;
  const sombraPie = () => sprite('sombra', 28, 8, x => { const g = x.createRadialGradient(14, 4, 0, 14, 4, 14); g.addColorStop(0, 'rgba(0,0,0,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.save(); x.translate(0, 2.8); x.scale(1, .24); x.translate(0, -2.8); x.fillStyle = g; x.fillRect(0, -16, 28, 40); x.restore(); }, 2);
  defStyle({
    id: ID, name: 'Macro con fotos de Calakmul', ref: 'Fotografía macro · foto real de Calakmul', order: 92, desc: 'Foto real de Calakmul vista desde el suelo, a la escala de un bicho.',
    fx: { dust: ['#b8a888', '#8a7a5a'], spark: ['#fff2c0', '#c8e8a0', '#ffffff'], confetti: ['#7fb24a', '#c8a868', '#d8824a', '#ffffff'] }, fresita: base.fresita, coin: base.coin, goal: base.goal,
    player(ctx, p, f) { if (p.on) ctx.drawImage(sombraPie(), p.x - 14, p.y - 4, 28, 8); base.player(ctx, p, f); },
    sky(ctx, f) {
      if (!listo()) { ctx.fillStyle = '#2a3a2a'; ctx.fillRect(0, 0, VW, VH); return; }
      const alto = 330, ancho = alto * IM.fondo.width / IM.fondo.height, rango = Math.max(1, L.camMax - L.camMin);
      strip(ctx, f, 'foto' + Math.round(rango), (ancho - VW) / rango, x => {
        x.drawImage(IM.fondo, 0, -72, ancho, alto);
        x.save(); x.globalCompositeOperation = 'lighter'; // luz entre las hojas, fuera de foco
        for (let i = 0; i < 18; i++) { const px = R(i, 21) * ancho, py = R(i, 22) * 110, r = 8 + R(i, 23) * 22, g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, 'rgba(255,246,206,.12)'); g.addColorStop(1, 'rgba(255,246,206,0)'); x.fillStyle = g; x.fillRect(px - r, py - r, r * 2, r * 2); }
        x.restore();
      });
      // pasto enorme a media distancia, desenfocado
      strip(ctx, f, 'medio' + Math.round(rango), .55, (x, w) => {
        x.filter = `blur(${2.4 * f.S}px)`;
        if (macroListo('pasto')) { for (let i = 0; i < w / 75 + 1; i++) macroPieza(x, 'pasto', i * 75 + R(i, 31) * 20, 212, 92, 110 + R(i, 32) * 35, i % 2 === 0); }
        else for (let i = 0; i < w / 16; i++) brizna(x, i * 16 + R(i, 31) * 16, 210, 70 + R(i, 32) * 100, (R(i, 33) - .5) * 44, 3 + R(i, 34) * 4, ['#3a5a2c', '#2c4a26', '#4a6a34'][(R(i, 35) * 3) | 0]);
        x.filter = 'none';
      });
    },
    terrain(ctx, f) {
      if (!listo()) return;
      const lp = organicLoops({ step: 4, amp: .55, freq: .32, seed: 7 });
      allLoopsPath(ctx, lp, 2); ctx.fillStyle = patron(ctx, IM.muro, .74); ctx.fill();
      ctx.save(); allLoopsPath(ctx, lp, 2); ctx.clip();
      // grano fino encima: la foto ampliada recupera poros y musgo
      ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .55; ctx.fillStyle = patron(ctx, IM.piso, .17); ctx.fillRect(0, 0, L.ww, VH + 8); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      const g = ctx.createLinearGradient(0, 110, 0, VH); g.addColorStop(0, 'rgba(0,0,0,.05)'); g.addColorStop(1, 'rgba(0,0,0,.72)'); ctx.fillStyle = g; ctx.fillRect(0, 0, L.ww, VH + 8);
      ctx.filter = `blur(${2.6 * f.S}px)`; allLoopsPath(ctx, lp, 2); ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 6; ctx.stroke(); ctx.filter = 'none';
      ctx.restore();
      for (const t of L.tops) {
        const a = t.x0 - .8, b = t.x1 + .8, borde = x => t.y + 7 + (noise1(x * .08, 3) - .5) * 5 + (noise1(x * .5, 8) - .5) * 1.6;
        ctx.save(); ctx.beginPath(); ctx.rect(a - 2, t.y + 2, b - a + 4, 28); ctx.clip();
        const sb = ctx.createLinearGradient(0, t.y + 4, 0, t.y + 22); sb.addColorStop(0, 'rgba(0,0,0,.6)'); sb.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sb; ctx.fillRect(a, t.y + 4, b - a, 18); ctx.restore();
        ctx.beginPath(); ctx.moveTo(a, t.y - .3); ctx.lineTo(b, t.y - .3); for (let x = b; x >= a; x -= 2.5) ctx.lineTo(x, borde(x)); ctx.closePath();
        ctx.fillStyle = patron(ctx, IM.piso, .4, t.y); ctx.fill();
        ctx.save(); ctx.clip(); const lz = ctx.createLinearGradient(0, t.y, 0, t.y + 9); lz.addColorStop(0, 'rgba(214,232,200,.34)'); lz.addColorStop(.3, 'rgba(255,255,255,0)'); lz.addColorStop(1, 'rgba(0,0,0,.26)'); ctx.fillStyle = lz; ctx.fillRect(a, t.y - 1, b - a, 12); ctx.restore();
        // musgo, ramitas y hojarasca, todo enorme junto a Itzel
        for (let x = a + 1; x < b; x += 1.6) { if (noise1(x * .035, 11) < .5) continue; ctx.fillStyle = ['#3a5a26', '#4f7030', '#6a8a3e', '#2c4a22'][(R(x, 12) * 4) | 0]; ctx.globalAlpha = .75; ctx.beginPath(); ctx.ellipse(x, t.y + R(x, 13) * 3, 1.5 + R(x, 14) * 1.8, 1 + R(x, 15), 0, 0, TAU); ctx.fill(); }
        ctx.globalAlpha = 1;
        for (let x = a + 6; x < b - 6; x += 15 + R(x, 16) * 34) hojaSeca(ctx, x, t.y + 1.2 + R(x, 17) * 2, 7 + R(x, 18) * 9, (R(x, 19) - .5) * .5, R(x, 20));
        for (let x = a + 20; x < b - 16; x += 70 + R(x, 24) * 90) { const l = 14 + R(x, 25) * 18; if (macroPieza(ctx, 'rama', x, t.y + 2, l * 2, 4, R(x, 26) < .5)) continue; ctx.strokeStyle = '#3a2614'; ctx.lineWidth = 2.1; ctx.beginPath(); ctx.moveTo(x - l, t.y + 2); ctx.quadraticCurveTo(x, t.y - 1.4, x + l, t.y + 1.2); ctx.stroke(); ctx.strokeStyle = 'rgba(190,150,100,.5)'; ctx.lineWidth = .5; ctx.stroke(); }
      }
      for (const o of L.deco) {
        const x = o.x, y = o.y + 1;
        if (o.k === 'T' && macroPieza(ctx, 'pasto', x, y, 58, 72, o.i % 2 === 1)) { /* apoyado en el terreno */ }
        else if (o.k === 'T') { for (let i = 0; i < 9; i++) brizna(ctx, x - 16 + i * 4 + R(o.i, i) * 3, y, 42 + R(o.i, i + 9) * 64, (R(o.i, i + 19) - .5) * 30, 1.6 + R(o.i, i + 29) * 1.8, ['#4f7a30', '#3a6428', '#688a3a'][i % 3]); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.ellipse(x + 2, y - 34, 1.3, 1.9, 0, 0, TAU); ctx.fill(); }
        else if (o.k === 'f') { hongo(ctx, x - 3, y, 16 + R(o.i, 41) * 6, R(o.i, 42)); hongo(ctx, x + 6, y, 10 + R(o.i, 43) * 5, R(o.i, 42)); }
        else if (o.k === 'r') piedrita(ctx, x, y, 13 + R(o.i, 44) * 9, 9 + R(o.i, 45) * 5);
      }
    },
    // briznas muy cerca de la cámara y viñeta: la profundidad de una foto macro
    over(ctx, f) {
      const c = cached(f, 'cerca', 1000, VH, x => { x.filter = `blur(${3.6 * f.S}px)`; if (macroListo('pasto')) { for (let i = 0; i < 12; i++) macroPieza(x, 'pasto', 40 + i * 85, VH + 8, 82, 50 + R(i, 52) * 20, i % 2 === 0); } else for (let i = 0; i < 16; i++) brizna(x, 40 + i * 64 + R(i, 51) * 40, VH + 8, 26 + R(i, 52) * 34, (R(i, 53) - .5) * 26, 5 + R(i, 54) * 6, '#1c3018'); x.filter = 'none'; });
      const o = wrap(f.cam * 1.35, 1000), S = f.S; ctx.drawImage(c, o * S, 0, Math.min(1000 - o, VW) * S, VH * S, 0, 0, Math.min(1000 - o, VW), VH);
      if (1000 - o < VW) ctx.drawImage(c, 0, 0, (VW - (1000 - o)) * S, VH * S, 1000 - o, 0, VW - (1000 - o), VH);
      screenLayer(ctx, f, 'viñeta', x => { const g = x.createRadialGradient(VW / 2, VH * .46, 130, VW / 2, VH * .5, 300); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(6,18,10,.5)'); x.fillStyle = g; x.fillRect(0, 0, VW, VH); });
    },
  });

  // el relleno de los niveles verticales (modos-propio.js): la misma piedra de la foto que el resto del terreno, no un verde liso
  window.MINIATURA_ARTE = { relleno: ctx => listo() ? patron(ctx, IM.muro, .74) : '#4f6232' };

  nivel(ID, {
    nombre: 'Calakmul, afuera de la pirámide', lema: 'Fresita amarra hilos de seda en las ramitas: columpia a Itzel sobre los barrancos.',
    foe: 'hormiga', fauna: ['hormiga', 'saltarina', 'avispaMini', 'rinoceronte', 'alacranMini'], power: 'seda', plat: { k: 'bloom', look: 'hojaMini' }, W: 264,
    skin: { plat: '#4c8a34', plat2: '#7fb24a', line: '#23361c', accent: '#ffe070', foe: { main: '#8a3c16', dark: '#2a1006', light: '#d8b890', accent: '#ffe070', eye: '#111111' } },
    // A esta escala, una zanja entre raíces es un barranco: de 7 a 14 losetas, imposibles de brincar.
    // Se cruzan columpiándose del hilo de seda (poder-seda.js) amarrado a las ramitas de arriba.
    build(b) {
      // I · el primer columpio, con canisteles marcando el arco
      b.g(0, 14).P(3).d('T', 7).d('f', 11).e(10, undefined, 'hormiga');
      b.o('ramita', 18, 4).c(16, 20, 8);
      // II · arrieras y la primera avispa que cruza el barranco
      b.g(22, 36).d('r', 25).d('T', 33).e(28, undefined, 'hormiga').isl(30, 32, 7).e(31, 7, 'saltarina').c(29, 33, 6);
      b.o('ramita', 40, 3).e(33, 5, 'avispaMini').c(38, 42, 9);
      // III · hojas que se abren con Fresita cerca y el alacrán abajo
      b.g(45, 56).d('f', 46).d('T', 55).e(52, undefined, 'alacranMini').p(48, 8, 3).p(52, 6, 3).c(52, 54, 4);
      // IV · dos columpios seguidos: se suelta uno y se agarra el otro en el aire (hoja de descanso a la mitad)
      b.o('ramita', 60, 4).p(63, 9, 2).o('ramita', 67, 4).c(59, 61, 9).c(66, 68, 9);
      // V · tierra alta con el escarabajo rinoceronte
      b.g(71, 86, 9).d('T', 73).d('r', 80).e(78, 9, 'rinoceronte').c(74, 84, 7);
      // VI · el barranco más hondo, con avispas
      b.o('ramita', 91, 2).e(100, 5, 'avispaMini').c(89, 93, 8);
      // VII · arrieras, saltarina y una isla de piedra
      b.g(96, 110).d('f', 98).e(100, undefined, 'hormiga').isl(103, 105, 7).e(104, 7, 'saltarina').c(103, 105, 6).d('T', 108);
      // VIII · el último columpio del primer tramo
      b.o('ramita', 114, 4).c(112, 116, 9);
      // (2026-11-21, «el nivel es muy corto»: de aquí en adelante, seis tramos más)
      // IX · la columna de arrieras: van en fila por el sendero; un tronco caído en medio
      b.g(118, 142).d('T', 120).d('r', 122).e(124, undefined, 'hormiga').e(127, undefined, 'hormiga').e(130, undefined, 'hormiga').isl(134, 137, 9).c(134, 137, 8).d('f', 140);
      // X · el barranco de los tres columpios (con una hoja de descanso que abre Fresita)
      b.o('ramita', 147, 3).o('ramita', 154, 3).p(157, 9, 2).o('ramita', 161, 3).e(143, 6, 'avispaMini').c(146, 148, 8).c(153, 155, 8).c(160, 162, 8);
      // XI · la escalera de hojas hasta la raíz alta
      b.g(165, 172).d('T', 167).p(173, 9, 2).p(176, 7, 2).p(173, 5, 2).e(175, 4, 'avispaMini').c(173, 174, 8).c(176, 177, 6);
      b.g(178, 192, 3).d('T', 181).d('f', 187).e(185, 3, 'saltarina').c(182, 190, 2);
      // XII · el columpio de bajada: se salta de la raíz y se agarra la ramita en plena caída
      b.o('ramita', 199, 4).c(196, 202, 9);
      b.g(205, 214, 7).e(210, 7, 'saltarina').d('r', 213).c(206, 212, 5);
      // XIII · el escarabajo rinoceronte y el alacrán entre piedras
      b.g(215, 229).d('r', 217).d('T', 223).e(221, undefined, 'rinoceronte').e(226, undefined, 'alacranMini').c(218, 228, 9);
      // XIV · el último barranco: dos columpios hacia la orilla alta, y la meta
      b.o('ramita', 233, 3).o('ramita', 240, 3).e(247, 7, 'avispaMini').c(232, 234, 8).c(239, 241, 8);
      b.g(244, 263, 9).d('T', 247).Gl(256).e(251, 9, 'hormiga').d('f', 260).c(246, 250, 7);
    },
  });
  if (typeof MUNDOS !== 'undefined') MUNDOS.push(ID);
  if (typeof ORDERED !== 'undefined') ORDERED.push(STYLE_MAP[ID]);
})();

// Itzel de acabado realista para el mundo macro de Calakmul.
(() => {
  // El estilo conserva su dibujante macro, pero comparte los estados de aire,
  // daño y carrera de Forge con hojas registradas de cuatro poses.
  if (window.ITZEL_FORGE?.conjuntos) window.ITZEL_FORGE.conjuntos.miniatura = {
    archivo: 'miniatura-acciones-v1/processed-v1', caja: [36, 26, 182, 212], alto: 21,
    activada: true, acciones: ['subir', 'caer', 'recibir_daño', 'correr']
  };
  const sprite = imgPerezosa('../Roguelike/assets/personajes/itzel-macro-opcion1.png');
  const carrera = new Image();
  carrera.src = '../Roguelike/assets/forge/itzel/miniatura-correr-v1/sheet-transparent.png';
  const acciones = new Image();
  acciones.src = '../Roguelike/assets/forge/itzel/miniatura-acciones-v1/processed-v1/sheet-transparent.png';
  const reposo = imgPerezosa('../Roguelike/assets/forge/itzel/miniatura-idle-piedra-v1/sheet-transparent.png');
  const estadosReposo = new WeakMap();
  const estadoHerida = new WeakMap();
  const anterior = STYLE_MAP.miniatura.player;
  function heridaActiva(p, f) {
    const t = f && Number.isFinite(f.t) ? f.t : 0, inv = p.inv || 0;
    const e = estadoHerida.get(p) || { inv: 0, hasta: -1 };
    if (inv > e.inv + .05) e.hasta = t + .35;
    e.inv = inv; estadoHerida.set(p, e);
    return inv > 0 && t < e.hasta;
  }
  function dibujaAccion(c, p, cuadro) {
    const [x, y, w, h] = [36, 26, 182, 212], alto = 21, ancho = alto * w / h;
    c.save(); c.translate(p.x, p.y); c.scale((p.face || 1) < 0 ? -1 : 1, 1);
    c.imageSmoothingEnabled = true;
    c.drawImage(acciones, (cuadro % 2) * 256 + x, Math.floor(cuadro / 2) * 256 + y, w, h, -ancho / 2, -alto, ancho, alto);
    c.restore();
  }
  function itzelMacro(c, p, f) {
    const herida = heridaActiva(p, f);
    const t = Number.isFinite(f?.t) ? f.t : 0, g = f?.g;
    let r = estadosReposo.get(p);
    if (!r) { r = { t, quieto: 0 }; estadosReposo.set(p, r); }
    const dt = Math.max(0, Math.min(.05, t - r.t)); r.t = t;
    const quieta = g && g.p === p && p.on !== false && Math.abs(p.vx || 0) < 3 && Math.abs(p.vy || 0) < 3 && !p.crouch && !p.pared && !(p.dash > 0) && !(p.inv > 0) && !herida && !(p.sq > .1) && !g.win && !(g.env && g.env.swim);
    r.quieto = quieta ? r.quieto + dt : 0;
    const fase = r.quieto - 2.5, ciclo = fase >= 0 ? fase % 8 : -1;
    if (ciclo >= 0 && ciclo < 1.6) {
      reposo.pide();
      if (reposo.complete && reposo.naturalWidth === 1024 && reposo.naturalHeight === 512) {
        const q = Math.min(7, Math.floor(ciclo / .2)), lado = 21 * 256 / 201;
        c.save(); c.translate(p.x, p.y); c.scale((p.face || 1) < 0 ? -1 : 1, 1); c.imageSmoothingEnabled = true;
        c.drawImage(reposo, (q % 4) * 256, Math.floor(q / 4) * 256, 256, 256, -lado / 2, -229 * lado / 256, lado, lado);
        c.restore(); return;
      }
    }
    if (acciones.complete && acciones.naturalWidth && herida) { dibujaAccion(c, p, 3); return; }
    if (acciones.complete && acciones.naturalWidth && p.on === false) { dibujaAccion(c, p, (p.vy || 0) < 0 ? 1 : 2); return; }
    if (!sprite.complete || !sprite.naturalWidth) return anterior(c, p, f);
    const corre = p.on && Math.abs(p.vx || 0) > 25;
    if (corre && carrera.complete && carrera.naturalWidth) {
      const cuadro = Math.floor((p.run || 0) / (Math.PI / 2)) % 4;
      const fw = carrera.naturalWidth / 4, fh = carrera.naturalHeight, alto = 21;
      const ancho = alto * fw / fh;
      c.save(); c.translate(p.x, p.y); c.scale((p.face || 1) < 0 ? -1 : 1, 1);
      c.imageSmoothingEnabled = true;
      c.drawImage(carrera, cuadro * fw, 0, fw, fh, -ancho / 2, -alto, ancho, alto);
      c.restore();
      return;
    }
    const paso = corre ? Math.sin(p.run || 0) : 0;
    const aire = !p.on, bote = corre ? -Math.abs(paso)*.5 : Math.sin((f.t||0)*2)*.1;
    const sx=170, sy=20, sw=650, sh=1500, corte=1220, mitad=325;
    const escala=21/sh, x=-sw*escala/2, y=-21;
    c.save(); c.translate(p.x,p.y); c.scale((p.face||1)<0?-1:1,1);
    c.imageSmoothingEnabled=true;
    if (p.on) { c.fillStyle='rgba(22,30,17,.2)'; c.beginPath(); c.ellipse(0,.1,5.5,1.1,0,0,Math.PI*2); c.fill(); }
    // Torso y piernas ocupan regiones distintas para evitar copias duplicadas.
    c.drawImage(sprite,sx,sy,sw,corte,x,y+bote,sw*escala,corte*escala);
    const dx=aire?.7:paso*.85, h=(sh-corte)*escala;
    c.drawImage(sprite,sx,sy+corte,mitad,sh-corte,x-dx,y+corte*escala+bote+(aire?-.4:Math.max(0,paso)*-.4),mitad*escala,h);
    c.drawImage(sprite,sx+mitad,sy+corte,sw-mitad,sh-corte,x+mitad*escala+dx,y+corte*escala+bote+(aire?-.2:Math.min(0,paso)*.4),(sw-mitad)*escala,h);
    c.restore();
  }
  function instalar(id) { if(id==='miniatura'&&STYLE_MAP.miniatura) STYLE_MAP.miniatura.player=itzelMacro; }
  instalar('miniatura');
  GANCHOS.en('aplicaElegido', previo => function (id,k=0){const nombre=previo(id,k);instalar(id);return nombre;});
})();
