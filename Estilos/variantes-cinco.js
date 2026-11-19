'use strict';
// =====================================================================
//  5 DISEÑOS NUEVOS para cada uno de los otros mundos (además del de
//  ahora). Se arman con recetas y la paleta propia de cada mundo.
// =====================================================================
(function () {
  const ONE = (id) => ({ nombre: 'El de ahora', nota: 'El diseño que tiene el juego hoy.', itzel: STYLE_MAP[id].player, fresita: STYLE_MAP[id].fresita });
  const D = (nombre, nota, r) => Object.assign({ nombre, nota }, r);
  const Fd = (o) => (c, fr, f) => drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, o);
  const glow = (c, x, y, r, col, a) => { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, x, y, r, col, a); c.restore(); };
  // ---------- recetas ----------
  const colores = (oI, oF) => ({ itzel: I(oI), fresita: F(oF) });
  const silueta = (k, acc, ojo, extraI = {}) => ({ itzel: I({ mono: k, keep: ['bow', 'flowers'], bow: acc, flowerCols: [acc], noFace: true, eyeGlow: ojo, ...extraI }), fresita: F({ mono: k, keep: ['gill', 'gillTip'], gill: acc, gillTip: ojo, eyeGlow: ojo, lw: 0, glow: acc, glowA: .25 }) });
  const linea = (col, lw = .6, brillo, fondo) => ({
    itzel: (c, p, f) => { if (fondo) drawItzel(c, p, f, { _mode: 'fill', mono: fondo, noFace: true }); c.save(); if (brillo) { c.shadowColor = brillo; c.shadowBlur = 4 * f.S; } drawItzel(c, p, f, { _mode: 'line', lw, line: col }); c.restore(); },
    fresita: (c, fr, f) => { if (fondo) drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { _mode: 'fill', mono: fondo, noHalo: true }); c.save(); if (brillo) { c.shadowColor = brillo; c.shadowBlur = 4 * f.S; } drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { _mode: 'line', lw, line: col, noHalo: true }); c.restore(); } });
  const contraluz = (k, filo, oI = {}, oF = {}) => ({
    itzel: (c, p, f) => { c.save(); c.translate(p.face * .7, -.4); drawItzel(c, p, f, { ...oI, _mode: 'fill', mono: filo }); c.restore(); drawItzel(c, p, f, { ...oI, mono: k, keep: ['bow'], noFace: true, eyeGlow: filo }); },
    fresita: (c, fr, f) => { c.save(); c.translate(fr.face * .7, -.4); drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { ...oF, _mode: 'fill', mono: filo, noHalo: true }); c.restore(); drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { ...oF, mono: k, keep: ['gill', 'gillTip'], eyeGlow: filo, glow: filo, glowA: .15 }); } });
  const filo = (oI, oF, col) => ({
    itzel: (c, p, f) => { c.save(); c.translate(-p.face * .6, -.3); drawItzel(c, p, f, { ...oI, _mode: 'fill', mono: col, noFace: true }); c.restore(); drawItzel(c, p, f, oI); },
    fresita: (c, fr, f) => { c.save(); c.translate(-fr.face * .6, -.4); drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { ...oF, _mode: 'fill', mono: col, noHalo: true }); c.restore(); drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, oF); } });
  const cristal = (fill, line, a = .3) => ({
    itzel: (c, p, f) => { c.save(); c.globalAlpha = a; drawItzel(c, p, f, { _mode: 'fill', mono: fill, noFace: true }); c.restore(); c.save(); c.shadowColor = line; c.shadowBlur = 3 * f.S; drawItzel(c, p, f, { _mode: 'line', lw: .55, line }); c.restore(); },
    fresita: (c, fr, f) => { c.save(); c.globalAlpha = a; drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { _mode: 'fill', mono: fill, noHalo: true }); c.restore(); c.save(); c.shadowColor = line; c.shadowBlur = 3 * f.S; drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { _mode: 'line', lw: .55, line, noHalo: true }); c.restore(); } });
  const tramado = (col, lineCol = col, cruz = true) => ({
    itzel: (c, p, f) => drawItzel(c, p, f, { mono: rayado(f, col, 1.1, -.8, .35, cruz), keep: ['eye'], eye: lineCol, lw: .55, line: lineCol }),
    fresita: (c, fr, f) => drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { mono: rayado(f, col, 1.1, -.8, .35, cruz), keep: ['eye'], eye: lineCol, lw: .55, line: lineCol, noHalo: true }) });
  const sombra = (oI, oF, col = '#1a1020', a = .38) => ({
    itzel: (c, p, f) => { drawItzel(c, p, f, oI); c.save(); c.beginPath(); c.rect(p.face > 0 ? p.x - 30 : p.x, p.y - 40, 30, 50); c.clip(); c.globalAlpha = a; drawItzel(c, p, f, { ...oI, _mode: 'fill', mono: col }); c.restore(); },
    fresita: (c, fr, f) => drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, oF) }); // Fresita sin sombra abajo: le hacía barba
  const halo = (oI, oF, col, r = 16) => ({
    itzel: (c, p, f) => { glow(c, p.x, p.y - 10, r, col, .45); drawItzel(c, p, f, oI); },
    fresita: (c, fr, f) => { glow(c, fr.x, fr.y, r, col, .4); drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, oF); } });
  const brillos = (r, cols) => (c, a, f) => { const k = Math.floor(f.t * 6); for (let i = 0; i < 5; i++) { const u = hash1(i, k), v = hash1(i + 7, k); c.fillStyle = cols[i % cols.length]; const x = a.x - 10 + u * 20, y = a.y - 22 + v * 22; c.fillRect(x - .9, y - .2, 1.8, .4); c.fillRect(x - .2, y - .9, .4, 1.8); } };
  const conBrillos = (rec, cols) => ({ itzel: (c, p, f) => { rec.itzel(c, p, f); brillos(0, cols)(c, p, f); }, fresita: (c, fr, f) => { rec.fresita(c, fr, f); brillos(0, cols)(c, { x: fr.x, y: fr.y + 12 }, f); } });
  const dosTintas = (fill, line, oI = {}) => ({
    itzel: (c, p, f) => { c.save(); c.translate(.8, .5); drawItzel(c, p, f, { ...oI, _mode: 'fill', mono: fill, noFace: true }); c.restore(); c.save(); c.globalCompositeOperation = 'multiply'; drawItzel(c, p, f, { _mode: 'line', lw: .6, line }); c.restore(); },
    fresita: (c, fr, f) => { c.save(); c.translate(.8, .5); drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { _mode: 'fill', mono: fill, noHalo: true }); c.restore(); c.save(); c.globalCompositeOperation = 'multiply'; drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { _mode: 'line', lw: .6, line, noHalo: true }); c.restore(); } });
  const envuelve = (rec, w) => ({ itzel: w(rec.itzel), fresita: w(rec.fresita) });
  const alfa = (a) => fn => (c, x, f) => { c.save(); c.globalAlpha = a; fn(c, x, f); c.restore(); };
  // paletas de Itzel (rasgos de siempre) que se recolorean
  const pal = (skin, hair, blouse, emb, shorts, shoes, bow, pack, extra = {}) => ({ skin, hair, blouse, emb, shorts, shoes, bow, pack, ...extra });
  const pf = (body, belly, gill, gillTip, extra = {}) => ({ body, belly, gill, gillTip, ...extra });
  // sprites de pixel
  const PX = (fn, o) => pixelSprite(fn, o);
  const pxI = (o) => PX(I(o), { w: 30, h: 32, oy: 27, ...o.px }), pxF = (o) => PX(F(o), { w: 30, h: 22, oy: 11, ...o.px });
  const spriteI = (o) => PX((c, p, f) => pixelItzel(c, p, f.t), { w: 26, h: 26, oy: 22, ...o }), spriteF = (o) => PX((c, fr, f) => pixelFresita(c, fr.x, fr.y, fr.face, f.t), { w: 30, h: 20, oy: 10, ...o });
  const pixBrillo = (fn, col) => (c, a, f) => { fn(c, a, f); if (Math.floor(f.t * 4) % 2) { const x = Math.round(a.x + Math.cos(f.t * 2) * 9), y = Math.round(a.y - 12 + Math.sin(f.t * 3) * 7); c.fillStyle = col; c.fillRect(x, y, 1, 1); c.fillRect(x - 1, y, 3, 1 / 3 * 0 + 1); c.fillRect(x, y - 1, 1, 3); } };
  // diseños que David ya eligió: pasan al juego y la lista deja de mostrar el anterior
  const ELEGIDOS = { ocaso: 'Contraluz dorado', acuarela: 'Pastel' };
  const V = (id, lista) => {
    const el = ELEGIDOS[id];
    if (!el) { VARIANTES[id] = [ONE(id), ...lista]; return; }
    VARIANTES[id] = lista.map(d => d.nombre === el ? Object.assign({}, d, { nota: d.nota + ' Es el que tiene el juego ahora.' }) : d);
  };

  // ================= PIXEL =================
  const DB_NOCHE = ['#222034', '#3f3f74', '#5b6ee1', '#639bff', '#cbdbfc', '#76428a', '#d77bba', '#ffffff', '#45283c'];
  const DB_TARDE = ['#222034', '#45283c', '#663931', '#8f563b', '#df7126', '#d9a066', '#eec39a', '#fbf236', '#ac3232', '#d95763', '#ffffff'];
  V('pixel', [
    D('Paleta de atardecer', 'El mismo sprite con solo naranjas, cafés y rosas, como una escena de tarde de SNES.', { itzel: spriteI({ palette: DB_TARDE }), fresita: spriteF({ palette: DB_TARDE }) }),
    D('Paleta de noche', 'Azules y morados: el sprite como si fuera de noche.', { itzel: spriteI({ palette: DB_NOCHE }), fresita: spriteF({ palette: DB_NOCHE }) }),
    D('Pixel más detallado', 'Dibujo completo de Itzel convertido a pixel duro con contorno, más parecido a su diseño vectorial.', { itzel: pxI({ glint: '#ffffff', px: { levels: 5, outline: '#222034' } }), fresita: pxF({ lw: 0, glowA: 0, noHalo: true, px: { levels: 5, outline: '#45283c' } }) }),
    D('Calcomanía', 'El sprite con un borde blanco por fuera, como estampa.', { itzel: spriteI({ outline: '#ffffff' }), fresita: spriteF({ outline: '#ffffff' }) }),
    D('Destellos', 'Con un destello de pixel que gira alrededor, como en los menús de SNES.', { itzel: pixBrillo((c, p, f) => pixelItzel(c, p, f.t), '#fbf236'), fresita: pixBrillo((c, fr, f) => pixelFresita(c, fr.x, fr.y, fr.face, f.t), '#ffffff') }),
  ]);
  const NES = ['#000000', '#fcfcfc', '#f83800', '#fcd8a8', '#c84c0c', '#00a800', '#b8f818', '#0078f8', '#f878f8', '#fc9838', '#503000', '#a4e4fc', '#f8b800'];
  V('bits8', [
    D('Tres colores', 'Como un sprite real de NES: solo tres colores más el transparente.', { itzel: spriteI({ palette: ['#000000', '#f83800', '#fcd8a8'] }), fresita: spriteF({ palette: ['#000000', '#f878f8', '#fcfcfc'] }) }),
    D('Pixel más detallado', 'El dibujo completo en paleta NES, con contorno negro.', { itzel: pxI({ px: { palette: NES, outline: '#000000' } }), fresita: pxF({ noHalo: true, px: { palette: NES, outline: '#000000' } }) }),
    D('Calcomanía', 'Borde blanco alrededor del sprite.', { itzel: spriteI({ palette: NES, outline: '#fcfcfc' }), fresita: spriteF({ palette: NES, outline: '#fcfcfc' }) }),
    D('Azul y blanco', 'Paleta fría de NES: azules, blancos y negro.', { itzel: spriteI({ palette: ['#000000', '#0078f8', '#a4e4fc', '#fcfcfc', '#f83800'] }), fresita: spriteF({ palette: ['#000000', '#a4e4fc', '#fcfcfc', '#f878f8'] }) }),
    D('Destellos', 'Con un destello de estrella girando.', { itzel: pixBrillo(spriteI({ palette: NES }), '#f8b800'), fresita: pixBrillo(spriteF({ palette: NES }), '#fcfcfc') }),
  ]);
  const base32 = { skin: '#b9845e', hair: '#1c1626', blouse: '#e8e2f0', blouse2: '#b8b0cc', emb: ['#d84a5a', '#ffd04a', '#5a8ad8', '#5ab86a'], shorts: '#3a7a5a', shoes: '#d84a5a', bow: '#e0304a', pack: '#c8902a', eye: '#1c1626', glint: '#ffffff' };
  V('bits32', [
    D('Luz de antorcha', 'Tonos cálidos, como si las iluminara una antorcha.', { itzel: pxI({ ...pal('#e09a6a', '#2a1410', '#ffe0b0', ['#ff6a3a', '#ffd04a'], '#6a5a2a', '#ff5a3a', '#ff4a3a', '#d8902a'), eye: '#2a1410', px: { levels: 9, outline: '#2a0f0a' } }), fresita: pxF({ body: '#ffb090', belly: '#ffe0c0', gill: '#ff6a3a', gillTip: '#ffd04a', noHalo: true, px: { levels: 9, outline: '#3a0f0a' } }) }),
    D('Sin contorno', 'Sprites a doble resolución sin línea, solo color.', { itzel: pxI({ ...base32, px: { levels: 9 } }), fresita: pxF({ noHalo: true, px: { levels: 9 } }) }),
    D('Contorno dorado', 'Un filo dorado como de carta de colección.', { itzel: pxI({ ...base32, px: { levels: 9, outline: '#ffd04a' } }), fresita: pxF({ noHalo: true, px: { levels: 9, outline: '#ffd04a' } }) }),
    D('Silueta de luna', 'Silueta morada con el filo de la luna.', { itzel: PX(contraluz('#1c1626', '#d9cfae').itzel, { w: 30, h: 32, oy: 27, levels: 9 }), fresita: PX(contraluz('#1c1626', '#d9cfae').fresita, { w: 30, h: 22, oy: 11, levels: 9 }) }),
    D('Fantasma', 'Medio transparentes y azules, como espíritus del baluarte.', { itzel: alfa(.7)(pxI({ mono: '#8a96ff', keep: ['bow'], bow: '#ff8aa8', noFace: true, eyeGlow: '#ffffff', twoEyes: true, px: { levels: 6, outline: '#2a2a5a' } })), fresita: alfa(.7)(pxF({ mono: '#8a96ff', keep: ['gill'], gill: '#ff8aa8', eyeGlow: '#ffffff', noHalo: true, px: { levels: 6, outline: '#2a2a5a' } })) }),
  ]);
  V('bits64', [
    D('Contorno de color', 'Contorno morado en vez de café, como en Eastward.', { itzel: pxI({ glint: '#ffffff', px: { levels: 16, outline: '#3a2a5a' } }), fresita: pxF({ lw: 0, glowA: .25, px: { levels: 16, outline: '#5a2a5a' } }) }),
    D('Sin contorno', 'Pixel art moderno sin línea, con muchos tonos.', { itzel: pxI({ glint: '#ffffff', px: { levels: 24 } }), fresita: pxF({ lw: 0, glowA: .2, px: { levels: 24 } }) }),
    D('Luz de atardecer', 'Colores dorados de la tarde en la selva.', { itzel: pxI({ ...pal('#d8905a', '#2a1810', '#fff0d0', ['#e8402a', '#ffb02a', '#3a8ad8'], '#4a8a3a', '#e8402a', '#e8302a', '#e8a03a'), px: { levels: 16, outline: '#2a1008' } }), fresita: pxF({ body: '#ffb8a0', belly: '#fff0d8', gill: '#ff6a3a', gillTip: '#ffd06a', px: { levels: 16, outline: '#4a1020' } }) }),
    D('Filo de sol', 'Con un filo de luz amarilla en la espalda.', { itzel: PX(filo({ glint: '#ffffff' }, { lw: 0 }, '#fff4a0').itzel, { w: 30, h: 32, oy: 27, levels: 16, outline: '#1a1008' }), fresita: PX(filo({}, { lw: 0, noHalo: true }, '#fff4a0').fresita, { w: 30, h: 22, oy: 11, levels: 16, outline: '#4a1030' }) }),
    D('Polen mágico', 'Destellos de polen dorado alrededor.', { itzel: pixBrillo(pxI({ glint: '#ffffff', px: { levels: 16, outline: '#1a1008' } }), '#fff4a0'), fresita: pixBrillo(pxF({ lw: 0, px: { levels: 16, outline: '#4a1030' } }), '#ffffff') }),
  ]);

  // ================= LUZ, VECTOR Y PINTURA =================
  V('ocaso', [
    D('Contraluz dorado', 'Siluetas con un filo de sol dorado en la orilla.', contraluz('#12081a', '#ffb070')),
    D('Colores del atardecer', 'Con sus colores, pero teñidos de naranja y morado.', colores(pal('#c07050', '#2a1020', '#f0c0a0', ['#ff5a4a', '#ffb070'], '#6a3a4a', '#ff5a4a', '#ff5a4a', '#e0904a', { eye: '#2a1020' }), pf('#ff9ab0', '#ffd0c0', '#ff5a4a', '#ffd9a0', { lw: 0, glowA: .3, glow: '#ff9a70' }))),
    D('Silueta morada', 'Siluetas en morado en vez de negro, con moños dorados.', silueta('#3a1840', '#ffd27a', '#ffd9a0')),
    D('Frente al sol', 'Cada una con un sol enorme detrás, como sombra chinesca.', { itzel: (c, p, f) => { c.fillStyle = 'rgba(255,170,110,.55)'; c.beginPath(); c.arc(p.x, p.y - 12, 13, 0, TAU); c.fill(); I({ mono: '#12081a', keep: ['bow'], bow: '#ff7a59', noFace: true, eyeGlow: '#ffd9a0' })(c, p, f); }, fresita: (c, fr, f) => { c.fillStyle = 'rgba(255,170,110,.45)'; c.beginPath(); c.arc(fr.x, fr.y, 10, 0, TAU); c.fill(); F({ mono: '#12081a', keep: ['gill'], gill: '#ff6fa0', eyeGlow: '#ffd9a0', lw: 0, noHalo: true })(c, fr, f); } }),
    D('Línea de luz', 'Silueta oscura con contorno de luz naranja.', linea('#ffb070', .55, '#ff7a59', '#12081a')),
  ]);
  const AQ = { lw: .7, line: '#3a2e2a', alpha: .94, skin: '#d39a74', hair: '#4a3028', blouse: '#fbf6ee', emb: ['#d9655b', '#e8b84a', '#6f8fcf', '#7fae5a'], shorts: '#7fae5a', shoes: '#d9655b', bow: '#d9655b', pack: '#e8b84a' };
  V('acuarela', [
    D('Lavado azul', 'Acuarela fría: azules y verdes de cenote.', colores({ ...AQ, ...pal('#d8a88a', '#2a3a5a', '#f2f8ff', ['#4a8acf', '#6fb8a8'], '#4a8a9a', '#4a6acf', '#d9655b', '#8ab8cf') }, { lw: .7, line: '#2a3a5a', body: '#c8b0e8', belly: '#eef0ff', gill: '#6f8fcf', gillTip: '#a8d0f0', glowA: .15 })),
    D('Mancha suelta', 'Sin línea: solo manchas de color que se salen un poco.', { itzel: (c, p, f) => { c.save(); c.globalAlpha = .85; c.filter = `blur(${.5 * f.S}px)`; drawItzel(c, p, f, { ...AQ, lw: 0 }); c.restore(); }, fresita: (c, fr, f) => { c.save(); c.globalAlpha = .85; c.filter = `blur(${.5 * f.S}px)`; drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { lw: 0, body: '#f4b6c8', belly: '#fde6ee', gill: '#e07a9a', gillTip: '#f29ab4', noHalo: true }); c.restore(); } }),
    D('Tinta sepia', 'Dibujo de pluma sepia con una aguada clara.', { itzel: (c, p, f) => { c.save(); c.globalAlpha = .35; drawItzel(c, p, f, { _mode: 'fill', mono: '#e8c8a0', noFace: true }); c.restore(); sketchLine({ lw: .55, line: '#5a3a2a' })(c, p, f); }, fresita: (c, fr, f) => { c.save(); c.globalAlpha = .35; drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { _mode: 'fill', mono: '#f0b8c0', noHalo: true }); c.restore(); sketchLineF({ lw: .55, line: '#5a3a2a' })(c, fr, f); } }),
    D('Pastel', 'Colores muy diluidos, casi blancos.', colores({ ...AQ, ...pal('#f0c8b0', '#8a6a5a', '#ffffff', ['#f0a0a0', '#f0d890', '#a0c0f0'], '#b8d8a8', '#f0a0a0', '#f0a0a0', '#f0d890'), line: '#8a6a5a', alpha: .9 }, { lw: .6, line: '#9a7a7a', body: '#fcd0dc', belly: '#fff4f8', gill: '#f0a0b8', gillTip: '#fcd0dc', glowA: .15 })),
    D('Tinta y un color', 'Solo tinta negra y el rojo de los moños y las branquias.', colores({ ...AQ, mono: '#fbf6ee', keep: ['bow', 'shoes', 'eye'], bow: '#d9655b', shoes: '#d9655b', eye: '#3a2e2a', line: '#2a2422' }, { lw: .7, line: '#2a2422', mono: '#fbf6ee', keep: ['gill', 'gillTip', 'eye'], gill: '#d9655b', gillTip: '#d9655b', eye: '#2a2422', glowA: .1 })),
  ]);
  const PA = { lw: 1.3, line: '#fffaf0', skin: '#c98a5e', hair: '#3b2a20', blouse: '#f8eedb', emb: ['#e83f6f', '#ffbf00', '#2274a5', '#32936f'], shorts: '#32936f', shoes: '#e83f6f', bow: '#e83f6f', pack: '#f6a93b' };
  const sombraPapel = fn => withShadow(fn, 'rgba(70,40,20,.4)', 2.5, 1.5);
  V('paper', [
    D('Fieltro', 'Recortadas en fieltro: sin borde blanco, colores suaves y sombra.', envuelve(colores({ ...PA, lw: 0, blouse: rayado ? '#f0e4d0' : '#f0e4d0' }, { lw: 0, body: '#ff9fbf', belly: '#ffd6e4', gill: '#e83f6f', gillTip: '#ffbf00', glow: null }), sombraPapel)),
    D('Papel kraft', 'Papel café de envolver con detalles en blanco y rojo.', envuelve(colores({ ...PA, ...pal('#c08a5a', '#3b2a20', '#c8a070', ['#ffffff', '#e83f6f'], '#8a6a4a', '#e83f6f', '#e83f6f', '#a87a50') }, { lw: 1.2, line: '#fffaf0', body: '#d8a880', belly: '#e8c8a0', gill: '#e83f6f', gillTip: '#ffffff', glow: null }), sombraPapel)),
    D('Cartulina negra', 'Silueta de cartulina negra con borde blanco de recorte.', envuelve(colores({ lw: 1.3, line: '#fffaf0', mono: '#1a1418', keep: ['bow'], bow: '#e83f6f', noFace: true, eyeGlow: '#fffaf0' }, { lw: 1.2, line: '#fffaf0', mono: '#1a1418', keep: ['gill'], gill: '#e83f6f', eyeGlow: '#fffaf0', glow: null }), sombraPapel)),
    D('Papel doblado', 'Cabezas facetadas como papel doblado.', envuelve(colores({ ...PA, poly: 6 }, { lw: 1.2, line: '#fffaf0', poly: true, body: '#ff9fbf', body2: '#e8809f', belly: '#ffd6e4', gill: '#e83f6f', gillTip: '#ffbf00', glow: null }), sombraPapel)),
    D('Periódico', 'Recortadas de periódico: tramado gris con borde blanco.', envuelve(tramado('#5a5a5a', '#2a2a2a'), sombraPapel)),
  ]);
  const FL = { skin: '#c98a6a', hair: '#2a2347', blouse: '#f4efe6', blouse2: '#d9cdc6', emb: ['#ff6b5b', '#f4a786', '#6c4a76'], shorts: '#4a8a7a', shoes: '#ff6b5b', bow: '#ff6b5b', pack: '#f4a786', eye: '#2a2347' };
  const FLf = { lw: 0, body: '#ffa5bd', body2: '#e98aa6', belly: '#ffd6e0', gill: '#ff6b5b', gillTip: '#ffb38a', glowA: .25 };
  V('flat', [
    D('Noche', 'La misma geometría con colores de noche.', colores({ ...FL, ...pal('#8a6a7a', '#1a1830', '#a8b0d0', ['#ff8a7a', '#ffd0a0'], '#2a4a5a', '#ff8a7a', '#ff8a7a', '#6a6a9a') }, { ...FLf, body: '#c890b0', body2: '#a07090', belly: '#e0c0d8' })),
    D('Pastel', 'Colores pastel, muy suaves.', colores({ ...FL, ...pal('#f0c0a8', '#6a5a8a', '#ffffff', ['#ffb0a8', '#ffe0a0', '#b0d0ff'], '#a8e0c8', '#ffb0a8', '#ffb0a8', '#ffe0a0') }, { ...FLf, body: '#ffd0e0', body2: '#ffb8d0', belly: '#fff0f6' })),
    D('Con contorno', 'Plano pero con una línea fina oscura.', colores({ ...FL, lw: .5, line: '#2a2347' }, { ...FLf, lw: .5, line: '#2a2347' })),
    D('Un tono y acento', 'Todo en el morado del fondo menos los moños y las branquias.', colores({ mono: '#4e3466', keep: ['bow', 'shoes', 'flowers'], bow: '#ff6b5b', shoes: '#ff6b5b', flowerCols: ['#ffb38a'], noFace: true, eyeGlow: '#ffe0d0' }, { mono: '#4e3466', keep: ['gill', 'gillTip'], gill: '#ff6b5b', gillTip: '#ffb38a', eyeGlow: '#ffe0d0', lw: 0, glowA: .2 })),
    D('Sombra dura', 'Mitad en sombra plana, como luz de atardecer.', sombra(FL, FLf, '#2a2347', .35)),
  ]);
  const SU = { S: '#1d1b19', R: '#c23b2e', P: '#f0e7d2' };
  V('sumie', [
    D('Solo pincel', 'Un trazo de tinta, sin relleno.', linea(SU.S, .9)),
    D('Mancha de tinta', 'Silueta de tinta con el moño bermellón.', silueta(SU.S, SU.R, SU.P)),
    D('Aguada', 'Tinta diluida en grises y línea de pincel.', colores({ lw: .8, line: SU.S, skin: '#e0d8c8', hair: '#3a3836', blouse: '#f0e7d2', emb: ['#8a8680'], shorts: '#9a968e', shoes: '#4a4844', bow: SU.R, pack: '#b0aca4', eye: SU.S, cheek: null, flowerCols: ['#6a6660'] }, { lw: .7, line: SU.S, body: '#d8d0c4', belly: '#f0e7d2', gill: SU.R, gillTip: '#8a8680', eye: SU.S, glow: null, cheek: null })),
    D('Sello rojo', 'Todo dibujado en bermellón, como un sello de tinta.', linea(SU.R, .8)),
    D('Negativo', 'Relleno de tinta y línea color papel.', linea(SU.P, .6, null, '#2a2826')),
  ]);
  V('neon', [
    D('Cian', 'Tubos cian sobre silueta oscura.', linea('#00e8ff', .8, '#00e8ff', '#1a0838')),
    D('Ácido', 'Verde ácido y rosa: la combinación más fosforescente.', { itzel: (c, p, f) => { drawItzel(c, p, f, { mono: '#14062a', keep: ['bow', 'shoes'], bow: '#ff2bd6', shoes: '#ff2bd6', noFace: true, eyeGlow: '#3dff8a' }); c.save(); c.shadowColor = '#3dff8a'; c.shadowBlur = 5 * f.S; drawItzel(c, p, f, { _mode: 'line', lw: .7, line: '#3dff8a' }); c.restore(); }, fresita: linea('#ff2bd6', .7, '#ff2bd6', '#14062a').fresita }),
    D('Relleno de color', 'Con sus colores de verdad y contorno de neón.', colores({ lw: .7, line: '#ff2bd6', glow: '#ff2bd6', glowB: 5, skin: '#b07a6a', hair: '#1a0838', blouse: '#e8e0ff', emb: ['#ff2bd6', '#00e8ff'], shorts: '#2a6a8a', shoes: '#00e8ff', bow: '#00e8ff', pack: '#6a3a8a' }, { lw: .7, line: '#00e8ff', shadowGlow: '#00e8ff', body: '#ff9ad8', belly: '#ffe0f4', gill: '#00e8ff', gillTip: '#ffe74c', glow: '#ff2bd6', glowA: .25 })),
    D('Tubo doble', 'Dos tubos de colores distintos, un poco separados.', { itzel: (c, p, f) => { drawItzel(c, p, f, { _mode: 'fill', mono: '#1a0838', noFace: true }); c.save(); c.shadowColor = '#00e8ff'; c.shadowBlur = 4 * f.S; c.translate(-.5, -.3); drawItzel(c, p, f, { _mode: 'line', lw: .45, line: '#00e8ff' }); c.translate(1, .6); c.shadowColor = '#ff2bd6'; drawItzel(c, p, f, { _mode: 'line', lw: .45, line: '#ff2bd6' }); c.restore(); }, fresita: (c, fr, f) => { drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { _mode: 'fill', mono: '#14062a', noHalo: true }); c.save(); c.shadowColor = '#ff2bd6'; c.shadowBlur = 4 * f.S; c.translate(-.5, -.3); drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { _mode: 'line', lw: .45, line: '#ff2bd6', noHalo: true }); c.translate(1, .6); drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { _mode: 'line', lw: .45, line: '#ffe74c', noHalo: true }); c.restore(); } }),
    D('Holograma', 'Transparentes y cian, con líneas de barrido.', (() => { const r = cristal('#00e8ff', '#7ff8ff', .35); return { itzel: (c, p, f) => { r.itzel(c, p, f); c.fillStyle = 'rgba(0,232,255,.25)'; for (let y = p.y - 22; y < p.y; y += 1.4) c.fillRect(p.x - 8, y + (f.t * 6) % 1.4, 16, .4); }, fresita: r.fresita }; })()),
  ]);
  V('bruma', [
    D('Un solo ojo', 'Silueta con un solo ojo encendido, más misteriosa.', colores({ mono: '#0b0b0a', noFace: true, eyeGlow: '#ffffff' }, { mono: '#0b0b0a', lw: 0, eyeGlow: '#ffffff', glow: '#ffffff', glowA: .1 })),
    D('Gris de niebla', 'Siluetas grises, como si estuvieran más lejos en la niebla.', colores({ mono: '#4a4a48', noFace: true, eyeGlow: '#e8e8e0', twoEyes: true, alpha: .92 }, { mono: '#4a4a48', lw: 0, eyeGlow: '#e8e8e0', glow: null })),
    D('Contorno blanco', 'Silueta con una línea blanca muy fina.', linea('#d8d8d0', .4, null, '#0b0b0a')),
    D('Farol', 'Itzel carga un farol que ilumina la niebla a su alrededor.', { itzel: (c, p, f) => { const g = drawItzel(c, p, f, { mono: '#0b0b0a', noFace: true, eyeGlow: '#ffffff', twoEyes: true }); const x = p.x + (g.arm[2] + .5) * p.face, y = p.y + g.arm[3] + 3; glow(c, x, y, 24, '#ffffff', .3); c.fillStyle = '#ffffff'; c.fillRect(x - 1, y - 1.5, 2, 3); }, fresita: F({ mono: '#0b0b0a', lw: 0, eyeGlow: '#ffffff', glow: '#ffffff', glowA: .12 }) }),
    D('Moño rojo', 'Todo blanco y negro menos los moños y las branquias, en rojo.', silueta('#0b0b0a', '#c8202a', '#ffffff')),
  ]);
  const LP = { poly: 6, skin: '#c88a64', hair: '#2d2a4a', blouse: '#f2ede4', blouse2: '#cfc7d8', emb: ['#f39bb0', '#ffd166', '#7fd8f0'], shorts: '#3f8a6a', shoes: '#f08a5d', bow: '#f08a5d', pack: '#ffd166', eye: '#2d2a4a' };
  const LPf = { poly: true, lw: 0, body: '#f39bb0', body2: '#c96a8a', belly: '#ffd0dc', gill: '#ffd166', gillTip: '#fff0b0', glowA: .25 };
  V('lowpoly', [
    D('Cuatro caras', 'Cabeza de cuatro lados, todavía más geométrica.', colores({ ...LP, poly: 4 }, LPf)),
    D('Cristal', 'Facetas de cristal transparente con contorno de luz.', cristal('#7fd8f0', '#e0f8ff', .4)),
    D('Pastel', 'Facetas pastel, como un juego de móvil.', colores({ ...LP, ...pal('#f0c0a0', '#6a5a9a', '#ffffff', ['#ffb0c8', '#ffe8a0', '#b0e8ff'], '#a0e0c0', '#ffb0a0', '#ffb0a0', '#ffe8a0', { poly: 6, blouse2: '#e8e0f0' }) }, { ...LPf, body: '#ffc8d8', body2: '#f0a8c0' })),
    D('Nocturno', 'Facetas en azules de noche.', colores({ ...LP, ...pal('#9a7a8a', '#1a1830', '#c8d0f0', ['#7fd8f0', '#ffd166'], '#2a4a6a', '#7fd8f0', '#f08a5d', '#4a4a8a', { poly: 6, blouse2: '#9aa0d0' }) }, { ...LPf, body: '#b8a0e0', body2: '#8070b0' })),
    D('Sombra dura', 'Mitad en sombra, como un modelo 3D con una sola luz.', sombra(LP, LPf, '#2d2a4a', .35)),
  ]);
  const CK = '#1c1612', CR = '#b0412e', CO = '#d79a3d', CM = '#4a9eb0', CJ = '#4d8a5c', CC = '#f1e2bd';
  const CX = { lw: 1.2, line: CK, skin: '#b8774a', hair: CK, blouse: CC, emb: [CR, CJ, CM, CO], shorts: CJ, shoes: CR, bow: CR, pack: CO, eye: CK, cheek: null, flowerCols: [CR, CO, CM] };
  const CXf = { lw: 1.1, line: CK, body: '#f2a0b8', belly: CC, gill: CR, gillTip: CO, eye: CK, glow: null, gillLine: true, mouth: CK };
  V('codex', [
    D('Mural de Bonampak', 'Los colores de los murales: rojo, ocre y azul maya fuertes.', colores({ ...CX, blouse: '#e8c890', shorts: CM, pack: CR }, { ...CXf, body: '#e88a8a', belly: '#f0d0a0' })),
    D('Azul maya', 'Todo dominado por el azul maya y el jade.', colores({ ...CX, blouse: '#d8ecf0', emb: [CM, CJ], shorts: CM, shoes: CJ, bow: CM, pack: CJ }, { ...CXf, body: '#90c8d8', belly: '#d8ecf0', gill: CM, gillTip: CJ })),
    D('Glifo', 'Solo la línea negra del códice, como un glifo sin pintar.', linea(CK, 1, null, CC)),
    D('Jade', 'Itzel y Fresita talladas en jade.', colores({ lw: 1, line: '#1a3a2a', mono: '#4d8a5c', keep: ['eye'], eye: '#1a3a2a' }, { lw: 1, line: '#1a3a2a', mono: '#5aa070', keep: ['eye'], eye: '#1a3a2a', glow: null })),
    D('Dorado', 'Con oro y rojo, como en las piezas de orfebrería.', colores({ ...CX, blouse: '#f0d890', emb: [CR, '#c8902a'], shorts: '#c8902a', pack: '#c8902a', line: '#3a2410' }, { ...CXf, body: '#f0c070', belly: '#f8e0a0', gill: CR, gillTip: '#c8902a', line: '#3a2410' })),
  ]);
  const OL = { lw: 1.1, line: '#14203f', skin: '#c98a5a', hair: '#2a1a14', blouse: '#f2e6c0', blouse2: '#d8c898', emb: ['#d9542b', '#e8c547', '#6c9ad8'], shorts: '#4f6f4a', shoes: '#d9542b', bow: '#d9542b', pack: '#e8c547' };
  V('oleo', [
    D('Noche estrellada', 'Azules y amarillos de Van Gogh.', colores({ ...OL, ...pal('#c8a070', '#1a2a5a', '#e8e0a0', ['#f8e27a', '#6c9ad8'], '#2c3a7e', '#f8e27a', '#f8e27a', '#6c9ad8'), line: '#14203f' }, { lw: 1, line: '#14203f', body: '#9ab0e8', belly: '#f8f0b0', gill: '#f8e27a', gillTip: '#ffffff', glowA: .2 })),
    D('Empaste', 'Rellenos con pinceladas gruesas que se notan.', { itzel: (c, p, f) => drawItzel(c, p, f, { ...OL, blouse: rayado(f, '#e8d8a0', 1, -.5, .8), shorts: rayado(f, '#4f6f4a', 1, .6, .9), hair: rayado(f, '#2a1a14', .9, -1, .9) }), fresita: (c, fr, f) => drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { lw: 1, line: '#14203f', body: rayado(f, '#f0a0b8', 1, -.6, .9), belly: '#fcd8e4', gill: '#d9542b', gillTip: '#e8c547' }) }),
    D('Monet', 'Sin contorno, colores pastel como Monet.', colores({ ...OL, lw: 0, ...pal('#e8b8a0', '#6a5a7a', '#f8f4ff', ['#c8a0e0', '#a0d0b0'], '#a0c8a8', '#e8a0b8', '#e8a0b8', '#f0d8a0') }, { lw: 0, body: '#f8c8d8', belly: '#fff0f4', gill: '#c8a0e0', gillTip: '#f0d8a0', glowA: .2 })),
    D('Fauvista', 'Colores salvajes como Matisse: verde en la piel, azul en el pelo.', colores({ ...OL, ...pal('#e0905a', '#2a4ad0', '#ffe04a', ['#ff3a3a', '#3ad04a'], '#ff6a2a', '#3ad04a', '#ff3a3a', '#7a3ad0'), line: '#1a1a3a' }, { lw: 1, line: '#1a1a3a', body: '#ff6ab0', belly: '#ffe04a', gill: '#3ad04a', gillTip: '#2a4ad0', glowA: .2 })),
    D('Claroscuro', 'Luz fuerte de un lado y sombra profunda del otro, como Rembrandt.', sombra(OL, { lw: 1, line: '#14203f', body: '#f0a0b8', body2: '#d07a98', belly: '#fcd8e4', gill: '#d9542b', gillTip: '#e8c547' }, '#14100a', .5)),
  ]);
  const VI = { lw: 1.3, line: '#141414', skin: '#d9a06a', hair: '#2c2a60', blouse: '#f3ead0', emb: ['#c0392b', '#2f5ea8', '#f1c40f', '#2f8a46'], shorts: '#2f8a46', shoes: '#c0392b', bow: '#c0392b', pack: '#f1c40f', eye: '#141414' };
  const VIf = { lw: 1.2, line: '#141414', body: '#ff8fb8', body2: '#e0608f', belly: '#ffd0e0', gill: '#f1c40f', gillTip: '#c0392b', glow: '#ffb0d0', glowA: .3, gillLine: true };
  V('vitral', [
    D('Azules de catedral', 'Vidrios azules y violetas, como un vitral gótico.', colores({ ...VI, ...pal('#c8a0b0', '#1a1a5a', '#a8c0f0', ['#4a3ab8', '#8a4ab8', '#f1c40f'], '#2f5ea8', '#8a4ab8', '#c0392b', '#4a3ab8') }, { ...VIf, body: '#a890e8', body2: '#7a60c8', belly: '#d8d0ff' })),
    D('Ámbar', 'Vidrios ámbar y miel, cálidos.', colores({ ...VI, ...pal('#e0a060', '#5a2a10', '#f8e0a0', ['#e08a2a', '#c0392b'], '#c8802a', '#c0392b', '#c0392b', '#e8b040') }, { ...VIf, body: '#f0b060', body2: '#d08a30', belly: '#f8e0a0' })),
    D('Translúcido', 'Vidrio con la luz pasando: se ve el fondo detrás.', { itzel: alfa(.72)(I(VI)), fresita: alfa(.72)(F(VIf)) }),
    D('Plomo dorado', 'Las uniones en oro en lugar de plomo negro.', colores({ ...VI, line: '#c8a040' }, { ...VIf, line: '#c8a040' })),
    D('Rosetón', 'Con un rosetón de vidrio detrás de cada una.', { itzel: (c, p, f) => { const cx = p.x, cy = p.y - 14; for (let i = 0; i < 8; i++) { c.fillStyle = ['#c0392b', '#2f5ea8', '#f1c40f', '#2f8a46'][i % 4]; c.globalAlpha = .55; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, 11, i / 8 * TAU, (i + 1) / 8 * TAU); c.closePath(); c.fill(); } c.globalAlpha = 1; c.strokeStyle = '#141414'; c.lineWidth = .7; c.beginPath(); c.arc(cx, cy, 11, 0, TAU); c.stroke(); I(VI)(c, p, f); }, fresita: F(VIf) }),
  ]);
  const GK = '#1f1a1c', GP = '#efe5cf', GR = '#b3342b';
  V('grabado', [
    D('Negativo', 'Papel claro y cortes negros: al revés del grabado de siempre.', colores({ lw: .7, line: GK, mono: GP, keep: ['bow', 'shoes', 'eye'], bow: GR, shoes: GR, eye: GK }, { lw: .7, line: GK, mono: GP, keep: ['gill', 'gillTip', 'eye'], gill: GR, gillTip: GR, eye: GK, glow: null })),
    D('Tinta azul', 'Impreso con tinta azul marino en lugar de negra.', colores({ lw: .7, line: GP, mono: '#1a2a5a', keep: ['bow', 'shoes'], bow: GR, shoes: GR, noFace: true, eyeGlow: GP }, { lw: .7, line: GP, mono: '#1a2a5a', keep: ['gill', 'gillTip'], gill: GR, gillTip: GR, eyeGlow: GP, glow: null })),
    D('Más rojo', 'Segunda plancha roja: huipil y Fresita en rojo.', colores({ lw: .7, line: GP, mono: GK, keep: ['bow', 'shoes', 'blouse'], blouse: GR, bow: GP, shoes: GR, noFace: true, eyeGlow: GP }, { lw: .7, line: GP, mono: GR, keep: ['gill', 'gillTip'], gill: GK, gillTip: GK, eyeGlow: GP, glow: null })),
    D('Tramado', 'Sombras hechas con rayitas de gubia.', tramado(GK, GK)),
    D('Dos planchas', 'Rojo y negro mal registrados, como impresión a mano.', dosTintas(GR, GK)),
  ]);
  const AN = { lw: .8, line: '#2a1e2e', skin: '#d39a74', hair: '#2a1a2e', blouse: '#ffffff', blouse2: '#dfe6f6', emb: ['#e83a4a', '#ffb000', '#3a9ad8'], shorts: '#3f9a5a', shoes: '#e83a4a', bow: '#e83a4a', pack: '#ffb000', eye: '#3a2a6a', bigEyes: true, cheek: 'rgba(255,120,140,.6)' };
  const ANf = { lw: .8, line: '#7a2a4a', body: '#ffb8d4', belly: '#fff0f6', gill: '#ff6fa0', gillTip: '#ffd0e4', bigEyes: true, eye: '#5a1a3a', glowA: .25 };
  V('anime', [
    D('Shoujo pastel', 'Colores pastel y mucho rubor, estilo de manga para niñas.', colores({ ...AN, ...pal('#f0c0a0', '#6a3a5a', '#ffffff', ['#ff9ac0', '#ffd0e8'], '#ffb0d0', '#ff9ac0', '#ff6aa0', '#ffd0e8', { bigEyes: true, eye: '#8a3a8a', cheek: 'rgba(255,120,160,.7)', blouse2: '#ffe8f4' }) }, { ...ANf, body: '#ffd0e8', gill: '#ff9ac0' })),
    D('Noche de verano', 'Colores de noche con brillo de luna.', colores({ ...AN, ...pal('#b88a7a', '#1a1a3a', '#d8e0ff', ['#ffd04a', '#ff6a8a'], '#2a5a7a', '#ff6a8a', '#ff4a6a', '#5a5a9a', { bigEyes: true, eye: '#2a2a6a', blouse2: '#b0b8e8' }) }, { ...ANf, body: '#d0a8e8', belly: '#f0e0ff' })),
    D('Cel con sombra', 'Sombra plana de anime en la mitad de atrás.', sombra(AN, ANf, '#3a2a6a', .3)),
    D('Contorno grueso', 'Línea gruesa como de anime de los 90.', colores({ ...AN, lw: 1.3 }, { ...ANf, lw: 1.2 })),
    D('Brillo mágico', 'Destellos de chica mágica alrededor.', conBrillos(halo(AN, ANf, '#ffd0e8', 18), ['#ffffff', '#ffe08a', '#ffb0d0'])),
  ]);
  const NB = '#4a3426', NG = '#c9a24a', NR = '#d89a8a', NS = '#9fb08a';
  const NO = { lw: .9, line: NB, skin: '#c99a76', hair: '#7a4a2a', blouse: '#f1e6c8', emb: [NR, NG, NS], shorts: '#7f9a6a', shoes: NR, bow: NR, pack: NG, eye: NB, flowerCols: [NG, NR, '#f6e6d0'] };
  const NOf = { lw: .8, line: NB, body: '#e8b0a8', belly: '#f6e6d0', gill: NG, gillTip: NR, eye: NB, glow: '#f0c8a0', glowA: .25, gillLine: true };
  const aureola = (r) => (c, a) => { c.strokeStyle = NG; c.lineWidth = .6; c.beginPath(); c.arc(a.x, a.y - 15, r, 0, TAU); c.stroke(); c.beginPath(); c.arc(a.x, a.y - 15, r - 1.4, 0, TAU); c.lineWidth = .3; c.stroke(); for (let i = 0; i < 12; i++) { const an = i / 12 * TAU; c.beginPath(); c.arc(a.x + Math.cos(an) * (r - .7), a.y - 15 + Math.sin(an) * (r - .7), .4, 0, TAU); c.fillStyle = NG; c.fill(); } };
  V('nouveau', [
    D('Aureola de Mucha', 'Un gran círculo dorado decorado detrás de la cabeza, como los carteles de Mucha.', { itzel: (c, p, f) => { aureola(11)(c, p); I(NO)(c, p, f); }, fresita: F(NOf) }),
    D('Verde salvia', 'Paleta de verdes y dorados.', colores({ ...NO, blouse: '#e8ecd0', emb: [NS, NG], shorts: '#6a8a5a', shoes: NS, bow: NG }, { ...NOf, body: '#c8d8b0', belly: '#f0f2e0', gill: NG, gillTip: NS })),
    D('Línea de vitral', 'Contornos gruesos y curvos, como vidrio emplomado nouveau.', colores({ ...NO, lw: 1.4 }, { ...NOf, lw: 1.3 })),
    D('Oro y marfil', 'Solo oro, marfil y café.', colores({ ...NO, skin: '#e8d0b0', hair: NB, blouse: '#faf2dc', emb: [NG], shorts: NG, shoes: NB, bow: NG, pack: NG, flowerCols: [NG] }, { ...NOf, body: '#f0dcb8', belly: '#faf2dc', gill: NG, gillTip: '#f6e6a0' })),
    D('Rosa empolvado', 'Rosas y durazno suaves.', colores({ ...NO, blouse: '#f8e0d8', emb: [NR, '#e8b8a0'], shorts: '#c89a8a', shoes: NR, bow: '#c86a6a' }, { ...NOf, body: '#f0b8b8', belly: '#fae8e0' })),
  ]);
  const NP = '#ff2a6d', NC = '#05d9e8';
  V('cyber', [
    D('Holograma', 'Las dos son hologramas transparentes con líneas de barrido.', (() => { const r = cristal(NC, '#a0f8ff', .35); return { itzel: (c, p, f) => { r.itzel(c, p, f); c.fillStyle = 'rgba(5,217,232,.25)'; for (let y = p.y - 22; y < p.y; y += 1.4) c.fillRect(p.x - 8, y + (f.t * 6) % 1.4, 16, .4); }, fresita: r.fresita }; })()),
    D('Rojo neón', 'Chamarra oscura con bordado y moños en rojo neón.', colores({ lw: .6, line: '#4a4f70', skin: '#a86a48', hair: '#141522', blouse: '#1c1e2e', blouse2: '#2a2d44', emb: [NP], shorts: '#2a2d44', shoes: NP, bow: NP, pack: '#2a2d44', eye: NP, glint: '#ffffff', glow: NP, glowB: 3 }, { lw: .6, line: NP, alpha: .85, body: '#ff9ab8', belly: '#ffe0ea', gill: NP, gillTip: '#ffd0e0', glow: NP, glowA: .3, shadowGlow: NP })),
    D('Impermeable', 'Impermeable amarillo para la lluvia.', colores({ lw: .6, line: '#2a2a20', skin: '#a86a48', hair: '#141522', blouse: '#ffd23a', blouse2: '#e0b020', emb: ['#2a2a20'], shorts: '#2a2d44', shoes: NP, bow: NC, pack: '#2a2d44', eye: '#141522', glint: '#ffffff' }, { lw: .6, line: '#2a2a20', body: '#ffd23a', belly: '#fff0a0', gill: NC, gillTip: '#ffffff', glow: null })),
    D('Silueta con visor', 'Silueta oscura con un visor de luz en los ojos.', { itzel: (c, p, f) => { const g = drawItzel(c, p, f, { mono: '#141522', keep: ['bow'], bow: NP, noFace: true }); const [x, y] = [p.x + 2.6 * p.face, p.y - 14.6 + g.bob]; c.save(); c.shadowColor = NC; c.shadowBlur = 5 * f.S; c.fillStyle = NC; c.fillRect(Math.min(x, x + 3.4 * p.face), y, 3.4, 1); c.restore(); }, fresita: F({ mono: '#141522', keep: ['gill'], gill: NP, eyeGlow: NC, lw: 0, glow: NC, glowA: .15 }) }),
    D('Falla de video', 'Colores corridos en rojo y cian.', { itzel: (c, p, f) => { c.save(); c.globalAlpha = .5; c.translate(-.7, 0); drawItzel(c, p, f, { _mode: 'fill', mono: NP }); c.translate(1.4, 0); drawItzel(c, p, f, { _mode: 'fill', mono: NC }); c.restore(); STYLE_MAP.cyber.player(c, p, f); }, fresita: (c, fr, f) => { c.save(); c.globalAlpha = .5; c.translate(-.7, 0); drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { _mode: 'fill', mono: NP, noHalo: true }); c.restore(); STYLE_MAP.cyber.fresita(c, fr, f); } }),
  ]);

  // ================= MUNDOS NUEVOS =================
  const BA = { lw: .55, line: '#5a2a1a', skin: '#c98a5e', hair: '#3a2420', blouse: '#fbf1e2', blouse2: '#efdcc4', emb: ['#e85a4f', '#f2b233', '#4f8fd6', '#5fae6a'], shorts: '#5fae6a', shoes: '#e85a4f', bow: '#e85a4f', pack: '#f2b233' };
  const BAf = { lw: .5, line: '#a8396a', glowA: .1 };
  V('barro', [
    D('Plastilina pastel', 'Colores pastel de plastilina para niños.', envuelve(colores({ ...BA, ...pal('#f0b898', '#7a5a8a', '#ffffff', ['#ffa0b0', '#a0d0ff', '#ffe08a'], '#a0e0b0', '#ffa0b0', '#ff8aa0', '#ffe08a') }, { ...BAf, body: '#ffc8e0', belly: '#fff0f6' }), stopMotion)),
    D('Barro de alfarería', 'Moldeadas en barro rojo, como cántaros, con detalles pintados en blanco.', envuelve(colores({ lw: .5, line: '#5a2a14', mono: '#b8613a', keep: ['emb', 'eye', 'bow'], emb: ['#f8ecd8'], bow: '#f8ecd8', eye: '#3a1a0a' }, { lw: .5, line: '#5a2a14', mono: '#c8714a', keep: ['gill', 'eye'], gill: '#f8ecd8', eye: '#3a1a0a', glow: null }), stopMotion)),
    D('Sin contorno', 'Solo plastilina y sombra, sin línea.', envuelve(colores({ ...BA, lw: 0 }, { ...BAf, lw: 0 }), stopMotion)),
    D('Colores fuertes', 'Plastilina de colores primarios muy brillantes.', envuelve(colores({ ...BA, ...pal('#d08a5a', '#1a1a3a', '#ffffff', ['#ff2a2a', '#2a6aff', '#ffd02a'], '#2aa84a', '#ff2a2a', '#ff2a2a', '#2a6aff') }, { ...BAf, body: '#ff7ab0', belly: '#ffd0e4', gill: '#ff2a2a', gillTip: '#ffd02a' }), stopMotion)),
    D('Huellas', 'Se notan las huellas de los dedos que las moldearon.', envuelve({ itzel: (c, p, f) => { I(BA)(c, p, f); c.strokeStyle = 'rgba(90,40,20,.25)'; c.lineWidth = .3; for (let k = 1; k < 4; k++) { c.beginPath(); c.ellipse(p.x + p.face, p.y - 7, k * .9, k * .6, .4, .3, TAU - .6); c.stroke(); } }, fresita: (c, fr, f) => { F(BAf)(c, fr, f); c.strokeStyle = 'rgba(90,40,20,.25)'; c.lineWidth = .3; for (let k = 1; k < 4; k++) { c.beginPath(); c.ellipse(fr.x - fr.face * 2, fr.y + Math.sin(f.t * 3) * 1.4, k * .9, k * .6, .4, .3, TAU - .6); c.stroke(); } } }, stopMotion)),
  ]);
  const EC = { lw: .5, line: '#10262f', skin: '#d8a882', hair: '#1d3a40', blouse: '#f3ecdf', blouse2: '#cfe3da', emb: ['#73efd0', '#ffc980', '#cba6ff', '#e0485a'], shorts: '#3f8f6a', shoes: '#e0485a', bow: '#e0485a', pack: '#ffc980', eye: '#10262f', glint: '#c7ffed' };
  const ECf = { lw: .5, line: '#7a3a6a', glow: '#9affee', glowA: .25, gill: '#ff7fb2', gillTip: '#9affee' };
  V('eco', [
    D('Luz de semilla', 'Un brillo dorado de semilla las acompaña.', envuelve(halo(EC, ECf, '#ffdd94', 16), groundShadow)),
    D('Cristal de eco', 'Transparentes y turquesa, como el eco de Itzel.', envuelve(cristal('#73efd0', '#c7ffed', .35), groundShadow)),
    D('Colores de Luma', 'Solo los colores del jardín: crema, verde jade y turquesa.', envuelve(colores({ ...EC, blouse: '#f3ecdf', emb: ['#4e8878', '#73efd0'], shorts: '#4e8878', shoes: '#73efd0', bow: '#73efd0', pack: '#8cc4a2' }, { ...ECf, body: '#c7ffed', belly: '#f3ecdf', gill: '#4e8878', gillTip: '#73efd0' }), groundShadow)),
    D('Silueta del jardín', 'Siluetas verde oscuro con moños de luz.', envuelve(silueta('#173440', '#73efd0', '#ffdd94'), groundShadow)),
    D('Losetas', 'Cabeza y cuerpo de losetas cuadradas.', envuelve(colores({ ...EC, poly: 4 }, { ...ECf, poly: true }), groundShadow)),
  ]);
  const AMK = '#1a0e08';
  const AMI = { lw: 1, line: AMK, skin: '#c87a4a', hair: AMK, blouse: '#fff4e0', emb: ['#e0306a', '#ffd23a', '#2ab8b0', '#3a9a4a'], shorts: '#3a9a4a', shoes: '#e0306a', bow: '#e0306a', pack: '#ffd23a', eye: AMK, cheek: 'rgba(224,48,106,.5)' };
  const AMF = { lw: 1, line: AMK, body: '#ff7aa8', belly: '#ffd23a', gill: '#2ab8b0', gillTip: '#ffd23a', eye: AMK, glow: null, gillLine: true, cheek: null };
  const motas = (rec, col) => ({ itzel: (c, p, f) => { rec.itzel(c, p, f); c.fillStyle = col; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + f.t; c.beginPath(); c.arc(p.x + Math.cos(a) * 11, p.y - 10 + Math.sin(a) * 11, .7, 0, TAU); c.fill(); } }, fresita: rec.fresita });
  V('fuego', [
    D('Noche de fiesta', 'Colores de noche: morado, turquesa y oro.', colores({ ...AMI, blouse: '#8a3ab8', emb: ['#ffd23a', '#2ab8b0'], shorts: '#2a5ad8', shoes: '#ffd23a', bow: '#ffd23a', pack: '#2ab8b0' }, { ...AMF, body: '#8a3ab8', belly: '#2ab8b0', gill: '#ffd23a', gillTip: '#ff7a2a' })),
    D('Silueta pintada', 'Siluetas negras llenas de puntitos de colores, como figura de amate.', { itzel: (c, p, f) => { drawItzel(c, p, f, { mono: AMK, keep: ['bow', 'flowers'], bow: '#e0306a', flowerCols: ['#ffd23a'], noFace: true, eyeGlow: '#fff4e0' }); c.fillStyle = '#ffd23a'; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(p.x - 3 + k * 1.3 * p.face, p.y - 8, .45, 0, TAU); c.fill(); } }, fresita: (c, fr, f) => { drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { mono: AMK, keep: ['gill', 'gillTip'], gill: '#2ab8b0', gillTip: '#ffd23a', eyeGlow: '#fff4e0', noHalo: true }); c.fillStyle = '#ff7aa8'; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(fr.x - 5 * fr.face + k * 1.6 * fr.face, fr.y, .45, 0, TAU); c.fill(); } } }),
    D('Tonos de corteza', 'Solo cafés, blanco y negro, como el amate más antiguo.', colores({ ...AMI, skin: '#d8a070', blouse: '#fff4e0', emb: ['#6a3a1a', AMK], shorts: '#6a3a1a', shoes: AMK, bow: '#fff4e0', pack: '#a87a4a' }, { ...AMF, body: '#e8c8a0', belly: '#fff4e0', gill: '#6a3a1a', gillTip: AMK })),
    D('Fiesta de puntos', 'Con una ronda de puntitos de colores girando alrededor.', motas(colores(AMI, AMF), '#ffd23a')),
  ]);
  const CYN = '#0d2c55';
  V('agua', [
    D('Negativo', 'Azul oscuro con línea blanca: al revés de la copia de sol.', linea('#eef5fb', .55, null, '#123f75')),
    D('Algas', 'Blancas con transparencia azul, como hojas de alga.', { itzel: alfa(.82)(I({ mono: '#eef5fb', keep: ['eye'], eye: CYN, lw: .45, line: '#5f8fc0' })), fresita: alfa(.82)(F({ mono: '#eef5fb', keep: ['eye'], eye: CYN, lw: .45, line: '#5f8fc0', glow: null })) }),
    D('Burbuja', 'Transparentes con contorno blanco brillante.', cristal('#a9c7e3', '#ffffff', .3)),
    D('Solo línea', 'Solo el contorno blanco, sin relleno.', linea('#eef5fb', .6)),
    D('Desvanecidas', 'Como una copia que se expuso poco: blanco azulado y suave.', { itzel: alfa(.65)(I({ mono: '#cfe3f6', keep: ['eye'], eye: CYN })), fresita: alfa(.65)(F({ mono: '#cfe3f6', keep: ['eye'], eye: CYN, glow: null })) }),
  ]);
  const HI = { poly: 5, lw: .35, line: '#8a94b0', skin: '#f0c9a8', hair: '#3a3a5a', blouse: '#ffffff', blouse2: '#e3e8f0', emb: ['#d9443a', '#f2b233', '#4f7fb8'], shorts: '#4f9a7a', shoes: '#d9443a', bow: '#d9443a', pack: '#f2b233', eye: '#3a3a5a' };
  const HIf = { poly: true, lw: .35, line: '#b06080', body: '#ffd1e3', body2: '#f2b0cc', belly: '#fff0f6', gill: '#ff7fb2', gillTip: '#ffffff', glowA: .15 };
  V('hielo', [
    D('Papel de colores', 'Origami de papeles brillantes: rojo, amarillo y azul.', colores({ ...HI, blouse: '#ffe0e0', emb: ['#d9443a', '#2a6ad8'], shorts: '#2a6ad8', pack: '#f2b233' }, { ...HIf, body: '#ff9ac0', body2: '#e070a0' })),
    D('Papel blanco', 'Todo de papel blanco; solo los dobleces dan forma.', colores({ ...HI, mono: '#ffffff', keep: ['eye'], line: '#a0a8c0' }, { ...HIf, mono: '#ffffff', keep: ['eye'], eye: '#3a3a5a', line: '#a0a8c0' })),
    D('Kraft', 'Papel café doblado con detalles rojos.', colores({ ...HI, ...pal('#d8a878', '#5a3a2a', '#e8c8a0', ['#d9443a'], '#a87a50', '#d9443a', '#d9443a', '#c89a6a', { poly: 5 }) }, { ...HIf, body: '#e0b890', body2: '#c09870', belly: '#f0dcc0' })),
    D('Escarcha', 'Brillos de escarcha alrededor de las dos.', conBrillos(colores(HI, HIf), ['#ffffff', '#bcd7ea'])),
    D('Bufanda azul', 'Bufanda y moños azules de invierno.', colores({ ...HI, bow: '#2a6ad8', shoes: '#2a6ad8', emb: ['#2a6ad8', '#bcd7ea'], extra: (c, g) => { const b = g.bob; c.fillStyle = '#2a6ad8'; c.beginPath(); c.moveTo(-3.6, -11.6 + b); c.lineTo(3.8, -11.4 + b); c.lineTo(3.4, -9.8 + b); c.lineTo(-3.4, -10 + b); c.closePath(); c.fill(); c.beginPath(); c.moveTo(-3, -10.4 + b); c.lineTo(-6.4, -7.4 + b); c.lineTo(-4.2, -7 + b); c.lineTo(-1.6, -10 + b); c.closePath(); c.fill(); } }, { ...HIf, gill: '#4f7fb8', gillTip: '#bcd7ea' })),
  ]);
  const GO = '#e2c06e';
  V('cielo', [
    D('Oro sólido', 'Figuras rellenas de oro, como un amuleto.', colores({ mono: GO, keep: ['eye'], eye: '#14224a', lw: .5, line: '#8a6a20' }, { mono: GO, keep: ['eye'], eye: '#14224a', lw: .5, line: '#8a6a20', glow: '#fff3c4', glowA: .2 })),
    D('Puntos de estrellas', 'Dibujadas solo con estrellitas, como una constelación.', { itzel: (c, p, f) => { drawItzel(c, p, f, { _mode: 'fill', mono: '#14224a', noFace: true }); c.save(); c.setLineDash([.3, 1.1]); c.lineCap = 'round'; c.shadowColor = '#fff3c4'; c.shadowBlur = 3 * f.S; drawItzel(c, p, f, { _mode: 'line', lw: .8, line: '#fff3c4' }); c.restore(); }, fresita: (c, fr, f) => { drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { _mode: 'fill', mono: '#14224a', noHalo: true }); c.save(); c.setLineDash([.3, 1.1]); c.lineCap = 'round'; c.shadowColor = '#fff3c4'; c.shadowBlur = 3 * f.S; drawAxolotl(c, fr.x, fr.y, fr.face, f.t, f, { _mode: 'line', lw: .8, line: '#fff3c4', noHalo: true }); c.restore(); } }),
    D('Plata', 'Grabado en plata en lugar de oro.', linea('#d8dce8', .5, null, '#14224a')),
    D('Rosa estelar', 'Línea rosa de nebulosa sobre azul.', linea('#ff9ad8', .5, '#ff6ab8', '#14224a')),
    D('Mapa antiguo', 'Como dibujadas en el pergamino del atlas: sepia y café.', colores({ mono: '#e8d8b0', keep: ['eye', 'bow'], bow: '#b0412e', eye: '#5a3a1a', lw: .5, line: '#5a3a1a' }, { mono: '#e8d8b0', keep: ['eye', 'gill'], gill: '#b0412e', eye: '#5a3a1a', lw: .5, line: '#5a3a1a', glow: null })),
  ]);
  V('hollin', [
    D('Ojos rojos', 'Como las criaturas de Hollín: ojos rojos encendidos.', colores({ mono: '#08080a', noFace: true, eyeGlow: '#ff3030', twoEyes: true }, { mono: '#08080a', eyeGlow: '#ff3030', glow: '#ff3030', glowA: .12, lw: 0 })),
    D('Ceniza gris', 'Siluetas grises cubiertas de ceniza.', colores({ mono: '#3a3836', keep: ['bow'], bow: '#8a2020', noFace: true, eyeGlow: '#d8d2c8' }, { mono: '#3a3836', eyeGlow: '#d8d2c8', glow: null, lw: 0 })),
    D('Luz de bengala', 'Con el filo rojo de una bengala.', contraluz('#08080a', '#ff5040')),
    D('Farol', 'Itzel carga un farol que alumbra la ceniza.', { itzel: (c, p, f) => { const g = drawItzel(c, p, f, { mono: '#08080a', keep: ['bow'], bow: '#c8202a', noFace: true, eyeGlow: '#ffffff' }); const x = p.x + (g.arm[2] + .5) * p.face, y = p.y + g.arm[3] + 3; glow(c, x, y, 26, '#ffd0a0', .35); c.fillStyle = '#ffe0b0'; c.fillRect(x - 1, y - 1.5, 2, 3); }, fresita: STYLE_MAP.hollin.fresita }),
    D('Contorno blanco', 'Silueta con una línea blanca fina para que se lea mejor.', linea('#d8d2c8', .4, null, '#08080a')),
  ]);

  // ================= VAPOR Y ENGRANAJES (la fábrica de vapor) =================
  // goggles de latón en la frente (como el diseño de ahora), con el color de lente que se quiera
  const goggles = (lente = '#9ad8e8', laton = '#c8902a') => (ctx, g) => { const hy = -15 + g.bob; ctx.strokeStyle = '#3a2414'; ctx.lineWidth = .9; ctx.beginPath(); ctx.arc(.6, hy, 4.9, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    for (const gx of [-.4, 2.8]) { ctx.fillStyle = laton; ctx.beginPath(); ctx.arc(gx, hy - 4, 1.55, 0, TAU); ctx.fill(); ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = .4; ctx.stroke(); ctx.fillStyle = lente; ctx.beginPath(); ctx.arc(gx, hy - 4, .95, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.fillRect(gx - .5, hy - 4.6, .45, .45); } };
  const engrane = (ctx, x, y, r, rot, col) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = col; ctx.beginPath(); for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, rr = k % 2 ? r : r * 1.35; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.fillStyle = '#2a1810'; ctx.beginPath(); ctx.arc(0, 0, r * .4, 0, TAU); ctx.fill(); ctx.restore(); };
  const VPI = { lw: .7, line: '#2a1810', skin: '#c8865a', hair: '#2a1810', blouse: '#f0e2c4', blouse2: '#d8c8a0', emb: ['#c8203a', '#c8902a', '#2a6a5a'], shorts: '#4a5a3a', shoes: '#c8203a', bow: '#c8203a', pack: '#8a5a2a', eye: '#2a1810', cheek: 'rgba(200,80,60,.35)' };
  const VPF = { lw: .7, line: '#2a1810', body: '#f0a0b0', belly: '#f8d8c8', gill: '#c8743a', gillTip: '#f2c94c', eye: '#2a1810', glow: '#ffb060', glowA: .2, gillLine: true };
  V('vapor', [
    D('Aviadora', 'Chamarra de cuero con bordado de latón y goggles de lente ámbar, lista para volar en dirigible.',
      colores({ ...VPI, blouse: '#8a5a2a', blouse2: '#6a4220', emb: ['#f2c94c', '#c8902a'], shorts: '#3a2a20', pack: '#5a3a1a', extra: goggles('#ffb040') },
        { ...VPF, body: '#f4b0a0', belly: '#fde0d0', gill: '#8a5a2a', gillTip: '#f2c94c' })),
    D('Cobre y verdín', 'Colores de cobre viejo con su pátina verde, como las tuberías de la fábrica.',
      colores({ ...VPI, blouse: '#5aa898', blouse2: '#3a8a7a', emb: ['#c8743a', '#e8b860'], shorts: '#8a4a24', shoes: '#c8743a', bow: '#c8743a', pack: '#3a7a6a', extra: goggles('#c8f0e0', '#c8743a') },
        { ...VPF, body: '#6ac0a8', belly: '#c8ece0', gill: '#c8743a', gillTip: '#e8b860', glow: '#9affd8' })),
    D('Plano de ingeniera', 'Dibujadas como plano técnico: líneas blancas sobre papel azul.', linea('#e8f0ff', .55, null, '#1f4a8a')),
    D('Contraluz de caldera', 'Siluetas contra el fuego de las calderas, con el filo naranja.', contraluz('#1a0c08', '#ffb040')),
    D('Cuerda de reloj', 'Itzel con un engrane girando en la mochila; Fresita de latón con su llave de cuerda en la espalda.',
      { itzel: (c, p, f) => { const g = drawItzel(c, p, f, { ...VPI, extra: goggles() }); c.save(); c.translate(p.x, p.y); c.scale(p.face, 1); engrane(c, -5, -8 + g.bob, 2.1, f.t * 3, '#c8902a'); c.restore(); },
        fresita: Fd({ ...VPF, body: '#d8a040', belly: '#f6dc98', gill: '#8a4a24', gillTip: '#fff0b0', glow: '#ffd070',
          extra: (c, o, mode, f, t) => { c.save(); c.translate(-2, -4.2); c.rotate(t * 4); c.strokeStyle = '#5a3a1a'; c.fillStyle = '#c8902a'; c.lineWidth = .5; c.beginPath(); c.ellipse(-1.8, 0, 1.6, 1, 0, 0, TAU); c.ellipse(1.8, 0, 1.6, 1, 0, 0, TAU); c.fill(); c.stroke(); c.fillRect(-.4, 0, .8, 2.6); c.restore(); } }) }),
  ]);
})();
