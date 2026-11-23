'use strict';
// =====================================================================
//  PLATAFORMAS PROPIAS · niveles de plataformas que el motor normal no
//  puede: más altos que una pantalla (hacia abajo o hacia arriba), con la
//  gravedad de cabeza, con salto de pared o con un mapa para explorar.
//  Siguen siendo plataformas 2D (no cuentan como otro género).
//  Usan el arte de su mundo: el terreno se pinta con st.terrain en franjas
//  de 13 filas (cada franja es un nivel chiquito con una fila de más arriba
//  y abajo para que las orillas casen), el cielo con su telón y los enemigos
//  con MEC.drawFoe.
//  El mapa es texto: '#' tierra, 'x' púas, 'o' canistel, 'P' inicio,
//  'G' meta, 'C' punto de control, 'w' enemigo que camina, 'v' que vuela,
//  'H' escalera, 'W' vitral que se enciende, 'F' muro falso, '-' roca que
//  solo existe a la luz de Fresita, 'D' puerta, 'K' llave, 'J' pluma
//  (doble salto); 'T' 'f' 'r' decoran.
// =====================================================================
const PROPIO = (() => {
  const GRAV = 1100, SALTO = 382, VEL = 118, AN = 5, ALTO = 20, FR = 13;
  // sensación del mundo (sensacion-mundos.js): multiplicadores de gravedad, salto, aceleración y fricción; sin perfil, todo 1
  const sens = j => { const P = (typeof SENSACION_MUNDOS !== 'undefined' && j.def && SENSACION_MUNDOS[j.def.mundo]) || null; return P ? { grav: P[0], jump: P[1], acc: P[2], fr: P[3] } : { grav: 1, jump: 1, acc: 1, fr: 1 }; };
  const suena = n => { if (typeof SONIDO !== 'undefined' && SONIDO.fx) SONIDO.fx(n); };
  const SOLIDOS = '#D';
  function crear(def, st) {
    const M = typeof def.mapa === 'function' ? def.mapa(def) : def.mapa, H = M.length, W = Math.max(...M.map(r => r.length)), at = (c, r) => r < 0 || r >= H || c < 0 || c >= W ? (c < 0 || c >= W ? '#' : '.') : (M[r][c] || '.');
    const j = { t: 0, win: 0, shake: 0, bubbles: [], parts: [], def, st, inv: 0, pose: poseItzel(), W, H, at, foes: [], coins: [], corazones: [], ckpts: [], items: [], vitrales: [], abiertas: new Set(), luz: new Map(),
      p: { x: 0, y: 0, vx: 0, vy: 0, on: false, face: 1, run: 0, sq: 0, vis: true }, g: 1, cam: { x: 0, y: 0 }, fre: { x: 120, y: 80, cool: 0 }, coyote: 0, buf: 0, saltaAntes: false, bloqueo: 0,
      doble: !!def.doble, usado: false, llave: false, pared: !!def.pared, cae: null, avisos: {}, aviso: null, visto: new Set(), franjas: new Map(), S: 0, demo: typeof STATE !== 'undefined' && STATE === 'libro' };
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
      const ch = at(c, r), x = (c + .5) * T, y = (r + 1) * T;
      if (ch === 'P') { j.p.x = x; j.p.y = y; j.safe = { x, y, g: 1 }; }
      else if (ch === 'G') j.meta = { x, y };
      else if (ch === 'o') j.coins.push({ x, y: y - 8, got: false });
      else if (ch === 'C') j.ckpts.push({ x, y, ok: false });
      else if (ch === 'K' || ch === 'J') j.items.push({ k: ch, x, y: y - 9, got: false });
      else if (ch === 'W') j.vitrales.push({ c, r, t: 0 });
      else if (ch === 'w' || ch === 'v') { const k = (def.foes || {})[ch] || def.foe || 'cangrejo', e = MEC.mkFoe(k, x, ch === 'v' ? y - 10 : y); e.tipo = ch; e.dir = -1; e.hx = x; e.hy = e.y; j.foes.push(e); }
    }
    // el cielo usa un nivel vacío del mismo largo, para que su telón se recorra igual
    const filas = Array.from({ length: 15 }, (_, r) => r > 12 ? '#'.repeat(W) : '.'.repeat(W));
    j.cieloL = buildLevelFromRows(filas);
    if (typeof setLevel === 'function') setLevel(j.cieloL);
    if (def.prepara) def.prepara(j);
    camara(j, 1);
    return j;
  }
  // ---------------- el mapa ----------------
  function solido(j, c, r) {
    const ch = j.at(c, r);
    if (ch === '#') return true;
    if (ch === 'D') return !j.abiertas.has(c + ',' + r);
    if (ch === '-') return luzEn(j, c, r) > .35;                 // la roca de ilusión: existe donde la alumbra Fresita
    if (ch === 'W') { const v = j.vitrales.find(q => q.c === c && q.r === r); return !!(v && v.t > 0); }
    // la punta de una escalera se pisa como plataforma, hasta que Itzel aprieta ↓
    if (ch === 'H' && j.at(c, r - 1) !== 'H' && j.g > 0 && !j.trepa && !j.bajando && j.p.y <= r * T + 1) return true;
    return !!(j.def.solido && j.def.solido(j, c, r));
  }
  function luzEn(j, c, r) { const fx = j.fre.x + j.cam.x, fy = j.fre.y + j.cam.y, d = Math.hypot((c + .5) * T - fx, (r + .5) * T - fy); return clamp(1 - (d - 34) / 30, 0, 1); }
  function choca(j, x, y) {
    const g = j.g, top = g > 0 ? y - ALTO : y, bot = g > 0 ? y : y + ALTO;
    const c0 = Math.floor((x - AN) / T), c1 = Math.floor((x + AN - .01) / T), r0 = Math.floor(top / T), r1 = Math.floor((bot - .01) / T);
    for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) if (solido(j, c, r)) return { c, r };
    return null;
  }
  // los picos con arte miden más que su casilla: lastiman en todo lo que se ve (70 % de su alto), no solo en el cuadro
  const tocaPico = (j, hArte) => {
    const p = j.p, g = j.g, top = g > 0 ? p.y - ALTO : p.y, bot = g > 0 ? p.y : p.y + ALTO, hh = Math.max(T, hArte * .7);
    for (let c = Math.floor((p.x - AN) / T); c <= Math.floor((p.x + AN - .01) / T); c++) for (let r = Math.floor(top / T) - 2; r <= Math.floor((bot - .01) / T) + 2; r++) {
      if (j.at(c, r) !== 'x') continue;
      const cuelga = j.at(c, r + 1) !== '#' && j.at(c, r - 1) === '#', y0 = cuelga ? r * T : (r + 1) * T - hh, y1 = cuelga ? r * T + hh : (r + 1) * T;
      if (bot > y0 && top < y1) return { c, r };
    }
    return null;
  };
  const toca = (j, ch) => { if (ch === 'x' && window.PIEZAS_SUBIDA) { const h = PIEZAS_SUBIDA.altoPico(j); if (h > T) return tocaPico(j, h); } const p = j.p, g = j.g, top = g > 0 ? p.y - ALTO : p.y, bot = g > 0 ? p.y : p.y + ALTO; for (let c = Math.floor((p.x - AN) / T); c <= Math.floor((p.x + AN - .01) / T); c++) for (let r = Math.floor(top / T); r <= Math.floor((bot - .01) / T); r++) if (j.at(c, r) === ch) return { c, r }; return null; };
  const avisa = (j, id, txt) => { if (j.avisos[id]) return; j.avisos[id] = 1; j.aviso = { txt, t: 0 }; };
  function golpe(j) { if (dañoModo(j)) { suena('herida'); return true; } return false; }
  function respawn(j) { const s = j.safe; Object.assign(j.p, { x: s.x, y: s.y, vx: 0, vy: 0 }); if (j.g !== s.g) j.g = s.g; j.cae = null; }

  function paso(j, dt) {
    j.t += dt; j.inv = Math.max(0, j.inv - dt); j.shake = Math.max(0, j.shake - dt); j.fre.cool -= dt;
    const p = j.p, def = j.def, k = j.demo ? { right: Math.sin(j.t * .4) > -.2, space: Math.sin(j.t * 1.7) > .8 } : teclas(), Hv = alto(j);
    // Fresita: sigue al cursor; clic usa el poder del nivel; clic derecho canta
    if (!Number.isFinite(j.fre.x) || !Number.isFinite(j.fre.y)) { j.fre.x = p.x - j.cam.x; j.fre.y = p.y - j.cam.y - 30; }   // si algo le dio un NaN, regresa junto a Itzel
    if (MOUSE.active && !j.demo && Number.isFinite(MOUSE.x) && Number.isFinite(MOUSE.y)) { j.fre.x += (MOUSE.x - j.fre.x) * Math.min(1, dt * 9); j.fre.y += (MOUSE.y - j.fre.y) * Math.min(1, dt * 9); }
    else { j.fre.x += (p.x - j.cam.x - p.face * 18 - j.fre.x) * dt * 4; j.fre.y += (p.y - j.cam.y - 30 * j.g - j.fre.y) * dt * 4; }
    for (const c of MOUSE.clicks) {
      if (c.up) continue;
      if (c.b === 2) { for (const e of j.foes) if (e.st === 'ok' && Math.hypot(e.x - j.cam.x - j.fre.x, e.y - j.cam.y - j.fre.y) < 60) { e.st = 'sleep'; e.tt = 4; } chispas(j, j.fre.x + j.cam.x, j.fre.y + j.cam.y, ['#b9a7ff', '#ffffff'], 12, 50); suena('arrullo'); continue; }
      if (j.fre.cool > 0) continue;
      if (def.poder && def.poder(j, j.fre.x + j.cam.x, j.fre.y + j.cam.y) !== false) { j.fre.cool = def.cd || .4; suena('poder'); if (typeof ENCI !== 'undefined' && ENCI.ver) ENCI.ver('poder:' + def.power); }
    }
    MOUSE.clicks.length = 0;
    if (j.demo && def.demo) def.demo(j, dt);
    for (const v of j.vitrales) v.t = Math.max(0, v.t - dt);
    // Itzel
    const dx = (k.right ? 1 : 0) - (k.left ? 1 : 0), g = j.g;
    j.bloqueo = Math.max(0, j.bloqueo - dt);
    const SN = sens(j); if (j.bloqueo <= 0) p.vx += (dx * VEL - p.vx) * Math.min(1, dt * (p.on ? 16 : 9) * (dx ? SN.acc : SN.fr));
    if (dx && j.bloqueo <= 0) p.face = dx;
    j.bajando = !!k.down;
    const escalera = !!toca(j, 'H') || (k.down && j.at(Math.floor(p.x / T), Math.floor(p.y / T)) === 'H');
    if (escalera && (k.up || k.down)) j.trepa = true; if (!escalera) j.trepa = false;
    // horizontal
    if (!j.win) { const nx = p.x + p.vx * dt, h = choca(j, nx, p.y); if (h) { p.x = p.vx > 0 ? h.c * T - AN - .01 : (h.c + 1) * T + AN + .01; p.vx = 0; } else p.x = nx; }
    // pared: se resbala y salta hacia el otro lado
    const lado = j.pared && !p.on && !j.trepa ? [-1, 1].find(s => choca(j, p.x + s * 2, p.y)) : 0;
    if (lado) {
      if (p.vy * g > 60) p.vy = 60 * g; j.colgado = lado; j.ultLado = lado; j.coyPared = .14;
      avisa(j, 'pared', def.paredFresita ? 'Itzel se resbala por la pared. Fresita: clic y la avienta hacia la pared de enfrente.' : 'Salto de pared: brinca mientras te resbalas y sales hacia el otro lado.');
      // polvito del roce contra la pared
      if (p.vy * g > 20 && Math.random() < dt * 14) j.parts.push({ x: p.x + lado * (AN + 1), y: p.y - 4 * g, vx: -lado * 12, vy: -20 * g, life: .35, max: .35, c: 'rgba(255,255,255,.8)', s: 1.1 });
    }
    else j.coyPared = Math.max(0, (j.coyPared || 0) - dt);
    const salta = !!(k.space || (k.up && !escalera)), pres = salta && !j.saltaAntes; j.saltaAntes = salta;
    j.buf = pres ? .12 : Math.max(0, j.buf - dt); j.coyote = p.on ? .1 : Math.max(0, j.coyote - dt);
    if (p.on) j.usado = false;
    if (j.buf > 0 && (j.coyote > 0 || j.trepa)) { p.vy = -SALTO * g * SN.jump; p.on = false; j.trepa = false; j.buf = 0; j.coyote = 0; suena('salto'); }
    else if (!def.paredFresita && j.buf > 0 && j.coyPared > 0 && j.colgado) { p.vy = -SALTO * 1.04 * g; p.vx = -j.colgado * 240; p.face = -j.colgado; j.bloqueo = .14; j.buf = 0; j.coyPared = 0; suena('salto'); chispas(j, p.x + j.colgado * 6, p.y - 10 * g, ['#ffffff'], 6, 30); }
    else if (j.buf > 0 && j.doble && !j.usado && !p.on) { p.vy = -SALTO * .9 * g; j.usado = true; j.buf = 0; suena('salto'); chispas(j, p.x, p.y, ['#ffffff', '#7fe0c0'], 10, 40); }
    j.colgado = lado || 0;
    if (j.trepa) { p.vy = ((k.down ? 1 : 0) - (k.up ? 1 : 0)) * 80; p.vx *= .7; }
    else { j.empujon = Math.max(0, (j.empujon || 0) - dt); if (!salta && p.vy * g < 0 && j.empujon <= 0) p.vy += GRAV * g * SN.grav * dt * 1.25; p.vy += GRAV * g * SN.grav * dt; p.vy = clamp(p.vy, -520, 520); }
    const vy0 = p.vy; p.y += p.vy * dt;
    const h = choca(j, p.x, p.y);
    if (h) {
      const baja = vy0 * g > 0;
      if (baja) { p.y = g > 0 ? h.r * T : (h.r + 1) * T; if (!p.on) { p.sq = .25; if (j.cae !== null && def.caida && (p.y - j.cae) * g > def.caida * T) { if (golpe(j)) avisa(j, 'caida', 'Una caída muy larga lastima a Itzel. Fresita, ponle algo abajo.'); } } p.on = true; }
      else p.y = g > 0 ? (h.r + 1) * T + ALTO : h.r * T - ALTO;
      p.vy = 0;
    } else { if (p.on) j.cae = p.y; p.on = false; }
    if (p.on || j.trepa) j.cae = p.y;
    p.sq *= Math.pow(.001, dt);
    if (Math.abs(p.vx) > 20 && p.on) p.run += Math.abs(p.vx) * dt * .12;
    // punto seguro, púas y caídas fuera del mapa
    // punto seguro: pisando tierra firme con los dos pies (no rocas de ilusión ni vitrales)
    const rp = g > 0 ? Math.floor(p.y / T) : Math.floor(p.y / T) - 1;
    if (p.on && j.at(Math.floor((p.x - AN) / T), rp) === '#' && j.at(Math.floor((p.x + AN) / T), rp) === '#' && !toca(j, 'x')) j.safe = { x: p.x, y: p.y, g };
    if (toca(j, 'x')) { golpe(j); respawn(j); }
    if (p.y > j.H * T + 60 || p.y < -60) { golpe(j); respawn(j); }
    for (const c of j.ckpts) if (!c.ok && Math.abs(c.x - p.x) < 12 && Math.abs(c.y - p.y) < 24) { c.ok = true; j.safe = { x: c.x, y: c.y, g: j.g }; suena('semilla'); chispas(j, c.x, c.y - 12, ['#ffffff', '#ffe27a'], 16, 50); }
    // objetos: canisteles, llave y pluma, puertas
    j.corazones = j.corazones.filter(h => { if (RUN.hearts < RUN.maxHearts && Math.hypot(h.x - p.x, h.y - (p.y - 10 * g)) < 12) { RUN.hearts++; suena('cura'); return false; } return true; });
    for (const c of j.coins) if (!c.got && Math.abs(c.x - p.x) < 10 && Math.abs(c.y - (p.y - 10 * g)) < 16) { c.got = true; RUN.coins++; suena('canistel'); chispas(j, c.x, c.y, ['#ffdd94', '#ffffff']); }
    for (const it of j.items) if (!it.got && Math.abs(it.x - p.x) < 12 && Math.abs(it.y - (p.y - 10 * g)) < 18) {
      it.got = true; suena('fanfarria'); chispas(j, it.x, it.y, ['#7fe0c0', '#ffe27a', '#ffffff'], 30, 80);
      if (it.k === 'J') { j.doble = true; j.aviso = { txt: '¡La pluma de quetzal! Ahora Itzel salta otra vez en el aire. Vuelve a los lugares que no alcanzabas.', t: 0 }; }
      else { j.llave = true; j.aviso = { txt: '¡La llave de jade! Abre la puerta grande del mapa.', t: 0 }; }
    }
    if (j.llave) for (const s of [-1, 1]) { const c = Math.floor((p.x + s * (AN + 3)) / T), r = Math.floor((p.y - 8 * g) / T); if (j.at(c, r) === 'D' && !j.abiertas.has(c + ',' + r)) { for (let rr = r - 4; rr <= r + 4; rr++) if (j.at(c, rr) === 'D') j.abiertas.add(c + ',' + rr); suena('abre'); chispas(j, (c + .5) * T, r * T, ['#7fe0c0', '#ffffff'], 24, 70); } }
    // enemigos
    for (const e of j.foes) {
      e.anim += dt; e.t += dt;
      if (e.st === 'gone') { e.tt += dt; e.y -= 60 * dt; continue; }
      if (e.st === 'sleep') { e.tt -= dt; if (e.tt <= 0) e.st = 'ok'; continue; }
      if (e.tipo === 'v') { e.x = e.hx + Math.sin(e.t * .9) * 36; e.y = e.hy + Math.sin(e.t * 2.1) * 10; e.dir = Math.cos(e.t * .9) > 0 ? 1 : -1; }
      else {
        const v = (e.v || 30) * e.dir, nx = e.x + v * dt, c = Math.floor((nx + e.dir * 6) / T), r = Math.floor((e.y - 4) / T), rp = Math.floor((e.y + 4) / T);
        if (solido(j, c, r) || !solido(j, c, rp) || j.at(c, rp - 1) === 'x') e.dir *= -1; else e.x = nx;
      }
      const w = (e.w || 12) / 2 + AN, hh = (e.h || 10), yc = p.y - 10 * g, ec = e.y - hh / 2;
      if (Math.abs(e.x - p.x) < w && Math.abs(ec - yc) < hh / 2 + 10) {
        if (vy0 * g > 40 && (ec - yc) * g > hh * .2) { e.st = 'gone'; e.tt = 0; p.vy = -395 * g; j.empujon = .3; RUN.stomps++; if (puedeSoltarCorazon()) j.corazones.push({ x:e.x, y:e.y - 8 * g }); suena('pisa'); chispas(j, e.x, e.y - 6, ['#ffffff'], 12, 60); }
        else if (golpe(j)) { p.vy = -220 * g; p.vx = (p.x < e.x ? -1 : 1) * 160; j.bloqueo = .2; }
      }
    }
    if (def.paso) def.paso(j, dt);
    if (j.meta && !j.win && Math.abs(p.x - j.meta.x) < 14 && Math.abs(p.y - j.meta.y) < 28) { j.win = j.t; suena('meta'); chispas(j, j.meta.x, j.meta.y - 30, ['#ffdd94', '#ffffff', '#7fe0c0'], 60, 140); }
    if (j.aviso) { if (!(typeof cartelVisible === 'function' && cartelVisible())) j.aviso.t += dt; if (j.aviso.t > 5.5) j.aviso = null; }
    for (const a of def.ayudas || []) if (a.cuando(j)) avisa(j, a.id, a.txt);
    // lo que ya se vio del mapa (para el mapita)
    j.visto.add(Math.floor(p.x / (T * 6)) + ',' + Math.floor(p.y / (T * 5)));
    camara(j, dt); pasoChispas(j, dt);
  }
  const alto = j => typeof VISTA !== 'undefined' && j.vista === 'juego' ? VISTA.H : VH;
  function camara(j, dt) {
    const p = j.p, Hv = alto(j), rec = typeof VISTA !== 'undefined' && j.vista === 'juego' ? VISTA.rec || 0 : 0;
    const tx = clamp(p.x - VW * (j.def.izquierda ? .6 : .42) + p.vx * .25, -rec, Math.max(-rec, j.W * T - VW + rec));
    const ty = clamp(p.y - Hv * (j.g > 0 ? .58 : .42), Math.min(0, j.H * T - Hv), Math.max(0, j.H * T - Hv));
    j.cam.x += (tx - j.cam.x) * Math.min(1, dt * 5); j.cam.y += (ty - j.cam.y) * Math.min(1, dt * 4);
  }

  // ---------------- dibujo ----------------
  // el terreno de una franja de 13 filas, pintado con el estilo del mundo (y guardado)
  function franja(j, k, S) {
    let c = j.franjas.get(k); if (c) return c;
    const r0 = k * FR - 1, filas = [];
    for (let r = r0; r < r0 + FR + 2; r++) { let s = ''; for (let col = 0; col < j.W; col++) { const ch = j.at(col, r); s += ch === '#' || ch === 'F' ? '#' : 'Tfr'.includes(ch) ? ch : '.'; } filas.push(s); }
    const Lk = buildLevelFromRows(filas), antes = L;
    // las filas 0 y FR+1 son solo contexto (las pinta la franja vecina): sin esto, el borde de la franja se veía como un piso falso
    // y salían hongos, raíces y lianas colgando en el aire o encimados en el terreno
    Lk.tops = Lk.tops.filter(t => t.y >= T - .5 && t.y <= FR * T + .5); Lk.bottoms = Lk.bottoms.filter(b => b.y >= 2 * T - .5 && b.y <= (FR + 1) * T + .5);
    Lk.deco = Lk.deco.filter(o => o.y >= T - .5 && o.y <= FR * T + .5);
    c = mkCanvas(Lk.ww * S, (FR + 2) * T * S); const x = c.getContext('2d'); x.scale(S, S); x.imageSmoothingEnabled = !j.st.pixel;
    try { L = Lk; if (j.def.terreno) j.def.terreno(x, { S, st: j.st, t: 0, cam: 0, franja: true }, j); else j.st.terrain(x, { S, st: j.st, key: j.st.id + '@' + S.toFixed(3) + '|franja' + k + '|' + j.def.id, t: 0, cam: 0, franja: true }); } catch (e) { /* si un estilo truena con una franja, se queda sin pintar */ }
    finally { L = antes; }
    if (j.def.terrenoListo && !j.def.terrenoListo()) return c;   // las imágenes del terreno propio aún no llegan: se pinta sin guardar
    j.franjas.set(k, c); return c;
  }
  function pintar(j, view) {
    // estilo derivado (p. ej. Game Boy): se pinta con su estilo base en el búfer y luego se procesa (4 verdes), como hace View.render
    if (view.st.base && !view._derivando && view.buf && view.bctx) {
      const der = view.st, vista = typeof canvas !== 'undefined' && view.ctx === canvas.getContext('2d') ? 'juego' : 'libro';
      const vv = Object.create(view); vv.st = STYLE_MAP[der.base]; vv.S = view.bS || der.baseS(view.S); vv.ctx = view.bctx; vv._derivando = true;
      const antes = window.estiloArteDerivado;
      try { window.estiloArteDerivado = der.id; pintar(j, vv); } finally { window.estiloArteDerivado = antes; }
      j.vista = vista;
      const c = view.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.filter = 'none';
      der.process(view.buf, view.bctx, c, view);
      return;
    }
    // sin búfer (la miniatura de la enciclopedia) un estilo derivado se dibuja con su base, sin el procesado
    if (view.st.base && !view._derivando) { const vv = Object.create(view); vv.st = STYLE_MAP[view.st.base]; vv._derivando = true; return pintar(j, vv); }
    const st = view.st, S = view.S, ctx = view.ctx, t = j.t, p = j.p, def = j.def;
    j.vista = typeof canvas !== 'undefined' && view.ctx === canvas.getContext('2d') ? 'juego' : 'libro';
    const Hv = alto(j); if (j.S !== S) { j.franjas.clear(); j.S = S; }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(S, 0, 0, S, 0, 0); ctx.imageSmoothingEnabled = !st.pixel;
    const antes = L; L = j.cieloL;
    const f = { t, cam: L.camMin + clamp(j.cam.x, 0, L.camMax - L.camMin), S, g: { p, t, cam: j.cam.x }, st, key: st.id + '@' + S.toFixed(3), y0: VH - Hv, H: Hv };
    telon(ctx, st, f, Hv);
    // más hondo, más oscuro (o más alto, más claro), según el nivel
    if (def.tinte) def.tinte(ctx, j, Hv);
    ctx.save(); ctx.translate(-j.cam.x, -j.cam.y);
    const fw = Object.assign({}, f, { cam: j.cam.x, g: { p, t, cam: j.cam.x, foes: j.foes } });
    if (def.pinta) def.pinta(ctx, j, fw, 'atras');
    // lo macizo lleva un relleno de roca debajo del arte: hay estilos que solo pintan la orilla del terreno
    { const c0 = Math.floor(j.cam.x / T) - 1, c1 = Math.ceil((j.cam.x + VW) / T) + 1, r0 = Math.floor(j.cam.y / T) - 1, r1 = Math.ceil((j.cam.y + Hv) / T) + 1;
      ctx.fillStyle = typeof def.relleno === 'function' ? def.relleno(ctx) : def.relleno || '#1c1824'; ctx.beginPath();
      for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) { const ch = j.at(c, r); if (ch === '#' || ch === 'F') ctx.rect(c * T - .3, r * T - .3, T + .6, T + .6); }
      ctx.fill(); if (def.rellenoSombra) { ctx.fillStyle = def.rellenoSombra; ctx.fill(); } }    // sombra encima del relleno (si el estilo la pide)
    // terreno en franjas
    const k0 = Math.floor(j.cam.y / (FR * T)) - 1, k1 = Math.floor((j.cam.y + Hv) / (FR * T)) + 1;
    for (let k = Math.max(0, k0); k <= Math.min(Math.ceil(j.H / FR), k1); k++) {
      const c = franja(j, k, S), y = k * FR * T, sx = PAD * T * S;
      const x0 = Math.max(0, j.cam.x - 20), x1 = Math.min(j.W * T, j.cam.x + VW + 20);
      ctx.drawImage(c, sx + x0 * S, T * S, (x1 - x0) * S, FR * T * S, x0, y, x1 - x0, FR * T);
    }
    pintaPiezas(ctx, j, fw);
    if (def.pinta) def.pinta(ctx, j, fw, 'medio');
    for (const c of j.coins) if (!c.got) monedaItzel(ctx, c.x, c.y, t, fw);
    for (const h of j.corazones) { drawHeart(ctx, h.x, h.y + Math.sin(t * 3) * 1.5, 5, '#7a0f2a'); drawHeart(ctx, h.x, h.y + Math.sin(t * 3) * 1.5, 4, '#ff3b5c'); }
    if (j.meta) st.goal(ctx, j.meta.x, j.meta.y, t, fw);
    for (const e of j.foes) if (e.st !== 'gone' || e.tt < .7) { ctx.save(); if (e.st === 'gone') ctx.globalAlpha = clamp(1 - e.tt / .7, 0, 1); MEC.drawFoe(ctx, e, fw, def.skin || (NIVELES[def.mundo] || {}).skin || MEC.DEFAULT_SKIN); ctx.restore(); }
    // Itzel (de cabeza si la gravedad va hacia arriba)
    if (!(j.inv > 0 && Math.floor(j.inv * 14) % 2)) {
      const pared = j.colgado && !p.on && !j.trepa ? j.colgado : 0;
      Object.assign(j.pose, { x: p.x, y: p.y, face: pared || p.face, on: p.on || j.trepa, vx: j.trepa ? 0 : p.vx, vy: p.vy * j.g, run: p.run, vis: true, sq: p.sq, pared: pared ? 1 : 0 });
      const jugador = def.dibujaJugador ? (c, pose, f) => def.dibujaJugador(c, pose, f, j, st) : st.player;
      if (j.g < 0) { ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1, -1); Object.assign(j.pose, { x: 0, y: 0 }); jugador(ctx, j.pose, fw); ctx.restore(); }
      else jugador(ctx, j.pose, fw);
    }
    if (def.pinta) def.pinta(ctx, j, fw, 'frente');
    pintaChispas(ctx, j);
    ctx.restore();
    // Fresita: siempre el mismo objeto (así su títere recuerda hacia dónde iba, sus vueltas y su mareo) y mira hacia donde se mueve
    if (st.fresita) {
      const v = j.freVista || (j.freVista = { x: j.fre.x, y: j.fre.y, face: 1 }), dx = j.fre.x - v.x;
      if (Math.abs(dx) > .35) v.face = Math.sign(dx);
      v.x = j.fre.x; v.y = j.fre.y; v.atrapada = j.fre.atrapada; v.daze = j.fre.daze;
      st.fresita(ctx, v, f);
    }
    if (st.over && !def.sinOver) { ctx.save(); ctx.setTransform(S, 0, 0, S * Hv / VH, 0, 0); st.over(ctx, f); ctx.restore(); }
    L = antes;
    hud(ctx, j, Hv);
  }
  // escaleras, púas, vitrales, rocas de ilusión, muros falsos, puertas, llave, pluma y puntos de control
  function pintaPiezas(ctx, j, f) {
    const x0 = Math.floor(j.cam.x / T) - 1, x1 = Math.ceil((j.cam.x + VW) / T) + 1, y0 = Math.floor(j.cam.y / T) - 1, y1 = Math.ceil((j.cam.y + alto(j)) / T) + 1, sk = j.def.skin || {}, t = j.t;
    for (let r = y0; r <= y1; r++) for (let c = x0; c <= x1; c++) {
      const ch = j.at(c, r), X = c * T, Y = r * T; if (ch === '.' || ch === '#') continue;
      if (ch === 'H' && window.PIEZAS_SUBIDA && PIEZAS_SUBIDA.escalera(ctx, j, c, r, X, Y)) continue;
      if (ch === 'x' && window.PIEZAS_SUBIDA && PIEZAS_SUBIDA.pico(ctx, j, c, r, X, Y, j.at(c, r + 1) !== '#' && j.at(c, r - 1) === '#')) continue;
      if (ch === 'H') { ctx.strokeStyle = '#3a2614'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(X + 3, Y); ctx.lineTo(X + 3.6, Y + T); ctx.moveTo(X + 13, Y); ctx.lineTo(X + 12.4, Y + T); ctx.stroke(); ctx.strokeStyle = '#b08850'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(X + 3, Y); ctx.lineTo(X + 3.6, Y + T); ctx.moveTo(X + 13, Y); ctx.lineTo(X + 12.4, Y + T); ctx.stroke(); ctx.lineWidth = 1.2; ctx.beginPath(); for (const a of [4, 11]) { ctx.moveTo(X + 3, Y + a); ctx.lineTo(X + 13, Y + a + .6); } ctx.stroke(); }
      else if (ch === 'x') { ctx.fillStyle = sk.accent || '#d8203a'; ctx.strokeStyle = sk.line || '#222'; ctx.lineWidth = .5; const arriba = j.at(c, r + 1) !== '#' && j.at(c, r - 1) === '#'; ctx.beginPath(); for (let i = 0; i < 4; i++) { const a = X + i * 4; if (arriba) { ctx.moveTo(a, Y); ctx.lineTo(a + 2, Y + 10); ctx.lineTo(a + 4, Y); } else { ctx.moveTo(a, Y + T); ctx.lineTo(a + 2, Y + 6); ctx.lineTo(a + 4, Y + T); } } ctx.fill(); ctx.stroke(); }
      else if (ch === 'W') { const v = j.vitrales.find(q => q.c === c && q.r === r), on = v && v.t > 0, a = on ? Math.min(1, v.t) : 0; const cols = ['#e04050', '#3a7ad8', '#f2c230', '#3aa860']; for (let i = 0; i < 4; i++) { ctx.fillStyle = rgba(cols[(i + c + r) % 4], on ? .55 + a * .35 : .18); ctx.fillRect(X + (i % 2) * 8, Y + Math.floor(i / 2) * 8, 8, 8); } ctx.strokeStyle = on ? '#fff3c4' : 'rgba(40,30,40,.5)'; ctx.lineWidth = on ? 1 : .6; ctx.strokeRect(X + .5, Y + .5, T - 1, T - 1); ctx.beginPath(); ctx.moveTo(X + 8, Y); ctx.lineTo(X + 8, Y + T); ctx.moveTo(X, Y + 8); ctx.lineTo(X + T, Y + 8); ctx.stroke(); if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, X + 8, Y + 8, 18, '#fff3c4', .25 * a); ctx.restore(); } }
      else if (ch === '-') { const l = luzEn(j, c, r); ctx.globalAlpha = .15 + l * .75; ctx.fillStyle = sk.plat || '#8a7a9a'; ctx.fillRect(X, Y + 2, T, T - 4); ctx.strokeStyle = '#ffffff'; ctx.setLineDash(l > .35 ? [] : [2, 2]); ctx.lineWidth = .7; ctx.strokeRect(X + .5, Y + 2.5, T - 1, T - 5); ctx.setLineDash([]); ctx.globalAlpha = 1; }
      else if (ch === 'F') { const l = luzEn(j, c, r); if (l > .05) { ctx.globalAlpha = l * .8; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = .7; ctx.setLineDash([2, 2]); ctx.strokeRect(X + 1, Y + 1, T - 2, T - 2); ctx.setLineDash([]); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(X, Y, T, T); ctx.globalAlpha = 1; } }
      else if (ch === 'D' && !j.abiertas.has(c + ',' + r)) { ctx.fillStyle = '#2f6a5a'; ctx.fillRect(X + 2, Y, T - 4, T); ctx.strokeStyle = '#7fe0c0'; ctx.lineWidth = .8; ctx.strokeRect(X + 2.5, Y + .5, T - 5, T - 1); if (j.at(c, r - 1) !== 'D') { ctx.fillStyle = '#7fe0c0'; ctx.beginPath(); ctx.arc(X + 8, Y + 6, 2.4, 0, TAU); ctx.fill(); } }
    }
    for (const it of j.items) if (!it.got) { const y = it.y + Math.sin(t * 2.4) * 2; ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, it.x, y, 16, it.k === 'J' ? '#7fe0c0' : '#ffe27a', .5); ctx.restore();
      if (it.k === 'J') { ctx.fillStyle = '#2f9a6c'; ctx.beginPath(); ctx.ellipse(it.x, y, 2.6, 8, .5, 0, TAU); ctx.fill(); ctx.strokeStyle = '#d8203a'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(it.x - 3, y + 6); ctx.lineTo(it.x + 3, y - 6); ctx.stroke(); }
      else { ctx.fillStyle = '#3fb08a'; ctx.beginPath(); ctx.arc(it.x - 2, y, 3.2, 0, TAU); ctx.fill(); ctx.fillRect(it.x, y - 1, 7, 2.2); ctx.fillRect(it.x + 4, y, 1.6, 3.2); ctx.strokeStyle = '#1f5a48'; ctx.lineWidth = .5; ctx.stroke(); } }
    for (const c of j.ckpts) { if (window.PIEZAS_SUBIDA && PIEZAS_SUBIDA.bandera(ctx, j, c.x, c.y, c.ok, t)) continue; ctx.strokeStyle = '#3a2418'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x, c.y - 22); ctx.stroke(); ctx.fillStyle = c.ok ? '#3fa36b' : '#c8203a'; ctx.beginPath(); ctx.moveTo(c.x, c.y - 22); ctx.lineTo(c.x + 10, c.y - 19 + Math.sin(t * 4) * 1.2); ctx.lineTo(c.x, c.y - 15); ctx.fill(); }
  }
  function hud(ctx, j, Hv) {
    const rec = j.vista === 'juego' && typeof VISTA !== 'undefined' ? VISTA.rec || 0 : 0;
    if (j.aviso) { const a = Math.min(1, j.aviso.t * 4, (5.5 - j.aviso.t) * 2); ctx.save(); ctx.globalAlpha = a; ctx.font = '7px "Alegreya Sans", sans-serif'; const w = Math.min(VW - 60, ctx.measureText(j.aviso.txt).width + 16); ctx.fillStyle = 'rgba(30,20,26,.78)'; ctx.beginPath(); roundRect(ctx, VW / 2 - w / 2, 40, w, 14, 4); ctx.fill(); ctx.fillStyle = '#fff3c4'; ctx.textAlign = 'center'; ctx.fillText(j.aviso.txt, VW / 2, 50, w - 8); ctx.textAlign = 'left'; ctx.restore(); }
    // mapita de lo explorado (solo en los niveles para explorar)
    if (j.def.mapita) {
      const cw = 6, ch = 5, s = 4, mx = VW - rec - 12 - Math.ceil(j.W / cw) * s, my = 40;
      ctx.fillStyle = 'rgba(20,14,22,.6)'; ctx.fillRect(mx - 3, my - 3, Math.ceil(j.W / cw) * s + 6, Math.ceil(j.H / ch) * s + 6);
      for (const k of j.visto) { const [a, b] = k.split(',').map(Number); ctx.fillStyle = 'rgba(255,243,196,.55)'; ctx.fillRect(mx + a * s, my + b * s, s - .6, s - .6); }
      ctx.fillStyle = '#ff8cc6'; ctx.fillRect(mx + Math.floor(j.p.x / (T * cw)) * s, my + Math.floor(j.p.y / (T * ch)) * s, s - .6, s - .6);
      if (j.meta) { ctx.strokeStyle = '#ffe27a'; ctx.lineWidth = .8; ctx.strokeRect(mx + Math.floor(j.meta.x / (T * cw)) * s, my + Math.floor((j.meta.y - 1) / (T * ch)) * s, s - .6, s - .6); }
      ctx.font = 'bold 5.5px "Alegreya Sans", sans-serif'; ctx.fillStyle = '#fff3c4'; ctx.fillText(`${j.doble ? 'pluma' : ''}${j.doble && j.llave ? '  ' : ''}${j.llave ? 'llave de jade' : ''}`, mx, my + Math.ceil(j.H / ch) * s + 9);
    }
  }
  // el salto de pared cuando lo da Fresita (en los niveles con `paredFresita`)
  function saltaPared(j) {
    const p = j.p, g = j.g, lado = j.colgado || j.ultLado;
    if (!(j.coyPared > 0) || !lado || p.on) return false;
    p.vy = -SALTO * 1.04 * g; p.vx = -lado * 240; p.face = -lado; j.bloqueo = .14; j.coyPared = 0; j.colgado = 0; j.empujon = .4;
    suena('salto'); chispas(j, p.x + lado * 6, p.y - 10 * g, ['#ffffff', '#ffd1ea'], 10, 40);
    return true;
  }
  return { crear, paso, pintar, solido, luzEn, avisa, saltaPared, alto: true, plataformas: true };
})();
MODOS.propio = PROPIO;
// un nivel propio se registra como nivel alterno de su mundo; pesa más al escoger para que salga seguido
function nivelPropio(id, mundo, def) {
  nivel(id, Object.assign({ modo: 'propio', mundo, plat: NIVELES[mundo].plat, skin: NIVELES[mundo].skin, W: 40, peso: 2 }, def));
  (NIVELES_ALT[mundo] = NIVELES_ALT[mundo] || []).push(id);
}
