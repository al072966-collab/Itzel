'use strict';
// =====================================================================
//  GANCHOS: para agregarle algo a una función del juego sin reasignarla a mano.
//    GANCHOS.en('startLevel', sig => function (...a) { /* antes */ const r = sig.apply(this, a); /* después */ return r; });
//  `sig` es lo que había (la función original o el gancho anterior). Antes cada archivo hacía
//  `const _x = x; x = function () { … _x() … }` y dependía de cargarse después de x; aquí:
//    · se puede registrar antes de que la función exista: se instala en cuanto aparece;
//    · { orden: n } fija quién envuelve a quién sin depender del orden de los <script> (menor = más adentro;
//      con el mismo orden, el que se registró primero queda más adentro, como antes);
//    · GANCHOS.lista() dice qué está enganchado y por quién, y GANCHOS.sueltos() lo que nunca encontró su función.
// =====================================================================
const GANCHOS = (() => {
  const TODOS = {};
  const quien = () => { const s = document.currentScript; return s ? s.src.split('/').pop().split('?')[0] : '(consola)'; };
  function arma(g) { let f = g.base; for (const c of g.capas) f = c.fabrica(f); g.fn = f; }
  function instala(nombre) {
    const g = TODOS[nombre]; if (!g || g.puesto || typeof window[nombre] !== 'function') return;
    g.base = window[nombre]; g.puesto = true; arma(g);
    window[nombre] = function () { return g.fn.apply(this, arguments); };
  }
  function en(nombre, fabrica, o = {}) {
    const g = TODOS[nombre] || (TODOS[nombre] = { capas: [], base: null, fn: null, puesto: false, n: 0 });
    g.capas.push({ fabrica, orden: o.orden || 0, n: g.n++, de: quien() }); g.capas.sort((a, b) => a.orden - b.orden || a.n - b.n);
    if (g.puesto) arma(g); else instala(nombre);
  }
  // lo que se registró antes de que su función existiera se instala al terminar de cargar la página
  const pendientes = () => { for (const k of Object.keys(TODOS)) instala(k); };
  if (typeof addEventListener === 'function') { addEventListener('DOMContentLoaded', pendientes); addEventListener('load', pendientes); }
  const lista = () => Object.fromEntries(Object.entries(TODOS).map(([k, g]) => [k, g.capas.map(c => c.de)]));
  const sueltos = () => Object.keys(TODOS).filter(k => !TODOS[k].puesto);
  return { en, pendientes, lista, sueltos };
})();
// =====================================================================
//  Taller de estilos — motor compartido
//  Un solo nivel cortito; cada estilo solo decide COMO se dibuja.
//  Unidades de mundo: loseta T=16, vista VW x VH (16:9).
// =====================================================================
const T = 16, VW = 427, VH = 240, TAU = Math.PI * 2;
// en el juego la vista puede ser más alta que VH (ventanas menos anchas que 16:9): se ve el mundo de
// ALTO_MUNDO px arriba de la fila 0. Todo lo que pintan los estilos sigue usando el cuadro de VH.
const ALTO_MUNDO = 64;

// ---------- utilidades numericas ----------
function hash1(i, s) {
  let h = Math.imul(i | 0, 374761393) ^ Math.imul((s | 0) + 1013, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function hash2(x, y, s) { return hash1(Math.imul(x | 0, 73856093) ^ Math.imul(y | 0, 19349663), s); }
function noise1(x, s) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash1(i, s) * (1 - u) + hash1(i + 1, s) * u; }
function noise2(x, y, s) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy, s), b = hash2(ix + 1, iy, s), c = hash2(ix, iy + 1, s), d = hash2(ix + 1, iy + 1, s);
  return (a * (1 - ux) + b * ux) * (1 - uy) + (c * (1 - ux) + d * ux) * uy;
}
function fbm1(x, s, o = 4) { let a = .5, t = 0, n = 0, fr = 1; for (let i = 0; i < o; i++) { t += noise1(x * fr, s + i * 31) * a; n += a; a *= .5; fr *= 2.03; } return t / n; }
function fbm2(x, y, s, o = 4) { let a = .5, t = 0, n = 0, fr = 1; for (let i = 0; i < o; i++) { t += noise2(x * fr, y * fr, s + i * 31) * a; n += a; a *= .5; fr *= 2.03; } return t / n; }
function rng(seed) { let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// ---------- color ----------
function hex(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function toHex(r, g, b) { return '#' + ((1 << 24) | (clamp(Math.round(r), 0, 255) << 16) | (clamp(Math.round(g), 0, 255) << 8) | clamp(Math.round(b), 0, 255)).toString(16).slice(1); }
function mix(a, b, t) { const A = hex(a), B = hex(b); return toHex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)); }
function rgba(h, a) { const c = hex(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }
function shade(h, k) { return k >= 0 ? mix(h, '#ffffff', k) : mix(h, '#000000', -k); }
function jitterColor(h, amt, r) { const c = hex(h), d = (r - .5) * 2 * amt * 255; return toHex(c[0] + d, c[1] + d, c[2] + d); }

// Una imagen que no se pide al servidor hasta que alguien pregunta si ya llegó (complete / naturalWidth).
// Así los dibujos de Itzel de los 35 mundos no se bajan todos al abrir el juego: solo los del mundo que se juega.
// Quien la usa debe preguntar antes de dibujarla (if (!img.complete || !img.naturalWidth) …), como ya se hacía.
function imgPerezosa(ruta) {
  const img = new Image(); img.decoding = 'async'; let pedida = false;
  if (new URLSearchParams(location.search).has('demo')) (window.imagenesDemoPerezosas ||= []).push(img);
  // de los dibujos de personajes hay copia ligera en WebP (tools/personajes-webp.py); si falta, se pide el PNG
  const ligera = /assets\/personajes\/(?!cine\/).*\.png$/.test(ruta) ? ruta.replace(/\.png$/, '.webp') : null;
  if (ligera) img.onerror = () => { img.onerror = null; img.src = ruta; };
  const pide = () => { if (pedida) return; pedida = true; img.demoPedida = true; delete img.complete; delete img.naturalWidth; img.src = ligera || ruta; };
  Object.defineProperty(img, 'complete', { configurable: true, get() { pide(); return false; } });
  Object.defineProperty(img, 'naturalWidth', { configurable: true, get() { pide(); return 0; } });
  img.pide = pide; return img;
}
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }

// =====================================================================
//  NIVEL (construido por segmentos, no a mano letra por letra)
// =====================================================================
const LEVEL_DEF = {
  w: 100, h: 15,
  ground: [[0, 14, 11], [18, 33, 11], [24, 33, 10], [37, 50, 11], [42, 44, 9], [54, 70, 11], [58, 70, 10], [62, 70, 9], [74, 99, 11], [80, 84, 10]],
  islands: [[27, 31, 6, 7], [60, 64, 4, 5], [88, 90, 6, 6]],
  coins: [[15, 9], [16, 8], [17, 9], [28, 5], [29, 4.6], [30, 5], [35, 8], [43, 7], [52, 8], [61, 3], [62, 2.6], [63, 3], [82, 8], [89, 4.5]],
  deco: [['f', 2], ['T', 6], ['f', 9], ['r', 12], ['f', 20], ['T', 26], ['r', 32], ['f', 29, 6], ['f', 38], ['T', 40], ['f', 46], ['T', 48], ['r', 56], ['f', 60], ['T', 67], ['f', 62, 4], ['f', 76], ['T', 79], ['r', 86], ['f', 83], ['T', 89, 6], ['f', 95], ['T', 97]],
  start: 3, goal: 93,
};
const PAD = 6;

let LEVEL_ID = 0;
function buildLevel(def) {
  const gw = def.w + PAD * 2, gh = def.h + 3;
  const grid = new Uint8Array(gw * gh);
  const raw = def.raw || new Uint8Array(def.w * def.h);
  if (!def.raw) {
    for (const [x0, x1, top] of def.ground) for (let x = x0; x <= x1; x++) for (let y = top; y < def.h; y++) raw[y * def.w + x] = 1;
    for (const [x0, x1, y0, y1] of def.islands) for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) raw[y * def.w + x] = 1;
  }
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    const sx = clamp(x - PAD, 0, def.w - 1), sy = Math.min(y, def.h - 1);
    grid[y * gw + x] = raw[sy * def.w + sx];
  }
  const L = { id: ++LEVEL_ID, gw, gh, grid, ww: gw * T, wh: gh * T, camMin: PAD * T, camMax: (PAD + def.w) * T - VW };
  L.solid = (cx, cy) => cx >= 0 && cy >= 0 && cx < gw && cy < gh && grid[cy * gw + cx] === 1;
  L.surfaceY = (cx, fromRow = 0) => { for (let y = fromRow; y < gh; y++) if (L.solid(cx, y)) return y; return gh; };
  // superficie (fila vacia arriba) mas cercana por encima de (x,y) en unidades de mundo
  L.depth = (x, y) => { const cx = Math.floor(x / T); let cy = Math.floor(y / T); if (!L.solid(cx, cy)) return -1; while (cy > 0 && L.solid(cx, cy - 1)) cy--; return y - cy * T; };
  L.coins = def.coins.map(([x, y]) => ({ x: (x + PAD + .5) * T, y: (y + .5) * T }));
  L.deco = def.deco.map(([k, x, row]) => { const cx = x + PAD; const top = L.surfaceY(cx, row === undefined ? 0 : row); return { k, x: (cx + .5) * T, y: top * T, i: x }; });
  L.start = { x: (def.start + PAD + .5) * T, y: L.surfaceY(def.start + PAD, def.startRow || 0) * T };
  L.goal = { x: (def.goal + PAD + .5) * T, y: L.surfaceY(def.goal + PAD, def.goalRow || 0) * T };
  L.extra = (def.extra || []).map(([k, x, row]) => { const cx = x + PAD; return { k, x: (cx + .5) * T, y: L.surfaceY(cx, row) * T, cy: (row + .5) * T }; });
  // tramos superiores y bajos expuestos
  L.tops = []; L.bottoms = [];
  for (let y = 0; y < gh; y++) {
    let run = -1, runB = -1;
    for (let x = 0; x <= gw; x++) {
      const top = x < gw && L.solid(x, y) && !L.solid(x, y - 1);
      if (top && run < 0) run = x; if (!top && run >= 0) { L.tops.push({ x0: run * T, x1: x * T, y: y * T }); run = -1; }
      const bot = x < gw && L.solid(x, y) && !L.solid(x, y + 1) && y + 1 < gh;
      if (bot && runB < 0) runB = x; if (!bot && runB >= 0) { L.bottoms.push({ x0: runB * T, x1: x * T, y: (y + 1) * T }); runB = -1; }
    }
  }
  // los adornos van bien parados sobre su piso: nada sobre el vacío y nada que sobresalga de la orilla
  // (un árbol a media casilla del borde se veía colgando sobre el hueco). Se recorren hacia adentro y,
  // si el piso es demasiado corto para un árbol, el árbol no se pone.
  L.deco = L.deco.filter(o => {
    const run = L.tops.find(t => Math.abs(t.y - o.y) < .5 && o.x >= t.x0 && o.x <= t.x1);
    if (!run) return false;
    const margen = o.k === 'T' ? 1.9 * T : o.k === 'f' ? .9 * T : .7 * T, largo = run.x1 - run.x0;
    if (largo < margen * 2 + 2) return o.k !== 'T' && largo >= 2 * T ? (o.x = (run.x0 + run.x1) / 2, true) : false;
    o.x = Math.min(Math.max(o.x, run.x0 + margen), run.x1 - margen);
    return true;
  });
  L.loops = traceLoops(L);
  return L;
}

// contornos (sentido horario en pantalla) a partir de la rejilla
function traceLoops(L) {
  const edges = new Map(), K = (x, y) => x * 4096 + y;
  const add = (x1, y1, x2, y2) => { const k = K(x1, y1); if (!edges.has(k)) edges.set(k, []); edges.get(k).push([x2, y2]); };
  for (let y = 0; y < L.gh; y++) for (let x = 0; x < L.gw; x++) {
    if (!L.solid(x, y)) continue;
    if (!L.solid(x, y - 1)) add(x, y, x + 1, y);
    if (!L.solid(x + 1, y)) add(x + 1, y, x + 1, y + 1);
    if (!L.solid(x, y + 1)) add(x + 1, y + 1, x, y + 1);
    if (!L.solid(x - 1, y)) add(x, y + 1, x, y);
  }
  const loops = [];
  while (edges.size) {
    const [k0, arr] = edges.entries().next().value;
    const sx = Math.floor(k0 / 4096), sy = k0 % 4096;
    const pts = [[sx, sy]];
    let cur = arr.pop(); if (!arr.length) edges.delete(k0);
    let guard = 0;
    while ((cur[0] !== sx || cur[1] !== sy) && guard++ < 100000) {
      pts.push(cur);
      const k = K(cur[0], cur[1]), a = edges.get(k);
      if (!a) break;
      const nx = a.pop(); if (!a.length) edges.delete(k);
      cur = nx;
    }
    // quitar puntos colineales
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[(i - 1 + pts.length) % pts.length], b = pts[i], c = pts[(i + 1) % pts.length];
      if ((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]) !== 0) out.push([b[0] * T, b[1] * T]);
    }
    if (out.length > 2) loops.push(out);
  }
  return loops;
}

let L = buildLevel(LEVEL_DEF);

// nivel a partir de filas de texto: '#' suelo, 'o' moneda, 'T' 'f' 'r' decoracion,
// 'P' inicio, 'G' meta; cualquier otra letra se devuelve en L.extra
function buildLevelFromRows(rows) {
  const h = rows.length, w = Math.max(...rows.map(r => r.length)), raw = new Uint8Array(w * h);
  const def = { w, h, raw, coins: [], deco: [], extra: [], start: 1, goal: w - 3 };
  rows.forEach((r, y) => { for (let x = 0; x < w; x++) {
    const ch = r[x] || '.';
    if (ch === '#') raw[y * w + x] = 1;
    else if (ch === 'o') def.coins.push([x, y]);
    else if (ch === 'T' || ch === 'f' || ch === 'r') def.deco.push([ch, x, y]);
    else if (ch === 'P') { def.start = x; def.startRow = y; }
    else if (ch === 'G') { def.goal = x; def.goalRow = y; }
    else if (ch !== '.') def.extra.push([ch, x, y]);
  } });
  return buildLevel(def);
}
// cambia el nivel activo; las capas pintadas dependen del nivel, asi que se vacian
function setLevel(nl) { L = nl; CACHE.clear(); LOOP_CACHE.clear(); }

// ---------- geometria de contornos ----------
function pathPts(ctx, pts, close = true) { ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); if (close) ctx.closePath(); }
function pathRound(ctx, pts, r) {
  const n = pts.length;
  const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const s = m(pts[n - 1], pts[0]); ctx.moveTo(s[0], s[1]);
  // las esquinas de arriba de lo que se pisa no se redondean: si no, el dibujo enseña una curva
  // donde el piso (la colisión) sigue plano hasta la orilla
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; const mm = m(p, q); ctx.arcTo(p[0], p[1], mm[0], mm[1], esquinaPiso(p) ? .01 : r); }
  ctx.closePath();
}
// ---- lo que se pisa: el contorno de arriba se queda plano y con sus esquinas ----
let PISO_CACHE = null;
function pisoInfo() {
  if (PISO_CACHE && PISO_CACHE.L === L) return PISO_CACHE;
  const esq = new Set(); for (const t of (L.tops || [])) { esq.add(t.x0 + ',' + t.y); esq.add(t.x1 + ',' + t.y); }
  return (PISO_CACHE = { L, esq });
}
const esquinaPiso = p => pisoInfo().esq.has(p[0] + ',' + p[1]);
// qué tan lejos (hacia abajo) está un punto del filo de un piso que lo cubre; Infinity si no está sobre ninguno
function bajoPiso(p) {
  let d = Infinity;
  for (const t of (L.tops || [])) if (p[0] >= t.x0 - .5 && p[0] <= t.x1 + .5) { const dy = p[1] - t.y; if (dy > -6 && dy < d) d = Math.max(0, dy); }
  return d;
}
function densify(pts, step) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), n = Math.max(1, Math.round(len / step));
    for (let j = 0; j < n; j++) out.push([a[0] + dx * j / n, a[1] + dy * j / n]);
  }
  return out;
}
function chaikin(pts, it = 2, fija) {
  // fija(p): esquinas que no se recortan (las de arriba de lo que se pisa)
  for (let k = 0; k < it; k++) {
    const o = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], fa = fija && fija(a), fb = fija && fija(b);
      o.push(fa ? a : [a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], fb ? b : [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]);
    }
    pts = o;
  }
  return pts;
}
function normals(pts) {
  return pts.map((p, i) => { const a = pts[(i - 1 + pts.length) % pts.length], b = pts[(i + 1) % pts.length]; const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dy / l, -dx / l]; });
}
function jitterPts(pts, amp, freq, seed) {
  const N = normals(pts);
  return pts.map((p, i) => { const n = (fbm1((p[0] + p[1] * 1.7) * freq, seed, 3) - .5) * 2 * amp; return [p[0] + N[i][0] * n, p[1] + N[i][1] * n]; });
}
// contornos organicos (suavizados + ondulados), con cache
const LOOP_CACHE = new Map();
function organicLoops(o = {}) {
  const k = JSON.stringify(o); if (LOOP_CACHE.has(k)) return LOOP_CACHE.get(k);
  const res = L.loops.map(lp => {
    let p = lp;
    if (o.smooth) p = chaikin(p, o.smooth, esquinaPiso);
    p = densify(p, o.step || 3);
    if (o.amp) {
      // el temblor se apaga cerca del filo de lo que se pisa: el piso dibujado queda plano, a la altura de su colisión
      const q = jitterPts(p, o.amp, o.freq || .2, o.seed || 1);
      p = p.map((a, i) => { const d = bajoPiso(a); if (d === Infinity) return q[i]; const k = Math.min(1, d / 5); return [a[0] + (q[i][0] - a[0]) * k, a[1] + (q[i][1] - a[1]) * k]; });
    }
    return p;
  });
  LOOP_CACHE.set(k, res); return res;
}
function roundRect(ctx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function allLoopsPath(ctx, loops, round) { ctx.beginPath(); for (const lp of loops) round ? pathRound(ctx, lp, round) : pathPts(ctx, lp); }

// =====================================================================
//  CACHES de capas pre-pintadas (por estilo y escala)
// =====================================================================
const CACHE = new Map();
function cached(f, name, wU, hU, draw) {
  const k = f.key + '|' + name; let c = CACHE.get(k);
  if (!c) { c = mkCanvas(wU * f.S, hU * f.S); const x = c.getContext('2d'); x.scale(f.S, f.S); x.imageSmoothingEnabled = !f.st.pixel; draw(x, c); CACHE.set(k, c); }
  return c;
}
const stripW = par => VW + (L.camMax - L.camMin) * par + 4;
const stripX = (f, par) => (f.cam - L.camMin) * par;           // desplazamiento de una capa con parallax
function strip(ctx, f, name, par, draw, alpha) {
  const w = stripW(par);
  const c = cached(f, name, w, VH, x => draw(x, w));
  const sx = clamp(stripX(f, par), 0, w - VW);
  if (alpha !== undefined) ctx.globalAlpha = alpha;
  ctx.drawImage(c, sx * f.S, 0, VW * f.S, VH * f.S, 0, 0, VW, VH);
  ctx.globalAlpha = 1;
}
function screenLayer(ctx, f, name, draw) { const c = cached(f, name, VW, VH, draw); ctx.drawImage(c, 0, 0, VW, VH); return c; }
// cresta de montaña dibujada cada frame en coordenadas de pantalla
function ridgePath(ctx, f, par, base, amp, freq, seed, oct = 4, step = 3, fn) {
  const off = f.cam * par; ctx.beginPath(); ctx.moveTo(-4, VH + 4);
  for (let x = -4; x <= VW + step + 4; x += step) { const wx = x + off; ctx.lineTo(x, base - (fn ? fn(wx) : fbm1(wx * freq, seed, oct)) * amp); }
  ctx.lineTo(VW + step + 4, VH + 4); ctx.closePath();
}
// textura de papel en pantalla
function paperTex(f, name, base, o = {}) {
  return cached(f, 'paper-' + name, VW, VH, (x, c) => {
    x.setTransform(1, 0, 0, 1, 0, 0);
    const W = c.width, H = c.height, im = x.createImageData(W, H), d = im.data, B = hex(base), s = 1 / f.S;
    const grain = o.grain ?? 14, blot = o.blot ?? 10, fib = o.fibers ?? 0;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const u = i * s, v = j * s;
      let k = (hash2(i, j, 7) - .5) * grain + (fbm2(u * .03, v * .03, 3, 3) - .5) * blot * 2;
      if (fib) k += (noise2(u * .7, v * .22, 5) + noise2(u * .22, v * .7, 6) - 1) * fib * .35;
      const p = (j * W + i) * 4; d[p] = B[0] + k; d[p + 1] = B[1] + k; d[p + 2] = B[2] + k * .9; d[p + 3] = 255;
    }
    x.putImageData(im, 0, 0);
  });
}
function vignette(ctx, a = .45, col = '#000000', inner = .45) {
  const g = ctx.createRadialGradient(VW / 2, VH / 2, VH * inner, VW / 2, VH / 2, VW * .62);
  g.addColorStop(0, rgba(col, 0)); g.addColorStop(1, rgba(col, a)); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
}
function glowDot(ctx, x, y, r, col, a = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
// particulas ambientales deterministas (no guardan estado)
function ambient(n, seed, fn) { for (let i = 0; i < n; i++) fn(i, hash1(i, seed), hash1(i, seed + 1), hash1(i, seed + 2)); }
const wrap = (v, m) => ((v % m) + m) % m;

// =====================================================================
//  HEROE: pose comun para estilos vectoriales
// =====================================================================
function heroPose(p, t) {
  const sp = Math.min(1, Math.abs(p.vx) / 130), run = p.on ? sp : 0, ph = p.run, air = !p.on;
  const bob = p.on ? -Math.abs(Math.sin(ph)) * 1.3 * run + Math.sin(t * 2.4) * .35 * (1 - run) : 0;
  const sx = 1 + p.sq * .55, sy = 1 - p.sq * .55;
  let l1, l2;
  if (air) { l1 = [-1.4, -3.5, -3.4, -1.2]; l2 = [1.4, -3.5, 3.4, p.vy < 0 ? -2.8 : -.6]; }
  else {
    const a = Math.sin(ph) * run;
    l1 = [-1.2, -3.5, -1.2 + a * 3.6, -Math.max(0, Math.cos(ph)) * run * 2.2];
    l2 = [1.2, -3.5, 1.2 - a * 3.6, -Math.max(0, -Math.cos(ph)) * run * 2.2];
  }
  const sc = [];
  const neckY = -9.6 + bob, flow = .45 + sp * .55 + (air ? .3 : 0);
  for (let i = 0; i < 6; i++) sc.push([-.5 - i * 2.3 * flow, neckY + Math.sin(t * 11 - i * 1.1) * i * .38 * flow + i * (1 - flow) * 1.1 + (air ? -p.vy * .004 * i : 0)]);
  return { sx, sy, bob, l1, l2, sc, run, sp, air };
}
// o: {body, body2, skin, hair, scarf, leg, eye, lw, line, glint, cheek, poly, feather, noFace}
function drawHero(ctx, p, f, o) {
  const g = heroPose(p, f.t), lw = o.lw || 0, line = o.line;
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.face * g.sx, g.sy);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const fs = (fill) => { if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = line; ctx.stroke(); } if (fill) { ctx.fillStyle = fill; ctx.fill(); } };
  const thick = (w, col) => { if (lw) { ctx.lineWidth = w + lw * 2; ctx.strokeStyle = line; ctx.stroke(); } ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke(); };
  if (o.scarf) { ctx.beginPath(); ctx.moveTo(g.sc[0][0], g.sc[0][1]); for (const q of g.sc) ctx.lineTo(q[0], q[1]); thick(o.scarfW || 2.2, o.scarf); }
  for (const l of [g.l1, g.l2]) { ctx.beginPath(); ctx.moveTo(l[0], l[1] + g.bob); ctx.lineTo(l[2], l[3]); thick(2.5, o.leg || o.body); }
  ctx.beginPath(); roundRect(ctx, -4, -10.6 + g.bob, 8, 7.6, 3); fs(o.body);
  if (o.body2) { ctx.save(); ctx.clip(); ctx.fillStyle = o.body2; ctx.fillRect(0.5, -12 + g.bob, 6, 10); ctx.restore(); }
  if (o.scarf) { ctx.beginPath(); roundRect(ctx, -3.6, -10.8 + g.bob, 7.6, 2.4, 1.2); fs(o.scarf); }
  const hy = -14.6 + g.bob;
  ctx.beginPath();
  if (o.poly) { for (let i = 0; i < o.poly; i++) { const a = i / o.poly * TAU + .3; ctx.lineTo(.5 + Math.cos(a) * 5, hy + Math.sin(a) * 5); } ctx.closePath(); }
  else ctx.arc(.5, hy, 4.9, 0, TAU);
  fs(o.hair);
  if (o.feather) { ctx.beginPath(); ctx.moveTo(-2, hy - 4); ctx.quadraticCurveTo(-6, hy - 11, -9, hy - 9 + Math.sin(f.t * 6) * .8); ctx.quadraticCurveTo(-5, hy - 7, -2, hy - 4); fs(o.feather); }
  if (!o.noFace) {
    ctx.beginPath(); ctx.ellipse(2.1, hy + .9, 3.2, 3.3, 0, 0, TAU); ctx.fillStyle = o.skin; ctx.fill();
    const blink = (f.t % 3.7) < .12 ? .15 : 1;
    ctx.fillStyle = o.eye; ctx.beginPath(); ctx.ellipse(3.1, hy + .4, .78, 1.2 * blink, 0, 0, TAU); ctx.fill();
    if (o.glint && blink > .5) { ctx.fillStyle = o.glint; ctx.beginPath(); ctx.arc(3.35, hy - .1, .32, 0, TAU); ctx.fill(); }
    if (o.cheek) { ctx.fillStyle = o.cheek; ctx.beginPath(); ctx.ellipse(3.6, hy + 2.3, .9, .55, 0, 0, TAU); ctx.fill(); }
  } else if (o.eye) {
    const blink = (f.t % 3.7) < .12 ? .15 : 1;
    ctx.fillStyle = o.eye; ctx.beginPath(); ctx.ellipse(3, hy + .3, .8, 1.15 * blink, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
  return g;
}
// pose en espacio local -> mundo (para estilos que dibujan a mano)
function heroXf(p, g) { return (lx, ly) => [p.x + lx * p.face * g.sx, p.y + ly * g.sy]; }

// =====================================================================
//  JUEGO: fisica, camara, monedas, meta
// =====================================================================
function solidAt(x, y) { const cx = Math.floor(x / T), cy = Math.floor(y / T); if (cy < 0) return false; if (cy >= L.gh) return false; if (cx < 0 || cx >= L.gw) return true; return L.grid[cy * L.gw + cx] === 1; }
const G = 1400, JUMP = 440, MAXV = 132;

function newGame() {
  const p = { x: L.start.x, y: L.start.y, w: 10, h: 14, vx: 0, vy: 0, on: true, face: 1, run: 0, coyote: 0, jb: 0, sq: 0, vis: true, inv: 0 };
  return { p, coins: L.coins.map(c => ({ ...c, got: false })), parts: [], t: 0, cam: L.camMin, win: 0, got: 0, safe: { x: p.x, y: p.y }, prevJump: false, lastX: p.x, stuckT: 0, hold: false };
}
function spawn(g, n, x, y, o) {
  for (let i = 0; i < n; i++) {
    const a = o.ang !== undefined ? o.ang + (Math.random() - .5) * o.spread : Math.random() * TAU, v = o.v * (.4 + Math.random() * .6);
    g.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: o.g || 0, life: o.life * (.6 + Math.random() * .4), max: o.life, s: o.s * (.6 + Math.random() * .5), k: o.k, c: o.cols[(Math.random() * o.cols.length) | 0], r: Math.random() * TAU });
  }
}
function aiInput(g) {
  const p = g.p;
  const wall = solidAt(p.x + 12, p.y - 3) || solidAt(p.x + 12, p.y - 13);
  const gap = !solidAt(p.x + 9, p.y + 4) && !solidAt(p.x + 9, p.y + 20);
  let jump = false;
  if (p.on && (wall || gap)) jump = true;
  if (!p.on && p.vy < 0 && g.hold) jump = true;
  if (p.on && g.stuckT > .6) { jump = true; g.stuckT = 0; }
  const press = jump && !g.hold; g.hold = jump;
  return { dir: g.win ? 0 : 1, jump, press };
}
function stepGame(g, inp, dt, st) {
  const p = g.p; g.t += dt;
  const pal = st.fx || {};
  const dustC = pal.dust || ['#ffffff'];
  // horizontal
  const acc = p.on ? 1150 : 760, fr = p.on ? 1500 : 260;
  if (inp.dir) { p.vx += inp.dir * acc * dt; p.vx = clamp(p.vx, -MAXV, MAXV); p.face = inp.dir; }
  else { const d = Math.sign(p.vx); p.vx -= d * fr * dt; if (Math.sign(p.vx) !== d) p.vx = 0; }
  p.coyote = p.on ? .1 : p.coyote - dt;
  p.jb = inp.press ? .13 : p.jb - dt;
  if (p.jb > 0 && p.coyote > 0) {
    p.vy = -JUMP; p.jb = 0; p.coyote = 0; p.on = false; p.sq = -.28;
    spawn(g, 6, p.x, p.y, { ang: -Math.PI / 2, spread: 2.2, v: 40, life: .4, s: 2.2, k: 'dust', cols: dustC, g: -20 });
  }
  if (!inp.jump && p.vy < -140) p.vy += G * 1.7 * dt;
  p.vy = Math.min(p.vy + G * dt, 520);
  // mover X
  p.x += p.vx * dt;
  { const top = p.y - p.h + .5, mid = p.y - p.h / 2, bot = p.y - .5;
    if (p.vx > 0) { const r = p.x + p.w / 2; if (solidAt(r, top) || solidAt(r, mid) || solidAt(r, bot)) { p.x = Math.floor(r / T) * T - p.w / 2 - .01; p.vx = 0; } }
    else if (p.vx < 0) { const l = p.x - p.w / 2; if (solidAt(l, top) || solidAt(l, mid) || solidAt(l, bot)) { p.x = (Math.floor(l / T) + 1) * T + p.w / 2 + .01; p.vx = 0; } } }
  // mover Y
  const wasOn = p.on, vyPrev = p.vy;
  p.y += p.vy * dt;
  { const l = p.x - p.w / 2 + .5, r = p.x + p.w / 2 - .5;
    if (p.vy > 0) { if (solidAt(l, p.y) || solidAt(r, p.y)) { p.y = Math.floor(p.y / T) * T; p.vy = 0; } }
    else if (p.vy < 0) { const top = p.y - p.h; if (solidAt(l, top) || solidAt(r, top)) { p.y = (Math.floor(top / T) + 1) * T + p.h; p.vy = 0; } }
    p.on = p.vy >= 0 && (solidAt(l, p.y + .5) || solidAt(r, p.y + .5));
    if (p.on && !wasOn && vyPrev > 160) {
      p.sq = clamp(vyPrev / 1400, .12, .32);
      spawn(g, 9, p.x, p.y, { ang: -Math.PI / 2, spread: 3, v: 55, life: .45, s: 2.4, k: 'dust', cols: dustC, g: -10 });
    }
    if (p.on && solidAt(p.x - 6, p.y + 2) && solidAt(p.x + 6, p.y + 2)) g.safe = { x: p.x, y: p.y };
  }
  if (p.on) { p.run += Math.abs(p.vx) * dt * .16; if (Math.abs(p.vx) > 60 && Math.random() < .12) spawn(g, 1, p.x - p.face * 3, p.y, { ang: -Math.PI / 2 - p.face * .8, spread: .8, v: 20, life: .35, s: 1.6, k: 'dust', cols: dustC, g: -10 }); }
  p.sq *= Math.pow(.0008, dt);
  // caida
  if (p.y > VH + 40) { p.x = g.safe.x - 8; p.y = g.safe.y; p.vx = 0; p.vy = 0; p.inv = 1; }
  if (p.inv > 0) { p.inv -= dt; p.vis = Math.floor(p.inv * 14) % 2 === 0 || p.inv <= 0; } else p.vis = true;
  // monedas
  for (const c of g.coins) if (!c.got && Math.abs(c.x - p.x) < 10 && Math.abs(c.y - (p.y - 7)) < 12) {
    c.got = true; g.got++;
    spawn(g, 14, c.x, c.y, { v: 90, life: .6, s: 2, k: 'spark', cols: pal.spark || ['#ffe680', '#ffffff'], g: 60 });
  }
  // meta
  if (!g.win && Math.abs(p.x - L.goal.x) < 10) {
    g.win = g.t;
    for (let i = 0; i < 4; i++) spawn(g, 16, L.goal.x, L.goal.y - 30, { ang: -Math.PI / 2, spread: 2.4, v: 170, life: 1.4, s: 2.4, k: 'confetti', cols: pal.confetti || ['#ff5d73', '#ffd23f', '#3ec1d3', '#ffffff', '#9b5de5'], g: 220 });
  }
  // particulas
  for (const q of g.parts) { q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= Math.pow(.25, dt); q.life -= dt; q.r += dt * 6; }
  g.parts = g.parts.filter(q => q.life > 0);
  // camara
  const target = clamp(p.x - VW * .38 + p.vx * .35, L.camMin, L.camMax);
  g.cam += (target - g.cam) * Math.min(1, dt * 4.5);
  g.cam = clamp(g.cam, L.camMin, L.camMax);
  // atascado (solo IA)
  if (Math.abs(p.x - g.lastX) < .5) g.stuckT += dt; else g.stuckT = 0; g.lastX = p.x;
}

// ---------- dibujos por defecto ----------
function defParticle(ctx, q, f) {
  const a = clamp(q.life / q.max, 0, 1);
  ctx.globalAlpha = a; ctx.fillStyle = q.c;
  if (q.k === 'confetti') { ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.r); ctx.fillRect(-q.s, -q.s * .45, q.s * 2, q.s * .9); ctx.restore(); }
  else { ctx.beginPath(); ctx.arc(q.x, q.y, q.s * (q.k === 'dust' ? (1.4 - a * .6) : a), 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
}

// =====================================================================
//  ESTILOS
// =====================================================================
const STYLES = [], STYLE_MAP = {};
function defStyle(s) { STYLES.push(s); STYLE_MAP[s.id] = s; }

function terrainCanvas(st, S) {
  const k = st.id + '@' + S.toFixed(3) + '|terrain'; let c = CACHE.get(k);
  if (!c) {
    c = mkCanvas(L.ww * S, (VH + 8) * S); const x = c.getContext('2d'); x.scale(S, S); x.imageSmoothingEnabled = !st.pixel;
    st.terrain(x, { S, st, key: st.id + '@' + S.toFixed(3), t: 0, cam: 0 });
    CACHE.set(k, c);
  }
  return c;
}

// opt.y0: fila del mundo que queda arriba de la vista (0 o negativa); opt.H: alto de la vista
function monedaItzel(ctx, x, y, t, f, especial = false) {
  const pixel = f.st.pixel || f.st.fixedS || f.st.base, yy = y + Math.sin(t * 2.5 + x * .04) * 1.2;
  ctx.save(); ctx.translate(x, yy);
  if (pixel) {
    const filas = especial ? ['..BBB..','.BBBBB.','BBCCBBB','BBCCBBB','BBCCBBB','.BBBBB.','..BBB..'] : ['....LL.','...L...','..YYY..','.YYYYY.','.YYYYY.','..YYY..','...Y...'];
    const col = { B: '#68351b', C: '#ab6332', Y: f.st.id === 'bruma' ? '#dedede' : '#f6b62e', L: '#3d8c50' };
    for (let j = 0; j < filas.length; j++) for (let i = 0; i < filas[j].length; i++) if (col[filas[j][i]]) { ctx.fillStyle = col[filas[j][i]]; ctx.fillRect(i - 3, j - 3, 1, 1); }
  } else {
    const gris = f.st.id === 'bruma'; ctx.fillStyle = especial ? '#68371e' : gris ? '#777' : '#ad6b1a'; ctx.beginPath(); ctx.ellipse(0, .5, 4.2, 5.2, .2, 0, TAU); ctx.fill();
    ctx.fillStyle = especial ? '#b66d32' : gris ? '#e4e4e4' : '#f6b62e'; ctx.beginPath(); ctx.ellipse(-.4, -.3, 3.4, 4.4, .2, 0, TAU); ctx.fill();
    if (especial) { ctx.strokeStyle = '#70401f'; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(0, -3); ctx.quadraticCurveTo(-1, 0, .4, 4); ctx.stroke(); }
    else { ctx.fillStyle = gris ? '#999' : '#438c50'; ctx.beginPath(); ctx.ellipse(2, -4.6, 2, 1, -.5, 0, TAU); ctx.fill(); ctx.fillStyle = gris ? '#fff' : '#ffe08a'; ctx.beginPath(); ctx.ellipse(-1.5, -1.8, .8, 1.5, .3, 0, TAU); ctx.fill(); }
  }
  ctx.restore();
}
function renderScene(ctx, st, g, S, opt = {}) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  let y0 = Math.min(0, opt.y0 || 0); const H = opt.H || VH;
  if (st.pixel) y0 = Math.round(y0 * S) / S;
  ctx.setTransform(S, 0, 0, S, 0, 0);
  ctx.imageSmoothingEnabled = !st.pixel;
  let cam = g.cam; if (st.pixel) cam = Math.round(cam * S) / S;
  const f = { t: g.t, cam, S, g, st, key: st.id + '@' + S.toFixed(3), y0, H };
  // el cielo es un telón lejano: se queda fijo en la pantalla aunque la cámara suba
  if (!opt.skipSky) telon(ctx, st, f, H);
  ctx.setTransform(S, 0, 0, S, 0, -y0 * S);
  ctx.drawImage(terrainCanvas(st, S), cam * S, 0, VW * S, VH * S, 0, 0, VW, VH);
  ctx.save(); ctx.translate(-cam, 0);
  if (st.front) st.front(ctx, f);
  for (const c of g.coins) if (!c.got) monedaItzel(ctx, c.x, c.y, g.t, f);
  (L.metaPinta || st.goal)(ctx, L.goal.x, L.goal.y, g.t, f); // un nivel puede traer su propia meta (el nacimiento, Juan Carnaval…)
  if (typeof WORLD_HOOK === 'function') WORLD_HOOK(ctx, f, 'under');
  if (g.p.vis) {
    st.player(ctx, g.p, f);
  }
  if (typeof WORLD_HOOK === 'function') WORLD_HOOK(ctx, f, 'over');
  // en la galeria Fresita acompaña a Itzel (en el juego la mueve el jugador 2)
  if (!g.fre && st.fresita) {
    const p = g.p, tx = p.x - p.face * 16, ty = p.y - 27 + Math.sin(g.t * 2.2) * 2.5;
    if (g.cx === undefined || Math.abs(g.cx - tx) > 80) { g.cx = tx; g.cy = ty; }
    g.cx += (tx - g.cx) * .08; g.cy += (ty - g.cy) * .08;
    st.fresita(ctx, { x: g.cx, y: g.cy, face: p.face }, f);
  }
  for (const q of g.parts) (st.particle || defParticle)(ctx, q, f);
  ctx.restore();
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0;
  // los efectos de pantalla (viñeta, grano, papel) cubren toda la vista aunque sea más alta
  if (st.over) { ctx.save(); ctx.setTransform(S, 0, 0, S * H / VH, 0, 0); st.over(ctx, f); ctx.restore(); }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
}
// El telón está pintado para 16:9, con su horizonte junto al piso. Si la vista es más alta, el piso baja, así que
// el telón crece con él: se agranda desde arriba para que la ciudad siga parada en el piso y llene hasta abajo.
// Lo de pixel no se puede agrandar (sus pixeles se verían disparejos): baja completo y se estira su cielo.
const PISO_TELON = 177;
function telon(ctx, st, f, H) {
  if (H <= VH || st.telonPropio) { st.sky(ctx, f); return; }
  // Aunque la cámara todavía no haya subido, el telón debe cubrir toda la vista.
  const dy = Math.max(H - VH, -f.y0);
  ctx.save();
  if (st.pixel) ctx.translate(0, dy);
  else { const k = (PISO_TELON + dy) / PISO_TELON; ctx.translate(VW / 2, 0); ctx.scale(k, k); ctx.translate(-VW / 2, 0); }
  st.sky(ctx, f);
  ctx.restore();
  if (st.pixel) { const c = ctx.canvas, Y = Math.round(dy * f.S); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(c, 0, Y, c.width, 1, 0, 0, c.width, Y); ctx.restore(); }
}

// =====================================================================
//  VISTAS (miniaturas y pantalla completa)
// =====================================================================
class View {
  constructor(canvas, style, auto) { this.c = canvas; this.ctx = canvas.getContext('2d'); this.auto = auto; this.setStyle(style); }
  setStyle(st) { this.st = st; this.g = newGame(); this.acc = 0; this.drawn = false; this.cssW = 0; }
  resize(cssW, maxS, H = VH) {
    this.H = H;
    const dpr = window.devicePixelRatio || 1, st = this.st;
    let S;
    if (st.fixedS) S = st.fixedS;
    else { S = Math.min(maxS, cssW * dpr / VW); if (st.snapS) S = Math.max(st.snapS, Math.floor(S / st.snapS) * st.snapS); S = Math.round(S * 100) / 100; }
    this.S = S;
    const w = Math.round(VW * S), h = Math.round(H * S);
    if (this.c.width !== w || this.c.height !== h) { this.c.width = w; this.c.height = h; }
    this.c.style.imageRendering = st.pixel ? 'pixelated' : 'auto';
    if (st.base) {
      const bs = st.baseS(S);
      this.bS = bs;
      if (!this.buf) { this.buf = mkCanvas(1, 1); this.bctx = this.buf.getContext('2d', { willReadFrequently: true }); }
      const bw = Math.round(VW * bs), bh = Math.round(H * bs);
      if (this.buf.width !== bw || this.buf.height !== bh) { this.buf.width = bw; this.buf.height = bh; }
    }
  }
  update(dt, input) {
    this.acc = Math.min(this.acc + dt, .1);
    const step = 1 / 60;
    while (this.acc >= step) {
      this.acc -= step;
      const g = this.g;
      const inp = this.auto ? aiInput(g) : input();
      stepGame(g, inp, step, this.st);
      if (g.win && g.t - g.win > (this.auto ? 1.6 : 2.6)) { this.g = newGame(); if (this.onRestart) this.onRestart(); }
    }
  }
  render() {
    const st = this.st;
    if (st.base) {
      const base = STYLE_MAP[st.base];
      const anteriorArte=window.estiloArteDerivado;
      try { window.estiloArteDerivado=st.id; renderScene(this.bctx, base, this.g, this.bS, { skipSky: st.skipSky, y0: this.y0, H: this.H }); }
      finally { window.estiloArteDerivado=anteriorArte; }
      const ctx = this.ctx; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none';
      st.process(this.buf, this.bctx, ctx, this);
    } else renderScene(this.ctx, st, this.g, this.S, { y0: this.y0, H: this.H });
    this.drawn = true;
  }
}
