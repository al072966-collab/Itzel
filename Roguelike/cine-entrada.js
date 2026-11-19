'use strict';
// =====================================================================
//  CINEMÁTICA 1 · ENTRADA: «La tarde que se rompió el cielo»
//  El malecón de Campeche al atardecer (mira al poniente: el sol se mete
//  en el mar). Del otro lado de la bahía: el baluarte con su garita, la
//  muralla, las casas de colores y la catedral. Guion en GUION_CINEMATICAS.md.
//
//  Escenario en capas con profundidad d (0 = cielo, 1 = el malecón, >1 =
//  primer término). Cada capa se pinta una vez a pincel en un lienzo
//  aparte, y otra vez desenfocada para la profundidad de campo.
//  Coordenadas: las del plano general (cámara en 0,0 con zoom 1); el
//  cuadro seguro mide 640×360 con el origen al centro.
// =====================================================================
(() => {
  const HORIZ = 40, PRETIL = 127.5, PISO = 156, SOL_X = -170, RIFT_X = -4;
  const dMar = y => .04 + .91 * Math.pow(clamp((y - HORIZ) / 100, 0, 1), 1.7);
  const yMar = d => HORIZ + 100 * Math.pow(clamp((d - .04) / .91, 0, 1), 1 / 1.7);
  const COL = { azul: '#ffcf7a', naranja: '#ff4f8f', violeta: '#ff9a8a', fresita: '#ff8cc6' }; // el dorado del art nouveau, el rosa del origami y el coral del papel
  const ESTILOS_VISION = ['pixel', 'sumie', 'neon', 'acuarela'];
  const LUZ_VISION = { pixel: '#7ad0ff', sumie: '#f0e6d2', neon: '#ff4fd8', acuarela: '#9ad8c8' };
  const ESTILOS_GRIETA = ['pixel', 'sumie', 'neon', 'acuarela', 'oleo', 'vitral', 'paper', 'deco'];

  // ---------- utilidades de pintura ----------
  function rampa(stops, y) {
    if (y <= stops[0][0]) return stops[0][1];
    for (let i = 1; i < stops.length; i++) if (y <= stops[i][0]) { const [y0, c0] = stops[i - 1], [y1, c1] = stops[i]; return mix(c0, c1, (y - y0) / (y1 - y0)); }
    return stops[stops.length - 1][1];
  }
  // pincelada horizontal ahusada, con orilla irregular
  function pincel(x, r, x0, y0, len, w, col, a, curv = 0) {
    const n = 9; x.beginPath();
    for (let i = 0; i <= n; i++) { const u = i / n, hw = w * .5 * Math.pow(Math.sin(Math.PI * clamp(u * 1.08 - .04, 0, 1)), .55) * (.8 + r() * .4); x.lineTo(x0 + len * u, y0 + curv * Math.sin(Math.PI * u) - hw); }
    for (let i = n; i >= 0; i--) { const u = i / n, hw = w * .5 * Math.pow(Math.sin(Math.PI * clamp(u * 1.08 - .04, 0, 1)), .55) * (.8 + r() * .4); x.lineTo(x0 + len * u, y0 + curv * Math.sin(Math.PI * u) + hw); }
    x.closePath(); x.globalAlpha = a; x.fillStyle = col; x.fill(); x.globalAlpha = 1;
  }
  function capaPintada(x0, y0, w, h, R, pinta, blur = 6) {
    const img = mkCanvas(w * R, h * R), x = img.getContext('2d');
    x.scale(R, R); x.translate(-x0, -y0); pinta(x);
    const rb = R * .5, imgB = mkCanvas(w * rb, h * rb), y = imgB.getContext('2d');
    y.filter = `blur(${(blur * rb).toFixed(1)}px)`; y.drawImage(img, 0, 0, imgB.width, imgB.height); y.filter = 'none';
    return { img, imgB, x: x0, y: y0, w, h };
  }

  // ---------- cielo: bandas de pincel del azul polvo del Golfo al ámbar ----------
  const CIELO = [[-700, '#1d3654'], [-480, '#2c5574'], [-300, '#527e98'], [-170, '#93a7a4'], [-95, '#d2a886'], [-35, '#eca468'], [8, '#f5b456'], [40, '#fbd27e'], [70, '#fbd27e']];
  function pintaCielo(x) {
    const r = rng(11);
    for (let y = -700; y < 70; y += 5) { x.fillStyle = rampa(CIELO, y + 2.5); x.fillRect(-600, y, 1200, 5.5); }
    for (let i = 0; i < 3400; i++) {
      const y = -700 + Math.pow(r(), .8) * 770, xx = -600 + r() * 1200, near = clamp(1 - Math.hypot((xx - SOL_X) * .6, y - 25) / 210, 0, 1);
      let c = rampa(CIELO, y + (r() - .5) * 26); c = mix(c, '#ffe6a6', near * near * .65); c = jitterColor(c, .03, r());
      const len = 30 + r() * (y > -120 ? 160 : 90), w = 2.5 + r() * (y > -120 ? 5 : 8);
      pincel(x, r, xx - len / 2, y, len, w, c, .32 + r() * .4, (r() - .5) * 3);
    }
    // cirros altos, como plumas
    for (let i = 0; i < 70; i++) { const y = -640 + r() * 330, xx = -560 + r() * 1100; pincel(x, r, xx, y, 60 + r() * 140, 1.2 + r() * 2, mix('#e9b4a2', '#c6c3d2', r()), .16 + r() * .2, -4 - r() * 8); }
  }
  // nubes largas de atardecer: panza encendida, lomo violeta
  const NUBES = [[-470, -560, 210, 12], [60, -520, 280, 10], [-260, -430, 190, 9], [240, -380, 240, 14], [-560, -300, 260, 16], [-60, -270, 230, 12], [330, -230, 300, 18],
    [-420, -170, 300, 14], [40, -140, 260, 11], [-210, -95, 200, 8], [260, -80, 340, 12], [-520, -60, 240, 7], [-120, -30, 290, 6], [140, -12, 220, 5], [-330, 6, 180, 4], [-40, 18, 150, 3]];
  function pintaNubes(x) {
    const r = rng(23);
    for (const [cx0, cy0, len, th0] of NUBES) {
      const th = th0 * 1.7 + 3, mid = cx0 + len / 2, near = clamp(1 - Math.abs(mid - SOL_X) / 520, 0, 1), alto = clamp((-cy0 - 60) / 500, 0, 1);
      const lomo = mix(mix('#94687e', '#6c7596', alto), '#c08078', near * .35), panza = mix(mix('#ef8a62', '#e2a2a0', alto), '#ffc477', near * near), filo = mix('#ffd49a', '#fff0c8', near);
      // masa de borregos: elipses que se enciman, más gruesas al centro
      const n = Math.max(4, Math.round(len / 8)), P = [];
      for (let i = 0; i < n; i++) { const u = i / (n - 1), prof = Math.pow(Math.sin(Math.PI * (.04 + u * .92)), .7), ry = Math.max(1.4, th * (.3 + .7 * prof) * (.55 + r() * .6)), rx = ry * (1.5 + r() * 1.6); P.push([cx0 + u * len + (r() - .5) * 8, cy0 - ry * .5 + (r() - .5) * th * .2, rx, ry]); }
      const masa = (dy = 0, kx = 1, ky = 1) => { x.beginPath(); for (const [px, py, rx, ry] of P) { x.moveTo(px + rx * kx, py + dy); x.ellipse(px, py + dy, rx * kx, ry * ky, 0, 0, TAU); } };
      x.save(); masa(); x.globalAlpha = .92; x.fillStyle = lomo; x.fill(); x.globalAlpha = 1; x.clip();
      // la luz viene de abajo y de la izquierda (el sol ya está bajo)
      for (const [px, py, rx, ry] of P) { x.beginPath(); x.ellipse(px - rx * .12, py + ry * .62, rx * .92, ry * .72, 0, 0, TAU); x.fillStyle = panza; x.globalAlpha = .9; x.fill(); }
      for (const [px, py, rx, ry] of P) { x.beginPath(); x.ellipse(px - rx * .1, py + ry * 1.0, rx * .78, ry * .3, 0, 0, TAU); x.fillStyle = filo; x.globalAlpha = .25 + near * .6; x.fill(); }
      x.globalAlpha = 1;
      for (let i = 0; i < len / 3; i++) { const [px, py, rx, ry] = P[(r() * P.length) | 0], y = py + (r() - .5) * ry * 1.6, l = rx * (.4 + r()); pincel(x, r, px - l / 2 + (r() - .5) * rx, y, l, .8 + r() * ry * .35, mix(lomo, panza, clamp((y - py) / ry * .5 + .5, 0, 1)), .35, (r() - .5) * 1.5); }
      x.restore();
      // colas deshilachadas
      for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const e = s < 0 ? P[0] : P[P.length - 1], l = 20 + r() * 50; pincel(x, r, s < 0 ? e[0] - l - e[2] * .5 : e[0] + e[2] * .5, e[1] + e[3] * (.2 + r() * .5), l, .6 + r() * 1.4, k ? panza : lomo, .35, (r() - .5) * 2); }
    }
  }
  // mar: bandas del reflejo dorado del horizonte al turquesa hondo de la orilla
  const MAR = [[38, '#f6c880'], [43, '#e8aa76'], [50, '#b39886'], [62, '#6d9a98'], [80, '#438a92'], [105, '#2f7482'], [140, '#225a6a']];
  function pintaMar(x) {
    const r = rng(37);
    for (let y = 38; y < 142; y += 1) { x.fillStyle = rampa(MAR, y + .5); x.fillRect(-760, y, 1960, 1.2); }
    for (let i = 0; i < 5200; i++) {
      const p = Math.pow(r(), 1.35), y = 40 + p * 100, xx = -760 + r() * 1960, len = 2 + p * 26 * (.5 + r()), w = .35 + p * 2.2;
      const sol = clamp(1 - Math.abs(xx - SOL_X) / (120 + p * 300), 0, 1);
      if (r() < .55) pincel(x, r, xx, y, len, w, mix(mix('#f6d29a', rampa(MAR, y), p * .7), '#fff0c0', sol * .5), (.18 + (1 - p) * .35) * (.6 + sol), (r() - .5) * .4);
      else pincel(x, r, xx, y, len * 1.2, w * 1.2, mix('#1c4e5c', rampa(MAR, y), .3), .22 + p * .25, (r() - .5) * .4);
    }
  }
  // tierra lejana a la derecha: lomeríos y el fuerte de San Miguel
  function pintaLejos(x) {
    const r = rng(41), base = HORIZ + 2;
    const alt = xx => smooth(110, 300, xx) * (5 + fbm1(xx * .008, 4, 3) * 16 + Math.exp(-Math.pow((xx - 610) / 70, 2)) * 9);
    x.beginPath(); x.moveTo(60, base); for (let xx = 60; xx <= 1160; xx += 3) x.lineTo(xx, base - alt(xx)); x.lineTo(1160, base + 2); x.lineTo(60, base + 2); x.closePath();
    x.fillStyle = '#c99c8e'; x.fill();
    x.save(); x.clip(); for (let i = 0; i < 500; i++) { const xx = 60 + r() * 1100, y = base - r() * 30; pincel(x, r, xx, y, 8 + r() * 26, 1 + r() * 2, r() < .5 ? '#ddb09a' : '#ad8484', .35, 0); } x.restore();
    // fuerte: muros bajos con baluartes en las esquinas
    const fx = 610, fy = base - alt(610) + 1;
    x.fillStyle = '#b8847e'; x.beginPath(); x.moveTo(fx - 22, fy); x.lineTo(fx - 19, fy - 7); x.lineTo(fx + 19, fy - 7); x.lineTo(fx + 22, fy); x.closePath(); x.fill();
    for (const s of [-1, 1]) { x.beginPath(); x.moveTo(fx + s * 22, fy); x.lineTo(fx + s * 25, fy - 6); x.lineTo(fx + s * 17, fy - 9); x.lineTo(fx + s * 15, fy); x.fill(); }
    x.fillStyle = '#e4b8a0'; x.fillRect(fx - 19, fy - 7.6, 22, 1); for (let i = 0; i < 9; i++) x.fillRect(fx - 18 + i * 4.2, fy - 9, 1.6, 1.4);
    for (let i = 0; i < 14; i++) { const xx = 140 + r() * 900; x.beginPath(); CAMP.palma(x, xx, base - alt(xx) + 1, 5 + r() * 4, (r() - .5) * .4, i); x.fillStyle = '#9a7a78'; x.fill(); }
  }
  // ciudad del otro lado de la bahía: muelle, palmeras, casas de colores y la catedral
  function fachada(x, r, x0, base, w, h, col, luz = 1) {
    const c = mix(mix(col, '#f2c49a', .12), '#ffc890', .1 * luz);
    x.fillStyle = c; x.fillRect(x0, base - h, w, h);
    x.fillStyle = shade(c, -.2); x.fillRect(x0 + w * .82, base - h, w * .18, h); // lado en sombra (el sol viene de la izquierda)
    x.fillStyle = shade(c, .25); x.fillRect(x0, base - h, w, 1.1); x.fillRect(x0, base - h - 1.4, 1.2, 1.4); x.fillRect(x0 + w - 1.2, base - h - 1.4, 1.2, 1.4);
    x.fillStyle = 'rgba(80,40,40,.18)'; x.fillRect(x0, base - h + 1.1, w, .7);
    const n = Math.max(1, Math.floor(w / 6)), gap = w / n;
    for (let i = 0; i < n; i++) {
      const wx = x0 + gap * (i + .5), lit = r() < .14;
      for (const yy of h > 16 ? [base - h + 4, base - h + 11] : [base - h + 4]) {
        x.fillStyle = lit ? '#ffd27a' : '#5a3a40'; x.beginPath(); x.moveTo(wx - 1.3, yy + 4.6); x.lineTo(wx - 1.3, yy + 1.3); x.arc(wx, yy + 1.3, 1.3, Math.PI, 0); x.lineTo(wx + 1.3, yy + 4.6); x.fill();
        x.fillStyle = shade(c, .3); x.fillRect(wx - 1.7, yy + 4.6, 3.4, .6);
      }
    }
    if (r() < .6) { const dx = x0 + w * (.3 + r() * .4); x.fillStyle = '#4a2a30'; x.beginPath(); x.moveTo(dx - 2, base); x.lineTo(dx - 2, base - 5); x.arc(dx, base - 5, 2, Math.PI, 0); x.lineTo(dx + 2, base); x.fill(); }
  }
  function torre(x, cx0, base, alto, w) {
    const piedra = '#e8d2b0', sombra = '#a99098', claro = '#fbe8c8';
    const capa = (y0, y1, ww) => { x.fillStyle = piedra; x.fillRect(cx0 - ww / 2, y1, ww, y0 - y1); x.fillStyle = sombra; x.fillRect(cx0 + ww * .22, y1, ww * .28, y0 - y1); x.fillStyle = claro; x.fillRect(cx0 - ww / 2 - .6, y1, ww + 1.2, 1); };
    capa(base, base - alto * .55, w);
    capa(base - alto * .55, base - alto * .8, w * .82);
    x.fillStyle = '#5a3a44'; for (const s of [-1, 1]) { const ax = cx0 + s * w * .2; x.beginPath(); x.moveTo(ax - 1.3, base - alto * .58); x.lineTo(ax - 1.3, base - alto * .74); x.arc(ax, base - alto * .74, 1.3, Math.PI, 0); x.lineTo(ax + 1.3, base - alto * .58); x.fill(); }
    x.fillStyle = piedra; x.beginPath(); x.ellipse(cx0, base - alto * .8, w * .36, w * .34, 0, Math.PI, 0); x.fill();
    x.fillStyle = sombra; x.beginPath(); x.ellipse(cx0, base - alto * .8, w * .36, w * .34, 0, Math.PI * 1.55, 0); x.lineTo(cx0, base - alto * .8); x.fill();
    x.fillStyle = piedra; x.fillRect(cx0 - 1, base - alto * .93, 2, alto * .1);
    x.strokeStyle = '#7a6068'; x.lineWidth = .6; x.beginPath(); x.moveTo(cx0, base - alto * .93); x.lineTo(cx0, base - alto); x.moveTo(cx0 - 1.4, base - alto * .975); x.lineTo(cx0 + 1.4, base - alto * .975); x.stroke();
  }
  function pintaCiudad(x) {
    const r = rng(53), base = 76;
    x.translate(150, base); x.scale(1.5, 1.5); x.translate(-150, -base); // la ciudad se ve grande del otro lado de la bahía
    // segunda fila, más lejana y desvaída
    for (let xx = 120; xx < 1220;) { const w = 14 + r() * 18, h = 16 + r() * 16; x.fillStyle = mix(CAMP.FACHADAS[(r() * 8) | 0], '#e8b090', .55); x.fillRect(xx, base - h - 6, w, h + 6); xx += w; }
    for (const [cx0, alto] of [[530, 40], [790, 34], [1010, 38]]) { x.fillStyle = '#e0bca4'; x.fillRect(cx0 - 6, base - alto, 12, alto); x.beginPath(); x.ellipse(cx0, base - alto, 6, 6, 0, Math.PI, 0); x.fill(); x.fillRect(cx0 - .8, base - alto - 10, 1.6, 5); }
    // casas del frente
    for (let xx = 150; xx < 1220;) {
      if (xx > 196 && xx < 288) { xx = 288; continue; }
      const w = 12 + r() * 12, h = 11 + r() * 12; fachada(x, r, xx, base, w, h, CAMP.FACHADAS[(r() * 8) | 0]); xx += w + (r() < .2 ? 2 : 0);
    }
    // catedral (Nuestra Señora de la Purísima Concepción): dos torres y fachada con frontón
    const cx0 = 242;
    x.fillStyle = '#e8d2b0'; x.fillRect(cx0 - 22, base - 34, 44, 34);
    x.fillStyle = '#a99098'; x.fillRect(cx0 + 8, base - 34, 14, 34);
    x.fillStyle = '#e8d2b0'; x.beginPath(); x.moveTo(cx0 - 22, base - 34); x.lineTo(cx0, base - 44); x.lineTo(cx0 + 22, base - 34); x.fill();
    x.fillStyle = '#fbe8c8'; x.fillRect(cx0 - 23, base - 34.6, 46, 1); x.fillRect(cx0 - 23, base - 20, 46, .9);
    x.fillStyle = '#5a3a44'; x.beginPath(); x.moveTo(cx0 - 4.5, base); x.lineTo(cx0 - 4.5, base - 10); x.arc(cx0, base - 10, 4.5, Math.PI, 0); x.lineTo(cx0 + 4.5, base); x.fill();
    x.beginPath(); x.arc(cx0, base - 27, 2.6, 0, TAU); x.fill();
    torre(x, cx0 - 27, base, 62, 12); torre(x, cx0 + 27, base, 62, 12);
    // muelle de piedra y palmeras
    x.fillStyle = '#c4946c'; x.fillRect(60, base, 1200, 7); x.fillStyle = '#e2b68a'; x.fillRect(60, base, 1200, 1.2);
    x.fillStyle = 'rgba(90,50,40,.25)'; for (let xx = 60; xx < 1260; xx += 7 + r() * 4) x.fillRect(xx, base + 1.5, .6, 5.5);
    for (let i = 0; i < 26; i++) { const xx = 160 + i * 42 + r() * 20; if (Math.abs(xx - cx0) < 40) continue; x.beginPath(); CAMP.palma(x, xx, base + 1, 16 + r() * 9, (r() - .5) * .5, i + 3); x.fillStyle = '#4f5a3c'; x.fill(); }
    // bruma tibia a ras del agua
    for (let i = 0; i < 160; i++) pincel(x, r, 60 + r() * 1200, base + 2 - r() * 10, 20 + r() * 60, 2 + r() * 4, '#f4c49a', .12, 0);
    x.fillStyle = '#f7d8b0'; x.globalAlpha = .5; x.fillRect(60, base + 6, 1200, 1); x.globalAlpha = 1;
  }
  // baluarte con garita y muralla con la Puerta de Mar
  function pintaBaluarte(x) {
    x.translate(-60, 98); x.scale(1.35, 1.35); x.translate(60, -98);
    const r = rng(61), base = 98, top = 74, piedra = '#d9aa78', medio = '#bf8c66', sombra = '#8a6870', junta = 'rgba(110,70,60,.4)';
    // muralla hacia la derecha
    x.fillStyle = medio; x.fillRect(80, 81, 420, base - 81);
    x.fillStyle = piedra; for (let xx = 80; xx < 500; xx += 6) x.fillRect(xx, 77.5, 3.6, 3.6);
    x.fillStyle = '#efc79a'; x.fillRect(80, 81, 420, 1);
    // puerta de mar
    const px = 250; x.fillStyle = piedra; x.fillRect(px - 14, 70, 28, base - 70); x.beginPath(); x.moveTo(px - 15, 70); x.lineTo(px, 63); x.lineTo(px + 15, 70); x.fill();
    x.fillStyle = sombra; x.fillRect(px + 7, 70, 7, base - 70);
    x.fillStyle = '#3e2a30'; x.beginPath(); x.moveTo(px - 6, base); x.lineTo(px - 6, 84); x.arc(px, 84, 6, Math.PI, 0); x.lineTo(px + 6, base); x.fill();
    x.fillStyle = '#efc79a'; x.fillRect(px - 15, 70, 30, 1);
    // baluarte: talud, cordón, parapeto con almenas
    x.beginPath(); x.moveTo(-64, 80); x.lineTo(92, 80); x.lineTo(95, base); x.lineTo(-68, base); x.closePath(); x.fillStyle = piedra; x.fill();
    x.fillStyle = sombra; x.globalAlpha = .55; x.beginPath(); x.moveTo(14, 80); x.lineTo(92, 80); x.lineTo(95, base); x.lineTo(14, base); x.fill(); x.globalAlpha = 1;
    x.fillStyle = 'rgba(90,50,40,.18)'; x.beginPath(); x.moveTo(-68, base); x.lineTo(-66, 90); x.lineTo(94, 90); x.lineTo(95, base); x.fill();
    x.strokeStyle = junta; x.lineWidth = .35;
    for (let y = 82.5, k = 0; y < base; y += 2.6, k++) { x.beginPath(); x.moveTo(-66, y); x.lineTo(94, y); x.stroke(); for (let xx = -66 + (k % 2) * 2.5; xx < 94; xx += 5 + r() * 1.5) { x.beginPath(); x.moveTo(xx, y); x.lineTo(xx, y + 2.6); x.stroke(); } }
    x.fillStyle = '#efc79a'; x.fillRect(-66, 79.2, 160, 1.6); // cordón
    x.fillStyle = piedra; x.fillRect(-62, top, 152, 5.4);
    x.fillStyle = sombra; x.globalAlpha = .55; x.fillRect(14, top, 76, 5.4); x.globalAlpha = 1;
    for (let xx = -60; xx < 88; xx += 7) { if (Math.abs(xx - 22) < 4) continue; x.fillStyle = xx > 14 ? '#a98070' : piedra; x.fillRect(xx, top - 3.4, 4.2, 3.6); x.fillStyle = '#f3cfa0'; x.fillRect(xx, top - 3.4, 4.2, .7); }
    x.fillStyle = '#2e2228'; x.fillRect(20.5, top - 1, 4, 3); x.fillRect(23, top, 5, 1.4); // cañón en su tronera
    // manchas de humedad y liquen
    for (let i = 0; i < 70; i++) { x.fillStyle = r() < .5 ? 'rgba(90,70,60,.12)' : 'rgba(120,130,80,.12)'; x.beginPath(); x.ellipse(-60 + r() * 150, 84 + r() * 13, 1 + r() * 4, .6 + r() * 2, 0, 0, TAU); x.fill(); }
    // garita en la punta: ménsula, cilindro, cúpula y remate
    const gx = -62;
    x.fillStyle = medio; x.beginPath(); x.moveTo(gx - 4, top - 2); x.lineTo(gx + 4, top - 2); x.lineTo(gx + 1, top + 6); x.lineTo(gx - 1, top + 6); x.fill();
    x.fillStyle = piedra; x.fillRect(gx - 4.5, top - 13, 9, 11); x.fillStyle = sombra; x.globalAlpha = .5; x.fillRect(gx + 1.5, top - 13, 3, 11); x.globalAlpha = 1;
    x.fillStyle = '#3e2a30'; x.fillRect(gx - 1.6, top - 10, 1, 4); x.fillRect(gx + .8, top - 10, 1, 4);
    x.fillStyle = '#f3cfa0'; x.fillRect(gx - 5.2, top - 13.6, 10.4, 1);
    x.fillStyle = piedra; x.beginPath(); x.ellipse(gx, top - 13.6, 5, 4.6, 0, Math.PI, 0); x.fill();
    x.fillStyle = sombra; x.globalAlpha = .5; x.beginPath(); x.ellipse(gx, top - 13.6, 5, 4.6, 0, Math.PI * 1.6, 0); x.lineTo(gx, top - 13.6); x.fill(); x.globalAlpha = 1;
    x.fillStyle = piedra; x.fillRect(gx - .7, top - 21, 1.4, 3.4); x.beginPath(); x.arc(gx, top - 21, 1.1, 0, TAU); x.fill();
    // palmeras detrás de la muralla
    for (const [xx, h, l] of [[120, 24, -.2], [170, 30, .15], [205, 22, -.1], [330, 28, .2], [420, 25, -.15]]) { x.beginPath(); CAMP.palma(x, xx, 81, h, l, xx); x.fillStyle = '#3e4a32'; x.fill(); }
    // espuma al pie
    for (let i = 0; i < 90; i++) pincel(x, r, -72 + r() * 570, base - .2 + r() * 1.4, 3 + r() * 10, .6 + r() * .8, '#fff2dc', .5, 0);
  }
  // primer término: tronco de palmera y arbusto (sprites)
  function spritePalma() {
    const w = 200, h = 340;
    return capaPintada(-100, -330, w, h, 2.2, x => {
      const r = rng(71);
      x.beginPath(); x.moveTo(-9, 10); x.quadraticCurveTo(-2, -150, 12, -300); x.lineTo(20, -300); x.quadraticCurveTo(8, -150, 9, 10); x.closePath(); x.fillStyle = '#3a2a26'; x.fill();
      for (let y = 0; y > -300; y -= 7) { const xx = -4 + (-y / 300) * 18; x.fillStyle = 'rgba(255,190,120,.25)'; x.fillRect(xx - 8, y, 6, 1.6); x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(xx - 8, y + 1.6, 18, 1); }
      for (let i = 0; i < 11; i++) { const a = -Math.PI / 2 + (i / 10 - .5) * 3.4, l = 70 + r() * 40; x.beginPath(); x.moveTo(16, -300); const ex = 16 + Math.cos(a) * l, ey = -300 + Math.sin(a) * l * .5 + l * .45; x.quadraticCurveTo(16 + Math.cos(a) * l * .5, -300 + Math.sin(a) * l * .5 - 12, ex, ey); x.lineWidth = 2.2; x.strokeStyle = '#26301e'; x.stroke();
        for (let k = 1; k < 12; k++) { const u = k / 12, px = 16 + (ex - 16) * u, py = -300 + (ey + 300) * u - Math.sin(u * Math.PI) * 10; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a + 1.3) * 12 * (1 - u * .5), py + 10 * (1 - u * .4)); x.moveTo(px, py); x.lineTo(px + Math.cos(a - 1.3) * 12 * (1 - u * .5), py + 9 * (1 - u * .4)); x.lineWidth = 2.4; x.stroke(); } }
    }, 9);
  }
  function spriteBugambilia() {
    return capaPintada(-90, -90, 180, 100, 2.4, x => {
      const r = rng(83);
      for (let i = 0; i < 60; i++) { x.fillStyle = mix('#1e3a24', '#2f5a30', r()); x.beginPath(); x.ellipse(-70 + r() * 140, -10 - r() * 60 * (1 - Math.abs(r() - .5)), 5 + r() * 7, 3 + r() * 4, r() * 3, 0, TAU); x.fill(); }
      for (let i = 0; i < 160; i++) { const xx = -72 + r() * 144, yy = -12 - r() * 70 * (1 - Math.abs(xx) / 90); x.fillStyle = mix('#3f8a3a', '#86c052', r()); for (let k = 0; k < 3; k++) { const a = k / 3 * TAU + r(); x.beginPath(); x.ellipse(xx + Math.cos(a) * 1.8, yy + Math.sin(a) * 1.8, 2.2, 1.4, a, 0, TAU); x.fill(); } x.fillStyle = '#fff1b0'; x.fillRect(xx - .4, yy - .4, .8, .8); }
    }, 8);
  }
  function grano() {
    const c = mkCanvas(256, 256), x = c.getContext('2d'), im = x.createImageData(256, 256), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const v = 128 + (hash1(i, 9) - .5) * 90 + (noise2((i / 4 % 256) * .05, Math.floor(i / 1024) * .05, 3) - .5) * 60; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    x.putImageData(im, 0, 0); return c;
  }

  // =====================================================================
  //  LA ESCENA
  // =====================================================================
  function crearEntrada(opc = {}) {
    // las tomas de Campeche (cine-campeche.js) entran a los 6 s, entre la grúa y Itzel: el guion de abajo sigue
    // contando sin ellas (tiempo interno) y solo su lista de sonidos y subtítulos se recorre
    const PRE0 = 6, PRE = opc.final ? 0 : CAMPECHE_TOMAS.DUR;
    // la toma ancha de Itzel retrocediendo ante la Ruptura (la 7, a los 31 s) dura ESTIRA s más: sus primeros 1.65 s se estiran
    const ESTIRA = opc.final ? 0 : 2.2, E0 = 31, E1 = 1.65;
    const estira = T => !ESTIRA || T < E0 ? T : T < E0 + E1 + ESTIRA ? E0 + (T - E0) * E1 / (E1 + ESTIRA) : T - ESTIRA;
    const encoge = T => !ESTIRA || T < E0 ? T : T < E0 + E1 ? E0 + (T - E0) * (E1 + ESTIRA) / E1 : T + ESTIRA;
    const interno = T => estira(T < PRE0 ? T : Math.max(PRE0, T - PRE)), externo = T => { const R = encoge(T); return R < PRE0 ? R : R + PRE; };
    const DUR = opc.final ? 32 : 61 + PRE + ESTIRA;
    const cues = [[0, 'swell', 'inicio, marimba suave'], [0, 'ambiente', 'olas y gaviotas'], [6.7, 'efecto', 'la piedrita cae en el 3'], [7.36, 'golpe', 'brinco'], [7.78, 'golpe', 'brinco'], [8.32, 'golpe', 'brinco con los dos pies'], [9.16, 'golpe', 'brinco'], [9.66, 'acento', 'llega al cielo'], [10.35, 'golpe', 'da la vuelta'], [11.23, 'efecto', 'se tambalea'],
      [12, 'silencio', 'contraluz'], [18.0, 'silencio', 'el mundo se detiene (las olas se frenan)'], [19.3, 'efecto', 'zumbido grave'], [19.5, 'golpe', 'se abre la rendija del horizonte'], [20.3, 'golpe', 'destello'], [20.6, 'silencio', 'corte'],
      [22.6, 'nota', 'luz azul'], [23.0, 'nota', 'luz naranja'], [23.4, 'nota', 'luz violeta'], [23.8, 'nota', 'luz rosa'],
      [25.6, 'golpe', 'se rasga el cielo'], [26.1, 'swell', 'la grieta se abre'], [26.6, 'efecto', 'salen huyendo los ajolotes'], [27.5, 'swell', 'sale la Ruptura'], [28.3, 'golpe', 'destello del núcleo'],
      [32.1, 'golpe', 'tentáculos'], [32.8, 'golpe', 'encierra a Fresita en un cristal'], [33.25, 'golpe', 'azul golpea el cristal'], [33.55, 'golpe', 'naranja golpea el cristal'], [33.85, 'golpe', 'violeta golpea el cristal'], [33.9, 'acento', 'el cristal revienta: Fresita sale volando'], [34.15, 'golpe', 'orbe azul'], [34.3, 'golpe', 'orbe naranja'], [34.45, 'golpe', 'orbe violeta'], [36.4, 'silencio', 'se los llevó'],
      [37.5, 'golpe', 'Fresita cae en el pretil'], [43.3, 'golpe', 'visión: pixel'], [43.8, 'golpe', 'visión: tinta'], [44.3, 'golpe', 'visión: neón'], [44.8, 'golpe', 'visión: acuarela'], [46.2, 'acento', 'acepta'],
      [47, 'golpe', 'la grieta crece'], [47.6, 'swell', 'viento hacia la grieta'], [54.5, 'silencio', 'cámara lenta'], [56.45, 'golpe', 'entran a la grieta'], [58.6, 'golpe', 'destello'], [58.8, 'musica', 'tema del primer mundo']];
    const subs = [[38.3, 39.7, 'Itzel', '¡Ey! ¿Estás bien?'], [41.1, 42.9, 'Fresita', 'Soy Fresita. ¡Esa cosa se llevó a mis amigos!'], [43.0, 44.8, 'Fresita', 'Los escondió en otros mundos. ¿Me ayudas?'],
      [45.0, 46.9, 'Itzel', 'Va, Fresita. Vamos por ellos.'], [53.3, 54.5, 'Itzel', '¡Fresita, conmigo!']];
    for (const q of cues) q[0] = externo(q[0]);
    for (const q of subs) { q[0] = externo(q[0]); q[1] = externo(q[1]); }
    cues.push([PRE0, 'ambiente', 'Parque Principal: palomas y campanas de la catedral'], [PRE0 + 3.2, 'ambiente', 'la muralla: viento y bandera'], [PRE0 + 6.3, 'ambiente', 'calle del centro: marimba lejana'], [PRE0 + PRE, 'archivo', 'fin del bullicio']); cues.sort((a, b) => a[0] - b[0]);
    if (opc.final) {
      cues.length = 0; cues.push([0, 'swell', 'la grieta se cierra'], [4.7, 'golpe', 'destello: se cierra'], [7.5, 'ambiente', 'olas y gaviotas otra vez'], [8, 'nota', 'luz azul'], [8.4, 'nota', 'luz naranja'], [8.8, 'nota', 'luz violeta'], [13.5, 'musica', 'tema de Itzel'], [27, 'musica', 'final bordado']);
      subs.length = 0; subs.push([14.2, 15.9, 'Fresita', '¡Están todos! ¡Lo logramos!'], [16.3, 18, 'Itzel', 'Y Campeche sigue en su lugar.'], [18.4, 20.1, 'Fresita', 'Gracias, Itzel. Por todo.']);
    }
    if (opc.soloDatos) return { dur: DUR, cues, subs };

    let C = null; // capas y recursos pesados
    const itz = ACTOR.itzel(), fre = ACTOR.ajolote('fresita'), azul = ACTOR.ajolote('azul'), nar = ACTOR.ajolote('naranja'), vio = ACTOR.ajolote('violeta');
    const TODOS = [itz, fre, azul, nar, vio];
    const DISENO_ITZEL = 7; // el diseño de ACTOR.DISENOS que usa esta cinemática (7: Aventurera)
    itz.dis = ACTOR.DISENOS.find(d => d.id === DISENO_ITZEL);
    const SI = .6, SF = .52, SA = .48, SZ = .42; // tamaño de Itzel, Fresita y los ajolotes en el mundo
    itz.s = SI; fre.s = SF; azul.s = SZ; nar.s = SA; vio.s = SA;
    let planoAnt = -1, Tglob = 0;

    // se prepara por pasos (cada paso cede el control para que la pantalla de espera siga viva)
    async function preparar(avance) { try { await preparar0(avance); } catch (e) { if (e.message !== 'cancelada') throw e; } }
    async function preparar0(avance) {
      const t0 = performance.now(), dpr = devicePixelRatio || 1, tiempos = {};
      const paso = async (nombre, fn) => { if (!C) throw new Error('cancelada'); const a = performance.now(); fn(); tiempos[nombre] = Math.round(performance.now() - a); if (avance) avance(nombre); await new Promise(r => setTimeout(r, 0)); };
      C = {};
      await paso('cielo', () => C.cielo = capaPintada(-600, -700, 1200, 770, 1.6, pintaCielo, 10));
      await paso('nubes', () => C.nubes = capaPintada(-660, -620, 1460, 640, 1.6, pintaNubes, 8));
      await paso('mar', () => C.mar = capaPintada(-760, 38, 1960, 104, 2, pintaMar, 5));
      await paso('lejos', () => C.lejos = capaPintada(60, 0, 1100, 46, 2, pintaLejos, 4));
      await paso('ciudad', () => C.ciudad = capaPintada(60, -80, 1840, 166, 2.4, pintaCiudad, 5));
      await paso('baluarte', () => C.baluarte = capaPintada(-100, 20, 860, 84, 2.8, pintaBaluarte, 5));
      if (!opc.final) await paso('campeche', () => CAMPECHE_TOMAS.prepara());
      C.frases = CUENTO.map(q => BORDADO.frase(q[0]));
      await paso('sprites', () => { C.palma = spritePalma(); C.bugambilia = spriteBugambilia(); C.grano = grano(); });
      // los mundos de verdad, dibujados con sus estilos (para la visión, la grieta y el túnel);
      // cada uno se dibuja una vez aquí: así su terreno queda en caché y no da tirón después
      C.vision = {};
      for (const id of ESTILOS_VISION) if (STYLE_MAP[id]) await paso('vision ' + id, () => { const v = new View(mkCanvas(1, 1), STYLE_MAP[id], true); v.resize(VW * 1.15 / dpr, 1.15); for (let i = 0; i < 40; i++) v.update(1 / 60); v.render(); C.vision[id] = v; });
      C.fotos = [];
      const fotoDe = (st, seed) => { const v = new View(mkCanvas(1, 1), st, true); v.resize(VW * .9 / dpr, .9); for (let i = 0; i < 60 + seed * 23 % 90; i++) v.update(1 / 60); v.render(); const c = mkCanvas(v.c.width, v.c.height); c.getContext('2d').drawImage(v.c, 0, 0); return c; };
      for (const [i, id] of ESTILOS_GRIETA.entries()) if (STYLE_MAP[id]) await paso('foto ' + id, () => C.fotos.push(fotoDe(STYLE_MAP[id], i)));
      await paso('primer mundo', () => C.primer = opc.mundo ? fotoDe(opc.mundo, 3) : C.fotos[0]);
      // logo bordado, puntada por puntada
      C.logo = new Image(); C.logo.src = BORDADO.text('Itzel', 16);
      // grieta: una costura dentada, del horizonte hacia arriba
      const r = rng(97); C.grieta = []; for (let y = HORIZ - 2; y > -190; y -= 7 + r() * 5) C.grieta.push([RIFT_X + (r() - .5) * 5 + Math.sin(y * .05) * 5, y]);
      C.tinta = []; for (let i = 0; i < 90; i++) C.tinta.push([r(), r(), r(), r()]);
      tiempos.total = Math.round(performance.now() - t0); window.__cinePrep = tiempos;
    }

    // ---------- cámara ----------
    function aplica(ctx, c, d) {
      const zd = Math.pow(c.z, d);
      if (c.rot) ctx.rotate(c.rot);
      ctx.scale(c.L || 1, c.L || 1); ctx.translate(-(c.lx || 0), -(c.ly || 0));
      ctx.translate((c.sx || 0) * d - (c.tx || 0), (c.sy || 0) * d - (c.ty || 0));
      ctx.scale(zd, zd); ctx.translate(-c.x * d, -c.y * d);
    }
    const pant = (c, d, x, y) => { const zd = Math.pow(c.z, d), L = c.L || 1; return [(zd * (x - c.x * d) + (c.sx || 0) * d - (c.tx || 0) - (c.lx || 0)) * L, (zd * (y - c.y * d) + (c.sy || 0) * d - (c.ty || 0) - (c.ly || 0)) * L, zd * L]; };
    // encuadre por anclas: el punto a (x, y, d) queda en la pantalla en (sx, sy), y si hay b, también b.
    // Con dos anclas se resuelven el traslado de la cámara (paralaje) y el paneo (mueve todo igual).
    function encuadra(z, L, a, b, extra) {
      const c = { z, L, x: 0, y: 0, tx: 0, ty: 0 };
      for (const [k, i, tk] of [['x', 0, 'tx'], ['y', 1, 'ty']]) {
        const z1 = Math.pow(z, a[2]), s1 = a[3 + i] / L;
        if (!b || b[3 + i] == null) { c[k] = (z1 * a[i] - s1) / (z1 * a[2]); continue; }
        const z2 = Math.pow(z, b[2]), s2 = b[3 + i] / L, cv = (z1 * a[i] - z2 * b[i] - (s1 - s2)) / (z1 * a[2] - z2 * b[2]);
        c[k] = cv; c[tk] = z1 * a[i] - z1 * a[2] * cv - s1;
      }
      return Object.assign(c, extra);
    }
    const mezcla = (c1, c2, u) => { const c = {}; for (const k of new Set([...Object.keys(c1), ...Object.keys(c2)])) c[k] = lerp(c1[k] || (k === 'z' || k === 'L' ? 1 : 0), c2[k] || (k === 'z' || k === 'L' ? 1 : 0), u); return c; };
    const desen = (foco, d) => foco ? clamp(Math.abs(d - foco.d) * foco.k, 0, 1) : 0;
    function capa(ctx, c, d, L, b, alfa = 1) {
      ctx.save(); aplica(ctx, c, d);
      if (b > .02) { ctx.globalAlpha = Math.min(1, b * 2) * alfa; ctx.drawImage(L.imgB, L.x, L.y, L.w, L.h); }
      if (b < .98) { ctx.globalAlpha = (1 - b) * alfa; ctx.drawImage(L.img, L.x, L.y, L.w, L.h); }
      ctx.restore();
    }

    // ---------- el mundo (todo lo que va detrás de los personajes) ----------
    function mundo(ctx, c, o, M) {
      const T = o.T ?? Tglob, foco = o.foco;
      capa(ctx, c, .04, C.cielo, desen(foco, .04));
      // el sol
      { const [sx, sy, zs] = pant(c, .04, SOL_X, o.solY);
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 170 * zs); g.addColorStop(0, 'rgba(255,214,140,.55)'); g.addColorStop(.25, 'rgba(255,170,90,.22)'); g.addColorStop(1, 'rgba(255,150,80,0)'); ctx.fillStyle = g; ctx.fillRect(sx - 170 * zs, sy - 170 * zs, 340 * zs, 340 * zs);
        ctx.restore();
        ctx.save(); aplica(ctx, c, .04); ctx.beginPath(); ctx.arc(SOL_X, o.solY, 14.5, 0, TAU); ctx.fillStyle = '#ffe2a0'; ctx.fill(); ctx.beginPath(); ctx.arc(SOL_X - 1.5, o.solY - 1.5, 11.5, 0, TAU); ctx.fillStyle = '#fff4d0'; ctx.fill(); ctx.restore(); }
      capa(ctx, c, .07, C.nubes, desen(foco, .07));
      if (o.grieta) grieta(ctx, c, o.grieta, M);
      if (!opc.final) aves(ctx, c, T); // el final va sin aves: el cielo es del atardecer y de los ajolotes
      if (o.costa) capa(ctx, c, .05, C.lejos, desen(foco, .05));
      // mar en rebanadas: cada una con su paralaje (de .04 en el horizonte a casi 1 junto al malecón)
      const N = 30, L = C.mar, Y = i => 38 + 104 * Math.pow(i / N, 1.6), Dm = i => dMar((Y(i) + Y(Math.min(N, i + 1))) / 2);
      ctx.save(); if (c.rot) ctx.rotate(c.rot);
      for (let i = 0; i < N; i++) {
        // cada rebanada va de su orilla de arriba a la de arriba de la siguiente (en pantalla), así no quedan huecos
        const ya = Y(i), yb = Y(i + 1), d = Dm(i), b = desen(foco, d);
        const top = pant(c, d, L.x, ya), bot = i < N - 1 ? pant(c, Dm(i + 1), L.x, yb)[1] : pant(c, d, L.x, yb + 30)[1], der = pant(c, d, L.x + L.w, ya)[0];
        const sy = (ya - 38) / 104, sh = ((i < N - 1 ? yb : Math.min(142, yb + 30)) - ya) / 104, alto = bot - top[1] + .6;
        if (alto <= 0) continue;
        if (b > .02) { ctx.globalAlpha = Math.min(1, b * 2); ctx.drawImage(L.imgB, 0, sy * L.imgB.height, L.imgB.width, Math.max(1, sh * L.imgB.height), top[0], top[1], der - top[0], alto); }
        if (b < .98) { ctx.globalAlpha = 1 - b; ctx.drawImage(L.img, 0, sy * L.img.height, L.img.width, Math.max(1, sh * L.img.height), top[0], top[1], der - top[0], alto); }
      }
      ctx.restore();
      if (o.reflejo !== false) reflejo(ctx, c, o, T);
      if (!opc.final && T < 12) lanchas(ctx, c, T);
      if (o.rendija !== undefined ? o.rendija > 2 : !opc.final && Tglob >= 21) grietaHorizonte(ctx, c, o.rendija ?? 4, Tglob); // abierta para siempre (delante del mar, detrás de la ciudad)
      if (o.grieta && (o.grieta.ancho || 0) > 20) trombaMar(ctx, c, o.grieta, Tglob);
      if (o.costa) {
        capa(ctx, c, .25, C.ciudad, desen(foco, .25));
        capa(ctx, c, .4, C.baluarte, desen(foco, .4));
        // la muralla se para en tierra: la costa la une con el malecón y nada queda en el agua
        const [tx, ty] = pant(c, .4, -71, 97), [, by] = pant(c, 1, 0, PRETIL), der = M.x1 + 10, g = ctx.createLinearGradient(0, ty, 0, by);
        g.addColorStop(0, '#c7a878'); g.addColorStop(1, '#a88a63'); ctx.fillStyle = g;
        const orilla = () => { ctx.beginPath(); ctx.moveTo(tx - 3, ty); ctx.lineTo(der, ty); ctx.lineTo(der, by + 4); ctx.lineTo(tx - 118, by + 4); ctx.quadraticCurveTo(tx - 42, by - 3, tx - 3, ty); ctx.closePath(); };
        orilla(); ctx.fill();
        ctx.save(); orilla(); ctx.clip(); ctx.fillStyle = 'rgba(92,118,74,.55)'; ctx.fillRect(tx - 3, ty, der - tx, 3 * (c.L || 1)); ctx.restore();
        ctx.beginPath(); ctx.moveTo(tx - 118, by + 4); ctx.quadraticCurveTo(tx - 42, by - 3, tx - 3, ty); ctx.strokeStyle = 'rgba(240,250,245,.75)'; ctx.lineWidth = 1.4; ctx.stroke();
      }
      if (o.contagio) contagio(ctx, c, o.contagio, M, T);
      if (o.luces) lucesMar(ctx, c, o.luces, T);
      if (!o.sinMalecon) malecon(ctx, c, o, M, T);
    }
    // destellos del sol en el agua (se mueven)
    function reflejo(ctx, c, o, T) {
      const [sx] = pant(c, .04, SOL_X, o.solY), hund = clamp((o.solY - 30) / 25, 0, 1), fuerza = (o.reflejoK ?? 1) * (1 - hund * .7);
      if (fuerza <= 0) return;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let j = 0; j < 46; j++) {
        const y = HORIZ + 1 + Math.pow(j / 46, 1.5) * 86, d = dMar(y), [, py, zd] = pant(c, d, 0, y), p = (y - HORIZ) / 90, spread = (10 + p * 60) * zd;
        for (let k = 0; k < 3; k++) {
          const n = noise1(j * 3.1 + k * 17 + T * (1.1 + k * .3), 7 + k), px = sx + (n - .5) * spread * 1.6, w = (2 + p * 18) * zd * (.5 + noise1(j + T * 2 + k, 3)), h = Math.max(.5, (.5 + p * 1.6) * zd);
          ctx.globalAlpha = (.55 - p * .35) * fuerza * (.5 + n * .5); ctx.fillStyle = k ? '#ffd890' : '#fff4d0'; ctx.fillRect(px - w / 2, py - h / 2, w, h);
        }
      }
      ctx.restore();
    }
    // ---------- las aves del cielo de Campeche ----------
    // Vistas de lado, como cruzan el cuadro. Cada ala es un plano en 3D que gira alrededor del cuerpo:
    // brazo y mano (la mano va atrasada, como látigo, y se dobla hacia atrás al subir); se proyecta con
    // la cámara un poco abajo, así el ala se ve ancha arriba y abajo del aletazo y delgada al pasar.
    // El cuerpo sube y baja al revés de las alas. Gaviotas que aletean a ratos y planean, y una fila
    // de pelícanos rozando el mar.
    const ESPECIE = {
      gaviota: { cuerpo: '#f6eee6', panza: '#ffffff', ala: '#c9c0c8', alaLejos: '#a8a0aa', punta: '#2a2028', luz: 'rgba(255,225,190,.75)',
        brazo: 3.4, mano: 4.4, cRaiz: 3.0, cMuneca: 2.2, plumas: 0, M: [.2, -.1], amp: .7, largo: 7, grueso: 1.2 },
      pelicano: { cuerpo: '#7c6c66', panza: '#9a8a80', ala: '#6e5e58', alaLejos: '#54463f', punta: '#2e2420', luz: 'rgba(255,190,130,.55)',
        brazo: 4.8, mano: 5.4, cRaiz: 4.2, cMuneca: 3.4, plumas: 5, M: [.12, -.08], amp: .6, largo: 10, grueso: 1.55 },
    };
    const pr = (x, y, z) => [x + z * .32, -y + z * .52]; // la cámara: tres cuartos, desde abajo
    function alaAve(ctx, E, lado, ta, th, dobla, col) {
      const z = lado, S = [.6, E.grueso * .7, 0];
      const W = [S[0] - .3, S[1] + E.brazo * Math.sin(ta), z * E.brazo * Math.cos(ta)];
      const H = [W[0] - .6 - dobla * 2.6, W[1] + E.mano * Math.sin(th), W[2] + z * E.mano * Math.cos(th) * (1 - dobla * .35)];
      const P = (q, dx = 0) => pr(q[0] + dx, q[1], q[2]);
      ctx.beginPath(); ctx.moveTo(...P(S)); ctx.quadraticCurveTo(...P([(S[0] + W[0]) / 2 + .4, (S[1] + W[1]) / 2 + .25, (S[2] + W[2]) / 2]), ...P(W));
      ctx.quadraticCurveTo(...P([(W[0] + H[0]) / 2 + .3, (W[1] + H[1]) / 2 + .2, (W[2] + H[2]) / 2]), ...P(H));
      // orilla de atrás: plumas de la mano (dedos) y luego el brazo
      const n = E.plumas;
      if (n) { for (let k = 0; k < n; k++) { const u = (k + 1) / (n + 1), q = [H[0] + (W[0] - H[0]) * u, H[1] + (W[1] - H[1]) * u, H[2] + (W[2] - H[2]) * u], ch = E.cMuneca * (.45 + u * .55); ctx.lineTo(...P(q, -ch * (k % 2 ? .78 : 1.05))); } }
      else { const q = [H[0] + (W[0] - H[0]) * .5, H[1] + (W[1] - H[1]) * .5, H[2] + (W[2] - H[2]) * .5]; ctx.quadraticCurveTo(...P(q, -E.cMuneca * 1.05), ...P(W, -E.cMuneca)); }
      ctx.lineTo(...P(W, -E.cMuneca)); ctx.quadraticCurveTo(...P([(S[0] + W[0]) / 2, (S[1] + W[1]) / 2 - .2, (S[2] + W[2]) / 2], -E.cRaiz * 1.05), ...P(S, -E.cRaiz)); ctx.closePath();
      ctx.fillStyle = col; ctx.fill();
      return { W: P(W), H: P(H), S: P(S) };
    }
    // un ave: fase del aletazo (ph), cuánto aletea (a: 0 planea, 1 aletea), giro de la vuelta (k: -1..1, se ve de frente al voltear)
    function ave(ctx, tipo, x, y, s, ph, a, k, rot = 0, T = 0) {
      const E = ESPECIE[tipo], dir = k < 0 ? -1 : 1, ancho = .62 + .38 * Math.abs(k);
      const ta = E.M[0] * (1 - a) + a * (.18 + E.amp * Math.sin(ph)), th = E.M[1] * (1 - a) + a * (.05 + E.amp * 1.25 * Math.sin(ph - .9)), dobla = a * Math.max(0, Math.cos(ph)) * .8;
      const bob = a * .45 * Math.sin(ph - Math.PI * .85);
      ctx.save(); ctx.translate(x, y + bob * s); ctx.rotate(rot); ctx.scale(s * ancho * dir, s);
      alaAve(ctx, E, -1, ta, th, dobla, E.alaLejos); // el ala de atrás
      // el cuerpo de lado (mirando a la derecha): gota con lomo y panza, y la cabeza redonda
      const L = E.largo, B = E.grueso, hx = L * (tipo === 'pelicano' ? .4 : .44), hy = -B * (tipo === 'pelicano' ? 1.05 : .72), hr = B * (tipo === 'pelicano' ? .62 : .72);
      ctx.beginPath(); ctx.moveTo(L * .4, -B * .25);
      ctx.bezierCurveTo(L * .33, -B * 1.3, -L * .12, -B * 1.15, -L * .48, -B * .35); ctx.lineTo(-L * .5, B * .12);
      ctx.bezierCurveTo(-L * .15, B * 1.15, L * .3, B * 1.0, L * .4, -B * .25); ctx.closePath();
      ctx.fillStyle = E.cuerpo; ctx.fill();
      ctx.save(); ctx.clip(); ctx.fillStyle = E.panza; ctx.globalAlpha = .6; ctx.beginPath(); ctx.ellipse(L * .05, B * .95, L * .45, B * .8, 0, 0, TAU); ctx.fill(); ctx.restore();
      if (tipo === 'pelicano') { ctx.strokeStyle = E.cuerpo; ctx.lineWidth = B * .8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(L * .3, -B * .2); ctx.quadraticCurveTo(L * .42, -B * .2, hx, hy); ctx.stroke(); }
      ctx.fillStyle = tipo === 'pelicano' ? '#efe6d6' : E.cuerpo; ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill();
      // la cola
      ctx.fillStyle = E.cuerpo;
      { ctx.beginPath(); ctx.moveTo(-L * .45, -.45); ctx.lineTo(-L * .68, -.25); ctx.lineTo(-L * .66, .25); ctx.lineTo(-L * .45, .1); ctx.fill(); }
      // pico, ojo y detalle de cada una
      if (tipo === 'gaviota') { ctx.fillStyle = '#2a2028'; ctx.beginPath(); ctx.arc(hx + hr * .15, hy - hr * .1, hr * .95, Math.PI * .9, Math.PI * 2.2); ctx.fill(); ctx.fillStyle = '#e8a83a'; ctx.beginPath(); ctx.moveTo(hx + hr * .8, hy - hr * .1); ctx.lineTo(hx + hr * 2.3, hy + hr * .25); ctx.lineTo(hx + hr * .75, hy + hr * .45); ctx.fill(); }
      if (tipo === 'pelicano') { ctx.fillStyle = '#e0a050'; ctx.beginPath(); ctx.moveTo(hx + hr * .6, hy - hr * .35); ctx.lineTo(hx + hr * 6.2, hy + hr * .25); ctx.lineTo(hx + hr * .6, hy + hr * .5); ctx.fill(); ctx.fillStyle = 'rgba(205,125,65,.7)'; ctx.beginPath(); ctx.moveTo(hx + hr * .8, hy + hr * .45); ctx.quadraticCurveTo(hx + hr * 3.4, hy + hr * 1.9, hx + hr * 6, hy + hr * .3); ctx.fill(); }
      ctx.fillStyle = '#100808'; ctx.beginPath(); ctx.arc(hx + hr * .35, hy - hr * .2, hr * .22, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(hx + hr * .42, hy - hr * .28, hr * .07, 0, TAU); ctx.fill();
      // el ala de adelante, con la luz del sol en su orilla
      const w = alaAve(ctx, E, 1, ta, th, dobla, E.ala);
      if (tipo === 'gaviota') { ctx.fillStyle = E.punta; ctx.beginPath(); ctx.moveTo(...w.H); ctx.lineTo(w.W[0] + (w.H[0] - w.W[0]) * .55, w.W[1] + (w.H[1] - w.W[1]) * .55); ctx.lineTo(w.W[0] + (w.H[0] - w.W[0]) * .5 - 1.2, w.W[1] + (w.H[1] - w.W[1]) * .5 + .2); ctx.closePath(); ctx.fill(); }
      ctx.strokeStyle = E.luz; ctx.lineWidth = .28; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(...w.S); ctx.lineTo(...w.W); ctx.lineTo(...w.H); ctx.stroke();
      ctx.restore();
    }
    // quiénes vuelan: gaviotas que cruzan
    const GAVIOTAS = Array.from({ length: 6 }, (_, i) => ({ x0: hash1(i, 81) * 920, v: 13 + hash1(i, 82) * 9, y: -330 + hash1(i, 83) * 240, s: 1.9 + hash1(i, 84) * .8, f: hash1(i, 85) * TAU, sentido: i % 3 ? 1 : -1 }));
    function aves(ctx, c, T) {
      ctx.save(); aplica(ctx, c, .09);
      for (const b of GAVIOTAS) { // ráfagas de aletazos y planeos, con la trayectoria ondulando
        const x = -440 + wrap(b.x0 + T * b.v * b.sentido, 920), ond = T * 1.1 + b.f, y = b.y + Math.sin(ond) * 5, rafaga = clamp((Math.sin(T * .9 + b.f) + .2) / .5, 0, 1);
        ave(ctx, 'gaviota', x, y, b.s, T * 13 + b.f, rafaga, b.sentido, -Math.cos(ond) * .14 * b.sentido, T);
      }
      ctx.restore();
      // la fila de pelícanos rozando el mar: pasa una sola vez, frente al sol, mientras Itzel descansa (la toma de los 12 a los 17 s)
      if (T < 12 || T > 18.6) return;
      ctx.save(); aplica(ctx, c, .045);
      for (let i = 0; i < 6; i++) {
        const x = -40 - (T - 11) * 26 - i * 16 - Math.max(0, T - 16.6) ** 2 * 120, y = HORIZ - 11 - i * 1.6 + Math.sin(T * .8 + i * .3) * 1.2, planea = clamp((Math.sin(T * .7) - .2) / .3, 0, 1);
        ave(ctx, 'pelicano', x, y, 1.0, T * 5.5 - i * .7, 1 - planea, -1, .02, T);
      }
      ctx.restore();
    }
    window.__ave = ave; // para revisarlas en grande (pruebas)
    // el malecón: pretil encalado con pilastras, faroles y el piso de losas
    // desenfocado: se pinta en un lienzo aparte y se desenfoca una sola vez (un filtro por trazo cuesta ~50 ms)
    let BUF = null;
    function malecon(ctx0, c, o, M, T) {
      const b = desen(o.foco, 1), px = b * 3.2 * M.k * c.z * (c.L || 1) / 3;
      let ctx = ctx0;
      if (px > .6) {
        const W = ctx0.canvas.width, H = ctx0.canvas.height;
        if (!BUF || BUF.width !== W || BUF.height !== H) BUF = mkCanvas(W, H);
        ctx = BUF.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H); ctx.setTransform(ctx0.getTransform());
      }
      ctx.save(); aplica(ctx, c, 1);
      const Lz = c.L || 1, x0 = c.x + (M.x0 / Lz + (c.tx || 0) - 40) / c.z - 60, x1 = c.x + (M.x1 / Lz + (c.tx || 0) + 40) / c.z + 60;
      // piso
      ctx.fillStyle = '#b88c6a'; ctx.fillRect(x0, PRETIL + 22, x1 - x0, 200);
      ctx.fillStyle = '#c99c76'; for (const [ya, yb] of [[150, 155], [158, 164], [168, 177], [182, 195], [201, 220]]) { ctx.globalAlpha = .55; ctx.fillRect(x0, ya, x1 - x0, yb - ya - .8); }
      ctx.globalAlpha = 1; ctx.strokeStyle = 'rgba(90,50,40,.3)'; ctx.lineWidth = .5;
      for (const [ya, yb, st] of [[150, 155, 9], [155, 160, 11], [160, 166, 13], [166, 174, 16], [174, 184, 20], [184, 198, 26], [198, 220, 34]]) { ctx.beginPath(); ctx.moveTo(x0, ya); ctx.lineTo(x1, ya); for (let xx = Math.floor(x0 / st) * st + (ya % 2) * st / 2; xx < x1; xx += st) { ctx.moveTo(xx, ya); ctx.lineTo(xx - (xx - c.x) * .04, yb); } ctx.stroke(); }
      // luz tibia rasante sobre el piso (viene de la izquierda)
      const lg = ctx.createLinearGradient(x0, 0, x1, 0); lg.addColorStop(0, 'rgba(255,190,120,.12)'); lg.addColorStop(1, 'rgba(120,60,80,.10)'); ctx.fillStyle = lg; ctx.fillRect(x0, 150, x1 - x0, 80);
      avioncito(ctx, x0, x1);
      // pretil
      ctx.fillStyle = '#e9d3b2'; ctx.fillRect(x0, PRETIL + 1.5, x1 - x0, 21);
      if (!o.postes) for (let xx = Math.floor(x0 / 96) * 96; xx < x1; xx += 96) {
        ctx.fillStyle = '#f2e0c2'; ctx.fillRect(xx - 5, PRETIL + 1.5, 10, 21); ctx.fillStyle = 'rgba(120,70,70,.22)'; ctx.fillRect(xx + 3.6, PRETIL + 1.5, 1.4, 21);
      }
      for (let i = 0; i < 40; i++) { const xx = Math.floor(x0 / 30) * 30 + i * 30 + hash1(i + Math.floor(x0 / 30), 3) * 14; if (xx > x1) break; ctx.fillStyle = 'rgba(140,100,80,.12)'; ctx.beginPath(); ctx.ellipse(xx, PRETIL + 14 + hash1(i, 4) * 6, 4 + hash1(i, 5) * 6, 1.4 + hash1(i, 6) * 2, 0, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#f6ead4'; ctx.fillRect(x0, PRETIL - 2, x1 - x0, 3.6); ctx.fillStyle = 'rgba(120,70,60,.35)'; ctx.fillRect(x0, PRETIL + 1.5, x1 - x0, .9);
      ctx.fillStyle = 'rgba(70,30,40,.25)'; ctx.fillRect(x0, PRETIL + 22, x1 - x0, 2.2);
      // las esferas del malecón: el mismo pretil sube en pilastras que rematan en una bola
      if (o.postes) for (const xx of o.postes) esfera(ctx, xx, PRETIL - 2);
      else for (let xx = Math.floor(x0 / 96) * 96 + 48; xx < x1; xx += 96) esfera(ctx, xx, PRETIL - 2);
      // faroles sobre las pilastras
      for (let xx = Math.floor(x0 / 96) * 96; xx < x1; xx += 96) if (o.faroles !== false && (o.parejos || xx < -150 || xx > 40)) farol(ctx, xx, PRETIL - 2, T, o.parpadeo || 0); // en lo cerrado, donde se sienta Itzel no hay farol
      if (!opc.final && T < 12) CAMPECHE_TOMAS.malecon(ctx, T); // la gente del paseo: al meterse el sol ya se fue
      ctx.restore();
      if (ctx !== ctx0) { ctx0.save(); ctx0.setTransform(1, 0, 0, 1, 0, 0); ctx0.filter = `blur(${px.toFixed(1)}px)`; ctx0.drawImage(BUF, 0, 0); ctx0.restore(); }
    }
    function avioncito(ctx, x0v, x1v) {
      const x0 = AV.x0, w = AV.w, ya = 157, yb = 171, ym = PISO2;
      if (x1v < x0 - 30 || x0v > CIELO_X + 30) return;
      const r = rng(5), linea = (xa, y1, xb, y2) => { for (let k = 0; k < 2; k++) { ctx.globalAlpha = .45; ctx.beginPath(); ctx.moveTo(xa + (r() - .5) * .6, y1 + (r() - .5) * .4); ctx.lineTo(xb + (r() - .5) * .6, y2 + (r() - .5) * .4); ctx.stroke(); } };
      ctx.save(); ctx.strokeStyle = '#f6efe2'; ctx.lineWidth = .7; ctx.lineCap = 'round';
      AV.celdas.forEach(([n, doble], i) => { const xa = x0 + i * w, xb = xa + w; linea(xa, ya, xb, ya); linea(xa, yb, xb, yb); linea(xa, ya, xa, yb); linea(xb, ya, xb, yb); if (doble === 2) linea(xa, ym, xb, ym); });
      const cx0 = x0 + 6 * w; ctx.globalAlpha = .5; ctx.beginPath(); ctx.ellipse(cx0, ym, 22, (yb - ya) / 2 + .4, 0, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      // números y la palabra CIELO, acostados en el piso
      ctx.fillStyle = '#f6efe2'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '800 9px "Alegreya Sans", sans-serif';
      const num = (txt, x, y, k = 1) => { ctx.save(); ctx.translate(x, y); ctx.scale(k, .5 * k); ctx.globalAlpha = .72; ctx.fillText(txt, 0, 0); ctx.restore(); };
      AV.celdas.forEach(([n, doble], i) => { const xc = x0 + (i + .5) * w; if (doble === 2) { num(n, xc, ym - 2.7, .8); num(String(+n + 1), xc, ym + 2.7, .8); } else num(n, xc, ym); });
      num('CIELO', cx0 + 9, ym, .75);
      // una florecita y un sol dibujados con gis al lado
      ctx.globalAlpha = .45; ctx.lineWidth = .6;
      for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; ctx.beginPath(); ctx.ellipse(x0 - 18 + Math.cos(a) * 2.2, 168 + Math.sin(a) * 1, 1.5, .7, a, 0, TAU); ctx.stroke(); }
      ctx.beginPath(); ctx.ellipse(CIELO_X + 26, 160, 3, 1.4, 0, 0, TAU); ctx.stroke(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; ctx.beginPath(); ctx.moveTo(CIELO_X + 26 + Math.cos(a) * 4, 160 + Math.sin(a) * 1.9); ctx.lineTo(CIELO_X + 26 + Math.cos(a) * 6, 160 + Math.sin(a) * 2.8); ctx.stroke(); }
      ctx.restore();
    }
    function bola(ctx, x, y, r, col) {
      const g = ctx.createRadialGradient(x - r * .4, y - r * .42, r * .08, x, y, r * 1.02); g.addColorStop(0, shade(col, .55)); g.addColorStop(.42, col); g.addColorStop(.86, shade(col, -.34)); g.addColorStop(1, shade(col, -.18));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    }
    function esfera(ctx, x, base) {
      const w = 7, top = base - 9, pie = PRETIL + 22;
      ctx.fillStyle = '#f2e0c2'; ctx.fillRect(x - w, top, w * 2, pie - top); ctx.fillStyle = 'rgba(120,70,70,.22)'; ctx.fillRect(x + w - 1.4, top, 1.4, pie - top);
      ctx.fillStyle = '#f6ead4'; ctx.fillRect(x - w - 1, top - 2, w * 2 + 2, 3); ctx.fillStyle = 'rgba(120,70,60,.35)'; ctx.fillRect(x - w, top + 1, w * 2, .9);
      ctx.fillStyle = 'rgba(70,30,40,.3)'; ctx.beginPath(); ctx.ellipse(x + 1, top - 2, 5.4, 1, 0, 0, TAU); ctx.fill();
      bola(ctx, x, top - 7.4, 6, '#f4ede0');
    }
    // las lanchas de la tarde: pescadores y una vela frente al sol
    function lanchas(ctx, c, T) {
      for (const [x0, y, v, vela, col] of [[-74, 50, -2.2, 1, '#f4ede0'], [168, 58, 2.6, 0, '#2f8a9a'], [-262, 70, 3.4, 0, '#d8603a']]) {
        const e = (y - HORIZ) / 16, x = x0 + T * v, b = Math.sin(T * 1.4 + x0) * .5 * e, dir = v < 0 ? -1 : 1;
        ctx.save(); aplica(ctx, c, dMar(y)); ctx.translate(x, y + b); ctx.scale(e * dir, e); ctx.rotate(Math.sin(T * 1.1 + x0) * .035);
        ctx.fillStyle = 'rgba(40,30,50,.28)'; ctx.beginPath(); ctx.ellipse(0, 3.6, 13, 1.1, 0, 0, TAU); ctx.fill();
        if (vela) { ctx.fillStyle = '#3a2a2a'; ctx.fillRect(-.4, -22, .8, 22); ctx.fillStyle = '#fff0d8'; ctx.beginPath(); ctx.moveTo(1, -22); ctx.quadraticCurveTo(10, -10, 11, -2); ctx.lineTo(1, -2); ctx.fill(); ctx.fillStyle = '#ffc58a'; ctx.beginPath(); ctx.moveTo(-1, -19); ctx.lineTo(-8, -2); ctx.lineTo(-1, -2); ctx.fill(); }
        else { ctx.fillStyle = '#2a1c24'; ctx.fillRect(-4, -5.6, 2.6, 5.6); ctx.beginPath(); ctx.arc(-2.7, -6.8, 1.4, 0, TAU); ctx.fill(); ctx.fillStyle = '#eadcb4'; ctx.beginPath(); ctx.ellipse(-2.7, -7.8, 2.6, .6, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#2a1c24'; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(-1.6, -4.4); ctx.lineTo(8, -9); ctx.stroke(); ctx.strokeStyle = 'rgba(240,240,230,.5)'; ctx.lineWidth = .2; ctx.beginPath(); ctx.moveTo(8, -9); ctx.lineTo(12, 3); ctx.stroke(); }
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-12, -1); ctx.lineTo(13, -1.6); ctx.quadraticCurveTo(10, 3, 7, 3.2); ctx.lineTo(-10, 3.2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,240,215,.7)'; ctx.fillRect(-12, -1.3, 25, .6); ctx.fillStyle = 'rgba(30,24,40,.3)'; ctx.fillRect(-10, 1.8, 18, 1.3);
        ctx.restore();
      }
    }
    function farol(ctx, x, base, T, parp) {
      const on = parp ? (noise1(x * .1 + T * 9, 5) > .35 * parp ? 1 : .15) : 1;
      ctx.save();
      ctx.fillStyle = '#2a1e22'; ctx.fillRect(x - 3, base - 4, 6, 4); ctx.fillRect(x - .9, base - 40, 1.8, 36); ctx.fillRect(x - 2, base - 22, 4, 2);
      ctx.beginPath(); ctx.moveTo(x, base - 40); ctx.quadraticCurveTo(x + 6, base - 44, x + 8, base - 40); ctx.lineWidth = 1; ctx.strokeStyle = '#2a1e22'; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 5, base - 41); ctx.lineTo(x + 11, base - 41); ctx.lineTo(x + 10, base - 33); ctx.lineTo(x + 6, base - 33); ctx.closePath(); ctx.fillStyle = on > .5 ? '#ffd98a' : '#7a6050'; ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#2a1e22'; ctx.beginPath(); ctx.moveTo(x + 4, base - 41); ctx.lineTo(x + 8, base - 45); ctx.lineTo(x + 12, base - 41); ctx.fill(); ctx.fillRect(x + 5.5, base - 33, 5, 1.2);
      if (on > .5) { ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x + 8, base - 37, 0, x + 8, base - 37, 15); g.addColorStop(0, 'rgba(255,210,130,.4)'); g.addColorStop(1, 'rgba(255,170,90,0)'); ctx.fillStyle = g; ctx.fillRect(x - 7, base - 52, 30, 30); }
      ctx.restore();
    }
    // primer término (d > 1): palmeras y arbustos que pasan desenfocados
    function frente(ctx, c, lista, M) {
      for (const [k, x, y, d, esc = 1] of lista) {
        const L = k === 'palma' ? C.palma : C.bugambilia;
        ctx.save(); aplica(ctx, c, d); ctx.translate(x, y); ctx.scale(esc, esc);
        ctx.globalAlpha = 1; ctx.drawImage(L.imgB, L.x, L.y, L.w, L.h); ctx.restore();
      }
    }
    // hojas verdes en el viento (o jaladas hacia la grieta)
    function hojas(ctx, M, T, n, viento = 30, hacia = null) {
      ambient(n, 47, (i, h1, h2, h3) => {
        let x, y; const vida = 3 + h3 * 2, f = wrap(T / vida + h1, 1);
        if (hacia) { const sx = M.x1 + 20 - h2 * 200, sy = M.y0 + h1 * (M.y1 - M.y0), e = EASE.in3(f); x = lerp(sx, hacia[0], e) + Math.sin(f * 9 + i) * 14 * (1 - e); y = lerp(sy, hacia[1], e) + Math.cos(f * 7 + i) * 10 * (1 - e); }
        else { x = M.x0 - 20 + wrap(h1 * 700 + T * viento * (.7 + h3), M.x1 - M.x0 + 40); y = M.y0 + wrap(h2 * 400 + T * (12 + h3 * 10), M.y1 - M.y0) + Math.sin(T * 2 + i) * 6; }
        ctx.save(); ctx.translate(x, y); ctx.rotate(T * (2 + h3 * 3) + i); ctx.scale(1, .5 + .5 * Math.sin(T * 5 + i));
        const l = 3 + h3 * 2; ctx.fillStyle = mix('#3f8f3f', '#8cc45a', h2); ctx.beginPath(); ctx.moveTo(-l, 0); ctx.quadraticCurveTo(0, -l * .55, l, 0); ctx.quadraticCurveTo(0, l * .55, -l, 0); ctx.fill();
        ctx.strokeStyle = 'rgba(30,70,30,.55)'; ctx.lineWidth = .35; ctx.beginPath(); ctx.moveTo(-l * .8, 0); ctx.lineTo(l * .8, 0); ctx.stroke(); ctx.restore();
      });
    }
    // los ajolotes a lo lejos (S5): cada uno chiquito, de su color, nadando hacia Itzel con su brillo
    function lucesMar(ctx, c, lista, T) {
      for (const [i, [col, x, d, a, aj, alto = 0, tam = 1]] of lista.entries()) {
        if (a <= 0) continue;
        // los que nadan a lo lejos laten; los que regresan volando van tranquilos, sin cambiar de tamaño ni sacudirse
        const vuela = tam > 1, y = yMar(d) - 1.5 - alto + (vuela ? Math.sin(T * 1.7 + i * 2) * 1.6 : 0), [px, py, zd] = pant(c, d, x, y), r = (4 + d * 30) * zd * (vuela ? 1 : .85 + .15 * Math.sin(T * 9 + x));
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * (vuela && aj ? .45 : 1); // de cerca ya se ve el ajolote: el brillo no lo tapa
        const g = ctx.createRadialGradient(px, py, 0, px, py, r * 2.6); g.addColorStop(0, rgba(col, .7)); g.addColorStop(.35, rgba(col, .25)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fillRect(px - r * 2.6, py - r * 2.6, r * 5.2, r * 5.2);
        ctx.restore();
        if (aj) { // el ajolote mismo (el actor de la cinemática, en chiquito)
          const v0 = aj.vista; aj.vista = vuela ? 'frente' : 'lado'; // los que vienen volando hacia Itzel se ven de frente
          aj.vis = true; aj.face = 1; aj.pose.nado = vuela ? .7 : 2; aj.pose.giro = vuela ? Math.sin(T * 1.3 + i * 2) * .05 : Math.sin(T * 8 + x) * .15; aj.cara.branquias = .6;
          const k = r * 3.4 / 104 * tam; ctx.save(); ctx.globalAlpha = a; ctx.translate(px, py - r * .2); ctx.scale(k, k); const x0 = aj.x, y0 = aj.y; aj.x = 0; aj.y = 0; ACTOR.dibuja(ctx, aj); aj.x = x0; aj.y = y0; aj.vista = v0; ctx.restore();
        }
      }
    }

    // ---------- la Ruptura: costura del horizonte, grieta y contagio ----------
    function grieta(ctx, c, g, M) {
      ctx.save(); aplica(ctx, c, .06);
      GRIETA.dibuja(ctx, C.grieta, { T: Tglob, alto: g.alto ?? 1, ancho: g.ancho || 0, aspira: g.aspira ?? .35, cx0: RIFT_X, cy0: -78, fotos: C.fotos });
      ctx.restore();
    }
    // abajo de la grieta el mar reacciona: su reflejo, anillos en el agua y una tromba que sube
    function trombaMar(ctx, c, g, T) {
      const aspira = g.aspira ?? .35, [bx, by, zd] = pant(c, .05, RIFT_X, HORIZ), k = clamp(g.ancho / 84, 0, 1.2);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      const refl = ctx.createLinearGradient(0, by, 0, by + 84 * zd); refl.addColorStop(0, 'rgba(255,90,210,' + (.34 * k) + ')'); refl.addColorStop(.45, 'rgba(90,220,255,' + (.14 * k) + ')'); refl.addColorStop(1, 'rgba(90,220,255,0)');
      ctx.fillStyle = refl; ctx.beginPath(); ctx.moveTo(bx - 20 * zd, by); ctx.lineTo(bx + 20 * zd, by); ctx.lineTo(bx + 46 * zd, by + 84 * zd); ctx.lineTo(bx - 46 * zd, by + 84 * zd); ctx.closePath(); ctx.fill();
      ambient(18, 83, (i, h1, h2, h3) => { const v = wrap(h1 + T * .06, 1), y = by + 3 * zd + v * v * 78 * zd, w = (5 + h3 * 16) * (1 + v * 2) * zd, x = bx + (h2 - .5) * (22 + v * 62) * zd + Math.sin(T * 2 + i) * 2 * zd; ctx.globalAlpha = (1 - v) * .55 * k; ctx.strokeStyle = i % 2 ? '#ff9ae6' : '#a8f6ff'; ctx.lineWidth = (.5 + v) * zd; ctx.beginPath(); ctx.moveTo(x - w, y); ctx.lineTo(x + w, y); ctx.stroke(); });
      for (let i = 0; i < 4; i++) { const v = wrap(T * (.3 + aspira * .25) + i / 4, 1), rx = (10 + (1 - v) * 92) * zd; ctx.globalAlpha = v * (1 - v) * 1.6 * k; ctx.strokeStyle = '#9ff8ff'; ctx.lineWidth = .7 * zd; ctx.beginPath(); ctx.ellipse(bx, by + 2 * zd, rx, rx * .1, 0, 0, TAU); ctx.stroke(); }
      ambient(Math.round(14 + aspira * 36), 87, (i, h1, h2, h3) => {
        const v = wrap(T * (.35 + h3 * .4) * (.6 + aspira) + h1, 1), e = EASE.in2(v), sep = (1 - e) * (10 + h2 * 44) * zd * (i % 2 ? 1 : -1), x = bx + sep + Math.sin(v * 7 + i) * 2 * zd, y = by + 1 - e * (26 + aspira * 30) * zd, l = (2 + h3 * 5) * zd;
        ctx.globalAlpha = Math.sin(v * Math.PI) * .8 * k; ctx.strokeStyle = i % 3 ? '#d8fbff' : '#ffd0f2'; ctx.lineWidth = (.35 + h3 * .5) * zd; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(bx + sep * .86, y + l); ctx.stroke();
      });
      ctx.restore();
    }
    // la rendija del horizonte: nace junto al sol y corre hasta cruzar todo el mar, de orilla a orilla;
    // por dentro, oscura; la orilla de arriba magenta y la de abajo turquesa
    function grietaHorizonte(ctx, c, t, T) {
      const abre = EASE.out3(tramo(t, 2.5, 3.5, 'lin')); if (abre <= 0) return;
      const w = 30 + 1250 * EASE.in2(tramo(t, 2.5, 4, 'lin')), x0 = SOL_X, y = HORIZ - .35, arriba = [], abajo = [], grosor = clamp(4.2 / pant(c, .04, x0, y)[2], 1, 2.6), medio = Math.min(w, 320);
      for (let x = -w; x <= w + .01; x += 3) {
        const k = Math.round((x0 + x) / 3), u = Math.abs(x) / (w + 1), nace = Math.exp(-Math.pow((x0 + x - RIFT_X) / 46, 2)) * tramo(T, 25.2, 26), gap = ((.2 + 2.3 * abre) * Math.pow(1 - u, .42) + 2.2 * nace) * grosor, z = (hash1(k, 5) - .5) * .9 * (1 - u * .4) * grosor;
        arriba.push([x0 + x, y + z - gap / 2]); abajo.push([x0 + x + (hash1(k, 6) - .5) * .6, y + z + gap / 2]);
      }
      const linea = P => { ctx.beginPath(); P.forEach(([px, py], n) => n ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); };
      ctx.save(); aplica(ctx, c, .04); ctx.lineJoin = 'miter'; ctx.lineCap = 'round';
      const late = 1 + .2 * Math.sin(T * 9) + (t > 3.3 && t < 3.6 ? 1.5 * (1 - (t - 3.3) / .3) : 0);
      // resplandor tenue alrededor
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; linea(arriba); ctx.strokeStyle = `rgba(255,79,216,${.14 * late})`; ctx.lineWidth = 2.2 * grosor; ctx.stroke(); linea(abajo); ctx.strokeStyle = `rgba(98,244,255,${.12 * late})`; ctx.lineWidth = 2.2 * grosor; ctx.stroke(); ctx.restore();
      // lo de adentro: otro cielo, oscuro, con un brillo que corre por en medio
      ctx.beginPath(); arriba.forEach(([px, py], n) => n ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); for (let n = abajo.length - 1; n >= 0; n--) ctx.lineTo(abajo[n][0], abajo[n][1]); ctx.closePath();
      ctx.fillStyle = '#1a0630'; ctx.fill();
      ctx.save(); ctx.clip(); ctx.globalCompositeOperation = 'lighter'; const cx = x0 + Math.sin(T * 1.7) * medio * .4, g = ctx.createRadialGradient(cx, y, 0, cx, y, medio * .6); g.addColorStop(0, `rgba(255,120,230,${.55 * late})`); g.addColorStop(1, 'rgba(255,120,230,0)'); ctx.fillStyle = g; ctx.fillRect(x0 - w, y - 3, w * 2, 6); ctx.restore();
      // las orillas: magenta arriba, turquesa abajo, con su filo blanco
      ctx.globalCompositeOperation = 'lighter';
      linea(arriba); ctx.strokeStyle = `rgba(255,79,216,${.85 * Math.min(1, late)})`; ctx.lineWidth = .32 * grosor; ctx.stroke();
      linea(abajo); ctx.strokeStyle = `rgba(98,244,255,${.8 * Math.min(1, late)})`; ctx.lineWidth = .32 * grosor; ctx.stroke();
      linea(arriba); ctx.strokeStyle = `rgba(255,255,255,${.5 * Math.min(1, late)})`; ctx.lineWidth = .1; ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    }
    // alrededor de la grieta, Campeche se contagia de otros estilos (S9)
    function contagio(ctx, c, g, M, T) {
      const [cx0, cy0] = pant(c, .06, RIFT_X, HORIZ - 6), R = g.r;
      if (R <= 1) return;
      const forma = (paso) => { ctx.beginPath(); for (let a = 0; a < TAU; a += .2) { const rr = R * (1 + .18 * Math.sin(a * 5 + T * 2) + .1 * Math.sin(a * 11 - T)); let x = cx0 + Math.cos(a) * rr * 1.25, y = cy0 + Math.sin(a) * rr * .8; if (paso) { x = Math.round(x / paso) * paso; y = Math.round(y / paso) * paso; } ctx.lineTo(x, y); } ctx.closePath(); };
      // el mar, en papel de arroz con olas de tinta
      ctx.save(); forma(0); ctx.clip();
      const [, yh] = pant(c, .05, 0, HORIZ + 1);
      ctx.beginPath(); ctx.rect(cx0 - R * 1.6, yh, R * 3.2, R * 1.4); ctx.clip();
      const r = rng(9);
      for (const [a, b, h, w] of C.tinta) { const x = cx0 - R * 1.5 + a * R * 3, y = yh + 2 + Math.pow(b, 1.3) * R * .9; pincel(ctx, r, x, y, (6 + h * 30) * (.4 + b), .6 + w * 2.4 * (.3 + b), '#141016', .42, Math.sin(T * 2 + a * 9) * 2); }
      ctx.restore();
    }

    // ---------- burbujas de Fresita (S2) ----------
    function burbuja(ctx, x, y, r, aplasta, T, alfa = 1) {
      ctx.save(); ctx.translate(x, y); ctx.scale(1 + aplasta * .25, 1 - aplasta * .3); ctx.globalAlpha = alfa;
      const g = ctx.createRadialGradient(-r * .3, -r * .3, r * .1, 0, 0, r); g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(.75, 'rgba(255,190,225,.16)'); g.addColorStop(.92, 'rgba(160,230,255,.45)'); g.addColorStop(1, 'rgba(255,170,220,.7)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
      ctx.lineWidth = .5; ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.stroke();
      ctx.strokeStyle = `hsla(${(T * 90) % 360},90%,75%,.55)`; ctx.lineWidth = .7; ctx.beginPath(); ctx.arc(0, 0, r * .86, .3, 1.6); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.ellipse(-r * .38, -r * .42, r * .22, r * .12, -.6, 0, TAU); ctx.fill();
      ctx.restore();
    }
    function salpica(ctx, x, y, k, s, col) {
      if (k <= 0 || k >= 1) return;
      ctx.save(); ctx.globalAlpha = 1 - k; ctx.fillStyle = '#eaf8ff';
      for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i / 8 - .5) * 2.4, v = (12 + hash1(i, 3) * 10) * s; ctx.beginPath(); ctx.arc(x + Math.cos(a) * v * k, y + Math.sin(a) * v * k + 30 * s * k * k, .8 * s + .4, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = rgba(col, .7); ctx.lineWidth = .6 * s + .3; ctx.beginPath(); ctx.ellipse(x, y + 1 * s, (4 + k * 12) * s, (1 + k * 2.6) * s, 0, 0, TAU); ctx.stroke();
      ctx.restore();
    }
    function chispitas(ctx, x, y, r, T, col, n = 6) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = col;
      for (let i = 0; i < n; i++) { const a = i / n * TAU + T * .8, f = wrap(T * .7 + i / n, 1), d = r * (.6 + f * .6), s = (1 - f) * 1.6; ctx.globalAlpha = 1 - f; const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * .8 - f * 4; ctx.beginPath(); ctx.moveTo(px, py - s * 1.8); ctx.lineTo(px + s * .5, py); ctx.lineTo(px, py + s * 1.8); ctx.lineTo(px - s * .5, py); ctx.closePath(); ctx.moveTo(px - s * 1.8, py); ctx.lineTo(px, py + s * .5); ctx.lineTo(px + s * 1.8, py); ctx.lineTo(px, py - s * .5); ctx.fill(); }
      ctx.restore();
    }
    // un actor en el mundo (con su profundidad y efectos)
    function actor(ctx, c, a, o = {}) {
      if (!a.vis) return;
      ctx.save(); aplica(ctx, c, o.d ?? 1);
      CINE.capa(ctx, ACTOR.caja(a), x => ACTOR.dibuja(x, a), o);
      ctx.restore();
    }
    function grado(ctx, M, col, a, modo = 'source-over') { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = modo; ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillRect(M.x0 - 2, M.y0 - 2, M.x1 - M.x0 + 4, M.y1 - M.y0 + 4); ctx.restore(); }
    function granoPantalla(ctx, M, T) {
      ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .07;
      const p = ctx.createPattern(C.grano, 'repeat'); const o = Math.floor(T * 24) % 4; p.setTransform(new DOMMatrix().translate(o * 37, o * 61).scale(.5, .5)); ctx.fillStyle = p; ctx.fillRect(M.x0, M.y0, M.x1 - M.x0, M.y1 - M.y0);
      ctx.restore();
    }

    // =================================================================
    //  PLANOS
    // =================================================================
    const sentadaY = PRETIL + 21 * itz.dis.piernas * itz.s; // raíz de Itzel cuando se sienta en el pretil
    const PL = [];
    const plano = (t0, t1, p) => { p.t0 = t0; p.t1 = t1; PL.push(p); };
    const ini = a => Object.assign(a.cara, a.tipo === 'itzel' ? { cejas: 0, preocupa: 0, enojo: 0, ojos: 1, risa: 0, boca: 0, sonrisa: .5, o: 0, mirar: [0, 0], rubor: .6 } : { ojos: 1, risa: 0, boca: 0, sonrisa: .7, o: 0, mirar: [0, 0], branquias: 0, brillo: .3, mitad: 0, llora: 0 });
    const habla = (a, quien, T) => { const b = CINE.boca(quien, externo(T)); if (b) a.cara.boca = b; return b; };

    // ---- 1 · Campeche al caer la tarde (grúa) ----
    plano(0, 6, {
      act(t) {
        TODOS.forEach(a => a.vis = false);
      },
      cam: t => ({ x: claves(t, [[0, -30], [6, 0, 'io2']]), y: 22, z: claves(t, [[0, 1.08], [6, 1, 'out2']]), ty: claves(t, [[0, -440], [5.3, 0, 'io3']]) }),
      dib(ctx, t, c, M) {
        const o = { solY: 22, foco: { d: .5, k: .25 }, parejos: true };
        mundo(ctx, c, o, M);
        actor(ctx, c, itz);
        frente(ctx, c, [['palma', 470, 300, 1.5, .9], ['bugambilia', -330, 248, 1.4, .9]], M);
        // rótulo de lugar, letra por letra
        CAMPECHE_TOMAS.rotulo(ctx, M, t, 'San Francisco de Campeche', 'su malecón, al caer la tarde', 2.3, 5.9);
        if (t < .9) grado(ctx, M, '#0d0806', 1 - EASE.out2(t / .9));
      },
    });
    // la voz de cuento: una manta se desenrolla arriba y la frase se va bordando, letra por letra (es la letra del juego,
    // distinta de la de los rótulos de lugar)
    const CUENTO = opc.final ? [['Itzel siguió pasando sus días', 21, 26.5, 0], ['divirtiéndose con sus nuevos amigos', 22.7, 26.5, 1]]
      : [['Había una niña llamada Itzel', 6.3, 9.2, 0], ['que jugaba todas las tardes', 9.5, 11.95, 0], ['y soñaba con grandes aventuras', 12.5, 16.2, 0]];
    function narra(ctx, M, T) { CUENTO.forEach((q, i) => { if (T >= q[1] && T < q[2]) manta(ctx, M, T, i, q); }); }
    function manta(ctx, M, T, i, [, t0, t1, fila]) {
      const F = C.frases[i], t = T - t0, esc = .26, W = F.c.width * esc, H = F.c.height * esc, ab = EASE.out3(clamp(t / .4, 0, 1)) * (1 - tramo(T, t1 - .35, t1));
      if (ab <= 0) return;
      const cw = (W + 30) * ab, ch = H + 10, y = M.y0 + 50 + fila * (ch + 6), n = Math.floor(clamp((t - .35) / .05, 0, F.fin.length - 1)), rx = F.fin[n] * esc;
      ctx.save(); ctx.fillStyle = 'rgba(40,20,20,.3)'; ctx.fillRect(-cw / 2 + 2, y + 3, cw, ch);
      ctx.fillStyle = '#f6ecdb'; ctx.fillRect(-cw / 2, y, cw, ch);
      ctx.beginPath(); ctx.rect(-cw / 2, y, cw, ch); ctx.clip();
      ctx.strokeStyle = 'rgba(200,32,58,.6)'; ctx.lineWidth = 1; ctx.setLineDash([3.4, 2.6]); ctx.strokeRect(-cw / 2 + 3.5, y + 3.5, cw - 7, ch - 7); ctx.setLineDash([]);
      const lx = -W / 2, ly = y + 5;
      ctx.save(); ctx.beginPath(); ctx.rect(lx, ly - 2, rx, H + 4); ctx.clip(); ctx.drawImage(F.c, lx, ly, W, H); ctx.restore();
      if (n < F.fin.length - 1) { ctx.strokeStyle = '#8a8a96'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lx + rx, ly + H * .7); ctx.lineTo(lx + rx + 6, ly + H * .1); ctx.stroke(); }
      ctx.restore();
    }

    // ---- 2 · el avioncito (travelling) ----
    // Itzel juega sola: avienta la piedrita al 3, brinca de cojito en las casillas sencillas y con los
    // dos pies en las dobles, llega al cielo, da la vuelta de un salto, se tambalea y va por la piedrita
    const PISO2 = 164; // juega en las losas, un poco delante del pretil
    const AV = { x0: -250, w: 18, celdas: [['1', 1], ['2', 1], ['3', 1], ['4', 2], ['6', 1], ['7', 2]] }; // número y si es doble
    const celdaX = i => AV.x0 + AV.w * (i + .5), CIELO_X = AV.x0 + AV.w * 6 + 10;
    // [empieza, cae, x de llegada, altura, pies (1 = de cojito), especial]
    const BRINCOS = [[1.0, 1.36, celdaX(0), 7, 1], [1.42, 1.78, celdaX(1), 7, 1], [1.84, 2.32, celdaX(3), 10, 2], [2.38, 2.74, celdaX(4), 7, 1], [2.8, 3.16, celdaX(5), 7, 2], [3.22, 3.66, CIELO_X, 11, 2],
      [3.95, 4.35, CIELO_X, 10, 2, 'vuelta'], [4.45, 4.81, celdaX(5), 7, 2], [4.87, 5.23, celdaX(4), 7, 1], [5.5, 5.86, celdaX(3), 8, 2]];
    function itzS2(t) {
      let xa = AV.x0 - 12, face = 1, pies = 2, fin = 0;
      if (t < BRINCOS[0][0]) return { x: xa, y: PISO2, m: 'tira', pies, face };
      for (const [a, b, xb, h, p, esp] of BRINCOS) {
        if (t < a) return { x: xa, y: PISO2, m: 'parada', pies, face, k: t - fin };
        if (t < b) {
          const u = (t - a) / (b - a);
          if (esp === 'vuelta') return { x: xa, y: PISO2 - Math.sin(u * Math.PI) * h, m: 'aire', u, pies: 2, face: u < .5 ? face : -face, vuelta: u };
          const [x, y] = arco(u, xa, PISO2, xb, PISO2, h); return { x, y, m: 'aire', u, pies: p, face };
        }
        if (esp === 'vuelta') face = -face;
        xa = xb; pies = p; fin = b;
      }
      return { x: xa, y: PISO2, m: 'parada', pies, face, k: t - fin };
    }
    const SUELTA = .38; let manoSuelta = null; // dónde estaba su mano al soltarla
    function piedrita(t) {
      const xd = celdaX(2), [x0, y0] = manoSuelta || [AV.x0 - 7, PISO2 - 25];
      if (t < SUELTA) return null;
      if (t < .85) { const [x, y] = arco((t - SUELTA) / (.85 - SUELTA), x0, y0, xd, PISO2 - 1, 14); return [x, y, (t - SUELTA) * 18]; }
      const k = t - .85; return [xd + Math.min(k, .2) * 8, PISO2 - 1 - (k < .2 ? Math.sin(k / .2 * Math.PI) * 2 : 0), 0];
    }
    plano(6, 12, {
      act(t) {
        TODOS.forEach(a => a.vis = false); itz.vis = true; ini(itz);
        const s = itzS2(t), P = itz.pose; itz.x = s.x; itz.y = s.y; itz.face = s.face; P.sq = 0;
        P.piedra = false; P.exacto = s.m === 'tira';
        // las poses dibujadas: la piedrita en la mano, echa el brazo atrás, la suelta; brinca, cae de cojito o con los dos pies…
        itz.cuerpo = s.m === 'tira' ? (t < .14 ? 'tiene' : t < .34 ? 'tira-atras' : t < .75 ? 'tira-suelta' : 'parada')
          : s.m === 'aire' ? (s.vuelta !== undefined ? 'vuelta' : 'brinco') : s.pies === 1 ? 'cojito' : 'parada';
        if (s.m === 'tira' && t < SUELTA && itz._mano) manoSuelta = itz._mano.slice(); // de su mano sale la piedrita if (P.piedra && itz._mano) manoSuelta = itz._mano.slice(); // la lleva en la mano hasta soltarla
        if (s.m === 'tira') { // avienta la piedrita
          ACTOR.POSE.quieta(itz, t); const u = tramo(t, 0, .33, 'io2'), v = tramo(t, .33, .46, 'out3');
          P.bD = [lerp(lerp(.12, -.75, u), 1.1, v), lerp(lerp(.45, .3, u), .12, v)]; // por abajo, como se tira en el avioncito P.lean = .05 + v * .12 - u * .08;
          Object.assign(itz.cara, { mirar: [.8, .5], sonrisa: .7, cejas: .2 });
        } else if (s.m === 'aire') {
          Object.assign(P, { lean: .12, cabeza: -.05, agacha: -1.5, bob: 0, bD: [.9, .6], bT: [.7, .5], pD: [.45, 1.0], pT: s.pies === 1 ? [-.5, 1.8] : [-.2, 1.1] });
          if (s.u < .15) P.sq = -.2;
          Object.assign(itz.cara, { mirar: [.6, .6], sonrisa: .7, boca: .25 });
          if (s.vuelta !== undefined) { P.bD = [1.8, -.35]; P.bT = [-1.8, .35]; itz.cara.risa = 1; itz.cara.boca = .8; }
        } else { // cae y se para: de cojito o con los dos pies
          const ap = Math.max(0, 1 - (s.k ?? 1) / .14);
          ACTOR.POSE.quieta(itz, t); P.agacha = ap * 3; P.sq = ap * .22;
          if (s.pies === 1) { P.pT = [-.55, 1.9]; P.pD = [.02, .08]; P.bD = [.7, .5]; P.bT = [-.6, .4]; }
          else { P.pD = [.16, .18]; P.pT = [-.16, .18]; }
          Object.assign(itz.cara, { mirar: [.6, .6], sonrisa: .6, cejas: .25 });
        }
        // en el cielo: brazos abiertos y carcajada (sus brazos son cortos: hacia arriba le taparían la cara)
        if (t > 3.66 && t < 3.95) { P.bD = [1.8, -.35]; P.bT = [-1.8, .35]; itz.cara.risa = 1; itz.cara.boca = .9; P.sq = Math.sin(tramo(t, 3.66, 3.8, 'lin') * Math.PI) * .2; }
        // de cojito en el 6 se tambalea y abre los brazos para no caerse
        if (t > 5.23 && t < 5.5) { const w = Math.sin((t - 5.23) * 22) * (1 - tramo(t, 5.23, 5.5, 'lin')); P.lean = w * .22; P.bD = [1.6 + w, .2]; P.bT = [1.4 - w, .2]; Object.assign(itz.cara, { o: .5, cejas: .8, ojos: 1.2, mirar: [.5, .8] }); itz.cuerpo = 'tambalea'; }
        // se agacha por la piedrita
        if (t > 5.86) { const u = tramo(t, 5.86, 6, 'out2'); ACTOR.POSE.agachada(itz, u * .9); P.bD = [lerp(.12, .9, u), .2]; itz.cara.mirar = [.8, .9]; if (u > .3) itz.cuerpo = 'recoge'; }
      },
      cam(t) { const xs = (itzS2(t).x + itzS2(Math.max(0, t - .3)).x + itzS2(Math.max(0, t - .6)).x) / 3; return encuadra(1.6, 1.9, [xs + 8, PISO2 - 30, 1, -20, 40], [0, HORIZ, .04, null, -46]); },
      dib(ctx, t, c, M) {
        const T = Tglob, o = { solY: 25, foco: { d: 1, k: .5 } };
        mundo(ctx, c, o, M);
        ctx.save(); aplica(ctx, c, 1);
        ctx.fillStyle = 'rgba(70,30,40,.22)'; ctx.beginPath(); ctx.ellipse(itz.x + 18, PISO2 + .5, Math.max(3, 22 * (1 - (PISO2 - itz.y) / 70)), 2.6, 0, 0, TAU); ctx.fill();
        // polvito de gis en cada caída
        for (const [, b] of BRINCOS) { const k = (t - b) / .45; if (k <= 0 || k >= 1) continue; const s = itzS2(b + .01); ctx.globalAlpha = (1 - k) * .7; ctx.fillStyle = '#f6efe2'; for (let i = 0; i < 7; i++) { const an = Math.PI + i / 6 * Math.PI, r = 3 + EASE.out2(k) * 9; ctx.beginPath(); ctx.arc(s.x + Math.cos(an) * r, PISO2 + Math.sin(an) * r * .35 - k * 3, .9 * (1 - k) + .4, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
        const pq = piedrita(t);
        if (pq) { ctx.save(); ctx.translate(pq[0], pq[1]); ctx.rotate(pq[2]); ctx.fillStyle = '#5e5664'; ctx.beginPath(); ctx.ellipse(0, 0, 2.6, 1.5, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,230,200,.5)'; ctx.beginPath(); ctx.ellipse(-.8, -.6, 1, .5, 0, 0, TAU); ctx.fill(); ctx.restore(); }
        if (t > .85 && t < 1.25) { const k = (t - .85) / .4; ctx.globalAlpha = 1 - k; ctx.fillStyle = '#f6efe2'; for (let i = 0; i < 5; i++) { const an = Math.PI + i / 4 * Math.PI; ctx.beginPath(); ctx.arc(celdaX(2) + Math.cos(an) * (2 + k * 6), PISO2 + Math.sin(an) * (1 + k * 2), .6, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
        ctx.restore();
        actor(ctx, c, itz, { bordes: [{ c: '#ffcf86', dx: -1, dy: -.2, d: 1.2, a: .8 }] });
        frente(ctx, c, [['palma', -262, 300, 1.45, 1.2], ['palma', -40, 300, 1.45, 1.1]], M);
        hojas(ctx, M, T, 14, 40);
        narra(ctx, M, T);
      },
    });

    // ---- 3 · contraluz en el pretil ----
    plano(12, 17, {
      act(t) {
        TODOS.forEach(a => a.vis = false); itz.vis = true; ini(itz);
        // de espaldas a la cámara, sentada del lado del mar, viendo el sol (las piernas cuelgan del otro lado del pretil)
        itz.vista = 'espalda'; itz.sinPiernas = true; itz.face = 1; itz.x = -26; itz.y = sentadaY; ACTOR.POSE.sentada(itz, t, 1 - tramo(t, 3, 4.5) * .6); itz.viento = [-60, 0];
      },
      cam: t => encuadra(1.8, claves(t, [[0, 2.2], [5, 2.45, 'io2']]), [-27.5, 99, 1, 62, 0], [SOL_X, 30, .04, -62, -44]),
      dib(ctx, t, c, M) {
        const T = Tglob, o = { solY: lerp(25, 33, t / 5), foco: { d: 1, k: 1.7 } };
        mundo(ctx, c, o, M);
        rayos(ctx, c, o.solY, T, .8);
        const fx = { tinte: ['#3a1c2a', .5], bordes: [{ c: '#ffc870', dx: -1, dy: -.25, d: 1.1, a: .9 }, { c: '#fff2c8', dx: -1, dy: -.3, d: .45, a: .95 }] };
        actor(ctx, c, itz, fx);
        destello(ctx, c, o.solY, .6);
        narra(ctx, M, T);
      },
    });
    function rayos(ctx, c, solY, T, a) {
      const [sx, sy] = pant(c, .04, SOL_X, solY);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 7; i++) { const an = -.55 + i * .2 + Math.sin(T * .3 + i) * .03, w = .035 + hash1(i, 2) * .04; ctx.globalAlpha = a * (.05 + hash1(i, 3) * .05); ctx.fillStyle = '#ffd890'; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(an - w) * 900, sy + Math.sin(an - w) * 900); ctx.lineTo(sx + Math.cos(an + w) * 900, sy + Math.sin(an + w) * 900); ctx.fill(); }
      ctx.restore();
    }
    function destello(ctx, c, solY, a) { // reflejos de lente sobre la línea sol-centro
      const [sx, sy] = pant(c, .04, SOL_X, solY);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const [k, r, col, al] of [[.35, 9, '#ffd080', .12], [.7, 5, '#a0e0ff', .1], [1.25, 16, '#ff9a60', .08], [1.6, 4, '#ffffff', .15]]) { const x = sx + (0 - sx) * k * 2, y = sy + (0 - sy) * k * 2; ctx.globalAlpha = a * al; ctx.fillStyle = col; ctx.beginPath(); for (let i = 0; i < 6; i++) { const an = i / 6 * TAU; ctx.lineTo(x + Math.cos(an) * r, y + Math.sin(an) * r); } ctx.fill(); }
      ctx.restore();
    }

    // ---- 4 · el horizonte se descompone ----
    const camS4 = { x: -40, y: 30, z: 1 };
    plano(17, 21, {
      act() { TODOS.forEach(a => a.vis = false); },
      cam(t) { const [lx, ly] = pant(camS4, .04, SOL_X, HORIZ - 2); return Object.assign({}, camS4, { L: claves(t, [[0, 3.3], [1.9, 3.7, 'io2'], [3.9, 1.85, 'io2']]), lx, ly: ly + 2 }); },
      dib(ctx, t, c, M) {
        // el mundo se detiene: las olas, el reflejo y las aves se frenan hasta quedarse quietos (el reloj del mundo, tm)
        const tm = t < 1 ? t : t < 2 ? 1 + (t - 1) - (t - 1) * (t - 1) / 2 : 1.5, Tm = Tglob - t + tm, solY = lerp(31, 60, EASE.io2(tramo(t, 0, 2.4, 'lin'))); // se mete del todo antes de la rendija
        mundo(ctx, c, { solY, foco: null, sinMalecon: true, T: Tm }, M);
        if (t > 1) grado(ctx, M, '#888888', tramo(t, 1.1, 2.2) * .5, 'saturation'); // se le va el color
        grietaHorizonte(ctx, c, t, Tglob);
        if (t > 3.3) grado(ctx, M, '#2a3a6a', tramo(t, 3.3, 4) * .25, 'multiply');
        if (t > 3.3 && t < 3.6) grado(ctx, M, '#ffe8f6', (1 - (t - 3.3) / .3) * .32, 'lighter');
      },
    });

    // ---- 5 · primer plano de Itzel; cambio de foco a las cuatro luces que vienen huyendo ----
    // ---- 5 · desde los ojos de Itzel: voltea, ve acercarse a los ajolotes y parpadea ----
    // no se ve a Itzel: la cámara es su cabeza. Mira el horizonte, nota las lucecitas, voltea hacia ellas,
    // se inclina un poco para verlas mejor y parpadea (una vez rápido y otra despacio, sin creérselo)
    const PARPADEOS = [[.55, .2], [2.75, .42]]; // [cuándo, cuánto dura]
    function parpado(ctx, M, t, lista = PARPADEOS) {
      let k = 0; for (const [a, d] of lista) if (t > a && t < a + d) k = Math.max(k, Math.sin((t - a) / d * Math.PI));
      if (k <= .01) return;
      const W = M.x1 - M.x0 + 8, alto = (M.y1 - M.y0) / 2 + 30, cierra = alto * EASE.io2(k), x0 = M.x0 - 4;
      ctx.save(); ctx.fillStyle = '#0b0608'; ctx.shadowColor = 'rgba(11,6,8,.9)'; ctx.shadowBlur = 26 * M.k;
      for (const s of [-1, 1]) { // el párpado de arriba baja y el de abajo sube, con la orilla curva
        const borde = s < 0 ? M.y0 - 30 + cierra : M.y1 + 30 - cierra * .8, curva = 38 * (1 - k * .6) * s;
        ctx.beginPath(); ctx.moveTo(x0, s < 0 ? M.y0 - 60 : M.y1 + 60); ctx.lineTo(x0, borde); ctx.quadraticCurveTo(0, borde - curva, x0 + W, borde); ctx.lineTo(x0 + W, s < 0 ? M.y0 - 60 : M.y1 + 60); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    plano(21, 25, {
      act() { TODOS.forEach(a => a.vis = false); },
      cam(t) {
        // la cabeza: voltea hacia las luces (de la derecha al centro), se acerca un poco y nunca está quieta del todo
        const gira = tramo(t, 1.5, 2.6, 'io2'), mira = lerp(120, 0, gira), L = claves(t, [[0, 2.6], [1.5, 2.6], [3.4, 3.05, 'io2'], [4, 3.1]]);
        const sx = (noise1(t * .9, 3) - .5) * 9, sy = (noise1(t * .8, 7) - .5) * 6 + Math.sin(t * 1.9) * 1.6;
        return encuadra(2, L, [-150, 126, 1, mira + 40 + sx, 150 + sy], [-232, 41, .06, mira + sx * .4, -6 + sy * .5], { rot: (noise1(t * .6, 11) - .5) * .03 - gira * .02 });
      },
      dib(ctx, t, c, M) {
        const T = Tglob, fd = claves(t, [[1.45, .4], [2.4, .06, 'io3']]), foco = { d: fd, k: 1.6 };
        // se acercan de verdad: se vienen hacia el malecón, crecen y van tranquilos (sin sacudirse)
        const ven = i => EASE.io2(clamp((t - 1.7 - i * .15) / 2.3, 0, 1));
        const luces = [[COL.azul, -226, .07, tramo(t, 1.6, 2), azul], [COL.naranja, -214, .066, tramo(t, 2.0, 2.4), nar], [COL.violeta, -244, .062, tramo(t, 2.4, 2.8), vio], [COL.fresita, -234, .06, tramo(t, 2.8, 3.2), fre]]
          .map(([col, x, d, a, aj], i) => [col, x + Math.sin(T * 2.2 + i * 2) * 3 * (1 - ven(i)) + [-17, 55, 57, 19][i] * ven(i), d + ven(i) * (.1 + i * .012), a, aj, [9, 15, 21, 12][i] * ven(i), 1.001 + ven(i) * 1.35]);
        mundo(ctx, c, { solY: 62, foco, luces, reflejoK: .5, sinMalecon: true }, M); // está sentada en el pretil: frente a ella solo hay mar
        grado(ctx, M, '#2a3060', .16, 'multiply');
        // el borde de la vista: un poco de sombra en las orillas, como cuando uno mira
        { const g = ctx.createRadialGradient(0, 0, (M.x1 - M.x0) * .32, 0, 0, (M.x1 - M.x0) * .7); g.addColorStop(0, 'rgba(20,10,20,0)'); g.addColorStop(1, 'rgba(20,10,20,.42)'); ctx.fillStyle = g; ctx.fillRect(M.x0 - 4, M.y0 - 4, M.x1 - M.x0 + 8, M.y1 - M.y0 + 8); }
        parpado(ctx, M, t);
      },
    });

    // ---- 6 · se rasga el cielo: salen huyendo los ajolotes y detrás, la Ruptura ----
    // salen de la grieta a la hora a (tiempo de la cinemática), se clavan al mar y vienen hacia el malecón
    // x0, d0: donde quedaron en la toma de sus ojos (se venían hacia ella); desde ahí siguen
    // x1, d1: ya cerca del malecón, donde se quedan hasta que la Ruptura los jala de golpe hacia atrás
    const HUYE = {
      fresita: { a: 25.0, x0: -120, d0: .5, x1: -96, d1: .64, ph: 0, ond: 12 },
      azul: { a: 25.1, x0: -190, d0: .46, x1: -168, d1: .6, ph: 2, ond: 9 },
      naranja: { a: 25.2, x0: -150, d0: .48, x1: -134, d1: .62, ph: 4, ond: 14 },
      violeta: { a: 25.3, x0: -228, d0: .44, x1: -206, d1: .58, ph: 1, ond: 10 },
    };
    const TIRA = 27.6; // cuando sale la Ruptura: los jala hacia ella
    // dónde queda cada uno al ser agarrado: en la punta de un tentáculo distinto (ángulos de sus propios tentáculos, arriba del horizonte)
    const SLOT = { fresita: -2.85, azul: 2.5, naranja: .62, violeta: -.3 }, RADIO_SLOT = 82, RUP_X = RIFT_X + 4, RUP_Y = -78;
    const ATRAPA = 33.0; // cuándo los alcanza la Ruptura (el rescate de Fresita, en S7)
    const AJOS = [['fresita', fre], ['azul', azul], ['naranja', nar], ['violeta', vio]];
    function huye(nombre, T) {
      // 1 · siguen acercándose (como en la toma de los ojos de Itzel) hasta quedar frente al malecón
      const R = HUYE[nombre], v = EASE.out2(clamp((T - R.a) / (TIRA - R.a), 0, 1)), dA = lerp(R.d0, R.d1, v), xA = lerp(R.x0, R.x1, v) + Math.sin(T * 2.2 + R.ph) * 3;
      const yA = yMar(dA) - 4 - Math.abs(Math.sin(T * 2.6 + R.ph)) * 3 * dA - v * 10;
      // 2 · de pronto la Ruptura los jala hacia atrás, hasta ella; ahí forcejean
      const w = clamp((T - TIRA - R.ph * .04) / 1.1, 0, 1), e = 1 - Math.pow(1 - w, 3); if (w <= 0) return { x: xA, y: yA, d: dA, u: 0, sale: true };
      const an = SLOT[nombre], forcejeo = Math.sin(T * 13 + R.ph) * 2.2 * w, d = lerp(R.d1, .06, e);
      const x = lerp(R.x1, RUP_X + Math.cos(an) * RADIO_SLOT, e) + forcejeo;
      return { x, y: lerp(yA, RUP_Y + Math.sin(an) * RADIO_SLOT, e) + Math.cos(T * 11 + R.ph) * 2 * w, d, u: .01 + e, sale: true };
    }
    function ponHuye(a, nombre, T) {
      const r = huye(nombre, T), base = nombre === 'azul' ? SZ : nombre === 'fresita' ? SF : SA;
      a.vis = r.sale; a.x = r.x; a.y = r.y; a._d = r.d; a.s = base * (.1 + .9 * Math.pow(r.d, 1.15)) * lerp(2.3, 1.55, Math.min(1, r.u * 1.2)) * (r.d < .2 ? 7.4 : 1); a.face = 1; // de cerca, del tamaño con que Itzel los vio llegar
      a.pose.giro = Math.sin(T * 9 + HUYE[nombre].ph) * .12; a.pose.nado = 1.8; a.pose.cola = 1.5;
      if (r.u <= 0) { a.pose.giro = Math.sin(T * 2 + HUYE[nombre].ph) * .05; Object.assign(a.cara, { ojos: 1, o: 0, branquias: .5, brillo: 1, llora: 0 }); } // vienen tranquilos hacia ella
      else Object.assign(a.cara, { ojos: 1.3, o: .5, branquias: .8, brillo: 1.1, llora: r.u > .6 ? 1 : 0 }); // los jala: asustados y luego llorando
      return r;
    }
    // la Ruptura: la forma «Sombra» de la hoja del jefe final, en el cielo (profundidad de la grieta)
    function ruptura(ctx, c, R, T) {
      if (!R || R.a <= 0) return;
      const s = R.s / 100 * (1 + Math.sin(T * 2.1) * .025), base = ctx.getTransform(); // su cuerpo mide unas 100 de ancho (ruptura-cuerpo.js)
      ctx.save(); aplica(ctx, c, .06); ctx.translate(R.x, R.y);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R.s * .9); g.addColorStop(0, `rgba(255,80,210,${.45 * R.a})`); g.addColorStop(.4, `rgba(140,60,220,${.18 * R.a})`); g.addColorStop(1, 'rgba(60,20,90,0)'); ctx.fillStyle = g; ctx.fillRect(-R.s, -R.s, R.s * 2, R.s * 2); ctx.restore();
      ctx.save(); ctx.rotate(Math.sin(T * .7) * .05 + (R.rot || 0)); ctx.globalAlpha = R.a; ctx.scale(s, s);
      // los tentáculos que agarran son los suyos: sus blancos (en el cuadro) pasan a sus unidades
      const inv = ctx.getTransform().inverse(), alcances = (R.alcances || []).map(q => { const p = inv.transformPoint(base.transformPoint(new DOMPoint(q.x, q.y))); return { x: p.x, y: p.y, k: q.k }; });
      RUPTURA.dibuja(ctx, 0, T, { alcances }); // la forma «Sombra», dibujada a la resolución de la pantalla
      ctx.restore();
      // el núcleo late; con R.flash destella en cruz
      ctx.globalCompositeOperation = 'lighter'; const fl = R.flash || 0, n = (.6 + .4 * Math.sin(T * 5)) * R.a + fl * 2, rn = R.s * (.12 + fl * .5);
      const gn = ctx.createRadialGradient(0, 0, 0, 0, 0, rn); gn.addColorStop(0, `rgba(255,255,255,${Math.min(1, n)})`); gn.addColorStop(.3, `rgba(255,120,230,${Math.min(1, n * .8)})`); gn.addColorStop(1, 'rgba(255,60,200,0)'); ctx.fillStyle = gn; ctx.fillRect(-rn, -rn, rn * 2, rn * 2);
      if (fl > .05) { ctx.strokeStyle = `rgba(255,220,250,${fl})`; ctx.lineWidth = 1.2; for (let i = 0; i < 4; i++) { const an = i * Math.PI / 4 + .2, L = R.s * 1.4 * fl; ctx.beginPath(); ctx.moveTo(-Math.cos(an) * L, -Math.sin(an) * L); ctx.lineTo(Math.cos(an) * L, Math.sin(an) * L); ctx.stroke(); } }
      ctx.restore();
    }
    function resplandorGrieta(ctx, c, M, a) {
      if (a <= 0) return; const [rx, ry] = pant(c, .06, RIFT_X, -60);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const lg = ctx.createRadialGradient(rx, ry, 0, rx, ry, 360); lg.addColorStop(0, `rgba(120,220,255,${.28 * a})`); lg.addColorStop(.5, `rgba(255,80,200,${.08 * a})`); lg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = lg; ctx.fillRect(M.x0, M.y0, M.x1 - M.x0, M.y1 - M.y0); ctx.restore();
    }
    function ojoGrieta(ctx, c, T, a) { // el núcleo de la Ruptura, muy adentro de la grieta
      const [x, y, zd] = pant(c, .06, RIFT_X, -78), r = 13 * zd * (1 + .15 * Math.sin(T * 4));
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5); g.addColorStop(0, `rgba(255,255,255,${.9 * a})`); g.addColorStop(.2, `rgba(255,90,220,${.7 * a})`); g.addColorStop(1, 'rgba(120,30,160,0)'); ctx.fillStyle = g; ctx.fillRect(x - r * 2.5, y - r * 2.5, r * 5, r * 5); ctx.restore();
    }
    function orbe(ctx, x, y, r, col, T, k) {
      if (k <= 0) return;
      ctx.save(); ctx.translate(x, y); const s = EASE.outBack(clamp(k, 0, 1)); ctx.scale(s, s);
      ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(0, 0, r * .3, 0, 0, r * 1.6); g.addColorStop(0, rgba(col, .12)); g.addColorStop(.65, rgba(col, .38)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fillRect(-r * 1.6, -r * 1.6, r * 3.2, r * 3.2);
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = rgba(col, .2); ctx.fill(); ctx.lineWidth = r * .09; ctx.strokeStyle = 'rgba(255,79,216,.9)'; ctx.stroke(); ctx.lineWidth = r * .035; ctx.strokeStyle = '#ffffff'; ctx.stroke();
      for (let i = 0; i < 8; i++) { const an = i / 8 * TAU + T * 1.6; ctx.save(); ctx.translate(Math.cos(an) * r, Math.sin(an) * r); ctx.rotate(an); ctx.fillStyle = '#1c1028'; ctx.fillRect(-r * .09, -r * .09, r * .18, r * .18); ctx.strokeStyle = '#ff9ae6'; ctx.lineWidth = r * .025; ctx.strokeRect(-r * .055, -r * .055, r * .11, r * .11); ctx.restore(); }
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(-r * .38, -r * .4, r * .2, r * .1, -.6, 0, TAU); ctx.fill();
      ctx.restore();
    }
    // dibuja un actor en otro lugar y tamaño de la pantalla (escala alrededor de su posición)
    function actorMovido(ctx, c, a, [x, y], k, o) {
      const [ax, ay] = pant(c, a._d ?? 1, a.x, a.y);
      ctx.save(); ctx.translate(x - ax * k, y - ay * k); ctx.scale(k, k); actor(ctx, c, a, Object.assign({ d: a._d ?? 1 }, o)); ctx.restore();
    }
    // estelas, salpicaduras y ajolotes que huyen (de lejos a cerca); cuando(n) = hora de cada uno
    function ajolotesHuyendo(ctx, c, M, cuando, foco) {
      const lista = AJOS.filter(([, a]) => a.vis && !a._atrapado && !a._vuela).sort((p, q) => p[1]._d - q[1]._d);
      for (const [nom, a] of lista) {
        const col = COL[nom], Th = cuando(nom);
        if (!a._quieto) for (let j = 14; j >= 1; j--) { const r = huye(nom, Th - j * .035); if (!r.sale) continue; const [px, py, zd] = pant(c, r.d, r.x, r.y); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - j / 15) * .55; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px, py, (1 + 7 * r.d) * zd * (1 - j / 18), 0, TAU); ctx.fill(); ctx.restore(); }
        for (let k = 0; k < 9; k++) { const ts = HUYE[nom].a + .9 + k * .55; if (Th < ts || ts > TIRA) continue; const r = huye(nom, ts); const [px, py, zd] = pant(c, r.d, r.x, yMar(r.d)); salpica(ctx, px, py, (Th - ts) / .7, zd * (.3 + r.d * 1.2), col); }
        actor(ctx, c, a, { d: a._d, bordes: [{ c: '#ffffff', dx: 0, dy: -1, d: 1, a: .35 }], blur: desen(foco, a._d) * 2 * M.k });
        if (a._d > .45) { ctx.save(); aplica(ctx, c, a._d); chispitas(ctx, a.x, a.y, 12, Tglob + nom.length, col, 5); ctx.restore(); }
      }
    }
    plano(25, 31, {
      act(t, T) {
        TODOS.forEach(a => { a.vis = false; ini(a); a._atrapado = 0; a._vuela = 0; a._quieto = false; });
        for (const [n, a] of AJOS) ponHuye(a, n, T);
      },
      // sigue desde los ojos de Itzel: la cabeza nunca está quieta, se echa un poco atrás cuando sale la Ruptura y tiembla con el destello
      cam: t => {
        const sx = (noise1(t * .9, 3) - .5) * 9, sy = (noise1(t * .8, 7) - .5) * 6 + Math.sin(t * 1.9) * 1.4, sacude = Math.max(0, 1 - Math.abs(t - 3.2) / 1.2), atras = tramo(t, 2.5, 3.6, 'io2');
        return encuadra(1.25, claves(t, [[0, 1.3], [6, 1.45, 'io2']]), [RIFT_X, -40, .06, 70 + sx * .5, -64 + sy * .5 + atras * 8], [-120, 120, dMar(120), 30 + sx, 182 + sy], // la grieta un poco a la derecha: el sol sigue a la izquierda
          { rot: (noise1(t * .6, 11) - .5) * .03, sx: (noise1(t * 7, 6) - .5) * 5 * sacude, sy: (noise1(t * 7, 7) - .5) * 4 * sacude });
      },
      dib(ctx, t, c, M) {
        const T = Tglob;
        const g = { alto: t < .6 ? 0 : EASE.out3(clamp((t - .6) / .6, 0, 1)), ancho: t < 1.1 ? 0 : EASE.outElastic(clamp((t - 1.1) / 1.1, 0, 1)) * 84 + Math.sin(T * 1.4) * 4 * tramo(t, 2.2, 3), aspira: tramo(t, 1.4, 2.9) * .35 };
        const sale = EASE.outBack(tramo(t, 2.5, 3.8, 'lin')), R = { x: RIFT_X + 4, y: lerp(-60, -78, sale), s: lerp(30, 200, sale), a: tramo(t, 2.4, 2.8), flash: Math.max(0, 1 - Math.abs(t - 3.3) / .35) };
        const solY = 62;
        mundo(ctx, c, { solY, foco: { d: .2, k: .4 }, reflejoK: .15, grieta: t < .6 ? null : g, sinMalecon: true }, M); // a sus ojos solo está el mar
        grado(ctx, M, '#3e4a8a', .2 + tramo(t, .3, 3) * .38, 'multiply');
        resplandorGrieta(ctx, c, M, tramo(t, 1.1, 2.4));
        R.alcances = AJOS.filter(([n]) => huye(n, T).u > 0).map(([n, a]) => { const [px, py] = pant(c, a._d, a.x, a.y); return { x: px, y: py, k: smooth(0, .5, huye(n, T).u - .01) }; });
        ruptura(ctx, c, R, T);
        ajolotesHuyendo(ctx, c, M, () => T, { d: .2, k: .4 });
        if (t > .6 && t < .85) grado(ctx, M, '#bff8ff', (1 - (t - .6) / .25) * .35, 'lighter');
        if (R.flash > 0) grado(ctx, M, '#ffd0f4', R.flash * .35, 'lighter');
        { const g = ctx.createRadialGradient(0, 0, (M.x1 - M.x0) * .32, 0, 0, (M.x1 - M.x0) * .7); g.addColorStop(0, 'rgba(20,10,20,0)'); g.addColorStop(1, 'rgba(20,10,20,.42)'); ctx.fillStyle = g; ctx.fillRect(M.x0 - 4, M.y0 - 4, M.x1 - M.x0 + 8, M.y1 - M.y0 + 8); }
        parpado(ctx, M, t, [[.68, .16], [3.3, .24], [4.9, .34]]); // parpadea del susto cuando se rasga, con el destello y otra vez sin creérselo
      },
    });

    // ---- 7 · el secuestro ----
    // el rescate: la Ruptura encierra a Fresita en un cristal; sus tres amigos se avientan contra él hasta
    // romperlo (Fresita sale volando) y solo entonces los atrapan a ellos
    const S7 = { tF: 1.8, golpe: { azul: 2.25, naranja: 2.55, violeta: 2.85 }, rompe: 2.9, cap: { azul: 3.15, naranja: 3.3, violeta: 3.45 } };
    const rupS7 = t => { const se = tramo(t, 5.0, 5.85, 'in3'); return { x: RIFT_X + 4, y: -78 + se * 10, s: 165 * (1 - se * .85), a: 1 - tramo(t, 5.6, 5.95), flash: Math.max(0, 1 - Math.abs(t - 1.95) / .3) * .6 }; };
    const sacudeS7 = t => Math.max(0, 1 - Math.abs(t - 1.9) / .7, ...Object.values(S7.golpe).map(g => .8 * (1 - Math.abs(t - g) / .16)), 1.3 * (1 - Math.abs(t - S7.rompe) / .25));
    // el cristal de Fresita: se forma, se estrella con cada golpe (desde la izquierda, de donde vienen) y revienta
    function cristalFresita(ctx, x, y, r, forma, golpes, rompe, T) {
      if (rompe >= 1 || forma <= 0) return;
      ctx.save(); ctx.translate(x, y);
      const P = [[0, -1.3], [.88, -.58], [.98, .46], [0, 1.2], [-.98, .46], [-.88, -.58]].map(([a, b]) => [a * r, b * r]);
      if (rompe > 0) { // los pedazos salen volando y caen
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 0, 0, r * (1.4 + rompe * 2), '#ffb0f0', .9 * (1 - rompe)); ctx.restore();
        for (let i = 0; i < 12; i++) { const an = i / 12 * TAU + hash1(i, 7) * .4, v = r * (1.5 + hash1(i, 8) * 2.2), px = Math.cos(an) * v * rompe, py = Math.sin(an) * v * rompe + rompe * rompe * r * 2.4, sz = r * (.16 + hash1(i, 9) * .22);
          ctx.save(); ctx.translate(px, py); ctx.rotate(rompe * (4 + i)); ctx.globalAlpha = 1 - rompe; ctx.fillStyle = 'rgba(255,170,236,.55)'; ctx.strokeStyle = '#ffe2fa'; ctx.lineWidth = Math.max(.6, r * .03);
          ctx.beginPath(); ctx.moveTo(-sz, -sz * .4); ctx.lineTo(sz * .7, -sz * .7); ctx.lineTo(sz, sz * .5); ctx.lineTo(-sz * .3, sz * .8); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
        ctx.restore(); return;
      }
      const k = EASE.outBack(clamp(forma, 0, 1)), tiembla = golpes > 0 ? Math.sin(T * 60) * r * .015 * golpes : 0;
      ctx.translate(tiembla, 0); ctx.scale(k, k);
      ctx.beginPath(); P.forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); ctx.closePath();
      ctx.fillStyle = 'rgba(255,130,226,.24)'; ctx.fill();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,190,246,.9)'; ctx.lineWidth = Math.max(.8, r * .05); ctx.stroke();
      // facetas y brillo
      ctx.strokeStyle = 'rgba(255,220,250,.45)'; ctx.lineWidth = Math.max(.5, r * .025); ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); ctx.lineTo(0, -r * .2); ctx.lineTo(P[3][0], P[3][1]); ctx.moveTo(P[1][0], P[1][1]); ctx.lineTo(0, -r * .2); ctx.lineTo(P[5][0], P[5][1]); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = Math.max(.6, r * .04); ctx.beginPath(); ctx.moveTo(-r * .62, -r * .5); ctx.lineTo(-r * .2, -r * 1.0); ctx.stroke();
      ctx.restore();
      // las grietas de cada golpe: salen del lado izquierdo y se ramifican hacia adentro
      ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = Math.max(.6, r * .035); ctx.lineCap = 'round';
      for (let g = 0; g < golpes; g++) {
        const y0 = (g - 1) * r * .42, x0 = -r * .92;
        for (let b = 0; b < 3; b++) { ctx.beginPath(); ctx.moveTo(x0, y0); let px = x0, py = y0; const dir = (b - 1) * .55 + (hash1(g, b) - .5) * .3; for (let s2 = 0; s2 < 4; s2++) { px += Math.cos(dir + (hash1(g * 7 + b, s2) - .5) * .9) * r * (.22 + g * .05); py += Math.sin(dir + (hash1(g * 7 + b, s2 + 9) - .5) * .9) * r * .2; ctx.lineTo(px, py); } ctx.stroke(); }
      }
      ctx.restore();
    }
    plano(31, 37, {
      act(t, T) {
        TODOS.forEach(a => { a.vis = false; ini(a); a._atrapado = 0; a._vuela = 0; a._quieto = false; });
        // Itzel, de pie en el malecón, mira sin poder hacer nada
        // nerviosa: da pasos lentos hacia atrás sin dejar de verla (esta parte de la toma va estirada, así que los pasos son lentos)
        const atras = EASE.io2(tramo(t, .05, 1.7, 'lin'));
        itz.vis = true; itz.face = -1; itz.x = -14 + 16 * atras; itz.y = PISO; ACTOR.POSE.quieta(itz, t); itz.cuerpo = t < 2.85 ? 'retrocede' : 'parada';
        const susto = tramo(t, 1.8, 2.1); itz.pose.lean = -.05 * (1 - susto) - .1 * susto;
        if (t < 1.8) Object.assign(itz.cara, { preocupa: 1, cejas: .7, ojos: 1.2, o: 0, mirar: [.7, -.5] });
        else Object.assign(itz.cara, { preocupa: 0, ojos: 1.25, cejas: 1, o: .3 + .4 * susto, mirar: [.7, -.5] });
        if (t > 2.9 && t < 4.0) { const u = Math.sin(tramo(t, 2.9, 4.0, 'lin') * Math.PI); itz.pose.bD = [lerp(.12, 1.5, u), .2]; itz.pose.lean = .1 * u; } // estira la mano hacia Fresita
        if (t > 4.6) Object.assign(itz.cara, { preocupa: 1, cejas: .4, o: 0, sonrisa: -.3, ojos: 1.1 });
        // todos huyen hasta que los alcanza la Ruptura; Fresita, la primera
        for (const [n, a] of AJOS) ponHuye(a, n, Math.min(T, 31 + (n === 'fresita' ? S7.tF : 2.0)));
        // los tres se avientan contra el cristal de Fresita, uno tras otro, y rebotan
        const F = [fre.x, fre.y];
        for (const [n, a] of [['azul', azul], ['naranja', nar], ['violeta', vio]]) {
          if (t < 1.9) continue;
          a._quieto = true; const g = S7.golpe[n], p0 = [a.x, a.y], tgt = [F[0] - 9, F[1] + (n === 'naranja' ? -2 : n === 'violeta' ? 2 : 0)];
          let u = 0; if (t > g - .3 && t <= g) u = EASE.in2((t - (g - .3)) / .3); else if (t > g && t < g + .35) u = 1 - EASE.out2((t - g) / .35);
          a.x = lerp(p0[0], tgt[0], u); a.y = lerp(p0[1], tgt[1], u) + Math.sin(T * 5 + a.x) * .6; a.face = 1; a.pose.giro = u > .5 ? -.3 : Math.sin(T * 9) * .12;
          Object.assign(a.cara, { ojos: 1.2, o: u > .8 ? .9 : .4, cejas: 1, branquias: 1 });
          // y luego los atrapan a ellos
          const k = t - S7.cap[n]; if (k > 0) { a._atrapado = k; a.pose.giro = Math.sin(T * 14 + g * 9) * .25; Object.assign(a.cara, { o: .8, ojos: 1.4, branquias: 1, llora: 1 }); a.pose.nado = 3; }
        }
        // Fresita: encerrada en el cristal; al reventar sale volando hacia el malecón
        if (t > S7.tF && t < S7.rompe) { fre._quieto = true; fre.pose.giro = Math.sin(T * 20) * .08; Object.assign(fre.cara, { ojos: .35, o: .7, branquias: 1 }); }
        if (t >= S7.rompe) { const u = clamp((t - S7.rompe) / 1.0, 0, 1); fre._vuela = u; fre.vis = u < 1; fre.pose.giro = u * TAU * 2.2; Object.assign(fre.cara, { ojos: .1, o: .8 }); }
      },
      cam: t => {
        const tiembla = { sx: (noise1(t * 9, 7) - .5) * 6 * sacudeS7(t), sy: (noise1(t * 9, 8) - .5) * 5 * sacudeS7(t) };
        const lejos = encuadra(1.35, claves(t, [[0, 1.3], [2, 1.42, 'out2'], [6, 1.5]]), [-14, 116, 1, 250, 56], [RIFT_X, -60, .06, -70, -80], tiembla);
        // durante el rescate la cámara se acerca al cristal, y se aleja cuando Fresita sale volando
        const cerca = tramo(t, 1.65, 2.1, 'io2') * (1 - tramo(t, 2.95, 3.4, 'io2')); if (cerca <= 0) return lejos;
        const F = huye('fresita', 31 + S7.tF);
        return mezcla(lejos, encuadra(1.35, claves(t, [[1.65, 2.6], [2.95, 2.85]]), [F.x - 14, F.y, F.d, 0, 6], null, tiembla), cerca);
      },
      dib(ctx, t, c, M) {
        const T = Tglob, R = rupS7(t), foco = { d: .5, k: .5 };
        mundo(ctx, c, { solY: 62, foco, reflejoK: .1, grieta: { alto: 1, ancho: 84 + Math.sin(T * 1.4) * 5 }, parejos: true }, M);
        grado(ctx, M, '#3e4a8a', .58, 'multiply');
        resplandorGrieta(ctx, c, M, 1);
        const [bx, by] = pant(c, .06, R.x, R.y);
        // sus propios tentáculos se estiran: uno encierra a Fresita y los otros tres atrapan a sus amigos
        R.alcances = [];
        for (const [n, a] of AJOS) {
          const d0 = n === 'fresita' ? S7.tF : S7.cap[n], sale = clamp((t - (d0 - .9)) / .9, 0, 1), sigue = 1 - tramo(t, .15, .6); if (sale <= 0 && sigue <= 0) continue;
          const [px, py] = pant(c, a._d, a.x, a.y), jala = n === 'fresita' ? 0 : tramo(t, S7.cap[n] + .35, S7.cap[n] + 1.8, 'in3');
          const tip = n === 'fresita' ? [px, py] : [lerp(px, bx, jala), lerp(py, by, jala)];
          const recoge = n === 'fresita' ? tramo(t, S7.rompe, S7.rompe + .7) : tramo(t, 5.0 + (S7.cap[n] - S7.cap.azul), 5.8);
          R.alcances.push({ x: tip[0], y: tip[1], k: Math.max(sigue, EASE.outBack(sale) * (1 - recoge)) });
        }
        ruptura(ctx, c, R, T);
        ajolotesHuyendo(ctx, c, M, n => Math.min(T, 31 + (n === 'fresita' ? S7.tF : 2.0)), foco);
        // el cristal de Fresita, con las grietas de cada golpe
        if (t > S7.tF - .05 && fre._vuela < 1) {
          const [px, py, zd] = pant(c, fre._d, fre.x, fre.y), golpes = Object.values(S7.golpe).filter(g => t >= g).length;
          cristalFresita(ctx, px, py, fre.s * 34 * zd * 1.15, (t - S7.tF) / .25, golpes, t >= S7.rompe ? (t - S7.rompe) / .7 : 0, T);
          for (const g of Object.values(S7.golpe)) { const f = (t - g) / .3; if (f > 0 && f < 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, px - fre.s * 34 * zd, py, fre.s * 34 * zd * (.6 + f), '#ffffff', .8 * (1 - f)); ctx.restore(); chispitas(ctx, px - fre.s * 30 * zd, py, fre.s * 30 * zd * (1 + f), T, '#ffd0f6', 7); } }
        }
        // los atrapados, dentro de su orbe, jalados hacia la Ruptura
        for (const n of ['azul', 'naranja', 'violeta']) {
          const a = { azul, naranja: nar, violeta: vio }[n]; if (!a._atrapado) continue;
          const [px, py, zd] = pant(c, a._d, a.x, a.y), jala = tramo(t, S7.cap[n] + .35, S7.cap[n] + 1.8, 'in3'); if (jala >= 1) continue;
          const pos = [lerp(px, bx, jala), lerp(py, by, jala) - Math.sin(jala * Math.PI) * 20], ks = 1 - .85 * jala;
          actorMovido(ctx, c, a, pos, ks, { bordes: [{ c: '#ffffff', dx: 0, dy: -1, d: 1, a: .3 }] });
          orbe(ctx, pos[0], pos[1], a.s * 34 * zd * ks, COL[n], T, a._atrapado / .25);
          if (a._atrapado < .3) grado(ctx, M, '#ffd0f4', (1 - a._atrapado / .3) * .12, 'lighter');
        }
        // Fresita sale volando hacia el malecón, girando
        if (fre._vuela > 0 && fre.vis) { const [ax, ay] = pant(c, fre._d, fre.x, fre.y), e = EASE.in2(fre._vuela); actorMovido(ctx, c, fre, [lerp(ax, M.x1 + 60, e), lerp(ay, -40, e) - Math.sin(fre._vuela * Math.PI) * 50], 1 + e * 2.6, { bordes: [{ c: '#ffffff', dx: 0, dy: -1, d: 1, a: .35 }] }); }
        // Itzel en primer término
        ctx.save(); aplica(ctx, c, 1); ctx.fillStyle = 'rgba(30,20,40,.3)'; ctx.beginPath(); ctx.ellipse(itz.x + 6, PISO + .5, 14, 1.8, 0, 0, TAU); ctx.fill(); ctx.restore();
        actor(ctx, c, itz, { tinte: ['#1a1428', .3], bordes: [{ c: '#ff6ad8', dx: -1, dy: -.3, d: 1.2, a: .8 }, { c: '#7af0ff', dx: -1, dy: .4, d: .6, a: .5 }] });
      },
    });
    // la burbuja-visión: mundos de verdad, dibujados con sus estilos. o = { x, y, t0, t1 }
    function vision(ctx, c, t, M, o) {
      const g = EASE.outBack(tramo(t, o.t0, o.t0 + .45, 'lin')) * (1 - tramo(t, o.t1 - .3, o.t1, 'in2')); if (g <= 0) return;
      const i = clamp(Math.floor((t - o.t0 - .3) / .5), 0, 3), id = ESTILOS_VISION[i], v = C.vision[id];
      const cambio = t - (o.t0 + .3 + i * .5), pulso = cambio >= 0 && cambio < .25 ? Math.sin(cambio / .25 * Math.PI) : 0;
      if (v) { v.update(1 / 60); v.render(); }
      ctx.save(); aplica(ctx, c, 1);
      const x = o.x, y = o.y, r = 21 * g * (1 + pulso * .06);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(x, y, r * .8, x, y, r * 1.6); gl.addColorStop(0, rgba(LUZ_VISION[id] || '#fff', .35)); gl.addColorStop(1, rgba(LUZ_VISION[id] || '#fff', 0)); ctx.fillStyle = gl; ctx.fillRect(x - r * 1.7, y - r * 1.7, r * 3.4, r * 3.4); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
      if (v) { const w = r * 2 * 16 / 9 * 1.05, h = w * 9 / 16; ctx.imageSmoothingEnabled = !(v.st.pixel); ctx.drawImage(v.c, x - w * .5, y - h * .55, w, h); ctx.imageSmoothingEnabled = true; }
      if (pulso) { ctx.fillStyle = `rgba(255,255,255,${pulso * .6})`; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
      ctx.restore();
      burbuja(ctx, x, y, r, 0, Tglob, .9);
      ctx.restore();
      return LUZ_VISION[id];
    }

    // ---- 8 · Fresita cae al malecón; Itzel corre a ayudarla ----
    const SUELO_F = PISO - 6; // Fresita cae al piso del malecón (no al pretil): por eso Itzel se agacha a ayudarla
    function freS8(t) { // cae girando, rebota en el pretil y se queda mareada
      if (t < .5) { const [x, y] = arco(t / .5, -150, 40, -100, SUELO_F, 6); return { x, y, giro: (1 - t / .5) * TAU * 2 + .35, m: 'cae' }; }
      if (t < .85) { const [x, y] = arco((t - .5) / .35, -100, SUELO_F, -92, SUELO_F, 7); return { x, y, giro: .35 + Math.sin((t - .5) / .35 * Math.PI) * .4, m: 'rebota' }; }
      if (t < 3.3) return { x: -92, y: SUELO_F, giro: .35 * (1 - tramo(t, 2.8, 3.2)), m: 'mareada', k: t - .85 };
      const u = tramo(t, 3.3, 4, 'io2'); return { x: -92, y: lerp(SUELO_F, 110, u) + Math.sin(t * 3) * 1.2 * u, giro: 0, m: 'sube' };
    }
    plano(37, 41, {
      act(t, T) {
        TODOS.forEach(a => { a.vis = false; ini(a); a._atrapado = 0; a._vuela = 0; a._quieto = false; }); itz.vis = fre.vis = true;
        const f = freS8(t); fre.x = f.x; fre.y = f.y; fre.pose.giro = f.giro; fre.face = 1; fre.s = SF; fre._d = 1;
        if (f.m === 'cae' || f.m === 'rebota') Object.assign(fre.cara, { ojos: .1, o: .7 });
        else if (f.m === 'mareada') {
          const abre = EASE.io2(tramo(t, 1.75, 2.8, 'lin')) * (t > 3.02 && t < 3.18 ? .12 : 1);
          Object.assign(fre.cara, { ojos: abre, triste: t < 2.95 ? 1 : 0, o: t > 2.8 && t < 3.25 ? .35 : 0, mirar: [.6, -.6], branquias: -.4 + tramo(t, 2.6, 2.8) * .4 }); fre.pose.nado = .2; fre.pose.cola = .3; fre.pose.patas = .3;
          if (f.k < .22) fre.pose.sq = Math.sin(f.k / .22 * Math.PI) * .35;
        } else Object.assign(fre.cara, { ojos: 1.25, mirar: [.4, -.8], branquias: -.2 });
        // Itzel corre hacia ella, se agacha y le tiende la mano
        itz.face = -1; itz.x = lerp(-12, -42, tramo(t, .5, 1.3, 'io2')); itz.y = PISO;
        if (t > .5 && t < 1.3) ACTOR.POSE.corre(itz, t * 12, .9); else ACTOR.POSE.quieta(itz, t);
        const ag = tramo(t, 1.25, 1.6) * (1 - tramo(t, 3.3, 3.9)); if (ag > 0) { ACTOR.POSE.agachada(itz, ag * .75); itz.pose.lean = .32 * ag; itz.pose.bD = [lerp(.12, 1.35, ag), lerp(.45, .25, ag)]; }
        itz.cuerpo = t > .5 && t < 1.3 ? 'corre' + (Math.floor(t * 11) % 4) : ag > .45 ? 'agachada-mano' : 'parada';
        Object.assign(itz.cara, { preocupa: t < 3.1 ? 1 : 0, cejas: .5, ojos: 1.1, sonrisa: t > 3.1 ? .45 : 0, mirar: [.6, .5] });
        habla(itz, 'Itzel', T);
      },
      cam: t => encuadra(1.7, claves(t, [[0, 1.75], [4, 1.9, 'io2']]), [-64, 116, 1, 10, 34], [RIFT_X, -50, .06, -80, -100]),
      dib(ctx, t, c, M) {
        const T = Tglob, f = freS8(t);
        mundo(ctx, c, { solY: 62, foco: { d: 1, k: 1.1 }, reflejoK: 0, grieta: { alto: 1, ancho: 84 + Math.sin(T * 1.4) * 5 } }, M);
        grado(ctx, M, '#3e4a8a', .55, 'multiply');
        resplandorGrieta(ctx, c, M, .8); ojoGrieta(ctx, c, T, .5);
        const fx = { tinte: ['#2a1a30', .12], bordes: [{ c: '#7ae8ff', dx: -1, dy: -.4, d: 1, a: .55 }, { c: '#ffb070', dx: 1, dy: -.1, d: .8, a: .35 }] };
        ctx.save(); aplica(ctx, c, 1);
        ctx.fillStyle = 'rgba(30,20,40,.25)'; ctx.beginPath(); ctx.ellipse(itz.x + 6, PISO + .5, 14, 1.8, 0, 0, TAU); ctx.fill();
        if (t > .48 && t < .95) { const k = (t - .48) / .47; ctx.globalAlpha = 1 - k; ctx.fillStyle = '#f2e6d0'; for (let i = 0; i < 8; i++) { const an = Math.PI + i / 7 * Math.PI; ctx.beginPath(); ctx.arc(-100 + Math.cos(an) * (3 + k * 10), SUELO_F + 5 + Math.sin(an) * (1 + k * 4), .8, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
        ctx.restore();
        actor(ctx, c, fre, fx); actor(ctx, c, itz, fx);
        // estrellitas de mareo
        if (f.m === 'mareada' && t < 2.75) { ctx.save(); aplica(ctx, c, 1); for (let i = 0; i < 3; i++) { const an = T * 4 + i * TAU / 3, x = fre.x + 6 + Math.cos(an) * 9, y = fre.y - 12 + Math.sin(an) * 2.6; ctx.globalAlpha = .6 + .4 * Math.sin(an); ctx.fillStyle = '#ffd23f'; ctx.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 1 : 2.4, a2 = k / 10 * TAU - Math.PI / 2; ctx.lineTo(x + Math.cos(a2) * r, y + Math.sin(a2) * r); } ctx.fill(); } ctx.restore(); }
      },
    });

    // ---- 9 · Fresita le pide ayuda; Itzel acepta ----
    plano(41, 47, {
      act(t, T) {
        TODOS.forEach(a => { a.vis = false; ini(a); }); itz.vis = fre.vis = true;
        itz.face = -1; itz.x = -42; itz.y = PISO; ACTOR.POSE.quieta(itz, t); itz.cuerpo = 'parada'; // de pie, con los brazos del dibujo
        if (t < 3.9) Object.assign(itz.cara, { preocupa: .9, cejas: .3, sonrisa: .05, ojos: 1.08, mirar: [.6, -.3] });
        else Object.assign(itz.cara, { cejas: -.1, enojo: .45, sonrisa: 1, mirar: [.6, -.2], rubor: .8 });
        // se acomoda la corona de flores y aprieta las correas de la mochila
        if (t > 3.95 && t < 4.45) { const u = Math.sin(tramo(t, 3.95, 4.45, 'lin') * Math.PI); itz.pose.bD = [lerp(.12, 2.85, u), lerp(.45, 1.7, u)]; itz.pose.cabeza = -.08 * u; }
        if (t > 4.45 && t < 5.0) { const u = Math.sin(tramo(t, 4.45, 5.0, 'lin') * Math.PI); itz.pose.bD = [lerp(.12, .5, u), lerp(.45, 2.4, u)]; itz.pose.bT = [lerp(-.12, .45, u), lerp(.4, 2.4, u)]; itz.pose.agacha = Math.sin(tramo(t, 4.5, 4.95, 'lin') * Math.PI * 2) * .8; }
        habla(itz, 'Itzel', T);
        // Fresita, frente a su cara
        fre.face = 1; fre.x = -92; fre.y = 110 + Math.sin(T * 2.6) * 1.4; fre._d = 1;
        habla(fre, 'Fresita', T); if (fre.cara.boca) fre.cara.boca = Math.min(1, fre.cara.boca * 1.4);
        const enf = t > .2 && t < 1.9 ? Math.abs(Math.sin(t * 5)) : 0; fre.pose.sq = enf * .12; fre.cara.branquias = t < 1.9 ? .7 : .2; fre.cara.ojos = 1.2;
        if (t > 2 && t < 3.9) { fre.cara.brillo = 1.6; fre.cara.branquias = .4; }
        if (t > 3.2 && t < 4.0) Object.assign(fre.cara, { mirar: [.3, -.7], ojos: 1.35, branquias: -.35 }); // ¿me ayudas?
        if (t > 5.1) { const k = tramo(t, 5.1, 5.8, 'lin'); fre.pose.giro = EASE.io2(k) * TAU; fre.y -= Math.sin(k * Math.PI) * 9; fre.cara.risa = 1; fre.cara.branquias = 1; }
      },
      cam(t) {
        if (t < 2.0) return encuadra(1.9, claves(t, [[0, 2.15], [2, 2.25]]), [-68, 110, 1, 0, 0], [RIFT_X, -50, .06, null, -150]);
        if (t < 3.95) return encuadra(1.8, claves(t, [[2, 1.85], [3.95, 1.95]]), [-84, 112, 1, -10, 0]);
        return encuadra(1.9, claves(t, [[3.95, 2.2], [6, 2.4, 'io2']]), [-62, 116, 1, 30, 10]);
      },
      dib(ctx, t, c, M) {
        const T = Tglob, foco = { d: 1, k: 1.2 };
        mundo(ctx, c, { solY: 62, foco, reflejoK: 0, grieta: { alto: 1, ancho: 84 + Math.sin(T * 1.4) * 5 } }, M);
        grado(ctx, M, '#3e4a8a', .5, 'multiply');
        resplandorGrieta(ctx, c, M, .7);
        const fxI = { tinte: ['#2a1a30', .12], bordes: [{ c: '#ffb070', dx: -1, dy: -.1, d: 1, a: .4 }, { c: '#7ae8ff', dx: -1, dy: .4, d: .6, a: .35 }] };
        ctx.save(); aplica(ctx, c, 1); ctx.fillStyle = 'rgba(30,20,40,.25)'; ctx.beginPath(); ctx.ellipse(itz.x + 6, PISO + .5, 14, 1.8, 0, 0, TAU); ctx.fill(); ctx.restore();
        actor(ctx, c, itz, fxI);
        const luz = t > 2 && t < 3.95 ? (LUZ_VISION[ESTILOS_VISION[clamp(Math.floor((t - 2.3) / .5), 0, 3)]] || '#ffffff') : null;
        actor(ctx, c, fre, { bordes: luz ? [{ c: luz, dx: -1, dy: -.2, d: 1.2, a: .9 }, { c: '#ffffff', dx: 0, dy: -1, d: .8, a: .3 }] : [{ c: '#ffffff', dx: 0, dy: -1, d: .8, a: .3 }] });
        vision(ctx, c, t, M, { x: -142, y: 100, t0: 2.0, t1: 3.95 });
        if (t > 2 && t < 3.9) { ctx.save(); aplica(ctx, c, 1); chispitas(ctx, fre.x - 4, fre.y - 6, 10, T, COL.fresita, 6); ctx.restore(); }
        if (t > 5.1) { ctx.save(); aplica(ctx, c, 1); chispitas(ctx, fre.x, fre.y - 2, 14 + (t - 5.1) * 8, T, '#ffd1ea', 9); ctx.restore(); }
      },
    });

    // ---- 10 · la grieta crece (por encima del hombro) ----
    const camS9 = t => ({ x: -96, y: 50, z: 1.25, L: claves(t, [[0, 1], [6, 1.13, 'io2']]), sx: (noise1(t * 7, 1) - .5) * 5 * tramo(t, .6, 5.5), sy: (noise1(t * 7, 2) - .5) * 4 * tramo(t, .6, 5.5), rot: Math.sin(t * .7) * .012 * tramo(t, 1, 5) });
    plano(47, 53, {
      act(t, T) {
        TODOS.forEach(a => { a.vis = false; ini(a); }); itz.vis = fre.vis = true;
        // Itzel de espaldas, en primer término (se dibuja fija a la pantalla)
        itz.vista = 'espalda'; itz.face = 1; itz.s = 2.7; itz.x = 182; itz.y = 252; ACTOR.POSE.quieta(itz, t);
        const vi = tramo(t, 1.6, 4.5); itz.viento = [-2400 * vi - Math.sin(T * 3) * 300 * vi, -500 * vi];
        itz.pose.cabeza = Math.sin(T * 9) * .02 * tramo(t, 2, 4); // el viento la sacude un poco
        fre.vista = 'espalda'; fre.face = 1; fre.s = 1.45; fre.x = 72 + Math.sin(T * 2) * 2 - 10 * vi; fre.y = 66 + Math.sin(T * 2.6) * 2.4; fre.pose.giro = -.14 * vi + Math.sin(T * 7) * .02 * vi; fre.cara.branquias = .9; fre.viento = [-2600 * vi, -400 * vi];
      },
      cam: camS9,
      dib(ctx, t, c, M) {
        const T = Tglob, foco = { d: .06, k: .45 };
        const g = { alto: 1, ancho: 84 + EASE.outElastic(clamp(t / 1.1, 0, 1)) * 14 + Math.sin(T * 1.4) * 5, aspira: .35 + tramo(t, .2, 2.6) * .65 }; // ya abierta: crece un poco más y empieza a jalar
        mundo(ctx, c, { solY: 60, foco, reflejoK: 0, grieta: g, contagio: { r: EASE.io2(tramo(t, .4, 5, 'lin')) * 130 }, parpadeo: tramo(t, 1, 2), parejos: true }, M);
        // la luz ya es la de la grieta; muy adentro late el ojo de la Ruptura
        grado(ctx, M, '#3e4a8a', .7, 'multiply');
        ojoGrieta(ctx, c, T, .8);
        const [rx, ry] = pant(c, .06, RIFT_X, -60);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; const lg = ctx.createRadialGradient(rx, ry, 0, rx, ry, 360); lg.addColorStop(0, 'rgba(120,220,255,.28)'); lg.addColorStop(.5, 'rgba(255,80,200,.08)'); lg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = lg; ctx.fillRect(M.x0, M.y0, M.x1 - M.x0, M.y1 - M.y0); ctx.restore();
        if (t > 1) hojas(ctx, M, T, 30, 0, [rx, ry + 40]);
        // primer término, fijo a la pantalla (con su propio temblor)
        ctx.save(); ctx.translate(c.sx * 1.4, c.sy * 1.4);
        const fxF = { tinte: ['#1a1428', .45], bordes: [{ c: '#7af0ff', dx: -1, dy: -.4, d: 1.4, a: 1 }, { c: '#ff6ad8', dx: -1, dy: .5, d: .8, a: .7 }], blur: 1.1 * M.k };
        CINE.capa(ctx, ACTOR.caja(fre), x => ACTOR.dibuja(x, fre), fxF);
        CINE.capa(ctx, ACTOR.caja(itz), x => ACTOR.dibuja(x, itz), Object.assign({}, fxF, { blur: .9 * M.k }));
        ctx.restore();
      },
    });

    // ---- 11 · el salto (con cámara lenta) ----
    const TAU10 = (() => { const tab = [0]; let tau = 0; for (let i = 1; i <= 4 * 240; i++) { const t = i / 240, v = t < 1.45 ? 1 : t < 1.7 ? lerp(1, .16, (t - 1.45) / .25) : t < 3.05 ? .16 : t < 3.3 ? lerp(.16, 3, (t - 3.05) / .25) : 3; tau += v / 240; tab.push(tau); } return t => tab[clamp(Math.round(t * 240), 0, tab.length - 1)]; })();
    function itzS10(tau, c) {
      if (tau < .45) return { x: -8, y: PISO, m: 'agacha', k: tau / .45 };
      if (tau < 1.2) return { x: lerp(-8, -40, (tau - .45) / .75), y: PISO, m: 'corre' };
      if (tau < 1.32) return { x: -41, y: PISO, m: 'agacha', k: 1 };
      if (tau < 2.05) { const u = (tau - 1.32) / .73, [x, y] = arco(u, -42, PISO, -128, 46, 34); return { x, y, m: 'vuela', u }; }
      return { x: -128, y: 46, m: 'entra', u: clamp((tau - 2.05) / .45, 0, 1) };
    }
    plano(53, 57, {
      act(t, T) {
        const tau = TAU10(t);
        TODOS.forEach(a => { a.vis = false; ini(a); }); itz.vis = fre.vis = true; itz.vista = 'lado'; itz.s = SI; itz.face = -1; fre.s = SF;
        const s = itzS10(tau); itz.x = s.x; itz.y = s.y; itz.viento = [-500, -200]; itz.pose.sq = 0;
        Object.assign(itz.cara, { cejas: -.15, enojo: .5, sonrisa: .4, ojos: 1.05 });
        if (s.m === 'agacha') { ACTOR.POSE.agachada(itz, EASE.out2(Math.min(1, s.k))); }
        else if (s.m === 'corre') ACTOR.POSE.corre(itz, tau * 13);
        else if (s.m === 'vuela') { s.u < .3 ? ACTOR.POSE.estira(itz, 1) : ACTOR.POSE.encoge(itz, .6); itz.pose.sq = s.u < .15 ? -.25 : 0; itz.cara.boca = .5; itz.cara.risa = 0; }
        else { ACTOR.POSE.estira(itz, 1); itz.vis = s.u < 1; }
        habla(itz, 'Itzel', T);
        itz.cuerpo = s.m === 'agacha' ? (tau < .45 ? 'grita' : 'atras0') : s.m === 'corre' ? 'atras' + (Math.floor(tau * 11) % 4) : s.m === 'vuela' ? 'salto-fresita' : 'flota';
        // Fresita la sigue
        const sigue = (a, dl, dy) => { const q = itzS10(Math.max(0, tau - dl)); a.face = -1; if (q.m === 'vuela' || q.m === 'entra') { a.x = q.x + 8; a.y = q.y - 40 + dy; a.vis = q.m !== 'entra' || q.u < 1; a._u = q.m === 'entra' ? q.u : 0; } else { a.x = q.x + 14 + dy * 2; a.y = PISO - 64 + dy * .8 + Math.sin(T * 3 + dy) * 2; a._u = 0; } a.cara.brillo = 1.2; a.pose.nado = 1.5; };
        sigue(fre, .1, 0);
        fre.cara.branquias = .5; fre.cara.ojos = 1.15;
        if (s.m === 'vuela') fre.vis = false; // en el salto va de la mano de Itzel (viene en el mismo dibujo)
        if (s.m === 'entra') { fre.x = itz.x + 10; fre.y = itz.y - 50; fre._u = s.u; } // y entran juntas
      },
      cam(t) { const tau = TAU10(t), a = itzS10(tau), b = itzS10(Math.max(0, tau - .18)), z = claves(tau, [[0, 1.8], [1.3, 1.7], [1.9, 1.3], [2.4, 1.15]]); return encuadra(z, 1.25, [(a.x + b.x) / 2, (a.y + b.y) / 2 - 30, 1, claves(tau, [[0, 70], [1.4, 60], [2.1, 10]]), claves(tau, [[0, 40], [1.3, 40], [2, 20]])], [RIFT_X, -40, .06, null, -60], { sx: (noise1(t * 8, 4) - .5) * 3, sy: (noise1(t * 8, 5) - .5) * 3 }); },
      dib(ctx, t, c, M) {
        const T = Tglob, tau = TAU10(t), lento = t > 1.5 && t < 3.1;
        mundo(ctx, c, { solY: 60, foco: { d: 1, k: .7 }, reflejoK: 0, grieta: { alto: 1, ancho: 88 + Math.sin(T * 1.4) * 5 + tramo(tau, 2.1, 2.5) * 26, aspira: 1 }, contagio: { r: 96 }, parpadeo: 1 }, M);
        grado(ctx, M, '#3e4a8a', .7, 'multiply');
        const [rx, ry] = pant(c, .06, RIFT_X, -60);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; const lg = ctx.createRadialGradient(rx, ry, 0, rx, ry, 380); lg.addColorStop(0, 'rgba(120,220,255,.3)'); lg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = lg; ctx.fillRect(M.x0, M.y0, M.x1 - M.x0, M.y1 - M.y0); ctx.restore();
        const sil = tramo(tau, 1.35, 1.6);
        const fx = a => ({ tinte: ['#140c22', .15 + sil * .2], bordes: [{ c: '#7af0ff', dx: -1, dy: -.6, d: 1.4, a: .9 }, { c: '#ff6ad8', dx: 1, dy: -.2, d: .9, a: .5 * sil }] });
        // los que ya van entrando a la grieta se encogen hacia ella
        for (const a of [fre, itz]) {
          const u = a === itz ? (itzS10(tau).m === 'entra' ? itzS10(tau).u : 0) : a._u || 0;
          if (!a.vis) continue;
          if (u > 0) { const [ax, ay] = pant(c, 1, a.x, a.y), e = EASE.in3(u), x = lerp(ax, rx, e), y = lerp(ay, ry + 30, e), k = (1 - e * .95); ctx.save(); ctx.translate(x - ax * k, y - ay * k); ctx.scale(k, k); actor(ctx, c, a, fx(a)); ctx.restore(); }
          else actor(ctx, c, a, fx(a));
        }
        hojas(ctx, M, T, 26, 0, [rx, ry + 40]);
        if (lento) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .15 * tramo(t, 1.5, 1.8) * (1 - tramo(t, 2.8, 3.1)); const g = ctx.createRadialGradient(0, 0, 100, 0, 0, 400); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(120,200,255,1)'); ctx.fillStyle = g; ctx.fillRect(M.x0, M.y0, M.x1 - M.x0, M.y1 - M.y0); ctx.restore(); }
        if (t > 3.35) grado(ctx, M, '#e8fbff', tramo(t, 3.35, 3.9, 'in2') * .9, 'lighter');
      },
    });

    // ---- 12 · el túnel entre dimensiones y el logo bordado ----
    let celdas = null;
    function preparaLogo() {
      if (celdas || !C.logo.complete || !C.logo.naturalWidth) return;
      const w = C.logo.naturalWidth, h = C.logo.naturalHeight, c = mkCanvas(w, h), x = c.getContext('2d'); x.drawImage(C.logo, 0, 0);
      const d = x.getImageData(0, 0, w, h).data, s = 16; celdas = [];
      for (let j = 0; j * s < h; j++) for (let i = 0; i * s < w; i++) { const px = Math.min(w - 1, i * s + 8), py = Math.min(h - 1, j * s + 8); if (d[(py * w + px) * 4 + 3] > 40) celdas.push({ i, j, o: i + hash1(i * 31 + j, 3) * 3.5 }); }
      const max = Math.max(...celdas.map(q => q.o)); celdas.forEach(q => q.o /= max); C.logoC = c;
    }
    plano(57, 61, {
      act(t, T) {
        TODOS.forEach(a => { a.vis = false; ini(a); }); itz.vis = fre.vis = true; itz.vista = 'lado'; itz.face = 1; itz.s = 1.1; itz.x = Math.sin(T * 1.3) * 6; itz.y = 30 + Math.sin(T * 1.7) * 4; ACTOR.POSE.estira(itz, 1); itz.viento = [0, -900]; itz.cuerpo = 'flota';
        Object.assign(itz.cara, { ojos: 1.2, sonrisa: 1, boca: .5, cejas: .6 });
        [[fre, 0]].forEach(([a, ph]) => { const an = T * 2.2 + ph; a.x = Math.cos(an) * 60; a.y = -20 + Math.sin(an) * 26; a.face = Math.sin(an) > 0 ? -1 : 1; a.s = a === azul ? 1 : 1.15; a.cara.brillo = 1.4; a.cara.risa = 1; a.pose.nado = 1.6; });
      },
      cam: () => ({ x: 0, y: 0, z: 1 }),
      dib(ctx, t, c, M) {
        const T = Tglob;
        if (t < 1.62) tunel(ctx, t, M, T);
        else logo(ctx, t - 1.62, M, T);
        if (t > 1.45 && t < 2.1) grado(ctx, M, '#fffaf0', t < 1.62 ? (t - 1.45) / .17 : 1 - (t - 1.62) / .48, 'source-over');
        if (t > 3.62 && opc.repeticion) grado(ctx, M, '#0d0806', tramo(t, 3.62, 4, 'in2')); // en el juego no: la manta se descose en el viaje al primer mundo
      },
    });
    function tunel(ctx, t, M, T) {
      ctx.fillStyle = '#0b0716'; ctx.fillRect(M.x0, M.y0, M.x1 - M.x0, M.y1 - M.y0);
      // estelas radiales
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ambient(90, 71, (i, h1, h2, h3) => { const an = h1 * TAU, f = wrap(T * (1.2 + h3) + h2, 1), r0 = 20 + f * f * 520, r1 = r0 + 12 + f * 80; ctx.strokeStyle = ['#62f4ff', '#ff5ad0', '#ffd27a', '#ffffff'][i % 4]; ctx.globalAlpha = f * .7; ctx.lineWidth = .5 + f * 1.6; ctx.beginPath(); ctx.moveTo(Math.cos(an) * r0, Math.sin(an) * r0 * .7); ctx.lineTo(Math.cos(an) * r1, Math.sin(an) * r1 * .7); ctx.stroke(); });
      ctx.restore();
      // láminas de mundos que vienen hacia la cámara
      const fotos = C.fotos, N = 8;
      const lam = [];
      for (let j = 0; j < N; j++) { const u = wrap(j / N + t * .62, 1); lam.push([u, j]); }
      lam.sort((a, b) => a[0] - b[0]);
      for (const [u, j] of lam) {
        if (t > 1.05 && u > .55) continue;
        const f = fotos[j % fotos.length], s = .18 / Math.pow(1.04 - u, 1.15), a = smooth(0, .15, u) * (1 - smooth(.8, 1, u)), rot = (j * .7 + T * .35) * (1 - u) * .5;
        if (!f) continue;
        ctx.save(); ctx.rotate(rot); ctx.globalAlpha = a; const w = 640 * s * .5, h = 360 * s * .5;
        ctx.drawImage(f, -w / 2, -h / 2, w, h);
        ctx.setLineDash([4 * s, 3 * s]); ctx.lineWidth = 2.2 * s; ctx.strokeStyle = ['#c8203a', '#f2b233', '#3f9a5c', '#2f7fc8', '#e85a8a'][j % 5]; ctx.strokeRect(-w / 2 - 3 * s, -h / 2 - 3 * s, w + 6 * s, h + 6 * s); ctx.setLineDash([]);
        ctx.restore();
      }
      // el primer mundo de la partida se abre en el centro
      if (t > .95) { const u = EASE.in3(clamp((t - .95) / .62, 0, 1)), s = .15 + u * 2.6, w = 640 * s * .5, h = 360 * s * .5; ctx.save(); ctx.globalAlpha = clamp((t - .95) / .2, 0, 1); ctx.drawImage(C.primer, -w / 2, -h / 2, w, h); ctx.setLineDash([4 * s, 3 * s]); ctx.lineWidth = 2.2 * s; ctx.strokeStyle = '#f2b233'; ctx.strokeRect(-w / 2 - 3 * s, -h / 2 - 3 * s, w + 6 * s, h + 6 * s); ctx.setLineDash([]); ctx.restore(); }
      // a lo lejos, los tres orbes se pierden en el túnel
      for (const [i, col] of [COL.azul, COL.naranja, COL.violeta].entries()) { const an = T * 1.4 + i * 2.1, k = 1 - tramo(t, 0, 1.4, 'lin'); orbe(ctx, Math.cos(an) * 30 * k, -14 + Math.sin(an) * 16 * k, 10 * k + 2, col, T, 1); }
      // ellas caen girando
      const cae = 1 - tramo(t, 1.1, 1.55, 'in2');
      if (cae > 0) {
        ctx.save(); ctx.scale(cae, cae);
        for (const a of [fre]) if (a.y < -20) CINE.capa(ctx, ACTOR.caja(a), x => ACTOR.dibuja(x, a), { bordes: [{ c: '#ffffff', dx: 0, dy: -1, d: .8, a: .5 }] });
        ctx.save(); ctx.rotate(-.5 + Math.sin(T * 1.5) * .25); CINE.capa(ctx, ACTOR.caja(itz), x => ACTOR.dibuja(x, itz), { bordes: [{ c: '#7af0ff', dx: -1, dy: -.5, d: 1.2, a: .9 }, { c: '#ff6ad8', dx: 1, dy: .3, d: .8, a: .7 }] }); ctx.restore();
        for (const a of [fre]) if (a.y >= -20) CINE.capa(ctx, ACTOR.caja(a), x => ACTOR.dibuja(x, a), { bordes: [{ c: '#ffffff', dx: 0, dy: -1, d: .8, a: .5 }] });
        ctx.restore();
      }
    }
    function logo(ctx, t, M, T) {
      preparaLogo();
      // manta
      ctx.fillStyle = '#efe4cc'; ctx.fillRect(M.x0, M.y0, M.x1 - M.x0, M.y1 - M.y0);
      ctx.save(); ctx.globalAlpha = .5; ctx.strokeStyle = 'rgba(120,90,50,.13)'; ctx.lineWidth = .5; ctx.beginPath(); for (let x = Math.floor(M.x0 / 3) * 3; x < M.x1; x += 3) { ctx.moveTo(x, M.y0); ctx.lineTo(x, M.y1); } for (let y = Math.floor(M.y0 / 3) * 3; y < M.y1; y += 3) { ctx.moveTo(M.x0, y); ctx.lineTo(M.x1, y); } ctx.stroke(); ctx.restore();
      const vg = ctx.createRadialGradient(0, 0, 160, 0, 0, 520); vg.addColorStop(0, 'rgba(120,70,40,0)'); vg.addColorStop(1, 'rgba(120,70,40,.28)'); ctx.fillStyle = vg; ctx.fillRect(M.x0, M.y0, M.x1 - M.x0, M.y1 - M.y0);
      // cenefas de flores bordándose en las esquinas
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) for (let i = 0; i < 5; i++) { const k = clamp((t - .1 - i * .12) / .25, 0, 1); if (k <= 0) continue; const x = sx * (290 - i * 16), y = sy * (150 - (i % 2) * 8); ctx.save(); ctx.translate(x, y); ctx.scale(EASE.outBack(k), EASE.outBack(k)); ACTOR.flor(ctx, 0, 0, 4.2, ['#c8203a', '#f2b233', '#2f7fc8', '#3f9a5c', '#e85a8a'][i]); ctx.restore(); }
      if (!celdas) return;
      const w = C.logoC.width, h = C.logoC.height, S = Math.min(1, 380 / w), x0 = -w * S / 2, y0 = -h * S / 2 - 26, prog = clamp((t - .12) / 1.15, 0, 1);
      let ultimo = null;
      for (const q of celdas) {
        const k = clamp((prog - q.o * .92) / .08, 0, 1); if (k <= 0) continue;
        const e = EASE.outBack(k), cx0 = x0 + (q.i + .5) * 16 * S, cy0 = y0 + (q.j + .5) * 16 * S;
        ctx.save(); ctx.translate(cx0, cy0); ctx.scale(e * 1.0, e * 1.0); ctx.drawImage(C.logoC, q.i * 16, q.j * 16, 16, 16, -8 * S, -8 * S, 16 * S, 16 * S); ctx.restore();
        if (k < 1) ultimo = [cx0, cy0];
      }
      if (ultimo) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#fff6c0'; ctx.beginPath(); ctx.arc(ultimo[0], ultimo[1], 3, 0, TAU); ctx.fill(); ctx.restore(); ctx.strokeStyle = '#9a9aa8'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(ultimo[0] + 2, ultimo[1] - 2); ctx.lineTo(ultimo[0] + 14, ultimo[1] - 16); ctx.stroke(); }
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      const a1 = tramo(t, 1.25, 1.65); ctx.globalAlpha = a1; ctx.font = 'italic 500 17px Alegreya, Georgia, serif'; ctx.fillStyle = '#6a4434'; ctx.fillText(opc.final ? 'Campeche sigue en su lugar. Gracias por jugar.' : 'Una aventura en muchas dimensiones', 0, y0 + h * S + 30 + (1 - a1) * 4);
      // (antes aquí salía en rojo «MUNDO 1: …»; se quitó: la entrada ya no desemboca en el primer mundo, sino en la pantalla de inicio)
      ctx.globalAlpha = 1;
    }

    // =================================================================
    //  CUADRO
    // =================================================================
    // =================================================================
    //  LA CINEMÁTICA FINAL (opc.final): usa el mismo Campeche de la entrada.
    //  La Ruptura se cierra, los ajolotes regresan y todos ven el atardecer.
    // =================================================================
    if (opc.final) {
      PL.length = 0;
      const camFin = () => Object.assign({}, camS9(3), { sx: 0, sy: 0, rot: 0 });
      const deEspaldas = (t, T, v) => {
        TODOS.forEach(a => { a.vis = false; ini(a); }); itz.vis = fre.vis = true;
        itz.vista = 'espalda'; itz.face = 1; itz.s = 2.7; itz.x = 182; itz.y = 252; ACTOR.POSE.quieta(itz, t); itz.viento = [-2400 * v, -500 * v];
        fre.vista = 'espalda'; fre.face = 1; fre.s = 1.45; fre.x = 72 + Math.sin(T * 2) * 2; fre.y = 66 + Math.sin(T * 2.6) * 2.4; fre.cara.branquias = .9; fre.viento = [-2600 * v, -400 * v];
      };
      const frente = (ctx, c, M, tinte) => {
        ctx.save(); ctx.translate(c.sx * 1.4, c.sy * 1.4);
        const fx = { tinte: ['#1a1428', tinte], bordes: [{ c: '#ffc870', dx: -1, dy: -.4, d: 1.2, a: .8 }], blur: .8 * M.k };
        CINE.capa(ctx, ACTOR.caja(fre), x => ACTOR.dibuja(x, fre), fx); CINE.capa(ctx, ACTOR.caja(itz), x => ACTOR.dibuja(x, itz), fx);
        ctx.restore();
      };
      // 1 · la grieta se cierra y la rendija del horizonte se cose de orilla a orilla
      plano(0, 7.5, {
        act(t, T) { deEspaldas(t, T, 1 - tramo(t, 2.4, 4.8)); },
        cam: camFin,
        dib(ctx, t, c, M) {
          const T = Tglob, cierra = EASE.io2(tramo(t, 1.2, 4.6, 'lin')), ancho = 98 * (1 - cierra);
          mundo(ctx, c, { solY: 60, foco: { d: .06, k: .45 }, reflejoK: .3 * cierra, parejos: true, grieta: ancho > 1 ? { alto: 1, ancho, aspira: .9 * (1 - cierra) } : null, rendija: lerp(4, 1.9, tramo(t, 3.8, 6.8, 'lin')) }, M);
          grado(ctx, M, '#3e4a8a', (1 - cierra) * .7, 'multiply');
          if (cierra < 1) ojoGrieta(ctx, c, T, (1 - cierra) * .9);
          if (t > 4.4 && t < 5.4) grado(ctx, M, '#fff4e0', (1 - Math.abs(t - 4.7) / .7) * .85, 'lighter');
          frente(ctx, c, M, .12 + (1 - cierra) * .32);
        },
      });
      // 2 · cuatro luces cruzan el mar de regreso
      plano(7.5, 13.5, {
        act(t, T) { deEspaldas(t + 7.5, T, 0); fre.cara.branquias = 1; fre.y -= tramo(t, 3.4, 4.2) * 6; },
        cam: camFin,
        dib(ctx, t, c, M) {
          const v = i => EASE.io2(tramo(t, .4 + i * .35, 4.4 + i * .35, 'lin'));
          // regresan volando en formación: se elevan al acercarse, para pasar por encima del muro y entre los faroles
          const luces = [[COL.azul, -110, 0, azul, 46], [COL.naranja, -216, 1, nar, 46], [COL.violeta, -163, 2, vio, 84]].map(([col, x, i, aj, alto]) => [col, lerp(RIFT_X, x, v(i)), lerp(.05, .6, v(i)), tramo(t, .2 + i * .35, .8 + i * .35), aj, alto * Math.pow(v(i), 1.4), lerp(1, 2.6, v(i))]);
          mundo(ctx, c, { solY: 28, foco: { d: .06, k: .45 }, reflejoK: .4, luces, parejos: true }, M);
          frente(ctx, c, M, .12);
        },
      });
      // 3 · el reencuentro en el malecón
      plano(13.5, 20.5, {
        act(t, T) {
          TODOS.forEach(a => { a.vis = true; ini(a); }); itz.x = -46; itz.y = PISO; itz.face = -1; ACTOR.POSE.quieta(itz, t); Object.assign(itz.cara, { sonrisa: 1.1, ojos: 1.05 }); habla(itz, 'Itzel', T);
          fre.x = -96; fre.y = PISO - 38 + Math.sin(T * 3) * 3; fre.face = 1; fre.cara.risa = 1; habla(fre, 'Fresita', T);
          // 0–2.4: de frente, feliz de verlos · 2.2–2.6: Fresita vuela a sus brazos · 2.6–4.7: el abrazo · luego Fresita se aparta para darle las gracias
          const ABR = [2.6, 4.7];
          itz.vista = 'lado'; // cada cuadro parte de lado: si no, el abrazo se quedaba pegado después de soltarla
          if (t < 2.4) { itz.vista = 'frente'; itz.cara.risa = 1; }
          else if (t >= ABR[0] && t < ABR[1]) { itz.vista = 'abrazo'; fre.vis = false; }
          if (t > 2.2 && t < ABR[0]) { const u = EASE.in2(tramo(t, 2.2, ABR[0], 'lin')); fre.x = lerp(-96, itz.x - 14, u); fre.y = lerp(fre.y, PISO - 62, u); fre.pose.nado = 2; }
          if (t >= ABR[1]) { const u = EASE.out3(tramo(t, ABR[1], ABR[1] + .6, 'lin')); fre.x = lerp(itz.x - 16, -96, u); fre.y = lerp(PISO - 62, fre.y, u); }
          // los tres dan vueltas de felicidad sobre la cabeza de Itzel, parejos para no encimarse: al pasar por delante se ven un poco más grandes
          // dan vueltas bien arriba de su cabeza: no se le enciman
          [azul, nar, vio].forEach((a, i) => { const an = T * 1.9 + i / 3 * TAU, fr = Math.sin(an); a.x = itz.x + Math.cos(an) * 38; a.y = 70 + fr * 8 + Math.sin(T * 7 + i * 2) * 1.2; a.face = fr > 0 ? -1 : 1; a.pose.giro = Math.cos(an) * .22; a.s = SA * (.94 + fr * .1); a.cara.risa = 1; a.pose.nado = 2; });
          if (itz.vista === 'abrazo' || (t > 2.2 && t < 5.2)) { const u = Math.min(tramo(t, 2.2, 2.6), 1 - tramo(t, 4.8, 5.2)); [azul, nar, vio].forEach(a => a.y -= 8 * u); }
        },
        cam: t => encuadra(1.7, claves(t, [[0, 1.75], [7, 1.92, 'io2']]), [-80, 112, 1, -10, 34], [RIFT_X, -50, .06, -60, -110]),
        dib(ctx, t, c, M) {
          mundo(ctx, c, { solY: 28, foco: { d: 1, k: .18 }, reflejoK: .4 }, M);
          const fx = { bordes: [{ c: '#ffd890', dx: -1, dy: -.3, d: 1, a: .7 }] };
          for (const a of [vio, nar, azul].sort((p, q) => p.y - q.y).concat(fre, itz)) actor(ctx, c, a, fx); // los de atrás primero
        },
      });
      // 4 · todos sentados en el pretil, de espaldas, viendo el atardecer
      plano(20.5, 27, {
        act(t, T) {
          TODOS.forEach(a => { a.vis = true; ini(a); });
          itz.vista = 'espalda'; itz.sinPiernas = true; itz.face = 1; itz.x = -26; itz.y = sentadaY; ACTOR.POSE.sentada(itz, t, .5); itz.viento = [-60, 0];
          [[fre, -2, SA], [azul, -48, SA], [nar, -70, SA], [vio, 19, SA]].forEach(([a, x, s], i) => { a.vista = 'sentada'; a.mira = x < itz.x ? 1 : -1; a.face = 1; a.s = s * .95; a.x = x; a.y = PRETIL - 12; a.cara.brillo = .6; a.pose.nado = .5; });
        },
        cam: t => encuadra(1.8, claves(t, [[0, 2.2], [6.5, 2.0, 'io2']]), [-26, 99, 1, 0, 0], [SOL_X, 30, .04, -62, -44]),
        dib(ctx, t, c, M) {
          const o = { solY: lerp(30, 46, t / 6.5), foco: { d: 1, k: 1.7 }, postes: [-98, 46] };
          mundo(ctx, c, o, M); rayos(ctx, c, o.solY, Tglob, .8);
          const fx = { tinte: ['#3a1c2a', .5], bordes: [{ c: '#ffc870', dx: -1, dy: -.25, d: 1.1, a: .9 }, { c: '#fff2c8', dx: -1, dy: -.3, d: .45, a: .95 }] };
          const fxA = Object.assign({}, fx, { tinte: ['#3a1c2a', .28] }); // los ajolotes son claros: con menos sombra no se vuelven manchas
          for (const a of [nar, azul, vio, fre]) actor(ctx, c, a, fxA); actor(ctx, c, itz, fx);
          destello(ctx, c, o.solY, .6);
          if (t > 5.2) grado(ctx, M, '#0d0806', tramo(t, 5.2, 6.5), 'source-over');
          narra(ctx, M, Tglob);
        },
      });
      // 5 · la manta bordada
      plano(27, 32, {
        act() { TODOS.forEach(a => a.vis = false); },
        cam: () => ({ x: 0, y: 0, z: 1 }),
        dib(ctx, t, c, M) {
          logo(ctx, t, M, Tglob);
        },
      });
    }
    function actualiza(T, dt) {
      Tglob = T;
      const i = PL.findIndex(p => T < p.t1), k = i < 0 ? PL.length - 1 : i, p = PL[k];
      if (k !== planoAnt) { TODOS.forEach(a => { ACTOR.corte(a); a.vista = 'lado'; a.sinPiernas = false; a.viento = [0, 0]; a.cuerpo = null; }); itz.s = SI; fre.s = SF; planoAnt = k; }
      const t = T - p.t0;
      p.act(t, T);
      TODOS.forEach(a => ACTOR.paso(a, dt));
      return { p, t };
    }
    function cuadro(ctx, Tm, dt, M) {
      if (Tm >= PRE0 && Tm < PRE0 + PRE) { CAMPECHE_TOMAS.dibuja(ctx, Tm - PRE0, M); granoPantalla(ctx, M, Tm); return; }
      const T = interno(Tm), { p, t } = actualiza(T, dt);
      const c = p.cam(t);
      p.dib(ctx, t, c, M);
      granoPantalla(ctx, M, T);
    }
    function asentar(Tm) { const T = interno(Tm); planoAnt = -1; for (let τ = Math.max(0, T - .7); τ < T; τ += 1 / 60) actualiza(τ, 1 / 60); }
    const barras = Tm => { const T = interno(Tm); return T < (opc.final ? 26.8 : 58.5) ? tramo(T, .2, 1.7, 'out3') : 0; };
    return { dur: DUR, cues, subs, preparar, cuadro, asentar, barras, fin() { C = null; if (!opc.final) CAMPECHE_TOMAS.libera(); } };
  }

  CINE.registrar('final', { orden: 40, nombre: 'Campeche sigue en su lugar', desc: 'La cinemática final: se vence la última forma de la Ruptura y la grieta se cierra.', bloqueada: () => typeof RUPTURA_FORMAS !== 'undefined' && !RUPTURA_FORMAS.prog().completa, crear: o => crearEntrada(Object.assign({}, o, { final: true })) });
  CINE.registrar('entrada', { orden: 1, nombre: 'La tarde que se rompió el cielo', desc: 'Itzel juega al avioncito en el malecón, el cielo se rasga y la Ruptura se lleva a los ajolotes. Fresita le pide ayuda.', crear: crearEntrada });

  // ---------------------------------------------------------------------
  //  La entrada sale al abrir el juego (inicio.js): logo de GDevelop → logo de la empresa → esta cinemática →
  //  pantalla de inicio. Ya no sale en «¡A jugar!»: ahí se va directo al primer mundo. Sigue en Menú › Cinemáticas.
  // ---------------------------------------------------------------------
  window.INTRO_ENTRADA = function (alTerminar) {
    newRun((Math.random() * 1e6) | 0);
    CINE.play('entrada', { mundo: curStyle(), alTerminar: () => { RUN = null; alTerminar(); } });
  };
  const _controles = pantallaControles;
  pantallaControles = function () {
    _controles();
    const b = $('cJugar'); if (!b) return;
    b.onclick = () => { PIDE = null; empezar(); };
  };
})();
