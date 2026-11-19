'use strict';
// =====================================================================
//  CINEMÁTICAS · lo que les falta a los títeres nuevos de Itzel y Fresita
//  Los títeres del juego solo se ven de lado. Aquí se arman, con piezas de
//  la misma ilustración (falda, huipil, piernas, flores, branquias y cola):
//    · Itzel de espaldas, de pie o sentada en el pretil
//    · Itzel sentada de lado, con las piernas colgando
//    · la boca de Itzel cuando habla
//    · Fresita de espaldas, flotando o sentada en el pretil
//  Todo se dibuja en las coordenadas del dibujo original (los pies de Itzel
//  en 0,0; el centro de Fresita en 0,0) y cine-actores.js lo escala.
// =====================================================================
const CINE_TITERES = (() => {
  const hojas = {};
  function hoja(d) { if (!hojas[d.ruta]) { const im = new Image(); im.src = d.ruta; hojas[d.ruta] = im; } const im = hojas[d.ruta]; return im.complete && im.naturalWidth ? im : null; }
  // una pieza donde iba en el dibujo, o en otro lugar (x, y) y con otro tamaño
  function pieza(c, im, q, x = q[4], y = q[5], w = q[6], h = q[7]) { c.drawImage(im, q[0], q[1], q[2], q[3], x, y, w, h); }
  const IT = () => TITERES_DATOS.itzelCorto || TITERES_DATOS.itzel, FR = () => TITERES_DATOS.fresita;
  const PIES = [680, 1312], LINEA = '#2b1712', PIEL = '#d98a52', PIEL2 = '#a85a32';

  // ---------- Itzel de espaldas ----------
  // el pelo corto por detrás: una melena redonda con mechones, brillo arriba y puntas que se mueven con el viento
  function melena(c, t, viento) {
    const cx = 0, cy = -1085, sw = Math.sin(t * 1.3) * 6 + viento * 18;
    const borde = []; for (let i = 0; i <= 26; i++) { const u = i / 26, a = Math.PI * (1.02 + u * .96), r = 205 + Math.sin(u * 37) * 6; borde.push([cx + Math.cos(a) * r, cy + Math.sin(a) * 215]); }
    const puntas = []; for (let i = 0; i <= 12; i++) { const u = i / 12, x = cx + 214 - u * 428, y = cy + 150 + Math.sin(u * Math.PI) * 70 + (i % 2 ? -26 : 8); puntas.push([x + sw * (1 - Math.abs(u - .5)), y]); }
    const forma = () => { c.beginPath(); c.moveTo(cx + 214, cy - 10); for (const [x, y] of borde.slice().reverse()) c.lineTo(x, y); c.lineTo(cx - 214, cy - 10); for (const [x, y] of puntas.slice().reverse()) c.lineTo(x, y); c.closePath(); };
    forma(); const g = c.createLinearGradient(0, cy - 215, 0, cy + 210); g.addColorStop(0, '#5a3a30'); g.addColorStop(.45, '#3a2420'); g.addColorStop(1, '#22140f'); c.fillStyle = g; c.fill();
    c.save(); forma(); c.clip();
    c.lineCap = 'round';
    for (let i = 0; i < 26; i++) { const u = i / 25, x0 = cx - 190 + u * 380, lado = (u - .5) * 2; c.strokeStyle = i % 3 ? 'rgba(120,80,64,.42)' : 'rgba(20,10,8,.45)'; c.lineWidth = i % 3 ? 5 : 7; c.beginPath(); c.moveTo(cx + lado * 30, cy - 200); c.quadraticCurveTo(x0 + lado * 40, cy - 60, x0 + lado * 30 + sw * .6, cy + 160 + Math.sin(i * 1.7) * 20); c.stroke(); }
    c.fillStyle = 'rgba(190,140,112,.32)'; c.beginPath(); c.ellipse(cx - 60, cy - 120, 120, 34, -.35, 0, Math.PI * 2); c.fill(); // el brillo
    c.restore();
    forma(); c.strokeStyle = LINEA; c.lineWidth = 7; c.lineJoin = 'round'; c.stroke();
  }
  function brazoEspalda(c, lado, t, bajo) {
    const x0 = lado * 118, y0 = -925, mx = lado * 150, my = bajo, sw = Math.sin(t * 1.6 + lado) * 4;
    c.lineCap = 'round'; c.strokeStyle = LINEA; c.lineWidth = 84; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(lado * 176, (y0 + my) / 2, mx + sw, my); c.stroke(); // brazos llenos, como en la ilustración
    c.strokeStyle = PIEL; c.lineWidth = 72; c.stroke();
    c.strokeStyle = 'rgba(120,60,30,.32)'; c.lineWidth = 22; c.beginPath(); c.moveTo(x0 + lado * 16, y0 + 30); c.quadraticCurveTo(lado * 182, (y0 + my) / 2, mx + sw + lado * 14, my); c.stroke(); // la sombra del lado de afuera
    c.fillStyle = PIEL; c.beginPath(); c.ellipse(mx + sw, my + 22, 38, 44, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = LINEA; c.lineWidth = 6; c.stroke();
  }
  function sandalia(c, x) {
    c.fillStyle = PIEL2; c.beginPath(); c.ellipse(x, -52, 42, 40, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#2a3aa8'; c.fillRect(x - 46, -64, 92, 26); c.fillStyle = '#e8304a'; c.fillRect(x - 46, -60, 92, 6); c.fillStyle = '#f2c230'; for (let k = -30; k <= 30; k += 20) c.fillRect(x + k - 4, -52, 8, 8);
    c.fillStyle = '#2a3aa8'; c.beginPath(); c.roundRect ? c.roundRect(x - 50, -22, 100, 24, 10) : c.rect(x - 50, -22, 100, 24); c.fill(); c.fillStyle = '#e8304a'; c.fillRect(x - 50, -6, 100, 6);
    c.strokeStyle = LINEA; c.lineWidth = 5; c.strokeRect(x - 50, -22, 100, 24);
  }
  // de pie: piernas, falda, brazos, huipil, melena y flor. sentada: corta en el asiento (las piernas cuelgan del lado del mar)
  // el dibujo de espaldas de David (assets/personajes/cine/itzel-espaldas.png): de la faja para arriba respira y la falda se mece
  const ESPALDAS = new Image(); ESPALDAS.src = 'assets/personajes/cine/itzel-espaldas.png';
  const E_PIES = 601, E_FAJA = 300, E_K = 1290 / 598;
  function itzelEspaldaDibujo(c, t, sentada, viento) {
    const im = ESPALDAS, w = im.naturalWidth, h = im.naturalHeight, x0 = -w / 2 * E_K, y0 = -E_PIES * E_K, corte = E_FAJA + 16;
    const resp = Math.sin(t * 1.8) * .006, mece = Math.sin(t * 1.2) * .035 + viento * .05;
    c.save(); c.translate(0, (corte - E_PIES) * E_K); c.scale(1, 1 + resp); c.drawImage(im, 0, 0, w, corte, x0, -corte * E_K, w * E_K, corte * E_K); c.restore();
    if (!sentada) { c.save(); c.translate(0, (corte - E_PIES) * E_K); c.transform(1, 0, mece, 1, 0, 0); c.drawImage(im, 0, corte - 1, w, h - corte + 1, x0, -1, w * E_K, (h - corte + 1) * E_K); c.restore(); }
    void y0; return true;
  }
  // sentada en el pretil, de espaldas (el dibujo de David): las manos apoyadas en el muro, en la línea del asiento
  const SENTADA = new Image(); SENTADA.src = 'assets/personajes/cine/itzel-sentada-espaldas.png';
  function itzelSentadaDibujo(c, t) {
    const im = SENTADA, w = im.naturalWidth, h = im.naturalHeight, base = -680, faja = 646, resp = Math.sin(t * 1.8) * .007;
    // de la faja para arriba respira; abajo, manos y falda quedan quietas sobre el muro
    c.save(); c.translate(0, base - h + faja); c.scale(1, 1 + resp); c.drawImage(im, 0, 0, w, faja, -w / 2, -faja, w, faja); c.restore();
    c.drawImage(im, 0, faja - 1, w, h - faja + 1, -w / 2, base - h + faja - 1, w, h - faja + 1);
    return true;
  }
  function itzelEspalda(c, t, { sentada = false, viento = 0 } = {}) {
    if (sentada && SENTADA.complete && SENTADA.naturalWidth) return itzelSentadaDibujo(c, t);
    if (ESPALDAS.complete && ESPALDAS.naturalWidth) return itzelEspaldaDibujo(c, t, sentada, viento);
    const D = IT(), im = hoja(D); if (!im) return false; const Q = D.piezas, resp = Math.sin(t * 1.8) * 4;
    c.save(); c.translate(0, sentada ? 0 : 0);
    if (sentada) { c.beginPath(); c.rect(-700, -1600, 1400, 1600 - 700 + 70); c.clip(); c.translate(0, 0); }
    if (!sentada) {
      for (const lado of [-1, 1]) { c.save(); c.translate(lado * 52, 0); c.scale(lado, 1); pieza(c, im, Q.piernaN, -86, -312, 169, 202); c.restore(); sandalia(c, lado * 52); }
    }
    // la falda, centrada (por detrás se ve igual de amplia) y meciéndose
    c.save(); c.translate(0, -680); c.transform(1, 0, Math.sin(t * 1.2) * .03 + viento * .05, 1, 0, 0); pieza(c, im, Q.falda, -325, 0, sentada ? 700 : 649, 440); c.restore();
    brazoEspalda(c, -1, t, sentada ? -700 : -655); brazoEspalda(c, 1, t, sentada ? -700 : -655);
    c.save(); c.translate(0, resp * .5); pieza(c, im, Q.cuerpo, -139, -1032, 278, 388); c.restore();
    c.save(); c.translate(0, resp); c.translate(0, -930); c.rotate(Math.sin(t * .9) * .02); c.translate(0, 930); melena(c, t, viento);
    // la flor del pelo, recortada de la misma ilustración
    const cab = Q.cabeza, fx = cab[0] + 45, fy = cab[1] + 90; c.drawImage(im, fx, fy, 120, 135, -205, -1190, 132, 148);
    c.restore();
    c.restore();
    return true;
  }

  // ---------- Itzel sentada de lado ----------
  // de la rodilla cuelgan la espinilla y la sandalia, columpiándose; el regazo es la misma falda acostada encima
  const ASIENTO = 790;
  function piernasSentada(c, t) {
    const D = IT(), im = hoja(D); if (!im) return; const Q = D.piezas, CIN = (D.rig || {}).CINTURA || [730, 645];
    for (const [osc, dx, ph] of [[.8, 300, 2.2], [1, 340, 0]]) {
      c.save(); c.translate(CIN[0] + dx, ASIENTO + 30); c.rotate(Math.sin(t * 2.3 + ph) * .16);
      if (osc < 1) c.filter = 'brightness(.8)';
      pieza(c, im, Q.piernaN, -70, -16, 169, 202); pieza(c, im, Q.pieN, -110, 160, 159, 130);
      c.filter = 'none'; c.restore();
    }
  }
  function regazo(c, t) {
    const D = IT(), im = hoja(D); if (!im) return; const Q = D.piezas, CIN = (D.rig || {}).CINTURA || [730, 645];
    c.save(); c.translate(CIN[0] - 30, ASIENTO - 95); c.rotate(-Math.PI / 2 + .12 + Math.sin(t * 1.4) * .01); c.scale(.4, .95); pieza(c, im, Q.falda, -325, -40, 649, 440); c.restore();
  }

  // ---------- la boca de Itzel ----------
  // las bocas de la hoja de caras de David (assets/personajes/cine/24.webp), recortadas con su piel alrededor
  // y emparejadas con la cabeza del títere: seis de 116×90, que van en la pieza «cabeza» en (232, 292).
  // 0 neutra · 1 entreabierta · 2 abierta · 3 sonrisa abierta · 4 «o» · 5 triste
  const BOCAS = new Image(); BOCAS.src = 'assets/personajes/cine/itzel-bocas.png';
  function bocaCuadro(C) { if (!C) return -1; if ((C.o || 0) > .15) return 4; const b = C.boca || 0; if (b < .1) return -1; if ((C.risa || 0) > .5) return 3; return b > .45 ? 2 : 1; }
  // se pinta justo después de la cabeza del títere, con su misma transformación (Q: la pieza cabeza; dib: el drawImage original)
  function bocaItzel(c, k, Q, dib) {
    if (k < 0 || !(BOCAS.complete && BOCAS.naturalWidth)) return; const W = 116, H = 90, e = Q[6] / Q[2];
    dib.call(c, BOCAS, k * W, 0, W, H, Q[4] + 232 * e, Q[5] + 292 * e, W * e, H * e);
  }

  // ---------- los tres ajolotes de David: art nouveau, origami y papel recortado ----------
  // (antes eran el azul, el naranja y el violeta; conservan esos nombres en las cinemáticas)
  const DIR_AJO = 'assets/personajes/cine/ajolotes/', IMG_AJO = {};
  const imgAjo = n => IMG_AJO[n] || (IMG_AJO[n] = Object.assign(new Image(), { src: DIR_AJO + n + '.png' }));
  const ESTILO_AJO = { azul: 'nouveau', naranja: 'origami', violeta: 'papel' };
  for (const e of Object.values(ESTILO_AJO)) { for (let i = 0; i < 6; i++) imgAjo(e + '-cara' + i); imgAjo(e + '-espalda'); imgAjo(e + '-frente'); }
  imgAjo('fresita-frente');
  const cargada = im => im.complete && im.naturalWidth;
  // ---------- las poses nuevas de David (assets/personajes/cine/poses, armadas con tools/cine-poses.py) ----------
  // cada tira trae sus cuadros del mismo tamaño y ya alineados entre sí: al cambiar de cuadro la figura no brinca
  const POSES = {"fresita-huida":{"w":520,"h":205,"n":2},"fresita-sentada":{"w":360,"h":550,"n":2,"asiento":[[0.644,0.443],[0.642,0.554]]},"fresita-frente":{"w":420,"h":317,"n":4},"fresita-nado":{"w":482,"h":269,"n":4},"nouveau-huida":{"w":520,"h":187,"n":2},"nouveau-sentada":{"w":274,"h":635,"n":2,"asiento":[[0.52,0.46],[0.521,0.522]]},"nouveau-frente":{"w":420,"h":302,"n":4},"nouveau-nado":{"w":517,"h":275,"n":4},"origami-huida":{"w":520,"h":186,"n":2},"origami-sentada":{"w":360,"h":537,"n":2,"asiento":[[0.611,0.518],[0.611,0.512]]},"origami-frente":{"w":386,"h":286,"n":4},"origami-nado":{"w":404,"h":204,"n":4},"papel-huida":{"w":520,"h":194,"n":2},"papel-sentada":{"w":360,"h":574,"n":2,"asiento":[[0.7,0.522],[0.7,0.475]]},"papel-frente":{"w":420,"h":317,"n":4},"papel-nado":{"w":484,"h":262,"n":4},"fresita-lado":{"w":453,"h":287,"n":6},"itzel-frente":{"w":294,"h":680,"n":2},"itzel-abrazo":{"w":640,"h":1123,"n":1},"itzel-sentada-lado":{"w":520,"h":1104,"n":1}};
  const DIR_POSES = 'assets/personajes/cine/poses/', IMG_POSE = {};
  const imgPose = n => IMG_POSE[n] || (IMG_POSE[n] = Object.assign(new Image(), { src: DIR_POSES + n + '.png' }));
  for (const n of Object.keys(POSES)) imgPose(n);
  // de lado: la parte de atrás (la cola) se dobla arriba y abajo desde donde nace; im/Q: la tira, k: el cuadro
  function lateral(c, im, Q, k, kk, corte, sh) {
    const w = Q.w, h = Q.h, xs = w * corte, sx = k * w;
    c.scale(kk, kk); c.translate(-w / 2, -h / 2);
    c.save(); c.translate(xs, h * .5); c.transform(1, sh, 0, 1, 0, 0); c.translate(-xs, -h * .5); c.drawImage(im, sx, 0, xs + 3, h, 0, 0, xs + 3, h); c.restore();
    c.drawImage(im, sx + xs, 0, w - xs, h, xs, 0, w - xs, h); return true;
  }
  // la cara: 0 sonrisa · 1 habla · 2 boca abierta · 3 feliz (ojos cerrados) · 4 «o» · 5 triste (si habla, gana la boca)
  function caraAjo(C) { if (C.o > .1) return 4; if (C.boca > .4) return 2; if (C.boca > .08) return 1; if (C.risa > .5) return 3; if ((C.triste || 0) > .3) return 5; return 0; }
  function caraFrente(C) { if (C.o > .1) return 3; if (C.boca > .08) return 1; if (C.risa > .5) return 2; return 0; } // sonrisa · habla · ríe · sorpresa
  // en unidades del actor (el ajolote de antes medía unos 70 de largo)
  function ajolote(c, a) {
    const e = a.color === 'fresita' ? 'fresita' : ESTILO_AJO[a.color]; if (!e) return false;
    const P = a.pose, C = a.cara, t = a.t, nado = P.nado || 1, cola = P.cola ?? 1;
    let v = a.vista === 'espalda' || a.vista === 'frente' || a.vista === 'sentada' ? a.vista : 'lado';
    if (e === 'fresita' && v === 'espalda') return false; // flotando de espaldas: su dibujo de siempre (fresitaEspalda)
    // asustado (con la boca en «o») mientras nada, choca o está atrapado: la pose estirada de huida, o llorando
    if (v === 'lado' && (C.o > .1 || (C.llora || 0) > .3) && (nado >= 1.5 || a._atrapado || a._quieto)) v = 'huida';
    c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    let ok = false;
    if (v === 'huida') {
      const n = e + '-huida', Q = POSES[n], im = imgPose(n);
      if (cargada(im)) { c.translate(-2, -2 + Math.sin(t * 9) * .5); ok = lateral(c, im, Q, (C.llora || 0) > .3 ? 1 : 0, 84 / Q.w, .4, Math.sin(t * 8 * Math.min(nado, 2.5)) * .07 * cola); }
    } else if (v === 'sentada') {
      // sentado en el muro, de espaldas: las patas sobre la orilla (en y = 12) y la cola cuelga por delante
      const n = e + '-sentada', Q = POSES[n], im = imgPose(n);
      if (cargada(im)) {
        const k = (a.mira || 1) > 0 ? 1 : 0, [fy, fx] = Q.asiento[k], kk = 40 / (fy * Q.h), w = Q.w, h = Q.h, ys = h * fy, sh = Math.sin(t * 1.9 + (a.x || 0)) * .1 * cola;
        c.translate(0, 12); c.scale(kk, kk * (1 + Math.sin(t * 2.2) * .008)); c.translate(-fx * w, -ys);
        c.save(); c.translate(fx * w, ys); c.transform(1, 0, sh, 1, 0, 0); c.translate(-fx * w, -ys); c.drawImage(im, k * w, ys - 2, w, h - ys + 2, 0, ys - 2, w, h - ys + 2); c.restore();
        c.drawImage(im, k * w, 0, w, ys, 0, 0, w, ys); ok = true;
      }
    } else if (v === 'frente') {
      // de frente (cuando vienen hacia Itzel): flota, respira y reacciona
      const n = e + '-frente', Q = POSES[n], im = imgPose(n);
      if (cargada(im)) { const kk = 64 / Q.w * (1 + Math.sin(t * 2.4) * .015), k = caraFrente(C); c.translate(0, -6 + Math.sin(t * 2) * 1.2); c.rotate(Math.sin(t * 1.7) * .05); c.scale(kk, kk); c.drawImage(im, k * Q.w, 0, Q.w, Q.h, -Q.w / 2, -Q.h / 2, Q.w, Q.h); ok = true; }
    } else if (nado >= 1.5) {
      // nadando: los cuatro cuadros de nado, uno tras otro
      const n = e + '-nado', Q = POSES[n], im = imgPose(n);
      if (cargada(im)) { const k = Math.floor(t * 4.5 * Math.min(nado, 2.5)) % 4; c.translate(-4, -4 + Math.sin(t * 2.6) * .8); ok = lateral(c, im, Q, k, 76 / Q.w, .4, Math.sin(t * 5 * nado) * .04 * cola); }
    }
    if (!ok && v !== 'espalda') {
      // de lado, quieto o platicando: las seis caras (las de Fresita en su propia tira)
      if (e === 'fresita') { const Q = POSES['fresita-lado'], im = imgPose('fresita-lado'); if (cargada(im)) { c.translate(-4, -4 + Math.sin(t * 2.6) * .8); ok = lateral(c, im, Q, caraAjo(C), 74 / Q.w, .4, Math.sin(t * 5 * nado - .5) * .08 * cola); const v = Math.max(1 - Math.min(1, Math.max(0, C.ojos ?? 1)), (a.cerrado || 0) > 0 ? 1 : 0); if (v > .03 && caraAjo(C) !== 3) parpadosFresita(c, v); } }
      else { const im = imgAjo(e + '-cara' + caraAjo(C)); if (cargada(im)) { const w = im.naturalWidth; c.translate(-6, -4 + Math.sin(t * 2.6) * .8); ok = lateral(c, im, { w, h: im.naturalHeight }, 0, 72 / w, .42, Math.sin(t * 5 * nado - .5) * .1 * cola); } }
    }
    if (!ok && v === 'espalda') {
      const im = imgAjo(e + '-espalda');
      if (cargada(im)) {
        const w = im.naturalWidth, h = im.naturalHeight, kk = 64 / h, ys = h * .5, sh = Math.sin(t * 2.2 * nado) * .14 * cola;
        c.translate(0, 10 + Math.sin(t * 1.8) * .6); c.scale(kk, kk); c.translate(-w / 2, -h / 2);
        c.save(); c.translate(w / 2, ys); c.transform(1, 0, sh, 1, 0, 0); c.translate(-w / 2, -ys); c.drawImage(im, 0, ys - 3, w, h - ys + 3, 0, ys - 3, w, h - ys + 3); c.restore();
        c.drawImage(im, 0, 0, w, ys, 0, 0, w, ys); ok = true;
      }
    }
    c.restore(); return ok;
  }

  // los párpados de Fresita en su tira de lado (los ojos están en el mismo lugar en los seis cuadros); v: 0 abiertos · 1 cerrados
  function parpadosFresita(c, v) {
    for (const [ex, ey, rx, ry] of [[366, 128, 22, 18], [441, 120, 8, 13]]) {
      c.save(); c.beginPath(); c.ellipse(ex, ey, rx + 2, ry + 2, 0, 0, Math.PI * 2); c.clip();
      const y0 = ey - ry - 3, y = v > .96 ? ey + ry + 3 : y0 + (ry * 2 + 6) * v, g = c.createLinearGradient(0, y0, 0, y);
      g.addColorStop(0, '#f7c4c9'); g.addColorStop(1, '#fdd8db'); c.fillStyle = g; c.fillRect(ex - rx - 4, y0 - 2, rx * 2 + 8, y - y0 + 2);
      c.restore();
      c.strokeStyle = 'rgba(110,36,56,.9)'; c.lineCap = 'round'; c.lineWidth = rx > 10 ? 3.2 : 2.2; c.beginPath();
      if (v > .96) { c.moveTo(ex - rx * .95, ey + ry * .1); c.quadraticCurveTo(ex, ey + ry * .75, ex + rx * .95, ey + ry * .1); } // cerrado: la rayita de las pestañas
      else { const w = (rx + 1) * Math.sqrt(Math.max(0, 1 - ((y - ey) / (ry + 2)) ** 2)); c.moveTo(ex - w, y); c.quadraticCurveTo(ex, y + 2.5, ex + w, y); }
      c.stroke();
    }
  }

  // ---------- Itzel: ojos cerrados, de frente, el abrazo y sentada de lado ----------
  // los ojos (itzel-ojos.png): parpadeo y ojos felices, emparejados con la cabeza del títere; dos de 188×202 en (176, 186)
  const OJOS = imgPose('itzel-ojos');
  function ojosCuadro(a) { const C = a.cara; if (!C) return -1; if ((C.risa || 0) > .5) return 1; if ((a.cerrado || 0) > 0 || (C.ojos ?? 1) < .2) return 0; if ((C.preocupa || 0) > .5) return 2; return -1; }
  function ojosItzel(c, k, Q, dib) {
    if (k < 0 || !cargada(OJOS)) return; const W = 188, H = 202, e = Q[6] / Q[2];
    dib.call(c, OJOS, k * W, 0, W, H, Q[4] + 176 * e, Q[5] + 186 * e, W * e, H * e);
  }
  // ---------- los brazos de Itzel: armados con el brazo que cuelga de la hoja de David (25.webp) ----------
  // tres piezas (manga, brazo y antebrazo con la mano, itzel-brazo-piezas.png) que giran en el hombro y el codo,
  // como un brazo de verdad; la manga se mece menos que el brazo. Medidas en px de la hoja: hombro, codo y muñeca
  const PIEZA_BRAZO = imgPose('itzel-brazo-piezas'), BW = 109, BH = 220, B_S = [70, 18], B_E = [43, 124], B_M = [25, 194];
  const NAT_B = Math.atan2(B_E[0] - B_S[0], B_E[1] - B_S[1]), NAT_A = Math.atan2(30 - B_E[0], 152 - B_E[1]); // cómo vienen dibujados (0 = colgando, + = al frente)
  const rota = (v, r) => [v[0] * Math.cos(r) - v[1] * Math.sin(r), v[0] * Math.sin(r) + v[1] * Math.cos(r)];
  // en el espacio del dibujo del títere (pies en 680,1312); lado 'N' el de enfrente, 'F' el de atrás; h: hombro, e: codo (+ dobla al frente)
  // devuelve dónde quedó la mano (en ese mismo espacio)
  function brazoItzel(c, lado, h, e, opc = {}) {
    if (!cargada(PIEZA_BRAZO)) return null;
    e = Math.max(-.1, Math.min(2.3, e));
    const esc = 1.82 * (lado === 'F' ? .95 : 1), H0 = lado === 'F' ? [798, 566] : [572, 458], rB = -(h - NAT_B), rA = -(h + e - NAT_A), rM = -h * .42;
    const E = rota([B_E[0] - B_S[0], B_E[1] - B_S[1]], rB), M = rota([B_M[0] - B_E[0], B_M[1] - B_E[1]], rA), mano = [E[0] + M[0], E[1] + M[1]];
    const pieza = (k, jx, jy, r, px, py) => { c.save(); c.translate(jx, jy); c.rotate(r); c.translate(-px, -py); c.drawImage(PIEZA_BRAZO, k * BW, 0, BW, BH, 0, 0, BW, BH); c.restore(); };
    c.save(); c.translate(H0[0], H0[1]); c.scale(esc, esc); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    if (lado === 'F') c.filter = 'brightness(.8) saturate(.92)';
    pieza(2, E[0], E[1], rA, B_E[0], B_E[1]); // antebrazo y mano, desde el codo
    if (opc.piedra) { c.save(); c.translate(mano[0], mano[1]); c.rotate(rA); c.fillStyle = '#5e5664'; c.beginPath(); c.ellipse(4, 2, 14, 9, -.3, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(255,230,200,.5)'; c.beginPath(); c.ellipse(0, -1, 5, 2.6, -.3, 0, Math.PI * 2); c.fill(); c.restore(); }
    pieza(1, 0, 0, rB, B_S[0], B_S[1]); // brazo, desde el hombro
    if (lado === 'F') pieza(0, 0, 0, rM, B_S[0], B_S[1]); // la manga encima (el de enfrente ya trae la del títere)
    c.filter = 'none'; c.restore();
    return [H0[0] + mano[0] * esc, H0[1] + mano[1] * esc];
  }

  // ---------- Itzel de cuerpo entero en poses dibujadas (itzel-cuerpo.png, de las láminas 58–62 de David) ----------
  // cada cuadro: dónde está en la tira, su eje (ax: el centro del tronco), cuánto mide respecto a ella de pie (alto),
  // dónde trae la mano (para la piedrita) y si mira a la izquierda (izq)
  const CUERPO = {"tiene":{"x":0,"w":232,"h":520,"ax":126.6,"alto":0.998,"y":0,"mano":[153,239]},"tira-atras":{"x":236,"w":343,"h":520,"ax":192.9,"alto":0.979,"y":0,"mano":[26,255]},"tira-suelta":{"x":583,"w":371,"h":520,"ax":187.4,"alto":0.979,"y":0,"mano":[350,192]},"agachada-mano":{"x":958,"w":474,"h":520,"ax":250.2,"alto":0.654,"y":0},"retrocede":{"x":1436,"w":321,"h":520,"ax":121.7,"alto":0.874,"y":0},"brinco":{"x":1761,"w":375,"h":520,"ax":192.7,"alto":0.935,"y":0},"cojito":{"x":2140,"w":361,"h":520,"ax":197.4,"alto":0.909,"y":0},"parada":{"x":2505,"w":295,"h":520,"ax":153.5,"alto":0.911,"y":0,"boca":[163.1,119.7,47.6]},"corre0":{"x":2804,"w":317,"h":520,"ax":192.9,"alto":0.907,"y":0},"corre1":{"x":3125,"w":375,"h":462,"ax":213.0,"alto":0.776,"y":58},"corre2":{"x":3504,"w":323,"h":520,"ax":200.1,"alto":0.905,"y":0},"corre3":{"x":3831,"w":312,"h":520,"ax":199.4,"alto":0.902,"y":0},"vuelta":{"x":4147,"w":373,"h":520,"ax":187.3,"alto":0.966,"y":0},"tambalea":{"x":4524,"w":430,"h":520,"ax":217.3,"alto":0.947,"y":0},"recoge":{"x":4958,"w":427,"h":415,"ax":270.9,"alto":0.647,"y":105}};
  const IMG_CUERPO = imgPose('itzel-cuerpo');
  // la segunda tira (láminas 72–77): grita «¡Fresita, conmigo!», corre de espaldas, salta de la mano de Fresita y flota en la grieta
  Object.assign(CUERPO, {"salto-fresita":{"x":0,"w":744,"h":560,"ax":480.8,"alto":0.947,"y":0,"img":2},"flota":{"x":748,"w":389,"h":560,"ax":203.5,"alto":0.889,"y":0,"img":2},"grita":{"x":1141,"w":405,"h":560,"ax":176.9,"alto":0.914,"y":0,"img":2,"izq":true},"atras0":{"x":1550,"w":321,"h":560,"ax":181.1,"alto":0.887,"y":0,"img":2},"atras1":{"x":1875,"w":331,"h":498,"ax":180.5,"alto":0.787,"y":62,"img":2},"atras2":{"x":2210,"w":324,"h":547,"ax":176.4,"alto":0.865,"y":13,"img":2},"atras3":{"x":2538,"w":342,"h":551,"ax":170.3,"alto":0.871,"y":9,"img":2}});
  const IMG_CUERPO2 = imgPose('itzel-cuerpo2');
  // con los pies (lo más bajo del dibujo) en 0 y el tronco en x = 0; devuelve dónde quedó la mano, si trae
  function itzelCuerpo(c, n, alto, t, sq = 0, bc = -1) {
    const Q = CUERPO[n], IM = Q && Q.img === 2 ? IMG_CUERPO2 : IMG_CUERPO; if (!Q || !cargada(IM)) return false;
    const e = alto * .97 * Q.alto / Q.h, resp = 1 + Math.sin(t * 2.1) * .006;
    c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; c.scale(e * (1 + Math.max(0, sq) * .25), e * resp * (1 - Math.max(0, sq) * .3));
    c.drawImage(IM, Q.x, Q.y, Q.w, Q.h, -Q.ax, -Q.h, Q.w, Q.h);
    // cuando habla: la boca de la hoja de caras, a la medida de este dibujo
    if (Q.boca && bc >= 0 && cargada(BOCAS)) { const [bx, by, bw] = Q.boca; c.drawImage(BOCAS, bc * 116, 0, 116, 90, bx - Q.ax, by - Q.h, bw, bw * 90 / 116); }
    c.restore();
    return Q.mano ? [(Q.mano[0] - Q.ax) * e, -(Q.h - Q.mano[1]) * e] : true;
  }
  const cuerpoIzq = n => !!(CUERPO[n] && CUERPO[n].izq);

  // de cuerpo entero con un dibujo (vista: frente | abrazo | sentada); alto: lo que mide el títere de pie; los pies (o el asiento) en 0
  function itzelPose(c, a, vista, alto, t) {
    const n = vista === 'frente' ? 'itzel-frente' : vista === 'abrazo' ? 'itzel-abrazo' : 'itzel-sentada-lado', Q = POSES[n], im = imgPose(n); if (!cargada(im)) return false;
    const C = a.cara || {}, k = vista === 'frente' ? ((C.o || 0) > .15 ? 0 : 1) : 0, resp = 1 + Math.sin(t * 2.1) * .007;
    c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    if (vista === 'sentada') {
      // del asiento para arriba mide lo que el títere de la cadera a la cabeza; las piernas cuelgan
      const e = alto * .57 / (Q.h * .58); c.scale(e, e * resp); c.drawImage(im, 0, 0, Q.w, Q.h, -Q.w * .42, -Q.h * .58, Q.w, Q.h);
    } else {
      const e = alto * (vista === 'abrazo' ? 1.04 : .98) / Q.h, mece = vista === 'abrazo' ? Math.sin(t * 2.6) * .025 : 0;
      c.rotate(mece); c.scale(e, e * resp); c.drawImage(im, k * Q.w, 0, Q.w, Q.h, -Q.w / 2, -Q.h, Q.w, Q.h);
    }
    c.restore(); return true;
  }

  // ---------- Fresita de espaldas ----------
  // el dibujo de espaldas de David (assets/personajes/cine/fresita-espaldas.png): flota y la cola se mece
  const FRE_ESP = new Image(); FRE_ESP.src = 'assets/personajes/cine/fresita-espaldas.png';
  function fresitaEspaldaDibujo(c, t) {
    const im = FRE_ESP, w = im.naturalWidth, h = im.naturalHeight, k = 1.24, cx = 552, cy = 270, corte = 560;
    c.save(); c.translate(0, -120); c.rotate(Math.sin(t * 1.6) * .03); c.scale(k, k); c.translate(-cx, -cy);
    c.drawImage(im, 0, 0, w, corte, 0, 0, w, corte);
    c.save(); c.translate(cx, corte); c.transform(1, 0, Math.sin(t * 2.2) * .12, 1, 0, 0); c.translate(-cx, -corte); c.drawImage(im, 0, corte - 1, w, h - corte + 1, 0, corte - 1, w, h - corte + 1); c.restore();
    c.restore(); return true;
  }
  function fresitaEspalda(c, t, { sentada = false } = {}) {
    if (FRE_ESP.complete && FRE_ESP.naturalWidth) return fresitaEspaldaDibujo(c, t);
    const D = FR(), im = hoja(D); if (!im) return false; const Q = D.piezas, sw = Math.sin(t * 2.4);
    // la cola: cuelga y se mece (sentada, cae por el frente del muro)
    c.save(); c.translate(0, 150); c.rotate(Math.PI / 2 + .25 + sw * .12); c.scale(sentada ? 1.05 : .9, .9); pieza(c, im, Q.cola, -560, -300, 571, 513); c.restore();
    // patitas
    for (const lado of [-1, 1]) { c.fillStyle = '#f2b8c4'; c.beginPath(); c.ellipse(lado * 175, 60 + Math.sin(t * 3 + lado) * 6, 46, 30, lado * .5, 0, Math.PI * 2); c.fill(); c.beginPath(); c.ellipse(lado * 150, 250, 44, 28, lado * .3, 0, Math.PI * 2); c.fill(); }
    // el cuerpo
    let g = c.createRadialGradient(-40, 40, 20, 0, 110, 230); g.addColorStop(0, '#fff0f0'); g.addColorStop(.6, '#f6c6cf'); g.addColorStop(1, '#e89aac');
    c.fillStyle = g; c.beginPath(); c.ellipse(0, 120, 175, 215, 0, 0, Math.PI * 2); c.fill();
    // las branquias: las de la ilustración, tres por lado, abiertas como abanico
    const pares = [['g1', -2.5, -170, -150], ['g2', -2.9, -205, -60], ['g3', 2.9, -205, 30]];
    for (const lado of [-1, 1]) for (const [n, a, gx, gy] of pares) {
      const q = Q[n]; c.save(); c.scale(lado, 1); c.translate(gx + 30, gy - 90); c.rotate(-.35 + Math.sin(t * 2.1 + gy) * .07 + (n === 'g3' ? .5 : 0)); pieza(c, im, q, -q[6] * .85, -q[7] * .55, q[6] * .9, q[7] * .9); c.restore();
      void a;
    }
    // la cabeza por detrás: redonda, con sus manchitas
    g = c.createRadialGradient(-60, -200, 30, 0, -120, 250); g.addColorStop(0, '#fff3f2'); g.addColorStop(.55, '#f8d0d8'); g.addColorStop(1, '#eaa2b2');
    c.fillStyle = g; c.beginPath(); c.ellipse(0, -120, 235, 190, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(236,128,154,.35)'; for (let i = 0; i < 26; i++) { const a = i * 2.39, r = 40 + (i * 37 % 150); c.beginPath(); c.arc(Math.cos(a) * r, -150 + Math.sin(a) * r * .7, 9 + (i % 4) * 3, 0, Math.PI * 2); c.fill(); }
    c.strokeStyle = 'rgba(190,90,110,.5)'; c.lineWidth = 6; c.beginPath(); c.ellipse(0, -120, 235, 190, 0, 0, Math.PI * 2); c.stroke();
    return true;
  }
  return { itzelEspalda, piernasSentada, regazo, bocaItzel, bocaCuadro, ojosItzel, ojosCuadro, itzelPose, itzelCuerpo, cuerpoIzq, brazoItzel, fresitaEspalda, ajolote };
})();
