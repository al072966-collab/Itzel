'use strict';
// =====================================================================
//  PAPEL PICADO, CON SUS ASSETS
//  El mundo de papel recortado se vuelve el mercado de la Calle 59 en
//  fiesta. El telón se dibuja aquí (inspirado en el panorama del mercado,
//  sin usarlo como imagen): cielo azul de papel con nubes de espiral,
//  lomas verdes, fachadas de colores con cornisas, la catedral y la
//  puerta de la ciudad, y tiras de papel picado que se mecen arriba.
//  Lo de enfrente usa los assets de tools/papel-picado.py
//  (Roguelike/assets/papel, 3 px por unidad):
//    · plataformas de papel que se doblan (cada una con su color, abierta
//      y doblada), el rehilete grande del mercado girando detrás de sus
//      aspas, puestos, jacarandas, macetas, rehiletitos y huacales;
//    · avispa (aleteo), tijeras (abren y cierran; caminan con patitas) y
//      grulla (aleteo y picada); canistel, corazón y el arco de salida;
//    · el avión de Fresita, redibujado con adornos de papel picado.
//  Nada de esto cambia colisiones ni mecánicas. Solo aplica al estilo
//  «paper»; si una imagen no ha cargado, se pinta lo de antes.
// =====================================================================
(function () {
  if (typeof STYLE_MAP === 'undefined' || !STYLE_MAP.paper || typeof MEC === 'undefined') return;
  const { LOOK, FD, OBJ } = MEC, ST = STYLE_MAP.paper, RUTA = '../Roguelike/assets/papel/';
  const TAM = {}, IMG = {};
  const tijerasForge = Array.from({ length: 8 }, (_, i) => {
    const img = new Image(); img.decoding = 'async';
    img.src = '../Roguelike/assets/forge/papel/tijeras-clips-v1/frames/frame-0' + i + '.png';
    return img;
  });
  const grullaForge = Array.from({ length: 8 }, (_, i) => {
    const img = new Image(); img.decoding = 'async';
    img.src = '../Roguelike/assets/forge/papel/grulla-clips-v1/frames/frame-0' + i + '.png';
    return img;
  });
  const avispaForge = Array.from({ length: 8 }, (_, i) => {
    const img = new Image(); img.decoding = 'async';
    img.src = '../Roguelike/assets/forge/papel/avispa-clips-v1/frames/frame-0' + i + '.png';
    return img;
  });
  const listo = n => { const im = IMG[n]; return !!(im && im.complete && im.naturalWidth && TAM[n]); };
  let faltan = 1;
  (window.PAPEL_MANIFIESTO ? Promise.resolve(window.PAPEL_MANIFIESTO) : fetch(RUTA + 'papel.json?v=8').then(r => r.json())).then(m => {
    Object.assign(TAM, m); faltan = Object.keys(m).length;
    for (const n of Object.keys(m)) { const im = new Image(); im.decoding = 'async'; im.onload = im.onerror = () => { if (--faltan === 0) rehaz(); }; im.src = RUTA + n + '.png?v=8'; IMG[n] = im; }
  }).catch(() => { faltan = -1; });
  function rehaz() { if (typeof CACHE !== 'undefined') for (const k of [...CACHE.keys()]) if (k.startsWith('paper@')) CACHE.delete(k); }

  let ACTIVO = false;
  const esPapel = st => !!st && st.id === 'paper' && !window.estiloArteDerivado;
  if (typeof renderScene === 'function') {
    GANCHOS.en('renderScene', antes => function (ctx, st) { const a = ACTIVO; ACTIVO = esPapel(st); try { return antes.apply(this, arguments); } finally { ACTIVO = a; } });
  }
  function spr(c, n, x, y, o = {}) {
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';   // las piezas vienen a 6 px por unidad: que se reduzcan bien
    const t = TAM[n], w = t.w * (o.k || 1) * (o.kx || 1), h = t.h * (o.k || 1), ax = o.ax ?? .5, ay = o.ay ?? 1;
    if (!o.voltea && !o.rot) { c.drawImage(IMG[n], x - w * ax, y - h * ay, w, h); return; }
    c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot); if (o.voltea) c.scale(-1, 1); c.drawImage(IMG[n], -w * ax, -h * ay, w, h); c.restore();
  }
  const h1 = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const sombra = (x, f, b = 4, oy = 1.8, a = .3) => { x.shadowColor = `rgba(70,40,20,${a})`; x.shadowBlur = b * f.S; x.shadowOffsetY = oy * f.S; x.shadowOffsetX = 0; };
  const sinSombra = x => { x.shadowColor = 'transparent'; x.shadowBlur = 0; x.shadowOffsetY = 0; };

  const FONDO_PAPEL = {};
  for (const [n, archivo] of Object.entries({ cielo:'cielo-papel-v1', calle:'calle-papel-v1', tierra:'tierra-papel-v1', pasto:'pasto-papel-v1', puente:'puente-perros-v1' })) {
    const im = FONDO_PAPEL[n] = new Image(); im.decoding = 'async'; im.onload = rehaz; im.src = RUTA + archivo + '.png';
  }
  const papelPrincipal = f => ((f && f.g && f.g.def && f.g.def.id) || (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id)) === 'paper';
  const papelFondoListo = () => Object.values(FONDO_PAPEL).every(im => im.complete && im.naturalWidth);
  window.PAPEL_TELON_LISTO = papelFondoListo;
  function paisajePapel(c, f) {
    const im = FONDO_PAPEL.cielo, H = f.H || VH, sw = Math.min(im.naturalWidth,im.naturalHeight * VW/H), max = Math.max(0,im.naturalWidth-sw);
    const sx = max*(.5+.25*Math.sin((f.cam||0)*.0007)); c.save(); c.imageSmoothingEnabled = true;
    c.drawImage(im,sx,0,sw,im.naturalHeight,0,0,VW,H);
    const w = 590, h = w*423/2172, off = (((f.cam||0)*.18)%w+w)%w, base = 219-(f.y0||0);
    for (let x=-off-w;x<VW+w;x+=w) c.drawImage(FONDO_PAPEL.calle,0,191,2172,423,x,base-h,w,h);
    const paso=540, op=(((f.cam||0)*.22)%paso+paso)%paso;
    for(let x=-op-paso;x<VW+paso;x+=paso) c.drawImage(FONDO_PAPEL.puente,x+20,base-75,204,75);
    if (listo('banderitas0')) for (let k=-1;k*130-((f.cam||0)*.18%130)<VW+130;k++) {
      const x=k*130-((f.cam||0)*.18%130), n='banderitas'+(Math.abs(k)%4), t=TAM[n];
      if(t && listo(n)) c.drawImage(IMG[n],x,1,t.w*.6,t.h*.6);
    }
    c.restore();
  }
  // ---------------- el telón: el mercado en fiesta, recortado en papel ----------------
  function nube(x, f, cx, cy, s) {
    sombra(x, f, 3, 1.5, .22); x.fillStyle = '#fbf2dc'; x.beginPath();
    for (const [dx, dy, r] of [[-14, 2, 7], [-5, -3, 9], [6, -4, 10], [16, 1, 7], [0, 4, 8]]) { x.moveTo(cx + dx * s + r * s, cy + dy * s); x.arc(cx + dx * s, cy + dy * s, r * s, 0, TAU); }
    x.fill(); sinSombra(x);
    x.strokeStyle = 'rgba(190,150,100,.55)'; x.lineWidth = .7; x.lineCap = 'round';
    for (const [dx, dy] of [[-5, -2], [7, -3]]) { x.beginPath(); for (let k = 0; k < 18; k++) { const a = k * .55, r = .5 + k * .28; x.lineTo(cx + dx * s + Math.cos(a) * r * s, cy + dy * s + Math.sin(a) * r * s); } x.stroke(); }
  }
  function lomas(x, f, w, base, amp, col, col2, sem) {
    const y = xx => base - (Math.sin(xx * .012 + sem) * .5 + .5) * amp - (Math.sin(xx * .031 + sem * 2) * .5 + .5) * amp * .35;
    sombra(x, f, 5, 2, .25); x.beginPath(); x.moveTo(-2, VH + 4); for (let xx = -2; xx <= w + 2; xx += 3) x.lineTo(xx, y(xx)); x.lineTo(w + 2, VH + 4); x.closePath(); x.fillStyle = col; x.fill(); sinSombra(x);
    x.save(); x.clip(); x.strokeStyle = col2; x.lineWidth = 5; x.lineCap = 'round';
    for (let k = 0; k < 4; k++) { x.beginPath(); for (let xx = -2; xx <= w + 2; xx += 4) x.lineTo(xx, y(xx) + 8 + k * 9 + Math.sin(xx * .02 + k) * 3); x.stroke(); }
    x.restore();
  }
  function fachadas(x, f, w, base) {
    const COL = ['#f2a65a', '#3cb6b2', '#f5c84c', '#e85a8a', '#8fd36a', '#f07a4a', '#5fb0e0'];
    for (let px = -10, i = 0; px < w + 10; i++) {
      const fw = 30 + h1(i, 61) * 26, fh = 34 + h1(i, 62) * 22, col = COL[Math.floor(h1(i, 63) * COL.length)], top = base - fh;
      sombra(x, f, 3, 1.4, .28); x.fillStyle = col; x.fillRect(px, top, fw, VH - top); sinSombra(x);
      x.fillStyle = '#f6e7c8'; x.fillRect(px - 1, top - 2, fw + 2, 3.2); x.fillRect(px, top + 4, 2.2, fh - 4); x.fillRect(px + fw - 2.2, top + 4, 2.2, fh - 4);   // cornisa y pilastras de cantera
      if (h1(i, 64) < .45) { x.beginPath(); x.moveTo(px + fw * .25, top - 2); x.quadraticCurveTo(px + fw / 2, top - 10, px + fw * .75, top - 2); x.closePath(); x.fill(); }   // pretil con remate
      const n = Math.max(1, Math.floor(fw / 13)), gp = fw / n;
      for (let k = 0; k < n; k++) {                                     // ventanas con su marco y reja
        const wx = px + gp * (k + .5), wy = top + 10;
        x.fillStyle = '#f6e7c8'; x.fillRect(wx - 4, wy - 1.5, 8, 14);
        x.fillStyle = '#6a4636'; x.beginPath(); x.moveTo(wx - 2.8, wy + 11); x.lineTo(wx - 2.8, wy + 2.5); x.arc(wx, wy + 2.5, 2.8, Math.PI, 0); x.lineTo(wx + 2.8, wy + 11); x.fill();
        x.strokeStyle = 'rgba(40,24,18,.6)'; x.lineWidth = .4; for (let r = -1.8; r <= 1.8; r += 1.2) { x.beginPath(); x.moveTo(wx + r, wy + 1); x.lineTo(wx + r, wy + 11); x.stroke(); }
      }
      if (h1(i, 65) < .4) { const dx = px + fw / 2; x.fillStyle = '#f6e7c8'; x.fillRect(dx - 5, base - 17, 10, 17); x.fillStyle = '#7a4a34'; x.beginPath(); x.moveTo(dx - 3.6, base); x.lineTo(dx - 3.6, base - 11); x.arc(dx, base - 11, 3.6, Math.PI, 0); x.lineTo(dx + 3.6, base); x.fill(); }
      px += fw;
      if (h1(i, 66) < .14) {                                            // la catedral, con sus dos torres
        const cw = 44, ct = base - 64; sombra(x, f, 4, 1.6, .28); x.fillStyle = '#f3e3c2';
        x.fillRect(px, ct + 22, cw, VH); for (const tx of [px + 2, px + cw - 12]) { x.fillRect(tx, ct, 10, 30); x.beginPath(); x.arc(tx + 5, ct, 5, Math.PI, 0); x.fill(); x.fillRect(tx + 4.4, ct - 9, 1.2, 5); x.fillRect(tx + 3, ct - 7.6, 4, 1); }
        sinSombra(x); x.fillStyle = '#c9a77a'; for (const tx of [px + 2, px + cw - 12]) { x.beginPath(); x.moveTo(tx + 3, ct + 14); x.lineTo(tx + 3, ct + 7); x.arc(tx + 5, ct + 7, 2, Math.PI, 0); x.lineTo(tx + 7, ct + 14); x.fill(); }
        x.fillStyle = '#7a4a34'; x.beginPath(); x.moveTo(px + cw / 2 - 5, base); x.lineTo(px + cw / 2 - 5, base - 14); x.arc(px + cw / 2, base - 14, 5, Math.PI, 0); x.lineTo(px + cw / 2 + 5, base); x.fill();
        px += cw;
      } else if (h1(i, 67) < .1) {                                      // la puerta de la ciudad
        const cw = 40, ct = base - 42; sombra(x, f, 4, 1.6, .28); x.fillStyle = '#f0dcb4'; x.fillRect(px, ct, cw, VH); sinSombra(x);
        x.beginPath(); x.moveTo(px + 6, ct); x.quadraticCurveTo(px + cw / 2, ct - 12, px + cw - 6, ct); x.fill();
        x.fillStyle = '#8fcbe4'; x.beginPath(); x.moveTo(px + 10, base); x.lineTo(px + 10, ct + 18); x.arc(px + cw / 2, ct + 18, cw / 2 - 10, Math.PI, 0); x.lineTo(px + cw - 10, base); x.fill();
        px += cw;
      }
    }
  }
  function mercado(x, f, w, base) {
    // puestos, jacarandas y macetas del mercado, un poco velados para que no compitan con lo que se pisa
    x.imageSmoothingQuality = 'high';
    // Una franja de calle sostiene visualmente los puestos y árboles del fondo.
    x.fillStyle = '#d8bf9a'; x.fillRect(0, base, w, VH - base);
    for (let k = 0; k * 90 < w + 90; k++) {
      if (h1(k, 71) < .3) continue;
      const px = k * 90 + h1(k, 72) * 40, n = ['puesto', 'puesto2', 'jacaranda', 'jacaranda'][Math.floor(h1(k, 73) * 4)];
      if (!listo(n)) continue;
      const t = TAM[n], s = n === 'jacaranda' ? .8 : .85;
      x.drawImage(IMG[n], px - t.w * s / 2, (n === 'farol' ? base - 40 : base) - t.h * s, t.w * s, t.h * s);
      if (h1(k, 74) < .5 && listo('maceta1')) { const m = TAM.maceta1; x.drawImage(IMG['maceta' + Math.floor(h1(k, 75) * 3)], px + 24, base - m.h * .8, m.w * .8, m.h * .8); }
    }
    x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(246,232,206,.5)'; x.fillRect(0, 0, w, VH); x.globalCompositeOperation = 'source-over';
  }
  function cieloPapel(ctx, f) {
    ctx.drawImage(paperTex(f, 'papelCielo', '#8fd0ea', { grain: 10, blot: 6, fibers: 6 }), 0, 0, VW, VH);
    const sol = cached(f, 'papelSol', 80, 80, x => { sombra(x, f, 4, 2); for (const [col, r] of [['#f29e4c', 24], ['#f6bd60', 18], ['#f9d78f', 11]]) { x.beginPath(); x.arc(40, 40, r, 0, TAU); x.fillStyle = col; x.fill(); } });
    ctx.drawImage(sol, 330 - 40 - f.cam * .03, 46 - 40, 80, 80);
    for (let i = 0; i < 4; i++) { const c = cached(f, 'papelNube' + i, 80, 40, x => nube(x, f, 40, 22, .9 + (i % 2) * .25)); ctx.drawImage(c, wrap(i * 140 + 40 - f.cam * .06 - f.t * 2.5, VW + 120) - 90, 40 + (i * 23) % 50, 80, 40); }
    strip(ctx, f, 'papelLomas1', .08, (x, w) => lomas(x, f, w, 150, 34, '#7cc46a', 'rgba(150,215,110,.5)', 1));
    strip(ctx, f, 'papelLomas2', .14, (x, w) => lomas(x, f, w, 166, 26, '#4fa55a', 'rgba(110,190,90,.45)', 4));
    strip(ctx, f, 'papelCiudad', .24, (x, w) => { fachadas(x, f, w, 188); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(246,234,214,.34)'; x.fillRect(0, 0, w, VH); x.globalCompositeOperation = 'source-over'; });
    strip(ctx, f, 'papelMercado', .4, (x, w) => mercado(x, f, w, 206));
    // tiras de papel picado que se mecen hasta arriba, con huecos para que no tapen lo que se junta
    if (listo('banderitas0')) for (const [par, y, k, sem] of [[.22, 4, .6, 1]]) {
      const paso = 96 * k + 70, off = f.cam * par;
      for (let i = Math.floor(off / paso) - 1; i < (off + VW) / paso + 1; i++) {
        const n = 'banderitas' + Math.floor(h1(i, sem) * 4), t = TAM[n], x = i * paso - off;
        ctx.save(); ctx.translate(x + t.w * k / 2, y); ctx.rotate(Math.sin(f.t * 1.4 + i * 1.7) * .03); ctx.globalAlpha = .82;
        ctx.imageSmoothingQuality = 'high'; ctx.drawImage(IMG[n], -t.w * k / 2, 0, t.w * k, t.h * k); ctx.restore();
      }
    }
  }
  const cieloAntes = ST.sky;
  ST.sky = function (ctx, f) { if (!esPapel(f.st) || faltan !== 0) return cieloAntes.call(this, ctx, f); if (papelPrincipal(f) && papelFondoListo()) paisajePapel(ctx, f); else cieloPapel(ctx, f); };

  // El papel picado ya está en la capa ilustrada; evitar la hilera geométrica duplicada.
  const papelOverAntes = ST.over;
  ST.over = function (ctx, f) {
    if (esPapel(f.st) && papelPrincipal(f) && papelFondoListo()) return;
    if (papelOverAntes) return papelOverAntes.call(this, ctx, f);
  };
  // ---------------- el terreno: el de siempre, con el mercado encima ----------------
  // El Puente de los Perros (Campeche): puente amarillo de papel recortado con sus cuatro perros blancos, grande y a la vista,
  // sobre un canal; se repite a lo largo del nivel. Es solo telón: no es piso ni cambia ninguna colisión.
  // Todo con el look de papel recortado: cada pieza lleva su sombrita desplazada, como cartulina pegada una sobre otra.
  const SOMBRA = 'rgba(90,55,20,.28)';
  function pieza(c, trazo, relleno, borde, lw = .6) {
    c.save(); c.translate(.9, 1.1); c.fillStyle = SOMBRA; trazo(); c.fill(); c.restore();
    c.fillStyle = relleno; trazo(); c.fill(); if (borde) { c.strokeStyle = borde; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(); }
  }
  // un perro blanco sentado de perfil, mirando a la derecha (la base está en y=0)
  function perroBlanco(c, x, y, voltea) {
    c.save(); c.translate(x, y); if (voltea) c.scale(-1, 1); c.scale(1.6, 1.6);
    const B = '#fffaf0', S = '#e9d8b6', L = '#8a6a3a';
    const elip = (cx, cy, rx, ry, rot = 0) => () => { c.beginPath(); c.ellipse(cx, cy, rx, ry, rot, 0, 6.2832); };
    // cola enroscada
    pieza(c, () => { c.beginPath(); c.moveTo(-5, -2.5); c.quadraticCurveTo(-9.6, -3, -8.6, -8); c.quadraticCurveTo(-7.4, -5.6, -4.6, -4.8); c.closePath(); }, B, L);
    // anca y torso
    pieza(c, elip(-2.4, -3.4, 4.4, 3.5), B, L);
    pieza(c, elip(-.2, -7.6, 3.6, 5.4, .12), B, L);
    c.fillStyle = S; c.beginPath(); c.ellipse(-3.2, -2.4, 2.6, 1.6, 0, 0, 6.2832); c.fill();              // sombra del anca
    // patas delanteras
    pieza(c, () => { c.beginPath(); c.rect(.6, -6.2, 2.1, 6.2); }, B, L, .5);
    pieza(c, elip(2.2, -.3, 2.1, 1, 0), B, L, .5);
    // collar rojo con una medallita
    c.fillStyle = '#d6453a'; c.beginPath(); c.moveTo(-.9, -10.6); c.lineTo(3.1, -11.7); c.lineTo(3.4, -10.4); c.lineTo(-.7, -9.3); c.closePath(); c.fill();
    c.fillStyle = '#f2b52e'; c.beginPath(); c.arc(1.6, -9.2, .7, 0, 6.2832); c.fill();
    // cabeza, hocico y nariz
    pieza(c, elip(2.1, -13.6, 3.1, 2.9), B, L);
    pieza(c, elip(5.1, -12.5, 2.5, 1.5, .15), B, L);
    c.fillStyle = '#3a2a22'; c.beginPath(); c.ellipse(7.3, -12.8, .8, .65, 0, 0, 6.2832); c.fill();
    // oreja caída, ojo y bigotes
    pieza(c, () => { c.beginPath(); c.ellipse(.7, -13.2, 1.3, 2.9, .22, 0, 6.2832); }, S, L, .5);
    c.fillStyle = '#3a2a22'; c.beginPath(); c.arc(3.5, -14.2, .55, 0, 6.2832); c.fill();
    c.fillStyle = '#fff'; c.fillRect(3.7, -14.5, .25, .25);
    c.strokeStyle = 'rgba(138,106,58,.6)'; c.lineWidth = .3; c.beginPath(); c.moveTo(5.2, -12.2); c.lineTo(8.2, -11.6); c.moveTo(5.2, -11.9); c.lineTo(7.9, -11); c.stroke();
    c.restore();
  }
  function puentePerros(c, x, y, t) {
    if (window.LUGARES_CAMPECHE && window.LUGARES_CAMPECHE.dib(c, 'puente', x, y + 5, { w: 135 })) return;
    c.save(); c.translate(x, y);
    const AM = '#f2b52e', AM2 = '#e29a1a', CR = '#fff3c4', BO = '#a8701a';
    // el canal: agua de papel con ondas y el reflejo del arco
    const ag = c.createLinearGradient(0, -6, 0, 13); ag.addColorStop(0, '#8fd0dc'); ag.addColorStop(1, '#4d9fb8');
    pieza(c, () => { c.beginPath(); c.rect(-70, -6, 140, 19); }, ag, null);
    c.fillStyle = 'rgba(255,230,150,.28)'; c.beginPath(); c.ellipse(0, 3, 24, 5.5, 0, 0, 6.2832); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = .6; c.lineCap = 'round';
    for (let r = 0; r < 3; r++) for (let q = -68; q < 66; q += 14) { const o = Math.sin(t * 1.6 + q * .2 + r) * 1.2; c.beginPath(); c.arc(q + 7 + o + (r % 2) * 5, 1 + r * 5, 3.2, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    // las dos orillas de piedra
    for (const sx of [-1, 1]) pieza(c, () => { c.beginPath(); c.rect(sx < 0 ? -72 : 56, -8, 16, 21); }, '#efe0bd', '#c9b688', .5);
    // el cuerpo del puente con su arco central
    const gr = c.createLinearGradient(0, -22, 0, 0); gr.addColorStop(0, AM); gr.addColorStop(1, AM2);
    pieza(c, () => { c.beginPath(); c.moveTo(-58, -2); c.lineTo(-58, -17); c.quadraticCurveTo(0, -25, 58, -17); c.lineTo(58, -2); c.lineTo(31, -2); c.bezierCurveTo(30, -17, -30, -17, -31, -2); c.closePath(); }, gr, BO, .8);
    // el arco por dentro (se ve el agua) y las dovelas de piedra clara
    c.fillStyle = 'rgba(40,110,135,.85)'; c.beginPath(); c.moveTo(-28, -2); c.bezierCurveTo(-27, -14, 27, -14, 28, -2); c.closePath(); c.fill();
    c.strokeStyle = CR; c.lineWidth = 2.1; c.beginPath(); c.moveTo(-31, -2); c.bezierCurveTo(-30, -17, 30, -17, 31, -2); c.stroke();
    c.strokeStyle = BO; c.lineWidth = .45; for (let a = 0; a <= 12; a++) { const u = a / 12, px = -31 + 62 * u, py = -2 - Math.sin(u * Math.PI) * 11.4; c.beginPath(); c.moveTo(px, py + 1.2); c.lineTo(px, py - 1.4); c.stroke(); }
    pieza(c, () => { c.beginPath(); c.moveTo(-2.6, -13.2); c.lineTo(2.6, -13.2); c.lineTo(1.7, -9.6); c.lineTo(-1.7, -9.6); c.closePath(); }, CR, BO, .5);       // clave
    // la cornisa clara y el barandal con balaustres
    pieza(c, () => { c.beginPath(); c.moveTo(-60, -17.5); c.quadraticCurveTo(0, -26.6, 60, -17.5); c.lineTo(60, -20); c.quadraticCurveTo(0, -29, -60, -20); c.closePath(); }, CR, BO, .5);
    c.fillStyle = '#fff8dc'; for (let q = -54; q <= 54; q += 4.4) { const yy = -19.5 - Math.sqrt(Math.max(0, 1 - (q / 60) ** 2)) * 4.6 + 4.6 * .0; c.fillRect(q - .7, yy - 5.4, 1.4, 4.6); c.fillRect(q - 1, yy - 5.8, 2, .8); }
    // las cuatro pilastras con su remate y encima los perros
    for (const px of [-56, -37, 37, 56]) {
      const top = -19.5 - Math.sqrt(1 - (px / 60) ** 2) * 4.6 - 5;
      pieza(c, () => { c.beginPath(); c.rect(px - 3.6, top, 7.2, 13); }, '#f7d36a', BO, .6);
      pieza(c, () => { c.beginPath(); c.rect(px - 4.6, top - 2.3, 9.2, 2.5); }, CR, BO, .5);
      c.fillStyle = '#e45a8a'; c.beginPath(); c.arc(px, top + 5, 1.1, 0, 6.2832); c.fill();
      perroBlanco(c, px, top - 2.3, px < 0);
    }
    c.restore();
  }
  const cieloPerros = ST.sky;
  ST.sky = function (ctx, f) {
    const r = cieloPerros.apply(this, arguments);
    if (esPapel(f.st) && faltan === 0 && !(papelPrincipal(f) && papelFondoListo())) {
      const u = 540, off = (f.cam * .22) % u, base = Math.floor(f.cam * .22 / u);
      ctx.save(); ctx.globalAlpha = .96;
      for (let k = -1; k * u - off < VW + u; k++) puentePerros(ctx, k * u - off + 120, 178, f.t);
      ctx.restore();
    }
    return r;
  };
  const terrenoAntes = ST.terrain;
  ST.terrain = function (ctx, f) {
    if (window.estiloArteDerivado || faltan !== 0) return terrenoAntes.call(this, ctx, f);
    const deco = L.deco; L.deco = [];
    try { terrenoAntes.call(this, ctx, f); } finally { L.deco = deco; }
    if (papelPrincipal(f) && papelFondoListo()) {
      ctx.save(); allLoopsPath(ctx,L.loops); ctx.clip();
      const p = ctx.createPattern(FONDO_PAPEL.tierra,'repeat'); p.setTransform(new DOMMatrix().scale(140/FONDO_PAPEL.tierra.naturalWidth));
      ctx.fillStyle=p; ctx.fillRect(0,0,L.ww,VH+40); ctx.restore();
      for (const r of L.tops) {
        ctx.save(); ctx.beginPath(); ctx.rect(r.x0,r.y-6,r.x1-r.x0,9); ctx.clip();
        for(let x=r.x0;x<r.x1;x+=110) ctx.drawImage(FONDO_PAPEL.pasto,5,330,2160,139,x,r.y-5,110,7.1);
        ctx.restore();
      }
    } else {
    // la tierra como cartulina en capas: vetas onduladas, grumos claros y piedritas, recortadas al borde del piso
    ctx.save(); allLoopsPath(ctx, L.loops); ctx.clip();
    for (let k = 0; k < 7; k++) {
      ctx.strokeStyle = k % 2 ? 'rgba(255,214,160,.18)' : 'rgba(70,35,20,.22)'; ctx.lineWidth = 1.1; ctx.beginPath();
      for (let x = 0; x <= L.ww; x += 6) { const yy = 196 + k * 11 + Math.sin(x * .045 + k * 1.7) * 2.2; if (x) ctx.lineTo(x, yy); else ctx.moveTo(x, yy); }
      ctx.stroke();
    }
    for (let x = 4; x < L.ww; x += 17) for (let k = 0; k < 4; k++) { const hx = h1(x, k + 30); if (hx < .55) continue; ctx.fillStyle = hx > .85 ? 'rgba(255,225,185,.4)' : 'rgba(80,45,28,.35)'; ctx.beginPath(); ctx.ellipse(x + hx * 9, 202 + k * 13 + h1(x, k + 40) * 6, 1.4 + hx * 1.6, .9 + hx, 0, 0, 6.2832); ctx.fill(); }
    ctx.restore();
    // pastito de papel recortado (dos verdes, una hojita sobre otra) y florecitas de cartulina en cada orilla
    for (const r of L.tops) {
      for (let x = r.x0 + 2; x < r.x1 - 2; x += 5 + h1(x | 0, r.y + 3) * 4) {
        const hh = 2.6 + h1(x | 0, 61) * 3, c2 = h1(x | 0, 62) > .5 ? '#5d9a4a' : '#78b45c';
        ctx.fillStyle = 'rgba(40,70,30,.28)'; ctx.beginPath(); ctx.moveTo(x - 1.4 + .6, r.y + .9); ctx.lineTo(x + .6, r.y - hh + .9); ctx.lineTo(x + 1.6 + .6, r.y + .9); ctx.fill();
        ctx.fillStyle = c2; ctx.beginPath(); ctx.moveTo(x - 1.4, r.y + .5); ctx.lineTo(x + (h1(x | 0, 63) - .5) * 1.6, r.y - hh); ctx.lineTo(x + 1.6, r.y + .5); ctx.closePath(); ctx.fill();
      }
      for (let x = r.x0 + 10; x < r.x1 - 8; x += 22 + h1(x | 0, r.y + 7) * 26) {
        if (h1(x | 0, 64) < .45) continue;
        const col = ['#e45a8a', '#f2b52e', '#ffffff', '#8e6bd6'][Math.floor(h1(x | 0, 65) * 4)], fy = r.y - 4.2;
        ctx.strokeStyle = '#4d8a3c'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(x, r.y + .5); ctx.lineTo(x, fy); ctx.stroke();
        ctx.fillStyle = 'rgba(70,40,20,.25)'; for (let q = 0; q < 5; q++) { const a = q * 1.2566; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * 1.9 + .5, fy + Math.sin(a) * 1.9 + .6, 1.3, 1, a, 0, 6.2832); ctx.fill(); }
        ctx.fillStyle = col; for (let q = 0; q < 5; q++) { const a = q * 1.2566; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * 1.9, fy + Math.sin(a) * 1.9, 1.3, 1, a, 0, 6.2832); ctx.fill(); }
        ctx.fillStyle = '#ffe27a'; ctx.beginPath(); ctx.arc(x, fy, .9, 0, 6.2832); ctx.fill();
      }
    }
    }
    for (const r of L.tops) for (let x = r.x0 + 16; x < r.x1 - 16; x += 40 + h1(x | 0, r.y) * 40) {
      if (h1(x | 0, 21) < .5) continue;
      sombra(ctx, f, 2, 1, .3); spr(ctx, ['maceta0', 'maceta2', 'huacal', 'maceta-flores'][Math.floor(h1(x | 0, 22) * 4)], x, r.y + 1, { k: .85 }); sinSombra(ctx);
    }
    for (const o of L.deco) {
      const x = o.x, y = o.y + 1;
      sombra(ctx, f, 3, 1.4, .3);
      if (o.k === 'T') spr(ctx, 'jacaranda', x, y, { voltea: o.i % 2 === 1, k: .85 + (o.i % 3) * .1 });
      else if (o.k === 'f' && o.i % 3) spr(ctx, ['maceta1', 'maceta-flores'][o.i % 2], x, y);
      else if (o.k === 'r') spr(ctx, 'huacal', x, y);
      sinSombra(ctx);
    }
  };
  // los rehiletitos que giran sobre el piso (los de las flores sin maceta)
  const frenteAntes = ST.front;
  ST.front = function (ctx, f) {
    if (frenteAntes) frenteAntes.call(this, ctx, f);
    if (!esPapel(f.st) || !listo('rehilito0')) return;
    for (const o of L.deco) if (o.k === 'f' && o.i % 3 === 0) { const k = Math.floor(f.t * 9 + o.i) % 6; spr(ctx, 'rehilito' + k, o.x, o.y + 1); }
  };

  // ---------------- las plataformas que se doblan ----------------
  function papelAntes(ctx, pl, f, sk) {
    const x = pl.x, y = pl.y, w = pl.w, k = pl.on ? (pl.ph > (pl.duty || .62) - .12 ? 1 - ((pl.ph - (pl.duty || .62) + .12) / .12) : Math.min(1, pl.ph / .08)) : 0;
    if (k <= .02) { ctx.strokeStyle = 'rgba(80,50,30,.35)'; ctx.setLineDash([2, 2]); ctx.strokeRect(x, y, w, 5); ctx.setLineDash([]); return; }
    ctx.save(); ctx.translate(x + w / 2, y); ctx.scale(Math.max(.05, k), 1); ctx.shadowColor = 'rgba(70,40,20,.4)'; ctx.shadowBlur = 3 * f.S; ctx.shadowOffsetY = 1.5 * f.S; ctx.fillStyle = sk.plat; ctx.fillRect(-w / 2, 0, w, 5); ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + 5); ctx.stroke();
  }
  LOOK.paper = (ctx, pl, f, sk) => {
    if (!ACTIVO || !listo('plat0')) return papelAntes(ctx, pl, f, sk);
    const x = pl.x, y = pl.y, w = pl.w, k = pl.on ? (pl.ph > (pl.duty || .62) - .12 ? 1 - ((pl.ph - (pl.duty || .62) + .12) / .12) : Math.min(1, pl.ph / .08)) : 0;
    const v = Math.floor(h1(Math.round(pl.x0), 4) * 5);
    if (k <= .02) {                                                    // doblada del todo: queda su contorno punteado y la tira doblada, chiquita
      ctx.strokeStyle = 'rgba(80,50,30,.35)'; ctx.setLineDash([2, 2]); ctx.strokeRect(x, y, w, 5); ctx.setLineDash([]);
      ctx.save(); ctx.globalAlpha = .55; spr(ctx, 'doblada' + v, x + w / 2, y - 1, { ay: 0, k: w / 48 * .45 }); ctx.restore(); return;
    }
    ctx.save(); sombra(ctx, f, 3, 1.5, .35);
    if (k > .45) spr(ctx, 'plat' + v, x + w / 2, y - 1, { ay: 0, k: w / 48, kx: .55 + .45 * k });
    else spr(ctx, 'doblada' + v, x + w / 2, y - 1, { ay: 0, k: w / 48, kx: .6 + k });
    ctx.restore();
  };
  // ---------------- el rehilete grande del mercado ----------------
  if (OBJ.rehilete) {
    const rehileteAntes = OBJ.rehilete.draw;
    OBJ.rehilete.draw = function (c, o, f) {
      if (!ACTIVO || !listo('rehilete')) return rehileteAntes.call(this, c, o, f);
      const base = L.surfaceY(Math.floor(o.cx / T), Math.floor(o.cy / T) + 1) * T, a0 = o.aspas[0].t * o.sp;
      c.save(); sombra(c, f, 2, 1, .35);
      c.fillStyle = '#e8d2a8'; c.fillRect(o.cx - 1.6, o.cy, 3.2, Math.min(VH, base) - o.cy);
      c.fillStyle = '#e85a8a'; for (let yy = o.cy + 6; yy < Math.min(VH, base); yy += 7) c.fillRect(o.cx - 1.6, yy, 3.2, 2);   // el palo con su listón de colores
      spr(c, 'rehilete', o.cx, o.cy, { ay: .45, rot: a0, k: o.R * 1.45 / TAM.rehilete.w });
      c.restore();
    };
  }
  // ---------------- el avión de Fresita, con su papel picado ----------------
  const MANO_AVION = (ctx, pl, f) => {
    const x = pl.x, y = pl.y, w = pl.w, t = f.t;
    ctx.save();
    if (pl.dir < 0) { ctx.translate(x * 2 + w, 0); ctx.scale(-1, 1); }
    sombra(ctx, f, 3, 2, .35);
    ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.moveTo(x - 2, y); ctx.lineTo(x + w + 3, y + 1); ctx.lineTo(x + 5, y + 7); ctx.closePath(); ctx.fill(); sinSombra(ctx);
    ctx.fillStyle = '#e85a8a'; ctx.beginPath(); ctx.moveTo(x + 2, y + 1.2); ctx.lineTo(x + w * .8, y + 1.6); ctx.lineTo(x + 6, y + 4.4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffbf00'; ctx.beginPath(); ctx.arc(x + w * .38, y + 2.3, 1.3, 0, TAU); ctx.fill(); ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.arc(x + w * .38, y + 2.3, .5, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(80,50,30,.45)'; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(x + 4, y + .5); ctx.lineTo(x + w + 3, y + 1); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = .7; for (let i = 0; i < 3; i++) { const yy = y + 1.5 + i * 1.8, l = 6 + Math.sin(t * 20 + i) * 2; ctx.beginPath(); ctx.moveTo(x - 4 - i, yy); ctx.lineTo(x - 4 - i - l, yy); ctx.stroke(); }
    ctx.restore();
  };
  const avionAntes = LOOK.plane;
  LOOK.plane = (ctx, pl, f, sk) => {
    if (ACTIVO) return MANO_AVION(ctx, pl, f);
    if (avionAntes) return avionAntes(ctx, pl, f, sk);
    const x = pl.x, y = pl.y, w = pl.w; ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y + 1); ctx.lineTo(x + 6, y + 6); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(80,50,30,.5)'; ctx.lineWidth = .5; ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 4, y + .4); ctx.lineTo(x + w, y + 1); ctx.stroke();
  };

  // ---------------- canistel, corazón y salida ----------------
  if (typeof monedaItzel === 'function') {
    GANCHOS.en('monedaItzel', monedaAntes => function (ctx, x, y, t, f, especial) {
      if (especial || !ACTIVO || !listo('canistel')) return monedaAntes.apply(this, arguments);
      spr(ctx, 'canistel', x, y + Math.sin(t * 2.6 + x * .04) * 1.4, { ay: .5, kx: .75 + .25 * Math.abs(Math.cos(t * 2.4 + x * .05)) });
    });
  }
  if (typeof drawHeart === 'function') {
    GANCHOS.en('drawHeart', corazonAntes => function (ctx, x, y) { if (!ACTIVO || !listo('corazon')) return corazonAntes.apply(this, arguments); spr(ctx, 'corazon', x, y, { ay: .5 }); });
  }
  const metaAntes = ST.goal;
  ST.goal = function (ctx, x, y, t, f) {
    if (!esPapel(f && f.st) || !listo('salida')) return metaAntes.apply(this, arguments);
    ctx.save(); sombra(ctx, f, 4, 2, .3); spr(ctx, 'salida', x, y + 2); ctx.restore();
  };

  // ---------------- avispa, tijeras y grulla ----------------
  const envuelve = (k, fn) => {
    const antes = FD[k]; if (!antes) return;
    const nuevo = function (c, e, t, s) { if (!ACTIVO || e.sub || !listo(k + '0')) return antes.call(this, c, e, t, s); c.save(); c.shadowColor = 'rgba(70,40,20,.32)'; c.shadowBlur = 2; c.shadowOffsetY = 1; fn(c, e, t); c.restore(); };
    nuevo._assetNuevo = true;
    nuevo._assetListo = () => (ACTIVO && listo(k + '0')) || !!(antes._assetListo && antes._assetListo());
    FD[k] = nuevo;
  };
  envuelve('avispa', (c, e, t) => {
    if (e.st === 'sleep') {
      c.save(); c.rotate(-.12 + Math.sin(t * 2.2) * .05); c.filter = 'saturate(.6) brightness(.82)';
      spr(c, 'avispa0', 0, 1); c.restore(); return;
    }
    const n = Math.floor(t * (e.st === 'dive' ? 30 : 20) + e.hx) % 8, img = avispaForge[n];
    if (img && img.complete && img.naturalWidth) { c.drawImage(img, -56.5 / 6, 1 - 86 / 6, 113 / 6, 87 / 6); return; }
    spr(c, 'avispa' + n, 0, 1);
  });
  envuelve('tijeras', (c, e, t) => {
    const fase = e.t % 1.4, abre = fase < .55 ? Math.sin((fase / .55) * Math.PI) * .7 : 0;
    const camina = Math.abs(e.vx || 0) > 1;
    const n = e.st === 'sleep' ? 7 : e.st === 'gone' ? 3 : fase < .55
      ? camina && abre > .25 ? 4 + Math.floor(Math.abs(e.anim || t) * 6) % 2 : abre > .45 ? 0 : abre > .25 ? 1 : abre > .08 ? 2 : 3
      : Math.floor(e.t * 6) % 2 ? 6 : 7;
    const img = tijerasForge[n];
    if (img.complete && img.naturalWidth) { c.drawImage(img, -58 / 6, 1 - 97 / 6, 116 / 6, 98 / 6); return; }
    spr(c, 'tijeras' + n, 0, 1);
  });
  envuelve('grulla', (c, e, t) => {
    const quieta = e.st === 'sleep' || e.st === 'stun' || e.st === 'gone' || (e.aturde || 0) > 0;
    const paso = ((Math.floor((e.anim ?? t) * 8.57 + (e.hx || 0)) % 7) + 7) % 7;
    const n = quieta ? 2 : e.st === 'dive' ? 7 : paso, img = grullaForge[n];
    // El dibujo anterior ocupaba ~18×11 unidades con hitbox 14×8.
    // Mantener esa escala y el ancla compartida evita agrandar el papel por el margen transparente.
    if (img.complete && img.naturalWidth) { c.drawImage(img, -9, -14, 18, 14.1); return; }
    spr(c, 'grulla' + n, 0, 2);
  });
  window.PAPEL_PICADO = { IMG, TAM, listo, rehaz, tijerasForge, grullaForge, avispaForge, activo: () => ACTIVO };
})();
