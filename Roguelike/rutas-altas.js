'use strict';
// =====================================================================
//  RUTAS ALTAS
//  La vista crece hacia arriba en ventanas menos anchas que 16:9 (ver ALTO_MUNDO):
//  arriba de la fila 0 hay 4 filas de cielo. Cada nivel gana ahí una o dos rutas:
//  sobre un tramo de piso corrido (sin barrancos, objetos ni enemigos debajo) sube una escalera
//  de plataformas (con el look del mundo) y arriba sigue un balcón con monedas. Es un desvío con
//  premio, no un atajo: termina sin salida y se baja saltando. Son pocas (0 a 2) y cada una sale
//  distinta (ancho, subida, huecos, altura, lado y largo) según la semilla de la partida.
//  Las monedas de arriba de la fila 0 no caben en la cuadrícula: van como entidades.
// =====================================================================
(function () {
  const ARR = -1;                       // fila del camino de arriba (la -1 queda dentro de la vista alta)

  function rutas(def, nv) {
    const rows = nv.rows, W = rows[0].length, H = rows.length, ents = nv.ents;
    // los mundos de agua se nadan: no hace falta escalera
    if (def.id === 'nouveau' || def.id === 'paper' || def.escenarioUayamon || ents.some(e => e.k === 'water')) return;
    const solido = (x, y) => y >= 0 && y < H && x >= 0 && x < W && rows[y][x] === '#';
    const ocupadoGrid = (x, y) => y >= 0 && y < H && x >= 0 && x < W && rows[y][x] !== '.';
    const suelo = x => { for (let y = 0; y < H; y++) if (rows[y][x] === '#') return y; return H; };
    // celdas cerca de piezas del nivel (plataformas, sólidos, objetos) quedan libres; los enemigos no estorban
    const tocado = new Set(), marca = (x, y) => tocado.add(x + ',' + y);
    for (const e of ents) {
      if (e.t === 'foe' || e.t === 'coin' || e.t === 'corazon') continue;
      if (e.t === 'zone') { for (let x = e.x0 - 2; x <= e.x1 + 2; x++) for (let y = e.y0 - 4; y <= e.y1 + 1; y++) marca(x, y); continue; }
      const ex = e.x ?? e.x0; if (ex === undefined) continue;
      const w = (e.w || 1) + (e.x2 !== undefined ? e.x2 - ex : 0), h = e.h || 1;
      const ey = e.y === undefined || (e.t === 'obj' && !e.y) ? suelo(Math.floor(ex)) - 1 : e.y;
      // algunas piezas ocupan distinto: la piñata cuelga de su cuerda, la vela es chiquita, las ánimas caminan
      if (e.k === 'anima' || e.k === 'carnaval') continue;
      if (e.k === 'pinata') { const baja = Math.ceil((e.cuerda || 26) / T) + 2; for (let x = Math.floor(ex) - 3; x <= Math.ceil(ex) + 3; x++) for (let y = ey - 4; y <= ey + baja; y++) marca(x, y); continue; }
      if (e.k === 'vela' || e.k === 'confeti') { for (let x = Math.floor(ex) - 1; x <= Math.ceil(ex) + 1; x++) for (let y = ey - 2; y <= ey; y++) marca(x, y); continue; }
      if (e.k === 'guirnalda') { for (let x = Math.floor(ex); x <= Math.ceil(e.x2); x++) for (let y = ey - 1; y <= ey + 2; y++) marca(x, y); continue; }
      for (let x = Math.floor(ex) - 2; x <= Math.ceil(ex + w) + 1; x++) for (let y = ey - 4; y <= ey + h + 1; y++) marca(x, y);
    }
    // árboles, flores y piedras de adorno: la copa de un árbol ocupa varias filas hacia arriba
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const ch = rows[y][x];
      if (ch === 'T') for (let i = x - 2; i <= x + 2; i++) for (let j = y - 4; j <= y; j++) marca(i, j);
      else if (ch === 'f' || ch === 'r') for (let i = x - 1; i <= x + 1; i++) for (let j = y - 2; j <= y; j++) marca(i, j);
    }
    const libre = (x, y) => !ocupadoGrid(x, y) && !(y >= 0 && tocado.has(x + ',' + y));
    // arriba de la plataforma basta con que no haya nada sólido (las monedas no estorban)
    const aire = (x, y) => y < 0 || y >= H || (rows[y][x] === '.' || rows[y][x] === 'o') && !tocado.has(x + ',' + y);

    // el azar de la ruta cambia con la partida (y con el mundo), igual que las piezas
    const sem = typeof RUN === 'object' && RUN ? ((RUN.seed * 2654435761) ^ (RUN.world * 40503) ^ (RUN.idx * 9973)) >>> 0 : (Math.random() * 4e9) >>> 0;
    const rand = typeof rng === 'function' ? rng(sem ^ (W * 31)) : Math.random;
    for (let i = 0; i < 6; i++) rand();
    const entre = (a, b) => a + Math.floor(rand() * (b - a + 1));
    // una ruta alta es un desvío con premio, no un atajo: termina sin salida (se baja saltando), así que lo único
    // que podría saltarse son barrancos. Por eso bajo todo su tramo tiene que haber piso corrido
    const tramoLimpio = (a, z) => { for (let cx = a - 1; cx <= z + 1; cx++) if (suelo(cx) >= H) return false; return true; };
    // ¿alcanza un brinco normal (sin ayuda de Fresita)? mismo cálculo que piezas.js: hueco en columnas y filas que sube
    const alcanza = (hueco, sube) => { const d = JUMP * JUMP - 2 * G * sube * T; return d > 0 && hueco * T <= MAXV * (JUMP + Math.sqrt(d)) / G - 36 && (sube < 3 || hueco <= 1); };
    const cabeW = (x, y, w) => { if (x < 6 || x + w > W - 8) return false; for (let i = 0; i < w; i++) { if (!libre(x + i, y) || solido(x + i, y + 1)) return false; for (let j = y - 3; j < y; j++) if (!aire(x + i, j)) return false; } return true; };

    // anclas: terreno plano (2 columnas), lejos del inicio y de la meta; en orden al azar, no la más alta primero
    const cand = [];
    for (let x = 10; x < W - 16; x++) { const r = suelo(x); if (r <= 11 && suelo(x + 1) === r && suelo(x - 1) <= r + 1 && aire(x, r - 1)) cand.push({ x, r }); }
    for (let i = cand.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [cand[i], cand[j]] = [cand[j], cand[i]]; }
    // pocas: casi siempre una, y en niveles anchos a veces una segunda; algunos niveles no traen ninguna
    const max = rand() < .15 ? 0 : (W >= 170 && rand() < .4 ? 2 : 1), hechas = [];

    let premio = false, ruta = 0, intentos = 0;
    for (const a of cand) {
      if (hechas.length >= max || ++intentos > 60) break;
      if (!hechas.every(x => Math.abs(x - a.x) >= 40)) continue;
      // cada ruta sale distinta: ancho de los escalones, cuánto sube, qué tan separados, a qué altura y cuántos tramos arriba
      const w = rand() < .6 ? 3 : 4, sube = rand() < .45 ? 2 : 3, arr = rand() < .3 ? -2 : ARR, hueco = entre(0, 2), arriba = entre(1, 3), sepArriba = entre(2, 3), izqPrimero = rand() < .35;
      const nuevas = [], monedas = [];
      let x = a.x, r = a.r, ok = true;
      while (r > arr) {
        const nr = Math.max(arr, r - sube);
        const paso = t => { const q = Math.min(x, t), z = Math.max(x + w - 1, t + w - 1); for (let cx = q; cx <= z; cx++) for (let cy = nr - 2; cy < r; cy++) if (solido(cx, cy)) return false; return true; };
        const der = [x + w + hueco, x + w + hueco + 1, x + w + (hueco + 2) % 3], izq = [x - w - 1 - hueco % 2, x - w - 1];
        const nx = (izqPrimero ? [...izq, ...der] : [...der, ...izq]).find(t => cabeW(t, nr, w) && paso(t) && alcanza(Math.max(0, t > x ? t - (x + w) : x - (t + w)), r - nr));
        if (nx === undefined) { ok = false; break; }
        nuevas.push({ x: nx, y: nr }); x = nx; r = nr;
      }
      if (!ok || !nuevas.length) continue;
      // el tramo de arriba sigue hacia donde iba la escalera y termina en un balcón sin salida: se baja saltando
      const dir = nuevas.length > 1 && nuevas[nuevas.length - 1].x < nuevas[0].x ? -1 : 1;
      for (let i = 0; i < arriba; i++) {
        const nx = dir > 0 ? x + w + sepArriba : x - w - sepArriba;
        if (!cabeW(nx, arr, w) || !alcanza(sepArriba, 0)) break;
        const c0 = dir > 0 ? x + w : nx + w; // el hueco entre las dos
        monedas.push([c0 + sepArriba / 2 - .5, arr - 2.2 - (sepArriba > 2 ? .4 : 0)], [c0 + sepArriba / 2 + .5, arr - 2.4]);
        nuevas.push({ x: nx, y: arr, top: true }); x = nx;
      }
      // todo lo que ocupa (escalera y camino) tiene que estar sobre piso limpio
      const xs = nuevas.map(p => p.x), a0 = Math.min(a.x, ...xs), a1 = Math.max(a.x + w, ...xs.map(v => v + w));
      if (!tramoLimpio(a0, a1)) continue;
      for (const p of nuevas) { ents.push({ t: 'plat', x: p.x, y: p.y, w, o: { k: def.id === 'bruma' ? 'reveal' : 'static', alta: true, ruta, desde: p === nuevas[0] ? [a.x, a.r] : null } }); }
      ruta++; hechas.push(a.x);
      for (const p of nuevas) if (p.y === arr && rand() < .85) for (let i = 0; i < w; i++) monedas.push([p.x + i + .5, arr - .6, 'plat']);
      for (const [mx, my, tipo] of monedas) ents.push({ t: 'coin', x: mx, y: my, platTop: tipo === 'plat' });
      const fin = nuevas[nuevas.length - 1];
      if (!premio) { ents.push({ t: 'corazon', x: fin.x + w / 2, y: fin.y - 1.4 }); premio = true; }
    }
  }

  const prev = construirNivel;
  construirNivel = function (def) { const nv = prev(def); try { rutas(def, nv); } catch (e) { console.warn('rutas altas', def.id, e); } return nv; };

  // monedas y corazones que viven arriba de la fila 0
  const iniPrev = MEC.init;
  MEC.init = function (g, def, ents) {
    const r = iniPrev.apply(this, arguments);
    for (const e of ents || []) {
      if (e.t === 'coin') g.coins.push({ x: (e.x + PAD) * T, y: e.y * T, got: false, alta: true });
      else if (e.t === 'corazon' && g.pickups) g.pickups.push({ k: 'heart', x: (e.x + PAD) * T, y: e.y * T, got: false });
    }
    return r;
  };
  window.RUTAS_ALTAS = rutas;
})();
