'use strict';
// =====================================================================
//  MECANICAS POR NIVEL: plataformas especiales, enemigos propios y
//  el poder de Fresita de cada nivel.
// =====================================================================

// ---------- solidos dinamicos (bloques que aparecen o desaparecen) ----------
let DYN = [];
function SOLID(x, y) {
  if (solidAt(x, y)) return true;
  for (let i = 0; i < DYN.length; i++) { const s = DYN[i]; if (s.on && x >= s.x && x < s.x + s.w && y >= s.y && y < s.y + s.h) return true; }
  return false;
}
// orilla del sólido que hay en (x, y): los bloques del nivel van en la cuadrícula, pero los sólidos
// que se mueven (la plastilina) pueden quedar a media loseta; sin esto Itzel no los toma como piso
function borde(x, y, lado) {
  if (!solidAt(x, y)) for (const s of DYN) if (s.on && x >= s.x && x < s.x + s.w && y >= s.y && y < s.y + s.h)
    return lado === 'arriba' ? s.y : lado === 'abajo' ? s.y + s.h : lado === 'izq' ? s.x : s.x + s.w;
  const c = lado === 'arriba' || lado === 'abajo' ? y : x, b = Math.floor(c / T) * T;
  return lado === 'arriba' || lado === 'izq' ? b : b + T;
}

const MEC = (() => {
  // tablas que llenan otros archivos (mecanicas-nuevas.js): looks de plataforma,
  // tipos de plataforma, comportamientos de enemigo y objetos del escenario
  const LOOK = {}, PK = {}, BEH = {}, OBJ = {}, LANDK = {};
  // zonas con lógica propia (remolino de óleo, tinta en la pared…) y luz extra (el haz del faro): las llenan otros archivos
  const ZONAS = {}, PINTA_ZONA = {}, PINTA_SOLIDO = {};   // Ganchos de dibujo sin cambiar la física.
  let luzExtra = () => false;
  const tl = v => v * T;                      // tiles -> mundo
  const tx = v => (v + PAD) * T;              // columna de nivel -> mundo
  const surf = (wx, fromY = 0) => L.surfaceY(Math.floor(wx / T), Math.max(0, Math.floor(fromY / T))) * T;

  // ================= PLATAFORMAS =================
  function mkPlat(o) {
    const p = Object.assign({ k: 'static', look: 'plain', h: 6, t: 0, on: true, dx: 0, dy: 0, st: null, tt: 0, stood: false }, o);
    p.x0 = p.x; p.y0 = p.y; return p;
  }
  // Cada trazo agrupa pequeños segmentos para que su forma y su colisión coincidan.
  function trazaLapiz(g, x, y) {
    const tr = g.trazoLapiz; if (!tr || !Number.isFinite(x) || !Number.isFinite(y)) return;
    const dx = x - tr.x, dy = y - tr.y, distancia = Math.hypot(dx, dy);
    if (distancia < 1.5 || tr.segmentos >= 800) return;
    // Muestrear el recorrido evita que un movimiento rápido atraviese el suelo.
    const pasos = Math.ceil(distancia / 2), ax = tr.x, ay = tr.y;
    let creados = 0;
    for (let i = 0; i < pasos && tr.segmentos + creados < 800; i++) {
      let x0 = ax + dx * i / pasos, y0 = ay + dy * i / pasos, x1 = ax + dx * (i + 1) / pasos, y1 = ay + dy * (i + 1) / pasos;
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      if (SOLID(x0, y0) || SOLID(mx, my) || SOLID(x1, y1)) continue;
      // en el cuaderno el lápiz gasta tinta (g.tinta, ver cuaderno-dibujos.js): sin tinta no se dibuja
      if (g.tintaMax !== undefined) { const ds = Math.hypot(x1 - x0, y1 - y0); if (g.tinta < ds) { g.sinTintaT = 1.2; break; } g.tinta -= ds; }
      // No insertar tinta dentro del cuerpo de Itzel.
      const p = g.p;
      if (p && mx > p.x - p.w / 2 && mx < p.x + p.w / 2 && my > p.y - p.h && my < p.y) continue;
      if (!tr.iniciado) {
        const trazos = [...new Set(g.plats.filter(q => q.trazoLapiz).map(q => q.trazoLapiz))];
        while (trazos.length >= 3) { const viejo = trazos.shift(); g.plats = g.plats.filter(q => q.trazoLapiz !== viejo); }
        tr.iniciado = true;
      }
      if (x1 < x0) { [x0, x1] = [x1, x0]; [y0, y1] = [y1, y0]; }
      const pisable = Math.abs(x1 - x0) >= .1 && Math.abs(y1 - y0) <= Math.abs(x1 - x0) * 2;
      g.plats.push(mkPlat({ k: 'seg', look: 'pencil', x: x0, y: y0, x2: x1, y2: y1, w: x1 - x0, on: pisable, verSiempre: true, life: 12, pw: true, trazoLapiz: tr.id })); creados++;
    }
    tr.segmentos += creados; tr.x = x; tr.y = y;
    for (const pl of g.plats) if (pl.trazoLapiz === tr.id) pl.life = 12;
  }
  // Proyecta un segmento sobre uno de los ejes, limitado por el rectángulo de Itzel.
  function tramoEnRango(a, b, c, d, minimo, maximo) {
    const delta = d - c;
    if (Math.abs(delta) < 1e-8) return c >= minimo && c <= maximo ? [Math.min(a, b), Math.max(a, b)] : null;
    const u0 = (minimo - c) / delta, u1 = (maximo - c) / delta;
    const lo = Math.max(0, Math.min(u0, u1)), hi = Math.min(1, Math.max(u0, u1));
    if (lo > hi) return null;
    const v0 = a + (b - a) * lo, v1 = a + (b - a) * hi; return [Math.min(v0, v1), Math.max(v0, v1)];
  }
  function muroLapiz(g, anteriorX) {
    const p = g.p, dx = p.x - anteriorX; if (!dx) return;
    const mitad = p.w / 2, superior = p.y - p.h + .5, inferior = p.y - .8;
    let limite = p.x;
    for (const pl of g.plats) {
      if (!pl.trazoLapiz || pl.dead) continue;
      // Los segmentos transitables del suelo actual siguen siendo una rampa.
      if (pl.on && p.on && p.plat && p.plat.trazoLapiz === pl.trazoLapiz && Math.abs(platTop(pl, clamp(p.x, pl.x, pl.x2)) - p.y) < 12) continue;
      const tramo = tramoEnRango(pl.x, pl.x2, pl.y, pl.y2, superior, inferior); if (!tramo) continue;
      if (dx > 0 && anteriorX + mitad <= tramo[0] + .25 && limite + mitad >= tramo[0]) limite = Math.min(limite, tramo[0] - mitad - .05);
      if (dx < 0 && anteriorX - mitad >= tramo[1] - .25 && limite - mitad <= tramo[1]) limite = Math.max(limite, tramo[1] + mitad + .05);
    }
    if (limite !== p.x) { p.x = limite; p.vx = 0; p.dash = 0; }
  }
  function pisoLapiz(g, anteriorY) {
    const p = g.p; if (p.y < anteriorY) return false;
    const izq = p.x - p.w / 2 + .5, der = p.x + p.w / 2 - .5; let techo = Infinity;
    for (const pl of g.plats) {
      if (!pl.trazoLapiz || pl.dead || pl.on) continue; // las pendientes caminables usan land()
      const tramo = tramoEnRango(pl.y, pl.y2, pl.x, pl.x2, izq, der); if (!tramo) continue;
      if (anteriorY <= tramo[0] + .25 && p.y >= tramo[0]) techo = Math.min(techo, tramo[0]);
    }
    if (!Number.isFinite(techo)) return false;
    p.y = techo - .05; p.vy = 0; p.plat = null; return true;
  }
  function techoLapiz(g, anteriorY) {
    const p = g.p; if (p.y >= anteriorY) return;
    const izq = p.x - p.w / 2 + .5, der = p.x + p.w / 2 - .5, topAntes = anteriorY - p.h;
    let limite = p.y;
    for (const pl of g.plats) {
      if (!pl.trazoLapiz || pl.dead) continue;
      const tramo = tramoEnRango(pl.y, pl.y2, pl.x, pl.x2, izq, der); if (!tramo) continue;
      if (topAntes >= tramo[1] - .25 && limite - p.h <= tramo[1]) limite = Math.max(limite, tramo[1] + p.h + .05);
    }
    if (limite !== p.y) { p.y = limite; p.vy = 0; p.noCut = false; }
  }
  function platTop(pl, x) { if (pl.k === 'seg') { const u = clamp((x - pl.x) / (pl.x2 - pl.x), 0, 1); return lerp(pl.y, pl.y2, u); } return pl.y; }
  function platSpan(pl) { return pl.k === 'seg' ? [Math.min(pl.x, pl.x2), Math.max(pl.x, pl.x2)] : [pl.x, pl.x + pl.w]; }

  function stepPlats(g, dt) {
    const ts = g.slowT > 0 ? .3 : 1, d = dt * ts;
    for (const pl of g.plats) {
      const ox = pl.x, oy = pl.y; pl.t += d;
      switch (pl.k) {
        case 'fall':
          if (pl.st === null) { if (pl.stood) { pl.tt += dt; if (pl.tt > .45) { pl.st = 'fall'; pl.vy = 0; } } else pl.tt = Math.max(0, pl.tt - dt); }
          else if (pl.st === 'fall') { pl.vy += 900 * dt; pl.y += pl.vy * dt; if (pl.y > VH + 30) { pl.st = 'gone'; pl.tt = 0; } }
          else if (pl.st === 'gone') { pl.tt += dt; if (pl.tt > 3) { pl.st = null; pl.y = pl.y0; pl.tt = 0; } }
          pl.on = pl.st !== 'gone'; break;
        case 'sink': { const tgt = pl.stood ? pl.y0 + (pl.depth || 46) : pl.y0; pl.y += clamp(tgt - pl.y, -16 * d, (pl.rate || 24) * d); break; }
        case 'drift':
          if (pl.stood && !pl.st) pl.st = 'go';
          if (pl.st === 'go') { pl.y += 15 * d; pl.x = pl.x0 + Math.sin(pl.t * 2) * 5; if (pl.y > VH + 20) { pl.st = 'back'; pl.tt = 0; } }
          else if (pl.st === 'back') { pl.tt += dt; if (pl.tt > 2.4) { pl.st = null; pl.y = pl.y0; pl.x = pl.x0; } }
          pl.on = pl.st !== 'back'; break;
        case 'timed': { const ph = wrap(pl.t / (pl.per || 2.6) + (pl.off || 0), 1); pl.ph = ph; pl.on = ph < (pl.duty || .62); break; }
        case 'beat': pl.on = (pl.grp === 'A') === (g.beat % 2 === 0); break;
        case 'blink': { if (!(g.freezeT > 0)) pl.idx = Math.floor(pl.t / (pl.per || 1.2)) % pl.pos.length; const q = pl.pos[pl.idx || 0]; pl.x = tx(q[0]); pl.y = tl(q[1]); break; }
        case 'move': {
          const a = pl.t * (pl.sp || 1) + (pl.ph || 0), A = pl.amp || 30;
          if (pl.path === 'h') pl.x = pl.x0 + Math.sin(a) * A;
          else if (pl.path === 'v' || pl.path === 'bob') pl.y = pl.y0 + Math.sin(a) * A;
          else if (pl.path === 'circle') { pl.x = pl.x0 + Math.cos(a) * A; pl.y = pl.y0 + Math.sin(a) * A; }
          break;
        }
        case 'reveal': {
          const c = pl.x + pl.w / 2, soloFaro = g.def && g.def.id === 'bruma';
          // la luz cuenta desde el punto del borde de la plataforma más cercano a Fresita (no desde su centro), con un poco de holgura
          const nx = clamp(g.fre.x, pl.x, pl.x + pl.w), luz = Math.hypot(g.fre.x - nx, g.fre.y - (pl.y + 2)) < g.lightR + 8;
          const encima = g.p && g.p.plat === pl;   // si Itzel está parada encima no se le apaga debajo
          pl.keep = luz || encima ? .45 : Math.max(0, (pl.keep || 0) - dt);   // y se queda tangible un instante al irse la luz
          pl.on = (soloFaro && pl.alta) || (!soloFaro && (luz || pl.keep > 0)) || luzExtra(g, c, pl.y); /* en Aluxes las rutas altas (monedas) se ven siempre: sin luz parecían monedas inalcanzables */ pl.glow = (pl.glow || 0) + ((pl.on ? 1 : 0) - (pl.glow || 0)) * Math.min(1, dt * 8); break; }
        case 'plane': pl.x += 46 * (pl.dir || 1) * d; break;
        case 'cloud': pl.x += (pl.vx || 0) * d; break;
        default: if (PK[pl.k]) PK[pl.k](pl, g, d, dt);
      }
      if (pl.life !== undefined) { pl.life -= dt; if (pl.life <= 0) pl.dead = true; }
      pl.dx = pl.x - ox; pl.dy = pl.y - oy; pl.stood = false;
    }
    g.plats = g.plats.filter(p => !p.dead);
    for (const s of g.solids) if (s.life !== undefined) { s.life -= dt; if (s.grow !== undefined) s.grow = Math.min(1, s.grow + dt * 5); if (s.life <= 0) s.dead = true; }
    g.solids = g.solids.filter(s => !s.dead); DYN = g.solids;
    for (const s of g.solids) if (s.k === 'switch') s.on = (s.grp === 'A') !== g.sw;
    for (const z of g.zones) if (z.life !== undefined) { z.life -= dt; if (z.life <= 0) z.dead = true; }
    g.zones = g.zones.filter(z => !z.dead);
  }

  // llevar a Itzel encima de la plataforma en la que esta parada
  function carry(g, dt) {
    const p = g.p, pl = p.plat; if (!pl) return;
    const [a, b] = platSpan(pl);
    if (!pl.on || pl.dead || p.x < a - 5 || p.x > b + 5 || p.vy < 0) { p.plat = null; return; }
    p.x += pl.dx; p.y = platTop(pl, p.x);
    if (pl.k === 'conveyor') p.x += (pl.v || 50) * (pl.rev > 0 ? -1 : 1) * dt;
  }
  function land(g, prevY) {
    const p = g.p;
    // Al caminar por un trazo, pasar al segmento bajo sus pies antes de
    // comprobar el aterrizaje: la pendiente puede subir entre dos cuadros.
    if (p.on && p.plat && p.plat.on && !p.plat.dead && p.plat.trazoLapiz) {
      const trazo = p.plat.trazoLapiz;
      const siguiente = g.plats.find(pl => pl.on && !pl.dead && pl.trazoLapiz === trazo && p.x >= pl.x && p.x <= pl.x2 && Math.abs(platTop(pl, p.x) - prevY) <= 12);
      if (siguiente) {
        p.y = platTop(siguiente, p.x); p.vy = 0; p.plat = siguiente; siguiente.stood = true;
        return true;
      }
    }
    for (const pl of g.plats) {
      if (!pl.on) continue;
      const [a, b] = platSpan(pl); if (p.x < a - 4 || p.x > b + 4) continue;
      const top = platTop(pl, p.x), slack = Math.max(0, pl.dy) + 1;
      if (prevY <= top + slack && p.y >= top) {
        p.y = top; p.vy = 0; p.plat = pl; pl.stood = true;
        if (LANDK[pl.k]) LANDK[pl.k](pl, g);
        if (pl.k === 'bounce' || pl.bouncy) { p.vy = -(pl.pow || 600); p.noCut = true; p.plat = null; pl.sq = 1; p.sq = -.3; return 'bounce'; }
        return true;
      }
    }
    return false;
  }
  function standing(g) { const p = g.p; if (p.plat && p.plat.on) { p.plat.stood = true; return true; } return false; }
  function zones(g, dt) {
    const p = g.p;
    // los resortes también funcionan si Itzel camina hacia ellos
    if (p.vy >= 0) for (const pl of g.plats) if (pl.on && pl.k === 'bounce' && p.x > pl.x - 3 && p.x < pl.x + pl.w + 3 && p.y >= pl.y && p.y <= pl.y + 9) { p.vy = -(pl.pow || 600); p.noCut = true; p.y = pl.y; p.on = false; p.plat = null; pl.sq = 1; p.sq = -.3; }
    for (const z of g.zones) if (ZONAS[z.k]) ZONAS[z.k].paso(z, g, dt);
    for (const z of g.zones) if (!ZONAS[z.k] && p.x > z.x0 && p.x < z.x1 && p.y > z.y0 && p.y - 8 < z.y1) {
      p.noCut = true; p.on = false; p.plat = null; p.coyote = 0;
      p.vy = Math.max(p.vy - 2600 * dt, -250);
    }
  }

  // ================= ENEMIGOS =================
  const FOE = {
    cangrejo: { beh: 'walk', v: 30, hop: .006, w: 14, h: 9 }, murcielago: { beh: 'fly', w: 12, h: 8, rx: 34, ry: 12, sp: 1.6 }, rana: { beh: 'hop', w: 12, h: 9 },
    avispa: { beh: 'swoop', w: 12, h: 9 }, cocuyo: { beh: 'orbit', w: 10, h: 8, r: 24, sp: 1.8 }, zopilote: { beh: 'swoop', w: 16, h: 9, high: true },
    culebra: { beh: 'strike', v: 18, w: 16, h: 7 }, iguana: { beh: 'walk', v: 70, burst: true, w: 18, h: 8 }, alux: { beh: 'teleport', w: 10, h: 13 },
    jabali: { beh: 'charge', v: 22, w: 16, h: 11 }, jaguar: { beh: 'pounce', v: 24, w: 18, h: 11 }, buho: { beh: 'swoop', w: 13, h: 12 },
    escarabajo: { beh: 'walk', v: 75, roll: true, w: 12, h: 10 }, garabato: { beh: 'hop', constant: true, w: 12, h: 12 }, calavera: { beh: 'hop', w: 11, h: 11 },
    tortuga: { beh: 'walk', v: 22, shell: true, w: 15, h: 10 }, pelicano: { beh: 'swoop', w: 18, h: 11, high: true, fast: true }, abeja: { beh: 'fly', fig: true, w: 9, h: 8, rx: 30, ry: 16, sp: 1.3 },
    automata: { beh: 'walk', v: 34, march: true, w: 12, h: 14 }, dron: { beh: 'drone', w: 14, h: 8 }, babosa: { beh: 'pounce', v: 10, w: 16, h: 9, slug: true },
    invasor: { beh: 'formation', w: 12, h: 9 },
  };
  function mkFoe(k, x, y) { const d = FOE[k]; return Object.assign({ k, x, y, hx: x, hy: y, vx: 0, vy: 0, dir: -1, st: 'ok', t: Math.random() * 3, tt: 0, anim: Math.random() * 3 }, d); }
  const onGround = (e) => SOLID(e.x - 3, e.y + 1) || SOLID(e.x + 3, e.y + 1);
  function gravity(e, dt) {
    e.vy = Math.min(e.vy + 1100 * dt, 480); e.y += e.vy * dt;
    if (e.vy > 0 && (SOLID(e.x - 3, e.y) || SOLID(e.x + 3, e.y))) { e.y = Math.min(SOLID(e.x - 3, e.y) ? borde(e.x - 3, e.y, 'arriba') : 1e9, SOLID(e.x + 3, e.y) ? borde(e.x + 3, e.y, 'arriba') : 1e9); e.vy = 0; e.vx = 0; }
    const nx = e.x + e.vx * dt; if (SOLID(nx + Math.sign(e.vx) * e.w / 2, e.y - 4)) e.vx = -e.vx * .3; else e.x = nx;
    if (e.y > VH + 50) e.st = 'gone', e.tt = 1;
  }
  function walkStep(e, dt, v) {
    const nx = e.x + e.dir * v * dt, ahead = nx + e.dir * e.w / 2;
    if (SOLID(ahead, e.y - 4) || !SOLID(ahead, e.y + 2)) { e.dir *= -1; return false; }
    e.x = nx; return true;
  }
  function vueloPelicano(e, p, d, toP) {
    // Los generadores también colocan enemigos sobre el piso: el pelícano
    // necesita un punto de vuelo por encima de esa superficie.
    if (!e.vueloPreparado) {
      const piso = surf(e.x, Math.max(0, e.y - 80));
      if (piso < VH && e.y > piso - 32) {
        const alto = Math.max(e.h + 2, piso - 52);
        if (!SOLID(e.x, alto) && !SOLID(e.x, alto - e.h)) e.y = e.hy = alto;
      }
      e.vueloPreparado = true;
    }
    if (e.st === 'dive') {
      const ax = e.tx - e.x, ay = e.ty - e.y, distancia = Math.hypot(ax, ay);
      const paso = Math.min(distancia, 200 * d);
      const nx = e.x + (distancia ? ax / distancia * paso : 0), ny = e.y + (distancia ? ay / distancia * paso : 0);
      e.tPicada = (e.tPicada || 0) + d;
      if (ny >= VH - 2 || SOLID(nx, ny + 2) || SOLID(nx, ny - e.h / 2)) { e.st = 'up'; return; }
      e.x = nx; e.y = ny; if (ax) e.dir = Math.sign(ax);
      if (distancia <= paso + 1 || e.tPicada >= 1.3) e.st = 'up';
      return;
    }
    if (e.st === 'up') {
      if (e.y > e.hy) e.y = Math.max(e.hy, e.y - 150 * d);
      e.x += (e.hx - e.x) * Math.min(1, d * 1.5);
      if (e.y <= e.hy) { e.st = 'ok'; e.tt = 1.8; }
      return;
    }
    e.tt -= d;
    const objetivoX = e.hx + Math.sin(e.t * 1.1) * 40, objetivoY = e.hy + Math.sin(e.t * 2.2) * 4;
    const dx = objetivoX - e.x, dy = objetivoY - e.y, distancia = Math.hypot(dx, dy), paso = Math.min(distancia, 65 * d);
    const nx = e.x + (distancia ? dx * paso / distancia : 0), ny = e.y + (distancia ? dy * paso / distancia : 0);
    if (!SOLID(nx, ny) && !SOLID(nx, ny - e.h)) { e.x = nx; e.y = ny; if (Math.abs(dx) > 2) e.dir = Math.sign(dx); }
    if (e.tt <= 0 && Math.abs(toP) < 110 && p.y > e.y + 10) {
      e.st = 'dive'; e.tx = p.x; e.ty = Math.min(p.y - 4, VH - 4); e.tPicada = 0;
    }
  }
  // Un disparo recién creado junto a su dueño no bloquea un pisotón desde arriba.
  function protegePisoton(g, o) {
    const e = o.origen || o.dueno, p = g.p;
    if (!e || !p || e.st === 'gone' || (e.spiky && e.spiky(e)) || !(p.vy > 0)) return false;
    if (Math.abs(p.x - o.x) > (p.w || 10) / 2 + 4 || o.y < p.y - p.h - 4 || o.y > p.y + 4) return false;
    if (Math.abs(o.x - e.x) > e.w / 2 + 8 || Math.abs(o.y - (e.y - e.h / 2)) > e.h / 2 + 8) return false;
    if (Math.abs(p.x - e.x) >= (p.w + e.w) / 2 || p.y > e.y - e.h + 5) return false;
    o.dead = true; return true;
  }
  function stepFoes(g, dt, prevY) {
    const p = g.p, ts = g.slowT > 0 ? .3 : 1;
    // contacto de un enemigo con Itzel (también los dormidos: sólidos pero inofensivos)
    function contactoItzel(e) {
      if (e.st === 'gone' || e.st === 'off' || !p.vis) return;   // los dormidos (e.st 'sleep') son sólidos pero inofensivos: no lastiman, estorban de lado y se pisan
      if (Math.abs(p.x - e.x) < (e.w + p.w) / 2 - 1 && p.y > e.y - e.h && p.y - p.h < e.y) {
        if (e.st === 'shell') { e.st = 'slide'; e.dir = p.x < e.x ? 1 : -1; p.vy = Math.min(p.vy, -200); return; }
        const dormido = e.st === 'sleep';
        const caeEncima = (p.vy > 0 || (p.on && p.y > prevY)) && prevY <= e.y - e.h + 5;
        if (e.spiky && e.spiky(e) && !dormido) { hurtFn(g, p.x < e.x ? -1 : 1); return; }
        if (dormido && !caeEncima) {   // de lado, el dormido hace de pared: Itzel no lo atraviesa ni sale lastimada
          const lado = p.x < e.x ? -1 : 1; p.x = e.x + lado * ((e.w + p.w) / 2 - .5); if (p.vx * lado < 0) p.vx = 0; return;
        }
        if (caeEncima) {
          p.y = e.y - e.h;
          // El contacto con el cuerpo prevalece sobre las esporas que este hongo acaba de emitir.
          if (e.k === 'esporin') for (const o of g.objs || []) if (o.k === 'esporas' && o.origen === e) o.dead = true;
          p.vy = reboteEnemigo(); p.noCut = true; p.on = false; p.plat = null; p.air = RUN.upg.dbl; RUN.stomps++;
          if (!e.sub && typeof sueltaCorazon === 'function') sueltaCorazon(g, e.x, e.y - (e.h || 10) / 2);
          if (e.hp > 1) {
            VIDA.golpe(e, g);
            // un dormido aguanta el primer golpe sin despertar; el siguiente golpe lo despierta
            if (dormido) { e._golpesDormido = (e._golpesDormido || 0) + 1; if (e._golpesDormido >= 2) { e._golpesDormido = 0; e.st = 'ok'; e.tt = 0; ring(g, e.x, e.y - (e.h || 10) / 2, '#ffffff', (e.w || 10) + 6, .35); } }
            return;
          }
          if (e.shell && e.st !== 'slide') { e.st = 'shell'; spawn(g, 8, e.x, e.y - 6, { v: 60, life: .4, s: 1.8, k: 'dust', cols: ['#ffffff'] }); return; }
          e.st = 'gone'; e.tt = 0; spawn(g, 12, e.x, e.y - 6, { v: 80, life: .5, s: 2, k: 'dust', cols: ['#ffffff', '#ffe0a0'] });
        } else {
          if (e.k === 'abordador' && !dormido && !(p.inv > 0) && !(e.ataqueVisual > 0)) e.ataqueVisual = .001;
          hurtFn(g, p.x < e.x ? -1 : 1);
        }
      }
    }
    for (const e of g.foes) {
      if (!e.listo) { e.listo = true; if (VIDA.prepara) VIDA.prepara(e, g); }
      const d = dt * ts * (e.pasoK || 1); // pasoK: si alguno va más rápido o más lento
      if (e.k === 'abordador' && e.ataqueVisual > 0) { e.ataqueVisual += d / .7; if (e.ataqueVisual >= 1) e.ataqueVisual = 0; }
      e.t += d; e.anim += d;
      if (e.st === 'gone') { e.tt += dt; e.y -= 30 * dt; continue; }
      if (e.aturde > 0) { e.aturde -= dt; if (e.k === 'pelicano') { e.vy = 0; e.st = 'up'; if (e.y > e.hy) e.y = Math.max(e.hy, e.y - 40 * d); } else if (e.vy) gravity(e, d); continue; } // recibió un pisotón y aguantó
      if (e.st === 'sleep') { e.tt -= dt; if (e.tt <= 0) e.st = 'ok'; else contactoItzel(e); continue; }   // dormido: no se mueve, pero sí tiene cuerpo
      if (e.st === 'glass') { e.tt -= dt; if (e.tt <= 0) { e.st = 'ok'; e.solid.dead = true; e.solid = null; } continue; }
      if (e.st === 'off') { e.tt -= dt; gravity(e, dt); if (e.tt <= 0) { e.st = 'ok'; e.y = e.hy; } continue; }
      const toP = p.x - e.x, near = Math.abs(toP) < 120 && Math.abs(p.y - e.y) < 60;
      switch (e.beh) {
        case 'walk':
          if (e.st === 'shell') break;
          if (e.st === 'slide') { if (!walkStep(e, d, 170)) spawn(g, 4, e.x, e.y - 4, { v: 40, life: .3, s: 1.5, k: 'dust', cols: ['#ffffff'] }); for (const o of g.foes) if (o !== e && o.st === 'ok' && !o.sub && Math.abs(o.x - e.x) < 12 && Math.abs(o.y - e.y) < 12) { o.st = 'gone'; o.tt = 0; } break; }
          if (e.march) { const ph = e.t % 2.4; if (ph < 1.6) walkStep(e, d, e.v); else if (ph > 2.3 && ph - d <= 2.3) e.dir *= -1; break; }
          if (e.burst) { if (e.t % 2 < 1) walkStep(e, d, e.v); break; }
          if (e.vy !== 0 || !onGround(e)) { gravity(e, d); break; }
          walkStep(e, d, e.v);
          if (e.hop && Math.random() < e.hop) { e.vy = -260; e.y -= 1; }
          break;
        case 'charge':
          if (e.st === 'stun') { e.tt -= d; if (e.tt <= 0) e.st = 'ok'; break; }
          if (e.st === 'run') { if (!walkStep(e, d, 125)) { e.st = 'stun'; e.tt = 1; g.shake = Math.max(g.shake, .12); } break; }
          if (near && Math.abs(p.y - e.y) < 18 && Math.sign(toP) === e.dir && Math.abs(toP) < 110) { e.st = 'run'; break; }
          walkStep(e, d, e.v); break;
        case 'strike':
          if (e.st === 'lunge') { e.tt -= d; walkStep(e, d, 150); if (e.tt <= 0) { e.st = 'ok'; e.tt = .8; } break; }
          e.tt -= d; if (Math.abs(toP) < 36 && Math.abs(p.y - e.y) < 14 && e.tt <= 0) { e.dir = Math.sign(toP) || 1; e.st = 'lunge'; e.tt = .25; break; }
          walkStep(e, d, e.v); break;
        case 'pounce':
          if (e.vy !== 0 || !onGround(e)) { gravity(e, d); break; }
          e.tt -= d;
          if (near && Math.abs(toP) < (e.slug ? 70 : 90) && e.tt <= 0) { e.dir = Math.sign(toP) || 1; e.vy = e.slug ? -230 : -300; e.vx = e.dir * (e.slug ? 90 : 130); e.y -= 1; e.tt = e.slug ? 2.2 : 1.6; break; }
          walkStep(e, d, e.v); break;
        case 'hop':
          if (e.vy !== 0 || !onGround(e)) { gravity(e, d); break; }
          e.tt -= d;
          if (e.tt <= 0) { e.dir = e.constant ? (SOLID(e.x + e.dir * 16, e.y - 4) || !SOLID(e.x + e.dir * 14, e.y + 4) ? -e.dir : e.dir) : (near ? Math.sign(toP) || 1 : (Math.random() < .5 ? 1 : -1)); e.vy = e.constant ? -280 : -240; e.vx = e.dir * (e.constant ? 60 : 70); e.y -= 1; e.tt = e.constant ? .15 : .9 + Math.random() * .5; }
          break;
        case 'fly': { const a = e.t * e.sp; e.x = e.hx + Math.sin(a) * e.rx; e.y = e.hy + (e.fig ? Math.sin(a * 2) * e.ry : Math.sin(a * 2.3) * e.ry); e.dir = Math.cos(a) >= 0 ? 1 : -1; break; }
        case 'orbit': { const a = e.t * e.sp; e.x = e.hx + Math.cos(a) * e.r; e.y = e.hy + Math.sin(a) * e.r * .7; e.dir = -Math.sin(a) >= 0 ? 1 : -1; break; }
        case 'swoop': {
          if (e.k === 'pelicano') { vueloPelicano(e, p, d, toP); break; }
          if (e.st === 'dive') { const ax = e.tx - e.x, ay = e.ty - e.y, dd = Math.hypot(ax, ay) || 1, sp = e.fast ? 200 : 150; e.x += ax / dd * sp * d; e.y += ay / dd * sp * d; e.dir = Math.sign(ax) || e.dir; if (dd < 6) { e.st = 'up'; } break; }
          if (e.st === 'up') { e.y -= 90 * d; e.x += (e.hx - e.x) * Math.min(1, d * 1.5); if (e.y <= e.hy) { e.st = 'ok'; e.tt = e.k === 'avispaMini' ? 2.8 : 1.4; } break; }
          // rondar: se acerca suave a su vuelo en vaivén (antes se le ponía de golpe en su sitio y parecía teletransportarse al volver de una picada)
          if (e.tw > 0) {                       // aviso: sube y se voltea hacia Itzel un instante antes de lanzarse
            e.tw -= d; e.y -= 34 * d; e.dir = Math.sign(p.x - e.x) || e.dir;
            if (e.tw <= 0) { e.st = 'dive'; e.tx = p.x; e.ty = p.y - 4; }
            break;
          }
          e.tt -= d; const k = Math.min(1, d * 3.5);
          e.x += (e.hx + Math.sin(e.t * 1.1) * 40 - e.x) * k; e.y += (e.hy + Math.sin(e.t * 2.2) * 4 - e.y) * k; e.dir = Math.cos(e.t * 1.1) >= 0 ? 1 : -1;
          if (e.tt <= 0 && Math.abs(toP) < (e.high ? 110 : 80) && p.y > e.y + 10 && !(e.k === 'avispaMini' && g.seda)) { if (e.high) e.tw = .35; else { e.st = 'dive'; e.tx = p.x; e.ty = p.y - 4; } }
          break;
        }
        case 'teleport': {
          const lit = (g.lightR && Math.hypot(g.fre.x - e.x, g.fre.y - (e.y - 6)) < g.lightR) || luzExtra(g, e.x, e.y - 6);
          // se queda en su sitio hasta que Itzel lo encuentra por primera vez; desde entonces la sigue apareciendo y desapareciendo
          if (!e.visto) {
            e.fade = 1; e.dir = Math.sign(p.x - e.x) || e.dir;
            if (Math.hypot(p.x - e.x, p.y - e.y) < 120) { e.visto = true; e.tt = 1.2; ring(g, e.x, e.y - 6, '#ffffff', 22, .5); }
            break;
          }
          if (e.oculto > 0) {                     // desaparecido: no estorba ni se ve hasta que reaparece cerca
            e.oculto -= d; e.fade = clamp((e.fade ?? 1) - dt * 4, 0, 1);
            if (e.oculto <= 0) {
              const side = lit ? -Math.sign(g.fre.x - e.x) || 1 : (Math.random() < .5 ? 1 : -1), nx = (lit ? e.x : p.x) + side * (lit ? 90 : 40), sy = surf(nx, p.y - 40);
              if (sy < VH && !SOLID(nx, sy - 4)) { e.x = nx; e.y = sy; }
              e.tt = lit ? 2 : 2.6; e.dir = Math.sign(p.x - e.x) || 1;
            }
            continue;
          }
          e.tt -= d; e.fade = clamp((e.fade ?? 1) + (e.tt < .3 ? -dt * 4 : dt * 4), 0, 1);
          if (lit && e.tt > .3) e.tt = .3;
          if (e.tt <= 0) e.oculto = lit ? 1.6 : 3.2;   // antes reaparecía casi al instante
          break;
        }
        case 'drone': {
          e.x = e.hx + Math.sin(e.t * .7) * 46; e.y = e.hy + Math.sin(e.t * 2) * 3;
          const ph = e.t % 2.6; e.warn = ph > 1.4 && ph < 2; e.beam = ph >= 2 && ph < 2.5;
          if (e.beam) { const by = surf(e.x, e.y); if (Math.abs(p.x - e.x) < 5 && p.y > e.y && p.y - p.h < by) hurtFn(g, p.x < e.x ? -1 : 1); }
          break;
        }
        case 'formation': { const step = Math.floor(e.t * 2); e.x = e.hx + (Math.floor(step / 1) % 16 < 8 ? step % 8 : 8 - step % 8) * 6 - 24; e.y = e.hy + (Math.floor(step / 8) % 2) * 6; e.dir = 1; break; }
        default: if (BEH[e.beh] && BEH[e.beh](e, g, d, toP, near) === 'skip') continue;
      }
      contactoItzel(e);
    }
    g.foes = g.foes.filter(e => !(e.st === 'gone' && e.tt > .7));
  }
  let hurtFn = () => {};
  const VIDA = { prepara: null, golpe: null, dibuja: null }; // vida-enemigos.js

  // ================= PODERES DE FRESITA =================
  // cada poder: nombre, ayuda, enfriamiento, y lo que hace con el clic (b: 0 = abajo, up: soltar)
  const lim = (arr, pred, max) => { const own = arr.filter(pred); while (own.length >= max) { own.shift().dead = true; } };
  const ring = (g, x, y, c, r, d = .45) => g.rings.push({ x, y, t: 0, d, c, r });
  const snapX = x => Math.floor(x / T) * T, snapY = y => Math.floor(y / T) * T;
  const freeOf = (g, x, y, w, h) => { const p = g.p; return !(p.x + p.w / 2 > x && p.x - p.w / 2 < x + w && p.y > y && p.y - p.h < y + h); };
  // aire de verdad para poner algo: sin suelo, sin Itzel, sin plataformas, sin enemigos y sin el adorno del paisaje (árboles, flores, piedras)
  const aireLibre = (g, x, y, w, h) => {
    if (!freeOf(g, x, y, w, h)) return false;
    for (let yy = y + 2; yy < y + h; yy += 6) for (let xx = x + 2; xx < x + w; xx += 6) if (SOLID(xx, yy)) return false;
    const toca = (ax, ay, aw, ah) => ax < x + w && ax + aw > x && ay < y + h && ay + ah > y;
    for (const pl of g.plats) if (pl.on !== false && toca(pl.x, pl.y - 2, pl.w, (pl.h || 6) + 2)) return false;
    for (const e of g.foes) if (e.st !== 'gone' && toca(e.x - e.w / 2, e.y - e.h, e.w, e.h)) return false;
    for (const d of L.deco || []) { const arb = d.k === 'T'; if (toca(d.x - (arb ? 11 : 5), d.y - (arb ? 46 : 9), arb ? 22 : 10, arb ? 46 : 9)) return false; }
    return true;
  };
  const POW = {
    bloque: { name: 'Bloque de pixel', help: 'Clic: pone un bloque sólido donde apuntas (hasta 3).', cd: .25, click(g, x, y) { const bx = snapX(x), by = snapY(y); if (!aireLibre(g, bx, by, T, T)) return false; lim(g.solids, s => s.k === 'pblock', 3); g.solids.push({ k: 'pblock', x: bx, y: by, w: T, h: T, on: true, life: 6, grow: 0 }); return true; } },
    viento: { name: 'Viento de la tarde', help: 'Clic: una columna de viento que levanta a Itzel.', cd: .8, click(g, x, y) { lim(g.zones, () => true, 1); const gy = surf(x, y); g.zones.push({ k: 'column', x0: x - 16, x1: x + 16, y0: Math.max(-20, Math.min(y - 40, gy - 130)), y1: gy, life: 2.8, t: 0 }); return true; } },
    nenufar: { name: 'Nenúfar', help: 'Clic: brota un nenúfar donde apuntas; se hunde si te quedas encima.', cd: .3, click(g, x, y) { if (SOLID(x, y)) return false; lim(g.plats, q => q.pw, 2); g.plats.push(mkPlat({ k: 'sink', look: 'lily', x: x - 15, y, w: 30, depth: 40, rate: 13, life: 6, pw: true })); return true; } },
    avion: { name: 'Avión de papel', help: 'Clic: lanza un avión de papel que vuela hacia adelante; súbete.', cd: .4, click(g, x, y) { if (SOLID(x, y)) return false; lim(g.plats, q => q.pw, 2); g.plats.push(mkPlat({ k: 'plane', look: 'plane', x: x - 13, y, w: 26, dir: g.fre.face < 0 ? -1 : 1, life: 6, pw: true })); return true; } },
    luz: { name: 'Destello', help: 'Fresita ilumina; clic: destello grande que revela caminos y aturde cocuyos.', cd: 3, click(g, x, y) { g.flareT = 3; for (const e of g.foes) if (e.k === 'cocuyo' && Math.hypot(e.x - g.fre.x, e.y - g.fre.y) < 120) { e.st = 'sleep'; e.tt = 3; } ring(g, g.fre.x, g.fre.y, '#bfffef', 120, .6); return true; } },
    rafaga: { name: 'Ráfaga', help: 'Clic cerca de Itzel: la empuja lejos de Fresita, para saltos largos.', cd: .9, click(g) { const p = g.p, dx = p.x - g.fre.x, dy = (p.y - 8) - g.fre.y, dd = Math.hypot(dx, dy); if (dd > 90) return false; const nx = dx / (dd || 1), ny = dy / (dd || 1); p.vx = nx * 330; p.vy = Math.min(p.vy, ny * 330 - 120); p.noCut = true; p.boost = .45; p.on = false; p.plat = null; ring(g, g.fre.x, g.fre.y, '#ffd9b0', 30); return true; } },
    nube: { name: 'Nube de tinta', help: 'Clic: una nube de tinta para pisar; se desvanece pronto.', cd: .3, click(g, x, y) { if (SOLID(x, y)) return false; lim(g.plats, q => q.pw, 2); g.plats.push(mkPlat({ k: 'cloud', look: 'inkcloud', x: x - 17, y, w: 34, vx: g.fre.face * 10, life: 4.5, pw: true })); return true; } },
    pulso: { name: 'Pulso', help: 'Clic: cambia qué bloques de neón están encendidos.', cd: .35, click(g) { g.beat++; g.beatT = 0; ring(g, g.fre.x, g.fre.y, '#ff2bd6', 40); return true; } },
    farol: { name: 'Farol', help: 'Fresita alumbra la niebla; clic: luz fuerte que revela el camino y espanta aluxes.', cd: 3, click(g) { g.flareT = 3; ring(g, g.fre.x, g.fre.y, '#ffffff', 120, .6); return true; } },
    cristal: { name: 'Pilar de cristal', help: 'Clic: levanta un pilar de cristal desde el suelo hasta donde apuntas.', cd: .5, click(g, x, y) { const bx = snapX(x), top = snapY(y), gy = surf(bx + 8, top); if (gy >= VH || gy - top < T || !aireLibre(g, bx, top, T, gy - top)) return false; lim(g.solids, s => s.k === 'pillar', 2); g.solids.push({ k: 'pillar', x: bx, y: top, w: T, h: gy - top, on: true, life: 6, grow: 0 }); return true; } },
    glifo: { name: 'Glifo', help: 'Clic sobre un bloque con glifo: lo activa o lo apaga (todo su grupo).', cd: .3, click(g, x, y) { const s = g.solids.find(s => s.k === 'glyph' && x >= s.x - 4 && x < s.x + s.w + 4 && y >= s.y - 4 && y < s.y + s.h + 4); if (!s) return false; const on = !s.on; if (on && g.solids.some(q => q.k === 'glyph' && q.grp === s.grp && !freeOf(g, q.x, q.y, q.w, q.h))) return false; for (const q of g.solids) if (q.k === 'glyph' && q.grp === s.grp) q.on = on; ring(g, x, y, '#d79a3d', 26); return true; } },
    remolino: { name: 'Remolino', help: 'Clic: un remolino que eleva a Itzel por unos segundos.', cd: .8, click(g, x, y) { lim(g.zones, () => true, 1); g.zones.push({ k: 'swirl', x0: x - 18, x1: x + 18, y0: y - 46, y1: y + 30, life: 3, t: 0 }); return true; } },
    vidrio: { name: 'Vitral', help: 'Clic sobre un enemigo: lo encierra en vidrio y se vuelve un bloque para pisar.', cd: .4, click(g, x, y) { const e = g.foes.find(e => e.st === 'ok' && Math.hypot(e.x - x, e.y - e.h / 2 - y) < 22); if (!e) return false; e.st = 'glass'; e.tt = 6; const s = { k: 'glass', x: e.x - 8, y: e.y - 16, w: 16, h: 16, on: true }; e.solid = s; g.solids.push(s); return true; } },
    lapiz: { name: 'Lápiz', help: 'Mantén clic y dibuja en el aire: las líneas son paredes, techos y pisos. No puedes dibujar dentro del terreno. Duran 12 segundos.', cd: .1, drag: true,
      click(g, x, y, c) {
        if (!c.up) { g.trazoLapiz = { id: {}, x, y, segmentos: 0, iniciado: false }; return true; }
        if (!g.trazoLapiz) return false;
        trazaLapiz(g, x, y);
        const tr = g.trazoLapiz; for (const pl of g.plats) if (pl.trazoLapiz === tr.id) pl.life = 12;
        g.trazoLapiz = null; return tr.iniciado;
      } },
    gubia: { name: 'Gubia', help: 'Clic sobre un bloque de madera: lo talla y desaparece.', cd: .2, click(g, x, y) { const s = g.solids.find(s => s.k === 'wood' && s.on && x >= s.x - 3 && x < s.x + s.w + 3 && y >= s.y - 3 && y < s.y + s.h + 3); if (!s) return false; s.dead = true; spawn(g, 16, s.x + 8, s.y + 8, { v: 90, life: .6, s: 1.8, k: 'confetti', cols: ['#efe5cf', '#1f1a1c', '#b3342b'], g: 200 }); return true; } },
    interruptor: { name: 'Interruptor', help: 'Clic: intercambia los bloques A y B.', cd: .35, click(g) { const want = !g.sw; if (g.solids.some(s => s.k === 'switch' && ((s.grp === 'A') !== want) && !freeOf(g, s.x, s.y, s.w, s.h))) return false; g.sw = want; ring(g, g.fre.x, g.fre.y, '#9bbc0f', 34); return true; } },
    resorte: { name: 'Resorte', help: 'Clic: coloca un resorte en el suelo. Espera un poco entre cada uno y acerca a Fresita para espantar a los charranes.', cd: 1.4, click(g, x, y) { const bx = snapX(x) + 2; let sy = y; for (let i = 0; i < T * 2 && SOLID(x, sy); i++) sy--; if (SOLID(x, sy)) return false; const gy = surf(x, sy); if (gy >= VH || !SOLID(bx + 1, gy + 1) || !SOLID(bx + 11, gy + 1) || SOLID(x, gy - 7)) return false; lim(g.plats, q => q.pw, 2); g.plats.push(mkPlat({ k: 'bounce', look: 'spring', x: bx, y: gy - 6, w: 12, pow: 660, pw: true, life: 12 })); return true; } },
    semilla: { name: 'Hoja de enredadera', help: 'Clic en el aire: Fresita crea una hoja donde Itzel puede pisar. Puede mantener hasta cuatro.', cd: .35, click(g, x, y) {
      if (SOLID(x, y) || SOLID(x - 12, y) || SOLID(x + 12, y)) return false;
      const suelo = surf(x, Math.max(0, y)), gy = Math.min(VH + 8, suelo);
      lim(g.plats, q => q.pw, 4);
      g.plats.push(mkPlat({ k: 'static', look: 'leaf', x: x - 18, y, w: 36, life: 8, pw: true, vineX: x, vineY: Math.max(y + 5, gy), grow: -.3 }));
      return true;
    } },
    reloj: { name: 'Reloj de arena', help: 'Clic: el tiempo se vuelve lento para todo menos Itzel.', cd: 6, click(g) { g.slowT = 3.5; ring(g, g.fre.x, g.fre.y, '#d4af37', 70, .8); return true; } },
    hackeo: { name: 'Hackeo', help: 'Clic: apaga drones cercanos y voltea las bandas cercanas.', cd: .8, click(g, x, y) { let ok = false; for (const e of g.foes) if (e.k === 'dron' && e.st === 'ok' && Math.hypot(e.x - x, e.y - y) < 60) { e.st = 'off'; e.tt = 5; e.vy = 0; ok = true; } for (const pl of g.plats) if (pl.k === 'conveyor' && Math.abs(pl.x + pl.w / 2 - x) < pl.w / 2 + 50) { pl.rev = 5; ok = true; } ring(g, x, y, '#05d9e8', 60); return ok; } },
    portal: { name: 'Portal', help: 'Clic: Itzel aparece donde está Fresita.', cd: 2.5, click(g) { const p = g.p, fr = g.fre, fy = fr.y + 10; if (SOLID(fr.x, fy - 2) || SOLID(fr.x, fy - 13) || SOLID(fr.x - 5, fy - 7) || SOLID(fr.x + 5, fy - 7)) return false; spawn(g, 16, p.x, p.y - 7, { v: 80, life: .5, s: 2, k: 'spark', cols: ['#7ff0e0', '#ffffff'] }); p.x = fr.x; p.y = fy; p.vx = 0; p.vy = 0; p.plat = null; spawn(g, 16, p.x, p.y - 7, { v: 80, life: .5, s: 2, k: 'spark', cols: ['#7ff0e0', '#ffffff'] }); return true; } },
    congelar: { name: 'Congelar', help: 'Clic: las plataformas que saltan se quedan quietas 4 segundos.', cd: 5, click(g) { g.freezeT = 4; ring(g, g.fre.x, g.fre.y, '#55ffff', 70); return true; } },
  };
  function power(g, c) {
    const pw = POW[g.power]; if (!pw) return;
    if (c.up && !pw.drag) return;
    if (!c.up && (g.fre.cool > 0 || g.fre.daze > 0)) { ring(g, g.cam + c.x, c.y, '#ff8080', 8, .3); return; }
    const ok = pw.click(g, g.cam + c.x, c.y, c);
    if (!c.up) for (const o of g.objs || []) if (OBJ[o.k] && OBJ[o.k].onPower) OBJ[o.k].onPower(o, g, g.cam + c.x, c.y, ok);
    if (!c.up && typeof ENCI !== 'undefined') ENCI.ver('poder:' + g.power);
    if (ok && !c.up) g.fre.cool = pw.cd;
    if (ok === false) ring(g, g.cam + c.x, c.y, '#ff8080', 8, .3);
    else if (!pw.drag || c.up) ring(g, g.cam + c.x, c.y, '#ffffff', 14, .35);
  }
  function stepGlobal(g, dt) {
    g.fre.daze = Math.max(0, (g.fre.daze || 0) - dt);
    g.slowT = Math.max(0, (g.slowT || 0) - dt); g.freezeT = Math.max(0, (g.freezeT || 0) - dt); g.flareT = Math.max(0, (g.flareT || 0) - dt);
    if (g.lightBase) g.lightR = g.lightBase + (g.flareT > 0 ? 80 * Math.min(1, g.flareT) : 0);
    if (g.beatAuto) { g.beatT = (g.beatT || 0) + dt * (g.slowT > 0 ? .3 : 1); if (g.beatT > g.beatAuto) { g.beatT = 0; if (g.holdBeats > 0) g.holdBeats--; else g.beat++; } } // con «Al compás» los bloques se sostienen
    for (const pl of g.plats) if (pl.rev > 0) pl.rev -= dt;
    for (const z of g.zones) z.t += dt;
    for (const o of g.objs || []) if (OBJ[o.k] && OBJ[o.k].step) OBJ[o.k].step(o, g, dt);
    if (g.objs) g.objs = g.objs.filter(o => !o.dead);
  }
  // el entorno del nivel cambia la fisica de Itzel: gravedad, agua, hielo, brasas
  function env(g) {
    const p = g.p, d = g.def || {}, e = { grav: d.grav || 1, jumpK: d.jumpK || 1, accK: d.accK || 1, frK: d.frK || 1, maxK: d.maxK || 1, swim: false, ice: false, deadly: false };
    if (d.iceGround && p.on && !p.plat) e.ice = true;
    for (const o of g.objs || []) if (OBJ[o.k] && OBJ[o.k].env) OBJ[o.k].env(o, g, e);
    return e;
  }

  // ================= DIBUJO =================
  function drawPlat(ctx, pl, f, sk) {
    if (!pl.on && pl.k !== 'reveal' && pl.k !== 'timed' && pl.k !== 'beat' && !pl.verSiempre) return;
    const x = pl.x, y = pl.y, w = pl.w, t = f.t;
    const fade = pl.life !== undefined && pl.life < 1 ? (Math.sin(t * 30) > 0 ? .35 : 1) : 1;
    ctx.save(); ctx.globalAlpha *= fade;
    const shake = pl.k === 'fall' && pl.st === null && pl.tt > 0 ? (Math.random() - .5) * 1.4 : 0;
    ctx.translate(shake, 0);
    if (LOOK[pl.look]) LOOK[pl.look](ctx, pl, f, sk); else switch (pl.look) {
      case 'bricks': { ctx.fillStyle = sk.plat; ctx.fillRect(x, y, w, 8); ctx.fillStyle = sk.plat2; for (let i = 0; i < w; i += 8) { ctx.fillRect(x + i, y + 3.5, 8, 1); ctx.fillRect(x + i + ((i / 8) % 2 ? 0 : 4), y, 1, 3.5); ctx.fillRect(x + i + ((i / 8) % 2 ? 4 : 0), y + 4.5, 1, 3.5); } ctx.fillStyle = sk.line || '#222034'; ctx.fillRect(x, y + 8, w, 1); if (pl.tt > .2) { ctx.fillStyle = sk.line || '#222034'; ctx.fillRect(x + w * .4, y + 1, 1, 6); ctx.fillRect(x + w * .4 + 1, y + 3, 2, 1); } break; }
      case 'hammock': { const sag = 3 + (pl.sq || 0) * 5; pl.sq = (pl.sq || 0) * .9; ctx.strokeStyle = sk.line; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(x - 3, y - 14); ctx.lineTo(x, y); ctx.moveTo(x + w + 3, y - 14); ctx.lineTo(x + w, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + w / 2, y + sag * 2, x + w, y); ctx.quadraticCurveTo(x + w / 2, y + sag * 2 + 4, x, y); ctx.fillStyle = sk.plat; ctx.fill(); ctx.save(); ctx.clip(); for (let i = 0; i < w; i += 4) { ctx.fillStyle = [sk.plat2, sk.accent, sk.plat][(i / 4) % 3]; ctx.fillRect(x + i, y - 2, 2, 12); } ctx.restore(); break; }
      case 'lily': { ctx.fillStyle = sk.plat; ctx.beginPath(); ctx.ellipse(x + w / 2, y + 2, w / 2, 3.4, 0, .3, TAU - .3); ctx.lineTo(x + w / 2, y + 2); ctx.closePath(); ctx.fill(); ctx.strokeStyle = sk.line; ctx.lineWidth = .5; ctx.stroke(); ctx.fillStyle = sk.accent; ctx.beginPath(); ctx.arc(x + w * .3, y, 1.6, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(120,160,200,.5)'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + 4, w / 2 + 3 + Math.sin(t * 3) * 1.5, 2, 0, 0, TAU); ctx.stroke(); break; }
      case 'paper': { const k = pl.on ? (pl.ph > (pl.duty || .62) - .12 ? 1 - ((pl.ph - (pl.duty || .62) + .12) / .12) : Math.min(1, pl.ph / .08)) : 0; if (k <= .02) { ctx.strokeStyle = 'rgba(80,50,30,.35)'; ctx.setLineDash([2, 2]); ctx.strokeRect(x, y, w, 5); ctx.setLineDash([]); break; } ctx.save(); ctx.translate(x + w / 2, y); ctx.scale(Math.max(.05, k), 1); ctx.shadowColor = 'rgba(70,40,20,.4)'; ctx.shadowBlur = 3 * f.S; ctx.shadowOffsetY = 1.5 * f.S; ctx.fillStyle = sk.plat; ctx.fillRect(-w / 2, 0, w, 5); ctx.restore(); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + 5); ctx.stroke(); break; }
      case 'shroom': { const sq = pl.sq || 0; pl.sq = sq * .88; ctx.fillStyle = '#d8f0e8'; ctx.fillRect(x + w / 2 - 2, y + 2, 4, 14); ctx.save(); ctx.shadowColor = sk.accent; ctx.shadowBlur = 8 * f.S; ctx.fillStyle = sk.accent; ctx.beginPath(); ctx.ellipse(x + w / 2, y + 3 + sq * 2, w / 2 + sq * 2, 5 - sq * 2, 0, Math.PI, 0); ctx.fill(); ctx.restore(); ctx.fillStyle = '#ffffff'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + w * (.25 + i * .25), y - 1 + sq * 2, .8, 0, TAU); ctx.fill(); } break; }
      case 'glowline': { const a = pl.glow || 0; ctx.strokeStyle = rgba(sk.accent, .5 + a * .5); ctx.lineWidth = 1; ctx.setLineDash(a > .5 ? [] : [1.5, 2]); ctx.save(); if (a > .3) { ctx.shadowColor = sk.accent; ctx.shadowBlur = 8 * f.S * a; } ctx.strokeRect(x, y, w, 5); ctx.fillStyle = rgba(sk.accent, a * .3); ctx.fillRect(x, y, w, 5); ctx.restore(); ctx.setLineDash([]); break; }
      case 'fogstone': { const a = pl.glow || 0; ctx.globalAlpha *= .22 + a * .78; ctx.fillStyle = '#0b0b0a'; ctx.beginPath(); roundRect(ctx, x, y, w, 7, 2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x + 2, y + 1, w - 4, .8); break; }
      case 'lancha': { ctx.fillStyle = sk.plat; ctx.beginPath(); ctx.moveTo(x - 3, y); ctx.lineTo(x + w + 4, y); ctx.lineTo(x + w - 2, y + 7); ctx.lineTo(x + 2, y + 7); ctx.closePath(); ctx.fill(); ctx.fillStyle = sk.plat2; ctx.fillRect(x - 2, y + 2, w + 5, 1.6); ctx.fillStyle = sk.accent; ctx.fillRect(x + w * .2, y - 6, 1.2, 6); ctx.beginPath(); ctx.moveTo(x + w * .2 + 1.2, y - 6); ctx.lineTo(x + w * .2 + 7, y - 2); ctx.lineTo(x + w * .2 + 1.2, y - 1); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(x - 6, y + 8); ctx.lineTo(x + w + 6, y + 8); ctx.stroke(); break; }
      case 'inkcloud': { const k = pl.k === 'timed' ? (pl.on ? clamp(Math.min(pl.ph / .1, ((pl.duty || .62) - pl.ph) / .15), 0, 1) : 0) : 1; if (k < .05 && pl.k === 'timed') { ctx.fillStyle = 'rgba(29,27,25,.08)'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + 3, w / 2, 3, 0, 0, TAU); ctx.fill(); break; } ctx.globalAlpha *= .3 + k * .7; ctx.fillStyle = sk.plat; ctx.beginPath(); for (let i = 0; i < 4; i++) { const cx = x + w * (.15 + i * .23), r = 4 + (i % 2) * 2; ctx.moveTo(cx + r, y + 3); ctx.arc(cx, y + 3, r, 0, TAU); } ctx.fill(); ctx.strokeStyle = sk.line; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(x, y + 1); ctx.quadraticCurveTo(x + w / 2, y - 3, x + w, y + 1); ctx.stroke(); break; }
      case 'neon': { const on = pl.on; ctx.save(); ctx.strokeStyle = pl.grp === 'A' ? '#00e8ff' : '#ff2bd6'; ctx.globalAlpha *= on ? 1 : .25; ctx.lineWidth = on ? 1.2 : .6; if (on) { ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 8 * f.S; } ctx.setLineDash(on ? [] : [2, 2]); ctx.strokeRect(x, y, w, 7); ctx.fillStyle = on ? rgba(pl.grp === 'A' ? '#00e8ff' : '#ff2bd6', .2) : 'transparent'; ctx.fillRect(x, y, w, 7); ctx.restore(); ctx.setLineDash([]); break; }
      case 'crystal': { ctx.fillStyle = sk.plat; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - 5, y + 9); ctx.lineTo(x + 5, y + 9); ctx.closePath(); ctx.fill(); ctx.fillStyle = sk.plat2; ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - 5, y + 9); ctx.lineTo(x + w / 2, y + 9); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(x + 2, y, w - 4, .8); break; }
      case 'stone': { ctx.fillStyle = sk.plat; ctx.fillRect(x, y, w, 9); ctx.strokeStyle = sk.line; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, 9); ctx.beginPath(); for (let i = 3; i < w - 3; i += 8) { ctx.moveTo(x + i, y + 2); ctx.lineTo(x + i, y + 7); ctx.lineTo(x + i + 4, y + 7); ctx.lineTo(x + i + 4, y + 4); } ctx.lineWidth = .7; ctx.stroke(); break; }
      case 'swirlplat': { ctx.fillStyle = sk.plat; ctx.beginPath(); roundRect(ctx, x, y, w, 6, 3); ctx.fill(); ctx.strokeStyle = sk.accent; ctx.lineWidth = 1.1; ctx.lineCap = 'round'; for (let i = 0; i < 4; i++) { const a = t * 2 + i; ctx.beginPath(); ctx.arc(x + w / 2, y + 3, 6 + i * 2, a, a + 1); ctx.stroke(); } break; }
      case 'ice': { const gr = ctx.createLinearGradient(x, y, x + w, y + 8); gr.addColorStop(0, '#d8f0ff'); gr.addColorStop(.5, '#8fc8f0'); gr.addColorStop(1, '#c8e8ff'); ctx.fillStyle = gr; ctx.fillRect(x, y, w, 7); ctx.strokeStyle = '#141414'; ctx.lineWidth = 1.2; ctx.strokeRect(x, y, w, 7); ctx.beginPath(); for (let i = 10; i < w; i += 12) { ctx.moveTo(x + i, y); ctx.lineTo(x + i - 3, y + 7); } ctx.lineWidth = .8; ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillRect(x + 2, y + 1, w * .3, .8); break; }
      case 'pencil': { const x2 = pl.k === 'seg' ? pl.x2 : x + w, y2 = pl.k === 'seg' ? pl.y2 : y; ctx.strokeStyle = sk.line; ctx.lineCap = 'round'; for (let k = 0; k < 2; k++) { ctx.lineWidth = .55 - k * .15; ctx.beginPath(); ctx.moveTo(x + k * .4, y + k * .5); ctx.lineTo(x2 - k * .3, y2 + k * .4); ctx.stroke(); } ctx.globalAlpha *= .4; ctx.lineWidth = .25; ctx.beginPath(); for (let i = 0; i < 1; i += .12) { const px = lerp(x, x2, i), py = lerp(y, y2, i); ctx.moveTo(px, py + .8); ctx.lineTo(px + 1.4, py + 2.6); } ctx.stroke(); break; }
      case 'plank': { ctx.fillStyle = sk.plat; ctx.fillRect(x, y, w, 6); ctx.strokeStyle = sk.line; ctx.lineWidth = .5; ctx.beginPath(); for (let i = 0; i < w; i += 3) { ctx.moveTo(x + i, y + 1); ctx.lineTo(x + i + 2, y + 5); } ctx.stroke(); if (pl.cx !== undefined) { ctx.strokeStyle = sk.plat; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(pl.cx, pl.cy); ctx.lineTo(x + w / 2, y + 3); ctx.stroke(); } break; }
      case 'switchblk': break;
      case 'spring': { const sq = pl.sq || 0; pl.sq = sq * .85; const top = y - 2 + sq * 3; ctx.strokeStyle = '#7a8a9a'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let i = 0; i < 4; i++) { ctx.moveTo(x + 1, top + 2 + i * 1.6); ctx.lineTo(x + w - 1, top + 2.8 + i * 1.6); } ctx.stroke(); ctx.fillStyle = sk.accent; ctx.beginPath(); roundRect(ctx, x - 1, top - 1, w + 2, 3, 1.2); ctx.fill(); ctx.strokeStyle = '#2a1e2e'; ctx.lineWidth = .7; ctx.stroke(); ctx.fillStyle = '#5a6a7a'; ctx.fillRect(x - 1, y + 5, w + 2, 1.5); break; }
      case 'petal': { ctx.fillStyle = sk.plat; ctx.strokeStyle = sk.line; ctx.lineWidth = .65; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.quadraticCurveTo(x + w * .75, y + 7, x + w / 2, y + 7); ctx.quadraticCurveTo(x + w * .25, y + 7, x, y); ctx.fill(); ctx.stroke(); ctx.strokeStyle = sk.accent; ctx.beginPath(); ctx.moveTo(x + 4, y + 2); ctx.lineTo(x + w - 4, y + 2); ctx.stroke(); break; }
      case 'gold': { ctx.fillStyle = '#0b0e14'; ctx.fillRect(x, y, w, 7); ctx.strokeStyle = '#d4af37'; ctx.lineWidth = .8; ctx.strokeRect(x, y, w, 7); ctx.beginPath(); for (let i = 0; i < w; i += 6) { ctx.moveTo(x + i, y + 6); ctx.lineTo(x + i + 3, y + 2); ctx.lineTo(x + i + 6, y + 6); } ctx.lineWidth = .5; ctx.stroke(); ctx.save(); ctx.translate(x + w / 2, y + 9); ctx.rotate(t * 3); ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; ctx.lineTo(Math.cos(a) * (i % 2 ? 2 : 3), Math.sin(a) * (i % 2 ? 2 : 3)); } ctx.closePath(); ctx.fillStyle = '#d4af37'; ctx.fill(); ctx.restore(); break; }
      case 'belt': { const dir = (pl.v || 50) * (pl.rev > 0 ? -1 : 1); ctx.fillStyle = '#1a1d2a'; ctx.beginPath(); roundRect(ctx, x, y, w, 7, 3.5); ctx.fill(); ctx.strokeStyle = '#4a4f70'; ctx.lineWidth = .7; ctx.stroke(); ctx.save(); ctx.beginPath(); roundRect(ctx, x + 1, y + 1, w - 2, 5, 2.5); ctx.clip(); ctx.strokeStyle = pl.rev > 0 ? '#ff2a6d' : '#05d9e8'; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 4 * f.S; ctx.lineWidth = .8; const o = wrap(t * dir * .5, 8); ctx.beginPath(); for (let i = -8; i < w + 8; i += 8) { const px = x + i + o; if (dir > 0) { ctx.moveTo(px, y + 1.5); ctx.lineTo(px + 2.5, y + 3.5); ctx.lineTo(px, y + 5.5); } else { ctx.moveTo(px + 2.5, y + 1.5); ctx.lineTo(px, y + 3.5); ctx.lineTo(px + 2.5, y + 5.5); } } ctx.stroke(); ctx.restore(); break; }
      case 'gasrock': { ctx.fillStyle = sk.plat; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - 3, y + 6); ctx.lineTo(x + w * .5, y + 10); ctx.lineTo(x + 3, y + 6); ctx.closePath(); ctx.fill(); ctx.fillStyle = sk.plat2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + 2); ctx.lineTo(x, y + 2); ctx.fill(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const by = y + 12 + wrap(t * 14 + i * 6, 18); glowDot(ctx, x + w * (.3 + i * .2), by, 3, sk.accent, .5 * (1 - (by - y - 12) / 18)); } ctx.globalCompositeOperation = 'source-over'; break; }
      case 'pixblk': { const a = pl.idx; ctx.fillStyle = '#ff55ff'; ctx.fillRect(x, y, w, 8); ctx.fillStyle = '#000'; ctx.fillRect(x, y + 6, w, 2); ctx.fillStyle = '#55ffff'; for (let i = 0; i < w; i += 4) ctx.fillRect(x + i, y, 2, 2); if (g_freeze(f)) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.strokeRect(x - 1, y - 1, w + 2, 10); } for (const q of pl.pos) { const gx = tx(q[0]), gy = tl(q[1]); if (gx === x && gy === y) continue; ctx.fillStyle = 'rgba(85,255,255,.25)'; for (let i = 0; i < w; i += 4) ctx.fillRect(gx + i, gy + 3, 2, 2); } break; }
      case 'plane': { ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y + 1); ctx.lineTo(x + 6, y + 6); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(80,50,30,.5)'; ctx.lineWidth = .5; ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 4, y + .4); ctx.lineTo(x + w, y + 1); ctx.stroke(); break; }
      case 'leaf': { ctx.strokeStyle = '#66814a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pl.vineX, pl.vineY); ctx.quadraticCurveTo(pl.vineX + 4, (pl.vineY + y) / 2, pl.vineX, y + 4); ctx.stroke(); ctx.fillStyle = '#79a85f'; ctx.strokeStyle = '#3d643e'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.quadraticCurveTo(x + w * .72, y + 7, x + w / 2, y + 7); ctx.quadraticCurveTo(x + w * .25, y + 7, x, y); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#cce0a1'; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(x + 4, y + 2); ctx.lineTo(x + w - 4, y + 2); ctx.stroke(); break; }
      default: if (LOOK[pl.look]) { LOOK[pl.look](ctx, pl, f, sk); break; } { ctx.fillStyle = sk.plat; ctx.fillRect(x, y, w, 6); if (sk.line) { ctx.strokeStyle = sk.line; ctx.lineWidth = .8; ctx.strokeRect(x, y, w, 6); } }
    }
    ctx.restore();
  }
  const g_freeze = f => f.g.freezeT > 0;
  function drawSolid(ctx, s, f, sk) {
    const t = f.t;
    if (PINTA_SOLIDO[s.k] && PINTA_SOLIDO[s.k](ctx, s, f, sk)) return;   // los niveles vestidos (vestir-nivel.js)
    if (s.k === 'pblock' && OBJ.pblock && OBJ.pblock.drawSolid && OBJ.pblock.drawSolid(ctx, s, f, sk)) return; // muralla-pixel.js lo viste con su asset
    if (s.k === 'pblock') { const k = s.grow ?? 1; ctx.save(); ctx.translate(s.x + 8, s.y + 8); ctx.scale(k, k); ctx.fillStyle = '#222034'; ctx.fillRect(-8, -8, 16, 16); ctx.fillStyle = '#5fcde4'; ctx.fillRect(-7, -7, 14, 14); ctx.fillStyle = '#cbdbfc'; ctx.fillRect(-7, -7, 14, 2); ctx.fillRect(-7, -7, 2, 14); ctx.fillStyle = '#306082'; ctx.fillRect(-7, 5, 14, 2); ctx.fillRect(5, -7, 2, 14); ctx.restore(); if (s.life < 1 && Math.sin(t * 30) > 0) { ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(s.x, s.y, 16, 16); } return; }
    if (s.k === 'pillar') { const k = s.grow ?? 1, h = s.h * k; ctx.fillStyle = '#7fd8f0'; ctx.beginPath(); ctx.moveTo(s.x + 2, s.y + s.h); ctx.lineTo(s.x + 2, s.y + s.h - h + 4); ctx.lineTo(s.x + 8, s.y + s.h - h); ctx.lineTo(s.x + 14, s.y + s.h - h + 4); ctx.lineTo(s.x + 14, s.y + s.h); ctx.fill(); ctx.fillStyle = '#3a8fc0'; ctx.fillRect(s.x + 8, s.y + s.h - h + 2, 6, h - 2); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(s.x + 4, s.y + s.h - h + 5, 1, h - 6); return; }
    if (s.k === 'glass') { ctx.fillStyle = 'rgba(160,210,255,.45)'; ctx.fillRect(s.x, s.y, s.w, s.h); ctx.strokeStyle = '#141414'; ctx.lineWidth = 1.3; ctx.strokeRect(s.x, s.y, s.w, s.h); ctx.beginPath(); ctx.moveTo(s.x, s.y + 6); ctx.lineTo(s.x + 9, s.y); ctx.moveTo(s.x + 6, s.y + 16); ctx.lineTo(s.x + 16, s.y + 7); ctx.lineWidth = .8; ctx.stroke(); return; }
    if (s.k === 'switch') { const col = s.grp === 'A' ? '#306230' : '#8bac0f'; if (s.on) { ctx.fillStyle = '#0f380f'; ctx.fillRect(s.x, s.y, s.w, s.h); ctx.fillStyle = col; ctx.fillRect(s.x + 1, s.y + 1, s.w - 2, s.h - 2); ctx.fillStyle = '#9bbc0f'; ctx.font = 'bold 9px monospace'; ctx.fillText(s.grp, s.x + 5, s.y + 12); } else { ctx.strokeStyle = col; ctx.setLineDash([2, 2]); ctx.lineWidth = 1; ctx.strokeRect(s.x + 1.5, s.y + 1.5, s.w - 3, s.h - 3); ctx.setLineDash([]); } return; }
    if (s.k === 'glyph') { ctx.globalAlpha = s.on ? 1 : .3; ctx.fillStyle = '#cdb48a'; ctx.fillRect(s.x, s.y, s.w, s.h); ctx.strokeStyle = '#1c1612'; ctx.lineWidth = 1.2; ctx.strokeRect(s.x + .6, s.y + .6, s.w - 1.2, s.h - 1.2); ctx.beginPath(); roundRect(ctx, s.x + 3, s.y + 3, s.w - 6, s.h - 6, 3); ctx.lineWidth = .8; ctx.stroke(); ctx.fillStyle = ['#b0412e', '#4d8a5c', '#4a9eb0', '#d79a3d'][s.grp % 4]; ctx.beginPath(); ctx.arc(s.x + s.w / 2, s.y + s.h / 2, 2.4, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; return; }
    if (OBJ[s.k] && OBJ[s.k].drawSolid) { OBJ[s.k].drawSolid(ctx, s, f, sk); return; }
    if (s.k === 'wood') { ctx.fillStyle = '#1f1a1c'; ctx.fillRect(s.x, s.y, s.w, s.h); ctx.strokeStyle = '#efe5cf'; ctx.lineWidth = .5; ctx.beginPath(); for (let i = 2; i < s.h; i += 3) { ctx.moveTo(s.x + 1, s.y + i); ctx.quadraticCurveTo(s.x + s.w / 2, s.y + i + (i % 2 ? 1.5 : -1.5), s.x + s.w - 1, s.y + i); } ctx.stroke(); ctx.strokeRect(s.x + .5, s.y + .5, s.w - 1, s.h - 1); return; }
  }
  function drawZone(ctx, z, f) {
    if (PINTA_ZONA[z.k] && PINTA_ZONA[z.k](ctx, z, f)) return;
    if (ZONAS[z.k]) { ZONAS[z.k].pinta(ctx, z, f); return; }
    const a = z.life !== undefined ? Math.min(1, z.life) : 1, cx = (z.x0 + z.x1) / 2;
    ctx.save(); ctx.globalAlpha = .7 * a; ctx.strokeStyle = z.k === 'swirl' ? '#f8e27a' : 'rgba(255,240,220,.85)'; ctx.lineCap = 'round'; ctx.lineWidth = 1;
    for (let i = 0; i < 9; i++) { const k = wrap(f.t * .9 + i / 9, 1), y = z.y1 - k * (z.y1 - z.y0), r = (z.x1 - z.x0) * (.25 + .25 * Math.sin(i * 1.7)); ctx.globalAlpha = .7 * a * Math.sin(k * Math.PI); ctx.beginPath(); ctx.arc(cx + Math.sin(f.t * 3 + i) * 3, y, Math.abs(r) * .6, f.t * 4 + i, f.t * 4 + i + 2.2); ctx.stroke(); }
    ctx.restore();
  }

  // ---------- enemigos: cada uno con su dibujo ----------
  const zz = (ctx, e, t) => { ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = 'bold 5px "Alegreya Sans", sans-serif'; for (let k = 0; k < 3; k++) { const ph = (t * .8 + k / 3) % 1; ctx.globalAlpha = 1 - ph; ctx.fillText('z', e.x + 4 + ph * 6 + k, e.y - e.h - 2 - ph * 10); } ctx.globalAlpha = 1; };
  const FD = {
    cangrejo(c, e, t, s) { const a = Math.sin(e.anim * 14); c.strokeStyle = s.dark; c.lineWidth = .9; for (let i = -1; i <= 1; i++) for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * 4, -3); c.lineTo(d * (7 + Math.abs(i)), -1 + i + a * d * .8); c.lineTo(d * (8 + Math.abs(i)), 0); c.stroke(); } c.fillStyle = s.main; c.beginPath(); c.ellipse(0, -4.5, 6.5, 3.6, 0, 0, TAU); c.fill(); c.strokeStyle = s.dark; c.stroke(); for (const d of [-1, 1]) { c.beginPath(); c.arc(d * 8.5, -6.5, 2.4, 0, TAU); c.fill(); c.stroke(); c.strokeStyle = s.dark; c.beginPath(); c.moveTo(d * 2, -7.5); c.lineTo(d * 2.5, -10); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(d * 2.5, -10.5, 1.1, 0, TAU); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(d * 2.6, -10.5, .5, 0, TAU); c.fill(); c.fillStyle = s.main; } },
    murcielago(c, e, t, s) { const f = Math.sin(e.anim * 16); c.fillStyle = s.dark; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(0, -4); c.lineTo(d * 9, -7 - f * 3); c.lineTo(d * 7, -3 - f); c.lineTo(d * 5, -4.5); c.lineTo(d * 3, -2); c.fill(); } c.beginPath(); c.ellipse(0, -4, 2.6, 3.2, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(-2, -6.5); c.lineTo(-1.5, -9); c.lineTo(-.6, -6.8); c.moveTo(2, -6.5); c.lineTo(1.5, -9); c.lineTo(.6, -6.8); c.fill(); c.fillStyle = s.eye; c.fillRect(-1.3, -5, .9, .9); c.fillRect(.5, -5, .9, .9); },
    rana(c, e, t, s) { const air = e.vy !== 0; c.fillStyle = s.main; c.strokeStyle = s.dark; c.lineWidth = .7; if (air) { c.beginPath(); c.moveTo(-3, -3); c.lineTo(-8, 1); c.moveTo(3, -3); c.lineTo(8, 1); c.lineWidth = 1.6; c.strokeStyle = s.main; c.stroke(); c.lineWidth = .7; c.strokeStyle = s.dark; } c.beginPath(); c.ellipse(0, -4, 6, air ? 4.5 : 3.6, 0, 0, TAU); c.fill(); c.stroke(); for (const d of [-1, 1]) { c.beginPath(); c.arc(d * 3, -7.6, 2, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#111'; c.beginPath(); c.arc(d * 3 + .4, -7.8, .8, 0, TAU); c.fill(); c.fillStyle = s.main; } c.fillStyle = s.light; c.beginPath(); c.ellipse(0, -2.5, 4, 1.5, 0, 0, TAU); c.fill(); },
    avispa(c, e, t, s) { const f = Math.sin(e.anim * 30) * .5 + .5; c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(-1, -9 - f, 3, 1.6, -.5, 0, TAU); c.ellipse(1.5, -9 - f, 3, 1.6, .5, 0, TAU); c.fill(); c.save(); c.beginPath(); c.ellipse(0, -5, 6, 3.4, 0, 0, TAU); c.clip(); c.fillStyle = s.main; c.fillRect(-7, -9, 14, 8); c.fillStyle = s.dark; for (let i = -4; i < 6; i += 3) c.fillRect(i, -9, 1.4, 8); c.restore(); c.beginPath(); c.moveTo(-6, -5); c.lineTo(-9, -4.5); c.lineTo(-6, -4); c.fillStyle = s.dark; c.fill(); c.beginPath(); c.arc(5.5, -5.5, 2.2, 0, TAU); c.fill(); },
    cocuyo(c, e, t, s) { c.globalCompositeOperation = 'lighter'; glowDot(c, -2, -3, 9, s.eye, .5 + Math.sin(t * 5 + e.hx) * .2); c.globalCompositeOperation = 'source-over'; c.fillStyle = s.dark; c.beginPath(); c.ellipse(1, -4, 4.5, 3, 0, 0, TAU); c.fill(); c.fillStyle = s.eye; c.beginPath(); c.arc(-2.5, -4, 2, 0, TAU); c.fill(); c.fillStyle = 'rgba(200,255,240,.5)'; const f = Math.sin(e.anim * 25); c.beginPath(); c.ellipse(1, -7.5 - f, 3, 1.3, -.3, 0, TAU); c.fill(); },
    zopilote(c, e, t, s) { const dive = e.st === 'dive', f = dive ? .2 : Math.sin(e.anim * 4) * .6; c.fillStyle = s.dark; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(0, -5); c.lineTo(d * 10, -6 - f * 4); c.lineTo(d * 12, -4 - f * 4); c.lineTo(d * 9, -3); c.lineTo(d * 3, -2); c.fill(); } c.beginPath(); c.ellipse(0, -4, 4, 3, 0, 0, TAU); c.fill(); c.fillStyle = s.accent; c.beginPath(); c.arc(4.5, -6, 1.8, 0, TAU); c.fill(); c.fillStyle = '#e8d8c8'; c.beginPath(); c.moveTo(6, -6.4); c.lineTo(8, -5.6); c.lineTo(6, -5.2); c.fill(); },
    culebra(c, e, t, s) { const L2 = e.st === 'lunge' ? 1.3 : 1; c.lineCap = 'round'; c.lineWidth = 3.2; const pts = []; for (let i = 0; i < 8; i++) pts.push([-9 * L2 + i * 2.6 * L2, -2 - Math.sin(e.anim * 8 - i * .9) * 1.4]); const cols = [s.main, '#111', s.accent, '#111']; for (let i = 0; i < pts.length - 1; i++) { c.strokeStyle = cols[i % 4]; c.beginPath(); c.moveTo(pts[i][0], pts[i][1]); c.lineTo(pts[i + 1][0], pts[i + 1][1]); c.stroke(); } const h = pts[pts.length - 1]; c.fillStyle = s.main; c.beginPath(); c.ellipse(h[0] + 1.5, h[1] - (e.st === 'lunge' ? 2 : 0), 2.6, 2, 0, 0, TAU); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(h[0] + 2, h[1] - .8, .5, 0, TAU); c.fill(); if (e.st === 'lunge') { c.strokeStyle = '#d02040'; c.lineWidth = .5; c.beginPath(); c.moveTo(h[0] + 4, h[1]); c.lineTo(h[0] + 7, h[1] - .5); c.stroke(); } },
    iguana(c, e, t, s) { const run = e.t % 2 < 1, a = run ? Math.sin(e.anim * 20) : 0; c.save(); c.shadowColor = s.eye; c.shadowBlur = 5; c.strokeStyle = s.eye; c.fillStyle = s.main; c.lineWidth = .8; c.beginPath(); c.moveTo(-14, -2); c.quadraticCurveTo(-9, -3, -6, -4); c.lineTo(5, -5); c.lineTo(9, -4); c.lineTo(5, -2); c.lineTo(-6, -2); c.closePath(); c.fill(); c.stroke(); c.restore(); c.strokeStyle = s.eye; c.lineWidth = .6; c.beginPath(); for (let i = -4; i < 4; i += 2) { c.moveTo(i, -5); c.lineTo(i + 1, -7); } c.stroke(); for (const [lx, ph] of [[-4, 0], [3, 1]]) { c.beginPath(); c.moveTo(lx, -2); c.lineTo(lx + a * 2 * (ph ? -1 : 1), 0); c.stroke(); } c.fillStyle = s.eye; c.fillRect(6, -5, 1, 1); },
    alux(c, e, t, s) { c.globalAlpha *= e.fade ?? 1; c.fillStyle = '#0b0b0a'; c.beginPath(); c.moveTo(-4, 0); c.lineTo(-3, -7); c.lineTo(3, -7); c.lineTo(4, 0); c.fill(); c.beginPath(); c.arc(0, -9, 3.4, 0, TAU); c.fill(); c.beginPath(); c.ellipse(0, -11.5, 6.5, 1.4, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(-2.4, -12); c.lineTo(0, -16); c.lineTo(2.4, -12); c.fill(); c.fillStyle = s.eye; c.globalCompositeOperation = 'lighter'; glowDot(c, 1.2, -9, 3, s.eye, .8); c.globalCompositeOperation = 'source-over'; c.fillRect(.5, -9.6, 1.2, 1.2); c.fillRect(-1.6, -9.6, 1.2, 1.2); },
    jabali(c, e, t, s) { const run = e.st === 'run', a = Math.sin(e.anim * (run ? 24 : 10)); c.fillStyle = s.dark; for (const [lx, ph] of [[-5, 0], [-2, 1], [3, 0], [6, 1]]) c.fillRect(lx + (ph ? a : -a) * 1.2, -3, 1.6, 3); c.fillStyle = s.main; c.beginPath(); c.ellipse(0, -6, 8, 4.6, 0, 0, TAU); c.fill(); c.fillStyle = s.light; c.fillRect(2, -10, 1.4, 8); c.fillStyle = s.dark; c.beginPath(); c.moveTo(-6, -10); for (let i = -6; i < 4; i += 2) c.lineTo(i + 1, -12); c.lineTo(4, -10); c.fill(); c.fillStyle = s.main; c.beginPath(); c.moveTo(6, -8); c.lineTo(11, -5); c.lineTo(6, -3.5); c.fill(); c.fillStyle = s.light; c.beginPath(); c.arc(11, -5, 1, 0, TAU); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(6.5, -7, .7, 0, TAU); c.fill(); if (e.st === 'stun') zz(c, { x: 0, y: 0, h: 10 }, t); },
    jaguar(c, e, t, s) { const air = e.vy !== 0, a = Math.sin(e.anim * 9); c.strokeStyle = s.main; c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-8, -6); c.quadraticCurveTo(-13, -8 + a, -12, -12); c.stroke(); c.fillStyle = s.main; c.beginPath(); c.ellipse(0, -6, 8, air ? 3.4 : 4, air ? -.2 : 0, 0, TAU); c.fill(); c.lineWidth = 1.8; for (const [lx, ph] of [[-5, 0], [5, 1]]) { c.beginPath(); c.moveTo(lx, -4); c.lineTo(lx + (air ? (ph ? 4 : -4) : (ph ? a : -a) * 1.5), 0); c.stroke(); } c.beginPath(); c.arc(8, -8, 3.6, 0, TAU); c.fill(); c.fillStyle = s.dark; for (const [sx, sy] of [[-4, -7], [-1, -5], [2, -8], [4, -5], [-6, -5]]) { c.beginPath(); c.arc(sx, sy, .9, 0, TAU); c.fill(); } c.beginPath(); c.moveTo(6.5, -11); c.lineTo(7, -13); c.lineTo(8.5, -11.2); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(9.5, -8.6, .6, 0, TAU); c.fill(); },
    buho(c, e, t, s) { const f = e.st === 'dive' ? .9 : Math.sin(e.anim * 6) * .5; c.fillStyle = s.dark; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * 3, -8); c.quadraticCurveTo(d * 10, -10 - f * 4, d * 11, -4); c.quadraticCurveTo(d * 7, -5, d * 3, -3); c.fill(); } c.fillStyle = s.main; c.beginPath(); c.ellipse(0, -6, 4.5, 5.5, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(-3.5, -10); c.lineTo(-3, -13); c.lineTo(-1.5, -10.5); c.moveTo(3.5, -10); c.lineTo(3, -13); c.lineTo(1.5, -10.5); c.fill(); for (const d of [-1, 1]) { c.fillStyle = s.eye; c.beginPath(); c.arc(d * 1.8, -8, 1.6, 0, TAU); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(d * 1.8, -8, .7, 0, TAU); c.fill(); } c.fillStyle = s.accent; c.beginPath(); c.moveTo(-.6, -7); c.lineTo(.6, -7); c.lineTo(0, -5.5); c.fill(); },
    escarabajo(c, e, t, s) { c.save(); c.translate(0, -5); c.rotate(e.x * .25 * e.dir); c.beginPath(); c.arc(0, 0, 5, 0, TAU); const gr = c.createLinearGradient(-5, -5, 5, 5); gr.addColorStop(0, s.light); gr.addColorStop(.5, s.main); gr.addColorStop(1, s.dark); c.fillStyle = gr; c.fill(); c.strokeStyle = '#141414'; c.lineWidth = 1; c.stroke(); c.beginPath(); c.moveTo(-5, 0); c.lineTo(5, 0); c.moveTo(0, -5); c.lineTo(0, 5); c.lineWidth = .7; c.stroke(); c.restore(); },
    garabato(c, e, t, s) { const sd = Math.floor(t * 8); c.strokeStyle = s.dark; c.lineWidth = .6; c.beginPath(); for (let i = 0; i < 30; i++) { const a = i * .9 + sd, r = 3 + hash1(i, sd) * 3; c.lineTo(Math.cos(a) * r, -6 + Math.sin(a) * r); } c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(-1.5, -7, 1.4, 0, TAU); c.arc(1.8, -7, 1.4, 0, TAU); c.fill(); c.stroke(); c.fillStyle = s.dark; c.beginPath(); c.arc(-1.2, -7, .5, 0, TAU); c.arc(2.1, -7, .5, 0, TAU); c.fill(); },
    calavera(c, e, t, s) { c.fillStyle = s.light; c.strokeStyle = s.dark; c.lineWidth = .8; c.beginPath(); c.arc(0, -6.5, 5, Math.PI * .9, Math.PI * 2.1); c.lineTo(3, -1); c.lineTo(-3, -1); c.closePath(); c.fill(); c.stroke(); c.fillStyle = s.dark; c.beginPath(); c.ellipse(-2, -6.5, 1.4, 1.7, 0, 0, TAU); c.ellipse(2, -6.5, 1.4, 1.7, 0, 0, TAU); c.fill(); c.fillStyle = s.accent; c.beginPath(); c.arc(-2, -6.5, .5, 0, TAU); c.arc(2, -6.5, .5, 0, TAU); c.fill(); c.strokeStyle = s.dark; c.beginPath(); for (let i = -2; i <= 2; i++) { c.moveTo(i, -3); c.lineTo(i, -1.4); } c.stroke(); c.fillStyle = s.accent; for (let i = 0; i < 5; i++) { const a = Math.PI + i / 4 * Math.PI; c.beginPath(); c.arc(Math.cos(a) * 3.6, -9 + Math.sin(a) * 1.5, .7, 0, TAU); c.fill(); } },
    tortuga(c, e, t, s) { const sh = e.st === 'shell' || e.st === 'slide'; if (!sh) { const a = Math.sin(e.anim * 8); c.fillStyle = s.light; c.beginPath(); c.arc(7, -4, 2.4, 0, TAU); c.fill(); c.fillRect(-5 + a, -2, 2, 2); c.fillRect(3 - a, -2, 2, 2); c.fillStyle = '#0f380f'; c.fillRect(7.6, -4.8, .9, .9); } c.save(); if (e.st === 'slide') { c.translate(0, -4); c.rotate(e.t * 20); c.translate(0, 4); } c.fillStyle = s.main; c.beginPath(); c.ellipse(0, -4, 7, 5, 0, Math.PI, 0); c.lineTo(7, -1); c.lineTo(-7, -1); c.closePath(); c.fill(); c.strokeStyle = s.dark; c.lineWidth = .8; c.stroke(); c.beginPath(); c.moveTo(-3.5, -1); c.lineTo(-2, -6); c.lineTo(2, -6); c.lineTo(3.5, -1); c.stroke(); c.restore(); },
    pelicano(c, e, t, s) { const dive = e.st === 'dive', f = dive ? 0 : Math.sin(e.anim * 5) * .7; c.fillStyle = s.main; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(0, -6); c.lineTo(d * 12, -7 - f * 4); c.lineTo(d * 9, -4); c.lineTo(d * 2, -3); c.fill(); } c.beginPath(); c.ellipse(0, -5, 5, 3, dive ? .6 : 0, 0, TAU); c.fill(); c.strokeStyle = s.dark; c.lineWidth = .6; c.stroke(); c.beginPath(); c.arc(5, -8, 2.2, 0, TAU); c.fill(); c.fillStyle = s.accent; c.beginPath(); c.moveTo(6.5, -8.5); c.lineTo(13, -6); c.lineTo(6.5, -6.5); c.fill(); c.fillStyle = '#111'; c.fillRect(5.5, -8.8, .8, .8); },
    abeja(c, e, t, s) { const f = Math.sin(e.anim * 32) * .5 + .5; c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.ellipse(-.5, -7.5 - f, 2.4, 1.3, -.6, 0, TAU); c.ellipse(1.5, -7.5 - f, 2.4, 1.3, .6, 0, TAU); c.fill(); c.strokeStyle = s.dark; c.lineWidth = .4; c.stroke(); c.save(); c.beginPath(); c.ellipse(0, -4, 4.4, 2.8, 0, 0, TAU); c.clip(); c.fillStyle = s.main; c.fillRect(-5, -7, 10, 6); c.fillStyle = s.dark; c.fillRect(-1.5, -7, 1.2, 6); c.fillRect(1.2, -7, 1.2, 6); c.restore(); c.strokeStyle = s.dark; c.lineWidth = .6; c.beginPath(); c.ellipse(0, -4, 4.4, 2.8, 0, 0, TAU); c.stroke(); },
    automata(c, e, t, s) { const m = e.t % 2.4 < 1.6, a = m ? Math.sin(e.anim * 10) : 0; c.strokeStyle = s.accent; c.lineWidth = .7; c.fillStyle = s.dark; c.fillRect(-2.5 + a, -3, 2, 3); c.fillRect(.5 - a, -3, 2, 3); c.beginPath(); c.rect(-4, -11, 8, 8); c.fill(); c.stroke(); c.beginPath(); c.rect(-3, -15, 6, 4); c.fill(); c.stroke(); c.fillStyle = s.accent; c.fillRect(1, -14, 1.2, 1.2); c.save(); c.translate(-5, -7); c.rotate(e.t * (m ? 6 : 1)); c.strokeStyle = s.accent; c.lineWidth = .8; c.beginPath(); c.moveTo(-3, 0); c.lineTo(3, 0); c.moveTo(-3, -1.5); c.lineTo(-3, 1.5); c.moveTo(3, -1.5); c.lineTo(3, 1.5); c.stroke(); c.restore(); c.beginPath(); for (let i = -3; i < 4; i += 2) { c.moveTo(i, -10); c.lineTo(i + 1, -8); c.lineTo(i + 2, -10); } c.stroke(); },
    dron(c, e, t, s) {
      if (e.beam || e.warn) { const by = surf(e.x, e.y) - e.y; c.save(); if (e.beam) { c.shadowColor = s.eye; c.shadowBlur = 8; c.fillStyle = rgba(s.eye, .85); c.fillRect(-1.6, 0, 3.2, by); c.fillStyle = '#ffffff'; c.fillRect(-.5, 0, 1, by); } else { c.strokeStyle = rgba(s.eye, Math.sin(t * 40) > 0 ? .7 : .2); c.setLineDash([2, 3]); c.lineWidth = .6; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, by); c.stroke(); } c.restore(); }
      const off = e.st === 'off'; c.fillStyle = '#1c1e2e'; c.strokeStyle = '#4a4f70'; c.lineWidth = .7; c.beginPath(); roundRect(c, -5, -5, 10, 4, 1.5); c.fill(); c.stroke(); for (const d of [-1, 1]) { c.fillRect(d * 5 - (d < 0 ? 2 : 0), -6, 2, 1); c.strokeStyle = '#8a90b0'; c.beginPath(); c.moveTo(d * 6 - 3 * Math.abs(Math.sin(t * 30)), -6.5); c.lineTo(d * 6 + 3 * Math.abs(Math.sin(t * 30)), -6.5); c.stroke(); } c.fillStyle = off ? '#333' : s.eye; c.beginPath(); c.arc(0, -2.6, 1.3, 0, TAU); c.fill();
    },
    babosa(c, e, t, s) { const air = e.vy !== 0, sq = air ? .8 : 1 + Math.sin(e.anim * 4) * .08; c.fillStyle = s.main; c.beginPath(); c.ellipse(0, -3 * sq, 8 / sq, 3.5 * sq, 0, Math.PI, 0); c.lineTo(8, 0); c.lineTo(-8, 0); c.fill(); c.fillStyle = s.dark; c.fillRect(-8, -1, 16, 1); c.strokeStyle = s.main; c.lineWidth = .8; for (const d of [0, 1]) { c.beginPath(); c.moveTo(4 + d * 2, -5); c.quadraticCurveTo(6 + d * 2, -10, 7 + d * 3, -9 + Math.sin(t * 6 + d)); c.stroke(); c.fillStyle = s.eye; c.beginPath(); c.arc(7 + d * 3, -9 + Math.sin(t * 6 + d), .9, 0, TAU); c.fill(); } },
    invasor(c, e, t, s) { const fr = Math.floor(t * 2) % 2, rows = fr ? ['0010000100', '0001001000', '0011111100', '0110110110', '1111111111', '1011111101', '1010000101', '0001101100'] : ['0010000100', '1001001001', '1011111101', '1110110111', '1111111111', '0111111110', '0010000100', '0100000010']; c.fillStyle = s.main; rows.forEach((r, j) => { for (let i = 0; i < 10; i++) if (r[i] === '1') c.fillRect(-6 + i * 1.2, -10 + j * 1.2, 1.2, 1.2); }); },
  };
  let foeArte = null;   // enemigos-arte.js pone aquí el dibujo con acabado (sombra, gestos y técnica del mundo)
  // cada enemigo puede traer su escala (e.esc, ver tamanos-enemigos.js): se dibuja más grande desde donde pisa
  function drawFoe(ctx, e, f, sk) {
    const esc = e.esc || 1;
    if (esc === 1 || e.st === 'gone') return drawFoe0(ctx, e, f, sk);
    ctx.save(); ctx.translate(e.x, e.y); ctx.scale(esc, esc); ctx.translate(-e.x, -e.y); drawFoe0(ctx, e, f, sk); ctx.restore();
  }
  function drawFoe0(ctx, e, f, sk) {
    if (foeArte) { foeArte(ctx, e, f, sk, FD, zz); if (VIDA.dibuja) VIDA.dibuja(ctx, e, f); return; }
    ctx.save(); ctx.translate(e.x, e.y); ctx.scale(e.dir || 1, 1);
    if (e.st === 'gone') { ctx.globalAlpha = clamp(1 - e.tt / .7, 0, 1); ctx.rotate(e.tt * 4); }
    if (e.st === 'glass') ctx.globalAlpha = .8;
    (FD[e.k] || FD.cangrejo)(ctx, e, f.t, sk.foe);
    ctx.restore();
    if (e.st === 'sleep') zz(ctx, e, f.t);
  }
  function draw(ctx, f, layer, def) {
    const g = f.g; if (!g.plats) return;
    const sk = (def && def.skin) || DEFAULT_SKIN;
    if (layer === 'under') {
      for (const o of g.objs || []) if (OBJ[o.k] && OBJ[o.k].draw && !OBJ[o.k].front) OBJ[o.k].draw(ctx, o, f, sk);
      for (const z of g.zones) drawZone(ctx, z, f);
      for (const pl of g.plats) drawPlat(ctx, pl, f, sk);
      for (const s of g.solids) drawSolid(ctx, s, f, sk);
      for (const e of g.foes) drawFoe(ctx, e, f, sk);
    }
    if (layer !== 'under') for (const o of g.objs || []) if (OBJ[o.k] && OBJ[o.k].front) OBJ[o.k].draw(ctx, o, f, sk);
    if (layer !== 'under' && g.lightBase && !(g.def && g.def.id === 'bruma')) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, g.fre.x, g.fre.y, g.lightR, sk.light || '#bfffef', .12); ctx.restore();
    }
  }
  const DEFAULT_SKIN = { plat: '#8a6a4a', plat2: '#6a4a30', line: '#2a1e18', accent: '#e8b84a', foe: { main: '#c8503a', dark: '#2a1a1a', light: '#f0d0b0', accent: '#e8b84a', eye: '#ffe080' } };

  // ---------- montar las entidades de un nivel ----------
  function init(g, def, ents) {
    g.plats = []; g.solids = []; g.zones = []; g.foes = []; g.objs = []; DYN = g.solids;
    g.power = def.power; g.beat = 0; g.sw = false; g.slowT = 0; g.freezeT = 0; g.flareT = 0;
    if (def.light) { g.lightBase = def.light; g.lightR = def.light; }
    if (def.beatAuto) g.beatAuto = def.beatAuto;
    let nf = 0;
    for (const en of ents) {
      if (en.t === 'plat') {
        const o = Object.assign({}, def.plat, en.o || {});
        const pl = mkPlat(Object.assign(o, { x: tx(en.x), y: tl(en.y), w: tl(en.w) }));
        if (o.k === 'seg') { pl.x2 = tx(o.x2); pl.y2 = tl(o.y2); pl.w = pl.x2 - pl.x; }
        if (o.path === 'circle' && o.look === 'plank') { pl.cx = pl.x0 + pl.w / 2; pl.cy = pl.y0 + 3; }
        if (o.pos) pl.pos = o.pos;
        g.plats.push(pl);
      } else if (en.t === 'solid') g.solids.push({ k: en.k, x: tx(en.x), y: tl(en.y), w: tl(en.w), h: tl(en.h), on: en.on !== false, grp: en.grp });
      else if (en.t === 'zone') g.zones.push({ k: 'swirl', x0: tx(en.x0), x1: tx(en.x1), y0: tl(en.y0), y1: tl(en.y1), t: 0 });
      else if (en.t === 'obj') { const O = OBJ[en.k]; if (O && O.make) O.make(g, en, def); }
      else if (en.t === 'foe') { const x = tx(en.x) + T / 2, y = en.y === undefined ? L.surfaceY(en.x + PAD, 0) * T : tl(en.y); g.foes.push(mkFoe(en.k || (def.fauna ? def.fauna[nf++ % def.fauna.length] : def.foe), x, y)); }
    }
  }
  return { protegePisoton, trazaLapiz, muroLapiz, techoLapiz, pisoLapiz, ZONAS, PINTA_ZONA, PINTA_SOLIDO, ponLuzExtra: fn => { const antes = luzExtra; luzExtra = (g, x, y) => fn(g, x, y) || antes(g, x, y); }, luzActual: () => luzExtra, init, stepPlats, stepFoes, stepGlobal, carry, land, standing, zones, power, draw, env, POW, FOE, FD, LOOK, PK, BEH, OBJ, LANDK,
    drawPlat, drawSolid, drawZone, drawFoe, mkPlat, mkFoe, walkStep, gravity, onGround, ring, lim, freeOf, snapX, snapY, surf, tx, tl, platSpan, platTop,
    VIDA, hurt: (g, d) => hurtFn(g, d), setHurt: fn => hurtFn = fn, setFoeArte: fn => foeArte = fn, DEFAULT_SKIN };
})();
