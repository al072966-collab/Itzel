'use strict';
// =====================================================================
//  MODOS DE JUEGO · niveles que rompen el plataformero 2D.
//  Cada estilo de arte puede tener varios niveles (NIVELES_ALT); la run
//  escoge uno al azar. Un nivel con `modo` usa su propio juego:
//    crear(def, st) -> estado · paso(j, dt) · pintar(j, view)
//  El estado comparte con el juego: t, win, shake, bubbles, def.
// =====================================================================
const MODOS = {};
const NIVELES_ALT = {};
// un nivel especial es el de otro género; los modos que siguen siendo plataformas (la tela fruncida) no cuentan
const esEspecial = d => !!(d && d.modo && !(MODOS[d.modo] && MODOS[d.modo].plataformas));
function nivelesDe(stId, tipo) {
  const ops = [NIVELES[stId], ...(NIVELES_ALT[stId] || []).map(k => NIVELES[k])].filter(Boolean);
  return !tipo ? ops : ops.filter(d => (tipo === 'especial') === esEspecial(d));
}
function nivelPara(stId, rand, tipo) {
  const todos = nivelesDe(stId), pide = typeof pedido === 'function' ? pedido('nivel') : typeof location !== 'undefined' && new URLSearchParams(location.search).get('nivel');
  if (stId === 'anime' && pide === 'anime_nubes') return NIVELES.anime;
  const forzado = todos.find(d => d.id === pide); if (forzado) return forzado;
  const ops = tipo ? nivelesDe(stId, tipo) : todos, lista = ops.length ? ops : todos;
  // cada nivel pesa lo que diga su `peso` (los nuevos salen más seguido)
  let v = rand() * lista.reduce((s, d) => s + (d.peso || 1), 0);
  for (const d of lista) { v -= d.peso || 1; if (v <= 0) return d; }
  return lista[lista.length - 1];
}
const FONDO_MODO = ['........................................', '.P....................................G.', '########################################'];
const teclas = () => ({
  up: KEYS.has('ArrowUp') || KEYS.has('KeyW'), down: KEYS.has('ArrowDown') || KEYS.has('KeyS'),
  left: KEYS.has('ArrowLeft') || KEYS.has('KeyA'), right: KEYS.has('ArrowRight') || KEYS.has('KeyD'), space: KEYS.has('Space'),
});
function marcoModo(j, view) {
  const st = view.st, S = view.S, ctx = view.ctx;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.setTransform(S, 0, 0, S, 0, 0); ctx.imageSmoothingEnabled = !st.pixel;
  const f = { t: j.t, cam: L.camMin + (j.panCam || 0), S, g: j, st, key: st.id + '@' + S.toFixed(3) };
  st.sky(ctx, f);
  return { ctx, f, st, S };
}
function dañoModo(j, cuanto = 1) {
  if (j.inv > 0 || j.win) return false;
  RUN.hearts -= cuanto; j.inv = difi().inv; j.shake = .3;
  if (typeof cambiaDiseno === 'function') cambiaDiseno({ p: { x: 0, y: 0 }, parts: j.parts || [] });
  if (RUN.hearts <= 0) animarDerrota(j);
  return true;
}
const poseItzel = () => ({ x: 0, y: 0, vx: 0, vy: 0, on: true, face: 1, run: 0, sq: 0, vis: true, inv: 0 });
function chispas(j, x, y, cols, n = 12, v = 60) { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, s = v * (.4 + Math.random() * .6); j.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, life: .6, max: .6, c: cols[i % cols.length], s: 1.4 + Math.random() }); } }
function pasoChispas(j, dt) { for (const q of j.parts) { q.vy += 120 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt; } j.parts = j.parts.filter(q => q.life > 0); }
function pintaChispas(ctx, j) { for (const q of j.parts) { ctx.globalAlpha = Math.max(0, q.life / q.max); ctx.fillStyle = q.c; ctx.beginPath(); ctx.arc(q.x, q.y, q.s * (q.life / q.max), 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
function letrero(ctx, txt, x, y, col = '#ffffff') { ctx.font = 'bold 7px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 2.4; ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.strokeText(txt, x, y); ctx.fillStyle = col; ctx.fillText(txt, x, y); ctx.textAlign = 'left'; }

// =====================================================================
//  2.5D ISOMÉTRICO · el Jardín de los ecos de verdad (como Luma)
//  Itzel camina en las cuatro direcciones sobre islas flotantes con
//  alturas, salta entre niveles y se puede caer al vacío. Fresita deja
//  el eco de Itzel sobre los círculos para que los puentes no se apaguen.
// =====================================================================
MODOS.iso = (() => {
  const TW = 13, TH = 6.5, TZ = 9, GRAV = 28, SALTO = 9.6, VEL = 3.3;
  const key = (i, j) => i + ',' + j;
  function crearMapa(m) {
    const T2 = new Map(), rect = (x, y, w, h, alt) => { for (let i = x; i < x + w; i++) for (let k = y; k < y + h; k++) T2.set(key(i, k), { i, j: k, h: alt }); };
    for (const r of m.islas) rect(...r);
    for (const b of m.puentes) b.celdas.forEach(([i, k]) => T2.set(key(i, k), { i, j: k, h: b.h, puente: b.id }));
    return T2;
  }
  // el mapa: cuatro islas como en Luma, con escalones, columnas y un camino de piedras
  const MAPA = {
    islas: [[0, 0, 5, 5, 1], [3, 3, 2, 2, 2], [9, 0, 5, 5, 2], [12, 0, 2, 2, 3], [9, 8, 6, 5, 1], [11, 9, 2, 2, 2], [0, 8, 5, 5, 2], [0, 11, 2, 2, 3],
      [1, 6, 1, 1, 1], [2, 5, 1, 1, 1]],
    puentes: [{ id: 0, h: 1, celdas: [[5, 1], [6, 1], [7, 1], [8, 1]], placa: [3, 1], col: '#73efd0', n: 'I' },
      { id: 1, h: 2, celdas: [[11, 5], [11, 6], [11, 7]], placa: [10, 3], col: '#ffc980', n: 'II' },
      { id: 2, h: 1, celdas: [[8, 10], [7, 10], [6, 10], [5, 10]], placa: [10, 11], col: '#cba6ff', n: 'III' }],
    inicio: [1, 1], semillas: [[12.5, .5], [14.5, 12.5], [0.5, 11.5]], arbol: [2, 9],
    cacao: [[2, 2], [4, 0], [10, 1], [13, 3], [9, 12], [14, 9], [3, 12], [2, 5], [1, 6]],
    erizos: [[[9, 9], [9, 12], [14, 12], [14, 9]], [[0, 9], [4, 9]], [[9, 2], [13, 2]]],
  };
  function crear(def, st) {
    const m = MAPA, tiles = crearMapa(m);
    return { t: 0, win: 0, shake: 0, bubbles: [], parts: [], def, st, tiles, m,
      p: { x: m.inicio[0] + .5, y: m.inicio[1] + .5, z: 1, vz: 0, on: true, face: 1, run: 0, vis: true, safe: [m.inicio[0] + .5, m.inicio[1] + .5, 1] },
      pose: poseItzel(), eco: null, semillas: m.semillas.map(([x, y]) => ({ x, y, got: false })), cacao: m.cacao.map(([x, y]) => ({ x: x + .5, y: y + .5, got: false })),
      erizos: m.erizos.map((ruta, i) => ({ ruta, k: 0, u: 0, x: ruta[0][0] + .5, y: ruta[0][1] + .5, z: 0, curl: 0, t: i, duerme: 0, vivo: true })),
      fre: { x: VW / 2, y: 60, face: 1, cool: 0 }, cam: { x: 0, y: 0 }, inv: 0, jWas: false, activos: m.puentes.map(() => false) };
  }
  const placaPisada = (j, b) => { const p = j.p, e = j.eco, on = (q) => q && Math.floor(q.x) === b.placa[0] && Math.floor(q.y) === b.placa[1]; return (on(p) && p.on) || on(e); };
  function celda(j, x, y) { const c = j.tiles.get(key(Math.floor(x), Math.floor(y))); if (!c) return null; if (c.puente !== undefined && !j.activos[c.puente]) return null; return c; }
  function paso(j, dt) {
    j.t += dt; j.inv = Math.max(0, j.inv - dt); j.shake = Math.max(0, j.shake - dt);
    const p = j.p, k = teclas();
    j.activos = j.m.puentes.map(b => placaPisada(j, b));
    // movimiento en la pantalla convertido a la cuadrícula isométrica
    let sx = (k.right ? 1 : 0) - (k.left ? 1 : 0), sy = (k.down ? 1 : 0) - (k.up ? 1 : 0);
    let gx = sx + sy, gy = sy - sx; const n = Math.hypot(gx, gy);
    if (n) { gx /= n; gy /= n; p.face = sx ? Math.sign(sx) : p.face; p.run += dt * 14; }
    const intenta = (nx, ny) => { const c = celda(j, nx, ny); if (c && c.h > p.z + .12) return false; p.x = nx; p.y = ny; return true; };
    if (n && !j.win) { intenta(p.x + gx * VEL * dt, p.y); intenta(p.x, p.y + gy * VEL * dt); }
    // salto y gravedad
    const suelo = () => { const c = celda(j, p.x, p.y); return c ? c.h : -99; };
    if (k.space && !j.jWas && p.on) { p.vz = SALTO; p.on = false; }
    j.jWas = k.space;
    p.vz -= GRAV * dt; p.z += p.vz * dt;
    const s = suelo();
    if (p.z <= s && p.vz <= 0) { if (!p.on && p.vz < -6) chispas(j, ...proy(j, p.x, p.y, s), ['#c7ffed', '#ffffff'], 6, 30); p.z = s; p.vz = 0; p.on = true; const c = celda(j, p.x, p.y); if (c && c.puente === undefined) p.safe = [Math.floor(p.x) + .5, Math.floor(p.y) + .5, s]; }
    else if (p.z > s + .01) p.on = false;
    if (p.z < -5) { dañoModo(j); p.x = p.safe[0]; p.y = p.safe[1]; p.z = p.safe[2] + 1.5; p.vz = 0; }
    // Fresita sigue al mouse; clic izquierdo = eco, clic derecho = canción de cuna
    if (MOUSE.active) { j.fre.x += (MOUSE.x - j.fre.x) * Math.min(1, dt * 9); j.fre.y += (MOUSE.y - j.fre.y) * Math.min(1, dt * 9); }
    else { const [ix, iy] = proy(j, p.x, p.y, p.z); j.fre.x += (ix - 16 - j.fre.x) * dt * 4; j.fre.y += (iy - 30 - j.fre.y) * dt * 4; }
    for (const c of MOUSE.clicks) {
      if (c.up) continue;
      if (c.b === 2) { for (const e of j.erizos) { const [ex, ey] = proy(j, e.x, e.y, e.z); if (Math.hypot(ex - j.fre.x, ey - j.fre.y) < 48) e.duerme = 5; } chispas(j, j.fre.x, j.fre.y, ['#b9a7ff', '#ffffff'], 14, 50); continue; }
      const cel = celda(j, p.x, p.y);
      if (p.on && cel && cel.puente === undefined) { j.eco = { x: Math.floor(p.x) + .5, y: Math.floor(p.y) + .5, z: p.z, face: p.face, t: 0 }; chispas(j, ...proy(j, j.eco.x, j.eco.y, j.eco.z - 1), ['#9affee', '#ffffff'], 16, 50); if (typeof ENCI !== 'undefined') ENCI.ver('poder:eco'); }
    }
    MOUSE.clicks.length = 0;
    // erizos
    for (const e of j.erizos) {
      if (!e.vivo) continue; e.t += dt; e.duerme = Math.max(0, e.duerme - dt);
      const ciclo = e.t % 3.6; e.curl += ((ciclo > 2.4 && !e.duerme ? 1 : 0) - e.curl) * Math.min(1, dt * 8);
      if (!e.duerme && e.curl < .5) { const a = e.ruta[e.k], b = e.ruta[(e.k + 1) % e.ruta.length], L2 = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; e.u += dt * 1.3 / L2; if (e.u >= 1) { e.u = 0; e.k = (e.k + 1) % e.ruta.length; } e.x = lerp(a[0], b[0], e.u) + .5; e.y = lerp(a[1], b[1], e.u) + .5; e.face = Math.sign((b[0] - a[0]) - (b[1] - a[1])) || 1; }
      const c = celda(j, e.x, e.y); e.z = c ? c.h : 0;
      if (Math.hypot(p.x - e.x, p.y - e.y) < .55 && Math.abs(p.z - e.z) < .8) {
        if (p.vz < 0 && p.z > e.z + .2 && e.curl < .5) { e.vivo = false; p.vz = 7; RUN.stomps++; chispas(j, ...proy(j, e.x, e.y, e.z), ['#ffffff', '#c8e0b0'], 14, 70); }
        else if (!e.duerme && dañoModo(j)) { const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1; p.x += dx / d * .6; p.y += dy / d * .6; p.vz = 5; }
      }
    }
    // cacao y semillas
    for (const c of j.cacao) if (!c.got && Math.hypot(p.x - c.x, p.y - c.y) < .45 && p.z >= (celda(j, c.x, c.y) || { h: 0 }).h - .2) { c.got = true; RUN.coins++; chispas(j, ...proy(j, c.x, c.y, p.z + 1), ['#ffdd94', '#ffffff']); }
    for (const s2 of j.semillas) if (!s2.got && Math.hypot(p.x - s2.x, p.y - s2.y) < .55) { s2.got = true; chispas(j, ...proy(j, s2.x, s2.y, p.z + 1), ['#fff3c4', '#9affee', '#ffffff'], 24, 90); if (typeof toast === 'function') toast(`Semilla ${j.semillas.filter(q => q.got).length} de 3`); }
    const todas = j.semillas.every(q => q.got), ar = j.m.arbol;
    if (todas && !j.win && Math.floor(p.x) === ar[0] && Math.floor(p.y) === ar[1]) { j.win = j.t; chispas(j, ...proy(j, ar[0] + .5, ar[1] + .5, 3), ['#ffdd94', '#73efd0', '#cba6ff', '#ffffff'], 60, 140); }
    if (j.eco) j.eco.t += dt;
    // cámara siguiendo a Itzel
    const tx = (p.x - p.y) * TW, ty = (p.x + p.y) * TH - p.z * TZ;
    j.cam.x += (tx - j.cam.x) * Math.min(1, dt * 4); j.cam.y += (ty - j.cam.y) * Math.min(1, dt * 4);
    pasoChispas(j, dt);
  }
  // de la cuadrícula a la pantalla (en unidades del lienzo)
  function proy(j, x, y, z) { return [VW / 2 + (x - y) * TW - j.cam.x, VH * .55 + (x + y) * TH - z * TZ - j.cam.y]; }
  function pintar(j, view) {
    const { ctx, f, st } = marcoModo(j, view), sk = j.def.skin, t = j.t;
    // todo lo que se dibuja, ordenado por profundidad
    const items = [];
    for (const c of j.tiles.values()) { if (c.puente !== undefined && !j.activos[c.puente]) { items.push({ d: c.i + c.j + 1, o: 0, f: () => fantasma(c) }); continue; } items.push({ d: c.i + c.j + 1, o: 0, f: () => loseta(c) }); }
    const p = j.p, ents = [];
    for (const b of j.m.puentes) { const c = j.tiles.get(key(...b.placa)); items.push({ d: b.placa[0] + b.placa[1] + 1, o: .5, f: () => placa(b, c) }); }
    for (const c of j.cacao) if (!c.got) items.push({ d: c.x + c.y, o: 1, f: () => { const cel = celda(j, c.x, c.y), [x, y] = proy(j, c.x, c.y, (cel ? cel.h : 0) + .9 + Math.sin(t * 3 + c.x) * .08); if (!(window.JARDIN_ECOS && window.JARDIN_ECOS.cacao(ctx, j, x, y))) monedaItzel(ctx, x, y, t, f); } });
    for (const s2 of j.semillas) if (!s2.got) items.push({ d: s2.x + s2.y, o: 1, f: () => semilla(s2) });
    items.push({ d: j.m.arbol[0] + j.m.arbol[1] + 1, o: 1, f: () => { const c = j.tiles.get(key(...j.m.arbol)), [x, y] = proy(j, j.m.arbol[0] + .5, j.m.arbol[1] + .5, c.h); const g0 = f.g.win; f.g.win = j.semillas.every(q => q.got) ? 1 : 0; if (!(window.JARDIN_ECOS && window.JARDIN_ECOS.arbol(ctx, j, x, y, t))) st.goal(ctx, x, y, t, f); f.g.win = g0; } });
    for (const e of j.erizos) if (e.vivo) items.push({ d: e.x + e.y, o: 2, f: () => erizo(e) });
    if (j.eco) items.push({ d: j.eco.x + j.eco.y, o: 2, f: () => itzel(j.eco, true) });
    items.push({ d: p.x + p.y, o: 3, f: () => itzel(p, false) });
    items.sort((a, b) => a.d - b.d || a.o - b.o);
    for (const it of items) it.f();
    pintaChispas(ctx, j);
    // Fresita encima de todo
    if (st.fresita) st.fresita(ctx, { x: j.fre.x, y: j.fre.y, face: j.fre.x < proy(j, p.x, p.y, p.z)[0] ? 1 : -1 }, f);
    if (st.over) st.over(ctx, f);
    letrero(ctx, `Semillas ${j.semillas.filter(q => q.got).length} de 3${j.semillas.every(q => q.got) ? ' · ¡al árbol!' : ''}`, VW / 2, 16, '#fff3c4');

    function loseta(c) {
      const [x, y] = proy(j, c.i + .5, c.j + .5, c.h), base = (c.h + 2.2) * TZ, top = (c.i + c.j) % 2 ? sk.plat : mix(sk.plat, '#000000', .1);
      ctx.beginPath(); ctx.moveTo(x - TW, y); ctx.lineTo(x, y + TH); ctx.lineTo(x, y + TH + base); ctx.lineTo(x - TW, y + base * .7); ctx.closePath(); ctx.fillStyle = sk.line; ctx.fill();
      ctx.beginPath(); ctx.moveTo(x, y + TH); ctx.lineTo(x + TW, y); ctx.lineTo(x + TW, y + base * .7); ctx.lineTo(x, y + TH + base); ctx.closePath(); ctx.fillStyle = sk.plat2; ctx.fill();
      ctx.beginPath(); ctx.moveTo(x, y - TH); ctx.lineTo(x + TW, y); ctx.lineTo(x, y + TH); ctx.lineTo(x - TW, y); ctx.closePath(); ctx.fillStyle = c.puente !== undefined ? j.m.puentes[c.puente].col : top; ctx.fill(); ctx.strokeStyle = rgba(sk.accent, .35); ctx.lineWidth = .5; ctx.stroke();
      if (c.puente === undefined && hash2(c.i, c.j, 3) < .3) { ctx.strokeStyle = mix(sk.plat, '#ffffff', .25); ctx.lineWidth = .6; ctx.beginPath(); const bx = x - 3 + hash2(c.i, c.j, 4) * 6; ctx.moveTo(bx, y + 1); ctx.lineTo(bx + 1.5, y - 1.5); ctx.lineTo(bx + 3, y + .8); ctx.stroke(); }
    }
    function fantasma(c) { const [x, y] = proy(j, c.i + .5, c.j + .5, c.h); ctx.globalAlpha = .25 + Math.sin(t * 3) * .08; ctx.strokeStyle = j.m.puentes[c.puente].col; ctx.setLineDash([2, 2]); ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(x, y - TH); ctx.lineTo(x + TW, y); ctx.lineTo(x, y + TH); ctx.lineTo(x - TW, y); ctx.closePath(); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; }
    function placa(b, c) {
      const [x, y] = proy(j, b.placa[0] + .5, b.placa[1] + .5, c.h), on = j.activos[b.id];
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y, 16, b.col, on ? .7 : .25); ctx.restore();
      ctx.strokeStyle = on ? '#ffffff' : b.col; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x, y, 8, 4, 0, 0, TAU); ctx.stroke(); ctx.lineWidth = .5; ctx.beginPath(); ctx.ellipse(x, y, 5, 2.5, 0, 0, TAU); ctx.stroke();
      ctx.fillStyle = on ? '#ffffff' : b.col; ctx.font = 'bold 5px Alegreya, Georgia, serif'; ctx.textAlign = 'center'; ctx.fillText(b.n, x, y - 6); ctx.textAlign = 'left';
    }
    function semilla(s2) { const c = celda(j, s2.x, s2.y), [x, y] = proy(j, s2.x, s2.y, (c ? c.h : 0) + 1.2 + Math.sin(t * 2 + s2.x) * .15); if (window.JARDIN_ECOS && window.JARDIN_ECOS.semilla(ctx, j, j.semillas.indexOf(s2), x, y)) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y, 18, '#9affee', .55); ctx.restore(); for (let k = 0; k < 5; k++) { const an = k / 5 * TAU + t; ctx.fillStyle = k % 2 ? '#cba6ff' : '#9affee'; ctx.beginPath(); ctx.ellipse(x + Math.cos(an) * 3, y + Math.sin(an) * 3, 2.6, 1.3, an, 0, TAU); ctx.fill(); } ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, TAU); ctx.fill(); const [sx, sy] = proy(j, s2.x, s2.y, c ? c.h : 0); ctx.fillStyle = 'rgba(10,30,30,.3)'; ctx.beginPath(); ctx.ellipse(sx, sy, 4, 2, 0, 0, TAU); ctx.fill(); }
    function erizo(e) { const [x, y] = proy(j, e.x, e.y, e.z), q = Object.assign({ st: e.duerme ? 'sleep' : 'ok', anim: e.t, dir: e.face, h: 9, w: 13 }, e); ctx.fillStyle = 'rgba(10,30,30,.3)'; ctx.beginPath(); ctx.ellipse(x, y, 6, 2.6, 0, 0, TAU); ctx.fill(); ctx.save(); ctx.translate(x, y); ctx.scale(e.face || 1, 1); if (!(window.JARDIN_ECOS && window.JARDIN_ECOS.erizo(ctx, j, e, t))) MEC.FD.erizo(ctx, q, t, sk.foe); ctx.restore(); if (e.duerme) { ctx.fillStyle = '#ffffff'; ctx.font = 'bold 5px "Alegreya Sans", sans-serif'; ctx.fillText('z', x + 5, y - 12 - (t * 6 % 4)); } }
    function itzel(q, eco) {
      const c = celda(j, q.x, q.y), [gx, gy] = proy(j, q.x, q.y, c ? c.h : -10), [x, y] = proy(j, q.x, q.y, q.z);
      if (c) { ctx.fillStyle = 'rgba(6,20,24,.35)'; ctx.beginPath(); ctx.ellipse(gx, gy, 5 / (1 + (q.z - c.h) * .3), 2.2 / (1 + (q.z - c.h) * .3), 0, 0, TAU); ctx.fill(); }
      const pose = eco ? Object.assign(poseItzel(), { x, y, face: q.face }) : Object.assign(j.pose, { x, y, face: q.face, on: q.on, vx: (teclas().left || teclas().right || teclas().up || teclas().down) ? 120 : 0, vy: -q.vz * 30, run: q.run, vis: true });
      if (!eco && j.inv > 0 && Math.floor(j.inv * 14) % 2) return;
      ctx.save(); if (eco) { ctx.globalAlpha = .5; ctx.filter = 'saturate(.2) brightness(1.5)'; ctx.globalCompositeOperation = 'source-over'; }
      st.player(ctx, pose, f); ctx.restore();
    }
  }
  return { crear, paso, pintar, proy };
})();

// el Jardín de los ecos ahora es 2.5D de verdad
if (NIVELES.eco) Object.assign(NIVELES.eco, { modo: 'iso', lema: 'Camina entre islas flotantes. Deja tu eco en los círculos para que los puentes no se apaguen.' });
