'use strict';
// =====================================================================
//  ARTE DE LOS JEFES POR MUNDO
//  Los jefes atacan igual en todos lados, pero no se ven igual: cada mundo
//  los vuelve a dibujar con su propia técnica (tinta, acuarela, papel
//  recortado, neón, vitral, óleo, grabado, plastilina…) y les pone sus
//  adornos (abanico art déco, enredaderas, hilos de títere, glifos…).
//
//  Cómo: el cuerpo del jefe se pinta en un lienzo aparte del tamaño de su
//  caja, ahí se le aplica la técnica del mundo y se pega en la escena.
//  Los mundos de pixel ya tienen el suyo (se dibuja a baja resolución).
// =====================================================================
(function () {
  const X = JEFES_EXT, FLOOR = X.FLOOR;
  const cv = mkCanvas(1, 1), cx = cv.getContext('2d', { willReadFrequently: true });
  const t1 = mkCanvas(1, 1), t1x = t1.getContext('2d', { willReadFrequently: true });
  const t2 = mkCanvas(1, 1), t2x = t2.getContext('2d', { willReadFrequently: true });   // en CPU como los otros: si no, cada copia de regreso espera a la tarjeta de video
  const fit = (c, W, H) => { if (c.width !== W || c.height !== H) { c.width = W; c.height = H; } };
  const hash = (x, y) => { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const lum = (d, i) => (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255;
  const sat = (d, i) => { const M = Math.max(d[i], d[i + 1], d[i + 2]), m = Math.min(d[i], d[i + 1], d[i + 2]); return M ? (M - m) / M : 0; };
  const rgb = h => { const c = hex(h); return [c[0], c[1], c[2]]; };
  // el núcleo: del color del núcleo y cerca de donde está (así no se confunde con un cuerpo rojo)
  let NUC = [255, 0, 128], NX = -1e9, NY = -1e9, NR = 0;
  const nucleo = (d, i, x, y) => (x - NX) ** 2 + (y - NY) ** 2 < NR * NR && Math.abs(d[i] - NUC[0]) + Math.abs(d[i + 1] - NUC[1]) + Math.abs(d[i + 2] - NUC[2]) < 120;
  const put = (d, i, c, k = 1) => { d[i] += (c[0] - d[i]) * k; d[i + 1] += (c[1] - d[i + 1]) * k; d[i + 2] += (c[2] - d[i + 2]) * k; };

  // ---------------- la caja de cada jefe (en coordenadas del mundo) ----------------
  const CAJA = {
    mythos: o => [o.x - 46, o.y - 39, o.x + 42, o.y + 65],
    ruptura: o => [o.x - 64, o.y - 60, o.x + 64, o.y + 72],
    golem: o => [o.x - 42, FLOOR - (o.hgt || 92) - 14 - (o.jump || 0), o.x + 42, FLOOR + 2],
    serpiente: o => { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const s of o.seg) { a = Math.min(a, s.x); b = Math.min(b, s.y); c = Math.max(c, s.x); d = Math.max(d, s.y); } return [a - 42, b - 42, c + 42, d + 42]; },
    jaguar: o => [o.x - 44, o.y - 44, o.x + 44, o.y + 6],
    hadas: o => [o.x - 40, o.y - 30, o.x + 20, o.y + 48],
    pirata: o => [o.x - 44, o.y - 58, o.x + 44, o.y + 22],
    chaac: o => [o.x - 48, o.y - 36, o.x + 48, o.y + 34],
    camazotz: o => [o.x - 58, o.y - 42, o.x + 58, o.y + 36],
    abeja: o => [o.x - 50, o.y - 50, o.x + 50, o.y + 30],
    brawbot: o => [o.x - 62, FLOOR - 104, o.x + 62, FLOOR + 4],
    cocodrilo: o => o.mordida > 0 ? [o.x - 20, FLOOR - 52, o.x + 20, FLOOR + 2] : [o.x - 56, FLOOR - 96, o.x + 56, FLOOR + 4],
  };

  // ---------------- herramientas ----------------
  function silueta(src, W, H, col) {
    fit(t1, W, H); t1x.globalCompositeOperation = 'source-over'; t1x.clearRect(0, 0, W, H); t1x.drawImage(src, 0, 0);
    t1x.globalCompositeOperation = 'source-in'; t1x.fillStyle = col; t1x.fillRect(0, 0, W, H); t1x.globalCompositeOperation = 'source-over'; return t1;
  }
  // contorno: la silueta repetida alrededor, por detrás
  function contorno(W, H, col, r, n = 12, temblor = 0, t = 0) {
    const s = silueta(cv, W, H, col); cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalCompositeOperation = 'destination-over';
    for (let i = 0; i < n; i++) { const a = i / n * TAU, k = temblor ? 1 + (hash(i, Math.floor(t * 8)) - .5) * temblor : 1; cx.drawImage(s, Math.cos(a) * r * k, Math.sin(a) * r * k); }
    cx.restore();
  }
  // sombra: la silueta corrida, por detrás
  function sombra(W, H, col, dx, dy, alpha = 1, pasos = 1) {
    const s = silueta(cv, W, H, col); fit(t2, W, H); t2x.clearRect(0, 0, W, H);
    for (let k = 1; k <= pasos; k++) t2x.drawImage(s, dx * k / pasos, dy * k / pasos);
    cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalCompositeOperation = 'destination-over'; cx.globalAlpha = alpha; cx.drawImage(t2, 0, 0); cx.restore();
  }
  // recorre los pixeles con algo de color
  function px(W, H, fn) {
    const im = cx.getImageData(0, 0, W, H), d = im.data;
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i += 4) if (d[i + 3]) fn(d, i, x, y, im);
    cx.putImageData(im, 0, 0); return im;
  }
  // ¿hay hueco a la distancia r en la dirección (dx, dy)? (para bordes y luz de contraluz)
  const vacio = (d, W, H, x, y, dx, dy) => { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) return true; return d[(yy * W + xx) * 4 + 3] < 40; };
  function borde(W, H, r, fn) {
    const im = cx.getImageData(0, 0, W, H), d = im.data, a = new Uint8ClampedArray(W * H);
    for (let i = 0; i < W * H; i++) a[i] = d[i * 4 + 3];
    const v = (x, y) => x < 0 || y < 0 || x >= W || y >= H || a[y * W + x] < 40;
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i += 4) if (d[i + 3]) fn(d, i, x, y, v);
    cx.putImageData(im, 0, 0);
  }
  const posterizar = (W, H, n) => px(W, H, (d, i) => { for (let k = 0; k < 3; k++) d[i + k] = Math.round(d[i + k] / 255 * (n - 1)) / (n - 1) * 255; });
  const paleta = (W, H, cols) => { const P = cols.map(rgb); px(W, H, (d, i) => { let b = P[0], bd = 1e9; for (const c of P) { const e = (c[0] - d[i]) ** 2 * .3 + (c[1] - d[i + 1]) ** 2 * .59 + (c[2] - d[i + 2]) ** 2 * .11; if (e < bd) { bd = e; b = c; } } d[i] = b[0]; d[i + 1] = b[1]; d[i + 2] = b[2]; }); };
  // rayado de grabado: líneas diagonales más gruesas donde es más oscuro
  function rayado(W, H, S, tinta, papel, rojo, paso = 1.7) {
    const T = rgb(tinta), P = rgb(papel), R = rojo && rgb(rojo), p = Math.max(2, Math.round(paso * S));
    px(W, H, (d, i, x, y) => {
      if (R && nucleo(d, i, x, y)) { put(d, i, R); return; }
      const l = lum(d, i), on = ((x + y) % p) < p * (1 - l) * .95 || (l < .35 && ((x - y + 999 * p) % p) < p * (.35 - l) * 2.2);
      put(d, i, on ? T : P); d[i + 3] = d[i + 3] > 90 ? 255 : 0;
    });
  }
  function desenfocar(W, H, r) { fit(t2, W, H); t2x.clearRect(0, 0, W, H); t2x.drawImage(cv, 0, 0); cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, W, H); cx.filter = `blur(${r}px)`; cx.drawImage(t2, 0, 0); cx.filter = 'none'; cx.restore(); }
  function encima(W, H, col, modo = 'source-atop', alpha = 1) { cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalCompositeOperation = modo; cx.globalAlpha = alpha; cx.fillStyle = col; cx.fillRect(0, 0, W, H); cx.restore(); }

  function facetas(W, H, st, fuerza, borde = .1) {
    cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalCompositeOperation = 'source-atop'; cx.lineWidth = .6;
    for (let y = -st; y < H + st; y += st) for (let x = -st, fila = 0; x < W + st; x += st, fila++) {
      const off = (Math.floor(y / st) % 2) * st / 2;
      for (const [tri, n] of [[[[x + off, y], [x + off + st, y], [x + off + st / 2, y + st]], 0], [[[x + off + st, y], [x + off + st * 1.5, y + st], [x + off + st / 2, y + st]], 1]]) {
        const cxm = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, cym = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
        const k = (hash(cxm | 0, (cym | 0) + n) - .5) * fuerza + (.5 - (cxm + cym) / (W + H)) * fuerza * .8;
        cx.fillStyle = k > 0 ? `rgba(255,255,255,${k})` : `rgba(0,0,0,${-k})`; cx.beginPath(); cx.moveTo(...tri[0]); cx.lineTo(...tri[1]); cx.lineTo(...tri[2]); cx.closePath(); cx.fill();
        if (borde) { cx.strokeStyle = `rgba(255,255,255,${borde})`; cx.stroke(); }
      }
    }
    cx.restore();
  }

  // ---------------- adornos (se dibujan en coordenadas del mundo) ----------------
  const estrellita = (c, x, y, r, col) => { c.fillStyle = col; c.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, rr = k % 2 ? r * .25 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); };
  const centro = b => [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];

  // ---------------- las técnicas de cada mundo ----------------
  const INK = '#1a1418';
  const ARTE = {
    // Ilustración tipo grabado: rayado negro sobre papel, el núcleo en rojo
    grabado: { tec(W, H, S) { rayado(W, H, S, '#1f1a1c', '#efe5cf', '#b3342b'); contorno(W, H, '#1f1a1c', .8 * S, 10); } },
    // Pintura en amate: relleno plano, contorno negro grueso y puntitos blancos
    fuego: { tec(W, H, S, o) {
      if (o.tipo === 'mythos') {
        // Jade pintado a mano: conserva el relieve de la máscara y usa
        // pequeños acentos de pintura, dejando libre el ojo.
        const paso = Math.max(5, Math.round(7 * S)), radio = Math.max(.7, .25 * S);
        px(W, H, (d, i, x, y) => {
          const distancia = (x - NX) ** 2 + (y - NY) ** 2, l = lum(d, i);
          if (distancia < (16 * S) ** 2 || l < .17 || l > .83) return;
          put(d, i, [40, 141, 104], .12);
          const dx = (x + (Math.floor(y / paso) % 2) * paso / 2) % paso - paso / 2, dy = y % paso - paso / 2;
          if (dx * dx + dy * dy < radio * radio && hash(Math.floor(x / paso), Math.floor(y / paso)) > .5) put(d, i, [250, 215, 113], .8);
        });
        contorno(W, H, '#21140f', .65 * S, 10);
        return;
      }
      paleta(W, H, ['#e8508a', '#f2c230', '#3aa860', '#2a7ac0', '#f08a2a', '#7a3a9a', '#1a1010', '#f4ead8']);
      const p = Math.max(3, Math.round(3.2 * S)), r = Math.max(1, .55 * S);
      px(W, H, (d, i, x, y) => { const cx0 = (x + (Math.floor(y / p) % 2) * p / 2) % p - p / 2, cy0 = y % p - p / 2; if (cx0 * cx0 + cy0 * cy0 < r * r && lum(d, i) > .15) put(d, i, [255, 250, 235]); });
      contorno(W, H, '#120a08', 1.3 * S, 14);
    } },
    // Anime shoujo: cel de dos tonos, línea oscura y destellos
    anime: { tec(W, H, S) { px(W, H, (d, i) => { const l = lum(d, i), k = l < .5 ? .72 : 1.12; for (let j = 0; j < 3; j++) d[i + j] = Math.min(255, d[i + j] * k + (l < .5 ? 10 : 18)); }); contorno(W, H, '#3a1a3a', .75 * S, 12); },
      frente(c, o, f, b) { const [mx, my] = centro(b); for (let k = 0; k < 5; k++) { const a = f.t * .7 + k * 1.26, r = (b[2] - b[0]) * .5, s = 2 + Math.sin(f.t * 5 + k) * 1.4; estrellita(c, mx + Math.cos(a) * r, my + Math.sin(a) * r * .7, s, k % 2 ? '#fff6fb' : '#ffc0e0'); } } },
    // Diseño plano: dos tonos por color, sin línea, sombra larga
    flat: { pad: 30, tec(W, H, S) { posterizar(W, H, 4); sombra(W, H, '#000000', 14 * S, 14 * S, .22, 18); } },
    // Art déco: oro y negro, abanico de rayos detrás
    deco: { tec(W, H, S) { paleta(W, H, ['#0e0e12', '#1f3a3a', '#d4af37', '#f2e2b0', '#8a1a2a', '#2a5a5a']); contorno(W, H, '#d4af37', .7 * S, 12); contorno(W, H, '#0e0e12', 1.5 * S, 12); },
      atras(c, o, f, b) { const [mx] = centro(b), by = b[3] - 4, R = (b[3] - b[1]) * .95; c.save(); c.globalAlpha = .55; for (let k = 0; k <= 12; k++) { const a = Math.PI + k / 12 * Math.PI; c.strokeStyle = k % 2 ? '#d4af37' : '#8a6a1a'; c.lineWidth = k % 2 ? 1.4 : .6; c.beginPath(); c.moveTo(mx, by); c.lineTo(mx + Math.cos(a) * R, by + Math.sin(a) * R); c.stroke(); } c.strokeStyle = '#d4af37'; c.lineWidth = .8; for (const r of [.55, .75]) { c.beginPath(); c.arc(mx, by, R * r, Math.PI, TAU); c.stroke(); } c.restore(); } },
    // Art nouveau: línea café que fluye, filete de oro y enredaderas
    nouveau: { tec(W, H, S) { px(W, H, (d, i) => { const l = lum(d, i); put(d, i, [240, 225, 190], .18); if (l < .3) put(d, i, [70, 50, 30], .5); }); contorno(W, H, '#d8b060', .6 * S, 12); contorno(W, H, '#3a2a1a', 1.5 * S, 14); },
      frente(c, o, f, b) {
        c.save(); c.strokeStyle = '#4a6a2a'; c.lineWidth = 1.1; c.lineCap = 'round';
        for (const s of [-1, 1]) { const x0 = s < 0 ? b[0] + 4 : b[2] - 4, y0 = b[3] - 2; c.beginPath(); c.moveTo(x0, y0); for (let k = 1; k <= 20; k++) { const u = k / 20; c.lineTo(x0 - s * Math.sin(u * 7 + f.t) * 6, y0 - u * (b[3] - b[1]) * .9); } c.stroke();
          for (let k = 3; k < 20; k += 5) { const u = k / 20, x = x0 - s * Math.sin(u * 7 + f.t) * 6, y = y0 - u * (b[3] - b[1]) * .9; c.fillStyle = k % 2 ? '#7a9a3a' : '#e8a0b0'; c.beginPath(); c.ellipse(x + s * 3, y, 3, 1.4, s * .6, 0, TAU); c.fill(); } }
        c.restore(); } },
    // Códice maya: colores del códice, contorno negro grueso y volutas
    codex: { tec(W, H, S) { paleta(W, H, ['#c8442a', '#e0a23a', '#2a8aa0', '#3a7a3a', '#efe0c0', '#1a1410', '#8a3a2a']); contorno(W, H, '#1a1410', 1.2 * S, 14); },
      frente(c, o, f, b) { const k = X.core(o), ph = (f.t * .8) % 1; c.save(); c.globalAlpha = 1 - ph; c.strokeStyle = '#1a1410'; c.fillStyle = '#efe0c0'; c.lineWidth = .8; for (let j = 0; j < 2; j++) { const x = k.x + 14 + ph * 16, y = k.y - 6 - ph * 14 - j * 7; c.beginPath(); c.arc(x, y, 3 - j, 0, TAU * .8); c.stroke(); } c.restore(); } },
    // Cuaderno: grafito sobre papel, coloreado suave y trazo nervioso
    cuaderno: { tec(W, H, S, o, f) {
      const p = Math.max(2, Math.round(1.5 * S));
      px(W, H, (d, i, x, y) => { const l = lum(d, i); put(d, i, [246, 242, 232], .55); if (((x + y) % p) < p * (1 - l) * .7) put(d, i, [74, 74, 86], .85); });
      contorno(W, H, '#3a3a48', .5 * S, 9, .9, f.t);
    }, frente(c, o, f, b) { c.save(); c.strokeStyle = '#4a4a56'; c.lineWidth = .6; const [mx, my] = centro(b); for (let k = 0; k < 3; k++) { const y = my - 6 + k * 6, x = o.face > 0 ? b[0] - 2 : b[2] + 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x - (o.face || 1) * (8 + k * 2), y + 1); c.stroke(); } c.restore(); } },
    // Sumi-e: tinta aguada, pincel seco y un sello rojo
    sumie: { tec(W, H, S, o, f) {
      px(W, H, (d, i, x, y) => { const red = nucleo(d, i, x, y), l = lum(d, i), v = 25 + l * 190, ojo = o.tipo === 'mythos' && (x - NX) ** 2 + (y - NY) ** 2 < (13 * S) ** 2; if (red) put(d, i, [190, 40, 40]); else { d[i] = v; d[i + 1] = v; d[i + 2] = v + 4; } if (!ojo && hash(x >> 1, y >> 1) < .1) d[i + 3] *= .45; });
      contorno(W, H, '#141414', .6 * S, 7, 1.2, Math.floor(f.t * 2));
    }, atras(c, o, f, b) { c.save(); c.fillStyle = 'rgba(20,20,20,.18)'; for (let k = 0; k < 6; k++) { const x = b[0] + hash(k, 3) * (b[2] - b[0]), y = b[3] - hash(k, 9) * 14; c.beginPath(); c.ellipse(x, y, 2 + hash(k, 5) * 4, 1 + hash(k, 7) * 2, 0, 0, TAU); c.fill(); } c.restore(); } },
    // Acuarela: bordes de pigmento acumulado, papel granulado, colores lavados
    acuarela: { tec(W, H, S, o, f) {
      if (!(f.g && f.g.vistaJefeNitida)) desenfocar(W, H, .7 * S);
      px(W, H, (d, i, x, y) => { const a = d[i + 3]; put(d, i, [255, 255, 255], .22); if (a > 30 && a < 200) { for (let k = 0; k < 3; k++) d[i + k] *= .72; d[i + 3] = Math.min(255, a * 1.6); } const n = .9 + hash(x, y) * .1; for (let k = 0; k < 3; k++) d[i + k] *= n; d[i + 3] *= .92; });
    } },
    // Papel recortado: colores planos, filo blanco, sombra y un hilo de títere
    paper: { pad: 10, tec(W, H, S) { posterizar(W, H, 3); contorno(W, H, '#fbf6ea', .8 * S, 12); sombra(W, H, '#3a2a20', 1.6 * S, 2.2 * S, .35); },
      atras(c, o, f, b) { const [mx] = centro(b); c.save(); c.strokeStyle = 'rgba(60,40,30,.6)'; c.lineWidth = .5; c.beginPath(); c.moveTo(mx, -20); c.lineTo(mx, b[1] + 6); c.stroke(); c.fillStyle = '#c8203a'; c.beginPath(); c.arc(mx, b[1] + 6, 1.4, 0, TAU); c.fill(); c.restore(); } },
    // Bioluminiscente: cuerpo casi negro, orilla turquesa que brilla y esporas
    biolum: { glow: '#7ff0e0', tec(W, H, S, o, f) {
      const p = Math.max(4, Math.round(5 * S));
      borde(W, H, 1, (d, i, x, y, v) => { const r = Math.max(1, Math.round(.6 * S)); const e = v(x + r, y) || v(x - r, y) || v(x, y + r) || v(x, y - r); const blancoOjo = o.tipo === 'mythos' && (x - NX) ** 2 + (y - NY) ** 2 < (14 * S) ** 2 && lum(d, i) > .65 && sat(d, i) < .22; if (blancoOjo) return; if (e) put(d, i, [127, 240, 224]); else { put(d, i, [8, 24, 32], .8); if (x % p < S * .8 && (y + Math.floor(x / p) * 3) % p < S * .8 && hash(Math.floor(x / p), Math.floor(y / p)) < .4) put(d, i, [190, 255, 240], .5 + .5 * Math.sin(f.t * 3 + x)); } });
    } },
    // Neón: solo el contorno, encendido, sobre un cuerpo oscuro
    neon: { glow: '#ff2bd6', tec(W, H, S) {
      const r = Math.max(1, Math.round(.7 * S));
      borde(W, H, 1, (d, i, x, y, v) => { const e = v(x + r, y) || v(x - r, y) || v(x, y + r) || v(x, y - r); if (e) { if (y % (r * 6) < r * 3) put(d, i, [255, 43, 214]); else put(d, i, [45, 226, 230]); } else { const l = lum(d, i); put(d, i, l > .8 ? [255, 240, 255] : [16, 6, 30], l > .8 ? 1 : .9); } });
    } },
    // Cyberpunk: canales RGB corridos, líneas de barrido, cortes de glitch y mira
    cyber: { pad: 10, tec(W, H, S, o, f) {
      const im = cx.getImageData(0, 0, W, H), d = im.data, s = new Uint8ClampedArray(d), off = Math.round(1.2 * S), sl = Math.max(2, Math.round(1.4 * S)), g = Math.floor(f.t * 6), cut = hash(g, 1) < .35 ? Math.floor(hash(g, 2) * H) : -1, ch = Math.round(5 * S);
      for (let y = 0; y < H; y++) { const sh = cut >= 0 && y >= cut && y < cut + ch ? Math.round((hash(g, 3) - .5) * 8 * S) : 0; for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, xr = Math.min(W - 1, Math.max(0, x - off - sh)), xb = Math.min(W - 1, Math.max(0, x + off - sh)), xg = Math.min(W - 1, Math.max(0, x - sh)), ir = (y * W + xr) * 4, ib = (y * W + xb) * 4, ig = (y * W + xg) * 4; d[i] = s[ir]; d[i + 1] = s[ig + 1]; d[i + 2] = s[ib + 2]; d[i + 3] = Math.max(s[ir + 3], s[ig + 3], s[ib + 3]); if (y % sl === 0) d[i + 3] *= .5; } }
      cx.putImageData(im, 0, 0);
    }, frente(c, o, f, b) { c.save(); c.strokeStyle = '#05d9e8'; c.lineWidth = .7; const L = 6; for (const [x, y, sx, sy] of [[b[0], b[1], 1, 1], [b[2], b[1], -1, 1], [b[0], b[3], 1, -1], [b[2], b[3], -1, -1]]) { c.beginPath(); c.moveTo(x + sx * L, y); c.lineTo(x, y); c.lineTo(x, y + sy * L); c.stroke(); } c.fillStyle = '#ff2a6d'; c.font = 'bold 4px monospace'; c.fillText(`TGT ${'█'.repeat(o.hp || 0)}`, b[0] + 2, b[1] - 2); c.restore(); } },
    // Óleo: pinceladas en remolino, como noche estrellada
    oleo: { tec(W, H, S, o, f) {
      const im = cx.getImageData(0, 0, W, H), d = im.data, st = Math.max(2, 1.2 * S), mx = W / 2, my = H / 2;
      cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalCompositeOperation = 'source-atop'; cx.lineCap = 'round';
      for (let y = st / 2; y < H; y += st) for (let x = st / 2; x < W; x += st) {
        const jx = x + (hash(x | 0, y | 0) - .5) * st, jy = y + (hash(y | 0, x | 0) - .5) * st, i = ((jy | 0) * W + (jx | 0)) * 4; if (!(d[i + 3] > 60)) continue;
        if ((jx - NX) ** 2 + (jy - NY) ** 2 < (NR * 1.6) ** 2 || lum(d, i) > .82) continue;
        const a = Math.atan2(jy - my, jx - mx) + Math.PI / 2 + Math.sin(jx * .05 + jy * .07) * .6, L = 1.1 * S, k = .85 + hash(jx | 0, jy | 0) * .35;
        cx.globalAlpha = .7; cx.lineWidth = .9 * S; cx.strokeStyle = `rgb(${Math.min(255, d[i] * k)},${Math.min(255, d[i + 1] * k)},${Math.min(255, d[i + 2] * k)})`;
        cx.beginPath(); cx.moveTo(jx - Math.cos(a) * L, jy - Math.sin(a) * L); cx.quadraticCurveTo(jx, jy + .3 * S, jx + Math.cos(a) * L, jy + Math.sin(a) * L); cx.stroke();
        if (hash(x | 0, (y | 0) + 7) < .2) { cx.globalAlpha = .4; cx.strokeStyle = '#fffbe8'; cx.lineWidth = .4 * S; cx.beginPath(); cx.moveTo(jx - Math.cos(a) * L * .6, jy - Math.sin(a) * L * .6 - .3 * S); cx.lineTo(jx + Math.cos(a) * L * .6, jy + Math.sin(a) * L * .6 - .3 * S); cx.stroke(); }
      }
      cx.restore(); contorno(W, H, '#1a2a5a', .5 * S, 8);
    } },
    // Low poly: triángulos de un solo color con luz por cara
    lowpoly: { tec(W, H, S) {
      posterizar(W, H, 6); facetas(W, H, Math.max(5, 6 * S), .42, .12); contorno(W, H, 'rgba(30,20,60,.7)', .5 * S, 6);
    }, frente(c, o, f, b) { c.save(); for (let k = 0; k < 4; k++) { const a = f.t * .9 + k * 1.57, x = (b[0] + b[2]) / 2 + Math.cos(a) * (b[2] - b[0]) * .55, y = (b[1] + b[3]) / 2 + Math.sin(a * 1.3) * 14; c.fillStyle = k % 2 ? 'rgba(160,230,255,.8)' : 'rgba(255,255,255,.7)'; c.beginPath(); c.moveTo(x, y - 3); c.lineTo(x + 2.4, y + 1.6); c.lineTo(x - 2.4, y + 1.6); c.closePath(); c.fill(); } c.restore(); } },
    // Vitral: celdas de vidrio con emplomado negro y luz que las atraviesa
    vitral: { tec(W, H, S, o, f) {
      const im = cx.getImageData(0, 0, W, H), d = im.data, s = new Uint8ClampedArray(d), mascara = o.tipo === 'mythos', cel = Math.max(8, (mascara ? 6.5 : 8.5) * S), lw = Math.max(.7, (mascara ? .24 : .55) * S), gw = Math.ceil(W / cel) + 1, gh = Math.ceil(H / cel) + 1;
      const sx = [], sy = [], sc = [];
      for (let j = 0; j < gh; j++) for (let k = 0; k < gw; k++) { const x = (k + .15 + hash(k, j) * .7) * cel, y = (j + .15 + hash(j + 50, k) * .7) * cel, i = (Math.min(H - 1, y | 0) * W + Math.min(W - 1, x | 0)) * 4; sx.push(x); sy.push(y); sc.push(s[i + 3] > 40 ? [s[i], s[i + 1], s[i + 2]] : null); }
      for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i += 4) {
        if (!d[i + 3]) continue; if ((x - NX) ** 2 + (y - NY) ** 2 < NR * NR * (mascara ? 3.2 : 1.4) || lum(s, i) > .86) continue; const gx = Math.floor(x / cel), gy = Math.floor(y / cel); let b1 = 1e9, b2 = 1e9, bi = -1;
        for (let j = gy - 1; j <= gy + 1; j++) for (let k = gx - 1; k <= gx + 1; k++) { if (j < 0 || k < 0 || j >= gh || k >= gw) continue; const n = j * gw + k, e = Math.hypot(sx[n] - x, sy[n] - y); if (e < b1) { b2 = b1; b1 = e; bi = n; } else if (e < b2) b2 = e; }
        if (b2 - b1 < lw) { if (mascara) { put(d, i, [13, 43, 44], .72); } else { d[i] = 22; d[i + 1] = 20; d[i + 2] = 30; d[i + 3] = 255; } continue; }
        const c0 = sc[bi] || [s[i], s[i + 1], s[i + 2]], M = Math.max(...c0, 1), lit = .75 + .35 * Math.max(0, Math.sin(f.t * .8 + bi));
        for (let q = 0; q < 3; q++) { const vidrio = Math.min(255, (c0[q] / M) * 230 * lit + 20); d[i + q] = mascara ? s[i + q] * .68 + vidrio * .32 : vidrio; } if (!mascara) d[i + 3] = 235;
      }
      cx.putImageData(im, 0, 0); contorno(W, H, '#16141e', .9 * S, 10);
    } },
    // Hollín: sombra negra con orillas de ceniza y ojos rojos
    hollin: { tec(W, H, S, o, f) {
      px(W, H, (d, i, x, y) => { const l = lum(d, i), mascara = o.tipo === 'mythos', ojo = mascara && (x - NX) ** 2 + (y - NY) ** 2 < (13 * S) ** 2, hot = (o.tipo === 'serpiente' || o.tipo === 'cocodrilo') ? false : mascara ? ojo && d[i] > 150 && d[i] > d[i + 1] * 2 : nucleo(d, i, x, y) || l > .85; if (hot) put(d, i, [255, 37, 27]); else { put(d, i, [10, 8, 8]); if (!ojo && hash(x, y + Math.floor(f.t * 10)) < .08) d[i + 3] *= .3; } });
      contorno(W, H, 'rgba(30,26,26,.5)', 1.2 * S, 8, 1.4, f.t);
    }, frente(c, o, f, b) { c.save(); c.fillStyle = 'rgba(20,16,16,.6)'; for (let k = 0; k < 8; k++) { const u = (f.t * .3 + hash(k, 1)) % 1, x = b[0] + hash(k, 2) * (b[2] - b[0]) + Math.sin(f.t + k) * 3, y = b[3] - u * (b[3] - b[1] + 20); c.globalAlpha = 1 - u; c.beginPath(); c.arc(x, y, .8 + hash(k, 3), 0, TAU); c.fill(); } c.restore(); } },
    // Polígonos cinematográficos: rotoscopia de tres tonos y luz de borde
    cinema: { tec(W, H, S) {
      const r = Math.max(1, Math.round(.8 * S));
      borde(W, H, 1, (d, i, x, y, v) => { const l = lum(d, i), t = l < .33 ? .45 : l < .66 ? .75 : 1, g = (d[i] + d[i + 1] + d[i + 2]) / 3; for (let k = 0; k < 3; k++) d[i + k] = (d[i + k] * .5 + g * .5) * t; if (v(x + r, y) || v(x + r, y - r)) put(d, i, [255, 217, 160], .9); });
    } },
    // Ocaso: contraluz morado con orilla de sol
    ocaso: { tec(W, H, S) { const r = Math.max(1, Math.round(.9 * S)); borde(W, H, 1, (d, i, x, y, v) => { if (nucleo(d, i, x, y) || lum(d, i) > .9) return; put(d, i, [42, 22, 48]); if (v(x - r, y) || v(x, y - r) || v(x - r, y - r)) put(d, i, [255, 179, 107]); }); },
      atras(c, o, f, b) { const [mx, my] = centro(b); c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, mx - 10, my - 10, (b[3] - b[1]) * .7, '#ff9a4a', .25); c.restore(); } },
    // Bruma: se pierde en la niebla, borroso y lavado, con jirones
    bruma: { tec(W, H, S, o, f) { if (!(f.g && f.g.vistaJefeNitida)) desenfocar(W, H, .5 * S); px(W, H, (d, i, x, y) => { const g = lum(d, i) * 255 * .7 + 200 * .3; d[i] = d[i + 1] = d[i + 2] = g; d[i + 3] *= .55 + .45 * (1 - y / H); }); },
      frente(c, o, f, b) { c.save(); c.fillStyle = 'rgba(225,225,225,.35)'; for (let k = 0; k < 3; k++) { const x = b[0] + ((f.t * 8 + k * 40) % (b[2] - b[0] + 40)) - 20, y = b[3] - 10 - k * 12; c.beginPath(); c.ellipse(x, y, 18, 3, 0, 0, TAU); c.fill(); } c.restore(); } },
    // Plastilina: relieve de arcilla con huellas
    barro: { tec(W, H, S) { if (window.relieveArcilla) relieveArcilla(cv, S, {}); } },
    // Jardín de ecos (Luma): suave, con luz de arriba y halo
    eco: { tec(W, H, S, o, f) { if (!(f.g && f.g.vistaJefeNitida)) desenfocar(W, H, .3 * S); px(W, H, (d, i, x, y) => { const k = 1.15 - y / H * .35; for (let q = 0; q < 3; q++) d[i + q] = Math.min(255, (d[i + q] * .8 + 50) * k); }); },
      atras(c, o, f, b) { const [mx, my] = centro(b); c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, mx, my, (b[2] - b[0]) * .6, '#9affee', .2); c.restore(); } },
    // Agua: refracción que ondula, tinte de mar y burbujas
    agua: { tec(W, H, S, o, f) {
      fit(t2, W, H); t2x.clearRect(0, 0, W, H); t2x.drawImage(cv, 0, 0); cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, W, H);
      const h = Math.max(1, Math.round(S)); for (let y = 0; y < H; y += h) cx.drawImage(t2, 0, y, W, h, Math.sin(y / (3 * S) + f.t * 3) * .8 * S, y, W, h);
      cx.restore(); encima(W, H, 'rgba(40,150,190,.28)');
    }, frente(c, o, f, b) { c.save(); c.strokeStyle = 'rgba(220,250,255,.7)'; c.lineWidth = .5; for (let k = 0; k < 6; k++) { const u = (f.t * .4 + hash(k, 4)) % 1, x = b[0] + hash(k, 5) * (b[2] - b[0]) + Math.sin(f.t * 2 + k) * 2, y = b[3] - u * (b[3] - b[1]); c.beginPath(); c.arc(x, y, 1 + hash(k, 6) * 1.5, 0, TAU); c.stroke(); } c.restore(); } },
    // Hielo: cuerpo de hielo azul translúcido con destellos
    hielo: { tec(W, H, S, o, f) { const p = Math.max(4, Math.round(7 * S)); px(W, H, (d, i, x, y) => { if (nucleo(d, i, x, y)) return; const l = lum(d, i); d[i] = 40 + l * 170; d[i + 1] = 110 + l * 130; d[i + 2] = 180 + l * 75; d[i + 3] *= .92; const u = (x + y + Math.floor(f.t * 20 * S)) % (p * 6); if (u < S * .8) put(d, i, [255, 255, 255], .85); if ((x - y + 9999) % p < 1) put(d, i, [230, 248, 255], .4); }); facetas(W, H, Math.max(6, 7 * S), .22, .2); contorno(W, H, '#e8f8ff', .4 * S, 10); contorno(W, H, '#1e4a72', 1 * S, 12); },
      frente(c, o, f, b) { c.save(); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = .5; for (let k = 0; k < 4; k++) { const u = (f.t * .15 + hash(k, 8)) % 1, x = b[0] + hash(k, 9) * (b[2] - b[0]), y = b[1] + u * (b[3] - b[1]); c.beginPath(); for (let q = 0; q < 3; q++) { const a = q / 3 * Math.PI; c.moveTo(x - Math.cos(a) * 2, y - Math.sin(a) * 2); c.lineTo(x + Math.cos(a) * 2, y + Math.sin(a) * 2); } c.stroke(); } c.restore(); } },
    // Mapa antiguo: grabado sepia sobre pergamino y constelación encima
    cielo: { tec(W, H, S, o) {
      if (o.tipo === 'serpiente') {
        // Un acabado de bronce para toda la serpiente evita el rayado
        // apretado y une visualmente la cabeza con el cuerpo.
        px(W, H, (d, i) => {
          const l = lum(d, i);
          d[i] = 48 + l * 185; d[i + 1] = 33 + l * 155; d[i + 2] = 19 + l * 105;
        });
        contorno(W, H, '#573817', .55 * S, 10);
      } else {
        rayado(W, H, S, '#4a2e14', '#ead6aa', null, 1.6); contorno(W, H, '#4a2e14', .6 * S, 10);
      }
    },
      frente(c, o, f, b) { const pts = []; for (let k = 0; k < 5; k++) pts.push([b[0] + 8 + hash(k, 11) * (b[2] - b[0] - 16), b[1] + 8 + hash(k, 12) * (b[3] - b[1] - 16)]); c.save(); c.strokeStyle = 'rgba(200,150,60,.7)'; c.lineWidth = .4; c.beginPath(); pts.forEach((p, k) => k ? c.lineTo(...p) : c.moveTo(...p)); c.stroke(); for (const [x, y] of pts) estrellita(c, x, y, 1.6 + Math.sin(f.t * 3 + x) * .4, '#f2c860'); c.restore(); } },
  };
  // ---------------- mundos de pixel: cada consola a su manera ----------------
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const tramado = (W, H, cols, fuerza = 1) => { const P = cols.map(rgb); px(W, H, (d, i, x, y) => { const l = Math.min(1, Math.max(0, lum(d, i) + (BAYER[(y & 3) * 4 + (x & 3)] / 16 - .5) * .35 * fuerza)), k = Math.min(P.length - 1, Math.floor(l * P.length)); if (nucleo(d, i, x, y)) return; put(d, i, P[k]); d[i + 3] = d[i + 3] > 100 ? 255 : 0; }); };
  const luzPixel = (W, H, alto, bajo) => borde(W, H, 1, (d, i, x, y, v) => { if (v(x - 1, y) || v(x, y - 1)) put(d, i, alto, .55); else if (v(x + 1, y) || v(x, y + 1)) put(d, i, bajo, .45); });
  Object.assign(ARTE, {
    // 16 bits: sombreado de tres tonos con brillo arriba a la izquierda y línea oscura
    pixel: { tec(W, H, S) { px(W, H, (d, i) => { const l = lum(d, i), k = l < .35 ? .7 : l < .7 ? 1 : 1.18; for (let q = 0; q < 3; q++) d[i + q] = Math.min(255, d[i + q] * k); }); luzPixel(W, H, [255, 255, 255], [20, 10, 30]); contorno(W, H, '#1a1028', Math.max(1, S), 4); } },
    // CGA: magenta, cian, blanco y negro, en ajedrez
    // Punto de cruz: cada pedacito del jefe se vuelve una cruz de hilo del color más parecido
    bordado: { tec(W, H, S) {
      if (typeof PUNTO === 'undefined') return;
      const p = Math.max(2, 1.6 * S), d = cx.getImageData(0, 0, W, H).data, cel = [];
      for (let y = 0; y + p / 2 < H; y += p) for (let x = 0; x + p / 2 < W; x += p) { const i = (Math.floor(y + p / 2) * W + Math.floor(x + p / 2)) * 4; if (d[i + 3] > 110) cel.push([x, y, PUNTO.hilo(d[i], d[i + 1], d[i + 2])]); }
      cx.clearRect(0, 0, W, H); PUNTO.bordar(cx, cel, p);
    } },
    // Vapor y engranajes: los jefes se vuelven de latón y cobre, con remaches
    vapor: { tec(W, H, S) { paleta(W, H, ['#1a0c06', '#4a2a18', '#8a4a24', '#c8743a', '#e8b860', '#f6e0a8']); contorno(W, H, '#140804', .8 * S, 10); } },
    // 8 bits: tres colores planos por sprite y contorno negro grueso
    bits8: { tec(W, H, S, o) {
      if (o.tipo === 'mythos') {
        // Conserva la silueta nueva con píxeles grandes y una paleta legible.
        const mini=document.createElement('canvas'), paso=Math.max(1,Math.round(S*1.8));
        mini.width=Math.max(1,Math.ceil(W/paso));mini.height=Math.max(1,Math.ceil(H/paso));
        const m=mini.getContext('2d');m.imageSmoothingEnabled=true;m.drawImage(cv,0,0,mini.width,mini.height);
        cx.save();cx.setTransform(1,0,0,1,0,0);cx.clearRect(0,0,W,H);cx.imageSmoothingEnabled=false;cx.drawImage(mini,0,0,W,H);cx.restore();
        posterizar(W,H,5); contorno(W,H,'#172a29',Math.max(1,S*.7),4);
      } else { posterizar(W, H, 2); contorno(W, H, '#000000', Math.max(1, S), 4); }
    },
      frente(c, o, f, b) { if (Math.floor(f.t * 4) % 2) return; c.fillStyle = '#fcfcfc'; c.fillRect(Math.round(b[2] - 8), Math.round(b[1] + 4), 2, 2); } },
    // 32 bits: sombreado suave con luz de borde, como sprite de los noventa tardíos
    bits32: { tec(W, H, S) { luzPixel(W, H, [255, 240, 200], [30, 20, 60]); px(W, H, (d, i, x, y) => { const k = 1.12 - y / H * .3; for (let q = 0; q < 3; q++) d[i + q] = Math.min(255, d[i + q] * k); }); contorno(W, H, 'rgba(20,10,40,.8)', Math.max(1, S * .8), 6); } },
    // 64 bits: polígonos grandes con sombreado de vértice, como de consola de cartucho 3D
    bits64: { tec(W, H, S, o, f) { if (!(f.g && f.g.vistaJefeNitida)) desenfocar(W, H, .35 * S); posterizar(W, H, 7); facetas(W, H, Math.max(6, 9 * S), .3, 0); contorno(W, H, 'rgba(10,10,30,.75)', .7 * S, 6); } },
  });

  // ---------------- el dibujo con técnica ----------------
  const ESTILO = f => f.st && String(f.st.id || '').split('~')[0];
  // Sprite dibujado por píxeles para que la máscara comparta la escala y
  // la paleta de la consola de 8 bits, también en la vista ampliada.
  function mascara8(c, o, f) {
    const filas = [
      'KK.....................KK',
      'KDK...................KDK',
      '.KDK....KKKKKKKKK....KDK.',
      '.KDDKKKKGGGGGGGGGKKKKDDK.',
      '..KDDKGGGGLLGGGGGGKDDK..',
      '...KKGGGGLYLLGGGGGGKK...',
      '...KGGGGGGLYYLGGGGGGK...',
      '..KGGGGGGGGGLYYGGGGGGK..',
      '..KGGGKKKKKKKKKKKGGGGK..',
      '..KGGKWWWWWWWWWWWKGGGK..',
      '..KGKWWWWWYYWWWWWWKGGK..',
      '..KGKWWWWWYKYWWWWWKGGK..',
      '..KGKWWWWWYKYWWWWWKGGK..',
      '..KGGKWWWWYYWWWWWKGGGK..',
      '...KGGKKKKKKKKKKKGGGK...',
      '...KGGGGGDDDDGGGGGGGK...',
      '....KKGDDKKKDDGDDGKK....',
      '....KDDK.KDK.KDDKDK.....',
      '...KDDK..KDK..KDDKDK....',
      '...KDK...KDK...KDKDK....',
      '..KDK....KDK....KDDK....',
      '..KK.....KDK.....KK.....',
      '.........KK.............'
    ];
    const colores = { K: '#19243b', D: '#235955', G: '#29975e', L: '#6ac478', Y: '#ffca39', W: '#fffdf0' };
    const paso = 2.3, ancho = 25 * paso;
    c.save(); c.translate(Math.round(o.x - ancho / 2), Math.round(o.y - 16 * paso));
    c.imageSmoothingEnabled = false;
    for (let y = 0; y < filas.length; y++) for (let x = 0; x < filas[y].length; x++) {
      const color = colores[filas[y][x]]; if (!color) continue;
      c.fillStyle = color; c.fillRect(Math.round(x * paso), Math.round(y * paso), Math.ceil(paso), Math.ceil(paso));
    }
    // Las piedras laterales flotan por cuadros enteros, como el resto del sprite.
    c.fillStyle = '#19243b'; c.fillRect(-7, 23 + (Math.floor(f.t * 2) % 2) * 2, 6, 6); c.fillRect(ancho + 1, 27 - (Math.floor(f.t * 2) % 2) * 2, 6, 6);
    c.fillStyle = '#6ac478'; c.fillRect(-5, 25 + (Math.floor(f.t * 2) % 2) * 2, 2, 2); c.fillRect(ancho + 3, 29 - (Math.floor(f.t * 2) % 2) * 2, 2, 2);
    c.restore();
  }
  function conArte(k, orig) {
    return function (c, o, f) {
      const id = ESTILO(f), A = ARTE[id], caja = CAJA[k];
      // Las máscaras propias ya están pintadas para su estilo; no se vuelven a filtrar.
      if (k === 'mythos' && typeof MASCARA_ESTILOS !== 'undefined' && MASCARA_ESTILOS.obtener(f)) return orig(c, o, f);
      if (k === 'golem' && (o.modeloMascaron == null || o.modeloMascaron === 1) && typeof MASCARON_ESTILOS !== 'undefined' && MASCARON_ESTILOS.obtener(f.st)) return orig(c, o, f);
      if (k === 'jaguar' && window.BALAM_ESTILOS && window.BALAM_ESTILOS.obtener(f.st)) return orig(c, o, f);
      if (k === 'hadas' && window.XTABAY_ESTILOS && window.XTABAY_ESTILOS.obtener(f.st)) return orig(c, o, f);
      if (k === 'cocodrilo' && window.COCODRILO_ESTILOS && window.COCODRILO_ESTILOS.obtener(f.st)) return orig(c, o, f);
      if (k === 'chaac' && window.CHAAC_ESTILOS && window.CHAAC_ESTILOS.obtener(f.st)) return orig(c, o, f);
      if (!caja || o.sub > .7 && k === 'cocodrilo' && !(o.mordida > 0)) return orig(c, o, f);
      const b = caja(o);
      if (!A) return orig(c, o, f);
      const m = c.getTransform(), S = Math.hypot(m.a, m.b) || 1, pad = (A.pad || 6);
      const xs = [b[0] - pad, b[2] + pad], ys = [b[1] - pad, b[3] + pad]; let X0 = 1e9, Y0 = 1e9, X1 = -1e9, Y1 = -1e9;
      for (const x of xs) for (const y of ys) { const dx = m.a * x + m.c * y + m.e, dy = m.b * x + m.d * y + m.f; X0 = Math.min(X0, dx); Y0 = Math.min(Y0, dy); X1 = Math.max(X1, dx); Y1 = Math.max(Y1, dy); }
      X0 = Math.floor(X0); Y0 = Math.floor(Y0); const W = Math.min(2400, Math.ceil(X1 - X0)), H = Math.min(2400, Math.ceil(Y1 - Y0)); if (W < 2 || H < 2) return orig(c, o, f);
      if (A.atras) { c.save(); A.atras(c, o, f, b); c.restore(); }
      fit(cv, W, H); cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, W, H); cx.globalAlpha = 1; cx.globalCompositeOperation = 'source-over';
      cx.setTransform(m.a, m.b, m.c, m.d, m.e - X0, m.f - Y0);
      // Se procesa como una sola figura para que la cabeza y el cuerpo
      // compartan iluminación y textura en cada mundo.
      orig(cx, o, f);
      cx.setTransform(1, 0, 0, 1, 0, 0); NUC = rgb(o.pal.core); { const k = X.core(o); NX = m.a * k.x + m.c * k.y + m.e - X0; NY = m.b * k.x + m.d * k.y + m.f - Y0; NR = k.r * .9 * S; }
      // Conservar la esclerótica blanca aunque la técnica cambie el color del cuerpo.
      let ojoOriginal = null; if (k === 'mythos' && id !== 'hollin') { try { ojoOriginal = cx.getImageData(0, 0, W, H); } catch (e) { if (e.name !== 'SecurityError') throw e; } }
      try { A.tec(W, H, S, o, f); } catch (e) { /* si una técnica falla, el jefe sale como venía */ }
      if (k === 'serpiente' && id === 'hollin' && o.seg && o.seg.length > 1) {
        // El rojo solo pertenece al ojo, que gira junto con la cabeza.
        const h = o.seg[0], s = o.seg[1], a = Math.atan2(h.y - s.y, h.x - s.x);
        cx.save(); cx.setTransform(m.a, m.b, m.c, m.d, m.e - X0, m.f - Y0);
        cx.translate(h.x, h.y); cx.rotate(a); if (Math.cos(a) < 0) cx.scale(1, -1);
        if (o.stunT > 0) cx.rotate(Math.sin(f.t * 8) * .2);
        cx.fillStyle = '#ff251b'; cx.beginPath(); cx.ellipse(-.75, 1.6, 1.45, 1.2, 0, 0, TAU); cx.fill(); cx.restore();
      }
      if (k === 'cocodrilo' && id === 'hollin') {
        cx.save();cx.setTransform(m.a,m.b,m.c,m.d,m.e-X0,m.f-Y0);
        if(o.mordida>0){cx.translate(o.x,FLOOR+35*(1-o.mordida));cx.rotate(-Math.PI/2);cx.translate(36,.8);}
        else{cx.translate(o.x,FLOOR+(o.sub||0)*16-(o.erg||0)*18);cx.scale(o.face||1,1);cx.rotate(-(o.erg||0)*.5);cx.translate(35.5,-13);}
        cx.fillStyle='#ff251b';cx.beginPath();cx.ellipse(0,0,1.3,.9,0,0,TAU);cx.fill();cx.restore();
      }
      if (ojoOriginal) {
        const im = cx.getImageData(0, 0, W, H), d = im.data, src = ojoOriginal.data;
        for (let y = Math.max(0, Math.floor(NY - 12 * S)); y < Math.min(H, Math.ceil(NY + 12 * S)); y++) for (let x = Math.max(0, Math.floor(NX - 14 * S)); x < Math.min(W, Math.ceil(NX + 14 * S)); x++) {
          const i = (y * W + x) * 4;
          if ((x - NX) ** 2 + (y - NY) ** 2 < (13 * S) ** 2 && src[i + 3] > 240 && Math.min(src[i], src[i + 1], src[i + 2]) > 245) { d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = src[i + 3]; }
        }
        cx.putImageData(im, 0, 0);
      }
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); if (A.glow) { c.shadowColor = A.glow; c.shadowBlur = 4 * S; } c.drawImage(cv, 0, 0, W, H, X0, Y0, W, H); c.restore();
      if (A.frente) { c.save(); A.frente(c, o, f, b); c.restore(); }
    };
  }
  for (const k of Object.keys(X.BODY)) X.BODY[k] = conArte(k, X.BODY[k]);
  // la misma técnica para cualquier dibujo chico (los enemigos): b es la caja en coordenadas del mundo,
  // pintar(ctx) dibuja con la transformación que ya trae; k achica los trazos para lo que es pequeño;
  // pre/post(cx, W, H, S) retocan el lienzo antes/después de la técnica (pixel, vidrio…); sinTecnica: solo el lienzo aparte.
  // Para que alcance con muchos enemigos en pantalla: maxS limita la resolución a la que se procesa, y con cache
  // (un objeto por enemigo) el resultado se vuelve a usar durante «cada» segundos, solo moviéndolo a donde va el enemigo
  function aplicar(c, f, b, pintar, opt = {}) {
    const A = opt.sinTecnica ? null : ARTE[ESTILO(f)]; if (!A && !opt.post && !opt.pre) return false;
    const m = c.getTransform(), S0 = Math.hypot(m.a, m.b) || 1, k = opt.k || 1, pad = ((A && A.pad) || 6) * k;
    let X0 = 1e9, Y0 = 1e9, X1 = -1e9, Y1 = -1e9;
    for (const x of [b[0] - pad, b[2] + pad]) for (const y of [b[1] - pad, b[3] + pad]) { const dx = m.a * x + m.c * y + m.e, dy = m.b * x + m.d * y + m.f; X0 = Math.min(X0, dx); Y0 = Math.min(Y0, dy); X1 = Math.max(X1, dx); Y1 = Math.max(Y1, dy); }
    const C = opt.cache, glow = () => { if (A && A.glow) { c.shadowColor = A.glow; c.shadowBlur = 2 * S0; } };
    if (C && C.cv && C.S0 === S0 && C.A === A && f.t >= C.t && f.t - C.t < (opt.cada || 0)) {
      let x = C.X + (X0 - C.ux), y = C.Y + (Y0 - C.uy); if (opt.entero) { x = Math.round(x); y = Math.round(y); }
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); glow(); c.drawImage(C.cv, 0, 0, C.W, C.H, x, y, C.dW, C.dH); c.restore();
      return true;
    }
    const ux = X0, uy = Y0, r = Math.min(1, (opt.maxS || 1e9) / S0);
    X0 = Math.floor(X0); Y0 = Math.floor(Y0);
    const W = Math.min(1200, Math.ceil((X1 - X0) * r)), H = Math.min(1200, Math.ceil((Y1 - Y0) * r)); if (W < 2 || H < 2) return false;
    fit(cv, W, H); cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, W, H); cx.globalAlpha = 1; cx.globalCompositeOperation = 'source-over'; cx.filter = 'none';
    cx.setTransform(m.a * r, m.b * r, m.c * r, m.d * r, (m.e - X0) * r, (m.f - Y0) * r); pintar(cx);
    cx.setTransform(1, 0, 0, 1, 0, 0); NR = 0; NX = NY = -1e9;
    if (opt.pre) try { opt.pre(cx, W, H, S0 * r); } catch (e) {}
    if (A) try { A.tec(W, H, S0 * r * k, {}, f); } catch (e) { /* si la técnica falla, sale como venía */ }
    if (opt.post) try { opt.post(cx, W, H, S0 * r); } catch (e) {}
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); glow(); c.drawImage(cv, 0, 0, W, H, X0, Y0, W / r, H / r); c.restore();
    if (C) {
      if (!C.cv) C.cv = mkCanvas(W, H); fit(C.cv, W, H); const q = C.cv.getContext('2d'); q.clearRect(0, 0, W, H); q.drawImage(cv, 0, 0);
      // el siguiente repintado cae en otro cuadro para cada enemigo (no todos a la vez)
      Object.assign(C, { W, H, dW: W / r, dH: H / r, X: X0, Y: Y0, ux, uy, S0, A, t: f.t - Math.random() * (opt.cada || 0) * .4 });
    }
    return true;
  }
  window.JEFES_ARTE = { ARTE, CAJA, aplicar, tiene: f => !!ARTE[ESTILO(f)] };
})();
