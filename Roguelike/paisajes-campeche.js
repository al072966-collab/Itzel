'use strict';
// =====================================================================
//  PAISAJES DE CAMPECHE: un lugar real, grande y reconocible, al fondo de su nivel.
//  Es solo telón (nunca es piso ni toca colisiones) y se dibuja por código en la
//  paleta de cada estilo. Datos de cada lugar: campeche-hallazgos.js.
//    · pixel   (La muralla en obra)         → la Puerta de Mar
//    · bits64  (La selva de Calakmul)       → el Edificio de las Tres Torres de Xpuhil
//    · oleo    (Noche en el Fuerte de San Miguel) → también San José el Alto, en la otra colina
//    · hielo/posadas (Las posadas de San Francisco) → el santuario de Guadalupe, «la Morenita»
//    · segunda tanda: hacienda Uayamón (vapor), Baluarte de la Soledad (bits32), Teatro Toro (deco), malecón (anime), catedral (vitral), Casa del Teniente (paper)
// =====================================================================
(function () {
  if (typeof STYLE_MAP === 'undefined') return;
  const h1 = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  // las imágenes de los lugares (tools/lugares-campeche.py); si alguna no ha cargado se usa el dibujo por código de abajo
  const VL = typeof vestirNivel === 'function' ? vestirNivel({ id: 'lugares', carpeta: 'lugares-campeche', ver: 2 }) : null;
  // REGLA: un lugar es telón lejano y va asentado en el suelo de SU capa del telón (la fila de casas, la orilla
  // del agua, el monte), nunca flotando ni parado en un hueco del nivel. Cada telón tiene su línea de suelo:
  // revisarlo con capturas en los huecos del nivel. Con `silueta` se pinta de un solo color (el de la capa
  // donde va), para que se lea lejos y no como un objeto del nivel.
  const SIL = new Map();
  // dónde va asentado cada lugar (la base, en coordenadas de su telón). Ajustado con capturas en los huecos.
  const Y = window.LUGARES_Y = { pixel: 222, bits64: 228, posadas: 180, acuarela: 178, ocaso: 176, paper: 181, vapor: 180, bits32: 222, deco: 178, anime: 181, vitral: 176 };
  function silueta(n, color) {
    const k = n + '|' + color; if (SIL.has(k)) return SIL.get(k);
    const im = VL.IMG[n], cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight;
    const x = cv.getContext('2d'); x.drawImage(im, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, cv.width, cv.height);
    SIL.set(k, cv); return cv;
  }
  function dib(c, n, x, y, o = {}) {
    if (!VL || !VL.listo(n)) return false;
    c.save(); if (o.filtro) c.filter = o.filtro;
    if (o.silueta) {
      const t = VL.TAM[n], k = o.w ? o.w / t.w : o.h ? o.h / t.h : 1, w = t.w * k, h = t.h * k;
      if (o.alfa !== undefined) c.globalAlpha *= o.alfa;
      c.drawImage(silueta(n, o.silueta), x - w / 2, y - h, w, h);
      if (o.reflejo) { c.globalAlpha *= .35; c.scale(1, -1); c.drawImage(silueta(n, o.silueta), x - w / 2, -y - h * .5, w, h * .5); }
    } else VL.spr(c, n, x, y, Object.assign({ ay: 1 }, o));
    c.restore(); return true;
  }
  window.LUGARES_CAMPECHE = { dib, listo: n => !!(VL && VL.listo(n)) };
  const nivelEs = id => (typeof CUR !== 'undefined' && CUR && CUR.def && CUR.def.id) === id;
  function repite(c, f, par, u, dibuja, alfa) {
    const off = (f.cam * par) % u, base = Math.floor(f.cam * par / u);
    c.save(); c.globalAlpha = alfa;
    for (let k = -1; k * u - off < VW + u; k++) { const i = base + k; if (i !== 0 && h1(i, 2) < .18) continue; dibuja(c, k * u - off + (i === 0 ? u * .3 : 60 + h1(i, 5) * (u * .35)), i); }
    c.restore();
  }
  function envuelve(estilo, nivel, fn) {
    const st = STYLE_MAP[estilo]; if (!st || !st.sky) return; const antes = st.sky;
    st.sky = function (c, f) { const r = antes.apply(this, arguments); if (nivelEs(nivel) && !window.estiloArteDerivado) { try { fn(c, f); } catch (e) { /* el telón nunca rompe la partida */ } } return r; };
  }
  const rec = (c, x, y, w, h) => c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));

  // ---- Puerta de Mar: arco central, dos torreones con almenas y el lienzo de muralla a los lados ----
  function puertaMar(c, x, y) {
    if (dib(c, 'puertaMar', x, y + 2, { w: 120 })) return;
    c.fillStyle = '#d9b87a'; rec(c, x - 70, y - 22, 140, 22);                                   // muralla
    c.fillStyle = '#c9a463'; for (let a = -70; a < 70; a += 10) rec(c, x + a, y - 26, 6, 4);   // almenas
    c.fillStyle = '#e4c58c'; rec(c, x - 26, y - 46, 52, 46); rec(c, x - 30, y - 50, 60, 4);       // cuerpo de la puerta
    for (let a = -30; a < 30; a += 9) rec(c, x + a, y - 56, 5, 6);
    c.fillStyle = '#3b2b3c'; c.beginPath(); c.moveTo(x - 11, y); c.lineTo(x - 11, y - 20); c.arc(x, y - 20, 11, Math.PI, 0); c.lineTo(x + 11, y); c.fill(); // el arco
    c.fillStyle = '#8fd0e8'; c.beginPath(); c.moveTo(x - 7, y); c.lineTo(x - 7, y - 19); c.arc(x, y - 19, 7, Math.PI, 0); c.lineTo(x + 7, y); c.fill();  // se ve el mar por la puerta
    c.fillStyle = '#b89155'; rec(c, x - 52, y - 40, 20, 40); rec(c, x + 32, y - 40, 20, 40);      // torreones
    c.fillStyle = '#d9b87a'; rec(c, x - 54, y - 44, 24, 4); rec(c, x + 30, y - 44, 24, 4);
    c.fillStyle = '#3b2b3c'; rec(c, x - 44, y - 30, 3, 7); rec(c, x + 41, y - 30, 3, 7);
    c.fillStyle = '#c4452d'; rec(c, x - 1, y - 74, 1.5, 18); c.beginPath(); c.moveTo(x + .5, y - 74); c.lineTo(x + 10, y - 71); c.lineTo(x + .5, y - 68); c.fill(); // bandera
  }
  envuelve('pixel', 'pixel', (c, f) => repite(c, f, .1, 520, (cc, x) => puertaMar(cc, x, Y.pixel), .8));

  // ---- Xpuhil, Edificio de las Tres Torres: una fachada con tres torres escalonadas y falsos templos arriba ----
  function tresTorres(c, x, y) {
    if (dib(c, 'xpuhil', x, y + 2, { w: 125, alfa: .72, filtro: 'saturate(.7) brightness(1.05)' })) return;
    const piedra = '#9fb7a0', sombra = '#7c967f', claro = '#c5d6c2';
    c.fillStyle = sombra; rec(c, x - 44, y - 14, 88, 14);                                            // base
    c.fillStyle = piedra; rec(c, x - 40, y - 26, 80, 12);
    for (const [dx, alto] of [[-30, 60], [0, 72], [30, 60]]) {                                    // las tres torres
      c.fillStyle = piedra; rec(c, x + dx - 9, y - alto, 18, alto - 26);
      c.fillStyle = sombra; rec(c, x + dx - 11, y - alto + 6, 22, 5); rec(c, x + dx - 7, y - alto - 6, 14, 6);
      c.fillStyle = claro; rec(c, x + dx - 4, y - alto - 12, 8, 6);                              // falso templo
      c.fillStyle = sombra; rec(c, x + dx - 3, y - alto - 15, 6, 3);
    }
    c.fillStyle = sombra; for (let a = -34; a <= 34; a += 17) { rec(c, x + a - 2, y - 24, 4, 6); }  // mascarones
    c.fillStyle = '#6b8a70'; rec(c, x - 8, y - 22, 16, 22);                                        // la escalinata central
    c.fillStyle = claro; for (let s = 0; s < 4; s++) rec(c, x - 8, y - 4 - s * 5, 16, 1.5);
  }
  envuelve('bits64', 'bits64', (c, f) => repite(c, f, .07, 640, (cc, x) => tresTorres(cc, x + 230, Y.bits64), .7));

  // ---- Óleo: San José el Alto en la colina de la derecha, pintado a pinceladas (San Miguel ya está en su cerro) ----
  function sanJose(c, x, y) {
    c.fillStyle = 'rgba(30,40,95,.85)'; c.beginPath(); c.moveTo(x - 90, y); c.quadraticCurveTo(x - 40, y - 26, x, y - 24); c.quadraticCurveTo(x + 50, y - 22, x + 100, y); c.fill();
    c.fillStyle = '#b9a26a'; rec(c, x - 30, y - 46, 60, 22); c.fillStyle = '#9b8654'; for (let a = -30; a < 30; a += 8) rec(c, x + a, y - 50, 5, 4);
    c.fillStyle = '#cdb77f'; rec(c, x - 12, y - 66, 24, 20); rec(c, x - 14, y - 70, 28, 4);
    c.fillStyle = '#2a2f6b'; rec(c, x - 3, y - 60, 6, 10); rec(c, x - 20, y - 38, 4, 7); rec(c, x + 16, y - 38, 4, 7);
    c.strokeStyle = 'rgba(226,196,118,.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 30, y - 46); c.lineTo(x + 30, y - 46); c.stroke();
    c.fillStyle = '#e2c476'; rec(c, x - 1, y - 82, 1.5, 12); c.beginPath(); c.moveTo(x + .5, y - 82); c.lineTo(x + 9, y - 79); c.lineTo(x + .5, y - 76); c.fill();
  }

  // ---- Santuario de Guadalupe («la Morenita»): fachada con espadaña y campanario, con nieve ----
  function guadalupe(c, x, y) {
    if (dib(c, 'guadalupe', x, y + 2, { w: 64 })) return;
    c.fillStyle = '#f0c9a6'; rec(c, x - 26, y - 30, 52, 30);                                          // nave
    c.fillStyle = '#e6b88f'; rec(c, x - 26, y - 33, 52, 3);
    c.fillStyle = '#fbfdff'; rec(c, x - 28, y - 36, 56, 4);                                          // nieve en el techo
    c.fillStyle = '#e8b896'; rec(c, x - 9, y - 54, 18, 24);                                          // cuerpo de la torre
    c.fillStyle = '#c98a63'; rec(c, x - 11, y - 56, 22, 3);
    c.fillStyle = '#fbfdff'; rec(c, x - 12, y - 60, 24, 4);
    c.fillStyle = '#7a4a3a'; c.beginPath(); c.moveTo(x - 6, y - 60); c.lineTo(x, y - 74); c.lineTo(x + 6, y - 60); c.fill(); c.fillStyle = '#fbfdff'; c.beginPath(); c.moveTo(x - 3, y - 66); c.lineTo(x, y - 74); c.lineTo(x + 3, y - 66); c.fill();
    c.fillStyle = '#7a4a3a'; c.beginPath(); c.moveTo(x - 5, y - 38); c.lineTo(x - 5, y - 46); c.arc(x, y - 46, 5, Math.PI, 0); c.lineTo(x + 5, y - 38); c.fill();   // campana
    c.fillStyle = '#e2a93a'; rec(c, x - 1.5, y - 44, 3, 4);
    c.fillStyle = '#6b4a3e'; c.beginPath(); c.moveTo(x - 7, y); c.lineTo(x - 7, y - 12); c.arc(x, y - 12, 7, Math.PI, 0); c.lineTo(x + 7, y); c.fill();   // portón
    c.fillStyle = '#fff0b0'; rec(c, x - 20, y - 22, 4, 6); rec(c, x + 16, y - 22, 4, 6);
    c.fillStyle = '#d9575f'; rec(c, x - 1, y - 78, 1.5, 6); rec(c, x - 3, y - 76.5, 6, 1.5);          // cruz
  }
  envuelve('hielo', 'posadas', (c, f) => repite(c, f, .12, 420, (cc, x) => guadalupe(cc, x, Y.posadas), .97));

  // ---- Candelaria (cenote de acuarela): la iglesia de la Virgen de la Candelaria junto a su río turquesa ----
  function candelaria(c, x, y) {
    if (dib(c, 'candelaria', x, y + 6, { w: 92, alfa: .8 })) return;
    c.fillStyle = 'rgba(80,190,200,.65)'; c.fillRect(x - 70, y - 3, 140, 6);                         // el río
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x - 60, y - 1, 30, 1); c.fillRect(x + 10, y + 1, 40, 1);
    c.fillStyle = '#f4efe0'; rec(c, x - 22, y - 26, 44, 23); rec(c, x - 8, y - 46, 16, 20);      // nave y torre
    c.fillStyle = '#d9a35a'; rec(c, x - 22, y - 28, 44, 3); rec(c, x - 10, y - 48, 20, 3);
    c.fillStyle = '#b4543a'; c.beginPath(); c.moveTo(x - 7, y - 48); c.lineTo(x, y - 58); c.lineTo(x + 7, y - 48); c.fill();
    c.fillStyle = '#6b4a3e'; c.beginPath(); c.moveTo(x - 5, y - 3); c.lineTo(x - 5, y - 11); c.arc(x, y - 11, 5, Math.PI, 0); c.lineTo(x + 5, y - 3); c.fill();
    c.fillStyle = '#8fd0c8'; c.beginPath(); c.arc(x, y - 36, 3, 0, 6.3); c.fill();
    c.fillStyle = '#c2453a'; rec(c, x - .7, y - 64, 1.4, 6); rec(c, x - 2.5, y - 62.5, 5, 1.4);
  }
  envuelve('acuarela', 'acuarela', (c, f) => repite(c, f, .08, 470, (cc, x) => candelaria(cc, x, Y.acuarela), .6));

  // ---- Sabancuy (ocaso): el estero con mangle y una lancha de pescador, a contraluz ----
  function sabancuy(c, x, y) {
    // el ocaso es de siluetas: el mangle y la lancha van a contraluz, del color de los islotes, sobre la línea del agua
    if ((dib(c, 'mangle', x - 30, y, { w: 54, silueta: '#4a1f4e', reflejo: true }), dib(c, 'lancha', x + 40, y + Math.sin(performance.now() / 700) * .8, { w: 34, silueta: '#3a173f', reflejo: true }))) return;
    c.fillStyle = 'rgba(60,24,60,.8)';
    for (let a = -50; a <= 50; a += 14) { c.beginPath(); c.moveTo(x + a, y); c.quadraticCurveTo(x + a - 4, y - 16, x + a - 9, y - 22); c.lineTo(x + a - 7, y - 22); c.quadraticCurveTo(x + a, y - 14, x + a + 3, y); c.fill(); c.beginPath(); c.ellipse(x + a - 8, y - 24, 8, 4.5, 0, 0, 6.3); c.fill(); }
    c.fillStyle = '#ffcf8a'; c.beginPath(); c.moveTo(x + 6, y - 2); c.lineTo(x + 40, y - 2); c.lineTo(x + 34, y + 5); c.lineTo(x + 12, y + 5); c.closePath(); c.fill();
    rec(c, x + 22, y - 18, 1.4, 16); c.beginPath(); c.moveTo(x + 23.5, y - 18); c.lineTo(x + 34, y - 4); c.lineTo(x + 23.5, y - 4); c.fill();
    c.fillStyle = 'rgba(255,190,120,.35)'; rec(c, x - 55, y + 3, 120, 1.2);
  }
  envuelve('ocaso', 'ocaso', (c, f) => { if (!window.SEYBAPLAYA_TELON_LISTO || !window.SEYBAPLAYA_TELON_LISTO()) repite(c, f, .09, 450, (cc, x) => sabancuy(cc, x, Y.ocaso), .9); });

  // ---- Casa Seis (papel picado): casona colonial de la calle 57 con su portón de arco y balcones ----
  function casaSeis(c, x, y) {
    if (dib(c, (Math.floor(x / 97) % 2) ? 'casaAzul' : 'casaSeis', x, y + 1, { w: 84 })) return;
    c.fillStyle = '#e98aa0'; rec(c, x - 36, y - 42, 72, 42);
    c.fillStyle = '#fff3e0'; rec(c, x - 38, y - 46, 76, 5); rec(c, x - 38, y - 22, 76, 2);
    c.fillStyle = '#5b3a2a'; c.beginPath(); c.moveTo(x - 8, y); c.lineTo(x - 8, y - 20); c.arc(x, y - 20, 8, Math.PI, 0); c.lineTo(x + 8, y); c.fill();
    c.fillStyle = '#fff3e0'; c.beginPath(); c.moveTo(x - 10, y); c.lineTo(x - 10, y - 20); c.arc(x, y - 20, 10, Math.PI, 0); c.lineTo(x + 10, y); c.lineTo(x + 8, y); c.lineTo(x + 8, y - 20); c.arc(x, y - 20, 8, 0, Math.PI, true); c.lineTo(x - 8, y); c.fill();
    for (const wx of [-26, 20]) { c.fillStyle = '#fff3e0'; rec(c, x + wx - 1, y - 38, 12, 14); c.fillStyle = '#3d5a80'; rec(c, x + wx + 1, y - 36, 8, 10); c.fillStyle = '#2b2b2b'; rec(c, x + wx, y - 26, 10, 1.4); }
    c.fillStyle = '#fff3e0'; for (let a = -36; a < 36; a += 8) rec(c, x + a, y - 50, 5, 4);
  }
  envuelve('paper', 'paper', (c, f) => repite(c, f, .17, 600, (cc, x, i) => { if (i % 2 === 0) casaSeis(cc, x + 120, Y.paper); else dib(cc, 'casaTeniente', x + 120, Y.paper + 1, { w: 84 }); }, 1));

  // ---- segunda tanda de lugares (imágenes de ChatGPT; sin ellas no se dibuja nada) ----
  // Hacienda Uayamón con su chimenea de ladrillo: la fábrica de vapor, entre humo y resplandor
  envuelve('vapor', 'vapor', (c, f) => repite(c, f, .09, 560, (cc, x) => dib(cc, 'haciendaUayamon', x + 60, Y.vapor, { w: 150, filtro: 'sepia(.55) brightness(.5) saturate(1.3)' }), .55));
  // Baluarte de la Soledad: de noche, en piedra azulada, sobre el mar de la muralla
  envuelve('bits32', 'bits32', (c, f) => repite(c, f, .07, 520, (cc, x) => dib(cc, 'baluarteSoledad', x + 80, Y.bits32, { w: 120, filtro: 'brightness(.55) saturate(.6) hue-rotate(185deg)' }), .75));
  // Teatro Francisco de Paula Toro: al fondo de la tramoya dorada, como un telón pintado
  envuelve('deco', 'deco', (c, f) => repite(c, f, .06, 600, (cc, x) => dib(cc, 'teatroToro', x + 150, Y.deco, { w: 120, filtro: 'sepia(1) saturate(4) hue-rotate(-8deg) brightness(.75)' }), .26));
  // Malecón de Campeche: barandal con farola y palmera junto a los resortes
  envuelve('anime', 'anime', (c, f) => {
    if (typeof CUR !== 'undefined' && CUR && CUR.def && (CUR.def.id === 'anime_nubes' || CUR.def.id === 'anime')) return;
    repite(c, f, .28, 520, (cc, x) => dib(cc, 'malecon', x + 80, Y.anime, { w: 150 }), .95);
  });
  // Catedral de la Concepción: sus dos torres entre el vidrio de colores
  envuelve('vitral', 'vitral', (c, f) => repite(c, f, .08, 560, (cc, x) => dib(cc, 'catedral', x + 120, Y.vitral, { w: 110, filtro: 'sepia(.5) saturate(1.4) hue-rotate(215deg) brightness(.55)' }), .7));
})();
