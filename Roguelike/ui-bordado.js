'use strict';
// =====================================================================
//  Interfaz bordada: letras, iconos y marcos en punto de cruz sobre manta.
//  Todo se genera aqui como imagenes (data URL) para usarlas en el HTML.
// =====================================================================
const BORDADO = (() => {
  const F = {
    A: '01110 10001 10001 11111 10001 10001 10001', B: '11110 10001 10001 11110 10001 10001 11110', C: '01110 10001 10000 10000 10000 10001 01110',
    D: '11110 10001 10001 10001 10001 10001 11110', E: '11111 10000 10000 11110 10000 10000 11111', F: '11111 10000 10000 11110 10000 10000 10000',
    G: '01110 10001 10000 10111 10001 10001 01111', H: '10001 10001 10001 11111 10001 10001 10001', I: '01110 00100 00100 00100 00100 00100 01110',
    J: '00111 00010 00010 00010 00010 10010 01100', K: '10001 10010 10100 11000 10100 10010 10001', L: '10000 10000 10000 10000 10000 10000 11111',
    M: '10001 11011 10101 10101 10001 10001 10001', N: '10001 11001 10101 10011 10001 10001 10001', 'Ñ': '01110 00000 10001 11001 10101 10011 10001',
    O: '01110 10001 10001 10001 10001 10001 01110', P: '11110 10001 10001 11110 10000 10000 10000', Q: '01110 10001 10001 10001 10101 10010 01101',
    R: '11110 10001 10001 11110 10100 10010 10001', S: '01111 10000 10000 01110 00001 00001 11110', T: '11111 00100 00100 00100 00100 00100 00100',
    U: '10001 10001 10001 10001 10001 10001 01110', V: '10001 10001 10001 10001 10001 01010 00100', W: '10001 10001 10001 10101 10101 10101 01010',
    X: '10001 10001 01010 00100 01010 10001 10001', Y: '10001 10001 01010 00100 00100 00100 00100', Z: '11111 00001 00010 00100 01000 10000 11111',
    '¡': '00100 00000 00100 00100 00100 00100 00100', '!': '00100 00100 00100 00100 00100 00000 00100', ' ': '000 000 000 000 000 000 000',
    '0': '01110 10011 10101 10101 11001 10001 01110', '1': '00100 01100 00100 00100 00100 00100 01110', '2': '01110 10001 00001 00110 01000 10000 11111',
    '3': '11110 00001 00001 01110 00001 00001 11110', '4': '00010 00110 01010 10010 11111 00010 00010', '-': '000 000 000 111 000 000 000',
  };
  const ACC = { 'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U' };
  const HUIPIL = ['#c8203a', '#e8642a', '#f2b233', '#3f9a5c', '#2f7fc8', '#a03a9a', '#e85a8a'];

  // dibuja una X de hilo con su sombra y su brillo
  function stitch(x, cx, cy, s, col) {
    const a = s * .14, b = s * .86;
    x.lineCap = 'round';
    x.strokeStyle = shade(col, -.35); x.lineWidth = s * .36; x.beginPath(); x.moveTo(cx + a, cy + a + s * .05); x.lineTo(cx + b, cy + b + s * .05); x.stroke();
    x.strokeStyle = col; x.lineWidth = s * .32; x.beginPath(); x.moveTo(cx + a, cy + a); x.lineTo(cx + b, cy + b); x.stroke();
    x.strokeStyle = shade(col, -.2); x.lineWidth = s * .34; x.beginPath(); x.moveTo(cx + b, cy + a); x.lineTo(cx + a, cy + b); x.stroke();
    x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = s * .09; x.beginPath(); x.moveTo(cx + b - s * .08, cy + a + s * .08); x.lineTo(cx + a + s * .2, cy + b - s * .2); x.stroke();
  }
  function grid(rows, cell, colorAt, pad = 1) {
    const h = rows.length, w = Math.max(...rows.map(r => r.length)), c = document.createElement('canvas');
    c.width = (w + pad * 2) * cell; c.height = (h + pad * 2) * cell;
    const x = c.getContext('2d');
    rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '0' && r[i] !== '.' && r[i] !== ' ') { const col = colorAt(i, j, r[i]); if (col) stitch(x, (i + pad) * cell, (j + pad) * cell, cell, col); } });
    return c;
  }
  // texto en punto de cruz; cada letra con un color de huipil o un color fijo
  function text(str, cell = 6, colors = HUIPIL, gap = 1) {
    const chars = [...str.toUpperCase()].map(ch => F[ACC[ch] || ch] || F[' ']);
    const rows = Array.from({ length: 7 }, () => ''), owner = [];
    chars.forEach((g, k) => { const rr = g.split(' '); for (let j = 0; j < 7; j++) rows[j] += rr[j] + '0'.repeat(gap); for (let i = 0; i < rr[0].length + gap; i++) owner.push(k); });
    return grid(rows, cell, (i) => colors[owner[i] % colors.length]).toDataURL();
  }
  // frase bordada sobre un lienzo, con acentos: regresa el lienzo y dónde termina cada letra, para irla bordando
  function frase(str, cell = 8, colors = HUIPIL, gap = 1) {
    const chars = [...str.toUpperCase()], rows = Array.from({ length: 9 }, () => ''), owner = [], fin = [];
    chars.forEach((ch, k) => {
      const ene = ch === 'Ñ', g = (ene ? F.N : F[ACC[ch] || ch] || F[' ']).split(' '), w = g[0].length, h = '0'.repeat(gap);
      rows[0] += (ene ? '01101' : ACC[ch] ? '00010' : '0'.repeat(w)) + h; rows[1] += (ene ? '10010' : ACC[ch] ? '00100' : '0'.repeat(w)) + h;
      for (let j = 0; j < 7; j++) rows[j + 2] += g[j] + h;
      for (let i = 0; i < w + gap; i++) owner.push(k);
      fin.push((owner.length + 1) * cell);
    });
    return { c: grid(rows, cell, i => colors[owner[i] % colors.length]), fin };
  }
  // ---------- el nombre se teje ----------
  // Cada letra con su hilo: la aguja sigue el trazo y cada puntada cruza sus dos hilos. Solo pasa una vez por
  // partida; si el menú se vuelve a pintar a media animación, sigue donde iba, y no corre detrás de una cinemática.
  const TEJE = { cv: null, x: null, base: null, puntos: null, fin: 0, llevado: 0, corre: false, hecho: false, antes: 0 };
  const POR_PUNTADA = .034, DURA_PUNTADA = .1, CAMBIO_HILO = .16, SALE_AGUJA = .55, AIRE = 5;
  function cruce(x, cx, cy, s, col, u) { // u: de 0 a 1, primero una diagonal y luego la otra
    const a = s * .14, b = s * .86, u1 = Math.min(1, u * 2), u2 = Math.max(0, u * 2 - 1), L = (p, q, k) => { x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k); x.stroke(); };
    x.lineCap = 'round';
    x.strokeStyle = shade(col, -.35); x.lineWidth = s * .36; L([cx + a, cy + a + s * .05], [cx + b, cy + b + s * .05], u1);
    x.strokeStyle = col; x.lineWidth = s * .32; L([cx + a, cy + a], [cx + b, cy + b], u1);
    if (u2 > 0) { x.strokeStyle = shade(col, -.2); x.lineWidth = s * .34; L([cx + b, cy + a], [cx + a, cy + b], u2); x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = s * .09; L([cx + b - s * .08, cy + a + s * .08], [cx + a + s * .2, cy + b - s * .2], u2); }
  }
  // la aguja va a la puntada vecina, como quien sigue la letra; si se acaba el tramo, salta a la más cercana
  function trazo(celdas) {
    const libres = new Map(celdas.map(c => [c.i + ',' + c.j, c])), sale = []; let at = celdas[0];
    while (libres.size) {
      let sig = null;
      for (const [di, dj] of [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [1, -1], [-1, -1]]) if ((sig = libres.get((at.i + di) + ',' + (at.j + dj)))) break;
      if (!sig) { let m = 1e9; for (const c of libres.values()) { const q = (c.i - at.i) ** 2 + (c.j - at.j) ** 2; if (q < m) { m = q; sig = c; } } }
      libres.delete(sig.i + ',' + sig.j); sale.push(sig); at = sig;
    }
    return sale;
  }
  function armaTejido(str, cell, colors) {
    const pad = 1, celdas = [...str.toUpperCase()].map(ch => (F[ACC[ch] || ch] || F[' ']).split(' ')), letras = []; let col = 0;
    celdas.forEach((g, k) => { const lista = []; g.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '1') lista.push({ i: col + i + pad, j: j + pad }); }); letras.push({ lista, col: colors[k % colors.length] }); col += g[0].length + 1; });
    const m = AIRE * cell, w = (col + pad * 2) * cell, h = 9 * cell, cv = document.createElement('canvas'); cv.width = w + m * 2; cv.height = h + m * 2;
    cv.className = 'logo'; cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', str);
    // mide lo mismo que la imagen: el margen de sobra (para que quepa la aguja) no mueve nada de la pantalla
    cv.style.cssText = `width:calc(var(--logo) * ${(w + m * 2) / w});max-width:none;margin:calc(var(--logo) * ${-m / w})`;
    const puntos = []; let t = .2;
    for (const L of letras) { for (const c of trazo(L.lista)) { puntos.push({ t, x: m + c.i * cell, y: m + c.j * cell, col: L.col }); t += POR_PUNTADA; } t += CAMBIO_HILO; }
    const base = document.createElement('canvas'); base.width = cv.width; base.height = cv.height;
    Object.assign(TEJE, { cv, x: cv.getContext('2d'), base, bx: base.getContext('2d'), puntos, cell, fin: t + SALE_AGUJA, n: 0 });
  }
  function pintaTejido() {
    const { x, cv, base, bx, puntos, cell: s, llevado: t } = TEJE;
    while (TEJE.n < puntos.length && puntos[TEJE.n].t + DURA_PUNTADA <= t) { const q = puntos[TEJE.n++]; stitch(bx, q.x, q.y, s, q.col); }
    x.clearRect(0, 0, cv.width, cv.height); x.drawImage(base, 0, 0);
    let cur = puntos[Math.min(TEJE.n, puntos.length - 1)];
    for (let i = TEJE.n; i < puntos.length && puntos[i].t < t; i++) { const q = puntos[i]; cruce(x, q.x, q.y, s, q.col, (t - q.t) / DURA_PUNTADA); cur = q; }
    // la aguja entra y sale de la tela; al terminar, se lleva el hilo hacia arriba
    const ultimo = puntos[puntos.length - 1].t + DURA_PUNTADA, va = Math.min(1, Math.max(0, (t - ultimo) / SALE_AGUJA)), sube = va * va * cv.height, mete = Math.abs(Math.sin(t * 46)) * s * .5 * (1 - va);
    if (va >= 1) return;
    const tx = cur.x + s * .5, ty = cur.y + s * .5 - mete - sube, ox = tx + s * 2.4, oy = ty - s * 4;
    x.save(); x.globalAlpha = 1 - va * va;
    x.strokeStyle = cur.col; x.lineWidth = s * .16; x.lineCap = 'round'; x.beginPath(); x.moveTo(ox, oy); x.bezierCurveTo(ox + s * 3, oy - s * 2 + Math.sin(t * 5) * s * .6, cv.width - s * 5, s * 3, cv.width, 0); x.stroke();
    const g = x.createLinearGradient(ox - s * .2, 0, ox + s * .2, 0); g.addColorStop(0, '#f8f6f2'); g.addColorStop(1, '#84848f'); x.fillStyle = g;
    x.beginPath(); x.moveTo(tx, ty); x.lineTo(ox + s * .17, oy + s * .06); x.lineTo(ox - s * .13, oy - s * .12); x.closePath(); x.fill();
    x.strokeStyle = '#84848f'; x.lineWidth = s * .07; x.beginPath(); x.ellipse(ox, oy, s * .1, s * .28, .54, 0, TAU); x.stroke();
    x.restore();
  }
  function teje(img, str = 'Itzel', cell = 16, colors = HUIPIL) {
    if (TEJE.hecho || !img || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!TEJE.cv) armaTejido(str, cell, colors);
    img.replaceWith(TEJE.cv); pintaTejido();
    if (TEJE.corre) return;
    TEJE.corre = true; TEJE.antes = performance.now();
    const cuadro = ahora => {
      const dt = Math.min(.05, (ahora - TEJE.antes) / 1000); TEJE.antes = ahora;
      if (!TEJE.cv.isConnected) { TEJE.corre = false; return; }
      if (!(window.CINE && CINE.activo())) TEJE.llevado += dt;
      pintaTejido();
      if (TEJE.llevado >= TEJE.fin) { TEJE.hecho = true; TEJE.corre = false; return; }
      requestAnimationFrame(cuadro);
    };
    requestAnimationFrame(cuadro);
  }
  window.__teje = t => { if (t < TEJE.llevado && TEJE.bx) { TEJE.n = 0; TEJE.bx.clearRect(0, 0, TEJE.base.width, TEJE.base.height); } TEJE.llevado = t; pintaTejido(); return TEJE.fin; }; // para revisarla cuadro por cuadro
  // iconos
  const ICONS = {
    heart: ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000'],
    cacao: ['0011100', '0111110', '1101011', '1101011', '1101011', '1101011', '0111110', '0011100'],
    canistel: ['0000220', '0001200', '0011110', '0111111', '0111111', '0111110', '0011100'],
    semilla: ['0001000', '0011100', '0112110', '1122211', '0112110', '0011100', '0001000'],
    bubble: ['0011100', '0100010', '1000101', '1000001', '1000001', '0100010', '0011100'],
    feather: ['0000011', '0000111', '0001110', '0011110', '0011100', '0111000', '0110000', '1100000', '1000000'],
    wind: ['000010000', '000001000', '111111100', '111111110', '111111100', '000001000', '000010000'],
    rings: ['001111100', '010000010', '100111001', '101000101', '101000101', '101000101', '100111001', '010000010', '001111100'],
    moon: ['0011100', '0111000', '1110000', '1110000', '1110000', '0111000', '0011100'],
    speed: ['110011000', '011001100', '001100110', '000110011', '001100110', '011001100', '110011000'],
    cup: ['0101000', '1010000', '0000000', '1111110', '1111111', '1111101', '1111110', '0111100'],
    jade: ['0110110', '1111111', '1122211', '0122210', '0012100', '0001000'],
    libro: ['011111110', '133333310', '133333310', '133222310', '133222310', '133333310', '133333310', '133333310', '122222210', '011111110'],
    engrane: ['000101000', '011111110', '011111110', '111202111', '112222211', '111202111', '011111110', '011111110', '000101000'],
    barras: ['0000033', '0000033', '0022033', '0022033', '1122033', '1122033', '1122033'],
    control: ['01110001110', '11111111111', '12111113131', '22211111111', '12111131311', '11111111111', '11100000111'],
    flor: ['0010100', '0111110', '1112111', '0121210', '1112111', '0111110', '0010100'],
    sol: ['1001001', '0100010', '0012100', '1122211', '0012100', '0100010', '1001001'],
    claqueta: ['2112112', '1121121', '0000000', '3333333', '3444443', '3444443', '3333333'],
    dificultad: ['000000011','000000011','000110011','000110011','110110011','110110011','110110011','110110011','110110011'],
    musica: ['000111110','000110010','000110010','000110010','000110010','011110110','111101110','111001100','010000000'],
    sonido: ['000100100','001100010','011100001','111100101','111100101','111100101','011100001','001100010','000100100'],
    pantalla: ['111011111','100000001','100000001','000000000','000000000','000000000','100000001','100000001','111011111'],
    sacudida: ['010000010','101111101','001000100','101000101','001000100','101000101','001000100','101111101','010000010'],
    tarjeta: ['011111110','110000011','101110101','101210101','101110101','100000001','101111101','101111101','111111111'],
    partida: ['011111110','110000011','100100001','100110001','100111001','100110001','100100001','110000011','011111110'],
    trofeo: ['011111110','111111111','101111101','011111110','001111100','000111000','000010000','001111100','011111110'],
    reloj: ['001111100','011000110','110010011','100010001','100011101','100000001','110000011','011000110','001111100'],
    cronometro: ['000111000','000010000','001111100','010010010','100010001','100011001','100000001','010000010','001111100'],
    pisoton: ['000110000','001111000','001111000','000110000','000111000','001111110','011111111','111111110','011111000'],
    dormido: ['111100011','000100011','001000000','010000110','111100110','000000000','001111100','011010110','001111100'],
    burbujaCura: ['001111100','010000010','100010001','100111001','100010001','100000001','100000101','010000010','001111100'],
    doblon: ['001111100','011222110','112121211','121111121','122111221','121111121','112121211','011222110','001111100'],
    corazonRoto: ['011001100','111101110','111011110','011101100','001011000','000110000','000100000'],
    poderFresita: ['000000100','000001110','010000100','111000000','010001010','000011100','000111000','001110000','011100000'],
    // las pestañas de la enciclopedia
    catedral: ['010000010', '111000111', '101000101', '111000111', '111111111', '111101111', '111111111', '111000111', '111000111'],
    cofre: ['001111100', '011111110', '111111111', '000000000', '111101111', '111000111', '111111111', '111111111'],
    cangrejo: ['110000011', '101000101', '110404011', '010101010', '011111110', '111111111', '011111110', '101010101', '100000001'],
    corona: ['100010001', '100010001', '110111011', '111111111', '113131311', '111111111', '011111110'],
    globo: ['001111100', '011101110', '110101011', '101101101', '000000000', '101101101', '110101011', '011101110', '001111100'],
    itzel: ['000111000', '101111101', '111010111', '100111001', '000010000', '001111100', '011111110', '111111111', '001000100'],
    escalones: ['000001111', '000002222', '000000000', '001111000', '002222000', '000000000', '111100000', '222200000'],
    ajolote: ['300000003', '330111033', '031111130', '311010113', '011111110', '001131100', '000111000'],
    subjefe: ['030030030', '000000000', '100000001', '110000011', '011111110', '111010111', '111111111', '114141411', '011111110'],
  };
  const ICOL = { heart: ['#d8203a'], cacao: ['#7a3e1c'], canistel: ['#eea91c', '#408545'], semilla: ['#d99438', '#fff5b7'], bubble: ['#e85a9a'], feather: ['#2f9a6c'], wind: ['#2f7fc8'], rings: ['#e85a9a'], moon: ['#6a5ad0'], speed: ['#e8642a'], cup: ['#a05a2a'], jade: ['#2f9a6c', '#8fe0b0'], engrane: ['#5a6a7a', '#efe4cc'], barras: ['#c8203a', '#f2b233', '#2f7fc8'], control: ['#4a3a5a', '#f2b233', '#e85a9a'], flor: ['#e85a9a', '#f2b233'], sol: ['#e8642a', '#f2b233'], claqueta: ['#2a2230', '#f2f0e8', '#2a2230', '#c8203a'],
    catedral: ['#f0e1c0'], cofre: ['#a05a2a', '#e8a33a', '#ffd23f', '#fff4d0'], cangrejo: ['#d8402a', '#d8402a', '#d8402a', '#ffffff'], corona: ['#e8a33a', '#e8a33a', '#c8203a'], globo: ['#2f7fc8'],
    itzel: ['#3a2418', '#3a2418', '#e0303f'], escalones: ['#3f7fd6', '#9cc0f0'], ajolote: ['#ffc9e0', '#ffc9e0', '#ff4f95'], subjefe: ['#7a3a8a', '#7a3a8a', '#e0303f', '#ffffff'] };
  Object.assign(ICOL, {
    libro: ['#7a3e1c', '#fff5b7', '#c8203a'],
    dificultad: ['#b75345'], musica: ['#7e5ba7'], sonido: ['#3e8aa1'], pantalla: ['#458a70'], sacudida: ['#d46e38'], tarjeta: ['#c05a80', '#efba44'],
    partida: ['#2f7fc8'], trofeo: ['#ce8d12'], reloj: ['#527a9a'], cronometro: ['#d16d30'],
    pisoton: ['#8b553b'], dormido: ['#8161a4'], burbujaCura: ['#de6294'],
    doblon: ['#bd8227', '#f5cd63'], corazonRoto: ['#bd3b4b'], poderFresita: ['#ba5ba3']
  });
  function icon(name, cell = 5, colOverride) {
    const rows = ICONS[name], cols = colOverride || ICOL[name];
    return grid(rows, cell, (i, j, ch) => cols[(+ch || 1) - 1] || cols[0]).toDataURL();
  }
  // marco bordado (border-image) con grecas y flores de huipil
  function frame(cell = 3) {
    const N = 8, S = N * cell, c = document.createElement('canvas'); c.width = c.height = S * 3;
    const x = c.getContext('2d');
    const flower = ['01010', '11111', '01210', '11111', '01010'];
    const edge = ['00000000', '10000001', '01000010', '00100100', '00011000', '00100100', '01000010', '10000001'];
    const put = (rows, ox, oy, cols) => rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '0') stitch(x, ox + i * cell, oy + j * cell, cell, cols[+r[i] - 1]); });
    for (const [ox, oy] of [[0, 0], [2 * S, 0], [0, 2 * S], [2 * S, 2 * S]]) put(flower, ox + 1.5 * cell, oy + 1.5 * cell, ['#c8203a', '#f2b233']);
    for (const [ox, oy] of [[S, 0], [S, 2 * S]]) put(edge, ox, oy, ['#2f7fc8']);
    for (const [ox, oy] of [[0, S], [2 * S, S]]) put(edge, ox, oy, ['#3f9a5c']);
    return { url: c.toDataURL(), slice: S };
  }
  function cloth() { // trama de manta
    const c = document.createElement('canvas'); c.width = c.height = 8; const x = c.getContext('2d');
    x.fillStyle = '#efe4cc'; x.fillRect(0, 0, 8, 8); x.fillStyle = 'rgba(120,90,50,.12)'; x.fillRect(0, 0, 8, 1); x.fillRect(0, 0, 1, 8); x.fillStyle = 'rgba(255,255,255,.4)'; x.fillRect(3, 3, 3, 1); x.fillRect(4, 2, 1, 3);
    return c.toDataURL();
  }
  // otros archivos agregan iconos (iconos-logros.js); el cache de ico() se limpia porque la clave es nombre+tamaño
  function agregaIconos(rows, cols) { Object.assign(ICONS, rows); Object.assign(ICOL, cols); }
  return { text, frase, teje, icon, frame, cloth, HUIPIL, agregaIconos, tiene: n => !!ICONS[n] };
})();

// variables CSS con las texturas bordadas
(function () {
  const fr = BORDADO.frame(3), r = document.documentElement.style;
  r.setProperty('--marco', `url(${fr.url})`); r.setProperty('--marco-slice', fr.slice);
  r.setProperty('--manta', `url(${BORDADO.cloth()})`);
})();
