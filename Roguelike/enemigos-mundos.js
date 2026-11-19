'use strict';
// =====================================================================
//  ENEMIGOS DE CADA MUNDO, VUELTOS A DIBUJAR
//  Los que nacieron para un mundo conservan su idioma (pixel de 16 bits,
//  silueta de ocaso, tinta, neón, papel, diseño plano…), pero con oficio:
//  sprites con contorno y tres tonos, siluetas elegantes con borde de sol,
//  tinta con aguada y pincel seco, tubos de neón con núcleo blanco.
//  Los de las fiestas y los de los prólogos de jefe usan el kit con volumen.
//  Los que se ven bien con la técnica de su mundo encima entran a GEN.
// =====================================================================
(function () {
  const { FD } = MEC, { FX, FXD, GEN } = FOE_ARTE;
  const { pal, tono, sombraDe, luzDe, vol, trazo, ojo, brillo, motas, mareo, globo, parpadea, dormido } = FOE_KIT;
  const brilla = (c, x, y, r, col, a) => { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x, y, r, col, a); c.restore(); };

  // ---------------- pixel: sprites por mapa y piezas con contorno ----------------
  const OUT = '#222034';
  function mapa(c, filas, P, x0, y0) { for (let j = 0; j < filas.length; j++) { const r = filas[j]; for (let i = 0; i < r.length; i++) { const ch = r[i]; if (ch === '.') continue; c.fillStyle = P[ch]; c.fillRect(x0 + i, y0 + j, 1, 1); } } }
  const piezas = (c, ps) => { c.fillStyle = OUT; for (const [x, y, w, h] of ps) c.fillRect(x - 1, y - 1, w + 2, h + 2); for (const [x, y, w, h, col] of ps) { c.fillStyle = col; c.fillRect(x, y, w, h); } };
  const CEN_P = { o: OUT, h: '#9badb7', H: '#cbdbfc', d: '#696a6a', y: '#fbf236', s: '#eec39a', S: '#d9a066', e: '#222034', r: '#d95763', R: '#ac3232', w: '#ffffff', k: '#663931', p: '#3f3f74', b: '#45283c' };
  const CEN = ['....ooo....', '...ohyho...', '..ohHhhdo..', '.oddddddddo', '..osssSso..', '..ossseso..', '..osssSSo..', '...oooSo...', '..orrwwro..', '.orrrrwrro.', '.orrrrrwso.', '.oRrrrrrRo.', '..okkykko..', '..opppppo..'];
  const PIER = [['..opo.opo..', '..obo.obo..', '.obbo.obbo.'], ['...opopo...', '...obobo...', '..obbobbo..']];
  // centinela de la muralla: morrión con penacho, casaca roja con banda, lanza que levanta al ver a Itzel
  FD.centinela = (c, e, t) => {
    const alerta = e.lanza > 0, paso = Math.floor(e.anim * 6) % 2;
    if (alerta) piezas(c, [[4, -25, 1, 19, '#8f563b'], [3, -27, 3, 2, '#cbdbfc'], [4, -29, 1, 2, '#ffffff']]);
    mapa(c, CEN, CEN_P, -5, -17); mapa(c, PIER[paso], CEN_P, -5, -3);
    if (parpadea(e, t)) { c.fillStyle = CEN_P.s; c.fillRect(1, -12, 1, 1); }
    if (!alerta) piezas(c, [[4, -7, 9, 1, '#8f563b'], [13, -8, 2, 3, '#cbdbfc'], [15, -7, 1, 1, '#ffffff']]);
  };
  // gaviota: lomo gris, puntas negras, pico amarillo con su punto rojo; tres posturas de ala
  FD.gaviota = (c, e, t) => {
    const pic = e.st === 'dive', al = pic ? 3 : e.st === 'sleep' || e.st === 'gone' ? 0 : Math.floor(t * 8 + e.anim) % 3;
    const alas = [[[-3, -11, 5, 3, '#9badb7'], [-3, -12, 2, 1, OUT]], [[-7, -8, 8, 2, '#9badb7'], [-9, -8, 2, 1, OUT]], [[-3, -4, 5, 3, '#9badb7'], [-3, -1, 2, 1, OUT]], [[-5, -8, 7, 2, '#9badb7']]][al];
    piezas(c, [[-8, -6, 3, 2, '#ffffff'], [-5, -7, 10, 4, '#ffffff'], [4, -9, 3, 3, '#ffffff'], [7, -8, 3, 1, '#fbf236']].concat(pic ? [[-1, -3, 2, 1, '#df7126']] : []));
    c.fillStyle = '#cbdbfc'; c.fillRect(-4, -4, 8, 1); c.fillStyle = '#9badb7'; c.fillRect(-4, -7, 7, 1);
    c.fillStyle = '#ac3232'; c.fillRect(9, -8, 1, 1); c.fillStyle = OUT; c.fillRect(5, -8, 1, 1);
    piezas(c, alas);
  };
  // marcianito: dos tonos, ojos que brillan
  FD.invasor = (c, e, t, s) => {
    const P = pal(s), fr = Math.floor(t * 2) % 2, rows = fr ? ['0010000100', '0001001000', '0011111100', '0110110110', '1111111111', '1011111101', '1010000101', '0001101100'] : ['0010000100', '1001001001', '1011111101', '1110110111', '1111111111', '0111111110', '0010000100', '0100000010'];
    const u = 1.2, on = (i, j) => rows[j] && rows[j][i] === '1';
    c.fillStyle = OUT; rows.forEach((r, j) => { for (let i = 0; i < 10; i++) if (r[i] === '1') c.fillRect(-6 + i * u - .5, -10 + j * u - .5, u + 1, u + 1); });
    rows.forEach((r, j) => { for (let i = 0; i < 10; i++) if (r[i] === '1') { c.fillStyle = !on(i, j - 1) ? P.ml : !on(i, j + 1) ? P.ms : P.m; c.fillRect(-6 + i * u, -10 + j * u, u, u); } });
    if (!dormido(e)) for (const i of [3, 6]) { brilla(c, -6 + i * u + .6, -10 + 3 * u + .6, 2, P.e, .8); c.fillStyle = P.e; c.fillRect(-6 + i * u, -10 + 3 * u, u, u); }
  };

  // ---------------- ocaso: siluetas a contraluz ----------------
  const SIL = '#12081a', SOL = '#ff9a70';
  // garza: cuello en S, penacho, una pata recogida; al picar estira el cuello como resorte
  FD.garza = (c, e, t) => {
    const pica = e.st === 'lunge' ? 1 : 0, cue = pica * 8, resp = Math.sin(t * 2 + e.hx) * .3;
    trazo(c, [[0, 0], [0, -10]], .7, SIL, { lw: 0 }); trazo(c, [[-.6, -6], [-3, -8.4], [-.8, -9.6]], .6, SIL, { lw: 0 });
    vol(c, c => { c.moveTo(-8, -10.4); c.quadraticCurveTo(-6, -15.6 + resp, 1, -14.6); c.quadraticCurveTo(4, -13.4, 3.4, -11); c.quadraticCurveTo(0, -8.4, -4, -9.4); c.closePath(); }, SIL, { s: false, l: rgba(SOL, .55), d: [-1.2, 1], lw: 0 });
    const nx = 2 + cue * .6, ny = -22 + cue * .3;
    trazo(c, [[2.4, -13.6], [5.2 + cue * .2, -16.6, 1.4 + cue * .4, -18.6], [-.6 + cue * .3, -20.6, nx, ny]], 1.3, SIL, { lw: 0 });
    vol(c, c => c.ellipse(nx, ny - .4, 1.9, 1.6, 0, 0, TAU), SIL, { s: false, l: rgba(SOL, .6), d: [-1, .8], lw: 0 });
    c.fillStyle = SIL; c.beginPath(); c.moveTo(nx + 1.2, ny - 1); c.lineTo(nx + 8 + cue * .4, ny + .2 + cue * .1); c.lineTo(nx + 1.2, ny + .4); c.fill();
    c.strokeStyle = SIL; c.lineWidth = .35; c.beginPath(); c.moveTo(nx - 1.4, ny - 1); c.quadraticCurveTo(nx - 4, ny - 1.6, nx - 6, ny + .4 + Math.sin(t * 3) * .5); c.stroke();
    c.fillStyle = SOL; c.beginPath(); c.arc(nx + .6, ny - .8, .35, 0, TAU); c.fill();
  };
  // zancudos: un enjambre de cuatro, con patas largas, piquete y alitas que zumban
  FD.zancudo = (c, e, t) => {
    for (let k = 0; k < 4; k++) {
      const a = t * 9 + k * 2.1, x = Math.cos(a) * 5 + Math.sin(t * 3 + k) * 2, y = -5 + Math.sin(a * 1.3) * 3.5, fl = Math.sin(t * 70 + k);
      c.save(); c.translate(x, y); c.rotate(Math.sin(a) * .2);
      c.fillStyle = rgba(SOL, .35); c.beginPath(); c.ellipse(-.4, -1.2 - fl * .3, 1.6, .55, -.4, 0, TAU); c.fill();
      c.strokeStyle = SIL; c.lineWidth = .22; c.beginPath(); for (const dx of [-.8, 0, .8]) { c.moveTo(dx, .2); c.lineTo(dx - .6, 1.8); c.lineTo(dx - .2, 2.6); } c.stroke();
      c.fillStyle = SIL; c.beginPath(); c.ellipse(-1.2, .1, 1.5, .55, .25, 0, TAU); c.fill(); c.beginPath(); c.arc(.6, -.1, .7, 0, TAU); c.fill();
      c.strokeStyle = SIL; c.lineWidth = .25; c.beginPath(); c.moveTo(1.1, 0); c.lineTo(2.8, .7); c.stroke();
      c.fillStyle = SOL; c.fillRect(.7, -.4, .3, .3);
      c.restore();
    }
  };

  // ---------------- acuarela ----------------
  // mojarra: escamas, aleta de espinas y panza dorada; solo se ve cuando salta
  FD.mojarra = (c, e, t) => {
    if (!e.nada) return;
    c.rotate(Math.atan2(e.vy, Math.abs(e.vx) + 1) * .8);
    const P = { ln: '#2a3a4a' }, cuerpo = '#7aa8c8', col = Math.sin(t * 14) * .8;
    vol(c, c => { c.moveTo(-5, -3); c.lineTo(-9.4, -6.4 + col); c.quadraticCurveTo(-8.2, -3, -9.4, .4 + col); c.closePath(); }, '#5a88aa', { lw: .4, ln: P.ln });
    vol(c, c => { c.moveTo(-3, -5.6); c.lineTo(-1.6, -8.2); c.lineTo(0, -6.2); c.lineTo(1.2, -8); c.lineTo(2.6, -5.8); c.closePath(); }, '#5a88aa', { lw: .35, ln: P.ln });
    vol(c, c => c.ellipse(0, -3, 6.2, 3.5, 0, 0, TAU), cuerpo, { hl: [-1, -4.6, 2.2], ln: P.ln, lw: .45, tex: c => {
      c.fillStyle = '#f2d080'; c.beginPath(); c.ellipse(1, -1.2, 4.6, 1.5, 0, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(40,70,100,.35)'; c.lineWidth = .25; for (let x = -4; x < 4; x += 1.3) for (let y = -5; y < -1; y += 1.3) { c.beginPath(); c.arc(x + (y % 2.6 ? .6 : 0), y, .6, .3, Math.PI - .3); c.stroke(); }
    } });
    vol(c, c => c.ellipse(.6, -2, 1.4, .8, .5, 0, TAU), '#9ac0da', { lw: .3, ln: P.ln });
    ojo(c, e, t, 3.6, -3.7, .85, { iris: '#e0a030', piel: cuerpo, ln: P.ln });
    c.strokeStyle = P.ln; c.lineWidth = .3; c.beginPath(); c.arc(5.4, -2.4, .7, .4, 1.8); c.stroke();
  };
  // libélula: ojos compuestos enormes, cuatro alas con nervaduras y cola de segmentos
  FD.libelula = (c, e, t) => {
    const ln = '#1e3a38', ala = Math.sin(t * 50) * .55;
    for (const [ox, sgn, dy] of [[-1.4, 1, 0], [1.4, -1, .4]]) for (const up of [1, -1]) {
      c.save(); c.translate(ox, -3.2); c.rotate(up * (.25 + ala * .6) * sgn - (up < 0 ? 0 : 0)); c.fillStyle = 'rgba(210,236,246,.5)'; c.strokeStyle = 'rgba(60,110,120,.55)'; c.lineWidth = .2;
      c.beginPath(); c.ellipse(0, -up * (2.6 + dy), 1.4, 3, 0, 0, TAU); c.fill(); c.stroke(); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -up * 5.4); c.stroke(); c.restore();
    }
    for (let i = 0; i < 6; i++) vol(c, c => c.ellipse(-2.4 - i * 1.25, -3.2 + Math.sin(i * .5) * .2, .8, .6, 0, 0, TAU), i % 2 ? '#3a8a80' : '#4aa898', { lw: .25, ln, s: false });
    vol(c, c => c.ellipse(1.6, -3.4, 2, 1.4, 0, 0, TAU), '#2f7a72', { hl: [1.2, -4, .9], ln, lw: .35 });
    vol(c, c => c.arc(4.2, -3.6, 1.6, 0, TAU), '#2a5a8a', { hl: [3.8, -4.2, .9], ln, lw: .35, tex: c => { c.fillStyle = 'rgba(160,220,255,.35)'; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(3.6 + (k % 3) * .7, -4.4 + Math.floor(k / 3) * .9, .3, 0, TAU); c.fill(); } } });
  };

  // ---------------- papel ----------------
  // tijeras: hojas de acero con bisel; los agujeros del mango son sus ojos
  FD.tijeras = (c, e, t) => {
    const ab = (e.t % 1.4) < .55 ? Math.sin(((e.t % 1.4) / .55) * Math.PI) * .7 : 0, ln = '#3a2a2a';
    for (const s of [1, -1]) { c.save(); c.translate(0, -5); c.rotate(s * ab); vol(c, c => { c.moveTo(-.4, -1); c.lineTo(10.4, -.2 * s); c.lineTo(-.4, 1); c.closePath(); }, '#c9d3dc', { ln, lw: .35, hl: [4, -.4, 2], tex: c => { c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.moveTo(0, -.2 * s); c.lineTo(9, -.25 * s); c.lineTo(0, .3 * s); c.fill(); } }); c.restore(); }
    for (const s of [1, -1]) { vol(c, c => { c.ellipse(-4, -5 + s * 2.5, 3.1, 2.1, 0, 0, TAU); }, '#e83f6f', { ln, lw: .4, hl: [-4.8, -5.6 + s * 2.5, 1.2] }); ojo(c, e, t, -4, -5 + s * 2.5, 1.35, { ax: 1.1, piel: '#e83f6f', ln, enojo: ab > .2 ? .7 : .2 }); }
    vol(c, c => c.arc(0, -5, .95, 0, TAU), '#b08a5a', { ln, lw: .3 }); c.fillStyle = ln; c.fillRect(-.6, -5.1, 1.2, .25);
  };
  // grulla de origami: caras de papel dobladas, cada una con su luz
  FD.grulla = (c, e, t) => {
    const al = Math.sin(t * 5 + e.anim) * 3, ln = 'rgba(120,80,50,.6)';
    const cara = (pts, col) => { c.fillStyle = col; c.strokeStyle = ln; c.lineWidth = .25; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill(); c.stroke(); };
    cara([[-3, -4], [2, -4], [-1, -11 - al]], '#f6bd60'); cara([[-1, -4], [2, -4], [-1, -11 - al]], '#e0a040');
    cara([[-8, -4], [-2, -4], [-2, -1.4]], '#efe4d0'); cara([[-2, -4], [6, -4], [-2, -1]], '#fffaf0'); cara([[6, -4], [10, -9.4], [7.2, -3]], '#fffaf0'); cara([[8.6, -7.4], [10, -9.4], [11.6, -8.6]], '#e4572e');
    cara([[-1, -4], [3, -4], [1, 1.4 + al * .4]], '#e4572e'); cara([[1, -4], [3, -4], [1, 1.4 + al * .4]], '#c84020');
  };

  // ---------------- bioluminiscente ----------------
  const NEO = '#5fffe0', NOCHE = '#06141a';
  // polilla: antenas de pluma, alas con ojos que brillan
  FD.polilla = (c, e, t) => {
    const al = Math.sin(t * 22 + e.anim * 5), ln = '#2a1e3a';
    brilla(c, 0, -3, 7, NEO, .2);
    for (const s of [1, -1]) { c.save(); c.translate(-.4, -3); c.scale(1, s * (1 + al * .35)); vol(c, c => { c.moveTo(0, 0); c.quadraticCurveTo(-1, -4.6, -4.4, -4.2); c.quadraticCurveTo(-5, -1.4, 0, 0); c.closePath(); }, '#c9b8e8', { ln, lw: .3, s: false, tex: c => { c.fillStyle = '#8a74b8'; c.beginPath(); c.arc(-2.8, -2.6, 1, 0, TAU); c.fill(); c.fillStyle = NEO; c.beginPath(); c.arc(-2.8, -2.6, .45, 0, TAU); c.fill(); } }); c.restore(); }
    vol(c, c => c.ellipse(0, -3, 2.6, 1, 0, 0, TAU), NOCHE, { ln, lw: .3, s: false, tex: c => { c.strokeStyle = 'rgba(200,190,240,.5)'; c.lineWidth = .2; for (let x = -2; x < 2; x += .7) { c.beginPath(); c.moveTo(x, -3.8); c.lineTo(x, -2.2); c.stroke(); } } });
    c.strokeStyle = '#c9b8e8'; c.lineWidth = .25; for (const s of [1, -1]) { c.beginPath(); c.moveTo(2.2, -3.2); c.quadraticCurveTo(3.6, -3.2 - s * 2, 4.2, -3.2 - s * 2.6); c.stroke(); for (let k = 1; k < 4; k++) { const x = 2.2 + k * .55, y = -3.2 - s * k * .7; c.beginPath(); c.moveTo(x, y); c.lineTo(x + .5, y - s * .3); c.stroke(); } }
    c.fillStyle = '#ff8ff0'; c.beginPath(); c.arc(2.4, -3, .55, 0, TAU); c.fill(); brilla(c, 2.4, -3, 1.6, '#ff8ff0', .5);
  };
  // esporín: hongo con sombrero de puntos que brillan, laminillas y carita; se infla y suelta esporas
  FD.esporin = (c, e, t) => {
    const k = e.infla > 0 ? 1 + e.infla : 1 + Math.sin(t * 2) * .05, ln = '#04101a';
    vol(c, c => { c.moveTo(-2.2, 0); c.quadraticCurveTo(-2.6, -3, -1.8, -5.4); c.lineTo(1.8, -5.4); c.quadraticCurveTo(2.6, -3, 2.2, 0); c.closePath(); }, '#2a5060', { ln, lw: .35, hl: [-.8, -3, 1] });
    ojo(c, e, t, -.8, -3, .55, { piel: '#2a5060', blanco: NEO, ln }); ojo(c, e, t, 1, -3, .55, { piel: '#2a5060', blanco: NEO, ln });
    c.fillStyle = 'rgba(95,255,224,.25)'; c.beginPath(); c.ellipse(0, -5.6 * k, 6.6 * k, 1.2 * k, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(95,255,224,.4)'; c.lineWidth = .2; for (let x = -5; x <= 5; x += 1) { c.beginPath(); c.moveTo(x * k, -5.4 * k); c.lineTo(x * .3, -5); c.stroke(); }
    vol(c, c => { c.ellipse(0, -6.4 * k, 7 * k, 4.6 * k, 0, Math.PI, 0); c.closePath(); }, '#1e4a5a', { ln, lw: .4, hl: [-2.4 * k, -9 * k, 2.4] });
    for (let i = 0; i < 6; i++) { const x = (-5.4 + i * 2.15) * k, y = (-7.6 - Math.sin(i / 5 * Math.PI) * 2.4) * k, p = .7 + Math.sin(t * 3 + i) * .3; brilla(c, x, y, 2, NEO, .45 * p); c.fillStyle = NEO; c.beginPath(); c.arc(x, y, .6 + (i % 2) * .25, 0, TAU); c.fill(); }
  };
  FXD.esporin = (c, e, t) => { if (!(e.infla > 0)) return; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + t, r = 6 + e.infla * 10; c.fillStyle = rgba(NEO, .6 * (1 - e.infla * .5)); c.beginPath(); c.arc(Math.cos(a) * r, -8 + Math.sin(a) * r * .6, .5, 0, TAU); c.fill(); } };

  // ---------------- diseño plano ----------------
  const AZUL = '#2a2347', CORAL = '#ff6b5b', CREMA = '#f4efe6';
  // bucanero: pañoleta, arete, barba y bala de cañón; sin contorno, a dos tonos
  FD.bucanero = (c, e, t) => {
    const tira = e.tiro > 0, brazo = tira ? -7 : -3, piel = '#c98a5e', pielS = '#a86e48', paso = Math.sin(e.anim * 6) * .4;
    c.fillStyle = AZUL; c.fillRect(-3, -6, 2, 6 + paso); c.fillRect(1, -6, 2, 6 - paso); c.fillStyle = '#1a1530'; c.fillRect(-3.4, -.8, 2.8, .8); c.fillRect(.6, -.8, 2.8, .8);
    c.fillStyle = CREMA; c.beginPath(); roundRect(c, -4, -12.6, 8, 7, 1.2); c.fill(); c.fillStyle = CORAL; for (let k = 0; k < 3; k++) c.fillRect(-4, -11.4 + k * 2, 8, .8); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(1, -12.6, 3, 7);
    c.fillStyle = '#3a2a1a'; c.fillRect(-4.2, -6.4, 8.4, 1);
    c.fillStyle = piel; c.beginPath(); c.arc(0, -14.6, 2.7, 0, TAU); c.fill(); c.fillStyle = pielS; c.beginPath(); c.arc(0, -14.6, 2.7, -.4, Math.PI * .6); c.fill();
    c.fillStyle = '#4a2a1a'; c.beginPath(); c.moveTo(-1.6, -13.2); c.quadraticCurveTo(0, -10.4, 2.4, -13); c.lineTo(2.4, -14); c.quadraticCurveTo(.4, -12.6, -1.6, -13.8); c.fill();
    c.fillStyle = CORAL; c.beginPath(); c.arc(0, -15.6, 2.8, Math.PI, 0); c.fill(); c.beginPath(); c.moveTo(-2.6, -15.6); c.lineTo(-5.4, -13.6 + Math.sin(t * 5) * .5); c.lineTo(-3.8, -15.8); c.fill();
    c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(-1.8, -13.6, .45, 0, TAU); c.fill();
    if (parpadea(e, t)) { c.fillStyle = '#1a1530'; c.fillRect(1, -15, 1.2, .3); } else { c.fillStyle = '#1a1530'; c.beginPath(); c.arc(1.5, -14.9, .5, 0, TAU); c.fill(); }
    c.strokeStyle = piel; c.lineWidth = 1.3; c.lineCap = 'round'; c.beginPath(); c.moveTo(3, -11); c.lineTo(5, brazo - 8); c.stroke();
    if (!tira) { c.fillStyle = '#2a2a34'; c.beginPath(); c.arc(5.4, brazo - 9, 2.2, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(4.8, brazo - 9.6, .7, 0, TAU); c.fill(); }
  };
  // fragata: alas en ángulo, buche rojo inflado, pico de gancho
  FD.fragata = (c, e, t) => {
    const al = e.st === 'dive' ? 3 : Math.sin(t * 4 + e.anim) * 2;
    c.fillStyle = AZUL; c.beginPath(); c.moveTo(-11, -4.6 - al); c.lineTo(-4.4, -7.6); c.lineTo(0, -4.4); c.lineTo(4.4, -7.6); c.lineTo(11, -4.6 - al); c.lineTo(3.6, -5.6); c.lineTo(0, -2.4); c.lineTo(-3.6, -5.6); c.closePath(); c.fill();
    c.fillStyle = '#3a3360'; c.beginPath(); c.moveTo(-4.4, -7.6); c.lineTo(0, -4.4); c.lineTo(-3.6, -5.6); c.fill(); c.beginPath(); c.moveTo(4.4, -7.6); c.lineTo(0, -4.4); c.lineTo(3.6, -5.6); c.fill();
    c.fillStyle = AZUL; c.beginPath(); c.moveTo(0, -4.2); c.lineTo(-6.4, -2.4); c.lineTo(-8.4, -5); c.lineTo(-4, -4.6); c.fill();
    c.fillStyle = CORAL; c.beginPath(); c.ellipse(2.6, -2.2, 2 + Math.sin(t * 3) * .2, 1.6, 0, 0, TAU); c.fill(); c.fillStyle = '#ff9a8a'; c.beginPath(); c.ellipse(2.2, -2.7, .8, .5, 0, 0, TAU); c.fill();
    c.fillStyle = '#9a9aaa'; c.beginPath(); c.moveTo(3, -4.4); c.lineTo(7.4, -3.8); c.quadraticCurveTo(8, -3.2, 7.2, -3); c.lineTo(3, -3.4); c.fill();
    c.fillStyle = CREMA; c.beginPath(); c.arc(2.4, -4.4, .45, 0, TAU); c.fill();
  };

  // ---------------- sumi-e: tinta con aguada y pincel seco ----------------
  const TIN = '#1d1b19', ROJ = '#c23b2e', PAP = '#f0e7d2';
  // mancha de tinta: un charco que hierve, chorrea y salpica; si se pega deja un sello rojo
  FD.mancha = (c, e, t) => {
    const k = e.pegada > 0 ? .7 : 1, borde = i => (4.4 + Math.sin(i * 1.57 + t * 6) * 1 + Math.sin(i * 2.3 - t * 4) * .4) * k;
    const g = c.createRadialGradient(0, -4.5, 1, 0, -4.5, 9 * k); g.addColorStop(0, 'rgba(29,27,25,.22)'); g.addColorStop(1, 'rgba(29,27,25,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, -4.5, 9 * k, 0, TAU); c.fill();
    c.fillStyle = TIN; c.beginPath(); for (let i = 0; i <= 14; i++) { const a = i / 14 * TAU, r = borde(i); c.lineTo(Math.cos(a) * r, -4.5 + Math.sin(a) * r); } c.closePath(); c.fill();
    for (const [x, l] of [[-2.4, 2.4], [1.6, 3.4]]) { const y0 = -1.2, len = l + Math.sin(t * 2 + x) * .6; c.beginPath(); c.moveTo(x - .7, y0); c.quadraticCurveTo(x, y0 + len * .6, x - .1, y0 + len); c.quadraticCurveTo(x + .5, y0 + len * .6, x + .7, y0); c.fill(); c.beginPath(); c.arc(x - .1, y0 + len, .6, 0, TAU); c.fill(); }
    for (let i = 0; i < 5; i++) { const a = i * 1.3 + t * 1.6, r = 6.4 + Math.sin(t * 3 + i) * .6; c.beginPath(); c.arc(Math.cos(a) * r, -4.5 + Math.sin(a) * r, .45 + (i % 3) * .25, 0, TAU); c.fill(); }
    c.strokeStyle = 'rgba(240,231,210,.25)'; c.lineWidth = .25; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-3.6 + i * .5, -7 + i * .6); c.quadraticCurveTo(-1 + i * .4, -8 + i * .5, 2.4 - i * .2, -6.6 + i * .7); c.stroke(); }
    ojo(c, e, t, -1.5, -5.4, 1.15, { blanco: PAP, pupila: TIN, piel: TIN, ln: TIN }); ojo(c, e, t, 1.6, -5.5, 1.2, { blanco: PAP, pupila: TIN, piel: TIN, ln: TIN });
    if (e.pegada > 0) { c.fillStyle = ROJ; c.fillRect(-2, -1.8, 4, 3); c.strokeStyle = PAP; c.lineWidth = .3; c.strokeRect(-1.5, -1.3, 3, 2); c.beginPath(); c.moveTo(-.8, -.9); c.lineTo(.8, -.9); c.moveTo(0, -1.2); c.lineTo(0, .4); c.moveTo(-.8, .2); c.lineTo(.8, .2); c.stroke(); }
  };
  // koi de tinta: cuerpo en aguada de la cabeza a la cola, aletas de pincel seco y manchas bermellón
  FD.koi = (c, e, t) => {
    const ond = Math.sin(t * 6 + e.anim) * 2, cola = Math.sin(t * 6 + e.anim + 1.2) * 2.6;
    const cuerpo = c => { c.moveTo(7.4, -4); c.bezierCurveTo(5, -8.4, -2, -7.6, -6.4, -4 + ond * .25); c.bezierCurveTo(-2, -.6, 4.4, -.6, 7.4, -4); c.closePath(); };
    for (const [y0, y1] of [[-4, -8.6], [-4, .6]]) { c.fillStyle = 'rgba(29,27,25,.28)'; c.beginPath(); c.moveTo(-5.6, -4 + ond * .3); c.quadraticCurveTo(-9, (y0 + y1) / 2 + cola * .4, -11, y1 + cola); c.quadraticCurveTo(-9.6, -4 + cola * .3, -11, (y1 > y0 ? -4 : -4) + (y1 - y0) * .2 + cola); c.closePath(); c.fill(); }
    c.strokeStyle = 'rgba(29,27,25,.55)'; c.lineWidth = .2; for (let i = 0; i < 6; i++) { const y = -8 + i * 1.6; c.beginPath(); c.moveTo(-6, -4 + ond * .3); c.lineTo(-10.6, y + cola * (1 - Math.abs(y + 4) / 6)); c.stroke(); }
    const g = c.createLinearGradient(7, 0, -6, 0); g.addColorStop(0, TIN); g.addColorStop(.6, 'rgba(29,27,25,.85)'); g.addColorStop(1, 'rgba(29,27,25,.45)');
    c.fillStyle = g; c.beginPath(); cuerpo(c); c.fill();
    c.save(); c.beginPath(); cuerpo(c); c.clip();
    c.strokeStyle = 'rgba(240,231,210,.8)'; c.lineWidth = .9; c.beginPath(); c.moveTo(6.4, -4.8); c.quadraticCurveTo(0, -5.6, -6, -4.2 + ond * .25); c.stroke();
    c.strokeStyle = 'rgba(240,231,210,.3)'; c.lineWidth = .25; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(6, -5 + i * .7); c.quadraticCurveTo(1, -6.6 + i * .9, -5, -4.4 + i * .5); c.stroke(); }
    c.restore();
    c.fillStyle = 'rgba(29,27,25,.4)'; c.beginPath(); c.moveTo(1.6, -2.4); c.quadraticCurveTo(.4, .6 + ond * .3, -1.6, .8); c.quadraticCurveTo(-.4, -1.2, 1.6, -2.4); c.fill();
    ojo(c, e, t, 4.9, -4.8, .6, { blanco: PAP, pupila: TIN, piel: TIN, ln: TIN });
    c.strokeStyle = TIN; c.lineWidth = .2; c.beginPath(); c.moveTo(7, -3.6); c.quadraticCurveTo(8.4, -2.6 + ond * .2, 9, -1.4); c.stroke();
  };

  // ---------------- neón: tubos con resplandor y núcleo blanco ----------------
  function tubo(c, ruta, col, w = .9) {
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    c.globalCompositeOperation = 'lighter'; c.beginPath(); ruta(c); c.strokeStyle = rgba(col, .22); c.lineWidth = w * 3.4; c.stroke(); c.beginPath(); ruta(c); c.strokeStyle = rgba(col, .45); c.lineWidth = w * 1.9; c.stroke();
    c.globalCompositeOperation = 'source-over'; c.beginPath(); ruta(c); c.strokeStyle = col; c.lineWidth = w; c.stroke(); c.beginPath(); ruta(c); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = w * .32; c.stroke();
    c.restore();
  }
  // bocina: gabinete con bocinas que laten al ritmo y ojitos de LED
  FD.bocina = (c, e, t) => {
    const k = 1 + (e.late || 0) * .6, rosa = '#ff2bd6', cian = '#00e8ff';
    const g = c.createLinearGradient(0, -17, 0, 0); g.addColorStop(0, '#24103e'); g.addColorStop(1, '#0c0418'); c.fillStyle = g; c.beginPath(); roundRect(c, -7, -17, 14, 16, 1.6); c.fill();
    c.fillStyle = 'rgba(255,43,214,.08)'; for (let y = -16; y < -2; y += 1.4) c.fillRect(-6, y, 12, .5);
    tubo(c, c => roundRect(c, -7, -17, 14, 16, 1.6), rosa, .8);
    tubo(c, c => { c.arc(0, -6.4, 4 * k, 0, TAU); }, cian, .7); tubo(c, c => c.arc(0, -6.4, 2.2 * k, 0, TAU), cian, .45);
    c.fillStyle = '#0a0414'; c.beginPath(); c.arc(0, -6.4, 1.2 * k, 0, TAU); c.fill(); brilla(c, 0, -6.4, 2 * k, cian, .3 + (e.late || 0) * .5);
    tubo(c, c => c.arc(0, -13.4, 1.5, 0, TAU), cian, .5);
    const cierra = parpadea(e, t), ojoY = -14.4;
    for (const d of [-1, 1]) tubo(c, c => { if (cierra) { c.moveTo(d * 4.6 - .9, ojoY); c.lineTo(d * 4.6 + .9, ojoY); } else { c.moveTo(d * 4.6 - .9, ojoY - .7 + (d > 0 ? 0 : .5)); c.lineTo(d * 4.6 + .9, ojoY - .7 + (d > 0 ? .5 : 0)); c.moveTo(d * 4.6, ojoY + .4); c.lineTo(d * 4.6, ojoY + .9); } }, rosa, .45);
    tubo(c, c => { c.moveTo(-4, -1); c.lineTo(-4.6, 0); c.moveTo(4, -1); c.lineTo(4.6, 0); }, rosa, .5);
    if (e.late > 0) for (let i = 1; i <= 2; i++) tubo(c, c => c.arc(0, -6.4, 4 * k + i * 2.4, -.7, .7), cian, .35);
  };
  // bailarín: copete, lentes oscuros, pasos de baile en tres poses
  FD.bailarin = (c, e, t) => {
    const p = (e.pose || 0) % 3, verde = '#3dff8a', rosa = '#ff2bd6', cian = '#00e8ff', ama = '#ffd23f';
    tubo(c, c => { c.moveTo(-3.4, 0); c.lineTo(-1.6, -3.4); c.lineTo(0, -7); c.lineTo(2 - p * .6, -3.6); c.lineTo(3.4 - p, 0); }, verde);
    tubo(c, c => { c.moveTo(-4.4, 0); c.lineTo(-2.6, 0); c.moveTo(2.6 - p, 0); c.lineTo(4.4 - p, 0); }, ama, .7);
    tubo(c, c => { c.moveTo(0, -7); c.quadraticCurveTo(-.4, -10, 0, -13); }, verde);
    tubo(c, c => { if (p === 0) { c.moveTo(-5.4, -16); c.lineTo(-2.6, -13.4); c.lineTo(0, -12.4); c.lineTo(2.6, -13.4); c.lineTo(5.4, -16); } else if (p === 1) { c.moveTo(-5, -9); c.lineTo(-2.4, -11.6); c.lineTo(0, -12.4); c.lineTo(3, -14.4); c.lineTo(6, -17.6); } else { c.moveTo(-6, -17.6); c.lineTo(-3, -14.4); c.lineTo(0, -12.4); c.lineTo(2.4, -11.6); c.lineTo(5, -9); } }, verde);
    tubo(c, c => c.arc(0, -15.6, 2.4, 0, TAU), rosa);
    tubo(c, c => { c.moveTo(-2, -18); c.quadraticCurveTo(0, -20.6, 3.4, -18.6); c.quadraticCurveTo(1.6, -18.2, 1.2, -17.6); }, ama, .7);
    tubo(c, c => { c.moveTo(-1.6, -15.8); c.lineTo(2.4, -15.8); }, cian, .7);
  };

  // ---------------- grabado (imprenta): erizo de tinta con cortes de gubia ----------------
  const TINTA = '#1f1a1c', PAPEL = '#efe5cf', ROJO = '#b3342b';
  FD.erizoTinta = (c, e, t) => {
    const k = e.curl || 0, a = Math.sin(e.anim * 10) * (1 - k), cy = -4 - k;
    c.fillStyle = TINTA; c.beginPath();
    for (let i = 0; i <= 18; i++) { const an = Math.PI + i / 18 * Math.PI * (1 + k), r = i % 2 ? 6.2 + k : 9.4 + k * 2.4 + Math.sin(i * 3.3) * .5; c.lineTo(Math.cos(an) * r, cy + Math.sin(an) * r * (.8 + k * .2)); }
    c.closePath(); c.fill();
    c.strokeStyle = PAPEL; c.lineWidth = .5; c.lineCap = 'round'; c.beginPath();
    for (let i = 1; i < 16; i++) { const an = Math.PI + i / 16 * Math.PI * (1 + k); c.moveTo(Math.cos(an) * 2.2, cy + Math.sin(an) * 1.8); c.lineTo(Math.cos(an) * (6.4 + k), cy + Math.sin(an) * (5.2 + k)); }
    c.stroke(); c.lineWidth = .25; c.beginPath(); for (let i = 1; i < 16; i += 2) { const an = Math.PI + (i + .5) / 16 * Math.PI * (1 + k); c.moveTo(Math.cos(an) * 4, cy + Math.sin(an) * 3.2); c.lineTo(Math.cos(an) * (5.6 + k), cy + Math.sin(an) * (4.4 + k)); } c.stroke();
    if (k < .5) {
      c.fillStyle = PAPEL; c.beginPath(); c.moveTo(3.6, -6.2); c.bezierCurveTo(7, -6.6, 9, -4.6, 10.4, -2.8); c.quadraticCurveTo(9, -1, 6, -1); c.bezierCurveTo(4.4, -1, 3.2, -2.6, 3.6, -6.2); c.fill();
      c.strokeStyle = TINTA; c.lineWidth = .45; c.stroke();
      c.lineWidth = .25; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(4.4 + i * .8, -1.4); c.lineTo(5.4 + i * .8, -2.8); c.stroke(); }
      c.fillStyle = ROJO; c.beginPath(); c.arc(10.3, -2.9, 1, 0, TAU); c.fill();
      ojo(c, e, t, 6.8, -4.3, .8, { blanco: PAPEL, pupila: TINTA, piel: PAPEL, ln: TINTA });
      c.fillStyle = TINTA; c.fillRect(-4 + a, -1, 1.6, 1.4); c.fillRect(2 - a, -1, 1.6, 1.4);
    } else { c.fillStyle = ROJO; c.beginPath(); c.arc(0, cy, 1.6, 0, TAU); c.fill(); }
  };

  // ---------------- los de las fiestas, con el kit ----------------
  // diablito de pastorela: máscara de cartón pintada, capa con pliegues, trinche y cola de flecha
  FD.diablito = (c, e, t, s) => {
    const P = pal({ main: '#d9443a', dark: '#1a1a2a', light: '#fffaf0', accent: '#ffd23f', eye: '#ffffff' }), a = Math.sin(e.anim * 9) * 1.2, sal = e.vy < 0 ? -1 : 0;
    trazo(c, [[-1.4, -2.4], [-6.4, -1.4 + a * .3, -6.6 - a * .4, -5.4]], .5, P.d, { lw: .5 });
    vol(c, c => { c.moveTo(-6.6 - a * .4, -5.4); c.lineTo(-8, -6.4); c.lineTo(-6.6, -7.6); c.lineTo(-5.6, -6); c.closePath(); }, P.d, { lw: .35 });
    vol(c, c => { c.moveTo(-6.4, 0); c.quadraticCurveTo(-3, -6 + sal, -.4, -10.6 + sal); c.lineTo(.4, -10.6 + sal); c.quadraticCurveTo(3, -6 + sal, 6.4, 0); c.quadraticCurveTo(0, -1.2, -6.4, 0); c.closePath(); }, '#2a2236', { tex: c => { c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = .35; for (const x of [-3.6, -1.4, 1.4, 3.6]) { c.beginPath(); c.moveTo(x * .2, -9.6 + sal); c.lineTo(x, -.6); c.stroke(); } } });
    vol(c, c => { c.moveTo(-3.6, 0); c.lineTo(0, -8.6 + sal); c.lineTo(3.6, 0); c.closePath(); }, P.m, { lw: .4 });
    for (const d of [-1, 1]) vol(c, c => { c.moveTo(d * 2.2, -13.4 + sal); c.quadraticCurveTo(d * 4.6, -15 + sal, d * 4.8, -18.4 + sal); c.quadraticCurveTo(d * 3.2, -16 + sal, d * 1, -14.4 + sal); c.closePath(); }, P.l, { lw: .4, tex: c => { c.strokeStyle = 'rgba(120,90,60,.5)'; c.lineWidth = .25; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(d * (2.8 + k * .6), -14.4 - k * 1.1 + sal); c.lineTo(d * (2 + k * .7), -13.8 - k * 1.2 + sal); c.stroke(); } } });
    vol(c, c => c.ellipse(0, -11.6 + sal, 3.5, 3.7, 0, 0, TAU), P.m, { hl: [-1.2, -13 + sal, 1.6] });
    c.strokeStyle = P.d; c.lineWidth = .7; c.lineCap = 'round'; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * .4, -13.2 + sal); c.lineTo(d * 2.6, -14 + sal); c.stroke(); }
    for (const d of [-1, 1]) ojo(c, e, t, d * 1.4, -12.2 + sal, .85, { piel: P.m, enojo: .5, ln: P.d });
    vol(c, c => { c.moveTo(-2.2, -10.4 + sal); c.quadraticCurveTo(0, -8 + sal, 2.2, -10.4 + sal); c.closePath(); }, '#3a0a10', { lw: .35, ln: P.d, s: false, l: false });
    c.fillStyle = '#fffaf0'; for (let k = -1; k <= 1; k++) c.fillRect(k * .9 - .3, -10.4 + sal, .6, .6);
    c.strokeStyle = P.a; c.lineWidth = .6; c.lineCap = 'round'; c.beginPath(); c.moveTo(5, 1); c.lineTo(5 + a * .3, -14); c.moveTo(3.4, -13); c.lineTo(3.4, -15.4); c.moveTo(5 + a * .3, -14); c.lineTo(5 + a * .3, -16.2); c.moveTo(6.6, -13); c.lineTo(6.6, -15.4); c.moveTo(3.4, -13); c.lineTo(6.6, -13); c.stroke();
  };
  // pintador del Carnaval: boina, paleta y globo de pintura; en tubos de neón
  const NEONES = ['#ff2bd6', '#00e8ff', '#3dff8a', '#ffd23f', '#ff7a2b'];
  FD.pintador = (c, e, t) => {
    const a = Math.sin(e.anim * 8) * 1.4, br = e.lanza > 0 ? -1 : 0, col = NEONES[Math.floor(t * 2) % 5];
    tubo(c, c => { c.moveTo(-3.6, 0); c.lineTo(-2.6 + a * .3, -6.6); c.moveTo(3.6, 0); c.lineTo(2.6 - a * .3, -6.6); }, '#00e8ff', .8);
    c.fillStyle = '#14062a'; c.beginPath(); roundRect(c, -4, -13, 8, 6.4, 1.2); c.fill(); tubo(c, c => roundRect(c, -4, -13, 8, 6.4, 1.2), '#00e8ff', .8);
    for (let k = 0; k < 3; k++) { c.fillStyle = NEONES[k + 1]; c.beginPath(); c.arc(-2 + k * 2, -9.6, .55, 0, TAU); c.fill(); }
    tubo(c, c => c.arc(0, -15.6, 2.5, 0, TAU), '#ff2bd6', .8);
    c.fillStyle = 'rgba(255,210,63,.35)'; c.beginPath(); c.moveTo(-3.4, -17.4); c.quadraticCurveTo(-1.6, -20.8, 2.6, -19.4); c.quadraticCurveTo(4.2, -18.4, 3, -17.6); c.closePath(); c.fill();
    tubo(c, c => { c.moveTo(-3.4, -17.4); c.quadraticCurveTo(-1.6, -20.8, 2.6, -19.4); c.quadraticCurveTo(4.2, -18.4, 3, -17.6); c.closePath(); c.moveTo(-.2, -20); c.lineTo(.2, -21); }, '#ffd23f', .7);
    tubo(c, c => { c.moveTo(-1.6, -15.4); c.lineTo(-.6, -15.4); c.moveTo(.6, -15.4); c.lineTo(1.6, -15.4); c.moveTo(-.8, -14.2); c.quadraticCurveTo(0, -13.6, .8, -14.2); }, '#3dff8a', .45);
    tubo(c, c => { c.moveTo(3, -12); c.lineTo(7, -12 + br * 6); }, '#00e8ff', .8);
    brilla(c, 7.4, -12.6 + br * 6, 4, col, .6); c.fillStyle = col; c.beginPath(); c.arc(7.4, -12.6 + br * 6, 2, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(6.8, -13.2 + br * 6, .6, 0, TAU); c.fill();
  };
  // torito de petate: tejido de palma, cuernos dorados y su castillo de cohetes que chisporrotea al correr
  FD.torito = (c, e, t) => {
    const corre = e.st === 'run', a = Math.sin(e.anim * (corre ? 16 : 8)) * 1.5, oro = '#d4af37', ln = '#0b0e14';
    trazo(c, [[-2, 0], [-1 + a * .5, -6]], .8, '#efe3c8', { ln }); trazo(c, [[2, 0], [1 - a * .5, -6]], .8, '#efe3c8', { ln });
    const cu = c => { c.moveTo(-8, -6); c.lineTo(-8, -12); c.quadraticCurveTo(0, -16.4, 6, -12); c.lineTo(9, -13); c.lineTo(10.4, -10); c.lineTo(7, -8); c.lineTo(6, -6); c.closePath(); };
    vol(c, cu, '#1a1e28', { ln: oro, lw: .7, tex: c => { c.strokeStyle = 'rgba(212,175,55,.45)'; c.lineWidth = .4; for (let k = -10; k < 12; k += 1.6) { c.beginPath(); c.moveTo(k, -6); c.lineTo(k + 4, -16); c.stroke(); c.beginPath(); c.moveTo(k + 4, -6); c.lineTo(k, -16); c.stroke(); } } });
    trazo(c, [[8, -13], [10, -17, 12.4, -16]], .7, oro, { ln }); trazo(c, [[8.6, -13], [7, -18, 5, -18]], .7, oro, { ln });
    ojo(c, e, t, 8.2, -11, .7, { piel: '#1a1e28', iris: oro, enojo: corre ? .8 : .3, ln });
    for (let k = 0; k < 4; k++) { const cx = -6 + k * 4; trazo(c, [[cx + .7, -14 - (k % 2) * .6], [cx + .7, -17.4 - (k % 2)]], .6, '#d9443a', { ln, lw: .5 }); if (corre) { const ch = Math.floor(t * 20 + k) % 2; brilla(c, cx + .7, -18 - (k % 2), 3, ch ? '#fff3c4' : '#ff9a1f', .8); c.fillStyle = ch ? '#fff3c4' : '#ff9a1f'; c.beginPath(); c.arc(cx + .7, -18 - (k % 2), 1.1, 0, TAU); c.fill(); } }
  };
  FXD.torito = (c, e, t) => { if (e.st !== 'run') return; for (let k = 0; k < 6; k++) { const ph = (t * 2 + k / 6) % 1, x = -6 + (k % 4) * 4 + Math.cos(k * 2.3) * ph * 8, y = -18 - ph * 10 + ph * ph * 8; c.fillStyle = `rgba(255,${200 - ph * 120},80,${1 - ph})`; c.fillRect(x, y, .8, .8); } };

  // ---------------- de cualquier mundo (reciben la técnica del mundo) ----------------
  // chapulín: patas de salto enormes, antenas largas y ojo grande
  FD.chapulin = (c, e, t, s) => {
    const P = pal(s), air = (e.vy || 0) !== 0, a = Math.sin(e.anim * 12);
    c.save(); if (air) c.rotate(e.vy < 0 ? -.2 : .1);
    const pata = air ? [[-2.2, -4.4], [-6.4, -2.6], [-9.4, .4]] : [[-2.2, -4.4], [-5.2, -9.2], [-7.4, -.2]];
    trazo(c, pata.slice(0, 2), 1.5, P.m); trazo(c, pata.slice(1), .6, P.ms); c.strokeStyle = P.ln; c.lineWidth = .25; c.beginPath(); for (let k = 0; k < 3; k++) { const u = .3 + k * .25, x = pata[1][0] + (pata[2][0] - pata[1][0]) * u, y = pata[1][1] + (pata[2][1] - pata[1][1]) * u; c.moveTo(x, y); c.lineTo(x + .6, y - .5); } c.stroke();
    for (const [x, ph] of [[1.4, 0], [3, 1]]) trazo(c, [[x, -3], [x + .6 + (air ? 1 : a * .4 * (ph ? 1 : -1)), -.2]], .45, P.ms, { lw: .4 });
    vol(c, c => { c.moveTo(-6, -4.4); c.bezierCurveTo(-5, -7.2, 2, -7, 4.4, -5.6); c.lineTo(4.4, -3); c.bezierCurveTo(1, -2.4, -4, -2.6, -6, -4.4); c.closePath(); }, P.m, { hl: [-1, -6, 2], tex: c => { c.strokeStyle = P.ms; c.lineWidth = .3; for (let x = -4.6; x < 1; x += 1.1) { c.beginPath(); c.moveTo(x, -6.6); c.lineTo(x + .3, -2.8); c.stroke(); } c.fillStyle = P.l; c.beginPath(); c.ellipse(-1, -3.2, 4.4, .7, 0, 0, TAU); c.fill(); } });
    vol(c, c => { c.moveTo(-1, -6.4); c.quadraticCurveTo(-5, -7.6, -7.2, -5.8); c.quadraticCurveTo(-4, -5.2, -1, -5.4); c.closePath(); }, P.ms, { lw: .35 });
    vol(c, c => c.ellipse(5.4, -5, 2.1, 2.3, .3, 0, TAU), P.m, { hl: [4.8, -6.2, 1.1] });
    ojo(c, e, t, 5.9, -5.6, 1, { ax: .85, piel: P.m });
    c.strokeStyle = P.ln; c.lineWidth = .3; c.beginPath(); c.moveTo(6.6, -6.8); c.quadraticCurveTo(9, -11, 11, -10.4 + Math.sin(t * 5) * .5); c.moveTo(6, -7); c.quadraticCurveTo(7, -11.6, 9, -12 + Math.sin(t * 5 + 1) * .5); c.stroke();
    c.fillStyle = P.ln; c.beginPath(); c.moveTo(7.2, -4); c.lineTo(7.6, -3); c.lineTo(6.8, -3.2); c.fill();
    c.restore();
  };
  // pirata calavera: pañoleta, parche, camisa rayada y hueso para aventar
  FD.pirata = (c, e, t, s) => {
    const P = pal(s), a = Math.sin(e.anim * 9), apunta = e.aim > 0, hueso = '#efe6d0', ln = '#1c1626';
    trazo(c, [[-1.6, -5.4], [-1.6 + a, 0]], .9, hueso, { ln }); trazo(c, [[1.6, -5.4], [1.6 - a, 0]], .9, hueso, { ln });
    vol(c, c => roundRect(c, -3.6, -11.4, 7.2, 6.4, 1.4), CREMA, { ln, tex: c => { c.fillStyle = '#463848'; for (let k = 0; k < 3; k++) c.fillRect(-3.6, -10.6 + k * 2, 7.2, .9); } });
    trazo(c, [[-3.4, -10], [-4.6, -7.4 + a * .5]], .7, hueso, { ln });
    vol(c, c => { c.arc(0, -13.4, 3.5, Math.PI * .85, Math.PI * 2.15); c.lineTo(1.6, -10.4); c.lineTo(-1.6, -10.4); c.closePath(); }, hueso, { ln, hl: [-1.2, -14.8, 1.6] });
    c.fillStyle = ln; c.beginPath(); c.ellipse(1.4, -13.4, 1.05, 1.2, 0, 0, TAU); c.fill();
    if (!dormido(e)) { brilla(c, 1.4 + (e._mx || 0) * .3, -13.4, 1.6, '#ff5040', .7); c.fillStyle = '#ff7060'; c.beginPath(); c.arc(1.4 + (e._mx || 0) * .3, -13.4, .35, 0, TAU); c.fill(); }
    c.fillStyle = ln; c.fillRect(-2.4, -14, 1.8, 1.6); c.strokeStyle = ln; c.lineWidth = .3; c.beginPath(); c.moveTo(-3.4, -14.8); c.lineTo(2.4, -12); c.stroke();
    c.fillStyle = ln; c.beginPath(); c.moveTo(0, -12); c.lineTo(-.5, -11.2); c.lineTo(.5, -11.2); c.fill(); c.fillRect(-1.4, -10.9, 2.8, .25);
    vol(c, c => { c.moveTo(-3.8, -15); c.quadraticCurveTo(0, -19.4, 3.8, -15); c.lineTo(4.4, -14.2); c.lineTo(-3.8, -14.4); c.closePath(); }, '#b8203a', { ln, hl: [-1, -16.6, 1.4], tex: c => motas(c, [[-1.6, -16.2, .35], [.6, -17, .35], [2.2, -15.6, .3]], '#fffaf0') });
    trazo(c, [[-3.6, -14.6], [-5.6, -13.2 + Math.sin(t * 6) * .5]], .6, '#b8203a', { ln });
    const hy = apunta ? -16 : -9; trazo(c, [[3.4, -10], [4.4, hy + 2]], .7, hueso, { ln });
    trazo(c, [[3.6, hy - 1.4], [5.2, hy + 1.6]], .7, hueso, { ln }); for (const [x, y] of [[3.6, hy - 1.4], [5.2, hy + 1.6]]) { c.fillStyle = hueso; c.strokeStyle = ln; c.lineWidth = .3; c.beginPath(); c.arc(x - .35, y, .55, 0, TAU); c.arc(x + .35, y, .55, 0, TAU); c.fill(); c.stroke(); }
  };
  // hadita de la reina: alas de pétalo, polvo de estrellas, vestidito de flor
  FD.hadita = (c, e, t) => {
    const P = pal({ main: '#ff7fd0', dark: '#7a2a6a', light: '#fff6c8', accent: '#ffd23f', eye: '#ffffff' }), al = Math.sin(t * 30 + e.anim) * .5;
    brilla(c, 0, -5, 9, '#ffb0f0', .45);
    for (const s of [1, -1]) { c.save(); c.translate(-.6, -7); c.rotate(s * (.6 + al * .4)); c.fillStyle = 'rgba(230,245,255,.65)'; c.strokeStyle = 'rgba(255,170,230,.8)'; c.lineWidth = .25; c.beginPath(); c.ellipse(0, -3.2, 1.8, 3.4, 0, 0, TAU); c.fill(); c.stroke(); c.beginPath(); c.ellipse(0, 1.6, 1.1, 1.8, 0, 0, TAU); c.fill(); c.stroke(); c.restore(); }
    vol(c, c => { c.moveTo(0, -6.6); c.lineTo(-2.6, -2.4); c.quadraticCurveTo(0, -1.4, 2.6, -2.4); c.closePath(); }, P.m, { lw: .35, tex: c => { c.strokeStyle = P.l; c.lineWidth = .3; c.beginPath(); for (let x = -2; x <= 2; x += 1) { c.moveTo(x * .3, -6); c.lineTo(x, -2.4); } c.stroke(); } });
    trazo(c, [[-.6, -2.2], [-.8, -.4]], .35, P.l, { lw: .3 }); trazo(c, [[.6, -2.2], [.8, -.4]], .35, P.l, { lw: .3 });
    vol(c, c => c.arc(0, -8.4, 1.6, 0, TAU), P.l, { lw: .35, hl: [-.5, -9, .8] });
    c.fillStyle = P.a; c.beginPath(); for (let k = 0; k < 5; k++) { const a = k / 5 * TAU - Math.PI / 2; c.lineTo(Math.cos(a) * 1.8, -9.6 + Math.sin(a) * .7 - .4); } c.fill();
    ojo(c, e, t, .5, -8.4, .45, { piel: P.l }); c.fillStyle = 'rgba(255,120,170,.5)'; c.beginPath(); c.arc(1, -7.8, .35, 0, TAU); c.fill();
  };
  FX.hadita = (c, e, t) => { for (let k = 0; k < 5; k++) { const ph = (t * 1.5 + k / 5) % 1; c.fillStyle = `rgba(255,240,180,${1 - ph})`; c.beginPath(); c.arc(-2 - ph * 8 + Math.sin(k * 3) * 1.5, -5 + Math.sin(ph * 6 + k) * 2 + ph * 4, .45 * (1 - ph) + .15, 0, TAU); c.fill(); } };
  // loro del pirata: guacamaya roja con alas amarillas y azules, cara blanca y pico de gancho
  FD.loro = (c, e, t) => {
    const P = pal({ main: '#d9443a', dark: '#2a1a1a', light: '#fff6ea', accent: '#ffd23f', eye: '#ffffff' }), al = Math.sin(t * 14 + e.anim) * 2.4, ln = '#2a1416';
    vol(c, c => { c.moveTo(-3.6, -4.6); c.lineTo(-11, -1.6); c.lineTo(-10.4, -.6); c.lineTo(-3.4, -3.2); c.closePath(); }, '#2274a5', { ln, lw: .35, tex: c => { c.fillStyle = '#d9443a'; c.beginPath(); c.moveTo(-3.6, -4.4); c.lineTo(-8, -2.6); c.lineTo(-3.4, -3.4); c.fill(); } });
    vol(c, c => { c.moveTo(-2, -5.6); c.lineTo(-7.4, -9.6 - al); c.lineTo(-4.6, -9.8 - al); c.lineTo(-.4, -6); c.closePath(); }, '#ffd23f', { ln, lw: .35, tex: c => { c.fillStyle = '#2274a5'; c.beginPath(); c.moveTo(-4.2, -7.4 - al * .6); c.lineTo(-7.4, -9.6 - al); c.lineTo(-6, -9.8 - al); c.lineTo(-3, -7.6); c.fill(); } });
    vol(c, c => c.ellipse(0, -5, 5, 3.4, -.2, 0, TAU), P.m, { ln, hl: [-1, -6.4, 2] });
    vol(c, c => { c.moveTo(-1.6, -4.6); c.lineTo(-6.4, -3.6 + al * .4); c.lineTo(-5.2, -2.4 + al * .4); c.lineTo(-1, -3.6); c.closePath(); }, '#3f9a5a', { ln, lw: .35 });
    vol(c, c => c.ellipse(3.4, -6.2, 1.6, 1.3, 0, 0, TAU), P.l, { ln, lw: .3, s: false });
    ojo(c, e, t, 3.4, -6.3, .65, { piel: P.l, iris: '#ffd23f', ln });
    vol(c, c => { c.moveTo(4.6, -6.8); c.quadraticCurveTo(7.2, -7, 6.8, -4); c.quadraticCurveTo(6, -5, 4.6, -4.8); c.closePath(); }, '#2a2a2a', { ln: '#000', lw: .3, hl: [5.4, -6.4, .8] });
  };

  // ---------------- lote 3 de mundos (mundos-ampliados2.js) ----------------
  // nahual de niebla: un espíritu de humo con cuerpo de jaguarcito; con luz se vuelve estatua
  FD.nahual = (c, e, t, s) => {
    const P = pal(s), a = Math.sin(e.anim * 10), cuerpo = '#2a2a2e', humo = 'rgba(200,200,210,.22)';
    for (const [lx, ph] of [[-4, 0], [3.4, 1]]) trazo(c, [[lx, -3], [lx + (ph ? a : -a) * 1.2, 0]], 1.2, '#1e1e22', { lw: .5 });
    trazo(c, [[-6, -5], [-10, -6 + Math.sin(t * 3) * 1.2, -11, -10 + Math.sin(t * 3 + 1)]], 1, cuerpo, { lw: .5 });
    vol(c, c => { c.moveTo(-6.4, -3.4); c.bezierCurveTo(-6.6, -8.6, 2.4, -9, 5, -6.4); c.lineTo(5, -3); c.bezierCurveTo(1, -2, -4, -2, -6.4, -3.4); c.closePath(); }, cuerpo, { hl: [-1.6, -7.4, 2.2], tex: c => { c.fillStyle = 'rgba(255,255,255,.08)'; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(-5 + k * 2.2, -7.6 + Math.sin(t * 2 + k) * .4, 1.3, 0, TAU); c.fill(); } } });
    for (const d of [0, 1]) vol(c, c => { c.moveTo(3.4 + d * 2.4, -9.6); c.lineTo(3.8 + d * 2.6, -13 + d * .4); c.lineTo(5 + d * 2.4, -9.8); c.closePath(); }, cuerpo, { lw: .4 });
    vol(c, c => c.ellipse(5.6, -8.4, 3.2, 2.7, 0, 0, TAU), cuerpo, { hl: [5, -9.6, 1.4] });
    if (!e.piedra) brilla(c, 6.4, -8.6, 4, P.e, .45);
    for (const x of [5.2, 7.4]) { c.fillStyle = e.piedra ? '#1a1816' : P.e; c.beginPath(); c.ellipse(x + (e._mx || 0) * .3, -8.7, .6, parpadea(e, t) || e.piedra ? .12 : .8, 0, 0, TAU); c.fill(); }
    c.strokeStyle = rgba(P.e, .7); c.lineWidth = .3; c.beginPath(); c.moveTo(5.4, -7); c.quadraticCurveTo(6.6, -6.2, 8, -7.2); c.stroke();
    if (!e.piedra) { c.fillStyle = humo; for (let k = 0; k < 4; k++) { const ph = (t * .8 + k / 4) % 1; c.beginPath(); c.arc(-3 + k * 2.6 - ph * 2, -9 - ph * 5, .8 + ph * 1.8, 0, TAU); c.fill(); } }
  };
  // bejuco: un capullo carnívoro de la selva; cerrado arriba, se abre con dientitos cuando baja en lo oscuro
  FD.bejuco = (c, e, t, s) => {
    const P = pal({ main: '#4a7a3a', dark: '#1e2e1a', light: '#c8e0a0', accent: '#b04070', eye: '#ffffff' }), abre = e.baja ? 1 : e.luz ? 0 : .3, sw = Math.sin(t * 3 + e.hx) * .2;
    c.save(); c.rotate(sw);
    for (const d of [-1, 1]) vol(c, c => { c.moveTo(0, -7); c.quadraticCurveTo(d * 4.6, -6.4 + abre, d * (2.4 + abre * 3), -1 + abre * 1.6); c.quadraticCurveTo(d * 1, -2, 0, -7); c.closePath(); }, P.m, { lw: .4, tex: c => { c.strokeStyle = P.ms; c.lineWidth = .25; c.beginPath(); c.moveTo(0, -6.6); c.lineTo(d * 2.2, -2); c.stroke(); } });
    if (abre > .4) { c.fillStyle = '#5a1030'; c.beginPath(); c.ellipse(0, -2.6, 2.2 * abre, 2 * abre, 0, 0, TAU); c.fill(); c.fillStyle = '#fffaf0'; for (const d of [-1, 1]) for (let k = 0; k < 2; k++) { c.beginPath(); c.moveTo(d * (.6 + k), -4.4 * abre + k * .3); c.lineTo(d * (1 + k), -3.4 * abre); c.lineTo(d * (1.4 + k), -4.4 * abre + k * .3); c.fill(); } }
    vol(c, c => c.ellipse(0, -7.4, 2.6, 2.2, 0, 0, TAU), P.a, { lw: .4, hl: [-.6, -8.2, 1.2] });
    ojo(c, e, t, 0, -7.6, 1.1, { piel: P.a, iris: '#e0c040', enojo: e.baja ? .8 : .2, ln: P.ln });
    c.restore();
  };
  FX.bejuco = (c, e, t) => {
    const len = (e.len || 6) + 26, sw = Math.sin(t * 3 + e.hx) * 2;
    c.save(); c.lineCap = 'round'; c.strokeStyle = '#1e2e1a'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -len - 4); c.bezierCurveTo(sw, -len * .6, -sw, -len * .3, 0, -8); c.stroke();
    c.strokeStyle = '#4a7a3a'; c.lineWidth = 1.1; c.stroke();
    for (let y = -len + 2; y < -10; y += 7) { const d = ((y / 7) | 0) % 2 ? 1 : -1, x = Math.sin((y / len) * 3) * sw * .5; c.fillStyle = '#5a8a44'; c.beginPath(); c.ellipse(x + d * 2.2, y, 2, .9, d * .5, 0, TAU); c.fill(); c.strokeStyle = '#1e2e1a'; c.lineWidth = .3; c.stroke(); }
    c.restore();
  };
  // carpintero de cristal: pájaro de facetas, cresta roja; cuando picotea un pilar mete la cabeza
  FD.carpintero = (c, e, t, s) => {
    const P = pal(s), f = Math.sin(e.anim * 26), pica = e.pica ? Math.abs(Math.sin(t * 22)) * 1.6 : 0;
    const cara = (pts, col) => { c.fillStyle = col; c.strokeStyle = P.ln; c.lineWidth = .3; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill(); c.stroke(); };
    if (!e.pica) { cara([[-1, -6], [-6, -11 - f * 2.4], [-3, -5.6]], '#bff4ff'); cara([[-3, -5.6], [-6, -11 - f * 2.4], [-7, -8 - f]], '#7fd8f0'); }
    cara([[-7, -4], [-4, -6.4], [-4, -3]], '#3a8fc0'); cara([[-4, -6.4], [2, -7], [-4, -3]], '#7fd8f0'); cara([[-4, -3], [2, -7], [2.4, -3.4]], '#3a8fc0'); cara([[-4, -3], [2.4, -3.4], [0, -1.6]], '#f2ede4');
    c.save(); c.translate(pica, 0);
    cara([[1.6, -7.4], [4.6, -8.6], [5, -4.6], [2.2, -3.6]], '#bff4ff'); cara([[2.4, -9.2], [4.4, -11.4], [4.6, -8.6], [1.6, -7.6]], P.a);
    cara([[5, -7.2], [9, -6.2], [5, -5.6]], '#ffd166');
    ojo(c, e, t, 3.8, -6.8, .6, { piel: '#bff4ff', ln: P.ln });
    c.restore();
    trazo(c, [[-1, -1.8], [-1.4, 0]], .35, P.d, { lw: .3 }); trazo(c, [[.6, -1.8], [.4, 0]], .35, P.d, { lw: .3 });
  };
  // geoda: piedra abierta por la mitad, por dentro amatistas y unos ojitos; gira al rebotar
  FD.geoda = (c, e, t, s) => {
    const r = 5.2, ch = e.choque > 0 ? 1.15 : 1;
    c.save(); c.translate(0, -r); c.scale(ch, 2 - ch); c.rotate(e.giro || 0);
    vol(c, c => c.arc(0, 0, r, 0, TAU), '#8a7a6a', { hl: [-2, -2, 2.4], ln: '#2a2018', tex: c => { motas(c, [[-2, 2.6, .5], [2.6, 2, .45], [1, 3.4, .4], [-3.4, .6, .4]], '#6a5a4a'); } });
    c.fillStyle = '#3a2a4a'; c.beginPath(); c.ellipse(0, -.6, 3.8, 3.2, 0, 0, TAU); c.fill();
    for (let k = 0; k < 9; k++) { const a = k / 9 * TAU, x = Math.cos(a) * 2.6, y = -.6 + Math.sin(a) * 2.2; c.fillStyle = k % 2 ? '#c890f0' : '#9a60d0'; c.beginPath(); c.moveTo(x * .3, y * .3 - .3); c.lineTo(x + Math.cos(a + .3) * .8, y + Math.sin(a + .3) * .8); c.lineTo(x + Math.cos(a - .3) * .8, y + Math.sin(a - .3) * .8); c.closePath(); c.fill(); }
    c.restore();
    for (const x of [-1.2, 1.2]) ojo(c, e, t, x, -r - .6, .8, { piel: '#3a2a4a', blanco: '#f4e8ff', ln: '#1a1024' });
    brilla(c, 0, -r, 5, '#c890f0', .25);
  };
  // mono escribano del códice: pincel en mano y tocado de papel; cuando repinta un glifo, su pincel brilla
  FD.escribano = (c, e, t, s) => {
    const P = pal(s), a = Math.sin(e.anim * 9), pinta = e.pinta > 0, ln = P.ln;
    trazo(c, [[-3.6, -4], [-9, -4 + a, -8.4, -10], [-7.6, -12, -6.2, -11]], .8, P.m);
    for (const [lx, ph] of [[-1.6, 0], [1.6, 1]]) trazo(c, [[lx, -3.6], [lx + (ph ? a : -a) * .8, 0]], .9, P.ms);
    vol(c, c => c.ellipse(0, -5.6, 3.6, 3.8, 0, 0, TAU), P.m, { hl: [-1.2, -7.4, 1.6], tex: c => { c.fillStyle = P.l; c.beginPath(); c.ellipse(.8, -4.8, 2, 2.6, 0, 0, TAU); c.fill(); } });
    vol(c, c => c.arc(1, -10.6, 3, 0, TAU), P.m, { hl: [.2, -11.8, 1.3] });
    vol(c, c => c.ellipse(2, -10.2, 2.1, 1.8, 0, 0, TAU), P.l, { lw: .35 });
    ojo(c, e, t, 1.4, -10.8, .65, { piel: P.l, ln }); ojo(c, e, t, 3, -10.8, .65, { piel: P.l, ln });
    c.strokeStyle = ln; c.lineWidth = .3; c.beginPath(); c.arc(2.4, -9.6, .7, .3, Math.PI - .3); c.stroke();
    vol(c, c => { c.moveTo(-2, -13); c.lineTo(-3.4, -16.4); c.lineTo(0, -14.2); c.lineTo(1.6, -17); c.lineTo(2.6, -13.4); c.closePath(); }, '#f1e2bd', { lw: .35, tex: c => { c.strokeStyle = P.a; c.lineWidth = .3; c.beginPath(); c.moveTo(-2.6, -14.8); c.lineTo(1.8, -15.2); c.stroke(); } });
    const bx = pinta ? 7 : 4.6, by = pinta ? -10 : -5;
    trazo(c, [[2, -7], [bx - 1.6, by + 1]], .8, P.m); trazo(c, [[bx - 2, by + 1.4], [bx + 1.4, by - 2.4]], .45, '#6a4a2a', { lw: .3 });
    c.fillStyle = '#1c1612'; c.beginPath(); c.ellipse(bx + 1.6, by - 2.8, .7, 1, .7, 0, TAU); c.fill(); if (pinta) brilla(c, bx + 1.6, by - 2.8, 3, '#d79a3d', .8);
  };
  FXD.escribano = (c, e, t) => {
    if (!(e.pinta > 0) || e.bx === undefined) return;
    const dx = e.bx - e.x, dy = e.by - e.y, u = 1 - e.pinta / .9;
    c.save(); c.strokeStyle = `rgba(215,154,61,${.4 + u * .5})`; c.lineWidth = .7; c.setLineDash([1.5, 1.5]); c.lineDashOffset = -t * 20; c.beginPath(); c.moveTo((e.dir || 1) * 8, -12); c.quadraticCurveTo(dx * .5, Math.min(-20, dy - 14), dx, dy); c.stroke(); c.setLineDash([]);
    brilla(c, dx, dy, 6 + u * 6, '#d79a3d', .3 + u * .5); c.restore();
  };
  // guerrero de piedra: tocado de plumas, lanza y escudo con glifo; con el escudo apagado, se asusta
  FD.guerrero = (c, e, t, s) => {
    const P = pal({ main: '#cdb48a', dark: '#1c1612', light: '#f1e2bd', accent: '#b0412e', eye: '#ffffff' }), a = Math.sin(e.anim * 8), on = e.escudo, ln = P.ln;
    for (const [lx, ph] of [[-2, 0], [2, 1]]) trazo(c, [[lx, -5], [lx + (ph ? a : -a) * 1, 0]], 1.3, P.ms);
    trazo(c, [[4, -16], [4.6, 0]], .5, '#6a4a2a', { lw: .3 }); vol(c, c => { c.moveTo(3.4, -16); c.lineTo(4.2, -19.4); c.lineTo(5, -16); c.closePath(); }, '#3a3438', { lw: .3 });
    vol(c, c => roundRect(c, -3.6, -12, 7.2, 7.6, 1.4), P.m, { hl: [-1.6, -11, 1.6], tex: c => { c.fillStyle = P.a; c.fillRect(-3.6, -7.6, 7.2, 1.4); c.strokeStyle = ln; c.lineWidth = .3; for (let x = -3; x < 4; x += 1.4) { c.beginPath(); c.moveTo(x, -6.2); c.lineTo(x + .7, -4.4); c.stroke(); } } });
    vol(c, c => roundRect(c, -2.6, -16.4, 5.6, 4.6, 1.2), P.m, { hl: [-1, -15.6, 1.2] });
    ojo(c, e, t, 1.6, -14.4, .7, { piel: P.m, ln, enojo: on ? .7 : 0 });
    if (!on) { c.strokeStyle = ln; c.lineWidth = .3; c.beginPath(); c.moveTo(.6, -15.6); c.lineTo(2.6, -16); c.stroke(); }
    for (let k = 0; k < 5; k++) { const an = -Math.PI * .85 + k * .26; c.fillStyle = k % 2 ? '#4d8a5c' : '#2a7a8a'; c.beginPath(); c.ellipse(-1 + Math.cos(an) * 4.4, -16.6 + Math.sin(an) * 4.4, .9, 2.6, an + Math.PI / 2, 0, TAU); c.fill(); c.strokeStyle = ln; c.lineWidth = .25; c.stroke(); }
    vol(c, c => c.arc(-3.6, -9, 3.6, 0, TAU), on ? '#d79a3d' : '#7a6a58', { hl: [-4.6, -10.2, 1.6], lw: .45, tex: c => { c.strokeStyle = on ? '#b0412e' : '#4a3e32'; c.lineWidth = .5; c.strokeRect(-5.2, -10.6, 3.2, 3.2); c.beginPath(); c.arc(-3.6, -9, .9, 0, TAU); c.stroke(); } });
    if (on) brilla(c, -3.6, -9, 6, '#d79a3d', .45);
  };
  // girasol del óleo: voltea la cara hacia Itzel, se echa para atrás y escupe semillas
  FD.girasol = (c, e, t, s) => {
    const P = pal({ main: '#f2c230', dark: '#3a2a10', light: '#fff0a0', accent: '#e8a028', eye: '#ffffff' }), k = e.carga || 0, ln = '#1a2240', sw = Math.sin(t * 1.6 + e.hx) * .06 - k * .25;
    trazo(c, [[0, 0], [-.6, -8, 0, -15]], 1.3, '#4a7a2a', { ln });
    for (const [y, d] of [[-6, -1], [-10, 1]]) vol(c, c => { c.moveTo(0, y); c.quadraticCurveTo(d * 4, y - 3, d * 6.4, y - .6); c.quadraticCurveTo(d * 3, y + 1.4, 0, y); c.closePath(); }, '#5a9a3a', { ln, lw: .35, tex: c => { c.strokeStyle = '#3a6a22'; c.lineWidth = .25; c.beginPath(); c.moveTo(0, y); c.lineTo(d * 5.6, y - .6); c.stroke(); } });
    c.save(); c.translate(0, -16.6); c.rotate(sw); c.scale(1 - k * .08, 1 + k * .08);
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + Math.sin(t * 2 + i) * .04, L2 = 4.4 + (i % 2) * .8; c.save(); c.rotate(a); vol(c, c => { c.moveTo(2.6, -.9); c.quadraticCurveTo(L2 + 1.4, 0, 2.6, .9); c.closePath(); }, i % 2 ? P.m : P.a, { ln, lw: .3, s: false }); c.restore(); }
    vol(c, c => c.arc(0, 0, 3, 0, TAU), '#5a3a1a', { ln, lw: .4, hl: [-.8, -1, 1.4], tex: c => { c.fillStyle = '#3a2410'; for (let i = 0; i < 14; i++) { const a = i * 2.4, r = Math.sqrt(i / 14) * 2.6; c.beginPath(); c.arc(Math.cos(a) * r, Math.sin(a) * r, .3, 0, TAU); c.fill(); } } });
    ojo(c, e, t, -.9, -.4, .7, { piel: '#5a3a1a', ln, enojo: k * .8 }); ojo(c, e, t, .9, -.4, .7, { piel: '#5a3a1a', ln, enojo: k * .8 });
    c.fillStyle = k > .3 ? '#2a1408' : '#ff9a80'; c.beginPath(); c.ellipse(0, 1.4, k > .3 ? .9 : .7, k > .3 ? .9 : .35, 0, 0, TAU); c.fill();
    c.restore();
  };
  // cuervo del trigal: plumas largas en las alas, cola de abanico, ojo amarillo
  FD.cuervo = (c, e, t, s) => {
    const P = pal({ main: '#1a1a2a', dark: '#0a0a14', light: '#4a4a6a', accent: '#8a8aa8', eye: '#f8e27a' }), f = Math.sin(e.anim * 9 + e.hx), ln = '#05050a';
    vol(c, c => { c.moveTo(-4, -4); c.lineTo(-8, -6); c.lineTo(-8.6, -4); c.lineTo(-8, -2.4); c.closePath(); }, P.m, { ln, lw: .3 });
    for (const [d, col] of [[-1, P.d], [1, P.m]]) {
      const ty = -4 + (d > 0 ? -6 : -4) * f - 1;
      vol(c, c => { c.moveTo(-1.6, -4.6); c.quadraticCurveTo(-3, ty - 1, -6, ty); for (let k = 0; k < 3; k++) { c.lineTo(-6.6 + k * 1.2, ty + 1.2 + k * .3); c.lineTo(-5.4 + k * 1.2, ty + .8 + k * .4); } c.quadraticCurveTo(-1, -3, 1, -4); c.closePath(); }, col, { ln, lw: .35, s: false });
    }
    vol(c, c => c.ellipse(-.6, -4, 3.8, 1.9, 0, 0, TAU), P.m, { ln, lw: .4, hl: [-1.4, -4.8, 1.4] });
    vol(c, c => c.arc(3.4, -5, 1.7, 0, TAU), P.m, { ln, lw: .4 });
    vol(c, c => { c.moveTo(4.6, -5.6); c.lineTo(7.6, -4.8); c.lineTo(4.6, -4.2); c.closePath(); }, '#5a5a6a', { ln, lw: .3 });
    ojo(c, e, t, 3.7, -5.4, .5, { piel: P.m, blanco: P.e, ln });
  };

  // ---------------- lote 4 de mundos (mundos-ampliados3.js) ----------------
  // gárgola de la catedral: perro-demonio de piedra con alas de murciélago; abre las alas al lanzarse
  FD.gargola = (c, e, t) => {
    const P = pal({ main: '#8a8a92', dark: '#3a3a44', light: '#c8c8d0', accent: '#5a5a66', eye: '#ffd36b' }), vuela = e.fase && e.fase !== 'posada', f = vuela ? Math.sin(e.anim * 14) : 0;
    for (const d of [-1, 1]) {
      const ab = vuela ? 1 : .35, ty = -10 - f * 3 * ab;
      vol(c, c => { c.moveTo(-1 * d - 1, -7); c.quadraticCurveTo(-4 + d * 2, ty - 2, -8 * ab - 2, ty + (1 - ab) * 4); c.lineTo(-6 * ab - 1, -5.4); c.lineTo(-4.6 * ab, -6.6); c.lineTo(-3 * ab, -4.6); c.closePath(); }, d < 0 ? P.d : P.ms, { lw: .4 });
    }
    trazo(c, [[-5, -3], [-8, -3 + Math.sin(t * 2) * .6, -9, -6]], .7, P.m, { lw: .4 });
    for (const [lx, cc] of [[-3, P.ms], [2.6, P.m]]) trazo(c, [[lx, -3], [lx + .4, 0]], 1.2, cc);
    vol(c, c => { c.moveTo(-5, -2.4); c.bezierCurveTo(-5.6, -7.4, 1.6, -8, 3.6, -5.6); c.lineTo(3.6, -2.4); c.closePath(); }, P.m, { hl: [-1.4, -6.4, 1.8], tex: c => { c.strokeStyle = P.ms; c.lineWidth = .3; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-4 + k * 1.8, -6.4); c.lineTo(-3.4 + k * 1.8, -3); c.stroke(); } } });
    vol(c, c => c.ellipse(4.6, -6.6, 2.8, 2.4, 0, 0, TAU), P.m, { hl: [4, -7.6, 1.2] });
    for (const d of [0, 1]) vol(c, c => { c.moveTo(3.4 + d * 1.6, -8.6); c.quadraticCurveTo(2.6 + d * 1.6, -11.6, 4.6 + d * 1.8, -11.4); c.lineTo(4.4 + d * 1.6, -8.8); c.closePath(); }, P.l, { lw: .3 });
    c.fillStyle = '#1a1a22'; c.beginPath(); c.moveTo(7, -6.2); c.lineTo(5, -5.6); c.lineTo(7.2, -4.8); c.closePath(); c.fill();
    c.fillStyle = '#fffaf0'; c.beginPath(); c.moveTo(5.6, -5.9); c.lineTo(6, -5.2); c.lineTo(6.4, -6); c.fill();
    brilla(c, 4.6, -7.2, 2.6, P.e, .55); ojo(c, e, t, 4.7, -7.3, .6, { blanco: P.e, piel: P.m, enojo: .7 });
  };
  FX.gargola = (c, e, t) => {
    const lx = ((e.hx || e.x) - e.x) * (e.dir || 1), ly = (e.hy || e.y) - e.y;
    c.fillStyle = '#5a5a66'; c.beginPath(); c.moveTo(lx - 8, ly); c.lineTo(lx + 8, ly); c.lineTo(lx + 5, ly + 4); c.quadraticCurveTo(lx, ly + 9, lx - 5, ly + 4); c.closePath(); c.fill();
    c.strokeStyle = '#1a1a22'; c.lineWidth = .5; c.stroke(); c.fillStyle = '#8a8a92'; c.fillRect(lx - 8, ly, 16, 1.2);
  };
  // campana de bronce: el badajo es su lengua; al caer vibra y repica
  FD.campana = (c, e, t) => {
    const P = pal({ main: '#c8903a', dark: '#4a2a10', light: '#ffd890', accent: '#8a5a20', eye: '#ffffff' }), rep = e.repica || 0, w = Math.sin(t * 60) * rep * .8, air = (e.vy || 0) !== 0;
    c.save(); c.rotate(w * .08);
    trazo(c, [[0, -12.6], [0, -14.4]], 1.2, P.ms, { lw: .5 }); c.strokeStyle = P.ln; c.lineWidth = .5; c.beginPath(); c.arc(0, -14.6, 1.3, Math.PI, 0); c.stroke();
    vol(c, c => { c.moveTo(-3.4, -12.4); c.quadraticCurveTo(-4.6, -6, -6.6, -2); c.lineTo(6.6, -2); c.quadraticCurveTo(4.6, -6, 3.4, -12.4); c.quadraticCurveTo(0, -13.8, -3.4, -12.4); c.closePath(); }, P.m, { hl: [-1.8, -9.6, 2.4], tex: c => { c.strokeStyle = P.as; c.lineWidth = .5; for (const y of [-10.6, -4]) { c.beginPath(); c.moveTo(-6, y); c.quadraticCurveTo(0, y + .8, 6, y); c.stroke(); } motas(c, [[-2, -7.4, .3], [0, -7.6, .3], [2, -7.4, .3]], P.as); } });
    vol(c, c => c.ellipse(0, -2, 6.8, 1.3, 0, 0, TAU), P.ms, { lw: .45 });
    c.fillStyle = '#2a1408'; c.beginPath(); c.ellipse(0, -1.8, 5.4, .8 + (air ? .5 : 0), 0, 0, TAU); c.fill();
    vol(c, c => c.arc(w * 2, -.6 + (air ? .6 : 0), 1.2, 0, TAU), '#8a5a20', { lw: .35 });
    for (const x of [-1.8, 1.8]) ojo(c, e, t, x, -8.2, .8, { piel: P.m, enojo: rep > 0 ? .6 : .1 });
    c.restore();
  };
  // goma de borrar: mitad rosa y mitad azul, con migajas; se le arruga la cara cuando borra
  FD.goma = (c, e, t) => {
    const P = pal({ main: '#f2a0a8', dark: '#3a3a42', light: '#ffe0e4', accent: '#4a7ad8', eye: '#ffffff' }), b = e.borra ? Math.sin(t * 30) * .5 : 0;
    c.save(); c.rotate(b * .05);
    vol(c, c => roundRect(c, -6.4, -8, 12.8, 8, 1.6), P.m, { hl: [-3, -6.6, 2], tex: c => { c.fillStyle = P.a; c.fillRect(-6.4, -8, 4.6, 8); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(-6.4, -8, 12.8, 1.4); c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(-6.4, -1.6, 12.8, 1.6); } });
    for (const x of [1.2, 3.8]) ojo(c, e, t, x, -4.8, .9, { piel: P.m, enojo: e.borra ? .6 : 0 });
    c.strokeStyle = P.ln; c.lineWidth = .35; c.beginPath(); if (e.borra) { c.moveTo(1.4, -2.4); for (let k = 1; k <= 4; k++) c.lineTo(1.4 + k * .6, k % 2 ? -2 : -2.6); } else c.arc(2.5, -2.8, .8, .3, Math.PI - .3); c.stroke();
    c.restore();
  };
  FXD.goma = (c, e, t) => { if (!e.borra) return; for (let k = 0; k < 3; k++) { const ph = (t * 3 + k / 3) % 1; c.fillStyle = `rgba(232,160,168,${1 - ph})`; c.fillRect((e.dir || 1) * (5 + ph * 4) - .5, -2 - ph * 6 + k, 1, 1); } };
  // sacapuntas de escritorio: manivela que gira, boca que avienta virutas
  FD.sacapuntas = (c, e, t) => {
    const P = pal({ main: '#d9443a', dark: '#2a1a1a', light: '#f0c0b0', accent: '#c9d3dc', eye: '#ffffff' }), g2 = e.gira || 0;
    c.save(); c.translate(-4.6, -6); c.rotate(g2); trazo(c, [[0, 0], [0, -3.4]], .6, P.a, { lw: .35 }); vol(c, c => c.arc(0, -3.6, .9, 0, TAU), '#2a2a34', { lw: .3 }); c.restore();
    vol(c, c => roundRect(c, -5, -10, 10, 9, 1.4), P.m, { hl: [-2.4, -8.6, 2], tex: c => { c.fillStyle = P.ms; c.fillRect(-5, -3, 10, 2); } });
    vol(c, c => c.arc(5, -6, 2.2, 0, TAU), P.a, { lw: .4, hl: [4.4, -6.6, 1] }); c.fillStyle = '#1a1214'; c.beginPath(); c.arc(5.4, -6, 1.1, 0, TAU); c.fill();
    if (e.carga) brilla(c, 6, -6, 3, '#ffd36b', .5);
    for (const x of [-2.2, .6]) ojo(c, e, t, x, -7.2, .85, { piel: P.m, enojo: e.carga ? .8 : .3 });
    vol(c, c => roundRect(c, -5.4, -1.4, 10.8, 1.4, .5), '#3a3a42', { lw: .3 });
  };
  // catrín de grabado: calavera de bigote, frac, moño, bastón y su sombrero de copa
  FD.catrin = (c, e, t) => {
    const TIN = '#1f1a1c', PAP = '#efe5cf', ROJ = '#b3342b', P = pal({ main: TIN, dark: TIN, light: PAP, accent: ROJ, eye: PAP }), a = Math.sin(e.anim * 8);
    for (const [lx, ph] of [[-1.6, 0], [1.6, 1]]) trazo(c, [[lx, -6], [lx + (ph ? a : -a), -.6]], .8, TIN, { ln: '#000' });
    for (const lx of [-1.6, 1.6]) { c.fillStyle = TIN; c.beginPath(); c.ellipse(lx + 1, -.5, 1.4, .6, 0, 0, TAU); c.fill(); }
    trazo(c, [[3.6, -9], [5.4, 0]], .4, '#6a4a2a', { lw: .3 }); c.fillStyle = '#d4af37'; c.beginPath(); c.arc(3.6, -9.2, .6, 0, TAU); c.fill();
    vol(c, c => { c.moveTo(-3, -12); c.lineTo(3, -12); c.lineTo(3.4, -6); c.lineTo(1, -6); c.lineTo(0, -4); c.lineTo(-1, -6); c.lineTo(-4.4, -2.4); c.lineTo(-3.4, -7); c.closePath(); }, TIN, { ln: '#000', l: rgba(PAP, .25), tex: c => { c.strokeStyle = 'rgba(239,229,207,.4)'; c.lineWidth = .25; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(-3 + k, -12); c.lineTo(-3.4 + k * .9, -6.4); c.stroke(); } } });
    c.fillStyle = PAP; c.beginPath(); c.moveTo(-1, -12); c.lineTo(0, -8.4); c.lineTo(1, -12); c.fill(); c.fillStyle = ROJ; c.beginPath(); c.moveTo(-1.6, -12.4); c.lineTo(0, -11.6); c.lineTo(1.6, -12.4); c.lineTo(1.6, -10.8); c.lineTo(0, -11.6); c.lineTo(-1.6, -10.8); c.closePath(); c.fill();
    trazo(c, [[2.6, -11], [3.6, -9]], .6, TIN, { ln: '#000' });
    vol(c, c => { c.arc(.4, -15, 3, Math.PI * .85, Math.PI * 2.15); c.lineTo(1.6, -12.4); c.lineTo(-1, -12.4); c.closePath(); }, PAP, { ln: TIN, hl: [-.6, -16.2, 1.4] });
    for (const x of [-.6, 1.6]) { c.fillStyle = TIN; c.beginPath(); c.ellipse(x, -15.2, .8, .95, 0, 0, TAU); c.fill(); if (!FOE_KIT.dormido(e)) { c.fillStyle = PAP; c.beginPath(); c.arc(x + .2, -15.4, .25, 0, TAU); c.fill(); } }
    c.strokeStyle = TIN; c.lineWidth = .45; c.lineCap = 'round'; c.beginPath(); c.moveTo(-.6, -13.4); c.quadraticCurveTo(.6, -12.8, 2.4, -13.8); c.moveTo(.6, -13.4); c.quadraticCurveTo(1.8, -12.6, 3.4, -13.2); c.stroke();
    c.lineWidth = .25; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-.4 + k * .7, -12.8); c.lineTo(-.4 + k * .7, -12.2); c.stroke(); }
    if (e.conSombrero !== false) { c.fillStyle = TIN; c.fillRect(-2, -23, 4.6, 5.4); c.fillRect(-3.4, -18, 7.4, 1.2); c.fillStyle = ROJ; c.fillRect(-2, -19, 4.6, .9); c.strokeStyle = 'rgba(239,229,207,.5)'; c.lineWidth = .3; c.beginPath(); c.moveTo(-1.4, -22.6); c.lineTo(-1.4, -19.4); c.stroke(); }
    else { c.strokeStyle = TIN; c.lineWidth = .3; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(.4 + k * .8, -17.6); c.lineTo(.6 + k * 1.1, -19 - Math.abs(Math.sin(t * 4 + k)) * .6); c.stroke(); } }
  };
  // carcoma: una larvita pálida de cabeza oscura; dentro del bloque solo se le ven los ojos en su agujero
  FD.carcoma = (c, e, t) => {
    const P = pal({ main: '#f0e0c0', dark: '#3a2a1a', light: '#fff6e0', accent: '#8a5a2a', eye: '#ffd36b' });
    if (!e.fuera) { c.fillStyle = '#0c0808'; c.beginPath(); c.ellipse(0, -3, 2.6, 2, 0, 0, TAU); c.fill(); for (const x of [-.8, .8]) { brilla(c, x, -3.2, 1.2, P.e, .6); c.fillStyle = P.e; c.beginPath(); c.arc(x, -3.2, .35, 0, TAU); c.fill(); } return; }
    for (let k = 3; k >= 0; k--) vol(c, c => c.ellipse(-k * 2 + Math.sin(t * 8 + k) * .3, -2.4, 1.6 - k * .1, 1.9 - k * .15, 0, 0, TAU), P.m, { lw: .35, hl: [-k * 2 - .4, -3.4, .8] });
    vol(c, c => c.ellipse(2, -2.8, 1.8, 1.7, 0, 0, TAU), P.d, { lw: .35, hl: [1.6, -3.6, .7] });
    c.strokeStyle = P.ln; c.lineWidth = .35; c.beginPath(); c.moveTo(3.4, -2.6); c.lineTo(4.4, -2 + Math.sin(t * 16) * .4); c.moveTo(3.4, -2); c.lineTo(4.4, -1.4 - Math.sin(t * 16) * .4); c.stroke();
    ojo(c, e, t, 2.4, -3.4, .5, { piel: P.d, blanco: P.e });
  };
  // aplastador: un bloque de piedra con cara de pocos amigos y picos; tiembla antes de caer
  FD.aplastador = (c, e, t, s) => {
    const P = pal(s), j = e.jit || 0, en = e.fase === 'cae' || e.fase === 'tiembla';
    c.save(); c.translate(j, 0);
    for (let k = 0; k < 4; k++) { c.fillStyle = P.d; c.beginPath(); c.moveTo(-8 + k * 4.4, -16); c.lineTo(-6 + k * 4.4, -18.4); c.lineTo(-4 + k * 4.4, -16); c.fill(); c.beginPath(); c.moveTo(-8 + k * 4.4, 0); c.lineTo(-6 + k * 4.4, 2); c.lineTo(-4 + k * 4.4, 0); c.fill(); }
    vol(c, c => roundRect(c, -8, -16, 16, 16, 1.6), P.m, { hl: [-4, -12, 3], tex: c => { c.fillStyle = P.l; c.fillRect(-8, -16, 16, 1.4); c.fillStyle = P.d; c.fillRect(-8, -1.4, 16, 1.4); motas(c, [[-5, -3.4, .5], [5, -13, .5], [6, -4, .4]], P.d); } });
    for (const x of [-3.2, 3.2]) ojo(c, e, t, x, -10, 1.6, { piel: P.m, enojo: en ? 1 : .7, blanco: P.e, ln: P.d });
    c.fillStyle = P.d; c.fillRect(-4.4, -5.6, 8.8, en ? 3 : 1.8); c.fillStyle = P.e; for (let k = 0; k < 4; k++) c.fillRect(-4 + k * 2.2, -5.6, 1.4, 1);
    c.restore();
  };
  // cuadrito: un bichito cuadrado de su letra; cuando su letra se prende, se vuelve bloque y se duerme
  FD.cuadrito = (c, e, t, s) => {
    const P = pal(s), col = e.grp === 'A' ? '#306230' : '#8bac0f', bloque = e.st === 'glass', a = Math.sin(e.anim * 12);
    if (!bloque) for (const [x, ph] of [[-3, 0], [3, 1]]) trazo(c, [[x, -3], [x + (ph ? a : -a) * 1.2, 0]], 1, '#0f380f', { lw: .4 });
    const y0 = bloque ? -16 : -14, h = bloque ? 16 : 11, w = bloque ? 16 : 12;
    vol(c, c => roundRect(c, -w / 2, y0, w, h, bloque ? 1 : 2.4), col, { ln: '#0f380f', lw: .7, tex: c => { c.fillStyle = '#9bbc0f'; c.fillRect(-w / 2, y0, w, 1.2); c.fillStyle = 'rgba(15,56,15,.4)'; c.fillRect(-w / 2, y0 + h - 1.6, w, 1.6); } });
    c.fillStyle = '#0f380f'; c.font = 'bold 5px monospace'; c.textAlign = 'center'; c.fillText(e.grp, bloque ? 0 : -2.4, y0 + (bloque ? 6 : 5));
    if (bloque) { c.strokeStyle = '#0f380f'; c.lineWidth = .45; for (const x of [-3, 3]) { c.beginPath(); c.arc(x, -6.4, 1, .2 * Math.PI, .8 * Math.PI); c.stroke(); } }
    else { ojo(c, e, t, 1.6, -9.6, 1.1, { piel: col, blanco: '#9bbc0f', pupila: '#0f380f', ln: '#0f380f' }); ojo(c, e, t, 4.2, -9.6, 1.1, { piel: col, blanco: '#9bbc0f', pupila: '#0f380f', ln: '#0f380f' }); }
  };

  // ---------------- lote 5 de mundos (mundos-ampliados4.js) ----------------
  // Charrán: avisa antes de romper el resorte para que Fresita pueda espantarlo.
  FD.charran = (c, e, t) => {
    const P = pal({ main: '#f4f4f0', dark: '#2a2e3a', light: '#ffffff', accent: '#f2a33a', eye: '#ffffff' }), f = Math.sin(e.anim * 12), ln = '#2a2e3a';
    vol(c, c => { c.moveTo(-4, -5); c.lineTo(-9.6, -7.4); c.lineTo(-7.4, -5); c.lineTo(-9.6, -3); c.closePath(); }, P.m, { ln, lw: .35 });
    vol(c, c => { c.moveTo(-1, -6); c.quadraticCurveTo(-4, -10 - f * 4, -8, -11 - f * 5); c.quadraticCurveTo(-3, -7 - f, 1.6, -5.4); c.closePath(); }, '#cbd2da', { ln, lw: .35 });
    vol(c, c => c.ellipse(0, -5, 4.4, 2.2, 0, 0, TAU), P.m, { ln, lw: .4, hl: [-1, -6, 1.6] });
    vol(c, c => c.arc(4, -6.4, 1.9, 0, TAU), P.m, { ln, lw: .4, tex: c => { c.fillStyle = P.d; c.beginPath(); c.arc(4, -6.6, 1.9, Math.PI * 1.05, Math.PI * 2.05); c.fill(); } });
    vol(c, c => { c.moveTo(5.6, -6.8); c.lineTo(9, -6); c.lineTo(5.6, -5.6); c.closePath(); }, P.a, { ln, lw: .3 });
    ojo(c, e, t, 4.5, -6.4, .5, { piel: P.d, ln });
    vol(c, c => { c.moveTo(1, -5.4); c.quadraticCurveTo(4, -9 + f * 4, 8, -10 + f * 5); c.quadraticCurveTo(4, -6.6 + f, 2, -4.8); c.closePath(); }, '#e2e8ee', { ln, lw: .35 });
    if (e.amenaza > 0) { c.save(); c.fillStyle = '#c8203a'; c.beginPath(); c.arc(0, -16, 3.5, 0, TAU); c.fill(); c.fillStyle = '#fff8df'; c.font = 'bold 6px "Alegreya Sans", sans-serif'; c.textAlign = 'center'; c.fillText('!', 0, -14); c.restore(); }
  };
  // medusa: campana traslúcida con olanes, tentáculos que ondean y ojitos
  FD.medusa = (c, e, t) => {
    const p = e.pulso || 0, k = 1 + p * .08;
    c.save(); c.globalAlpha *= .9;
    for (let i = 0; i < 5; i++) { const x0 = -3.6 + i * 1.8; c.strokeStyle = i % 2 ? 'rgba(255,170,210,.8)' : 'rgba(150,200,255,.8)'; c.lineWidth = .6; c.beginPath(); c.moveTo(x0, -5); for (let j = 1; j <= 6; j++) c.lineTo(x0 + Math.sin(t * 4 + i + j * .8) * 1, -5 + j * 1.4); c.stroke(); }
    vol(c, c => { c.moveTo(-5 * k, -5); c.bezierCurveTo(-5.4 * k, -13 / k, 5.4 * k, -13 / k, 5 * k, -5); c.quadraticCurveTo(0, -3.4, -5 * k, -5); c.closePath(); }, '#ff9ac8', { ln: '#a83a78', lw: .4, hl: [-1.6, -10, 2], tex: c => { c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.ellipse(0, -8, 3, 2, 0, 0, TAU); c.fill(); } });
    c.fillStyle = '#ffd0e6'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-4.4 + i * 1.76, -4.9, .7, 0, Math.PI); c.fill(); }
    for (const x of [-1.4, 1.4]) ojo(c, e, t, x, -8, .7, { piel: '#ff9ac8', ln: '#a83a78' });
    c.fillStyle = 'rgba(255,120,170,.5)'; c.beginPath(); c.ellipse(-2.6, -6.8, .6, .35, 0, 0, TAU); c.ellipse(2.6, -6.8, .6, .35, 0, 0, TAU); c.fill();
    c.restore();
  };
  // oruga monarca: anillos amarillos, negros y blancos, antenitas; trepa la enredadera comiéndose las hojas
  FD.oruga = (c, e, t) => {
    const ln = '#1a1a14', cols = ['#f2e8c8', '#1a1a14', '#f2c230', '#1a1a14'];
    c.save(); if (e.trepa) { c.translate(0, -2); c.rotate(-Math.PI / 2); }
    for (let i = 5; i >= 0; i--) { const x = -6 + i * 2.2, y = -2.8 - Math.max(0, Math.sin(e.anim * 6 - i * .9)) * 1.4; c.fillStyle = ln; c.beginPath(); c.arc(x, y, 2.4, 0, TAU); c.fill(); c.fillStyle = cols[i % 4]; c.beginPath(); c.arc(x, y, 1.9, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(x - .6, y - .8, .6, 0, TAU); c.fill(); }
    const hx = 6.6, hy = -3.2 - Math.max(0, Math.sin(e.anim * 6 + .9)) * 1.4;
    vol(c, c => c.arc(hx, hy, 2.4, 0, TAU), '#f2c230', { ln, lw: .4 });
    trazo(c, [[hx - .6, hy - 2], [hx - 1.4, hy - 4.4 + Math.sin(t * 5) * .4]], .3, ln, { lw: 0 }); trazo(c, [[hx + .6, hy - 2], [hx + 1.2, hy - 4.6 + Math.sin(t * 5 + 1) * .4]], .3, ln, { lw: 0 });
    ojo(c, e, t, hx + .8, hy - .4, .6, { piel: '#f2c230', ln });
    c.fillStyle = ln; if (e.come && Math.sin(t * 20) > 0) { c.beginPath(); c.arc(hx + 2, hy + .8, .7, 0, TAU); c.fill(); }
    c.restore();
  };
  // pavo real: cuello azul, copete, y la cola: cerrada es una cauda; abierta, un abanico de ojos
  FD.pavo = (c, e, t) => {
    const a = e.abre || 0, ln = '#1a2a3a', a2 = Math.sin(e.anim * 8);
    if (a > .05) for (let i = 0; i < 11; i++) {
      const an = Math.PI * (1.05 + i / 10 * .9) * (1 - a * .0) , R = 16 * a + 4, x = -2 + Math.cos(an) * R, y = -8 + Math.sin(an) * R * .95;
      c.strokeStyle = '#6a4a2a'; c.lineWidth = .5; c.beginPath(); c.moveTo(-2, -7); c.lineTo(x, y); c.stroke();
      vol(c, c => c.ellipse(x, y, 2.4 * a + .6, 3.2 * a + .8, an + Math.PI / 2, 0, TAU), '#7a5a3a', { ln, lw: .3, s: false });
      c.fillStyle = '#e8a13a'; c.beginPath(); c.arc(x, y, 1.3 * a, 0, TAU); c.fill(); c.fillStyle = '#2f7fc8'; c.beginPath(); c.arc(x, y, .7 * a, 0, TAU); c.fill();
    }
    else vol(c, c => { c.moveTo(-3, -6); c.quadraticCurveTo(-10, -5, -14, -2 + Math.sin(t * 2) * .6); c.quadraticCurveTo(-9, -2, -3, -3); c.closePath(); }, '#7a5a3a', { ln, lw: .35, tex: c => { for (let k = 0; k < 4; k++) { c.fillStyle = '#d4af37'; c.beginPath(); c.arc(-5 - k * 2.4, -3.6 + k * .3, .6, 0, TAU); c.fill(); } } });
    for (const [lx, ph] of [[-1, 0], [1.6, 1]]) trazo(c, [[lx, -3], [lx + (ph ? a2 : -a2) * .6 * (1 - a), 0]], .5, '#8a6a4a', { lw: .4 });
    vol(c, c => c.ellipse(0, -5, 3.6, 2.6, 0, 0, TAU), '#2f7f78', { ln, lw: .4, hl: [-1, -6.2, 1.4] });
    trazo(c, [[2, -6.4], [3, -9, 3.4, -11]], 1.2, '#3f8fd8', { ln });
    vol(c, c => c.arc(3.8, -11.6, 1.6, 0, TAU), '#3f8fd8', { ln, lw: .35 });
    c.fillStyle = '#ff8a2a'; for (const [x, y] of [[3, -13.1], [4.2, -13.3], [5, -12.5], [2.4, -12.2]]) { c.beginPath(); c.arc(x, y, .42, 0, TAU); c.fill(); }
    c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(4.6, -11.8, .9, .5, 0, 0, TAU); c.fill();
    ojo(c, e, t, 4.4, -11.8, .45, { piel: '#2a6ad0', ln, enojo: a > .5 ? .6 : 0 });
    c.fillStyle = '#c9a24a'; c.beginPath(); c.moveTo(5.2, -11.6); c.lineTo(6.6, -11.2); c.lineTo(5.2, -10.8); c.fill();
  };
  // cucú de la relojería: pajarito de madera negro y oro, con el pico abierto
  FD.cucu = (c, e, t) => {
    const ln = '#0b0e14';
    vol(c, c => c.ellipse(0, -3.4, 3.4, 2.6, 0, 0, TAU), '#1a1e28', { ln, lw: .4, hl: [-.8, -4.4, 1.2], tex: c => { c.strokeStyle = '#d4af37'; c.lineWidth = .3; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-2.6 + k, -4.6); c.lineTo(-1.4 + k, -2.2); c.stroke(); } } });
    vol(c, c => c.arc(2.6, -5.4, 1.8, 0, TAU), '#1a1e28', { ln, lw: .35 });
    const ab = Math.sin(t * 16) > 0 ? .8 : .2;
    c.fillStyle = '#d4af37'; c.beginPath(); c.moveTo(4, -5.8); c.lineTo(6.4, -5.8 - ab * .6); c.lineTo(4.2, -5.2); c.closePath(); c.fill(); c.beginPath(); c.moveTo(4, -5.2); c.lineTo(6.2, -4.8 + ab * .6); c.lineTo(4.2, -4.8); c.closePath(); c.fill();
    ojo(c, e, t, 2.8, -5.8, .5, { piel: '#1a1e28', blanco: '#efe3c8', ln });
    trazo(c, [[-3, -3], [-5, -2]], .5, '#d4af37', { lw: .3 });
  };
  // bailarina de caja de música: tutú dorado y rosa; girando se ve de canto, en la reverencia se inclina
  FD.bailarina = (c, e, t) => {
    const P = pal({ main: '#f2c0c8', dark: '#3a2a2a', light: '#fff0f2', accent: '#d4af37', eye: '#ffffff' }), rev = e.reverencia, s = rev ? 1 : Math.abs(Math.cos(e.giro || 0)) * .7 + .3, ln = '#3a2a2a';
    c.save(); c.scale(s, 1);
    trazo(c, [[0, -6], [0, -.4]], .6, '#f6e0d0', { ln, lw: .3 }); if (!rev) trazo(c, [[0, -5], [2.6, -3.6]], .5, '#f6e0d0', { ln, lw: .3 });
    c.fillStyle = '#d4af37'; c.fillRect(-2, 0, 4, 1);
    vol(c, c => c.ellipse(0, -6.2, 5.4, 1.6, 0, 0, TAU), P.m, { ln, lw: .35, tex: c => { c.strokeStyle = P.a; c.lineWidth = .3; for (let k = -4; k <= 4; k += 1.4) { c.beginPath(); c.moveTo(k * .4, -6.8); c.lineTo(k, -5); c.stroke(); } } });
    c.save(); if (rev) { c.translate(0, -7); c.rotate(.6); c.translate(0, 7); }
    vol(c, c => c.ellipse(0, -9, 1.6, 2.6, 0, 0, TAU), P.m, { ln, lw: .35 });
    if (rev) { trazo(c, [[-1, -10.4], [-3, -8]], .4, '#f6e0d0', { ln, lw: .3 }); trazo(c, [[1, -10.4], [2.6, -8]], .4, '#f6e0d0', { ln, lw: .3 }); }
    else { trazo(c, [[-1, -10.4], [-1.6, -13.4], [0, -14.4]], .4, '#f6e0d0', { ln, lw: .3 }); trazo(c, [[1, -10.4], [1.6, -13.4], [0, -14.4]], .4, '#f6e0d0', { ln, lw: .3 }); }
    vol(c, c => c.arc(0, -12.4, 1.5, 0, TAU), '#f6e0d0', { ln, lw: .35 }); c.fillStyle = '#3a2a2a'; c.beginPath(); c.arc(-.3, -13.4, 1.2, Math.PI, 0); c.fill(); c.beginPath(); c.arc(0, -14, .7, 0, TAU); c.fill();
    if (s > .6) { c.strokeStyle = ln; c.lineWidth = .25; c.beginPath(); c.arc(.6, -12.4, .4, .2, Math.PI - .2); c.stroke(); }
    c.restore(); c.restore();
    if (!rev) { c.strokeStyle = 'rgba(212,175,55,.6)'; c.lineWidth = .3; c.beginPath(); c.ellipse(0, -6.2, 7, 2, 0, Math.sin(t * 9), Math.sin(t * 9) + 2); c.stroke(); }
  };
  // rover de reparto: caja con seis ruedas, banderita y pantalla de cara; hackeado se apaga
  FD.rover = (c, e, t) => {
    const off = e.st === 'glass', em = e.embiste, ln = '#05080e', a = Math.sin(e.anim * 20);
    for (let k = 0; k < 3; k++) { vol(c, c => c.arc(-4.8 + k * 4.8, -1.6, 1.8, 0, TAU), '#2a2d3a', { ln, lw: .35, s: false }); c.strokeStyle = '#4a4f70'; c.lineWidth = .3; c.beginPath(); const r = off ? 0 : e.x * .3; c.moveTo(-4.8 + k * 4.8 + Math.cos(r) * 1.4, -1.6 + Math.sin(r) * 1.4); c.lineTo(-4.8 + k * 4.8 - Math.cos(r) * 1.4, -1.6 - Math.sin(r) * 1.4); c.stroke(); }
    vol(c, c => roundRect(c, -6.6, -9, 13.2, 6.6, 1.4), '#d8dce8', { ln, lw: .45, hl: [-3, -8, 2], tex: c => { c.fillStyle = '#ff2a6d'; c.fillRect(-6.6, -5, 13.2, 1); c.fillStyle = '#4a4f70'; c.fillRect(-5.6, -8.2, 3.6, 2.6); } });
    vol(c, c => roundRect(c, 1.2, -8.4, 4.8, 3.4, .8), '#0a0c16', { ln, lw: .35, s: false, l: false });
    if (off) { c.fillStyle = '#4a4f70'; c.font = 'bold 2.4px monospace'; c.fillText('zz', 2.2, -6); }
    else { c.fillStyle = em ? '#ff2a6d' : '#05d9e8'; c.fillRect(2.2 + (e._mx || 0) * .4, -7.6, 1, em ? .6 : 1.2); c.fillRect(4.2 + (e._mx || 0) * .4, -7.6, 1, em ? .6 : 1.2); if (em) { c.fillRect(2.2, -6.2, 3, .4); } }
    trazo(c, [[-5, -9], [-5.4, -13]], .25, '#4a4f70', { lw: .2 }); c.fillStyle = '#ff2a6d'; c.beginPath(); c.moveTo(-5.4, -13); c.lineTo(-3 + a * .3, -12.4); c.lineTo(-5.4, -11.6); c.fill();
    if (!off) brilla(c, 6.8, -5.6, em ? 6 : 3, '#fff6c8', em ? .7 : .35);
  };

  // ---------------- lote 6 de mundos (mundos-ampliados5.js) ----------------
  // la bestia de la cueva: silueta negra, melena, colmillos y ojos que brillan; corre a cuatro patas
  FD.bestia = (c, e, t) => {
    const ln = '#05040a', cuerpo = '#16121e', corre = e.corre, a = Math.sin(e.anim * (corre ? 22 : 8)), ruge = e.ruge > 0;
    for (const [lx, ph, col] of [[-7, 1, '#0e0b14'], [5, 0, '#0e0b14'], [-5, 0, cuerpo], [7, 1, cuerpo]]) { const sw = (ph ? a : -a) * (corre ? 3 : 1.2); trazo(c, [[lx, -6], [lx + sw * .6, -3], [lx + sw, 0]], 2, col, { ln }); }
    trazo(c, [[-10, -9], [-15, -10 + a, -17, -6]], 1.2, cuerpo, { ln });
    vol(c, c => { c.moveTo(-11, -8); c.bezierCurveTo(-11, -15, 4, -17, 9, -12); c.lineTo(9, -6); c.bezierCurveTo(3, -4.4, -6, -4.4, -11, -8); c.closePath(); }, cuerpo, { ln, s: false, l: 'rgba(130,110,180,.35)', d: [1, 1.4], tex: c => { c.strokeStyle = 'rgba(80,70,110,.5)'; c.lineWidth = .4; for (let k = -9; k < 7; k += 1.6) { c.beginPath(); c.moveTo(k, -14 + Math.abs(k) * .1); c.lineTo(k - 1, -11); c.stroke(); } } });
    c.save(); c.translate(10, -11 + (corre ? 1.5 : 0)); c.rotate(ruge ? -.3 : corre ? .15 : 0);
    vol(c, c => { c.moveTo(-3, -4); c.quadraticCurveTo(3, -6, 7, -1.6); c.lineTo(7, 1); c.quadraticCurveTo(2, 3.4, -3, 2.6); c.closePath(); }, cuerpo, { ln, s: false, l: 'rgba(130,110,180,.35)' });
    for (const d of [0, 1]) vol(c, c => { c.moveTo(-1 + d * 2.4, -3.6); c.lineTo(-2 + d * 2.4, -7); c.lineTo(1 + d * 2.4, -4); c.closePath(); }, cuerpo, { ln, lw: .4, s: false });
    if (ruge) { c.fillStyle = '#5a1020'; c.beginPath(); c.moveTo(2, .6); c.lineTo(7.4, -.6); c.lineTo(6.6, 3.6); c.closePath(); c.fill(); c.fillStyle = '#fffaf0'; for (const xx of [3.6, 5.6]) { c.beginPath(); c.moveTo(xx, .2); c.lineTo(xx + .4, 1.6); c.lineTo(xx + .8, 0); c.fill(); } }
    brilla(c, 3.4, -1.6, 4, '#ffe080', .6); c.fillStyle = '#ffe080'; c.beginPath(); c.ellipse(3.4, -1.6, 1, parpadea(e, t) ? .15 : .6, -.2, 0, TAU); c.fill();
    c.restore();
  };
  // guardián de Chicanná: guerrero maya con yelmo de jaguar, peto de algodón y lanzadardos; brilla la punta antes de tirar
  FD.guardia = (c, e, t) => {
    const ln = '#2a1408', piel = '#a8683e', algodon = '#e8dcc0';
    for (const [lx, cc] of [[-1.6, '#8a5230'], [1.6, piel]]) trazo(c, [[lx, -7], [lx, 0]], 1.2, cc, { ln });
    for (const lx of [-1.6, 1.6]) { c.fillStyle = '#7a3a1a'; c.fillRect(lx - .9, -.9, 1.8, .9); }
    vol(c, c => { c.moveTo(-3, -7.6); c.lineTo(3, -7.6); c.lineTo(2.2, -4.2); c.lineTo(-2.2, -4.2); c.closePath(); }, '#c8203a', { ln, lw: .3 });
    vol(c, c => roundRect(c, -3, -12.4, 6, 5.2, 1.2), algodon, { ln, hl: [-1.4, -11.6, 1.4], tex: c => { c.strokeStyle = 'rgba(200,32,58,.7)'; c.lineWidth = .35; for (const y of [-11, -9.4, -7.9]) { c.beginPath(); c.moveTo(-3, y); c.lineTo(3, y); c.stroke(); } } });
    c.fillStyle = '#3f9a7a'; for (let i = -2; i <= 2; i++) { c.beginPath(); c.arc(i * .9, -12.5 - Math.abs(i) * .12, .42, 0, TAU); c.fill(); }
    vol(c, c => c.ellipse(.6, -14.4, 2.5, 2.7, 0, 0, TAU), piel, { ln, hl: [0, -15.6, 1.1] });
    for (let i = 0; i < 4; i++) { const an = -2.5 + i * .34 + Math.sin(t * 3 + i) * .05; trazo(c, [[-.6, -16.4], [-.6 + Math.cos(an) * 7, -16.4 + Math.sin(an) * 7]], .7, i % 2 ? '#2f8a5a' : '#46b87a', { lw: .2 }); }
    vol(c, c => { c.moveTo(-2.4, -15.2); c.quadraticCurveTo(.6, -18.8, 3.6, -15.4); c.lineTo(4.2, -14); c.lineTo(1.6, -15.2); c.lineTo(-2.4, -14.4); c.closePath(); }, '#d9a441', { ln, lw: .35, tex: c => { c.fillStyle = '#3a2410'; for (const [x, y] of [[-.8, -16], [.8, -16.8], [2.2, -15.8]]) { c.beginPath(); c.arc(x, y, .36, 0, TAU); c.fill(); } } });
    ojo(c, e, t, 2, -14, .5, { piel, blanco: '#fff4e0', ln, enojo: .5 });
    trazo(c, [[1, -10.6], [4.6, -10.6]], .8, piel, { ln });
    trazo(c, [[3, -11], [9.6, -11.2]], .55, '#7a4a24', { lw: .25 });
    c.fillStyle = '#1a1420'; c.beginPath(); c.moveTo(9.4, -12); c.lineTo(11.6, -11.2); c.lineTo(9.4, -10.4); c.closePath(); c.fill();
    if (e.apunta) brilla(c, 10.4, -11.2, 3, '#f2b233', .5 + Math.sin(t * 30) * .3);
    if (e.voltea > 0) { c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = .4; c.beginPath(); c.arc(-1, -19, 1.6, Math.PI, Math.PI + e.voltea / 1.4 * TAU); c.stroke(); }
  };
  // ollita de barro: panzona, con asas y la boca abierta; se agacha antes de brincar
  FD.ollita = (c, e, t, s) => {
    const P = pal({ main: '#c66b3d', dark: '#3a2014', light: '#e8a070', accent: '#e8955a', eye: '#ffffff' }), ag = e.agacha ? .82 : 1;
    c.save(); c.scale(1 / Math.sqrt(ag), ag);
    vol(c, c => { c.moveTo(-3.6, -12); c.lineTo(3.6, -12); c.quadraticCurveTo(7.4, -8, 6.2, -3.4); c.quadraticCurveTo(4.8, 0, 0, 0); c.quadraticCurveTo(-4.8, 0, -6.2, -3.4); c.quadraticCurveTo(-7.4, -8, -3.6, -12); c.closePath(); }, P.m, { hl: [-2.4, -8, 2.4], tex: c => { c.strokeStyle = P.l; c.lineWidth = .6; c.beginPath(); c.moveTo(-6, -6); c.quadraticCurveTo(0, -4.6, 6, -6); c.stroke(); c.fillStyle = P.d; for (let k = -4; k <= 4; k += 2) { c.beginPath(); c.arc(k, -5.4 + Math.abs(k) * .1, .45, 0, TAU); c.fill(); } } });
    for (const d of [-1, 1]) { c.strokeStyle = P.ln; c.lineWidth = 1.4; c.beginPath(); c.arc(d * 6.2, -8, 1.6, d > 0 ? -1.4 : 1.7, d > 0 ? 1.4 : 4.5); c.stroke(); c.strokeStyle = P.m; c.lineWidth = .8; c.stroke(); }
    vol(c, c => c.ellipse(0, -12, 3.8, 1.2, 0, 0, TAU), P.ms, { lw: .4 }); c.fillStyle = '#2a120a'; c.beginPath(); c.ellipse(0, -12, 2.8, .7, 0, 0, TAU); c.fill();
    for (const x of [-1.8, 1.8]) ojo(c, e, t, x, -8.6, .8, { piel: P.m });
    c.fillStyle = '#5a2010'; c.beginPath(); c.ellipse(0, -6.4, 1, .7 + (e.vy < 0 ? .5 : 0), 0, 0, TAU); c.fill();
    c.restore();
  };
  // pajarito silbato: de barro, con agujeros de flauta; cuando silba salen notas
  FD.silbato = (c, e, t) => {
    const P = pal({ main: '#d89060', dark: '#3a2014', light: '#f0c098', accent: '#5a8ad8', eye: '#ffffff' }), f = Math.sin(e.anim * 14);
    vol(c, c => { c.moveTo(-1, -5); c.quadraticCurveTo(-4, -9 - f * 3, -7, -9 - f * 3); c.quadraticCurveTo(-4, -5, -1, -3.4); c.closePath(); }, P.ms, { lw: .35 });
    vol(c, c => { c.moveTo(-5, -4); c.lineTo(-8.4, -6); c.lineTo(-8, -2.6); c.closePath(); }, P.m, { lw: .35 });
    vol(c, c => c.ellipse(0, -4.4, 4.6, 3.2, 0, 0, TAU), P.m, { hl: [-1.4, -5.6, 1.6], tex: c => { c.strokeStyle = P.a; c.lineWidth = .4; c.beginPath(); c.moveTo(-3, -3); c.quadraticCurveTo(0, -1.8, 3, -3); c.stroke(); c.fillStyle = P.d; for (const x of [-2, 0, 2]) { c.beginPath(); c.arc(x, -4.2, .45, 0, TAU); c.fill(); } } });
    vol(c, c => { c.moveTo(4, -5.4); c.lineTo(6.6, -4.8); c.lineTo(4, -3.8); c.closePath(); }, P.l, { lw: .3 });
    ojo(c, e, t, 2.6, -5.6, .55, { piel: P.m });
    vol(c, c => { c.moveTo(.6, -6.6); c.quadraticCurveTo(2, -8.6, 3.4, -6.4); c.closePath(); }, P.d, { lw: .3 });
  };
  FXD.silbato = (c, e, t) => { if (!(e.silba > 0)) return; for (let k = 0; k < 3; k++) { const ph = (1 - e.silba / .6 + k / 3) % 1; c.fillStyle = `rgba(90,138,216,${1 - ph})`; c.font = 'bold 5px Alegreya, serif'; c.fillText(k % 2 ? '♪' : '♫', (e.dir || 1) * (6 + ph * 8) - 2, -8 - ph * 8 + k); } };
  // morena: cabeza verde moteada asomada de su agujero, con la boca abierta y dientitos
  FD.morena = (c, e, t) => {
    const ln = '#0b2a14', ab = e.ext > .6 ? 1 : .4;
    vol(c, c => { c.moveTo(-6, -6); c.quadraticCurveTo(0, -9, 5, -6); c.lineTo(6.4, -4.4 - ab); c.lineTo(3.4, -3.6); c.lineTo(6.4, -2.6 + ab); c.quadraticCurveTo(0, -.6, -6, -2); c.closePath(); }, '#5a8a3a', { ln, hl: [-1, -7, 1.8], tex: c => motas(c, [[-3, -5, .5], [-.6, -6.4, .45], [1.6, -5.2, .4], [-4.6, -3.4, .4], [.4, -3, .35]], '#2a4a1a') });
    c.fillStyle = '#3a0a14'; c.beginPath(); c.moveTo(6.4, -4.4 - ab); c.lineTo(3.4, -3.6); c.lineTo(6.4, -2.6 + ab); c.closePath(); c.fill();
    c.fillStyle = '#fffaf0'; for (const k of [0, 1]) { c.beginPath(); c.moveTo(4.4 + k * 1.2, -4.2 - ab * .6); c.lineTo(4.8 + k * 1.2, -3.4); c.lineTo(5.2 + k * 1.2, -4.2 - ab * .6); c.fill(); }
    ojo(c, e, t, 2.2, -6, .6, { piel: '#5a8a3a', iris: '#ffe080', ln, enojo: .8 });
  };
  // pez loro: escamas de colores, pico de loro que muerde burbujas
  FD.pezloro = (c, e, t) => {
    const ln = '#123f75', col = Math.sin(t * 9 + e.anim) * .8;
    vol(c, c => { c.moveTo(-5, -4); c.lineTo(-9, -7 + col); c.quadraticCurveTo(-7.6, -4, -9, -1 - col); c.closePath(); }, '#e86aa0', { ln, lw: .35 });
    vol(c, c => c.ellipse(0, -4, 5.6, 3.6, 0, 0, TAU), '#3ab0a0', { ln, hl: [-1.4, -5.6, 2], tex: c => { c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = .3; for (let x = -4; x < 4; x += 1.4) { c.beginPath(); c.arc(x, -4, 1.3, -1.2, 1.2); c.stroke(); } c.fillStyle = '#e86aa0'; c.beginPath(); c.ellipse(-1, -1.6, 4, 1.2, 0, 0, TAU); c.fill(); c.fillStyle = '#f2d060'; c.beginPath(); c.ellipse(2, -6.6, 2, .9, 0, 0, TAU); c.fill(); } });
    vol(c, c => { c.moveTo(4.6, -5.4); c.quadraticCurveTo(7.6, -5.2, 7.4, -3.6); c.quadraticCurveTo(6.6, -2.4, 4.6, -2.6); c.closePath(); }, '#f4f0e0', { ln, lw: .35 });
    if (e.muerde) { c.strokeStyle = ln; c.lineWidth = .3; c.beginPath(); c.moveTo(5, -4); c.lineTo(7.4, -4 + Math.sin(t * 30) * .6); c.stroke(); }
    ojo(c, e, t, 3, -5.2, .7, { piel: '#3ab0a0', ln });
    c.save(); c.translate(-.6, -3); c.rotate(Math.sin(t * 10) * .4); vol(c, c => c.ellipse(-1, 0, 1.6, .8, .5, 0, TAU), '#f2d060', { ln, lw: .3 }); c.restore();
  };
  // pirata incendiario: pañoleta, parche, barba y su antorcha; dormido por el agua, echa humito
  FD.incendiario = (c, e, t) => {
    const ln = '#1a0e08', piel = '#c98a5e', a = Math.sin(e.anim * 7), lanza = e.lanza > 0, duerme = e.st === 'sleep';
    for (const [lx, ph] of [[-1.6, 0], [1.6, 1]]) trazo(c, [[lx, -6], [lx + (ph ? a : -a), 0]], 1.1, '#3a2a4a', { ln });
    vol(c, c => roundRect(c, -3.4, -12, 6.8, 6.4, 1.2), '#e8dcc8', { ln, tex: c => { c.fillStyle = '#b8203a'; for (let k = 0; k < 3; k++) c.fillRect(-3.4, -11.4 + k * 2, 6.8, .8); c.fillStyle = '#3a2a1a'; c.fillRect(-3.4, -6.4, 6.8, .9); } });
    vol(c, c => c.arc(.4, -14.2, 2.6, 0, TAU), piel, { ln, hl: [-.4, -15.2, 1] });
    c.fillStyle = '#4a2a1a'; c.beginPath(); c.moveTo(-1.8, -13); c.quadraticCurveTo(.4, -10.2, 3, -12.8); c.lineTo(3, -13.6); c.quadraticCurveTo(.6, -12.4, -1.8, -13.6); c.fill();
    vol(c, c => { c.arc(.4, -15, 2.7, Math.PI, 0); c.closePath(); }, '#2a2236', { ln, lw: .35 }); c.fillStyle = '#2a2236'; c.beginPath(); c.moveTo(-2.2, -15); c.lineTo(-4.4, -13.4 + Math.sin(t * 5) * .5); c.lineTo(-3, -15.4); c.fill();
    c.fillStyle = ln; c.fillRect(-.4, -14.8, 1.6, 1.3); c.strokeStyle = ln; c.lineWidth = .25; c.beginPath(); c.moveTo(-2.2, -15.6); c.lineTo(2.8, -13.6); c.stroke();
    if (duerme) { c.strokeStyle = ln; c.lineWidth = .3; c.beginPath(); c.arc(2, -14.6, .5, .2, Math.PI - .2); c.stroke(); } else ojo(c, e, t, 2, -14.6, .5, { piel, ln, enojo: .5 });
    const hx = lanza ? 4.6 : 4, hy = lanza ? -17 : -9.4;
    trazo(c, [[2.6, -10.6], [hx, hy + 2]], .8, piel, { ln });
    trazo(c, [[hx, hy + 3], [hx + .6, hy - 2]], .6, '#6a4a2a', { ln, lw: .3 });
    if (!duerme) { brilla(c, hx + .6, hy - 3.4, 4, '#ff9a1f', .6); c.fillStyle = '#ff6c2f'; c.beginPath(); c.moveTo(hx - .8, hy - 2); c.quadraticCurveTo(hx + .6, hy - 6 - Math.sin(t * 20), hx + 2, hy - 2); c.fill(); c.fillStyle = '#ffe800'; c.beginPath(); c.moveTo(hx, hy - 2); c.quadraticCurveTo(hx + .6, hy - 4, hx + 1.2, hy - 2); c.fill(); }
  };
  // gólem de magma: piedra negra con grietas de lava que laten; enfriado (piedra), se le apagan
  FD.magma = (c, e, t) => {
    const ln = '#0a0404', a = Math.sin(e.anim * 6), frio = e.piedra, lat = .6 + Math.sin(t * 4 + e.hx) * .3;
    for (const [lx, ph] of [[-3.4, 0], [3, 1]]) trazo(c, [[lx, -5], [lx + (frio ? 0 : (ph ? a : -a)), 0]], 2.2, '#2a1a18', { ln });
    vol(c, c => { c.moveTo(-6.4, -4); c.lineTo(-7, -10); c.lineTo(-3, -14.4); c.lineTo(3.4, -14); c.lineTo(7, -9.6); c.lineTo(6.4, -4); c.lineTo(2, -3); c.lineTo(-3, -3); c.closePath(); }, '#2a1a18', { ln, hl: [-2, -11, 2.4], tex: c => {
      c.strokeStyle = frio ? '#4a3a3a' : `rgba(255,${120 + lat * 80},40,${.7 + lat * .3})`; c.lineWidth = .7; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(-5, -12); c.lineTo(-2.4, -9.4); c.lineTo(-3.4, -6.6); c.lineTo(-1, -4); c.moveTo(-2.4, -9.4); c.lineTo(1.4, -10.4); c.lineTo(4.4, -8); c.lineTo(3.4, -5); c.moveTo(1.4, -10.4); c.lineTo(2, -13.4); c.stroke();
    } });
    if (!frio) brilla(c, 0, -9, 9, '#ff6c2f', .25 * lat);
    for (const x of [-1.6, 2]) { c.fillStyle = frio ? '#3a3a3a' : '#ffe800'; c.beginPath(); c.ellipse(x + (e._mx || 0) * .4, -11, .9, parpadea(e, t) || frio ? .2 : .6, 0, 0, TAU); c.fill(); }
  };
  FXD.magma = (c, e, t) => { if (e.piedra) { for (let k = 0; k < 2; k++) { const ph = (t * .6 + k / 2) % 1; c.fillStyle = `rgba(220,230,240,${.5 * (1 - ph)})`; c.beginPath(); c.arc(Math.sin(ph * 6 + k) * 3, -16 - ph * 10, 1 + ph * 2, 0, TAU); c.fill(); } } };

  // ---------------- lote 7 de mundos (mundos-ampliados6.js) ----------------
  // manatí: hocico ancho y redondo, ojitos chicos y piel gris arrugada
  FD.foca = (c, e, t) => {
    const ln = '#2c2a34', P = pal({ main: '#8d8a8e', dark: '#2c2a34', light: '#c4bfc0', accent: '#2c2a34', eye: '#ffffff' });
    vol(c, c => { c.moveTo(-7, 2); c.quadraticCurveTo(-7, -8, -.5, -8.4); c.quadraticCurveTo(6.4, -8, 6.8, 2); c.closePath(); }, P.m, { ln, hl: [-2, -6, 2.4], tex: c => { c.strokeStyle = 'rgba(44,42,52,.28)'; c.lineWidth = .3; for (const y of [-5.4, -3.4, -1.4]) { c.beginPath(); c.moveTo(-6, y); c.quadraticCurveTo(-1, y + 1, 4, y - .4); c.stroke(); } } });
    vol(c, c => c.ellipse(3.2, -3.6, 3.8, 2.8, 0, 0, TAU), P.l, { ln, lw: .4 });
    c.fillStyle = ln; for (const [x, y] of [[4.8, -4.6], [3.4, -4.9]]) { c.beginPath(); c.ellipse(x, y, .42, .3, 0, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(44,42,52,.6)'; for (const [x, y] of [[2, -3], [3, -2.6], [4.2, -2.8], [5, -3.2], [2.6, -2], [3.8, -1.9]]) { c.beginPath(); c.arc(x, y, .16, 0, TAU); c.fill(); }
    ojo(c, e, t, -.4, -6, .6, { piel: P.m, iris: '#1a1a24', ln });
    c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(0, 2, 8.6, 1.4, 0, 0, TAU); c.fill();
  };
  // muñeco de nieve: tres bolas, bufanda roja, nariz de zanahoria y sombrero de palma; se echa para atrás antes de aventar
  FD.muneco = (c, e, t) => {
    const ln = '#5a6a8a', bl = '#ffffff', k = e.carga ? -.2 : Math.sin(t * 2 + e.hx) * .03;
    vol(c, c => c.arc(0, -4.4, 4.6, 0, TAU), bl, { ln, hl: [-1.6, -6, 2] });
    c.save(); c.translate(0, -8); c.rotate(k);
    vol(c, c => c.arc(0, -2.4, 3.4, 0, TAU), bl, { ln, hl: [-1.2, -3.6, 1.6], tex: c => motas(c, [[0, -2.4, .4], [0, -.6, .4]], '#2a3a5a') });
    trazo(c, [[-3, -2], [-6.6, -5 - (e.carga ? 2 : 0)]], .4, '#6a4a2a', { lw: .3 }); trazo(c, [[3, -2], [5.6, -4 + (e.carga ? -3 : 0)]], .4, '#6a4a2a', { lw: .3 });
    vol(c, c => c.arc(0, -7.6, 2.6, 0, TAU), bl, { ln, hl: [-1, -8.6, 1.2] });
    c.fillStyle = '#d9443a'; c.fillRect(-3, -5.6, 6, 1.4); c.beginPath(); c.moveTo(1.6, -5); c.lineTo(3.4, -2.4 + Math.sin(t * 4) * .4); c.lineTo(2.4, -2.2); c.fill();
    c.fillStyle = '#f08a2a'; c.beginPath(); c.moveTo(1.6, -7.8); c.lineTo(5, -7.4); c.lineTo(1.6, -6.8); c.closePath(); c.fill();
    for (const x of [-1, .9]) { c.fillStyle = '#2a3a5a'; c.beginPath(); c.arc(x + (e._mx || 0) * .3, -8.6, .45, 0, TAU); c.fill(); }
    vol(c, c => c.ellipse(0, -10, 4.4, 1, 0, 0, TAU), '#d8b878', { ln: '#6a4a2a', lw: .3 }); vol(c, c => { c.ellipse(0, -10.6, 2.2, 1.8, 0, Math.PI, 0); c.closePath(); }, '#d8b878', { ln: '#6a4a2a', lw: .3 });
    if (e.carga) vol(c, c => c.arc(5.8, -7.4, 1.8, 0, TAU), bl, { ln, lw: .3 });
    c.restore();
  };
  // cometa: núcleo brillante con cara traviesa y su cola de fuego
  FD.cometa = (c, e, t) => {
    brilla(c, 0, -4, 9, '#fff3c4', .6);
    vol(c, c => c.arc(0, -4, 3.4, 0, TAU), '#fff3c4', { ln: '#c8902a', lw: .4, hl: [-1, -5, 1.6] });
    for (const x of [-1, 1.2]) { c.fillStyle = '#0b1430'; c.beginPath(); c.arc(x, -4.6, .5, 0, TAU); c.fill(); }
    c.strokeStyle = '#0b1430'; c.lineWidth = .3; c.beginPath(); c.arc(0, -3.6, 1, .3, Math.PI - .3); c.stroke();
  };
  FX.cometa = (c, e, t) => {
    if (e.avisa) { c.save(); c.globalAlpha = .5 + Math.sin(t * 20) * .4; c.fillStyle = '#fff3c4'; c.font = 'bold 6px "Alegreya Sans", sans-serif'; c.fillText('✦', -3 + (e.hx - 120 - e.x), -50 + (e.hy - e.y)); c.restore(); }
    if (!e.pasa) return;
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let k = 1; k <= 14; k++) { const u = k / 14; c.fillStyle = `rgba(${255},${220 - u * 120},${140 - u * 100},${(1 - u) * .7})`; c.beginPath(); c.arc(-k * 2.4, -4 - k * 1, 3.4 * (1 - u * .7), 0, TAU); c.fill(); }
    c.restore();
  };
  // conejo de la luna: blanco y orejón, como el de las pinturas mayas; se agacha antes de brincar
  FD.conejo = (c, e, t) => {
    const ln = '#3a4a6a', bl = '#efe3c2', ag = e.agacha ? .85 : 1, air = e.aire;
    c.save(); c.scale(1 / Math.sqrt(ag), ag);
    if (air) trazo(c, [[-2, -3], [-6, -1]], 1, bl, { ln }); else vol(c, c => c.ellipse(-2.4, -1.6, 2.4, 1.4, 0, 0, TAU), bl, { ln, lw: .4 });
    vol(c, c => c.ellipse(0, -4.6, 4, 3.4, 0, 0, TAU), bl, { ln, hl: [-1, -6, 1.8] });
    vol(c, c => c.arc(-4, -5, 1.2, 0, TAU), '#ffffff', { ln, lw: .35 });
    vol(c, c => c.arc(3.6, -7.2, 2.4, 0, TAU), bl, { ln, hl: [3, -8.2, 1.2] });
    for (const [dx, a] of [[0, -.2], [1.4, .15]]) vol(c, c => c.ellipse(2.6 + dx, -12, 1, 3.6, a + (air ? -.4 : 0), 0, TAU), bl, { ln, lw: .35, tex: c => { c.fillStyle = 'rgba(255,170,190,.6)'; c.beginPath(); c.ellipse(2.6 + dx, -12, .4, 2.4, a + (air ? -.4 : 0), 0, TAU); c.fill(); } });
    ojo(c, e, t, 4.4, -7.6, .6, { piel: bl, ln });
    c.fillStyle = '#ff9ab0'; c.beginPath(); c.arc(5.8, -6.8, .4, 0, TAU); c.fill();
    trazo(c, [[1.6, -3], [2.4, air ? -1.6 : 0]], .7, bl, { ln, lw: .4 });
    c.restore();
  };
  // araña de ceniza: cuerpo de hollín, patas finas y ojos rojos; baja por su hilo
  FD.aranaCeniza = (c, e, t) => {
    const ln = '#000', cu = '#0a0a0c', a = Math.sin(t * 10) * (e.baja ? 1 : .3);
    for (let k = 0; k < 4; k++) for (const d of [-1, 1]) trazo(c, [[d * 1.6, -4], [d * (4 + k * .4), -6 - k + a * d * .4], [d * (6 + k * .5), -2 + k * .4]], .35, cu, { lw: 0 });
    vol(c, c => c.ellipse(0, -4, 2.8, 3, 0, 0, TAU), cu, { ln, s: false, l: 'rgba(80,80,90,.4)' });
    vol(c, c => c.arc(0, -1, 1.8, 0, TAU), cu, { ln, s: false, l: 'rgba(80,80,90,.4)' });
    for (const x of [-.8, .8]) { brilla(c, x, -1.2, 1.6, '#ff3030', .7); c.fillStyle = '#ff3030'; c.beginPath(); c.arc(x, -1.2, .4, 0, TAU); c.fill(); }
  };
  FX.aranaCeniza = (c, e) => { c.strokeStyle = 'rgba(200,200,210,.4)'; c.lineWidth = .3; c.beginPath(); c.moveTo(0, -(e.len || 6) - 40); c.lineTo(0, -6); c.stroke(); };
  // cuervo de ceniza: silueta erizada; cuando grazna abre el pico y le brillan los ojos
  FD.cuervoCeniza = (c, e, t) => {
    const ln = '#000', cu = '#0a0a0c', vuela = e.vuela > 0 || e.vuelve, f = Math.sin(e.anim * 14), gr = e.grazna > 0;
    if (vuela) for (const d of [-1, 1]) vol(c, c => { c.moveTo(0, -5); c.quadraticCurveTo(-3, -9 - f * 3 * d, -8, -10 - f * 4 * d); c.lineTo(-2, -3.6); c.closePath(); }, cu, { ln, s: false, lw: .3 });
    else { trazo(c, [[-1, -1.6], [-1, 0]], .4, cu, { lw: 0 }); trazo(c, [[1, -1.6], [1, 0]], .4, cu, { lw: 0 }); }
    vol(c, c => { c.moveTo(-6, -4); c.lineTo(-3, -6.4); c.quadraticCurveTo(1, -8, 3, -6); c.lineTo(3, -2.4); c.quadraticCurveTo(-1, -1, -3, -2.4); c.closePath(); }, cu, { ln, s: false, l: 'rgba(80,80,90,.4)' });
    c.fillStyle = cu; c.beginPath(); for (let k = 0; k < 5; k++) { c.moveTo(-3 + k * 1.2, -6.6 + k * .1); c.lineTo(-3.6 + k * 1.2, -8 - (k % 2)); c.lineTo(-2.4 + k * 1.2, -6.8); } c.fill();
    vol(c, c => c.arc(3.4, -6.4, 1.8, 0, TAU), cu, { ln, s: false, lw: .3 });
    c.fillStyle = '#2a2a2e'; c.beginPath(); c.moveTo(4.8, -7); c.lineTo(7.6, -6.6 - (gr ? 1 : 0)); c.lineTo(4.8, -6); c.closePath(); c.fill(); if (gr) { c.beginPath(); c.moveTo(4.8, -6); c.lineTo(7.2, -5); c.lineTo(4.8, -5.6); c.fill(); }
    brilla(c, 3.8, -6.8, gr ? 4 : 2, '#ff3030', gr ? .9 : .5); c.fillStyle = '#ff3030'; c.beginPath(); c.arc(3.8, -6.8, .4, 0, TAU); c.fill();
  };
  FXD.cuervoCeniza = (c, e, t) => { if (!(e.grazna > 0)) return; c.save(); c.fillStyle = `rgba(255,48,48,${e.grazna})`; c.font = 'bold 5px "Alegreya Sans", sans-serif'; c.textAlign = 'center'; c.fillText('¡CRUAC!', 0, -14 - (1 - e.grazna) * 6); c.restore(); };
  // topón de 8 bits: un tabique cabezón con casco; brinca a romper ladrillos
  FD.topon = (c, e, t) => {
    const ln = '#000000', a = Math.sin(e.anim * 10), air = (e.vy || 0) !== 0;
    for (const [x, ph] of [[-3, 0], [2, 1]]) vol(c, c => roundRect(c, x + (air ? 0 : (ph ? a : -a)) - 1, -2.4, 3, 2.4, .6), '#5a2a10', { ln, lw: .4, s: false });
    vol(c, c => roundRect(c, -5, -9, 10, 7, 1.6), '#e8a060', { ln, hl: [-2, -8, 1.6] });
    vol(c, c => { c.ellipse(0, -9.4, 6.2, 4, 0, Math.PI, 0); c.closePath(); }, '#c84c0c', { ln, hl: [-2.4, -12, 1.8], tex: c => { c.fillStyle = '#fc9838'; c.fillRect(-6, -10, 12, .9); } });
    for (const x of [-1.6, 2]) ojo(c, e, t, x, -6.6, .9, { piel: '#e8a060', ln, enojo: air ? .9 : .5 });
    c.fillStyle = ln; c.fillRect(-1.6, -4, 3.4, .8);
  };
  // halcón de 8 bits: alas en ángulo y garras; se queda quieto un instante apuntando
  FD.halcon = (c, e, t) => {
    const ln = '#000000', f = e.apunta ? 0 : Math.sin(e.anim * 18);
    for (const d of [-1, 1]) vol(c, c => { c.moveTo(-1, -5); c.lineTo(-5, -9 - f * 3 * d); c.lineTo(-9, -8 - f * 3 * d); c.lineTo(-3, -3.4); c.closePath(); }, d < 0 ? '#7a3a10' : '#a85a20', { ln, lw: .4, s: false });
    vol(c, c => c.ellipse(0, -4.6, 4.4, 2.6, 0, 0, TAU), '#a85a20', { ln, hl: [-1, -5.6, 1.4], tex: c => { c.fillStyle = '#fcd8a8'; c.beginPath(); c.ellipse(.6, -3.6, 3, 1.2, 0, 0, TAU); c.fill(); } });
    vol(c, c => c.arc(4, -6, 2.1, 0, TAU), '#a85a20', { ln, lw: .4 });
    c.fillStyle = '#fc9838'; c.beginPath(); c.moveTo(5.6, -6.6); c.lineTo(8, -5.6); c.lineTo(5.6, -5); c.closePath(); c.fill();
    ojo(c, e, t, 4.4, -6.6, .6, { piel: '#a85a20', blanco: '#fcfcfc', ln, enojo: .8 });
    if (e.apunta) { c.strokeStyle = '#f83800'; c.lineWidth = .5; c.beginPath(); c.arc(0, -4.6, 7 + Math.sin(t * 20), 0, TAU); c.stroke(); }
  };

  // ---------------- lote 8 de mundos (mundos-ampliados7.js) ----------------
  // fantasma del baluarte: un pirata ánima con sombrero; en lo oscuro casi no se ve, a la luz se asusta
  FD.fantasma = (c, e, t) => {
    const v = e.vis || 0, ln = '#1c1626', ond = Math.sin(t * 4 + e.hx);
    c.save(); c.globalAlpha *= .22 + v * .7;
    vol(c, c => { c.moveTo(-5, -9); c.quadraticCurveTo(-5.6, -15, 0, -15); c.quadraticCurveTo(5.6, -15, 5, -9); c.lineTo(5, -2); for (let k = 0; k <= 4; k++) c.lineTo(5 - k * 2.5, (k % 2 ? 0 : -2.4) + ond * .6 * (k % 2 ? 1 : -1)); c.closePath(); }, '#cfe4f0', { ln, l: false, s: 'rgba(80,110,160,.4)', hl: [-1.6, -12, 2.2] });
    c.fillStyle = '#1c1626'; c.beginPath(); c.ellipse(0, -15.4, 6, 1.2, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(-3.6, -15.4); c.quadraticCurveTo(0, -19.4, 3.6, -15.4); c.fill(); c.fillStyle = '#b8203a'; c.fillRect(-3.4, -16.6, 6.8, .8);
    c.restore();
    const asusta = e.visible;
    for (const x of [-1.6, 1.8]) { brilla(c, x, -11, 2.4, asusta ? '#ffffff' : '#ffd04a', .5 + (1 - v) * .4); c.fillStyle = asusta ? '#1c1626' : '#ffd04a'; c.beginPath(); c.ellipse(x + (e._mx || 0) * .4, -11, asusta ? .9 : .6, asusta ? 1.2 : .6, 0, 0, TAU); c.fill(); }
    c.strokeStyle = 'rgba(28,22,38,' + (.3 + v * .6) + ')'; c.lineWidth = .4; c.beginPath(); if (asusta) c.ellipse(.2, -7.8, .9, 1.2, 0, 0, TAU); else c.arc(.2, -8.6, 1.3, .3, Math.PI - .3); c.stroke();
  };
  // soplo: un remolino de aire con cachetes inflados
  FD.soplo = (c, e, t) => {
    const s = e.sopla > 0, ln = '#463848';
    c.save(); c.strokeStyle = 'rgba(216,208,192,.8)'; c.lineWidth = .7; c.lineCap = 'round';
    for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(0, -5, 3 + k * 1.6, t * (6 + k) + k, t * (6 + k) + k + 3.6); c.stroke(); }
    c.restore();
    vol(c, c => c.arc(0, -5, 3.2 + (s ? .6 : 0), 0, TAU), '#e8e0d0', { ln, hl: [-1, -6, 1.4], lw: .35 });
    for (const x of [-1.2, 1.2]) { c.fillStyle = ln; c.beginPath(); c.arc(x, -5.8, .4, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(255,150,170,.6)'; c.beginPath(); c.ellipse(-1.8, -4.4, .7, .45, 0, 0, TAU); c.ellipse(1.8, -4.4, .7, .45, 0, 0, TAU); c.fill();
    c.fillStyle = ln; c.beginPath(); c.ellipse(2.4, -4.2, s ? .9 : .5, s ? .7 : .35, 0, 0, TAU); c.fill();
  };
  FX.soplo = (c, e, t) => { if (!(e.sopla > 0)) return; c.strokeStyle = 'rgba(216,208,192,.7)'; c.lineWidth = .5; for (let k = 0; k < 3; k++) { const u = (t * 3 + k / 3) % 1; c.beginPath(); c.moveTo(4 + u * 10, -4 + (k - 1) * 2); c.lineTo(8 + u * 10, -4 + (k - 1) * 2.6); c.stroke(); } };
  // tucán de Calakmul: pico enorme de colores, pecho amarillo
  FD.tucan = (c, e, t) => {
    const ln = '#111111', f = Math.sin(e.anim * 12), pica = e.pica > 0;
    vol(c, c => { c.moveTo(-4, -5); c.lineTo(-8.4, -4); c.lineTo(-7.6, -2); c.closePath(); }, '#1a1a1a', { ln, lw: .3 });
    vol(c, c => { c.moveTo(-1, -6); c.quadraticCurveTo(-4, -10 - f * 3, -8, -9 - f * 3); c.quadraticCurveTo(-4, -5, -1, -4); c.closePath(); }, '#1a1a1a', { ln, lw: .3, s: false });
    vol(c, c => c.ellipse(0, -5, 4.2, 3, 0, 0, TAU), '#1a1a1a', { ln, hl: [-1, -6.4, 1.6], tex: c => { c.fillStyle = '#ffe070'; c.beginPath(); c.ellipse(2, -4.6, 2, 2.4, 0, 0, TAU); c.fill(); c.fillStyle = '#e83a3a'; c.fillRect(-1, -2.4, 3, .9); } });
    c.save(); c.translate(3.6, -6.4); c.rotate(pica ? Math.sin(t * 30) * .2 : 0);
    vol(c, c => { c.moveTo(0, -1.4); c.quadraticCurveTo(5, -2.6, 8.6, -.2); c.quadraticCurveTo(5, 1.6, 0, 1.2); c.closePath(); }, '#f2a33a', { ln, lw: .35, tex: c => { c.fillStyle = '#7ad04a'; c.beginPath(); c.moveTo(0, -1.4); c.quadraticCurveTo(2, -1.8, 3, -1.6); c.lineTo(3, 1.3); c.lineTo(0, 1.2); c.fill(); c.fillStyle = '#e83a3a'; c.beginPath(); c.arc(8.2, -.2, .7, 0, TAU); c.fill(); } });
    c.restore();
    vol(c, c => c.ellipse(2.8, -6.6, 1.2, 1.1, 0, 0, TAU), '#5ab0d8', { ln, lw: .3, s: false }); ojo(c, e, t, 2.8, -6.6, .55, { piel: '#5ab0d8', ln });
  };
  // nauyaca: víbora enroscada con cabeza de flecha; cascabelea antes de morder
  FD.nauyaca = (c, e, t) => {
    const ln = '#1a1408', k = e.ext || 0, cas = e.aviso > 0;
    for (let i = 0; i < 3; i++) vol(c, c => c.ellipse(-2 + i * .4, -1.4 - i * 1.6, 5 - i * 1.1, 1.6, 0, 0, TAU), '#8a7a4a', { ln, lw: .4, tex: c => { c.fillStyle = '#4a3a1a'; for (let j = -4; j <= 4; j += 2) { c.beginPath(); c.moveTo(-2 + j, -1.4 - i * 1.6 - 1); c.lineTo(-1 + j, -1.4 - i * 1.6); c.lineTo(-2 + j, -1.4 - i * 1.6 + 1); c.lineTo(-3 + j, -1.4 - i * 1.6); c.closePath(); c.fill(); } } });
    if (cas) { const v = Math.sin(t * 60) * .6; c.fillStyle = '#d8c890'; for (let j = 0; j < 3; j++) { c.beginPath(); c.ellipse(-7.4 - j * 1.2 + v, -2 - j * .6, .8, .6, 0, 0, TAU); c.fill(); } c.fillStyle = 'rgba(255,255,255,.8)'; c.font = 'bold 4px "Alegreya Sans", sans-serif'; c.fillText('tsss', -11, -7); }
    const hx = 1 + k * 9, hy = -6.4 + k * 2.4;
    trazo(c, [[0, -5], [hx - 1.4, hy]], 1.6, '#8a7a4a', { ln, lw: .4 });
    vol(c, c => { c.moveTo(hx - 1.8, hy - 1.6); c.lineTo(hx + 2.4, hy - 1.2); c.lineTo(hx + 3.6, hy); c.lineTo(hx + 2.4, hy + 1.2); c.lineTo(hx - 1.8, hy + 1.4); c.closePath(); }, '#9a8a54', { ln, lw: .4 });
    ojo(c, e, t, hx + 1, hy - .6, .5, { piel: '#9a8a54', iris: '#e8c040', ln, enojo: .8 });
    if (k > .3) { c.fillStyle = '#fffaf0'; c.beginPath(); c.moveTo(hx + 2.6, hy + .4); c.lineTo(hx + 3, hy + 1.8); c.lineTo(hx + 3.4, hy + .4); c.fill(); }
    if ((t * 1.3 + e.hx) % 1.4 < .2 || k > .3) { c.strokeStyle = '#d02040'; c.lineWidth = .3; c.beginPath(); c.moveTo(hx + 3.6, hy); c.lineTo(hx + 5.4, hy + .2); c.lineTo(hx + 6, hy - .4); c.moveTo(hx + 5.4, hy + .2); c.lineTo(hx + 6, hy + .8); c.stroke(); }
  };
  // calderita: caldera de cobre con patitas, manómetro y chimenea; resopla de lado
  FD.calderita = (c, e, t) => {
    const ln = '#1a0c06', a = Math.sin(e.anim * 10), av = e.avisa ? Math.sin(t * 40) * .5 : 0;
    for (const [x, ph] of [[-3, 0], [2.4, 1]]) trazo(c, [[x, -3], [x + (e.flota ? 0 : (ph ? a : -a)), 0]], .7, '#4a2a18', { ln, lw: .4 });
    vol(c, c => c.ellipse(av, -6.6, 5.4, 4.4, 0, 0, TAU), '#c8743a', { ln, hl: [-1.8, -8.4, 2.2], tex: c => { c.strokeStyle = '#8a4a24'; c.lineWidth = .5; for (const y of [-9, -4.4]) { c.beginPath(); c.moveTo(-5.4, y); c.lineTo(5.4, y); c.stroke(); } motas(c, [[-4, -9, .3], [-1.4, -9, .3], [1.4, -9, .3], [4, -9, .3]], '#f2d090'); } });
    vol(c, c => roundRect(c, -1 + av, -14, 2.6, 4, .5), '#4a2a18', { ln, lw: .35 });
    vol(c, c => c.arc(2 + av, -6.6, 1.8, 0, TAU), '#f2e0b0', { ln, lw: .35, s: false }); c.strokeStyle = '#b8203a'; c.lineWidth = .35; c.beginPath(); c.moveTo(2 + av, -6.6); const ang = e.avisa || e.resopla ? -.3 : -2.4; c.lineTo(2 + av + Math.cos(ang) * 1.4, -6.6 + Math.sin(ang) * 1.4); c.stroke();
    for (const x of [-2.6, -.6]) ojo(c, e, t, x + av, -7.4, .65, { piel: '#c8743a', ln, enojo: e.avisa ? .8 : .3 });
    if (Math.random() < .5) { c.fillStyle = 'rgba(232,224,216,.6)'; c.beginPath(); c.arc(.3 + av + Math.sin(t * 5) * .6, -15 - (t * 8 % 4), 1 + (t * 8 % 4) * .3, 0, TAU); c.fill(); }
  };
  FX.calderita = (c, e, t) => { if (!e.resopla) return; c.save(); for (let k = 0; k < 9; k++) { const u = (t * 2.4 + k / 9) % 1; c.fillStyle = `rgba(240,232,224,${.7 * (1 - u)})`; c.beginPath(); c.arc(6 + u * 40, -6 + Math.sin(k * 2 + t * 6) * 2 * u, 1.5 + u * 3, 0, TAU); c.fill(); } c.restore(); };
  // pájaro de cuerda: ornitóptero de latón con alas de tela y llave en la espalda
  FD.pajaro = (c, e, t) => {
    const ln = '#1a0c06', f = Math.sin(e.anim * 16);
    for (const d of [-1, 1]) vol(c, c => { c.moveTo(-1, -5); c.lineTo(-4, -10 - f * 3.4 * d); c.lineTo(-8, -9 - f * 3 * d); c.lineTo(-3, -4); c.closePath(); }, d < 0 ? '#c8b088' : '#efe0c0', { ln, lw: .35, s: false, tex: c => { c.strokeStyle = '#8a4a24'; c.lineWidth = .3; c.beginPath(); c.moveTo(-1, -5); c.lineTo(-6, -9.4 - f * 3 * d); c.stroke(); } });
    vol(c, c => c.ellipse(0, -4.6, 4, 2.4, 0, 0, TAU), '#c8903a', { ln, hl: [-1, -5.6, 1.4], tex: c => motas(c, [[-2, -4.6, .3], [0, -4.6, .3], [2, -4.6, .3]], '#f2d090') });
    vol(c, c => c.arc(3.6, -6, 1.8, 0, TAU), '#c8903a', { ln, lw: .35 });
    c.fillStyle = '#8a4a24'; c.beginPath(); c.moveTo(5.2, -6.4); c.lineTo(7.6, -5.8); c.lineTo(5.2, -5.2); c.closePath(); c.fill();
    ojo(c, e, t, 4, -6.4, .55, { blanco: '#ffe08a', pupila: '#5a2a10', piel: '#c8903a', ln });
    c.save(); c.translate(-3.6, -6.6); c.rotate(t * 6); c.strokeStyle = '#e8b860'; c.lineWidth = .4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -1.6); c.stroke(); c.beginPath(); c.arc(-.6, -2, .6, 0, TAU); c.arc(.6, -2, .6, 0, TAU); c.stroke(); c.restore();
  };

  for (const k of ['fantasma', 'soplo', 'tucan', 'nauyaca', 'calderita', 'pajaro', 'foca', 'muneco', 'cometa', 'conejo', 'aranaCeniza', 'cuervoCeniza', 'topon', 'halcon', 'bestia', 'guardia', 'ollita', 'silbato', 'morena', 'pezloro', 'incendiario', 'magma', 'charran', 'medusa', 'oruga', 'pavo', 'cucu', 'bailarina', 'rover', 'gargola', 'campana', 'goma', 'sacapuntas', 'catrin', 'carcoma', 'aplastador', 'cuadrito', 'nahual', 'bejuco', 'carpintero', 'geoda', 'escribano', 'guerrero', 'girasol', 'cuervo', 'chapulin', 'pirata', 'hadita', 'loro', 'garza', 'zancudo', 'mojarra', 'libelula', 'tijeras', 'grulla', 'polilla', 'esporin', 'bucanero', 'fragata']) GEN.add(k);
})();
