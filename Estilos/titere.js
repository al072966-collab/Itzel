'use strict';
// =====================================================================
//  TÍTERES
//  Anima una ilustración cortada en piezas (tools/titeres.py). Cada pieza se
//  dibuja donde iba en el dibujo original, así que sin giros se ve igual
//  que la ilustración; las poses solo la giran desde sus articulaciones.
//  El estado (fase de la carrera, muelles del pelo) vive por personaje y
//  se avanza con el tiempo del dibujo.
// =====================================================================
const TITERE = (() => {
  function carga(d) { return { img: imgPerezosa(d.ruta), q: d.piezas }; }
  const listo = T => T.img.complete && T.img.naturalWidth > 0;
  function pon(c, T, n) { const q = T.q[n]; if (q) c.drawImage(T.img, q[0], q[1], q[2], q[3], q[4], q[5], q[6], q[7]); }
  function gira(c, x, y, a) { c.translate(x, y); c.rotate(a); c.translate(-x, -y); }
  // varias partes del juego pasan un objeto nuevo en cada cuadro: el estado se guarda por partida y por personaje
  const FIJOS = {};
  function estado(p, f, nuevo, mapa) {
    const k = p.titere ? FIJOS[p.titere] || (FIJOS[p.titere] = {}) : f.g || f.st || p; let s = mapa.get(k); if (!s) { s = nuevo(); s.t = f.t || 0; mapa.set(k, s); }
    s.dt = clamp((f.t || 0) - s.t, 0, .05); s.t = f.t || 0; return s;
  }
  // se acerca a su meta con un resorte; sobrepasa un poco, como el pelo o la tela
  function muelle(s, n, meta, k, fr) {
    const v = n + 'v', d = s.dt; if (s[n] === undefined) { s[n] = meta; s[v] = 0; } if (!d) return s[n];
    s[v] += (meta - s[n]) * k * d; s[v] *= Math.exp(-fr * d); s[n] += s[v] * d; return s[n];
  }
  const suave = (s, n, meta, r) => { if (s[n] === undefined) s[n] = meta; s[n] += (meta - s[n]) * Math.min(1, s.dt * r); return s[n]; };
  // falda: renglón por renglón, cada uno se corre y se abre; la orilla ondula sin costuras
  // alto(v): a qué altura queda cada renglón (v = 0 en la cintura, 1 en la orilla). Un número estira o recoge parejo;
  // una función puede recoger más la orilla que la cintura, como tela que se levanta
  function renglones(c, T, n, cx, y0, y1, N, fn, alto = 1) {
    const q = T.q[n]; if (!q) return; const hs = q[3] / N, hd = q[7] / N, F = typeof alto === 'number' ? v => v * alto : alto, Y = y => y0 + (y1 - y0) * F((y - y0) / (y1 - y0));
    for (let j = 0; j < N; j++) {
      const [dx, sx] = fn(clamp((q[5] + (j + .5) * hd - y0) / (y1 - y0), 0, 1)), x = cx + (q[4] - cx) * sx + dx, w = q[6] * sx, ya = Y(q[5] + j * hd), yb = Y(q[5] + (j + 1) * hd);
      c.drawImage(T.img, q[0], q[1] + j * hs, q[2], hs + .4, x, ya, w, yb - ya + .9);
    }
  }
  // malla: una pieza que se dobla. Es una tira de triángulos alrededor de una línea; la línea se mueve y la imagen la sigue
  function normales(P) { return P.map((p, i) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1; return [-dy / d, dx / d]; }); }
  function bordes(P, l, r) { const N = normales(P); return [P.map((p, i) => [p[0] + N[i][0] * l[i], p[1] + N[i][1] * l[i]]), P.map((p, i) => [p[0] - N[i][0] * r[i], p[1] - N[i][1] * r[i]])]; }
  function prepara(m) { [m.A, m.B] = bordes(m.n, m.l, m.r); return m; }
  function tri(c, T, q, ex, s0, s1, s2, d0, d1, d2) {
    const ax = s1[0] - s0[0], ay = s1[1] - s0[1], bx = s2[0] - s0[0], by = s2[1] - s0[1], det = ax * by - ay * bx; if (Math.abs(det) < 1e-3) return;
    const ux = d1[0] - d0[0], uy = d1[1] - d0[1], vx = d2[0] - d0[0], vy = d2[1] - d0[1];
    const A = (ux * by - vx * ay) / det, B = (uy * by - vy * ay) / det, C = (vx * ax - ux * bx) / det, D = (vy * ax - uy * bx) / det;
    const mx = (d0[0] + d1[0] + d2[0]) / 3, my = (d0[1] + d1[1] + d2[1]) / 3, sale = p => { const dx = p[0] - mx, dy = p[1] - my, k = 1 + ex / (Math.hypot(dx, dy) || 1); return [mx + dx * k, my + dy * k]; }, a = sale(d0), b = sale(d1), e = sale(d2);
    c.save(); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(e[0], e[1]); c.closePath(); c.clip();
    c.transform(A, B, C, D, d0[0] - A * s0[0] - C * s0[1], d0[1] - B * s0[0] - D * s0[1]);
    const m = ex * 2 + 8, x0 = Math.max(q[4], Math.min(s0[0], s1[0], s2[0]) - m), y0 = Math.max(q[5], Math.min(s0[1], s1[1], s2[1]) - m), x1 = Math.min(q[4] + q[6], Math.max(s0[0], s1[0], s2[0]) + m), y1 = Math.min(q[5] + q[7], Math.max(s0[1], s1[1], s2[1]) + m);
    if (x1 > x0 && y1 > y0) { const kx = q[2] / q[6], ky = q[3] / q[7]; c.drawImage(T.img, q[0] + (x0 - q[4]) * kx, q[1] + (y0 - q[5]) * ky, (x1 - x0) * kx, (y1 - y0) * ky, x0, y0, x1 - x0, y1 - y0); }
    c.restore();
  }
  // ancho: más gruesa que el dibujo, sin cambiar el largo. Un número es parejo; una función recibe u (0 en la raíz, 1 en la punta)
  function malla(c, T, n, m, Q, ancho = 1) {
    const q = T.q[n]; if (!q) return; const k = typeof ancho === 'function' ? i => ancho(i / (m.n.length - 1)) : () => ancho, [A, B] = bordes(Q, ancho === 1 ? m.l : m.l.map((v, i) => v * k(i)), ancho === 1 ? m.r : m.r.map((v, i) => v * k(i))), t = c.getTransform(), ex = 1.25 / (Math.hypot(t.a, t.b) || 1);
    for (let i = 0; i + 1 < Q.length; i++) { tri(c, T, q, ex, m.A[i], m.B[i], m.A[i + 1], A[i], B[i], A[i + 1]); tri(c, T, q, ex, m.B[i], m.B[i + 1], m.A[i + 1], B[i], B[i + 1], A[i + 1]); }
  }
  // mundos de pixel: el títere se pinta chiquito, sin medios tonos en la orilla, y se pega al lienzo
  const pxCv = mkCanvas(1, 1), pxCx = pxCv.getContext('2d', { willReadFrequently: true });
  function enPixel(c, x, y, W, H, px, dibuja) {
    const w = Math.ceil(W * px), h = Math.ceil(H * px); if (pxCv.width !== w || pxCv.height !== h) { pxCv.width = w; pxCv.height = h; }
    const bx = Math.round(x - W / 2), by = Math.round(y - H);
    pxCx.setTransform(1, 0, 0, 1, 0, 0); pxCx.clearRect(0, 0, w, h); pxCx.setTransform(px, 0, 0, px, -bx * px, -by * px); pxCx.imageSmoothingEnabled = true; pxCx.imageSmoothingQuality = 'high';
    dibuja(pxCx);
    const im = pxCx.getImageData(0, 0, w, h), d = im.data; for (let i = 3; i < d.length; i += 4) d[i] = d[i] < 120 ? 0 : 255; pxCx.putImageData(im, 0, 0);
    c.save(); c.imageSmoothingEnabled = false; c.drawImage(pxCv, bx, by, W, H); c.restore();
  }
  const esPixel = f => !!(f.st && f.st.pixel);
  return { carga, listo, pon, gira, estado, muelle, suave, renglones, enPixel, esPixel, malla, prepara };
})();
