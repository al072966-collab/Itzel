'use strict';
// =====================================================================
//  PUNTO DE CRUZ · el mundo bordado
//  Todo está bordado sobre manta tensada en un bastidor: cada cosa es una
//  cruz de hilo de algodón (la hebra de abajo en sombra, la de arriba con
//  brillo), con contornos en punto atrás. Así se bordan las flores de los
//  hipiles de la península: en maya, xokbil chuy, «hilo contado».
//  PUNTO.aPunto convierte cualquier dibujo en cruces: se pinta chiquito,
//  cada pixel se vuelve una puntada y su color, el hilo más parecido.
// =====================================================================
const PUNTO = (() => {
  // los hilos de la madeja (algodón de colores, como en los hipiles)
  const HILOS = ['#f6f0e2', '#2a2228', '#c8203a', '#e8607a', '#ffb3c8', '#f2b51f', '#e8742a', '#3f8f4a', '#86c25a', '#1f5f3a', '#2f5fa8', '#6aaee0', '#7a3f9a',
    '#7a4a2a', '#c98a5c', '#e8b48a', '#9b2a2a', '#ff4f95', '#ffd9e6', '#d8d0bc', '#5a5560'];
  const RGB = HILOS.map(hex), memo = new Map();
  function hilo(r, g, b) {
    const k = (r >> 3) << 10 | (g >> 3) << 5 | (b >> 3); let c = memo.get(k); if (c) return c;
    let mejor = 0, md = 1e9;
    for (let i = 0; i < RGB.length; i++) { const [R2, G2, B2] = RGB[i], dr = r - R2, dg = g - G2, db = b - B2, d = 2 * dr * dr + 4 * dg * dg + 3 * db * db; if (d < md) { md = d; mejor = i; } }
    c = HILOS[mejor]; memo.set(k, c); return c;
  }
  const SOMBRA = new Map(), BRILLO = new Map();
  const sombra = c => SOMBRA.get(c) || (SOMBRA.set(c, mix(c, '#1a1014', .35)), SOMBRA.get(c));
  const brillo = c => BRILLO.get(c) || (BRILLO.set(c, mix(c, '#ffffff', .45)), BRILLO.get(c));
  // borda una lista de puntadas [x, y, color] de tamaño p (agrupadas por color: pocas pinceladas)
  function bordar(ctx, celdas, p) {
    const porColor = new Map();
    for (const c of celdas) { let l = porColor.get(c[2]); if (!l) porColor.set(c[2], l = []); l.push(c); }
    const a = p * .14, lw = p * .44;
    ctx.lineCap = 'round';
    // sombrita bajo cada cruz: le da cuerpo al hilo sobre la tela
    ctx.fillStyle = 'rgba(60,40,30,.16)'; ctx.beginPath(); for (const c of celdas) ctx.rect(c[0] + p * .2, c[1] + p * .3, p * .9, p * .9); ctx.fill();
    for (const [col, l] of porColor) {
      ctx.strokeStyle = sombra(col); ctx.lineWidth = lw; ctx.beginPath(); for (const [x, y] of l) { ctx.moveTo(x + a, y + a); ctx.lineTo(x + p - a, y + p - a); } ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); for (const [x, y] of l) { ctx.moveTo(x + p - a, y + a); ctx.lineTo(x + a, y + p - a); } ctx.stroke();
      ctx.strokeStyle = brillo(col); ctx.lineWidth = lw * .32; ctx.beginPath(); for (const [x, y] of l) { ctx.moveTo(x + p - a * 1.6, y + a * 2.2); ctx.lineTo(x + a * 2.6, y + p * .55); } ctx.stroke();
    }
  }
  // punto atrás: contornos de hilo oscuro, puntada por puntada
  function puntoAtras(ctx, pts, p, col = '#2a2228', lw) {
    ctx.strokeStyle = col; ctx.lineWidth = lw || p * .32; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; ctx.moveTo(x0 + (x1 - x0) * .08, y0 + (y1 - y0) * .08); ctx.lineTo(x1 - (x1 - x0) * .08, y1 - (y1 - y0) * .08); }
    ctx.stroke();
  }
  // la manta: tejido con sus agujeritos en cuadrícula (la tela aida)
  function manta(ctx, x0, y0, w, h, p, base = '#efe6d0') {
    ctx.fillStyle = base; ctx.fillRect(x0, y0, w, h);
    ctx.fillStyle = 'rgba(120,96,70,.13)'; ctx.beginPath();
    const ox = Math.ceil(x0 / p) * p, oy = Math.ceil(y0 / p) * p;
    for (let y = oy; y < y0 + h; y += p) for (let x = ox; x < x0 + w; x += p) ctx.rect(x - p * .14, y - p * .14, p * .28, p * .28);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); for (let y = oy; y < y0 + h; y += p) ctx.rect(x0, y + p * .45, w, p * .12); ctx.fill();
  }
  // convierte un dibujo en puntadas: se pinta en chiquito y cada pixel es una cruz
  const lienzo = mkCanvas(1, 1), lx = lienzo.getContext('2d', { willReadFrequently: true });
  function celdasDe(w, h, p, dibuja, ox = 0, oy = 0) {
    const W = Math.max(1, Math.ceil(w / p)), H = Math.max(1, Math.ceil(h / p));
    if (lienzo.width < W || lienzo.height < H) { lienzo.width = Math.max(lienzo.width, W); lienzo.height = Math.max(lienzo.height, H); }
    lx.setTransform(1, 0, 0, 1, 0, 0); lx.clearRect(0, 0, W, H); lx.imageSmoothingEnabled = true;
    lx.setTransform(1 / p, 0, 0, 1 / p, 0, 0); dibuja(lx);
    const d = lx.getImageData(0, 0, W, H).data, o = [];
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const q = (j * W + i) * 4; if (d[q + 3] > 110) o.push([ox + i * p, oy + j * p, hilo(d[q], d[q + 1], d[q + 2])]); }
    return o;
  }
  function aPunto(ctx, x, y, w, h, p, dibuja) { bordar(ctx, celdasDe(w, h, p, c => { c.translate(-x, -y); dibuja(c); }, x, y), p); }
  // un personaje en punto de cruz (como pixelSprite, pero cada pixel es una cruz)
  function sprite(fn, o) {
    const W = o.w || 30, H = o.h || 32, oy = o.oy ?? H - 4, p = o.p || 1.5;
    return (ctx, a, f) => {
      const ax = Math.round(a.x / p) * p, ay = Math.round(a.y / p) * p;
      const cel = celdasDe(W, H, p, c => { c.translate(W / 2 - ax, oy - ay); fn(c, a, f); }, ax - W / 2, ay - oy);
      bordar(ctx, cel, p);
    };
  }
  return { HILOS, hilo, bordar, puntoAtras, manta, celdasDe, aPunto, sprite, sombra, brillo };
})();

(() => {
  const R = (i, s) => hash1(i, s), P = 2;
  const FACH = ['#e8607a', '#f2b51f', '#6aaee0', '#86c25a', '#e8742a', '#ffb3c8', '#c98a5c'];
  // patrón de la cenefa del suelo según qué tan hondo va (en puntadas desde la orilla)
  function cenefa(i, d) {
    if (d === 0) return R(i, 3) < .14 ? '#c8203a' : '#3f8f4a';            // pasto con florecitas rojas
    if (d === 1) return R(i, 4) < .5 ? '#86c25a' : '#3f8f4a';
    if (d === 2 || d === 6) return '#2a2228';                                  // líneas de la greca
    if (d > 2 && d < 6) { const z = (i + (d - 3) * 2) % 8; return z < 2 || (z > 4 && z < 7) ? '#c8203a' : '#f2b51f'; }
    const r = ((i % 8) + 8) % 8, k = (d - 7) % 8, rombo = Math.abs(r - 3.5) + Math.abs(k - 3.5) < 3.2;
    return rombo ? (Math.abs(r - 3.5) + Math.abs(k - 3.5) < 1.6 ? '#f2b51f' : '#2f5fa8') : '#7a4a2a';
  }
  PUNTO.cenefa = cenefa;
  defStyle({
    id: 'bordado', name: 'Punto de cruz', ref: 'Hipiles de la península · xokbil chuy · manta en bastidor', order: 48,
    desc: 'Todo bordado en punto de cruz sobre manta en bastidor: cada cosa es una cruz de hilo de algodón, con contornos en punto atrás y los colores de las flores de los hipiles.',
    fx: { dust: ['#d8d0bc', '#c98a5c'], spark: ['#c8203a', '#f2b51f', '#ffffff'], confetti: ['#c8203a', '#f2b51f', '#3f8f4a', '#2f5fa8', '#e8607a'] },
    sky(ctx, f) {
      screenLayer(ctx, f, 'manta', x => {
        PUNTO.manta(x, 0, 0, VW, VH, P);
        // la cenefa de arriba y el sol bordado
        const arriba = []; for (let i = 0; i < VW / P; i++) for (let j = 0; j < 5; j++) { const z = (i + j) % 6, w = (i - j + 60) % 6; if (j === 0 || j === 4) arriba.push([i * P, 8 + j * P, '#2f5fa8']); else if (z === 0 || w === 0) arriba.push([i * P, 8 + j * P, '#c8203a']); }
        PUNTO.bordar(x, arriba, P);
        PUNTO.aPunto(x, 300, 26, 60, 60, P, c => { c.fillStyle = '#f2b51f'; c.beginPath(); c.arc(330, 56, 15, 0, TAU); c.fill(); c.fillStyle = '#e8742a'; for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; c.beginPath(); c.arc(330 + Math.cos(a) * 21, 56 + Math.sin(a) * 21, 2.4, 0, TAU); c.fill(); } });
        for (const [cx, cy, w] of [[70, 50, 46], [190, 36, 34], [250, 70, 28]]) PUNTO.aPunto(x, cx - w, cy - 14, w * 2, 28, P, c => { c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(cx, cy, w * .7, 7, 0, 0, TAU); c.ellipse(cx - w * .3, cy - 4, w * .35, 7, 0, 0, TAU); c.ellipse(cx + w * .25, cy - 5, w * .3, 6, 0, 0, TAU); c.fill(); c.fillStyle = '#6aaee0'; c.fillRect(cx - w * .7, cy + 4, w * 1.4, 2.4); });
      });
      // Campeche bordado al fondo: casas de colores, la catedral y la muralla
      strip(ctx, f, 'ciudad', .15, (x, w) => {
        const cel = [];
        for (let i = 0; i < w / P; i++) {
          const wx = i * P, top = 178 - CAMP.h(wx, 'mid', 21) * 1.5, seg = CAMP.seg(wx, 'mid', 21), fa = seg.t === 'casas' ? seg.fac.find(q => wx >= q.x0 && wx < q.x0 + q.w) : null;
          for (let y = Math.ceil(top / P) * P; y < 186; y += P) {
            let c = seg.t === 'catedral' ? '#d8d0bc' : seg.t === 'muralla' || seg.t === 'baluarte' ? '#c98a5c' : fa ? FACH[fa.col % FACH.length] : '#d8d0bc';
            if (fa && (y - top) > 6 && ((wx - fa.x0) % 8 < 3) && ((y - top) % 12 < 5)) c = '#2f5fa8';
            if (y - top < P * 1.5) c = PUNTO.sombra(c);
            cel.push([wx, y, c]);
          }
        }
        PUNTO.bordar(x, cel, P);
      });
      strip(ctx, f, 'palmas', .32, (x, w) => {
        for (const q of CAMP.props(0, w, 'near', 31)) PUNTO.aPunto(x, q.x - 34, 120, 68, 72, P, c => { c.beginPath(); CAMP.palma(c, q.x, 192, q.h * .9, q.lean, q.s, 0); c.fillStyle = '#3f8f4a'; c.fill(); c.beginPath(); CAMP.palma(c, q.x, 192, q.h * .9, q.lean, q.s, 0, 'trunk'); c.fillStyle = '#7a4a2a'; c.fill(); });
      });
      // fragatas bordadas que cruzan despacio
      for (let k = 0; k < (window.FAUNA_ARTE?.listo('fragataBordada') ? 3 : 0); k++) { const fx = wrap(80 + k * 140 - f.t * (5 + k * 2) - f.cam * .05, VW + 40) - 20, fy = 40 + k * 14; FAUNA_ARTE.dib(ctx, 'fragataBordada', f.t * .7 + k * .5, fx, fy, { w: 11 - k, ay: .5, fps: 4, seq: [3, 1, 0, 1, 3, 2], voltea: true }); }
    },
    terrain(ctx) {
      // la superficie de cada columna, para saber qué tan hondo va cada puntada
      const cel = [], cols = Math.ceil(L.ww / P), rows = Math.ceil((VH + 8) / P);
      for (let i = 0; i < cols; i++) {
        let d = -1;
        for (let j = 0; j < rows; j++) {
          const x = i * P + .5, y = j * P + .5;
          if (!L.solid(Math.floor(x / T), Math.floor(y / T))) { d = -1; continue; }
          d++; cel.push([i * P, j * P, cenefa(i, d)]);
        }
      }
      PUNTO.bordar(ctx, cel, P);
      // contorno en punto atrás donde termina la tierra
      ctx.strokeStyle = '#2a2228'; ctx.lineWidth = .7; ctx.beginPath();
      for (let cx = 0; cx < L.gw; cx++) for (let cy = 0; cy < 17; cy++) {
        if (!L.solid(cx, cy)) continue; const x = cx * T, y = cy * T;
        if (!L.solid(cx, cy - 1)) for (let s = 0; s < T; s += 4) { ctx.moveTo(x + s + .4, y - .2); ctx.lineTo(x + s + 3.4, y - .2); }
        if (!L.solid(cx - 1, cy)) for (let s = 0; s < T; s += 4) { ctx.moveTo(x - .2, y + s + .4); ctx.lineTo(x - .2, y + s + 3.4); }
        if (!L.solid(cx + 1, cy)) for (let s = 0; s < T; s += 4) { ctx.moveTo(x + T + .2, y + s + .4); ctx.lineTo(x + T + .2, y + s + 3.4); }
      }
      ctx.stroke();
      for (const o of L.deco) {
        const x = o.x, y = o.y;
        if (o.k === 'T') PUNTO.aPunto(ctx, x - 34, y - 64, 68, 66, P, c => { c.beginPath(); CAMP.ceiba(c, x, y + 1, 54 + R(o.i, 1) * 10, 44, o.i, 'crown'); c.fillStyle = o.i % 2 ? '#3f8f4a' : '#86c25a'; c.fill(); c.beginPath(); CAMP.ceiba(c, x, y + 1, 54 + R(o.i, 1) * 10, 44, o.i, 'trunk'); c.fillStyle = '#7a4a2a'; c.fill(); });
        else if (o.k === 'f') PUNTO.aPunto(ctx, x - 8, y - 14, 16, 14, P, c => { c.fillStyle = '#3f8f4a'; c.fillRect(x - .5, y - 9, 1.6, 9); c.fillStyle = o.i % 2 ? '#c8203a' : '#e8607a'; c.beginPath(); c.arc(x, y - 10, 3.4, 0, TAU); c.fill(); c.fillStyle = '#f2b51f'; c.beginPath(); c.arc(x, y - 10, 1.2, 0, TAU); c.fill(); });
        else if (o.k === 'r') PUNTO.aPunto(ctx, x - 10, y - 10, 20, 10, P, c => { c.fillStyle = '#d8d0bc'; c.beginPath(); c.ellipse(x, y, 9, 8, 0, Math.PI, 0); c.fill(); });
      }
    },
    player(ctx, p, f) { drawItzel(ctx, p, f, {}); },
    coin(ctx, x, y, t) {
      const yy = Math.round((y + Math.sin(t * 2.6 + x) * 1.5) / 1.4) * 1.4, X = Math.round(x / 1.4) * 1.4, p = 1.4, cel = [];
      const m = ['..g..', '.ooo.', 'oyyoo', 'ooooo', '.ooo.'], col = { g: '#3f8f4a', o: '#e8742a', y: '#f2b51f' };
      m.forEach((r, j) => [...r].forEach((ch, i) => { if (col[ch]) cel.push([X + (i - 2.5) * p, yy + (j - 2.5) * p, col[ch]]); }));
      PUNTO.bordar(ctx, cel, p);
    },
    goal(ctx, x, y, t) {
      // la flor grande del hipil, bordada en su tallo
      const s = 1 + Math.sin(t * 2) * .04;
      PUNTO.aPunto(ctx, x - 22, y - 62, 44, 64, 2, c => {
        c.fillStyle = '#3f8f4a'; c.fillRect(x - 1, y - 40, 2.4, 40); c.beginPath(); c.ellipse(x - 6, y - 18, 7, 3, -.5, 0, TAU); c.ellipse(x + 7, y - 26, 7, 3, .5, 0, TAU); c.fill();
        for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; c.fillStyle = k % 2 ? '#c8203a' : '#e8607a'; c.beginPath(); c.ellipse(x + Math.cos(a) * 9 * s, y - 46 + Math.sin(a) * 9 * s, 7, 4.4, a, 0, TAU); c.fill(); }
        c.fillStyle = '#f2b51f'; c.beginPath(); c.arc(x, y - 46, 4.4, 0, TAU); c.fill();
      });
    },
    over(ctx, f) { vignette(ctx, .22, '#5a3a20', .55); },
  });
  // Itzel con su hipil de flores y Fresita, las dos en punto de cruz
  setChar('bordado', PUNTO.sprite(I({ lw: .7, line: '#2a2228', blouse: '#f6f0e2', emb: ['#c8203a', '#f2b51f', '#3f8f4a', '#2f5fa8'], shorts: '#2f5fa8', shoes: '#c8203a', bow: '#c8203a', pack: '#e8742a', eye: '#2a2228', skin: '#c98a5c', hair: '#2a2228' }), { w: 30, h: 32, oy: 27, p: 1.5 }),
    PUNTO.sprite(F({ lw: .7, line: '#9b2a2a', glowA: 0 }), { w: 30, h: 22, oy: 11, p: 1.5 }));
  if (typeof MUNDOS !== 'undefined' && !MUNDOS.includes('bordado')) MUNDOS.push('bordado');
})();
