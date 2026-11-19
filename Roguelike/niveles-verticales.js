'use strict';
// =====================================================================
//  NIVELES VERTICALES · cada mundo de plataformas tiene un nivel que sube y otro que baja
//  No son niveles especiales: siguen siendo plataformas 2D (motor de modos-propio.js), con el
//  terreno, el cielo, los enemigos y la piel de su mundo. Cada run arma su mapa con la semilla
//  de la partida (se reintenta igual, pero cambia entre partidas): plataformas encadenadas,
//  escaleras de troncos, púas, bichos del mundo, puntos de control y canisteles.
//   · subida: se sube saltando (cada salto se calcula con el alcance real de Itzel), y las
//     paredes laterales dejan resbalarse y saltar de pared.
//   · bajada: se cae de plataforma en plataforma; las caídas muy largas lastiman, y ahí
//     Fresita pone burbujas para frenarlas.
//  El poder de Fresita aquí es el mismo en todos los mundos: una burbuja donde apuntas.
// =====================================================================
(() => {
  if (typeof PROPIO === 'undefined' || typeof PIEZAS === 'undefined') return;
  const P = MEC.POW;
  P.burbujaFlota = { name: 'Burbuja de apoyo', help: 'Clic: una burbuja flotante donde apuntas, para apoyarse o frenar una caída (hasta dos a la vez).', cd: .3, click() { return false; } };

  // ---------------- el generador del mapa ----------------
  // y se cuenta en filas hacia arriba desde el piso. Alcance de Itzel en este motor: brinca ~4 filas,
  // y a 118 px/s alcanza unas 3 columnas de hueco si sube 3 filas (4 si sube poco)
  const hueco = rho => (rho >= 3 ? 2 : rho >= 2 ? 3 : 4);
  function genera(rand, sube) {
    const W = 28 + 2 * Math.floor(rand() * 4);
    const entre = (a, b) => a + Math.floor(rand() * (b - a + 1)), uno = l => l[Math.floor(rand() * l.length)];
    const objetivo = sube ? entre(58, 76) : entre(66, 88);
    const plats = [{ c0: 2, c1: W - 3, y: 0, piso: true }], escaleras = [], reservas = [];   // reservas: el aire de las burbujas que Fresita tiene que poner
    // una plataforma no puede quedar encima de otra con menos de 4 filas libres de por medio (no se podría ni saltar);
    // el piso no cuenta: ahí las primeras plataformas son escalones
    const choca = (c0, c1, y, ign) => plats.some(q => q !== ign && c0 <= q.c1 && c1 >= q.c0 && y > q.y && (!q.piso && y - q.y < 6)) ||
      plats.some(q => q.y === y && c0 <= q.c1 + 2 && c1 >= q.c0 - 2) || escaleras.some(e => e.c >= c0 - 1 && e.c <= c1 + 1 && y >= e.y0 - 1 && y <= e.y1 + 3) || reservas.some(r => c0 <= r.c1 && c1 >= r.c0 && y >= r.y0 && y <= r.y1 + 2);
    // el camino va en vaivén: avanza hacia un lado con plataformas que suben poco, y al llegar a la pared
    // sube por una escalera de troncos (o, en las bajadas, se deja caer) y vuelve hacia el otro lado
    let prev = plats[0], dir = rand() < .5 ? -1 : 1, intentos = 0, sinEscalera = 0;
    while (prev.y < objetivo && intentos++ < 600) {
      const w = entre(3, 5);
      const hazEscalera = (forzada) => {
        // se apoya en `prev`; la plataforma de arriba queda del lado contrario al que se venía, y el camino da la vuelta
        const alto = entre(6, 9), izq = dir > 0, c = prev.piso ? (izq ? W - 6 : 5) : (izq ? prev.c1 - 1 : prev.c0 + 1);
        const c0 = izq ? c - w : c + 1, c1 = c0 + w - 1; if (c0 < 2 || c1 > W - 3 || c < 2 || c > W - 3) return false;
        const y = prev.y + alto; if (choca(c0, c1, y, prev) || escaleras.some(e => Math.abs(e.c - c) < 2)) return false;
        const nueva = { c0, c1, y, escalera: true }; plats.push(nueva); escaleras.push({ c, y0: prev.y, y1: y }); prev = nueva; sinEscalera = 0; dir = -dir; return true;
      };
      const caida = !sube && rand() < .1;
      const rho = caida ? entre(8, 10) : sube ? uno([1, 2, 2, 3, 3]) : uno([2, 3, 3, 4, 5, 6]);
      const tope = rho >= 5 ? 2 : Math.min(3, hueco(rho)), gap = caida ? entre(0, 2) : entre(rho >= 5 ? 0 : 1, tope), y = prev.y + rho;
      let c0, c1; if (dir > 0) { c0 = prev.c1 + 1 + gap; c1 = c0 + w - 1; } else { c1 = prev.c0 - 1 - gap; c0 = c1 - w + 1; }
      const cabe = c0 >= 2 && c1 <= W - 3 && !(prev.piso && sube && rho > 3);
      if (prev.piso) {
        // sobre el piso las primeras plataformas son escalones: se ponen a cualquier lado
        const q0 = entre(3, W - 3 - w); if (!choca(q0, q0 + w - 1, prev.y + Math.min(rho, 2), prev)) { const nueva = { c0: q0, c1: q0 + w - 1, y: prev.y + Math.min(rho, 2) }; plats.push(nueva); prev = nueva; dir = q0 > W / 2 ? 1 : -1; dir = -dir; }
        continue;
      }
      // un hueco que solo se cruza con el poder de Fresita: una burbuja en el aire (el círculo punteado marca dónde).
      // 'alto' sube cinco filas (la burbuja queda a tres); 'abismo' cruza seis columnas (la burbuja, al centro)
      if (sinEscalera >= 1 && rand() < .13) {
        const alto = sube && rand() < .5, rho2 = alto ? 5 : entre(0, 1), gapB = alto ? 2 : 6, y2 = prev.y + rho2, yb = alto ? prev.y + 3 : prev.y;
        let b0, c0b, c1b; if (dir > 0) { b0 = prev.c1 + 1 + (alto ? 0 : 2); c0b = prev.c1 + 1 + gapB; c1b = c0b + w - 1; } else { b0 = prev.c0 - (alto ? 0 : 2) - 2; c1b = prev.c0 - 1 - gapB; c0b = c1b - w + 1; }
        if (c0b >= 2 && c1b <= W - 3 && b0 >= 2 && b0 + 1 <= W - 3 && !choca(c0b, c1b, y2, prev)) {
          const nueva = { c0: c0b, c1: c1b, y: y2, burb: { c: b0, y: yb } }; plats.push(nueva); reservas.push({ c0: b0 - 1, c1: b0 + 2, y0: yb - 3, y1: yb + 3 }); prev = nueva; sinEscalera++; continue;
        }
      }
      if (sinEscalera >= 3 && rand() < .22 && hazEscalera()) continue;
      if (!cabe || choca(c0, c1, y, prev)) { if (hazEscalera()) continue; continue; }
      const nueva = { c0, c1, y, caida }; plats.push(nueva); prev = nueva; sinEscalera++;
    }
    if (prev.y < objetivo * .85) return null;                                      // se atoró: que lo intente con otra suerte
    const top = plats[plats.length - 1], Hn = top.y + 9;                       // 9 filas: el cielo de arriba y el piso de abajo
    const fila = y => Hn - 4 - y;                                                // fila de la superficie de una plataforma
    const G = Array.from({ length: Hn }, () => Array(W).fill('.'));
    const pon = (c, r, ch) => { if (r >= 0 && r < Hn && c >= 0 && c < W) G[r][c] = ch; };
    const rect = (c0, c1, r0, r1, ch) => { for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) pon(c, r, ch); };
    rect(0, 1, 0, Hn - 1, '#'); rect(W - 2, W - 1, 0, Hn - 1, '#'); rect(2, W - 3, 0, 0, '#');
    for (const q of plats) { if (q.piso) rect(q.c0, q.c1, fila(0), Hn - 1, '#'); else rect(q.c0, q.c1, fila(q.y), fila(q.y) + 1, '#'); }
    for (const e of escaleras) rect(e.c, e.c, fila(e.y1), fila(e.y0) - 1, 'H');
    const libre = (c, r) => r >= 0 && r < Hn && c >= 2 && c < W - 2 && G[r][c] === '.';
    // lo que lleva cada plataforma
    let desdeCheck = 0;
    plats.forEach((q, i) => {
      if (q.piso) return;
      const ancho = q.c1 - q.c0 + 1, mid = (q.c0 + q.c1) >> 1, r = fila(q.y) - 1, ult = i === plats.length - 1;
      if (ult) return;
      const clase = rand();
      if (ancho >= 5 && clase < .22) { for (let c = mid - 0; c <= mid + (ancho >= 6 ? 1 : 0); c++) if (libre(c, r)) pon(c, r, 'x'); }
      else if (ancho >= 4 && clase < .45) { if (libre(mid, r)) pon(mid, r, 'w'); }
      else if (clase < .7) { for (let c = q.c0; c <= q.c1; c++) if (libre(c, r - 1)) pon(c, r - 1, 'o'); }
      if (++desdeCheck >= 7 && ancho >= 3 && libre(q.c0, r) && G[r][q.c0] === '.') { pon(q.c0, r, 'C'); desdeCheck = 0; }
      // un bicho volador entre esta plataforma y la siguiente, de vez en cuando
      if (rand() < .16 && libre(mid, r - 4)) pon(mid, r - 4, 'v');
    });
    // las burbujas pedidas: el aire marcado con 'b' (no estorba: el poder de Fresita las pone ahí)
    for (const q of plats) if (q.burb) for (const d of [0, 1]) if (G[fila(q.burb.y)][q.burb.c + d] === '.') pon(q.burb.c + d, fila(q.burb.y), 'b');
    // una moneda en cada escalera, a media altura
    for (const e of escaleras) { const rm = fila((e.y0 + e.y1) / 2 | 0); for (const d of [-1, 1]) if (libre(e.c + d, rm)) { pon(e.c + d, rm, 'o'); break; } }
    // adorno: árboles y flores en el piso
    for (const c of [4, W - 5, mid2(W)]) if (G[fila(0) - 1][c] === '.') pon(c, fila(0) - 1, rand() < .5 ? 'f' : 'r');
    const inicio = sube ? plats[0] : top, fin = sube ? top : plats[0];
    if (sube) { pon(4, fila(0) - 1, 'P'); const m = (fin.c0 + fin.c1) >> 1; pon(m, fila(fin.y) - 1, 'G'); }
    else { const pr = top; pon((pr.c0 + pr.c1) >> 1, fila(pr.y) - 1, 'P'); pon(W - 6, fila(0) - 1, 'G'); }
    const mapa = G.map(f => f.join('')); mapa.cadena = { plats, escaleras, W, Hn };   // la cadena queda a la mano para las pruebas
    return mapa;
  }
  const mid2 = W => W >> 1;

  // ---------------- el nivel de cada mundo ----------------
  const MUNDOS = Object.keys(STYLE_MAP).filter(k => NIVELES[k] && NIVELES[k].build && !NIVELES[k].modo && !NIVELES[k].escenarioUayamon && !['agua', 'nouveau', 'paper'].includes(k) && !k.startsWith('uayamon'));
  const cristal = (ctx, j, q) => { const x = q.c * T, y = q.r * T; if (window.PIEZAS_SUBIDA && PIEZAS_SUBIDA.burbuja(ctx, j, q, x, y, j.t)) return; const a = q.t < 1 && Math.sin(j.t * 30) > 0 ? .4 : 1; ctx.globalAlpha = a; const gr = ctx.createLinearGradient(x, y, x + 32, y + 12); gr.addColorStop(0, 'rgba(255,240,250,.95)'); gr.addColorStop(1, 'rgba(255,170,220,.8)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(x + 16, y + 6, 16, 6.4, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = .6; ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(x + 10, y + 3.6, 4, 1.4, -.3, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; };
  const semilla = (k, sube) => typeof RUN === 'object' && RUN ? ((RUN.seed * 2654435761) ^ (RUN.world * 40503) ^ (RUN.idx * 9973) ^ (sube ? 17 : 91) ^ k.length * 131) >>> 0 : (sube ? 77 : 99);
  for (const m of MUNDOS) {
    const base = NIVELES[m], C = (() => { try { return PIEZAS.corta(base); } catch (e) { return null; } })();
    const R = C && C.reglas, w = (R && R.suelo && R.suelo[0]) || base.foe, v = (R && R.aire && R.aire.find(k => k !== w)) || (R && R.aire && R.aire[0]) || base.foe;
    for (const sube of [true, false]) {
      const id = (sube ? 'subida_' : 'bajada_') + m;
      nivelPropio(id, m, {
        nombre: `${base.nombre}, hacia ${sube ? 'arriba' : 'abajo'}`, lugar: base.lugar, dato: base.dato,
        lema: sube ? `Aquí el camino sube: plataformas, escaleras de troncos y los bichos de este mundo, cada vez más alto. Fresita pone burbujas para apoyarse.`
          : `Aquí el camino baja: se cae de plataforma en plataforma y por escaleras de troncos. Una caída muy larga lastima, y Fresita pone burbujas para frenarla.`,
        relleno: m === 'miniatura' ? (ctx => window.MINIATURA_ARTE ? MINIATURA_ARTE.relleno(ctx) : '#4f6232') : ({ cuaderno: '#bfa27f', bits64: '#7a4a32' })[m] || (base.skin && base.skin.plat2) || '#1c1824', rellenoSombra: m === 'miniatura' ? 'rgba(10,20,8,.4)' : null, power: 'burbujaFlota', foe: w, fauna: base.fauna || [w], foes: { w, v }, peso: .55, cd: .3,
        mapa: () => { const s0 = semilla(m, sube); for (let k = 0; k < 40; k++) { const M = genera(rng((s0 + k * 7919) >>> 0), sube); if (M) return M; } return genera(rng(s0), sube) || ['##########', '#P......G#', '##########']; }, caida: sube ? 0 : 7, pared: sube,
        prepara(j) { j.cristales = []; },
        solido(j, c, r) { return j.cristales.some(q => q.r === r && (c === q.c || c === q.c + 1)); },
        poder(j, x, y) {
          const c = Math.floor(x / T) - (x % T < 8 ? 1 : 0), r = Math.floor(y / T);
          if (!Number.isFinite(c) || !Number.isFinite(r)) return false;   // la demo del primer cuadro aún no tiene posición válida
          if ([c, c + 1].some(cc => !'.ob'.includes(j.at(cc, r)))) return false;
          const p = j.p; if (Math.abs((c + 1) * T - p.x) < 16 + 5 && r * T < p.y && (r + 1) * T > p.y - 20) return false;
          if (j.cristales.length >= 2) j.cristales.shift();
          j.cristales.push({ c, r, t: 6 }); chispas(j, (c + 1) * T, r * T + 8, ['#ffd1ea', '#ffffff'], 10, 40);
        },
        paso(j, dt) { for (const q of j.cristales) q.t -= dt; j.cristales = j.cristales.filter(q => q.t > 0); },
        demo(j) { if (j.t % 2 < 1 / 60) j.def.poder(j, j.p.x + 20, j.p.y + 40); },
        tinte(ctx, j, Hv) { const k = clamp(j.cam.y / (j.H * T), 0, 1), a = sube ? .22 * (1 - k) : .08 + k * .4; ctx.fillStyle = sube ? `rgba(255,248,230,${a * .5})` : `rgba(8,10,24,${a})`; ctx.fillRect(0, 0, VW, Hv); },
        pinta(ctx, j, f, capa) {
          if (m === 'deco' && window.TRAMOYA_VERTICAL) {
            if (capa === 'atras') TRAMOYA_VERTICAL.fondo(ctx, j);
            else if (capa === 'medio') TRAMOYA_VERTICAL.pasarelas(ctx, j);
          }
          if (capa !== 'medio') return;
          // el círculo punteado donde hace falta una burbuja (se apaga mientras hay una puesta ahí)
          const x0 = Math.floor(j.cam.x / T) - 1, x1 = Math.ceil((j.cam.x + VW) / T) + 1, y0 = Math.floor(j.cam.y / T) - 1, y1 = Math.ceil((j.cam.y + VH * 1.6) / T) + 1;
          for (let r = y0; r <= y1; r++) for (let c = x0; c <= x1; c++) if (j.at(c, r) === 'b' && j.at(c - 1, r) !== 'b') {
            if (j.cristales.some(q => q.r === r && Math.abs(q.c - c) <= 1)) continue;
            const a = .35 + .3 * Math.sin(j.t * 4 + c); ctx.save(); ctx.strokeStyle = `rgba(255,209,234,${a})`; ctx.lineWidth = .8; ctx.setLineDash([2.5, 2.5]); ctx.beginPath(); ctx.ellipse((c + 1) * T, r * T + 6, 16, 6.4, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
          }
          for (const q of j.cristales) cristal(ctx, j, q);
        },
        ayudas: [{ id: 'bub', cuando: j => { const p = j.p, c0 = Math.floor(p.x / T); for (let r = Math.floor(p.y / T) - 9; r <= Math.floor(p.y / T) + 9; r++) for (let c = c0 - 9; c <= c0 + 9; c++) if (j.at(c, r) === 'b') return true; return false; }, txt: 'Un hueco enorme: Fresita, clic sobre el círculo punteado pone una burbuja donde Itzel se apoya.' },
          { id: 'v', cuando: j => j.t > 1, txt: sube ? 'Hacia arriba: ↑ en las escaleras; en la pared, brinca para saltar de pared. Clic: burbuja de apoyo.' : 'Hacia abajo: ↓ en las escaleras. Una caída larga lastima: clic pone una burbuja de apoyo.' }],
      });
    }
  }
})();
