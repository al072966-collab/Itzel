'use strict';
// =====================================================================
//  2.5D · La maqueta de la ciudad (Museo de la Ciudad, Baluarte de San Carlos)
//  Reemplaza al jardín de islas de modos.js (pedido de David 2026-11-20:
//  «se ve hecho al chingadazo»). Itzel y Fresita se encogieron dentro de
//  la maqueta de Campeche que está en la mesa del museo:
//   · las manzanas son islas con casitas de colores a escala; las casas son
//     bloques: se puede brincar encima de ellas para cruzar o subir;
//   · a la maqueta le faltan tres piezas (la torre de la Catedral, la Puerta
//     de Mar y el Baluarte de la Soledad): hay que juntarlas y llevarlas a la
//     Catedral de la maqueta;
//   · los puentes se encienden mientras alguien pisa su placa. Fresita deja
//     ECOS de Itzel (hasta dos a la vez): el eco pisa la placa por ella.
//     El puente IV necesita sus dos placas pisadas al mismo tiempo;
//   · un trenecito de la maqueta va y viene entre dos manzanas: Itzel se
//     sube y la lleva;
//   · erizos del jardín del museo patrullan (clic derecho: se duermen).
// =====================================================================
MODOS.iso = (() => {
  const TW = 13, TH = 6.5, TZ = 9, GRAV = 28, SALTO = 9.6, VEL = 3.4;
  const key = (i, j) => i + ',' + j;
  // el mapa: cinco manzanas. [x, y, ancho, alto, altura]
  const MAPA = {
    islas: [[0, 0, 6, 6, 1], [10, 0, 5, 6, 2], [10, 10, 6, 5, 1], [0, 10, 5, 6, 2], [4, 17, 7, 4, 1], [3, 4, 1, 1, 2]],
    // las casas: bloques de una altura más sobre su manzana (se pueden escalar)
    casas: [[4, 0, 0], [5, 0, 1], [5, 1, 2], [0, 4, 3], [0, 5, 4], [12, 3, 5], [13, 3, 6], [14, 0, 7], [14, 1, 0], [15, 13, 1], [15, 14, 2], [12, 13, 3], [0, 14, 4], [1, 15, 5], [4, 10, 6], [9, 19, 7], [10, 19, 0], [4, 20, 1]],
    puentes: [{ id: 0, h: 1, celdas: [[6, 2], [7, 2], [8, 2], [9, 2]], placas: [[2, 2]], col: '#73efd0', n: 'I' },
      { id: 1, h: 2, celdas: [[12, 6], [12, 7], [12, 8], [12, 9]], placas: [[11, 4]], col: '#ffc980', n: 'II' },
      { id: 2, h: 1, celdas: [[2, 16]], placas: [[3, 12]], col: '#cba6ff', n: 'III', extra: [[2, 17], [3, 17]] },
      { id: 3, h: 1, celdas: [[9, 11], [8, 11], [7, 11], [6, 11], [5, 11]], placas: [[13, 11], [11, 14]], col: '#ff9ab0', n: 'IV' }],
    // el trenecito: va y viene entre la manzana de abajo y la de la derecha
    tren: { a: [11, 18.5], b: [13.5, 15.4], h: 1 },
    inicio: [1, 1], catedral: [6, 19],
    piezas: [{ x: 14.5, y: 0.5, k: 'torre', n: 'la torre de la Catedral' }, { x: 15.5, y: 10.5, k: 'puerta', n: 'la Puerta de Mar' }, { x: 0.5, y: 11.5, k: 'baluarte', n: 'el Baluarte de la Soledad' }],
    cacao: [[2, 4], [4, 2], [11, 1], [13, 5], [10, 12], [14, 10], [3, 14], [1, 11], [7, 18], [8, 20], [5, 4.5], [12, 4], [15, 14.5]],
    erizos: [[[10, 11], [10, 14], [15, 14], [15, 11]], [[1, 12], [4, 12]], [[10, 4], [13, 4]], [[5, 18], [9, 18]]],
  };
  function crearMapa(m) {
    const T2 = new Map(), rect = (x, y, w, h, alt) => { for (let i = x; i < x + w; i++) for (let k = y; k < y + h; k++) T2.set(key(i, k), { i, j: k, h: alt }); };
    for (const r of m.islas) rect(...r);
    for (const [i, k, c] of m.casas) { const b = T2.get(key(i, k)); if (b) T2.set(key(i, k), { i, j: k, h: b.h + 1, casa: c }); }
    for (const b of m.puentes) [...b.celdas, ...(b.extra || [])].forEach(([i, k]) => T2.set(key(i, k), { i, j: k, h: b.h, puente: b.id }));
    return T2;
  }
  function crear(def, st) {
    const m = MAPA, tiles = crearMapa(m);
    return { t: 0, win: 0, shake: 0, bubbles: [], parts: [], def, st, tiles, m,
      p: { x: m.inicio[0] + .5, y: m.inicio[1] + .5, z: 1, vz: 0, on: true, face: 1, run: 0, vis: true, safe: [m.inicio[0] + .5, m.inicio[1] + .5, 1] },
      pose: poseItzel(), ecos: [], piezas: m.piezas.map(q => ({ ...q, got: false })), cacao: m.cacao.map(([x, y]) => ({ x: x + .5, y: y + .5, got: false })),
      erizos: m.erizos.map((ruta, i) => ({ ruta, k: 0, u: 0, x: ruta[0][0] + .5, y: ruta[0][1] + .5, z: 0, curl: 0, t: i, duerme: 0, vivo: true })),
      tren: { u: 0, dir: 1, espera: 1.5, x: m.tren.a[0], y: m.tren.a[1] },
      fre: { x: VW / 2, y: 60, face: 1, cool: 0 }, cam: { x: 0, y: 0 }, inv: 0, jWas: false, activos: m.puentes.map(() => false), letreros: [] };
  }
  const sobre = (q, pl) => q && Math.floor(q.x) === pl[0] && Math.floor(q.y) === pl[1];
  const placaPisada = (j, pl) => (sobre(j.p, pl) && j.p.on) || j.ecos.some(e => sobre(e, pl));
  const enTren = (j, x, y) => Math.abs(x - j.tren.x) < .62 && Math.abs(y - j.tren.y) < .62;
  function celda(j, x, y) {
    if (enTren(j, x, y)) return { i: Math.floor(x), j: Math.floor(y), h: j.m.tren.h, tren: true };
    const c = j.tiles.get(key(Math.floor(x), Math.floor(y))); if (!c) return null; if (c.puente !== undefined && !j.activos[c.puente]) return null; return c;
  }
  const dice = (j, txt, col = '#fff3c4') => j.letreros.push({ txt, t: 0, col });
  function paso(j, dt) {
    j.t += dt; j.inv = Math.max(0, j.inv - dt); j.shake = Math.max(0, j.shake - dt);
    const p = j.p, k = teclas();
    j.activos = j.m.puentes.map(b => b.placas.every(pl => placaPisada(j, pl)));
    // el trenecito: va, espera, regresa; si Itzel está arriba, la lleva
    { const T = j.tren, A = j.m.tren.a, B = j.m.tren.b, x0 = T.x, y0 = T.y, arriba = p.on && enTren(j, p.x, p.y) && Math.abs(p.z - j.m.tren.h) < .1;
      if (T.espera > 0) T.espera -= dt; else { T.u += T.dir * dt / 3.2; if (T.u >= 1 || T.u <= 0) { T.u = clamp(T.u, 0, 1); T.dir *= -1; T.espera = 1.6; } }
      const e = T.u < .5 ? 2 * T.u * T.u : 1 - Math.pow(-2 * T.u + 2, 2) / 2; T.x = lerp(A[0], B[0], e); T.y = lerp(A[1], B[1], e);
      if (arriba) { p.x += T.x - x0; p.y += T.y - y0; } }
    // movimiento en la pantalla convertido a la cuadrícula isométrica
    let sx = (k.right ? 1 : 0) - (k.left ? 1 : 0), sy = (k.down ? 1 : 0) - (k.up ? 1 : 0);
    let gx = sx + sy, gy = sy - sx; const n = Math.hypot(gx, gy);
    if (n) { gx /= n; gy /= n; p.face = sx ? Math.sign(sx) : p.face; p.run += dt * 14; }
    const intenta = (nx, ny) => { const c = celda(j, nx, ny); if (c && c.h > p.z + .12) return false; p.x = nx; p.y = ny; return true; };
    if (n && !j.win) { intenta(p.x + gx * VEL * dt, p.y); intenta(p.x, p.y + gy * VEL * dt); }
    const suelo = () => { const c = celda(j, p.x, p.y); return c ? c.h : -99; };
    if (k.space && !j.jWas && p.on) { p.vz = SALTO; p.on = false; }
    j.jWas = k.space;
    p.vz -= GRAV * dt; p.z += p.vz * dt;
    const s = suelo();
    if (p.z <= s && p.vz <= 0) { if (!p.on && p.vz < -6) chispas(j, ...proy(j, p.x, p.y, s), ['#c7ffed', '#ffffff'], 6, 30); p.z = s; p.vz = 0; p.on = true; const c = celda(j, p.x, p.y); if (c && c.puente === undefined && !c.tren) p.safe = [Math.floor(p.x) + .5, Math.floor(p.y) + .5, s]; }
    else if (p.z > s + .01) p.on = false;
    if (p.z < -5) { dañoModo(j); p.x = p.safe[0]; p.y = p.safe[1]; p.z = p.safe[2] + 1.5; p.vz = 0; dice(j, 'Itzel se cayó de la maqueta', '#ffb0a0'); }
    // Fresita sigue al mouse; clic izquierdo = deja un eco donde está Itzel (hasta dos); clic derecho = canción de cuna
    if (MOUSE.active) { j.fre.x += (MOUSE.x - j.fre.x) * Math.min(1, dt * 9); j.fre.y += (MOUSE.y - j.fre.y) * Math.min(1, dt * 9); }
    else { const [ix, iy] = proy(j, p.x, p.y, p.z); j.fre.x += (ix - 16 - j.fre.x) * dt * 4; j.fre.y += (iy - 30 - j.fre.y) * dt * 4; }
    for (const c of MOUSE.clicks) {
      if (c.up) continue;
      if (c.b === 2) { for (const e of j.erizos) { const [ex, ey] = proy(j, e.x, e.y, e.z); if (Math.hypot(ex - j.fre.x, ey - j.fre.y) < 48) e.duerme = 5; } chispas(j, j.fre.x, j.fre.y, ['#b9a7ff', '#ffffff'], 14, 50); continue; }
      // clic sobre un eco: se borra
      const quita = j.ecos.findIndex(e => { const [ex, ey] = proy(j, e.x, e.y, e.z); return Math.hypot(ex - c.x, ey - 10 - c.y) < 12; });
      if (quita >= 0) { const e = j.ecos.splice(quita, 1)[0]; chispas(j, ...proy(j, e.x, e.y, e.z), ['#9affee', '#ffffff'], 10, 40); continue; }
      const cel = celda(j, p.x, p.y);
      if (p.on && cel && cel.puente === undefined && !cel.tren) {
        if (j.ecos.length >= 2) j.ecos.shift();
        j.ecos.push({ x: Math.floor(p.x) + .5, y: Math.floor(p.y) + .5, z: p.z, face: p.face, t: 0 }); chispas(j, ...proy(j, p.x, p.y, p.z - 1), ['#9affee', '#ffffff'], 16, 50);
        if (typeof ENCI !== 'undefined') ENCI.ver('poder:eco');
      }
    }
    MOUSE.clicks.length = 0;
    // erizos
    for (const e of j.erizos) {
      if (!e.vivo) continue; e.t += dt; e.duerme = Math.max(0, e.duerme - dt);
      const ciclo = e.t % 3.6; e.curl += ((ciclo > 2.4 && !e.duerme ? 1 : 0) - e.curl) * Math.min(1, dt * 8);
      if (!e.duerme && e.curl < .5) { const a = e.ruta[e.k], b = e.ruta[(e.k + 1) % e.ruta.length], L2 = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; e.u += dt * 1.3 / L2; if (e.u >= 1) { e.u = 0; e.k = (e.k + 1) % e.ruta.length; } e.x = lerp(a[0], b[0], e.u) + .5; e.y = lerp(a[1], b[1], e.u) + .5; e.face = Math.sign((b[0] - a[0]) - (b[1] - a[1])) || 1; }
      const c = j.tiles.get(key(Math.floor(e.x), Math.floor(e.y))); e.z = c ? c.h : 0;
      if (Math.hypot(p.x - e.x, p.y - e.y) < .55 && Math.abs(p.z - e.z) < .8) {
        if (p.vz < 0 && p.z > e.z + .2 && e.curl < .5) { e.vivo = false; p.vz = 7; RUN.stomps++; chispas(j, ...proy(j, e.x, e.y, e.z), ['#ffffff', '#c8e0b0'], 14, 70); }
        else if (!e.duerme && dañoModo(j)) { const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1; p.x += dx / d * .6; p.y += dy / d * .6; p.vz = 5; }
      }
    }
    // cacao y piezas
    for (const c of j.cacao) if (!c.got && Math.hypot(p.x - c.x, p.y - c.y) < .45 && Math.abs(p.z - ((celda(j, c.x, c.y) || { h: 0 }).h)) < .9) { c.got = true; RUN.coins++; chispas(j, ...proy(j, c.x, c.y, p.z + 1), ['#ffdd94', '#ffffff']); }
    for (const q of j.piezas) if (!q.got && Math.hypot(p.x - q.x, p.y - q.y) < .55 && p.z >= ((celda(j, q.x, q.y) || { h: 0 }).h) - .2) { q.got = true; chispas(j, ...proy(j, q.x, q.y, p.z + 1), ['#fff3c4', '#9affee', '#ffffff'], 24, 90); const n2 = j.piezas.filter(q2 => q2.got).length; dice(j, n2 < 3 ? `¡Encontraste ${q.n}! (${n2} de 3)` : '¡Las tres piezas! Llévalas a la Catedral', '#ffe9a0'); }
    const todas = j.piezas.every(q => q.got), ca = j.m.catedral;
    if (todas && !j.win && Math.hypot(p.x - (ca[0] + .5), p.y - (ca[1] + .5)) < 1.2) { j.win = j.t; dice(j, '¡La maqueta de Campeche está completa!', '#ffe9a0'); chispas(j, ...proy(j, ca[0] + .5, ca[1] + .5, 3), ['#ffdd94', '#73efd0', '#cba6ff', '#ffffff'], 60, 140); }
    for (const e of j.ecos) e.t += dt;
    for (const l of j.letreros) l.t += dt; j.letreros = j.letreros.filter(l => l.t < 2.6);
    // cámara siguiendo a Itzel
    const tx = (p.x - p.y) * TW, ty = (p.x + p.y) * TH - p.z * TZ;
    j.cam.x += (tx - j.cam.x) * Math.min(1, dt * 4); j.cam.y += (ty - j.cam.y) * Math.min(1, dt * 4);
    pasoChispas(j, dt);
  }
  function proy(j, x, y, z) { return [VW / 2 + (x - y) * TW - j.cam.x, VH * .55 - (j.exAlto || 0) * .5 + (x + y) * TH - z * TZ - j.cam.y]; }
  // ---------------- dibujo ----------------
  const FACH = ['#e8806a', '#f2c24f', '#6ab0d8', '#d86aa0', '#7cc08a', '#c8a0e0', '#f0e0a0', '#f0a070'];
  // arriba, en la ventana alta: el techo del museo con sus lámparas que alumbran la maqueta
  function extiende(ctx, j, ex, f) {
    const g = ctx.createLinearGradient(0, -ex, 0, 0); g.addColorStop(0, '#04141a'); g.addColorStop(1, j.colTope || '#092632'); ctx.fillStyle = g; ctx.fillRect(0, -ex, VW, ex + 1);
    ctx.fillStyle = 'rgba(160,220,210,.05)'; for (let x = 0; x < VW; x += 40) ctx.fillRect(x, -ex, 1, ex);
    for (let k = 0; k < 3; k++) { const x = 80 + k * 135; ctx.fillStyle = '#1c3a40'; ctx.fillRect(x - 6, -ex, 12, 6); ctx.fillStyle = '#c8b070'; ctx.beginPath(); ctx.moveTo(x - 8, -ex + 6); ctx.lineTo(x + 8, -ex + 6); ctx.lineTo(x + 5, -ex + 13); ctx.lineTo(x - 5, -ex + 13); ctx.closePath(); ctx.fill();
      const cono = ctx.createLinearGradient(0, -ex + 13, 0, 0); cono.addColorStop(0, 'rgba(255,240,200,.18)'); cono.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = cono; ctx.beginPath(); ctx.moveTo(x - 5, -ex + 13); ctx.lineTo(x + 5, -ex + 13); ctx.lineTo(x + 60, 0); ctx.lineTo(x - 60, 0); ctx.closePath(); ctx.fill(); }
    ctx.font = 'italic 7px Alegreya, Georgia, serif'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(200,240,230,.55)'; ctx.fillText('Museo de la Ciudad · Baluarte de San Carlos', VW - 90, -ex + 52); ctx.textAlign = 'left';
  }
  function pintar(j, view) {
    const { ctx, f, st } = marcoModo(j, view), sk = j.def.skin, t = j.t; j.exAlto = f.ex || 0;
    const items = [];
    for (const c of j.tiles.values()) { if (c.puente !== undefined && !j.activos[c.puente]) { items.push({ d: c.i + c.j + 1, o: 0, f: () => fantasma(c) }); continue; } items.push({ d: c.i + c.j + 1, o: 0, f: () => loseta(c) }); }
    const p = j.p;
    for (const b of j.m.puentes) for (const pl of b.placas) { const c = j.tiles.get(key(...pl)); items.push({ d: pl[0] + pl[1] + 1, o: .5, f: () => placa(b, pl, c) }); }
    items.push({ d: j.tren.x + j.tren.y + .9, o: .6, f: () => tren() });
    for (const c of j.cacao) if (!c.got) items.push({ d: c.x + c.y, o: 1, f: () => { const cel = celda(j, c.x, c.y), [x, y] = proy(j, c.x, c.y, (cel ? cel.h : 0) + .9 + Math.sin(t * 3 + c.x) * .08); if (!(window.JARDIN_ECOS && window.JARDIN_ECOS.cacao(ctx, j, x, y))) monedaItzel(ctx, x, y, t, f); } });
    for (const q of j.piezas) if (!q.got) items.push({ d: q.x + q.y, o: 1, f: () => pieza(q) });
    items.push({ d: j.m.catedral[0] + j.m.catedral[1] + 1.5, o: 1, f: () => catedral() });
    for (const e of j.erizos) if (e.vivo) items.push({ d: e.x + e.y, o: 2, f: () => erizo(e) });
    for (const e of j.ecos) items.push({ d: e.x + e.y, o: 2, f: () => itzel(e, true) });
    items.push({ d: p.x + p.y, o: 3, f: () => itzel(p, false) });
    items.sort((a, b) => a.d - b.d || a.o - b.o);
    for (const it of items) it.f();
    pintaChispas(ctx, j);
    if (st.fresita) st.fresita(ctx, { x: j.fre.x, y: j.fre.y, face: j.fre.x < proy(j, p.x, p.y, p.z)[0] ? 1 : -1 }, f);
    if (st.over) st.over(ctx, f);
    // las piezas que faltan y los ecos (arriba de la ventana, aunque sea alta)
    ctx.save(); ctx.translate(0, -(f.ex || 0) + 14);
    ctx.fillStyle = 'rgba(4,20,26,.7)'; ctx.beginPath(); roundRect(ctx, VW / 2 - 92, 6, 184, 18, 5); ctx.fill();
    j.piezas.forEach((q, i) => { const x = VW / 2 - 70 + i * 22; ctx.globalAlpha = q.got ? 1 : .3; icono(q.k, x, 19, .55); ctx.globalAlpha = 1; });
    ctx.font = 'bold 6.5px "Alegreya Sans", sans-serif'; ctx.fillStyle = '#fff3c4'; ctx.fillText(j.piezas.every(q => q.got) ? '¡A la Catedral!' : 'Piezas de la maqueta', VW / 2 - 4, 13.5);
    ctx.font = '5.6px "Alegreya Sans", sans-serif'; ctx.fillStyle = '#9affee'; ctx.fillText(`Ecos: ${j.ecos.length} de 2 · clic = eco · clic en un eco = lo borras`, VW / 2 - 4, 21);
    j.letreros.forEach((l, i) => { ctx.globalAlpha = Math.max(0, Math.min(1, 2.6 - l.t)); letrero(ctx, l.txt, VW / 2, 40 + i * 10, l.col); }); ctx.globalAlpha = 1;
    ctx.restore();

    function loseta(c) {
      const [x, y] = proy(j, c.i + .5, c.j + .5, c.h), base = (c.h + 2.2) * TZ;
      if (c.casa !== undefined) return casa(c, x, y);
      const top = (c.i + c.j) % 2 ? '#cfc4a8' : '#c2b698';
      ctx.beginPath(); ctx.moveTo(x - TW, y); ctx.lineTo(x, y + TH); ctx.lineTo(x, y + TH + base); ctx.lineTo(x - TW, y + base * .7); ctx.closePath(); ctx.fillStyle = '#6a5a44'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(x, y + TH); ctx.lineTo(x + TW, y); ctx.lineTo(x + TW, y + base * .7); ctx.lineTo(x, y + TH + base); ctx.closePath(); ctx.fillStyle = '#8a7658'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(x, y - TH); ctx.lineTo(x + TW, y); ctx.lineTo(x, y + TH); ctx.lineTo(x - TW, y); ctx.closePath(); ctx.fillStyle = c.puente !== undefined ? j.m.puentes[c.puente].col : top; ctx.fill(); ctx.strokeStyle = 'rgba(60,48,32,.35)'; ctx.lineWidth = .5; ctx.stroke();
      // las calles de la maqueta: banquetas y adoquín pintado
      if (c.puente === undefined && hash2(c.i, c.j, 3) < .35) { ctx.fillStyle = 'rgba(90,70,48,.25)'; ctx.fillRect(x - 3, y - 1, 1.2, 1.2); ctx.fillRect(x + 2, y + 1, 1.2, 1.2); }
      if (c.puente === undefined && hash2(c.i, c.j, 9) < .12) palmera(x + 4, y);
    }
    // una casita de la maqueta: fachada de color, puerta, ventanas con reja y techo de teja
    function casa(c, x, y) {
      const col = FACH[c.casa % FACH.length], base = (c.h + 2.2) * TZ, alto = TZ;
      ctx.beginPath(); ctx.moveTo(x - TW, y); ctx.lineTo(x, y + TH); ctx.lineTo(x, y + TH + base); ctx.lineTo(x - TW, y + base * .7); ctx.closePath(); ctx.fillStyle = mix(col, '#000000', .18); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x, y + TH); ctx.lineTo(x + TW, y); ctx.lineTo(x + TW, y + base * .7); ctx.lineTo(x, y + TH + base); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
      // puerta y ventana en las dos caras
      ctx.fillStyle = '#5a3a24'; ctx.beginPath(); ctx.moveTo(x - TW * .6, y + TH * .4 + 1); ctx.lineTo(x - TW * .35, y + TH * .65 + 1); ctx.lineTo(x - TW * .35, y + TH * .65 + alto * .85); ctx.lineTo(x - TW * .6, y + TH * .4 + alto * .85); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2a3a48'; ctx.beginPath(); ctx.moveTo(x + TW * .3, y + TH * .7 - 1); ctx.lineTo(x + TW * .7, y + TH * .3 - 1); ctx.lineTo(x + TW * .7, y + TH * .3 + 4); ctx.lineTo(x + TW * .3, y + TH * .7 + 4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#1c1612'; ctx.lineWidth = .3; for (let k = 1; k < 3; k++) { const u = .3 + k * .13; ctx.beginPath(); ctx.moveTo(x + TW * u, y + TH * (1 - u) - 1); ctx.lineTo(x + TW * u, y + TH * (1 - u) + 4); ctx.stroke(); }
      // azotea plana con pretil, como las casas del centro de Campeche
      ctx.beginPath(); ctx.moveTo(x, y - TH); ctx.lineTo(x + TW, y); ctx.lineTo(x, y + TH); ctx.lineTo(x - TW, y); ctx.closePath(); ctx.fillStyle = mix(col, '#ffffff', .35); ctx.fill(); ctx.strokeStyle = mix(col, '#000000', .3); ctx.lineWidth = .7; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = .4; ctx.beginPath(); ctx.moveTo(x - TW + 2, y); ctx.lineTo(x, y - TH + 1); ctx.lineTo(x + TW - 2, y); ctx.stroke();
    }
    function palmera(x, y) { ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 1.5, y - 6, x + .5, y - 11); ctx.stroke(); ctx.strokeStyle = '#3f8a4a'; ctx.lineWidth = 1; for (let k = 0; k < 5; k++) { const an = k / 5 * TAU + Math.sin(t + x) * .1; ctx.beginPath(); ctx.moveTo(x + .5, y - 11); ctx.quadraticCurveTo(x + .5 + Math.cos(an) * 3, y - 13 + Math.sin(an) * 1.5, x + .5 + Math.cos(an) * 5, y - 10 + Math.sin(an) * 2.5); ctx.stroke(); } }
    function fantasma(c) { const [x, y] = proy(j, c.i + .5, c.j + .5, c.h); ctx.globalAlpha = .25 + Math.sin(t * 3) * .08; ctx.strokeStyle = j.m.puentes[c.puente].col; ctx.setLineDash([2, 2]); ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(x, y - TH); ctx.lineTo(x + TW, y); ctx.lineTo(x, y + TH); ctx.lineTo(x - TW, y); ctx.closePath(); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; }
    function placa(b, pl, c) {
      const [x, y] = proy(j, pl[0] + .5, pl[1] + .5, c.h), on = placaPisada(j, pl), todo = j.activos[b.id];
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y, 16, b.col, todo ? .75 : on ? .5 : .22); ctx.restore();
      ctx.strokeStyle = on ? '#ffffff' : b.col; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x, y, 8, 4, 0, 0, TAU); ctx.stroke(); ctx.lineWidth = .5; ctx.beginPath(); ctx.ellipse(x, y, 5, 2.5, 0, 0, TAU); ctx.stroke();
      ctx.fillStyle = on ? '#ffffff' : b.col; ctx.font = 'bold 5px Alegreya, Georgia, serif'; ctx.textAlign = 'center'; ctx.fillText(b.n + (b.placas.length > 1 ? ` (${b.placas.filter(q => placaPisada(j, q)).length}/2)` : ''), x, y - 6); ctx.textAlign = 'left';
    }
    // el trenecito de la maqueta: locomotora de juguete sobre su plataforma
    function tren() {
      const T = j.tren, [x, y] = proy(j, T.x, T.y, j.m.tren.h);
      ctx.fillStyle = 'rgba(4,20,26,.35)'; ctx.beginPath(); ctx.ellipse(x, y + 14, 12, 5, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x, y - TH); ctx.lineTo(x + TW, y); ctx.lineTo(x, y + TH); ctx.lineTo(x - TW, y); ctx.closePath(); ctx.fillStyle = '#c8203a'; ctx.fill(); ctx.strokeStyle = '#ffe08a'; ctx.lineWidth = .8; ctx.stroke();
      ctx.fillStyle = '#7a1424'; ctx.beginPath(); ctx.moveTo(x - TW, y); ctx.lineTo(x, y + TH); ctx.lineTo(x, y + TH + 4); ctx.lineTo(x - TW, y + 4); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#a01a30'; ctx.beginPath(); ctx.moveTo(x, y + TH); ctx.lineTo(x + TW, y); ctx.lineTo(x + TW, y + 4); ctx.lineTo(x, y + TH + 4); ctx.closePath(); ctx.fill();
      for (const [dx, dy] of [[-7, 3], [7, 3], [0, 7]]) { ctx.fillStyle = '#2a1c14'; ctx.beginPath(); ctx.arc(x + dx, y + dy + 2.4, 1.8, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#ffe08a'; ctx.font = 'bold 4.4px "Alegreya Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('tren', x, y + 1.6); ctx.textAlign = 'left';
      if (T.espera <= 0) for (let k = 0; k < 3; k++) { const ph = (t * 1.2 + k / 3) % 1; ctx.fillStyle = `rgba(255,255,255,${.4 * (1 - ph)})`; ctx.beginPath(); ctx.arc(x + 6 + ph * 3, y - 6 - ph * 12, 1.4 + ph * 2.4, 0, TAU); ctx.fill(); }
    }
    function icono(k, x, y, s) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      if (k === 'torre') { ctx.fillStyle = '#f0e6d0'; ctx.fillRect(-4, -14, 8, 14); ctx.fillRect(-3, -19, 6, 5); ctx.fillStyle = '#c8b898'; ctx.beginPath(); ctx.moveTo(-3, -19); ctx.lineTo(0, -24); ctx.lineTo(3, -19); ctx.fill(); ctx.fillStyle = '#5a4a3a'; ctx.fillRect(-1.4, -11, 2.8, 4); ctx.fillRect(-1, -18, 2, 2.6); ctx.strokeStyle = '#1c1612'; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(0, -27); ctx.moveTo(-1.4, -25.6); ctx.lineTo(1.4, -25.6); ctx.stroke(); }
      else if (k === 'puerta') { ctx.fillStyle = '#e8d8b0'; ctx.fillRect(-9, -12, 18, 12); ctx.fillStyle = '#c8b090'; ctx.fillRect(-10, -14, 20, 3); ctx.fillStyle = '#3a2a1a'; ctx.beginPath(); ctx.moveTo(-3.5, 0); ctx.lineTo(-3.5, -6); ctx.arc(0, -6, 3.5, Math.PI, 0); ctx.lineTo(3.5, 0); ctx.fill(); ctx.fillStyle = '#c8203a'; ctx.fillRect(-1, -19, 2, 5); }
      else { ctx.fillStyle = '#d8c8a0'; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-7, -10); ctx.lineTo(7, -10); ctx.lineTo(10, 0); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#b8a880'; for (let k2 = -6; k2 <= 6; k2 += 4) ctx.fillRect(k2 - 1, -13, 2.4, 3); ctx.fillStyle = '#3a2a1a'; ctx.fillRect(-2, -6, 4, 6); ctx.fillStyle = '#4a7ab0'; ctx.fillRect(5, -19, 1, 9); ctx.fillStyle = '#e8e8e8'; ctx.fillRect(6, -19, 5, 3); }
      ctx.restore();
    }
    function pieza(q) { const c = celda(j, q.x, q.y), [x, y] = proy(j, q.x, q.y, (c ? c.h : 0) + 1.1 + Math.sin(t * 2 + q.x) * .15); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y - 6, 18, '#ffe9a0', .5); ctx.restore(); icono(q.k, x, y + 4, .75); const [sx, sy] = proy(j, q.x, q.y, c ? c.h : 0); ctx.fillStyle = 'rgba(10,30,30,.3)'; ctx.beginPath(); ctx.ellipse(sx, sy, 4, 2, 0, 0, TAU); ctx.fill(); }
    // la Catedral de la maqueta: le faltan las piezas; con todas, se enciende
    function catedral() {
      const ca = j.m.catedral, c = j.tiles.get(key(...ca)), [x, y] = proy(j, ca[0] + 1, ca[1] + .5, c.h), lista = j.piezas.every(q => q.got), n = j.piezas.filter(q => q.got).length;
      ctx.fillStyle = 'rgba(10,30,30,.3)'; ctx.beginPath(); ctx.ellipse(x, y + 2, 20, 6, 0, 0, TAU); ctx.fill();
      if (lista) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y - 20, 34, '#ffe9a0', j.win ? .7 : .35 + .1 * Math.sin(t * 3)); ctx.restore(); }
      ctx.fillStyle = '#efe4cc'; ctx.fillRect(x - 12, y - 18, 24, 18); ctx.fillStyle = '#d8ccb0'; ctx.fillRect(x - 12, y - 18, 24, 2);
      ctx.fillStyle = '#5a4a3a'; ctx.beginPath(); ctx.moveTo(x - 3, y); ctx.lineTo(x - 3, y - 8); ctx.arc(x, y - 8, 3, Math.PI, 0); ctx.lineTo(x + 3, y); ctx.fill(); ctx.beginPath(); ctx.arc(x, y - 13, 1.8, 0, TAU); ctx.fill();
      for (const sx of [-1, 1]) { const tx2 = x + sx * 15; ctx.fillStyle = '#efe4cc'; ctx.fillRect(tx2 - 4, y - (n > (sx < 0 ? 0 : 1) || lista ? 30 : 20), 8, n > (sx < 0 ? 0 : 1) || lista ? 30 : 20); if (n > (sx < 0 ? 0 : 1) || lista) { ctx.fillStyle = '#c8b898'; ctx.beginPath(); ctx.moveTo(tx2 - 3, y - 30); ctx.lineTo(tx2, y - 36); ctx.lineTo(tx2 + 3, y - 30); ctx.fill(); ctx.fillStyle = '#5a4a3a'; ctx.fillRect(tx2 - 1.2, y - 26, 2.4, 3.4); } else { ctx.setLineDash([1.5, 1.5]); ctx.strokeStyle = 'rgba(255,233,160,.7)'; ctx.lineWidth = .6; ctx.strokeRect(tx2 - 4, y - 32, 8, 12); ctx.setLineDash([]); } }
      if (lista || n >= 3) { ctx.strokeStyle = '#1c1612'; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(x, y - 18); ctx.lineTo(x, y - 23); ctx.moveTo(x - 1.6, y - 21.4); ctx.lineTo(x + 1.6, y - 21.4); ctx.stroke(); }
      letrero(ctx, lista ? 'Catedral: ¡ya!' : `Catedral · faltan ${3 - n}`, x, y - 40, lista ? '#ffe9a0' : '#c8f0e8');
    }
    function erizo(e) { const [x, y] = proy(j, e.x, e.y, e.z), q = Object.assign({ st: e.duerme ? 'sleep' : 'ok', anim: e.t, dir: e.face, h: 9, w: 13 }, e); ctx.fillStyle = 'rgba(10,30,30,.3)'; ctx.beginPath(); ctx.ellipse(x, y, 6, 2.6, 0, 0, TAU); ctx.fill(); ctx.save(); ctx.translate(x, y); ctx.scale(e.face || 1, 1); if (!(window.JARDIN_ECOS && window.JARDIN_ECOS.erizo(ctx, j, e, t))) MEC.FD.erizo(ctx, q, t, sk.foe); ctx.restore(); if (e.duerme) { ctx.fillStyle = '#ffffff'; ctx.font = 'bold 5px "Alegreya Sans", sans-serif'; ctx.fillText('z', x + 5, y - 12 - (t * 6 % 4)); } }
    function itzel(q, eco) {
      const c = celda(j, q.x, q.y), [gx, gy] = proy(j, q.x, q.y, c ? c.h : -10), [x, y] = proy(j, q.x, q.y, q.z);
      if (c) { ctx.fillStyle = 'rgba(6,20,24,.35)'; ctx.beginPath(); ctx.ellipse(gx, gy, 5 / (1 + (q.z - c.h) * .3), 2.2 / (1 + (q.z - c.h) * .3), 0, 0, TAU); ctx.fill(); }
      const pose = eco ? Object.assign(poseItzel(), { x, y, face: q.face }) : Object.assign(j.pose, { x, y, face: q.face, on: q.on, vx: (teclas().left || teclas().right || teclas().up || teclas().down) ? 120 : 0, vy: -q.vz * 30, run: q.run, vis: true });
      if (!eco && j.inv > 0 && Math.floor(j.inv * 14) % 2) return;
      ctx.save(); if (eco) { ctx.globalAlpha = .5 + .1 * Math.sin(t * 4 + q.x); ctx.filter = 'saturate(.2) brightness(1.5)'; }
      st.player(ctx, pose, f); ctx.restore();
    }
  }
  return { crear, paso, pintar, proy, extiende };
})();
if (NIVELES.eco) Object.assign(NIVELES.eco, { modo: 'iso', lema: 'Itzel y Fresita se encogieron dentro de la maqueta de Campeche del museo. Junten las tres piezas que le faltan y llévenlas a la Catedral; Fresita deja ecos de Itzel para pisar las placas de los puentes.' });
