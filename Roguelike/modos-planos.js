'use strict';
// =====================================================================
//  PLANTA Y ALZADO · La lámina de la muralla (mundo cuaderno)
//  El nivel tiene tres dimensiones: largo (x), alto (y) y fondo (z), y
//  se ve como en geometría descriptiva, un plano a la vez:
//    alzado (π2, el plano vertical, amarillo): de lado, con gravedad y salto;
//    planta (π1, el plano horizontal, rojo): desde arriba; Itzel camina a lo
//    largo y a lo hondo, pero no puede saltar.
//  Con clic, Fresita gira la lámina 90° sobre la línea de tierra.
//  En alzado solo estorba lo que está en el carril de Itzel (el corte): lo
//  de atrás se ve tenue y lo de enfrente punteado. En planta estorba lo que
//  está a la altura de su cuerpo; lo de arriba va punteado y los pisos
//  llevan su cota. Los muros altos se rodean en planta y los fosos se
//  saltan en alzado.
// =====================================================================
MODOS.planos = (() => {
  const C = 16, BASE = 212, D = 7, HM = 9, GIRO = .45;
  const GRAV = 46, SALTO = 15.6, VEL = 6.4, VELP = 5, AN = .28, ALTO = 1.3, VBALA = 3.4;
  const SUELO = 1, MURO = 2, MADERA = 3;
  const TINTA = '#34323a';
  const ALZ = { papel: '#fffbea', reticula: '#c9a43a', borde: '#d8a51c', muro: '#f8e48e', junta: '#b98d22', suelo: '#efd7a0', madera: '#e5bf86', veta: '#9b6a3a' };
  const PLA = { papel: '#fff4f0', reticula: '#d0604e', borde: '#e2513a', poche: '#e46a55', achure: '#a8382a', piso: ['#fbe3db', '#f4cbc0', '#eab4a7'], foso: '#4c3f4a', madera: '#efcf9f' };
  const suena = n => { if (typeof SONIDO !== 'undefined' && SONIDO.fx) SONIDO.fx(n); };

  // ---------------- la muralla, de la Puerta de Mar a la Puerta de Tierra ----------------
  function armar() {
    const W = 126, V = new Uint8Array(W * HM * D);
    const caja = (x0, x1, y0, y1, z0, z1, m) => { for (let x = x0; x < x1; x++) for (let y = y0; y < y1; y++) for (let z = z0; z < z1; z++) V[(x * HM + y) * D + z] = m; };
    const hueco = (x0, x1, z0 = 0, z1 = D) => caja(x0, x1, 0, 1, z0, z1, 0);
    caja(0, W, 0, 1, 0, D, SUELO);
    caja(0, 1, 1, 8, 0, D, MURO);                                   // Puerta de Mar, a la espalda
    // I. de la Puerta de Mar al foso: un muro bajo, uno alto con paso al fondo y el foso
    caja(6, 8, 1, 2, 0, D, MURO);
    caja(11, 13, 1, 6, 0, 5, MURO);
    hueco(16, 19);
    // II. el baluarte de San Carlos: escalera en un solo carril y el adarve que zigzaguea sobre el foso
    caja(23, 24, 1, 2, 1, 2, MURO); caja(24, 26, 1, 3, 1, 2, MURO);
    caja(26, 34, 1, 4, 0, D, MURO);
    hueco(34, 54);
    caja(34, 39, 0, 4, 1, 2, MURO); caja(38, 39, 0, 4, 1, 6, MURO);
    caja(39, 40, 0, 4, 5, 6, MURO); caja(42, 44, 0, 4, 5, 6, MURO); caja(43, 44, 0, 4, 2, 6, MURO);
    caja(44, 49, 0, 4, 2, 3, MURO); caja(48, 49, 0, 4, 2, 7, MURO); caja(49, 54, 0, 4, 6, 7, MURO);
    caja(54, 58, 1, 4, 0, D, MURO); caja(58, 59, 1, 3, 0, D, MURO); caja(59, 60, 1, 2, 0, D, MURO);
    // III. la batería: cañones que ruedan balas hacia el frente y muros que obligan a zigzaguear
    caja(65, 66, 1, 5, 0, 4, MURO); caja(70, 71, 1, 5, 3, 7, MURO); caja(75, 76, 1, 5, 0, 4, MURO);
    hueco(82, 84, 0, 4);
    // IV. el puente de vigas sobre el foso grande y la Puerta de Tierra
    hueco(90, 101);
    caja(92, 95, 2, 3, 2, 3, MADERA); caja(94, 95, 2, 3, 2, 6, MADERA); caja(95, 97, 2, 3, 5, 6, MADERA); caja(99, 100, 2, 3, 5, 6, MADERA);
    caja(112, 115, 1, 8, 0, D, MURO); caja(112, 115, 1, 4, 2, 5, 0);
    const m = (x, y, z) => ({ x, y, z, got: false });
    return {
      W, V, meta: 120, puerta: { x: 112, x1: 115, z0: 2, z1: 5, alto: 4 },
      inicio: { x: 2.5, y: 1, z: 3.5 },
      monedas: [m(7, 3, 3.5), m(12.5, 1.6, 6.5), m(14.5, 1.6, 5.5), m(17.5, 3.4, 5.5), m(24.5, 3.6, 1.5), m(28.5, 4.6, 3.5), m(31.5, 4.6, 5.5),
        m(36.5, 4.6, 1.5), m(38.5, 4.6, 3.5), m(41, 5.8, 5.5), m(46.5, 4.6, 2.5), m(48.5, 4.6, 4.5), m(51.5, 4.6, 6.5),
        m(64.5, 1.6, 5.5), m(69.5, 1.6, 1.5), m(74.5, 1.6, 5.5), m(83, 3.2, 2.5), m(93.5, 3.6, 2.5), m(94.5, 3.6, 4), m(98, 4.6, 5.5), m(106, 1.6, 1.5), m(113.5, 1.6, 3.5)],
      embestidores: [[79.5, 2.5], [86.5, 2.5], [103.5, 3.5], [105.5, 5.5]].map(([x, z], i) => ({ x, z, y: 1, dir: -1, t: i * .7, duerme: 0, fase: 'espera', tiempo: .5 + i * .2, vx: 0, vz: 0, caida: 0 })),
      canones: [[63, 0], [68, .9], [73, 1.8]].map(([x, fase]) => ({ x, fase, per: 2.8 })),
      notas: [{ x: 1.6, ya: 8.4, txt: 'Puerta de Mar' }, { x: 17.5, ya: 2.6, txt: 'Foso' }, { x: 29.5, ya: 5.4, txt: 'Baluarte de San Carlos' }, { x: 44, ya: 5.4, txt: 'Adarve' },
        { x: 68, ya: 6, txt: 'La batería' }, { x: 95, ya: 4.6, txt: 'Puente de vigas' }, { x: 113.5, ya: 9, txt: 'Puerta de Tierra' }],
      ayudas: [
        { id: 'muro', x0: 8.6, x1: 11, plano: 'alzado', txt: 'Ese muro es muy alto para saltarlo. Fresita: un clic y la lámina gira a planta.' },
        { id: 'foso', x0: 13.2, x1: 16, plano: 'planta', txt: 'En planta no se salta. Otro clic, y el foso se brinca en alzado.' },
        { id: 'escalera', x0: 20, x1: 26, plano: 'alzado', alto: 1.5, txt: 'La escalera del baluarte está en otro carril: búscala en planta.' },
        { id: 'adarve', x0: 31, x1: 34, bajo: 3.5, txt: 'El adarve da vueltas. En alzado solo pisas tu carril; las vueltas se siguen en planta.' },
        { id: 'bateria', x0: 59.5, x1: 63, txt: 'Las balas ruedan hacia el frente: en planta se ven venir, en alzado se brincan cuando llegan a tu carril.' },
        { id: 'vigas', x0: 86, x1: 90, txt: 'Súbete a la viga en alzado y síguela en planta.' },
      ],
    };
  }
  const celda = (n, x, y, z) => x < 0 || x >= n.W || y < 0 || y >= HM || z < 0 || z >= D ? 0 : n.V[(x * HM + y) * D + z];
  const duro = (n, x, y, z) => x < 0 || x >= n.W || z < 0 || z >= D ? 1 : celda(n, x, y, z);
  function choca(n, x, y, z) {
    const ax = Math.floor(x - AN), bx = Math.floor(x + AN - 1e-6), ay = Math.floor(y), by = Math.floor(y + ALTO - 1e-6), az = Math.floor(z - AN), bz = Math.floor(z + AN - 1e-6);
    for (let i = ax; i <= bx; i++) for (let k = ay; k <= by; k++) for (let m = az; m <= bz; m++) if (duro(n, i, k, m)) return true;
    return false;
  }
  // el piso más alto debajo de los pies (en cualquier parte de la huella de Itzel)
  function apoyo(n, x, z, y) {
    let h = -99; const k0 = Math.min(HM - 1, Math.floor(y - .01));
    for (let i = Math.floor(x - AN); i <= Math.floor(x + AN - 1e-6); i++) for (let m = Math.floor(z - AN); m <= Math.floor(z + AN - 1e-6); m++)
      for (let k = k0; k >= 0; k--) if (celda(n, i, k, m)) { h = Math.max(h, k + 1); break; }
    return h;
  }
  // mueve sobre un eje y se detiene contra lo sólido; en planta tampoco se baja de una orilla de más de un piso
  function mover(j, eje, d, orilla) {
    const p = j.p, n = j.n; if (!d) return false;
    const antes = p[eje]; p[eje] += d;
    if (choca(n, p.x, p.y, p.z)) {
      if (eje === 'y') p.y = d < 0 ? Math.floor(p.y) + 1 : Math.floor(p.y + ALTO) - ALTO - 1e-4;
      else p[eje] = d > 0 ? Math.floor(p[eje] + AN) - AN - 1e-4 : Math.floor(p[eje] - AN) + 1 + AN + 1e-4;
      return true;
    }
    if (orilla && p.on && apoyo(n, p.x, p.z, p.y) < p.y - 1.05) { p[eje] = antes; return true; }
    return false;
  }
  const carril = j => clamp(Math.floor(j.p.z), 0, D - 1);
  // al volver a alzado Itzel se acomoda en el centro de un carril (el que la sostenga)
  function alCarril(j) {
    const p = j.p, n = j.n, z0 = p.z, ops = [...new Set([Math.floor(z0 - AN), Math.floor(z0), Math.floor(z0 + AN - 1e-6)])].filter(k => k >= 0 && k < D);
    const libres = ops.map(k => k + .5).filter(z => !choca(n, p.x, p.y, z));
    if (!libres.length) return;
    libres.sort((a, b) => (apoyo(n, p.x, b, p.y + .01) - apoyo(n, p.x, a, p.y + .01)) || Math.abs(a - z0) - Math.abs(b - z0));
    p.z = libres[0];
  }

  function crear(def, st) {
    const n = armar(), i = n.inicio;
    return { t: 0, tm: 0, win: 0, shake: 0, bubbles: [], parts: [], def, st, n, inv: 0, pose: poseItzel(),
      p: { x: i.x, y: i.y, z: i.z, vx: 0, vy: 0, vz: 0, on: true, face: 1, run: 0 }, safe: { x: i.x, y: i.y, z: i.z },
      plano: 'alzado', ang: 0, giro: null, cam: 0, coyote: 0, buf: 0, saltaAntes: false, fre: { x: 120, y: 90 },
      vistas: {}, aviso: null, giros: 0, demo: typeof STATE !== 'undefined' && STATE === 'libro' };
  }
  function girar(j) {
    if (j.giro || j.win) return;
    const a = j.plano === 'alzado' ? Math.PI / 2 : 0;
    j.giro = { de: j.ang, a, t: 0 }; j.giros++; suena('poder');
    chispas(j, j.fre.x, j.fre.y, [ALZ.borde, PLA.borde, '#ffffff'], 14, 50);
    if (typeof ENCI !== 'undefined' && ENCI.ver) ENCI.ver('poder:planos');
  }
  const avisa = (j, txt) => { j.aviso = { txt, t: 0 }; };

  function paso(j, dt) {
    j.t += dt; j.inv = Math.max(0, j.inv - dt); j.shake = Math.max(0, j.shake - dt);
    const p = j.p, n = j.n, k = j.demo ? {} : teclas();
    // Fresita vuela tras el cursor; clic gira la lámina, clic derecho canta
    const [ix, iy] = proy(j, p.x, p.y + ALTO, p.z);
    if (MOUSE.active && !j.demo) { j.fre.x += (MOUSE.x - j.fre.x) * Math.min(1, dt * 9); j.fre.y += (MOUSE.y - (j.dy || 0) - j.fre.y) * Math.min(1, dt * 9); }
    else { j.fre.x += (ix - p.face * 18 - j.fre.x) * dt * 4; j.fre.y += (iy - 14 + Math.sin(j.t * 2.2) * 2 - j.fre.y) * dt * 4; }
    for (const c of MOUSE.clicks) {
      if (c.up) continue;
      if (c.b === 2) {
        for (const q of n.embestidores) { const [qx, qy] = proy(j, q.x, q.y, q.z); if (Math.hypot(qx - j.fre.x, qy - j.fre.y) < 50) q.duerme = 5; }
        chispas(j, j.fre.x, j.fre.y, ['#b9a7ff', '#ffffff'], 14, 50); suena('arrullo'); continue;
      }
      girar(j);
    }
    MOUSE.clicks.length = 0;
    if (j.demo && j.t % 2.6 < dt) girar(j);
    if (j.aviso) { if (!(typeof cartelVisible === 'function' && cartelVisible())) j.aviso.t += dt; if (j.aviso.t > 5) j.aviso = null; }
    // mientras gira la lámina, el mundo se queda quieto
    if (j.giro) {
      const g = j.giro; g.t += dt; const u = Math.min(1, g.t / GIRO), e = u * u * (3 - 2 * u);
      j.ang = g.de + (g.a - g.de) * e;
      if (u >= 1) { j.ang = g.a; j.plano = g.a > .1 ? 'planta' : 'alzado'; j.giro = null; if (j.plano === 'alzado') alCarril(j); }
      pasoChispas(j, dt); camara(j, dt); return;
    }
    j.tm += dt;
    const alz = j.plano === 'alzado', dx = (k.right ? 1 : 0) - (k.left ? 1 : 0);
    if (alz) {
      p.vx += (dx * VEL - p.vx) * Math.min(1, dt * 14); p.vz = 0;
      if (!j.win) mover(j, 'x', p.vx * dt);
      const salta = !!(k.space || k.up), pres = salta && !j.saltaAntes; j.saltaAntes = salta;
      j.buf = pres ? .12 : Math.max(0, j.buf - dt); j.coyote = p.on ? .1 : Math.max(0, j.coyote - dt);
      if (j.buf > 0 && j.coyote > 0) { p.vy = SALTO; p.on = false; j.buf = 0; j.coyote = 0; suena('salto'); }
      if (!salta && p.vy > 0) p.vy -= GRAV * dt * 1.3;
    } else {
      const dz = (k.up ? 1 : 0) - (k.down ? 1 : 0), m = Math.hypot(dx, dz) || 1;
      p.vx += (dx / m * VELP - p.vx) * Math.min(1, dt * 14); p.vz += (dz / m * VELP - p.vz) * Math.min(1, dt * 14);
      if (!j.win) { mover(j, 'x', p.vx * dt, true); mover(j, 'z', p.vz * dt, true); }
      const salta = !!k.space; j.saltaAntes = salta || !!k.up;
    }
    if (dx) p.face = dx;
    if (Math.abs(p.vx) + Math.abs(p.vz) > .6) p.run += dt * 14;
    p.vy = Math.max(p.vy - GRAV * dt, -22);
    const cae = p.vy;
    if (mover(j, 'y', p.vy * dt)) { if (cae < 0) { if (!p.on && cae < -14) { chispas(j, ...proy(j, p.x, p.y, p.z), ['#8a7f70', '#ffffff'], 6, 30); suena('cae'); } p.on = true; } p.vy = 0; }
    else p.on = false;
    if (p.on && celda(n, Math.floor(p.x), Math.floor(p.y) - 1, Math.floor(p.z)) && !n.embestidores.some(q => !q.fuera && q.fase !== 'caida' && Math.abs(q.x - p.x) < 2 && Math.abs(q.z - p.z) < 1)) Object.assign(j.safe, { x: p.x, y: p.y, z: p.z });
    // se cayó al foso: pierde un corazón y vuelve a donde pisaba firme
    if (p.y < -1.4) { if (dañoModo(j)) suena('herida'); Object.assign(p, { x: j.safe.x, y: j.safe.y, z: j.safe.z, vx: 0, vy: 0, vz: 0 }); if (j.plano === 'alzado') alCarril(j); }
    // Jabalíes: avisan, fijan el rumbo y no frenan al llegar al borde.
    for (const q of n.embestidores) {
      if (q.fuera) continue;
      q.t += dt; q.duerme = Math.max(0, q.duerme - dt);
      if (q.fase === 'caida') {
        q.caida += dt; q.y -= (2 + q.caida * 12) * dt;
        if (q.caida > .8) { q.fuera = true; RUN.stomps++; chispas(j, ...proy(j, q.x, Math.max(q.y, -.5), q.z), ['#d7a671', '#ffffff', TINTA], 12, 55); }
        continue;
      }
      if (!q.duerme) {
        q.tiempo -= dt;
        const dist = Math.hypot(p.x - q.x, p.z - q.z);
        if (q.fase === 'espera' && q.tiempo <= 0 && dist < 6 && Math.abs(p.y - q.y) < 1.5) {
          q.fase = 'aviso'; q.tiempo = .8; q.dir = Math.sign(p.x - q.x) || q.dir;
        } else if (q.fase === 'aviso' && q.tiempo <= 0) {
          const dx = p.x - q.x, dz = p.z - q.z, largo = Math.hypot(dx, dz) || 1;
          q.vx = dx / largo * 9; q.vz = dz / largo * 9; q.dir = Math.sign(q.vx) || q.dir; q.fase = 'embiste'; q.tiempo = 1.5;
        } else if (q.fase === 'embiste') {
          const nx = q.x + q.vx * dt, nz = q.z + q.vz * dt;
          if (nx < .35 || nx >= n.W - .35 || nz < .35 || nz >= D - .35 || choca(n, nx, q.y, nz)) {
            q.fase = 'espera'; q.tiempo = 1.2;
          } else {
            q.x = nx; q.z = nz;
            if (!celda(n, Math.floor(q.x), Math.floor(q.y - .1), Math.floor(q.z))) { q.fase = 'caida'; q.caida = 0; }
            else if (q.tiempo <= 0) { q.fase = 'espera'; q.tiempo = 1.2; }
          }
        }
      }
      if (q.fase === 'caida') continue;
      const toca = Math.abs(p.x - q.x) < AN + .42 && Math.abs(p.z - q.z) < AN + .36 && p.y < q.y + .75 && p.y + ALTO > q.y;
      if (toca && !q.duerme && dañoModo(j)) { suena('herida'); p.vy = 7; if (alz) mover(j, 'x', (Math.sign(p.x - q.x) || -1) * .7); else mover(j, 'z', (Math.sign(p.z - q.z) || -1) * .7, true); }
    }
    // balas de la batería: ruedan del fondo hacia el frente
    for (const b of balas(j)) if (Math.abs(p.x - b.x) < AN + .34 && Math.abs(p.z - b.z) < AN + .34 && p.y < b.y + .72 && dañoModo(j)) { suena('herida'); p.vy = 8; p.on = false; chispas(j, ...proy(j, b.x, b.y + .4, b.z), [TINTA, '#ffffff'], 10, 60); }
    // canisteles
    // el canistel se recoge con lo que se ve: en alzado no importa el fondo y en planta no importa la altura
    for (const c of n.monedas) if (!c.got && Math.abs(p.x - c.x) < .55 && (alz ? c.y > p.y - .2 && c.y < p.y + ALTO + .35 : Math.abs(p.z - c.z) < .55)) { c.got = true; RUN.coins++; suena('canistel'); chispas(j, ...proy(j, c.x, c.y, c.z), ['#f2c94c', '#ffffff', ALZ.borde]); }
    // la Puerta de Tierra
    if (!j.win && p.x >= n.meta) { j.win = j.t; suena('meta'); chispas(j, ...proy(j, p.x, p.y + 2, p.z), [ALZ.borde, PLA.borde, '#f2c94c', '#ffffff'], 60, 140); }
    pasoChispas(j, dt); camara(j, dt);
  }
  function balas(j) {
    const o = [];
    for (const c of j.n.canones) { const u = (j.tm + c.fase) % c.per, z = D + .3 - u * VBALA; if (z > -1) o.push({ x: c.x + .5, y: 1, z, u, c }); }
    return o;
  }
  function camara(j, dt) {
    const meta = clamp(j.p.x * C - VW * .4, 0, j.n.W * C - VW);
    j.cam += (meta - j.cam) * Math.min(1, dt * 5);
  }
  // del espacio a la lámina: x a lo ancho; arriba, el alto (alzado) o el fondo (planta), según el giro
  const proy = (j, x, y, z) => [x * C - j.cam, BASE - (y * Math.cos(j.ang) + z * Math.sin(j.ang)) * C];

  // ---------------- dibujo: lápiz y aguadas sobre papel de dibujo ----------------
  // bordes de una región de la cuadrícula (u = largo, v = alto o fondo) en tramos largos
  function bordes(en, u0, u1, v0, v1) {
    const s = [];
    for (let v = v0; v <= v1 + 1; v++) { let ini = 0, lado = 0;
      for (let u = u0; u <= u1 + 1; u++) { const k = u > u1 ? 0 : (en(u, v - 1) ? 1 : 0) - (en(u, v) ? 1 : 0); if (k !== lado) { if (lado) s.push([ini, v, u, v]); ini = u; lado = k; } } }
    for (let u = u0; u <= u1 + 1; u++) { let ini = 0, lado = 0;
      for (let v = v0; v <= v1 + 1; v++) { const k = v > v1 ? 0 : (en(u - 1, v) ? 1 : 0) - (en(u, v) ? 1 : 0); if (k !== lado) { if (lado) s.push([u, ini, u, v]); ini = v; lado = k; } } }
    return s;
  }
  // trazo de lápiz: tiembla poquito y cambia cinco veces por segundo, como en el cuaderno; las esquinas se pasan de largo
  function lapiz(ctx, j, segs, col, lw, punteado) {
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (punteado) ctx.setLineDash(punteado);
    const hv = Math.floor(j.t * 5) % 3, sale = punteado ? 0 : 1.2;
    ctx.beginPath();
    for (const [u0, v0, u1, v1] of segs) {
      const hz = v0 === v1, X0 = u0 * C - j.cam - (hz ? sale : 0), X1 = u1 * C - j.cam + (hz ? sale : 0), Y0 = BASE - v0 * C + (hz ? 0 : sale), Y1 = BASE - v1 * C - (hz ? 0 : sale);
      const nn = Math.max(1, Math.round((Math.abs(X1 - X0) + Math.abs(Y1 - Y0)) / 9));
      for (let i = 0; i <= nn; i++) { const t = i / nn, w = punteado ? 0 : (hash2(u0 * 7 + v0 * 13 + i, hv, 5) - .5) * .8; const X = X0 + (X1 - X0) * t + (hz ? 0 : w), Y = Y0 + (Y1 - Y0) * t + (hz ? w : 0); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
    }
    ctx.stroke(); ctx.setLineDash([]);
  }
  function celdas(ctx, j, en, u0, u1, v0, v1) { ctx.beginPath(); for (let u = u0; u <= u1; u++) for (let v = v0; v <= v1; v++) if (en(u, v)) ctx.rect(u * C - j.cam - .2, BASE - (v + 1) * C - .2, C + .4, C + .4); }
  function achurado(ctx, j, sp, col, lw, ang = 1) {
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
    const off = -((j.cam % sp) + sp) % sp;
    for (let x = off - VH; x < VW + VH; x += sp) { ctx.moveTo(x, BASE + 30); ctx.lineTo(x + ang * (BASE + 30), 0); }
    ctx.stroke();
  }
  function papel(ctx, j, a) {
    const dy = j.dy || 0; ctx.fillStyle = mix(ALZ.papel, PLA.papel, a); ctx.fillRect(0, -dy, VW, VH + dy);
    // retícula alineada con las celdas del nivel: ayuda a medir saltos y carriles
    const ret = mix(ALZ.reticula, PLA.reticula, a), off = -(j.cam % C);
    for (const [paso, al] of [[C / 2, .07], [C, .14]]) {
      ctx.strokeStyle = rgba(ret, al); ctx.lineWidth = .4; ctx.beginPath();
      for (let x = off; x < VW; x += paso) { ctx.moveTo(x, 4.5 - dy); ctx.lineTo(x, VH); }
      for (let y = BASE; y > 4.5 - dy; y -= paso) { ctx.moveTo(0, y); ctx.lineTo(VW, y); }
      ctx.stroke();
    }
    if (a < 1) { ctx.globalAlpha = 1 - a; ciudadAlzado(ctx, j); ctx.globalAlpha = 1; }
    if (a > 0) { ctx.globalAlpha = a; ciudadPlanta(ctx, j); ctx.globalAlpha = 1; }
    // la orilla de arriba queda lisa: el juego la estira para llenar ventanas altas y cualquier línea ahí se volvería rayas
    ctx.fillStyle = mix(ALZ.papel, PLA.papel, a); ctx.fillRect(0, -dy, VW, 4.5);
    ctx.strokeStyle = rgba(TINTA, .75); ctx.lineWidth = .9; ctx.strokeRect(4.5, 4.5 - dy, VW - 9, VH - 9 + dy); ctx.lineWidth = .4; ctx.strokeRect(7, 7 - dy, VW - 14, VH - 14 + dy);
  }
  // detrás de la muralla, lejos: el centro de Campeche en alzado (catedral, casas y baluartes a lápiz, con aguadas de color)
  function ciudadAlzado(ctx, j) {
    const cam = j.cam * .4, piso = BASE - C, sc = 1.7, seed = 11;
    ctx.save(); ctx.beginPath(); CAMP.skyline(ctx, -4, VW + 4, piso, 'mid', seed, sc, 1.5, cam); ctx.clip();
    ctx.fillStyle = 'rgba(140,120,90,.07)'; ctx.fillRect(0, -(j.dy || 0), VW, piso + (j.dy || 0));
    for (const fa of CAMP.facades(cam - 10, cam + VW + 10, seed)) { const x = fa.x0 - cam, top = piso - (4 + fa.h) * sc; ctx.fillStyle = rgba(CAMP.FACHADAS[fa.col], .22); ctx.fillRect(x, top, fa.w, piso - top);
      ctx.strokeStyle = 'rgba(70,64,60,.22)'; ctx.lineWidth = .45; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, piso); const nv = Math.max(1, Math.floor(fa.w / 8)); for (let i = 0; i < nv; i++) { const wx = x + (fa.w - nv * 8) / 2 + i * 8 + 2.5; ctx.rect(wx, top + 7, 3, 6); if (fa.h > 22) ctx.rect(wx, top + 20, 3, 6); } ctx.stroke(); }
    ctx.restore();
    ctx.beginPath(); CAMP.skyline(ctx, -4, VW + 4, piso, 'mid', seed, sc, 1.5, cam); ctx.strokeStyle = 'rgba(70,64,60,.35)'; ctx.lineWidth = .55; ctx.stroke();
  }
  // en planta: las manzanas de la ciudad, del otro lado del fondo, y el mar enfrente
  function ciudadPlanta(ctx, j) {
    const y0 = BASE - (D + .7) * C, cam = j.cam, k0 = Math.floor((cam - 80) / 64), k1 = Math.ceil((cam + VW) / 64);
    ctx.lineWidth = .45;
    for (let k = k0; k <= k1; k++) {
      const x = k * 64 - cam + 8, w = 46 + hash2(k, 1, 9) * 6, base = y0 - 4;
      for (let f = 0; base - f * 44 > -(j.dy || 0); f++) {
        const y = base - f * 44, h = 34;
        // el parque principal con su kiosco y, junto, la catedral de dos torres vista desde arriba
        if (f === 0 && k === 4) { ctx.strokeStyle = 'rgba(70,64,60,.32)'; ctx.strokeRect(x, y - h, w, h); ctx.beginPath(); ctx.arc(x + w / 2, y - h / 2, 5, 0, TAU); ctx.moveTo(x, y - h); ctx.lineTo(x + w, y); ctx.moveTo(x + w, y - h); ctx.lineTo(x, y); ctx.stroke();
          ctx.fillStyle = 'rgba(110,160,90,.3)'; for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.arc(x + 4 + (i % 5) * (w - 8) / 4, y - 4 - Math.floor(i / 5) * (h - 8), 2.6, 0, TAU); ctx.fill(); } continue; }
        if (f === 0 && k === 5) { ctx.fillStyle = 'rgba(232,215,175,.5)'; ctx.strokeStyle = 'rgba(70,64,60,.4)'; ctx.beginPath(); ctx.rect(x + 14, y - h + 2, 18, h - 6); ctx.rect(x + 6, y - h + 12, 34, 8); ctx.fill(); ctx.stroke(); for (const tx of [x + 10, x + 32]) { ctx.beginPath(); ctx.rect(tx, y - 9, 6, 6); ctx.fill(); ctx.stroke(); } ctx.beginPath(); ctx.arc(x + 23, y - h + 16, 4, 0, TAU); ctx.stroke(); continue; }
        ctx.fillStyle = 'rgba(232,170,155,.1)'; ctx.fillRect(x, y - h, w, h); ctx.strokeStyle = 'rgba(70,64,60,.22)'; ctx.strokeRect(x, y - h, w, h);
        // las casas dan a la calle y guardan su patio adentro
        let cx = x; while (cx < x + w - 4) { const cw = 8 + hash2(k * 9 + cx, f, 2) * 8, ww = Math.min(cw, x + w - cx); ctx.fillStyle = rgba(CAMP.FACHADAS[(hash2(k, cx | 0, 8) * 8) | 0], .32); ctx.fillRect(cx, y - 3, ww, 3); ctx.fillRect(cx, y - h, ww, 2.4); ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx, y - 9); ctx.moveTo(cx, y - h); ctx.lineTo(cx, y - h + 8); ctx.stroke(); cx += cw; }
        ctx.fillStyle = 'rgba(150,190,120,.16)'; ctx.fillRect(x + 10 + hash2(k, f, 4) * 6, y - h + 11, w - 26, h - 22);
      }
    }
    ctx.strokeStyle = 'rgba(70,140,160,.28)'; ctx.lineWidth = .5; ctx.beginPath();
    for (let y = BASE + 5; y < VH - 6; y += 5) for (let x = -((cam * .5) % 20) - 20; x < VW; x += 20) { ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 5, y - 1.6, x + 10, y); }
    ctx.stroke();
  }
  // la línea de corte (raya y punto, con flechas): dice qué carril o qué altura se ve al girar
  function lineaCorte(ctx, y, letra, dir) {
    ctx.strokeStyle = rgba(TINTA, .42); ctx.lineWidth = .55; ctx.setLineDash([7, 2, 1.2, 2]); ctx.beginPath(); ctx.moveTo(14, y); ctx.lineTo(VW - 14, y); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = rgba(TINTA, .75); ctx.fillStyle = rgba(TINTA, .75); ctx.font = 'italic 6px Alegreya, serif'; ctx.lineWidth = .7;
    for (const [x, l] of [[14, letra], [VW - 14, letra + "'"]]) { const p = y - 6 * dir; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, p); ctx.moveTo(x - 2, p + 2.4 * dir); ctx.lineTo(x, p); ctx.lineTo(x + 2, p + 2.4 * dir); ctx.stroke(); ctx.fillText(l, x + 3, y - 2 * dir + (dir < 0 ? 2 : 0)); }
  }

  // ALZADO: el corte por el carril de Itzel
  function pintaAlzado(ctx, j, u0, u1) {
    const n = j.n, zi = carril(j);
    const corte = (x, y) => !!celda(n, x, y, zi);
    const atras = (x, y) => { for (let z = zi + 1; z < D; z++) if (celda(n, x, y, z)) return true; return false; };
    const frente = (x, y) => { for (let z = 0; z < zi; z++) if (celda(n, x, y, z)) return true; return false; };
    // bajo la línea de tierra: el terreno cortado y la boca del foso
    for (let x = u0; x <= u1; x++) {
      const X = x * C - j.cam;
      if (celda(n, x, 0, zi)) { ctx.fillStyle = 'rgba(176,140,90,.22)'; ctx.fillRect(X - .2, BASE, C + .4, VH - BASE); }
      else { const g = ctx.createLinearGradient(0, BASE - C, 0, VH); g.addColorStop(0, 'rgba(60,50,62,.15)'); g.addColorStop(1, 'rgba(60,50,62,.75)'); ctx.fillStyle = g; ctx.fillRect(X - .2, BASE - C, C + .4, VH - BASE + C); }
    }
    ctx.save(); ctx.beginPath(); for (let x = u0; x <= u1; x++) if (celda(n, x, 0, zi)) ctx.rect(x * C - j.cam - .2, BASE, C + .4, VH - BASE); ctx.clip(); achurado(ctx, j, 3.2, 'rgba(120,90,50,.35)', .4); ctx.restore();
    // lo de atrás: aguada tenue con su contorno
    ctx.fillStyle = 'rgba(150,120,60,.12)'; celdas(ctx, j, (x, y) => atras(x, y) && !corte(x, y), u0, u1, 0, HM - 1); ctx.fill();
    lapiz(ctx, j, bordes(atras, u0, u1, 0, HM - 1), 'rgba(90,80,70,.4)', .45);
    // el corte: aguada por material y su textura
    for (const [mat, col] of [[SUELO, ALZ.suelo], [MURO, ALZ.muro], [MADERA, ALZ.madera]]) { ctx.fillStyle = col; celdas(ctx, j, (x, y) => celda(n, x, y, zi) === mat, u0, u1, 0, HM - 1); ctx.fill(); }
    ctx.save(); celdas(ctx, j, (x, y) => celda(n, x, y, zi) === SUELO, u0, u1, 0, HM - 1); ctx.clip(); achurado(ctx, j, 3, 'rgba(150,110,60,.3)', .4); ctx.restore();
    ctx.strokeStyle = rgba(ALZ.junta, .55); ctx.lineWidth = .45; ctx.beginPath();
    for (let x = u0; x <= u1; x++) for (let y = 0; y < HM; y++) {
      const m = celda(n, x, y, zi), X = x * C - j.cam, Y = BASE - (y + 1) * C; if (!m) continue;
      if (m === MURO) { ctx.moveTo(X, Y + 8); ctx.lineTo(X + C, Y + 8); const a = (x + y) % 2 ? 5 : 11; ctx.moveTo(X + a, Y); ctx.lineTo(X + a, Y + 8); ctx.moveTo(X + (a + 8) % C, Y + 8); ctx.lineTo(X + (a + 8) % C, Y + C); }
      if (m === MADERA) { ctx.moveTo(X, Y + 5); ctx.lineTo(X + C, Y + 5.6); ctx.moveTo(X, Y + 10); ctx.lineTo(X + C, Y + 10.4); }
    }
    ctx.stroke();
    // almenas en lo alto de los muros que no se alcanzan
    ctx.fillStyle = ALZ.muro;
    for (let x = u0; x <= u1; x++) for (let y = 5; y < HM; y++) if (celda(n, x, y, zi) === MURO && !celda(n, x, y + 1, zi)) { const X = x * C - j.cam, Y = BASE - (y + 1) * C; for (const a of [2, 10]) { ctx.fillRect(X + a, Y - 4, 4, 4.4); ctx.strokeStyle = TINTA; ctx.lineWidth = .5; ctx.strokeRect(X + a, Y - 4, 4, 4); } }
    lapiz(ctx, j, bordes(corte, u0, u1, 0, HM - 1), TINTA, .95);
    // el arco de las puertas, si el corte pasa por ellas
    const pu = n.puerta; if (zi >= pu.z0 && zi < pu.z1) arco(ctx, j, pu.x, pu.x1, pu.alto);
    // lo de enfrente: líneas ocultas
    lapiz(ctx, j, bordes(frente, u0, u1, 0, HM - 1), rgba(TINTA, .55), .55, [2.5, 2]);
  }
  function arco(ctx, j, x0, x1, alto) {
    const X0 = x0 * C - j.cam, X1 = x1 * C - j.cam, Y = BASE - alto * C, r = (X1 - X0) / 2;
    ctx.fillStyle = ALZ.muro; ctx.beginPath(); ctx.moveTo(X0, Y); ctx.lineTo(X0, Y + 12); ctx.ellipse(X0 + r, Y + 12, r, 12, 0, Math.PI, 0); ctx.lineTo(X1, Y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = TINTA; ctx.lineWidth = .8; ctx.beginPath(); ctx.ellipse(X0 + r, Y + 12, r, 12, 0, Math.PI, 0); ctx.stroke();
    ctx.lineWidth = .45; ctx.beginPath(); ctx.ellipse(X0 + r, Y + 12, r + 3, 15, 0, Math.PI, 0); ctx.stroke();
    for (let k = 0; k <= 8; k++) { const a = Math.PI + k / 8 * Math.PI; ctx.beginPath(); ctx.moveTo(X0 + r + Math.cos(a) * r, Y + 12 + Math.sin(a) * 12); ctx.lineTo(X0 + r + Math.cos(a) * (r + 3), Y + 12 + Math.sin(a) * 15); ctx.stroke(); }
  }

  // PLANTA: corte horizontal a la altura del cuerpo de Itzel
  function pintaPlanta(ctx, j, u0, u1) {
    const n = j.n, p = j.p, k0 = Math.floor(p.y + .02), k1 = Math.floor(p.y + ALTO - .02);
    const muro = (x, z) => { for (let k = k0; k <= k1; k++) if (celda(n, x, k, z)) return true; return false; };
    const arriba = (x, z) => { for (let k = k1 + 1; k < HM; k++) if (celda(n, x, k, z)) return true; return false; };
    const piso = (x, z) => { if (z < 0 || z >= D) return -2; for (let k = Math.min(k0 - 1, HM - 1); k >= 0; k--) if (celda(n, x, k, z)) return k + 1; return -1; };
    const tope = (x, z) => { for (let k = Math.min(k0 - 1, HM - 1); k >= 0; k--) { const m = celda(n, x, k, z); if (m) return m; } return 0; };
    // pisos: más bajos, más oscuros; el foso, achurado en cruz
    for (let x = u0; x <= u1; x++) for (let z = 0; z < D; z++) {
      if (muro(x, z)) continue; const h = piso(x, z), X = x * C - j.cam, Y = BASE - (z + 1) * C;
      ctx.fillStyle = h < 0 ? PLA.foso : tope(x, z) === MADERA ? PLA.madera : PLA.piso[clamp(k0 - h, 0, 2)]; ctx.fillRect(X - .2, Y - .2, C + .4, C + .4);
      if (h >= 0 && tope(x, z) === MADERA) { ctx.strokeStyle = 'rgba(155,106,58,.6)'; ctx.lineWidth = .45; ctx.beginPath(); for (const a of [5, 10]) { ctx.moveTo(X, Y + a); ctx.lineTo(X + C, Y + a + .4); } ctx.stroke(); }
      else if (h >= 0 && tope(x, z) === MURO && k0 - h === 0) { ctx.strokeStyle = 'rgba(200,110,90,.35)'; ctx.lineWidth = .4; ctx.strokeRect(X + 1, Y + 1, C - 2, C - 2); }
    }
    ctx.save(); celdas(ctx, j, (x, z) => z >= 0 && z < D && !muro(x, z) && piso(x, z) < 0, u0, u1, 0, D - 1); ctx.clip(); achurado(ctx, j, 3, 'rgba(255,240,235,.18)', .4); achurado(ctx, j, 3, 'rgba(255,240,235,.12)', .4, -1); ctx.restore();
    // curvas de nivel entre pisos de distinta altura
    // (un escalón, línea fina; una caída que no se baja caminando, línea de tinta)
    const segs = [], caidas = [], salto = (a, b) => (Math.abs(a - b) > 1 || a < 0 || b < 0 ? caidas : segs);
    for (let x = u0; x <= u1 + 1; x++) for (let z = 0; z < D; z++) { const a = piso(x, z), b = piso(x - 1, z); if (!muro(x, z) && !muro(x - 1, z) && a !== b) salto(a, b).push([x, z, x, z + 1]); }
    for (let x = u0; x <= u1; x++) for (let z = 1; z < D; z++) { const a = piso(x, z), b = piso(x, z - 1); if (!muro(x, z) && !muro(x, z - 1) && a !== b) salto(a, b).push([x, z, x + 1, z]); }
    lapiz(ctx, j, segs, rgba(PLA.achure, .7), .55); lapiz(ctx, j, caidas, rgba(TINTA, .85), .8);
    // el terreplén lleva pasto y piedritas; todo pegado a su celda para que no baile
    ctx.strokeStyle = 'rgba(90,130,70,.32)'; ctx.lineWidth = .4; ctx.beginPath();
    for (let x = u0; x <= u1; x++) for (let z = 0; z < D; z++) {
      if (muro(x, z) || tope(x, z) !== SUELO || piso(x, z) < 0) continue;
      for (let s = 0; s < 2; s++) { const r = hash2(x * 3 + s, z, 21); if (r > .55) continue; const X = x * C - j.cam + 2 + hash2(x, z * 5 + s, 22) * 12, Y = BASE - z * C - 2 - hash2(x * 7, z + s, 23) * 12; ctx.moveTo(X - 1.2, Y); ctx.lineTo(X - .4, Y - 2); ctx.moveTo(X, Y); ctx.lineTo(X + .3, Y - 2.6); ctx.moveTo(X + 1.2, Y); ctx.lineTo(X + 1.6, Y - 1.8); }
    }
    ctx.stroke();
    // cotas: una por cada piso que se ve
    const visto = new Set();
    for (let x = u0; x <= u1; x++) for (let z = 0; z < D; z++) {
      const h = piso(x, z); if (h < 0 || muro(x, z) || visto.has(x + ',' + z)) continue;
      const reg = [], cola = [[x, z]]; visto.add(x + ',' + z);
      while (cola.length) { const [a, b] = cola.pop(); reg.push([a, b]); for (const [da, db] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const na = a + da, nb = b + db, kk = na + ',' + nb; if (na < u0 || na > u1 || nb < 0 || nb >= D || visto.has(kk) || muro(na, nb) || piso(na, nb) !== h) continue; visto.add(kk); cola.push([na, nb]); } }
      if (reg.length < 2) continue;
      const cx = reg.reduce((s, q) => s + q[0], 0) / reg.length, cz = reg.reduce((s, q) => s + q[1], 0) / reg.length;
      const [lx, lz] = reg.reduce((b, q) => Math.hypot(q[0] - cx, q[1] - cz) < Math.hypot(b[0] - cx, b[1] - cz) ? q : b);
      cota(ctx, lx * C - j.cam + C / 2, BASE - lz * C - C / 2, h - 1);
    }
    // muros a la altura de Itzel: poché con achurado de corte
    ctx.fillStyle = PLA.poche; celdas(ctx, j, muro, u0, u1, 0, D - 1); ctx.fill();
    ctx.save(); celdas(ctx, j, muro, u0, u1, 0, D - 1); ctx.clip(); achurado(ctx, j, 2.6, rgba(PLA.achure, .55), .5); ctx.restore();
    lapiz(ctx, j, bordes(muro, u0, u1, 0, D - 1), TINTA, .95);
    // lo que queda arriba de su cabeza: punteado
    lapiz(ctx, j, bordes(arriba, u0, u1, 0, D - 1), rgba(TINTA, .6), .55, [2.5, 2]);
    // el parapeto de la batería, con una tronera para cada cañón
    const cs = n.canones; if (!cs.length) return;
    const xa = cs[0].x - 2, xb = cs[cs.length - 1].x + 3, Y0 = BASE - (D + .95) * C, Y1 = BASE - (D + .2) * C;
    ctx.save(); ctx.beginPath(); ctx.rect(xa * C - j.cam, Y0, (xb - xa) * C, Y1 - Y0); for (const c of cs) ctx.rect((c.x + .5) * C - j.cam + 4, Y1 + .1, -8, Y0 - Y1 - .2);
    ctx.fillStyle = PLA.poche; ctx.fill('evenodd'); ctx.clip('evenodd'); achurado(ctx, j, 2.6, rgba(PLA.achure, .55), .5); ctx.restore();
    ctx.strokeStyle = TINTA; ctx.lineWidth = .8; ctx.strokeRect(xa * C - j.cam, Y0, (xb - xa) * C, Y1 - Y0);
  }
  function cota(ctx, x, y, v) {
    ctx.strokeStyle = rgba(PLA.achure, .85); ctx.fillStyle = 'rgba(255,250,246,.85)'; ctx.lineWidth = .5;
    ctx.beginPath(); ctx.moveTo(x - 2.4, y - 2.6); ctx.lineTo(x + 2.4, y - 2.6); ctx.lineTo(x, y + .6); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.font = 'italic 6px Alegreya, serif'; ctx.fillStyle = PLA.achure; ctx.textAlign = 'left'; ctx.fillText(v ? '+' + v : '±0', x + 3.4, y + .4);
  }

  // GIRANDO: el nivel en 3D; las caras de frente son amarillas (π2) y las de arriba rojas (π1)
  function pinta3d(ctx, j, u0, u1, ents) {
    const n = j.n, co = Math.cos(j.ang), si = Math.sin(j.ang), zi = carril(j), it = [];
    for (let x = u0; x <= u1; x++) for (let y = 0; y < HM; y++) for (let z = 0; z < D; z++) { const m = celda(n, x, y, z); if (m) it.push({ d: z * co - y * si, x, y, z, m }); }
    for (const e of ents) it.push(e);
    it.sort((a, b) => b.d - a.d);
    const raya = (x0, y0, x1, y1) => { ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); };
    for (const q of it) {
      if (q.f) { q.f(); continue; }
      const X = q.x * C - j.cam, mad = q.m === MADERA, x = q.x, y = q.y, z = q.z;
      // lo lejano se aclara, como una aguada que se diluye; el carril de Itzel queda más firme
      const lejos = clamp(Math.abs(z - zi) * .07, 0, .4);
      const arriba = !celda(n, x, y + 1, z) && si > .02, frente = !celda(n, x, y, z - 1) && co > .02;
      const Yt = BASE - ((y + 1) * co + (z + 1) * si) * C, Yf = BASE - ((y + 1) * co + z * si) * C;
      if (arriba) { ctx.fillStyle = mix(mad ? PLA.madera : '#f8cabd', '#ffffff', lejos); ctx.fillRect(X - .15, Yt - .15, C + .3, si * C + .3); ctx.strokeStyle = rgba(PLA.achure, .14); ctx.lineWidth = .4; ctx.strokeRect(X, Yt, C, si * C); }
      if (frente) { ctx.fillStyle = mix(mix(mad ? ALZ.madera : y === 0 ? ALZ.suelo : '#f3d66a', '#a8873a', .12 + si * .1), '#ffffff', lejos); ctx.fillRect(X - .15, Yf - .15, C + .3, co * C + .3); ctx.strokeStyle = rgba(ALZ.junta, .2); ctx.lineWidth = .4; ctx.strokeRect(X, Yf, C, co * C); }
      // contorno: solo las orillas de la figura, no cada celda
      ctx.strokeStyle = rgba(TINTA, .8 - lejos); ctx.lineWidth = .7; ctx.beginPath();
      if (arriba) {
        if (!celda(n, x, y, z + 1) || celda(n, x, y + 1, z + 1)) raya(X, Yt, X + C, Yt);
        if (!celda(n, x - 1, y, z) || celda(n, x - 1, y + 1, z)) raya(X, Yt, X, Yt + si * C);
        if (!celda(n, x + 1, y, z) || celda(n, x + 1, y + 1, z)) raya(X + C, Yt, X + C, Yt + si * C);
      }
      if (frente) {
        if (arriba || celda(n, x, y + 1, z - 1)) raya(X, Yf, X + C, Yf);
        if (!celda(n, x, y - 1, z) || celda(n, x, y - 1, z - 1)) raya(X, Yf + co * C, X + C, Yf + co * C);
        if (!celda(n, x - 1, y, z) || celda(n, x - 1, y, z - 1)) raya(X, Yf, X, Yf + co * C);
        if (!celda(n, x + 1, y, z) || celda(n, x + 1, y, z - 1)) raya(X + C, Yf, X + C, Yf + co * C);
      }
      ctx.stroke();
    }
  }

  // ---------------- personajes y cosas ----------------
  // Jabalí visto desde arriba o de lado; rojo cuando prepara la embestida.
  function embestidor(ctx, X, Y, q, t, deArriba) {
    ctx.save(); ctx.translate(X, Y); if (!deArriba) ctx.scale(q.dir || 1, 1);
    ctx.lineWidth = .8; ctx.strokeStyle = TINTA; ctx.fillStyle = q.fase === 'aviso' ? '#c9654d' : '#8b624d';
    if (q.fase === 'caida') ctx.globalAlpha = Math.max(0, 1 - q.caida);
    const pata = q.fase === 'embiste' ? Math.sin(t * 24) * 2 : Math.sin(t * 5) * .6;
    for (const lado of [-1,1]) { ctx.beginPath(); ctx.moveTo(lado*4,-3); ctx.lineTo(lado*7,2+pata*lado); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(0,-5,7,4.5,0,0,TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#b98a6a'; ctx.beginPath(); ctx.ellipse(deArriba ? 0 : 6, deArriba ? -10 : -5, 3.4, 2.6,0,0,TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#fff3d5'; for (const lado of [-1,1]) { ctx.beginPath(); ctx.arc(deArriba ? lado*2.3 : 7, deArriba ? -10 : -6+lado*1.5, .75,0,TAU); ctx.fill(); }
    if (q.fase === 'aviso') { ctx.fillStyle='#b42035'; ctx.font='bold 9px Alegreya Sans'; ctx.textAlign='center'; ctx.fillText('!',0,-15); }
    if (q.duerme) { ctx.fillStyle=TINTA; ctx.font='italic 6px Alegreya'; ctx.fillText('z',8,-12); }
    ctx.restore();
  }
  function bala(ctx, X, Y, z, fantasma) {
    const r = .36 * C;
    if (fantasma) { ctx.strokeStyle = rgba(TINTA, fantasma); ctx.lineWidth = .6; ctx.setLineDash([2, 1.6]); ctx.beginPath(); ctx.arc(X, Y - r, r, 0, TAU); ctx.stroke(); ctx.setLineDash([]); return; }
    ctx.fillStyle = 'rgba(52,50,58,.18)'; ctx.beginPath(); ctx.ellipse(X, Y, r, r * .3, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#3d3b44'; ctx.beginPath(); ctx.arc(X, Y - r, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = .7; ctx.beginPath(); ctx.arc(X - r * .3, Y - r * 1.3, r * .4, Math.PI, Math.PI * 1.6); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); const a = -z / .36; ctx.moveTo(X + Math.cos(a) * r * .8, Y - r + Math.sin(a) * r * .8); ctx.lineTo(X - Math.cos(a) * r * .8, Y - r - Math.sin(a) * r * .8); ctx.stroke();
  }
  // el cañón sobre el parapeto del fondo, apuntando al frente
  function canon(ctx, X, Y, deArriba, humo) {
    ctx.save(); ctx.translate(X, Y); ctx.strokeStyle = TINTA; ctx.lineWidth = .6;
    if (deArriba) {
      ctx.fillStyle = '#9b6a3a'; ctx.fillRect(-5, -4, 10, 7); ctx.strokeRect(-5, -4, 10, 7);
      ctx.fillStyle = '#4a4850'; ctx.beginPath(); ctx.moveTo(-2.6, -6); ctx.lineTo(2.6, -6); ctx.lineTo(2, 8); ctx.lineTo(-2, 8); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else {
      ctx.fillStyle = '#4a4850'; ctx.beginPath(); ctx.arc(0, -6, 3.6, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#9b6a3a'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 4.6, -2.6, 2.6, 0, TAU); ctx.fill(); ctx.stroke(); }
    }
    if (humo > 0) { ctx.fillStyle = `rgba(120,115,120,${humo * .5})`; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc((k - 1.5) * 3, deArriba ? 9 + (1 - humo) * 6 : -9 - (1 - humo) * 6 - k, 2.4 + (1 - humo) * 3, 0, TAU); ctx.fill(); } }
    ctx.restore();
  }

  function pintar(j, view) {
    const st = view.st, S = view.S, ctx = view.ctx, t = j.t, n = j.n, p = j.p;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // en ventanas altas el nivel ocupa toda la vista, como los demás: lo de más se agrega arriba
    j.dy = typeof VISTA !== 'undefined' && view.ctx === (typeof canvas !== 'undefined' && canvas.getContext('2d')) ? Math.max(0, VISTA.H - VH) : 0;
    ctx.setTransform(S, 0, 0, S, 0, j.dy * S); ctx.imageSmoothingEnabled = true;
    const f = { t, cam: 0, S, g: j, st, key: st.id + '@' + S.toFixed(3) }, a = j.ang / (Math.PI / 2);
    papel(ctx, j, a);
    if (typeof PLANOS_DETALLES !== 'undefined') PLANOS_DETALLES.pinta(ctx);
    const u0 = Math.max(0, Math.floor(j.cam / C) - 1), u1 = Math.min(n.W - 1, Math.ceil((j.cam + VW) / C) + 1);
    const alz = !j.giro && j.plano === 'alzado', pla = !j.giro && j.plano === 'planta', zi = carril(j);
    const k0 = Math.floor(p.y + .02), k1 = Math.floor(p.y + ALTO - .02);
    // qué tan "presente" está algo: en alzado, si está en el carril; en planta, si está a la altura de Itzel
    const presente = (y, z, alto = .6) => alz ? Math.floor(z) === zi : pla ? y < k1 + 1 && y + alto > k0 : true;
    const ents = [];
    const pon = (x, y, z, fn) => ents.push({ d: z * Math.cos(j.ang) - y * Math.sin(j.ang), f: fn, x, y, z });
    // cañones del fondo
    for (const c of n.canones) { const u = (j.tm + c.fase) % c.per; pon(c.x + .5, 1.6, D + .6, () => { const [X, Y] = proy(j, c.x + .5, 1.2, D + .6); ctx.save(); if (alz) ctx.globalAlpha = .35; canon(ctx, X, pla ? Y : Y + 2, pla, u < .35 ? 1 - u / .35 : 0); ctx.restore(); }); }
    for (const c of n.monedas) if (!c.got) pon(c.x, c.y, c.z, () => { const [X, Y] = proy(j, c.x, c.y, c.z); ctx.save(); monedaItzel(ctx, X, Y, t, f); ctx.restore(); });
    for (const q of n.embestidores) if (!q.fuera) pon(q.x, q.y, q.z, () => { const [X, Y] = proy(j, q.x, q.y, q.z); ctx.save(); if (!presente(q.y, q.z)) ctx.globalAlpha = .3; embestidor(ctx, X, Y, q, j.tm, pla || (j.giro && j.ang > .8)); ctx.restore(); });
    for (const b of balas(j)) pon(b.x, b.y, b.z, () => { const [X, Y] = proy(j, b.x, b.y, b.z); if (alz && Math.floor(b.z) !== zi) { const cerca = b.z - (zi + .5); if (cerca > 0) bala(ctx, X, Y, b.z, clamp(.7 - (cerca - .5) * .18, .12, .7)); return; } bala(ctx, X, Y, b.z, 0); });
    pon(n.meta + 1, 1, 3.5, () => { const [X, Y] = proy(j, n.meta + 1, 1, 3.5); st.goal(ctx, X, Y, t, f); });
    pon(p.x, p.y, p.z, () => itzel(ctx, j, f));
    if (j.giro) pinta3d(ctx, j, u0, u1, ents);
    else {
      if (alz) { pintaAlzado(ctx, j, u0, u1); lineaCorte(ctx, BASE - (k0 + .65) * C, 'B', -1); }
      else { pintaPlanta(ctx, j, u0, u1); lineaCorte(ctx, BASE - (zi + .5) * C, 'A', 1); }
      ents.sort((q, r) => r.d - q.d); for (const e of ents) e.f();
    }
    // notas del ingeniero y la línea de tierra
    ctx.font = 'italic 7px Alegreya, serif'; ctx.textAlign = 'center';
    for (const nt of n.notas) { const [X, Y] = proy(j, nt.x, nt.ya, D + 1.3); if (X < -60 || X > VW + 60) continue; ctx.fillStyle = rgba(TINTA, .8); ctx.fillText(nt.txt, X, Y); ctx.strokeStyle = rgba(TINTA, .4); ctx.lineWidth = .4; ctx.beginPath(); const w = ctx.measureText(nt.txt).width / 2; ctx.moveTo(X - w, Y + 1.8); ctx.quadraticCurveTo(X, Y + 2.6, X + w, Y + 1.6); ctx.stroke(); }
    ctx.textAlign = 'left';
    ctx.strokeStyle = TINTA; ctx.lineWidth = 1; ctx.setLineDash([5, 3]); ctx.lineDashOffset = j.cam % 8; ctx.beginPath(); ctx.moveTo(8, BASE); ctx.lineTo(VW - 8, BASE); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
    ctx.font = 'italic 6px Alegreya, serif'; ctx.fillStyle = TINTA; ctx.fillText('L.T.', 10, BASE - 2.5);
    // Fresita encima de todo
    if (st.fresita) st.fresita(ctx, { x: j.fre.x, y: j.fre.y, face: j.fre.x < proy(j, p.x, p.y, p.z)[0] ? 1 : -1 }, f);
    pintaChispas(ctx, j);
    icono(ctx, j, 24 + (j.dy > 0 && typeof VISTA !== 'undefined' ? VISTA.rec || 0 : 0), 40 - j.dy, a);
    if (j.aviso) { const al = Math.min(1, j.aviso.t * 4, (5 - j.aviso.t) * 2); nota(ctx, j.aviso.txt, VW / 2, 70, al); }

  }
  function itzel(ctx, j, f) {
    const p = j.p, [X, Y] = proy(j, p.x, p.y, p.z), pla = j.ang > .8;
    if (j.inv > 0 && Math.floor(j.inv * 14) % 2) return;
    // la sombra en el piso de abajo (en planta dice qué tan alto va)
    const h = apoyo(j.n, p.x, p.z, p.y + .01), [, Ys] = proy(j, p.x, Math.max(h, -1), p.z), alto = p.y - h;
    ctx.fillStyle = 'rgba(52,50,58,.22)'; ctx.beginPath(); ctx.ellipse(X, pla ? Y : Ys, 5 / (1 + alto * .25), 1.8 / (1 + alto * .25), 0, 0, TAU); ctx.fill();
    const mueve = Math.abs(p.vx) + Math.abs(p.vz) > .6;
    Object.assign(j.pose, { x: X, y: pla ? Y - Math.min(alto, 3) * 3 : Y, face: p.face, on: p.on, vx: mueve ? 120 : 0, vy: -p.vy * C, run: p.run, vis: true, sq: 0 });
    j.st.player(ctx, j.pose, f);
    // como en el dibujo técnico: la proyección de Itzel en este plano
    ctx.font = 'italic 5.5px Alegreya, serif'; ctx.fillStyle = rgba(TINTA, .7); ctx.fillText(pla ? "i'" : "i''", X + 6, (pla ? Y - Math.min(alto, 3) * 3 : Y) - 20);
  }
  // nota a mano en una tira de papel
  function nota(ctx, txt, x, y, al) {
    ctx.save(); ctx.globalAlpha = al; ctx.font = 'italic 7.2px Alegreya, serif';
    const w = Math.min(VW - 150, ctx.measureText(txt).width + 14);
    ctx.translate(x, y); ctx.rotate(-.012);
    ctx.fillStyle = 'rgba(255,253,244,.94)'; ctx.fillRect(-w / 2, -9, w, 13); ctx.strokeStyle = rgba(TINTA, .5); ctx.lineWidth = .5; ctx.strokeRect(-w / 2, -9, w, 13);
    ctx.fillStyle = 'rgba(232,140,150,.45)'; ctx.fillRect(-w / 2 - 4, -11, 12, 5); ctx.fillRect(w / 2 - 8, -11, 12, 5);
    ctx.fillStyle = TINTA; ctx.textAlign = 'center'; ctx.fillText(txt, 0, -.4, w - 8); ctx.textAlign = 'left'; ctx.restore();
  }
  // el sello del plano activo: una placa que se para (alzado, amarilla) o se acuesta (planta, roja) al girar
  function icono(ctx, j, x, y, a) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = 'rgba(255,253,244,.92)'; ctx.beginPath(); ctx.arc(0, 0, 12, 0, TAU); ctx.fill();
    ctx.strokeStyle = rgba(TINTA, .8); ctx.lineWidth = .8; ctx.stroke(); ctx.lineWidth = .4; ctx.beginPath(); ctx.arc(0, 0, 10.4, 0, TAU); ctx.stroke();
    // la placa gira sobre la línea de tierra: de pie se ve alta, acostada se ve en escorzo
    const co = Math.cos(j.ang), si = Math.sin(j.ang), col = mix('#f6d64a', '#e8604c', a), hy = 6 * co + 3.2 * si, sk = 3.2 * si;
    ctx.fillStyle = rgba(col, .75); ctx.strokeStyle = mix(col, TINTA, .45); ctx.lineWidth = .7;
    ctx.beginPath(); ctx.moveTo(-6, 3); ctx.lineTo(4, 3); ctx.lineTo(4 + sk, 3 - hy); ctx.lineTo(-6 + sk, 3 - hy); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = TINTA; ctx.lineWidth = .7; ctx.setLineDash([1.6, 1.1]); ctx.beginPath(); ctx.moveTo(-8, 3); ctx.lineTo(8, 3); ctx.stroke(); ctx.setLineDash([]);
    if (j.giro) { ctx.strokeStyle = rgba(TINTA, .6); ctx.beginPath(); ctx.arc(0, 0, 8.4, -Math.PI / 2, -Math.PI / 2 + (j.giro.t / GIRO) * Math.PI * 1.5); ctx.stroke(); }
    ctx.restore();
  }
  // el dibujo de los dos planos (como en el libro de geometría): el activo se marca más fuerte
  function diagrama(ctx, j, ox, oy, a) {
    const s = .078, P = pts => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(ox + x * s, oy + y * s) : ctx.moveTo(ox + x * s, oy + y * s)); ctx.closePath(); };
    const fuerte1 = a, fuerte2 = 1 - a;
    ctx.fillStyle = 'rgba(255,253,244,.9)'; ctx.fillRect(ox - 5, oy - 4, 738 * s + 10, 712 * s + 8); ctx.strokeStyle = rgba(TINTA, .35); ctx.lineWidth = .4; ctx.strokeRect(ox - 5, oy - 4, 738 * s + 10, 712 * s + 8);
    const pl1 = (pts) => { P(pts); ctx.fillStyle = rgba('#f7b9ad', .35 + fuerte1 * .5); ctx.fill(); ctx.strokeStyle = rgba(PLA.borde, .45 + fuerte1 * .55); ctx.lineWidth = .5 + fuerte1 * .6; ctx.stroke(); };
    const pl2 = (pts) => { P(pts); ctx.fillStyle = rgba('#fff2a0', .35 + fuerte2 * .55); ctx.fill(); ctx.strokeStyle = rgba(ALZ.borde, .45 + fuerte2 * .55); ctx.lineWidth = .5 + fuerte2 * .6; ctx.stroke(); };
    pl1([[5, 353], [218, 193], [440, 265], [230, 425]]);
    pl2([[230, 140], [440, 3], [440, 265], [230, 425]]);
    pl2([[230, 425], [440, 265], [440, 570], [230, 707]]);
    pl1([[230, 425], [440, 265], [726, 353], [513, 515]]);
    ctx.strokeStyle = TINTA; ctx.lineWidth = .8; ctx.setLineDash([2, 1.4]); ctx.beginPath(); ctx.moveTo(ox + 230 * s, oy + 425 * s); ctx.lineTo(ox + 440 * s, oy + 265 * s); ctx.stroke(); ctx.setLineDash([]);
    const pi = (x, y, sub, col, on) => { ctx.font = `italic ${on ? 'bold ' : ''}8px Alegreya, serif`; ctx.fillStyle = col; ctx.fillText('π', ox + x * s, oy + y * s); ctx.font = `${on ? 'bold ' : ''}5px Alegreya, serif`; ctx.fillText(sub, ox + x * s + 4.4, oy + y * s + 2); };
    pi(385, 75, '2', mix(ALZ.borde, TINTA, .25), fuerte2 > .5); pi(640, 380, '1', mix(PLA.borde, TINTA, .2), fuerte1 > .5);
    // la flecha del giro sobre la línea de tierra
    if (j.giro) { const u = j.giro.t / GIRO; ctx.strokeStyle = TINTA; ctx.lineWidth = .7; ctx.beginPath(); ctx.arc(ox + 335 * s, oy + 345 * s, 9, -Math.PI / 2, -Math.PI / 2 + u * Math.PI * 1.5); ctx.stroke(); }
  }
  // el cajetín de la lámina
  function cajetin(ctx, j, a) {
    const w = 124, h = 36, x = VW - w - 10, y = 10;
    ctx.fillStyle = 'rgba(255,253,244,.92)'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = TINTA; ctx.lineWidth = .8; ctx.strokeRect(x, y, w, h); ctx.lineWidth = .4;
    ctx.beginPath(); ctx.moveTo(x, y + 21); ctx.lineTo(x + w, y + 21); ctx.moveTo(x + 66, y + 21); ctx.lineTo(x + 66, y + h); ctx.stroke();
    const nombre = j.giro ? 'girando…' : j.plano === 'alzado' ? 'ALZADO' : 'PLANTA', col = a < .5 ? mix(ALZ.borde, TINTA, .35) : mix(PLA.borde, TINTA, .2);
    ctx.font = 'bold 11px Alegreya, serif'; ctx.fillStyle = col; ctx.fillText(nombre, x + 6, y + 13);
    ctx.font = 'italic 6px Alegreya, serif'; ctx.fillStyle = TINTA; ctx.fillText(j.giro ? '' : j.plano === 'alzado' ? 'plano vertical, π2' : 'plano horizontal, π1', x + 6, y + 19);
    ctx.fillText('Muralla de Campeche', x + 4, y + 28); ctx.fillText('Esc. 1:200', x + 4, y + 34);
    ctx.fillText('Lámina 1 de 1', x + 70, y + 28); ctx.fillText(`Giros: ${j.giros}`, x + 70, y + 34);
  }
  return { crear, paso, pintar, proy, alto: true };
})();
MEC.POW.planos = { name: 'Giro de la lámina', help: 'Clic: la lámina gira 90° sobre la línea de tierra, entre alzado (de lado, con salto) y planta (desde arriba, a lo hondo).', cd: .45, click() { return false; } };
nivel('planos', {
  nombre: 'Planta y alzado de la muralla', lugar: 'La muralla, de la Puerta de Mar a la Puerta de Tierra',
  lema: 'Itzel cruza la lámina del ingeniero que trazó la muralla y Fresita la gira entre planta y alzado: los muros altos se rodean desde arriba y los fosos se saltan de lado.',
  dato: 'La muralla de Campeche se levantó entre 1686 y 1704 contra los piratas, con el trazo del ingeniero francés Luis Bouchard de Becour. Tenía ocho baluartes y cuatro puertas; los ingenieros militares dibujaban cada fuerte en planta y en alzado.',
  modo: 'planos', foe: 'jabali', fauna: ['jabali'], power: 'planos', plat: NIVELES.cuaderno.plat, W: 30, skin: NIVELES.cuaderno.skin,
});
(NIVELES_ALT.cuaderno = NIVELES_ALT.cuaderno || []).push('planos');

